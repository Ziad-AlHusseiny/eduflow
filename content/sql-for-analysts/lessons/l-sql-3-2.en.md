---
summary: Rank rows within groups using ROW_NUMBER, RANK and DENSE_RANK with OVER (PARTITION BY ... ORDER BY ...), and answer top-N-per-group and first-event questions without losing detail rows.
takeaways:
  - A window function computes a value from a set of related rows but keeps every row, unlike GROUP BY, which collapses them.
  - PARTITION BY restarts the calculation for each group; ORDER BY inside OVER defines the sequence the ranking follows.
  - ROW_NUMBER gives unique positions, RANK leaves gaps after ties (1, 1, 3) and DENSE_RANK doesn't (1, 1, 2).
  - Window functions are computed after WHERE, so to filter on a rank, compute it in a CTE and filter in the outer query.
  - Make ROW_NUMBER deterministic by adding a unique tie-breaker to its ORDER BY.
further:
  - title: SQLite window functions
    url: https://www.sqlite.org/windowfunctions.html
  - title: PostgreSQL window functions tutorial
    url: https://www.postgresql.org/docs/current/tutorial-window.html
quiz:
  - q: Three products have revenue 900, 900 and 700. What do RANK and DENSE_RANK (ordered by revenue descending) give the 700 product?
    options:
      - text: RANK 3, DENSE_RANK 2
        why: Correct. RANK skips position 2 because two rows share position 1; DENSE_RANK continues with the next integer.
      - text: RANK 2, DENSE_RANK 3
        why: That's reversed. DENSE_RANK is the one without gaps, so it's never larger than RANK.
      - text: RANK 2, DENSE_RANK 2
        why: "That would be true only without the tie at the top. RANK is one plus the number of rows ranked above, here 1 + 2 = 3."
      - text: RANK 3, DENSE_RANK 3
        why: DENSE_RANK doesn't leave gaps, so 700, the second distinct value, gets 2, not 3.
    answer: 0
  - q: "Why does `SELECT ... WHERE ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) = 1` fail?"
    options:
      - text: ROW_NUMBER needs an argument.
        why: ROW_NUMBER takes no arguments; the empty parentheses are correct.
      - text: PARTITION BY can't be used with ORDER BY.
        why: They're designed to be combined; the partition restarts the numbering and the order sets it.
      - text: Window functions only work on numeric columns.
        why: ROW_NUMBER doesn't read any column's values; it numbers rows in the given order.
      - text: Window functions are computed after WHERE, so they can't be used in it.
        why: Correct. Compute the row number in a CTE or subquery, then filter `WHERE rn = 1` in the outer query.
    answer: 3
  - q: You number each customer's orders with `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY date(order_date))`. Two orders on the same day get 1 and 2 in an unpredictable order. What's the fix?
    options:
      - text: Use RANK instead, so both get 1.
        why: Then the customer has two "first" orders, and a filter on rank 1 returns both, duplicating the customer.
      - text: Remove PARTITION BY.
        why: Without the partition, the numbering runs across all customers, and only one order in the whole table gets 1.
      - text: Add a unique tie-breaker, such as `order_id`, after the date in the window's ORDER BY.
        why: Correct. With a unique final key the ordering is total, so the same row gets 1 every time.
    answer: 2
  - q: How many rows does `SELECT customer_id, COUNT(*) OVER (PARTITION BY customer_id) FROM orders` return?
    options:
      - text: One per order, each showing how many orders that customer has.
        why: Correct. The window counts rows in each customer's partition but doesn't collapse them, so every order row survives.
      - text: One per customer.
        why: That's what `GROUP BY customer_id` would return. A window function never changes the row count.
      - text: One row with the total number of orders.
        why: That's a plain `COUNT(*)` without GROUP BY or OVER.
    answer: 0
---

Huda wants to feature the two best sellers from every category in the spring newsletter. You can get revenue per product with GROUP BY. But "the top two *within each category*" needs something GROUP BY can't do: rank rows against their neighbours while keeping each row. That's the job of **window functions**, and once you have them, a whole class of questions becomes short.

