---
summary: Order Dockerfile instructions so dependency installs stay cached, read the build cache from `docker history` and build output, and keep caches warm with cache mounts and CI cache exports.
takeaways:
  - Each instruction's cache key depends on the instruction and, for `COPY`, on the checksum of the files copied; one miss rebuilds every later step.
  - Copy `package.json` and `package-lock.json` first, run `npm ci`, then copy the source, so code edits don't reinstall dependencies.
  - Put instructions that change rarely near the top and instructions that change on every commit near the bottom.
  - Run `apt-get update` and `apt-get install` in the same `RUN` so the package index is never stale.
  - A cache mount (`RUN --mount=type=cache`) keeps npm's download cache between builds even when the layer itself must rebuild.
further:
  - title: Docker build cache
    url: https://docs.docker.com/build/cache/
  - title: Optimize cache usage in builds
    url: https://docs.docker.com/build/cache/optimize/
  - title: Cache storage backends
    url: https://docs.docker.com/build/cache/backends/
quiz:
  - q: |
      In this Dockerfile you edit only `src/routes.ts` and rebuild. Which steps run again?
      ```dockerfile
      FROM node:24-slim
      WORKDIR /app
      COPY package.json package-lock.json ./
      RUN npm ci
      COPY . .
      RUN npm run build
      ```
    options:
      - text: Every step, because the build context changed.
        why: The context changing doesn't invalidate everything. Each step is checked on its own until the first miss.
      - text: Only `RUN npm run build`, because that's the step that compiles TypeScript.
        why: "`COPY . .` copies `src/routes.ts`, so its checksum changes and it misses first; the build step then reruns because it comes after a miss."
      - text: "`RUN npm ci` and everything after it."
        why: "`npm ci` sits after a `COPY` of only the two package files, which didn't change, so it's still a cache hit."
      - text: "`COPY . .` and `RUN npm run build`; the dependency install stays cached."
        why: Correct. The first changed input is at `COPY . .`, so it and every later step rerun. The expensive install above it is reused.
    answer: 3
  - q: Why does `RUN apt-get update` on its own line, followed by `RUN apt-get install -y curl`, cause trouble months later?
    options:
      - text: Docker refuses to cache `apt-get` commands.
        why: Docker caches `RUN` steps by their text, apt or not. That's exactly the problem here.
      - text: The `update` layer stays cached with an old package index, so a later change to the install line fetches stale or missing versions.
        why: Correct. The cache key is the command text, which never changes, so the index is from the day the cache was created. Combine them in one `RUN`.
      - text: Two `RUN` instructions double the image size.
        why: Extra layers add a little metadata, not double the size. The real issue is a stale cached index.
      - text: "`apt-get update` needs root and the second `RUN` drops privileges."
        why: Both run as the same user unless a `USER` instruction comes between them.
    answer: 1
  - q: Your CI runner starts with an empty Docker cache on every job, so every build is cold. What helps most?
    options:
      - text: Add more `RUN` instructions so there are more layers to cache.
        why: More layers don't help when there's no cache to read from in the first place.
      - text: Switch from `npm ci` to `npm install` because it's faster.
        why: "`npm install` may rewrite the lockfile and doesn't fix the empty cache. Keep `npm ci` for reproducibility."
      - text: Export and import the build cache, for example with `--cache-to` and `--cache-from` pointing at a registry.
        why: Correct. Cache backends let fresh runners reuse layers built by earlier jobs.
      - text: Use `docker build --no-cache` so the result is predictable.
        why: That throws away caching entirely, which is the opposite of what you want for speed.
    answer: 2
  - q: What does `RUN --mount=type=cache,target=/root/.npm npm ci` give you that layer caching doesn't?
    options:
      - text: npm's download cache persists between builds, so even when this step must rerun, packages come from local disk instead of the network.
        why: Correct. A layer cache is all-or-nothing; a cache mount survives a layer miss and isn't stored in the image.
      - text: The `node_modules` folder is mounted from your laptop into the image.
        why: Cache mounts live in the builder, not on your host, and they cache npm's download store, not `node_modules`.
      - text: The installed packages are excluded from the final image to save space.
        why: "`node_modules` is still written into the layer. Only the mounted `/root/.npm` directory stays out of the image."
      - text: The step is never rerun, even if the lockfile changes.
        why: The step reruns whenever its inputs change. The mount only makes the rerun faster.
    answer: 0
---

A Skylane team once asked me why their CI builds had crept from forty seconds to eight minutes. Their Dockerfile looked like the one you wrote last lesson: `COPY . .` and then `npm ci`. Every commit changed some file, so every build reinstalled 900 packages from the internet. One reordering brought it back to forty seconds.

## Layers and cache keys

Each `FROM`, `COPY`, `ADD` and `RUN` produces a layer. When you rebuild, BuildKit walks the Dockerfile top to bottom and asks of each step: "have I run exactly this before, with exactly these inputs?"

- For `RUN`, the key is the command text plus the layer it runs on.
- For `COPY` and `ADD`, the key includes a checksum of the files being copied.

The first step whose key doesn't match is a **cache miss**, and from then on *every* later step rebuilds, because each one runs on top of a layer that's now different. Cache hits are a prefix of the file. Order is everything.

