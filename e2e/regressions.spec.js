import { expect, test } from '@playwright/test';
import { dismissBadges, enrolledIn, hydrated, isMobile, RF, RF_LESSONS, seed, stored } from './helpers.js';

// Regression tests for the pre-merge code review (docs/reviews/code-review.md).

test.describe('code review regressions', () => {
  test('#1 an infinite loop in the playground stops with an error; the page stays usable', async ({ page }) => {
    await seed(page, { ...enrolledIn(['javascript-fundamentals']), drafts: { 'l-js-2-3': { files: { js: 'let i = 0;\nwhile (true) { i++; }\nconsole.log("never");' }, at: '2026-10-01T09:00:00.000Z' } } });
    await page.goto('/lesson/javascript-fundamentals/l-js-2-3');
    await hydrated(page);
    const ex = page.getByTestId('exercise-web');
    await ex.scrollIntoViewIfNeeded();
    await ex.getByTestId('run-button').click();
    await expect(ex.getByTestId('console')).toContainText('ran for too long', { timeout: 15000 });
    // The app's thread is free and Run works again.
    expect(await page.evaluate(() => 1 + 1)).toBe(2);
    await expect(ex.getByTestId('run-button')).toBeEnabled();
  });

  test('#2 a page whose content fails to load shows an error with Retry, not a blank app', async ({ page }) => {
    await seed(page, enrolledIn([RF]));
    await page.goto(`/lesson/${RF}/${RF_LESSONS[0]}`);
    await hydrated(page);
    let fail = true;
    await page.route(`**/content/en/lessons/${RF_LESSONS[1]}.json*`, (route) => (fail ? route.abort() : route.continue()));
    await page.keyboard.press('j');
    await expect(page.getByTestId('page-error')).toBeVisible();
    await expect(page.locator('header, nav').first()).toBeVisible();
    fail = false;
    await page.getByTestId('page-error-retry').click();
    await expect(page.getByTestId('lesson-body')).toBeVisible();
  });

  test('#4 a lesson reopens where you stopped reading', async ({ page }) => {
    await seed(page, { ...enrolledIn(['javascript-fundamentals']), reading: { 'l-js-1-2': { scroll: 0.5, anchor: null, at: '2026-10-01T09:00:00.000Z' } } });
    await page.goto('/lesson/javascript-fundamentals/l-js-1-2');
    await hydrated(page);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
    await page.waitForTimeout(1200);
    expect((await stored(page, 'reading'))['l-js-1-2'].scroll).toBeGreaterThan(0.3);
  });

  test('#7 a #link from ⌘K scrolls to the glossary term', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo));
    await page.goto('/courses');
    await hydrated(page);
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.keyboard.press('Control+k');
    await page.getByTestId('palette-input').fill('closure');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/glossary#/);
    const id = decodeURIComponent(new URL(page.url()).hash.slice(1));
    await expect(page.locator(`[id="${id}"]`)).toBeInViewport();
  });

  test('#8 a shared catalog link with filters hydrates without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/courses?category=data-science&sort=rating');
    await hydrated(page);
    await expect(page.getByTestId('results-count')).toContainText('Showing 2 of 16');
    expect(errors).toEqual([]);
  });

  test('#9 the certificate downloads as a PNG', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo));
    await seed(page, {
      ...enrolledIn([RF], { completed: { [RF]: RF_LESSONS } }),
      scores: { lessons: {}, checkpoints: {}, finals: { [RF]: { best: 11, total: 12, attempts: 1, at: '2026-10-02T09:00:00.000Z', passedAt: '2026-10-02T09:00:00.000Z' } } },
      settings: { textScale: 1, goalUnit: 'lessons', goalTarget: 5, autoAdvance: true, certificateName: 'Test Learner' },
    });
    await page.goto(`/courses/${RF}/certificate`);
    await hydrated(page);
    await dismissBadges(page);
    const download = page.waitForEvent('download');
    await page.getByTestId('download-certificate').click();
    expect((await download).suggestedFilename()).toBe(`eduflow-certificate-${RF}.png`);
  });

  test('#6 switching language twice from the phone menu leaves the page scrollable', async ({ page }, testInfo) => {
    test.skip(!isMobile(testInfo));
    await page.goto('/courses');
    await hydrated(page);
    for (const lang of ['ar', 'en']) {
      await page.getByTestId('menu-button').click();
      await page.getByTestId('mobile-menu').getByTestId('language-toggle').click();
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  });

  test('#13 closing ⌘K puts focus back on the search button', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo));
    await page.goto('/courses');
    await hydrated(page);
    await page.getByTestId('search-button').click();
    await expect(page.getByTestId('palette-input')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('search-button')).toBeFocused();
  });
});
