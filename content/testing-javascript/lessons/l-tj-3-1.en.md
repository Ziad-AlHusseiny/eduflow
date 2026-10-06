---
summary: Find elements in DOM tests the way users and assistive technology do, with Testing Library's role, label and text queries in the recommended priority order.
takeaways:
  - Query by what users perceive (role and accessible name, label, visible text), not by CSS classes or DOM structure, so restyling doesn't break tests.
  - "The priority order is: `getByRole`, then `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue`, then alt text and title, and `getByTestId` last."
  - "`getBy` throws when it finds zero or several matches, `queryBy` returns `null` (use it to assert absence), and `findBy` waits for an element to appear."
  - If a role query can't find your element, the markup is often not accessible yet; fix the markup rather than switching to a test id.
further:
  - title: Testing Library — About Queries
    url: https://testing-library.com/docs/queries/about
  - title: Testing Library — ByRole
    url: https://testing-library.com/docs/queries/byrole
  - title: MDN — ARIA roles
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles
quiz:
  - q: "The \"Settle up\" button is rendered as `<button class=\"btn btn-primary\" data-testid=\"settle\">Settle up</button>`. Which query should a test use?"
    options:
      - text: "`container.querySelector('.btn-primary')`"
        why: Class names are styling decisions; renaming them during a redesign would break the test though the button still works.
      - text: "`screen.getByTestId('settle')`"
        why: It works and survives restyling, but it's the last resort in the priority list because users can't see test ids, so it proves nothing about accessibility.
      - text: "`screen.getByRole('button', { name: 'Settle up' })`"
        why: Correct. It finds the element the way a screen reader user would, and it fails if the button loses its role or its accessible name.
    answer: 2
  - q: You want to assert that the empty-state message is gone after an expense is added. Which query fits?
    options:
      - text: "`expect(screen.queryByText('No expenses yet')).toBeNull()`"
        why: Correct. `queryBy` returns `null` when nothing matches, which is exactly what you want to assert.
      - text: "`expect(screen.getByText('No expenses yet')).toBeNull()`"
        why: "`getBy` throws when nothing matches, so the test errors before `toBeNull` runs; it can never pass."
      - text: "`expect(screen.findByText('No expenses yet')).toBeNull()`"
        why: "`findBy` returns a promise (which is never `null`) and waits for the element to appear, the opposite of what you want."
    answer: 0
  - q: "`screen.getByRole('textbox', { name: 'Amount' })` fails with \"Unable to find an accessible element with the role textbox and name Amount\". The page shows the word Amount next to the input. What's the most likely fix?"
    options:
      - text: Add `data-testid="amount"` and query with `getByTestId`.
        why: That makes the test pass but leaves the real problem; screen reader users still hear an unlabelled field.
      - text: Associate the text with the input using a `<label>` (wrapping it or with `for`/`id`).
        why: Correct. Text that merely sits nearby is not a label. Once it's associated, the input gets an accessible name and the query, and your users, find it.
      - text: Use `getByText('Amount')` and then read `.nextSibling`.
        why: Walking siblings couples the test to the exact DOM structure, and the input is still unlabelled.
    answer: 1
  - q: Which pair of queries is closest to how a sighted mouse user and a screen reader user would find a list of balances?
    options:
      - text: "`document.querySelector('ul')` and `.children`"
        why: These follow DOM structure; adding a wrapper or a second list would break or confuse the test.
      - text: "`getByTestId('balances')` and `getAllByTestId('row')`"
        why: Test ids are invisible to users and the last resort in the priority list.
      - text: "`getByRole('list', { name: 'Balances' })` and `within(list).getAllByRole('listitem')`"
        why: Correct. The list's role and label are what assistive tech announces, and `within` scopes the item query to that list.
    answer: 2
---

Here is a test I found in a codebase last year: `document.querySelector('.card > div:nth-child(2) span.amount-red')`. It broke when a designer changed the colour of negative amounts. Nothing the user could see had broken, except the colour, which nobody tested. The test was coupled to the DOM's shape and the CSS, not to what the page *says*.

## The guiding principle

Testing Library's core idea fits in one sentence: *the more your tests resemble the way your software is used, the more confidence they can give you.* Users don't see class names or `nth-child`. They see a button labelled "Add expense", a field labelled "Amount", a list of balances. Screen reader users get exactly that information through the **accessibility tree**: each element's role (button, list, textbox) and accessible name (its label or text).

So Testing Library's queries find elements by role, label and text. A test that finds the "Settle up" button by role and name keeps passing through any redesign, and fails the day the button stops being reachable for keyboard and screen reader users. That is a bug worth catching.

## The priority order

