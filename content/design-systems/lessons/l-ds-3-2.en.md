---
summary: Recognize prop explosion and replace it with compound components that share state through context, while knowing when a small configured component is still the better choice.
takeaways:
  - When every new use case adds a prop, the component is configured from the outside and will keep growing; composition lets consumers arrange pieces instead.
  - Compound components such as `Card.Header` and `Tabs.Trigger` share state through context, not by inspecting children.
  - The system still owns each piece's look and behavior, so composition adds flexibility without giving up consistency.
  - Small, closed components like Badge or Avatar are fine with configuration; reach for composition when props start describing layout or content.
further:
  - title: Passing data deeply with context (React)
    url: https://react.dev/learn/passing-data-deeply-with-context
  - title: use (React API reference)
    url: https://react.dev/reference/react/use
  - title: Tabs pattern (WAI-ARIA Authoring Practices)
    url: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
quiz:
  - q: A team asks for a `footerSecondaryActionIcon` prop on ShipmentCard. What does this request most likely signal?
    options:
      - text: The card needs one more prop, and then it will be complete.
        why: Each "last" prop is followed by another; the pattern shows the API has no natural end.
      - text: The team should build its own card.
        why: A fork loses the system's styling and fixes; the problem is the card's API shape, not the team.
      - text: The card is configured from the outside, so layout and content decisions keep turning into props.
        why: Correct. A footer slot that accepts any actions would have absorbed this request and the next ten.
      - text: The icon set is missing an icon.
        why: The request is about where content goes, not which icons exist.
    answer: 2
  - q: How should `Tabs.Trigger` find out which tab is selected?
    options:
      - text: Read it from a context that `Tabs` provides.
        why: Correct. Context works however deeply the trigger is nested and whatever order the consumer uses.
      - text: "`Tabs` loops over its children with `React.Children.map` and injects props."
        why: That breaks as soon as a trigger is wrapped in another element, such as a tooltip or a layout div.
      - text: Each trigger reads a global variable.
        why: Two tab sets on one page would fight over the same variable.
      - text: The consumer passes `selected` to every trigger by hand.
        why: Possible, but it pushes the component's own state management onto every team.
    answer: 0
  - q: Which component is the best candidate to keep as a simple configured component?
    options:
      - text: A Dialog with a header, body, footer and optional side panel.
        why: Its content and layout vary a lot between uses, which is exactly where composition helps.
      - text: A data table with custom cells, toolbars and row actions.
        why: Tables vary enormously; configuration-only tables become the biggest prop lists in any system.
      - text: A status Badge with a `tone` and a short label.
        why: Correct. Its variations are few and enumerable, so a couple of props describe it completely.
    answer: 2
---

The first version of Northwind's ShipmentCard had six props. A year later it had twenty-three: `title`, `subtitle`, `status`, `statusTone`, `showMenu`, `menuItems`, `footerText`, `footerAction`, `footerActionVariant`, `hideBorder`, `compact`, `imageUrl`, `imagePosition`, and so on. Every team's slightly different card became one more prop. The component's code was a thicket of conditionals, and the docs page listed props nobody could keep in their head. This is prop explosion, and every design system meets it.

## Configuration versus composition

A **configured** component receives data and decides the layout itself. A **composed** component offers pieces, and the consumer arranges them.

:::figure One component with many props, versus small pieces arranged by the consumer
<svg viewBox="0 0 660 240" role="img" aria-labelledby="t1">
  <title id="t1">Left: a single ShipmentCard box fed by a long list of props. Right: a Card box containing Header, Body and Footer pieces that the consumer arranges.</title>
  <text class="d-label-strong" x="150" y="28" text-anchor="middle">Configuration</text>
  <rect class="d-box" x="20" y="44" width="110" height="170" rx="8"/>
  <text class="d-code" x="30" y="70">title</text>
  <text class="d-code" x="30" y="94">statusTone</text>
  <text class="d-code" x="30" y="118">menuItems</text>
  <text class="d-code" x="30" y="142">footerText</text>
  <text class="d-code" x="30" y="166">hideBorder</text>
  <text class="d-label-muted" x="30" y="196">+18 more</text>
  <path class="d-arrow" d="M130 129 L176 129" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="180" y="94" width="110" height="70" rx="10"/>
  <text class="d-label" x="235" y="134" text-anchor="middle">ShipmentCard</text>
  <text class="d-label-strong" x="500" y="28" text-anchor="middle">Composition</text>
  <rect class="d-box-primary" x="390" y="44" width="220" height="180" rx="12"/>
  <text class="d-code" x="404" y="68">Card</text>
  <rect class="d-box-accent" x="410" y="80" width="180" height="36" rx="8"/>
  <text class="d-code" x="500" y="103" text-anchor="middle">Card.Header</text>
  <rect class="d-box-accent" x="410" y="124" width="180" height="44" rx="8"/>
  <text class="d-code" x="500" y="151" text-anchor="middle">Card.Body</text>
  <rect class="d-box-accent" x="410" y="176" width="180" height="36" rx="8"/>
  <text class="d-code" x="500" y="199" text-anchor="middle">Card.Footer</text>
