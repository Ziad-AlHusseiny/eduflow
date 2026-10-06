---
summary: Turn static frames into auto layout frames that stack their children with a set flow, gap, padding and alignment, and nest them to build Steady's habit row and list.
takeaways:
  - Auto layout makes a frame arrange its children for you, so changing content never means nudging layers by hand again.
  - Flow sets the direction (vertical, horizontal or grid), gap sets the space between children, and padding sets the space between the children and the frame's edges.
  - Spacing belongs to the parent frame, never to spacer rectangles or offsets on the children.
  - Real components are nested auto layout frames, such as a horizontal row that contains a vertical text stack.
  - Most auto layout bugs come from settings on the wrong level of nesting, so check the parent before you blame the child.
further:
  - title: Guide to auto layout
    url: https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout
  - title: Use the horizontal and vertical flows in auto layout
    url: https://help.figma.com/hc/en-us/articles/31289464393751-Use-the-horizontal-and-vertical-flows-in-auto-layout
quiz:
  - q: "You change a habit name from \"Run\" to \"Run 5 km before work\" inside an auto layout habit row. What happens to the check button on the right?"
    options:
      - text: It overlaps the longer name until you move it.
        why: That is what happens in a frame without auto layout. Auto layout recalculates positions as content changes.
      - text: It stays exactly where it was, because buttons are fixed.
        why: Children in auto layout have no fixed x and y. Their position comes from the flow, gap and their siblings.
      - text: It is pushed along the flow, or the name wraps, depending on how the row and text are set to resize.
        why: Correct. The row re-flows and the button keeps its gap from the text. Whether the name wraps or the row grows is a resizing choice (next lesson).
      - text: Figma shows a warning that the content no longer fits.
        why: Figma has no such warning. Auto layout adapts the layout instead.
    answer: 2
  - q: The text stack inside a habit row has 4 px gap, and the row has 16 px left padding. A designer adds a 16 px empty rectangle before the icon to push it right. What is wrong?
    options:
      - text: Nothing, because the result looks the same.
        why: It looks the same until someone changes the padding or swaps the icon. Hidden spacers make the spacing impossible to reason about or hand off.
      - text: Spacing should come from the parent's padding and gap, not from invisible layers.
        why: Correct. If the icon needs more room, change the row's padding. Spacer layers show up as mystery boxes in Dev Mode.
      - text: Rectangles cannot be children of auto layout frames.
        why: They can. The problem is using one as a spacer, not whether it is allowed.
      - text: The rectangle should be 8 px so the total stays on the 8-point grid.
        why: Changing the size keeps the hidden-spacer problem. Spacing values belong in padding and gap.
    answer: 1
  - q: Which structure best describes Steady's habit row?
    options:
      - text: A vertical auto layout frame containing icon, name, streak and check button.
        why: A single vertical stack would put the check button below the streak instead of beside the text.
      - text: A group containing four layers placed by hand.
        why: Groups cannot use auto layout, so every content change means repositioning by hand.
      - text: A grid auto layout with one column per element.
        why: Grid suits two-dimensional layouts like the icon picker, not a single row with a nested text stack.
      - text: A horizontal auto layout frame containing the icon, a vertical text stack and the check button.
        why: Correct. The row flows horizontally, and the name and streak stack vertically inside their own frame.
    answer: 3
  - q: Inside a horizontal habit row, the icon sits at the top while the text and check button are centered. Where do you fix it?
    options:
      - text: On the row frame, by setting its alignment so children are centered vertically.
        why: Correct. Alignment of children is a property of the parent auto layout frame.
      - text: On the icon, by nudging it down 6 px.
        why: You cannot position a child by hand in auto layout without taking it out of the flow. Alignment lives on the parent.
      - text: On the page, by adding a layout guide.
        why: Layout guides help you align frames, but they do not change auto layout alignment.
    answer: 0
---

In the last lesson you built a habit row by placing an icon, a name, a streak and a check button by hand. Now change "Read" to "Read 20 pages before bed". The name runs into the check button. Add a second line and the streak overlaps the next row. Every content change means nudging layers, and in a real app content changes every day.

Auto layout is Figma's answer: you tell a frame *how* to arrange its children, and it positions them for you, every time anything changes.

## The three settings that matter most

Select the habit row's layers and press `Shift+A`, or click **Add auto layout** in the right sidebar. Figma wraps them in an auto layout frame and makes a first guess at the settings. Three of them do most of the work.

**Flow** is the direction children are placed in. At the time of writing, Figma offers **Vertical**, **Horizontal** and **Grid**. Vertical stacks children top to bottom, like the habit list. Horizontal lines them up side by side, like the inside of one row. Grid places children in rows and columns, which suits a two-dimensional layout such as the icon picker in the New habit sheet.

