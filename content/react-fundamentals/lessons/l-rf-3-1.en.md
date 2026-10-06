---
summary: Give components memory with useState, understand state as a per-render snapshot, use updater functions for successive updates, and replace arrays and objects instead of mutating them.
takeaways:
  - "`useState` returns the current value and a setter; calling the setter schedules a re-render with the new value."
  - Each render sees a fixed snapshot of state, so reading state right after setting it still gives the old value.
  - Use an updater function, `setCount((c) => c + 1)`, when the next value depends on the previous one.
  - Never mutate state; create new arrays and objects with spread, `map` and `filter` so React notices the change.
  - Call Hooks at the top level of a component, never inside conditions, loops or nested functions.
further:
  - title: "State: A Component's Memory"
    url: https://react.dev/learn/state-a-components-memory
  - title: State as a Snapshot
    url: https://react.dev/learn/state-as-a-snapshot
  - title: Updating Arrays in State
    url: https://react.dev/learn/updating-arrays-in-state
  - title: useState reference
    url: https://react.dev/reference/react/useState
quiz:
  - q: |
      `count` starts at 0. What does the button show after one click?
      ```jsx
      function handleClick() {
        setCount(count + 1);
        setCount(count + 1);
        setCount(count + 1);
      }
      ```
    options:
      - text: "3"
        why: Each call reads `count` from the same render, where it's 0. All three calls ask for 0 + 1.
      - text: "0"
        why: The state does change. It just changes to 1, not 3.
      - text: An error, because you can only call a setter once per handler.
        why: You can call setters as often as you like. React batches them and re-renders once.
      - text: "1"
        why: Correct. `count` is a snapshot of 0 for the whole handler, so all three calls set 1. Use `setCount((c) => c + 1)` to stack updates.
    answer: 3
  - q: Why doesn't this toggle work? `let watched = false;` inside the component, and the button's handler does `watched = !watched;`.
    options:
      - text: Booleans can't be toggled with `!` in React.
        why: The `!` operator works fine. The problem is where the value lives and what triggers a render.
      - text: The handler needs to return the new value.
        why: Event handlers' return values are ignored. Something has to tell React to render again.
      - text: Changing a local variable doesn't trigger a re-render, and the next render would reset it to false anyway.
        why: Correct. Local variables don't persist between renders and React doesn't watch them. `useState` solves both problems.
      - text: "`let` should be `var`."
        why: The keyword doesn't matter. Any local variable is recreated on every render.
    answer: 2
  - q: Which correctly marks one movie as watched in `movies` state?
    options:
      - text: "`setMovies(movies.map((m) => (m.id === id ? { ...m, watched: true } : m)));`"
        why: Correct. `map` builds a new array, and the changed movie is a new object. Unchanged movies are reused.
      - text: "`movies.find((m) => m.id === id).watched = true; setMovies(movies);`"
        why: This mutates the existing object and passes the same array back. React compares with Object.is, sees no change and may skip the render.
      - text: "`setMovies(movies.push({ id, watched: true }));`"
        why: "`push` mutates the array and returns the new length, so state becomes a number."
      - text: "`movies[0].watched = true;`"
        why: Mutating state never tells React anything changed, and it edits the wrong movie unless it happens to be first.
    answer: 0
  - q: "Inside a click handler you call `setTitle('Dune')` and then `console.log(title)` on the next line. The old title was 'Arrival'. What's logged?"
    options:
      - text: "'Dune'"
        why: Setting state doesn't change the variable in the current render. It asks React for a new render where `title` will be 'Dune'.
      - text: "'Arrival'"
        why: Correct. `title` is a constant in this render's snapshot. The new value appears in the next render.
      - text: "undefined"
        why: The variable still holds this render's value, which is 'Arrival'.
    answer: 1
---

Click a "Mark as watched" button in a plain function component and nothing happens. Here's the code most people write first:

```jsx
export default function MovieItem() {
  let watched = false;

  function handleClick() {
    watched = !watched;
  }

  return (
    <button onClick={handleClick}>
      {watched ? 'Watched' : 'Mark as watched'}
    </button>
  );
}
```

Two things go wrong. Changing a local variable doesn't tell React anything happened, so it never renders again. And even if something else caused a render, `let watched = false` would run again and reset the value, because a component is a function and its local variables start fresh on every call. A component needs two things: memory that survives between renders, and a way to ask React to render again. That's state.

## `useState`

```jsx title=src/components/MovieItem.jsx
import { useState } from 'react';

export default function MovieItem({ title }) {
  const [watched, setWatched] = useState(false);

  return (
    <li>
      {title}
      <button aria-pressed={watched} onClick={() => setWatched(!watched)}>
        {watched ? 'Watched' : 'Mark as watched'}
      </button>
    </li>
  );
}
```

