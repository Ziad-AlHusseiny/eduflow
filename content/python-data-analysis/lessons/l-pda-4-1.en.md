---
summary: Summarise data by group with groupby, compute several named statistics at once with agg, and choose correctly between size and count, and between an indexed and a flat result.
takeaways:
  - "`groupby` splits rows into groups by key, applies a calculation to each group, and combines the results into one table."
  - "Named aggregation, `agg(revenue=(\"revenue\", \"sum\"), lines=(\"order_item_id\", \"count\"))`, gives each output column a clear name."
  - "`size()` counts rows per group; `count()` counts non-missing values in a column, so the two differ when the column has gaps."
  - Grouping by several keys gives a MultiIndex; `as_index=False` or `reset_index()` turns the keys back into ordinary columns.
  - Check that group results add back up to the overall total, so you know no rows were lost or double-counted.
further:
  - title: "Group by: split-apply-combine"
    url: https://pandas.pydata.org/docs/user_guide/groupby.html
  - title: pandas.core.groupby.DataFrameGroupBy.agg
    url: https://pandas.pydata.org/docs/reference/api/pandas.core.groupby.DataFrameGroupBy.agg.html
quiz:
  - q: "`orders.groupby(\"channel\")[\"coupon_code\"].count()` gives 208 for web, but `orders.groupby(\"channel\").size()` gives 1,146. Why?"
    options:
      - text: One of them is filtering out cancelled orders.
        why: Neither call filters by status; both see every row.
      - text: "`count()` counts only non-missing coupon codes, while `size()` counts every row in the group."
        why: Correct. 208 web orders used a coupon; 1,146 web orders exist. Use `size()` to count rows and `count()` to count filled values.
      - text: "`count()` counts distinct coupon codes."
        why: Distinct values are `nunique()`. `count()` counts every non-missing value, repeats included.
      - text: "`size()` double-counts orders with several items."
        why: "`orders` has one row per order, so there is nothing to double-count."
    answer: 1
  - q: Which call returns one row per order with columns named `revenue` and `lines`?
    options:
      - text: "`items.groupby(\"order_id\").agg(revenue=(\"revenue\", \"sum\"), lines=(\"order_item_id\", \"count\"))`"
        why: Correct. Each keyword becomes an output column, defined by a (column, function) pair.
      - text: "`items.groupby(\"order_id\")[\"revenue\", \"order_item_id\"].sum()`"
        why: Selecting several columns needs a list (double brackets), and even then you get two sums with the original names, not a count.
      - text: "`items.agg(revenue=(\"revenue\", \"sum\"), lines=(\"order_item_id\", \"count\"))`"
        why: Without `groupby` this aggregates the whole table into single totals, not one row per order.
    answer: 0
  - q: You group `items` by order and sum revenue, then sum that result. The grand total is 3% higher than `items["revenue"].sum()`. What is the most likely explanation?
    options:
      - text: groupby always rounds values up.
        why: groupby does not round anything; sums of groups equal the total sum exactly, up to float noise.
      - text: The groupby dropped the orders with missing keys.
        why: Dropping rows with missing keys would make the grouped total lower, not higher.
      - text: Floating-point error.
        why: Float error is around the 12th decimal place, never 3%.
      - text: The table you grouped is not the table you think; for example, it was joined to another table that duplicated rows.
        why: Correct. Grouping cannot invent money, so a higher total means the input had extra rows. Lesson 4.2 shows how joins cause exactly this.
    answer: 3
---

"What's our average order value?" sounds like one number, but `order_items` has no order value column: an order with four products has four rows. You first need one row per order, with the order's revenue summed from its lines. "Revenue per product", "orders per channel" and "sales per country" are the same shape of question. In a spreadsheet you would build a pivot table; in pandas you use `groupby`, the method you will call more than any other.

## Split, apply, combine

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])

