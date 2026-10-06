---
summary: Assemble Pocket into a complete browser app with one state object, pure logic, a single render function, delegated events, filtering and saved data, and check it against a definition of done.
takeaways:
  - Keep all changing data in one place and change it through one function that saves and re-renders, so the page, the data and storage never disagree.
  - Derive everything you can, such as the visible list and the totals, from the state at render time instead of storing it separately.
  - Pure functions hold the rules; handlers stay short and only translate events into state changes.
  - An app is done when it handles the empty state, bad input, a reload and keyboard-only use, not just the happy path.
further:
  - title: Document.createElement() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
  - title: "HTMLElement: change event (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
quiz:
  - q: Pocket shows expenses filtered to "food" with a total at the bottom. Where should the filtered list come from?
    options:
      - text: A second array, `foodExpenses`, updated whenever an expense is added or deleted.
        why: Two arrays that must be kept in step will eventually disagree, for example after a delete that only updates one.
      - text: Reading the `<li>` elements currently on the page.
        why: The page is a picture of the data. Reading data back out of it couples your logic to markup and breaks easily.
      - text: Computed inside `render` from `state.expenses` and `state.filter` every time.
        why: Correct. Derived data that is recomputed from the single source of truth can never go stale.
    answer: 2
  - q: Every handler in Pocket ends with the same three steps. Which order is right?
    options:
      - text: Update the state, save it, render from it.
        why: Correct. The state changes first; saving and rendering both read from the new state, so both reflect the same data.
      - text: Render, then update the state, then save.
        why: Rendering before the state changes draws the old data, so the screen is always one step behind.
      - text: Save, then update the state, then render.
        why: Saving before updating stores the old data, so a reload loses the latest change.
    answer: 0
  - q: Which of these is part of a reasonable definition of done for Pocket, beyond "adding an expense works"?
    options:
      - text: Every function is written as a class method.
        why: Classes are a tool, not a goal. Plain functions are often the better choice for pure logic.
      - text: The app has at least one animation.
        why: Polish is nice, but it says nothing about whether the app works for real use.
      - text: The code uses no `if` statements.
        why: Conditions are essential to real programs. Avoiding them is not a quality measure.
      - text: The list shows a helpful message when there are no expenses, and the data survives a reload.
        why: Correct. Empty states and persistence are part of what users experience, so they belong in "done".
    answer: 3
---

You have all the pieces: money helpers, validation, rendering, events, a form, storage, modules and classes. This lesson puts them together into the finished Pocket, and, more importantly, shows the shape that holds a small app together so it stays easy to change.

## The shape: one state, one way to change it

Every interactive app has data that changes. In Pocket that is the list of expenses and the category filter the user picked. Put all of it in one object, the **state**:

```js title=src/main.js
const state = {
  expenses: loadExpenses(),
  filter: "all",
};
```

Then make one function the only way to change it. It applies the change, saves, and re-renders:

```js title=src/main.js
function update(changes) {
  Object.assign(state, changes);
  saveExpenses(state.expenses);
  render();
}
```

`Object.assign(state, changes)` copies the properties of `changes` onto `state`, so `update({ filter: "food" })` changes only the filter. Every event handler now ends the same way: work out the new values, then call `update`. You never need to remember to save or redraw, because it is impossible not to.

