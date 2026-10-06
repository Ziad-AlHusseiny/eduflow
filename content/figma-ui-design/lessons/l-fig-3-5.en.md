---
summary: Assemble Steady's mini kit into a documented, publishable library with foundations, components, descriptions and a quality checklist that every component must pass.
takeaways:
  - A kit is useful when someone else can find, understand and use a component without asking you, so structure and documentation matter as much as the components.
  - Build the kit from patterns the screens actually repeat, and add a component only when a real screen needs it.
  - Every component should pass the same checklist, covering auto layout, variables, states, both modes, extreme content and a description.
  - Publishing a library lets other files use the kit, and every publish should explain what changed so subscribers can review updates.
  - Names are an interface; pick one convention for components, properties and values and use it everywhere.
further:
  - title: Lesson 3, Build your design system (Figma)
    url: https://help.figma.com/hc/en-us/articles/14548865734679-Lesson-3-Build-your-design-system
  - title: Guide to libraries in Figma
    url: https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-libraries-in-Figma
  - title: Check designs in Figma
    url: https://help.figma.com/hc/en-us/articles/39592284074263-Check-designs-in-Figma
quiz:
  - q: A designer proposes building a Carousel, a Data table and a Date range picker for Steady's kit "so we're ready". None of Steady's screens uses them. What should Sofia say?
    options:
      - text: Build them now, because adding components later is expensive.
        why: Components built without a real use are usually wrong when the real use arrives, and they still need maintaining in the meantime.
      - text: Build them but hide them from the library.
        why: Hidden or not, they cost time to make and keep in sync with variables and modes.
      - text: Wait until a screen needs them, then build them from that real use.
        why: Correct. A kit grows from repeated patterns in real screens, which keeps it small and every component justified.
      - text: Copy them from a community kit to save time.
        why: Borrowed components bring someone else's tokens, names and assumptions, so they rarely fit without rework.
    answer: 2
  - q: You publish an update to the Steady kit that changes the habit row's padding. What happens in a screens file that uses the library?
    options:
      - text: Instances in that file change instantly with no notice.
        why: Library updates are offered to subscribing files for review, not applied silently.
      - text: The file is notified of available updates, and someone reviews and accepts them.
        why: Correct. Subscribers see that updates are available and choose when to accept them, which is why publish notes matter.
      - text: Nothing, because instances from libraries never update.
        why: They do update once the file accepts the library update. That is the whole point of a library.
      - text: The screens file is duplicated so the old version is kept.
        why: Figma does not duplicate files on library updates. Version history covers rollback.
    answer: 1
  - q: "Which item belongs on Steady's component checklist because it catches the most bugs before handoff?"
    options:
      - text: The component looks good at its default size in light mode.
        why: That is where it was designed, so it almost always passes. Bugs live at the edges.
      - text: The component has a drop shadow.
        why: Shadows are a style choice, not a quality check.
      - text: The component uses the newest Figma feature available.
        why: Newer features are not automatically better for the people using the kit.
      - text: The component has been tested with extreme content, both modes and its narrowest and widest sizes.
        why: Correct. Long labels, dark mode and resizing are where components break, so the checklist forces those tests.
    answer: 3
---

A kit that lives in your head is not a kit. Sofia's test is simple: hand the file to a designer who has never seen Steady, ask them to build a Settings screen, and watch. If they ask "which button do I use?" or "is this teal the real one?", the kit has failed, no matter how polished the components are.

This lesson turns the pieces from Lessons 3.1 to 3.4 into something that passes that test.

## What goes in Steady's kit

Start from the screens, not from a list of components other apps have. Walk through Today, Habit detail and New habit, and note every element that appears more than once or has states. That inventory is the kit:

| Component | Variant properties | Other properties |
|---|---|---|
| Button | Type, State, Size | Label (text), Show icon (boolean), Icon (instance swap) |
| Check button | State: To do, Done, Missed | none |
| Habit icon | none | Glyph (instance swap) |
| Habit row | State: To do, Done, Missed | Name (text), Show streak (boolean), Icon (instance swap) |
| Chip | Selected: true, false | Label (text) |
| Text field | State: Default, Focused, Error, Disabled | Label, Hint (text) |
| Tab bar | Active: Today, Stats, Settings | none |

