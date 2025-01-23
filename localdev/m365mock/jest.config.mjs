export default {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The test environment to use (e.g., Node.js or browser-like environment)
  testEnvironment: 'node',

  // Specify file extensions to treat as modules
  extensionsToTreatAsEsm: ['.ts', '.mts'],

  // Transform TypeScript files using ts-jest
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },

  // Directories or patterns to ignore for test discovery
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // Enable verbose logging of test results
  verbose: true,

  // Automatically reset mock state before every test
  resetMocks: true,

  // A list of reporter names to use (optional)
  reporters: ['default'],

  // Module resolution settings
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Handle module name mapping (adjust if needed)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Collect code coverage (optional)
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['**/*.{ts,js}', '!**/node_modules/**', '!**/dist/**'],
};
