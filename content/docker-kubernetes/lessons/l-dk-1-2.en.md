---
summary: Write a working Dockerfile for notes-api, build it into a tagged image, run it with a published port, and know what each instruction does.
takeaways:
  - A Dockerfile is a recipe of instructions; each `FROM`, `COPY` and `RUN` produces a filesystem layer in the image.
  - The build context is the directory you pass to `docker build`, and `COPY` can only see files inside it.
  - "`EXPOSE` only documents a port; `-p host:container` on `docker run` is what makes it reachable."
  - Write `CMD` in exec form (`["node", "dist/server.js"]`) so your app is PID 1 and receives stop signals.
  - A server inside a container must listen on `0.0.0.0`, not `127.0.0.1`, or published ports can't reach it.
further:
  - title: Dockerfile reference
    url: https://docs.docker.com/reference/dockerfile/
  - title: Writing a Dockerfile
    url: https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/
  - title: Build checks
    url: https://docs.docker.com/build/checks/
quiz:
  - q: You run `docker build -t notes-api:dev .` from the repository root. What does the final `.` mean?
    options:
      - text: Tag the image with the name of the current directory.
        why: The tag comes from `-t`. The trailing argument is about files, not names.
      - text: Use the current directory as the build context, the set of files `COPY` can read.
        why: Correct. Docker sends this directory to the builder; `COPY` paths are relative to it, and nothing outside it is visible.
      - text: Write the finished image into the current directory.
        why: Images go into Docker's local image store, not your working directory. `docker image ls` lists them.
      - text: Look for the Dockerfile in the current directory but take files from `/`.
        why: The context and the Dockerfile location are separate (`-f` sets the Dockerfile), but `COPY` never reads from the host's `/`.
    answer: 1
  - q: The Dockerfile has `EXPOSE 3000`. You run `docker run notes-api:dev` and `curl localhost:3000` on your laptop fails. Why?
    options:
      - text: "`EXPOSE` needs the `tcp` suffix to take effect."
        why: "`tcp` is the default protocol. Adding it changes nothing about reachability."
      - text: The container needs a restart before exposed ports open.
        why: Restarting doesn't publish anything. Ports are published when the container is created.
      - text: Port 3000 is reserved by Docker on the host.
        why: Docker reserves no such port. The problem is that nothing was published.
      - text: "`EXPOSE` is documentation; you still need `-p 3000:3000` to publish the port to the host."
        why: Correct. `-p host:container` creates the actual port mapping. `EXPOSE` tells readers and tools which port the app uses.
    answer: 3
  - q: Which `CMD` lets the Node.js process receive `SIGTERM` directly when the container is stopped?
    options:
      - text: '`CMD ["node", "dist/server.js"]`'
        why: Correct. Exec form runs `node` as PID 1 with no shell in between, so signals go straight to your app.
      - text: "`CMD node dist/server.js`"
        why: Shell form wraps the command in `/bin/sh -c`, and the shell doesn't pass signals on. Docker's build checks flag it for this reason.
      - text: '`CMD ["sh", "-c", "node dist/server.js"]`'
        why: This is exec form, but the program it execs is a shell, so you're back to a shell sitting between Docker and Node.
      - text: "`CMD npm start`"
        why: Shell form plus npm puts two processes between the signal and your server. Run `node` directly.
    answer: 0
  - q: notes-api logs `listening on 127.0.0.1:3000` inside the container. You published `-p 3000:3000`, but every request gets `connection reset`. What's the fix?
    options:
      - text: Publish the port as `-p 127.0.0.1:3000:3000`.
        why: That restricts which host address accepts connections; the app inside still only listens on the container's loopback, which the port mapping can't reach.
      - text: Add `EXPOSE 3000/tcp` to the Dockerfile.
        why: "`EXPOSE` doesn't change where the app listens."
      - text: Make the app listen on `0.0.0.0` so it accepts connections from the container's network interface.
        why: Correct. Published traffic arrives on the container's network interface, not its loopback. Listening on all interfaces fixes it.
      - text: Run the container with `--network host` permanently.
        why: That works around the symptom by dropping network isolation. Fix the listen address instead.
    answer: 2
---

You can describe notes-api's runtime in one sentence: "Node.js 24, our compiled code, our dependencies, start with `node dist/server.js` on port 3000." A Dockerfile is that sentence written so a machine can repeat it exactly, on any laptop or build server, forever.

## The app you're packaging

The repository looks like this:

```text
notes-api/
  package.json
  package-lock.json
  tsconfig.json
  src/
    server.ts
    db.ts
```

`npm run build` compiles `src/` into `dist/` with `tsc`, and `npm start` runs `node dist/server.js`. Here is the part of the server that matters for containers:

