---
summary: "Organise a growing stylesheet with cascade layers, token tiers, single-class components and a small set of utilities, so a team can change CSS without fear."
takeaways:
  - "A layer order such as `reset, tokens, base, layouts, components, utilities` decides conflicts between kinds of CSS, so selectors can stay at one class."
  - "Tokens work best in tiers: raw palette values, semantic roles like `--color-brand`, and component-level properties like `--card-accent` that a parent can override."
  - "Components should not set their own outer margins; the layout around them owns the spacing, usually with `gap`."
  - "Keep utilities few and single-purpose, in the last layer, so they win without `!important`."
further:
  - title: "Cascade layers (MDN guide)"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers
  - title: "@scope (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope
  - title: "Organizing your CSS (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Organizing
quiz:
  - q: "A sponsor page needs every session card's accent in teal instead of violet. In a token-based architecture, what's the right change?"
    options:
      - text: "Add `.sponsor-page .session-card { border-color: teal !important; }`."
        why: "That overrides one property with brute force; the badge, hover state and anything else using the accent stay violet."
      - text: "Copy the card's CSS into a `.session-card--sponsor` variant with teal values."
        why: "Duplicated component CSS drifts the first time someone edits the original."
      - text: "Set `--card-accent: teal` on the sponsor page's wrapper."
        why: "Correct. The card reads `--card-accent` everywhere it uses the accent, and custom properties inherit, so one declaration re-themes every part of every card inside."
    answer: 2
  - q: "Why shouldn't `.session-card` set `margin-bottom: 16px` on itself?"
    options:
      - text: "Because margins don't work on grid items."
        why: "Margins work on grid items; the problem is who decides the spacing."
      - text: "Because spacing depends on where the card is placed, so the layout around it should own it, for example with `gap`."
        why: "Correct. The same card sits in a grid, a sidebar and a carousel; each context needs different spacing, and a built-in margin fights all of them."
      - text: "Because margins are slower to render than gap."
        why: "There's no meaningful performance difference; this is about ownership and reuse."
      - text: "Because logical properties should be used instead."
        why: "`margin-block-end` would have the same problem; the issue is the component spacing itself, not the property name."
    answer: 1
  - q: "Where should a `.u-hidden { display: none; }` utility live so it always beats component display rules without `!important`?"
    options:
      - text: "In the last declared layer, such as `utilities`."
        why: "Correct. Later layers win for normal declarations, whatever the specificity of the component selector."
      - text: "In the `reset` layer, so it applies early."
        why: "Early layers lose to later ones; any component setting `display` would override it."
      - text: "Unlayered, at the top of the stylesheet."
        why: "Unlayered styles do beat every layer, but leaving rules unlayered on purpose makes the order invisible and invites more unlayered patches."
    answer: 0
---

Waypoint's front end started with one developer and one `styles.css`. Two years later there are five developers, forty components, a sponsor microsite that reskins the schedule, and a stylesheet nobody dares to delete from. Every bug fix is a new override, every override is a little heavier than the last, and the `!important` count only goes up.

That's not a discipline problem. It's an architecture problem, and everything in this course so far gives you the pieces to fix it.

## The layer stack is the architecture

Start the entry stylesheet with one statement that names every kind of CSS you have, in priority order:

```css title=main.css
@layer reset, tokens, base, layouts, components, utilities;

@import url("reset.css") layer(reset);
@import url("tokens.css") layer(tokens);
@import url("base.css") layer(base);
@import url("layouts/schedule.css") layer(layouts);
@import url("components/session-card.css") layer(components);
@import url("components/speaker.css") layer(components);
@import url("utilities.css") layer(utilities);
```

Each layer has one job:

| Layer | Contains | Example |
|---|---|---|
| reset | Normalising browser defaults | `*, *::before { box-sizing: border-box; }` |
| tokens | Custom properties only | `--color-brand`, `--space-m` |
| base | Bare element styles, low specificity | `:where(a) { color: var(--link); }` |
| layouts | Page and region structure | `.schedule { display: grid; gap: … }` |
| components | One block per component | `.session-card { … }` |
| utilities | Single-purpose overrides | `.u-hidden`, `.u-visually-hidden` |

Because layers decide conflicts *between* kinds, selectors within each layer can stay flat: one class for a component, `:where()` for base styles. Nobody needs an ID or a three-class chain to win, so nobody writes one.

