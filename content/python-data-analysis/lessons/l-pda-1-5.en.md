---
summary: Package repeated logic into functions with parameters and return values, format numbers for reports with f-strings, and read a Python traceback to find and fix the real problem.
takeaways:
  - A function names a piece of logic; parameters are its inputs and `return` hands back its output.
  - A function that prints instead of returning gives back `None`, so its result cannot be used in further calculations.
  - "f-strings format values inline: `f\"{revenue:,.2f}\"` gives `1,234.50` and `f\"{share:.1%}\"` gives `12.5%`."
  - Read a traceback from the bottom - the last line names the error type and message, the lines above show where it happened.
  - "`try` / `except` handles an error you expect, such as text that cannot become a number; never use it to hide errors you do not understand."
further:
  - title: Defining Functions
    url: https://docs.python.org/3/tutorial/controlflow.html#defining-functions
  - title: Formatted String Literals (f-strings)
    url: https://docs.python.org/3/tutorial/inputoutput.html#formatted-string-literals
  - title: Errors and Exceptions
    url: https://docs.python.org/3/tutorial/errors.html
  - title: Format Specification Mini-Language
    url: https://docs.python.org/3/library/string.html#format-specification-mini-language
quiz:
  - q: |
      What is `result` after this runs?
      ```python
      def add_tax(amount):
          print(amount * 1.2)

      result = add_tax(100)
      ```
    options:
      - text: "`120.0`"
        why: "The function displays 120.0, but displaying is not returning. Without `return`, the caller gets nothing back."
      - text: "`None`"
        why: Correct. A function without a `return` statement returns `None`, whatever it printed along the way.
      - text: The string `"120.0"`
        why: "`print` writes text to the output; it does not hand that text back to the caller."
    answer: 1
  - q: 'Which f-string prints `Revenue: $146,825.44` when `revenue = 146825.4412`?'
    options:
      - text: "`f\"Revenue: ${revenue:.2f}\"`"
        why: This gives `$146825.44`, with no thousands separator. The comma in the format spec adds it.
      - text: "`f\"Revenue: ${revenue:,}\"`"
        why: The comma adds separators but there is no precision, so you get all the decimals of the float.
      - text: "`f\"Revenue: ${revenue:,.2f}\"`"
        why: Correct. `,` adds thousands separators and `.2f` fixes two decimal places, rounding the value for display.
      - text: "`f\"Revenue: {round(revenue)}\"`"
        why: This drops the cents and the dollar sign entirely.
    answer: 2
  - q: |
      The last line of a traceback reads:
      ```text
      KeyError: 'Total'
      ```
      What is the most likely cause?
    options:
      - text: The code asks a dictionary (or DataFrame) for a key `'Total'` that does not exist; the real key is probably `'total'`.
        why: Correct. `KeyError` always names the missing key. Keys are case-sensitive, so compare the spelling with the actual keys.
      - text: The value of `total` cannot be converted to a number.
        why: A failed conversion raises `ValueError`, not `KeyError`.
      - text: The variable `Total` was never defined.
        why: 'An undefined variable raises `NameError: name ''Total'' is not defined`. The quotes in the message point to a key lookup.'
    answer: 0
  - q: When is wrapping code in `try` / `except` a good idea?
    options:
      - text: Around a whole script, so it never crashes in front of your manager.
        why: That hides every bug, including the ones that make your numbers wrong. A visible crash is better than a silent wrong answer.
      - text: Around one operation that you expect to fail for some inputs, with a specific exception type and a clear fallback.
        why: Correct. For example, catching `ValueError` when converting user-typed text, and returning `None` for values that are not numbers.
      - text: Whenever you see a `SyntaxError`.
        why: Syntax errors happen before the code runs, so `try` cannot catch them; you fix the code instead.
    answer: 1
---

By now you have cleaned the price `" $129.00"` once, computed a line's revenue once, and printed a few numbers. Cartwheel has 3,991 order lines. You do not want to copy the cleaning code to every place it is needed and then fix a bug in seven copies. Functions let you write the logic once, give it a name, and call it wherever you need it.

## Defining a function

```python run
def line_revenue(quantity, unit_price, discount=0.0):
    """Revenue of one order line: quantity x price, minus the discount."""
    return round(quantity * unit_price * (1 - discount), 2)

print(line_revenue(2, 129.0, 0.15))   # 219.3
print(line_revenue(1, 39.0))          # discount defaults to 0.0
print(line_revenue(quantity=3, unit_price=24.0, discount=0.25))
```

The pieces: `def`, the function's name, parameters in parentheses, a colon, and an indented body. `discount=0.0` is a **default**, used when the caller leaves it out. The triple-quoted line under `def` is a docstring, which documents what the function does; editors show it when you hover over the name.

`return` sends a value back to the caller, and the call `line_revenue(2, 129.0, 0.15)` becomes that value. You can store it, add it, pass it to another function. Calling with names, as in the third example, makes long argument lists readable and protects you from swapping two numbers by accident.

