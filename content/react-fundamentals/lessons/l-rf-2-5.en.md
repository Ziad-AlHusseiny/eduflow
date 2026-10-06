---
summary: Render lists from arrays with map, filter and sort them without mutating data, and choose keys that keep each item's identity and state correct between renders.
takeaways:
  - Turn an array of data into an array of elements with `map`, and put the `key` on the outermost element the callback returns.
  - A key tells React which item is which between renders, so it must be unique among siblings and stable over time.
  - Use an id from your data as the key; create ids when items are created, never during render.
  - Index keys break when the list can be reordered, filtered or inserted into, because state sticks to the position instead of the item.
  - Filter and sort copies of your data while rendering; `sort` changes the array in place, so use `toSorted` or sort a copy.
further:
  - title: Rendering Lists
    url: https://react.dev/learn/rendering-lists
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
  - title: Array.prototype.toSorted() on MDN
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted
quiz:
  - q: |
      Where does the key go?
      ```jsx
      function MovieList({ movies }) {
        return (
          <ul>
            {movies.map((movie) => (
              <MovieItem movie={movie} />
            ))}
          </ul>
        );
      }
      ```
    options:
      - text: On the `<li>` inside MovieItem, as `<li key={movie.id}>`.
        why: React needs keys on the elements in the array you return from `map`. Inside MovieItem there's only one `<li>`, so a key there does nothing.
      - text: On the `<ul>`, as `<ul key="movies">`.
        why: The `<ul>` isn't one of many siblings. The items inside it are what React has to tell apart.
      - text: On MovieItem itself, as `<MovieItem key={movie.id} movie={movie} />`.
        why: Correct. The key belongs on the outermost element returned from the `map` callback, which here is the component.
      - text: Nowhere, because components get automatic keys.
        why: React falls back to the index and warns in development. That fallback is exactly what causes bugs when the list changes.
    answer: 2
  - q: Each movie row has a text input for a note. You type "Loved it" next to Arrival, then add a new movie to the top of the list. With `key={index}`, where does "Loved it" end up?
    options:
      - text: Still next to Arrival.
        why: That's what you'd get with `key={movie.id}`. With index keys React matches rows by position, not by movie.
      - text: Next to the new movie at the top, because it now has index 0, the key Arrival's row had.
        why: Correct. React reuses the row with key 0, including its input's DOM state, for whatever is now at position 0.
      - text: It disappears, because every row is re-created.
        why: React doesn't re-create rows whose keys still exist. It reuses them, which is precisely why the note moves.
      - text: React throws a duplicate key error.
        why: Indices are unique, so there's no duplicate. The bug is silent, which is what makes it dangerous.
    answer: 1
  - q: Which key is a good choice for movies the user adds through a form?
    options:
      - text: "`key={Math.random()}` in the map callback."
        why: A new key on every render makes React destroy and re-create every row each time, losing focus and state.
      - text: "`key={movie.title}`"
        why: Titles aren't unique; there are several films called "Dune". Two siblings with the same key confuse React.
      - text: "`key={index}`, because the user only adds movies."
        why: Users will also remove, filter and sort. Index keys break as soon as items move relative to each other.
      - text: An id created once with `crypto.randomUUID()` when the movie is added, and stored on the movie object.
        why: Correct. The id is created with the data, stays the same for the movie's lifetime, and is unique.
    answer: 3
  - q: "`movies` comes from state. What's the problem with `const sorted = movies.sort((a, b) => b.year - a.year);` in the render code?"
    options:
      - text: "`sort` reorders `movies` in place, so you're mutating state during render."
        why: Correct. Use `movies.toSorted(…)` or `[...movies].sort(…)` to sort a copy and leave state untouched.
      - text: "`sort` can't compare numbers."
        why: With a compare function like `(a, b) => b.year - a.year`, sort orders numbers correctly.
      - text: Sorting must happen in an effect, not during render.
        why: Calculating a derived value during render is exactly right. The issue is changing the original array.
    answer: 0
---

The Watchlist is a list. So is a feed, a table of orders, a set of search results, a menu. Most UI is lists of things built from arrays of data, and React's approach is the one you'd guess from JavaScript: transform the array of data into an array of elements.

## From data to elements with `map`

```jsx title=src/components/MovieList.jsx
export default function MovieList({ movies }) {
  return (
    <ul>
      {movies.map((movie) => (
        <li key={movie.id}>
          {movie.title} ({movie.year})
        </li>
      ))}
    </ul>
  );
}
```

`map` returns an array of `<li>` elements, and React renders arrays by rendering each item in order. There's no special loop syntax to learn; it's the array method you already know.

Filtering and sorting are the same idea: prepare the array, then map it. Do it during render, from the data you have. The visible list is derived, so it doesn't need to be state.

```js run
const movies = [
  { id: 'a1', title: 'Arrival', year: 2016, watched: true },
  { id: 'p2', title: 'Past Lives', year: 2023, watched: false },
  { id: 'd3', title: 'Dune: Part Two', year: 2024, watched: false },
];

const toWatch = movies
  .filter((m) => !m.watched)
  .toSorted((a, b) => b.year - a.year);

console.log(toWatch.map((m) => m.title)); // ["Dune: Part Two", "Past Lives"]
console.log(movies[0].title);             // Arrival (the original order is untouched)
```

