---
summary: Test UI that changes after data loads or fails, using findBy queries and waitFor instead of sleeps, and control the async dependency to test loading, success and error states.
takeaways:
  - "`findBy` queries return a promise that resolves when the element appears, retrying until a timeout (one second by default)."
  - "`waitFor(callback)` reruns a callback until it stops throwing; use it for assertions that aren't about an element appearing, such as a mock's call count."
  - Never wait a fixed time with a sleep; wait for the condition you actually care about.
  - "Control the async dependency yourself (a `vi.fn` that resolves, rejects or stays pending) so loading, success, error and retry are each one deterministic test."
further:
  - title: Testing Library — Async methods
    url: https://testing-library.com/docs/dom-testing-library/api-async
  - title: Testing Library — Appearance and disappearance
    url: https://testing-library.com/docs/guide-disappearance
  - title: Vitest — vi.waitFor
    url: https://vitest.dev/api/vi#vi-waitfor
quiz:
  - q: The balance list appears after `loadBalances()` resolves. Which line waits for it correctly?
    options:
      - text: "`await new Promise((r) => setTimeout(r, 500)); screen.getByRole('list');`"
        why: A fixed sleep is too long on a fast machine and too short on a busy CI runner; it is the classic source of flaky UI tests.
      - text: "`const list = await screen.findByRole('list', { name: 'Balances' });`"
        why: Correct. `findByRole` retries until the list appears (or one second passes), so it waits exactly as long as needed.
      - text: "`const list = screen.getByRole('list', { name: 'Balances' });`"
        why: "`getByRole` checks once, immediately, before the promise has resolved, so it throws."
    answer: 1
  - q: "What's the problem with this?\n```js\nawait waitFor(() => {\n  user.click(screen.getByRole('button', { name: 'Try again' }));\n  expect(loadBalances).toHaveBeenCalledTimes(2);\n});\n```"
    options:
      - text: "`waitFor` can't contain `expect` calls."
        why: Assertions are exactly what belongs in `waitFor`; it reruns the callback until they stop throwing.
      - text: "`toHaveBeenCalledTimes` doesn't work with async functions."
        why: It counts calls on any mock, sync or async; that line is fine on its own.
      - text: The click is a side effect inside the retried callback, so it may run several times and inflate the call count.
        why: Correct. Do the click once, outside, then `await waitFor(() => expect(loadBalances).toHaveBeenCalledTimes(2))`.
    answer: 2
  - q: How do you test that the "Loading balances…" message is shown *before* the data arrives, without racing the promise?
    options:
      - text: Make `loadBalances` return a promise the test resolves by hand, assert the loading message, then resolve it.
        why: Correct. A deferred promise freezes the component in the loading state for as long as you need, so the test is deterministic.
      - text: Add a 50 ms delay to the real `loadBalances` in tests.
        why: "Any timing-based approach races: on a slow runner the assertion may still miss or hit at the wrong moment."
      - text: Use `findByRole('status')` so it waits for the message.
        why: The message is shown immediately, so finding it isn't the hard part; the risk is that the data has already replaced it by the time you look.
    answer: 0
---

The balances panel in Splitwise-lite loads data from the server. For a moment it says "Loading balances…", then it shows the list, or, on a train in a tunnel, "Could not load balances." with a "Try again" button. Each of those states is something a user sees, so each deserves a test. The difficulty is time: the DOM you want to check doesn't exist yet when the test reaches the line that checks it.

## The wrong way: sleeping

The first instinct is to wait a bit:

```js
mountBalancePanel(document.body, loadBalances);
await new Promise((resolve) => setTimeout(resolve, 500)); // please be enough
expect(screen.getByRole('list', { name: 'Balances' })).toBeInTheDocument();
```

On your laptop the data arrives in 5 ms and the test wastes 495. On a busy CI runner it sometimes takes 600, and the test fails for no reason. Multiply by a few hundred tests and you have a slow suite that is red every Tuesday. **Wait for the condition, not for the clock.**

## findBy: wait for an element

`findBy` queries are `getBy` queries that retry. They return a promise that resolves as soon as the element exists, and reject if it doesn't appear within a timeout (1,000 ms by default):

```js title=src/balance-panel.test.js
// @vitest-environment jsdom
import { afterEach, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { mountBalancePanel } from './balance-panel.js';

afterEach(() => {
  document.body.innerHTML = '';
});

test('shows a loading message, then the balances', async () => {
  const loadBalances = vi.fn().mockResolvedValue({ Ana: 500, Ben: -500 });

  mountBalancePanel(document.body, loadBalances);

  expect(screen.getByRole('status')).toHaveTextContent('Loading balances');
  expect(await screen.findByRole('list', { name: 'Balances' })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
```

