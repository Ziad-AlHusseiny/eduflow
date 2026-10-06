---
summary: Find missing values with isna, understand which text read_csv silently turns into NaN, and choose deliberately between recovering, labelling, dropping or keeping them with nullable dtypes.
takeaways:
  - "`read_csv` turns empty cells and strings like `N/A`, `NA` and `null` into missing values by default, so check the raw file when counts look surprising."
  - "`df.isna().sum()` counts blanks per column; `df[df.isna().any(axis=1)]` shows the rows that have any."
  - Every missing value needs a decision - recover it, label it, drop the row, or keep it missing - and filling with 0 is rarely right.
  - The nullable `Int64` dtype keeps whole numbers as integers and shows gaps as `<NA>`, instead of turning the column into floats.
  - Sums, means and counts skip missing values by default, so `count()` and `len()` differ exactly by the number of gaps.
further:
  - title: Working with missing data
    url: https://pandas.pydata.org/docs/user_guide/missing_data.html
  - title: Nullable integer data type
    url: https://pandas.pydata.org/docs/user_guide/integer_na.html
  - title: pandas.DataFrame.fillna
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.fillna.html
quiz:
  - q: The messy export has 9 blank quantities. A colleague runs `fillna(0)` on the column before computing the average quantity per order. What happens?
    options:
      - text: The average is unchanged, because zeros do not affect a mean.
        why: Zeros count as real values, so they enlarge the denominator and pull the mean down (here from about 1.43 to 1.36).
      - text: The average is still correct, because pandas ignores zeros.
        why: pandas ignores missing values in `mean()`, not zeros. Filling turned "unknown" into "zero", which is a claim about the data.
      - text: pandas raises an error because the column is now mixed.
        why: Filling with 0 keeps the column numeric; there is no error, which is exactly why the mistake goes unnoticed.
      - text: The average drops, because 9 unknown quantities are now counted as orders of zero items.
        why: Correct. Every order has at least one item, so 0 is not a plausible value. Leaving the gaps as missing gives the honest average of the known quantities.
    answer: 3
  - q: "The raw CSV has the text `N/A` in the channel column for 7 rows. After `pd.read_csv`, what does `value_counts()` show for it?"
    options:
      - text: "A row `N/A` with count 7"
        why: "`N/A` is on pandas' default list of missing-value markers, so it is converted to `NaN` and dropped from `value_counts()`."
      - text: Nothing; the 7 rows are missing values and are excluded unless you pass `dropna=False`
        why: Correct. Pass `dropna=False` to see them, or `keep_default_na=False` when loading if `N/A` should stay a real category.
      - text: An error, because `N/A` is not a valid channel
        why: "`read_csv` does not validate categories; it either keeps text or converts known missing markers."
    answer: 1
  - q: "`q = messy[\"quantity\"].astype(\"Int64\")`. What do `q.count()` and `len(q)` return for 168 rows with 9 gaps?"
    options:
      - text: "`159` and `168`"
        why: Correct. `count()` counts non-missing values; `len()` counts rows, gaps included.
      - text: "`168` and `168`"
        why: "`count()` never counts missing values, whatever the dtype."
      - text: "`159` and `159`"
        why: Missing values are still rows; `len()` includes them.
    answer: 0
---

Open `orders_messy.csv` in a spreadsheet and the gaps are easy to miss: an empty quantity cell here, `N/A` in the channel column there. Load it into pandas and those gaps become `NaN`, which then flows silently through your calculations: sums skip it, means ignore it, and a `fillna(0)` written in a hurry turns "we don't know" into "nothing was sold". Missing values are not a technical nuisance to clear away; each one is a question about the business.

## Finding the gaps

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
print(messy.shape)
print(messy.isna().sum())
print(messy[messy.isna().any(axis=1)].head().to_string())
```

`isna()` returns a DataFrame of booleans, and summing it counts the gaps per column: 9 quantities and 7 channels. `isna().any(axis=1)` asks, per row, whether any column is missing (`axis=1` means "across the columns"), which lets you look at the actual damaged rows. Looking at them matters: the 9 missing quantities belong to ordinary orders across both years, not to one broken day.

## What read_csv decided for you

The raw file has no empty channel cells. It has the text `N/A`, and pandas converted it to `NaN` because `N/A` is on its default list of missing markers, along with an empty cell, `NA`, `NaN`, `null`, `None` and a few others. Usually that is helpful. Sometimes it is wrong: a column of country codes would lose Namibia, whose ISO code is `NA`. Load the file without the conversion to see what is really there:

```python run
import pandas as pd

