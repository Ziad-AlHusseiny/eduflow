---
summary: "Animate between two states of the same page with document.startViewTransition(), give elements names so they morph into their new positions, and customise or disable the animation in CSS."
takeaways:
  - "`document.startViewTransition(update)` snapshots the page, runs your DOM update, snapshots again and animates between the two with a crossfade by default."
  - "An element with a unique `view-transition-name` gets its own snapshot pair, so it moves and resizes smoothly to its new position instead of fading."
  - "The animation is built from pseudo-elements such as `::view-transition-group(name)`, which you style with ordinary CSS animations."
  - "Always feature-detect `startViewTransition` and run the update directly when it's missing, and remove the animation for users who prefer reduced motion."
further:
  - title: "View Transition API (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
  - title: "Document: startViewTransition() method (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
  - title: "Same-document view transitions have become Baseline Newly available (web.dev)"
    url: https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
quiz:
  - q: "You call `document.startViewTransition(() => applyFilter())` with no CSS at all. What does the user see?"
    options:
      - text: "Nothing; view transitions need a `view-transition-name` before they animate."
        why: "Without names, the whole page is captured as `root` and still animates."
      - text: "The filter applies instantly, because the default animation duration is zero."
        why: "The default is a short crossfade, not an instant change."
      - text: "A quick crossfade of the whole page from the old state to the new one."
        why: "Correct. The root snapshot pair crossfades by default; names add per-element movement on top."
    answer: 2
  - q: "Two cards on the page both have `view-transition-name: card`. What happens when you start a transition?"
    options:
      - text: "The transition is skipped, because names must be unique among rendered elements."
        why: "Correct. Duplicate names make the browser abort the animation; the DOM update still runs, so the page just changes instantly."
      - text: "Both cards animate together as one group."
        why: "A group has exactly one old and one new snapshot; the browser can't merge two elements into one."
      - text: "Only the first card in the DOM animates."
        why: "The browser doesn't pick a winner; the duplicate makes the whole transition invalid."
      - text: "The second card gets a generated name automatically."
        why: "With an explicit duplicate name, nothing is generated; the transition is skipped."
    answer: 0
  - q: "How do you make every view transition on the page take 250ms?"
    options:
      - text: "`document.startViewTransition({ duration: 250 })`"
        why: "The method takes an update callback (or an options object with `update` and `types`), not a duration."
      - text: "`::view-transition-group(*) { animation-duration: 250ms; }`"
        why: "Correct. The groups run CSS animations, so ordinary animation properties control their timing."
      - text: "`view-transition-duration: 250ms` on `:root`"
        why: "There's no such property; timing comes from the animations on the pseudo-elements."
    answer: 1
  - q: "Which statement about support is accurate in 2026?"
    options:
      - text: "Same-document and cross-document view transitions both work in every major browser."
        why: "Cross-document view transitions for multi-page apps aren't available in Firefox yet, so they're not Baseline."
      - text: "View transitions only work in Chromium browsers."
        why: "Safari and Firefox both support same-document view transitions now."
      - text: "View transitions require a framework router to work."
        why: "They're a browser API; any DOM update inside the callback works, with or without a framework."
      - text: "Same-document view transitions are Baseline since October 2025; cross-document ones aren't Baseline yet."
        why: "Correct. Firefox 144 completed same-document support; MPA (cross-document) transitions still lack Firefox support."
    answer: 3
---

When a Waypoint visitor ticks "Hide sold-out", three cards vanish and the rest jump upwards to fill the gaps. It's instant and correct, and it's disorienting: your eye was on the fourth card, and now something else is there. A smooth movement from the old layout to the new one would tell the eye where things went.

Animating layout changes used to mean measuring every element before and after and running FLIP animations in JavaScript. The View Transition API does the measuring for you.

## Snapshot, update, animate

```js title=filters.js
const button = document.querySelector('#hide-full');

function applyFilter() {
  const hide = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(hide));
  for (const card of document.querySelectorAll('.session-card.is-full')) {
    card.hidden = hide;
  }
}

button.addEventListener('click', () => {
  if (!document.startViewTransition) {
    applyFilter();          // older browsers: just update
    return;
  }
  document.startViewTransition(() => applyFilter());
});
```

`startViewTransition()` does four things in order:

1. Captures a snapshot of the current page.
2. Calls your update function, which changes the DOM however it likes.
3. Captures the new state.
4. Builds a tree of pseudo-elements showing old and new snapshots, and animates between them.

