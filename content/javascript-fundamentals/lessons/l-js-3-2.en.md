---
summary: Model real records as objects, read and update their properties, understand that objects are shared by reference, and copy, update and unpack them with spread and destructuring.
takeaways:
  - An object groups named values (properties); read them with dot notation, or with brackets when the property name is in a variable.
  - Objects and arrays are shared by reference, so two names can point at the same object and a change through one is visible through the other.
  - "Spread (`{ ...expense, amount: 500 }`, `[...list, item]`) makes a new, shallow copy, which is how you update data without mutating it."
  - "Destructuring (`const { label, amount } = expense`) pulls properties into variables, and works in function parameters with defaults."
further:
  - title: Working with objects (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
  - title: Destructuring (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring
  - title: Spread syntax (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
quiz:
  - q: |
      What does this log?
      ```js
      const a = { label: "Coffee", amount: 450 };
      const b = a;
      b.amount = 500;
      console.log(a.amount);
      ```
    options:
      - text: '`500`, because `a` and `b` point at the same object.'
        why: Correct. There is only one object. Changing it through `b` is visible through `a`.
      - text: '`450`, because `b` is a copy of `a`.'
        why: Assigning an object to another name copies the reference, not the object. Both names point at the same object.
      - text: A TypeError, because `a` is a `const`.
        why: '`const` stops `a` from being re-pointed. Changing a property of the object it points at is allowed.'
    answer: 0
  - q: '`const updated = { ...expense, amount: 500 };` What is true afterwards?'
    options:
      - text: '`expense.amount` is now 500.'
        why: Spread builds a brand-new object. The original is not touched.
      - text: '`updated` is the same object as `expense`.'
        why: '`{ ... }` always creates a new object, so `updated === expense` is false.'
      - text: '`updated` has every property of `expense`, with `amount` replaced by 500.'
        why: Correct. Properties are copied in order, and a later `amount` overwrites the copied one.
    answer: 2
  - q: 'Given `const expense = { label: "Bus", amount: 270 };`, what does `const { label, category = "other" } = expense;` give you?'
    options:
      - text: '`label` is "Bus" and `category` is "other".'
        why: Correct. `label` is copied from the object, and `category` does not exist on it, so the default is used.
      - text: '`label` is "Bus" and `category` is undefined.'
        why: That would be true without the default. `= "other"` applies when the property is missing.
      - text: It throws, because `category` is not a property of `expense`.
        why: Destructuring a missing property never throws; it gives `undefined`, or the default if you supplied one.
    answer: 0
  - q: 'You have `const key = "category";`. How do you read `expense.category` using `key`?'
    options:
      - text: '`expense.key`'
        why: Dot notation uses the literal name after the dot, so this looks for a property called "key".
      - text: '`expense[key]`'
        why: Correct. Brackets evaluate the expression inside, so `expense[key]` reads the property named by the value of `key`.
      - text: '`expense["key"]`'
        why: The quotes make it the literal string "key", the same as `expense.key`.
    answer: 1
---

Until now an expense in Pocket was just a number. A real expense has several facts that belong together: what it was, how much, which category, when. Keeping those in separate arrays (`labels[2]`, `amounts[2]`, `categories[2]`) works until one array gets sorted and the others do not. You need one value that holds them all: an **object**.

## Objects: named values together

An object is written with curly braces and contains **properties**, each a name and a value:

```js run
const expense = {
  id: "exp-1",
  label: "Coffee",
  amount: 450,
  category: "food",
};

console.log(expense.label);       // dot notation
console.log(expense["amount"]);   // bracket notation
console.log(expense.note);        // missing property: undefined
```

Dot notation is the everyday way to read a property. Brackets do the same job, but evaluate whatever is inside them, which you need when the property name is in a variable: `const field = "category"; expense[field]`. Reading a property that does not exist gives `undefined`, not an error.

You can add, change and remove properties after creation:

```js run
const expense = { label: "Coffee", amount: 450 };
expense.category = "food";   // add
expense.amount = 500;        // change
delete expense.category;     // remove
console.log(expense);
console.log(Object.keys(expense), Object.values(expense));
```

When a variable already has the name you want for a property, you can write it once. `{ label, amount }` is shorthand for `{ label: label, amount: amount }`, and you will see it constantly in real code:

```js run
const label = "Bus";
const amount = 270;
const expense = { label, amount, category: "travel" };
console.log(expense);
```

`Object.keys` and `Object.values` give you arrays of the names and the values, and `Object.entries` gives pairs, so `for (const [key, value] of Object.entries(expense))` loops over every property.

Pocket's data is now an **array of objects**, the most common shape of data in JavaScript, and everything from the last lesson still applies:

```js run
const expenses = [
  { id: "exp-1", label: "Coffee", amount: 450, category: "food" },
  { id: "exp-2", label: "Train", amount: 1220, category: "travel" },
  { id: "exp-3", label: "Lunch", amount: 1350, category: "food" },
];
const food = expenses.filter((e) => e.category === "food");
console.log(food.map((e) => e.label));
```

## References: two names, one object

Here is the most important thing to understand about objects and arrays. A variable does not hold the object; it holds a **reference** to it, like an address. Copying the variable copies the address:

```js run
const original = { label: "Coffee", amount: 450 };
const alias = original;
alias.amount = 999;
console.log(original.amount);       // 999
console.log(alias === original);    // true: the same object
console.log({ a: 1 } === { a: 1 }); // false: two different objects
```

:::figure Assigning copies the reference; spread creates a new object
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">The names original and alias both point to the same object, so a change through alias shows through original. The name copy points to a separate new object created with spread.</title>
  <rect class="d-box-primary" x="20" y="30" width="130" height="44" rx="10"/>
  <text class="d-code" x="85" y="57" text-anchor="middle">original</text>
  <rect class="d-box-primary" x="20" y="100" width="130" height="44" rx="10"/>
  <text class="d-code" x="85" y="127" text-anchor="middle">alias</text>
  <rect class="d-box" x="260" y="50" width="260" height="70" rx="12"/>
  <text class="d-code" x="390" y="90" text-anchor="middle">{ label: "Coffee", amount: 999 }</text>
  <path class="d-arrow" d="M150 52 L256 75" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M150 122 L256 98" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="20" y="170" width="130" height="44" rx="10"/>
  <text class="d-code" x="85" y="197" text-anchor="middle">copy</text>
  <rect class="d-box-success" x="260" y="160" width="260" height="60" rx="12"/>
  <text class="d-code" x="390" y="195" text-anchor="middle">{ label: "Coffee", amount: 450 }</text>
  <path class="d-arrow" d="M150 192 L256 192" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="600" y="90" text-anchor="middle">one object</text>
  <text class="d-label-muted" x="600" y="195" text-anchor="middle">a new one</text>
</svg>
:::

`===` on objects compares references, not contents. Two objects that look identical are still two different objects.

This matters because functions receive references too. If a function changes an object it was given, the caller's object changes:

```js run
function applyDiscount(expense) {
  expense.amount = Math.round(expense.amount * 0.9);
  return expense;
}

const lunch = { label: "Lunch", amount: 1350 };
const discounted = applyDiscount(lunch);
console.log(discounted.amount, lunch.amount); // both 1215
```

The function looks as if it returns a discounted version, but it quietly rewrote the original as well. Somewhere else, a total that included `lunch` is now wrong, and nothing on screen says why. That is how bugs like "I only displayed the expenses, why did their amounts change?" happen. The fix is to build a new object instead of changing the one you were given, and spread makes that easy.

## Spread: copy and update without mutating

**Spread syntax**, three dots, copies all the properties of an object (or items of an array) into a new one:

```js run
const expense = { id: "exp-1", label: "Coffee", amount: 450 };
const updated = { ...expense, amount: 500 };
console.log(expense.amount, updated.amount);

const list = [expense];
const longer = [...list, { id: "exp-2", label: "Bus", amount: 270 }];
console.log(list.length, longer.length);
```

In `{ ...expense, amount: 500 }`, properties are copied in order and the later `amount` overwrites the copied one. You get a new object, and the original is untouched. Combined with `map`, this is the standard way to change one item in a list without mutating anything:

```js run
const expenses = [
  { id: "exp-1", label: "Coffee", amount: 450 },
  { id: "exp-2", label: "Bus", amount: 270 },
];
const fixed = expenses.map((e) => (e.id === "exp-2" ? { ...e, amount: 300 } : e));
console.log(fixed[1].amount, expenses[1].amount);
```

:::mistake Expecting spread to copy deeply
Spread is a **shallow** copy: it copies the top-level properties. If a property is itself an object, such as `tags: ["work"]`, the copy and the original share that inner array, and pushing to one changes both. When you need a fully independent copy of nested data, use `structuredClone(value)`.
:::

## Destructuring: unpacking into variables

**Destructuring** pulls properties out of an object into variables of the same name:

```js run
const expense = { label: "Train", amount: 1220, category: "travel" };
const { label, amount, note = "no note" } = expense;
console.log(label, amount, note);

const [first, second] = ["food", "travel", "fun"];
console.log(first, second);
```

The `= "no note"` is a default, used when the property is missing or `undefined`. For arrays, destructuring goes by position instead of name.

Destructuring is most useful in function parameters, where it documents exactly which properties a function needs:

```js run
function describe({ label, amount, category = "other" }) {
  return `${label}: $${(amount / 100).toFixed(2)} (${category})`;
}
console.log(describe({ label: "Train", amount: 1220 }));
```

Compare it with the version without destructuring, which repeats `expense.` on every line and hides which properties matter until you read the whole body. With destructuring, the first line of the function is its contract: give me something with a label, an amount, and optionally a category. Callers can pass a full expense object with ten other properties; the function simply ignores the rest.

The `...` also works in reverse, as **rest**: `const { id, ...details } = expense` puts `id` in its own variable and every other property in a new object called `details`. It is a neat way to drop a property without mutating the original: everything you did not name ends up in the new object.

Pocket now has realistic data. Next you summarise it: totals per category, and lists sorted by amount.
