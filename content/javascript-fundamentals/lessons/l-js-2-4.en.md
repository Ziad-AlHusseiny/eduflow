---
summary: Predict where a variable can be used (block, function and global scope), avoid the old var pitfalls, and use closures to give functions private, remembered state such as an id counter.
takeaways:
  - "Scope is where a name can be used: `let` and `const` live in the nearest block `{ }`, and lookups go outward, never inward."
  - An inner name with the same name as an outer one shadows it inside the inner scope, which is legal but easy to misread.
  - "`var` ignores blocks and is scoped to the whole function, which causes classic bugs; use `let` and `const`."
  - A closure is a function that keeps access to the variables of the scope where it was created, even after that outer function has returned.
  - Each call of an outer function creates a fresh set of variables, so every closure it returns has its own private state.
further:
  - title: Closures (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  - title: Scope (MDN glossary)
    url: https://developer.mozilla.org/en-US/docs/Glossary/Scope
  - title: var (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var
quiz:
  - q: |
      What happens when this runs?
      ```js
      function check(amount) {
        if (amount > 100) {
          const label = "big";
        }
        return label;
      }
      console.log(check(500));
      ```
    options:
      - text: It logs `big`.
        why: '`label` was declared with `const` inside the `if` block, so it does not exist outside those braces.'
      - text: It logs `undefined`.
        why: '`undefined` is what `var` gives when the `if` is skipped, as in `check(50)`; with `var` and 500 you would even get `big`. With `const`, the name does not exist outside its block, so using it there is an error.'
      - text: 'It throws `ReferenceError: label is not defined`.'
        why: Correct. Block scope means `label` disappears at the closing brace of the `if`, and `return label` cannot see it.
    answer: 2
  - q: |
      What does this log?
      ```js
      function makeCounter() {
        let count = 0;
        return () => {
          count++;
          return count;
        };
      }
      const a = makeCounter();
      const b = makeCounter();
      a(); a();
      console.log(a(), b());
      ```
    options:
      - text: '`3 1`'
        why: Correct. Each call of `makeCounter` creates its own `count`. `a` has been called three times, `b` once.
      - text: '`3 4`'
        why: That would need one shared `count`. Every call of `makeCounter` creates a separate one.
      - text: '`1 1`'
        why: '`count` is not reset on each call of the inner function; the closure keeps the same variable alive between calls.'
      - text: '`0 0`'
        why: Each call of the returned function runs `count++` before returning, so the first call already returns 1.
    answer: 0
  - q: Why is a closure-based id generator safer than a global `let nextId = 1`?
    options:
      - text: Closures run faster than global variables.
        why: Speed is not the point and the difference is negligible. The benefit is control over who can change the value.
      - text: No code outside the generator can read or change the counter, so ids cannot be reset or duplicated by accident.
        why: Correct. The counter lives only in the closure, and the only way to touch it is to call the function you returned.
      - text: Global variables are deleted after each function call.
        why: Globals live as long as the page does. That is exactly the problem, since any code can change them at any time.
    answer: 1
---

Every expense in Pocket needs a unique id so you can edit or delete exactly that one later. The obvious approach is a counter at the top of the file:

```js
let nextId = 1;
function createId() {
  return `exp-${nextId++}`;
}
```

It works, until some other part of the program, perhaps a "reset" feature written months later, sets `nextId = 1` again and you get two expenses called `exp-1`. The counter is visible everywhere, so anything can break it. To protect it you need to understand **scope**: the rules for where a name can be seen.

## Blocks, functions and the global scope

Every pair of curly braces creates a **block**, and `let` and `const` names live in the block where they are declared. Functions create a scope too. Names declared outside every block and function are in the **global scope**, visible everywhere.

```js run
const appName = "Pocket";           // global

function describe(amount) {
  const size = amount > 10000 ? "big" : "small";   // function scope
  if (size === "big") {
    const warning = "Think twice";  // block scope
    console.log(appName, size, warning);
  }
  // console.log(warning) here would throw a ReferenceError
}

describe(12000);
```

When the engine meets a name, it looks in the current scope first. If the name is not there, it looks in the enclosing scope, then the one around that, out to the global scope. If it still has not found it, you get `ReferenceError: … is not defined`. The lookup only goes **outward**: code inside a function can read the global `appName`, but code outside the function can never see `size`.

That is why the `warning` line is commented out. The block that declared `warning` has ended, so the name is gone.

:::figure Scopes nest, and lookups go outward
<svg viewBox="0 0 640 250" role="img" aria-labelledby="t1">
  <title id="t1">Three nested boxes: the global scope holds appName, the describe function scope holds amount and size, and the if block holds warning. An arrow from the innermost block points outward to show that lookups go from inner to outer scopes.</title>
  <rect class="d-box" x="20" y="16" width="600" height="220" rx="14"/>
  <text class="d-label-strong" x="40" y="44">Global</text>
  <text class="d-code" x="470" y="44">appName</text>
  <rect class="d-box-accent" x="50" y="62" width="540" height="156" rx="12"/>
  <text class="d-label-strong" x="70" y="90">function describe</text>
  <text class="d-code" x="410" y="90">amount, size</text>
  <rect class="d-box-primary" x="80" y="110" width="300" height="88" rx="10"/>
  <text class="d-label-strong" x="100" y="138">if block</text>
  <text class="d-code" x="100" y="172">warning</text>
  <path class="d-arrow" d="M380 160 L460 160 L460 102" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M470 102 L520 56" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="520" y="170" text-anchor="middle">look outward</text>
</svg>
:::

If an inner scope declares a name that already exists outside, the inner one **shadows** the outer one: inside the block, the name means the inner variable. It is legal, but two different things with one name make code hard to read, so pick distinct names.

## The trouble with var

Before 2015, JavaScript only had `var`, and `var` ignores blocks: it is visible throughout the whole function it is in. That produces one famous bug. Here the loop schedules three functions to run a moment later with `setTimeout`:

```js run
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 0);
}
```

The `var` loop logs `3` three times, because there is only one `i` for the whole loop, and by the time the functions run it has reached 3. The `let` loop logs 0, 1 and 2, because `let` creates a fresh `j` for each pass and each function keeps its own. Those functions remembering variables is exactly what a closure is.

:::mistake Copying var from old tutorials
Much of the JavaScript on the internet predates `let` and `const`. When you copy a snippet that uses `var`, change it to `const` (or `let` if it is reassigned) and check that nothing outside the block was relying on the leak.
:::

## Closures: functions that remember

A function created inside another function can use the outer function's variables. The surprise is that it keeps that access **after the outer function has returned**:

```js run
function createIdGenerator(prefix) {
  let count = 0;
  return () => {
    count++;
    return `${prefix}-${count}`;
  };
}

const nextExpenseId = createIdGenerator("exp");
const nextCategoryId = createIdGenerator("cat");

console.log(nextExpenseId());
console.log(nextExpenseId());
console.log(nextCategoryId());
console.log(nextExpenseId());
```

Follow the engine. Calling `createIdGenerator("exp")` creates a fresh `prefix` and `count`, builds the arrow function, and returns it. Normally a function's variables vanish when it returns, but the arrow function still refers to `count` and `prefix`, so they stay alive, attached to it. That pairing of a function with the variables it was born next to is a **closure**.

Each call of `createIdGenerator` creates a new, separate set of variables. That is why `nextCategoryId()` starts from 1 and the expense ids carry on from where they were.

Now look at the safety you gained. There is no global `count`. No other code can read it, reset it or set it to a duplicate value. The only way to affect it is to call the function you were given, which can only ever move it forward. This is the standard way to give a function **private state** in JavaScript.

:::why Why closures matter so much
You will rarely write the word "closure" in code, but you will use one every day. Every callback that reads a variable from the surrounding code, every click handler in section 4 that updates a list, every function that remembers a setting, is a closure. When something "remembers" a value, this is the mechanism.
:::

A closure can protect more than a counter. Here is a budget that can only go down through the function you hand out:

```js run
function createBudget(limitCents) {
  let remaining = limitCents;
  return (spentCents) => {
    remaining -= spentCents;
    return remaining;
  };
}

const spend = createBudget(2000);
console.log(spend(450));
console.log(spend(1220));
```

Section 2 is complete: you can make decisions, repeat work, and package it in functions with their own private state. Section 3 turns to data, starting with the list you have been looping over: the array.
