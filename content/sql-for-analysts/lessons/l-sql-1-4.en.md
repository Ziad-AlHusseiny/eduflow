---
summary: Filter, group and measure time in SQLite using ISO date text, half-open date ranges, strftime() for date parts and julianday() for durations, without losing the last day of a period.
takeaways:
  - SQLite stores dates as ISO-8601 text, which sorts chronologically, so plain string comparison works as a date filter.
  - Filter a period with a half-open range (>= start AND < next start); BETWEEN with a date-only upper bound drops everything after midnight on the last day.
  - strftime() extracts parts like the month ('%Y-%m'), weekday ('%w', 0 = Sunday) or hour ('%H') as text.
  - julianday(later) - julianday(earlier) gives a duration in fractional days; multiply by 24 for hours.
  - Anchor "as of" calculations on a fixed date instead of 'now' so the same query gives the same answer tomorrow.
further:
  - title: SQLite date and time functions
    url: https://www.sqlite.org/lang_datefunc.html
  - title: PostgreSQL date/time functions and operators
    url: https://www.postgresql.org/docs/current/functions-datetime.html
quiz:
  - q: "`order_date` holds values like '2025-11-30 19:55:30'. Which filter returns every order placed in November 2025?"
    options:
      - text: "`order_date BETWEEN '2025-11-01' AND '2025-11-30'`"
        why: "'2025-11-30 19:55:30' sorts after '2025-11-30', so every order on 30 November after midnight is dropped."
      - text: "`order_date >= '2025-11-01' AND order_date < '2025-12-01'`"
        why: Correct. A half-open range includes all of the last day, whatever the time, and works the same for any period length.
      - text: "`order_date > '2025-11-01' AND order_date < '2025-11-30'`"
        why: "This loses all of 30 November: every '2025-11-30 …' value sorts after '2025-11-30', so `< '2025-11-30'` rejects it. The first day survives only because times sort after the bare date."
      - text: "`order_date = '2025-11'`"
        why: Equality compares the full text, and no value is exactly '2025-11'.
    answer: 1
  - q: "What does `strftime('%m', '2025-03-09 14:00:00')` return?"
    options:
      - text: The number 3
        why: strftime always returns text. That's why comparing it with the integer 3 fails; compare with '03'.
      - text: The text '03'
        why: Correct. '%m' is the two-digit month as text. Use `CAST(... AS INTEGER)` if you need a number.
      - text: The text 'March'
        why: SQLite's strftime has no month-name format; you'd build names with a CASE expression.
    answer: 1
  - q: A ticket opened at '2025-12-04 17:56:18' and closed at '2025-12-05 01:56:18'. What does `(julianday(closed_at) - julianday(opened_at)) * 24` return?
    options:
      - text: "1, because the dates are one day apart"
        why: julianday keeps the time of day, so the difference is a fraction of a day, not a calendar-day count.
      - text: "0.33"
        why: That's the difference in days (8 / 24). Multiplying by 24 converts it to hours.
      - text: "8.0"
        why: Correct. The difference is a third of a day, and times 24 that's 8 hours.
      - text: An error, because you can't subtract text
        why: julianday() converts the text to a number of days first, so the subtraction is numeric.
    answer: 2
  - q: You compute customer tenure with `julianday('now') - julianday(signup_date)`. Why might a colleague object?
    options:
      - text: julianday() doesn't accept 'now'.
        why: It does; 'now' is a valid time value in every SQLite date function.
      - text: The result changes every day, so last week's report can't be reproduced.
        why: Correct. For a dataset that ends on 2025-12-31, anchor on that date (or a parameter) so the number means the same thing every time it's run.
      - text: Tenure must be computed in months, not days.
        why: The unit is a reporting choice; days are fine and easy to convert.
    answer: 1
---

Mark Evans, VP Operations, is preparing a November review. He wants two numbers: how many orders Cartwheel took in November 2025, and how quickly support resolved tickets. Both are date questions, and SQLite handles dates differently from most databases. Once you see how, it's simple and predictable.

## Dates are text, and that's fine

SQLite has no separate date type. Cartwheel stores `order_date` as ISO-8601 text: `'2025-11-28 19:55:30'`. Because the format runs from largest unit to smallest, alphabetical order *is* chronological order. Comparing strings compares moments in time, and an index on the column works for date ranges.

Here's the obvious November query:

```sql run
SELECT COUNT(*) AS november_orders
FROM orders
WHERE order_date BETWEEN '2025-11-01' AND '2025-11-30';
```

336 orders. It's wrong by 11.

:::figure A date-only upper bound means midnight at the start of the last day
<svg viewBox="0 0 720 200" role="img" aria-labelledby="t1">
  <title id="t1">A timeline from 29 November to 1 December. BETWEEN '2025-11-01' AND '2025-11-30' stops at midnight at the start of 30 November, missing an order at 19:55 that day. The half-open range, less than '2025-12-01', covers all of 30 November.</title>
  <path class="d-line" d="M40 90 L680 90"/>
  <path class="d-line" d="M120 80 L120 100"/>
  <path class="d-line" d="M360 80 L360 100"/>
  <path class="d-line" d="M600 80 L600 100"/>
  <text class="d-code" x="120" y="125" text-anchor="middle">11-29</text>
  <text class="d-code" x="360" y="125" text-anchor="middle">11-30 00:00</text>
  <text class="d-code" x="600" y="125" text-anchor="middle">12-01 00:00</text>
  <circle class="d-dot" cx="560" cy="90" r="7"/>
  <text class="d-label" x="560" y="70" text-anchor="middle">order 19:55</text>
  <rect class="d-box-warn" x="40" y="140" width="320" height="26" rx="6"/>
  <text class="d-code" x="200" y="158" text-anchor="middle">BETWEEN … AND '2025-11-30'</text>
  <rect class="d-box-success" x="40" y="170" width="560" height="26" rx="6"/>
  <text class="d-code" x="320" y="188" text-anchor="middle">&gt;= '2025-11-01' AND &lt; '2025-12-01'</text>
  <rect class="d-box-primary" x="40" y="20" width="200" height="30" rx="6"/>
  <text class="d-label" x="140" y="40" text-anchor="middle">time runs right</text>
