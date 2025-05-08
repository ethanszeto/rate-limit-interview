/** @type {import('jest').Config} */
const config = {
  detectOpenHandles: true,
  collectCoverage: true,
  collectCoverageFrom: ["index.js"],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      lines: 0,
      functions: 0,
    },
  },
};

module.exports = config;
