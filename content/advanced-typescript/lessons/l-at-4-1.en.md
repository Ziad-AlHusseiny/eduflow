---
summary: Give same-shaped values distinct types with brands and smart constructors, stop mixing currencies at compile time, and make every switch over a union provably exhaustive with never.
takeaways:
  - A brand intersects a primitive with a unique, type-only property, so an `OrderId` and a `CustomerId` stop being interchangeable even though both are numbers.
  - Create branded values only in smart constructors that validate first; that is the one place an `as` cast belongs.
  - Arithmetic on branded numbers returns plain `number`, so money helpers must re-brand their results deliberately.
  - "`Money<NoInfer<C>>` on the second argument stops `add(usd, eur)` from inferring a mixed-currency union."
  - A `default` branch that passes the value to a `never` parameter, or checks it with `satisfies never`, turns a missed union member into a compile error.
further:
  - title: Unique symbol types
    url: https://www.typescriptlang.org/docs/handbook/symbols.html#unique-symbol
  - title: Exhaustiveness checking (Narrowing)
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
quiz:
  - q: "`type OrderId = number & { readonly [brand]: 'OrderId' }`. What does the brand property look like at runtime?"
    options:
      - text: Every `OrderId` value carries a hidden symbol property.
        why: Primitives cannot carry properties, and the brand is only declared, never assigned. It exists in the type system alone.
      - text: The value is boxed into a `Number` object with the symbol attached.
        why: Nothing boxes the value. A cast like `n as OrderId` emits no code at all.
      - text: It does not exist; the value is a plain number, and the brand lives only in the type.
        why: Correct. That is why brands are free at runtime, and also why data from `JSON.parse` is never branded until you construct it.
    answer: 2
  - q: Where should `as OrderId` appear in a well-designed codebase?
    options:
      - text: Wherever a number needs to be passed to a function that takes an `OrderId`.
        why: That turns the brand into decoration; any number can be cast anywhere and the guarantee is gone.
      - text: Only inside the smart constructor that validates the number first.
        why: Correct. One validated entry point means every `OrderId` in the system has been checked.
      - text: Nowhere; brands should be created with `satisfies`.
        why: "`satisfies` checks against a type without changing it, so it cannot add a brand that the value does not have."
    answer: 1
  - q: "`add<C extends Currency>(a: Money<C>, b: Money<C>)` is called as `add(usd, eur)`. What happens?"
    options:
      - text: It is a compile error, because the currencies differ.
        why: That is what you want, but both arguments are inference sites, so `C` becomes `'USD' | 'EUR'` and the call compiles.
      - text: It compiles, because `C` is inferred as `'USD' | 'EUR'`; mark the second parameter `Money<NoInfer<C>>` to reject it.
        why: Correct. With `NoInfer`, `C` comes from the first argument only, and `Money<'EUR'>` fails against `Money<'USD'>`.
      - text: It throws at runtime because the brand does not match.
        why: Brands do not exist at runtime, so nothing can throw because of one.
    answer: 1
  - q: |
      A new `'on-hold'` status is added. Which function fails to compile until it handles it?
      ```ts
      function label(s: OrderStatus): string {
        switch (s) {
          case 'processing': return 'Packing';
          // …one case for every other existing status…
          default: return assertNever(s);
        }
      }
      ```
    options:
      - text: This one, because in the `default` branch `s` is `'on-hold'`, which is not assignable to `never`.
        why: Correct. The `default` branch only sees the members no case handled, and `assertNever` accepts none.
      - text: None; `default` handles every value, so the compiler is satisfied.
        why: A plain `default` would hide the new status. Passing the value to a `never` parameter is what makes it a check.
      - text: Every function that uses `OrderStatus`, including ones that only store it.
        why: Only code that claims exhaustiveness is affected. Functions that store or pass the status through keep compiling.
      - text: "Only functions that use `if` statements instead of `switch`"
        why: The check is about the `never` parameter, not the statement used; it works with `if` chains too.
    answer: 0
---

The refund bug from the first lesson came down to two numbers that looked the same: dollars and cents. Cartwheel has the same problem everywhere. An order id and a customer id are both `number`. An amount in cents and a quantity are both `number`. Structural typing, which you met in [Structural Typing and Assignability](lesson:l-at-1-2), considers same-shaped things identical, so it happily lets you write `cancelOrder(customer.id)`.

The fix is to make the shapes differ, without changing anything at runtime.

## Brands

A **branded type** intersects a primitive with a property that only exists in the type system:

```ts
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

type OrderId = Brand<number, 'OrderId'>;
type CustomerId = Brand<number, 'CustomerId'>;
type Cents = Brand<number, 'Cents'>;
```

`declare const brand: unique symbol` declares a symbol that never exists at runtime; using it as the property key means no real object can accidentally have it, and nothing outside this file can forge it by name. An `OrderId` is still a number for every purpose (you can compare it, print it, send it as JSON), but TypeScript no longer accepts a plain number or a `CustomerId` in its place:

```ts
function cancelOrder(id: OrderId) {}

cancelOrder(customer.id);
// Error: Argument of type 'CustomerId' is not assignable to parameter of type 'OrderId'.
cancelOrder(1042);
// Error: Argument of type 'number' is not assignable to parameter of type 'OrderId'.
```

## Smart constructors

If a plain number is not an `OrderId`, where do `OrderId`s come from? From exactly one function per brand, a **smart constructor** that validates and then casts:

```ts
function toOrderId(n: number): OrderId {
  if (!Number.isInteger(n) || n < 1000) throw new Error(`Invalid order id: ${n}`);
  return n as OrderId;
}

function toCents(n: number): Cents {
  if (!Number.isSafeInteger(n)) throw new Error(`Cents must be a whole number, got ${n}`);
  return n as Cents;
}
```

This is the one legitimate home for `as` in branded code. Because the cast only happens after validation, every `OrderId` anywhere in the system is known to be a valid id. A brand is a receipt: it proves the value went through the check.

:::figure Smart constructors are the only gate into a branded type
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">A plain number from a URL or JSON passes through the toOrderId smart constructor, which validates it and either throws or returns an OrderId. Functions such as cancelOrder accept only OrderId, so the plain number cannot reach them directly; that path is blocked.</title>
  <rect class="d-box" x="10" y="70" width="150" height="56" rx="12"/>
  <text class="d-code" x="85" y="96" text-anchor="middle">number</text>
  <text class="d-label-muted" x="85" y="116" text-anchor="middle">from URL, JSON</text>
  <path class="d-arrow" d="M160 98 L248 98" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="252" y="62" width="180" height="72" rx="12"/>
  <text class="d-code" x="342" y="92" text-anchor="middle">toOrderId(n)</text>
  <text class="d-label-muted" x="342" y="116" text-anchor="middle">validate, then cast</text>
  <path class="d-arrow" d="M432 98 L510 98" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="514" y="70" width="176" height="56" rx="12"/>
  <text class="d-code" x="602" y="96" text-anchor="middle">cancelOrder(id)</text>
  <text class="d-label-muted" x="602" y="116" text-anchor="middle">takes OrderId</text>
  <path class="d-line d-dashed" d="M85 126 L85 170 L602 170 L602 126"/>
  <text class="d-label-muted" x="342" y="162" text-anchor="middle">direct path: compile error</text>
</svg>
:::

## Money that refuses to mix

Branding cents is half the job. The other half is currency. Make the currency a type parameter, so `Money<'USD'>` and `Money<'EUR'>` are different types:

```ts
type Currency = 'EGP' | 'AED' | 'SAR' | 'JOD' | 'GBP' | 'EUR' | 'USD' | 'CAD';
type Money<C extends Currency = Currency> = { cents: Cents; currency: C };

function add<C extends Currency>(a: Money<C>, b: Money<NoInfer<C>>): Money<C> {
  return { cents: toCents(a.cents + b.cents), currency: a.currency };
}

add(usdPrice, usdShipping); // Money<'USD'>
add(usdPrice, eurShipping);
// Error: Argument of type 'Money<"EUR">' is not assignable to parameter of type 'Money<"USD">'.
```

Two details matter. Without `NoInfer`, both arguments would be inference sites and `C` would quietly become `'USD' | 'EUR'`, the exact trap from [Controlling Inference](lesson:l-at-2-3). And `a.cents + b.cents` is a plain `number`: arithmetic strips brands, because TypeScript has no idea whether the result still means "cents". Re-brand deliberately, through the constructor, so the rule "cents are whole numbers" is checked again.

### Where brands pay off

Do not brand everything. Each brand adds a constructor call wherever values enter the system, and a test fixture has to go through it too. Brand where two values share a primitive type, are easy to confuse, and are expensive to confuse: ids of different entities, amounts in different units, and strings that must pass validation before use, such as an `Email` or a `Sku`. A `quantity` that is only ever multiplied by a price does not need one. On a large codebase, a dozen well-chosen brands catch most of the "right type, wrong meaning" bugs; a hundred of them mostly generate casts.

:::mistake Expecting brands to survive the network
Brands exist only at compile time. A value from `JSON.parse`, a URL parameter or `localStorage` is a plain number, whatever your types say about the endpoint. If you type an API response as `{ id: OrderId }` and skip parsing, you have cast unvalidated data into a brand, which is worse than no brand at all. Brand values while parsing them at the boundary, which is the subject of [Parsing Untrusted Data at the Boundary](lesson:l-at-4-3).
:::

## Exhaustiveness with never

Brands make values distinct. The other everyday pattern makes *handling* complete. You saw in [Discriminated Unions for Domain States](lesson:l-at-1-4) that a missing return can reveal a missed case. A `never` check makes that explicit and works even when the function returns nothing:

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function notifyCustomer(order: Order): void {
  switch (order.status) {
    case 'processing': return sendEmail('We are packing your order');
    case 'shipped': return sendEmail(`Track it: ${order.trackingNumber}`);
    case 'delivered': return sendEmail('Enjoy!');
    case 'cancelled': return sendEmail(`Cancelled: ${order.cancelReason}`);
    case 'returned': return sendEmail('Refund on its way');
    default: return assertNever(order);
  }
}
```

In the `default` branch, every handled member has been narrowed away, so `order` is `never`, and passing it to a `never` parameter compiles. Add an `'on-hold'` status and `order` becomes the on-hold variant in that branch, which is not assignable to `never`: compile error, pointing at the exact switch to update. At runtime, if bad data ever sneaks past the types, the function throws with a clear message instead of doing nothing.

If you prefer not to define a helper, ``default: throw new Error(`Unhandled: ${order satisfies never}`)`` does the same check inline. And for lookups, `Record<OrderStatus, string>` with `satisfies` gives you exhaustiveness for free: a missing key is a compile error.

In the exercise you will brand Cartwheel's ids and cents, make `add` reject mixed currencies, and add an exhaustive check. Next lesson tackles the other thing every checkout must handle: failures you expect.
