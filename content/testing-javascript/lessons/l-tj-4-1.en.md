---
summary: Set up Playwright for a Vite app, find elements with user-facing locators, and write web-first assertions that wait for the page instead of racing it.
takeaways:
  - Playwright drives real Chromium, Firefox and WebKit, and its `webServer` option starts your dev server before the tests run.
  - "Prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`) and narrow them with `filter` or chaining instead of CSS paths."
  - Actions such as `click` and `fill` auto-wait until the element is visible, stable, enabled and able to receive events.
  - "Web-first assertions like `await expect(locator).toHaveText(...)` retry until they pass or time out (5 seconds by default); reading a value and asserting on it once does not."
further:
  - title: Playwright — Locators
    url: https://playwright.dev/docs/locators
  - title: Playwright — Assertions
    url: https://playwright.dev/docs/test-assertions
  - title: Playwright — Auto-waiting
    url: https://playwright.dev/docs/actionability
  - title: Playwright — Web server
    url: https://playwright.dev/docs/test-webserver
quiz:
  - q: "Which assertion keeps working when the balance updates 300 ms after the click?"
    options:
      - text: "`expect(await page.getByRole('status').textContent()).toBe('Ben owes $5.00')`"
        why: This reads the text once, immediately; if the update hasn't landed yet, it fails. Nothing retries.
      - text: "`await expect(page.getByRole('status')).toHaveText('Ben owes $5.00')`"
        why: Correct. A web-first assertion re-reads the element until the text matches or the timeout passes.
      - text: "`await page.waitForTimeout(500); expect(await page.getByRole('status').isVisible()).toBe(true)`"
        why: The sleep is a guess, and the assertion doesn't check the text at all.
    answer: 1
  - q: "`await page.getByRole('button', { name: 'Remove' }).click()` fails with a strict mode violation. What does that mean?"
    options:
      - text: The button is disabled, so Playwright refuses to click.
        why: A disabled button makes the click wait and then time out; strict mode is about how many elements match.
      - text: The test is running in a browser with strict security settings.
        why: Strict mode is a locator rule, not a browser setting.
      - text: The locator matches more than one element, so Playwright won't guess which to act on.
        why: "Correct. Narrow it, for example `page.getByRole('listitem').filter({ hasText: 'Taxi' }).getByRole('button', { name: 'Remove' })`."
    answer: 2
  - q: What does Playwright check before it performs `click()` on a locator?
    options:
      - text: That the element is visible, stable (not animating), enabled and not covered by another element.
        why: Correct. Those actionability checks are what make most explicit waits unnecessary.
      - text: Only that the element exists in the DOM.
        why: Existing isn't enough; a hidden or covered button can't be clicked by a user, and Playwright waits for it to be clickable.
      - text: Nothing; it clicks immediately and the test must wait beforehand.
        why: That's how older tools worked; Playwright auto-waits for actions.
    answer: 0
---

Everything so far ran in Node, with jsdom pretending to be a browser. That covers most logic and most UI behaviour, but not all of it: real layout, real routing, the real server, a real CSS bug that hides the "Settle up" button on Safari. For the few flows where that matters, you drive a real browser. In 2026 the default tool for that in JavaScript is Playwright.

## Setting up

```bash
npm init playwright@latest
```

The wizard adds `@playwright/test`, a `playwright.config.ts`, an example test and (optionally) a GitHub Actions workflow, and downloads the browsers. Point it at your Vite app and let it start the dev server for you:

```ts title=playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

`webServer` runs `npm run dev`, waits until the URL responds, runs the tests, then stops it. `baseURL` lets tests call `page.goto('/groups/lisbon')`. Run the suite with `npx playwright test`.

## A first end-to-end test

```ts title=e2e/settle-up.spec.ts
import { test, expect } from '@playwright/test';

