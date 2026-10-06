import { expect, test } from '@playwright/test';
import { enrolledIn, hydrated, RF, seed, stored } from './helpers.js';

test.describe('course detail (PRD §5)', () => {
  test('enroll writes eduflow-enrollments, bumps the nav pill, shows Continue at 0%', async ({ page }, testInfo) => {
    await page.goto(`/courses/${RF}`);
    await hydrated(page);
    await expect(page.locator('h1')).toHaveText('React Fundamentals');
    await expect(page.getByText('4 sections · 18 lessons · 5h 20m total')).toBeVisible();
    await page.getByTestId('enroll-button').filter({ visible: true }).first().click();
    await expect(page.getByTestId('toast')).toContainText('Enrolled! Your first lesson is ready.');
    const data = await stored(page, 'enrollments');
    expect(data.version).toBe(1);
    expect(data.enrollments[RF].enrolledAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    if (testInfo.project.name === 'desktop') await expect(page.getByTestId('nav-enrolled-count')).toContainText('1');
    await expect(page.getByTestId('continue-button').filter({ visible: true }).first()).toHaveText('Continue learning');
  });

  test('Continue goes to the last visited lesson', async ({ page }) => {
    await seed(page, enrolledIn([RF], { lastVisited: { [RF]: 'l-rf-2-3' } }));
    await page.goto(`/courses/${RF}`);
    await hydrated(page);
    await page.getByTestId('continue-button').filter({ visible: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`/lesson/${RF}/l-rf-2-3$`));
  });

  test('the curriculum accordion opens and closes', async ({ page }) => {
    await page.goto(`/courses/${RF}`);
    await hydrated(page);
    const section = page.getByRole('button', { name: /Components & Props/ });
    await expect(section).toHaveAttribute('aria-expanded', 'false');
    await section.click();
    await expect(section).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Props In Depth')).toBeVisible();
  });

  test('an unknown course shows the 404 page', async ({ page }) => {
    await page.goto('/courses/not-a-course');
    await expect(page.locator('h1')).toHaveText('404 — this page dropped out');
    await expect(page.getByRole('link', { name: 'Browse courses' })).toBeVisible();
  });
});

test.describe('my learning (PRD §6)', () => {
  test('empty state with no enrollments', async ({ page }) => {
    await page.goto('/learning');
    await hydrated(page);
    await expect(page.getByText('Your learning journey starts here')).toBeVisible();
  });

  test('streak and badges come from the saved state', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-08-28T12:00:00+03:00'));
    const ten = ['l-rf-1-1', 'l-rf-1-2', 'l-rf-1-3', 'l-rf-1-4', 'l-rf-2-1', 'l-rf-2-2', 'l-rf-2-3', 'l-rf-2-4', 'l-rf-2-5', 'l-rf-3-1'];
    await seed(page, enrolledIn([RF, 'css-mastery'], { completed: { [RF]: ten }, activityLog: ['2026-08-27', '2026-08-28'] }));
    await page.goto('/learning');
    await hydrated(page);
    await expect(page.getByTestId('streak-pill')).toHaveText('2-day streak');
    await expect(page.getByTestId('badge-ten-lessons')).toHaveAttribute('data-earned', 'true');
    await expect(page.getByTestId('badge-twenty-five-lessons')).toHaveAttribute('data-earned', 'false');
    await expect(page.getByTestId('enrolled-card')).toHaveCount(2);
  });

  test('corrupt saved data resets to a first visit (no crash)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('eduflow-enrollments', '{broken'));
    await page.goto('/learning');
    await hydrated(page);
    await expect(page.getByText('Your learning journey starts here')).toBeVisible();
  });
});
