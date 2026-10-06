---
summary: Lay out Trailhead's list rows and screens with flexbox, knowing the mobile defaults (column direction, no shrinking, stretch) that explain most squashed or overflowing layouts.
takeaways:
  - "Every View is a flex container, and the main axis runs top to bottom by default (`flexDirection: 'column'`)."
  - "`justifyContent` positions children along the main axis; `alignItems` positions them across it and defaults to `stretch`."
  - "Children don't shrink by default in React Native, so a long title pushes its siblings off screen until you give it `flex: 1`."
  - "`flex: 1` means take the remaining space; a screen's root View and every parent of a ScrollView need it."
  - "Use `position: 'absolute'` for overlays like badges, and `flexWrap: 'wrap'` with `gap` for chip rows."
further:
  - title: Layout with Flexbox
    url: https://reactnative.dev/docs/flexbox
  - title: Layout Props
    url: https://reactnative.dev/docs/layout-props
quiz:
  - q: "A row has a 56-point thumbnail, a title and a chevron. Long hike names push the chevron off the right edge. What's the fix?"
    options:
      - text: "Add `flexWrap: 'wrap'` to the row."
        why: Wrapping moves the chevron to a second line, which is a different broken layout.
      - text: "Give the title's container `flex: 1` so it takes only the space left over and its text wraps or truncates."
        why: Correct. Children don't shrink by default, and `flex` set to 1 makes the middle column absorb the remaining width instead of demanding its full text width.
      - text: "Set `overflow: 'hidden'` on the row."
        why: That clips the chevron instead of making room for it.
      - text: "Give the chevron `flex: 1`."
        why: That makes the chevron grow to fill space, which is the opposite of what you want.
    answer: 1
  - q: "In a View with default styles, you set `justifyContent: 'center'`. Where do the children go?"
    options:
      - text: Centered horizontally, in a row.
        why: That's the web default, where `flex-direction` is `row`. React Native defaults to `column`.
      - text: "Nowhere different, because `justifyContent` needs `display: 'flex'` first."
        why: Every View is already a flex container, so there's nothing to turn on.
      - text: Centered vertically, stacked in a column.
        why: Correct. The main axis is vertical by default, so `justifyContent` centers along it.
    answer: 2
  - q: Trailhead's detail screen is a ScrollView inside a View, and it won't scroll; the content is simply cut off. What's the likely cause?
    options:
      - text: "The outer View has no `flex: 1`, so the ScrollView has no bounded height to scroll within."
        why: Correct. A ScrollView scrolls inside the space its parent gives it; without a bounded height it grows to its content and gets cut off by the screen.
      - text: "ScrollView needs `scrollEnabled={true}` to scroll."
        why: It's already `true` by default. You'd set it to `false` to disable scrolling.
      - text: ScrollView can only scroll horizontally on Android.
        why: It scrolls vertically on both platforms by default; `horizontal` switches the direction.
    answer: 0
---

Here's a layout bug every web developer hits in their first week of React Native: a row with an icon, a title and a chevron looks perfect with "Ridge Loop" and breaks with "Old Mill Creek Trail to Eagle Point Lookout". The chevron vanishes off the right edge. Nothing is wrong with your flexbox knowledge; React Native's flexbox simply starts from different defaults.

## Same flexbox, different defaults

React Native lays out every View with flexbox (via Yoga, a layout engine that implements the spec). There's no `display: block` or `inline`; every View is a flex container. Four defaults differ from the web:

| Property | Web default | React Native default |
|---|---|---|
| `flexDirection` | `row` | `column` |
| `flexShrink` | `1` | `0` |
| `alignContent` | `normal` | `flex-start` |
| `flex` | a shorthand | a single number |

The first two explain most surprises. Children stack vertically unless you say `flexDirection: 'row'`, and they **don't shrink** when space runs out, which is why that long title pushed the chevron away.