test('adding an expense updates the balances', async ({ page }) => {
  await page.goto('/groups/lisbon');

  await page.getByLabel('Description').fill('Dinner');
  await page.getByLabel('Amount').fill('30.00');
  await page.getByRole('button', { name: 'Add expense' }).click();

  const balances = page.getByRole('list', { name: 'Balances' });
  await expect(balances.getByRole('listitem')).toHaveText([
    'Ana is owed $15.00',
    'Ben owes $15.00',
  ]);
});
```

`page` is a fresh browser tab, given to the test as a **fixture** (more on those next lesson). The locators should look familiar: Playwright's `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByAltText`, `getByTitle` and `getByTestId` follow the same priority idea as Testing Library, for the same reason.

## Locators are lazy and strict

A locator is a **description** of how to find an element, not the element itself. `page.getByRole('button', { name: 'Add expense' })` finds nothing until you act on it, and it finds it again every time, so a re-render that replaces the button doesn't leave you holding a stale reference.

Locators are also **strict**: if an action's locator matches two elements, Playwright throws instead of clicking the first. Narrow with chaining and `filter`:

```ts
const taxiRow = page.getByRole('listitem').filter({ hasText: 'Taxi' });
await taxiRow.getByRole('button', { name: 'Remove' }).click();
```

That reads like the instruction you'd give a person ("remove the taxi row"), and it survives reordering. `nth(2)` and `first()` exist, but they break the moment the order changes; use them only when order *is* the point.

## Auto-waiting: actions

Before `click()`, Playwright waits until the element is **visible**, **stable** (not mid-animation), **enabled**, and actually **receives events** (not covered by a spinner or a cookie banner). `fill()` waits for visible, enabled and editable. Then it acts. If the conditions never hold, the action fails after the timeout with a message saying which check failed.

That is why end-to-end tests in Playwright rarely need explicit waits. The button that appears after the group loads is clicked when it appears.

:::figure Actions wait until the element is ready; assertions retry until they pass
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Top: click waits for visible, stable, receives events and enabled, then clicks. Bottom: toHaveText re-reads the element repeatedly until the text matches or 5 seconds pass.</title>
  <text class="d-code" x="20" y="44">click()</text>
  <rect class="d-box-accent" x="110" y="24" width="80" height="32" rx="8"/>
  <text class="d-label" x="150" y="45" text-anchor="middle">visible</text>
  <rect class="d-box-accent" x="200" y="24" width="80" height="32" rx="8"/>
  <text class="d-label" x="240" y="45" text-anchor="middle">stable</text>
  <rect class="d-box-accent" x="290" y="24" width="130" height="32" rx="8"/>
  <text class="d-label" x="355" y="45" text-anchor="middle">receives events</text>
  <rect class="d-box-accent" x="430" y="24" width="90" height="32" rx="8"/>
  <text class="d-label" x="475" y="45" text-anchor="middle">enabled</text>
  <path class="d-arrow" d="M524 40 L566 40" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="570" y="24" width="90" height="32" rx="8"/>
  <text class="d-label" x="615" y="45" text-anchor="middle">click</text>
  <text class="d-code" x="20" y="144">toHaveText()</text>
  <path class="d-line" d="M150 140 L520 140"/>
  <circle class="d-dot" cx="170" cy="140" r="6"/>
  <circle class="d-dot" cx="240" cy="140" r="6"/>
  <circle class="d-dot" cx="310" cy="140" r="6"/>
  <text class="d-label-muted" x="240" y="120" text-anchor="middle">re-read, no match</text>
  <rect class="d-box-success" x="350" y="124" width="110" height="32" rx="8"/>
  <text class="d-label" x="405" y="145" text-anchor="middle">matches</text>
  <text class="d-label-muted" x="520" y="180" text-anchor="middle">gives up at 5 s</text>
  <path class="d-line d-dashed" d="M520 110 L520 165"/>
</svg>
:::

## Web-first assertions: assertions that wait

The same idea applies to checking results. Playwright's `expect` on a **locator** is asynchronous and retrying:

```ts
await expect(page.getByRole('status')).toHaveText('Everyone is settled up');
await expect(page.getByRole('listitem')).toHaveCount(0);
await expect(page).toHaveURL(/\/groups\/lisbon\/settled/);
await expect(page.getByRole('button', { name: 'Settle up' })).toBeDisabled();
```

Each one re-checks the page until it matches, for up to 5 seconds by default. `toHaveText` with an array (as in the first test) checks every matched element's text, in order, which is a compact way to assert a whole list.

:::mistake Reading values out and asserting on them
`expect(await page.getByRole('status').textContent()).toBe('Everyone is settled up')` looks equivalent, and it isn't. `textContent()` reads once, right now; the generic `toBe` never retries. If the status updates 50 ms later, the test fails, sometimes. That "sometimes" is how flaky suites are born. Keep the `await` **outside** `expect`, on a locator, so the assertion owns the waiting.
:::

:::tip Let Playwright write the first draft
`npx playwright codegen localhost:5173` opens a browser and records your clicks as test code, choosing role-based locators where it can. It's a fast way to discover the right locator for an awkward element; then edit the result so it asserts outcomes, not every click.
:::

## What belongs in an end-to-end test

Because every test here starts a browser context, loads the app and talks to a real server, an end-to-end test costs seconds where a unit test costs milliseconds. Spend that budget on flows where the *connection* between pieces is the risk: signing in, adding an expense and seeing balances change, settling up, anything involving money or data loss. Don't use it to check every validation message on the amount field; the component tests from section 3 already do that a hundred times faster. A healthy Splitwise-lite suite might have five to fifteen end-to-end tests and several hundred unit and component tests. If an end-to-end test fails, ask first whether a lower-level test should have caught it.

The exercise asks you to pick the locator that will survive the next redesign. Next lesson: keeping tests independent of each other.
