---
summary: Build a conversion funnel from session events with conditional aggregation, then group customers into monthly cohorts by first order and measure how many come back in later months.
takeaways:
  - A funnel counts how many units reach each step and divides each step by the one before it, so you can see exactly where people drop off.
  - Always state the denominator of a rate; checkout rate (purchases per cart) and conversion rate (purchases per session) answer different questions.
  - A cohort groups customers by the period of their first event, and retention counts distinct customers active N periods later divided by the cohort size.
  - Months a recent cohort hasn't lived through yet are unknown, not zero; show them as NULL so nobody reads them as churn.
further:
  - title: SQLite aggregate functions and FILTER
    url: https://www.sqlite.org/lang_aggfunc.html
  - title: SQLite date and time functions
    url: https://www.sqlite.org/lang_datefunc.html
quiz:
  - q: "Email sessions: 404 sessions, 107 add to cart, 44 purchase. Which number is the checkout rate?"
    options:
      - text: "10.9%, purchases divided by sessions"
        why: That's the overall conversion rate. It mixes two steps and hides where people drop off.
      - text: "26.5%, carts divided by sessions"
        why: That's the cart rate, the first step of the funnel.
      - text: "73.5%, sessions that didn't add to cart"
        why: That's the drop-off at the first step, not a checkout measure.
      - text: "41.1%, purchases divided by carts"
        why: Correct. Checkout rate measures the step from cart to purchase, so its denominator is carts.
    answer: 3
  - q: Why does the cohort query use `SELECT DISTINCT cohort, customer_id, month_number` before counting?
    options:
      - text: So a customer who orders three times in one month counts as one active customer, not three.
        why: Correct. Retention is about people. Without DISTINCT, frequent buyers inflate the active count and can push retention above 100%.
      - text: Because COUNT doesn't work without DISTINCT in a CTE.
        why: COUNT works anywhere; DISTINCT is about the grain of the activity table, not syntax.
      - text: To sort the cohorts in chronological order.
        why: DISTINCT removes duplicates; it doesn't promise any order.
    answer: 0
  - q: The December 2025 cohort shows 0% retention in month 1. The data ends on 2025-12-31. What should the table show?
    options:
      - text: "0%, because none of them ordered in month 1"
        why: Month 1 for the December cohort is January 2026, which isn't in the data. Zero would claim they all churned.
      - text: The same value as the November cohort, as an estimate.
        why: Filling in another cohort's value invents data and hides that the period hasn't happened.
      - text: NULL or blank, because that month hasn't been observed yet.
        why: Correct. Unobserved cells are unknown. A CASE expression that checks whether the cohort month plus N is within the data range makes this explicit.
    answer: 2
  - q: To compute "months since first order" across a year boundary, why convert dates to `year * 12 + month` instead of subtracting `strftime('%m', ...)` values?
    options:
      - text: strftime can't return the month.
        why: It can, with '%m'. The problem is what happens when you subtract months from different years.
      - text: December 2024 to January 2025 is 1 month apart, but 1 - 12 gives -11; a single month index makes the difference correct.
        why: Correct. Turning each month into one increasing number makes month differences simple subtraction, across any year boundary.
      - text: It's faster to compute.
        why: Speed isn't the issue; the subtraction of plain month numbers is wrong across years.
    answer: 1
---

Two requests sit at the top of the queue. Huda: "Our paid search budget is up for review. Which traffic sources actually turn visits into orders, and where do people drop off?" Rania: "We acquired a lot of customers in Black Friday months. Do they come back as often as everyone else?" The first is a **funnel**, the second a **cohort retention** analysis. Both are built from things you already know: conditional aggregation, dates and CTEs.

## A funnel from session events

Each row of `web_sessions` is one visit, with flags for the steps it reached: `added_to_cart` and `purchased` (0 or 1). Summing a 0/1 flag counts the sessions that reached the step, so a funnel is one GROUP BY:

