---
summary: Use useEffect to keep React state in sync with systems outside React, write correct dependencies and cleanups, and recognise the many cases where you don't need an Effect at all.
takeaways:
  - An Effect runs after React updates the screen and is for syncing with something outside React, such as the document title, localStorage, timers or subscriptions.
  - The dependency array lists every value from the component the Effect reads; React re-runs the Effect when one of them changes.
  - Return a cleanup function to undo what the Effect did; React runs it before the next run and on unmount.
  - In development, StrictMode runs every Effect, its cleanup, and the Effect again, to prove the cleanup works.
  - If a value can be calculated from props or state, or a change is caused by a specific user action, you don't need an Effect.
further:
  - title: Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects
  - title: You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
  - title: useEffect reference
    url: https://react.dev/reference/react/useEffect
quiz:
  - q: "`visibleMovies` is kept in state and updated with `useEffect(() => setVisibleMovies(movies.filter(…)), [movies, filter])`. What's the better approach?"
    options:
      - text: "Calculate it during render: `const visibleMovies = movies.filter(…)`."
        why: Correct. It's derived data. The Effect version renders once with stale data, then again with the right data, and adds state that can drift.
      - text: Add `visibleMovies` to the dependency array too.
        why: That makes the Effect re-run whenever it sets its own output, inviting a loop. The real fix is to remove the Effect.
      - text: Move the filter into a `setTimeout` inside the Effect.
        why: Delaying the work makes the stale render last longer. Nothing about this needs an Effect.
    answer: 0
  - q: In development, an Effect that logs "subscribed" and has a cleanup that logs "unsubscribed" prints "subscribed, unsubscribed, subscribed" on page load. What's going on?
    options:
      - text: The dependency array is missing, so the Effect runs on every render.
        why: Without an array the Effect re-runs after every re-render, but a plain page load renders once, so that alone can't explain a cleanup straight after the first run.
      - text: The component is rendered twice because of a bug in the parent.
        why: This specific sequence is deliberate, and it only happens in development.
      - text: React 19 always runs Effects twice, in production too.
        why: The extra cycle is a development-only check from StrictMode. Production runs the Effect once.
      - text: StrictMode mounts, unmounts and remounts the component in development to check that the cleanup fully undoes the Effect.
        why: Correct. If your app behaves the same after that cycle, your cleanup is right. If it breaks, the bug would have shown up in production eventually.
    answer: 3
  - q: |
      What's wrong with this Effect?
      ```jsx
      useEffect(() => {
        document.title = `${left} to watch`;
      }, []);
      ```
    options:
      - text: "`document.title` can't be set from React."
        why: Setting the document title is a classic, valid use of an Effect; it's a browser API outside React.
      - text: It reads `left` but doesn't list it, so the title is set once and never updates when `left` changes.
        why: Correct. An empty array means "run after the first render only". List every value the Effect reads, `[left]`, and the lint rule will remind you.
      - text: It needs a cleanup function or React throws.
        why: Cleanup is optional. Many Effects, like this one, have nothing to undo.
      - text: Template literals don't work inside Effects.
        why: An Effect is a normal function; any JavaScript works inside it.
    answer: 1
  - q: After adding a movie, you want to show a "Movie added" message. Where should the code that shows it go?
    options:
      - text: In an Effect that watches `movies` and shows the message whenever it changes.
        why: The list also changes when you remove, toggle or load movies, so the message would appear at the wrong times.
      - text: In an Effect with an empty dependency array.
        why: That runs once after the first render, long before anyone adds a movie.
      - text: In the submit handler, right where the movie is added.
        why: Correct. The message is caused by a specific user action, so it belongs in that action's handler, not in an Effect.
    answer: 2
---

So far, everything in your components has been about React: props in, JSX out, state changes triggering renders. But the Watchlist also needs to touch things React doesn't manage. The browser tab should say "2 to watch", and the list should survive a page refresh by being saved to localStorage. Neither of those is rendering. They're **synchronization**: keeping something outside React in step with your state. That's what Effects are for.

## Your first Effect

```jsx title=src/App.jsx
import { useEffect, useState } from 'react';

export default function App() {
  const [movies, setMovies] = useState(INITIAL_MOVIES);
  const left = movies.filter((m) => !m.watched).length;

  useEffect(() => {
    document.title = `${left} to watch · Watchlist`;
  }, [left]);

  // …render the app
}
```

`useEffect` takes a function and a **dependency array**. React renders your component, updates the screen, and then runs the function. After later renders, it runs the function again only if something in the dependency array changed since last time. Mark a movie watched, `left` goes from 2 to 1, and the title updates. Type in the add form, `left` doesn't change, and the Effect is skipped.

The dependency array has three forms:

| You write | The Effect runs |
|---|---|
| `useEffect(fn, [a, b])` | After the first render and whenever `a` or `b` changes |
| `useEffect(fn, [])` | After the first render only |
| `useEffect(fn)` | After every render |

