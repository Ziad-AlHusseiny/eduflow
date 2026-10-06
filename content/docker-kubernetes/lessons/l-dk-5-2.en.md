---
summary: Set CPU and memory requests and limits for notes-api from measurements, predict throttling, OOM kills and QoS classes, and scale replicas automatically with an autoscaling/v2 HorizontalPodAutoscaler.
takeaways:
  - Requests are what the scheduler reserves for a container; limits are the ceiling enforced at run time.
  - Going over a CPU limit throttles the container; going over a memory limit gets it OOM-killed with exit code 137.
  - "QoS class follows from requests and limits: Guaranteed (equal for every container), Burstable (some set), BestEffort (none), and BestEffort Pods are evicted first."
  - An HPA's CPU utilization target is a percentage of the CPU *request*, so it can't work on containers without one.
  - When an HPA manages a Deployment, remove `replicas` from the Deployment manifest so `kubectl apply` doesn't fight the autoscaler.
further:
  - title: Resource Management for Pods and Containers
    url: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
  - title: Pod Quality of Service Classes
    url: https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/
  - title: Horizontal Pod Autoscaling
    url: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
quiz:
  - q: 'A notes-api Pod restarts several times a day. `kubectl describe pod` shows `Reason: OOMKilled` and `Exit Code: 137`. What happened?'
    options:
      - text: The CPU limit was too low, so the kernel killed the container.
        why: CPU over the limit is throttled (slowed down), never killed.
      - text: The liveness probe failed and Kubernetes restarted the container.
        why: A liveness restart shows a probe failure in the events, not `OOMKilled` as the reason.
      - text: The container used more memory than its limit, and the kernel's OOM killer ended it.
        why: Correct. Raise the memory limit to fit real usage, or find the leak; for Node.js, also cap the V8 heap below the limit.
      - text: The node ran out of disk space for logs.
        why: Disk pressure leads to eviction with a different reason, not an OOM kill.
    answer: 2
  - q: 'An HPA targets 70% CPU utilization, and `kubectl get hpa` shows `cpu: <unknown>/70%`. What''s the most likely cause?'
    options:
      - text: The HPA uses `autoscaling/v2`, which doesn't support CPU.
        why: autoscaling/v2 supports CPU, memory, custom and external metrics.
      - text: The notes-api containers have no CPU request, so utilization can't be computed (or metrics-server isn't installed).
        why: Correct. Utilization is usage divided by request. No request, no percentage. Also check that metrics-server is running.
      - text: "`minReplicas` is higher than the current replica count."
        why: That makes the HPA scale up to the minimum; it doesn't make metrics unknown.
      - text: The Deployment has too many replicas for the HPA to manage.
        why: There's no such limit; the HPA can manage any number within its bounds.
    answer: 1
  - q: "notes-api sets `requests: {cpu: 250m, memory: 256Mi}` and `limits: {memory: 512Mi}`. Which QoS class does the Pod get?"
    options:
      - text: Guaranteed
        why: Guaranteed needs requests equal to limits for both CPU and memory in every container.
      - text: BestEffort
        why: BestEffort means no requests or limits at all. This Pod has requests.
      - text: Critical
        why: That's not a QoS class. The three classes are Guaranteed, Burstable and BestEffort.
      - text: Burstable
        why: Correct. It has requests, but they don't equal limits for every resource, so it can burst above its requests.
    answer: 3
  - q: 'notes-api''s Deployment manifest says `replicas: 3`, and an HPA has scaled it to 9 during a traffic peak. What happens when CI runs `kubectl apply -f k8s/`?'
    options:
      - text: The Deployment drops to 3 replicas until the HPA scales it back up, causing a capacity dip in the middle of the peak.
        why: Correct. Apply sets the field from the file. Remove `replicas` from the manifest once an HPA owns it.
      - text: Nothing; the HPA locks the replicas field.
        why: The HPA writes the field, but it doesn't lock it. Anything else that writes it wins until the next HPA decision.
      - text: Apply fails with a conflict error.
        why: With ordinary client-side apply there's no error; it overwrites silently, which is what makes this dangerous.
      - text: The HPA's `minReplicas` changes to 3.
        why: Applying a Deployment never edits the HPA object.
    answer: 0
---

The first time notes-api met real traffic on a shared cluster, two things happened within an hour. A batch job on the same node used all the memory and one notes-api Pod was evicted. Then a traffic spike pegged the CPU, latency went to seconds, and there were still exactly three Pods because nobody had told Kubernetes it could add more. Both failures came from the same gap: Kubernetes didn't know what notes-api needed.

## Requests and limits

Every container can declare two numbers per resource:

```yaml title=k8s/deployment.yaml
        - name: api
          image: ghcr.io/skylane/notes-api:1.4.0
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              memory: 512Mi
```

- A **request** is what the scheduler reserves. A Pod is only placed on a node with enough unreserved capacity for all its requests. `250m` is 250 millicores, a quarter of a CPU core.
- A **limit** is the ceiling the kernel enforces through cgroups, the mechanism you met in lesson 1.1.

The two resources behave very differently when a container hits its limit:

