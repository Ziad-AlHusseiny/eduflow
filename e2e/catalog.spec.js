import { expect, test } from '@playwright/test';
import { hydrated, isMobile } from './helpers.js';

const count = (page) => page.getByTestId('course-card');

test.describe('catalog (PRD §4)', () => {
  test('"Start learning free" opens the catalog with the Free filter applied from the URL', async ({ page }) => {
    await page.goto('/');
    await hydrated(page);
    await page.getByRole('link', { name: 'Start learning free' }).first().click();
    await expect(page).toHaveURL(/\/courses\?price=free$/);
    await expect(count(page)).not.toHaveCount(0);
    for (const card of await count(page).all()) await expect(card).toContainText('Free');
    await expect(page.getByTestId('results-count')).toContainText(/Showing \d+ of 16 courses/);
  });

  test('the Design card filters to the 2 design courses and checks the box', async ({ page }, testInfo) => {
    await page.goto('/');
    await hydrated(page);
    await page.getByTestId('category-design').click();
    await expect(page).toHaveURL(/category=design/);
    await expect(count(page)).toHaveCount(2);
    if (!isMobile(testInfo)) await expect(page.getByRole('checkbox', { name: 'Design' })).toBeChecked();
  });

  test('Design + Free → only UI Design with Figma; reload keeps it; Clear all keeps the sort', async ({ page }) => {
    await page.goto('/courses?category=design&price=free&sort=rating');
    await hydrated(page);
    await expect(count(page)).toHaveCount(1);
    await expect(count(page)).toContainText('UI Design with Figma');
    await expect(page.getByTestId('results-count')).toHaveText('Showing 1 of 16 courses');
    await page.reload();
    await hydrated(page);
    await expect(count(page)).toHaveCount(1);
    await expect(page.getByTestId('sort-select')).toHaveValue('rating');
    await page.getByRole('button', { name: 'Clear all', exact: true }).click();
    await expect(page).toHaveURL(/\/courses\?sort=rating$/);
    await expect(count(page)).toHaveCount(16);
  });

  test('search ?q=maya matches the instructor; the empty state clears everything', async ({ page }) => {
    await page.goto('/courses?q=maya');
    await hydrated(page);
    await expect(count(page)).toHaveCount(3);
    await expect(page.getByTestId('course-grid')).toContainText('React Fundamentals');
    await expect(page.getByTestId('course-grid')).toContainText('Build Mobile Apps with React Native');
    await page.getByTestId('catalog-search').fill('zzzz nothing');
    await expect(page.getByText('No courses match your filters')).toBeVisible();
    await page.getByRole('button', { name: 'Clear all filters' }).click();
    await expect(count(page)).toHaveCount(16);
    await expect(page).toHaveURL(/\/courses$/);
  });

  test('typing in search updates the URL (debounced)', async ({ page }) => {
    await page.goto('/courses');
    await hydrated(page);
    await page.getByTestId('catalog-search').fill('kubernetes');
    await expect(page).toHaveURL(/q=kubernetes/);
    await expect(count(page)).toHaveCount(1);
  });

  test('phones filter in a bottom sheet with a count badge', async ({ page }, testInfo) => {
    test.skip(!isMobile(testInfo));
    await page.goto('/courses?level=beginner&price=free');
    await hydrated(page);
    await expect(page.getByTestId('filters-button')).toHaveText(/Filters · 2/);
    await page.getByTestId('filters-button').click();
    const sheet = page.getByTestId('filter-sheet');
    await expect(sheet).toBeVisible();
    await sheet.getByRole('checkbox', { name: 'Design' }).check();
    await expect(page).toHaveURL(/category=design/);
    await sheet.getByRole('button', { name: 'Apply' }).click();
    await expect(sheet).toBeHidden();
    await expect(count(page)).toHaveCount(1);
  });
});