:::figure Main axis and cross axis in a column and a row
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">In a column, the main axis runs top to bottom and justifyContent works vertically while alignItems works horizontally. In a row, the main axis runs left to right and the roles swap.</title>
  <text class="d-label-strong" x="160" y="24" text-anchor="middle">flexDirection: 'column' (default)</text>
  <rect class="d-box" x="70" y="40" width="180" height="200" rx="12"/>
  <rect class="d-box-primary" x="90" y="58" width="140" height="36" rx="8"/>
  <rect class="d-box-primary" x="90" y="104" width="140" height="36" rx="8"/>
  <rect class="d-box-primary" x="90" y="150" width="140" height="36" rx="8"/>
  <path class="d-arrow" d="M40 50 L40 225" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="30" y="140" text-anchor="middle" transform="rotate(-90 30 140)">main: justifyContent</text>
  <path class="d-arrow d-dashed" d="M80 225 L240 225" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="160" y="214" text-anchor="middle">cross: alignItems</text>
  <text class="d-label-strong" x="500" y="24" text-anchor="middle">flexDirection: 'row'</text>
  <rect class="d-box" x="370" y="40" width="270" height="140" rx="12"/>
  <rect class="d-box-accent" x="386" y="60" width="56" height="56" rx="8"/>
  <rect class="d-box-accent" x="454" y="60" width="130" height="56" rx="8"/>
  <text class="d-label" x="519" y="93" text-anchor="middle">flex: 1</text>
  <rect class="d-box-accent" x="596" y="60" width="30" height="56" rx="8"/>
  <path class="d-arrow" d="M380 205 L630 205" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="505" y="228" text-anchor="middle">main: justifyContent</text>
  <path class="d-arrow d-dashed" d="M655 50 L655 170" marker-end="url(#arrow)"/>
</svg>
:::

The rules you know still hold: `justifyContent` works along the main axis, `alignItems` across it. In a column (the default), `justifyContent: 'center'` centers vertically and `alignItems: 'center'` centers horizontally. Switch to a row and the two swap.

`alignItems` defaults to `stretch`, so a child in a column fills the full width unless you give it a width or change `alignItems`. That's why a `Text` with a background color in a plain column stretches edge to edge.

## flex: 1, the property you'll type most

In React Native, `flex` takes a single number. `flex: 1` means "grow to fill the remaining space along the main axis, and you may shrink". Two places need it almost always:

1. **The root View of every screen**, so it fills the screen instead of hugging its content.
2. **Every parent of a ScrollView or FlatList**, because a scroll container scrolls within the height it's given. If no ancestor bounds that height, it grows to its full content and the bottom gets cut off without ever scrolling.

When a screen renders as a thin strip at the top, or a list won't scroll, walk up the tree and look for the missing `flex: 1`.

## Building the hike row

Here's the row that broke, fixed:

```tsx title=src/components/HikeRow.tsx
import { Image, StyleSheet, Text, View } from 'react-native';

export function HikeRow({ hike }: { hike: { name: string; distanceKm: number; date: string; thumbUrl: string } }) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: hike.thumbUrl }} style={styles.thumb} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{hike.name}</Text>
        <Text style={styles.meta}>{hike.distanceKm} km · {hike.date}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  body: { flex: 1 },
  title: { fontSize: 17, fontWeight: '600' },
  meta: { fontSize: 14, color: '#5c6b62', marginTop: 2 },
  chevron: { fontSize: 24, color: '#9aa79f' },
});
```

Read it axis by axis. The row's main axis is horizontal; `alignItems: 'center'` centers the three children vertically against the tallest one (the thumbnail). The thumbnail and chevron have fixed sizes. The body has `flex: 1`, so it takes whatever width is left, and `numberOfLines={1}` truncates a long name with an ellipsis instead of pushing the chevron off screen.

:::mistake Fixing overflow with a fixed width
Setting `width: 220` on the title fits your test phone and breaks on a small Android phone, in landscape, and for users with larger text. Let flex distribute the space: fixed sizes for things that really are fixed (icons, thumbnails), `flex: 1` for the part that should absorb the difference.
:::

Two more tools round out everyday layout. `alignSelf` lets one child break from its parent's `alignItems`: a "Log a hike" button in a stretched column can use `alignSelf: 'flex-end'` to sit on the right at its natural width. And `aspectRatio` sizes a box from one dimension, which is ideal for photos: give the trail photo `width: '100%'` and `aspectRatio: 4 / 3`, and its height follows the screen width on every phone without you calculating anything.

When a layout misbehaves, the fastest debugging trick is still the oldest one: give the suspect Views a temporary bright background color. You'll see at once which box is too small, which one stretched, and which one never got its `flex: 1`.

## Absolute positioning and wrapping

Every View is `position: 'relative'` by default, so `position: 'absolute'` places a child relative to its parent. That's how you put a "New" badge on the corner of a thumbnail:

```tsx
<View>
  <Image source={{ uri: hike.thumbUrl }} style={styles.thumb} />
  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#e8590c', borderRadius: 8, paddingHorizontal: 6 }}>
    <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>NEW</Text>
  </View>
</View>
```

For a row of tag chips ("steep", "lake", "dog-friendly") that should flow onto a second line when they run out of room, combine `flexDirection: 'row'`, `flexWrap: 'wrap'` and `gap: 8`. Absolute positioning takes the child out of the flex flow entirely, so use it for overlays only, never to fake a layout that flex can express.

Next you'll make these layouts hold up across phone sizes, notches, rounded corners and the two platforms' differences.
