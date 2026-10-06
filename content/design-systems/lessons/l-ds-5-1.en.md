---
summary: Run a contribution model with clear tiers for fixes, enhancements and new components, triage requests with a decision flow, and set up lightweight governance that decides quickly and in the open.
takeaways:
  - Match the process to the size of the contribution; a typo fix and a new component should not go through the same gate.
  - A new component enters the system when several teams need it, not when one team built it first.
  - Building something locally is a legitimate outcome of triage, and the system should make that easy rather than shameful.
  - Governance works when decisions are fast, written down and argued from the principles, not from seniority.
further:
  - title: Contributing guidelines for a repository (GitHub Docs)
    url: https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors
  - title: About code owners (GitHub Docs)
    url: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
  - title: Contribute to the U.S. Web Design System
    url: https://designsystem.digital.gov/about/contribute/
quiz:
  - q: A team fixes a typo in the Tabs documentation and opens a pull request. The contribution guide requires an RFC and an API review for every change. What's the likely outcome over time?
    options:
      - text: Higher quality, because every change is reviewed thoroughly.
        why: Heavy review on trivial changes doesn't add quality; it mostly adds delay.
      - text: Teams stop contributing small fixes and work around problems locally instead.
        why: Correct. When the cost of contributing exceeds the cost of a local workaround, people choose the workaround.
      - text: The core team gets more time for important work.
        why: The core team spends that time running the heavyweight process instead.
      - text: Nothing changes; teams accept process as part of the job.
        why: People respond to friction; process cost always shows up in behavior.
    answer: 1
  - q: The billing team asks the system to add an InvoiceTimeline component. No other team has a similar need. What does Northwind's triage recommend?
    options:
      - text: Add it to the system, since a contribution is free capacity.
        why: Every component in the system is a long-term maintenance cost paid by the core team, even if someone else wrote it.
      - text: Reject it and tell the team to wait until another team needs it.
        why: The billing team needs it now; waiting helps nobody.
      - text: Ask the core team to build it as a priority.
        why: Spending core capacity on a one-team component takes it away from shared needs.
      - text: Build it locally from system tokens and components, and revisit if other teams need something similar.
        why: Correct. The team gets unblocked, the result still looks native, and the system learns whether the need is shared.
    answer: 3
  - q: Two senior designers disagree about whether Select should allow free-text entry. Which governance approach resolves it best?
    options:
      - text: Bring it to the weekly API review, argue from the principles and usage evidence, record the decision and its reasons.
        why: Correct. Decisions made openly and written down can be revisited with new evidence instead of re-argued from scratch.
      - text: Let the more senior designer decide.
        why: Seniority settles the argument today and teaches everyone that evidence doesn't matter.
      - text: Ship both behaviors behind a boolean prop.
        why: Avoiding the decision moves it into every product team and adds a prop that interacts with every other one.
    answer: 0
---

In Northwind's first year of opening contributions, we received 112 pull requests and merged 41. Most of the rest died waiting: for an API review that had no schedule, for a designer who was on another project, for a decision nobody felt allowed to make. Teams learned the lesson fast. By month nine, contributions had almost stopped, and three teams had started their own component folders again. A contribution model isn't a document; it's a promise about how quickly and fairly the core team will respond.

## Three tiers of contribution

The fix was to stop treating every contribution the same. Northwind now has three tiers, each with its own path:

| Tier | Examples | Path | First response |
|---|---|---|---|
| Fix | Bug, docs error, missing story | Pull request, one core reviewer | 2 business days |
| Enhancement | New variant, new prop, new token | Short proposal issue, then pull request | 1 week |
| New component | Date picker, data table | RFC, API review, then build with a core pair | 2 weeks for a decision |

A fix needs no permission. An enhancement needs a short written case: what problem, which teams, and the proposed API snippet, because props are public API forever. A new component needs a request for comments (RFC), a document that lays out the problem, evidence from at least two teams, the API sketch, the state matrix and the accessibility plan. The RFC gets discussed at the weekly API review, and someone leaves with a decision.

