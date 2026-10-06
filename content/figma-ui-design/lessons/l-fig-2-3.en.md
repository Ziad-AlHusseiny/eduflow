---
summary: Add column layout guides to Steady's screens, adopt an 8-point spacing scale with a 4-point half step, and use both to make every gap, padding and size a decision you can name.
takeaways:
  - Layout guides (formerly called layout grids) are visual aids on a frame; columns, rows and a uniform grid help you align, but they do not move anything for you.
  - A phone layout usually needs a 4-column guide with fixed side margins and gutters; tablets and desktop use more columns.
  - An 8-point system limits spacing and sizes to multiples of 8, with 4 as a half step, so values scale cleanly and stay consistent.
  - A short named spacing scale turns arguments about 14 versus 15 pixels into picking the right step.
  - Line heights on multiples of 4 keep text blocks in rhythm with the rest of the layout.
further:
  - title: Create layout guides
    url: https://help.figma.com/hc/en-us/articles/360040450513-Create-layout-guides
  - title: Combine layout guides and constraints
    url: https://help.figma.com/hc/en-us/articles/360039957934-Combine-layout-guides-and-constraints
  - title: Grids and spacing (Material Design 3)
    url: https://m3.material.io/foundations/layout/understanding-layout/spacing
quiz:
  - q: A teammate's habit card uses 14 px padding, a 10 px gap and 22 px between cards. You switch to Steady's 8-point scale. What is the best mapping?
    options:
      - text: 14, 10 and 22 stay, because the scale only applies to new work.
        why: Mixed systems are how drift starts. Bring old values onto the scale when you touch them.
      - text: Round everything to 16, so all three gaps match.
        why: Equal spacing erases grouping. Internal and external gaps need different steps.
      - text: Padding 16, gap 8, and 24 between cards.
        why: Correct. Each value moves to a neighbouring step on the scale, and the result keeps inside-smaller-than-outside spacing (8, then 16, then 24).
      - text: Padding 12, gap 12, and 12 between cards.
        why: All gaps are equal again, so cards and their contents blur together.
    answer: 2
  - q: What do Figma's layout guides do when you resize a frame?
    options:
      - text: They move each child into the nearest column automatically.
        why: Guides never move layers by themselves. Constraints and auto layout do the moving.
      - text: They recalculate columns (for Stretch columns), and children constrained to columns follow if you set their constraints that way.
        why: Correct. Stretch columns change width with the frame, and constraints relative to columns let children follow them.
      - text: Nothing, because layout guides are a static image.
        why: Stretch columns do resize with the frame, which is what makes them useful for responsive work.
      - text: They delete themselves if the frame becomes too narrow.
        why: Guides are not removed when resizing; they just get tighter.
    answer: 1
  - q: Why do many teams pick 8 as the base unit rather than 5 or 10?
    options:
      - text: Multiples of 8 divide evenly at the common 1.5×, 2× and 3× display densities and match many device dimensions.
        why: Correct. 8 × 1.5 = 12 whole pixels, while 5 × 1.5 = 7.5 leaves half pixels that blur edges.
      - text: Figma's nudge is fixed at 8 px and cannot be changed.
        why: Figma's big nudge defaults to 10 px and can be changed in preferences. Tooling is not the reason.
      - text: WCAG requires spacing in multiples of 8.
        why: WCAG has spacing rules for text adjustments, not a base unit for layout.
      - text: Screens render faster when sizes are divisible by 8.
        why: There is no rendering speed benefit. The benefit is clean scaling and fewer decisions.
    answer: 0
---

Ask three designers to space the same habit card and you get 14, 15 and 16 px of padding. None of them is wrong in isolation. Together, across forty screens, they make an app that feels slightly unsteady, the visual equivalent of a table with one short leg.

Two tools prevent this. Layout guides give every screen the same skeleton to align to, and a spacing system limits which numbers you are allowed to use.

## Layout guides

At the time of writing, Figma calls these **layout guides**; older tutorials call them layout grids. They are visual aids attached to a frame: you see them while designing, they never appear in exports, and they do not move anything by themselves. Select a frame and add one from the layout guide section of the right sidebar.

There are three types:

- **Columns**: vertical bands that span the frame's height. The workhorse for screen layouts.
- **Rows**: horizontal bands, useful for rhythm in long scrolling content.
- **Uniform grid**: a square grid, useful for drawing icons and checking small alignments.

Columns and rows have four properties. **Count** is how many. **Type** decides how they sit: **Stretch** makes them grow with the frame, while Left, Center and Right keep fixed-width columns anchored to that side. **Margin** is the space between the outer columns and the frame edges. **Gutter** is the space between columns.

