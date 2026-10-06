---
summary: Show, hide and switch UI based on data using early returns, the ternary operator and &&, while avoiding the stray "0" bug and unreadable nested conditions.
takeaways:
  - Use an early `return` for whole alternative screens, a ternary for one of two things, and `&&` for something or nothing.
  - A component can return `null` to render nothing at all.
  - "`{count && <List />}` renders a literal 0 when count is 0; compare explicitly with `count > 0 &&`."
  - Conditions can drive attributes too, such as `className`, `disabled` and `aria-pressed`.
  - Not rendering a component removes it and its state; hiding it with CSS keeps both.
further:
  - title: Conditional Rendering
    url: https://react.dev/learn/conditional-rendering
  - title: Logical AND (&&) on MDN
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND
quiz:
  - q: "`movies` is an empty array. What does `<div>{movies.length && <MovieList movies={movies} />}</div>` show?"
    options:
      - text: Nothing at all.
        why: That's what you'd want, but `&&` returns the left side when it's falsy, and the left side here is the number 0.
      - text: An empty list.
        why: MovieList never renders, because `0 && …` stops at 0.
      - text: An error about rendering a number.
        why: Numbers are valid React children, which is exactly why the 0 shows up instead of an error.
      - text: The character "0".
        why: Correct. `0 && x` evaluates to 0, and React renders numbers as text. Write `movies.length > 0 && …` instead.
    answer: 3
  - q: "`MovieList` should show a full-page \"Nothing to watch yet\" message when the list is empty, and the list otherwise. Which structure reads best?"
    options:
      - text: "An early return: `if (movies.length === 0) return <EmptyState />;` followed by the normal list markup."
        why: Correct. The empty case is handled and done; the rest of the function only deals with the normal case, without nesting.
      - text: A ternary wrapping the entire component's JSX, with another ternary nested inside for each item's badge.
        why: It works, but nested ternaries in big JSX blocks are hard to read and easy to break when editing.
      - text: "Render both and hide the wrong one with `style={{ display: 'none' }}`."
        why: Both trees stay mounted and run, and you now have two places to keep in sync. Render only what's needed.
    answer: 0
  - q: "`WatchedBadge` should render nothing when `watched` is false. Which version does that?"
    options:
      - text: "`if (!watched) return;` and nothing else for that case"
        why: A bare `return` gives `undefined`. React 19 accepts it, but `return null` states the intent clearly and is the convention you'll see everywhere.
      - text: "`if (!watched) return <></>;`"
        why: An empty fragment also renders nothing, but it's noisier than the conventional `return null`.
      - text: "`if (!watched) return null;`"
        why: Correct. Returning `null` is the standard, explicit way for a component to render nothing.
      - text: "`if (!watched) return false;`"
        why: A component returning `false` happens to render nothing, but it reads like a bug. Return `null`.
    answer: 2
  - q: A collapsible "Watched" panel contains a text input. A user types a note, collapses the panel with `{open && <Panel />}`, and expands it again. What happened to the note?
    options:
      - text: It's still there, because React caches unmounted components.
        why: React doesn't keep unmounted components around. When the condition is false, the Panel and its state are destroyed.
      - text: It's gone, because the panel was removed from the tree and mounted fresh.
        why: Correct. Conditional rendering unmounts. If the state must survive, keep it in a parent or hide the panel with CSS instead.
      - text: It's still there, because the browser restores input values.
        why: Browser form restoration applies to page navigation, not to DOM nodes that React removed and recreated.
    answer: 1
---

Real interfaces change shape with the data. The Watchlist shows a "Watched" badge on some movies but not others, an encouraging message when the list is empty, and a disabled Add button until you type a title. None of that needs special React syntax. It's plain JavaScript deciding which JSX to return, and there are three tools for it.

## Early return: whole alternatives

When a component shows something entirely different in one case, handle that case first and return:

```jsx title=src/components/MovieList.jsx
export default function MovieList({ movies }) {
  if (movies.length === 0) {
    return <p className="empty">Nothing to watch yet. Add a movie above.</p>;
  }

  return (
    <ul>
      {movies.map((movie) => (
        <li key={movie.id}>{movie.title}</li>
      ))}
    </ul>
  );
}
```

