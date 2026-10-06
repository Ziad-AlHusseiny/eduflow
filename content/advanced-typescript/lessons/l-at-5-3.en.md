---
summary: Describe JavaScript you did not write with declaration files, type globals and environment variables, and extend existing interfaces and modules with declaration merging and module augmentation.
takeaways:
  - A `.d.ts` file contains only types; `declare` describes something that exists at runtime but is defined elsewhere.
  - Check for built-in types or an `@types/` package before writing declarations, and write only the parts of a library you use.
  - Interfaces with the same name in the same scope merge into one; type aliases never merge, which is why extensible library types are interfaces.
  - "`declare module 'pkg' { … }` in a file that has an import or export augments that module; in a file without one it declares a whole new ambient module."
  - "`declare global { … }` inside a module adds to the global scope, for example a property on `Window` or a field on `ImportMetaEnv`."
further:
  - title: Declaration Files - Introduction
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
  - title: Declaration Merging
    url: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
  - title: Env Variables and Modes (Vite)
    url: https://vite.dev/guide/env-and-mode.html
quiz:
  - q: You add `import { quote } from 'legacy-shipping-calc'`, a JavaScript package with no types. What should you try first?
    options:
      - text: Write a full `.d.ts` describing every export of the package.
        why: Writing declarations is the last resort, and even then you only need the parts you use.
      - text: Add `declare module 'legacy-shipping-calc';` so everything is `any`.
        why: That silences the error by turning every import into `any`, which hides exactly the mistakes types are meant to catch.
      - text: Cast the import with `as any` at each call site.
        why: The import itself fails to type-check first, and scattering `any` makes things worse, not better.
      - text: Check whether the package ships its own types or has an `@types/legacy-shipping-calc` package.
        why: Correct. Most popular packages are typed one way or the other; only write declarations when neither exists.
    answer: 3
  - q: |
      What is `keyof CheckoutConfig` after these two declarations in the same scope?
      ```ts
      interface CheckoutConfig { currency: string }
      interface CheckoutConfig { giftWrap: boolean }
      ```
    options:
      - text: "`'currency' | 'giftWrap'`"
        why: Correct. Interfaces with the same name in the same scope merge their members.
      - text: "`'giftWrap'`, because the second declaration replaces the first"
        why: Interfaces never replace each other; they merge. Duplicate type aliases, by contrast, are an error.
      - text: It is an error, "Duplicate identifier 'CheckoutConfig'".
        why: That error is what you would get with two `type` aliases. Interfaces are designed to merge.
    answer: 0
  - q: "A file `vite-env.d.ts` contains only `interface ImportMetaEnv { readonly VITE_API_URL: string }` (plus Vite's reference directive). What does it do?"
    options:
      - text: It replaces Vite's `ImportMetaEnv`, removing the built-in `MODE` and `DEV` fields.
        why: Interfaces merge, so Vite's own fields stay and yours are added.
      - text: It adds `VITE_API_URL` to the existing global `ImportMetaEnv`, so `import.meta.env.VITE_API_URL` is a `string`.
        why: Correct. The file has no imports or exports, so it is a global script and its interface merges with Vite's global one.
      - text: It defines the variable's value at build time.
        why: Declarations never produce values; the value still comes from your `.env` file.
    answer: 1
  - q: "`types/ui.d.ts` contains only `declare module 'cartwheel-ui' { interface Theme { brand: string } }`. Afterwards, every import from `cartwheel-ui` is missing its other exports. Why?"
    options:
      - text: Interfaces cannot be declared inside `declare module`.
        why: They can; module augmentation is mostly interfaces.
      - text: The file needs a `/// <reference>` directive.
        why: A reference directive does not change whether the block augments or declares a module.
      - text: Without any import or export, the file is a script, so the block declares a brand-new ambient module that shadows the real one; add `export {}` or an import.
        why: Correct. In a module file, `declare module 'cartwheel-ui'` augments; in a script file, it declares from scratch.
    answer: 2
---

Not everything your TypeScript touches was written in TypeScript. Cartwheel's checkout loads an analytics snippet with a `<script>` tag, uses an old internal shipping calculator written in JavaScript, reads environment variables through Vite, and runs on a lib that is a year behind the browsers it ships to. For each of these, you need to tell the compiler about code it cannot see. That is what declaration files and `declare` are for.

## declare: it exists, trust me

