module.exports = {
  automock: false,
  setupTestFrameworkScriptFile: '<rootDir>/setup-jest-env.js',
  testMatch: ['<rootDir>/__tests__/**/*.js'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
