---
summary: Measure code coverage with Vitest, read the report to find untested code, and explain why a high coverage number can still hide a weak test suite.
takeaways:
  - Coverage measures which statements, branches, functions and lines ran during the tests, not whether anything checked the results.
  - The most useful part of a coverage report is the red and yellow it shows you; uncovered code is untested code for certain.
  - Branch coverage is stricter and more useful than line coverage, because one line can hold several decisions.
  - Use thresholds as a floor that stops coverage from sliding, not as a target to hit; a number that becomes a goal gets gamed.
further:
  - title: Vitest — Coverage guide
    url: https://vitest.dev/guide/coverage
  - title: Vitest — Coverage config
    url: https://vitest.dev/config/coverage
quiz:
  - q: A test calls `computeBalances(expenses)` and asserts only `expect(result).toBeDefined()`. Coverage for the file is 100%. What does that tell you?
    options:
      - text: The function is fully tested.
        why: Every line ran, but nothing checked the numbers; a sign error would still pass.
      - text: Every line ran during the tests, and nothing about whether the results are right.
        why: Correct. Coverage measures execution. The quality of the assertions is invisible to it.
      - text: Vitest miscounted, because 100% is impossible with one test.
        why: One test can easily execute every line of a small function; that's exactly why coverage alone is a weak signal.
    answer: 1
  - q: "Line coverage is 100% but branch coverage is 50% for `const share = people > 0 ? total / people : 0;`. What's missing?"
    options:
      - text: A test where `people` is 0 (or negative), so the other side of the conditional runs.
        why: Correct. The line ran, but only one of its two branches did; branch coverage notices, line coverage can't.
      - text: A second test with a larger `total`.
        why: A different total takes the same branch, so branch coverage stays at 50%.
      - text: Nothing; branch coverage is always lower than line coverage.
        why: It's often lower, but here it is pointing at a specific untested decision.
    answer: 0
  - q: Your team sets a hard 90% coverage threshold and makes it a quarterly goal. What is the most likely side effect?
    options:
      - text: Fewer bugs, because 90% of the code is now verified.
        why: Coverage counts execution, not verification, so the number can rise without bugs falling.
      - text: Slower CI, because coverage is expensive to collect.
        why: There's some overhead, but that's not the main risk of turning the number into a goal.
      - text: People write tests that execute code without meaningful assertions, so the number rises while confidence doesn't.
        why: Correct. Once a measure becomes a target, it gets optimised directly; use thresholds as a floor and read the report for gaps instead.
    answer: 2
---

Every team that adds tests eventually asks "how much is enough?", and coverage is the number that seems to answer. It answers a narrower question than people think. Used well, it's a fast way to find code nobody tested. Used as a score, it rewards the wrong tests.

## Turning it on

Vitest supports two coverage providers. The default, `v8`, uses the JavaScript engine's built-in coverage and needs no instrumentation step; `istanbul` instruments the code and works in more runtimes. Install the provider and run with `--coverage`:

```bash
npm install --save-dev @vitest/coverage-v8
npx vitest run --coverage
```

Configure what to measure and how to report it:

```js title=vite.config.js
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/main.jsx'],
      reporter: ['text', 'html'],
      thresholds: { lines: 80, branches: 75 },
    },
  },
});
```

`include` matters: in Vitest 4, without it, the report lists only files your tests happened to load, so a completely untested module doesn't appear at all and the percentage looks better than it is. With `include`, untested files show up at 0%. The `html` reporter writes `coverage/index.html`, which you open in a browser.

## The four numbers

- **Statements**: how many statements ran.
- **Branches**: how many sides of each decision ran (`if`/`else`, `? :`, `&&`, `||`, `??`, default parameters).
- **Functions**: how many functions were called at least once.
- **Lines**: how many lines had something run on them.

Branch coverage is the one I look at. `const share = people > 0 ? total / people : 0;` is one line and two branches. A test with three people makes the line 100% covered and the branches 50%, and the untested branch is exactly the edge case from section 2.

## Reading the report

The HTML report marks lines that never ran in red and branches that were taken only one way in yellow. That's the valuable part: **red code is untested, guaranteed.** No assertion anywhere could have checked it, because it never ran. When I join a project, the coverage report is the fastest map of where the risk lives: the uncovered error handling in the payment module, the `else` branch nobody hit.

:::figure Coverage sees what ran, not what was checked
<svg viewBox="0 0 640 230" role="img" aria-labelledby="t1">
  <title id="t1">A large box of all code; inside it a box of code executed by tests; inside that a smaller box of code whose results tests actually verify. Coverage reports the middle box.</title>
  <rect class="d-box" x="20" y="16" width="600" height="200" rx="16"/>
  <text class="d-label-strong" x="40" y="44">All code</text>
  <rect class="d-box-accent" x="120" y="60" width="440" height="140" rx="14"/>
  <text class="d-label-strong" x="140" y="88">Executed by tests</text>
  <text class="d-label-muted" x="400" y="88">what coverage reports</text>
  <rect class="d-box-success" x="200" y="106" width="250" height="78" rx="12"/>
  <text class="d-label-strong" x="325" y="140" text-anchor="middle">Results verified</text>
  <text class="d-label-muted" x="325" y="164" text-anchor="middle">what you need</text>
</svg>
:::

## What coverage can't see

Coverage records **execution**. It has no idea whether anything checked the result. This test makes `computeBalances` 100% covered:

```js
test('computes balances', () => {
  const balances = computeBalances([
    { paidBy: 'Ana', amountCents: 3000, splitAmong: ['Ana', 'Ben', 'Cai'] },
  ]);
  expect(Object.keys(balances)).toHaveLength(3);
});
```

Every line ran. The assertion would still pass if the payer were debited instead of credited, if the shares were floored and a cent vanished, or if a second expense overwrote the first. Coverage: 100%. Confidence: close to zero. The exercise starts from exactly this test.

:::mistake Coverage as a target
When a team is measured on the number, the number goes up, and the easiest way up is tests like the one above: call everything, assert little. That's Goodhart's law: a measure that becomes a target stops being a good measure. Set a threshold slightly below where you are today, as a **floor** that stops coverage from sliding when someone adds untested code, and never as a goal to chase.
:::

An uncovered line is a question, not an order. Sometimes the right answer is a test. Sometimes it's deleting the code: a branch nobody can reach, a fallback for a browser you stopped supporting, a helper nothing calls any more. Dead code that is "covered" by a test written only to raise the number is the worst outcome, because now it looks important.

## How much is enough?

There's no universal number. Useful rules of thumb:

- Aim for **high branch coverage on core logic** (money, permissions, data transformations), and accept less on glue code and UI wiring that end-to-end tests exercise anyway.
- Exclude code you deliberately don't unit test (entry points, generated files, type-only modules) so the number means something.
- Look at coverage **on the diff** in code review: did this change add untested branches? That's more actionable than a project-wide percentage.

Coverage tells you where tests are missing. To learn whether the tests you have are any good, you need a different tool, which is the next lesson. First, in the exercise, turn a 100%-coverage, catches-nothing suite into one that catches real bugs.
