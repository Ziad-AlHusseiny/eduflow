---
summary: Attach event handlers correctly, pass arguments to them, read the event object, control bubbling and default behaviour, and pass handlers down to child components as props.
takeaways:
  - Pass a function to `onClick`, as in `onClick={handleClick}`; writing `handleClick()` calls it during render.
  - To pass an argument, wrap the call in an arrow function, as in `onClick={() => onRemove(movie.id)}`.
  - Handlers receive an event object with `target`, `key`, `preventDefault()` and `stopPropagation()`.
  - Name handlers `handleX` inside a component and callback props `onX`, so the data flow reads clearly.
  - Use real `<button>` elements for clickable things so keyboard and screen reader users can use them too.
further:
  - title: Responding to Events
    url: https://react.dev/learn/responding-to-events
  - title: Common components (React event object)
    url: https://react.dev/reference/react-dom/components/common#react-event-object
  - title: "Event bubbling (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
quiz:
  - q: "`<button onClick={setSelectedId(movie.id)}>Select</button>` crashes the app with \"Too many re-renders\". Why?"
    options:
      - text: The setter is called while rendering, which triggers another render, which calls it again, forever.
        why: Correct. The braces contain a call, so it runs during render. Write `onClick={() => setSelectedId(movie.id)}` to pass a function instead.
      - text: "`onClick` only accepts functions declared with the `function` keyword."
        why: Any function works, including arrow functions. The problem is that this isn't a function at all; it's the result of a call.
      - text: Buttons can't change state; only forms can.
        why: Any event handler can set state. A button click is the most common way to do it.
    answer: 0
  - q: "`MovieItem` receives `onRemove` from its parent. The parent's `removeMovie(id)` expects a movie id. Which is correct inside MovieItem?"
    options:
      - text: "`<button onClick={onRemove}>Remove</button>`"
        why: React calls `onRemove` with the click event, so the parent receives an event object instead of an id.
      - text: "`<button onClick={onRemove(movie.id)}>Remove</button>`"
        why: That calls `onRemove` during render and removes the movie immediately, before anyone clicks.
      - text: "`<button onClick={() => onRemove(movie.id)}>Remove</button>`"
        why: Correct. The arrow function runs on click and calls `onRemove` with exactly the argument the parent expects.
      - text: "`<button onRemove={movie.id}>Remove</button>`"
        why: DOM elements don't know about `onRemove`. Only real events like `onClick` are wired up.
    answer: 2
  - q: A movie card has `onClick={openDetails}`, and inside it a Remove button with `onClick={() => onRemove(movie.id)}`. Clicking Remove also opens the details. What's the fix?
    options:
      - text: Call `e.preventDefault()` in the Remove handler.
        why: preventDefault stops the browser's default action, such as a form submitting. It doesn't stop the click bubbling up to the card.
      - text: Call `e.stopPropagation()` in the Remove handler before calling `onRemove`.
        why: Correct. The click bubbles from the button to the card. stopPropagation stops it at the button.
      - text: Move the Remove button outside of the component.
        why: That works visually only if the layout allows it, and it avoids the problem instead of understanding it.
      - text: Use `onMouseDown` on the Remove button instead.
        why: The card's click handler still fires on click, and mouse-only events break keyboard use.
    answer: 1
  - q: Why should a clickable movie title be a `<button>` instead of a `<div onClick={…}>`?
    options:
      - text: A div's onClick only works in React 18 and earlier.
        why: onClick works on any element in every React version. The issue is what the element offers users.
      - text: Buttons render faster than divs.
        why: Rendering speed is the same. The difference is built-in behaviour and accessibility.
      - text: React warns about click handlers on divs and refuses to run them.
        why: React doesn't refuse; the click works with a mouse. Keyboard and assistive technology users are the ones left out.
      - text: A button is focusable, works with Enter and Space, and is announced as a button by screen readers; a div does none of that.
        why: Correct. You'd have to add a role, a tabIndex and key handlers to a div to get what a button gives you for free.
    answer: 3
---

State changes because something happens: a click, a key press, a form submission. React's event handling is close to the DOM's, with a few conventions that keep components readable and a couple of traps that catch everyone once.

## Pass a function, don't call it

You attach a handler by passing a function to a prop like `onClick`:

```jsx
export default function ClearButton({ onClear }) {
  function handleClick() {
    onClear();
  }

  return <button onClick={handleClick}>Clear watched</button>;
}
```

