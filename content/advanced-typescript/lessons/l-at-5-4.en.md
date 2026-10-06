---
summary: Migrate a JavaScript codebase to TypeScript one file at a time while it keeps shipping, and keep type-checking fast as the codebase and its types grow.
takeaways:
  - Migrate incrementally with `allowJs`, so JavaScript and TypeScript files live side by side and the app ships every day.
  - "`// @ts-check` plus JSDoc types gives a JavaScript file real checking before you rename it."
  - Convert leaf modules first and work toward the entry points, so each newly converted file imports typed code.
  - Type the boundaries (API responses, domain models) early; they give the most protection per hour spent.
  - Measure type-checking with `--extendedDiagnostics`, use incremental builds and project references, and keep heavy type-level code out of hot paths.
further:
  - title: Migrating from JavaScript
    url: https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
  - title: JSDoc Reference
    url: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
  - title: Project References
    url: https://www.typescriptlang.org/docs/handbook/project-references.html
  - title: Type Checking JavaScript Files
    url: https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html
quiz:
  - q: You are starting a migration of a 1,500-file JavaScript app. Which first step keeps the app shippable?
    options:
      - text: Create a long-lived `typescript` branch and rename every file to `.ts` there.
        why: A big-bang branch drifts from `main` daily and merges into a wall of conflicts and errors. Teams that try it often abandon it.
      - text: Rename every file to `.ts` on `main` and add `// @ts-nocheck` to each one.
        why: This creates thousands of files that look typed but check nothing, and removing the directive later is the same big-bang problem.
      - text: Wait until the team has time to convert everything in one sprint.
        why: That sprint never comes for a codebase this size; incremental work is the only approach that finishes.
      - text: Add a tsconfig with `allowJs`, run `tsc --noEmit` in CI, and convert files one at a time on `main`.
        why: Correct. JavaScript and TypeScript coexist, every pull request ships, and the converted share only goes up.
    answer: 3
  - q: In which order should you convert modules?
    options:
      - text: Entry points first, so the most visible code is typed.
        why: Entry points import everything else; converted early, they import untyped modules and get mostly `any`.
      - text: Leaf modules (those that import nothing internal) first, then the modules that depend on them.
        why: Correct. Each converted file then imports code that is already typed, so its own types are real from day one.
      - text: Alphabetically, so progress is easy to track.
        why: File names say nothing about dependencies; you would often convert a file before the code it relies on.
    answer: 1
  - q: "`tsc --extendedDiagnostics` shows 9 million type instantiations, most from one file. What is the likely cause?"
    options:
      - text: A heavy type-level utility (deep recursion, large template-literal unions) applied to a large type.
        why: Correct. Instantiation counts explode with recursive and combinatorial types; simplify or narrow that type first.
      - text: Too many comments in that file.
        why: Comments are skipped by the type checker; they cost nothing measurable.
      - text: Not enough `any` annotations.
        why: Adding `any` hides the problem by removing checking, which is not a fix.
    answer: 0
  - q: How does `// @ts-check` at the top of a `.js` file help a migration?
    options:
      - text: It converts the file to TypeScript automatically.
        why: The file stays JavaScript; nothing is renamed or rewritten.
      - text: It makes `tsc` emit a `.d.ts` file for that module.
        why: Declaration output depends on `declaration` settings, not on `@ts-check`.
      - text: It type-checks that JavaScript file, using JSDoc comments for types, so you can find bugs before renaming it.
        why: Correct. JSDoc annotations like `@param {Order} order` are real types to the checker, with no build changes.
    answer: 2
---

The migration I led took a 400,000-line JavaScript checkout and order system to strict TypeScript over about eighteen months, with no feature freeze and no long-lived branch. We shipped every day of it. The type-level techniques in this course matter, but on a real codebase the *process* decides whether a migration finishes. This lesson is that process, plus how to keep type-checking fast once you are done.

## Coexist first

Start by letting TypeScript and JavaScript live together:

```json title=tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "es2022",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

`allowJs` brings `.js` files into the program, so `.ts` files can import them and vice versa. `noEmit` leaves building to the existing bundler; `tsc --noEmit` runs in CI only as a checker. And `strict` is on from day one, but it only applies to `.ts` files, so new code is held to the full standard while old code is left alone. Merge this on `main` in a single small pull request. Nothing about the app changes.

## Check JavaScript before converting it

You can get real checking in a `.js` file without renaming it. Add `// @ts-check` at the top, and TypeScript checks the file, reading types from JSDoc comments:

```js title=src/money.js
// @ts-check

/** @typedef {'USD' | 'EUR' | 'EGP'} Currency */
/** @typedef {{ cents: number; currency: Currency }} Money */

/**
 * @param {Money} a
 * @param {Money} b
 * @returns {Money}
 */
export function add(a, b) {
  if (a.currency !== b.currency) throw new Error('Currency mismatch');
  return { cents: a.cents + b.cents, currency: a.currency };
}
```

