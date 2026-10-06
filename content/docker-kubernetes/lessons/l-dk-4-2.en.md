---
summary: Write a Deployment manifest for notes-api, understand how it owns ReplicaSets and Pods through labels and selectors, and apply, inspect and scale it from files.
takeaways:
  - A Pod is one or more containers that share a network identity and storage; it's the smallest thing Kubernetes schedules, and it's disposable.
  - You almost never create bare Pods; a Deployment manages a ReplicaSet, which keeps the right number of Pods running.
  - A Deployment's `spec.selector.matchLabels` must match the labels in `spec.template.metadata.labels`, and the selector can't be changed after creation.
  - Keep manifests in Git and change them with `kubectl apply -f`, so the files stay the source of truth.
  - Use current API versions such as `apps/v1`; manifests copied from old posts with `extensions/v1beta1` no longer work.
further:
  - title: Pods
    url: https://kubernetes.io/docs/concepts/workloads/pods/
  - title: Deployments
    url: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
  - title: Labels and Selectors
    url: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
  - title: Recommended Labels
    url: https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
quiz:
  - q: Why run notes-api through a Deployment instead of creating three Pods directly?
    options:
      - text: Pods can't be created from YAML files.
        why: They can. A bare Pod manifest is valid; it's just not managed by anything.
      - text: Pods created directly can't use container images from a registry.
        why: Image pulling works the same for any Pod. Management is the difference.
      - text: Deployments run containers faster than bare Pods.
        why: Startup speed is identical. The containers run the same way.
      - text: A bare Pod isn't replaced if it or its node dies, and it can't be rolled out to a new version gradually; a Deployment handles both.
        why: Correct. The Deployment, through its ReplicaSet, keeps the count right and manages updates.
    answer: 3
  - q: "`kubectl apply` rejects a Deployment with: `selector does not match template labels`. What's wrong?"
    options:
      - text: The container name doesn't match the Deployment name.
        why: Container names are independent of the Deployment name and of labels.
      - text: "`spec.selector.matchLabels` asks for labels that `spec.template.metadata.labels` doesn't set."
        why: Correct. The Deployment must be able to find the Pods its own template creates, so the API server validates that they match.
      - text: The Deployment is in a different namespace from its Pods.
        why: A Deployment's Pods are always created in its own namespace.
      - text: The image tag isn't a valid label value.
        why: The image isn't a label at all; it doesn't take part in selection.
    answer: 1
  - q: You run `kubectl get pods` and see `notes-api-6c8f9d7b5-x2k4q`. What is `6c8f9d7b5`?
    options:
      - text: The Git commit of the running image.
        why: Kubernetes knows nothing about Git. The value comes from the Pod template.
      - text: The node the Pod runs on.
        why: Node names aren't in Pod names. Use `kubectl get pods -o wide` to see nodes.
      - text: A hash of the Pod template, identifying the ReplicaSet that created this Pod.
        why: Correct. Each template version gets its own ReplicaSet, and its Pods carry its `pod-template-hash`. You'll see why this matters for rollbacks.
      - text: A random suffix with no meaning.
        why: Only the last part (`x2k4q`) is random. The middle part is deliberate.
    answer: 2
  - q: Someone ran `kubectl scale deployment/notes-api --replicas=6` during an incident. What happens at the next `kubectl apply -f k8s/` with `replicas` set to 3 in the file?
    options:
      - text: The Deployment goes back to 3 replicas, because the file sets 3.
        why: Correct. Apply makes the cluster match the file. Update the file when a change should stick, or the next deploy undoes it.
      - text: It stays at 6, because imperative changes always win.
        why: Imperative changes are just API updates; the next apply overwrites the fields the file manages.
      - text: Apply fails with a conflict until someone resolves it.
        why: Client-side apply simply sets the field. You get no warning, which is the danger.
      - text: Kubernetes averages the two and runs 4 or 5.
        why: There's no averaging; each field has one value at a time.
    answer: 0
---

The imperative `kubectl create deployment` from the last lesson was fine for a demo, and useless for a team. Nobody can review it, nobody knows what flags were used, and next week nobody can reproduce it. From here on, notes-api's Kubernetes setup lives in YAML files under `k8s/`, next to the Dockerfile, reviewed like code.

## Pods: the unit Kubernetes runs

A **Pod** is one or more containers that are scheduled together onto one node and share a network namespace (one IP, one `localhost`) and any volumes you declare. Most Pods have one main container. A second container is for something tightly coupled to the first, like a log shipper or a proxy that must live and die with it.

A minimal Pod manifest looks like this:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: notes-api-test
spec:
  containers:
    - name: api
      image: ghcr.io/skylane/notes-api:1.4.0
      ports:
        - containerPort: 3000
