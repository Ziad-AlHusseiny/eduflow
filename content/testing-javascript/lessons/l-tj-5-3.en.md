---
summary: Explain how mutation testing grades a test suite, run StrykerJS with Vitest on core logic, and turn survived mutants into the specific tests that were missing.
takeaways:
  - A mutation testing tool makes small deliberate bugs (mutants) in your code and reruns the tests; a mutant that makes a test fail is killed, one that doesn't has survived.
  - The mutation score (killed mutants as a share of all mutants) measures how many plausible bugs your tests would catch, which coverage can't.
  - Each survived mutant points at a missing or weak assertion; read it, then write the test that kills it.
  - Some mutants are equivalent (they don't change behaviour) and can't be killed; ignore them rather than contorting tests.
  - Mutation testing is slow, so run it on core logic, incrementally or on a schedule, not on every file in every commit.
further:
  - title: Vitest — Coverage guide
    url: https://vitest.dev/guide/coverage
  - title: StrykerJS on GitHub
    url: https://github.com/stryker-mutator/stryker-js
quiz:
  - q: "Stryker reports: `ConditionalExpression: if (sum !== 0) → if (false)` — Survived. What does that tell you?"
    options:
      - text: The check is unnecessary and can be deleted.
        why: It tells you no test notices when the check is removed, not that the check is useless; unbalanced input would silently produce wrong transfers.
      - text: No test passes unbalanced balances and expects `settleUp` to throw.
        why: "Correct. Add a test like `expect(() => settleUp({ Ana: 500, Ben: -400 })).toThrow()` and the mutant is killed."
      - text: Stryker failed to run the tests for that line.
        why: When tests can't run, the status is a runtime or compile error, or "no coverage"; "Survived" means the tests ran and all passed.
    answer: 1
  - q: Your suite has 100% line coverage and a mutation score of 55%. Which is the better summary?
    options:
      - text: Every line runs, but nearly half of the plausible bugs Stryker introduced would go unnoticed.
        why: Correct. Coverage shows execution; the mutation score shows how much of that execution is actually checked.
      - text: The suite is excellent; mutation scores above 50% are rare.
        why: There's no universal bar, but 45% surviving mutants on core logic usually means weak assertions worth fixing.
      - text: The two numbers contradict each other, so one of the tools is misconfigured.
        why: They measure different things; high coverage with a low mutation score is the classic pattern of assertion-light tests.
    answer: 0
  - q: "A mutant changes `b.cents - a.cents` to `a.cents - b.cents` in the sort comparator, and every valid input still produces a correct settlement. What should you do?"
    options:
      - text: Write a test that asserts the exact order of transfers for a large group, so the mutant dies.
        why: If several orders are valid, pinning one couples the test to the implementation, the exact mistake from section 2.
      - text: Lower the mutation score threshold to zero.
        why: One equivalent mutant isn't a reason to throw away the signal from all the others.
      - text: Treat it as a likely equivalent mutant and ignore it (or disable that mutation on the line with a comment).
        why: Correct. If no caller could observe the difference, there is nothing to test; Stryker lets you mark such lines so the report stays meaningful.
    answer: 2
---

The last exercise left you with an uncomfortable fact: coverage said 100%, and the suite caught nothing. You need a measurement that asks the real question, *would these tests notice if the code were wrong?* Mutation testing answers it by trying. You've already been doing it by hand: every exercise in this course ran your tests against "mutants". A tool does the same thing systematically, for every line.

## How it works

1. The tool makes a **mutant**: a copy of your code with one small change, the kind of slip a person makes. `<` becomes `<=`, `+` becomes `-`, `Math.min` becomes `Math.max`, a condition becomes `true`, a block is emptied.
2. It runs the tests that cover that line against the mutant.
3. If any test fails, the mutant is **killed**: your tests would catch that bug. If every test passes, it **survived**: that bug would ship.

It repeats this for hundreds or thousands of mutants. The **mutation score** is the percentage killed.

:::figure Each mutant is one small deliberate bug; tests either kill it or let it survive
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Source code produces three mutants. The test suite runs against each: two fail and the mutants are killed, one passes and the mutant survives, pointing at a missing test.</title>
  <rect class="d-box" x="10" y="85" width="120" height="60" rx="12"/>
  <text class="d-code" x="70" y="120" text-anchor="middle">settleUp</text>
  <path class="d-arrow" d="M130 105 L198 45" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M130 115 L198 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M130 125 L198 185" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="200" y="25" width="190" height="40" rx="8"/>
  <text class="d-code" x="295" y="50" text-anchor="middle">min → max</text>
  <rect class="d-box-accent" x="200" y="95" width="190" height="40" rx="8"/>
  <text class="d-code" x="295" y="120" text-anchor="middle">-cents → +cents</text>
  <rect class="d-box-accent" x="200" y="165" width="190" height="40" rx="8"/>
  <text class="d-code" x="295" y="190" text-anchor="middle">sum !== 0 → false</text>
  <path class="d-arrow" d="M390 45 L478 45" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 115 L478 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 185 L478 185" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="480" y="25" width="190" height="40" rx="8"/>
  <text class="d-label" x="575" y="50" text-anchor="middle">a test fails: killed</text>
  <rect class="d-box-success" x="480" y="95" width="190" height="40" rx="8"/>
  <text class="d-label" x="575" y="120" text-anchor="middle">a test fails: killed</text>
  <rect class="d-box-warn" x="480" y="165" width="190" height="40" rx="8"/>
  <text class="d-label" x="575" y="190" text-anchor="middle">all pass: survived</text>
</svg>
:::

Coverage asks "did this line run?" Mutation testing asks "if this line were wrong, would anyone notice?" The second question is the one you care about.

## Running StrykerJS with Vitest

StrykerJS is the established mutation testing tool for JavaScript and TypeScript, with a runner plugin for Vitest:

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
npx stryker init   # interactive; or write the config yourself
```

```json title=stryker.config.json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "testRunner": "vitest",
  "plugins": ["@stryker-mutator/vitest-runner"],
  "mutate": ["src/money/**/*.js", "!src/**/*.test.js"],
  "reporters": ["html", "clear-text", "progress"],
  "thresholds": { "high": 80, "low": 60, "break": 50 },
  "incremental": true
}
```

`npx stryker run` first runs your suite once to see which tests cover which lines, then tests every mutant. The HTML report shows your source with each mutant marked killed or survived. `thresholds.break` fails the run below that score, and `incremental` reuses results for code and tests that didn't change since the last run, which matters a lot for speed.

## Reading the survivors

The statuses you'll see most:

- **Killed**: a test failed. Good.
- **Survived**: every covering test passed. A missing or weak assertion.
- **No coverage**: no test even ran that line. Coverage would have told you this too.
- **Timeout**: the mutant caused an infinite loop and the tests timed out. Counted as detected.

Survivors are the gold. For `settleUp`, a report might say:

```text
[Survived] MethodExpression   src/money/settle-up.js:21
-   const amountCents = Math.min(debtors[d].cents, creditors[c].cents);
+   const amountCents = Math.max(debtors[d].cents, creditors[c].cents);

