---
summary: Combine the whole course in one analysis, comparing Q4 2025 with Q4 2024 by country through named CTE steps, reconciling the totals, stating caveats and writing the answer a CEO can act on.
takeaways:
  - Start a real analysis by fixing definitions (periods, revenue, statuses) in one place, so every later step uses the same ones.
  - Build the query as CTE steps at explicit grains, aggregating to one row per order before joining anything that repeats.
  - Put comparison periods side by side with FILTER, and compute growth with NULLIF so a zero base gives NULL instead of an error.
  - Reconcile the final table against an independent total and list the data caveats before you write the conclusion.
  - Report the finding in plain sentences with the numbers that support it, including what the data cannot tell you yet.
further:
  - title: SQLite WITH clause
    url: https://www.sqlite.org/lang_with.html
  - title: SQLite aggregate functions and FILTER
    url: https://www.sqlite.org/lang_aggfunc.html
quiz:
  - q: Q4 revenue grew from 52,537 to 146,825 while average order value stayed around 230 in both years. What does that tell Rania?
    options:
      - text: Customers are spending much more per order.
        why: Average order value barely moved, so basket size isn't the driver.
      - text: Prices rose sharply between the two quarters.
        why: The March 2025 price rise was 5%, nowhere near enough to explain a near-tripling of revenue, and it would show up as a higher order value.
      - text: Growth came from more orders, not bigger ones.
        why: Correct. Orders went from 228 to 642 at a similar value per order, so the story is volume, which points to acquisition and repeat purchases.
      - text: The data must be wrong because growth over 100% is impossible.
        why: Revenue can more than double from a small base. Reconcile and check the data, but don't assume large growth is an error.
    answer: 2
  - q: Jordan's Q4 revenue grew 627%, the highest of any country. How should the review present it?
    options:
      - text: Lead with it as the headline success of the quarter.
        why: Percentages on a tiny base are fragile; a few large orders can produce them.
      - text: Report it with the base, roughly 790 to 5,760, and note that a small base makes the percentage volatile.
        why: Correct. The absolute numbers let the reader judge the size of the change, which a percentage alone hides.
      - text: Leave Jordan out because it's an outlier.
        why: Dropping a country changes the total and hides real growth. Context, not omission, is the fix.
      - text: Replace the percentage with the average of all countries' growth.
        why: That reports a number that isn't Jordan's, which misleads more than the original.
    answer: 1
  - q: Why does the capstone query aggregate `order_items` into `order_revenue` before joining it to orders and customers?
    options:
      - text: Because SQLite can't join more than three tables.
        why: SQLite handles many joins; this step is about the grain of the data, not engine limits.
      - text: To make the query run faster.
        why: It may or may not be faster; the reason it's there is correctness.
      - text: To remove cancelled orders.
        why: Cancelled orders are excluded with a WHERE on `orders.status`, in a later step.
      - text: So every later step works at one row per order, and per-order counts and values aren't repeated by the item lines.
        why: Correct. With items collapsed first, `COUNT(*)` counts orders and nothing fans out, the lesson from the joins section.
    answer: 3
  - q: Sixty-three Q4 2025 orders are still 'processing' or 'shipped' on 31 December. How should they affect the report?
    options:
      - text: Include them as revenue but state that some may still be cancelled or returned, so Q4 2025 could shrink slightly.
        why: Correct. They meet the agreed definition (not cancelled), and naming the open risk keeps the number honest.
      - text: Exclude them, because revenue only counts delivered orders.
        why: That changes the definition used everywhere else in the course mid-analysis; definitions should change deliberately, not quietly.
      - text: Ignore the issue; status doesn't affect revenue.
        why: Status does matter, since cancellations and returns change what the business actually keeps.
    answer: 0
---

The last request of the year comes from Rania herself: "I'm presenting the Q4 review to the board. How did Q4 2025 compare with Q4 2024, country by country, and what's the story?" This is the whole course in one question. It needs date ranges, joins without fan-out, conditional aggregation, CTEs, sanity checks and, at the end, a few sentences a board can act on. Work through it the way you would at a real desk: definitions first, then steps, then checks, then words.

## Step 1: fix the definitions

Before any SQL, write down what each word in the question means, and put it where the query can see it:

- **Q4**: 1 October to 31 December, filtered as half-open ranges, from the first day of the quarter up to but not including 1 January, for both 2024 and 2025.
- **Revenue**: sum of `quantity * unit_price * (1 - discount)` from `order_items`, shipping excluded.
- **Which orders**: every status except 'cancelled', the definition used throughout this course.
- **Country**: the customer's country, from `customers`.
- **Grain of the answer**: one row per country.

The periods go into a tiny CTE of their own. Every later step joins to it, so changing the quarter means editing one place, not six.

## Step 2: build it in named steps

