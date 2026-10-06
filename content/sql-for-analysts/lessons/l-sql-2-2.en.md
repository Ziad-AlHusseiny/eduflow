---
summary: Combine tables with INNER and LEFT JOIN on the right keys, qualify columns that share a name, and keep unmatched rows by putting right-table filters in the ON clause.
takeaways:
  - An INNER JOIN keeps only rows that match on both sides; a LEFT JOIN keeps every row from the left table and fills unmatched right-side columns with NULL.
  - Give every table a short alias and qualify every column, especially names like unit_price that exist in more than one table.
  - A filter on the right table of a LEFT JOIN belongs in the ON clause; in WHERE it removes the NULL rows and turns the join back into an inner join.
  - Count a right-table column, not *, after a LEFT JOIN, so unmatched rows count as 0 instead of 1.
further:
  - title: SQLite SELECT, the FROM clause and joins
    url: https://www.sqlite.org/lang_select.html#fromclause
  - title: PostgreSQL tutorial on joins between tables
    url: https://www.postgresql.org/docs/current/tutorial-join.html
quiz:
  - q: "`orders` has 2,066 rows and `order_items` has 3,991. Every order has at least one item. How many rows does `orders o JOIN order_items oi ON oi.order_id = o.order_id` return?"
    options:
      - text: "2,066, one per order"
        why: An order with three items matches three item rows, so it appears three times. The join takes the grain of the many side.
      - text: "6,057, the two tables stacked"
        why: Stacking rows is UNION ALL. A join combines columns side by side for matching rows.
      - text: "8,245,406, every combination"
        why: That's a cross join, which is what you'd get by forgetting the ON condition.
      - text: "3,991, one per order item"
        why: Correct. Each item matches exactly one order, so the result has one row per item, with the order's columns repeated.
    answer: 3
  - q: |
      This should list every UK customer with their marketplace order count, zero included. Why do customers with no marketplace orders vanish?
      ```sql
      SELECT c.customer_id, COUNT(o.order_id) AS marketplace_orders
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.customer_id
      WHERE c.country = 'United Kingdom'
        AND o.channel = 'marketplace'
      GROUP BY c.customer_id;
      ```
    options:
      - text: "`COUNT(o.order_id)` should be `COUNT(*)`."
        why: The counting expression isn't the problem; the missing customers never reach the GROUP BY at all.
      - text: The `o.channel` test is NULL for customers without a matching order, so WHERE removes them.
        why: Correct. Move `AND o.channel = 'marketplace'` into the ON clause; the country test stays in WHERE because it's about the left table.
      - text: LEFT JOIN only keeps unmatched rows from the right table.
        why: It's the other way round. LEFT JOIN preserves every row of the left table, here `customers`.
    answer: 1
  - q: "`SELECT unit_price FROM order_items oi JOIN products p ON p.product_id = oi.product_id` fails. Why?"
    options:
      - text: "`unit_price` exists in both tables, so the name is ambiguous."
        why: Correct. Write `oi.unit_price` (the price charged) or `p.unit_price` (the list price). They're different numbers after the March 2025 price rise.
      - text: You can't select a column that was used in a join.
        why: Any column can be selected; the join key isn't involved here anyway.
      - text: Aliases must be declared with AS.
        why: AS is optional for table aliases in SQLite and PostgreSQL.
    answer: 0
  - q: After `employees e LEFT JOIN support_tickets t ON t.agent_id = e.employee_id`, which expression gives 0 tickets for employees who handled none?
    options:
      - text: "`COUNT(*)`"
        why: An unmatched employee still produces one row (with NULL ticket columns), so COUNT(*) returns 1.
      - text: "`COUNT(e.employee_id)`"
        why: The employee id is never NULL, so this also counts the unmatched row as 1.
      - text: "`COUNT(t.ticket_id)`"
        why: Correct. The ticket id is NULL on the unmatched row, and COUNT skips NULLs.
      - text: "`SUM(t.ticket_id)`"
        why: That adds up id numbers, which is meaningless, and returns NULL for unmatched employees.
    answer: 2
---

