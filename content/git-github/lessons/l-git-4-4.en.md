---
summary: Add a GitHub Actions workflow that checks every pull request, then protect main with a ruleset so changes can only land through a pull request whose checks pass.
takeaways:
  - "A workflow is a YAML file in `.github/workflows/`; `on` picks the events, `jobs` run on runners, and `steps` either `uses` an action or `run`s a command."
  - Each job reports a status check on the pull request, shown as a green tick or a red cross with full logs.
  - "A branch ruleset on `main` can block force pushes and deletions, require a pull request, and require named status checks to pass."
  - A required status check is matched by job name, and GitHub only suggests checks that have already reported, so run the workflow before requiring it.
  - The finished loop is branch, push, pull request, automated check, review, merge, and nobody can skip a step.
further:
  - title: Building and testing Node.js
    url: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
  - title: Workflow syntax for GitHub Actions
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
  - title: About rulesets
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
  - title: Available rules for rulesets
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
quiz:
  - q: "Your workflow starts with `on: pull_request`. When does it run?"
    options:
      - text: Only when someone clicks Run workflow in the Actions tab.
        why: That's the `workflow_dispatch` event. `pull_request` is triggered automatically by pull request activity.
      - text: When a pull request is opened, and again each time new commits are pushed to its branch.
        why: Correct. By default `pull_request` runs on opened, synchronize (new commits) and reopened, so every update is checked.
      - text: Only after the pull request has been merged.
        why: The point of checking a pull request is to know before merging. A run after merge would be a `push` to `main`.
      - text: Every time anyone pushes to any branch.
        why: That's the `push` event without a branch filter. `pull_request` only fires for pull request activity.
    answer: 1
  - q: "Your CI job fails at `npm ci` with an error that `package.json` can't be found. The first step is `run: npm ci`. What's wrong?"
    options:
      - text: The runner doesn't have npm installed.
        why: GitHub's Ubuntu runners include Node.js and npm. The error is about a missing file, not a missing tool.
      - text: "`npm ci` only works on Windows runners."
        why: "`npm ci` works on every operating system the runners offer."
      - text: The workflow file is in the wrong folder.
        why: If the file were in the wrong folder the workflow wouldn't run at all. It ran, and failed at a step.
      - text: The job never checked out the repository; `actions/checkout` must come before any step that needs your files.
        why: Correct. A runner starts as an empty machine. `actions/checkout` puts your repository's files in place.
    answer: 3
  - q: You've added a ruleset on `main` requiring a pull request. What happens when you run `git push origin main` with a local commit?
    options:
      - text: The push is rejected with a repository rule violation; the commit has to arrive through a pull request.
        why: Correct. GitHub refuses the update to `main`, and your local commit is untouched, so you can push it to a branch and open a pull request.
      - text: The push succeeds and GitHub opens a pull request automatically.
        why: GitHub doesn't convert pushes into pull requests. Rules either allow an update or reject it.
      - text: The push succeeds because rules only apply to other people.
        why: Rules apply to everyone, including the owner, unless you add yourself to the bypass list.
      - text: Your local commit is deleted to keep you in sync with `main`.
        why: Remote rules can't touch your local repository. Nothing local changes when a push is rejected.
    answer: 0
  - q: You renamed your workflow job from `check` to `html`. Now every pull request shows the required check `check` as "Expected — Waiting for status to be reported", and nothing can merge. Why?
    options:
      - text: Rulesets can only require checks from jobs named `check` or `test`.
        why: Any job name works. The problem is that the ruleset and the workflow now disagree about the name.
      - text: The workflow has a YAML syntax error.
        why: The `html` job runs fine; it just reports under a name the ruleset isn't waiting for.
      - text: The ruleset still requires a check named `check`, which no job reports any more; update the required check to `html`.
        why: Correct. Required checks are matched by name. Rename one, and update the other at the same time.
    answer: 2
---

Everything so far has relied on you remembering. Remember to run the HTML check, to open a pull request rather than pushing to `main`, to never force-push. People forget, especially at 11 p.m. before a job application. This lesson moves those habits out of your head and into GitHub: a machine runs the checks on every pull request, and rules make `main` impossible to change any other way.

## Give the portfolio something to check

Continuous integration needs a command that fails when something is wrong. For an HTML site, a validator is a good start. In your portfolio, on a new branch:

```bash
git switch -c add-ci
npm init -y
npm install --save-dev html-validate
npm pkg set scripts.test="html-validate index.html projects.html"
echo '{ "extends": ["html-validate:recommended"] }' > .htmlvalidate.json
npm test
```

`node_modules/` is already in your `.gitignore` from two lessons ago; commit `package.json`, `package-lock.json` and `.htmlvalidate.json`. If `npm test` reports problems, that's the point: fix them, or note them for the first CI run. On a fresh portfolio it often finds this:

```text
index.html
  1:1  error  DOCTYPE should be uppercase  doctype-style
```

## Your first workflow

**GitHub Actions** runs workflows defined in YAML files under `.github/workflows/`. Create one:

```yaml title=.github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
```

Read it top to bottom:

