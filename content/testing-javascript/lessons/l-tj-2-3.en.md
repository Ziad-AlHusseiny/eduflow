---
summary: Test code that throws, returns promises or depends on a flaky API, using awaited resolves and rejects assertions and small hand-written stubs.
takeaways:
  - "Always `await` the promise or the assertion on it; a test that ends before the promise settles can pass no matter what the code does."
  - "`await expect(promise).rejects.toThrow('message')` is the clearest way to test an async failure."
  - A stub is a tiny fake collaborator you control, such as an api object whose post method succeeds, fails or counts its calls.
  - Test every branch of error handling, including the one that should give up, and count calls when the difference is how many attempts were made.
further:
  - title: Vitest — resolves and rejects
    url: https://vitest.dev/api/expect#rejects
  - title: MDN — Using promises
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
  - title: Vitest — testTimeout
    url: https://vitest.dev/config/testtimeout
quiz:
  - q: |
      This test passes, yet the validation in `saveExpense` was deleted and the call now resolves. Why didn't the test catch it?
      ```js
      test('rejects a blank description', async () => {
        try {
          await saveExpense({ description: ' ', amountCents: 100 }, api);
        } catch (error) {
          expect(error.message).toBe('Description is required');
        }
      });
      ```
    options:
      - text: "`toBe` can't compare error messages; it needs `toEqual`."
        why: Messages are strings, so `toBe` compares them correctly; the matcher is never reached here.
      - text: When the promise resolves, the `catch` block never runs, so no assertion executes and the test passes.
        why: Correct. Use `await expect(...).rejects.toThrow(...)`, which fails when the promise resolves, or add `expect.assertions(1)`.
      - text: Vitest ignores errors thrown inside `catch` blocks.
        why: An assertion failing inside `catch` would fail the test; the problem is that the `catch` never runs at all.
    answer: 1
  - q: "`saveExpense` should retry once on a retryable error, but give up immediately on any other error. Which test catches a version that retries every error?"
    options:
      - text: Stub `post` to always reject with a non-retryable error and assert the promise rejects.
        why: The buggy version also ends up rejecting (its retry fails too), so this assertion alone can't tell the versions apart.
      - text: Stub `post` to resolve and assert the id is returned.
        why: On the happy path no error happens, so the retry logic never runs.
      - text: Stub `post` to reject once with a non-retryable error, count the calls, and assert there was exactly one.
        why: Correct. Both versions reject, but only the buggy one calls the API twice; the call count is the observable difference.
    answer: 2
  - q: "A test that uses the stub `{ post: () => new Promise(() => {}) }` fails after five seconds with a timeout. What happened?"
    options:
      - text: The stub returns a promise that never settles, so `await saveExpense(...)` waits until Vitest's test timeout.
        why: Correct. A promise with no resolve or reject call stays pending forever; make the stub resolve or reject explicitly.
      - text: Vitest needs `vi.fn()` instead of a plain object for any async collaborator.
        why: Plain objects with async methods are perfectly valid stubs; the issue is this one never finishes.
      - text: The default test timeout is too short for network code and should be raised to 30 seconds.
        why: There is no network here. Raising the timeout only makes the same failure take longer.
    answer: 0
---

Splitwise-lite saves expenses over a phone connection on a train. Requests fail. Some failures are worth one retry (a timeout); others are not (the server says the amount is invalid). The code that decides is a dozen lines, and it is exactly the code nobody tests, because "it's async" and "it needs the API". Neither is a real obstacle.

## The function under test

```js title=src/save-expense.js
export async function saveExpense(expense, api) {
  if (!expense.description?.trim()) throw new Error('Description is required');
  if (!Number.isInteger(expense.amountCents) || expense.amountCents <= 0) {
    throw new Error('Amount must be positive');
  }
  try {
    const { id } = await api.post('/expenses', expense);
    return id;
  } catch (error) {
    if (!error.retryable) throw error;
    const { id } = await api.post('/expenses', expense); // one retry
    return id;
  }
}
```

Because it's an `async` function, every `throw` inside it becomes a **rejected promise**. Callers (and tests) never see a synchronous exception; they see a promise that rejects.

## Asserting on promises

Vitest waits for a test that is `async` or returns a promise. Inside, you have two good options:

```js
test('resolves with the new id', async () => {
  const api = { post: async () => ({ id: 'e1' }) };

  await expect(saveExpense({ description: 'Dinner', amountCents: 4500 }, api))
    .resolves.toBe('e1');
});

test('rejects a blank description', async () => {
  const api = { post: async () => ({ id: 'e1' }) };

  await expect(saveExpense({ description: '  ', amountCents: 4500 }, api))
    .rejects.toThrow('Description is required');
});
```

