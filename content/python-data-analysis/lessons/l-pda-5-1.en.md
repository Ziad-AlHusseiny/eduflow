---
summary: Describe a numeric column honestly with the median, quantiles and spread, recognise skewed distributions and outliers, and read correlations without mistaking them for causes.
takeaways:
  - In skewed data such as order values, the mean sits well above the median; report the median (and a few quantiles) when you describe a typical value.
  - "`quantile([0.25, 0.75])` gives the quartiles; values beyond 1.5 times the interquartile range from them are worth a look, not automatic deletion."
  - "`value_counts(bins=[...])` is a quick text histogram that shows the shape of a distribution without a chart."
  - Compare groups with both their mean and median and their sizes, so one big order or one tiny group does not drive the conclusion.
  - "`corr()` measures how two columns move together; a strong correlation is a lead to investigate, never proof that one causes the other."
further:
  - title: Descriptive statistics in pandas
    url: https://pandas.pydata.org/docs/user_guide/basics.html#descriptive-statistics
  - title: pandas.Series.quantile
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.quantile.html
  - title: pandas.DataFrame.corr
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.corr.html
quiz:
  - q: Cartwheel's order values have a mean of 228 dollars and a median of 147. What does that tell you about the distribution?
    options:
      - text: It is skewed to the right; a minority of large orders pulls the mean above the typical order.
        why: Correct. Half of all orders are below 147 dollars, and a long tail of big orders lifts the mean by 81 dollars.
      - text: The data contains errors, because mean and median should be equal.
        why: They are equal only for symmetric distributions. Money, durations and counts are usually skewed, with no error involved.
      - text: Most orders are close to 228 dollars.
        why: The median says half the orders are below 147, so 228 is not where most orders sit.
      - text: There are more small orders than large ones, so the mean is too low.
        why: Many small orders and a few huge ones push the mean **up**, not down.
    answer: 0
  - q: You find 125 orders above the 1.5 × IQR upper fence. What should you do with them?
    options:
      - text: Delete them; outliers distort averages.
        why: These are real orders worth 26% of revenue. Deleting them would misrepresent the business.
      - text: Replace them with the median.
        why: Replacing real sales with a typical value is inventing data, and it would erase most of that quarter of revenue.
      - text: Inspect them, check they are genuine, and report results with and without them if they change the conclusion.
        why: Correct. The fence flags values for review. Genuine large orders are part of the story, often the most interesting part.
    answer: 2
  - q: In `churn.csv`, `days_since_last_order` has a correlation of 0.45 with `churned`. Which statement is justified?
    options:
      - text: Long gaps between orders cause customers to churn.
        why: Correlation cannot establish cause. Both may reflect a third factor, such as the customer losing interest.
      - text: Customers who churned tended to have longer gaps since their last order, so the gap is a useful warning signal.
        why: Correct. A moderate positive correlation supports using it as an indicator, which is what the ML course builds on, without claiming a cause.
      - text: 45% of customers with long gaps churned.
        why: A correlation coefficient is not a percentage of customers; it measures the strength of a linear relationship between -1 and 1.
      - text: The relationship is too weak to be useful.
        why: 0.45 is a moderate correlation, and the medians (46 days for active customers, 214 for churned) show a large practical difference.
    answer: 1
---

Someone asks: "What's a typical Cartwheel order?" You compute the mean, 228 dollars, and say so. Then the marketing team designs a free-shipping threshold around 228 dollars, and discovers that two thirds of orders never reach it. The mean was correct and the answer was wrong, because order values are not spread evenly around their average. Describing data honestly means describing its shape, not only its centre.

## Mean, median and quantiles

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
value = orders["revenue"]

print(value.describe(percentiles=[0.1, 0.25, 0.5, 0.75, 0.9, 0.99]).round(2))
print("skew:", round(value.skew(), 2))
```

Read it from the middle out. The **median** (50%) is 147 dollars: half of all orders are smaller. The quartiles say the middle half of orders falls between 68 and 303 dollars. The 90th percentile is 505 and the 99th is 1,168, while the maximum is 2,117. The mean, 228, sits far above the median because of that long right tail, and the positive skew of 2.43 confirms it. For a typical value in skewed data, quote the median; for totals and forecasts, the mean is the right number, because mean × count = total.

`std`, the standard deviation, is 241 dollars, larger than the median itself. That is another sign of a spread-out, skewed distribution; in that situation quantiles describe the spread far better than "mean plus or minus one standard deviation".

## The shape, without a chart

`value_counts` with bins counts how many values fall in each range, which is a histogram in text form:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

print(orders["revenue"].value_counts(bins=[0, 50, 100, 200, 400, 800, 3000]).sort_index())
```