Seven components cover all three screens. Resist adding more until a screen needs one. Every component you add must be kept in sync with variables, modes and naming forever.

## Structuring the file

Put the kit in its own file, `Steady Kit`, with a few pages:

- **Cover**: the kit's name, an owner, a status ("In progress" or "Stable") and the date of the last publish.
- **Foundations**: swatches for every semantic color in both modes, the type scale, the spacing and radius scales. These are visual documentation of the variables, so people can see the system at a glance.
- **Components**: one section per component, holding the component set, a few example instances in realistic use, and short usage notes in plain text ("Use Ghost buttons for low-priority actions next to a Primary").
- **Playground**: a scratch area where people can try instances without touching the components.

Every component also gets a **description** in its properties panel: one or two sentences on when to use it, plus a link to fuller documentation if you have any. The description appears when people hover the component in the Assets panel and when developers inspect it in Dev Mode, so it travels with the component.

## The component checklist

Before a component is called done, it passes the same checks. Writing them down is what turns personal taste into a team standard:

```text
[ ] Built with auto layout; no hand-placed children
[ ] Every color, spacing and radius bound to a semantic variable
[ ] All states designed: default, pressed, focused, disabled (and error for inputs)
[ ] Checked in Light and Dark modes, contrast re-measured in both
[ ] Tested with extreme content: long label, empty value, larger text
[ ] Resized to its minimum and maximum sensible widths
[ ] Properties and values named by meaning, matching the code where possible
[ ] Description written; usage example placed on the Components page
```

On Organization and Enterprise plans, at the time of writing, Figma's **Check designs** can scan a selection for hard-coded values that should be variables and suggest library replacements. On other plans, select a component and read its fills, gaps and padding in the right sidebar: a raw hex code or an unbound number stands out immediately.

:::mistake Names that drift
`Primary button`, `btn/secondary`, and a property called `state` with values `on` and `Disabled`: each is fine alone and maddening together. Pick a convention, for example Title Case for components, properties and values, and fix inconsistencies before you publish, because renaming later breaks every reference people have learned.
:::

## Publishing the library

Publishing makes the kit's components, styles and variables available to other files in your team or organization. At the time of writing, you publish from the Assets panel's library options, and libraries require a paid or Education plan. Each publish asks for a description of changes. Write it for the person receiving it: "Habit row padding is now 12/16 to match the 8-point scale; no action needed" beats "updates".

:::figure A library publishes changes; subscribing files review and accept them
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">The Steady Kit file publishes to the team library. Two subscriber files, Steady Screens and Steady Marketing, receive an update notice and accept it on their own schedule.</title>
  <rect class="d-box-primary" x="20" y="80" width="160" height="60" rx="12"/>
  <text class="d-label-strong" x="100" y="106" text-anchor="middle">Steady Kit</text>
  <text class="d-label-muted" x="100" y="126" text-anchor="middle">main components</text>
  <path class="d-arrow" d="M182 110 L258 110" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="220" y="100" text-anchor="middle">publish</text>
  <rect class="d-box" x="260" y="80" width="150" height="60" rx="12"/>
  <text class="d-label" x="335" y="115" text-anchor="middle">Team library</text>
  <path class="d-arrow" d="M412 100 L488 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M412 120 L488 170" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="490" y="22" width="170" height="56" rx="12"/>
  <text class="d-label" x="575" y="46" text-anchor="middle">Steady Screens</text>
  <text class="d-label-muted" x="575" y="66" text-anchor="middle">review and accept</text>
  <rect class="d-box-accent" x="490" y="142" width="170" height="56" rx="12"/>
  <text class="d-label" x="575" y="166" text-anchor="middle">Steady Marketing</text>
  <text class="d-label-muted" x="575" y="186" text-anchor="middle">accepts later</text>
</svg>
:::

Files that use the library see that updates are available and accept them when they are ready, so a change to the kit never lands silently in the middle of someone's work. That is also why breaking changes, such as renaming a property, deserve a clear warning in the publish notes.

:::tip Version the kit like software
Keep a short changelog on the Cover page: date, what changed, whether anyone needs to act. When a developer asks "since when has the chip had a min width?", the answer takes ten seconds.
:::

Section 3 is complete: Steady has a small, themed, documented kit. Section 4 makes it move with prototyping, makes sure everyone can use it, and gets it into developers' hands.
