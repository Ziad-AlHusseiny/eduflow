---
summary: Design a fetch client typed from a single route map, so each call infers its input and response types from the route name and callers never write a type argument or a cast.
takeaways:
  - Put every endpoint's input and output in one route-map type, and derive the client's signatures from it.
  - Make the route name the only inference site; everything else is looked up from it with indexed access.
  - Keep unavoidable casts inside the implementation, in one place, so callers get a fully checked API.
  - A typed client still trusts the server's response; validate it at the boundary before relying on the declared output type.
further:
  - title: Indexed Access Types
    url: https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
  - title: Generic constraints
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints
  - title: Using the Fetch API (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
quiz:
  - q: |
      Given `call<R extends keyof Routes>(route: R, input: Routes[R]['input']): Promise<Routes[R]['output']>`, how is `R` determined for `call('GET /orders/:id', { id: 1042 })`?
    options:
      - text: From the `input` object, by matching its shape against every route.
        why: "`input` is typed as `Routes[R]['input']`, which depends on `R`; it is checked after `R` is known, not used to find it."
      - text: From the route string, which is the literal `'GET /orders/:id'` because the constraint is a union of string literals.
        why: Correct. The literal stays literal thanks to the `keyof Routes` constraint, and the other types are looked up from it.
      - text: From the declared return type at the call site.
        why: TypeScript can use a contextual return type in some cases, but here the route argument decides everything.
    answer: 1
  - q: The implementation of `call` needs to read path parameters from `input`, whose type is `Routes[R]['input']`. What is the most reasonable approach?
    options:
      - text: "Make the public signature take `input: any` so the implementation can read anything."
        why: That throws away the checking callers rely on, which is the whole point of the client.
      - text: Write one overload per route so each implementation is concrete.
        why: That duplicates the route map and has to be updated by hand for every new endpoint.
      - text: Keep the generic public signature and treat `input` as `Record<string, unknown>` inside, with one commented cast.
        why: Correct. The cast is local, reviewed once, and invisible to callers, who keep full checking.
    answer: 2
  - q: Your client declares `'GET /orders/:id'` as returning `Order`. The server ships a change that renames `status` to `state`. What does TypeScript do?
    options:
      - text: Nothing at compile time; the code reads `order.status`, gets `undefined` at runtime, and fails somewhere downstream.
        why: Correct. The route map is a promise about the server that TypeScript cannot check. Validate responses at the boundary to catch this early.
      - text: It reports an error on the `call` line the next time you build.
        why: TypeScript never sees the server's response. It only checks your code against the types you declared.
      - text: It throws a runtime type error inside `call`.
        why: Types are erased; nothing checks the response at runtime unless you write that check.
    answer: 0
  - q: Why is it better to type the route as one string like `'POST /orders/:id/cancel'` instead of passing method and path as two separate arguments?
    options:
      - text: Because two arguments cannot both be literal types.
        why: They can; each argument can have its own literal type. The issue is keeping them consistent.
      - text: Because one key gives a single inference site that identifies the endpoint, so method and path can never be mismatched.
        why: Correct. With separate arguments you would need extra machinery to stop a `POST` being paired with a GET-only path.
      - text: Because `fetch` requires the method in the URL.
        why: "`fetch` takes the method in its options object. The single key is a typing choice, not a runtime requirement."
    answer: 1
---

Every API client starts the same way: `fetch(url).then((r) => r.json())`, which returns `Promise<any>`, and a codebase slowly fills with `as Order` and `as Order[]` at call sites. Each cast is a small, unreviewed claim about the server. This lesson puts the whole section together to build a client where callers write no casts and no type arguments, and where a wrong route, a missing field or a mistyped id fails to compile.

## One source of truth: the route map

Start by writing down every endpoint once, as a type:

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
type Order = { id: number; status: OrderStatus; totalCents: number };
type CancelledOrder = { id: number; status: 'cancelled'; cancelReason: string };
type Page<T> = { items: T[]; nextCursor: string | null };

type Routes = {
  'GET /orders/:id': { input: { id: number }; output: Order };
  'GET /orders': { input: { status?: OrderStatus; cursor?: string }; output: Page<Order> };
  'POST /orders/:id/cancel': { input: { id: number; reason: string }; output: CancelledOrder };
};
```

Each key names an endpoint, method and path together. Each value says what the endpoint takes and what it returns. Nothing else in the client will mention `Order` or `Page` directly; it will all be derived from this table. Adding an endpoint means adding one line here.

## The route name is the only inference site

Now the signature. You want the caller to write the route and the input, and get the right response type back:

```ts
async function call<R extends keyof Routes>(
  route: R,
  input: Routes[R]['input'],
): Promise<Routes[R]['output']> {
  // implementation below
}

const order = await call('GET /orders/:id', { id: 1042 });        // Order
const page = await call('GET /orders', { status: 'shipped' });    // Page<Order>
await call('POST /orders/:id/cancel', { id: 1042 });
// Error: Argument of type '{ id: number; }' is not assignable to parameter
// of type '{ id: number; reason: string; }'.
//   Property 'reason' is missing in type '{ id: number; }' but required in type …
```

Every idea from this section is at work here. `R` appears three times, linking the route to the input and the output. Its constraint, `keyof Routes`, is a union of string literals, so the argument is inferred as the literal `'GET /orders/:id'` rather than `string`. And `R` has exactly one inference site, `route`; `input` only *uses* `R`, through the indexed access `Routes[R]['input']`. TypeScript infers the route, then checks the input against what that route needs. No `NoInfer` required, because nothing else could contribute a candidate.

:::figure The route key is inferred once; input and output are looked up from it
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">The call site passes a route string and an input object. The route string is inferred as the literal key R. R indexes the Routes map, which yields the input type used to check the input argument and the output type used for the returned promise.</title>
  <rect class="d-box" x="10" y="20" width="250" height="44" rx="10"/>
  <text class="d-code" x="135" y="47" text-anchor="middle">'GET /orders/:id'</text>
  <rect class="d-box" x="10" y="186" width="250" height="44" rx="10"/>
  <text class="d-code" x="135" y="213" text-anchor="middle">{ id: 1042 }</text>
  <path class="d-arrow" d="M260 42 L318 42" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="322" y="20" width="120" height="44" rx="10"/>
  <text class="d-code" x="382" y="47" text-anchor="middle">R</text>
  <path class="d-arrow" d="M382 64 L382 98" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="292" y="102" width="180" height="56" rx="12"/>
  <text class="d-code" x="382" y="135" text-anchor="middle">Routes[R]</text>
  <path class="d-arrow" d="M292 150 L264 196" marker-end="url(#arrow)"/>
  <text class="d-code" x="190" y="170" text-anchor="middle">['input'] checks</text>
  <path class="d-arrow" d="M472 130 L520 130" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="524" y="102" width="166" height="56" rx="12"/>
  <text class="d-code" x="607" y="128" text-anchor="middle">['output']</text>
  <text class="d-label-muted" x="607" y="148" text-anchor="middle">Promise&lt;Order&gt;</text>
</svg>
:::

## Unsafe inside, safe outside

Inside `call`, `input` has the type `Routes[R]['input']` for some unknown `R`. TypeScript cannot know which fields it has, so building the URL needs a cast. That is fine, as long as it happens in exactly one place:

```ts
type Transport = (method: string, path: string, body: unknown) => Promise<unknown>;

function createClient(transport: Transport) {
  return async function call<R extends keyof Routes>(
    route: R,
    input: Routes[R]['input'],
  ): Promise<Routes[R]['output']> {
    const [method, template] = route.split(' ');
    // The route map guarantees every :param has a matching input field.
    const values = input as Record<string, unknown>;
    const rest: Record<string, unknown> = { ...values };
    const path = template.replace(/:(\w+)/g, (_, name: string) => {
      delete rest[name];
      return encodeURIComponent(String(values[name]));
    });
    const result = await transport(method, path, method === 'GET' ? undefined : rest);
    return result as Routes[R]['output'];
  };
}
```

There are two casts, both commented, both in the one function every request goes through. Callers get a fully checked API, and a reviewer who wants to audit the unsafe parts reads ten lines. Compare that with a codebase where every one of two hundred call sites says `as Order`.

Injecting the `transport` is a design choice worth copying. The real app passes a function that calls `fetch`; tests pass a fake that records requests and returns canned data. The types do not care which.

:::mistake Believing the output type
`Promise<Routes[R]['output']>` is a promise *you* make about the server, and the final `as` is where you make it. If the backend renames `status` to `state`, everything still compiles, and the failure shows up as `undefined` three components away. The types organise your assumptions; they do not verify them. In [Parsing Untrusted Data at the Boundary](lesson:l-at-4-3) you will add a parser per route, so the output type is earned at runtime instead of asserted.
:::

## Growing the map

Real clients have endpoints that take nothing, such as `'GET /me'`. With this design you give them `input: {}` and callers write `call('GET /me', {})`. That empty object is a small wart, and it is a fair trade for now: the alternative is a signature that makes `input` optional only for some routes, which needs a conditional type. You will have that tool after [Conditional Types, Distribution and infer](lesson:l-at-3-3), and the change will touch only the signature, not a single call site.

The same goes for query strings versus bodies, headers, or per-route error types. Each is one more property on the route-map values and one more lookup in the signature. The shape of the solution stays the same: describe it once in the table, derive it everywhere else.

## What makes this design good

Look at what the caller never has to do: write `<Order>`, cast, import response types, or remember which endpoints need which fields. The best generic APIs feel like they have no types at all, because every type is inferred from something the caller had to write anyway (here, the route name).

:::tip Signs your generic API needs redesigning
Callers writing explicit type arguments, callers casting results, and type parameters that appear only once are all symptoms. They usually mean the inference site is missing or in the wrong place. Find the one argument that identifies what the caller wants, and derive everything else from it.
:::

In the exercise you will build this client against a fake transport. That ends the generics section. Section 3 takes apart the type operators you have been borrowing (`keyof`, indexed access) and adds mapped, conditional and template literal types, so you can derive even more from a single source of truth.