</svg>
:::

`'2025-11-30'` is shorter than `'2025-11-30 19:55:30'`, and a shorter string that matches the start sorts first. So the upper bound is effectively midnight at the *start* of 30 November, and everything later that day falls outside. The fix is a half-open range: include the start, exclude the start of the next period.

```sql run
SELECT COUNT(*) AS november_orders
FROM orders
WHERE order_date >= '2025-11-01'
  AND order_date <  '2025-12-01';
```

347, the real number. On the busiest days of the Black Friday weekend, those 11 missing orders would be a visible hole in Mark's chart.

:::mistake BETWEEN on datetimes
`BETWEEN '2025-11-01' AND '2025-11-30'` looks right and is quietly wrong whenever the column holds a time. Make half-open ranges your default for every period filter: they work for days, months and years, with or without times, and in every database.
:::

## Pulling dates apart

`strftime(format, value)` returns parts of a date as **text**:

| Format | Returns | Example |
|---|---|---|
| `'%Y-%m'` | year and month | `'2025-11'` |
| `'%Y'` | year | `'2025'` |
| `'%w'` | weekday, 0 = Sunday | `'5'` |
| `'%H'` | hour, 00–23 | `'19'` |

`'%Y-%m'` is the workhorse: it turns a timestamp into a month label you can group by in the next lesson. Because the result is text, compare it with text: `strftime('%w', order_date) = '0'` finds Sunday orders, while `= 0` finds nothing.

`date()` and `datetime()` normalise a value and accept **modifiers**, which make period boundaries easy:

```sql run
SELECT
  date('2025-11-28 19:55:30')                                   AS just_the_date,
  date('2025-11-28', 'start of month')                          AS month_start,
  date('2025-11-28', 'start of month', '+1 month')              AS next_month_start,
  date('2025-11-28', 'start of month', '+1 month', '-1 day')    AS month_end,
  date('2025-11-28', '-6 days')                                 AS week_ago;
```

Modifiers apply left to right. `'start of month', '+1 month'` is exactly the exclusive upper bound a half-open range needs.

## Rolling windows and weekdays

"Orders in the last 30 days" is a rolling window, and it hides an off-by-one question: does "last 30 days" as of 31 December include the 31st? Usually yes, which means the window starts on 2 December, 29 days earlier. Build both bounds from the anchor date so the window moves with it:

```sql run
SELECT COUNT(*) AS orders_last_30_days
FROM orders
WHERE order_date >= date('2025-12-31', '-29 days')
  AND order_date <  date('2025-12-31', '+1 day');
```

189 orders. The upper bound is the start of the day *after* the anchor, the same half-open idea as before. Write the window's first and last day in a comment above the query; whoever reviews it will check exactly that.

Weekday analysis combines `strftime('%w', ...)` with the CASE expressions from the previous lesson. Mapping '0' and '6' to weekend labels is a common first cut when marketing asks whether weekend campaigns are worth it:

```sql run
SELECT
  order_id,
  order_date,
  CASE strftime('%w', order_date)
    WHEN '0' THEN 'weekend'
    WHEN '6' THEN 'weekend'
    ELSE 'weekday'
  END AS day_type
FROM orders
ORDER BY order_date DESC
LIMIT 5;
```

This CASE uses the *simple* form, `CASE value WHEN x THEN ...`, which compares one value against a list. It's handy for mappings like this one; use the searched form, `CASE WHEN condition THEN ...`, whenever a branch needs a real condition.

## Measuring durations

`julianday()` converts a date to a number of days (with fractions for the time). Subtract two and you have a duration in days; multiply by 24 for hours. Here are December's urgent tickets with their resolution times:

```sql run
SELECT
  ticket_id,
  opened_at,
  closed_at,
  ROUND((julianday(closed_at) - julianday(opened_at)) * 24, 1) AS hours_to_close
FROM support_tickets
WHERE priority = 'urgent'
  AND opened_at >= '2025-12-01'
ORDER BY opened_at;
```

Ticket 691 has no `closed_at`, so its duration is NULL. That's correct: it isn't zero hours, it's unfinished, and any average you compute later will skip it rather than flatter the team.

:::tip Pick an "as of" date
`julianday('now')` changes every second, so a tenure or "days since last order" metric drifts each time it's run. Cartwheel's data ends on 2025-12-31; write `julianday('2025-12-31')` (or a single CTE holding the as-of date, as you'll see later) so results are reproducible.
:::

You can now filter and measure time. Mark's other question, average resolution time *per priority*, needs one more idea: collapsing many rows into one per group. That's next.
