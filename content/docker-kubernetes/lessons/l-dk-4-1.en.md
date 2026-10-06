---
summary: Explain how Kubernetes turns declared desired state into running containers through its control loops, name the main cluster components, and create a local kind cluster to work in.
takeaways:
  - You tell Kubernetes the state you want; controllers keep comparing it with the actual state and act to close the gap, forever.
  - The API server is the front door and the only component that talks to etcd, where all cluster state is stored.
  - The scheduler picks a node for each new Pod; the kubelet on that node starts its containers through the container runtime.
  - Deleting a Pod that a controller manages doesn't remove it for long, because the controller sees one missing and creates a replacement.
  - Always check which cluster `kubectl` is pointed at with `kubectl config current-context` before changing anything.
further:
  - title: Kubernetes components
    url: https://kubernetes.io/docs/concepts/overview/components/
  - title: Controllers
    url: https://kubernetes.io/docs/concepts/architecture/controller/
  - title: Install and set up kubectl
    url: https://kubernetes.io/docs/tasks/tools/
quiz:
  - q: A Deployment wants 3 replicas. A node crashes and takes one Pod with it. What restores the third Pod?
    options:
      - text: A controller notices that 2 Pods exist where 3 are desired and creates a new one, which the scheduler places on a healthy node.
        why: Correct. The ReplicaSet controller keeps reconciling actual against desired, so it replaces the lost Pod without anyone running a command.
      - text: The kubelet on the crashed node restarts the Pod when the node comes back.
        why: If the node is gone, its kubelet is gone too. Recovery has to come from the control plane.
      - text: Nothing; someone must re-run `kubectl apply`.
        why: Desired state is already stored. Re-applying the same file changes nothing that controllers aren't already enforcing.
      - text: etcd restarts the Pod from its backup.
        why: etcd stores state. It never starts or stops anything.
    answer: 0
  - q: Which component is the only one that reads and writes etcd directly?
    options:
      - text: The scheduler
        why: The scheduler watches and updates Pods through the API server, like every other component.
      - text: The kubelet
        why: Kubelets talk to the API server to learn which Pods to run and to report status.
      - text: kubectl
        why: kubectl is a client of the API server. It never sees etcd.
      - text: The API server
        why: Correct. Everything else goes through it, which is where validation, authentication and authorisation happen.
    answer: 3
  - q: You delete a Pod created by a Deployment with `kubectl delete pod notes-api-7d9c-xk2lp`. What do you see a few seconds later in `kubectl get pods`?
    options:
      - text: One fewer Pod, until you scale the Deployment again.
        why: The Deployment's desired count didn't change, so the shortfall is corrected straight away.
      - text: A new Pod with a different name, created to replace it.
        why: Correct. The ReplicaSet controller sees one missing and creates a replacement. To remove Pods for good, change the Deployment.
      - text: The same Pod, restored with the same name and IP.
        why: Pods are never restored. The replacement is a new Pod with a new name and, usually, a new IP.
      - text: An error, because Deployment Pods can't be deleted.
        why: You can delete them. The controller just won't let the count stay low.
    answer: 1
  - q: Before running `kubectl delete deployment notes-api`, what should you check?
    options:
      - text: That the image still exists in the registry.
        why: Deleting a Deployment doesn't depend on the image. Which cluster you're talking to does matter.
      - text: That etcd has a recent backup.
        why: Good practice for cluster operators, but the immediate risk here is acting on the wrong cluster.
      - text: Which cluster and namespace kubectl is pointed at, with `kubectl config current-context`.
        why: Correct. kubectl acts on whatever context is current. The same command means very different things in kind and in production.
      - text: That the Deployment has fewer than 10 replicas.
        why: Replica count doesn't change whether a delete is safe.
    answer: 2
---

Compose runs your stack on one machine. When that machine dies, so does your service, and nothing brings it back until a person notices. Kubernetes exists for the other case: many machines, containers that must keep running when any one of them fails, and changes rolled out without downtime. To use it well, you need one idea more than any command.

## The control loop

In Kubernetes you don't say "start three containers". You say "there should be three replicas of notes-api", and store that as an object in the cluster. Then a **controller** runs a loop, continuously:

1. **Observe** the actual state: how many notes-api Pods exist and are running?
2. **Compare** it with the desired state in the object.
3. **Act** to close the gap: create a Pod, delete one, replace one.

The loop never finishes. If a node dies and takes a Pod with it, the next pass sees two where three are wanted and creates one. If you change the desired count to five, it creates two more. If someone deletes a Pod by hand, it's replaced within seconds. This is what people mean by **declarative**: you describe the destination, and the system keeps steering towards it.

The thermostat comparison helps. You set 21°C; the thermostat doesn't run a fixed "heat for 20 minutes" script. It measures, compares and switches the heater on or off for as long as it's powered.

## The parts of a cluster

