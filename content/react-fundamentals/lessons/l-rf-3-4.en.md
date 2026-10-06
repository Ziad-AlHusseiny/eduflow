---
summary: Share state between sibling components by moving it to their closest common parent, passing values down and change handlers up, so the app keeps a single source of truth.
takeaways:
  - When two components need the same changing data, move the state to their closest common parent and pass it down as props.
  - Children change shared state by calling handler props such as `onAdd` or `onFilterChange`; data flows down and events flow up.
  - Keep each piece of state as low in the tree as possible but as high as necessary.
  - Don't copy a prop into state with `useState(prop)`; the copy ignores later changes. Use the prop directly or derive from it.
further:
  - title: Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
quiz:
  - q: "`FilterBar` keeps `const [filter, setFilter] = useState('all')`. `MovieList`, its sibling, needs to show only the movies matching the filter. What's the fix?"
    options:
      - text: Have FilterBar write the filter to a global variable that MovieList reads.
        why: Changing a module variable doesn't re-render anything, so MovieList would show stale results.
      - text: Give MovieList its own copy of the filter state and keep both in sync with an effect.
        why: Two copies of the same state that must be synced is exactly the problem lifting state solves. It's more code and more bugs.
      - text: Move the filter state into their common parent, pass `filter` to both, and pass `setFilter` (or a handler) to FilterBar.
        why: Correct. One owner, one source of truth. FilterBar shows and changes the value; MovieList reads it.
      - text: Make MovieList a child of FilterBar so it can read the state.
        why: Rearranging the UI tree to fit data is backwards, and the header that counts movies would still be left out.
    answer: 2
  - q: Which piece of Watchlist state should stay inside `AddMovieForm` rather than being lifted to `App`?
    options:
      - text: The text currently typed in the title field.
        why: Correct. Only the form uses the draft text. App only needs the finished movie, which it gets through `onAdd`.
      - text: The list of movies.
        why: The header, the list and the form all depend on the movies, so they belong in App.
      - text: The current filter.
        why: Both the filter buttons and the list need it, so it lives in their common parent.
    answer: 0
  - q: |
      `MovieTitle` shows a title it receives as a prop. When the parent renames the movie, the child keeps showing the old title. Why?
      ```jsx
      function MovieTitle({ title }) {
        const [text] = useState(title);
        return <h2>{text}</h2>;
      }
      ```
    options:
      - text: Props can't contain strings that change.
        why: Props can change on every render. This component ignores the change.
      - text: The parent forgot to use a key.
        why: A key change would remount it and hide the bug, but the bug is the copied state, not the parent.
      - text: The h2 needs an `onChange` handler.
        why: Headings don't have change events. The issue is where the text comes from.
      - text: "`useState` only uses its argument on the first render, so `text` is a frozen copy. Render `{title}` directly."
        why: Correct. The initial value is read once. If the component doesn't need to edit the value, it shouldn't copy it into state.
    answer: 3
  - q: In the Watchlist, data flows down as props and changes flow up through callbacks. What's the main benefit of this one-way flow?
    options:
      - text: It makes React render faster than two-way binding.
        why: Performance isn't the point; the benefit is about understanding and debugging your app.
      - text: To find out why something shows a value, you follow props up to the one component that owns the state.
        why: Correct. Every piece of state has one owner, and only that owner changes it, so bugs have one place to look.
      - text: It removes the need for event handlers.
        why: Callbacks are event handlers passed down. One-way flow depends on them.
    answer: 1
---

You now have an add-movie form, a movie list and filter buttons. Each works alone. Put them on one screen and they don't talk to each other: the form can't add to a list that lives in another component, and the list doesn't know which filter button is pressed. Components can't reach into each other's state. That's deliberate, and the fix is a pattern you'll use in every React app you build.

## The problem: siblings can't share

Here's the filter bar as you might first write it:

```jsx
function FilterBar() {
  const [filter, setFilter] = useState('all');
  return (
    <div>
      <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
      <button aria-pressed={filter === 'to-watch'} onClick={() => setFilter('to-watch')}>To watch</button>
      <button aria-pressed={filter === 'watched'} onClick={() => setFilter('watched')}>Watched</button>
    </div>
  );
}
```

The buttons highlight correctly, but `MovieList` is a sibling. It has no access to `filter`, so it shows everything no matter what you click. State is private to the component that declares it.

## The fix: lift it to the common parent

Find the closest component that's a parent of everything that needs the state. For the filter, that's `App`, the parent of both `FilterBar` and `MovieList`. Move the state there, then:

1. pass the **value** down to everyone who reads it, and
2. pass a **function** down to everyone who changes it.

