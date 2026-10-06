---
summary: Turn a monthly or daily table into a trend with running totals, year-to-date resets, LAG and LEAD comparisons, and moving averages over explicit ROWS frames, including filling missing days first.
takeaways:
  - SUM(x) OVER (ORDER BY period) is a running total; adding PARTITION BY year makes it reset each year, which is year-to-date.
  - LAG(x) reads the previous row's value and LEAD(x) the next one, so period-over-period change is x - LAG(x).
  - A moving average needs an explicit frame, such as ROWS BETWEEN 6 PRECEDING AND CURRENT ROW, and a row for every period, including empty ones.
  - Window functions run after WHERE, so filter the displayed range in an outer query or the window will only see the filtered rows.
further:
  - title: SQLite window functions, frame specifications
    url: https://www.sqlite.org/windowfunctions.html#frame_specifications
  - title: PostgreSQL window function calls
    url: https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS
quiz:
  - q: "`SUM(revenue) OVER ()` is added to a monthly revenue table. What does every row show?"
    options:
      - text: The running total up to that month.
        why: A running total needs an ORDER BY inside OVER. Without it, the window is the whole result.
      - text: The previous month's revenue.
        why: That's LAG(revenue) OVER (ORDER BY month).
      - text: That month's revenue, unchanged.
        why: A window SUM adds up every row in the window, which here is all rows, not just the current one.
      - text: The grand total of all months.
        why: Correct. An empty OVER () makes one window containing every row, so each row gets the same total.
    answer: 3
  - q: Monthly orders are 84, 63 and 70 for January to March. What does `orders - LAG(orders) OVER (ORDER BY month)` return for January, February and March?
    options:
      - text: "0, -21, 7"
        why: LAG has no previous row for January, so it returns NULL, and so does the subtraction, not 0.
      - text: "-21, 7, NULL"
        why: That's the LEAD-based version, comparing each month with the next one.
      - text: "NULL, -21, 7"
        why: Correct. January has no previous row; February is 63 - 84; March is 70 - 63. Pass a default, `LAG(orders, 1, 0)`, only if 0 is truly the right baseline.
    answer: 2
  - q: Daily orders are missing on days with no sales. What's wrong with `AVG(orders) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` on that table?
    options:
      - text: The frame covers the last 7 rows, which can span far more than 7 days, so quiet days are ignored and the average is too high.
        why: Correct. ROWS counts rows, not dates. Fill the calendar with a row for every day (0 orders) before averaging.
      - text: AVG can't be used as a window function.
        why: Every aggregate, AVG included, can be used with OVER.
      - text: ROWS frames are not supported in SQLite.
        why: SQLite has supported ROWS frames since window functions arrived in version 3.25 (2018).
    answer: 0
  - q: |
      This query should show a 7-day moving average for the last week of December only. Why are the first values too low?
      ```sql
      SELECT day, AVG(orders) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
      FROM filled_days
      WHERE day >= '2025-12-25';
      ```
    options:
      - text: The frame should be RANGE, not ROWS.
        why: The frame type isn't the issue. The earlier days the frame needs were removed by WHERE before the window ran, and no frame can see rows that aren't there.
      - text: AVG ignores days with 0 orders.
        why: AVG ignores NULLs, not zeros. Zeros are averaged in like any other number.
      - text: The ORDER BY should be descending.
        why: Descending order would make the frame look forward in time, which isn't a trailing average.
      - text: WHERE runs before the window, so for 25 December the frame has no earlier days to average over.
        why: Correct. Compute the moving average over the full range in a CTE, then filter the days you want to display in the outer query.
    answer: 3
---

Rania's monthly business review needs three things on one slide: revenue by month, how much of the year's total has accumulated so far, and whether each month grew on the last. You could compute the year-to-date figure in a spreadsheet afterwards. But the same window functions that ranked products last lesson can also *accumulate* and *compare*, so the whole table comes straight out of SQL, reproducibly.

## Running totals and year-to-date

A window aggregate with an `ORDER BY` inside `OVER` becomes a running calculation: each row sees the rows up to itself. Add `PARTITION BY` and it restarts per group. Here are Cartwheel's monthly orders with a year-to-date count that resets each January:

```sql run
WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY month
)
SELECT
  month,
  orders,
  SUM(orders) OVER (
    PARTITION BY substr(month, 1, 4)
    ORDER BY month
  ) AS orders_ytd
FROM monthly
ORDER BY month
LIMIT 14;
```

The partition key is the year, taken from the first four characters of the month label. December 2024 closes the year at 552 orders, and January 2025 starts again at 84.

Two windows on the same row combine nicely. Dividing the running total by the total of the whole partition, `100.0 * SUM(orders) OVER (PARTITION BY substr(month, 1, 4) ORDER BY month) / SUM(orders) OVER (PARTITION BY substr(month, 1, 4))`, gives the cumulative share of the year reached by each month. For a seasonal business like Cartwheel, that's the number finance actually tracks: by the end of October 2025, the year was just under two-thirds done.

:::mistake Forgetting ORDER BY inside OVER
`SUM(orders) OVER ()` and `SUM(orders) OVER (PARTITION BY year)` don't produce running totals; every row gets the full total of its window. It's the ORDER BY inside the parentheses that makes the window grow row by row. If every row of your "running total" shows the same number, that's the missing piece.
:::

