---
summary: Build Trailhead's hike detail screen with View, Text, Image and ScrollView, and avoid the text and image rules that crash or blank out mobile screens.
takeaways:
  - "`View` is a layout box and can't hold raw text; every string must be inside a `<Text>`."
  - Text styles inherit only from a parent `<Text>`, never from a `<View>`.
  - Network images need an explicit width and height; local images from `require()` know their own size.
  - "`ScrollView` renders all of its children at once and needs a bounded height, so use it for screens of content, not long data lists."
  - "`{count && <Text>…</Text>}` crashes when `count` is 0, because 0 is rendered as a raw string; compare explicitly instead."
further:
  - title: Core Components and APIs
    url: https://reactnative.dev/docs/components-and-apis
  - title: Text
    url: https://reactnative.dev/docs/text
  - title: Image
    url: https://reactnative.dev/docs/image
quiz:
  - q: |
      Which line throws "Text strings must be rendered within a <Text> component"?
      ```tsx
      <View>
        <Text>Ridge Loop</Text>
        {hike.photoCount && <Text>{hike.photoCount} photos</Text>}
      </View>
      ```
    options:
      - text: Line 2, because `Text` must be wrapped in another `Text`.
        why: A `Text` directly inside a `View` is the normal case. Only raw strings need wrapping.
      - text: Line 3, when `photoCount` is 0, because `0 && …` evaluates to `0` and React renders it as text inside a View.
        why: Correct. `false`, `null` and `undefined` render nothing, but the number 0 renders as "0". Use `photoCount > 0 && …`.
      - text: Neither; React Native silently ignores stray strings.
        why: It doesn't. On the web a stray string becomes a text node, but a native View has no text node to put it in, so React Native throws.
    answer: 1
  - q: "You set `style={{ color: '#2f6f4e', fontSize: 18 }}` on a `View`. What happens to the `Text` inside it?"
    options:
      - text: It turns green at 18 points, like CSS inheritance.
        why: There's no cascade from View to Text. Text only inherits from an ancestor Text.
      - text: The app crashes because View doesn't accept those keys.
        why: You'll get a type error in TypeScript, but at runtime the View ignores those keys. The real problem is that nothing happens.
      - text: Nothing changes; the Text keeps its default color and size.
        why: Correct. Put text styles on the Text itself, or build a small `<AppText>` component that applies them.
    answer: 2
  - q: "`<Image source={{ uri: hike.photoUrl }} />` shows nothing, and there are no errors. What's the most likely fix?"
    options:
      - text: "Give it a size, for example `style={{ width: '100%', height: 220 }}`."
        why: Correct. React Native can't know a network image's size before it downloads, so without a size the image is 0 by 0.
      - text: Wrap the URL in `require()`.
        why: "`require()` is for images bundled with the app, resolved at build time. It can't load a URL."
      - text: Use `src` instead of `source`.
        why: "`src` is the HTML attribute. React Native's Image uses `source`."
    answer: 0
  - q: Trailhead's detail screen has a photo, a title, stats and a long description that may not fit. Which container fits best?
    options:
      - text: "A `View` with `overflow: 'scroll'`."
        why: Views never scroll, whatever their overflow style. Scrolling is a separate native component.
      - text: A `ScrollView`, because it's a fixed screen of mixed content.
        why: Correct. A screen-sized ScrollView with a handful of children is exactly its job.
      - text: A `FlatList` with one item per paragraph.
        why: FlatList is for long, uniform data lists. For one screen of content it adds complexity and buys nothing.
    answer: 1
---

On the web, you can throw a string into a `div`, set a font on `body`, and drop in an `<img>` without thinking about its size. Try the same in React Native and you'll get a red error screen, text in the wrong font, or an image that never appears. Four components carry most screens, and each has one rule that catches web developers.

## View: a box, nothing more

`View` is the building block for layout: a rectangle that can have a background, a border, padding and children. It maps to a native container view. It has no text node, so it **cannot hold strings**:

```tsx
// Throws: Text strings must be rendered within a <Text> component.
<View>Ridge Loop</View>

// Works
<View>
  <Text>Ridge Loop</Text>
</View>
```

Think of `View` as the `div` you use for layout, minus everything a `div` does with text. It's also the thing you style most: cards, rows, dividers, badges and spacers are all Views with a background, a border radius or some padding. Views are cheap, but not free; each one becomes a real native view, so a list row with twelve nested wrappers costs more than one with four. Flatten when a wrapper adds nothing.

## Text: the only place for strings

