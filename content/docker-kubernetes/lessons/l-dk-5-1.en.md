---
summary: Add startup, readiness and liveness probes to notes-api that tell Kubernetes the truth, and shut Pods down without dropping requests using a preStop pause and a SIGTERM handler.
takeaways:
  - A failing readiness probe removes the Pod from Service endpoints; a failing liveness probe restarts the container; a startup probe holds both off until the app has started.
  - Liveness checks only whether the process itself is stuck; never make it depend on a database or another service.
  - Readiness gates rolling updates, so a new version that can't serve never replaces a working one.
  - On deletion, endpoint removal and SIGTERM happen at the same time; a short `preStop` sleep lets traffic drain before the app starts shutting down.
  - The app must finish in-flight work within `terminationGracePeriodSeconds` (30 by default) or it is killed.
further:
  - title: Liveness, Readiness, and Startup Probes
    url: https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/
  - title: Configure Liveness, Readiness and Startup Probes
    url: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
  - title: Pod Lifecycle (termination of Pods)
    url: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination
quiz:
  - q: notes-api's readiness probe starts failing on one Pod because it can't reach Postgres. What does Kubernetes do?
    options:
      - text: Restarts the container until the probe passes.
        why: Restarts come from liveness failures. Readiness only affects traffic.
      - text: Deletes the Pod and schedules a new one on another node.
        why: Probes never delete Pods. The Pod stays where it is.
      - text: Nothing until the liveness probe also fails.
        why: Readiness acts on its own, independently of liveness.
      - text: Removes the Pod from the Service's endpoints, so it gets no new traffic until the probe passes again.
        why: Correct. The Pod keeps running and rejoins as soon as it's ready, with no restart.
    answer: 3
  - q: Your liveness probe calls `/readyz`, which checks the database. Postgres restarts for 20 seconds. What happens?
    options:
      - text: Every notes-api container fails liveness and is restarted at once, turning a brief database blip into a full outage.
        why: Correct. Liveness should only ask "is this process stuck?" Dependency checks belong in readiness.
      - text: The Pods are marked not ready and recover when Postgres returns.
        why: That would be true for a readiness probe. Liveness failures cause restarts.
      - text: Kubernetes detects the database restart and pauses the probes.
        why: Kubernetes knows nothing about your app's dependencies; it runs the probe as configured.
      - text: Only one Pod restarts, because liveness failures are rate-limited.
        why: There's no such cluster-wide rate limit. Each Pod's probe fails independently, all at the same time.
    answer: 0
  - q: notes-api takes up to 60 seconds to start on a big database because it warms a cache. Which probe setup avoids a restart loop without slowing failure detection later?
    options:
      - text: "`initialDelaySeconds: 60` on the liveness probe."
        why: It works, but every start now waits 60 seconds before liveness runs at all, and it breaks again when startup takes 65.
      - text: Remove the liveness probe.
        why: Then a deadlocked process is never restarted.
      - text: 'A startup probe with `periodSeconds: 5` and `failureThreshold: 15`, so the app gets up to 75 seconds to start before liveness takes over.'
        why: Correct. Liveness and readiness are held off until the startup probe succeeds once; after that, liveness runs at its normal pace.
      - text: "`timeoutSeconds: 60` on the liveness probe."
        why: That lets a single check hang for a minute, which delays detecting real hangs and doesn't fix startup.
    answer: 2
  - q: During every rollout a few requests to notes-api fail with `connection refused`, even though the app handles SIGTERM. What's the usual fix?
    options:
      - text: Raise `terminationGracePeriodSeconds` to 300.
        why: The app already shuts down within the grace period. The errors happen at the start of termination, not the end.
      - text: Add a `preStop` sleep of a few seconds so endpoint removal propagates before the app stops accepting connections.
        why: Correct. SIGTERM and endpoint removal happen in parallel; a short pause lets proxies stop routing to the Pod first.
      - text: 'Set `replicas: 1` during rollouts.'
        why: Fewer replicas makes any dropped connection hurt more, not less.
      - text: Disable the readiness probe during rollouts.
        why: Readiness is what keeps unready Pods out of rotation; disabling it makes rollouts worse.
    answer: 1
---

Kubernetes can't see inside your app. Left alone, it considers a container healthy if its process is running, even if that process is deadlocked, still warming up, or unable to reach the database. Probes are how the app tells the truth about itself. The truth has to be carefully worded, though, because Kubernetes acts on it automatically and at scale.

## Three probes, three consequences

| Probe | Question it answers | When it fails |
|---|---|---|
| **startup** | Has the app finished starting? | Keep waiting, up to the limit, then restart |
| **readiness** | Should this Pod receive traffic right now? | Remove the Pod from Service endpoints; no restart |
| **liveness** | Is the process stuck beyond recovery? | Restart the container |

While a startup probe is configured and hasn't yet succeeded, the other two don't run. Once it succeeds, it never runs again for that container.

