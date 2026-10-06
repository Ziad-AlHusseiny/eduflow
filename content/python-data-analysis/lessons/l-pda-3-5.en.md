---
summary: Find and remove duplicate rows with duplicated and drop_duplicates, then combine every cleaning step from this section into one function with assertions that you can rerun on next month's export.
takeaways:
  - "`df.duplicated()` flags exact repeats after their first appearance; `keep=False` flags every copy so you can inspect them side by side."
  - "`drop_duplicates(subset=[...])` deduplicates on key columns, but only use a key that is truly unique per row, never `order_id` in a table of order lines."
  - Clean text before looking for duplicates, because `"Ali Evans"` and `"Ali Evans "` are different strings.
  - A cleaning function turns a one-off notebook session into a repeatable step - same input, same output, every month.
  - End the function with `assert` statements that encode what clean means, so bad data stops the pipeline instead of reaching a report.
further:
  - title: pandas.DataFrame.drop_duplicates
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.drop_duplicates.html
  - title: pandas.DataFrame.duplicated
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.duplicated.html
  - title: The assert statement
    url: https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement
quiz:
  - q: "A table has two identical rows for order 1026. What does `df.duplicated().sum()` count for them?"
    options:
      - text: "2, one for each copy"
        why: With the default `keep="first"`, the first copy is not flagged; only repeats are.
      - text: "0, because the rows have different index labels"
        why: "`duplicated()` compares the column values, not the index."
      - text: "1, the second copy only"
        why: Correct. The first appearance is kept as the original, and each later identical row is flagged. Use `keep=False` to flag both.
    answer: 2
  - q: "Why is `items.drop_duplicates(subset=[\"order_id\"])` dangerous on `order_items`?"
    options:
      - text: An order with several products has several legitimate lines, and all but the first would be deleted.
        why: Correct. On Cartwheel's data that removes 1,925 real lines. Deduplicate on a key that identifies one row, such as `order_item_id`.
      - text: It raises an error because `order_id` is numeric.
        why: Any column type can be used as a subset key; the risk is silent data loss, not an error.
      - text: It changes the original table in place.
        why: "`drop_duplicates` returns a new DataFrame; the danger is in what that new table is missing."
    answer: 0
  - q: What is the main benefit of ending a cleaning function with `assert df["order_id"].is_unique`?
    options:
      - text: It removes any remaining duplicate ids.
        why: An assertion never changes data; it only checks a condition.
      - text: It makes the function run faster.
        why: The check adds a tiny amount of work. Its value is safety, not speed.
      - text: It stores the result so the next lesson can use it.
        why: Assertions do not save anything; the function's `return` hands back the data.
      - text: If a future export breaks the rule, the script stops with an error instead of producing a wrong report.
        why: Correct. The assertion turns an assumption into a tested fact every time the function runs.
    answer: 3
---

Nine rows in the messy export appear twice. Each duplicate is a real order counted again, so every total you have calculated from the export so far is too high: 23,500.67 dollars instead of 22,486.69, an overstatement of 4.5%. Duplicates come from re-run exports, copy-pasted rows and systems that retry a failed upload. They are the last problem in the file, and fixing them lets you turn this whole section into a single function.

## Finding duplicates

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
dupes = messy.duplicated()
print(dupes.sum(), "duplicate rows")

both_copies = messy[messy.duplicated(keep=False)].sort_values("order_id")
print(both_copies.head(4).to_string())
```

`duplicated()` returns a mask that is `True` for every row identical to an earlier one. The first appearance is not flagged (`keep="first"`), which is what you want for removal. For inspection, `keep=False` flags every copy, and sorting by the id puts each pair together. Look at them before deleting anything: rows 22 and 113 are the same order, same product, same total, almost a hundred rows apart. That pattern, identical rows far apart, is typical of an export that was appended to itself.

## Removing them

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
deduped = messy.drop_duplicates()
print(len(messy), "->", len(deduped))
print(deduped["order_id"].is_unique)
```

After dropping exact duplicates, every `order_id` appears once, which confirms that the duplicates were full copies and not two different versions of the same order. If `is_unique` had been `False`, you would have **conflicting** rows: the same id with, say, two different totals. Those need a decision, such as keeping the latest version, and `drop_duplicates(subset=["order_id"], keep="last")` implements it once you have made that decision.

:::mistake Deduplicating on the wrong key
In `order_items`, one order has one row per product, so `order_id` repeats legitimately. `items.drop_duplicates(subset=["order_id"])` would delete 1,925 real lines without any warning. Before choosing a subset, ask what one row represents; the key must identify exactly that. Here it is `order_item_id`.
:::

### Clean first, deduplicate second

Duplicate detection compares values exactly. `"Ali Evans"` and `"Ali Evans "` are different strings, and `$22.00` and `22.00` are different totals. In this export the copies happen to be byte-for-byte identical, but in general you strip text, standardise case and convert numbers **before** looking for duplicates, or near-identical copies survive.

## One function for the whole section

You now have five cleaning steps, written across five lessons. Scattered across a notebook, they are fragile: run a cell twice or skip one, and the result changes. Put them in one function, in the right order, with the checks at the end:

```python run
import pandas as pd

COUNTRIES = {"Egypt", "United Arab Emirates", "Saudi Arabia", "Jordan",
             "United Kingdom", "Germany", "United States", "Canada"}

def parse_money(values):
    cleaned = (values.astype("string").str.strip()
               .str.replace("$", "", regex=False).str.replace(",", "", regex=False))
    return pd.to_numeric(cleaned, errors="coerce")

def parse_dates(raw):
    iso = pd.to_datetime(raw, format="%Y-%m-%d", errors="coerce")
    dmy = pd.to_datetime(raw, format="%d/%m/%Y", errors="coerce")
    mdy = pd.to_datetime(raw, format="%m/%d/%Y", errors="coerce")
    ambiguous = dmy.notna() & mdy.notna() & (dmy != mdy)
    return iso.fillna(dmy).fillna(mdy), ambiguous

def clean_orders(path):
    """Load the messy export and return a clean, deduplicated DataFrame."""
    df = pd.read_csv(path)
    df["customer"] = df["customer"].str.strip()
    df["country"] = df["country"].str.strip().str.title()
    df["channel"] = df["channel"].str.strip().str.replace(" ", "_").fillna("unknown")
    df["quantity"] = df["quantity"].astype("Int64")
    df["total"] = parse_money(df["total"])
    df["order_date"], df["date_is_ambiguous"] = parse_dates(df["order_date"])
    df = df.drop_duplicates().reset_index(drop=True)

    assert df["order_id"].is_unique, "duplicate order ids remain"
    assert df["order_date"].notna().all(), "unparsed dates"
    assert df["total"].notna().all() and (df["total"] > 0).all(), "bad totals"
    assert set(df["country"]) <= COUNTRIES, f"unknown countries: {set(df['country']) - COUNTRIES}"
    return df

clean = clean_orders("orders_messy.csv")
print(clean.shape)
print(clean.dtypes)
print(round(clean["total"].sum(), 2), "total sales,", clean["date_is_ambiguous"].sum(), "ambiguous dates")
```

`df["order_date"], df["date_is_ambiguous"] = parse_dates(...)` unpacks the two values the helper returns into two columns at once. `reset_index(drop=True)` renumbers the rows 0 to 158 after the drop, so positions and labels agree again. Notice the dtypes too: `quantity` is `Int64` and `total` is `Float64`, both nullable, because `parse_money` converts through pandas' `string` type and `to_numeric` keeps the nullable family. They behave like ordinary numbers in every calculation you will do.

:::figure The cleaning pipeline: 168 messy rows in, 159 clean rows out
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">Raw export of 168 rows flows through five steps: strip and standardise text, retype quantity as Int64, parse money, parse dates and flag ambiguity, drop duplicates. Then assertions check the result, and 159 clean rows come out.</title>
  <rect class="d-box-warn" x="10" y="60" width="90" height="60" rx="10"/>
  <text class="d-label-strong" x="55" y="86" text-anchor="middle">raw</text>
  <text class="d-label" x="55" y="106" text-anchor="middle">168 rows</text>
  <rect class="d-box" x="120" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="160" y="95" text-anchor="middle">text</text>
  <rect class="d-box" x="215" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="255" y="95" text-anchor="middle">Int64</text>
  <rect class="d-box" x="310" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="350" y="95" text-anchor="middle">money</text>
  <rect class="d-box" x="405" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="445" y="95" text-anchor="middle">dates</text>
  <rect class="d-box" x="500" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="540" y="95" text-anchor="middle">dedupe</text>
  <rect class="d-box-success" x="600" y="60" width="90" height="60" rx="10"/>
  <text class="d-label-strong" x="645" y="86" text-anchor="middle">clean</text>
  <text class="d-label" x="645" y="106" text-anchor="middle">159 rows</text>
  <path class="d-arrow" d="M100 90 L118 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M200 90 L213 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M295 90 L308 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 90 L403 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M485 90 L498 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M580 90 L598 90" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="500" y="140" width="190" height="40" rx="10"/>
  <text class="d-label" x="595" y="165" text-anchor="middle">assertions guard the exit</text>
  <text class="d-label-muted" x="350" y="40" text-anchor="middle">clean_orders(path)</text>
</svg>
:::

The function reads its own file, so it never depends on what you happened to run earlier in a notebook. Same input, same output, every time. When next month's export arrives, `clean_orders("orders_messy_2026_01.csv")` runs the whole section in one line, and if the new file contains a ninth country spelling or a total in euros, an assertion stops it with a message naming the problem.

Where should the function live? While you are exploring, in the first cell of your notebook. Once a second notebook or a colleague needs it, move it to its own file, say `cleaning.py` next to your notebooks, and write `from cleaning import clean_orders` wherever you need it. One definition, imported everywhere, means a fix made once reaches every analysis that depends on it.

:::tip Assertions are documentation that runs
Each `assert` line says what "clean" means for this dataset, in a form a colleague can read and the computer can check. When you discover a new kind of problem, add a fix and an assertion together. Lesson 5.4 returns to this when you make a whole analysis reproducible.
:::

The export is clean: 159 orders, 22,486.69 dollars of sales, and 25 dates flagged as ambiguous (30 before the duplicates went). Section 4 moves from cleaning to answering, starting with the most used tool in pandas: `groupby`.
