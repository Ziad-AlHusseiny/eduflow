---
summary: Add Vitest to a Vite project, write and run a first test file, and use watch mode and filters to keep the feedback loop under a second.
takeaways:
  - Vitest reuses your Vite config, so the same aliases, plugins and transforms apply to your tests with almost no setup.
  - Files named `*.test.js` or `*.spec.js` (and their ts, jsx and tsx variants) are picked up automatically; put each one next to the code it tests.
  - Run `vitest` while you work (watch mode reruns affected tests on save) and `vitest run` in CI for a single pass.
  - The default environment is Node; switch to `jsdom` or `happy-dom` only for tests that need a DOM.
further:
  - title: Vitest — Getting Started
    url: https://vitest.dev/guide/
  - title: Vitest — Configuring Vitest
    url: https://vitest.dev/config/
  - title: Vitest — Test Environment
    url: https://vitest.dev/guide/environment
quiz:
  - q: You run `npx vitest` on your laptop and the command doesn't exit after the tests finish. What is going on?
    options:
      - text: A test is stuck waiting for a promise that never resolves.
        why: That would show as a timeout failure after a few seconds; here every test has finished and been reported.
      - text: Vitest is in watch mode and will rerun the affected tests when you save a file.
        why: Correct. In an interactive terminal `vitest` defaults to watch mode; `vitest run` (or `CI=true`) runs once and exits.
      - text: Vitest needs a `--exit` flag on macOS and Linux.
        why: There is no such requirement; the process stays alive on purpose because watch mode is the local default.
    answer: 1
  - q: Which file will Vitest pick up as a test file with the default configuration?
    options:
      - text: "`src/money.tests.js`"
        why: The default pattern matches `.test.` or `.spec.` before the extension; `.tests.` with an s does not match.
      - text: "`src/__tests__/money.js`"
        why: Vitest does not treat `__tests__` folders specially by default; the file name itself must contain `.test.` or `.spec.`.
      - text: "`src/money.spec.ts`"
        why: Correct. The default include pattern is `**/*.{test,spec}.?(c|m)[jt]s?(x)`, which covers `.spec.ts`.
      - text: "`test/money.js`"
        why: A `test` folder name is not enough; without `.test.` or `.spec.` in the file name it is ignored by default.
    answer: 2
  - q: "A test for `formatMoney` fails with `ReferenceError: document is not defined`, but `formatMoney` never touches the DOM. What is the most likely cause?"
    options:
      - text: The test file imports a module that touches `document` at import time, and the environment is Node.
        why: Correct. The default environment has no DOM; something in the import chain reads `document`. Either split that module or set the environment for that file.
      - text: "Vitest needs `globals: true` before tests can run."
        why: Globals only control whether `test` and `expect` are available without importing them; they have nothing to do with `document`.
      - text: Vitest can only test code that runs in the browser.
        why: "The opposite: by default Vitest runs tests in Node, which is why `document` is missing."
    answer: 0
---

The fastest way to stop writing tests is a slow, fiddly setup. If running one test takes 15 seconds and three config files, you will skip it "just this once" until there are no tests. Vitest exists largely to fix that: it plugs into the Vite setup your app already has, so a first test takes about two minutes.

## Install and run

In a Vite project (React, Vue, vanilla, it doesn't matter):

```bash
npm install --save-dev vitest
```

Add two scripts to `package.json`:

```json title=package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

`npm test` starts **watch mode**: Vitest runs the suite, then waits. When you save a file, it reruns only the tests that import it, using Vite's module graph. On a laptop that is usually well under a second, which is what makes testing feel like part of coding instead of a chore at the end. `npm run test:run` runs everything once and exits; that is the one for CI (Vitest also turns watch off automatically when the `CI` environment variable is set).

If you prefer a visual runner, install `@vitest/ui` and start `vitest --ui`: it opens a browser dashboard listing every file and test, with failures, console output and the module graph, and it reruns on save like the terminal does. The official Vitest extension for VS Code gives you the same run and debug buttons beside each test in the editor. Pick whichever keeps you in flow; the tests are identical.

## A first test file

Splitwise-lite keeps money as **integer cents** (more on why in the next lesson), so it needs a function that turns `1234` into `"$12.34"`:

```js title=src/money.js
export function formatMoney(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, '0');
  return `${sign}$${dollars}.${rest}`;
}
```

Put the test next to it, named so Vitest finds it:

```js title=src/money.test.js
import { describe, test, expect } from 'vitest';
import { formatMoney } from './money.js';

describe('formatMoney', () => {
  test('formats dollars and cents', () => {
    expect(formatMoney(1234)).toBe('$12.34');
  });

  test('pads single-digit cents', () => {
    expect(formatMoney(505)).toBe('$5.05');
  });
});
```

`describe` groups related tests (it shows up as `formatMoney > pads single-digit cents` in the report). `test` (alias `it`) declares one test. `expect(value).toBe(expected)` is the assertion: it throws when the values differ, exactly like the `expectEqual` you wrote in the previous lesson.

:::tip Co-locate tests
Keep `money.test.js` beside `money.js` rather than in a distant `tests/` folder. You see at a glance which modules have tests, and moving a module moves its test with it.
:::

## Where the config lives

Vitest reads your existing `vite.config.js`, so aliases and plugins work in tests for free. Test options go under a `test` key:

```js title=vite.config.js
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
});
```

The triple-slash line gives your editor the types for the `test` key. `environment: 'node'` is the default, written out here so you know the switch exists. Pure logic like money formatting runs in Node, which is fast. Tests that need `document` (you write those in section 3) use `jsdom` or `happy-dom`, installed separately and set either here or per file with a `// @vitest-environment jsdom` comment at the top.

You will also see `globals: true` in some projects. It makes `test` and `expect` available without importing them, Jest style. Explicit imports are the default and play better with editors and linters, so this course imports them.

:::mistake A DOM environment for everything
Setting `environment: 'jsdom'` globally "to be safe" makes every test file pay the cost of building a fake browser, and it hides accidental DOM access in code that should be pure. Default to Node; opt in per file when a test needs a DOM.
:::

## Running a slice of the suite

As the suite grows you will want to run less of it:

```bash
npx vitest money            # only files whose path contains "money"
npx vitest -t "pads"        # only tests whose name matches "pads"
npx vitest run --reporter=verbose   # one pass, every test name listed
```

Inside a file, `test.only(...)` runs that test alone and `test.skip(...)` parks one. Both are handy while debugging and dangerous if committed, because a stray `.only` silently turns off the rest of the file. Vitest guards against that in CI: when the `CI` environment variable is set, a test marked `.only` fails with "Unexpected .only modifier" instead of quietly skipping its neighbours.

## In the playground

The exercises below run in a browser sandbox with a Vitest-compatible subset: `describe`, `test`, `expect`, `vi` and hooks are already in scope, and the code under test (the **subject**) is loaded for you, so there are no imports. When you check your work, your tests run against the real subject and must pass, then against a few deliberately broken versions and must fail on each.

The next lesson looks closely at what goes inside a test and how to read the output when one fails.
