---
summary: Turn Steady's repeated habit row and check button into main components, place instances, override what may change per use, and keep changes flowing from one source.
takeaways:
  - A main component is the source; instances are linked copies that update when the main component changes.
  - Instances can override content and appearance, such as text, fills, visibility and nested instances, but not their layer structure.
  - An overridden property stops receiving updates for that property only, so override as little as possible.
  - Build small components first and nest them, so a fix to the check button reaches every row that contains it.
  - Detaching an instance cuts it off from future fixes; treat it as a last resort and usually a sign the component needs a new option.
further:
  - title: Guide to components in Figma
    url: https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma
  - title: Create components to reuse in designs
    url: https://help.figma.com/hc/en-us/articles/360038663154-Create-components-to-reuse-in-designs
quiz:
  - q: You change the corner radius of the main Habit row component from 12 to 16. Which rows update?
    options:
      - text: Only rows created after the change.
        why: Instances are live links. Existing instances update too, not just new ones.
      - text: Every instance whose radius has not been overridden.
        why: Correct. Instances follow the main component except for properties you overrode on that instance.
      - text: None, until you press a publish button in the same file.
        why: Within one file, changes reach instances immediately. Publishing is for sharing to other files through a library.
      - text: All rows, including detached ones.
        why: Detached rows are plain frames with no link, so they never receive updates.
    answer: 1
  - q: "A designer needs one habit row to show an extra \"note\" text line, so they detach the instance and add the text. What is the better long-term move?"
    options:
      - text: Detach every row so they all match.
        why: That throws away the whole component system. Every future fix would need to be repeated by hand.
      - text: Keep the detached copy and add a comment explaining it.
        why: A comment does not reconnect it. The copy will still drift as the component evolves.
      - text: Add an optional note layer to the main component and control its visibility per instance.
        why: Correct. When one use needs something new, the component usually needs a new option, not a one-off copy.
      - text: Duplicate the main component and edit the duplicate.
        why: Two near-identical main components split every future fix in two.
    answer: 2
  - q: Why build the Check button as its own component and nest it inside the Habit row component?
    options:
      - text: Figma only allows a component to contain other components.
        why: Components can contain any layers. Nesting is a choice for reuse, not a rule.
      - text: Nested components are cheaper to export.
        why: Export cost is not the reason. The benefit is a single source for the check button.
      - text: Nesting hides the check button from developers.
        why: Nesting makes structure clearer in Dev Mode, not hidden.
      - text: The check button also appears on Habit detail, so one main component keeps both places consistent.
        why: Correct. Fix its focus ring once and it updates in every row and every screen that uses it.
    answer: 3
---

By the end of Section 2 the habit row exists on the Today screen, twice on Habit detail ("Similar habits") and once in a search result. Then the brief changes: rows need a 16 px corner radius instead of 12. You find three of the four copies. The fourth ships with the old radius, and a sharp-eyed user posts a screenshot.

Components exist so that a design decision lives in one place.

## Main components and instances

Select the habit row frame and press `Cmd+Option+K` (`Ctrl+Alt+K` on Windows), or use the create component button in the toolbar. The frame becomes a **main component**, shown with a component icon in the layers panel. It is the source of truth. Move it to the `Kit` page you created in Lesson 1.1, so the screens hold only uses of it.

Every copy you place from now on is an **instance**: a linked copy. Drag one from the Assets panel, or copy the main component and paste it. Change the main component and every instance updates, in this file immediately and in other files once you publish it as a library (Lesson 3.5).