Karim from Finance asks: "What was our 2025 revenue by product category?" Revenue lives on `order_items`, the year lives on `orders`, and the category name lives on `categories`, two steps away via `products`. No single table answers the question. Joins put them together, and getting them right is mostly about knowing which rows each join keeps.

## Following the keys

Each join needs a condition that says which rows belong together, almost always a key: `order_items.order_id` points to `orders.order_id`, `order_items.product_id` to `products.product_id`, and so on. For Cartwheel, revenue counts every order except cancelled ones.

```sql run
SELECT
  c.name AS category,
  COUNT(DISTINCT o.order_id) AS orders,
  ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2) AS revenue
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.order_id
JOIN products    AS p  ON p.product_id = oi.product_id
JOIN categories  AS c  ON c.category_id = p.category_id
WHERE o.status <> 'cancelled'
  AND o.order_date >= '2025-01-01'
  AND o.order_date <  '2026-01-01'
GROUP BY c.name
ORDER BY revenue DESC;
```

Desks & Chairs leads with about 77,000. Two rows look odd, though: "Kitchen" and "Outdoor" are top-level categories, and products are supposed to sit in sub-categories. Keep that in mind; it's a data-quality finding you'll chase in Section 4.

Two habits make join queries readable and safe. Short aliases (`o`, `oi`, `p`, `c`) keep lines short. And qualifying every column with its alias removes guesswork, which matters here: `order_items.unit_price` is the price charged on the day, `products.unit_price` is today's list price. An unqualified `unit_price` in this query is an "ambiguous column name" error, and picking the wrong one silently changes revenue.

`COUNT(DISTINCT o.order_id)` is deliberate too. After joining to items, each order appears once per item line, so `COUNT(*)` would count lines. That repetition is the subject of the next lesson.

## INNER versus LEFT

`JOIN` means `INNER JOIN`: a row survives only if it finds a match on the other side. That's right for revenue, where an item without an order would be meaningless. It's wrong when the question is about *everything on one side*, including things with no matches.

Julia asks for each Operations employee's ticket count, "including people who don't handle tickets, so I can see who could help in peak season":

```sql run
SELECT
  e.employee_id,
  e.first_name,
  e.title,
  COUNT(t.ticket_id) AS tickets
FROM employees AS e
LEFT JOIN support_tickets AS t
  ON t.agent_id = e.employee_id
WHERE e.department = 'Operations'
GROUP BY e.employee_id
ORDER BY tickets DESC;
```

Eight rows. The four agents have about 200 tickets each; Mark, Samir, Ben and Adam have 0. A `LEFT JOIN` keeps every row of the left table, here `employees`, and where no ticket matches, the ticket columns are NULL. `COUNT(t.ticket_id)` skips those NULLs, which is why the non-agents show 0 rather than 1.

