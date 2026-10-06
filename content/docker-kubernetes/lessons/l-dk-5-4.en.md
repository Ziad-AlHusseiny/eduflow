---
summary: Route public HTTPS traffic to notes-api with Gateway API, harden its Pods with a securityContext, and diagnose broken Pods quickly with get, describe, logs, events and kubectl debug.
takeaways:
  - Gateway API splits external traffic into GatewayClass (the implementation), Gateway (the entry point and TLS) and HTTPRoute (an app's routing rules), so platform and app teams each own their part.
  - Ingress still works but is frozen, and the community ingress-nginx controller was retired in March 2026; new setups should use Gateway API.
  - Read Pod status first, then `kubectl describe` for events, then `kubectl logs --previous` for crashes; the status tells you which tool to reach for.
  - "`kubectl debug --target` attaches a temporary container with tools to a running Pod, which is how you inspect distroless images."
  - A production Pod runs as non-root with no privilege escalation, a read-only root filesystem and all capabilities dropped.
further:
  - title: Gateway API
    url: https://kubernetes.io/docs/concepts/services-networking/gateway/
  - title: Debug Running Pods
    url: https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/
  - title: Configure a Security Context for a Pod or Container
    url: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
  - title: Ingress NGINX Retirement
    url: https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/
quiz:
  - q: Your platform team runs a shared Gateway in the `infra` namespace. What do you, the notes-api team, create to expose `notes.skylane.example`?
    options:
      - text: A new GatewayClass for notes-api.
        why: GatewayClasses describe an implementation and are usually set up once per cluster by the platform team.
      - text: An HTTPRoute in the `notes` namespace that references the shared Gateway in `parentRefs` and the `notes-api` Service in `backendRefs`.
        why: Correct. Routes belong to app teams; the Gateway decides (via `allowedRoutes`) which namespaces may attach.
      - text: A second Gateway listening on port 443.
        why: That duplicates the platform's entry point and its TLS setup. Attach a route to the existing one.
      - text: A LoadBalancer Service for notes-api.
        why: That bypasses the shared entry point and gives you a separate public address to manage.
    answer: 1
  - q: A Pod shows `ImagePullBackOff`. Which is the most useful next step?
    options:
      - text: "`kubectl logs <pod>`"
        why: The container never started, so there are no logs to read.
      - text: "`kubectl rollout restart deployment/notes-api`"
        why: New Pods will fail to pull the same image the same way.
      - text: "`kubectl debug -it <pod> --image=busybox:1.37`"
        why: There's no running container to attach to, and the problem is the pull, not the Pod's runtime.
      - text: "`kubectl describe pod <pod>` and read the pull error in the events: wrong tag, missing registry credentials, or no image for this architecture."
        why: Correct. The events state exactly why the kubelet couldn't pull.
    answer: 3
  - q: notes-api is in `CrashLoopBackOff`. `kubectl logs <pod>` shows only a line or two of startup output. What should you run?
    options:
      - text: "`kubectl logs <pod> --previous`, to read the output of the container instance that crashed."
        why: Correct. The current instance may have only just started. `--previous` shows the last one's output, including the error that killed it.
      - text: "`kubectl delete pod <pod>`, so it starts fresh."
        why: The replacement runs the same image with the same config and crashes the same way, and you've lost the evidence.
      - text: "`kubectl scale deployment/notes-api --replicas=0`"
        why: That stops the crash loop by stopping the service, without telling you anything.
      - text: "`kubectl get nodes`"
        why: Node health rarely causes a crash loop in a single app; the app's own output is the place to start.
    answer: 0
  - q: notes-api's image is distroless, so `kubectl exec -it <pod> -- sh` fails. How do you check DNS resolution from inside the Pod?
    options:
      - text: Rebuild the image with a shell, deploy it, and try again.
        why: It changes the thing you're debugging and takes a full release cycle.
      - text: Use `kubectl port-forward` and run `nslookup` on your laptop.
        why: That resolves names with your laptop's DNS, not the Pod's.
      - text: "`kubectl debug -it <pod> --image=busybox:1.37 --target=api`, then run `nslookup notes-db` in the debug container."
        why: Correct. The ephemeral container shares the Pod's network namespace (and, with `--target`, its process view), bringing the tools the image lacks.
      - text: Read `/etc/resolv.conf` with `kubectl logs`.
        why: Logs show what the process printed, not files inside the container.
    answer: 2
---

Two things stand between notes-api and real users. It isn't reachable from the internet yet, and when something breaks at 3 a.m., you need to find out what within minutes. This lesson covers both, and finishes with the security settings that complete the production picture.

## Getting HTTP traffic in

A `LoadBalancer` Service per app works for one service. With ten, you're paying for ten load balancers, managing ten certificates, and routing by hostname or path is impossible. You want one shared entry point that routes HTTP requests to the right Service.

For years the answer was **Ingress**. It still works, but the Ingress API is frozen and gets no new features, and the widely used community ingress-nginx controller was retired in March 2026: no more releases or security fixes. The Kubernetes project points new work at **Gateway API**, which is generally available as `gateway.networking.k8s.io/v1`. It's installed as an add-on (its CRDs plus an implementation, such as your cloud's load balancer controller, Envoy Gateway, Cilium or Istio), and many managed clusters offer it out of the box.

Gateway API splits the job by role:

- **GatewayClass**: which implementation handles traffic. Set up once by whoever runs the cluster.
- **Gateway**: an entry point with listeners, ports, hostnames and TLS certificates. Owned by the platform team.
- **HTTPRoute**: one app's routing rules, attached to a Gateway. Owned by the app team.