:::figure The loop every event goes through
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">A user event goes to a handler, which computes new values with pure functions and calls update. update changes the state, saves it to storage, and calls render, which draws the page the user sees, ready for the next event.</title>
  <rect class="d-box-accent" x="20" y="20" width="140" height="56" rx="10"/>
  <text class="d-label" x="90" y="53" text-anchor="middle">user event</text>
  <rect class="d-box" x="200" y="20" width="160" height="56" rx="10"/>
  <text class="d-label" x="280" y="44" text-anchor="middle">handler</text>
  <text class="d-label-muted" x="280" y="64" text-anchor="middle">uses pure functions</text>
  <rect class="d-box-primary" x="400" y="20" width="140" height="56" rx="10"/>
  <text class="d-code" x="470" y="53" text-anchor="middle">update()</text>
  <rect class="d-box-success" x="400" y="140" width="140" height="56" rx="10"/>
  <text class="d-code" x="470" y="173" text-anchor="middle">render()</text>
  <rect class="d-box" x="580" y="20" width="90" height="56" rx="10"/>
  <text class="d-label" x="625" y="53" text-anchor="middle">save</text>
  <rect class="d-box" x="200" y="140" width="160" height="56" rx="10"/>
  <text class="d-label" x="280" y="173" text-anchor="middle">the page</text>
  <path class="d-arrow" d="M160 48 L196 48" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M360 48 L396 48" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M540 48 L576 48" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M470 76 L470 136" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 168 L364 168" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M200 168 Q90 168 90 80" marker-end="url(#arrow)"/>
</svg>
:::

## Render derives everything

`render` reads the state and draws the whole interface. Anything that can be computed from the state is computed here, not stored: the visible list depends on the filter, and the total depends on the visible list.

```js title=src/ui.js
function render() {
  const visible =
    state.filter === "all"
      ? state.expenses
      : state.expenses.filter((e) => e.category === state.filter);

  list.replaceChildren();
  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No expenses yet. Add your first one above.";
    list.append(empty);
  }
  for (const expense of visible) {
    list.append(renderItem(expense));
  }
  totalEl.textContent = `Total: ${formatMoney(totalCents(visible))}`;
}

function renderItem(expense) {
  const li = document.createElement("li");
  li.dataset.id = expense.id;
  const text = document.createElement("span");
  text.textContent = `${expense.label}: ${formatMoney(expense.amount)} (${expense.category})`;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "delete";
  button.textContent = "Delete";
  button.setAttribute("aria-label", `Delete ${expense.label}`);
  li.append(text, button);
  return li;
}
```

Because `render` always starts from the state, the filter, the list and the total can never contradict each other. Switching the filter to "food" does not hide some `<li>` elements and recalculate a number; it simply draws a different picture of the same state.

Two details worth copying. The **empty state** turns a blank list into guidance. And the delete button's `aria-label` tells screen-reader users *which* expense it deletes, since ten buttons all called "Delete" are useless to someone who cannot see the row.

## Handlers translate events into updates

With the state, `update` and `render` in place, each feature is a few lines:

```js title=src/main.js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = readExpenseForm(form);          // { values } or { errors }
  if (result.errors) {
    showErrors(form, result.errors);
    return;
  }
  update({ expenses: addExpense(state.expenses, { id: nextId(), ...result.values }) });
  form.reset();
  form.elements.label.focus();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest(".delete");
  if (!button) return;
  const id = button.closest("li").dataset.id;
  update({ expenses: state.expenses.filter((e) => e.id !== id) });
});

filterSelect.addEventListener("change", () => {
  update({ filter: filterSelect.value });
});

render();
```

`readExpenseForm` and `showErrors` are the form code from section 4, moved into small named functions: one reads, trims, converts and validates, returning either clean values or an errors object; the other writes the messages and sets `aria-invalid`. Giving each a name turns the submit handler into a summary you can read in five seconds.

Notice what the handlers do *not* contain: no DOM building, no saving, no totals. They read the event, call pure functions such as `addExpense` from section 3, and hand the result to `update`. The rules live in `expenses.js`, where you can test them without a browser; the handlers are glue.

:::mistake Ids that repeat after a reload
A counter that starts at 1 every time the page loads will hand out `exp-1` again while an old `exp-1` is still in storage, and then deleting one deletes both. Start the counter after the highest saved id, or use `crypto.randomUUID()`, which all current browsers provide on secure (https or localhost) pages and returns a unique id like `"3b241101-e2bb-4255-8caf-4136c566a962"`.
:::

## A definition of done

"Adding an expense works" is where testing starts, not where it ends. Before calling Pocket finished, run through this list by hand:

- **Empty**: with no data, the page explains what to do.
- **Bad input**: an empty label, an amount of `abc`, `0` or `-5` each show a clear message and add nothing.
- **Reload**: everything you added is still there, and the filter starts at "All".
- **Keyboard only**: you can tab to every field and button, submit with Enter, and delete with Enter or Space.
- **Odd data**: a label like `<b>hi</b>` shows as text, and a very long label does not break the layout.
- **Console**: no errors or warnings while you do all of the above.

Every item comes from a lesson in this course, and each catches a real class of bugs that users would otherwise find for you.

:::tip Commit at each working step
Build features one at a time and save a working version after each: add, then delete, then filter, then storage. If something breaks, you only have one step to undo. The [Git & GitHub course](course:git-github) shows how to do this properly with commits.
:::

The exercise below hands you a nearly finished Pocket with the filter and delete still to wire up. After that, one short lesson on where to go from here.
