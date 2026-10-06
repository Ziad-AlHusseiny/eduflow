---
summary: "Drive CSS animations from scroll position with scroll() and view() timelines, choose animation ranges, and ship them as a progressive enhancement while Firefox support is pending."
takeaways:
  - "`animation-timeline: scroll()` ties an animation's progress to how far a scroll container has scrolled; `view()` ties it to an element's passage through the visible area."
  - "`animation-range` picks which part of the timeline plays the animation, for example `entry 0% cover 30%` for a reveal that finishes soon after the element appears."
  - "The `animation` shorthand resets `animation-timeline`, so declare the timeline after the shorthand."
  - "Scroll-driven animations work in Chromium and Safari 26 but not yet in stable Firefox, so wrap them in `@supports` and make sure content is fully visible without them."
further:
  - title: "Scroll-driven animation timelines (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines
  - title: "animation-timeline (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline
  - title: "animation-range (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-range
quiz:
  - q: |
      The progress bar never moves. Why?
      ```css
      .progress {
        animation-timeline: scroll(root);
        animation: grow linear both;
      }
      ```
    options:
      - text: "`scroll(root)` isn't valid; it should be `scroll(html)`."
        why: "`root` is the correct keyword for the document's scroller; `html` isn't accepted there."
      - text: "The `animation` shorthand comes second and resets `animation-timeline` to `auto`, so the animation runs on time with no duration."
        why: "Correct. The shorthand resets every animation longhand, including the timeline. Put `animation-timeline` after it."
      - text: "Scroll-driven animations need `animation-duration: 1s`."
        why: "Duration doesn't apply to scroll timelines; progress comes from scroll position. `auto` is fine."
    answer: 1
  - q: "A speaker card should fade in as it enters the viewport and be fully visible by the time 30% of it is showing. Which declarations?"
    options:
      - text: "`animation-timeline: scroll(); animation-range: 0% 30%;`"
        why: "A `scroll()` timeline tracks the whole page's scroll position, so the range would refer to the first 30% of the page, not to the card."
      - text: "`animation-timeline: view(); animation-range: exit 0% exit 30%;`"
        why: "The exit range is when the card is leaving the viewport, which is the opposite end of its path."
      - text: "`animation-timeline: view(); animation-range: entry 0% cover 30%;`"
        why: "Correct. `view()` tracks the card's visibility, and the range starts as it begins to enter and ends 30% into its full cover range."
    answer: 2
  - q: "In 2026, a teammate wants to make the speaker grid hidden until scroll-driven reveals fade each card in. What's the main risk?"
    options:
      - text: "In browsers without scroll timelines, such as stable Firefox, a card that starts at opacity 0 may never become visible."
        why: "Correct. Scroll-driven animations aren't Baseline yet. Put the hidden starting state inside `@supports (animation-timeline: view())` so unsupported browsers show the cards normally."
      - text: "Scroll-driven animations always block the main thread and cause jank."
        why: "Animations of compositor-friendly properties like opacity and transform can run off the main thread; that's one of their advantages over scroll listeners."
      - text: "Screen readers announce every frame of the animation."
        why: "Screen readers don't announce visual animation frames."
      - text: "Each card needs its own named timeline."
        why: "An anonymous `view()` timeline is per element automatically; names are only needed to share a timeline between elements."
    answer: 0
---

Waypoint's schedule is long: two days, four tracks, sixty sessions. The team wants two small touches: a thin progress bar under the header showing how far down the schedule you are, and speaker cards that ease into view as you scroll to them. The old way was a `scroll` event listener that read `scrollY`, did some arithmetic and wrote styles, sixty times a second, on the main thread, competing with everything else.

Scroll-driven animations let CSS do it. You write a normal `@keyframes` animation and swap its clock: instead of time, its progress comes from scrolling.

## Two kinds of timeline

**A scroll progress timeline**, `scroll()`, goes from 0% to 100% as a scroll container scrolls from top to bottom. `scroll(root)` is the document; `scroll(nearest)`, the default, is the nearest scrolling ancestor.

**A view progress timeline**, `view()`, follows one element as it travels through its scroll container's visible area (the scrollport): from the moment its edge peeks in at the bottom to the moment it leaves at the top.

