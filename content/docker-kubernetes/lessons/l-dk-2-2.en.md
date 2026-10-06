---
summary: Choose a base image for notes-api by weighing slim, Alpine and distroless, run the app as a non-root user, and lock the container down further at run time.
takeaways:
  - Every package in the base image is something you patch, scan and defend, so start from the smallest base your app really runs on.
  - "`node:24-slim` is a solid default; Alpine uses musl instead of glibc, and distroless removes the shell and package manager entirely."
  - Official Node.js images include a `node` user (UID 1000); switch to it with `USER node` after the steps that need root.
  - Leave application files owned by root and read-only to the app user, so a compromised process can't rewrite its own code.
  - Add runtime hardening such as `--read-only`, `--cap-drop ALL` and `no-new-privileges`; Kubernetes has the same controls in `securityContext`.
further:
  - title: "Dockerfile reference: USER"
    url: https://docs.docker.com/reference/dockerfile/#user
  - title: Docker Engine security
    url: https://docs.docker.com/engine/security/
  - title: Building best practices
    url: https://docs.docker.com/build/building/best-practices/
quiz:
  - q: notes-api depends on a package with a native addon. After switching the base from `node:24-slim` to `node:24-alpine`, the container crashes on start with an error loading a `.node` file. What's the likely cause?
    options:
      - text: Alpine images don't support Node.js 24.
        why: Official `node:24-alpine` images exist and run Node 24 fine. The issue is the C library, not Node's version.
      - text: The image needs `EXPOSE` for native modules to load.
        why: "`EXPOSE` is documentation about ports. It has nothing to do with loading shared libraries."
      - text: Alpine runs as non-root by default, which blocks native modules.
        why: Alpine-based Node images run as root by default, like the Debian ones. Permissions aren't the problem here.
      - text: The addon was compiled against glibc, and Alpine uses musl, so the binary can't load.
        why: Correct. Prebuilt binaries often target glibc. Rebuild the addon inside an Alpine build stage or stay on a glibc base like slim.
    answer: 3
  - q: Which change makes notes-api run as a non-root user in the official Node.js image?
    options:
      - text: Add `USER node` in the runtime stage after the steps that need root.
        why: Correct. The official image creates `node` (UID 1000). Instructions and the container process after `USER` run as that user.
      - text: Add `RUN su node` before `CMD`.
        why: "`su` in a `RUN` step only affects that one build step's shell. The container still starts as root."
      - text: Add `ENV USER=node`.
        why: That sets an environment variable named `USER`. It doesn't change which user the process runs as.
      - text: Publish the container on a port above 1024.
        why: The port number doesn't change the user. The container would still run as root.
    answer: 0
  - q: You move notes-api to `gcr.io/distroless/nodejs24-debian13:nonroot`. Which `CMD` is correct?
    options:
      - text: '`CMD ["node", "dist/server.js"]`'
        why: The distroless Node image's entrypoint is already `node`, so this would run `node node dist/server.js` and fail to find a module named `node`.
      - text: "`CMD node dist/server.js`"
        why: Shell form needs `/bin/sh`, and distroless images have no shell, so the container can't start.
      - text: '`CMD ["dist/server.js"]`'
        why: Correct. The entrypoint is `node`, so `CMD` supplies the script path as its argument.
      - text: '`CMD ["npm", "start"]`'
        why: Distroless Node images ship the Node runtime, not npm. And you'd want to avoid npm as PID 1 anyway.
    answer: 2
  - q: Why leave notes-api's `dist/` files owned by root even though the process runs as `node`?
    options:
      - text: Node.js refuses to execute files owned by the current user.
        why: Node happily runs files you own. This is about limiting damage, not a runtime rule.
      - text: If an attacker gets code execution as `node`, they can read the code but can't modify it or plant files in it.
        why: Correct. Read-only for the app user shrinks what an exploit can change. Give write access only to directories the app must write.
      - text: Root-owned files are smaller in the image.
        why: File ownership is a few bytes of metadata either way.
      - text: Kubernetes rejects images whose files are owned by a non-root user.
        why: Kubernetes has no such rule. It can require the *process* to be non-root, which you're already doing.
    answer: 1
---

