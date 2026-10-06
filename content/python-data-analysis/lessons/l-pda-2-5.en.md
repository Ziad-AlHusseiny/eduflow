---
summary: Create calculated columns with vectorised arithmetic, build conditional columns with .loc and np.where, map codes to labels, and change values safely under pandas Copy-on-Write rules.
takeaways:
  - "`df[\"new\"] = expression` adds a column computed for every row at once; `assign()` does the same and returns a new DataFrame."
  - "Change existing values with one `.loc[row_mask, \"col\"] = value` call, never with chained brackets like `df[\"col\"][mask] = value`."
  - "`np.where(condition, a, b)` builds a two-way column; `.loc` assignments in sequence or `np.select` handle more categories."
  - "`map()` with a dictionary translates codes into labels, and values missing from the dictionary become `NaN`."
  - Under Copy-on-Write, every selection behaves like a copy, so the only way to change a DataFrame is to assign to it directly.
further:
  - title: Copy-on-Write (CoW)
    url: https://pandas.pydata.org/docs/user_guide/copy_on_write.html
  - title: pandas.DataFrame.assign
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.assign.html
  - title: numpy.where
    url: https://numpy.org/doc/stable/reference/generated/numpy.where.html
quiz:
  - q: You want to cap every discount above 0.2 at 0.2. Which line does it correctly in pandas 2 and 3?
    options:
      - text: "`items[\"discount\"][items[\"discount\"] > 0.2] = 0.2`"
        why: This is chained assignment. It selects a column first and then assigns into that intermediate object; under Copy-on-Write the original table never changes.
      - text: "`items[items[\"discount\"] > 0.2][\"discount\"] = 0.2`"
        why: Also chained. The filter creates a new table, the assignment changes that temporary table, and `items` is left as it was.
      - text: "`items.loc[items[\"discount\"] > 0.2, \"discount\"] = 0.2`"
        why: Correct. One `.loc` call names the rows and the column, so pandas assigns directly into `items`.
      - text: "`items[\"discount\"] == 0.2`"
        why: This compares and returns a boolean Series; `==` never assigns.
    answer: 2
  - q: "`orders[\"channel_label\"] = orders[\"channel\"].map({\"web\": \"Website\", \"mobile_app\": \"App\"})`. What happens to marketplace orders?"
    options:
      - text: They keep the value `"marketplace"`.
        why: "`map` replaces every value; anything not found in the dictionary does not pass through unchanged."
      - text: Their label becomes `NaN`.
        why: Correct. Values missing from the mapping dictionary become missing. Check `channel_label.isna().sum()` after every `map`.
      - text: pandas raises a `KeyError`.
        why: "`map` with a dictionary never raises for unknown values; it fills them with `NaN`, which is exactly why it is easy to miss."
    answer: 1
  - q: "What does `np.where(items[\"quantity\"] >= 3, \"bulk\", \"regular\")` produce?"
    options:
      - text: An array with `"bulk"` or `"regular"` for every row, which you can assign as a new column
        why: Correct. `np.where` picks from the second argument where the condition is true and from the third elsewhere, row by row.
      - text: The rows where quantity is at least 3
        why: Filtering is done with `items[mask]`. `np.where` with three arguments builds values, it does not drop rows.
      - text: A single string, depending on the first row
        why: It evaluates every row, returning one label per row.
    answer: 0
---

Cartwheel's `order_items` table has a quantity, a unit price and a discount on each of its 3,991 lines, but no revenue. Revenue is something you calculate, and how you calculate it has to be written down where everyone can see it. That is what a computed column does: it turns a business rule into one line of code applied to every row.

## Calculated columns

Assigning to a new column name creates it:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["gross"] = items["quantity"] * items["unit_price"]
items["revenue"] = items["gross"] * (1 - items["discount"])
items["discount_amount"] = items["gross"] - items["revenue"]
print(items.head().to_string())
print(round(items["revenue"].sum(), 2), round(items["discount_amount"].sum(), 2))
```

Each line works on whole columns, row by row, with no loop. The result: 471,940.08 dollars of revenue across all lines, after 11,658.52 dollars of discounts. (That total still includes cancelled orders; you will remove them in Section 4 once you can join `order_items` to `orders`.)

`assign()` does the same but returns a new DataFrame instead of changing the existing one, which lets you chain steps:

```python run
import pandas as pd

