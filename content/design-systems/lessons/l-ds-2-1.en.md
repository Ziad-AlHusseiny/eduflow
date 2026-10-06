---
summary: Structure design tokens in primitive, semantic and component tiers as CSS custom properties, so one change of intent updates every component that shares it.
takeaways:
  - Primitive tokens name raw values (`--nw-blue-600`); semantic tokens name intent (`--nw-color-action-bg`); component tokens name one component's knobs.
  - Components reference semantic tokens, never primitives, so re-theming only changes the semantic tier.
  - Declare component tokens on the component's selector, not on `:root`, so they resolve against overrides in that part of the page.
  - Add component tokens sparingly; each one is public API you will have to support.
further:
  - title: Using CSS custom properties (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
  - title: var() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/var
  - title: Design tokens (Material Design 3)
    url: https://m3.material.io/foundations/design-tokens
quiz:
  - q: Marketing wants every primary action on the site to turn green for a campaign. With a three-tier system, which tier do you change?
    options:
      - text: The primitive tier, by changing `--nw-blue-600` to green.
        why: That turns every use of that blue green, including links and info badges that aren't actions, and makes the name a lie.
      - text: The semantic tier, by pointing `--nw-color-action-bg` at a green primitive.
        why: Correct. Every component that expresses "primary action" follows the change, and nothing else does.
      - text: The component tier, by overriding the background of each component one by one.
        why: It works, but you would have to find every component with an action color, which is the problem tiers are meant to solve.
      - text: None; add a new `.green` class to each button.
        why: One-off classes bypass the system entirely and leave cleanup for after the campaign.
    answer: 1
  - q: |
      Why does the button inside `.promo` stay blue?
      ```css
      :root {
        --nw-color-action-bg: var(--nw-blue-600);
        --nw-button-bg: var(--nw-color-action-bg);
      }
      .promo { --nw-color-action-bg: var(--nw-green-600); }
      .nw-button { background: var(--nw-button-bg); }
      ```
    options:
      - text: Custom properties don't inherit into buttons.
        why: Custom properties inherit by default, including into buttons; inheritance is what delivers the blue.
      - text: "`.promo` has lower specificity than `:root`."
        why: The two rules target different elements, so specificity isn't compared; both declarations apply where they are written.
      - text: The browser caches the first value of each custom property.
        why: There is no caching; values are computed per element during the normal cascade.
      - text: "`--nw-button-bg` was resolved on `:root`, so buttons inherit the already-computed blue."
        why: Correct. `var()` inside a custom property is substituted where it is declared; move `--nw-button-bg` onto `.nw-button` and it resolves against `.promo`'s override.
    answer: 3
  - q: A teammate proposes a component token for every CSS property of every component. What's the main cost?
    options:
      - text: Browsers slow down noticeably with more than 100 custom properties.
        why: Browsers handle thousands of custom properties fine; performance isn't the issue at this scale.
      - text: Every token becomes public API that teams depend on, so the system gets hard to change.
        why: Correct. Each exposed knob is a promise; renaming or removing it later is a breaking change.
      - text: Component tokens can't reference semantic tokens.
        why: They can and should; that's how the tiers connect.
    answer: 1
---

Northwind's first token file was a list of colors: `--blue-600`, `--gray-200`, `--red-500`. Every component used them directly. It looked tidy until the Tidewater acquisition, when someone asked a simple question: "Which blues are Northwind brand blues, and which are just links?" Nobody could answer without reading 300 files. A flat list of colors records values. It doesn't record decisions.

## Tier 1: primitives

Primitives are the palette: every raw value the system allows, named by what it *is*.

```css
:root {
  --nw-blue-600: #1f5ae0;
  --nw-blue-700: #1848b8;
  --nw-gray-900: #1f2933;
  --nw-gray-200: #d9dee3;
  --nw-white: #ffffff;
  --nw-space-2: 0.5rem;
  --nw-space-4: 1rem;
}
```

Primitives answer "which values exist?" They deliberately carry no meaning. `--nw-blue-600` doesn't know whether it's a button, a link or a chart line.

## Tier 2: semantic tokens

Semantic tokens name an *intent* and point at a primitive:

```css
:root {
  --nw-color-action-bg: var(--nw-blue-600);
  --nw-color-action-bg-hover: var(--nw-blue-700);
  --nw-color-action-text: var(--nw-white);
  --nw-color-text: var(--nw-gray-900);
  --nw-color-border: var(--nw-gray-200);
}
```

This is the tier people use most, and the one themes change. When dark mode or the Tidewater brand arrives, you remap these names to different primitives and leave every component alone.

## Tier 3: component tokens

Component tokens name one component's adjustable parts and point at semantic tokens:

```css
.nw-button {
  --nw-button-bg: var(--nw-color-action-bg);
  --nw-button-text: var(--nw-color-action-text);
  --nw-button-padding-x: var(--nw-space-4);

  background: var(--nw-button-bg);
  color: var(--nw-button-text);
  padding: var(--nw-space-2) var(--nw-button-padding-x);
}
```

Now three kinds of change each have one obvious place:

:::figure Each tier references only the tier below it
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">Component token button-bg points to semantic token color-action-bg, which points to primitive blue-600 with the value 1f5ae0. Each tier is changed for a different reason.</title>
  <rect class="d-box-accent" x="20" y="30" width="190" height="56" rx="10"/>
  <text class="d-code" x="115" y="63" text-anchor="middle">--nw-button-bg</text>
  <rect class="d-box-primary" x="235" y="30" width="190" height="56" rx="10"/>
  <text class="d-code" x="330" y="63" text-anchor="middle">--nw-color-action-bg</text>
  <rect class="d-box" x="450" y="30" width="190" height="56" rx="10"/>
  <text class="d-code" x="545" y="63" text-anchor="middle">--nw-blue-600</text>
  <path class="d-arrow" d="M210 58 L231 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M425 58 L446 58" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="115" y="120" text-anchor="middle">Component</text>
  <text class="d-label-strong" x="330" y="120" text-anchor="middle">Semantic</text>
  <text class="d-label-strong" x="545" y="120" text-anchor="middle">Primitive</text>
  <text class="d-label-muted" x="115" y="150" text-anchor="middle">Change one component</text>
  <text class="d-label-muted" x="330" y="150" text-anchor="middle">Change a theme or brand</text>
  <text class="d-label-muted" x="545" y="150" text-anchor="middle">Change the palette</text>
  <text class="d-code" x="545" y="190" text-anchor="middle">#1f5ae0</text>
  <path class="d-line" d="M545 86 L545 172"/>
</svg>
:::

- **New palette** (a slightly more accessible blue): change the primitive.
- **New theme or brand** (dark mode, Tidewater): remap semantic tokens.
- **One component needs to differ** (the marketing hero button uses a larger padding): override that component's token.

The rule that makes this work: **components reference semantic tokens, never primitives.** The moment a component uses `--nw-blue-600` directly, it stops following themes, and you have rebuilt the flat list with longer names.

:::mistake Declaring component tokens on :root
If you write `--nw-button-bg: var(--nw-color-action-bg)` inside `:root`, the browser substitutes the `var()` right there, at the root. Every button then inherits the already-computed blue, and an override of `--nw-color-action-bg` on a `.promo` section has no effect on its buttons. Declare component tokens on the component's own selector, so they resolve on each button against whatever semantic values its ancestors set.
:::

## How the browser resolves a token

Custom properties inherit like `color` does. When the browser computes styles for a button, it looks up `--nw-button-bg` on the button itself, finds `var(--nw-color-action-bg)`, then looks that up on the button too, where the value is inherited from the nearest ancestor that set it. That's why you can re-theme part of a page by setting a semantic token on a container:

```css
.campaign-banner {
  --nw-color-action-bg: var(--nw-green-600);
}
```

Every button inside the banner turns green; every button outside stays blue. No new classes, no component changes. This scoping behavior is the foundation for themes in the next lessons.

:::tip Be stingy with component tokens
Northwind exposes component tokens only for values that teams have actually needed to change, usually two to five per component. Every token you publish is a promise you have to keep through future releases. You can always add a token later; removing one is a breaking change.
:::

## Not just colors

Every category of token gets the same treatment. Spacing primitives are a scale (`--nw-space-1` to `--nw-space-12`); semantic spacing names a role, such as `--nw-space-inset-md` for padding inside a card or `--nw-space-stack-sm` for the gap between stacked form fields. Typography primitives are font families, sizes and weights; semantic typography names styles such as `--nw-font-body` or `--nw-font-heading-lg`. Radii, shadows and motion durations follow the same pattern.

For scale, Northwind today has about 180 primitives, 120 semantic tokens and 90 component tokens. The semantic tier is where most of the design thinking happens, and it's the tier designers and engineers should reach for first. If a team keeps asking for a primitive, that usually means a semantic token is missing, and the right fix is to add the role, not to hand out the raw value.

## A quick way to check your tiers

Open any component's CSS and search for your primitive prefix, such as `--nw-blue` or `--nw-gray`. In a healthy system those names appear in exactly one place: the semantic token definitions. Northwind runs this as a lint rule in CI, which you will meet in Section 4. In the exercise, you add the semantic and component tiers to a button that currently skips straight to a primitive. Next, you name these tokens so they still make sense in three years.
