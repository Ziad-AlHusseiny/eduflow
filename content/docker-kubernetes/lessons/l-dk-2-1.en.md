---
summary: Split the notes-api Dockerfile into build, dependency and runtime stages so the shipped image holds only compiled code and production dependencies, and keep junk out of the build context with .dockerignore.
takeaways:
  - A multi-stage build uses several `FROM` stages; only the last stage (or the one you `--target`) becomes the image.
  - "`COPY --from=<stage>` pulls specific files out of an earlier stage, so compilers and dev dependencies never reach production."
  - Install production dependencies with `npm ci --omit=dev` in their own stage and copy only `node_modules` and `dist` into the runtime stage.
  - A `.dockerignore` keeps `node_modules`, `.git`, `.env` files and build output out of the context, making builds faster and safer.
further:
  - title: Multi-stage builds
    url: https://docs.docker.com/build/building/multi-stage/
  - title: Build context and .dockerignore
    url: https://docs.docker.com/build/concepts/context/
  - title: "Dockerfile reference: COPY --from"
    url: https://docs.docker.com/reference/dockerfile/#copy---from
quiz:
  - q: In a Dockerfile with stages `build`, `deps` and `runtime` (in that order), what does `docker build -t notes-api:1.0.0 .` produce?
    options:
      - text: Three images, one per stage, all tagged `notes-api:1.0.0`.
        why: A build produces one image. Earlier stages are intermediate and only exist in the build cache.
      - text: An image made from the last stage, `runtime`, containing only what that stage copied in.
        why: Correct. The final stage is the default target. Anything not copied into it is left behind.
      - text: An image made from the first stage, since that's where the build happens.
        why: The first stage is the default only when it's the only one. With several stages the last one wins unless you pass `--target`.
      - text: One image containing the layers of all three stages stacked together.
        why: Stages don't stack. Each `FROM` starts a fresh filesystem; only explicit `COPY --from` moves files across.
    answer: 1
  - q: Why install production dependencies in a separate `deps` stage instead of pruning them in the `build` stage?
    options:
      - text: "`npm ci --omit=dev` only works in a stage named `deps`."
        why: Stage names are arbitrary labels. The flag works in any stage.
      - text: Separate stages are always smaller than one stage.
        why: Stage count alone doesn't change size. What matters is what you copy into the final stage.
      - text: Build stages can't run npm scripts.
        why: Any stage can run any command; the build stage runs `npm run build` itself.
      - text: The build stage needs dev dependencies like TypeScript, while the runtime only needs production ones; a clean `--omit=dev` install gives exactly that set.
        why: Correct. It also caches independently, so changing a dev-only dependency doesn't invalidate the production install.
    answer: 3
  - q: Your build context is 1.2 GB and every build starts with "transferring context" for 40 seconds. What's the most likely fix?
    options:
      - text: Add a `.dockerignore` that excludes `node_modules`, `.git` and build output.
        why: Correct. Those folders are usually most of the context, and none of them should be sent to the builder.
      - text: Use `COPY src ./src` instead of `COPY . .`.
        why: Narrower copies help the cache and image contents, but the whole context is still sent unless you ignore files.
      - text: Move the Dockerfile into a subdirectory.
        why: The context is whatever directory you pass, regardless of where the Dockerfile lives.
      - text: Add `--no-cache` to skip context transfer.
        why: "`--no-cache` disables layer reuse. The context is still transferred."
    answer: 0
  - q: How do you run notes-api's unit tests inside the image's build environment without shipping test tooling?
    options:
      - text: Add `RUN npm test` to the runtime stage.
        why: The runtime stage has no dev dependencies, so the test runner isn't there; and you'd want tests out of the shipped image anyway.
      - text: Copy the test files into the runtime stage and run them with `docker exec`.
        why: That ships tests and their tooling to production, the exact thing multi-stage builds avoid.
      - text: Build only the `build` stage with `--target build` and run the tests in a container from it.
        why: Correct. `--target` stops at the named stage, which has dev dependencies and source, and nothing from it leaks into the runtime image.
      - text: Use a second Dockerfile that copies the runtime image.
        why: The runtime image deliberately lacks dev dependencies, so tests can't run there.
    answer: 2
---

The image from section 1 ships TypeScript, the type definitions, your test runner, your `src/` folder, and every other dev dependency to production. None of it runs. All of it is attack surface, pull time and scanner noise. The fix is to build in one place and ship from another.

## One Dockerfile, several stages

Each `FROM` starts a new **stage** with a fresh filesystem. Name stages with `AS`, and copy files between them with `COPY --from`. Only the last stage becomes the image you tag.

