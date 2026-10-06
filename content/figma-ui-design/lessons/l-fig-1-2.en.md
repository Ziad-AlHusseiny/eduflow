---
summary: Use size, weight, position and space to create visual hierarchy, align elements to shared edges, and group content with the internal-less-than-external spacing rule.
takeaways:
  - Hierarchy comes from contrast in size, weight, color and position; if everything is emphasised, nothing is.
  - Give each screen one primary element and decide its rank before you style anything.
  - Align elements to a few shared edges; every extra edge is something the eye has to process.
  - Space inside a group must be smaller than the space between groups, or people read the wrong things as related.
  - The squint test, blurring the screen until only shapes remain, shows whether your hierarchy survives without reading.
further:
  - title: Visual Hierarchy in UX (Nielsen Norman Group)
    url: https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
  - title: Proximity Principle in Visual Design (Nielsen Norman Group)
    url: https://www.nngroup.com/articles/gestalt-proximity/
quiz:
  - q: "In a habit row, the name \"Read 20 pages\" and its streak \"12-day streak\" sit 16 px apart, while the rows themselves are 8 px apart. What will people perceive?"
    options:
      - text: Each streak looks like it belongs to the habit in the row below.
        why: Correct. Proximity beats intent. The streak is closer to the next row than to its own name, so the eye pairs it with the wrong habit.
      - text: Nothing, because the rows have separate backgrounds.
        why: Backgrounds help, but the question has no card backgrounds. Even with them, inverted spacing still weakens the grouping.
      - text: The rows read as more spacious and easier to scan.
        why: Tight gaps between rows with loose gaps inside them do the opposite. It blurs where one row ends.
      - text: The streak looks more important than the name.
        why: Spacing changes grouping, not rank. Importance comes from size, weight and color.
    answer: 0
  - q: Which change creates the clearest hierarchy between a screen title and the habit names below it?
    options:
      - text: Make the title 1 px larger than the habit names.
        why: A 1 px difference is too small to read as intentional. Hierarchy needs a step people notice at a glance.
      - text: Make the title larger and bolder, and add more space below it than between the rows.
        why: Correct. Size, weight and space working together make the rank unmistakable.
      - text: Put the title in all caps at the same size.
        why: Caps alone add texture, not much rank, and long all-caps text is slower to read.
      - text: Give every habit name a different color so the title stands out.
        why: Many colors add noise and compete with the title instead of supporting it.
    answer: 1
  - q: A screen mixes centered headings with left-aligned lists and right-aligned buttons. What is the most useful first fix?
    options:
      - text: Center everything so the screen looks symmetrical.
        why: Centered lists are hard to scan because each line starts at a different place.
      - text: Add divider lines between each block to separate the alignments.
        why: Dividers hide the symptom. The ragged edges are still there.
      - text: Increase the font size so alignment matters less.
        why: Larger text makes misalignment more visible, not less.
      - text: Align most content to one shared left edge and keep exceptions deliberate.
        why: Correct. One strong edge lets the eye travel down the screen without hunting for where each line starts.
    answer: 3
  - q: What does the squint test tell you?
    options:
      - text: Whether your text meets the WCAG contrast ratio.
        why: Squinting is a rough check of emphasis, not a measurement. Use a contrast checker for ratios.
      - text: Whether every element is aligned to the layout guide.
        why: Blurred shapes hide exact edges. Use guides and the inspector for alignment.
      - text: Whether the most important element still stands out when details disappear.
        why: Correct. If the primary action vanishes into the blur, the hierarchy is too flat.
    answer: 2
---

Here is the first draft of Steady's Today screen, the kind almost everyone makes on day one. The title "Today" is 18 px, the habit names are 17 px, the progress text is 16 px, and the streak counts are 16 px in the same grey. Everything is technically there. Nothing tells you where to look.

That is the problem visual hierarchy solves: deciding what people see first, second and third, and making the screen say so without a single word of instruction.

## Hierarchy: rank before you style

Before you touch a font size, write the ranking down. For the Today screen it is:

1. The habits still to do, with their check buttons (the job).
2. Progress for the day ("3 of 5 done").
3. The screen title and date.
4. Streak counts and the tab bar.

You might expect the title to rank first. It doesn't: people know they opened Steady. The title orients; the habits are the work. Now you have a reason for every size decision that follows.

You have five tools for expressing rank, and they stack:

- **Size**: bigger reads first. Steps need to be big enough to look intentional, roughly 1.25× or more.
- **Weight**: bold pulls the eye even at the same size.
- **Color and contrast**: dark text on a light background beats grey text; one accent color beats several.
- **Position**: in left-to-right languages people start top-left; the bottom of a phone screen is easiest to reach with a thumb.
- **Space**: an element surrounded by space reads as more important than one crammed between neighbours.

