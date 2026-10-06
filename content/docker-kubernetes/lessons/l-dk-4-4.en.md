---
summary: Move notes-api's settings into a ConfigMap and its credentials into a Secret, put everything in a `notes` namespace, and run a reviewable apply-and-diff workflow from the k8s folder.
takeaways:
  - ConfigMaps hold non-sensitive settings; Secrets hold credentials and are injected as environment variables or mounted files.
  - Secret values are only base64-encoded, not encrypted; protect them with RBAC, encryption at rest, and by keeping them out of Git.
  - Environment variables from a ConfigMap or Secret are read once at container start, so restart the Deployment after changing them.
  - Namespaces scope names, permissions and quotas for a team or app, but they don't isolate network traffic on their own.
  - "`kubectl diff -f k8s/` before `kubectl apply -f k8s/` shows exactly what will change, like a pull request for the cluster."
further:
  - title: ConfigMaps
    url: https://kubernetes.io/docs/concepts/configuration/configmap/
  - title: Secrets
    url: https://kubernetes.io/docs/concepts/configuration/secret/
  - title: Good practices for Kubernetes Secrets
    url: https://kubernetes.io/docs/concepts/security/secrets-good-practices/
  - title: Namespaces
    url: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
quiz:
  - q: A teammate commits a Secret manifest whose `data` values are base64 strings, saying "it's fine, they're encoded". What's the problem?
    options:
      - text: Base64 values must be in `stringData`, not `data`.
        why: It's the other way round; `data` takes base64 and `stringData` takes plain text. The format isn't the issue.
      - text: Base64 is an encoding anyone can reverse with `base64 -d`, so the credentials are now in Git history in effect as plain text.
        why: Correct. Treat the secret as leaked, rotate it, and keep Secret values out of Git (use a secret manager or encrypted tooling).
      - text: Kubernetes rejects Secrets that are committed to Git.
        why: Kubernetes can't see your Git history. It will happily accept the manifest.
      - text: Base64 makes values too long for environment variables.
        why: Kubernetes decodes values before injecting them; length isn't the issue.
    answer: 1
  - q: You change `LOG_LEVEL` in the `notes-api-config` ConfigMap and apply it. The Pods consume it through `envFrom`. What happens?
    options:
      - text: Every Pod picks up the new value within a minute.
        why: Mounted ConfigMap *files* refresh over time; environment variables never change in a running container.
      - text: The Deployment automatically rolls out new Pods.
        why: A ConfigMap change doesn't touch the Deployment's Pod template, so no rollout starts.
      - text: Nothing changes in running Pods until they restart; run `kubectl rollout restart deployment/notes-api`.
        why: Correct. Env vars are set at container start. A rollout restart replaces Pods gradually with the new values.
      - text: The Pods crash because their environment changed underneath them.
        why: Running processes keep their environment; nothing is pushed to them.
    answer: 2
  - q: A new Pod is stuck with status `CreateContainerConfigError`. What's the most likely cause?
    options:
      - text: The Pod references a Secret or ConfigMap key that doesn't exist.
        why: Correct. The kubelet can't build the container's environment, so it never starts. `kubectl describe pod` names the missing key.
      - text: The image can't be pulled from the registry.
        why: That shows as `ErrImagePull` or `ImagePullBackOff`.
      - text: The app crashed on startup.
        why: A crash after start shows as `CrashLoopBackOff`, with logs to read.
      - text: The node is out of memory.
        why: A Pod that can't be placed for lack of resources stays `Pending` with a scheduling event.
    answer: 0
  - q: notes-api and a payments service run in separate namespaces on the same cluster. Can a notes-api Pod open a connection to the payments database Service?
    options:
      - text: No, namespaces block all traffic between them.
        why: Namespaces scope names and permissions. Without a NetworkPolicy, Pods can reach Services in any namespace.
      - text: Only if both namespaces have the same labels.
        why: Namespace labels matter for NetworkPolicy selectors, but without a policy there is no restriction at all.
      - text: Only through a LoadBalancer Service.
        why: ClusterIP Services are reachable from every namespace in the cluster by default.
      - text: Yes, by default; use a NetworkPolicy (with a network plugin that enforces it) to restrict it.
        why: Correct. Namespaces aren't a network boundary. NetworkPolicies are how you add one.
    answer: 3
---

Right now the notes-api Deployment has `PORT` written into it, the database Deployment has its password in plain text, and everything lives in the `default` namespace alongside whatever else people try in this cluster. That's three ways to cause an incident: change a setting and you must edit the workload; read the repository and you have the password; run a careless `kubectl delete` in `default` and you hit someone else's work.