**Gap** is the space *between* children. It is one number for the whole frame, so every child is the same distance from the next. You can also choose automatic spacing, which at the time of writing offers Between, Around and Evenly, to distribute leftover space instead of fixing it. Use a fixed number almost always; automatic spacing is for cases like a tab bar where items spread across the width.

**Padding** is the space between the children and the frame's own edges. You can set it on all sides at once, horizontal and vertical separately, or per side.

## Building the habit row

Here is the row as nested auto layout frames. Each frame has one job.

```text
Habit row        Horizontal · gap 12 · padding 12 top/bottom, 16 left/right · align center
├─ Icon          32 × 32
├─ Text stack    Vertical · gap 4
│  ├─ Habit name   Headline 17/24
│  └─ Streak       Caption 13/16
└─ Check button  32 × 32 circle
```

The text stack is its own vertical frame because the name and streak are a group (Lesson 1.2: small gap inside, bigger gap outside). The row is horizontal because icon, text and button sit side by side. The 4 px inside the text stack is smaller than the 12 px between row elements, which is smaller than the space between rows. Proximity is now built into the structure, not maintained by hand.

:::figure Anatomy of the habit row: padding on the outside, gap between children
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">A habit row frame with 16 pixel left and right padding and 12 pixel top and bottom padding. Inside, an icon, a text stack and a check button are separated by 12 pixel gaps. The text stack holds the name and streak with a 4 pixel gap.</title>
  <rect class="d-box" x="20" y="40" width="640" height="120" rx="14"/>
  <rect class="d-box-warn" x="20" y="40" width="40" height="120" rx="0"/>
  <rect class="d-box-warn" x="620" y="40" width="40" height="120" rx="0"/>
  <text class="d-label-muted" x="40" y="182" text-anchor="middle">16</text>
  <text class="d-label-muted" x="640" y="182" text-anchor="middle">16</text>
  <rect class="d-box-primary" x="60" y="70" width="60" height="60" rx="10"/>
  <text class="d-label" x="90" y="105" text-anchor="middle">Icon</text>
  <rect class="d-box-success" x="120" y="70" width="30" height="60" rx="0"/>
  <text class="d-label-muted" x="135" y="150" text-anchor="middle">12</text>
  <rect class="d-box-accent" x="150" y="62" width="380" height="76" rx="8"/>
  <text class="d-label-strong" x="166" y="90">Read 20 pages</text>
  <text class="d-label-muted" x="166" y="124">12-day streak</text>
  <text class="d-label-muted" x="520" y="108" text-anchor="end">gap 4</text>
  <rect class="d-box-success" x="530" y="70" width="30" height="60" rx="0"/>
  <text class="d-label-muted" x="545" y="150" text-anchor="middle">12</text>
  <circle class="d-dot" cx="590" cy="100" r="30"/>
  <text class="d-label-muted" x="340" y="28" text-anchor="middle">padding 12 top</text>
  <text class="d-label-muted" x="340" y="206" text-anchor="middle">padding 12 bottom</text>
</svg>
:::

Now stack rows. Select all the rows and press `Shift+A` again: Figma wraps them in a vertical frame, the `Habit list`, with an 8 px gap. Wrap the progress block and list in a vertical frame with a 24 px gap, then wrap the header and that frame in one more vertical frame with 20 px horizontal padding and a 32 px gap. Two levels of gap give you the stepped spacing from Lesson 1.2, and the whole Today screen is now structured by auto layout. Change any name, add a sixth habit or delete one, and everything below moves to make room.

## Alignment

Each auto layout frame also controls how its children line up across the flow. In a horizontal row, you choose whether children sit at the top, center or bottom of the row; in a vertical stack, whether they hug the left, center or right. The habit row uses center alignment so the icon and check button line up with the middle of the text, whether the name is one line or two.

For rows of text with different sizes, horizontal frames also offer baseline alignment at the time of writing, which lines up the bottoms of the letters instead of the boxes. It is ideal for a label and a value side by side, such as "Streak" and "12 days".

:::mistake Spacing on the wrong layer
When something is too close to its neighbour, beginners add an empty rectangle as a spacer, or wrap a child in an extra frame just to give it padding. Both hide spacing where no one looks for it. Ask instead: is this the space *between* siblings (the parent's gap) or the space *inside* a container (that container's padding)? Change that one number.
:::

:::tip Read the structure, not the pixels
When an auto layout frame looks wrong, select the parent first and read its flow, gap, padding and alignment in the right sidebar. Nine times out of ten the fix is one setting on the parent, not anything on the child you are staring at.
:::

You have the habit row stacking correctly. What it does not do yet is stretch to fill the screen width or let long names wrap at the right place. That is resizing, the subject of the next lesson.
