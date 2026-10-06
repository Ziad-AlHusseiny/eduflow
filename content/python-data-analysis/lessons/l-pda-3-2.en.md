---
summary: Clean text columns with the .str accessor - trim spaces, standardise case, replace characters, split names and search for patterns - and verify the result against the values you expect.
takeaways:
  - The `.str` accessor applies a string method to every value in a column, and missing values stay missing instead of raising errors.
  - "`str.strip()` and a consistent case (`str.title()`, `str.lower()`) fix most spelling variants; check them with `nunique()` before and after."
  - "`str.replace(old, new)` treats `old` as plain text by default in pandas 2; pass `regex=True` only when you mean a pattern."
  - "`str.split(\" \", expand=True)` turns one text column into several, and `str.contains()` builds a boolean mask from a pattern."
  - Finish every text clean with a check against the list of values you expect, so a new spelling next month fails loudly.
further:
  - title: Working with text data
    url: https://pandas.pydata.org/docs/user_guide/text.html
  - title: pandas.Series.str.replace
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.str.replace.html
  - title: pandas.Series.str.split
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.str.split.html
quiz:
  - q: "`messy[\"country\"]` has 22 distinct values for 8 real countries. Which line is the fix you should write?"
    options:
      - text: "`messy[\"country\"].str.title()`"
        why: It happens to give 8 on this file, because its country variants differ only in case. But a value with a stray space in next month's export would stay distinct from its trimmed twin, so strip first, as you would for any column you group on.
      - text: "`messy[\"country\"].str.strip().str.title()`"
        why: Correct. Trimming removes invisible differences, and title case maps `EGYPT`, `egypt` and `Egypt` to the same value.
      - text: "`messy[\"country\"].unique()`"
        why: This lists the 22 variants; it does not change any of them.
      - text: "`messy[\"country\"].str.replace(\" \", \"\")`"
        why: This deletes the spaces inside names, turning `United Kingdom` into `UnitedKingdom`, and leaves the case variants untouched.
    answer: 1
  - q: "Why does `messy.product.str.contains(\"Coffee\")` raise `AttributeError: 'function' object has no attribute 'str'`?"
    options:
      - text: "`product` is the name of a DataFrame method, so dot access returns the method instead of the column."
        why: Correct. `DataFrame.product()` multiplies values, and it shadows the column. `messy["product"]` always reaches the column.
      - text: The column contains missing values.
        why: Missing values make `.str` methods return `NaN` for those rows; they do not cause an `AttributeError`.
      - text: "`contains` only works on columns that were loaded with `dtype=\"string\"`."
        why: "`.str.contains` works on ordinary text (object) columns too."
    answer: 0
  - q: "You clean the country column and then run `assert set(clean) <= set(EXPECTED)`. What is the assertion for?"
    options:
      - text: It speeds up later groupby operations.
        why: An assertion only checks a condition; it does not change data or performance.
      - text: It sorts the countries alphabetically.
        why: Sets have no order, and nothing is changed by the check.
      - text: It stops the script if any cleaned value is not one of the known countries, such as a new misspelling next month.
        why: Correct. A failing assertion is far better than a report with a ninth "country" quietly holding some of the revenue.
    answer: 2
---

Ask the messy export how many countries Cartwheel sells to, and it says 22. The real answer is eight. The other fourteen are the same countries typed as `UNITED KINGDOM`, `united kingdom` and so on. Group revenue by country now and the UK's sales are split across three rows, each one too small. Text cleaning is unglamorous, and it is the difference between a right and a wrong chart.

## The .str accessor

A Series of text has a `.str` attribute that exposes Python's string methods, applied to every value at once:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
print(messy["country"].nunique(), "spellings")
print(messy["country"].value_counts().tail(6))