:::figure Every component talks to the API server; controllers and kubelets reconcile state
<svg viewBox="0 0 700 330" role="img" aria-labelledby="t1">
  <title id="t1">kubectl sends objects to the API server, which stores them in etcd. The scheduler and controller manager watch the API server. On each worker node a kubelet watches for Pods assigned to it and starts containers through the container runtime.</title>
  <rect class="d-box" x="20" y="40" width="120" height="50" rx="10"/>
  <text class="d-code" x="80" y="70" text-anchor="middle">kubectl</text>
  <rect class="d-box-primary" x="180" y="20" width="500" height="130" rx="14"/>
  <text class="d-label-muted" x="430" y="42" text-anchor="middle">control plane</text>
  <rect class="d-box-accent" x="200" y="56" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="275" y="86" text-anchor="middle">API server</text>
  <rect class="d-box-warn" x="200" y="112" width="150" height="32" rx="8"/>
  <text class="d-label" x="275" y="133" text-anchor="middle">etcd</text>
  <rect class="d-box" x="380" y="56" width="130" height="50" rx="10"/>
  <text class="d-label" x="445" y="86" text-anchor="middle">scheduler</text>
  <rect class="d-box" x="530" y="56" width="140" height="50" rx="10"/>
  <text class="d-label" x="600" y="80" text-anchor="middle">controller</text>
  <text class="d-label" x="600" y="98" text-anchor="middle">manager</text>
  <path class="d-arrow" d="M140 65 L198 78" marker-end="url(#arrow)"/>
  <path class="d-line" d="M350 81 L380 81"/>
  <path class="d-line" d="M275 106 L275 112"/>
  <path class="d-line" d="M510 72 L530 72"/>
  <rect class="d-box-success" x="120" y="200" width="250" height="110" rx="12"/>
  <text class="d-label-strong" x="245" y="224" text-anchor="middle">node 1</text>
  <text class="d-label" x="245" y="252" text-anchor="middle">kubelet → containerd</text>
  <text class="d-code" x="245" y="282" text-anchor="middle">pod  pod</text>
  <rect class="d-box-success" x="410" y="200" width="250" height="110" rx="12"/>
  <text class="d-label-strong" x="535" y="224" text-anchor="middle">node 2</text>
  <text class="d-label" x="535" y="252" text-anchor="middle">kubelet → containerd</text>
  <text class="d-code" x="535" y="282" text-anchor="middle">pod</text>
  <path class="d-arrow" d="M260 150 L245 198" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M300 150 L520 198" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="420" y="182" text-anchor="middle">watch: Pods for my node</text>
</svg>
:::

- The **API server** is the front door. kubectl, controllers and kubelets all talk to it, and it validates, authenticates and authorises every request.
- **etcd** is a consistent key-value store holding every object. Only the API server talks to it.
- The **scheduler** watches for Pods without a node and picks one, based on free resources, constraints and spreading.
- The **controller manager** runs the built-in controllers: Deployments, ReplicaSets, Jobs, node health, and more.
- On every worker node, the **kubelet** watches for Pods assigned to its node and starts their containers through a **container runtime**, usually containerd. Your Docker-built images run there unchanged, because images follow the OCI standard.

Managed services like Amazon EKS run the control plane for you. You still need to understand it, because every error message you'll read refers to one of these parts.

## A cluster on your laptop

kind ("Kubernetes in Docker") runs a whole cluster inside Docker containers. It's quick to create and quick to throw away, which is exactly what you want for learning:

```bash
kind create cluster --name notes
kubectl config current-context      # kind-notes
kubectl get nodes
kind load docker-image notes-api:1.0.0 --name notes
```

The last command copies your local image into the kind node, so the cluster can run it without a registry. minikube and Docker Desktop's built-in Kubernetes work too; the `kubectl` commands in this course are the same everywhere.

In kind, the control plane itself runs as Pods on the control-plane node. Run `kubectl get pods -n kube-system` and you'll see the API server, etcd, the scheduler and the controller manager listed like any other workload, along with the cluster DNS (CoreDNS) and kube-proxy. On a managed cluster you won't see the control plane there, because the provider runs it out of sight.

## Watch the loop work

Create a Deployment imperatively, once, to see reconciliation with your own eyes:

```bash
kubectl create deployment notes-api --image=notes-api:1.0.0 --replicas=3
kubectl get pods
kubectl delete pod <one-of-the-pod-names>
kubectl get pods --watch
```

Within seconds a new Pod with a new name appears. You didn't ask for it; the controller did its job. Now look at what you created:

```bash
kubectl get deployment notes-api -o yaml
kubectl explain deployment.spec.replicas
kubectl delete deployment notes-api
```

`-o yaml` shows the full object Kubernetes stored, including many defaults you didn't set. `kubectl explain` documents any field from the cluster itself; it's the fastest reference you have. From the next lesson on you'll write these objects as files and apply them, which is how real teams work.

:::mistake The wrong context
kubectl acts on its *current context*. People who work with several clusters eventually run a delete against production while thinking they're in staging. Check with `kubectl config current-context`, put the context in your shell prompt, and switch deliberately with `kubectl config use-context kind-notes`. Some teams give production a separate kubeconfig file entirely.
:::

Next: the objects you just glimpsed, written properly. Pods, ReplicaSets and Deployments.
