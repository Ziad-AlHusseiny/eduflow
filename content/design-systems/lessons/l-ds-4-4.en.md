---
summary: Turn Storybook stories into the test suite for every component state, catch unintended visual changes with screenshot comparison across themes, and run releases through a CI pipeline that checks before it publishes.
takeaways:
  - A story is a documented component state, and the same story can drive interaction tests, accessibility checks and visual snapshots.
  - Visual regression tests compare screenshots against approved baselines, so unintended changes show up as diffs a human accepts or rejects.
  - Render every component in every theme combination, because the corners you never look at are the ones that break.
  - A release pipeline checks, then versions, then publishes; nothing is published from a branch that hasn't passed every check.
further:
  - title: Visual testing (Storybook docs, official repository)
    url: https://github.com/storybookjs/storybook/blob/next/docs/writing-tests/visual-testing.mdx
  - title: Visual comparisons (Playwright)
    url: https://playwright.dev/docs/test-snapshots
  - title: Changesets GitHub Action (official repository)
    url: https://github.com/changesets/action
quiz:
  - q: A visual test fails on 46 stories after a pull request that changed only the Dialog's padding token. What should the reviewer do first?
    options:
      - text: Accept all 46 new baselines, since the token change was intentional.
        why: Some of the 46 may be unintended side effects; accepting blindly turns the test into a rubber stamp.
      - text: Look at which components changed; if anything other than Dialog and things that contain it changed, the token is used more widely than expected.
        why: Correct. Diffs are evidence about the change's real reach, which is exactly what the reviewer needs to judge.
      - text: Re-run the tests, since visual tests are usually flaky.
        why: Re-running a consistent 46-story diff produces the same result; flakiness shows up as random, changing failures.
      - text: Delete the failing stories so the build passes.
        why: Removing coverage hides the problem and the next real regression with it.
    answer: 1
  - q: Visual tests pass on a developer's laptop but fail in CI with tiny differences in text edges. What's the most likely cause and fix?
    options:
      - text: The CI machine is slower; increase the timeout.
        why: Speed doesn't change anti-aliasing; timeouts affect waiting, not pixels.
      - text: Screenshots are taken before fonts load; add a fixed one-second wait to every test.
        why: Fixed waits make the suite slower and still flaky; this symptom points to rendering differences between machines.
      - text: Different operating systems render fonts differently; generate and compare baselines in one fixed environment, such as the CI container.
        why: Correct. Baselines are only comparable when they're produced by the same browser, OS and fonts.
    answer: 2
  - q: Where should `npm publish` run in a design system's release workflow?
    options:
      - text: After build, tests and visual checks pass, on the main branch, from the versioning step.
        why: Correct. Publishing is the last step and only happens for code that has passed every check and been merged.
      - text: On every pull request, so reviewers can install the change.
        why: Publishing unreviewed code to the registry puts it in front of every consumer; use preview builds or a prerelease tag instead.
      - text: Before the tests, so a failing test doesn't block urgent fixes.
        why: An urgent fix that breaks forty teams is worse than a slightly delayed one.
      - text: Manually from a maintainer's laptop after merging.
        why: Local publishing skips CI's guarantees and depends on one person's machine and credentials.
    answer: 0
---

Northwind's 4.2.0 release changed one line: the `line-height` token for body text, from 1.5 to 1.45. It looked fine in every story we checked. It also pushed the last row of the dispatch app's route table below the fold on the most common laptop resolution, in compact density, in dark mode. Nobody had looked at that combination. Since then, the rule has been simple: machines look at every combination; humans look at the differences.

## Stories are test cases

A Storybook story renders a component in one state with specific props. You wrote stories for documentation in the last section; the same stories are the backbone of testing:

- **Rendering:** every story must render without errors.
- **Interaction:** a story can have a `play` function that clicks, types and asserts, such as "pressing Escape closes the Dialog and returns focus to the trigger".
- **Accessibility:** the accessibility addon runs axe-core checks against each story and reports violations such as missing labels or failing contrast.
- **Visual:** each story is screenshotted and compared with an approved baseline.

Recent Storybook versions can run stories as tests through a Vitest integration (`@storybook/addon-vitest`), so the same files run in the Storybook UI, in the terminal and in CI. Northwind requires one story per cell of the state matrix from the accessibility lesson. That rule gives you test coverage almost for free, because the work of designing the states was already done.

## Visual regression testing

A visual regression test renders a story, takes a screenshot and compares it pixel by pixel with a stored baseline. If they differ beyond a threshold, the test fails and shows the diff. A human then decides: if the change was intended, accept it as the new baseline; if not, fix the code.

Teams typically choose one of two setups. A hosted service such as Chromatic, made by Storybook's maintainers, renders stories in the cloud and gives reviewers a web UI for accepting diffs. Or you run screenshots yourself with Playwright:

```ts title=tests/visual.spec.ts
import { test, expect } from '@playwright/test';

const stories = ['components-button--primary', 'components-button--danger', 'components-dialog--confirm'];
const themes = ['light', 'dark'];
const densities = ['comfortable', 'compact'];

for (const id of stories) {
  for (const theme of themes) {
    for (const density of densities) {
      test(`${id} ${theme} ${density}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${id}&viewMode=story`);
        await page.evaluate(([t, d]) => {
          document.documentElement.dataset.theme = t;
          document.documentElement.dataset.density = d;
        }, [theme, density]);
        await expect(page).toHaveScreenshot(`${id}-${theme}-${density}.png`);
      });
    }
  }
}
```

Each story renders in every combination of theme and density, plus brand in Northwind's real suite, which is how the line-height regression would have been caught. Playwright's `toHaveScreenshot` disables CSS animations by default and retries until two consecutive screenshots match, which removes the most common sources of noise.

:::mistake Baselines from different machines
Fonts and anti-aliasing differ between macOS, Windows and Linux, so a baseline captured on a laptop won't match a screenshot taken in CI. Generate and compare baselines in one fixed environment, usually the CI container, and let developers update them through CI rather than locally.
:::

Visual tests also guard the token tiers. Northwind adds a Stylelint rule in the same CI job that rejects any reference to a primitive token, such as `var(--nw-blue-600)`, inside component styles. The visual suite then confirms that the rule-abiding CSS still renders what designers approved.

## The release pipeline

Testing only protects consumers if publishing can't skip it. Northwind's pipeline has two halves.

**On every pull request:** install with `npm ci`, run the token checks (naming, references, contrast), typecheck, lint, unit and story tests, accessibility checks and visual tests, and require a changeset file when a package changed. The pull request can't merge until all of these pass and a core member approves the visual diffs.

**On main:** the Changesets action collects pending changesets into a "Version Packages" pull request that bumps versions and updates `CHANGELOG.md`. Merging that pull request runs the publish step:

```yaml title=.github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write        # push version commits and tags
      pull-requests: write   # open the Version Packages pull request
      id-token: write        # npm trusted publishing
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: changesets/action@v2
        with:
          publish-script: npm run release
```

Publishing happens last, only from `main`, only after build and tests. After the packages are out, the same workflow deploys the documentation site and the Storybook build, and the core team imports the released tokens into the Figma library.

:::tip Prereleases for risky changes
For a major release, publish prerelease versions such as `5.0.0-next.1` under a separate npm dist-tag, so `npm install` doesn't pick them up by default. Two or three volunteer teams install them a few weeks early and find the migration problems your codemods missed.
:::

In the exercise, you review a release workflow that can publish broken code. That completes the delivery section; next, you scale the system to forty teams.
