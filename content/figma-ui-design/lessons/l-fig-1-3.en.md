---
summary: Define a small type scale with a job for every size, build a color palette from roles instead of favourites, and check every text and control pair against WCAG contrast ratios.
takeaways:
  - A type scale is a short, fixed list of sizes and line heights, each with a named job; you pick from the list instead of inventing sizes.
  - Two or three font weights are enough for a whole app; more weights add noise, not hierarchy.
  - Build color from roles (text, surface, border, primary action, success, danger) and use the accent sparingly so it keeps its meaning.
  - WCAG AA needs 4.5:1 for normal text, 3:1 for large text, and 3:1 for the visible boundaries of controls and meaningful graphics.
  - Check contrast while you design with Figma's color picker, not after a stakeholder complains.
further:
  - title: Understanding SC 1.4.3 Contrast (Minimum)
    url: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
  - title: Understanding SC 1.4.11 Non-text Contrast
    url: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
  - title: Update fills using the color picker (Figma)
    url: https://help.figma.com/hc/en-us/articles/360041003774-Update-fills-using-the-color-picker
  - title: WebAIM Contrast Checker
    url: https://webaim.org/resources/contrastchecker/
quiz:
  - q: "Steady's primary button is a bright teal, #14B8A6, with a white 17 px label. The contrast ratio is 2.49:1. What should you do?"
    options:
      - text: Keep it, because buttons only need 3:1.
        why: The 3:1 rule covers the button's shape against its background. The label is text, so it needs 4.5:1 at this size.
      - text: Make the label bold, which turns it into large text.
        why: Bold text counts as large from about 18.66 px (14 pt). At 17 px it is still normal text, and 2.49:1 fails even the large-text bar.
      - text: Darken the teal, for example to #0F766E, which gives 5.47:1 with white.
        why: Correct. Darkening the fill keeps the brand hue and lifts the label well past 4.5:1.
      - text: Add a drop shadow behind the label.
        why: Shadows blur the letter edges and are not counted in the contrast ratio. Fix the colors themselves.
    answer: 2
  - q: Why does a type scale use a small fixed set of sizes instead of whatever looks right on each screen?
    options:
      - text: Figma cannot store more than six text styles per file.
        why: Figma has no such limit. The constraint is a design choice, not a tool limit.
      - text: Repeated sizes make the rank of each text predictable across screens, and developers can map them to named styles.
        why: Correct. Consistency is what lets people learn the hierarchy once and reuse it everywhere.
      - text: Fewer sizes make the app load faster.
        why: Font sizes have no meaningful performance cost. The benefit is consistency.
      - text: Accessibility rules forbid more than six sizes.
        why: WCAG says nothing about how many sizes you use. It cares about contrast, resizing and readability.
    answer: 1
  - q: The empty text field in the New habit sheet shows hint text in #9CA3AF on white, a ratio of 2.54:1. Why is this a problem?
    options:
      - text: Hint text is decorative, so it should be even lighter.
        why: Hint text often carries instructions people need to read, so it should still be legible.
      - text: It is not a problem, because the field's border already meets 3:1.
        why: Border contrast helps people find the field, but it does nothing for reading the text inside it.
      - text: It only matters in dark mode.
        why: The ratio is measured in light mode here and it already fails.
      - text: Many people cannot read 2.54:1 text, so a hint that carries meaning is effectively invisible to them.
        why: Correct. Text that carries meaning needs 4.5:1. If the hint matters, darken it; better still, put the instruction in a visible label.
    answer: 3
  - q: Which palette plan best supports a clear hierarchy on the Today screen?
    options:
      - text: Neutrals for text and surfaces, one teal for primary actions, and green and red reserved for success and errors.
        why: Correct. With the accent used only for actions, the eye learns that teal means "tap this".
      - text: A different color for each habit row so the list feels lively.
        why: Rainbow rows compete with the check buttons and leave no color free to signal state.
      - text: Teal for headings, buttons, icons, borders and links so the brand is everywhere.
        why: When everything is teal, teal stops meaning anything. The accent loses its power to point at actions.
    answer: 0
---

Open the text styles of a file that grew without a plan and you will find 13 px, 14 px, 14.5 px, 15 px and 16 px body text, each used once or twice. Nobody chose them; they drifted in. The result is a screen where hierarchy feels slightly off everywhere, and nobody can say why.

A type scale and a role-based palette are how you stop the drift. You decide the sizes and colors once, give each a job, and then every screen picks from the list.

## A type scale with jobs

