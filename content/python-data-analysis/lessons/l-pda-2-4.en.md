---
summary: Filter rows with boolean masks, combine conditions with &, | and ~, use isin and between for common filters, and sort or rank rows with sort_values and nlargest.
takeaways:
  - A comparison on a column returns a boolean mask; `df[mask]` or `df.loc[mask, cols]` keeps the rows where it is `True`.
  - "Combine masks with `&` (and), `|` (or) and `~` (not), and wrap every condition in parentheses."
  - "`mask.sum()` counts matching rows and `mask.mean()` gives their share, without filtering anything."
  - "`isin([...])` replaces long chains of `==` with `|`, and `between(a, b)` includes both ends."
  - "`sort_values` takes lists for multi-column sorts; `nlargest(n, col)` is the shortcut for a top-n list."
further:
  - title: Boolean indexing
    url: https://pandas.pydata.org/docs/user_guide/indexing.html#boolean-indexing
  - title: pandas.DataFrame.sort_values
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.sort_values.html
  - title: pandas.Series.isin
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.isin.html
quiz:
  - q: "Which line keeps web orders that used a coupon?"
    options:
      - text: "`orders[(orders[\"channel\"] == \"web\") & (orders[\"coupon_code\"].notna())]`"
        why: Correct. Each condition is a boolean Series in its own parentheses, combined element by element with `&`.
      - text: "`orders[orders[\"channel\"] == \"web\" and orders[\"coupon_code\"].notna()]`"
        why: "`and` asks for a single True/False of a whole Series, so pandas raises `ValueError: The truth value of a Series is ambiguous`."
      - text: "`orders[orders[\"channel\"] == \"web\" & orders[\"coupon_code\"].notna()]`"
        why: Without parentheses, `&` binds before `==`, so Python evaluates `"web" & ...` first and the expression fails or means something else.
      - text: "`orders[\"channel\" == \"web\"][\"coupon_code\"]`"
        why: "`\"channel\" == \"web\"` compares two strings and is always `False`; it never looks at the column."
    answer: 0
  - q: "`mask = orders[\"shipping_fee\"] == 0`. What does `mask.mean()` return?"
    options:
      - text: The average shipping fee
        why: That would be `orders["shipping_fee"].mean()`. The mask holds booleans, not fees.
      - text: The number of free-shipping orders
        why: That is `mask.sum()`. The mean divides that count by the number of rows.
      - text: The share of orders with free shipping, between 0 and 1
        why: Correct. `True` counts as 1 and `False` as 0, so the mean of a mask is the fraction of rows where it is true.
    answer: 2
  - q: You want the 10 orders with the highest shipping fee, newest first among equal fees. Which call is right?
    options:
      - text: "`orders.sort_values(\"shipping_fee\").head(10)`"
        why: The default sort is ascending, so this gives the ten cheapest, and ties are not ordered by date.
      - text: "`orders.sort_values([\"shipping_fee\", \"order_date\"], ascending=[False, True]).head(10)`"
        why: The date order is ascending here, which puts the oldest orders first among equal fees.
      - text: "`orders.nlargest(10, \"order_date\")`"
        why: This ranks by date, not by fee.
      - text: "`orders.sort_values([\"shipping_fee\", \"order_date\"], ascending=[False, False]).head(10)`"
        why: Correct. Both columns sort descending, fee first, then date to break ties.
    answer: 3
---

The head of growth's question has a time window: Q4 2025. Before you can explain that quarter, you need to isolate it, and then slice it further: which of those orders used a coupon, which came through the marketplace, which were Black Friday orders. Every one of those is a filter, and pandas filters the same way every time: build a column of `True`/`False`, then keep the `True` rows.

## Boolean masks

A comparison on a column does not return one answer; it returns one answer per row:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
is_free = orders["shipping_fee"] == 0
print(is_free.head())
print(is_free.sum(), "orders with free shipping")
print(round(is_free.mean(), 3), "share of all orders")
```

That boolean Series is called a **mask**. Summing it counts the `True` values, and its mean is the share of rows that match: 43% of Cartwheel's orders shipped free. You often learn what you need from the count alone, without filtering anything.

To keep the matching rows, put the mask inside square brackets, or inside `.loc` when you also want to choose columns:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
cancelled = orders[orders["status"] == "cancelled"]
print(len(cancelled))
print(orders.loc[orders["shipping_fee"] == 0, ["order_id", "channel", "coupon_code"]].head())
```