by_product = items.groupby("product_id")["revenue"].sum()
print(by_product.sort_values(ascending=False).head(3).round(2))
print(round(by_product.sum(), 2), round(items["revenue"].sum(), 2))
```

Read the middle line as three steps. **Split** the rows into groups, one per `product_id`. **Apply** a calculation, `sum`, to the `revenue` column of each group. **Combine** the results into a Series indexed by the group key. Product 21, the Standing Desk, earned 60,017.83 dollars, almost twice the next product.

The last line is a habit worth copying: the group totals add up to the overall total. If they do not, rows went missing (for example, rows whose key is `NaN`, which `groupby` drops by default) or were duplicated before you grouped.

:::figure groupby splits rows by key, applies a function to each group, and combines the results
<svg viewBox="0 0 700 240" role="img" aria-labelledby="t1">
  <title id="t1">Six order lines with order keys A, A, B, A, C, C. Split groups them into three boxes by key. Apply sums revenue in each box. Combine produces a three-row result: A, B and C with their totals.</title>
  <text class="d-label-strong" x="80" y="24" text-anchor="middle">rows</text>
  <rect class="d-box" x="20" y="36" width="120" height="26" rx="5"/><text class="d-code" x="80" y="54" text-anchor="middle">A  88.20</text>
  <rect class="d-box" x="20" y="66" width="120" height="26" rx="5"/><text class="d-code" x="80" y="84" text-anchor="middle">A  33.60</text>
  <rect class="d-box" x="20" y="96" width="120" height="26" rx="5"/><text class="d-code" x="80" y="114" text-anchor="middle">B  19.95</text>
  <rect class="d-box" x="20" y="126" width="120" height="26" rx="5"/><text class="d-code" x="80" y="144" text-anchor="middle">A 270.90</text>
  <rect class="d-box" x="20" y="156" width="120" height="26" rx="5"/><text class="d-code" x="80" y="174" text-anchor="middle">C  96.60</text>
  <rect class="d-box" x="20" y="186" width="120" height="26" rx="5"/><text class="d-code" x="80" y="204" text-anchor="middle">C  96.60</text>
  <path class="d-arrow" d="M150 120 L190 120" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="290" y="24" text-anchor="middle">split</text>
  <rect class="d-box-primary" x="200" y="36" width="180" height="58" rx="8"/><text class="d-label" x="290" y="70" text-anchor="middle">A: 3 rows</text>
  <rect class="d-box-accent" x="200" y="102" width="180" height="40" rx="8"/><text class="d-label" x="290" y="127" text-anchor="middle">B: 1 row</text>
  <rect class="d-box-success" x="200" y="150" width="180" height="58" rx="8"/><text class="d-label" x="290" y="184" text-anchor="middle">C: 2 rows</text>
  <path class="d-arrow" d="M390 120 L430 120" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="490" y="24" text-anchor="middle">apply sum</text>
  <text class="d-code" x="490" y="70" text-anchor="middle">392.70</text>
  <text class="d-code" x="490" y="127" text-anchor="middle">19.95</text>
  <text class="d-code" x="490" y="184" text-anchor="middle">193.20</text>
  <path class="d-arrow" d="M545 120 L575 120" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="635" y="24" text-anchor="middle">combine</text>
  <rect class="d-box" x="585" y="60" width="100" height="120" rx="8"/>
  <text class="d-code" x="635" y="92" text-anchor="middle">A 392.70</text>
  <text class="d-code" x="635" y="124" text-anchor="middle">B  19.95</text>
  <text class="d-code" x="635" y="156" text-anchor="middle">C 193.20</text>
</svg>
:::

## Several statistics at once: named aggregation

One number per group is rarely enough. `agg` with **named aggregation** computes several, and names each output column:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])

per_order = items.groupby("order_id").agg(
    revenue=("revenue", "sum"),
    lines=("order_item_id", "count"),
    units=("quantity", "sum"),
    max_discount=("discount", "max"),
)
print(per_order.head().round(2))
print(per_order.shape, "| average order value:", round(per_order["revenue"].mean(), 2))
```

Each keyword is an output column, and each value is a pair: (input column, function). Functions are given by name as strings: `"sum"`, `"mean"`, `"median"`, `"min"`, `"max"`, `"count"`, `"size"`, `"nunique"`, `"first"`, `"last"`, `"std"`. The result has one row per order, 2,066 of them, and the average order value is 228.43 dollars, across all statuses, cancellations included, for now.

You will also see the older style `agg({"revenue": "sum", "discount": "max"})`, or `agg(["sum", "mean"])` on one column. They work, but they reuse the input names, so a table with two statistics of the same column ends up with confusing headers. Named aggregation says exactly what each column is.

## size versus count

Two ways to count, and they answer different questions:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
print(orders.groupby("channel").size())                   # rows per group
print(orders.groupby("channel")["coupon_code"].count())   # non-missing coupons per group
```

`size()` counts rows: 1,146 web orders. `count()` counts the non-missing values of a column: 208 of those web orders have a coupon code. Use `size` (or `count` on a column that is never missing, such as an id) for "how many", and `count` for "how many have a value".

:::mistake Counting the wrong thing
"Orders per customer" computed on `order_items` with `size()` counts **lines**, not orders: a four-product order counts four times. Either group a table that has one row per order, or count distinct ids with `("order_id", "nunique")`. Before you aggregate, say what one row represents.
:::

## Several keys and flat results

Group by a list of columns to cross two dimensions. The result has a two-level index (a **MultiIndex**), and `unstack()` spreads the inner level into columns, which reads like a pivot table:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
by_channel_status = orders.groupby(["channel", "status"]).size()
print(by_channel_status.head(4))
print(by_channel_status.unstack())

flat = orders.groupby("channel", as_index=False).agg(
    orders=("order_id", "count"),
    avg_fee=("shipping_fee", "mean"),
)
print(flat.round(2))
```

`as_index=False` keeps the group keys as ordinary columns instead of moving them into the index, which is handy when the result feeds a merge, a chart or a CSV export. `reset_index()` on an indexed result does the same afterwards.

## Group results on every row: transform

Sometimes you want the group's number next to each row rather than one row per group. "What share of its order does each line represent?" needs every line to know its order's total. `transform` runs the same group calculation but returns a result aligned to the original rows:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
items["order_revenue"] = items.groupby("order_id")["revenue"].transform("sum")
items["share_of_order"] = items["revenue"] / items["order_revenue"]
print(items[["order_id", "revenue", "order_revenue", "share_of_order"]].head(5).round(3))
```

Order 1001 has four lines, and the Burr Coffee Grinder line carries 62% of its value. The rule of thumb: `agg` when you want a summary table, `transform` when you want a new column on the detailed table.

:::tip Grouping a categorical column
If you converted a column to `category` (Lesson 3.2), pass `observed=True` to `groupby`. It keeps only the categories that actually appear, and it silences the warning pandas 2 prints about the default changing.
:::

The exercise builds the per-order table you will use from here on. Next you combine it with `orders` and `customers`, because the questions that matter, such as "revenue by country, excluding cancellations", need columns from more than one table.
