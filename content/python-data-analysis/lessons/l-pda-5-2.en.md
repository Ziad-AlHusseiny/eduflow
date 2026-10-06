---
summary: Choose the right chart for a question, draw it from a DataFrame with pandas .plot and matplotlib's figure and axes, and label it so the chart states its finding on its own.
takeaways:
  - Pick the chart from the question - line for change over time, sorted bars for comparing categories, histogram for a distribution, scatter for a relationship.
  - "`fig, ax = plt.subplots()` then `df.plot(ax=ax)` gives you pandas' convenience with matplotlib's full control over titles, axes and saving."
  - Prepare a small, tidy table first (one row per bar or point), then plot it; most charting problems are data-shaping problems.
  - Bars start at zero, axes carry units, and the title states the finding rather than naming the variables.
  - "`fig.savefig(\"chart.png\", dpi=150, bbox_inches=\"tight\")` saves the chart for a report; charts are not shown in this course's Run blocks."
further:
  - title: pandas - Chart visualization
    url: https://pandas.pydata.org/docs/user_guide/visualization.html
  - title: matplotlib - Quick start guide
    url: https://matplotlib.org/stable/users/explain/quick_start.html
  - title: matplotlib.axes.Axes.bar_label
    url: https://matplotlib.org/stable/api/_as_gen/matplotlib.axes.Axes.bar_label.html
quiz:
  - q: You want to show that revenue per channel grew from 2024 to 2025. Which chart reads best?
    options:
      - text: Two pie charts, one per year
        why: Pies show parts of one whole; comparing slice sizes across two pies is hard, and they hide the growth in the total.
      - text: A histogram of order values
        why: A histogram shows a distribution of one variable; it says nothing about channels or years.
      - text: A scatter plot of order value against order date
        why: Two thousand points show spread over time, but not the per-channel totals you want to compare.
      - text: Grouped bars, one group per channel and one bar per year, starting at zero
        why: Correct. Bars compare amounts, grouping puts the two years side by side for each channel, and a zero baseline keeps lengths honest.
    answer: 3
  - q: "What is the advantage of `fig, ax = plt.subplots()` followed by `monthly.plot(ax=ax)`, over calling `monthly.plot()` alone?"
    options:
      - text: You hold the axes object, so you can set titles, labels, formatting and save the exact figure you configured.
        why: Correct. pandas draws onto the axes you pass, and you keep full matplotlib control over everything else.
      - text: It is the only way to make a line chart.
        why: "`monthly.plot()` alone also draws a line chart; it just creates the figure for you."
      - text: It makes the chart interactive.
        why: Interactivity depends on the environment and backend, not on how the axes were created.
    answer: 0
  - q: "A bar chart of revenue by country has a y-axis starting at 60,000. What is the problem?"
    options:
      - text: The bars become too thin.
        why: The axis range does not change bar width.
      - text: Bar lengths no longer match the values, so a 10% difference can look like a 300% difference.
        why: Correct. Readers compare bar lengths; cutting the baseline exaggerates differences. Line charts can zoom in, bars cannot.
      - text: Countries with lower revenue disappear.
        why: Bars below 60,000 would be cut off or vanish, which is a symptom of the real problem, the misleading baseline.
    answer: 1
---

You have numbers that answer the head of growth's question, and soon you will present them. A table of 24 monthly figures makes people squint; a line chart of the same figures shows the November spike before anyone reads an axis. Charts are not decoration added at the end. They are how most people will consume your analysis, and a good one is often the whole message.

This lesson's chart code is for your own Jupyter notebook: the Run blocks in this course show printed text, not images. The data preparation runs here as usual.

## Choose the chart from the question

:::figure Four questions, four chart types
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">Four panels. How does it change over time: a line chart. Which group is bigger: sorted horizontal bars. How are values spread: a histogram. Do two things move together: a scatter plot.</title>
  <rect class="d-box" x="10" y="10" width="160" height="160" rx="10"/>
  <path class="d-arrow" d="M30 130 L60 115 L90 120 L120 95 L150 50"/>
  <text class="d-label-strong" x="90" y="196" text-anchor="middle">change over time</text>
  <text class="d-label-muted" x="90" y="214" text-anchor="middle">line</text>
  <rect class="d-box" x="185" y="10" width="160" height="160" rx="10"/>
  <rect class="d-box-primary" x="200" y="35" width="130" height="20"/>
  <rect class="d-box-primary" x="200" y="65" width="100" height="20"/>
  <rect class="d-box-primary" x="200" y="95" width="75" height="20"/>
  <rect class="d-box-primary" x="200" y="125" width="40" height="20"/>
  <text class="d-label-strong" x="265" y="196" text-anchor="middle">compare groups</text>
  <text class="d-label-muted" x="265" y="214" text-anchor="middle">sorted bars</text>
  <rect class="d-box" x="360" y="10" width="160" height="160" rx="10"/>
  <rect class="d-box-accent" x="375" y="100" width="22" height="50"/>
  <rect class="d-box-accent" x="399" y="70" width="22" height="80"/>
  <rect class="d-box-accent" x="423" y="60" width="22" height="90"/>
  <rect class="d-box-accent" x="447" y="95" width="22" height="55"/>
  <rect class="d-box-accent" x="471" y="125" width="22" height="25"/>
  <text class="d-label-strong" x="440" y="196" text-anchor="middle">spread of values</text>
  <text class="d-label-muted" x="440" y="214" text-anchor="middle">histogram</text>
  <rect class="d-box" x="535" y="10" width="160" height="160" rx="10"/>
  <circle class="d-dot" cx="560" cy="140" r="4"/><circle class="d-dot" cx="580" cy="120" r="4"/><circle class="d-dot" cx="600" cy="125" r="4"/>
  <circle class="d-dot" cx="615" cy="95" r="4"/><circle class="d-dot" cx="635" cy="85" r="4"/><circle class="d-dot" cx="650" cy="60" r="4"/><circle class="d-dot" cx="670" cy="45" r="4"/>
  <text class="d-label-strong" x="615" y="196" text-anchor="middle">relationship</text>
  <text class="d-label-muted" x="615" y="214" text-anchor="middle">scatter</text>