The rule for what goes in the array is not a choice: **list every value from the component that the Effect reads**, such as props, state, and variables derived from them. The exhaustive-deps lint rule in your Vite project (`react/exhaustive-deps` in Oxlint, `react-hooks/exhaustive-deps` in ESLint) checks this for you. If you leave something out, the Effect keeps using an old value, which is the bug in the third quiz question.

## Cleanup

Some Effects start something that must be stopped: a timer, an event listener, a connection. Return a function that undoes it:

```jsx
useEffect(() => {
  function handleKeyDown(e) {
    if (e.key === '/') focusSearch();
  }
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

React calls the cleanup before running the Effect again and when the component is removed from the screen. Without it, every mount would add another listener, and pressing "/" would fire several times.

:::figure An Effect's lifecycle
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">After the first render and commit, the Effect runs. When a dependency changes, React re-renders, runs the previous cleanup, then runs the Effect again. When the component unmounts, React runs the cleanup one last time.</title>
  <rect class="d-box" x="10" y="70" width="140" height="56" rx="10"/>
  <text class="d-label" x="80" y="103" text-anchor="middle">Render + commit</text>
  <rect class="d-box-primary" x="190" y="70" width="120" height="56" rx="10"/>
  <text class="d-label-strong" x="250" y="103" text-anchor="middle">Effect</text>
  <rect class="d-box" x="350" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="425" y="96" text-anchor="middle">Deps changed:</text>
  <text class="d-label" x="425" y="116" text-anchor="middle">re-render</text>
  <rect class="d-box-warn" x="540" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="615" y="96" text-anchor="middle">Cleanup, then</text>
  <text class="d-label" x="615" y="116" text-anchor="middle">Effect again</text>
  <path class="d-arrow" d="M150 98 L188 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M310 98 L348 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M500 98 L538 98" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M615 126 C 615 190, 425 190, 425 128" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="190" y="170" width="160" height="50" rx="10"/>
  <text class="d-label" x="270" y="200" text-anchor="middle">Unmount: cleanup</text>
  <path class="d-arrow" d="M250 126 L260 168" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="560" y="210" text-anchor="middle">repeats on each change</text>
</svg>
:::

### Why it runs twice in development

With `<StrictMode>` (which your `main.jsx` has), React does something odd in development: it mounts your component, runs the Effects, immediately runs their cleanups as if unmounting, and then runs the Effects again. It's a stress test. If your cleanup correctly undoes the Effect, the app behaves the same, and you see nothing but an extra log line. If it doesn't, for example you forgot to remove a listener, you'll notice now instead of in production. Don't try to prevent the double run; fix the cleanup.

## Saving the Watchlist to localStorage

Persisting state is the textbook Effect: whenever `movies` changes, write it to storage.

```jsx title=src/App.jsx
const STORAGE_KEY = 'watchlist.movies';

function loadMovies() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

export default function App() {
  const [movies, setMovies] = useState(loadMovies);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  }, [movies]);

  // …
}
```

Two details matter. Loading happens in the **initializer**, `useState(loadMovies)`, not in an Effect. Passing the function (not calling it) means React reads storage only for the first render, not on every render, so the saved list appears immediately. Loading in an Effect would render an empty list first, and the save Effect could overwrite your stored movies with that empty array. And `loadMovies` uses `try`/`catch`, because storage can be blocked or contain corrupted data, and a broken value shouldn't crash the whole app.

## You might not need an Effect

Effects are an escape hatch, and the most common Effect bugs come from using one where it isn't needed. Before writing one, check these three cases.

**Calculating something from props or state.** Filtered lists, counts and formatted strings are calculated during render. Storing them in state and syncing with an Effect adds an extra render with stale data and more state that can drift.

**Responding to a user action.** If code should run because the user clicked Add, put it in the submit handler. An Effect that watches `movies` can't tell an add from a remove or a reload.

**Resetting state when a prop changes.** Instead of an Effect that clears a draft when `movieId` changes, give the component a key: `<NotesEditor key={movieId} />`. A new key means a fresh component with fresh state.

What's left are true synchronizations: browser APIs, storage, timers, subscriptions and network connections. That's a short list, and it's the right one.

:::mistake The infinite loop
An Effect that sets state which is also in its own dependency array, `useEffect(() => setCount(count + 1), [count])`, re-runs after every update, forever. The same happens when an Effect that sets state lists an object or array created during render as a dependency, because that's a new value on every render. If the page freezes or React reports "Maximum update depth exceeded", look for an Effect feeding its own dependencies.
:::

:::note Fetching data
You can fetch data in an Effect, but doing it correctly means handling race conditions, caching and loading states yourself. Real projects usually use a framework or a library such as TanStack Query instead. You'll see the options in the last lesson.
:::

That completes the core of React: components, props, state, events and Effects. In the next section you'll put every piece together into the finished Watchlist, style it, and ship it.
