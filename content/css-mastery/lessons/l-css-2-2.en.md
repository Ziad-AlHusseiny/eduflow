---
summary: "Lay out a page with named grid-template-areas and build a speaker grid that picks its own column count with repeat(auto-fit, minmax())."
takeaways:
  - "`grid-template-areas` lets you draw the layout as ASCII art, and rearranging the page for another screen size means redrawing the strings, not moving markup."
  - "`repeat(auto-fit, minmax(12rem, 1fr))` creates as many columns as fit and stretches them to fill the row, with no media queries."
  - "`auto-fill` keeps empty tracks when there are few items, while `auto-fit` collapses them so the items stretch to fill the row."
  - "`1fr` has an automatic minimum of the content size; use `minmax(0, 1fr)` when a track must be allowed to shrink below its content."
further:
  - title: "Grid template areas (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Grid_template_areas
  - title: "repeat() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/repeat
  - title: "Grid (web.dev Learn CSS)"
    url: https://web.dev/learn/css/grid
quiz:
  - q: "A speaker grid uses `repeat(auto-fill, minmax(180px, 1fr))` in a 900px container but only has two speakers. What do you see?"
    options:
      - text: "Two wide cards that share the full 900px."
        why: "That's `auto-fit`, which collapses empty tracks. `auto-fill` keeps them."
      - text: "Two cards about 180px wide, with the empty tracks still taking up the rest of the row."
        why: "Correct. `auto-fill` creates as many tracks as fit (five here) whether or not there are items for them, so two cards sit in the first two of five equal columns."
      - text: "Two cards exactly 180px wide, left-aligned, with no extra tracks."
        why: "The cards are about that wide, but not because extra tracks are missing. Three empty tracks exist and hold the space; that's exactly what keeps the two cards narrow."
    answer: 1
  - q: |
      What does this layout put in the second row, first column?
      ```css
      .page {
        display: grid;
        grid-template-columns: 14rem 1fr;
        grid-template-areas:
          "header header"
          "filters main";
      }
      ```
    options:
      - text: "The element with `grid-area: header`."
        why: "The header area covers both columns of the first row only."
      - text: "Nothing; areas must be rectangular, so this is invalid."
        why: "Both areas here are rectangles (header is 1×2, filters and main are 1×1), so the template is valid."
      - text: "The element with `grid-area: filters`."
        why: "Correct. Each string is a row and each word a column, so the second row's first column is `filters`."
    answer: 2
  - q: "A grid with `grid-template-columns: 1fr 1fr` gets a code block with a very long line in its first column, and the columns become unequal. What's the fix?"
    options:
      - text: "`grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)`"
        why: "Correct. A bare `1fr` has an automatic minimum equal to the content's min-content size; `minmax(0, 1fr)` removes that floor so both columns stay equal."
      - text: "`grid-template-columns: 50% 50%`"
        why: "Percentages ignore the gap, so with any `gap` the grid overflows its container."
      - text: "`grid-auto-flow: dense`"
        why: "`dense` changes how items are placed into holes; it doesn't affect track sizing."
      - text: "`justify-items: stretch`"
        why: "That's already the default and only affects how items fill their cells, not how wide the tracks are."
    answer: 0
---

Flexbox lays things out in one direction and lets each line make its own decisions. That's perfect for a row of filters and wrong for Waypoint's speaker grid, where every card in a column should line up with the cards above and below it. When you need rows *and* columns to agree, you want grid.

This lesson builds two layouts on the schedule page: the page shell, with named areas, and the speaker grid, which decides its own number of columns.

## Draw the page with template areas

The schedule page has a header across the top, a filter sidebar and the main content. With `grid-template-areas` you draw that layout directly:

```css title=layout.css
.page {
  display: grid;
  grid-template-columns: 14rem minmax(0, 1fr);
  grid-template-areas:
    "header  header"
    "filters main";
  gap: 1.5rem;
}
.site-header { grid-area: header; }
.filters     { grid-area: filters; }
.schedule    { grid-area: main; }
```

Each string is a row; each word inside it is a column. Repeating a name (`header header`) makes that area span both columns. A `.` marks an empty cell. Areas must be rectangles: an L-shape is invalid and the whole declaration is dropped.

