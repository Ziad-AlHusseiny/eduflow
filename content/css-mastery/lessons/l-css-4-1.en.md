---
summary: "Add transitions and keyframe animations that feel deliberate, animate elements in from display none with @starting-style, and honour prefers-reduced-motion without breaking the interface."
takeaways:
  - "List the exact properties you transition (`transition: translate 200ms ease-out`) instead of `all`, so theme changes and layout properties don't animate by accident."
  - "Use transitions for changes between two states and `@keyframes` for multi-step or looping motion."
  - "`@starting-style` defines the values an element transitions from when it first appears, which makes entry animations from `display: none` possible in CSS."
  - "Wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)`, so people who asked for less motion get a calm interface by default."
further:
  - title: "Using CSS transitions (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using
  - title: "@starting-style (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style
  - title: "prefers-reduced-motion (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
quiz:
  - q: "A card has `transition: all 300ms`. When the user switches to dark mode, the whole page fades slowly between colors. What's the cleanest fix?"
    options:
      - text: "Remove the transition in dark mode with a media query."
        why: "That treats the symptom for one case; any other property change (a padding tweak at a breakpoint) still animates."
      - text: "Set `transition-duration: 0s` on `:root`."
        why: "Transitions aren't inherited, so that doesn't reach the card, and it would disable the hover effect too."
      - text: "Transition only the properties you mean, such as `transition: translate 200ms, box-shadow 200ms`."
        why: "Correct. Listing properties makes the motion intentional; colors and layout change instantly unless you ask for them."
    answer: 2
  - q: "A toast is shown by switching from `display: none` to `display: block`, and its `opacity` transition never runs. Why?"
    options:
      - text: "Opacity can't be transitioned on elements that use display."
        why: "Opacity transitions fine; the problem is the element has no previous style to transition from."
      - text: "When an element first renders there is no before-state, so there's nothing to transition from; `@starting-style` provides one."
        why: "Correct. `@starting-style { .toast { opacity: 0; } }` gives the browser the starting values for the first style update."
      - text: "Transitions only run on hover."
        why: "Transitions run on any computed style change, whatever caused it."
      - text: "The duration must be at least 500ms for the browser to notice."
        why: "There's no minimum duration; even 100ms transitions run."
    answer: 1
  - q: "Which approach best serves users who set 'reduce motion' in their OS?"
    options:
      - text: "Put decorative motion inside `@media (prefers-reduced-motion: no-preference)`, and keep simple fades or instant changes as the default."
        why: "Correct. Motion becomes opt-in, and the interface still communicates state changes for everyone."
      - text: "Hide every animated element when reduced motion is on."
        why: "Hiding content removes information. Users asked for less motion, not less interface."
      - text: "Slow every animation down to 2 seconds."
        why: "Slower movement is still movement, and long animations make the interface feel broken."
    answer: 0
---

Waypoint's design brief asks for three bits of motion: session cards lift slightly on hover, the session that's happening right now has a pulsing "Live" dot, and a toast slides in when you save a session. All three are small. All three can go wrong in ways that make the page feel cheap, or make some people physically unwell.

This lesson covers the tools (transitions, keyframes, `@starting-style`) and the responsibility (`prefers-reduced-motion`).

## Transitions: between two states

A transition animates a property when its computed value changes, for whatever reason: hover, a class toggle, a media query. You choose which properties, how long, and the easing:

```css title=session-card.css
.session-card {
  transition:
    translate 200ms ease-out,
    box-shadow 200ms ease-out;

  &:hover,
  &:focus-within {
    translate: 0 -2px;
    box-shadow: 0 6px 16px rgb(15 23 42 / 0.12);
  }
}
```

Three choices are doing work here. **Specific properties**: the card lifts and its shadow grows, nothing else animates. **Short duration**: 150–250ms feels responsive for small UI changes; anything over 400ms feels sluggish when the user is waiting on it. **Easing**: `ease-out` starts fast and settles, which suits things responding to the user.

The individual transform properties (`translate`, `scale`, `rotate`) are worth using over `transform`: they can be transitioned and overridden independently, so a hover lift doesn't wipe out a scale set somewhere else.

:::mistake transition: all
`transition: all 300ms` animates every property that changes, including ones you never thought about. Switch to dark mode and every color on the card fades slowly; change padding at a breakpoint and the card visibly stretches. List the properties you mean. It's more typing and far less surprise.
:::

## Keyframes: multi-step and looping motion

When motion has more than two steps, or repeats on its own, you need `@keyframes`:

```css
@keyframes pulse {
  0%   { scale: 1;   opacity: 1; }
  70%  { scale: 2.2; opacity: 0; }
  100% { scale: 2.2; opacity: 0; }
}

.live-dot::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.6s ease-out infinite;
}
```

The dot's halo grows and fades, then pauses briefly (the 70%–100% hold) before repeating. Animating `scale` and `opacity` is deliberate: those two can run on the compositor without re-running layout, which the last lesson in this course explains.

## Entry animations with @starting-style

The save toast is `display: none` until a class shows it. Transitions can't run on its first appearance, because a newly rendered element has no previous style to start from. `@starting-style` provides one:

```css
.toast {
  opacity: 1;
  translate: 0 0;
  transition:
    opacity 200ms ease-out,
    translate 200ms ease-out,
    display 200ms allow-discrete;
}

@starting-style {
  .toast {
    opacity: 0;
    translate: 0 8px;
  }
}

.toast[hidden] {
  display: none;
  opacity: 0;
}
```

When `hidden` is removed, the browser starts the toast at the `@starting-style` values and transitions to the normal ones. `transition-behavior: allow-discrete` (here written as `allow-discrete` in the shorthand) lets `display` flip at the right moment on the way out, so the fade-out is visible before the element disappears. `@starting-style` and `transition-behavior` are Baseline 2024, so the entry animation works everywhere current. Animating `display` itself on the way out isn't Baseline yet (Chrome and Safari do it, Firefox doesn't), so there the toast disappears instantly instead of fading; in older browsers it simply appears without animation. Both are perfectly good fallbacks.

## Respect reduced motion

Some people get dizzy, nauseous or distracted from motion on screen, especially from movement across distance, parallax and zooming. Operating systems have a "reduce motion" setting, and CSS reads it with `prefers-reduced-motion`.

The most robust pattern makes motion opt-in:

```css
@media (prefers-reduced-motion: no-preference) {
  .session-card {
    transition: translate 200ms ease-out, box-shadow 200ms ease-out;
  }
  .live-dot::after {
    animation: pulse 1.6s ease-out infinite;
  }
}
```

Users who haven't asked for reduced motion get everything. Users who have get a static card and a static dot, and the interface still works, because no information depends on the motion.

:::why Why reduce, not remove
Reduced motion doesn't mean no feedback. A state change that slides 200px across the screen can become a quick fade; a hover lift can become a border-color change. Keep the meaning, drop the movement. And never make information depend only on animation: the Live dot also has the text "Live now" next to it.
:::

You'll also see a global safety net that sets every animation and transition duration to almost zero inside `@media (prefers-reduced-motion: reduce)`. It's a reasonable backstop for third-party widgets, but as your only strategy it's blunt: it can confuse scripts that rely on animation timing (it uses a tiny non-zero duration precisely because a `0s` transition never fires `transitionend`), and it removes harmless fades along with harmful motion.

## Your turn

The exercise card has an instant hover, a static dot, and no reduced-motion handling. Add a hover transition on specific properties, a looping pulse on the dot, and wrap the decorative motion so it only runs for users who haven't asked to reduce it. Next, you'll animate between whole page states with view transitions.
