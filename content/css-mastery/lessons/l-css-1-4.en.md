---
summary: "Use custom properties as a component's public API, understand when var() substitution fails, and register typed properties with @property so they validate and animate."
takeaways:
  - "Custom properties inherit by default and are substituted where `var()` is used, so setting one on a parent re-themes every descendant that reads it."
  - "A `var()` that produces an invalid value makes the property invalid at computed-value time; the browser uses the inherited or initial value, not your earlier declaration."
  - "An unregistered custom property is an untyped string of tokens, so the browser can't validate it or interpolate it in a transition."
  - "`@property` gives a custom property a syntax, an initial value and an inheritance flag, which makes bad values fall back safely and lets the property animate."
further:
  - title: "Using CSS custom properties (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
  - title: "@property (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property
  - title: "@property: giving superpowers to CSS variables (web.dev)"
    url: https://web.dev/articles/at-property
quiz:
  - q: |
      What padding does `.card` get?
      ```css
      .card {
        --space: blue;
        padding: 24px;
        padding: var(--space);
      }
      ```
    options:
      - text: "24px, because the browser falls back to the previous valid declaration."
        why: "The fallback-to-earlier-declaration behaviour only applies to values that are invalid at parse time. `var()` is checked later, after the cascade has already picked the last declaration."
      - text: "0, the initial value of padding."
        why: "Correct. `padding: var(--space)` wins the cascade, then turns out invalid at computed-value time, so padding falls back to its initial value."
      - text: "The browser ignores `--space` and uses the `var()` fallback, which is empty."
        why: "There's no fallback in `var(--space)`, and fallbacks are only used when the property is missing (guaranteed-invalid), not when its value is the wrong type."
    answer: 1
  - q: "You register `@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }`. What does this give you that an unregistered `--angle` doesn't?"
    options:
      - text: "The ability to use `--angle` inside `var()`."
        why: "Unregistered custom properties work in `var()` too; registration isn't required for substitution."
      - text: "Faster rendering, because typed properties skip the cascade."
        why: "Registered properties go through the cascade like any other; registration changes parsing, validation and interpolation, not cascade cost."
      - text: "Smooth transitions and animations of `--angle`, because the browser knows how to interpolate angles."
        why: "Correct. An untyped property can only flip discretely; a typed one interpolates, so a gradient driven by `--angle` can rotate smoothly."
    answer: 2
  - q: "Where should a session card's accent color be set so that a `.track-design` card and everything inside it uses pink?"
    options:
      - text: "`.track-design { --accent: #db2777; }`, with the card's rules reading `var(--accent)`."
        why: "Correct. Custom properties inherit, so the card and its title, badge and border all pick up the value."
      - text: "`:root { --accent: #db2777; }` inside a `.track-design` media query."
        why: "Media queries test the viewport, not the element, and `:root` would recolour every card on the page."
      - text: "On each child element separately, because custom properties don't inherit."
        why: "Unregistered custom properties always inherit, and registered ones inherit unless you set `inherits: false`."
    answer: 0
  - q: "A registered property has `syntax: '<color>'; inherits: true; initial-value: gray`, and a card sets `--accent: 12px`. Its parent doesn't set `--accent`. What value does the card end up with?"
    options:
      - text: "12px, because custom properties accept any token."
        why: "That's true only for unregistered properties. Registration makes the browser check the value against `<color>`."
      - text: "gray, inherited from the parent, which has the initial value."
        why: "Correct. The invalid value makes the property behave as unset, which for an inherited property means inherit, and the parent holds the initial value."
      - text: "Nothing; the whole card rule is dropped."
        why: "Only the invalid declaration is affected, and the browser recovers by treating it as unset."
    answer: 1
---

Waypoint's session cards come in four tracks (Design, Performance, Accessibility and Platform), and each track has its own color for the left border, the badge and the title hover state. The first version had a rule per track per element: twelve rules, and a thirteenth set every time marketing added a track.

Custom properties turn that into one rule per track and a card that reads its color from a single dial.

## A component with one dial

```css title=session-card.css
.session-card {
  border-inline-start: 6px solid var(--track-color, #64748b);
}
.session-card .badge {
  background: var(--track-color, #64748b);
  color: white;
}

.track-design { --track-color: #db2777; }
.track-perf   { --track-color: #0891b2; }
```

