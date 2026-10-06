---
summary: Deploy the Watchlist to Vercel from a GitHub repository or the Vercel CLI, understand production and preview deployments, and handle environment variables and client-side routing safely.
takeaways:
  - A Vite app builds to static files in dist/, which Vercel detects automatically with the Vite preset (`vite build`, output `dist`).
  - Importing a GitHub repository gives you a production deployment on every push to main and a preview URL for every other branch and pull request.
  - The Vercel CLI deploys from your terminal; `vercel` creates a preview and `vercel --prod` deploys to production.
  - Only variables prefixed `VITE_` reach browser code, and they are public, so never put secrets in them.
  - A single-page app with client-side routes needs a rewrite to index.html; the Watchlist, with one page, doesn't.
further:
  - title: Vite on Vercel
    url: https://vercel.com/docs/frameworks/frontend/vite
  - title: Vercel CLI overview
    url: https://vercel.com/docs/cli
  - title: Deploying a Static Site (Vite)
    url: https://vite.dev/guide/static-deploy
  - title: Env Variables and Modes (Vite)
    url: https://vite.dev/guide/env-and-mode
quiz:
  - q: You import the Watchlist repository into Vercel. What does Vercel run, and what does it serve?
    options:
      - text: It runs `npm run dev` and keeps the dev server running for visitors.
        why: The dev server is for local development only. Production serves optimized static files.
      - text: It installs dependencies, runs the build (`vite build`), and serves the static files in `dist/`.
        why: Correct. The Vite preset knows the build command and output folder, so the defaults just work.
      - text: It uploads your `src/` folder and the browser compiles the JSX.
        why: Browsers can't run JSX. The build step compiles and bundles everything before anything is served.
      - text: It serves `index.html` from the project root with no build step.
        why: That root index.html points at `/src/main.jsx`, which only works through Vite. The built `dist/index.html` is what gets served.
    answer: 1
  - q: You open a pull request that restyles the filter bar. With the GitHub integration set up, what happens?
    options:
      - text: Nothing until you merge, because Vercel only builds main.
        why: Vercel builds every pushed branch. Only the production URL waits for main.
      - text: The production site updates immediately with the unmerged changes.
        why: Production is only updated from the production branch (main), so unfinished work doesn't reach real users.
      - text: Vercel asks you to run `vercel --prod` locally.
        why: The Git integration deploys automatically; the CLI is an alternative, not a required step.
      - text: Vercel builds the branch and posts a unique preview URL on the pull request, leaving production unchanged.
        why: Correct. Preview deployments let you and reviewers click through the change before merging.
    answer: 3
  - q: Your app reads `import.meta.env.VITE_TMDB_KEY` to call a movie API. Which statement is true?
    options:
      - text: The value is embedded in the JavaScript bundle at build time, so anyone can read it in their browser.
        why: Correct. VITE_ variables are public by design. Only use them for values that are safe to expose, and keep real secrets on a server.
      - text: The value stays on Vercel's servers and is fetched securely at runtime.
        why: Vite replaces `import.meta.env.VITE_…` with the literal value during the build. There's no runtime fetch.
      - text: The prefix is optional; any environment variable is available as `import.meta.env.NAME`.
        why: Vite only exposes variables with the `VITE_` prefix to client code, precisely to prevent accidental leaks.
    answer: 0
  - q: You add React Router so `/watched` is its own page. Clicking around works, but refreshing on `/watched` in production shows a 404. What's the fix?
    options:
      - text: Move the page into a `public/watched/` folder.
        why: The page is rendered by JavaScript from index.html; a static folder would need its own copy of the whole app.
      - text: Switch the build to `npm run dev` on Vercel.
        why: The dev server isn't a production server. The fix is a routing rule for the static files.
      - text: Add a rewrite in `vercel.json` that sends every path to `/index.html`, so the app loads and the router handles the URL.
        why: Correct. There's no `watched` file on the server; the rewrite serves the app shell for any path and lets client-side routing take over.
    answer: 2
---

A project that only runs on `localhost:5173` is invisible to everyone else, including the people deciding whether to hire you. Deploying turns the Watchlist into a URL you can put on your CV, send to a friend and open on your phone. For a Vite app on Vercel this takes a few minutes, and once it's set up, every `git push` deploys automatically.

## What you're deploying

`npm run build` turns your project into a folder of static files: `dist/index.html`, one or two JavaScript bundles and a CSS file, with hashed file names like `index-B3f9xk2a.js` so browsers can cache them forever. There's no server code. Any static host can serve it; Vercel is popular because it detects the framework, builds on every push and gives you preview URLs for free on the Hobby plan.

Before deploying, check the production build locally:

```bash
npm run build
npm run preview
```

`preview` serves `dist/` on `http://localhost:4173`. If something breaks only in production, such as a wrong asset path or a missing environment variable, you find out here instead of on the live site.

## Option 1: import from GitHub (recommended)

1. Push your project to a GitHub repository. If you committed in the Building the Watchlist lesson, create an empty repository on GitHub and follow its instructions to `git remote add origin …` and `git push -u origin main`.
2. Sign in to Vercel with your GitHub account and choose **Add New… → Project**.
3. Import the `watchlist` repository. Vercel detects **Vite** and fills in the build command (`vite build`, which is what `npm run build` runs) and the output directory (`dist`). Leave them as they are.
4. Click **Deploy**. About a minute later you get a production URL like `watchlist-yourname.vercel.app`.

From now on, the repository drives deployments:

- Every push to `main` builds and deploys to **production**.
- Every push to another branch, and every pull request, gets its own **preview deployment** with a unique URL, posted as a comment on the pull request.

Preview deployments change how you work. You restyle the filter bar on a branch, open a pull request, and click the preview link on your phone before merging. Production never sees unfinished work.

:::figure From git push to a live URL
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">A git push to GitHub triggers a Vercel build that runs vite build and produces dist. Pushes to main go to the production URL; pushes to other branches get a preview URL.</title>
  <rect class="d-box" x="10" y="80" width="120" height="56" rx="10"/>
  <text class="d-code" x="70" y="113" text-anchor="middle">git push</text>
  <rect class="d-box" x="165" y="80" width="120" height="56" rx="10"/>
  <text class="d-label" x="225" y="113" text-anchor="middle">GitHub</text>
  <rect class="d-box-primary" x="320" y="70" width="160" height="76" rx="10"/>
  <text class="d-label-strong" x="400" y="100" text-anchor="middle">Vercel build</text>
  <text class="d-code" x="400" y="124" text-anchor="middle">vite build → dist</text>
  <rect class="d-box-success" x="530" y="30" width="160" height="56" rx="10"/>
  <text class="d-label" x="610" y="54" text-anchor="middle">main → production</text>
  <text class="d-label-muted" x="610" y="74" text-anchor="middle">your .vercel.app URL</text>
  <rect class="d-box-accent" x="530" y="130" width="160" height="56" rx="10"/>
  <text class="d-label" x="610" y="154" text-anchor="middle">branch → preview</text>
  <text class="d-label-muted" x="610" y="174" text-anchor="middle">unique URL per push</text>
  <path class="d-arrow" d="M130 108 L163 108" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M285 108 L318 108" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 95 L528 62" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 122 L528 154" marker-end="url(#arrow)"/>
</svg>
:::

## Option 2: the Vercel CLI

If you'd rather deploy from the terminal, or the code isn't on GitHub yet:

```bash
npm install -g vercel
vercel          # first run: log in, link the project, deploy a preview
vercel --prod   # deploy to production
```

The first `vercel` run asks a few questions (scope, project name, which directory) and detects Vite the same way. It creates a `.vercel` folder that links your directory to the project; keep it out of Git. The CLI is handy for quick experiments. For a project you'll keep working on, the Git integration is better, because deployments happen without anyone remembering to run a command.

## Environment variables

Sooner or later you'll want configuration, such as an API base URL. Vite exposes environment variables to your code only if they start with `VITE_`:

```js
const apiUrl = import.meta.env.VITE_API_URL;
```

Locally, put them in a `.env.local` file (already git-ignored by the Vite template). On Vercel, add them under **Project Settings → Environment Variables**, then redeploy, because Vite inlines the values when it builds.

:::mistake Secrets in VITE_ variables
`VITE_` variables are written into the JavaScript bundle as plain text. Anyone can open DevTools and read them. That's fine for a public API URL and unacceptable for a private API key. Secrets belong on a server, such as a serverless function, never in client code.
:::

## Routing on a static host

The Watchlist has one page, so every request is for `/` and Vercel serves `index.html`. If you later add client-side routing with React Router, a URL like `/watched` exists only inside your JavaScript. Refreshing on it asks the server for a `/watched` file that doesn't exist, and you get a 404. The fix is a rewrite that serves the app shell for any path:

```json title=vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Real files in `dist/`, such as your JavaScript and CSS, are still served normally; the rewrite only applies when no file matches.

:::tip Check the live site like a user
Open the production URL on your phone, add a movie, refresh, and confirm it's still there. localStorage is per site, so your localhost list and your production list are separate. That's expected, not a bug.
:::

The Watchlist is live. In the last lesson, you'll look back at what you've learned and plan what to learn next.
