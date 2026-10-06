---
summary: Convert money stored as text, such as "$1,234.50", into a numeric column by stripping symbols, converting with astype or to_numeric, and checking every value that failed to convert.
takeaways:
  - A numeric-looking column with dtype `object` is text, and `sum()` on it concatenates strings instead of adding numbers.
  - Remove currency symbols and thousands separators with `str.replace(..., regex=False)`, then convert with `astype(float)` or `pd.to_numeric`.
  - "In a regular expression `$` means \"end of text\", so `str.replace(\"$\", \"\", regex=True)` removes nothing."
  - "`pd.to_numeric(errors=\"coerce\")` turns unparseable values into `NaN`; always list the values that failed before moving on."
  - Wrap the cleaning in a function and sanity-check the result with `describe()`, the minimum and the maximum.
further:
  - title: pandas.to_numeric
    url: https://pandas.pydata.org/docs/reference/api/pandas.to_numeric.html
  - title: pandas.Series.astype
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.astype.html
  - title: Regular expression syntax (re module)
    url: https://docs.python.org/3/library/re.html#regular-expression-syntax
quiz:
  - q: "`messy[\"total\"]` has dtype `object`. What does `messy[\"total\"].sum()` return?"
    options:
      - text: The correct total as a float
        why: pandas adds text with `+`, which joins strings. You only get a numeric total after converting.
      - text: A `TypeError`
        why: "`+` is defined for strings, so pandas happily concatenates them with no error, which is what makes this trap dangerous."
      - text: "`NaN`, because some values contain `$`"
        why: Nothing is parsed, so there is no conversion failure to produce `NaN`.
      - text: One long string with every total glued together
        why: Correct. Strings concatenate under `+`, so the "sum" is text like `'$65.0018.0033.00...'`.
    answer: 3
  - q: Which line removes the dollar signs from `"$65.00"`-style values?
    options:
      - text: "`s.str.replace(\"$\", \"\", regex=False)`"
        why: Correct. With `regex=False` the `$` is matched as a literal character. (It is also the default for `str.replace` in pandas 2.)
      - text: "`s.str.replace(\"$\", \"\", regex=True)`"
        why: As a pattern, `$` matches the end of the string, an empty position, so nothing visible is removed.
      - text: "`s.str.strip(\"$\")` followed by `astype(int)`"
        why: Stripping `$` works for leading signs, but `astype(int)` fails on `"65.00"` because it has decimals.
    answer: 0
  - q: "`pd.to_numeric(cleaned, errors=\"coerce\")` returns 4 `NaN` values that were not missing before. What should you do next?"
    options:
      - text: Fill them with 0 so the totals add up.
        why: That hides four real sales. Find out what they were first.
      - text: Print the original strings for those rows and decide how to handle each format.
        why: Correct. Coercion is a way to find problems, not a way to make them disappear. Those rows may hold a euro sign or a European decimal comma your cleaner missed.
      - text: Drop those rows, since they are invalid.
        why: They are valid sales in a format you did not expect. Dropping them understates revenue.
      - text: Switch to `errors="ignore"` so the column stays unchanged.
        why: Then nothing is converted at all, and the option is deprecated in recent pandas versions.
    answer: 1
---

Ask the messy export for its total sales and you get something strange. No error, no number: a long string starting `'$65.0018.0033.00...'`. The `total` column looks numeric in a spreadsheet, but nearly half its values start with a dollar sign, so pandas stored the whole column as text, and adding text joins it. Money arriving as text is one of the most common problems in exported data, and it needs a deliberate, checked fix.

## Spot it: dtype object on a number column

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
print(messy["total"].dtype)
print(messy["total"].head(3).tolist())
print(repr(messy["total"].sum()[:40]))
print(messy["total"].str.startswith("$").sum(), "values start with $")
```

The inspection routine from Lesson 2.2 catches this immediately: `info()` would show `total` as `object` where you expected `float64`. Whenever a column that should hold numbers is `object`, at least one value contains something that is not a number. Here, 76 of 168 values start with `$`.

## Fix it: strip the symbols, then convert

Remove every character that is not part of the number, then convert the clean text:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
total = (
    messy["total"]
    .str.strip()
    .str.replace("$", "", regex=False)
    .str.replace(",", "", regex=False)
    .astype(float)
)
print(total.dtype, round(total.sum(), 2))
print(total.describe().round(2))
```

