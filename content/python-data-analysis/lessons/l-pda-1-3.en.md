---
summary: Hold many values in lists, look records up by key in dictionaries, and see how a list of dictionaries is already a small table.
takeaways:
  - Lists are ordered and indexed from 0; `items[-1]` is the last item and `items[a:b]` stops before position `b`.
  - "`sum()`, `len()`, `max()`, `min()` and `sorted()` work on any list of numbers and answer most quick questions."
  - A dictionary maps keys to values; use `d[key]` when the key must exist and `d.get(key, default)` when it might not.
  - A list of dictionaries with the same keys is a table, one dictionary per row, which is exactly what a DataFrame generalises.
further:
  - title: Data Structures - More on Lists
    url: https://docs.python.org/3/tutorial/datastructures.html#more-on-lists
  - title: Data Structures - Dictionaries
    url: https://docs.python.org/3/tutorial/datastructures.html#dictionaries
  - title: Built-in Types - Mapping Types (dict)
    url: https://docs.python.org/3/library/stdtypes.html#mapping-types-dict
quiz:
  - q: |
      `monthly` holds 12 monthly totals, January first. Which expression is the total for April, May and June?
    options:
      - text: "`sum(monthly[4:6])`"
        why: Position 4 is May (January is 0), and the slice stops before 6, so this adds May and June only.
      - text: "`sum(monthly[3:6])`"
        why: Correct. April is position 3, and the slice includes 3, 4 and 5, stopping before 6.
      - text: "`sum(monthly[3:5])`"
        why: The stop position is excluded, so this covers April and May only.
      - text: "`sum(monthly[4:7])`"
        why: This starts at May. Counting from 1 instead of 0 is the classic off-by-one slip.
    answer: 1
  - q: "`prices = {\"Desk Mat XL\": 29}`. What does `prices.get(\"Monitor Arm\", 0)` return?"
    options:
      - text: A `KeyError`
        why: "`prices[\"Monitor Arm\"]` would raise `KeyError`. `.get()` exists precisely to avoid that."
      - text: "`None`"
        why: "`.get()` returns `None` only when you don't pass a default. Here the default is 0."
      - text: "`0`"
        why: Correct. The key is missing, so `.get()` returns the default you supplied.
    answer: 2
  - q: |
      What does this print?
      ```python
      totals = [65, 18, 33]
      backup = totals
      totals.append(35)
      print(len(backup))
      ```
    options:
      - text: "`4`"
        why: Correct. `backup = totals` does not copy the list; both names point at the same list, so the appended value shows up through either name.
      - text: "`3`"
        why: That would be true if `backup` were a copy, such as `totals.copy()`. Plain assignment never copies.
      - text: An error, because `backup` was never appended to
        why: There is only one list here, with two names attached to it. `len(backup)` works fine.
    answer: 0
  - q: You need the price of a product by name, thousands of times. Which structure fits best?
    options:
      - text: A list of prices, searched with a loop each time
        why: It works, but every lookup scans the whole list, and you need a separate list to know which price belongs to which name.
      - text: A dictionary with product names as keys and prices as values
        why: Correct. Dictionary lookup by key is direct and fast, and the name-to-price pairing is built in.
      - text: A string containing all names and prices separated by commas
        why: You would have to split and search the text every time; strings are for text, not for lookups.
    answer: 1
---

One variable per value stops working the moment you have twelve months of revenue, or forty-eight products. Python's two workhorse containers solve this: the **list**, for values in order, and the **dictionary**, for values you look up by name. Between them they cover almost every data shape you will meet before pandas takes over.

## Lists: values in order

Here is Cartwheel's 2025 revenue by month, in dollars, January first:

```python run
monthly_2025 = [16167, 14906, 18208, 18817, 17428, 13933,
                22968, 32042, 25514, 30339, 75334, 41153]

print(len(monthly_2025))   # 12 items
print(monthly_2025[0])     # January: positions start at 0
print(monthly_2025[-1])    # December: negative positions count from the end
print(sum(monthly_2025), max(monthly_2025), min(monthly_2025))
```

Positions (indexes) start at 0, so the twelfth month is at position 11. Asking for `monthly_2025[12]` raises `IndexError: list index out of range`.

### Slicing

A slice `items[start:stop]` takes a run of items. The start is included and the stop is **excluded**, which feels odd for a day and then becomes convenient: `[0:3]` is exactly three items.

```python run
monthly_2025 = [16167, 14906, 18208, 18817, 17428, 13933,
                22968, 32042, 25514, 30339, 75334, 41153]

q1 = monthly_2025[0:3]     # Jan, Feb, Mar
q4 = monthly_2025[-3:]     # last three: Oct, Nov, Dec
print(q1, sum(q1))
print(q4, sum(q4))
print(sorted(monthly_2025)[:3])   # the three weakest months
```

Q4 brought in 146,826 dollars against 49,281 in Q1: three times as much. That gap is the question this course will eventually answer, and a two-line slice was enough to see it.

:::mistake Counting from 1
April is `monthly_2025[3]`, not `[4]`. When a slice gives you a total that looks slightly off, check the boundaries first: `[3:6]` means positions 3, 4 and 5. Print the slice itself, not only its sum, until you trust it.
:::

### Changing a list

Lists are mutable: you can change them in place. `append()` adds to the end, and assignment to a position replaces an item.

