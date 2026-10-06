---
summary: Apply semantic versioning to a design system by defining its public API precisely, classifying changes to props, tokens and visuals, and writing changelogs that tell consumers what to do.
takeaways:
  - Semver only works when you have written down what your public API is; for a design system that includes component props, exported names, token names and documented CSS hooks.
  - Removing or renaming anything public, or changing a default, is a major change, even when it feels small.
  - Adding props, components or tokens is minor; fixing behavior to match the documentation is a patch.
  - A changelog is written for consumers, grouped by impact, and every breaking entry includes migration steps.
further:
  - title: About semantic versioning (npm Docs)
    url: https://docs.npmjs.com/about-semantic-versioning
  - title: Semantic Versioning specification (source)
    url: https://github.com/semver/semver/blob/master/semver.md
  - title: Changesets (official repository)
    url: https://github.com/changesets/changesets
quiz:
  - q: "`@northwind/ui` is at 4.7.2. A release removes the deprecated `kind` prop from Button (replaced by `variant` in 4.3.0). What's the next version?"
    options:
      - text: 4.7.3, because the prop was already deprecated.
        why: Deprecation is a warning, not a removal; code that still passes `kind` breaks when it disappears.
      - text: 4.8.0, because only one prop changed.
        why: The number of changes doesn't matter; any removal from the public API is breaking.
      - text: 5.0.0, because removing a public prop breaks code that still uses it.
        why: Correct. Removals belong in a major release, ideally batched with other planned removals.
    answer: 2
  - q: Northwind darkens `--nw-color-text-subtle` slightly so it passes contrast in dark mode. The name and role stay the same. How should it be released?
    options:
      - text: As a major version, because every screen with subtle text will look different.
        why: Treating every value adjustment as major would mean a major release every few weeks and teach people to ignore majors.
      - text: As a minor version with a clear changelog note and visual diffs, since the token's contract (its role) is unchanged.
        why: Correct. The name and meaning are the contract; a value refinement within that role is a documented design update.
      - text: As a patch with no changelog entry.
        why: Visible changes deserve a note even when they're compatible; teams with screenshot tests need to know why their baselines changed.
      - text: It shouldn't be released; token values must never change.
        why: Values are expected to evolve; that's why products reference names instead of hard-coding them.
    answer: 1
  - q: Which changelog entry is most useful to a product team?
    options:
      - text: "\"Refactored Button internals and cleaned up styles.\""
        why: It describes the maintainers' work, not what changes for the consumer or whether they need to act.
      - text: "\"Bumped dependencies.\""
        why: Accurate but empty; it doesn't say whether anything visible or behavioral changed.
      - text: "\"Various fixes and improvements.\""
        why: It forces every team to read the diff to find out whether they're affected.
      - text: '"Breaking: Button `kind` prop removed. Replace `kind="primary"` with `variant="primary"`, or run the codemod `nw-codemods button-kind`."'
        why: Correct. It says what changed, who is affected, and exactly how to migrate.
    answer: 3
---

When Northwind released version 3.4.0 of its UI package, eleven teams' builds failed the next morning. The release notes said "minor improvements". One of those improvements renamed the `--nw-color-text-light` token, because the team had (correctly) decided the name was misleading. It was a good change released under the wrong number, and it cost us more trust than any bug that year. Versioning is how a design system makes promises to its consumers, and broken promises are expensive.

## Semver in one paragraph

Semantic versioning gives every release a number `MAJOR.MINOR.PATCH`. A **patch** (4.7.2 → 4.7.3) fixes bugs without changing the public API. A **minor** (4.7.2 → 4.8.0) adds functionality in a backward-compatible way. A **major** (4.7.2 → 5.0.0) contains changes that can break existing usage. Package managers rely on this: a dependency written as `^4.7.2` accepts any 4.x.x from 4.7.2 upward, but never 5.0.0. Before 1.0.0, anything may change at any time, so a system that teams depend on should reach 1.0 early.

## Define your public API first

Semver means nothing until you've written down what "the public API" is. For Northwind UI it is:

- every exported component and its props, including their default values;
- every token name in the tokens package, and the role each one describes;
- documented CSS hooks: `data-variant`, `data-size` and the component tokens;
- documented behavior, such as "Dialog returns focus to the element that opened it".

Anything not on that list, such as internal class names, the DOM nesting inside a component, or private helpers, can change in any release. Write the list in your docs, and tell teams plainly that depending on undocumented internals is at their own risk.

## Classifying real changes

With the API defined, most decisions become mechanical:

| Change | Bump |
|---|---|
| Fix Dialog not returning focus on close | Patch |
| Add a `loading` prop to Button | Minor |
| Add a new Tabs component or a new token | Minor |
| Refine a token's value within the same role | Minor, with a note and visual diffs |
| Rename or remove a token, prop or component | Major |
| Change a default, such as Button's default variant | Major |

Two rows deserve a comment. Changing a default is major because code that relied on the default now renders differently without a single line changing. And value refinements are minor because the token's contract is its role, not its exact color; if "subtle text" gets slightly darker to pass contrast, every screen that used it still gets subtle text. Treat those as design updates: call them out in the changelog with before-and-after images, because teams with screenshot tests will see their baselines change.

:::mistake "It's only a rename"
Renames feel harmless because nothing about the design changed. To the build of a team that uses the old name, a rename is identical to a deletion. Ship the new name in a minor release, keep the old one as a deprecated alias, and remove it only in the next major. The next lesson builds that path step by step.
:::

## Changesets and changelogs

Remembering the right bump at release time doesn't scale across many contributors. Northwind uses Changesets: every pull request that changes a package adds a small file stating the bump type and a summary written for consumers.

```markdown title=.changeset/quiet-trucks-dance.md
---
"@northwind/ui": minor
---

Button: add a `loading` prop. While loading, the button keeps its width, sets `aria-busy`, and ignores clicks.
```

When a release is cut, the tool takes the highest bump among pending changesets, updates the version, and turns the summaries into `CHANGELOG.md`. Here is the same logic in miniature:

```js run
const order = { patch: 0, minor: 1, major: 2 };

function nextVersion(current, changes) {
  const [major, minor, patch] = current.split('.').map(Number);
  const bump = changes.reduce((top, c) => (order[c.bump] > order[top] ? c.bump : top), 'patch');
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const pending = [
  { bump: 'patch', summary: 'Dialog returns focus to its trigger on close.' },
  { bump: 'minor', summary: 'Button: add a `loading` prop.' },
];
console.log(nextVersion('4.7.2', pending));
console.log(nextVersion('4.7.2', [...pending, { bump: 'major', summary: 'Remove Button `kind`.' }]));
```

A good changelog groups entries by impact (breaking, added, fixed), is written for the people upgrading, and gives every breaking entry its migration steps. "Refactored Button internals" tells a product team nothing; "Button `kind` removed, use `variant`, a codemod is available" tells them exactly what to do.

:::tip One version for the whole package
Some systems version every component separately. Northwind tried it and ended up with a compatibility matrix nobody could read: Dialog 2.x needed Button 3.x but Tabs 1.x needed Button 2.x. One version for `@northwind/ui` and one for `@northwind/tokens` is easier for everyone to reason about.
:::

In the exercise, you assign version numbers to a batch of changes. Next, you plan how to remove things without breaking forty teams in one morning.
