---
summary: "Calculate the specificity of any selector, and use :is() to group selectors and :where() to write base styles that components can override without a fight."
takeaways:
  - "Specificity is three separate counts (IDs, then classes/attributes/pseudo-classes, then types/pseudo-elements) compared column by column, never added into one number."
  - "`:is()`, `:not()` and `:has()` take the specificity of their most specific argument, even when a less specific argument is the one that matched."
  - "`:where()` always has zero specificity, which makes it the right wrapper for resets and base styles that should lose to any component."
  - "`:is()` and `:where()` use forgiving selector lists: one invalid selector inside them doesn't throw away the whole rule."
further:
  - title: "Specificity (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity
  - title: ":where() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:where
  - title: ":is() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:is
quiz:
  - q: "What is the specificity of `nav#main a.active:hover`?"
    options:
      - text: "(1, 2, 2)"
        why: "Correct. One ID (`#main`); one class plus one pseudo-class (`.active`, `:hover`); two types (`nav`, `a`)."
      - text: "(1, 1, 2)"
        why: "Pseudo-classes such as `:hover` count in the middle column alongside classes, so there are two there, not one."
      - text: "(1, 2, 1)"
        why: "Both `nav` and `a` are type selectors, so the last column is 2."
      - text: "(0, 3, 2)"
        why: "`#main` is an ID selector, which belongs in the first column, not with the classes."
    answer: 0
  - q: |
      Which color does the link get?
      ```css
      :is(#sidebar, .card) a { color: red; }
      .card .card-link { color: blue; }
      ```
      ```html
      <div class="card"><a class="card-link" href="#">Read</a></div>
      ```
    options:
      - text: "blue, because the element matched through `.card`, not `#sidebar`."
        why: "`:is()` doesn't care which argument matched. It always takes the specificity of its most specific argument, here an ID."
      - text: "red, because `:is()` takes the specificity of `#sidebar`."
        why: "Correct. The first rule scores (1,0,1) and beats (0,2,0), even though the element has no ID at all."
      - text: "blue, because it comes later in the stylesheet."
        why: "Order only matters when specificity ties, and (1,0,1) beats (0,2,0) outright."
    answer: 1
  - q: "Your reset has `ul[class] { list-style: none; margin: 0; }` and a component's `.tags { margin-block: 1rem; }` loses. What is the cleanest fix?"
    options:
      - text: "Add `!important` to the component's margin."
        why: "That wins this fight but starts an escalation; the next override needs `!important` too, and you lose the ability to theme."
      - text: "Raise the component selector to `ul.tags.tags`."
        why: "It works, but every component now has to out-score the reset, which is the arms race you want to end."
      - text: "Rewrite the reset as `:where(ul[class]) { … }`."
        why: "Correct. The reset drops to zero specificity, so any class selector in a component overrides it."
    answer: 2
  - q: "A rule is written `:is(.card, :future-state) h3 { … }` and the browser doesn't recognise `:future-state`. What happens?"
    options:
      - text: "The whole rule is dropped, as with any invalid selector list."
        why: "That's the behaviour of a plain comma list, but `:is()` and `:where()` use forgiving selector lists."
      - text: "The rule still applies to `.card h3`; only the unknown selector is ignored."
        why: "Correct. Forgiving parsing discards the invalid argument and keeps the rest."
      - text: "Chrome throws a console error and stops parsing the stylesheet."
        why: "CSS never stops parsing on errors; it discards what it can't understand and carries on."
    answer: 1
---

Waypoint's schedule page started life as a quick prototype, and its stylesheet shows it. Somewhere near the top sits `#schedule article a { color: #1d4ed8; }`, and every time the design team adds a button-styled link inside a session card, the button text turns blue. Someone "fixed" it last month with `!important`. Now nobody can theme the button.

This is a specificity problem, and the fix isn't a bigger hammer. It's choosing how much weight each selector should carry.

## Specificity is three numbers, not one

The browser scores every selector as a triple, often written (A, B, C):

| Column | Counts | Examples |
|---|---|---|
| A | ID selectors | `#schedule` |
| B | classes, attributes, pseudo-classes | `.session`, `[type="checkbox"]`, `:hover` |
| C | type selectors, pseudo-elements | `article`, `a`, `::before` |

