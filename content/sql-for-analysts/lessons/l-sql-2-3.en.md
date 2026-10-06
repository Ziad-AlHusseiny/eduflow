---
summary: Recognise when a join multiplies rows, explain why sums over the repeated side inflate, and fix it by aggregating each table to the right grain before joining.
takeaways:
  - Joining a one-to-many relationship gives the result the grain of the many side and repeats every column from the one side.
  - Summing a column from the repeated side, like an order's shipping fee after joining to items, counts it once per matching row.
  - Aggregate the many side to the grain of the one side in a subquery first, then join, so every number is counted exactly once.
  - COUNT(DISTINCT key) can rescue a count, but SUM(DISTINCT value) is never a fix because it also merges different rows that share a value.
  - Reconcile every joined total against the same total computed from its own table alone.
further:
  - title: SQLite SELECT, subqueries in the FROM clause
    url: https://www.sqlite.org/lang_select.html#fromclause
  - title: PostgreSQL table expressions and subqueries in FROM
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html
quiz:
  - q: Order 1001 has a shipping fee of 7.99 and four item lines. After joining `orders` to `order_items`, what does `SUM(o.shipping_fee)` contribute for this order?
    options:
      - text: "7.99"
        why: That's the true fee, but the join produced four rows for this order, each carrying 7.99.
      - text: "31.96"
        why: Correct. The order's columns are repeated on each of its four item rows, so the fee is summed four times.
      - text: "1.99, the fee divided across items"
        why: Joins never split values; they copy the one-side columns onto every matching row.
    answer: 1
  - q: A colleague fixes an inflated shipping total by writing `SUM(DISTINCT o.shipping_fee)`. What's wrong with that?
    options:
      - text: Nothing; DISTINCT removes the duplicates the join created.
        why: DISTINCT removes duplicate values, not duplicate orders. 372 different orders share a 4.99 fee, and they collapse into one.
      - text: SUM(DISTINCT) is not valid SQL.
        why: It's valid in SQLite and PostgreSQL, which is what makes it a tempting, silent bug.
      - text: It adds up each distinct fee amount once, so the total is close to the sum of a handful of fee levels.
        why: Correct. On Cartwheel's data it returns 22.97 per channel, the sum of the distinct fee levels, instead of the real 678 to 3,413.
      - text: It's correct but slower than the subquery approach.
        why: It isn't correct. Speed is beside the point when the number is wrong.
    answer: 2
  - q: You need item revenue and ticket count per order. Both `order_items` and `support_tickets` have many rows per order. What's the safest approach?
    options:
      - text: Join orders to both tables in one FROM clause and use SUM and COUNT.
        why: Two independent one-to-many joins multiply each other. Revenue gets counted once per ticket and tickets once per item.
      - text: Use COUNT(DISTINCT t.ticket_id) and SUM(DISTINCT revenue).
        why: The count would survive, but SUM(DISTINCT) merges different lines that happen to have equal revenue.
      - text: Use a LEFT JOIN instead of an INNER JOIN for both tables.
        why: The join type controls which rows survive, not how many times they repeat; fan-out happens with both.
      - text: Aggregate items per order and tickets per order in two subqueries, then join both to orders.
        why: Correct. Each subquery returns one row per order, so the final joins are one-to-one and nothing repeats.
    answer: 3
---

Karim in Finance sends a quick one: "For 2025, by channel, how much did we collect in shipping fees, and how much item revenue?" You already know the join. Here's the query most people write first:

```sql run
SELECT
  o.channel,
  ROUND(SUM(o.shipping_fee), 2) AS shipping,
  ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2) AS item_revenue
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.order_id
WHERE o.status <> 'cancelled'
  AND o.order_date >= '2025-01-01'
  AND o.order_date <  '2026-01-01'
GROUP BY o.channel;
```

Item revenue is right. Shipping is about double what it should be: web shows 6,732 when the real figure is 3,413. Nothing errored, and nothing looks absurd at a glance. This is **fan-out**, the most expensive bug in analytics, because it produces believable numbers.

## Where the extra money comes from

`orders` and `order_items` have a one-to-many relationship: one order, one or more lines. When you join them, the result has one row per *line*, and each line carries a copy of its order's columns, `shipping_fee` included.

