---
summary: Read and write JSX without fighting the compiler by knowing what it compiles to, how curly braces work, and which attribute and rendering rules differ from HTML.
takeaways:
  - JSX compiles to function calls that create plain JavaScript objects describing the UI; React turns those objects into DOM.
  - Curly braces embed any JavaScript expression (a value), but never a statement such as `if` or `for`.
  - Attributes are camelCase JavaScript names, so you write `className`, `htmlFor`, `onClick` and pass `style` an object.
  - Strings and numbers render as text, while `null`, `undefined`, `true` and `false` render nothing and plain objects throw.
further:
  - title: Writing Markup with JSX
    url: https://react.dev/learn/writing-markup-with-jsx
  - title: JavaScript in JSX with Curly Braces
    url: https://react.dev/learn/javascript-in-jsx-with-curly-braces
  - title: Common components (props on every DOM element)
    url: https://react.dev/reference/react-dom/components/common
quiz:
  - q: What does `<h2 className="title">{movie.title}</h2>` become after Vite compiles it?
    options:
      - text: "A function call that creates an object with the type `'h2'` and props `{ className: 'title', children: movie.title }`."
        why: Correct. JSX is syntax for creating element objects. React reads those objects to decide what DOM to create or update.
      - text: A string of HTML that React inserts with innerHTML.
        why: React never builds HTML strings for rendering. That's also why JSX text is safe from HTML injection by default.
      - text: A real `HTMLHeadingElement` created with `document.createElement`.
        why: JSX only produces lightweight description objects. React creates or reuses DOM nodes later, during commit.
      - text: It stays as JSX and the browser parses it natively.
        why: Browsers don't understand JSX. Without a compiler step the page throws a syntax error.
    answer: 0
  - q: Which line is valid JSX?
    options:
      - text: "`<p>{if (watched) 'Seen'}</p>`"
        why: "`if` is a statement, not an expression, so it can't go inside curly braces. Use a ternary or compute the value before `return`."
      - text: "`<img src=\"{poster}\">`"
        why: Quotes make it the literal string "{poster}", and the tag isn't closed. Write `src={poster}` and self-close with `/>`.
      - text: "`<label class=\"field\" for=\"title\">Title</label>`"
        why: "In JSX these are `className` and `htmlFor`, because `class` and `for` are reserved words in JavaScript."
      - text: "`<div style={{ marginTop: 8, fontWeight: 'bold' }}>Hi</div>`"
        why: Correct. The outer braces enter JavaScript, the inner braces are an object, and CSS properties are camelCase. A bare number means pixels.
    answer: 3
  - q: "`movie` is `{ title: 'Arrival', year: 2016 }`. What happens with `<p>{movie}</p>`?"
    options:
      - text: It renders "[object Object]".
        why: React doesn't call toString on objects. It refuses to render them at all.
      - text: React throws "Objects are not valid as a React child".
        why: Correct. React can render strings, numbers, elements and arrays of those. Render a field instead, like `{movie.title}`.
      - text: It renders the object as JSON.
        why: React never serializes objects for you. Use `JSON.stringify(movie)` if you really want to show JSON.
      - text: It renders nothing, like `null`.
        why: Only `null`, `undefined` and booleans render nothing. A plain object is an error.
    answer: 1
  - q: A movie's description from your API contains `<b>Must watch</b>`. You render `<p>{movie.description}</p>`. What appears?
    options:
      - text: '"Must watch" in bold.'
        why: React doesn't parse strings as HTML, which protects you from injected markup.
      - text: An error, because the string contains angle brackets.
        why: Any string is valid content. React escapes it and shows it as text.
      - text: The literal text `<b>Must watch</b>`, tags and all.
        why: Correct. React escapes text content, so markup in data shows up as characters instead of running. That's a key defence against cross-site scripting.
    answer: 2
---

JSX looks like HTML, so your first instinct is to write HTML. Most of the time that works. Then you write `class="card"` and get a console warning, or put an `if` inside curly braces and get a compile error that points at the wrong line. Every one of these surprises makes sense once you see what JSX really is.

## JSX is function calls

Vite compiles each JSX tag into a function call. This component:

```jsx
function MovieCard() {
  return <h2 className="title">Arrival</h2>;
}
```

compiles to roughly this:

```js
import { jsx } from 'react/jsx-runtime';

function MovieCard() {
  return jsx('h2', { className: 'title', children: 'Arrival' });
}
```

The call returns a plain JavaScript object, a **React element**: a lightweight description of what should be on screen, with a `type` and some `props`. You can model the idea with a tiny function of your own:

```js run
function h(type, props, ...children) {
  return { type, props: { ...props, children } };
}

const card = h('article', { className: 'card' },
  h('h2', null, 'Arrival'),
  h('p', null, 2016),
);

console.log(card.type);                         // article
console.log(card.props.className);              // card
console.log(card.props.children[0].props.children); // ["Arrival"]
```

React's real elements carry a little more information, but the shape is the same. React walks this tree of objects and creates or updates the DOM to match.

