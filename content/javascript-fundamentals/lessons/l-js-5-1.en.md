---
summary: Split a growing program into modules with export and import, load them in the browser with type="module" from a dev server, and organise Pocket into files with clear jobs.
takeaways:
  - A module is a file with its own scope; nothing in it is visible to other files unless it is exported.
  - Prefer named exports (`export function formatMoney`), which keep the same name everywhere and are easy to search for.
  - In the browser, load the entry file with `<script type="module">`, use relative paths with the `.js` extension, and serve the files over http.
  - 'In Node.js, files are ES modules when the nearest `package.json` has `"type": "module"` or the file ends in `.mjs`.'
  - Organise by job: pure logic in modules that never touch the page, and a thin entry file that wires logic, storage and the DOM together.
further:
  - title: JavaScript modules (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
  - title: export (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
  - title: "Modules: ECMAScript modules (Node.js)"
    url: https://nodejs.org/api/esm.html
quiz:
  - q: 'The browser console says `Uncaught SyntaxError: Cannot use import statement outside a module`. What is the fix?'
    options:
      - text: Rename the file from `.js` to `.mjs`.
        why: The browser does not decide by file extension. It decides by how the script tag loads the file.
      - text: Move the `import` lines to the bottom of the file.
        why: Imports are allowed only in modules, wherever they appear. Moving them does not make the file a module.
      - text: Wrap the imports in a function.
        why: Static `import` statements must be at the top level of a module; inside a function they are a syntax error.
      - text: Load the entry file with `<script type="module" src="./main.js">`.
        why: Correct. Without `type="module"`, the browser runs the file as a classic script, where `import` is not allowed.
    answer: 3
  - q: '`money.js` declares `function toCents(d) { … }` without `export`. What happens when `main.js` runs `import { toCents } from "./money.js";`?'
    options:
      - text: It works, because all top-level functions are shared between modules.
        why: Each module has its own scope. Only exported names can be imported.
      - text: Loading fails with a SyntaxError saying `money.js` does not provide an export named `toCents`.
        why: Correct. Imports are checked before any code runs, so the mistake is reported immediately.
      - text: '`toCents` is imported as `undefined` and the error appears when you call it.'
        why: Named imports are linked before the code runs; a missing export stops the module graph from loading at all.
    answer: 1
  - q: You open `index.html` by double-clicking it, and the module script fails to load with a CORS error. Why?
    options:
      - text: Module scripts are blocked from `file://` pages, so the files must be served over http, for example by a dev server.
        why: Correct. Browsers apply stricter loading rules to modules. Any local server, such as the one Vite starts, fixes it.
      - text: Modules only work after the site is deployed to the internet.
        why: A local server on your own computer is enough. Deployment is not required.
      - text: The browser is too old to support modules.
        why: Every current browser has supported modules for years. The problem is the `file://` origin, not the browser.
    answer: 0
---

Pocket now has money helpers, validation, storage, rendering, event handlers and network code. In one file that is several hundred lines, every function can see every variable, and changing one part means scrolling past all the others. Real programs are split into files, each with one job, and JavaScript's way of doing that is **modules**.

## A module is a file with its own scope

In a module, top-level variables and functions are private to that file. To share something, you `export` it. To use something from another module, you `import` it:

```js title=src/money.js
export function toCents(dollars) {
  return Math.round(dollars * 100);
}

export function formatMoney(cents, symbol = "$") {
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

const SECRET_ROUNDING_NOTE = "not exported, so only this file can see it";
```

```js title=src/main.js
import { toCents, formatMoney } from "./money.js";

console.log(formatMoney(toCents(12.2)));
```

The curly braces list the **named exports** you want. The path starts with `./`, meaning "relative to this file", and in the browser it includes the `.js` extension. `SECRET_ROUNDING_NOTE` cannot be imported at all; that is the point. Each module decides what it offers, and everything else is hidden, much like the closures from section 2, at file level.

A few more forms you will see:

```js title=src/main.js
import { formatMoney as fmt } from "./money.js";   // rename on import
import * as money from "./money.js";                // everything, as money.toCents etc.
```

There is also a **default export**, one per file, imported without braces and under any name you like: `export default function renderApp() {}` and then `import renderApp from "./ui.js"`. Many teams prefer named exports, and so does this course: a named export has the same name in every file that uses it, so search and automatic renaming in your editor work reliably.

## Loading modules in the browser

The entry file is loaded with `type="module"`, and it imports everything else:

```html title=index.html
<script type="module" src="./src/main.js"></script>
```

Module scripts behave a little differently from the classic scripts you have used so far. They are deferred automatically, so the DOM is ready when they run. They run in strict mode, which turns some silent mistakes into errors. And each module runs **once**, however many files import it, so a module-level variable is shared by all its importers.

:::mistake Opening the page from the file system
Double-clicking `index.html` opens it from a `file://` address, and browsers refuse to load module scripts from there: you get a CORS error in the console. Serve the folder over http instead. The usual way is a dev server: create a project with `npm create vite@latest` and run `npm run dev`, or run `npx serve` in the folder.
:::

In practice, most projects use a build tool such as Vite. It serves your modules during development, lets you import packages from npm by name (`import { something } from "some-package"`), and at build time bundles everything into a few optimised files. The `import` and `export` syntax you write is exactly the same.

## Modules in Node.js

Node.js supports the same syntax. A file is treated as an ES module when the nearest `package.json` contains `"type": "module"`, or when the file name ends in `.mjs`. (Recent Node.js versions also detect `import` syntax in a plain `.js` file, but setting `"type"` explicitly is clearer.) You will also meet the older Node.js system, CommonJS, which uses `require()` and `module.exports`; it is still common in existing projects, but new code uses `import` and `export`.

## Organising Pocket

A good split follows jobs, and keeps the parts that touch the outside world separate from the pure logic:

:::figure Pocket's modules and what imports what
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">main.js imports from ui.js, storage.js and expenses.js. ui.js imports from money.js. expenses.js and money.js are pure logic that never touch the page or storage.</title>
  <rect class="d-box-primary" x="270" y="16" width="140" height="48" rx="10"/>
  <text class="d-code" x="340" y="46" text-anchor="middle">main.js</text>
  <rect class="d-box-accent" x="40" y="110" width="150" height="48" rx="10"/>
  <text class="d-code" x="115" y="140" text-anchor="middle">ui.js</text>
  <rect class="d-box-accent" x="265" y="110" width="150" height="48" rx="10"/>
  <text class="d-code" x="340" y="140" text-anchor="middle">storage.js</text>
  <rect class="d-box-success" x="490" y="110" width="150" height="48" rx="10"/>
  <text class="d-code" x="565" y="140" text-anchor="middle">expenses.js</text>
  <rect class="d-box-success" x="40" y="196" width="150" height="48" rx="10"/>
  <text class="d-code" x="115" y="226" text-anchor="middle">money.js</text>
  <path class="d-arrow" d="M300 64 L150 106" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 64 L340 106" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M380 64 L530 106" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M115 158 L115 192" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="420" y="214" text-anchor="middle">green: pure logic, no DOM, no storage</text>
</svg>
:::

- `money.js`: `toCents`, `formatMoney`. Pure.
- `expenses.js`: `addExpense`, `removeExpense`, `totalCents`, `totalsByCategory`, `validateExpense`. Pure: data in, data out.
- `storage.js`: `loadExpenses`, `saveExpenses`. The only file that knows about `localStorage`.
- `ui.js`: `renderExpenses` and other DOM code.
- `main.js`: the entry point. Loads data, connects event listeners, and calls the others.

The rule behind the split: dependencies point from the outside in. `main.js` knows about everything; `expenses.js` knows about nothing but data. That means you can test, or reuse in Node.js, the core logic without a browser, and you can swap `localStorage` for a server later by changing one file.

:::tip Watch for circular imports
If `a.js` imports from `b.js` and `b.js` imports from `a.js`, one of them may run before the other has finished defining its exports, and you get confusing `undefined` or "cannot access before initialization" errors. When that happens, move the shared code into a third module that both import.
:::

This course's playground runs one file at a time, so the practice below is about reading module code. In the next lesson you will meet another way to organise code, classes, which group data with the functions that act on it.
