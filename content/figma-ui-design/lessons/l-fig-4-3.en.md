---
summary: Prepare Steady's screens for developers, mark them ready for dev, annotate behaviour and accessibility, and use Dev Mode's inspect, variables and change comparison to keep handoff a conversation.
takeaways:
  - Handoff starts with an organised file; sections per flow, named layers and components bound to variables do most of the work.
  - Ready for dev tells developers which designs are stable, and Figma flags a design as changed when someone edits it afterwards.
  - Dev Mode shows measurements, variables by name and code snippets, so developers read tokens instead of guessing from pixels.
  - Annotations carry what pixels cannot, such as behaviour, edge cases, accessible names and focus order.
  - Handoff is a conversation, so walk developers through the flow and review the built screens against the design.
further:
  - title: Guide to Dev Mode
    url: https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode
  - title: Dev Mode statuses and notifications
    url: https://help.figma.com/hc/en-us/articles/26781702258583-Dev-Mode-statuses-and-notifications
  - title: Add measurements and annotate designs
    url: https://help.figma.com/hc/en-us/articles/20774752502935-Add-measurements-and-annotate-designs-in-Dev-Mode
quiz:
  - q: "After marking the check-in flow Ready for dev, you change the habit row's padding. What does a developer see?"
    options:
      - text: Nothing, because Ready for dev freezes the design.
        why: Ready for dev is a signal, not a lock. Designers can still edit, and Figma records that they did.
      - text: The design shows as changed, and they can compare it with the version that was marked ready.
        why: Correct. The Changed status is applied automatically, and comparing versions shows exactly what moved.
      - text: Figma automatically reverts the edit.
        why: Figma never reverts your edits. It surfaces them so developers are not surprised.
      - text: The developer must unmark and remark the section to see edits.
        why: Developers see the latest design and the changed status without any extra steps.
    answer: 1
  - q: Which note belongs in an annotation rather than in the visual design?
    options:
      - text: The habit row's corner radius is 12.
        why: Dev Mode already shows the radius, and its variable, from the design. Annotating it adds noise.
      - text: The title font is the Large title style.
        why: The text style name is visible in Dev Mode. No annotation needed.
      - text: The screen background is white.
        why: The fill and its variable are visible in Dev Mode. Annotations are for what cannot be seen.
      - text: Habit names wrap to two lines, then truncate with an ellipsis; the add button's accessible name is "Add habit".
        why: Correct. Wrapping rules and accessible names are behaviour you cannot read from a static frame.
    answer: 3
  - q: In Dev Mode a developer sees the check button's fill as `color/action/primary` rather than only #0F766E. Why does that matter?
    options:
      - text: The developer can use the matching token in code, so dark mode and future palette changes work automatically.
        why: Correct. Variables in Dev Mode connect the design to the token system the code already uses.
      - text: Hex codes are not allowed in production code.
        why: Hex codes work in code. The problem is that a copied hex never updates with the theme.
      - text: It makes the file load faster in Dev Mode.
        why: Performance is not the reason. The value is the shared name.
    answer: 0
---

A developer opens Steady's file for the first time. Without help, they face sixty frames, three explorations of the Today screen and a page called `Scratch`, and they have to guess which version is real, what happens when a name is too long and whether that teal is a token or a one-off. Every guess becomes a bug, a Slack thread, or both.

Handoff is the work of removing those guesses. Most of it you have already done: named layers, auto layout, components with properties, variables. This lesson adds the last layer.

## Organise for the reader

Before anything else, make the file easy to navigate for someone who was not there:

- Move explorations off the `Screens` page. Developers should only see what will be built.
- Group screens into **sections** by flow: "Check-in", "Add habit", "Habit detail". Arrange each flow left to right in the order people move through it.
- Include the states, not just the happy path: empty Today ("No habits yet"), a habit with a 1,000-day streak, the text field's error state, the loading state of Habit detail.
- Give each section a one-line description at the top: what the flow is for and any open questions.

## Ready for dev

When a flow is stable, select its section and mark it **Ready for dev**. At the time of writing, you can do this on sections, frames and components, and it is available on paid plans.

