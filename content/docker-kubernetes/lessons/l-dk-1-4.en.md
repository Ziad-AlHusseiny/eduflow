---
summary: Run notes-api in the background with ports, environment variables and resource limits, read its logs, get a shell inside it, and make it shut down cleanly on SIGTERM.
takeaways:
  - "`-p 8080:3000` maps host port 8080 to container port 3000; the left side is your machine, the right side is the app."
  - Pass configuration with `-e` or `--env-file` at run time so one image serves every environment.
  - Containers should log to stdout and stderr; `docker logs` and every orchestrator collect from there.
  - "`docker stop` sends SIGTERM, waits 10 seconds, then sends SIGKILL; exit code 137 means the process was killed."
  - A Node.js process at PID 1 needs its own SIGTERM handler, or it ignores the signal and gets killed mid-request.
further:
  - title: docker container run
    url: https://docs.docker.com/reference/cli/docker/container/run/
  - title: Publishing and exposing ports
    url: https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/
  - title: Process signal events in Node.js
    url: https://nodejs.org/api/process.html#signal-events
quiz:
  - q: You run `docker run -d -p 8080:3000 notes-api:dev`. Which URL reaches the API from your laptop?
    options:
      - text: "`http://localhost:8080`"
        why: Correct. The left side of `-p` is the host port; Docker forwards it to port 3000 inside the container.
      - text: "`http://localhost:3000`"
        why: 3000 is the container's port. Nothing on the host listens there unless you publish it as the host side.
      - text: "`http://notes-api:8080`"
        why: Container names resolve on Docker networks, not on your laptop's DNS, and 8080 isn't the container port anyway.
      - text: Either port works, because Docker maps both directions.
        why: Port mapping is one rule from one host port to one container port.
    answer: 0
  - q: "`docker stop notes` takes exactly ten seconds and `docker ps -a` shows `Exited (137)`. What happened?"
    options:
      - text: The app crashed with an unhandled exception during shutdown.
        why: An unhandled exception normally exits with code 1. 137 is 128 + 9, the signal number of SIGKILL.
      - text: Docker ran out of memory while stopping the container.
        why: 137 can come from the OOM killer, but the exact 10-second delay on `docker stop` points to the stop timeout.
      - text: The app ignored SIGTERM, so after the 10-second grace period Docker sent SIGKILL.
        why: Correct. 137 = 128 + 9 (SIGKILL). A Node process at PID 1 with no SIGTERM handler ignores the signal and waits to be killed.
      - text: The container exited cleanly; 137 is Docker's normal stop code.
        why: A clean exit is 0, or 143 if the process died from an unhandled SIGTERM. 137 means it was killed.
    answer: 2
  - q: Where should notes-api write its request logs inside a container?
    options:
      - text: To `/var/log/notes-api.log`, so they survive restarts.
        why: They don't survive. The writable layer is discarded with the container. And nobody collects files inside containers by default.
      - text: To stdout and stderr, where `docker logs` and Kubernetes collect them.
        why: Correct. The runtime captures the standard streams; log shippers read them from there.
      - text: To a file in a volume, rotated by a cron job in the container.
        why: That's a second process and a second job inside your container. Write to stdout and let the platform handle storage.
      - text: Directly to the logging service over HTTP from the app.
        why: It couples the app to one vendor and loses logs when the network blips. Stdout is the contract every platform supports.
    answer: 1
  - q: A teammate wants to fix a typo in a config file inside the running production container with `docker exec`. What's the problem?
    options:
      - text: "`docker exec` only works on stopped containers."
        why: It's the opposite. `exec` runs a new process inside a running container.
      - text: Files inside containers are always read-only.
        why: The writable layer accepts changes, unless you've set `--read-only`. The change would work, briefly.
      - text: "`docker exec` restarts the container, causing downtime."
        why: "`exec` starts an extra process; it doesn't restart anything."
      - text: The change lives in that container's writable layer and disappears on the next deploy or restart.
        why: Correct. Fix the image or the configuration passed in, then redeploy. Hand edits are invisible to everyone else.
    answer: 3
---

Building an image is half the job; the other half is running it the way production will. Last year a Skylane service dropped a few hundred requests on every deploy. Nothing was wrong with the code. The process ignored the polite "please stop" signal and was killed mid-request ten seconds later. This lesson covers the runtime side, ending with that shutdown.

## Run it in the background