:::figure The capstone query as a pipeline of CTEs, each with its own grain
<svg viewBox="0 0 720 210" role="img" aria-labelledby="t1">
  <title id="t1">periods (one row per quarter) and order_revenue (one row per order) feed q4_orders (one row per Q4 order), which feeds by_country (one row per country), which feeds the final SELECT that adds growth and average order value.</title>
  <rect class="d-box-accent" x="20" y="30" width="160" height="50" rx="8"/>
  <text class="d-code" x="100" y="52" text-anchor="middle">periods</text>
  <text class="d-label-muted" x="100" y="71" text-anchor="middle">1 row / quarter</text>
  <rect class="d-box-accent" x="20" y="130" width="160" height="50" rx="8"/>
  <text class="d-code" x="100" y="152" text-anchor="middle">order_revenue</text>
  <text class="d-label-muted" x="100" y="171" text-anchor="middle">1 row / order</text>
  <rect class="d-box-primary" x="230" y="80" width="150" height="50" rx="8"/>
  <text class="d-code" x="305" y="102" text-anchor="middle">q4_orders</text>
  <text class="d-label-muted" x="305" y="121" text-anchor="middle">1 row / Q4 order</text>
  <rect class="d-box-primary" x="420" y="80" width="140" height="50" rx="8"/>
  <text class="d-code" x="490" y="102" text-anchor="middle">by_country</text>
  <text class="d-label-muted" x="490" y="121" text-anchor="middle">1 row / country</text>
  <rect class="d-box-success" x="600" y="80" width="105" height="50" rx="8"/>
  <text class="d-code" x="652" y="102" text-anchor="middle">SELECT</text>
  <text class="d-label-muted" x="652" y="121" text-anchor="middle">growth</text>
  <path class="d-arrow" d="M180 60 L228 95" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M180 150 L228 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M380 105 L418 105" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 105 L598 105" marker-end="url(#arrow)"/>
</svg>
:::

```sql run
WITH periods AS (
  SELECT 'Q4 2024' AS period, '2024-10-01' AS start_date, '2025-01-01' AS end_date
  UNION ALL
  SELECT 'Q4 2025', '2025-10-01', '2026-01-01'
),
order_revenue AS (
  -- grain: one row per order
  SELECT order_id, SUM(quantity * unit_price * (1 - discount)) AS revenue
  FROM order_items
  GROUP BY order_id
),
q4_orders AS (
  -- grain: one row per non-cancelled Q4 order
  SELECT p.period, c.country, o.order_id, r.revenue
  FROM orders AS o
  JOIN periods AS p
    ON o.order_date >= p.start_date AND o.order_date < p.end_date
  JOIN customers AS c ON c.customer_id = o.customer_id
  JOIN order_revenue AS r ON r.order_id = o.order_id
  WHERE o.status <> 'cancelled'
),
by_country AS (
  -- grain: one row per country
  SELECT
    country,
    SUM(revenue) FILTER (WHERE period = 'Q4 2024') AS revenue_2024,
    SUM(revenue) FILTER (WHERE period = 'Q4 2025') AS revenue_2025,
    COUNT(*)     FILTER (WHERE period = 'Q4 2025') AS orders_2025
  FROM q4_orders
  GROUP BY country
)
SELECT
  country,
  ROUND(revenue_2024, 2) AS revenue_q4_2024,
  ROUND(revenue_2025, 2) AS revenue_q4_2025,
  ROUND(100.0 * (revenue_2025 - revenue_2024) / NULLIF(revenue_2024, 0), 1) AS growth_pct,
  ROUND(revenue_2025 / orders_2025, 2) AS avg_order_value_2025
FROM by_country
ORDER BY revenue_q4_2025 DESC;
```

Every technique here has a lesson behind it. The join to `periods` uses a range condition in ON, which labels each order with its quarter and drops everything else. `order_revenue` collapses items first, so `COUNT(*)` later counts orders. `FILTER` puts both years side by side in one pass. `NULLIF` protects the growth calculation from a country with no sales last year.

## Step 3: check before you believe

Two checks take a minute and catch most mistakes. First, **reconcile**: the eight `revenue_q4_2025` values should add up to the total from a simpler query over `orders` and `order_items` alone, 146,825.44, and the 2024 column to 52,537.10. They do, to within a cent of rounding, so no fan-out or lost rows. Second, **revisit the data-quality suite**. The misfiled products don't matter at country level. Two returned orders without return records and 63 orders still 'processing' or 'shipped' do: some Q4 2025 revenue may yet be cancelled or refunded.

:::mistake Reporting a percentage without its base
Jordan grew 627%, the biggest number on the slide, from about 790 to 5,760. Put that percentage alone in a headline and the board will ask about Jordan for twenty minutes. Always show growth next to the absolute values, and call out small bases explicitly.
:::

## Step 4: write the answer

The query is not the deliverable; the answer is. Here's what goes to Rania:

> Q4 2025 revenue was 146.8k, up from 52.5k in Q4 2024 (+179%), with every country at least doubling. The growth is volume, not basket size: orders rose from 228 to 642 while average order value held at about 230. The UK is now our largest market (26.5k, up from 5.4k). Jordan's +627% comes from a small base. Caveat: 63 Q4 orders, most of them from December, were still processing or in transit at year end, so cancellations and returns could trim Q4 slightly.

Three to five sentences, the numbers that matter, one honest caveat. Notice what it doesn't say: *why* volume grew. The cohort lesson suggests where to look next, at how many of those orders came from new customers acquired in the Black Friday weeks. A good answer usually ends by pointing at the next good question.

## What you can do now

Look back at the first lesson's request about thin margins. You've gone from SELECT and LIMIT to an analysis with five named steps, built-in checks and a written conclusion. More importantly, you've built habits: write the question and grain before the query, use half-open date ranges, put right-table filters in ON, aggregate before joining, use NOT EXISTS for "never", reconcile every total, and treat NULLs and failed checks as questions. Those habits transfer to any database, any dialect and any business. The exercise below is your last one, written from a blank page.
