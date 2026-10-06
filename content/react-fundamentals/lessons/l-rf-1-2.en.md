---
summary: Create a React 19 project with Vite, run the dev server, and trace how index.html, main.jsx and App.jsx connect so you know where every change goes.
takeaways:
  - "`npm create vite@latest watchlist -- --template react` scaffolds a React project; `npm run dev` serves it at localhost:5173 with hot updates."
  - The browser loads index.html, which loads src/main.jsx, which mounts the App component into the div with id root.
  - "`npm run build` writes an optimized static site to dist/, and `npm run preview` serves that build locally."
  - StrictMode renders components twice and runs effects twice in development only, to surface bugs early.
further:
  - title: Getting Started (Vite)
    url: https://vite.dev/guide/
  - title: Build a React app from Scratch
    url: https://react.dev/learn/build-a-react-app-from-scratch
  - title: StrictMode reference
    url: https://react.dev/reference/react/StrictMode
quiz:
  - q: You run `npm create vite@latest watchlist --template react` with npm 10, and Vite asks you to pick a framework anyway. Why?
    options:
      - text: The `react` template was removed from recent versions of Vite.
        why: The `react` template still exists, alongside `react-ts`, `react-compiler` and others.
      - text: Vite only accepts templates when you are inside an existing project folder.
        why: The project name and template work together from any folder; Vite creates the new folder for you.
      - text: npm 10 can't run `create` commands, so the flag is silently dropped.
        why: npm runs `create` commands fine. It just treats unseparated flags as its own options.
      - text: npm swallowed `--template` as its own flag; you need `--` before it so the flag reaches create-vite.
        why: Correct. With npm 7 and later, `npm create vite@latest watchlist -- --template react` passes everything after `--` to the scaffolding tool.
    answer: 3
  - q: Where does React actually attach your app to the page in a Vite project?
    options:
      - text: In src/main.jsx, where `createRoot(document.getElementById('root'))` renders `<App />`.
        why: Correct. main.jsx is the entry module; it finds the root div from index.html and hands it to React.
      - text: In index.html, through a `<react-app>` custom element.
        why: index.html only has a plain `<div id="root">` and a module script tag. React itself is wired up in main.jsx.
      - text: In vite.config.js, through the `react()` plugin.
        why: The plugin teaches Vite to compile JSX and enables fast refresh. It doesn't decide where your app renders.
    answer: 0
  - q: In development, a `console.log` at the top of your App component prints twice on load. In the production build it prints once. What's going on?
    options:
      - text: Vite's hot module replacement loads every module twice.
        why: HMR swaps changed modules after edits; it doesn't run each component twice on the first load.
      - text: There's a bug in your component that makes it render in a loop.
        why: A render loop would print far more than twice and usually throws "Too many re-renders".
      - text: StrictMode deliberately renders components twice in development to expose impure rendering code.
        why: Correct. It's a development-only check. The production build renders once.
      - text: React 19 always renders every component twice before it shows the result.
        why: The double render only happens under StrictMode in development, not in production.
    answer: 2
  - q: You want to see exactly what your users will download before deploying. Which command sequence fits?
    options:
      - text: Run `npm run dev` and open the Network tab.
        why: The dev server serves unbundled source modules with dev-only tooling, which is not what ships.
      - text: Run `npm run build`, then `npm run preview`.
        why: Correct. build writes the optimized site to dist/, and preview serves that folder locally so you can click through it.
      - text: Open index.html directly from Finder or Explorer.
        why: Opening the file with file:// skips Vite entirely; the JSX would never be compiled and the page stays blank.
    answer: 1
---

A React project needs more than React. Browsers don't understand JSX, your code is split into dozens of modules, and you want the page to update the moment you save a file. A build tool handles all of that. In 2026 the default choice for a client-side React app is **Vite**: it starts in well under a second, updates the browser on save, and produces a small optimized build when you're ready to ship.

## Create the project

Check your Node.js version first. Current Vite (7 and 8) needs Node 20.19+ or 22.12+; in practice, install a current LTS release (22 or 24), since Node 20 reached end of life in April 2026.

```bash
node -v
# v24.x or v22.x: a current LTS release
```

Then scaffold the Watchlist project:

```bash
npm create vite@latest watchlist -- --template react
cd watchlist
npm install
npm run dev
```

The `--` matters. It tells npm "everything after this belongs to the tool I'm running", so `--template react` reaches create-vite instead of being eaten by npm. `@latest` always gives you the newest major version of Vite (Vite 8 at the time of writing); everything in this course works the same on Vite 7 or 8. Recent versions of create-vite may also offer to install dependencies and start the server for you; accepting is fine.

