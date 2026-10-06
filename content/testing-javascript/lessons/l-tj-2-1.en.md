---
summary: Write tests that pin down a function's contract (inputs, outputs and invariants) so they survive refactoring and fail only when behaviour really changes.
takeaways:
  - Behaviour is what callers can observe (return values, thrown errors, visible side effects); implementation is how the code gets there.
  - A test that breaks when you refactor without changing behaviour is a false alarm, and false alarms teach a team to ignore red builds.
  - Invariants such as "the shares add up to the total" catch whole families of bugs with one assertion.
  - Don't export private helpers only to test them; test them through the public function that uses them.
further:
  - title: Testing Library — Guiding principles
    url: https://testing-library.com/docs/guiding-principles
  - title: Vitest — expect API
    url: https://vitest.dev/api/expect
quiz:
  - q: You rewrite `splitEvenly` from `Array.from` to a plain `for` loop. Its outputs are identical for every input. Two tests go red. What does that tell you about those tests?
    options:
      - text: They were testing implementation details, not behaviour.
        why: Correct. If behaviour didn't change but tests failed, the tests were coupled to how the code works, which makes every refactor expensive.
      - text: The refactor introduced a bug the other tests missed.
        why: The premise is that outputs are identical for every input; a test that fails anyway is reporting on structure, not a bug.
      - text: The tests are correct and the loop should be reverted.
        why: Reverting a harmless refactor to please a test is the tail wagging the dog; fix the tests to check outputs instead.
    answer: 0
  - q: Which single assertion would catch the most different bugs in `splitEvenly(totalCents, people)`?
    options:
      - text: "`expect(shares).toHaveLength(people)`"
        why: It is useful, but a version that loses the leftover cents still returns the right number of shares.
      - text: "`expect(Math.max(...shares) - Math.min(...shares)).toBeLessThanOrEqual(1)`"
        why: It catches unfair splits, but a version that drops the remainder gives everyone the same share and passes it.
      - text: "`expect(shares.reduce((a, b) => a + b, 0)).toBe(totalCents)`"
        why: Correct. Losing a cent, inventing a cent and mishandling the remainder all break the sum. It is the invariant money code must never violate.
    answer: 2
  - q: A teammate exports `_remainderFor(total, people)` from `split.js` so it can be unit tested directly. What's the better approach?
    options:
      - text: Keep the export but prefix it with an underscore so people know it's private.
        why: An underscore doesn't stop imports; the helper is now public API that tests (and other code) will couple to.
      - text: Test the remainder behaviour through `splitEvenly`, using inputs that leave a remainder.
        why: Correct. The helper only matters because of what `splitEvenly` returns, so testing through the public function covers it and leaves you free to delete or rename the helper.
      - text: Copy the helper into the test file and test the copy.
        why: Then the test checks a copy that can drift from the real code; it would stay green while the real helper breaks.
    answer: 1
---

A test suite has two jobs: **fail when behaviour breaks**, and **stay green when it doesn't**. Most teams focus on the first and forget the second. Then someone renames a private function, forty tests go red, nobody's behaviour changed, and the lesson the team learns is "tests slow us down".

## Behaviour versus implementation

Here is Splitwise-lite's `splitEvenly`, which divides a bill in cents between people. Leftover cents go to the first people in the list, so the result is fair (shares differ by at most one cent) and deterministic:

```js run
function splitEvenly(totalCents, people) {
  if (!Number.isInteger(people) || people < 1) {
    throw new RangeError('people must be a positive integer');
  }
  const base = Math.floor(totalCents / people);
  const remainder = totalCents % people;
  return Array.from({ length: people }, (_, i) => (i < remainder ? base + 1 : base));
}

console.log(splitEvenly(1000, 3)); // $10.00 three ways
console.log(splitEvenly(1001, 4));
console.log(splitEvenly(2, 3));
```

Its **behaviour** is everything a caller can observe: the array it returns, the error it throws for zero people. Its **implementation** is how: `Math.floor`, the `%` operator, `Array.from`, the variable names. You could rewrite the body with a loop, or by handing out cents one at a time, and no caller would notice.

A test that checks behaviour survives all of those rewrites. A test that checks implementation breaks on every one of them, even though nothing a user cares about changed. That is a *false alarm*, and false alarms are expensive: each one costs a debugging session, and enough of them teach people to rerun or delete red tests without reading them.