That is the same checker, with the same rules, on a plain JavaScript file. Use it on the hottest, riskiest files first. JSDoc can even import types from `.ts` files with `@import` or `import('./types').Order`, so a JavaScript file can use the domain types you have already written.

## Convert from the leaves inward

When you do rename files, the order matters. Draw (or generate) the import graph and start at the **leaves**: modules that import nothing else from your codebase, such as money helpers, formatting, constants and the domain types. Then convert the modules that depend only on converted ones, and keep working inward toward the entry points.

:::figure Convert leaves first, so each new TypeScript file imports typed code
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">Import graph of the checkout. The checkout page imports the API client and the cart store, which both import money and format utilities. The leaves, money and format, are already TypeScript; the API client and cart store are in progress; the checkout page is still JavaScript. Conversion moves from the bottom up.</title>
  <rect class="d-box" x="260" y="16" width="180" height="46" rx="10"/>
  <text class="d-code" x="350" y="44" text-anchor="middle">checkoutPage.js</text>
  <rect class="d-box-warn" x="110" y="104" width="180" height="46" rx="10"/>
  <text class="d-code" x="200" y="132" text-anchor="middle">apiClient.ts</text>
  <rect class="d-box-warn" x="410" y="104" width="180" height="46" rx="10"/>
  <text class="d-code" x="500" y="132" text-anchor="middle">cartStore.js</text>
  <rect class="d-box-success" x="110" y="192" width="180" height="46" rx="10"/>
  <text class="d-code" x="200" y="220" text-anchor="middle">money.ts</text>
  <rect class="d-box-success" x="410" y="192" width="180" height="46" rx="10"/>
  <text class="d-code" x="500" y="220" text-anchor="middle">format.ts</text>
  <path class="d-arrow" d="M310 62 L230 102" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 62 L470 102" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M200 150 L200 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M500 150 L500 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M270 150 L440 190" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="640" y="132" text-anchor="middle">in progress</text>
  <text class="d-label-muted" x="640" y="220" text-anchor="middle">done first</text>
  <text class="d-label-muted" x="640" y="44" text-anchor="middle">last</text>
</svg>
:::

Converting an entry point first gives you a `.ts` file whose imports are all untyped, which means a lot of `any` and very little checking. Converting a leaf first gives every later file real types to build on.

Alongside the leaves, prioritise the **boundaries**: the API client, the parsers, the domain models. A typed `Order` and a parsed API response protect every file that touches them, converted or not. That is why sections 1, 2 and 4 of this course matter more for a migration than section 3.

When the last `.js` file is gone, remove `allowJs`. Then ratchet up the extra flags from [tsconfig Strictness That Pays Off](lesson:l-at-5-1), `noUncheckedIndexedAccess` first, one at a time, suppressing existing errors with `// @ts-expect-error` and a ticket so new code meets the bar immediately.

:::mistake Converting by renaming and adding any
Renaming a file to `.ts` and fixing every error with `any` or `as any` produces TypeScript-flavoured JavaScript: it looks finished and checks nothing. Worse, it hides the file from the "still to do" list. Track `any` the way you track test coverage (a lint rule such as `@typescript-eslint/no-explicit-any` set to warn, and a count in CI) and treat the number as a migration metric, not just the count of `.ts` files.
:::

## Keeping it fast

On a large codebase, type-checking speed becomes a developer-experience problem. Measure before you guess: `tsc --noEmit --extendedDiagnostics` prints check time, memory and the number of type instantiations. A sudden jump in instantiations almost always comes from a heavy type-level utility, like the recursive `Paths` from [Recursive Types and Knowing When to Stop](lesson:l-at-3-5), applied to a big type. `--generateTrace <dir>` records where the time goes, file by file.

The structural fixes are well established. Turn on `incremental` so unchanged files are not re-checked. Split a large repository into **project references** (`composite: true` in each package, `tsc -b` at the root), so each part is checked once and its declarations reused. Prefer interfaces that `extend` each other over long chains of `&` intersections for big object types, since the compiler caches interface relationships more effectively. And annotate the return types of exported functions, which saves the checker from re-inferring them and keeps declaration output stable.

:::note TypeScript 7
TypeScript 7.0, released in July 2026, is a native port of the compiler written in Go. It typically type-checks 8 to 12 times faster than 6.0 and keeps the same type system and command-line behaviour, but removes the options 6.0 deprecated and does not yet ship a programmatic API, so tools that embed the compiler may need to stay on 6.0 for a while. Fix 6.0's deprecation warnings first; then trying 7.0 is mostly a version bump.
:::

## Where to go from here

You have used types to design states, steered inference, written type-level code with restraint, built the patterns real codebases rely on, and set up the compiler to back them. The habit to keep is the one from the first lesson: before you write a type, name the bug it prevents. Then pick the simplest type that prevents it. The exercise below puts the migration playbook in order; the final assessment covers the whole course.
