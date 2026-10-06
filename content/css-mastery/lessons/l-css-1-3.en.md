---
summary: "Organise a stylesheet into cascade layers so that whole groups of styles (reset, components, utilities) win by layer order instead of by specificity."
takeaways:
  - "Declare your layer order once at the top with `@layer reset, base, components, utilities;` and later layers win over earlier ones regardless of specificity."
  - "Specificity still matters, but only between declarations inside the same layer."
  - "Normal styles that are not in any layer beat every layered style, so wrap legacy or third-party CSS in a layer instead of leaving it loose."
  - "`!important` reverses layer order: an important declaration in an early layer beats an important one in a later layer."
further:
  - title: "@layer (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer
  - title: "Cascade layers (MDN guide)"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers
  - title: "A complete guide to CSS cascade layers (CSS-Tricks)"
    url: https://css-tricks.com/css-cascade-layers/
quiz:
  - q: |
      Which background does `.badge.sold-out` get?
      ```css
      @layer components, utilities;
      @layer utilities { .sold-out { background: gold; } }
      @layer components { .schedule .card .badge { background: lavender; } }
      ```
    options:
      - text: "lavender, because its selector has higher specificity."
        why: "Specificity is only compared within a layer. The two rules are in different layers, so layer order decides first."
      - text: "lavender, because the components block appears later in the file."
        why: "Layer order comes from the first `@layer` statement, not from where each block appears."
      - text: "gold, because `utilities` is declared after `components`."
        why: "Correct. Later-declared layers win for normal declarations, before specificity is consulted."
    answer: 2
  - q: "You add `@layer reset, components;` and wrap your code, but an old rule `h2 { color: black; }` sitting outside any layer still overrides your component headings. Why?"
    options:
      - text: "Unlayered normal styles have higher priority than every layer."
        why: "Correct. Unlayered styles act like an implicit final layer. Wrap the legacy CSS in its own early layer to demote it."
      - text: "Type selectors always beat layered rules."
        why: "Selector type has nothing to do with it; any unlayered selector, even `*`, beats layered rules for normal declarations."
      - text: "The browser ignores `@layer` when a file mixes layered and unlayered rules."
        why: "Mixing is fully supported. The browser places all unlayered rules in an implicit layer above the named ones."
      - text: "The `h2` rule loads first, so it is locked in."
        why: "Source order is the last tie-breaker, and here layering already separates the two rules."
    answer: 0
  - q: "How do you put a third-party stylesheet into the lowest-priority layer?"
    options:
      - text: "`@layer vendor { @import url(picker.css); }`"
        why: "`@import` can't appear inside a layer block; imports must come at the top of a stylesheet."
      - text: "`@import url(picker.css) layer(vendor);` after declaring `@layer vendor, base, components;`"
        why: "Correct. The `layer()` function on `@import` puts the whole file into the named layer, and the order statement makes that layer first."
      - text: "`<link rel=\"stylesheet\" href=\"picker.css\" layer=\"vendor\">`"
        why: "There is no `layer` attribute on `<link>`; layering a file is done with `@import … layer()`."
    answer: 1
  - q: "In a `components` layer, a declaration says `color: red !important`. In a later `utilities` layer, another says `color: blue !important`. Which wins?"
    options:
      - text: "blue, because utilities is the later layer."
        why: "That's the rule for normal declarations. For important ones the layer order flips."
      - text: "red, because important declarations reverse layer order."
        why: "Correct. Reversal lets a low-level layer (such as a reset) protect a value with `!important` that later layers can't override."
      - text: "Whichever selector has the higher specificity."
        why: "Layer order is still resolved before specificity; specificity only compares declarations from the same layer."
    answer: 1
---

Waypoint's stylesheet has grown four kinds of CSS: a reset, base element styles, components like the session card, and one-job utilities like `.bg-accent` that the content team sprinkles into the HTML. Utilities are supposed to win; that's their whole point. But a component selector such as `.schedule .session-card .badge` scores (0,3,0), and a utility scores (0,1,0), so the utility loses and someone writes `!important` again.

Specificity was never designed to express "this *group* of styles outranks that group". **Cascade layers** were.

## Declare the order, then fill the layers

A layer is a named bucket of rules. You announce the order once, at the top of your CSS:

```css title=styles.css
@layer reset, base, components, utilities;
```

Then you put rules into layers, in any order, from any file:

```css
@layer components {
  .schedule .session-card .badge {
    background: #ede9fe;
    color: #5b21b6;
  }
}

@layer utilities {
  .bg-accent { background: #fde68a; }
}
```

