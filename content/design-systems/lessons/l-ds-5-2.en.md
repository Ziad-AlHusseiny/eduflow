---
summary: Add a second brand to a design system with a small brand tier between primitives and semantic tokens, verify contrast per brand, and decide what brands may and may not change.
takeaways:
  - A brand changes personality (color ramp, typefaces, shape) through a small set of brand tokens; behavior, spacing and accessibility stay shared.
  - Put a brand tier between primitives and semantic tokens, so each brand points the same semantic names at its own palette.
  - Contrast must be checked per brand, and a brand may need a different step of its ramp for the same semantic role.
  - When brands can appear side by side, re-declare semantic mappings under the brand selector so they resolve inside each brand's scope.
further:
  - title: Understanding SC 1.4.3 Contrast (Minimum) (W3C)
    url: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
  - title: Extend a variable collection (Figma)
    url: https://help.figma.com/hc/en-us/articles/36346281624471-Extend-a-variable-collection
  - title: Using CSS custom properties (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
quiz:
  - q: Tidewater's brand team asks for its Dialog to close when people click outside, while Northwind's doesn't. How should the system respond?
    options:
      - text: Add a `brand` prop to Dialog that switches the behavior.
        why: Brand-specific behavior inside components means every component must know about every brand, which doesn't scale past two.
      - text: Fork Dialog for Tidewater.
        why: Two Dialogs drift apart in fixes and accessibility, which is the cost the system exists to avoid.
      - text: Treat it as a product behavior question for both brands, decided in API review; brands change look and voice, not behavior.
        why: Correct. If outside-click closing is right, it's right for both brands; if not, it's wrong for both.
      - text: Let Tidewater override the Dialog's JavaScript with a theme token.
        why: Tokens describe visual values; behavior hidden in tokens is untestable and surprising.
    answer: 2
  - q: Tidewater's teal-600 on white text has a contrast ratio of 3.74:1. What should the Tidewater mapping for `--nw-color-action-bg` be?
    options:
      - text: Keep teal-600; brand colors are exempt from contrast rules.
        why: WCAG makes no brand exception; button text on that background must reach 4.5:1 at normal size.
      - text: Point it at teal-700 (5.47:1 with white text) in the Tidewater brand block.
        why: Correct. Same semantic role, a darker step of the brand's own ramp, and the button text passes.
      - text: Make the button text bold so 3.74:1 is enough.
        why: The 3:1 threshold applies to large text (about 18.66px bold or 24px regular); a normal bold button label still needs 4.5:1.
      - text: Use Northwind blue for Tidewater buttons.
        why: That passes contrast but drops Tidewater's identity from its most visible element.
    answer: 1
  - q: "On the co-branded comparison page, a Tidewater section's buttons are still Northwind blue, although `[data-brand=\"tidewater\"]` sets `--nw-brand-600` correctly. What's missing?"
    options:
      - text: "The semantic token `--nw-color-action-bg` is only declared on `:root`, so it was resolved with Northwind's ramp at the root."
        why: Correct. Re-declaring the semantic mappings under `[data-brand]` makes them resolve inside each brand's section.
      - text: "`data-brand` attributes only work on `<html>`."
        why: Attribute selectors match any element; the problem is where the semantic token is computed.
      - text: The button needs a `.tidewater` class.
        why: Brand-aware classes on components are exactly what the token tiers avoid.
      - text: Custom properties can't be overridden twice on one page.
        why: Custom properties can be redeclared at any level; each element sees its nearest declaration.
    answer: 0
---

Eight months after Northwind acquired Tidewater, its marketing site moved onto Northwind UI. Tidewater's brand team arrived with a 60-page brand book, a serif typeface, a teal palette and rounded pill buttons. They also arrived with a list of 23 "brand requirements" for components. Our job was to say yes to the brand and no to most of the list, and to make both feel reasonable.

## What a brand may change

The first conversation set a boundary. A brand changes **personality**: color palette, typefaces, corner radius, illustration style and voice. A brand doesn't change **behavior or structure**: keyboard handling, focus management, spacing scale, layout grids, component APIs, accessibility. Tidewater's buttons can be teal pills with a serif label. They can't close dialogs on outside click when Northwind's don't, because that's a product decision, not a brand one.

Of the 23 requirements, 15 turned out to be visual and fit into tokens. Six were behavior requests, which went through API review as ordinary proposals for both brands (two were accepted, for both). Two were dropped.

## The brand tier

Section 2 introduced a brand ramp so dark mode could pick steps. For a full second brand, that ramp grows into its own tier between primitives and semantic tokens:

:::figure The brand tier sits between primitives and semantic tokens
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">Primitives include blue and teal palettes and two font families. The Northwind brand tier points brand tokens at blue and Inter; the Tidewater brand tier points them at teal and Georgia. Semantic tokens point at brand tokens, and components point at semantic tokens.</title>
  <rect class="d-box" x="20" y="20" width="140" height="190" rx="10"/>
  <text class="d-label-strong" x="90" y="46" text-anchor="middle">Primitives</text>
  <text class="d-code" x="90" y="80" text-anchor="middle">blue-*</text>
  <text class="d-code" x="90" y="106" text-anchor="middle">teal-*</text>
  <text class="d-code" x="90" y="132" text-anchor="middle">inter</text>
  <text class="d-code" x="90" y="158" text-anchor="middle">georgia</text>
  <rect class="d-box-primary" x="200" y="20" width="160" height="84" rx="10"/>
  <text class="d-label-strong" x="280" y="48" text-anchor="middle">Brand: Northwind</text>
  <text class="d-code" x="280" y="78" text-anchor="middle">brand-600 → blue</text>
  <rect class="d-box-success" x="200" y="126" width="160" height="84" rx="10"/>
  <text class="d-label-strong" x="280" y="154" text-anchor="middle">Brand: Tidewater</text>
  <text class="d-code" x="280" y="184" text-anchor="middle">brand-600 → teal</text>
  <rect class="d-box-accent" x="400" y="80" width="120" height="70" rx="10"/>
  <text class="d-label" x="460" y="120" text-anchor="middle">Semantic</text>
  <rect class="d-box" x="550" y="80" width="100" height="70" rx="10"/>
  <text class="d-label" x="600" y="120" text-anchor="middle">Components</text>
  <path class="d-arrow" d="M200 62 L164 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M200 168 L164 140" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 105 L364 70" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 125 L364 160" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M550 115 L524 115" marker-end="url(#arrow)"/>
</svg>
:::

The brand tier is deliberately small. Northwind's has 24 tokens: a color ramp from 50 to 900, a heading and a body font family, two radii and a focus-ring color. Semantic tokens point at brand tokens, and components never know a brand exists.

```css
:root,
[data-brand] {
  --nw-color-action-bg: var(--nw-brand-600);
  --nw-color-action-text: var(--nw-white);
  --nw-font-heading: var(--nw-brand-font-heading);
  --nw-radius-control: var(--nw-brand-radius-control);
}

[data-brand="tidewater"] {
  --nw-brand-600: var(--nw-teal-600);
  --nw-brand-700: var(--nw-teal-700);
  --nw-brand-font-heading: Georgia, 'Times New Roman', serif;
  --nw-brand-radius-control: 999px;
  /* Tidewater's 600 fails contrast with white text: use the darker step. */
  --nw-color-action-bg: var(--nw-brand-700);
}
```

The selector `:root, [data-brand]` matters. Remember from the themes lesson that a custom property containing `var()` is resolved where it is declared. Declared only on `:root`, `--nw-color-action-bg` would be computed once with Northwind's ramp, and a Tidewater section on the same page would inherit Northwind blue. Re-declaring the semantic mappings on every `[data-brand]` element makes them resolve inside each brand's scope. That's what lets Northwind's co-branded comparison page show both brands side by side.

## Contrast is per brand

The last line of the Tidewater block is the interesting one. Northwind's action color is step 600 of its ramp. Tidewater's 600 is lighter, so white button text on it fails:

```js run
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = { 'northwind blue-600': '#1f5ae0', 'tidewater teal-600': '#0d9488', 'tidewater teal-700': '#0f766e' };
for (const [name, bg] of Object.entries(pairs)) {
  const ratio = contrast(bg, '#ffffff');
  console.log(`${name} + white text: ${ratio.toFixed(2)}:1 ${ratio >= 4.5 ? 'pass' : 'FAIL'}`);
}
```

So Tidewater maps the same semantic role to a different step. This is why the brand tier doesn't just swap palettes blindly: each brand's semantic mapping is designed and checked. The contrast check in Northwind's pipeline runs every documented pair in every brand and theme, and it caught this before the brand team saw a single button.

:::mistake Brand logic inside components
The first Tidewater pull request added `if (brand === 'tidewater')` to the Button. Within a month, five components had brand conditionals, and nobody could add a third brand without touching all of them. If a difference can't be expressed as a token, question whether it's really a brand difference.
:::

## Delivering brands

Each surface loads what it needs. The marketing sites set `data-brand` on `<html>` and load only their brand's CSS file, generated by the pipeline from `primitives` + `brand-tidewater` + `semantic`. The dispatch app, which shows both brands in its admin views, loads both blocks. In Figma, the same structure lives in extended collections, so Tidewater's designers see the shared semantic variables with their brand's values.

Every brand also doubles the test matrix. With two brands, two color schemes and two densities, each core component renders in eight combinations in the visual suite from Section 4. That sounds expensive until you remember the alternative: a Tidewater designer discovering in production that the dark-mode focus ring is invisible on teal. Machines are cheap reviewers for combinations; humans only look at the diffs.

:::tip Budget the brand surface
Northwind reviews any request to grow the brand tier beyond its 24 tokens. Each new brand token multiplies the combinations you test. A small, fixed brand surface is what makes adding a third brand a two-week job instead of a quarter.
:::

In the exercise, you add Tidewater to a page where both brands appear side by side. Next, you measure whether all of this is actually being used.