```sql run
SELECT
  source,
  COUNT(*)            AS sessions,
  SUM(added_to_cart)  AS carts,
  SUM(purchased)      AS purchases,
  ROUND(100.0 * SUM(added_to_cart) / COUNT(*), 1)                  AS cart_rate,
  ROUND(100.0 * SUM(purchased) / NULLIF(SUM(added_to_cart), 0), 1) AS checkout_rate,
  ROUND(100.0 * SUM(purchased) / COUNT(*), 1)                      AS conversion
FROM web_sessions
WHERE started_at >= '2025-01-01'
GROUP BY source
ORDER BY conversion DESC;
```

Email converts best overall, 10.9% of sessions, and referral worst at 7.1%. The step rates tell the more useful story. Referral visitors rarely add to cart (13.3%), but those who do check out more often than anyone (53.6%). Email is the reverse. Those are different problems with different fixes: referral needs better landing pages, email needs a smoother checkout.

That's why a funnel reports **step rates**, each step divided by the previous one, not only end-to-end conversion. Make each denominator explicit in the column name; "conversion rate" without a denominator is the most argued-about number in any marketing meeting. `NULLIF` guards the division for a source with no carts.

:::tip Check the funnel is a funnel
Each step should be a subset of the previous one. Before reporting, run `SELECT COUNT(*) FROM web_sessions WHERE purchased = 1 AND added_to_cart = 0`. On Cartwheel's data it's 0. If it weren't, a purchase without a cart would be a tracking bug, and your step rates could exceed 100%.
:::

Swap `source` for `device` and a sharper finding appears: desktop sessions that reach the cart check out 56% of the time, mobile sessions only 37%. Mobile brings the most traffic, so that gap is worth more than any change to the ad budget.

## Cohorts: grouping customers by when they started

A **cohort** is a group of customers who share a starting period. Here, the month of their first non-cancelled order. Retention then asks: of the customers who started in month M, what share ordered again 1, 2, 3 months later?

Three steps, three CTEs. First, give every order a **month index**, `year * 12 + month`, so that month differences are simple subtraction even across a year boundary. Second, find each customer's first month. Third, list each customer's active months relative to their cohort:

```sql run
WITH orders_ok AS (
  SELECT customer_id, order_date,
         CAST(strftime('%Y', order_date) AS INTEGER) * 12
           + CAST(strftime('%m', order_date) AS INTEGER) AS month_index
  FROM orders
  WHERE status <> 'cancelled'
),
firsts AS (
  -- grain: one row per customer
  SELECT customer_id,
         MIN(month_index) AS cohort_index,
         strftime('%Y-%m', MIN(order_date)) AS cohort
  FROM orders_ok
  GROUP BY customer_id
),
activity AS (
  -- grain: one row per customer per active month
  SELECT DISTINCT f.cohort, f.cohort_index, o.customer_id,
         o.month_index - f.cohort_index AS month_number
  FROM orders_ok AS o
  JOIN firsts AS f ON f.customer_id = o.customer_id
)
SELECT
  cohort,
  COUNT(*) FILTER (WHERE month_number = 0) AS customers,
  ROUND(100.0 * COUNT(*) FILTER (WHERE month_number = 1)
        / COUNT(*) FILTER (WHERE month_number = 0), 1) AS m1_pct,
  CASE WHEN MAX(cohort_index) + 2 <= 2025 * 12 + 12 THEN
    ROUND(100.0 * COUNT(*) FILTER (WHERE month_number = 2)
          / COUNT(*) FILTER (WHERE month_number = 0), 1)
  END AS m2_pct
FROM activity
WHERE cohort >= '2025-07'
GROUP BY cohort
ORDER BY cohort;
```

The final SELECT pivots month numbers into columns with `FILTER`. The `DISTINCT` in `activity` is essential: retention counts *people*, and a customer who orders three times in a month is one active customer.