`CODEOWNERS` makes the routing automatic: the core team owns the token files and the public API exports, so any change to them requests a core review, while docs pages can be approved by any experienced contributor.

## Triage: where does a request belong?

:::figure How Northwind triages a new component request
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">Decision flow. Can an existing component do it, maybe with better docs? If yes, point to it. If no, do two or more teams need it? If no, build it locally from system parts. If yes, contribute it to the system with a core pair.</title>
  <rect class="d-box-primary" x="20" y="100" width="130" height="56" rx="10"/>
  <text class="d-label" x="85" y="133" text-anchor="middle">Request</text>
  <rect class="d-box" x="190" y="90" width="170" height="76" rx="10"/>
  <text class="d-label" x="275" y="122" text-anchor="middle">Existing component</text>
  <text class="d-label" x="275" y="142" text-anchor="middle">covers it?</text>
  <rect class="d-box-success" x="190" y="10" width="170" height="44" rx="10"/>
  <text class="d-label" x="275" y="37" text-anchor="middle">Point to it, fix docs</text>
  <rect class="d-box" x="400" y="90" width="150" height="76" rx="10"/>
  <text class="d-label" x="475" y="122" text-anchor="middle">Two or more</text>
  <text class="d-label" x="475" y="142" text-anchor="middle">teams need it?</text>
  <rect class="d-box-warn" x="400" y="200" width="150" height="48" rx="10"/>
  <text class="d-label" x="475" y="229" text-anchor="middle">Build locally</text>
  <rect class="d-box-accent" x="580" y="100" width="90" height="56" rx="10"/>
  <text class="d-label" x="625" y="124" text-anchor="middle">RFC and</text>
  <text class="d-label" x="625" y="144" text-anchor="middle">contribute</text>
  <path class="d-arrow" d="M150 128 L186 128" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M275 90 L275 58" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="290" y="78">yes</text>
  <path class="d-arrow" d="M360 128 L396 128" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="366" y="118">no</text>
  <path class="d-arrow" d="M475 166 L475 196" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="485" y="186">no</text>
  <path class="d-arrow" d="M550 128 L576 128" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="553" y="118">yes</text>
</svg>
:::

Most requests end at the first question. About half of Northwind's "new component" requests turn out to be an existing component that the docs didn't make findable, which becomes a docs fix.

The second question is where teams get nervous, because "build it locally" sounds like rejection. It isn't. A one-team component built from system tokens and components looks native and costs the system nothing to maintain. Northwind keeps a list of these local components, with owners, and checks it every quarter. When a second team needs something on the list, the original becomes the starting point for an RFC. Three of our current components, including the date picker, started this way.

:::mistake Accepting every contribution because it's free
A contributed component isn't free. Once it's in the system, the core team owns its bugs, its accessibility, its theming in every brand and its migrations for years. Accepting a one-team component to be nice to that team is how systems bloat to two hundred components that nobody can keep consistent.
:::

## Governance without a bureaucracy

Governance is how decisions get made when people disagree. Northwind's version fits on one page:

- **The core team decides** on anything that becomes public API, after hearing from the teams affected.
- **Decisions happen in the open**, at the weekly API review that anyone can attend, or asynchronously in the RFC.
- **Arguments cite the principles and evidence**, such as usage numbers or research findings, not job titles.
- **Every decision is written down** in a decision log with its reasons, so it can be revisited when the evidence changes rather than re-argued from memory.

Speed matters as much as fairness. A clear "no" in two weeks is better for a product team than a "maybe" for two months, because they can plan around a no.

:::tip Make contributors visible
Northwind credits contributors by name in the changelog and in the release announcement, and engineering managers count system contributions in performance reviews. Recognition costs nothing, and it turns contributing from a favor into a career signal.
:::

In the exercise, you put a new component's path into the system in order. Next, you scale the theming architecture to a second brand.
