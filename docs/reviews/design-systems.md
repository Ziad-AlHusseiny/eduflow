# Review: design-systems (Design Systems That Scale)

## Verdict

This is a strong course. The writing is concrete and has a clear point of view. The Northwind/Tidewater thread carries all 19 lessons, and the technical core is accurate as of October 2026. That core covers three-tier tokens, how `var()` resolves inside custom properties, subtree theming, the DTCG 2025.10 format, Style Dictionary, Figma variables and extended collections, semver with Changesets, Storybook, Playwright and GitHub Actions. Every web/dom exercise checks behaviour (computed styles, attributes, logged results), not variable names, so any correct solution passes.

The problems were small. A few facts were wrong or out of date: the boolean combination count, the scope of `light-dark()`, and a jscodeshift command that would silently skip `.tsx` files. One `$deprecated` example was confusing. The Arabic is natural and fluent overall, but it had some inconsistent terms (فرقة/فريق, adoption/التبنّي) and a few ambiguous or mistranslated phrases. The worst of these was a final-assessment question whose Arabic said something different from the English. All of these are fixed. Validator and exercise checker are both clean.

## What was verified against sources

- **DTCG 2025.10** (spec text from the Format module): 
  - A token with no `$type` is invalid, and tools must not infer a type from the value.
  - Names cannot start with `$` or contain `{`, `}` or `.`.
  - `$ref` (JSON Pointer) references, group `$extends`, and `$deprecated` (true or a string) all exist.
  - Recommended file extensions are `.tokens` and `.tokens.json`.
  - `dimension` units are `px`/`rem`; `duration` units are `ms`/`s`. `fontWeight` accepts aliases such as `semi-bold`.
  - The color object is `colorSpace` / `components` / `alpha` / `hex`.
  - The release was published 28 Oct 2025 as a Community Group report, not a W3C Recommendation.
- **Style Dictionary v5:** the CHANGELOG confirms that 5.3.0 added DTCG 2025.10 object colors to the built-in color transforms, and 5.4.0 added object dimensions. The CHANGELOG also confirms the filtered-out-reference warning with `outputReferences`. The `include`/`source`/`isSource`/`css/variables`/`selector` config is correct.
- **Figma:**
  - Native variable export and import in DTCG JSON exists, per the Modes for variables help article. Figma exports per mode and imports via Import mode.
  - Extended collections are Enterprise-only. They inherit un-overridden values, and they can't add variables or modes.
- **GitHub Actions:**
  - `actions/checkout@v7` and `actions/setup-node@v7` are the current majors (July 2026).
  - `changesets/action` is at v2.1.2, and its input really is `publish-script`.
- **Contrast figures:** recomputed as teal-600 3.74:1, teal-700 5.47:1, blue-600 5.84:1.
- **Further-reading links:** all 46 return HTTP 200.

## Issues found and fixed

