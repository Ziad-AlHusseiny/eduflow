---
summary: Replace bags of optional fields with discriminated unions, so each order state carries exactly the data it has and impossible states stop compiling.
takeaways:
  - A type made of optional fields allows every combination of them, most of which are states your business can never be in.
  - A discriminated union gives each state its own object type, tied together by a shared literal property such as `status`.
  - Checking the discriminant with `===` or `switch` narrows the whole object, so state-specific fields become available without `!`.
  - "Functions that move between states should accept and return specific variants, like `ship(order: ProcessingOrder): ShippedOrder`."
  - An explicit return type on a `switch` over the discriminant turns a forgotten case into a compile error.
further:
  - title: Discriminated unions (Narrowing)
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  - title: Unions and intersection types (Everyday Types)
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
quiz:
  - q: An `Order` type has a `status` with 5 values and 4 optional fields. Roughly how many shapes does the type allow, and how many of them are valid states if each status uses a fixed set of fields?
    options:
      - text: 5 allowed, 5 valid, because `status` controls which fields exist.
        why: Nothing in an optional-field type ties fields to `status`. The compiler sees them as independent.
      - text: 80 allowed (5 × 2⁴), 5 valid.
        why: Correct. Each optional field can be present or absent independently, so most combinations are impossible states that still compile.
      - text: 20 allowed (5 × 4), 5 valid.
        why: Optional fields multiply, they do not add. Four independent yes/no choices give 16 combinations per status.
    answer: 1
  - q: |
      Given the union below, what is the type of `order` inside the `case 'returned':` branch?
      ```ts
      type Order =
        | { status: 'processing'; id: number }
        | { status: 'delivered'; id: number; deliveredAt: string }
        | { status: 'returned'; id: number; deliveredAt: string; refundCents: number };
      ```
    options:
      - text: "`Order`, because `switch` does not narrow objects"
        why: Switching on a literal discriminant narrows the whole object, which is the point of the pattern.
      - text: "`{ status: 'delivered' … } | { status: 'returned' … }`, because both have `deliveredAt`"
        why: "Narrowing follows the discriminant value, not the shared fields. Only one member has `status: 'returned'`."
      - text: "`{ status: 'returned'; id: number; deliveredAt: string; refundCents: number }`"
        why: Correct. Only that member's `status` can equal `'returned'`, so `refundCents` is available as a plain `number`.
    answer: 2
  - q: Which signature best uses the union to prevent shipping an order twice?
    options:
      - text: "`ship(order: Order, tracking: string): Order`"
        why: This accepts a delivered or cancelled order too, and the caller loses the knowledge that the result is shipped.
      - text: "`ship(order: Order, tracking: string): ShippedOrder`"
        why: The return type is better, but any order, including one already shipped, can still be passed in.
      - text: "`ship(order: ShippedOrder, tracking: string): ShippedOrder`"
        why: This only accepts orders that are already shipped, which is the opposite of what the function should allow.
      - text: "`ship(order: ProcessingOrder, tracking: string): ShippedOrder`"
        why: Correct. Only a processing order can go in, and the caller gets back a value the compiler knows is shipped.
    answer: 3
  - q: You add an `'on-hold'` status to the `Order` union. Which function is guaranteed to get a compile error until you handle it?
    options:
      - text: A function with return type `string` whose `switch` returns in every case and has no `default`.
        why: Correct. With the new member unhandled, the end of the function is reachable, so TypeScript reports that it lacks an ending return statement.
      - text: A function that uses `if (order.status === 'shipped') … else …`.
        why: The `else` branch silently absorbs the new status, which is exactly the bug you want to avoid.
      - text: A function with a `default:` branch that returns `'Unknown'`.
        why: The `default` handles the new status at runtime, so the compiler has no reason to complain.
    answer: 0
---

Here is how Cartwheel's `Order` type looked before anyone thought about it:

```ts
type Order = {
  id: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  trackingNumber?: string; // set once shipped
  deliveredAt?: string;    // set once delivered
  cancelReason?: string;   // set if cancelled
  refundCents?: number;    // set if returned
};
```

