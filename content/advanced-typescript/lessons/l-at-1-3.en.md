---
summary: Use typeof, equality, in, instanceof and early returns to narrow wide types, and recognise the places where TypeScript forgets a narrowing so you can keep it.
takeaways:
  - Control-flow analysis gives a variable a different type at each point in the code, based on the checks and returns that came before.
  - Truthiness checks also remove `0` and `''`, so check against `null` or `undefined` explicitly when those values are meaningful.
  - Narrowing of a mutable property is dropped inside callbacks; copy the value into a `const` before the callback to keep it.
  - Since TypeScript 5.5, a simple arrow like `(c) => c !== null` passed to `filter` is inferred as a type predicate, so the result is narrowed.
further:
  - title: Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
  - title: TypeScript 5.5 release notes (inferred type predicates)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html
quiz:
  - q: |
      `shippingFeeCents` is `null` when the fee is not known yet and `0` for free shipping. What does this return for a free-shipping order?
      ```ts
      function label(fee: number | null) {
        if (!fee) return 'Calculated at checkout';
        return fee === 0 ? 'Free' : `${fee / 100}`;
      }
      ```
    options:
      - text: "'Free'"
        why: The `'Free'` branch is unreachable for `0`, because `!0` is `true` and the first return fires first.
      - text: "'Calculated at checkout'"
        why: Correct. The truthiness check treats `0` like `null`. Write `if (fee === null)` instead.
      - text: "'0'"
        why: The function never reaches the template string for `0`; the truthiness check returns before that.
      - text: It does not compile, because `fee === 0` has no overlap after the check.
        why: After `!fee` returns, `fee` is still `number`, and comparing a `number` with `0` is allowed. The bug is silent.
    answer: 1
  - q: |
      Why is `order.coupon` an error inside the callback?
      ```ts
      if (order.coupon !== null) {
        names.map((n) => `${n}: ${order.coupon.toUpperCase()}`);
      }
      ```
    options:
      - text: Because `map` callbacks are not type-checked under `strict`.
        why: Callbacks are fully checked. The error exists precisely because they are.
      - text: Because TypeScript cannot know when the callback runs, and `order.coupon` is a mutable property that could be `null` by then.
        why: Correct. Narrowing a mutable property does not carry into a function created inside the block. Copy it into a `const` first.
      - text: Because `!== null` does not narrow; you need `typeof order.coupon === 'string'`.
        why: Comparing with `null` narrows fine outside the callback. The problem is the callback boundary, not the check.
    answer: 1
  - q: Under TypeScript 5.9, what is the type of `codes`?
    options:
      - text: "`string[]` when written as `coupons.filter((c) => c !== null)` with `coupons: (string | null)[]`"
        why: Correct. TypeScript 5.5 and later infer `(c) => c !== null` as the predicate `c is string`, so `filter` narrows the array.
      - text: "`string[]` when written as `coupons.filter(Boolean)`"
        why: "`Boolean` is not a type predicate, and a truthiness check cannot be one anyway because it also removes `''`. The result stays `(string | null)[]`."
      - text: "`string[]` when written as `coupons.filter((c) => !!c)`"
        why: Truthiness is not inferred as a predicate, because a falsy result does not prove the value is `null`; it might be `''`.
    answer: 0
  - q: "Which check narrows `input: Order | Order[]` to `Order[]`?"
    options:
      - text: "`typeof input === 'array'`"
        why: "`typeof` never returns `'array'`; for arrays it returns `'object'`, and TypeScript flags the comparison."
      - text: "`input instanceof Object`"
        why: Both an `Order` and an array are objects, so this check cannot tell them apart.
      - text: "`'length' in input`"
        why: This narrows only if `Order` has no `length` property, which is fragile; a dedicated check is clearer and safer.
      - text: "`Array.isArray(input)`"
        why: Correct. `Array.isArray` is declared as a type predicate, so the true branch sees `Order[]` and the false branch sees `Order`.
    answer: 3
---

A Cartwheel order has `shippingFeeCents: number | null`. `null` means the fee is not known yet (the address is incomplete). `0` means free shipping. Here is the label shown at checkout, as it was first written:

```ts
function shippingLabel(feeCents: number | null): string {
  if (!feeCents) return 'Calculated at checkout';
  if (feeCents === 0) return 'Free';
  return `$${(feeCents / 100).toFixed(2)}`;
}
```

Every free-shipping customer saw "Calculated at checkout". TypeScript did not complain, because after the first line `feeCents` is `number`, and comparing a number with `0` is perfectly legal. The types were right; the narrowing was wrong. This lesson is about how TypeScript narrows, so you can make it work for you instead of trusting it blindly.

## Control-flow analysis

TypeScript tracks the type of each variable through every branch and return. The same name can have a different type on each line:

```ts
function shippingLabel(feeCents: number | null): string {
  // feeCents: number | null
  if (feeCents === null) return 'Calculated at checkout';
  // feeCents: number
  if (feeCents === 0) return 'Free';
  // feeCents: number
  return `$${(feeCents / 100).toFixed(2)}`;
}
```

This is **control-flow analysis**. Each check splits the flow into branches, and on each branch the variable's type is the set of values that could still be there. When a branch returns, the code after it only sees what is left.

