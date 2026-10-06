---
summary: Build string types from other types with template literals, transform them with Uppercase and Capitalize, and parse route patterns with infer to type path parameters.
takeaways:
  - "A template literal type like `` `order.${OrderStatus}` `` builds string literal types, and a union inside it produces every combination."
  - "`Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize` are built-in types that transform string literal types."
  - "`infer` inside a template literal pattern captures substrings, which lets you parse route patterns such as `/orders/:orderId` at the type level."
  - "`${number}` and `${string}` placeholders accept loose patterns; they document a format but do not validate it strictly."
  - Unions inside template literals multiply, and TypeScript refuses unions over 100,000 members, so keep the inputs small.
further:
  - title: Template Literal Types
    url: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
  - title: Intrinsic String Manipulation Types
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html#intrinsic-string-manipulation-types
quiz:
  - q: "How many members does `` `${'s' | 'm' | 'l'}-${'red' | 'blue'}` `` have?"
    options:
      - text: "5, one per literal"
        why: Unions in a template literal combine, they do not add. Every size is paired with every colour.
      - text: "6, every size paired with every colour"
        why: Correct. The result is the cross product, `'s-red' | 's-blue' | 'm-red' | …`, so the sizes multiply.
      - text: "1, the pattern string itself"
        why: Template literal types with literal unions are expanded into concrete strings, not kept as one pattern.
    answer: 1
  - q: "What does `PathParams<'/orders/:orderId/lines/:lineId'>` give with the recursive definition from the lesson?"
    options:
      - text: "`'orderId' | 'lineId'`"
        why: Correct. The first match captures `orderId` and recurses on `lines/:lineId`, whose final match captures `lineId`.
      - text: "`':orderId' | ':lineId'`"
        why: The colon is part of the pattern, outside the `infer` placeholder, so it is not captured.
      - text: "`'orderId'` only"
        why: That is what you get without the recursive call on `Rest`; the recursion is what reaches the second parameter.
      - text: "`string`"
        why: "`infer` captures the exact literal substrings, so the result is a union of literals."
    answer: 0
  - q: "Which value is accepted by `type Price = `${number}``?"
    options:
      - text: "Only strings like `'12.50'` that look like money"
        why: "`${number}` has no idea about money formats; it accepts anything JavaScript would read back as a number."
      - text: "`'1e5'` as well as `'12.50'`"
        why: Correct. Any string that JavaScript parses as a number fits, including exponent notation (and even `'0x1F'`), so it is a loose check.
      - text: "Only integers, because `number` is not allowed in template literals"
        why: "`number` placeholders are allowed and accept decimals too."
    answer: 1
  - q: "A teammate builds `` `${Locale}/${Currency}/${Category}/${Sku}` `` from four unions with 40, 30, 15 and 500 members. What happens?"
    options:
      - text: It works, but autocompletion becomes slower.
        why: The product is 9 million members, far past the limit; it does not merely slow down.
      - text: TypeScript keeps it as an unexpanded pattern.
        why: Literal unions are always expanded; there is no lazy mode for them.
      - text: "TypeScript reports \"Expression produces a union type that is too complex to represent\"."
        why: Correct. The cross product exceeds the 100,000-member limit. Use `string` for the high-cardinality part, or validate at runtime.
    answer: 2
---

Cartwheel's checkout emits events like `order.shipped` and `payment.failed`, and its API client builds URLs from patterns like `/orders/:orderId/lines/:lineId`. Both are strings with structure. Typing them as `string` means a typo in an event name or a missing path parameter only shows up when a listener never fires or a request 404s. Template literal types let the compiler see the structure.

## Building strings from types

A template literal type uses the same backtick syntax as JavaScript template strings, but with types in the placeholders:

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

type OrderEvent = `order.${OrderStatus}`;
// 'order.processing' | 'order.shipped' | 'order.delivered' | 'order.cancelled' | 'order.returned'

type CheckoutEvent = OrderEvent | `payment.${'captured' | 'failed'}`;
```

When a placeholder holds a union, the result has one member per union member. With two placeholders, you get every combination: `` `${'s' | 'm' | 'l'}-${'red' | 'blue'}` `` is six strings. This is the feature's power and its danger, as you will see at the end of the lesson.

Now an event bus can type its event names from the domain types you already have:

```ts
declare function on(event: CheckoutEvent, handler: () => void): void;

