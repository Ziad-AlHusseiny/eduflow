---
summary: Make your program choose between paths with if, else if and else, combine conditions with &&, || and !, pick values with the ternary operator, and predict which values count as truthy or falsy.
takeaways:
  - An `if` chain checks conditions top to bottom and runs only the first block whose condition is true, so put the most specific case first.
  - "`&&` needs both sides true, `||` needs at least one, and `!` flips a boolean."
  - Use the ternary `condition ? a : b` to choose between two values, and `if` when you choose between two actions.
  - Only eight values are falsy (`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`); everything else, including `"0"` and `[]`, is truthy.
further:
  - title: if...else (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else
  - title: Truthy (MDN glossary)
    url: https://developer.mozilla.org/en-US/docs/Glossary/Truthy
  - title: Conditional (ternary) operator (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator
quiz:
  - q: |
      With `spent = 2100` and `budget = 2000`, what does this log?
      ```js
      if (spent > budget * 0.8) {
        console.log("close");
      } else if (spent > budget) {
        console.log("over");
      } else {
        console.log("ok");
      }
      ```
    options:
      - text: '`over`'
        why: The chain stops at the first true condition. 2100 is more than 1600, so the first block runs and the `else if` is never checked.
      - text: '`close`'
        why: Correct, and it is a bug. The broader condition comes first and swallows the over-budget case. Check `spent > budget` first.
      - text: '`close` and then `over`'
        why: An `if`/`else if` chain runs at most one block. Only separate `if` statements could both run.
      - text: '`ok`'
        why: '`else` runs only when every condition above it is false, and the first one is true here.'
    answer: 1
  - q: Which of these values is truthy?
    options:
      - text: '`""` (an empty string)'
        why: The empty string is one of the eight falsy values.
      - text: '`0`'
        why: Zero is falsy, which is exactly why `if (amount)` misbehaves for a real amount of 0.
      - text: '`"0"` (a string containing zero)'
        why: Correct. Any non-empty string is truthy, even `"0"` and `"false"`.
      - text: '`NaN`'
        why: '`NaN` is falsy, along with `false`, `0`, `-0`, `0n`, `""`, `null` and `undefined`.'
    answer: 2
  - q: 'A user can set a daily limit, and `0` is a valid choice meaning "no spending today". What does `const limit = userLimit || 5000;` do when `userLimit` is `0`?'
    options:
      - text: It keeps 0, because 0 is a number.
        why: '`||` does not check types; it checks truthiness, and 0 is falsy.'
      - text: It throws, because `||` only works with booleans.
        why: '`||` works with any values and returns one of them, not necessarily a boolean.'
      - text: It sets `limit` to 5000, silently ignoring the user's choice.
        why: Correct. `||` falls back whenever the left side is falsy, and 0 is falsy. The `??` operator, covered in section 3, falls back only for null and undefined.
    answer: 2
  - q: Which line best uses the ternary operator?
    options:
      - text: '`const label = isOver ? "Over budget" : "On track";`'
        why: Correct. The ternary picks one of two values and the result is stored. That is exactly what it is for.
      - text: '`isOver ? sendAlert() : logQuietly();`'
        why: This works, but it uses a value-picking operator to choose between actions. An `if`/`else` states that intent more clearly.
      - text: '`const label = a ? b ? "x" : "y" : c ? "z" : "w";`'
        why: Nested ternaries are legal but hard to read. Use an `if`/`else if` chain once there are more than two outcomes.
    answer: 0
---

Pocket can add up what you spent. Now it should tell you how you are doing: fine, getting close to your budget, or over it. That means running different code depending on the data, which is what conditions are for.

## if, else if, else

An `if` statement runs a block of code only when its condition is true:

```js run
const budgetCents = 2000;
const spentCents = 1750;

if (spentCents > budgetCents) {
  console.log("Over budget");
} else if (spentCents >= budgetCents * 0.8) {
  console.log("Close to your budget");
} else {
  console.log("On track");
}
```

The engine evaluates the first condition, `1750 > 2000`, gets `false`, and moves on. The second, `1750 >= 1600`, is `true`, so that block runs, and **the rest of the chain is skipped**. The `else` block runs only when every condition above it was false. At most one block in a chain ever runs.

:::figure An if chain stops at the first true condition
<svg viewBox="0 0 640 260" role="img" aria-labelledby="t1">
  <title id="t1">Flow of the budget check: first test spent greater than budget; if yes print Over budget. If no, test spent at least 80 percent of budget; if yes print Close. If no, print On track.</title>
  <rect class="d-box-accent" x="20" y="30" width="200" height="50" rx="10"/>
  <text class="d-code" x="120" y="60" text-anchor="middle">spent &gt; budget?</text>
  <rect class="d-box-accent" x="20" y="120" width="200" height="50" rx="10"/>
  <text class="d-code" x="120" y="150" text-anchor="middle">spent ≥ 80%?</text>
  <rect class="d-box-success" x="20" y="205" width="200" height="44" rx="10"/>
  <text class="d-label" x="120" y="232" text-anchor="middle">"On track"</text>
  <rect class="d-box-warn" x="400" y="30" width="200" height="50" rx="10"/>
  <text class="d-label" x="500" y="60" text-anchor="middle">"Over budget"</text>
  <rect class="d-box-warn" x="400" y="120" width="200" height="50" rx="10"/>
  <text class="d-label" x="500" y="150" text-anchor="middle">"Close"</text>
  <path class="d-arrow" d="M220 55 L396 55" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="308" y="46" text-anchor="middle">true: stop</text>
  <path class="d-arrow" d="M220 145 L396 145" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="308" y="136" text-anchor="middle">true: stop</text>
  <path class="d-arrow" d="M120 80 L120 116" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="160" y="103">false</text>
  <path class="d-arrow" d="M120 170 L120 201" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="160" y="192">false</text>
</svg>
:::

Because the first true condition wins, **order matters**. Put the narrowest case first. If you checked "at least 80%" before "over budget", an over-budget month would also be at least 80%, and you would never see the "Over budget" message. The quiz below has exactly that bug.

The curly braces mark a **block**, a group of statements that run together. For a one-line body the braces are technically optional, but always write them: adding a second line later without braces is a classic bug where only the first line is conditional.

## Combining conditions

Three **logical operators** let you build bigger conditions:

- `a && b` (and) is true only when both are true.
- `a || b` (or) is true when at least one is true.
- `!a` (not) flips true to false and back.

```js run
const amountCents = 12500;
const category = "travel";
const isWeekend = false;

if (amountCents > 10000 && category !== "rent") {
  console.log("Big purchase: ask yourself twice");
}
if (category === "food" || category === "travel") {
  console.log("Flexible spending");
}
if (!isWeekend) {
  console.log("Weekday");
}
```

`&&` is evaluated before `||`, just as `*` is before `+`. When you mix them, add parentheses so nobody, including future you, has to remember that.

## One value, many fixed options: switch

When you compare a single value against a list of exact options, such as a category, a chain of `else if (category === …)` gets repetitive. The `switch` statement is built for that case:

```js run
const category = "travel";
let monthlyLimit;

switch (category) {
  case "food":
    monthlyLimit = 40000;
    break;
  case "travel":
  case "fun":
    monthlyLimit = 15000;
    break;
  default:
    monthlyLimit = 10000;
}
console.log(monthlyLimit);
```

`switch` compares with `===`, jumps to the first matching `case`, and runs from there **until it reaches a `break`**. Forget a `break` and execution "falls through" into the next case, which is a frequent bug. Sometimes it is deliberate, as with `"travel"` and `"fun"` sharing one limit above. `default` runs when nothing matches, like a final `else`. For two or three conditions, or anything that is not a simple equality check, stay with `if`.

## The ternary: choosing a value

Often you do not want to *do* different things, you want to *pick* between two values. The **conditional operator**, usually called the ternary, does that in one expression:

```js run
const spent = 2100;
const budget = 2000;
const status = spent > budget ? "Over budget" : "On track";
console.log(status);
```

Read it as "if `spent > budget`, then `"Over budget"`, otherwise `"On track"`". Because the ternary produces a value, you can store it in a `const` or drop it into a template literal. Use it for two outcomes. For three or more, an `if` chain reads better than nested ternaries.

## Truthy and falsy

A condition does not have to be a boolean. JavaScript accepts any value and converts it: values that count as true are **truthy**, values that count as false are **falsy**. The falsy list is short enough to memorise:

`false`, `0`, `-0`, `0n`, `""` (empty string), `null`, `undefined`, `NaN`.

Everything else is truthy, including some that surprise people: `"0"`, `"false"`, `" "` (a space), and empty lists and objects.

```js run
const note = "";
if (note) {
  console.log("Has a note");
} else {
  console.log("No note");
}
console.log(Boolean("0"), Boolean(0), Boolean(" "));
```

Truthiness makes checks like `if (note)` short and readable for strings, where "empty" and "missing" both mean "nothing to show". It is risky for numbers, where 0 is often a real, valid value.

:::mistake Testing an amount with if (amount)
```js
const amountCents = 0; // a free coffee voucher, recorded on purpose
if (amountCents) {
  console.log("Recorded");
} else {
  console.log("Please enter an amount"); // runs, wrongly
}
```
0 is falsy, so a legitimate zero looks like "nothing entered". Say what you mean: `if (typeof amountCents === "number" && amountCents >= 0)`.
:::

`&&` and `||` also work with non-boolean values: they return one of their operands. `name || "Anonymous"` gives `name` if it is truthy and `"Anonymous"` otherwise, which is a common way to supply defaults. It has the same zero problem, which is why JavaScript added a better operator for defaults, `??`, coming up in section 3.

:::tip Single = inside an if
`if (category = "food")` assigns instead of comparing, so the condition is always the truthy string `"food"`. Comparisons use `===`. Linters such as ESLint flag this; when your editor underlines it, read the warning.
:::

Conditions let Pocket react to one value. Next you will make it handle many values, one after another, with loops.
