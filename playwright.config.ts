import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ path: '.env.test' })

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  globalSetup: './tests/e2e/global-setup.ts',
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,
  // Playwright reads .env.test via the env option
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