:::figure One changed file invalidates its layer and every layer above it
<svg viewBox="0 0 680 290" role="img" aria-labelledby="t1">
  <title id="t1">Two layer stacks. With COPY . . before npm ci, a source edit misses at COPY and reruns npm ci. With package files copied first, npm ci stays cached and only the final COPY and build rerun.</title>
  <text class="d-label-strong" x="165" y="22" text-anchor="middle">COPY . . first</text>
  <text class="d-label-strong" x="505" y="22" text-anchor="middle">package files first</text>
  <rect class="d-box-success" x="40" y="236" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="259" text-anchor="middle">FROM node:24-slim</text>
  <rect class="d-box-success" x="40" y="194" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="217" text-anchor="middle">WORKDIR /app</text>
  <rect class="d-box-warn" x="40" y="152" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="175" text-anchor="middle">COPY . .   (src changed)</text>
  <rect class="d-box-warn" x="40" y="110" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="133" text-anchor="middle">RUN npm ci   (~70 s)</text>
  <rect class="d-box-warn" x="40" y="68" width="250" height="36" rx="6"/>
  <text class="d-code" x="165" y="91" text-anchor="middle">RUN npm run build</text>
  <rect class="d-box-success" x="380" y="236" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="259" text-anchor="middle">FROM node:24-slim</text>
  <rect class="d-box-success" x="380" y="194" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="217" text-anchor="middle">COPY package*.json</text>
  <rect class="d-box-success" x="380" y="152" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="175" text-anchor="middle">RUN npm ci   (cached)</text>
  <rect class="d-box-warn" x="380" y="110" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="133" text-anchor="middle">COPY . .   (src changed)</text>
  <rect class="d-box-warn" x="380" y="68" width="250" height="36" rx="6"/>
  <text class="d-code" x="505" y="91" text-anchor="middle">RUN npm run build</text>
  <rect class="d-box-success" x="200" y="34" width="14" height="14" rx="3"/>
  <text class="d-label-muted" x="220" y="46">cache hit</text>
  <rect class="d-box-warn" x="320" y="34" width="14" height="14" rx="3"/>
  <text class="d-label-muted" x="340" y="46">rebuilt</text>
</svg>
:::

## Reorder for the cache

Dependencies change weekly; source changes on every commit. So copy the dependency manifests on their own, install, and only then copy the rest:

```dockerfile title=Dockerfile
# syntax=docker/dockerfile:1
FROM node:24-slim
WORKDIR /app

# Changes rarely: only when dependencies change
COPY package.json package-lock.json ./
RUN npm ci

# Changes on every commit
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Edit `src/server.ts` and rebuild. The output shows which steps were reused:

```text
 => CACHED [2/6] WORKDIR /app
 => CACHED [3/6] COPY package.json package-lock.json ./
 => CACHED [4/6] RUN npm ci
 => [5/6] COPY . .
 => [6/6] RUN npm run build
```

The general rule: **sort instructions from least to most frequently changing.** System packages, then language dependencies, then your code, then anything derived from your code.

`docker history notes-api:dev` lists the layers with their size and the instruction that created them. Use it when an image is bigger than you expect; the culprit is usually one fat layer.

The same rule applies to build arguments. A line like `ARG GIT_SHA` near the top, used in a later `RUN` or `LABEL`, gives every `RUN` step below it a new input on every commit, because build arguments are visible to every later `RUN` as environment variables. Declare such values as late as possible, right before the one step that uses them.

`COPY` keys on file *contents*, not timestamps, so a fresh `git clone` on a build server hits the same cache as your laptop as long as the bytes match. That's also why a committed, up-to-date `package-lock.json` matters: it is the input that decides whether the expensive install is reused.

## System packages: one RUN, cleaned up

If you need OS packages, install them in a single `RUN`:

```dockerfile
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
```

`--no-install-recommends` skips optional extras, and deleting the package lists in the *same* step keeps them out of the layer. Deleting them in a later `RUN` doesn't shrink anything: the earlier layer still contains them.

:::mistake Splitting apt-get update from apt-get install
With `RUN apt-get update` on its own line, that layer is cached by its text, which never changes. Months later you add a package to the install line; the install reruns against the months-old cached index and fails with "Unable to locate package" or installs an outdated version. Always chain them.
:::

## Cache mounts: faster misses

Sometimes the install *must* rerun because you added a dependency. A cache mount keeps npm's download cache in the builder between builds, without putting it in the image:

```dockerfile
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
```

`npm ci` still deletes and recreates `node_modules`, but the tarballs come from local disk instead of the registry. On notes-api that turns a 70-second reinstall into about 15.

## Caches in CI

Your laptop keeps its cache between builds. Most CI runners start empty, so every build is cold however well you order the file. Export the cache somewhere durable and import it on the next run:

```bash
docker buildx build \
  --cache-from type=registry,ref=ghcr.io/skylane/notes-api:buildcache \
  --cache-to type=registry,ref=ghcr.io/skylane/notes-api:buildcache,mode=max \
  -t ghcr.io/skylane/notes-api:dev .
```

`mode=max` stores intermediate layers too, which matters once you have several build stages. GitHub Actions users can use `type=gha` instead of a registry.

:::tip Measure, don't guess
Run the build twice with `--progress=plain` and compare. If a step you expected to be `CACHED` isn't, look at the instruction right above it: that's the one whose inputs changed.
:::

Builds are fast now. Next you'll get comfortable with the running side: ports, environment variables, logs, and what really happens when a container stops.
