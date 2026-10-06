---
summary: Move notes-api's configuration into env files and Compose secrets, split dev-only settings into an override file and profiles, and get a fast edit loop with `docker compose watch`.
takeaways:
  - The project `.env` file feeds `${VAR}` interpolation in `compose.yaml`; `env_file:` and `environment:` set variables inside containers. They are different mechanisms.
  - "`${VAR:?message}` makes Compose fail fast with a clear message when a required value is missing."
  - "`docker compose config` prints the fully merged and interpolated file, which is the quickest way to debug configuration."
  - "`compose.override.yaml` is merged automatically, so keep shared settings in `compose.yaml` and dev-only ones in the override."
  - "`develop.watch` with `sync` copies edited files into the running container, and `rebuild` rebuilds the image when dependencies change."
further:
  - title: Set environment variables in Compose
    url: https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/
  - title: Use Compose Watch
    url: https://docs.docker.com/compose/how-tos/file-watch/
  - title: Merge Compose files
    url: https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/
  - title: Secrets in Compose
    url: https://docs.docker.com/compose/how-tos/use-secrets/
quiz:
  - q: Your project's `.env` file contains `LOG_LEVEL=debug`. The `api` service has no `environment:` or `env_file:` entries. What is `LOG_LEVEL` inside the container?
    options:
      - text: "`debug`, because Compose loads `.env` into every container."
        why: The project `.env` is for interpolating the Compose file itself. It isn't injected into containers unless you reference it.
      - text: Unset, unless the service passes it with `environment:` or `env_file:`.
        why: 'Correct. Add `LOG_LEVEL: ${LOG_LEVEL}` under `environment:`, or `env_file: .env`, to pass it through.'
      - text: "`debug`, but only after `docker compose restart`."
        why: Restarting doesn't change how `.env` is used. It still only feeds interpolation.
      - text: An error, because `.env` must be named `api.env`.
        why: "`.env` is the conventional name Compose reads for interpolation. No per-service naming is required."
    answer: 1
  - q: "`compose.yaml` contains `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?set it in .env}` and the variable isn't defined anywhere. What happens on `docker compose up`?"
    options:
      - text: Postgres starts with an empty password.
        why: That's what plain `${POSTGRES_PASSWORD}` would do, which is exactly why the `:?` form exists.
      - text: Compose prompts you to type the password.
        why: Compose never prompts for variables.
      - text: The literal text `${POSTGRES_PASSWORD:?set it in .env}` becomes the password.
        why: Compose interpolates the expression; it doesn't pass it through literally.
      - text: Compose refuses to start and prints `set it in .env`.
        why: Correct. `:?` makes the variable required and uses your text as the error message.
    answer: 3
  - q: |
      You edit `src/routes.ts`. With the watch rules below, what does Compose do?
      ```yaml
      develop:
        watch:
          - action: sync
            path: ./src
            target: /app/src
          - action: rebuild
            path: package-lock.json
      ```
    options:
      - text: Rebuilds the image and recreates the container.
        why: Only changes under `package-lock.json` trigger a rebuild. A file under `./src` matches the sync rule.
      - text: Nothing until you run `docker compose up` again.
        why: Watch reacts to file changes while it runs; you don't rerun `up`.
      - text: Copies the changed file to `/app/src` in the running container; the dev server inside picks it up.
        why: Correct. `sync` updates files in place in seconds, with no rebuild.
      - text: Restarts the database, because the API depends on it.
        why: Watch rules only act on the service they're defined in.
    answer: 2
  - q: You want a `pgadmin` service available for local debugging, but it shouldn't start in CI or for teammates who don't need it. What do you use?
    options:
      - text: "`profiles: [tools]` on the service, started with `docker compose --profile tools up`."
        why: Correct. Services with a profile only start when that profile is enabled.
      - text: A comment telling people to start it manually.
        why: Comments don't change behaviour; everyone gets pgadmin on every `up`.
      - text: "`deploy: replicas: 0`"
        why: It's a workaround that obscures intent and still needs editing to turn on. Profiles exist for this.
      - text: A separate Git branch with pgadmin added.
        why: Branches for configuration drift out of date quickly. Profiles keep it in one file.
    answer: 0
---

The notes-api Compose file now works, and it has three problems teams hit in the second week. The database password sits in plain text in a committed file. Dev-only settings like debug ports are mixed in with what CI needs. And every code change means `docker compose up --build` and a thirty-second wait. This lesson fixes all three.