```bash
docker run -d --name notes \
  -p 8080:3000 \
  -e PORT=3000 \
  -e DATABASE_URL=postgres://notes:notes@host.docker.internal:5432/notes \
  --memory 512m --cpus 1 \
  notes-api:dev
```

- `-d` detaches, so the container runs in the background and Docker prints its ID.
- `--name notes` gives it a name you can type instead of the ID.
- `-p 8080:3000` maps **host** port 8080 to **container** port 3000. Read it as "outside:inside". Two containers can both listen on 3000 inside, as long as they're published on different host ports.
- `-e` sets environment variables. Use `--env-file .env.local` when there are many.
- `--memory` and `--cpus` set cgroup limits. If the process needs more memory than that (plus whatever swap Docker allows it on hosts that have swap), the kernel's OOM killer ends it.

`host.docker.internal` resolves to your machine from inside a container on Docker Desktop; on Linux add `--add-host=host.docker.internal:host-gateway`. You'll replace this with a proper Compose network in section 3.

:::why One image, every environment
Configuration comes in at run time, never baked into the image. The image you tested in staging is the same bytes you run in production, with different `-e` values. If you rebuild per environment, you're shipping something you never tested.
:::

## See what's running and what it's saying

```bash
docker ps                      # running containers
docker logs -f notes           # follow stdout/stderr
docker logs --since 10m notes  # recent output only
docker inspect notes --format '{{.State.Status}} {{.NetworkSettings.Ports}}'
```

`docker logs` shows whatever the process wrote to stdout and stderr. That's the contract for containers: **log to the standard streams**, one line per event, and let the platform collect them. Writing to a log file inside the container hides logs from every tool and loses them when the container goes.

To look around inside:

```bash
docker exec -it notes sh
```

`exec` starts an extra process in the running container; `-it` gives you an interactive terminal. It's for looking, not for fixing. In section 2 you'll move to a base image with no shell at all, and you'll learn other ways in.

## Stopping: SIGTERM, then SIGKILL

`docker stop notes` sends `SIGTERM` to PID 1 and waits 10 seconds (change it with `-t`). If the process is still alive, Docker sends `SIGKILL`, which can't be caught. Exit codes tell you which happened:

| Exit code | Meaning |
|---|---|
| 0 | The app exited cleanly by itself |
| 143 | 128 + 15: the process died from SIGTERM without handling it |
| 137 | 128 + 9: killed by SIGKILL (stop timeout or out of memory) |

Linux treats PID 1 specially: a signal the process hasn't registered a handler for is ignored, instead of killing it. Node.js registers no `SIGTERM` handler by default, so `node dist/server.js` as PID 1 ignores `docker stop` and gets killed after 10 seconds. In-flight requests die with it.

Handle the signal: stop accepting connections, finish what's in flight, close the database pool, exit.

```ts title=src/server.ts
const server = app.listen(port, '0.0.0.0', () => console.log(`notes-api listening on ${port}`));

process.on('SIGTERM', () => {
  console.log('SIGTERM received, draining');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  // Safety net: don't hang forever on a stuck keep-alive connection
  setTimeout(() => process.exit(1), 8000).unref();
});
```

Now `docker stop` returns in well under a second and the container exits with 0. This handler matters even more in Kubernetes, which sends the same signal on every deploy, scale-down and node drain.

:::mistake Relying on --init and skipping the handler
`docker run --init` puts a tiny init process at PID 1 that forwards signals and reaps zombie processes. That's useful, but forwarding SIGTERM to an app with no handler only makes it die instantly instead of after 10 seconds. Requests still drop. The handler in your code is what makes shutdown graceful.
:::

## Restart policies and log growth

On a single server without an orchestrator, `--restart unless-stopped` tells Docker to bring the container back after a crash or a host reboot, unless you stopped it yourself. Kubernetes and Compose have their own restart settings, so you'll rarely set this on a laptop, but it's the first thing to check on that one old VM nobody wants to touch.

On long-lived Linux hosts, also watch log volume. The default `json-file` logging driver keeps everything a container prints unless you configure `max-size` and `max-file` in the daemon settings. A chatty container can fill a disk in a weekend; I've been paged for exactly that.

## Clean up

```bash
docker rm -f notes          # stop and remove
docker container prune      # remove all stopped containers
docker image prune          # remove dangling images
docker system df            # what's using disk
```

You can now build, run, observe and stop a container properly. Section 2 turns this image into one you'd be comfortable shipping: smaller, non-root, versioned and scanned.