| File | Category | Severity | What was wrong | What changed |
|---|---|---|---|---|
| lessons/l-ds-3-1.en.md, .ar.md | accuracy | medium | "Nine booleans allow 512 combinations": two of the nine props aren't booleans (`onPress` is a function, `icon` is content). | Now says the seven booleans allow 128 combinations. |
| lessons/l-ds-4-3.en.md, .ar.md | accuracy | medium | `npx jscodeshift -t codemods/button-kind.js src/` uses jscodeshift's defaults (`--extensions=js`, Babel parser), so it would skip every `.tsx` file in Northwind's TypeScript codebase. | Added `--parser=tsx --extensions=tsx,ts` and a one-line explanation. |
| lessons/l-ds-2-3.en.md, .ar.md | accuracy | low | Said `light-dark()` "only covers color values". It now also accepts images (MDN). | Now says it switches colors (and, in newer browsers, images) between exactly two schemes. |
| assessments.en.yaml, .ar.yaml (final, light-dark question) | accuracy | low | A `why` called `light-dark()` "a color function". | Now says it picks between two colors or images by color scheme. |
| lessons/l-ds-2-5.en.md, .ar.md (quiz 1) | consistency | low | The quiz used `var(--nw-blue-600)`, but the lesson explains that the generated name is `--nw-color-blue-600`. | Changed to `var(--nw-color-blue-600)`. |
| lessons/l-ds-2-5.en.md, .ar.md | accuracy | low | The "Check your tool's DTCG version" note gave no concrete version. The dark-theme config triggers a Style Dictionary warning that is never explained. | Added the versions (5.3 for colors, 5.4 for dimensions) and one sentence explaining that the filtered-reference warning is expected here. |
| lessons/l-ds-2-4.en.md, .ar.md | pedagogy | low | The `$deprecated` example deprecated `bg-hover` in favour of `bg-active`, a different interaction state. That is confusing. | `bg-hover` is now a normal token. A look-named `bg-dark` is deprecated in favour of `bg-hover`, and the text points back to the naming lesson. |
| lessons/l-ds-2-4.ar.md | arabic | low | "(semantic ← primitive)" is plain Latin text, so it renders as an LTR run and the arrow points the wrong way. | Rewritten as "(من semantic إلى primitive)". |
| course.ar.json; lessons 1-1, 3-1, 3-3, 4-2, 5-3 (.ar) | arabic | medium | Teams were rendered as both "فرقة" (troupe or band) and "فريق". Verb agreement was also off with counted nouns ("تعتمد عليه أربعون فرقة"). | Standardized on فريق with correct number and verb agreement ("يعتمد عليه أربعون فريقًا", "أحد عشر فريقًا"). |
| course.ar.json; lessons 1-1, 2-2, 5-3; assessments.ar.yaml; exercises/l-ds-5-3.ar.json | arabic | low | "adoption" was rendered as both "الـ adoption" and "التبنّي". | Standardized on التبنّي, with "(adoption)" glossed on first use. |
| lessons/l-ds-4-1.ar.md, l-ds-4-4.ar.md; exercises/l-ds-4-1.ar.json; assessments.ar.yaml | arabic | medium | "JSON المُصدَر" / "القيم المُصدَرة" (released) reads like "exported" (مُصدَّر) in a lesson where both exported and released JSON appear, so the sync step became ambiguous. | Changed to "ملف JSON الخاص بالإصدار", "القيم المعتمدة في آخر إصدار" and "الـ tokens التي صدرت في الإصدار". |
| assessments.ar.yaml (final, include/source question) | arabic | medium | The Arabic said "the dark theme and the primitives are built in `include`", which means something different from the English. | Rewritten: the dark theme is built with the primitives in `include` and the dark semantic file in `source`. |
| lessons/l-ds-4-3.ar.md; assessments.ar.yaml | arabic | low | Spread props were called "props منشورة" (published props). | Changed to "props تُمرَّر بالـ spread". |
| lessons/l-ds-3-1.ar.md | arabic | low | Hashed class names were called "class مشفّر" (encrypted). | Changed to "اسم class مولَّد بالـ hash لا يُقرأ". The 128-combinations sentence was also smoothed. |
| lessons/l-ds-3-2.ar.md | arabic | low | Typo in an imperative: "ولجأ إلى". | Changed to "والجأ إلى". |
| assessments.ar.yaml | arabic | low | "قصّتان" for two stories, "الأهمية لا تساعد" as a literal rendering of `!important`, and a calque ("هي بالضبط كيف انتهى منتجان…"). | Changed to "اثنتان من الـ stories" and "لا يفيد `!important` هنا", and rewrote the calque. |
| exercises/l-ds-2-3.ar.json | arabic | low | Hybrid dual "modeين". | Changed to "اثنين من الـ modes" and "كلا الـ modes". |
| lessons/l-ds-1-2.ar.md | arabic | low | "يوفّر التوحيد أكبر وقت" and "أصعب ما يكون على الرفض" were awkward. | Changed to "أكبر قدر من الوقت" and "تجعل رفض التدقيق أصعب ما يمكن". |
| lessons/l-ds-1-3.ar.md | arabic | low | "استوديو ألعاب قد يقول بمنطق…" was awkward. | Changed to "فاستوديو ألعاب قد يتبنّى، عن حقّ، مبدأ…". |

Totals: 19 issues. By category: 5 accuracy, 1 pedagogy, 1 consistency, 12 arabic. By severity: 5 medium, 14 low, 0 high.

## Checked and left as is

- **Exercise checks:** 1-2, 2-1, 2-3, 3-1, 3-3, 5-2 and 5-3 test computed styles, ARIA attributes and return values, so any correct solution passes. The 2-4 and 4-4 spot-bug line numbers, and the 2-5 and 4-2 fill answers, match their code.
- **Quiz answers:** every quiz, checkpoint and final answer is correct, and EN/AR answer indices match.
- **Workflow:** the 4-4 release workflow (`id-token: write` for npm trusted publishing, Node 24, `changesets/action@v2` with `publish-script`) is current.
- **Storybook:** Storybook isn't pinned to a version number in the text. "Recent Storybook versions… `@storybook/addon-vitest`" is correct for Storybook 9 and 10, and `@storybook/react-vite` type imports are the current recommendation.

## Not verified or not fixed

- I didn't fetch Figma's "code syntax" help page. The claim (Dev Mode shows the code syntax you enter, such as `var(--nw-color-action-bg)`) matches how the feature works but wasn't checked against the page.
- The three GitHub-hosted further-reading links (Style Dictionary, the DTCG repo, the Storybook docs `.mdx`) are outside the content guide's allowed-domain list. The validator accepts them, and they are the official sources, so they stay.
