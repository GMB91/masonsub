import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "tests/ui/support/e2e.ts",
    fixturesFolder: "tests/ui/fixtures",
    screenshotsFolder: "tests/ui/screenshots",
    videosFolder: "tests/ui/videos",
    video: false,
    specPattern: "tests/ui/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // Add task for logging
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
  viewportWidth: 1440,
  viewportHeight: 900,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  defaultCommandTimeout: 8000,
  requestTimeout: 10000,
  responseTimeout: 10000,
});