A type scale is a short list of text sizes, each paired with a line height and weight. For a phone app, it helps to start near the platform's defaults because people's eyes are already tuned to them. Steady's scale borrows most of its sizes from Apple's default text styles, rounds line heights to multiples of 4, and uses 13 px (Apple's footnote size) for captions:

| Role | Size / line height | Weight | Used for |
|---|---|---|---|
| Large title | 34 / 40 | Bold | Screen title on the Today screen |
| Title | 28 / 36 | Semibold | Habit detail title |
| Headline | 17 / 24 | Semibold | Habit names, button labels |
| Body | 17 / 24 | Regular | Descriptions, form input |
| Subhead | 15 / 20 | Regular | Progress line, secondary info |
| Caption | 13 / 16 | Regular | Single-line streak counts, tab labels |

Notice what the table does. Each step is big enough to read as a different rank. Headline and Body share a size and differ only in weight, which is how you rank text without adding another size. Line heights are about 1.4× for running text and tighter for big titles, because large text with loose line height falls apart into separate lines.

:::figure Steady's type scale: size and weight both carry rank
<svg viewBox="0 0 680 300" role="img" aria-labelledby="t1">
  <title id="t1">Six sample lines from largest to smallest: Large title 34, Title 28, Headline 17 semibold, Body 17 regular, Subhead 15 and Caption 13, each labelled with its size.</title>
  <text class="d-label-strong" x="20" y="50" style="font-size:34px">Today</text>
  <text class="d-label-muted" x="660" y="48" text-anchor="end">Large title 34/40</text>
  <text class="d-label-strong" x="20" y="100" style="font-size:28px">Read 20 pages</text>
  <text class="d-label-muted" x="660" y="96" text-anchor="end">Title 28/36</text>
  <text class="d-label-strong" x="20" y="148" style="font-size:17px">Drink water</text>
  <text class="d-label-muted" x="660" y="146" text-anchor="end">Headline 17/24 semibold</text>
  <text class="d-label" x="20" y="186" style="font-size:17px">Two glasses before lunch</text>
  <text class="d-label-muted" x="660" y="184" text-anchor="end">Body 17/24 regular</text>
  <text class="d-label" x="20" y="224" style="font-size:15px">3 of 5 done</text>
  <text class="d-label-muted" x="660" y="222" text-anchor="end">Subhead 15/20</text>
  <text class="d-label-muted" x="20" y="260" style="font-size:13px">12-day streak</text>
  <text class="d-label-muted" x="660" y="258" text-anchor="end">Caption 13/16</text>
  <path class="d-line" d="M20 280 L660 280"/>
</svg>
:::

Two or three weights are enough: Regular, Semibold and Bold here. Each extra weight is one more thing to keep consistent, and readers cannot tell Medium from Semibold at a glance anyway.

In Figma you save each row as a **text style** (Lesson 3.3 compares styles with variables). Name styles by role, `Headline` or `Caption`, not by value like `17 Semibold`, so you can adjust a size later without the name lying.

## Color from roles, not favourites

Picking colors you like produces a mood board. Picking colors for roles produces a usable palette. Start from the jobs color does on a screen:

- **Text**: primary text (near-black, #1A1A1A) and secondary text (grey, #6B7280).
- **Surfaces**: the page (#FFFFFF) and raised areas like cards or sheets.
- **Borders and dividers**: light grey (#E5E7EB).
- **Primary action**: Steady's teal (#0F766E). It appears on check buttons and the main button, and almost nowhere else.
- **Status**: green for success and red for errors, used only for those meanings.

Restraint is the point. If teal only appears on things you can tap, people learn "teal means tap" within seconds. Paint headings, icons and borders teal too and that lesson becomes impossible to learn.

## Contrast: the numbers that matter

Contrast ratio compares the relative luminance of two colors, from 1:1 (identical) to 21:1 (black on white). The Web Content Accessibility Guidelines (WCAG) 2.2 set the thresholds most teams design to, level AA:

- **4.5:1** for normal text.
- **3:1** for large text: at least 24 px regular, or about 18.66 px bold (18 pt and 14 pt).
- **3:1** for the visible parts of controls and meaningful graphics, such as a checkbox outline or a progress ring against its background.

Level AAA raises normal text to 7:1. Teams usually aim for AA everywhere and AAA for long reading text.

Steady's colors measured against white: primary text #1A1A1A gives 17.40:1, secondary grey #6B7280 gives 4.83:1 (passes, narrowly), and teal #0F766E gives 5.47:1, so a white label on a teal button passes too.

:::mistake The pretty teal that fails
The first brand teal was #14B8A6, bright and friendly. With a white label it measures 2.49:1, a fail for any text. Light greys for hint text fail the same way: #9CA3AF on white is 2.54:1. Choose the darker shade for anything that carries text, and save the bright one for large illustrations or backgrounds behind dark text.
:::

Figma has a contrast checker built into the color picker. At the time of writing, you select a text layer, open its fill color, click **Check color contrast**, and Figma shows the ratio against what sits behind the layer, with AA and AAA marks and a one-click fix to the nearest passing color. Use it as you pick colors, not as an audit at the end.

:::tip Check both directions
A color that passes on white may fail on your grey card background. Check every text color against every surface it actually sits on, including the pressed and disabled states you add later.
:::

You now have rules for rank (type), meaning (color) and legibility (contrast). Next you put them on the canvas: frames, groups, layers and constraints, the raw material of every Figma screen.
