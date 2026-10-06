---
summary: Replace collaborators with vi.fn and vi.spyOn, control time with fake timers, and recognise when mocking makes a test pass while the real code is broken.
takeaways:
  - "`vi.fn()` creates a function that records every call, and you can tell it what to return with `mockReturnValue`, `mockResolvedValue` or `mockImplementation`."
  - "`vi.spyOn(object, 'method')` watches a real method and can override it; always restore spies, for example with `vi.restoreAllMocks()` in `afterEach`."
  - Mock at the boundaries of your system (network, email, time, randomness) and use the real code for your own modules.
  - "Fake timers (`vi.useFakeTimers`, `vi.advanceTimersByTime`) let a test skip ahead through delays instead of waiting for them."
  - Every mock is a claim about how the real thing behaves; when that claim drifts, the test stays green while production breaks.
further:
  - title: Vitest — Mocking guide
    url: https://vitest.dev/guide/mocking
  - title: Vitest — Mock functions API
    url: https://vitest.dev/api/mock
  - title: Vitest — Fake timers
    url: https://vitest.dev/guide/mocking/timers
quiz:
  - q: You want to check that `remindDebtors` calls `sendReminder('Ben', 'You owe $5.00 to the group')`. Which assertion fits?
    options:
      - text: "`expect(sendReminder).toHaveBeenCalledWith('Ben', 'You owe $5.00 to the group')`"
        why: Correct. `toHaveBeenCalledWith` passes if any recorded call used exactly those arguments, in that order.
      - text: "`expect(sendReminder('Ben')).toBe('You owe $5.00 to the group')`"
        why: This calls the mock yourself and checks its return value; it says nothing about what `remindDebtors` did.
      - text: "`expect(sendReminder).toHaveBeenCalled()`"
        why: It passes even if the arguments are wrong or swapped, so it would miss most of the bugs you care about.
    answer: 0
  - q: A test for the expense form mocks the in-house `parseAmount` module so that it always returns 1250. The real `parseAmount` gets a bug. What happens to that form test?
    options:
      - text: It fails, because Vitest detects that the mock and the real module disagree.
        why: Vitest has no idea what the real module would return; a mock replaces it completely.
      - text: It throws, because mocks can't replace modules you own.
        why: "`vi.mock` can replace any module, yours included, which is exactly the danger here."
      - text: It stays green, because it never runs the real parser; the form and parser are no longer tested together.
        why: Correct. Mocking your own pure modules buys little speed and removes the integration you wanted to check.
    answer: 2
  - q: "A draft autosaves 2 seconds after the last keystroke. With `vi.useFakeTimers()` on, how does the test get the save to happen?"
    options:
      - text: Wait with `await new Promise((r) => setTimeout(r, 2000))`.
        why: Under fake timers that `setTimeout` is fake too, so it never fires on its own and the test hangs until it times out.
      - text: Call `vi.advanceTimersByTime(2000)` after the last keystroke, then assert the save happened.
        why: Correct. Advancing the fake clock runs every timer due within that window, instantly.
      - text: Set the test timeout to 3 seconds so the real timer has time to fire.
        why: With fake timers installed there is no real timer; a longer timeout only delays the failure.
    answer: 1
  - q: Why do you call `vi.restoreAllMocks()` (or set `restoreMocks`) after tests that use `vi.spyOn`?
    options:
      - text: To reset the call counts on `vi.fn()` mocks to zero.
        why: Clearing call history is what `mockClear` does; restoring is about putting the original method back.
      - text: To put the original methods back so a spy from one test can't change behaviour in another.
        why: Correct. A spy replaces a real method on a shared object such as `console`; without restoring, the override leaks into later tests.
      - text: Because Vitest refuses to run a second test while a spy exists.
        why: Vitest runs happily with leaked spies, which is exactly why leaks cause confusing failures in unrelated tests.
    answer: 1
---

In the last lesson you wrote a stub API by hand, with a counter. It worked, and it was about fifteen lines. Vitest's `vi` helpers do the same in one line, and they add a lot of power. That power is the problem: mocking is the fastest way to write a test that passes while the real code is broken. This lesson covers the tools and the judgement.

## The vocabulary, briefly

All of these are **test doubles**, stand-ins for a real collaborator:

:::figure Test doubles, from simplest to most behaviour
<svg viewBox="0 0 680 190" role="img" aria-labelledby="t1">
  <title id="t1">Four kinds of test double in a row: a stub returns canned answers, a spy records calls, a mock is a spy you assert on, a fake is a working lightweight implementation.</title>
  <rect class="d-box" x="10" y="40" width="155" height="110" rx="12"/>
  <text class="d-label-strong" x="87" y="72" text-anchor="middle">Stub</text>
  <text class="d-label-muted" x="87" y="100" text-anchor="middle">canned answers</text>
  <text class="d-code" x="87" y="126" text-anchor="middle">returns {id}</text>
  <rect class="d-box-accent" x="180" y="40" width="155" height="110" rx="12"/>
  <text class="d-label-strong" x="257" y="72" text-anchor="middle">Spy</text>
  <text class="d-label-muted" x="257" y="100" text-anchor="middle">records calls</text>
  <text class="d-code" x="257" y="126" text-anchor="middle">.mock.calls</text>
  <rect class="d-box-primary" x="350" y="40" width="155" height="110" rx="12"/>
  <text class="d-label-strong" x="427" y="72" text-anchor="middle">Mock</text>
  <text class="d-label-muted" x="427" y="100" text-anchor="middle">spy you assert on</text>
  <text class="d-code" x="427" y="126" text-anchor="middle">CalledWith</text>
  <rect class="d-box-success" x="520" y="40" width="155" height="110" rx="12"/>
  <text class="d-label-strong" x="597" y="72" text-anchor="middle">Fake</text>
  <text class="d-label-muted" x="597" y="100" text-anchor="middle">working, simpler</text>
  <text class="d-code" x="597" y="126" text-anchor="middle">in-memory DB</text>
