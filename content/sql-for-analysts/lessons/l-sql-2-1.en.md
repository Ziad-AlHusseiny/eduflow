---
summary: Collapse rows into one per group with GROUP BY, filter groups with HAVING, count conditionally with FILTER, and state the grain of every result before you trust it.
takeaways:
  - The grain of a result is what one row represents; say it out loud before writing GROUP BY and check it after.
  - Every column in the SELECT list should be either in GROUP BY or inside an aggregate; SQLite allows bare columns but fills them from an arbitrary row.
  - WHERE filters rows before grouping, HAVING filters groups after aggregation, so conditions on SUM or COUNT belong in HAVING.
  - COUNT(*) FILTER (WHERE ...) or SUM(CASE WHEN ... THEN 1 ELSE 0 END) counts a subset inside each group without a second query.
further:
  - title: SQLite aggregate functions
    url: https://www.sqlite.org/lang_aggfunc.html
  - title: SQLite SELECT processing, including bare columns
    url: https://www.sqlite.org/lang_select.html#resultset
  - title: PostgreSQL aggregate expressions and FILTER
    url: https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES
quiz:
  - q: You need countries whose 2025 order count is above 50. Where does each condition go?
    options:
      - text: Both the year test and `COUNT(*) > 50` go in WHERE.
        why: WHERE runs before grouping, when no count exists yet, so an aggregate there is an error.
      - text: Both go in HAVING.
        why: PostgreSQL rejects a non-grouped `order_date` in HAVING, and SQLite would test the date of one arbitrary row per group, giving silently wrong counts. The year test is a row condition and belongs in WHERE.
      - text: The year test goes in HAVING; `COUNT(*) > 50` goes in WHERE.
        why: That's reversed. WHERE can't see aggregates at all.
      - text: The year test goes in WHERE; `COUNT(*) > 50` goes in HAVING.
        why: Correct. Filter rows first (only 2025 orders), then filter the groups by their aggregate.
    answer: 3
  - q: |
      What is the grain of this result?
      ```sql
      SELECT customer_id, strftime('%Y-%m', order_date) AS month, COUNT(*)
      FROM orders
      GROUP BY customer_id, month;
      ```
    options:
      - text: One row per customer.
        why: The month is also a grouping key, so a customer who ordered in three months gets three rows.
      - text: One row per order.
        why: Grouping collapses orders; several orders by the same customer in one month become one row.
      - text: One row per month.
        why: Each month has a row for every customer who ordered in it, not a single row.
      - text: One row per customer per month in which they ordered.
        why: Correct. The grain is the combination of the GROUP BY keys, and months with no orders don't appear at all.
    answer: 3
  - q: "In SQLite, `SELECT channel, status, COUNT(*) FROM orders GROUP BY channel` runs without error. What does the `status` column show?"
    options:
      - text: The status of some row in each channel group, which tells you nothing about the group.
        why: Correct. SQLite allows this "bare column" and fills it from an arbitrary row. PostgreSQL rejects the query.
      - text: The most common status in each channel.
        why: There's no mode calculation; SQLite picks a value from one row of the group.
      - text: A comma-separated list of every status.
        why: That's what `GROUP_CONCAT(status)` (or `string_agg`) does; a bare column is a single value.
    answer: 0
  - q: Which expression gives the share of each month's orders that were cancelled, as a percentage?
    options:
      - text: "`COUNT(status = 'cancelled') * 100.0 / COUNT(*)`"
        why: COUNT counts non-NULL values, and `status = 'cancelled'` is 0 or 1, never NULL, so this counts every row and returns 100.
      - text: "`100.0 * COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*)`"
        why: Correct. FILTER restricts that one aggregate to cancelled rows; 100.0 avoids integer division.
      - text: "`COUNT(*) / COUNT(*) FILTER (WHERE status = 'cancelled')`"
        why: That's the inverse ratio, and with integer division in SQLite it would truncate as well.
    answer: 1
---

Mark from Operations is back with the question you couldn't answer last lesson: "What's our average resolution time, by priority?" You know how to compute one ticket's hours. Now you need one *row per priority*, each summarising dozens of tickets. That's what `GROUP BY` does, and the idea underneath it, the grain of a result, is the single most useful concept in analytical SQL.

## One row per what?

Every table and every result has a **grain**: the thing one row represents. `support_tickets` has one row per ticket. Mark wants one row per priority. Write that down first, then make the query match it:

```sql run
SELECT
  priority,
  COUNT(*)                AS tickets,
  COUNT(closed_at)        AS closed,
  ROUND(AVG((julianday(closed_at) - julianday(opened_at)) * 24), 1) AS avg_hours,
  ROUND(MAX((julianday(closed_at) - julianday(opened_at)) * 24), 1) AS max_hours
FROM support_tickets
GROUP BY priority
ORDER BY avg_hours;
```

Four rows, one per priority, which matches the grain you stated. Urgent tickets close in 6.5 hours on average, high in about a day, and low and normal in over three days. Notice how `COUNT(closed_at)` and `AVG` quietly skip open tickets, exactly as the previous lessons promised. The `max_hours` column matters too: an average can look healthy while one customer waited a week.

