---
summary: Read EXPLAIN QUERY PLAN output to tell a full scan from an index search, write filters the database can serve from an index, and judge when a new index is worth asking for.
takeaways:
  - An index is a sorted copy of one or more columns with pointers back to the rows, so the database can jump to matching values instead of reading every row.
  - In EXPLAIN QUERY PLAN, SEARCH ... USING INDEX means the index narrowed the work; SCAN means every row (or every index entry) was read.
  - Wrapping an indexed column in a function or arithmetic, like date(order_date), usually stops the index from being used; compare the bare column with a range instead.
  - Indexes speed up reads but cost storage and slow down every insert and update, so add them for frequent, selective filters and join keys.
further:
  - title: SQLite EXPLAIN QUERY PLAN
    url: https://www.sqlite.org/eqp.html
  - title: SQLite query optimizer overview
    url: https://www.sqlite.org/optoverview.html
  - title: PostgreSQL using EXPLAIN
    url: https://www.postgresql.org/docs/current/using-explain.html
quiz:
  - q: "`orders` has an index on `order_date`. Which filter for orders on 28 November 2025 can use it as a SEARCH?"
    options:
      - text: "`WHERE date(order_date) = '2025-11-28'`"
        why: The index stores raw `order_date` values, not `date(order_date)`, so the database has to compute the function for every row.
      - text: "`WHERE strftime('%Y-%m-%d', order_date) = '2025-11-28'`"
        why: Same problem in a different function; any expression wrapped around the column hides it from the index.
      - text: "`WHERE order_date >= '2025-11-28' AND order_date < '2025-11-29'`"
        why: Correct. The bare column is compared with constants, so the database can seek to the start of the range in the sorted index and stop at the end.
    answer: 2
  - q: "A plan shows `SCAN orders USING COVERING INDEX idx_orders_date`. What does that mean?"
    options:
      - text: Every entry of the index was read, but the table itself wasn't touched because the index held every column the query needed.
        why: Correct. It's cheaper than scanning the table, since the index is smaller, but it's still a full pass rather than a targeted SEARCH.
      - text: The index was used to jump straight to the matching rows.
        why: That would be SEARCH. SCAN always means reading everything, here the whole index.
      - text: The query is broken and will return wrong results.
        why: Query plans describe speed, never correctness; the result is the same either way.
      - text: SQLite created a temporary index for this query.
        why: A temporary index shows up as AUTOMATIC INDEX in the plan; this names a permanent one.
    answer: 0
  - q: An analytics database gets a million new web sessions a day and is queried a few times a day by `source`. Someone proposes indexes on all nine columns of `web_sessions`. What's the best response?
    options:
      - text: Agree; more indexes always make queries faster.
        why: Indexes only help queries that filter, join or sort on their columns, and each one adds work to every insert.
      - text: Refuse all indexes because writes matter more than reads.
        why: Too absolute. An index that serves a frequent, selective filter is usually worth its write cost.
      - text: Index `customer_id` only, because ids are always the best index.
        why: The best index matches how the table is queried. Nothing in the scenario filters by customer.
      - text: Index the columns that real, frequent queries filter or join on, check the plans, and skip the rest.
        why: Correct. Every index has a write and storage cost, so add the ones that serve actual queries and confirm with EXPLAIN QUERY PLAN that they're used.
    answer: 3
  - q: "In PostgreSQL, what does `EXPLAIN ANALYZE` do that `EXPLAIN` doesn't?"
    options:
      - text: It rewrites the query to use better indexes.
        why: Neither command changes the query; they only report on it.
      - text: It actually runs the query and reports real row counts and timings next to the estimates.
        why: Correct. That makes it the tool for finding where estimates are wrong, and a reason to be careful running it on statements that modify data.
      - text: It analyses the query for syntax errors only.
        why: Syntax is checked by every command; ANALYZE adds execution, not validation.
    answer: 1
---

Mark has a dashboard that shows orders for a chosen day, and on the production database it's become slow. "Same query as always. Why is it suddenly slow?" On Cartwheel's two thousand orders, every query in this course returns instantly. Production has years of orders, and there the difference between a query that reads every row and one that jumps to the right rows is seconds versus minutes. You can't feel that difference on a small database, but you can **see** it in the query plan.

## What an index is

An index is a separate structure that keeps the values of one or more columns in sorted order, each with a pointer to its row. Finding '2025-11-28' in a sorted list is like finding a word in a dictionary: you jump to roughly the right page instead of reading from the start. Without an index, the database has to read the whole table and test every row, which is a **scan**.