It looks reasonable, and it is a trap. Four optional fields can each be present or absent, so this type allows 5 × 2⁴ = 80 shapes. Cartwheel's business has five. A shipped order with no tracking number compiles. A cancelled order with a delivery date compiles. And every time you read `order.trackingNumber`, you get `string | undefined` and reach for `!`, which is you telling the compiler "trust me" eighty times a week.

## One type per state

A **discriminated union** gives each state its own object type and joins them with `|`. Each member has a shared property with a different literal value, the **discriminant**:

```ts
type ProcessingOrder = { id: number; status: 'processing' };
type ShippedOrder = { id: number; status: 'shipped'; trackingNumber: string };
type DeliveredOrder = { id: number; status: 'delivered'; trackingNumber: string; deliveredAt: string };
type CancelledOrder = { id: number; status: 'cancelled'; cancelReason: string };
type ReturnedOrder = {
  id: number;
  status: 'returned';
  trackingNumber: string;
  deliveredAt: string;
  refundCents: number;
};

type Order = ProcessingOrder | ShippedOrder | DeliveredOrder | CancelledOrder | ReturnedOrder;
```

Now the type allows exactly five shapes. Notice that nothing is optional any more: a shipped order *has* a tracking number. The impossible states are not checked at runtime; they are simply not expressible:

```ts
const o: Order = { id: 1042, status: 'shipped' };
// Error: Type '{ id: number; status: "shipped"; }' is not assignable to type 'Order'.
//   Property 'trackingNumber' is missing in type '{ id: number; status: "shipped"; }'
//   but required in type 'ShippedOrder'.
```

:::figure Each state is its own type; transitions are functions between them
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">Order state machine. Processing goes to shipped via ship, shipped goes to delivered via deliver, delivered goes to returned via refund. Processing can also go to cancelled via cancel. Each state box lists the fields it adds.</title>
  <rect class="d-box-primary" x="10" y="40" width="150" height="64" rx="12"/>
  <text class="d-code" x="85" y="68" text-anchor="middle">processing</text>
  <text class="d-label-muted" x="85" y="90" text-anchor="middle">id</text>
  <rect class="d-box-accent" x="190" y="40" width="150" height="64" rx="12"/>
  <text class="d-code" x="265" y="68" text-anchor="middle">shipped</text>
  <text class="d-label-muted" x="265" y="90" text-anchor="middle">+ trackingNumber</text>
  <rect class="d-box-success" x="370" y="40" width="150" height="64" rx="12"/>
  <text class="d-code" x="445" y="68" text-anchor="middle">delivered</text>
  <text class="d-label-muted" x="445" y="90" text-anchor="middle">+ deliveredAt</text>
  <rect class="d-box" x="550" y="40" width="140" height="64" rx="12"/>
  <text class="d-code" x="620" y="68" text-anchor="middle">returned</text>
  <text class="d-label-muted" x="620" y="90" text-anchor="middle">+ refundCents</text>
  <rect class="d-box-warn" x="10" y="150" width="150" height="64" rx="12"/>
  <text class="d-code" x="85" y="178" text-anchor="middle">cancelled</text>
  <text class="d-label-muted" x="85" y="200" text-anchor="middle">+ cancelReason</text>
  <path class="d-arrow" d="M160 72 L186 72" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 72 L366 72" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M520 72 L546 72" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M85 104 L85 146" marker-end="url(#arrow)"/>
  <text class="d-code" x="173" y="30" text-anchor="middle">ship</text>
  <text class="d-code" x="353" y="30" text-anchor="middle">deliver</text>
  <text class="d-code" x="533" y="30" text-anchor="middle">refund</text>
  <text class="d-code" x="100" y="130">cancel</text>
</svg>
:::

## Narrowing on the discriminant

Checking the discriminant narrows the whole object. Inside each `case`, TypeScript knows exactly which member you have:

```ts
function describe(order: Order): string {
  switch (order.status) {
    case 'processing':
      return `#${order.id} is being packed`;
    case 'shipped':
      return `#${order.id} is on its way (${order.trackingNumber})`;
    case 'delivered':
      return `#${order.id} arrived on ${order.deliveredAt}`;
    case 'cancelled':
      return `#${order.id} was cancelled: ${order.cancelReason}`;
    case 'returned':
      return `#${order.id} was refunded $${(order.refundCents / 100).toFixed(2)}`;
  }
}
```

No `!`, no `?.`, no `?? ''`. And notice the explicit `: string` return type. If someone adds an `'on-hold'` status to the union next month, the end of this function becomes reachable, and TypeScript reports *Function lacks ending return statement and return type does not include 'undefined'*. The compiler finds every place that needs updating. You will make this check explicit and louder with `never` in [Branded Types and Exhaustive Checks](lesson:l-at-4-1).

## Transitions as functions between states

The union pays off most in functions that change state. Type their inputs and outputs as specific variants:

```ts
function ship(order: ProcessingOrder, trackingNumber: string): ShippedOrder {
  return { id: order.id, status: 'shipped', trackingNumber };
}

