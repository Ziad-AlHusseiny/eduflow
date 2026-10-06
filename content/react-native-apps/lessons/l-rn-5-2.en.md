---
summary: Set up Jest with the jest-expo preset, unit-test Trailhead's pure logic, test components the way users use them with React Native Testing Library, and mock native modules at the boundary.
takeaways:
  - The jest-expo preset configures Jest for React Native and mocks the native side of Expo modules, so tests run in Node without a device.
  - Pure functions such as parsers, reducers and validators give the most confidence per minute of test-writing; test them first.
  - React Native Testing Library renders components and lets you find elements by role, label and text, the way users and screen readers do.
  - In current versions of the library, `render` and `userEvent` interactions are async; await them.
  - Mock native modules like expo-location at the boundary with `jest.mock`, and assert on what the user sees.
further:
  - title: Unit testing with Jest
    url: https://docs.expo.dev/develop/unit-testing/
  - title: React Native Testing Library
    url: https://testing-library.com/docs/react-native-testing-library/intro/
  - title: Jest mock functions
    url: https://jestjs.io/docs/mock-functions
quiz:
  - q: Which Trailhead test gives the most confidence for the least effort?
    options:
      - text: A snapshot of the whole hike log screen.
        why: Snapshots break on every harmless markup change and pass happily when the logic is wrong. People learn to update them without reading.
      - text: An end-to-end test that taps through the app on a simulator to check that "8,4" is parsed.
        why: End-to-end tests are valuable for critical flows, but they're slow and flaky for checking one parsing rule.
      - text: A table of inputs and expected outputs for `parseDistanceKm` and `hikesReducer`.
        why: Correct. Pure functions run in milliseconds, need no mocks, and cover the rules users depend on.
    answer: 2
  - q: How should a component test find Trailhead's Save button?
    options:
      - text: "`screen.getByRole('button', { name: 'Save' })`"
        why: Correct. It finds what users and screen readers see, and it fails if you forget the button role, which is a real accessibility bug.
      - text: "`screen.getByTestId('save-btn-3')`"
        why: Test ids work, but they test an implementation detail and miss accessibility problems. Use them as a last resort.
      - text: By reading the third child of the rendered tree's root View.
        why: That breaks whenever layout changes, even when the app still works.
    answer: 0
  - q: A component calls `Location.getForegroundPermissionsAsync()`. In a Jest test it returns `undefined` and the component shows a spinner forever. What's the right fix?
    options:
      - text: Run the test on a simulator so the real module is available.
        why: Jest runs in Node; there's no device. The boundary needs a mock, not a simulator.
      - text: Remove the permission check from the component when `process.env.NODE_ENV` is `test`.
        why: Test-only branches in production code mean you're no longer testing the code you ship.
      - text: Wrap the call in `try`/`catch` so the test passes.
        why: Nothing throws here; the mock just returns nothing. A `catch` changes nothing and hides real errors.
      - text: Mock the module with `jest.mock('expo-location', …)` so the function resolves with a permission response you choose.
        why: Correct. You control the boundary and can test each state (granted, denied, and permanently denied).
    answer: 3
---

Every lesson in this course has pushed logic out of components and into small pure functions: `parseDistanceKm`, `hikesReducer`, `validateHikeForm`, `permissionAction`, `trackDistanceKm`. That wasn't only tidiness. On mobile, checking a change by hand means rebuilding, launching, navigating three screens deep and typing on a simulator keyboard. A test that checks the same thing in 20 milliseconds, every time you save, is the best trade you'll make.

## Setting up Jest

Expo's preset, `jest-expo`, configures Jest for React Native: it transforms your TypeScript and JSX, and **mocks the native side of Expo modules**, so tests run in Node with no device. Install it and React Native Testing Library:

```bash
npx expo install jest-expo jest @types/jest --dev
npx expo install @testing-library/react-native --dev
```

Then point Jest at the preset in `package.json`:

