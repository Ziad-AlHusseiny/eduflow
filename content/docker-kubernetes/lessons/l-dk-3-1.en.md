---
summary: Describe notes-api and Postgres in one compose.yaml, start and inspect the stack with `docker compose`, and connect services by name over Compose's default network.
takeaways:
  - "A `compose.yaml` declares services, networks and volumes; `docker compose up` creates whatever is missing and leaves the rest alone."
  - Compose v2 is the `docker compose` plugin; the top-level `version:` key is obsolete and should be removed.
  - Every service joins the project's default network and is reachable by its service name, so the API connects to `db:5432`, not `localhost`.
  - Publish only the ports you need from the host; a database that only the API talks to needs no `ports:` entry at all.
further:
  - title: How Compose works
    url: https://docs.docker.com/compose/intro/compose-application-model/
  - title: Networking in Compose
    url: https://docs.docker.com/compose/how-tos/networking/
  - title: Compose file reference
    url: https://docs.docker.com/reference/compose-file/
quiz:
  - q: Inside the `api` container, which `DATABASE_URL` host reaches the Postgres service named `db`?
    options:
      - text: "`db`, the service name, which Compose's network DNS resolves to the database container."
        why: Correct. Services on the same Compose network find each other by service name.
      - text: "`localhost`, because both containers run on the same machine."
        why: Each container has its own network namespace. `localhost` inside `api` is the API container itself, where nothing listens on 5432.
      - text: "`host.docker.internal`, which always points at other containers."
        why: That name points at your host machine. It only works if the database port is published there, and it couples the app to your laptop.
      - text: The database container's IP address from `docker inspect`.
        why: It works until the container is recreated and gets a new IP. Names are stable; IPs aren't.
    answer: 0
  - q: 'You add `version: "3.8"` at the top of `compose.yaml`. What does current Docker Compose do with it?'
    options:
      - text: Switches to the 3.8 file format rules.
        why: Compose v2 implements the single Compose Specification and no longer selects behaviour by version.
      - text: Fails, because version keys are no longer allowed.
        why: It doesn't fail. It warns that the attribute is obsolete and ignores it.
      - text: Ignores it and prints a warning that `version` is obsolete.
        why: Correct. Delete the line; it does nothing.
      - text: Downloads the matching Compose release.
        why: Compose never fetches itself based on the file. Your installed `docker compose` plugin is what runs.
    answer: 2
  - q: Postgres in your Compose stack is only used by `api`. Which `ports:` setting should `db` have?
    options:
      - text: '`"5432:5432"`, so the API can reach it.'
        why: The API reaches it over the Compose network without any published port. Publishing exposes it on every host interface.
      - text: '`"0.0.0.0:5432:5432"`, to be explicit about listening everywhere.'
        why: That's the same as the default and puts your database on the office Wi-Fi with a development password.
      - text: '`"5432"`, which publishes it on a random host port.'
        why: Still reachable from the host network, just on a less obvious port.
      - text: None at all; add `"127.0.0.1:5432:5432"` only if you need a local GUI client.
        why: Correct. Container-to-container traffic doesn't need published ports, and loopback-only publishing keeps it off the network.
    answer: 3
  - q: You change only the `api` service's environment in `compose.yaml` and run `docker compose up -d`. What happens to the running `db` container?
    options:
      - text: It's recreated too, because the file changed.
        why: Compose compares each service's configuration separately. `db` didn't change, so it isn't touched.
      - text: It keeps running untouched; Compose only recreates services whose configuration changed.
        why: Correct. `up` reconciles each service against the file and leaves unchanged ones alone.
      - text: It's stopped and needs a separate `docker compose start db`.
        why: "`up` doesn't stop services that are already in the desired state."
      - text: It's paused while `api` restarts, then resumed.
        why: Compose doesn't pause dependencies during a recreate.
    answer: 1
---

notes-api needs Postgres. You could start both with two `docker run` commands, a hand-made network and a page of flags, and then explain it all again to the next person who joins the team. Compose replaces that with one file in the repository that describes the whole stack, and one command that makes it real.

## The first compose.yaml

Create `compose.yaml` next to the Dockerfile:

```yaml title=compose.yaml
name: notes

services:
  api:
    build: .
    image: notes-api:dev
    ports:
      - "8080:3000"
    environment:
      PORT: "3000"
      DATABASE_URL: postgres://notes:notes@db:5432/notes

  db:
    image: postgres:17
    environment:
      POSTGRES_USER: notes
      POSTGRES_PASSWORD: notes
      POSTGRES_DB: notes
```

Two services. `api` is built from the Dockerfile in this directory and tagged `notes-api:dev`; `db` uses the official Postgres 17 image, whose entrypoint creates the user and database from those three variables on first start. `name: notes` sets the project name, which prefixes everything Compose creates.

