---
summary: Share Trailhead's hike list across tabs and screens with a reducer and context provided from the root layout, derive totals instead of storing them, and know when a state library earns its place.
takeaways:
  - State used by several routes belongs above all of them, which in Expo Router means a provider in the root `_layout.tsx`.
  - A reducer keeps every change to the hike list in one pure, testable function that returns new arrays and objects.
  - Wrap context in small hooks such as `useHikes()` and `useHike(id)`, so screens never touch the context object directly.
  - Derive totals and filtered lists from the source state with `useMemo`; don't store them separately.
  - Reach for a library like Zustand when context re-renders become a measured problem, and for TanStack Query when the data lives on a server.
further:
  - title: Scaling Up with Reducer and Context
    url: https://react.dev/learn/scaling-up-with-reducer-and-context
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
  - title: useReducer
    url: https://react.dev/reference/react/useReducer
quiz:
  - q: The Stats tab stores `totalKm` in its own `useState`, updated in an effect. After a user deletes a hike, the total is wrong until the app restarts. What's the best fix?
    options:
      - text: Add the hikes array to the effect's dependency list.
        why: That patches the symptom, but you still have two copies of the truth and an extra render on every change.
      - text: Move `totalKm` into the reducer and update it on every action.
        why: Now every action has to remember to keep the total in sync, which is where this kind of bug comes from.
      - text: Re-mount the Stats tab whenever it gains focus.
        why: Throwing away the screen's state to recover from a sync bug costs more than the bug.
      - text: Delete the state and compute the total from the shared hikes with `useMemo`.
        why: Correct. Derived values computed from one source of truth can't drift out of sync.
    answer: 3
  - q: |
      What's wrong with this reducer case?
      ```js
      case 'favoriteToggled': {
        const hike = state.find((h) => h.id === action.id);
        hike.favorite = !hike.favorite;
        return state;
      }
      ```
    options:
      - text: It mutates the existing hike and returns the same array, so React sees no change and nothing re-renders.
        why: Correct. Return a new array with a new object for the changed hike, for example with `state.map`.
      - text: Reducers can't contain block-scoped `const` declarations.
        why: Block-scoped declarations inside a `case` with braces are fine.
      - text: "`find` is too slow for a reducer; it needs an index lookup."
        why: For hundreds of hikes `find` is instant. The bug is mutation, not speed.
    answer: 0
  - q: Where should Trailhead's `HikesProvider` be rendered so the Log tab, the Stats tab and the `/hikes/[id]` screen can all read it?
    options:
      - text: Inside `(tabs)/index.tsx`, since the log owns the hikes.
        why: Siblings and the detail screen are outside that component, so they can't read its context.
      - text: In `src/app/_layout.tsx`, around the root Stack.
        why: Correct. Everything rendered by the root layout, tabs and stack screens alike, is inside the provider.
      - text: In every screen that needs it, each with its own copy.
        why: Separate providers mean separate state; an edit on one screen wouldn't show on the others.
    answer: 1
---

Four parts of Trailhead now care about the same data. The Log tab lists hikes, the Stats tab totals them, the detail screen shows one, and the add-hike form (next lesson) creates them. If each screen loads and keeps its own copy, they drift apart: you delete a hike on the detail screen, go back, and the Stats tab still counts it, because stack screens and visited tabs stay mounted and don't reload.

The fix is the React principle you already know, applied to a navigation tree: one source of truth, held above everything that needs it.

## Where shared state lives in Expo Router

In a web app you'd put the provider near the root component. In Expo Router, the root component is `src/app/_layout.tsx`: it renders the Stack, which renders the tab group and every pushed screen. A provider placed around that Stack covers the whole app.

:::figure One provider in the root layout feeds every screen
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">HikesProvider wraps the root Stack in src/app/_layout.tsx; the Log tab, the Stats tab and the hike detail screen all read the same hikes and dispatch actions to the same reducer.</title>
  <rect class="d-box-primary" x="200" y="16" width="280" height="64" rx="12"/>
  <text class="d-label-strong" x="340" y="44" text-anchor="middle">HikesProvider</text>
  <text class="d-code" x="340" y="66" text-anchor="middle">src/app/_layout.tsx</text>
  <rect class="d-box" x="240" y="104" width="200" height="40" rx="10"/>
  <text class="d-label" x="340" y="129" text-anchor="middle">root Stack</text>
  <path class="d-line" d="M340 80 L340 104"/>
  <rect class="d-box-accent" x="40" y="186" width="170" height="50" rx="10"/>
  <text class="d-label" x="125" y="216" text-anchor="middle">Log tab</text>
  <rect class="d-box-accent" x="255" y="186" width="170" height="50" rx="10"/>
  <text class="d-label" x="340" y="216" text-anchor="middle">Stats tab</text>
  <rect class="d-box-accent" x="470" y="186" width="170" height="50" rx="10"/>
  <text class="d-label" x="555" y="216" text-anchor="middle">/hikes/[id]</text>
  <path class="d-line" d="M300 144 L125 186"/>
  <path class="d-line" d="M340 144 L340 186"/>
  <path class="d-line" d="M380 144 L555 186"/>
  <path class="d-arrow d-dashed" d="M600 186 C640 120 560 60 482 52" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="612" y="110" text-anchor="middle">dispatch</text>