:::figure The logical order SQL evaluates a query in
<svg viewBox="0 0 720 150" role="img" aria-labelledby="t1">
  <title id="t1">Logical evaluation order: FROM, then WHERE filters rows, GROUP BY forms groups, HAVING filters groups, SELECT computes output columns, ORDER BY sorts, LIMIT cuts.</title>
  <rect class="d-box" x="10" y="40" width="86" height="44" rx="8"/>
  <text class="d-code" x="53" y="67" text-anchor="middle">FROM</text>
  <rect class="d-box-accent" x="111" y="40" width="86" height="44" rx="8"/>
  <text class="d-code" x="154" y="67" text-anchor="middle">WHERE</text>
  <rect class="d-box-primary" x="212" y="40" width="100" height="44" rx="8"/>
  <text class="d-code" x="262" y="67" text-anchor="middle">GROUP BY</text>
  <rect class="d-box-accent" x="327" y="40" width="86" height="44" rx="8"/>
  <text class="d-code" x="370" y="67" text-anchor="middle">HAVING</text>
  <rect class="d-box" x="428" y="40" width="86" height="44" rx="8"/>
  <text class="d-code" x="471" y="67" text-anchor="middle">SELECT</text>
  <rect class="d-box" x="529" y="40" width="100" height="44" rx="8"/>
  <text class="d-code" x="579" y="67" text-anchor="middle">ORDER BY</text>
  <rect class="d-box" x="644" y="40" width="66" height="44" rx="8"/>
  <text class="d-code" x="677" y="67" text-anchor="middle">LIMIT</text>
  <text class="d-label-muted" x="154" y="110" text-anchor="middle">filters rows</text>
  <text class="d-label-muted" x="262" y="110" text-anchor="middle">makes groups</text>
  <text class="d-label-muted" x="370" y="110" text-anchor="middle">filters groups</text>
  <text class="d-label-muted" x="471" y="110" text-anchor="middle">computes</text>
  <path class="d-arrow" d="M30 130 L690 130" marker-end="url(#arrow)"/>
</svg>
:::

That diagram explains most GROUP BY errors. `WHERE` runs before groups exist, so it can't test `COUNT(*)`; that's `HAVING`'s job. `ORDER BY` runs after SELECT, so it can always use a column alias. SQLite and PostgreSQL also accept an alias in `GROUP BY` as a convenience, which is why `GROUP BY month` works below, but the logical order is still the one shown.

## WHERE versus HAVING

Karim in Finance wants to know which products have sold at least 100 units at full price, with no discount. Units per product is an aggregate, so the threshold goes in `HAVING`. "No discount" is a property of each order line, so it's a row condition and goes in `WHERE`:

```sql run
SELECT
  product_id,
  SUM(quantity) AS units,
  COUNT(DISTINCT order_id) AS orders
FROM order_items
WHERE discount = 0
GROUP BY product_id
HAVING SUM(quantity) >= 100
ORDER BY units DESC
LIMIT 5;
```

Read it in the diagram's order: drop discounted lines, group what's left by product, keep products with 100+ units, then compute, sort and cut. `COUNT(DISTINCT order_id)` counts orders rather than lines, because in Cartwheel's data each product appears at most once per order, so lines and orders differ only when you count across products.

:::mistake Bare columns in SQLite
Every column in SELECT should be in `GROUP BY` or inside an aggregate. PostgreSQL enforces that rule; SQLite doesn't. `SELECT channel, status, COUNT(*) FROM orders GROUP BY channel` runs and shows "delivered" for every channel, because SQLite filled `status` from one arbitrary row of each group. Worse, forgetting `GROUP BY` entirely collapses the table to a **single row** with an arbitrary product id next to the grand total. If a result has fewer rows than you expected, check the GROUP BY first.
:::

## Counting a subset inside each group

Huda in Marketing asks what share of each month's orders came through the mobile app. You need two counts per month, all orders and app orders. A `FILTER` clause restricts one aggregate to some rows:

```sql run
SELECT
  strftime('%Y-%m', order_date) AS month,
  COUNT(*) AS orders,
  COUNT(*) FILTER (WHERE channel = 'mobile_app') AS app_orders,
  ROUND(100.0 * COUNT(*) FILTER (WHERE channel = 'mobile_app') / COUNT(*), 1) AS app_pct
FROM orders
WHERE order_date >= '2025-07-01'
  AND order_date <  '2026-01-01'
GROUP BY month
ORDER BY month;
```

The app share moves between roughly 28% and 40%, and November's volume is more than three times July's, thanks to Black Friday. Two details matter. `100.0` rather than `100` forces decimal division; SQLite divides integers as integers, so `47 / 129` is 0. And `FILTER` is standard SQL, supported by SQLite and PostgreSQL. In engines without it, write `SUM(CASE WHEN channel = 'mobile_app' THEN 1 ELSE 0 END)`, which is the same count spelled the long way.

## Checking the grain

Once a grouped query runs, verify it before reporting:

1. **Row count**: does it match the number of groups you expect (4 priorities, 6 months)?
2. **Uniqueness**: is the GROUP BY key unique in the output? It is by construction, unless a bare column is hiding something.
3. **Totals**: does the sum of a column across groups equal the ungrouped total? For tickets, the four counts add up to 873.

None of these checks takes more than a minute, and together they catch the majority of grouping mistakes before a stakeholder does. Make them part of the loop from the first lesson, between "query" and "answer". That third check becomes vital in the next lessons, when you start joining tables. Joins can change the grain without telling you, and summing over the wrong grain is how double counting starts.
