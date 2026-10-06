---
summary: Build pandas Series and DataFrames from Python lists and dictionaries, run calculations on whole columns at once, and predict how pandas lines values up by their index labels.
takeaways:
  - A Series is a column of values with an index of labels; a DataFrame is a table of Series that share one index.
  - Arithmetic on a Series applies to every value at once, so you write `prices * 1.05` instead of a loop.
  - "Operations between two Series line up by index label, not by position; labels present in only one side produce `NaN`."
  - "`df[\"col\"]` gives one column as a Series, and `df.shape`, `df.columns`, `df.index` and `df.dtypes` describe the table."
further:
  - title: Intro to data structures (Series and DataFrame)
    url: https://pandas.pydata.org/docs/user_guide/dsintro.html
  - title: pandas.DataFrame reference
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html
quiz:
  - q: |
      What is `growth["Oct"]`?
      ```python
      y2024 = pd.Series([9360, 29177], index=["Oct", "Nov"])
      y2025 = pd.Series([75334, 30339], index=["Nov", "Oct"])
      growth = y2025 - y2024
      ```
    options:
      - text: "`65,974`, the first value minus the first value"
        why: That is position-based thinking. pandas matches values by their labels, not their order.
      - text: "`20,979`, October 2025 minus October 2024"
        why: Correct. pandas aligns both Series on the index, so each month is subtracted from the same month, whatever order they were written in.
      - text: "`NaN`, because the indexes are in a different order"
        why: Order does not matter for alignment; only labels that appear on one side alone produce `NaN`.
    answer: 1
  - q: "`products` is a DataFrame with 48 rows and 7 columns. What does `products.shape` return?"
    options:
      - text: "`(7, 48)`"
        why: Shape is always rows first, then columns.
      - text: "`336`"
        why: That is `products.size`, the total number of cells.
      - text: "`(48, 7)`"
        why: Correct. `shape` is a tuple of (rows, columns), and it is the fastest sanity check after loading data.
      - text: "`48`"
        why: That is `len(products)`, which counts rows only.
    answer: 2
  - q: Which line raises every product's price by 5% without a loop?
    options:
      - text: "`products[\"unit_price\"] * 1.05`"
        why: Correct. Arithmetic on a Series applies to every value and returns a new Series of the same length.
      - text: "`[p * 1.05 for p in products]`"
        why: Looping over a DataFrame gives you its column names, not its rows, so this tries to multiply strings.
      - text: "`products * 1.05`"
        why: This multiplies every column, including names and ids, and fails on the text columns.
    answer: 0
  - q: In the last exercise of Section 1 you kept month names and revenues in two parallel lists. What problem does a Series fix?
    options:
      - text: Lists cannot hold more than 12 values.
        why: Lists can hold millions of values; size was never the issue.
      - text: Lists cannot store floats with decimals.
        why: Lists hold any type, floats included.
      - text: The labels travel with the values, so sorting or filtering can never mix up which revenue belongs to which month.
        why: Correct. With two lists, sorting one and not the other silently breaks the pairing. A Series keeps label and value together.
    answer: 2
---

In the last section's exercise, month names lived in one list and revenues in another, and you had to find the best month by its position and then look up the name in the other list. Sort one list and forget the other, and every month gets the wrong revenue without any error. pandas exists to make that kind of mistake hard: values carry their labels with them.

## Series: a column with labels

A **Series** is a one-dimensional array of values plus an **index**: one label per value.

```python run
import pandas as pd

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue = pd.Series(
    [16167, 14906, 18208, 18817, 17428, 13933,
     22968, 32042, 25514, 30339, 75334, 41153],
    index=months,
    name="revenue_2025",
)
print(revenue.head(3))
print(revenue["Nov"], revenue.idxmax(), revenue.sum())
```

`import pandas as pd` loads the library under its universal nickname; every pandas tutorial and Stack Overflow answer uses `pd`. `revenue["Nov"]` looks a value up by label, and `idxmax()` returns the **label** of the largest value, which is the whole parallel-lists dance from Section 1 in one call.

The last line of the printed Series reads `Name: revenue_2025, dtype: int64`. The **dtype** is the type of every value in the column: `int64` for whole numbers, `float64` for decimals, `object` (or `str` in pandas 3) for text, `bool`, and `datetime64` for dates. One column, one type; that rule is what makes pandas fast.

## Calculations on every value at once

Arithmetic and comparisons on a Series apply to each value and return a new Series with the same index. This is called **vectorised** code: you describe the operation on the whole column and pandas does the loop in fast compiled code.

```python run
import pandas as pd

revenue = pd.Series([30339, 75334, 41153], index=["Oct", "Nov", "Dec"])
print(revenue * 1.05)              # every month, 5% higher
print(revenue / revenue.sum())     # each month's share of Q4
print(revenue > 40000)             # a Series of True/False
```

The `True`/`False` Series on the last line looks like a curiosity now. In Lesson 2.4 it becomes the main way you filter rows.

## Alignment: pandas matches labels, not positions

When you combine two Series, pandas lines them up by index label before it calculates. Here is Q4 2025 against Q4 2024, with the months deliberately written in a different order and one month missing:

```python run
import pandas as pd

q4_2025 = pd.Series([30339, 75334, 41153], index=["Oct", "Nov", "Dec"])
q4_2024 = pd.Series([29177, 9360], index=["Nov", "Oct"])
print(q4_2025 - q4_2024)
```

October is subtracted from October and November from November, regardless of order. December exists only in 2025, so its result is `NaN` ("not a number"), pandas' marker for a missing value. Notice the result became `float64`: in classic NumPy-backed columns, `NaN` is a float, so an integer column that gains a missing value turns into floats.

:::figure Two Series combine by matching index labels
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">Left Series has Oct, Nov, Dec. Right Series has Nov and Oct in a different order. Arrows connect matching labels. The result has Oct and Nov computed, and Dec is NaN because it has no partner.</title>
  <text class="d-label-strong" x="70" y="26" text-anchor="middle">q4_2025</text>
  <rect class="d-box" x="20" y="40" width="100" height="40" rx="6"/>
  <text class="d-label" x="70" y="65" text-anchor="middle">Oct 30339</text>
  <rect class="d-box" x="20" y="90" width="100" height="40" rx="6"/>
  <text class="d-label" x="70" y="115" text-anchor="middle">Nov 75334</text>
  <rect class="d-box" x="20" y="140" width="100" height="40" rx="6"/>
  <text class="d-label" x="70" y="165" text-anchor="middle">Dec 41153</text>
  <text class="d-label-strong" x="300" y="26" text-anchor="middle">q4_2024</text>
  <rect class="d-box" x="250" y="40" width="100" height="40" rx="6"/>
  <text class="d-label" x="300" y="65" text-anchor="middle">Nov 29177</text>
  <rect class="d-box" x="250" y="90" width="100" height="40" rx="6"/>
  <text class="d-label" x="300" y="115" text-anchor="middle">Oct 9360</text>
  <path class="d-line d-dashed" d="M120 60 L250 110"/>
  <path class="d-line d-dashed" d="M120 110 L250 60"/>
  <path class="d-arrow" d="M370 110 L440 110" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="560" y="26" text-anchor="middle">difference</text>
  <rect class="d-box-success" x="490" y="40" width="140" height="40" rx="6"/>
  <text class="d-label" x="560" y="65" text-anchor="middle">Oct 20979</text>
  <rect class="d-box-success" x="490" y="90" width="140" height="40" rx="6"/>
  <text class="d-label" x="560" y="115" text-anchor="middle">Nov 46157</text>
  <rect class="d-box-warn" x="490" y="140" width="140" height="40" rx="6"/>
  <text class="d-label" x="560" y="165" text-anchor="middle">Dec NaN</text>
  <text class="d-label-muted" x="350" y="215" text-anchor="middle">labels are matched first; a label with no partner gives NaN</text>
</svg>
:::

:::mistake Expecting positional matching
If two Series have different indexes, say one labelled by month name and one by month number, every result is `NaN` and nothing errors. When a calculation suddenly returns a column of `NaN`, compare the two indexes with `print(a.index, b.index)` before anything else.
:::

## DataFrame: a table of Series

A **DataFrame** is several Series side by side, sharing one index. The easiest way to build a small one is the dictionary-of-lists shape you met in Lesson 1.3, one key per column:

```python run
import pandas as pd

products = pd.DataFrame({
    "name": ["Cast Iron Skillet 26cm", "Burr Coffee Grinder", "Standing Desk 140cm", "Cork Yoga Mat"],
    "unit_price": [39, 129, 449, 72],
    "unit_cost": [17.45, 76.99, 204.98, 41.52],
})
print(products)
print(products.shape)       # (rows, columns)
print(products.dtypes)
```

Three attributes describe any DataFrame, and you will print them constantly. `shape` is the (rows, columns) pair, `columns` lists the column names, and `index` holds the row labels. None of them has parentheses, because they are stored facts about the table rather than actions; `head()` and `sum()` do work, so they are called with parentheses. Mixing the two up gives either a method printed as `<bound method ...>` or a `TypeError: 'tuple' object is not callable`, both of which you can now recognise.

pandas gave the rows a default index, 0 to 3. Each column is a Series you can pull out with square brackets, and column arithmetic lines up row by row because the columns share that index:

```python run
import pandas as pd

products = pd.DataFrame({
    "name": ["Cast Iron Skillet 26cm", "Burr Coffee Grinder", "Standing Desk 140cm", "Cork Yoga Mat"],
    "unit_price": [39, 129, 449, 72],
    "unit_cost": [17.45, 76.99, 204.98, 41.52],
})
margin = products["unit_price"] - products["unit_cost"]
print(margin)
print(type(products["unit_price"]))
```

The skillet earns 21.55 dollars per unit and the standing desk 244.02. Four rows or four million, the code is the same, and that is the real promise of pandas: you think in columns, not in cells.

:::tip print(df) versus df
In a Jupyter notebook, writing `products` alone on the last line of a cell displays a formatted table. In scripts and in this course's Run blocks, nothing is shown unless you call `print()`. Both are the same object; only the display differs.
:::

Building tables by hand is for learning. Next you load Cartwheel's real CSV files and learn the inspection routine to run before you trust any of them.