</svg>
:::

In Vitest, `vi.fn()` gives you a stub and a spy in one object, and people call all of them "mocks". The names matter less than the question each answers: *what does this collaborator return?* (stub) and *how was it called?* (spy).

## vi.fn: a function that remembers

Splitwise-lite sends a reminder to everyone who owes money. The sender is passed in, so a test can replace it:

```js title=src/remind.test.js
import { test, expect, vi } from 'vitest';
import { remindDebtors } from './remind.js';

test('reminds people who owe money, with the amount', () => {
  const sendReminder = vi.fn();

  const sent = remindDebtors({ Ana: 1500, Ben: -500, Cai: 0 }, sendReminder);

  expect(sent).toBe(1);
  expect(sendReminder).toHaveBeenCalledTimes(1);
  expect(sendReminder).toHaveBeenCalledWith('Ben', 'You owe $5.00 to the group');
});
```

`vi.fn()` returns `undefined` by default. Give it behaviour when the code under test needs an answer:

```js
const post = vi.fn().mockResolvedValue({ id: 'e1' });          // async success
const failing = vi.fn().mockRejectedValue(new Error('Offline')); // async failure
const send = vi.fn().mockImplementation((name) => {
  if (name === 'Ben') throw new Error('Mailbox full');
});
```

Every call is recorded in `send.mock.calls`, an array of argument arrays, for the rare case the matchers don't cover.

## vi.spyOn: watching a real method

Sometimes the collaborator is a method on an existing object, like `console.warn`. `vi.spyOn` wraps it: by default the real method still runs, and the spy records calls. Chain `mockImplementation` to silence or replace it:

```js
import { afterEach, test, expect, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks(); // put console.warn back
});

test('warns and carries on when one reminder fails', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const send = vi.fn().mockImplementationOnce(() => { throw new Error('Mailbox full'); });

  const sent = remindDebtors({ Ben: -500, Dee: -300 }, send);

  expect(sent).toBe(1);
  expect(send).toHaveBeenCalledTimes(2);
  expect(warn).toHaveBeenCalledWith('Could not remind Ben: Mailbox full');
});
```

A spy replaces a method on a **shared** object. Forget to restore it and every later test in the file runs with a silent `console.warn`. `vi.restoreAllMocks()` in `afterEach`, or `restoreMocks: true` in the config, makes cleanup automatic.

## Fake timers: skipping the wait

Code that waits (debounced autosave, retry back-off, "undo" toasts) is painful to test in real time. Fake timers replace `setTimeout`, `setInterval` and `Date` with a clock the test controls:

```js
import { afterEach, test, expect, vi } from 'vitest';

afterEach(() => vi.useRealTimers());

test('autosaves the draft 2 seconds after the last change', () => {
  vi.useFakeTimers();
  const save = vi.fn();
  const draft = createDraft({ save, delayMs: 2000 }); // debounced

  draft.update({ description: 'Din' });
  draft.update({ description: 'Dinner' });
  vi.advanceTimersByTime(1999);
  expect(save).not.toHaveBeenCalled();

  vi.advanceTimersByTime(1);
  expect(save).toHaveBeenCalledWith({ description: 'Dinner' });
});
```

`vi.advanceTimersByTime(ms)` runs every timer due within that window, instantly. `vi.setSystemTime(date)` pins `new Date()`, which is how you test "reminders go out on the first of the month". When timers schedule promises, use the async variants such as `vi.advanceTimersByTimeAsync`. (The playground runs real timers only, so this one stays on the page.)

## When mocking hurts

Every mock is a **claim** about how the real thing behaves. When reality drifts from the claim, the test keeps passing. The patterns that bite:

- **Mocking your own modules.** Replacing `parseAmount` inside a form test means the form and parser are never tested together, which was the point of the test. Your own pure code is fast; use it.
- **Mocking the thing under test.** If you spy on `remindDebtors` while testing `remindDebtors`, you are testing the spy.
- **Asserting every call.** Checking the exact sequence of fourteen internal calls freezes the implementation. Assert the calls a caller would care about, like "Ben got a reminder".
- **Mocks that lie.** Your mock API returns `{ id }`; the real one returns `{ data: { id } }`. Unit tests green, app broken. The next section's network mocking and the end-to-end tests in section 4 exist to catch exactly this.

:::mistake Using vi.mock as the first resort
`vi.mock('./api.js')` replaces a whole module for the file, and it is hoisted above your imports, which surprises people. It is useful for a third-party SDK you can't inject. For your own code, passing the collaborator in as a parameter (as `remindDebtors` does) keeps tests simpler and the design more honest.
:::

A quick sanity check for any mock you write: delete one line of the real code it stands in for. If no test fails anywhere in the suite, that mock was hiding the behaviour instead of testing around it, and somewhere you need a test that runs the real thing.

My rule: **mock at the boundaries** of your system (network, email, payment, time, randomness) and run the real code everywhere inside.

In the exercise, use `vi.fn` and `vi.spyOn` to catch four bugs in `remindDebtors`. Section 3 moves from functions to the DOM.
