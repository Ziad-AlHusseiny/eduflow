---
summary: Answer a real business question end to end - define the metric, check the data, decompose revenue into orders, customers and order value, test each explanation, and write a conclusion with its caveats.
takeaways:
  - Start a business question by writing down the metric and its exact definition, then check the data that feeds it before any analysis.
  - Decompose a total into drivers (revenue = orders × average order value; orders = customers × orders per customer) to see which one moved.
  - Compare against the same period last year and against the seasonal pattern, so a normal peak is not mistaken for a breakthrough.
  - Test each popular explanation with a specific number, and say how much of the change it can and cannot explain.
  - A finished answer is a short conclusion, the evidence behind it, and the caveats that could change it.
further:
  - title: "Group by: split-apply-combine"
    url: https://pandas.pydata.org/docs/user_guide/groupby.html
  - title: Time series / date functionality
    url: https://pandas.pydata.org/docs/user_guide/timeseries.html
quiz:
  - q: Q4 revenue rose 82% on Q3 while orders rose 98% and average order value fell 8%. What drove the increase?
    options:
      - text: Bigger baskets, because revenue grew
        why: Average order value fell, so baskets got slightly smaller. Revenue grew despite that, not because of it.
      - text: The number of orders, which grew faster than revenue itself
        why: Correct. Revenue = orders × average order value. Nearly doubling orders with a slightly lower order value gives an 82% rise.
      - text: Price increases
        why: The 5% price rise happened in March 2025 and applies to Q3 and Q4 alike, so it cannot explain growth between them.
      - text: It is impossible to tell without a chart.
        why: The decomposition answers it numerically; a chart would show the same thing.
    answer: 1
  - q: Q4 2024 was also 73% above Q3 2024. Why does that matter for the Q4 2025 story?
    options:
      - text: It does not; 2024 is old data.
        why: The previous year is the best baseline for a seasonal business; ignoring it is how normal peaks become false headlines.
      - text: It proves the 2025 numbers are wrong.
        why: A similar pattern in both years supports the 2025 data rather than casting doubt on it.
      - text: It shows the 2024 data is duplicated into 2025.
        why: The levels are very different (52,537 versus 146,825); only the seasonal shape repeats.
      - text: Most of the Q3-to-Q4 jump is a seasonal pattern that happens every year, so 2025's jump is only slightly larger than normal.
        why: Correct. An 82% rise against a usual rise of about 73% is a modest surprise on top of a predictable peak.
    answer: 3
  - q: 63 Q4 orders worth 11,321 dollars are still `processing` or `shipped` at the end of the data. How should the report treat them?
    options:
      - text: Include them, and state as a caveat that about 8% of Q4 revenue is not yet delivered and may shrink if some are cancelled.
        why: Correct. They meet the revenue definition today; naming the risk lets readers judge it.
      - text: Exclude them silently to be safe.
        why: That changes the revenue definition without telling anyone, and makes Q4 look smaller than every other report.
      - text: Count them twice, since they will be delivered in January.
        why: An order counts once, in the period it was placed, whatever its delivery date.
    answer: 0
---

The head of growth's message has been waiting since Lesson 1.1: "Q4 2025 revenue was far higher than any quarter before. Was it Black Friday, more customers, bigger baskets, or a data mistake? I need an answer I can repeat to the board." This lesson works through the answer the way you would at work: define, check, decompose, test explanations, conclude. Every step uses a tool you already know.

## Step 1: define the metric and check the data

The metric is the course's revenue definition from Lesson 4.2: line revenue after discounts, excluding shipping and cancelled orders. Build one row per order, and assert the facts the analysis relies on before trusting a single number:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
per_order = items.groupby("order_id", as_index=False)["revenue"].sum()
df = orders.merge(per_order, on="order_id", how="left", validate="one_to_one")

assert df["order_id"].is_unique
assert df["revenue"].notna().all(), "an order has no items"
df = df[df["status"] != "cancelled"].copy()
df["quarter"] = df["order_date"].dt.to_period("Q")

print(df.groupby("quarter")["revenue"].sum().round(0))
print(df.loc[df["quarter"] == "2025Q4", "status"].value_counts())
```

Revenue went from 80,523 dollars in Q3 2025 to 146,825 in Q4, up 82%. No duplicates, no orders without items. One caveat surfaces immediately: 63 Q4 orders worth 11,321 dollars, about 8% of the quarter, are still `processing` or `shipped`. They count as revenue under the definition, but some could still be cancelled. Note it now; it goes in the final answer.

## Step 2: decompose the change

Revenue is orders times average order value, and orders are active customers times orders per customer. Computing each factor shows which one moved:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
df = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
df = df[df["status"] != "cancelled"].copy()
df["quarter"] = df["order_date"].dt.to_period("Q")

q = df.groupby("quarter").agg(
    revenue=("revenue", "sum"),
    orders=("order_id", "count"),
    customers=("customer_id", "nunique"),
)
q["aov"] = q["revenue"] / q["orders"]
q["orders_per_customer"] = q["orders"] / q["customers"]
print(q.round(2).tail(5))
print((q.loc["2025Q4"] / q.loc["2025Q3"] - 1).round(3))
```

The second print is the decomposition in one line. Orders rose 98% while average order value **fell** 8%: Q4 was about volume, not bigger baskets, which matches the medians you saw in Lesson 5.1. The extra orders came from both directions: 54% more active customers, and each ordered more often (2.28 orders per customer against 1.77).

## Step 3: put it next to last year

A jump is only surprising compared with what normally happens. Lesson 4.4 already showed the comparison that matters:

| | Q3 → Q4 growth | Year-over-year growth in Q4 |
|---|---|---|
| 2024 | +73% | (no 2023 data) |
| 2025 | +82% | +180% |

