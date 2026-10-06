---
summary: "Use subgrid so the time, title, abstract and room of every session card line up across a row of cards, whatever the length of each title."
takeaways:
  - "A nested grid with `grid-template-rows: subgrid` uses its parent's row tracks instead of creating its own, so content in sibling cards shares the same rows."
  - "The subgridded item must span as many parent tracks as it has parts, for example `grid-row: span 4` for a four-part card."
  - "A subgrid inherits the parent's gap by default and can override it with its own `row-gap` or `column-gap`."
  - "Subgrid has been Baseline since September 2023 and widely available since March 2026, so aligned card layouts no longer need fixed heights or JavaScript measuring."
further:
  - title: "Subgrid (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid
  - title: "CSS subgrid (web.dev)"
    url: https://web.dev/articles/css-subgrid
quiz:
  - q: |
      Each card has four children (time, title, abstract, room). Why don't the rooms line up?
      ```css
      .sessions { display: grid; grid-template-columns: repeat(3, 1fr); }
      .session-card { display: grid; grid-template-rows: subgrid; }
      ```
    options:
      - text: "The card only spans one parent row, so the subgrid has a single track to share."
        why: "Correct. A subgrid adopts only the parent tracks it spans, and it can't add implicit rows of its own. With one track, all four children land in that same row and overlap."
      - text: "`subgrid` only works on columns, not rows."
        why: "`subgrid` works on either axis or both: `grid-template-rows: subgrid`, `grid-template-columns: subgrid`."
      - text: "The parent needs `grid-template-rows: subgrid` too."
        why: "The parent is the grid that owns the tracks; only the nested grid uses the `subgrid` keyword."
    answer: 0
  - q: "What's the most robust way to make every card's room label align across a row when titles wrap to different numbers of lines?"
    options:
      - text: "Give every title a fixed `height: 3em`."
        why: "A fourth line of title overflows, and a one-line title leaves a hole; fixed heights break the moment content changes."
      - text: "Measure the tallest title in JavaScript and set the others to match."
        why: "It works, but it's slow, runs again on every resize and font load, and is exactly the job subgrid now does in CSS."
      - text: "Make each card a row subgrid spanning four parent rows."
        why: "Correct. All cards in a row share the same four tracks, so each track grows to the tallest content and everything below lines up."
    answer: 2
  - q: "The parent grid has `gap: 24px`, and the subgridded cards look too spread out inside. What do you change?"
    options:
      - text: "Set `gap: 0` on the parent grid."
        why: "That also removes the space between the cards themselves, which you wanted to keep."
      - text: "Set `row-gap: 8px` on the subgridded card."
        why: "Correct. A subgrid inherits the parent's gaps by default but can override them for its own tracks."
      - text: "Add negative margins to the card's children."
        why: "Negative margins fight the layout instead of configuring it, and break when the gap changes."
      - text: "Nothing; the inherited gap can't be changed in a subgrid."
        why: "The gap can be overridden; only the track sizes come from the parent."
    answer: 1
---

Put three Waypoint session cards side by side and the problem jumps out. One title fits on a line, one wraps to two, one to three. Each card lays out its own content, so the abstracts start at three different heights and the room labels at the bottom form a staircase. Designers notice. Users notice less, but the page looks unfinished.

The old fixes were fixed heights (which break with real content) or JavaScript that measures every title. Subgrid makes the cards share one set of rows.

## Why nested grids don't line up

When a card becomes `display: grid`, it creates its own, independent tracks. Its title row is as tall as *its* title; the neighbouring card's title row is as tall as *that* title. Nothing connects them, because each card only knows about its own content.

What you want is for the "title row" to be one track shared across all cards in the same visual row, sized by the tallest title. That shared track has to live in the parent, the `.sessions` grid, and the cards need to borrow it.

## Borrowing the parent's rows

```css title=sessions.css
.sessions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
  gap: 24px;
}

.session-card {
  display: grid;
  grid-row: span 4;              /* time, title, abstract, room */
  grid-template-rows: subgrid;   /* use the parent's four rows */
  row-gap: 8px;                  /* tighter than the parent's 24px */
}
```

Two declarations do the work. `grid-row: span 4` makes each card occupy four rows of the parent grid. `grid-template-rows: subgrid` tells the card not to create its own rows but to use the four it spans. The card's four children (time, title, abstract, room) are placed into those parent rows in order.

