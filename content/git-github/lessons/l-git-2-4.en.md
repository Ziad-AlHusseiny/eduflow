---
summary: Rebase a feature branch onto main to keep history linear, handle conflicts mid-rebase, tidy commits interactively, and know when the golden rule says to merge instead.
takeaways:
  - "`git rebase main` replays your branch's commits on top of `main`'s tip, creating new commits with new IDs."
  - After a rebase, merging the branch into `main` is a fast-forward, so history stays a straight line.
  - "During a rebase conflict, fix the file, `git add` it, then `git rebase --continue`; `git rebase --abort` undoes the whole rebase."
  - The golden rule is to never rebase commits that other people may have already built on; rebase only your own unshared work.
  - "If you must update a branch you already pushed, use `git push --force-with-lease`, never a plain `--force`."
further:
  - title: Rebasing (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Rebasing
  - title: git rebase reference
    url: https://git-scm.com/docs/git-rebase
  - title: About Git rebase (GitHub Docs)
    url: https://docs.github.com/en/get-started/using-git/about-git-rebase
quiz:
  - q: Your branch `projects-grid` has commits `d4` and `e5`. You run `git rebase main` on it. What happens to `d4` and `e5`?
    options:
      - text: They're moved, keeping their IDs, to sit after `main`'s tip.
        why: Commits can't move, because a commit's ID includes its parent. New parent means a new commit.
      - text: They're merged into one commit on `main`.
        why: Rebase doesn't squash by default and doesn't touch `main`. It rewrites the branch you're on.
      - text: Git creates new commits with the same changes on top of `main`; the branch points to those, and the originals become unreferenced.
        why: Correct. The replayed commits (often written `d4'` and `e5'`) have new IDs. The originals are still in the reflog for a while.
      - text: They're deleted and you have to recommit the work.
        why: Rebase replays your changes automatically. Nothing needs to be redone by hand unless there's a conflict.
    answer: 2
  - q: Mid-rebase, Git reports a conflict in `projects.html`. You've edited the file into shape. What do you run next?
    options:
      - text: "`git commit -m \"Fix conflict\"`"
        why: During a rebase, Git makes the commits itself. Committing by hand adds an extra commit and confuses the replay.
      - text: "`git add projects.html`, then `git rebase --continue`"
        why: Correct. Staging marks the conflict resolved; `--continue` finishes that commit and replays the rest.
      - text: "`git merge --continue`"
        why: You're in a rebase, not a merge. Each operation has its own continue command.
      - text: "`git rebase main` again from the start"
        why: A rebase is already in progress, so Git refuses to start another. Continue or abort the current one.
    answer: 1
  - q: "Which situation breaks the golden rule of rebasing?"
    options:
      - text: Rebasing your local, never-pushed `footer` branch onto `main`.
        why: Nobody else has these commits, so rewriting them affects only you. This is rebase's ideal use.
      - text: Using `git rebase -i HEAD~3` to squash typo fixes before opening a pull request.
        why: Tidying your own unshared commits is exactly what interactive rebase is for.
      - text: Running `git pull --rebase` to put your unpushed commits after your teammates' new ones.
        why: That rewrites only your local, unpushed commits, so it's safe and common.
      - text: Rebasing the shared `main` branch and force-pushing it while teammates have work built on it.
        why: Correct. Their commits sit on top of the old IDs you just replaced, so their next pull produces duplicates and confusing conflicts.
    answer: 3
  - q: You rebased your own pull request branch, and `git push` is now rejected as non-fast-forward. What's the safe way to update it?
    options:
      - text: "`git push --force-with-lease`"
        why: Correct. It overwrites the remote branch only if it's still where you last saw it, so you won't silently wipe out a commit someone else pushed since your last fetch.
      - text: "`git push --force`"
        why: That overwrites the remote no matter what, including commits a reviewer pushed since your last fetch.
      - text: "`git pull` and then push."
        why: Pulling merges the old commits back in next to their rebased copies, leaving duplicates in the branch.
    answer: 0
---

In the last two lessons, combining branches meant merging, and a diverged history earned a merge commit. That's honest and safe, but on a busy repository `git log --graph` starts to look like a train map. Rebasing is the other way to combine work: instead of joining two lines, it moves your line so there's only one.

## What rebase does

Your `projects-grid` branch split from `main` at `b2`. Since then `main` gained `c3` and your branch has `d4` and `e5`. From the branch, run:

```bash
git switch projects-grid
git rebase main
```

```text
Successfully rebased and updated refs/heads/projects-grid.
```

Git found the commits on your branch that aren't on `main` (`d4`, `e5`), set them aside, moved your branch to `main`'s tip, and replayed each change on top, one commit at a time.

The replayed commits are **new commits**. Same changes and messages, different parents, so different IDs. That's not a detail; it's the whole story of when rebase is safe. A commit's ID includes its parent, so you can't move a commit, only make a copy somewhere else.

:::figure Rebase replays your commits on a new base
<svg viewBox="0 0 700 280" role="img" aria-labelledby="t1">
  <title id="t1">Before: b2 has two children, c3 on main and d4 then e5 on projects-grid. After rebase: main still ends at c3; new commits d4-prime and e5-prime follow c3 in a straight line, and projects-grid points to e5-prime. The old d4 and e5 are greyed out and unreferenced.</title>
  <text class="d-label-strong" x="20" y="28">Before</text>
  <circle class="d-box" cx="50" cy="100" r="22"/>
  <text class="d-code" x="50" y="105" text-anchor="middle">b2</text>
  <circle class="d-box" cx="150" cy="60" r="22"/>
  <text class="d-code" x="150" y="65" text-anchor="middle">c3</text>
  <circle class="d-box" cx="150" cy="140" r="22"/>
  <text class="d-code" x="150" y="145" text-anchor="middle">d4</text>
  <circle class="d-box" cx="240" cy="140" r="22"/>
  <text class="d-code" x="240" y="145" text-anchor="middle">e5</text>
  <path class="d-line" d="M130 68 L70 92"/>
  <path class="d-line" d="M130 132 L70 108"/>
  <path class="d-line" d="M218 140 L172 140"/>
  <text class="d-code" x="180" y="55">main</text>
  <text class="d-code" x="180" y="185">projects-grid</text>
  <text class="d-label-strong" x="350" y="28">After git rebase main</text>
  <circle class="d-box" cx="380" cy="100" r="22"/>
  <text class="d-code" x="380" y="105" text-anchor="middle">b2</text>
  <circle class="d-box" cx="470" cy="100" r="22"/>
  <text class="d-code" x="470" y="105" text-anchor="middle">c3</text>
  <circle class="d-box-primary" cx="560" cy="100" r="22"/>
  <text class="d-code" x="560" y="105" text-anchor="middle">d4'</text>
  <circle class="d-box-primary" cx="650" cy="100" r="22"/>
  <text class="d-code" x="650" y="105" text-anchor="middle">e5'</text>
  <path class="d-line" d="M448 100 L402 100"/>
  <path class="d-line" d="M538 100 L492 100"/>
  <path class="d-line" d="M628 100 L582 100"/>
  <text class="d-code" x="450" y="70">main</text>
  <text class="d-code" x="600" y="148">projects-grid</text>
  <circle class="d-box d-dashed" cx="470" cy="210" r="22"/>
  <text class="d-label-muted" x="470" y="215" text-anchor="middle">d4</text>
  <circle class="d-box d-dashed" cx="560" cy="210" r="22"/>
  <text class="d-label-muted" x="560" y="215" text-anchor="middle">e5</text>
  <path class="d-line d-dashed" d="M448 202 L395 120"/>
  <path class="d-line d-dashed" d="M538 210 L492 210"/>
  <text class="d-label-muted" x="380" y="262">Old commits: no branch points to them now</text>
</svg>
:::

Now `main` is an ancestor of your branch, so bringing the work in is a fast-forward:

```bash
git switch main
git merge projects-grid    # Fast-forward
```

History is a straight line, as if you'd started the grid after the typo fix.

## Conflicts during a rebase

Because rebase replays commits one at a time, a conflict stops it at a specific commit. The routine is the one you learned for merges, with different words at the end:

```bash
# Git stops: CONFLICT (content): Merge conflict in projects.html
# edit projects.html, remove the markers, check it
git add projects.html
git rebase --continue      # finish this commit, replay the next
```

`git rebase --abort` returns the branch to exactly where it was before you started. `git rebase --skip` drops the commit that's conflicting, which is rarely what you want.

One surprise: during a rebase, "ours" and "theirs" swap. You're replaying your commits onto `main`, so HEAD (the top half of a conflict) is `main`'s side, and your commit is the bottom half. Read the labels, not your instincts.

## Tidying with interactive rebase

Before you share a branch, you can rewrite its commits. `git rebase -i` opens a to-do list in your editor:

```bash
git rebase -i main
```

```text
pick 4b1e2c0 Add projects grid
pick 9a3d7f1 fix typo
pick c2e8b44 Grid gap on mobile
```

Change a word in front of a commit and save. `reword` edits its message, `squash` or `fixup` folds it into the commit above (keeping or discarding its message), `drop` deletes it, and reordering lines reorders commits. Changing `pick 9a3d7f1` to `fixup 9a3d7f1` turns three commits into two clean ones. This is how professionals keep "fix typo" commits out of a pull request.

## The golden rule

Rebasing replaces commits with copies. That's harmless when you're the only one who has them. It's a mess when someone else has already built on the originals: their history still contains `d4` and `e5`, yours contains `d4'` and `e5'`, and the next pull produces duplicate commits and baffling conflicts.

So: **don't rebase commits that exist outside your repository and that people may have based work on.** In practice:

- Rebase freely on your own branches before you push or before anyone else touches them.
- Never rebase `main` or any branch other people pull from.
- Rebasing your own pull request branch after pushing it is common and fine if nobody else commits to it. Git will reject the normal push because history was rewritten, so use:

```bash
git push --force-with-lease
```

`--force-with-lease` overwrites the remote branch only if it still points where you last saw it. If a teammate pushed in the meantime, it refuses instead of erasing their work.

:::mistake Reaching for git push --force
Plain `--force` overwrites the remote branch unconditionally. If a reviewer pushed a fix to your branch an hour ago, it's gone, and nothing on your machine warns you. Make `--force-with-lease` your only force-push, and never force-push to `main`. In section 4 you'll make GitHub refuse such pushes altogether.
:::

## Merge or rebase?

| | Merge | Rebase |
|---|---|---|
| History | True record, with merge commits | Linear, as if work were sequential |
| Commit IDs | Unchanged | Rewritten |
| Safe on shared branches | Yes | No |
| Conflicts | Resolved once | May recur per replayed commit |

A sensible default: rebase your own feature branch onto `main` to stay current and tidy it before review; merge (often through a pull request) to land it. Many teams also set `git pull` to rebase your unpushed commits, which you'll configure in the next section, when your portfolio finally gets a remote.
