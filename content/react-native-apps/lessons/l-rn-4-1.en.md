---
summary: Load Trailhead's trail catalog from a server with fetch, model loading, error, empty and success states explicitly, cancel stale requests, and handle the flaky networks phones live on.
takeaways:
  - Model a request as one status value (loading, error or success) instead of several booleans that can contradict each other.
  - "`fetch` only rejects on network failure; check `response.ok` yourself for 404 and 500 responses."
  - Abort in-flight requests in the effect's cleanup, because users leave screens before slow requests finish.
  - Every list that loads data needs four designed states, including an empty state and an error state with a retry button.
  - On a phone, `localhost` is the phone itself; point development builds at your computer's network address or a deployed API.
further:
  - title: Networking
    url: https://reactnative.dev/docs/network
  - title: Using fetch
    url: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  - title: RefreshControl
    url: https://reactnative.dev/docs/refreshcontrol
quiz:
  - q: "Trailhead's API returns `404 Not Found` for a deleted trail. What does `await fetch(url)` do?"
    options:
      - text: It throws, so the `catch` block handles it.
        why: fetch only rejects when no response arrives at all (offline, DNS failure, aborted). A 404 is a response.
      - text: It resolves with a response whose `ok` is `false` and `status` is 404, which you must check.
        why: Correct. Check `if (!res.ok)` and throw or handle it yourself.
      - text: It resolves with `undefined`.
        why: fetch always resolves with a Response object when the server answers, whatever the status code.
    answer: 1
  - q: A user opens a trail's detail screen and immediately goes back. The request finishes two seconds later and calls `setState`. What should the effect have done?
    options:
      - text: Nothing; React Native ignores state updates from unmounted screens, so it's harmless.
        why: The update is dropped, but the request still used data and battery, and a slow earlier response can overwrite a newer one when the id changes.
      - text: Wrapped the call in `setTimeout` so it runs after navigation.
        why: Delaying the request doesn't stop it from finishing after the screen is gone.
      - text: Created an `AbortController` and called `controller.abort()` in the cleanup function.
        why: Correct. Aborting cancels the request on unmount or when the id changes, so stale responses never land.
    answer: 2
  - q: Which state shape best fits Trailhead's catalog screen?
    options:
      - text: "`{ status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; trails: Trail[] }`"
        why: Correct. Only valid combinations exist, and TypeScript makes you handle each one.
      - text: "`isLoading`, `hasError` and `trails` as three separate `useState` calls."
        why: Nothing prevents `isLoading` and `hasError` being true together, or stale trails showing next to an error.
      - text: "`trails: Trail[] | null`, where `null` means loading or error."
        why: Loading and error look the same, so the screen can't show the right message.
      - text: A single `trails` array that starts empty.
        why: An empty array can't tell "still loading" from "no trails nearby", which are very different screens.
    answer: 0
---

Up to now, Trailhead's data has lived on the phone. The next feature, a catalog of trails near you, comes from a server. On a laptop with office Wi-Fi, a request is a formality. On a phone at a trailhead with one bar of signal, it's the slowest and least reliable thing your app does: requests take seconds, fail halfway, or never come back. Designing for that is most of the work.

## Four states, one value