## A namespace for notes-api

A **namespace** is a scope for names. Two teams can both have a Deployment called `api` in different namespaces. Namespaces are also where you attach permissions (RBAC) and resource quotas, which makes them the natural unit for "one app" or "one team".

```yaml title=k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: notes
```

Add `namespace: notes` to the `metadata` of every other object in `k8s/`, then make it your default for this context so you don't type `-n notes` every time:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl config set-context --current --namespace=notes
```

What namespaces don't do is isolate the network. A Pod in `notes` can connect to a Service in any other namespace unless a **NetworkPolicy** says otherwise, and your cluster's network plugin enforces it. Don't treat a namespace as a security wall on its own.

## ConfigMaps for settings

A **ConfigMap** holds non-sensitive key-value configuration:

```yaml title=k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: notes-api-config
  namespace: notes
data:
  PORT: "3000"
  LOG_LEVEL: info
```

Values are always strings, which is why `"3000"` is quoted. Now the same notes-api image can run with `info` logging in production and `debug` in staging, by applying a different ConfigMap rather than building a different image.

## Secrets for credentials

A **Secret** has the same shape as a ConfigMap but is meant for sensitive values. Create it from the command line (or from your secret manager) rather than from a committed file:

```bash
kubectl create secret generic notes-db \
  --from-literal=POSTGRES_PASSWORD='dev-only-change-me' \
  --from-literal=DATABASE_URL='postgres://notes:dev-only-change-me@notes-db:5432/notes'
```

Here's the uncomfortable part. Look at what's stored:

```bash
kubectl get secret notes-db -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d
```

The value comes straight back. Secret data is **base64-encoded, not encrypted**. What makes Secrets safer than ConfigMaps is everything around them: RBAC can grant read access to ConfigMaps but not Secrets, the cluster can encrypt Secrets at rest in etcd (managed providers usually do), and kubelets only receive Secrets for Pods scheduled on their node.

:::mistake Secret manifests in Git
A Secret YAML with base64 values in a repository is a plain-text password with one extra step. I've rotated more credentials for this reason than any other. Keep real values out of Git: create Secrets from a secret manager through a tool such as External Secrets Operator, or commit only encrypted forms with a tool built for that, and treat anything already committed as leaked.
:::

## Wiring them into notes-api

Update the container in `k8s/deployment.yaml`:

```yaml title=k8s/deployment.yaml
      containers:
        - name: api
          image: ghcr.io/skylane/notes-api:1.4.0
          ports:
            - name: http
              containerPort: 3000
          envFrom:
            - configMapRef:
                name: notes-api-config
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: notes-db
                  key: DATABASE_URL
```

`envFrom` turns every key in the ConfigMap into an environment variable. `secretKeyRef` pulls one key from the Secret. In `k8s/db.yaml`, replace the literal `POSTGRES_PASSWORD` value with a `secretKeyRef` to the same Secret.

If a referenced key doesn't exist, the container never starts. The Pod shows `CreateContainerConfigError`, and `kubectl describe pod` names the missing key.

Secrets and ConfigMaps can also be **mounted as files** through a volume. Mounted files are updated in running Pods after a short delay; environment variables are fixed at container start. After changing env-based config, roll the Pods:

```bash
kubectl rollout restart deployment/notes-api
```

## The everyday workflow

Your `k8s/` folder now holds `namespace.yaml`, `configmap.yaml`, `db.yaml`, `deployment.yaml` and `service.yaml`. The loop for every change is the same:

```bash
kubectl diff -f k8s/
kubectl apply -f k8s/
kubectl get all -l app.kubernetes.io/name=notes-api
```

`diff` is your review step: it shows what will change on the live cluster, field by field, before you change it. Make it a habit and you'll catch the stray edit that would have reset someone's emergency fix. When you need different values per environment, Kustomize (built into kubectl as `kubectl apply -k`) layers small overlays on top of these base files; Helm, in lesson 5.3, is the other common answer.

:::tip Labels are your query language
Put `app.kubernetes.io/name` on everything, and `app.kubernetes.io/part-of: notes` if several components make up the app. Then `kubectl get all,cm,secret -l app.kubernetes.io/part-of=notes` shows the whole system in one command, and cleanup is one `kubectl delete -l` away.
:::

notes-api now runs on Kubernetes with proper networking and configuration. It's not production-ready yet: Kubernetes has no idea whether it's healthy, how much CPU it needs, or how to update it safely. Section 5 covers all three.
