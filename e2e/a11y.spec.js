import { expect, test } from '@playwright/test';
import { enrolledIn, expectAxeClean, hydrated, RF, seed } from './helpers.js';

const PAGES = ['/', '/courses', `/courses/${RF}`, `/lesson/${RF}/l-rf-2-3`, '/learning', '/review', '/stats', '/notes', '/paths', '/paths/data-analyst', '/placement', '/glossary', '/instructors', '/instructors/leila-haddad', '/privacy', `/courses/${RF}/final`, '/nope'];

for (const theme of ['light', 'dark']) {
  for (const locale of ['en', 'ar']) {
    test.describe(`axe — ${locale}, ${theme}`, () => {
      for (const path of PAGES) {
        test(path, async ({ page }) => {
          await seed(page, { ...enrolledIn([RF, 'sql-for-analysts'], { completed: { [RF]: ['l-rf-1-1', 'l-rf-1-2'] }, activityLog: ['2026-10-01'] }), theme, locale });
          await page.goto(locale === 'ar' ? (path === '/' ? '/ar' : `/ar${path}`) : path);
          await hydrated(page);
          await expect(page.locator('h1').first()).toBeVisible();
          await expectAxeClean(page);
        });
      }
    });
  }
}

test('skip link is the first tab stop and jumps to main', async ({ page }) => {
  await page.goto('/');
  await hydrated(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('mobile menu: Esc closes and focus returns to the hamburger', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await hydrated(page);
  await page.getByTestId('menu-button').click();
  await expect(page.getByTestId('mobile-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('mobile-menu')).toBeHidden();
  await expect(page.getByTestId('menu-button')).toBeFocused();
});

test('reduced motion: no bobbing or count-up animations run', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await hydrated(page);
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getComputedTiming().duration > 50).length);
  expect(running).toBe(0);
});
