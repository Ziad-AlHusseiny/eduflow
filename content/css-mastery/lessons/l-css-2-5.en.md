---
summary: "Make a session card change its layout based on the width of the slot it sits in, using size container queries, container units and custom-property style queries."
takeaways:
  - "`container-type: inline-size` turns an element into a container, and `@container (width >= 400px)` styles its descendants based on that element's width, not the viewport's."
  - "An element can't query itself; put `container-type` on a wrapper and write the query for the elements inside it."
  - "Inline-size containment means the container's width can't come from its content, so a container in a shrink-to-fit context collapses unless something gives it a width."
  - "Container units such as `cqi` (1% of the container's inline size) let type and spacing scale with the component."
  - "Style queries on custom properties, such as `@container style(--variant: featured)`, became Baseline in May 2026; size queries have been Baseline since 2023."
further:
  - title: "Container size and style queries (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries
  - title: "@container (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@container
  - title: "Container queries (web.dev Learn CSS)"
    url: https://web.dev/learn/css/container-queries
quiz:
  - q: |
      Why does this rule never apply?
      ```css
      .session-card { container-type: inline-size; }
      @container (width >= 400px) {
        .session-card { display: grid; }
      }
      ```
    options:
      - text: "`@container` needs a container name to work."
        why: "Names are optional. An unnamed query uses the nearest ancestor container."
      - text: "The query should use `min-width` instead of the range syntax."
        why: "Container queries support the range syntax (`width >= 400px`) in every browser that supports them."
      - text: "`inline-size` only works on grid containers."
        why: "Any element can be a size container, whatever its display type."
      - text: "The card is querying itself, but a container query only styles the container's descendants."
        why: "Correct. The card looks for an ancestor container and finds none. Put `container-type` on the wrapper (the slot) and style the card from inside the query."
    answer: 3
  - q: "You put `container-type: inline-size` on a flex item that has no width set, and it collapses to zero width. Why?"
    options:
      - text: "Inline-size containment stops the element's width from depending on its content, and a flex item's width usually comes from its content."
        why: "Correct. With containment the item's content contributes nothing to its size; give it `flex: 1`, a width, or put the container on an element that is sized by its parent."
      - text: "Container queries don't work inside flexbox."
        why: "They work anywhere; the problem is how the container itself gets its size."
      - text: "The browser hides containers until a query matches."
        why: "Containers are rendered normally whether or not any query matches."
    answer: 0
  - q: "A card's title has `font-size: clamp(1rem, 4cqi, 1.5rem)`. What does `4cqi` refer to?"
    options:
      - text: "4% of the viewport's width."
        why: "That's `4vw`. `cqi` units resolve against the nearest container, not the viewport."
      - text: "4% of the nearest size container's inline size."
        why: "Correct. In a 400px slot, `4cqi` is 16px; in a 600px slot, 24px (clamped to 1.5rem)."
      - text: "4% of the title's own width."
        why: "An element can't measure itself this way; container units always look to an ancestor container."
      - text: "4 times the card's font size."
        why: "Multiples of the font size are written `4em`; `cqi` has nothing to do with font size."
    answer: 1
  - q: "Which query applies styles when a parent sets `--variant: featured`?"
    options:
      - text: "`@media (--variant: featured)`"
        why: "Media queries test the device and viewport; they can't read custom properties."
      - text: "`@supports (--variant: featured)`"
        why: "`@supports` tests whether the browser understands a declaration, not what value an element has."
      - text: "`@container style(--variant: featured)`"
        why: "Correct. Style queries test the computed value of a custom property on the nearest container, and every element is a style container by default."
    answer: 2
---

Waypoint uses the same session card in three places: the main schedule grid, a narrow "Up next" sidebar, and a full-width hero for the keynote. A media query can only ask "how wide is the screen?", and the screen is the same width in all three cases. So the card in the sidebar got the wide layout, squashed into 280px, until someone added a `.sidebar .session-card` override, then a `.hero .session-card` override, and so on.

The card shouldn't care where it is. It should care how much room it has. Container queries let it ask exactly that.

## Make a container, then query it

Two steps. First, declare which element is the container, the slot the card sits in:

```css title=slots.css
.slot {
  container: session / inline-size;
}
```

That shorthand sets `container-name: session` and `container-type: inline-size`. The type tells the browser you'll query this element's inline size (its width in horizontal writing), so it must be able to calculate that width without looking at the content inside.

