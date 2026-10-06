---
summary: Turn files in src/app into Trailhead's screens with Expo Router, wrap them in a native stack with a layout file, and move between them with Link and the router object.
takeaways:
  - Every file in `src/app` is a route, and its path is the URL; keep components, hooks and utilities outside that folder.
  - A `_layout.tsx` file wraps its sibling routes in a navigator, such as a native `Stack`.
  - "Use `<Link href>` for navigation the user taps, and `router.push`, `router.replace` and `router.back` from code."
  - "`push` adds a screen to the stack, `back` pops it, and `replace` swaps the current screen so the user can't go back to it."
further:
  - title: Expo Router introduction
    url: https://docs.expo.dev/router/introduction/
  - title: Core concepts of file-based routing
    url: https://docs.expo.dev/router/basics/core-concepts/
  - title: Navigating between pages
    url: https://docs.expo.dev/router/basics/navigation/
quiz:
  - q: You add `src/app/HikeRow.tsx` to hold a reusable list row component. What happens?
    options:
      - text: Nothing special; Expo Router only treats files with `Screen` in the name as routes.
        why: There's no naming rule like that. Every file in the app directory is a route.
      - text: Expo Router registers it as a route at `/HikeRow`, so a component meant for reuse becomes a navigable screen.
        why: Correct. Put shared components in `src/components` (or anywhere outside `src/app`).
      - text: The build fails, because route files must be lower-case.
        why: Case doesn't make a file a non-route. It still registers, at `/HikeRow`.
    answer: 1
  - q: After a user finishes onboarding, Trailhead navigates to the hike log. Pressing back should not return to onboarding. Which call fits?
    options:
      - text: "`router.push('/')`"
        why: "`push` leaves onboarding underneath, so back returns to it."
      - text: "`router.back()`"
        why: That goes to whatever was before onboarding, which isn't the hike log.
      - text: "`router.replace('/')`"
        why: Correct. `replace` swaps the current screen for the new one, so there's nothing to go back to.
    answer: 2
  - q: Where does a header title for the `/settings` screen belong?
    options:
      - text: "In the layout, `<Stack.Screen name=\"settings\" options={{ title: 'Settings' }} />`, or set from the screen itself with the same component."
        why: Correct. Options can live in the layout (good for static titles) or be rendered inside the screen (good when they depend on data).
      - text: In `app.json` under `expo.routes.settings.title`.
        why: There's no such key. Navigation options live in your layouts and screens.
      - text: In a `<title>` element at the top of the screen's JSX.
        why: That's HTML. Native headers are configured through navigator options.
    answer: 0
---

On the web, a URL bar shows where you are, and the back button walks through history. On a phone, users see neither: they see screens sliding in from the right, a back arrow or swipe, and tabs at the bottom. Underneath, Expo Router still gives every screen a URL, which is what makes deep links, typed navigation and a web version possible. You get both models at once.

## Files are routes

Expo Router builds your navigation from the files in `src/app`. The path of the file is the route:

```text
src/app/
  _layout.tsx          wraps everything below in a navigator
  index.tsx            /
  about.tsx            /about
  settings/
    _layout.tsx        wraps the settings screens
    index.tsx          /settings
    units.tsx          /settings/units
  +not-found.tsx       any URL that doesn't match
```

Each route file default-exports a component. That's all a screen is:

```tsx title=src/app/about.tsx
import { Text, View } from 'react-native';

export default function About() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Trailhead keeps a private log of your hikes.</Text>
    </View>
  );
}
```

Because **every** file in the folder becomes a route, keep everything else elsewhere: `src/components`, `src/lib`, `src/state`. A row component accidentally saved in `src/app` becomes a screen that anyone can deep-link to.

## Layouts wrap their siblings

A `_layout.tsx` file renders a navigator around the routes in its folder. Trailhead's root layout uses a **Stack**, the native push-and-pop navigator with platform animations, swipe-back on iOS and the system back gesture on Android:

```tsx title=src/app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerTintColor: '#2f6f4e' }}>
      <Stack.Screen name="index" options={{ title: 'Trailhead' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}
```

`screenOptions` applies to every screen in the stack; each `Stack.Screen` customizes one, matched by its route `name`. You don't have to list every route: unlisted ones still work with default options.