```json title=package.json
{
  "scripts": {
    "test": "jest --watchAll"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

Expo's guide also lists a `transformIgnorePatterns` entry for packages that ship untranspiled code; copy it from there when an import fails with "SyntaxError: Cannot use import statement outside a module". Put tests in `__tests__` folders next to the code they cover.

## Start with pure logic

The parser from section 1 has many small rules. A table of cases documents them better than prose:

```ts title=src/lib/__tests__/parseDistance.test.ts
import { parseDistanceKm } from '../parseDistance';

test.each([
  ['8.4', 8.4],
  ['8,4', 8.4],
  [' 12 km', 12],
  ['abc', null],
  ['0', null],
  ['1.2.3', null],
])('parseDistanceKm(%j) is %p', (input, expected) => {
  expect(parseDistanceKm(input)).toBe(expected);
});
```

Notice that the test cases are exactly the odd inputs you worried about when you wrote the function: the comma decimal, the trailing unit, the zero. Every bug report becomes one more row in a table like this, written before the fix, so the same bug can never quietly return.

Reducers get the same treatment: build a state, dispatch an action, check the result, and check that the input wasn't mutated. These tests are fast, stable and need no mocks, which is why they should be most of your suite.

## Testing components like a user

React Native Testing Library renders components in memory and lets you query them the way people perceive them: by **role**, **label** and **text**. Here's a test for the `QuickLog` component from section 1:

```tsx title=src/components/__tests__/QuickLog.test.tsx
import { render, screen, userEvent } from '@testing-library/react-native';
import { QuickLog } from '../QuickLog';

test('saves a valid distance', async () => {
  const onSave = jest.fn();
  const user = userEvent.setup();
  await render(<QuickLog onSave={onSave} />);

  await user.type(screen.getByLabelText('Distance (km)'), '8,4');
  await user.press(screen.getByRole('button', { name: 'Save' }));

  expect(onSave).toHaveBeenCalledWith(8.4);
});

test('keeps Save disabled until the distance is valid', async () => {
  const user = userEvent.setup();
  await render(<QuickLog onSave={jest.fn()} />);

  await user.type(screen.getByLabelText('Distance (km)'), 'far');

  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});
```

For `getByLabelText` to find the input, the `TextInput` needs `accessibilityLabel="Distance (km)"`. That's the point: a test that queries by role and label fails when the screen isn't accessible, so your tests double as an accessibility check. `userEvent` simulates real interactions (focus, typing each character, press-in and press-out), and in current versions of the library both `render` and the interactions are **async**, so await them. Matchers like `toBeOnTheScreen()`, `toHaveTextContent()` and `toBeDisabled()` come with the library.

:::mistake Testing implementation details
Asserting that a component called `setState` twice, or snapshotting its whole tree, ties tests to how the code is written rather than what it does. Refactor the component and the tests fail even though the app works; break the logic and a snapshot happily records the broken output. Assert on what a user can observe: text on screen, a button's state, a callback called with the right value.
:::

## Mocking the device at the boundary

`jest-expo` stubs native modules, but stubs return nothing useful. When a component depends on a module's answer, mock it with the answer you want to test:

```tsx
import * as Location from 'expo-location';

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

test('offers Settings after a permanent denial', async () => {
  jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({
    status: 'denied', granted: false, canAskAgain: false, expires: 'never',
  } as Location.LocationPermissionResponse);

  await render(<TrackScreen />);

  expect(await screen.findByRole('button', { name: 'Open Settings' })).toBeOnTheScreen();
});
```

`findBy…` queries wait for the element to appear, which suits screens that load asynchronously. Mock at the edge of your app (native modules, `fetch`), not your own components, so the code under test is the code you ship. Screens that use Expo Router hooks can be rendered with `renderRouter` from `expo-router/testing-library`, which sets up an in-memory router with the routes you give it.

## Where end-to-end tests fit

Unit and component tests can't catch a broken native build, a permission prompt that never appears, or a keyboard covering the Save button. A few **end-to-end** tests on real builds cover that: tools such as Maestro (which EAS can run in the cloud) or Detox drive the actual app on a simulator. Keep them for the flows that would hurt most if broken, such as signing in and logging a hike, and let the fast tests cover everything else.

Next: turning the tested app into builds that real phones can install.
