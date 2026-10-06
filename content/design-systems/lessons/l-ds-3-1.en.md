---
summary: Design component APIs with enum variants instead of boolean flags, consistent prop vocabulary, native attributes passed through, and slots for content, using Northwind's Button as the example.
takeaways:
  - Use one enum prop such as `variant` for mutually exclusive options; separate booleans allow combinations that make no sense.
  - Keep prop names and values identical across components, so `size="sm"` means the same thing on a Button, an Input and a Select.
  - Pass native attributes and `ref` through to the underlying element, so the component never blocks what HTML already does.
  - Defaults are design decisions; choose the safe, common option, such as `type="button"` and a secondary variant.
further:
  - title: "<button>: The Button element (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button
  - title: forwardRef, and ref as a prop in React 19 (React docs)
    url: https://react.dev/reference/react/forwardRef
  - title: Using data attributes (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes
quiz:
  - q: "Northwind's old Button accepts `primary`, `danger` and `outline` booleans. A team writes `<Button primary danger>`. What's the underlying API problem?"
    options:
      - text: The booleans should be named `isPrimary` and `isDanger`.
        why: Renaming doesn't stop the impossible combination; the issue is the shape of the API, not the names.
      - text: Booleans can't be passed without values in JSX.
        why: Bare boolean attributes are valid JSX and mean `true`.
      - text: Mutually exclusive options are modeled as independent flags, so invalid combinations are expressible.
        why: Correct. A single `variant` enum makes `primary` and `danger` impossible to combine.
      - text: The component should throw an error when both are set.
        why: A runtime error is better than silence, but the API should make the mistake impossible to write in the first place.
    answer: 2
  - q: A Button inside a `<form>` keeps submitting the form when people click "Add stop". The Button renders `<button>` with no `type`. What's the best fix in the design system?
    options:
      - text: Document that teams must always pass `type="button"`.
        why: Documentation helps, but a default that causes bugs will keep causing them for anyone who skims.
      - text: Remove the form element from the product.
        why: The form is legitimate; the component's default is what's wrong.
      - text: Stop the submit event inside the Button's click handler.
        why: That breaks the cases where teams do want a submit button.
      - text: Default `type` to `"button"` and let teams pass `type="submit"` when they mean it.
        why: Correct. The native default is `submit`, which surprises people; the system can choose the safer default.
    answer: 3
  - q: Which prop design is most consistent across a system's components?
    options:
      - text: "Button uses `size=\"sm\"`, Input uses `small`, Select uses `compact`."
        why: Three spellings for one idea force every team to check the docs every time.
      - text: "Button, Input and Select all use `size` with the values `sm`, `md`, `lg`."
        why: Correct. One vocabulary means learning it once and guessing right on the next component.
      - text: Each component chooses whatever reads best in its own context.
        why: Local readability across forty teams turns into global confusion.
    answer: 1
---

Northwind's 2021 Button had nine props: `primary`, `secondary`, `danger`, `small`, `large`, `outline`, `block`, `icon` and `onPress`. The seven booleans alone allow 128 combinations, and teams found most of them. The production app contained `<Button primary danger small large>`. It rendered something, and nobody could say what it was meant to be. A component's API is a contract with every team that uses it, and like any contract, the hard part is what it allows.

## Enums for choices, booleans for states

The first rule is about the shape of props. If options are **mutually exclusive**, they belong in one enum prop. If something is **on or off**, it's a boolean.

```tsx title=Button.tsx
type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};
```

With `variant` as an enum, `primary` and `danger` can't both be true; the type system rejects it before code review. `loading` stays a boolean because a button is either loading or not, independently of its variant.

## One vocabulary across the system

The second rule is consistency across components. If Button uses `size="sm"`, so does Input, Select, Tabs and Badge, with the same three values. If one component calls its change handler `onChange` with the new value, they all do. Northwind keeps a one-page API glossary of shared prop names, and new components reuse those names unless there is a strong reason not to.

This matters more than any single prop decision. An engineer who has used three Northwind components should be able to guess the fourth's API correctly. Every inconsistency is a small tax paid by everyone, every day.

## Don't block the platform

The third rule: the component must never take away what HTML already gives. A Button is a `<button>`, so it should accept everything a `<button>` accepts, `aria-*` attributes included, and pass it through:

```tsx title=Button.tsx
export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  startIcon,
  endIcon,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={['nw-button', rest.className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
    >
      {startIcon}
      <span className="nw-button__label">{children}</span>
      {endIcon}
    </button>
  );
}
```

Because `ref` is a regular prop for function components in React 19, it travels through `...rest` with everything else, so focus management and tooltips work without extra wrapping. `onClick`, `disabled`, `form` and `aria-describedby` work for the same reason.

:::mistake Inheriting the native default for type
A native `<button>` inside a form defaults to `type="submit"`. Northwind lost a week to dispatch forms submitting when people clicked "Add stop". The system's Button now defaults to `type="button"`, and teams pass `type="submit"` when they mean it. Defaults are design decisions: pick the one that is safe when people don't read the docs.
:::

## Slots for content

A **slot** is a place where the consumer passes content instead of configuration. `children` is the main slot; `startIcon` and `endIcon` are named slots. Compare two ways to add an icon:

```tsx
<Button icon="truck" iconPosition="left">Assign</Button>        // configuration
<Button startIcon={<TruckIcon />}>Assign</Button>               // slot
```

The configuration version needs the Button to know every icon name and every position, and it grows a prop each time someone wants something new. The slot version accepts any element, so teams can pass a different icon set or a small avatar without a new release. The next lesson takes this idea much further.

## Variants in CSS: map props to attributes

The Button writes its props into `data-variant` and `data-size` attributes, so the CSS mirrors the API one to one. Each variant changes only component tokens:

```css
.nw-button[data-variant="primary"] {
  --nw-button-bg: var(--nw-color-action-bg);
  --nw-button-text: var(--nw-color-action-text);
  --nw-button-border: transparent;
}
```

Data attributes keep the styling hooks readable in DevTools, where you see `data-variant="primary"` instead of a hashed class name, and they can't be combined into nonsense the way classes like `.primary.danger` can.

:::tip Choose the default variant deliberately
Northwind's default is `secondary`. Making `primary` an explicit choice nudges teams toward one primary action per view, which is a pattern our principles ask for anyway. A default isn't neutral; it's the variant you'll see most often in production.
:::

## Review the API before you build it

Northwind writes the usage code before the component code. Every new component proposal starts with three snippets: the most common usage, the most complicated usage anyone has asked for, and one usage that *should* be impossible. The review then asks four questions. Do the prop names match the API glossary? Can any combination of props describe something meaningless? Does the component pass through everything its native element supports? And what will the second and third teams to use it need that the first team didn't?

That review takes about thirty minutes. Changing an API after twenty teams depend on it takes a major release, a migration guide and months of follow-up, which is what Section 4 is about.

In the exercise, you write the variant and size rules for this Button using only component tokens. Next, you see what happens when a component outgrows props entirely.
