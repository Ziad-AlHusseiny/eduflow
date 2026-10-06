---
summary: Turn data into JSON text and back with JSON.stringify and JSON.parse, know what JSON cannot hold, and save and load Pocket's expenses with localStorage safely.
takeaways:
  - JSON is a text format for data; `JSON.stringify` turns values into JSON text and `JSON.parse` turns JSON text back into values.
  - JSON holds strings, numbers, booleans, null, arrays and plain objects; functions and `undefined` are dropped, and dates become strings.
  - "`localStorage` stores strings only, per website, in the user's browser; save with `setItem(key, JSON.stringify(data))`."
  - Loading must survive a missing key (`getItem` returns `null`) and corrupted text (`JSON.parse` throws), so wrap it in `try`/`catch` with a fallback.
further:
  - title: Working with JSON (MDN)
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON
  - title: JSON.stringify() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
  - title: Window.localStorage (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
quiz:
  - q: '`localStorage.setItem("expenses", expenses)` is called with an array of objects. What is stored?'
    options:
      - text: The text `"[object Object],[object Object]"`.
        why: Correct. Each object converts to "[object Object]" and the data is lost. Store `JSON.stringify(expenses)` instead.
      - text: The array, ready to use when you read it back.
        why: '`localStorage` only stores strings. Anything else is converted with `String()` first.'
      - text: Nothing; `setItem` throws for non-string values.
        why: It does not throw. It silently converts the value to a string, which is why the bug is easy to miss.
    answer: 0
  - q: 'What does `JSON.stringify({ label: "Tea", note: undefined, amount: 300 })` produce?'
    options:
      - text: '`{"label":"Tea","amount":300}`'
        why: Correct. Properties whose value is `undefined` (and functions) are left out, because JSON has no way to write them.
      - text: '`{"label":"Tea","note":undefined,"amount":300}`'
        why: '`undefined` is not valid JSON, so `stringify` never writes it inside an object.'
      - text: '`{"label":"Tea","note":null,"amount":300}`'
        why: '`stringify` drops `undefined` properties rather than converting them to null. Only `null` itself is written as null.'
    answer: 0
  - q: 'Pocket loads with `JSON.parse(localStorage.getItem("pocket.expenses"))` on a first visit, when nothing was saved yet. What happens?'
    options:
      - text: It throws, because `getItem` throws for unknown keys.
        why: '`getItem` returns `null` for a missing key; it does not throw.'
      - text: 'It returns `null`, because `JSON.parse(null)` treats null as the JSON text "null".'
        why: Correct. The code then crashes later when it calls `.map` on `null`. Fall back with `?? []` or an explicit check.
      - text: It returns an empty array.
        why: Nothing creates an array here. You need to supply the empty-array fallback yourself.
    answer: 1
---

Add three expenses to Pocket, reload the page, and they are gone. Everything you built lives in JavaScript variables, and variables only last as long as the page. To remember data between visits you need to store it somewhere, and the simplest place a web page can store data is in the user's own browser. First, though, the data has to become text.

## JSON: data as text

**JSON** (JavaScript Object Notation) is a text format for data. It looks almost exactly like JavaScript object and array literals, which is no coincidence, and today it is the most common format for sending data between programs on the web.

```js run
const expenses = [
  { id: "exp-1", label: "Coffee", amount: 450, tags: ["work"] },
  { id: "exp-2", label: "Train", amount: 1220, tags: [] },
];

const text = JSON.stringify(expenses);
console.log(typeof text);
console.log(text);

const back = JSON.parse(text);
console.log(back[1].label, back === expenses);
```

`JSON.stringify` turns a value into a JSON string. `JSON.parse` reads a JSON string and builds new values from it. The result is a fresh copy with the same contents, which is why `back === expenses` is `false`.

JSON's rules are stricter than JavaScript's: property names must be in double quotes, strings use double quotes only, and trailing commas are not allowed. You rarely write JSON by hand, but when you do, those three rules cause most parse errors. For a readable version, `JSON.stringify(value, null, 2)` indents the output by two spaces.

### What JSON cannot hold

JSON knows strings, numbers, booleans, `null`, arrays and plain objects. Anything else is changed or lost on the way through:

```js run
const tricky = {
  when: new Date("2026-10-05T09:30:00Z"),
  note: undefined,
  format() { return "hi"; },
  tags: new Set(["work"]),
  ratio: NaN,
};
console.log(JSON.stringify(tricky));
```

Dates become ISO strings and do not come back as dates, `undefined` properties and functions are dropped, Sets and Maps become empty objects, and `NaN` becomes `null`. Pocket avoids all of this by design: amounts are whole numbers, dates are stored as `"2026-10-05"` strings, and categories are plain strings. Choosing JSON-friendly data from the start saves a lot of conversion code later.

:::mistake Parsing without a safety net
`JSON.parse` throws a `SyntaxError` when the text is not valid JSON, for example a half-written value or something another script stored under the same key. If that happens while your app starts up, the whole app fails to load. Any parse of text you did not just create yourself belongs inside `try`/`catch`.
:::

## localStorage: a small store in the browser

Every website gets a small key-value store in each user's browser, called `localStorage`. It survives reloads and browser restarts, and it holds **strings only**:

```js title=storage.js
localStorage.setItem("pocket.theme", "dark");
console.log(localStorage.getItem("pocket.theme")); // "dark"
console.log(localStorage.getItem("nothing-here")); // null
localStorage.removeItem("pocket.theme");
```

To store an array of expenses, turn it into JSON on the way in and parse it on the way out:

:::figure Saving and loading goes through JSON text
<svg viewBox="0 0 680 200" role="img" aria-labelledby="t1">
  <title id="t1">Saving: the expenses array is turned into a JSON string with JSON.stringify and stored with setItem. Loading: getItem returns the string, and JSON.parse turns it back into a new array.</title>
  <rect class="d-box-primary" x="10" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="85" y="96" text-anchor="middle">expenses</text>
  <text class="d-label-muted" x="85" y="116" text-anchor="middle">array of objects</text>
  <rect class="d-box" x="265" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="340" y="96" text-anchor="middle">JSON string</text>
  <text class="d-code" x="340" y="116" text-anchor="middle">'[{"id":…}]'</text>
  <rect class="d-box-accent" x="520" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="595" y="104" text-anchor="middle">localStorage</text>
  <path class="d-arrow" d="M160 82 L261 82" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M415 82 L516 82" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M516 114 L419 114" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M261 114 L164 114" marker-end="url(#arrow)"/>
  <text class="d-code" x="212" y="60" text-anchor="middle">stringify</text>
  <text class="d-code" x="467" y="60" text-anchor="middle">setItem</text>
  <text class="d-code" x="467" y="150" text-anchor="middle">getItem</text>
  <text class="d-code" x="212" y="150" text-anchor="middle">parse</text>
</svg>
:::

```js title=storage.js
const STORAGE_KEY = "pocket.expenses.v1";

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadExpenses() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    const data = text === null ? [] : JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
```

`loadExpenses` is defensive on purpose, because it runs on every page load and must never crash the app. A first-time visitor has nothing saved, so `getItem` returns `null` and we start with an empty list. Corrupted text makes `JSON.parse` throw, and the `catch` falls back to an empty list. Some browsers' privacy modes block storage entirely, and that throws too, into the same `catch`. Finally, `Array.isArray` guards against valid JSON of the wrong shape. The `.v1` in the key lets a future version of Pocket change the data format and migrate old data instead of misreading it.

Then wire it up: load once at start-up, and save every time the data changes, right where you already call `renderExpenses`:

```js title=app.js
let expenses = loadExpenses();
renderExpenses();

function setExpenses(next) {
  expenses = next;
  saveExpenses(expenses);
  renderExpenses();
}
```

Routing every change through one `setExpenses` function means you cannot forget to save in one handler and remember in another.

To see what is stored, open DevTools, go to the Application panel in Chrome or Edge (Storage in Firefox), and expand Local Storage. You can read, edit and delete entries there, which is the quickest way to test what your app does with missing or broken data. There is also `sessionStorage`, with the same methods, which is cleared when the tab is closed.

:::why Know the limits
`localStorage` is about 5 MB per site, synchronous (a huge save briefly blocks the page), and readable by any script running on your site. It is right for preferences and a personal app's data. It is wrong for passwords, tokens or anything sensitive, and for data that must follow the user to another device, which needs a server.
:::

You can now keep data across visits. The other big source of data is a server on the internet, and talking to one means waiting for an answer. Waiting is the subject of the next lesson.