```jsx title=src/App.jsx
export default function App() {
  const [movies, setMovies] = useState(INITIAL_MOVIES);
  const [filter, setFilter] = useState('all');

  const visible = movies.filter((m) =>
    filter === 'all' ? true : filter === 'watched' ? m.watched : !m.watched,
  );

  function handleAdd(title) {
    setMovies([...movies, { id: crypto.randomUUID(), title, watched: false }]);
  }

  return (
    <main>
      <Header movies={movies} />
      <AddMovieForm onAdd={handleAdd} />
      <FilterBar value={filter} onChange={setFilter} />
      <MovieList movies={visible} />
    </main>
  );
}

function FilterBar({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter movies">
      <button aria-pressed={value === 'all'} onClick={() => onChange('all')}>All</button>
      <button aria-pressed={value === 'to-watch'} onClick={() => onChange('to-watch')}>To watch</button>
      <button aria-pressed={value === 'watched'} onClick={() => onChange('watched')}>Watched</button>
    </div>
  );
}
```

`FilterBar` no longer has state. It displays `value` and reports clicks through `onChange`. A component like this is called **controlled**: its parent decides what it shows. It's now also easier to test and reuse, because everything it does is visible in its props.

:::figure State lives in App; props flow down, events flow up
<svg viewBox="0 0 700 280" role="img" aria-labelledby="t1">
  <title id="t1">App owns movies and filter state. It passes movies to Header, onAdd to AddMovieForm, value and onChange to FilterBar, and the visible movies to MovieList. AddMovieForm and FilterBar call their callbacks to send changes back up to App.</title>
  <rect class="d-box-primary" x="230" y="16" width="240" height="64" rx="12"/>
  <text class="d-label-strong" x="350" y="42" text-anchor="middle">App</text>
  <text class="d-code" x="350" y="66" text-anchor="middle">movies · filter</text>
  <rect class="d-box" x="10" y="190" width="150" height="50" rx="10"/>
  <text class="d-label" x="85" y="220" text-anchor="middle">Header</text>
  <rect class="d-box" x="180" y="190" width="160" height="50" rx="10"/>
  <text class="d-label" x="260" y="220" text-anchor="middle">AddMovieForm</text>
  <rect class="d-box" x="360" y="190" width="150" height="50" rx="10"/>
  <text class="d-label" x="435" y="220" text-anchor="middle">FilterBar</text>
  <rect class="d-box-accent" x="530" y="190" width="160" height="50" rx="10"/>
  <text class="d-label" x="610" y="220" text-anchor="middle">MovieList</text>
  <path class="d-arrow" d="M280 80 L95 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 80 L605 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M330 80 L285 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M370 80 L420 188" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M245 190 L300 84" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M455 190 L400 84" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="140" y="130" text-anchor="middle">props down</text>
  <text class="d-label-muted" x="350" y="268" text-anchor="middle">dashed: onAdd / onChange calls back up</text>
</svg>
:::

## Data down, events up

Notice the shape. Data flows **down** the tree as props: `movies`, `filter`, `visible`. Changes flow **up** as function calls: the form calls `onAdd`, the filter bar calls `onChange`. Only `App` ever calls `setMovies` or `setFilter`.

That's the payoff. If the list ever shows the wrong movies, there's exactly one place that decides what's in it. You follow the props up to their owner and read the code that changes them. Compare that with an app where any component can poke any other: a bug could come from anywhere.

Look at what's not state, too. `visible` is calculated from `movies` and `filter` on every render, and `Header` derives its count from `movies`. Lifting state doesn't mean lifting everything; it means one owner for each piece of real state, and everything else derived from it.

## Signs you need to lift

You rarely plan every piece of state perfectly up front. You discover the need to lift while building, and the signs are consistent:

- Two components show values that should match but sometimes don't.
- You're about to write an effect whose only job is to copy one component's state into another's.
- A child needs to change something a sibling displays.

Each of these means the same data has two owners, or the owner is too low in the tree. Lifting is a small, mechanical refactor: cut the `useState` line, paste it into the parent, and replace the old state in the child with props.

## As low as possible, as high as necessary

Lifting has a cost: the owner re-renders when the state changes, along with its children, and props have to travel further. So don't lift everything to `App` by reflex.

The text being typed into the title field is a good example. Only `AddMovieForm` cares about it while you type. `App` only needs the finished title, which it gets from `onAdd`. So the draft stays in the form. If later some other component needed to preview the draft, you'd lift it then.

When state needs to be read by components far apart in the tree, passing it through every level becomes tedious. You saw one fix in the composition lesson (pass elements down), and React's **context** is the other. For the Watchlist, a few props are all you need.

:::mistake Copying props into state
`const [title, setTitle] = useState(props.title)` looks like a way to "receive" data, but `useState` only reads its argument on the first render. When the parent passes a new title, the child keeps the old copy. If the component only displays the value, use the prop directly. If it needs an editable draft that starts from the prop, name it clearly (`initialTitle`) so everyone knows later changes are ignored.
:::

Your Watchlist now has one source of truth and three components that read and change it. Next, you'll sync that state with something outside React, the browser tab's title and localStorage, using effects.
