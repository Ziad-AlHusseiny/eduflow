---
summary: Load a CSV into a DataFrame with read_csv and run a five-step inspection routine (shape, head, info, describe, value_counts) that catches problems before they reach your numbers.
takeaways:
  - "`pd.read_csv(\"file.csv\")` loads a table; `parse_dates=[...]` turns date columns into real datetimes as they load."
  - Run the same routine on every new file - `shape`, `head()`, `info()`, `describe()`, then `value_counts()` on the text columns.
  - "`info()` shows each column's dtype and non-null count, which reveals missing values and numbers stored as text."
  - An integer column that contains blanks loads as `float64`, because classic `NaN` is a float.
  - Check the facts you are about to rely on, such as an id being unique, with code like `orders["order_id"].is_unique`.
further:
  - title: pandas.read_csv
    url: https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html
  - title: pandas.DataFrame.info
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.info.html
  - title: pandas.Series.value_counts
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.value_counts.html
quiz:
  - q: "`info()` reports `coupon_code  388 non-null  object` for a table of 2,066 rows. What does that tell you?"
    options:
      - text: The column has 388 different coupon codes.
        why: Non-null count is about missing values, not distinct values. `nunique()` counts distinct values.
      - text: 388 rows failed to load and were dropped.
        why: "`read_csv` keeps every row; the other 1,678 rows are present with a missing coupon."
      - text: 1,678 orders have no coupon code, and the rest hold text.
        why: Correct. 2,066 minus 388 are missing, and `object` means the stored values are strings (or a mix).
      - text: The column should be converted to numbers.
        why: Coupon codes like `WELCOME10` are labels; `object` is the right dtype for them in pandas 2.
    answer: 2
  - q: "`describe()` shows `mean 300.47` for `customer_id`. How should you read that?"
    options:
      - text: The average customer placed about 300 orders.
        why: Nothing here counts orders per customer; this is arithmetic over id numbers.
      - text: It is meaningless; ids are labels that happen to be numbers, so their average says nothing.
        why: Correct. `describe()` summarises every numeric column, including ids. Read it only for columns where arithmetic makes sense.
      - text: Customer 300 is the most typical customer.
        why: An average of labels does not identify a typical anything. You would need a different question and a different calculation.
    answer: 1
  - q: "In `customers.csv`, `referred_by` holds customer ids but loads as `float64`. Why?"
    options:
      - text: Some ids in the file are written with decimals.
        why: The file holds whole numbers only. The type change comes from the blanks.
      - text: "`read_csv` always loads id columns as floats."
        why: "`customer_id` in the same file loads as `int64`. The difference is missing values."
      - text: The column has blanks, which load as `NaN`, and classic `NaN` only exists in float columns.
        why: Correct. 503 customers were not referred, so pandas uses `float64` to hold `NaN`. Lesson 3.1 shows the nullable `Int64` type that avoids this.
    answer: 2
---

The head of growth sends you `orders.csv` and asks for "a quick revenue number". The fastest way to give a wrong answer is to load the file and sum a column straight away. Every experienced analyst does the same thing first: look at the data. Not the whole thing, a few deliberate checks that take thirty seconds and catch most problems before they reach a slide.

## Step 1: load it, then check shape and head()

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
print(orders.shape)
print(orders.head().to_string())
```

`read_csv` reads the header row as column names, guesses each column's type, and returns a DataFrame. `head()` shows the first five rows (`head(10)` shows ten, `tail()` the last ones, `sample(5)` five at random, which is better at surfacing oddities than the first rows). `.to_string()` prints every column instead of hiding the middle ones behind `...`.

2,066 rows and 7 columns. Before going further, say out loud what you expect: one row per order, an order id, the customer, a date, a status, a channel, an optional coupon and a shipping fee. The checks below confirm or refute each expectation.

## Step 2: info() shows types and blanks

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
orders.info()
```

`info()` prints by itself, no `print()` needed. Read it column by column. `Non-Null Count` tells you how many rows have a value: `coupon_code` has 388 of 2,066, so most orders used no coupon. `Dtype` tells you what pandas made of each column: the ids are `int64`, the fee is `float64`, and everything else is `object`, meaning text.

That includes `order_date`. Stored as text, dates sort correctly only because this file happens to write them year first, and they cannot answer "which month?". Ask `read_csv` to parse them as they load:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
print(orders.dtypes)
print(orders["order_date"].min(), "to", orders["order_date"].max())
```

Now the column is `datetime64[ns]`, and `min()` and `max()` confirm the data runs from 2 January 2024 to 30 December 2025. Checking the date range of every new file is a habit worth forming: a missing month or a stray date in 1970 shows up immediately.

## Step 3: describe() summarises numbers

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
print(orders.describe().round(2))
```

`describe()` gives count, mean, standard deviation, minimum, quartiles and maximum for every numeric column. Shipping fees run from 0 to 9.99 with a median of 4.99: plausible. But it also dutifully reports a mean `customer_id` of 300.47, which means nothing. Ids are labels that happen to be numbers. Read `describe()` only for columns where arithmetic makes sense, and use it to spot impossible values: negative quantities, prices of zero, a maximum a hundred times the median.

## Step 4: value_counts() on the text columns

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
print(orders["status"].value_counts())
print(orders["coupon_code"].value_counts(dropna=False))
print(orders["channel"].value_counts(normalize=True).round(3))
```

`value_counts()` lists every distinct value with its count, most common first. It is how you find typos (`"Web"` next to `"web"`), unexpected categories, and how big each group is. `dropna=False` includes the missing values as their own row, and `normalize=True` gives shares instead of counts: 55% of orders came through the web.

Notice that 105 orders were cancelled. Whether revenue should include them is a business decision, not a coding one, and you will make it explicitly in Section 4. Inspection is where those decisions first become visible.

## Step 5: check what you are about to assume

Finally, turn your expectations into one-line checks:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
customers = pd.read_csv("customers.csv")
print(orders["order_id"].is_unique)            # one row per order?
print(orders["customer_id"].nunique(), "customers ordered")
print(len(customers), "customers in total")
print(customers["referred_by"].dtype)
```

The order id is unique, so one row really is one order. 515 of 600 customers have ordered at least once; the other 85 signed up and never bought, which matters later when you compute "revenue per customer". And `referred_by` loaded as `float64` even though it holds customer ids: most customers were not referred, the blanks became `NaN`, and in classic pandas `NaN` is a float, so the whole column became one.

:::mistake Trusting the first five rows
`head()` shows the tidiest part of many files, because exports are usually sorted by date or id. Problems such as blanks, odd spellings and outliers tend to live further down. Always follow `head()` with `info()` and `value_counts()`, which look at every row.
:::

:::why Why this matters
Inspection is not busywork. Each finding here (coupons mostly missing, cancelled orders present, ids stored as floats, 85 customers with no orders) changes how a later calculation must be written. Spotting them now costs thirty seconds; spotting them after a number has been presented costs credibility.
:::

In the exercise you run the routine on `customers.csv`. Next you learn to pull out exactly the rows and columns you need with `.loc` and `.iloc`.
