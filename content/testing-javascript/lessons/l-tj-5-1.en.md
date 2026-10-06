---
summary: Use the red-green-refactor cycle to build well-specified logic and to fix bugs, and recognise the situations where writing tests first slows you down.
takeaways:
  - "Red, green, refactor: write one failing test, make it pass with the simplest code, then clean up while the tests stay green."
  - Seeing a test fail first proves it can fail; a test written after the code may pass for the wrong reason.
  - Choose the next test so it forces one small step of new behaviour, starting from the simplest case.
  - TDD shines for logic with clear rules and for bug fixes (reproduce with a failing test first); it fits poorly with exploratory UI work and throwaway spikes.
further:
  - title: Vitest — Watch mode and filtering
    url: https://vitest.dev/guide/filtering
  - title: Vitest — expect API
    url: https://vitest.dev/api/expect
quiz:
  - q: You write a test for a new case and it passes immediately, before you change any code. What should you do?
    options:
      - text: Commit it; a passing test is the goal.
        why: A test you've never seen fail might not test what you think, for example because it calls the wrong function or asserts on the wrong value.
      - text: Temporarily break the code (or the expectation) to confirm the test can fail, then decide whether the case was already covered.
        why: Correct. Either the behaviour already exists (fine, keep the test as documentation) or the test is broken; you need to know which.
      - text: Delete the test, since TDD tests must start red.
        why: The test might be valuable documentation of a case; the point is to verify it can fail, not to throw it away.
    answer: 1
  - q: A user reports that settling up a group with one person owing $0.01 crashes. What's the TDD way to fix it?
    options:
      - text: Fix the code, then add a test for the case so it stays fixed.
        why: Better than no test, but you never saw the test fail, so you can't be sure it reproduces the reported bug.
      - text: Add a `try/catch` around the settle-up call so the crash can't reach the user.
        why: That hides the bug instead of fixing it, and the balances are still wrong.
      - text: Write a test that reproduces the crash and watch it fail, then fix the code until it passes.
        why: Correct. The red test proves you've reproduced the bug; the green one proves the fix; the test then guards against regressions forever.
    answer: 2
  - q: Which task is the weakest fit for strict test-first development?
    options:
      - text: Implementing the rounding rules for splitting a bill.
        why: Clear inputs and outputs with tricky edge cases are where TDD is strongest.
      - text: Fixing a reported bug in the balance calculation.
        why: Reproducing a bug with a failing test first is one of TDD's most valuable uses.
      - text: Trying three layouts for the balances screen to see which one users understand.
        why: Correct. When you don't know what you're building yet, tests written first describe guesses; spike first, then test what you keep.
    answer: 2
---

Test-driven development has a reputation problem. Some people treat it as a religion; others dismiss it after one painful kata. I treat it as a tool, and like any tool it's excellent for some jobs and wrong for others. For the core money logic in Splitwise-lite, it's the best tool I know.

## The cycle

TDD is a short loop, usually a minute or two per turn:

1. **Red**: write one small test for behaviour that doesn't exist yet. Run it. Watch it fail, ideally with the failure you expected.
2. **Green**: write the simplest code that makes it pass. Simple, not clever; hard-coding is allowed if it's honest.
3. **Refactor**: clean up the code (and the tests) while everything stays green.

:::figure Red, green, refactor
<svg viewBox="0 0 640 260" role="img" aria-labelledby="t1">
  <title id="t1">A cycle of three boxes: red, write a failing test; green, make it pass; refactor, clean up with tests green; then back to red.</title>
  <rect class="d-box-warn" x="240" y="16" width="160" height="66" rx="14"/>
  <text class="d-label-strong" x="320" y="44" text-anchor="middle">Red</text>
  <text class="d-label-muted" x="320" y="68" text-anchor="middle">a failing test</text>
  <rect class="d-box-success" x="430" y="160" width="180" height="66" rx="14"/>
  <text class="d-label-strong" x="520" y="188" text-anchor="middle">Green</text>
  <text class="d-label-muted" x="520" y="212" text-anchor="middle">simplest passing code</text>
  <rect class="d-box-primary" x="30" y="160" width="180" height="66" rx="14"/>
  <text class="d-label-strong" x="120" y="188" text-anchor="middle">Refactor</text>
  <text class="d-label-muted" x="120" y="212" text-anchor="middle">clean up, stay green</text>
  <path class="d-arrow" d="M400 60 Q500 80 515 155" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M430 205 L214 205" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M125 158 Q140 80 236 56" marker-end="url(#arrow)"/>
