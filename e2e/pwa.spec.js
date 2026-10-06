import { expect, test } from '@playwright/test';
import { enrolledIn, hydrated, RF, seed } from './helpers.js';

test.use({ serviceWorkers: 'allow' });

test('downloaded course lessons open offline', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile');
  test.setTimeout(90_000);
  await seed(page, enrolledIn([RF]));
  await page.goto(`/courses/${RF}`);
  await hydrated(page);
  await page.waitForFunction(() => navigator.serviceWorker?.controller || navigator.serviceWorker?.ready.then(() => true), null, { timeout: 20000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.getByTestId('download-offline').filter({ visible: true }).first().click();
  await expect(page.getByText('Available offline').first()).toBeVisible({ timeout: 60000 });
  await page.reload();
  await context.setOffline(true);
  await page.goto(`/lesson/${RF}/l-rf-4-2`);
  await expect(page.locator('h1')).toHaveText('Styling with Tailwind');
  await expect(page.getByTestId('lesson-body')).toBeVisible();
  await context.setOffline(false);
});
