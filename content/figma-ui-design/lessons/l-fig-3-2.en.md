---
summary: Combine related components into a variant set with clear property names, then add boolean, text and instance swap properties so Steady's button and habit row stay small and easy to use.
takeaways:
  - Variants group versions of a component in one component set, described by properties such as Type and State.
  - Use variants for differences that restyle several layers at once, such as states, types and sizes.
  - Use a boolean property for show or hide, a text property for editable labels and an instance swap property for choosing a nested component.
  - Every variant property multiplies the variant count, while boolean, text and instance swap properties do not.
  - Slots, at the time of writing, mark areas of a component where instances can hold free content without detaching.
further:
  - title: Create and use variants
    url: https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants
  - title: Explore component properties
    url: https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties
  - title: The difference between slots, instance swaps, and variants
    url: https://help.figma.com/hc/en-us/articles/38741465279895-The-difference-between-slots-instance-swaps-and-variants
quiz:
  - q: "Steady's button has Type (Primary, Secondary, Ghost), State (Default, Pressed, Disabled) and Size (Medium, Small) as variant properties. A teammate wants \"with icon\" and \"without icon\" as another variant property. How many variants would that create, and what is the alternative?"
    options:
      - text: 36 variants. A boolean property for the icon keeps it at 18.
        why: Correct. 3 × 3 × 2 = 18, and a two-value variant doubles it. A boolean toggles the icon layer without new variants.
      - text: 20 variants. There is no alternative.
        why: Variant properties multiply, they do not add. And booleans exist precisely for show or hide.
      - text: 18 variants. Figma merges duplicate layouts automatically.
        why: Figma never merges variants. Each combination is a separate variant you have to maintain.
      - text: 36 variants. An instance swap property keeps it at 18.
        why: The count is right, but instance swap chooses which icon, not whether it shows. Visibility is a boolean's job.
    answer: 0
  - q: Which property type fits the habit name in the Habit row component?
    options:
      - text: A variant property with one value per habit.
        why: Habit names are unlimited user content. Variants are for a small fixed set of designed versions.
      - text: A boolean property.
        why: Booleans only show or hide a layer. They cannot hold text content.
      - text: A text property, so the name can be edited from the properties panel or on the canvas.
        why: Correct. A text property exposes the string so people can change it without digging into layers.
      - text: An instance swap property.
        why: Instance swap chooses a nested component. A name is plain text, not a component.
    answer: 2
  - q: When should a difference be a variant rather than a boolean?
    options:
      - text: When it is used on more than three screens.
        why: Usage count does not decide the property type. Use the nature of the change.
      - text: When the difference restyles several layers together, like a Pressed state changing fill, label color and shadow.
        why: Correct. Booleans only toggle one layer's visibility. Coordinated visual changes need a designed variant.
      - text: When the developer asks for an enum.
        why: Developer input is valuable, but the design reason is how many layers change and how.
      - text: Always, because variants are newer than booleans.
        why: Variants are not newer, and defaulting to them causes variant explosion.
    answer: 1
  - q: The New habit sheet component must hold different content in different flows (a form, a confirmation, an icon grid). What fits best at the time of writing?
    options:
      - text: One variant per possible content.
        why: Every new flow would need a new variant, and the set would grow without end.
      - text: Detach the sheet for each use.
        why: Detached sheets miss every future fix to the sheet's header, handle and padding.
      - text: A boolean for every element that might appear.
        why: Booleans can only hide layers that already exist, so the sheet would carry every possible element.
      - text: A slot for the sheet's body, so each instance can hold its own content while the sheet chrome stays linked.
        why: Correct. Slots exist for exactly this, a flexible content area inside a linked component.
    answer: 3
---

Steady's primary button looks simple until you list what it needs: a primary, secondary and ghost type; default, pressed and disabled states; medium and small sizes; an optional icon; and any label. Build each of those as a separate component and you have dozens of near-copies, and a designer choosing between `Button Primary Small Disabled With Icon` and its neighbours.

Variants and component properties turn that pile into one component with a few clear switches.

## Variants: one set, many versions

A **component set** holds related components called **variants**. Each variant is described by **variant properties**, written as `Property=Value` pairs. For Steady's button:

- `Type`: Primary, Secondary, Ghost
- `State`: Default, Pressed, Disabled
- `Size`: Medium, Small

You create variants either by selecting several existing components and clicking **Combine as variants**, or by selecting a component and adding a variant from the right sidebar, then renaming the properties and values. Figma treats the variant at the top-left of the set as the default.

On an instance, people no longer hunt through assets. They place one Button and pick values from dropdowns: Type Secondary, State Disabled. The names you choose here are the names developers will see in Dev Mode, so make them match code where you can. If the code says `variant="secondary"`, consider calling your property `Variant` rather than `Type`, and agree on it with engineering early.

