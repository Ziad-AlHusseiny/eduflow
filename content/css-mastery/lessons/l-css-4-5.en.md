---
summary: "Know which CSS changes trigger layout, paint or only compositing, animate the cheap properties, and use content-visibility and aspect-ratio to keep long pages fast and stable."
takeaways:
  - "Every visual change goes through some of style, layout, paint and composite; geometry properties trigger layout, visual properties trigger paint, and `transform` and `opacity` can skip both."
  - "Animate `translate`, `scale`, `rotate` and `opacity`; animating `left`, `width` or `margin` re-runs layout on every frame."
  - "`content-visibility: auto` with `contain-intrinsic-size` lets the browser skip rendering off-screen sections of a long page."
  - "Reserving space with `aspect-ratio` (or width and height attributes) prevents layout shifts when images and embeds load."
  - "Measure before optimising, with the DevTools Performance panel and paint flashing, and remove `will-change` once an animation ends."
further:
  - title: "Rendering performance (web.dev)"
    url: https://web.dev/articles/rendering-performance
  - title: "content-visibility (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility
  - title: "Optimize Cumulative Layout Shift (web.dev)"
    url: https://web.dev/articles/optimize-cls
quiz:
  - q: "A toast slides in by animating `left` from `-320px` to `16px`. On a mid-range phone it stutters. What's the best fix?"
    options:
      - text: "Add `will-change: left` to the toast."
        why: "`will-change` can't make `left` cheap; changing it still re-runs layout every frame."
      - text: "Animate `translate` from `-336px 0` to `0 0` instead, keeping `left` fixed."
        why: "Correct. `translate` changes only how the already-painted toast is composited, so the browser can skip layout and paint during the animation."
      - text: "Shorten the animation to 50ms so there are fewer frames."
        why: "The stutter comes from per-frame layout work; a 50ms slide is also too fast for people to follow."
      - text: "Use a JavaScript animation library instead of CSS."
        why: "A JS library animating `left` hits the same layout cost, and runs on the busy main thread too."
    answer: 1
  - q: "Which property change usually causes a repaint but no layout?"
    options:
      - text: "`padding`"
        why: "Padding changes an element's box size, so layout runs (and then paint)."
      - text: "`font-size`"
        why: "Font size changes text metrics and line breaks, which is a layout change."
      - text: "`background-color`"
        why: "Correct. The geometry doesn't change, so layout is skipped, but the pixels must be repainted."
    answer: 2
  - q: "The schedule has 60 session cards across two days, and the initial render is slow. You add `content-visibility: auto` to each day section. What else should you add?"
    options:
      - text: "`contain-intrinsic-size: auto 1200px`, so skipped sections keep an estimated height and the scrollbar doesn't jump."
        why: "Correct. Skipped content has no size of its own; the intrinsic size placeholder (remembered once rendered, thanks to `auto`) keeps scrolling stable."
      - text: "`will-change: contents` on every card."
        why: "That asks the browser to prepare every card for change, which costs memory and undoes the saving."
      - text: "Nothing; content-visibility handles sizing automatically."
        why: "Without a size estimate, skipped sections collapse to zero height, so the page and scrollbar jump as you scroll."
    answer: 0
---

Waypoint's schedule looked finished, and then the team opened it on a three-year-old Android phone at the venue's busy Wi-Fi. The save toast stuttered, the first scroll felt sticky, and speaker photos pushed the text down as they loaded. Nothing was broken; it was just doing more work than it needed to.

CSS performance comes down to one question: *how much of the rendering pipeline does this change force the browser to run?*

## The rendering pipeline

After your CSS changes something, the browser runs up to four stages to update the screen:

1. **Style**: work out which rules apply and compute each element's values.
2. **Layout**: calculate every box's size and position.
3. **Paint**: fill in the pixels: text, colors, borders, shadows, images.
4. **Composite**: assemble the painted layers on the GPU, applying transforms and opacity.

The trick is that each change only needs to start at a certain stage. Change `width` and layout must run, then paint, then compositing. Change `background-color` and layout can be skipped. Change `transform` or `opacity` on an element that has its own layer, and the browser can skip layout *and* paint, moving existing pixels around on the GPU.

