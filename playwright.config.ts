import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3457';
const workerCount = Number(process.env.PLAYWRIGHT_WORKERS || 1);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: workerCount,
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --hostname 127.0.0.1 --port 3457',
        url: baseURL,
        env: {
          ...process.env,
          AUTH_SECRET: process.env.AUTH_SECRET || 'active-mirror-playwright-secret',
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'active-mirror-playwright-secret',
          MIRROR_COOKIE_SECRET: process.env.MIRROR_COOKIE_SECRET || 'active-mirror-playwright-cookie-secret',
          DATABASE_URL: process.env.DATABASE_URL || 'file:./playwright.db',
          OPENAI_API_KEY: process.env.PLAYWRIGHT_OPENAI_API_KEY || '',
          MIRROR_BODY_RECEIPT_PATH: process.env.MIRROR_BODY_RECEIPT_PATH || './playwright-body-receipt.json',
          MIRROR_BODY_RECEIPT_TOKEN: '',
          MIRROR_BODY_SYNC_TOKEN: '',
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