:::figure Each check splits the flow; the type after it is what can still be there
<svg viewBox="0 0 680 300" role="img" aria-labelledby="t1">
  <title id="t1">Control flow of shippingLabel. The parameter starts as number or null. The check feeCents equals null branches to a return with type null. The remaining path has type number, then the check feeCents equals 0 branches to a return for free shipping, and the final path is a positive fee of type number.</title>
  <rect class="d-box-accent" x="230" y="14" width="220" height="44" rx="10"/>
  <text class="d-code" x="340" y="42" text-anchor="middle">number | null</text>
  <path class="d-arrow" d="M340 58 L340 92" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="230" y="96" width="220" height="40" rx="10"/>
  <text class="d-code" x="340" y="121" text-anchor="middle">feeCents === null ?</text>
  <path class="d-arrow" d="M230 116 L110 116 L110 150" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="160" y="108" text-anchor="middle">yes</text>
  <rect class="d-box" x="20" y="154" width="180" height="44" rx="10"/>
  <text class="d-code" x="110" y="181" text-anchor="middle">null → "Calculated…"</text>
  <path class="d-arrow" d="M340 136 L340 170" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="356" y="158">no</text>
  <rect class="d-box-warn" x="230" y="174" width="220" height="40" rx="10"/>
  <text class="d-code" x="340" y="199" text-anchor="middle">number: === 0 ?</text>
  <path class="d-arrow" d="M450 194 L570 194 L570 228" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="510" y="186" text-anchor="middle">yes</text>
  <rect class="d-box" x="480" y="232" width="180" height="44" rx="10"/>
  <text class="d-code" x="570" y="259" text-anchor="middle">0 → "Free"</text>
  <path class="d-arrow" d="M340 214 L340 248" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="230" y="252" width="220" height="40" rx="10"/>
  <text class="d-code" x="340" y="277" text-anchor="middle">number → "$4.99"</text>
</svg>
:::

## The narrowing toolbox

You narrow with ordinary JavaScript checks; TypeScript understands each one:

| Check | Narrows | Example |
|---|---|---|
| `typeof x === 'string'` | primitives | `typeof amount === 'number'` |
| `x === null`, `x !== undefined` | literal values | `coupon !== null` |
| `'prop' in x` | object unions by property | `'trackingNumber' in shipment` |
| `x instanceof C` | class instances | `err instanceof TypeError` |
| `Array.isArray(x)` | arrays | `Array.isArray(input)` |

Truthiness (`if (x)`) also narrows, and it is the one to be careful with. It removes `null` and `undefined`, but also `0`, `''`, `NaN` and `false`. For an object or an array, a truthiness check is fine. For a number or a string where zero or empty means something, compare against `null` explicitly.

### `in` and `instanceof` in practice

Two checks deserve a closer look because the checkout client uses them constantly. The payment provider answers with one of two shapes, and only one has a `receiptId`:

```ts
type PaymentReply = { receiptId: string; capturedCents: number } | { declineCode: string };

function summarize(reply: PaymentReply): string {
  if ('receiptId' in reply) return `Paid, receipt ${reply.receiptId}`;
  return `Declined (${reply.declineCode})`;
}
```

`'receiptId' in reply` keeps only the union members that declare `receiptId`. It works, but it narrows on the *absence* of a field in the other members, so adding `receiptId?` to the decline shape later would quietly break it. When you control the types, a literal discriminant (next lesson) is sturdier.

`instanceof` is the tool for errors. Under `strict`, the variable in a `catch` clause is `unknown`, because JavaScript lets you `throw` anything. You narrow before you touch it:

```ts
function describeFailure(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown error';
}
```

:::mistake Truthiness on numbers and strings
`if (!order.discount)`, `if (!feeCents)` and `if (!couponCode)` all treat a meaningful `0` or `''` as "missing". TypeScript will not warn you, because both readings type-check. When the value can legitimately be zero or empty, write `=== null` or `=== undefined`.
:::

## Where narrowing gets lost

Narrowing is a fact about one point in the flow. A callback runs at some other time, so TypeScript is careful about what it carries inside:

```ts
type Order = { id: number; couponCode: string | null };

function couponBanner(order: Order, names: string[]): string[] {
  if (order.couponCode === null) return [];
  return names.map((n) => `${n}, ${order.couponCode.toUpperCase()} is applied`);
  // Error: 'order.couponCode' is possibly 'null'.
}
```

Outside the arrow function, `order.couponCode` is `string`. Inside it, the narrowing is gone, because `couponCode` is a mutable property and something could set it back to `null` before `map` calls the callback. The fix is to capture the narrowed value in a `const`, which can never change:

```ts
function couponBanner(order: Order, names: string[]): string[] {
  const code = order.couponCode;
  if (code === null) return [];
  return names.map((n) => `${n}, ${code.toUpperCase()} is applied`);
}
```

Since TypeScript 5.4, parameters and `let` variables also keep their narrowing inside callbacks, as long as they are not assigned again after the callback is created. Properties never do. Copying into a `const` works in every version and makes the intent obvious.

:::note TypeScript is optimistic about function calls
The opposite case is allowed: after `if (order.couponCode !== null) { applyDiscount(order); … }`, TypeScript still treats `order.couponCode` as `string`, even though `applyDiscount` might have changed it. Re-checking after every call would make narrowing useless, so TypeScript trusts you here. Avoid functions that mutate their arguments and this never bites.
:::

## Narrowing arrays with filter

`filter` used to be a classic frustration: `coupons.filter((c) => c !== null)` still had type `(string | null)[]`. Since TypeScript 5.5, TypeScript **infers a type predicate** from simple arrow functions like this one, so the result is `string[]`:

```ts
const coupons: (string | null)[] = ['WELCOME10', null, 'LOYAL5'];
const codes = coupons.filter((c) => c !== null); // string[]
```

The inference only happens when the check proves the type in both directions. `(c) => !!c` is not inferred as a predicate: a falsy result could mean `''`, not `null`, so TypeScript cannot conclude that a rejected value is `null`. The same goes for `filter(Boolean)`. Write the explicit comparison and you get both the narrowing and the correct handling of empty strings.

The exercise below has all three bugs from this lesson in one file. In the next lesson you will design types that make narrowing almost automatic: discriminated unions.
