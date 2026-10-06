---
summary: Connect your portfolio to a GitHub repository, push branches with upstream tracking, and keep in sync using fetch and pull while understanding what origin/main really is.
takeaways:
  - A remote is a named URL for another copy of the repository; `origin` is the conventional name for the one you cloned from or push to.
  - "`origin/main` is your local record of where `main` was on the remote at your last fetch; it moves only when you fetch, pull or push."
  - "`git push -u origin <branch>` uploads a branch and sets it as the upstream, so later a bare `git push` or `git pull` knows where to go."
  - "`git fetch` downloads without touching your branches; `git pull` fetches and then merges or rebases."
  - "A rejected push means the remote has commits you don't; pull them in, then push again, never force."
further:
  - title: Working with Remotes (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes
  - title: Remote Branches (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches
  - title: Pushing commits to a remote repository
    url: https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository
  - title: git pull reference
    url: https://git-scm.com/docs/git-pull
quiz:
  - q: You ran `git fetch` and it downloaded two new commits on `main`. What changed in your working tree?
    options:
      - text: Your files now include the two new commits' changes.
        why: That's what `git pull` does in its second step. `git fetch` alone never touches your files or branches.
      - text: Your local `main` moved forward by two commits.
        why: Fetch updates remote-tracking branches like `origin/main`, never your own `main`.
      - text: The two commits were merged and a merge commit was created.
        why: No merge happens on fetch. You choose when and how to integrate.
      - text: Nothing; only `origin/main` moved, and your files and `main` are unchanged.
        why: Correct. Fetching is always safe. Compare with `git log main..origin/main` before deciding to merge or rebase.
    answer: 3
  - q: "`git push` fails with: `Updates were rejected because the remote contains work that you do not have locally.` What's the right fix?"
    options:
      - text: Run `git pull` to bring in the remote commits, resolve anything that conflicts, then `git push` again.
        why: Correct. The remote has commits you lack; integrate them first, and your push becomes a fast-forward.
      - text: Run `git push --force` so your version wins.
        why: That would delete the commits someone else pushed. Force-pushing is never the fix for a shared branch being ahead.
      - text: Delete your local repository and clone it again.
        why: You'd lose your unpushed commits. Pulling integrates both sides without losing anything.
      - text: Run `git push -u origin main` to reset the tracking.
        why: Tracking isn't the problem. The remote branch has moved on and your push can't fast-forward it.
    answer: 0
  - q: What does `-u` add to `git push -u origin footer`?
    options:
      - text: It uploads untracked files along with the commits.
        why: Pushes only ever send commits. Untracked files aren't part of any commit.
      - text: It makes the push faster by skipping verification.
        why: "`-u` stands for `--set-upstream`. It has nothing to do with speed or checks."
      - text: It records `origin/footer` as the upstream of your local `footer`, so later `git push` and `git pull` need no arguments.
        why: Correct. It's needed once per branch; afterwards `git status` also reports ahead/behind counts against `origin/footer`.
      - text: It updates every branch on the remote, not only `footer`.
        why: Only the branch you name is pushed. `--all` exists for pushing every branch.
    answer: 2
  - q: Your local `main` has one commit you haven't pushed, and `origin/main` has two you haven't pulled. With `pull.rebase` set to `true`, what does `git pull` do?
    options:
      - text: Creates a merge commit joining your commit and the two remote ones.
        why: That's the behaviour with `pull.rebase false`. With `true`, Git rebases instead of merging.
      - text: Fetches, then replays your unpushed commit on top of the two remote commits.
        why: Correct. History stays linear, and only your own unpushed commit is rewritten, which respects the golden rule.
      - text: Refuses, because the branches have diverged.
        why: That's what `pull.ff only` does. `pull.rebase true` handles divergence by rebasing.
    answer: 1
---

So far the portfolio exists in one place, your laptop. If the disk dies, it's gone, and nobody else can see or review it. A **remote** is another copy of the repository somewhere else, usually on GitHub. Git's job is to keep the two in sync, and it does that with four main commands: `clone`, `fetch`, `pull` and `push`.

## Put the portfolio on GitHub

On github.com, create a new repository named `portfolio`. Leave "Add a README" and the other initialisation options unticked: your local repository already has history, and an extra commit on GitHub would give you two unrelated histories to reconcile. GitHub then shows the commands to connect an existing repository. They boil down to:

```bash
git remote add origin https://github.com/maya-okafor/portfolio.git
git remote -v
git push -u origin main
```

`git remote add` gives a URL a short name. **origin** is only a convention, the name Git uses automatically when you clone, but everyone uses it, so do too. The push uploads your commits and creates `main` on GitHub. The first time, Git will ask you to authenticate; the next lesson covers setting that up properly with SSH keys or a credential manager.

If you use the GitHub CLI, `gh repo create portfolio --public --source=. --remote=origin --push` does the whole thing in one go.

Starting from the other side, with a repository that already exists on GitHub, you clone it instead:

```bash
git clone https://github.com/maya-okafor/portfolio.git
```

Clone creates the folder, downloads every commit, adds a remote called `origin` and checks out `main` with tracking already set up.

## Remote-tracking branches: Git's memory of the remote

After the push, `git branch -a` shows something new:

```text
* main
  remotes/origin/main
```

`origin/main` is a **remote-tracking branch**: your repository's note of where `main` was on `origin` the last time you talked to it. You never commit to it. It moves only when you fetch, pull or push. That's why `git status` can say "Your branch is up to date with 'origin/main'" while a teammate pushed five minutes ago: Git hasn't asked GitHub since.

:::figure Your branch, your note about the remote, and the remote itself
<svg viewBox="0 0 700 270" role="img" aria-labelledby="t1">
  <title id="t1">Left, your laptop: main points at c3; origin/main, your last-known copy, points at b2. Right, GitHub: main points at d4, a commit a teammate pushed. git fetch downloads d4 and moves origin/main; git pull then also integrates it into your main; git push sends your commits and moves GitHub's main.</title>
  <rect class="d-box" x="20" y="20" width="330" height="230" rx="14"/>
  <text class="d-label-strong" x="40" y="48">Your laptop</text>
  <circle class="d-box" cx="70" cy="130" r="22"/>
  <text class="d-code" x="70" y="135" text-anchor="middle">b2</text>
  <circle class="d-box-primary" cx="170" cy="130" r="22"/>
  <text class="d-code" x="170" y="135" text-anchor="middle">c3</text>
  <path class="d-line" d="M148 130 L92 130"/>
  <rect class="d-box-accent" x="135" y="70" width="70" height="30" rx="8"/>
  <text class="d-code" x="170" y="90" text-anchor="middle">main</text>
  <rect class="d-box-warn" x="25" y="175" width="100" height="30" rx="8"/>
  <text class="d-code" x="75" y="195" text-anchor="middle">origin/main</text>
  <path class="d-line" d="M70 152 L70 175"/>
  <text class="d-label-muted" x="40" y="236">origin/main: last seen at b2</text>
  <rect class="d-box" x="440" y="20" width="240" height="230" rx="14"/>
  <text class="d-label-strong" x="460" y="48">GitHub (origin)</text>
  <circle class="d-box" cx="490" cy="130" r="22"/>
  <text class="d-code" x="490" y="135" text-anchor="middle">b2</text>
  <circle class="d-box-success" cx="600" cy="130" r="22"/>
  <text class="d-code" x="600" y="135" text-anchor="middle">d4</text>
  <path class="d-line" d="M578 130 L512 130"/>
  <rect class="d-box-accent" x="565" y="70" width="70" height="30" rx="8"/>
  <text class="d-code" x="600" y="90" text-anchor="middle">main</text>
  <text class="d-label-muted" x="460" y="200">d4: a teammate's push</text>
  <path class="d-arrow" d="M440 110 L354 110" marker-end="url(#arrow)"/>
  <text class="d-code" x="397" y="100" text-anchor="middle">fetch</text>
  <path class="d-arrow" d="M354 160 L440 160" marker-end="url(#arrow)"/>
  <text class="d-code" x="397" y="182" text-anchor="middle">push</text>
</svg>
:::

## Upstreams and git push -u

The `-u` in `git push -u origin main` (long form `--set-upstream`) records that your local `main` **tracks** `origin/main`. From then on:

- a bare `git push` or `git pull` on `main` knows where to go;
- `git status` reports "ahead 2" or "behind 1" against `origin/main`;
- `git branch -vv` lists each branch with its upstream and ahead/behind counts.

Every new branch needs it once, on its first push: `git push -u origin footer`.

## Fetch, then pull

`git fetch` asks the remote what's new, downloads the commits and moves your remote-tracking branches. It never touches your own branches or files, so it's always safe:

```bash
git fetch
git status                       # "Your branch is behind 'origin/main' by 1 commit"
git log --oneline main..origin/main   # what's new over there
```

`git pull` is `git fetch` followed by integrating the upstream into your current branch. If you have no local commits of your own, that's a fast-forward. If both sides have new commits, Git has to merge or rebase, and recent Git versions refuse to guess:

```text
fatal: Need to specify how to reconcile divergent branches.
```

Make the choice once:

```bash
git config --global pull.rebase true    # replay my unpushed commits on top (my default)
# or: git config --global pull.rebase false   (create a merge commit)
# or: git config --global pull.ff only        (refuse unless it's a fast-forward)
```

I recommend `pull.rebase true`. It only rewrites your own unpushed commits, which the golden rule allows, and it keeps history free of "Merge branch 'main' of github.com:…" commits that say nothing.

## A daily rhythm

Put these together and a working session on the portfolio looks the same every time. Start by switching to `main` and pulling, so you begin from what's actually on GitHub rather than what was there last week. Create a branch for the change. Commit as you go, and push the branch early, even unfinished: a pushed branch is a backup, and it's visible to anyone helping you. Before you open it for review, fetch again and rebase onto the fresh `origin/main` if it has moved. That habit alone prevents most of the rejected pushes and surprise conflicts people blame on Git.

```bash
git switch main && git pull
git switch -c projects-filter
# …work and commit…
git push -u origin projects-filter
```

## When push is rejected

If someone pushed to `main` since your last fetch, your push is refused:

```text
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/maya-okafor/portfolio.git'
```

The remote has commits you don't. Pull them in, resolve any conflict with the routine from section 2, run your checks, and push again.

:::mistake Forcing past a rejected push
The rejection exists because pushing would throw away someone else's commits. `git push --force` does exactly that, and it's the single most common way people lose a teammate's work. On a shared branch the fix is always `git pull`, then `git push`.
:::

:::tip Keep your branch list honest
When branches are deleted on GitHub after merging, your `origin/footer` notes linger. `git fetch --prune` removes them, and `git config --global fetch.prune true` makes every fetch do it.
:::

Your first push asked for credentials. Next you'll set up authentication properly, so Git stops asking and GitHub knows it's really you.
