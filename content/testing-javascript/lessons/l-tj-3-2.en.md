---
summary: Drive forms and buttons in tests the way a person does, choose user-event over fireEvent, and assert on what the user sees and what the code reports.
takeaways:
  - "`fireEvent` dispatches one DOM event; `user-event` plays the whole sequence a real person causes (pointer, focus, keydown, input, keyup, click)."
  - "Create a session with `userEvent.setup()` and `await` every interaction, because user-event methods are asynchronous."
  - "Test a form through its outcomes: the callback's arguments, the error a user would read, and the state of the fields afterwards."
  - Test the invalid path as carefully as the valid one; "nothing happened" is a behaviour to assert.
further:
  - title: Testing Library — user-event introduction
    url: https://testing-library.com/docs/user-event/intro
  - title: Testing Library — Firing events
    url: https://testing-library.com/docs/dom-testing-library/api-events
  - title: Testing Library — user-event setup
    url: https://testing-library.com/docs/user-event/setup
quiz:
  - q: "The amount field formats input on each `keydown`. A test uses `fireEvent.change(input, { target: { value: '45.50' } })`, and the formatting code never runs. Why?"
    options:
      - text: "`fireEvent.change` sets the value and dispatches a single `change` event, with no key events."
        why: Correct. Nothing pressed a key, so `keydown` handlers never fire. `await user.type(input, '45.50')` produces key events for every character.
      - text: "`fireEvent` only works with React components."
        why: "`fireEvent` comes from `@testing-library/dom` and works with any DOM; the issue is which events it sends."
      - text: Change events don't bubble in jsdom.
        why: Bubbling isn't the issue; the `keydown` handler isn't waiting for a change event at all.
    answer: 0
  - q: "What's wrong with this test?\n```js\ntest('adds the expense', () => {\n  const user = userEvent.setup();\n  mountExpenseForm(document.body, onAdd);\n  user.type(screen.getByRole('textbox', { name: 'Amount' }), '12');\n  user.click(screen.getByRole('button', { name: 'Add expense' }));\n  expect(onAdd).toHaveBeenCalled();\n});\n```"
    options:
      - text: "`userEvent.setup()` must be called inside `beforeEach`."
        why: Calling `setup()` at the start of each test is the recommended pattern; there's no need for a hook.
      - text: "`getByRole` can't find inputs; it should use `getByTestId`."
        why: Inputs have the role `textbox`, and with a label they have an accessible name, so `getByRole` is the right query.
      - text: The interactions aren't awaited, so the assertion runs before typing and clicking have finished.
        why: Correct. user-event methods return promises; make the test `async` and `await` each call.
    answer: 2
  - q: Typing `'abc'` in the amount field and clicking "Add expense" should show an error. Which set of assertions tests that path best?
    options:
      - text: The alert is visible.
        why: It's a start, but a version that shows the alert *and* still calls `onAdd` with garbage would pass.
      - text: The alert shows the message, `onAdd` was not called, and the typed text is still in the field.
        why: "Correct. Each assertion guards a different bug: a silent failure, a bad expense saved, and wiping the user's input."
      - text: "`onAdd` was not called."
        why: A version that silently ignores the click passes this too; the user would be left guessing.
    answer: 1
---

The expense form is where Splitwise-lite meets real people, and real people do messy things: they tab between fields, paste " 45.50 ", click "Add" with the amount still empty, double-click. A unit test of `parseAmount` can't tell you whether the form wires all of that up correctly. A test that uses the form like a person can.

## fireEvent versus user-event

Testing Library ships two ways to interact.

**`fireEvent`** (from `@testing-library/dom`) dispatches exactly one DOM event. `fireEvent.click(button)` sends a `click`. `fireEvent.change(input, { target: { value: '45.50' } })` sets the value and sends a `change`. It's fast and precise, and it's not what happens when a person clicks or types.

**`user-event`** (from `@testing-library/user-event`) simulates the interaction. `user.click(button)` produces pointer and mouse events, moves focus, then fires `click`, and refuses to click a disabled button or one hidden under `pointer-events: none`, like a real browser. `user.type(input, '45.50')` clicks the field, then for each character sends `keydown`, `keypress`, `input` and `keyup`.

