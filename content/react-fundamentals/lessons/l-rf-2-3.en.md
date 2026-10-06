---
summary: Build flexible components with the children prop and JSX slots, specialize generic components, and pass elements down to avoid threading props through layers.
takeaways:
  - Whatever you put between a component's opening and closing tags arrives as its `children` prop.
  - A prop can hold JSX, so a component can expose several named slots such as `actions` or `footer`.
  - Specialize a generic component by rendering it with preset props instead of copying it.
  - Passing ready-made elements down often removes the need to thread data through components that don't use it.
further:
  - title: Passing JSX as children
    url: https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children
  - title: Passing Data Deeply with Context (consider composition first)
    url: https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context
quiz:
  - q: |
      What renders inside the `<section>`?
      ```jsx
      function Panel({ title }) {
        return <section><h2>{title}</h2></section>;
      }

      <Panel title="To watch">
        <MovieList movies={movies} />
      </Panel>
      ```
    options:
      - text: The heading and then the movie list.
        why: The list is passed as `children`, but Panel never renders `children`, so it's silently dropped.
      - text: Only the heading; the list is passed as `children` but Panel never renders it.
        why: Correct. Nested JSX becomes the `children` prop. Panel must put `{children}` somewhere in its output.
      - text: An error, because Panel doesn't declare a `children` parameter.
        why: React never complains about unused props. That's why this bug is easy to miss.
      - text: The movie list replaces the heading.
        why: Children never replace a component's own output. They are just another prop the component may render.
    answer: 1
  - q: You need a `Panel` with a title, a body, and optional buttons in the top-right corner. Which API is the most flexible and readable?
    options:
      - text: A `buttons` prop holding an array of label strings, and Panel creates the buttons.
        why: Panel would have to know about click handlers, icons and disabled states. The API grows forever.
      - text: Separate components `PanelWithButtons` and `PanelWithoutButtons`.
        why: Copying the component for each variant doubles the code you maintain and still doesn't cover new cases.
      - text: Pass the whole panel markup as a string and render it with `dangerouslySetInnerHTML`.
        why: That throws away React's escaping and components entirely. It's unsafe and much harder to change.
      - text: "An `actions` prop that takes JSX, as in `actions={<button onClick={shuffle}>Shuffle</button>}`."
        why: Correct. A JSX slot lets the caller pass any elements with their own handlers, and Panel only decides where they go.
    answer: 3
  - q: "`App` has the `movies` array. `Layout` renders `Sidebar`, which renders `WatchCount`, the only one that needs `movies`. What's the composition fix to avoid passing `movies` through Layout and Sidebar?"
    options:
      - text: In App, render `<Layout sidebar={<WatchCount movies={movies} />} />`, and let Layout place `sidebar` where it belongs.
        why: Correct. App creates the element with the data it already has. Layout and Sidebar only position it and never see `movies`.
      - text: Make `movies` a global variable that WatchCount imports.
        why: Module-level mutable data doesn't trigger re-renders and makes components hard to test and reuse.
      - text: Copy `movies` into state inside WatchCount.
        why: A second copy goes stale when App's movies change. Data should have one owner.
    answer: 0
  - q: A `Button` component takes `icon` and renders `<span>{icon}</span>`. Which call shows a star icon?
    options:
      - text: "`<Button icon={StarIcon}>Rate</Button>`"
        why: That passes the component function itself. React warns that functions aren't valid as a child and renders nothing.
      - text: "`<Button icon=\"StarIcon\">Rate</Button>`"
        why: That passes the text "StarIcon", which renders as those characters.
      - text: "`<Button icon={<StarIcon />}>Rate</Button>`"
        why: Correct. `<StarIcon />` is a React element, which can be rendered anywhere. A slot prop expects elements.
    answer: 2
---

Your Watchlist will have several boxes that look alike: a "To watch" panel, a "Watched" panel, maybe a "Recommendations" panel later. Each has a title bar, sometimes a button or two on the right, and different content inside. You could add a prop for every possible kind of content. Or you could let the caller put whatever it wants inside, the way you put anything inside a `<div>`.

That second approach is composition, and it's how most flexible React components are built.

## The `children` prop

