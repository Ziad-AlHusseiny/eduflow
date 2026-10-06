---
summary: Write React components as plain functions, nest them, split them into files with imports and exports, and avoid the naming and nesting mistakes that break them.
takeaways:
  - A component is a JavaScript function whose name starts with a capital letter and that returns JSX.
  - You use a component like an HTML tag, `<MovieCard />`, and React calls the function for you.
  - Give each reusable component its own file and export it; import it wherever it's used.
  - Define components at the top level of a module, never inside another component.
further:
  - title: Your First Component
    url: https://react.dev/learn/your-first-component
  - title: Importing and Exporting Components
    url: https://react.dev/learn/importing-and-exporting-components
quiz:
  - q: |
      You write this component and use it as `<movieCard />`. Nothing appears, and the console warns about an unrecognized tag. Why?
      ```jsx
      function movieCard() {
        return <article>Arrival</article>;
      }
      ```
    options:
      - text: Components must be written as arrow functions, not with the `function` keyword.
        why: Both function declarations and arrow functions work as components. The keyword isn't the problem.
      - text: The component forgot to call `createRoot`.
        why: You call `createRoot` once in main.jsx for the whole app, not inside each component.
      - text: Lowercase JSX tags are treated as HTML elements, so React tried to create a `<moviecard>` DOM element.
        why: Correct. React only calls your function when the tag starts with a capital letter. Rename it `MovieCard`.
      - text: An `<article>` can't be the top element a component returns.
        why: Any single element, including `<article>`, can be the root of a component's JSX.
    answer: 2
  - q: Which line correctly imports a component that `src/components/MovieCard.jsx` exports with `export default function MovieCard()`?
    options:
      - text: "`import MovieCard from './components/MovieCard.jsx';`"
        why: Correct. A default export is imported without curly braces, and you may name it anything (sticking to the same name is wise).
      - text: "`import { MovieCard } from './components/MovieCard.jsx';`"
        why: Curly braces import a named export. This file only has a default export, so the import is `undefined`.
      - text: "`import MovieCard from 'MovieCard';`"
        why: A bare name like 'MovieCard' is looked up in node_modules. Your own files need a relative path.
    answer: 0
  - q: |
      A teammate defines `Badge` inside `MovieCard`. What problem does this cause?
      ```jsx
      export default function MovieCard() {
        function Badge() {
          return <span>New</span>;
        }
        return <article><Badge /></article>;
      }
      ```
    options:
      - text: It's a syntax error; functions can't be nested in JSX files.
        why: Nested functions are valid JavaScript. The code runs; the problem shows up at runtime.
      - text: "`Badge` can't be exported, so tests can't import it."
        why: That's a minor downside. The real problem is what happens to Badge on every render.
      - text: React renders `Badge` twice, once for each function.
        why: Nothing renders twice here. The cost is that Badge is recreated from scratch.
      - text: Every render of `MovieCard` creates a brand-new `Badge` function, so React throws away and rebuilds Badge's DOM and state each time.
        why: Correct. React sees a different component type on every render and remounts it. Move `Badge` to the top level of the module.
    answer: 3
  - q: Your App returns `<Header /><MovieCard />` side by side and Vite shows "Adjacent JSX elements must be wrapped in an enclosing tag". What's the smallest correct fix?
    options:
      - text: Return an array of the two components.
        why: An array renders, but React warns unless every item has a key, and it's awkward for fixed markup. There's a cleaner tool for this.
      - text: Wrap them in a fragment, `<>…</>`, or in a meaningful element such as `<main>`.
        why: Correct. A component returns one root. A fragment groups elements without adding a DOM node.
      - text: Call each component as a function, `Header()` and `MovieCard()`, and join the results.
        why: Calling components as functions bypasses React's rendering and breaks Hooks inside them. Always use JSX tags.
    answer: 1
---

Right now `App.jsx` holds one heading. A real Watchlist screen has a header, a form, a filter bar and a list of movie cards, and some pieces appear many times. If you write it all in one function you get a 300-line component that nobody wants to touch. Components let you name each piece, write it once and reuse it.

## A component is a function

