---
summary: Make Trailhead's screens fit any phone with useWindowDimensions and safe-area insets, and write platform-specific code with Platform.select or per-platform files only where the platforms really differ.
takeaways:
  - "`useWindowDimensions()` re-renders on rotation and resizing; `Dimensions.get()` is a one-time snapshot that goes stale."
  - Screens without a navigation header or tab bar must pad themselves with safe-area insets from react-native-safe-area-context.
  - Android draws apps edge to edge behind the system bars, so insets matter on Android as much as on iOS.
  - "Use `Platform.select` for small differences and `.ios.tsx` / `.android.tsx` files when a whole component differs."
further:
  - title: Safe areas
    url: https://docs.expo.dev/develop/user-interface/safe-areas/
  - title: useWindowDimensions
    url: https://reactnative.dev/docs/usewindowdimensions
  - title: Platform-Specific Code
    url: https://reactnative.dev/docs/platform-specific-code
quiz:
  - q: Trailhead's photo grid computes its columns once with `Dimensions.get('window').width` at the top of the file. What breaks?
    options:
      - text: Nothing; screen width never changes while an app runs.
        why: It changes on rotation, in iPad split view and on foldables, and the stored value doesn't update.
      - text: The grid keeps its old column count after the user rotates the phone or unfolds a foldable.
        why: Correct. Read size with `useWindowDimensions()` inside the component so it re-renders with the new width.
      - text: It crashes on Android because `Dimensions` is iOS-only.
        why: "`Dimensions` works on both platforms. The problem is that the value is read once and never refreshed."
    answer: 1
  - q: Trailhead's full-screen map has no header. Its top buttons sit under the iPhone's Dynamic Island. What's the right fix?
    options:
      - text: "Add `paddingTop: 50` to the screen."
        why: The right amount differs by device, orientation and platform. A magic number is wrong on most phones.
      - text: Wrap the screen in `SafeAreaView` imported from `react-native`.
        why: That component is deprecated, works only on iOS, and doesn't handle Android's edge-to-edge layout.
      - text: Hide the status bar so nothing overlaps.
        why: The Dynamic Island and rounded corners are hardware; hiding the status bar doesn't move them.
      - text: Read `useSafeAreaInsets()` and apply `insets.top` to the buttons' container.
        why: Correct. Insets are the exact size of the unsafe area on this device, right now, on both platforms.
    answer: 3
  - q: Trailhead's date picker needs completely different components on iOS and Android, while the rest of the form is shared. What's the cleanest structure?
    options:
      - text: Two files, `DatePicker.ios.tsx` and `DatePicker.android.tsx`, imported as `./DatePicker`.
        why: Correct. The bundler picks the right file per platform, and each file stays simple and readable.
      - text: One component with `if (Platform.OS === 'ios')` around every line that differs.
        why: That works for a line or two, but a whole component full of branches is hard to read and easy to break.
      - text: Two separate apps, one per platform.
        why: That throws away the shared form logic, the main reason to use React Native.
    answer: 0
---

The phones your users carry range from small Android devices around 360 points wide to large iPhones over 430, plus tablets, foldables that change width mid-session, and landscape. On top of that, the screen isn't a clean rectangle: there's a notch or Dynamic Island, rounded corners, a home indicator, and on Android, status and navigation bars that your app now draws behind. Three tools make Trailhead fit all of that.

## Reading the screen size the right way

`useWindowDimensions()` returns the window's `width`, `height`, `scale` and `fontScale`, and re-renders your component whenever they change:

```tsx
import { useWindowDimensions } from 'react-native';

export function PhotoGrid({ photos }: { photos: string[] }) {
  const { width } = useWindowDimensions();
  const columns = width >= 700 ? 4 : 2;
  // …render photos in `columns` columns
}
```

You'll find older code calling `Dimensions.get('window')` at module level. That reads the size once, when the file loads, and never again: rotate the phone, open the app in iPad split view, or unfold a foldable, and the layout keeps using the old width. Use the hook inside components.

Prefer flex over measurements when you can. Most layouts never need the width at all; reach for `useWindowDimensions` when the **structure** changes with size (two columns become four), not to compute pixel values flexbox already handles.

:::tip Respect fontScale
`fontScale` is above 1 when the user has turned up their system text size; 1.3 or more is common among older hikers, which is Trailhead's audience. Test your screens with the largest accessibility text size at least once. Rows with fixed heights are the first thing to break.
:::

## Safe areas on both platforms

The **safe area** is the part of the screen not covered by hardware cutouts or system UI. Navigation headers and tab bars from Expo Router already respect it. Screens without them, like a full-screen map or an onboarding page, must handle it themselves.

The library for this is `react-native-safe-area-context`. Expo Router already includes it and provides the `SafeAreaProvider` at the root, so you can use the hook straight away:

```tsx title=src/app/track.tsx
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrackScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      {/* the map fills the whole screen, edge to edge */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Text style={styles.timer}>01:24:10</Text>
      </View>
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Text>Stop and save</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  timer: { fontSize: 20, fontWeight: '700' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, alignItems: 'center' },
});
```

The map can draw under the status bar, which looks good, while the controls sit exactly below the unsafe area. `insets` has `top`, `bottom`, `left` and `right`, so landscape works too. The library also exports a `SafeAreaView` component that applies padding for you, which is handy for simple screens.

:::mistake Using SafeAreaView from react-native
`import { SafeAreaView } from 'react-native'` still compiles, but it's deprecated, only ever worked on iOS, and ignores Android's edge-to-edge layout. On recent Android versions apps draw behind the status and navigation bars, so content without insets ends up under the clock or the gesture bar. Import from `react-native-safe-area-context` instead.
:::

## When the platforms differ

React Native shares code across iOS and Android, but the platforms aren't identical, and pretending they are produces an app that feels foreign on both. `Platform` gives you the current OS:

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
  },
  card: Platform.select({
    ios: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' },
    android: { elevation: 3 },
    default: {},
  }),
});
```

`Platform.select` returns the value for the current platform, falling back to `default`. It's the right tool for small differences: a font weight, a shadow, a hit slop.

When a **whole component** differs, split it into files. Create `DatePicker.ios.tsx` and `DatePicker.android.tsx`, then import `./DatePicker` with no extension; Metro picks the right file per platform. The same works with `.native.tsx` and `.web.tsx` if Trailhead ever runs on the web.

Where do the platforms really differ? Navigation conventions (iOS swipes back from the left edge; Android has a system back gesture), pickers and date inputs, typography defaults, haptics, and permission flows. Where they don't, such as your hike list, your forms and your business logic, share everything.

## A tablet-friendly grid

Putting the pieces together: the photo grid should show as many columns as fit, with a minimum card width, consistent gaps and screen padding. That's a small calculation, run every time the width changes, and it's exactly the kind of pure function worth getting right once. You'll write it in the exercise below.

Next up: lists. Trailhead will soon hold hundreds of hikes, and rendering them all at once is the fastest way to make a phone feel slow.
