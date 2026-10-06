---
summary: Remove tokens, props and components without breaking teams, by shipping the replacement first, deprecating loudly in every channel, automating migration with codemods, and deleting only in a major release.
takeaways:
  - Never deprecate something until its replacement has shipped; a deprecation without an alternative is just a complaint.
  - Mark deprecations everywhere people look - types, tokens, dev-only console warnings, docs and Figma - and always name the replacement and the removal version.
  - Codemods turn a migration from a task for 40 teams into a review for 40 teams.
  - Remove deprecated things only in a major release, after measuring that usage is near zero, and keep patching the previous major for a stated period.
further:
  - title: jscodeshift (official repository)
    url: https://github.com/facebook/jscodeshift
  - title: Design token $deprecated property (DTCG specification source)
    url: https://github.com/design-tokens/community-group/blob/main/technical-reports/format/design-token.md
  - title: "console: warn() static method (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/console/warn_static
quiz:
  - q: The core team wants to deprecate ShipmentCard because the composed Card is better. Card's Footer slot hasn't shipped yet. What should happen first?
    options:
      - text: Ship the Card pieces, including the Footer slot, so every ShipmentCard use has a working replacement.
        why: Correct. Teams can only migrate to something that exists and covers their use case.
      - text: Deprecate ShipmentCard now so teams stop adding new uses.
        why: Teams who need a card today have no alternative, so they'll ignore the warning or build their own.
      - text: Remove ShipmentCard in the next major and let teams adapt.
        why: Removing it with no replacement breaks 60 screens and leaves teams nothing to move to.
      - text: Write the migration guide first, then build Card later.
        why: A guide that points to an unreleased component can't be followed.
    answer: 0
  - q: Where should the "Button `kind` is deprecated" warning appear at runtime?
    options:
      - text: In production as an alert, so product managers notice.
        why: End users would see a message about code they can't change.
      - text: Nowhere; the changelog is enough.
        why: Most engineers don't read every changelog; a warning in their own console during development reaches them where they work.
      - text: In every render, in every environment.
        why: Logging on every render floods the console and hides real errors; production users don't need it either.
      - text: In the development console, once per session, naming the replacement and the removal version.
        why: Correct. It reaches developers while they work on the code, without noise in production.
    answer: 3
  - q: Northwind's code search shows 4 remaining uses of the deprecated `kind` prop across 40 repositories, all in one team's legacy admin tool. The 5.0 release is next week. What's the best move?
    options:
      - text: Delay 5.0 until all 40 repositories are free of every deprecated API.
        why: Holding a major release hostage to one legacy tool delays every other team's improvements.
      - text: Ship 5.0, and open a pull request to that team running the codemod, telling them they can stay on 4.x, which still gets patches, until it merges.
        why: Correct. The remaining work is small, you help directly, and the support window protects them meanwhile.
      - text: Ship 5.0 without telling the team.
        why: Their next dependency update breaks with no warning, which costs the system trust.
    answer: 1
---

Removing things is the hardest part of running a design system. Adding a component makes one team happy; removing one makes forty teams do work they didn't plan for. Northwind's first major release removed eleven props and six tokens in one go, with a migration guide published the same day. Two teams were still on the old major nine months later, quietly forking fixes. The removals themselves were right. The path to them was missing.

## The deprecation path

:::figure A deprecation spans releases: replacement, warning, migration, removal
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">A timeline from version 4.3 to 5.0 and beyond: 4.3 ships the replacement and deprecates the old API; 4.4 to 4.9 run migration with codemods and usage tracking; 5.0 removes the old API; 4.x keeps receiving patches for six months.</title>
  <path class="d-line" d="M30 90 L650 90"/>
  <circle class="d-dot" cx="80" cy="90" r="8"/>
  <circle class="d-dot" cx="300" cy="90" r="8"/>
  <circle class="d-dot" cx="520" cy="90" r="8"/>
  <text class="d-label-strong" x="80" y="60" text-anchor="middle">4.3.0</text>
  <text class="d-label-strong" x="300" y="60" text-anchor="middle">4.4 to 4.9</text>
  <text class="d-label-strong" x="520" y="60" text-anchor="middle">5.0.0</text>
  <rect class="d-box-success" x="20" y="112" width="120" height="56" rx="8"/>
  <text class="d-label" x="80" y="136" text-anchor="middle">Replacement</text>
  <text class="d-label" x="80" y="156" text-anchor="middle">+ deprecate</text>
  <rect class="d-box-warn" x="230" y="112" width="140" height="56" rx="8"/>
  <text class="d-label" x="300" y="136" text-anchor="middle">Codemods,</text>
  <text class="d-label" x="300" y="156" text-anchor="middle">track usage</text>
  <rect class="d-box-primary" x="460" y="112" width="120" height="56" rx="8"/>
  <text class="d-label" x="520" y="144" text-anchor="middle">Remove</text>
  <rect class="d-box" x="560" y="20" width="110" height="40" rx="8"/>
  <text class="d-label-muted" x="615" y="45" text-anchor="middle">4.x patched</text>
