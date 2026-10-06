---
summary: Read possibly-missing data safely with optional chaining and nullish coalescing, and choose Map for lookups and counts and Set for unique values.
takeaways:
  - "Reading a property of `undefined` or `null` throws a TypeError; `?.` stops and returns `undefined` instead."
  - "`??` supplies a default only for `null` and `undefined`, so real values like `0` and `\"\"` survive, unlike with `||`."
  - Use `?.` only where data is genuinely optional; spreading it everywhere hides real bugs.
  - A Map stores key-value pairs with any type of key, keeps insertion order, and has `get`, `set`, `has` and `size`.
  - A Set stores each value at most once, so `[...new Set(list)]` removes duplicates.
further:
  - title: Optional chaining (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  - title: Nullish coalescing operator (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
  - title: Map (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  - title: Set (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
quiz:
  - q: 'An expense may or may not have a `receipt` object. Which expression reads the receipt''s `url` without ever throwing?'
    options:
      - text: '`expense.receipt.url`'
        why: When `receipt` is `undefined`, reading `.url` from it throws "Cannot read properties of undefined".
      - text: '`expense?.receipt.url`'
        why: The `?.` protects against `expense` being missing, but `receipt` is the optional part here, and `.url` on it still throws.
      - text: '`expense.receipt?.url`'
        why: Correct. If `receipt` is `null` or `undefined`, the whole expression stops and evaluates to `undefined`.
    answer: 2
  - q: 'A user''s saved tip percentage is `0`. What does `const tip = saved.tip ?? 15;` give?'
    options:
      - text: '`0`'
        why: Correct. `??` only falls back for `null` and `undefined`, and 0 is neither.
      - text: '`15`'
        why: That is what `||` would give, because 0 is falsy. Avoiding exactly that is why `??` exists.
      - text: '`undefined`'
        why: The left side has a real value, 0, so `??` returns it.
    answer: 0
  - q: You need to count how many expenses each category has, and later list categories in the order they first appeared. Which fits best?
    options:
      - text: An array of category names, using `indexOf` to find each one.
        why: Searching an array for every expense gets slow and the counts need a second array kept in sync.
      - text: A Set of category names.
        why: A Set records that a value exists, but it cannot store a count next to it.
      - text: A Map from category to count.
        why: Correct. `get`/`set` update counts directly, and a Map remembers insertion order when you loop over it.
      - text: A string with categories joined by commas.
        why: Strings are immutable and must be split and searched every time; they are not built for lookups.
    answer: 2
  - q: 'What does `new Set(["food", "travel", "food", "fun"]).size` return?'
    options:
      - text: '`4`'
        why: A Set ignores values it already contains, so the second "food" is not added.
      - text: '`3`'
        why: Correct. The Set holds "food", "travel" and "fun", each once.
      - text: '`2`'
        why: Only the duplicate "food" is dropped; "travel" and "fun" each appear once and both stay.
    answer: 1
---

Real data has holes. Some expenses have a note and some do not. Some have a receipt attached. A setting the user never changed is not saved at all. Pocket must handle all of these without crashing, and without mistaking "nothing" for a real value such as zero.

## The error you will see most

Reading a property of an object that is not there is fine; you get `undefined`. Reading a property **of `undefined`** is not:

```js run
const expense = { label: "Coffee", amount: 450 };
console.log(expense.receipt);          // undefined: fine

try {
  console.log(expense.receipt.url);    // reading .url of undefined
} catch (error) {
  console.log(error.message);
}
```

`TypeError: Cannot read properties of undefined (reading 'url')` is probably the most common error in all of JavaScript. (The `try`/`catch` here only lets the example keep running so you can read the message; section 5 explains it properly.) The message tells you exactly what happened: something before `.url` was `undefined`.

Before reaching for a fix, remember the difference between the two "empty" values. `undefined` usually means "never set": a missing property, a parameter nobody passed, a variable without a value. `null` is set on purpose to mean "deliberately empty". Pocket might store `receipt: null` for an expense where the user chose not to attach one.

## Optional chaining: ?.

The `?.` operator reads a property only if the thing on its left is not `null` or `undefined`. If it is, the whole expression stops and gives `undefined` instead of throwing:

```js run
const withReceipt = { label: "Train", receipt: { url: "/r/88.png" } };
const withoutReceipt = { label: "Coffee" };

console.log(withReceipt.receipt?.url);
console.log(withoutReceipt.receipt?.url);
console.log(withoutReceipt.tags?.[0]);          // works with brackets
console.log(withoutReceipt.format?.());         // and with calls
```

Put `?.` right after the part that may be missing. In `expense.receipt?.url`, you are saying "`expense` must exist, `receipt` might not".

:::mistake Sprinkling ?. everywhere
`a?.b?.c?.d` "fixes" every crash, and that is the problem. If `expense` itself should always exist and suddenly does not, you want a loud error pointing at the real bug, not a quiet `undefined` that shows up three screens later as a blank label. Use `?.` only for data that is optional by design.
:::

## Defaults with ??

`?.` gives you `undefined`, and usually you want a fallback value. You met `||` for defaults in section 2, along with its flaw: it falls back for every falsy value, including `0` and `""`. The **nullish coalescing** operator `??` falls back only for `null` and `undefined`:

```js run
const settings = { dailyLimit: 0, nickname: "" };

console.log(settings.dailyLimit || 5000);   // 5000: the user's 0 is lost
console.log(settings.dailyLimit ?? 5000);   // 0: kept
console.log(settings.nickname ?? "friend"); // "": kept
console.log(settings.currency ?? "USD");    // missing: default used
```

Use `??` for defaults. Use `||` only when you really do want empty strings and zeros replaced too. They combine naturally with `?.`:

```js run
const expense = { label: "Coffee" };
const receiptUrl = expense.receipt?.url ?? "No receipt";
console.log(receiptUrl);
```

There is also an assignment form, `settings.currency ??= "USD"`, which sets the property only if it is currently `null` or `undefined`.

## Map: lookups with any key

In the last lesson you used a plain object to total categories. Objects work well for records with known property names. For a collection that grows with data, keyed by values you do not know in advance, JavaScript has a dedicated structure, **Map**:

```js run
const counts = new Map();
for (const category of ["food", "travel", "food", "fun", "food"]) {
  counts.set(category, (counts.get(category) ?? 0) + 1);
}

console.log(counts.get("food"), counts.has("rent"), counts.size);
for (const [category, count] of counts) {
  console.log(`${category}: ${count}`);
}
```

`set(key, value)` stores, `get(key)` reads (or gives `undefined`), `has(key)` checks, `delete(key)` removes and `size` counts entries. A `for...of` loop gives you `[key, value]` pairs in the order they were first added.

Why not always use an object? A Map accepts **any value as a key**, including numbers and objects, where an object turns every key into a string. It has a real `size`. And it has no inherited properties to trip over: an object keyed by user-typed text can collide with built-in names such as `constructor`. A good default: **objects for records with fixed fields, Maps for lookup tables built from data.**

## Set: each value once

A **Set** is a collection where every value appears at most once. Adding a value that is already there does nothing:

```js run
const categories = ["food", "travel", "food", "fun", "travel"];
const unique = new Set(categories);

console.log(unique.size, unique.has("fun"));
unique.add("food");               // already there: no change
console.log([...unique]);         // back to an array, in first-seen order
```

`[...new Set(list)]` is the standard one-line way to remove duplicates from an array. `has` is also much faster than `includes` on a large array, because a Set does not search item by item. Recent versions of JavaScript added set operations such as `union` and `intersection`, available in all current browsers.

:::tip Sets compare objects by reference
A Set (and a Map key) treats two objects as the same only if they are the same object, using the same reference rule as `===`. Two separate `{ label: "Coffee" }` objects are two different entries. Deduplicate objects by an id instead, for example with a Set of `e.id` values.
:::

That completes Pocket's data toolkit: arrays, objects, Maps and Sets, and the operators for missing values. In section 4, all of it goes onto a real web page.
