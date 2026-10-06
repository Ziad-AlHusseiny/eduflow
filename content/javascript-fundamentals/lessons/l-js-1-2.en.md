---
summary: Recognise JavaScript's basic value types, check them with typeof, and store values in variables with const and let, choosing the right one each time.
takeaways:
  - Every value has a type; the basic ones are number, string, boolean, undefined and null, and `typeof` tells you which one you have.
  - A variable is a name that points at a value; the value has a type, the variable does not.
  - Declare with `const` by default and switch to `let` only when the name must point at a different value later.
  - Reassigning a `const` throws a TypeError, and using a name before declaring it throws a ReferenceError.
further:
  - title: JavaScript data types and data structures (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures
  - title: let (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
  - title: const (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
quiz:
  - q: |
      What does this code print?
      ```js
      let total = 10;
      total = total + 5;
      console.log(typeof total, total);
      ```
    options:
      - text: '`number 10`'
        why: The second line computes `10 + 5` and points `total` at the result, so the old value 10 is gone.
      - text: '`string 15`'
        why: Both values are numbers and no quotes are involved, so the result is a number, not text.
      - text: '`number 15`'
        why: Correct. The right side is evaluated first (10 + 5), then `total` is pointed at 15, which is a number.
    answer: 2
  - q: You store the name of the app, `"Pocket"`, which never changes, and the number of expenses entered so far, which grows. Which declarations fit best?
    options:
      - text: '`let` for both, so you never hit an error.'
        why: That works, but it throws away a useful signal. `const` tells the reader, and the engine, that the name never moves.
      - text: '`const` for the app name and `let` for the count.'
        why: Correct. The name is fixed, so `const`; the count is reassigned as it grows, so `let`.
      - text: '`const` for both, and change the count with `count + 1`.'
        why: Writing `count + 1` alone computes a new number but stores it nowhere. Storing it back needs reassignment, which `const` forbids.
      - text: '`var` for both, because it works in every browser.'
        why: '`let` and `const` have worked in every browser for years. `var` has confusing scope rules and is avoided in modern code.'
    answer: 1
  - q: What does `typeof null` return?
    options:
      - text: '`"null"`'
        why: That would be logical, but it is not what JavaScript does. The real answer is a historical bug kept for compatibility.
      - text: '`"undefined"`'
        why: '`undefined` and `null` are two different values with different `typeof` results.'
      - text: '`"object"`'
        why: Correct. It is a bug from the first version of JavaScript that can never be fixed without breaking old websites. To test for null, write `value === null`.
    answer: 2
  - q: 'Which line throws `TypeError: Assignment to constant variable.`?'
    options:
      - text: '`const rate = 5; rate = 6;`'
        why: Correct. `const` creates a name that can never be pointed at another value, so the second statement fails.
      - text: '`let rate = 5; rate = 6;`'
        why: '`let` exists exactly so you can reassign. This runs fine and `rate` ends up as 6.'
      - text: '`const rate = 5; const next = rate + 1;`'
        why: This reads `rate` without changing it and stores the result in a new name. Nothing is reassigned.
    answer: 0
---

Pocket needs to remember things: the app's name, how much you have spent today, whether you are over budget. A program remembers by keeping **values** and giving them **names**. Before you can do anything interesting, you need to know what kinds of values exist and how to name them.

## Values and their types

A value is a single piece of data. Every value has a **type**, which decides what you can do with it. These five cover almost everything you will touch in your first weeks:

| Type | Examples | Used for |
|---|---|---|
| number | `42`, `4.5`, `-3` | amounts, counts, measurements |
| string | `"Coffee"`, `'food'` | any text |
| boolean | `true`, `false` | yes/no answers |
| undefined | `undefined` | "no value has been given yet" |
| null | `null` | "deliberately empty" |

The `typeof` operator tells you the type of any value. Run this and compare each line with the table:

```js run
console.log(typeof 42);
console.log(typeof "Coffee");
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);
```

Four answers match the table. The last one says `"object"`, which is a bug from 1995 that can never be fixed because millions of websites depend on it. When you need to know whether something is `null`, compare it directly: `value === null`.

There are two more basic types, bigint (for huge whole numbers) and symbol (for unique labels), which you will rarely need as a beginner. Everything else, such as lists and records, is an **object**, and section 3 is all about those.

## Naming values with const and let

A **variable** is a name that points at a value. You create one with a **declaration**:

```js run
const appName = "Pocket";
let spentToday = 0;

spentToday = spentToday + 4.5;
spentToday = spentToday + 12;

console.log(appName, "spent today:", spentToday);
```

Read line 4 the way the engine does: first it evaluates the right side, `spentToday + 4.5`, which is `0 + 4.5`, so `4.5`. Then it points the name `spentToday` at that new value. The `=` sign means "point this name at", not "is equal to". That is why `x = x + 1` makes sense in code even though it is nonsense in maths.

:::figure Reassigning a let moves the name to a new value
<svg viewBox="0 0 640 210" role="img" aria-labelledby="t1">
  <title id="t1">The name appName points to the string Pocket and can never move. The name spentToday first points to 0, then 4.5, then 16.5, each reassignment moving the arrow to a new value.</title>
  <rect class="d-box-primary" x="20" y="30" width="150" height="44" rx="10"/>
  <text class="d-code" x="95" y="57" text-anchor="middle">const appName</text>
  <path class="d-arrow" d="M170 52 L250 52" marker-end="url(#arrow)"/>
  <rect class="d-box" x="254" y="30" width="120" height="44" rx="10"/>
  <text class="d-code" x="314" y="57" text-anchor="middle">"Pocket"</text>
  <rect class="d-box-primary" x="20" y="130" width="150" height="44" rx="10"/>
  <text class="d-code" x="95" y="157" text-anchor="middle">let spentToday</text>
  <rect class="d-box" x="254" y="130" width="80" height="44" rx="10"/>
  <text class="d-code" x="294" y="157" text-anchor="middle">0</text>
  <rect class="d-box" x="364" y="130" width="80" height="44" rx="10"/>
  <text class="d-code" x="404" y="157" text-anchor="middle">4.5</text>
  <rect class="d-box-success" x="474" y="130" width="90" height="44" rx="10"/>
  <text class="d-code" x="519" y="157" text-anchor="middle">16.5</text>
  <path class="d-dashed" d="M170 140 L254 140"/>
  <path class="d-dashed" d="M170 148 Q290 110 364 140"/>
  <path class="d-arrow" d="M170 162 Q340 205 474 162" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="520" y="110" text-anchor="middle">current value</text>
</svg>
:::

`const` creates a name that can never be pointed anywhere else. `let` creates one that can. Use this rule: **declare with `const` by default, and change it to `let` only when you find you need to reassign.** Most names in real programs never change, and a `const` tells the next reader that they can stop worrying about it.

You will also see a third keyword, `var`, in older tutorials and Stack Overflow answers. It is the original way to declare variables and has scoping rules that cause bugs (you will see why in the scope lesson). Modern code does not use it.

:::mistake Reassigning a const
```js
const total = 0;
total = total + 4.5; // TypeError: Assignment to constant variable.
```
The program stops at this line. If a value really has to change, declare it with `let`. If you meant to keep the old value and make a new one, give the new one its own name: `const newTotal = total + 4.5;`.
:::

## The value has the type, not the variable

In JavaScript a variable does not have a type of its own. It points at a value, and the value has a type. So a `let` can point at a number now and a string later:

```js run
let note = 12;
console.log(typeof note);
note = "twelve dollars";
console.log(typeof note);
```

This flexibility is called **dynamic typing**. It is convenient, and it is also how many beginner bugs start: a number quietly becomes a string and your sum turns into `"1212"`. The next two lessons show exactly when that happens.

## Names: the rules and the habits

The rules: a name can contain letters, digits, `_` and `$`, cannot start with a digit, and cannot be a reserved word such as `const` or `if`. Names are case-sensitive, so `total` and `Total` are two different variables.

The habits, which every JavaScript codebase follows: write names in **camelCase** (`spentToday`, `monthlyBudget`), and make them say what the value means, not what type it is. `spentToday` beats `num1`; `isOverBudget` beats `flag`. Booleans usually start with `is`, `has` or `can`.

Two errors you will meet while practising:

- `ReferenceError: spent is not defined` means you used a name that was never declared, often a typo.
- `ReferenceError: Cannot access 'spent' before initialization` means you used a `let` or `const` on a line above its declaration. Declare first, use after.

Next lesson you start doing arithmetic with your numbers, and you will find out why `0.1 + 0.2` is not quite `0.3`.