- `on` lists the **events** that start the workflow: any pull request into `main` (opened, or updated with new commits), and pushes to `main` after merging.
- `jobs` holds one job, `check`. That id becomes the name of the status check GitHub shows on the pull request.
- `runs-on` picks a **runner**, a fresh virtual machine GitHub provides. It starts empty every time.
- `steps` run in order. `uses` runs a published **action**: `actions/checkout` copies your repository onto the runner, `actions/setup-node` installs Node.js 24 and caches npm downloads. `run` executes a shell command: `npm ci` installs exactly what `package-lock.json` lists, and `npm test` runs the validator.

Any step that exits with an error fails the job. Commit the workflow, push the branch and open a pull request.

## Watching it run

Within seconds the pull request shows a check, "CI / check (pull_request)", with a yellow dot while it runs. Then a green tick, or a red cross. Click **Details** to see the full log of every step; the failing one is expanded, showing the same validator output you'd get locally.

To fix a red check, do what you'd do for review feedback: commit on the same branch and push. The workflow runs again on the new commit. Get used to reading these logs. CI isn't judging you; it's a colleague who reruns the checks every single time without getting bored.

:::figure The protected path to main
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">A left-to-right flow: feature branch, push, pull request, then two gates side by side, CI check passes and review approves, then merge into main. A blocked arrow shows direct pushes to main being rejected by the ruleset.</title>
  <rect class="d-box" x="10" y="80" width="110" height="50" rx="10"/>
  <text class="d-label" x="65" y="110" text-anchor="middle">branch</text>
  <rect class="d-box" x="150" y="80" width="120" height="50" rx="10"/>
  <text class="d-label" x="210" y="110" text-anchor="middle">pull request</text>
  <rect class="d-box-success" x="300" y="40" width="140" height="44" rx="10"/>
  <text class="d-label" x="370" y="67" text-anchor="middle">CI: check</text>
  <rect class="d-box-success" x="300" y="126" width="140" height="44" rx="10"/>
  <text class="d-label" x="370" y="153" text-anchor="middle">review</text>
  <rect class="d-box-primary" x="480" y="80" width="90" height="50" rx="10"/>
  <text class="d-label-strong" x="525" y="110" text-anchor="middle">merge</text>
  <rect class="d-box-accent" x="600" y="80" width="90" height="50" rx="10"/>
  <text class="d-code" x="645" y="110" text-anchor="middle">main</text>
  <path class="d-arrow" d="M120 105 L146 105" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M270 98 L296 70" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M270 112 L296 140" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 62 L476 96" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 148 L476 114" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M570 105 L596 105" marker-end="url(#arrow)"/>
  <path class="d-line d-dashed" d="M65 130 C65 205 600 205 640 136"/>
  <rect class="d-box-warn" x="250" y="186" width="200" height="30" rx="8"/>
  <text class="d-label" x="350" y="206" text-anchor="middle">direct push: rejected</text>
</svg>
:::

## Protect main with a ruleset

A passing check is only useful if merging waits for it. That's what a **ruleset** enforces. On GitHub, open the repository's **Settings**, then **Rules**, then **Rulesets**, and choose **New ruleset**, **New branch ruleset**:

1. Name it "Protect main" and set **Enforcement status** to Active.
2. Under **Target branches**, add the default branch.
3. Keep **Restrict deletions** and **Block force pushes** ticked.
4. Tick **Require a pull request before merging**. On a solo repository set required approvals to 0 (you can't approve your own pull request); on a team, 1 or more.
5. Tick **Require status checks to pass**, add the check `check`, and save.

Now try to skip the process:

```bash
git switch main
git commit --allow-empty -m "Sneak a commit onto main"
git push origin main
```

```text
remote: error: GH013: Repository rule violations found for refs/heads/main.
```

The push is refused, and your local commit is untouched. Every change to `main` now goes through a pull request, and the merge button stays disabled until the check is green. Run `git reset --hard origin/main` to drop the empty commit.

Rulesets are free on public repositories; on private ones they need a paid plan such as GitHub Pro or Team. You may also see the older **branch protection rules** in settings. They do a similar job; rulesets are newer, can be layered, and anyone with read access can see which rules apply.

:::mistake Requiring a check that never reports
Required checks are matched by name. If you require `check` before the workflow has ever run, GitHub can't offer it in the list; and if you later rename the job, pull requests wait forever on "Expected — Waiting for status to be reported". Run the workflow once before requiring it, and change the job name and the ruleset together.
:::

## What you can do now

Look at where the portfolio started: a folder with `index.html`. It's now a repository with readable history, branches that merge or rebase cleanly, a GitHub remote you reach with proper authentication, issues that explain why work exists, tagged releases, and a `main` that only accepts reviewed, automatically checked pull requests. You can undo almost any mistake, and you know which undo fits.

More than the commands, you have the model: commits are snapshots linked to parents, branches and tags are labels, HEAD is where you stand, and remotes are other copies of the same graph. When Git surprises you in future, run `git log --oneline --graph --all`, draw what you see, and the next command will usually be obvious.