The pay-off comes when the layout changes. On narrow screens the filters should sit above the sessions, so you redraw the strings instead of moving markup:

```css
@media (width < 48rem) {
  .page {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "header"
      "filters"
      "main";
  }
}
```

:::mistake Reordering visually, not in the DOM
Grid areas can place elements in any visual order, but keyboard focus and screen readers follow the DOM order. If you put the filters visually *after* the sessions but they come first in the HTML, a keyboard user tabs through invisible-feeling jumps. Keep the source order logical and use areas to adjust layout, not meaning.
:::

## The `fr` unit and its hidden minimum

`fr` divides the free space in the grid after fixed tracks and gaps are subtracted. Two `1fr` columns in a 600px grid with a 20px gap are 290px each.

There's a catch you'll meet sooner or later: `1fr` is shorthand for `minmax(auto, 1fr)`, and `auto` as a minimum means "at least the content's min-content width". Put a long unbroken URL or a code block in one column and it widens, stealing space from the other. That's why the page shell above uses `minmax(0, 1fr)`: it lets the main column shrink below its content, and any overflow is handled inside it (with `overflow-x: auto` on the code block, for instance). It's the grid cousin of the `min-width: 0` fix from the previous lesson.

## A speaker grid that counts its own columns

Waypoint has 23 speakers. On a phone they should stack; on a laptop, four or five across. One declaration handles every width:

```css title=speakers.css
.speakers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.speaker.featured {
  grid-column: 1 / -1;
}
```

Read it inside out. `minmax(180px, 1fr)` says each column is at least 180px and at most an equal share of the free space. `repeat(auto-fit, …)` asks the browser to create as many such columns as fit. In a 640px container with 16px gaps, three 180px columns fit (three columns plus two gaps is 572px) and four don't, so you get three columns, each stretched to about 203px.

`grid-column: 1 / -1` makes the keynote speaker span from the first line to the last, whatever the column count. Negative line numbers count from the end of the explicit grid.

:::figure auto-fill keeps empty tracks; auto-fit collapses them so items stretch
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Two grids of the same width with two items each. With auto-fill, the items occupy two of four equal columns and two empty dashed tracks remain. With auto-fit, the empty tracks collapse and the two items each take half the width.</title>
  <text class="d-code" x="20" y="24">auto-fill</text>
  <rect class="d-box" x="20" y="36" width="640" height="64" rx="8"/>
  <rect class="d-box-primary" x="30" y="46" width="146" height="44" rx="6"/>
  <rect class="d-box-primary" x="186" y="46" width="146" height="44" rx="6"/>
  <rect class="d-box d-dashed" x="342" y="46" width="146" height="44" rx="6"/>
  <rect class="d-box d-dashed" x="498" y="46" width="152" height="44" rx="6"/>
  <text class="d-label-muted" x="380" y="74">empty</text>
  <text class="d-label-muted" x="540" y="74">empty</text>
  <text class="d-code" x="20" y="138">auto-fit</text>
  <rect class="d-box" x="20" y="150" width="640" height="64" rx="8"/>
  <rect class="d-box-primary" x="30" y="160" width="306" height="44" rx="6"/>
  <rect class="d-box-primary" x="344" y="160" width="306" height="44" rx="6"/>
</svg>
:::

The difference between `auto-fit` and `auto-fill` only shows when there are fewer items than columns. `auto-fill` keeps the empty tracks, so two speakers stay card-sized and leave a gap. `auto-fit` collapses empty tracks to zero, so the two speakers stretch across the row. For a speaker grid that's sometimes nearly empty (day two has only four speakers), pick based on the design: `auto-fill` for consistent card widths, `auto-fit` for a full row.

:::tip Guard the minimum on tiny screens
If the container is narrower than 180px, `minmax(180px, 1fr)` overflows. Writing `minmax(min(180px, 100%), 1fr)` caps the minimum at the container's width. You'll see why that works in [Intrinsic Sizing](lesson:l-css-2-4).
:::

## Your turn

The exercise gives you the page shell and the speaker grid with hard-coded columns. Name the areas, switch the speakers to `auto-fit`, and make the keynote span the whole row. The checks resize the page to make sure the column count adapts. Next, you'll make the *contents* of grid cards line up across cards with subgrid.
