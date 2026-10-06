---
kind: intro
summary: Understand what Python and pandas add to spreadsheet work, meet the Cartwheel data you will analyse, and run your first lines of Python in the browser.
takeaways:
  - Python analysis is a script you can rerun, so next month's report takes seconds instead of an afternoon.
  - pandas is the Python library for tables; a DataFrame is its version of a spreadsheet sheet.
  - Every analysis in this course follows the same loop - question, load, inspect, clean, analyse, answer.
  - Code blocks with a Run button execute real Python 3.13 in your browser, with the Cartwheel CSV files available.
further:
  - title: The Python Tutorial
    url: https://docs.python.org/3/tutorial/index.html
  - title: pandas - 10 minutes to pandas
    url: https://pandas.pydata.org/docs/user_guide/10min.html
quiz:
  - q: Your manager asks for the same sales breakdown on the first Monday of every month. What is the main advantage of doing it in Python rather than by hand in a spreadsheet?
    options:
      - text: Python can open files that are too big for any spreadsheet.
        why: Sometimes true, but Cartwheel's files open fine in a spreadsheet. Size is not the main gain for a recurring report.
      - text: The steps are written down as code, so you rerun them on new data and get the same treatment every time.
        why: Correct. A script is a recipe; rerunning it is fast and removes the copy-paste mistakes that creep into manual monthly work.
      - text: Python produces more accurate arithmetic than a spreadsheet.
        why: Both use the same floating-point arithmetic. The gain is repeatability, not better maths.
    answer: 1
  - q: Which step of the analysis loop is most often skipped by beginners, and causes the most wrong answers?
    options:
      - text: Loading the file.
        why: You cannot skip loading; nothing works without it, so this rarely causes silent errors.
      - text: Writing the final chart.
        why: A missing chart makes a report weaker, but it does not make the numbers wrong.
      - text: Inspecting the data before analysing it.
        why: Correct. Skipping inspection is how blank values, duplicate rows and text-that-should-be-numbers end up silently distorting totals.
    answer: 2
  - q: What does `print()` do in the code blocks of this course?
    options:
      - text: It shows a value in the output area under the code.
        why: Correct. Run blocks only display what you print, so wrap anything you want to see in `print()`.
      - text: It sends the result to a printer.
        why: The name is historical; in Python `print()` writes text to the output, not to paper.
      - text: It saves the value to a file for the next lesson.
        why: Nothing is saved between code blocks; writing files needs functions such as `to_csv`.
    answer: 0
---

Every month, someone at a company exports a spreadsheet, filters it, fixes the same broken dates, builds the same pivot table and pastes the numbers into a slide. It takes an afternoon, and if the export changes slightly, the numbers quietly go wrong. Python turns that afternoon into a script: you write the steps once, and rerunning them on next month's file takes seconds.

This course teaches you exactly the Python a data analyst uses, from zero. No computer science detours: every concept appears because you need it to answer a business question.

## The company you will work for

Cartwheel is an online store selling home and outdoor goods in eight countries: Egypt, the UAE, Saudi Arabia, Jordan, the UK, Germany, the US and Canada. Its data covers January 2024 to December 2025, and it looks like real company data: an `orders` table, `order_items` with prices and discounts, `products`, `customers`, `returns`, support tickets and website sessions. There is also `orders_messy.csv`, an export with mixed date formats, dollar signs in the totals and duplicate rows, which you will clean in Section 3.

Your running assignment comes from Cartwheel's head of growth: revenue in Q4 2025 was far higher than any quarter before. Was it Black Friday, more customers, bigger baskets, or a data mistake? By the final section you will answer that with evidence, and every lesson before it gives you one tool you need for the job.

## How the code in this course runs

Code blocks with a **Run** button execute real Python 3.13, with pandas 2.x, in your browser. The Cartwheel CSV files sit in the working directory, so you can open them by name. Output appears only when you `print()` it. Here is a first taste; you do not need to understand every line yet:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
print(len(orders), "orders")
print(orders["status"].value_counts())
```

Four lines, and you know Cartwheel has 2,066 orders and how many were delivered, cancelled or returned. By the end of Section 2 you will write lines like these yourself and know exactly what each one does.

Most lessons end with an exercise. You write code in the editor, press **Check**, and a set of automatic checks tells you which parts are right. Hints are there when you are stuck, and the full solution with an explanation appears once you solve it or ask for it.

## The loop every analysis follows

The course is built around one loop. Each section strengthens one part of it.

:::figure The analysis loop this course teaches, one section per stage
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">Six stages in a row: question, load, inspect, clean, analyse, answer, with an arrow from answer back to question. Python basics support every stage; Section 2 covers load and inspect, Section 3 clean, Section 4 analyse and Section 5 answer.</title>
  <rect class="d-box-primary" x="10" y="40" width="96" height="52" rx="10"/>
  <text class="d-label-strong" x="58" y="71" text-anchor="middle">Question</text>
  <rect class="d-box" x="128" y="40" width="96" height="52" rx="10"/>
  <text class="d-label" x="176" y="71" text-anchor="middle">Load</text>
  <rect class="d-box" x="246" y="40" width="96" height="52" rx="10"/>
  <text class="d-label" x="294" y="71" text-anchor="middle">Inspect</text>
  <rect class="d-box-warn" x="364" y="40" width="96" height="52" rx="10"/>
  <text class="d-label" x="412" y="71" text-anchor="middle">Clean</text>
  <rect class="d-box-accent" x="482" y="40" width="96" height="52" rx="10"/>
  <text class="d-label" x="530" y="71" text-anchor="middle">Analyse</text>
  <rect class="d-box-success" x="600" y="40" width="90" height="52" rx="10"/>
  <text class="d-label-strong" x="645" y="71" text-anchor="middle">Answer</text>
  <path class="d-arrow" d="M106 66 L126 66" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M224 66 L244 66" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M342 66 L362 66" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M460 66 L480 66" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M578 66 L598 66" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M645 92 L645 120 L58 120 L58 96" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="140" text-anchor="middle">a good answer raises the next question</text>
  <text class="d-label-muted" x="235" y="186" text-anchor="middle">Section 2</text>
  <text class="d-label-muted" x="412" y="186" text-anchor="middle">Section 3</text>
  <text class="d-label-muted" x="530" y="186" text-anchor="middle">Section 4</text>
  <text class="d-label-muted" x="645" y="186" text-anchor="middle">Section 5</text>
  <path class="d-line" d="M140 168 L330 168"/>
</svg>
:::

Section 1, the one you are starting, gives you the plain Python that every later stage is written in: values, lists, dictionaries, loops, functions, and how to read an error message without panic.

:::tip Type the code yourself
Reading code feels like understanding it, until you try to write it. When a lesson shows an example, change a number or a column name and run it again. Small experiments teach you more than rereading.
:::

Next you meet the building blocks of every Python program: values, their types, and the variables that name them.
