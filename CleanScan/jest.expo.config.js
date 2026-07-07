/**
 * Component / integration test config (renders React Native screens).
 * Run with: npx jest --config jest.expo.config.js
 * Requires a full `npm install` (jest-expo, react-test-renderer, etc.).
 */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-draggable-flatlist|zustand))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.spec.tsx', '**/*.spec.ts'],
};