For Steady's phone screens, use a 4-column Stretch guide with a 20 px margin and a 16 px gutter.

:::figure A 4-column stretch guide on Steady's Today screen
<svg viewBox="0 0 680 320" role="img" aria-labelledby="t1">
  <title id="t1">A phone frame with four stretching columns, 20 pixel margins at both sides and 16 pixel gutters between columns. The habit list spans all four columns; two stat cards each span two columns.</title>
  <rect class="d-box" x="190" y="10" width="300" height="300" rx="20"/>
  <rect class="d-box-warn" x="206" y="10" width="58" height="300"/>
  <rect class="d-box-warn" x="276" y="10" width="58" height="300"/>
  <rect class="d-box-warn" x="346" y="10" width="58" height="300"/>
  <rect class="d-box-warn" x="416" y="10" width="58" height="300"/>
  <rect class="d-box-primary" x="206" y="40" width="268" height="40" rx="8"/>
  <text class="d-label" x="340" y="65" text-anchor="middle">Habit list: 4 columns</text>
  <rect class="d-box-accent" x="206" y="100" width="128" height="70" rx="8"/>
  <text class="d-label" x="268" y="140" text-anchor="middle">Stat: 2</text>
  <rect class="d-box-accent" x="346" y="100" width="128" height="70" rx="8"/>
  <text class="d-label" x="410" y="140" text-anchor="middle">Stat: 2</text>
  <path class="d-line" d="M190 230 L206 230"/>
  <text class="d-label-muted" x="180" y="235" text-anchor="end">margin 20</text>
  <path class="d-line" d="M264 260 L276 260"/>
  <text class="d-label-muted" x="270" y="290" text-anchor="middle">gutter 16</text>
  <path class="d-line" d="M474 230 L490 230"/>
  <text class="d-label-muted" x="500" y="235">margin 20</text>
</svg>
:::

Most phone content spans all four columns; the guide earns its keep when you split the width, such as two stat cards side by side on the Habit detail screen, each spanning two columns. On a tablet you would switch to 8 or 12 columns with wider margins. You can save a guide as a style so every screen uses the same one.

## The 8-point system

An 8-point system says: spacing and component sizes are multiples of 8, with 4 allowed as a half step for small details. The reasons are practical, not mystical:

- **Clean scaling.** Phones render at 2× or 3× density, and some Android devices at 1.5×. Multiples of 8 stay whole pixels at every density: 8 × 1.5 = 12. A 5 px gap becomes 7.5, which blurs.
- **Fewer decisions.** Choosing between 16 and 24 is fast. Choosing between 14, 15, 16, 17 and 18 is a debate.
- **A shared vocabulary.** A developer reads "16" in Dev Mode, matches it to a spacing token, and nobody wonders whether 15 was intentional.

Steady's spacing scale is short and named:

```text
space-1    4   icon-to-label, name-to-streak
space-2    8   between habit rows, between chips
space-3   12   inside rows, gap between row elements
space-4   16   card padding, gutter
space-5   20   screen side margin
space-6   24   between blocks on a screen
space-8   32   between the header and the content
space-12  48   tap height of the Save habit button
```

You may notice 12 and 20 are not multiples of 8. That is the half-step rule at work: 4-point increments are allowed where 8 is too coarse, and many teams, including the people behind Material Design, work this way. What matters is that the list is short and everyone uses it. The names (`space-4` means 16) become variables in Section 3, so the scale lives in the file, not in someone's memory.

Text gets the same treatment: the line heights in Steady's type scale (24, 20, 16) are multiples of 4, so a text block's height always lands on the grid and sits in rhythm with padding around it.

:::mistake Off-scale values creeping in
Values like 13, 18 or 22 rarely come from a decision. They come from dragging a layer until it looked right, or from copying a frame from another file. Before handoff, select frames and read their gap and padding; anything off the scale is either a mistake or deserves a written reason.
:::

:::tip Make the keyboard agree with the system
Shift plus an arrow key nudges by 10 px by default. At the time of writing you can change the big nudge to 8 in Figma's preferences (Nudge amount), so keyboard moves land on the system.
:::

The grid serves you, not the other way round. A play icon inside a circle looks off-center when it is mathematically centered, because its visual weight sits left; designers nudge it 1 or 2 px right on purpose. That is an optical correction with a reason, which is exactly what the system allows.

Next you put the layout guides, auto layout and constraints together and make one screen work from a small phone to a large one.
