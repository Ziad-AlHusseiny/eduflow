---
summary: Build an event emitter whose event names and payloads are checked from one event map, and a builder whose result type grows with each method call.
takeaways:
  - "An event map type (`{ 'order.shipped': { orderId: number } }`) is the single source of truth for both event names and payload types."
  - "`on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void)` ties the handler's parameter to the event name the caller passes."
  - A conditional rest parameter lets events with no payload be emitted without a dummy argument.
  - A builder can carry state in a type parameter, returning a new, wider type from each call, so the final result type reflects every step.
  - Keep the untyped storage inside the class and the precise types on its public methods, so the one cast lives in one place.
further:
  - title: Generic Classes
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-classes
  - title: Classes (this-based types and parameter properties)
    url: https://www.typescriptlang.org/docs/handbook/2/classes.html
  - title: Rest parameters with tuple types (TypeScript 3.0 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html
quiz:
  - q: |
      With `bus = new Emitter<CheckoutEvents>()`, what is the type of `p`?
      ```ts
      type CheckoutEvents = {
        'order.shipped': { orderId: number; carrier: string };
        'payment.failed': { orderId: number; reason: string };
      };
      bus.on('payment.failed', (p) => console.log(p.reason));
      ```
    options:
      - text: "`CheckoutEvents[keyof CheckoutEvents]`, the union of both payloads"
        why: That would happen if the event name were typed as `keyof Events` without a type parameter. `K` captures the specific name.
      - text: "`unknown`, because handlers are stored in an untyped map"
        why: How handlers are stored is an implementation detail; the public signature decides what callers see.
      - text: "`any`, because callbacks are contextually typed"
        why: Contextual typing gives `p` the parameter type from the signature, which is precise here.
      - text: "`{ orderId: number; reason: string }`"
        why: Correct. `K` is inferred as `'payment.failed'`, and the handler's parameter is `CheckoutEvents[K]`.
    answer: 3
  - q: "Why type `emit` with `...args: EventArgs<Events[K]>` instead of `payload: Events[K]`?"
    options:
      - text: So events whose payload is `undefined` can be emitted as `emit('checkout.opened')` with no second argument.
        why: Correct. The conditional produces an empty tuple for payload-less events and a one-element tuple otherwise.
      - text: Because rest parameters are faster at runtime.
        why: The choice is about the type signature; at runtime the difference is negligible.
      - text: Because `Events[K]` cannot be used as a parameter type.
        why: It can; `on` uses it for the handler parameter. The rest form only solves the missing-payload case.
    answer: 0
  - q: |
      What is the type of `rows`?
      ```ts
      const rows = new OrderQuery().select('id').select('totalCents').run(allOrders);
      ```
    options:
      - text: "`Order[]`, because `run` always returns full orders"
        why: In this builder `run` returns `Pick<Order, Selected>[]`, and `Selected` has grown with each call.
      - text: "`Pick<Order, 'id' | 'totalCents'>[]`"
        why: Correct. Each `select` returns `OrderQuery<Selected | K>`, so the type parameter accumulates both fields.
      - text: "`Pick<Order, 'totalCents'>[]`, because the second call replaces the first"
        why: The second call widens `Selected` with a union; it does not replace it.
    answer: 1
  - q: Why does each `select` call return a new `OrderQuery` instead of mutating `this` and returning it?
    options:
      - text: Because classes cannot return `this` from methods.
        why: They can; fluent APIs often do. The issue is what the type of `this` can express.
      - text: Because a method cannot change the type of the object it is called on, so the wider type needs a new value.
        why: Correct. `this` keeps its type for its whole life; returning a new instance with a new type parameter is how the type grows.
      - text: Because mutation is not allowed in TypeScript classes.
        why: TypeScript allows mutation freely; this is a typing constraint, not a language rule.
    answer: 1
---

Cartwheel's checkout emits events: `order.shipped`, `payment.failed`, `checkout.opened`. Analytics, the email service and the order page all listen. The first version used a plain emitter typed with `string` names and `any` payloads, and it produced the two classic bugs: a listener for `'order.shiped'` that never fired, and a handler reading `payload.trackingNo` on an event that sends `trackingNumber`. Both were invisible until someone noticed missing emails.

Everything from this section and the last comes together to fix it.

## One map, every type

Describe every event once, in a map from name to payload type:

```ts
type CheckoutEvents = {
  'checkout.opened': undefined;
  'order.shipped': { orderId: number; carrier: string; trackingNumber: string };
  'payment.failed': { orderId: number; reason: string };
};
```

You could also generate part of this map with the template-literal mapped type from [Template Literal Types](lesson:l-at-3-4). Either way, the map is the single source of truth: names are its keys, payloads are its values.

## The typed emitter

```ts
type EventArgs<P> = [P] extends [undefined] ? [] : [payload: P];
type Handler = (payload: never) => void;

class Emitter<Events extends Record<string, unknown>> {
  #handlers = new Map<keyof Events, Set<Handler>>();

  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): () => void {
    let set = this.#handlers.get(event);
    if (!set) {
      set = new Set();
      this.#handlers.set(event, set);
    }
    set.add(handler);
    return () => set.delete(handler);
  }

  emit<K extends keyof Events>(event: K, ...args: EventArgs<Events[K]>): void {
    for (const handler of this.#handlers.get(event) ?? []) {
      // Handlers for K were registered with a matching payload type in on().
      (handler as (payload: unknown) => void)(args[0]);
    }
  }
}
```

The pattern is the API client's, applied to events. `K` is inferred from the event name and has one job: look up the payload in `Events[K]`. In `on`, that type flows into the handler's parameter, so the callback is contextually typed. In `emit`, it checks the payload you pass.

```ts
const bus = new Emitter<CheckoutEvents>();

const off = bus.on('order.shipped', (e) => sendEmail(`Tracking: ${e.trackingNumber}`));
bus.emit('order.shipped', { orderId: 1042, carrier: 'DHL', trackingNumber: '1Z-999' });
bus.emit('checkout.opened');                         // no payload needed
bus.on('order.shiped', () => {});
// Error: Argument of type '"order.shiped"' is not assignable to parameter of type 'keyof CheckoutEvents'.
bus.emit('payment.failed', { orderId: 1042 });
// Error: … Property 'reason' is missing …
off(); // unsubscribe
```

`EventArgs` is the conditional rest-parameter trick from [Conditional Types, Distribution and infer](lesson:l-at-3-3): payload-less events take zero extra arguments, the rest take exactly one. The brackets in `[P] extends [undefined]` stop distribution, so a payload type like `string | undefined` is still required rather than split.

Notice where the loose types live. Inside the class, handlers are stored as `Set<Handler>` and called through one commented cast, because a `Map` cannot express "the value type depends on the key". Outside, every method is precise. That split, untyped storage behind a typed surface, is how most well-typed libraries are built. The private `#handlers` field is a real JavaScript private field, so nothing outside can reach in and break the invariant.

Once the core is typed, new methods inherit the precision almost for free. A `once` that resolves a promise with the next payload is four lines, and its result is typed per event with no extra annotations:

```ts
once<K extends keyof Events>(event: K): Promise<Events[K]> {
  return new Promise((resolve) => {
    const off = this.on(event, (payload) => { off(); resolve(payload); });
  });
}

const shipped = await bus.once('order.shipped'); // { orderId; carrier; trackingNumber }
```

This is the payoff of putting the types in one map and threading `K` through: each method you add is checked against the same source of truth, and none of them repeats a payload type.

:::mistake Typing the event parameter as keyof Events directly
`on(event: keyof Events, handler: (payload: Events[keyof Events]) => void)` looks almost the same and compiles. But without a type parameter, the handler's payload is the union of *every* payload, so `e.trackingNumber` is an error on `order.shipped` and `e.reason` would be "allowed" only after narrowing a value that has no discriminant. The type parameter is what links the specific name to its specific payload.
:::

## Builders whose type grows

A builder chains method calls to assemble something step by step. The type-level trick is to carry what has been built so far in a type parameter, and return a new, wider type from each call. Here is a small query builder for Cartwheel's order history:

```ts
type Order = { id: number; status: OrderStatus; totalCents: number; customer: string };

class OrderQuery<Selected extends keyof Order = never> {
  readonly #fields: readonly (keyof Order)[];

  constructor(fields: readonly (keyof Order)[] = []) {
    this.#fields = fields;
  }

  select<K extends keyof Order>(...fields: K[]): OrderQuery<Selected | K> {
    return new OrderQuery<Selected | K>([...this.#fields, ...fields]);
  }

  run(rows: Order[]): Pick<Order, Selected>[] {
    // #fields holds exactly the keys in Selected.
    return rows.map((row) => Object.fromEntries(this.#fields.map((f) => [f, row[f]])) as Pick<Order, Selected>);
  }
}

const rows = new OrderQuery().select('id').select('totalCents').run(allOrders);
rows[0].totalCents; // number
rows[0].customer;   // Error: Property 'customer' does not exist on type 'Pick<Order, "id" | "totalCents">'.
```

`Selected` starts as `never` (nothing selected) and each `select` returns `OrderQuery<Selected | K>`. A method cannot change the type of the object it is called on, so each step returns a new instance. That is also good runtime design: builders that never mutate can be shared and reused safely. This is the same technique query builders such as Kysely and Drizzle use at much larger scale.

:::tip Keep builder types shallow
Every step of a builder adds to a type the editor must display and the compiler must check. A builder with ten type parameters and conditional types on every method produces error messages nobody can read. Track the one or two facts callers actually need, such as which fields are selected, and keep everything else simple.
:::

In the exercise you will build Cartwheel's typed event bus and a small selecting builder. That completes the patterns section; section 5 turns to shipping all of this, starting with the compiler flags that make these types trustworthy.
