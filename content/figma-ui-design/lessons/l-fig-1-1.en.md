---
kind: intro
summary: Understand how product designers turn a user's goal into screen decisions, meet Steady, the habit tracker you will design, and set up Figma for the course.
takeaways:
  - A UI design is a chain of decisions, and every decision should have a reason you can say out loud.
  - Start from the user's job and the screen's single most important action, not from colors or fonts.
  - Designers work in a loop of understand, structure, style, test and hand off, revisiting earlier steps as they learn.
  - Steady's Today screen exists so someone can check off a habit in a few seconds, and that goal settles most layout arguments.
further:
  - title: What is Figma?
    url: https://help.figma.com/hc/en-us/articles/14563969806359-Figma-Design-for-beginners
  - title: Compare Figma plans and features
    url: https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features
quiz:
  - q: "A teammate says the Today screen \"feels empty\" and wants to add a motivational quote banner at the top. What is the strongest first response?"
    options:
      - text: Agree, because empty space makes an app look unfinished.
        why: White space is not a defect. Filling it without a reason usually pushes the primary task further down the screen.
      - text: Ask what job the banner does for someone trying to check off a habit.
        why: Correct. Tying the change to the user's goal turns a taste debate into a decision you can test.
      - text: Add it, but make the quote smaller than the habit names.
        why: Shrinking it is still a decision without a reason. The question is whether it helps the screen's main job at all.
      - text: Reject it, because designers own the layout.
        why: Ownership is not a reason. A good critique answers with the user's goal, not with job titles.
    answer: 1
  - q: Which order matches the way most designers build a new screen?
    options:
      - text: Pick brand colors, choose fonts, then decide what goes on the screen.
        why: Styling first tends to lock in decisions before you know what the content needs.
      - text: Build components, publish a library, then sketch the screens.
        why: A library comes from repeated patterns you have already found in real screens, not before them.
      - text: Prototype the animations first, then fill in the layout.
        why: Motion is the last layer. Animating a layout that will change wastes the work.
      - text: Clarify the user's job, sketch the structure, then apply type, color and detail.
        why: Correct. Structure before style keeps the important content in charge of the layout.
    answer: 3
  - q: "Why does Sofia insist that every design decision come with a \"because\"?"
    options:
      - text: Reasons let you defend, test and revisit a choice when the context changes.
        why: Correct. A reason like "because thumbs reach the bottom of the screen" can be checked; "because it looks nice" cannot.
      - text: Developers refuse to build anything that lacks a written rationale.
        why: Developers want clear specs, but the reason matters for the design itself, not as a handoff formality.
      - text: Figma requires a description on every layer before you can share a file.
        why: Figma has no such requirement. Reasons live in your thinking, critiques and annotations.
    answer: 0
---

Open almost any habit-tracker app and you will find the same thing near the top of the screen: a list of today's habits with a big, obvious way to mark each one done. That is not because designers copy each other. It is because they all asked the same question first: what does someone opening this app need to do in the next five seconds?

That question is the heart of UI design. A screen is not a picture; it is a chain of decisions, and each decision should have a reason you can say out loud. Sofia Reyes, a principal product designer at Northwind who teaches this course, puts it bluntly in every critique: "Tell me the *because*." The heading is bigger *because* it is the first thing you should read. The check button sits on the right *because* that is where a right thumb rests.

## Meet Steady

Throughout this course you design **Steady**, a small habit-tracker app for phones. It has three core screens and a mini component kit:

- **Today**: the list of habits due today, each with a checkbox and a streak count, plus a progress summary.
- **Habit detail**: a calendar of past check-ins, the current streak and an edit button.
- **New habit**: a bottom sheet with a name field, an icon picker, frequency chips and a reminder toggle.
- **The kit**: button, checkbox, habit row, chip, text field and tab bar, themed for light and dark mode.

The user's job on the Today screen is simple to state: *check off a habit in a few seconds, then put the phone away*. Keep that sentence nearby. When you argue with yourself about whether a quote banner, a big chart or a fancy header belongs at the top, that sentence settles it.

## How designers actually work

Real design work is a loop, not a straight line. You will move through it many times in this course, and you will often step back a stage when something you learn later changes an earlier choice.

:::figure The design loop you will repeat for every Steady screen
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Five stages in a loop: understand the job, structure the screen, style it, test it, hand it off, with an arrow from test back to structure.</title>
  <rect class="d-box-primary" x="10" y="70" width="112" height="56" rx="12"/>
  <text class="d-label-strong" x="66" y="103" text-anchor="middle">Understand</text>
  <rect class="d-box" x="148" y="70" width="112" height="56" rx="12"/>
  <text class="d-label" x="204" y="103" text-anchor="middle">Structure</text>
  <rect class="d-box" x="286" y="70" width="112" height="56" rx="12"/>
  <text class="d-label" x="342" y="103" text-anchor="middle">Style</text>
  <rect class="d-box-warn" x="424" y="70" width="112" height="56" rx="12"/>
  <text class="d-label" x="480" y="103" text-anchor="middle">Test</text>
  <rect class="d-box-success" x="562" y="70" width="112" height="56" rx="12"/>
  <text class="d-label" x="618" y="103" text-anchor="middle">Hand off</text>
  <path class="d-arrow" d="M122 98 L146 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M260 98 L284 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M398 98 L422 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M536 98 L560 98" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M480 128 C480 200 204 200 204 130" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="342" y="214" text-anchor="middle">what you learn in testing changes the structure</text>
  <text class="d-label-muted" x="66" y="50" text-anchor="middle">user's job</text>
  <text class="d-label-muted" x="204" y="50" text-anchor="middle">layout, order</text>
  <text class="d-label-muted" x="342" y="50" text-anchor="middle">type, color</text>
  <text class="d-label-muted" x="480" y="50" text-anchor="middle">people, a11y</text>
  <text class="d-label-muted" x="618" y="50" text-anchor="middle">Dev Mode</text>
</svg>
:::

**Understand** means writing down who uses the screen and what they came to do. **Structure** means deciding what goes on the screen and in what order, usually as grey boxes. **Style** adds type, color and detail. **Test** means putting it in front of people and checking accessibility. **Hand off** means making it buildable for developers. Section 1 covers the principles behind structure and style; Section 2 is layout; Section 3 turns repeated pieces into a system; Section 4 covers testing and handoff.

:::mistake Starting with colors
Beginners often open Figma and pick a palette first. Color is the easiest thing to change and the least important for whether a screen works. Get the order and grouping right in greyscale; a well-structured grey screen beats a beautiful confusing one every time.
:::

## Setting up

You need a Figma account and the desktop app or a current browser. Create a new design file called `Steady` with three pages: `Screens`, `Kit` and `Scratch`. Pages are tabs inside one file; keeping experiments on `Scratch` stops them leaking into the work you will hand off.

:::note Plans and features
At the time of writing, the free Starter plan covers almost everything here, but not variable modes (Lesson 3.4), publishing a library (Lesson 3.5) or Dev Mode (Lesson 4.3), which need a paid or Education plan. Where a feature is plan-dependent, the lesson says so, and you can still follow the reasoning.
:::

Figma ships changes often. Menu names in this course were checked against Figma's help centre at the time of writing; if a label has moved, the help centre's search finds the new home quickly.

Next, you learn the three principles that decide whether a screen is readable before any color touches it: hierarchy, alignment and spacing.
