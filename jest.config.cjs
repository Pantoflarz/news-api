module.exports = {
  projects: [
    // Unit tests
    {
      displayName: "unit",
      testEnvironment: "node",
      testMatch: ["<rootDir>/tests/unit/**/*.test.js"]
    },

    // E2E tests
    {
      displayName: "e2e",
      testEnvironment: "node",
      testMatch: ["<rootDir>/tests/e2e/**/*.test.js"],
      globalSetup: "<rootDir>/tests/e2e/setup/globalSetup.js",
      globalTeardown: "<rootDir>/tests/e2e/setup/globalTeardown.js"
    }
  ]
};