Wrapping a chain in parentheses lets you put one step per line, which is easier to read and to comment out while debugging. The thousands separator is removed too: this export happens to have no totals above 1,000 dollars, but the next one will, and `"1,234.50"` would break `astype(float)`.

`describe()` is the sanity check. Totals run from 18 to 942.90 dollars with a median of 72, which matches Cartwheel's catalogue: the cheapest product is a jump rope at 18 dollars, and the largest line is two standing desks. A minimum of 0 or a maximum of 94,290 would tell you a decimal point went missing.

The 23,500.67 sum is not a revenue figure yet: the export still contains nine duplicate rows. You will remove them in Lesson 3.5.

## The dollar sign trap

`str.replace` can also work with regular expressions, a pattern language in which some characters have special meanings. `$` is one of them: it means "the end of the text". Watch what happens when you ask for a pattern by accident:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
as_pattern = messy["total"].str.replace("$", "", regex=True)
print(as_pattern.head(1).tolist())   # still '$65.00'
try:
    pd.to_numeric(as_pattern)
except ValueError as error:
    print("ValueError:", error)
```

The pattern `$` matched the empty position at the end of each string and replaced it with nothing, so every dollar sign survived. In pandas 2, `str.replace` defaults to `regex=False`, but older tutorials and older pandas versions defaulted to patterns, and you will meet code written either way. Writing `regex=False` explicitly makes the intent clear to every reader and every version. If you do want a pattern, escape the special character or use a character class: `str.replace(r"[$,]", "", regex=True)` removes both symbols in one step.

## When some values will not convert

`astype(float)` is all or nothing: one bad value and the whole conversion fails. `pd.to_numeric` with `errors="coerce"` converts what it can and turns the rest into `NaN`. That is useful and dangerous in equal measure, so it always comes with a follow-up check:

```python run
import pandas as pd

raw = pd.Series(["$1,234.50", "18.00", "N/A", "€89.00", " $65.00 "])
cleaned = raw.str.strip().str.replace("$", "", regex=False).str.replace(",", "", regex=False)
amount = pd.to_numeric(cleaned, errors="coerce")
print(amount)

failed = amount.isna() & raw.notna()
print("Could not convert:", raw[failed].tolist())
```

The check lists exactly what failed: `N/A`, a genuinely missing value, and `€89.00`, a real sale in a currency your cleaner did not expect. Those need different treatment. The first stays missing; the second needs a conversion rule, or at least a conversation with whoever produced the file. Coercing without looking would have quietly dropped 89 euros of sales from every total.

:::mistake Coercing and moving on
`pd.to_numeric(col, errors="coerce")` followed by `.sum()` always "works". If a new export switches to European formatting, your cleaner turns `1.234,50` into 1.2345 and `65,00` into 6500, anything stranger becomes `NaN`, and revenue goes wrong without a single error. Count the new `NaN`s every time, `(amount.isna() & raw.notna()).sum()` should be a number you can explain, and check that the minimum and maximum still make sense.
:::

## Make it a function

You will clean money columns again, in this course and in your job. Put the logic where it can be reused and tested:

```python run
import pandas as pd

def parse_money(values):
    """Convert text like ' $1,234.50' to floats; unparseable values become NaN."""
    cleaned = (
        values.astype("string")
        .str.strip()
        .str.replace("$", "", regex=False)
        .str.replace(",", "", regex=False)
    )
    return pd.to_numeric(cleaned, errors="coerce")

messy = pd.read_csv("orders_messy.csv")
messy["total"] = parse_money(messy["total"])
print(messy["total"].dtype, messy["total"].isna().sum(), "unparsed")
```

`astype("string")` first makes the function safe on columns that pandas already read as numbers (when a file happens to have no `$` at all), because `.str` methods only work on text. Because the input is a `string` column, `to_numeric` returns the nullable `Float64` dtype from Lesson 3.1, with `<NA>` wherever a value failed. The function returns a new Series, and the caller decides where to store it, the same principle as returning rather than printing in Lesson 1.5.

:::why Why this matters
Revenue is the number people quote in meetings. When it is wrong because a dollar sign survived or a euro value vanished, nobody blames pandas; they stop trusting the analysis. Two lines of checking after every conversion are the cheapest insurance in data work.
:::

In the exercise you build the converter and use it on the export. Next comes the hardest column in the file: dates written three different ways.
