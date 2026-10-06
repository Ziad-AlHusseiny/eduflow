---
summary: Turn timestamped orders into monthly, quarterly and weekly series with resample, compare periods with pct_change, smooth noise with rolling, and extract calendar parts with the dt accessor.
takeaways:
  - "`df.set_index(\"order_date\").resample(\"ME\")[\"revenue\"].sum()` buckets rows into calendar months; `\"QE\"`, `\"W\"` and `\"D\"` give quarters, weeks and days."
  - In pandas 2.2 and later, `resample` writes month and quarter ends as `"ME"` and `"QE"`; the old `"M"` and `"Q"` aliases are deprecated there, while periods such as `to_period("M")` keep the short names.
  - resample includes empty periods (a month with no orders shows 0), while grouping by `dt.to_period("M")` only lists periods that have data.
  - "`pct_change()` compares each period with the previous one, and `pct_change(4)` on quarters compares with the same quarter a year earlier."
  - "Resample labels mark the end of each bin, so a weekly series can show a 2026 label for orders placed in December 2025; check the first and last periods for partial data."
further:
  - title: Time series / date functionality - resampling
    url: https://pandas.pydata.org/docs/user_guide/timeseries.html#resampling
  - title: Offset aliases
    url: https://pandas.pydata.org/docs/user_guide/timeseries.html#offset-aliases
  - title: pandas.Series.pct_change
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.pct_change.html
quiz:
  - q: "Quarterly revenue is in `q`, oldest first. Which expression gives each quarter's growth versus the same quarter one year earlier?"
    options:
      - text: "`q.pct_change()`"
        why: That compares each quarter with the one right before it, so Q4 is compared with Q3, which mixes growth with seasonality.
      - text: "`q.pct_change(4)`"
        why: Correct. With quarterly data, four periods back is the same quarter last year, which removes the seasonal pattern from the comparison.
      - text: "`q.diff(4)`"
        why: "`diff` gives the change in dollars, not a percentage."
      - text: "`q.rolling(4).mean()`"
        why: This smooths the series over a year; it does not compare periods.
    answer: 1
  - q: "A weekly order count made with `resample(\"W\")` ends with a week labelled 2026-01-04 that has only 11 orders. What is going on?"
    options:
      - text: The data contains orders from 2026 that should be removed.
        why: The data ends on 30 December 2025. The label is the week's end date, not the order dates.
      - text: "`resample` invented a week that does not exist."
        why: The week of 29 December to 4 January exists; the data just stops partway through it.
      - text: The last week is labelled by its Sunday, 4 January, and only contains two days of data, so it looks artificially low.
        why: Correct. Weekly bins end on Sunday by default. Drop or mark partial periods before comparing them with full ones.
    answer: 2
  - q: Which code gives the number of orders per weekday name?
    options:
      - text: "`orders.groupby(orders[\"order_date\"].dt.day_name()).size()`"
        why: Correct. The `dt` accessor extracts the weekday name per row, and grouping by that Series counts orders per day name.
      - text: "`orders.resample(\"D\").size()`"
        why: This counts orders per calendar day (729 rows), not per weekday, and it needs a datetime index.
      - text: "`orders[\"order_date\"].day_name().value_counts()`"
        why: Datetime methods on a column live behind `.dt`; without it, pandas raises `AttributeError`.
    answer: 0
---

The monthly figures you have used since Lesson 1.3 came from somewhere: a few thousand timestamped orders, bucketed by calendar month. Time is the axis of almost every business question ("Is revenue growing?", "Is this November normal?", "When do people shop?"), and pandas has tools built for it. Before using them, you need one row per order with its revenue and timestamp.

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
order_revenue = items.groupby("order_id", as_index=False)["revenue"].sum()

