---
summary: Read and write design tokens in the DTCG 2025.10 JSON format, with types, groups, aliases and deprecation, so one token file can feed Figma, CSS and native apps.
takeaways:
  - The DTCG format stores tokens as JSON objects with a `$value`, and a `$type` set on the token or inherited from its group.
  - Aliases use curly braces with dot-separated paths, such as `{color.blue.600}`, and must point at a token, not a group.
  - Since 2025.10 a color value is an object with `colorSpace` and `components`, with an optional `hex` fallback.
  - Version 2025.10 is the first stable release of a W3C Community Group report, not a W3C Recommendation, and tool support still varies.
further:
  - title: Design Tokens specification reaches first stable version (W3C Community Group)
    url: https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
  - title: Design Tokens Community Group repository
    url: https://github.com/design-tokens/community-group
  - title: Modes for variables, including importing and exporting tokens (Figma)
    url: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables
quiz:
  - q: |
      What does `{color.action}` resolve to in this file?
      ```json
      {
        "color": {
          "$type": "color",
          "action": {
            "bg": { "$value": "{color.blue.600}" },
            "text": { "$value": "{color.white}" }
          }
        }
      }
      ```
    options:
      - text: The value of `color.action.bg`, because it is the first token in the group.
        why: The format has no "first token" rule; a reference must name one token exactly.
      - text: An object containing both `bg` and `text`.
        why: Curly-brace references only resolve to a single token's `$value`, never to a whole group.
      - text: The string "color".
        why: The group's `$type` is inherited by its tokens; it isn't a value a reference can return.
      - text: Nothing valid; `color.action` is a group, so the reference is an error.
        why: Correct. References must target a token, an object with a `$value`.
    answer: 3
  - q: A token has no `$type`, and neither does any group above it. Its value is `"#1f5ae0"`. What must a conforming tool do?
    options:
      - text: Infer that it is a color from the `#` prefix.
        why: The format forbids guessing types from values, because the same string can mean different things to different tools.
      - text: Treat the token as invalid.
        why: Correct. Every token needs an explicit type, either on itself, inherited from a group, or from the token it aliases.
      - text: Treat it as a string token.
        why: String is not a type in the format; tools can't fall back to it silently.
    answer: 1
  - q: A teammate says, "DTCG is a W3C standard now, so every tool reads every feature." What's the accurate correction?
    options:
      - text: It is a stable Community Group report, not a W3C Recommendation, and tools implement it at different speeds.
        why: Correct. Stability means the format won't change under you; it doesn't guarantee every tool supports every type or the resolver yet.
      - text: It is still an early draft that no tool supports.
        why: The 2025.10 release is stable, and Style Dictionary, Tokens Studio, Terrazzo and Figma's variable import and export support it.
      - text: It is a W3C Recommendation, but only for color tokens.
        why: It isn't a Recommendation at all, and it covers many types beyond color.
      - text: It replaces CSS custom properties in browsers.
        why: The format is an interchange file for tools; browsers still consume CSS that a pipeline generates from it.
    answer: 0
---

CSS custom properties are a great way to *consume* tokens on the web, but they are a poor place to *store* them. The iOS app can't read your stylesheet, Figma can't import it, and a script that checks contrast across themes has to parse CSS to find the values. Northwind's tokens live in JSON files instead, in the format defined by the Design Tokens Community Group (DTCG), and every platform's code is generated from them.

## Where the format stands in 2026

The DTCG is a W3C Community Group with members from design tool makers and large design system teams. On 28 October 2025 it published the first stable version of its specification, **2025.10**, made of three modules: Format, Color, and a Resolver module for combining sets and themes.

Be precise when you describe it to others. It is a stable Community Group report, not a W3C Recommendation; Community Groups don't produce formal web standards. In practice it is the format tools converge on: Style Dictionary, Tokens Studio and Terrazzo implement it, and Figma imports and exports variables as DTCG JSON. Support for the newer parts, such as the object color format and the Resolver module, still varies between tools, so check what your pipeline actually reads before adopting a feature.

## Anatomy of a token file

```json title=tokens/primitives.tokens.json
{
  "color": {
    "$type": "color",
    "blue": {
      "600": {
        "$value": { "colorSpace": "srgb", "components": [0.122, 0.353, 0.878], "hex": "#1f5ae0" },
        "$description": "Northwind brand blue. Passes 4.5:1 on white."
      }
    },
    "white": {
      "$value": { "colorSpace": "srgb", "components": [1, 1, 1], "hex": "#ffffff" }
    }
  },
  "space": {
    "$type": "dimension",
    "4": { "$value": { "value": 1, "unit": "rem" } }
  }
}
```