Second, write the card's layout as a query against that container:

```css title=session-card.css
.session-card {
  display: block;
}

@container session (width >= 400px) {
  .session-card {
    display: grid;
    grid-template-columns: 6rem 1fr;
    gap: 1rem;
  }
}
```

Now the card stacks in the 280px sidebar and switches to two columns in the 640px grid, with no knowledge of either. The name is optional; an unnamed `@container (width >= 400px)` uses the nearest ancestor with a size container type. Names help when containers nest and you want to skip one.

:::figure The same card, two slots: the query measures the slot, not the viewport
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">A browser window containing a narrow sidebar slot and a wide main slot. The card in the narrow slot is stacked: time above title. The card in the wide slot is side by side: time column next to the title.</title>
  <rect class="d-box" x="10" y="10" width="660" height="230" rx="12"/>
  <text class="d-label-muted" x="24" y="34">viewport: same for both</text>
  <rect class="d-box-accent d-dashed" x="24" y="50" width="200" height="176" rx="10"/>
  <text class="d-code" x="36" y="72">.slot 280px</text>
  <rect class="d-box-primary" x="40" y="86" width="168" height="40" rx="6"/>
  <text class="d-label" x="52" y="111">09:30</text>
  <rect class="d-box-primary" x="40" y="134" width="168" height="76" rx="6"/>
  <text class="d-label" x="52" y="160">Title</text>
  <rect class="d-box-accent d-dashed" x="244" y="50" width="412" height="176" rx="10"/>
  <text class="d-code" x="256" y="72">.slot 640px</text>
  <rect class="d-box-primary" x="260" y="86" width="96" height="124" rx="6"/>
  <text class="d-label" x="272" y="111">09:30</text>
  <rect class="d-box-primary" x="366" y="86" width="274" height="124" rx="6"/>
  <text class="d-label" x="378" y="111">Title</text>
</svg>
:::

## The two rules that trip everyone

**An element can't query itself.** The query looks for an *ancestor* container, so `container-type` on `.session-card` plus `@container { .session-card { … } }` does nothing for the card itself. Put the container on a wrapper.

**Containment changes how the container is sized.** `inline-size` containment means the container's width can't depend on its children; otherwise a query could change the content, which changes the width, which changes the query, forever.

:::mistake A container that collapses to zero
Put `container-type: inline-size` on a shrink-to-fit element (an unsized flex item, an inline-block, a `width: fit-content` box) and it collapses, because its width used to come from its content and now can't. Make the container something whose width comes from outside: a block element, a grid cell, or a flex item with `flex: 1`.
:::

## Container units

Inside a container, you get units relative to it: `cqi` is 1% of the container's inline size, `cqb` 1% of its block size, and `cqmin`/`cqmax` the smaller or larger of the two. They make a component scale smoothly, not just at breakpoints:

```css
.session-card h3 {
  font-size: clamp(1rem, 0.75rem + 2cqi, 1.5rem);
}
```

In the 280px sidebar the title sits near 1rem; in a 640px slot it grows towards 1.5rem. If no ancestor is a size container, container units fall back to the small viewport units, so they never break.

## Style queries for variants

Size isn't the only thing a card might respond to. The keynote card in the hero is a *variant*, and container style queries let a parent announce that through a custom property:

```css
.hero { --variant: featured; }

@container style(--variant: featured) {
  .session-card {
    border-inline-start: 6px solid #6d28d9;
  }
}
```

You don't need `container-type` for this: every element is a style container by default, so the query checks the nearest ancestor's computed `--variant`. Today, style queries work with custom properties only; querying regular properties like `style(display: grid)` isn't supported anywhere yet.

:::note Support
Size container queries and container units have been Baseline since February 2023. Style queries on custom properties became Baseline newly available in May 2026, when Firefox 151 shipped them (Chrome since 111, Safari since 18). If you support older Firefox versions, treat style-query styling as an enhancement and make sure the default card looks complete without it.
:::

## Your turn

In the exercise, the card uses a media query, so it gets the wrong layout in at least one slot. Turn `.slot` into a named container, switch the layout to a container query at 400px, and add a style query for the featured variant. The checks change the slot's width and set `--variant` on it to watch the card respond. That closes the layout section; next you'll scale type and spacing fluidly across all those slot sizes.
