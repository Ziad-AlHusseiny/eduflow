---
summary: Debug failing Playwright tests with UI mode, the inspector and the trace viewer, then find and remove the usual causes of flakiness instead of retrying them away.
takeaways:
  - "UI mode (`npx playwright test --ui`) is the fastest local loop: watch mode, a timeline of every action and a DOM snapshot at each step."
  - "With `trace: 'on-first-retry'`, a test that fails in CI leaves a trace you can open with `npx playwright show-trace` to replay it step by step."
  - "Most flakiness comes from four causes: fixed sleeps or non-retrying assertions, shared data between tests, uncontrolled time or randomness, and missing `await`s."
  - "Reproduce flakiness with `--repeat-each`, fix the cause, and treat tests marked flaky as bugs; retries are a smoke alarm, not a fix."
further:
  - title: Playwright — Trace viewer
    url: https://playwright.dev/docs/trace-viewer
  - title: Playwright — UI Mode
    url: https://playwright.dev/docs/test-ui-mode
  - title: Playwright — Debugging tests
    url: https://playwright.dev/docs/debug
  - title: Playwright — Clock
    url: https://playwright.dev/docs/clock
quiz:
  - q: "A test failed once in CI and passed on retry. Your config has `trace: 'on-first-retry'`. What's the fastest way to see what the page looked like when it failed?"
    options:
      - text: Rerun the CI job until it fails again, watching the logs.
        why: You might wait many runs, and logs don't show the page; the evidence from the first failure is already there.
      - text: Add `console.log` calls around every action and push again.
        why: Logging is slow guesswork compared with a trace that recorded every action, snapshot and request.
      - text: Download the report artifact and open the trace with `npx playwright show-trace` (or the HTML report).
        why: Correct. The trace has DOM snapshots before and after each action, console output and network calls, so you can see exactly what the test saw.
    answer: 2
  - q: Which change fixes a test that sometimes fails on `expect(await page.getByRole('listitem').count()).toBe(3)`?
    options:
      - text: "`await expect(page.getByRole('listitem')).toHaveCount(3)`"
        why: Correct. The web-first assertion re-counts until there are three items or the timeout passes; `count()` reads once.
      - text: Add `await page.waitForTimeout(1000)` before the line.
        why: The sleep makes the test slower everywhere and still fails when CI is slower than one second.
      - text: Set `retries` to 3 in the config.
        why: Retries hide the race instead of removing it; the test will still fail sometimes, now more slowly.
    answer: 0
  - q: A test checks that an expense added today appears under "This week". It fails every Monday at 00:30 in CI. What's the most robust fix?
    options:
      - text: Skip the test on Mondays.
        why: That hides a real behaviour you want covered and leaves the time dependency in place.
      - text: Control time with `page.clock` (for example `setFixedTime`) so the test always runs on a known date.
        why: Correct. Pinning the clock makes the result independent of when the suite runs; you can also add a test for the Monday boundary on purpose.
      - text: Run CI only during working hours.
        why: It moves the failure to whoever runs the suite at night or in another time zone.
    answer: 1
  - q: "Playwright reports a test as \"flaky\". What does that label mean?"
    options:
      - text: The test is slow and close to its timeout.
        why: Slowness alone isn't flakiness; Playwright uses a separate "slow" annotation for that.
      - text: The test was skipped because the browser crashed.
        why: Crashes produce failures or interruptions, not the flaky label.
      - text: It failed at least once and then passed on a retry within the same run.
        why: Correct. With retries enabled, Playwright distinguishes "passed", "failed" and "flaky", so you can find and fix them.
    answer: 2
---

At a previous job we had an end-to-end suite that was red about one run in five. Everyone knew which tests "always do that", so everyone reran the pipeline. Then one Friday a real checkout bug shipped, because its failing test was one of the ones that "always do that". A flaky test isn't a minor annoyance; it trains the whole team to ignore the alarm.

This lesson has two halves: the tools for seeing why a test failed, and the short list of causes behind almost every flaky test.

## Seeing what happened

**UI mode** is where I spend most of my local debugging time:

```bash
npx playwright test --ui
```

It opens a window listing every test. Run one and you get a timeline of its actions; click any step to see a DOM snapshot of the page at that moment, plus console messages, network requests and the test source. It watches files and reruns on save. There's a locator picker too: hover the snapshot and it suggests a locator.

**The inspector** steps through a test one action at a time in a headed browser:

