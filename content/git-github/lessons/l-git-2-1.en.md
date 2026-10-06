---
summary: Create, switch, rename and delete branches knowing that each is a movable pointer to a commit, and recover cleanly from a detached HEAD.
takeaways:
  - A branch is a tiny file holding one commit ID; creating one copies nothing and takes milliseconds.
  - HEAD names the branch you're on, and each new commit moves that branch forward while HEAD comes along.
  - "`git switch -c <name>` creates a branch at the current commit and switches to it in one step."
  - A detached HEAD points straight at a commit; save any work made there with `git switch -c <name>` before leaving.
  - "`git restore --source=<branch> <file>` copies one file from another branch without switching to it."
further:
  - title: Branches in a Nutshell (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell
  - title: git switch reference
    url: https://git-scm.com/docs/git-switch
  - title: git branch reference
    url: https://git-scm.com/docs/git-branch
quiz:
  - q: You're on `main` at commit `b2e0` and run `git switch -c footer`, then commit `f1a3`. Where do `main` and `footer` point now?
    options:
      - text: Both point at `f1a3`, because they were created from the same commit.
        why: Branches don't stay linked. Only the branch HEAD is attached to moves when you commit.
      - text: "`main` points at `f1a3` and `footer` at `b2e0`."
        why: That's reversed. You switched to `footer`, so `footer` is the one that moves.
      - text: Neither moved; branches only move when you push.
        why: Committing moves the current branch immediately. Pushing is about copying commits to a remote.
      - text: "`main` still points at `b2e0`; `footer` moved to `f1a3`."
        why: Correct. HEAD was attached to `footer`, so the new commit advanced `footer` and left `main` where it was.
    answer: 3
  - q: What does the file `.git/HEAD` contain while you're on the `footer` branch?
    options:
      - text: "`ref: refs/heads/footer`"
        why: Correct. HEAD normally holds the name of a branch, not a commit ID. That indirection is what lets commits move the branch.
      - text: The 40-character ID of the latest commit on `footer`.
        why: That's what the branch file `.git/refs/heads/footer` holds. HEAD points at the branch, and the branch points at the commit.
      - text: A list of every branch in the repository.
        why: "`git branch` builds that list by reading the branch files. HEAD stores only where you are."
    answer: 0
  - q: You checked out an old commit to look around, made a quick fix and committed it. Git says you're in "detached HEAD" state. How do you keep that commit?
    options:
      - text: Run `git switch main`; the commit comes with you.
        why: Switching away leaves the commit behind with no branch pointing at it. It becomes easy to lose and is eventually garbage-collected.
      - text: Nothing to do; every commit is kept on `main` automatically.
        why: In detached HEAD, new commits belong to no branch at all, which is exactly the risk.
      - text: Run `git switch -c old-fix` to put a branch on it.
        why: Correct. A branch pointing at the commit makes it reachable, so it's safe. You can merge it later.
      - text: Run `git commit --attach`.
        why: There's no `--attach` option. Attaching work to history means creating a branch at it.
    answer: 2
  - q: Your `dark-mode` branch has a finished `styles.css` you want on `footer` too, without merging the rest of `dark-mode`. You're on `footer`. Which command does it?
    options:
      - text: "`git switch dark-mode styles.css`"
        why: "`git switch` changes branches. It doesn't take file paths."
      - text: "`git restore --source=dark-mode styles.css`"
        why: Correct. It writes `styles.css` from the `dark-mode` snapshot into your working tree; then you review, stage and commit it on `footer`.
      - text: "`git branch dark-mode styles.css`"
        why: That form tries to create a branch named `dark-mode` starting at a commit called `styles.css`, which fails.
      - text: "`git merge dark-mode -- styles.css`"
        why: Merges always combine whole commits. There's no way to merge a single file.
    answer: 1
---

In older version control systems a branch was a full copy of the project, slow to make and painful to combine, so people avoided them. In Git a branch costs almost nothing. That changes how you work: every idea, fix or experiment on your portfolio can get its own branch, and throwing one away is as cheap as making it.

## A branch is a sticky note

Look inside your repository:

```bash
cat .git/refs/heads/main
```

```text
c39be1142d6f0a8e7b1c5d93e2f4a0b6c8d7e912
```

That's the whole `main` branch: a file containing one commit ID. A **branch** is a named, movable pointer to a commit. The history behind it isn't stored in the branch; it's found by following parent links from that commit, as you did in the last lesson.

So how does Git know which branch you're on? Another small file:

```bash
cat .git/HEAD
```

```text
ref: refs/heads/main
```

**HEAD** is a pointer to a pointer. It normally names a branch, and that branch names a commit. When you commit, Git creates the new commit with the current one as its parent, then moves the branch HEAD names to the new commit. HEAD itself doesn't change; it's still "on `main`", and `main` has moved forward.

You don't need to read these files day to day (in older or busier repositories, branch IDs may be packed into `.git/packed-refs` instead), but seeing them once removes the mystery. Everything in this section is about moving these sticky notes around a graph.

## Making and moving between branches

Your next portfolio change is a site footer. Give it a branch:

```bash
git switch -c footer
```

```text
Switched to a new branch 'footer'
```

`-c` creates the branch at your current commit and switches to it. The two-step version is `git branch footer` followed by `git switch footer`. Now commit some work:

```bash
git add index.html styles.css
git commit -m "Add site footer with contact links"
```

:::figure Committing moves the branch that HEAD is attached to
<svg viewBox="0 0 700 260" role="img" aria-labelledby="t1">
  <title id="t1">Before: commits a1c9, b2e0, c39b in a row; main and footer both point at c39b; HEAD points at footer. After committing: a new commit f1a3 follows c39b; footer and HEAD moved to f1a3; main stayed on c39b.</title>
  <text class="d-label-strong" x="20" y="30">Before</text>
  <circle class="d-box" cx="60" cy="90" r="24"/>
  <text class="d-code" x="60" y="95" text-anchor="middle">a1c9</text>
  <circle class="d-box" cx="150" cy="90" r="24"/>
  <text class="d-code" x="150" y="95" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="240" cy="90" r="24"/>
  <text class="d-code" x="240" y="95" text-anchor="middle">c39b</text>
  <path class="d-line" d="M126 90 L84 90"/>
  <path class="d-line" d="M216 90 L174 90"/>
  <rect class="d-box-accent" x="200" y="130" width="80" height="30" rx="8"/>
  <text class="d-code" x="240" y="150" text-anchor="middle">main</text>
  <rect class="d-box-accent" x="200" y="170" width="80" height="30" rx="8"/>
  <text class="d-code" x="240" y="190" text-anchor="middle">footer</text>
  <rect class="d-box-warn" x="200" y="210" width="80" height="30" rx="8"/>
  <text class="d-code" x="240" y="230" text-anchor="middle">HEAD</text>
  <path class="d-line" d="M240 114 L240 130"/>
  <text class="d-label-strong" x="370" y="30">After git commit</text>
  <circle class="d-box" cx="400" cy="90" r="24"/>
  <text class="d-code" x="400" y="95" text-anchor="middle">a1c9</text>
  <circle class="d-box" cx="490" cy="90" r="24"/>
  <text class="d-code" x="490" y="95" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="580" cy="90" r="24"/>
  <text class="d-code" x="580" y="95" text-anchor="middle">c39b</text>
  <circle class="d-box-primary" cx="660" cy="90" r="24"/>
  <text class="d-code" x="660" y="95" text-anchor="middle">f1a3</text>
  <path class="d-line" d="M466 90 L424 90"/>
  <path class="d-line" d="M556 90 L514 90"/>
  <path class="d-line" d="M636 90 L604 90"/>
  <rect class="d-box-accent" x="540" y="130" width="80" height="30" rx="8"/>
  <text class="d-code" x="580" y="150" text-anchor="middle">main</text>
  <path class="d-line" d="M580 114 L580 130"/>
  <rect class="d-box-accent" x="620" y="170" width="80" height="30" rx="8"/>
  <text class="d-code" x="660" y="190" text-anchor="middle">footer</text>
  <rect class="d-box-warn" x="620" y="210" width="80" height="30" rx="8"/>
  <text class="d-code" x="660" y="230" text-anchor="middle">HEAD</text>
  <path class="d-line" d="M660 114 L660 170"/>
</svg>
:::

`main` is untouched. Switch back and the footer disappears from your files; switch to `footer` again and it returns:

```bash
git switch main      # working tree now matches main's snapshot
git switch footer    # and now footer's
git switch -         # back to whichever branch you were on before
```

Switching rewrites the files in your working tree to match the target snapshot. Uncommitted changes come along if they don't clash with the target. If they would be overwritten, Git refuses to switch and tells you to commit or stash first. That refusal is protecting you; don't look for a way around it. Commit the work, or wait for the stash lesson in section 4.

:::tip Branch even when you work alone
It's tempting to commit straight to `main` on a solo project. A branch per change keeps `main` always deployable: if the footer turns out badly, you delete the branch and nothing on `main` ever knew about it. It's also the exact habit pull requests need in section 3, so practise it now while the stakes are low.
:::

## Housekeeping

```bash
git branch                 # list local branches; * marks the current one
git branch -v              # with the commit each points to
git branch -m footer site-footer   # rename
git branch -d site-footer  # delete, only if its work is merged
git branch -D experiment   # force-delete, merged or not
```

`-d` refuses to delete a branch whose commits aren't merged into your current branch (or into the branch's upstream, once it has one), which is a useful safety net. `-D` skips the check. Use it only when you're sure the work is unwanted.