## Two kinds of environment

Compose has two separate mechanisms that both involve "env", and mixing them up causes most configuration confusion.

**Interpolation** fills in `${VAR}` placeholders *in the Compose file itself*. Values come from your shell, then from a `.env` file in the project directory:

```ini title=.env
POSTGRES_PASSWORD=change-me-locally
API_PORT=8080
```

```yaml title=compose.yaml
services:
  api:
    ports:
      - "${API_PORT:-8080}:3000"
  db:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD in .env}
```

`${API_PORT:-8080}` falls back to 8080 if unset. `${POSTGRES_PASSWORD:?…}` makes the value required: if it's missing, Compose stops with your message instead of starting Postgres with an empty password.

**Container environment** is what the process inside sees. It comes from `environment:` and `env_file:` on the service:

```yaml
  api:
    env_file: .env.api
    environment:
      DATABASE_URL: postgres://notes:${POSTGRES_PASSWORD}@db:5432/notes
```

The project `.env` is *not* passed into containers by itself. If a value should reach the app, reference it under `environment:` or list the file under `env_file:`. When the same variable comes from both, `environment:` wins.

For interpolation, a variable set in your shell beats the same one in `.env`, so `API_PORT=9090 docker compose up -d` is a quick one-off override without editing any file. To use a different file entirely, pass `--env-file .env.staging`. Keep the number of these files small; three slightly different env files is how teams end up debugging configuration instead of code.

Commit a `.env.example` with dummy values and add `.env` to `.gitignore`. New teammates copy the example and fill it in.

:::tip See what Compose sees
`docker compose config` prints the final configuration after merging files and interpolating variables. When a value isn't what you expect, run it before anything else. Ten seconds with it has saved me hours of guessing.
:::

## Compose secrets

Environment variables are visible in `docker inspect` and to every process in the container. For passwords, Compose can mount a file instead:

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

The secret appears inside the container at `/run/secrets/db_password`. The Postgres image reads `POSTGRES_PASSWORD_FILE`, and many official images support the same `_FILE` convention. For your own app, read the file at startup. Kubernetes Secrets mounted as files work the same way, so the habit transfers.

## Base file plus override

Compose automatically merges `compose.override.yaml` on top of `compose.yaml` if it exists. Use that split on purpose:

- `compose.yaml`: what every environment needs, CI included.
- `compose.override.yaml`: developer conveniences, like published database ports, debug flags and watch rules.

CI can then run with the base file only: `docker compose -f compose.yaml up -d --wait`. When you pass `-f`, the override isn't loaded automatically.

**Profiles** cover optional services. A pgAdmin container that only some people want gets `profiles: [tools]`, and starts only with `docker compose --profile tools up`.

## Watch mode: a fast edit loop

Rebuilding the image for every edit is slow. Bind-mounting the whole project is fragile: your host's `node_modules` (built for macOS) shadows the container's (built for Linux), and file access across the Docker Desktop VM is slow. **Compose watch** solves both by syncing only the files you choose into the running container.

```yaml title=compose.override.yaml
services:
  api:
    build:
      context: .
      target: build
    command: ["npm", "run", "dev"]
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
        - action: rebuild
          path: package.json
        - action: rebuild
          path: package-lock.json
```

For development, the override builds the `build` stage (which has dev dependencies) and runs `npm run dev`, which in notes-api is `tsx watch src/server.ts`, a TypeScript runner that restarts on changes. Then:

```bash
docker compose up --watch
```

Edit `src/routes.ts` and the file is copied into `/app/src` within a second; `tsx` restarts the server. Change `package-lock.json` and Compose rebuilds the image and replaces the container, because new dependencies need a real install. A third action, `sync+restart`, syncs files and restarts the container, which suits config files the app reads only at startup. `docker compose watch` does the same as `up --watch` with quieter output.

:::mistake Shipping the dev setup
The override runs the `build` stage with npm as PID 1 and a file watcher. That's fine on a laptop and wrong anywhere else. Keep dev-only settings in `compose.override.yaml` and make sure CI and any server deployment use `-f compose.yaml` explicitly, so the production-shaped image is what gets tested.
:::

Section 3 is complete: a reproducible local stack with persistent data, ordered startup, safe configuration and a fast edit loop. Next you'll take the same image to Kubernetes, starting with how Kubernetes thinks.