## Comparing with the previous row

`LAG(x)` returns the value of `x` from the previous row in the window order, and `LEAD(x)` from the next. Period-over-period change is then simple arithmetic:

```sql run
WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY month
)
SELECT
  month,
  orders,
  LAG(orders) OVER (ORDER BY month) AS prev_month,
  orders - LAG(orders) OVER (ORDER BY month) AS change,
  ROUND(100.0 * (orders - LAG(orders) OVER (ORDER BY month))
        / NULLIF(LAG(orders) OVER (ORDER BY month), 0), 1) AS change_pct,
  LAG(orders, 12) OVER (ORDER BY month) AS same_month_last_year
FROM monthly
ORDER BY month DESC
LIMIT 4;
```

November 2025 jumped by 193 orders, then December fell by 140: Black Friday, then the hangover. Month-over-month numbers are noisy for a seasonal business, which is why the last column uses `LAG(orders, 12)`, the value twelve rows back, for a year-over-year view: 325 orders this November against 120 last November.

`LAG(orders, 12)` is only "the same month last year" if every month has a row. A month with no orders would have no row, and every comparison after it would silently shift by one month. That assumption is about to matter.

## Moving averages and the frame

A moving average smooths daily noise. The window needs an explicit **frame**, the range of rows around the current one that the aggregate sees: `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` is the current row plus the six before it.

:::figure A ROWS frame slides along the ordered rows
<svg viewBox="0 0 720 170" role="img" aria-labelledby="t1">
  <title id="t1">Ten daily rows in order. For the current row, day 9, the frame ROWS BETWEEN 6 PRECEDING AND CURRENT ROW covers days 3 through 9, seven rows. When the current row moves forward one day, the frame moves with it.</title>
  <rect class="d-box" x="20" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="50" y="85" text-anchor="middle">d1</text>
  <rect class="d-box" x="88" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="118" y="85" text-anchor="middle">d2</text>
  <rect class="d-box-accent" x="156" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="186" y="85" text-anchor="middle">d3</text>
  <rect class="d-box-accent" x="224" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="254" y="85" text-anchor="middle">d4</text>
  <rect class="d-box-accent" x="292" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="322" y="85" text-anchor="middle">d5</text>
  <rect class="d-box-accent" x="360" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="390" y="85" text-anchor="middle">d6</text>
  <rect class="d-box-accent" x="428" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="458" y="85" text-anchor="middle">d7</text>
  <rect class="d-box-accent" x="496" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="526" y="85" text-anchor="middle">d8</text>
  <rect class="d-box-primary" x="564" y="60" width="60" height="40" rx="6"/>
  <text class="d-label-strong" x="594" y="85" text-anchor="middle">d9</text>
  <rect class="d-box" x="632" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="662" y="85" text-anchor="middle">d10</text>
  <path class="d-line" d="M156 120 L624 120"/>
  <path class="d-line" d="M156 112 L156 128"/>
  <path class="d-line" d="M624 112 L624 128"/>
  <text class="d-label" x="390" y="150" text-anchor="middle">frame: 6 PRECEDING to CURRENT ROW (7 rows)</text>
  <text class="d-label-muted" x="594" y="40" text-anchor="middle">current row</text>
</svg>
:::

The frame counts **rows**, not days. If a day has no orders, it has no row, and the frame quietly stretches further back in time. Cartwheel's first month shows how badly that can mislead: in January 2024 only 8 orders arrived, on 8 different days. A 7-row average over the existing rows says "1.0 orders a day" all month. The truth is about a quarter of that.

The fix is a calendar: generate one row per day with a recursive CTE, LEFT JOIN the daily counts, and turn missing days into zeros:

```sql run
WITH RECURSIVE days(day) AS (
  SELECT '2024-01-01'
  UNION ALL
  SELECT date(day, '+1 day') FROM days WHERE day < '2024-01-31'
),
daily AS (
  SELECT date(order_date) AS day, COUNT(*) AS orders
  FROM orders
  WHERE status <> 'cancelled'
    AND order_date >= '2024-01-01' AND order_date < '2024-02-01'
  GROUP BY day
),
filled AS (
  SELECT d.day, COALESCE(x.orders, 0) AS orders
  FROM days AS d
  LEFT JOIN daily AS x ON x.day = d.day
),
smoothed AS (
  SELECT day, orders,
         ROUND(AVG(orders) OVER (
           ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
         ), 2) AS orders_7d_avg
  FROM filled
)
SELECT * FROM smoothed
WHERE day >= '2024-01-25'
ORDER BY day;
```

Now 31 January shows 0.43 orders a day over the last week, the honest number. Notice where the date filter sits: in the final SELECT, *after* the moving average is computed in `smoothed`. Window functions run after WHERE, so filtering in the same query would leave the first displayed days with no history to average. The same calendar trick protects `LAG(orders, 12)` from missing months.

:::tip ROWS, not the default
With an ORDER BY and no frame, a window aggregate uses `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, which treats rows with equal sort values as one step: all of them get the same running total. When the sort key isn't unique, write `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` to get a strict row-by-row running total.
:::

You can now rank, accumulate and compare. The next lesson puts these tools to work on the two analyses every product team asks for: funnels and cohort retention.