The test is fast when the code is fast and patient when it is slow, and it reads like the story of what the user sees. The last line matters too: a panel that shows the data but leaves "Loading…" on screen is a real bug.

## waitFor: wait for anything else

`waitFor(callback)` runs the callback, and if it throws, runs it again every 50 ms until it passes or the timeout expires. Use it for conditions that aren't "an element appeared":

```js
await waitFor(() => expect(loadBalances).toHaveBeenCalledTimes(2));
```

Vitest has its own `vi.waitFor` that works the same way outside the DOM. For the reverse case, `waitForElementToBeRemoved(() => screen.queryByRole('status'))` waits for something to disappear.

:::figure findBy and waitFor poll until the condition holds
<svg viewBox="0 0 680 200" role="img" aria-labelledby="t1">
  <title id="t1">A timeline: the query is retried every 50 milliseconds; it fails while loading, then passes once the list renders, well before the 1000 millisecond timeout.</title>
  <path class="d-line" d="M40 100 L640 100"/>
  <text class="d-label-muted" x="40" y="130">0 ms</text>
  <text class="d-label-muted" x="600" y="130">1000 ms</text>
  <path class="d-line d-dashed" d="M620 60 L620 140"/>
  <text class="d-label-muted" x="620" y="50" text-anchor="middle">timeout</text>
  <circle class="d-dot" cx="60" cy="100" r="6"/>
  <circle class="d-dot" cx="110" cy="100" r="6"/>
  <circle class="d-dot" cx="160" cy="100" r="6"/>
  <circle class="d-dot" cx="210" cy="100" r="6"/>
  <text class="d-label" x="135" y="80" text-anchor="middle">not there yet</text>
  <rect class="d-box-success" x="250" y="82" width="150" height="36" rx="8"/>
  <text class="d-label" x="325" y="105" text-anchor="middle">list found</text>
  <text class="d-label-muted" x="325" y="160" text-anchor="middle">test continues immediately</text>
</svg>
:::

:::mistake Side effects inside waitFor
Because `waitFor` reruns its callback, anything inside it may happen several times. A click inside `waitFor` can fire three times and turn one retry into three. Keep the callback to queries and assertions; do clicks and typing before it, once. And don't wrap a `findBy` in `waitFor`: it already waits.
:::

## Controlling time from the test side

`findBy` handles *waiting*. To test each state deterministically, you also control the **dependency**. Since `loadBalances` is passed in, a `vi.fn` can make it do anything:

- `mockResolvedValue(data)` for success;
- `mockRejectedValue(new Error('Offline'))` for failure;
- a promise you resolve by hand, to freeze the loading state:

```js
test('keeps showing the loading message until data arrives', async () => {
  let finish;
  const loadBalances = vi.fn(() => new Promise((resolve) => { finish = resolve; }));

  mountBalancePanel(document.body, loadBalances);
  expect(screen.getByRole('status')).toHaveTextContent('Loading balances');

  finish({ Ana: 0 });
  expect(await screen.findByText('Ana is settled up')).toBeInTheDocument();
});
```

For the retry flow, start with a rejecting mock, wait for the alert, switch the mock to resolve, click "Try again" once, then `findBy` the list. Each step is something a user does or sees, and nothing depends on how fast the machine is.

:::tip Fake timers for timed UI
Real time still matters for UI that waits on purpose, like a toast that hides after five seconds. Combine fake timers with user-event by passing `advanceTimers: vi.advanceTimersByTime` to `userEvent.setup()`, so typing delays and your timeouts all run on the fake clock.
:::

## When the default timeout isn't enough

`findBy` and `waitFor` give up after one second. That is plenty for code whose dependency you control, and if a component test needs longer, the usual reason is a real network call or a real timer that leaked in. Fix the leak first. When the wait really is legitimate, pass options: `screen.findByRole('list', {}, { timeout: 3000 })` (the third argument is the wait options) or `waitFor(callback, { timeout: 3000 })`.

In React tests you'll sometimes see a warning that an update "was not wrapped in act(...)". It usually means a state update happened **after** the test stopped looking: some promise resolved late. The fix is almost never to wrap things in `act` by hand; it's to `await` the final state the user would see, with a `findBy` query.

## In the playground

The exercise starter adds `waitFor(callback)`, `findByRole(root, role, options)` and `findByText(root, text)` to the query stand-ins. They poll every 20 ms and give up after 500 ms, so a test against a broken version fails quickly.

Next lesson brings this to React components, and to the network calls behind `loadBalances`.
