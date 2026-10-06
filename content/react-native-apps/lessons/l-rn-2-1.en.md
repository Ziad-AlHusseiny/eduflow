---
summary: Style Trailhead with StyleSheet, style arrays and design tokens, using unitless points and longhand properties in a system with no cascade, selectors or media queries.
takeaways:
  - Styles are JavaScript objects with camelCase keys and unitless numbers measured in density-independent points.
  - CSS shorthands with several values, such as `margin '8px 16px'`, don't exist; use `marginVertical` and `marginHorizontal`.
  - In a style array later entries win and falsy entries are skipped, which makes conditional styles a one-liner.
  - Reuse happens through components and a tokens object, not through selectors or a global stylesheet.
  - Accept a `style` prop and append it last so callers can adjust a component without forking it.
further:
  - title: Style
    url: https://reactnative.dev/docs/style
  - title: StyleSheet
    url: https://reactnative.dev/docs/stylesheet
  - title: useColorScheme
    url: https://reactnative.dev/docs/usecolorscheme
quiz:
  - q: "What renders for `style={[styles.card, isFavorite && styles.favorite, { padding: 8 }]}` when `isFavorite` is `false` and both styles set `padding`?"
    options:
      - text: The app throws, because `false` isn't a valid style.
        why: Falsy entries in a style array are skipped on purpose; that's what makes the `&&` pattern safe here.
      - text: "`styles.card`'s padding, because the first entry has priority."
        why: Priority goes the other way. Later entries override earlier ones, like `Object.assign`.
      - text: "`styles.favorite`'s padding, because named styles beat inline objects."
        why: There is no specificity in React Native. Order is the only rule, and `favorite` was skipped anyway.
      - text: A padding of 8, because the last entry in the array wins.
        why: Correct. `false` is ignored, and the inline object comes last, so its `padding` overrides the card's.
    answer: 3
  - q: Which style object is valid React Native?
    options:
      - text: "`{ margin: '8px 16px', fontSize: '16px' }`"
        why: Multi-value shorthands and px strings are CSS syntax. React Native wants one number per property.
      - text: "`{ marginVertical: 8, marginHorizontal: 16, fontSize: 16 }`"
        why: Correct. Longhand keys with unitless numbers, measured in points.
      - text: "`{ 'margin-vertical': 8, 'font-size': 16 }`"
        why: Keys are camelCase JavaScript property names, not kebab-case CSS names.
    answer: 1
  - q: Trailhead needs every card to use the same corner radius and spacing. What's the idiomatic approach?
    options:
      - text: A `theme.ts` file exporting tokens (colors, spacing, radius) that components import into their StyleSheets.
        why: Correct. Tokens give you one source of truth without needing a cascade, and they're easy to swap for dark mode.
      - text: A global stylesheet loaded in the root layout that targets every `View`.
        why: React Native has no selectors, so there's nothing that can target "every View".
      - text: Copying the numbers into each component and keeping them in sync by search and replace.
        why: It works until the designer changes the radius from 12 to 14 across forty files.
    answer: 0
---

The first time you style a React Native screen, you reach for things that aren't there: a class name, a `:hover`, a media query, `font-family` on `body` so everything inherits it. React Native has none of them. What it has instead is smaller and more predictable: plain objects, applied directly to the component that needs them, in an order you control.

## Style objects and StyleSheet.create

A style is a JavaScript object with camelCase keys. You can pass it inline, but most code collects styles with `StyleSheet.create`, which gives you autocompletion, type checking and a single place to read a component's styles:

```tsx title=src/components/HikeCard.tsx
import { StyleSheet, Text, View } from 'react-native';

export function HikeCard({ name, distanceKm }: { name: string; distanceKm: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.meta}>{distanceKm} km</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8e4',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#1d2a22' },
  meta: { fontSize: 14, color: '#5c6b62', marginTop: 4 },
});
```

Defining `styles` below the component is a convention, and a good one: the JSX comes first when you open the file.

