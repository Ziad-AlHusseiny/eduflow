---
summary: Rank customers by spend, measure how concentrated revenue is, and turn a continuous number into segments with cut (fixed boundaries) and qcut (equal-sized groups).
takeaways:
  - "`rank(ascending=False, method=\"min\")` numbers rows by value; the `method` decides how ties are numbered, and `pct=True` gives percentile ranks."
  - "`pd.cut` assigns values to bins with boundaries you choose; use `np.inf` as the last edge so nothing falls outside."
  - "`pd.qcut` makes bins with (nearly) equal numbers of rows, such as quartiles; when many values tie, pass `duplicates=\"drop\"`."
  - Both return a categorical column, so group by it with `observed=True` and sort by the category order, not alphabetically.
  - A concentration figure such as "the top 20% of customers bring 55% of revenue" is often the most useful single number you can give a business.
further:
  - title: pandas.cut
    url: https://pandas.pydata.org/docs/reference/api/pandas.cut.html
  - title: pandas.qcut
    url: https://pandas.pydata.org/docs/reference/api/pandas.qcut.html
  - title: pandas.Series.rank
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.rank.html
quiz:
  - q: "`pd.cut(spend, bins=[0, 250, 500, 1000])` leaves some customers as `NaN`. Which ones?"
    options:
      - text: Customers who spent exactly 250
        why: With the default `right=True`, 250 falls in the `(0, 250]` bin, so it is labelled.
      - text: Customers who spent more than 1,000
        why: Correct. Values above the last edge belong to no bin. End the edges with `np.inf` to catch everything.
      - text: Customers with very small spend, such as 18 dollars
        why: 18 is inside `(0, 250]`. Only a spend of exactly 0 would fall outside, because the left edge is excluded.
      - text: Customers who placed only one order
        why: "`cut` looks only at the values you pass, here spend; the number of orders plays no part."
    answer: 1
  - q: You want four customer groups with the same number of customers each. Which tool fits?
    options:
      - text: "`pd.cut(spend, 4)`"
        why: An integer `bins` with `cut` makes four ranges of equal **width**, which for skewed spend puts most customers in the first bin.
      - text: "`spend.rank(pct=True)`"
        why: Percentile ranks are a step in the right direction, but they are numbers, not four labelled groups.
      - text: "`pd.qcut(spend, 4)`"
        why: Correct. `qcut` cuts at the quartiles, so each group holds about a quarter of the customers.
    answer: 2
  - q: "Two customers tie for second place by spend. With `rank(ascending=False, method=\"min\")`, what ranks do they and the next customer get?"
    options:
      - text: 2, 2 and 4
        why: Correct. `min` gives tied rows the lowest rank of the group, and the next rank skips to account for the tie, like sports rankings.
      - text: 2, 3 and 4
        why: That is `method="first"`, which breaks ties by the order rows appear in.
      - text: 2, 2 and 3
        why: That is `method="dense"`, which never leaves gaps after ties.
      - text: 2.5, 2.5 and 4
        why: That is the default `method="average"`, which gives tied rows the mean of the ranks they span.
    answer: 0
---

"Who are our best customers?" is a question every sales or marketing team asks, and the honest answer has two parts: a ranked list, and how much the top of that list matters. At Cartwheel the answer is striking, and it shapes how you should read every revenue number, including the Q4 jump.

## One row per customer

Start with a customer-level table: one row per customer, with orders and spend, built with the groupby from Lesson 4.1.

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

cust = orders.groupby("customer_id").agg(orders=("order_id", "count"), spend=("revenue", "sum"))
print(len(cust), "customers with a non-cancelled order")
print(cust["spend"].describe().round(0))
```

503 customers. The median spent 551 dollars, the mean 888, the top one 5,370. When the mean sits far above the median, a few large values are pulling it up; Lesson 5.1 returns to what that means for reporting averages.

## Ranking

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
cust = orders.groupby("customer_id").agg(orders=("order_id", "count"), spend=("revenue", "sum"))

cust["rank"] = cust["spend"].rank(ascending=False, method="min")
cust["percentile"] = cust["spend"].rank(pct=True)
print(cust.sort_values("rank").head(5).round(2))

top20 = cust.nlargest(int(len(cust) * 0.2), "spend")
print(len(top20), "customers =", round(top20["spend"].sum() / cust["spend"].sum(), 3), "of revenue")
```

`rank` gives every row its position, with 1 for the highest spend because of `ascending=False`. Ties are where the methods differ: `"min"` gives tied customers the same rank and skips the next numbers, like a sports table, `"dense"` never skips, `"first"` breaks ties by row order, and the default `"average"` gives them the mean rank. `pct=True` turns ranks into percentiles between 0 and 1, which compare across groups of different sizes.

The last line is the concentration figure: the top 100 customers, a fifth of the base, generate 55.5% of revenue. That is less extreme than the textbook 80/20 rule, but still means losing a handful of big customers would hurt more than losing a hundred small ones.

### Ranking within groups

