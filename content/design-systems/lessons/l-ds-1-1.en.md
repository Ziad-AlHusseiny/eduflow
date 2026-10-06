---
kind: intro
summary: Explain what a design system is beyond a component library, and why it must be run as a product with users, a roadmap and a team rather than a one-off project.
takeaways:
  - A design system is tokens, components, patterns, documentation and the people and process that keep them current.
  - A project ends at launch; a product has users, a backlog and a team, which is what a design system needs to survive.
  - The customers of a design system are the product teams who build with it, so their time saved is the value you measure.
  - Most systems die from neglect after launch, not from bad components at launch.
further:
  - title: Design Systems 101 (Nielsen Norman Group)
    url: https://www.nngroup.com/articles/design-systems-101/
  - title: About the U.S. Web Design System
    url: https://designsystem.digital.gov/about/
quiz:
  - q: Northwind's first design system shipped a polished Figma library and a React package in 2021, then the team was reassigned. By 2023, half the teams had forked the components. What was the root cause?
    options:
      - text: The components were built in React instead of Web Components.
        why: Framework choice can limit reach, but it doesn't explain why teams that used React also forked the package.
      - text: It was run as a project with an end date, so nobody kept it current.
        why: Correct. Without an owning team, bugs went unfixed and requests went unanswered, so teams patched their own copies.
      - text: The Figma library had too few components at launch.
        why: A small, well-maintained system outlives a large, abandoned one; scope wasn't the failure here.
      - text: Teams were not trained on how to install the package.
        why: Training helps adoption, but teams had installed it; they left because it stopped meeting their needs.
    answer: 1
  - q: Which of these is a design system's real customer?
    options:
      - text: The end users of the products built with it.
        why: They benefit indirectly, but they never touch the system; the people who choose to use it or not are product teams.
      - text: The design system team's own designers.
        why: A system built for its makers' taste tends to ignore the constraints product teams actually face.
      - text: The product designers and engineers who build with it.
        why: Correct. They adopt it, ignore it, or fork it, so their needs drive the roadmap.
    answer: 2
  - q: A director asks, "When will the design system be done?" What is the most accurate answer?
    options:
      - text: When every screen in the product uses system components.
        why: Full coverage is a milestone, not an end; products keep changing, so the system must too.
      - text: When the Figma library and code package reach version 1.0.
        why: 1.0 marks a stable API, not the end of the work; maintenance and evolution start there.
      - text: After the documentation site is published.
        why: Documentation is one part of the system and needs upkeep like everything else.
      - text: Never, in the same way the main product is never done; it gets funded like a product.
        why: Correct. A system that stops evolving drifts away from the products it serves and gets abandoned.
    answer: 3
---

When I joined Northwind as a product designer, the dispatch app had 64 distinct greys in production, 11 button styles, and three date pickers that each formatted dates differently. Nobody had decided any of this. It accumulated: each team solved its problem on a deadline, and nobody was paid to notice the whole.

Northwind had tried to fix it once. In 2021 a tiger team built a Figma library and a React package, launched them with a nice announcement, and moved on to other work. Eighteen months later, half the teams had copied the components into their own repos to fix bugs that nobody upstream would review. The system was finished, and that was exactly the problem.

## What a design system contains

A design system is the shared set of decisions that lets many teams build consistent interfaces without re-deciding everything. Those decisions live in layers:

:::figure The layers of a design system, held together by people and process
<svg viewBox="0 0 640 300" role="img" aria-labelledby="t1">
  <title id="t1">Four stacked layers: tokens at the bottom, then components, patterns, and documentation on top, all inside a frame labelled people and process.</title>
  <rect class="d-box-warn" x="20" y="20" width="600" height="260" rx="14"/>
  <text class="d-label-strong" x="40" y="48">People and process: team, contribution, governance, releases</text>
  <rect class="d-box-accent" x="60" y="70" width="520" height="40" rx="8"/>
  <text class="d-label" x="320" y="96" text-anchor="middle">Documentation: when to use what, and why</text>
  <rect class="d-box" x="60" y="122" width="520" height="40" rx="8"/>
  <text class="d-label" x="320" y="148" text-anchor="middle">Patterns: forms, empty states, data tables</text>
  <rect class="d-box" x="60" y="174" width="520" height="40" rx="8"/>
  <text class="d-label" x="320" y="200" text-anchor="middle">Components: Button, Dialog, Tabs</text>
  <rect class="d-box-primary" x="60" y="226" width="520" height="40" rx="8"/>
  <text class="d-label" x="320" y="252" text-anchor="middle">Tokens: color, space, type, motion</text>
</svg>
:::

- **Tokens** are named design decisions: `color-action-bg` instead of `#1f5ae0`.
- **Components** are the reusable building blocks, in design tools and in code, built from tokens.
- **Patterns** are recipes for combining components to solve recurring problems, such as how Northwind shows a failed shipment sync.
- **Documentation** tells people when to use each piece, and when not to.
- **People and process** keep all of the above true over time: who fixes bugs, who approves new components, how releases ship.

A component library is one layer. Teams that build only that layer get a box of parts and no instructions, and the parts go stale.

## Product, not project

A project has a scope, a deadline and a launch party. A product has users, a backlog, a roadmap, and a team that stays after launch. Your design system is a product whose users are the product designers and engineers at your company. They have alternatives: build it themselves, copy a component, or pull in an open-source library. Every week they choose whether to use your system, and they choose it only when it saves them time.

That framing changes daily decisions. You run user research with product teams. You keep a public backlog. You measure adoption the way a product team measures retention. And when someone asks when the system will be done, the answer is "never, like the app it serves".

:::why Why this matters
Funding follows framing. A project gets a budget for one quarter; a product gets a team. At Northwind the second attempt only worked because we pitched it as a product with three permanent people and a roadmap, not as a cleanup sprint.
:::

## How this course runs

You will rebuild Northwind UI with me. It serves two surfaces, the dispatch web app and the marketing site, and two brands: Northwind and Tidewater, a company Northwind acquired. Section by section you audit what exists, design the token architecture, build components with accessibility built in, set up versioned releases, and grow adoption until forty teams depend on it. Next, you start where every real system starts: counting what is already out there.
