---
kind: intro
summary: Find your way around the Cartwheel database, turn a vague request into a precise question, and answer it with SELECT, computed columns, ORDER BY and LIMIT.
takeaways:
  - An analyst's query starts with a precise question, including what one row of the answer represents.
  - Explore an unfamiliar database through its tables and columns before writing the real query.
  - Computed columns with AS names make a result readable without changing the stored data.
  - ORDER BY decides which rows LIMIT keeps, so a LIMIT without an ORDER BY returns an arbitrary sample.
further:
  - title: SQLite SELECT statement
    url: https://www.sqlite.org/lang_select.html
  - title: The sqlite_schema table
    url: https://www.sqlite.org/schematab.html
quiz:
  - q: Rania asks for "our best products". What should you do before writing any SQL?
    options:
      - text: Pin down what "best" means (revenue, units, margin) and over which period.
        why: Correct. "Best" has at least three defensible meanings, and each one gives a different list. Agreeing on the metric first saves a rewrite.
      - text: Write `SELECT * FROM products` and send her the whole table.
        why: Forty-eight rows of raw columns don't answer a question; they hand the analysis back to the person who asked.
      - text: Sort products by `unit_price`, because expensive products are the best ones.
        why: Price isn't performance. A $449 desk that sells twice a year may matter less than a $24 mug that sells daily.
    answer: 0
  - q: |
      What does this query return?
      ```sql
      SELECT name, unit_price
      FROM products
      LIMIT 3;
      ```
    options:
      - text: The three most expensive products.
        why: Nothing in the query sorts by price. LIMIT only cuts the result; it never chooses the "top" rows by itself.
      - text: The three cheapest products.
        why: There is no ORDER BY, so there's no notion of cheapest here either.
      - text: Three rows in whatever order SQLite reads them, which you shouldn't rely on.
        why: Correct. Without ORDER BY, row order is an implementation detail. Today it's the insertion order; after an index change it might not be.
    answer: 2
  - q: You write `unit_price - unit_cost AS margin` in the SELECT list. What happens to the `products` table?
    options:
      - text: A new `margin` column is added to the table permanently.
        why: SELECT never changes stored data. Adding a column would take ALTER TABLE.
      - text: Nothing; `margin` exists only in this query's result.
        why: Correct. A computed column is calculated for each output row and disappears when the query finishes.
      - text: The query fails because `margin` isn't a real column.
        why: Expressions with an alias are exactly how you create columns that don't exist in the table.
    answer: 1
---

Your first week at Cartwheel, a message lands from Rania Aziz, the CEO: "Which of our products are expensive but barely profitable? I want to look at pricing before the spring catalogue." It sounds simple. It's also a perfect example of the job: someone with a real decision to make asks a question in plain words, and you turn it into a query that answers exactly that question, no more and no less.

Cartwheel is an online store for home and outdoor goods, selling in eight countries. Its SQLite database holds two years of history, from January 2024 to December 2025. Every query in this course runs against it, in your browser.

## Meet the database

Before writing the real query, look around. SQLite keeps a catalogue of its own tables in `sqlite_schema` (older code calls it `sqlite_master`, which still works):

```sql run
SELECT name
FROM sqlite_schema
WHERE type = 'table';
```

Nine tables. To see one table's columns and types, ask for its column list:

```sql run
SELECT name, type, "notnull"
FROM pragma_table_info('orders');
```

Here's how the tables connect. Arrows point from a table to the table it references; the label is the shared key.

:::figure The Cartwheel schema: orders sit between customers and products
<svg viewBox="0 0 720 300" role="img" aria-labelledby="t1">
  <title id="t1">Customers place orders; orders contain order_items; order_items reference products, which belong to categories. Returns reference order_items. Support tickets reference customers, orders and employees. Web sessions reference customers.</title>
  <rect class="d-box" x="20" y="30" width="150" height="50" rx="10"/>
  <text class="d-label" x="95" y="60" text-anchor="middle">web_sessions</text>
  <rect class="d-box" x="215" y="30" width="160" height="50" rx="10"/>
  <text class="d-label" x="295" y="60" text-anchor="middle">support_tickets</text>
  <rect class="d-box" x="420" y="30" width="140" height="50" rx="10"/>
  <text class="d-label" x="490" y="60" text-anchor="middle">employees</text>
  <rect class="d-box-primary" x="20" y="140" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="95" y="170" text-anchor="middle">customers</text>
  <rect class="d-box-primary" x="215" y="140" width="160" height="50" rx="10"/>
  <text class="d-label-strong" x="295" y="170" text-anchor="middle">orders</text>
  <rect class="d-box-primary" x="420" y="140" width="140" height="50" rx="10"/>
  <text class="d-label-strong" x="490" y="170" text-anchor="middle">order_items</text>
  <rect class="d-box-accent" x="595" y="140" width="110" height="50" rx="10"/>
  <text class="d-label" x="650" y="170" text-anchor="middle">products</text>
  <rect class="d-box-accent" x="595" y="235" width="110" height="50" rx="10"/>
  <text class="d-label" x="650" y="265" text-anchor="middle">categories</text>
  <rect class="d-box" x="420" y="235" width="140" height="50" rx="10"/>
  <text class="d-label" x="490" y="265" text-anchor="middle">returns</text>
  <path class="d-arrow" d="M215 165 L172 165" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 165 L377 165" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 165 L593 165" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M650 190 L650 233" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M490 235 L490 192" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M95 80 L95 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M260 80 L130 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M295 80 L295 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M375 55 L418 55" marker-end="url(#arrow)"/>
  <text class="d-code" x="193" y="210" text-anchor="middle">customer_id</text>
  <text class="d-code" x="398" y="210" text-anchor="middle">order_id</text>
  <text class="d-code" x="578" y="128" text-anchor="middle">product_id</text>
</svg>
:::

The three highlighted tables are the spine of most questions: a customer places an order, and an order has one or more order items. Money lives on `order_items`, not on `orders`: line revenue is `quantity * unit_price * (1 - discount)`.

## From request to query

Rania's request has two fuzzy words. "Expensive" can mean list price. "Barely profitable" needs a number: margin as a percentage of price, `(unit_price - unit_cost) / unit_price`, is the usual way to compare a $22 dripper with a $449 desk. Write the precise version down before you type: *one row per product, showing price and margin percent, thinnest margins first.*

```sql run
SELECT
  name,
  unit_price,
  unit_cost,
  ROUND((unit_price - unit_cost) / unit_price * 100, 1) AS margin_pct
FROM products
ORDER BY margin_pct
LIMIT 5;
```

Three habits are already at work. The computed column gets a readable name with `AS`. `ORDER BY` can sort by that alias. And `LIMIT 5` comes last, cutting the sorted list.

:::mistake LIMIT is not "top"
`LIMIT 5` without `ORDER BY` gives you five rows in whatever order SQLite happens to read them. Every time you want "the top N" or "the latest N", write the `ORDER BY` that defines top or latest, then the `LIMIT`.
:::

## The analyst's loop

Every request in this course goes through the same loop, and it's worth making it a habit now:

1. **Restate** the question precisely, including what one row of the answer is.
2. **Explore** the tables and columns you need.
3. **Query**, starting small and building up.
4. **Sanity-check** the result: row count, a total you know, an edge case.
5. **Answer** in a sentence a non-analyst can act on.

For Rania, step 5 might read: "Our thinnest margins are around 40%, on the Burr Coffee Grinder and Compact Writing Desk; no product is listed below cost." Short, specific, and it points to the next question.

Next you'll add the most-used clause in analytics, `WHERE`, and learn where its logic trips people up.
