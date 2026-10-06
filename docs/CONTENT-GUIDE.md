# EduFlow — Content Guide

How every lesson, quiz, exercise, glossary entry and translation in EduFlow is written. It applies to all courses, whether a person or an agent wrote them. `npm run check:content` enforces the measurable rules below, and the build fails if they slip.

| | |
|---|---|
| **Applies to** | `content/<course-id>/**` |
| **Validator** | `node scripts/content/validate.mjs <course-id>` (run it after every few lessons) |
| **Exercise runner** | `node scripts/content/check-exercises.mjs <course-id>` (runs every solution and starter for real) |
| **Sample data** | `content/data/README.md` (the Cartwheel store: SQLite + CSVs) |

---

## 1. Who we write for

The reader is a **career switcher**: an adult learning in the evening after work, smart, motivated, short on time, easily derailed. A second reader is a **junior developer** filling gaps. They aren't stupid, and they aren't experts yet.

The writer is a **practitioner who teaches this for a living**: someone who has shipped the thing, made the mistakes, and knows which 20% of the topic does 80% of the work. They explain *why* before *how*, show real code that runs, name the trap before the learner falls in it, and stop when the point is made.

## 2. Voice

- **Direct and concrete.** "Keys tell React which item is which between renders" beats "Keys play an important role in React's reconciliation process."
- **Second person, active voice, present tense.** "You pass props down; you never mutate them."
- **Show, then name.** Start from a problem or a small example, then give the concept its name.
- **Specific over general.** Real numbers, real commands, real error messages, real file names.
- **One idea per paragraph.** Paragraphs of 2–5 sentences. No walls of text.
- **Honest about trade-offs.** Say when something is a convention, when it's contested, and when the "right" answer depends on the situation.
- **Opinionated where it helps.** "Start with `useState`; reach for `useReducer` when three or more pieces of state change together." Give a default.

### Banned (the validator flags these; rewrite the sentence)

"In today's fast-paced world", "In this lesson we will", "Let's dive in", "dive into", "deep dive", "delve", "embark", "journey" (as metaphor), "unlock the power", "harness the power", "game-changer", "seamless(ly)", "supercharge", "elevate your", "the realm of", "tapestry", "leverage" (as a verb; say *use*), "it's important to note that", "it's worth noting", "Whether you're a beginner or", "In conclusion", "Happy coding!", "simply" / "just" before a step that isn't simple, "lorem", "ipsum", "TODO", "TBD", "coming soon", "placeholder", "FIXME", "XXX".

Don't open a lesson by restating its title. Don't end with a pep talk. Don't use emoji in prose.

## 3. Technical accuracy (non-negotiable)

- **Current as of 2026**: React 19 (Actions, `use`, `useActionState`, `useOptimistic`, ref as a prop, React Compiler exists but is optional), Vite 7, TypeScript 5.x (`satisfies`, `const` type parameters, `NoInfer`, `using`), modern CSS (nesting, `:has()`, container queries, cascade layers, `@property`, subgrid, `oklch()`, view transitions), Python 3.13 with pandas 2.x (Copy-on-Write, `pd.NA`, nullable dtypes, `.loc` not chained indexing) and scikit-learn 1.x, Swift 6 / SwiftUI (`@Observable`, strict concurrency, `NavigationStack`), Docker (Compose v2: `docker compose`, no `version:` key), Kubernetes 1.3x (`kubectl`, Deployments, Services, Ingress/Gateway API, probes, HPA `autoscaling/v2`), AWS current service names (Amazon S3, Amazon EC2, AWS Lambda, Amazon DynamoDB, Amazon RDS, AWS IAM Identity Center, Amazon CloudWatch, Amazon VPC, AWS Fargate, Amazon ECS/EKS, Amazon Bedrock), Git 2.4x (`git switch`, `git restore`, default branch `main`), React Native with Expo (New Architecture is the default; Expo Router), Figma 2026 (auto layout, variables, modes, Dev Mode, components with properties).
- **Never invent an API, flag, option, method, or CLI command.** If you aren't sure something exists in the current version, check the official docs (context7 MCP or WebFetch on the official site) or leave it out.
- **Every code sample is correct and complete enough to run** in the stated context. Snippets that are deliberately partial say so ("// …rest of the component").
- **Runnable blocks really run** (see §6.3); the validator executes them.
- **Further-reading links go to official docs** and must be real pages. Allowed domains: developer.mozilla.org, react.dev, vite.dev, typescriptlang.org, docs.python.org, pandas.pydata.org, numpy.org, scikit-learn.org, sqlite.org, postgresql.org, help.figma.com, figma.com, developer.apple.com, swift.org, reactnative.dev, docs.expo.dev, docs.docker.com, kubernetes.io, docs.aws.amazon.com, aws.amazon.com, git-scm.com, docs.github.com, w3.org, web.dev, vitest.dev, playwright.dev, testing-library.com, tailwindcss.com, vercel.com, nodejs.org, tc39.es, css-tricks.com (sparingly), www.nngroup.com, m3.material.io, designsystem.digital.gov, webaim.org. Prefer a specific deep page over a home page.

