---
summary: "Predict how flexbox sizes items from flex-basis, grow and shrink, fix the min-width auto overflow trap, and build rows that wrap without media queries."
takeaways:
  - "Flexbox sizes items in two passes: each item starts at its `flex-basis`, then leftover space is shared by `flex-grow` or a shortfall is taken back by `flex-shrink`."
  - "`flex: 1` means `1 1 0%`, so items get equal shares regardless of content; `flex: auto` means `1 1 auto`, so content size is kept and only the extra is shared."
  - "Flex items default to `min-width: auto`, which stops them shrinking below their content; set `min-width: 0` to let text truncate instead of overflowing."
  - "An auto margin on a flex item absorbs all free space on that side, which is the cleanest way to push one item to the far end."
further:
  - title: "Controlling ratios of flex items along the main axis (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Controlling_flex_item_ratios
  - title: "flex (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex
  - title: "Flexbox (web.dev Learn CSS)"
    url: https://web.dev/learn/css/flexbox
quiz:
  - q: "Three items with different text lengths sit in a 600px flex container. You want three equal 200px columns. Which declaration on the items does it?"
    options:
      - text: "`flex: auto`"
        why: "`auto` means a basis of `auto` (the content size), so longer text starts wider and stays wider after the extra space is shared."
      - text: "`flex-grow: 1`"
        why: "This keeps the default `flex-basis: auto`, so items still start from their content width; only the leftover space is split evenly."
      - text: "`flex: 1`"
        why: "Correct. `flex: 1` sets the basis to 0%, so all 600px is free space, shared equally by three items with grow 1."
    answer: 2
  - q: "A session title in a flex row is a long unbroken string with `white-space: nowrap`. It pushes the save button out of the card even though the title has `flex: 1`. What fixes it?"
    options:
      - text: "Add `min-width: 0` (plus `overflow: hidden`) to the title."
        why: "Correct. Flex items default to `min-width: auto`, which means \"never smaller than my content\". Zero removes that floor, so the title can shrink and truncate."
      - text: "Add `flex-shrink: 10` to the title."
        why: "Shrink factors can't take an item below its minimum size, and `min-width: auto` sets that minimum at the content width."
      - text: "Add `flex-wrap: wrap` to the row."
        why: "Wrapping moves items onto new lines, but the title alone is still wider than the row, so it would still overflow."
    answer: 0
  - q: "In a header that is a flex row, how do you push the \"Get tickets\" link to the far right while the logo and nav stay left?"
    options:
      - text: "`justify-content: space-between` on the header."
        why: "That spreads every item apart, so the nav would float to the middle instead of staying next to the logo."
      - text: "`margin-inline-start: auto` on the link."
        why: "Correct. An auto margin swallows all free space on that side, so the link moves to the end and the others stay packed at the start."
      - text: "`float: right` on the link."
        why: "Floats have no effect on flex items; the flex container ignores `float`."
      - text: "`justify-self: end` on the link."
        why: "`justify-self` does nothing in flexbox, because the main axis is shared by all items, not split into cells."
    answer: 1
  - q: "`.filters > * { flex: 1 1 10rem; }` in a wrapping flex container 25rem wide with four filters. What happens?"
    options:
      - text: "All four squeeze onto one line at 6.25rem each."
        why: "Wrapping happens before shrinking. Four 10rem bases don't fit in 25rem, so the line breaks instead."
      - text: "Each filter is exactly 10rem wide, leaving a gap at the end of each line."
        why: "With grow 1 the items share the leftover space on their line, so they stretch to fill it."
      - text: "Two per line, each growing to fill half of its line."
        why: "Correct. Two 10rem bases fit, three don't, so each line holds two items that then grow to share the remaining space."
    answer: 2
---

The session row on Waypoint's schedule is three things in a line: a time, a title and a save button. It looks fine until the content team schedules "Shipping Accessible Design Systems Across Twelve Product Teams Without Losing Your Mind", and the save button slides off the edge of the card. Nothing in the CSS mentions widths, so where did the overflow come from?

From flexbox doing exactly what its algorithm says. Once you know the algorithm, this bug takes thirty seconds to fix.

## How flexbox decides sizes

Flexbox sizes items along the main axis in two passes:

1. **Hypothetical size.** Each item starts at its `flex-basis`. With the default `auto`, that's its `width` if set, otherwise its content width.
2. **Distribute the difference.** The container compares the sum of the bases (plus gaps) with its own size. If there's space left, items with `flex-grow` share it in proportion to their grow factors. If there's too little, items with `flex-shrink` give some back, weighted by shrink factor times basis, so big items shrink more.

