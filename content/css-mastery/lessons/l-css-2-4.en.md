---
summary: "Size elements from their content with min-content, max-content and fit-content, and replace breakpoint pairs with min(), max() and clamp()."
takeaways:
  - "`min-content` is the narrowest an element can be without overflowing, `max-content` is its width with no wrapping, and `fit-content` is max-content capped at the available space."
  - "`min()` picks the smallest value, so it acts as a ceiling: `width: min(100%, 40ch)` never exceeds 40ch and never overflows its container."
  - "`max()` acts as a floor, and `clamp(MIN, PREFERRED, MAX)` keeps a fluid value between two limits."
  - "Math functions accept mixed units and arithmetic, so `min(100% - 2rem, 60rem)` works without a nested `calc()`."
further:
  - title: "clamp() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp
  - title: "fit-content (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/fit-content
  - title: "Sizing units (web.dev Learn CSS)"
    url: https://web.dev/learn/css/sizing
quiz:
  - q: "A session abstract has `width: min(100%, 40ch)`. Its card is 900px wide. How wide is the abstract?"
    options:
      - text: "900px, because 100% is the larger value."
        why: "`min()` returns the smaller value, not the larger one. It's easy to mix up because it acts as a maximum."
      - text: "Whichever is smaller, so 40ch (roughly 320px at 16px)."
        why: "Correct. 40ch is smaller than 900px, so it wins. In a 200px card, 100% would be smaller and win instead."
      - text: "40ch, but it overflows when the card is narrower."
        why: "That's what plain `width: 40ch` does. With `min()`, 100% takes over as soon as the card is narrower than 40ch."
      - text: "It depends on the viewport width."
        why: "Neither `100%` nor `ch` depends on the viewport; `100%` is relative to the containing block."
    answer: 1
  - q: "What does `padding: clamp(12px, 4%, 32px)` give a card in a 500px-wide container?"
    options:
      - text: "12px, because the minimum always applies first."
        why: "The minimum only applies when the preferred value falls below it. 4% of 500px is 20px, which is above 12px."
      - text: "32px, because clamp() prefers the maximum."
        why: "The maximum only applies when the preferred value exceeds it."
      - text: "4px, because the percentage is of the padding box."
        why: "Padding percentages are always relative to the containing block's inline size, here 500px."
      - text: "20px, because 4% of 500px sits between the limits."
        why: "Correct. clamp() returns the preferred value when it falls between the minimum and maximum."
    answer: 3
  - q: "A \"Sold out\" badge is `display: block` inside a card, and it stretches across the whole card. Which declaration makes it hug its text but still wrap if the text is longer than the card?"
    options:
      - text: "`width: max-content`"
        why: "`max-content` never wraps, so a long label would overflow the card."
      - text: "`width: min-content`"
        why: "`min-content` wraps at every opportunity, so a two-word label would break onto two lines."
      - text: "`width: fit-content`"
        why: "Correct. It uses the max-content width when there's room and falls back to the available width when there isn't."
    answer: 2
  - q: "Why does `max(1rem, 4vw)` make a good page gutter?"
    options:
      - text: "It grows with the viewport but never drops below 1rem on small screens."
        why: "Correct. `max()` picks the larger value, so it acts as a floor of 1rem while 4vw takes over on wider screens."
      - text: "It never grows beyond 1rem, keeping wide screens tidy."
        why: "That would be `min(1rem, 4vw)`, which acts as a ceiling."
      - text: "It switches from rem to vw at a breakpoint you declare."
        why: "There's no breakpoint; the browser compares the two values continuously at every width."
    answer: 0
---

Waypoint's session abstracts had the classic pair of rules: `width: 100%` plus `max-width: 40ch`, and then a media query to add side padding on phones, and another for big screens. Three rules and two breakpoints to say one thing: "be as wide as is comfortable to read, but never wider than the space you have".

CSS can say that directly now. This lesson covers two tools: the intrinsic size keywords, which let content decide how big an element is, and the math functions `min()`, `max()` and `clamp()`, which let you describe a range instead of picking breakpoints.

## Let the content decide: intrinsic keywords

Most sizes you write are *extrinsic*: 300px, 50%, 1fr. The browser can also size an element from its content, and three keywords expose that:

- **`min-content`**: the narrowest the element can be without overflowing, which is usually the width of its longest word.
- **`max-content`**: the width the content would take if it never wrapped.
- **`fit-content`**: `max-content`, but never wider than the available space. When space runs out, it wraps like a normal block.

