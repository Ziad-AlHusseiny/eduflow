---
summary: Write data-quality checks as queries that return the offending rows, bundle them into a reusable suite, and investigate each failure as a question for the business rather than a bug to hide.
takeaways:
  - Phrase every data-quality check as a query that returns the rows breaking a rule, so zero rows means the check passes.
  - Cover uniqueness, completeness, valid ranges, referential integrity and cross-table consistency; each catches a different kind of problem.
  - Bundle checks into one UNION ALL query with a name and a failure count per check, and run it before any important analysis.
  - A failing check is a question to take to the data's owner, not something to filter away silently; record what you found and what you decided.
further:
  - title: SQLite compound SELECT statements (UNION ALL)
    url: https://www.sqlite.org/lang_select.html#compound_select_statements
  - title: SQLite CREATE TABLE constraints
    url: https://www.sqlite.org/lang_createtable.html#constraints
  - title: PostgreSQL constraints
    url: https://www.postgresql.org/docs/current/ddl-constraints.html
quiz:
  - q: Which query is the best data-quality check for "every order item belongs to an existing order"?
    options:
      - text: "`SELECT COUNT(*) FROM order_items JOIN orders USING (order_id)`"
        why: An inner join silently drops orphans, so the count looks fine whether or not orphans exist.
      - text: "`SELECT * FROM order_items oi WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_id = oi.order_id)`"
        why: Correct. It returns exactly the rows that break the rule, so an empty result means the check passes and any row is evidence.
      - text: "`SELECT COUNT(DISTINCT order_id) FROM order_items`"
        why: This counts orders referenced by items but can't tell whether those orders exist.
      - text: "`SELECT * FROM orders WHERE order_id IS NOT NULL`"
        why: This checks the wrong table and the wrong rule; primary keys are never NULL anyway.
    answer: 1
  - q: Two orders have status 'returned' but no row in `returns`. Both were placed in the last two weeks of December 2025. What's the most sensible next step?
    options:
      - text: Delete the two orders from your analysis so the numbers are clean.
        why: Removing rows hides the issue and changes revenue. Analysts report and query data; they don't quietly rewrite it.
      - text: Change their status to 'delivered' in your query with a CASE expression.
        why: That invents a fact. The status may be right and the return record simply not created yet.
      - text: Note them, ask the operations team whether returns are recorded with a delay, and say in your report how you treated them.
        why: Correct. The timing suggests a process lag rather than an error. Only the data's owner can confirm, and your report should state the assumption.
    answer: 2
  - q: "Why use `UNION ALL` rather than `UNION` to combine check results into one suite?"
    options:
      - text: UNION removes duplicate rows, which could merge two checks that happen to have the same name and count, and it does extra work to deduplicate.
        why: Correct. Each check's row is meant to appear exactly once; UNION ALL keeps every row and skips the deduplication step.
      - text: UNION can't combine queries that use aggregates.
        why: It can; both operators accept any SELECTs with matching column counts.
      - text: UNION ALL sorts the result by check name.
        why: Neither operator promises an order. Add ORDER BY if you want one.
    answer: 0
  - q: Three discontinued products (`is_active = 0`) still have orders in December 2025. What kind of problem is this?
    options:
      - text: A uniqueness problem.
        why: No key is duplicated here; the rows are distinct.
      - text: A referential-integrity problem.
        why: The products exist, so every order item still points to a real product.
      - text: A range-validity problem.
        why: The `is_active` flag holds a valid 0 or 1; the value itself is not out of range.
      - text: A consistency question between tables, which may be a data error or a legitimate business case such as clearing stock.
        why: Correct. The flag and the sales disagree. Whether that's wrong depends on what "discontinued" means at Cartwheel, which is a question for the product team.
    answer: 3
---

Karim is presenting 2025 results to the board next week. His request is short and serious: "Before these numbers go on a slide, how sure are we about the data?" Every query you've written assumes the data means what the documentation says. This lesson is about checking that assumption systematically, so that "I'm confident" is backed by queries, not feelings.

## A check is a query that returns the bad rows

The most useful habit in data quality is to phrase each rule as a query that returns the rows **breaking** it. An empty result means the rule holds; anything else is evidence you can show someone. Here's the rule "a product sits in a sub-category, never directly in a top-level one", from the data documentation:

```sql run
SELECT p.product_id, p.name, c.name AS category
FROM products AS p
JOIN categories AS c ON c.category_id = p.category_id
WHERE c.parent_id IS NULL;
```