A few header options cover most needs: `title`, `headerShown: false` for screens that draw their own top bar (like the full-screen map from the last lesson), `headerBackTitle` for the label next to the iOS back arrow, and `headerRight` for a button such as "Edit". On iOS, `headerLargeTitle: true` gives you the big collapsing title from Apple's own apps, which suits a top-level list like the hike log.

When a title depends on data (the hike's name, say), render `<Stack.Screen options={{ title: hike.name }} />` inside the screen itself. It renders nothing visible; it configures the header of the screen it's in.

:::figure Files become routes, and the layout's Stack holds the visited screens
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">The files index.tsx, settings/index.tsx and settings/units.tsx map to the URLs /, /settings and /settings/units; navigating pushes each onto a stack, and back pops the top one.</title>
  <rect class="d-box" x="20" y="30" width="220" height="190" rx="12"/>
  <text class="d-label-strong" x="40" y="58">src/app/</text>
  <text class="d-code" x="50" y="92">index.tsx</text>
  <text class="d-code" x="50" y="132">settings/index.tsx</text>
  <text class="d-code" x="50" y="172">settings/units.tsx</text>
  <path class="d-arrow" d="M240 88 L300 88" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M240 128 L300 128" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M240 168 L300 168" marker-end="url(#arrow)"/>
  <text class="d-code" x="310" y="92">/</text>
  <text class="d-code" x="310" y="132">/settings</text>
  <text class="d-code" x="310" y="172">/settings/units</text>
  <rect class="d-box-primary" x="480" y="150" width="170" height="40" rx="8"/>
  <text class="d-label" x="565" y="175" text-anchor="middle">/</text>
  <rect class="d-box-primary" x="480" y="104" width="170" height="40" rx="8"/>
  <text class="d-label" x="565" y="129" text-anchor="middle">/settings</text>
  <rect class="d-box-accent" x="480" y="58" width="170" height="40" rx="8"/>
  <text class="d-label-strong" x="565" y="83" text-anchor="middle">/settings/units</text>
  <text class="d-label-muted" x="565" y="40" text-anchor="middle">Stack (top is visible)</text>
  <text class="d-label-muted" x="565" y="215" text-anchor="middle">push adds · back pops</text>
</svg>
:::

## Moving between screens

For anything the user taps, use `Link`. It renders text by default; with `asChild` it hands navigation to your own pressable component:

```tsx title=src/app/index.tsx
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function HikeLog() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Link href="/about">About Trailhead</Link>
      <Link href="/settings" asChild>
        <Pressable accessibilityRole="button">
          <Text>Settings</Text>
        </Pressable>
      </Link>
    </View>
  );
}
```

From code, after a save or a login, use the `router` object:

```tsx
import { router } from 'expo-router';

router.push('/settings/units'); // add a screen on top
router.back();                  // pop the top screen
router.replace('/');            // swap the current screen; no way back to it
```

`push` is the normal forward move. `replace` is for flows where returning makes no sense: after onboarding, after logging in, after a "saved!" confirmation. `back` is what the header's back arrow and the swipe gesture already do; call it yourself after a form saves so the user lands where they came from. There's also `router.navigate`, which goes to a route and, if that route is already in the stack, returns to it instead of pushing a duplicate.

:::mistake Pushing in a loop
A "Done" button that calls `router.push('/')` after editing a hike stacks a second copy of the log on top of the first. Do it a few times and the back gesture walks through five identical lists. After finishing a task, go **back** (or `replace`), don't push forward to where you came from.
:::

## A stack is not browser history

It's tempting to treat the stack like browser history, but there's one difference that matters: **every screen in the stack stays mounted**. When you push the hike detail screen, the log underneath keeps its state and scroll position, and its effects keep running. That's why going back is instant, and also why a screen's `useEffect` doesn't re-run when you return to it. When you need to refresh data every time a screen comes back into view, Expo Router provides `useFocusEffect`, which runs when the screen gains focus and cleans up when it loses it.

## Not-found and why URLs still matter

`+not-found.tsx` renders for any URL that doesn't match a route, which on mobile happens mostly through deep links from old emails or a renamed screen. Give it a friendly message and a `Link` home.

Thinking in URLs pays off later in this section: a notification can open `/hikes/42` directly, a link in a message can open the app on the right screen, and the same routes run on the web if you ever build Trailhead for it.

Next you'll add tabs at the bottom of the app, a detail screen for each hike, and pass the hike's id through the URL.
