---
summary: Write conditional types that choose between types, predict how they distribute over unions, and pull types out of other types with infer, re-implementing Exclude, Extract and ReturnType.
takeaways:
  - "`T extends U ? X : Y` picks `X` when `T` is assignable to `U` and `Y` otherwise; with a generic `T`, the choice waits until `T` is known."
  - A conditional on a naked type parameter distributes over unions, running once per member and joining the results.
  - Wrap both sides in brackets, `[T] extends [U]`, to test the union as a whole instead of distributing.
  - "`infer` declares a type variable inside the `extends` clause and captures whatever matches it, which is how `ReturnType` and `Awaited` work."
  - Mapping each key to itself or `never` and then indexing with `[keyof T]` filters keys by the type of their value.
further:
  - title: Conditional Types
    url: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
  - title: Utility Types (Exclude, Extract, ReturnType)
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html
quiz:
  - q: "`type ToArray<T> = T extends unknown ? T[] : never`. What is `ToArray<string | number>`?"
    options:
      - text: "`(string | number)[]`"
        why: That is the non-distributive result, which you get with `[T] extends [unknown]`.
      - text: "`never`"
        why: Both members extend `unknown`, so neither takes the `never` branch.
      - text: "`unknown[]`"
        why: The true branch uses `T`, which is each member in turn, not the constraint `unknown`.
      - text: "`string[] | number[]`"
        why: Correct. `T` is a naked type parameter, so the conditional runs once for `string` and once for `number`, and the results are joined.
    answer: 3
  - q: Which type gives you the shipped variant of the `Order` union?
    options:
      - text: "`Extract<Order, { status: 'shipped' }>`"
        why: "Correct. `Extract` keeps the union members assignable to `{ status: 'shipped' }`, which is exactly the shipped variant."
      - text: "`Exclude<Order, { status: 'shipped' }>`"
        why: "`Exclude` does the opposite: it removes the shipped variant and keeps the rest."
      - text: "`Order['shipped']`"
        why: Indexed access looks up a property named `shipped`, which `Order` does not have.
      - text: "`Order extends { status: 'shipped' } ? Order : never`"
        why: "`Order` is a concrete type here, not a type parameter, so nothing distributes. The whole union is not assignable to the shipped shape, so you get `never`."
    answer: 0
  - q: |
      What is `R`?
      ```ts
      type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
      type R = MyReturnType<(id: number) => Promise<Order>>;
      ```
    options:
      - text: "`Order`"
        why: "`infer R` captures the return type as written. Unwrapping the promise needs a second step, such as `Awaited`."
      - text: "`Promise<Order>`"
        why: Correct. The function type matches the pattern, and `R` captures its return type exactly.
      - text: "`never`"
        why: You get `never` only when `F` is not a function type. Here it matches.
    answer: 1
  - q: "`type IsString<T> = T extends string ? true : false`. What is `IsString<never>`?"
    options:
      - text: "`true`, because `never` is assignable to everything"
        why: That is true for a non-distributive check like `[never] extends [string]`. A distributive conditional never gets that far.
      - text: "`false`, because `never` is not a string"
        why: The conditional is not evaluated at all; there are no union members to run it on.
      - text: "`never`, because distributing over an empty union produces an empty union"
        why: Correct. `never` is the empty union, so a distributive conditional maps zero members and returns `never`.
    answer: 2
---

Back in [Designing a Typed API Client](lesson:l-at-2-4), routes with no input forced callers to write `call('GET /me', {})`. The fix needs a type that *makes a decision*: "if this route's input has no required fields, make the argument optional; otherwise, require it". Mapped types loop. Conditional types decide.

## The type-level ternary

```ts
type IsArray<T> = T extends readonly unknown[] ? true : false;

type A = IsArray<string[]>; // true
type B = IsArray<Order>;    // false
```

`T extends U ? X : Y` reads like a ternary: if `T` is assignable to `U`, the result is `X`, otherwise `Y`. The `extends` here is the same assignability check as everywhere else in TypeScript, "is `T` a subset of `U`?". When `T` is a generic parameter that is not known yet, TypeScript **defers** the conditional and keeps it as is until a concrete type arrives.

Here is the API client fix. `{} extends Input` is true exactly when every property of `Input` is optional (an empty object would satisfy it):

```ts
type CallArgs<R extends keyof Routes> = {} extends Routes[R]['input']
  ? [input?: Routes[R]['input']]
  : [input: Routes[R]['input']];

declare function call<R extends keyof Routes>(route: R, ...args: CallArgs<R>): Promise<Routes[R]['output']>;

call('GET /me');                    // ok: input is {}
call('GET /orders');                // ok: every filter is optional
call('GET /orders/:id');            // Error: Expected 2 arguments, but got 1.
call('GET /orders/:id', { id: 1 }); // ok
```

The conditional produces a *tuple* type, and the rest parameter `...args` spreads it into the parameter list. Labeled tuple elements (`input?:`) keep the parameter name in tooltips. Not one call site changed.

## Distribution over unions

Conditional types have one behaviour that surprises everyone. When the checked type is a **naked type parameter** and you pass it a union, the conditional runs once per member and the results are joined:

```ts
type ToArray<T> = T extends unknown ? T[] : never;

type X = ToArray<string | number>; // string[] | number[], not (string | number)[]
```

This is called **distribution**, and it is the engine behind several utility types. Here are `Exclude` and `Extract`, exactly as the lib defines them:

```ts
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;

type Active = MyExclude<OrderStatus, 'cancelled' | 'returned'>; // 'processing' | 'shipped' | 'delivered'
type Shipped = MyExtract<Order, { status: 'shipped' }>;         // the ShippedOrder variant
```

Each member goes through the conditional on its own. Members mapped to `never` vanish, because `never` is the empty union. `MyExtract<Order, { status: 'shipped' }>` is the cleanest way to name one variant of a discriminated union.

:::figure A distributive conditional splits the union, runs per member, and re-joins
<svg viewBox="0 0 700 240" role="img" aria-labelledby="t1">
  <title id="t1">The union of processing, shipped and cancelled enters Exclude with cancelled. It is split into three members. Each member is tested against cancelled: processing and shipped are kept, cancelled becomes never. The results are joined into processing or shipped.</title>
  <rect class="d-box-accent" x="10" y="96" width="150" height="48" rx="10"/>
  <text class="d-code" x="85" y="125" text-anchor="middle">A | B | C</text>
  <path class="d-arrow" d="M160 110 L224 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M160 120 L224 120" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M160 130 L224 190" marker-end="url(#arrow)"/>
  <rect class="d-box" x="228" y="28" width="230" height="44" rx="10"/>
  <text class="d-code" x="343" y="55" text-anchor="middle">'processing' ext C? → keep</text>
  <rect class="d-box" x="228" y="98" width="230" height="44" rx="10"/>
  <text class="d-code" x="343" y="125" text-anchor="middle">'shipped' ext C? → keep</text>
  <rect class="d-box-warn" x="228" y="168" width="230" height="44" rx="10"/>
  <text class="d-code" x="343" y="195" text-anchor="middle">'cancelled' ext C? → never</text>
  <path class="d-arrow" d="M458 50 L522 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M458 120 L522 120" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M458 190 L522 130" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="526" y="96" width="164" height="48" rx="10"/>
  <text class="d-code" x="608" y="125" text-anchor="middle">'processing' | 'shipped'</text>
</svg>
:::

To turn distribution off, wrap both sides in a one-element tuple. `[T]` is not a naked type parameter, so the union is checked as a whole:

```ts
type ToArrayWhole<T> = [T] extends [unknown] ? T[] : never;
type Y = ToArrayWhole<string | number>; // (string | number)[]
```

:::mistake Forgetting that never is an empty union
A distributive conditional given `never` returns `never`, without evaluating either branch, because there are no members to run it on. So `IsString<never>` is `never`, not `true` or `false`. If you write type tests for a conditional type, include `never` and a union among the inputs, and use `[T] extends [never]` when you need to detect `never` itself.
:::

## infer: capture part of a type

Inside the `extends` clause, `infer X` declares a type variable that captures whatever sits in that position, if the pattern matches. This is essentially how the lib defines `ReturnType` (the lib version also constrains `F` to a function type and falls back to `any`):

```ts
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;

type Loaded = MyReturnType<typeof loadOrder>; // Promise<Order>
```

The same trick pulls types out of anything with structure:

```ts
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T;
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never;
```

`infer` can also carry a constraint, as in `infer S extends string`, which only matches when the captured type is a string and gives you `S` already narrowed. You will need that in the next lesson, when you capture pieces of string literal types.

## Filtering keys by value type

Combine a mapped type, a conditional and an indexed access, and you can select keys by what their values are:

```ts
type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

type Line = { sku: string; quantity: number; unitPriceCents: number };
type NumericField = KeysOfType<Line, number>; // 'quantity' | 'unitPriceCents'
```

The mapped type turns each property into its own key name or `never`, and `[keyof T]` collects the values into a union, where the `never`s disappear. It reads backwards the first time; write it once, name it well, and reuse it. A sort function typed `sortBy(lines, key: KeysOfType<Line, number>)` now refuses to sort by `sku`.

## Conditional return types: handle with care

It is tempting to give a function a conditional return type, such as `function format<T extends number | number[]>(x: T): T extends number ? string : string[]`. Callers get precise types, but the implementation does not: inside the function, `T` is still unknown, the conditional stays deferred, and TypeScript cannot check that `return x.toFixed(2)` matches it. You end up writing `as any` or `as T extends number ? string : string[]` on every return, which means the most delicate code in the function is the code nobody checks.

That is why the previous section preferred overloads or separate functions for this job. Conditional types shine in *derived* types (`CallArgs`, `Extract`, `KeysOfType`) where nothing has to be implemented against them, and they are weakest as the declared return type of hand-written logic.

:::tip Test conditional types like functions
Conditional types are small programs with edge cases. Test them the way the exercises do: a normal case, a union, `never`, `any` and an optional property. Five `Expect<Equal<…>>` lines catch most surprises before your teammates do.
:::

In the exercise you will re-implement `Exclude`, `Extract` and `ReturnType` and use them on Cartwheel's order types. The next lesson applies conditionals and `infer` to strings.
