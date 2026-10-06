---
kind: intro
summary: Tell a type that prevents a bug from a type that only decorates code, and read the type tests every exercise in this course uses.
takeaways:
  - A type earns its keep when it makes a real bug impossible to write, not when it restates what the code already says.
  - A `string` where only five values are valid is a missed chance; a union of literals lets the compiler check every use.
  - "`Expect<Equal<A, B>>` fails to compile unless the two types are identical, so it works as a unit test for types."
  - A `// @ts-expect-error` line asserts that the next line is rejected, and it becomes an error itself if that line compiles.
further:
  - title: TypeScript for JavaScript Programmers
    url: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html
  - title: Everyday Types
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
quiz:
  - q: Which of these types catches the most real bugs for an order's `status` field that can only be `processing`, `shipped`, `delivered`, `cancelled` or `returned`?
    options:
      - text: "`string`, documented with a comment listing the five values"
        why: A comment is not checked. `'canceled'` with one L compiles fine and fails silently at runtime.
      - text: "`'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'`"
        why: Correct. Every assignment and comparison is checked against the five values, and the compiler can tell when a switch misses one.
      - text: "`any`, because the value comes from the database anyway"
        why: "`any` switches checking off for every use of the value, so a typo anywhere downstream goes unnoticed."
      - text: "`String`, the boxed object type, because it is stricter than `string`"
        why: "`String` is the wrapper object type and is no stricter; it accepts any string and is almost never what you want."
    answer: 1
  - q: |
      What does this type test do when `Total` is `number | undefined`?
      ```ts
      type T1 = Expect<Equal<Total, number>>;
      ```
    options:
      - text: It compiles, because `number` is part of the union.
        why: "`Equal` checks that the two types are identical, not that one overlaps the other. A union with `undefined` is a different type."
      - text: It compiles, but logs a warning at runtime.
        why: Types are erased before the code runs, so a type test can only fail at compile time; there is nothing left to log.
      - text: It fails to compile, because `Equal` resolves to `false` and `Expect` only accepts `true`.
        why: Correct. `Expect<T extends true>` rejects `false`, so the mismatch shows up as a type error on that line.
    answer: 2
  - q: You add `// @ts-expect-error` above `pay(order, 'EUR')`, but `pay` accepts any string as the currency. What happens?
    options:
      - text: Nothing; the directive is ignored when there is no error to suppress.
        why: That is how `// @ts-ignore` behaves. `@ts-expect-error` is stricter and complains when it has nothing to suppress.
      - text: TypeScript reports "Unused '@ts-expect-error' directive", so the test fails.
        why: Correct. An unused `@ts-expect-error` is itself an error, which is exactly why it works as a test that a bad call is rejected.
      - text: The call is removed from the compiled JavaScript.
        why: Comments never change emitted code. The call still runs; only type checking is affected.
    answer: 1
---

Here is a bug that shipped in a checkout I worked on. A refund function took an `amount` and the payment provider expected cents. One caller passed dollars. Customers got refunded 1% of what they were owed, and nobody noticed for two weeks, because every line of that code was "typed": `amount: number`.

The types were there. They just did not earn their keep. `number` described the code and prevented nothing. This course is about the other kind of type, the kind that makes the bug impossible to write.

## Two ways to type the same thing

Cartwheel, the store you will work with throughout this course, has five order statuses: `processing`, `shipped`, `delivered`, `cancelled` and `returned`. Here is the decorative version:

```ts
type Order = { id: number; status: string };

function canCancel(order: Order): boolean {
  return order.status === 'procesing'; // typo: always false
}
```

That compiles. `status` is `string`, so comparing it with any string is legal. Now the version that earns its keep:

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
type Order = { id: number; status: OrderStatus };

function canCancel(order: Order): boolean {
  return order.status === 'procesing';
  // Error: This comparison appears to be unintentional because the types
  // 'OrderStatus' and '"procesing"' have no overlap.
}
```

Same runtime code, one changed line of types, and a whole class of bug is gone. You will see this move again and again: replace a wide type (`string`, `number`, `object`) with a narrow one that says what is actually allowed.

:::why The rule this course follows
A type is worth writing when you can name the bug it prevents. If you cannot, it is decoration, and decoration has a cost: someone has to read it. The best TypeScript codebases are not the ones with the cleverest types; they are the ones where every type pulls its weight.
:::

## The running example

Lesson by lesson you will build the type layer of Cartwheel's checkout API client: orders and their statuses, money that refuses to mix currencies, coupons, a fetch client whose responses are typed from a route map, events the checkout emits, and parsers that turn untrusted JSON into trusted types. The runtime code stays small on purpose. The interesting part is what the compiler refuses to accept.

The course runs in five steps. First you use types as a design tool: structural typing, narrowing, discriminated unions and `satisfies`. Then generics, with a focus on inference. Then type-level programming, with honest advice on when to stop. Then patterns that real codebases need: branded types, `Result` types, parsing at the boundary, typed events. Finally, shipping: compiler flags, declaration files, decorators and migrating JavaScript.

## How the exercises test types

Most exercises are type-level. The playground runs TypeScript 5.9 in strict mode and gives you two helpers:

```ts
type T1 = Expect<Equal<OrderStatus, 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'>>;
```

`Equal<A, B>` is `true` only when the two types are identical, and `Expect` only accepts `true`. So that line is a unit test: it compiles when you got the type right and fails when you did not.

The second tool is built into TypeScript. A `// @ts-expect-error` comment says "the next line must be an error":

```ts
// @ts-expect-error: 'canceled' is not a status
canCancel({ id: 1001, status: 'canceled' });
```

If the line below it compiles, TypeScript reports an unused directive. That turns "this bad call is rejected" into a test, which matters as much as "this good call is accepted". A type that accepts everything passes every positive test.

:::mistake Reaching for @ts-ignore
`// @ts-ignore` hides an error and stays silent when the error goes away, so it rots. In tests and in production code, prefer `@ts-expect-error` with a short reason after a colon. When someone fixes the underlying problem, the directive tells them it can be deleted.
:::

In the exercise below, the statuses are typed as `string`. Narrow the type and watch the compiler find the missing label for you. The next lesson looks at what "assignable" actually means in TypeScript, because it is not what most people coming from Java or C# expect.