</svg>
:::

Why insist on seeing red? Because a test you've never seen fail might not be able to fail. It might call the wrong function, assert on a variable that's always truthy, or never actually check anything (a missing `await`, a `.skip` left in place). Red first is cheap proof that the test is wired up.

## Building settleUp test-first

Splitwise-lite needs `settleUp(balances)`: given who is owed and who owes (in cents), return a short list of transfers that brings everyone to zero. Here is how the first few turns go, with Vitest in watch mode so every save reruns the tests.

**Turn 1, the simplest case.** Nobody owes anything:

```js title=src/settle-up.test.js
test('needs no transfers when everyone is settled', () => {
  expect(settleUp({ Ana: 0, Ben: 0 })).toEqual([]);
});
```

Red: `settleUp is not defined`. Green: `export function settleUp() { return []; }`. Yes, that's the whole implementation for now. It's honest about what the tests demand.

**Turn 2, one debt.** The next test forces real behaviour:

```js
test('the debtor pays the creditor', () => {
  expect(settleUp({ Ana: 500, Ben: -500 })).toEqual([
    { from: 'Ben', to: 'Ana', amountCents: 500 },
  ]);
});
```

Green might pair the one negative balance with the one positive balance. Still small.

**Turn 3, several people.** Now a hard-coded pairing breaks, and the general algorithm earns its place: sort debtors and creditors by amount, repeatedly move the smaller of the two current amounts, advance whichever side reaches zero. For assertions, use **properties** where several answers are valid: applying the transfers brings every balance to zero, every amount is positive, and there are at most `people - 1` transfers.

**Turn 4, invalid input.** Balances that don't add up to zero mean a bug upstream; `settleUp` should refuse rather than invent money: `expect(() => settleUp({ Ana: 500, Ben: -400 })).toThrow()`.

Then **refactor**: name the sort comparator, extract a helper, make it read well. The tests let you change the shape of the code without fear, which is the real payoff.

:::tip Choosing the next test
Pick the test that forces the **smallest** step of new behaviour. If a test would make you write the whole algorithm at once, find a simpler one first. If you can't think of a failing test, you might be done.
:::

## Fixing bugs test-first

The most valuable everyday use of TDD has nothing to do with new features. When a bug is reported:

1. Write a test that reproduces it, and **watch it fail**. Now you know you understand the bug.
2. Fix the code until the test passes.
3. Keep the test. That bug can never come back silently.

This works even in codebases that were never written test-first, and it turns every bug report into a permanent improvement of the suite.

## When not to

TDD assumes you know what "correct" means. When you don't, writing tests first just writes down guesses:

- **Exploratory UI work**: trying layouts, interactions and copy. Build it, look at it, show it to someone; test what survives.
- **Spikes**: a throwaway experiment to learn whether an approach works. Delete it, then build the real thing (test-first if you like).
- **Glue code with no logic**: wiring a library's callback to your state. Cover it with an integration or end-to-end test instead.

:::mistake Writing many tests before any code
TDD is one test at a time. Writing twenty failing tests up front is planning, not TDD: you lose the tight feedback of each red-green turn, and the first implementation has to satisfy everything at once, which is exactly the big leap TDD exists to avoid.
:::

In the exercise you play the green half of the cycle: the tests for `settleUp` are written (they're the checks), and you write the code that makes them pass. In the next two lessons, you'll measure how good those tests are.
