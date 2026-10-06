---
summary: Build the Watchlist's add-movie form with controlled inputs, handle submission and validation, and know when React 19 form actions and useActionState are the better fit.
takeaways:
  - A controlled input gets its `value` from state and reports every keystroke through `onChange`, so state is the single source of truth.
  - Handle `onSubmit` on the `<form>` and call `e.preventDefault()`; you get Enter-to-submit and accessible behaviour for free.
  - Validate from state while rendering, for example by disabling the button when the trimmed title is empty.
  - Input values are always strings; convert numbers yourself and use `checked` for checkboxes.
  - React 19 form actions pass `FormData` to a function and reset the form; `useActionState` adds a result and a pending flag.
further:
  - title: Reacting to Input with State
    url: https://react.dev/learn/reacting-to-input-with-state
  - title: "<input> reference (controlled inputs)"
    url: https://react.dev/reference/react-dom/components/input
  - title: "<form> reference (form actions)"
    url: https://react.dev/reference/react-dom/components/form
  - title: useActionState reference
    url: https://react.dev/reference/react/useActionState
quiz:
  - q: "You render `<input value={title} />` with no `onChange`. What happens when the user types?"
    options:
      - text: The input updates and `title` state updates automatically.
        why: React never updates your state for you. A controlled input only changes when you set the state it reads from.
      - text: Nothing changes, and React warns that you provided `value` without an `onChange` handler.
        why: Correct. Every render forces the input back to `title`. Add `onChange={(e) => setTitle(e.target.value)}`, or use `defaultValue` for an uncontrolled field.
      - text: The input updates, but `title` stays the same.
        why: That's how an uncontrolled input with `defaultValue` behaves. With `value`, React keeps the DOM in line with state.
      - text: React throws an error and stops rendering.
        why: It's a development warning, not an error. The field just becomes read-only.
    answer: 1
  - q: The year field is `<input type="number" value={year} onChange={(e) => setYear(e.target.value)} />`. The user types 2016. What type is `year`, and what does `year + 1` give?
    options:
      - text: The number 2016, so `year + 1` is 2017.
        why: "`type=\"number\"` only changes the keyboard and validation. `e.target.value` is always a string."
      - text: The number 2016, but `year + 1` is NaN.
        why: A number plus 1 is never NaN. The value isn't a number in the first place.
      - text: "`undefined`, because number inputs need `valueAsNumber`."
        why: "`e.target.value` works on number inputs; it just returns a string. `valueAsNumber` is an alternative that returns a number."
      - text: The string "2016", so `year + 1` is "20161".
        why: Correct. Convert when you use it, for example with `Number(year)`, and keep the raw string in state so partial input like an empty field works.
    answer: 3
  - q: "Your form adds a movie and should clear the title afterwards. Which `handleSubmit` is right for a controlled input?"
    options:
      - text: "`e.preventDefault(); onAdd(title.trim()); setTitle('');`"
        why: Correct. preventDefault stops the page reload, onAdd reports the new movie, and setting the state to '' clears the controlled input.
      - text: "`onAdd(title); e.target.reset();`"
        why: Without preventDefault the browser tries to submit and reload. And reset() doesn't change `title` state, so React puts the old value back on the next render.
      - text: "`e.preventDefault(); onAdd(title); title = '';`"
        why: Reassigning the variable does nothing to state; the field keeps showing the old title.
    answer: 0
  - q: When is a React 19 form action with `useActionState` a better fit than controlled inputs?
    options:
      - text: When you need to change what's shown on every keystroke, such as live character counts.
        why: Live feedback needs the value in state as the user types, which is what controlled inputs give you.
      - text: Never; actions only work with server frameworks like Next.js.
        why: Form actions work with plain client-side functions in any React 19 app. Server Functions are one optional use.
      - text: When the form mainly matters at submit time, especially with async work, and you want a result or error plus a pending flag.
        why: Correct. The action receives FormData, `useActionState` stores what it returns, and `isPending` is true while it runs.
      - text: When the form has only one field.
        why: The number of fields doesn't decide it. What matters is whether you react to typing or to submitting.
    answer: 2
---

Every useful app takes input. For the Watchlist that means a form: type a title, optionally a year, press Enter or click Add, and the movie appears in the list. Forms are where state and events meet, and where most beginner bugs live: inputs that won't accept typing, pages that reload on submit, numbers that concatenate like strings. Each one has a clear cause.

## A controlled input

In plain HTML the input owns its value; you read it when you need it. In React the usual approach flips that: **state owns the value**, and the input displays it.

