const nextJest = require("next/jest");

// next/jest provides a convenient helper that automatically configures
// transform, moduleNameMapper, and testEnvironment for Next.js projects.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

module.exports = createJestConfig(customConfig);
