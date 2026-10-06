---
summary: Combine constraints for fixed elements with auto layout for content so one Steady screen adapts from a small phone to a large one, and test it with resized copies and stress content.
takeaways:
  - Use constraints for things pinned to the screen edges (tab bar, floating button) and auto layout for the content that flows.
  - Design at one mid-size width, then prove the screen at the smallest and largest widths you support.
  - Keep content clear of the status bar and home indicator areas, and use a platform UI kit for their exact sizes.
  - Grid auto layout handles two-dimensional content such as stat cards, and the column count can change between breakpoints.
  - Stress-test with long text, larger text sizes and empty states, because real content breaks layouts more often than screen widths do.
further:
  - title: Combine vertical, horizontal, and grid auto layout flows
    url: https://help.figma.com/hc/en-us/articles/31441443713047-Combine-vertical-horizontal-and-grid-auto-layout-flows
  - title: Use the grid auto layout flow
    url: https://help.figma.com/hc/en-us/articles/31289469907863-Use-the-grid-auto-layout-flow
  - title: Layout (Apple Human Interface Guidelines)
    url: https://developer.apple.com/design/human-interface-guidelines/layout
quiz:
  - q: "Steady's Today screen is one big vertical auto layout frame containing header, list and tab bar. On a tall phone the tab bar ends up halfway down the screen, right under the last habit. Why?"
    options:
      - text: Auto layout places the tab bar directly after its siblings, so it follows the content instead of the screen's bottom edge.
        why: Correct. In a flow the tab bar's position depends on what comes before it. Pinning to an edge is a constraint's job.
      - text: The tab bar needs the Scale constraint.
        why: Scale would resize the bar proportionally and still not anchor it to the bottom.
      - text: Tall phones need a separate design file.
        why: One screen can serve many heights. Separate files multiply maintenance.
      - text: The layout guide has too few rows.
        why: Layout guides never move layers. They are visual aids only.
    answer: 0
  - q: What is the most efficient way to check that a screen works across phone sizes?
    options:
      - text: Redraw the screen from scratch at each width.
        why: Redrawing tests nothing about whether your one design adapts, and it creates copies that drift apart.
      - text: Zoom the canvas in and out.
        why: Zoom changes your view, not the frame's size, so constraints and resizing never run.
      - text: Ask developers to tell you if it breaks.
        why: Finding layout bugs after build costs far more than resizing a frame now.
      - text: Duplicate the frame and resize the copies to your narrowest and widest supported widths.
        why: Correct. Resizing runs every constraint and auto layout rule, so bugs show up immediately.
    answer: 3
  - q: On Habit detail, four stat cards sit in two columns on phones. On tablets you want four in one row. Which tool fits best?
    options:
      - text: A horizontal auto layout with wrap and fixed-width cards.
        why: Wrap can work, but fixed-width cards leave ragged gaps at most widths. Grid keeps columns even.
      - text: Grid auto layout, with 2 columns on the phone frame and 4 on the tablet frame.
        why: Correct. Grid places items in even rows and columns, and changing the column count rearranges the same cards.
      - text: Four separate frames placed by hand with constraints.
        why: Manual placement must be redone for every size and every new card.
      - text: A vertical auto layout with a negative gap.
        why: Negative gaps overlap items; they do not create columns.
    answer: 1
---

Steady will run on phones from roughly 360 to 440 points wide, and heights vary even more. Designing a separate screen for each size is a maintenance trap: change the habit row on one and you must remember to change it on four others. The goal is one screen that adapts, built from the pieces you already have.

## Two kinds of things on a screen

Look at the Today screen and sort its parts into two kinds.

**Things pinned to the screen**: the tab bar at the bottom, the floating add button in the corner. They should stay attached to an edge no matter what the content does. That is the job of **constraints** (Lesson 1.4).

**Things that flow**: the header, the progress block and the habit list. They stack one after another, and the list grows with every habit. That is the job of **auto layout** (Lessons 2.1 and 2.2).

The structure that follows is simple and works for most app screens:

:::figure One screen frame, two layout systems
<svg viewBox="0 0 680 300" role="img" aria-labelledby="t1">
  <title id="t1">The Today screen frame is a regular frame. Inside it, a Content frame uses vertical auto layout and holds header, progress and habit list; it is constrained left and right, top and bottom. The tab bar is constrained left and right plus bottom, and the add button right plus bottom.</title>
  <rect class="d-box" x="20" y="20" width="300" height="260" rx="16"/>
  <text class="d-label-strong" x="36" y="44">Today (frame, no auto layout)</text>
  <rect class="d-box-primary" x="36" y="56" width="268" height="150" rx="10"/>
  <text class="d-label" x="48" y="78">Content: vertical auto layout</text>
  <rect class="d-box" x="48" y="88" width="244" height="24" rx="4"/>
  <text class="d-label-muted" x="56" y="105">Header</text>
  <rect class="d-box" x="48" y="118" width="244" height="24" rx="4"/>
  <text class="d-label-muted" x="56" y="135">Progress</text>
  <rect class="d-box" x="48" y="148" width="244" height="48" rx="4"/>
  <text class="d-label-muted" x="56" y="176">Habit list</text>
  <circle class="d-dot" cx="286" cy="226" r="12"/>
  <rect class="d-box-accent" x="36" y="244" width="268" height="28" rx="6"/>
  <text class="d-label" x="170" y="263" text-anchor="middle">Tab bar</text>
  <text class="d-label" x="360" y="90">Content</text>
  <text class="d-label-muted" x="360" y="110">constraints: L+R, Top+Bottom</text>
  <text class="d-label" x="360" y="160">Add button</text>
  <text class="d-label-muted" x="360" y="180">constraints: Right, Bottom</text>
  <text class="d-label" x="360" y="230">Tab bar</text>
  <text class="d-label-muted" x="360" y="250">constraints: L+R, Bottom</text>
  <path class="d-arrow" d="M352 98 L308 120" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M352 168 L300 222" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M352 238 L306 254" marker-end="url(#arrow)"/>
</svg>
:::

The screen frame itself has no auto layout. Inside it, the `Content` frame uses vertical auto layout and has constraints **Left and right, Top and bottom**, so it always fills the space between status bar and tab bar. The tab bar and add button are siblings of `Content` with edge constraints. Inside `Content`, everything uses Fill container width, so rows stretch with the screen.

:::mistake Putting everything in one auto layout stack
Wrapping the whole screen, tab bar included, in one vertical auto layout frame feels tidy. But in a flow, the tab bar sits right after the last habit. With three habits on a tall phone it floats mid-screen. Pinned things belong outside the flow, controlled by constraints.
:::

## Respect the system areas

Modern phones reserve space at the top for the status bar and camera cutout, and at the bottom for the home indicator. Content under them is hard to read or impossible to tap. Pad your `Content` frame's top and the tab bar's bottom so nothing important sits there. The exact sizes differ between devices, so take them from the official Apple or Google UI kits in the Figma Community rather than guessing.

## Two-dimensional content: grid flow

The Habit detail screen shows four stat cards: current streak, best streak, completion rate and total check-ins. On a phone they sit in two columns; on a tablet, four across.

At the time of writing, auto layout has a **Grid** flow for exactly this. A grid auto layout frame has a number of columns and rows, gaps between them, and children that can span more than one cell. Set the stats frame to 2 columns with 16 px gaps (matching the layout guide's gutter) on the phone; on the tablet copy, change it to 4 columns. The same four cards rearrange without being redrawn.

Wrap (Lesson 2.2) would also put cards on new lines, but with wrap each card keeps its own width, so you get ragged leftovers. Grid keeps columns equal, which is what a dashboard of stats needs.

## The resize ritual

Before Sofia accepts a screen, she runs the same test, and you should too:

1. Duplicate the screen frame twice.
2. Resize one copy to 360 wide and the other to 440 wide, and adjust heights to a short and a tall phone.
3. Read every copy top to bottom. Look for overlaps, truncation you did not intend, things floating mid-screen and gaps that grew strangely.
4. Fix the original, not the copies. Delete the copies when the original passes.

Then stress the content, because content breaks more layouts than widths do. Use a 40-character habit name, a four-digit streak and an empty list ("No habits yet"). Finally, increase every text style by about 30% on a copy. Many people set larger text in their phone's settings, and a row that only works at 17 px will break for them first.

:::tip Breakpoints are content decisions
When a layout stops working as the frame widens, that width is your breakpoint, not a number from a device list. If the habit list gets uncomfortably long-lined at 600 px, that is where a tablet layout with a side panel should begin.
:::

Section 2 is done: your screens stack, stretch, wrap and pin correctly. In Section 3 you stop rebuilding the habit row on every screen and turn it into a component.