:::figure One event versus the sequence a person causes
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">fireEvent.click sends only a click event. user.click sends pointerdown, mousedown, focus, pointerup, mouseup and then click.</title>
  <text class="d-code" x="20" y="48">fireEvent.click</text>
  <rect class="d-box-warn" x="200" y="26" width="90" height="34" rx="8"/>
  <text class="d-code" x="245" y="48" text-anchor="middle">click</text>
  <text class="d-code" x="20" y="138">user.click</text>
  <rect class="d-box-accent" x="140" y="116" width="100" height="34" rx="8"/>
  <text class="d-code" x="190" y="138" text-anchor="middle">pointerdown</text>
  <rect class="d-box-accent" x="250" y="116" width="90" height="34" rx="8"/>
  <text class="d-code" x="295" y="138" text-anchor="middle">mousedown</text>
  <rect class="d-box-primary" x="350" y="116" width="60" height="34" rx="8"/>
  <text class="d-code" x="380" y="138" text-anchor="middle">focus</text>
  <rect class="d-box-accent" x="420" y="116" width="80" height="34" rx="8"/>
  <text class="d-code" x="460" y="138" text-anchor="middle">pointerup</text>
  <rect class="d-box-accent" x="510" y="116" width="74" height="34" rx="8"/>
  <text class="d-code" x="547" y="138" text-anchor="middle">mouseup</text>
  <rect class="d-box-success" x="594" y="116" width="70" height="34" rx="8"/>
  <text class="d-code" x="629" y="138" text-anchor="middle">click</text>
  <text class="d-label-muted" x="340" y="190" text-anchor="middle">handlers on any of these events run, as in a browser</text>
</svg>
:::

Default to user-event. Reach for `fireEvent` only for events user-event doesn't model, such as a custom event or `scroll`.

## Testing the expense form

The form has two labelled fields, an "Add expense" button and an alert area. Here is the happy path, written the way you'd describe it to a colleague:

```js title=src/expense-form.test.js
// @vitest-environment jsdom
import { afterEach, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { mountExpenseForm } from './expense-form.js';

afterEach(() => {
  document.body.innerHTML = '';
});

test('adds a valid expense in cents and clears the form', async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  mountExpenseForm(document.body, onAdd);

  await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Dinner');
  await user.type(screen.getByRole('textbox', { name: 'Amount' }), '45.50');
  await user.click(screen.getByRole('button', { name: 'Add expense' }));

  expect(onAdd).toHaveBeenCalledWith({ description: 'Dinner', amountCents: 4550 });
  expect(screen.getByRole('textbox', { name: 'Amount' }).value).toBe('');
});
```

Three things to notice. `userEvent.setup()` comes first and gives you a `user` session that tracks keyboard and pointer state across calls. **Every interaction is awaited**: user-event methods are asynchronous, and without `await` the assertions run before the typing has finished. And the assertions are about **outcomes**: what `onAdd` received (the contract with the rest of the app) and what the user now sees.

Keyboard users matter too. `await user.tab()` moves focus like the Tab key, and `await user.keyboard('{Enter}')` presses Enter, so you can test that the form works without a mouse.

### What user-event won't do for you

user-event simulates the browser's default behaviour for the interaction, but it can't see your CSS layout. It won't notice that a modal covers the button visually, or that the "Add expense" button is scrolled off-screen on a phone. jsdom has no layout engine, so sizes and positions are all zero. Those are jobs for end-to-end tests in a real browser, which is where section 4 goes. In unit and component tests, user-event gives you the right *event sequence* and *focus behaviour*, which covers the large majority of form bugs.

## The unhappy path is most of the work

Most form bugs live in the error handling, so give it at least as many tests. Typing `abc` as the amount and clicking "Add expense" should:

1. show the reason in an element with `role="alert"`, which screen readers announce;
2. **not** call `onAdd`;
3. **keep** what the user typed, so they can fix one character instead of retyping.

```js
test('explains an invalid amount and keeps the input', async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  mountExpenseForm(document.body, onAdd);

  await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Taxi');
  await user.type(screen.getByRole('textbox', { name: 'Amount' }), 'abc');
  await user.click(screen.getByRole('button', { name: 'Add expense' }));

  expect(screen.getByRole('alert').textContent).toMatch('Not a valid amount');
  expect(onAdd).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Amount' }).value).toBe('abc');
});
```

Each assertion guards a different bug. Drop the alert check and a silent failure passes. Drop the `not.toHaveBeenCalled` and a form that saves garbage passes. Drop the last one and a form that wipes the user's input passes.

:::mistake Asserting on component internals after an interaction
After clicking, it is tempting to check a private variable, a CSS class like `.has-error`, or how many times an internal `validate` function ran. None of those are things a user perceives, and they all change during refactors. Assert the visible message, the field values and the callback; that's the contract.
:::

## In the playground

There is no user-event package in the sandbox, so the exercise starter includes two small helpers: `typeInto(element, text)`, which focuses the field and sends key and input events for each character, and `clickOn(element)`, which sends the pointer and mouse sequence, focuses and clicks (and does nothing on a disabled button). They are synchronous, so you don't `await` them. The sandbox also blocks real form submission, so the widget listens for the button's click instead of a `submit` event; in your app, a real `<form>` with a submit handler is better, because it gives you Enter-to-submit for free.

Next, the hardest part of UI testing: things that happen later.
