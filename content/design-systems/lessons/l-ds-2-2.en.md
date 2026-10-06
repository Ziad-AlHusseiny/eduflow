---
summary: Name design tokens with a written grammar of category, concept, property, variant and state, so names stay true through dark mode, new brands and years of growth.
takeaways:
  - Semantic token names describe purpose (`danger`, `subtle`), never appearance (`red`, `light`), because appearance changes with themes.
  - A fixed order of name parts, such as category-concept-property-variant-state, makes tokens predictable to guess and easy to sort.
  - Numeric scales like 100 to 900 leave room to insert values later; t-shirt sizes read better but fill up.
  - Write the naming grammar down and enforce it with a lint rule, or every contributor invents their own.
further:
  - title: Custom properties (--*) (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/--*
  - title: Design tokens (Material Design 3)
    url: https://m3.material.io/foundations/design-tokens
  - title: Design Tokens Format Module 2025.10 (source on GitHub)
    url: https://github.com/design-tokens/community-group
quiz:
  - q: Which semantic token name will still be accurate after Northwind adds dark mode?
    options:
      - text: "`--nw-color-text-subtle`"
        why: Correct. "Subtle" describes the role (lower emphasis text), which holds in light and dark themes alike.
      - text: "`--nw-color-text-light`"
        why: In dark mode the subtle text is a mid-grey on a dark background, so "light" either lies or gets confused with the theme name.
      - text: "`--nw-color-text-gray-500`"
        why: Embedding a primitive in a semantic name means the name breaks the moment the theme maps it to a different grey.
      - text: "`--nw-color-text-2`"
        why: A bare number says nothing about purpose, so nobody can pick it correctly without opening the docs.
    answer: 0
  - q: The dispatch team created `--nw-color-header-bg` for the top bar. Now the sidebar needs the same color. What's the best move?
    options:
      - text: Use `--nw-color-header-bg` in the sidebar too.
        why: The sidebar now depends on a token named for the header; when the header changes, the sidebar changes by accident.
      - text: Copy the value into a new `--nw-color-sidebar-bg`.
        why: Two tokens for one decision drift apart, which is how the 64 greys happened.
      - text: Rename it to a purpose-based token like `--nw-color-surface-inverse` and alias the old name to it during a deprecation period.
        why: Correct. The name now describes the shared role, and the alias gives consumers time to migrate.
    answer: 2
  - q: Your spacing scale is `--nw-space-sm`, `-md`, `-lg`. Designers now need a value between `sm` and `md`. What does this show?
    options:
      - text: T-shirt sizes should never be used for tokens.
        why: They're readable and work well for small, stable scales; the issue is only that they're hard to extend in the middle.
      - text: The new value should be a one-off pixel value in that component.
        why: A hard-coded value bypasses the scale and starts the drift again.
      - text: Spacing tokens should be component tokens instead.
        why: Spacing is shared across components, so it belongs in the shared scale.
      - text: Named steps fill up; a numeric scale like 100, 200, 300 leaves room for 150 later.
        why: Correct. Numeric scales trade some readability for room to grow, which is why many systems use them for primitives.
    answer: 3
  - q: Why does the DTCG format forbid `.` inside token names?
    options:
      - text: Periods are not valid in JSON keys.
        why: JSON keys can contain any string, including periods.
      - text: The period separates path segments in references like `{color.action.bg}`.
        why: Correct. A period inside a name would make the reference path ambiguous.
      - text: CSS custom properties cannot contain periods.
        why: The rule comes from the token format's reference syntax, not from CSS.
    answer: 1
---

In Northwind's old token file there was a token called `--color-blue-new`. Two years later there was also `--color-blue-new-2` and `--color-blue-newer`. Nobody knew which was the brand blue. Naming is the part of a design system that looks like bikeshedding and turns out to be architecture: names are the API every designer and engineer types hundreds of times a week.

## A grammar, not a list

Good token names come from a grammar: a fixed set of parts in a fixed order. Northwind's semantic tokens follow this one:

```text
--nw-{category}-{concept}-{property}-{variant}-{state}

--nw-color-action-bg                 category=color concept=action property=bg
--nw-color-action-bg-hover           … state=hover
--nw-color-danger-text               concept=danger property=text
--nw-color-text-subtle               concept=text variant=subtle
--nw-space-inset-md                  category=space concept=inset variant=md
--nw-radius-control                  category=radius concept=control
```

Not every token uses every part, but the parts that appear always appear in that order. That buys you two things. People can guess names they've never seen: if `--nw-color-action-bg-hover` exists, `--nw-color-danger-bg-hover` probably does too. And sorted alphabetically, related tokens cluster together in every editor and in Figma's variable panel.

The `nw` prefix is a namespace. It stops collisions with third-party CSS and makes system tokens easy to search for, which you'll use for adoption metrics later.

## Name the purpose, not the look

At the primitive tier, naming the look is correct: `--nw-blue-600` *is* a blue. At the semantic tier, the look is exactly what themes change, so names must describe purpose.

| Fragile name | Why it breaks | Durable name |
|---|---|---|
| `--nw-color-red-bg` | Tidewater's error color is orange | `--nw-color-danger-bg` |
| `--nw-color-text-light` | In dark mode it is not light | `--nw-color-text-subtle` |
| `--nw-color-header-bg` | Named after its first user | `--nw-color-surface-inverse` |
| `--nw-color-text-2` | Says nothing | `--nw-color-text-muted` |

:::mistake Naming a token after the first place it appears
A token named `header-bg` invites the sidebar team to either misuse it or duplicate it. Before you name a semantic token, ask what *role* the value plays, and whether another component could play the same role. If the answer is yes, name the role.
:::

## Scales: numbers or sizes

Primitive scales need a naming scheme too. There are two common choices:

- **Numeric**, like `100` to `900` for color lightness or `1` to `12` for spacing steps. You can insert `150` later without renaming anything. The numbers carry little meaning on their own.
- **T-shirt sizes**, like `xs`, `sm`, `md`, `lg`, `xl`. Easy to read in code review. When designers need a step between `sm` and `md`, you are stuck with names like `sm-plus`.

Northwind uses numeric scales for primitives and t-shirt sizes for the handful of semantic spacing tokens (`--nw-space-inset-sm`, `-md`, `-lg`), because designers think in sizes and that set rarely grows. Pick one scheme per scale and stick to it. Mixing them inside one scale, such as `--nw-space-2`, `--nw-space-md` and `--nw-space-24px`, is the fastest way to make a scale nobody trusts, because people can no longer tell which values are siblings.

## Enforce the grammar

A grammar that lives only in a wiki page lasts until the first busy contributor. Turn it into a check that runs in CI:

```js run
const grammar = /^--nw-(color|space|radius|font|shadow|motion)(-[a-z]+)+(-[0-9]+)?$/;
const banned = /-(red|blue|green|light|dark|new|old|[0-9]+px)(-|$)/;

const proposed = [
  '--nw-color-action-bg-hover',
  '--nw-color-text-light',
  '--nw-color-blue-new',
  '--nw-space-inset-md',
  '--nwColorDangerText',
  '--nw-color-danger-text',
];

for (const name of proposed) {
  const ok = grammar.test(name) && !banned.test(name);
  console.log(ok ? 'ok    ' : 'reject', name);
}
```

The `banned` list catches the habits that break first: color words, "light" and "dark", "new" and "old", and raw pixel values. Run it against every token file in pull requests, and print the rule that failed so contributors learn the grammar from the error instead of from a wiki page. It's a blunt tool, and it will occasionally reject a good name. That's fine; a contributor who hits it asks the core team, and the conversation is the point.

:::tip Names in token files versus CSS
In a DTCG JSON file, the name parts become nested groups: `color` → `action` → `bg` → `hover`. The pipeline joins them with dashes and adds the prefix when it writes CSS. The format reserves `.` for references like `{color.action.bg}`, which is why token and group names can't contain periods. You'll see this in two lessons.
:::

## Renaming without breaking people

You will get some names wrong; everybody does. When you rename a token, keep the old name as an alias of the new one for at least one release, mark it deprecated, and announce it in the changelog. Section 4 covers the full deprecation path. In the exercise below, you review a batch of proposed names the way the Northwind core team does every week. Next, you put the semantic tier to work: one set of components, several themes.
