---
summary: Use scalar, derived-table and correlated subqueries where they fit, restructure long queries into named CTE steps, and walk hierarchies of any depth with a recursive CTE.
takeaways:
  - A scalar subquery returns one value and can sit anywhere a value can, such as a comparison against an overall average.
  - A CTE (WITH name AS ...) names an intermediate result so a long analysis reads top to bottom and each step can be checked on its own.
  - A recursive CTE has an anchor query, UNION ALL, and a recursive query that joins back to the CTE; it stops when an iteration adds no rows.
  - Carry a depth counter (and a path if useful) through the recursion, and cap the depth when the data might contain a cycle.
further:
  - title: SQLite WITH clause and recursive common table expressions
    url: https://www.sqlite.org/lang_with.html
  - title: PostgreSQL WITH queries
    url: https://www.postgresql.org/docs/current/queries-with.html
quiz:
  - q: "Which is a scalar subquery used correctly?"
    options:
      - text: "`WHERE revenue > (SELECT revenue FROM revenue_2025)`"
        why: That subquery returns one row per customer. SQLite silently uses the first row; PostgreSQL raises an error. Either way it isn't the average.
      - text: "`FROM (SELECT AVG(revenue) FROM revenue_2025)` with no alias or join"
        why: That's a derived table, not a scalar subquery, and on its own it doesn't connect to the customers you're filtering.
      - text: "`WHERE customer_id = (SELECT customer_id FROM orders)`"
        why: Like the first option, the subquery returns many rows where one value is expected.
      - text: "`WHERE revenue > (SELECT AVG(revenue) FROM revenue_2025)`"
        why: Correct. An aggregate without GROUP BY returns exactly one row and one column, so it can stand in for a single value.
    answer: 3
  - q: What's the main reason analysts restructure a nested query into CTEs?
    options:
      - text: Each step gets a name and reads top to bottom, and you can run any step on its own to check it.
        why: Correct. The logic is the same; readability and testability are what improve.
      - text: CTEs always run faster than subqueries.
        why: Engines often inline CTEs and plan them like subqueries, so performance is usually similar. Choose CTEs for clarity.
      - text: Subqueries can't contain aggregates, CTEs can.
        why: Subqueries can aggregate; the fan-out fix in the previous section did exactly that.
    answer: 0
  - q: A recursive CTE starts from the CEO and joins `employees e ON e.manager_id = org.employee_id`. When does it stop?
    options:
      - text: After a fixed number of iterations set by the database.
        why: There's no built-in iteration count; a runaway recursion keeps going until it runs out of resources.
      - text: When it reaches an employee whose `manager_id` is NULL.
        why: The CEO is the anchor row, where the walk starts. The walk goes downwards and ends at people with no reports.
      - text: When an iteration produces no new rows, because the last level has no reports.
        why: Correct. Each iteration joins only the rows from the previous one; when nobody reports to anyone in that set, the recursion ends.
      - text: When the LIMIT clause is reached.
        why: The CTE body here has no LIMIT. A LIMIT can cap recursion, but the natural stop is an empty iteration.
    answer: 2
  - q: Why add a condition like `WHERE org.depth < 20` to a recursive query over `customers.referred_by`?
    options:
      - text: Recursive CTEs require a WHERE clause to compile.
        why: They don't; the employee query in this lesson has none. It's a safety net, not syntax.
      - text: It makes the query use an index.
        why: Depth limits don't affect index use; they only bound the number of iterations.
      - text: It sorts the output by depth.
        why: Sorting needs an ORDER BY on the final SELECT. WHERE only filters.
      - text: If bad data ever creates a referral loop (A referred B, B referred A), the recursion would never end without a cap.
        why: Correct. Hierarchies entered by people or systems can contain cycles, and a depth cap turns an infinite loop into a bounded query.
    answer: 3
---

Karim asks a question with a hidden second question inside it: "Which customers spent more than the average customer in 2025?" To answer it you need the average first, which itself needs per-customer revenue. That's three steps: revenue per customer, the average of those, then the comparison. SQL gives you two ways to nest steps, subqueries and CTEs, and the choice decides whether the next analyst can read your work.

## Three kinds of subquery

You've already used two of them. A **derived table** is a subquery in FROM that acts like a table (the per-order revenue that fixed the fan-out). A **correlated subquery** refers to the outer row and runs per row (the NOT EXISTS anti-join). The third is the **scalar subquery**: a query that returns exactly one value, usable anywhere a value is.

Here's Karim's question written with nesting only:

```sql run
SELECT COUNT(*) AS above_average_customers
FROM (
  SELECT o.customer_id, SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS revenue
  FROM orders AS o
  JOIN order_items AS oi ON oi.order_id = o.order_id
  WHERE o.status <> 'cancelled'
    AND o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'
  GROUP BY o.customer_id
) AS r
WHERE r.revenue > (
  SELECT AVG(revenue) FROM (
    SELECT SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS revenue
    FROM orders AS o
    JOIN order_items AS oi ON oi.order_id = o.order_id
    WHERE o.status <> 'cancelled'
      AND o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'
    GROUP BY o.customer_id
  )
);
```

It works: 140 customers. It's also hard to read, and the revenue logic is written twice. When someone changes the definition of revenue next quarter, they'll update one copy and not the other.

## The same analysis as CTEs

A **common table expression** names a query with `WITH name AS (...)`, and later steps refer to it like a table:

```sql run
WITH revenue_2025 AS (
  -- grain: one row per customer who bought in 2025
  SELECT o.customer_id,
         SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS revenue
  FROM orders AS o
  JOIN order_items AS oi ON oi.order_id = o.order_id
  WHERE o.status <> 'cancelled'
    AND o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'
  GROUP BY o.customer_id
),
benchmark AS (
  SELECT AVG(revenue) AS avg_revenue FROM revenue_2025
)
SELECT
  COUNT(*) AS buyers,
  SUM(r.revenue > b.avg_revenue) AS above_average,
  ROUND(b.avg_revenue, 2) AS avg_revenue
FROM revenue_2025 AS r
CROSS JOIN benchmark AS b;
```

Now the analysis reads like the sentence it answers: revenue per customer, the benchmark, the comparison. Revenue is defined once. And while building it you can replace the final SELECT with `SELECT * FROM revenue_2025 LIMIT 5` to inspect any step, which is the single best debugging habit for long SQL. `CROSS JOIN` is safe here because `benchmark` has exactly one row. In SQLite a comparison is 1 or 0, so `SUM(condition)` counts TRUE rows; in PostgreSQL you'd write `COUNT(*) FILTER (WHERE ...)`.

So 140 of 418 buyers sit above the 781.84 average. That's typical of revenue data: a minority of large customers pulls the mean up, which is why you'll often report the median beside it.

:::tip Subquery or CTE?
Use a subquery for something small and local, like `IN (SELECT ...)` or a single scalar value. Use a CTE as soon as a step deserves a name, is used twice, or is longer than a few lines. Performance is rarely the deciding factor: SQLite and PostgreSQL both usually inline CTEs and plan them like subqueries.
:::

## Recursive CTEs: walking a hierarchy

Rania's reorganisation request comes back: "List everyone in Peter Weber's engineering organisation, at any level, with how far below him they sit." A self-join gets you one level. Peter's org has two, and another department might have five. A **recursive CTE** walks as deep as the data goes:

```sql run
WITH RECURSIVE org AS (
  -- anchor: where the walk starts
  SELECT employee_id, first_name, title, 0 AS depth, first_name AS path
  FROM employees
  WHERE employee_id = 4
  UNION ALL
  -- recursive step: people who report to anyone found so far
  SELECT e.employee_id, e.first_name, e.title, org.depth + 1,
         org.path || ' > ' || e.first_name
  FROM employees AS e
  JOIN org ON e.manager_id = org.employee_id
)
SELECT depth, path, title
FROM org
ORDER BY path;
```

The structure is always the same. The **anchor** query runs once and produces the starting rows. The **recursive** query joins `employees` to `org` itself, but on each iteration it only sees the rows added by the previous iteration. Each pass adds the next level down, and the walk ends when an iteration finds nobody.

:::figure Each iteration of the recursive CTE adds the next level of the org chart
<svg viewBox="0 0 720 220" role="img" aria-labelledby="t1">
  <title id="t1">Iteration 0 is the anchor, Peter. Iteration 1 adds his reports Felix and Ivy. Iteration 2 adds Felix's reports Salma, Ryan, Mona and Daniel. Iteration 3 finds no one, so the recursion stops.</title>
  <text class="d-label-muted" x="70" y="45" text-anchor="middle">iteration 0</text>
  <text class="d-label-muted" x="70" y="105" text-anchor="middle">iteration 1</text>
  <text class="d-label-muted" x="70" y="165" text-anchor="middle">iteration 2</text>
  <text class="d-label-muted" x="70" y="210" text-anchor="middle">iteration 3</text>
  <rect class="d-box-primary" x="330" y="22" width="120" height="36" rx="8"/>
  <text class="d-label-strong" x="390" y="45" text-anchor="middle">Peter</text>
  <rect class="d-box-accent" x="230" y="82" width="120" height="36" rx="8"/>
  <text class="d-label" x="290" y="105" text-anchor="middle">Felix</text>
  <rect class="d-box-accent" x="470" y="82" width="120" height="36" rx="8"/>
  <text class="d-label" x="530" y="105" text-anchor="middle">Ivy</text>
  <rect class="d-box" x="140" y="142" width="100" height="36" rx="8"/>
  <text class="d-label" x="190" y="165" text-anchor="middle">Salma</text>
  <rect class="d-box" x="250" y="142" width="100" height="36" rx="8"/>
  <text class="d-label" x="300" y="165" text-anchor="middle">Ryan</text>
  <rect class="d-box" x="360" y="142" width="100" height="36" rx="8"/>
  <text class="d-label" x="410" y="165" text-anchor="middle">Mona</text>
  <rect class="d-box" x="470" y="142" width="100" height="36" rx="8"/>
  <text class="d-label" x="520" y="165" text-anchor="middle">Daniel</text>
  <text class="d-label-muted" x="390" y="210" text-anchor="middle">no new rows, so the recursion stops</text>
  <path class="d-line" d="M370 58 L300 82"/>
  <path class="d-line" d="M410 58 L520 82"/>
  <path class="d-line" d="M270 118 L190 142"/>
  <path class="d-line" d="M285 118 L300 142"/>
  <path class="d-line" d="M300 118 L410 142"/>
  <path class="d-line" d="M320 118 L520 142"/>
</svg>
:::

`depth` and `path` are carried through the recursion: each new row computes its values from the parent row it joined to. Sorting by `path` prints the result as an indented tree. The same pattern rolls costs up a category tree, follows referral chains, or expands a bill of materials.

:::mistake Recursion without a brake
If the data contains a cycle (A manages B, B manages A, after a bad import), the recursion never runs out of rows and the query runs until it fails or someone cancels it. When you don't fully trust a hierarchy, add `WHERE org.depth < 20` to the recursive step. `UNION` instead of `UNION ALL` also stops exact-duplicate rows from repeating, but a depth or path column defeats that, so the depth cap is the dependable guard.
:::

With CTEs you can name every step. The next lesson adds a tool that lets each row see its neighbours without collapsing anything: window functions.