## 4. Files and schema

Each course lives in `content/<course-id>/`. Sections, lessons and minutes must match `content/plan.json` exactly (the PRD §8 inventory; React Fundamentals' curriculum is fixed in `plan.json → canonical`).

```
content/<course-id>/
  course.json                 structure (language-neutral)
  course.en.json              English text for the course page
  course.ar.json              Arabic text (same keys)
  lessons/<lesson-id>.en.md   one file per lesson per language
  lessons/<lesson-id>.ar.md
  exercises/<lesson-id>.json      optional; language-neutral (code, answers, checks)
  exercises/<lesson-id>.en.json   exercise text
  exercises/<lesson-id>.ar.json
  assessments.en.yaml         section checkpoints + final assessment
  assessments.ar.yaml
  glossary.en.json            key terms (also the course's flashcard deck)
  glossary.ar.json
```

### 4.1 IDs

- Section: `s-<abbrev>-<n>` (`s-rf-2`). Lesson: `l-<abbrev>-<section>-<lesson>` (`l-rf-2-3`), 1-based. `abbrev` comes from `plan.json`.
- Glossary term ids, exercise check ids and item ids: lowercase kebab-case, stable across languages.

### 4.2 `course.json`

```json
{
  "id": "react-fundamentals",
  "project": "A Watchlist app for movies you want to see, built lesson by lesson.",
  "sections": [
    { "id": "s-rf-1", "lessons": [ { "id": "l-rf-1-1", "minutes": 9 }, { "id": "l-rf-1-2", "minutes": 14 } ] }
  ]
}
```

`minutes` is the honest time to read the lesson and do its practice. The sum must equal the plan's `minutes`.

### 4.3 `course.<lang>.json`

```json
{
  "title": "React Fundamentals",
  "tagline": "Go from zero to shipping interactive UIs with React 19.",
  "description": ["First paragraph (40–80 words).", "Second paragraph (40–80 words)."],
  "audience": "One sentence: who this course is for.",
  "prerequisites": "One sentence: what you should know first (or 'None').",
  "learnItems": ["exactly", "six", "outcomes", "each", "under", "70 characters"],
  "sections": { "s-rf-1": "Getting Started" },
  "lessons": { "l-rf-1-1": "Why React in 2026" }
}
```

## 5. Lessons

### 5.1 Front matter (YAML)

```yaml
---
kind: lesson            # lesson (default) | intro | wrapup
summary: One sentence, 12–35 words, saying what the learner can do after this lesson.
takeaways:
  - 3 to 5 bullets, each a complete sentence a learner could put on a flashcard.
further:
  - title: Passing Props to a Component
    url: https://react.dev/learn/passing-props-to-a-component
quiz:
  - q: What happens when a parent re-renders with the same props?
    options:
      - text: The child re-renders too, unless it's memoized.
        why: Correct. Rendering is top-down by default; `memo` is the opt-out.
      - text: React skips the child because its props didn't change.
        why: Only true for components wrapped in `memo` (or compiled by React Compiler).
      - text: The child unmounts and mounts again.
        why: Unmounting happens when the element type or key changes, not on re-render.
    answer: 0
---
```

### 5.2 Body structure

Markdown, no H1 (the page renders the title). Use `##` for the main parts and `###` sparingly inside them. A typical lesson:

1. **Opening (1–2 short paragraphs):** the problem this solves, or a concrete situation. Not "In this lesson…".
2. **Explanation with worked examples** (2–4 `##` parts): concept → code → what happens → why. Build up one example rather than switching examples every paragraph. Use the course's running project where it fits.
3. **Callouts** (1–3 per lesson): one "why this matters" or "tip", and at least one "common mistake" in most lessons.
4. **A diagram** where a picture beats words (data flow, the box model, a request lifecycle, a Git graph, a pod/service topology). Aim for at least one in every 3–4 lessons per course.
5. **Wrap-up** (one short paragraph) that hands off to the next lesson. Takeaways and further reading are rendered from front matter, not written in the body.

### 5.3 Length

| kind | English prose words (code, SVG and front matter excluded) |
|---|---|
| `lesson` | **600–1,200** (validator: error under 550 or over 1,500) |
| `intro` / `wrapup` | 350–800 (only the first lesson of a course and the last lesson of a course may use these) |

Arabic bodies are a complete translation; the validator requires at least 70% of the English word count.

### 5.4 Quiz rules

- **3–5 questions per lesson**, each with **3 or 4 options**, exactly one correct (`answer` is the 0-based index).
- **Every option has a `why`**, and the `why` on a wrong option explains the misconception, not just "Incorrect."
- Test understanding, not recall of trivia: predict the output, pick the fix, choose the right tool for a scenario, spot the bug.
- Options are similar in length and plausibility. No "all of the above", no joke options.
- Vary the position of the correct answer (the validator rejects a course where more than 40% of answers share one index).
- Inline code is fine in `q`, `text` and `why`. Multi-line code goes in the question as a fenced block (YAML `|` block scalar).

## 6. Markdown features the renderer supports

### 6.1 Code

Fenced blocks always name a language: `js`, `jsx`, `ts`, `tsx`, `html`, `css`, `json`, `bash`, `sql`, `python`, `swift`, `yaml`, `dockerfile`, `diff`, `text`, `ini`, `toml`, `kotlin`, `graphql`. Highlighting happens at build time. Add a file name after the language with `title=`:

````md
```jsx title=src/App.jsx
export default function App() { … }
```
````

Code and code comments stay in English in both languages.

### 6.2 Callouts

```md
:::tip Keep keys stable
Use an id from your data, not the array index, when the list can reorder.
:::

:::mistake Mutating state
`todos.push(item)` changes the array React already has, so nothing re-renders. Create a new array.
:::

:::why Why this matters
…
:::

:::note
…
:::
```

Types: `tip`, `mistake` (common mistake), `why` (why this matters), `note`. The title after the type is optional and plain text.

### 6.3 Runnable examples

Add `run` after the language to give the reader a Run button:

- ` ```js run ` — runs in a sandbox; `console.log` output is shown. No DOM, no imports, no network. The validator runs it in Node and fails if it throws.
- ` ```sql run ` — runs against the Cartwheel database (`content/data/shop.sqlite`). Keep result sets small (use `LIMIT`).
- ` ```python run ` — runs in Pyodide (Python 3.13, pandas 2.x, NumPy, scikit-learn). The Cartwheel CSVs are in the working directory. Output comes from `print()` (wrap DataFrames: `print(df.head())`).

### 6.4 Diagrams (inline SVG)

Wrap a hand-written SVG in a `figure` container. The caption is required and is also the accessible description.

```md
:::figure Props flow down, events flow up
<svg viewBox="0 0 640 260" role="img" aria-labelledby="t1">
  <title id="t1">Parent passes props to two children; a child calls an onSelect callback to notify the parent.</title>
  <rect class="d-box" x="240" y="20" width="160" height="56" rx="12"/>
  <text class="d-label" x="320" y="54" text-anchor="middle">App</text>
  <path class="d-arrow" d="M300 76 L180 150" marker-end="url(#arrow)"/>
  …
</svg>
:::
```

Rules: `viewBox` only (no `width`/`height`), at most 720 wide. **Never hard-code colors**: use these classes so the diagram works in light and dark mode: `d-box` (surface fill + border stroke), `d-box-primary` (violet tint), `d-box-accent` (blue tint), `d-box-success` (green tint), `d-box-warn` (yellow tint), `d-label` (text), `d-label-muted`, `d-label-strong`, `d-code` (monospace text), `d-line` (neutral stroke), `d-arrow` (violet stroke; use `marker-end="url(#arrow)"`, the marker is injected for you), `d-dashed`, `d-dot` (filled violet circle). Keep text ≥ 13 units tall and keep labels short. The `<title>` id must be unique in the lesson (`t1`, `t2`…). In the Arabic file translate the `<title>` and the `<text>` labels, except code and proper nouns.

### 6.5 Tables, lists, links

GitHub-style tables are fine (keep them under 5 columns). Link to another lesson with `[text](lesson:l-rf-2-3)` and to a course with `[text](course:css-mastery)`; the build resolves them and fails on a broken id. External links only in `further` (and rarely inline to official docs).

## 7. Exercises (hands-on practice)

Every section of every course has **at least one** exercise. Web, SQL and Python courses aim for an exercise in **most** lessons (≥ 60%), because doing is how this sticks. The exercise appears at the end of its lesson. Starter code must **fail** at least one check; the reference solution must **pass** all of them. `check-exercises.mjs` proves both.

Common text fields (`exercises/<id>.<lang>.json`):

```json
{
  "title": "Render the watchlist",
  "prompt": "Markdown. What to build, in 2–5 sentences. State the exact names the checks rely on.",
  "hints": ["A nudge.", "A bigger nudge.", "Nearly the answer."],
  "explanation": "Markdown shown after solving or revealing the solution: why the solution works.",
  "checks": { "renders-list": "Renders one <li> per movie" }
}
```

### 7.1 `web` (sandboxed iframe playground; JS/CSS/HTML/React/TS/tests)

```json
{
  "kind": "web",
  "mode": "react",
  "starter":  { "jsx": "…", "css": "…" },
  "solution": { "jsx": "…", "css": "…" },
  "checks": [
    { "id": "renders-list", "test": "return $$('li').length === 3;" },
    { "id": "adds-movie", "test": "await input($('input'), 'Dune'); await click($('button')); return text('ul').includes('Dune');" }
  ]
}
```

Modes and their files:

| mode | files | how it runs |
|---|---|---|
| `js` | `js` | Classic script (no `import`/`export`). Top-level `function`/`const` declarations are visible to checks. `console.log` is captured into `logs`. |
| `dom` | `html` (body markup), `css`, `js` | A page with that body, stylesheet and script. |
| `react` | `jsx` (must `export default function App()`; may `import { useState, … } from 'react'`), optional `css` | Compiled with Sucrase, rendered into `#root` with React 19 `createRoot`. |
| `ts` | `ts` | Type-checked with TypeScript 5.9 (`strict`, ES2022 libs, **no DOM types**; `console`, `setTimeout` and `structuredClone` are declared), then run like `js`. No `import`/`export`. A check `{ "id": "types", "typecheck": true }` passes when there are zero type errors. The helper types `Expect<T extends true>` and `Equal<X, Y>` are in scope for type tests: `type T1 = Expect<Equal<MyPick<Todo, 'title'>, { title: string }>>;` |
| `test` | `js` holds the learner's tests; the exercise also has `"subject"` (the code under test, read-only, shown in a tab) and `"mutants"`: `[{ "id": "off-by-one", "code": "…" }]` | The checks `{ "id": "passes", "suite": "subject" }` (all tests pass against the real code) and `{ "id": "catches-off-by-one", "suite": "off-by-one" }` (at least one test fails against that buggy version). The test API is a Vitest-compatible subset: `describe`, `test`/`it`, `expect` with `.not`, `toBe`, `toEqual`, `toStrictEqual`, `toBeTruthy`, `toBeFalsy`, `toBeNull`, `toBeUndefined`, `toBeDefined`, `toContain`, `toHaveLength`, `toMatch`, `toThrow`, `toBeGreaterThan`, `toBeGreaterThanOrEqual`, `toBeLessThan`, `toBeLessThanOrEqual`, `toBeCloseTo`, `toHaveProperty`, `toHaveBeenCalled`, `toHaveBeenCalledTimes`, `toHaveBeenCalledWith`, `resolves`/`rejects`; `vi.fn()` (with `.mock.calls`, `mockReturnValue`, `mockResolvedValue`, `mockImplementation`), `beforeEach`, `afterEach`, `test.each(table)(name, fn)`, `vi.spyOn`, `expect.any(Number)`. No fake timers. Tests may be `async`. No imports: the subject's functions are in scope. |

A `test` string is the **body of an async function** that returns `true` when the check passes. Helpers in scope: `$(sel)`, `$$(sel)` (array), `text(sel)` (trimmed textContent, '' if missing), `exists(sel)`, `style(el, prop)` (computed style), `click(el)`, `input(el, value)` (works with React controlled inputs), `press(el, key)`, `tick(ms = 0)`, `logs` (array of logged strings), `errors` (uncaught error messages), `window`, `document`. Checks run in order, after the code has run and settled, and share state, so a later check can rely on an earlier click. Keep each check focused on one behaviour and make labels learner-friendly.

Write checks that accept **any correct solution**, not only yours: check behaviour and output, not variable names (unless the prompt asks for a name), not exact whitespace.

### 7.2 `sql`

```json
{ "kind": "sql", "starter": "-- Revenue by country\nSELECT country\nFROM customers;", "solution": "SELECT …", "orderMatters": true }
```

The learner's result must equal the solution's result: same number of columns, same values row by row (numbers compared to 2 decimals; column names ignored). Set `orderMatters` to `true` only when the prompt asks for an order. Prompts name the expected columns and their order.

### 7.3 `python`

```json
{
  "kind": "python",
  "files": ["orders.csv", "customers.csv"],
  "starter": "import pandas as pd\n\norders = pd.read_csv('orders.csv')\n# Your code here\nmonthly = None\n",
  "solution": "…",
  "checks": [
    { "id": "is-series", "test": "isinstance(monthly, pd.Series)" },
    { "id": "values", "test": "round(float(monthly.loc['2025-11']), 2) == 41234.5" }
  ]
}
```

Each check `test` is a Python **expression** evaluated in the learner's namespace after their code runs. `files` lists which Cartwheel CSVs to copy into the working directory. Runs in Pyodide; verify with the local Python 3.13 venv: `.venv/bin/python`.

### 7.4 Guided exercises (design, mobile, DevOps, cloud, Git)

Where code can't run in a browser, practice is a guided exercise that still makes the learner think:

```json
{ "kind": "order", "items": ["build", "tag", "push", "deploy"] }
```
Text file adds `"items": { "build": "docker build -t api:1.4 .", … }`. Neutral `items` are in the correct order; the app shuffles them.

```json
{ "kind": "spot-bug", "language": "dockerfile", "code": "FROM node:22\nCOPY . .\nRUN npm ci\n…", "bugLines": [2] }
```
1-based line numbers. The learner selects the line(s) they think are wrong. Text `explanation` says what's wrong and shows the fix.

```json
{ "kind": "fill", "language": "bash", "template": "kubectl {{0}} deployment/web --replicas={{1}}", "blanks": [ { "answers": ["scale"] }, { "answers": ["3"] } ] }
```
Answers are compared trimmed and case-insensitive; list every correct spelling.

```json
{ "kind": "choice", "multiple": true, "options": ["a", "b", "c", "d"], "correct": ["a", "c"] }
```
Text file adds `"options": { "a": { "text": "…", "why": "…" }, … }`. Use this for critique-a-layout, pick-the-architecture, choose-the-IAM-policy scenarios. A `figure` (inline SVG, same rules as §6.4) can go in the prompt.

## 8. Checkpoints and final assessment (`assessments.<lang>.yaml`)

```yaml
checkpoints:
  s-rf-1:            # one per section, 5 questions each
    - q: …
      options: [ { text: …, why: … }, … ]
      answer: 2
final:               # 12 questions covering the whole course; pass mark 70%
  - q: …
```

Checkpoint and final questions are **new** questions, not copies of lesson quiz questions, and lean toward applying knowledge (scenarios, code reading, debugging). Same option and `why` rules as §5.4.

## 9. Glossary (`glossary.<lang>.json`) — also the flashcard deck

```json
[
  { "id": "jsx", "term": "JSX", "definition": "A syntax extension that lets you write HTML-like markup in JavaScript; it compiles to function calls that create React elements.", "lesson": "l-rf-1-4" }
]
```

**18–30 terms per course**, each definition 1–2 sentences (15–45 words), self-contained (it will be shown alone on a flashcard), and accurate. `lesson` is where the term is taught.

## 10. Arabic

The Arabic is not a word-for-word translation. It reads the way Arab developers actually write about tech in blogs, docs and talks: Modern Standard Arabic, clear and warm, with English technical terms kept where developers really use them.

- **Keep in English** (Latin script) the names people use as-is: component, props, state, hook, render, re-render, commit, branch, merge, pull request, deploy, container, image, pod, cluster, DataFrame, query, JOIN, index, API, endpoint, callback, promise, async/await, type, generic, interface, selector, flexbox, grid, breakpoint, token, variant, frame, auto layout, pipeline, bucket, instance, model, feature, overfitting, accuracy, precision, recall, tests, mock, assertion, ARIA, screen reader. On first use in a lesson, add a short Arabic gloss when it helps: "الـ state (الحالة)".
- **Use Arabic** where a natural, common Arabic word exists: مكوّن is fine alongside component if the course already uses it consistently; دالة (function), متغيّر (variable), مصفوفة (array), كائن (object), حلقة تكرار (loop), شرط (condition), خطأ (error/bug), اختبار (test), واجهة المستخدم (UI), قاعدة بيانات (database), جدول (table), عمود (column), صف (row), خادم (server), متصفّح (browser), أداء (performance), إمكانية الوصول (accessibility).
- **Pick one rendering per term per course and keep it.** Put the English in parentheses the first time: "إمكانية الوصول (accessibility)".
- Attach the definite article to English terms the way people do: "الـ props"، "هذا الـ hook"، "الـ containers". Write Modern Standard Arabic; no dialect in lessons.
- **Code, code comments, file names, commands, URLs, keyboard shortcuts and identifiers stay exactly as in English** and LTR. Never translate inside code fences. Inline code stays as-is: "استخدم `useState` لتخزين…".
- Use Latin digits (1, 2, 3), Arabic punctuation (، ؛ ؟) and straight quotes or «» consistently.
- Translate quiz questions, options and `why`s fully. Keep `answer` indices, `id`s, `lesson` ids and URLs identical. `further` titles may stay in English (they're English pages).
- Glossary `term` in Arabic: the English term when that's what people say ("JSX"), or "Arabic (English)" when an Arabic term is standard ("المفتاح (key)"). Definitions in Arabic.
- Read it aloud: if a sentence sounds like a machine translated it, rewrite it.

## 11. Self-check before you call a course done

1. `node scripts/content/validate.mjs <course-id>` passes with no errors.
2. `node scripts/content/check-exercises.mjs <course-id>` passes (every solution passes, every starter fails).
3. Every code sample is something you'd accept in a code review.
4. You would be happy to learn from this lesson yourself.
