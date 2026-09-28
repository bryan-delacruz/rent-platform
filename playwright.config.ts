import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// Local runs read the same files as Next.js; CI passes real env vars.
loadEnv({ path: ['.env.local', '.env'], quiet: true });

// E2E tests write to the database, so they only ever run against the test one.
if (!process.env.DATABASE_URL_TEST) {
  throw new Error('Set DATABASE_URL_TEST to a disposable database before running E2E tests.');
}
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

const port = 3100;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'America/Lima',
  },
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, dependencies: ['setup'] },
  ],
  webServer: {
    command: process.env.CI ? `pnpm build && pnpm start --port ${port}` : `pnpm dev --port ${port}`,
    url: baseURL,
    timeout: 240_000,
    reuseExistingServer: false,
    env: { DATABASE_URL: process.env.DATABASE_URL_TEST },
  },
});
