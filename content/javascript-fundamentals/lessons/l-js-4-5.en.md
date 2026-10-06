---
summary: Explain why JavaScript waits without freezing, read and write promise-based code with then and async/await, call fetch with proper error handling, and predict output order using the event loop.
takeaways:
  - JavaScript runs one thing at a time; slow work such as network requests and timers happens outside your code, which is called back when it finishes.
  - A promise is an object standing for a value that will arrive later; it ends up fulfilled with a value or rejected with an error.
  - "`await` pauses only the surrounding `async` function until a promise settles; wrap awaits in `try`/`catch` to handle rejections."
  - "`fetch` rejects only when the network fails; for HTTP errors such as 404 it resolves with `response.ok` set to false, so always check it."
  - After each piece of synchronous code, the event loop runs all queued promise callbacks before the next timer or event.
further:
  - title: Using promises (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
  - title: async function (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  - title: Using the Fetch API (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  - title: The event loop (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model
quiz:
  - q: |
      In what order are the lines logged?
      ```js
      console.log("A");
      setTimeout(() => console.log("B"), 0);
      Promise.resolve().then(() => console.log("C"));
      console.log("D");
      ```
    options:
      - text: A, B, C, D
        why: That is the order the lines are written, but B and C are callbacks that run later, after all synchronous code.
      - text: A, D, B, C
        why: Both callbacks wait for the synchronous code, but promise callbacks (microtasks) run before timer callbacks.
      - text: A, D, C, B
        why: Correct. A and D run now. Then the microtask queue empties (C), and only then does the timer's task run (B), even with a 0 ms delay.
    answer: 2
  - q: '`const data = getRates(); console.log(data.EUR);` where `getRates` is an `async` function. What is logged?'
    options:
      - text: The EUR rate, because `async` functions return their value directly.
        why: An `async` function always returns a promise. Without `await`, `data` is that promise, not the rates.
      - text: '`undefined`, because `data` is a pending promise, which has no `EUR` property.'
        why: Correct. Write `const data = await getRates();` inside an async function, or use `.then`.
      - text: It throws, because you cannot call an async function without `await`.
        why: You can call it; you just get a promise back. Forgetting `await` fails quietly, which is why it is a common bug.
    answer: 1
  - q: Your server returns 404 Not Found for `fetch("/api/rates")`. What does the fetch promise do?
    options:
      - text: It resolves with a response whose `ok` is false and `status` is 404.
        why: Correct. HTTP errors are still successful network round trips. You must check `response.ok` yourself and throw if you want a rejection.
      - text: It rejects, so your `catch` block runs.
        why: '`fetch` only rejects for network-level failures such as being offline. A 404 is a valid HTTP response.'
      - text: It never settles, so your code waits forever.
        why: The server answered, so the promise settles. It resolves with the 404 response.
    answer: 0
  - q: You need the rates and the category list, from two independent URLs, before rendering. Which is fastest?
    options:
      - text: '`const r = await getRates(); const c = await getCategories();`'
        why: This works, but the second request only starts after the first finishes, so you wait for both one after the other.
      - text: '`const [r, c] = await Promise.all([getRates(), getCategories()]);`'
        why: Correct. Both requests start immediately and you wait once, for the slower of the two.
      - text: '`const r = getRates(); const c = getCategories();` without await.'
        why: Both start in parallel, but `r` and `c` are promises, not data, so rendering with them would fail.
    answer: 1
---

Pocket would be more useful if it could show your spending in euros too, which means asking a server for today's exchange rates. That request might take 50 milliseconds or five seconds. If JavaScript simply stopped and waited, the whole page would freeze: no scrolling, no typing, no clicks. Since your code shares one thread with the page itself, it needs a way to start slow work, carry on, and pick up the result later. That is what **asynchronous** code is.

## Callbacks: "call me when it is done"

The oldest form of "later" is a callback. `setTimeout` asks the browser to call a function after a delay:

```js run
console.log("Requesting rates…");
setTimeout(() => {
  console.log("Rates arrived");
}, 100);
console.log("Still responsive");
```

"Still responsive" prints before "Rates arrived". `setTimeout` does not pause anything; it hands the function to the browser and returns immediately. Callbacks work, but when step two needs step one's result and step three needs step two's, they nest deeper and deeper, and error handling has to be repeated at every level. Promises were added to fix that.

## Promises: a value that arrives later

A **promise** is an object that stands for a result that is not ready yet. It starts **pending**, and settles exactly once: **fulfilled** with a value, or **rejected** with an error. You attach what should happen next with `.then` (on success) and `.catch` (on failure).

This course's sandbox has no network, so the examples use `fakeFetch`, a stand-in that behaves like the real `fetch`: it returns a promise of a response object with `ok`, `status` and a `json()` method.

```js run
function fakeFetch(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url === "/api/rates") {
        resolve({ ok: true, status: 200, json: async () => ({ EUR: 0.86, GBP: 0.75 }) });
      } else {
        resolve({ ok: false, status: 404, json: async () => ({ error: "Not found" }) });
      }
    }, 50);
  });
}

fakeFetch("/api/rates")
  .then((response) => response.json())
  .then((rates) => console.log("EUR rate:", rates.EUR))
  .catch((error) => console.log("Failed:", error.message));
```

Each `.then` returns a new promise, so steps chain in a flat line instead of nesting, and one `.catch` at the end handles a failure from any step. You will rarely create promises with `new Promise` yourself; libraries and browser APIs hand them to you, and your job is to consume them.

## async and await: promises that read like normal code

`async`/`await` is a more readable way to write the same thing. Inside a function marked `async`, `await promise` pauses **that function** until the promise settles, then gives you its value. Errors become ordinary exceptions you catch with `try`/`catch`:

```js run
function fakeFetch(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ok = url === "/api/rates";
      const body = ok ? { EUR: 0.86 } : { error: "Not found" };
      resolve({ ok, status: ok ? 200 : 404, json: async () => body });
    }, 50);
  });
}

async function getJson(url) {
  const response = await fakeFetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function showRates() {
  try {
    const rates = await getJson("/api/rates");
    console.log("EUR:", rates.EUR);
    await getJson("/api/missing");
  } catch (error) {
    console.log("Could not load:", error.message);
  }
}

showRates();
```

Notice what `await` does **not** do: it does not freeze the page. While `showRates` waits, the browser keeps handling clicks and drawing frames. Only this one function is paused.

An `async` function always returns a promise, even when you `return` a plain value. So whoever calls it must `await` it too, or use `.then`.

:::mistake Forgetting await
`const rates = getJson("/api/rates"); console.log(rates.EUR);` logs `undefined`, because `rates` is a pending promise, not the data. Logging `rates` itself shows `Promise { <pending> }`, which is the giveaway. Add `await` (inside an `async` function).
:::

## fetch, for real

In a real page, you replace `fakeFetch` with the browser's `fetch`, and the shape of the code stays the same:

```js title=rates.js
async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}
```

The `response.ok` check is essential, and many tutorials leave it out. `fetch` only rejects when the request could not happen at all, for example when the user is offline. A 404 or a 500 is a perfectly good HTTP response, so the promise **resolves**, with `ok` set to `false`. Without the check, your code would try to read rates out of an error page.

When two requests do not depend on each other, start both and wait once with `Promise.all` (inside an `async` function, like every `await`), which fulfils with an array of results or rejects as soon as either fails:

```js title=rates.js
const [rates, categories] = await Promise.all([
  getJson("/api/rates"),
  getJson("/api/categories"),
]);
```

## The event loop

How can one thread do all this? The engine runs your code on a **call stack**, one function at a time. Slow things, such as timers and network requests, are handled by the browser outside the stack. When one finishes, its callback is put in a queue. Whenever the stack is empty, the **event loop** takes the next callback from a queue and runs it.

:::figure The event loop runs queued callbacks when the stack is empty
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">Your code runs on the call stack. Timers and fetch are handled by the browser, which puts finished callbacks into queues. Promise callbacks go to the microtask queue, timers and events to the task queue. When the stack is empty, the event loop first runs all microtasks, then one task.</title>
  <rect class="d-box-primary" x="20" y="30" width="170" height="170" rx="12"/>
  <text class="d-label-strong" x="105" y="56" text-anchor="middle">Call stack</text>
  <rect class="d-box" x="40" y="74" width="130" height="34" rx="8"/>
  <text class="d-code" x="105" y="96" text-anchor="middle">showRates()</text>
  <rect class="d-box" x="40" y="116" width="130" height="34" rx="8"/>
  <text class="d-code" x="105" y="138" text-anchor="middle">main script</text>
  <rect class="d-box-accent" x="250" y="30" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="335" y="58" text-anchor="middle">Browser</text>
  <text class="d-label" x="335" y="84" text-anchor="middle">timers, fetch</text>
  <rect class="d-box-success" x="480" y="30" width="180" height="70" rx="12"/>
  <text class="d-label-strong" x="570" y="56" text-anchor="middle">Microtasks</text>
  <text class="d-label" x="570" y="80" text-anchor="middle">promise callbacks</text>
  <rect class="d-box-warn" x="480" y="140" width="180" height="70" rx="12"/>
  <text class="d-label-strong" x="570" y="166" text-anchor="middle">Tasks</text>
  <text class="d-label" x="570" y="190" text-anchor="middle">timers, clicks</text>
  <path class="d-arrow" d="M190 70 L246 70" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 60 L476 60" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 90 L476 160" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 90 Q330 150 194 150" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 190 Q330 235 194 185" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="335" y="142" text-anchor="middle">1. all microtasks</text>
  <text class="d-label-muted" x="335" y="240" text-anchor="middle">2. then one task</text>
</svg>
:::

There are two queues, and the order between them explains many puzzles. Promise callbacks go into the **microtask queue**; timers and events go into the **task queue**. Each time the stack empties, the loop runs **every** waiting microtask first, then one task, then checks microtasks again:

```js run
console.log("1: script");
setTimeout(() => console.log("4: timeout task"), 0);
Promise.resolve().then(() => console.log("3: promise microtask"));
console.log("2: script");
```

A timeout of 0 ms does not mean "now"; it means "as a task, once the stack is clear and the microtasks are done". The same model explains why a long loop freezes the page: while your code occupies the stack, no click handler, timer or redraw can run.

:::tip Show loading and error states
Every network call has three outcomes the user can see: waiting, success and failure. Set a "Loading…" message before the `await`, replace it with the data on success, and show a helpful message in the `catch`. An app that silently shows nothing while it waits, or after it fails, feels broken.
:::

Section 4 is complete: Pocket lives on a page, reacts to clicks, takes input, saves data and can talk to a server. Section 5 turns this growing pile of code into a well-organised program.
