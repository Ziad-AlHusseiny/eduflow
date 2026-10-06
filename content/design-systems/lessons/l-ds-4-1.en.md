---
summary: Mirror your token tiers in Figma variable collections and modes, publish them through libraries, and run one sync process so design files and code never disagree about a value.
takeaways:
  - Map token tiers to Figma variable collections, and map themes, brands and density to modes or extended collections.
  - Pick one source of truth for token values and make the other side a mirror that is updated by a defined process, never by hand.
  - Give semantic variables code syntax and hide primitives from publishing, so designers pick the same names engineers type.
  - Library updates are releases too; designers accept them in their files the way engineers bump a package version.
further:
  - title: Guide to variables in Figma
    url: https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma
  - title: Modes for variables (Figma)
    url: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables
  - title: Extend a variable collection (Figma)
    url: https://help.figma.com/hc/en-us/articles/36346281624471-Extend-a-variable-collection
  - title: Guide to libraries in Figma
    url: https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-libraries-in-Figma
quiz:
  - q: Northwind's designers can pick any primitive like `blue/600` from the library, and mockups keep using primitives where semantic tokens belong. What's the best fix?
    options:
      - text: Delete the primitives collection from Figma.
        why: Semantic variables alias the primitives, so the primitives must exist in the file.
      - text: Ask designers in a meeting to stop using primitives.
        why: Reminders fade; the library should make the right choice the easy one.
      - text: Rename primitives with a "do not use" prefix.
        why: It clutters every name and still leaves them in the picker.
      - text: Hide the primitive variables from publishing, so only semantic variables appear in consuming files.
        why: Correct. Primitives stay available for aliasing inside the library, while designers only see the names they should use.
    answer: 3
  - q: A designer changed `color/action/bg` in Figma last week, and an engineer changed the same token in the JSON yesterday, to a different value. What process failure does this show?
    options:
      - text: Two sources of truth that both accept direct edits.
        why: Correct. With one source and a mirror, one of these edits would have been a proposal against the source instead of a competing change.
      - text: Figma variables don't support colors from code.
        why: Figma variables hold colors fine; the problem is who is allowed to change them, and where.
      - text: The engineer should have waited for the next design review.
        why: Timing doesn't fix the problem; without one source, any two edits can conflict.
    answer: 0
  - q: How should Northwind represent its two brands in Figma on an Enterprise plan?
    options:
      - text: Duplicate the whole library for Tidewater and maintain both by hand.
        why: Duplicated libraries drift apart, which is the problem the system exists to solve.
      - text: Put brand colors directly on each component as overrides.
        why: Overrides on components bypass variables, so themes and code mapping stop working.
      - text: Extend the semantic collection for Tidewater and override only the brand variables.
        why: Correct. An extended collection inherits everything it doesn't override, so shared changes still reach both brands.
      - text: Store brand colors as text styles.
        why: Text styles describe typography, not colors, and don't map to modes or tokens.
    answer: 2
---

For eight months after we launched tokens, Northwind had two truths. The JSON in the repository said the action blue was `#1f5ae0`; the Figma library said `#2160e8`, because a designer had nudged it for a campaign mockup and published. Engineers built from the inspect panel, so the marketing site shipped one blue and the app another. Tokens solve consistency only if design files and code read from the same decisions.

## Mapping tiers to Figma variables

Figma variables hold reusable values such as colors and numbers, grouped into **collections**. A collection can have several **modes**, each giving every variable in the collection a different value. A variable can also alias another variable. That's enough to mirror the token architecture almost one to one:

| Token concept | Figma |
|---|---|
| Primitive tier | Collection "Primitives", one mode |
| Semantic tier | Collection "Semantic", modes Light and Dark |
| Density | Collection "Density", modes Comfortable and Compact |
| Brand | An extended collection per brand (Enterprise), or a Brand collection with modes |
| Alias `{color.blue.600}` | Variable aliasing `blue/600` |

