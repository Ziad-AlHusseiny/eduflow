---
summary: Give Postgres and notes-api real healthchecks, make the API wait for a healthy database and a finished migration with `depends_on` conditions, and keep retry logic in the app anyway.
takeaways:
  - Short-form `depends_on` only waits for the dependency's container to start, not for it to be ready to serve.
  - 'A `healthcheck` tells Docker how to test a container; `condition: service_healthy` makes a dependent service wait for that test to pass.'
  - "`condition: service_completed_successfully` runs one-off jobs such as migrations before the app starts."
  - In exec form each argument is a separate list item; use `CMD-SHELL` when the test is a single shell command string.
  - Startup ordering covers only the first start, so the app must still retry database connections; Kubernetes has no `depends_on` at all.
further:
  - title: Control startup order in Compose
    url: https://docs.docker.com/compose/how-tos/startup-order/
  - title: Compose services reference (healthcheck)
    url: https://docs.docker.com/reference/compose-file/services/#healthcheck
  - title: docker compose up
    url: https://docs.docker.com/reference/cli/docker/compose/up/
quiz:
  - q: "`api` has `depends_on: [db]` in short form. On a cold start the API logs `ECONNREFUSED` once, then works. Why?"
    options:
      - text: The short form is ignored unless the services share a network.
        why: All services in the project share the default network, and the short form isn't ignored. It does exactly what it promises, which is less than people expect.
      - text: Compose starts dependent services in random order.
        why: Order is deterministic; `db` does start first. Starting isn't the same as being ready.
      - text: Short form waits for `db`'s container to start, not for Postgres to accept connections.
        why: 'Correct. Postgres needs a few seconds to initialise. Add a healthcheck and `condition: service_healthy`.'
      - text: The database password is wrong on the first attempt.
        why: A wrong password gives an authentication error, not a refused connection, and it wouldn't fix itself.
    answer: 2
  - q: Which healthcheck correctly tests Postgres readiness in the `db` service?
    options:
      - text: '`test: ["CMD-SHELL", "pg_isready -U notes -d notes"]`'
        why: Correct. `CMD-SHELL` runs the string with the container's shell, and `pg_isready` exits 0 once the server accepts connections.
      - text: '`test: ["CMD", "pg_isready -U notes -d notes"]`'
        why: Exec form treats the whole string as the program name, so Docker looks for a binary literally called `pg_isready -U notes -d notes` and the check always fails.
      - text: '`test: ["CMD", "curl", "-f", "http://localhost:5432"]`'
        why: Postgres doesn't speak HTTP, and the Postgres image doesn't ship `curl`.
      - text: '`test: ["CMD", "ping", "-c", "1", "db"]`'
        why: A ping proves the network works, not that Postgres is accepting queries.
    answer: 0
  - q: A `migrate` service applies schema changes and exits. How should `api` depend on it?
    options:
      - text: "`condition: service_healthy`"
        why: A job that exits never becomes healthy, so `api` would wait for a state that never comes.
      - text: "`condition: service_completed_successfully`"
        why: Correct. Compose waits for `migrate` to exit with code 0, and refuses to start `api` if it fails.
      - text: "`condition: service_started`"
        why: That only waits for the migration to begin, so the API could start against a half-migrated schema.
      - text: "`restart: always` on `migrate`"
        why: That restarts the job forever after it finishes; it doesn't order anything.
    answer: 1
  - q: Your stack uses healthchecks and `service_healthy`. Why should notes-api still retry failed database connections?
    options:
      - text: Healthchecks only run during `docker compose build`.
        why: They run continuously while the container is up, at the configured interval.
      - text: Retries are required for `pg_isready` to succeed.
        why: "`pg_isready` runs inside the `db` container and has nothing to do with the API's connection logic."
      - text: Compose disables `depends_on` after the first minute.
        why: Nothing gets disabled. It's simply a startup-time feature.
      - text: The ordering only applies at startup; the database can restart later, and Kubernetes doesn't order startup at all.
        why: Correct. A resilient app retries with backoff; startup ordering is a convenience on top, not a guarantee.
    answer: 3
---

Every cold start of the notes-api stack had the same flaky first minute: the API started, tried Postgres, got `ECONNREFUSED`, and crashed. The `depends_on: [db]` in the file looked like it should have prevented it. It didn't, because "started" and "ready" are different things, and Compose only knew about the first.

## What depends_on really waits for

The short form says: start `db` before `api`.

```yaml
services:
  api:
    depends_on:
      - db
```

Compose does exactly that: it starts the `db` container and then the `api` container, about a second apart. But Postgres needs several seconds after its process starts to initialise, more on the first run when it creates the database and runs your init scripts. The API connects during that window and is refused.

To wait for *ready*, Compose needs a way to test readiness. That's a healthcheck.

## Healthchecks

A healthcheck is a command Docker runs inside the container on a schedule. Exit code 0 means healthy; anything else counts as a failure.

```yaml title=compose.yaml
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: notes
      POSTGRES_PASSWORD: notes
      POSTGRES_DB: notes
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U notes -d notes"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 30s
      start_interval: 1s
```