Name branches for what they do: `footer`, `fix-mobile-nav`, `projects-grid`. Many teams add a prefix such as `feat/` or `fix/`; slashes are allowed in branch names.

## Borrowing one file from another branch

Sometimes you want one file from another branch without the rest of its work. `git restore` can read from any commit:

```bash
git restore --source=dark-mode styles.css
```

That overwrites `styles.css` in your working tree with the version on `dark-mode`. Check it with `git diff`, then stage and commit it on your current branch. You'll still see older tutorials use `git checkout` for both switching and restoring; Git 2.23 split those two jobs into `git switch` and `git restore`, which are harder to confuse.

## Detached HEAD

You can point HEAD straight at a commit instead of a branch, to look at an old version of the site:

```bash
git switch --detach a1c9d72
```

Git warns you're in **detached HEAD** state. Looking around is perfectly safe. The risk is committing there: new commits belong to no branch, so when you switch away, nothing points at them and they quietly drop out of `git log`.

:::mistake Committing in detached HEAD, then switching away
You check out an old commit, fix something, commit, run `git switch main`, and the fix seems gone. Before switching away, run `git switch -c old-fix` to put a branch on your new commit. If you already switched, Git printed the lost commit's ID as a warning; `git switch -c old-fix <that-id>` rescues it. The reflog in section 4 finds it even if you missed the warning.
:::

Your `footer` branch is ready and `main` hasn't moved. Next you'll bring the two together with a merge.