## Combining conditions

Real questions have several conditions. pandas uses `&` for and, `|` for or, and `~` for not, applied row by row:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
in_q4 = (orders["order_date"] >= "2025-10-01") & (orders["order_date"] < "2026-01-01")
not_cancelled = orders["status"] != "cancelled"
q4 = orders[in_q4 & not_cancelled]
print(len(orders[in_q4]), "orders in Q4 2025,", len(q4), "not cancelled")
print(q4["channel"].value_counts())
```

Giving each mask a name, as here, keeps long filters readable and lets you print and count each condition separately when a result looks wrong. A datetime column can be compared with a date written as a string, `"2025-10-01"`, and pandas converts it for you. The upper bound is "before 1 January", not "on or before 31 December", because orders on 31 December have a time later than midnight.

:::mistake and, or, missing parentheses
`orders[a == 1 and b == 2]` raises `ValueError: The truth value of a Series is ambiguous`. Python's `and` wants one True or False, and a Series has many. Use `&`. And wrap each condition in parentheses: `&` binds more tightly than `==`, so `orders["channel"] == "web" & orders["shipping_fee"] == 0` is evaluated in the wrong order and fails.
:::

## Two shortcuts: isin and between

Matching any of several values with `|` chains gets long. `isin` takes a list:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
problem = orders["status"].isin(["cancelled", "returned"])
print(problem.sum(), "cancelled or returned")

black_friday_week = orders["order_date"].between("2025-11-24", "2025-11-30 23:59:59")
print(black_friday_week.sum(), "orders in Black Friday week 2025")

bf = orders[orders["coupon_code"] == "BLACKFRIDAY25"]
print(bf["order_date"].dt.month.value_counts().head(3))
```

`between` includes both ends, which is why the upper bound carries a time. The last lines contain a real finding: of 124 orders with the `BLACKFRIDAY25` coupon, 91 are in November, and the rest are scattered across the year. Was the code left active, shared on a coupon site, or is the data wrong? Filters do not answer that, but they surface the question, and good analysts take it to the people who run the promotion before building on it. (`.dt.month` extracts the month number; Lesson 4.4 covers the `dt` accessor properly.)

### A filtered table is a new table

A filter returns a new DataFrame. `q4` above does not remember that it came from `orders`, and you should treat it as its own table: if you later want to add a column to it, you add it to `q4`, and `orders` stays untouched. In pandas 2 code you will often see `.copy()` after a filter: it makes that explicit and silences the `SettingWithCopyWarning` pandas 2 prints when you add a column to a filtered table. With Copy-on-Write, which is the default from pandas 3.0 and which you can switch on in pandas 2 with `pd.options.mode.copy_on_write = True`, every filtered result already behaves as an independent copy. Lesson 2.5 shows why this matters when you start changing values.

## Sorting and top-n

`sort_values` orders rows by one or more columns:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
latest = orders.sort_values("order_date", ascending=False)
print(latest[["order_id", "order_date", "status"]].head(3))

by_fee = orders.sort_values(["shipping_fee", "order_date"], ascending=[False, False])
print(by_fee[["order_id", "shipping_fee", "order_date"]].head(3))
print(orders.nlargest(3, "shipping_fee")[["order_id", "shipping_fee"]])
```

With a list of columns, the second column breaks ties in the first, and `ascending` takes a matching list. `nlargest(n, column)` and `nsmallest` are shortcuts for "sort and take the top n"; they are faster on big tables and say what you mean.

The three latest orders are still `processing` or `shipped`: they were placed in the last days of December and had not been delivered when the data was exported. That is another decision for your revenue definition, which you will make in Section 4.

:::tip Count before and after
Print `len(df)` before and after every filter. If a filter that should remove a handful of rows removes half the table, or none at all, you find out immediately instead of three steps later.
:::

In the exercise you isolate Q4 2025 and measure its coupon use. Next you add new columns, such as each line's revenue, and learn the one correct way to change values in a DataFrame.