:::mistake Printing instead of returning
A function that ends with `print(total)` shows the number and then returns `None`. Later, `line_revenue(...) * 2` fails with `TypeError: unsupported operand type(s) for *: 'NoneType' and 'int'`. Functions that compute should `return`; let the caller decide whether to print.
:::

## Cleaning functions

Here is the money cleaner from Lesson 1.2, made reusable. It handles the dollar sign, stray spaces and thousands separators:

```python run
def parse_money(text):
    """Turn strings like ' $1,234.50' into the float 1234.5."""
    cleaned = text.strip().replace("$", "").replace(",", "")
    return float(cleaned)

for raw in [" $129.00", "18.00", "$1,234.50"]:
    print(raw, "->", parse_money(raw))
```

Give functions verb names that say what they return (`parse_money`, `line_revenue`, `clean_country`) and keep each one to a single job; small functions are easy to test with a couple of `print` calls like the loop above. Now every messy total in the export can go through one tested function. If you discover a new format next month (say, a trailing `USD`), you fix it in one place.

## f-strings: numbers people can read

A report that says `146825.4412` makes readers squint. An **f-string**, a string with `f` before the opening quote, lets you drop values into text inside `{}` and format them with a spec after a colon:

```python run
revenue = 146825.4412
orders = 642
share = 0.4493

print(f"Q4 2025 revenue: ${revenue:,.2f}")       # thousands separator, 2 decimals
print(f"Orders: {orders}, average {revenue / orders:.2f} per order")
print(f"Share of the year: {share:.1%}")          # percent with 1 decimal
print(f"|{'Egypt':<12}|{orders:>6}|")             # left- and right-aligned columns
```

The specs you will use most: `,.2f` for money, `.1%` for shares (it multiplies by 100 for you), `,.0f` for large whole numbers, and `<`/`>` with a width for aligned text. Any expression works inside the braces, including arithmetic like `revenue / orders`.

## Reading errors without panic

When Python cannot continue, it raises an **exception** and prints a traceback. Beginners read it from the top and get lost. Read it from the **bottom**:

```text
Traceback (most recent call last):
  File "report.py", line 9, in <module>
    total = parse_money(row["Total"])
                        ~~~^^^^^^^^^
KeyError: 'Total'
```

The last line is the error type and message: a dictionary was asked for the key `'Total'` and does not have it. One line up is the code that failed, with markers under the exact expression, and above that, the file and line number. The fix here is the column's real name, `'total'`.

:::figure Read a traceback from the bottom up
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">A traceback in three layers. Bottom: the error type and message, read first. Middle: the failing line of code with markers. Top: the file and line number, used to find the place in your code.</title>
  <rect class="d-box" x="20" y="20" width="430" height="44" rx="8"/>
  <text class="d-code" x="36" y="47">File "report.py", line 9</text>
  <rect class="d-box" x="20" y="76" width="430" height="44" rx="8"/>
  <text class="d-code" x="36" y="103">total = parse_money(row["Total"])</text>
  <rect class="d-box-warn" x="20" y="132" width="430" height="44" rx="8"/>
  <text class="d-code" x="36" y="159">KeyError: 'Total'</text>
  <text class="d-label-strong" x="480" y="159">1. what went wrong</text>
  <text class="d-label" x="480" y="103">2. which expression</text>
  <text class="d-label-muted" x="480" y="47">3. where to look</text>
  <path class="d-arrow" d="M680 150 L680 58" marker-end="url(#arrow)"/>
</svg>
:::

The errors you will meet most, and what they almost always mean:

| Error | Usual cause |
|---|---|
| `NameError` | A typo in a variable name, or using it before assigning it |
| `KeyError` | A dictionary key or DataFrame column that does not exist (check spelling and case) |
| `TypeError` | Mixing types, such as text plus a number, or calling a function with the wrong arguments |
| `ValueError` | The type is right but the content is not, such as `float("$65.00")` |
| `IndexError` | A list position past the end |
| `AttributeError` | Calling a method the value does not have, often on `None` |

### Handling an error you expect

Some failures are part of the data, not bugs. A messy total such as `"N/A"` will never become a number. `try` / `except` lets you decide what happens instead:

```python run
def parse_money_or_none(text):
    try:
        return float(text.strip().replace("$", "").replace(",", ""))
    except ValueError:
        return None

print(parse_money_or_none("$65.00"), parse_money_or_none("N/A"))
```

Catch the specific exception you expect (`ValueError` here) and nothing else. A bare `except:` would also swallow a typo in your own code, and you would get `None` everywhere with no clue why.

:::tip Search the last line
When an error message is new to you, copy its last line, minus your own variable names, into a search engine. Somebody has hit it before, and the first answer usually explains it in a paragraph.
:::

That completes your Python toolkit. Section 2 puts it to work at scale: pandas, where a single line operates on every row of a table.
