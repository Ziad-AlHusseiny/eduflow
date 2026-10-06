---
summary: Render Trailhead's growing hike log with FlatList and SectionList, understand virtualization, and apply the handful of optimizations that keep long lists smooth on mid-range phones.
takeaways:
  - "`ScrollView` with `.map()` mounts every row at once; `FlatList` mounts only a window of rows around what's visible."
  - "Give `FlatList` a `keyExtractor` that returns a stable id from your data, never the array index."
  - Virtualized rows unmount when they scroll far away, so keep row state in your data, not inside the row component.
  - Memoize the row component, keep `renderItem` stable, and add `getItemLayout` when every row has the same height.
  - "`SectionList` takes `sections` shaped as `{ title, data }` and renders grouped lists with sticky headers."
further:
  - title: FlatList
    url: https://reactnative.dev/docs/flatlist
  - title: SectionList
    url: https://reactnative.dev/docs/sectionlist
  - title: Optimizing FlatList Configuration
    url: https://reactnative.dev/docs/optimizing-flatlist-configuration
quiz:
  - q: Trailhead's log has 600 hikes rendered with `ScrollView` and `.map()`. The screen takes three seconds to appear on an older Android phone. Why?
    options:
      - text: ScrollView downloads every thumbnail before showing anything.
        why: Images load asynchronously either way. The cost is in creating 600 rows of native views up front.
      - text: ScrollView is deprecated and runs in a compatibility mode.
        why: ScrollView isn't deprecated; it's the right choice for a screen of content. It's the wrong choice for a long data list.
      - text: ScrollView renders all 600 rows, with all their native views, before the first frame.
        why: Correct. FlatList would render roughly the first screenful, then fill in more as you scroll.
    answer: 2
  - q: Each hike row has a local `useState` for "expanded". Users expand a row, scroll far down, scroll back, and it's collapsed again. Why?
    options:
      - text: FlatList unmounted the row when it left the render window, and its local state went with it.
        why: Correct. Virtualization unmounts distant rows. Keep `expandedId` in the parent or in your data and pass it down.
      - text: The keyExtractor returns duplicate keys, so React reused the wrong row.
        why: Duplicate keys cause wrong rows to update, not state resets on scroll. React would also warn you.
      - text: FlatList re-sorts the data whenever you scroll.
        why: FlatList never changes the order of your data. It only decides which rows to mount.
    answer: 0
  - q: Every Trailhead row is exactly 72 points tall. Which prop lets FlatList skip measuring rows and jump straight to row 400?
    options:
      - text: "`initialNumToRender`"
        why: That controls how many rows render in the first batch; it doesn't tell FlatList anything about their size.
      - text: "`getItemLayout`"
        why: Correct. With `length` and `offset` known up front, FlatList doesn't measure rows, and `scrollToIndex` works for rows that aren't rendered yet.
      - text: "`removeClippedSubviews`"
        why: That detaches off-screen views from the native hierarchy. It can save memory but says nothing about row sizes.
      - text: "`windowSize`"
        why: That controls how many screens of rows stay mounted around the viewport, not how they're measured.
    answer: 1
---

Trailhead's log starts with a dozen hikes. A keen hiker logs three a week; after four years that's over 600 rows, each with a thumbnail, a title and a few stats. Render that with `ScrollView` and `.map()`, and the app builds every row's native views before showing the first frame. On a flagship phone you might not notice. On the mid-range Android phones most of the world uses, you get a blank screen and a stutter.

## FlatList: render what's visible

`FlatList` takes your data and a function to render one item, and it only mounts the rows near the viewport:

```tsx title=src/app/index.tsx
import { FlatList, Text, View } from 'react-native';
import { HikeRow } from '../components/HikeRow';
import { useHikes } from '../state/hikes';

export default function HikeLog() {
  const hikes = useHikes();

  return (
    <FlatList
      data={hikes}
      keyExtractor={(hike) => hike.id}
      renderItem={({ item }) => <HikeRow hike={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#e2e8e4', marginLeft: 80 }} />}
      ListEmptyComponent={<Text style={{ padding: 24, textAlign: 'center' }}>No hikes yet. Log your first one!</Text>}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
```

Like ScrollView, a FlatList needs a bounded height, so its parent must give it `flex: 1` (a screen in Expo Router already does). `renderItem` receives `{ item, index }`. `ListHeaderComponent` and `ListFooterComponent` let a summary card or a "load more" spinner scroll with the list, instead of wrapping the FlatList in a ScrollView, which defeats virtualization entirely and triggers a warning.

## How virtualization works

FlatList keeps a **render window**: the rows on screen plus a buffer above and below. As you scroll, rows entering the window mount and rows leaving it unmount, replaced by empty space of the right height.

