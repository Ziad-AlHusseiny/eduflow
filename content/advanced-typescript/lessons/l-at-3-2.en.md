---
summary: Transform every property of a type at once with mapped types, add or remove readonly and optional modifiers, and rename or drop keys with as clauses, re-implementing Partial, Pick and Omit along the way.
takeaways:
  - "A mapped type `{ [K in Keys]: … }` loops over a union of keys and builds one property per key."
  - Mapping over `keyof T` is homomorphic, so optional and readonly modifiers are copied from `T` unless you add or remove them.
  - "`+?`, `-?`, `+readonly` and `-readonly` add or strip modifiers; `Required<T>` is just `{ [K in keyof T]-?: T[K] }`."
  - An `as` clause renames each key, and mapping a key to `never` removes it, which is how `Omit` works.
  - Built-in mapped types are shallow; nested objects keep their original modifiers.
further:
  - title: Mapped Types
    url: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
  - title: Utility Types
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html
quiz:
  - q: |
      What is `Draft`?
      ```ts
      type Address = { readonly line1: string; city: string; postcode?: string };
      type Draft = { -readonly [K in keyof Address]-?: Address[K] };
      ```
    options:
      - text: "`{ line1: string; city: string; postcode: string }`"
        why: Correct. `-readonly` strips readonly from `line1`, `-?` makes `postcode` required, and the `undefined` that came with `?` is removed too.
      - text: "`{ readonly line1: string; city: string; postcode?: string }`"
        why: That is what you would get without the `-` modifiers; a homomorphic mapping copies them by default.
      - text: "`{ line1: string; city: string; postcode: string | undefined }`"
        why: "`-?` also removes the `undefined` that the optional modifier added, so `postcode` is plain `string`."
      - text: It is an error, because `-?` is only allowed in `Required`.
        why: "`Required` is an ordinary mapped type in the lib; the `-?` modifier works in any mapped type."
    answer: 0
  - q: Which definition re-implements `Omit<T, K>`?
    options:
      - text: "`{ [P in keyof T]: P extends K ? never : T[P] }`"
        why: This keeps every key and sets the omitted ones to type `never`, so they are still required properties that nothing can satisfy.
      - text: "`{ [P in K]: T[P] }`"
        why: That keeps only the listed keys, which is `Pick`, and it does not even compile without `K extends keyof T`.
      - text: "`{ [P in keyof T as Exclude<P, K>]: T[P] }`"
        why: Correct. The `as` clause maps omitted keys to `never`, and a key remapped to `never` is dropped from the result.
    answer: 2
  - q: "`type Setters<T> = { [K in keyof T as `set${Capitalize<K>}`]: (v: T[K]) => void }` fails to compile. Why?"
    options:
      - text: Template literal types are not allowed in `as` clauses.
        why: They are allowed; renaming keys with template literals is the main use of `as` clauses.
      - text: "`keyof T` can include `number` and `symbol` keys, and `Capitalize` only accepts strings, so write `Capitalize<K & string>`."
        why: Correct. Intersecting with `string` keeps only string keys, which `Capitalize` can work with.
      - text: "`T[K]` is not allowed once the key has been renamed."
        why: Inside the mapped type, `K` is still the original key, so `T[K]` works as usual.
    answer: 1
  - q: "`Readonly<Order>` is applied to `type Order = { id: number; lines: { sku: string }[] }`. Which assignment is still allowed?"
    options:
      - text: "`order.id = 1043`"
        why: "`id` is a top-level property, and `Readonly` marks every top-level property as readonly."
      - text: "`order.lines = []`"
        why: "`lines` itself is a top-level property, so reassigning it is rejected."
      - text: "`order.lines[0].sku = 'TENT-3P'`"
        why: Correct. `Readonly` is shallow; the array and its objects keep their original, mutable types.
    answer: 2
---

Cartwheel's checkout has an address form. The address type is simple:

```ts
type Address = { line1: string; city: string; country: string; postcode?: string };
```

The form needs more than the address, though. It needs, for each field, its current value, a validation error and whether the user has touched it. The PATCH endpoint needs a version where every field is optional. The review screen needs a frozen copy. You could write three more types by hand, each repeating the four field names, and update all of them whenever `Address` changes. Or you could write each one once, as a transformation. That is what a **mapped type** is: a loop over keys, at the type level.

## The loop

```ts
type FieldState<T> = {
  [K in keyof T]: { value: T[K]; error: string | null; touched: boolean };
};

type AddressForm = FieldState<Address>;
// {
//   line1: { value: string; error: string | null; touched: boolean };
//   city: { value: string; … };
//   country: { value: string; … };
//   postcode?: { value: string | undefined; … };
// }
```

Read `[K in keyof T]` as "for each key `K` of `T`". The right-hand side is evaluated once per key, with `K` bound to that key, so `T[K]` is that property's type. Add `phone` to `Address` and `AddressForm` grows a `phone` entry, with no edit.