The empty case is dealt with in two lines, and the rest of the function only worries about the normal case. This is the most readable pattern, so reach for it first. (The `map` and `key` are the topic of the next lesson.)

A component can also return `null` to render nothing at all:

```jsx
function WatchedBadge({ watched }) {
  if (!watched) return null;
  return <span className="badge">Watched</span>;
}
```

## Ternary: one thing or another

Inside JSX, where you can't write `if`, use the conditional operator for a choice between two outputs:

```jsx
<p className="status">
  {movie.watched ? 'Watched' : 'To watch'}
</p>
```

It works for elements too: `{isEditing ? <TitleInput /> : <h2>{title}</h2>}`. Keep ternaries short. Once you nest one ternary inside another, or the branches run to several lines each, move the decision into a variable above the `return`, or into its own small component.

## `&&`: something or nothing

When the alternative is "nothing", the logical AND operator is shorter than a ternary with `null`:

```jsx
<li>
  {movie.title}
  {movie.watched && <span className="badge">Watched</span>}
</li>
```

JavaScript evaluates `a && b` to `a` if `a` is falsy, otherwise to `b`. When `movie.watched` is `false`, the expression is `false`, and React renders nothing for `false`. When it's `true`, you get the badge.

:::mistake The stray zero
`{movies.length && <MovieList movies={movies} />}` looks right, but when the list is empty, `0 && …` evaluates to `0`, and React renders numbers. Your page shows a lonely "0". Make the left side a real boolean: `{movies.length > 0 && …}`. The same trap waits for any number on the left of `&&`, such as a count or an index.
:::

## Conditions in attributes

Conditions aren't only about whole elements. Attributes take expressions too:

```jsx
<li className={movie.watched ? 'movie movie-watched' : 'movie'}>
  {movie.title}
</li>

<button disabled={title.trim() === ''}>Add</button>

<button aria-pressed={filter === 'watched'}>Watched</button>
```

The third one matters for accessibility: `aria-pressed` tells screen reader users which toggle button is active, which a color change alone doesn't. When a value is `false` or `null` for a boolean attribute like `disabled`, React leaves it off the element.

## Picking the right tool

All three patterns produce the same kind of result, so the choice is about readability. A rule of thumb that holds up well in code review:

- **The whole output changes** (loading, error, empty, normal): early return, one case at a time, top to bottom.
- **One spot switches between two things**: a ternary, kept to a line or two per branch.
- **One spot is either there or not**: `&&` with a real boolean on the left.

When you notice yourself writing a ternary inside a ternary, or an `&&` chain with three conditions, stop and give the logic a name. Either compute a variable (`const status = …`) above the `return`, or extract a small component such as `WatchedBadge` that hides the decision inside itself. The parent then reads like a sentence: title, badge, actions.

Order matters with early returns, too. Put the cases that make the rest impossible first. If a movie list can be loading, failed or empty, check them in that order, so the final `return` only ever deals with real data.

## Not rendering versus hiding

There's an important difference between these two:

```jsx
{showWatched && <WatchedPanel />}
<div hidden={!showWatched}>
  <WatchedPanel />
</div>
```

The first removes `WatchedPanel` from the tree when the condition is false. React **unmounts** it: its DOM goes away and any state inside it, such as text typed into an input, is destroyed. When it comes back, it starts fresh. The second keeps it mounted and only hides its wrapper (the HTML `hidden` attribute works like `display: none`), so the state survives.

Most of the time you want the first; there's no reason to keep invisible UI alive. Choose hiding when the user expects their in-progress work inside the hidden part to still be there, as in tabs with half-filled forms.

:::tip Name the condition
`{allWatched && …}` reads better than `{movies.filter((m) => !m.watched).length === 0 && …}`. Compute a well-named boolean above the `return` and the JSX stays readable.
:::

Next, you'll render the whole movie list from data with `map`, and learn why React keeps asking you for a `key`.