```ts title=src/server.ts
import express from 'express';
import { pool } from './db.js';

const app = express();
app.use(express.json());

app.get('/healthz', (_req, res) => res.send('ok'));
app.get('/readyz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.send('ready');
  } catch {
    res.status(503).send('database unreachable');
  }
});
// …notes routes

const port = Number(process.env.PORT ?? 3000);
app.listen(port, '0.0.0.0', () => console.log(`notes-api listening on ${port}`));
```

Note the `'0.0.0.0'`. Hold that thought.

## A first Dockerfile

Create `Dockerfile` (capital D, no extension) at the repository root:

```dockerfile title=Dockerfile
# syntax=docker/dockerfile:1
FROM node:24-slim
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Line by line:

- `# syntax=docker/dockerfile:1` pins the Dockerfile frontend to the latest 1.x, which gives you current features such as build secrets and cache mounts.
- `FROM node:24-slim` starts from the official Node.js 24 image on a trimmed Debian base. Every image starts from another image.
- `WORKDIR /app` creates `/app` if needed and makes it the working directory for every instruction after it, and for the running container.
- `COPY . .` copies the build context into `/app`.
- `RUN npm ci` installs exactly what `package-lock.json` says. Use `ci`, not `install`, in images: it fails if the lockfile and `package.json` disagree instead of quietly rewriting the lockfile.
- `RUN npm run build` compiles TypeScript to `dist/`.
- `EXPOSE 3000` records that the app listens on 3000. It publishes nothing.
- `CMD` is the default command when a container starts.

Why `node:24-slim`? Node.js 24 is a long-term-support line with security fixes into 2028, and the official image is rebuilt whenever Node or Debian ships a patch. The `-slim` variant leaves out compilers, man pages and dozens of packages that the full `node:24` image includes for building native modules. You don't need them to run JavaScript, and every package you don't ship is one the security scanner can't complain about. If a dependency ever needs to compile native code, you'll handle that in a separate build stage in the next section.

This file works, and it has a performance problem you'll fix in the next lesson. Get it running first.

## Build and run

```bash
docker build -t notes-api:dev .
docker run --rm -p 3000:3000 notes-api:dev
```

`-t notes-api:dev` names the image (`repository:tag`). The trailing `.` is the **build context**: the directory Docker hands to the builder. `COPY` can only read files inside it, which is why `COPY ../shared .` fails.

`docker run` creates a container from the image. `--rm` deletes it when it stops, so you don't collect dead containers. `-p 3000:3000` maps port 3000 on your machine to port 3000 in the container. In another terminal:

```bash
curl localhost:3000/healthz
```

You get `ok`. `/readyz` returns 503 because there's no database yet; Compose fixes that in section 3.

## Exec form, and why it matters

`CMD` has two forms. Exec form, `CMD ["node", "dist/server.js"]`, runs `node` directly as PID 1. Shell form, `CMD node dist/server.js`, runs `/bin/sh -c "node dist/server.js"`, and the Dockerfile reference warns that a command started that way won't receive Unix signals. When Docker or Kubernetes asks your app to stop, it sends `SIGTERM` to PID 1. If PID 1 is a shell that doesn't pass it on, your app never hears it, gets killed hard after the timeout, and drops whatever requests it was serving.

`CMD npm start` is the same problem with an extra process in the chain. Run `node` directly.

:::tip Let the builder review you
Run `docker build --check .` to evaluate the Dockerfile against Docker's build checks without building. It flags shell-form `CMD` as `JSONArgsRecommended`, along with mismatched stage names, legacy `KEY value` env syntax and more. It takes a second; add it to CI.
:::

:::mistake Listening on localhost inside the container
Many dev servers default to `127.0.0.1`. Inside a container that's the container's own loopback, and published ports arrive on its network interface instead. The symptom is maddening: the port is mapped, the app logs "listening", and every request gets `connection reset`. Bind to `0.0.0.0`.
:::

## Look at what you built

```bash
docker image ls notes-api
docker image inspect notes-api:dev --format '{{.Config.Cmd}} {{.Config.ExposedPorts}}'
```

`CMD` is only a default. Anything you type after the image name replaces it, which is handy for one-off checks:

```bash
docker run --rm notes-api:dev node --version
docker run --rm notes-api:dev ls dist
```

There's also `ENTRYPOINT`, which fixes the executable and treats `CMD` as its default arguments. Some images use it (you'll meet one in the next section whose entrypoint is `node` itself). For your own app images, a plain exec-form `CMD` is the simplest thing that works, and it keeps overrides like the ones above easy.

The image is several hundred megabytes: Node.js, the Debian base, your dev dependencies (TypeScript included) and your source. Section 2 cuts that down. First, though, every change to `server.ts` currently reinstalls all your dependencies, and that's the next lesson.
