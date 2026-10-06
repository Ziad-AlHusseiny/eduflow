---
kind: wrapup
summary: Turn a one-off analysis into a reproducible one with parameters, functions, assertions, saved outputs and a clean top-to-bottom notebook, and see where to go after this course.
takeaways:
  - A reproducible analysis gives the same result when someone else runs it from the raw files, top to bottom, with no manual steps.
  - Put inputs and choices in named parameters at the top (file paths, the quarter, the revenue definition), so rerunning for a new period means changing one line.
  - Functions hold the steps you repeat; assertions state what the data must look like before results are trusted.
  - Use Restart and Run All before sharing a notebook, and save results with `to_csv(..., index=False)` instead of copying numbers by hand.
further:
  - title: pandas.DataFrame.to_csv
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_csv.html
  - title: Python Tutorial - Modules
    url: https://docs.python.org/3/tutorial/modules.html
  - title: pandas.DataFrame.pipe
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.pipe.html
quiz:
  - q: A notebook gives the right Q4 number on your laptop, but a colleague gets a different one from the same file. What is the most likely cause?
    options:
      - text: pandas gives slightly different answers on different computers.
        why: pandas is deterministic; the same code on the same data gives the same result, up to tiny float noise.
      - text: The notebook depends on cells run out of order or on a variable created in a cell that was later deleted.
        why: Correct. Hidden notebook state is the classic cause. Restart and Run All before sharing catches it.
      - text: The colleague's screen rounds numbers differently.
        why: Display rounding changes how a number looks, not which number is computed.
      - text: CSV files change when they are copied.
        why: Copying does not alter a file's contents; a different result comes from different code paths or different files.
    answer: 1
  - q: Next quarter you need the same report for 2026Q1. In a well-structured analysis, what should you have to change?
    options:
      - text: Every cell that mentions 2025Q4
        why: Hunting through cells for hard-coded values is exactly what parameters are meant to avoid, and you will miss one.
      - text: The cleaning functions
        why: Cleaning rules do not depend on the quarter; changing them for each report would make results incomparable.
      - text: One parameter at the top, such as `QUARTER = "2026Q1"`, and the input file path if it changed
        why: Correct. Everything downstream reads those names, so the whole analysis follows.
    answer: 2
  - q: What does an assertion like `assert df["order_id"].is_unique` add to a reproducible analysis?
    options:
      - text: It makes the analysis stop with a clear message when new data breaks an assumption the results depend on.
        why: Correct. Without it, a duplicated export would quietly inflate revenue in next quarter's report.
      - text: It removes duplicate order ids automatically.
        why: Assertions only check; cleaning is done by code such as `drop_duplicates()`.
      - text: It speeds up the groupby that follows.
        why: Assertions add a small amount of work; their value is safety, not speed.
    answer: 0
---

The Q4 answer is written. In three months the head of growth will ask the same question about Q1, and the person answering might be you, a colleague, or you having forgotten every detail. An analysis that only works in the notebook where it was born is a one-off. One that anyone can rerun from the raw files and get the same numbers is an asset. The difference is a handful of habits.

## The shape of a rerunnable analysis

```python run
import pandas as pd

# Parameters: everything that changes between runs lives here.
ORDERS_FILE = "orders.csv"
ITEMS_FILE = "order_items.csv"
QUARTER = "2025Q4"
EXCLUDE_STATUSES = ["cancelled"]

def load_orders(orders_file, items_file):
    """One row per order with revenue (after discounts, no shipping)."""
    items = pd.read_csv(items_file)
    orders = pd.read_csv(orders_file, parse_dates=["order_date"])
    items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
    revenue = items.groupby("order_id", as_index=False)["revenue"].sum()
    df = orders.merge(revenue, on="order_id", how="left", validate="one_to_one")
    assert df["order_id"].is_unique, "duplicate orders"
    assert df["revenue"].notna().all(), "orders without items"
    return df

def quarter_summary(df, quarter, exclude):
    kept = df[~df["status"].isin(exclude)]
    in_q = kept[kept["order_date"].dt.to_period("Q") == quarter]
    assert len(in_q) > 0, f"no orders in {quarter}"
    return {
        "quarter": quarter,
        "revenue": round(in_q["revenue"].sum(), 2),
        "orders": len(in_q),
        "customers": in_q["customer_id"].nunique(),
        "aov": round(in_q["revenue"].mean(), 2),
    }

df = load_orders(ORDERS_FILE, ITEMS_FILE)
summary = pd.DataFrame([quarter_summary(df, q, EXCLUDE_STATUSES) for q in ["2025Q3", QUARTER]])
print(summary)
print(f"pandas {pd.__version__}")
```

Four ideas carry it. **Parameters** at the top name every input and every decision, including the revenue definition, so next quarter's run changes one line. **Functions** hold the steps, take their inputs as arguments and return results, so they never depend on a variable left over from somewhere else. **Assertions** state what must be true of the data before anything is computed from it, as you did in Lesson 3.5. And the **version print** records which pandas produced the numbers, because defaults do change between major versions.

## Notebook hygiene

Notebooks are excellent for exploring and dangerous for reporting, because cells can run in any order and variables outlive the cells that made them. Before you share one:

- **Restart and Run All.** If it fails or the numbers change, the notebook depended on hidden state.
- **Read files, never edit them.** Keep raw exports untouched in a `data/raw` folder; cleaning happens in code, so it can be repeated.
- **Move reusable code out.** Once two notebooks need `clean_orders`, it belongs in a `.py` file you import.
- **Write outputs to files.** `summary.to_csv("q4_summary.csv", index=False)` produces the numbers the slide uses; copying from the screen invites typos.
- **Write the definition next to the number.** A short Markdown cell saying what "revenue" includes saves an argument later.

:::tip Chains that read like the recipe
`df.pipe(clean).pipe(add_revenue).pipe(summarise)` runs your functions in order, each receiving the previous result. It reads like the list of steps you would explain to a colleague, and each step can be tested on its own.
:::

## What you can do now

You started this course unable to write a line of Python. You can now load and inspect any CSV, clean real-world mess (blanks, typos, money as text, ambiguous dates, duplicates), join and reshape tables, summarise them by group and over time, describe distributions honestly, and turn all of it into an answer with evidence and caveats. That is the daily work of a data analyst.

Where to go next depends on the questions you want to answer. [SQL for Analysts](course:sql-for-analysts) uses the same Cartwheel data in a database, which is where most company data actually lives. The [Machine Learning Crash Course](course:ml-crash-course) picks up `churn.csv` and asks the next question: which customers are about to leave? Whichever you choose, keep the habits from this course: check before you trust, write the definition down, and make it rerunnable.
