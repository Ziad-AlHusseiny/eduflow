---
summary: Read error messages and stack traces, throw and catch errors on purpose with custom error types, and find bugs systematically with breakpoints and the DevTools debugger.
takeaways:
  - An error message names the error type, says what went wrong, and its stack trace points to the file and line where it happened.
  - Throw an `Error` when your code cannot continue sensibly; catch it only where you can do something useful, and rethrow anything you did not expect.
  - A custom error class (`class ValidationError extends Error`) lets callers tell expected problems apart from real bugs with `instanceof`.
  - "A breakpoint pauses your code on a line so you can inspect every variable and step through it one line at a time; `debugger;` sets one from code."
  - Debug by evidence, not guesswork; reproduce the bug, find the first line where reality differs from your expectation, then fix that.
further:
  - title: Control flow and error handling (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
  - title: What went wrong? Troubleshooting JavaScript (MDN)
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_went_wrong
  - title: Error (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
quiz:
  - q: '`TypeError: expenses.map is not a function` at `renderExpenses (ui.js:14)`. What is the most useful first step?'
    options:
      - text: Wrap line 14 in `try`/`catch` so the page keeps working.
        why: That hides the symptom and leaves the cause. The list would silently stop rendering.
      - text: Rewrite `renderExpenses` with a `for` loop instead of `map`.
        why: The loop would fail too, or behave oddly. The real question is what `expenses` actually is.
      - text: Restart the dev server and clear the browser cache.
        why: The message describes a logic problem, a value of the wrong type, not a stale file.
      - text: Pause at ui.js line 14 and check what `expenses` actually holds, then trace back to where that value came from.
        why: Correct. `map` is missing, so `expenses` is not an array, perhaps `null` from storage or an object. Find out which, then fix the source.
    answer: 3
  - q: 'A `catch` block in Pocket''s save function reads `catch (error) {}`. What is the problem?'
    options:
      - text: Any failure, including a typo-level bug in your own code, now disappears without a trace.
        why: Correct. An empty catch swallows every error. Handle what you expect, log or rethrow the rest.
      - text: The `error` parameter must always be used or the code will not run.
        why: An unused parameter is legal. You can even write `catch {}`. The issue is silently discarding errors.
      - text: '`catch` blocks only work inside `async` functions.'
        why: '`try`/`catch` works in any function. With async code you just have to `await` inside the `try`.'
    answer: 0
  - q: You want to know why a total is wrong only for the 40th expense in a loop. Which DevTools feature fits best?
    options:
      - text: A `console.log` before the loop.
        why: That runs once, before the interesting part. It cannot show you the 40th pass.
      - text: The Network panel.
        why: The Network panel shows requests to servers. This is a calculation inside your own code.
      - text: A conditional breakpoint inside the loop, such as `i === 39`.
        why: Correct. The debugger pauses only on that pass, and you can inspect every variable at that moment.
      - text: Reloading the page with the cache disabled.
        why: Caching does not change how a calculation runs. You need to look at the values during the loop.
    answer: 2
---

Every programmer writes bugs every day. What separates experienced developers from beginners is not fewer bugs but a calmer, faster way of finding them. That starts with reading what the computer is telling you.

## Reading an error

When JavaScript cannot continue, it **throws** an error, and if nothing catches it, the console shows something like this:

```text
Uncaught TypeError: Cannot read properties of undefined (reading 'amount')
    at totalCents (expenses.js:12:31)
    at renderSummary (ui.js:40:17)
    at HTMLFormElement.<anonymous> (main.js:27:5)
```

Read it in three parts. The **type**, `TypeError`, says which kind of problem: a value had the wrong type for what you did to it. The **message** says exactly what: something before `.amount` was `undefined`. The **stack trace** lists the chain of function calls that led there, most recent first: `totalCents` at line 12 of `expenses.js` failed, it was called by `renderSummary`, which was called by the form's submit handler. In DevTools each location is a link straight to that line.

The types you will meet most:

| Type | Usually means |
|---|---|
| `ReferenceError` | A name that does not exist: typo, or used before its declaration |
| `TypeError` | Wrong kind of value: calling a non-function, reading from `undefined` |
| `SyntaxError` | The code cannot be parsed: a missing bracket, quote or comma |
| `RangeError` | A number outside what is allowed, such as `toFixed(200)` |

## Throwing errors on purpose

You can throw errors yourself, and you should when your code is given something it cannot sensibly handle:

```js run
function parseAmount(text) {
  const dollars = Number(text);
  if (text.trim() === "" || !Number.isFinite(dollars) || dollars <= 0) {
    throw new Error(`Invalid amount: "${text}"`);
  }
  return Math.round(dollars * 100);
}

try {
  console.log(parseAmount("12.20"));
  console.log(parseAmount("twelve"));
  console.log("this line never runs");
} catch (error) {
  console.log("Caught:", error.message);
} finally {
  console.log("finally always runs");
}
```

`throw` stops the function immediately and travels up the call stack until some `try`/`catch` catches it. If none does, it becomes an uncaught error in the console. `finally` runs whether or not anything was thrown, which is the place for clean-up such as hiding a loading spinner.

### Custom error types

Some errors are expected, such as a user typing a bad amount; others are bugs. Callers need to tell them apart, and a custom error class makes that possible:

```js run
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function addFromForm(label, amountText) {
  if (label.trim() === "") {
    throw new ValidationError("label", "Enter what you spent money on.");
  }
  return { label: label.trim(), amount: Math.round(Number(amountText) * 100) };
}

try {
  addFromForm("  ", "4.50");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Show next to ${error.field}: ${error.message}`);
  } else {
    throw error; // not ours to handle
  }
}
```

`extends Error` makes `ValidationError` a kind of `Error` with a stack trace, `super(message)` runs the parent constructor, and the extra `field` property tells the form where to show the message. The `catch` handles only what it understands and **rethrows** everything else, so real bugs still surface.

:::mistake The empty catch
`try { save(); } catch (e) {}` makes every failure invisible, including the bug you introduce next month. If you catch an error, do something with it: show a message, use a fallback, or at least `console.error(error)`. Catch as close as possible to where you can actually handle the problem, and nowhere else.
:::

## The debugger: stop and look

`console.log` is a fine first tool, but it only shows what you thought to print. The DevTools **debugger** pauses your program on a line and shows you everything.

In Chrome or Edge, open DevTools, go to the **Sources** panel, open your file and click a line number. That sets a **breakpoint**. The next time that line is about to run, everything pauses, and you can:

- hover over any variable to see its value, or read them all in the **Scope** section;
- read the **Call Stack** section to see how you got there;
- **step over** (run this line, pause at the next), **step into** (follow a function call inside), or **step out** (finish this function);
- type any expression in the Console while paused, using the paused values.

Right-click a line number to add a **conditional breakpoint**, such as `expense.amount > 100000`, which pauses only when the condition is true. You can also write the statement `debugger;` in your code: when DevTools is open, execution pauses there. Remove it before you commit.

:::figure A debugging loop that works on every bug
<svg viewBox="0 0 660 200" role="img" aria-labelledby="t1">
  <title id="t1">A cycle of five steps: reproduce the bug reliably, read the error or describe the wrong output, form a hypothesis, inspect values with logs or breakpoints, then fix and verify, and repeat if the bug remains.</title>
  <rect class="d-box-accent" x="10" y="70" width="110" height="56" rx="10"/>
  <text class="d-label" x="65" y="103" text-anchor="middle">Reproduce</text>
  <rect class="d-box" x="140" y="70" width="110" height="56" rx="10"/>
  <text class="d-label" x="195" y="103" text-anchor="middle">Read</text>
  <rect class="d-box" x="270" y="70" width="120" height="56" rx="10"/>
  <text class="d-label" x="330" y="103" text-anchor="middle">Hypothesise</text>
  <rect class="d-box-primary" x="410" y="70" width="110" height="56" rx="10"/>
  <text class="d-label" x="465" y="103" text-anchor="middle">Inspect</text>
  <rect class="d-box-success" x="540" y="70" width="110" height="56" rx="10"/>
  <text class="d-label" x="595" y="96" text-anchor="middle">Fix and</text>
  <text class="d-label" x="595" y="114" text-anchor="middle">verify</text>
  <path class="d-arrow" d="M120 98 L136 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M250 98 L266 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 98 L406 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M520 98 L536 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M595 126 Q595 180 330 180 Q200 180 200 130" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="420" y="172" text-anchor="middle">still broken: back to reading</text>
</svg>
:::

## A method for any bug

1. **Reproduce** it reliably. "Sometimes the total is wrong" becomes "after deleting the first expense, the total is wrong".
2. **Read** the error, or state precisely what you expected and what you got.
3. **Hypothesise**: what single thing would explain it?
4. **Inspect** the values at the point you suspect, with a breakpoint or a log, and find the first place where reality differs from your expectation.
5. **Fix** the cause there, then **verify** with the exact steps from step 1.

The temptation, especially when tired, is to skip straight to changing code until the symptom goes away. That usually creates a second bug. Ten minutes of looking at real values beats an hour of guessing.

You now have every piece Pocket needs. Next lesson you assemble them into the finished app.