items = (
    pd.read_csv("order_items.csv")
    .assign(revenue=lambda d: d["quantity"] * d["unit_price"] * (1 - d["discount"]))
    .assign(is_discounted=lambda d: d["discount"] > 0)
)
print(items[["revenue", "is_discounted"]].head(3))
print(items["is_discounted"].sum(), "discounted lines")
```

`lambda d: ...` is a tiny unnamed function that receives the DataFrame at that point in the chain. You need it when a step uses a column created earlier in the same chain. Both styles are fine; plain assignment is easier to read when you are starting out, and chains shine in the cleaning function you will write in Lesson 3.5.

## Conditional columns

A two-way label is a job for NumPy's `where`, which pandas is built on:

```python run
import numpy as np
import pandas as pd

items = pd.read_csv("order_items.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
items["line_size"] = np.where(items["revenue"] >= 100, "large", "small")
print(items["line_size"].value_counts())
```

Read it as "where revenue is at least 100, `large`; elsewhere, `small`". For three or more categories, start with a default and overwrite subsets with `.loc`:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["discount_band"] = "none"
items.loc[items["discount"] > 0, "discount_band"] = "small"
items.loc[items["discount"] > 0.10, "discount_band"] = "big"
print(items["discount_band"].value_counts())
```

Order matters exactly as it did with `if`/`elif` in Lesson 1.4, but reversed: later assignments overwrite earlier ones, so go from the broadest condition to the narrowest. Discounts of 5% and 10% end up `small`; 15% and 25% end up `big`.

## Translating codes with map

Columns full of codes (`mobile_app`, ids, status flags) often need readable labels. `map()` with a dictionary translates each value:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
labels = {"web": "Website", "mobile_app": "Mobile app", "marketplace": "Marketplace"}
orders["channel_label"] = orders["channel"].map(labels)
print(orders["channel_label"].value_counts())
print(orders["channel_label"].isna().sum(), "unmapped")
```

Any value missing from the dictionary becomes `NaN`, silently. The last line is the check that catches it: zero unmapped values means every channel had a label.

## Fixing a column's type with astype

Sometimes the values are right but the type is not. `products.csv` stores `is_active` as 0 and 1, which pandas reads as integers. Summing works, but a reader of your code cannot tell a flag from a count, and filters read awkwardly. `astype()` converts a whole column:

```python run
import pandas as pd

products = pd.read_csv("products.csv")
products["is_active"] = products["is_active"].astype(bool)
print(products["is_active"].dtype, products["is_active"].sum(), "active products")
print(products.loc[~products["is_active"], "name"].tolist())
```

Three products are discontinued, and `~products["is_active"]` reads as "not active". Use `astype` when every value can be converted cleanly; Section 3 shows what to do when some cannot, such as totals with dollar signs.

## Changing values: the one rule

Here is the rule that saves you hours of confusion: **to change values in a DataFrame, assign to it in a single step**, with a new column or with `.loc[rows, column]`. Never select and then assign in two steps:

```python
# Wrong: chained assignment. Under Copy-on-Write this never updates items.
items["discount"][items["discount"] > 0.2] = 0.2

# Right: one .loc call names the rows and the column together.
items.loc[items["discount"] > 0.2, "discount"] = 0.2
```

The first form selects the `discount` column, which produces a new object, and then assigns into that object. Whether `items` itself changed used to depend on pandas internals, and pandas 2 prints a `ChainedAssignmentError` warning or a `SettingWithCopyWarning` when it spots the pattern. With **Copy-on-Write** (the default from pandas 3.0, available in pandas 2 through `pd.options.mode.copy_on_write = True`), the rule becomes simple and strict: every selection behaves like a copy, so chained assignment never updates the original. Write it the `.loc` way and your code behaves identically on every version.

:::mistake Editing a filtered table and expecting the original to change
`q4 = orders[in_q4]` followed by `q4["label"] = "Q4"` adds the column to `q4` only. That is correct behaviour, not a bug: a filtered table is its own table. On pandas 2 without Copy-on-Write (the version this course runs) the second line also prints a `SettingWithCopyWarning`, because pandas cannot tell which table you meant to change; `q4 = orders[in_q4].copy()` states that you want a separate table and silences it. If you meant to label rows inside `orders`, write `orders.loc[in_q4, "label"] = "Q4"`.
:::

:::tip Removing and renaming
`df.drop(columns=["gross"])` removes columns and `df.rename(columns={"unit_price": "price"})` renames them. Both return a new DataFrame, so assign the result: `items = items.drop(columns=["gross"])`. Forgetting that assignment is the most common reason a column you dropped seems to come back.
:::

That completes your pandas foundations: load, inspect, select, filter, sort and compute. Section 3 points these tools at the messy export, where blanks, typos, money strings and ambiguous dates are waiting.