:::figure Query priority: start at the top, go down only when you must
<svg viewBox="0 0 640 250" role="img" aria-labelledby="t1">
  <title id="t1">Three tiers stacked: accessible to everyone (ByRole, ByLabelText, ByPlaceholderText, ByText, ByDisplayValue), semantic (ByAltText, ByTitle), and test ids last.</title>
  <rect class="d-box-success" x="20" y="20" width="600" height="80" rx="12"/>
  <text class="d-label-strong" x="40" y="50">1. Accessible to everyone</text>
  <text class="d-code" x="40" y="80">ByRole · ByLabelText · ByPlaceholderText · ByText · ByDisplayValue</text>
  <rect class="d-box-accent" x="20" y="115" width="600" height="56" rx="12"/>
  <text class="d-label-strong" x="40" y="148">2. Semantic</text>
  <text class="d-code" x="220" y="148">ByAltText · ByTitle</text>
  <rect class="d-box-warn" x="20" y="186" width="600" height="50" rx="12"/>
  <text class="d-label-strong" x="40" y="216">3. Last resort</text>
  <text class="d-code" x="220" y="216">ByTestId</text>
</svg>
:::

`getByRole` with a `name` option covers most cases: buttons, links, headings, form fields, lists, dialogs, alerts. `getByLabelText` is the natural choice for form fields. `getByText` finds non-interactive content like a message or a balance line. Test ids are for elements with no role or text, such as a chart canvas, and they prove nothing about accessibility.

## A DOM test with Testing Library

Splitwise-lite renders balances as a plain list. With `jsdom` as the environment and `@testing-library/dom` installed, a test looks like this:

```js title=src/render-balances.test.js
// @vitest-environment jsdom
import { afterEach, test, expect } from 'vitest';
import { screen, within } from '@testing-library/dom';
import { renderBalances } from './render-balances.js';

afterEach(() => {
  document.body.innerHTML = '';
});

test('lists each person with what they owe or are owed', () => {
  renderBalances(document.body, { Ben: -500, Ana: 1200, Cai: 0 });

  const list = screen.getByRole('list', { name: 'Balances' });
  const items = within(list).getAllByRole('listitem');

  expect(items.map((item) => item.textContent)).toEqual([
    'Ana is owed $12.00',
    'Ben owes $5.00',
    'Cai is settled up',
  ]);
});

test('shows an empty state instead of an empty list', () => {
  renderBalances(document.body, {});

  expect(screen.getByText('No expenses yet')).toBeTruthy();
  expect(screen.queryByRole('list')).toBeNull();
});
```

`screen` queries the whole document. `within(element)` scopes queries to part of it, which matters as soon as a page has two lists. Clearing `document.body` after each test keeps one test's DOM from leaking into the next. (React Testing Library can do this cleanup for you; lesson four of this section shows when.)

## getBy, queryBy, findBy

Each query comes in three flavours, plus an `All` version of each:

| Prefix | No match | Several matches | Use it for |
|---|---|---|---|
| `getBy` | throws | throws | elements that must be there |
| `queryBy` | returns `null` | throws | asserting something is **absent** |
| `findBy` | rejects after waiting | rejects | elements that appear **later** |

`getBy` throwing on several matches is a feature: if your query is ambiguous, the test tells you instead of silently picking the first.

:::tip Nicer assertions with jest-dom
Add `import '@testing-library/jest-dom/vitest'` to a setup file and you get DOM matchers such as `toBeInTheDocument()`, `toHaveTextContent()`, `toBeVisible()`, `toBeDisabled()` and `toHaveAccessibleName()`. Their failure messages print the relevant DOM, which beats reading `expected null not to be null`.
:::

:::mistake Switching to a test id when a role query fails
When `getByRole('textbox', { name: 'Amount' })` can't find the input, the usual reason is that the input really has no accessible name: the word "Amount" sits beside it but isn't a `<label>`. Adding a test id makes the test pass and leaves the form broken for screen reader users. Fix the markup; the test was right.
:::

## When a query can't find your element

Role queries fail loudly, and the failure is useful. When `getByRole('button', { name: 'Settle up' })` finds nothing, Testing Library prints every accessible role in the container with the names it computed, so you can see that the button is actually named "Settle up all debts", or that your clickable `div` has no role at all. Call `screen.debug()` to print the current DOM when you need more context. Accessible names come from a handful of places, in roughly this order: `aria-labelledby`, `aria-label`, an associated `<label>`, then the element's own text (or `alt` for images). If none of them give the name you expect, a screen reader user hears the same confusing thing your test sees.

## In the playground

The playground has no npm packages, so the exercises in this section start with about forty lines of stand-ins: `getByRole`, `getAllByRole`, `queryByRole`, `getByText` and `queryByText`, with the same names and behaviour for the cases you need. Like the plain (non-`screen`) exports of `@testing-library/dom`, they take the container as their first argument: `getByRole(container, 'list')`. They read the role from the tag (or a `role` attribute) and the name from `aria-label`, a `<label>` or the text. Real Testing Library computes the accessibility tree much more thoroughly, so in a project, install it.

Next lesson: clicking and typing like a user.