Anything you nest between a component's tags arrives as a prop called `children`:

```jsx title=src/components/Panel.jsx
export default function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="panel-body">{children}</div>
    </section>
  );
}
```

```jsx title=src/App.jsx
<Panel title="To watch">
  <MovieList movies={toWatch} />
</Panel>

<Panel title="Watched">
  <p>You've watched {watched.length} movies.</p>
</Panel>
```

`Panel` doesn't know or care what's inside. It owns the frame (the section, the heading, the styling) and the caller owns the content. You've used this all along without noticing: `<main>` and `<section>` take children too.

`children` can be anything renderable: one element, several elements, text, or nothing. Treat it as opaque and render it where it belongs. Don't inspect it, count it or modify it; if a wrapper needs to know something about its content, that information should arrive as an ordinary prop.

The payoff shows up when the design changes. If the panels get rounded corners and a shadow next month, you edit `Panel` once and every panel in the app updates, whatever it contains.

:::mistake Forgetting to render children
If `Panel` only destructures `title` and never outputs `{children}`, everything nested inside disappears without an error. React doesn't warn about unused props. When content vanishes inside a wrapper, check that the wrapper renders `children`.
:::

## More than one slot

`children` is one slot. When a component needs content in several places, use ordinary props that hold JSX. A panel with optional buttons in its header:

```jsx title=src/components/Panel.jsx
export default function Panel({ title, actions, children }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{title}</h2>
        {actions}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
```

```jsx
<Panel
  title="To watch"
  actions={<button onClick={shuffle}>Shuffle</button>}
>
  <MovieList movies={toWatch} />
</Panel>
```

If `actions` isn't passed, it's `undefined`, which renders nothing, so the slot is optional for free. Compare this with an API like `buttons={['Shuffle', 'Clear']}`: Panel would need to create the buttons, wire up handlers, handle icons and disabled states, and grow a new prop for every request. With a slot, Panel decides *where* things go and the caller decides *what* they are.

:::tip Elements, not components
A slot takes an element, `actions={<ShuffleButton />}`, not a component, `actions={ShuffleButton}`. The second passes the function itself, and React can't render a function as a child.
:::

## Specialization

Sometimes you want a fixed variant of a generic component. Don't copy it; render it with preset props:

```jsx title=src/components/Button.jsx
export function Button({ variant = 'neutral', children, ...rest }) {
  return (
    <button className={`btn btn-${variant}`} {...rest}>
      {children}
    </button>
  );
}

export function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}
```

`DangerButton` is a `Button` with one decision already made. The `...rest` in `Button` forwards everything else, such as `onClick`, `type` or `disabled`, to the real `<button>`, so callers can use it like the HTML element they already know. Fix a bug in `Button` and every variant gets the fix.

## Composition instead of prop drilling

Here's a problem every app hits. `App` owns the movies. `Layout` renders a `Sidebar`, and the sidebar shows a `WatchCount`. Only `WatchCount` needs the movies, but to get them there, you thread them through every level:

```jsx
<Layout movies={movies} />           // Layout doesn't use movies…
function Layout({ movies }) {
  return <Sidebar movies={movies} />; // …neither does Sidebar
}
```

Passing data through components that only forward it is called **prop drilling**. It's tedious, and every intermediate component now depends on data it doesn't use.

Composition often removes it. Let `App`, which has the data, create the element, and let `Layout` place it:

```jsx
export default function App() {
  return (
    <Layout sidebar={<WatchCount movies={movies} />}>
      <MovieList movies={movies} />
    </Layout>
  );
}

function Layout({ sidebar, children }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}
```

`Layout` no longer knows movies exist. It's a pure layout component you could reuse on any page. React also offers **context** for data that many distant components need, such as the current theme or the signed-in user. The React docs recommend trying composition first, and it usually works.

:::why Small pieces are testable pieces
A `Panel` that only arranges its slots, or a `Layout` that only positions its children, has almost no logic, so there's almost nothing to break. The logic concentrates in a few components that own data. That split makes components easier to test, reuse and reason about, and it's the "compose complex screens from small pieces" skill this course promised.
:::

Next, you'll make components show different things depending on the data, from a "Watched" badge to an empty-state message, with conditional rendering.
