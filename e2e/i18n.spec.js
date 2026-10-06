import { expect, test } from '@playwright/test';
import { enrolledIn, hydrated, RF, seed } from './helpers.js';

test.describe('English and Arabic', () => {
  test('the language toggle keeps the page and switches to RTL Arabic', async ({ page }, testInfo) => {
    await page.goto('/courses/css-mastery');
    await hydrated(page);
    if (testInfo.project.name === 'mobile') await page.getByTestId('menu-button').click();
    await page.getByTestId('language-toggle').filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/ar\/courses\/css-mastery$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('h1')).not.toHaveText('Modern CSS Mastery');
    // A later visit to an English URL follows the saved choice.
    await page.goto('/courses');
    await expect(page).toHaveURL(/\/ar\/courses$/);
  });

  test('Arabic lessons are Arabic, with code kept left-to-right', async ({ page }) => {
    await seed(page, { ...enrolledIn([RF]), locale: 'ar' });
    await page.goto(`/ar/lesson/${RF}/l-rf-3-1`);
    await hydrated(page);
    const body = page.getByTestId('lesson-body');
    await expect(body).toContainText(/[؀-ۿ]/);
    await expect(body.locator('.code-block').first()).toHaveAttribute('dir', 'ltr');
    expect(await body.locator('.code-block pre').first().evaluate((el) => getComputedStyle(el).direction)).toBe('ltr');
  });

  test('?lang=en goes back to English', async ({ page }) => {
    await seed(page, { locale: 'ar' });
    await page.goto('/courses?lang=en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveURL(/\/courses$/);
  });
});
