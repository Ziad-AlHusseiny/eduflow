---
summary: Write recursive types for trees, JSON and deep transformations, understand the compiler's depth limits, and decide when a clever type costs more than the bug it prevents.
takeaways:
  - A type alias can refer to itself, which is how you describe trees, JSON and other nested data.
  - Recursive type-level functions such as `DeepReadonly` and `DeepPartial` need explicit cases for functions and arrays, or they transform things you did not mean to touch.
  - TypeScript stops recursion after a few dozen nested levels, or about 1,000 for tail-recursive conditional types, with "Type instantiation is excessively deep".
  - "`readonly` only blocks property assignment; methods like `Date#setFullYear` or `Map#set` still mutate a deeply readonly value."
  - Before shipping a clever type, ask what bug it prevents, whether a teammate can read its errors, and what it costs the editor.
further:
  - title: Recursive conditional types (TypeScript 4.1 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html
  - title: Tail-recursion elimination on conditional types (TypeScript 4.5 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html
  - title: Awaited utility type
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype
quiz:
  - q: |
      With this definition, what is the type of `o.lines`?
      ```ts
      type DeepReadonly<T> = T extends (...args: any[]) => any
        ? T
        : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
      declare const o: DeepReadonly<{ lines: { sku: string }[] }>;
      ```
    options:
      - text: "`{ sku: string }[]`, because mapped types skip arrays"
        why: A homomorphic mapped type applied to an array produces an array, and here it also adds `readonly`.
      - text: "`readonly { readonly sku: string }[]`"
        why: Correct. Mapping over an array type gives a readonly array, and each element is made deeply readonly by the recursive call.
      - text: "`{ readonly 0: …; readonly length: number; … }`, an object with numeric keys"
        why: TypeScript special-cases homomorphic mapped types on arrays and tuples, so the result stays an array type.
    answer: 1
  - q: Why does a `DeepReadonly` type usually need a separate branch for functions?
    options:
      - text: Because mapping over a function type turns it into an object without a call signature, so it can no longer be called.
        why: Correct. A mapped type keeps properties, not call signatures, so `onSubmit` would stop being callable.
      - text: Because functions cannot be readonly in JavaScript.
        why: The concern is the type transformation, not runtime freezing; a mapped type would strip the call signature.
      - text: Because `keyof` of a function type is an error.
        why: "`keyof` of a function type is fine (it is mostly `never`). The problem is what the mapped type produces."
    answer: 0
  - q: "`MyAwaited<T> = T extends Promise<infer V> ? MyAwaited<V> : T`. What is `MyAwaited<Promise<Promise<Order>>>`?"
    options:
      - text: "`Promise<Order>`"
        why: That is one level of unwrapping. The recursive call keeps going while the type is still a promise.
      - text: "`Order`"
        why: Correct. The recursion unwraps one promise per step and stops when the type is no longer a promise.
      - text: "`never`, because nested promises do not exist at runtime"
        why: The type is about what the declaration says; at runtime a resolved promise never contains another promise, which is why unwrapping all levels is right.
      - text: An error, because a conditional type cannot refer to itself
        why: Recursive conditional types have been allowed since TypeScript 4.1.
    answer: 1
  - q: A teammate adds a `Paths<T>` type that generates every dot path of the 40-field checkout state, and the editor becomes sluggish. What is the most pragmatic fix?
    options:
      - text: Raise the compiler's recursion limit in tsconfig.
        why: There is no tsconfig option for the instantiation depth limit, and slowness is about the amount of work, not the limit.
      - text: Add more type tests so the type is verified.
        why: Tests check correctness, not cost. The type would be just as slow with tests.
      - text: Wrap the type in `NoInfer` so it is not computed at call sites.
        why: "`NoInfer` only affects inference candidates; the type still has to be expanded to check arguments."
      - text: Replace it with a narrower type, such as typed accessors for the few paths the code actually uses.
        why: Correct. A smaller, explicit type gives the same protection where it matters and costs the compiler almost nothing.
    answer: 3
---

Cartwheel's product categories form a tree: Kitchen contains Cookware, which contains Pans. The API returns that tree as nested JSON, and the checkout's settings screen edits a deeply nested config object. Both need types that refer to themselves. TypeScript handles that well, up to a point. This lesson covers how to write recursive types, where the limits are, and the judgment call this whole section has been building towards: when to stop.

## Types that refer to themselves

A type alias may mention itself inside an object or array type:

```ts
type Category = { id: number; name: string; children: Category[] };

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
```

`Category` describes a tree of any depth. `Json` describes any value `JSON.parse` can return, which makes it a much better return type for a parser than `any`: it is honest, and it forces you to narrow before use.

Recursive *type-level functions* follow the same idea. `Awaited<T>`, built into the lib since TypeScript 4.5, unwraps promises until there are none left. A simplified version:

```ts
type MyAwaited<T> = T extends Promise<infer V> ? MyAwaited<V> : T;

type Loaded = MyAwaited<Promise<Promise<Order>>>; // Order
```

Each step peels off one `Promise` and calls itself on what was inside. When the type is no longer a promise, the false branch returns it and the recursion ends.

## Deep transformations

The mapped types from [Mapped Types and Key Remapping](lesson:l-at-3-2) are shallow. Recursion makes them deep:

```ts
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type FrozenCheckout = DeepReadonly<Checkout>;
```

Each case is there for a reason. Primitives fall through unchanged. Objects are mapped, and each property is processed recursively. Functions get their own branch because a mapped type keeps properties but not call signatures: without the branch, an `onSubmit` handler would turn into an object you cannot call. Arrays need no special case here, because a homomorphic mapped type applied to an array produces a readonly array.

`DeepPartial` is the other one you will meet, typically for test fixtures and config overrides:

```ts
type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

declare function checkoutFixture(overrides?: DeepPartial<Checkout>): Checkout;
checkoutFixture({ shipping: { address: { country: 'JO' } } });
```

Here arrays are kept whole on purpose: a partial array of partial line items is rarely what a test means.

:::mistake Trusting readonly to freeze objects
`DeepReadonly` blocks `checkout.placedAt = …`, but `checkout.placedAt.setFullYear(2020)` still compiles, because `setFullYear` is a method and methods are kept as they are. The same goes for `Map#set`, `Set#add` and anything else that mutates through a method. `readonly` is a promise about property assignment, not immutability. For values that must not change, use `ReadonlyMap`, `ReadonlySet` and plain data, and treat `Object.freeze` as the runtime guarantee.
:::

## Paths, and the cost of cleverness

Here is the type people reach for when they want `get(checkout, 'shipping.address.city')` to be checked:

```ts
type Paths<T> = {
  [K in keyof T & string]: T[K] extends object ? K | `${K}.${Paths<T[K]>}` : K;
}[keyof T & string];

type CheckoutPath = Paths<{ shipping: { address: { city: string; country: string } }; totalCents: number }>;
// 'shipping' | 'shipping.address' | 'shipping.address.city' | 'shipping.address.country' | 'totalCents'
```

It works, and on a small type it is delightful. It is also a mapped type, a conditional, a template literal and recursion in four lines, and its cost grows with every field and every level. On a real 40-field state object with arrays and dates in it, a type like this can produce thousands of members and make every keystroke in the editor slower.

TypeScript also has hard limits. Each nested instantiation counts, and after a few dozen levels of ordinary recursion you get *Type instantiation is excessively deep and possibly infinite*. Since TypeScript 4.5, a conditional type whose recursive call is in **tail position** (the whole result of a branch, as in `MyAwaited`) is optimised and can run about 1,000 iterations. There is no compiler flag to raise either limit.

:::why When to stop
On the 400,000-line migration I led, we deleted more clever types than we wrote. The test we used, and the one I recommend, has three questions. **What bug does this type prevent?** Name it, ideally one you have seen in production. **Can a teammate read the error it produces?** If the message is 30 lines of expanded types, people will cast their way out of it, and the protection is gone. **What does it cost?** Check how long the editor takes to show a tooltip, and how the build time changes. A plain `string` key plus a runtime check, or five typed accessor functions, often gives 90% of the safety for 5% of the complexity.
:::

Recursive types are the right tool for genuinely recursive data: trees, JSON, nested configs. For everything else, write the boring type first, and reach for the clever one only when a real bug justifies it.

In the exercise you will write `MyAwaited`, `DeepReadonly` and `DeepPartial`, and use the last one for a test fixture. That closes the type-level section. Section 4 turns to patterns: what experienced teams actually build with all of this.
