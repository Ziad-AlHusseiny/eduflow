---
summary: Define classes with a constructor, methods, getters and private fields, create independent instances with new, and avoid the classic lost-this bug when passing methods as callbacks.
takeaways:
  - A class is a blueprint; `new ClassName(...)` runs the constructor and returns a new instance with its own data.
  - Methods are shared by all instances, and inside them `this` is the instance the method was called on.
  - "Private fields (`#expenses`) can only be read inside the class body, which protects an object's data the way closures do."
  - "A getter (`get total()`) is read like a property but computed each time, so derived values never go stale."
  - Passing `store.add` as a callback loses `this`; wrap it in an arrow function, `(e) => store.add(e)`.
further:
  - title: Classes (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  - title: Private elements (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
  - title: this (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
quiz:
  - q: |
      What does this log?
      ```js
      class Counter {
        count = 0;
        increment() { this.count++; }
      }
      const a = new Counter();
      const b = new Counter();
      a.increment();
      a.increment();
      console.log(a.count, b.count);
      ```
    options:
      - text: '`2 2`'
        why: Fields are created per instance, so `b` has its own `count` that nobody incremented.
      - text: '`1 1`'
        why: '`increment` was called twice on `a`, and never on `b`.'
      - text: '`0 0`'
        why: '`this.count++` changes the instance it is called on, so `a.count` goes up.'
      - text: '`2 0`'
        why: Correct. Each `new Counter()` creates a separate object with its own `count`; the method is shared, the data is not.
    answer: 3
  - q: '`button.addEventListener("click", store.clear);` makes `clear` throw a TypeError about the private field `#expenses` ("…from an object whose class did not declare it") when the button is clicked. Why?'
    options:
      - text: Class methods cannot be used as event listeners.
        why: They can be, as long as they are called with the right `this`. The problem is how the method is passed.
      - text: The method was passed on its own, so when the browser calls it, `this` is not `store`.
        why: Correct. `this` is decided by how a function is called, and the browser calls a listener with `this` set to the element, here the button. Write `() => store.clear()` so it is called on `store`.
      - text: '`store` was created with `const` and cannot be changed.'
        why: '`const` does not stop an object''s methods from changing its fields. The issue is the lost `this`.'
    answer: 1
  - q: 'An `ExpenseStore` keeps its list in `#expenses`. What does `store.#expenses` written outside the class do?'
    options:
      - text: It is a syntax error; private fields can only be accessed inside the class body.
        why: Correct. The engine enforces privacy, so outside code has to use the public methods.
      - text: It returns the array, because `#` is only a naming convention.
        why: The older `_expenses` convention was only a hint. `#` is real privacy enforced by the language.
      - text: It returns `undefined`.
        why: It does not run at all. Using `#expenses` outside the class is rejected when the code is parsed.
    answer: 0
---

Look at what Pocket's code does with its expenses: a variable holds the array, and a dozen functions each take that array, do something, and return a result. The data and the operations on it are separate, so nothing stops a stray line of code from pushing a malformed expense straight into the array. A **class** bundles data with the functions allowed to work on it, and can make the data itself unreachable from outside.

## Defining a class

```js run
class ExpenseStore {
  #expenses = [];
  #nextNumber = 1;

  constructor(initial = []) {
    for (const expense of initial) {
      this.add(expense);
    }
  }

  add({ label, amount, category = "other" }) {
    const expense = { id: `exp-${this.#nextNumber++}`, label, amount, category };
    this.#expenses.push(expense);
    return expense;
  }

  remove(id) {
    this.#expenses = this.#expenses.filter((e) => e.id !== id);
  }

  get total() {
    return this.#expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  list() {
    return [...this.#expenses];
  }
}

const store = new ExpenseStore([{ label: "Coffee", amount: 450, category: "food" }]);
store.add({ label: "Train", amount: 1220, category: "travel" });
console.log(store.total, store.list().map((e) => e.id));
```

There is a lot here, so take it one piece at a time.

`#expenses = []` declares a **private field**. Every instance gets its own `#expenses`, and the `#` makes it private: only code inside the class body can read or write it. Outside, `store.#expenses` is a syntax error. Anyone who wants to change the list has to go through `add` and `remove`, which guarantee every expense gets an id and a category.

`constructor` is a special method that runs when you write `new ExpenseStore(...)`. Its job is to set the new object up. Here it adds any initial expenses through `add`, so they follow the same rules.

`add`, `remove` and `list` are **methods**. Inside a method, `this` refers to the object the method was called on: in `store.add(...)`, `this` is `store`.

`get total()` is a **getter**. You read it like a property, `store.total`, without parentheses, but it runs code each time. A total stored in a field could go stale when an expense is removed; a getter is always computed from the current data.

`list()` returns a copy, `[...this.#expenses]`, not the array itself. Returning the real array would let callers `push` into it and undo all the protection.

## Instances: one blueprint, many objects

`new` creates a fresh object, runs the constructor with `this` pointing at it, and returns it. Each instance has its own fields; the methods are defined once on the class and shared.

:::figure One class, many instances with their own data
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">The ExpenseStore class defines the methods add, remove, list and the total getter. Two instances, home and work, each have their own private expenses array, and both use the shared methods.</title>
  <rect class="d-box-primary" x="230" y="14" width="200" height="86" rx="12"/>
  <text class="d-label-strong" x="330" y="40" text-anchor="middle">class ExpenseStore</text>
  <text class="d-code" x="330" y="64" text-anchor="middle">add, remove, list</text>
  <text class="d-code" x="330" y="86" text-anchor="middle">get total</text>
  <rect class="d-box" x="40" y="150" width="230" height="64" rx="12"/>
  <text class="d-code" x="155" y="176" text-anchor="middle">home</text>
  <text class="d-label-muted" x="155" y="200" text-anchor="middle">#expenses: 12 items</text>
  <rect class="d-box" x="390" y="150" width="230" height="64" rx="12"/>
  <text class="d-code" x="505" y="176" text-anchor="middle">work</text>
  <text class="d-label-muted" x="505" y="200" text-anchor="middle">#expenses: 3 items</text>
  <path class="d-arrow" d="M290 100 L180 146" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M370 100 L480 146" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="330" y="140" text-anchor="middle">new ExpenseStore()</text>
</svg>
:::

```js run
class ExpenseStore {
  #expenses = [];
  add(expense) { this.#expenses.push(expense); }
  get count() { return this.#expenses.length; }
}

const home = new ExpenseStore();
const work = new ExpenseStore();
home.add({ label: "Groceries", amount: 6400 });
console.log(home.count, work.count);
```

If this reminds you of `createBudget` from the closures lesson, it should. A closure and a class with private fields solve the same problem, data that only certain functions can touch. Closures are lighter for a single function; classes are clearer when several operations share the same data.

## The lost this

`this` is not fixed when you write a method. It is decided each time the function is **called**, by what is to the left of the dot. `store.add(x)` calls `add` with `this` set to `store`. But if you pass the method somewhere on its own, there is no dot when it is eventually called:

```js run
class Greeter {
  name = "Pocket";
  hello() {
    return `Hello from ${this.name}`;
  }
}

const g = new Greeter();
console.log(g.hello());

const detached = g.hello;
try {
  console.log(detached());
} catch (error) {
  console.log("Error:", error.message);
}

const wrapped = () => g.hello();
console.log(wrapped());
```

The first call works because `g` is to the left of the dot. `detached()` is called with nothing to the left of a dot, so inside it `this` is `undefined` (class bodies always run in strict mode), and reading `this.name` throws.

:::mistake Passing a method as a callback
`form.addEventListener("submit", store.add)` and `items.forEach(store.add)` both hit this bug. Wrap the call in an arrow function, `(e) => store.add(e)`, so the method is called on the right object. Arrow functions do not have their own `this`, which is exactly why they are safe here.
:::

Classes can also build on other classes with `extends`, inheriting their methods and adding new ones. You will use that once, in the next lesson, to make your own error type. Beyond that, a good default for application code is to prefer small classes and plain functions over deep inheritance chains, which tend to be hard to change.

:::tip Do you need a class at all?
Pocket's money helpers are better as plain functions: they hold no data. Reach for a class when you have state plus rules about changing it, like the store. Many excellent JavaScript codebases use few classes; knowing how to read them is non-negotiable, because browser APIs and libraries are full of them.
:::

Your store now refuses bad changes from outside. The next lesson is about what happens when something goes wrong anyway: errors, how to throw and catch them on purpose, and how to hunt down bugs with the browser DevTools.
