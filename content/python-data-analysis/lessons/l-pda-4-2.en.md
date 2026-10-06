---
summary: Combine tables with merge, choose the right join type, protect yourself from duplicated rows with validate= and row counts, and use indicator=True to find records with no match.
takeaways:
  - "`left.merge(right, on=\"key\", how=...)` combines tables by matching key values; `how` decides what happens to rows without a match."
  - "`how=\"left\"` keeps every row of the left table and is the safe default for adding columns to a fact table."
  - "Pass `validate=\"many_to_one\"` (or `\"one_to_one\"`) so pandas raises `MergeError` if the right-hand keys are not unique, instead of silently multiplying rows."
  - Compare `len()` before and after every merge; a left merge onto a unique key never changes the row count.
  - "`indicator=True` adds a `_merge` column (`both`, `left_only`, `right_only`) that shows which rows found a partner."
further:
  - title: Merge, join, concatenate and compare
    url: https://pandas.pydata.org/docs/user_guide/merging.html
  - title: pandas.DataFrame.merge
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.merge.html
quiz:
  - q: You left-merge `order_items` (3,991 rows) with `orders` on `order_id`. How many rows should the result have?
    options:
      - text: 2,066, one per order
        why: A merge does not aggregate; every item row stays a row. Grouping is what reduces rows.
      - text: More than 3,991, because orders have several items
        why: Each item matches exactly one order, so nothing is multiplied. Duplication happens when the right-hand key repeats.
      - text: Fewer than 3,991, because cancelled orders are dropped
        why: Merges match keys; they do not filter by status. You filter afterwards.
      - text: Exactly 3,991, because each item has one matching order
        why: Correct. Many items to one order, with `how="left"`, keeps the left table's row count. `validate="many_to_one"` guarantees it.
    answer: 3
  - q: "Which merge finds the customers who never placed an order?"
    options:
      - text: "`customers.merge(orders, on=\"customer_id\", how=\"inner\")`"
        why: An inner join keeps only customers with at least one order, which is the opposite of what you want.
      - text: "`customers.merge(orders, on=\"customer_id\", how=\"left\", indicator=True)`, then keep `_merge == \"left_only\"`"
        why: Correct. A left join keeps every customer, and `left_only` marks those with no matching order. That finds 85 customers.
      - text: "`orders.merge(customers, on=\"customer_id\", how=\"left\")`"
        why: With orders on the left, every row is an order, so customers without orders never appear.
    answer: 1
  - q: "`orders.merge(tickets, on=\"customer_id\")` returns 6,624 rows from 2,066 orders and 873 tickets. What happened?"
    options:
      - text: "`customer_id` repeats on both sides, so every order of a customer was paired with every ticket of that customer."
        why: Correct. This is a many-to-many join. `validate="many_to_one"` would have raised an error; join tickets to orders on `order_id` instead.
      - text: pandas added blank rows for tickets without orders.
        why: The default `how="inner"` adds no unmatched rows at all.
      - text: The merge appended the two tables one below the other.
        why: That is `pd.concat`. A merge matches rows side by side.
    answer: 0
---

The head of growth's question needs columns from four tables. Revenue lives in `order_items`. Whether an order was cancelled, and when it was placed, lives in `orders`. The product's category lives in `products`, and the customer's country in `customers`. In a spreadsheet you would write lookup formulas; in pandas you **merge**. Merges are where most silent errors in analysis happen, so this lesson spends as much time on checking a merge as on writing one.

## A first merge

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])

lines = items.merge(orders, on="order_id", how="left", validate="many_to_one")
print(len(items), "->", len(lines))
print(lines[["order_item_id", "order_id", "revenue", "order_date", "status"]].head(3))
```

For each row of the left table, pandas looks up the row of `orders` with the same `order_id` and copies its columns across. Many item lines point to one order, so the relationship is **many to one**, and `validate="many_to_one"` tells pandas to check that: if `orders` had two rows for one id, the merge would raise `MergeError` instead of quietly doubling those items. The row count before and after is the second check. A left merge onto a unique key never changes it.

Now revenue can finally respect the business rule you postponed in Lesson 2.5: cancelled orders are not revenue.

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
lines = items.merge(orders, on="order_id", how="left", validate="many_to_one")

kept = lines[lines["status"] != "cancelled"]
print(round(kept["revenue"].sum(), 2), "revenue excluding cancelled orders")
```

446,666.32 dollars. This is the revenue definition for the rest of the course: line revenue after discounts, excluding shipping fees and cancelled orders. Returned orders stay in, because their refunds are tracked separately in `returns`. Write definitions like this down where readers will see them; a number without its definition invites an argument.

When the key has a different name on each side, name both: `left_on="customer_id", right_on="referred_by"` in a merge of `customers` with itself matches each customer to the people they referred. And pick the key that identifies what you are matching. Returns belong to order **lines**, so `returns` joins `order_items` on `order_item_id`; joining it on `order_id` instead would attach each refund to every line of the order.

## Join types

`how` decides what happens to keys that exist on only one side:

