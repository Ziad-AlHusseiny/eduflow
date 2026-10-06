---
kind: intro
summary: Explain what a container actually is (an ordinary Linux process with namespaces, cgroups and an image filesystem) and how images and containers relate.
takeaways:
  - A container is a normal Linux process that the kernel isolates with namespaces and limits with cgroups.
  - Containers share the host kernel, which is why they start in milliseconds and why they are a weaker boundary than a virtual machine.
  - An image is a read-only template of filesystem layers plus metadata; a container is one running instance of it with a thin writable layer on top.
  - Anything a container writes to its own filesystem disappears when the container is removed unless you put it in a volume.
further:
  - title: What is a container?
    url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/
  - title: What is an image?
    url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/
  - title: Kubernetes Overview
    url: https://kubernetes.io/docs/concepts/overview/
quiz:
  - q: You run `ps aux` on a Linux host while a container is running a Node.js server. What do you see?
    options:
      - text: Nothing, because the container runs inside its own small virtual machine.
        why: Docker on Linux doesn't start a VM per container. Docker Desktop on macOS and Windows runs one shared Linux VM, but the containers inside it are still plain processes.
      - text: Only a `dockerd` process; the Node.js server is hidden inside it.
        why: The daemon starts containers but doesn't host them. The container's process is its own entry in the host's process table.
      - text: The `node` process, listed like any other process on the host.
        why: Correct. A container is a host process. Namespaces hide the rest of the host from it, not the other way round.
      - text: A copy of the container's whole operating system booting in the background.
        why: Containers don't boot an OS. They reuse the host kernel and start only the command you asked for.
    answer: 2
  - q: Which kernel feature stops a runaway container from using all of the host's memory?
    options:
      - text: Control groups (cgroups), which cap and account for CPU, memory and I/O.
        why: Correct. cgroups enforce resource limits; later in the course Kubernetes limits compile down to exactly these settings.
      - text: The PID namespace, which gives the container its own process tree.
        why: Namespaces control what a process can see, not how much it can use. A process in its own PID namespace can still eat every byte of RAM.
      - text: The image's read-only layers, which can't grow at runtime.
        why: Read-only layers limit what's on disk, not memory use. A process can allocate RAM regardless of how its files are stored.
      - text: The container's writable layer, which is sized to the memory limit.
        why: The writable layer is disk storage for file changes. It has nothing to do with RAM.
    answer: 0
  - q: You start three containers from the image `notes-api:1.0.0`. One of them writes a file to `/tmp/cache.json`. What do the other two see?
    options:
      - text: The new file, because all three share the image's filesystem.
        why: They share the read-only image layers, but each container writes to its own private writable layer.
      - text: The new file after a restart, once Docker syncs the layers.
        why: Docker never syncs writable layers between containers. That's what volumes are for.
      - text: An error, because image filesystems are read-only.
        why: Containers get a writable layer on top of the image, so writes succeed; they're just private and temporary.
      - text: Nothing new; the file exists only in that one container's writable layer.
        why: Correct. Each container is an instance with its own thin writable layer. Remove the container and the file is gone too.
    answer: 3
  - q: Why is a container a weaker security boundary than a virtual machine?
    options:
      - text: Containers can't restrict network access at all.
        why: Network namespaces give each container its own network stack, and you can restrict it further. Networking is not the gap.
      - text: All containers on a host share one kernel, so a kernel exploit can cross between them.
        why: Correct. A VM has its own kernel behind a hypervisor; a container talks straight to the host kernel. That's the price of millisecond start-up.
      - text: Container images can't be signed or verified.
        why: Images can be signed and pinned by digest; that is image supply-chain security, not an isolation boundary.
      - text: Containers always run as root on the host.
        why: Many do by default, which is bad, but you can and should run them as a non-root user. The shared kernel is the structural difference.
    answer: 1
---

At 2:40 one morning a Skylane service started failing health checks on every node at once. The code hadn't changed. The cause was a base library on the build server that had been quietly upgraded, so the binary we shipped no longer matched the one we tested. Containers exist to end that kind of night: you ship the program *and* everything it needs as one artifact, and the artifact you tested is the artifact that runs.

I'm Amara Diallo. I run on-call for Skylane's clusters, and everything in this course is something I've either broken or watched break. We'll work on one service the whole way through.

## The project: notes-api

notes-api is a small HTTP API for notes, written in TypeScript and running on Node.js 24. It stores data in Postgres and exposes four routes: `GET /notes`, `POST /notes`, `GET /healthz` (is the process alive?) and `GET /readyz` (can it reach the database?). It listens on port 3000 and reads its settings from environment variables such as `DATABASE_URL`.

By the end you'll have built its image, run it with Postgres on your laptop, and deployed it to Kubernetes with health checks, autoscaling and a rollback plan.

## A container is a process

There is no "container" object inside the Linux kernel. When you run a container, the runtime starts an ordinary process and wraps it with three things:

- **Namespaces** change what the process can *see*: its own process tree (PID 1 is your app), its own network interfaces, its own hostname, its own view of mounted filesystems.
- **Control groups (cgroups)** limit what it can *use*: CPU time, memory, I/O.
- **An image** supplies its root filesystem: the Node.js binary, your compiled code, `node_modules`, a few system libraries.

:::figure Containers share one kernel; VMs each bring their own
<svg viewBox="0 0 680 300" role="img" aria-labelledby="t1">
  <title id="t1">Left: three virtual machines, each with its own guest kernel on a hypervisor. Right: three containers, each an isolated process, sharing the host kernel directly.</title>
  <text class="d-label-strong" x="170" y="24" text-anchor="middle">Virtual machines</text>
  <text class="d-label-strong" x="510" y="24" text-anchor="middle">Containers</text>
  <rect class="d-box-accent" x="20" y="40" width="92" height="56" rx="8"/>
  <text class="d-label" x="66" y="73" text-anchor="middle">app</text>
  <rect class="d-box-accent" x="124" y="40" width="92" height="56" rx="8"/>
  <text class="d-label" x="170" y="73" text-anchor="middle">app</text>
  <rect class="d-box-accent" x="228" y="40" width="92" height="56" rx="8"/>
  <text class="d-label" x="274" y="73" text-anchor="middle">app</text>
  <rect class="d-box-warn" x="20" y="104" width="92" height="44" rx="8"/>
  <text class="d-label" x="66" y="131" text-anchor="middle">guest OS</text>
  <rect class="d-box-warn" x="124" y="104" width="92" height="44" rx="8"/>
  <text class="d-label" x="170" y="131" text-anchor="middle">guest OS</text>
  <rect class="d-box-warn" x="228" y="104" width="92" height="44" rx="8"/>
  <text class="d-label" x="274" y="131" text-anchor="middle">guest OS</text>
  <rect class="d-box" x="20" y="158" width="300" height="44" rx="8"/>
  <text class="d-label" x="170" y="185" text-anchor="middle">hypervisor</text>
  <rect class="d-box" x="20" y="212" width="300" height="44" rx="8"/>
  <text class="d-label" x="170" y="239" text-anchor="middle">host kernel + hardware</text>
  <rect class="d-box-primary" x="360" y="40" width="92" height="108" rx="8"/>
  <text class="d-label" x="406" y="88" text-anchor="middle">process</text>
  <text class="d-label-muted" x="406" y="108" text-anchor="middle">+ image</text>
  <rect class="d-box-primary" x="464" y="40" width="92" height="108" rx="8"/>
  <text class="d-label" x="510" y="88" text-anchor="middle">process</text>
  <text class="d-label-muted" x="510" y="108" text-anchor="middle">+ image</text>
  <rect class="d-box-primary" x="568" y="40" width="92" height="108" rx="8"/>
  <text class="d-label" x="614" y="88" text-anchor="middle">process</text>
  <text class="d-label-muted" x="614" y="108" text-anchor="middle">+ image</text>
  <rect class="d-box-success" x="360" y="158" width="300" height="44" rx="8"/>
  <text class="d-label" x="510" y="185" text-anchor="middle">namespaces + cgroups</text>
  <rect class="d-box" x="360" y="212" width="300" height="44" rx="8"/>
  <text class="d-label" x="510" y="239" text-anchor="middle">host kernel + hardware</text>
  <text class="d-label-muted" x="170" y="286" text-anchor="middle">seconds to boot, strong isolation</text>
  <text class="d-label-muted" x="510" y="286" text-anchor="middle">milliseconds to start, shared kernel</text>
</svg>
:::

Because there's no guest OS to boot, a container starts as fast as the program inside it. The trade-off is that every container on a host shares one kernel. A VM is a stronger wall; a container is a well-locked door. That's why later lessons insist on non-root users and small images: you shrink what an attacker can do if they get through the door.

On macOS and Windows, Docker Desktop runs one lightweight Linux VM and puts your containers inside it. The model is the same; there's one extra layer underneath.

## Image versus container

An **image** is a read-only, layered snapshot of a filesystem plus metadata: which command to run, which port the app expects, which user to run as. A **container** is a running instance of an image with a thin writable layer on top.

The class-and-object comparison holds up well: one image, many containers. When we scale notes-api to six replicas in Kubernetes, that's one image and six containers. Each container's writable layer is private and disposable, so the rule from day one is: **containers are cattle, data lives elsewhere**. Postgres will keep its files in a volume, never in a container's writable layer.

:::mistake Treating a container like a server
Teams new to containers `docker exec` into a running container, patch a config file and move on. The next deploy replaces the container and the fix vanishes, usually during an incident. Change the image or the configuration you pass in, never the running container.
:::

Next you'll write notes-api's first Dockerfile and turn source code into an image you can run.
