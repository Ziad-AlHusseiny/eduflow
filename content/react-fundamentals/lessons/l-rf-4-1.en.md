---
summary: Assemble the complete Watchlist from small components, with state in one owner, derived values, handlers passed down, and the list saved to localStorage.
takeaways:
  - The finished app keeps two pieces of real state in App, the movies and the filter, and derives everything else during render.
  - All changes to movies happen in a few named handlers in App, which children call through props.
  - Small presentational components that only receive props are easy to read, reuse and test.
  - Isolate browser APIs such as localStorage in a small module with error handling, so components stay simple.
  - Walk through every user flow by hand, including refresh, empty states and keyboard use, before calling it done.
further:
  - title: Thinking in React
    url: https://react.dev/learn/thinking-in-react
  - title: Extracting State Logic into a Reducer
    url: https://react.dev/learn/extracting-state-logic-into-a-reducer
  - title: Window.localStorage (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
quiz:
  - q: You extend the finished Watchlist with a "Clear watched" button that's disabled when nothing is watched, next to the count and the filtered list. How many `useState` calls does App need?
    options:
      - text: Five, one for each of movies, filter, count, visible movies and the button's disabled flag.
        why: The count, the visible list and the disabled flag are all calculated from movies and filter. Storing them would create copies that drift.
      - text: One, an object holding everything.
        why: You could, but movies and filter change independently. Two separate pieces of state are simpler to update.
      - text: Two, for movies and filter. Everything else is derived during render.
        why: Correct. The draft title lives in the form, and everything else is calculated from these two.
    answer: 2
  - q: A user marks a movie watched by clicking its button in `MovieItem`. In what order do things happen?
    options:
      - text: MovieItem sets its own `watched` state, then tells App with an Effect.
        why: MovieItem has no state of its own in this design, and syncing state through an Effect is the pattern to avoid.
      - text: "MovieItem calls `onToggle(id)`, App's handler calls `setMovies`, App re-renders, and the new props flow down to the header and the list."
        why: Correct. Events flow up to the owner, the owner updates state, and the new data flows down to every component that shows it.
      - text: App polls the DOM for checked checkboxes and updates its state.
        why: React never reads state back from the DOM. The DOM is drawn from state, not the other way around.
      - text: MovieItem edits the movie object it received, and React notices the change.
        why: Props are read-only, and React doesn't detect mutations. Nothing would re-render.
    answer: 1
  - q: Why does the lesson put `loadMovies` and `saveMovies` in a separate `storage.js` module?
    options:
      - text: It keeps the browser API, its error handling and the storage key in one place, so components only deal with plain arrays.
        why: Correct. If you later switch to a server or IndexedDB, you change one small file, and App's code stays the same.
      - text: Because React components aren't allowed to call localStorage.
        why: Components can call any browser API in handlers and Effects. Separating it is about clarity, not permission.
      - text: Because localStorage only works in files that end in `.js`.
        why: The file extension makes no difference to browser APIs. `.jsx` files run the same JavaScript.
    answer: 0
  - q: After adding "Clear watched", App has handlers for add, toggle, remove and clear watched, all calling `setMovies` with different logic. When would `useReducer` be worth it?
    options:
      - text: Immediately, because useState shouldn't be used for arrays.
        why: useState handles arrays perfectly well, as this whole app shows.
      - text: Only when the app uses TypeScript.
        why: Reducers work the same in JavaScript and TypeScript; the language isn't the deciding factor.
      - text: Never, because useReducer is deprecated in React 19.
        why: useReducer is a current, fully supported Hook. React 19 deprecated nothing about it.
      - text: When the update logic grows enough that collecting it in one pure function, outside the component, makes it easier to read and test.
        why: Correct. A reducer moves "how state changes" into one function you can test without rendering. With four short handlers, useState is still fine.
    answer: 3
---

Every piece of the Watchlist exists now, scattered across lessons: components from Section 1, props and lists from Section 2, state, forms and Effects from Section 3. This lesson puts them together into one app you'd be comfortable showing in an interview, and explains each decision so you can make the same ones in your next project.

## The shape of the app

Here's the final file layout in your Vite project:

```text
src/
  main.jsx
  App.jsx               state, handlers, derived values
  storage.js            load and save to localStorage
  components/
    Header.jsx          title and "N to watch"
    AddMovieForm.jsx    controlled title input
    FilterBar.jsx       All / To watch / Watched
    MovieList.jsx       list or empty state
    MovieItem.jsx       one movie: toggle and remove
```

Only two files have logic worth testing: `App.jsx`, which owns the state, and `storage.js`. Every component in `components/` receives props and returns JSX. That's the split you want: a thin layer of state and logic at the top, and a wide layer of simple pieces underneath.

## Storage, isolated

Start with the module that talks to the browser:

```js title=src/storage.js
const KEY = 'watchlist.movies';

export function loadMovies() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function saveMovies(movies) {
  try {
    localStorage.setItem(KEY, JSON.stringify(movies));
  } catch {
    // Storage full or blocked: the app still works, it just won't remember.
  }
}
```

localStorage can throw (blocked in some privacy modes, full quota) and can hold anything, including data from an older version of your app. Checking `Array.isArray` and catching errors means a bad value gives you an empty list instead of a white screen. Components never see any of this.

## App: the owner

```jsx title=src/App.jsx
import { useEffect, useState } from 'react';
import { loadMovies, saveMovies } from './storage.js';
import Header from './components/Header.jsx';
import AddMovieForm from './components/AddMovieForm.jsx';
import FilterBar from './components/FilterBar.jsx';
import MovieList from './components/MovieList.jsx';

export default function App() {
  const [movies, setMovies] = useState(loadMovies);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    saveMovies(movies);
  }, [movies]);

  const left = movies.filter((m) => !m.watched).length;
  const visible = movies.filter((m) =>
    filter === 'all' ? true : filter === 'watched' ? m.watched : !m.watched,
  );

  function handleAdd(title) {
    setMovies([...movies, { id: crypto.randomUUID(), title, watched: false }]);
  }

  function handleToggle(id) {
    setMovies(movies.map((m) => (m.id === id ? { ...m, watched: !m.watched } : m)));
  }

  function handleRemove(id) {
    setMovies(movies.filter((m) => m.id !== id));
  }

  return (
    <main className="app">
      <Header left={left} total={movies.length} />
      <AddMovieForm onAdd={handleAdd} />
      <FilterBar value={filter} onChange={setFilter} />
      <MovieList movies={visible} onToggle={handleToggle} onRemove={handleRemove} />
    </main>
  );
}
```

Read it top to bottom and you know the whole app. Two pieces of state. One Effect, for the one thing outside React. Two derived values. Three handlers, each one line, each a named action a user can take. Then the layout. When a bug report comes in ("removing a movie brings it back after refresh"), you know exactly which lines could be involved.

The ids come from `crypto.randomUUID()`, created once in `handleAdd` and stored with the movie, exactly as the keys lesson recommended. It works on `localhost` and over HTTPS, which covers development and Vercel.

## The pieces underneath

The list and item components are short because they only display props and forward events:

```jsx title=src/components/MovieList.jsx
import MovieItem from './MovieItem.jsx';

export default function MovieList({ movies, onToggle, onRemove }) {
  if (movies.length === 0) {
    return <p className="empty">No movies here yet.</p>;
  }

  return (
    <ul className="movie-list">
      {movies.map((movie) => (
        <MovieItem key={movie.id} movie={movie} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}
```

```jsx title=src/components/MovieItem.jsx
export default function MovieItem({ movie, onToggle, onRemove }) {
  return (
    <li className={movie.watched ? 'movie watched' : 'movie'}>
      <span className="title">{movie.title}</span>
      <button aria-pressed={movie.watched} onClick={() => onToggle(movie.id)}>
        {movie.watched ? 'Watched' : 'Mark watched'}
      </button>
      <button aria-label={`Remove ${movie.title}`} onClick={() => onRemove(movie.id)}>
        Remove
      </button>
    </li>
  );
}
```

`AddMovieForm` and `FilterBar` are the versions you built in earlier lessons, and `Header` now receives the two numbers it shows instead of the whole list. The Remove button gets an `aria-label` that names the movie, because a screen reader user tabbing through ten "Remove" buttons needs to know which one they're on.

:::figure One click, start to finish
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">Clicking Mark watched in MovieItem calls onToggle, which runs handleToggle in App. setMovies triggers a re-render; new props flow to Header and MovieList, and the save Effect writes to localStorage.</title>
  <rect class="d-box" x="10" y="30" width="150" height="56" rx="10"/>
  <text class="d-label" x="85" y="54" text-anchor="middle">MovieItem</text>
  <text class="d-code" x="85" y="74" text-anchor="middle">onToggle(id)</text>
  <rect class="d-box-primary" x="200" y="30" width="170" height="56" rx="10"/>
  <text class="d-label-strong" x="285" y="54" text-anchor="middle">App</text>
  <text class="d-code" x="285" y="74" text-anchor="middle">setMovies(…)</text>
  <rect class="d-box" x="410" y="30" width="130" height="56" rx="10"/>
  <text class="d-label" x="475" y="63" text-anchor="middle">Re-render</text>
  <rect class="d-box-success" x="580" y="10" width="110" height="44" rx="10"/>
  <text class="d-label" x="635" y="37" text-anchor="middle">Header</text>
  <rect class="d-box-success" x="580" y="64" width="110" height="44" rx="10"/>
  <text class="d-label" x="635" y="91" text-anchor="middle">MovieList</text>
  <rect class="d-box-accent" x="410" y="150" width="200" height="56" rx="10"/>
  <text class="d-label" x="510" y="174" text-anchor="middle">Effect after commit</text>
  <text class="d-code" x="510" y="194" text-anchor="middle">saveMovies(movies)</text>
  <path class="d-arrow" d="M160 58 L198 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M370 58 L408 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M540 50 L578 34" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M540 66 L578 84" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M475 86 L490 148" marker-end="url(#arrow)"/>
</svg>
:::

## Why this structure holds up

Look at what each component needs in order to be checked. `MovieList` needs an array and two functions. Give it an empty array and it must show "No movies here yet."; give it two movies and it must render two items. `MovieItem` needs one movie, and clicking Remove must call `onRemove` with that movie's id. None of them need localStorage, a real form or the rest of the app. That's what "small, testable pieces" means in practice: each piece has a few inputs and a few visible outputs.

When you add automated tests later (Vitest with React Testing Library is the common pairing for Vite projects), these are the tests you'll write first. And even before you have tests, the structure pays off: when the empty state looks wrong, you open one 10-line file, not a 300-line component.

## When the handlers grow

Three one-line handlers are easy to follow. If you add editing, reordering and undo, `App` fills up with update logic. That's the moment to consider `useReducer`: it moves every "how movies change" rule into one pure function, `moviesReducer(movies, action)`, that you can test without rendering anything. Don't start there. Start with `useState`, and reach for a reducer when several handlers update the same state in related ways and the component gets hard to read.

:::mistake Calling it done after the happy path
You add a movie, it appears, you're done. Then a user refreshes and loses everything, or presses Enter in an empty field and gets a blank row. Before shipping, walk every flow by hand: add with the mouse and with Enter; try an empty and a space-only title; toggle, remove and filter; refresh the page; empty the list and check the message; tab through the whole app with the keyboard alone.
:::

:::tip Commit at this point
`git init`, then `git add .` and `git commit -m "Watchlist: add, toggle, remove, filter, persist"`. You'll push this repository to GitHub before deploying, and it's good practice to commit a working state before you start restyling it.
:::

The Watchlist works. It doesn't look like much yet, which is the next lesson: styling it with Tailwind CSS.
