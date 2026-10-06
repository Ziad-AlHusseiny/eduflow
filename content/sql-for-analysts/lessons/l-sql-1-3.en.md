---
summary: Predict how NULL behaves in comparisons, filters and aggregates, test for it with IS NULL and COALESCE, and turn raw values into readable labels with CASE expressions.
takeaways:
  - Any comparison with NULL, including NULL = NULL, returns NULL (unknown), and WHERE keeps only rows where the condition is TRUE.
  - Test for missing values with IS NULL or IS NOT NULL; use IS DISTINCT FROM (or IS NOT in SQLite) for a NULL-safe "not equal".
  - COUNT(*) counts rows, COUNT(column) counts non-NULL values, and AVG ignores NULLs instead of treating them as zero.
  - A CASE expression returns the result of the first WHEN that is TRUE, so put the most specific conditions first and always decide what ELSE should be.
further:
  - title: NULL handling in SQLite versus other engines
    url: https://www.sqlite.org/nulls.html
  - title: SQLite CASE expression and IS DISTINCT FROM
    url: https://www.sqlite.org/lang_expr.html#the_case_expression
  - title: PostgreSQL comparison functions and operators
    url: https://www.postgresql.org/docs/current/functions-comparison.html
quiz:
  - q: "`orders.coupon_code` is NULL for most orders. How many rows does `WHERE coupon_code <> 'FREESHIP'` keep?"
    options:
      - text: Every order except the FREESHIP ones, NULLs included.
        why: That's the intuitive reading, but `NULL <> 'FREESHIP'` is NULL, not TRUE, so those rows are dropped.
      - text: Only orders that used some other coupon; orders without a coupon are dropped.
        why: Correct. The comparison is unknown for NULL coupons, and WHERE keeps only TRUE rows. Use `coupon_code IS DISTINCT FROM 'FREESHIP'` to keep them.
      - text: No rows, because the column contains NULLs.
        why: NULLs only affect their own rows. Orders with a non-NULL coupon still compare normally.
    answer: 1
  - q: A ticket table has 10 rows; 4 have `satisfaction` NULL and the other 6 average 4.0. What does `AVG(satisfaction)` return?
    options:
      - text: "2.4"
        why: That's what you'd get if NULLs counted as zero (24 / 10). AVG skips NULLs instead.
      - text: "NULL, because some values are missing"
        why: Aggregates ignore NULL inputs; AVG only returns NULL when every value is NULL.
      - text: "4.0"
        why: Correct. AVG divides the sum of the 6 known scores by 6. Whether that's the right number to report depends on why the other 4 are missing.
      - text: "It depends on whether you use COUNT(*) in the query"
        why: AVG's behaviour doesn't depend on other columns in the SELECT list.
    answer: 2
  - q: |
      What label does a ticket with `satisfaction = 1` get?
      ```sql
      CASE
        WHEN satisfaction <= 3 THEN 'neutral'
        WHEN satisfaction <= 2 THEN 'unhappy'
        ELSE 'happy'
      END
      ```
    options:
      - text: "'neutral'"
        why: Correct. CASE stops at the first TRUE branch, and `1 <= 3` is TRUE, so the 'unhappy' branch is never reached. Order WHENs from most to least specific.
      - text: "'unhappy'"
        why: It would be if the WHENs were in the other order. CASE doesn't look for the best match, only the first.
      - text: "'happy'"
        why: ELSE only applies when no WHEN is TRUE, and the first one is.
    answer: 0
  - q: Which expression safely computes `refunds / orders` when `orders` can be 0?
    options:
      - text: "`refunds / orders`"
        why: In SQLite, dividing by zero returns NULL rather than an error, but other engines like PostgreSQL throw, and the intent isn't visible to a reader.
      - text: "`COALESCE(refunds / orders, 0)`"
        why: This turns "can't compute" into 0, which misreports a ratio that has no denominator as a real zero.
      - text: "`refunds / NULLIF(orders, 0)`"
        why: Correct. NULLIF turns a zero denominator into NULL, so the result is NULL ("no data") in every engine, which is honest and portable.
    answer: 2
---

Julia Fischer, who leads customer support, sends two questions: "How many tickets are still open? And what's our average satisfaction score?" Both answers depend on the same value, and it's the one that causes more wrong numbers in analytics than any other: `NULL`.

