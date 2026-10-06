---
summary: Build light and dark themes, brands and density modes by remapping semantic tokens under data attributes, so the same components render correctly in every combination.
takeaways:
  - A theme or mode is a remapping of semantic tokens; components and primitives stay the same.
  - Treat color scheme, brand and density as independent axes, each owning its own set of tokens, so combinations don't multiply your work.
  - Selectors like `[data-theme="dark"]` work on any element, so a section of a page can use a different theme from the rest.
  - Set `color-scheme` with your dark theme so browser-drawn parts like form controls and scrollbars match.
further:
  - title: prefers-color-scheme (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme
  - title: color-scheme (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme
  - title: light-dark() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark
quiz:
  - q: Northwind has 2 color schemes, 2 brands and 2 densities. How many hand-written theme files should you need if the axes are independent?
    options:
      - text: Eight, one for each combination.
        why: That's the result of treating combinations as themes; it grows multiplicatively and each file duplicates the others.
      - text: Six, one block per value on each axis, plus small overrides only where two axes truly interact.
        why: Correct. Each axis owns its tokens, so you write 2 + 2 + 2 blocks and let the cascade combine them.
      - text: Two, light and dark, with brand and density handled in components.
        why: Pushing brand and density into components means every component needs to know about them, which is what tokens avoid.
      - text: One, because the browser calculates dark colors automatically.
        why: Browsers don't derive a usable dark palette from a light one; you design and map it.
    answer: 1
  - q: The marketing hero sets `data-theme="dark"` on its `<section>`, but its cards stay white. The dark block is written as `html[data-theme="dark"] { … }`. What's wrong?
    options:
      - text: Data attributes don't work on `<section>` elements.
        why: Any element can carry data attributes, and attribute selectors match them anywhere.
      - text: Custom properties don't inherit through `<section>`.
        why: Custom properties inherit through every element.
      - text: The `html` type selector limits the dark tokens to the root, so the section's attribute never matches.
        why: Correct. Writing `[data-theme="dark"]` alone lets any element start a dark subtree.
      - text: "The hero needs `color-scheme: dark` to activate the tokens."
        why: The `color-scheme` property changes browser-drawn UI like scrollbars; it doesn't switch your custom properties.
    answer: 2
  - q: In dark mode, Northwind's buttons use `--nw-blue-400` instead of `--nw-blue-600`. Tidewater buttons use a teal ramp. Which structure handles both cleanly?
    options:
      - text: The brand sets a `--nw-brand-*` primitive ramp; the theme picks which step of the ramp each semantic token uses.
        why: Correct. Brand decides *which* colors, theme decides *how light or dark*, and neither needs to know about the other.
      - text: Four blocks with combined selectors for every brand and theme pair.
        why: It works for two brands, but every new brand or mode multiplies the blocks to maintain.
      - text: Separate button components for each brand.
        why: Forking components per brand undoes the reason for having a shared system.
    answer: 0
---

The dispatch app's night-shift users asked for dark mode for two years. Every estimate came back at "six weeks per product", because colors were hard-coded in hundreds of components. With the semantic tier from the last lesson, Northwind's dark mode took nine days, most of it design review. The components didn't change at all.

## A theme is a remapping

A theme changes which primitive each semantic token points at. Nothing else.

```css
:root {
  --nw-color-surface: var(--nw-gray-0);
  --nw-color-text: var(--nw-gray-900);
  --nw-color-action-bg: var(--nw-blue-600);
  --nw-color-action-text: var(--nw-gray-0);
}

[data-theme="dark"] {
  color-scheme: dark;
  --nw-color-surface: var(--nw-gray-950);
  --nw-color-text: var(--nw-gray-100);
  --nw-color-action-bg: var(--nw-blue-400);
  --nw-color-action-text: var(--nw-gray-950);
}
```

Two details matter. First, the selector is `[data-theme="dark"]`, not `html[data-theme="dark"]`, so any element can start a dark subtree: the marketing site's hero is dark on an otherwise light page. Second, `color-scheme: dark` tells the browser to draw its own UI, such as scrollbars, checkboxes and date inputs, in dark colors too.

Notice the action blue changes step, from 600 to 400. Dark backgrounds need lighter accent colors to keep contrast, so dark mode is a design task, not a color inversion.

## Designing the dark palette

Three rules saved Northwind weeks of review. Check contrast for every text and background pair in the dark theme separately, because a pair that passes on white can fail on near-black. Avoid pure black surfaces; a very dark grey like `#111827` is easier on the eyes and leaves room for darker shadows. And express elevation with lighter surfaces rather than heavier shadows, since shadows barely show on dark backgrounds: a raised card in dark mode is a step lighter than the page behind it.

That last rule is a good example of why the semantic tier needs names like `--nw-color-surface-raised`. In light mode it maps to white on a light grey page; in dark mode it maps to a slightly lighter grey. Same name, same role, different values.

:::mistake Dark mode with filter: invert()
Inverting the page is a tempting shortcut. It flips photos and logos, turns brand colors into their complements, and produces contrast you never tested. Design the dark palette and map it through semantic tokens.
:::

## Following the system preference

Respect the operating system setting by default, and let users override it:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --nw-color-surface: var(--nw-gray-950);
    /* …same remapping as [data-theme="dark"] */
  }
}
```

```js
// Inline in <head>, before the CSS paints, so there is no flash of the wrong theme.
const saved = localStorage.getItem('nw-theme');
if (saved === 'light' || saved === 'dark') {
  document.documentElement.dataset.theme = saved;
}
```

Duplicating the dark block inside the media query is the price of supporting both. Northwind's token pipeline generates both copies from one source, which you'll set up in two lessons. For simple two-mode colors you can also use the CSS `light-dark()` function with `color-scheme: light dark`, but it only switches colors (and, in newer browsers, images) between exactly two schemes, so it doesn't replace token remapping for brands or density.

## Modes are independent axes

Northwind has three axes, each set by its own attribute:

:::figure Three independent axes, each owning a different set of tokens
<svg viewBox="0 0 660 250" role="img" aria-labelledby="t1">
  <title id="t1">Three columns. Color scheme light or dark owns surface and text tokens. Brand Northwind or Tidewater owns the brand color ramp. Density comfortable or compact owns spacing and control height. All three feed the same components.</title>
  <rect class="d-box-primary" x="20" y="20" width="190" height="96" rx="10"/>
  <text class="d-label-strong" x="115" y="46" text-anchor="middle">data-theme</text>
  <text class="d-label" x="115" y="72" text-anchor="middle">light | dark</text>
  <text class="d-label-muted" x="115" y="98" text-anchor="middle">surfaces, text, steps</text>
  <rect class="d-box-accent" x="235" y="20" width="190" height="96" rx="10"/>
  <text class="d-label-strong" x="330" y="46" text-anchor="middle">data-brand</text>
  <text class="d-label" x="330" y="72" text-anchor="middle">northwind | tidewater</text>
  <text class="d-label-muted" x="330" y="98" text-anchor="middle">brand ramp, fonts</text>
  <rect class="d-box-success" x="450" y="20" width="190" height="96" rx="10"/>
  <text class="d-label-strong" x="545" y="46" text-anchor="middle">data-density</text>
  <text class="d-label" x="545" y="72" text-anchor="middle">comfortable | compact</text>
  <text class="d-label-muted" x="545" y="98" text-anchor="middle">space, control height</text>
  <path class="d-arrow" d="M115 116 L300 180" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M330 116 L330 176" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M545 116 L360 180" marker-end="url(#arrow)"/>
  <rect class="d-box" x="230" y="182" width="200" height="48" rx="10"/>
  <text class="d-label" x="330" y="211" text-anchor="middle">Same components</text>
</svg>
:::

The trick that keeps them independent is ownership: each axis remaps its own tokens and never another axis's. Density only touches spacing:

```css
:root {
  --nw-space-control-y: var(--nw-space-2);
  --nw-space-control-x: var(--nw-space-4);
}
[data-density="compact"] {
  --nw-space-control-y: var(--nw-space-1);
  --nw-space-control-x: var(--nw-space-3);
}
```

Brand and color scheme do interact, because Tidewater's teal needs a lighter step in dark mode just like Northwind's blue. Solve it with one level of indirection: the brand defines a ramp of brand primitives, and the theme chooses the step.

```css
:root { /* Northwind is the default brand */
  --nw-brand-400: var(--nw-blue-400);
  --nw-brand-600: var(--nw-blue-600);
}
[data-brand="tidewater"] {
  --nw-brand-400: var(--nw-teal-400);
  --nw-brand-600: var(--nw-teal-600);
}
:root { --nw-color-action-bg: var(--nw-brand-600); }
[data-theme="dark"] { --nw-color-action-bg: var(--nw-brand-400); }
```

Now `<html data-brand="tidewater" data-theme="dark" data-density="compact">` works without a single combined selector. One caveat: this version assumes `data-brand` sits on `<html>`, which holds for Northwind because a page belongs to one brand. The `:root` mapping is computed once at the root, so if a brand could change mid-page you would repeat the semantic mappings under `[data-brand]` as well, for the same reason component tokens live on component selectors. Brand decides which colors, theme decides how light, density decides how tight. Eight combinations, six small blocks.

:::tip Test the corners
Combinations you never look at are the ones that break. Northwind's visual tests render every core component in all eight combinations; Section 4 shows how. Until then, keep a scratch page that renders a button, an input and a card in each corner.
:::

In the exercise, you add a dark theme that works on any element and a compact density mode. Next, you move these tokens out of hand-written CSS into a format every tool can read.