clean = messy["country"].str.strip().str.title()
print(clean.nunique(), "countries")
print(sorted(clean.unique()))
```

Each `.str` call returns a new Series, so you chain them: strip the spaces, then normalise the case. 22 spellings become 8, which matches the eight countries Cartwheel actually sells to. Missing values pass through as missing instead of raising an error, which is the main advantage over writing a loop that calls `.strip()` on each value yourself. Counting distinct values before and after, as the first and third prints do, is the quickest proof that a clean did what you meant.

`title()` works here because every Cartwheel country is a name made of ordinary words. It would damage values like `USA` (to `Usa`) or `McDonald` (to `Mcdonald`). When a column has such values, use `str.lower()` for comparison or a mapping dictionary with `map()`, as in Lesson 2.5.

## Invisible spaces

Thirteen customer names in the export have spaces before or after them. They look identical in a table, so the only way to see them is to measure:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
padded = messy["customer"] != messy["customer"].str.strip()
print(padded.sum(), "padded names")
print(messy.loc[padded, "customer"].head(3).map(repr).tolist())
messy["customer"] = messy["customer"].str.strip()
```

`repr()` shows a string with its quotes, which makes the spaces visible: `'  Hassan Hughes '`. Untrimmed names break exactly the operations you rely on later: grouping, matching against another table, removing duplicates. Strip every text column you are going to group or join on, even if it looks clean. `str.strip()` removes more than ordinary spaces: tabs, line breaks and the non-breaking spaces that text copied from web pages and PDFs often carries are all whitespace to Python, so one call handles them all.

## Replace, split, search

The export writes the channel as `mobile app`, while Cartwheel's clean tables use `mobile_app`. Matching conventions now saves a failed join in Section 4:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
messy["channel"] = messy["channel"].str.replace(" ", "_")
print(messy["channel"].value_counts(dropna=False))

names = messy["customer"].str.strip().str.split(" ", expand=True)
names.columns = ["first_name", "last_name"]
print(names.head(3))

coffee = messy["product"].str.contains("coffee", case=False)
print(coffee.sum(), "coffee lines")
```

`str.split(" ", expand=True)` returns a DataFrame with one column per piece; without `expand`, you get a Series of lists, and `.str[0]` picks the first piece of each. `str.contains()` returns a boolean mask, ready for filtering as in Lesson 2.4, and `case=False` ignores capitals.

:::mistake Dot access on a column called product
`messy.product.str.contains("Coffee")` fails with `AttributeError: 'function' object has no attribute 'str'`, because `product` is also the name of a DataFrame method that multiplies values. This is the shadowing problem from Lesson 2.3 in the wild. Square brackets, `messy["product"]`, always reach the column.
:::

### Plain text or pattern?

`str.replace` and `str.contains` can also take **regular expressions**, a mini-language for text patterns. In pandas 2, `str.replace` treats the first argument as plain text unless you pass `regex=True`, and `str.contains` treats it as a pattern unless you pass `regex=False`. The difference bites with symbols that have special meaning in patterns, such as `$`, `.` and `(`. Lesson 3.3 shows the `$` case, which affects every money column you will ever clean.

## Prove the column is clean

Cleaning code that worked on this month's file may meet a new spelling next month. End with a check that states what clean means:

```python run
import pandas as pd

EXPECTED = {"Egypt", "United Arab Emirates", "Saudi Arabia", "Jordan",
            "United Kingdom", "Germany", "United States", "Canada"}

messy = pd.read_csv("orders_messy.csv")
messy["country"] = messy["country"].str.strip().str.title()
unexpected = set(messy["country"]) - EXPECTED
assert not unexpected, f"Unknown countries: {unexpected}"
print("country column OK:", messy["country"].nunique(), "values")
```

`assert condition, message` does nothing when the condition is true and stops the script with your message when it is false. Set subtraction lists any cleaned value that is not on the expected list, and the f-string puts them in the error so you know exactly what to fix.

:::tip The category dtype
A text column with a few repeated values, such as country or channel, can be stored as `astype("category")`. It uses less memory and records the allowed values. It is optional for a table of 168 rows; reach for it when a file has millions of rows, and pass `observed=True` when you group by it.
:::

In the exercise you clean all three text columns of the export. Next come the totals: numbers trapped inside strings like `$1,234.50`.
