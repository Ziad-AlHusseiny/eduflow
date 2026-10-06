---
summary: Give notes-api and its database stable names and addresses with Services, wire `port`, `targetPort` and `containerPort` correctly, and choose between ClusterIP, NodePort and LoadBalancer.
takeaways:
  - A Service gives a changing set of Pods one stable virtual IP and DNS name, and spreads connections across the ready Pods its selector matches.
  - "`port` is what clients connect to on the Service; `targetPort` is where traffic goes on the Pod and must match the container's listening port."
  - Inside the cluster, Pods reach a Service by name, such as `notes-db` in the same namespace or `notes-db.notes.svc.cluster.local` from anywhere.
  - Use ClusterIP for internal traffic, LoadBalancer to expose one service through a cloud load balancer, and NodePort mainly for testing.
  - An empty EndpointSlice means the Service matches no ready Pods; check the selector and readiness first.
further:
  - title: Service
    url: https://kubernetes.io/docs/concepts/services-networking/service/
  - title: DNS for Services and Pods
    url: https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
  - title: Use Port Forwarding to Access Applications in a Cluster
    url: https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/
quiz:
  - q: 'notes-api listens on 3000. The Service has `port: 80` and `targetPort: 3000`. Which URL do other Pods in the same namespace use?'
    options:
      - text: "`http://notes-api:3000`"
        why: 3000 is the Pod's port. Clients of the Service connect to the Service's `port`, which is 80.
      - text: "`http://<pod-ip>:80`"
        why: Pod IPs change on every replacement, and nothing in the Pod listens on 80.
      - text: "`http://notes-api` (port 80)"
        why: Correct. The Service name resolves through cluster DNS, and port 80 is forwarded to 3000 on a ready Pod.
      - text: "`http://localhost:80`"
        why: "`localhost` is the calling Pod itself, not the Service."
    answer: 2
  - q: "`kubectl get endpointslices -l kubernetes.io/service-name=notes-api` shows no endpoints, but three notes-api Pods are Running. What do you check first?"
    options:
      - text: Whether the Service's selector matches the Pods' labels, and whether the Pods are Ready.
        why: Correct. Endpoints list Pods that match the selector and pass readiness. A label typo or failing readiness probe leaves it empty.
      - text: Whether the Service type is LoadBalancer.
        why: Type changes how traffic reaches the Service from outside, not which Pods back it.
      - text: Whether the image tag is `latest`.
        why: Image tags don't affect Service matching.
      - text: Whether the cluster DNS is running.
        why: DNS resolves the Service name, but endpoints are computed from labels and readiness, independently of DNS.
    answer: 0
  - q: You need notes-api reachable from the internet on a managed cluster in AWS, and it's the only public service. Which Service type fits?
    options:
      - text: ClusterIP
        why: ClusterIP is only reachable inside the cluster.
      - text: NodePort, with users connecting to a node IP on port 30080
        why: That exposes every node on a high port and breaks when nodes are replaced. It's a building block, not a public endpoint.
      - text: 'Headless (`clusterIP: None`)'
        why: Headless Services give DNS records for each Pod, for things like databases with stable identities. They don't expose anything externally.
      - text: LoadBalancer, which provisions a cloud load balancer in front of the Service
        why: Correct. For one public service it's the simplest option. With many HTTP services you'd share one entry point through Gateway API instead.
    answer: 3
  - q: "Which `targetPort` is correct for a container that declares `ports: [{ name: http, containerPort: 3000 }]`?"
    options:
      - text: "`targetPort: 80`, to match the Service's port."
        why: "`targetPort` is where traffic lands in the Pod. Nothing listens on 80 there."
      - text: "`targetPort: http`, the container port's name (or `3000`)."
        why: Correct. A named port keeps working even if you later change the number in one place.
      - text: "`targetPort: notes-api`, the Deployment's name."
        why: "`targetPort` takes a number or the name of a container port, not an object name."
      - text: "`targetPort: 30000`, from the NodePort range."
        why: The NodePort range applies to `nodePort`, a different field on the node side.
    answer: 1
---

Run `kubectl get pods -o wide` twice, with a rollout in between, and every IP is different. Pods are replaced constantly: new versions, rescheduling, scaling. Anything that remembered a Pod's IP is now pointing at nothing. A Service is the stable thing you point at instead.

## A Service for notes-api

```yaml title=k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: notes-api
  labels:
    app.kubernetes.io/name: notes-api
spec:
  selector:
    app.kubernetes.io/name: notes-api
  ports:
    - name: http
      port: 80
      targetPort: http
```

This creates a virtual IP and a DNS name, `notes-api`, that last as long as the Service exists. Connections to it are spread across the Pods its `selector` matches, the same label query the Deployment uses. Kubernetes tracks the current set of matching *ready* Pods in **EndpointSlices** and updates them as Pods come and go. Clients never notice.

A ClusterIP isn't a machine and no process listens on it. Each node's networking layer (kube-proxy, or an eBPF-based replacement in many clusters) programs rules that rewrite packets sent to the Service's IP and port so they go to one of the ready Pods. That's why you can't `ping` a Service IP and shouldn't worry when it doesn't answer: only the declared ports exist. It's also why a Service costs almost nothing, so create one for every workload that receives traffic.

## Three ports, three meanings

This is where most Service bugs live.