:::figure Joining one order to four items repeats the order's fee four times
<svg viewBox="0 0 720 230" role="img" aria-labelledby="t1">
  <title id="t1">Order 1001 with a shipping fee of 7.99 joins to four item lines. The joined result has four rows, each showing 7.99, so summing the fee gives 31.96 instead of 7.99.</title>
  <text class="d-label-strong" x="110" y="28" text-anchor="middle">orders (one)</text>
  <rect class="d-box-primary" x="30" y="90" width="160" height="44" rx="8"/>
  <text class="d-code" x="110" y="117" text-anchor="middle">1001  fee 7.99</text>
  <text class="d-label-strong" x="350" y="28" text-anchor="middle">order_items (many)</text>
  <rect class="d-box" x="280" y="40" width="140" height="32" rx="6"/>
  <text class="d-code" x="350" y="61" text-anchor="middle">line 2</text>
  <rect class="d-box" x="280" y="80" width="140" height="32" rx="6"/>
  <text class="d-code" x="350" y="101" text-anchor="middle">line 3</text>
  <rect class="d-box" x="280" y="120" width="140" height="32" rx="6"/>
  <text class="d-code" x="350" y="141" text-anchor="middle">line 4</text>
  <rect class="d-box" x="280" y="160" width="140" height="32" rx="6"/>
  <text class="d-code" x="350" y="181" text-anchor="middle">line 5</text>
  <path class="d-line" d="M190 112 L280 56"/>
  <path class="d-line" d="M190 112 L280 96"/>
  <path class="d-line" d="M190 112 L280 136"/>
  <path class="d-line" d="M190 112 L280 176"/>
  <text class="d-label-strong" x="590" y="28" text-anchor="middle">joined rows</text>
  <rect class="d-box-warn" x="500" y="40" width="180" height="32" rx="6"/>
  <text class="d-code" x="590" y="61" text-anchor="middle">1001 7.99 line 2</text>
  <rect class="d-box-warn" x="500" y="80" width="180" height="32" rx="6"/>
  <text class="d-code" x="590" y="101" text-anchor="middle">1001 7.99 line 3</text>
  <rect class="d-box-warn" x="500" y="120" width="180" height="32" rx="6"/>
  <text class="d-code" x="590" y="141" text-anchor="middle">1001 7.99 line 4</text>
  <rect class="d-box-warn" x="500" y="160" width="180" height="32" rx="6"/>
  <text class="d-code" x="590" y="181" text-anchor="middle">1001 7.99 line 5</text>
  <text class="d-label" x="590" y="220" text-anchor="middle">SUM(fee) = 31.96</text>
  <path class="d-arrow" d="M425 116 L495 116" marker-end="url(#arrow)"/>
</svg>
:::

Item revenue survived because it lives on the many side: each line's revenue appears exactly once. Shipping lives on the one side, so it's counted once per line. Cartwheel orders average 1.93 lines, which is why shipping roughly doubled.

The general rule: **a join changes the grain to the grain of its most detailed table, and any number stored at a coarser grain gets repeated.**

## The fix: aggregate first, then join

Bring each table to the grain of the answer *before* joining. Here, collapse `order_items` to one row per order in a subquery, then join that to `orders`. Now both sides have one row per order, and nothing repeats:

```sql run
SELECT
  o.channel,
  COUNT(*) AS orders,
  ROUND(SUM(o.shipping_fee), 2) AS shipping,
  ROUND(SUM(i.revenue), 2) AS item_revenue
FROM orders AS o
JOIN (
  SELECT order_id, SUM(quantity * unit_price * (1 - discount)) AS revenue
  FROM order_items
  GROUP BY order_id
) AS i ON i.order_id = o.order_id
WHERE o.status <> 'cancelled'
  AND o.order_date >= '2025-01-01'
  AND o.order_date <  '2026-01-01'
GROUP BY o.channel;
```

A subquery in `FROM` (a *derived table*) behaves like a temporary table with the grain you chose, one row per `order_id` here. Shipping now matches a query on `orders` alone, item revenue is unchanged, and `COUNT(*)` counts orders, because the rows are orders again. The next section shows a tidier way to write the same thing with `WITH`.

:::mistake SUM(DISTINCT) as a fan-out fix
`COUNT(DISTINCT o.order_id)` is a legitimate way to count orders after a fan-out, because order ids are unique. `SUM(DISTINCT o.shipping_fee)` is not: it adds each distinct *amount* once. Hundreds of orders share the same 4.99 fee, so on Cartwheel's data it returns 22.97 per channel, the sum of a few fee levels. DISTINCT deduplicates values, never rows.
:::

## Two fans at once

Fan-out compounds. Julia asks how much revenue came from orders that needed a support ticket. Join items and tickets to the same orders, and each line is repeated once per ticket on its order; 110 orders have more than one ticket. The naive sum says 166,562. The right answer, which asks whether a ticket *exists* rather than joining every ticket, is 140,675:

```sql run
SELECT ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS revenue_with_tickets
FROM order_items
WHERE order_id IN (SELECT order_id FROM support_tickets);
```

`IN (subquery)` filters without joining, so it can never multiply rows. This "does a match exist?" pattern, a semi-join, gets a full treatment in the next lesson along with its opposite.

## Spotting a fan-out before it bites

You don't have to wait for a wrong total. Before joining, ask of each join key: is it unique on this side? `order_id` is unique in `orders` (it's the primary key) but not in `order_items` or `support_tickets`, so joining either one to `orders` multiplies order rows. A quick probe tells you:

```sql run
SELECT
  COUNT(*)                 AS rows_after_join,
  COUNT(DISTINCT order_id) AS distinct_orders
FROM order_items;
```

3,991 rows against 2,066 orders: a fan-out factor of nearly two. When those two numbers differ, any column you sum from the "one" side needs to be pre-aggregated or left out of the join. When they're equal, the join is one-to-one and safe for sums from either side.

## The reconciliation habit

Every time you join, reconcile at least one total against a single-table version. Shipping by channel from the joined query should equal shipping by channel from `orders` alone; item revenue should equal the sum over `order_items` for the same orders. If they match, the join didn't fan out. If they don't, you've caught the bug before Karim's board deck did.

:::tip Name the grain in a comment
Start grouped queries with a comment like `-- grain: one row per channel` and put `-- grain: one row per order` above every derived table. It takes five seconds, and it makes fan-out visible to you and to anyone reviewing the query.
:::

Next you'll join tables to themselves and look for rows that have *no* match at all.