```dockerfile title=Dockerfile
# syntax=docker/dockerfile:1

# 1. Compile TypeScript (needs dev dependencies)
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# 2. Production dependencies only
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# 3. What actually ships
FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

The `runtime` stage gets exactly three things: `package.json`, production `node_modules`, and compiled `dist/`. TypeScript, `src/` and the npm cache stay behind in stages nobody ships.

:::figure Stages build in parallel; the runtime stage copies only what it needs
<svg viewBox="0 0 700 260" role="img" aria-labelledby="t1">
  <title id="t1">The build stage compiles src to dist with all dependencies. The deps stage installs production dependencies only. The runtime stage copies dist from build and node_modules from deps.</title>
  <rect class="d-box-accent" x="20" y="30" width="250" height="90" rx="10"/>
  <text class="d-label-strong" x="145" y="56" text-anchor="middle">build</text>
  <text class="d-code" x="145" y="80" text-anchor="middle">npm ci  (all deps)</text>
  <text class="d-code" x="145" y="102" text-anchor="middle">tsc: src → dist</text>
  <rect class="d-box-accent" x="20" y="150" width="250" height="80" rx="10"/>
  <text class="d-label-strong" x="145" y="178" text-anchor="middle">deps</text>
  <text class="d-code" x="145" y="204" text-anchor="middle">npm ci --omit=dev</text>
  <rect class="d-box-success" x="430" y="70" width="250" height="130" rx="10"/>
  <text class="d-label-strong" x="555" y="98" text-anchor="middle">runtime (shipped)</text>
  <text class="d-code" x="555" y="126" text-anchor="middle">package.json</text>
  <text class="d-code" x="555" y="150" text-anchor="middle">node_modules (prod)</text>
  <text class="d-code" x="555" y="174" text-anchor="middle">dist/</text>
  <path class="d-arrow" d="M270 80 L428 140" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="92" text-anchor="middle">dist/</text>
  <path class="d-arrow" d="M270 190 L428 160" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="200" text-anchor="middle">node_modules</text>
  <text class="d-label-muted" x="145" y="252" text-anchor="middle">left behind: TypeScript, src/, npm cache</text>
</svg>
:::

BuildKit works out the dependency graph between stages. `build` and `deps` don't depend on each other, so they run in parallel, and a stage the target doesn't need is skipped entirely.

On notes-api this took the image down by roughly a third, and the vulnerability scan you'll run later in this section went from dozens of findings in dev tooling to a handful in the runtime. The next lesson shrinks the base itself.

Why copy `package.json` into the runtime at all? notes-api's `package.json` contains `"type": "module"`, which tells Node to treat `.js` files as ES modules. Leave it out and the container fails on start with `SyntaxError: Cannot use import statement outside a module`, which looks like a build bug but is a missing file. If your project uses CommonJS you could skip it, but it costs nothing and keeps `npm` metadata available.

You may see a different pattern: one stage that runs `npm ci`, builds, then runs `npm prune --omit=dev` before copying `node_modules` out. It works, and it saves one install. I prefer the separate `deps` stage because it caches on its own: bumping a dev-only tool like a linter doesn't invalidate the production dependency layer, so that layer is reused across many builds and the runtime image changes less often.

## Using intermediate stages on purpose

Stages are also handy targets. Run the test suite in the environment that has dev dependencies, without touching the shipped image:

```bash
docker build --target build -t notes-api:test .
docker run --rm notes-api:test npm test
```

`--target build` stops at the `build` stage. CI can run this before building the runtime image, and both builds share the cache.

:::mistake Copying the whole build stage
`COPY --from=build /app ./` is the most common multi-stage mistake I see in review. It looks tidy and it ships everything you tried to leave behind: dev dependencies, `src/`, test fixtures, sometimes a `.env` file. Copy named paths, never a whole stage's working directory.
:::

## .dockerignore: control what the builder sees

When you run `docker build .`, the whole directory is sent to the builder as the context, minus anything matched by `.dockerignore`. Without one, your local `node_modules` (hundreds of megabytes, possibly with macOS-compiled native modules), the `.git` folder and any `.env` file with real credentials all travel to the builder. Any `COPY . .` puts them in a layer.

```text title=.dockerignore
node_modules
dist
coverage
.git
.env
.env.*
*.log
Dockerfile
compose*.yaml
```

Three wins at once: the context drops from hundreds of megabytes to a few hundred kilobytes, edits to ignored files no longer bust the cache, and secrets sitting in your working tree can't be copied into an image by accident.

:::why The .env that went public
A team I worked with pushed an image to a public registry with `COPY . .` and no `.dockerignore`. Their `.env` held a production database password. The image was public for about six hours. Rotating the credential took a day of careful work. A ten-line `.dockerignore` would have prevented it.
:::

The syntax is like `.gitignore`: one pattern per line, `*` and `**` wildcards, and `!` to re-include something. Keep it in the root of the build context. If you need one ignored file after all, re-include it below the broad rule, for example `.env.*` followed by `!.env.example`, so a template file can still be copied while real ones can't.

Check what the builder actually received when in doubt: `docker build --progress=plain .` prints the size of the transferred context on its first lines. If that number is in megabytes for a small API, something is missing from `.dockerignore`.

Next you'll swap the base image for a smaller one and stop running as root.