Read it from the outside in:

- **Groups** are plain nested objects (`color`, `blue`, `space`). They organize tokens and form the path used in references.
- A **token** is any object with a `$value`. Here, `color.blue.600` and `space.4` are tokens.
- **`$type`** declares what kind of value the token holds. Set on a group, it is inherited by every token inside, which is why `color` declares it once.
- **`$description`** is free text that tools show in pickers and documentation.

Properties starting with `$` are reserved for the format, so token and group names can't start with `$`. Names also can't contain `{`, `}` or `.`, because those characters belong to the reference syntax.

## Types and value shapes

Each type has a fixed value shape. The ones you will use daily:

| `$type` | Example `$value` |
|---|---|
| `color` | `{ "colorSpace": "srgb", "components": [1, 1, 1], "hex": "#ffffff" }` |
| `dimension` | `{ "value": 16, "unit": "px" }` (unit is `px` or `rem`) |
| `duration` | `{ "value": 150, "unit": "ms" }` (unit is `ms` or `s`) |
| `fontWeight` | `600` or `"semi-bold"` |
| `number` | `1.5` |

There are also `fontFamily` and `cubicBezier`, plus composite types that bundle several values: `typography`, `shadow`, `border`, `transition`, `gradient` and `strokeStyle`.

The color object is new in 2025.10. Earlier drafts, and many token files in the wild, store a plain hex string. The object form can describe colors outside sRGB, such as `display-p3` or `oklch`, which is why it replaced the string. Keep the optional `hex` for tools that only understand sRGB.

:::mistake Letting a tool guess the type
A token with no `$type` anywhere up its tree is invalid, even if its value looks obviously like a color. The format deliberately forbids inference, because `"16"` could be a number, a font size or a z-index. Put `$type` on your top-level groups and you rarely have to think about it again.
:::

## Aliases

The semantic tier from earlier lessons lives in the same format, as references:

```json title=tokens/semantic.tokens.json
{
  "color": {
    "$type": "color",
    "action": {
      "bg": { "$value": "{color.blue.600}" },
      "text": { "$value": "{color.white}" },
      "bg-hover": { "$value": "{color.blue.700}" },
      "bg-dark": {
        "$value": "{color.blue.700}",
        "$deprecated": "Use color.action.bg-hover instead. Removed in 5.0."
      }
    }
  }
}
```

A curly-brace reference names a token by its path with dots and resolves to that token's whole `$value`. It must point at a token, never at a group. References can chain (semantic → primitive), and a tool must reject circular ones. For the rare case where you need one part of a value, such as a single color component, the format also supports JSON Pointer references with `$ref`.

Here is the core of what every token tool does with aliases:

```js run
const tokens = {
  color: {
    $type: 'color',
    blue: { 600: { $value: { colorSpace: 'srgb', components: [0.122, 0.353, 0.878], hex: '#1f5ae0' } } },
    action: {
      bg: { $value: '{color.blue.600}' },
      'bg-subtle': { $value: '{color.action.bg}' },
    },
  },
};

function lookup(path) {
  const node = path.split('.').reduce((n, key) => n?.[key], tokens);
  if (!node || !('$value' in node)) throw new Error(`{${path}} is not a token`);
  return node;
}

function resolve(path, seen = []) {
  if (seen.includes(path)) throw new Error(`circular reference: ${[...seen, path].join(' -> ')}`);
  const { $value } = lookup(path);
  const ref = typeof $value === 'string' && $value.match(/^\{(.+)\}$/);
  return ref ? resolve(ref[1], [...seen, path]) : $value;
}

console.log(resolve('color.action.bg-subtle').hex);
try { resolve('color.action'); } catch (e) { console.log(e.message); }
```

## Two more features worth knowing

`$deprecated`, shown above on `bg-dark` (a name that describes a look, which the naming lesson warned against), marks a token as on its way out. Its value is `true` or a string explaining what to use instead, and tools can warn when someone picks it. You'll build a deprecation process around it in Section 4.

Groups can also inherit from other groups with `$extends`, overriding only what differs. That is handy for a Tidewater group that reuses most of Northwind's structure. For full light, dark and brand combinations, the Resolver module defines how separate token sets and modifiers combine, but it is the newest part of the specification, so Northwind still assembles themes in its build pipeline. The recommended file extensions are `.tokens` and `.tokens.json`; Northwind uses the second so editors highlight the files as JSON.

In the exercise below, you review a token file the way a pipeline would and find the lines it rejects. Next, you build that pipeline.
