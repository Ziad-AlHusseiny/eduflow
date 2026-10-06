---
summary: "Write component styles with native CSS nesting, and use :has() to style an element based on what it contains, including a schedule filter that needs no JavaScript."
takeaways:
  - "Native nesting groups a component's states, children and media queries inside its rule, and `&` stands for the parent selector."
  - "A nested selector gets the specificity of `:is()` applied to the parent list, so a parent list containing an ID makes every nested rule ID-heavy."
  - "CSS nesting doesn't concatenate strings the way Sass does, so `&__title` will never produce `.card__title`."
  - "`:has()` matches an element when the relative selector inside it matches, which lets a parent, or an earlier sibling, react to its descendants or later siblings."
further:
  - title: "Using CSS nesting (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using
  - title: ":has() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has
  - title: "Nesting (web.dev Learn CSS)"
    url: https://web.dev/learn/css/nesting
quiz:
  - q: |
      What selector does this nested rule produce?
      ```css
      .session-card {
        .speaker & { padding: 0; }
      }
      ```
    options:
      - text: "`.session-card .speaker`"
        why: "That's what you'd get without the `&`, or with `& .speaker`. Here `&` comes last, so the card is the descendant."
      - text: "`.speaker .session-card`"
        why: "Correct. `&` marks where the parent selector goes; putting it last means a session card inside a `.speaker`."
      - text: "`.session-card.speaker`"
        why: "That needs `&.speaker` with no space between them."
      - text: "It's invalid, because `&` must come first."
        why: "`&` can appear anywhere in a nested selector, including at the end."
    answer: 1
  - q: "Which selector styles a session card only when it contains an image?"
    options:
      - text: "`.session-card img`"
        why: "That selects the image itself, not the card."
      - text: "`.session-card > img:parent`"
        why: "There's no `:parent` pseudo-class in CSS; `:has()` is how you select based on descendants."
      - text: "`.session-card:has(img)`"
        why: "Correct. The card matches when the relative selector `img` finds a descendant."
    answer: 2
  - q: "Which rule hides every non-design card when the `#only-design` checkbox inside `.schedule` is checked?"
    options:
      - text: "`.schedule:has(#only-design:checked) .session-card:not(.track-design) { display: none; }`"
        why: "Correct. `:has()` turns the checkbox state into a condition on the shared ancestor, and the rest of the selector targets the cards."
      - text: "`#only-design:checked .session-card:not(.track-design) { display: none; }`"
        why: "That looks for cards inside the checkbox, and inputs can't have children."
      - text: "`#only-design:checked + .session-card:not(.track-design) { display: none; }`"
        why: "The `+` combinator only reaches the single sibling directly after the checkbox, not cards elsewhere in the schedule."
    answer: 0
  - q: "You write `.card { &__title { font-weight: 700; } }` out of Sass habit. What happens?"
    options:
      - text: "It styles elements with the class `card__title`."
        why: "Native nesting doesn't do string concatenation; `&` stands for a selector, not text to glue onto."
      - text: "It doesn't style `.card__title`; the nested selector doesn't mean what Sass means."
        why: "Correct. To style a BEM element with native nesting you write the full class, for example `.card__title` at the top level."
      - text: "The browser stops parsing the rest of the stylesheet."
        why: "CSS error handling drops what it can't use and keeps going; it never abandons the stylesheet."
    answer: 1
---

Two things bother everyone who maintains Waypoint's card CSS. The card's rules are scattered: the base rule here, the hover state twenty lines down, the dark-mode override in another file. And the design team keeps asking for styles that depend on what's *inside* the card ("if a session is sold out, dim it"), which used to mean a JavaScript class toggle.

Native nesting fixes the first, and `:has()` fixes the second.

## Native nesting

You can now nest rules inside rules, in plain CSS, with no build step:

```css title=session-card.css
.session-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;

  h2 {
    margin-block: 0 0.5rem;
    font-size: 1.125rem;
  }

  &:hover {
    border-color: #a78bfa;
  }

  .featured & {
    border-width: 2px;
  }

  @media (width >= 48rem) {
    padding: 1.5rem;
  }
}
```

`&` stands for the parent selector. `&:hover` means "this card when hovered", and `.featured &` means "this card inside `.featured`". A nested selector without `&`, like `h2`, is treated as a descendant: `.session-card h2`. Nested `@media` and `@container` rules apply to the parent selector, so the padding change lives next to the padding.

