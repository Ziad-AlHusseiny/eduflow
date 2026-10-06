---
summary: Add Tailwind CSS v4 to the Vite project with its official plugin, style the Watchlist with utility classes and state variants, and customise the theme in CSS.
takeaways:
  - Tailwind v4 needs `npm install tailwindcss @tailwindcss/vite`, the plugin in vite.config.js, and `@import "tailwindcss";` in your CSS; no config file is required.
  - Utility classes map to single CSS declarations on a shared scale, such as `p-4` for 1rem of padding and `text-slate-600` for a palette color.
  - Prefixes apply a class conditionally, for example `md:` above a breakpoint, `hover:` on hover, `dark:` in dark mode and `aria-pressed:` when that attribute is true.
  - Tailwind finds classes by scanning your files as text, so always write complete class names and never build them with string interpolation.
  - Customise colors, fonts and other tokens with CSS variables in an `@theme` block.
further:
  - title: Installing Tailwind CSS with Vite
    url: https://tailwindcss.com/docs/installation/using-vite
  - title: Styling with utility classes
    url: https://tailwindcss.com/docs/styling-with-utility-classes
  - title: Detecting classes in source files
    url: https://tailwindcss.com/docs/detecting-classes-in-source-files
  - title: Theme variables
    url: https://tailwindcss.com/docs/theme
quiz:
  - q: You installed both packages and added `@import "tailwindcss";` to `src/index.css`, but no utility classes have any effect. What's the most likely missing step?
    options:
      - text: Creating a `tailwind.config.js` file.
        why: Tailwind v4 works without a config file; it detects your source files automatically.
      - text: Adding a PostCSS config file.
        why: With Vite, the `@tailwindcss/vite` plugin replaces the PostCSS setup. You don't need both.
      - text: Restarting your computer.
        why: Restarting the dev server can help after config changes, but the computer isn't the issue.
      - text: Adding `tailwindcss()` from `@tailwindcss/vite` to the `plugins` array in vite.config.js.
        why: Correct. Without the plugin, Vite treats the import as plain CSS and never generates the utilities.
    answer: 3
  - q: "A component builds a class as `` `text-${color}-600` `` where `color` is 'red' or 'green'. In production the text has no color. Why?"
    options:
      - text: Tailwind scans files as plain text, sees no complete `text-red-600` or `text-green-600`, and never generates them.
        why: "Correct. Map values to complete class names instead, for example `{ red: 'text-red-600', green: 'text-green-600' }[color]`."
      - text: Template literals aren't allowed in `className`.
        why: Any string works in className. The problem is that Tailwind can't see the final class name when it builds the CSS.
      - text: The 600 shade doesn't exist for red and green.
        why: Every default palette color has shades from 50 to 950, including 600.
      - text: Production builds strip all Tailwind classes that come from props.
        why: Tailwind doesn't know about props. It only keeps classes that appear in full somewhere in your source files.
    answer: 0
  - q: "What does `className=\"bg-white md:bg-slate-100 dark:bg-slate-900\"` do?"
    options:
      - text: Applies all three backgrounds at once, and the last one wins.
        why: The prefixed classes only apply under their conditions; they don't simply stack.
      - text: White on small screens, slate-100 from the md breakpoint up, slate-900 in dark mode.
        why: Correct. Breakpoint prefixes are mobile-first (min-width), and `dark:` follows the user's color scheme preference by default.
      - text: It's invalid; you can only use one background class per element.
        why: You can combine as many classes as you need; variants exist precisely so that one element can have different styles in different conditions.
    answer: 1
  - q: Your filter buttons set `aria-pressed`. What's the cleanest way to style the active one with Tailwind?
    options:
      - text: "Compute the class in JavaScript with `` `bg-${active ? 'indigo' : 'white'}-600` ``."
        why: That builds a class name dynamically, which Tailwind can't detect. It's also not needed here.
      - text: "Use `style={{ background: … }}` because Tailwind can't react to state."
        why: Tailwind has variants for exactly this. Inline styles also lose hover, focus and dark-mode handling.
      - text: Use the `aria-pressed:` variant, for example `aria-pressed:bg-indigo-600 aria-pressed:text-white`.
        why: Correct. The styling follows the accessibility attribute you already set, so the visual state and what screen readers announce can't disagree.
    answer: 2
---

The Watchlist works, and it looks like 1998. You could write a stylesheet, and plenty of excellent apps do. This course uses **Tailwind CSS**, because it's extremely common in React codebases you'll join, and because styling right in your JSX keeps components self-contained: a `MovieItem` file holds its markup, its behaviour and its look.

Tailwind is a large set of small utility classes, each doing one thing: `p-4` adds padding, `rounded-lg` rounds corners, `text-slate-600` sets a color. You compose them in `className`. Tailwind scans your files, finds the classes you used, and generates a stylesheet containing only those.