:::figure FlatList keeps only a window of rows mounted
<svg viewBox="0 0 640 300" role="img" aria-labelledby="t1">
  <title id="t1">Of 600 hikes, only the rows on screen plus a buffer above and below are mounted; rows outside the window are replaced by blank space of the same height.</title>
  <rect class="d-box" x="40" y="20" width="220" height="260" rx="10"/>
  <text class="d-label-muted" x="150" y="44" text-anchor="middle">rows 1–90: blank space</text>
  <rect class="d-box-accent" x="56" y="64" width="188" height="40" rx="6"/>
  <text class="d-label" x="150" y="89" text-anchor="middle">buffer (mounted)</text>
  <rect class="d-box-primary" x="56" y="112" width="188" height="76" rx="6"/>
  <text class="d-label-strong" x="150" y="155" text-anchor="middle">visible rows</text>
  <rect class="d-box-accent" x="56" y="196" width="188" height="40" rx="6"/>
  <text class="d-label" x="150" y="221" text-anchor="middle">buffer (mounted)</text>
  <text class="d-label-muted" x="150" y="264" text-anchor="middle">rows 320–600: blank space</text>
  <rect class="d-box-success" x="320" y="100" width="150" height="100" rx="18"/>
  <text class="d-label-strong" x="395" y="146" text-anchor="middle">phone screen</text>
  <text class="d-label-muted" x="395" y="170" text-anchor="middle">viewport</text>
  <path class="d-arrow" d="M320 150 L252 150" marker-end="url(#arrow)"/>
  <text class="d-label" x="500" y="60" text-anchor="start">windowSize</text>
  <text class="d-label-muted" x="500" y="80" text-anchor="start">default 21 screens</text>
  <text class="d-label" x="500" y="240" text-anchor="start">initialNumToRender</text>
  <text class="d-label-muted" x="500" y="260" text-anchor="start">default 10 rows</text>
</svg>
:::

Two consequences follow. First, **keys must be stable**: FlatList and React use them to know which row is which as rows come and go, so use an id from your data. Array indexes break the moment you insert a new hike at the top. Second, **rows forget local state** when they unmount. An "expanded" flag kept in `useState` inside the row resets after a long scroll. Lift that state into the parent (`expandedId`) or into your data.

:::mistake Keying rows by index
Without `keyExtractor`, FlatList uses `item.key`, then `item.id`, and finally the array index. Suppose Trailhead's sync API sent `uuid` instead of `id`: every row would silently be keyed by position, and passing `(item, index) => String(index)` yourself does the same. Insert a new hike at the top and every row below it now has a different key: rows remount, images flicker, and per-row state jumps to the wrong hike. Always return the real identifier, whatever it's called.
:::

## Keeping it smooth

Most list jank comes from re-rendering rows that didn't change, or doing heavy work inside them. In order of payoff:

1. **Memoize the row.** Export `HikeRow` wrapped in `memo`, so a row re-renders only when its `hike` prop changes. (If your project enables the React Compiler, it memoizes for you.)
2. **Keep `renderItem` stable.** An inline arrow function is fine with a memoized row, but don't create new objects for props on every render, such as `style={{…}}` or `hike={{ ...item }}`, which defeat `memo`.
3. **No heavy work in rows.** Format dates and compute stats once, when the data changes, not in every row's render.
4. **Right-sized images.** A 4000-pixel photo shrunk into a 56-point thumbnail costs memory for every visible row. Request thumbnails from your API, or use `expo-image` with caching.
5. **Fixed heights? Use `getItemLayout`.** If every row is 72 points plus a 1-point separator, FlatList can skip measuring:

```tsx
const ROW = 73;

<FlatList
  // …
  getItemLayout={(_, index) => ({ length: ROW, offset: ROW * index, index })}
/>
```

For logs that live on a server, don't fetch all 600 hikes at once. `onEndReached` fires when the user scrolls near the bottom (how near is set by `onEndReachedThreshold`, measured in screen heights), which is the moment to request the next page and append it to `data`. Show a spinner in `ListFooterComponent` while it loads, and guard against firing the request twice.

Tuning `windowSize` and `initialNumToRender` comes last, and only after you've measured. For very large or complex feeds, many teams switch to Shopify's FlashList, which recycles row views instead of mounting new ones and keeps a FlatList-like API.

## SectionList: grouped data

Trailhead groups hikes by month, with a sticky header for each. `SectionList` does that from data shaped like this:

```ts
const sections = [
  { title: 'October 2026', data: [ridgeLoop, lakeTrail] },
  { title: 'September 2026', data: [oldMill] },
];
```

```tsx
<SectionList
  sections={sections}
  keyExtractor={(hike) => hike.id}
  renderItem={({ item }) => <HikeRow hike={item} />}
  renderSectionHeader={({ section }) => <Text style={styles.header}>{section.title}</Text>}
  stickySectionHeadersEnabled
/>
```

The interesting part isn't the component; it's turning a flat array of hikes into that `sections` shape, correctly sorted. That's your exercise.

Section 3 starts next: with real screens to move between, Trailhead needs navigation.
