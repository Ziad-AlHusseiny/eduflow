---
summary: Write your own functions as declarations and arrow functions, pass arguments in and get results out with return, give parameters default values, and pass functions to other functions.
takeaways:
  - A function packages steps under a name; parameters are the inputs it declares, arguments are the values you pass when you call it.
  - "`return` ends the function and hands a value back; a function without `return` gives back `undefined`."
  - "Arrow functions (`(x) => x * 2`) are a shorter syntax; with curly braces they need an explicit `return`."
  - Default parameters (`symbol = \"$\"`) apply when an argument is missing or `undefined`.
  - Functions are values, so you can store them in variables and pass them to other functions.
further:
  - title: Functions (MDN guide)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
  - title: Arrow function expressions (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  - title: Default parameters (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
quiz:
  - q: |
      What does this log?
      ```js
      const double = (n) => {
        n * 2;
      };
      console.log(double(4));
      ```
    options:
      - text: '`undefined`'
        why: Correct. A block body without `return` returns `undefined`. Write `(n) => n * 2` or add `return n * 2;`.
      - text: '`8`'
        why: The body computes 8 and throws it away. With curly braces, an arrow function needs an explicit `return`.
      - text: '`n * 2`'
        why: JavaScript evaluates expressions; it never returns the source text of one.
    answer: 0
  - q: '`function formatMoney(cents, symbol = "$") { … }` is called as `formatMoney(450, undefined)`. What is `symbol` inside?'
    options:
      - text: '`undefined`, because you passed it explicitly.'
        why: Defaults apply to missing arguments and to arguments that are `undefined`, whether passed or not.
      - text: '`"$"`'
        why: Correct. Passing `undefined` is treated exactly like leaving the argument out, so the default kicks in.
      - text: '`null`'
        why: Nothing here produces `null`. And passing `null` would not trigger the default; only `undefined` does.
    answer: 1
  - q: Which line calls `isBig` from before its definition without an error?
    options:
      - text: '`console.log(isBig(100)); const isBig = (c) => c > 50;`'
        why: '`const` names cannot be used before their line runs, so this throws a ReferenceError.'
      - text: '`console.log(isBig(100)); let isBig = function (c) { return c > 50; };`'
        why: The function value is stored in a `let`, which is not available before its declaration line.
      - text: '`console.log(isBig(100)); function isBig(c) { return c > 50; }`'
        why: Correct. Function declarations are hoisted, meaning the whole function is available from the top of its scope.
    answer: 2
  - q: '`const amounts = [450, 1220];` and `function toDollars(c) { return c / 100; }`. What does `amounts.map(toDollars)` need from you?'
    options:
      - text: Nothing more. `map` calls `toDollars` for each item and collects the results.
        why: Correct. You pass the function itself, without parentheses, and `map` decides when to call it.
      - text: '`amounts.map(toDollars())` with parentheses, so the function runs.'
        why: That calls `toDollars` once immediately with no argument and passes its result, `NaN`, to `map`, which then throws.
      - text: A loop around it, because `map` only works on one value.
        why: '`map` walks the whole array itself. That is the point of passing it a function.'
    answer: 0
---

In the last two lessons you filled in function bodies that were written for you. Now you write your own. A **function** is a named, reusable piece of a program: you write the steps once and run them whenever you need, with different inputs. Pocket formats money in a dozen places; without functions you would copy `(cents / 100).toFixed(2)` into every one, and fix every copy when the format changes.

## Declaring and calling a function

```js run
function formatMoney(cents) {
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

console.log(formatMoney(1220));
console.log(formatMoney(450));
```

The first five lines are a **function declaration**. They do not run anything; they create a function named `formatMoney` and remember its steps. `cents` is a **parameter**, a name for an input that does not have a value yet.

`formatMoney(1220)` is a **call**. The value in the parentheses, `1220`, is an **argument**. When the engine reaches the call, it pauses the current line, jumps into the function with `cents` pointing at 1220, runs the body, and comes back when it hits `return`. The call expression is then replaced by the returned value, `"$12.20"`, which `console.log` prints.

:::figure A call sends arguments in and gets the return value back
<svg viewBox="0 0 660 220" role="img" aria-labelledby="t1">
  <title id="t1">The call formatMoney(1220) passes 1220 into the parameter cents. The function body runs and returns the string $12.20, which replaces the call in the original line.</title>
  <rect class="d-box" x="20" y="30" width="250" height="50" rx="10"/>
  <text class="d-code" x="145" y="60" text-anchor="middle">formatMoney(1220)</text>
  <rect class="d-box-primary" x="380" y="20" width="260" height="170" rx="12"/>
  <text class="d-label-strong" x="510" y="46" text-anchor="middle">function formatMoney</text>
  <text class="d-code" x="510" y="82" text-anchor="middle">cents = 1220</text>
  <text class="d-code" x="510" y="114" text-anchor="middle">dollars = "12.20"</text>
  <text class="d-code" x="510" y="150" text-anchor="middle">return "$12.20"</text>
  <path class="d-arrow" d="M270 50 L376 70" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="322" y="46" text-anchor="middle">argument</text>
  <path class="d-arrow" d="M376 150 L200 150 L160 84" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="270" y="172" text-anchor="middle">return value</text>
</svg>
:::

A function can have several parameters, separated by commas, and the arguments are matched by position: the first argument goes to the first parameter, and so on.

`return` does two things: it decides the result, and it ends the function on the spot. Any line after a `return` in the same block never runs. If a function finishes without reaching a `return`, the call evaluates to `undefined`.

:::mistake Logging instead of returning
```js
function toCents(dollars) {
  console.log(Math.round(dollars * 100)); // shows the answer...
}
const total = toCents(4.1) + toCents(12.2); // ...but returns undefined: NaN
```
`console.log` only displays a value; it gives nothing back to the caller. A function that computes something should `return` it, and the caller decides whether to print it.
:::

## Default parameters

If you call a function with fewer arguments than parameters, the missing ones are `undefined`. A **default parameter** gives them a sensible value instead:

```js run
function formatMoney(cents, symbol = "$") {
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

console.log(formatMoney(1220));
console.log(formatMoney(1220, "€"));
```

The default is used when the argument is missing or `undefined`, and only then. Passing `0`, `""` or `null` counts as a real argument.

## Arrow functions

There is a second, shorter way to write functions, the **arrow function**. It is a value, so you store it in a `const`:

```js run
const toCents = (dollars) => Math.round(dollars * 100);
const isBig = (cents) => cents >= 10000;

console.log(toCents(12.2), isBig(toCents(120)));
```

When the body is a single expression, as here, you leave out the braces and the `return`: the expression's value is returned automatically. When you need several statements, use braces, and then `return` is required again:

```js run
const budgetLeft = (budget, spent) => {
  const left = budget - spent;
  return left > 0 ? left : 0;
};
console.log(budgetLeft(2000, 2200));
```

Which style should you use? Both are everywhere in real code. A common default, and the one this course follows: **declarations for named, top-level functions, arrows for short functions passed to other functions**. One practical difference: declarations are **hoisted**, which means you can call them on a line above where they are written. A `const` arrow function only exists once its line has run.

## Functions are values

In JavaScript a function is a value like a number or a string. You can store it, and you can pass it to another function as an argument. That is the idea behind much of modern JavaScript:

```js run
function applyToAll(amounts, transform) {
  const results = [];
  for (const amount of amounts) {
    results.push(transform(amount));
  }
  return results;
}

const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;
console.log(applyToAll([450, 1220], formatMoney));
console.log(applyToAll([450, 1220], (c) => c * 2));
```

`applyToAll` does not know or care what `transform` does; it calls it once per item and collects the results with `push`, which adds an item to the end of an array. A function passed in like this is called a **callback**. Notice that you pass `formatMoney` without parentheses: you are handing over the function, not calling it. Arrays have this exact helper built in, called `map`, and section 3 puts it to work.

## Small, pure functions

Notice what every helper in this lesson has in common: it uses only its parameters, returns a result, and changes nothing outside itself. A function like that is called **pure**. Give it the same arguments and it returns the same answer every time, so you can test it with one line, reuse it anywhere, and trust it without reading its body again.

Not every function can be pure. Something eventually has to print to the screen or save data. The habit that keeps programs manageable is to do the calculating in small pure functions and keep the printing and saving in a few clearly named places. Pocket follows that split all the way to the final app.

:::tip Name functions after what they return
`formatMoney`, `toCents`, `isBig`, `budgetLeft`: a verb for functions that do or compute something, `is`/`has` for ones that return a boolean. Good names let you read `if (isBig(amount))` like a sentence.
:::

Functions create their own little world of names inside them. How that world relates to the code around it is called scope, and it is the subject of the next lesson.
