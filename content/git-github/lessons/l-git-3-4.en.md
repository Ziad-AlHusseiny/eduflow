---
summary: Plan work with issues, labels and a GitHub Project board, then contribute to a repository you don't own by forking it, tracking upstream, and opening a pull request from your fork.
takeaways:
  - An issue is a unit of planned work or a reported problem; labels, assignees and a linked pull request show its state.
  - A GitHub Project is a table, board or roadmap view over issues and pull requests, with custom fields like Status and Priority.
  - A fork is your own copy of someone else's repository on GitHub; you push to your fork and open a pull request to the original.
  - "By convention `origin` is your fork and `upstream` is the original; you fetch from `upstream` and push to `origin`."
  - Before contributing, read CONTRIBUTING.md, look for an existing issue, and keep the change small and on its own branch.
further:
  - title: About issues
    url: https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues
  - title: About Projects
    url: https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects
  - title: Fork a repository
    url: https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo
  - title: Syncing a fork
    url: https://docs.github.com/en/pull-requests/how-tos/work-with-forks/syncing-a-fork
quiz:
  - q: You cloned your fork of `vite-themes`. Which commands bring the original project's newest `main` into your fork's `main`?
    options:
      - text: "`git pull origin main`"
        why: "`origin` is your fork, which doesn't have the new commits yet. You'd be pulling from the copy that's out of date."
      - text: "`git push upstream main`"
        why: You can't push to the original repository, and pushing sends your commits rather than fetching theirs.
      - text: "`git fetch upstream`, `git switch main`, `git merge --ff-only upstream/main`, then `git push origin main`."
        why: Correct. Fetch from the original, fast-forward your `main` to it, then update your fork on GitHub. The Sync fork button does the GitHub half.
      - text: "`git clone` the original again into a new folder."
        why: That works but throws away your setup and branches. Adding an `upstream` remote keeps everything in one clone.
    answer: 2
  - q: You've found a bug in an open-source library and have a fix in mind that touches six files. What should you do first?
    options:
      - text: Open a pull request straight away so the maintainers see working code.
        why: An unannounced large change may clash with plans you don't know about, and can be closed unread.
      - text: Email the maintainers privately with the patch attached.
        why: Most projects coordinate in public issues so others can see and help. Private email is for security reports only, if the project asks for it.
      - text: Fork the project and publish your fixed version under a new name.
        why: That splits the community and leaves everyone else with the bug. Contributing the fix upstream helps everyone.
      - text: Read CONTRIBUTING.md and search the issues; if none covers it, open one describing the bug and your proposed fix.
        why: Correct. Agreeing on the approach first avoids wasted work, and many projects require an issue before a pull request.
    answer: 3
  - q: What's the difference between a label and a GitHub Project?
    options:
      - text: Labels only work on pull requests; Projects only work on issues.
        why: Both labels and Projects work with issues and pull requests.
      - text: A label tags an individual issue or pull request; a Project is a view across many of them with its own fields, boards and layouts.
        why: Correct. Labels like `bug` categorise items; a Project arranges items (even from several repositories) into a table, board or roadmap.
      - text: They're the same feature with different names.
        why: Labels are simple tags on one repository's items. Projects add custom fields, views and automation across items.
    answer: 1
  - q: You opened a pull request from your fork's `main` branch. While waiting for review, you start an unrelated fix and commit it to `main` too. What happens?
    options:
      - text: The unrelated fix appears in your open pull request, because the pull request tracks your `main`.
        why: Correct. A pull request shows every commit on its branch. Give each contribution its own branch so changes stay separate.
      - text: Nothing; the pull request froze its commits when you opened it.
        why: Pull requests follow their branch, which is why pushing to it updates them.
      - text: GitHub rejects the push because a pull request is open.
        why: Open pull requests don't lock their branches. The push succeeds and the pull request grows.
      - text: The new commit goes into the original repository directly.
        why: You don't have write access to the original. Nothing reaches it except through a merged pull request.
    answer: 0
---

The portfolio is on GitHub and changes reach `main` through pull requests. Two questions remain. How do you keep track of what to do next, without a sticky note on your monitor? And how do you contribute to a project you don't own, where you can't even push a branch? GitHub answers the first with issues and Projects, and the second with forks.

## Issues: work you can link to

An **issue** is a tracked piece of work: a bug, a feature idea, a question. Each gets a number shared with pull requests (`#12`), a discussion thread, and metadata:

- **Labels** categorise it: `bug`, `enhancement`, `documentation`, `good first issue`.
- **Assignees** say who's on it.
- **Milestones** group issues toward a goal, such as "Launch v1".

For your portfolio, write the to-do list as issues: "Projects page: filter by tag (#12)", "Footer overlaps content on mobile (#13)". Then each pull request names its issue with `Closes #12`, merging closes it, and six months later anyone can follow the trail from a line of code to the commit, the pull request, the discussion and the original reason.

A good bug report has steps to reproduce, what you expected, what happened, and the browser or version. Repositories can add issue templates in `.github/ISSUE_TEMPLATE/` so reporters fill those sections in automatically.

## Projects: the board above the issues