The braces hold `handleClick`, the function itself. React keeps it and calls it when the click happens. Compare:

```jsx
// Right: passes the function. React calls it on click.
<button onClick={handleClick}>Clear watched</button>

// Wrong: calls it immediately, during render.
<button onClick={handleClick()}>Clear watched</button>
```

The second version runs `handleClick` every time the component renders and passes its return value (`undefined`) as the handler. If the function sets state, you get an infinite loop and React stops it with "Too many re-renders". When you see that error, look for parentheses inside an `onSomething={…}`.

## Passing arguments

Most handlers in a list need to know which item was clicked. Wrap the call in an arrow function:

```jsx
{movies.map((movie) => (
  <li key={movie.id}>
    {movie.title}
    <button onClick={() => onRemove(movie.id)}>Remove</button>
  </li>
))}
```

The arrow function is created during render but only runs on click, and when it does, it calls `onRemove` with the right id. Creating a small function per item is normal and cheap; don't contort your code to avoid it.

## Handlers as props

Components that own state pass handlers down. Children call them to report what happened. The conventions make this readable:

- Inside a component, name handlers **`handleSomething`**: `handleRemove`, `handleSubmit`.
- Props that receive handlers are named **`onSomething`**: `onRemove`, `onToggle`, matching built-in events like `onClick`.

```jsx title=src/App.jsx
export default function App() {
  const [movies, setMovies] = useState(INITIAL_MOVIES);

  function handleRemove(id) {
    setMovies(movies.filter((m) => m.id !== id));
  }

  return <MovieList movies={movies} onRemove={handleRemove} />;
}
```

`MovieList` has no idea how removal works. It only knows that when the user clicks Remove, it calls `onRemove(id)`. The state, and the rules for changing it, stay in one place.

## The event object

React calls your handler with an event object. It wraps the browser's native event and has the same familiar API in every browser:

```jsx
function handleKeyDown(e) {
  if (e.key === 'Escape') {
    setSelectedId(null);
  }
}

<main onKeyDown={handleKeyDown}>…</main>
```

The properties you'll use most are `e.target` (the element the event started on), `e.currentTarget` (the element whose handler is running), `e.key` for keyboard events, and two methods: `e.preventDefault()` and `e.stopPropagation()`.

## Bubbling and default behaviour

Events **bubble**: a click on a button inside a card triggers the button's handler, then the card's, then any ancestor's. That's why the `onKeyDown` on `<main>` above catches Escape pressed while any button inside it has focus. Usually bubbling is what you want, but not always:

```jsx
<article onClick={() => onOpen(movie.id)}>
  <h2>{movie.title}</h2>
  <button
    onClick={(e) => {
      e.stopPropagation();
      onRemove(movie.id);
    }}
  >
    Remove
  </button>
</article>
```

Without `stopPropagation`, clicking Remove would also open the movie's details. (A whole-card click target is a mouse convenience; keep a real button or link for opening the details too, so keyboard users can reach it.) Keep this pattern for the cases that need it; reaching for it everywhere makes event flow hard to follow.

`preventDefault` is different: it stops the **browser's** built-in behaviour, such as a link navigating or a form reloading the page. It doesn't stop bubbling. You'll use it on the Watchlist's form in the next lesson.

:::mistake Clickable divs
`<div onClick={select}>Arrival</div>` works with a mouse and nothing else. It can't receive keyboard focus, Enter and Space do nothing, and screen readers don't announce it as interactive. Use `<button type="button">` for actions and `<a href>` for navigation. You can style a button to look like anything.
:::

## Handlers are where side effects belong

Components must be pure while rendering, but event handlers don't run during rendering. They run because the user did something, so they're the right place for side effects: setting state, writing to localStorage, sending a request, logging analytics. When you're unsure where some code should live, ask "what caused it?" If the answer is a specific user action, it goes in that action's handler.

:::tip Read the error, find the parentheses
"Too many re-renders" nearly always means a setter is called during render, usually through `onClick={doSomething()}`. A handler that quietly does nothing, or logs an event object where you expected an id, was usually passed directly (`onClick={onRemove}`) instead of wrapped in an arrow function. Both come from how the function was passed.
:::

Next, you'll handle the most important event in the Watchlist, the form submission that adds a movie, and learn how controlled inputs keep form fields and state in sync.
