---
summary: Run an interface inventory of screens and code, count duplicated decisions like colors and buttons, and turn the counts into a ranked list of what the system should own first.
takeaways:
  - An interface inventory collects every instance of each UI element side by side, so duplication becomes impossible to argue with.
  - Audit code as well as screens; a script that counts color values finds drift that screenshots hide.
  - Normalize values before counting, or `#FFF` and `#ffffff` look like two decisions.
  - Prioritize elements that are both frequent and inconsistent; those give the biggest return when the system owns them.
further:
  - title: CSS color values (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value
  - title: Using CSS custom properties (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
quiz:
  - q: Your color script reports `#FFF`, `#ffffff` and `rgb(255, 255, 255)` as three separate values. What should you do before presenting the numbers?
    options:
      - text: Normalize every value to one notation, then count again.
        why: Correct. They are the same decision written three ways; counting them separately inflates the drift and undermines trust in your audit.
      - text: Report them as three values, since engineers typed them differently.
        why: The audit measures design decisions, not spelling; reporting three whites makes the numbers easy to dismiss.
      - text: Delete the `rgb()` value from the codebase first.
        why: Changing code before the audit is finished mixes cleanup into measurement; normalize in the script instead.
    answer: 0
  - q: The inventory shows 2 date pickers used on 3 screens, and 11 button styles used on 140 screens. Where should Northwind UI start?
    options:
      - text: Date pickers, because they are the hardest component to build.
        why: Difficulty doesn't make something urgent; three screens is a small surface with little shared cost.
      - text: Buttons, because they are both frequent and inconsistent.
        why: Correct. High usage times high variance is where consolidation saves the most time and fixes the most visible inconsistency.
      - text: Both at once, so the system launches complete.
        why: Spreading a small team across everything delays the high-value win; a system earns trust by fixing the common pain first.
      - text: Neither; the system should start with documentation.
        why: Documentation without anything to document gives teams nothing to adopt.
    answer: 1
  - q: A product manager says the inventory screenshots are "just designers being picky". Which addition makes the audit hardest to dismiss?
    options:
      - text: A mood board showing how the product could look after a redesign.
        why: A vision is useful later, but it reads as taste, which is the exact objection you are answering.
      - text: A longer list of every inconsistency found.
        why: More examples of the same kind rarely change a skeptic's mind; cost does.
      - text: The engineering time spent maintaining each duplicate, such as 11 button implementations with separate bug fixes.
        why: Correct. Translating duplication into hours and bugs turns an aesthetic complaint into a cost the business already pays.
    answer: 2
---

Before you design a single token, you need to know what already exists. Teams usually skip this step because they feel they already know the product is inconsistent. Feeling it is not enough. You need numbers that a product manager, an engineering lead and a VP will all accept, and you need them to decide what the system owns first.

## The screenshot inventory

An interface inventory is simple to describe and tedious to do: you screenshot every instance of every UI element across your products and group them by type. All the buttons on one board, all the form inputs on another, all the modals on a third.

At Northwind I ran it with two product designers over four days, across the dispatch app and the marketing site. We used a shared Figma file with one page per category: buttons, inputs, selects, icons, colors, typography, cards, modals, tables, empty states, and "other". Each screenshot carried its source URL so anyone could check it.

The result was the most persuasive artifact I have ever made. Eleven button styles side by side end every debate about whether there is a consistency problem. Nobody argues with a wall of buttons that are almost the same blue.

:::tip Time-box it
Give the inventory a fixed budget, such as three to five days. You want enough coverage to show patterns, not a museum of every pixel. Stop when new screenshots stop teaching you anything new.
:::

## The code audit

Screenshots miss what users never see on the screen in front of you: hover states, error states, the admin pages nobody demos. Code catches those. The fastest high-value audit is counting raw color values in your stylesheets.

The first trap is notation. `#FFF`, `#ffffff` and `#FfFfFf` are one color. Normalize before you count, or your numbers will be wrong and someone will notice.

```js run
// A slice of Northwind's CSS, pulled from three repos.
const css = `
  .btn { background: #1F5AE0; color: #FFF; }
  .btn:hover { background: #1b50c9; }
  .card { border: 1px solid #DADFE4; color: #1f2933; }
  .meta { color: #5f6b7a; }
  .footer { color: #66737F; border-top: 1px solid #dde1e6; }
  .title { color: #222B35; }
  .banner { background: #ffffff; color: #1F2933; }
  .link { color: #1f5ae0; }
`;

function expand(hex) {
  const h = hex.slice(1).toLowerCase();
  return h.length === 3 ? '#' + [...h].map((c) => c + c).join('') : '#' + h;
}

const counts = new Map();
for (const match of css.match(/#[0-9a-fA-F]{3,6}\b/g)) {
  const value = expand(match);
  counts.set(value, (counts.get(value) ?? 0) + 1);
}

const ranked = [...counts].sort((a, b) => b[1] - a[1]);
console.log(`${ranked.length} distinct colors`);
for (const [value, n] of ranked) console.log(value, n);
```

Run it and you get nine distinct values from eight short rules. Notice `#1f2933` and `#222b35`: two text colors nobody would tell apart. Notice `#dadfe4` and `#dde1e6`: two border greys. These near-duplicates are the real finding. Nobody chose nine colors; several people each chose one.

On a real codebase you run the same idea over every `.css`, `.scss` and styled-component file, and you add `rgb()` and `hsl()` parsing. The output goes into a spreadsheet: value, count, files, and which cluster of near-identical values it belongs to.

:::mistake Auditing only the main app
The marketing site, the admin tool and the email templates are where drift hides, because they get the least design attention. At Northwind the marketing site alone contributed 23 of our 64 greys. If the system will serve a surface, audit that surface.
:::

## From counts to priorities

Raw counts don't tell you what to do. Two numbers per element do:

| Element | Screens using it | Distinct versions |
|---|---|---|
| Button | 140 | 11 |
| Text input | 96 | 6 |
| Grey (any use) | everywhere | 64 |
| Date picker | 3 | 2 |
| Data table | 31 | 5 |

The system should own first what is **frequent and inconsistent**. Buttons, inputs and greys win; the date picker can wait, even though it is the most painful to build. A component used on three screens is a local problem. A grey used on every screen is everyone's problem.

Then add cost. For each high-priority element, ask engineering how many separate implementations they maintain. Northwind had eleven button components in code, each with its own focus-style bug. "We fix the same bug eleven times" is the sentence that got our headcount approved. Designers often present the inventory as an argument about quality; leaders fund it as an argument about cost.

:::why Why this matters
The inventory is also your baseline. Six months later you rerun the same color script and report "64 greys down to 9". That before-and-after number is how you prove the system works, which is the subject of the last lesson in this course.
:::

## What you hand over

A good inventory ends with three artifacts: the Figma boards, the code audit spreadsheet, and a one-page ranked list of what the system will own in its first two quarters. Keep the boards; you will reuse them to show progress. In the exercise below you do the first consolidation yourself: you turn seven near-identical greys into three named values. Next, you decide the principles and team shape that will keep those decisions from drifting again.
