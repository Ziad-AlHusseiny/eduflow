---
summary: Select columns with square brackets, then pick exact rows and columns with .loc (by label) and .iloc (by position), and know which one to use after sorting or filtering.
takeaways:
  - "`df[\"col\"]` returns one column as a Series; `df[[\"a\", \"b\"]]` (a list inside the brackets) returns a DataFrame."
  - "`.loc[rows, columns]` selects by label, and its slices include the end label."
  - "`.iloc[rows, columns]` selects by position, and its slices exclude the end, like Python lists."
  - After sorting, labels stay attached to their rows, so `.loc` still finds the same product while `.iloc[0]` finds whatever is now first.
  - Set a meaningful index such as `product_id` with `index_col=` or `set_index()` so `.loc` reads like a lookup.
further:
  - title: Indexing and selecting data
    url: https://pandas.pydata.org/docs/user_guide/indexing.html
  - title: pandas.DataFrame.loc
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.loc.html
  - title: pandas.DataFrame.iloc
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.iloc.html
quiz:
  - q: "`products` is indexed by `product_id` (1 to 48). How many rows does `products.loc[1:5]` return?"
    options:
      - text: "4"
        why: That would be a positional slice that excludes the end. `.loc` slices by label and includes it.
      - text: "6"
        why: Labels 1, 2, 3, 4 and 5 are five rows; nothing in this slice reaches a sixth.
      - text: An error, because 1:5 are positions
        why: With an integer index, `.loc` treats the numbers as labels, and these labels exist.
      - text: "5"
        why: Correct. `.loc` slices include both ends, so labels 1 through 5 come back.
    answer: 3
  - q: You sort `products` by price, highest first. Which expression returns the most expensive product's row?
    options:
      - text: "`by_price.loc[1]`"
        why: "`.loc[1]` is the row labelled 1, the Cast Iron Skillet, wherever it now sits."
      - text: "`by_price[0]`"
        why: Square brackets with a single value look for a column named 0, which raises `KeyError`.
      - text: "`by_price.iloc[1]`"
        why: Positions start at 0, so this is the second most expensive product.
      - text: "`by_price.iloc[0]`"
        why: Correct. After sorting, position 0 holds the most expensive product, whatever its label.
    answer: 3
  - q: What does `products[["name"]]` return, compared to `products["name"]`?
    options:
      - text: Exactly the same Series.
        why: The double brackets pass a list of columns, which always returns a DataFrame, even for one column.
      - text: A one-column DataFrame instead of a Series.
        why: Correct. A list inside the brackets means "these columns, as a table". Some functions need a DataFrame, others a Series, so the difference matters.
      - text: The column's name as a string.
        why: Both forms return data, not the label. `products.columns` lists the names.
    answer: 1
  - q: "Which line gets the unit price of product 7 in a single, unambiguous step?"
    options:
      - text: "`products.loc[7, \"unit_price\"]`"
        why: Correct. One `.loc` call with a row label and a column label selects exactly one value.
      - text: "`products.iloc[7, \"unit_price\"]`"
        why: "`.iloc` accepts positions only; a column name raises an error, and position 7 is product 8 anyway."
      - text: "`products[\"unit_price\"][7]`"
        why: It happens to work for reading, but it is two selection steps; the same pattern used for assignment is the chained assignment that breaks under Copy-on-Write.
    answer: 0
---

Cartwheel's product manager asks: "What do we charge for the coffee grinder, product 7?" and "Show me the five priciest products with their costs." Both are selection problems: out of a table, get exactly these rows and these columns. pandas gives you two precise tools for that, `.loc` and `.iloc`, and most beginner confusion comes from mixing them up. The rule is short: `.loc` uses **labels**, `.iloc` uses **positions**.

## Columns first

Square brackets on a DataFrame select columns:

```python run
import pandas as pd

products = pd.read_csv("products.csv", index_col="product_id")
print(products["name"].head(3))                    # one column: a Series
print(products[["name", "unit_price"]].head(3))    # a list of columns: a DataFrame
```

`index_col="product_id"` made the product id the row index instead of the default 0, 1, 2. That single choice makes everything below read naturally: product 7 is the row labelled 7. On an already-loaded DataFrame, `products.set_index("product_id")` does the same thing and returns a new DataFrame.

You will also see `products.unit_price` in tutorials. Dot access works for simple names, but it fails for names with spaces, and it quietly returns the wrong thing when a column shares its name with a DataFrame method: a column called `count` or `size` is shadowed by the method of the same name. Square brackets always work, so make them your default.

The double brackets are not a typo. The outer pair is the selection; the inner pair is a Python list of column names. One column in a list still gives a DataFrame.

## .loc: select by label

`.loc[rows, columns]` takes row labels first, then column labels:

```python run
import pandas as pd

products = pd.read_csv("products.csv", index_col="product_id")
print(products.loc[7, "unit_price"])                       # one value
print(products.loc[7])                                     # one row, as a Series
print(products.loc[[11, 21, 37], ["name", "unit_price"]])  # chosen rows and columns
print(products.loc[1:3, "name":"unit_price"])              # label slices
```

