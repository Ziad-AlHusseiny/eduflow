---
summary: Test React components through props, rendered output and user interaction with React Testing Library, and mock the network at its boundary with an injected fetch or MSW.
takeaways:
  - "React Testing Library's `render` mounts a component into the jsdom document; you query and interact with it exactly as with plain DOM."
  - Test props by rendering with different props (or `rerender`) and state by interacting; never reach into state or hooks directly.
  - Mock the network at its edge, either by injecting `fetch` or by intercepting requests with MSW, so your own data-shaping code still runs in the test.
  - "Assert on the request you sent (URL, method) as well as on what the UI or function does with the response, including error statuses."
further:
  - title: Testing Library — React Testing Library
    url: https://testing-library.com/docs/react-testing-library/intro
  - title: Testing Library — React Testing Library API
    url: https://testing-library.com/docs/react-testing-library/api
  - title: MDN — Response
    url: https://developer.mozilla.org/en-US/docs/Web/API/Response
  - title: Vitest — Mocking requests
    url: https://vitest.dev/guide/mocking/requests
quiz:
  - q: How should a test check that `ExpenseList` filters as you type in the Search box?
    options:
      - text: Type into the Search field with user-event and assert which list items are on screen.
        why: Correct. That is the behaviour a user sees, and it keeps passing if you move the filter state into a reducer or a URL parameter.
      - text: Read the component's `query` state after typing and check it equals the typed text.
        why: State is an implementation detail; a component can store the right text and still render the wrong list.
      - text: Call the `setQuery` function directly and snapshot the result.
        why: Tests can't (and shouldn't) reach a component's state setters; and a snapshot wouldn't say which items should be visible.
    answer: 0
  - q: Why do many teams prefer MSW over `vi.mock('./api.js')` for components that fetch data?
    options:
      - text: MSW makes requests to the real server faster.
        why: MSW doesn't talk to the real server at all; it intercepts requests and answers them with your handlers.
      - text: "`vi.mock` doesn't work in files that render React components."
        why: "`vi.mock` works anywhere; the issue is how much real code it skips."
      - text: MSW intercepts at the network level, so your real fetch and data-shaping code still run in the test.
        why: Correct. With a module mock, a bug in how you build the URL or parse the response is replaced away; with MSW it is exercised.
    answer: 2
  - q: "`loadGroup` forgot to check `response.ok`. For a 404, the JSON is `{ \"error\": \"Not found\" }`, so the code throws `Cannot read properties of undefined`. Which assertion catches the missing check?"
    options:
      - text: "`await expect(loadGroup('nope', fetchMock)).rejects.toThrow()`"
        why: The buggy version rejects too, with a `TypeError`, so an assertion that accepts any error passes.
      - text: "`await expect(loadGroup('nope', fetchMock)).rejects.toThrow('HTTP 404')`"
        why: Correct. Matching the message proves the status was checked, not that something else happened to blow up.
      - text: "`expect(fetchMock).toHaveBeenCalledTimes(1)`"
        why: Both versions call fetch exactly once; the difference is what they do with the response.
    answer: 1
---

Everything in this section so far applies to React unchanged, because React Testing Library is a thin layer over the same queries and user-event you already know. The genuinely new part is the network: React components love to fetch, and how you fake that decides whether your tests catch real bugs.

## Rendering a component

Splitwise-lite's `ExpenseList` takes expenses as a prop and has one piece of state, a search filter:

```jsx title=src/ExpenseList.jsx
import { useState } from 'react';
import { formatMoney } from './money.js';

export function ExpenseList({ expenses }) {
  const [query, setQuery] = useState('');
  const visible = expenses.filter((e) =>
    e.description.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section aria-label="Expenses">
      <label>
        Search <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      {visible.length === 0 ? (
        <p>No matching expenses</p>
      ) : (
        <ul>
          {visible.map((e) => (
            <li key={e.id}>{e.description}: {formatMoney(e.amountCents)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

With `@testing-library/react` installed and `environment: 'jsdom'`, tests read like the DOM tests you've written:

```jsx title=src/ExpenseList.test.jsx
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseList } from './ExpenseList.jsx';

const expenses = [
  { id: 'e1', description: 'Dinner', amountCents: 4550 },
  { id: 'e2', description: 'Taxi', amountCents: 1800 },
];

test('filters expenses as you type', async () => {
  const user = userEvent.setup();
  render(<ExpenseList expenses={expenses} />);

  await user.type(screen.getByRole('textbox', { name: 'Search' }), 'tax');

  const items = screen.getAllByRole('listitem');
  expect(items.map((li) => li.textContent)).toEqual(['Taxi: $18.00']);
});

