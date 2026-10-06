---
summary: Run and take part in a design critique that improves work against its goals, then turn Steady into a portfolio case study that shows your decisions, reasons and trade-offs.
takeaways:
  - A critique judges work against its goals, not against personal taste, and the presenter sets the goal, the stage and the kind of feedback wanted.
  - Useful feedback names an observation, its likely effect on the user, and a question or suggestion.
  - When receiving feedback, ask questions and take notes instead of defending; you decide afterwards what to act on.
  - A case study tells the story of decisions (problem, constraints, options, choice and reason), not a gallery of finished screens.
  - Be honest about scope and evidence; a practice project with clear reasoning beats invented metrics.
further:
  - title: Design Critiques (Nielsen Norman Group)
    url: https://www.nngroup.com/articles/design-critiques/
quiz:
  - q: "Which critique comment on Steady's Today screen is most useful?"
    options:
      - text: I don't love the teal; can we try purple?
        why: This is a preference with no link to the goal. It invites a taste debate instead of an improvement.
      - text: It looks great, ship it.
        why: Encouraging, but it gives the designer nothing to act on and skips the point of a critique.
      - text: The streak numbers are the same weight as the habit names, so I read streaks first; could they drop to Caption?
        why: Correct. It names an observation, its effect on reading, and a concrete question tied to the hierarchy goal.
      - text: Other habit apps use a calendar view on this screen.
        why: Competitor patterns can inform, but without saying what problem the calendar would solve, it is not actionable.
    answer: 2
  - q: You present the New habit sheet and a colleague says the frequency chips are confusing. What is the best response in the moment?
    options:
      - text: Explain the research behind the chips until they agree.
        why: Defending shuts down the feedback. You lose the chance to learn what confused them.
      - text: Ask what they expected to happen when they read "Custom", and note the answer.
        why: Correct. A clarifying question turns a vague reaction into something specific you can evaluate later.
      - text: Change the chips to a dropdown on the spot.
        why: Redesigning live skips thinking. Collect feedback first and decide afterwards.
      - text: Thank them and move on without writing anything down.
        why: Politeness is good, but unrecorded feedback is usually forgotten by the next day.
    answer: 1
  - q: Your Steady case study has twelve polished screenshots and a paragraph of introduction. What would most improve it for a hiring manager?
    options:
      - text: Adding before and after versions of key decisions, each with the reason for the change.
        why: Correct. Hiring managers look for how you think. Visible decisions and reasons show that better than polish.
      - text: Adding more screenshots so the project looks bigger.
        why: Volume hides the thinking. Most reviewers skim, so fewer, explained images work better.
      - text: Adding user metrics such as "engagement up 40%".
        why: Steady is a practice project with no real users. Invented metrics damage trust the moment someone asks about them.
      - text: Removing all text so the visuals speak for themselves.
        why: Visuals show what you made, not why. The reasoning is what distinguishes a designer.
    answer: 0
---

Steady is designed, systematised, prototyped, checked and handed off. Two skills turn that work into better work and into a job: running a critique where people can improve the design, and telling the story of the design in a case study. Both come down to the habit this course has pushed since Lesson 1.1, giving the *because*.

## What a critique is for

A design critique is a structured conversation about whether a design achieves its goals. It is not a vote on whether people like it, and it is not approval. Sofia runs every critique the same way, in about thirty minutes:

1. **Context (3 minutes).** The presenter states the goal ("someone checks off a habit in a few seconds"), the stage ("structure is settled; styling is early") and the feedback they want ("Is the progress block worth its space?").
2. **Silent review (5 minutes).** Everyone looks at the design or clicks through the prototype and writes notes. Silence stops the loudest person from setting the agenda.
3. **Feedback round (15 minutes).** Each person shares their most important points, tied to the goal. A facilitator keeps time and steers away from solving everything live.
4. **Wrap-up (5 minutes).** The presenter summarises what they heard and what they will look into. Decisions happen after, not in the room.

## Giving feedback that helps

Useful feedback has three parts: an **observation**, its likely **effect** on the user or goal, and a **question or suggestion**. Compare:

| Not useful | Useful |
|---|---|
| "I don't like the teal." | "The teal is on the check buttons and the header icon, so I tried to tap the icon. Could the accent be reserved for actions?" |
| "It feels cluttered." | "I count five left edges on Habit detail, so my eye jumps around. Could the stats align with the calendar?" |
| "Use a bottom tab bar like Instagram." | "I couldn't find Stats from Habit detail. Would a persistent tab bar help, or is Back enough?" |

The useful versions are about the user, not about the critic's taste, and they leave room for the designer to find the best fix. Phrasing as a question also admits that you might be missing context.

## Receiving feedback

When it is your work on the screen, your job is to understand, not to win. Ask clarifying questions ("What did you expect to happen when you tapped Custom?"), write everything down, and say thank you. Do not explain why every point is wrong; if your reasoning is good, it will survive the notes you review afterwards. After the session, sort the notes into act on, investigate and decline, and decline with a reason you could say out loud.

:::mistake Critique as approval
When a critique turns into stakeholders approving or rejecting a design, people stop raising half-formed concerns and start lobbying for preferences. Keep critique and sign-off separate. A critique's output is a list of questions for the designer, not a decision.
:::

## The case study

A portfolio case study is how a hiring manager decides whether you think like a designer. They will spend a few minutes on it, so the structure has to carry them quickly to the thinking.

:::figure A case study structure that puts decisions first
<svg viewBox="0 0 680 280" role="img" aria-labelledby="t1">
  <title id="t1">Six stacked blocks from top to bottom: one-minute summary, problem and constraints, key decisions with before and after, the system, testing and what changed, and reflection. The decisions block is the largest.</title>
  <rect class="d-box-primary" x="140" y="10" width="400" height="34" rx="8"/>
  <text class="d-label-strong" x="340" y="32" text-anchor="middle">One-minute summary</text>
  <rect class="d-box" x="140" y="52" width="400" height="34" rx="8"/>
  <text class="d-label" x="340" y="74" text-anchor="middle">Problem, role and constraints</text>
  <rect class="d-box-accent" x="140" y="94" width="400" height="80" rx="8"/>
  <text class="d-label-strong" x="340" y="128" text-anchor="middle">Key decisions: before, after, because</text>
  <text class="d-label-muted" x="340" y="152" text-anchor="middle">hierarchy, spacing system, dark mode, check button</text>
  <rect class="d-box" x="140" y="182" width="400" height="34" rx="8"/>
  <text class="d-label" x="340" y="204" text-anchor="middle">The system: kit, variables, modes</text>
  <rect class="d-box" x="140" y="224" width="195" height="44" rx="8"/>
  <text class="d-label" x="237" y="251" text-anchor="middle">Testing</text>
  <rect class="d-box-success" x="345" y="224" width="195" height="44" rx="8"/>
  <text class="d-label" x="442" y="251" text-anchor="middle">Reflection</text>
</svg>
:::

For Steady, that means:

- **Summary**: one paragraph and one hero image. "A habit tracker designed so checking off a habit takes under three seconds; includes a themed component kit and a tested check-in flow."
- **Problem and constraints**: who it is for, what the Today screen must do, and your role ("solo practice project, designed in Figma over six weeks").
- **Key decisions**: three or four, each with before and after images and the reason. Draft one versus draft two of the Today screen from Lesson 1.2 is perfect material, and so is the dark-mode accent that had to change because teal/700 failed on the dark surface.
- **The system**: the kit page, the semantic variables in both modes, and one component's properties, showing you can design for reuse.
- **Testing**: what you tested, with whom, and what changed as a result. Five friends using the prototype counts if you say so plainly.
- **Reflection**: what you would do differently and what you would test next.

:::tip Honesty is a feature
Label practice work as practice work. "I tested with five people; three missed the add button, so I moved it" is more convincing than an unverifiable "conversion up 40%". Interviewers ask follow-up questions, and real reasoning holds up.
:::

You started this course by asking what someone opening Steady needs in the next five seconds. Keep asking that question, keep giving the *because*, and every screen you design will be easier to critique, build and explain.
