---
kind: wrapup
summary: Review what you can now build with JavaScript, pick a sensible next step among TypeScript, a framework, testing and accessibility, and plan practice that keeps your skills growing.
takeaways:
  - You can now write programs that model data, make decisions, transform lists, update a page, handle input, save data and talk to servers.
  - The fastest way to grow from here is building your own small projects, end to end, more than reading about new tools.
  - TypeScript, a framework such as React, testing and accessibility all build directly on what this course taught, and each solves a problem you will now recognise.
  - MDN is the reference to keep open; read error messages fully and debug with evidence before searching for answers.
further:
  - title: JavaScript Guide (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
  - title: TypeScript for JavaScript Programmers
    url: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html
  - title: Quick Start (react.dev)
    url: https://react.dev/learn
quiz:
  - q: You finished Pocket and want to improve fastest. Which plan works best?
    options:
      - text: Read three more tutorials before writing any more code.
        why: Reading helps, but skills come from solving problems you have not seen before. Tutorials alone feel productive and stick poorly.
      - text: Learn three frameworks at once to see which is best.
        why: Frameworks share the same JavaScript foundations. Learning one well teaches more than skimming three.
      - text: Memorise every array method before moving on.
        why: Knowing that a method exists and looking up details on MDN is how professionals work. Memorisation is not the bottleneck.
      - text: Add a feature to Pocket you have not seen built, such as monthly budgets, then build a second small app from scratch.
        why: Correct. Building something without a step-by-step guide forces you to design, debug and look things up, which is the real skill.
    answer: 3
  - q: Pocket keeps breaking when a function receives an expense with `amount` as a string. Which next topic addresses this most directly?
    options:
      - text: TypeScript, which checks the shapes and types of your data before the code runs.
        why: Correct. With types, passing a string where a number is expected becomes an error in your editor, not a bug in production.
      - text: CSS animations.
        why: Animations change how things look and move. They do nothing about the kind of data your functions receive.
      - text: A different code editor theme.
        why: An editor theme changes colours, not the correctness of your program.
    answer: 0
  - q: Which habit from this course matters most when you hit a bug in a new project?
    options:
      - text: Copy the first answer you find online, then move on.
        why: Fixes copied without understanding often solve a different problem and create a new bug.
      - text: Read the full error and stack trace, then check real values at the failing line.
        why: Correct. The message, the line and the actual values usually point straight at the cause.
      - text: Rewrite the whole feature from scratch.
        why: Rewriting throws away working code and often brings the same bug back. Find the cause first.
    answer: 1
---

Think back to the first lesson, when `console.log(450 + 1200)` was a complete program. Since then you have built Pocket: an app that validates input, keeps its data in a single state object, renders a filtered list with totals, handles clicks through one delegated listener, saves to storage, and is organised into modules with clear jobs. You also know *why* each piece works, from what `=` really does to the order in which the event loop runs callbacks.

That foundation does not expire. Frameworks come and go; variables, functions, arrays, objects, the DOM, events and promises are what all of them are made of.

## Keep building

The single most effective next step is to build things nobody has told you how to build. Some ideas, roughly in order of difficulty:

- **Extend Pocket**: add a date to each expense and a "this month" view; set a budget per category and warn when it is close; let users edit an expense; export the data as a CSV file.
- **A habit tracker**: tick off habits each day and show streaks. It uses dates, storage and rendering, and nothing more.
- **A quiz app** that loads questions from a JSON file with `fetch` and keeps a score.
- **Rebuild a small site you use**: a to-do list, a unit converter, a pomodoro timer.

Expect to get stuck. Getting stuck, looking things up on MDN, and debugging your way out is the actual skill, and it only grows by doing it.

## Where to go from here

Each of these builds directly on what you now know, and each solves a problem you have already felt:

- **TypeScript** adds types to JavaScript, so a string arriving where Pocket expects a number of cents becomes an error in your editor instead of a bug in production. When you are comfortable, [Advanced TypeScript Patterns](course:advanced-typescript) goes much further.
- **A UI framework** such as React takes the "state, update, render" pattern from the last lesson and makes it scale to large apps. [React Fundamentals](course:react-fundamentals) assumes exactly the JavaScript you just learned.
- **Testing**: your pure functions in `expenses.js` are perfect for automated tests that prove they work and keep working. [Testing JavaScript Apps](course:testing-javascript) starts there.
- **Accessibility**: you have used labels, `aria-invalid` and real buttons; [Web Accessibility in Practice](course:web-accessibility) makes it a habit for every interface you build.
- **Git**: start saving your projects with [Git & GitHub](course:git-github) now, so you have a history of your progress and a portfolio to show.

## Habits worth keeping

Keep MDN open while you code; it is the reference professional developers use daily. Read every error message to the end before searching for it. When something behaves strangely, check real values with a log or a breakpoint before changing code. And write small functions with clear names: future you is the person most likely to read your code.