:::figure Each team owns its layer, and routes attach to a shared Gateway
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">GatewayClass is chosen by the cluster operator. The Gateway public in namespace infra terminates TLS on port 443. The HTTPRoute notes-api in namespace notes attaches to it and sends requests for notes.skylane.example to the notes-api Service, which forwards to Pods.</title>
  <rect class="d-box" x="10" y="80" width="120" height="60" rx="10"/>
  <text class="d-label" x="70" y="106" text-anchor="middle">GatewayClass</text>
  <text class="d-label-muted" x="70" y="126" text-anchor="middle">cluster ops</text>
  <rect class="d-box-primary" x="155" y="80" width="130" height="60" rx="10"/>
  <text class="d-label" x="220" y="106" text-anchor="middle">Gateway :443</text>
  <text class="d-label-muted" x="220" y="126" text-anchor="middle">platform</text>
  <rect class="d-box-accent" x="310" y="80" width="140" height="60" rx="10"/>
  <text class="d-label" x="380" y="106" text-anchor="middle">HTTPRoute</text>
  <text class="d-label-muted" x="380" y="126" text-anchor="middle">notes team</text>
  <rect class="d-box-success" x="475" y="80" width="100" height="60" rx="10"/>
  <text class="d-label" x="525" y="115" text-anchor="middle">Service</text>
  <rect class="d-box-success" x="600" y="80" width="90" height="60" rx="10"/>
  <text class="d-label" x="645" y="115" text-anchor="middle">Pods</text>
  <path class="d-arrow" d="M130 110 L153 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M285 110 L308 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M450 110 L473 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M575 110 L598 110" marker-end="url(#arrow)"/>
  <text class="d-code" x="380" y="175" text-anchor="middle">notes.skylane.example → notes-api:80</text>
</svg>
:::

The platform team's Gateway, once per cluster:

```yaml title=infra/gateway.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: public
  namespace: infra
spec:
  gatewayClassName: skylane-lb        # provided by your implementation
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      hostname: "*.skylane.example"
      tls:
        mode: Terminate
        certificateRefs:
          - name: skylane-wildcard-tls
      allowedRoutes:
        namespaces:
          from: All
```

Your route, in the `notes` namespace:

```yaml title=k8s/httproute.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: notes-api
  namespace: notes
spec:
  parentRefs:
    - name: public
      namespace: infra
  hostnames:
    - notes.skylane.example
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: notes-api
          port: 80
```

`kubectl describe httproute notes-api` shows whether the Gateway accepted the route, under `Status`. If you're migrating existing Ingress objects, the `ingress2gateway` tool converts them, including many ingress-nginx annotations.

## The debugging playbook

When notes-api misbehaves, resist guessing. Follow the same order every time, and let each step choose the next:

```bash
kubectl get pods -l app.kubernetes.io/name=notes-api
kubectl describe pod <pod>
kubectl logs <pod> --previous
kubectl events --for pod/<pod> --types=Warning
```

The `STATUS` column tells you where to look:

| Status | What it means | Where to look |
|---|---|---|
| `Pending` | No node can take the Pod | `describe`: events like `Insufficient cpu` or unmatched node selectors |
| `ImagePullBackOff` | The kubelet can't pull the image | `describe`: wrong tag, missing pull credentials, wrong architecture |
| `CreateContainerConfigError` | A referenced ConfigMap or Secret key is missing | `describe` names the key |
| `CrashLoopBackOff` | The app starts and exits, repeatedly | `logs --previous`, plus the exit code in `describe` (137 = OOM or killed) |
| `Running`, `0/1` ready | Readiness probe is failing | `describe` shows probe failures; check what `/readyz` depends on |

If Pods are healthy but requests fail, work outwards: `kubectl get endpointslices -l kubernetes.io/service-name=notes-api` (empty means selector or readiness), then the route's status, then the Gateway.

Distroless images have no shell, so `kubectl exec` can't help. Attach an **ephemeral debug container** instead. It joins the Pod's network namespace, and with `--target` it can see the app's processes too:

```bash
kubectl debug -it <pod> --image=busybox:1.37 --target=api
# inside: nslookup notes-db, wget -qO- localhost:3000/readyz, ps
```

:::mistake Deleting the evidence
The reflex during an incident is `kubectl delete pod` to "make it restart cleanly". The replacement crashes the same way, and the previous container's logs and events go with the old Pod. Read `describe` and `logs --previous` first. Restarting is for after you know why.
:::

## The last piece: securityContext

In lesson 2.2 you ran the image as non-root and promised to enforce it in the cluster. Here it is, on the notes-api container:

```yaml title=k8s/deployment.yaml
          securityContext:
            runAsNonRoot: true
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
```

`runAsNonRoot` makes the kubelet refuse to start the container if the image would run as UID 0. It checks a numeric UID, so an image whose `USER` is a name such as `node` fails with `CreateContainerConfigError`; write `USER 1000` in the Dockerfile or add `runAsUser: 1000` here. Give the app an `emptyDir` volume at `/tmp` if it needs scratch space under a read-only root.

That completes notes-api's path: a cached multi-stage build, a small non-root image pinned by digest and scanned, a Compose stack for development, and a Deployment with probes, resources, autoscaling, safe rollouts, a Gateway route and a hardened security context. Each of those settings is in the file because an incident taught someone it was needed. Keep that habit: when something breaks, ask which setting would have made it impossible, and add it.
