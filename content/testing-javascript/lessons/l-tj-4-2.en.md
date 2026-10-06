---
summary: Keep end-to-end tests independent with Playwright's isolated browser contexts, custom fixtures that create and clean up their own data, saved login state and targeted network routing.
takeaways:
  - Every Playwright test gets a fresh browser context (its own cookies, storage and cache), so tests can run in parallel and in any order.
  - "A fixture created with `test.extend` sets something up, hands it to the test with `use()`, and tears it down afterwards, only for tests that ask for it."
  - Each test should create the data it needs (ideally through the API) instead of depending on shared seed data or on another test having run first.
  - Log in once in a setup project, save the storage state, and reuse it, rather than clicking through the login form in every test.
  - "Use `page.route` to simulate rare server responses, and the real backend for the happy paths."
further:
  - title: Playwright — Fixtures
    url: https://playwright.dev/docs/test-fixtures
  - title: Playwright — Isolation
    url: https://playwright.dev/docs/browser-contexts
  - title: Playwright — Authentication
    url: https://playwright.dev/docs/auth
  - title: Playwright — Mock APIs
    url: https://playwright.dev/docs/mock
quiz:
  - q: "Test A creates a group named \"Lisbon trip\"; test B opens \"Lisbon trip\" and checks its balances. B passes locally and fails in CI. What's the root problem?"
    options:
      - text: CI machines are slower, so B needs a longer timeout.
        why: Speed isn't the issue; B depends on data that only exists if A ran first, on the same server, before it.
      - text: B depends on A's data. With parallel workers or a different order, the group doesn't exist yet when B runs.
        why: Correct. Each test should create its own group, for example through a fixture that calls the API and cleans up after.
      - text: B should use `test.describe.serial` so it always runs after A.
        why: Serial mode makes the dependency official and the suite slower; one failure in A then skips everything after it. Remove the dependency instead.
    answer: 1
  - q: In a fixture, what does the code after `await use(group)` do?
    options:
      - text: It runs before the test, to prepare data.
        why: Setup runs before `use`; the line after it waits until the test is done.
      - text: Nothing; code after `use` is never reached.
        why: "`use` resolves when the test finishes, so the code after it runs, which is how fixtures clean up."
      - text: It runs after the test finishes, even if the test failed, which makes it the place for cleanup.
        why: "Correct. Setup, `use(value)`, teardown: one function owns the whole lifecycle of the resource."
    answer: 2
  - q: What is the best use of `page.route` in an end-to-end suite?
    options:
      - text: Simulating a rare server response, such as a 500 when saving, to test the error message.
        why: Correct. Hard-to-trigger responses are where routing shines; the happy path should still hit the real backend.
      - text: Mocking every API call so tests never depend on the backend.
        why: Then it isn't end-to-end any more; you'd be re-testing the UI with fake data, which component tests do faster.
      - text: Speeding up slow tests by skipping requests to your own API.
        why: Skipping your own API removes the integration the test exists to check; make the API or the test data faster instead.
    answer: 0
---

The most common reason an end-to-end suite becomes untrustworthy isn't timing; it's **shared state**. Test 12 passes alone and fails in the full run because test 7 renamed the group it uses. Or a test passes only on Mondays because the seed data has a "this week" expense. Isolation is the cure, and Playwright gives you most of it for free.

## Fresh context for every test

Each test receives its own **browser context**: an incognito-like profile with its own cookies, localStorage, sessionStorage and cache. Opening a context is cheap (milliseconds, not a new browser), so Playwright creates a new one per test. That's why you can run with `fullyParallel: true` across several workers: two tests can't see each other's logins or saved drafts.

The browser side is isolated. **Your backend is not.** If two tests edit the same group on the same server, they collide. The rest of this lesson is about isolating data.

## Fixtures: setup and cleanup in one place

You've been using fixtures already: `page` in `async ({ page }) => …` is one. Playwright also ships `context`, `browser`, `browserName` and `request` (an HTTP client that shares `baseURL`). You define your own with `test.extend`:

```ts title=e2e/fixtures.ts
import { test as base, expect } from '@playwright/test';

type Group = { id: string; name: string };

export const test = base.extend<{ group: Group }>({
  group: async ({ request }, use) => {
    // Setup: create a fresh group through the API
    const response = await request.post('/api/groups', {
      data: { name: `Trip ${crypto.randomUUID().slice(0, 8)}`, members: ['Ana', 'Ben'] },
    });
    expect(response.ok()).toBeTruthy();
    const group: Group = await response.json();

    await use(group); // the test runs here

    // Teardown: runs after the test, pass or fail
    await request.delete(`/api/groups/${group.id}`);
  },
});

export { expect };
```

```ts title=e2e/settle-up.spec.ts
import { test, expect } from './fixtures';

test('settling up clears every balance', async ({ page, group }) => {
  await page.goto(`/groups/${group.id}`);
  // …add an expense, click Settle up…
  await expect(page.getByRole('status')).toHaveText('Everyone is settled up');
});
```

Three properties make this better than a `beforeEach`:

- **On demand.** Only tests that list `group` in their parameters create one. Tests that don't need it pay nothing.
- **Setup and teardown live together**, around `await use(...)`, so cleanup can't drift out of sync with setup.
- **Composable.** A `group` fixture can depend on `request`; an `expense` fixture could depend on `group`. Playwright resolves the order.

Creating data **through the API** rather than clicking through the UI keeps each test focused on one flow and saves seconds per test. One test clicks through "create a group"; the other fifty get a group from the fixture.

:::mistake Tests that rely on each other
"Test 1 creates the group, test 2 adds an expense, test 3 settles up" reads like a story and behaves like a chain: it can't run in parallel, can't be rerun individually, and one failure cascades into three. Make each test create what it needs, with a unique name (a random suffix) so parallel workers never collide.
:::

## Logging in once

If Splitwise-lite requires login, clicking through the form in every test wastes time and hammers your auth server. Playwright's pattern is a **setup project**: one test logs in and saves the browser's storage state to a file, and the real projects declare a dependency on it and start already logged in:

```ts title=playwright.config.ts
// …inside defineConfig
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'],
  },
],
```

The setup test ends with `await page.context().storageState({ path: 'playwright/.auth/user.json' })`. Add `playwright/.auth` to `.gitignore`: it contains real session cookies.

## Routing: controlling what the server says

Some states are hard to produce with a real backend: a 500 on save, a slow response, an empty group from a legacy account. `page.route` intercepts requests from the page and lets you answer them:

```ts
test('explains a failed save', async ({ page, group }) => {
  await page.route('**/api/expenses', (route) =>
    route.fulfill({ status: 500, json: { error: 'Database unavailable' } }),
  );

  await page.goto(`/groups/${group.id}`);
  await page.getByLabel('Description').fill('Dinner');
  await page.getByLabel('Amount').fill('30');
  await page.getByRole('button', { name: 'Add expense' }).click();

  await expect(page.getByRole('alert')).toHaveText('Could not save the expense. Try again.');
});
```

Use routing for the rare and the broken. If you find yourself routing every request, you've rebuilt a component test in a slower tool; let the happy paths hit the real backend, because that integration is what end-to-end tests are for.

:::why Isolation is what makes parallelism safe
A suite of 200 independent tests runs on 8 workers in an eighth of the time. A suite with hidden dependencies has to run serially, or it fails randomly. Isolation isn't hygiene for its own sake; it's what lets the suite stay fast as it grows.
:::

Isolation also makes failures cheaper to debug. When a test fails, you can rerun that single test with `npx playwright test -g "settling up"` and get the same result, because nothing it depends on lives outside it. With hidden dependencies, the single rerun passes and the full run fails, and you're left bisecting the suite to find which neighbour broke it.

In the exercise you complete a fixture that creates and deletes a group. Next lesson: what to do when a test fails anyway.