Variable names use slashes to form groups, so `color/action/bg` appears as a group path in the picker and corresponds to the token `color.action.bg`. Figma frames pick modes the way the CSS attribute selectors do: a frame can set a mode explicitly, and anything inside it on Auto inherits that mode, so a dark hero frame on a light page works just like `data-theme="dark"` on a section.

For brands, Figma's **extended collections**, available on the Enterprise plan, let you create a Tidewater collection that inherits from the Northwind semantic collection and overrides only the brand variables. Updates to variables that Tidewater didn't override flow through automatically. On other plans, a separate Brand collection with one mode per brand gets you most of the way.

## Make the right variable the easy one

Two settings matter more than any naming scheme. First, **hide primitives from publishing**. The semantic collection can still alias them, but designers in product files only see semantic variables, which is exactly the rule components follow in code. Second, give every published variable **code syntax**: Dev Mode then shows `var(--nw-color-action-bg)` instead of a hex value, so what the designer picked is literally what the engineer types. Scoping helps too: restrict color variables to the properties they're meant for, so a text color doesn't appear in the fill picker.

:::mistake Two sources of truth
If both the Figma library and the JSON accept direct edits, they will diverge; it's only a matter of when. Choose one source of truth for values and make the other a mirror that changes only through the sync process. Northwind chose the JSON in the repository, because versioning, review, the contrast checks and releases already lived there. Teams that are design-led sometimes choose Figma as the source; either works if the other side is never edited by hand.
:::

## The sync loop

:::figure One source of truth, with Figma as a synced mirror
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">A loop: a designer proposes a change in a Figma branch, exports JSON into a pull request, CI checks and builds, the release is published, and the released JSON is imported back into the Figma library.</title>
  <rect class="d-box-accent" x="20" y="30" width="150" height="56" rx="10"/>
  <text class="d-label" x="95" y="55" text-anchor="middle">Figma branch</text>
  <text class="d-label-muted" x="95" y="74" text-anchor="middle">proposal</text>
  <rect class="d-box-primary" x="265" y="30" width="150" height="56" rx="10"/>
  <text class="d-label" x="340" y="55" text-anchor="middle">Pull request</text>
  <text class="d-label-muted" x="340" y="74" text-anchor="middle">tokens JSON</text>
  <rect class="d-box" x="510" y="30" width="150" height="56" rx="10"/>
  <text class="d-label" x="585" y="55" text-anchor="middle">CI checks</text>
  <text class="d-label-muted" x="585" y="74" text-anchor="middle">build outputs</text>
  <rect class="d-box-success" x="510" y="150" width="150" height="56" rx="10"/>
  <text class="d-label" x="585" y="183" text-anchor="middle">Release</text>
  <rect class="d-box-accent" x="20" y="150" width="150" height="56" rx="10"/>
  <text class="d-label" x="95" y="175" text-anchor="middle">Figma library</text>
  <text class="d-label-muted" x="95" y="194" text-anchor="middle">import, publish</text>
  <path class="d-arrow" d="M170 58 L261 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M415 58 L506 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M585 86 L585 146" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M510 178 L174 178" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="340" y="168" text-anchor="middle">released JSON</text>
</svg>
:::

Designers still design in Figma; they just don't publish token values directly. A change starts in a **branch** of the library file (branching is available on Figma's Organization and Enterprise plans), where the designer can try it in real mockups. When it's ready, the changed modes are exported as JSON: Figma can export and import a collection's modes in the DTCG format. The export becomes a pull request against the tokens repository, where CI runs the checks from Section 2 and a core designer and engineer review it. After release, the released JSON is imported into the main library file and the library update is published.

Some teams automate the last step with a plugin or Figma's REST API. Northwind does it by hand once per release; it takes ten minutes, and a human glancing at the variables panel has caught two bad imports.

:::tip Library updates are releases
When you publish a library, people working in files that use it get a notification and choose when to accept the updates. Treat that like a package bump: publish alongside the code release, and paste the same changelog into the publish description so designers see what changed and why.
:::

The same loop works for components, with Code Connect linking Figma components to their code in Dev Mode. In the exercise, you put the steps of a token change in order. Next, you version those releases so teams know what an update will do to them.
