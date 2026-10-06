import { expect, test } from '@playwright/test';
import { dismissBadges, enrolledIn, hydrated, RF, seed, stored } from './helpers.js';

test.describe('lesson player (PRD §7)', () => {
  test('not enrolled → redirected to the course page', async ({ page }) => {
    await page.goto(`/lesson/${RF}/l-rf-2-3`);
    await expect(page).toHaveURL(new RegExp(`/courses/${RF}$`));
  });

  test('marking complete auto-advances after 3 s; the sidebar follows', async ({ page }) => {
    await seed(page, enrolledIn([RF]));
    await page.goto(`/lesson/${RF}/l-rf-2-2`);
    await hydrated(page);
    await page.getByTestId('mark-complete').click();
    await expect(page.getByTestId('advance-toast')).toContainText('Up next: Composition Patterns');
    await expect(page).toHaveURL(new RegExp(`/lesson/${RF}/l-rf-2-3$`), { timeout: 6000 });
    await expect(page.getByTestId('lesson-link-l-rf-2-3').first()).toHaveAttribute('aria-current', 'page');
    expect((await stored(page, 'enrollments')).enrollments[RF].completedLessonIds).toContain('l-rf-2-2');
  });

  test('Stay cancels the auto-advance; clicking again un-completes', async ({ page }) => {
    await seed(page, enrolledIn([RF]));
    await page.goto(`/lesson/${RF}/l-rf-1-1`);
    await hydrated(page);
    await page.getByTestId('mark-complete').click();
    await page.getByTestId('advance-stay').click();
    await page.waitForTimeout(3500);
    await expect(page).toHaveURL(new RegExp(`/lesson/${RF}/l-rf-1-1$`));
    // The first completed lesson earns "Lift Off".
    await expect(page.getByTestId('badge-modal')).toContainText('Lift Off');
    await dismissBadges(page);
    await page.getByTestId('mark-complete').click();
    await expect(page.getByTestId('mark-complete')).toHaveAttribute('aria-pressed', 'false');
  });

  test('the last lesson pops "Course complete!" and does not advance', async ({ page }) => {
    const all = (await import('./helpers.js')).RF_LESSONS;
    await seed(page, enrolledIn([RF], { completed: { [RF]: all.slice(0, 17) } }));
    await page.goto(`/lesson/${RF}/l-rf-4-4`);
    await hydrated(page);
    await page.getByTestId('mark-complete').click();
    await expect(page.getByTestId('badge-modal')).toContainText('Course complete!');
    await expect(page.getByTestId('advance-toast')).toHaveCount(0);
  });

  test('an unknown lesson id goes to the course’s first lesson', async ({ page }) => {
    await seed(page, enrolledIn([RF]));
    await page.goto(`/lesson/${RF}/l-rf-9-9`);
    await expect(page).toHaveURL(new RegExp(`/lesson/${RF}/l-rf-1-1$`));
  });

  test('a real lesson: body, highlighted code, takeaways, quiz with explanations', async ({ page }) => {
    await seed(page, enrolledIn([RF]));
    await page.goto(`/lesson/${RF}/l-rf-3-1`);
    await hydrated(page);
    const body = page.getByTestId('lesson-body');
    await expect(body.locator('.code-block').first()).toBeVisible();
    expect(await body.locator('.shiki span[style]').count()).toBeGreaterThan(10);
    await expect(page.getByRole('heading', { name: 'Key takeaways' })).toBeVisible();
    const q = page.getByTestId('quiz-question').first();
    await q.getByRole('radio').first().check();
    await q.getByRole('button', { name: 'Check answer' }).click();
    await expect(q.locator('[role=status]')).toContainText(/Correct|Not quite/);
  });

  test('notes save as you type and show up on the notes page', async ({ page }) => {
    await seed(page, enrolledIn([RF]));
    await page.goto(`/lesson/${RF}/l-rf-1-2`);
    await hydrated(page);
    await page.getByTestId('notes-button').click();
    await page.getByTestId('notes-textarea').fill('npm create vite@latest, then pick React');
    await expect(page.getByTestId('notes-panel').getByRole('status')).toHaveText('Saved');
    await page.keyboard.press('Escape');
    await page.getByTestId('bookmark-button').click();
    await page.goto('/notes');
    await hydrated(page);
    await expect(page.getByTestId('note')).toContainText('npm create vite@latest');
    await expect(page.getByRole('region', { name: /Bookmarks/ }).or(page.locator('section', { hasText: 'Bookmarks' }))).toContainText('Setting Up with Vite');
  });

  test('runnable JavaScript examples run in the sandbox', async ({ page }) => {
    await seed(page, enrolledIn(['javascript-fundamentals']));
    await page.goto('/lesson/javascript-fundamentals/l-js-1-2');
    await hydrated(page);
    const run = page.locator('[data-action=run]').first();
    test.skip((await run.count()) === 0, 'no runnable block in this lesson');
    await run.click();
    await expect(page.locator('[data-run-output]').first()).not.toBeEmpty();
  });

  test('? opens the shortcuts sheet; F toggles focus mode', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile');
    await seed(page, enrolledIn([RF]));
    await page.goto(`/lesson/${RF}/l-rf-1-1`);
    await hydrated(page);
    await page.keyboard.press('Shift+Slash');
    await expect(page.getByTestId('shortcuts-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('shortcuts-dialog')).toBeHidden();
    await page.keyboard.press('f');
    await expect(page.locator('html')).toHaveClass(/focus-mode/);
    await expect(page.locator('header').first()).toBeHidden();
  });
});
