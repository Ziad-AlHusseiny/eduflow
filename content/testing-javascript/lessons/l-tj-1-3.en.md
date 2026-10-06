---
summary: Structure every test as Arrange, Act, Assert, choose between toBe and toEqual, and read a Vitest failure to find the broken line in seconds.
takeaways:
  - Arrange, Act, Assert gives every test the same three-part shape, so readers find the setup, the action and the claim without hunting.
  - One test checks one behaviour, and its name is a sentence that says which behaviour broke when it fails.
  - "`toBe` compares with `Object.is` (same value or same reference); `toEqual` compares structure, which is what you want for objects and arrays."
  - A failure report gives you the test path, the expected and received values, and the file and line; read all three before touching code.
further:
  - title: Vitest — expect API
    url: https://vitest.dev/api/expect
  - title: Vitest — Test API
    url: https://vitest.dev/api/test
  - title: MDN — Number.EPSILON and floating point
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
quiz:
  - q: |
      What does this test report?
      ```js
      test('builds the tip summary', () => {
        expect(withTip(2000, 15)).toBe({ tipCents: 300, totalCents: 2300 });
      });
      ```
    options:
      - text: It passes, because the object has the right values.
        why: The values are right, but `toBe` checks identity with `Object.is`, and two separately created objects are never the same reference.
      - text: It fails, because `toBe` compares references and the function returns a new object.
        why: Correct. Use `toEqual` (or `toStrictEqual`) to compare objects by their contents.
      - text: It throws a syntax error because objects can't be passed to `toBe`.
        why: Any value can be passed to `toBe`; the problem is the comparison it performs, not the syntax.
    answer: 1
  - q: A failing test prints `expected 28 to be 29` for `toCents(0.29)`. Where do you look first?
    options:
      - text: At the test, to change the expected value to 28 so it matches what the code returns.
        why: That makes the test agree with the bug; cents are integers and 28 is a whole cent wrong.
      - text: At the test runner config, because floating point is handled differently in Vitest.
        why: Vitest runs plain JavaScript; `0.29 * 100` is `28.999999999999996` everywhere, so the config is not involved.
      - text: At how `toCents` turns the float into an integer, because `0.29 * 100` is slightly below 29.
        why: Correct. The received value tells you the code truncated a value that was a hair under 29; `Math.round` fixes it, `Math.floor` causes it.
    answer: 2
  - q: Which test name is most useful when it fails in CI at 2 a.m.?
    options:
      - text: "`test('withTip works')`"
        why: It says which function, not which behaviour; you still have to open the file to learn what broke.
      - text: "`test('test 3')`"
        why: A number carries no information and becomes wrong as soon as tests are reordered.
      - text: "`test('rounds a half-cent tip up to the next cent')`"
        why: Correct. The name states the rule, so the failure report alone tells you which behaviour regressed.
      - text: "`test('withTip(1980, 12.5)')`"
        why: The input is visible but not the expected behaviour; the reader can't tell what the right output was meant to be.
    answer: 2
  - q: Why do Arrange, Act and Assert usually appear in that order, separated by a blank line?
    options:
      - text: Vitest requires the three phases in that order or it skips the test.
        why: Vitest has no idea about phases; AAA is a convention for humans, not a rule the runner enforces.
      - text: It makes setup, the single action under test and the claims easy to find at a glance.
        why: Correct. A consistent shape means a reader can jump straight to the action and the assertion in any test.
      - text: It lets Vitest run the Arrange phase once for the whole file.
        why: Shared setup belongs in hooks like `beforeEach`; the blank lines in a test change nothing at runtime.
    answer: 1
---

A test is read far more often than it is written. It is read when it fails at a bad moment, by someone who didn't write it, who wants one answer: *what broke?* This lesson is about writing tests that answer that in seconds, and about reading the answer Vitest gives you.

## Arrange, Act, Assert

Nearly every good test has the same three parts:

```js title=src/tip.test.js
import { test, expect } from 'vitest';
import { withTip } from './tip.js';

test('rounds a half-cent tip up to the next cent', () => {
  // Arrange: the inputs that matter for this behaviour
  const subtotalCents = 1980;
  const percent = 12.5;

  // Act: one call to the code under test
  const result = withTip(subtotalCents, percent);

  // Assert: the claims about the outcome
  expect(result).toEqual({ tipCents: 248, totalCents: 2228 });
});
```

**Arrange** builds the world the test needs. **Act** does exactly one thing: the behaviour you are testing. **Assert** states what should now be true. You don't need the comments once the shape is a habit; the blank lines are enough.

The shape protects you from the most common smell: a test that acts, asserts, acts again, asserts again. When that fails, you can't tell which step broke. Split it into two tests, each with a name that says what it proves.

