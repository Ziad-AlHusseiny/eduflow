---
kind: intro
summary: Understand what problem React solves, what "UI as a function of state" means, and what you will build and ship by the end of this course.
takeaways:
  - React lets you describe what the screen should look like for a given state, and it works out which DOM changes to make.
  - A React app is a tree of components, which are plain JavaScript functions that return markup.
  - React 19 is the current major version; this course uses it with Vite for development and Vercel for hosting.
  - You learn by building one app, a Watchlist, a little more in every lesson.
further:
  - title: Quick Start (react.dev)
    url: https://react.dev/learn
  - title: Thinking in React
    url: https://react.dev/learn/thinking-in-react
quiz:
  - q: What does "UI as a function of state" mean in practice?
    options:
      - text: You write code that edits DOM nodes step by step whenever data changes.
        why: That is the imperative style React replaces. With React you describe the result, not the steps to get there.
      - text: You describe what the screen looks like for the current data, and React updates the DOM to match.
        why: Correct. You change the data; React re-runs your components and applies only the differences to the page.
      - text: Every change to the data reloads the whole page from the server.
        why: React updates the page in place, in the browser. Nothing is reloaded, and only changed DOM nodes are touched.
    answer: 1
  - q: Your Watchlist shows "3 to watch" in the header and highlights unwatched movies in the list. A movie gets marked as watched. With plain DOM code, what usually goes wrong?
    options:
      - text: The browser refuses to update two places in one click handler.
        why: The browser can update as many nodes as you like. The problem is remembering to do it in your own code.
      - text: The movie list cannot be changed after the page loads.
        why: The DOM can always be changed. The issue is keeping every changed place in sync by hand.
      - text: One of the places that depends on the data is forgotten, so the header and the list disagree.
        why: Correct. Every new feature adds another place to keep in sync. React removes that bookkeeping, because both are derived from the same data on every render.
    answer: 2
  - q: Which statement about React in 2026 is accurate?
    options:
      - text: React 19 is the current major version, and Vite is a common way to start a client-side React app.
        why: Correct. The React docs point you to frameworks or a build tool such as Vite, and Create React App is deprecated.
      - text: You need the React Compiler turned on before React 19 will run.
        why: The React Compiler is an optional build-time optimization. React 19 runs fine without it.
      - text: Class components are required for any component that has state.
        why: Function components with Hooks such as useState have been the standard way to write stateful components for years.
    answer: 0
---

You have probably written a little JavaScript that changes a page: find an element, set its text, add a class, append a list item. It works for one button. Then you add a counter in the header that has to match the list, a filter that hides some items, and an empty-state message. Every click now has to update four places, in the right order, and the day you forget one, the header says "3 to watch" while the list shows two.

That bookkeeping is the problem React was built to remove.

## Describe the result, not the steps

With React you write components: JavaScript functions that take some data and return a description of the screen. When the data changes, React calls your functions again, compares the new description with the previous one, and makes only the DOM changes needed to get from one to the other.

```jsx title=src/App.jsx
function WatchCount({ movies }) {
  const left = movies.filter((m) => !m.watched).length;
  return <p>{left} to watch</p>;
}
```

There is no "when a movie is marked watched, find the header and decrement the number" code anywhere. The count is calculated from the list every time, so it can't drift out of sync. People summarise this as **UI as a function of state**: the same data always produces the same screen.

That one idea explains most of what you will learn. Props are how data flows into a component. State is data that changes over time. Events are how the user asks for a change. Effects are how you sync with things outside React, such as the page title or localStorage.

## Why React, and why now

There are good alternatives (Vue, Svelte, Solid, Angular), and the ideas transfer between them. React is still the safe default for a career switcher for three practical reasons: it appears in more front-end job listings than anything else, it has the largest ecosystem of libraries and answers, and React Native lets the same skills build mobile apps.

React 19 is the current major version. It made a few things simpler: `ref` is now a regular prop, forms got first-class support through Actions, and an optional React Compiler can handle many performance optimizations for you. You will meet each of these where it matters, without memorising history. Older tutorials that use Create React App or class components are out of date; skip them.

:::note What you need on your machine
A current LTS release of Node.js (22 or 24), a code editor such as VS Code, and a modern browser. You will set everything else up in the next lesson.
:::

## What you will build

The whole course builds one app: a **Watchlist** for movies you want to see. By the end it will let you add a movie through a form, mark it watched, filter the list by status, and keep everything in localStorage so a refresh doesn't wipe it. In the last section you style it with Tailwind CSS and deploy it to Vercel, so you finish with a real URL you can put on your CV.

Most lessons end with a hands-on exercise in the browser playground. Do them. Reading about state is very different from watching your own button refuse to update and working out why.

Next, you set up a real project on your computer with Vite and see where React actually lives in it.
