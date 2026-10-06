---
summary: Stop literals from widening into string, derive union types from runtime arrays with as const, and validate config objects with satisfies without losing their precise types.
takeaways:
  - "`let` variables and object properties widen literals to `string` or `number`; `const` variables keep the literal."
  - "`as const` makes a value deeply readonly and keeps every literal, which lets you derive a union type from a runtime array."
  - "A type annotation replaces the inferred type with the annotated one; `satisfies` checks against a type and keeps the inferred one."
  - "`as` assertions skip checks such as missing properties, so use `satisfies` when you want validation rather than trust."
further:
  - title: The satisfies operator (TypeScript 4.9 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html
  - title: Literal types
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types
  - title: const assertions (TypeScript 3.4 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html
quiz:
  - q: |
      Why does `save(draft)` fail when `Order['status']` is `'processing' | 'shipped'`?
      ```ts
      const draft = { id: 1001, status: 'processing' };
      save(draft);
      ```
    options:
      - text: Because `const` makes the whole object readonly, and `save` expects a mutable one.
        why: "`const` only stops reassigning `draft`. Its properties stay mutable, which is exactly why they widen."
      - text: Because `draft.status` is inferred as `string`; object properties widen since they could be reassigned later.
        why: Correct. Write the literal where the type is known (`save({ … })`), annotate `draft` as `Order`, or use `as const`.
      - text: Because `draft` has no `customerId`.
        why: The `Order` in the question only needs `id` and `status`. The failure is about the widened `status`.
    answer: 1
  - q: |
      What is `Country` here?
      ```ts
      const COUNTRIES = ['EG', 'AE', 'GB'] as const;
      type Country = (typeof COUNTRIES)[number];
      ```
    options:
      - text: "`string`"
        why: That would be the result without `as const`, where the array is inferred as `string[]`.
      - text: "`readonly ['EG', 'AE', 'GB']`"
        why: That is `typeof COUNTRIES`. Indexing it with `[number]` gives the type of its elements.
      - text: "`'EG' | 'AE' | 'GB'`"
        why: Correct. `as const` keeps the literals, and `[number]` asks for the type of any element of the tuple.
    answer: 2
  - q: |
      `coupons` is declared with `satisfies Record<string, Coupon>`. Which line is an error?
      ```ts
      type Coupon = { kind: 'percent'; percentOff: number } | { kind: 'free-shipping' };
      const coupons = {
        WELCOME10: { kind: 'percent', percentOff: 10 },
        FREESHIP: { kind: 'free-shipping' },
      } satisfies Record<string, Coupon>;
      ```
    options:
      - text: "`coupons.WELCOME10.percentOff`"
        why: "`satisfies` keeps the inferred type, so TypeScript knows `WELCOME10` is the percent variant and `percentOff` exists."
      - text: "`coupons.FREESHIP.kind === 'free-shipping'`"
        why: The inferred type of `kind` is the literal `'free-shipping'`, so this comparison is valid (and always true).
      - text: "`coupons.SPRING15`"
        why: Correct. The inferred type has only the two keys you wrote, so reading an unknown key is an error, unlike with a `Record<string, Coupon>` annotation.
    answer: 2
  - q: "A teammate writes `const config = { retries: 3 } as CheckoutConfig;`, and `CheckoutConfig` also requires `timeoutMs`. What happens?"
    options:
      - text: It compiles, because an assertion only needs the types to overlap; the missing `timeoutMs` is never reported.
        why: Correct. `as` tells the compiler to trust you. Use `satisfies CheckoutConfig` or an annotation to get the missing-property error.
      - text: It fails with "Property 'timeoutMs' is missing".
        why: That error comes from annotations and `satisfies`. An assertion only rejects types that do not overlap at all.
      - text: "It adds `timeoutMs: undefined` to the object at runtime."
        why: Type assertions are erased completely; they never add or change values.
    answer: 0
---

Here is a bug report that every TypeScript team has filed at least once: "I'm passing exactly the right string and it says `Type 'string' is not assignable to type 'OrderStatus'`."

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
type Order = { id: number; status: OrderStatus };
function save(order: Order) {}

const draft = { id: 1001, status: 'processing' };
save(draft);
// Error: Argument of type '{ id: number; status: string; }' is not assignable
// to parameter of type 'Order'.
```

The string *is* `'processing'`. But TypeScript did not infer `'processing'` for it. It inferred `string`. This is **widening**, and understanding it explains three tools you will use every week: literal types, `as const` and `satisfies`.

## Why literals widen

TypeScript infers the type a value is likely to have *for its whole life*, not just the value it starts with. A `const` can never change, so it keeps the literal. A `let` or an object property can be reassigned, so TypeScript widens it:

```ts
const a = 'processing';           // 'processing'
let b = 'processing';             // string
const c = { status: 'processing' }; // { status: string }
```

The last one is the surprise. `const c` stops you reassigning `c`, but `c.status = 'anything'` is still legal JavaScript, so the property widens to `string`.

There are three good fixes, in order of preference. Write the literal where the type is already known (`save({ id: 1001, status: 'processing' })`), so it is checked against `Order` directly. Annotate the variable (`const draft: Order = …`) when you build it ahead of time. Or use `as const`, which comes next.

## as const: freeze the literals

`as const` tells TypeScript to infer the narrowest possible type: every literal stays a literal, every array becomes a readonly tuple, every property becomes `readonly`:

```ts
const COUNTRIES = ['EG', 'AE', 'SA', 'JO', 'GB', 'DE', 'US', 'CA'] as const;
// readonly ['EG', 'AE', 'SA', 'JO', 'GB', 'DE', 'US', 'CA']

type Country = (typeof COUNTRIES)[number];
// 'EG' | 'AE' | 'SA' | 'JO' | 'GB' | 'DE' | 'US' | 'CA'
```

That second line is one of the most useful patterns in everyday TypeScript. `typeof COUNTRIES` turns the value into its type, and `[number]` asks "what type do I get when I index this with any number?" (you will meet both operators properly in [keyof, typeof and Indexed Access Types](lesson:l-at-3-1)). The result is a union that is **derived from a runtime array**. You get one source of truth: the array exists at runtime for dropdowns and validation, and the type follows it automatically.

```ts
function isCountry(value: string): value is Country {
  return (COUNTRIES as readonly string[]).includes(value);
}
```

The widening cast inside `isCountry` is needed because `includes` on a tuple of literals only accepts those literals, which defeats the point of a check on an arbitrary string.

:::tip Prefer literal unions to enums
`enum OrderStatus { Processing = 'processing', … }` gives you a similar union, but enums generate runtime code, are not compatible with plain string values from JSON without a cast, and are not supported by type stripping (Node's built-in TypeScript support rejects them, and so does the `erasableSyntaxOnly` flag). An `as const` array or object plus a derived union does the same job in plain JavaScript.
:::

## Annotation versus satisfies

Cartwheel's coupons live in a config object. The obvious way to type it is an annotation:

```ts
type Coupon = { kind: 'percent'; percentOff: number } | { kind: 'free-shipping' };

const coupons: Record<string, Coupon> = {
  WELCOME10: { kind: 'percent', percentOff: 10 },
  FREESHIP: { kind: 'free-shipping' },
};

coupons.WELCOME10.percentOff; // Error: Property 'percentOff' does not exist on type 'Coupon'.
coupons.SPRNG15;              // compiles, undefined at runtime
```

The annotation *replaces* what TypeScript knew. You wrote `WELCOME10` as a percent coupon, but its type is now just `Coupon`, and the object accepts any key at all, typos included.

`satisfies` checks the value against a type **without replacing the inferred type**:

```ts
const coupons = {
  WELCOME10: { kind: 'percent', percentOff: 10 },
  FREESHIP: { kind: 'free-shipping' },
} satisfies Record<string, Coupon>;

coupons.WELCOME10.percentOff; // number
coupons.SPRNG15;              // Error: Property 'SPRNG15' does not exist on type …
```

You still get validation: a misspelled `percentof` or a `kind: 'bogo'` is flagged right in the object literal. And you keep the precise keys and variants. `satisfies` also contextually types the literals, so `kind` stays `'percent'` instead of widening to `string`, without needing `as const`.

Use the combination `as const satisfies T` when you want both: deeply readonly literals and a check against a shape. It reads left to right as "freeze this, then make sure it fits".

:::mistake Using as to make an error go away
`const config = { retries: 3 } as CheckoutConfig` compiles even when `CheckoutConfig` requires `timeoutMs`, because an assertion only checks that the types overlap. It is you overruling the compiler. Reserve `as` for the rare case where you know more than TypeScript (and leave a comment saying why). When you want a check, use an annotation or `satisfies`.
:::

## Choosing between them

A simple default: **annotate** function parameters, return types and variables whose type should be the general one (`let current: Order`). Use **`satisfies`** for config objects, lookup tables and anything where the specific keys and values matter later. Use **`as const`** for fixed lists you want as a union. All three are compile-time only; none of them changes a byte of the emitted JavaScript.

In the exercise you will derive `Country` from Cartwheel's country list and type the currency table so that it rejects unknown countries and remembers exact currencies. That completes the design toolkit for this section; next you move on to generics, starting with the relationships they express.