Two rows: the Picnic Blanket filed directly under Outdoor and the Bamboo Cutting Board under Kitchen. That explains the odd "Kitchen" and "Outdoor" rows in the category revenue table from Section 2. A check that returns rows you can name is far more persuasive than a count.

## The five families of checks

Most rules fall into five families. Running at least one check from each catches the large majority of problems:

| Family | Question | Cartwheel example |
|---|---|---|
| Uniqueness | Is the key really unique? | Duplicate emails, ignoring case |
| Completeness | Are values present where they must be? | Tickets with no `agent_id` |
| Validity | Are values in their allowed range? | Discount between 0 and 0.25 |
| Referential integrity | Does every reference point to a real row? | Order items whose order doesn't exist |
| Consistency | Do related columns and tables tell the same story? | Orders marked 'returned' with no return record; open tickets that already have a rating |

Database constraints (`PRIMARY KEY`, `NOT NULL`, `CHECK`, `FOREIGN KEY`) enforce some of these at write time, if they were declared and, in SQLite's case, if foreign-key enforcement was switched on. Analysts rarely control that, and consistency rules across tables usually can't be expressed as constraints at all. So you check.

## A suite you can rerun

One check is a query; a dozen checks are a suite. Give each a name, count its failures, and stack them with `UNION ALL`:

```sql run
SELECT 'customers: duplicate email (any case)' AS check_name, COUNT(*) AS failures
FROM (SELECT LOWER(email) FROM customers GROUP BY LOWER(email) HAVING COUNT(*) > 1)
UNION ALL
SELECT 'order_items: no matching order', COUNT(*)
FROM order_items AS oi
WHERE NOT EXISTS (SELECT 1 FROM orders AS o WHERE o.order_id = oi.order_id)
UNION ALL
SELECT 'order_items: discount outside 0-0.25', COUNT(*)
FROM order_items
WHERE discount NOT BETWEEN 0 AND 0.25
UNION ALL
SELECT 'products: filed under a top-level category', COUNT(*)
FROM products AS p
JOIN categories AS c ON c.category_id = p.category_id
WHERE c.parent_id IS NULL
UNION ALL
SELECT 'orders: returned but no return record', COUNT(*)
FROM orders AS o
WHERE o.status = 'returned'
  AND NOT EXISTS (
    SELECT 1 FROM order_items AS oi
    JOIN returns AS r ON r.order_item_id = oi.order_item_id
    WHERE oi.order_id = o.order_id)
UNION ALL
SELECT 'tickets: rated while still open', COUNT(*)
FROM support_tickets
WHERE closed_at IS NULL AND satisfaction IS NOT NULL;
```

Three checks fail. Each compound part must return the same number of columns; the first SELECT names them. `UNION ALL` keeps every row, whereas `UNION` would deduplicate, which costs time and could merge two checks that happen to share a name and count. Save the suite next to your analysis and run it every time the data is refreshed; a check that passed in October can fail in December.

## Failures are questions, not verdicts

Now read the failures like an analyst, not a linter:

- **Two returned orders without return records** were both placed in the last two weeks of December 2025. That smells like a process delay (the return is logged when the parcel arrives back), not corruption. Ask operations.
- **Three open tickets with a satisfaction score** were opened in the last days of December. Perhaps the survey goes out before the ticket is formally closed. Ask Julia.
- **Two misfiled products** are almost certainly a catalogue error. Report it to whoever maintains the catalogue, and in the meantime decide how your category report treats them.

:::mistake Filtering problems away silently
The tempting move is to add `AND status <> 'returned'` or `WHERE parent_id IS NOT NULL` until the numbers look clean. Now your result disagrees with everyone else's, and nobody knows why. Keep the rows, note the issue and your treatment in the report ("two products are counted under their parent category pending a catalogue fix"), and let the owner fix the source.
:::

There's one more failure hiding in this data, and it's the most interesting one: products that appear in orders *before* their recorded launch date. Finding it is your exercise.

:::tip Reconcile against a number someone else owns
The strongest check compares your result with a figure from outside your query: finance's booked revenue, the payment provider's total, last month's published report. If your 2025 revenue differs from finance's by 0.1%, you can explain it. If it differs by 10%, you've found a definition mismatch before the board did.
:::

Next you'll look at the other side of trust, performance: why some of these queries are instant and others crawl, and how to see what the database is actually doing.
