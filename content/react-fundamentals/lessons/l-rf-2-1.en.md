---
summary: Turn a screen mockup into a component tree, build a static version first, and identify the minimal state the Watchlist needs before writing any interactive code.
takeaways:
  - Draw boxes around the mockup and name each box; nested boxes become a component tree.
  - Split a component when a piece is reused, has its own job, or makes the parent hard to read, not by default.
  - Build a static version from hard-coded data first, then add interactivity.
  - Keep the minimal state; anything you can calculate from other data, such as a count or a filtered list, is derived, not state.
further:
  - title: Thinking in React
    url: https://react.dev/learn/thinking-in-react
  - title: Your UI as a Tree
    url: https://react.dev/learn/understanding-your-ui-as-a-tree
quiz:
  - q: The Watchlist needs to show how many movies are unwatched. Where should that number come from?
    options:
      - text: A separate `unwatchedCount` state that every handler updates.
        why: A second copy of information that's already in the list will eventually disagree with it. That's the bug React is supposed to remove.
      - text: Calculated from the movies array while rendering, with `movies.filter((m) => !m.watched).length`.
        why: Correct. It's derived data. Calculating it on each render keeps it correct automatically, and for a list this size it costs nothing.
      - text: Stored in localStorage and read back on every render.
        why: localStorage is for persisting data across reloads, not for values you can compute from data you already have.
    answer: 1
  - q: A teammate splits the movie card into `MovieTitle`, `MovieYear`, `MovieTitleWrapper` and `MovieYearText`, each wrapping one tag. What's the best review comment?
    options:
      - text: Good, smaller is always better in React.
        why: Tiny components that do nothing but wrap one tag add files and indirection without adding reuse or clarity.
      - text: Use class components for the small ones.
        why: Function components are the standard; the class/function choice isn't the issue here.
      - text: Merge them into one component, because React can only render one component per file.
        why: A file can define and render any number of components. The problem is unnecessary splitting, not a file rule.
      - text: Keep one MovieCard until a piece is reused or grows its own logic; these splits add indirection without benefit.
        why: Correct. Split for reuse, for a clear separate job, or for readability. Wrapping single tags makes the code harder to follow.
    answer: 3
  - q: In the Watchlist tree, `App` contains `Header`, `AddMovieForm`, `FilterBar` and `MovieList`, and `MovieList` contains many `MovieItem`s. Which components need the movies array?
    options:
      - text: Header (for the count) and MovieList (to show the movies), so it should live in their common parent, App.
        why: Correct. Data that several components need lives in their closest common parent and flows down as props.
      - text: Only MovieItem, because it's the one that displays a movie.
        why: Each MovieItem needs one movie, but the Header needs the whole list to count it, and MovieList needs it to render items.
      - text: Every component, so each one should keep its own copy.
        why: Copies drift apart. One owner with props flowing down keeps everything consistent.
      - text: FilterBar, because filtering decides what's visible.
        why: FilterBar needs the current filter value, not the movies. MovieList is what combines the two.
    answer: 0
  - q: Why build a static version of the Watchlist with hard-coded data before adding state?
    options:
      - text: React can't render components that have state until a static version exists.
        why: There's no such rule. It's a working method, not a technical requirement.
      - text: Static components render faster in production.
        why: Speed isn't the reason. The order of work is about separating two different kinds of thinking.
      - text: It separates layout and structure from interactivity, so you get the tree right before thinking about what changes.
        why: Correct. Building the static version is mostly typing; deciding on state needs careful thought. Doing them one at a time avoids tangling both.
    answer: 2
---

Here's the Watchlist you're building, described as a designer would hand it over: a header with the title and "3 to watch"; a form with a title input and an Add button; a row of filter buttons (All, To watch, Watched); and a list of movies, each with its title, year and a checkbox to mark it watched. When the list is empty, a friendly message replaces it.

Before you write a line of code, decide what the components are. It's the most important design step in a React app, and it's done with a pen.

## Draw boxes, name them

Take the mockup and draw a box around every piece that does one job. Then name each box as a noun, the way you'd name a function.

