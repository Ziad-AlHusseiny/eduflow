---
summary: Set up a token build pipeline that turns DTCG JSON into CSS custom properties per theme and native formats per platform, keeping references intact so runtime theming still works.
takeaways:
  - A token pipeline parses source files, resolves aliases, transforms names and values per platform, and writes one output format per platform.
  - Keep references in CSS output (`outputReferences`) so semantic tokens still point at primitives at runtime and subtree theming keeps working.
  - Build each theme from shared primitives plus that theme's semantic file, and emit only the theme's own tokens under its selector.
  - Generated files are build output; nobody edits them by hand, and CI rebuilds them on every change.
further:
  - title: Style Dictionary (official repository and docs)
    url: https://github.com/style-dictionary/style-dictionary
  - title: Design Tokens Community Group repository
    url: https://github.com/design-tokens/community-group
  - title: Using CSS custom properties (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
quiz:
  - q: "The pipeline writes `--nw-color-action-bg: #1f5ae0;` instead of `--nw-color-action-bg: var(--nw-color-blue-600);`. What breaks?"
    options:
      - text: Nothing; the color is identical.
        why: The color is identical today, but overriding the primitive at runtime no longer flows through, and the tiers are no longer visible in the output.
      - text: The CSS becomes invalid because hex values aren't allowed in custom properties.
        why: Custom properties accept any valid token stream, including hex colors.
      - text: Browsers can't cache the stylesheet.
        why: Caching doesn't depend on what's inside custom properties.
      - text: Runtime overrides of primitives stop reaching semantic tokens, and debugging which primitive a token uses gets harder.
        why: Correct. With references preserved, the output keeps the tier structure; with resolved values, every link is flattened.
    answer: 3
  - q: Why does the dark theme build use `include` for primitives and `source` for the dark semantic file, then filter on `isSource`?
    options:
      - text: Primitives are needed to resolve references, but only the dark semantic tokens should be written under the dark selector.
        why: Correct. Emitting primitives again under `[data-theme="dark"]` would duplicate hundreds of lines without changing anything.
      - text: Files in `include` are loaded faster.
        why: Speed isn't the point; the difference is whether tokens count as source tokens for filtering.
      - text: Style Dictionary can't read two files in `source`.
        why: The `source` array accepts many files and globs.
    answer: 0
  - q: A product engineer edits `dist/css/theme-dark.css` directly to fix a contrast bug, and the fix vanishes after the next release. What should the process have been?
    options:
      - text: Commit the generated CSS so the edit is kept.
        why: Committing it doesn't stop the next build from overwriting it; the source is still wrong.
      - text: Fix the token in the source JSON, let CI rebuild, and mark generated files with a "do not edit" header.
        why: Correct. The JSON is the source of truth; generated files should say so at the top.
      - text: Add the fix to the product's own stylesheet instead.
        why: That hides the bug for one product and leaves every other consumer of the system with it.
      - text: Turn off the build step for CSS.
        why: Then CSS and the other platforms drift apart, which is what the pipeline exists to prevent.
    answer: 1
---

With tokens stored as DTCG JSON, something has to turn them into what each platform consumes: CSS custom properties for the web app and marketing site, Swift for the iOS driver app, Kotlin or XML for Android. That something is a token pipeline. It's a small piece of code that every design system team ends up owning, and getting it right early saves months of drift later.

## What a pipeline does

:::figure A token pipeline: one source, one output per platform
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">Token JSON files flow through parse, resolve, transform and format steps, producing CSS for web, Swift for iOS and Kotlin for Android.</title>
  <rect class="d-box-primary" x="10" y="85" width="110" height="56" rx="10"/>
  <text class="d-label" x="65" y="110" text-anchor="middle">*.tokens</text>
  <text class="d-label" x="65" y="128" text-anchor="middle">.json</text>
  <rect class="d-box" x="150" y="85" width="80" height="56" rx="10"/>
  <text class="d-label" x="190" y="118" text-anchor="middle">Parse</text>
  <rect class="d-box" x="250" y="85" width="90" height="56" rx="10"/>
  <text class="d-label" x="295" y="118" text-anchor="middle">Resolve</text>
  <rect class="d-box" x="360" y="85" width="100" height="56" rx="10"/>
  <text class="d-label" x="410" y="118" text-anchor="middle">Transform</text>
  <rect class="d-box" x="480" y="85" width="80" height="56" rx="10"/>
  <text class="d-label" x="520" y="118" text-anchor="middle">Format</text>
  <rect class="d-box-accent" x="590" y="20" width="80" height="44" rx="10"/>
  <text class="d-label" x="630" y="47" text-anchor="middle">CSS</text>
  <rect class="d-box-accent" x="590" y="91" width="80" height="44" rx="10"/>
  <text class="d-label" x="630" y="118" text-anchor="middle">Swift</text>
  <rect class="d-box-accent" x="590" y="162" width="80" height="44" rx="10"/>
  <text class="d-label" x="630" y="189" text-anchor="middle">Kotlin</text>
  <path class="d-arrow" d="M120 113 L146 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M230 113 L246 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 113 L356 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M460 113 L476 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 105 L586 45" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 113 L586 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 121 L586 183" marker-end="url(#arrow)"/>
</svg>
:::

1. **Parse** every source file and deep-merge them into one tree.
2. **Resolve** aliases like `{color.blue.600}`, rejecting broken or circular references.
3. **Transform** names and values for each platform: `color.action.bg` becomes `--nw-color-action-bg` in CSS and `colorActionBg` in Swift; `1rem` becomes `16` points on iOS.
4. **Format** the result as a file: a block of custom properties, a Swift enum, an Android resource file.

Here's the heart of the CSS side, small enough to read in one go:

```js run
const tokens = {
  color: {
    $type: 'color',
    blue: { 600: { $value: { colorSpace: 'srgb', components: [0.122, 0.353, 0.878], hex: '#1f5ae0' } } },
    white: { $value: { colorSpace: 'srgb', components: [1, 1, 1], hex: '#ffffff' } },
    action: {
      bg: { $value: '{color.blue.600}' },
      text: { $value: '{color.white}' },
    },
  },
  space: { $type: 'dimension', 4: { $value: { value: 1, unit: 'rem' } } },
};

// Walk the tree and collect every token with its path.
function flatten(node, path = [], type) {
  const t = node.$type ?? type;
  if ('$value' in node) return [{ path, type: t, value: node.$value }];
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => flatten(child, [...path, key], t));
}

const cssName = (path) => `--nw-${path.join('-')}`;
function cssValue({ type, value }) {
  if (typeof value === 'string' && value.startsWith('{')) {
    return `var(${cssName(value.slice(1, -1).split('.'))})`; // keep the reference
  }
  if (type === 'color') return value.hex;
  if (type === 'dimension') return `${value.value}${value.unit}`;
  return String(value);
}

const lines = flatten(tokens).map((t) => `  ${cssName(t.path)}: ${cssValue(t)};`);
console.log(`/* Generated from tokens. Do not edit. */\n:root {\n${lines.join('\n')}\n}`);
```

Look at the output. The path becomes the name, so `color.blue.600` comes out as `--nw-color-blue-600`; earlier lessons shortened primitives to `--nw-blue-600` for readability, but in a generated system the name is whatever the group structure says, which is one more reason to design groups and names together. More importantly, semantic tokens come out as `var(--nw-color-blue-600)`, not as a hex value. That choice is important enough to deserve its own section.

## Keep the references

A pipeline can either resolve aliases to final values or keep them as references in the output. For CSS, keep them. Resolved output flattens your tiers: the browser sees `--nw-color-action-bg: #1f5ae0`, so overriding a primitive at runtime does nothing, and a developer inspecting a button in DevTools can't see which primitive it comes from. Referenced output preserves the exact structure you designed, including the subtree theming from the themes lesson.

Native platforms are different. Swift and Kotlin constants are usually resolved to final values, because those platforms handle themes through their own mechanisms (asset catalogs, Compose color schemes).

## A real pipeline with Style Dictionary

You could grow the script above into a full tool, but most teams use Style Dictionary, the most widely used open-source token build system. Recent versions read DTCG files natively and auto-detect the format. A Northwind-style config builds the light theme into `:root` and the dark theme under its attribute selector:

```js title=build-tokens.mjs
import StyleDictionary from 'style-dictionary';

const themes = {
  light: ':root',
  dark: '[data-theme="dark"]',
};

for (const [name, selector] of Object.entries(themes)) {
  const sd = new StyleDictionary({
    include: ['tokens/primitives.tokens.json'],
    source: [`tokens/semantic-${name}.tokens.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: 'nw',
        buildPath: 'dist/css/',
        files: [{
          destination: `theme-${name}.css`,
          format: 'css/variables',
          filter: name === 'light' ? undefined : (token) => token.isSource,
          options: { selector, outputReferences: true },
        }],
      },
    },
  });
  await sd.buildAllPlatforms();
}
```

The key ideas: primitives come in through `include`, so references can resolve, while the theme's semantic file comes in through `source`. For dark, the `filter` keeps only source tokens, so the dark file contains the remapped semantic tokens and not a second copy of every primitive. `outputReferences: true` keeps `var()` references in the output. Style Dictionary may warn that the dark file references tokens it filtered out; here that is intended, because the light file already defines the primitives on `:root`.

:::mistake Editing generated files
Generated CSS looks like ordinary CSS, so sooner or later someone fixes a color directly in `dist/`. The next build wipes the fix. Put a "Generated, do not edit" header in every output file, keep `dist/` out of code review diffs, and route every change through the JSON.
:::

:::note Check your tool's DTCG version
The object color format arrived with DTCG 2025.10, and tools adopted it at different times: Style Dictionary's built-in transforms read object colors from 5.3 and object dimensions from 5.4. Before migrating Northwind's files to it, we ran the pipeline against a few sample tokens and compared the CSS output. Do the same; if your version still expects hex strings, keep the `hex` field populated or add a small custom transform.
:::

## Checks that run with the build

Once tokens are data, CI can test design decisions like code. Northwind's pipeline runs three checks on every pull request: the naming lint from earlier, a reference check that fails on broken or circular aliases, and a contrast check that resolves each documented text and background pair in every theme and fails below 4.5:1. That last one caught a dark-mode regression in the Tidewater brand before any designer saw it.

In the exercise, you complete the dark theme's build config. That finishes the token architecture; the next section builds components on top of it.
