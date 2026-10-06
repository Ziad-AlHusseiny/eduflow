---
summary: Reshape data between long and wide formats - pivot_table for cross-tab summaries, crosstab for counts and rates, and melt to turn spreadsheet-style wide tables back into analysable long ones.
takeaways:
  - Long data has one row per observation; wide data spreads one variable across columns. pandas analyses long data best, and people read wide tables best.
  - "`pivot_table(index=..., columns=..., values=..., aggfunc=\"sum\")` aggregates and reshapes in one step, like a spreadsheet pivot table."
  - "`pivot` only reshapes; it raises `ValueError: Index contains duplicate entries` when several rows share a cell, so use `pivot_table` for raw data."
  - "`pd.crosstab(a, b, normalize=\"index\")` turns two columns into row percentages, which is the quickest way to compare rates between groups."
  - "`melt(id_vars=..., var_name=..., value_name=...)` turns wide columns such as `Q1`...`Q4` back into rows."
further:
  - title: Reshaping and pivot tables
    url: https://pandas.pydata.org/docs/user_guide/reshaping.html
  - title: pandas.DataFrame.pivot_table
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.pivot_table.html
  - title: pandas.melt
    url: https://pandas.pydata.org/docs/reference/api/pandas.melt.html
quiz:
  - q: "`sales.pivot(index=\"quarter\", columns=\"channel\", values=\"revenue\")` raises `ValueError: Index contains duplicate entries, cannot reshape`. What is the fix?"
    options:
      - text: Sort `sales` by quarter first.
        why: Order is not the problem; many lines share the same quarter and channel, and `pivot` has no rule for combining them.
      - text: Drop duplicate rows with `drop_duplicates()`.
        why: The rows are different order lines, not duplicates. Dropping them would delete real revenue.
      - text: Convert `quarter` to text.
        why: The type of the key is irrelevant; the problem is several values per cell.
      - text: Use `pivot_table` with `aggfunc="sum"`, which combines the values that land in the same cell.
        why: Correct. `pivot_table` aggregates first, then reshapes. `pivot` only works when every index and column pair appears once.
    answer: 3
  - q: "A finance sheet has columns `channel, Q1, Q2, Q3, Q4`. Which call makes one row per channel and quarter?"
    options:
      - text: "`targets.melt(id_vars=\"channel\", var_name=\"quarter\", value_name=\"target\")`"
        why: Correct. `channel` stays as an identifier, and the four quarter columns become rows with their names in `quarter` and values in `target`.
      - text: "`targets.pivot_table(index=\"channel\")`"
        why: The table is already wide by quarter; pivoting would not move the quarter columns into rows.
      - text: "`targets.T`"
        why: Transposing swaps rows and columns, giving channels as columns, which is still wide.
    answer: 0
  - q: "`pd.crosstab(sessions[\"device\"], sessions[\"purchased\"], normalize=\"index\")` shows 0.067 in the mobile row, column 1. What does it mean?"
    options:
      - text: 6.7% of all purchases happened on mobile.
        why: That would be `normalize="columns"`. With `"index"`, each row sums to 1.
      - text: 6.7% of mobile sessions ended in a purchase.
        why: Correct. Normalising by index divides each count by its row total, so the value is the conversion rate within mobile sessions.
      - text: Mobile has 6.7% of all sessions.
        why: The share of sessions by device would come from `value_counts(normalize=True)` on `device`.
    answer: 1
---

A manager does not want 3,991 rows. They want a grid: channels down the side, quarters across the top, revenue in the cells. The finance team sends targets the same way, one column per quarter. Your analysis, meanwhile, works best on long tables with one row per observation, because `groupby`, `merge` and filtering all expect that shape. Reshaping moves data between the two forms, and it is the last core skill before you start answering questions in earnest.

:::figure Long and wide hold the same data in different shapes
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">On the left, a long table with columns quarter, channel and revenue has six rows. An arrow labelled pivot_table points to a wide table with quarters as rows and channels web and app as columns. A return arrow labelled melt points back.</title>
  <text class="d-label-strong" x="130" y="24" text-anchor="middle">long</text>
  <rect class="d-box-primary" x="30" y="34" width="200" height="26" rx="5"/><text class="d-code" x="130" y="52" text-anchor="middle">quarter channel revenue</text>
  <rect class="d-box" x="30" y="64" width="200" height="24" rx="5"/><text class="d-code" x="130" y="81" text-anchor="middle">Q1  web   27,868</text>
  <rect class="d-box" x="30" y="92" width="200" height="24" rx="5"/><text class="d-code" x="130" y="109" text-anchor="middle">Q1  app   16,814</text>
  <rect class="d-box" x="30" y="120" width="200" height="24" rx="5"/><text class="d-code" x="130" y="137" text-anchor="middle">Q2  web   30,110</text>
  <rect class="d-box" x="30" y="148" width="200" height="24" rx="5"/><text class="d-code" x="130" y="165" text-anchor="middle">Q2  app   15,840</text>
  <text class="d-label-muted" x="130" y="196" text-anchor="middle">one row per observation</text>
  <path class="d-arrow" d="M250 80 L440 80" marker-end="url(#arrow)"/>
  <text class="d-code" x="345" y="70" text-anchor="middle">pivot_table</text>
  <path class="d-arrow" d="M440 140 L250 140" marker-end="url(#arrow)"/>
  <text class="d-code" x="345" y="162" text-anchor="middle">melt</text>
  <text class="d-label-strong" x="560" y="24" text-anchor="middle">wide</text>
  <rect class="d-box-primary" x="460" y="34" width="200" height="26" rx="5"/><text class="d-code" x="560" y="52" text-anchor="middle">quarter  web    app</text>
  <rect class="d-box" x="460" y="64" width="200" height="24" rx="5"/><text class="d-code" x="560" y="81" text-anchor="middle">Q1   27,868 16,814</text>
  <rect class="d-box" x="460" y="92" width="200" height="24" rx="5"/><text class="d-code" x="560" y="109" text-anchor="middle">Q2   30,110 15,840</text>
  <text class="d-label-muted" x="560" y="196" text-anchor="middle">one column per channel</text>