[Survived] ConditionalExpression   src/money/settle-up.js:4
-   if (sum !== 0) throw new Error('Balances must add up to zero');
+   if (false) throw new Error('Balances must add up to zero');
```

Each one is a precise instruction. The first says no test uses amounts where the debtor owes a different sum than the creditor is owed, so `min` and `max` give the same answer in every test. The second says no test ever passes unbalanced input. Write those two tests and both mutants die.

:::mistake Chasing 100% mutation score
Some mutants are **equivalent**: the change doesn't alter behaviour any caller could observe. Flipping the sort direction in `settleUp` often still produces a valid settlement; a mutant that changes `cents < 0` to `cents <= 0` may only affect people with zero balance, who are never reached. Writing tests to kill those means asserting on implementation details. Accept them, or disable the specific mutation on that line with a comment such as `// Stryker disable next-line all: equivalent, order doesn't matter`.
:::

## Hand-picked versus generated mutants

The mutants in this course's exercises were hand-picked: each one imitates a bug a person really writes, like a swapped argument or a forgotten `await`. Stryker's are generated systematically from a fixed set of mutators, typically dozens per function, so it finds gaps you would never think to look for, and also produces some noise. Both are useful. When you review a teammate's tests, the hand-picked habit is the quick version: ask "what is the most likely bug here, and which test would fail?" When you want a measurement across a whole module, let the tool generate the list.

## Where it fits

Mutation testing is slow: hundreds of mutants, each running part of your suite. A few habits keep it practical:

- **Scope it** with `mutate` to the code where bugs are expensive: money, permissions, parsing. Not UI glue.
- **Run it incrementally** locally, and on a schedule (nightly) or on changed files in CI, rather than on every push of the whole repo.
- **Use the report in review**: a pull request that adds logic and survivors deserves a question.

In the exercise you get a weak `settleUp` suite and a list of survivors, and you write the tests that kill them.