`fit-content` is the one you'll use most. A block-level badge or button normally stretches to fill its container; `width: fit-content` makes it hug its label like an inline element while staying a block, so margins and stacking still behave. Add `margin-inline: auto` and it centers.

In grid tracks, the keywords give you content-driven columns. Waypoint's agenda uses `grid-template-columns: max-content 1fr`: the time column is exactly as wide as the longest time ("10:15–11:00"), and the session title takes the rest.

:::mistake Using max-content for user text
`max-content` never wraps. It's perfect for short, controlled labels like times, and a disaster for a session title someone can edit, which will happily run off the screen. For text you don't control, use `fit-content` or a `minmax()` track.
:::

## min(), max() and clamp()

The math functions take a list of values, in any mix of units, and resolve to one length at layout time:

```css title=sizing.css
.abstract {
  width: min(100%, 40ch);            /* ceiling: never wider than 40ch */
}

.page {
  padding-inline: max(1rem, 4vw);    /* floor: never less than 1rem */
}

.session-card {
  padding: clamp(12px, 4%, 32px);    /* between 12px and 32px, 4% in the middle */
}

.content {
  width: min(100% - 2rem, 60rem);    /* arithmetic works without calc() */
  margin-inline: auto;
}
```

**`min()` returns the smallest value**, which means it sets an *upper* limit. `min(100%, 40ch)` is 40ch on a wide card and 100% on a narrow one; it replaces the `width` plus `max-width` pair with one declaration. **`max()` returns the largest value**, so it sets a *lower* limit: the page gutter is 4vw on wide screens but never shrinks below 1rem on a phone.

:::tip Say it out loud
The names feel backwards at first. Read `min(100%, 40ch)` as "whichever is smaller", and you'll write the right one every time. Most people need a week of saying it out loud before it sticks.
:::

**`clamp(MIN, PREFERRED, MAX)`** combines both: it returns the preferred value, but never less than MIN and never more than MAX. It's exactly `max(MIN, min(PREFERRED, MAX))`.

:::figure clamp() follows the preferred value between two limits
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">A graph of padding against container width. The line is flat at 12 pixels for narrow containers, rises along 4 percent of the width in the middle, and is flat at 32 pixels for wide containers.</title>
  <path class="d-line" d="M60 180 L640 180"/>
  <path class="d-line" d="M60 180 L60 20"/>
  <text class="d-label-muted" x="560" y="204">container width</text>
  <text class="d-label-muted" x="70" y="30">padding</text>
  <path class="d-arrow" d="M60 150 L220 150 L440 70 L630 70"/>
  <text class="d-code" x="90" y="140">12px (MIN)</text>
  <text class="d-code" x="250" y="100">4% (PREFERRED)</text>
  <text class="d-code" x="480" y="60">32px (MAX)</text>
  <path class="d-line d-dashed" d="M220 150 L220 180"/>
  <path class="d-line d-dashed" d="M440 70 L440 180"/>
  <text class="d-label-muted" x="196" y="200">300px</text>
  <text class="d-label-muted" x="416" y="200">800px</text>
</svg>
:::

With `clamp(12px, 4%, 32px)`, a card in a 300px column gets 12px of padding, one in a 500px column gets 20px, and anything wider than 800px tops out at 32px. Padding percentages are relative to the containing block's *inline size*, so the card's spacing follows its container, not the viewport.

## Units that make math functions useful

The preferred value in `clamp()` should be something that scales: a percentage, `vw`, or the container units you'll meet in [Container Queries](lesson:l-css-2-5). The limits should be stable units like `px` or `rem`. Using `rem` for the limits has a bonus: if a user raises their default font size, the limits scale with it.

This is also the trick behind the guard from the grid lesson: `minmax(min(180px, 100%), 1fr)`. Inside a container narrower than 180px, `min()` picks 100%, so the track never forces overflow.

:::note Support
`min()`, `max()`, `clamp()` and the `fit-content` keyword for `width` are supported in every current browser. They've been safe to ship without fallbacks for years.
:::

## Your turn

The exercise has a session card inside a wrapper whose width the checks change. Cap the abstract at 40ch without overflowing narrow cards, make the badge hug its text, and give the card padding that scales between 12px and 32px. Next, you'll make whole components change layout based on their container's width, with container queries.