:::figure Tokens flow from raw values to roles to components; layers decide which kind of rule wins
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Three token tiers connected by arrows: palette values such as violet 600 feed semantic tokens such as color brand, which feed component tokens such as card accent. A sponsor wrapper overrides card accent. Beside them, the layer stack from reset to utilities.</title>
  <rect class="d-box" x="20" y="20" width="200" height="50" rx="10"/>
  <text class="d-code" x="36" y="50">--violet-600</text>
  <path class="d-arrow" d="M120 70 L120 96" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="20" y="100" width="200" height="50" rx="10"/>
  <text class="d-code" x="36" y="130">--color-brand</text>
  <path class="d-arrow" d="M120 150 L120 176" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="20" y="180" width="200" height="40" rx="10"/>
  <text class="d-code" x="36" y="205">--card-accent</text>
  <rect class="d-box-warn" x="250" y="180" width="170" height="40" rx="10"/>
  <text class="d-code" x="262" y="205">.theme-sponsor</text>
  <path class="d-arrow" d="M250 200 L224 200" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="470" y="24">Layer order</text>
  <text class="d-code" x="470" y="54">1 reset</text>
  <text class="d-code" x="470" y="80">2 tokens</text>
  <text class="d-code" x="470" y="106">3 base</text>
  <text class="d-code" x="470" y="132">4 layouts</text>
  <text class="d-code" x="470" y="158">5 components</text>
  <text class="d-code" x="470" y="184">6 utilities</text>
  <text class="d-label-muted" x="470" y="212">later wins</text>
</svg>
:::

## Tokens in three tiers

A flat list of 200 custom properties is as hard to maintain as 200 hex codes. Tier them:

1. **Palette**: raw values, named by what they are. `--violet-600: oklch(52% 0.22 290);`
2. **Semantic**: roles, named by what they're for. `--color-brand: var(--violet-600); --surface: light-dark(…);`
3. **Component**: a component's public dials, defaulting to semantic tokens. `--card-accent: var(--color-brand);`

Keep tier 1 small and boring: a dozen hues with a handful of steps each covers most products. The interesting decisions happen in tier 2, where a designer and a developer agree on what "brand", "surface" or "danger" means in each theme.

Components only read tiers 2 and 3. Then a rebrand changes tier 1, dark mode changes tier 2, and a sponsor page changes tier 3 on a wrapper:

```css
@layer tokens {
  :root {
    --color-brand: oklch(52% 0.22 290);
    --card-accent: var(--color-brand);
  }
  .theme-sponsor {
    --card-accent: oklch(55% 0.11 210);
  }
}
```

Every card inside `.theme-sponsor` turns teal: border, badge, hover state, all of it, because they all read `--card-accent`.

## Component rules

A handful of conventions keeps forty components predictable:

- **One root class**, with parts nested inside it: `.session-card { h3 { … } .badge { … } }`. Nesting stays one or two levels deep.
- **State through attributes**: `[aria-pressed="true"]`, `[data-state="live"]`, `:has(:checked)`. The attribute is also the accessible state, so CSS and assistive technology can't disagree.
- **No outer margins on the root.** The component doesn't know where it lives.

:::mistake Components that space themselves
`.session-card { margin-bottom: 16px; }` looks harmless until the card goes into a grid with `gap: 24px` (now there's 40px), a sidebar that needs 8px, and a carousel that needs none. Each context then overrides the margin. Let layouts own spacing with `gap`, and components own only their insides.
:::

## Utilities: few and final

Utilities are single-purpose classes the HTML can apply directly: `.u-hidden`, `.u-visually-hidden`, `.u-flow` (vertical rhythm). Put them in the last layer and they win over any component without `!important`. Keep the set small and boring. If you find yourself writing `.u-mt-17`, you're building a second styling language inside the first; a design-token-driven utility framework is a valid choice, but make it a deliberate one, not drift.

## Scoping with @scope

When a component must not leak styles into nested content, such as a CMS-rendered abstract inside a card, `@scope` limits rules to a subtree and can stop at an inner boundary:

```css
@scope (.session-card) to (.cms-content) {
  p { margin-block: 0.5rem; }
}
```

The paragraph rule applies inside cards but not inside `.cms-content`. `@scope` became Baseline in March 2026, so it's a recent tool; layers and single-class components already solve most scoping problems, and `@scope` handles the remaining "donut" cases.

:::tip Enforce it with a linter
Conventions drift without automation. Stylelint can reject ID selectors, `!important` outside the utilities file, and nesting deeper than two levels. Add those three rules and review conversations get much shorter.
:::

## Your turn

The exercise is a small slice of the old stylesheet: ID selectors, `!important`, a component with its own margin. Refactor it into layers with a token for the card accent, a sponsor theme, layout-owned spacing and a utility that wins cleanly. The final lesson looks at what all this CSS costs the browser, and how to keep animations and layouts fast.
