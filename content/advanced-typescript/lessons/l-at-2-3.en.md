---
summary: Block unwanted inference sites with NoInfer, give type parameters sensible defaults, and choose between overloads, unions and separate functions when the return type depends on the input.
takeaways:
  - Every appearance of a type parameter is an inference site, so a typo in one argument can widen the type instead of being rejected.
  - "`NoInfer<T>` (TypeScript 5.4+) marks a position as check-only: it is validated against `T` but never contributes a candidate."
  - Type parameter defaults apply when there is nothing to infer from, and they make partial explicit type arguments possible.
  - Overloads let the return type depend on the argument type, but a union argument matches none of them; two well-named functions are often clearer.
further:
  - title: NoInfer (TypeScript 5.4 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html
  - title: Function overloads
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads
  - title: NoInfer utility type
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html#noinfertype
quiz:
  - q: |
      Why does this call compile even though `'WELCOM10'` is a typo?
      ```ts
      function applyCoupon<C extends string>(available: C[], code: C) {}
      applyCoupon(['WELCOME10', 'LOYAL5'], 'WELCOM10');
      ```
    options:
      - text: Because string literals always widen to `string` in generic calls.
        why: The `extends string` constraint keeps the literals. The issue is where those literals come from.
      - text: Because `code` is also an inference site, so `C` becomes `'WELCOME10' | 'LOYAL5' | 'WELCOM10'`.
        why: "Correct. The typo is collected as a candidate instead of being checked. `code: NoInfer<C>` fixes it."
      - text: Because arrays are inferred after plain arguments.
        why: Arrays are not context-sensitive; both arguments contribute candidates in the same pass.
    answer: 1
  - q: "`function request<TRes = unknown, TBody = undefined>(path: string, body?: TBody): Promise<TRes>`. What does `request<Order>('/orders/1')` do?"
    options:
      - text: It is an error, because only one of the two type arguments was given.
        why: That rule applies to type parameters without defaults. Here `TBody` has a default, so it can be left out.
      - text: "`TRes` is `Order` and `TBody` is inferred from the missing `body`."
        why: Once you pass explicit type arguments, nothing is inferred; omitted ones take their defaults.
      - text: "`TRes` is `Order` and `TBody` falls back to its default, `undefined`."
        why: Correct. Defaults are what make partial explicit type arguments legal.
    answer: 2
  - q: |
      With these overloads, what happens on the last line?
      ```ts
      function getOrder(id: number): Promise<Order>;
      function getOrder(ids: number[]): Promise<Order[]>;
      function getOrder(idOrIds: number | number[]): Promise<Order | Order[]> { /* … */ }
      declare const input: number | number[];
      getOrder(input);
      ```
    options:
      - text: It returns `Promise<Order | Order[]>` from the implementation signature.
        why: The implementation signature is not visible to callers. Only the overload signatures above it can be matched.
      - text: It is an error, "No overload matches this call", because no single overload accepts the union.
        why: Correct. Overloads are tried one at a time, and neither accepts `number | number[]`. You would need a third overload for the union.
      - text: It picks the first overload, because overloads are tried in order.
        why: Order decides which overload wins when several match. Here none match, because `number[]` fails the first one.
    answer: 1
  - q: You are designing a lookup that returns one order for an id and a list for a customer. Which API is easiest for callers and maintainers?
    options:
      - text: Two functions, `getOrder(id)` and `getOrdersForCustomer(customerId)`, each with a plain signature.
        why: Correct. Each function says what it does, needs no overloads or conditional types, and inference is trivial.
      - text: One overloaded `get(idOrCustomer)` with two overload signatures.
        why: This works but packs two intentions into one name, and callers with union inputs will hit "No overload matches".
      - text: One generic `get<T>(key)` with a conditional return type based on `T`.
        why: Conditional return types usually need casts inside the implementation, and the call site is less clear than a named function.
    answer: 0
---

Here is a helper from Cartwheel's checkout. It looks safe, and it has a hole:

```ts
function applyCoupon<C extends string>(available: C[], code: C) {
  // …
}

applyCoupon(['WELCOME10', 'LOYAL5'], 'WELCOM10'); // compiles
```

The intent is clear: `code` must be one of the available coupons. But `C` appears in both parameters, and as you saw last lesson, every appearance is an inference site. TypeScript collects `'WELCOME10'`, `'LOYAL5'` and `'WELCOM10'` as candidates, makes `C` the union of all three, and everything type-checks. The typo was not checked against the list; it was added to it.

## NoInfer: check here, but do not infer from here

TypeScript 5.4 added the intrinsic type `NoInfer<T>`. It evaluates to plain `T`, but it marks that position as off-limits for inference:

```ts
function applyCoupon<C extends string>(available: C[], code: NoInfer<C>) {
  // …
}

applyCoupon(['WELCOME10', 'LOYAL5'], 'WELCOM10');
// Error: Argument of type '"WELCOM10"' is not assignable to parameter of type '"WELCOME10" | "LOYAL5"'.
```

Now `C` is inferred only from `available`, and `code` is checked against the result. The pattern appears whenever one argument defines a set and another argument must pick from it: an initial state that must be one of the declared states, a default value that must match the options, a sort key that must be one of the listed columns.

```ts
function createMachine<S extends string>(config: { states: S[]; initial: NoInfer<S> }) {
  return config;
}

createMachine({ states: ['cart', 'shipping', 'payment'], initial: 'cart' });    // ok
createMachine({ states: ['cart', 'shipping', 'payment'], initial: 'checkout' }); // error
```

Before 5.4, the workaround was a second type parameter constrained by the first, `<C extends string, D extends C>(available: C[], code: D)`. It works, and you will see it in older libraries, but it adds a parameter that exists only to dodge inference. Use `NoInfer` in new code. It also documents intent: a reader who sees `initial: NoInfer<S>` knows at a glance which argument is the source of truth and which one is only being checked, something the two-parameter trick never made obvious.

:::mistake Wrapping the wrong position
`NoInfer` goes on the position that should be *checked*, not the one that defines the type. Write `available: NoInfer<C>[]` instead and `C` is inferred from the single code alone, so the list is checked against the typo. Ask "which argument is the source of truth?" and leave that one unwrapped.
:::

## Defaults for type parameters

A type parameter can have a default, used when there is nothing to infer from:

```ts
type ApiResponse<T = unknown> = { data: T; requestId: string };

async function request<TRes = unknown, TBody = undefined>(path: string, body?: TBody): Promise<TRes> {
  const res = await fetch(path, { method: body === undefined ? 'GET' : 'POST', body: JSON.stringify(body) });
  return res.json();
}
```

Two things make defaults useful. First, `ApiResponse` on its own now means `ApiResponse<unknown>`, which is a safe default: callers must narrow `data` before using it. Second, defaults make **partial explicit type arguments** legal. Without them, `request<Order>('/orders/1042')` would fail with "Expected 2 type arguments"; with them, `TBody` falls back to `undefined`.

Choose defaults that are safe rather than convenient. `unknown` is a good default for data that comes from outside; `any` is not, because it silently switches off checking for everyone who forgets the type argument. (And notice that `request<Order>` is still a cast in disguise: the response body is not checked. You will fix that properly in the next lesson and in [Parsing Untrusted Data at the Boundary](lesson:l-at-4-3).)

## When the return type depends on the argument

Sometimes the *kind* of argument decides the kind of result. Overloads describe that directly:

```ts
function formatPrice(cents: number): string;
function formatPrice(cents: number[]): string[];
function formatPrice(cents: number | number[]): string | string[] {
  return Array.isArray(cents) ? cents.map(toDollars) : toDollars(cents);
}

function toDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const one = formatPrice(4500);          // string
const many = formatPrice([4500, 1299]); // string[]
```

The first two lines are the **overload signatures** callers see. The third is the **implementation signature**, which must be compatible with all of them and is invisible from outside. TypeScript tries the overloads top to bottom and uses the first that matches, so list the most specific first.

Overloads have one sharp edge: a caller holding a `number | number[]` matches *neither* overload, and gets "No overload matches this call". You would need a third overload that accepts the union. That edge is a hint about the design. If callers often have the union, the function probably wants a single signature; if they rarely do, two separate functions with clear names (`formatPrice`, `formatPrices`) usually beat one overloaded one.

:::tip A default for API design
Prefer, in order: separate, well-named functions; a single signature with a union where the return type does not depend on the input; overloads when you are typing an existing JavaScript API or the convenience really matters. Conditional return types on generic functions come last; they usually need casts inside the implementation, which you will see in section 3.
:::

In the exercise you will fix three of these inference problems in Cartwheel's checkout. The next lesson puts everything from this section together in one typed API client.
