---
kind: intro
summary: "Explain the order in which the browser resolves competing declarations, so you can predict which rule wins before you open DevTools."
takeaways:
  - "The cascade sorts competing declarations by origin and importance, then inline styles, then layers, then specificity, and only then by source order."
  - "Source order is the last tie-breaker, not the first, so moving a rule down the file fixes far fewer bugs than people expect."
  - "When no declaration targets a property, the browser falls back to inheritance for inherited properties and to the initial value for the rest."
  - "`!important` reverses the origin order: a user's important rule beats an author's important rule."
further:
  - title: "Introduction to the CSS cascade (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction
  - title: "The cascade (web.dev Learn CSS)"
    url: https://web.dev/learn/css/the-cascade
quiz:
  - q: |
      Two rules in the same stylesheet target the same `<h2 class="session-title">`. Which color does it get?
      ```css
      .session-title { color: teal; }
      h2 { color: crimson; }
      ```
    options:
      - text: "crimson, because it comes later in the file."
        why: "Source order only breaks ties between declarations with equal specificity. A class beats a type selector before order is consulted."
      - text: "teal, because a class selector is more specific than a type selector."
        why: "Correct. Specificity (0,1,0) beats (0,0,1), and specificity is checked before source order."
      - text: "Whichever color the browser default stylesheet sets for h2."
        why: "The user-agent stylesheet is a lower-priority origin than your author styles, so its normal declarations never beat a rule you wrote."
    answer: 1
  - q: "A paragraph inside `.card` has no `color` rule of its own, and `.card` sets `color: navy`. What does the paragraph get?"
    options:
      - text: "The initial value of `color`, which is usually black."
        why: "That happens for non-inherited properties. `color` is inherited, so the paragraph takes its parent's computed value."
      - text: "Nothing; the property stays undefined until a rule targets it."
        why: "Every element has a value for every property. When no rule targets it, the browser defaults through inheritance or the initial value."
      - text: "navy, because `color` is an inherited property."
        why: "Correct. With no cascaded value, inherited properties copy the parent's computed value."
    answer: 2
  - q: "Which step does the browser consult first when two declarations compete?"
    options:
      - text: "Origin and importance."
        why: "Correct. Whether a declaration is from the browser, the user or you, and whether it is `!important`, is settled before layers or specificity."
      - text: "Specificity."
        why: "Specificity only compares declarations that already tie on origin, importance, inline style and layer."
      - text: "Order of appearance."
        why: "Order is the final tie-breaker, used only when everything else is equal."
      - text: "Cascade layers."
        why: "Layers come after origin, importance and inline styles in the sort."
    answer: 0
---

Every CSS bug that makes you say "but I *wrote* that rule" has the same root cause: more than one declaration wanted the same property on the same element, and the browser picked a different one than you did. The browser isn't being random. It runs a fixed sorting algorithm called the **cascade**, and once you can run it in your head, CSS stops feeling like whack-a-mole.

This course teaches CSS from the browser's side. You'll learn what each modern feature does, and you'll also learn *why the browser behaves the way it does*, because that's what lets you predict the result before you reload.

## The page you'll build

All course long you'll refine one real page: the schedule for **Waypoint Conf 2026**, a two-day front-end conference. It has a sticky header, a filter bar with track checkboxes, session cards (time, title, speaker, room, track badge), a speaker grid with photos, and a dark mode. It starts as plain, slightly broken CSS. By the end it uses layers, container queries, `oklch()` colors, view transitions and an architecture a team of five could share.

Here is the first conflict you'll meet on it:

```html
<article class="session" id="keynote">
  <h2 class="session-title">Keynote: The Platform Is the Framework</h2>
</article>
```

```css
#keynote h2 { color: #6d28d9; }
.session .session-title { color: #1f2937; }
```

The second rule comes later, so many people expect the title to be dark grey. It's purple. To see why, you need the sorting order.

## The cascade, step by step

When several declarations target the same property on the same element, the browser sorts them by these criteria, in order, and stops at the first one that separates them:

:::figure The cascade compares declarations criterion by criterion and stops at the first difference
<svg viewBox="0 0 680 300" role="img" aria-labelledby="t1">
  <title id="t1">Five stacked steps: origin and importance, inline style, cascade layers, specificity, order of appearance. An arrow runs down through them; the first step that separates two declarations decides the winner.</title>
  <rect class="d-box-primary" x="40" y="16" width="420" height="44" rx="10"/>
  <text class="d-label-strong" x="60" y="44">1. Origin and importance</text>
  <rect class="d-box" x="40" y="72" width="420" height="44" rx="10"/>
  <text class="d-label" x="60" y="100">2. Inline style attribute</text>
  <rect class="d-box" x="40" y="128" width="420" height="44" rx="10"/>
  <text class="d-label" x="60" y="156">3. Cascade layers (@layer)</text>
  <rect class="d-box" x="40" y="184" width="420" height="44" rx="10"/>
  <text class="d-label" x="60" y="212">4. Specificity</text>
  <rect class="d-box" x="40" y="240" width="420" height="44" rx="10"/>
  <text class="d-label" x="60" y="268">5. Order of appearance</text>
  <path class="d-arrow" d="M500 30 L500 270" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="520" y="140">tie? go down</text>
  <text class="d-label-muted" x="520" y="162">a step</text>
</svg>
:::

1. **Origin and importance.** Declarations come from the browser's default stylesheet (user-agent), the user (accessibility settings, extensions) or you (author). Normal author rules beat browser defaults. `!important` flips the order, so a user's important rule beats yours. That's deliberate: someone who needs large text must be able to override your design.
2. **Inline styles.** A `style="…"` attribute beats any selector in a stylesheet. (The spec also has a step just before this one for Shadow DOM encapsulation; it only matters once you build web components.)
3. **Cascade layers.** Rules in later-declared `@layer`s beat rules in earlier ones, regardless of specificity. You'll use this in [Cascade Layers with @layer](lesson:l-css-1-3).
4. **Specificity.** How precisely the selector targets the element. IDs beat classes, classes beat element types.
5. **Order of appearance.** If everything above ties, the declaration that appears last wins.

Back to the keynote: both rules are normal author styles, neither is inline, neither is in a layer. Step 4 decides it. `#keynote h2` contains an ID, `.session .session-title` contains only classes, and one ID outranks any number of classes. Purple wins, and order never gets a vote.

:::mistake Reaching for source order first
"Move the rule lower" is the most common CSS fix, and it only works when specificity already ties. If the rule you moved has lower specificity, it still loses. Check specificity before you move anything.
:::

## When nobody wins

Sometimes no declaration targets a property at all. The browser still needs a value, so it defaults: **inherited properties** such as `color`, `font-family` and `line-height` copy the parent's value, and **non-inherited properties** such as `border`, `padding` and `background-color` get their initial value. That's why setting `font-family` on `body` styles the whole page, while setting `padding` on `body` pads only the body.

:::tip Let DevTools show you the cascade
In Chrome or Firefox, inspect the element and open the Styles panel. Losing declarations are struck through, and the Computed tab shows which rule supplied each final value. Use it to confirm the prediction you made in your head.
:::

The next lesson takes step 4 apart: how specificity is calculated, why one ID can wreck a component library, and how `:is()` and `:where()` let you choose exactly how much weight a selector carries.
