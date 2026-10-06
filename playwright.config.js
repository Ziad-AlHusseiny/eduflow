import { defineConfig, devices } from '@playwright/test';

// Dedicated port so a stray dev server elsewhere is never reused by mistake.
const PORT = 4335;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 6,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 45_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    timezoneId: 'Africa/Cairo',
    locale: 'en-US',
    trace: 'retain-on-failure',
    // The service worker would serve cached pages between tests; the PWA spec opts back in.
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // The prerendered production build, served like Vercel (rebuilt first if stale).
    command: `node scripts/serve-e2e.mjs ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