In `support_tickets`, `closed_at` is NULL while a ticket is open, and `satisfaction` is NULL when the customer never rated it. NULL doesn't mean zero or empty text. It means *unknown*.

## Unknown is contagious

Try finding open tickets the way you'd find anything else:

```sql run
SELECT COUNT(*) AS open_tickets
FROM support_tickets
WHERE closed_at = NULL;
```

Zero. Is `closed_at` equal to NULL? SQL's answer is "unknown", because comparing anything with an unknown value gives an unknown result, even `NULL = NULL`. And `WHERE` keeps a row only when its condition is TRUE, never when it's unknown. The test for missing values has its own syntax:

```sql run
SELECT COUNT(*) AS open_tickets
FROM support_tickets
WHERE closed_at IS NULL;
```

56 open tickets. This is three-valued logic: every condition is TRUE, FALSE or NULL. AND and OR follow the tables below. The rule of thumb: NULL wins unless the other side settles the answer on its own (FALSE for AND, TRUE for OR).

:::figure Three-valued logic: what AND and OR return when one side is NULL
<svg viewBox="0 0 720 220" role="img" aria-labelledby="t1">
  <title id="t1">Truth tables for AND and OR over TRUE, FALSE and NULL. FALSE AND anything is FALSE; TRUE OR anything is TRUE; every other combination involving NULL is NULL.</title>
  <text class="d-label-strong" x="70" y="63" text-anchor="middle">AND</text>
  <text class="d-label-muted" x="150" y="63" text-anchor="middle">TRUE</text>
  <text class="d-label-muted" x="70" y="99" text-anchor="middle">TRUE</text>
  <text class="d-label-muted" x="230" y="63" text-anchor="middle">FALSE</text>
  <text class="d-label-muted" x="70" y="135" text-anchor="middle">FALSE</text>
  <text class="d-label-muted" x="310" y="63" text-anchor="middle">NULL</text>
  <text class="d-label-muted" x="70" y="171" text-anchor="middle">NULL</text>
  <rect class="d-box-success" x="112" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="150" y="99" text-anchor="middle">TRUE</text>
  <rect class="d-box" x="192" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="230" y="99" text-anchor="middle">FALSE</text>
  <rect class="d-box-warn" x="272" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="310" y="99" text-anchor="middle">NULL</text>
  <rect class="d-box" x="112" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="150" y="135" text-anchor="middle">FALSE</text>
  <rect class="d-box" x="192" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="230" y="135" text-anchor="middle">FALSE</text>
  <rect class="d-box" x="272" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="310" y="135" text-anchor="middle">FALSE</text>
  <rect class="d-box-warn" x="112" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="150" y="171" text-anchor="middle">NULL</text>
  <rect class="d-box" x="192" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="230" y="171" text-anchor="middle">FALSE</text>
  <rect class="d-box-warn" x="272" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="310" y="171" text-anchor="middle">NULL</text>
  <text class="d-label-strong" x="420" y="63" text-anchor="middle">OR</text>
  <text class="d-label-muted" x="500" y="63" text-anchor="middle">TRUE</text>
  <text class="d-label-muted" x="420" y="99" text-anchor="middle">TRUE</text>
  <text class="d-label-muted" x="580" y="63" text-anchor="middle">FALSE</text>
  <text class="d-label-muted" x="420" y="135" text-anchor="middle">FALSE</text>
  <text class="d-label-muted" x="660" y="63" text-anchor="middle">NULL</text>
  <text class="d-label-muted" x="420" y="171" text-anchor="middle">NULL</text>
  <rect class="d-box-success" x="462" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="500" y="99" text-anchor="middle">TRUE</text>
  <rect class="d-box-success" x="542" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="580" y="99" text-anchor="middle">TRUE</text>
  <rect class="d-box-success" x="622" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="660" y="99" text-anchor="middle">TRUE</text>
  <rect class="d-box-success" x="462" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="500" y="135" text-anchor="middle">TRUE</text>
  <rect class="d-box" x="542" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="580" y="135" text-anchor="middle">FALSE</text>
  <rect class="d-box-warn" x="622" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="660" y="135" text-anchor="middle">NULL</text>
  <rect class="d-box-success" x="462" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="500" y="171" text-anchor="middle">TRUE</text>
  <rect class="d-box-warn" x="542" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="580" y="171" text-anchor="middle">NULL</text>
  <rect class="d-box-warn" x="622" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="660" y="171" text-anchor="middle">NULL</text>
  <text class="d-label-muted" x="360" y="210" text-anchor="middle">WHERE keeps a row only when the whole condition is TRUE</text>
