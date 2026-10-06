---
summary: Write generic functions whose type parameters link inputs to outputs, constrain them with extends, and recognise generics that are really unchecked casts.
takeaways:
  - A type parameter earns its place when it appears at least twice, linking an input to an output or one input to another.
  - "`T extends { totalCents: number }` lets the function use `totalCents` while still returning the caller's full, more specific type."
  - "A generic that appears only in the return type, like `parse<T>(text): T`, is an unchecked cast with nicer syntax."
  - The caller chooses `T`, not the function, which is why you cannot return a literal object where `T` is expected.
further:
  - title: Generics
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html
  - title: More on Functions (generic functions and constraints)
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html#generic-functions
quiz:
  - q: |
      What is the type of `sorted`?
      ```ts
      type DetailedOrder = { id: number; totalCents: number; customer: string };
      declare const orders: DetailedOrder[];
      function sortByTotal(xs: { totalCents: number }[]) { return [...xs].sort((a, b) => a.totalCents - b.totalCents); }
      const sorted = sortByTotal(orders);
      ```
    options:
      - text: "`DetailedOrder[]`, because the array holds `DetailedOrder` values"
        why: The values are still full orders at runtime, but the return type is computed from the parameter type, which only knows `totalCents`.
      - text: "`{ totalCents: number }[]`, so `sorted[0].customer` is an error"
        why: Correct. Without a type parameter, the function has no way to say "I return the same kind of thing you gave me".
      - text: "`any[]`, because `sort` returns `any`"
        why: "`sort` returns the array's own element type. The loss of information comes from the parameter annotation."
    answer: 1
  - q: Which of these signatures uses its type parameter in a way that adds real type safety?
    options:
      - text: "`function log<T>(value: T): void`"
        why: "`T` appears once, so it links nothing. `value: unknown` says the same thing more honestly."
      - text: "`function parse<T>(json: string): T`"
        why: "`T` only appears in the return type, so the caller picks any type and nothing checks it. It is a cast in disguise."
      - text: "`function lastItem<T>(items: T[]): T | undefined`"
        why: Correct. `T` appears in the input and the output, linking them, so the caller gets back exactly the element type they passed in.
      - text: "`function count<T>(items: T[]): number`"
        why: "`T` appears only once in a position that matters; `items: unknown[]` works identically."
    answer: 2
  - q: |
      Why is this an error?
      ```ts
      function emptyCart<T extends { items: string[] }>(): T {
        return { items: [] };
      }
      ```
    options:
      - text: Because `[]` is inferred as `never[]`.
        why: "`never[]` is assignable to `string[]`. The problem is the relationship between the literal and `T`."
      - text: Because generic functions cannot return object literals.
        why: They can, when the literal's type is what the return type says. Here the return type is the caller's `T`, which you do not know.
      - text: "Because the caller chooses `T`, which might be `{ items: string[]; owner: string }`, and your literal has no `owner`."
        why: Correct. The error says `T` could be instantiated with a different subtype of the constraint. Return the constraint type instead.
    answer: 2
---

Here is a helper from Cartwheel's order history page. It is typed, it compiles, and it quietly throws information away:

```ts
type DetailedOrder = { id: number; totalCents: number; customer: string };

function sortByTotal(orders: { totalCents: number }[]): { totalCents: number }[] {
  return [...orders].sort((a, b) => a.totalCents - b.totalCents);
}

declare const orders: DetailedOrder[];
const sorted = sortByTotal(orders);
sorted[0].customer;
// Error: Property 'customer' does not exist on type '{ totalCents: number; }'.
```

The objects in `sorted` are still full orders at runtime. But the function's signature can only describe its output in terms of its input annotation, and that annotation only mentions `totalCents`. The fix is not a wider annotation. It is a **relationship**: "whatever kind of object you give me, you get the same kind back".

## A type parameter is a relationship

That relationship is what a generic says:

```ts
function sortByTotal<T extends { totalCents: number }>(orders: T[]): T[] {
  return [...orders].sort((a, b) => a.totalCents - b.totalCents);
}

const sorted = sortByTotal(orders); // DetailedOrder[]
sorted[0].customer;                 // string
```

Read the signature aloud: "for some type `T` that has a numeric `totalCents`, take an array of `T` and return an array of `T`". The caller does not write `<DetailedOrder>`; TypeScript infers `T` from the argument (the next lesson is about exactly how).

