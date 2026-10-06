---
summary: Repeat work with for…of, the counting for loop and while, stop early with break and continue, and use the accumulator pattern to total a list of expenses.
takeaways:
  - "`for...of` visits every item of a list in order and is the default loop for \"do this for each expense\"."
  - The counting `for` loop gives you an index, which you need when position matters; valid indexes run from 0 to `length - 1`.
  - "`while` repeats as long as a condition is true, so something inside the loop must eventually make it false."
  - The accumulator pattern (start at 0, add inside the loop, use after the loop) turns a list into a single total.
further:
  - title: Loops and iteration (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration
  - title: for...of (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
quiz:
  - q: |
      What does this log?
      ```js
      const amounts = [400, 900, 250];
      let total = 0;
      for (const a of amounts) {
        total = a;
      }
      console.log(total);
      ```
    options:
      - text: '`1550`'
        why: That would need `total += a`. Plain `=` replaces the total with each amount instead of adding to it.
      - text: '`250`'
        why: Correct. Each pass overwrites `total`, so it ends holding the last amount.
      - text: '`400`'
        why: The loop keeps going after the first item, and every pass reassigns `total`.
      - text: '`0`'
        why: '`total` is reassigned inside the loop, so it no longer holds its starting value.'
    answer: 1
  - q: '`const days = ["Mon", "Tue", "Wed"];` Which loop throws no error but logs `undefined` once at the end?'
    options:
      - text: '`for (let i = 0; i < days.length; i++) console.log(days[i]);`'
        why: This is the correct counting loop. It stops after index 2, the last valid index.
      - text: '`for (const d of days) console.log(d);`'
        why: '`for...of` visits exactly the items that exist, so it cannot run past the end.'
      - text: '`for (let i = 0; i <= days.length; i++) console.log(days[i]);`'
        why: Correct. `<=` lets `i` reach 3, and `days[3]` does not exist, so it logs `undefined`. This off-by-one mistake is extremely common.
    answer: 2
  - q: When is `while` a better fit than `for...of`?
    options:
      - text: When you do not know in advance how many repetitions you need, only when to stop.
        why: Correct. For example, "keep subtracting the daily spend until the balance runs out" has no list to walk through.
      - text: When you want to visit every item in a list.
        why: That is exactly the job of `for...of`, which cannot go past the end or forget to advance.
      - text: When the loop body has more than one line.
        why: Every loop can have a body of any length. The choice depends on what controls the repetition.
    answer: 0
  - q: Inside a loop over expenses, what does `continue` do?
    options:
      - text: Ends the whole loop immediately.
        why: That is `break`. `continue` only skips the rest of the current pass.
      - text: Skips the rest of the current pass and moves on to the next item.
        why: Correct. It is handy for ignoring items that do not apply, such as refunds, without nesting the rest of the body in an `if`.
      - text: Restarts the loop from the first item.
        why: Loops never rewind on their own. `continue` moves forward to the next item.
    answer: 1
---

So far every Pocket example added up a fixed number of expenses: `coffee + lunch + bus`. Real spending is a list that grows every day. You cannot write `+` for items you do not have yet. You need a way to say "do this for each one", and that is a **loop**.

## A list to loop over

Lists get a full lesson in section 3, but you need the basics now. A list of values in square brackets is an **array**:

```js run
const amounts = [450, 1220, 270, 899];
console.log(amounts.length);  // how many items
console.log(amounts[0]);      // the first item: positions start at 0
```

## for...of: do this for each item

`for...of` runs its block once per item, with a name of your choosing pointing at the current item:

```js run
const amounts = [450, 1220, 270, 899];

let total = 0;
for (const amount of amounts) {
  total += amount;
}
console.log(total);
```

Walk through it the way the engine does. `total` starts at 0. First pass: `amount` is 450, so `total` becomes 450. Second pass: `amount` is 1220, `total` becomes 1670. Then 1940, then 2839. There are no items left, so the loop ends and the next line logs the total.

This shape is called the **accumulator pattern**: declare a result before the loop, update it inside, use it after. It is behind totals, counts, maximums and almost every summary you will write. The `const amount` is fine even though it changes every pass: each pass creates a fresh `amount`, it is never reassigned.

`for...of` also works on strings, one character at a time: `for (const ch of "Pocket")`.

## The counting for loop

Sometimes you need the **position** as well as the item, for example to print "1. Coffee". The classic `for` loop has three parts in its parentheses:

```js run
const labels = ["Coffee", "Lunch", "Bus"];

for (let i = 0; i < labels.length; i++) {
  console.log(`${i + 1}. ${labels[i]}`);
}
```

:::figure The three parts of a for loop and the order they run in
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">A for loop runs the start part once, then repeatedly checks the condition, runs the body, and runs the update, until the condition is false and the loop exits.</title>
  <rect class="d-box-primary" x="20" y="90" width="140" height="50" rx="10"/>
  <text class="d-code" x="90" y="120" text-anchor="middle">let i = 0</text>
  <rect class="d-box-accent" x="220" y="90" width="190" height="50" rx="10"/>
  <text class="d-code" x="315" y="120" text-anchor="middle">i &lt; labels.length?</text>
  <rect class="d-box" x="470" y="20" width="170" height="50" rx="10"/>
  <text class="d-label" x="555" y="50" text-anchor="middle">run the body</text>
  <rect class="d-box" x="470" y="160" width="170" height="50" rx="10"/>
  <text class="d-code" x="555" y="190" text-anchor="middle">i++</text>
  <rect class="d-box-success" x="220" y="175" width="120" height="40" rx="10"/>
  <text class="d-label" x="280" y="200" text-anchor="middle">exit</text>
  <path class="d-arrow" d="M160 115 L216 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 95 L466 55" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="425" y="62" text-anchor="middle">true</text>
  <path class="d-arrow" d="M555 70 L555 156" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M470 180 L414 135" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M280 140 L280 171" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="312" y="162" text-anchor="middle">false</text>
  <text class="d-label-muted" x="90" y="160" text-anchor="middle">runs once</text>
</svg>
:::

The start, `let i = 0`, runs once. Then, before every pass, the condition `i < labels.length` is checked; if it is true the body runs, then the update `i++` adds one to `i`. When the condition becomes false the loop ends. With three labels, `i` takes the values 0, 1 and 2, exactly the valid indexes.

:::mistake Off by one
`i <= labels.length` runs one extra pass with `i` equal to 3, and `labels[3]` is `undefined`. Valid indexes go from 0 to `length - 1`, so the condition is `i < length`. When you do not need the index, use `for...of` and this mistake cannot happen.
:::

## while: repeat until something changes

A `while` loop has only a condition. It is for situations where you know when to stop but not how many passes it will take. How many days can you keep buying a $4.50 coffee on a $20 budget?

```js run
let balance = 2000;
const coffee = 450;
let days = 0;

while (balance >= coffee) {
  balance -= coffee;
  days++;
}
console.log(`${days} coffees, ${balance} cents left`);
```

Each pass reduces `balance`, so the condition eventually becomes false. If nothing in the body moved toward the exit, for example if you forgot `balance -= coffee`, the condition would stay true forever. That is an **infinite loop**: the page freezes and the browser eventually offers to stop the script. When a tab hangs while you are practising, look for a loop whose condition never changes.

## break and continue

Two keywords change a loop's flow from inside:

- `break` ends the loop immediately.
- `continue` skips the rest of this pass and moves to the next one.

```js run
const amounts = [450, -300, 1220, 270, 899];
const budget = 2000;
let running = 0;

for (const amount of amounts) {
  if (amount < 0) {
    continue; // a refund: not spending, skip it
  }
  running += amount;
  if (running > budget) {
    console.log(`Budget passed at an expense of ${amount}`);
    break; // no need to look further
  }
}
console.log(running);
```

Trace it: 450 is added, then -300 is skipped, 1220 brings the total to 1670, 270 brings it to 1940, and 899 pushes it to 2839, which passes the budget, so the message is logged and the loop stops.

## Seeing what a loop does

Loops are where beginners most often lose track of what the program is doing, because the same lines run many times with different values. The cure is to make the loop show you. Put a `console.log` at the top of the body that prints every variable involved:

```js run
const amounts = [450, 1220, 270];
let total = 0;
for (let i = 0; i < amounts.length; i++) {
  console.log({ i, amount: amounts[i], totalBefore: total });
  total += amounts[i];
}
console.log("final", total);
```

Each pass prints one line, so you can compare what actually happened with what you expected and find the first pass where they differ. That pass is where your bug is. Wrapping the values in `{ }` prints them with their names, which saves you guessing which number is which. Professional developers do exactly this every day; in section 5 you will learn to do it with the DevTools debugger as well.

:::tip Pick the loop by what controls it
Walking through a list: `for...of`. Need the position too: the counting `for`. Stopping depends on a changing condition, not a list: `while`. In section 3 you will meet array methods like `map` and `filter`, which replace many hand-written loops, but they are built on exactly these ideas.
:::

Loops and conditions together already let you write real logic. To reuse that logic instead of copying it, you need your own functions, which is the next lesson.
