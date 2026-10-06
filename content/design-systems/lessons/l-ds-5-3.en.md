---
summary: Measure design system adoption, token coverage, version currency and team satisfaction with automated scans and surveys, and say no to requests in a way that protects the system and keeps teams' trust.
takeaways:
  - Measure adoption with signals only the real system produces, such as package imports or a component's own data attribute, not class names that can be copied.
  - Track a few trends together - component adoption, token coverage, version lag and satisfaction - because any single number can be gamed.
  - Use metrics to find where the system is failing teams, never to shame teams for low numbers.
  - A good "no" names the principle, offers an alternative, and is written down so it can be revisited with new evidence.
further:
  - title: Data attributes (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
  - title: About code search (GitHub Docs)
    url: https://docs.github.com/en/search-github/github-code-search/about-github-code-search
  - title: Design Systems 101 (Nielsen Norman Group)
    url: https://www.nngroup.com/articles/design-systems-101/
quiz:
  - q: "Northwind's VP sets a target: \"100% design system adoption by Q4\". What's the main risk?"
    options:
      - text: Teams will reach 100% too quickly and the core team will run out of work.
        why: Systems always have more work than people; that's not the realistic danger.
      - text: The scanning scripts can't count above 100%.
        why: The arithmetic is fine; the problem is what people do to hit the number.
      - text: Adoption numbers can't be measured automatically.
        why: Import and DOM scans measure adoption well; measurability isn't the issue.
      - text: Teams will force system components into places they don't fit, or relabel local components, to hit the target.
        why: Correct. When a measure becomes a target, people optimize the measure; some local components are the right answer.
    answer: 3
  - q: Which signal is most reliable for counting where the real system Button is used in production pages?
    options:
      - text: Elements with the class `nw-button`.
        why: Teams copy class names along with forked CSS, so forks get counted as adoption.
      - text: Elements with `data-nw-component="Button"`, which only the system's component renders.
        why: Correct. A marker that only the real component writes can't be copied by accident with the CSS.
      - text: Buttons whose background color matches the action token.
        why: Color matches happen by coincidence and miss every non-primary variant.
      - text: Pages that load the system's CSS file.
        why: Loading the file says nothing about how many elements on the page actually use it.
    answer: 1
  - q: The reporting team asks for a `chartColors` prop on every component so they can match their dashboards. How should the core team say no?
    options:
      - text: Ignore the request until the team stops asking.
        why: Silence reads as disrespect and pushes the team toward forking.
      - text: Accept it, since saying no hurts adoption.
        why: A prop that bypasses tokens on every component damages every brand and theme to please one team.
      - text: Explain that per-component colors break theming, point them to the data-visualization palette tokens, record the decision, and invite them to bring evidence if needs change.
        why: Correct. It names the principle, offers a real alternative, and keeps the door open in writing.
      - text: Tell them the design system team has final authority.
        why: Authority without reasons wins the argument and loses the team.
    answer: 2
---

Two years into Northwind UI's second life, I reran the color script from the interface inventory lesson. Sixty-four greys had become nine, and seven of those were primitives in the token file. That one number did more for the team's funding than any presentation, because it was the same measurement, taken the same way, showing a before and an after. Measuring is how a design system proves it's a product worth paying for, and how it finds out where it is failing its users.

## What to measure

No single number tells you whether a system works. Northwind tracks four trends, reviewed monthly:

| Metric | Question it answers | How we collect it |
|---|---|---|
| Component adoption | How much UI is built with system components? | Import scans of every repository, DOM scans of key pages |
| Token coverage | Are styles using tokens or raw values? | The color script, extended to spacing and type |
| Version lag | How far behind are teams? | Package versions across repositories |
| Satisfaction | Does the system make teams faster? | A five-question survey every quarter |

Together they resist gaming. A team could inflate adoption by wrapping everything in a system `Box`, but token coverage and satisfaction wouldn't move.

## Collecting adoption honestly

Import scans are the backbone. A script walks each repository, parses source files, and counts JSX elements whose component was imported from `@northwind/ui` versus components defined locally. GitHub's code search gives a fast first answer for a single question, such as "where is the deprecated `kind` prop still used?", which is how the deprecation lesson's usage tracking works.

For production pages, every Northwind component renders a marker attribute:

```html
<button class="nw-button" data-variant="primary" data-nw-component="Button">Assign driver</button>
```

A scan of the rendered page counts elements with `data-nw-component` against all elements of the same kind. The attribute matters more than it looks. The first version of our scan counted the `nw-button` class, and reported 94% Button adoption on the marketing site. Then we found three teams had copied the Button's CSS into their own components, class names included. Only the real component writes the data attribute, so forks stop counting as adoption.

The numbers then roll up per team:

```js run
const scans = [
  { team: 'Dispatch', system: 412, total: 455, version: '5.2.0' },
  { team: 'Billing', system: 96, total: 180, version: '4.9.1' },
  { team: 'Marketing', system: 230, total: 251, version: '5.2.0' },
  { team: 'Reporting', system: 40, total: 160, version: '3.8.0' },
];
const latestMajor = 5;

for (const s of scans) {
  const percent = Math.round((s.system / s.total) * 100);
  const majorsBehind = latestMajor - Number(s.version.split('.')[0]);
  console.log(`${s.team.padEnd(10)} ${String(percent).padStart(3)}%  ${majorsBehind ? `${majorsBehind} major(s) behind` : 'current'}`);
}
```

Reporting's 25% isn't a reason to send an email to its manager. It's a research question: what does Reporting need that the system doesn't have? In Northwind's case the answer was charts and dense tables, which became the next two quarters of roadmap.

:::mistake Using adoption as a stick
When adoption numbers appear in leadership reviews with team names attached, teams learn to game them: relabeling local components, wrapping things in system primitives they don't need. Report trends for the whole organization upward, and use per-team numbers only inside conversations with those teams, to find out what's missing.
:::

## Saying no

A system that says yes to everything turns back into the 64 greys, with extra steps. Northwind says no to one-team components, brand behavior changes, props that bypass tokens, and anything that breaks a principle. The skill is saying it in a way that keeps the team's trust:

1. **Name the reason**, using the principle: "Per-component colors would break dark mode and Tidewater, and our principle is accessible before beautiful."
2. **Offer an alternative**: a local build from system parts, an existing component with better docs, a documented escape hatch such as a component token.
3. **Write it down** in the decision log, so the next team with the same request gets the same answer and the same alternative.
4. **Leave the door open**: "If two more teams need this, bring it back to API review."

:::why Why this matters
Every yes is a promise to maintain something in every theme, brand and release for years. Forty teams depend on the core team keeping those promises. Saying no clearly and kindly is how you keep the system small enough to keep them.
:::

## Where you are now

You've followed Northwind UI from an audit of 64 greys to a system that forty teams use: principles and a team model, tokens in three tiers with themes and brands, components with composable APIs and accessibility built in, versioned releases with deprecation paths and visual tests, and a contribution model with governance and metrics. None of it is finished, and that's the point of running it as a product. In the exercise, you write the adoption scan that tells you where to look next.
