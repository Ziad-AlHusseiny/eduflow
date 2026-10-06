---
summary: Give Trailhead bottom tabs with a route group, add a hike detail screen with a dynamic [id] route, and read its params safely, remembering that params always arrive as strings.
takeaways:
  - A folder in parentheses, like `(tabs)`, groups routes under a layout without adding a segment to the URL.
  - Put the tab navigator in `(tabs)/_layout.tsx` and push detail screens from the root Stack so they cover the tab bar.
  - "A file named `[id].tsx` matches any single segment; read it with `useLocalSearchParams()`."
  - Route params are strings (or arrays of strings), so convert and validate them before use.
  - Pass ids in params, never whole objects, and look the data up on the destination screen.
further:
  - title: Navigation layouts
    url: https://docs.expo.dev/router/basics/navigation-layouts/
  - title: Tabs
    url: https://docs.expo.dev/router/advanced/tabs/
  - title: URL parameters
    url: https://docs.expo.dev/router/reference/url-parameters/
quiz:
  - q: "What URL does `src/app/(tabs)/stats.tsx` serve?"
    options:
      - text: "`/(tabs)/stats`"
        why: Parentheses mark a group, and groups never appear in the URL.
      - text: "`/tabs/stats`"
        why: The group name is dropped entirely, not just the parentheses.
      - text: "`/stats`"
        why: Correct. The `(tabs)` group only decides which layout wraps the screen.
    answer: 2
  - q: |
      The detail screen does this, and a hike with id 7 never matches. Why?
      ```tsx
      const { id } = useLocalSearchParams<{ id: string }>();
      const hike = hikes.find((h) => h.id === id); // h.id is a number
      ```
    options:
      - text: "`useLocalSearchParams` only works inside tab screens."
        why: It works in any route. The issue is the comparison, not where the hook runs.
      - text: "`id` is the string \"7\", and `7 === \"7\"` is false; convert with `Number(id)` and check the result."
        why: Correct. URL params are always strings. The generic only types them; it doesn't convert anything.
      - text: The route file must be called `[hikeId].tsx` for the param to arrive.
        why: The file name only sets the param's name. `[id].tsx` gives you `id`.
    answer: 1
  - q: A teammate passes a whole hike object as a route param so the detail screen doesn't need to look it up. What's the main problem?
    options:
      - text: Params are serialized into the URL, so the object gets stringified, deep links can't recreate it, and the screen shows stale data after an edit.
        why: Correct. Pass the id and read the current hike from your state or storage on the destination screen.
      - text: Route params are limited to one character.
        why: There's no such limit. The problem is that URLs carry strings, not objects.
      - text: Objects in params make the app crash on Android only.
        why: It misbehaves the same way on both platforms. It just doesn't crash.
      - text: Expo Router encrypts params, so it would be slow.
        why: Params aren't encrypted; they're part of a URL. Speed isn't the issue.
    answer: 0
---

Trailhead now has more than one place to be: the hike log, a stats page, and settings, plus a detail screen for each hike. The first three are peers that users switch between all the time; the detail screen is something you drill into and come back from. That's the classic mobile shape: **tabs** for peers, a **stack** for drilling in.

## A route group for the tabs

Here's the file structure Trailhead uses:

```text
src/app/
  _layout.tsx          root Stack
  (tabs)/
    _layout.tsx        Tabs navigator
    index.tsx          /          (Log)
    stats.tsx          /stats
    settings.tsx       /settings
  hikes/
    [id].tsx           /hikes/42  (pushed over the tabs)
```

A folder in parentheses is a **route group**. It lets the three tab screens share a layout without adding anything to their URLs: `(tabs)/stats.tsx` is `/stats`, not `/tabs/stats`.

The tab layout returns a `Tabs` navigator, one `Tabs.Screen` per tab, in the order they should appear:

```tsx title=src/app/(tabs)/_layout.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2f6f4e' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Log',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

The root layout then puts the whole tab group into the Stack, with the group's own header hidden (each tab has its own), followed by the detail route:

```tsx title=src/app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="hikes/[id]" options={{ title: 'Hike' }} />
    </Stack>
  );
}
```

Because `hikes/[id]` belongs to the root Stack rather than to the tabs, opening a hike slides a full screen over the tab bar, and the back gesture returns to whichever tab you came from. That's what most iOS and Android apps do, and it gives the detail screen the whole height of the phone.

Two habits keep tabs pleasant. Keep them to between three and five top-level destinations users visit often; a sixth tab usually means some of them belong inside settings. And remember that tabs stay mounted once visited: switch from Log to Stats and back, and the log keeps its scroll position. That's the behaviour users expect, so don't reset it. If one tab needs its own drill-down screens that keep the tab bar visible, give that tab a folder with its own `_layout.tsx` returning a `Stack`; nesting navigators is just nesting folders.

:::note Native tabs
This `Tabs` component draws its tab bar in JavaScript, so you can style it freely. Expo Router also offers native tabs that use the system's own tab bar, including its newest visual styles, with less room for custom styling. The import path has changed between SDK versions, so follow the Expo Router docs for your SDK if you choose them.
:::

## Dynamic routes and params

A file named with square brackets, `[id].tsx`, matches any single URL segment and exposes it as a param named `id`. Read it with `useLocalSearchParams`:

```tsx title=src/app/hikes/[id].tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useHike } from '../../state/hikes';

export default function HikeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hike = useHike(id);

  if (!hike) {
    return (
      <View style={{ flex: 1, padding: 24 }}>
        <Text>That hike doesn't exist anymore.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: hike.name }} />
      <Text style={{ fontSize: 16 }}>{hike.distanceKm} km</Text>
    </View>
  );
}
```

To get there, link to the URL. Either build the string or let Expo Router fill in the pattern:

```tsx
<Link href={`/hikes/${hike.id}`}>{hike.name}</Link>

<Link href={{ pathname: '/hikes/[id]', params: { id: hike.id } }}>{hike.name}</Link>
```

Anything in `params` that isn't part of the path becomes a query string: `params: { id: hike.id, units: 'mi' }` produces `/hikes/42?units=mi`, and the detail screen reads `units` with the same hook.

:::mistake Trusting the param's type
`useLocalSearchParams<{ id: string }>()` looks typed, but the generic is a promise you make to TypeScript, not a conversion. Params come from a URL, so they are **strings**, and a repeated query key (`?tag=lake&tag=steep`) arrives as an **array** of strings. A deep link from an old email can also contain anything at all: `/hikes/abc`, `/hikes/-1`. Convert, validate and handle the "not found" case on every screen with params.
:::

## Ids in params, data from state

Pass the smallest thing that identifies the data, usually an id, and look the data up on the destination screen. Passing a whole hike object seems convenient, but params are serialized into the URL: the object becomes a string, a deep link can never recreate it, and if the user edits the hike, the detail screen shows the stale copy it was handed. The next lesson builds the shared state that `useHike(id)` reads from.

`useLocalSearchParams` returns the params of the screen it's called in, which is what you want almost always. Its sibling `useGlobalSearchParams` updates whenever any route changes, even routes in the background, which causes extra renders; reserve it for things like analytics that genuinely care about every navigation.

Next, the state behind those lookups: one source of truth for hikes, shared by every tab and screen.