:::figure A view transition captures the old state, runs the update, captures the new state, then animates
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">Four steps in a row connected by arrows: capture old snapshot, run the update callback, capture new snapshot, animate the pseudo-element tree from old to new.</title>
  <rect class="d-box" x="10" y="50" width="150" height="70" rx="10"/>
  <text class="d-label-strong" x="30" y="80">1. Capture</text>
  <text class="d-label-muted" x="30" y="102">old state</text>
  <rect class="d-box-primary" x="186" y="50" width="150" height="70" rx="10"/>
  <text class="d-label-strong" x="206" y="80">2. Update</text>
  <text class="d-code" x="206" y="102">applyFilter()</text>
  <rect class="d-box" x="362" y="50" width="150" height="70" rx="10"/>
  <text class="d-label-strong" x="382" y="80">3. Capture</text>
  <text class="d-label-muted" x="382" y="102">new state</text>
  <rect class="d-box-accent" x="538" y="50" width="150" height="70" rx="10"/>
  <text class="d-label-strong" x="558" y="80">4. Animate</text>
  <text class="d-code" x="558" y="102">::view-transition</text>
  <path class="d-arrow" d="M160 85 L182 85" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M336 85 L358 85" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M512 85 L534 85" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="10" y="170">The real DOM is already in its new state while step 4 plays.</text>
</svg>
:::

The default animation is a crossfade of the whole page. It's subtle, and already better than a jump. The DOM update itself is real and immediate; only the *picture* animates, and while it plays, the page underneath is already in its new state. If the update throws or the transition is skipped, the DOM change still happens.

## Name elements to make them move

To make each card glide to its new position, give it a `view-transition-name`. Every named element gets its own snapshot pair, and the browser animates its position and size from old to new:

```css
.session-card {
  view-transition-name: var(--vt-name);
}
```

```js
// Give every card a unique name once, when the list renders
for (const card of document.querySelectorAll('.session-card')) {
  card.style.setProperty('--vt-name', `card-${card.id}`);
}
```

Names must be **unique** among the elements rendered at the moment of capture. The cards that disappear fade out (they exist only in the old snapshot), and the cards that remain slide up into the gaps. Your eye follows them.

:::mistake Reusing one name for a list
`.session-card { view-transition-name: card; }` gives every card the same name. With duplicates the browser can't pair snapshots, so it skips the whole transition and the page changes instantly, with a console error about duplicate names. Generate a unique name per element, from its id or index.
:::

## Styling the animation

The animation lives in a tree of pseudo-elements: `::view-transition` at the top, a `::view-transition-group(name)` per named element (plus `root` for the rest of the page), and inside each, `::view-transition-old(name)` and `::view-transition-new(name)`. They're animated with ordinary CSS animations, so you control them with ordinary CSS:

```css
::view-transition-group(*) {
  animation-duration: 250ms;
  animation-timing-function: ease-out;
}

/* Keep the header still while the list moves */
.site-header { view-transition-name: header; }
::view-transition-group(header) { animation: none; }
```

The `*` matches every group. For reduced motion, remove the animations so the change is instant:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

The `!important` isn't there to beat the browser's default animations; your normal rules already win over those, as you saw in the first lesson. It's there so the user's preference also beats any more specific animation you or a library wrote for one named group, such as `::view-transition-group(header)`.

You can also target one direction of change. The old snapshot of a card that disappears only has a `::view-transition-old(card-s2)`, with no new counterpart, so a rule like `::view-transition-old(*) { animation-duration: 150ms; }` makes leaving cards fade a little faster than the remaining ones move. Small differences like that make a list feel organised rather than shuffled.

## Waiting for the transition

`startViewTransition()` returns a `ViewTransition` object with three promises. `updateCallbackDone` resolves when your DOM update has run, `ready` when the animation is about to start, and `finished` when it has ended and the pseudo-elements are gone. Use `finished` to move focus or announce a result after the motion settles, for example sending focus to the first remaining card for keyboard users. Don't make anything essential wait on the animation, though: in a browser without the API, there's no transition object at all.

:::note Support
Same-document view transitions became Baseline newly available in October 2025, when Firefox 144 shipped them. Cross-document transitions between pages of a multi-page site (opted into with `@view-transition { navigation: auto; }`) work in Chromium and Safari but not yet in Firefox, so treat them as an enhancement. Either way, a browser without support just updates the page, which is why the feature check in the click handler matters.
:::

## Your turn

The exercise's filter button hides sold-out sessions with no animation. Give each card a unique name, wrap the update in a view transition with a fallback, set the group duration to 250ms, and switch the animation off for reduced motion. The checks spy on `startViewTransition` and also remove it to make sure your fallback works. Next, you'll tie animation progress to scrolling instead of time.