```html
<article class="session-card track-design">…</article>
```

Two things make this work. First, custom properties **inherit**: setting `--track-color` on the card makes it visible to the badge inside. Second, `var()` is resolved **at the element that uses it**, at computed-value time, so each card substitutes its own value. The second argument to `var()` is the fallback, used only when the property isn't set at all.

Where you set a custom property matters. Global design tokens (brand colors, the spacing scale, font stacks) belong on `:root`, so every element inherits them. Component tokens such as `--track-color` belong on the component, so they stay local and one card can differ from its neighbour. Changing a property on `:root` from JavaScript forces the browser to recompute styles for the whole tree that uses it, so for something that changes often, like a pointer position, set it on the smallest element that needs it.

Think of `--track-color` as the card's public API. Anyone can theme a card from outside, in a CMS template or a one-off campaign page, without knowing its internals.

## When substitution goes wrong

Unregistered custom properties are just strings of tokens. The browser doesn't know `--track-color` is supposed to be a color, so `--track-color: 12px` is a perfectly valid declaration. The problem appears later, when `var()` drops `12px` into `border-inline-start`'s color.

:::mistake Expecting CSS to fall back to the previous declaration
With an ordinary typo like `color: bleu`, the browser discards the declaration at parse time and the earlier one still applies. With `var()`, the cascade has already picked the winning declaration before the value is known. When substitution produces nonsense, the property becomes **invalid at computed-value time** and gets its inherited or initial value, not your earlier rule. With a shorthand it's worse: `border-inline-start: 6px solid 12px` is invalid as a whole, so width, style and color all reset, and the initial style is `none`.
:::

That's how Waypoint shipped a card with no track border at all and a see-through badge: the CMS wrote `12px` into the color field, and nothing complained.

## Register the property with @property

`@property` tells the browser what a custom property is:

```css
@property --track-color {
  syntax: "<color>";
  inherits: true;
  initial-value: #64748b;
}
```

Now three things change:

1. **Validation.** A value that isn't a `<color>` makes the property fall back safely: it behaves as unset, so an inherited property takes the parent's value, which ends at the `initial-value` if nobody sets it. The bad card gets a slate grey border instead of none.
2. **Computed values are typed.** `getComputedStyle(card).getPropertyValue('--track-color')` returns `rgb(219, 39, 119)`, not the raw text you wrote.
3. **Interpolation.** The browser knows how to blend between two colors, so the property can transition.

The `syntax` descriptor accepts types such as `<color>`, `<length>`, `<length-percentage>`, `<number>`, `<percentage>`, `<angle>`, `<time>` and `<integer>`, plus `"*"` for anything. `initial-value` is required unless the syntax is `"*"`, and it must be computationally independent: `10px` is fine, `2em` isn't.

## Animating what used to jump

Here's a hover effect that's only possible with registration. The card's top edge is a gradient whose angle is a custom property:

```css
@property --sheen-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 90deg;
}

.session-card {
  background: linear-gradient(var(--sheen-angle), #f5f3ff, white 60%);
  transition: --sheen-angle 400ms ease;
}
.session-card:hover {
  --sheen-angle: 160deg;
}
```

Without `@property`, the browser can't interpolate a token string, so the gradient snaps from one angle to the other. With it, the angle animates smoothly. `inherits: false` is right here: the angle belongs to this card's background, and children shouldn't receive it.

:::note Support
`@property` is Baseline 2024 (newly available): Chrome, Edge, Safari and Firefox all support it as of Firefox 128 in July 2024. In older browsers the property still works as an unregistered one, so treat registration as progressive enhancement. You can also register from JavaScript with `CSS.registerProperty({ name, syntax, inherits, initialValue })`.
:::

:::tip Name tokens by role, not by value
`--track-color` survives a rebrand; `--pink-600` doesn't. Name the custom properties a component reads after what they do, and map them to raw palette values in one place.
:::

## Your turn

The exercise reproduces the CMS bug: one card's `--track-color` is `12px`. Register the property so bad values fall back to slate grey, and check that real track colors still come through. The next lesson keeps working on these cards with native nesting and `:has()`, which lets a card react to what's inside it.
