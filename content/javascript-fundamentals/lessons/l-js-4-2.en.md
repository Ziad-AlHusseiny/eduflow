---
summary: Respond to clicks and key presses with addEventListener, read the event object, understand bubbling, and handle a whole list with one delegated listener that keeps working as items come and go.
takeaways:
  - "`addEventListener(type, handler)` registers a function the browser calls later, with an event object describing what happened."
  - Pass the handler itself, without parentheses; writing `handler()` calls it immediately and registers its return value instead.
  - Events bubble from the element that was clicked up through its ancestors, so a listener on a parent hears clicks on its children.
  - With event delegation, one listener on a container uses `event.target.closest(...)` to find which item was clicked, including items added later.
  - Keep data in variables, change the data in handlers, then call your render function; never treat the page as the source of truth.
further:
  - title: Introduction to events (MDN)
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events
  - title: EventTarget.addEventListener() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  - title: Event bubbling (MDN)
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
quiz:
  - q: 'What is wrong with `button.addEventListener("click", deleteExpense());`?'
    options:
      - text: Event names must be uppercase, as in "CLICK".
        why: Event types are lowercase strings such as "click" and "keydown".
      - text: '`deleteExpense` runs once immediately, and its return value (probably `undefined`) is registered instead of the function.'
        why: Correct. Pass the function itself, `deleteExpense`, or wrap it, `() => deleteExpense(id)`, so the browser calls it on each click.
      - text: Buttons cannot have click listeners; only links can.
        why: Any element can have a click listener, and buttons are the right element for actions.
    answer: 1
  - q: 'A list item contains `<span>Coffee</span> <button class="delete">×</button>`. The listener is on the `<ul>`. A user clicks the button. What are `event.target` and `event.currentTarget`?'
    options:
      - text: Both are the `<ul>`.
        why: '`currentTarget` is the `<ul>`, but `target` is the element that was actually clicked.'
      - text: '`target` is the `<ul>` and `currentTarget` is the button.'
        why: It is the other way round. `target` is where the event started; `currentTarget` is where the listener is.
      - text: '`target` is the button and `currentTarget` is the `<ul>`.'
        why: Correct. The click started on the button and bubbled up to the `<ul>`, whose listener is now running.
    answer: 2
  - q: Why does a delegated listener keep working for expenses added after the page loaded?
    options:
      - text: The browser copies listeners to every new child automatically.
        why: Listeners are never copied. Each one stays exactly where you attached it.
      - text: The listener is on the container, which never changes, and clicks on any child bubble up to it.
        why: Correct. New items are inside the same container, so their clicks reach the same listener.
      - text: Delegated listeners run again every time the DOM changes.
        why: Listeners only run when their event happens. Nothing re-runs on DOM changes.
    answer: 1
  - q: 'Inside a delegated click handler, why use `event.target.closest(".delete")` rather than checking `event.target.classList.contains("delete")`?'
    options:
      - text: '`closest` is faster than `classList`.'
        why: Speed is not the issue; both are instant. The issue is which element the click lands on.
      - text: '`classList` does not work on elements inside a list.'
        why: '`classList` works on every element. The problem is that the target may be a child of the button.'
      - text: The click may land on an element inside the button, such as an icon, and `closest` walks up to find the button anyway.
        why: Correct. `closest` checks the element itself and then each ancestor, returning the first match or `null`.
    answer: 2
---

Pocket can draw its list. Now people want to do things to it: delete an expense, mark one as reviewed, filter by category. Each of those starts with the user doing something, such as clicking or typing, and your code reacting. The browser reports everything users do as **events**.

## Listening for an event

You ask an element to tell you about an event with `addEventListener`:

```js title=app.js
const clearButton = document.querySelector("#clear");

clearButton.addEventListener("click", (event) => {
  console.log("Clear was clicked", event.type);
});
```

Read it as: "when a click happens on this button, call this function". Your function does not run now. The browser stores it and calls it later, once per click, passing an **event object** with details about what happened. This is the callback idea from the functions lesson, and the browser is the code calling you back.

