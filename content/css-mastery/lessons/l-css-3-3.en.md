---
summary: "Define colors in oklch() so lightness is predictable, derive tints with color-mix(), and build hover and disabled states from one base color with relative color syntax."
takeaways:
  - "`oklch(L C H)` separates perceived lightness, chroma (colorfulness) and hue, so two colors with the same L look equally light, which HSL can't promise."
  - "A palette with fixed lightness and chroma and varying hue gives every category the same visual weight and similar contrast."
  - "`color-mix(in oklch, var(--track) 15%, white)` makes a tint from any base color, and the color space you mix in changes the result."
  - "Relative color syntax, such as `oklch(from var(--track) calc(l - 0.15) c h)`, derives a state color by editing one channel of the base color."
further:
  - title: "oklch() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch
  - title: "color-mix() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix
  - title: "Using relative colors (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Using_relative_colors
quiz:
  - q: "`hsl(60 100% 50%)` and `hsl(240 100% 50%)` have the same lightness value. Why does white text read well on one and badly on the other?"
    options:
      - text: "Because HSL lightness isn't perceptual; pure yellow looks far lighter than pure blue at the same L."
        why: "Correct. HSL is a geometric reshuffle of RGB. OKLCH's L is designed to match perceived lightness, so equal L means similar contrast."
      - text: "Because the browser renders yellow with extra brightness on most screens."
        why: "Screens render both as specified; the difference is in human perception, which HSL doesn't model."
      - text: "Because 50% lightness is outside the sRGB gamut for blue."
        why: "`hsl()` colors are always inside sRGB; gamut isn't the issue here."
    answer: 0
  - q: "What does `color-mix(in oklch, var(--track) 20%, white)` produce when `--track` is a saturated pink?"
    options:
      - text: "Pink at 20% opacity over whatever is behind it."
        why: "Mixing with white produces an opaque color. Transparency would come from mixing with `transparent`."
      - text: "A darker pink, because 20% is a small amount of white."
        why: "The 20% applies to the pink; white gets the remaining 80%, so the result is much lighter."
      - text: "A pale pink tint, 20% pink and 80% white, interpolated in OKLCH."
        why: "Correct. Percentages apply to the color they follow, and the other color gets the rest."
      - text: "An error, because custom properties can't be used inside color-mix()."
        why: "`var()` works inside `color-mix()` like anywhere else; it's substituted before the function is evaluated."
    answer: 2
  - q: "Which declaration gives a hover state 0.1 darker than `--track` but with the same chroma and hue, whatever `--track` is?"
    options:
      - text: "`filter: brightness(0.9)`"
        why: "`filter` darkens the whole element, including text and images, and works in RGB space, so hue can shift."
      - text: "`background: oklch(from var(--track) calc(l - 0.1) c h)`"
        why: "Correct. Relative color syntax unpacks the base color into `l`, `c` and `h`, lets you adjust one channel, and repacks it."
      - text: "`background: oklch(calc(var(--track) - 0.1))`"
        why: "You can't subtract from a whole color; without `from`, `oklch()` expects three separate channel values."
    answer: 1
  - q: "Your track colors are written as `oklch(62% 0.25 150)`, and on an older sRGB laptop the green looks slightly different from the designer's P3 monitor. What happened?"
    options:
      - text: "The browser rejected the color and used the fallback."
        why: "The color is valid. Out-of-gamut colors aren't rejected; they're mapped into what the screen can show."
      - text: "OKLCH is not supported on that laptop."
        why: "Support depends on the browser, not the screen, and every current browser supports `oklch()`."
      - text: "The P3 monitor is miscalibrated."
        why: "The difference is expected: the chroma is beyond what sRGB screens can display."
      - text: "The color is outside the sRGB gamut, so the browser mapped it to the closest color the screen can display."
        why: "Correct. `oklch()` can describe colors more vivid than sRGB. Wide-gamut screens show them; others get the nearest displayable color."
    answer: 3
---

Waypoint's four track colors were picked one at a time in a design tool, as hex codes. The Design pink looked loud, the Accessibility green looked washed out, and the white badge text passed contrast on two tracks and failed on the other two. When the team needed a pale tint for each track's badge background, someone generated eight more hex codes by eye. Then the hover states. Twenty colors, no system, and nobody could say why `#0891b2` was right.

Modern CSS color lets you define one base color per track and derive everything else with rules.

## Why oklch()

