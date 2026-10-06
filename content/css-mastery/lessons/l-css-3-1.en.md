---
summary: "Build fluid type and spacing with clamp(), calculate the slope and intercept from two design sizes, and keep text resizable for users who change their font size."
takeaways:
  - "A fluid value is a straight line between two points: `clamp(MIN, intercept + slope × width, MAX)`, where the slope is the size change divided by the width change."
  - "Put `rem` in the intercept and the limits so text still responds to the user's default font size and to zoom; viewport-only sizes don't."
  - "Use `vw` for page-level type such as the hero heading, and `cqi` for type inside components that live in containers of different widths."
  - "Fluid spacing tokens such as `--space-m` keep padding and gaps proportional to type without a breakpoint for each."
further:
  - title: "clamp() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp
  - title: "Typography (web.dev Learn CSS)"
    url: https://web.dev/learn/css/typography
  - title: "Understanding Success Criterion 1.4.4: Resize Text (W3C)"
    url: https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
quiz:
  - q: "A heading should be 24px when its container is 400px wide and 40px at 1200px, growing linearly in between. Which preferred value does that?"
    options:
      - text: "`16px + 2cqi`"
        why: "Correct. The slope is (40 − 24) / (1200 − 400) = 0.02, so 2cqi; the intercept is 24 − 0.02 × 400 = 16px."
      - text: "`3cqi`"
        why: "3cqi is 12px at 400px and 36px at 1200px; with no intercept the line passes through zero, so it can't hit both targets."
      - text: "`24px + 2cqi`"
        why: "That's 32px at 400px. The intercept is the value where the width is zero, not the size at the smallest width."
      - text: "`2px + 2cqi`"
        why: "The slope is right, but 2px + 8px is only 10px at 400px; the intercept must make the line pass through 24px there."
    answer: 0
  - q: "Why is `font-size: 4vw` on body text an accessibility problem?"
    options:
      - text: "Screen readers can't read text sized in viewport units."
        why: "Screen readers ignore font size entirely; the problem is visual."
      - text: "Text sized only in `vw` ignores the user's default font size, so people who set larger text in their browser don't get it."
        why: "Correct. `vw` doesn't involve `rem` at all; mixing in a `rem` term (and `rem` limits) keeps the user's preference in the calculation."
      - text: "vw units are not supported on mobile browsers."
        why: "Viewport units are supported everywhere; the issue is that they don't respond to font-size preferences."
    answer: 1
  - q: "A session card appears in a 280px sidebar and a 700px main column on the same page. Which unit should its fluid title use?"
    options:
      - text: "`vw`, because it's the standard unit for fluid type."
        why: "The viewport is the same for both cards, so `vw` gives both titles the same size despite very different slots."
      - text: "`em`, because it scales with the parent font size."
        why: "`em` responds to font size, not to available width, so it can't make the title fluid."
      - text: "`cqi`, inside a clamp() with rem limits."
        why: "Correct. `cqi` measures the card's container, so each card scales to its own slot, and the rem limits keep the result readable and user-adjustable."
    answer: 2
---

Waypoint's hero heading, "Two days of front-end, in Lisbon", is 48px on the design for a laptop and 28px on the design for a phone. The first implementation had three media queries and the heading jumped between three sizes as you resized. Nobody resizes a window for fun, but they do rotate tablets, split screens and open the page in narrow side panels, and every jump in between looked accidental.

Fluid type replaces the jumps with a straight line between the two designs.

## A fluid value is a line

You have two points from the design: at a 20rem (320px) viewport the heading is 1.75rem; at 60rem (960px) it's 3rem. Between them you want it to grow in proportion; outside them, it should stop. That's `clamp()` with a linear preferred value:

```css title=type.css
.hero h1 {
  font-size: clamp(1.75rem, 1.125rem + 3.125vw, 3rem);
}
```

The middle value is a straight line, `intercept + slope × width`. The **slope** is how much the size changes per unit of width: (3 − 1.75) ÷ (60 − 20) = 0.03125, which as a viewport unit is 3.125vw. The **intercept** is where that line crosses zero width: 1.75 − 0.03125 × 20 = 1.125rem. The calculation is easy to get wrong by hand, so here it is as a function you can run:

```js run
function fluid(minSize, maxSize, minWidth, maxWidth, unit = 'vw') {
  // sizes and widths in rem
  const slope = (maxSize - minSize) / (maxWidth - minWidth);
  const intercept = minSize - slope * minWidth;
  const round = (n) => Math.round(n * 1000) / 1000;
  return `clamp(${minSize}rem, ${round(intercept)}rem + ${round(slope * 100)}${unit}, ${maxSize}rem)`;
}

console.log(fluid(1.75, 3, 20, 60));          // hero heading
console.log(fluid(1, 1.75, 20, 50, 'cqi'));   // card title, container-based
```

Try other pairs. Two design sizes in, one `clamp()` out.

## Why the rem matters

You could write `font-size: 5vw` and call it fluid. Don't. Viewport units know nothing about the user's font preferences: someone who sets their browser's default text size to 20px gets exactly the same 5vw as everyone else. WCAG's Resize Text criterion asks that text can scale to 200% without loss of content, and type that ignores the user's settings fails people who need it most.

Including a `rem` term keeps the user in the equation. With `1.125rem + 3.125vw`, the rem part grows when the user raises their default size, and the `rem` limits move with it.

:::mistake Fluid type with pixel limits
`clamp(18px, 1rem + 1vw, 28px)` looks responsible, but the px limits ignore user preferences at both ends. A user with a 24px default is clamped back down to 28px maximum as if they never asked. Write limits in `rem`. And test it: set your browser's default font size to 20px and zoom to 200%, and make sure the text still grows.
:::

There's a mathematical edge to watch: if the ratio between MAX and MIN is large and the slope is steep, zooming can shrink the effective range so much that 200% zoom doesn't produce 200% text. Keep the max no more than about 2.5 times the min for body copy and headings, and you're safe.

## Viewport or container?

`vw` is right for type tied to the page: the hero heading, the page title. For type inside a component, use container units. A session card's title in the 280px sidebar and in the 640px main column should differ, and `vw` can't tell them apart. With the slot as a size container (from the previous lesson), the same formula works with `cqi`:

```css
.slot { container-type: inline-size; }

.session-card h3 {
  font-size: clamp(1rem, 0.5rem + 2.5cqi, 1.75rem);
}
```

## Fluid space

Type that scales while padding stays fixed looks wrong at both ends: cramped on big screens, airy on small ones. Define a few spacing tokens with the same technique and use them everywhere:

```css title=tokens.css
:root {
  --space-s: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-m: clamp(1rem, 0.75rem + 1.25vw, 1.5rem);
  --space-l: clamp(1.5rem, 1rem + 2.5vw, 3rem);
}

.session-card { padding: var(--space-m); }
.schedule     { gap: var(--space-l); }
```

Three or four steps are enough. More than that and nobody remembers which to use.

:::tip Two finishing touches for headings
`text-wrap: balance` evens out the line lengths of short multi-line text, so a two-line heading doesn't end with one orphaned word. It's Baseline 2024. Use a unitless `line-height` (like `1.15` for headings, `1.5` for body) so it scales with whatever font size `clamp()` resolves to.
:::

## Your turn

The exercise's card title uses `5cqi`, which grows without limits and ignores the user's font size. Replace it with a clamp() that hits 16px in a 320px slot and 28px in an 800px slot, with rem limits. The checks change the slot width and even the root font size. Next, you'll make the same page work in Arabic, right to left, with logical properties.