`toSorted` returns a sorted copy and is supported in every current browser. The older `sort` reorders the array **in place**. Called on state or props, that silently mutates data you don't own. If you need to support older browsers, copy first: `[...movies].sort(…)`.

## What keys are for

Every element in a list needs a `key` prop, and React warns in the console when one is missing. The reason becomes clear when the list changes.

When React re-renders a list, it has the old array of elements and the new one. It needs to match them up: which new element is the same item as which old one? That matters because each item may have **state**, such as a half-typed note in an input, a focused button or an open menu, and that state must stay with the right item.

The key is the item's name tag. React matches old and new elements by key. Same key: it's the same item, so React keeps its DOM and state and updates what changed. New key: a new item, so React creates it. Missing key: the item was removed, so React destroys it.

:::figure Index keys versus id keys after inserting at the top
<svg viewBox="0 0 700 290" role="img" aria-labelledby="t1">
  <title id="t1">Before: Arrival has a note. After adding Dune at the top with index keys, key 0 now points to Dune, so the note jumps to Dune. With id keys, the note stays with Arrival.</title>
  <text class="d-label-strong" x="110" y="24" text-anchor="middle">Before</text>
  <rect class="d-box" x="20" y="40" width="180" height="40" rx="8"/>
  <text class="d-label" x="110" y="65" text-anchor="middle">0 · Arrival · "Loved it"</text>
  <rect class="d-box" x="20" y="90" width="180" height="40" rx="8"/>
  <text class="d-label" x="110" y="115" text-anchor="middle">1 · Past Lives</text>
  <text class="d-label-strong" x="350" y="24" text-anchor="middle">key={index}</text>
  <rect class="d-box-warn" x="255" y="40" width="190" height="40" rx="8"/>
  <text class="d-label" x="350" y="65" text-anchor="middle">0 · Dune · "Loved it"</text>
  <rect class="d-box" x="255" y="90" width="190" height="40" rx="8"/>
  <text class="d-label" x="350" y="115" text-anchor="middle">1 · Arrival</text>
  <rect class="d-box" x="255" y="140" width="190" height="40" rx="8"/>
  <text class="d-label" x="350" y="165" text-anchor="middle">2 · Past Lives</text>
  <text class="d-label-strong" x="590" y="24" text-anchor="middle">key={movie.id}</text>
  <rect class="d-box" x="495" y="40" width="190" height="40" rx="8"/>
  <text class="d-label" x="590" y="65" text-anchor="middle">d3 · Dune</text>
  <rect class="d-box-success" x="495" y="90" width="190" height="40" rx="8"/>
  <text class="d-label" x="590" y="115" text-anchor="middle">a1 · Arrival · "Loved it"</text>
  <rect class="d-box" x="495" y="140" width="190" height="40" rx="8"/>
  <text class="d-label" x="590" y="165" text-anchor="middle">p2 · Past Lives</text>
  <path class="d-arrow" d="M200 60 L253 60" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M200 60 C 330 220, 420 120, 493 110" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="230" text-anchor="middle">Same key, same row: state follows the key</text>
  <text class="d-label-muted" x="350" y="256" text-anchor="middle">Index keys follow position; id keys follow the movie</text>
</svg>
:::

## Choosing a key

A good key is **unique among siblings** and **stable**: the same item has the same key on every render.

- **Use an id from your data.** Database rows and API objects already have one.
- **Create ids when items are created.** For movies added through a form, generate the id in the handler that adds them: `{ id: crypto.randomUUID(), title, year }`. It's stored on the object and never changes.
- **Never generate keys during render.** `key={Math.random()}` or `key={crypto.randomUUID()}` inside `map` produces new keys every render. React treats every row as brand new, tears down the DOM and loses input focus and state each time you type.
- **Don't use content that isn't unique.** Titles repeat; there are several films called "Dune".

Keys only need to be unique among siblings in the same list. Two different lists can use the same ids.

:::mistake Index as key on a list that changes
`movies.map((movie, index) => <li key={index}>…)` silences the warning and works until the list changes order. Insert at the top, delete from the middle, sort or filter, and React matches rows by position. State, focus and uncontrolled input values stay at the position while the data moves. Index keys are only safe for static lists that never reorder, like a fixed set of footer links.
:::

## Keys on components and fragments

The key goes on the outermost element returned from the `map` callback. When that's a component, put it on the component:

```jsx
{movies.map((movie) => (
  <MovieItem key={movie.id} movie={movie} />
))}
```

`MovieItem` can't read `key`; React uses it and doesn't pass it down. If the component needs the id, pass it separately as a prop.

When each item renders several siblings without a wrapper, use the long form of a fragment, which accepts a key:

```jsx
import { Fragment } from 'react';

{movies.map((movie) => (
  <Fragment key={movie.id}>
    <dt>{movie.title}</dt>
    <dd>{movie.year}</dd>
  </Fragment>
))}
```

The short `<>…</>` syntax can't take a key.

:::tip Keys can reset a component on purpose
Because a new key means a new component, changing a key forces React to start over. `<MovieDetails key={selectedId} … />` gives each selected movie a fresh details panel with fresh state. It's a handy trick you'll see again.
:::

You can now render any list correctly. That completes the static Watchlist. In the next section, it starts to move: state lets the list change when the user clicks, types and submits.