:::figure The Watchlist as a component tree
<svg viewBox="0 0 700 300" role="img" aria-labelledby="t1">
  <title id="t1">App is the root. Its children are Header, AddMovieForm, FilterBar and MovieList. Header contains WatchCount. MovieList contains several MovieItem components, or EmptyState when there are no movies.</title>
  <rect class="d-box-primary" x="290" y="16" width="120" height="44" rx="10"/>
  <text class="d-label-strong" x="350" y="44" text-anchor="middle">App</text>
  <rect class="d-box" x="20" y="120" width="130" height="44" rx="10"/>
  <text class="d-label" x="85" y="148" text-anchor="middle">Header</text>
  <rect class="d-box" x="190" y="120" width="150" height="44" rx="10"/>
  <text class="d-label" x="265" y="148" text-anchor="middle">AddMovieForm</text>
  <rect class="d-box" x="380" y="120" width="120" height="44" rx="10"/>
  <text class="d-label" x="440" y="148" text-anchor="middle">FilterBar</text>
  <rect class="d-box-accent" x="540" y="120" width="140" height="44" rx="10"/>
  <text class="d-label" x="610" y="148" text-anchor="middle">MovieList</text>
  <rect class="d-box" x="20" y="230" width="130" height="44" rx="10"/>
  <text class="d-label" x="85" y="258" text-anchor="middle">WatchCount</text>
  <rect class="d-box" x="440" y="230" width="120" height="44" rx="10"/>
  <text class="d-label" x="500" y="258" text-anchor="middle">MovieItem ×n</text>
  <rect class="d-box" x="575" y="230" width="115" height="44" rx="10"/>
  <text class="d-label" x="632" y="258" text-anchor="middle">EmptyState</text>
  <path class="d-line" d="M350 60 L85 120"/>
  <path class="d-line" d="M350 60 L265 120"/>
  <path class="d-line" d="M350 60 L440 120"/>
  <path class="d-line" d="M350 60 L610 120"/>
  <path class="d-line" d="M85 164 L85 230"/>
  <path class="d-line" d="M610 164 L500 230"/>
  <path class="d-line d-dashed" d="M610 164 L632 230"/>
</svg>
:::

Nested boxes become a tree. `App` owns the whole screen. `MovieList` renders either many `MovieItem`s or one `EmptyState`. This tree is the plan for the rest of the course; you'll build each box as a component.

## When to split, and when not to

Split a piece into its own component when at least one of these is true:

- **It repeats.** `MovieItem` appears once per movie. Writing it once is the point.
- **It has its own job.** `AddMovieForm` handles typing and submitting. Nothing else needs to know how.
- **The parent is getting hard to read.** If you scroll to understand a component, extract a named piece.

Don't split just because you can. A component that only wraps one `<span>` adds a file, an import and a name to remember, and gives nothing back. Experienced teams often keep a component at 100 lines rather than splitting it into five 20-line ones that are only used together. Start a little bigger and extract when one of the three reasons appears.

:::tip Name by role, not by look
`FilterBar` and `WatchCount` describe what the pieces are for. `BlueButtonRow` and `BigNumber` stop being accurate the day the design changes.
:::

## Build the static version first

With the tree drawn, build it with hard-coded data and no interactivity. Pass data down from the top so the shape is right from the start:

```jsx title=src/App.jsx
const MOVIES = [
  { id: 1, title: 'Arrival', year: 2016, watched: true },
  { id: 2, title: 'Past Lives', year: 2023, watched: false },
  { id: 3, title: 'Paddington 2', year: 2017, watched: false },
];

export default function App() {
  return (
    <main>
      <Header movies={MOVIES} />
      <AddMovieForm />
      <FilterBar />
      <MovieList movies={MOVIES} />
    </main>
  );
}
// …Header, AddMovieForm, FilterBar and MovieList defined below
```

Building the static version is mostly typing, and it gets the structure and markup right while nothing moves. Adding interactivity is mostly thinking. Doing both at once is how components end up tangled.

## Find the minimal state

Next, list every piece of data in the app and ask three questions about each. Does it stay the same over time? Is it passed in from a parent? Can you calculate it from other data? If the answer to any of them is yes, it isn't state.

For the Watchlist:

| Data | State? | Why |
|---|---|---|
| The list of movies | Yes | Changes when you add, remove or mark one |
| The current filter | Yes | Changes when you click a filter button |
| Text typed in the form | Yes | Changes as you type |
| Number left to watch | No | Calculated from the movies |
| Movies currently visible | No | Calculated from movies + filter |

Three pieces of state, two derived values. Keeping state minimal is the single habit that prevents the most bugs in React apps. Every extra piece of state is a second copy of the truth that can disagree with the first.

:::mistake Storing what you can calculate
Beginners often keep `visibleMovies` in state next to `movies` and `filter`, then forget to update it when a movie is added. The list on screen silently goes stale. If a value can be computed from state you already have, compute it during render.
:::

## Where the data lives

The movies are needed by `Header` (for the count) and `MovieList` (to show them). The rule: data lives in the closest common parent of every component that needs it, which here is `App`. It flows down as props. When a child needs to change it, the parent passes down a function to call. You'll do exactly that in Section 3.

Next, you'll learn props properly: how to pass data into components, set defaults and keep components reusable.