- **CPU is compressible.** Over the CPU limit, the container is throttled: it gets less CPU time and gets slower, but keeps running.
- **Memory isn't.** Over the memory limit, the kernel's OOM killer ends the process. `kubectl describe pod` shows `OOMKilled` and exit code 137, and the container restarts.

If you set a limit without a request, Kubernetes copies the limit into the request. A request larger than its limit is rejected outright.

:::why Why notes-api has no CPU limit
This is contested, so here's my reasoning. A CPU limit throttles the app even when the node has idle cores, which shows up as latency spikes nobody can explain. With a sensible CPU request, the scheduler already guarantees notes-api its share under contention, so we leave the CPU limit off and set a memory limit, because running out of memory hurts the whole node. Some organisations require CPU limits by policy; if yours does, set them generously and watch throttling metrics.
:::

For Node.js, give V8 a heap ceiling below the container's memory limit, for example `NODE_OPTIONS=--max-old-space-size=384` with a 512Mi limit. Then the garbage collector works hard as memory fills, instead of the kernel ending the process without warning.

## Choosing the numbers

Don't guess. Run notes-api under realistic load and measure:

```bash
kubectl top pods -l app.kubernetes.io/name=notes-api
```

`kubectl top` needs metrics-server, which many managed clusters include or offer as an add-on; on kind you install it yourself. Set the CPU request near typical usage under normal load, and the memory request and limit with headroom above the peak you observed. Revisit the numbers after major releases. Requests that are too high waste money on idle reservations; too low, and Pods are packed onto nodes that can't actually carry them.

## QoS classes and eviction

From requests and limits, Kubernetes derives a **Quality of Service class** for each Pod:

| Class | Rule | Evicted under node memory pressure |
|---|---|---|
| Guaranteed | Every container has CPU and memory requests equal to limits | Last |
| Burstable | At least one request or limit set, but not Guaranteed | After BestEffort, starting with Pods furthest over their requests |
| BestEffort | No requests or limits anywhere | First |

notes-api above is Burstable. The batch job that caused our eviction was BestEffort, so with requests in place it would have been evicted before notes-api. Running production workloads as BestEffort means volunteering them to go first.

## Horizontal Pod Autoscaling

The HorizontalPodAutoscaler (HPA) adjusts a Deployment's replica count from metrics. It's another control loop: every 15 seconds or so it compares observed usage with a target and computes the replica count that would bring usage back to the target.

```yaml title=k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: notes-api
  namespace: notes
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: notes-api
  minReplicas: 3
  maxReplicas: 12
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

`averageUtilization: 70` means "keep average CPU usage at 70% of the CPU **request**". With a 250m request, that's about 175m per Pod. At six Pods averaging 350m, the HPA computes 6 × 350 / 175 = 12 and scales to the maximum. The `behavior` block makes scale-down wait for five minutes of consistently lower load, so a brief lull doesn't remove capacity you need a minute later. Five minutes is already the default; writing it down makes the choice visible and easy to tune.

:::figure The HPA is a control loop over the Deployment's replica count
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">metrics-server collects CPU usage from the Pods. The HPA reads it, compares usage with 70 percent of requests, and updates the Deployment's replicas, which changes the number of Pods.</title>
  <rect class="d-box" x="20" y="80" width="150" height="60" rx="10"/>
  <text class="d-label" x="95" y="115" text-anchor="middle">metrics-server</text>
  <rect class="d-box-primary" x="240" y="80" width="200" height="60" rx="10"/>
  <text class="d-label-strong" x="340" y="106" text-anchor="middle">HPA</text>
  <text class="d-code" x="340" y="128" text-anchor="middle">target 70% of request</text>
  <rect class="d-box-accent" x="510" y="80" width="170" height="60" rx="10"/>
  <text class="d-label" x="595" y="106" text-anchor="middle">Deployment</text>
  <text class="d-code" x="595" y="128" text-anchor="middle">replicas: 3 → 6</text>
  <path class="d-arrow" d="M170 110 L238 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 110 L508 110" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="300" y="170" width="250" height="40" rx="8"/>
  <text class="d-label" x="425" y="195" text-anchor="middle">notes-api Pods</text>
  <path class="d-arrow" d="M595 140 L520 168" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M300 190 L95 142" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="170" y="185" text-anchor="middle">CPU usage</text>
  <text class="d-label-muted" x="350" y="60" text-anchor="middle">every ~15 s</text>
</svg>
:::

:::mistake Two owners for one field
Once an HPA manages notes-api, delete `replicas:` from `k8s/deployment.yaml`. Otherwise every `kubectl apply` sets the count back to the file's value, perhaps 3 in the middle of a traffic peak at 9, and the HPA has to climb back up while users wait. One field, one owner.
:::

Watch it work with `kubectl get hpa notes-api --watch` while you run a load test. If the targets column shows `<unknown>`, either the containers have no CPU request or metrics-server isn't running.

CPU suits notes-api because its work is CPU-bound request handling. Services whose load shows up elsewhere, like queue depth or requests per second, can scale on custom or external metrics through the same `metrics` list, with an adapter installed in the cluster.

notes-api now has the resources it needs and grows with load. The next lesson changes the image safely: rolling updates, rollbacks and packaging the whole thing with Helm.
