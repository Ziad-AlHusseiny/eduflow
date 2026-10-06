---
summary: Choose the compiler flags that make your types trustworthy, from strict and noUncheckedIndexedAccess to verbatimModuleSyntax and moduleResolution bundler, and turn them on in an existing codebase without stopping work.
takeaways:
  - "`strict` is a family of checks (null checks, implicit any, function parameter checks and more), and it is the default from TypeScript 6.0 on."
  - "`noUncheckedIndexedAccess` adds `undefined` to array and record lookups, which catches the most common crash that `strict` misses."
  - "`exactOptionalPropertyTypes` separates a missing property from one explicitly set to `undefined`, which matters for PATCH bodies and spreads."
  - "`verbatimModuleSyntax` makes the emitted imports match what you wrote, so type-only imports must say `import type`."
  - "Use `moduleResolution: \"bundler\"` for apps built by Vite or another bundler, and `nodenext` for code that Node runs directly."
further:
  - title: TSConfig Reference
    url: https://www.typescriptlang.org/tsconfig/
  - title: noUncheckedIndexedAccess
    url: https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html
  - title: Modules - Choosing Compiler Options
    url: https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html
  - title: TypeScript 6.0 release notes
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html
quiz:
  - q: |
      With `strict` on but `noUncheckedIndexedAccess` off, what happens here when the cart is empty?
      ```ts
      const first = cart.lines[0];
      console.log(first.sku);
      ```
    options:
      - text: It compiles, and throws "Cannot read properties of undefined" at runtime.
        why: Correct. Without the flag, `lines[0]` is typed as `Line`, not `Line | undefined`, so the empty case is invisible.
      - text: It fails to compile, because `strictNullChecks` knows arrays can be empty.
        why: "`strictNullChecks` only tracks `null` and `undefined` in declared types. Index access is optimistic unless `noUncheckedIndexedAccess` is on."
      - text: It compiles and logs `undefined`.
        why: Reading `.sku` on `undefined` throws; it does not return `undefined`.
      - text: It fails to compile, because `strict` forbids index access.
        why: Index access is always allowed; the flag only changes the resulting type.
    answer: 0
  - q: "`type Patch = { couponCode?: string }`. With `exactOptionalPropertyTypes` on, which value is rejected?"
    options:
      - text: "`{}`"
        why: Leaving an optional property out is always allowed.
      - text: "`{ couponCode: 'LOYAL5' }`"
        why: A string is exactly what the property allows.
      - text: "`{ couponCode: undefined }`"
        why: "Correct. The flag treats \"present with value undefined\" as different from \"missing\"; declare `couponCode?: string | undefined` if you mean to allow it."
    answer: 2
  - q: "Your file has `import { Order, placeOrder } from './orders'` where `Order` is a type. With `verbatimModuleSyntax` on, what do you write?"
    options:
      - text: Nothing changes; the compiler removes `Order` from the output automatically.
        why: That automatic elision is exactly what the flag turns off, so emitted imports match the source.
      - text: "`import { type Order, placeOrder } from './orders'`"
        why: Correct. The `type` modifier marks `Order` as type-only, so it is erased while `placeOrder` stays.
      - text: "`import * as orders from './orders'` and use `orders.Order`"
        why: A namespace import works for values, but it does not solve the type-only marking the flag asks for.
      - text: Turn on `esModuleInterop`.
        why: "`esModuleInterop` is about CommonJS default imports and is unrelated to type-only imports."
    answer: 1
  - q: "Your Vite app has `\"moduleResolution\": \"node\"` in its tsconfig. What should you change it to, and why?"
    options:
      - text: "`\"classic\"`, because it is the most permissive."
        why: "`classic` predates npm conventions, and like `node` it is deprecated in TypeScript 6.0 and removed in 7.0."
      - text: "`\"nodenext\"`, because Vite runs on Node."
        why: Vite runs on Node, but your app code is resolved by the bundler, and `nodenext` would demand file extensions the bundler does not need.
      - text: "`\"bundler\"`, because it models how Vite resolves imports, including package `exports`, and `node` is deprecated."
        why: Correct. `bundler` matches the tool that actually resolves your imports, and `node` (`node10`) is removed in TypeScript 7.0.
    answer: 2
---

Every type in this course is only as trustworthy as the compiler settings behind it. The same `Order` type that catches a missing tracking number under one tsconfig waves a crash through under another. When I joined the migration I later led, the tsconfig had `strict: false` and the team was proud of its 100% TypeScript coverage. Most of that coverage was checking very little.

This lesson is about choosing flags deliberately, and about turning them on in a real codebase without a six-week freeze.

## strict: the baseline

`strict` is not one check but a family. The ones that matter most day to day:

| Flag | What it catches |
|---|---|
| `strictNullChecks` | Using a value that might be `null` or `undefined` |
| `noImplicitAny` | Parameters and variables silently typed `any` |
| `strictFunctionTypes` | Unsafe callback parameter types ([lesson 1-2](lesson:l-at-1-2)) |
| `useUnknownInCatchVariables` | Treating a caught value as an `Error` without checking |
| `strictPropertyInitialization` | Class fields that are never assigned |

From TypeScript 6.0, `strict` is on by default, so a new project gets it without asking. For older projects it is still the single most valuable line in the file. Everything else in this lesson assumes it.

## Two flags that strict leaves out

**`noUncheckedIndexedAccess`** makes index access honest. With it, `lines[0]` is `Line | undefined` and `STOCK[sku]` is `number | undefined`:

```ts
const first = cart.lines[0];
first.sku;
// Error: 'first' is possibly 'undefined'.

const available: number = STOCK[sku];
// Error: Type 'number | undefined' is not assignable to type 'number'.
```

"Cannot read properties of undefined" is the most common runtime error in JavaScript, and empty arrays and missing keys are its favourite sources. This flag catches them. The cost is some extra checks where you know an index is valid (inside `for (let i = 0; i < xs.length; i++)`); `for…of` loops and array methods like `map` are unaffected.

**`exactOptionalPropertyTypes`** separates "missing" from "present but `undefined`". Cartwheel's PATCH endpoint treats `{ couponCode: undefined }` as "remove the coupon" and `{}` as "leave it alone". Without the flag, both have the same type. With it:

```ts
type OrderPatch = { couponCode?: string };
const patch: OrderPatch = { couponCode: undefined };
// Error: Type '{ couponCode: undefined; }' is not assignable to type 'OrderPatch'
// with 'exactOptionalPropertyTypes: true'. …
```

If you really mean "may be explicitly undefined", say so: `couponCode?: string | undefined`. This flag is noisier to adopt, because many libraries' types were written without it, so turn it on after the others.

TypeScript 5.9's `tsc --init` now enables both flags by default in the tsconfig it generates, a strong hint about where the ecosystem is heading.

:::figure Three layers of a modern tsconfig
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">Three stacked layers. The bottom layer, strict, is the baseline of null and any checks. The middle layer adds noUncheckedIndexedAccess, exactOptionalPropertyTypes and noImplicitOverride for stricter correctness. The top layer covers module behaviour: verbatimModuleSyntax, moduleResolution bundler and erasableSyntaxOnly.</title>
  <rect class="d-box-primary" x="60" y="20" width="580" height="56" rx="12"/>
  <text class="d-label-strong" x="350" y="44" text-anchor="middle">How modules are emitted and resolved</text>
  <text class="d-code" x="350" y="66" text-anchor="middle">verbatimModuleSyntax · moduleResolution: bundler · erasableSyntaxOnly</text>
  <rect class="d-box-accent" x="60" y="88" width="580" height="56" rx="12"/>
  <text class="d-label-strong" x="350" y="112" text-anchor="middle">Correctness beyond strict</text>
  <text class="d-code" x="350" y="134" text-anchor="middle">noUncheckedIndexedAccess · exactOptionalPropertyTypes · noImplicitOverride</text>
  <rect class="d-box-success" x="60" y="156" width="580" height="56" rx="12"/>
  <text class="d-label-strong" x="350" y="180" text-anchor="middle">Baseline</text>
  <text class="d-code" x="350" y="202" text-anchor="middle">strict (default from TypeScript 6.0)</text>
</svg>
:::

## Module flags: say what you mean

**`verbatimModuleSyntax`** (TypeScript 5.0) makes emitted imports match what you wrote. Any import without a `type` modifier is kept; imports marked `type` are erased. That matters because tools such as Vite, esbuild and Node's built-in type stripping compile one file at a time and cannot look up whether `Order` is a type:

```ts
import { Order } from './orders';
// Error: 'Order' is a type and must be imported using a type-only import
// when 'verbatimModuleSyntax' is enabled.

import { type Order, placeOrder } from './orders'; // fine
```

**`moduleResolution`** tells TypeScript how your imports are found. Match it to the tool that actually resolves them. For an app built by Vite or another bundler, use `"bundler"` (with `"module": "esnext"` or `"preserve"`): it understands package `exports` and does not require file extensions. For code that Node runs directly, such as a server or a CLI, use `"module": "nodenext"`, which follows Node's real rules, including `.js` extensions in relative imports. The old `"node"` setting (also called `node10`) predates package `exports`; it is deprecated in TypeScript 6.0 and removed in 7.0, along with `baseUrl` and `target: "es5"`.

**`erasableSyntaxOnly`** (TypeScript 5.8) rejects the few TypeScript features that generate runtime code: `enum`, namespaces with values, constructor parameter properties, and the CommonJS-style `import x = require(…)` and `export =`. Turn it on if your code runs through Node's type stripping or you want TypeScript to stay "JavaScript plus types".

Put together, a tsconfig for a bundled app in 2026 looks like this:

```json title=tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

`noEmit` because the bundler produces the JavaScript and `tsc` only checks. `skipLibCheck` because checking every `.d.ts` in `node_modules` costs time and finds problems you cannot fix.

## Turning flags on in an existing codebase

Flip a flag on a big codebase and you might get 2,000 errors. Do not fix them all in one pull request. Measure first (`tsc --noEmit | grep -c "error TS"`), then pick one of two approaches. Either fix directory by directory using a separate tsconfig that extends the main one and includes only the clean folders, or turn the flag on everywhere and mark the existing errors with `// @ts-expect-error` plus a ticket reference, so new code is held to the new standard immediately and the old count only goes down.

:::mistake Turning strictness off to unblock a release
Setting `strict: false` "temporarily" to get a build out is how codebases end up with years of unchecked code: nothing new gets checked while it is off, and the error count when you turn it back on only grows. Suppress individual errors with `@ts-expect-error` and a reason instead; each one stays visible, searchable and removable.
:::

The exercise is a scenario: three real bugs, and you pick the flags that would have caught them. The playground itself runs with `strict` and the ES2022 library, which is why some later features need a small declaration to work there, as you will see next.
