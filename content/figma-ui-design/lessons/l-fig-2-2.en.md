---
summary: Control how auto layout frames and their children size themselves with Hug contents, Fill container and Fixed, set min and max limits, wrap chips onto new lines, and pull badges out of the flow.
takeaways:
  - Every layer in auto layout has a width and a height behaviour; Hug contents follows the children, Fill container takes the parent's available space, Fixed never changes.
  - A parent cannot hug a child that fills it on the same axis, so Figma switches that parent to Fixed.
  - Min and max width stop components from becoming absurdly narrow or wide on unusual screens.
  - Wrap lets horizontal content such as chips flow onto a new line instead of overflowing.
  - Ignore auto layout takes one child out of the flow so you can position it with constraints, which suits badges and floating dots.
further:
  - title: Guide to auto layout (resizing, wrap, min and max)
    url: https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout
  - title: Create a responsive card with auto layout and constraints
    url: https://help.figma.com/hc/en-us/articles/18894664907287-Create-a-responsive-card-with-auto-layout-and-constraints
quiz:
  - q: "The primary \"Save habit\" button should stretch across the sheet on any phone, but stay its natural height. Which settings fit?"
    options:
      - text: Width Hug contents, height Fill container.
        why: Hug width makes the button only as wide as its label, and Fill height would stretch it down the sheet.
      - text: Width Fixed 353, height Fixed 48.
        why: A fixed width breaks on any phone that is not exactly the width you designed for.
      - text: Width Fill container, height Hug contents.
        why: Correct. Fill takes the sheet's width; Hug keeps the height equal to the label plus padding.
      - text: Width Fill container, height Fill container.
        why: Fill height in a vertical sheet would make the button grow into all leftover vertical space.
    answer: 2
  - q: Inside the habit row, the text stack is set to Hug contents. On a wide phone the check button sits right next to a short name instead of at the right edge. What fixes it?
    options:
      - text: Set the text stack's width to Fill container so it takes the remaining space and pushes the button to the edge.
        why: Correct. Fill container makes the stack absorb the leftover width, so the button lands at the right padding.
      - text: Set the check button's width to Fill container.
        why: The button would stretch into a wide pill instead of staying a 32 px circle.
      - text: Add a flexible spacer rectangle between text and button.
        why: Spacers hide intent. The stack itself should take the space.
      - text: Set the row's gap to auto spacing.
        why: Auto spacing could push the button right, but the text would then not wrap at a predictable width. Fill on the stack is clearer.
    answer: 0
  - q: You set a card's width to Hug contents, then set a child inside it to Fill container on the same axis. What does Figma do?
    options:
      - text: It keeps both and the card grows forever.
        why: Figma prevents this loop. The parent cannot measure its children while a child measures the parent.
      - text: It switches the card's width to Fixed.
        why: Correct. A child that fills its parent needs a parent with a definite size, so Figma changes Hug to Fixed on that axis.
      - text: It ignores the child's Fill setting.
        why: Figma resolves the conflict on the parent's side, not the child's.
      - text: It turns on wrap for the card.
        why: Wrap is unrelated. It only changes how children flow onto new lines.
    answer: 1
  - q: Steady shows a small flame badge overlapping the top-right corner of a habit's icon. How do you build it inside the auto layout icon frame?
    options:
      - text: Add the badge as a normal child and set a negative gap.
        why: Negative gap overlaps all siblings in the flow, not just one badge at one corner.
      - text: Put the badge in a separate frame above the whole row.
        why: It would not move with the icon when the row reflows, so it would drift on other screens.
      - text: Draw it on top using a group and nudge it into place.
        why: Groups inside auto layout still join the flow; nudging is lost on the next re-layout.
      - text: Add the badge as a child, turn on Ignore auto layout, and pin it with Right and Top constraints.
        why: Correct. Ignore auto layout takes it out of the flow, and constraints keep it at the corner as the icon resizes.
    answer: 3
---

Your habit row now stacks itself, but test it the way Sofia does: drag the Today frame wider. The rows stay at their old width, leaving a strip of empty screen on the right. Drag it narrower and the check buttons fall off the edge. Stacking is solved; sizing is not.

In auto layout every layer has two sizing behaviours, one for width and one for height. Get those right and the same row works on any phone, in any language, with any habit name.

## Hug, Fill and Fixed

You set sizing in the width and height controls of the right sidebar. There are three options.

**Hug contents** makes a frame exactly as big as its children plus padding. A chip that hugs grows when its label changes from "Daily" to "Weekends". Only frames and text can hug, because only they have contents.

**Fill container** makes a child take all the available space in its auto layout parent along that axis. If two siblings both fill, they share the space equally.

**Fixed** sets an exact size that never changes. Icons and the check button are fixed at 32 × 32 because a check target should not grow or shrink with the text next to it.

