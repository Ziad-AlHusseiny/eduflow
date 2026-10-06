---
summary: Treat everything from outside your program as unknown, turn it into trusted domain types with parsers, type predicates and assertion functions, and keep the casts out of your core code.
takeaways:
  - "`JSON.parse`, `response.json()` and `localStorage` give you `any`; annotate their results as `unknown` so the compiler forces a check."
  - A parser takes `unknown` and returns a typed value or an error, so the rest of the code only ever sees data that has been checked.
  - "A type predicate (`value is T`) narrows at the call site, but TypeScript trusts its body, so a wrong predicate is an unchecked cast."
  - "An assertion function (`asserts value is T`) narrows everything after the call and must throw when the check fails."
  - Schema libraries declare the check once and derive the type from it, which removes the risk of a parser and a type drifting apart.
further:
  - title: Using type predicates
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
  - title: Assertion functions (TypeScript 3.7 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html
  - title: JSON.parse() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
quiz:
  - q: "`const data = await res.json();` What is the type of `data`, and what should you do about it?"
    options:
      - text: "`unknown`; narrow it before use."
        why: "`Response.json()` is declared to return `Promise<any>`, not `unknown`, so nothing forces you to narrow unless you annotate it."
      - text: "`Order`, inferred from the endpoint URL."
        why: TypeScript cannot know what a server returns; the URL is just a string to it.
      - text: "`object`; cast it with `as Order`."
        why: The type is `any`, and a cast skips the check that would catch a changed API.
      - text: "`any`; annotate it as `unknown` and run it through a parser."
        why: Correct. `any` switches checking off for every use; `unknown` forces each use to be proved first.
    answer: 3
  - q: |
      What is wrong with this predicate?
      ```ts
      function isOrder(value: unknown): value is Order {
        return typeof value === 'object' && value !== null && 'id' in value;
      }
      ```
    options:
      - text: Nothing; checking for `id` is enough to prove a value is an `Order`.
        why: A customer record also has `id`. The predicate claims far more than it checks.
      - text: It claims the value is a full `Order` but only checks for `id`, and TypeScript trusts the claim without verifying it.
        why: Correct. A predicate's body is not checked against its return type, so a weak check is an unchecked cast.
      - text: Predicates cannot use the `in` operator.
        why: "`in` is a normal narrowing check and works fine inside predicates."
    answer: 1
  - q: How does an assertion function differ from a type predicate?
    options:
      - text: An assertion function returns `boolean`; a predicate returns `void`.
        why: It is the other way round. A predicate returns `boolean`; an assertion function returns nothing and throws on failure.
      - text: An assertion function narrows the value for the rest of the scope after the call, and throws if the check fails.
        why: Correct. `assertIsOrder(x); x.id` works, because returning normally proves the assertion.
      - text: Assertion functions only work on primitives.
        why: They work on any type, including objects and unions.
    answer: 1
  - q: Where should a value from `localStorage.getItem('cart')` be parsed?
    options:
      - text: Right where it is read, at the boundary, before any other code sees it.
        why: Correct. Parse once at the edge, and every function inside the app can trust the type.
      - text: In each component that uses the cart, just before rendering.
        why: Parsing in many places duplicates the logic and leaves windows where unchecked data flows around.
      - text: Nowhere; your own app wrote it, so its shape is guaranteed.
        why: Old versions of your app, browser extensions and users with devtools all write to storage. Treat it as untrusted.
      - text: In the reducer that stores the cart, after it has been used for the first render.
        why: Unchecked data has already been rendered by then; the boundary is the first read, not a later step.
    answer: 0
---

In [Designing a Typed API Client](lesson:l-at-2-4), the client ended with `return result as Routes[R]['output']`. That cast was a promise about the server. This lesson is about keeping that promise honest.

Every program has a **boundary**: the places where data comes from somewhere the compiler cannot see. HTTP responses, `JSON.parse`, URL parameters, `localStorage`, form fields, messages from other windows, environment variables. Inside the boundary, types describe values your own code created. At the boundary, types are just hopes. The pattern for handling it has a well-known slogan: **parse, don't validate**. Turn untyped data into typed data once, at the edge, and let the rest of the program trust the types.

:::figure Untrusted data becomes typed data at one gate
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">On the left, sources outside the program: fetch responses, JSON.parse, URL parameters and localStorage, all typed as unknown. They pass through parsers at the boundary, which either return an error or a typed Order. Inside the boundary, the core checkout code only sees trusted types.</title>
  <rect class="d-box" x="10" y="20" width="190" height="180" rx="12"/>
  <text class="d-label-strong" x="105" y="46" text-anchor="middle">Outside: unknown</text>
  <text class="d-code" x="105" y="80" text-anchor="middle">res.json()</text>
  <text class="d-code" x="105" y="108" text-anchor="middle">JSON.parse</text>
  <text class="d-code" x="105" y="136" text-anchor="middle">URL params</text>
  <text class="d-code" x="105" y="164" text-anchor="middle">localStorage</text>
  <path class="d-arrow" d="M200 110 L256 110" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="260" y="70" width="170" height="80" rx="12"/>
  <text class="d-code" x="345" y="104" text-anchor="middle">parseOrder()</text>
  <text class="d-label-muted" x="345" y="128" text-anchor="middle">check, then brand</text>
  <path class="d-arrow" d="M345 150 L345 186" marker-end="url(#arrow)"/>
  <text class="d-code" x="345" y="206" text-anchor="middle">err(…)</text>
  <path class="d-arrow" d="M430 110 L486 110" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="490" y="20" width="200" height="180" rx="12"/>
  <text class="d-label-strong" x="590" y="46" text-anchor="middle">Inside: trusted</text>
  <text class="d-code" x="590" y="100" text-anchor="middle">Order</text>
  <text class="d-label-muted" x="590" y="128" text-anchor="middle">no casts, no checks</text>
</svg>
:::

## Start from unknown

`JSON.parse` returns `any`, and so does `Response.json()`. `any` is contagious: assign it to a variable typed `Order` and TypeScript believes you. The first step is to refuse that gift:

```ts
const raw: unknown = await res.json();
raw.status;
// Error: 'raw' is of type 'unknown'.
```

`unknown` is the honest type for data you have not checked. You can pass it around, but you cannot use it until you narrow it. Narrowing is what a parser does.

## A parser, by hand

A parser takes `unknown` and returns either a typed value or a description of what was wrong. With the `Result` type from the last lesson:

```ts
const STATUSES = ['processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
type OrderStatus = (typeof STATUSES)[number];
type Order = { id: number; status: OrderStatus; totalCents: number; couponCode: string | null };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

function parseOrder(input: unknown): Result<Order, string> {
  if (!isRecord(input)) return err('order: expected an object');
  const { id, status, totalCents, couponCode } = input;
  if (typeof id !== 'number' || !Number.isInteger(id)) return err('id: expected an integer');
  if (!isOrderStatus(status)) return err(`status: unknown value ${JSON.stringify(status)}`);
  if (typeof totalCents !== 'number') return err('totalCents: expected a number');
  if (couponCode !== null && typeof couponCode !== 'string') return err('couponCode: expected a string or null');
  return ok({ id, status, totalCents, couponCode });
}
```

Look at the final line: there is no cast. Each check narrowed one variable, and by the end TypeScript can verify that the object literal matches `Order`. If the type gains a field and the parser forgets it, the `ok(…)` line fails to compile. This is also where you would brand values, calling `toOrderId(id)` from [Branded Types and Exhaustive Checks](lesson:l-at-4-1).

### Closing the gap in the API client

Back in the client, the fix for that final cast is a table of parsers, one per route, checked against the route map with a mapped type and `satisfies`:

```ts
const parsers = {
  'GET /orders/:id': parseOrder,
  'GET /orders': parseOrderPage,
  'POST /orders/:id/cancel': parseCancelledOrder,
} satisfies { [R in keyof Routes]: (input: unknown) => Result<Routes[R]['output'], string> };
```

Forget a route and `satisfies` reports the missing key; return the wrong type from a parser and it reports that too. Inside `call`, the response now goes through `parsers[route]` before it is returned. TypeScript cannot connect the generic `R` to the matching row of the table, so one annotation remains there, but it now sits on data that has actually been checked: the client's output types are earned instead of asserted.

## Type predicates

`isRecord` and `isOrderStatus` are **type predicates**: functions whose return type is `value is T`. When one returns `true`, TypeScript narrows the argument at the call site. Since TypeScript 5.5, simple ones like `(x) => x !== null` are inferred, as you saw in section 1, but anything with real logic needs the annotation.

:::mistake Predicates that lie
TypeScript does not check that a predicate's body proves its claim. `function isOrder(v: unknown): v is Order { return isRecord(v) && 'id' in v; }` compiles, and every caller now believes a customer record is an order. A predicate is an `as` cast with a function around it. Keep predicates small and obviously correct, like `isOrderStatus`, and build bigger checks from them in parsers that construct the value, so the compiler verifies the result.
:::

## Assertion functions

Sometimes you want to narrow and stop if the data is bad, without an `if` at every call site. An **assertion function** returns nothing and throws on failure, and its `asserts` return type narrows everything after the call:

```ts
function assertIsOrder(input: unknown): asserts input is Order {
  const parsed = parseOrder(input);
  if (!parsed.ok) throw new Error(`Invalid order: ${parsed.error}`);
}

const raw: unknown = JSON.parse(cachedJson);
assertIsOrder(raw);
raw.status; // OrderStatus
```

Assertion functions fit places where bad data is a bug rather than an expected case: test helpers, data your own server rendered into the page, invariants. For HTTP responses, prefer a parser that returns a `Result`, so a changed API produces a handled error rather than a crash. One quirk: an assertion function must be called through a name with an explicit type, so `const assertIsOrder = (x: unknown): asserts x is Order => …` needs a type annotation on the `const` itself, or TypeScript reports "Assertions require every name in the call target to be declared with an explicit type annotation".

:::tip Use a schema library in real projects
Hand-written parsers are perfect for learning and fine for a few types. For a whole API, use a schema library such as Zod, Valibot or ArkType: you declare the shape once as a runtime value, and the library both checks data and gives you the TypeScript type derived from it, so the parser and the type cannot drift apart. It is the same `typeof`-style "single source of truth" idea from section 3, packaged for you.
:::

In the exercise you will write Cartwheel's order parser, a predicate and an assertion function, and replace a cast that has been lying since day one. Next lesson builds typed event emitters and builders on top of everything in this section.
