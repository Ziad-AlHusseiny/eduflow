---
summary: Process every row of a dataset with for loops, make decisions with if, elif and else, count with dictionaries, and write the same logic compactly as comprehensions.
takeaways:
  - A `for` loop runs its indented body once per item; create accumulators such as `total = 0` before the loop, not inside it.
  - "`if` / `elif` / `else` checks conditions top to bottom and runs only the first branch that is true."
  - "`counts[key] = counts.get(key, 0) + 1` is the standard pattern for counting or summing by group with a dictionary."
  - A list comprehension `[expr for x in items if condition]` builds a new list in one readable line.
  - In pandas you rarely write loops, because column operations do the looping for you; loops are still how you reason about what those operations do.
further:
  - title: More Control Flow Tools (if, for, range)
    url: https://docs.python.org/3/tutorial/controlflow.html
  - title: List Comprehensions
    url: https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions
quiz:
  - q: |
      What does this print?
      ```python
      totals = [65, 18, 33]
      for t in totals:
          running = 0
          running += t
      print(running)
      ```
    options:
      - text: "`116`"
        why: That needs `running = 0` before the loop. Here it is reset on every pass.
      - text: "`33`"
        why: Correct. The accumulator is reset to 0 at the start of every pass, so only the last value survives.
      - text: "`0`"
        why: The reset happens before the addition in each pass, so the final pass still adds 33.
      - text: A `NameError`
        why: "`running` is created inside the loop on the first pass, so it exists when `print` runs."
    answer: 1
  - q: 'An order total of 150 goes through `if t < 50: "small"`, `elif t < 150: "medium"`, `else: "large"`. Which label does it get?'
    options:
      - text: "`\"medium\"`"
        why: "`150 < 150` is `False`, so the `elif` branch does not run."
      - text: "`\"large\"`"
        why: Correct. Both conditions are false for 150, so the `else` branch runs.
      - text: Both `"medium"` and `"large"`
        why: An `if`/`elif`/`else` chain runs at most one branch, the first whose condition is true.
    answer: 1
  - q: Which comprehension keeps only web orders' totals from a list of order dictionaries?
    options:
      - text: "`[o[\"total\"] for o in orders if o[\"channel\"] == \"web\"]`"
        why: Correct. The expression before `for` is what goes into the new list; the `if` at the end filters which items get there.
      - text: "`[o for o in orders if o[\"channel\"] == \"web\"][\"total\"]`"
        why: This builds a list of dictionaries and then indexes the list with a string, which raises `TypeError`.
      - text: "`[o[\"total\"] if o[\"channel\"] == \"web\" for o in orders]`"
        why: A trailing filter goes after the `for`. An `if` before the `for` must have an `else`, so this is a syntax error.
    answer: 0
---

Six rows from Cartwheel's messy export sit in a list of dictionaries. You want their total value, how much came through each sales channel, and which orders were large. Writing one line per row would work for six rows and collapse at six thousand. A loop writes the logic once and Python repeats it for every row.

## The for loop

```python run
orders = [
    {"order_id": 2574, "total": 65.0, "channel": "mobile app"},
    {"order_id": 2069, "total": 18.0, "channel": "mobile app"},
    {"order_id": 1200, "total": 33.0, "channel": "mobile app"},
    {"order_id": 1809, "total": 35.0, "channel": "web"},
    {"order_id": 1434, "total": 72.0, "channel": None},
    {"order_id": 2089, "total": 58.0, "channel": "marketplace"},
]

grand_total = 0
for order in orders:
    grand_total += order["total"]
print(grand_total)
```

Read it as "for each order in orders, run the indented lines". On each pass, the name `order` points at the next dictionary. `grand_total += order["total"]` is short for `grand_total = grand_total + order["total"]`.

Indentation is not decoration in Python: the indented lines (four spaces, by convention) are the loop's body, and the first line back at the left margin runs after the loop finishes. That is why `print` sits outside: you want one result, not six.

:::mistake Resetting the accumulator inside the loop
If `grand_total = 0` moves inside the loop, it is wiped on every pass and you get only the last order's total. No error, wrong answer. Accumulators (totals, counters, empty lists you will append to) are always created **before** the loop.
:::

