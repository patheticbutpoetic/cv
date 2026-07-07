/* Component test setup for the jest-expo suite. */
/* eslint-disable no-undef */

// Silence the native animated helper warning in tests.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });

// react-native-draggable-flatlist pulls reanimated/gesture-handler; mock lightly.
jest.mock('react-native-draggable-flatlist', () => {
  const { FlatList } = require('react-native');
  return { __esModule: true, default: FlatList };
});