```

You won't create Pods like this in practice. A bare Pod isn't replaced if it crashes on a dead node, can't be scaled, and can't be updated to a new image gradually. Pods are cattle: every one is disposable, gets a new name and IP when replaced, and is managed by something above it.

## Deployments, ReplicaSets, Pods

A **Deployment** is that something. It owns a **ReplicaSet**, whose only job is to keep N identical Pods running. The Deployment's job is to manage ReplicaSets over time: when you change the Pod template, it creates a new ReplicaSet and shifts Pods over, which is the rolling update you'll study in section 5.

```yaml title=k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notes-api
  labels:
    app.kubernetes.io/name: notes-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app.kubernetes.io/name: notes-api
  template:
    metadata:
      labels:
        app.kubernetes.io/name: notes-api
    spec:
      containers:
        - name: api
          image: ghcr.io/skylane/notes-api:1.4.0
          ports:
            - name: http
              containerPort: 3000
          env:
            - name: PORT
              value: "3000"
```

Read it in two halves. The top half is the Deployment itself: its name, how many replicas, and which Pods it owns (`selector`). Everything under `template` is a Pod spec, the blueprint each replica is stamped from. Note that `apiVersion` differs by kind: Pods are core `v1`, Deployments are `apps/v1`.

:::figure A Deployment owns ReplicaSets; a ReplicaSet owns Pods; labels tie them together
<svg viewBox="0 0 700 260" role="img" aria-labelledby="t1">
  <title id="t1">The notes-api Deployment owns a ReplicaSet named with a template hash. The ReplicaSet owns three Pods, each labelled app.kubernetes.io/name=notes-api, which the selector matches.</title>
  <rect class="d-box-primary" x="240" y="16" width="220" height="56" rx="10"/>
  <text class="d-label-strong" x="350" y="40" text-anchor="middle">Deployment</text>
  <text class="d-code" x="350" y="60" text-anchor="middle">notes-api</text>
  <path class="d-arrow" d="M350 72 L350 98" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="220" y="100" width="260" height="56" rx="10"/>
  <text class="d-label-strong" x="350" y="124" text-anchor="middle">ReplicaSet</text>
  <text class="d-code" x="350" y="144" text-anchor="middle">notes-api-6c8f9d7b5</text>
  <path class="d-arrow" d="M300 156 L140 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M350 156 L350 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 156 L560 188" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="40" y="190" width="200" height="50" rx="10"/>
  <text class="d-code" x="140" y="220" text-anchor="middle">pod …-x2k4q</text>
  <rect class="d-box-success" x="250" y="190" width="200" height="50" rx="10"/>
  <text class="d-code" x="350" y="220" text-anchor="middle">pod …-p8mzr</text>
  <rect class="d-box-success" x="460" y="190" width="200" height="50" rx="10"/>
  <text class="d-code" x="560" y="220" text-anchor="middle">pod …-c4tq9</text>
  <text class="d-label-muted" x="350" y="256" text-anchor="middle">each Pod: app.kubernetes.io/name=notes-api</text>
</svg>
:::

## Labels and selectors

Kubernetes objects don't point at each other by name. They find each other by **labels**, key-value pairs in `metadata.labels`, and **selectors**, queries over those labels. The ReplicaSet counts its Pods by running its selector; next lesson, a Service will find Pods to send traffic to the same way.

That's why the Deployment's `selector.matchLabels` must match `template.metadata.labels`: the Deployment must be able to find the Pods its own template creates. The API server checks this and rejects a mismatch. The selector is also **immutable** once the Deployment exists, so choose it carefully. The `app.kubernetes.io/name` key is one of Kubernetes' recommended labels; tools and dashboards understand it, and using it consistently pays off.

:::mistake Copying an old manifest
Search results still surface manifests with `apiVersion: extensions/v1beta1` or `apps/v1beta2` for Deployments. Those versions were removed years ago, and `kubectl apply` fails with `no matches for kind "Deployment" in version …`. Use `apps/v1`, and check any field you're unsure of with `kubectl explain deployment.spec`.
:::

## Apply, inspect, scale

```bash
kind load docker-image ghcr.io/skylane/notes-api:1.4.0 --name notes
kubectl apply -f k8s/deployment.yaml
kubectl get deploy,rs,pods -l app.kubernetes.io/name=notes-api
kubectl describe deployment notes-api
```

`kind load` copies the image into the cluster under its full name, so the manifest can use the same reference production will. `-l` filters by label, the same mechanism the controllers use. Look at the Pod names: `notes-api-6c8f9d7b5-x2k4q` is the Deployment name, then the ReplicaSet's `pod-template-hash`, then a random suffix. Change anything in the template and you'll get a new ReplicaSet with a new hash.

To scale, change `replicas: 3` to `5` in the file and apply again. `kubectl apply` compares your file with what's stored and sends only the difference. `kubectl diff -f k8s/` shows that difference before you commit to it, and you should make a habit of running it.

`kubectl scale deployment/notes-api --replicas=5` also works, and has its place in an emergency. But the file still says 3, so the next routine `apply` quietly scales you back down. Whatever you change by hand, change in Git straight after.

:::tip Debug the Pod, not the Deployment
When something's wrong, the Deployment only tells you counts. `kubectl describe pod <name>` shows the events for that Pod: scheduling decisions, image pulls, container restarts and their reasons. It's the first command to reach for, and section 5 builds a whole playbook around it.
:::

Your Pods are running, but each has its own IP that changes every time it's replaced. Nothing can reliably reach them yet. That's what Services are for.