Every visible string goes inside `<Text>`. Nested `<Text>` elements become one paragraph, and that's also the **only** place style inheritance exists: a child `Text` inherits font, color and size from a parent `Text`.

```tsx
<Text style={{ fontSize: 16, color: '#333' }}>
  Ridge Loop is <Text style={{ fontWeight: '700' }}>8.4 km</Text> with 420 m of climbing.
</Text>
```

A `View` never passes text styles down. If you want a consistent font across the app, make a component (an `AppText` that sets your defaults) rather than hunting for a global stylesheet that doesn't exist.

Text also scales with the user's accessibility settings. Someone who has set a larger font size in iOS or Android settings gets bigger text in your app automatically, which is good, and which means a fixed-height box around text will eventually clip it. Leave room to grow; prefer padding over fixed heights for anything that contains words.

Two props you'll use constantly: `numberOfLines={2}` truncates with an ellipsis (perfect for list cards), and `selectable` lets users copy the text.

:::mistake The `&&` that renders a zero
`{hike.photoCount && <Text>{hike.photoCount} photos</Text>}` works on the web, where a stray `0` shows up as a harmless character. In React Native, `0 && …` evaluates to `0`, React tries to render that number directly inside a `View`, and the app throws. Write a real boolean: `{hike.photoCount > 0 && …}`.
:::

## Image: tell it how big

For images that ship with the app, `require()` resolves the file at build time, so React Native knows the image's dimensions:

```tsx
<Image source={require('../../assets/images/trail-placeholder.png')} />
```

For images from the network, React Native can't know the size until the download finishes, so you must give one. Without it the image renders at 0 by 0, silently.

```tsx
<Image
  source={{ uri: hike.photoUrl }}
  style={{ width: '100%', height: 220, borderRadius: 12 }}
  resizeMode="cover"
  accessibilityLabel={`Photo from ${hike.name}`}
/>
```

`resizeMode` works like CSS `object-fit`: `cover` fills and crops, `contain` fits inside. For production apps, many teams use `expo-image` instead: it has the same basic shape, adds disk caching and placeholders, and uses `contentFit` in place of `resizeMode`.

## ScrollView: content that may not fit

Native views don't scroll on overflow. Scrolling is its own component, `ScrollView`, and it has two quirks.

First, it needs a **bounded height**: it scrolls within whatever space its parent gives it, so the parent chain needs `flex: 1` (you'll see why in the flexbox lesson). Second, padding and alignment for the scrolled content go in `contentContainerStyle`, not `style`. `style` sizes the scrolling window; `contentContainerStyle` styles the content that slides inside it.

Here is Trailhead's detail screen, with sample data for now:

```tsx title=src/app/hike.tsx
import { Image, ScrollView, Text, View } from 'react-native';

const hike = {
  name: 'Ridge Loop',
  photoUrl: 'https://images.example.com/ridge-loop.jpg',
  distanceKm: 8.4,
  elevationM: 420,
  notes: 'Steep first kilometre, then a long ridge with views of the lake. Bring water: the spring at the saddle was dry.',
  photoCount: 0,
};

export default function HikeScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Image
        source={{ uri: hike.photoUrl }}
        style={{ width: '100%', height: 220, borderRadius: 12 }}
        accessibilityLabel={`Photo from ${hike.name}`}
      />
      <Text style={{ fontSize: 28, fontWeight: '700' }}>{hike.name}</Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Text>{hike.distanceKm} km</Text>
        <Text>{hike.elevationM} m up</Text>
      </View>
      {hike.photoCount > 0 && <Text>{hike.photoCount} photos</Text>}
      <Text style={{ fontSize: 16, lineHeight: 24 }}>{hike.notes}</Text>
    </ScrollView>
  );
}
```

Look at what isn't there: no `div`, no class names, no stylesheet import, and no stray strings. Numbers like `hike.distanceKm` are inside `Text`, so they render fine.

:::note What about a list of 300 hikes?
`ScrollView` renders every child immediately, even those far off screen. For a screen of content that's fine. For a data list that grows, it means slow startup and high memory. You'll use `FlatList` for that in section 2.
:::

## The rest of the core set

You'll meet the others as Trailhead needs them: `Pressable` and `TextInput` in the next lesson, `FlatList` and `SectionList` for lists, `ActivityIndicator` for loading, `Switch` for toggles, `Modal` for overlays, and `KeyboardAvoidingView` for forms. Each maps to a native component, so they look and behave like the platform by default.

Next you'll make Trailhead interactive: buttons that respond to touch and inputs that handle typing.