test('shows the new expense when the prop changes', () => {
  const { rerender } = render(<ExpenseList expenses={expenses} />);

  rerender(<ExpenseList expenses={[...expenses, { id: 'e3', description: 'Museum', amountCents: 2400 }]} />);

  expect(screen.getByText('Museum: $24.00')).toBeTruthy();
});
```

**Props** are tested by rendering with different values (and `rerender` for updates). **State** is tested by interacting and checking the result; there's no way to read `query` from the test, and that's a feature. `render` wraps updates in React's `act()` for you, and React Testing Library unmounts components after each test when Vitest's `globals` option is on (otherwise call `cleanup` in an `afterEach`).

:::note Components in a real browser
Vitest 4 also has a stable Browser Mode, which runs component tests in a real browser (driven by a provider such as Playwright) instead of jsdom. It's slower to start, but catches layout and browser-API differences jsdom can't. Many teams keep jsdom for most component tests and use Browser Mode where real rendering matters.
:::

## Where to fake the network

A component that loads a group calls a data function, which calls `fetch`, which goes over the network. You can cut that chain at three points:

:::figure Cut the chain as late as you can
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">A chain from component to loadGroup to fetch to network. vi.mock cuts early and skips loadGroup; injecting fetch cuts after loadGroup; MSW intercepts at the network edge.</title>
  <rect class="d-box" x="10" y="40" width="140" height="56" rx="10"/>
  <text class="d-label-strong" x="80" y="74" text-anchor="middle">Component</text>
  <path class="d-arrow" d="M150 68 L188 68" marker-end="url(#arrow)"/>
  <rect class="d-box" x="190" y="40" width="140" height="56" rx="10"/>
  <text class="d-code" x="260" y="74" text-anchor="middle">loadGroup()</text>
  <path class="d-arrow" d="M330 68 L368 68" marker-end="url(#arrow)"/>
  <rect class="d-box" x="370" y="40" width="140" height="56" rx="10"/>
  <text class="d-code" x="440" y="74" text-anchor="middle">fetch()</text>
  <path class="d-arrow" d="M510 68 L548 68" marker-end="url(#arrow)"/>
  <rect class="d-box" x="550" y="40" width="120" height="56" rx="10"/>
  <text class="d-label-strong" x="610" y="74" text-anchor="middle">Network</text>
  <path class="d-line d-dashed" d="M170 30 L170 150"/>
  <text class="d-label-muted" x="170" y="172" text-anchor="middle">vi.mock</text>
  <path class="d-line d-dashed" d="M350 30 L350 150"/>
  <text class="d-label-muted" x="350" y="172" text-anchor="middle">inject fetch</text>
  <path class="d-line d-dashed" d="M530 30 L530 150"/>
  <text class="d-label-muted" x="530" y="172" text-anchor="middle">MSW</text>
  <text class="d-label" x="350" y="200" text-anchor="middle">later cut = more real code tested</text>
</svg>
:::

- **Mocking the data module** (`vi.mock('./load-group.js')`) skips the URL building, status handling and response shaping. Those are exactly where the bugs are.
- **Injecting `fetch`** (`loadGroup(id, fetchImpl)`) runs all of your code and fakes only the transport. Simple, no library, and what the exercise uses.
- **MSW** (Mock Service Worker) intercepts requests at the network level in Node and in the browser. Your code calls the real `fetch`, unchanged:

```js title=src/test/server.js
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.get('https://api.splitwise-lite.test/groups/:id', ({ params }) =>
    HttpResponse.json({ name: `Group ${params.id}`, members: [], expenses: [] }),
  ),
);
```

In a setup file, call `server.listen({ onUnhandledRequest: 'error' })` before all tests, `server.resetHandlers()` after each, and `server.close()` at the end. A single test overrides a route with `server.use(http.get(..., () => new HttpResponse(null, { status: 404 })))` to test the error path. The same handlers can power your app in development and in Storybook, so the fake API stays in one place.

:::mistake Faking only the happy path
A network mock that always returns 200 with perfect data tests the code you were least worried about. Every data function deserves a test for a non-OK status, and ideally for a network failure (`HttpResponse.error()` in MSW, or a rejected promise from an injected fetch). Assert the specific error message, so a crash elsewhere doesn't pass for correct error handling.
:::

## What not to test in a component

Some component tests cost more than they catch. Skip them:

- **Styling details**: whether a class is `text-red-600` or the padding is 12px. Visual regressions are better caught by screenshot tests in a real browser, or a human review.
- **Third-party internals**: you don't need to prove that a date-picker library opens its calendar. Test that your component passes it the right value and reacts to its `onChange`.
- **Whole-tree snapshots**: `expect(container).toMatchSnapshot()` on a large component fails on every harmless markup change, and reviewers learn to press "update snapshot" without reading. A small inline snapshot of one formatted value can be fine; a 300-line one is noise.

## Asserting on both sides of the request

A good network test checks what you **sent** as well as what you did with the answer. A wrong URL is a real bug (`/group/` instead of `/groups/`), and only an assertion on the request catches it, since your fake happily answers anything. With an injected fetch that's `expect(fetchMock).toHaveBeenCalledWith('https://api.splitwise-lite.test/groups/lisbon')`; with MSW, the handler only matches the right path, and `onUnhandledRequest: 'error'` fails the test for anything else.

In the exercise you test `loadGroup` with an injected `fetch` that returns real `Response` objects, and catch four bugs in the request and the response shaping. That completes the UI section. Next comes the real browser, where layout, routing and the real server finally meet.