notes-api already has the two endpoints this needs. `/healthz` returns `ok` if the event loop can answer a request at all. `/readyz` also checks the database pool and returns 503 if Postgres is unreachable.

```yaml title=k8s/deployment.yaml
        - name: api
          image: ghcr.io/skylane/notes-api:1.4.0
          ports:
            - name: http
              containerPort: 3000
          startupProbe:
            httpGet:
              path: /healthz
              port: http
            periodSeconds: 2
            failureThreshold: 30      # up to 60 s to start
          readinessProbe:
            httpGet:
              path: /readyz
              port: http
            periodSeconds: 5
            failureThreshold: 2
          livenessProbe:
            httpGet:
              path: /healthz
              port: http
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3
```

Any HTTP status from 200 to 399 is a pass. Besides `httpGet` there are `tcpSocket`, `grpc` and `exec` probes; prefer HTTP for web services, since it tests the path real traffic takes. The defaults, if you leave fields out, are `periodSeconds: 10`, `timeoutSeconds: 1` and `failureThreshold: 3`. The one-second timeout catches slow apps by surprise, so set it deliberately.

## Readiness is a traffic switch

Readiness is the probe that matters most day to day. A Pod that's starting, overloaded or cut off from its database reports not ready and drops out of the Service's endpoints until it recovers. It also **gates rollouts**: a new Pod only counts as available once it's ready, and a rolling update removes old Pods only as fast as new ones become available. A release that can't reach the database never takes traffic from a version that can. That's why the Deployment without a readiness probe is the one I flag first in every review.

:::mistake A liveness probe that checks dependencies
Pointing liveness at `/readyz` feels thorough. Then Postgres restarts for 20 seconds, every notes-api container fails liveness at the same moment, and Kubernetes restarts all of them. When they come back, they all reconnect at once. A 20-second database blip has become a five-minute outage. Liveness asks one narrow question: is this process stuck? Anything about other systems belongs in readiness.
:::

## Startup without restart loops

Before startup probes existed, slow-starting apps were protected with `initialDelaySeconds` on liveness. That delays the first check on *every* start by the worst-case startup time, and breaks again when startup gets slower. A startup probe gives the app `periodSeconds × failureThreshold` (here 2 × 30 = 60 seconds) to come up, checking frequently so a fast start is detected quickly, and then hands over to liveness at its normal pace.

## Shutting down without dropping requests

When a Pod is deleted, during a rollout, a scale-down or a node drain, two things start **at the same time**: the Pod is removed from the Service's endpoints, and the kubelet begins terminating the container. Removing endpoints has to propagate to every node's networking rules and to any load balancer, which takes a moment. If your app stops accepting connections the instant SIGTERM arrives, requests routed in that moment are refused.

:::figure Endpoint removal and termination start together; a preStop pause covers the gap
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">At Pod deletion, endpoint removal propagates over a few seconds while the preStop sleep runs. Then SIGTERM is sent and the app drains in-flight requests and exits, all within the 30 second grace period, after which SIGKILL would be sent.</title>
  <path class="d-line" d="M40 40 L40 210"/>
  <text class="d-label-strong" x="46" y="30">delete Pod</text>
  <rect class="d-box-warn" x="40" y="60" width="200" height="40" rx="6"/>
  <text class="d-label" x="140" y="85" text-anchor="middle">endpoints removed</text>
  <rect class="d-box-accent" x="40" y="120" width="160" height="40" rx="6"/>
  <text class="d-label" x="120" y="145" text-anchor="middle">preStop sleep 5s</text>
  <path class="d-arrow" d="M200 140 L236 140" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="240" y="120" width="230" height="40" rx="6"/>
  <text class="d-label" x="355" y="145" text-anchor="middle">SIGTERM: drain, then exit 0</text>
  <path class="d-line d-dashed" d="M40 190 L650 190"/>
  <path class="d-line" d="M650 110 L650 200"/>
  <text class="d-label-muted" x="345" y="215" text-anchor="middle">terminationGracePeriodSeconds: 30</text>
  <text class="d-label-strong" x="650" y="100" text-anchor="middle">SIGKILL</text>
</svg>
:::

The fix has two halves. In the Pod spec, pause before SIGTERM so routing catches up:

```yaml title=k8s/deployment.yaml
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          lifecycle:
            preStop:
              sleep:
                seconds: 5
```

The `sleep` action runs in the kubelet, so it works even in a distroless image with no `sleep` binary. In the app, keep the SIGTERM handler from lesson 1.4: stop accepting new connections, finish in-flight requests, close the database pool, exit. The preStop pause and the drain must together fit inside `terminationGracePeriodSeconds`, or the kubelet sends SIGKILL at the deadline.

:::tip Test it, don't trust it
Run a load generator against the Service and trigger `kubectl rollout restart deployment/notes-api`. Count the errors. Zero is achievable, and once you've seen it you'll notice immediately when a change breaks it.
:::

Kubernetes now knows when notes-api is healthy and how to stop it gracefully. Next, it needs to know how much CPU and memory notes-api uses, and how to add Pods when traffic grows.
