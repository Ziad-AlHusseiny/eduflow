---
summary: Present Trailhead's add-hike form as a modal, keep signed-out users on the sign-in screen with Stack.Protected, and open specific hikes from deep links, knowing how URLs are matched to route files.
takeaways:
  - "A Stack screen with `presentation: 'modal'` slides up as a sheet on iOS; dismiss it with `router.back()` after saving."
  - "`Stack.Protected` with a `guard` hides routes when the condition is false, so signed-out users can't reach them, even from a deep link."
  - "A `scheme` in app.json makes `trailhead://hikes/42` open the `/hikes/[id]` route; custom schemes need a development build, not Expo Go."
  - When matching a URL, groups and `index` add no segment, static segments beat dynamic ones, and `[...rest]` catches whatever is left.
further:
  - title: Modals
    url: https://docs.expo.dev/router/advanced/modals/
  - title: Protected routes
    url: https://docs.expo.dev/router/advanced/protected/
  - title: Linking into your app
    url: https://docs.expo.dev/linking/into-your-app/
quiz:
  - q: "Trailhead has both `src/app/hikes/new.tsx` and `src/app/hikes/[id].tsx`. Which one renders for `/hikes/new`?"
    options:
      - text: "`[id].tsx`, with `id` set to \"new\", because dynamic routes match anything."
        why: Dynamic routes do match any segment, but a static segment that matches exactly is preferred.
      - text: Whichever file was created first.
        why: Matching doesn't depend on file age. It ranks routes by how specific they are.
      - text: Neither; Expo Router reports a conflict at startup.
        why: Static and dynamic siblings are a normal, supported setup.
      - text: "`new.tsx`, because a static segment beats a dynamic one."
        why: Correct. `/hikes/new` matches the static route; `/hikes/42` falls through to `[id].tsx`.
    answer: 3
  - q: "Signed-out users tap an old email link to `trailhead://hikes/42`. The hike route sits inside `<Stack.Protected guard={isSignedIn}>`. What happens?"
    options:
      - text: The hike screen opens, then immediately shows an error.
        why: Protected routes aren't rendered at all while the guard is false, so the hike screen never mounts.
      - text: The user lands on the first available screen (Trailhead's sign-in) instead of the protected route.
        why: Correct. While the guard is false the route is unavailable, and navigation to it is redirected.
      - text: The app crashes because the route doesn't exist.
        why: Protected routes are hidden, not deleted; Expo Router handles the attempt gracefully.
    answer: 1
  - q: 'You add a `scheme` of "trailhead" to app.json and test `trailhead://hikes/42` in Expo Go. Nothing opens. Why?'
    options:
      - text: Custom schemes are registered in the app's native config, so they work in a development or production build of Trailhead, not inside Expo Go.
        why: Correct. Expo Go is a different app with its own scheme; build Trailhead itself to test its links.
      - text: Schemes must start with `https`.
        why: Universal links and App Links use https, but custom schemes like `trailhead://` are valid too.
      - text: Deep links only work when the app is already open.
        why: A deep link can cold-start the app and open the matching route directly.
    answer: 0
---

Three situations don't fit the push-a-screen pattern you've used so far. Logging a hike is a short task the user starts and finishes, so it should feel separate from browsing. Some screens should exist only for signed-in users. And Trailhead should open on the right hike when someone taps a link in a reminder or a message. Expo Router handles all three in the layout file.

## The add-hike form as a modal

A modal is a screen presented over the current context, usually sliding up from the bottom. On iOS it appears as a card with the previous screen visible behind it, and users can swipe it down to cancel. Make the form a modal by setting its presentation in the root Stack:

```tsx title=src/app/_layout.tsx
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="hikes/[id]" options={{ title: 'Hike' }} />
  <Stack.Screen name="new-hike" options={{ presentation: 'modal', title: 'Log a hike' }} />
</Stack>
```

Opening it is still `router.push('/new-hike')` (or a `Link`); closing it after a save is `router.back()`, which pops the modal like any screen. Android has no card-style sheet by default, so the modal appears as a full-screen page with a different animation; give the form a visible Cancel button in `headerLeft` so both platforms have an obvious way out.

When the form has unsaved input, swiping it away loses the user's typing. For long forms, confirm before discarding with an `Alert` on Cancel; for a short form like Trailhead's, a draft that's quick to retype is an acceptable trade.

## Protected routes

Trailhead syncs hikes to an account, so most screens require signing in. `Stack.Protected` wraps routes in a condition:

```tsx title=src/app/_layout.tsx
import { Stack } from 'expo-router';
import { useSession } from '../state/session';

export default function RootLayout() {
  const { isSignedIn, isLoading } = useSession();
  if (isLoading) return null; // the splash screen is still showing

  return (
    <Stack>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="hikes/[id]" options={{ title: 'Hike' }} />
        <Stack.Screen name="new-hike" options={{ presentation: 'modal', title: 'Log a hike' }} />
      </Stack.Protected>
    </Stack>
  );
}
```

When `guard` is false, those routes are unavailable: navigating to them, including from a deep link, sends the user to the first available screen instead, and any history entries for them are removed. Signing in flips `isSignedIn`, the layout re-renders, and the protected screens appear without you calling `router` at all. Signing out does the reverse, which also clears the back stack, so the back gesture can't reveal a signed-in screen.

`useSession` is a context like the one you built two lessons ago. Its `isLoading` covers the moment at startup when Trailhead is still reading the saved token from secure storage (section 4); rendering nothing while the splash screen is up avoids a flash of the sign-in page for users who are already signed in.

:::mistake Guarding inside each screen
Checking `if (!user) return <Redirect href="/sign-in" />` at the top of every screen works until someone adds a screen and forgets the check. A guard in the layout protects every route listed inside it, including ones added next year. Keep per-screen redirects for special cases.
:::

## Deep links

A **deep link** opens the app on a specific screen. Give Trailhead a URL scheme in `app.json`:

```json title=app.json
{
  "expo": {
    "name": "Trailhead",
    "scheme": "trailhead"
  }
}
```

Now `trailhead://hikes/42` opens the app and renders `/hikes/42` with the same Stack you built, including a back button to the log. You get this for free from file-based routing: every route already has a URL. Schemes are part of the native app configuration, so test them in a development build; Expo Go has its own scheme. From a terminal:

```bash
npx uri-scheme open trailhead://hikes/42 --ios
npx uri-scheme open trailhead://hikes/42 --android
```

Custom schemes have a weakness: any app can claim `trailhead://`. For links you share on the web, use **universal links** (iOS) and **App Links** (Android), which use your own `https://` domain and require hosting a small verification file on it. Expo's linking guide walks through both.

:::tip Deep links are untrusted input
A deep link can come from anywhere, with any id. The `parseHikeParams` function from earlier in this section is exactly what those screens need: validate, then show "hike not found" for anything that doesn't exist.
:::

## How a URL picks a route

When a link arrives, Expo Router compares its path with every route file. Knowing the rules removes the guesswork:

| Rule | Example |
|---|---|
| Groups like `(tabs)` add no segment | `(tabs)/stats.tsx` matches `/stats` |
| `index` adds no segment | `settings/index.tsx` matches `/settings` |
| `[name]` matches exactly one segment | `hikes/[id].tsx` matches `/hikes/42` |
| `[...name]` matches one or more remaining segments, as an array | `trails/[...path].tsx` matches `/trails/alps/mont-blanc` |
| Static beats dynamic beats catch-all | `/hikes/new` picks `hikes/new.tsx` over `hikes/[id].tsx` |
| The query string becomes extra params | `/hikes/42?units=mi` adds `units` |

That ranking is why you can safely add `hikes/new.tsx` next to `hikes/[id].tsx`. In the exercise you'll implement this matcher yourself, which is the fastest way to never be surprised by it again.

That completes navigation. Section 4 connects Trailhead to the outside world: a server, the device's storage, and its sensors.
