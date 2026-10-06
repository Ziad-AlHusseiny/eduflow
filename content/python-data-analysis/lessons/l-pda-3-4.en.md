---
summary: Parse a date column that mixes ISO, day-first and month-first formats with explicit to_datetime formats, flag the ambiguous values, and verify the result against a trusted source.
takeaways:
  - Without `format=`, pandas 2 guesses the format from the first value and fails on any row written differently.
  - Parse each known format explicitly with `pd.to_datetime(col, format=..., errors="coerce")`, then combine the results with `fillna`.
  - A date like `05/08/2025` parses under both day-first and month-first rules; no parser can tell you which one is true.
  - Flag ambiguous values and resolve them from a trusted source (the system of record, another column, the person who made the file), never by assumption alone.
  - Once a column is `datetime64`, the `.dt` accessor gives you `year`, `month`, `day_name()` and `to_period()` for grouping.
further:
  - title: pandas.to_datetime
    url: https://pandas.pydata.org/docs/reference/api/pandas.to_datetime.html
  - title: strftime() and strptime() format codes
    url: https://docs.python.org/3/library/datetime.html#strftime-and-strptime-format-codes
  - title: Time series / date functionality
    url: https://pandas.pydata.org/docs/user_guide/timeseries.html
quiz:
  - q: "`pd.to_datetime(messy[\"order_date\"])` raises `ValueError: time data \"08/04/2024\" doesn't match format \"%Y-%m-%d\"`. Why?"
    options:
      - text: The date 8 April 2024 does not exist in the data range.
        why: The value is a valid date; the problem is its format, not its meaning.
      - text: pandas inferred the ISO format from the first value and then met a row written differently.
        why: Correct. pandas 2 infers one format for the whole column, and the first value, `2024-01-02`, set it.
      - text: Dates with slashes are not supported by pandas.
        why: Slashed dates parse fine with the right `format`, for example `%d/%m/%Y`.
      - text: The column contains missing values.
        why: Missing values become `NaT` (not a time); they do not trigger a format error.
    answer: 1
  - q: Which of these values is ambiguous, meaning both day-first and month-first readings give a valid but different date?
    options:
      - text: "`25/10/2025`"
        why: There is no month 25, so only the day-first reading is valid.
      - text: "`10/25/2025`"
        why: There is no month 25 in the day-first reading either, so this must be month-first.
      - text: "`2025-10-05`"
        why: ISO dates always put the year, then month, then day, so there is only one reading.
      - text: "`05/08/2025`"
        why: Correct. It could be 5 August or 8 May. Only outside information can decide.
    answer: 3
  - q: Your parser assumes day-first for ambiguous dates. How should you check whether that assumption is right?
    options:
      - text: Compare the parsed dates with a trusted source for the same records, such as the order system, and count disagreements.
        why: Correct. Here the clean `orders` table shows the assumption is wrong for 5 of the 30 ambiguous rows.
      - text: Check that no parsed date is `NaT`.
        why: An ambiguous date never fails to parse; it parses to the wrong date, which this check cannot see.
      - text: Check that all dates fall between 2024 and 2025.
        why: Swapping day and month inside the same year stays inside the range, so this cannot catch the error.
    answer: 0
---

The messy export writes dates three ways: `2024-03-05`, `05/03/2024` and `03/05/2024`. The first is unambiguous. The other two are the same day written by a European and an American spreadsheet, and the trouble is that `03/05/2024` might also be the European way of writing 3 May. Dates are the column where "it parsed without errors" and "it is correct" are furthest apart.

## Letting pandas guess

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
print(messy["order_date"].sample(8, random_state=1).tolist())
try:
    pd.to_datetime(messy["order_date"])
except ValueError as error:
    print(str(error).splitlines()[0])
```

pandas 2 infers one format from the first value, `2024-01-02`, and applies it to the whole column. Row 6, `08/04/2024`, does not fit, so the conversion stops. That strictness is a feature: older versions guessed row by row and could silently mix up days and months.

## Parse each format explicitly

You know which formats exist, so say so. Format codes describe the layout: `%Y` is a four-digit year, `%m` a two-digit month, `%d` a two-digit day. Parse the column once per format with `errors="coerce"`, which turns non-matching rows into `NaT` (pandas' "not a time"), then fill the gaps in order of preference:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
raw = messy["order_date"]
iso = pd.to_datetime(raw, format="%Y-%m-%d", errors="coerce")
dmy = pd.to_datetime(raw, format="%d/%m/%Y", errors="coerce")
mdy = pd.to_datetime(raw, format="%m/%d/%Y", errors="coerce")
print(iso.notna().sum(), "ISO |", dmy.notna().sum(), "fit day-first |", mdy.notna().sum(), "fit month-first")

parsed = iso.fillna(dmy).fillna(mdy)
print(parsed.isna().sum(), "unparsed")
print(parsed.min(), parsed.max())
```

Every row parsed, and the range is right: January 2024 to December 2025. Day-first comes before month-first in the chain because most of Cartwheel's countries write dates that way. pandas can do the same in one call with `pd.to_datetime(raw, format="mixed", dayfirst=True)`, which parses each value on its own; the explicit version is longer but shows you exactly which rule decided each row.