Nested selectors can start with an element name (`h2`, not `& h2`). Early implementations required a symbol first; every current browser now supports the relaxed syntax, and nesting has been Baseline since December 2023 (widely available since mid-2026).

:::mistake Writing Sass-style suffixes
`&__title` and `&--featured` concatenate strings in Sass. Native nesting works on selectors, not text, so it can't build `.session-card__title`. If you use BEM, write those classes in full.
:::

Two more rules keep nesting healthy. Under the hood, `&` behaves like `:is()` wrapped around the parent list, so `#keynote, .session-card { h2 { … } }` gives *every* nested `h2` rule ID-level specificity. And stop at two levels deep: a selector you can't read in one glance is one you can't override in one glance.

## `:has()`: style an element by what it contains

`:has()` takes a relative selector and matches the element if that selector finds something:

```css
/* A card that contains a speaker photo gets a two-column layout */
.session-card:has(img) {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 1rem;
}

/* Dim sold-out sessions */
.session-card:has(.badge-full) {
  opacity: 0.6;
}

/* A label whose following input is invalid after the user typed */
label:has(+ input:user-invalid) {
  color: #b91c1c;
}
```

The last example shows that `:has()` is more than a "parent selector": `+ input` looks at the *next sibling*, so an earlier element can react to a later one. `:user-invalid` is the polite cousin of `:invalid`; it only matches after the user has interacted with the field, so an empty form doesn't load covered in red.

`:has()` has two limits worth knowing before you hit them. You can't nest a `:has()` inside another `:has()`, and you can't put pseudo-elements such as `::before` inside it. Its specificity follows the `:is()` rule from earlier in this section: the most specific argument counts, so `.session-card:has(#keynote-badge)` carries the weight of an ID.

## A filter bar with no JavaScript

Here's where `:has()` changes how you build things. Waypoint's filter bar is a set of checkboxes. Because the checkboxes and the cards share an ancestor, `.schedule`, the state of a checkbox can drive the cards:

```html
<section class="schedule">
  <div class="filters">
    <label><input type="checkbox" id="hide-full"> Hide sold-out</label>
  </div>
  <article class="session-card">…<span class="badge-full">Sold out</span></article>
  <article class="session-card">…</article>
</section>
```

```css
.schedule:has(#hide-full:checked) .session-card:has(.badge-full) {
  display: none;
}
```

Read it right to left: hide a card that contains a sold-out badge, when it's inside a schedule that contains a checked `#hide-full` box. The browser re-evaluates it the moment the checkbox changes.

:::why Why this matters
State that lives in the DOM (checked boxes, open `<details>`, `[aria-expanded]`, a focused input) is now something CSS can read directly. Fewer class toggles in JavaScript means fewer places for the UI and the state to disagree.
:::

:::tip Keep the anchor narrow
`:has()` is fast in modern engines, but `body:has(...)` or `*:has(...)` asks the browser to re-check a lot of the page whenever anything inside changes. Anchor on the closest common ancestor, `.schedule` rather than `body`, when you can. `:has()` itself is Baseline widely available.
:::

## Three more selectors that replace JavaScript

`:has()` gets the attention, but a few quieter selectors earn their place on the Waypoint page too:

```css
/* Highlight the whole filter bar while any control inside it has focus */
.filters:focus-within { outline: 2px solid #a78bfa; }

/* Every card except sold-out and cancelled ones */
.session-card:not(.is-full, .is-cancelled) { cursor: pointer; }

/* Stripe only the visible cards, skipping hidden ones */
.session-card:nth-child(even of :not([hidden])) { background: #f9fafb; }
```

`:focus-within` matches an element when it or anything inside it has focus. `:not()` accepts a whole list, so you no longer chain `:not(.a):not(.b)`. And the `of S` form of `:nth-child()` counts only siblings that match `S`, which fixes zebra stripes that break the moment a filter hides a row. All three work in every current browser.

## Your turn

In the exercise you'll rewrite the card styles with nesting, then add two `:has()` rules: one that hides sold-out sessions when the filter box is checked, and one that highlights a card when its "save" checkbox is ticked. That completes the cascade section; next you'll move from *which* styles apply to *where things go*, starting with flexbox.