Is `StyleSheet.create` faster than inline objects? Not in any way you'll measure today. The real costs of inline objects are readability and new object identities on every render, which matter only when you pass styles into memoized children. A sensible default: static styles go in `StyleSheet.create`, and the few values that depend on props or state go inline or in the style array next to them.

## Numbers without units

`borderRadius: 12` means 12 **density-independent points**, not physical pixels. A 12-point corner looks the same size on a cheap Android phone and on an iPhone with three times the pixel density; the platform multiplies for you. Percentages work as strings (`width: '50%'`), and that's it: no `px`, `rem`, `em` or `vh`.

Shorthands that take several values don't exist either. Instead of `margin: '8px 16px'` you write `marginVertical: 8, marginHorizontal: 16`. The same pattern covers padding (`paddingTop`, `paddingHorizontal`), borders (`borderTopWidth`, `borderBottomColor`) and corners (`borderTopLeftRadius`). Single-value shorthands like `margin: 8` and `borderRadius: 12` work as you'd expect.

Modern React Native also supports several properties web developers miss: `gap`, `rowGap` and `columnGap` for spacing children, `boxShadow` with a CSS-like string, and `filter`. Older tutorials use separate `shadowColor`/`shadowOffset` props for iOS and `elevation` for Android, which you'll still see in existing codebases.

:::mistake Writing CSS strings
`fontSize: '16px'` or `margin: '8 16'` either throws a red-screen error or is silently ignored, depending on the property. If a style seems to do nothing, check for a unit or a multi-value string first. TypeScript catches most of these at the moment you type them, which is one more reason to keep it on.
:::

## Style arrays: order is the only rule

The `style` prop accepts an array. React Native merges it left to right, later keys win, and falsy entries (`false`, `null`, `undefined`) are skipped. That turns conditional styling into one line:

```tsx
<View style={[styles.card, isFavorite && styles.favorite, isSelected && styles.selected]} />
```

There's no specificity to reason about, no `!important`, and no style arriving from a parent three files away. If a card looks wrong, the reason is in that array.

Use the same rule to make your own components adjustable. Accept a `style` prop and put it last:

```tsx
import type { StyleProp, ViewStyle } from 'react-native';

type Props = { name: string; distanceKm: number; style?: StyleProp<ViewStyle> };

export function HikeCard({ name, distanceKm, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {/* …title and meta as before */}
    </View>
  );
}

// A caller nudges one instance without forking the component:
<HikeCard name="Ridge Loop" distanceKm={8.4} style={{ marginBottom: 24 }} />
```

`StyleProp<ViewStyle>` is the type that accepts an object, an array, or a falsy value, exactly like the built-in components.

## Tokens instead of a cascade

Without inheritance, consistency comes from two places: components (one `HikeCard`, one `PrimaryButton`, one `AppText`) and a small **tokens** file they all import.

```ts title=src/theme.ts
export const colors = {
  bg: '#f6f8f6',
  surface: '#ffffff',
  text: '#1d2a22',
  textMuted: '#5c6b62',
  primary: '#2f6f4e',
  border: '#e2e8e4',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 20 };
```

Now the card reads `borderRadius: radius.md` and `paddingHorizontal: space.lg`, and a designer's change lands in one file.

:::tip Dark mode with the same tokens
`useColorScheme()` from `react-native` returns `'dark'` when the phone is in dark mode. Keep two token objects, pick one at the top of your tree, and hand it down through context; components never hard-code a color. You'll build that context in section 3.
:::

## Why no cascade is a feature

On a large web app, the hardest styling bugs come from rules you didn't write reaching elements you didn't expect. React Native removes that whole category. A component's look is its own style plus whatever its caller passes in, and nothing else. It's more typing at first, and much less debugging later. Teams that want class-like ergonomics add a library such as NativeWind (Tailwind classes compiled to style objects), but underneath it's still these same objects.

Next you'll lay those styled boxes out with flexbox, where React Native's defaults differ from the web in ways that explain most "why is this squashed?" moments.
