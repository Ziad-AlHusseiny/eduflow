---
summary: Scan notes-api images for known vulnerabilities with Docker Scout, triage what you find, and use BuildKit secret mounts so tokens needed at build time never land in an image layer.
takeaways:
  - "`docker scout cves` lists known CVEs per package; `--only-severity critical,high --exit-code` turns it into a CI gate."
  - Fix base-image findings first by updating or switching the base; `docker scout recommendations` suggests candidates.
  - Anything passed with `ARG` or `ENV`, or written to a file in a `RUN` step, is recoverable from the image, even if a later step deletes it.
  - "`RUN --mount=type=secret` exposes a secret to one build step without writing it into any layer."
  - Runtime secrets such as database passwords are injected when the container starts, never built into the image.
further:
  - title: Docker Scout quickstart
    url: https://docs.docker.com/scout/quickstart/
  - title: Build secrets
    url: https://docs.docker.com/build/building/secrets/
  - title: docker scout cves
    url: https://docs.docker.com/reference/cli/docker/scout/cves/
quiz:
  - q: A scan of `notes-api:1.4.0` reports 30 CVEs, 27 of them in Debian packages from the base image. What's the most effective first step?
    options:
      - text: Suppress the base-image findings, since you didn't write that code.
        why: You ship that code, so you own its risk. Suppression without analysis hides real exposure.
      - text: Rebuild on an updated or smaller base image, then rescan.
        why: Correct. Most base findings disappear with a patched base or a slimmer one like distroless. One change fixes dozens of findings.
      - text: Patch each Debian package with `apt-get upgrade` in the runtime stage.
        why: It makes builds unpredictable and still leaves you maintaining the OS by hand. Fix the base image itself.
      - text: Ignore it until a customer asks.
        why: Known, fixable CVEs in shipped images are exactly what attackers scan for.
    answer: 1
  - q: |
      This build step needs an npm token. What's wrong with it?
      ```dockerfile
      ARG NPM_TOKEN
      RUN echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" > .npmrc \
       && npm ci && rm .npmrc
      ```
    options:
      - text: Nothing; the `.npmrc` file is deleted in the same step, so the token never persists.
        why: The file is gone, but build arguments are recorded in the image's build history, so the token is still recoverable.
      - text: "`ARG` values can't be used inside `RUN`."
        why: They can; that's what makes this pattern tempting.
      - text: The token must be passed with `ENV` instead of `ARG`.
        why: "`ENV` is worse: it's stored in the image config and set in every running container."
      - text: The token is recorded with the build arguments and can be read from the image's history; use a secret mount instead.
        why: Correct. Docker's own docs warn that `ARG` and `ENV` are not for secrets. A secret mount exists only during that one step.
    answer: 3
  - q: What does this line give the `npm ci` step? `RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci`
    options:
      - text: A temporary file at `/root/.npmrc` containing the secret, visible only during this step and absent from the layer.
        why: Correct. The mount appears for the command and disappears afterwards; nothing about its content is stored in the image.
      - text: An environment variable named `npmrc` set for every later step.
        why: This form mounts a file at `target`. Secret mounts never carry over to later steps.
      - text: A copy of `.npmrc` baked into the image under `/root`.
        why: That's what `COPY` would do. A secret mount is never written into a layer.
      - text: Nothing, unless the image also runs as root.
        why: The mount works for whichever user runs the step; the target path here just matches root's home directory.
    answer: 0
  - q: Where should notes-api's production database password come from?
    options:
      - text: A `.env` file copied into the image during the build.
        why: That bakes the password into every copy of the image, in every registry and cache it reaches.
      - text: A build argument, so each environment's image gets its own password.
        why: Build arguments are recorded in image history, and per-environment images break "test what you ship".
      - text: Injected at run time, for example from a Kubernetes Secret or Compose secret, never stored in the image.
        why: Correct. The same image runs everywhere; each environment supplies its own credentials when the container starts.
      - text: Hard-coded in `dist/config.js` and protected by running as non-root.
        why: A non-root user can still read its own code, and so can anyone who pulls the image.
    answer: 2
---

The worst incident on my record was not a crash. A build step needed a token for a private npm registry, so someone passed it as a build argument. The image went to a registry with broad read access, and months later a routine audit found the token sitting in the image metadata, valid the whole time. This lesson is about what's inside your images, the parts you didn't write and the parts you didn't mean to include.

