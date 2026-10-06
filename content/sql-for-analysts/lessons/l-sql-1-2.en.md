---
summary: Write WHERE clauses that say exactly what you mean with AND, OR, IN, BETWEEN and LIKE, and sort results deterministically with multi-key ORDER BY, LIMIT and OFFSET.
takeaways:
  - AND binds tighter than OR, so wrap every OR group in parentheses when it sits next to an AND.
  - IN replaces a chain of OR equality tests on one column and is easier to read and harder to get wrong.
  - In SQLite, = on text is case-sensitive, while LIKE ignores case for ASCII letters.
  - Add a unique column as the last ORDER BY key so ties sort the same way every time.
  - LIMIT with OFFSET pages through a result, but only a deterministic ORDER BY makes the pages stable.
further:
  - title: SQLite expressions and operator precedence
    url: https://www.sqlite.org/lang_expr.html
  - title: SQLite SELECT, ORDER BY and LIMIT
    url: https://www.sqlite.org/lang_select.html#orderby
quiz:
  - q: |
      Which rows does this filter keep?
      ```sql
      WHERE status = 'delivered' OR status = 'shipped' AND channel = 'web'
      ```
    options:
      - text: Delivered or shipped orders, but only on the web channel.
        why: That's what the author probably meant, but AND is evaluated first, so the channel test only applies to the shipped side.
      - text: Only orders that are both delivered and shipped, on the web.
        why: A single status can't be two values at once; OR is still an OR here, it's the grouping that surprises people.
      - text: It's a syntax error because AND and OR need parentheses.
        why: SQL accepts mixed AND/OR without parentheses. That's exactly why the bug is silent.
      - text: All delivered orders from any channel, plus shipped orders from the web.
        why: Correct. It reads as `status = 'delivered' OR (status = 'shipped' AND channel = 'web')`.
    answer: 3
  - q: You need web orders from customer 42 whose channel value might be stored as 'Web' or 'web'. Which test matches both?
    options:
      - text: "`channel = 'web'`"
        why: In SQLite, = compares text case-sensitively, so 'Web' would not match.
      - text: "`channel IN ('web')`"
        why: IN uses the same equality comparison as =, so it's case-sensitive too.
      - text: "`channel LIKE 'web'`"
        why: Correct. SQLite's LIKE is case-insensitive for ASCII letters by default, so it matches both spellings. `LOWER(channel) = 'web'` would work too.
    answer: 2
  - q: A dashboard pages through orders 20 at a time with `ORDER BY order_date LIMIT 20 OFFSET 40`. Users report an order appearing on two pages. What's the most likely fix?
    options:
      - text: Add `order_id` as a second sort key so rows with equal dates always come in the same order.
        why: Correct. With ties on `order_date`, the database may return tied rows in a different order on each query, so one row can land on two pages.
      - text: Replace OFFSET with a larger LIMIT so fewer pages are needed.
        why: That hides the symptom on small tables but doesn't make the order deterministic.
      - text: Sort with DESC instead of ASC.
        why: The direction doesn't matter; ties are just as ambiguous in descending order.
    answer: 0
  - q: "`BETWEEN 10 AND 20` on `shipping_fee`: which value is NOT included?"
    options:
      - text: "10"
        why: BETWEEN includes its lower bound; `x BETWEEN a AND b` means `x >= a AND x <= b`.
      - text: "20"
        why: BETWEEN includes its upper bound as well, which is what trips people up with dates later.
      - text: "15.5"
        why: Any value between the bounds is included, decimals too.
      - text: "20.01"
        why: Correct. It's above the upper bound. Both bounds themselves are included.
    answer: 3
---

Huda Saleh, VP Marketing, writes: "Can you pull the orders that used SPRING15 or WELCOME10 on our own channels, web or the app? I want to see whether the welcome offer pulls people into the app." Her sentence contains two ORs and an AND. That's the shape of request that produces silently wrong numbers, so it's worth getting `WHERE` exactly right.

## AND before OR

Here's the first draft most people type, translating her words left to right:

```sql run
SELECT COUNT(*) AS orders
FROM orders
WHERE channel = 'web' OR channel = 'mobile_app'
  AND coupon_code IN ('SPRING15', 'WELCOME10');
```

1,191 orders. That's more than half of all orders in two years, for two niche coupons. The number is the alarm: `AND` binds tighter than `OR`, so SQL read this as "every web order, plus app orders that used a coupon". Every web order is in there, coupon or not.

Parentheses say what Huda meant:

```sql run
SELECT COUNT(*) AS orders
FROM orders
WHERE (channel = 'web' OR channel = 'mobile_app')
  AND coupon_code IN ('SPRING15', 'WELCOME10');
```

110 orders. Better still, the channel test can use `IN` too, which removes the OR entirely: `channel IN ('web', 'mobile_app')`. `IN` checks one column against a list, and a list can't be mis-grouped.

:::mistake Trusting a query because it ran
The wrong query didn't error. It returned a plausible-looking number. Whenever a filter mixes AND and OR, put parentheses around each OR group, and glance at the count: if a "niche" filter keeps half the table, the logic is wrong.
:::

## The rest of the filtering toolkit

A few operators cover nearly every filter you'll write:

| Operator | Example | Note |
|---|---|---|
| `IN (...)` | `status IN ('cancelled', 'returned')` | `NOT IN` excludes; beware NULLs (next lesson) |
| `BETWEEN a AND b` | `shipping_fee BETWEEN 5 AND 10` | Includes both ends |
| `LIKE` | `name LIKE '%mat%'` | `%` is any run of characters, `_` is exactly one |
| `<>` / `!=` | `status <> 'cancelled'` | Both mean "not equal" |

Text comparison has a SQLite-specific twist. `=` is case-sensitive, so `'a' = 'A'` is false, while `LIKE` ignores case for ASCII letters, so `'a' LIKE 'A'` is true. That's why `name LIKE '%mat%'` finds both "Desk Mat XL" and "Cork Yoga Mat". PostgreSQL's `LIKE` is case-sensitive, a difference you'll meet again in the dialects lesson.

```sql run
SELECT product_id, name, unit_price
FROM products
WHERE name LIKE '%mat%'
  AND unit_price BETWEEN 20 AND 80;
```

## Saying "not" correctly

Negation is where careful people slip. Suppose Huda now wants orders that are *neither* cancelled *nor* returned. You can write it two ways, and they're equivalent:

```sql run
SELECT
  (SELECT COUNT(*) FROM orders
   WHERE NOT (status = 'cancelled' OR status = 'returned')) AS not_either,
  (SELECT COUNT(*) FROM orders
   WHERE status <> 'cancelled' AND status <> 'returned') AS both_not;
```

Both return 1,864. The rule behind it is De Morgan's law: pushing a NOT inside the parentheses flips every OR into an AND (and every AND into an OR). The common bug is to flip the comparisons but forget to flip the connector: `status <> 'cancelled' OR status <> 'returned'` is TRUE for every row, because any status differs from at least one of the two. When you write a negative filter, `NOT IN ('cancelled', 'returned')` is the clearest form of all.

One more habit pays off here. Before trusting a filter with several conditions, count rows for each condition on its own. Huda's filter has three parts: web or app keeps 1,848 rows, the two coupons keep 127, and "not cancelled or returned" keeps 1,864. Their AND can't keep more than the smallest part, 127; if it does, the logic is wrong. A ten-second check like that catches most logic errors before anyone else sees them.

Dates in Cartwheel are ISO text (`2025-11-28 19:55:30`), which sorts in the same order as time. So `order_date >= '2025-11-01'` works as a date filter. The next lessons cover the traps, starting with what happens at the end of a day.

## Sorting you can rely on

`ORDER BY` takes several keys, each with its own direction. The second key only matters among rows that tie on the first:

```sql run
SELECT order_id, customer_id, order_date, coupon_code
FROM orders
WHERE channel = 'marketplace'
  AND coupon_code IS NOT NULL
ORDER BY order_date DESC, order_id
LIMIT 5;
```

Why add `order_id` when dates rarely tie? Because "rarely" isn't "never". When two rows tie on every sort key, SQL makes no promise about their order, and it can differ between runs. Ending the `ORDER BY` with a unique column, usually the primary key, makes the order fully deterministic.

That matters most for paging. `LIMIT 20 OFFSET 40` means "skip 40 rows, return the next 20", the third page of 20. If the order isn't deterministic, a row can show up on page two and again on page three.

:::tip Write the sentence, then the WHERE
Before typing a filter, write the condition as one sentence with brackets: "coupon is (SPRING15 or WELCOME10) and channel is (web or app) and status is not cancelled". The brackets in the sentence become the parentheses in SQL.
:::

Huda's coupon question is answered: 110 orders. Her follow-up is in the exercise below. Next comes the value that breaks all of these operators in surprising ways: `NULL`.
