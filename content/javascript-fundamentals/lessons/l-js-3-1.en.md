---
summary: Create and change arrays, know which methods mutate them, and replace hand-written loops with map, filter, find, some and every to transform and search lists.
takeaways:
  - "`const` stops a name from pointing at a different array, but the array's contents can still change with `push`, `pop` or index assignment."
  - Some methods mutate the array (`push`, `pop`, `splice`, `sort`); others return a new value and leave it untouched (`slice`, `map`, `filter`).
  - "`map` returns a new array of the same length with each item transformed; `filter` returns a new array of only the items that pass a test."
  - "`find` returns the first matching item or `undefined`; `some` and `every` answer yes/no questions about the whole list."
further:
  - title: Array (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
  - title: Array.prototype.map() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
  - title: Array.prototype.filter() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
quiz:
  - q: |
      What does this log?
      ```js
      const amounts = [450, 1220];
      amounts.push(270);
      console.log(amounts.length);
      ```
    options:
      - text: It throws a TypeError, because `amounts` is a `const`.
        why: '`const` only forbids pointing the name at another value. `push` changes the array the name already points at, which is allowed.'
      - text: '`3`'
        why: Correct. `push` adds 270 to the end of the same array, so it now has three items.
      - text: '`2`'
        why: '`push` mutates the array in place; it does not return a copy and leave the original alone.'
    answer: 1
  - q: '`const amounts = [450, -300, 1220];` What does `amounts.find((a) => a > 5000)` return?'
    options:
      - text: '`[]`'
        why: An empty array is what `filter` returns when nothing matches. `find` returns a single item or nothing.
      - text: '`-1`'
        why: '`-1` is what `findIndex` and `indexOf` return for "not found". `find` returns the item itself.'
      - text: '`undefined`'
        why: Correct. `find` returns the first item that passes the test, and `undefined` when none does.
      - text: '`false`'
        why: A boolean answer comes from `some` or `every`. `find` gives you the matching item.
    answer: 2
  - q: |
      What does this log?
      ```js
      const out = [450, 1220].map((c) => {
        c / 100;
      });
      console.log(out);
      ```
    options:
      - text: '`[undefined, undefined]`'
        why: Correct. The callback has braces but no `return`, so it returns `undefined` for each item, and `map` collects those.
      - text: '`[4.5, 12.2]`'
        why: That needs `(c) => c / 100` or an explicit `return` inside the braces.
      - text: '`[450, 1220]`'
        why: '`map` always builds its result from what the callback returns, never from the original items.'
    answer: 0
  - q: You need to know whether every expense in a list has a category. Which method fits?
    options:
      - text: '`filter`'
        why: '`filter` would give you a new array, and you would still have to compare lengths. `every` answers the question directly.'
      - text: '`some`'
        why: '`some` is true if at least one item passes. You need all of them to pass.'
      - text: '`every`'
        why: Correct. `every` returns true only if the test passes for all items, and stops at the first failure.
      - text: '`map`'
        why: '`map` transforms items; it does not answer a yes/no question about the list.'
    answer: 2
---

Pocket's expenses are a list, and almost every feature is a question about that list. Which ones are refunds? What do they look like formatted as dollars? Is there anything over $100? You can answer all of these with the loops from section 2, but arrays come with methods that answer them in one readable line each.

## Making and changing arrays

An array is an ordered list of values. You saw the basics already: square brackets, positions from 0, and `length`.

```js run
const amounts = [450, 1220, 270];

amounts.push(899);           // add to the end
console.log(amounts);
const last = amounts.pop();  // remove from the end, and get it back
console.log(last, amounts);
amounts[0] = 500;            // replace an item by index
console.log(amounts, amounts.includes(1220), amounts.indexOf(270));
```

Wait: `amounts` is a `const`, yet it changed three times. That is not a contradiction. `const` means the **name** always points at the same array. It says nothing about what is inside the array. `push`, `pop` and index assignment all change the contents of that one array, so they are allowed. Only `amounts = [...]`, pointing the name at a different array, would throw.

:::figure const fixes the arrow, not the contents
<svg viewBox="0 0 640 200" role="img" aria-labelledby="t1">
  <title id="t1">The const name amounts points to one array. push changes the items inside that array, which is allowed. Pointing amounts at a different array is what const forbids.</title>
  <rect class="d-box-primary" x="20" y="70" width="160" height="50" rx="10"/>
  <text class="d-code" x="100" y="100" text-anchor="middle">const amounts</text>
  <path class="d-arrow" d="M180 95 L256 95" marker-end="url(#arrow)"/>
  <rect class="d-box" x="260" y="60" width="360" height="70" rx="12"/>
  <text class="d-code" x="440" y="100" text-anchor="middle">[450, 1220, 270, 899]</text>
  <text class="d-label-muted" x="440" y="160" text-anchor="middle">push / pop / [0] = … change this box: allowed</text>
  <text class="d-label-muted" x="220" y="40" text-anchor="middle">re-pointing this arrow: TypeError</text>
</svg>
:::

This idea, that a name points at a list and several operations change the list itself, is the reason to know which methods **mutate**:

| Changes the array | Returns something new, array untouched |
|---|---|
| `push`, `pop`, `shift`, `unshift` | `slice`, `concat` |
| `splice` | `map`, `filter` |
| `sort`, `reverse` | `toSorted`, `toReversed` |

Mutating is not wrong, but it surprises people when two parts of a program share one array. The methods in the rest of this lesson never mutate, which is a large part of why they are so popular.

The pair that confuses everyone is `slice` and `splice`, one letter apart and opposite in behaviour:

```js run
const amounts = [450, 1220, 270, 899];

const firstTwo = amounts.slice(0, 2);   // copy of indexes 0 and 1
console.log(firstTwo, amounts);         // original untouched

const removed = amounts.splice(1, 1);   // remove 1 item at index 1
console.log(removed, amounts);          // original changed
```

`slice(start, end)` works exactly like the string method of the same name: it copies a piece and leaves the original alone. `splice(start, count)` cuts items out of the array itself and returns what it removed. If you ever need to remove an item without changing the original, use `filter` instead, which you are about to meet.

## map: transform every item

`map` calls a function for each item and collects the return values into a **new array of the same length**:

```js run
const amounts = [450, 1220, 270];
const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

const labels = amounts.map(formatMoney);
console.log(labels);
console.log(amounts);  // unchanged
```

It is the built-in version of the `applyToAll` function you wrote in the functions lesson. Use `map` whenever the question is "turn each X into a Y": cents into dollar strings, dollars into cents, raw form values into clean ones. The callback receives each item in turn and must return the new version of it. Whatever it returns lands at the same position in the result, so the output always has exactly as many items as the input.

## filter: keep only some items

`filter` calls a test function for each item and returns a new array of only the items for which the test returned a truthy value:

```js run
const amounts = [450, -300, 1220, -50, 270];
const spending = amounts.filter((a) => a > 0);
const refunds = amounts.filter((a) => a < 0);
console.log(spending, refunds);
```

The result can be shorter than the original, or even empty, but `filter` never changes the items themselves.

## find, some and every: searching

Four methods answer search questions, and each stops as soon as it knows the answer:

```js run
const amounts = [450, 12000, 1220, 15000];

console.log(amounts.find((a) => a >= 10000));       // first match: 12000
console.log(amounts.findIndex((a) => a >= 10000));  // its position: 1
console.log(amounts.some((a) => a < 0));            // any refunds? false
console.log(amounts.every((a) => a > 0));           // all positive? true
```

`find` returns the item itself, or `undefined` if nothing matches. `findIndex` returns its position, or `-1`. `some` and `every` return booleans: "at least one" and "all of them".

## Chaining: reading a pipeline

Because `filter` and `map` both return arrays, you can call one on the result of the other:

```js run
const amounts = [450, -300, 12000, 1220];
const bigOnes = amounts
  .filter((a) => a >= 1000)
  .map((a) => `$${(a / 100).toFixed(2)}`);
console.log(bigOnes);
```

Read it top to bottom like a recipe: start with all amounts, keep the ones of $10 or more, format them. Each step gets the previous step's output. Putting each step on its own line, starting with the dot, keeps long chains readable.

:::mistake Braces without return in a callback
`amounts.map((a) => { a / 100 })` returns `[undefined, undefined, …]`, and `filter` with the same mistake returns `[]`, because `undefined` is falsy. With braces, the callback needs `return`. For one expression, drop the braces: `amounts.map((a) => a / 100)`.
:::

:::tip forEach is for side effects
Arrays also have `forEach`, which calls a function for each item and returns nothing. Use it, or `for...of`, when you want to *do* something per item, such as logging. Use `map` and `filter` when you want a new array back.
:::

So far the arrays hold plain numbers. Real expenses have a label, an amount and a category together, which calls for objects, the subject of the next lesson.