on('order.shipped', () => {});
on('order.shiped', () => {});
// Error: Argument of type '"order.shiped"' is not assignable to parameter of type 'CheckoutEvent'.
```

Add a status to `OrderStatus` and `order.on-hold` becomes a valid event name automatically.

## Transforming strings

TypeScript ships four **intrinsic** string types that transform literal types: `Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize`. You used `Capitalize` for setter names in [Mapped Types and Key Remapping](lesson:l-at-3-2). Another common use is environment variables and feature flags:

```ts
type Feature = 'express-shipping' | 'gift-wrap';
type FlagEnvVar = `CHECKOUT_${Uppercase<Feature>}`;
// 'CHECKOUT_EXPRESS-SHIPPING' | 'CHECKOUT_GIFT-WRAP'
```

They are built into the compiler rather than defined in TypeScript, so you cannot see their source, but they behave like any other generic type.

## Parsing strings with infer

Template literal types also work as **patterns** in a conditional type. Combined with `infer`, they pull substrings out of a string literal type:

```ts
type Method<R> = R extends `${infer M} ${string}` ? M : never;

type M1 = Method<'POST /orders/:id/cancel'>; // 'POST'
```

The pattern `` `${infer M} ${string}` `` means "some text, a space, then anything". TypeScript matches it against the literal and binds `M` to the part before the first space.

Here is the type that makes the URL builder safe. It collects every `:param` in a route pattern:

```ts
type PathParams<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? Param | PathParams<Rest>
    : P extends `${string}:${infer Param}`
      ? Param
      : never;

type P1 = PathParams<'/orders/:orderId/lines/:lineId'>; // 'orderId' | 'lineId'
type P2 = PathParams<'/orders'>;                        // never
```

Read it as two cases. If there is a parameter followed by more path, capture the parameter and recurse on the rest. If there is a parameter at the end, capture it. Otherwise there are no parameters. When TypeScript matches a pattern, each `infer` placeholder takes the shortest text that lets the rest of the pattern match, so `Param` stops at the first `/`.

The recursion (`PathParams<Rest>`) is the subject of the next lesson. For now, see what it gives you:

```ts
function buildPath<P extends string>(pattern: P, params: Record<PathParams<P>, string | number>): string {
  // Every :param in the pattern has a key in params, by construction.
  const values = params as Record<string, string | number>;
  return pattern.replace(/:(\w+)/g, (_, name: string) => encodeURIComponent(String(values[name])));
}

buildPath('/orders/:orderId/lines/:lineId', { orderId: 1042, lineId: 3 }); // '/orders/1042/lines/3'
buildPath('/orders/:orderId/lines/:lineId', { orderId: 1042 });
// Error: … Property 'lineId' is missing in type '{ orderId: number; }' …
```

`P` is inferred as the literal pattern, `PathParams<P>` turns it into the required keys, and `Record` turns those into the shape of `params`. A route with no parameters takes `{}`.

## Template literals as keys

Event names are only half the story; each event also carries a payload. A mapped type with an `as` clause can build the whole name-to-payload table from the status union in one go:

```ts
type OrderEventPayloads = {
  [S in OrderStatus as `order.${S}`]: { orderId: number; status: S };
};

type ShippedPayload = OrderEventPayloads['order.shipped'];
// { orderId: number; status: 'shipped' }
```

The loop runs over statuses, the `as` clause turns each one into an event name, and the payload type can still refer to the original `S`. This table is exactly what a typed event emitter needs, and you will build one on top of it in [Type-Safe Event Emitters and Builders](lesson:l-at-4-4). Notice that nothing here is new: it is a mapped type, a template literal and an indexed access, combined. Most real type-level code is a few small pieces like these, put together carefully.

:::note Loose placeholders
`${string}` and `${number}` placeholders match broadly. `` `${number}` `` accepts `'12.50'`, but also `'1e5'` and `'-0'`, because it means "anything JavaScript reads back as a number". Types like `` `${Category}-${string}` `` for SKUs are useful documentation and catch obvious mistakes, but they are not validation; check real input at runtime.
:::

:::mistake Multiplying unions until the compiler gives up
Each placeholder multiplies the union size. Four placeholders with 40, 30, 15 and 500 members would be nine million strings, and TypeScript stops at 100,000 with *Expression produces a union type that is too complex to represent*. Long before that limit, editors get slow. Use template literals with small, closed unions (statuses, methods, a handful of locales) and use `string` for anything high-cardinality, like SKUs or ids.
:::

In the exercise you will type Cartwheel's event names and URL builder. Next lesson looks at recursion in types: what it is good for, how deep it can go, and when a simpler type is the better engineering choice.
