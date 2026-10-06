---
summary: Summarise a list into one value with reduce, build per-category totals, and sort numbers, text and objects correctly with a comparator, without the default-sort and mutation traps.
takeaways:
  - "`reduce` walks a list carrying an accumulator; the callback returns the next accumulator, and the last one is the result."
  - Always pass `reduce` an initial value, such as `0` for totals or `{}` for grouping; without one, an empty list throws.
  - Without a comparator, `sort` compares items as strings, so `[450, 1220, 99]` sorts to `[1220, 450, 99]`.
  - A comparator returns a negative number to put `a` first, positive to put `b` first; `(a, b) => a - b` sorts numbers ascending.
  - "`sort` mutates the array in place; use `toSorted` (or sort a copy) when the original must stay as it is."
further:
  - title: Array.prototype.reduce() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  - title: Array.prototype.sort() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  - title: Array.prototype.toSorted() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted
quiz:
  - q: What does `[450, 1220, 99].sort()` return?
    options:
      - text: '`[99, 450, 1220]`'
        why: That needs a numeric comparator. The default sort turns each number into a string and compares the text.
      - text: '`[1220, 450, 99]`'
        why: Correct. As strings, "1220" comes before "450" because "1" comes before "4", and "450" before "99" because "4" comes before "9".
      - text: '`[1220, 99, 450]`'
        why: Text is compared character by character from the left, so "450" sorts before "99".
    answer: 1
  - q: Which comparator sorts expenses from the most expensive to the cheapest?
    options:
      - text: '`(a, b) => a.amount - b.amount`'
        why: This returns a negative number when `a` is cheaper, putting cheaper items first. That is ascending order.
      - text: '`(a, b) => a.amount > b.amount`'
        why: This returns a boolean, not a number. Comparators must return negative, zero or positive; booleans give unreliable results.
      - text: '`(a, b) => b.amount - a.amount`'
        why: Correct. When `b` costs more, the result is positive, so `b` is placed before `a`. Bigger amounts come first.
    answer: 2
  - q: '`[].reduce((sum, e) => sum + e.amount)` is called on an empty list. What happens?'
    options:
      - text: It throws a TypeError, because there is no initial value and no first item to start from.
        why: Correct. Passing an initial value, `reduce(fn, 0)`, makes it return 0 for an empty list instead.
      - text: It returns 0.
        why: Only if you pass 0 as the initial value. Without it, `reduce` has nothing to start the accumulator with.
      - text: It returns `undefined`.
        why: '`reduce` does not quietly return `undefined` here; it throws "Reduce of empty array with no initial value".'
    answer: 0
  - q: You show expenses sorted by amount in one panel and in the order they were added in another. Both panels read the same `expenses` array. What goes wrong with `expenses.sort(byAmount)`?
    options:
      - text: Nothing, because `sort` returns a sorted copy.
        why: '`sort` returns the same array it sorted. It reorders the original in place.'
      - text: The "order added" panel also becomes sorted, because `sort` mutated the shared array.
        why: Correct. Use `expenses.toSorted(byAmount)` or `[...expenses].sort(byAmount)` to sort a copy.
      - text: It throws, because the array is declared with `const`.
        why: '`const` does not prevent changes to the array''s contents, and sorting only rearranges contents.'
    answer: 1
---

Two questions every budgeting app has to answer: "how much did I spend on food?" and "what were my biggest expenses?". The first turns a list into one number per category. The second puts the list in a useful order. JavaScript has a method for each, and each has one famous trap.

## reduce: many values into one

You already know the accumulator pattern: start with a value, update it for each item, use it at the end. `reduce` is that pattern as a method:

```js run
const expenses = [
  { label: "Coffee", amount: 450, category: "food" },
  { label: "Train", amount: 1220, category: "travel" },
  { label: "Lunch", amount: 1350, category: "food" },
];

const total = expenses.reduce((sum, e) => sum + e.amount, 0);
console.log(total);
```

`reduce` takes two arguments: a callback and an **initial value** (here `0`). It calls the callback once per item with the current **accumulator** (`sum`) and the item (`e`). Whatever the callback returns becomes the accumulator for the next call. After the last item, that final accumulator is the result.

:::figure reduce passes the accumulator from one call to the next
<svg viewBox="0 0 680 190" role="img" aria-labelledby="t1">
  <title id="t1">reduce starts with the initial value 0. The first call returns 0 plus 450, which is 450; the second returns 450 plus 1220, which is 1670; the third returns 1670 plus 1350, which is 3020, the final result.</title>
  <rect class="d-box-accent" x="10" y="70" width="80" height="50" rx="10"/>
  <text class="d-code" x="50" y="100" text-anchor="middle">0</text>
  <text class="d-label-muted" x="50" y="146" text-anchor="middle">initial</text>
  <rect class="d-box" x="130" y="60" width="140" height="70" rx="10"/>
  <text class="d-code" x="200" y="90" text-anchor="middle">0 + 450</text>
  <text class="d-label-muted" x="200" y="116" text-anchor="middle">Coffee</text>
  <rect class="d-box" x="310" y="60" width="150" height="70" rx="10"/>
  <text class="d-code" x="385" y="90" text-anchor="middle">450 + 1220</text>
  <text class="d-label-muted" x="385" y="116" text-anchor="middle">Train</text>
  <rect class="d-box" x="500" y="60" width="150" height="70" rx="10"/>
  <text class="d-code" x="575" y="90" text-anchor="middle">1670 + 1350</text>
  <text class="d-label-muted" x="575" y="116" text-anchor="middle">Lunch</text>
  <path class="d-arrow" d="M90 95 L126 95" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M270 95 L306 95" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M460 95 L496 95" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="530" y="150" width="90" height="34" rx="8"/>
  <text class="d-code" x="575" y="172" text-anchor="middle">3020</text>
  <path class="d-arrow" d="M575 130 L575 146" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="200" y="40" text-anchor="middle">returns 450</text>
  <text class="d-label-muted" x="385" y="40" text-anchor="middle">returns 1670</text>
