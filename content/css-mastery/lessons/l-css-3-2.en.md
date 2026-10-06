---
summary: "Replace physical properties with logical ones so the schedule page works in right-to-left languages like Arabic, and handle the few things that don't flip on their own."
takeaways:
  - "Logical properties describe layout relative to the text direction: `margin-inline-start` is the left margin in English and the right margin in Arabic."
  - "Setting `dir=\"rtl\"` on the root mirrors flexbox, grid and logical properties automatically; physical properties like `padding-left` stay where they are."
  - "Transforms, background positions, shadows and directional icons don't flip, so handle them explicitly with `:dir(rtl)`."
  - "Never add `letter-spacing` to Arabic text; it breaks the joins between letters."
further:
  - title: "Basic concepts of logical properties and values (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values/Basic_concepts
  - title: "Logical properties (web.dev Learn CSS)"
    url: https://web.dev/learn/css/logical-properties
  - title: "Structural markup and right-to-left text in HTML (W3C)"
    url: https://www.w3.org/International/questions/qa-html-dir
quiz:
  - q: "A card has `padding-left: 20px; border-left: 6px solid`. You set `dir=\"rtl\"` on `<html>`. Where are the padding and border now?"
    options:
      - text: "On the right, because the browser mirrors the whole layout."
        why: "The browser mirrors direction-aware layout (flex, grid, logical properties), but `left` always means the physical left."
      - text: "Still on the left, which is now the end of each line."
        why: "Correct. Physical properties ignore direction. Use `padding-inline-start` and `border-inline-start` to follow the text."
      - text: "Removed, because physical properties are ignored in RTL."
        why: "They still apply; they just apply to the physical side you named."
    answer: 1
  - q: "In a flex row with `justify-content: flex-start` inside a `dir=\"rtl\"` page, where do the items start?"
    options:
      - text: "On the left, because flex-start is the left edge."
        why: "Flexbox's start follows the inline direction, so in RTL the start is the right edge."
      - text: "In the center, because flexbox can't decide."
        why: "Flexbox always resolves start and end from the writing direction; it never falls back to centering."
      - text: "It depends on whether `flex-direction: row-reverse` is set."
        why: "row-reverse would swap them again, but with the default `row` the answer is already determined."
      - text: "On the right, because flex-start follows the inline direction."
        why: "Correct. Flexbox and grid are direction-aware out of the box; that's why most of a flex layout mirrors for free."
    answer: 3
  - q: "A \"Details →\" link has an arrow icon that should point the other way in Arabic. Which rule does it?"
    options:
      - text: "`.arrow:dir(rtl) { scale: -1 1; }`"
        why: "Correct. `:dir(rtl)` matches elements whose computed direction is RTL, and a negative horizontal scale mirrors the icon."
      - text: "`.arrow { margin-inline-start: 4px; }`"
        why: "That moves the spacing to the correct side, which is good, but doesn't change which way the arrow points."
      - text: "`.arrow { direction: rtl; }`"
        why: "`direction` changes text and layout direction, not how a glyph or icon is drawn."
    answer: 0
  - q: "Which declaration sets a session card's width in a way that also works for vertical writing modes?"
    options:
      - text: "`width: 20rem`"
        why: "`width` is always horizontal; in a vertical writing mode the inline axis runs top to bottom."
      - text: "`block-size: 20rem`"
        why: "Block size is the height in horizontal writing, the dimension across lines, not along them."
      - text: "`inline-size: 20rem`"
        why: "Correct. `inline-size` is the size along the direction text runs, so it's the width in English and Arabic and the height in vertical text."
    answer: 2
---

Waypoint is adding an Arabic edition of the schedule for its Cairo satellite event. The HTML change is one attribute, `<html lang="ar" dir="rtl">`, and the first load was half right. The session list mirrored correctly, because it's a flex row. But every card had its colored border on the *left*, which in Arabic is the end of the line, the time column had its spacing on the wrong side, and the "Details →" arrow pointed backwards.

The layout was written in physical directions: left, right, top, bottom. Text doesn't flow in physical directions; it flows from a start to an end.

## Inline and block axes

Logical properties name sides by the flow of text:

- The **inline** axis is the direction text runs within a line. In English it's left to right; in Arabic, right to left.
- The **block** axis is the direction lines stack: top to bottom in both.

:::figure The same card in LTR and RTL: inline-start flips sides, block-start stays on top
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Two cards. In the left-to-right card, inline-start is on the left and inline-end on the right. In the right-to-left card, inline-start is on the right and inline-end on the left. In both, block-start is at the top and block-end at the bottom.</title>
  <text class="d-label-strong" x="40" y="24">dir="ltr"</text>
  <rect class="d-box" x="40" y="40" width="260" height="140" rx="10"/>
  <rect class="d-box-primary" x="40" y="40" width="10" height="140"/>
  <text class="d-code" x="60" y="116">inline-start</text>
  <text class="d-code" x="196" y="116">inline-end</text>
  <text class="d-label-muted" x="128" y="62">block-start</text>
  <text class="d-label-muted" x="132" y="172">block-end</text>
  <text class="d-label-strong" x="380" y="24">dir="rtl"</text>
  <rect class="d-box" x="380" y="40" width="260" height="140" rx="10"/>
  <rect class="d-box-primary" x="630" y="40" width="10" height="140"/>
  <text class="d-code" x="392" y="116">inline-end</text>
  <text class="d-code" x="522" y="116">inline-start</text>
  <text class="d-label-muted" x="468" y="62">block-start</text>
  <text class="d-label-muted" x="472" y="172">block-end</text>
  <text class="d-label-muted" x="40" y="214">border-inline-start sits at the start of the line in both</text>