Now `.bg-accent` wins over the component's background, despite its lower specificity. When the cascade reaches step 3 (layers) it sees the two declarations come from different layers and picks the later-declared one. It never gets to specificity. Inside a single layer, specificity and source order work as you already know.

:::figure Later layers win for normal declarations; unlayered styles sit on top
<svg viewBox="0 0 640 300" role="img" aria-labelledby="t1">
  <title id="t1">Layers stacked from lowest to highest priority: reset, base, components, utilities, and unlayered styles on top. An arrow on the right points upward labelled higher priority.</title>
  <rect class="d-box" x="60" y="236" width="400" height="44" rx="10"/>
  <text class="d-code" x="80" y="264">@layer reset</text>
  <rect class="d-box" x="60" y="184" width="400" height="44" rx="10"/>
  <text class="d-code" x="80" y="212">@layer base</text>
  <rect class="d-box-primary" x="60" y="132" width="400" height="44" rx="10"/>
  <text class="d-code" x="80" y="160">@layer components</text>
  <rect class="d-box-accent" x="60" y="80" width="400" height="44" rx="10"/>
  <text class="d-code" x="80" y="108">@layer utilities</text>
  <rect class="d-box-warn" x="60" y="20" width="400" height="44" rx="10"/>
  <text class="d-label-strong" x="80" y="48">Unlayered styles</text>
  <path class="d-arrow" d="M500 276 L500 30" marker-end="url(#arrow)"/>
  <text class="d-label" x="516" y="150">higher</text>
  <text class="d-label" x="516" y="172">priority</text>
</svg>
:::

The first `@layer` statement fixes the order. If you write `@layer utilities { … }` before ever declaring `components`, utilities becomes the *first* (lowest) layer. That's why the order statement belongs at the very top of your entry stylesheet.

## Unlayered styles win

Any normal rule that isn't inside a layer goes into an implicit layer that beats all named layers. It feels backwards at first, but it's what makes layers adoptable: you can wrap new code in layers today, and the existing unlayered CSS keeps its current behaviour.

The flip side is a classic trap.

:::mistake Leaving legacy CSS outside the layers
You layer your new components, and an old `h2 { color: black; }` from the prototype still beats them, because unlayered beats layered. Wrap legacy or third-party CSS in its own early layer, for example `@layer legacy, reset, base, components, utilities;`, so it loses to everything you write on purpose.
:::

Third-party files can go straight into a layer when you import them:

```css
@layer vendor, reset, base, components, utilities;
@import url("calendar-widget.css") layer(vendor);
```

Note that `@import` rules must come before other rules except `@charset` and `@layer` statements, which is exactly why the order statement can sit above it.

## Important declarations flip the order

For `!important` declarations, layer priority reverses: an important rule in `reset` beats an important rule in `utilities`, and important layered rules beat important unlayered ones. This mirrors how origins work (a user's important rule beats yours) and gives low layers a way to protect something essential. A reset can lock `[hidden] { display: none !important; }` and no component can accidentally show hidden content.

## Nested layers and reverting

Layers can nest: `@layer components.cards { … }` creates a `cards` layer inside `components`, and its priority is resolved inside its parent. Teams use this to give each component folder its own sub-layer without affecting global order.

One more keyword pairs with layers: `revert-layer`. Setting `color: revert-layer` rolls the property back to whatever the previous layers would have produced, as if this layer's declaration didn't exist. It's handy in a utility such as `.reset-color { color: revert-layer; }`.

## Adopting layers in an existing codebase

You don't need a rewrite. On the Waypoint codebase, the migration took one afternoon and three steps:

1. Add the order statement at the very top of the entry stylesheet, including a `legacy` layer first.
2. Wrap every existing file in `@layer legacy { … }`, or import it with `layer(legacy)`. Nothing changes visually, because the old rules still compete with each other exactly as before.
3. As you touch a component, move its rules out of `legacy` and into `components`. Each move can only make your new code *stronger* relative to the old code, never weaker.

The pay-off arrives quickly: new components stop needing heavy selectors to beat old ones, and you can delete `!important` declarations one by one as their reason disappears.

:::note Support
Cascade layers are Baseline widely available: every current browser has supported them since early 2022. You can ship them without a fallback.
:::

## Your turn

In the exercise, the Waypoint badge has a heavy component selector and a utility that should override it. Put the rules into layers so the utility wins without editing any selector or adding `!important`. Layers solve "which group wins"; the next lesson tackles "which value", using custom properties as the dials your components expose.