`pg_isready` ships with the Postgres image and exits 0 once the server accepts connections. The timing fields:

- `interval`: how often to run the check once the container is running normally.
- `timeout`: how long one check may take before it counts as failed.
- `retries`: consecutive failures before the container is marked `unhealthy`.
- `start_period`: a grace period after start during which failures don't count toward `retries`.
- `start_interval`: how often to check *during* the start period, so a fast start is detected quickly instead of waiting a full `interval`.

`docker compose ps` now shows `(healthy)` or `(unhealthy)` next to the status. When a check fails and you want to know why, the last few results, including their output, are stored on the container:

```bash
docker inspect notes-db-1 --format '{{json .State.Health}}'
```

One thing healthchecks don't do in plain Docker or Compose: they don't restart an unhealthy container. The status is information, used by `depends_on` conditions and by you. Kubernetes is different, as you'll see with liveness probes in section 5, where a failing check does trigger a restart. Knowing which tool acts on a failed check, and which only reports it, matters at 3 a.m.

:::mistake CMD versus CMD-SHELL
`["CMD", "pg_isready -U notes -d notes"]` looks right and always fails. With `CMD`, each list item is one argument, so Docker tries to run a program whose name is the entire string. Either split it, `["CMD", "pg_isready", "-U", "notes", "-d", "notes"]`, or use `CMD-SHELL` with one string. The giveaway is a container that is `unhealthy` forever while the database works perfectly.
:::

## Waiting on conditions

The long form of `depends_on` lets you say what to wait for:

```yaml title=compose.yaml
services:
  migrate:
    image: notes-api:dev
    command: ["node", "dist/migrate.js"]
    environment:
      DATABASE_URL: postgres://notes:notes@db:5432/notes
    depends_on:
      db:
        condition: service_healthy

  api:
    build: .
    image: notes-api:dev
    ports:
      - "8080:3000"
    environment:
      DATABASE_URL: postgres://notes:notes@db:5432/notes
    depends_on:
      db:
        condition: service_healthy
        restart: true
      migrate:
        condition: service_completed_successfully
```

Three conditions exist: `service_started` (the short form's behaviour), `service_healthy`, and `service_completed_successfully`, which waits for a one-off container to exit with code 0. Here the migration runs once Postgres is healthy, and the API starts only after the migration succeeded. If the migration fails, `api` never starts, and you see why in `docker compose logs migrate`. `restart: true` means that if Compose restarts `db` (for example after you change its config), it restarts `api` too.

:::figure Startup order with conditions
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">Timeline: db starts and becomes healthy after its checks pass; then migrate runs and exits with code 0; then api starts.</title>
  <text class="d-label-strong" x="20" y="54">db</text>
  <text class="d-label-strong" x="20" y="114">migrate</text>
  <text class="d-label-strong" x="20" y="174">api</text>
  <rect class="d-box-warn" x="110" y="34" width="170" height="32" rx="6"/>
  <text class="d-label" x="195" y="55" text-anchor="middle">starting</text>
  <rect class="d-box-success" x="280" y="34" width="400" height="32" rx="6"/>
  <text class="d-label" x="480" y="55" text-anchor="middle">healthy</text>
  <rect class="d-box-accent" x="290" y="94" width="150" height="32" rx="6"/>
  <text class="d-label" x="365" y="115" text-anchor="middle">running</text>
  <text class="d-code" x="450" y="115">exit 0</text>
  <rect class="d-box-primary" x="510" y="154" width="170" height="32" rx="6"/>
  <text class="d-label" x="595" y="175" text-anchor="middle">serving</text>
  <path class="d-arrow" d="M282 68 L292 92" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 128 L508 160" marker-end="url(#arrow)"/>
  <path class="d-line d-dashed" d="M110 200 L680 200"/>
  <text class="d-label-muted" x="680" y="216" text-anchor="end">time</text>
</svg>
:::

The API deserves a healthcheck too. The runtime image may be distroless with no `curl`, but it always has Node, and Node 24 has `fetch` built in. On `node:24-slim`, `node` is on the `PATH`; on distroless, call it by its full path, `/nodejs/bin/node`:

```yaml
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 10s
      timeout: 3s
      retries: 3
```

In CI, `docker compose up -d --wait` returns only when every service with a healthcheck is healthy, and fails if one turns unhealthy. That's the right way to start a stack before integration tests, instead of a `sleep 15`.

## Retries still belong in the app

All of this covers the first start. Nothing stops Postgres from restarting at 3 p.m. on a Tuesday, and when you move to Kubernetes in section 4, there's no `depends_on` at all: Pods start in whatever order they're scheduled. So notes-api connects with a retry and backoff, and reports "not ready" on `/readyz` until the database answers. Healthchecks and conditions make the happy path fast; retries make the unhappy path survivable.

:::why Readiness is a theme
"Is it started?" versus "can it do its job?" is the same question you'll answer again with Kubernetes readiness probes in section 5. A Pod that's running but can't reach its database should receive no traffic. Getting the idea right here makes the Kubernetes version feel obvious.
:::

The stack now comes up in the right order every time. The last Compose lesson tidies up configuration and gives you a fast edit-and-reload loop.