Now the browser sizes each parent row by the tallest content placed in it *from every card in that row*. The title track grows to fit the three-line title, the shorter titles get the same track, and every abstract starts at the same line. Room labels line up at the bottom.

:::figure Without subgrid each card sizes its own rows; with subgrid they share the parent's rows
<svg viewBox="0 0 700 260" role="img" aria-labelledby="t1">
  <title id="t1">Left: three cards whose title blocks have different heights, so the room labels below sit at different heights. Right: the same three cards with shared row lines, so titles share one tall row and the room labels align.</title>
  <text class="d-label-strong" x="20" y="22">Own rows</text>
  <rect class="d-box" x="20" y="34" width="96" height="200" rx="8"/>
  <rect class="d-box" x="124" y="34" width="96" height="200" rx="8"/>
  <rect class="d-box" x="228" y="34" width="96" height="200" rx="8"/>
  <rect class="d-box-primary" x="28" y="44" width="80" height="24" rx="4"/>
  <rect class="d-box-primary" x="132" y="44" width="80" height="48" rx="4"/>
  <rect class="d-box-primary" x="236" y="44" width="80" height="72" rx="4"/>
  <rect class="d-box-accent" x="28" y="76" width="80" height="20" rx="4"/>
  <rect class="d-box-accent" x="132" y="100" width="80" height="20" rx="4"/>
  <rect class="d-box-accent" x="236" y="124" width="80" height="20" rx="4"/>
  <text class="d-label-muted" x="40" y="252">rooms misaligned</text>
  <text class="d-label-strong" x="380" y="22">Subgrid rows</text>
  <rect class="d-box" x="380" y="34" width="96" height="200" rx="8"/>
  <rect class="d-box" x="484" y="34" width="96" height="200" rx="8"/>
  <rect class="d-box" x="588" y="34" width="96" height="200" rx="8"/>
  <path class="d-line d-dashed" d="M372 118 L692 118"/>
  <path class="d-line d-dashed" d="M372 152 L692 152"/>
  <rect class="d-box-primary" x="388" y="44" width="80" height="24" rx="4"/>
  <rect class="d-box-primary" x="492" y="44" width="80" height="48" rx="4"/>
  <rect class="d-box-primary" x="596" y="44" width="80" height="72" rx="4"/>
  <rect class="d-box-accent" x="388" y="124" width="80" height="20" rx="4"/>
  <rect class="d-box-accent" x="492" y="124" width="80" height="20" rx="4"/>
  <rect class="d-box-accent" x="596" y="124" width="80" height="20" rx="4"/>
  <text class="d-label-muted" x="420" y="252">rows shared, aligned</text>
</svg>
:::

Notice that the parent never declares `grid-template-rows`. It doesn't need to: the cards' spans create implicit rows, and those rows are sized from the content the subgrids place in them. Every new row of cards gets its own four tracks, so cards in the second visual row align with each other but not with the first row, which is what you want.

:::mistake Forgetting the span
`grid-template-rows: subgrid` on a card that spans one parent row gives the subgrid one track to share. A subgrid can't create extra rows in the subgridded direction, so all four children are placed into that single row and pile on top of each other. The span must match the number of parts. If cards vary in parts (some have no abstract), keep the slots and leave the empty ones empty, or give the missing part an explicit row with `grid-row`.
:::

## Gaps, lines and columns

A subgrid inherits the parent's `gap`. Here the parent uses 24px between cards, which is far too much between a title and its abstract, so the card overrides `row-gap` for its own tracks. The space *between* cards is unaffected.

Subgrid works on columns too. A classic case on Waypoint is the speaker profile form: labels in one column, inputs in the next, and every label column the same width across several fieldsets. Making each fieldset `grid-column: span 2; grid-template-columns: subgrid` gives every fieldset the outer form's columns, so labels align all the way down. Named grid lines from the parent are also visible inside the subgrid, so `grid-column: content-start / content-end` keeps working one level down.

:::why Why this matters
Before subgrid, card alignment was a design request front-end developers had to push back on or fake. Subgrid has been Baseline since September 2023 (Chrome 117, Firefox 71, Safari 16) and widely available since March 2026, so you can say yes. In an old browser the cards fall back to normal stacked grids: still readable, just not aligned.
:::

## Your turn

The exercise gives you three session cards with titles of different lengths. Turn each card into a row subgrid so that abstracts and room labels line up across the row. The checks compare the vertical positions of those parts across cards. The next lesson stays with sizing: `min()`, `max()`, `clamp()` and the keywords that let content decide how big things are.