</svg>
:::

Most business charts are one of these four. Pie charts compare poorly beyond two or three slices; a sorted bar chart says the same thing more clearly. Charts with two different y-axes invite the reader to compare lines that are on unrelated scales, so prefer two charts stacked one above the other.

## Prepare the data, then plot

A chart wants a small table: one row per point or bar, already sorted and labelled. Building it is ordinary pandas, and it runs here:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

monthly = orders.set_index("order_date").resample("ME")["revenue"].sum()
by_year = monthly.groupby([monthly.index.year, monthly.index.month]).sum().unstack(level=0)
by_year.index.name = "month"
print(by_year.round(0))
```

`unstack(level=0)` moves the year into the columns, giving one column per year and one row per month: exactly the shape for a chart with one line per year. Comparing years on the same January-to-December axis is how you see seasonality: if both lines rise in November, the November spike is a pattern, not an accident.

## Draw it with pandas and matplotlib

pandas' `.plot` methods call matplotlib for you. Create the figure and axes yourself, so you can finish the chart properly:

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 4))
by_year.plot(ax=ax, marker="o")
ax.set_title("November is the peak in both years; 2025 runs about 2.7x 2024")
ax.set_xlabel("Month")
ax.set_ylabel("Revenue (USD)")
ax.yaxis.set_major_formatter("${x:,.0f}")
ax.set_xticks(range(1, 13))
ax.legend(title="Year")
fig.tight_layout()
fig.savefig("monthly_revenue.png", dpi=150, bbox_inches="tight")
```

`plt.subplots()` returns a **figure** (the whole image) and an **axes** (one plotting area with its x and y axes). `by_year.plot(ax=ax)` draws one line per column onto that axes, and every `ax.set_...` call refines it. A format string passed to `set_major_formatter` turns tick values into dollars with thousands separators. `savefig` writes the file you paste into a slide; `bbox_inches="tight"` trims empty margins.

For comparing categories, sort first and use horizontal bars so long labels stay readable:

```python
# sales: the line-level table you built in Lesson 4.2
revenue_by_country = sales.groupby("country")["revenue"].sum().sort_values()

fig, ax = plt.subplots(figsize=(7, 4))
bars = ax.barh(revenue_by_country.index, revenue_by_country.values)
ax.bar_label(bars, fmt="${:,.0f}", padding=3)
ax.set_title("UAE and UK lead revenue; Jordan trails")
ax.set_xlabel("Revenue 2024-2025 (USD)")
fig.tight_layout()
```

And for a distribution, a histogram of order values with the median marked:

```python
fig, ax = plt.subplots(figsize=(7, 4))
orders["revenue"].plot.hist(bins=40, ax=ax)
ax.axvline(orders["revenue"].median(), linestyle="--", label="median $147")
ax.set_xlabel("Order value (USD)")
ax.legend()
```

For relationships, a scatter plot puts one numeric column on each axis. With thousands of points they pile up into a blob, so make them small and partly transparent, and it is often clearer to plot a summary instead, such as the purchase rate per number of pages viewed:

```python
# assumes fig, ax = plt.subplots() and churn.csv / web_sessions.csv loaded as churn / sessions
churn.plot.scatter(x="tenure_days", y="total_spent", s=8, alpha=0.3, ax=ax)

rate = sessions.groupby("pages_viewed")["purchased"].mean()
rate.loc[:15].plot(ax=ax, marker="o")   # one point per page count, up to 15
```

The first line is the pattern for any two numeric columns, here each customer's tenure against their total spend from `churn.csv`; the other two turn 6,000 sessions into fifteen readable points, each a conversion rate.

## Check the chart before you share it

Charts hide mistakes well. Before a chart leaves your notebook, compare it with the table it came from: the number of bars or points, the first and last period (a partial month at the end looks like a collapse, as Lesson 4.4 warned), and one or two values you can read off and check against a printed number. Then look at it once as a stranger would: can someone who has never seen the data say what it shows in one sentence? If not, change the title, the sort order or the chart type, not the reader.

You will also meet **seaborn**, a library built on matplotlib with good statistical defaults. Everything here carries over: it draws onto the same `ax`, and the same rules about baselines and titles apply.

:::mistake A title that names the axes
"Revenue by month" tells the reader what the axes already say. "November is the peak in both years" tells them what to see. Write the title as the sentence you would say while pointing at the chart, and keep the variable names for the axis labels.
:::

:::tip Fewer colours, more meaning
Use one colour for everything, then a second, stronger colour for the one bar or line the reader should look at, such as Q4 2025. Default colour cycles are fine for exploring; for a presentation, colour should carry the message.
:::

In this lesson's exercise you pick the right charts for a set of questions. Next you put everything together and answer the Q4 question end to end.
