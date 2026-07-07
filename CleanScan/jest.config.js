/**
 * Two test suites:
 *
 * 1. Pure-logic unit tests (utils + framework-free service logic) run under the
 *    lightweight `ts-jest` + node config below. These have NO React Native / Expo
 *    imports, so they run anywhere (CI, plain Node) without the native stack.
 *
 * 2. Component / integration tests that render screens run under `jest-expo`.
 *    To run those, use: `npx jest --config jest.expo.config.js` after
 *    `npm install`. They are kept separate so the fast logic suite stays green
 *    without a full Expo install.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          strict: true,
          esModuleInterop: true,
          module: 'commonjs',
          target: 'es2019',
          moduleResolution: 'node',
          skipLibCheck: true,
          baseUrl: '.',
          paths: { '@/*': ['./src/*'] },
        },
      },
    ],
  },
  clearMocks: true,
};