```python run
months = ["Jan", "Feb", "Mar"]
months.append("Apr")
months[0] = "January"
print(months, "Mar" in months)
```

The `in` operator asks whether a value is present and returns `True` or `False`.

Because lists are mutable, two names can share one list. `backup = months` attaches a second name to the same list, so changing one changes "both". When you really need an independent copy, write `months.copy()`.

## Dictionaries: values you look up by key

A dictionary stores **key: value** pairs. Keys are usually strings; values can be anything.

```python run
product = {
    "product_id": 7,
    "name": "Burr Coffee Grinder",
    "unit_price": 129,
    "is_active": True,
}
print(product["name"])                 # look up by key
product["unit_price"] = 135.45         # update after the 5% price rise
product["category"] = "Coffee & Tea"   # add a new key
print(product)
print(product.get("launched_on", "unknown"))
```

`product["launched_on"]` would crash with `KeyError: 'launched_on'`. `.get()` returns a default instead. Use square brackets when a missing key is a bug you want to hear about, and `.get()` when missing is normal.

Three methods let you walk through a dictionary: `.keys()`, `.values()` and `.items()` (pairs). You will use `.items()` with loops in the next lesson.

## A list of dictionaries is a table

Put several dictionaries with the same keys into a list and you have rows and columns:

```python run
order_lines = [
    {"order_id": 1000, "product": "Foam Roller", "quantity": 2, "unit_price": 27.3},
    {"order_id": 1001, "product": "Solar Path Lights (6)", "quantity": 2, "unit_price": 44.1},
    {"order_id": 1001, "product": "Burr Coffee Grinder", "quantity": 2, "unit_price": 135.45},
]
print(len(order_lines), "rows")
print(order_lines[1]["product"])        # row 1, column "product"
```

`order_lines[1]["product"]` reads like a spreadsheet cell reference: row first, then column.

:::figure The same three order lines as a list of dictionaries and as a table
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">On the left, a list holds three dictionaries, each with keys order_id, product and quantity. On the right, the same data drawn as a table: each dictionary becomes a row and each key becomes a column header.</title>
  <text class="d-label-strong" x="20" y="28">list of dicts</text>
  <rect class="d-box" x="20" y="44" width="280" height="44" rx="8"/>
  <text class="d-code" x="32" y="71">{order_id: 1000, product: ..., qty: 2}</text>
  <rect class="d-box" x="20" y="98" width="280" height="44" rx="8"/>
  <text class="d-code" x="32" y="125">{order_id: 1001, product: ..., qty: 2}</text>
  <rect class="d-box" x="20" y="152" width="280" height="44" rx="8"/>
  <text class="d-code" x="32" y="179">{order_id: 1001, product: ..., qty: 2}</text>
  <path class="d-arrow" d="M310 120 L380 120" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="400" y="28">table (DataFrame)</text>
  <rect class="d-box-primary" x="400" y="44" width="280" height="36" rx="6"/>
  <text class="d-label-strong" x="420" y="67">order_id</text>
  <text class="d-label-strong" x="520" y="67">product</text>
  <text class="d-label-strong" x="620" y="67">qty</text>
  <rect class="d-box" x="400" y="86" width="280" height="34" rx="6"/>
  <text class="d-label" x="420" y="108">1000</text>
  <text class="d-label" x="520" y="108">Foam Roller</text>
  <text class="d-label" x="630" y="108">2</text>
  <rect class="d-box" x="400" y="126" width="280" height="34" rx="6"/>
  <text class="d-label" x="420" y="148">1001</text>
  <text class="d-label" x="520" y="148">Solar Lights</text>
  <text class="d-label" x="630" y="148">2</text>
  <rect class="d-box" x="400" y="166" width="280" height="34" rx="6"/>
  <text class="d-label" x="420" y="188">1001</text>
  <text class="d-label" x="520" y="188">Grinder</text>
  <text class="d-label" x="630" y="188">2</text>
  <text class="d-label-muted" x="350" y="232" text-anchor="middle">each dict is a row; each key is a column</text>
</svg>
:::

### The other table shape: a dictionary of lists

You can also store a table the other way round: one key per column, each holding a list of that column's values.

```python run
order_lines = {
    "order_id": [1000, 1001, 1001],
    "product": ["Foam Roller", "Solar Path Lights (6)", "Burr Coffee Grinder"],
    "quantity": [2, 2, 2],
}
print(order_lines["product"])      # a whole column at once
print(sum(order_lines["quantity"]))
```

Rows are easy to read in the list-of-dicts shape; columns are easy to total in the dict-of-lists shape. Both shapes show up in real life: APIs and JSON files usually hand you a list of records, while people building a small table by hand often write it column by column. pandas accepts both, and you will build your first DataFrame from a dictionary of lists in the next section.

This is the bridge to pandas. A DataFrame is a far more capable version of this table: it can sum a whole column at once, filter rows by a condition and read a CSV in one call. Learning lists and dictionaries first means you will understand what pandas is doing for you, and you will recognise the list-of-dicts shape when an API or a JSON file hands you data.

:::tip Which container?
Use a list when order matters and you reach items by position (monthly totals, a sequence of steps). Use a dictionary when you reach items by name (a product's price, a country's code). If you catch yourself searching a list for a name, you wanted a dictionary.
:::

In the exercise you slice the monthly list and update a price dictionary. Next, loops and conditions let you process every item without writing one line per item.
