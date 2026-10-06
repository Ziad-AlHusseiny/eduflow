---
summary: Build every interaction state and accessibility behavior into components by default, including visible focus with :focus-visible, disabled and pressed states, and ARIA patterns that follow the WAI-ARIA Authoring Practices.
takeaways:
  - Design and build a full state matrix for every interactive component, including focus, disabled, loading and pressed, not just default and hover.
  - Style keyboard focus with `:focus-visible` and an outline from a token; never remove the outline without a visible replacement.
  - Use native elements first and follow the WAI-ARIA Authoring Practices for custom widgets like tabs, menus and comboboxes.
  - "`aria-disabled=\"true\"` keeps a control focusable so you can explain why it is unavailable, but you must block its action yourself."
  - When accessibility lives in the component, 40 teams get it for free; when it lives in the docs, most of them miss it.
further:
  - title: ":focus-visible (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible
  - title: WAI-ARIA Authoring Practices Guide patterns (W3C)
    url: https://www.w3.org/WAI/ARIA/apg/patterns/
  - title: Understanding SC 2.5.8 Target Size (Minimum) (W3C)
    url: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
  - title: aria-pressed (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed
quiz:
  - q: "A team ships `.nw-button:focus { outline: none; }` because the ring \"looks ugly on click\". What's the right fix in the system?"
    options:
      - text: "Keep `outline: none` and rely on the hover color for keyboard users."
        why: Keyboard users don't hover, so they lose any indication of where they are.
      - text: Move the ring to `:focus-visible` so it shows for keyboard focus but not for most mouse clicks.
        why: Correct. Browsers apply `:focus-visible` when focus needs to be visible, which is what both groups actually want.
      - text: Replace the outline with a `box-shadow` ring on `:focus`.
        why: It still shows on click, and box shadows are removed in forced-colors modes, so high-contrast users lose the ring.
      - text: Add `tabindex="-1"` to buttons so they can't get focus.
        why: That removes buttons from the keyboard order entirely, making them unusable without a mouse.
    answer: 1
  - q: The Save button is unavailable until a driver is selected. Product wants a tooltip explaining why. Which approach works?
    options:
      - text: Use the `disabled` attribute and attach the tooltip to the button.
        why: A disabled button can't receive focus, so keyboard and screen reader users never reach the tooltip.
      - text: Hide the button until a driver is selected.
        why: Hiding it removes the hint that saving is possible at all, and the layout jumps when it appears.
      - text: Set `aria-disabled="true"`, keep it focusable, block the click in code, and connect the explanation with `aria-describedby`.
        why: Correct. The control stays reachable and announced as unavailable, and the reason is available to everyone.
    answer: 2
  - q: Northwind needs a "Show only late shipments" toggle button. Which markup communicates its state correctly?
    options:
      - text: "`<button type=\"button\" aria-pressed=\"true\">Show only late shipments</button>`"
        why: Correct. `aria-pressed` turns a button into a toggle, and screen readers announce it as pressed or not pressed.
      - text: "`<button type=\"button\" class=\"is-active\">Show only late shipments</button>`"
        why: The class changes the look but tells assistive technology nothing about the state.
      - text: "`<div role=\"button\" data-on=\"true\">Show only late shipments</div>`"
        why: A div needs keyboard handling and focusability added by hand, and `data-on` isn't exposed to assistive technology.
      - text: "`<button type=\"button\" aria-label=\"on\">Show only late shipments</button>`"
        why: The label replaces the visible name with "on", which is worse than saying nothing.
    answer: 0
  - q: Why does Northwind draw focus rings with `outline` rather than `box-shadow`?
    options:
      - text: Outlines are faster to render.
        why: Rendering cost isn't a meaningful difference here.
      - text: Box shadows can't use custom properties.
        why: They can; any CSS value can come from a custom property.
      - text: Outlines always render outside the border box, so offsets are impossible with shadows.
        why: Both can create gaps; `outline-offset` is just more convenient. The deciding reason is elsewhere.
      - text: Forced-colors modes such as Windows contrast themes remove box shadows but keep outlines.
        why: Correct. An outline-based ring survives high-contrast settings, so those users still see focus.
    answer: 3
---

Northwind's 2021 Button looked perfect in every screenshot, because screenshots only show the default state. In production it had no visible keyboard focus, its disabled style failed contrast on the Tidewater brand, and its "loading" state made the button shrink and the layout jump. None of that was in the Figma file. Components fail in their states, so the system has to design, build and test all of them.

## The state matrix

Every interactive component gets a state matrix: one row per variant, one column per state. For Button:

| State | Trigger | Built with |
|---|---|---|
| Hover | Pointer over it | `:hover` |
| Focus visible | Keyboard focus | `:focus-visible` |
| Active | Being pressed | `:active` |
| Disabled | Not available | `disabled` or `aria-disabled="true"` |
| Loading | Action in progress | `aria-busy`, stable width |
| Pressed | Toggle is on | `aria-pressed="true"` |

Northwind designs every cell in Figma (as component variants) before anyone writes code, and the visual tests in Section 4 render every cell in every theme. When a contribution arrives with only default and hover designed, the review sends it back.

## Focus that people can see

Keyboard users need to see where focus is; WCAG 2.2 requires it at level AA (2.4.7, Focus Visible). Mouse users usually don't want a ring after clicking. `:focus-visible` resolves this: browsers apply it when focus should be visible, typically after keyboard navigation, and not after most mouse clicks.

```css
:root {
  --nw-focus-ring-color: var(--nw-blue-600);
  --nw-focus-ring-width: 2px;
  --nw-focus-ring-offset: 2px;
}

.nw-button:focus-visible {
  outline: var(--nw-focus-ring-width) solid var(--nw-focus-ring-color);
  outline-offset: var(--nw-focus-ring-offset);
}
```

The ring is built from tokens, so dark mode and Tidewater can adjust it, and every component uses the same ring. It is an `outline`, not a `box-shadow`, because forced-colors modes like Windows contrast themes remove box shadows but keep outlines.

:::mistake outline: none on :focus
`:focus { outline: none; }` is still the most common accessibility bug in component libraries, usually added because the ring looked wrong on click. It removes the browser's default ring for everyone, including keyboard users. If you remove a default, replace it in `:focus-visible` in the same commit.
:::

## Disabled, two ways

The `disabled` attribute removes a button from the tab order and from activation. That's right for most cases, but it creates a problem: keyboard and screen reader users can't reach the button to learn *why* it is disabled.

When you need an explanation, use `aria-disabled="true"` instead. The button stays focusable and is announced as unavailable; you connect the reason with `aria-describedby`; and because the browser won't block the click for you, the component must:

```js
button.addEventListener('click', (event) => {
  if (button.getAttribute('aria-disabled') === 'true') {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});
```

The system's Button does this internally, so teams set one prop and get the behavior. That's the whole point of building accessibility in: forty teams won't each remember `stopImmediatePropagation`, but one component can.

## Toggles, targets and patterns

A button that switches something on and off is a **toggle button**. Mark its state with `aria-pressed="true"` or `"false"`, and style that attribute so the visual and announced states can't drift apart:

```css
.nw-button[aria-pressed="true"] {
  --nw-button-bg: var(--nw-color-action-bg-subtle);
  --nw-button-border: var(--nw-color-action-bg);
}
```

Size matters too: WCAG 2.2 success criterion 2.5.8 asks for pointer targets of at least 24 by 24 CSS pixels at level AA, with some exceptions. Northwind's smallest control height is 32px, enforced by the `sm` size tokens.

For anything beyond a button, use native elements first: `<button>`, `<dialog>`, `<details>`, `<select>`. When you build a custom widget such as tabs, a menu button or a combobox, follow the matching pattern in the WAI-ARIA Authoring Practices Guide: its roles, states and keyboard interactions. Users of assistive technology expect those behaviors, and the guide documents them precisely.

:::why Why this matters
At Northwind, an accessibility audit of a product built on the system found 31 issues. Twenty-six were in one-off components the team had built themselves; five were in system components, and fixing those five in the system fixed them in every product at once. Accessibility built into a shared component scales; accessibility left to each team's memory doesn't.
:::

In the exercise, you fix a button set that hides keyboard focus and ignores its own disabled state. Next, you write the documentation that tells teams how to use all of this.
