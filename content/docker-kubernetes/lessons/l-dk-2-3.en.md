---
summary: Name, version and publish notes-api images so every deploy is traceable, pin images by digest, and build for both amd64 and arm64 so the cluster can run what your laptop built.
takeaways:
  - An image reference is `registry/namespace/repository:tag@digest`; the tag is a movable label, the digest is the content's fingerprint.
  - "`latest` is only the default tag name, not the newest build; deploy explicit versions such as `1.4.0` or a Git SHA."
  - Never push different content under a tag that's already deployed; enable tag immutability where your registry supports it.
  - Pinning by digest (`@sha256:…`) guarantees every node runs the same bytes, for your app and for base images.
  - Build multi-platform images with `docker buildx build --platform linux/amd64,linux/arm64` when developers and servers use different CPUs.
further:
  - title: docker image tag
    url: https://docs.docker.com/reference/cli/docker/image/tag/
  - title: Multi-platform builds
    url: https://docs.docker.com/build/building/multi-platform/
  - title: Images in Kubernetes
    url: https://kubernetes.io/docs/concepts/containers/images/
quiz:
  - q: Two Pods of the same Deployment, both using `notes-api:latest`, behave differently. What's the most likely explanation?
    options:
      - text: Kubernetes randomly picks between cached image versions.
        why: Nothing random happens. Each node pulled whatever the tag pointed to at the time it pulled.
      - text: "`latest` always resolves to the newest image on every container start."
        why: It resolves to whatever the tag points to when the node pulls. A node with a cached copy may never pull again.
      - text: The tag was re-pushed with new content, and the two nodes pulled it at different times.
        why: Correct. Tags are mutable, so the same name meant different bytes on different nodes. Use versioned tags or digests.
      - text: One of the Pods is running a corrupted image.
        why: Registries verify layers by digest, so corruption fails the pull instead of running quietly.
    answer: 2
  - q: What does a digest such as `sha256:3f1c…` identify?
    options:
      - text: The date and time the image was built.
        why: Build time is metadata inside the image config, not what the digest is.
      - text: The exact image content; any change to the image produces a different digest.
        why: Correct. It's a hash of the manifest, which in turn lists layer hashes. Same digest, same bytes, everywhere.
      - text: The Git commit the image was built from.
        why: A Git SHA is a fine *tag*, but the digest is computed from the image itself.
      - text: The registry account that pushed the image.
        why: The digest is independent of who pushed it or where it's stored.
    answer: 1
  - q: A developer builds notes-api on an Apple Silicon laptop and pushes it. On the amd64 cluster the Pod logs `exec format error`. What's the fix?
    options:
      - text: Add `EXPOSE` for the cluster's architecture.
        why: "`EXPOSE` documents ports; it can't change the CPU architecture of the binaries."
      - text: Switch the base image to Alpine.
        why: Alpine images also come per architecture. The image built on the laptop is still arm64.
      - text: Set `imagePullPolicy` to `Always` on the Deployment.
        why: Pulling again fetches the same arm64-only image.
      - text: Build with `docker buildx build --platform linux/amd64,linux/arm64` (ideally in CI) so the image index contains both.
        why: Correct. The laptop built only arm64. A multi-platform build pushes one tag whose index points at a manifest per architecture.
    answer: 3
  - q: Which tagging scheme gives the best traceability for notes-api releases?
    options:
      - text: A semantic version plus a Git SHA tag, for example `1.4.0` and `sha-9f2c1ab`, pushed for the same build.
        why: Correct. The version is what people talk about; the SHA tells you exactly which commit to read when something breaks.
      - text: Only `latest`, re-pushed on every merge to `main`.
        why: You lose any way to tell which build is running, or to roll back to a specific one by name.
      - text: The build date, such as `2026-10-05`.
        why: Two builds on one day collide, and a date doesn't point to the code that produced it.
      - text: The developer's name, such as `amara-test`.
        why: Fine for a throwaway experiment, useless for knowing what runs in production.
    answer: 0
---

At 11 p.m. on a release night, two Pods of the same service gave different answers to the same request. Both were running `api:latest`. Someone had re-pushed `latest` in the afternoon, and one node had pulled the new image while the other was still using its cached copy. We spent an hour proving the code was fine before anyone looked at the image. Names are part of your deployment, so make them precise.

## Anatomy of an image reference

```text
ghcr.io/skylane/notes-api:1.4.0@sha256:3f1c9e…
└──┬──┘ └──┬──┘ └───┬───┘ └─┬─┘ └─────┬─────┘
registry  namespace  repo    tag      digest
```

- The **registry** is the server that stores images: Docker Hub (the default when you leave it out), GitHub Container Registry (`ghcr.io`), Amazon ECR, Google Artifact Registry and so on.
- The **tag** is a human-friendly label. It's a pointer, and pointers can move.
- The **digest** is a SHA-256 hash of the image manifest (or, for a multi-platform image, of its image index), which in turn lists the hash of every layer. Change one byte anywhere and the digest changes. It can't be moved.