`declare` describes something that exists at runtime but is defined somewhere else. It produces no JavaScript. A file ending in `.d.ts` contains only such declarations:

```ts title=types/analytics.d.ts
type AnalyticsEvent = 'checkout_started' | 'order_placed' | 'payment_failed';

declare const cartwheelAnalytics: {
  track(event: AnalyticsEvent, props?: Record<string, string | number>): void;
};
```

This file has no `import` or `export`, so it is a **global script**: everything in it is visible in every file of the project. Now `cartwheelAnalytics.track('order_plaecd')` is a compile error, which the snippet's documentation never managed.

A declaration is an unchecked promise, just like the `as` casts from earlier sections. If the snippet's real API differs, TypeScript will happily trust your version. Keep declarations small, write only the parts you use, and put a comment with the library version you checked them against.

## Typing a JavaScript package

Before writing any declarations for a package, check the two places types usually come from. Many packages ship their own (`"types"` in their `package.json`, or `.d.ts` files beside the JavaScript). For others, the community maintains `@types/` packages on DefinitelyTyped: `npm install -D @types/legacy-shipping-calc` if one exists.

For an internal package with neither, declare the module yourself:

```ts title=types/legacy-shipping-calc.d.ts
declare module 'legacy-shipping-calc' {
  export type Quote = { carrier: string; feeCents: number; days: number };
  export function quote(country: string, weightGrams: number): Quote[];
}
```

The shorthand `declare module 'legacy-shipping-calc';` with no body also works, and makes every import `any`. Treat it as a temporary escape hatch during a migration, not as a solution.

Keep hand-written declarations together in one folder, such as `types/`, and make sure your tsconfig's `include` covers it; a `.d.ts` file the compiler never sees does nothing, and the resulting "Could not find a declaration file for module" error is confusing the first time. Note too that this file is global, like the analytics one: a `declare module 'name'` block with a string name is how you describe a package from a script file.

## Declaration merging

Some declarations with the same name combine instead of clashing. The one you will use most: **interfaces merge**.

```ts
interface CheckoutConfig { currency: string }
interface CheckoutConfig { giftWrap: boolean }

const config: CheckoutConfig = { currency: 'EGP', giftWrap: true }; // both required
```

Type aliases never merge; two `type CheckoutConfig` declarations are a "Duplicate identifier" error. This is the main practical difference between `type` and `interface`, and it is why libraries that expect to be extended expose interfaces.

Merging is how you fill gaps in the standard library. The playground in this course uses the ES2022 lib, so `Array.prototype.findLast` (ES2023) is missing from its types even though every current browser has it. Merging into the global `Array<T>` interface adds it:

```ts
interface Array<T> {
  findLast(predicate: (value: T, index: number, array: T[]) => unknown): T | undefined;
}
```

In a real project, the better fix is the right `lib` or `target` setting. Merging is for the cases where config cannot express what the runtime actually has, such as a polyfill you ship yourself.

It is also how Vite types your environment variables. Its client types declare a global `ImportMetaEnv` interface, and your project merges into it:

```ts title=src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PAYMENTS_KEY: string;
}
```

## Module augmentation

To add to a type that lives *inside* a module, open the module with `declare module` from a file that is itself a module:

```ts title=src/theme.d.ts
import 'cartwheel-ui';

declare module 'cartwheel-ui' {
  interface Theme {
    brand: { primary: string; onPrimary: string };
  }
}
```

The `Theme` interface inside `cartwheel-ui` now has a `brand` field everywhere it is used. To add to the global scope from a module file, use `declare global { interface Window { dataLayer: unknown[] } }`.

:::mistake Declaring when you meant to augment
The same `declare module 'cartwheel-ui' { … }` block means two different things depending on its file. In a file with at least one `import` or `export`, it **augments** the existing module. In a file with none, it **declares** a brand-new ambient module that shadows the real package, and every other export of `cartwheel-ui` disappears. If an augmentation seems to wipe out a library, add `export {}` or the import line, and check again.
:::

:::tip Publishing your own types
If you publish a package, let TypeScript generate its declarations with `"declaration": true`. With `isolatedDeclarations` (TypeScript 5.5+), the compiler requires explicit types on everything you export, so faster tools can generate `.d.ts` files one file at a time without running the type checker. It is a good habit for any library's public API anyway.
:::

In the exercise you will declare the analytics global, add `findLast` to the playground's lib, and extend a config interface by merging. Last lesson: bringing a whole JavaScript codebase across.