Here is a complete component:

```jsx title=src/App.jsx
function Header() {
  return (
    <header>
      <h1>My Watchlist</h1>
      <p>Movies I want to see</p>
    </header>
  );
}

export default function App() {
  return (
    <main>
      <Header />
    </main>
  );
}
```

Three rules make this work:

1. **It's a function that returns JSX.** JSX is the HTML-like syntax inside `return`. You'll learn its rules in the next lesson.
2. **Its name starts with a capital letter.** `<Header />` tells React "call the Header function". A lowercase `<header>` means the HTML element.
3. **You use it as a tag, not a function call.** You write `<Header />` and React decides when to call `Header()`. That's what lets React track it, re-render it and give it state later.

The parentheses around the multi-line JSX aren't required by React. They stop JavaScript's automatic semicolon insertion from ending the `return` early, which would silently return `undefined`.

## Components inside components

Components nest like HTML. Add a movie card and use it twice:

```jsx title=src/App.jsx
function MovieCard() {
  return (
    <article>
      <h2>Arrival</h2>
      <p>2016</p>
    </article>
  );
}

export default function App() {
  return (
    <main>
      <Header />
      <MovieCard />
      <MovieCard />
    </main>
  );
}
```

You now have two identical cards. That's obviously not useful yet; the cards need to show different movies. Passing data into a component is what props are for, and they're coming in Section 2. For now, notice the shape: `App` is the parent, and `Header` and the two `MovieCard`s are its children. Every React app is a tree like this.

:::mistake Defining a component inside another component
It's tempting to write `function Badge() {…}` inside `MovieCard` because only `MovieCard` uses it. Don't. Each render of `MovieCard` creates a new `Badge` function, React sees a different component type, and it destroys and recreates Badge's DOM and any state inside it. Always define components at the top level of a file.
:::

## One component per file

When a component is reused or grows past a screenful, give it its own file. The usual layout is a `src/components` folder:

```jsx title=src/components/MovieCard.jsx
export default function MovieCard() {
  return (
    <article>
      <h2>Arrival</h2>
      <p>2016</p>
    </article>
  );
}
```

```jsx title=src/App.jsx
import Header from './components/Header.jsx';
import MovieCard from './components/MovieCard.jsx';

export default function App() {
  return (
    <main>
      <Header />
      <MovieCard />
    </main>
  );
}
```

JavaScript modules give you two kinds of export:

- **Default export:** `export default function MovieCard()`. One per file, imported without braces: `import MovieCard from '…'`.
- **Named export:** `export function MovieCard()`. Any number per file, imported with braces: `import { MovieCard } from '…'`.

Both are fine. Many teams prefer named exports because the name is fixed and editors rename it everywhere for you. Pick one convention per project and stick to it. This course uses default exports for components, matching the file Vite generated.

:::tip Name files after components
`MovieCard.jsx` exports `MovieCard`. When a bug report says "the movie card shows the wrong year", you know which file to open without searching.
:::

## Components should be predictable

React may call your component function many times: on every update, twice in StrictMode, and sometimes when it's preparing a screen in the background. So a component should behave like a formula. Given the same inputs, it returns the same JSX and doesn't change anything outside itself while rendering. Don't modify global variables, fetch data or touch the DOM directly in the function body. You'll learn where that kind of work belongs (event handlers and effects) in Section 3.

Here's the difference in practice. A component that does `visits += 1` on a module-level variable will report different numbers in development and production, because StrictMode calls it twice. A component that only reads its inputs and returns JSX gives the same answer no matter how often React calls it.

## Return a single root

A component returns one JSX element. To return siblings without adding an extra `<div>`, wrap them in a **fragment**:

```jsx
export default function App() {
  return (
    <>
      <Header />
      <MovieCard />
    </>
  );
}
```

A fragment groups elements in your code but adds nothing to the DOM. Use a real element like `<main>` or `<section>` when it has meaning for the page's structure, and a fragment when it doesn't.

You can now split a screen into named pieces. Next you'll learn the rules of JSX itself: why it's `className` and not `class`, how curly braces work, and what JSX turns into when Vite compiles it.