Every screen that loads data has at least four states the user can see: **loading**, **error**, **empty** (it loaded, and there's nothing), and **success**. Model them as one value, so impossible combinations can't happen:

```ts title=src/lib/types.ts
export type Trail = { id: string; name: string; lengthKm: number; difficulty: 'easy' | 'moderate' | 'hard' };

export type Load<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };
```

Empty isn't a separate status; it's success with zero items, and the screen decides how to show it.

:::figure A request moves between explicit states
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">The screen starts in loading. A successful response moves it to success, which shows either the list or an empty state. A failure moves it to error, and Retry moves it back to loading. Pull to refresh goes from success back to loading.</title>
  <rect class="d-box-accent" x="250" y="20" width="160" height="54" rx="12"/>
  <text class="d-label-strong" x="330" y="53" text-anchor="middle">loading</text>
  <rect class="d-box-success" x="440" y="150" width="190" height="60" rx="12"/>
  <text class="d-label-strong" x="535" y="176" text-anchor="middle">success</text>
  <text class="d-label-muted" x="535" y="198" text-anchor="middle">list or empty state</text>
  <rect class="d-box-warn" x="30" y="150" width="190" height="60" rx="12"/>
  <text class="d-label-strong" x="125" y="176" text-anchor="middle">error</text>
  <text class="d-label-muted" x="125" y="198" text-anchor="middle">message + Retry</text>
  <path class="d-arrow" d="M380 74 L500 150" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="480" y="104" text-anchor="middle">response ok</text>
  <path class="d-arrow" d="M280 74 L160 150" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="180" y="104" text-anchor="middle">fails</text>
  <path class="d-arrow d-dashed" d="M220 168 C300 140 280 110 300 76" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="300" y="150" text-anchor="middle">Retry</text>
  <path class="d-arrow d-dashed" d="M440 168 C380 140 380 110 362 76" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="400" y="150" text-anchor="middle">refresh</text>
</svg>
:::

## Fetching with cleanup

```tsx title=src/app/(tabs)/explore.tsx
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import type { Load, Trail } from '../../lib/types';

const API = process.env.EXPO_PUBLIC_API_URL;

async function getTrails(signal: AbortSignal): Promise<Trail[]> {
  const res = await fetch(`${API}/trails?near=current`, { signal });
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();
}

export default function Explore() {
  const [state, setState] = useState<Load<Trail[]>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    getTrails(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: 'Could not load trails. Check your connection and try again.' });
      });
    return () => controller.abort();
  }, [attempt]);

  if (state.status === 'loading') return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (state.status === 'error') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 }}>
        <Text style={{ textAlign: 'center' }}>{state.message}</Text>
        <Pressable onPress={retry} accessibilityRole="button"><Text>Try again</Text></Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={state.data}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => <Text style={{ padding: 16 }}>{item.name} · {item.lengthKm} km</Text>}
      ListEmptyComponent={<Text style={{ padding: 24 }}>No trails within 50 km. Try a wider search.</Text>}
    />
  );
}
```

Three details carry the weight. `res.ok` is checked by hand, because `fetch` treats a 500 as a successful delivery of bad news. The `AbortController` cancels the request in the cleanup, so leaving the screen (or retrying) never lets a stale response overwrite a fresh one. And the error message tells the user what to do, rather than printing `TypeError: Network request failed`.

`EXPO_PUBLIC_API_URL` comes from a `.env` file. Variables prefixed with `EXPO_PUBLIC_` are inlined into the JavaScript bundle, which also means they're **readable by anyone** who unpacks your app. Put URLs there, never secret keys.

:::mistake Calling localhost from a phone
`fetch('http://localhost:3000/trails')` works in a web browser on your laptop and fails on a phone, because there `localhost` is the phone. Use your computer's network address (`http://192.168.1.20:3000`) during development; the Android Emulator reaches the host machine at `10.0.2.2`. Both platforms also restrict plain `http://` in release builds, so production APIs should be `https://`.
:::

## Pull to refresh and slow networks

Users expect to drag a list down to reload it. FlatList supports that with two props:

```tsx
<FlatList
  // …
  refreshing={refreshing}
  onRefresh={async () => {
    setRefreshing(true);
    try { setState({ status: 'success', data: await getTrails(new AbortController().signal) }); }
    catch { /* keep the old list and show a short "Couldn't refresh" message */ }
    finally { setRefreshing(false); }
  }}
/>
```

A refresh keeps the old list visible while it loads, which is friendlier than the full-screen spinner of the first load. If the refresh fails, keep the old data and show a short message, instead of replacing a perfectly good list with an error screen.

Flaky networks also argue for **automatic retries** with a growing delay between attempts (1 s, 2 s, 4 s), so a brief signal drop recovers by itself. Only retry what can succeed later: a timeout or a 503 might, but a 404 or a 401 won't, so failing fast is kinder. You'll write that helper in the exercise.

## Offline is a normal state, not an error

For a hiking app, no signal is the expected condition for hours at a time. Treat it that way. Show the last list you loaded, with a quiet banner saying when it was updated, instead of an error screen. Let users keep logging hikes, save them on the device, and send them when the connection returns. The community package `@react-native-community/netinfo` tells you whether the device is connected and notifies you when that changes, which is the moment to retry queued work.

None of that needs to be clever on day one. What matters is the decision: for each screen, what does the user see with no network? Write the answer down before writing the fetch, and design the empty, error and offline states with the same care as the happy path.

## When to use a data library

The code above is fine for one screen. Across a real app you'd repeat it everywhere, and you'd still lack caching (revisit a screen and see data instantly), request deduplication, background refetching and retries. **TanStack Query** handles all of that with `useQuery`, and its docs include the small React Native setup that refetches when the app returns to the foreground. Learn the manual version first so you know what the library is doing, then use the library in production.

Next: data that has to survive without any network at all, stored on the device.
