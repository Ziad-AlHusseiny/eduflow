---
summary: Understand the DOM as the browser's live tree of the page, select elements with CSS selectors, change their text, classes and attributes, and render a list from data.
takeaways:
  - The browser turns your HTML into the DOM, a tree of objects; changing those objects with JavaScript changes the page immediately.
  - "`querySelector` returns the first element matching a CSS selector, or `null`; `querySelectorAll` returns all matches."
  - Set text with `textContent`, not `innerHTML`, whenever the content comes from data or users, so it can never run as HTML.
  - "Change appearance through `classList` and let CSS decide what the classes look like."
  - "A `render` function that clears a container and rebuilds it from your data keeps the page and the data in sync."
further:
  - title: Introduction to the DOM (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
  - title: Document.querySelector() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
  - title: Element.classList (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
quiz:
  - q: '`document.querySelector("#totl").textContent = "$0.00";` throws `TypeError: Cannot set properties of null`. What is the most likely cause?'
    options:
      - text: The selector matched nothing, so `querySelector` returned `null`.
        why: Correct. A typo in the id (`totl`), or running the script before the element exists, both produce `null`.
      - text: '`textContent` cannot be set on paragraphs.'
        why: '`textContent` can be set on any element. The error says the thing before `.textContent` was `null`.'
      - text: The page needs to be reloaded after changing the DOM.
        why: DOM changes show up immediately. No reload is needed or wanted.
    answer: 0
  - q: A user types `<img src=x onerror=alert(1)>` as an expense label. Which line displays it safely?
    options:
      - text: '`li.innerHTML = label;`'
        why: '`innerHTML` parses the text as HTML, so the image tag is created and its `onerror` code runs. This is an XSS hole.'
      - text: '`li.textContent = label;`'
        why: Correct. `textContent` inserts plain text, so the user sees the characters they typed and nothing runs.
      - text: '`` li.innerHTML = `<span>${label}</span>`; ``'
        why: Wrapping the label in a template literal still sends it through the HTML parser. The tag inside is still created.
    answer: 1
  - q: Your `render` function appends one `<li>` per expense. After adding a fourth expense and calling `render` again, the list shows seven items. What is missing?
    options:
      - text: Clearing the list before rebuilding it, for example with `list.replaceChildren()`.
        why: Correct. Without clearing, every render appends a full new copy after the old items.
      - text: A call to `querySelectorAll` instead of `querySelector`.
        why: The container is a single element, so `querySelector` is right. The problem is the old children are never removed.
      - text: '`const` instead of `let` for the expenses array.'
        why: How the array is declared does not affect the DOM. The duplicates come from never removing the previous items.
    answer: 0
---

Everything Pocket has done so far happened in the console. A real user never opens the console; they see a page. The rest of this section moves Pocket onto that page, and the first step is learning how JavaScript sees a web page at all.

## The DOM: the page as objects

When a browser loads HTML, it does not keep it as text. It builds a tree of objects, one for every element, and draws the page from that tree. The tree is the **DOM** (Document Object Model), and the global `document` object is its root.

```html title=index.html
<body>
  <h1>Pocket</h1>
  <p id="total">Total: $0.00</p>
  <ul id="expense-list"></ul>
  <script src="app.js" defer></script>
</body>
```

:::figure The browser turns HTML into a tree of element objects
<svg viewBox="0 0 640 230" role="img" aria-labelledby="t1">
  <title id="t1">The DOM tree for the Pocket page: document contains body, and body contains an h1, a p with id total, and a ul with id expense-list. JavaScript reads and changes these objects, and the browser redraws the page.</title>
  <rect class="d-box-accent" x="250" y="14" width="140" height="40" rx="10"/>
  <text class="d-code" x="320" y="39" text-anchor="middle">document</text>
  <rect class="d-box" x="260" y="80" width="120" height="40" rx="10"/>
  <text class="d-code" x="320" y="105" text-anchor="middle">body</text>
  <rect class="d-box" x="40" y="160" width="140" height="44" rx="10"/>
  <text class="d-code" x="110" y="187" text-anchor="middle">h1</text>
  <rect class="d-box-primary" x="250" y="160" width="140" height="44" rx="10"/>
  <text class="d-code" x="320" y="187" text-anchor="middle">p#total</text>
  <rect class="d-box-primary" x="460" y="160" width="160" height="44" rx="10"/>
  <text class="d-code" x="540" y="187" text-anchor="middle">ul#expense-list</text>
  <path class="d-line" d="M320 54 L320 80"/>
  <path class="d-line" d="M300 120 L110 160"/>
  <path class="d-line" d="M320 120 L320 160"/>
  <path class="d-line" d="M340 120 L540 160"/>
  <text class="d-label-muted" x="540" y="130" text-anchor="middle">JavaScript changes these</text>
</svg>
:::

The DOM is live. Change an object in the tree and the browser redraws that part of the page straight away. That is all "updating the page" means.

The `defer` attribute tells the browser to run `app.js` after it has built the whole tree. Without it, a script in the `<head>` runs before the body exists and every lookup finds nothing. Scripts loaded with `type="module"`, which you will meet in section 5, are deferred automatically.

## Selecting elements

`document.querySelector(selector)` takes a CSS selector, the same syntax you write in a stylesheet, and returns the first matching element. `querySelectorAll` returns all matches.

```js title=app.js
const totalEl = document.querySelector("#total");          // by id
const list = document.querySelector("#expense-list");
const firstItem = document.querySelector("#expense-list li");
const allItems = document.querySelectorAll("li.big");      // every match
```

`querySelectorAll` returns a NodeList. It has `forEach` and works with `for...of`; spread it, `[...allItems]`, when you want array methods such as `map` and `filter`.

When nothing matches, `querySelector` returns `null`, and the next line that uses the result throws `TypeError: Cannot set properties of null`. That error almost always means a typo in the selector or a script that ran too early.

## Changing what is there

Once you have an element, its properties are the levers:

```js title=app.js
totalEl.textContent = "Total: $30.20";      // replace the text
totalEl.classList.add("over-budget");       // add a CSS class
totalEl.classList.toggle("highlight");      // add if absent, remove if present
totalEl.hidden = false;                     // show or hide
list.dataset.month = "2026-10";             // sets data-month="2026-10"
```

`textContent` sets plain text. Prefer classes over setting `style` directly: the CSS file decides what `.over-budget` looks like, and JavaScript only decides *whether* the element has it. Designers can then change the look without touching your logic.

:::mistake innerHTML with user data
`li.innerHTML = expense.label` hands the label to the HTML parser. If a user types `<img src=x onerror="…">` as a label, that code runs on the page. This is called cross-site scripting (XSS), and it is one of the most common security bugs on the web. Use `textContent` for anything that came from data or a user. Reserve `innerHTML` for fixed markup you wrote yourself.
:::

## Creating elements and rendering a list

To add new things to the page, create elements, fill them in, and attach them:

```js title=app.js
const li = document.createElement("li");
li.textContent = "Coffee: $4.50";
li.dataset.id = "exp-1";
list.append(li);
```

`createElement` makes an element that is not on the page yet. `append` attaches it as the last child of `list`, and only then does it appear. `element.remove()` takes an element off the page.

Pocket has an array of expenses and needs one `<li>` per expense. The cleanest way to keep the page and the data in agreement is a **render function**: it clears the container, then rebuilds it from the data, every time the data changes.

```js title=app.js
function renderExpenses(expenses) {
  list.replaceChildren(); // remove the old items
  for (const expense of expenses) {
    const li = document.createElement("li");
    li.textContent = `${expense.label}: ${formatMoney(expense.amount)}`;
    li.dataset.id = expense.id;
    if (expense.amount >= 10000) {
      li.classList.add("big");
    }
    list.append(li);
  }
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalEl.textContent = `Total: ${formatMoney(total)}`;
}
```

Rebuilding everything sounds wasteful, and for thousands of items it would be. For the dozens of items in a personal app, it is fast and, more importantly, simple: there is exactly one function that decides what the list looks like, and the page can never drift out of step with the data. This idea, the screen as a function of the data, is the core of frameworks like React, which do the same thing more cleverly.

The rule that makes it work is discipline about direction. Data flows one way: change the array, then call `renderExpenses`. Never fix up a single `<li>` by hand "just this once", and never read the expenses back out of the page to calculate something; the page is a picture of the data, not the data itself. The moment two places can change what is on screen, they will eventually disagree.

:::tip Explore any page in DevTools
Open DevTools on any website, select an element in the Elements panel, then type `$0` in the Console. `$0` is the element you selected, so you can try `$0.textContent` or `$0.classList` on real pages.
:::

The page now shows Pocket's data, but it cannot react to the user yet. Next lesson: events.