In 2024 a Skylane image failed a customer's security review with 140 findings. Fewer than five were in code we wrote or called. The rest were in packages the base image happened to include: an XML library, an image converter, a mail transfer agent. None of them ran, and all of them were our problem. Your base image is a dependency you inherit wholesale, so choose it deliberately.

## Choosing a base

| Base | What's inside | Good for | Watch out for |
|---|---|---|---|
| `node:24` | Full Debian, compilers, many libraries | Build stages that compile native addons | Large; lots to scan |
| `node:24-slim` | Minimal Debian + Node | Most runtime images | Still has a shell and `apt` |
| `node:24-alpine` | Alpine Linux (musl) + Node | Very small images | musl vs glibc differences |
| `gcr.io/distroless/nodejs24-debian13` | Node and its runtime libraries only | Hardened production images | No shell, no package manager |

My default for a team new to containers is **slim**: small, glibc-based so prebuilt native modules work, and you can still `docker exec` into it with a shell when something's on fire.

**Alpine** gets you smaller images, but it uses the musl C library instead of glibc. Prebuilt native addons compiled for glibc fail to load, and subtle differences in DNS resolution and memory allocation have bitten teams in production. Choose it when you've tested your full dependency tree on it, not because the number on the tag page is lower.

**Distroless** images contain Node.js and the libraries it needs, and nothing else: no shell, no `apt`, no `curl`. An attacker who gets code execution finds very little to work with, and the scanner has very little to report. The cost is debuggability. You can't `exec` a shell into it, and you'll learn the Kubernetes way around that, `kubectl debug`, in the last lesson of this course.

## Stop running as root

By default, the process in a container runs as root, UID 0. Namespaces limit what that root can see, but it's still root as far as the kernel is concerned. Combined with a kernel bug or a misconfigured mount, that is how a container compromise becomes a host compromise. Running as an unprivileged user turns many of those bugs into dead ends.

The official Node.js images ship a `node` user with UID 1000. Switch to it in the runtime stage, after anything that needs root:

```dockerfile title=Dockerfile
# …build and deps stages from the previous lesson

FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Note what's *not* there: no `--chown=node:node` on the copies. The files stay owned by root and readable by everyone, so the app can read its code but can't change it. If an attacker finds a remote-code-execution bug, they can't rewrite `dist/server.js` to persist. Give the app write access only where it genuinely needs to write, and prefer `/tmp` or a mounted volume for that.

:::mistake Fixing a permission error with USER root
The app needs to write a temp file, gets `EACCES`, and someone adds `USER root` at the end of the Dockerfile "for now". It ships, and stays. Fix the actual need instead: create the one directory the app writes to and hand it to the app user, or point the app at `/tmp`.

```dockerfile
RUN mkdir -p /app/tmp && chown node:node /app/tmp
USER node
```
:::

## The distroless version

Here's the same runtime stage on distroless. The `:nonroot` tag runs as UID 65532 out of the box, and the image's entrypoint is already `node`, so `CMD` lists only the script:

```dockerfile title=Dockerfile
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["dist/server.js"]
```

The build and deps stages still use `node:24-slim`; only the shipped stage changes. Keep the Node major version the same across stages; otherwise native modules compiled against one Node version's ABI end up loading in another and fail at startup.

You can confirm who the container will run as without starting it:

```bash
docker image inspect notes-api:1.0.0 --format '{{.Config.User}}'
```

## Lock it down at run time

The image sets defaults; the runtime can tighten them further:

```bash
docker run --rm -p 8080:3000 \
  --read-only --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  notes-api:1.0.0
```

`--read-only` makes the container's root filesystem immutable, with `/tmp` as a small writable in-memory mount. `--cap-drop ALL` removes the Linux capabilities that root-ish operations need. `no-new-privileges` stops a process from gaining privileges through setuid binaries. In section 5 you'll set the same things in a Kubernetes `securityContext`, where they become policy for every Pod.

:::tip Ports below 1024
Keep apps on high ports like 3000 or 8080 inside the container. You can still publish them on 80 or 443 at the edge; the mapping happens outside the process, so the app never needs privileges for it.
:::

Your image is now small and unprivileged. Next: how to name it so that what you deploy is exactly what you tested.
