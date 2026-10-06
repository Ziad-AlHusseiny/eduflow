---
summary: Write design principles that settle real trade-offs, and choose between solitary, centralized, federated and hybrid team models for running a design system.
takeaways:
  - A useful principle picks a side in a real trade-off; if no reasonable team would choose the opposite, it is a slogan, not a principle.
  - Principles earn their place in reviews, when they settle an argument without a meeting.
  - A centralized team gives quality and speed of decisions but can become a bottleneck far from product reality.
  - A federated model spreads ownership across product teams but needs a small core to stay coherent.
  - Most systems that last end up hybrid: a small dedicated core plus contributors from product teams.
further:
  - title: Design principles (U.S. Web Design System)
    url: https://designsystem.digital.gov/design-principles/
  - title: Design Systems 101 (Nielsen Norman Group)
    url: https://www.nngroup.com/articles/design-systems-101/
quiz:
  - q: Which of these is the strongest design principle for Northwind UI?
    options:
      - text: Our components are simple and intuitive.
        why: No team would argue for complicated and confusing components, so this never settles a decision.
      - text: Consistency across every product.
        why: Everyone agrees with it in the abstract, and it gives no guidance when consistency conflicts with a product's real need.
      - text: Accessible before beautiful; we drop a variant rather than ship one below WCAG 2.2 AA.
        why: Correct. It names a trade-off, picks a side, and tells you what to do when the two goals collide.
      - text: We design with empathy for our users.
        why: A value worth holding, but it doesn't help choose between two concrete options in a review.
    answer: 2
  - q: A 12-person company has one product team and wants a design system. Which team model fits best right now?
    options:
      - text: Solitary, where the product team builds the system as part of its own work.
        why: Correct. With one team there is nobody else to coordinate with yet; a separate system team would have no other customers.
      - text: Centralized, with a dedicated three-person system team.
        why: A dedicated team serving a single product team is mostly overhead at this size.
      - text: Federated, with contributors from many teams.
        why: Federation needs several product teams to federate; with one team it is the same as solitary.
    answer: 0
  - q: Northwind tried a fully federated model with no dedicated people. What is the most likely failure?
    options:
      - text: Components become too consistent and teams lose flexibility.
        why: The usual problem is the reverse; without a core, components diverge.
      - text: Release cadence becomes too fast for teams to absorb.
        why: Without dedicated owners, releases tend to stall rather than speed up.
      - text: Contributions stall or conflict because nobody owns reviews, releases and the overall direction.
        why: Correct. When everyone owns the system part-time, its upkeep loses to every product deadline.
      - text: Designers stop using Figma libraries.
        why: Tool usage isn't driven by the team model; ownership and quality are.
    answer: 2
---

Every design system team eventually faces the same argument in a review. A product designer wants a light-grey "subtle" button for the marketing hero, and it fails contrast. Someone says "but it looks better". Someone else says "but accessibility". Forty minutes later nobody has changed their mind. Principles exist to end that meeting in two minutes, and team models exist so that someone has the authority to apply them.

## Principles that decide things

Most published design principles are slogans: *simple*, *consistent*, *human*, *delightful*. Try this test on any principle: could a reasonable team choose the opposite? Nobody argues for complicated or inhuman software, so those words never decide anything.

A useful principle names a trade-off and picks a side. Here are the four Northwind UI uses:

1. **Accessible before beautiful.** No component ships below WCAG 2.2 AA. If a variant can't meet it, we drop the variant.
2. **Boring in the app, expressive on the site.** The dispatch app favors density and predictability; the marketing site may use bolder type and motion, through tokens rather than one-off CSS.
3. **Opinionated defaults, documented escape hatches.** Components do the right thing with zero props. When a team needs to deviate, there is a supported way, and it is written down.
4. **Fewer, better components.** We would rather extend an existing component than add a near-duplicate.

Each one would lose to its opposite at some other company. A gaming studio might reasonably say "expressive everywhere". That is how you know the principle carries information.

:::tip Test a principle on a past argument
Take three real disagreements from the last quarter and ask whether each principle would have settled them. If a principle settles none, rewrite it or drop it. Four principles that work beat ten that decorate a slide.
:::

Principles also need to live where decisions happen: in the component proposal template, in the review checklist, at the top of the documentation site. A principle that only appears in the launch deck is gone within a month.

## Who runs the system: four team models