A **GitHub Project** is a planning view over issues and pull requests, possibly from several repositories. It starts as a spreadsheet-like table; you add custom fields such as Status, Priority, Size or Iteration, and switch between **table**, **board** (columns by Status, the familiar kanban) and **roadmap** (items on a timeline) layouts. Built-in workflows can move items automatically, for example to Done when an issue closes or a pull request merges.

For a solo portfolio, a board with Todo, In progress and Done is plenty. On a team, the Project is where planning conversations happen and the issues hold the detail.

## Forks: contributing without write access

Say you've found a typo in the docs of an open-source theme library, `open-themes/vite-themes`. You can clone it, but you can't push to it: you're not a collaborator, and `git push` fails with a permission error. That's what forks solve.

A **fork** is your own copy of the repository on GitHub, under your account: `maya-okafor/vite-themes`. You can push anything to it. When your change is ready, you open a pull request from a branch on your fork to the original repository, which by convention is called **upstream**.

:::figure The fork workflow: fetch from upstream, push to origin, pull request back
<svg viewBox="0 0 700 290" role="img" aria-labelledby="t1">
  <title id="t1">Three repositories in a triangle. Top left: upstream, open-themes/vite-themes on GitHub. Top right: origin, your fork maya-okafor/vite-themes on GitHub. Bottom: your local clone. The fork button copies upstream to origin. Your clone fetches from upstream and pushes branches to origin. A pull request goes from origin to upstream.</title>
  <rect class="d-box-primary" x="20" y="20" width="250" height="70" rx="12"/>
  <text class="d-label-strong" x="145" y="48" text-anchor="middle">upstream</text>
  <text class="d-code" x="145" y="72" text-anchor="middle">open-themes/vite-themes</text>
  <rect class="d-box-accent" x="430" y="20" width="250" height="70" rx="12"/>
  <text class="d-label-strong" x="555" y="48" text-anchor="middle">origin (your fork)</text>
  <text class="d-code" x="555" y="72" text-anchor="middle">maya-okafor/vite-themes</text>
  <rect class="d-box" x="225" y="200" width="250" height="70" rx="12"/>
  <text class="d-label-strong" x="350" y="228" text-anchor="middle">Your local clone</text>
  <text class="d-code" x="350" y="252" text-anchor="middle">~/code/vite-themes</text>
  <path class="d-arrow" d="M270 40 L426 40" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="348" y="32" text-anchor="middle">Fork</text>
  <path class="d-arrow d-dashed" d="M430 75 L274 75" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="352" y="100" text-anchor="middle">pull request</text>
  <path class="d-arrow" d="M120 92 L250 196" marker-end="url(#arrow)"/>
  <text class="d-code" x="30" y="160">git fetch upstream</text>
  <path class="d-arrow" d="M450 196 L560 94" marker-end="url(#arrow)"/>
  <text class="d-code" x="520" y="160">git push origin</text>
</svg>
:::

Here's the whole routine:

```bash
# 1. Click Fork on github.com/open-themes/vite-themes, then clone YOUR fork
git clone git@github.com:maya-okafor/vite-themes.git
cd vite-themes

# 2. Remember where the original lives
git remote add upstream https://github.com/open-themes/vite-themes.git
git remote -v    # origin = your fork, upstream = the original

# 3. Work on a branch, never on main
git switch -c fix-readme-typo
git commit -am "Fix typo in installation steps"
git push -u origin fix-readme-typo
```

GitHub then offers "Compare & pull request" on your fork. Check that the base repository is `open-themes/vite-themes` and the base branch is their `main`. The CLI shortcut for steps 1 and 2 is `gh repo fork open-themes/vite-themes --clone`, which also sets up the `upstream` remote for you.

Leave "Allow edits by maintainers" ticked when you open the pull request. It lets maintainers push small fixes to your branch instead of asking you for every tweak.

## Keeping your fork current

The original keeps moving. Bring its changes into your fork before starting each new branch:

```bash
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main
```

Because you never commit on your fork's `main`, this is always a fast-forward. The **Sync fork** button on your fork's GitHub page, or `gh repo sync maya-okafor/vite-themes`, updates the GitHub copy; you still pull it locally. (Plain `gh repo sync` with no argument updates your local clone instead.)

:::mistake Working on your fork's main
If you commit to `main` on your fork, your pull request is tied to `main`, every later commit joins it, and syncing with upstream stops being a fast-forward. Keep `main` as a clean mirror of upstream and give each contribution its own branch.
:::

## Being a welcome contributor

Before writing code, read the project's **README** and **CONTRIBUTING.md** (setup, tests, style, whether an issue is required first) and its code of conduct. Search existing issues and pull requests; your bug may already be known or fixed. For anything bigger than a typo, open or comment on an issue and agree on the approach before writing code. Issues labelled `good first issue` are deliberately picked as starting points.

Then keep the pull request small, follow the project's conventions even where you'd choose differently, make sure its tests pass, and answer review comments patiently. Maintainers are often volunteers. A focused, well-described pull request that's easy to say yes to is the best introduction you can make.

That completes the collaboration toolkit. In the last section you'll pick up the habits that make all of this safe: undoing mistakes, keeping the repository clean, writing history people can read, and letting automation guard `main`.
