---
summary: Release resources reliably with using declarations and Symbol.dispose, and write typed standard decorators for cross-cutting behaviour such as logging and retries.
takeaways:
  - A `using` declaration calls the value's `[Symbol.dispose]()` when the enclosing block exits, whether it returns normally or throws.
  - Several `using` declarations in one block are disposed in reverse order, like nested `try`/`finally` blocks.
  - "`await using` and `Symbol.asyncDispose` do the same for cleanup that returns a promise."
  - Standard decorators (TypeScript 5.0+) are functions of `(value, context)` that can return a replacement; they are not the same as the older `experimentalDecorators`.
  - Type a method decorator with `ClassMethodDecoratorContext` and generic `This`, `Args` and `Return` parameters so it works on any method without `any`.
further:
  - title: using declarations (TypeScript 5.2 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html
  - title: Decorators (TypeScript 5.0 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html
  - title: using (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using
quiz:
  - q: |
      What does this log?
      ```ts
      function checkout() {
        using a = reserve('TENT-2P');   // logs "reserve TENT-2P", disposes with "release TENT-2P"
        using b = reserve('MUG-SET');   // logs "reserve MUG-SET", disposes with "release MUG-SET"
        throw new Error('card declined');
      }
      try { checkout(); } catch {}
      ```
    options:
      - text: reserve TENT-2P, reserve MUG-SET, release MUG-SET, release TENT-2P
        why: Correct. The throw exits the block, both resources are disposed, and disposal runs in reverse order of declaration.
      - text: reserve TENT-2P, reserve MUG-SET, release TENT-2P, release MUG-SET
        why: Disposal is last-in, first-out, like nested `finally` blocks, so `b` is released before `a`.
      - text: reserve TENT-2P, reserve MUG-SET (nothing is released because the function threw)
        why: Releasing on every exit path, including throws, is the whole point of `using`.
      - text: Nothing; `using` cannot be combined with `throw` in the same block.
        why: There is no such restriction; a throw is one of the exits `using` is designed for.
    answer: 0
  - q: Which value can be bound with `using`?
    options:
      - text: Any object with a `close()` method.
        why: "`using` does not look for `close()`; it calls the method stored under `Symbol.dispose`."
      - text: An object with a `[Symbol.dispose]()` method, or `null`/`undefined`.
        why: Correct. The value must be disposable; `null` and `undefined` are allowed and simply skipped.
      - text: Only instances of `DisposableStack`.
        why: "`DisposableStack` is a helper for collecting disposables, not a requirement."
    answer: 1
  - q: How does a standard method decorator receive the method it decorates?
    options:
      - text: As `(target, propertyKey, descriptor)`, and it modifies the descriptor.
        why: That is the legacy `experimentalDecorators` signature. Standard decorators receive `(value, context)`.
      - text: As a string name, and it looks the method up on `this`.
        why: The method itself is passed in as the first argument; the name is available on `context.name`.
      - text: As `(value, context)`, where `value` is the method and the decorator may return a replacement function.
        why: Correct. Returning a new function replaces the method, which is how logging and retry decorators work.
    answer: 2
  - q: Your codebase uses NestJS-style parameter decorators like `constructor(@Inject(TOKEN) svc)`. What does that mean for your tsconfig?
    options:
      - text: Nothing; standard decorators support parameters.
        why: Standard decorators do not support parameter decorators, so this syntax is rejected without the legacy flag.
      - text: "Parameter decorators need `\"experimentalDecorators\": true`, which switches the whole project to the legacy decorator semantics."
        why: Correct. The two systems cannot be mixed in one compilation; frameworks built on the legacy model need the flag.
      - text: "You must set `\"target\": \"esnext\"` so the runtime handles them."
        why: The target does not change which decorator system TypeScript uses; the flag does.
      - text: You must enable `emitDecoratorMetadata` alone.
        why: That option only works together with `experimentalDecorators`; on its own it does nothing for parameter decorators.
    answer: 1
---

Cartwheel's checkout reserves stock before charging a card, then releases the reservation if anything fails. The first version of that code looked like this:

```ts
function placeOrder(skus: string[]) {
  const reservations = skus.map((sku) => reserve(sku));
  chargeCard(); // throws on a declined card
  reservations.forEach((r) => r.release());
}
```

A declined card skips the last line, and the stock stays locked until a nightly job notices. The traditional fix is `try`/`finally`, nested once per resource. This lesson covers the language's built-in answer, and then a second modern feature that keeps cross-cutting code like retries out of your business logic: standard decorators.

## using: cleanup tied to scope

A `using` declaration is like `const`, with one addition: when the block it lives in exits, by `return`, by falling off the end, or by `throw`, JavaScript calls the value's `[Symbol.dispose]()` method.

```ts
function reserve(sku: string): Disposable {
  log(`reserve ${sku}`);
  return { [Symbol.dispose]: () => log(`release ${sku}`) };
}

function placeOrder() {
  using tent = reserve('TENT-2P');
  using mug = reserve('MUG-SET');
  chargeCard(); // even if this throws…
}               // …both are released here: MUG-SET first, then TENT-2P
```

Several `using` declarations are disposed in reverse order, exactly like nested `finally` blocks, so a resource is always released before the ones it was created after. If disposal itself throws while another error is in flight, both are kept in a `SuppressedError` rather than one silently replacing the other.

For cleanup that is asynchronous, such as closing a database transaction, use `await using` with an object that has `[Symbol.asyncDispose]()` returning a promise. And when the number of resources is dynamic, collect them in a `DisposableStack` (or `AsyncDisposableStack`), which is itself disposable:

```ts
function placeOrder(skus: string[]) {
  using stack = new DisposableStack();
  for (const sku of skus) stack.use(reserve(sku));
  chargeCard();
} // every reservation released, in reverse order
```

`using` arrived in TypeScript 5.2. It runs natively in Node 24, Chrome and Edge 134+ and Firefox 141+, but Safari does not support it yet (as of late 2026), so it is not Baseline. For code that ships to browsers, let TypeScript or your bundler downlevel the syntax, and make sure the runtime has `Symbol.dispose` (a polyfill provides it where it is missing). The types live in the `esnext.disposable` lib (included in `"lib": ["esnext"]`). The exercise playground uses the ES2022 lib, so its starter declares those two pieces itself, which is a preview of the declaration merging you will learn in the next lesson.

### Making your own APIs disposable

`using` pays off most when your own APIs return disposables. The emitter from [Type-Safe Event Emitters and Builders](lesson:l-at-4-4) returned an `off` function; returning an object with `[Symbol.dispose]` as well lets callers scope a subscription to a block:

```ts
function subscribe<K extends keyof CheckoutEvents>(event: K, handler: (p: CheckoutEvents[K]) => void): Disposable {
  const off = bus.on(event, handler);
  return { [Symbol.dispose]: off };
}

async function waitForShipment(orderId: number) {
  using _ = subscribe('order.shipped', (e) => { if (e.orderId === orderId) notify(e); });
  await pollUntilShipped(orderId);
} // listener removed here, however the function ends
```

Good candidates are anything with a matching "undo": locks and reservations, event subscriptions, timers, temporary files, database transactions (with `await using`). If you find yourself writing `try`/`finally` only to call a cleanup method, that resource wants a `[Symbol.dispose]`.

:::mistake Forgetting that using is per block
`using` disposes at the end of the *block*, not the function. Declare a reservation inside an `if` or a loop body and it is released when that block ends, possibly before you charge the card. Put the `using` in the block whose lifetime matches the resource.
:::

## Standard decorators

A decorator is a function applied with `@` to a class or class member. TypeScript 5.0 implemented the standard (TC39) decorators, and TypeScript compiles them down to ordinary function calls, so they run in any runtime. A method decorator receives the original method and a `context` object, and may return a replacement:

```ts
function logged<This, Args extends unknown[], Return>(
  method: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log(`→ ${name}`, args);
    return method.call(this, ...args);
  };
}

class PaymentGateway {
  @logged
  charge(amountCents: number, currency: string) { /* … */ }
}
```

The generics make the decorator work on any method without `any`: `This`, `Args` and `Return` are inferred from the method it decorates, and the replacement keeps the same signature. Decorators that take options are **decorator factories**, functions that return the decorator:

```ts
function retry(times: number) {
  return function <This, Args extends unknown[], Return>(
    method: (this: This, ...args: Args) => Return,
    _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ) {
    return function (this: This, ...args: Args): Return {
      for (let attempt = 1; ; attempt++) {
        try {
          return method.call(this, ...args);
        } catch (e) {
          if (attempt >= times) throw e;
        }
      }
    };
  };
}

class PaymentGateway {
  @retry(3)
  charge(amountCents: number, currency: string) { /* … */ }
}
```

Stacked decorators apply from the bottom up. With `@logged` above `@retry(3)`, the retry wrapper is applied to `charge` first and `logged` wraps the result, so you get one log line per call rather than one per attempt. Swap them and you log every attempt. Neither is wrong, but the order is behaviour, so choose it on purpose.

`context` also offers `context.name`, `context.static`, `context.private` and `context.addInitializer(fn)`, which runs code when an instance is created (the usual way to write a `@bound` decorator that binds a method to its instance).

:::why Standard versus legacy decorators
Many existing frameworks (Angular, NestJS, TypeORM) were built on TypeScript's older `experimentalDecorators`, which use a different signature `(target, key, descriptor)` and support parameter decorators and `emitDecoratorMetadata`. The two systems cannot be mixed in one compilation. If a framework requires the legacy flag, follow it; for new code without such a framework, use standard decorators, and use them sparingly. A plain higher-order function, `const charge = withRetry(3, rawCharge)`, is often clearer and needs no class.
:::

In the exercise you will release stock reservations with `using` and add a typed `@retry` to Cartwheel's payment gateway. Next lesson: describing code you did not write, with declaration files.