:::figure Flex items start at their basis; leftover space is shared by grow factor
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Top row: three items at their flex-basis with free space left over in a 600 pixel container. Bottom row: the free space has been divided between the title, which has flex-grow 1, while the time and button keep their basis.</title>
  <text class="d-label-muted" x="20" y="24">1. Start at flex-basis</text>
  <rect class="d-box" x="20" y="36" width="600" height="56" rx="8"/>
  <rect class="d-box-accent" x="28" y="44" width="80" height="40" rx="6"/>
  <text class="d-code" x="44" y="70">time</text>
  <rect class="d-box-primary" x="116" y="44" width="180" height="40" rx="6"/>
  <text class="d-code" x="132" y="70">title</text>
  <rect class="d-box-success" x="304" y="44" width="70" height="40" rx="6"/>
  <text class="d-code" x="314" y="70">save</text>
  <rect class="d-box-warn d-dashed" x="382" y="44" width="230" height="40" rx="6"/>
  <text class="d-label-muted" x="412" y="70">free space</text>
  <text class="d-label-muted" x="20" y="134">2. Title has flex-grow: 1, so it takes the free space</text>
  <rect class="d-box" x="20" y="146" width="600" height="56" rx="8"/>
  <rect class="d-box-accent" x="28" y="154" width="80" height="40" rx="6"/>
  <text class="d-code" x="44" y="180">time</text>
  <rect class="d-box-primary" x="116" y="154" width="418" height="40" rx="6"/>
  <text class="d-code" x="132" y="180">title</text>
  <rect class="d-box-success" x="542" y="154" width="70" height="40" rx="6"/>
  <text class="d-code" x="552" y="180">save</text>
</svg>
:::

The `flex` shorthand sets all three values, and its keywords are worth memorising because they behave very differently:

| Shorthand | Expands to | Use it for |
|---|---|---|
| `flex: 1` | `1 1 0%` | Equal columns, whatever the content |
| `flex: auto` | `1 1 auto` | Keep content size, share only the extra |
| `flex: none` | `0 0 auto` | Never grow or shrink (icons, buttons) |
| `flex: 0 0 5rem` | fixed basis | A column of exact width |

## The `min-width: auto` trap

Back to the runaway title. It has `white-space: nowrap`, so its content width is the whole sentence, maybe 700px. The row is 400px. Shrinking should solve it, so why doesn't it?

Because flex items have `min-width: auto` by default, and for a flex item that means "no smaller than my min-content size". Shrinking stops at that floor. The unbreakable title can't shrink below its full width, so it overflows and drags the button with it.

```css title=session-row.css
.session-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.session-row .time  { flex: 0 0 5rem; }
.session-row .title {
  flex: 1;
  min-width: 0;            /* allow shrinking below content size */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.session-row .save  { flex: none; }
```

`min-width: 0` removes the floor, and the three overflow properties turn the clipped text into a tidy ellipsis. The same trap appears with long URLs, code blocks and nested flex or grid containers, so this is a fix you'll write many times.

:::mistake Blaming the parent's width
When a flex child overflows, people add `overflow: hidden` or `max-width: 100%` to the *container*. The container is fine; the item's automatic minimum is the problem. Put `min-width: 0` on the item that refuses to shrink (in a column-direction container, it's `min-height: 0`).
:::

## Push with auto margins

Waypoint's header holds the logo, the day switcher and a "Get tickets" link that belongs at the far end. `justify-content: space-between` would spread all three apart. An auto margin is more precise:

```css
.site-header { display: flex; align-items: center; gap: 1rem; }
.site-header .tickets { margin-inline-start: auto; }
```

Auto margins on flex items absorb all free space on their side, so the link moves to the end and everything before it stays packed together. It's the flexbox equivalent of "and then a spring".

## Wrapping without media queries

The filter bar holds four track filters. On a wide screen they fit on one line; on a phone they shouldn't be squeezed to unreadable slivers. Wrapping plus a basis gives you that with no breakpoint:

```css
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.filters > * {
  flex: 1 1 10rem;
}
```

Each filter wants 10rem. The browser fits as many 10rem items as it can on a line, wraps the rest, then lets each line's items grow to fill it. At 25rem wide you get two per line; at 45rem, all four. The breakpoint is implied by the content.

:::tip Use `gap`, not margins
`gap` puts space only *between* items, so you never need `:last-child { margin: 0 }` or negative margins on the container. It works in flexbox in every current browser.
:::

## Your turn

The exercise gives you a 400px session row with a very long title. Make the time a fixed 5rem column, let the title fill the remaining space and truncate with an ellipsis, and keep the save button at the end. When rows of cards need to line up in two dimensions, flexbox runs out of road; that's where grid takes over in the next lesson.