Statuses are a signal, not a lock. If you edit a design after marking it ready, Figma marks it **Changed** automatically, so developers know to look again, and they can compare the current version with the one that was marked ready. When you have finished changing it, you mark it done with changes and can add a short note. On Organization and Enterprise plans there is also a **Completed** status for designs that have been built.

:::figure Dev Mode statuses as a design moves from design to build
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">A design moves from In design to Ready for dev, which is set by the designer. Editing it afterwards sets Changed automatically; the designer marks it done with changes and it returns to Ready for dev. When it is built, it can be marked Completed on higher plans.</title>
  <rect class="d-box" x="10" y="70" width="120" height="56" rx="12"/>
  <text class="d-label" x="70" y="103" text-anchor="middle">In design</text>
  <rect class="d-box-primary" x="190" y="70" width="140" height="56" rx="12"/>
  <text class="d-label-strong" x="260" y="103" text-anchor="middle">Ready for dev</text>
  <rect class="d-box-warn" x="390" y="10" width="130" height="50" rx="12"/>
  <text class="d-label" x="455" y="40" text-anchor="middle">Changed</text>
  <rect class="d-box-success" x="390" y="136" width="130" height="56" rx="12"/>
  <text class="d-label" x="455" y="169" text-anchor="middle">Completed</text>
  <path class="d-arrow" d="M132 98 L188 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M330 84 L388 44" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M400 62 L332 92" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M330 112 L388 156" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="560" y="32">set automatically</text>
  <text class="d-label-muted" x="560" y="52">on edit</text>
  <text class="d-label-muted" x="380" y="96" text-anchor="end">done with changes</text>
  <text class="d-label-muted" x="540" y="172">Org and Enterprise</text>
</svg>
:::

:::mistake Marking ready too early
Marking a flow ready while you are still exploring means developers start building something that will change, and the Changed badge turns into noise they learn to ignore. Mark ready when you would be comfortable if it shipped exactly like this tomorrow.
:::

## What developers see in Dev Mode

Developers switch to **Dev Mode** with the toggle in the toolbar or `Shift+D`. It needs a paid plan and a Full or Dev seat at the time of writing. Selecting a layer shows its **inspect** panel:

- **Measurements and layout**: sizes, padding and gaps, with auto layout described in terms close to CSS flexbox.
- **Variables by name**: the check button's fill appears as `color/action/primary` with its value, padding as `space/4`. If you set code syntax on your variables (Lesson 3.3), developers see the exact token name their code uses.
- **Components and properties**: the instance's component, its variant and property values, and the component description you wrote in Lesson 3.5.
- **Code snippets**: generated CSS, iOS and Android code, a starting point rather than production code. On Organization and Enterprise plans, teams can connect real component code with Code Connect so the snippet shows their own component instead.
- **Assets**: icons and images marked for export, downloadable in the right format.

This is where all the earlier discipline pays off. A component with named layers and bound variables reads like a spec; a detached frame with raw hex codes reads like a puzzle.

## Annotate what pixels cannot say

Some things are invisible in a static frame. Annotations put them right on the design. Press `Shift+T` (or use the annotation tool), select a layer and write a note, or pin a property so it stays visible. At the time of writing, annotations have categories such as Development, Interaction, Accessibility and Content, and developers can filter by them. Measurements (`Shift+M`) pin spacing on the canvas.

For Steady, annotate:

- **Content rules**: habit names wrap to two lines, then truncate with an ellipsis; streaks above 999 show "999+".
- **Behaviour**: tapping a check button marks the habit done for today; it can be undone until midnight.
- **Accessibility**: accessible names for icon buttons, the focus order of the New habit sheet, the 44 × 44 hit area, the reduced-motion alternative.
- **Data edge cases**: what an empty list and a failed load look like, pointing at the frames that show them.

:::tip Walk them through it
Book thirty minutes with the developers when a flow goes ready. Click through the prototype, point at the annotations, and ask what is unclear. Then, when the first build is ready, review it side by side with the design. Handoff is a conversation that starts here, not a file you throw over a wall.
:::

You have designed, systematised, prototyped, checked and handed off Steady. The final lesson is about the two skills that turn this work into a career: running a critique and telling the story in a case study.
