---
summary: Decide when a value belongs in a style or a variable, set up Steady's primitive and semantic color variables with aliases, and bind components to meanings instead of raw hex codes.
takeaways:
  - A style bundles several properties into one reusable composite, such as a text style's font, size, weight and line height.
  - A variable holds one raw value (color, number, string or boolean), can alias another variable, and can change per mode.
  - Use two tiers of variables, primitives for the raw palette and semantic tokens for meanings, and bind components only to the semantic tier.
  - Text styles, effect styles and multi-fill or gradient color styles still have no single-variable equivalent, so most teams use both systems.
  - Scoping and hiding primitives from publishing keep the variable picker short and stop people from reaching for raw values.
further:
  - title: Overview of variables, collections, and modes
    url: https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes
  - title: Guide to styles in Figma
    url: https://help.figma.com/hc/en-us/articles/360039238753-Guide-to-styles-in-Figma
  - title: Create and manage variables and collections
    url: https://help.figma.com/hc/en-us/articles/15145852043927-Create-and-manage-variables-and-collections
quiz:
  - q: "The Done state of the habit row uses the check color `teal/700` directly from the primitives collection. Next sprint you add dark mode. What goes wrong?"
    options:
      - text: Nothing, because primitives automatically switch in dark mode.
        why: Primitives are fixed raw values. Switching is the job of semantic variables that have a value per mode.
      - text: Figma refuses to publish components bound to primitives.
        why: Figma allows it. The problem is that you lose the layer of meaning that modes switch on.
      - text: The row keeps the dark teal in dark mode, because nothing says this color means "action" and should change.
        why: Correct. Binding to `color/action/primary` instead lets dark mode point that meaning at a lighter teal.
      - text: The habit row loses its variants.
        why: Variable bindings do not affect variants or other component properties.
    answer: 2
  - q: Which of these belongs in a style rather than a single variable?
    options:
      - text: The Headline text treatment, 17 px semibold with a 24 px line height.
        why: Correct. It is a composite of several properties. A text style bundles them, and each part can still be bound to a variable.
      - text: The 16 px card padding.
        why: Padding is a single number, which is exactly what a number variable is for.
      - text: The primary action color.
        why: A single color that should change per mode is a classic color variable.
      - text: Whether the onboarding hint is visible.
        why: A true or false value fits a boolean variable.
    answer: 0
  - q: "What is the main benefit of aliasing `color/text/secondary` to `gray/500` instead of typing #6B7280 into it?"
    options:
      - text: Aliases make the file smaller.
        why: File size barely changes. The value is about maintenance and meaning.
      - text: Developers cannot read raw hex values in Dev Mode.
        why: Dev Mode shows hex values fine. The benefit is the chain of meaning.
      - text: Aliased variables cannot be edited by accident.
        why: Aliases can still be repointed. They are not a lock.
      - text: Changing the palette's gray once updates every meaning that points at it, and each mode can point somewhere different.
        why: Correct. Aliases separate what a color is from what it is for, so palette changes and modes stay one edit each.
    answer: 3
  - q: A designer types 15 into a gap field even though a `space` variable picker is available. What setup change best discourages this?
    options:
      - text: Delete the gap field from the file settings.
        why: You cannot remove core properties. The goal is to make the right value the easy one.
      - text: Scope the spacing variables to gap and padding so they appear first there, and review off-system values with a design check before handoff.
        why: Correct. Scoping keeps the picker relevant, and a review catches hard-coded values that slipped in.
      - text: Rename every spacing variable to its pixel value.
        why: Names like `16` hide meaning and do not stop anyone typing 15.
      - text: Convert all spacing into text styles.
        why: Text styles hold typography, not layout spacing.
    answer: 1
---

Search Steady's file for the hex code #0F766E and you will find it on check buttons, the primary button, a focus ring, a link and a progress ring, typed in by hand each time. When the brand team asks for a slightly bluer teal, you face the same hunt as in Lesson 3.1, this time for a color. Worse, when dark mode arrives, some of those places need a lighter teal and some do not, and the hex code cannot tell you which.

Styles and variables both put values in one place. They solve slightly different problems.

## Styles: reusable composites

A **style** is a named bundle of visual properties. At the time of writing, Figma has color styles, text styles, effect styles and layout guide styles. You already planned text styles in Lesson 1.3: `Headline` is a font family, a size, a weight, a line height and letter spacing, all applied in one click.

Styles shine when the value is a **composite**. A text style is several properties at once. An effect style can hold a stack of two shadows. A color style can hold a gradient or several layered fills. Change the style and every layer using it updates.

## Variables: single values with superpowers

A **variable** holds one raw value. The core types are **color**, **number**, **string** and **boolean** (Figma has added further types for motion work since). You can bind variables to fills and strokes, corner radius, gap, padding, width and height, opacity, layer visibility, text content and many typography properties.

Three things make variables different from styles:

- **Aliasing**: a variable can point at another variable of the same type, instead of holding a raw value.
- **Modes**: a variable can hold a different value per mode, such as light and dark (next lesson).
- **Tokens**: variables map closely to the design tokens developers use in code, and at the time of writing you can record each variable's code name for web, iOS and Android so Dev Mode shows it.

Variables live in **collections**, and slashes in names create groups: `color/text/primary` sits in the group `color/text`.

## Two tiers: primitives and semantics

The pattern most design systems use, and the one Steady uses, has two tiers.

**Primitives** are the raw palette, named by what they are: `teal/700` = #0F766E, `gray/500` = #6B7280, `white` = #FFFFFF. They have no opinion about where they are used.

**Semantic** variables are named by what they are for, and alias a primitive: `color/action/primary` → `teal/700`, `color/text/secondary` → `gray/500`, `color/surface/default` → `white`. Components bind **only** to semantic variables.

:::figure Components point at meanings, meanings point at the palette
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">Three columns. Primitives teal 700, gray 500 and white feed semantic variables action primary, text secondary and surface default, which are bound to the check button fill, the streak text and the row background.</title>
  <text class="d-label-strong" x="110" y="26" text-anchor="middle">Primitives</text>
  <text class="d-label-strong" x="340" y="26" text-anchor="middle">Semantic</text>
  <text class="d-label-strong" x="570" y="26" text-anchor="middle">Component use</text>
  <rect class="d-box" x="30" y="44" width="160" height="40" rx="8"/>
  <text class="d-code" x="110" y="69" text-anchor="middle">teal/700</text>
  <rect class="d-box" x="30" y="114" width="160" height="40" rx="8"/>
  <text class="d-code" x="110" y="139" text-anchor="middle">gray/500</text>
  <rect class="d-box" x="30" y="184" width="160" height="40" rx="8"/>
  <text class="d-code" x="110" y="209" text-anchor="middle">white</text>
  <rect class="d-box-primary" x="240" y="44" width="200" height="40" rx="8"/>
  <text class="d-code" x="340" y="69" text-anchor="middle">action/primary</text>
  <rect class="d-box-primary" x="240" y="114" width="200" height="40" rx="8"/>
  <text class="d-code" x="340" y="139" text-anchor="middle">text/secondary</text>
  <rect class="d-box-primary" x="240" y="184" width="200" height="40" rx="8"/>
  <text class="d-code" x="340" y="209" text-anchor="middle">surface/default</text>
  <rect class="d-box-accent" x="490" y="44" width="160" height="40" rx="8"/>
  <text class="d-label" x="570" y="69" text-anchor="middle">Check fill</text>
  <rect class="d-box-accent" x="490" y="114" width="160" height="40" rx="8"/>
  <text class="d-label" x="570" y="139" text-anchor="middle">Streak text</text>
  <rect class="d-box-accent" x="490" y="184" width="160" height="40" rx="8"/>
  <text class="d-label" x="570" y="209" text-anchor="middle">Row background</text>
  <path class="d-arrow" d="M238 64 L192 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M238 134 L192 134" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M238 204 L192 204" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M488 64 L442 64" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M488 134 L442 134" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M488 204 L442 204" marker-end="url(#arrow)"/>
</svg>
:::

Why bother with the middle column? Because meaning and value change for different reasons. The brand team changes `teal/700`, and every action color follows. Dark mode changes what `color/action/primary` points at, and only action colors follow, not every teal in the file. Neither change requires touching a single component.

Steady's numbers get the same treatment: a `space` group (`space/1` = 4 through `space/12` = 48, from Lesson 2.3) and a `radius` group (`radius/sm` = 8, `radius/md` = 12). Bind the habit row's padding to `space/3` and `space/4`, and its corner radius to `radius/md`.

:::mistake Semantic names that describe appearance
`color/teal-button` is a primitive wearing a semantic costume. The day the button turns blue, the name lies, and in dark mode it may not even be teal. Name semantic variables by role, such as `action/primary`, `text/secondary` or `border/default`, and let the value be whatever that role needs.
:::

## Keeping the picker clean

Two settings keep people on the system. **Scoping** limits where a variable is offered: scope `space` variables to gap and padding, and they stop appearing in the corner radius picker. **Hiding from publishing** keeps primitives out of the library that other files see, so designers using the kit only find semantic tokens. Both live in each variable's edit panel at the time of writing.

## Use both

Variables did not replace styles. The usual split is: variables for single values (colors, spacing, radius, booleans) because they alias and switch modes; text styles for typography, with their sizes bound to number variables if you need them to change per mode; effect styles for shadows; color styles only for gradients or layered fills. Bind a color style's fill to a variable and you get the composite's convenience with the variable's modes.

:::tip Start semantic tokens small
Steady needs about a dozen semantic colors: text primary and secondary, surface default and raised, border default, action primary and its pressed state, on-action (text on teal), success, danger and focus. Add a token when a real component needs a meaning that does not exist yet, not before.
:::

With every component pointing at meanings, dark mode becomes a question of what each meaning points at, which is exactly what modes answer next.
