---
summary: Handle a form's submit event without reloading the page, read and convert its values, validate them with HTML attributes and your own function, and show clear, accessible error messages.
takeaways:
  - Listen for `submit` on the form, not `click` on the button, so every way of submitting (button, Enter key, assistive technology) runs your code, and call `event.preventDefault()` to stop the page reloading.
  - Every value read from a form is a string; trim text and convert numbers before using them.
  - Keep validation in a pure function that takes values and returns errors, so the rules are easy to read and test.
  - "HTML attributes such as `required` and `min` are a useful first layer, but your JavaScript must still validate, and the server must too."
  - Show errors next to the field, mark it with `aria-invalid`, and move focus so keyboard and screen-reader users notice.
further:
  - title: Client-side form validation (MDN)
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
  - title: FormData (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/FormData
  - title: "HTMLFormElement: submit event (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
quiz:
  - q: You attach your "add expense" logic to the Save button's `click` event. What breaks?
    options:
      - text: The click handler covers only one way in, and the form still submits natively afterwards, reloading the page.
        why: Correct. Forms can also be submitted by `form.requestSubmit()`, by some assistive technology, or by Enter in a form with no submit button, and a click handler does not cancel the native submission. Listening for `submit` on the form catches every path, and `preventDefault()` there stops the reload.
      - text: Nothing; `click` and `submit` are interchangeable.
        why: They are different events. `submit` fires on the form however it is submitted; a click on the button is only one of the ways a submission can start.
      - text: The button can no longer be focused with the keyboard.
        why: Adding a listener does not change focus behaviour. The problem is the submission path you are not handling.
    answer: 0
  - q: 'A number input contains `12.50`. What is `input.value`?'
    options:
      - text: The number `12.5`.
        why: Even for `type="number"`, `value` is always a string. Use `Number(input.value)` or `input.valueAsNumber`.
      - text: The string `"12.50"`.
        why: Correct. Form values are strings, so convert before doing maths, or `+` will join text.
      - text: '`NaN`, until the form is submitted.'
        why: The value is available at any time, and it is the text in the field, not `NaN`.
    answer: 1
  - q: Your form has `required` and `min="0.01"` on the amount field. Why validate again in JavaScript?
    options:
      - text: Browsers ignore HTML validation attributes on number fields.
        why: Browsers do honour them. The extra checks are about rules HTML cannot express and about not trusting any single layer.
      - text: HTML validation is deprecated in favour of JavaScript.
        why: Built-in validation is current and useful. It is a first layer, not a replacement for your own checks.
      - text: Some rules (such as "no more than two decimals" or "label not only spaces") need code, and attributes can be removed in DevTools.
        why: Correct. Treat HTML validation as a convenience for users, and the server as the final authority for anything that matters.
    answer: 2
---

Pocket needs a way to add expenses that is not a "sample" button: a form with a label, an amount and a category. Forms look simple and are where many real bugs live, because they sit on the border between people, who type anything, and your code, which expects clean data.

## The form and the submit event

Start with proper HTML. Every input has a `<label>`, and the button is a submit button inside the `<form>`:

```html title=index.html
<form id="expense-form" novalidate>
  <label for="label">What</label>
  <input id="label" name="label" required>

  <label for="amount">Amount ($)</label>
  <input id="amount" name="amount" type="number" step="0.01" min="0.01" required>

  <label for="category">Category</label>
  <select id="category" name="category">
    <option value="food">Food</option>
    <option value="travel">Travel</option>
    <option value="fun">Fun</option>
  </select>

  <p id="form-error" class="error" role="alert"></p>
  <button type="submit">Add expense</button>
</form>
```

A form can be submitted by clicking the button, by pressing Enter in a field, or by assistive technology. All of these fire one event on the form: `submit`. Listen to that, not to the button's `click`:

```js title=app.js
const form = document.querySelector("#expense-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  // read, validate, add, render
});
```

The browser's default reaction to a submit is to send the data to a server and load a new page. For an app that runs in the page, that reload wipes out everything. `event.preventDefault()` cancels the default and keeps you on the page.

:::mistake Forgetting preventDefault
Without `event.preventDefault()`, the page reloads the moment the form is submitted. Your new expense flashes for a split second, the page starts over, and the console is cleared, so you cannot even see an error. If a form "does nothing" and the URL suddenly gains `?label=…`, this is why.
:::

## Reading the values

You can read each field's `value`, or collect them all at once with `FormData`, which uses each field's `name` attribute:

```js title=app.js
const data = new FormData(form);
const rawLabel = data.get("label");     // "  Coffee with Sam "
const rawAmount = data.get("amount");   // "4.50": a string!
const category = data.get("category");  // "food"
```

Every value is a **string**, even from a number input. This is the "typed input" problem from section 1, now for real. Clean the values up immediately: `trim()` the label, and convert the amount once, into cents:

```js title=app.js
const label = rawLabel.trim();
const amount = Math.round(Number(rawAmount) * 100);
```

## Validation in a pure function

Put the rules in one function that takes values and returns what is wrong with them. It does not touch the page, so it is easy to read and easy to test:

```js run
function validateExpense({ label, amount }) {
  const errors = {};
  if (label.trim() === "") {
    errors.label = "Enter what you spent money on.";
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than zero.";
  }
  return errors;
}

console.log(validateExpense({ label: "  ", amount: Number("") }));
console.log(validateExpense({ label: "Coffee", amount: 4.5 }));
```

An empty object means "valid", which you test with `Object.keys(errors).length === 0`. Notice `Number("")` is `0`, the empty-input trap from section 1, so "nothing typed" correctly fails the `amount <= 0` rule, and `Number.isFinite` rejects `NaN` and `Infinity` in one check.

:::figure What happens on submit
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">On submit: prevent the default reload, read and convert the values, then validate. If there are errors, show them and focus the first invalid field. If valid, add the expense, render, and reset the form.</title>
  <rect class="d-box-accent" x="10" y="80" width="120" height="50" rx="10"/>
  <text class="d-code" x="70" y="110" text-anchor="middle">submit</text>
  <rect class="d-box" x="160" y="80" width="150" height="50" rx="10"/>
  <text class="d-label" x="235" y="103" text-anchor="middle">preventDefault,</text>
  <text class="d-label" x="235" y="121" text-anchor="middle">read + convert</text>
  <rect class="d-box-primary" x="340" y="80" width="110" height="50" rx="10"/>
  <text class="d-label" x="395" y="110" text-anchor="middle">validate</text>
  <rect class="d-box-warn" x="490" y="14" width="180" height="56" rx="10"/>
  <text class="d-label" x="580" y="38" text-anchor="middle">show errors,</text>
  <text class="d-label" x="580" y="58" text-anchor="middle">focus the field</text>
  <rect class="d-box-success" x="490" y="140" width="180" height="56" rx="10"/>
  <text class="d-label" x="580" y="164" text-anchor="middle">add, render,</text>
  <text class="d-label" x="580" y="184" text-anchor="middle">reset the form</text>
  <path class="d-arrow" d="M130 105 L156 105" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M310 105 L336 105" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M450 95 L486 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M450 115 L486 160" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="455" y="62" text-anchor="middle">errors</text>
  <text class="d-label-muted" x="455" y="160" text-anchor="middle">valid</text>
</svg>
:::

## Putting it together

```js title=app.js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const values = {
    label: data.get("label").trim(),
    amount: Math.round(Number(data.get("amount")) * 100),
    category: data.get("category"),
  };

  const errors = validateExpense(values);
  const errorEl = document.querySelector("#form-error");
  if (Object.keys(errors).length > 0) {
    errorEl.textContent = Object.values(errors).join(" ");
    const firstBad = form.elements[Object.keys(errors)[0]];
    firstBad.setAttribute("aria-invalid", "true");
    firstBad.focus();
    return;
  }

  errorEl.textContent = "";
  expenses = [...expenses, { id: nextId(), ...values }];
  renderExpenses();
  form.reset();
  form.elements.label.focus();
});
```

On failure, the message goes in an element with `role="alert"`, which screen readers announce as soon as its text changes; the first invalid field is marked with `aria-invalid` and receives focus, so the user can fix it straight away. On success, the data changes, the list re-renders, `form.reset()` empties the fields, and focus returns to the first field, ready for the next expense. A real app would also clear `aria-invalid` once a field is fixed. `form.elements.label` looks up a field by its `name`.

## Clearing errors as the user types

Showing an error is half the job; the other half is taking it away at the right moment. If the message stays on screen while the user is already typing the fix, the form feels like it is scolding them. Listen for `input` events on the form (they bubble, so one listener covers every field) and clear the error state of whichever field changed:

```js title=app.js
form.addEventListener("input", (event) => {
  event.target.removeAttribute("aria-invalid");
  document.querySelector("#form-error").textContent = "";
});
```

Resist the opposite urge, validating every keystroke and showing "Enter an amount" while someone is halfway through typing it. A good default: validate on submit, clear on input.

## HTML validation: the first layer

The `required`, `type="number"`, `min` and `step` attributes let the browser check basic rules and show its own messages. The `novalidate` attribute on the form above turns those messages off so yours are shown consistently, while the attributes still document intent and give phones the right keyboard. You can also ask the browser directly with `form.checkValidity()`.

:::why Never trust only the browser
Anyone can open DevTools and delete `required`, or send data without using your form at all. Front-end validation exists to help honest users fix mistakes quickly. Anything that must be true, such as an amount being positive before it reaches a bank, has to be checked again on the server.
:::

Your form now adds real expenses. Reload the page, though, and they are gone, because they only ever lived in a variable. Next lesson fixes that with JSON and `localStorage`.
