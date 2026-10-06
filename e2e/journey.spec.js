import { expect, test } from '@playwright/test';
import { dismissBadges, hydrated, RF, RF_LESSONS, stored } from './helpers.js';

// BRIEF success criteria 2, 3, 5 and 7.
test.describe('the learning journey', () => {
  test('keyboard only: enroll → complete all 18 React Fundamentals lessons → Finisher badge pops', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Keyboard journey runs on desktop');
    test.setTimeout(180_000);
    await page.goto(`/courses/${RF}`);
    await hydrated(page);
    // Tab to "Enroll now" and press Enter.
    const enroll = page.getByTestId('enroll-button').filter({ visible: true }).first();
    for (let i = 0; i < 80 && !(await enroll.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(enroll).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('toast')).toContainText('Enrolled! Your first lesson is ready.');
    // "First Step" pops for the first enrollment.
    await expect(page.getByTestId('badge-modal')).toContainText('First Step');
    await dismissBadges(page);
    const continueBtn = page.getByTestId('continue-button').filter({ visible: true }).first();
    await continueBtn.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/lesson/${RF}/${RF_LESSONS[0]}$`));

    for (let i = 0; i < RF_LESSONS.length; i++) {
      await expect(page).toHaveURL(new RegExp(`/lesson/${RF}/${RF_LESSONS[i]}$`));
      await hydrated(page);
      await dismissBadges(page);
      await page.locator('body').focus();
      await page.keyboard.press('c'); // shortcut: mark complete
      await expect(page.getByTestId('mark-complete')).toHaveAttribute('aria-pressed', 'true');
      if (i < RF_LESSONS.length - 1) {
        await expect(page.getByTestId('advance-toast')).toBeVisible();
        await page.getByTestId('advance-go').focus();
        await page.keyboard.press('Enter');
      }
    }
    // 100%: no auto-advance; the course-complete modal pops instead.
    await expect(page.getByTestId('advance-toast')).toHaveCount(0);
    const modal = page.getByTestId('badge-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Course complete!');
    await expect(modal).toContainText('You finished React Fundamentals — the Finisher badge is yours.');
    await page.keyboard.press('Escape');
    // The next badge earned by this completion queues after it (Momentum, at 10 lessons, popped earlier; Lift Off too).
    const data = await stored(page, 'enrollments');
    expect(data.enrollments[RF].completedLessonIds).toHaveLength(18);
  });

  test('a reload restores enrollments, completion, progress, streak and badges', async ({ page }) => {
    await page.goto(`/courses/${RF}`);
    await hydrated(page);
    await page.getByTestId('enroll-button').filter({ visible: true }).first().click();
    await page.goto(`/lesson/${RF}/${RF_LESSONS[0]}`);
    await hydrated(page);
    await page.getByTestId('mark-complete').click();
    await page.getByTestId('advance-stay').click();
    await dismissBadges(page);
    await page.reload();
    await hydrated(page);
    await expect(page.getByTestId('mark-complete')).toHaveAttribute('aria-pressed', 'true');
    await page.goto('/learning');
    await hydrated(page);
    await expect(page.getByTestId('enrolled-card')).toHaveCount(1);
    await expect(page.getByTestId('enrolled-card')).toContainText('1 of 18 lessons');
    await expect(page.getByTestId('streak-pill')).toContainText('1-day streak');
    await expect(page.getByTestId('badge-first-lesson')).toHaveAttribute('data-earned', 'true');
    await expect(page.getByTestId('badge-ten-lessons')).toHaveAttribute('data-earned', 'false');
  });

  for (const path of [`/courses/design-systems`, `/lesson/${RF}/l-rf-2-3`, '/courses?category=design&sort=rating', '/ar/courses/css-mastery', '/glossary', '/paths/front-end-developer']) {
    test(`deep link survives a hard refresh: ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res.status()).toBe(200);
      await hydrated(page);
      await expect(page.locator('h1')).toBeVisible();
    });
  }
});
