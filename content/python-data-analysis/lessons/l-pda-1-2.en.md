---
summary: Store values in variables, tell integers, floats, strings, booleans and None apart, and convert text like " $129.00" into a number you can calculate with.
takeaways:
  - A variable is a name pointing at a value; `=` assigns, `==` compares.
  - Every value has a type, and `type()` tells you which one; most bugs in data work are a value having the type you did not expect.
  - "`/` always returns a float, `//` drops the remainder, and `%` gives the remainder."
  - String methods such as `strip()` and `replace()` return a new string; they never change the original.
  - Convert text to numbers with `int()` and `float()` only after removing symbols like `$` and spaces.
further:
  - title: An Informal Introduction to Python (numbers and text)
    url: https://docs.python.org/3/tutorial/introduction.html
  - title: Built-in Types - String Methods
    url: https://docs.python.org/3/library/stdtypes.html#string-methods
  - title: "Floating-Point Arithmetic: Issues and Limitations"
    url: https://docs.python.org/3/tutorial/floatingpoint.html
quiz:
  - q: |
      What does this print?
      ```python
      price = "39"
      print(price * 2)
      ```
    options:
      - text: "`78`"
        why: That would need `int(price) * 2`. As written, `price` is text.
      - text: "`3939`"
        why: Correct. Multiplying a string by an integer repeats it. The value came in as text, so the maths never happened.
      - text: A `TypeError`
        why: "`str * int` is allowed in Python (it repeats the string). The error happens with `str + int`."
    answer: 1
  - q: Which line turns `"$1,250.00"` into the float `1250.0`?
    options:
      - text: "`float(\"$1,250.00\")`"
        why: "`float()` accepts digits, a decimal point, a sign, an exponent and surrounding spaces, but not `$` or a thousands comma, so this raises `ValueError`."
      - text: "`int(\"$1,250.00\".replace(\"$\", \"\"))`"
        why: The comma is still there, and `int()` would reject the `.00` anyway.
      - text: "`float(\"$1,250.00\".replace(\"$\", \"\").replace(\",\", \"\"))`"
        why: Correct. Remove every symbol first, then convert the clean digits.
      - text: "`str(\"$1,250.00\").strip()`"
        why: "`strip()` only removes whitespace at the ends, and the result is still a string."
    answer: 2
  - q: What is the value of `10 / 4` and `10 // 4`?
    options:
      - text: "`2.5` and `2`"
        why: Correct. True division always returns a float; floor division drops the fractional part.
      - text: "`2` and `2.5`"
        why: It is the other way round. `//` is the operator that rounds down.
      - text: "`2.5` and `2.5`"
        why: "`//` is floor division and never keeps the fractional part."
    answer: 0
  - q: A customer's coupon code is unknown. Which value best represents that in Python?
    options:
      - text: The empty string `""`
        why: An empty string is a real value (text with no characters). It can mean "no coupon" or "unknown", which is exactly the ambiguity you want to avoid.
      - text: The number `0`
        why: Zero is a real number and would be counted in sums and averages as if it were data.
      - text: "`None`"
        why: Correct. `None` is Python's built-in marker for "no value here". pandas has its own missing markers, which you meet in Section 3.
    answer: 2
---

An order line arrives from a messy export: the unit price reads `$129.00`, the quantity reads `2`, and a 15% coupon was applied. A human reads that and calculates the line revenue in their head. Python cannot, yet: to Python, `"$129.00"` is a piece of text, no more a number than the word `"skillet"`. Knowing what kind of value you are holding is the first skill of data work.

## Values and variables

A value is a piece of data: `2`, `129.0`, `"Cast Iron Skillet"`, `True`. A variable is a name you attach to a value with `=` so you can use it later.

```python run
product = "Cast Iron Skillet 26cm"
unit_price = 39
quantity = 2
line_total = unit_price * quantity
print(product, line_total)
```

Read `line_total = unit_price * quantity` from right to left: Python computes the right side first, then points the name on the left at the result. Variable names use lowercase words joined by underscores (`unit_price`, not `UnitPrice` or `unitprice`); that convention is called snake_case and every Python codebase you will read follows it.

## Every value has a type