:::figure Which stages a property change triggers
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Four pipeline stages left to right: style, layout, paint, composite. A row for width, top and margin runs through all four. A row for color, background and box-shadow skips layout. A row for transform and opacity skips layout and paint.</title>
  <rect class="d-box" x="170" y="16" width="110" height="36" rx="8"/>
  <text class="d-label-strong" x="196" y="40">Style</text>
  <rect class="d-box" x="295" y="16" width="110" height="36" rx="8"/>
  <text class="d-label-strong" x="319" y="40">Layout</text>
  <rect class="d-box" x="420" y="16" width="110" height="36" rx="8"/>
  <text class="d-label-strong" x="451" y="40">Paint</text>
  <rect class="d-box" x="545" y="16" width="120" height="36" rx="8"/>
  <text class="d-label-strong" x="557" y="40">Composite</text>
  <text class="d-code" x="10" y="94">width, top</text>
  <rect class="d-box-warn" x="170" y="76" width="495" height="28" rx="6"/>
  <text class="d-label" x="180" y="95">all four stages, every frame</text>
  <text class="d-code" x="10" y="144">box-shadow</text>
  <rect class="d-box-accent" x="170" y="126" width="110" height="28" rx="6"/>
  <rect class="d-box-accent" x="420" y="126" width="245" height="28" rx="6"/>
  <text class="d-label-muted" x="303" y="145">skipped</text>
  <text class="d-code" x="10" y="194">translate</text>
  <rect class="d-box-success" x="170" y="176" width="110" height="28" rx="6"/>
  <rect class="d-box-success" x="545" y="176" width="120" height="28" rx="6"/>
  <text class="d-label-muted" x="370" y="195">skipped</text>
</svg>
:::

For a single click, the difference doesn't matter. For an animation running 60 times a second, or a style change that touches 500 elements, it decides whether the page feels smooth.

## Animate the cheap properties

The save toast was animated like this:

```css
@keyframes toast-in {
  from { left: -320px; }
  to   { left: 16px; }
}
```

`left` is a geometry property: every frame re-runs layout for the toast (and checks whether anything else moved), then repaints. The fix keeps the toast's position fixed and moves its picture instead:

```css
.toast {
  position: fixed;
  left: 16px;
  bottom: 16px;
  animation: toast-in 250ms ease-out;
}

@keyframes toast-in {
  from { translate: -336px 0; opacity: 0; }
  to   { translate: 0 0;      opacity: 1; }
}
```

Same visual result, a fraction of the work. This is why every animation in this course used `translate`, `scale`, `opacity` and friends. The same reasoning applies to transitions: a hover that changes `box-shadow` repaints on each frame, which is fine for one card and noticeable for a grid of fifty animating at once. Fading in a pre-painted shadow on a pseudo-element with `opacity` is the cheaper alternative when it matters.

:::mistake will-change everywhere
`will-change: transform` tells the browser to promote an element to its own layer in advance. On the one element about to animate, that can avoid a hitch at the start. On every card "just in case", it creates dozens of layers that each cost GPU memory, which can make the page slower, especially on phones. Add it right before an animation (or on `:hover` of the parent) and let it go afterwards; usually you don't need it at all.
:::

## Skip work you can't see

The schedule renders two days of sessions, but the user sees a screenful at a time. `content-visibility: auto` lets the browser skip layout and paint for sections that are off-screen:

```css
.day {
  content-visibility: auto;
  contain-intrinsic-size: auto 1200px;
}
```

Skipped content has no size, so `contain-intrinsic-size` gives the browser an estimate to use as a placeholder; with `auto`, it remembers the real size once the section has been rendered. Without it, sections collapse to zero and the scrollbar jumps as you scroll. Content stays in the DOM and in the accessibility tree, and find-in-page still works. `content-visibility: auto` has been Baseline since September 2025, when Safari 26 added the `auto` value; a browser without it simply renders every section, as before.

## Don't move things after they appear

Cumulative Layout Shift, one of the Core Web Vitals, measures content jumping as the page loads. In CSS, the usual culprit is media without reserved space. A speaker photo with `width: 100%` and no height is 0px tall until the image arrives, then shoves everything down. Reserve the space:

```css
.speaker img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
}
```

`width` and `height` attributes on the `<img>` do the same job, since browsers derive an aspect ratio from them. For web fonts, `font-display: swap` plus a fallback font with similar metrics keeps text from reflowing when the font loads.

:::tip Measure first
Open the DevTools Performance panel, record a scroll or an interaction, and look for long purple (style and layout) and green (paint) blocks. The Rendering panel's "Paint flashing" option highlights what repaints. Optimise what the trace shows, not what you suspect.
:::

## Where you are now

Across twenty lessons you've taken Waypoint's schedule from a stylesheet that fought you to one you can predict: layers and `:where()` settle conflicts, custom properties expose component APIs, grid, subgrid and container queries handle layout, `oklch()` and `light-dark()` handle color, logical properties make it work in Arabic, and motion is kind and cheap. The habit to keep is the one from the first lesson: before you change CSS, predict what the browser will do, then check.