</svg>
:::

Every removal at Northwind now follows the same steps, spread over several releases.

**1. Ship the replacement first.** You can't ask teams to migrate to something that doesn't exist. Button's `variant` prop shipped in 4.3.0 as a plain addition, a minor release.

**2. Deprecate in every channel at once.** In the same release, `kind` is marked deprecated everywhere people might meet it:

```tsx title=Button.tsx
type ButtonProps = {
  /** @deprecated Use `variant`. Removed in 5.0.0. */
  kind?: 'primary' | 'secondary' | 'danger';
  variant?: 'primary' | 'secondary' | 'danger';
  // …rest of the props
};

const warned = new Set<string>();
function warnOnce(key: string, message: string) {
  if (process.env.NODE_ENV === 'production' || warned.has(key)) return;
  warned.add(key);
  console.warn(`[Northwind UI] ${message}`);
}

export function Button({ kind, variant, ...rest }: ButtonProps) {
  if (kind) warnOnce('button-kind', 'Button `kind` is deprecated; use `variant`. Removed in 5.0.0.');
  const resolvedVariant = variant ?? kind ?? 'secondary';
  // …render as before, using resolvedVariant
}
```

The `@deprecated` JSDoc tag makes editors strike the prop through as people type. The warning appears once per session, only in development builds; bundlers replace `process.env.NODE_ENV` with a constant so the check and message drop out of production code. The docs page gets a "Deprecated" badge, and the Figma component property is renamed so designers notice too.

Tokens get the same treatment. The old name stays as an alias of the new one, so nothing breaks, and the token file says so:

```json
{
  "color": {
    "text": {
      "light": {
        "$type": "color",
        "$value": "{color.text.subtle}",
        "$deprecated": "Use color.text.subtle. Removed in 5.0.0."
      }
    }
  }
}
```

**3. Automate the migration.** A codemod is a script that rewrites source code. For a renamed prop, a jscodeshift transform is a few lines:

```js title=codemods/button-kind.js
export default function transformer(file, api) {
  const j = api.jscodeshift;
  return j(file.source)
    .find(j.JSXOpeningElement, { name: { name: 'Button' } })
    .find(j.JSXAttribute, { name: { name: 'kind' } })
    .forEach((path) => {
      path.node.name.name = 'variant';
    })
    .toSource();
}
```

Teams run it with `npx jscodeshift --parser=tsx --extensions=tsx,ts -t codemods/button-kind.js src/` (without those two flags jscodeshift only reads `.js` files with the Babel parser), then review the diff. For the five largest consumers, Northwind's core team opens the migration pull requests itself. A rename that would cost forty teams an afternoon each becomes forty quick reviews.

Codemods have limits, and the migration guide should name them. The transform above renames `kind="danger"` and `kind={isUrgent ? 'danger' : 'primary'}` correctly, because both are attributes written on a `<Button>`. It can't see `kind` hidden inside spread props, such as `<Button {...actionProps} />` where `actionProps` was built in another file, or a Button re-exported under another name. That's why the runtime warning matters even after the codemod has run: it catches the cases static rewriting can't reach. Northwind's guide for every removal has the same four parts: before-and-after code, the codemod command, the known cases the codemod misses, and a link to the office hours slot where the core team helps with the rest.

**4. Measure, then remove.** Code search across repositories tells you how many uses remain; Section 5 covers how Northwind collects that automatically. When usage is near zero, the removal goes into the next major release, batched with other planned removals so teams face one upgrade instead of several.

**5. Support the previous major.** After 5.0.0 ships, 4.x still gets bug and security fixes for six months. Teams that can't upgrade immediately aren't stranded, and they don't fork.

:::mistake Deprecating without a date
"Deprecated, will be removed in a future version" gives nobody a reason to act this quarter. Every deprecation message names the replacement and the version that removes it. Teams plan around dates; they ignore "someday".
:::

## Announce it like a product change

A deprecation is news for forty teams, so treat it like a product announcement rather than a line in a changelog. Northwind posts every deprecation in the design system channel with three sentences: what is changing, why it's worth the effort, and when the removal happens. The post links the migration guide and is pinned until the major ships. Engineering managers get a monthly summary of upcoming removals that affect their teams, because they're the ones who schedule the work.

## How long is long enough?

Northwind keeps a deprecated API for at least two minor releases or three months, whichever is longer, before the major that removes it, and publishes the major release schedule a quarter ahead. Your numbers can differ; what matters is that they're written down and predictable, so teams can plan migrations into their own roadmaps instead of discovering them in a failed build.

In the exercise, you put a full deprecation in order. Next, you build the release pipeline that catches unintended breaking changes before they ship.