Hex, `rgb()` and `hsl()` all describe colors in the sRGB space, organised around how screens emit light, not how eyes see it. HSL's "lightness" is the worst offender: `hsl(60 100% 50%)` (yellow) and `hsl(240 100% 50%)` (blue) claim the same lightness, but the yellow is dazzling and the blue is dark. Any palette built by rotating the hue in HSL ends up with wildly different contrast.

`oklch()` is built on the OKLab model, designed so that numbers track perception:

- **L**, lightness, from 0 (black) to 1 or 100% (white), and equal L looks equally light across hues.
- **C**, chroma, from 0 (grey) up to roughly 0.37 for the most vivid colors screens can show.
- **H**, hue angle in degrees: around 30 is red, 140 green, 250 blue, 350 pink.

```css title=tokens.css
:root {
  --track-design: oklch(62% 0.19 350);
  --track-perf:   oklch(62% 0.19 220);
  --track-a11y:   oklch(62% 0.19 150);
  --track-platform: oklch(62% 0.19 280);
}
```

Same lightness, same chroma, four hues. The tracks now carry equal visual weight, and if white text passes contrast on one, it will be very close on all four. You still verify contrast (perception models aren't contrast formulas), but you start close instead of guessing.

:::note Wide gamut for free
OKLCH can describe colors outside sRGB, such as the vivid greens a P3 display can show. If a screen can't display a color, the browser maps it to the nearest color it can. That's why a high chroma like 0.25 can look a little different between a new phone and an old monitor. `oklch()` has been Baseline since 2023 and widely available since late 2025.
:::

## Tints and shades with color-mix()

`color-mix()` blends two colors in a color space you choose:

```css
.badge {
  background: color-mix(in oklch, var(--track) 15%, white);
  color: color-mix(in oklch, var(--track) 70%, black);
}
.session-card.is-cancelled {
  background: color-mix(in oklch, var(--track), transparent 85%);
}
```

The percentage belongs to the color it follows; the other color gets the rest. So `var(--track) 15%, white` is mostly white with a hint of the track: a badge background. Mixing with `transparent` produces a translucent version, without needing a separate alpha token.

The color space changes the result. Mixing blue and yellow `in srgb` passes through a muddy grey; `in oklch` the hue travels around the wheel and stays vivid. For UI tints, `oklch` or `oklab` gives the most even steps. `color-mix()` is Baseline 2023.

:::mistake Darkening with mix-in black for hover states
`color-mix(in srgb, var(--track), black 20%)` looks fine on pink, but sRGB isn't perceptually even: the same 20% darkens some hues far more than others and dulls their chroma, so your four hover states no longer match. When you want "the same color, a bit darker" by a predictable amount, change only the lightness, which is what relative colors are for.
:::

## Relative colors: edit one channel

Relative color syntax unpacks a base color into its channels, lets you change any of them, and packs it back:

```css
.session-card {
  --track: var(--track-design);
  border-inline-start: 6px solid var(--track);

  &:hover,
  &.is-active {
    border-color: oklch(from var(--track) calc(l - 0.15) c h);
  }

  &.is-past {
    border-color: oklch(from var(--track) l 0.03 h);   /* nearly grey, same hue */
  }

  & .badge-soft {
    background: oklch(from var(--track) l c h / 20%);  /* same color, 20% alpha */
  }
}
```

After `from var(--track)`, the keywords `l`, `c` and `h` hold the base color's channels as numbers, and you can use them in `calc()`. Note that `l` here is the 0 to 1 number, so subtracting 0.15 darkens by 15 points. Every derived state now follows the base color automatically: add a fifth track and its hover, past and soft variants exist the moment you define its base.

Relative colors are Baseline 2024, in Chrome, Edge, Firefox and Safari. If you must support older browsers, don't count on a static fallback declaration written first: these values contain `var()`, so an older browser accepts them at parse time and then hits the invalid-at-computed-value-time trap from [Custom Properties and @property](lesson:l-css-1-4), discarding your fallback too. Wrap the derived states in `@supports (color: oklch(from red l c h)) { … }` instead, so older browsers keep the base rule.

:::tip Read colors in DevTools as you go
Chrome and Firefox show a swatch next to every color, and clicking it opens a picker that can display and convert OKLCH. When a derived color looks wrong, the computed value tells you exactly what `l`, `c` and `h` came out as.
:::

## Your turn

The exercise card has hard-coded hex values for its badge tint and active border. Replace them with a `color-mix()` tint and a relative-color active state, and add a Performance track that matches the Design track's lightness and chroma. The checks read the computed OKLCH channels. Next, you'll take this palette into dark mode with `color-scheme` and `light-dark()`.
