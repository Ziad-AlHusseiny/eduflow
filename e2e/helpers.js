import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

export const RF = 'react-fundamentals';
export const RF_LESSONS = [
  'l-rf-1-1', 'l-rf-1-2', 'l-rf-1-3', 'l-rf-1-4',
  'l-rf-2-1', 'l-rf-2-2', 'l-rf-2-3', 'l-rf-2-4', 'l-rf-2-5',
  'l-rf-3-1', 'l-rf-3-2', 'l-rf-3-3', 'l-rf-3-4', 'l-rf-3-5',
  'l-rf-4-1', 'l-rf-4-2', 'l-rf-4-3', 'l-rf-4-4',
];

/** Seeds localStorage before any page script runs (and only on the first load). */
export async function seed(page, data) {
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('__seeded')) return;
    sessionStorage.setItem('__seeded', '1');
    for (const [k, v] of Object.entries(d)) localStorage.setItem(`eduflow-${k}`, JSON.stringify(v));
  }, data);
}

export const enrolledIn = (courses, { completed = {}, activityLog = [], lastVisited = {} } = {}) => ({
  enrollments: {
    version: 1,
    enrollments: Object.fromEntries(courses.map((id) => [id, { enrolledAt: '2026-10-01T09:00:00.000Z', completedLessonIds: completed[id] ?? [], lastVisitedLessonId: lastVisited[id] ?? null }])),
    activityLog,
  },
});

export const stored = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem(`eduflow-${k}`) ?? 'null'), key);

/** Waits until React has hydrated the prerendered page (the app marks <html>). */
export async function hydrated(page) {
  await page.waitForFunction(() => document.documentElement.dataset.ready === location.pathname);
}

/** axe: WCAG 2.2 A/AA, no violations. */
export async function expectAxeClean(page, { exclude = [] } = {}) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
  for (const sel of exclude) builder = builder.exclude(sel);
  const { violations } = await builder.analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
}

export const isMobile = (testInfo) => testInfo.project.name === 'mobile';

/** Closes any badge pop-ups (badges pop as you go; that's the point). */
export async function dismissBadges(page) {
  const modal = page.getByTestId('badge-modal');
  for (let i = 0; i < 6; i++) {
    // The next badge in the queue mounts a moment after the last one closes
    // (at night, a first lesson earns Lift Off and Night Owl together).
    const shown = await modal.waitFor({ state: 'visible', timeout: i ? 600 : 100 }).then(() => true, () => false);
    if (!shown) return;
    await page.keyboard.press('Escape');
    await modal.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}