</svg>
:::

## Where NULL quietly drops rows

The dangerous case isn't `= NULL`, which returns nothing and gets noticed. It's a "not equal" filter on a column that has NULLs:

```sql run
SELECT
  (SELECT COUNT(*) FROM orders WHERE coupon_code <> 'BLACKFRIDAY25') AS with_not_equal,
  (SELECT COUNT(*) FROM orders WHERE coupon_code IS DISTINCT FROM 'BLACKFRIDAY25') AS null_safe;
```

264 versus 1,942. "Orders that didn't use BLACKFRIDAY25" obviously includes the 1,678 orders with no coupon at all, but `<>` dropped every one of them. `IS DISTINCT FROM` treats NULL as a comparable value, so it's the NULL-safe version of `<>`. SQLite also accepts the shorter `IS NOT 'BLACKFRIDAY25'`; PostgreSQL only accepts `IS DISTINCT FROM`.

:::mistake NOT IN with a NULL in the list
`2 NOT IN (1, NULL)` is NULL, not TRUE, because SQL can't rule out that the unknown value is 2. So a `NOT IN (subquery)` whose subquery returns a single NULL keeps **no rows at all**. You'll meet this for real in the anti-join lesson; for now, remember that `NOT IN` and nullable columns don't mix.
:::

## NULL in aggregates

Aggregates skip NULLs, which is usually what you want but always worth stating:

```sql run
SELECT
  COUNT(*)                     AS tickets,
  COUNT(satisfaction)          AS rated,
  ROUND(AVG(satisfaction), 2)  AS avg_score,
  ROUND(AVG(COALESCE(satisfaction, 0)), 2) AS wrong_avg
FROM support_tickets;
```

`COUNT(*)` counts rows (873); `COUNT(satisfaction)` counts known values (588). `AVG` divides by the known count, giving 3.74. Replacing NULL with 0 using `COALESCE` drags the average to 2.52, inventing 285 furious customers who never said anything. Report Julia the 3.74 *and* the response rate, 588 of 873: an average over two-thirds of tickets should say so.

`COALESCE(a, b, ...)` returns its first non-NULL argument and is right for display defaults, like `COALESCE(coupon_code, 'none')`. Its mirror image is `NULLIF(a, b)`, which returns NULL when `a = b`. Dividing by `NULLIF(denominator, 0)` gives NULL instead of a divide-by-zero error in engines that raise one.

## Decide what each NULL means

NULL is one marker for several different situations, and the right treatment depends on which one you're looking at. In Cartwheel alone:

- `closed_at` is NULL because the event **hasn't happened yet**. Count these as open, and exclude them from resolution times.
- `satisfaction` is NULL because the customer **didn't answer**. Report the response rate next to the average.
- `coupon_code` is NULL because the order had **no coupon**. Here NULL really means "none", so `COALESCE(coupon_code, 'none')` is a fair label.
- `referred_by` is NULL because the customer **wasn't referred**, or because nobody recorded it. You can't tell which, and you should say so.

NULLs also affect sorting. SQLite puts NULLs first in ascending order and last in descending order; PostgreSQL does the opposite. If the position matters, say it explicitly with `ORDER BY satisfaction NULLS LAST`, which both engines accept.

## CASE: labels from logic

Julia also wants a readable status for each ticket; that one is your exercise. Here is the same tool on orders, labelling how each one was priced. `CASE` evaluates its WHEN conditions top to bottom and returns the first match:

```sql run
SELECT
  order_id,
  coupon_code,
  shipping_fee,
  CASE
    WHEN coupon_code IS NULL AND shipping_fee = 0 THEN 'free shipping only'
    WHEN coupon_code IS NULL THEN 'full price'
    WHEN coupon_code = 'FREESHIP' THEN 'coupon: shipping'
    ELSE 'coupon: discount'
  END AS price_type
FROM orders
ORDER BY order_id
LIMIT 6;
```

Two rules make CASE reliable. Order the WHENs from most specific to most general, because the first TRUE branch wins and the rest are never checked. And write an ELSE on purpose: without one, unmatched rows get NULL, which then flows into everything downstream. SQLite also has `IIF(condition, a, b)` for two-way choices, but CASE is standard SQL and works in every engine.

Missing values are one source of surprise; dates are the other, and they're next.