:::figure Four join types, by which keys survive
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">Left table keys A, B, C and right table keys B, C, D. Inner keeps B and C. Left keeps A, B, C with A's right columns empty. Right keeps B, C, D. Outer keeps A, B, C, D.</title>
  <text class="d-label-strong" x="60" y="28" text-anchor="middle">left</text>
  <rect class="d-box-primary" x="30" y="40" width="60" height="30" rx="5"/><text class="d-code" x="60" y="60" text-anchor="middle">A</text>
  <rect class="d-box-primary" x="30" y="76" width="60" height="30" rx="5"/><text class="d-code" x="60" y="96" text-anchor="middle">B</text>
  <rect class="d-box-primary" x="30" y="112" width="60" height="30" rx="5"/><text class="d-code" x="60" y="132" text-anchor="middle">C</text>
  <text class="d-label-strong" x="150" y="28" text-anchor="middle">right</text>
  <rect class="d-box-accent" x="120" y="76" width="60" height="30" rx="5"/><text class="d-code" x="150" y="96" text-anchor="middle">B</text>
  <rect class="d-box-accent" x="120" y="112" width="60" height="30" rx="5"/><text class="d-code" x="150" y="132" text-anchor="middle">C</text>
  <rect class="d-box-accent" x="120" y="148" width="60" height="30" rx="5"/><text class="d-code" x="150" y="168" text-anchor="middle">D</text>
  <path class="d-line" d="M210 30 L210 200"/>
  <text class="d-label-strong" x="270" y="28" text-anchor="middle">inner</text>
  <text class="d-code" x="270" y="96" text-anchor="middle">B</text><text class="d-code" x="270" y="132" text-anchor="middle">C</text>
  <text class="d-label-strong" x="380" y="28" text-anchor="middle">left</text>
  <text class="d-code" x="380" y="60" text-anchor="middle">A + NaN</text><text class="d-code" x="380" y="96" text-anchor="middle">B</text><text class="d-code" x="380" y="132" text-anchor="middle">C</text>
  <text class="d-label-strong" x="490" y="28" text-anchor="middle">right</text>
  <text class="d-code" x="490" y="96" text-anchor="middle">B</text><text class="d-code" x="490" y="132" text-anchor="middle">C</text><text class="d-code" x="490" y="168" text-anchor="middle">NaN + D</text>
  <text class="d-label-strong" x="610" y="28" text-anchor="middle">outer</text>
  <text class="d-code" x="610" y="60" text-anchor="middle">A + NaN</text><text class="d-code" x="610" y="96" text-anchor="middle">B</text><text class="d-code" x="610" y="132" text-anchor="middle">C</text><text class="d-code" x="610" y="168" text-anchor="middle">NaN + D</text>
  <text class="d-label-muted" x="440" y="208" text-anchor="middle">missing partners are filled with NaN</text>
</svg>
:::

`inner` (the default) keeps only keys found on both sides. `left` keeps every left row, filling the right-hand columns with `NaN` where there is no partner. `right` is the mirror image, and `outer` keeps everything. For adding information to a table of facts, such as orders, items or sessions, use `how="left"` with the fact table on the left: you never lose a fact because a lookup table is incomplete, and the `NaN`s show you exactly where it is.

## Finding what did not match

`indicator=True` adds a `_merge` column recording where each row came from:

```python run
import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
buyers = orders[["customer_id"]].drop_duplicates()

check = customers.merge(buyers, on="customer_id", how="left", indicator=True)
print(check["_merge"].value_counts())
never_ordered = check[check["_merge"] == "left_only"]
print(len(never_ordered), "customers never ordered")
```

85 customers signed up and never bought anything, the same number you found with `nunique` in Lesson 2.2, now as a list of names you could hand to the marketing team. `indicator=True` is also the fastest audit of any merge: `right_only` rows in a left join are impossible, and a surprising number of `left_only` rows means keys that should match do not, often because of types (`int` on one side, text on the other) or untrimmed spaces.

## Same column name on both sides

`order_items` and `products` both have a `unit_price` column: the price charged and the list price. pandas adds suffixes to tell them apart, and you can choose them:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
products = pd.read_csv("products.csv")

lines = (
    items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")
    .merge(products[["product_id", "name", "unit_price"]], on="product_id",
           suffixes=("_charged", "_list"), validate="many_to_one")
)
lines["price_ratio"] = (lines["unit_price_charged"] / lines["unit_price_list"]).round(2)
print(lines.groupby(lines["order_date"] >= "2025-03-01")["price_ratio"].agg(["min", "max"]))
```

Before March 2025, every line was charged exactly the list price; from 1 March, every line was charged 5% more. The merge has just confirmed the price rise from the data alone, and it is one of the suspects for the Q4 revenue jump.

:::mistake Joining on a key that repeats on both sides
`orders.merge(tickets, on="customer_id")` returns 6,624 rows from 2,066 orders and 873 tickets: every order of a customer is paired with every ticket of that customer. Sum revenue on that and you count orders several times over. `validate="many_to_one"` turns this into an immediate `MergeError`. Write it on every merge where you expect the right side to be unique; it costs nothing and catches the most expensive mistake in this lesson.
:::

In the exercise you build the full line-level table that the rest of the course analyses. Next you reshape tables between wide and long formats with `pivot_table` and `melt`.