Two parts are doing the work. `T` appears in the parameter and in the return type, which links them. And `extends { totalCents: number }` is a **constraint**: it limits which types `T` can be, which is what makes `a.totalCents` legal inside the function. Without it, `T` could be anything, and TypeScript would reject the property access.

## The appears-twice rule

The most useful test for a generic, and the one I apply in every code review: **each type parameter should appear at least twice**. Once to capture a type, once to use it somewhere else.

```ts
function lastItem<T>(items: T[]): T | undefined {      // input → output
  return items[items.length - 1];
}

function indexById<T extends { id: number }>(items: T[]): Map<number, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function merge<A, B>(a: A, b: B): A & B {              // two inputs → output
  return { ...a, ...b };
}
```

A parameter that appears once links nothing. `function log<T>(value: T): void` is just `function log(value: unknown): void` with extra syntax, and `function count<T>(items: T[]): number` is `items: unknown[]`. Remove those type parameters; the signatures get easier to read and nothing is lost.

:::mistake Generics as casts
`function parseJson<T>(text: string): T { return JSON.parse(text); }` looks type-safe, and every call site reads nicely: `parseJson<Order>(body)`. But `T` appears only in the return type, so the caller can pick any type and nothing checks it. It is `JSON.parse(body) as Order` in disguise, and it hides the cast where reviewers will not see it. Return `unknown` and validate (see [Parsing Untrusted Data at the Boundary](lesson:l-at-4-3)); when you truly must cast, write `as` at the call site where it is visible.
:::

## The caller chooses T

This error confuses almost everyone the first time:

```ts
type Shippable = { weightGrams: number };

function withDefaultWeight<T extends Shippable>(): T {
  return { weightGrams: 500 };
  // Error: Type '{ weightGrams: number; }' is not assignable to type 'T'.
  //   '{ weightGrams: number; }' is assignable to the constraint of type 'T', but 'T'
  //   could be instantiated with a different subtype of constraint 'Shippable'.
}
```

The constraint says `T` is *at least* `Shippable`. The caller might ask for `withDefaultWeight<{ weightGrams: number; sku: string }>()`, and your literal has no `sku`. Inside a generic function, `T` is a type you do not get to choose; you can only produce a `T` from values that already are one, such as the arguments. If your function builds the value itself, its return type is the constraint (`Shippable`), and no generic is needed.

## Constraints that use other parameters

A constraint can refer to another type parameter. The classic case picks a property by name:

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const customers = pluck(orders, 'customer'); // string[]
pluck(orders, 'email');
// Error: Argument of type '"email"' is not assignable to parameter of type 'keyof DetailedOrder'.
```

`keyof T` is the union of `T`'s property names, and `T[K]` is the type of the property `K`. You will take both apart in section 3; for now, notice the pattern. `K` appears in the parameter and in the return type, and its constraint ties it to `T`. Each parameter appears at least twice, and each one earns its place.

## Generic or plain union?

Not every function that accepts several types needs a type parameter. Ask one question: **does the output type depend on which input type the caller passed?**

```ts
// Output is always a number, whatever came in: a union is enough.
function toCents(amount: number | string): number {
  return Math.round(Number(amount) * 100);
}

// Output depends on the input: a generic says so.
function firstOrThrow<T>(items: T[]): T {
  if (items.length === 0) throw new Error('Expected at least one item');
  return items[0];
}
```

`toCents` returns `number` no matter what, so making it `toCents<T extends number | string>(amount: T): number` would add a parameter that appears once and links nothing. `firstOrThrow` is the opposite: a list of orders must give back an order, and a list of products a product. A union signature (`items: unknown[]): unknown`) would force every caller to cast.

When you are unsure, start without the generic. If callers start writing `as` on the result, that is the signal the output depends on the input, and a type parameter will remove those casts.

:::tip Generic types follow the same rule
Types take parameters too: `type Page<T> = { items: T[]; nextCursor: string | null }`. Cartwheel's client returns `Page<DetailedOrder>` and `Page<Product>` from the same pagination code. The rule still holds: a type parameter that is not used in the body is a sign the type is doing less than it claims.
:::

In the exercise you will turn four lossy helpers into generic ones that keep the caller's types. Next lesson looks at how TypeScript decides what `T` is when the caller does not say.
