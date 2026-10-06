---
summary: "Ship a light and dark theme with color-scheme and light-dark(), add a user override that beats the system setting, and force a section dark without duplicating tokens."
takeaways:
  - "`color-scheme: light dark` tells the browser the page supports both schemes, so form controls, scrollbars and default colors follow the user's setting."
  - "`light-dark(A, B)` returns A or B depending on the element's used color scheme, so each token is defined once instead of in two places."
  - "A three-way toggle (system, light, dark) only needs to set `color-scheme` on the root; every `light-dark()` value follows."
  - "Because `light-dark()` resolves per element, `color-scheme: dark` on one section makes that section dark while the rest of the page stays light."
further:
  - title: "light-dark() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark
  - title: "color-scheme (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme
  - title: "Improved dark mode default styling with color-scheme (web.dev)"
    url: https://web.dev/articles/color-scheme
quiz:
  - q: "You write `--surface: light-dark(white, #0f172a)` and use it on `body`, but the page stays white in dark mode. What's missing?"
    options:
      - text: "A `@media (prefers-color-scheme: dark)` block around the token."
        why: "That's the older technique; `light-dark()` exists so you don't need it. It reads the color scheme instead."
      - text: "`color-scheme: light dark` on the root (or the element)."
        why: "Correct. Without it, the used color scheme is light, so `light-dark()` always returns its first value."
      - text: "`@property` registration for `--surface`."
        why: "Unregistered custom properties work fine here; `light-dark()` is resolved where the token is used."
      - text: "Dark mode only works when the color is written in oklch()."
        why: "`light-dark()` accepts any color format."
    answer: 1
  - q: "The Waypoint hero should always look dark, even in light mode. Its colors come from `light-dark()` tokens. What's the smallest change?"
    options:
      - text: "Duplicate every token with a `--hero-` prefix holding the dark values."
        why: "It works, but it doubles the token set and drifts the moment someone edits one copy."
      - text: "Add `data-theme=\"dark\"` to the hero element."
        why: "That attribute only matters if your CSS reads it there; the toggle in this lesson reads it on the root."
      - text: "Add `color-scheme: dark` to `.hero`."
        why: "Correct. `light-dark()` resolves against each element's own used color scheme, which inherits, so the hero and its descendants pick the dark values."
    answer: 2
  - q: "What's the job of `<meta name=\"color-scheme\" content=\"light dark\">` in the HTML head?"
    options:
      - text: "It lets the browser pick the right scheme for the page background before the CSS has loaded, avoiding a white flash in dark mode."
        why: "Correct. The meta tag is read as soon as the HTML is parsed, so the initial canvas color is right from the first paint."
      - text: "It's required for `light-dark()` to work."
        why: "The CSS `color-scheme` property is enough for `light-dark()`; the meta tag helps first paint."
      - text: "It replaces the `prefers-color-scheme` media query in all stylesheets."
        why: "Media queries keep working; the meta tag only declares which schemes the page supports."
    answer: 0
---

Waypoint's dark mode was built the classic way: a full set of color tokens in `:root`, and a second full set inside `@media (prefers-color-scheme: dark)`. It worked until three things happened. Someone added a token to the light set and forgot the dark one. Users asked for a toggle, because their OS is dark but they want the schedule light on a projector. And the design team wanted the hero to be dark in *both* modes.

Each of these is a one-liner with `color-scheme` and `light-dark()`.

## color-scheme: tell the browser what you support

```css title=theme.css
:root {
  color-scheme: light dark;
}
```

This declaration says "this page supports both schemes; use the user's preference". The browser responds by rendering its own UI to match: form controls, checkboxes, scrollbars, the default page background and text color. Without it, a dark page still gets bright white `<select>` menus and scrollbars, which is the most common tell of a hand-made dark mode.

Add the matching meta tag so the browser knows before your CSS arrives, and the page doesn't flash white on load:

```html
<meta name="color-scheme" content="light dark">
```

## light-dark(): one token, two values

`light-dark()` takes two colors and returns the first when the element's used color scheme is light and the second when it's dark:

```css
:root {
  color-scheme: light dark;

  --surface: light-dark(#ffffff, #0f172a);
  --text:    light-dark(#1f2937, #e5e7eb);
  --card:    light-dark(#f8fafc, #1e293b);
  --border:  light-dark(oklch(90% 0.01 280), oklch(35% 0.02 280));
}

body {
  background: var(--surface);
  color: var(--text);
}
.session-card {
  background: var(--card);
  border: 1px solid var(--border);
}
```