:::figure One main component feeds every instance; overrides sit on top
<svg viewBox="0 0 680 280" role="img" aria-labelledby="t1">
  <title id="t1">A main Habit row component on the Kit page sends updates to three instances on different screens. Each instance shows its own override: a different habit name, a hidden streak, and a swapped icon.</title>
  <rect class="d-box-primary" x="240" y="20" width="200" height="60" rx="12"/>
  <text class="d-label-strong" x="340" y="46" text-anchor="middle">Habit row</text>
  <text class="d-label-muted" x="340" y="68" text-anchor="middle">main component (Kit)</text>
  <path class="d-arrow" d="M300 80 L120 170" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 80 L340 170" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M380 80 L560 170" marker-end="url(#arrow)"/>
  <rect class="d-box" x="30" y="172" width="180" height="56" rx="10"/>
  <text class="d-label" x="120" y="196" text-anchor="middle">Instance: Today</text>
  <text class="d-label-muted" x="120" y="216" text-anchor="middle">text: Drink water</text>
  <rect class="d-box" x="250" y="172" width="180" height="56" rx="10"/>
  <text class="d-label" x="340" y="196" text-anchor="middle">Instance: Detail</text>
  <text class="d-label-muted" x="340" y="216" text-anchor="middle">streak hidden</text>
  <rect class="d-box" x="470" y="172" width="180" height="56" rx="10"/>
  <text class="d-label" x="560" y="196" text-anchor="middle">Instance: Search</text>
  <text class="d-label-muted" x="560" y="216" text-anchor="middle">icon swapped</text>
  <text class="d-label-muted" x="340" y="262" text-anchor="middle">Radius, padding and structure still come from the main component</text>
</svg>
:::

## Overrides: what an instance may change

Instances are not frozen. You can **override** content and appearance on any instance: change the text ("Read 20 pages" to "Drink water"), change a fill, hide a layer, or swap a nested instance for another component. Those are everyday edits and do not break the link.

What you cannot change on an instance is its **structure**. You cannot add a layer, delete one or reorder children; you can only hide what is there. (The one exception is a *slot*, an area a component author marks as open for free content, which you meet in the next lesson.) That limit is deliberate. Structure is the component's job, and if every instance could rearrange itself, there would be no component left.

Overrides have one important rule: **an overridden property stops following the main component**. If you changed one row's streak color to red for a "streak at risk" mock-up, and later the main component's streak color changes, that row keeps its red. Figma keeps your override because it assumes you meant it. To bring a property back in line, use reset overrides from the instance's options in the right sidebar.

:::mistake Overriding as a design method
Changing padding, colors and font sizes instance by instance produces a file where every row is subtly different, and each one has stopped receiving updates for whatever you touched. If you find yourself making the same override three times, the component needs a new option (next lesson), not more overrides.
:::

## Build small, then nest

Look at the habit row and find the pieces that appear elsewhere. The check button also appears on Habit detail. The habit icon, a rounded square with a glyph, appears in the New habit sheet's icon picker. Make those components first, then use their instances inside the Habit row component:

```text
Kit page
├─ Check button          main component
├─ Habit icon            main component
└─ Habit row             main component
   ├─ Habit icon         instance
   ├─ Text stack         frame
   │  ├─ Habit name      text
   │  └─ Streak          text
   └─ Check button       instance
```

Now a fix to the check button, say a clearer focus ring, reaches every habit row on every screen and the standalone button on Habit detail. Each level stays small enough to understand.

Name components the way you named layers: by role. Figma groups components in the Assets panel by slash names, so `Controls/Check button` and `Controls/Chip` appear together under Controls. Keep the structure shallow; two levels is usually enough for a kit this size.

## Detaching: the emergency exit

You can detach an instance (`Cmd+Option+B` / `Ctrl+Alt+B`), which turns it into a plain frame with no link. Sometimes that is right: a marketing illustration that borrows a row's look, or a one-time exploration on the `Scratch` page. On a product screen, a detached instance is a future bug. It will miss every fix, and nobody will remember it exists until a user posts a screenshot.

:::tip Find the source quickly
Right-click an instance and choose to go to its main component, and Figma jumps to the source even when it lives on another page. Use it whenever you are unsure whether you are editing the source or a copy.
:::

Your row is now one component with linked instances. But Steady needs the row in several states: unchecked, checked, and missed yesterday. Making a separate component for each would be the copy problem all over again. Variants and component properties solve that next.
