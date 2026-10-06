---
summary: Derive types from runtime values and from other types with typeof, keyof and indexed access, so a change in one place flows through the codebase instead of drifting.
takeaways:
  - In a type position, `typeof value` gives the type TypeScript inferred for that value, bridging runtime code into the type system.
  - "`keyof T` is the union of `T`'s property names, and `T[K]` is the type of the property (or properties) named by `K`."
  - "`(typeof CONFIG)[keyof typeof CONFIG]` gives the union of an object's value types, and `T[number]` gives an array's element type."
  - "`Object.keys` returns `string[]` on purpose: structural typing means an object can have more keys than its type lists."
further:
  - title: Keyof Type Operator
    url: https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
  - title: Typeof Type Operator
    url: https://www.typescriptlang.org/docs/handbook/2/typeof-types.html
  - title: Indexed Access Types
    url: https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
quiz:
  - q: |
      What is `Zone`?
      ```ts
      const SHIPPING_ZONES = {
        domestic: { feeCents: 499 },
        gulf: { feeCents: 1299 },
      } as const;
      type Zone = keyof typeof SHIPPING_ZONES;
      ```
    options:
      - text: "`'domestic' | 'gulf'`"
        why: Correct. `typeof` turns the value into its type, and `keyof` takes the union of its property names.
      - text: "`string`"
        why: "`keyof` on an object type with known properties gives those exact names, not `string`. You get `string` only from an index signature."
      - text: "`{ feeCents: 499 } | { feeCents: 1299 }`"
        why: That is the union of the values, which you would get with `(typeof SHIPPING_ZONES)[Zone]`.
      - text: It is an error, because `keyof` needs a type, not a value.
        why: "`typeof` in a type position converts the value first, so `keyof` does receive a type."
    answer: 0
  - q: "`type CheckoutResponse = { lines: { sku: string; qty: number }[] }`. Which type is `{ sku: string; qty: number }`?"
    options:
      - text: "`CheckoutResponse.lines[0]`"
        why: Dot access does not exist in type positions; TypeScript reads `CheckoutResponse.lines` as a namespace lookup and fails.
      - text: "`CheckoutResponse['lines']`"
        why: "That is the whole array type, `{ sku: string; qty: number }[]`, not one element."
      - text: "`keyof CheckoutResponse['lines']`"
        why: That gives the array's keys (`number`, `'length'`, `'map'` …), not its elements.
      - text: "`CheckoutResponse['lines'][number]`"
        why: Correct. Indexing an array type with `number` gives its element type.
    answer: 3
  - q: "What is `keyof (ShippedOrder | CancelledOrder)` when both have `id` and `status`, only `ShippedOrder` has `trackingNumber`, and only `CancelledOrder` has `cancelReason`?"
    options:
      - text: "`'id' | 'status' | 'trackingNumber' | 'cancelReason'`"
        why: That would let you read `trackingNumber` from a value that might be a cancelled order, which is unsafe.
      - text: "`'id' | 'status'`"
        why: Correct. A key of a union must be a key of every member, so only the shared properties remain.
      - text: "`never`, because the two types are different"
        why: The members share `id` and `status`, so those keys survive.
    answer: 1
  - q: Why does `Object.keys(order)` return `string[]` instead of `(keyof Order)[]`?
    options:
      - text: Because the TypeScript team has not got round to typing it yet.
        why: It is a deliberate choice that follows from how the type system works, not an omission.
      - text: Because `keyof` is not available in lib files.
        why: Lib files use `keyof` all over the place; this is not a technical limitation.
      - text: Because a value of type `Order` can have extra properties at runtime that the type does not list.
        why: Correct. Structural typing lets a `DetailedOrder` pass as an `Order`, so its extra keys would show up at runtime.
    answer: 2
---

Cartwheel's shipping zones live in a config object. The first version of the code described them twice: once as data, once as types.

```ts
const SHIPPING_ZONES = {
  domestic: { countries: ['US', 'CA'], feeCents: 499 },
  gulf: { countries: ['AE', 'SA'], feeCents: 1299 },
  europe: { countries: ['GB', 'DE'], feeCents: 999 },
};

type Zone = 'domestic' | 'gulf' | 'europe'; // written by hand
```

Six months later someone added a `levant` zone to the object and forgot the type. Nothing failed to compile; the new zone just could not be selected anywhere. Every hand-written copy of a fact is a copy that can drift. This lesson covers the three operators that let you write the fact once and **derive** the rest.

## typeof: from values to types

In a type position, `typeof` takes a *value* and gives you the type TypeScript inferred for it. It is not the JavaScript `typeof` operator (which returns strings like `'object'` at runtime); it only exists at compile time.

```ts
const SHIPPING_ZONES = {
  domestic: { countries: ['US', 'CA'], feeCents: 499 },
  gulf: { countries: ['AE', 'SA'], feeCents: 1299 },
  europe: { countries: ['GB', 'DE'], feeCents: 999 },
} as const;

type ShippingZones = typeof SHIPPING_ZONES;
// { readonly domestic: { readonly countries: readonly ['US', 'CA']; readonly feeCents: 499 }; … }
```

`as const` matters here, as it did in [Literal Types, as const and satisfies](lesson:l-at-1-5). Without it, `countries` would be `string[]` and `feeCents` would be `number`, and you would lose the details worth deriving.

`typeof` works on functions too: `typeof formatPrice` is the function's full signature, which you can feed to utility types such as `ReturnType<typeof formatPrice>`. You will build `ReturnType` yourself in two lessons.

