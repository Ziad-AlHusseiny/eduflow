---
summary: Find the inputs that expose bugs with equivalence classes and boundary values, then cover them compactly with table-driven tests using test.each.
takeaways:
  - Group inputs into classes that the code should treat the same way, then test one typical value per class plus the edges between classes.
  - Bugs cluster at boundaries, so test just below, on and just above every limit (zero, the maximum length, the decimal limit).
  - "`test.each` turns a table of inputs and expected outputs into one named test per row, so adding a case is one line."
  - Name each row with `%s` placeholders or `$field` so a failure tells you which input broke.
further:
  - title: Vitest — test.each
    url: https://vitest.dev/api/test#test-each
  - title: MDN — Regular expressions
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
quiz:
  - q: "`parseAmount` accepts up to two decimal places. Which set of inputs best tests that rule?"
    options:
      - text: "`'12'`, `'12.5'`, `'12.50'`, `'12.505'`"
        why: Correct. No decimals, one, two (on the limit) and three (just over) cover both sides of the boundary.
      - text: "`'12.50'`, `'99.99'`, `'0.01'`"
        why: These are all in the same class (exactly two decimals), so a bug that also accepted three decimals would pass every one.
      - text: "`'abc'`, `''`, `'-5'`"
        why: Good invalid inputs, but none of them is near the decimal limit, so they can't tell two decimals from three.
    answer: 0
  - q: |
      What are the names of the tests this produces?
      ```js
      test.each([
        ['12', 1200],
        ['0.5', 50],
      ])('parses %s as %i cents', (input, cents) => {
        expect(parseAmount(input)).toBe(cents);
      });
      ```
    options:
      - text: "`parses %s as %i cents`, twice"
        why: The placeholders are filled in from each row, which is exactly what makes table-driven failures readable.
      - text: "`parses 12 as 1200 cents` and `parses 0.5 as 50 cents`"
        why: Correct. `%s` takes the first value of the row and `%i` the second, giving one named test per row.
      - text: "One test named `parses 12, 0.5 as 1200, 50 cents`"
        why: "`test.each` creates one test per row, not one test for the whole table; each row passes or fails on its own."
    answer: 1
  - q: A form's amount field rejects zero. Which bug does a test with input `'0'` catch that `'1'` and `'-1'` miss?
    options:
      - text: A regex that doesn't allow negative numbers.
        why: "`'-1'` already covers negatives; zero adds nothing there."
      - text: A parser that forgets to trim spaces.
        why: Trimming is about whitespace; none of these three inputs has any.
      - text: A check written as `cents < 0` instead of `cents <= 0`, which lets zero through.
        why: Correct. Zero sits exactly on the boundary, and only an input on the boundary tells `<` from `<=`.
    answer: 2
---

Most bugs don't live in the middle of the input range. Nobody's code breaks on "$12.34". It breaks on "", on "0", on "12.5" read as twelve dollars and five cents, on " 7.10 " pasted with a trailing space. Finding those inputs on purpose is the skill this lesson teaches.

## The function under test

Splitwise-lite's amount field accepts what people type and turns it into integer cents:

```js run
function parseAmount(input) {
  const text = String(input).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    throw new Error(`Not a valid amount: "${input}"`);
  }
  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (cents === 0) throw new Error('Amount must be greater than zero');
  return cents;
}

for (const input of ['12', '12.5', ' 7.10 ', '0.01']) {
  console.log(JSON.stringify(input), '->', parseAmount(input));
}
for (const input of ['', '0', '-5', '12.345', 'ten']) {
  try { parseAmount(input); } catch (e) { console.log(JSON.stringify(input), '->', e.message); }
}
```

## Equivalence classes and boundaries

You can't test every string, and you don't need to. **Equivalence partitioning** means grouping inputs the code should treat the same way, and testing one representative of each group:

- whole numbers: `'12'`
- one decimal: `'12.5'` (the dangerous one: is it 1250 or 1205?)
- two decimals: `'12.50'`
- surrounded by spaces: `' 7.10 '`
- invalid text: `'ten'`, `''`, `'-5'`

**Boundary value analysis** then adds the inputs at the edges between groups, because that is where `<` and `<=` get mixed up and where `{1,2}` becomes `{1,3}`. For each limit, test just below, on, and just above:

:::figure Test each side of every boundary, not only the middle
<svg viewBox="0 0 680 200" role="img" aria-labelledby="t1">
  <title id="t1">Two number lines. Amount: 0 is rejected, 0.01 is the smallest accepted value. Decimal places: two are accepted, three are rejected.</title>
  <text class="d-label-strong" x="20" y="40">Amount</text>
  <path class="d-line" d="M130 60 L660 60"/>
  <rect class="d-box-warn" x="130" y="46" width="150" height="28" rx="6"/>
  <text class="d-label" x="205" y="65" text-anchor="middle">rejected</text>
  <rect class="d-box-success" x="290" y="46" width="370" height="28" rx="6"/>
  <text class="d-label" x="475" y="65" text-anchor="middle">accepted</text>
  <text class="d-code" x="250" y="98" text-anchor="middle">'0'</text>
  <text class="d-code" x="330" y="98" text-anchor="middle">'0.01'</text>
  <text class="d-label-strong" x="20" y="140">Decimals</text>
  <path class="d-line" d="M130 160 L660 160"/>
  <rect class="d-box-success" x="130" y="146" width="330" height="28" rx="6"/>
  <text class="d-label" x="295" y="165" text-anchor="middle">0, 1 or 2 accepted</text>
  <rect class="d-box-warn" x="470" y="146" width="190" height="28" rx="6"/>
  <text class="d-label" x="565" y="165" text-anchor="middle">3+ rejected</text>
  <text class="d-code" x="420" y="194" text-anchor="middle">'12.50'</text>
  <text class="d-code" x="520" y="194" text-anchor="middle">'12.505'</text>
</svg>
:::

Here the boundaries are zero (rejected) versus one cent (accepted), and two decimals (accepted) versus three (rejected). A checklist I run through for any input:

- **Empty and blank**: `''`, `'   '`
- **Zero, one, many**: `'0'`, `'0.01'`, `'12345.67'`
- **Each limit, from both sides**: two versus three decimals
- **Wrong kinds**: letters, a minus sign, a comma (`'1,000'`)
- **Formatting noise**: leading or trailing spaces, a trailing dot (`'12.'`)

## Table-driven tests with test.each

Writing a separate `test(...)` for each of those is noisy. `test.each` takes a table and produces **one named test per row**:

```js title=src/parse-amount.test.js
import { describe, test, expect } from 'vitest';
import { parseAmount } from './parse-amount.js';

describe('parseAmount', () => {
  test.each([
    ['12', 1200],
    ['12.5', 1250],
    ['12.50', 1250],
    ['0.01', 1],
    [' 7.10 ', 710],
  ])('parses %s as %i cents', (input, cents) => {
    expect(parseAmount(input)).toBe(cents);
  });

  test.each(['', '0', '0.00', '-5', '12.505', 'ten', '1,000'])(
    'rejects %s',
    (input) => {
      expect(() => parseAmount(input)).toThrow();
    },
  );
});
```

`%s` and `%i` are filled from each row, so the report reads `parses 12.5 as 1250 cents`, and a failure names the exact input. For wider tables, rows can be objects and the name can use `$field`:

```js
test.each([
  { input: '12.5', cents: 1250 },
  { input: '0.01', cents: 1 },
])('parses $input as $cents cents', ({ input, cents }) => {
  expect(parseAmount(input)).toBe(cents);
});
```

The real win is maintenance. When a user reports that `'12.'` crashes the form, the regression test is one new row, not a new block of code.

## Where edge cases come from

You don't find edge cases by staring at the code. Three sources do most of the work:

1. **The spec, read adversarially.** "Up to two decimals" immediately suggests two and three. "Must be positive" suggests zero. Every limit in a requirement is a boundary to test from both sides.
2. **Real users.** People paste amounts from bank statements with spaces and currency signs. People in Germany type a comma as the decimal separator, so `'12,50'` is not a typo for them; decide whether you reject it with a helpful message or accept it, and write the row either way.
3. **Bug reports.** Every bug that reached production is an edge case your table missed. Add the row first, watch it fail, then fix the code. The table becomes a record of everything that ever went wrong.

How many rows are enough? One per class, plus both sides of each boundary, plus one row per past bug. For `parseAmount` that is about fifteen rows, a few milliseconds of runtime and a very good night's sleep. If you find yourself wanting thousands of random inputs, look at property-based testing libraries such as fast-check, which generate inputs and shrink failures to the smallest example; for most app code, a hand-picked table is clearer.

:::mistake Only testing the happy path in the table
A table of ten valid amounts feels thorough and catches almost nothing: they are all in the same class. Make sure every table has rows from **each** class and **each side** of each boundary. Five well-chosen rows beat fifty similar ones.
:::

:::tip Assert the message when it matters
`toThrow()` with no argument passes for any error, including a `TypeError` from a typo inside your function. When the rejection reason matters to the user, match it: `toThrow('greater than zero')`. For a long list of invalid inputs, a plain `toThrow()` is fine as long as one test pins each distinct message.
:::

In the exercise, build a table that exposes four realistic parsing bugs. Next up: functions that throw and functions that return promises.
