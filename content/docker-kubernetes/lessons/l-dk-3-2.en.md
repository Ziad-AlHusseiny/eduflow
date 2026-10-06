---
summary: Keep Postgres data across restarts with a named volume, seed the database with a bind-mounted init script, and know which Compose commands keep or destroy your data.
takeaways:
  - Named volumes are managed by Docker and outlive containers; use them for database files.
  - Bind mounts map a host path into a container; use them for files you edit on the host, such as seed scripts, and mount them read-only when you can.
  - "`docker compose down` keeps named volumes; `docker compose down -v` deletes them along with all their data."
  - Scripts in `/docker-entrypoint-initdb.d` run only when the Postgres data directory is empty, which means on the very first start.
  - A database's on-disk format is tied to its major version; upgrading Postgres across majors needs a dump and restore or `pg_upgrade`, not a new tag.
further:
  - title: Volumes
    url: https://docs.docker.com/engine/storage/volumes/
  - title: Bind mounts
    url: https://docs.docker.com/engine/storage/bind-mounts/
  - title: Compose volumes reference
    url: https://docs.docker.com/reference/compose-file/volumes/
quiz:
  - q: You run `docker compose down` and then `docker compose up -d`. The `db` service mounts the named volume `pgdata`. What happens to your notes?
    options:
      - text: They're gone, because `down` removes containers.
        why: The containers are removed, but the named volume is not. Postgres finds its data again on the next start.
      - text: They're gone unless you ran `docker compose stop` first.
        why: "`stop` versus `down` affects containers, not named volumes. Both leave `pgdata` alone."
      - text: They're restored from the image's initial snapshot.
        why: Images don't snapshot data. The volume is what holds it.
      - text: They're still there; `down` doesn't delete named volumes unless you add `-v`.
        why: Correct. Only `docker compose down -v` (or `docker volume rm`) deletes the volume.
    answer: 3
  - q: You edit `db/init/001-schema.sql` to add a column, run `docker compose up -d`, and the column doesn't appear. Why?
    options:
      - text: Bind mounts are only read when the image is built.
        why: Bind mounts are live; the container sees your edit immediately. The issue is when Postgres reads the folder.
      - text: Init scripts only run when the data directory is empty, and your volume already has data.
        why: Correct. The entrypoint skips `/docker-entrypoint-initdb.d` on an initialised database. Use a migration, or wipe the dev volume on purpose.
      - text: The file must be named `init.sql` exactly.
        why: Any `.sql`, `.sql.gz` or `.sh` file in that folder runs, in name order.
      - text: The `:ro` flag stops Postgres from reading the file.
        why: "`:ro` stops the container from *writing*. Reading is fine."
    answer: 1
  - q: Which mount should hold Postgres's data in a development stack you want to survive restarts?
    options:
      - text: A named volume such as `pgdata:/var/lib/postgresql/data`.
        why: Correct. Docker manages it, it outlives containers, and it avoids host file-permission and performance surprises.
      - text: A `tmpfs` mount at `/var/lib/postgresql/data`.
        why: tmpfs lives in memory and vanishes when the container stops. Fine for throwaway tests, wrong here.
      - text: The container's writable layer, which is the default.
        why: That layer is deleted with the container, so `docker compose down` loses everything.
      - text: A bind mount to your `src/` folder.
        why: Mixing database files into your source tree invites accidental commits and permission errors.
    answer: 0
  - q: You change the `db` image from `postgres:17` to `postgres:18` and keep the same `pgdata` volume. What should you expect?
    options:
      - text: Postgres upgrades the files in place on startup.
        why: Postgres doesn't convert data directories across major versions on its own.
      - text: Nothing changes, because volumes are version-independent.
        why: The volume stores Postgres's on-disk format, which is specific to the major version.
      - text: The new version refuses the old data directory (and 18's image also expects a different mount path); you need a dump-and-restore or `pg_upgrade`.
        why: Correct. Major upgrades are a migration. In development, dump, wipe the volume, restore; in production, plan it.
      - text: The volume is automatically renamed to `pgdata-18`.
        why: Compose never renames volumes. It mounts exactly what the file names.
    answer: 2
---

The week we added Compose to a Skylane project, a developer ran `docker compose down -v` to "clean up" before a demo. It cleaned up three days of carefully entered test data. Containers are disposable by design, so anything you want to keep must live outside them, and you need to know exactly which command throws it away.

## Named volumes for database files

Add a volume to the `db` service and declare it at the top level:

```yaml title=compose.yaml
services:
  # api: …as before
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: notes
      POSTGRES_PASSWORD: notes
      POSTGRES_DB: notes
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

A **named volume** is storage that Docker creates and manages. Compose prefixes it with the project name, so this one is `notes_pgdata`. It isn't part of any container, so removing and recreating `db` leaves the data in place:

```bash
docker compose down        # containers and network removed, pgdata kept
docker compose up -d       # notes are still there
docker volume ls           # notes_pgdata
docker volume inspect notes_pgdata
```

Named volumes are the right default for database files. Docker sets ownership correctly for the container, you don't get host filesystem quirks, and on Docker Desktop they're much faster than bind mounts because they live inside the Linux VM.

:::mistake down -v as a cleanup habit
`docker compose down -v` removes the stack *and* every named volume it declares. People learn it as "the full reset" and type it from muscle memory. Use plain `down` by default, and keep `-v` for the moments you really want an empty database. If your dev data is precious, back it up first:

```bash
docker compose exec db pg_dump -U notes notes > backup.sql
```
:::

Restoring is the same pipe in the other direction: `docker compose exec -T db psql -U notes notes < backup.sql`. The `-T` flag turns off the pseudo-terminal so the file can be streamed in. It's worth trying once on a quiet afternoon, so the first time you restore isn't the day you need to.

## Bind mounts for files you edit

A **bind mount** maps a path on your machine into the container. Edits on either side show up on the other immediately. That's what you want for files that live in your repository, like a schema script:

```yaml
  db:
    image: postgres:17
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d:ro
```

The Postgres image runs every `.sql` and `.sh` file in `/docker-entrypoint-initdb.d`, in name order, **only when the data directory is empty**. On the very first `up`, `db/init/001-schema.sql` creates the `notes` table. On every later start, the folder is ignored, because the volume already holds an initialised database. When you change the schema after that, write a migration that the app runs, or deliberately wipe the dev volume.

The `:ro` suffix makes the mount read-only inside the container. Give containers the least access that works.

Bind mounts have two rough edges. On Linux, files are owned by the host user's UID, which may not match the user inside the container, so writes fail with `EACCES`. On macOS and Windows, file access crosses the VM boundary and is slower, which is why heavy folders like `node_modules` should never be bind-mounted from the host. You'll use a better tool for live code editing, Compose watch, in lesson 3.4.

## tmpfs for scratch data

A `tmpfs` mount lives in memory and disappears when the container stops. It's useful for scratch files you never want on disk, or for a throwaway test database where speed matters more than survival:

```yaml
  db-test:
    image: postgres:17
    tmpfs:
      - /var/lib/postgresql/data
```

## Volumes and database versions

A volume stores the database's on-disk format, which belongs to one major version. If you bump `postgres:17` to `postgres:18` and keep the same volume, the new server refuses to start on the old files. Postgres 18's image also moved its default data location: it expects a single mount at `/var/lib/postgresql` (and keeps data in a version-named folder below it) rather than at `.../data`. Its entrypoint exits with an error explaining this if it finds data, or a mount, at the old path. Read the image's release notes before bumping a major version.

:::tip Treat major upgrades as migrations
In development: dump, bump the image, remove the old volume, start fresh, restore the dump. In production you'd plan the same thing with `pg_upgrade` or a managed database's upgrade tooling, and a rollback path. Either way, it's never just a tag change.
:::

## Which mount for which job

| Need | Use |
|---|---|
| Database files that survive restarts | Named volume |
| Seed scripts or config from the repo | Bind mount, `:ro` |
| Fast, disposable scratch space | `tmpfs` |
| Your source code during development | Compose watch (lesson 3.4) |

Your data now outlives your containers. But start the stack from cold and you may see the API fail its first few requests: it starts before Postgres is ready to accept connections. Startup order is next.
