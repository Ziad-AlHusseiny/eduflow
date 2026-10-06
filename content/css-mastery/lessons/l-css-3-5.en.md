---
summary: "Build focus indicators that keyboard users can always see, with :focus-visible, outlines that survive forced-colors mode, and scroll padding that keeps focus out from under a sticky header."
takeaways:
  - "`:focus-visible` matches when the browser decides a focus indicator is useful, typically keyboard navigation, so you can show a strong ring without showing it on every mouse click."
  - "Use `outline` with `outline-offset` for focus rings; it doesn't change layout, follows `border-radius`, and stays visible in Windows forced-colors mode where `box-shadow` disappears."
  - "Define the focus color with `light-dark()` so each theme gets its own ring color, then check it reaches at least 3:1 contrast against the surface in both."
  - "`scroll-padding-top` on the scroll container stops a sticky header from covering the element that just received focus."
further:
  - title: ":focus-visible (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible
  - title: "Understanding Success Criterion 2.4.11: Focus Not Obscured (Minimum) (W3C)"
    url: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
  - title: "Focus (web.dev Learn CSS)"
    url: https://web.dev/learn/css/focus
quiz:
  - q: "Why is `button:focus { outline: none; box-shadow: 0 0 0 3px violet; }` a risky focus style?"
    options:
      - text: "Box shadows are slower to paint than outlines."
        why: "The paint cost difference is negligible; the problem is visibility for some users."
      - text: "Windows forced-colors mode removes box shadows, so keyboard users in high-contrast mode see no focus at all."
        why: "Correct. Forced colors strips shadows but keeps outlines (recoloured to a system color), so the outline is the robust choice."
      - text: "`box-shadow` doesn't follow `border-radius`."
        why: "Box shadows do follow the border radius; that was never the issue."
    answer: 1
  - q: "You want a focus ring on keyboard focus but not when a mouse user clicks a button. Which selector?"
    options:
      - text: "`:focus`"
        why: "`:focus` matches every focus, including after a mouse click, so the ring appears on click too."
      - text: "`:focus-within`"
        why: "`:focus-within` matches an ancestor of the focused element; it doesn't distinguish keyboard from mouse."
      - text: "`:active`"
        why: "`:active` matches while a pointer is pressed down, which is the opposite of what you want."
      - text: "`:focus-visible`"
        why: "Correct. The browser applies its heuristics (keyboard yes, mouse click on a button no, text fields always) and matches only when an indicator helps."
    answer: 3
  - q: "Waypoint's header is `position: sticky` and 64px tall. When users tab backwards through the schedule, the focused card scrolls into view hidden under the header. What fixes it?"
    options:
      - text: "`html { scroll-padding-top: 64px; }`"
        why: "Correct. Scroll padding tells the browser the top 64px of the viewport is obscured, so focus and anchor scrolling stop below it."
      - text: "`.session-card { margin-top: 64px; }`"
        why: "That adds a 64px gap above every card on the page, all the time, just to work around scrolling."
      - text: "`header { z-index: -1; }`"
        why: "The header would then be painted behind the content, which breaks the sticky header entirely."
    answer: 0
---

Open Waypoint's schedule, put your mouse away, and press Tab. On the first version you'd see nothing. The reset contained `:focus { outline: none; }`, added because a designer disliked the ring that appeared when clicking buttons. Keyboard users, switch users and many screen-magnifier users navigate by focus, and they were navigating blind.

Removing focus styles isn't a style choice; it's a broken page for a large group of people. The good news is that modern CSS makes good focus styles easy to get right.

## :focus-visible: the ring when it helps

The designer's complaint was real: a ring after every mouse click looks like a glitch. `:focus-visible` solves it. It matches a focused element only when the browser judges that an indicator is useful:

- Focus arrived by keyboard: yes.
- A mouse click focused a button or link: no.
- A text field received focus, by any means: yes, because you need to see where you're typing.

```css title=focus.css
:root {
  --focus: light-dark(#6d28d9, #c4b5fd);
}

:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
```

That one rule replaces the reset's damage. It applies to every focusable element, keyboard users get a clear ring, and mouse users don't see it on buttons. `:focus-visible` is Baseline widely available.

## Why outline beats box-shadow

Many design systems draw focus rings with `box-shadow` because shadows used to follow rounded corners and outlines didn't. Outlines have followed `border-radius` in all current browsers since 2023, and they have three advantages:

1. **No layout shift.** Outlines don't take up space, so focusing a button never nudges its neighbours.
2. **`outline-offset`** puts a gap between the element and the ring, which keeps the ring visible against the element's own background.
3. **Forced-colors mode.** Windows high-contrast themes remove `box-shadow` entirely but keep outlines, recoloured to a system color.

:::mistake Killing the ring and drawing it with a shadow
`outline: none; box-shadow: 0 0 0 3px …` looks identical on your screen and vanishes in forced-colors mode. If you must use a shadow for a special effect, keep `outline: 2px solid transparent` underneath: a transparent outline is invisible normally, and forced colors paints it in a visible system color.
:::

## Contrast in both themes

A focus indicator needs at least 3:1 contrast against what's around it (WCAG's non-text contrast). A violet that works on white can disappear on a dark slate surface. Defining `--focus` with `light-dark()`, as above, gives each theme its own ring color from one token: a deep violet on light surfaces, a pale lavender on dark ones.

For components that sit on unpredictable backgrounds (the hero image, a colored track badge), a two-tone ring is safest: an outline in the focus color plus a contrasting halo just inside it:

```css
.hero :focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--surface);  /* halo between element and ring */
}
```

Here the shadow is decoration on top of a real outline, so forced-colors users still get the outline.

## Focus a whole card

Waypoint's session cards are clickable: the title is a link, stretched to cover the card with a pseudo-element. The ring then appears around the title text only, which looks odd. Move it to the card with `:has()`:

```css
.session-card:has(a:focus-visible) {
  outline: 2px solid var(--focus);
  outline-offset: 4px;
}
.session-card a:focus-visible {
  outline: none;   /* the card shows the ring instead */
}
```

Removing the link's own ring is fine here, because the card's ring replaces it whenever the link has visible focus. That's the only kind of `outline: none` you should ship: one that's covered by another indicator.

## Don't let the header hide focus

WCAG 2.2 added *Focus Not Obscured*: the focused element can't be entirely hidden by content the author put on top, like a sticky header or a cookie banner. Waypoint's header is sticky and 64px tall, and when a user tabs backwards, the browser scrolls the focused card to the top of the viewport, right under the header.

```css
html {
  scroll-padding-top: 64px;
}
```

Scroll padding tells the browser that part of the scroll container's viewport is covered. Focus scrolling, anchor links and `scrollIntoView()` all respect it. If the header's height changes, store it in a custom property and use it in both places.

:::tip Test with the keyboard for one minute
Unplug the habit, not the mouse: press Tab through your page from top to bottom, then Shift+Tab back. Can you always see where you are? Does anything get hidden? Do it in both themes. It takes a minute and catches most focus bugs.
:::

## Your turn

The exercise page has the bad reset. Replace it with a `:focus-visible` ring, move the ring to the card when its link is focused, and add scroll padding for the 64px header. That finishes the responsive section; next, you'll add motion, starting with transitions, keyframes and respect for reduced-motion settings.