The type decides what you can do with a value. `type()` reveals it:

```python run
print(type(2))            # int: whole numbers
print(type(129.0))        # float: numbers with a decimal point
print(type("129.00"))     # str: text, in single or double quotes
print(type(True))         # bool: True or False
print(type(None))         # NoneType: "no value here"
```

Notice that `"129.00"` is a `str`. Quotes make text, even when the characters inside look like digits. That single fact explains a whole family of data bugs: a column that looks numeric but was read as text sorts `"100"` before `"20"` and refuses to sum.

### Arithmetic

Numbers support the operators you expect, plus three that matter in analysis:

```python run
print(10 / 4)    # 2.5  true division, always a float
print(10 // 4)   # 2    floor division: whole boxes of 4
print(10 % 4)    # 2    remainder: items left over
print(2 ** 3)    # 8    power
print(0.1 + 0.2) # 0.30000000000000004
```

The last line is not a Python bug. Computers store decimals in binary, so most decimal fractions are stored as a tiny approximation. For money you round at the end with `round(value, 2)`, and you never compare two floats with `==` after a calculation unless you rounded both. Section 4 returns to this when totals do not quite match.

One more surprise hides in `round()` itself. Python rounds exact halves to the nearest even digit, so `round(0.5)` is `0` and `round(2.5)` is `2`, and a value like `2.675` is stored as slightly less than it looks, so `round(2.675, 2)` gives `2.67`. For analysis and reporting that never matters. For invoices, where every cent must follow an accounting rule, Python's `decimal` module exists; you will not need it in this course, but now you know where to look when a finance colleague asks.

## Text is a sequence of characters

Strings come with methods: functions attached to the value, called with a dot. These are the ones you will use constantly:

```python run
raw = "  united KINGDOM "
print(raw.strip())                 # remove spaces at both ends
print(raw.strip().title())         # "United Kingdom"
print(raw.upper())                 # all capitals
print("$129.00".replace("$", ""))  # swap one substring for another
print(len("Cartwheel"))            # number of characters: 9
```

Every one of these returns a **new** string. Strings are immutable: `raw.strip()` does not change `raw`. If you want to keep the cleaned version, assign it: `country = raw.strip().title()`.

## Converting between types

`int()`, `float()` and `str()` convert values, but only when the conversion makes sense:

```python run
quantity = int("2")
price = float("129.00")
label = "Qty: " + str(quantity)
print(quantity * price, label)
```

`float("$129.00")` fails with `ValueError: could not convert string to float: '$129.00'`. The fix is to clean first, then convert. You chain methods left to right, each one working on the result of the previous one:

```python run
price_text = " $129.00"
price = float(price_text.strip().replace("$", ""))
discount = 0.15
line_revenue = round(2 * price * (1 - discount), 2)
print(price, line_revenue)
```

That is the revenue formula Cartwheel uses for every order line: quantity times unit price times one minus the discount. You will apply it to thousands of rows at once in Section 2; here you see it for one.

:::mistake Adding text to a number
`"Qty: " + 2` raises `TypeError: can only concatenate str (not "int") to str`. Python never guesses whether you meant text or maths. Convert explicitly, `"Qty: " + str(2)`, or use an f-string, which Lesson 1.5 covers.
:::

## Booleans and comparisons

Comparisons produce `True` or `False`, and these answer yes/no questions about your data:

```python run
line_revenue = 219.3
print(line_revenue >= 200)       # True
print(line_revenue == 219.3)     # True: equal values
print("web" != "mobile_app")     # True: not equal
```

One `=` assigns; two `==` compares. Mixing them up is the most common typo for new programmers, and Python helps by rejecting `if x = 3:` as a syntax error.

`None` is a separate value that means "nothing here". A missing coupon code or an unknown satisfaction score would be `None` in plain Python. pandas uses its own markers for missing data, and Section 3 is about handling them carefully.

:::tip Check types when results look odd
When a number behaves strangely (it will not add, it sorts wrongly, it prints with quotes), print `type(value)` before anything else. Nine times out of ten, a number is secretly text.
:::

The exercise below turns one messy export row into real numbers. Next, you store many values at once in lists and dictionaries.