:::figure Steady's button component set: every Type and State combination for one size
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">A three-by-three grid of button variants. Columns are the states Default, Pressed and Disabled; rows are the types Primary, Secondary and Ghost. A dashed border surrounds the whole set.</title>
  <rect class="d-box d-dashed" x="110" y="30" width="560" height="220" rx="12"/>
  <text class="d-label-muted" x="210" y="22" text-anchor="middle">Default</text>
  <text class="d-label-muted" x="390" y="22" text-anchor="middle">Pressed</text>
  <text class="d-label-muted" x="570" y="22" text-anchor="middle">Disabled</text>
  <text class="d-label-muted" x="100" y="80" text-anchor="end">Primary</text>
  <text class="d-label-muted" x="100" y="150" text-anchor="end">Secondary</text>
  <text class="d-label-muted" x="100" y="220" text-anchor="end">Ghost</text>
  <rect class="d-box-primary" x="140" y="56" width="140" height="40" rx="10"/>
  <text class="d-label-strong" x="210" y="81" text-anchor="middle">Save habit</text>
  <rect class="d-box-primary" x="320" y="56" width="140" height="40" rx="10"/>
  <text class="d-label-strong" x="390" y="81" text-anchor="middle">Save habit</text>
  <rect class="d-box" x="500" y="56" width="140" height="40" rx="10"/>
  <text class="d-label-muted" x="570" y="81" text-anchor="middle">Save habit</text>
  <rect class="d-box-accent" x="140" y="126" width="140" height="40" rx="10"/>
  <text class="d-label" x="210" y="151" text-anchor="middle">Save habit</text>
  <rect class="d-box-accent" x="320" y="126" width="140" height="40" rx="10"/>
  <text class="d-label" x="390" y="151" text-anchor="middle">Save habit</text>
  <rect class="d-box" x="500" y="126" width="140" height="40" rx="10"/>
  <text class="d-label-muted" x="570" y="151" text-anchor="middle">Save habit</text>
  <text class="d-label" x="210" y="221" text-anchor="middle">Save habit</text>
  <rect class="d-box" x="320" y="196" width="140" height="40" rx="10"/>
  <text class="d-label" x="390" y="221" text-anchor="middle">Save habit</text>
  <text class="d-label-muted" x="570" y="221" text-anchor="middle">Save habit</text>
</svg>
:::

## Component properties: switches without multiplication

Variant properties multiply. Three types × three states × two sizes is 18 variants. Add a two-value `Icon` variant property and it becomes 36, every one of which has to be built and kept in sync. This is called variant explosion, and it is the most common way design systems become unmaintainable.

Component properties handle the differences that do not need a separately designed version:

- **Boolean**: shows or hides a layer. `Show icon` true or false. One layer, no new variants.
- **Text**: exposes a text layer's content. `Label` = "Save habit". People edit it from the properties panel without hunting for the layer.
- **Instance swap**: chooses which component fills a nested instance. `Icon` = Plus, Check or Bell. You can set **preferred values**, a short list of sensible icons, so nobody puts a trash can on the Save button.
- **Slot**: at the time of writing, a newer property type that marks an area where instances can hold their own content, such as the body of a bottom sheet, while everything around it stays linked.

You add these on the main component: select the layer, then use the property option next to its visibility (boolean), its text content (text) or its nested instance (instance swap) in the right sidebar, or create one from the properties section and connect it to a layer.

:::tip The deciding question
Ask: *does this difference restyle several layers together?* A pressed button changes fill, label color and maybe a shadow at once, so State is a variant. Showing an icon changes one layer's visibility, so it is a boolean. Which icon is an instance swap. What the label says is text.
:::

## Build order matters

Add text, boolean and instance swap properties to the first component **before** you add more variants. New variants created from it inherit those property connections. If you build 18 variants first, you will connect the label layer 18 times.

The Habit row gets the same treatment:

```text
Habit row (component set)
  State      variant        To do | Done | Missed
  Name       text           "Read 20 pages"
  Show streak boolean       true
  Icon       instance swap  Habit icon/Book  (preferred: Book, Water, Run, Sleep)
```

Three variants instead of dozens, because Done and Missed restyle several layers (check fill, name color, a strikethrough) while everything else is a property.

When a component nests other components, people would normally have to dig into layers to reach the inner ones' properties. At the time of writing, a component author can **expose nested instances**, so the Check button's own properties appear alongside the Habit row's in the panel.

:::mistake Naming values by appearance
`State=Teal` and `State=Grey` make sense today and lie tomorrow when the brand color changes. Name values by meaning, `Done` and `To do`, so the names survive a redesign and match what the code calls them.
:::

Your kit now has a handful of flexible components. Their colors and numbers, though, are still typed in by hand. Next you move those values into styles and variables.