When a service has both `build:` and `image:`, Compose builds from the Dockerfile and tags the result with the `image:` name. That gives the local image a predictable name you can also run by hand, instead of the default name Compose would generate from the project and service names.

There's no `version:` line. Compose v2 implements the Compose Specification, and if you copy an old file that starts with `version: "3.8"`, Compose ignores it and warns that the attribute is obsolete. Delete it.

The command is `docker compose`, with a space. That's Compose v2, a Docker CLI plugin. The old Python `docker-compose` with a hyphen has been retired for years, and tutorials that use it are out of date in other ways too.

## Run the stack

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api
curl localhost:8080/readyz
```

`up` builds the image if needed, creates a network, starts both containers and returns. `--build` forces a rebuild so code changes are picked up. `/readyz` now answers `ready`, because the API can reach the database.

`docker compose ps` shows the containers Compose created, named after the project, the service and a number: `notes-api-1` and `notes-db-1`. The number exists because a service can run several identical containers. Every command takes service names, not container names, so you rarely type the full name.

A few more you'll use daily:

```bash
docker compose exec db psql -U notes -d notes   # SQL shell in the db container
docker compose restart api                       # restart one service
docker compose down                              # stop and remove containers and network
```

`up` is **declarative**: it compares the file to what's running and changes only the difference. Edit the API's environment and run `up -d` again, and Compose recreates `api` while `db` keeps running. Kubernetes works on the same idea at a much larger scale; you'll meet it in section 4.

## How the services find each other

Compose creates a network for the project, `notes_default`, and attaches every service to it. On that network, Docker's DNS resolves each **service name** to its container. That's why `DATABASE_URL` says `@db:5432`.

:::figure Only the API is published; the database is reachable by name inside the project network
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">Your laptop reaches the api container through published port 8080 mapped to 3000. Inside the notes_default network, api connects to db on port 5432 by service name. The database has no published port.</title>
  <rect class="d-box" x="20" y="80" width="140" height="70" rx="10"/>
  <text class="d-label-strong" x="90" y="110" text-anchor="middle">your laptop</text>
  <text class="d-code" x="90" y="134" text-anchor="middle">localhost:8080</text>
  <rect class="d-box-primary" x="210" y="20" width="470" height="190" rx="14"/>
  <text class="d-label-muted" x="445" y="44" text-anchor="middle">network: notes_default</text>
  <rect class="d-box-accent" x="250" y="80" width="160" height="70" rx="10"/>
  <text class="d-label-strong" x="330" y="110" text-anchor="middle">api</text>
  <text class="d-code" x="330" y="134" text-anchor="middle">:3000</text>
  <rect class="d-box-success" x="490" y="80" width="160" height="70" rx="10"/>
  <text class="d-label-strong" x="570" y="110" text-anchor="middle">db</text>
  <text class="d-code" x="570" y="134" text-anchor="middle">:5432</text>
  <path class="d-arrow" d="M160 115 L248 115" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="204" y="104" text-anchor="middle">-p 8080:3000</text>
  <path class="d-arrow" d="M410 115 L488 115" marker-end="url(#arrow)"/>
  <text class="d-code" x="449" y="104" text-anchor="middle">db:5432</text>
  <text class="d-label-muted" x="570" y="180" text-anchor="middle">no published port</text>
</svg>
:::

Notice that `db` has no `ports:` entry. The API reaches it over the project network; nothing on your laptop or your office network can. If you want to point a desktop SQL client at it, publish it on loopback only: `"127.0.0.1:5432:5432"`.

:::mistake Using localhost between containers
`postgres://…@localhost:5432` is the most common Compose bug I see. Inside the `api` container, `localhost` means the API container itself, and nothing listens on 5432 there. The error is `ECONNREFUSED 127.0.0.1:5432`. Use the service name.
:::

## Splitting networks when it matters

For bigger stacks you can declare networks and attach each service only where it belongs. A database on a `backend` network can't be reached by a web front end that only joins `frontend`:

```yaml
services:
  web:
    networks: [frontend]
  api:
    networks: [frontend, backend]
  db:
    networks: [backend]

networks:
  frontend:
  backend:
```

For notes-api, the default network is enough. Reach for this when a stack has components that should never talk to each other.

## Where Compose fits

Compose is excellent for three jobs: local development, integration tests in CI (start the stack, run the tests, tear it down), and small services that live on a single host. What it doesn't do is spread containers across machines, move them when a machine dies, or roll out a new version gradually while watching health checks. Those are an orchestrator's jobs, and they're what Kubernetes does in section 4. The habits you build here carry straight over: declare the desired state in a file, let a tool make it so, and connect services by name.

One problem remains. Run `docker compose down`, then `up` again, and every note is gone: Postgres stored its data in the container's writable layer, which `down` deleted. The next lesson gives the database somewhere permanent to live.