</svg>
:::

Here is the same shipment card, composed:

```tsx title=RouteCard.tsx
<Card>
  <Card.Header>
    <Card.Title>Shipment NW-4471</Card.Title>
    <Badge tone="info">In transit</Badge>
    <ShipmentMenu shipmentId="NW-4471" />
  </Card.Header>
  <Card.Body>Rotterdam to Hamburg · 2 pallets</Card.Body>
  <Card.Footer>
    <Button size="sm">Track</Button>
    <Button size="sm" variant="primary">Assign driver</Button>
  </Card.Footer>
</Card>
```

The card never needed a `footerSecondaryAction` prop because `Card.Footer` is a slot that accepts any actions. The menu is the team's own component, placed where the header allows. Yet the system still owns spacing, borders, typography and responsive behavior of each piece. Teams get flexibility in *what goes where*; the system keeps control of *how each piece looks*.

## Sharing state between the pieces

Static pieces like Card only need layout. Interactive ones like Tabs need shared state: the selected tab, and which panel to show. The robust way to share it is context:

```tsx title=Tabs.tsx
import { createContext, use, useId, useState } from 'react';

const TabsContext = createContext<{
  selected: string;
  select: (value: string) => void;
  baseId: string;
} | null>(null);

function useTabs() {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>');
  return ctx;
}

export function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [selected, select] = useState(defaultValue);
  const baseId = useId();
  return <TabsContext value={{ selected, select, baseId }}>{children}</TabsContext>;
}

Tabs.Trigger = function Trigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { selected, select, baseId } = useTabs();
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected === value}
      aria-controls={`${baseId}-panel-${value}`}
      onClick={() => select(value)}
    >
      {children}
    </button>
  );
};
// Tabs.List (role="tablist") and Tabs.Panel (role="tabpanel") follow the same idea.
```

A trigger reads the shared state wherever it sits in the tree: inside a tooltip, a layout `div`, or a component the team wrote. In React 19 you render the context directly as a provider (`<TabsContext value={…}>`) and read it with `use`. The ARIA roles come from the WAI-ARIA tabs pattern, which you'll meet properly in the next lesson; keyboard handling is left out here to keep the example short.

:::mistake Wiring compound components by inspecting children
An older technique has the parent loop over `children` with `React.Children.map` and inject props into each trigger. It works in the demo and breaks the first time a team wraps a trigger in a tooltip, because the parent now sees the tooltip, not the trigger. Use context; it doesn't care how deep or how wrapped the pieces are.
:::

## Composition has costs too

Composition isn't free. Consumers write more markup, and they can arrange pieces in ways you didn't intend, such as two footers or a title in the body. Northwind handles this three ways. Each piece is constrained: `Card.Footer` lays out actions and nothing else looks right in it. Common arrangements ship as documented recipes that teams copy. And a few very common combinations become small configured wrappers built *from* the composed pieces, such as a `ShipmentSummaryCard` with four props, so the 80% case stays short while the 20% case stays possible.

## Migrating away from a configured component

You rarely get to start fresh. ShipmentCard was used on 60 screens when we redesigned it. We didn't delete it; we rebuilt it *on top of* the new pieces, so its 23 props now render `Card.Header`, `Card.Body` and `Card.Footer` internally. Every existing screen kept working and picked up the new styling for free. Then we marked ShipmentCard deprecated, documented the composed equivalent of each common prop combination, and migrated screens team by team. Building the old API from the new pieces is what made the migration boring, which is the highest compliment a migration can get.

## When configuration is right

Not every component should be compound. A status Badge has a `tone` and a label; an Avatar has an image, a name and a size. Their variations are few and closed, so props describe them completely and composition would only add ceremony.

A practical rule from Northwind's API reviews: when props start describing **layout** (`imagePosition`, `footerAlign`) or **content structure** (`menuItems`, `footerText`), the component wants slots or pieces. When props describe **appearance or state** (`tone`, `size`, `disabled`), configuration is fine.

:::tip Ask what the next ten requests will be
In API review, don't just evaluate today's request. Ask the requesting team what similar cards look like elsewhere in their product. If you can picture ten more props coming, design the slot now.
:::

In the exercise, you judge a Dialog API proposal with these rules. Next, you make sure every one of these pieces works with a keyboard and a screen reader, by default.