orders = orders.merge(order_revenue, on="order_id", how="left", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
print(orders[["order_id", "order_date", "revenue"]].head(3))
```

Every run block below starts with these lines, shortened to keep them readable. In your own notebook you would run them once.

## resample: buckets of time

`resample` groups rows into regular time periods. It needs the dates in the index:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

by_time = orders.set_index("order_date")
monthly = by_time.resample("ME")["revenue"].sum()
quarterly = by_time.resample("QE")["revenue"].sum()
print(len(monthly), "months")
print(monthly.tail(4).round(0))
print(quarterly.round(0))
```

The string is a frequency alias: `"D"` for days, `"W"` for weeks ending Sunday, `"ME"` for month ends, `"QE"` for quarter ends, `"YE"` for year ends. pandas 2.2 renamed `"M"`, `"Q"` and `"Y"` to the `E` versions to make clear that the labels are period **ends**, and the old names now raise a deprecation warning. Periods are a different object and keep the short names: `to_period("M")` and `to_period("Q")` are correct, because a period stands for the whole month or quarter rather than its last day. The quarterly series is the one the head of growth is staring at: 80,523 dollars in Q3 2025, then 146,825 in Q4.

### resample versus to_period

You can also group by a period: `orders.groupby(orders["order_date"].dt.to_period("M"))["revenue"].sum()`. The result looks the same here, with labels like `2025-11` instead of `2025-11-30`. The difference shows when a period has no data: `resample` includes it with a sum of 0, while grouping skips it entirely. For charts and growth rates you want every period present, so `resample` is the safer default.

:::figure resample puts each timestamp into a fixed bucket and labels the bucket by its end
<svg viewBox="0 0 700 180" role="img" aria-labelledby="t1">
  <title id="t1">A timeline from October to December with order dots scattered along it. Vertical lines split it into three monthly buckets. Each bucket is labelled with its last day: 2025-10-31, 2025-11-30 and 2025-12-31, with the summed revenue under each label.</title>
  <path class="d-line" d="M30 70 L670 70"/>
  <path class="d-line" d="M30 45 L30 95"/>
  <path class="d-line" d="M243 45 L243 95"/>
  <path class="d-line" d="M457 45 L457 95"/>
  <path class="d-line" d="M670 45 L670 95"/>
  <circle class="d-dot" cx="60" cy="70" r="5"/><circle class="d-dot" cx="110" cy="70" r="5"/><circle class="d-dot" cx="190" cy="70" r="5"/>
  <circle class="d-dot" cx="260" cy="70" r="5"/><circle class="d-dot" cx="290" cy="70" r="5"/><circle class="d-dot" cx="320" cy="70" r="5"/><circle class="d-dot" cx="350" cy="70" r="5"/><circle class="d-dot" cx="380" cy="70" r="5"/><circle class="d-dot" cx="400" cy="70" r="5"/><circle class="d-dot" cx="420" cy="70" r="5"/><circle class="d-dot" cx="440" cy="70" r="5"/>
  <circle class="d-dot" cx="490" cy="70" r="5"/><circle class="d-dot" cx="540" cy="70" r="5"/><circle class="d-dot" cx="590" cy="70" r="5"/><circle class="d-dot" cx="630" cy="70" r="5"/>
  <text class="d-label-muted" x="136" y="35" text-anchor="middle">October</text>
  <text class="d-label-muted" x="350" y="35" text-anchor="middle">November</text>
  <text class="d-label-muted" x="563" y="35" text-anchor="middle">December</text>
  <text class="d-code" x="136" y="125" text-anchor="middle">2025-10-31</text>
  <text class="d-code" x="350" y="125" text-anchor="middle">2025-11-30</text>
  <text class="d-code" x="563" y="125" text-anchor="middle">2025-12-31</text>
  <text class="d-label" x="136" y="152" text-anchor="middle">30,339</text>
  <text class="d-label-strong" x="350" y="152" text-anchor="middle">75,334</text>
  <text class="d-label" x="563" y="152" text-anchor="middle">41,153</text>
</svg>
:::

## Comparing periods

Raw series answer "how much"; changes answer "how fast":

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
by_time = orders.set_index("order_date")

quarterly = by_time.resample("QE")["revenue"].sum()
print(pd.DataFrame({
    "revenue": quarterly.round(0),
    "vs_prev_quarter": quarterly.pct_change().round(3),
    "vs_year_ago": quarterly.pct_change(4).round(3),
}))
monthly = by_time.resample("ME")["revenue"].sum()
print(monthly.rolling(3).mean().tail(3).round(0))
```

`pct_change()` divides each value by the previous one and subtracts 1. Q4 2025 is up 82% on Q3, which is the jump everyone noticed. But `pct_change(4)` compares each quarter with the same quarter a year earlier, and that column tells a calmer story: Q4 2025 is up 180% on Q4 2024, while Q1, Q2 and Q3 grew by 200%, 145% and 165%. Q4 grew about as fast as the rest of the year. A large part of the "jump" is a seasonal pattern that was there in 2024 too: Q4 2024 was 73% above Q3 2024.

`rolling(3).mean()` averages each month with the two before it, which smooths out single spikes such as November. Use it to see a trend; use the raw series to see events.

:::mistake Comparing a partial period with full ones
Weekly bins end on Sunday, so `resample("W")` labels the last bin 2026-01-04 even though the data ends on 30 December 2025, and that "week" holds two days of orders. Partial first and last periods always look like a collapse or a slump. Check `series.index.min()` and `max()` against the data's real date range, and drop or flag partial periods before computing growth.
:::

## The dt accessor: calendar parts

For patterns within a period, such as days of the week or hours of the day, extract the part with `.dt` and group by it:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
orders = orders[orders["status"] != "cancelled"]
d = orders["order_date"]
print(orders.groupby(d.dt.day_name()).size().sort_values())
print(orders.groupby(d.dt.hour).size().head(4))
print(d.dt.to_period("Q").value_counts().sort_index().tail(2))
```

Orders are spread fairly evenly across the week, from 241 on Mondays to 298 on Tuesdays and Saturdays, so there is no strong weekday effect to explain. Other useful parts: `dt.year`, `dt.quarter`, `dt.month`, `dt.isocalendar().week`, `dt.date` and `dt.normalize()` (midnight of the same day, which you used in Lesson 3.4).

Daily resampling is where assumptions get tested. `by_time.resample("D").size()` gives one count per calendar day, 729 of them from the first order to the last, and two facts fall out at once: 119 days had no orders at all (in a series built with `groupby`, those days would simply be missing), and the busiest single day was 10 November 2025 with 16 orders, almost three weeks before Black Friday (28 November). The other top days, 6, 8 and 26 November, are spread across the month too. Whatever drove November, it was not one big promotional day; keep that in mind for the case study.

In the exercise you build the monthly series and the year-over-year view yourself. Next you rank and bin customers, turning a continuous measure like total spend into segments.