</svg>
:::

## pivot_table: summarise and reshape at once

Start from the sales table you built in Lesson 4.2 (here rebuilt in a few lines) and ask for revenue by channel and year:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
sales = items.merge(orders, on="order_id", how="left", validate="many_to_one")
sales = sales[sales["status"] != "cancelled"]
sales = sales.assign(year=sales["order_date"].dt.year, quarter=sales["order_date"].dt.quarter)

table = sales.pivot_table(index="channel", columns="year", values="revenue",
                          aggfunc="sum", margins=True, margins_name="Total")
print(table.round(0))
```

Every argument maps to a spreadsheet pivot: `index` is the rows, `columns` the columns, `values` the field, `aggfunc` the summary. `margins=True` adds the totals row and column, and they confirm the result: 446,666 dollars overall, the revenue definition from the last lesson. Revenue grew in every channel from 2024 to 2025, and the web roughly tripled.

`pivot_table` is the same computation as `groupby(["channel", "year"])["revenue"].sum().unstack()`. Use `groupby` when you will keep computing, and `pivot_table` when the grid itself is the output. For counts of distinct orders, change the aggregation: `values="order_id", aggfunc="nunique"`. And `fill_value=0` replaces the `NaN` of empty cells when zero is the honest answer, as it is for "no sales in that cell".

### From amounts to shares

A grid of amounts invites the next question: how did the **mix** change? Divide each column by its total and the grid shows shares instead. `by_year.sum()` returns one total per column, and dividing a DataFrame by that Series lines each total up with its own column by label, the same alignment rule you met with two Series in Lesson 2.1. To divide each row by its row total instead, use `by_year.div(by_year.sum(axis=1), axis=0)`.

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
sales = items.merge(orders, on="order_id", how="left", validate="many_to_one")
sales = sales[sales["status"] != "cancelled"]

by_year = sales.pivot_table(index="channel", columns=sales["order_date"].dt.year,
                            values="revenue", aggfunc="sum")
print((by_year / by_year.sum()).round(3))
```

The web's share of revenue rose from 53% in 2024 to 59% in 2025, while the app's fell from 35% to 31%. Amounts tell you everything grew; shares tell you where the growth concentrated. Report both, because each hides what the other shows.

:::mistake pivot versus pivot_table
`sales.pivot(index="quarter", columns="channel", values="revenue")` fails with `ValueError: Index contains duplicate entries, cannot reshape`. `pivot` is a pure reshape: it expects exactly one value per cell, and raw data has hundreds. Use `pivot_table` on raw data, and keep `pivot` for tables that are already one row per cell.
:::

## crosstab: counts and rates

For two categorical columns, `pd.crosstab` counts combinations, and `normalize` converts counts to shares. Here is Cartwheel's web traffic:

```python run
import pandas as pd

sessions = pd.read_csv("web_sessions.csv")
print(pd.crosstab(sessions["source"], sessions["device"]))
print(pd.crosstab(sessions["device"], sessions["purchased"], normalize="index").round(3))
```

The second table answers a real question. `normalize="index"` makes each row sum to 1, so the `1` column is the purchase rate per device: 12.4% of desktop sessions end in a purchase, but only 6.7% of mobile sessions, although mobile brings the most traffic. That gap is worth a conversation with whoever owns the mobile checkout. Choose the normalisation by the question: `"index"` for rates within each row group, `"columns"` for composition of each column, `"all"` for shares of the grand total.

## melt: from wide back to long

The finance team's 2025 targets arrive as a spreadsheet, one column per quarter. To compare them with actual revenue you need them long, one row per channel and quarter, so they can be merged:

```python run
import pandas as pd

targets = pd.DataFrame({
    "channel": ["marketplace", "mobile_app", "web"],
    "Q1": [5000, 15000, 28000],
    "Q2": [5000, 16000, 30000],
    "Q3": [6000, 20000, 40000],
    "Q4": [9000, 30000, 60000],
})
long = targets.melt(id_vars="channel", var_name="quarter", value_name="target")
long["quarter"] = long["quarter"].str[1].astype(int)
print(long.head(6))
print(long.shape)
```

`id_vars` are the columns that identify a row and stay as they are; every other column becomes a pair of values in two new columns, the old column name in `var_name` and its value in `value_name`. Three rows times four quarters gives twelve. `str[1]` takes the second character of `"Q1"`, so the quarter becomes a number that matches `sales["quarter"]`, ready for a merge like the ones in Lesson 4.2.

:::tip Keep data long until the last step
Do your filtering, grouping and merging on long tables, and pivot only to present. Wide tables with years or months as columns are hard to filter ("which column is 2025-Q4?") and break the moment a new period arrives.
:::

In the exercise you build the quarterly grid for 2025 and check performance against those targets. Next comes time itself: resampling, periods and growth rates.