## Keeping rows while looking across them

`GROUP BY` collapses each group into one row. A window function computes a value across a set of rows, the *window*, and attaches it to every row, collapsing nothing.

:::figure GROUP BY collapses a group; a window function annotates every row
<svg viewBox="0 0 720 190" role="img" aria-labelledby="t1">
  <title id="t1">Three Yoga products and one Kitchen product with their 2025 revenue. GROUP BY category returns two rows, one per category. RANK over a partition by category returns all four rows, each with its rank inside its category.</title>
  <text class="d-label-strong" x="120" y="24" text-anchor="middle">product revenue</text>
  <rect class="d-box-accent" x="20" y="36" width="200" height="30" rx="6"/>
  <text class="d-code" x="120" y="56" text-anchor="middle">Yoga   Mat      4665</text>
  <rect class="d-box-accent" x="20" y="70" width="200" height="30" rx="6"/>
  <text class="d-code" x="120" y="90" text-anchor="middle">Yoga   Cushion  3923</text>
  <rect class="d-box-accent" x="20" y="104" width="200" height="30" rx="6"/>
  <text class="d-code" x="120" y="124" text-anchor="middle">Yoga   Block    1656</text>
  <rect class="d-box-success" x="20" y="146" width="200" height="30" rx="6"/>
  <text class="d-code" x="120" y="166" text-anchor="middle">Kitchen Board   2039</text>
  <text class="d-label-strong" x="360" y="24" text-anchor="middle">GROUP BY</text>
  <rect class="d-box-accent" x="270" y="70" width="180" height="30" rx="6"/>
  <text class="d-code" x="360" y="90" text-anchor="middle">Yoga    10244</text>
  <rect class="d-box-success" x="270" y="146" width="180" height="30" rx="6"/>
  <text class="d-code" x="360" y="166" text-anchor="middle">Kitchen  2039</text>
  <text class="d-label-strong" x="600" y="24" text-anchor="middle">RANK() OVER</text>
  <rect class="d-box-accent" x="490" y="36" width="220" height="30" rx="6"/>
  <text class="d-code" x="600" y="56" text-anchor="middle">Yoga   Mat      1</text>
  <rect class="d-box-accent" x="490" y="70" width="220" height="30" rx="6"/>
  <text class="d-code" x="600" y="90" text-anchor="middle">Yoga   Cushion  2</text>
  <rect class="d-box-accent" x="490" y="104" width="220" height="30" rx="6"/>
  <text class="d-code" x="600" y="124" text-anchor="middle">Yoga   Block    3</text>
  <rect class="d-box-success" x="490" y="146" width="220" height="30" rx="6"/>
  <text class="d-code" x="600" y="166" text-anchor="middle">Kitchen Board   1</text>
</svg>
:::

The syntax is a function followed by `OVER (...)`. Inside the parentheses, `PARTITION BY` splits rows into groups, and the calculation restarts in each group; `ORDER BY` sets the order the function walks through. Leave out PARTITION BY and the whole result is one window.

## ROW_NUMBER, RANK and DENSE_RANK

The three ranking functions differ only in how they treat ties. Here are the most frequent UAE buyers of 2025:

```sql run
WITH uae_orders AS (
  SELECT o.customer_id, COUNT(*) AS orders
  FROM orders AS o
  JOIN customers AS c ON c.customer_id = o.customer_id
  WHERE c.country = 'United Arab Emirates'
    AND o.status <> 'cancelled'
    AND o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'
  GROUP BY o.customer_id
)
SELECT
  customer_id,
  orders,
  ROW_NUMBER() OVER (ORDER BY orders DESC, customer_id) AS row_num,
  RANK()       OVER (ORDER BY orders DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY orders DESC) AS dense_rnk
FROM uae_orders
ORDER BY orders DESC, customer_id
LIMIT 8;
```

