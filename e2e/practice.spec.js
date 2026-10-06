import { expect, test } from '@playwright/test';
import { enrolledIn, hydrated, seed, stored } from './helpers.js';

test.describe('hands-on practice', () => {
  test('React playground: the reference solution passes every check', async ({ page }) => {
    await seed(page, enrolledIn(['react-fundamentals']));
    await page.goto('/lesson/react-fundamentals/l-rf-3-1');
    await hydrated(page);
    const ex = page.getByTestId('exercise-web');
    await ex.scrollIntoViewIfNeeded();
    await ex.getByTestId('check-button').click();
    await expect(ex.getByTestId('checks-summary')).toContainText(/checks passing|All checks pass/, { timeout: 20000 });
    await ex.getByTestId('solution-button').click();
    await ex.getByRole('button', { name: 'Load it into the editor' }).click();
    await ex.getByTestId('check-button').click();
    await expect(ex.getByTestId('solved-banner')).toBeVisible({ timeout: 20000 });
    expect((await stored(page, 'exercises'))['l-rf-3-1'].solvedAt).toBeTruthy();
  });

  test('SQL: the solution matches the expected result', async ({ page }) => {
    await seed(page, enrolledIn(['sql-for-analysts']));
    await page.goto('/lesson/sql-for-analysts/l-sql-2-1');
    await hydrated(page);
    const ex = page.getByTestId('exercise-sql');
    await ex.scrollIntoViewIfNeeded();
    await ex.getByTestId('run-button').click();
    await expect(ex.getByRole('region', { name: 'Results' })).toBeVisible({ timeout: 20000 });
    await ex.getByTestId('check-button').click();
    await expect(ex.getByTestId('sql-mismatch')).toBeVisible({ timeout: 20000 });
  });

  test('guided: put the steps in order (keyboard buttons), then check', async ({ page }) => {
    await seed(page, enrolledIn(['aws-cloud-foundations']));
    await page.goto('/lesson/aws-cloud-foundations/l-aws-2-3');
    await hydrated(page);
    const ex = page.getByTestId('exercise-order');
    await ex.scrollIntoViewIfNeeded();
    await ex.getByTestId('check-button').click();
    await expect(ex.getByText('Some steps are out of place.')).toBeVisible();
    await ex.getByTestId('solution-button').click();
    await ex.getByTestId('check-button').click();
    await expect(ex.getByTestId('solved-banner')).toBeVisible();
  });

  test('guided: spot the bug', async ({ page }) => {
    await seed(page, enrolledIn(['aws-cloud-foundations']));
    await page.goto('/lesson/aws-cloud-foundations/l-aws-2-2');
    await hydrated(page);
    const ex = page.getByTestId('exercise-spot-bug');
    await ex.scrollIntoViewIfNeeded();
    await ex.getByTestId('solution-button').click();
    await ex.getByTestId('check-button').click();
    await expect(ex.getByTestId('solved-banner')).toBeVisible();
  });
});

test('the code editor (CodeMirror) loads when the exercise scrolls into view', async ({ page }) => {
  const { enrolledIn: e, hydrated: h, seed: sd } = await import('./helpers.js');
  await sd(page, e(['javascript-fundamentals']));
  await page.goto('/lesson/javascript-fundamentals/l-js-2-3');
  await h(page);
  const editor = page.locator('[data-testid^=editor-]').first();
  await editor.scrollIntoViewIfNeeded();
  await expect(editor).toHaveAttribute('data-editor', 'cm', { timeout: 15000 });
  await expect(editor.locator('.cm-content')).toHaveAttribute('aria-label', /editor/);
});

test('a saved draft shows in the SQL and Python editors, not just in what runs', async ({ page }) => {
  await seed(page, {
    ...enrolledIn(['sql-for-analysts', 'python-data-analysis']),
    drafts: {
      'l-sql-2-2': { files: { sql: 'SELECT 42 AS my_draft;' }, at: '2026-10-01T09:00:00.000Z' },
      'l-pda-3-1': { files: { py: 'print("my draft")' }, at: '2026-10-01T09:00:00.000Z' },
    },
  });
  for (const [path, kind, text] of [['/lesson/sql-for-analysts/l-sql-2-2', 'sql', 'SELECT 42 AS my_draft;'], ['/lesson/python-data-analysis/l-pda-3-1', 'python', 'print("my draft")']]) {
    await page.goto(path);
    await hydrated(page);
    const editor = page.getByTestId(`editor-${kind}`);
    await editor.scrollIntoViewIfNeeded();
    await expect(editor).toHaveAttribute('data-editor', 'cm', { timeout: 15000 });
    await expect(editor.locator('.cm-content')).toHaveText(text);
  }
});
