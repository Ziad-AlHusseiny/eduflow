---
summary: Merge a finished branch into main, predict whether Git will fast-forward or create a merge commit, and choose between the two on purpose with --no-ff and --ff-only.
takeaways:
  - You always merge another branch into the branch you're on; only the current branch moves.
  - If the current branch hasn't moved since the other branch started, Git fast-forwards the pointer and creates no new commit.
  - If both branches have new commits, Git does a three-way merge from their common ancestor and records a merge commit with two parents.
  - "`--no-ff` forces a merge commit to keep a feature grouped; `--ff-only` refuses anything but a fast-forward."
further:
  - title: Basic Branching and Merging (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
  - title: git merge reference
    url: https://git-scm.com/docs/git-merge
  - title: git merge-base reference
    url: https://git-scm.com/docs/git-merge-base
quiz:
  - q: You're on `main`. Since you created `footer` from it, `main` has gained no commits and `footer` has three. What does `git merge footer` do?
    options:
      - text: Moves `main` forward to `footer`'s latest commit without creating a new commit.
        why: Correct. `main` is an ancestor of `footer`, so Git can fast-forward the pointer. History stays a straight line.
      - text: Creates a merge commit with two parents.
        why: That happens only when both branches have moved, or when you ask for it with `--no-ff`.
      - text: Copies the three commits onto `main` with new IDs.
        why: That describes rebasing or cherry-picking. A merge reuses the existing commits.
      - text: Moves `footer` back to where `main` is.
        why: A merge never moves the branch you name, only the branch you're on.
    answer: 0
  - q: You meant to bring `dark-mode` into `main`, but you were on `dark-mode` and ran `git merge main`. What happened?
    options:
      - text: Nothing; Git detects you meant the other direction and swaps them.
        why: Git does exactly what you asked. Merge direction is decided by which branch you're on.
      - text: The command failed because you can't merge `main` into a feature branch.
        why: You can, and teams do it to bring a long-running branch up to date. It's legal, just not what you wanted here.
      - text: "`main` now contains the dark mode work."
        why: "`main` didn't move. Only the branch you're on, `dark-mode`, can change during a merge."
      - text: "`dark-mode` gained `main`'s new commits; `main` is unchanged."
        why: Correct. Switch to `main` with `git switch main` and run `git merge dark-mode` to merge in the direction you intended.
    answer: 3
  - q: Which commit does Git use as the starting point when it does a three-way merge of `dark-mode` into `main`?
    options:
      - text: The first commit in the repository.
        why: The root commit is usually far too old. Git wants the most recent shared point, to compare only what each side changed.
      - text: The most recent commit both branches share, their merge base.
        why: Correct. Git compares each branch tip with the merge base, takes changes made on either side, and flags places where both sides changed the same lines.
      - text: Whichever branch tip has the older timestamp.
        why: Timestamps don't decide anything in a merge. The graph does.
    answer: 1
  - q: Your team wants every feature to appear in `main`'s history as one merge commit, even when a fast-forward would be possible. Which option gives that?
    options:
      - text: "`git merge --ff-only feature`"
        why: That's the opposite policy. It allows only fast-forwards and refuses to create merge commits.
      - text: "`git merge --squash feature`"
        why: That stages the combined changes without committing or recording a second parent, so the branch link is lost.
      - text: "`git merge --no-ff feature`"
        why: Correct. It always records a merge commit, so the feature's commits stay grouped on their own line in the graph.
      - text: "`git merge --all feature`"
        why: "`git merge` has no `--all` option."
    answer: 2
---

You've got a finished `footer` branch and a `main` branch that doesn't have it yet. Merging is how work on one line of history joins another. Git has two ways to do it, and which one happens isn't random: you can predict it by looking at the graph before you type anything.

## The rule of direction

First, the rule that saves the most confusion: **you merge another branch into the branch you're on.** `git merge footer` means "bring `footer`'s work into my current branch." Only the current branch moves. The branch you named is left exactly where it was.

So the routine is always: switch to the branch that should receive the work, then merge.

```bash
git switch main
git merge footer
```

## Case 1: fast-forward

Since you made `footer`, nobody committed on `main`. Every commit on `main` is already in `footer`'s history. Git doesn't need to combine anything; it slides `main` forward to `footer`'s latest commit:

```text
Updating c39be11..f1a3b07
Fast-forward
 index.html |  8 ++++++++
 styles.css | 12 ++++++++++++
 2 files changed, 20 insertions(+)
```

That's a **fast-forward**: no new commit, just a pointer moving along existing commits. History stays a straight line, as if you'd worked on `main` all along.

## Case 2: a true merge

Now the more interesting case. While you built `dark-mode`, you also fixed a typo directly on `main`. Both branches have commits the other lacks; they've **diverged**. There's no straight line to slide along.

Git does a **three-way merge**. It finds the **merge base**, the most recent commit both branches share, and compares each branch tip with it. A change made on only one side is taken. Changes on both sides in different places are both taken. If both sides changed the same lines, Git stops and asks you; that's a conflict, and it gets the whole next lesson.

```bash
git switch main
git merge dark-mode
```

Git opens your editor with the message `Merge branch 'dark-mode'`. Save and close, and you'll see:

```text
Merge made by the 'ort' strategy.
 styles.css | 24 ++++++++++++++++++++++++
 1 file changed, 24 insertions(+)
```

`ort` is the name of Git's default merge algorithm; you don't need to choose it. The result is a **merge commit**: a commit with two parents, the previous `main` tip and the `dark-mode` tip. Its snapshot contains both lines of work.

:::figure Fast-forward versus merge commit
<svg viewBox="0 0 700 300" role="img" aria-labelledby="t1">
  <title id="t1">Top: main points at b2e0 and footer is two commits ahead on the same line, so merging slides main forward to f1a3 with no new commit. Bottom: main and dark-mode each have a new commit after b2e0, so merging creates merge commit m7c1 with two parents, and main moves to it.</title>
  <text class="d-label-strong" x="20" y="28">Fast-forward: main hasn't moved</text>
  <circle class="d-box" cx="60" cy="80" r="22"/>
  <text class="d-code" x="60" y="85" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="160" cy="80" r="22"/>
  <text class="d-code" x="160" y="85" text-anchor="middle">e9d2</text>
  <circle class="d-box" cx="260" cy="80" r="22"/>
  <text class="d-code" x="260" y="85" text-anchor="middle">f1a3</text>
  <path class="d-line" d="M138 80 L82 80"/>
  <path class="d-line" d="M238 80 L182 80"/>
  <text class="d-code" x="300" y="70">footer</text>
  <text class="d-code" x="300" y="92">main (after)</text>
  <text class="d-label-muted" x="40" y="128">main (before) was here, on b2e0</text>
  <path class="d-arrow d-dashed" d="M80 110 C140 125 220 125 250 106" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="20" y="175">Merge commit: both branches moved</text>
  <circle class="d-box" cx="60" cy="235" r="22"/>
  <text class="d-code" x="60" y="240" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="170" cy="200" r="22"/>
  <text class="d-code" x="170" y="205" text-anchor="middle">c39b</text>
  <circle class="d-box" cx="170" cy="272" r="22"/>
  <text class="d-code" x="170" y="277" text-anchor="middle">d4a7</text>
  <circle class="d-box-primary" cx="290" cy="235" r="22"/>
  <text class="d-code" x="290" y="240" text-anchor="middle">m7c1</text>
  <path class="d-line" d="M148 207 L80 228"/>
  <path class="d-line" d="M148 265 L80 242"/>
  <path class="d-line" d="M268 228 L192 207"/>
  <path class="d-line" d="M268 242 L192 265"/>
  <text class="d-code" x="325" y="240">main</text>
  <text class="d-code" x="200" y="296">dark-mode</text>
  <text class="d-label-muted" x="420" y="225">m7c1 has two parents:</text>
  <text class="d-label-muted" x="420" y="248">c39b (main) and d4a7</text>
</svg>
:::

## Choosing on purpose

Both results contain the same final files. What differs is how history reads, and teams have opinions.

- **Fast-forward** keeps history linear and quiet. Good for small changes, but after the fact you can't see which commits belonged to which feature.
- **Merge commits** keep each feature visibly grouped and record when it landed. The graph gets busier.

Two flags let you pick instead of letting the graph decide:

```bash
git merge --no-ff footer     # always create a merge commit, even if fast-forward is possible
git merge --ff-only footer   # fast-forward or refuse; never create a merge commit
```

My default for a solo portfolio: let Git fast-forward small branches, and don't agonise over it. On a team, follow the team's convention, which is usually set on GitHub rather than typed by hand. What matters far more than the policy is that each branch carries one coherent piece of work, so whichever shape history takes, every step in it makes sense.

`--ff-only` is a good safety habit when you only expect to catch up, for example updating your local `main`. If Git refuses, that's news: something diverged that you didn't know about. On GitHub you'll meet the same choice as merge methods on a pull request in section 3.

You can check the merge base yourself before merging, which tells you how far the branches have drifted:

```bash
git merge-base main dark-mode
git log --oneline main..dark-mode    # commits on dark-mode that main lacks
git log --oneline dark-mode..main    # and the reverse
```

If the second log is empty, `main` hasn't moved and the merge will fast-forward.

:::mistake Merging in the wrong direction
You're on `dark-mode`, you run `git merge main`, and wonder why `main` never got the dark theme. The merge went into the branch you were on. Run `git branch` (or check your prompt) before every merge, switch to the receiving branch, and merge from there. Merging `main` into a feature branch is a real technique for catching up, so Git won't stop you.
:::

## After the merge

Once `footer` is merged, the branch label has done its job. Delete it:

```bash
git branch -d footer
```

`-d` succeeds because the commits are reachable from `main`. The commits themselves stay in history forever; only the sticky note goes. Clean up merged branches as you go, and `git branch` stays a short list of work that's actually in progress.

So far every merge went smoothly because the two branches touched different lines. Next you'll make them collide on purpose and resolve the conflict step by step.
