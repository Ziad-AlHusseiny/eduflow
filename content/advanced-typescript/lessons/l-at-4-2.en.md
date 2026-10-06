---
summary: Return expected failures as typed values with a Result union, so callers must handle a declined card or an expired coupon, and keep exceptions for bugs and the truly unexpected.
takeaways:
  - A function's signature says nothing about what it throws, so expected failures hidden in exceptions are easy for callers to forget.
  - "`type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }` is a discriminated union, so callers must check `ok` before they can read `value`."
  - Model errors as a discriminated union too, so each failure carries its own data and the UI can handle every case exhaustively.
  - Compose results with early returns (`if (!r.ok) return r;`); the narrowed failure is assignable to the caller's wider error union.
  - Use `Result` for failures the business expects; keep `throw` for bugs, broken invariants and infrastructure failures you cannot handle locally.
further:
  - title: Discriminated unions (Narrowing)
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  - title: Control flow and error handling (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
quiz:
  - q: "`placeOrder(cart): Promise<Order>` can fail with a declined card. What does its signature tell a caller about that?"
    options:
      - text: Nothing; TypeScript has no way to declare what a function throws, so the failure is invisible.
        why: Correct. There is no `throws` clause in TypeScript, which is why expected failures belong in the return type.
      - text: That it rejects with an `Error`, because every promise can reject.
        why: Any promise can reject with any value. The signature does not say which failures are expected or what data they carry.
      - text: That the caller must wrap it in try/catch, enforced by `strict`.
        why: No compiler option forces a try/catch; forgetting one compiles fine.
      - text: That it can throw a `CardDeclinedError`, inferred from the implementation.
        why: Thrown types are never inferred or tracked, even with all strict flags on.
    answer: 0
  - q: |
      Why does the last line fail to compile?
      ```ts
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
      declare const r: Result<Order, CheckoutError>;
      console.log(r.value.id);
      ```
    options:
      - text: Because `value` is optional in `Result`.
        why: "`value` is required on the success member. The issue is that it does not exist on the failure member at all."
      - text: Because `Result` must be awaited first.
        why: "`r` is not a promise in this snippet; nothing needs awaiting."
      - text: "Because `value` only exists on the `ok: true` member, and `r` has not been narrowed."
        why: Correct. Checking `if (r.ok)` narrows `r` to the success member, where `value` is available.
    answer: 2
  - q: Which failure is a good fit for a `Result` rather than an exception?
    options:
      - text: A `null` reaching a function whose types say it cannot be `null`.
        why: That is a broken invariant, a bug. Throw, and fix the code that let it happen.
      - text: The database connection pool is exhausted.
        why: Infrastructure failure that the checkout cannot handle locally; let it propagate to the error boundary or retry layer.
      - text: The coupon code the customer typed has expired.
        why: Correct. It is expected, the caller can do something useful (show a message), and it carries data (the code and its expiry).
    answer: 2
  - q: |
      `validateCart` returns `Result<Cart, CartError>` and `checkout` returns `Result<Order, CartError | PaymentError>`. Does this compile?
      ```ts
      const cart = validateCart(input);
      if (!cart.ok) return cart;
      ```
    options:
      - text: No, because `Result<Cart, CartError>` is not `Result<Order, …>`.
        why: "After the check, `cart` is only the failure member, `{ ok: false; error: CartError }`, which has no `Cart` in it."
      - text: No, you must rebuild the failure with `err(cart.error)`.
        why: Rebuilding works, but it is unnecessary; the narrowed failure already fits.
      - text: Only with an `as` cast.
        why: No cast is needed; assignability handles it.
      - text: "Yes, because the narrowed `{ ok: false; error: CartError }` is assignable to the wider failure member."
        why: Correct. `CartError` is part of `CartError | PaymentError`, so the failure can be returned as is.
    answer: 3
---

Here is the signature of the function at the heart of Cartwheel's checkout:

```ts
async function placeOrder(cart: Cart, payment: PaymentMethod): Promise<Order> { /* … */ }
```

It can fail in at least five ways the business expects every day: the card is declined, an item is out of stock, the coupon expired, the address is undeliverable, the payment provider asks for 3-D Secure. The signature mentions none of them. They are exceptions, thrown from somewhere inside, and TypeScript has no `throws` clause. A caller who forgets a `try`/`catch` compiles fine, and the customer sees a blank screen.

## Making failure part of the type

The fix is to return expected failures instead of throwing them, using a discriminated union you already know how to write:

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

const ok = <T>(value: T): { ok: true; value: T } => ({ ok: true, value });
const err = <E>(error: E): { ok: false; error: E } => ({ ok: false, error });
```

`ok` is the discriminant. A caller cannot read `value` without first proving the call succeeded, because `value` only exists on one member:

```ts
const result = await placeOrder(cart, payment);
showConfirmation(result.value);
// Error: Property 'value' does not exist on type 'Result<Order, CheckoutError>'.
//   Property 'value' does not exist on type '{ ok: false; error: CheckoutError; }'.

if (result.ok) showConfirmation(result.value); // fine
```

## Errors with structure

`E` could be a string, but a string is the error equivalent of `status: string`. Model failures as a discriminated union, each with the data needed to handle it:

```ts
type CheckoutError =
  | { type: 'card-declined'; declineCode: string }
  | { type: 'out-of-stock'; sku: string; available: number }
  | { type: 'coupon-expired'; code: string; expiredOn: string };

function errorMessage(e: CheckoutError): string {
  switch (e.type) {
    case 'card-declined': return `Your card was declined (${e.declineCode}).`;
    case 'out-of-stock': return `Only ${e.available} of ${e.sku} left.`;
    case 'coupon-expired': return `${e.code} expired on ${e.expiredOn}.`;
  }
}
```

The `: string` return type makes this exhaustive, as you saw in section 1. When the payments team adds `'requires-3ds'` to the union, every message function and every UI branch that switches on `type` is flagged.

## Composing steps

Checkout is a sequence: validate the cart, apply the coupon, charge the card. Each step can fail with its own errors. Early returns compose them without nesting:

```ts
type CartError = { type: 'out-of-stock'; sku: string; available: number };
type CouponError = { type: 'coupon-expired'; code: string; expiredOn: string };

async function checkout(input: CheckoutInput): Promise<Result<Order, CartError | CouponError | PaymentError>> {
  const cart = validateCart(input.lines);
  if (!cart.ok) return cart;

  const priced = applyCoupon(cart.value, input.coupon);
  if (!priced.ok) return priced;

  const charge = await chargeCard(priced.value.total, input.payment);
  if (!charge.ok) return charge;

  return ok(createOrder(priced.value, charge.value));
}
```

After `if (!cart.ok)`, `cart` is narrowed to `{ ok: false; error: CartError }`, which is assignable to the function's wider failure type, so it can be returned as is. The success path reads top to bottom, and the return type documents every failure the caller must handle. If someone later adds a fourth step with a new error type and forgets to widen the return type, the `return` of that step's failure is a compile error, so the list of failures cannot silently fall out of date.

:::figure Each step either continues on the success track or exits with its error
<svg viewBox="0 0 700 210" role="img" aria-labelledby="t1">
  <title id="t1">Railway diagram. Three steps, validateCart, applyCoupon and chargeCard, sit on a success track leading to ok Order. From each step a branch drops to a failure track that ends in a Result with ok false and the union of CartError, CouponError and PaymentError.</title>
  <rect class="d-box-accent" x="10" y="40" width="140" height="48" rx="10"/>
  <text class="d-code" x="80" y="69" text-anchor="middle">validateCart</text>
  <rect class="d-box-accent" x="200" y="40" width="140" height="48" rx="10"/>
  <text class="d-code" x="270" y="69" text-anchor="middle">applyCoupon</text>
  <rect class="d-box-accent" x="390" y="40" width="140" height="48" rx="10"/>
  <text class="d-code" x="460" y="69" text-anchor="middle">chargeCard</text>
  <rect class="d-box-success" x="580" y="40" width="110" height="48" rx="10"/>
  <text class="d-code" x="635" y="69" text-anchor="middle">ok(order)</text>
  <path class="d-arrow" d="M150 64 L196 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 64 L386 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M530 64 L576 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M80 88 L80 146" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M270 88 L270 146" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M460 88 L460 146" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="10" y="150" width="680" height="48" rx="10"/>
  <text class="d-code" x="350" y="179" text-anchor="middle">{ ok: false, error: CartError | CouponError | PaymentError }</text>
</svg>
:::

You will see libraries that offer `map` and `andThen` methods to chain results instead. They are fine, but in TypeScript the early-return style is usually easier to read and needs no library: narrowing does the work.

## Wrapping code that throws

Most of the failures in a checkout start life as exceptions in someone else's code: the payment SDK throws a `CardError`, `fetch` rejects when the network drops. Convert them once, at the edge, into the `Result` your own code speaks:

```ts
type PaymentError = { type: 'card-declined'; declineCode: string };

async function chargeCard(amount: Money, payment: PaymentMethod): Promise<Result<Receipt, PaymentError>> {
  try {
    return ok(await paymentSdk.charge(amount, payment));
  } catch (e: unknown) {
    if (e instanceof CardError) return err({ type: 'card-declined', declineCode: e.code });
    throw e; // not a failure we understand: let it propagate
  }
}
```

Three things are worth copying. The `catch` variable is `unknown`, as it always is under `strict`, so you narrow it with `instanceof` before reading `code`. Only the one failure the business expects becomes a value; everything else is rethrown untouched, stack trace and all. And the function's return type is now an honest list of what can go wrong, which every caller sees in a tooltip.

Asynchronous results nest the obvious way, `Promise<Result<T, E>>`. A rejected promise still means "something unexpected happened", and a resolved `{ ok: false }` means "the business said no". Keeping those two channels separate is the whole point.

## Where exceptions still belong

`Result` is for failures the business expects and the caller can act on. It is not a replacement for every `throw`:

- **Bugs and broken invariants** (a `null` where the types say there cannot be one, an unhandled union member reaching `assertNever`) should throw. There is nothing sensible for the caller to do, and you want a stack trace.
- **Infrastructure failures** you cannot handle locally (the database is down) can propagate to one error boundary or retry layer.
- **Third-party code that throws** gets wrapped once at the boundary, converting the exceptions you expect into `err(…)` and rethrowing the rest.

:::mistake Catching everything into a Result
`try { … } catch (e) { return err({ type: 'unknown', message: String(e) }) }` around a whole function turns bugs into "expected" failures that a UI politely displays and nobody investigates. Convert only the specific failures you understand, such as the payment SDK's decline error, and let the rest throw.
:::

In the exercise you will build Cartwheel's coupon step with `Result`, compose it into a checkout function, and write the exhaustive error messages. Next lesson deals with the data those steps start from: untrusted input.