:::figure A mapped type runs its body once per key
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">The keys of Address, line1, city, country and postcode, each pass through the mapped type body, which wraps the property type in an object with value, error and touched, producing one property per key in FieldState of Address.</title>
  <rect class="d-box" x="10" y="20" width="170" height="190" rx="12"/>
  <text class="d-label-strong" x="95" y="46" text-anchor="middle">keyof Address</text>
  <text class="d-code" x="95" y="84" text-anchor="middle">'line1'</text>
  <text class="d-code" x="95" y="114" text-anchor="middle">'city'</text>
  <text class="d-code" x="95" y="144" text-anchor="middle">'country'</text>
  <text class="d-code" x="95" y="174" text-anchor="middle">'postcode'</text>
  <path class="d-arrow" d="M180 115 L238 115" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="242" y="70" width="210" height="90" rx="12"/>
  <text class="d-code" x="347" y="100" text-anchor="middle">[K in keyof T]:</text>
  <text class="d-code" x="347" y="126" text-anchor="middle">{ value: T[K];</text>
  <text class="d-code" x="347" y="148" text-anchor="middle">error; touched }</text>
  <path class="d-arrow" d="M452 115 L506 115" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="510" y="20" width="180" height="190" rx="12"/>
  <text class="d-label-strong" x="600" y="46" text-anchor="middle">FieldState</text>
  <text class="d-code" x="600" y="84" text-anchor="middle">line1: {…}</text>
  <text class="d-code" x="600" y="114" text-anchor="middle">city: {…}</text>
  <text class="d-code" x="600" y="144" text-anchor="middle">country: {…}</text>
  <text class="d-code" x="600" y="174" text-anchor="middle">postcode?: {…}</text>
</svg>
:::

Notice that `postcode` stayed optional. When a mapped type loops over `keyof T` directly, TypeScript treats it as **homomorphic**: it copies each property's `?` and `readonly` modifiers from `T`. That is usually what you want, and it is why the built-in utility types preserve optionality.

You do not have to loop over `keyof`. Any union of keys works, which is all `Record` is:

```ts
type MyRecord<K extends PropertyKey, V> = { [P in K]: V };

type CountsByStatus = MyRecord<'processing' | 'shipped' | 'delivered', number>;
```

## Adding and removing modifiers

Put `?` or `readonly` in front of the property to add it, and prefix with `-` to remove it. With those, most of the lib's utility types are one line each:

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
```

`MyPartial<Address>` is the PATCH body type. `MyReadonly<Address>` is the frozen copy for the review screen. `-?` does one more thing than you might expect: it also removes the `undefined` that an optional property implicitly carries, so `MyRequired<Address>['postcode']` is `string`, not `string | undefined`.

`MyPick` is worth a second look. It maps over `K`, not `keyof T`, but because `K` is constrained to `keyof T`, TypeScript still treats it as homomorphic and keeps the modifiers of the picked properties.

:::mistake Expecting deep transformations
`Readonly<Order>` makes `order.lines = []` an error but happily allows `order.lines[0].sku = 'x'`. Every built-in mapped type is **shallow**: it transforms the top-level properties and leaves nested objects exactly as they were. If you need a deep version, it takes recursion, which is the subject of [Recursive Types and Knowing When to Stop](lesson:l-at-3-5), along with the reasons you might not want one.
:::

## Renaming keys with as

Since TypeScript 4.1, a mapped type can rename each key with an `as` clause. The new name can be any type expression involving `K`, typically a template literal:

```ts
type Setters<T> = {
  [K in keyof T as `set${Capitalize<K & string>}`]: (value: T[K]) => void;
};

type AddressSetters = Setters<Address>;
// { setLine1: (value: string) => void; setCity: …; setCountry: …; setPostcode?: … }
```

`K & string` is needed because `keyof T` may include `number` and `symbol` keys, and `Capitalize` only works on strings. You will see template literal types properly in [Template Literal Types](lesson:l-at-3-4).

The `as` clause has a second power: **a key mapped to `never` is dropped**. That is exactly how `Omit` is defined:

```ts
type MyOmit<T, K extends PropertyKey> = { [P in keyof T as Exclude<P, K>]: T[P] };

type NewAddress = MyOmit<Address, 'postcode'>; // { line1; city; country }
```

`Exclude<P, K>` gives `never` when `P` is one of the omitted keys and `P` otherwise. In the next lesson you will see how `Exclude` works, and how to filter keys by the *type* of their value rather than by name.

## Putting it to work

Types like `FieldState` pay off in the functions that use them. Here is the form's update function, written once for any form, not just addresses:

```ts
function setField<T, K extends keyof T>(form: FieldState<T>, key: K, value: T[K]): FieldState<T> {
  return { ...form, [key]: { ...form[key], value, touched: true } };
}

setField(addressForm, 'city', 'Dubai'); // ok
setField(addressForm, 'city', 42);      // Error: Argument of type 'number' is not assignable to parameter of type 'string'.
setField(addressForm, 'cty', 'Dubai');  // Error: Argument of type '"cty"' is not assignable to parameter of type 'keyof Address'.
```

This is the `pluck` pattern from section 2 combined with a mapped type. `K` is inferred from the key you pass, `T[K]` checks the value against that field's type, and the mapped type guarantees the form has an entry for every field. When a `deliveryNotes` field is added to `Address`, the form type, the setters and this function all accept it immediately, and every place that builds a complete form is flagged until it handles the new field.

:::tip Name the transformations you reuse
Inline mapped types in function signatures are hard to read. Give each transformation a name that says what it is for (`FieldState`, `Patch`, `Setters`), keep it next to the types it serves, and let hover tooltips show the expansion. A reader should understand the signature from the name alone.
:::

In the exercise you will re-implement four utility types and build the address form's types from them. Next lesson adds the missing piece, conditionals, so your transformations can make decisions.