Each token is now defined once, with both values side by side. Adding a token without its dark value becomes visibly incomplete in review. `light-dark()` for colors is Baseline 2024 and works in every current browser. Passing it two images (such as gradients or `url()`s) only became Baseline in September 2026, and it never accepts lengths or other values, so for those keep a `prefers-color-scheme` media query for now.

:::mistake Forgetting color-scheme
`light-dark()` doesn't read the operating system directly. It reads the element's *used color scheme*, which comes from the `color-scheme` property. If nothing sets `color-scheme: light dark` (or `dark`), the scheme is light, and every `light-dark()` returns its first argument, even on a dark OS.
:::

## A toggle that beats the system setting

Because everything reads the color scheme, the toggle only has to change one property on the root:

```css
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark; }
```

With no `data-theme`, the root keeps `light dark` and follows the OS. With `data-theme="dark"`, it's forced dark, and every token follows. The JavaScript for a three-way control is tiny:

```js title=theme-toggle.js
const select = document.querySelector('#theme');
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.dataset.theme = saved;

select.addEventListener('change', () => {
  const value = select.value; // 'system' | 'light' | 'dark'
  if (value === 'system') {
    delete document.documentElement.dataset.theme;
    localStorage.removeItem('theme');
  } else {
    document.documentElement.dataset.theme = value;
    localStorage.setItem('theme', value);
  }
});
```

Run the restore part in a small inline script in the `<head>` so the saved theme applies before the first paint.

:::figure The color scheme is resolved per element, then light-dark() picks a value
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">The root element has a color-scheme of light, dark, or both following the OS. Most elements inherit it. The hero sets color-scheme dark, so inside the hero every light-dark token returns its dark value, while the rest of the page returns light values.</title>
  <rect class="d-box-primary" x="20" y="20" width="260" height="60" rx="10"/>
  <text class="d-code" x="36" y="46">:root color-scheme</text>
  <text class="d-label-muted" x="36" y="68">system / light / dark</text>
  <path class="d-arrow" d="M150 80 L150 120" marker-end="url(#arrow)"/>
  <rect class="d-box" x="20" y="124" width="260" height="56" rx="10"/>
  <text class="d-label" x="36" y="148">.schedule inherits</text>
  <text class="d-code" x="36" y="170">light-dark(A, B) → A</text>
  <rect class="d-box-accent" x="360" y="20" width="300" height="60" rx="10"/>
  <text class="d-code" x="376" y="46">.hero</text>
  <text class="d-code" x="376" y="68">color-scheme: dark</text>
  <path class="d-arrow" d="M510 80 L510 120" marker-end="url(#arrow)"/>
  <rect class="d-box" x="360" y="124" width="300" height="56" rx="10"/>
  <text class="d-label" x="376" y="148">hero card inherits dark</text>
  <text class="d-code" x="376" y="170">light-dark(A, B) → B</text>
  <path class="d-line d-dashed" d="M280 50 L360 50"/>
  <text class="d-label-muted" x="20" y="222">Same tokens everywhere; each element resolves them with its own scheme.</text>
</svg>
:::

## Forcing a section dark

`color-scheme` is inherited, and `light-dark()` resolves against each element's own value. So the always-dark hero needs one declaration:

```css
.hero {
  color-scheme: dark;
  background: var(--surface);
  color: var(--text);
}
```

Inside the hero, `--surface`, `--text` and `--card` all resolve to their dark values, including the keynote session card nested inside it, while the rest of the page stays light. The same trick works the other way for a light "print preview" panel inside a dark app.

## Designing the dark palette

Dark mode isn't inverted light mode. A few rules that hold up on real projects:

- **Avoid pure black.** A very dark blue-grey such as `#0f172a` is easier on the eyes and leaves room for elevation.
- **Show elevation with lighter surfaces**, not shadows: a card sits on `#1e293b`, a popover on a step lighter. Shadows barely show on dark backgrounds.
- **Lower the chroma of accents.** The vivid track colors from the last lesson vibrate on a dark background. `oklch(from var(--track) 72% calc(c * 0.8) h)` raises lightness and tones down chroma for dark surfaces.
- **Recheck contrast in both schemes.** A pairing that passes in light mode guarantees nothing in dark.

You don't have to switch your operating system to test any of this. Chrome's DevTools can emulate `prefers-color-scheme: dark` from the Rendering panel, and Firefox has a toggle in its Inspector. Test the three toggle states and the hero in each, and check the form controls: they are the first place a missing `color-scheme` shows up.

## Your turn

The exercise uses the old pattern: tokens plus a `prefers-color-scheme` override, and no toggle. Rewrite the tokens with `light-dark()`, wire up `data-theme` on the root, and make the hero dark in both modes. The checks set `data-theme` and read the computed colors. Next, you'll make sure people who navigate with a keyboard can see where they are, in both themes.