Notice that the compiled code imports `jsx` for you. That's why modern React files don't start with `import React from 'react'`. Older tutorials include that line because the previous compiler turned JSX into `React.createElement(…)` calls, which needed `React` in scope. Since React 17's automatic JSX runtime it's unnecessary, so leave it out.

:::figure JSX becomes an element object, then DOM
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">JSX source is compiled into a jsx function call, which returns a plain object with type and props; React then renders that object into a real DOM node.</title>
  <rect class="d-box" x="10" y="50" width="190" height="90" rx="12"/>
  <text class="d-label-muted" x="105" y="40" text-anchor="middle">you write</text>
  <text class="d-code" x="105" y="100" text-anchor="middle">&lt;h2&gt;Arrival&lt;/h2&gt;</text>
  <rect class="d-box-primary" x="250" y="50" width="200" height="90" rx="12"/>
  <text class="d-label-muted" x="350" y="40" text-anchor="middle">compiler makes</text>
  <text class="d-code" x="350" y="88" text-anchor="middle">{ type: 'h2',</text>
  <text class="d-code" x="350" y="110" text-anchor="middle">  props: {…} }</text>
  <rect class="d-box-success" x="500" y="50" width="190" height="90" rx="12"/>
  <text class="d-label-muted" x="595" y="40" text-anchor="middle">React commits</text>
  <text class="d-label-strong" x="595" y="100" text-anchor="middle">DOM &lt;h2&gt; node</text>
  <path class="d-arrow" d="M200 95 L248 95" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M450 95 L498 95" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="180" text-anchor="middle">React elements are descriptions, not DOM nodes</text>
</svg>
:::

Once you know JSX is function calls, the rules below stop feeling arbitrary.

## Curly braces hold expressions

Inside JSX, `{ }` switches back to JavaScript. Whatever goes inside becomes an argument to a function call, so it must be an **expression**: something that produces a value.

```jsx
function MovieCard() {
  const movie = { title: 'Arrival', year: 2016, rating: 8 };
  const age = 2026 - movie.year;

  return (
    <article>
      <h2>{movie.title.toUpperCase()}</h2>
      <p>{movie.year} · {age} years old</p>
      <p>{movie.rating >= 8 ? 'Must watch' : 'Maybe'}</p>
    </article>
  );
}
```

Variables, property access, method calls, arithmetic and the ternary operator `a ? b : c` are all expressions. `if`, `for` and `const` are statements, so they can't go inside braces, in the same way you can't pass `if (x) {}` as a function argument. When the logic gets bigger, compute a variable above the `return` and use that.

Here's the same card with a label that needs real branching. The `if` lives in plain JavaScript above the `return`, and JSX only receives the finished value:

```jsx
function MovieCard({ movie }) {
  let label;
  if (movie.rating >= 9) {
    label = 'Masterpiece';
  } else if (movie.rating >= 7) {
    label = 'Must watch';
  } else {
    label = 'Maybe';
  }

  return <p>{movie.title}: {label}</p>;
}
```

This pattern scales. Your JSX stays a readable picture of the output, and the decisions sit in ordinary code you can read, test and debug like any other function. (The `{ movie }` in the parameter list is a prop; you'll learn props properly in the next section.)

Attributes take braces too: `<img src={movie.poster} alt={movie.title} />`. Don't wrap braces in quotes; `src="{poster}"` is the literal string `{poster}`.

## Attributes are JavaScript names

Because props become keys of a JavaScript object, they follow JavaScript naming:

- `class` → `className`, `for` → `htmlFor` (both are reserved words in JS).
- Multi-word attributes are camelCase: `onClick`, `tabIndex`, `autoComplete`, `maxLength`.
- `aria-*` and `data-*` attributes keep their dashes: `aria-label="Remove"`, `data-id="42"`.
- `style` takes an object, with camelCase CSS properties: `style={{ marginTop: 8 }}`. A bare number means pixels for most properties. The double braces are an object literal inside a JSX expression.

## Close every tag

JSX is stricter than HTML. Every element closes: `<img />`, `<input />`, `<br />`. A component returns one root, wrapped in a fragment `<>…</>` if you need siblings. Comments go inside braces: `{/* like this */}`.

## What can be rendered

| You put in braces | What appears |
|---|---|
| A string or number | The text (`0` included) |
| A React element | That element |
| An array of elements | Each element in order |
| `null`, `undefined`, `true`, `false` | Nothing |
| A plain object | Error: "Objects are not valid as a React child" |

The "nothing" row is what makes conditional rendering work, and the `0` in the first row is a classic trap you'll meet in the Conditional Rendering lesson.

:::mistake Rendering a whole object
`<p>{movie}</p>` crashes the app with "Objects are not valid as a React child". You almost always meant one field: `{movie.title}`. If you want to inspect data while debugging, render `{JSON.stringify(movie)}` temporarily.
:::

:::why Text is escaped for you
React escapes every string you render. If a movie title from an API contains `<script>`, it shows up as visible characters instead of running. You get protection from HTML injection for free, as long as you don't bypass it with `dangerouslySetInnerHTML`.
:::

You can now read any JSX and predict what it does. In the next section you'll stop hard-coding "Arrival" and learn to think in components, splitting a whole screen into pieces that receive their data through props.
