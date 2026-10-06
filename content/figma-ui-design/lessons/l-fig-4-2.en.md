---
summary: Check Steady's screens for contrast, color-only meaning, target size, focus order and text resizing, and annotate what developers need so the accessible design survives the build.
takeaways:
  - Meaning must never rely on color alone; pair color with an icon, text or shape change.
  - WCAG 2.2 AA asks for touch targets of at least 24 by 24 CSS pixels, while Apple and Google recommend 44 points and 48 dp, so design to the platform guideline.
  - A target's tappable area can be larger than its visible shape, which lets a 32 px check circle sit inside a 44 px hit area.
  - Every interactive element needs a visible focus state, and the focus order should follow the reading order you annotate.
  - Icon-only buttons need an accessible name and inputs need visible labels, and both belong in your handoff annotations.
further:
  - title: Understanding SC 1.4.1 Use of Color
    url: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
  - title: Understanding SC 2.5.8 Target Size (Minimum)
    url: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
  - title: Accessibility (Apple Human Interface Guidelines)
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
  - title: Accessibility designing (Material Design 3)
    url: https://m3.material.io/foundations/designing/structure
quiz:
  - q: "Steady marks a missed habit by turning the row's check circle red. Nothing else changes. What does WCAG's Use of Color criterion ask you to add?"
    options:
      - text: A brighter red so it stands out more.
        why: Any red, however bright, is still color alone. People with color vision deficiencies may not tell it from teal or gray.
      - text: A tooltip that appears on hover.
        why: Phones have no hover, and the meaning should be visible without extra steps.
      - text: A second cue that does not depend on color, such as an x icon in the circle and the word "Missed" under the name.
        why: Correct. Color can support the meaning, but a shape or text must carry it too.
      - text: Nothing, because red is universally understood as a warning.
        why: The meaning of red is cultural, and many people cannot reliably see it. The criterion asks for a non-color cue.
    answer: 2
  - q: The check circle is drawn at 32 × 32 px. How do you meet Apple's 44 pt recommendation without making it look bigger?
    options:
      - text: Make the Check button component a 44 × 44 frame with the 32 px circle centered inside it.
        why: Correct. The component's bounds become the tappable area, and developers implement the larger hit area from it.
      - text: Scale the circle up to 44 px.
        why: That meets the size but changes the visual design. You can have both with a larger invisible frame.
      - text: Leave it, because 32 px already passes WCAG's 24 px minimum.
        why: It passes the AA minimum, but the platform guideline for comfortable tapping is larger, and Steady is a phone app.
      - text: Add a note asking developers to make it easier to tap.
        why: A vague note leaves the size to guesswork. Building the hit area into the component makes it exact.
    answer: 0
  - q: A keyboard or switch-control user moves through the New habit sheet. Which design deliverable helps developers get the order right?
    options:
      - text: A larger font size for the sheet title.
        why: Size affects visual hierarchy, not the order focus moves in.
      - text: A dark-mode version of the sheet.
        why: Modes change colors, not navigation order.
      - text: A smart animate transition between fields.
        why: Animation does not tell anyone which element receives focus next.
      - text: Numbered focus-order annotations on the sheet, plus a designed focus state for each control.
        why: Correct. Developers see the intended order and know exactly what focus looks like.
    answer: 3
  - q: Why should the New habit text field have a visible label above it, not only hint text inside it?
    options:
      - text: Hint text is not allowed in Figma text fields.
        why: Figma lets you design hint text freely. The issue is how people use the field.
      - text: Hint text disappears as soon as someone types, so the field loses its instructions, and light hint colors often fail contrast.
        why: Correct. A persistent label keeps the purpose visible and gives screen readers a reliable name.
      - text: Labels make the field taller, which improves the layout.
        why: Height is a side effect, not the reason. The reason is that hints vanish and are often too faint.
    answer: 1
---

Roughly one in twelve men has some form of color vision deficiency. Many people use phones with larger text, with a screen reader, with one shaky thumb on a bus, or in bright sunlight. None of them are edge cases; together they are a large share of Steady's users, and most of what helps them makes the app better for everyone.

Accessibility is cheapest at design time. A contrast failure costs a color change in Figma, and much more once it ships across a dozen screens. This lesson walks Steady through the checks Sofia runs before any handoff.

## Contrast, again, everywhere

You learned the numbers in Lesson 1.3 and re-checked them in dark mode in Lesson 3.4. Now apply them to the things that are easy to forget:

- **Control outlines**: an unchecked check circle is only a ring. Against the row surface it needs 3:1, or people cannot find it.
- **Focus indicators**: the focus ring needs 3:1 against what surrounds it.
- **Disabled states**: WCAG exempts disabled controls from contrast, but a disabled button nobody can read leaves people unsure what they cannot do. Keep the label legible.
- **Text on images or illustrations**: measure against the lightest part of the image under the text.

Figma's contrast checker in the color picker covers individual pairs as you work. On Organization and Enterprise plans, at the time of writing, Check designs can also flag contrast issues across a selection.

## Never color alone

Steady's first design showed a missed habit with a red check circle and nothing else. To someone who cannot distinguish red from teal, every habit looks the same. WCAG's Use of Color criterion requires that color is never the *only* way meaning is conveyed.

The fix is a second cue: the Missed variant gets an x icon inside the circle and a "Missed yesterday" caption under the name; Done gets a check mark and the name in the secondary text color. Color still helps, but shape and words carry the meaning. Test it by viewing the screen in grayscale: if you can still tell the states apart, you have passed.

## Targets big enough for thumbs

WCAG 2.2 sets a minimum at level AA: interactive targets of at least **24 × 24 CSS pixels**, or enough spacing around smaller ones. Platform guidelines go further for comfort: Apple recommends **44 × 44 points**, and Material Design recommends **48 × 48 dp**. For a phone app, design to the platform guideline.

The visible shape and the tappable area do not have to match. Steady's check circle stays a 32 px circle visually, but the Check button component is a 44 × 44 frame with the circle centered in it. The frame's bounds tell developers the real hit area.

:::figure The visible check circle sits inside a larger tappable area
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">A 32 pixel check circle centered inside a dashed 44 pixel square that marks the tap area. Beside it, two neighbouring targets with 8 pixels between their tap areas.</title>
  <rect class="d-box d-dashed" x="60" y="40" width="150" height="150" rx="8"/>
  <circle class="d-box-primary" cx="135" cy="115" r="54"/>
  <text class="d-label-strong" x="135" y="120" text-anchor="middle">32 px</text>
  <text class="d-label-muted" x="135" y="214" text-anchor="middle">44 × 44 tap area</text>
  <rect class="d-box d-dashed" x="330" y="70" width="100" height="100" rx="6"/>
  <circle class="d-box-accent" cx="380" cy="120" r="36"/>
  <rect class="d-box d-dashed" x="458" y="70" width="100" height="100" rx="6"/>
  <circle class="d-box-accent" cx="508" cy="120" r="36"/>
  <path class="d-line" d="M430 190 L458 190"/>
  <text class="d-label-muted" x="444" y="214" text-anchor="middle">8 px apart</text>
  <text class="d-label-muted" x="444" y="50" text-anchor="middle">tap areas must not overlap</text>
</svg>
:::

:::mistake Tiny icon buttons in the header
A 20 px pencil icon for "Edit habit", 4 px from a 20 px share icon, looks neat and is hard to hit. Wrap each icon in a 44 px frame and let the frames sit next to each other. The icons look the same; the mis-taps stop.
:::

## Focus order and focus states

People using a keyboard, switch control or a screen reader move through a screen one element at a time. Two design decisions affect them directly.

**Focus states.** Every interactive component needs a visible focus style, usually a 2 px ring in a color that meets 3:1. Add `Focused` to the State property of Button, Chip, Text field and Check button, so it exists in the kit, not as an afterthought.

**Focus order.** The order should follow the visual reading order: on the New habit sheet, that is close, name field, icon picker, frequency chips, reminder toggle, Save habit. Usually developers get this right by default if the layout is logical; when your layout is unusual, annotate the order with numbered markers. Figma's annotations include an **Accessibility** category at the time of writing, which keeps these notes separate from spacing specs (Lesson 4.3).

## Names, labels and text size

Screen readers announce elements by name. An icon-only add button would be read as "button" unless someone gives it a name, so annotate it: *accessible name: "Add habit"*. The text field needs a visible label, "Habit name", not just hint text that vanishes when typing starts.

Finally, remember the 30% larger text test from Lesson 2.4. iOS and Android both let people enlarge text system-wide. Rows built with Hug height and Auto height text grow gracefully; anything with a fixed height clips. Respecting reduced-motion settings belongs here too: annotate a simpler fade as the alternative to your streak celebration.

:::tip Design the accessible state first
When you design a component, design its focus state and its largest text size in the same sitting as the default. Adding them later means revisiting every component, and it rarely happens before a deadline.
:::

With the screens checked and annotated, they are nearly ready for developers. Next you hand them off in Dev Mode.