Customers 163 and 534 both placed 11 orders. `ROW_NUMBER` still gives them 4 and 5, unique positions, using `customer_id` to break the tie. `RANK` gives both 4 and then jumps to 6, like a sports table. `DENSE_RANK` gives both 4 and continues with 5.

Pick by the question. "Exactly one row per group" (the latest order, the first visit) is ROW_NUMBER. "Top 3, and include anyone tied for third" is RANK. "The three highest *values*" is DENSE_RANK.

:::mistake Non-deterministic ROW_NUMBER
`ROW_NUMBER() OVER (ORDER BY orders DESC)` without a tie-breaker numbers tied rows in whatever order the engine meets them, and that can change between runs. A report that says "customer 534 is fourth" on Monday and "fifth" on Tuesday loses trust quickly. End every ROW_NUMBER ordering with a unique column.
:::

## Top N per group

Window functions run after WHERE, in the SELECT step, so you can't filter on a rank in the same query's WHERE. The standard pattern is a CTE that computes the rank and an outer query that filters it:

```sql
WITH ranked AS (
  SELECT
    category,
    product,
    revenue,
    RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk
  FROM product_revenue
)
SELECT category, product, revenue, rnk
FROM ranked
WHERE rnk <= 2;
```

`product_revenue` here stands for the per-product revenue CTE you'd write first, using the join from the joins lesson. Building it is the exercise.

## First events: one row per customer

The same tool answers a question Huda has wanted for months: which channel brings in *new* customers? That's the channel of each customer's first order, which is one row per partition:

```sql run
WITH numbered AS (
  SELECT
    customer_id,
    channel,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY order_date, order_id
    ) AS order_seq
  FROM orders
  WHERE status <> 'cancelled'
)
SELECT channel AS first_order_channel, COUNT(*) AS customers
FROM numbered
WHERE order_seq = 1
GROUP BY channel
ORDER BY customers DESC;
```

Web acquires 268 customers, the app 172 and the marketplace 63. Compare that with total orders by channel and you'll see whether the marketplace mostly finds new buyers or serves existing ones. `order_seq` is also useful as a column in its own right: `order_seq = 2` finds second orders, the start of every repeat-purchase analysis.

## Buckets instead of positions

Sometimes the question isn't "who is first?" but "which tier is each customer in?" Karim's finance team splits customers into quartiles by lifetime revenue to compare discount usage across tiers. `NTILE(n)` deals the ordered rows into n buckets of near-equal size:

```sql run
WITH lifetime AS (
  SELECT o.customer_id,
         SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS revenue
  FROM orders AS o
  JOIN order_items AS oi ON oi.order_id = o.order_id
  WHERE o.status <> 'cancelled'
  GROUP BY o.customer_id
),
tiered AS (
  SELECT customer_id, revenue,
         NTILE(4) OVER (ORDER BY revenue DESC) AS quartile
  FROM lifetime
)
SELECT quartile,
       COUNT(*) AS customers,
       ROUND(MIN(revenue), 2) AS min_revenue,
       ROUND(SUM(revenue), 2) AS revenue
FROM tiered
GROUP BY quartile
ORDER BY quartile;
```

The top quartile's revenue dwarfs the bottom one, the familiar shape of almost every customer base. Notice the layering: aggregate to one row per customer, assign a tier with a window function, then group again by tier. Windows and GROUP BY aren't rivals; most real analyses use both, in separate steps.

`NTILE` splits by row count, not by value, so customers with identical revenue can land in different buckets. For tiers with fixed thresholds ("over 2,000 is gold"), a CASE expression is the honest tool.

:::tip Name the window once
When several functions share a window, SQLite and PostgreSQL let you define it once: `... OVER w FROM orders WINDOW w AS (PARTITION BY customer_id ORDER BY order_date, order_id)`. It keeps long SELECT lists readable and guarantees the functions agree.
:::

Ranking is one half of window functions. The other half, running totals and comparisons with the previous row, turns a monthly table into a trend, and it's next.