:::figure Order values are skewed: most orders are small, a long tail is large
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">A bar chart of order counts by value band: 338 orders up to 50 dollars, 398 from 50 to 100, 476 from 100 to 200, 420 from 200 to 400, 256 from 400 to 800 and 73 above 800. A marker shows the median at 147 dollars in the third band and the mean at 228 dollars in the fourth.</title>
  <path class="d-line" d="M40 200 L680 200"/>
  <rect class="d-box-accent" x="60" y="129" width="80" height="71"/>
  <rect class="d-box-accent" x="160" y="116" width="80" height="84"/>
  <rect class="d-box-accent" x="260" y="100" width="80" height="100"/>
  <rect class="d-box-accent" x="360" y="112" width="80" height="88"/>
  <rect class="d-box-accent" x="460" y="146" width="80" height="54"/>
  <rect class="d-box-accent" x="560" y="185" width="80" height="15"/>
  <text class="d-label" x="100" y="122" text-anchor="middle">338</text>
  <text class="d-label" x="200" y="109" text-anchor="middle">398</text>
  <text class="d-label" x="300" y="93" text-anchor="middle">476</text>
  <text class="d-label" x="400" y="105" text-anchor="middle">420</text>
  <text class="d-label" x="500" y="139" text-anchor="middle">256</text>
  <text class="d-label" x="600" y="178" text-anchor="middle">73</text>
  <text class="d-label-muted" x="100" y="220" text-anchor="middle">0-50</text>
  <text class="d-label-muted" x="200" y="220" text-anchor="middle">50-100</text>
  <text class="d-label-muted" x="300" y="220" text-anchor="middle">100-200</text>
  <text class="d-label-muted" x="400" y="220" text-anchor="middle">200-400</text>
  <text class="d-label-muted" x="500" y="220" text-anchor="middle">400-800</text>
  <text class="d-label-muted" x="600" y="220" text-anchor="middle">800+</text>
  <path class="d-line d-dashed" d="M318 40 L318 200"/>
  <text class="d-label-strong" x="318" y="32" text-anchor="middle">median 147</text>
  <path class="d-arrow d-dashed" d="M374 60 L374 200"/>
  <text class="d-label-strong" x="420" y="56" text-anchor="middle">mean 228</text>
  <text class="d-label-muted" x="350" y="244" text-anchor="middle">order value, dollars (bands are not equal width)</text>
</svg>
:::

Most orders sit between 50 and 400 dollars, and a thinning tail runs past 800. Notice the bands get wider as they go right; equal-width bands of 100 dollars would squash nearly everything into the first few bars.

## Outliers: flag, then decide

A common rule of thumb flags values more than 1.5 interquartile ranges (IQR, the distance between the quartiles) beyond the quartiles:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
value = orders["revenue"]

q1, q3 = value.quantile([0.25, 0.75])
upper = q3 + 1.5 * (q3 - q1)
big = value > upper
print(f"fence {upper:.2f}: {big.sum()} orders, {value[big].sum() / value.sum():.1%} of revenue")
```

125 orders are above 656.62 dollars, and together they bring in 25.9% of revenue. These are not errors to clean away: they are multi-item orders of desks, chairs and dumbbells, real and important. An outlier rule tells you where to look. Data entry errors, such as a total with a missing decimal point, get fixed; genuine extremes stay, and you check whether your conclusion survives with and without them.

:::mistake Comparing means of small, skewed groups
One 2,000-dollar order added to a 30-order group moves its mean by about 60 dollars. Before saying "marketplace customers spend less", put the count, the mean and the median side by side: `orders.groupby("channel")["revenue"].agg(["count", "mean", "median"])`. Here the means run from 214 (marketplace) to 236 dollars (web), but the highest median belongs to the app, 153 against the web's 147: the two measures do not even agree on which channel has the bigger typical order.
:::

### The same lens over time

Distributions can be compared across periods too, and this one carries a clue for the case study. If Q4 2025 revenue jumped because customers bought bigger baskets, the typical order should have grown:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

quarter = orders["order_date"].dt.to_period("Q")
print(orders.groupby(quarter)["revenue"].agg(["count", "median"]).round(1).tail(4))
```

It did not. The median order in Q4 2025 was 151.70 dollars, slightly **below** Q3's 159.20, while the number of orders doubled. Whatever happened in Q4, it was about how many orders arrived, not how big they were. One table of medians has already ruled out a popular explanation.

## Correlation: moving together is not causing

`corr()` measures how strongly two numeric columns move together, from -1 (perfectly opposite) through 0 (no linear relation) to 1 (perfectly together). `churn.csv` has one row per customer and a `churned` flag:

```python run
import pandas as pd

churn = pd.read_csv("churn.csv")
cols = ["tenure_days", "orders", "days_since_last_order", "support_tickets", "churned"]
print(churn[cols].corr().round(2)["churned"])
print(churn.groupby("churned")["days_since_last_order"].median())
```

Customers who churned had gone far longer since their last order: a median of 214 days against 46, and a correlation of 0.45. That makes the gap a good warning signal. It does not show that the gap **causes** churn; a customer who has already lost interest stops ordering and churns, and both measurements reflect that one fact. Treat correlations as leads to investigate, and keep the word "causes" for experiments.

In the exercise you describe Cartwheel's order values yourself. Next you turn numbers like these into charts.
