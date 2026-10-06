---
summary: Run a layered test suite in CI with GitHub Actions so every pull request gets fast, trustworthy feedback, and decide which tests to skip or delete because they cost more than they catch.
takeaways:
  - Order CI from fast to slow (lint and types, then unit and integration tests, then end-to-end) so cheap failures stop the run early.
  - Make the test jobs required checks on the main branch, upload Playwright reports as artifacts, and shard slow end-to-end suites across machines.
  - Keep the whole pipeline fast enough that people wait for it; a 40-minute pipeline gets bypassed.
  - "Don't test trivial code, framework or library behaviour, styling or implementation details; delete tests that never fail for a real reason."
  - A test earns its place when it would fail for a bug someone could plausibly ship, quickly and with a clear message.
further:
  - title: Playwright — Continuous Integration
    url: https://playwright.dev/docs/ci-intro
  - title: Playwright — Sharding
    url: https://playwright.dev/docs/test-sharding
  - title: GitHub Docs — About protected branches
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
  - title: Vitest — Reporters
    url: https://vitest.dev/guide/reporters
quiz:
  - q: Your pipeline runs Playwright first (12 minutes), then lint (20 seconds). A typo in an import fails lint on most broken pull requests. What's the better order?
    options:
      - text: Keep the order; end-to-end tests are the most important, so they should run first.
        why: Importance isn't the point; running the slowest job first means developers wait 12 minutes to learn about a 20-second problem.
      - text: Lint and type check first, then unit and integration tests, then end-to-end only if those pass.
        why: Correct. Fast, cheap checks fail early and save runner minutes; the slow stage only runs on code that is already plausible.
      - text: Run lint only on the main branch after merging.
        why: Then broken code reaches main before anyone notices, which is exactly what CI on pull requests exists to prevent.
    answer: 1
  - q: Which of these tests is the best candidate for deletion?
    options:
      - text: A regression test for a reported bug where `'12.5'` was parsed as 1205 cents.
        why: Regression tests for real bugs are among the most valuable tests you own; that bug happened once and can happen again.
      - text: A test that renders a component and checks that React's `useState` setter updates the state.
        why: Correct. It tests React, not your code. React's own suite covers that, and the test can only fail if React itself is broken.
      - text: An end-to-end test that adds an expense and checks the balances update.
        why: That's a critical flow where the connection between UI, API and logic is the risk, exactly what end-to-end tests are for.
    answer: 1
  - q: The end-to-end suite has grown to 30 minutes on one machine. What's the most effective first step?
    options:
      - text: Shard it across several machines with `--shard`, and check whether some end-to-end tests duplicate lower-level ones.
        why: Correct. Sharding cuts wall-clock time immediately; moving duplicated checks down the trophy cuts the total work.
      - text: Run the end-to-end suite only once a week.
        why: Then a week of changes lands before anyone learns that a critical flow broke, and finding the culprit gets much harder.
      - text: Increase the timeout of every test so fewer of them fail.
        why: Timeouts aren't the problem here, and longer ones make a slow suite slower when something does go wrong.
    answer: 0
---

Tests on your laptop protect you. Tests in CI protect the whole team, on every pull request, whether or not someone remembered to run them. This last lesson puts the pieces together: a pipeline that runs the layers you've built in the right order, and the judgement about what deserves a test at all.

## A pipeline from fast to slow

The order matters as much as the content. Cheap checks that fail often go first, so a typo costs 30 seconds of feedback instead of 12 minutes:

:::figure A pull request pipeline, cheapest checks first
<svg viewBox="0 0 680 170" role="img" aria-labelledby="t1">
  <title id="t1">Four stages left to right: lint and types in seconds, unit and integration tests in about a minute, build, then sharded end-to-end tests in a few minutes. Each stage runs only if the previous one passed.</title>
  <rect class="d-box-warn" x="10" y="50" width="145" height="70" rx="12"/>
  <text class="d-label-strong" x="82" y="80" text-anchor="middle">Lint + types</text>
  <text class="d-label-muted" x="82" y="104" text-anchor="middle">~30 s</text>
  <path class="d-arrow" d="M155 85 L183 85" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="185" y="50" width="145" height="70" rx="12"/>
  <text class="d-label-strong" x="257" y="80" text-anchor="middle">Vitest</text>
  <text class="d-label-muted" x="257" y="104" text-anchor="middle">~1 min</text>
  <path class="d-arrow" d="M330 85 L358 85" marker-end="url(#arrow)"/>
  <rect class="d-box" x="360" y="50" width="120" height="70" rx="12"/>
  <text class="d-label-strong" x="420" y="80" text-anchor="middle">Build</text>
  <text class="d-label-muted" x="420" y="104" text-anchor="middle">~30 s</text>
  <path class="d-arrow" d="M480 85 L508 85" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="510" y="50" width="160" height="70" rx="12"/>
  <text class="d-label-strong" x="590" y="80" text-anchor="middle">Playwright</text>
  <text class="d-label-muted" x="590" y="104" text-anchor="middle">3 shards, ~4 min</text>
  <text class="d-label-muted" x="340" y="155" text-anchor="middle">a failure stops the run early</text>
</svg>
:::

Here it is as a GitHub Actions workflow:

```yaml title=.github/workflows/test.yml
name: Test
on:
  pull_request:
  push:
    branches: [main]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npx vitest run --coverage

  e2e:
    needs: unit
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}/3
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 14
```

A few details are doing real work:

- **`needs: unit`** means the end-to-end job starts only when unit tests pass. No point booting browsers for code that fails `tsc`.
- **`--shard=1/3`** splits the Playwright suite across three machines that run in parallel. (For one combined report, switch to the `blob` reporter and run `npx playwright merge-reports` in a final job.)
- **`if: ${{ !cancelled() }}`** uploads the report even when tests fail, which is precisely when you need the traces from [the debugging lesson](lesson:l-tj-4-3).
- **`CI` is set automatically** on GitHub's runners, so Vitest runs once instead of watching, a stray `.only` fails, and the Playwright config's `retries: process.env.CI ? 2 : 0` kicks in.

Finally, in the repository settings, make these jobs **required status checks** on `main`, so a red pipeline actually blocks the merge. A pipeline nobody is required to pass is a suggestion.

:::tip Keep it under ten minutes
People wait for a pipeline that takes five minutes. They context-switch away from one that takes twenty, and they start merging around one that takes forty. Treat pipeline time as a budget: shard, cache dependencies, run Vitest's fast suite before anything slow, and move checks down the trophy when an end-to-end test duplicates a unit test.
:::

## Choosing what not to test

Every test costs writing time, CI minutes and maintenance. Some cost more than they will ever catch:

- **Trivial code**: a getter that returns a field, a constant (`expect(CURRENCY).toBe('USD')` restates the code).
- **Framework and library behaviour**: that `useState` updates state, that `Array.prototype.sort` sorts, that your date library formats dates. Their maintainers test that.
- **Implementation details**: which private helper was called, how many times a component rendered, internal state. These fail on refactors and pass on bugs.
- **Styling**: class names and pixel values in unit tests. If visual regressions matter, use screenshot tests in a real browser for a few key screens.
- **Throwaway code**: spikes and prototypes you're about to delete.

And be willing to **delete**. A test that has never failed for a real reason in two years, that breaks on every refactor, or that is permanently skipped, is a liability. Deleting it is a contribution.

:::mistake Testing everything at the same level
A suite with 400 end-to-end tests and 20 unit tests is slow, flaky and hard to debug; one with 2,000 unit tests and no end-to-end test can pass while the app can't even load. Neither is "more testing". Put each check at the lowest level that can catch the bug, and keep a handful of end-to-end tests for the flows that hold everything together.
:::

## The whole picture

You now have every layer: static checks, unit tests that pin behaviour and boundaries, UI tests that act like users, end-to-end tests that wait correctly and stay isolated, and the tools to judge them, coverage for gaps and mutation testing for strength. The question behind all of it stays the same one from the first lesson: **would this test fail for a bug someone could plausibly ship, quickly, with a message that says what broke?** Keep the tests that answer yes, fix the ones that could, and delete the rest.

The exercise asks you to make those calls on a real-looking list of tests.
