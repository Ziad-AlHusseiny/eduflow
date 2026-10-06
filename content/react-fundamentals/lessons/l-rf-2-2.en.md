---
summary: Pass data into components with props, destructure them with defaults, choose between passing objects and single values, and treat props as read-only snapshots.
takeaways:
  - Props are the arguments of a component; React passes them as a single object that you usually destructure in the parameter list.
  - Strings can be passed in quotes; every other value, including numbers and booleans, goes in curly braces.
  - Default values in destructuring (`watched = false`) apply only when the prop is missing or `undefined`.
  - A component must never change its props; to change what's shown, the parent passes new props.
  - In React 19, `ref` is an ordinary prop on function components, so `forwardRef` is no longer needed.
further:
  - title: Passing Props to a Component
    url: https://react.dev/learn/passing-props-to-a-component
  - title: Keeping Components Pure
    url: https://react.dev/learn/keeping-components-pure
  - title: Manipulating the DOM with Refs (ref as a prop)
    url: https://react.dev/learn/manipulating-the-dom-with-refs
quiz:
  - q: What does `MovieCard` receive for `year` here? `<MovieCard title="Arrival" year="2016" />`
    options:
      - text: The number 2016.
        why: Quoted values are always strings in JSX. To pass a number, use braces, `year={2016}`.
      - text: Nothing, because `year` must be declared in advance.
        why: Components accept any props you pass; there's no declaration step in plain JavaScript React.
      - text: The string "2016".
        why: Correct. Quotes pass a string literal. It displays the same, but `year + 1` gives "20161" instead of 2017.
      - text: An error, because numbers can't be props.
        why: Any JavaScript value can be a prop, including numbers, objects, arrays and functions.
    answer: 2
  - q: |
      `MovieCard` is declared as `function MovieCard({ title, watched = false })`. The parent renders `<MovieCard title="Dune" watched={null} />`. What is `watched` inside the component?
    options:
      - text: "`null`"
        why: Correct. Destructuring defaults only replace `undefined`. An explicit `null` is passed through unchanged.
      - text: "`false`"
        why: The default would apply if the prop were missing or `undefined`, but `null` is a real value.
      - text: "`undefined`"
        why: The parent passed `null`, and React passes props through as they are.
    answer: 0
  - q: |
      This component is meant to show the year as "(2016)". What's wrong with it?
      ```jsx
      function MovieCard(props) {
        props.year = `(${props.year})`;
        return <p>{props.title} {props.year}</p>;
      }
      ```
    options:
      - text: Nothing; it's the normal way to format props.
        why: Writing to props breaks React's contract. The props object belongs to the parent's render.
      - text: Template literals aren't allowed in components.
        why: Template literals are ordinary JavaScript and fine anywhere. The assignment is the problem.
      - text: It should use `this.props` instead.
        why: "`this.props` belongs to class components. Function components get props as their argument."
      - text: It mutates props. Compute a new value instead, such as `const label = '(' + year + ')'`.
        why: Correct. Props are read-only snapshots. In development React freezes the props object, so the assignment throws a TypeError, and even where it didn't, the change would vanish on the next render.
    answer: 3
  - q: You have a `movie` object with `id`, `title`, `year` and `watched`. `MovieItem` only displays the title and the watched status. Which call is the clearest default?
    options:
      - text: "`<MovieItem {...movie} />`, because spreading is shorter."
        why: Spreading hides which props the component really uses and passes `id` and `year` it doesn't need. Fine occasionally, unclear as a habit.
      - text: "`<MovieItem movie={movie} />`, and the component reads `movie.title` and `movie.watched`."
        why: Correct. Passing the whole object keeps calls short and is a common, readable default when the component is about that thing.
      - text: "`<MovieItem data={JSON.stringify(movie)} />`"
        why: Props can be objects. Serializing to a string adds work and loses the structure.
    answer: 1
---

Your `MovieCard` from Section 1 always says "Arrival". A component that can only show one movie isn't reusable, it's a template with one use. Props fix that: they are how a parent hands data to a child, in the same way arguments are how you hand data to a function.

## Passing and reading props

Pass props as attributes on the component's tag:

```jsx title=src/App.jsx
export default function App() {
  return (
    <main>
      <MovieCard title="Arrival" year={2016} watched />
      <MovieCard title="Past Lives" year={2023} watched={false} />
    </main>
  );
}
```