:::figure A cohort table is a triangle: recent cohorts haven't lived long enough to measure
<svg viewBox="0 0 720 230" role="img" aria-labelledby="t1">
  <title id="t1">Cohorts from September to December 2025 against months 0 to 3. September has all four months measured; October three; November two; December only month 0. The cells after the end of the data are unknown, not zero.</title>
  <text class="d-label-muted" x="250" y="30" text-anchor="middle">m0</text>
  <text class="d-label-muted" x="370" y="30" text-anchor="middle">m1</text>
  <text class="d-label-muted" x="490" y="30" text-anchor="middle">m2</text>
  <text class="d-label-muted" x="610" y="30" text-anchor="middle">m3</text>
  <text class="d-code" x="110" y="68" text-anchor="middle">2025-09</text>
  <text class="d-code" x="110" y="113" text-anchor="middle">2025-10</text>
  <text class="d-code" x="110" y="158" text-anchor="middle">2025-11</text>
  <text class="d-code" x="110" y="203" text-anchor="middle">2025-12</text>
  <rect class="d-box-primary" x="195" y="45" width="110" height="36" rx="6"/>
  <text class="d-code" x="250" y="68" text-anchor="middle">100%</text>
  <rect class="d-box-accent" x="315" y="45" width="110" height="36" rx="6"/>
  <text class="d-code" x="370" y="68" text-anchor="middle">43.5%</text>
  <rect class="d-box-accent" x="435" y="45" width="110" height="36" rx="6"/>
  <text class="d-code" x="490" y="68" text-anchor="middle">39.1%</text>
  <rect class="d-box-accent" x="555" y="45" width="110" height="36" rx="6"/>
  <text class="d-code" x="610" y="68" text-anchor="middle">30.4%</text>
  <rect class="d-box-primary" x="195" y="90" width="110" height="36" rx="6"/>
  <text class="d-code" x="250" y="113" text-anchor="middle">100%</text>
  <rect class="d-box-accent" x="315" y="90" width="110" height="36" rx="6"/>
  <text class="d-code" x="370" y="113" text-anchor="middle">44.4%</text>
  <rect class="d-box-accent" x="435" y="90" width="110" height="36" rx="6"/>
  <text class="d-code" x="490" y="113" text-anchor="middle">27.8%</text>
  <rect class="d-box d-dashed" x="555" y="90" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="610" y="113" text-anchor="middle">not yet</text>
  <rect class="d-box-primary" x="195" y="135" width="110" height="36" rx="6"/>
  <text class="d-code" x="250" y="158" text-anchor="middle">100%</text>
  <rect class="d-box-accent" x="315" y="135" width="110" height="36" rx="6"/>
  <text class="d-code" x="370" y="158" text-anchor="middle">36.2%</text>
  <rect class="d-box d-dashed" x="435" y="135" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="490" y="158" text-anchor="middle">not yet</text>
  <rect class="d-box d-dashed" x="555" y="135" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="610" y="158" text-anchor="middle">not yet</text>
  <rect class="d-box-primary" x="195" y="180" width="110" height="36" rx="6"/>
  <text class="d-code" x="250" y="203" text-anchor="middle">100%</text>
  <rect class="d-box d-dashed" x="315" y="180" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="370" y="203" text-anchor="middle">not yet</text>
  <rect class="d-box d-dashed" x="435" y="180" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="490" y="203" text-anchor="middle">not yet</text>
  <rect class="d-box d-dashed" x="555" y="180" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="610" y="203" text-anchor="middle">not yet</text>
</svg>
:::

## Unknown is not zero

Look at the December 2025 row in the query's output: `m1_pct` is 0.0. That isn't churn. Month 1 for December's cohort is January 2026, and the data ends on 31 December. The `m2_pct` column shows the fix: a CASE expression checks whether the cohort has lived through that month (`cohort_index + 2` is still within December 2025) and returns NULL otherwise. A retention chart with honest blanks is a triangle; one with zeros shows a fake collapse in every recent cohort.

:::mistake Counting orders instead of customers
Drop the DISTINCT from `activity` and a single loyal customer with four orders in October adds 4 to October's "active customers". Retention climbs, sometimes past 100%. Whenever a rate is about people, check that its numerator and denominator are counts of distinct people, at the same grain.
:::

Back to Rania's question. Change the filter to 2024 and the November 2024 cohort, Cartwheel's first Black Friday crowd and the largest of that year at 35 customers, retains only 14.3% in month 1, below most 2024 cohorts. Deep-discount customers tend to come for the deal. That's an answer she can use when planning the next promotion. The exercise asks a related question: what share of each cohort comes back at all within three months?

This closes the analytical toolkit. The final section is about trust: making sure the data and your queries deserve it.
