---
summary: Do arithmetic with JavaScript numbers, avoid floating-point surprises by storing money in whole cents, and compare values safely with === instead of ==.
takeaways:
  - JavaScript has one number type for whole and decimal numbers, and decimals are stored in binary, so `0.1 + 0.2` is not exactly `0.3`.
  - Store money as whole cents (integers) and convert to dollars only for display; whole-number arithmetic is exact.
  - "`+` with a string joins text instead of adding, so convert input with `Number()` before doing maths."
  - Always compare with `===` and `!==`; `==` converts types first and gives answers like `\"\" == 0` being true.
further:
  - title: Expressions and operators (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators
  - title: Equality comparisons and sameness (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness
  - title: Number (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
quiz:
  - q: 'A user types `5` into a text box, so your code receives the string `"5"`. What is `"5" + 3`?'
    options:
      - text: '`8`'
        why: That is what you wanted, but `+` sees a string on one side and switches to joining text.
      - text: '`"53"`'
        why: Correct. When either side of `+` is a string, JavaScript converts the other side to a string and joins them. Convert first with `Number("5")`.
      - text: '`NaN`'
        why: '`NaN` appears when a maths operation cannot produce a number. Here `+` happily joins text, so no maths fails.'
      - text: A TypeError, because you cannot add a string and a number.
        why: JavaScript never throws here; it converts types silently, which is exactly why this bug is easy to miss.
    answer: 1
  - q: Pocket stores a coffee as `4.1` dollars and a lunch as `12.2`. Why is storing `410` and `1220` cents a better design?
    options:
      - text: Integer arithmetic is exact, while binary decimals like 4.1 carry tiny rounding errors that pile up in totals.
        why: Correct. Whole numbers up to about 9 quadrillion are represented exactly, so sums of cents never drift.
      - text: Whole numbers take less memory than decimals in JavaScript.
        why: Both are the same number type and use the same amount of memory. The benefit is accuracy, not size.
      - text: JavaScript cannot add decimals at all without a library.
        why: It can add them; the result is just sometimes a hair off, such as `18.999999999999996` instead of 19.
    answer: 0
  - q: Which comparison is `true`?
    options:
      - text: '`"0" === 0`'
        why: '`===` never converts types, and a string is never strictly equal to a number.'
      - text: '`NaN === NaN`'
        why: NaN is the one value not equal to itself. Use `Number.isNaN(value)` to test for it.
      - text: '`10 % 3 === 1`'
        why: Correct. `%` gives the remainder of a division, and 10 divided by 3 leaves a remainder of 1.
      - text: '`2 + 3 * 2 === 10`'
        why: Multiplication runs before addition, so the left side is `2 + 6`, which is 8.
    answer: 2
  - q: What does `let n = 4; n += 2; n *= 3;` leave in `n`?
    options:
      - text: '`18`'
        why: Correct. `n += 2` makes it 6, and `n *= 3` makes it 18. Each shorthand reads the current value, does the maths, and reassigns.
      - text: '`10`'
        why: That would be `4 + 2 * 3`. The two statements run one after the other, so the addition finishes before the multiplication starts.
      - text: '`14`'
        why: 'That would be `4 * 3 + 2`. The statements run in the order written: add first, then multiply.'
    answer: 0
---

Ask JavaScript to add up a coffee, a lunch and a bus ticket, and it gets the answer slightly wrong:

```js run
console.log(4.1 + 12.2 + 2.7);
```

You expected 19 and got `18.999999999999996`. This is not a JavaScript bug; nearly every programming language does the same thing. Once you know why, you can design Pocket so it never bites you.

## Arithmetic, the usual way

The arithmetic operators work as you would hope, with the usual precedence: `*`, `/` and `%` happen before `+` and `-`, and parentheses override everything.

```js run
console.log(2 + 3 * 4);    // multiplication first
console.log((2 + 3) * 4);  // parentheses first
console.log(17 % 5);       // remainder after dividing 17 by 5
console.log(2 ** 10);      // 2 to the power of 10
```

`%` (remainder) is more useful than it looks: `n % 2 === 0` tells you whether a number is even, and `minutes % 60` gives the leftover minutes after whole hours.

When you update a variable from its own value, there are shorthands. `total += 450` means `total = total + 450`, and the same pattern works for `-=`, `*=` and `/=`. `count++` adds one, which you will see in loops.

## Why 0.1 + 0.2 is not 0.3

JavaScript has a single number type, used for both whole numbers and decimals. Under the hood every number is stored in binary, in 64 bits, following a standard called IEEE 754. Whole numbers fit perfectly. Many decimals do not: in binary, 0.1 is a fraction that repeats forever, like 1/3 in decimal (0.3333…). The computer has to cut it off somewhere, so it stores the nearest value it can. Add a few of these near-misses and the error becomes visible.

```js run
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(4.1 * 100);
```

The error is tiny, about one part in ten quadrillion, so for measuring distances or drawing on screen it never matters. For money it does. A total that should be 19 but is stored as 18.999999999999996 fails an equality check, rounds the wrong way on a receipt, and drifts further every time you add another expense. Rounding the display hides the symptom while the stored number stays wrong.

For money, the fix is simple and it is what payment companies do: **store amounts as whole cents**. Whole numbers are exact up to `Number.MAX_SAFE_INTEGER`, about 9 quadrillion, which is plenty for an expense tracker.

```js run
const coffee = 410;   // $4.10 in cents
const lunch = 1220;
const bus = 270;
const total = coffee + lunch + bus;
console.log(total);         // exact
console.log(total / 100);   // convert to dollars only when you display it
```

From this lesson on, every amount in Pocket is stored in cents. When an amount arrives in dollars, such as `4.1`, convert it once with `Math.round(4.1 * 100)`. The `Math.round` matters, because `4.1 * 100` is `409.99999999999994`, and rounding snaps it to `410`.

## When + joins instead of adds

Values typed into a web page always arrive as strings, even when they look like numbers. And `+` has two jobs: adding numbers and joining strings. If either side is a string, it joins.

```js run
const typed = "5";
console.log(typed + 3);          // joins: "53"
console.log(typed - 3);          // only maths makes sense, so 2
console.log(Number(typed) + 3);  // convert first: 8
console.log(Number("12abc"));    // not a number: NaN
```

The other operators (`-`, `*`, `/`) only do maths, so they convert strings to numbers silently, which makes the bug harder to spot: the subtraction works and the addition does not. Convert input explicitly with `Number()` as soon as you receive it.

When a conversion fails you get `NaN`, "not a number", which is confusingly of type number. `NaN` spreads: any maths with it gives `NaN`. Test for it with `Number.isNaN(value)`, because `NaN === NaN` is `false`.

Its cousin is `Infinity`. Dividing by zero does not crash a JavaScript program the way it does a calculator: `5 / 0` is `Infinity` and `-5 / 0` is `-Infinity`. That sounds harmless until Pocket computes "average spend per day" on the first of the month with zero days recorded. Neither `NaN` nor `Infinity` throws an error, so your program keeps running and shows nonsense. The defence is the same for both: check your inputs before you calculate.

:::mistake Adding raw input
`total = total + amountInput` looks right and produces `"0450"` the first time someone uses your form. Convert with `Number(amountInput)` first, then check the result with `Number.isNaN` before using it.
:::

## Comparing values

Comparison operators produce a boolean: `>`, `<`, `>=`, `<=`, and the two kinds of equality.

`===` (strict equality) is `true` only when both values have the same type and the same value. `==` (loose equality) first converts the two sides to a common type, following rules that surprise even experienced developers:

| Expression | `==` | `===` |
|---|---|---|
| `"5"` and `5` | true | false |
| `""` and `0` | true | false |
| `null` and `undefined` | true | false |
| `"0"` and `false` | true | false |

Use `===` and `!==` everywhere. If the types might differ, convert explicitly first, then compare. Your code then says exactly what it means, and nobody has to remember a conversion table.

```js run
const budgetCents = 2500;
const spentCents = 2200;
const isOverBudget = spentCents > budgetCents;
console.log(isOverBudget, typeof isOverBudget);
console.log(spentCents === 2200, "2200" === 2200);
```

:::tip Rounding for humans
`Math.round`, `Math.floor` (down) and `Math.ceil` (up) return whole numbers. `Math.max(3, 9, 4)` and `Math.min(...)` pick the largest or smallest. You will use all of them in Pocket.
:::

With exact amounts and safe comparisons, the next step is to show them nicely: strings, and how to build readable text like "Lunch: $12.20".