```jsx title=src/components/AddMovieForm.jsx
import { useState } from 'react';

export default function AddMovieForm() {
  const [title, setTitle] = useState('');

  return (
    <form>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <p>{title.length}/80 characters</p>
    </form>
  );
}
```

This is a **controlled input**. Every keystroke fires `onChange`, the handler stores the new text in state, React re-renders, and the input shows the state. It sounds roundabout, but now the current text is an ordinary variable. You can show a character count, validate as the user types, disable a button, or clear the field by setting state to `''`.

Note `onChange` in React fires on every keystroke, like the DOM's `input` event, not only when the field loses focus.

:::mistake `value` without `onChange`
`<input value={title} />` on its own makes a read-only field: each render puts `title` back, so typing does nothing, and React warns in the console. Either add `onChange` or, if you don't need the value in state, use `defaultValue` to make it uncontrolled. A related warning, "changing an uncontrolled input to be controlled", means `value` started as `undefined`; initialise state with `''`.
:::

## Submitting

Handle submission on the form, not on the button's click:

```jsx title=src/components/AddMovieForm.jsx
export default function AddMovieForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const trimmed = title.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Title</label>
      <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit" disabled={!trimmed}>Add</button>
    </form>
  );
}
```

`onSubmit` on the form means pressing Enter in the input works, the button works, and assistive technology understands the form, all without extra code. `e.preventDefault()` stops the browser's default, which is to send the form to a URL and reload the page. The component reports the new title through `onAdd` and clears the field by resetting state.

Validation comes from state too. `trimmed` is derived on every render, so the button is disabled exactly while the title is blank, including a title of only spaces. The `if (!trimmed) return;` inside the handler is a second guard in case the form is submitted another way.

:::tip Show errors next to the field
When you display a message such as "Title is required", connect it to the input with `aria-describedby` pointing at the message's `id`, and set `aria-invalid={true}` on the field. Screen readers then announce the error when the input gets focus.
:::

## Other kinds of input

Every input type follows the same pattern with small differences:

```jsx
// Numbers arrive as strings. Keep the string in state, convert on use.
<input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
const yearNumber = year === '' ? null : Number(year);

// Checkboxes use checked, not value.
<input type="checkbox" checked={watched} onChange={(e) => setWatched(e.target.checked)} />

// A select is controlled through value on the <select>.
<select value={genre} onChange={(e) => setGenre(e.target.value)}>
  <option value="drama">Drama</option>
  <option value="sci-fi">Sci-fi</option>
</select>
```

The number case catches everyone once: `e.target.value` is always a string, even for `type="number"`, so `year + 1` gives "20161". Keeping the raw string in state also means an empty field stays empty instead of turning into `0`.

## React 19: form actions

Controlled inputs are best when you react to every keystroke. Many forms only matter at the moment of submission, and React 19 added first-class support for those: pass a **function** to the form's `action` prop.

```jsx
function QuickAdd({ onAdd }) {
  function addAction(formData) {
    onAdd(formData.get('title').trim());
  }

  return (
    <form action={addAction}>
      <input name="title" required />
      <button type="submit">Add</button>
    </form>
  );
}
```

React prevents the page reload for you, calls your function with a `FormData` object built from the fields' `name` attributes, and resets the form's uncontrolled fields when the action finishes. The fields aren't controlled at all.

When you need a result from the submission, such as an error message, or a pending state while async work runs, add `useActionState`:

```jsx
import { useActionState } from 'react';

function QuickAdd({ onAdd }) {
  const [error, formAction, isPending] = useActionState(async (prevError, formData) => {
    const title = formData.get('title').trim();
    if (!title) return 'Title is required';
    await onAdd(title); // could be a request to a server
    return null;
  }, null);

  return (
    <form action={formAction}>
      <input name="title" aria-invalid={error ? true : undefined} />
      <button type="submit" disabled={isPending}>{isPending ? 'Adding…' : 'Add'}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

The action receives the previous state and the form data and returns the next state. `isPending` is `true` while it runs. A child component inside the form can also read the pending status with `useFormStatus` from `react-dom`.

Which should you use? A sensible default: controlled inputs when the UI reacts as the user types (counts, live validation, dependent fields); actions when the work happens on submit, especially if it's async. The Watchlist's add form disables its button while the title is blank, so it uses a controlled input, and that's what you'll build in the exercise.

:::why Why not just read the DOM?
You could grab the value with `document.getElementById('title').value` on submit. It works until you need the value anywhere else: a disabled state, a preview, a reset. State gives you one place where the current value lives, and every part of the UI can depend on it.
:::

Next, you'll connect this form to the list. The form and the list are siblings, so the movies have to live in their common parent. That's lifting state up.
