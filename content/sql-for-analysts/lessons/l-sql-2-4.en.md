---
summary: Join a table to itself to follow manager and referral links, and find rows with no match using NOT EXISTS or LEFT JOIN ... IS NULL instead of the NULL-fragile NOT IN.
takeaways:
  - A self-join uses two aliases of the same table, one per role, such as e for the employee and m for the manager.
  - A semi-join (EXISTS or IN) keeps rows that have at least one match without multiplying them.
  - An anti-join keeps rows with no match; write it as NOT EXISTS or as LEFT JOIN ... WHERE right_key IS NULL.
  - NOT IN returns no rows at all when its subquery contains a NULL, so avoid it with nullable columns or filter the NULLs out explicitly.
further:
  - title: SQLite expressions, EXISTS and IN operators
    url: https://www.sqlite.org/lang_expr.html#the_exists_operator
  - title: PostgreSQL subquery expressions
    url: https://www.postgresql.org/docs/current/functions-subquery.html
quiz:
  - q: "`employees` has 24 rows and only the CEO has a NULL `manager_id`. How many rows does `employees e JOIN employees m ON m.employee_id = e.manager_id` return?"
    options:
      - text: "24"
        why: The CEO's `manager_id` is NULL, so the inner join finds no manager row for her and drops her.
      - text: "23"
        why: Correct. Each employee except the CEO matches exactly one manager. Use LEFT JOIN to keep the CEO with a NULL manager.
      - text: "576"
        why: That's 24 × 24, a cross join. The ON condition limits each employee to their own manager.
    answer: 1
  - q: Some customers have `referred_by` NULL. What does `SELECT COUNT(*) FROM customers WHERE customer_id NOT IN (SELECT referred_by FROM customers)` return?
    options:
      - text: The number of customers who never referred anyone.
        why: That's the intent, but the subquery contains NULLs, and `x NOT IN (..., NULL)` is never TRUE.
      - text: The number of customers who referred someone.
        why: NOT IN excludes matches, so it couldn't return the referrers, and the NULL problem empties the result anyway.
      - text: "0"
        why: Correct. For every customer, the comparison with the NULL in the list is unknown, so NOT IN is NULL or FALSE and WHERE drops the row.
      - text: An error, because the subquery returns NULLs.
        why: SQL allows NULLs in an IN list; the query runs and silently returns 0.
    answer: 2
  - q: Which query lists customers who have never placed an order?
    options:
      - text: "`SELECT c.* FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_id IS NULL`"
        why: Correct. Customers without orders get a NULL `o.order_id`; customers with orders don't, so the IS NULL test keeps exactly the non-buyers.
      - text: "`SELECT c.* FROM customers c JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_id IS NULL`"
        why: An inner join has already removed customers without orders, so nothing is left to find.
      - text: "`SELECT c.* FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.status IS NULL`"
        why: Close, and it happens to work because `status` is NOT NULL, but test the join key; a nullable column like `coupon_code` would let real buyers through.
      - text: "`SELECT c.* FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)`"
        why: That's the semi-join, which keeps the opposite set, customers with at least one order.
    answer: 0
---

Two requests arrive on the same morning. Rania, the CEO, wants a clean list of who reports to whom before a reorganisation. Huda wants to know which customers signed up and never bought anything. They look unrelated, but both are about relationships between rows: one follows a link *within* a table, the other looks for links that are *missing*.

## A table joined to itself

In `employees`, `manager_id` holds the `employee_id` of another row in the same table. To show each employee next to their manager's name, you join `employees` to itself. The trick is two aliases, one per role:

```sql run
SELECT
  e.first_name || ' ' || e.last_name AS employee,
  e.title,
  m.first_name || ' ' || m.last_name AS manager
FROM employees AS e
LEFT JOIN employees AS m
  ON m.employee_id = e.manager_id
ORDER BY e.department, manager;
```

Read it as two copies of the table: `e` is the employee, `m` is the person they report to. The `||` operator concatenates text. A LEFT JOIN keeps Rania herself, whose `manager_id` is NULL; an inner join would quietly drop the CEO from the org chart, which is not a mistake you want to explain.