</svg>
:::

## A reducer for every change

Hikes get added, edited, deleted and favorited. Rather than scattering `setHikes` calls across screens, describe each change as an **action** and handle them all in one pure function:

```ts title=src/state/hikesReducer.ts
export type Hike = { id: string; name: string; date: string; distanceKm: number; favorite: boolean };

export type HikesAction =
  | { type: 'added'; hike: Hike }
  | { type: 'updated'; id: string; changes: Partial<Omit<Hike, 'id'>> }
  | { type: 'deleted'; id: string }
  | { type: 'favoriteToggled'; id: string };

export function hikesReducer(state: Hike[], action: HikesAction): Hike[] {
  switch (action.type) {
    case 'added':
      return [action.hike, ...state];
    case 'updated':
      return state.map((h) => (h.id === action.id ? { ...h, ...action.changes } : h));
    case 'deleted':
      return state.filter((h) => h.id !== action.id);
    case 'favoriteToggled':
      return state.map((h) => (h.id === action.id ? { ...h, favorite: !h.favorite } : h));
  }
}
```

Every case returns a **new** array, and a new object for the hike that changed. That's how React knows something changed, and it's what lets a memoized `HikeRow` skip re-rendering the 599 rows that didn't.

Notice the action names: `added`, `deleted`, `favoriteToggled`. They describe **what happened**, not how to update state. That keeps screens simple (the detail screen reports that the user toggled a favorite and doesn't care how the list is stored) and gives you one place to change when the rules change, for example when deleting a hike should also remove its photos.

Because the reducer has no React Native imports, it runs anywhere. You'll test reducers like this one with plain Jest in section 5, and you'll write one in this lesson's exercise.

## The provider and its hooks

```tsx title=src/state/hikes.tsx
import { createContext, use, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { hikesReducer, type Hike, type HikesAction } from './hikesReducer';

const HikesContext = createContext<Hike[] | null>(null);
const DispatchContext = createContext<Dispatch<HikesAction> | null>(null);

export function HikesProvider({ initial, children }: { initial: Hike[]; children: ReactNode }) {
  const [hikes, dispatch] = useReducer(hikesReducer, initial);
  return (
    <DispatchContext value={dispatch}>
      <HikesContext value={hikes}>{children}</HikesContext>
    </DispatchContext>
  );
}

export function useHikes() {
  const hikes = use(HikesContext);
  if (!hikes) throw new Error('useHikes must be used inside HikesProvider');
  return hikes;
}

export function useHike(id: string | undefined) {
  const hikes = useHikes();
  return useMemo(() => hikes.find((h) => h.id === id), [hikes, id]);
}

export function useHikesDispatch() {
  const dispatch = use(DispatchContext);
  if (!dispatch) throw new Error('useHikesDispatch must be used inside HikesProvider');
  return dispatch;
}
```

Then wrap the Stack in the root layout: `<HikesProvider initial={sampleHikes}><Stack>…</Stack></HikesProvider>`. In section 4 the initial data will come from the device's database instead.

A few details worth copying. React 19 lets you render a context directly as its provider (`<HikesContext value={…}>`) and read it with `use`. Splitting state and dispatch into **two contexts** means components that only dispatch, like a delete button, don't re-render when the list changes. And the hooks throw a clear error if someone forgets the provider, instead of failing later with "cannot read properties of null".

A screen now reads like this:

```tsx
const hike = useHike(id);
const dispatch = useHikesDispatch();
// …
<Pressable onPress={() => dispatch({ type: 'favoriteToggled', id: hike.id })}>
```

## Derive, don't duplicate

The Stats tab needs total distance, hike count and the longest hike. None of those are state. They're **derived** from the hike list, so compute them:

```tsx
const hikes = useHikes();
const stats = useMemo(() => {
  const totalKm = hikes.reduce((sum, h) => sum + h.distanceKm, 0);
  const longest = hikes.reduce((best, h) => (!best || h.distanceKm > best.distanceKm ? h : best), undefined as Hike | undefined);
  return { count: hikes.length, totalKm, longest };
}, [hikes]);
```

:::mistake Copying shared data into local state
`const [hike, setHike] = useState(useHike(id))` snapshots the hike when the screen mounts. Edit it from elsewhere and this screen keeps showing the old copy, because `useState` only uses its argument on the first render. Read from the shared hook on every render; copy into local state only for a draft the user is editing, such as a form, and dispatch when they save.
:::

## When context isn't enough

Context re-renders every consumer when its value changes. For Trailhead's hike list that's fine. It becomes a problem when a value changes very often (a live GPS position updating every second) or when a large app has many unrelated consumers. Teams then reach for **Zustand**, a small store with selectors so components re-render only for the slice they read. Data that lives on a server has different problems again (caching, refetching, staleness), which is the job of TanStack Query; you'll meet that in section 4. Start with reducer plus context, and move when you've measured a reason.

Next, the screen that creates hikes: a form that works with a phone keyboard.