:::figure The same habit row with three sizing choices for the text stack
<svg viewBox="0 0 680 270" role="img" aria-labelledby="t1">
  <title id="t1">Three versions of a row. With the text stack on Hug, the check button sits right after the text. On Fill, the stack stretches and the button sits at the right edge. On Fixed, the stack is a set width and a long name is cut off.</title>
  <text class="d-label-strong" x="20" y="32">Hug</text>
  <rect class="d-box" x="100" y="12" width="560" height="36" rx="8"/>
  <rect class="d-box-primary" x="110" y="18" width="24" height="24" rx="6"/>
  <rect class="d-box-accent" x="144" y="18" width="120" height="24" rx="4"/>
  <text class="d-label" x="152" y="35">Read</text>
  <circle class="d-dot" cx="286" cy="30" r="12"/>
  <text class="d-label-strong" x="20" y="122">Fill</text>
  <rect class="d-box" x="100" y="102" width="560" height="36" rx="8"/>
  <rect class="d-box-primary" x="110" y="108" width="24" height="24" rx="6"/>
  <rect class="d-box-accent" x="144" y="108" width="470" height="24" rx="4"/>
  <text class="d-label" x="152" y="125">Read</text>
  <circle class="d-dot" cx="636" cy="120" r="12"/>
  <text class="d-label-strong" x="20" y="212">Fixed</text>
  <rect class="d-box" x="100" y="192" width="560" height="36" rx="8"/>
  <rect class="d-box-primary" x="110" y="198" width="24" height="24" rx="6"/>
  <rect class="d-box-warn" x="144" y="198" width="160" height="24" rx="4"/>
  <text class="d-label" x="152" y="215">Read 20 pages be…</text>
  <circle class="d-dot" cx="326" cy="210" r="12"/>
  <text class="d-label-muted" x="380" y="260" text-anchor="middle">Fill pushes the button to the edge; Fixed truncates long names.</text>
</svg>
:::

For Steady's habit row the settings are:

| Layer | Width | Height |
|---|---|---|
| Habit row | Fill container | Hug contents |
| Icon, Check button | Fixed 32 | Fixed 32 |
| Text stack | Fill container | Hug contents |
| Habit name, Streak | Fill container | Hug contents |

Read it from the outside in. The row fills the list's width. Inside it, the text stack fills whatever the icon and button leave, which pushes the button to the right edge. The habit name fills the stack's width and hugs its height, so a long name wraps onto a second line and the row grows taller to fit. That is exactly the behaviour you want on a 375 px phone.

Figma enforces one rule for you: a parent cannot hug a child that fills it on the same axis. Each would be waiting to measure the other. If you set a child to Fill container, Figma switches the parent from Hug to Fixed on that axis.

:::mistake Fixed widths everywhere
Designing at 393 px and typing 353 into every width works perfectly at 393 px and nowhere else. Before you type a fixed number, ask whether the thing should really never change size. Icons and avatars, yes. Rows, buttons in sheets and text, almost never.
:::

## Min and max

Fill and Hug can produce silly sizes at the extremes. A full-width button looks fine on a phone and ridiculous at 1,000 px wide on a tablet. A chip that hugs a one-letter label can become narrower than a fingertip.

Min and max width and height (found in the width and height dropdowns) set the limits. Steady uses:

- **Save habit** button: Fill container, **max width 480**, so it stops growing on tablets.
- **Chip**: Hug contents, **min width 64**, so short labels still make a comfortable target.
- **Text field**: Fill container, **min width 200**, so it never collapses in a narrow layout.

## Wrap

The frequency chips in the New habit sheet sit in a horizontal row. "Daily, Weekdays, Weekends, Custom" fits at 393 px but not at 320 px or in German. Turn on **wrap** for the row and chips that do not fit flow onto a new line instead of overflowing. At the time of writing, a wrapping frame lets you set the space between lines separately from the gap between items; use the same 8 px so the chips form an even grid.

Wrap is for collections of similar items such as chips, tags or avatars. Do not wrap a habit row: on a narrow screen its check button would drop onto its own line.

## Pulling a layer out of the flow

Sometimes one child should not take part in the flow at all: a small flame badge on the corner of a habit icon, or a dot that marks an unread reminder. Select it and turn on **Ignore auto layout** (it was called *absolute position* until recently, so older tutorials use that name). The layer stays inside the frame but stops affecting its siblings, and you place it with constraints, here Right and Top, so it sticks to the corner when the icon resizes.

:::tip Test with ugly content
Replace one habit name with "Practise Spanish vocabulary with flashcards for fifteen minutes", set one streak to "1,245-day streak", and resize the frame from 320 to 430 wide. If nothing overlaps, truncates by accident or floats, your sizing is right.
:::

Your rows now adapt to width and content. Next you give all those gaps and paddings a system, so 12, 16 and 24 are decisions instead of guesses.