`useState(false)` declares one piece of state with an initial value of `false`. It returns a pair, which you destructure and name: the current value, and a setter function. The `[thing, setThing]` naming is a convention everyone follows; stick to it.

When you call `setWatched(true)`, React stores the new value and schedules a re-render. It calls `MovieItem` again, and this time `useState` returns `true`. Your JSX is calculated from that, and React updates the DOM to match.

State belongs to a component **instance**, not to the function. Render `<MovieItem />` three times and you get three independent `watched` values. Clicking one doesn't affect the others.

:::why Functions starting with "use" are Hooks
`useState` is a Hook: a special function that lets components use React features. Hooks rely on being called in the same order on every render, which is how React knows which state is which. So call them at the top level of your component: never inside an `if`, a loop or a nested function. The linter in your Vite project checks the Rules of Hooks (Oxlint's `react/rules-of-hooks`, or `eslint-plugin-react-hooks` if you chose ESLint) and will flag mistakes for you.
:::

## Every render is a snapshot

This is the idea that makes state click. When React calls your component, it hands you the state **for that render**. Everything in that render, the JSX, the event handlers, all of it, sees those values. Setting state doesn't change the variable you already have; it requests a new render with a new value.

:::figure Setting state triggers a new render with a new snapshot
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">Render 1 sees watched equals false. A click calls setWatched(true), which schedules render 2. Render 2 sees watched equals true, and React commits the changed DOM.</title>
  <rect class="d-box" x="20" y="60" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="105" y="92" text-anchor="middle">Render 1</text>
  <text class="d-code" x="105" y="118" text-anchor="middle">watched = false</text>
  <rect class="d-box-warn" x="265" y="60" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="350" y="92" text-anchor="middle">Click</text>
  <text class="d-code" x="350" y="118" text-anchor="middle">setWatched(true)</text>
  <rect class="d-box-success" x="510" y="60" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="595" y="92" text-anchor="middle">Render 2</text>
  <text class="d-code" x="595" y="118" text-anchor="middle">watched = true</text>
  <path class="d-arrow" d="M190 100 L263 100" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M435 100 L508 100" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="227" y="175" text-anchor="middle">user acts</text>
  <text class="d-label-muted" x="472" y="175" text-anchor="middle">React re-renders</text>
  <text class="d-label-muted" x="350" y="205" text-anchor="middle">Each render keeps its own values; nothing changes mid-render</text>
</svg>
:::

That's why this surprises people:

```jsx
const [count, setCount] = useState(0);

function addThree() {
  setCount(count + 1); // count is 0 → asks for 1
  setCount(count + 1); // count is still 0 → asks for 1
  setCount(count + 1); // still 0 → 1
}
```

All three calls read the same snapshot, so the result is 1, not 3. When the next value depends on the previous one, pass an **updater function** instead of a value:

```jsx
function addThree() {
  setCount((c) => c + 1); // 0 → 1
  setCount((c) => c + 1); // 1 → 2
  setCount((c) => c + 1); // 2 → 3
}
```

React queues the updaters and runs them in order, each receiving the result of the one before. You don't need updaters everywhere; `setWatched(!watched)` in a click handler is fine. Use them when you set the same state more than once in a handler, or in code that runs later, such as a timer.

## Arrays and objects: replace, don't mutate

The Watchlist keeps an array of movie objects in state. React decides whether state changed by comparing the old and new value with `Object.is`. If you change an array in place and pass the same array back, React sees the same reference and may skip the render entirely.

So treat state as read-only and build new values:

```jsx
const [movies, setMovies] = useState(INITIAL_MOVIES);

// Add: a new array with everything plus one more
setMovies([...movies, { id: crypto.randomUUID(), title: 'Dune', watched: false }]);

// Remove: a new array without one item
setMovies(movies.filter((m) => m.id !== id));

// Update one: a new array, with a new object for the changed item
setMovies(movies.map((m) => (m.id === id ? { ...m, watched: !m.watched } : m)));
```

These three lines (spread to add, `filter` to remove, `map` with a spread to update) cover most of the state updates you'll ever write for lists. Objects work the same way: `setFilters({ ...filters, year: 2024 })`.

:::mistake Mutating state
`movies.push(newMovie); setMovies(movies);` changes the array React is holding and hands it back unchanged as far as `Object.is` is concerned. The screen doesn't update, or updates later at a random moment when something else re-renders. If you see stale UI after an update, look for `push`, `splice`, `sort` or a direct assignment like `movie.watched = true`.
:::

## Choosing the initial value

The argument to `useState` is only used on the first render. Later renders ignore it. If computing the initial value is expensive, such as reading and parsing saved data, pass a function instead, `useState(() => loadMovies())`, and React calls it only on the first render instead of on every render. You'll use exactly that to load the Watchlist from localStorage in Section 4.

Now your components can remember things. Next, you'll look closely at the events that change state: click, keyboard and the event object itself.