The event types you will use most: `click`, `input` (a text field's value changed), `change` (a value was committed, for example a select), `submit` (a form was sent), and `keydown` (a key was pressed; `event.key` says which, such as `"Enter"` or `"Escape"`).

:::mistake Calling the handler instead of passing it
`button.addEventListener("click", clearAll());` runs `clearAll` once, right now, while the page loads, and registers whatever it returned, which is usually `undefined`. Then clicks do nothing. Pass the function, `clearAll`, or wrap a call that needs arguments in an arrow function: `() => removeExpense(id)`.
:::

## Data first, then render

The most important habit with events: **do not treat the page as the place your data lives**. Keep the data in a variable, change the variable in your handler, and call the render function from the last lesson to redraw:

```js title=app.js
let expenses = [
  { id: "exp-1", label: "Coffee", amount: 450 },
  { id: "exp-2", label: "Train", amount: 1220 },
];

clearButton.addEventListener("click", () => {
  expenses = [];
  renderExpenses(expenses);
});
```

The handler never touches `<li>` elements directly. It changes the data, and the render function makes the page match. However many buttons you add, there is still one place that draws the list, so the total and the list can never disagree.

## Bubbling: events travel up the tree

When you click a button inside a list item inside a list, you are clicking all of them: the button, the `<li>`, the `<ul>`, the `<body>`. The browser models this by delivering the event first to the element you clicked, the **target**, and then to each ancestor in turn, all the way up to `document`. This is called **bubbling**.

:::figure A click bubbles from the clicked element up through its ancestors
<svg viewBox="0 0 640 250" role="img" aria-labelledby="t1">
  <title id="t1">A click on a delete button starts at the button, the event target, then bubbles up to the li, then to the ul where a delegated listener handles it, then on to body and document.</title>
  <rect class="d-box" x="20" y="16" width="600" height="220" rx="14"/>
  <text class="d-code" x="40" y="42">body</text>
  <rect class="d-box-accent" x="50" y="56" width="540" height="164" rx="12"/>
  <text class="d-code" x="70" y="82">ul#expense-list   (listener here)</text>
  <rect class="d-box" x="80" y="98" width="480" height="104" rx="10"/>
  <text class="d-code" x="100" y="124">li data-id="exp-2"</text>
  <text class="d-label" x="110" y="168">Train  $12.20</text>
  <rect class="d-box-primary" x="380" y="140" width="150" height="46" rx="10"/>
  <text class="d-code" x="455" y="168" text-anchor="middle">button.delete</text>
  <path class="d-arrow" d="M455 140 L455 116 L330 116" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M300 100 L300 78" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="455" y="230" text-anchor="middle">target: where the click started</text>
</svg>
:::

Inside a handler, `event.target` is the element where the event started, and `event.currentTarget` is the element whose listener is running now. A listener on the `<ul>` therefore hears clicks on every button inside it and can still find out which button it was.

## Event delegation: one listener for the whole list

Suppose every expense has a delete button. You could attach a listener to each button, but the render function throws those buttons away and makes new ones every time the list changes, and the new buttons have no listeners. Instead, attach **one** listener to the list, which is never replaced, and work out what was clicked:

```js title=app.js
const list = document.querySelector("#expense-list");

list.addEventListener("click", (event) => {
  const button = event.target.closest("button.delete");
  if (!button) {
    return; // the click was somewhere else in the list
  }
  const id = button.closest("li").dataset.id;
  expenses = expenses.filter((e) => e.id !== id);
  renderExpenses(expenses);
});
```

`closest(selector)` starts at an element and walks up through its ancestors until it finds one that matches, or returns `null`. That handles clicks on an icon inside the button, and the `if (!button)` guard ignores clicks on the rest of the item. The id comes from the `data-id` you set while rendering, and the data change is a `filter`, exactly as in section 3.

This pattern is called **event delegation**. It means fewer listeners, and it keeps working for items added after the listener was set up, because their clicks bubble to the same list.

:::tip Use real buttons for actions
A clickable `<div>` looks the same but cannot be reached with the Tab key and is not announced as a button by screen readers. A `<button type="button">` gets keyboard support and accessibility for free, and pressing Enter or Space on it fires `click`.
:::

To stop a click from bubbling further you can call `event.stopPropagation()`, but you will rarely need it, and using it often breaks delegation somewhere else. `event.preventDefault()` is different and far more common: it cancels the browser's default action, such as following a link or submitting a form. That second one is the star of the next lesson.