## Scan before you ship

Every package in your image, from Debian's `libssl` to npm's `express`, has a public history of vulnerabilities (CVEs). A scanner reads the image's package inventory and matches it against those databases. Docker Scout is built into the Docker CLI:

```bash
docker scout quickview notes-api:1.4.0
docker scout cves --only-severity critical,high notes-api:1.4.0
docker scout recommendations notes-api:1.4.0
```

`quickview` gives a one-screen summary: vulnerability counts for your image, for its base image, and for a newer version of that base if one exists. `cves` lists each finding with the package, the installed version and the version that fixes it. `recommendations` suggests base image tags with fewer known vulnerabilities. Trivy and Grype are popular open-source scanners that do the same job; pick one and use it everywhere.

## Triage in a sensible order

A long list of findings is not a to-do list. Work through it like this:

1. **Base image findings first.** If most findings come from OS packages, update to a freshly patched base or move to a smaller one. The switch to distroless in lesson 2.2 removes most of these in one step.
2. **Fixable app dependencies next.** If a fixed version exists, bump it in `package.json`, run `npm ci`, rebuild.
3. **Unfixable findings get a decision, not silence.** Write down why the code path isn't reachable, or what mitigates it, and set a date to look again.

Then make it a gate so regressions can't sneak in:

```bash
docker scout cves --only-severity critical,high --exit-code notes-api:1.4.0
```

With `--exit-code`, the command fails when it finds vulnerabilities at those severities, so your CI job fails before the push. While you're in CI, ask the builder for supply-chain metadata too: `docker buildx build --sbom=true --provenance=mode=max …` attaches a software bill of materials and build provenance to the image, which makes the next audit a lookup instead of an investigation.

:::why Why scan on a schedule, not only on build
New CVEs are published every day against packages that haven't changed. An image that scanned clean at release can have a critical finding next month. Rescan what's deployed, weekly at least, and rebuild on a fresh base when it matters.
:::

## How secrets leak into images

Images remember more than you'd think. Three common leaks:

- **`ENV API_KEY=…`** is stored in the image config and set in every container. `docker image inspect` shows it.
- **`ARG NPM_TOKEN`** used in a `RUN` step is recorded in the image's build history. `docker history --no-trunc` can reveal it.
- **A file written and later deleted** (`COPY .npmrc` then `RUN rm .npmrc`) still exists in the earlier layer. Anyone with the image can extract that layer.

Docker's build checks warn about the first two (`SecretsUsedInArgOrEnv`) when the variable name looks like a secret. Take the warning seriously.

## BuildKit secret mounts

The right tool is a **secret mount**: the secret is made available to a single `RUN` step as a file (or an environment variable) and never written to a layer. notes-api's build needs a token for a private package, so:

```dockerfile title=Dockerfile
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    --mount=type=cache,target=/root/.npm \
    npm ci
```

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t notes-api:1.4.0 .
```

During that `RUN`, npm finds its config at `/root/.npmrc`. Before and after, the file doesn't exist, and nothing about it is stored in the image or the build cache. Without a `target`, secrets are mounted at `/run/secrets/<id>`. If a tool reads a token from an environment variable instead, mount it as one with `RUN --mount=type=secret,id=npm_token,env=NPM_TOKEN npm ci` and pass `--secret id=npm_token,env=NPM_TOKEN` on the command line, which reads the value from your shell's own `NPM_TOKEN`.

:::mistake "It's only the build stage, it doesn't ship"
Multi-stage builds do keep the build stage out of the final image. But build stages get pushed too: as cache exports with `mode=max`, as test images from `--target build`, as debugging tags. A token in any layer of any stage is a token in your registry. Use secret mounts in every stage.
:::

## Runtime secrets are not the image's job

The database password notes-api uses in production has no business in the image at all. It arrives when the container starts: from an environment variable in Compose, from a Kubernetes Secret, or from your cloud's secret manager. You'll wire up both of the first two in the next sections. The image stays identical across environments; only the injected configuration changes.

Section 2 is done: your image is lean, unprivileged, traceable and clean. Next you'll give it a database to talk to, with Docker Compose.