## Install it

Tailwind v4 has an official Vite plugin, and setup is three steps. Install the packages:

```bash
npm install tailwindcss @tailwindcss/vite
```

Add the plugin to your Vite config:

```js title=vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

And import Tailwind at the top of your main stylesheet, which `main.jsx` already imports:

```css title=src/index.css
@import "tailwindcss";
```

That's all. There's no `tailwind.config.js` and no PostCSS config in v4 by default. Tailwind finds your source files on its own. Vite restarts the dev server by itself when you save `vite.config.js`; if the styles still don't appear, stop it and run `npm run dev` again.

:::note Older tutorials
If you see `@tailwind base; @tailwind components; @tailwind utilities;` or a `content: [...]` array in a config file, that's Tailwind v3. The ideas carry over, but the setup above is the current one.
:::

## Reading utility classes

Here's the Watchlist shell:

```jsx title=src/App.jsx
<main className="mx-auto max-w-xl px-4 py-10">
  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Watchlist</h1>
  <p className="mt-1 text-sm text-slate-500">{left} to watch</p>
  {/* …form, filters, list */}
</main>
```

The names are terse but systematic, and after a day you'll read them as fast as CSS:

- **Spacing** uses a scale where each step is 0.25rem: `p-4` is 1rem of padding, `mt-1` is 0.25rem of top margin, `px-4` is horizontal padding. `mx-auto` centres a block.
- **Sizes and type**: `max-w-xl` caps the width, `text-3xl` sets the font size, `font-bold` the weight.
- **Colors** come from a palette with shades 50 to 950: `text-slate-500`, `bg-indigo-600`.

Your editor can help: the official Tailwind CSS IntelliSense extension for VS Code autocompletes class names and shows the CSS each one produces on hover.

## Variants: conditions in a prefix

Prefix a class to apply it only under a condition:

```jsx title=src/components/MovieItem.jsx
<li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
  <span className={movie.watched ? 'flex-1 text-slate-400 line-through' : 'flex-1 text-slate-900 dark:text-slate-100'}>
    {movie.title}
  </span>
  <button
    aria-pressed={movie.watched}
    onClick={() => onToggle(movie.id)}
    className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 aria-pressed:border-indigo-600 aria-pressed:bg-indigo-600 aria-pressed:text-white"
  >
    {movie.watched ? 'Watched' : 'Mark watched'}
  </button>
</li>
```

- `hover:` and `focus-visible:` handle interaction states. Always give interactive elements a visible focus style for keyboard users.
- `dark:` applies when the user's system is in dark mode (it follows `prefers-color-scheme` by default).
- `aria-pressed:` applies when the element's `aria-pressed` is true. The toggle's look follows the same attribute screen readers announce, so the two can't disagree.
- Breakpoints are mobile-first: `sm:`, `md:` and `lg:` apply from that width **up**, so write the phone layout first and add prefixes for larger screens.

Conditions that depend on React state, like `movie.watched` on the span, are a plain ternary choosing between two complete class strings.

:::mistake Building class names from pieces
`` className={`text-${color}-600`} `` looks clever and fails in production. Tailwind reads your files as text and only generates classes it finds written out in full; `text-red-600` never appears, so it's never generated. Map values to complete classes instead: `const tone = { ok: 'text-green-600', error: 'text-red-600' }[status];`.
:::

## Your own design tokens

Customise the theme in CSS with `@theme`. Each variable becomes utilities automatically:

```css title=src/index.css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.62 0.19 285);
  --color-brand-600: oklch(0.55 0.21 285);
  --font-display: "Inter", system-ui, sans-serif;
}
```

Now `bg-brand-600`, `text-brand-500` and `font-display` work like built-in classes. Define a handful of tokens for your brand color and fonts rather than scattering one-off values like `bg-[#6d28d9]` through your components.

## The trade-off

Long class lists are the honest cost. A styled button can carry fifteen classes. The answer isn't to hide them in CSS with `@apply`; it's what you've practised all course: extract a component. A `Button` component holds those fifteen classes in one place, and everywhere else you write `<Button>`. Components are your unit of reuse in React, for styles as much as for behaviour.

Tailwind isn't the only good answer. CSS Modules (built into Vite: name a file `MovieItem.module.css` and import it) give you scoped class names with ordinary CSS, and many teams prefer them. The skills transfer either way: semantic markup, a consistent spacing and color scale, visible focus states and a layout that works on a phone first.

:::tip Use the defaults first
Tailwind's spacing scale and palette are carefully designed. Sticking to them gives you a consistent look for free. Reach for custom values only when a design really requires them.
:::

The Watchlist looks like a real product now. One thing left: getting it onto the internet, which is the next lesson.