The same pattern works on `customers.referred_by`. Who brings in the most new customers?

```sql run
SELECT
  r.customer_id,
  r.first_name || ' ' || r.last_name AS referrer,
  COUNT(*) AS customers_referred
FROM customers AS c
JOIN customers AS r ON r.customer_id = c.referred_by
GROUP BY r.customer_id
ORDER BY customers_referred DESC, r.customer_id
LIMIT 5;
```

Here `c` is the new customer and `r` the referrer. Leo Ibrahim referred three people; nobody referred more. Naming aliases after roles (`e`/`m`, `c`/`r`) rather than `a`/`b` is what keeps self-joins readable.

Self-joins only go one level at a time: employee to manager. "Everyone in Peter's organisation, at any depth" needs a recursive query, which you'll write in the next section.

## Semi-joins: does a match exist?

Last lesson, `WHERE order_id IN (SELECT order_id FROM support_tickets)` found orders with at least one ticket, without the fan-out a join would cause. That's a **semi-join**. `EXISTS` is the other common spelling:

```sql
SELECT c.customer_id, c.email
FROM customers AS c
WHERE EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.customer_id
);
```

The subquery is *correlated*: it refers to `c` from the outer query, so it's evaluated per customer. `SELECT 1` is a convention; EXISTS only cares whether any row comes back, not what's in it.

## Anti-joins: who has no match?

Huda's question is the opposite: customers with **no** orders. There are two reliable ways to write an anti-join. The first is `NOT EXISTS`:

```sql run
SELECT
  strftime('%Y', c.signup_date) AS signup_year,
  COUNT(*) AS never_ordered
FROM customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.customer_id
)
GROUP BY signup_year;
```

85 customers never ordered, and 52 of them signed up in 2024, at least a year before the data ends. That's the actionable part for Huda: the 2025 sign-ups might still convert, the 2024 ones need a different campaign.

The second way is a LEFT JOIN that keeps only the unmatched rows:

```sql run
SELECT COUNT(*) AS never_ordered
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;
```

Same 85. Test the right table's **key** for NULL, because a key is never NULL on a real match. Both forms are standard and fast; most analysts prefer NOT EXISTS because it states the intent and can't fan out.

:::mistake NOT IN against a nullable column
Marketing asks which customers have never referred anyone. `WHERE customer_id NOT IN (SELECT referred_by FROM customers)` looks perfect and returns **zero rows**. Most customers have `referred_by` NULL, and `5 NOT IN (58, 347, NULL)` is unknown rather than TRUE, because the NULL might be 5. One NULL in the subquery empties the whole result. Use NOT EXISTS, or add `WHERE referred_by IS NOT NULL` inside the subquery if you must use NOT IN.
:::

## Anti-joins with conditions

Real anti-joins usually carry a condition: not "never ordered", but "hasn't ordered *recently*". The condition goes inside the NOT EXISTS subquery, where it narrows which orders count as a match. Here are customers who bought in 2024 but not at all in 2025, a classic lapsed-customer list:

```sql run
SELECT COUNT(DISTINCT c.customer_id) AS lapsed_customers
FROM customers AS c
JOIN orders AS o24
  ON o24.customer_id = c.customer_id
 AND o24.order_date < '2025-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o25
  WHERE o25.customer_id = c.customer_id
    AND o25.order_date >= '2025-01-01'
);
```

The join to 2024 orders fans out (a customer with five 2024 orders appears five times), so the query counts distinct customers. Putting the 2025 condition anywhere outside the subquery would change the meaning entirely, the same lesson as ON versus WHERE, one level deeper.

## Which one to use

| Question | Pattern |
|---|---|
| Rows that have a match, without duplicates | `EXISTS` or `IN (subquery)` |
| Rows that have no match | `NOT EXISTS`, or `LEFT JOIN ... WHERE key IS NULL` |
| Rows plus details of their match | `JOIN` (watch for fan-out) |
| Links within one table | Self-join with role-named aliases |

That completes the join toolkit. The next section stacks these building blocks into longer analyses, starting with a way to name intermediate results so a 40-line query still reads top to bottom.
