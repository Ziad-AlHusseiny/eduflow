---
summary: Predict when TypeScript accepts one type where another is expected, including excess property checks and function parameters, so assignability errors stop surprising you.
takeaways:
  - TypeScript compares shapes, not names; any value with the required properties is assignable, whatever its type is called.
  - Read a type as the set of values it allows; an object type with more required properties describes a smaller set.
  - Excess property checks only apply to fresh object literals, which is why passing a variable with an extra field compiles.
  - Function parameters are checked in the opposite direction, but methods declared with method syntax are checked bivariantly, so prefer property syntax for callbacks.
further:
  - title: Type Compatibility
    url: https://www.typescriptlang.org/docs/handbook/type-compatibility.html
  - title: strictFunctionTypes
    url: https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html
quiz:
  - q: |
      Does this compile?
      ```ts
      type Money = { amountCents: number; currency: string };
      const product = { sku: 'TENT-2P', amountCents: 18900, currency: 'USD' };
      const price: Money = product;
      ```
    options:
      - text: Yes, because `product` has every property `Money` requires and extra properties are allowed on a non-fresh value.
        why: Correct. `product` is a variable, not a fresh literal, so the excess `sku` is not checked; the shape matches.
      - text: No, because `product` was never declared as a `Money`.
        why: TypeScript is structural; it never asks what a value was declared as, only whether its shape fits.
      - text: No, because `sku` is an excess property.
        why: Excess property checks only run on object literals written directly where the type is expected. Through a variable, extra fields are fine.
    answer: 0
  - q: Thinking of types as sets of values, which statement is true?
    options:
      - text: "`{ id: number; status: string }` is a bigger set than `{ id: number }`."
        why: Each required property is an extra condition a value must meet, so adding one shrinks the set, not grows it.
      - text: "`never` contains every value, which is why it is assignable to everything."
        why: "`never` is the empty set. It is assignable to everything because the empty set is a subset of every set."
      - text: "`'EUR'` is a subset of `string`, so a `'EUR'` is assignable to `string` but not the reverse."
        why: Correct. Assignability is the subset relation; a wider set cannot flow into a narrower one without a check.
      - text: "`unknown` and `any` are both the empty set."
        why: "`unknown` is the set of all values. `any` is not a set at all; it turns checking off in both directions."
    answer: 2
  - q: |
      Why does this compile under `strict`?
      ```ts
      type CheckoutEvent = { type: 'paid' } | { type: 'shipped'; carrier: string };
      interface Listener { onEvent(e: CheckoutEvent): void }
      const l: Listener = { onEvent: (e: { type: 'shipped'; carrier: string }) => {} };
      ```
    options:
      - text: Because arrow functions are never checked against interfaces.
        why: Arrow functions are checked like any other function. The leniency comes from how `onEvent` is declared.
      - text: Because `onEvent` uses method syntax, and method parameters are checked bivariantly even with `strictFunctionTypes`.
        why: "Correct. Writing `onEvent: (e: CheckoutEvent) => void` instead makes the parameter check strict and rejects this listener."
      - text: Because a union parameter accepts any of its members.
        why: The listener must handle every member of the union. Accepting only one member is unsafe, which strict checking would catch.
    answer: 1
  - q: Which call is rejected by an excess property check?
    options:
      - text: "`ship(order)` where `order` is a variable with an extra `notes` field"
        why: Variables are not fresh, so their extra properties are not checked.
      - text: "`ship({ ...order, notes: 'gift' })` where `Order` has no `notes` field"
        why: Correct. A literal with a spread is still a fresh object literal, and `notes` is written directly in it, so it is flagged. (Extra fields that arrive through `...order` itself are not checked.)
      - text: "`ship(order as Order)` where `order` has an extra `notes` field"
        why: A type assertion tells the compiler to trust you, which skips the excess check entirely.
    answer: 1
---

Here is a function from Cartwheel's checkout client and a call that surprises people coming from Java or C#:

```ts
type Money = { amountCents: number; currency: string };

function formatMoney(m: Money): string {
  return `${(m.amountCents / 100).toFixed(2)} ${m.currency}`;
}

const tent = { sku: 'TENT-2P', name: 'Two-person tent', amountCents: 18900, currency: 'USD' };
formatMoney(tent); // compiles: "189.00 USD"
```

`tent` was never declared as `Money`. It is a product. TypeScript accepts it anyway, because TypeScript does not ask what something is called. It asks whether it has the right shape. This is **structural typing**, and once you see it clearly, most "why does this compile?" moments go away.

## Types are sets of values

The most useful mental model for this whole course: a type is a set of values. `string` is the set of all strings. `'USD'` is the set with one value in it. `'USD' | 'EUR'` has two.

**Assignability is the subset relation.** A value of type A can go where B is expected when every A is also a B. Every `'USD'` is a string, so `'USD'` is assignable to `string`. Not every string is `'USD'`, so the reverse needs a check.

Object types work the same way, with a twist that trips people up. `{ id: number }` is the set of all values that have a numeric `id`. `{ id: number; status: string }` adds a second condition, so fewer values qualify. **More properties means a smaller set.** That is why a full `Order` can be passed where `{ id: number }` is expected: it is in the smaller set, so it is in the bigger one too.