- **`containerPort`** in the Pod spec is the port your process listens on: 3000. It's informational, like `EXPOSE`, but naming it (`name: http`) lets other objects refer to it.
- **`targetPort`** on the Service is where traffic is delivered on the Pod. It must match where the app actually listens. Here it uses the name `http`, which resolves to 3000.
- **`port`** on the Service is what clients connect to: 80.

:::figure Clients use the Service port; the Service forwards to targetPort on a ready Pod
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">A client Pod calls notes-api on port 80. The Service forwards to targetPort http, which is containerPort 3000, on one of three ready notes-api Pods selected by label.</title>
  <rect class="d-box" x="20" y="95" width="130" height="60" rx="10"/>
  <text class="d-label" x="85" y="121" text-anchor="middle">client Pod</text>
  <text class="d-code" x="85" y="143" text-anchor="middle">notes-api:80</text>
  <path class="d-arrow" d="M150 125 L228 125" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="230" y="80" width="190" height="90" rx="12"/>
  <text class="d-label-strong" x="325" y="106" text-anchor="middle">Service notes-api</text>
  <text class="d-code" x="325" y="130" text-anchor="middle">port: 80</text>
  <text class="d-code" x="325" y="152" text-anchor="middle">targetPort: http</text>
  <path class="d-arrow" d="M420 110 L508 52" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 125 L508 125" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 140 L508 198" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="510" y="28" width="170" height="48" rx="10"/>
  <text class="d-code" x="595" y="57" text-anchor="middle">pod :3000</text>
  <rect class="d-box-success" x="510" y="101" width="170" height="48" rx="10"/>
  <text class="d-code" x="595" y="130" text-anchor="middle">pod :3000</text>
  <rect class="d-box-success" x="510" y="174" width="170" height="48" rx="10"/>
  <text class="d-code" x="595" y="203" text-anchor="middle">pod :3000</text>
  <text class="d-label-muted" x="325" y="200" text-anchor="middle">selector: app.kubernetes.io/name=notes-api</text>
  <text class="d-label-muted" x="595" y="242" text-anchor="middle">containerPort http = 3000</text>
</svg>
:::

:::mistake targetPort pointing at the wrong port
`port: 80, targetPort: 80` is the classic. It looks symmetrical and tidy, the Service has endpoints, and every request fails with `connection refused`, because nothing in the Pod listens on 80. Point `targetPort` at the container's named port and the numbers can never drift apart.
:::

## Finding Services by name

Cluster DNS gives every Service a name of the form `<service>.<namespace>.svc.cluster.local`. From a Pod in the same namespace, the short name `notes-api` is enough; from another namespace, use `notes-api.notes` or the full name.

notes-api needs a database, so give it one the same way. For practice in kind, run Postgres as a single-replica Deployment with a ClusterIP Service:

```yaml title=k8s/db.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notes-db
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: notes-db
  template:
    metadata:
      labels:
        app.kubernetes.io/name: notes-db
    spec:
      containers:
        - name: postgres
          image: postgres:17
          env:
            - name: POSTGRES_USER
              value: notes
            - name: POSTGRES_PASSWORD
              value: notes          # moved to a Secret in the next lesson
            - name: POSTGRES_DB
              value: notes
          ports:
            - name: postgres
              containerPort: 5432
---
apiVersion: v1
kind: Service
metadata:
  name: notes-db
spec:
  selector:
    app.kubernetes.io/name: notes-db
  ports:
    - name: postgres
      port: 5432
      targetPort: postgres
```

notes-api's `DATABASE_URL` host is now `notes-db`, exactly as `db` was in Compose. The `---` separates two objects in one file.

:::note Databases in production
This practice database keeps its data inside the Pod, so it's lost whenever the Pod is replaced. In production, use a managed database such as Amazon RDS, or run Postgres with a StatefulSet and persistent volumes under an operator maintained by people who know Postgres well. Stateless apps are where Kubernetes is easy; stateful ones need deliberate design.
:::

## Service types

| Type | Reachable from | Use it for |
|---|---|---|
| `ClusterIP` (default) | Inside the cluster | Service-to-service traffic, like notes-api → notes-db |
| `NodePort` | Every node's IP on a port in 30000–32767 | Quick tests, or as a building block for external load balancers |
| `LoadBalancer` | A cloud load balancer's address | Exposing one service publicly on a managed cluster |

There's also the **headless** Service, with `clusterIP: None`. It gets no virtual IP; instead its DNS name returns the IPs of the individual Pods. Databases and other clustered systems use it when each member needs to be addressed directly. You won't need it for notes-api.

`LoadBalancer` builds on the other two: the cloud provider creates a load balancer that typically forwards to node ports, which forward to the Service (some controllers send traffic straight to Pod IPs instead). One per public service gets expensive and repetitive when you have many HTTP services; lesson 5.4 covers Gateway API, which puts many routes behind one entry point.

## Reaching it from your laptop

```bash
kubectl apply -f k8s/
kubectl get svc
kubectl get endpointslices -l kubernetes.io/service-name=notes-api
kubectl port-forward svc/notes-api 8080:80
curl localhost:8080/readyz
```

`port-forward` tunnels a local port to the Service through the API server. It's for debugging, not for real traffic. If the EndpointSlice lists no addresses, the Service matches no ready Pods: compare the selector with `kubectl get pods --show-labels`, then check readiness.

Two problems are now visible in the YAML: a password sits in plain text, and configuration is mixed into the Deployment. The next lesson moves both out.
