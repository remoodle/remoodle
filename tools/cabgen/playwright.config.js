// @ts-check
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  workers: 5,
  retries: 2,
  timeout: 60000,
  reporter: [["html"], ["list"]],
  use: {
    viewport: { width: 1920, height: 1080 },
    screenshot: "only-on-failure",
    video: "off",
    trace: "retain-on-failure",
    navigationTimeout: 30000,
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
        colorScheme: "dark",
        timezoneId: "UTC",
      },
    },
  ],
  outputDir: "test-results/",
});