```css title=progress.css
@keyframes grow {
  from { scale: 0 1; }
  to   { scale: 1 1; }
}

.progress {
  position: fixed;
  inset: 0 0 auto;
  height: 3px;
  background: var(--track-design);
  transform-origin: 0 50%;
  animation: grow linear both;
  animation-timeline: scroll(root);
}
```

At the top of the page the bar is scaled to zero; at the bottom it's full width; anywhere in between it's exactly proportional. `linear` matters here: with the default `ease`, the bar would race ahead in the middle and crawl at the ends. `both` keeps the first and last keyframes applied outside the range.

:::mistake Declaring the timeline before the shorthand
The `animation` shorthand resets every animation longhand, including `animation-timeline`, back to its default, `auto`. Write `animation-timeline` *after* `animation`, or the animation silently becomes a time-based one with zero duration, and the bar never moves.
:::

## Reveal on view, with ranges

For the speaker cards, a view timeline is the right clock, and `animation-range` chooses which part of the card's path runs the animation:

```css title=speakers.css
@keyframes reveal {
  from { opacity: 0; translate: 0 24px; }
  to   { opacity: 1; translate: 0 0; }
}

.speaker {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}
```

:::figure A view timeline follows an element through the scrollport; named ranges mark parts of that path
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">A tall scrollport rectangle. A card is shown at three positions: just entering at the bottom edge, fully inside, and leaving at the top edge. Labels mark the entry range at the bottom edge, the contain range while fully inside, and the exit range at the top edge; cover spans from first entry to final exit.</title>
  <rect class="d-box-accent d-dashed" x="200" y="40" width="240" height="180" rx="8"/>
  <text class="d-label-muted" x="210" y="60">scrollport</text>
  <rect class="d-box-primary" x="250" y="200" width="140" height="44" rx="6"/>
  <text class="d-label" x="290" y="227">card</text>
  <rect class="d-box-primary" x="250" y="110" width="140" height="44" rx="6"/>
  <text class="d-label" x="290" y="137">card</text>
  <rect class="d-box-primary" x="250" y="18" width="140" height="44" rx="6"/>
  <text class="d-label" x="290" y="45">card</text>
  <text class="d-code" x="460" y="226">entry</text>
  <text class="d-code" x="460" y="138">contain</text>
  <text class="d-code" x="460" y="46">exit</text>
  <path class="d-line" d="M150 244 L150 18"/>
  <text class="d-code" x="60" y="136">cover</text>
  <path class="d-arrow" d="M600 236 L600 30" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="560" y="254">scrolling down</text>
</svg>
:::

The named ranges describe the element's path: **entry** while it crosses the bottom edge, **contain** while it's fully inside (or fully covering, if it's taller), **exit** while it crosses the top edge, and **cover** for the whole trip from first pixel in to last pixel out. `entry 0% cover 30%` means "start as the card begins to enter, finish when it's 30% through its whole trip", so each card is fully visible well before the user reaches it.

## Ship it as an enhancement

Here's the support picture in October 2026: scroll-driven animations have been in Chromium since version 115 (2023) and in Safari since 26 (September 2025). Firefox has an implementation behind a flag, and it's an Interop 2026 focus area, but stable Firefox doesn't support it yet, so the feature isn't Baseline.

That shapes how you write it. The reveal keyframes start at `opacity: 0`, and in a browser that understands `animation-timeline`, that's fine. In one that doesn't, `animation: reveal linear both` with no timeline is a zero-duration time animation that ends at its last keyframe, so the cards still show. Don't rely on that subtlety; make the intent explicit:

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .speaker {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 30%;
    }
  }
}
```

Unsupported browsers and reduced-motion users get the plain, fully visible grid. Supported browsers get the reveal.

:::why Why this beats a scroll listener
A scroll-driven animation of `opacity`, `translate` or `scale` can run on the compositor, in sync with scrolling, even while the main thread is busy running your JavaScript. A scroll listener runs on the main thread and is always a frame behind. The CSS version is shorter, smoother and has no code to clean up.
:::

You can also name timelines (`view-timeline-name: --speaker`) so another element can follow them, and use `timeline-scope` to make a name visible higher in the tree. Reach for those when one element's scroll position should drive a *different* element; for self-contained effects, anonymous `scroll()` and `view()` are enough.

## Your turn

In the exercise, add the reading progress bar and the speaker reveal, in the right order, guarded by `@supports`. The checks read the computed timelines and ranges. Next, you'll step back from individual effects and organise the whole stylesheet so a team can work on it.
