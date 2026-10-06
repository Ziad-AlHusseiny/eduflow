---
summary: Add Light and Dark modes to Steady's semantic variables, switch whole screens between them, and re-check contrast so dark mode is designed rather than inverted.
takeaways:
  - A mode is one column of values in a variable collection; switching a frame's mode swaps every bound value at once.
  - Put modes on the semantic collection and keep primitives single-mode, so dark mode only changes what each meaning points at.
  - Layers use the Auto mode by default and inherit from their nearest parent with a mode set, falling back to the collection's default.
  - Dark mode is not inversion; accents usually get lighter, text on accents may flip to dark, and surfaces get lighter as they rise.
  - Every text and control color needs a fresh contrast check in each mode, because a pair that passes in light can fail in dark.
further:
  - title: Modes for variables
    url: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables
  - title: Variable modes in prototypes
    url: https://help.figma.com/hc/en-us/articles/15253268379799-Variable-modes-in-prototypes
  - title: Dark Mode (Apple Human Interface Guidelines)
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
quiz:
  - q: You set the Today frame to Dark. One habit row inside it has its mode explicitly set to Light. What do you see?
    options:
      - text: The whole screen is dark, and that one row renders with Light values.
        why: Correct. Layers inherit from the nearest parent with a mode set. An explicit mode on the row overrides the frame's for that row and its children.
      - text: The whole screen including the row is dark, because the frame's mode always wins.
        why: The nearest explicit mode wins, not the outermost one.
      - text: Figma shows an error because modes conflict.
        why: Mixing modes is allowed and useful, for example a light card inside a dark promo area.
      - text: The row turns light and so does the rest of the screen.
        why: A child's mode never changes its parent's.
    answer: 0
  - q: "In dark mode, `color/action/primary` points at teal/400 (#2DD4BF) and the button label uses `color/on-action`, still white. The label measures 1.86:1. What is the right fix?"
    options:
      - text: Point action/primary back at teal/700 in dark mode.
        why: Teal/700 on the dark surface is only 3.24:1, so the check buttons would lose contrast instead.
      - text: Add a text shadow to the label in dark mode.
        why: Shadows do not count toward contrast and blur the text.
      - text: Point on-action's Dark value at a near-black such as gray/950, which gives 9.53:1 on teal/400.
        why: Correct. That is why on-action is its own semantic token. Its value can flip from white to dark per mode.
      - text: Make the label bold so it counts as large text.
        why: Even large text needs 3:1, and 1.86:1 fails that too.
    answer: 2
  - q: Why do the primitives (teal/700, gray/500...) stay in a collection with a single mode?
    options:
      - text: Figma does not allow modes on collections with more than 20 variables.
        why: There is no such limit. The choice is architectural.
      - text: Primitives are raw facts about the palette. Meanings change per mode by aliasing different primitives.
        why: Correct. If teal/700 changed per mode, it would no longer be teal/700, and every alias would become unpredictable.
      - text: Primitives cannot be aliased if they have modes.
        why: Variables with modes can still be aliased. The reason is clarity, not a technical rule.
      - text: Dev Mode only reads single-mode collections.
        why: Dev Mode shows variables from any collection, including their modes.
    answer: 1
---

The quickest way to make dark mode is to duplicate every screen and recolor it by hand. It is also the quickest way to have two sets of screens that disagree within a month: someone adds a habit row to the light Today screen and forgets the dark one. In Steady, dark mode will be one switch on a frame, because the colors already point at meanings.

## Modes are columns of values

Open your local variables (reached from the right sidebar with nothing selected, at the time of writing) and look at the `Semantic` collection. It has one column of values, named `Mode 1` by default. Rename it `Light`, then add a mode and call it `Dark`. Every variable now has two values: one per column. Figma copies the existing values into the new column, which is a starting point, not an answer.

Fill in the Dark column by aliasing different primitives. Here is Steady's mapping, with contrast measured against the surface each color sits on:

| Semantic variable | Light | Dark |
|---|---|---|
| `color/surface/default` | white | gray/950 (#111827) |
| `color/surface/raised` | white | gray/800 (#1F2937) |
| `color/text/primary` | gray/900, 17.40:1 | gray/50, 16.98:1 |
| `color/text/secondary` | gray/500, 4.83:1 | gray/400, 6.99:1 |
| `color/action/primary` | teal/700, 5.47:1 | teal/400, 9.53:1 |
| `color/on-action` | white | gray/950 |

Keep the `Primitives` collection at one mode. A primitive is a fact (`teal/700` is #0F766E); a semantic variable is a decision that depends on context. Modes belong to decisions.

:::figure The same semantic variable resolves to different primitives per mode
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">The semantic variable action primary sits in the middle. In Light mode it points to teal 700; in Dark mode it points to teal 400. The check button bound to it shows dark teal on a light screen and light teal on a dark screen.</title>
  <rect class="d-box" x="20" y="40" width="150" height="44" rx="8"/>
  <text class="d-code" x="95" y="67" text-anchor="middle">teal/700</text>
  <rect class="d-box" x="20" y="140" width="150" height="44" rx="8"/>
  <text class="d-code" x="95" y="167" text-anchor="middle">teal/400</text>
  <rect class="d-box-primary" x="250" y="88" width="180" height="48" rx="10"/>
  <text class="d-code" x="340" y="117" text-anchor="middle">action/primary</text>
  <path class="d-arrow" d="M248 104 L172 66" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M248 122 L172 160" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="205" y="72" text-anchor="middle">Light</text>
  <text class="d-label-muted" x="205" y="164" text-anchor="middle">Dark</text>
  <rect class="d-box" x="500" y="30" width="160" height="70" rx="12"/>
  <circle class="d-dot" cx="530" cy="65" r="12"/>
  <text class="d-label" x="552" y="70">Light row</text>
  <rect class="d-box-accent" x="500" y="126" width="160" height="70" rx="12"/>
  <circle class="d-dot" cx="530" cy="161" r="12"/>
  <text class="d-label" x="552" y="166">Dark row</text>
  <path class="d-arrow" d="M432 104 L498 70" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M432 120 L498 156" marker-end="url(#arrow)"/>
</svg>
:::

## Switching a screen

Duplicate the Today frame and select the copy. In the right sidebar, use the variable mode control (in the Appearance section at the time of writing), pick the `Semantic` collection and choose `Dark`. Every bound fill, stroke and text color on the screen swaps at once.

That works because of inheritance. Every layer starts on **Auto**, which means "use my parent's mode". Figma walks up the layer tree until it finds a parent with a mode set, and if none has one, it uses the collection's default mode (the first column). You can also set a mode on a whole page with nothing selected.

Now the duplicate is not a copy you maintain; it is the same components viewed through a different mode. Add a habit row to the light screen and copy it into the dark one, and it is already dark.

:::note Plan availability
At the time of writing, the free Starter plan does not include variable modes; Professional allows up to 10 modes per collection and Organization up to 20. If you are on Starter, build the Dark column as a second collection to see the values side by side, and follow along with the reasoning.
:::

## Designing dark, not inverting

Dark mode is a design of its own. A few rules carry most of the weight:

- **Accents get lighter.** Teal/700 measures 5.47:1 on white but only 3.24:1 on gray/950. The dark accent has to be a lighter shade.
- **Text on accents may flip.** White on teal/400 is 1.86:1, a clear fail. That is why `color/on-action` exists as its own token: in Dark it points at gray/950, giving 9.53:1.
- **Elevation goes lighter, not darker.** Shadows barely show on dark backgrounds, so raised surfaces such as the New habit sheet use a slightly lighter gray (`surface/raised`).
- **Avoid harsh extremes.** Near-white text on near-black reads better for long sessions than pure white on pure black, which can glare.

:::mistake Trusting your light-mode contrast checks
Every pair you measured in Lesson 1.3 was measured on white. In dark mode the backgrounds changed, so the numbers changed. Switch each screen to Dark and re-run Figma's contrast checker on text, icons and control outlines. Pairs that pass in one mode routinely fail in the other.
:::

## Modes beyond color

Modes are not just for themes. A `Density` collection with `Comfortable` and `Compact` modes can hold number variables for row padding (12 versus 8) and row gap. A `Content` collection with string variables can hold the same labels in English and Arabic, which is a quick way to see whether "Save habit" still fits when it becomes longer. You can even switch modes inside a prototype, for example to demo the dark theme toggle in Settings.

You now have a themed, tokenised kit. The last lesson of this section organises it into something another designer, or a developer, can pick up and use without asking you.