</svg>
:::

Always pass the initial value. Without it, `reduce` uses the first item as the starting accumulator, which here would be a whole expense object rather than a number, and on an empty list it throws `TypeError: Reduce of empty array with no initial value`.

### Grouping: reduce into an object

The accumulator can be anything, including an object. That is how you build per-category totals:

```js run
const expenses = [
  { label: "Coffee", amount: 450, category: "food" },
  { label: "Train", amount: 1220, category: "travel" },
  { label: "Lunch", amount: 1350, category: "food" },
];

const byCategory = expenses.reduce((totals, e) => {
  totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  return totals;
}, {});

console.log(byCategory);
```

For each expense, read the category's running total (or 0 if this is the first time the category appears; the `??` operator gets its own explanation next lesson), add the amount, and store it back with bracket notation, since the property name is in a variable. Then return the same object so the next call receives it.

:::mistake Forgetting to return the accumulator
With braces in the callback, the last line must be `return totals;`. Forget it and the next call receives `undefined` as its accumulator and the callback throws `TypeError: Cannot read properties of undefined` as soon as it reads `totals[e.category]`. When `reduce` misbehaves, check the return first.
:::

When you want the expenses themselves grouped, rather than a total per group, there is a built-in shortcut since 2024: `Object.groupBy(expenses, (e) => e.category)` returns an object whose properties are the categories and whose values are arrays of the matching expenses. It is supported in all current browsers and Node.js, and it reads better than the equivalent `reduce`. Totals still need `reduce` (or a loop over the groups).

`reduce` is powerful, and that is a reason to use it with restraint. If a `map`, `filter` or a short `for...of` says the same thing more plainly, prefer it. Totals and grouping are where `reduce` reads best.

## sort: putting things in order

Sorting looks easy and contains the most famous trap in JavaScript:

```js run
const amounts = [450, 1220, 99];
amounts.sort();
console.log(amounts);
```

Without instructions, `sort` converts every item to a string and orders them as text, like words in a dictionary. As text, "1220" comes before "450" because the character "1" comes before "4". That is fine for words and wrong for numbers.

The fix is a **comparator**: a function that receives two items, `a` and `b`, and returns a number that says which comes first.

| Comparator returns | Result |
|---|---|
| a negative number | `a` goes before `b` |
| a positive number | `b` goes before `a` |
| `0` | keep their current order |

For numbers, subtraction produces exactly that:

```js run
const amounts = [450, 1220, 99];
console.log([...amounts].sort((a, b) => a - b));  // ascending
console.log([...amounts].sort((a, b) => b - a));  // descending
```

When `a` is 450 and `b` is 99, `a - b` is positive, so 99 moves first. Flip it to `b - a` for biggest first.

Text needs its own comparison, because `<` compares character codes and puts every uppercase letter before every lowercase one. `localeCompare` compares the way a dictionary in a real language does:

```js run
const labels = ["lunch", "Train", "coffee", "Éclair"];
console.log(labels.toSorted((a, b) => a.localeCompare(b)));
```

Objects are sorted by one of their properties, using the same patterns: `(a, b) => b.amount - a.amount` for most expensive first, `(a, b) => a.label.localeCompare(b.label)` for alphabetical.

### sort changes the original

`sort` rearranges the array **in place** and returns that same array. If other code is reading the list, perhaps to show expenses in the order they were added, it is now sorted too. That is why the examples above sort a copy, `[...amounts]`. The newer `toSorted` method (part of JavaScript since 2023 and supported by all current browsers) returns a sorted copy directly, so you do not have to remember the copy step:

```js run
const expenses = [
  { label: "Coffee", amount: 450 },
  { label: "Train", amount: 1220 },
  { label: "Lunch", amount: 1350 },
];
const biggestFirst = expenses.toSorted((a, b) => b.amount - a.amount);
console.log(biggestFirst.map((e) => e.label), expenses.map((e) => e.label));
```

:::tip Default to non-mutating
In this course's code, and in most modern codebases, the default is to produce new arrays: `map`, `filter`, `toSorted`, spread. Reach for mutating methods when you own the array and nobody else reads it. It removes a whole category of "who changed my data?" bugs.
:::

Next you deal with data that is not there at all: missing properties, empty values, and two collections, Map and Set, built for lookups and uniqueness.