:::figure A scan reads every row; an index search jumps to the matching range
<svg viewBox="0 0 720 230" role="img" aria-labelledby="t1">
  <title id="t1">Left: a full scan checks all rows of the orders table one by one. Right: the idx_orders_date index holds dates in sorted order; a search jumps to 2025-11-28, reads the matching entries and follows their pointers to the rows.</title>
  <text class="d-label-strong" x="160" y="28" text-anchor="middle">SCAN orders</text>
  <rect class="d-box" x="60" y="40" width="200" height="26" rx="4"/>
  <rect class="d-box" x="60" y="70" width="200" height="26" rx="4"/>
  <rect class="d-box" x="60" y="100" width="200" height="26" rx="4"/>
  <rect class="d-box" x="60" y="130" width="200" height="26" rx="4"/>
  <rect class="d-box" x="60" y="160" width="200" height="26" rx="4"/>
  <text class="d-label-muted" x="160" y="215" text-anchor="middle">test every row</text>
  <path class="d-arrow" d="M40 45 L40 185" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="450" y="28" text-anchor="middle">SEARCH idx_orders_date</text>
  <rect class="d-box" x="370" y="40" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="58" text-anchor="middle">2024-01-02</text>
  <rect class="d-box" x="370" y="70" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="88" text-anchor="middle">…</text>
  <rect class="d-box-success" x="370" y="100" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="118" text-anchor="middle">2025-11-28 08:…</text>
  <rect class="d-box-success" x="370" y="130" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="148" text-anchor="middle">2025-11-28 23:…</text>
  <rect class="d-box" x="370" y="160" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="178" text-anchor="middle">2025-12-30</text>
  <path class="d-arrow" d="M330 50 L365 108" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="580" y="100" width="120" height="26" rx="4"/>
  <text class="d-label" x="640" y="118" text-anchor="middle">row 2290</text>
  <rect class="d-box-accent" x="580" y="130" width="120" height="26" rx="4"/>
  <text class="d-label" x="640" y="148" text-anchor="middle">row 1769</text>
  <path class="d-arrow" d="M530 113 L576 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M530 143 L576 143" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="530" y="215" text-anchor="middle">jump, read the range, follow pointers</text>
</svg>
:::

Cartwheel's database has a few indexes already. You can list them from the schema table:

```sql run
SELECT name, tbl_name, sql
FROM sqlite_schema
WHERE type = 'index';
```

`orders` is indexed on `customer_id` and `order_date`, `order_items` on `order_id` and `product_id`. The `sqlite_autoindex_customers_1` entry exists because `email` is declared UNIQUE; SQLite enforces uniqueness with an index.

## Reading a query plan

Prefix any SELECT with `EXPLAIN QUERY PLAN` and SQLite describes how it will run it instead of running it. The interesting part is the `detail` column:

```sql run
EXPLAIN QUERY PLAN
SELECT order_id, status
FROM orders
WHERE order_date >= '2025-11-28'
  AND order_date <  '2025-11-29';
```

`SEARCH orders USING INDEX idx_orders_date (order_date>? AND order_date<?)`. **SEARCH** means the index narrowed the work to a range. Now Mark's dashboard query, which someone "simplified" last month:

```sql run
EXPLAIN QUERY PLAN
SELECT order_id, status
FROM orders
WHERE date(order_date) = '2025-11-28';
```

`SCAN orders`. Same result, but now every row is read and `date()` is computed for each one. The index stores raw `order_date` values; it knows nothing about `date(order_date)`, so it can't help. That's the "suddenly slow".

:::mistake Wrapping the indexed column
A filter can use an index only when the indexed column stands alone on one side of the comparison. `date(order_date) = ...`, `strftime('%Y', order_date) = '2025'`, `customer_id + 0 = 42` and `LOWER(email) = ...` all hide the column inside an expression. Rewrite them as ranges on the bare column: `order_date >= '2025-01-01' AND order_date < '2026-01-01'`. Conditions that can use an index are often called **sargable**. The half-open ranges you learned in the dates lesson are sargable by design.
:::

Two more plan phrases are worth recognising. `USING COVERING INDEX` means the index alone held every column the query needed, so the table wasn't touched at all, the fastest kind of lookup. And `USE TEMP B-TREE FOR GROUP BY` or `FOR ORDER BY` means SQLite had to sort rows itself, which is fine on small results and worth a look on large ones.

Plans for joins show one line per table, in the order SQLite visits them:

```sql run
EXPLAIN QUERY PLAN
SELECT o.order_id, SUM(oi.quantity) AS units
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.order_id
WHERE o.customer_id = 42
GROUP BY o.order_id;
```

Both lines say SEARCH: find customer 42's orders through `idx_orders_customer`, then each order's items through `idx_items_order`. An index on every foreign key you join on is the single most valuable indexing habit.

## Plans are predictions

A query plan is the optimizer's choice, not a guarantee of speed, and it depends on the data. On a tiny table the optimizer may decide a scan is cheaper than an index, and it'll be right. Both engines can keep statistics about each table, gathered by the `ANALYZE` command (PostgreSQL's autovacuum runs it for you; in SQLite someone has to run it), and use them to estimate how many rows each step returns. When those statistics are stale, plans go wrong in surprising ways, which is one more question to ask the database owner about a query that slowed down "for no reason".

Some filters can't use an ordinary index however you write them. `name LIKE '%mat%'` has to look inside every value, because a sorted list can't help you find text in the middle of words. If a search like that is frequent, the answer is a different tool, such as full-text search, rather than another index.

## When to ask for a new index

Analysts often don't own the schema, but you'll be the one who notices the slow query. Support filters tickets by `opened_at` constantly, and that column has no index, so the plan for those queries is a SCAN. The request to the database owner would be:

```sql
CREATE INDEX idx_tickets_opened_at ON support_tickets (opened_at);
```

Indexes aren't free. Each one takes storage and must be updated on every insert, update and delete, so a table with ten indexes writes noticeably slower. Ask for indexes on columns that frequent queries filter, join or sort on, and that narrow the result a lot. An index on `status`, with five values, rarely helps; an index on a date or an id usually does. For a multi-column index, put the column you test with `=` first and the range column second: `(customer_id, order_date)` serves "customer 42's orders in 2025" with one search.

:::tip The same idea in PostgreSQL
PostgreSQL's `EXPLAIN` shows a tree with estimated costs and row counts ("Seq Scan" is its full scan, "Index Scan" its search), and `EXPLAIN ANALYZE` actually runs the query and adds real timings. The rules about sargable filters and join-key indexes carry over unchanged.
:::

Fast queries are only useful if people can read them. Next: the style habits and dialect differences that make your SQL reviewable and portable.