Principles need people with the time and authority to apply them. Nathan Curtis described the three classic shapes in 2015, and they still describe most organizations:

:::figure Solitary, centralized and federated design system teams
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">Three diagrams. Solitary: one product team owns the system and others copy it. Centralized: a dedicated system team serves several product teams. Federated: several product teams each contribute to a shared system.</title>
  <text class="d-label-strong" x="110" y="28" text-anchor="middle">Solitary</text>
  <rect class="d-box-primary" x="50" y="50" width="120" height="44" rx="10"/>
  <text class="d-label" x="110" y="77" text-anchor="middle">Team A + system</text>
  <rect class="d-box" x="20" y="170" width="80" height="40" rx="10"/>
  <text class="d-label-muted" x="60" y="195" text-anchor="middle">Team B</text>
  <rect class="d-box" x="120" y="170" width="80" height="40" rx="10"/>
  <text class="d-label-muted" x="160" y="195" text-anchor="middle">Team C</text>
  <path class="d-dashed" d="M90 94 L60 170"/>
  <path class="d-dashed" d="M130 94 L160 170"/>
  <text class="d-label-strong" x="340" y="28" text-anchor="middle">Centralized</text>
  <rect class="d-box-primary" x="280" y="50" width="120" height="44" rx="10"/>
  <text class="d-label" x="340" y="77" text-anchor="middle">System team</text>
  <rect class="d-box" x="240" y="170" width="60" height="40" rx="10"/>
  <text class="d-label" x="270" y="195" text-anchor="middle">A</text>
  <rect class="d-box" x="310" y="170" width="60" height="40" rx="10"/>
  <text class="d-label" x="340" y="195" text-anchor="middle">B</text>
  <rect class="d-box" x="380" y="170" width="60" height="40" rx="10"/>
  <text class="d-label" x="410" y="195" text-anchor="middle">C</text>
  <path class="d-arrow" d="M320 94 L275 166" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 94 L340 166" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M360 94 L405 166" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="570" y="28" text-anchor="middle">Federated</text>
  <rect class="d-box-accent" x="510" y="110" width="120" height="44" rx="10"/>
  <text class="d-label" x="570" y="137" text-anchor="middle">Shared system</text>
  <rect class="d-box" x="480" y="40" width="60" height="40" rx="10"/>
  <text class="d-label" x="510" y="65" text-anchor="middle">A</text>
  <rect class="d-box" x="600" y="40" width="60" height="40" rx="10"/>
  <text class="d-label" x="630" y="65" text-anchor="middle">B</text>
  <rect class="d-box" x="540" y="190" width="60" height="40" rx="10"/>
  <text class="d-label" x="570" y="215" text-anchor="middle">C</text>
  <path class="d-arrow" d="M520 80 L545 106" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M620 80 L595 106" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M570 190 L570 158" marker-end="url(#arrow)"/>
</svg>
:::

- **Solitary.** One product team builds a system for itself, and other teams copy it. Cheap and fast, and it reflects one team's needs. It works while there is only one team that matters.
- **Centralized.** A dedicated team builds and maintains the system for everyone. Decisions are fast and quality is high. The risk is distance: a central team that ships no product can build components nobody asked for, and its backlog becomes everyone's bottleneck.
- **Federated.** Designers and engineers from product teams contribute to a shared system in part of their time. The system stays close to real needs. The risk is that system work always loses to product deadlines.
- **Hybrid.** A small dedicated core owns quality, releases, tokens and direction; product teams contribute components and fixes through a defined process. This is where most long-lived systems end up.

:::mistake "Everyone owns it"
Northwind's 2021 system ended in a federated model with no core: a Slack channel and good intentions. Pull requests waited weeks for review because reviewing was nobody's job. If you federate, fund the core first. Two dedicated people who own reviews and releases are the minimum.
:::

## What Northwind chose

For the second attempt we started centralized: two designers and three engineers, plus a product manager shared with another team. Centralized was right while the foundations were being built, because tokens and core components need a few people making many consistent decisions quickly.

Once Button, inputs, Dialog and the token pipeline were stable, we opened contributions and moved to hybrid. Product teams now build roughly a third of new components, and the core reviews, documents and releases them. Section 5 covers how that contribution process works in practice.

Notice that the team model changes with the system's age. Ask "what does the system need this year?" rather than "which model is best?". With principles and an owning team in place, you are ready for the first real piece of architecture: design tokens.