:::figure INNER JOIN keeps matches; LEFT JOIN also keeps unmatched left rows
<svg viewBox="0 0 720 230" role="img" aria-labelledby="t1">
  <title id="t1">Employees Julia, Tom and Mark on the left; tickets t1 and t2 handled by Julia and t3 by Tom on the right. The inner join result has three rows. The left join result has the same three rows plus Mark with NULL ticket.</title>
  <text class="d-label-strong" x="85" y="28" text-anchor="middle">employees</text>
  <rect class="d-box" x="20" y="40" width="130" height="34" rx="6"/>
  <text class="d-label" x="85" y="62" text-anchor="middle">6 Julia</text>
  <rect class="d-box" x="20" y="84" width="130" height="34" rx="6"/>
  <text class="d-label" x="85" y="106" text-anchor="middle">8 Tom</text>
  <rect class="d-box-warn" x="20" y="128" width="130" height="34" rx="6"/>
  <text class="d-label" x="85" y="150" text-anchor="middle">2 Mark</text>
  <text class="d-label-strong" x="285" y="28" text-anchor="middle">tickets</text>
  <rect class="d-box" x="220" y="40" width="130" height="34" rx="6"/>
  <text class="d-code" x="285" y="62" text-anchor="middle">t1 agent 6</text>
  <rect class="d-box" x="220" y="84" width="130" height="34" rx="6"/>
  <text class="d-code" x="285" y="106" text-anchor="middle">t2 agent 6</text>
  <rect class="d-box" x="220" y="128" width="130" height="34" rx="6"/>
  <text class="d-code" x="285" y="150" text-anchor="middle">t3 agent 8</text>
  <path class="d-line" d="M150 57 L220 57"/>
  <path class="d-line" d="M150 57 L220 101"/>
  <path class="d-line" d="M150 101 L220 145"/>
  <text class="d-label-strong" x="490" y="28" text-anchor="middle">INNER</text>
  <rect class="d-box-success" x="430" y="40" width="120" height="34" rx="6"/>
  <text class="d-code" x="490" y="62" text-anchor="middle">Julia t1</text>
  <rect class="d-box-success" x="430" y="84" width="120" height="34" rx="6"/>
  <text class="d-code" x="490" y="106" text-anchor="middle">Julia t2</text>
  <rect class="d-box-success" x="430" y="128" width="120" height="34" rx="6"/>
  <text class="d-code" x="490" y="150" text-anchor="middle">Tom t3</text>
  <text class="d-label-strong" x="640" y="28" text-anchor="middle">LEFT</text>
  <rect class="d-box-success" x="580" y="40" width="120" height="34" rx="6"/>
  <text class="d-code" x="640" y="62" text-anchor="middle">Julia t1</text>
  <rect class="d-box-success" x="580" y="84" width="120" height="34" rx="6"/>
  <text class="d-code" x="640" y="106" text-anchor="middle">Julia t2</text>
  <rect class="d-box-success" x="580" y="128" width="120" height="34" rx="6"/>
  <text class="d-code" x="640" y="150" text-anchor="middle">Tom t3</text>
  <rect class="d-box-warn" x="580" y="172" width="120" height="34" rx="6"/>
  <text class="d-code" x="640" y="194" text-anchor="middle">Mark NULL</text>
</svg>
:::

## ON versus WHERE in a LEFT JOIN

Now Julia narrows it: "Same list, but count only urgent tickets." The natural edit adds `AND t.priority = 'urgent'` to the WHERE clause, and the four non-agents disappear. Their rows have `t.priority` NULL, the condition is NULL, and WHERE drops them. A right-table filter in WHERE turns a LEFT JOIN back into an INNER JOIN.

The filter belongs in the `ON` clause, where it decides which tickets *match*, not which rows *survive*:

```sql run
SELECT
  e.first_name,
  COUNT(t.ticket_id) AS urgent_tickets
FROM employees AS e
LEFT JOIN support_tickets AS t
  ON t.agent_id = e.employee_id
 AND t.priority = 'urgent'
WHERE e.department = 'Operations'
GROUP BY e.employee_id
ORDER BY urgent_tickets DESC;
```

Eight rows again, with zeros where they belong. The rule: conditions on the **left** table go in WHERE; conditions on the **right** table go in ON.

## Choosing the join, and the starting table

A reliable way to decide: start `FROM` the table whose rows you want in the answer, the one that matches the grain you wrote down. Then ask of every other table, "is this information required or optional?" Required information gets an inner join, because a row without it shouldn't be in the answer. Optional information gets a LEFT JOIN, so missing matches show up as NULLs you can count, label or turn into zeros.

For Julia's list the answer is about employees, so `employees` comes first, and tickets are optional. For Karim's revenue the answer is about sales, so every table in the chain is required.

SQLite also supports `RIGHT JOIN` and `FULL OUTER JOIN` (since version 3.39), and PostgreSQL has had them for decades. You'll rarely need them: a right join is a left join with the tables swapped, and most teams write everything as LEFT JOIN so queries read the same way, top to bottom, from the main table outwards.

Finally, check the row count after each join you add. If `employees` filtered to Operations has 8 rows, the LEFT JOIN plus GROUP BY must also return 8. A number that grows or shrinks unexpectedly tells you a join is doing something you didn't intend.

:::mistake Forgetting the join condition
`FROM orders o JOIN order_items oi` with no `ON` is legal in SQLite. It pairs every order with every item, over eight million rows, and every sum becomes nonsense. If a join query is slow and its totals are enormous, look for a missing or wrong ON first.
:::

The category revenue had one more trap that didn't bite, because revenue sat on the most detailed table. When a number lives on the *less* detailed side of a join, sums inflate. That's next.