React collects them into one object, `{ title: 'Arrival', year: 2016, watched: true }`, and passes it as the component's first argument. You almost always destructure it right in the parameter list:

```jsx title=src/components/MovieCard.jsx
export default function MovieCard({ title, year, watched }) {
  return (
    <article>
      <h2>{title}</h2>
      <p>{year}</p>
      <p>{watched ? 'Watched' : 'To watch'}</p>
    </article>
  );
}
```

Three syntax details trip people up:

- **Quotes mean string.** `year="2016"` passes the string "2016". Use braces for anything else: `year={2016}`, `watched={false}`, `genres={['drama', 'sci-fi']}`.
- **A bare attribute means `true`.** `<MovieCard watched />` is the same as `watched={true}`, like `disabled` in HTML.
- **Destructuring is optional.** `function MovieCard(props)` with `props.title` works too. Destructuring documents which props the component expects at a glance, which is why most code uses it.

## Default values

Give a prop a default in the destructuring pattern:

```jsx
export default function MovieCard({ title, year, watched = false, genres = [] }) {
  return (
    <article>
      <h2>{title}</h2>
      <p>{year} · {genres.join(', ') || 'No genres yet'}</p>
      <p>{watched ? 'Watched' : 'To watch'}</p>
    </article>
  );
}
```

Now `<MovieCard title="Dune" year={2021} />` works without crashing on `genres.join`. Defaults apply when a prop is missing or `undefined`, but not when it's `null`. If your data can contain `null`, handle it explicitly, for example with `genres ?? []`.

## Objects or single values?

When a component is about one thing, pass that thing:

```jsx
<MovieCard movie={movie} />

function MovieCard({ movie }) {
  return <h2>{movie.title}</h2>;
}
```

This keeps call sites short and the component's purpose obvious. You'll also see spreading, `<MovieCard {...movie} />`, which passes every field as its own prop. It's convenient, but it hides what the component really uses and passes along fields it doesn't need. Use it sparingly, typically in small wrapper components that forward props to an element.

Passing single values has its own advantage: a component that takes `title` and `year` can show a movie, a book or a podcast episode. Choose based on how specific the component is. `MovieCard` is about movies, so `movie={movie}` is natural. A generic `Card` should take plain values.

## Props are read-only snapshots

A component must never change its own props. Props belong to the parent's render: they're a snapshot of what the parent decided at that moment. In development React even freezes the props object, so assigning to it throws an error.

:::mistake Editing props to format them
`props.year = '(' + props.year + ')'` looks harmless, but it writes to an object your component doesn't own. Derive a new value instead: `const label = '(' + year + ')'`, or a template literal. The rule is the same as for a pure function: read your inputs, return a result, change nothing.
:::

So how does a card ever change? The parent renders it again with different props. When `App` later has the movies in state and one gets marked watched, `App` re-renders and passes `watched={true}` to that card. The card doesn't update itself; it's handed new data. That one-way flow, data down from parent to child, is what makes React apps predictable: to find out why a card shows something, you look up the tree.

## Passing functions

Props can be any value, including functions. That's how a child tells its parent something happened:

```jsx
<MovieCard movie={movie} onToggle={() => toggleWatched(movie.id)} />
```

The `on` prefix is a naming convention for callback props, matching DOM events like `onClick`. You'll use this pattern constantly in Section 3, where `App` owns the state and children ask it to change.

## `ref` is just a prop now

Sometimes a parent needs the actual DOM node inside a child, for example to focus the title input after adding a movie. In React 19 a function component receives `ref` like any other prop and passes it to an element:

```jsx
function TitleInput({ ref, ...rest }) {
  return <input ref={ref} {...rest} />;
}
```

Older code wraps components in `forwardRef` to do this. You don't need it in React 19, and it's expected to be deprecated. One prop is still special: `key`, which you'll meet with lists, is read by React and never reaches your component.

:::tip Keep prop lists short
If a component takes ten props, it's usually doing two jobs. Look for a group of props that always travel together and either pass them as one object or split the component.
:::

Props let a parent configure a child with data. Next, you'll see how to pass whole chunks of JSX into a component with `children`, and how that builds flexible layouts.