:::figure Arrange, Act, Assert: one setup, one action, the claims
<svg viewBox="0 0 640 170" role="img" aria-labelledby="t1">
  <title id="t1">Three boxes in a row: Arrange builds inputs, Act calls withTip once, Assert compares the result with toEqual.</title>
  <rect class="d-box-accent" x="20" y="40" width="170" height="90" rx="12"/>
  <text class="d-label-strong" x="105" y="76" text-anchor="middle">Arrange</text>
  <text class="d-code" x="105" y="104" text-anchor="middle">1980, 12.5</text>
  <path class="d-arrow" d="M190 85 L232 85" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="235" y="40" width="170" height="90" rx="12"/>
  <text class="d-label-strong" x="320" y="76" text-anchor="middle">Act</text>
  <text class="d-code" x="320" y="104" text-anchor="middle">withTip(...)</text>
  <path class="d-arrow" d="M405 85 L447 85" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="450" y="40" width="170" height="90" rx="12"/>
  <text class="d-label-strong" x="535" y="76" text-anchor="middle">Assert</text>
  <text class="d-code" x="535" y="104" text-anchor="middle">toEqual({...})</text>
</svg>
:::

### How many assertions per test?

"One assertion per test" is a rule you will hear, and it is too strict. The real rule is **one behaviour per test**. Checking both `tipCents` and `totalCents` after a single call is one behaviour with two observable facts, so asserting both is fine, and `toEqual` on the whole object does it in one line. What you want to avoid is a test that checks rounding, then calls the function again to check the error case, then a third time for zero. When the first claim fails, Vitest stops that test, so you never learn whether the other two behaviours still work. Three small tests report three separate answers.

## Names are the first line of the bug report

When a test fails, the report prints its full path: `withTip > rounds a half-cent tip up to the next cent`. Write that name as a sentence about behaviour. "withTip works" tells you nothing; "rejects a negative tip percent" tells you what regressed before you open a file. Group with `describe` by unit, name with `test` by rule.

## toBe or toEqual?

Two matchers do most of the work, and they compare differently:

- `toBe` uses `Object.is`: same primitive value, or the **same object reference**. Use it for numbers, strings and booleans.
- `toEqual` compares **structure**, recursively: same keys, same values. Use it for objects and arrays. (`toStrictEqual` also checks that `undefined` properties and class types match.)

`expect(withTip(2000, 15)).toBe({ tipCents: 300, totalCents: 2300 })` fails even though the values match, because the function returns a new object. This trips up everyone once.

## Reading a failure

Here is a real kind of bug. A first version of `toCents`, which turns a dollar amount into cents, used `Math.floor`:

```js run
const toCents = (dollars) => Math.floor(dollars * 100);
console.log(0.29 * 100);    // what the computer actually computes
console.log(toCents(0.29)); // one cent short
console.log(Math.round(0.29 * 100));
```

The test `expect(toCents(0.29)).toBe(29)` fails, and Vitest reports something like this:

```text
 FAIL  src/money.test.js > toCents > converts 0.29 dollars to 29 cents
AssertionError: expected 28 to be 29 // Object.is equality

- Expected
+ Received

- 29
+ 28

 ❯ src/money.test.js:7:28
```

Read it top to bottom, in three passes:

1. **The path** says which behaviour broke: converting 0.29 dollars.
2. **Expected versus received** says how: one cent short, so something truncated instead of rounding.
3. **The location** (`money.test.js:7:28`) points at the assertion line in the test. The bug is in the code that line calls.

For objects, the diff marks only the lines that differ, so a wrong `totalCents` inside a ten-key object stands out immediately.

:::mistake Weakening the assertion to make it pass
Faced with `expected 28 to be 29`, it is tempting to change the expectation to 28 ("that's what the code returns") or to round the value inside the test, and move on. The test was right; the code was wrong. Change an assertion only when you can explain why the old expectation was a mistake. This is also why Splitwise-lite stores **integer cents**: integers add up exactly, so `toBe` is always the right matcher for money.
:::

## Testing that something throws

Sometimes the behaviour is "refuse bad input". Wrap the call in a function so `expect` can call it and catch the error:

```js
test('rejects a negative tip percent', () => {
  expect(() => withTip(1000, -5)).toThrow(RangeError);
});
```

Without the arrow function, `withTip` throws while the arguments are being evaluated, before `expect` runs, and the test crashes instead of passing. `toThrow` also accepts a string or regex to match the message.

In the exercise you write AAA tests for `withTip`, including the boundary that is easy to forget: a tip of zero. The next section moves from "how a test looks" to "which tests are worth writing".