:::figure Tests talk to the public contract, not the internals
<svg viewBox="0 0 640 220" role="img" aria-labelledby="t1">
  <title id="t1">Tests send inputs to splitEvenly and check outputs; the internal helpers inside the dashed box are not touched by tests.</title>
  <rect class="d-box-accent" x="20" y="70" width="150" height="80" rx="12"/>
  <text class="d-label-strong" x="95" y="105" text-anchor="middle">Tests</text>
  <text class="d-label-muted" x="95" y="128" text-anchor="middle">inputs, outputs</text>
  <path class="d-arrow" d="M170 95 L258 95" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M258 128 L172 128" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="260" y="30" width="360" height="160" rx="14"/>
  <text class="d-label-strong" x="300" y="62">splitEvenly(total, people)</text>
  <rect class="d-box d-dashed" x="290" y="80" width="300" height="90" rx="10"/>
  <text class="d-label-muted" x="440" y="112" text-anchor="middle">internals: floor, %, Array.from</text>
  <text class="d-label-muted" x="440" y="140" text-anchor="middle">free to change</text>
</svg>
:::

## What implementation-coupled tests look like

These are real patterns I have deleted from codebases:

```js
// Spying on Math.floor: breaks if you switch to integer division another way
const floor = vi.spyOn(Math, 'floor');
splitEvenly(1000, 3);
expect(floor).toHaveBeenCalledWith(1000 / 3);

// Testing an exported private helper: breaks when you inline or rename it
expect(_remainderFor(1000, 3)).toBe(1);

// Snapshotting the source-shaped output of a debug helper nobody calls
expect(describeSplit(1000, 3)).toMatchSnapshot();
```

Each one passes today and tells you nothing a behaviour test wouldn't. Each one will fail the day someone improves the code.

## Testing the contract instead

Start from what a caller relies on. For `splitEvenly` that is:

1. One share per person.
2. **The shares add up to the total.** Not a cent lost, not a cent invented.
3. Shares differ by at most one cent.
4. The extra cents go to the first people (documented, so callers may depend on it).
5. Zero people is an error.

Points 2 and 3 are *invariants*: they hold for every valid input, so you can check them over several inputs at once:

```js title=src/split.test.js
import { describe, test, expect } from 'vitest';
import { splitEvenly } from './split.js';

const sum = (xs) => xs.reduce((a, b) => a + b, 0);

describe('splitEvenly', () => {
  test('never loses or invents a cent', () => {
    for (const [total, people] of [[1000, 3], [1001, 4], [2, 3], [0, 5]]) {
      expect(sum(splitEvenly(total, people))).toBe(total);
    }
  });

  test('gives the leftover cents to the first people', () => {
    expect(splitEvenly(1001, 4)).toEqual([251, 250, 250, 250]);
  });

  test('refuses to split between zero people', () => {
    expect(() => splitEvenly(1000, 0)).toThrow(RangeError);
  });
});
```

The sum invariant is the most valuable line in the file. A version that drops the remainder fails it. So does an off-by-one that hands out one cent too many. It doesn't care how the shares are computed, only that money is conserved.

:::mistake Exporting internals to test them
If a helper feels important enough to test on its own, ask what public behaviour depends on it, and test that with an input that exercises the helper. If the helper really is a separate concept used in several places, promote it to a real module with its own contract. "Exported only for tests" is the worst of both: public, but with no promises.
:::

## How specific should assertions be?

Behaviour tests can still be exact. `toEqual([251, 250, 250, 250])` pins the documented order of extra cents, and that is behaviour because callers rely on it. The question is never "exact or loose?" but "would a user or caller notice if this changed?" If yes, assert it precisely. If no, don't assert it at all.

## When a refactor does break a test

Sometimes a change to the code *should* change a test, and it helps to know which situation you are in. If the public contract changed (the function now returns objects instead of numbers, or the extra cents now go to the payer), the test was right to fail, and you update it on purpose, ideally before changing the code. If the contract is the same and a test fails anyway, the test was coupled to the implementation: rewrite it against the contract and delete the old one. A healthy suite makes that question easy to answer, because every test name states a promise the code makes.

In the exercise, write behaviour tests for `splitEvenly` that catch four realistic bugs. The next lesson is about finding the inputs that expose bugs like these.