function cancel(order: ProcessingOrder, reason: string): CancelledOrder {
  return { id: order.id, status: 'cancelled', cancelReason: reason };
}
```

Now "you cannot ship an order twice" and "you cannot cancel a shipped order" are compile-time facts. A caller with an `Order` in hand must narrow first:

```ts
function shipIfReady(order: Order, tracking: string): Order {
  if (order.status !== 'processing') return order;
  return ship(order, tracking); // order is ProcessingOrder here
}
```

The return types matter as much as the parameters. Because `ship` returns a `ShippedOrder` rather than an `Order`, the caller can hand the result straight to a function that needs a tracking number, such as `printLabel(shipped)`, without checking `status` again. Each transition carries the knowledge forward. Return the wide `Order` and you throw that knowledge away, forcing every caller to narrow again.

:::mistake A discriminant that is not a literal
The pattern only works when each member's discriminant is a literal type. If `status` comes in typed as `string` (say, from an untyped API response), checking it narrows nothing, and you are back to `!` everywhere. Parse the response into the union at the edge of your app, which is the subject of [Parsing Untrusted Data at the Boundary](lesson:l-at-4-3), and keep `string` out of the core.
:::

:::tip Name the variants
You could write the union inline, but naming each member (`ShippedOrder`, `CancelledOrder`) gives you the vocabulary for transition functions and makes error messages readable. A message about `ShippedOrder` is much easier to act on than one about a 200-character anonymous object type.
:::

## Sharing common fields

Real orders have more than an `id`: a customer, a placed-at timestamp, line items. Repeating those in five variants invites drift, so pull them into a base type and intersect it with each state's own fields:

```ts
type OrderBase = { id: number; customerId: number; placedAt: string };

type Shipped = OrderBase & { status: 'shipped'; trackingNumber: string };
type Cancelled = OrderBase & { status: 'cancelled'; cancelReason: string };
```

Each variant is still a separate member with its own literal `status`, so narrowing works exactly as before. The base type also gives you a natural parameter type for functions that do not care about the state, such as `function customerLink(order: OrderBase)`, which accepts every variant.

You can also destructure the discriminant. Since TypeScript 4.4, `const { status } = order; if (status === 'shipped') { … }` narrows `order` too, as long as `order` is a `const` or an unassigned parameter. That keeps long `switch` statements readable without giving up the narrowing.

## When not to use one

A discriminated union is right when states carry *different data*. When the variants differ only in a label (say, a `channel` of `'web' | 'mobile_app' | 'marketplace'` with the same fields), a plain literal union on one property is enough. Reach for the full pattern when you catch yourself writing optional fields with comments like "only set when…".

In the exercise, you will turn Cartwheel's bag-of-optionals `Order` into a union and make `ship` accept only orders that can be shipped. Next lesson: literal types, `as const` and `satisfies`, the tools that keep those literals from widening back into `string`.