The terminal prints a local URL, `http://localhost:5173/`. Open it and you'll see the Vite + React starter page with a counter button.

:::tip Picking a template
`react` gives you plain JavaScript, which is what this course uses so you can focus on React itself. `react-ts` is the same with TypeScript, and `react-compiler` adds the optional React Compiler. You can move to TypeScript later without rewriting your components' logic.
:::

## How the pieces connect

Open the folder in your editor. Most files are configuration you won't touch often. Three files matter right now, and they form a chain.

:::figure From index.html to your App component
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">The browser loads index.html, which contains a root div and a module script pointing at src/main.jsx. main.jsx calls createRoot on the root div and renders App from src/App.jsx.</title>
  <rect class="d-box" x="20" y="40" width="190" height="150" rx="12"/>
  <text class="d-label-strong" x="115" y="70" text-anchor="middle">index.html</text>
  <text class="d-code" x="115" y="110" text-anchor="middle">&lt;div id="root"&gt;</text>
  <text class="d-code" x="115" y="140" text-anchor="middle">&lt;script type=</text>
  <text class="d-code" x="115" y="160" text-anchor="middle">"module" src=…&gt;</text>
  <rect class="d-box-primary" x="250" y="40" width="190" height="150" rx="12"/>
  <text class="d-label-strong" x="345" y="70" text-anchor="middle">src/main.jsx</text>
  <text class="d-code" x="345" y="110" text-anchor="middle">createRoot(root)</text>
  <text class="d-code" x="345" y="140" text-anchor="middle">.render(&lt;App /&gt;)</text>
  <rect class="d-box-accent" x="480" y="40" width="180" height="150" rx="12"/>
  <text class="d-label-strong" x="570" y="70" text-anchor="middle">src/App.jsx</text>
  <text class="d-code" x="570" y="110" text-anchor="middle">export default</text>
  <text class="d-code" x="570" y="135" text-anchor="middle">function App()</text>
  <path class="d-arrow" d="M210 150 L248 150" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 120 L478 120" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="340" y="230" text-anchor="middle">loads → mounts → renders</text>
</svg>
:::

**index.html** sits at the project root, not in a `public` folder. Vite treats it as the entry point. It contains an empty `<div id="root"></div>` and one script tag: `<script type="module" src="/src/main.jsx"></script>`.

**src/main.jsx** is where React takes over:

```jsx title=src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`createRoot` takes a real DOM node and returns a root that React manages from then on. Everything inside `#root` now belongs to React; don't change it with `document.querySelector` code of your own.

**src/App.jsx** is your first component and where you'll spend most of your time. Replace its contents with something of your own to prove the chain works:

```jsx title=src/App.jsx
export default function App() {
  return <h1>My Watchlist</h1>;
}
```

Save, and the browser updates without a reload. That's hot module replacement (HMR) with React Fast Refresh, set up by the `@vitejs/plugin-react` plugin in `vite.config.js`. You can also delete `src/App.css` and empty `src/index.css`; you'll style the app properly later.

## StrictMode, briefly

`<StrictMode>` adds extra checks in development. It renders each component twice and runs effects twice (mount, clean up, mount again) to flush out code that isn't safe to repeat. If you see a log print twice in dev, this is why. It does nothing in production, so leave it on. It will matter when you reach effects in Section 3.

:::mistake Opening index.html directly
Double-clicking `index.html` opens it with a `file://` URL. Nothing compiles the JSX, the module fails to load, and you get a blank page. Always open the URL that `npm run dev` prints.
:::

## The four scripts

`package.json` defines the commands you'll use:

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with instant updates |
| `npm run build` | Bundles and minifies the app into `dist/` |
| `npm run preview` | Serves `dist/` locally to check the real build |
| `npm run lint` | Runs the linter, including the Rules of Hooks |

The rest of the folder is supporting cast. `package.json` lists your dependencies (`react`, `react-dom`) and dev tools (`vite`, `@vitejs/plugin-react` and a linter). `node_modules/` is where `npm install` puts them; it's large, it's rebuilt from `package.json` at any time, and it never goes into Git. `public/` holds files served as-is at the site root, such as a favicon. The linter's config file depends on the template version: current templates use Oxlint (`.oxlintrc.json`), older ones and the ESLint option use `eslint.config.js`.

`dist/` is generated output. Never edit files in it, and don't commit it to Git; the starter's `.gitignore` already excludes it. When you deploy in the last section, Vercel will run `npm run build` for you.

Your project is running and you know where React is mounted. If the dev server ever gets into a strange state after you install a package or rename files, stop it with Ctrl+C and run `npm run dev` again. A restart takes a second and fixes more problems than it should. Next, you'll write your first real component in `App.jsx` and split the Watchlist into reusable pieces.
