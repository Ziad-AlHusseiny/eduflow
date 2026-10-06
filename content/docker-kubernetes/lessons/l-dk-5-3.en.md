---
summary: Tune notes-api's rolling update so releases never reduce capacity, watch and roll back a bad rollout with kubectl, and package the manifests as a Helm chart with per-environment values.
takeaways:
  - A rolling update scales a new ReplicaSet up and the old one down, paced by `maxSurge` and `maxUnavailable` and gated by readiness.
  - With `maxUnavailable` at 0, a release whose Pods never become ready stalls harmlessly while the old version keeps serving.
  - "`kubectl rollout undo` switches back to the previous ReplicaSet in seconds, but update Git too or the next apply redeploys the bad version."
  - Rolling back code doesn't roll back the database, so schema changes must work with both the old and the new version.
  - Helm packages manifests as templates plus values; `helm upgrade --install` deploys, and `helm rollback` returns to an earlier release revision.
further:
  - title: Deployments (rolling update and rollback)
    url: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment
  - title: Performing a Rolling Update
    url: https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/
  - title: kubectl rollout
    url: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/
quiz:
  - q: notes-api runs 4 replicas with `maxSurge 1` and `maxUnavailable 0`. Version 1.5.0's Pods crash on start. What do users experience?
    options:
      - text: Nothing; the rollout stalls with one failing new Pod while all 4 old Pods keep serving.
        why: Correct. With no unavailability allowed, an old Pod is only removed after a new one is ready, which never happens.
      - text: A full outage, because the old ReplicaSet is deleted first.
        why: That describes the `Recreate` strategy. Rolling updates keep the old ReplicaSet until the new one is ready.
      - text: About a quarter of requests fail until someone intervenes.
        why: That could happen with `maxUnavailable` above zero and no readiness probe. Here the failing Pod never receives traffic.
      - text: Kubernetes rolls back to 1.4.0 automatically after the deadline.
        why: Kubernetes marks the rollout as failed after `progressDeadlineSeconds`, but it doesn't roll back on its own.
    answer: 0
  - q: You ran `kubectl rollout undo deployment/notes-api` during an incident and service recovered. What must happen next?
    options:
      - text: Nothing; the rollback is permanent.
        why: The cluster is fixed, but the manifest in Git still names the bad image, and the next deploy brings it back.
      - text: Delete the old ReplicaSet so it can't be used again.
        why: Old ReplicaSets are what make rollbacks possible. Keep them.
      - text: Restart all Pods to clear cached state.
        why: The rollback already replaced the Pods.
      - text: Change the image in Git (or revert the commit) so the next `kubectl apply` doesn't redeploy the broken version.
        why: Correct. Git and the cluster must agree. Fix the source of truth before anyone runs the next deploy.
    answer: 3
  - q: Release 1.5.0 renames the database column `body` to `content` in a migration. 1.5.0 has a bug and you roll back to 1.4.0. What happens?
    options:
      - text: The rollback also reverts the migration automatically.
        why: Kubernetes knows nothing about your database. Only the Pods change.
      - text: 1.4.0 starts failing, because it still queries `body`, which no longer exists.
        why: Correct. That's why schema changes should be expand-then-contract (add new, migrate, remove old later), so adjacent versions both work.
      - text: Postgres renames the column back when old queries arrive.
        why: Databases don't undo schema changes in response to queries.
      - text: Nothing breaks, because 1.4.0's image includes its own schema.
        why: Images hold code, not database state. The schema lives in Postgres.
    answer: 1
  - q: You want to see the exact Kubernetes YAML a Helm chart will produce for production before installing it. Which command?
    options:
      - text: "`helm history notes-api`"
        why: That lists past releases of an installed chart, not rendered manifests.
      - text: "`helm rollback notes-api 0`"
        why: That changes the cluster; it doesn't preview anything.
      - text: "`helm template notes-api ./charts/notes-api -f values-prod.yaml`"
        why: Correct. It renders the templates with your values locally and prints the YAML, so you can read or diff it.
      - text: "`kubectl get all -n notes`"
        why: That shows what's already running, not what the chart would create.
    answer: 2
---

The release that taught me to respect rollouts went out on a Friday at 4 p.m. (I know). The new version had a typo in an environment variable name, so it couldn't reach the database. The Deployment had no readiness probe and the default rollout settings, so Kubernetes happily replaced every working Pod with one that returned 500s. It took six minutes to notice and forty seconds to roll back. This lesson is about making the first part impossible and the second part routine.

## How a rolling update works

When you change anything in a Deployment's Pod template, typically the image, the Deployment creates a **new ReplicaSet** for the new template and starts shifting replicas from old to new. Two settings pace it:

```yaml title=k8s/deployment.yaml
spec:
  revisionHistoryLimit: 10
  minReadySeconds: 10
  progressDeadlineSeconds: 300
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

- **`maxSurge`**: how many Pods above the desired count may exist during the update. With 4 replicas and `maxSurge: 1`, there can be 5 Pods at once.
- **`maxUnavailable`**: how many below the desired count are tolerated. At `0`, capacity never drops.
- **`minReadySeconds`**: a new Pod must stay ready this long before it counts as available. It catches versions that pass readiness and then crash ten seconds in.
- **`progressDeadlineSeconds`**: if the rollout makes no progress for this long, the Deployment reports it as failed.

The defaults are 25% surge and 25% unavailable. I set `maxUnavailable: 0` on every user-facing service: an old Pod is removed only after a new Pod is ready. Combined with the readiness probe from lesson 5.1, a broken release can't take traffic away from a working one. It stalls with one unready new Pod while the old ones serve.

:::figure Rolling update with maxSurge 1 and maxUnavailable 0
<svg viewBox="0 0 700 240" role="img" aria-labelledby="t1">
  <title id="t1">Four steps of a rolling update for 4 replicas. Each step adds one new-version Pod, waits for it to be ready, then removes one old-version Pod, so at least 4 ready Pods always exist.</title>
  <text class="d-label-strong" x="20" y="40">start</text>
  <rect class="d-box" x="120" y="22" width="60" height="28" rx="6"/>
  <rect class="d-box" x="190" y="22" width="60" height="28" rx="6"/>
  <rect class="d-box" x="260" y="22" width="60" height="28" rx="6"/>
  <rect class="d-box" x="330" y="22" width="60" height="28" rx="6"/>
  <text class="d-label-strong" x="20" y="95">surge</text>
  <rect class="d-box" x="120" y="77" width="60" height="28" rx="6"/>
  <rect class="d-box" x="190" y="77" width="60" height="28" rx="6"/>
  <rect class="d-box" x="260" y="77" width="60" height="28" rx="6"/>
  <rect class="d-box" x="330" y="77" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="400" y="77" width="60" height="28" rx="6"/>
  <text class="d-label-muted" x="480" y="96">new Pod ready</text>
  <text class="d-label-strong" x="20" y="150">swap</text>
  <rect class="d-box" x="190" y="132" width="60" height="28" rx="6"/>
  <rect class="d-box" x="260" y="132" width="60" height="28" rx="6"/>
  <rect class="d-box" x="330" y="132" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="400" y="132" width="60" height="28" rx="6"/>
  <text class="d-label-muted" x="480" y="151">one old Pod removed</text>
  <text class="d-label-strong" x="20" y="205">done</text>
  <rect class="d-box-success" x="120" y="187" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="190" y="187" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="260" y="187" width="60" height="28" rx="6"/>
  <rect class="d-box-success" x="330" y="187" width="60" height="28" rx="6"/>
  <text class="d-label-muted" x="480" y="206">old ReplicaSet at 0</text>
  <text class="d-label-muted" x="20" y="234">grey: 1.4.0 · green: 1.5.0 · repeat until all replaced</text>
</svg>
:::

The other strategy, `Recreate`, deletes all old Pods before starting new ones. Use it only when two versions truly can't run side by side, and accept the downtime.

## Deploy, watch, roll back

Change the image in `k8s/deployment.yaml` and apply, then watch:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/notes-api --timeout=5m
```

`rollout status` waits until the rollout completes or fails, and exits non-zero on failure, so CI can use it as the "did the deploy work?" step. If it fails, or your dashboards turn red after it succeeds:

```bash
kubectl rollout history deployment/notes-api
kubectl rollout undo deployment/notes-api
kubectl rollout undo deployment/notes-api --to-revision=7
```

Every old ReplicaSet (up to `revisionHistoryLimit`) is a ready-made rollback target. `undo` scales the previous one back up using the same rolling update rules, so rolling back is as safe as rolling forward and takes seconds. To make `history` readable, record why each revision exists: `kubectl annotate deployment/notes-api kubernetes.io/change-cause="1.5.0: bulk export"`.

After an undo, the cluster runs 1.4.0 and Git still says 1.5.0. Revert the commit straight away, or the next routine apply redeploys the bug.

:::mistake Assuming rollback undoes everything
`rollout undo` swaps Pods. It doesn't touch your database. If 1.5.0 renamed a column, 1.4.0 comes back to a schema it doesn't understand, and your rollback becomes a second outage. Make schema changes in expand-and-contract steps: add the new column, deploy code that writes both, backfill, switch reads, and only drop the old column a release later. Then any two adjacent versions can run against the same database, which rolling updates require anyway.
:::

## Packaging with Helm

notes-api's `k8s/` folder is now six files, and staging needs different replicas, resources and image tags from production. **Helm** packages manifests into a **chart**: templates with placeholders, plus a `values.yaml` of defaults that each environment overrides.

```text
charts/notes-api/
  Chart.yaml
  values.yaml
  templates/
    deployment.yaml
    service.yaml
    hpa.yaml
    configmap.yaml
```

```yaml title=charts/notes-api/templates/deployment.yaml
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

```yaml title=charts/notes-api/values-prod.yaml
image:
  repository: ghcr.io/skylane/notes-api
  tag: "1.5.1"
resources:
  requests: { cpu: 250m, memory: 256Mi }
  limits: { memory: 512Mi }
```

The commands mirror what you did with kubectl:

```bash
helm lint charts/notes-api
helm template notes-api charts/notes-api -f charts/notes-api/values-prod.yaml
helm upgrade --install notes-api charts/notes-api -n notes -f charts/notes-api/values-prod.yaml
helm history notes-api -n notes
helm rollback notes-api 4 -n notes
```

`helm template` renders the YAML locally so you can review it. `upgrade --install` installs the first time and upgrades after that, recording a numbered **release revision** each time. `helm rollback` re-applies an earlier revision's complete set of manifests, ConfigMap included, which is broader than `kubectl rollout undo`. Helm 4, released in late 2025, renamed some flags; for example `--atomic`, which rolls back automatically when an upgrade fails, is now `--rollback-on-failure`.

:::tip Start with plain manifests
Helm earns its place once you have several environments or want to consume charts others publish, such as a metrics stack. For one service in one environment, plain YAML plus `kubectl diff` is easier to read and debug. Templates you can't render in your head slow down every incident.
:::

You can now ship, watch and reverse a release with confidence. The last lesson gets traffic into the cluster properly and assembles the debugging playbook for when something still goes wrong.
