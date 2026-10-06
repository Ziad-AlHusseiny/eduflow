---
summary: Structure component documentation around how people actually read it, generate the parts that drift, and write the guidance only humans can give, such as when not to use a component.
takeaways:
  - People scan documentation for a copyable example and a yes-or-no answer to "should I use this?", so put those first.
  - Every component page needs "when to use" and "when not to use", with links to the right alternative.
  - Generate props tables and examples from code and stories so they can't drift; write by hand only what code can't express.
  - Documentation is part of the definition of done and ships in the same pull request as the component change.
further:
  - title: Writing docs with Autodocs (Storybook, official repository docs)
    url: https://github.com/storybookjs/storybook/blob/next/docs/writing-docs/autodocs.mdx
  - title: How Users Read on the Web (Nielsen Norman Group)
    url: https://www.nngroup.com/articles/how-users-read-on-the-web/
  - title: Button component page (U.S. Web Design System)
    url: https://designsystem.digital.gov/components/button/
quiz:
  - q: Analytics show most visitors to Northwind's Button page leave within 40 seconds after copying the first code example. What should you conclude?
    options:
      - text: The page is failing, and people should be made to read the whole page.
        why: "Quick visits are often success: they found the example they needed. Forcing reading fights how people work."
      - text: The first example should be the most common correct usage, with the most important guidance right next to it.
        why: Correct. If the first example is what gets copied, it decides what ships, so it must model the right default.
      - text: The code examples should be removed so people read the guidelines.
        why: Removing what people need most sends them to copy from other products' code instead, mistakes included.
      - text: The page needs more variants in the first example.
        why: A busy first example is harder to copy correctly; show the common case first and the rest below.
    answer: 1
  - q: Teams keep using the Danger button for "Remove filter", which isn't destructive. Which documentation change helps most?
    options:
      - text: A longer description of the Danger button's colors.
        why: Color details don't tell anyone when the variant is appropriate.
      - text: A props table entry for `variant="danger"`.
        why: The props table shows the option exists; it says nothing about when to choose it.
      - text: A "when not to use" note with a do-and-don't example, pointing to the secondary variant for reversible actions.
        why: Correct. It names the exact misuse and gives the alternative at the moment of decision.
    answer: 2
  - q: The Button props table in the docs lists a `kind` prop that was renamed to `variant` two releases ago. What's the durable fix?
    options:
      - text: Update the table by hand and add a reminder to the release checklist.
        why: Checklists help, but hand-maintained tables will drift again on the next rename.
      - text: Remove the props table and link to the source code.
        why: Many readers aren't comfortable reading component source, and the table is useful when it's correct.
      - text: Review all docs pages once a quarter.
        why: A quarterly review finds drift months after it misled people.
      - text: Generate the props table from the component's TypeScript types during the docs build.
        why: Correct. A generated table changes when the code changes, so it can't fall behind.
    answer: 3
---

Northwind's first documentation site had 140 pages, a beautiful typeface and a principles section that took a month to write. Our analytics told a humbling story: on component pages, the median visit lasted 38 seconds. People landed, scrolled to the first code block, copied it, and left. The principles section averaged nine visits a week, most of them from our own team.

That's not a failure of the readers. Engineers and designers open documentation in the middle of a task with one question: "Is this the right component, and how do I use it?" Good documentation answers that in the first screen and keeps everything else one scroll away.

## Anatomy of a component page

Every Northwind component page follows the same order, so people learn where to look:

1. **One-line description** of what the component is for.
2. **When to use, when not to use**, with links to the alternative. "Use Dialog for decisions that block the current task. For non-blocking messages, use Toast."
3. **The primary example**: a live demo of the most common correct usage, with copyable code.
4. **Examples** of each variant and important state, each with its own code.
5. **Accessibility**: keyboard behavior, what screen readers announce, and a split between what the component handles and what the team must still do (for example, "you must give every Dialog a `Dialog.Title`").
6. **Content guidelines**: how to write labels and messages. "Button labels start with a verb: *Assign driver*, not *Driver assignment*."
7. **Props table**, generated from code.
8. **Status and history**: stable, beta or deprecated; the version it was added; links to the changelog.

The order follows what people need under time pressure. The decision ("should I use this?") and the copyable example come first; reference material comes last.

:::why Why this matters
The first example on a page gets copied more than everything else combined, so it decides what ships. Northwind's old Button page opened with a primary button. Production soon had pages with four primary buttons. When we changed the first example to a secondary and a primary button side by side, new code started following the one-primary-per-view rule without anybody being told.
:::

## Generate what drifts, write what can't be generated

Two parts of a docs page go stale fastest: props tables and code examples. Both can come from code. Props tables are generated from TypeScript types. Examples come from stories, the same files used for development and visual tests. In Storybook, a story file with the `autodocs` tag gets a generated docs page with a live preview, the story's code, and a controls table built from the component's props:

```tsx title=Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Assign driver' },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Secondary: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete route' } };
export const Small: Story = { args: { size: 'sm' } };
```

What code can't generate is judgment: when to use the component, when not to, how to word its content, and why the system made the choices it did. That's where the docs team's writing time goes.

:::mistake Documenting how, never when
A page that lists every prop but never says when to choose the component produces exactly the misuse you were trying to prevent. Northwind's Danger button was documented perfectly, prop by prop, and used for "Remove filter" on nine screens. One "when not to use" line with a do-and-don't image fixed it within a release.
:::

## Docs are part of done

Documentation that ships later doesn't ship. Northwind's pull request template for system components has a checklist: stories for every variant and state, an updated docs page, an accessibility section, and a changelog entry. A component change without them doesn't merge. Because the docs live in the same repository as the components, they're reviewed in the same pull request by the same people.

Then treat the docs like a product. Northwind tracks three signals: search queries that return no results, the questions asked in the design system Slack channel, and pages with high exit rates right after the "when to use" section. Each repeated question becomes a docs change. If the same question arrives three times, the answer belongs on the page, not in a thread.

:::tip Write the "when not to use" section first
When documenting a new component, start with the cases where it is the wrong choice. It forces you to name the neighboring components and their boundaries, which is the information people are missing when they misuse something.
:::

In the exercise, you plan the documentation fixes for a real misuse. That completes the components section; next, you connect the design side and the code side of the system so they stay in sync.