`notes-api:latest` isn't special. `latest` is just the tag Docker uses when you don't specify one. It doesn't mean "newest", and nothing updates it unless someone pushes it.

## A tagging scheme that holds up

For each build that might be deployed, push two tags for the same image:

- A **version** people can talk about: `1.4.0`.
- The **commit** it came from: `sha-9f2c1ab`.

When someone reports a bug in "1.4.0", the SHA tag takes you straight to the code. And the rule that prevents the release-night incident: **never push different content under a tag that's already deployed.** If you fix something, that's `1.4.1`. Many registries can enforce this; Amazon ECR, for example, has a tag immutability setting that rejects a push to an existing tag.

Build once, promote many times. The image that passes staging should be the exact image that reaches production, identified by the same digest. Don't rebuild from the same commit for production "to be safe": a rebuild can pull a newer base image or a different transitive dependency, and then production runs something no one tested. Promotion is a change to which digest each environment's manifest points at, not a new build.

Keep the registry tidy too. Retention rules that delete untagged images and old SHA tags after a few months keep storage costs down, but exclude anything a manifest still references, or your next rollback will fail on a missing image.

## Publish to a registry

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u amara-skylane --password-stdin

GIT_SHA=$(git rev-parse --short HEAD)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/skylane/notes-api:1.4.0 \
  -t ghcr.io/skylane/notes-api:sha-$GIT_SHA \
  --push .

docker buildx imagetools inspect ghcr.io/skylane/notes-api:1.4.0
```

`--password-stdin` keeps the token out of your shell history. In CI, use the platform's short-lived token rather than a personal one. The last command prints the image's digest and the platforms it contains.

## Multi-platform images

Your laptop may be arm64 (Apple Silicon) while the cluster's nodes are amd64, or the reverse. An image built for one CPU architecture fails on the other with the terse `exec format error`. A multi-platform build fixes that: `--platform linux/amd64,linux/arm64` builds both variants and pushes an **image index**, a small list that maps each platform to its own manifest. When a node pulls `notes-api:1.4.0`, the runtime picks the manifest for its own architecture.

:::figure One tag points to an index; each node pulls the manifest for its CPU
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">The tag 1.4.0 points to an image index digest. The index lists an amd64 manifest and an arm64 manifest, each listing its own layers.</title>
  <rect class="d-box-warn" x="20" y="100" width="130" height="50" rx="10"/>
  <text class="d-code" x="85" y="130" text-anchor="middle">tag 1.4.0</text>
  <path class="d-arrow" d="M150 125 L208 125" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="210" y="90" width="170" height="70" rx="10"/>
  <text class="d-label-strong" x="295" y="118" text-anchor="middle">image index</text>
  <text class="d-code" x="295" y="142" text-anchor="middle">sha256:3f1c…</text>
  <path class="d-arrow" d="M380 110 L458 62" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M380 140 L458 188" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="460" y="30" width="220" height="64" rx="10"/>
  <text class="d-label" x="570" y="56" text-anchor="middle">linux/amd64 manifest</text>
  <text class="d-label-muted" x="570" y="80" text-anchor="middle">layers for x86 nodes</text>
  <rect class="d-box-accent" x="460" y="156" width="220" height="64" rx="10"/>
  <text class="d-label" x="570" y="182" text-anchor="middle">linux/arm64 manifest</text>
  <text class="d-label-muted" x="570" y="206" text-anchor="middle">layers for ARM nodes</text>
  <text class="d-label-muted" x="85" y="175" text-anchor="middle">movable</text>
  <text class="d-label-muted" x="295" y="185" text-anchor="middle">fixed</text>
</svg>
:::

Building for a foreign architecture runs under emulation, which can be slow for heavy `npm ci` steps. CI runners with native arm64 and amd64 machines are faster when builds grow. To keep multi-platform images locally, Docker needs the containerd image store, which is the default on new Docker Desktop installs; check that it's turned on in older setups.

## Pin by digest

A digest guarantees every node runs identical bytes, whatever happens to the tag later. You can deploy with both, and the digest wins:

```yaml
image: ghcr.io/skylane/notes-api:1.4.0@sha256:3f1c9e…
```

The tag stays in the reference for humans; the runtime pulls by digest. Do the same for base images in your Dockerfile, so a rebuild next month doesn't silently pick up a different `node:24-slim`:

```dockerfile
FROM node:24-slim@sha256:<digest-from-imagetools-inspect> AS build
```

Pinning trades automatic patches for predictability, so pair it with a bot such as Dependabot or Renovate that opens a pull request when a new base digest is published. You get updates, reviewed and tested, instead of surprises.

:::mistake Pinning and forgetting
A digest-pinned base never gets security fixes on its own. I've seen pinned images run for a year on a base with a known critical CVE because nobody owned the update. Pin *and* automate the bump, or don't pin.
:::

Your image is now named, versioned and published. Before anyone deploys it, you should know what's inside it, which is the next lesson.
