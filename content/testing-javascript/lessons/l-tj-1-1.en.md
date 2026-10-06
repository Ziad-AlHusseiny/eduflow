---
kind: intro
summary: Explain what automated tests buy a team, name the four layers of the testing trophy, and pick a sensible layer for a given risk in a small app.
takeaways:
  - A test is code that runs your code and throws when the result is wrong; every framework is a nicer wrapper around that idea.
  - Tests buy you the confidence to change code quickly; a test that never catches a bug and never documents anything costs more than it earns.
  - The testing trophy has four layers (static analysis, unit, integration, end-to-end), with integration tests usually giving the most confidence per minute of CI.
  - Choose the cheapest test that would fail if the thing you are worried about broke.
further:
  - title: Vitest — Why Vitest
    url: https://vitest.dev/guide/why
  - title: Playwright — Getting started
    url: https://playwright.dev/docs/intro
  - title: Testing Library — Guiding principles
    url: https://testing-library.com/docs/guiding-principles
quiz:
  - q: Splitwise-lite rounds each person's share to whole cents. Which test gives you the fastest, most precise signal that the rounding is right?
    options:
      - text: An end-to-end test that adds an expense in the browser and reads the balance.
        why: It would catch the bug, but it is slow, needs a running app and points at the whole stack when it fails, not at the rounding function.
      - text: A unit test that calls the split function with 1000 cents and 3 people.
        why: Correct. Rounding is pure logic with many edge cases, so a millisecond unit test is the cheapest test that fails exactly when the rounding breaks.
      - text: A TypeScript type check on the function signature.
        why: Types confirm the function takes and returns numbers, but they cannot tell 334 from 333; rounding is a value question, not a type question.
    answer: 1
  - q: What does a test framework fundamentally do when an assertion fails?
    options:
      - text: It edits the source code so the assertion passes next time.
        why: No framework changes your code; a failing test is information for you to act on.
      - text: It logs a warning and keeps the test green.
        why: A test that stays green on a failed assertion would be useless; frameworks mark the test as failed.
      - text: The assertion throws, the runner catches the error, marks that test failed and moves on.
        why: Correct. `expect(...).toBe(...)` throws an error on mismatch; the runner wraps each test in a try/catch and reports it.
    answer: 2
  - q: Your team's end-to-end suite takes 40 minutes and fails randomly about once a day. Which change most improves confidence per minute of CI?
    options:
      - text: Move most of the logic checks down to integration and unit tests, keeping a few end-to-end tests for critical flows.
        why: Correct. Lower layers check the same logic in milliseconds without browser flakiness; a handful of end-to-end tests still prove the pieces connect.
      - text: Add automatic retries until every test passes.
        why: Retries hide flakiness instead of fixing it and make the suite even slower; real bugs that fail intermittently get retried away too.
      - text: Delete the end-to-end suite and rely on unit tests only.
        why: Unit tests can all pass while the app is broken, for example when the form never calls the function they test. You still want a few end-to-end tests.
    answer: 0
---

Last spring a teammate of mine changed one line in a bill-splitting helper: `Math.round` became `Math.floor`, to "fix" a share that looked one cent too high. Every screen still worked. Three weeks later a user noticed their group's balances no longer added up to zero, and nobody could say which of 200 commits had done it. One three-line test would have failed within a second of that change.

That is what tests buy you: **the confidence to change code quickly**. Without them, every refactor is a gamble and every release needs someone clicking through the app. With good ones, you change the code, run the suite, and know.

## What a test is

Strip away the frameworks and a test is code that runs your code and **throws when the result is wrong**:

```js run
function splitEvenly(totalCents, people) {
  const base = Math.floor(totalCents / people);
  const remainder = totalCents % people;
  return Array.from({ length: people }, (_, i) => (i < remainder ? base + 1 : base));
}

const shares = splitEvenly(1000, 3);
const sum = shares.reduce((a, b) => a + b, 0);
if (sum !== 1000) throw new Error(`Expected shares to add up to 1000, got ${sum}`);
console.log('PASS shares add up to the total', shares);
```

Vitest, Jest and Playwright add a lot on top: nice failure messages, watch mode, parallel runs, browsers. Underneath, `expect(sum).toBe(1000)` is an `if` that throws.

## Tests cost something too

Every test is code you maintain. It takes time to write, CI minutes to run, and attention when it fails. A test that fails when nothing is broken (a *flaky* or *brittle* test) is worse than no test: people learn to ignore red builds. So the question is never "how many tests?" but **how much confidence per minute of CI** each one buys.

## The testing trophy

The *testing trophy* is a popular way to picture the layers and how much of each to write:

:::figure The testing trophy: integration tests give the most confidence for their cost
<svg viewBox="0 0 640 330" role="img" aria-labelledby="t1">
  <title id="t1">A trophy shape with four layers: static analysis at the base, a thin unit layer, a wide integration layer, and a small end-to-end layer on top.</title>
  <rect class="d-box-success" x="250" y="20" width="140" height="48" rx="10"/>
  <text class="d-label-strong" x="320" y="49" text-anchor="middle">End-to-end</text>
  <rect class="d-box-primary" x="170" y="80" width="300" height="96" rx="14"/>
  <text class="d-label-strong" x="320" y="122" text-anchor="middle">Integration</text>
  <text class="d-label-muted" x="320" y="148" text-anchor="middle">components + modules together</text>
  <rect class="d-box-accent" x="220" y="188" width="200" height="52" rx="10"/>
  <text class="d-label-strong" x="320" y="219" text-anchor="middle">Unit</text>
  <rect class="d-box-warn" x="190" y="252" width="260" height="52" rx="10"/>
  <text class="d-label-strong" x="320" y="283" text-anchor="middle">Static: types + lint</text>
  <path class="d-arrow" d="M520 290 L520 40" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="532" y="168">slower,</text>
  <text class="d-label-muted" x="532" y="188">costlier,</text>
  <text class="d-label-muted" x="532" y="208">more real</text>
</svg>
:::

- **Static analysis** (TypeScript, ESLint) catches typos and wrong types before anything runs.
- **Unit tests** check one function or module in isolation. Fast and precise; ideal for pure logic like money rounding.
- **Integration tests** check several units working together, such as a form component calling the real parsing code. They catch most real bugs for a modest cost, which is why the trophy is widest here.
- **End-to-end tests** drive the real app in a real browser. The most realistic and the most expensive; keep them for the flows that would make the news if they broke.

The rule I use daily: **pick the cheapest test that would fail if the thing you are worried about broke.**

## What you build in this course

The running project is **Splitwise-lite**, a bill-splitting module for a group trip: parse amounts, split bills, add tips, compute who owes whom and settle up, plus a small UI and a network layer. In the playground you get working code and write tests against it. Then the checker runs your tests against deliberately broken copies (a wrong rounding, an off-by-one, swapped arguments) and your tests must catch each one. Passing on good code is half the job; failing on bad code is the other half.

Before installing anything, build the core idea yourself in the exercise below: an assertion that throws and a runner that catches.