raw = pd.read_csv("orders_messy.csv", keep_default_na=False)
print(raw["channel"].value_counts())
print((raw["quantity"] == "").sum(), "empty quantity cells")
```

Now `N/A` shows up as a real value with a count of 7, and the quantity column is all text, because the empty cells stayed empty strings. To control the list precisely, pass `na_values=["N/A", ""]` together with `keep_default_na=False`.

## Deciding what to do

There is no universal fix. Ask three questions, in this order, and keep the value missing if every answer is no:

:::figure Three questions for every missing value
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">A decision path. First: can the value be recovered from another source? If yes, recover it. Second: does missing carry meaning, such as no coupon? If yes, label it. Third: is the row useless without it for this analysis? If yes, drop it for that analysis. Otherwise keep it as missing.</title>
  <rect class="d-box" x="10" y="20" width="150" height="60" rx="10"/>
  <text class="d-label" x="85" y="45" text-anchor="middle">Recoverable from</text>
  <text class="d-label" x="85" y="65" text-anchor="middle">another source?</text>
  <rect class="d-box" x="185" y="20" width="150" height="60" rx="10"/>
  <text class="d-label" x="260" y="45" text-anchor="middle">Does "missing"</text>
  <text class="d-label" x="260" y="65" text-anchor="middle">mean something?</text>
  <rect class="d-box" x="360" y="20" width="150" height="60" rx="10"/>
  <text class="d-label" x="435" y="45" text-anchor="middle">Row useless</text>
  <text class="d-label" x="435" y="65" text-anchor="middle">without it?</text>
  <rect class="d-box-primary" x="535" y="20" width="150" height="60" rx="10"/>
  <text class="d-label-strong" x="610" y="55" text-anchor="middle">Keep as NA</text>
  <path class="d-arrow" d="M160 50 L183 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M335 50 L358 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M510 50 L533 50" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="171" y="40" text-anchor="middle">no</text>
  <text class="d-label-muted" x="346" y="40" text-anchor="middle">no</text>
  <text class="d-label-muted" x="521" y="40" text-anchor="middle">no</text>
  <path class="d-arrow" d="M85 80 L85 140" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M260 80 L260 140" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M435 80 L435 140" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="100" y="115">yes</text>
  <text class="d-label-muted" x="275" y="115">yes</text>
  <text class="d-label-muted" x="450" y="115">yes</text>
  <rect class="d-box-success" x="10" y="144" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="85" y="174" text-anchor="middle">Recover it</text>
  <rect class="d-box-accent" x="185" y="144" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="260" y="174" text-anchor="middle">Label it</text>
  <rect class="d-box-warn" x="360" y="144" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="435" y="174" text-anchor="middle">Drop (for now)</text>
  <text class="d-label-muted" x="85" y="220" text-anchor="middle">join a clean table</text>
  <text class="d-label-muted" x="260" y="220" text-anchor="middle">fillna("unknown")</text>
  <text class="d-label-muted" x="435" y="220" text-anchor="middle">dropna(subset=...)</text>
</svg>
:::

Recovery comes first because it is the only option that adds information. The export's order ids also exist in Cartwheel's clean `orders` and `order_items` tables, so the missing quantities could be looked up there; you will learn the join that does it in Lesson 4.2. Until you can recover a value, do not invent one.

Applied to the export: the missing **channel** cannot be guessed from anything else in the row, but "we don't know the channel" is still a fact worth keeping visible, so it gets an explicit label. A blank **coupon code** in the clean `orders` table is different again: there, missing means "no coupon used", which is a real answer.

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
messy["channel"] = messy["channel"].fillna("unknown")
print(messy["channel"].value_counts())
print(len(messy.dropna(subset=["quantity"])), "rows with a known quantity")
```

`dropna(subset=["quantity"])` removes only the rows missing a quantity, and only in the result you store; plain `dropna()` with no subset removes a row if **any** column is missing, which on the raw export would throw away 16 rows, including perfectly good totals. Drop for a specific analysis, not from your master copy.

:::mistake Filling with zero to make the gaps go away
A blank quantity is not zero: every order has at least one item. `fillna(0)` drops the average quantity from 1.43 to 1.36 and makes nine real orders look empty. Fill only with a value you can defend in a sentence to your manager.
:::

One more trap: you cannot find gaps with `==`. `NaN` is not equal to anything, not even itself, so `messy["channel"] == np.nan` is `False` on every row. Always use `isna()` and `notna()`.

## Nullable types: integers that can be missing

The quantity column loaded as `float64`, so quantities print as `1.0` and `2.0`. That is the same effect you saw with `referred_by` in Lesson 2.2: classic `NaN` is a float. pandas also has **nullable** dtypes, written with a capital letter, which store a separate missing marker, `pd.NA`:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
qty = messy["quantity"].astype("Int64")
print(qty.dtype, qty.iloc[32:35].tolist())
print(qty.sum(), qty.count(), len(qty))
print(round(qty.mean(), 2))
```

`Int64` keeps whole numbers as integers and shows gaps as `<NA>`. Aggregations skip missing values by default, so `sum()` adds the 159 known quantities, and `count()` versus `len()` tells you exactly how many are missing. The same family includes `Float64`, `boolean` and `string`, and `pd.read_csv(..., dtype_backend="numpy_nullable")` loads every column that way. One behaviour to know: comparisons with `pd.NA` return `<NA>` rather than `False`, because "is an unknown quantity equal to 1?" honestly has no answer.

In the exercise you count, label and retype the gaps. Next you clean the text columns, where the country names come in four different spellings.