Use two or three of these together, not all five on every element. If the title is bigger, bolder, colored *and* boxed, it starts shouting over the habits that actually matter.

:::tip The squint test
Zoom out or blur your eyes until you cannot read any text. What shape stands out? On a good Today screen it is the habit list and its check buttons. If it is a decorative header image, your hierarchy is upside down.
:::

## Alignment: fewer edges, calmer screens

Every distinct left edge on a screen is something the eye has to register. Draft one of Steady had five: the title at 20 px, progress text centered, habit icons at 16 px, names at 56 px and a button centered at the bottom. It looked busy without being busy.

The fix is to choose a small number of shared edges and commit to them. On Steady, everything left-aligns to a 20 px margin, text inside rows starts on one line after the icon, and right-side controls (check buttons, chevrons) share a right edge 20 px from the screen side. Two edges plus one text column. The screen goes quiet.

Centered text has a place: short, single-line moments like an empty state ("No habits yet") or a modal title. It works badly for lists and paragraphs, because each line starts somewhere new and the eye has to search for it.

## Spacing: proximity is grouping

People read things that are close together as related. This is the Gestalt principle of proximity, and it is the most powerful grouping tool you have, more powerful than boxes and divider lines.

The rule that follows from it is simple to state and easy to break: **space inside a group must be smaller than the space between groups**.

:::figure Internal spacing smaller than external spacing makes groups readable
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">Left: two habit rows where the gap inside each row is larger than the gap between rows, so the streaks look attached to the wrong habit. Right: the same rows with a 4 pixel internal gap and a 16 pixel external gap, so each name and streak group clearly.</title>
  <text class="d-label-strong" x="20" y="28">Inverted (confusing)</text>
  <rect class="d-box" x="20" y="44" width="280" height="22" rx="4"/>
  <text class="d-label" x="30" y="60">Read 20 pages</text>
  <rect class="d-box" x="20" y="88" width="280" height="22" rx="4"/>
  <text class="d-label-muted" x="30" y="104">12-day streak</text>
  <rect class="d-box" x="20" y="118" width="280" height="22" rx="4"/>
  <text class="d-label" x="30" y="134">Drink water</text>
  <rect class="d-box" x="20" y="162" width="280" height="22" rx="4"/>
  <text class="d-label-muted" x="30" y="178">3-day streak</text>
  <text class="d-label-muted" x="310" y="82">22</text>
  <text class="d-label-muted" x="310" y="118">8</text>
  <text class="d-label-strong" x="380" y="28">Correct</text>
  <rect class="d-box-primary" x="380" y="44" width="280" height="22" rx="4"/>
  <text class="d-label" x="390" y="60">Read 20 pages</text>
  <rect class="d-box-primary" x="380" y="70" width="280" height="22" rx="4"/>
  <text class="d-label-muted" x="390" y="86">12-day streak</text>
  <rect class="d-box-accent" x="380" y="124" width="280" height="22" rx="4"/>
  <text class="d-label" x="390" y="140">Drink water</text>
  <rect class="d-box-accent" x="380" y="150" width="280" height="22" rx="4"/>
  <text class="d-label-muted" x="390" y="166">3-day streak</text>
  <text class="d-label-muted" x="670" y="72" text-anchor="end">4</text>
  <text class="d-label-muted" x="670" y="114" text-anchor="end">16+</text>
  <text class="d-label-muted" x="340" y="230" text-anchor="middle">The numbers are gaps in px. Groups form where the gaps are small.</text>
</svg>
:::

Applied to Steady: inside a habit row, the name and streak sit 4 px apart; each row is its own card, and cards sit 8 px apart; between the progress summary and the list there are 24 px; between the header and everything else, 32 px. Each step out gets more space, so the structure is visible before you read a word.

:::mistake Equal spacing everywhere
Setting every gap to the same value, often 16 px, feels tidy but erases grouping. When the gap between a label and its value equals the gap between two unrelated sections, the screen becomes a flat stack. Vary spacing on purpose: small inside, larger between.
:::

## Draft two

With a ranking, two edges and stepped spacing, the Today screen changes shape. The title becomes a clear 34 px bold, set apart by space rather than color. The progress line sits in its own block with 24 px around it. Habit names are 17 px semibold in near-black, streaks are 13 px in a muted grey directly beneath, and the check buttons on the right are 32 px circles with a 44 px tap area, the only accent color on the screen. Squint and you see a list with a column of targets on the right. That is the job.

In the exercise below you critique a draft like the first one. Then the next lesson gives you the type scale and color rules that make these sizes and greys consistent instead of guessed.