You can also `await` the call and assert on the value: `const id = await saveExpense(...); expect(id).toBe('e1');`. For rejections, prefer `rejects` over `try/catch`: if the promise unexpectedly resolves, `rejects` fails the test, while a `try/catch` silently skips the `catch` block and passes. (If you must use `try/catch`, put `expect.assertions(1)` at the top so Vitest fails when no assertion ran.)

:::mistake Ending the test before the promise settles
`saveExpense(expense, api).then((id) => expect(id).toBe('e1'))` with no `await` or `return` lets the test function finish first. The test is reported green before the assertion runs; at best a confusing unhandled error shows up later in the run, detached from the test that caused it. Vitest 4 protects you in one case: a `resolves` or `rejects` assertion you forget to `await` fails the test. It can't protect `.then` callbacks or a `try/catch` whose `catch` never runs. The habit that covers all of them: **every promise in a test is awaited.**
:::

:::figure Without await, the test ends before the assertion runs
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">Two timelines. Top: the test returns, then the promise rejects later and nobody is listening. Bottom: the test awaits, so the rejection fails the test.</title>
  <text class="d-label-strong" x="20" y="40">No await</text>
  <path class="d-line" d="M140 60 L660 60"/>
  <circle class="d-dot" cx="170" cy="60" r="7"/>
  <text class="d-label" x="170" y="90" text-anchor="middle">test starts</text>
  <rect class="d-box-success" x="270" y="44" width="140" height="32" rx="8"/>
  <text class="d-label" x="340" y="65" text-anchor="middle">test passes</text>
  <rect class="d-box-warn" x="490" y="44" width="160" height="32" rx="8"/>
  <text class="d-label" x="570" y="65" text-anchor="middle">promise rejects</text>
  <text class="d-label-strong" x="20" y="150">await</text>
  <path class="d-line" d="M140 170 L660 170"/>
  <circle class="d-dot" cx="170" cy="170" r="7"/>
  <text class="d-label" x="170" y="200" text-anchor="middle">test starts</text>
  <path class="d-arrow d-dashed" d="M190 170 L480 170" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="335" y="160" text-anchor="middle">waits</text>
  <rect class="d-box-warn" x="490" y="154" width="160" height="32" rx="8"/>
  <text class="d-label" x="570" y="175" text-anchor="middle">test fails</text>
</svg>
:::

## Stubs: collaborators you control

`saveExpense` talks to an `api`. In a test you don't want a real server; you want an object whose `post` does whatever this test needs. That object is a **stub**, and you don't need a library to write one:

```js
// Fails once with a retryable error, then succeeds; counts its calls.
function flakyApi() {
  let calls = 0;
  return {
    get calls() { return calls; },
    async post() {
      calls += 1;
      if (calls === 1) throw Object.assign(new Error('Timed out'), { retryable: true });
      return { id: 'e2' };
    },
  };
}

test('retries once after a retryable error', async () => {
  const api = flakyApi();

  await expect(saveExpense({ description: 'Taxi', amountCents: 1800 }, api)).resolves.toBe('e2');
  expect(api.calls).toBe(2);
});
```

Passing `api` in as a parameter is what makes this easy. Code that imports a global client deep inside is much harder to test; you meet the tools for that (and their cost) in the next lesson.

## Test every branch of the error handling

Error handling has more branches than the happy path, and each one is a decision someone made. For `saveExpense`:

| Situation | Expected |
|---|---|
| API succeeds | resolves with the id, one call |
| Retryable error, then success | resolves with the id, two calls |
| Non-retryable error | rejects with **that** error, one call |
| Invalid input | rejects with a validation message, zero calls |

The third row is the one people skip, and it hides two common bugs: a `catch` that swallows the error and returns `null` (callers think the save worked), and a `catch` that retries everything (a rejected payment charged twice). The rejection alone can't distinguish the second bug, because the retry fails too. **Counting the calls** can.

Notice the last row too: invalid input should make **zero** calls. That is a promise about side effects, and it matters. A version that validates *after* posting would still reject with the right message, so only the call count proves the bad expense never reached the server.

:::tip Unhandled rejections fail the run
If code under test starts a promise that rejects and nobody handles it, Vitest reports it as an unhandled error and marks the run as failed, even when every test passed. Treat that message as a real bug report: somewhere a promise is missing an `await` or a `catch`.
:::

## Timeouts

If a promise never settles (a stub that forgets to resolve, a missing `await` in a loop), the test hangs until Vitest's timeout, five seconds by default, and fails with a timeout error. Pass a third argument to `test` for a slower case, or set `testTimeout` in the config, but treat a slow unit test as a smell: something real is probably leaking in.

In the exercise you test all four rows of that table and catch four realistic bugs, including the double-charge one. The next lesson replaces the hand-written stubs with `vi.fn`.