Q4 was 73% above Q3 in 2024 too, and November was the biggest month in both years. 2025's Q3-to-Q4 rise is only somewhat stronger than the usual seasonal lift, and Q4's 180% growth on the year before sits inside the range of the other 2025 quarters (145% to 200%). The board-level message starts to form: the business roughly tripled year over year (2025 revenue was 2.7 times 2024's), and Q4 is that bigger business hitting its normal holiday peak.

## Step 4: test the popular explanations

Each explanation gets one specific number:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
df = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
df = df[df["status"] != "cancelled"].copy()
df["quarter"] = df["order_date"].dt.to_period("Q")

first_q = df.groupby("customer_id")["order_date"].min().dt.to_period("Q").rename("first_quarter")
df = df.merge(first_q, on="customer_id", validate="many_to_one")
df["customer_type"] = (df["quarter"] == df["first_quarter"]).map({True: "new", False: "returning"})

q4 = df[df["quarter"] == "2025Q4"]
total = q4["revenue"].sum()
print(q4.groupby("customer_type")["revenue"].sum().div(total).round(3))
bf = q4["coupon_code"] == "BLACKFRIDAY25"
print("Black Friday coupon orders:", bf.sum(), "| share of Q4 revenue:", round(q4.loc[bf, "revenue"].sum() / total, 3))
print(q4.groupby(q4["order_date"].dt.month)["revenue"].sum().round(0))
```

**Black Friday?** The `BLACKFRIDAY25` coupon was used on 69 Q4 orders, bringing 8.4% of the quarter's revenue. November was huge, 75,334 dollars, but most of it came from orders without that coupon. Black Friday helped; it does not explain the jump. **New customers?** Customers placing their first order brought 36% of Q4 revenue, while 64% came from returning customers, who also account for two thirds of the 66,302-dollar rise over Q3. The jump rests mostly on an existing customer base that kept growing and kept coming back. **Bigger baskets?** Ruled out in Step 2. **Price rise?** The 5% increase took effect in March 2025, so it lifts Q3 and Q4 equally and explains none of the change between them. **Data mistake?** The checks in Step 1 found no duplicates or orphaned orders; the only open risk is the 8% not yet delivered.

:::figure From question to answer: each step narrows the explanation
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">Five steps in a row: define and check, decompose, compare with last year, test explanations, conclude. Under each step, its finding: data clean with 8 percent undelivered; orders up 98 percent and order value down 8 percent; 2024 had a 73 percent Q4 lift too; Black Friday coupons 8 percent and returning customers 64 percent; seasonal peak on a business that tripled.</title>
  <rect class="d-box" x="10" y="20" width="124" height="50" rx="10"/><text class="d-label-strong" x="72" y="50" text-anchor="middle">Check</text>
  <rect class="d-box" x="148" y="20" width="124" height="50" rx="10"/><text class="d-label-strong" x="210" y="50" text-anchor="middle">Decompose</text>
  <rect class="d-box" x="286" y="20" width="124" height="50" rx="10"/><text class="d-label-strong" x="348" y="50" text-anchor="middle">Last year</text>
  <rect class="d-box" x="424" y="20" width="124" height="50" rx="10"/><text class="d-label-strong" x="486" y="50" text-anchor="middle">Test ideas</text>
  <rect class="d-box-success" x="562" y="20" width="128" height="50" rx="10"/><text class="d-label-strong" x="626" y="50" text-anchor="middle">Conclude</text>
  <path class="d-arrow" d="M134 45 L146 45" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M272 45 L284 45" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M410 45 L422 45" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M548 45 L560 45" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="72" y="100" text-anchor="middle">clean;</text><text class="d-label-muted" x="72" y="120" text-anchor="middle">8% undelivered</text>
  <text class="d-label-muted" x="210" y="100" text-anchor="middle">orders +98%</text><text class="d-label-muted" x="210" y="120" text-anchor="middle">AOV -8%</text>
  <text class="d-label-muted" x="348" y="100" text-anchor="middle">2024 Q4 lift</text><text class="d-label-muted" x="348" y="120" text-anchor="middle">was +73%</text>
  <text class="d-label-muted" x="486" y="100" text-anchor="middle">coupon 8%;</text><text class="d-label-muted" x="486" y="120" text-anchor="middle">returning 64%</text>
  <text class="d-label-muted" x="626" y="100" text-anchor="middle">seasonal peak</text><text class="d-label-muted" x="626" y="120" text-anchor="middle">on a 2.7x business</text>
</svg>
:::

## Step 5: write the answer

The analysis is only finished when someone else can repeat it in a meeting. Lead with the conclusion, give the evidence in numbers, end with the caveats:

> **Q4 2025 revenue (146,825 dollars, +82% on Q3) was mainly Cartwheel's normal holiday peak on a business that grew 2.7x year over year.** The rise came from order volume (+98%), not order size (average order value fell 8%), with 54% more active customers ordering more often. Q4 was 73% above Q3 in 2024 as well. Returning customers produced 64% of Q4 revenue; Black Friday coupon orders produced 8.4%. **Caveats:** 8% of Q4 revenue is from orders not yet delivered, and the decline in order value is partly the cost of Q4 discounts, which more than tripled on Q3 (5,581 dollars versus 1,615).

:::mistake Stopping at the first plausible story
"It was Black Friday" fits the timing and would have been accepted in most meetings. It explains 8% of the quarter. The habit that protects you is to give every explanation a number and ask what share of the change it accounts for, before you write it in a slide.
:::

In the exercise you rebuild the decomposition in code. The final lesson turns this analysis into something you can rerun next quarter without starting over.