## Making decisions with if, elif, else

Conditions let each row take a different path. Cartwheel's operations team labels orders by size:

```python run
totals = [65.0, 18.0, 33.0, 35.0, 72.0, 58.0, 329.0]

for t in totals:
    if t < 50:
        size = "small"
    elif t < 150:
        size = "medium"
    else:
        size = "large"
    print(t, size)
```

Python tests the conditions from top to bottom and runs only the first branch that is true. Order matters: if the 150 test came first, every small order would be labelled medium too, because 18 is also below 150. Put the narrowest condition first, or make the conditions non-overlapping.

You can combine conditions with `and`, `or` and `not`. Python also lets you chain comparisons the way you would write them in maths, which is handy for ranges:

```python run
t = 89.0
channel = "web"
print(t >= 50 and channel == "web")   # both must be true
print(50 <= t < 150)                  # chained: at least 50 and below 150
print(not channel == "marketplace")   # flips True and False
```

When you also need each item's position, for a ranked list or a "row 3 is broken" message, wrap the list in `enumerate()`, which hands you the position and the item together: `for position, t in enumerate(totals, start=1):`. Prefer it to counting positions by hand with a separate variable.

## Counting and summing by group

The single most useful loop pattern in analysis is "per category, add something up". A dictionary holds one running total per key:

```python run
orders = [
    {"order_id": 2574, "total": 65.0, "channel": "mobile app"},
    {"order_id": 2069, "total": 18.0, "channel": "mobile app"},
    {"order_id": 1200, "total": 33.0, "channel": "mobile app"},
    {"order_id": 1809, "total": 35.0, "channel": "web"},
    {"order_id": 1434, "total": 72.0, "channel": None},
    {"order_id": 2089, "total": 58.0, "channel": "marketplace"},
]

revenue_by_channel = {}
for order in orders:
    channel = order["channel"] or "unknown"
    revenue_by_channel[channel] = revenue_by_channel.get(channel, 0) + order["total"]

for channel, revenue in revenue_by_channel.items():
    print(channel, revenue)
```

Two details carry this. `revenue_by_channel.get(channel, 0)` returns the running total so far, or 0 the first time a channel appears. And `order["channel"] or "unknown"` replaces `None` with a readable label, because `None` counts as false and `or` returns the right-hand side when the left is false.

This is a hand-written `groupby`. In Lesson 4.1 pandas does it in one line, and now you know what that line does underneath: walk the rows, find each row's group, update that group's total.

## Comprehensions: building lists in one line

Very often a loop exists only to build a new list. A **list comprehension** says that directly:

```python run
totals = [65.0, 18.0, 33.0, 35.0, 72.0, 58.0, 329.0]

with_rise = [round(t * 1.05, 2) for t in totals]
large = [t for t in totals if t >= 60]
print(with_rise)
print(large, len(large))
```

Read `[t for t in totals if t >= 60]` as "t, for each t in totals, if t is at least 60". The part before `for` is what goes in; the `if` at the end filters. A dictionary comprehension works the same way with a `key: value` pair:

```python run
countries = ["Canada", "united kingdom", "UNITED KINGDOM", "Saudi Arabia"]
clean = [c.strip().title() for c in countries]
print(clean)
print(sorted(set(clean)))            # unique values, sorted
print({c: len(c) for c in set(clean)})
```

A `set` keeps only unique values, so `set(clean)` collapses the two spellings of the UK into one once they are cleaned. You will do the same fix on a whole column with pandas in Lesson 3.2.

:::tip When to stop compressing
A comprehension is great while it fits on one line and reads like a sentence. If you need nested conditions or several steps per item, write a normal loop: clearer code beats shorter code, and future you has to debug it.
:::

## Loops versus pandas

In pandas you will almost never loop over rows. `orders["total"].sum()` does the summing loop, and `orders.groupby("channel")["total"].sum()` does the dictionary pattern above, both in fast compiled code. So why learn loops? Because they are how you check your understanding of what a pandas operation does, and because plenty of real work (looping over files, over months, over a list of countries to build a report) is still a loop around pandas code.

In the exercise you summarise twelve rows by country. Then you package logic like this into reusable functions and learn to read the errors Python shows you.