But look at the counts. 57 values fit day-first and 44 fit month-first, from only 68 slashed values. So 33 of them fit **both**.

:::figure Three kinds of slashed date
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">Three boxes. 25/10/2025 can only be day-first because there is no month 25. 10/25/2025 can only be month-first. 05/08/2025 fits both readings, 5 August or 8 May, so it is ambiguous and needs outside information.</title>
  <rect class="d-box-success" x="20" y="30" width="200" height="110" rx="12"/>
  <text class="d-code" x="120" y="65" text-anchor="middle">25/10/2025</text>
  <text class="d-label" x="120" y="95" text-anchor="middle">no month 25</text>
  <text class="d-label-strong" x="120" y="120" text-anchor="middle">day-first only</text>
  <rect class="d-box-success" x="250" y="30" width="200" height="110" rx="12"/>
  <text class="d-code" x="350" y="65" text-anchor="middle">10/25/2025</text>
  <text class="d-label" x="350" y="95" text-anchor="middle">no month 25</text>
  <text class="d-label-strong" x="350" y="120" text-anchor="middle">month-first only</text>
  <rect class="d-box-warn" x="480" y="30" width="200" height="110" rx="12"/>
  <text class="d-code" x="580" y="65" text-anchor="middle">05/08/2025</text>
  <text class="d-label" x="580" y="95" text-anchor="middle">5 Aug or 8 May?</text>
  <text class="d-label-strong" x="580" y="120" text-anchor="middle">ambiguous</text>
  <text class="d-label-muted" x="235" y="180" text-anchor="middle">the parser can decide these</text>
  <text class="d-label-muted" x="580" y="180" text-anchor="middle">only outside data can decide</text>
  <path class="d-line" d="M30 160 L440 160"/>
  <path class="d-line" d="M490 160 L670 160"/>
</svg>
:::

## Flag the ambiguity

A value that parses both ways to **different** dates is ambiguous. Three of the 33 are dates like `05/05/2025`, where both readings agree, so they are harmless:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
raw = messy["order_date"]
dmy = pd.to_datetime(raw, format="%d/%m/%Y", errors="coerce")
mdy = pd.to_datetime(raw, format="%m/%d/%Y", errors="coerce")
ambiguous = dmy.notna() & mdy.notna() & (dmy != mdy)
print(ambiguous.sum(), "ambiguous dates")
print(raw[ambiguous].head(6).tolist())
```

Thirty rows depend on an assumption. You can make the assumption, as the `fillna` chain did, but you should know you made it, and the person reading your report should too.

## Verify against the source of truth

Cartwheel's clean `orders` table is the system of record: every order id in the export also appears there with its real timestamp. A lookup by order id lets you test the assumption directly. `set_index("order_id")` turns the dates into a Series labelled by id, and `map()` looks each export row up in it:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
raw = messy["order_date"]
iso = pd.to_datetime(raw, format="%Y-%m-%d", errors="coerce")
dmy = pd.to_datetime(raw, format="%d/%m/%Y", errors="coerce")
mdy = pd.to_datetime(raw, format="%m/%d/%Y", errors="coerce")
parsed = iso.fillna(dmy).fillna(mdy)

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
true_dates = orders.set_index("order_id")["order_date"].dt.normalize()
truth = messy["order_id"].map(true_dates)

wrong = parsed != truth
print(wrong.sum(), "dates disagree with the order system")
print(messy.loc[wrong, ["order_id", "order_date"]].assign(parsed=parsed[wrong].dt.date, real=truth[wrong].dt.date))
```

`dt.normalize()` drops the time of day so the comparison is date to date. Five dates are wrong, and every one is an ambiguous value that was really month-first: `02/08/2025` is 8 February, not 2 August. The day-first assumption was right for 25 of 30 ambiguous rows, which sounds good until you realise it moves five orders into the wrong month, and some into the wrong quarter.

:::mistake Trusting dayfirst=True
`dayfirst=True` is a preference, not a guarantee: pandas uses it only when a value is ambiguous. When a file mixes conventions, as exports assembled from several systems often do, some ambiguous dates will be wrong no matter which preference you choose. If you cannot verify, keep an `is_ambiguous` flag in the cleaned data and report how much revenue depends on it.
:::

### Times and time zones

The export carries dates only, but the `orders` table has full timestamps such as `2025-12-30 21:19:03`, and none of them say which time zone they are in. Cartwheel records everything in one store clock, so you can treat them as local times and move on. When a file does include offsets like `+04:00`, pass `utc=True` to `pd.to_datetime` so every value lands on one common clock before you compare or group them; leaving zones mixed is how two orders placed at the same moment in Dubai and London end up on different dates, or even in different years around midnight on 31 December.

## What a real date column gives you

Once the column is `datetime64`, the `.dt` accessor exposes its parts:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
d = orders["order_date"]
print(d.dt.year.value_counts().sort_index())
print(d.dt.day_name().value_counts().head(3))
print(d.dt.to_period("M").value_counts().sort_index().tail(3))
```

Year, month, weekday name, calendar month as a period: these are the keys you will group by in Section 4, where Lesson 4.4 covers time series properly.

In the exercise you parse, flag and repair the export's dates. Then one problem remains before the export is clean: rows that appear twice.