</svg>
:::

Every physical property has a logical twin:

| Physical | Logical |
|---|---|
| `margin-left`, `margin-right` | `margin-inline-start`, `margin-inline-end` |
| `padding-top`, `padding-bottom` | `padding-block-start`, `padding-block-end` |
| `border-left` | `border-inline-start` |
| `left`, `right`, `top` | `inset-inline-start`, `inset-inline-end`, `inset-block-start` |
| `width`, `height` | `inline-size`, `block-size` |
| `text-align: left` | `text-align: start` |

There are shorthands too: `margin-inline: 1rem 2rem` sets start and end, `padding-block: 1rem` sets both block sides, and `inset-inline: 0` replaces `left: 0; right: 0`.

## Converting the session card

```css title=session-card.css
/* Before: physical */
.session-card {
  border-left: 6px solid var(--track-color);
  padding: 12px 8px 12px 20px;
  text-align: left;
}
.session-card .time { margin-right: 12px; }

/* After: logical */
.session-card {
  border-inline-start: 6px solid var(--track-color);
  padding-block: 12px;
  padding-inline: 20px 8px;
  text-align: start;
}
.session-card .time { margin-inline-end: 12px; }
```

In English the result is pixel-identical. In Arabic, the border moves to the right, where lines start, and the spacing follows. You write the card once.

Flexbox and grid already think this way. `flex-direction: row`, `justify-content: flex-start` and grid column 1 all follow the inline direction, so a flex row mirrors in RTL without any extra CSS. That's why Waypoint's list worked on the first try.

:::mistake Converting margins but not positions
Teams convert `margin` and `padding` and forget absolutely positioned elements. A "Live now" badge at `right: 8px` stays on the right in Arabic, on top of the title text. Search the codebase for `left:` and `right:` too, and replace them with `inset-inline-start` and `inset-inline-end`.
:::

## Sizes are logical too

`inline-size` and `block-size` are the logical names for width and height, and `max-inline-size: 40ch` is the logical version of the readable-width cap from the intrinsic sizing lesson. In Arabic and English they behave exactly like `width` and `height`, because both scripts write horizontally. They only differ in vertical writing modes, such as `writing-mode: vertical-rl` for Japanese or a rotated table header, where the inline axis runs top to bottom. Using them costs nothing today and means a component survives a writing-mode change later. A sensible team rule is: logical properties for everything that relates to text flow, physical ones only for things that are physical by nature, like a shadow that should always fall downward.

## What doesn't flip by itself

A few things are physical by nature and need an explicit RTL rule:

- **Transforms**: `translateX(8px)` always moves right.
- **Directional icons**: arrows, "next" chevrons, a progress indicator's direction.
- **Background positions and shadows**: `box-shadow: 4px 0 …` always throws its shadow to the right.

The `:dir()` pseudo-class matches the element's computed direction, inherited from the nearest `dir` attribute:

```css
.more .arrow {
  display: inline-block;
  margin-inline-start: 4px;
}
.more .arrow:dir(rtl) {
  scale: -1 1;   /* mirror horizontally */
}
```

`:dir(rtl)` is better than `[dir="rtl"] .arrow` because it doesn't care where the attribute lives or whether a nested element switches back to LTR. It has been Baseline since December 2023 and widely available since mid-2026.

Not every icon should flip. A play button, a clock, or a checkmark means the same in both directions; a "back" arrow or a slider's direction doesn't. Ask a native reader when you're unsure.

## Arabic typography in two rules

First, **never apply `letter-spacing` to Arabic**. Arabic letters join to their neighbours; spacing them apart breaks the joins and makes words hard to read. If your design system adds tracking to uppercase labels, reset it with `:lang(ar) { letter-spacing: 0; }`. Second, Arabic often needs a slightly larger font size and line height than Latin text at the same visual weight. Set those per language with `:lang(ar)` rather than per component.

:::tip Mixed-direction content
User-generated content (a speaker's bio, a session title typed in English on the Arabic page) can be in either direction. `dir="auto"` on the element lets the browser pick the direction from the first strong character, and `<bdi>` isolates a name inside a sentence so punctuation doesn't jump to the wrong side.
:::

## Your turn

The exercise card is written with physical properties. Convert it to logical ones and flip the arrow in RTL. The checks render it in both directions. Next, you'll replace the card's hex colors with `oklch()` and build track palettes with `color-mix()`.