The universal selector `*` and combinators (space, `>`, `+`, `~`) add nothing. To compare two selectors, compare column A; only if it ties, compare B; only if that ties, compare C. There is no carrying: eleven classes `(0,11,0)` still lose to one ID `(1,0,0)`. The old advice to "add up the points" (100 per ID, 10 per class) breaks exactly there, so forget it.

Score the Waypoint conflict:

```css
#schedule article a { color: #1d4ed8; }   /* (1, 0, 2) */
.btn { color: #fff; }                     /* (0, 1, 0) */
```

The ID in the first selector wins in column A, so the button text turns blue. Moving `.btn` lower in the file changes nothing.

:::why Why IDs hurt in stylesheets
An ID selector outranks every class-based selector you will ever write. One ID in a base rule forces every component that touches the same property to include an ID too, or reach for `!important`. Keep IDs for anchors and JavaScript hooks; style with classes.
:::

## `:is()`: grouping with a catch

`:is()` takes a selector list and matches if any of them match. It saves you from repeating long selectors:

```css
/* Before */
.session h2, .session h3, .session h4 { text-wrap: balance; }

/* After */
.session :is(h2, h3, h4) { text-wrap: balance; }
```

The catch is the specificity rule: `:is()` takes the specificity of its **most specific argument**, whichever one actually matched. `:is(#featured, .session) h2` scores (1,0,1) on every `.session h2`, even ones with no ID nearby. `:not()` and `:has()` follow the same rule.

`:is()` also uses a **forgiving selector list**. In a plain list like `.a, .b:unknown`, one unrecognised selector invalidates the whole rule. Inside `:is()` the browser drops only the bad argument and keeps the rest.

## `:where()`: the zero-weight wrapper

`:where()` matches exactly like `:is()`, with one difference: its specificity is always **zero**, no matter what's inside. That makes it the tool for any style that is meant to be a default:

```css title=base.css
/* Base link style: (0,0,1) because only the trailing `a` counts */
:where(#schedule article) a {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Component: (0,1,0) beats (0,0,1) */
.btn {
  color: #fff;
  background: #6d28d9;
  text-decoration: none;
}
```

The base rule still only applies inside `#schedule` articles, so its *reach* is unchanged. Only its *weight* dropped. Now any class-based component wins without tricks.

A useful default for a whole codebase: wrap resets and element defaults in `:where()`, write components with a single class, and keep state selectors (`.btn:hover`, `.btn[aria-pressed="true"]`) one step heavier than the component.

:::mistake Wrapping the whole selector when only part should be light
`:where(.session .title)` scores zero, so even a stray `h2 { color: … }` in some other file beats it. Wrap only the context you want weightless and leave the part that identifies the element outside: `:where(.session) .title` keeps (0,1,0).
:::

## Four ways to win a specificity fight

When a rule loses, you have four options. Here they are in the order I reach for them:

1. **Lower the loser.** If the winning rule is a base style that shouldn't be heavy, wrap its context in `:where()`. This fixes the cause, and every future component benefits.
2. **Move whole groups apart with layers.** When the conflict is between kinds of CSS (resets versus components versus utilities), cascade layers settle it for good. That's the next lesson.
3. **Raise the winner.** Repeating a class, as in `.btn.btn`, adds (0,1,0) without changing what matches. It's a legitimate, local hack, but every repetition is a debt the next override has to pay.
4. **`!important`.** Keep it for utilities that must always win and for accessibility overrides. Used to patch a single conflict, it starts an arms race, because the only way to beat it is another `!important`.

## Reading specificity in DevTools

You don't have to count by hand forever. Hover a selector in the Chrome or Firefox Styles panel and the tooltip shows its specificity triple. Use it to check your mental arithmetic for a week; after that, you'll rarely need it.

## Your turn

The exercise gives you the Waypoint session card with the prototype's link rule. Lower the base rule's weight so the button looks like a button again, while normal links keep their blue underline. You'll fix this at a larger scale in the next lesson, where cascade layers let you decide which *groups* of styles win, before specificity is even consulted.