```bash
npx playwright test e2e/settle-up.spec.ts --debug
```

Add `await page.pause()` in a test to stop at a specific point.

**Traces** are for failures you didn't see happen, usually in CI. With `trace: 'on-first-retry'` in the config, Playwright records a trace on the first retry of a failed test: every action, a DOM snapshot before and after it, console output, network calls and the source line. Download the report from CI and open the trace:

```bash
npx playwright show-report            # HTML report, with traces attached
npx playwright show-trace trace.zip   # a single trace
```

Ninety percent of the time, the snapshot at the failing step tells you the answer immediately: a spinner covering the button, an error toast, a different page than expected.

:::figure From a CI failure to a fix
<svg viewBox="0 0 680 160" role="img" aria-labelledby="t1">
  <title id="t1">Four steps: the test fails in CI, Playwright retries it and records a trace, you open the trace and inspect the snapshot, then you fix the cause and confirm with repeat-each.</title>
  <rect class="d-box-warn" x="10" y="40" width="150" height="70" rx="12"/>
  <text class="d-label-strong" x="85" y="70" text-anchor="middle">Fails in CI</text>
  <text class="d-label-muted" x="85" y="94" text-anchor="middle">first attempt</text>
  <path class="d-arrow" d="M160 75 L184 75" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="186" y="40" width="150" height="70" rx="12"/>
  <text class="d-label-strong" x="261" y="70" text-anchor="middle">Retry + trace</text>
  <text class="d-code" x="261" y="94" text-anchor="middle">on-first-retry</text>
  <path class="d-arrow" d="M336 75 L360 75" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="362" y="40" width="150" height="70" rx="12"/>
  <text class="d-label-strong" x="437" y="70" text-anchor="middle">Read the trace</text>
  <text class="d-code" x="437" y="94" text-anchor="middle">show-trace</text>
  <path class="d-arrow" d="M512 75 L536 75" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="538" y="40" width="132" height="70" rx="12"/>
  <text class="d-label-strong" x="604" y="70" text-anchor="middle">Fix + prove</text>
  <text class="d-code" x="604" y="94" text-anchor="middle">--repeat-each</text>
</svg>
:::

## The usual suspects

Almost every flaky end-to-end test I've deleted or fixed had one of these causes.

**1. Racing the page.** Fixed sleeps (`page.waitForTimeout(2000)`), values read once and asserted with a non-retrying matcher (`expect(await locator.textContent()).toBe(...)`, `expect(await locator.count()).toBe(3)`), or `if (await locator.isVisible())` branches that check at one arbitrary instant. Fix: web-first assertions (`toHaveText`, `toHaveCount`, `toBeVisible`) and actions that auto-wait.

**2. Shared data.** Tests that use the same group, the same user or the same seed records, and pass only in a particular order or with one worker. Fix: each test creates its own data, with unique names, through fixtures.

**3. Uncontrolled time and randomness.** "This week" logic that fails on Mondays, time zones that differ between your laptop and the CI runner, animations still running, random ids in assertions. Fix: `page.clock` to set the time (`await page.clock.setFixedTime(new Date('2026-03-04T10:00:00'))`), a fixed `timezoneId` in the config's `use` block, and assertions that don't depend on generated values.

**4. Missing `await`.** `page.getByRole('button', { name: 'Add expense' }).click()` without `await` returns immediately; the next line races the click. Fix: the `@typescript-eslint/no-floating-promises` lint rule catches these at write time.

Third-party scripts (analytics, chat widgets, payment iframes) are a fifth, external cause: block them with `page.route` in tests unless the test is about them.

:::mistake Turning up retries until the suite is green
`retries: 2` in CI is reasonable as a safety net: Playwright marks a test that failed and then passed as **flaky**, so you know about it. Raising retries to 5 and ignoring the flaky list turns the safety net into a blindfold. Real intermittent bugs (a race in *your* code, not the test) get retried away too.
:::

## Proving the fix

A flaky test that passed once proves nothing. Reproduce first, then prove the fix under the same pressure:

```bash
npx playwright test e2e/settle-up.spec.ts --repeat-each=30 --workers=4
```

If it fails a few times in 30 before the fix and zero after, you're done. In CI, `--fail-on-flaky-tests` turns the flaky label into a failure, which some teams enable once the suite is clean so new flakiness can't creep back in quietly.

The exercise shows a test from a real-looking suite with several of these problems. Find them all. That closes the end-to-end section; section 5 steps back to ask how you judge a suite as a whole.
