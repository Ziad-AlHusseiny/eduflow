---
summary: Predict what TypeScript infers for a type parameter, keep literal types with constraints and const type parameters, and order callback arguments so inference flows the right way.
takeaways:
  - Every place a type parameter appears in a parameter type is an inference site; TypeScript collects a candidate from each argument and picks one type.
  - Inferred literals widen unless the type parameter's constraint includes a primitive type or the parameter is declared `const`.
  - A `const` type parameter infers arguments as if they were written with `as const`, keeping literals and readonly tuples without asking the caller.
  - Callbacks with unannotated parameters are inferred after other arguments, and inside one object literal TypeScript works left to right.
  - Explicit type arguments are all or nothing; specify one and TypeScript stops inferring the rest.
further:
  - title: Type Inference
    url: https://www.typescriptlang.org/docs/handbook/type-inference.html
  - title: const type parameters (TypeScript 5.0 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html
quiz:
  - q: |
      What is the type of `b`?
      ```ts
      function box<T>(value: T): { value: T } { return { value }; }
      const b = box('processing');
      ```
    options:
      - text: "`{ value: 'processing' }`"
        why: That is what you would get with `T extends string` or a `const` type parameter. An unconstrained `T` nested in the return type widens.
      - text: "`{ value: string }`"
        why: Correct. The literal candidate widens because `T` has no primitive constraint and is not returned at the top level.
      - text: "`{ value: unknown }`"
        why: "`unknown` is what TypeScript falls back to when it finds no candidate at all. Here it found one: the string argument."
    answer: 1
  - q: Which declaration makes `defineFlow(['processing', 'shipped'])` return the type `readonly ['processing', 'shipped']` without the caller writing `as const`?
    options:
      - text: "`function defineFlow<T>(steps: T[]): T[]`"
        why: This infers `T` as `string` and returns `string[]`; the order and the literals are both lost.
      - text: "`function defineFlow<T extends string>(steps: T[]): T[]`"
        why: The constraint keeps the literals, but you get the array type `('processing' | 'shipped')[]`, not a readonly tuple.
      - text: "`function defineFlow<const T extends readonly string[]>(steps: T): T`"
        why: Correct. The `const` modifier infers the argument as if it had `as const`, so you get a readonly tuple of literals.
      - text: "`function defineFlow(steps: readonly string[]): readonly string[]`"
        why: Without a type parameter there is nothing to capture the argument's precise type.
    answer: 2
  - q: |
      Why is `d` typed as `unknown` here?
      ```ts
      createStep({
        render: (d) => d.totalCents.toFixed(),
        load: (orderId) => ({ orderId, totalCents: 4500 }),
      });
      ```
    options:
      - text: Because `render` comes before `load`, and TypeScript infers context-sensitive functions in an object literal from left to right.
        why: Correct. When `render` is checked, `T` has no candidate yet. Put `load` first, or annotate `orderId` so `load` is not context-sensitive.
      - text: Because `T` cannot be inferred from a return type.
        why: It can; `load`'s return type is the inference site for `T`. The problem is when that site is visited.
      - text: Because arrow functions in object literals disable inference.
        why: Inference works fine in object literals; swapping the two properties makes this compile.
    answer: 0
  - q: "`function convert<From, To>(value: From, to: (v: From) => To): To` is called as `convert<string>('12', Number)`. What happens?"
    options:
      - text: "`To` is inferred as `number` from `Number`."
        why: TypeScript does not do partial inference. Once you pass any explicit type argument, it expects all of the required ones.
      - text: It is an error, "Expected 2 type arguments, but got 1".
        why: Correct. Explicit type arguments are all or nothing, unless the remaining parameters have defaults.
      - text: "`To` becomes `unknown`, and the call compiles."
        why: Missing type arguments only fall back silently when they have defaults. Without one, the call is rejected.
    answer: 1
---

In the last lesson you wrote `sortByTotal(orders)` and TypeScript worked out that `T` was `DetailedOrder`. Most of the time inference does what you want, which makes the times it does not feel random. They are not. TypeScript follows a small set of rules, and once you know them you can design signatures that infer exactly the type you intend, with no `<…>` at the call site.

## Inference sites and candidates

Every place a type parameter appears inside a parameter's type is an **inference site**. At a call, TypeScript matches each argument against its parameter type and collects a **candidate** for the type parameter from each site. Then it picks one type from the candidates.

```ts
function same<T>(a: T, b: T): T[] {
  return [a, b];
}

same('processing', 'shipped'); // T = string, so string[]
same(1, 'a');
// Error: Argument of type 'string' is not assignable to parameter of type 'number'.
```

With two string literals, the candidates `'processing'` and `'shipped'` are combined and then widened to `string`, because `T` is only returned inside an array (the next section explains when literals survive). With `1` and `'a'`, TypeScript does not invent `number | string`; it picks the first candidate, `number`, and then the second argument fails against it. That is deliberate. Silently widening to a union would hide the bugs generics are meant to catch. If you really want mixed values, say so: `same<number | string>(1, 'a')`.

:::figure From arguments to a chosen type to the return type
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">Inference pipeline. Two arguments at the call site each produce a candidate for T through their inference sites. The candidates are combined and widened by rules into one chosen T, which is then substituted into the return type.</title>
  <rect class="d-box" x="10" y="30" width="170" height="44" rx="10"/>
  <text class="d-code" x="95" y="57" text-anchor="middle">a: 'processing'</text>
  <rect class="d-box" x="10" y="130" width="170" height="44" rx="10"/>
  <text class="d-code" x="95" y="157" text-anchor="middle">b: 'shipped'</text>
  <path class="d-arrow" d="M180 52 L250 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M180 152 L250 116" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="254" y="66" width="180" height="72" rx="12"/>
  <text class="d-label-strong" x="344" y="94" text-anchor="middle">candidates</text>
  <text class="d-label-muted" x="344" y="118" text-anchor="middle">combine, widen?</text>
  <path class="d-arrow" d="M434 102 L478 102" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="482" y="66" width="208" height="72" rx="12"/>
  <text class="d-label-strong" x="586" y="94" text-anchor="middle">T chosen</text>
  <text class="d-code" x="586" y="118" text-anchor="middle">string</text>
  <path class="d-arrow" d="M586 138 L586 172" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="482" y="176" width="208" height="44" rx="10"/>
  <text class="d-code" x="586" y="203" text-anchor="middle">return: T[]</text>
</svg>
:::

## When literals widen

The second rule explains most "why did I get `string`?" moments. A literal candidate like `'processing'` is kept or widened depending on the signature:

```ts
function identity<T>(value: T): T { return value; }
function box<T>(value: T): { value: T } { return { value }; }
function boxStatus<T extends string>(value: T): { value: T } { return { value }; }

const a = identity('processing');  // 'processing'
const b = box('processing');       // { value: string }
const c = boxStatus('processing'); // { value: 'processing' }
```

The literal survives when `T` is returned directly at the top level (`identity`), or when `T`'s constraint includes a primitive type such as `string` (`boxStatus`). Otherwise it widens, on the theory that a value tucked into an object will probably be reassigned later.

Objects follow the same logic, and here a constraint has a second benefit: it gives the argument a **contextual type**.

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

function draft<T>(order: T): T { return order; }
function draftOrder<T extends { status: OrderStatus }>(order: T): T { return order; }

draft({ status: 'processing' });      // { status: string }
draftOrder({ status: 'processing' }); // { status: 'processing' }
```

Because the constraint says `status` is an `OrderStatus`, TypeScript checks the literal against that union while inferring, and the literal type sticks. A good constraint both documents the function and improves what it infers.

## const type parameters

Sometimes you want the caller's argument exactly as written: tuple order, literal values, nested objects. Before TypeScript 5.0 that meant asking every caller to write `as const`. Now the function can ask for it:

```ts
function defineFlow<const T extends readonly OrderStatus[]>(steps: T): T {
  return steps;
}

const happyPath = defineFlow(['processing', 'shipped', 'delivered']);
// readonly ['processing', 'shipped', 'delivered']
```

The `const` modifier tells TypeScript to infer the argument as if it had `as const`: literals stay literal, arrays become readonly tuples, object properties become readonly. Pair it with a `readonly` array constraint, since `as const` produces readonly arrays. It only affects literals written directly in the call; a variable you pass in keeps whatever type it already had.

:::tip When to reach for const
Use `const` type parameters for definition-style APIs: route tables, feature flags, state machines, form schemas, anything where the caller writes a literal once and you derive types from it. You will use one in [Designing a Typed API Client](lesson:l-at-2-4). For ordinary data functions like `sortByTotal`, it adds nothing.
:::

## Callbacks are inferred last

Arguments that are functions with unannotated parameters, such as `(d) => d.totalCents`, are **context-sensitive**: their parameter types come from the signature, which may still depend on `T`. TypeScript infers from everything else first, then types these callbacks. Inside a single object literal, it works through context-sensitive properties from left to right:

```ts
function createStep<T>(config: { load: (orderId: number) => T; render: (data: T) => string }) {}

createStep({
  load: (orderId) => ({ orderId, totalCents: 4500 }),
  render: (d) => d.totalCents.toFixed(), // d: { orderId: number; totalCents: number }
});

createStep({
  render: (d) => d.totalCents.toFixed(), // Error: 'd' is of type 'unknown'.
  load: (orderId) => ({ orderId, totalCents: 4500 }),
});
```

When `render` comes first, `T` has no candidate yet. You can fix it at the call site by swapping the properties or annotating `orderId: number`, which makes `load` no longer context-sensitive. Better, fix it in the API: put the producer before the consumer in your parameter lists and documented examples, so the natural way to call it is the way that infers.

:::mistake Expecting partial inference
`convert<string>('12', Number)` on a function with two type parameters is an error, "Expected 2 type arguments, but got 1". TypeScript does not infer the rest once you specify any. Either let it infer everything, give the later parameters defaults (they then take the default type, not an inferred one), or split the function in two (`convert('12').to(Number)`), which is the shape many typed libraries use for exactly this reason. The next lesson covers defaults and the other inference controls.
:::

In the exercise you will make three Cartwheel helpers keep the literals their callers pass. Next, you will learn to stop inference from happening where it should not.