When should the value be the source and the type derived, rather than the other way round? Use `typeof` when the data *is* the definition: lookup tables, zone configs, lists of options that also render in the UI. Write the type first when the shape is a contract with someone else, such as an API payload, and check values against it.

:::figure typeof crosses from values to types; keyof and indexing work on types
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">Two worlds. In the value world sits the SHIPPING_ZONES object. typeof carries it into the type world as a type. From there, keyof produces the union of zone names, and indexed access with those names produces the union of zone configs, and indexing further gives fees.</title>
  <rect class="d-box" x="10" y="20" width="200" height="190" rx="14"/>
  <text class="d-label-strong" x="110" y="48" text-anchor="middle">Values (runtime)</text>
  <rect class="d-box-accent" x="30" y="90" width="160" height="50" rx="10"/>
  <text class="d-code" x="110" y="120" text-anchor="middle">SHIPPING_ZONES</text>
  <path class="d-arrow" d="M190 115 L268 115" marker-end="url(#arrow)"/>
  <text class="d-code" x="229" y="105" text-anchor="middle">typeof</text>
  <rect class="d-box" x="272" y="20" width="418" height="190" rx="14"/>
  <text class="d-label-strong" x="481" y="48" text-anchor="middle">Types (compile time)</text>
  <rect class="d-box-primary" x="292" y="90" width="120" height="50" rx="10"/>
  <text class="d-code" x="352" y="120" text-anchor="middle">Zones</text>
  <path class="d-arrow" d="M412 104 L462 80" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="466" y="58" width="210" height="40" rx="10"/>
  <text class="d-code" x="571" y="83" text-anchor="middle">keyof → 'domestic' | …</text>
  <path class="d-arrow" d="M412 126 L462 150" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="466" y="132" width="210" height="40" rx="10"/>
  <text class="d-code" x="571" y="157" text-anchor="middle">[K]['feeCents'] → 499 | …</text>
</svg>
:::

## keyof: the names of the properties

`keyof T` is the union of `T`'s property names:

```ts
type Zone = keyof typeof SHIPPING_ZONES; // 'domestic' | 'gulf' | 'europe'
```

Add `levant` to the object and `Zone` updates itself. That is the whole point.

Two details are worth knowing. First, for a type with an index signature such as `Record<string, number>`, `keyof` gives `string` (and `string | number` for `{ [k: string]: … }`, because JavaScript converts numeric keys to strings). Second, `keyof` on a union gives only the keys **every** member has. `keyof (ShippedOrder | CancelledOrder)` is `'id' | 'status'`, because reading `trackingNumber` from something that might be a cancelled order is not safe.

## Indexed access: the type of a property

`T[K]` looks up the type of property `K` in `T`, using the same bracket syntax as runtime property access:

```ts
type GulfZone = ShippingZones['gulf'];             // { readonly countries: …; readonly feeCents: 1299 }
type GulfFee = ShippingZones['gulf']['feeCents'];  // 1299
type ZoneConfig = ShippingZones[Zone];             // union of all three configs
type FeeCents = ShippingZones[Zone]['feeCents'];   // 499 | 1299 | 999
type ShippingCountry = ShippingZones[Zone]['countries'][number]; // 'US' | 'CA' | 'AE' | …
```

Indexing with a union gives a union of the results, so `ShippingZones[Zone]` is "the value type of any zone". The idiom `(typeof X)[keyof typeof X]` is how you get the union of an object's values, and it comes up often enough that many codebases name it `ValueOf<T>`.

Arrays and tuples are indexed by `number`: `T[number]` is the element type. That is the `(typeof COUNTRIES)[number]` you used in section 1, and the last line above, which digs through two levels of objects and one array to collect every country in every zone.

The same trick works on API types you did not write. If a generated client gives you a big `CheckoutResponse`, you can name the line-item type as `CheckoutResponse['lines'][number]` instead of copying its fields.

:::mistake Using dot access in types
`CheckoutResponse.lines` in a type position does not mean "the type of the `lines` property". TypeScript reads the dot as a namespace lookup and reports *Cannot access 'CheckoutResponse.lines' because 'CheckoutResponse' is a type, but not a namespace*, helpfully suggesting the fix. Types always use brackets: `CheckoutResponse['lines']`.
:::

## Why Object.keys returns string[]

Sooner or later you will write this and be annoyed:

```ts
for (const zone of Object.keys(SHIPPING_ZONES)) {
  SHIPPING_ZONES[zone]; // Error: 'string' can't be used to index type …
}
```

`Object.keys` returns `string[]`, not `Zone[]`, and this is deliberate. Remember structural typing: a value whose type is `{ a: number }` can be an object with ten more properties at runtime. If `Object.keys` promised `(keyof T)[]`, it would be lying about those ten.

For a `const` object you defined yourself, with no way for extra keys to sneak in, a local cast is reasonable and honest: `Object.keys(SHIPPING_ZONES) as Zone[]`. For objects that came from elsewhere, keep `string` and check each key.

:::tip Derive in one direction
Pick a single source of truth and derive from it in one direction. Either the runtime object is the source and types come from `typeof`, or a type is the source and runtime values are checked with `satisfies`. Mixing both (some fields hand-typed, some derived) is how drift comes back.
:::

In the exercise you will derive five types from Cartwheel's shipping config and API response. Next lesson goes one step further: instead of *reading* properties from a type, you will *transform* every property of a type at once.