:::figure Assignability is the subset relation: narrower types fit inside wider ones
<svg viewBox="0 0 680 280" role="img" aria-labelledby="t1">
  <title id="t1">Two nested-set diagrams. Left: unknown contains string, which contains the union of USD and EUR, which contains USD. Right: an object with id contains an object with id and status, which contains a full Order. Every value in an inner set also belongs to the sets around it.</title>
  <rect class="d-box" x="10" y="20" width="320" height="240" rx="14"/>
  <text class="d-label-muted" x="26" y="46">unknown</text>
  <rect class="d-box-accent" x="40" y="60" width="260" height="180" rx="12"/>
  <text class="d-label" x="56" y="86">string</text>
  <rect class="d-box-primary" x="70" y="100" width="200" height="120" rx="10"/>
  <text class="d-code" x="86" y="126">'USD' | 'EUR'</text>
  <rect class="d-box-success" x="100" y="146" width="140" height="56" rx="8"/>
  <text class="d-code" x="170" y="179" text-anchor="middle">'USD'</text>
  <rect class="d-box" x="350" y="20" width="320" height="240" rx="14"/>
  <text class="d-code" x="366" y="46">{ id }</text>
  <rect class="d-box-accent" x="380" y="60" width="260" height="180" rx="12"/>
  <text class="d-code" x="396" y="86">{ id, status }</text>
  <rect class="d-box-success" x="410" y="100" width="200" height="120" rx="10"/>
  <text class="d-code" x="510" y="150" text-anchor="middle">Order</text>
  <text class="d-label-muted" x="510" y="176" text-anchor="middle">id, status, total…</text>
</svg>
:::

Two special types sit at the edges. `unknown` is the set of every value: anything is assignable to it, and you must check before using it. `never` is the empty set: it is assignable to everything (the empty set is a subset of every set), and nothing is assignable to it. You will lean on both later in the course. `any` is not a set at all; it switches checking off in both directions, which is why one stray `any` can quietly poison everything it touches.

## Excess property checks: the one exception

If extra properties are fine, why does this fail?

```ts
type Order = { id: number; status: string };
function save(order: Order) {}

save({ id: 1001, stauts: 'processing' });
// Error: Object literal may only specify known properties, but 'stauts'
// does not exist in type 'Order'. Did you mean to write 'status'?
```

This is an **excess property check**, a deliberate heuristic layered on top of structural typing. When you write an object literal directly where a type is expected, the literal is "fresh": nothing else can ever see it, so an extra property can only be a typo. TypeScript flags it.

The check only applies to fresh literals:

```ts
const draft = { id: 1001, status: 'processing', stauts: 'oops' };
save(draft); // compiles: draft is not fresh
```

:::mistake Trusting excess checks to protect you
Excess property checks are a typo detector, not a guarantee. The moment a value passes through a variable, a function return, or an `as` assertion, extra properties sail through. If a function must not receive certain fields (say, a card number going to a logger), do not rely on this check; pick the fields you need explicitly.
:::

## Functions: parameters flip the direction

For functions, return types follow the usual rule, but parameters go the other way. A handler that accepts *any* `CheckoutEvent` can stand in for one that only needs `PaymentFailed`. The reverse is unsafe: a handler that only understands `PaymentFailed` would crash on a `shipped` event. Under `strict` (specifically `strictFunctionTypes`), TypeScript rejects it:

```ts
type PaymentFailed = { type: 'payment-failed'; reason: string };
type OrderShipped = { type: 'order-shipped'; carrier: string };
type CheckoutEvent = PaymentFailed | OrderShipped;

type Listener = { onEvent: (e: CheckoutEvent) => void };

const failuresOnly = { onEvent: (e: PaymentFailed) => console.log(e.reason.toUpperCase()) };
const l: Listener = failuresOnly;
// Error: Type '{ onEvent: (e: PaymentFailed) => void; }' is not assignable to type 'Listener'.
//   Types of property 'onEvent' are incompatible.
```

Fewer parameters are also fine: `(e) => {}` and `() => {}` both fit `(e: CheckoutEvent, at: Date) => void`, because a function is allowed to ignore arguments. That is why `orders.forEach((o) => …)` works even though `forEach` passes three arguments.

### The method-syntax loophole

Now write the same type with method syntax:

```ts
interface Listener {
  onEvent(e: CheckoutEvent): void; // method syntax
}
const l: Listener = failuresOnly; // compiles!
```

Parameters of methods declared this way are checked **bivariantly**, even under `strict`. TypeScript keeps this on purpose so that everyday patterns, such as treating an `Array<Dog>` as an `Array<Animal>`, keep compiling. The cost is that the unsafe listener above is accepted.

:::tip Use property syntax for callbacks
When a type describes a callback or handler, write it as a property with a function type: `onEvent: (e: CheckoutEvent) => void`. You get full parameter checking for free. Keep method syntax for classes and objects where the method really is a method.
:::

## When you want names to matter

Sometimes structural typing is too generous. An `OrderId` and a `CustomerId` are both `number`, so nothing stops you swapping them. The fix is to make the shapes differ, which is what branded types do in [Branded Types and Exhaustive Checks](lesson:l-at-4-1). For now, the rule of thumb is enough: if two things have the same shape, TypeScript considers them the same thing.

The exercise below fixes the listener loophole in Cartwheel's event bus. Next, you will see how TypeScript narrows a wide type inside a function, the other half of working with sets.
