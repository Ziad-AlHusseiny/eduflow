---
kind: wrapup
summary: Review what you can now build with React, extend the Watchlist with concrete challenges, and choose the next topics to learn in an order that builds on this course.
takeaways:
  - Components, props, state, events and Effects are the core of React; everything else builds on them.
  - Extending your own project with new features is the fastest way to make this course stick.
  - TypeScript and testing are the two skills that most change how employers read a junior React portfolio.
  - For data fetching and multi-page apps, reach for established tools such as TanStack Query, React Router or a framework rather than building your own.
further:
  - title: React reference overview
    url: https://react.dev/reference/react
  - title: Creating a React App (frameworks)
    url: https://react.dev/learn/creating-a-react-app
  - title: React Compiler
    url: https://react.dev/learn/react-compiler
  - title: Getting Started with Vitest
    url: https://vitest.dev/guide/
quiz:
  - q: You want to add a "sort by year" option to the Watchlist. Based on this course, what's the right first design decision?
    options:
      - text: Store the chosen sort order in state and compute a sorted copy of the movies during render.
        why: Correct. The sort order is real state; the sorted list is derived from movies and sort order, so it shouldn't be stored.
      - text: Store a sorted copy of the movies in state and update it with an Effect.
        why: That duplicates the movie list and syncs it with an Effect, the exact pattern the course taught you to avoid.
      - text: Sort the movies array in place with `sort` before rendering.
        why: In-place sort mutates state. Use `toSorted` or sort a copy.
    answer: 0
  - q: A job listing asks for "React, TypeScript, testing". Which next step adds the most to your Watchlist portfolio project?
    options:
      - text: Rewriting it with class components to show range.
        why: Class components are legacy. Showing them signals outdated knowledge rather than range.
      - text: Adding more animation libraries.
        why: Polish helps, but it doesn't address the skills the listing names.
      - text: Converting it to TypeScript and adding a few component tests with Vitest and React Testing Library.
        why: Correct. Typed props and tests that click through real flows are what reviewers look for in a junior React project.
      - text: Moving all state into a global store library.
        why: The Watchlist doesn't need a global store, and adding one without a reason suggests cargo-cult architecture.
    answer: 2
  - q: Your team turns on the React Compiler. What changes for the code you write?
    options:
      - text: You must wrap every component in `memo` for the compiler to work.
        why: The compiler does that kind of memoization for you; adding it by hand is what it makes unnecessary.
      - text: You keep writing plain components that follow the rules of React, and the compiler adds memoization at build time.
        why: Correct. It's an optional build step. Pure components and correct Hook usage, which you already practise, are what it relies on.
      - text: Effects are no longer allowed.
        why: Effects still exist and are still for syncing with outside systems. The compiler doesn't remove any Hook.
    answer: 1
---

Eighteen lessons ago you had an empty folder. Now you have a deployed app built from small components, with state that lives in one place, derived values that can't drift, a form with real validation, an Effect that persists data and cleans up after itself, a stylesheet you didn't have to write by hand, and a URL. More importantly, you know *why* each of those decisions was made, which is what lets you make them again in a different app.

## What you can do now

Look back at the six promises on the course page and check each one against something you built:

- **Components, props and state**: every part of the Watchlist, from `MovieItem` to `App`.
- **A React 19 and Vite workflow**: `npm create vite@latest`, the dev server, `npm run build`.
- **Events, forms and controlled inputs**: the add-movie form, with trimming, disabling and clearing.
- **Effects the right way**: the tab title and localStorage, and all the places you *didn't* use one.
- **Composing screens from small pieces**: `Panel`, `MovieList` and the rest, each with a few props and a clear job.
- **Shipping to production**: a Vercel deployment with preview URLs for every branch.

## Make the Watchlist yours

The fastest way to make this stick is to keep building the same app, without a tutorial. Each of these uses only what you've learned:

1. **Sort**: a select for "Newest first" and "Title A–Z". One new piece of state, one derived list.
2. **Edit a title**: double-click a title to turn it into an input; Enter saves, Escape cancels.
3. **Search**: a text field that filters by title as you type, combined with the status filter.
4. **Undo remove**: keep the last removed movie and show an "Undo" button for a few seconds. You'll need a timer in an Effect, with cleanup.
5. **Keyboard shortcut**: press "/" to focus the add field, with a window listener in an Effect and a `ref`.

Push each feature on its own branch and check its preview URL before merging, exactly like a team would.

## What to learn next

An order that builds on this course:

1. **TypeScript.** Typing props and state catches a whole class of bugs before you run anything, and most React job listings expect it. Start a project with `--template react-ts`, or convert the Watchlist file by file. The [Advanced TypeScript Patterns](course:advanced-typescript) course goes much further once you're comfortable.
2. **Testing.** Vitest with React Testing Library lets you render a component, click it like a user and assert on the result. Your small components are already easy to test. See [Testing JavaScript Apps](course:testing-javascript).
3. **More Hooks.** `useRef` for DOM access and values that don't trigger renders, `useReducer` when update logic grows, and `useContext` for data many components need. The React Compiler, an optional build step, handles most memoization, so learn `useMemo` and `memo` but don't sprinkle them everywhere.
4. **Data fetching.** Real apps load data from servers. Fetching in an Effect works for simple cases if you handle race conditions; for anything more, use TanStack Query, which handles caching, loading and error states for you.
5. **Routing and frameworks.** For several pages, add React Router. For server rendering, data loading and React Server Components, use a framework such as Next.js or React Router's framework mode, as the React docs recommend for new full-scale apps.

:::tip Learn in your own project
When you study a new tool, add it to the Watchlist instead of starting a tutorial project. You already understand every line of the app, so the only new thing is the tool itself.
:::

You came here to build interactive UIs with React. You've built one and shipped it. Keep building.
