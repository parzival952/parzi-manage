import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3100",
    // Permet d'utiliser un Chromium déjà présent (env sandbox) ; en CI,
    // `playwright install` fournit le navigateur et la variable est absente.
    launchOptions: process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {},
  },
  webServer: {
    command: process.env.CI
      ? "npm run start -- --port 3100"
      : "npm run build && npm run start -- --port 3100",
    url: "http://localhost:3100",
    timeout: 240_000,
    reuseExistingServer: true,
  },
});
