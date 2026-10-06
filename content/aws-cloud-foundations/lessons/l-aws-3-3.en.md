---
summary: Choose between Amazon RDS and Amazon DynamoDB from a workload's access patterns, and set each one up with backups, encryption and private access from the start.
takeaways:
  - Amazon RDS runs a relational engine such as PostgreSQL for you, handling patching, backups and Multi-AZ failover, while you own the schema, queries and connections.
  - Amazon DynamoDB is a serverless key-value and document database where you design the keys around the questions you will ask.
  - RDS bills mostly per instance-hour, whether busy or idle; DynamoDB on-demand bills per request and per gigabyte stored.
  - Use a DynamoDB Query on keys for hot paths, because a Scan reads and bills the whole table.
  - Many real systems use both, relational data in RDS and high-volume simple lookups in DynamoDB.
further:
  - title: What is Amazon RDS?
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html
  - title: What is Amazon DynamoDB?
    url: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html
  - title: DynamoDB throughput capacity (on-demand and provisioned)
    url: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html
  - title: Configuring and managing a Multi-AZ deployment for Amazon RDS
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html
quiz:
  - q: Lantern's treasurer wants ad-hoc reports such as "events per venue per month, with organiser names", and the questions change every quarter. Which database fits?
    options:
      - text: DynamoDB, because it is serverless and scales automatically.
        why: Scaling is not the problem here. DynamoDB answers questions you designed keys for; new ad-hoc joins mean new indexes or exports each time.
      - text: RDS for PostgreSQL, because SQL joins and aggregates answer new questions without redesigning the data.
        why: Correct. Relational databases shine when the questions are varied and change over time.
      - text: S3 Standard, because reports are files.
        why: The report output can live in S3, but S3 is not a database and cannot join or aggregate rows on its own.
    answer: 1
  - q: The RSVP table's partition key is `eventId` and sort key is `email`. Which call returns every RSVP for one event efficiently?
    options:
      - text: A Scan with a filter on `eventId`.
        why: A Scan reads every item in the table and applies the filter afterwards, so you pay for reading the whole table.
      - text: A GetItem with only `eventId`.
        why: GetItem needs the full primary key, partition key and sort key, and returns a single item.
      - text: A Query with the key condition `eventId = :e`.
        why: Correct. A Query reads only the items under that partition key, so cost grows with the RSVPs for that event, not the table.
    answer: 2
  - q: Which RDS setting protects Lantern's events database from the loss of one Availability Zone?
    options:
      - text: A Multi-AZ deployment, which keeps a standby in another AZ and fails over automatically.
        why: Correct. RDS replicates to the standby synchronously and switches over when the primary's AZ has a problem.
      - text: Automated backups with a seven-day retention period.
        why: Backups let you restore to a point in time, but restoring creates a new instance and takes a while. They are not automatic failover.
      - text: A larger instance class.
        why: More CPU and memory help with load, but a bigger instance in one AZ still goes down with that AZ.
      - text: Storage encryption.
        why: Encryption protects data at rest from being read. It does nothing for availability.
    answer: 0
---

Lantern's old server had one PostgreSQL database for everything: events, venues, organisers and every RSVP. During the festival spike, RSVP writes queued up behind a slow report query and the whole site stalled. On AWS you can give each kind of data the database that suits it. The two you will meet first are **Amazon RDS** and **Amazon DynamoDB**, and they differ in almost every way that matters.

## Amazon RDS: your SQL database, run for you

**Amazon Relational Database Service** runs a relational engine on infrastructure AWS manages. Engines include PostgreSQL, MySQL, MariaDB, Oracle, SQL Server and Db2, plus **Amazon Aurora**, AWS's own MySQL- and PostgreSQL-compatible engine.

AWS takes on the chores Lantern used to do at 2 a.m.: provisioning, OS and engine patching in a maintenance window you choose, **automated backups** with point-in-time recovery, and **Multi-AZ** deployments with a synchronous standby in another Availability Zone that takes over automatically. You still own the schema, indexes, queries, database users, the instance size, and who can connect.

Here is how Lantern creates its events database, with the safe choices spelled out:

```bash
aws rds create-db-instance \
  --db-instance-identifier lantern-events \
  --engine postgres --db-instance-class db.t4g.micro \
  --allocated-storage 20 --storage-encrypted \
  --master-username lantern_admin --manage-master-user-password \
  --backup-retention-period 7 --multi-az \
  --no-publicly-accessible
```

`--manage-master-user-password` stores the admin password in AWS Secrets Manager instead of your shell history. `--no-publicly-accessible` keeps the database off the internet; next lesson puts it in a private subnet. And because Lantern's existing app speaks SQL, migrating is a `pg_dump` and a restore, with the queries unchanged:

```sql
SELECT v.name, date_trunc('month', e.starts_at) AS month, count(*) AS events
FROM events e
JOIN venues v ON v.id = e.venue_id
GROUP BY v.name, month
ORDER BY month DESC, events DESC;
```

**How RDS bills:** per **instance-hour** (with Savings Plans or reserved instances for steady use), plus storage per GB-month, backups beyond a free allowance, and data transfer. A Multi-AZ deployment roughly doubles the instance cost because there are two instances. Crucially, the instance bills **all month whether busy or idle**. Aurora Serverless v2 can scale capacity with load and pause when idle, which suits spiky or development databases.

## Amazon DynamoDB: design the keys, get speed at any scale

**DynamoDB** is a serverless key-value and document database. There is no instance to size: you create a **table**, choose a **primary key**, and read and write **items** (JSON-like documents) with consistent single-digit-millisecond latency, at ten requests a day or tens of thousands a second.

The catch is that you design the keys around the questions you will ask. For RSVPs, Lantern's questions are "who is coming to event X?" and "has this person already RSVPed to X?". That gives a **partition key** of `eventId` and a **sort key** of `email`:

```bash
aws dynamodb create-table --table-name lantern-rsvps \
  --attribute-definitions AttributeName=eventId,AttributeType=S \
                          AttributeName=email,AttributeType=S \
  --key-schema AttributeName=eventId,KeyType=HASH \
               AttributeName=email,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

Counting the RSVPs for one event is then a cheap **Query**:

```bash
aws dynamodb query --table-name lantern-rsvps \
  --key-condition-expression "eventId = :e" \
  --expression-attribute-values '{":e": {"S": "evt-2026-street-food"}}' \
  --select COUNT
```

**How DynamoDB bills:** in **on-demand** mode (`PAY_PER_REQUEST`), per read and write request plus storage per GB-month, and nothing for idle time. **Provisioned** mode, with auto scaling, can be cheaper for steady, predictable traffic. Start on-demand; switch only when the bill shows steady load. Point-in-time recovery is a setting you turn on per table, and you should.

:::mistake Scanning to find a few items
A `Scan` with a filter reads every item in the table and then throws most away, and you pay for every item read. It works in testing with 50 RSVPs and becomes slow and expensive with 500,000. If a hot path needs a question your keys can't answer with `Query` or `GetItem`, add a global secondary index for it rather than scanning.
:::

## Choosing

| Question | RDS | DynamoDB |
|---|---|---|
| Are the questions varied or ad hoc? | Yes: SQL handles new ones | No: keys answer known ones |
| Need joins and multi-table constraints? | Yes | Rarely; you denormalise |
| Traffic spiky, with idle time? | Pays for idle hours | Pays per request |
| Existing SQL code to keep? | Keep it | Rewrite data access |
| Ops you still do | Sizing, connections, upgrades | Key design |

Lantern ends up with **both**: events, venues and organisers in RDS for PostgreSQL, where reports and the existing admin pages work unchanged; RSVPs in DynamoDB, where a viral event's write spike costs a few cents of requests instead of stalling the shared database.

:::why Security is the same job in both
Encrypt at rest (on by default for DynamoDB, a flag for RDS), keep the database unreachable from the internet, and grant the app's role only the actions it needs, such as `dynamodb:PutItem` and `dynamodb:Query` on one table ARN.
:::

The database is private, but private from *what*? Next lesson builds the network Lantern's pieces live in.