Lists pick exactly the labels you name, in that order. Slices take a range of labels, and here is the part to remember: **`.loc` slices include the end label**. `products.loc[1:3]` returns products 1, 2 and 3. The column slice `"name":"unit_price"` likewise includes `unit_price`. It makes sense once you think in labels: "from product 1 to product 3" includes product 3.

Ask for a label that does not exist, say `products.loc[99]`, and you get `KeyError: 99`. That is a feature: a wrong id should fail loudly, not return an empty result you might paste into a report. When a missing label is a normal possibility, test first with `99 in products.index`, which returns `True` or `False`.

`.loc` is also the one tool you use for **assigning** values, as you will see in Lesson 2.5: `products.loc[7, "unit_price"] = 135.45` changes exactly one cell.

## .iloc: select by position

`.iloc` ignores labels and counts positions from 0, with slices that exclude the end, exactly like Python lists:

```python run
import pandas as pd

products = pd.read_csv("products.csv", index_col="product_id")
print(products.iloc[0])            # first row, whatever its label
print(products.iloc[:3, :2])       # first three rows, first two columns
print(products.iloc[-1]["name"])   # last row's name
```

Use `.iloc` when position is what you mean: "the first five", "the last row", "every other row". Use `.loc` when identity is what you mean: "product 7", "the `unit_price` column".

:::figure .loc finds rows by label, .iloc by position
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">A table sorted by price with index labels 21, 22, 41, 1 in that order and positions 0 to 3. loc[1] points to the row labelled 1, which sits at position 3. iloc[0] points to the row at position 0, which is labelled 21.</title>
  <text class="d-label-muted" x="40" y="30" text-anchor="middle">position</text>
  <text class="d-label-muted" x="120" y="30" text-anchor="middle">label</text>
  <text class="d-label-strong" x="300" y="30" text-anchor="middle">name (sorted by price)</text>
  <rect class="d-box-accent" x="80" y="44" width="400" height="40" rx="6"/>
  <text class="d-label" x="40" y="69" text-anchor="middle">0</text>
  <text class="d-label-strong" x="120" y="69" text-anchor="middle">21</text>
  <text class="d-label" x="300" y="69" text-anchor="middle">Standing Desk 140cm</text>
  <rect class="d-box" x="80" y="92" width="400" height="40" rx="6"/>
  <text class="d-label" x="40" y="117" text-anchor="middle">1</text>
  <text class="d-label-strong" x="120" y="117" text-anchor="middle">22</text>
  <text class="d-label" x="300" y="117" text-anchor="middle">Ergonomic Task Chair</text>
  <rect class="d-box" x="80" y="140" width="400" height="40" rx="6"/>
  <text class="d-label" x="40" y="165" text-anchor="middle">2</text>
  <text class="d-label-strong" x="120" y="165" text-anchor="middle">41</text>
  <text class="d-label" x="300" y="165" text-anchor="middle">Adjustable Dumbbells</text>
  <rect class="d-box-primary" x="80" y="188" width="400" height="40" rx="6"/>
  <text class="d-label" x="40" y="213" text-anchor="middle">...</text>
  <text class="d-label-strong" x="120" y="213" text-anchor="middle">1</text>
  <text class="d-label" x="300" y="213" text-anchor="middle">Cast Iron Skillet 26cm</text>
  <text class="d-code" x="560" y="69">.iloc[0]</text>
  <path class="d-arrow" d="M555 64 L490 64" marker-end="url(#arrow)"/>
  <text class="d-code" x="560" y="213">.loc[1]</text>
  <path class="d-arrow" d="M555 208 L490 208" marker-end="url(#arrow)"/>
</svg>
:::

## Why the difference matters: sorting

Sort the products by price and the two tools part ways:

```python run
import pandas as pd

products = pd.read_csv("products.csv", index_col="product_id")
by_price = products.sort_values("unit_price", ascending=False)
print(by_price.iloc[:3][["name", "unit_price"]])   # the three priciest
print(by_price.loc[1, "name"])                     # still the skillet
```

Sorting moves rows but each row keeps its label. `by_price.iloc[0]` is now the Standing Desk, the most expensive item at 449 dollars; `by_price.loc[1]` is still the Cast Iron Skillet, wherever it ended up. Filtering behaves the same way: after you keep only some rows, labels have gaps (1, 4, 9...), and positions are renumbered 0, 1, 2. If you ever want fresh 0-to-n labels, `reset_index(drop=True)` gives them back.

:::mistake Using .loc with positions on a default index
On a freshly loaded table with the default 0-to-n index, labels and positions happen to be equal, so `.loc[0]` and `.iloc[0]` return the same row. Code written that way works until the first sort or filter, then silently grabs the wrong row. Decide which one you mean and say it with the right tool.
:::

:::tip One step, not two
Prefer `products.loc[7, "unit_price"]` over `products["unit_price"][7]`. Reading works either way, but the second form is two separate selections. The same two-step pattern used to **assign** a value is chained assignment, which pandas warns about and which stops working entirely under Copy-on-Write. Building the one-step habit now saves you from that in Lesson 2.5.
:::

In the exercise you answer the product manager's questions with `.loc` and `.iloc`. Next you select rows by a condition instead of by label: "all orders over 200 dollars", "all web orders in November".