Country managers want their own top customers, not a global list where the largest markets crowd everyone else out. `rank` works on a grouped column too, restarting at 1 inside each group:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
customers = pd.read_csv("customers.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
cust = orders.groupby("customer_id", as_index=False).agg(spend=("revenue", "sum"))
cust = cust.merge(customers[["customer_id", "country"]], on="customer_id", validate="one_to_one")

cust["rank_in_country"] = cust.groupby("country")["spend"].rank(ascending=False, method="first")
print(cust[cust["rank_in_country"] == 1].sort_values("spend", ascending=False).round(0))
```

Filtering on `rank_in_country == 1` keeps each country's top spender, eight rows in all; keeping ranks of 3 or less would give a top-three list per country. `method="first"` guarantees exactly one row per rank even when two customers tie, which is what you want for a fixed-length list. This "rank within group, then filter" pattern answers a whole family of questions: the best-selling product per category, the first order of each customer, the latest ticket per order.

## cut: bins with boundaries you choose

Marketing wants spend bands they can name in a campaign. You choose the edges:

```python run
import numpy as np
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
cust = orders.groupby("customer_id").agg(orders=("order_id", "count"), spend=("revenue", "sum"))

cust["band"] = pd.cut(cust["spend"], bins=[0, 250, 500, 1000, 2000, np.inf],
                      labels=["<250", "250-500", "500-1k", "1k-2k", "2k+"])
print(cust.groupby("band", observed=True)["spend"].agg(["count", "sum"]).round(0))
```

Each edge pair defines a bin, closed on the right by default: `(250, 500]` includes 500 but not 250. The 57 customers in the `2k+` band, 11% of the base, brought in 173,407 dollars, more than any other band. `cut` returns a **categorical** column whose categories keep your order, so the table lists the bands from smallest to largest rather than alphabetically.

:::mistake Forgetting the outer edges
Bins `[0, 250, 500, 1000]` silently leave every customer above 1,000 as `NaN`, and the left edge excludes 0 itself. End the list with `np.inf` (and start it below your minimum, or pass `include_lowest=True`), then confirm with `band.isna().sum() == 0`.
:::

## qcut: equal-sized groups

When you want groups of equal size rather than fixed boundaries, `qcut` cuts at quantiles:

:::figure cut uses fixed boundaries; qcut uses equal counts
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">Top row: cut splits the spend axis at fixed values 250, 500, 1000 and 2000; the bins hold different numbers of customers. Bottom row: qcut splits at the quartiles 210, 551 and 1236 so each of the four bins holds about 126 customers.</title>
  <text class="d-label-strong" x="20" y="40">cut</text>
  <rect class="d-box-accent" x="80" y="20" width="120" height="36" rx="4"/><text class="d-label" x="140" y="43" text-anchor="middle">143</text>
  <rect class="d-box-accent" x="205" y="20" width="80" height="36" rx="4"/><text class="d-label" x="245" y="43" text-anchor="middle">92</text>
  <rect class="d-box-accent" x="290" y="20" width="110" height="36" rx="4"/><text class="d-label" x="345" y="43" text-anchor="middle">118</text>
  <rect class="d-box-accent" x="405" y="20" width="90" height="36" rx="4"/><text class="d-label" x="450" y="43" text-anchor="middle">93</text>
  <rect class="d-box-accent" x="500" y="20" width="60" height="36" rx="4"/><text class="d-label" x="530" y="43" text-anchor="middle">57</text>
  <text class="d-label-muted" x="590" y="43">customers</text>
  <text class="d-label-strong" x="20" y="130">qcut</text>
  <rect class="d-box-success" x="80" y="110" width="118" height="36" rx="4"/><text class="d-label" x="139" y="133" text-anchor="middle">126</text>
  <rect class="d-box-success" x="203" y="110" width="118" height="36" rx="4"/><text class="d-label" x="262" y="133" text-anchor="middle">126</text>
  <rect class="d-box-success" x="326" y="110" width="118" height="36" rx="4"/><text class="d-label" x="385" y="133" text-anchor="middle">125</text>
  <rect class="d-box-success" x="449" y="110" width="118" height="36" rx="4"/><text class="d-label" x="508" y="133" text-anchor="middle">126</text>
  <text class="d-code" x="200" y="172" text-anchor="middle">210</text>
  <text class="d-code" x="323" y="172" text-anchor="middle">551</text>
  <text class="d-code" x="446" y="172" text-anchor="middle">1236</text>
  <text class="d-label-muted" x="600" y="172">quartile edges</text>
</svg>
:::

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
cust = orders.groupby("customer_id").agg(orders=("order_id", "count"), spend=("revenue", "sum"))

cust["quartile"] = pd.qcut(cust["spend"], q=4, labels=["Q1 low", "Q2", "Q3", "Q4 high"])
share = cust.groupby("quartile", observed=True)["spend"].sum() / cust["spend"].sum()
print(share.round(3))
print(pd.qcut(cust["orders"], q=4, duplicates="drop").value_counts().sort_index())
```

The top quartile of customers brings 63.2% of revenue, the bottom quartile 2.8%. The last line shows qcut's limit: a third of customers placed exactly one order, so the two lowest quartile edges are both 1, and plain `qcut` raises `ValueError: Bin edges must be unique`. `duplicates="drop"` merges the repeated edges, leaving fewer, unequal groups. For counts with many ties, `cut` with hand-picked edges is usually clearer.

:::tip Name the rule, not just the bin
"Q4 high" means something different every time the data changes, because the quartile edges move. "Spent more than 1,236 dollars in 2024 and 2025" does not. When a segment is used outside your notebook, write down its edges. The same goes for the period: a customer's band in a two-year table is not their band in a single quarter.
:::

In the exercise you segment customers yourself. That completes the analysis toolkit; Section 5 turns it on real questions, starting with what an average can and cannot tell you.
