---
summary: Move changes deliberately between the working tree, the staging area and the repository, check each step with status and diff, and split messy work into focused commits.
takeaways:
  - The working tree is your files, the index (staging area) is the next commit being assembled, and the repository is the commits already recorded.
  - "`git diff` compares the working tree to the index; `git diff --staged` compares the index to the last commit."
  - "`git add -p` stages part of a file, so one messy editing session can become several focused commits."
  - "`git restore --staged <file>` unstages and keeps your edits; `git restore <file>` throws your unstaged edits away."
  - "`git commit -a` stages modified tracked files only; brand-new files still need `git add`."
further:
  - title: Recording Changes to the Repository (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
  - title: git restore reference
    url: https://git-scm.com/docs/git-restore
  - title: git add reference
    url: https://git-scm.com/docs/git-add
quiz:
  - q: You staged `index.html`, then edited it again. `git diff` shows only the second edit. Why?
    options:
      - text: Git lost the first edit when you saved the file again.
        why: Nothing is lost. The first edit is safely in the index; `git diff --staged` would show it.
      - text: "`git diff` only shows the most recent save of each file."
        why: Git doesn't track saves. It compares two whole states, and which two depends on the command.
      - text: "`git diff` compares the working tree to the index, and the first edit is already in the index."
        why: Correct. With the first edit staged, the only difference left between the file on disk and the index is the second edit.
      - text: The second `add` is required before `git diff` shows anything.
        why: "`git diff` shows unstaged changes, which is exactly what the second edit is. Staging it would make `git diff` show nothing."
    answer: 2
  - q: You ran `git add styles.css` but want it in the next commit after all, not this one. Which command keeps your edits and only unstages the file?
    options:
      - text: "`git restore --staged styles.css`"
        why: Correct. It copies the last committed version into the index, so the file is unstaged while your edits stay in the working tree.
      - text: "`git restore styles.css`"
        why: Without `--staged` this targets the working tree and replaces your file with the index version. Your edits would be gone.
      - text: "`git rm styles.css`"
        why: This stages the file's deletion and removes it from disk. That's the opposite of what you want.
      - text: "`git commit --skip styles.css`"
        why: There's no `--skip` option on `git commit`. Unstaging happens in the index before you commit.
    answer: 0
  - q: You created `projects.html` and edited `index.html`, then ran `git commit -am "Add projects page"`. What did the commit contain?
    options:
      - text: Both files, because `-a` means all files in the folder.
        why: "`-a` means all modified tracked files. A file Git has never tracked isn't included."
      - text: Nothing, because `-a` can't be combined with `-m`.
        why: "`-am` is a common and valid combination: stage tracked changes, then commit with this message."
      - text: Only `projects.html`, because it's the newer file.
        why: The age of a file doesn't matter to Git. What matters is whether it's tracked.
      - text: Only the `index.html` changes; `projects.html` is still untracked.
        why: Correct. `-a` skips untracked files, which is why the commit message now describes a page that isn't in the commit.
    answer: 3
  - q: In `git status -s`, what does the line `MM index.html` tell you?
    options:
      - text: The file was modified twice since the last commit.
        why: Git doesn't count edits. The two columns describe two different comparisons.
      - text: Some changes to the file are staged and other changes to it are not.
        why: Correct. The left column is the index versus the last commit, the right column is the working tree versus the index; both say modified.
      - text: The file has a merge conflict.
        why: Conflicts show up as `UU` (unmerged) in short status, not `MM`.
    answer: 1
---

You spent an evening on the portfolio. You added a navigation bar to `index.html`, created `styles.css`, and fixed a typo in your name along the way. That's three unrelated changes. If you commit them together as "updates", future you can't undo the nav without also undoing the typo fix. Git gives you a place to sort changes before they become history.

## Three places your work can be

Every change in a Git project lives in one of three places:

- The **working tree** is the files on disk, the ones your editor opens. You can change them freely; Git only watches.
- The **index**, also called the **staging area**, is the next commit being assembled. `git add` copies a file's current content into it.
- The **repository** is the commits already recorded, inside `.git`. `git commit` turns the index into a new commit.

:::figure Commands move content between the three areas
<svg viewBox="0 0 700 270" role="img" aria-labelledby="t1">
  <title id="t1">Three boxes left to right: working tree, index (staging area), repository. git add moves from working tree to index, git commit from index to repository. Below, git restore --staged moves from repository back to the index, and git restore moves from index back to the working tree.</title>
  <rect class="d-box" x="20" y="70" width="180" height="80" rx="12"/>
  <text class="d-label-strong" x="110" y="105" text-anchor="middle">Working tree</text>
  <text class="d-label-muted" x="110" y="128" text-anchor="middle">files on disk</text>
  <rect class="d-box-accent" x="260" y="70" width="180" height="80" rx="12"/>
  <text class="d-label-strong" x="350" y="105" text-anchor="middle">Index</text>
  <text class="d-label-muted" x="350" y="128" text-anchor="middle">next commit</text>
  <rect class="d-box-primary" x="500" y="70" width="180" height="80" rx="12"/>
  <text class="d-label-strong" x="590" y="105" text-anchor="middle">Repository</text>
  <text class="d-label-muted" x="590" y="128" text-anchor="middle">recorded commits</text>
  <path class="d-arrow" d="M200 90 L256 90" marker-end="url(#arrow)"/>
  <text class="d-code" x="228" y="55" text-anchor="middle">git add</text>
  <path class="d-arrow" d="M440 90 L496 90" marker-end="url(#arrow)"/>
  <text class="d-code" x="468" y="55" text-anchor="middle">git commit</text>
  <path class="d-arrow d-dashed" d="M500 140 C470 210 420 210 400 154" marker-end="url(#arrow)"/>
  <text class="d-code" x="470" y="230" text-anchor="middle">git restore --staged</text>
  <path class="d-arrow d-dashed" d="M260 140 C230 210 180 210 160 154" marker-end="url(#arrow)"/>
  <text class="d-code" x="200" y="230" text-anchor="middle">git restore</text>
  <text class="d-label-muted" x="350" y="262" text-anchor="middle">Dashed: copying back. git restore overwrites your file.</text>
</svg>
:::

After a commit, the index isn't emptied. It still holds the full snapshot you just committed, so it matches the last commit until you stage something new. That's why "staged changes" means the difference between the index and the last commit.

## Seeing the difference: status and two diffs

Here's the evening's work, checked with `git status`:

```text
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	styles.css

no changes added to commit (use "git add" and/or "git commit -a")
```

`git status` tells you which files differ. To see the lines, use `git diff`, and remember there are two comparisons:

```bash
git diff            # working tree vs index: what you haven't staged yet
git diff --staged   # index vs last commit: what the next commit will contain
```

`--cached` is an older synonym for `--staged`; you'll see both in tutorials. Get into the habit of running `git diff --staged` right before every commit. It's the last moment to notice a stray `console.log` or a file that doesn't belong.

## Splitting one file into two commits

The typo fix and the nav bar are both in `index.html`. `git add index.html` would stage both. Stage just the typo instead:

```bash
git add -p index.html
```

Git shows each changed block, called a hunk, and asks `Stage this hunk [y,n,q,a,d,s,e,?]?` (newer versions list a few more letters; `?` explains them all). Answer `y` for the typo hunk and `n` for the nav hunk (`s` splits a hunk that's too big). Then:

```bash
git diff --staged          # only the typo fix
git commit -m "Fix spelling of name in header"
git add index.html styles.css
git commit -m "Add navigation bar with base styles"
```

Two commits, each with one purpose. Later, if the nav bar needs to go, you can undo that commit alone.

## How big should a commit be?

A good commit does one thing you could describe in a short sentence without the word "and". "Fix spelling of name in header" passes. "Add nav, fix typo, tweak colours" fails, and the failure shows up later: when the colours turn out wrong, undoing that commit also removes the nav and brings back the typo.

There's no line limit. A commit that renames a CSS class across twelve files is still one idea, and splitting it would leave the site broken in between. Aim for commits where the project still works before and after, each one a step you could explain to a reviewer in one breath. You'll appreciate this in section 4, when undoing a single commit becomes a one-line command instead of an afternoon of surgery.

:::note Why Git has a staging area at all
Some version control systems commit every changed file at once. Git's index exists so that what you *did* (an evening of mixed edits) and what you *record* (clean, single-purpose steps) can be different. You don't have to use it cleverly every time, but it's there when your work gets messy.
:::

## Short status, and backing out

`git status -s` packs the same information into two columns: the left is the index versus the last commit, the right is the working tree versus the index.

```text
M  README.md
 M index.html
MM styles.css
?? projects.html
```

`README.md` is staged; `index.html` has unstaged changes; `styles.css` has some of each; `projects.html` is untracked.

To take a file out of the index without losing your edits, use `git restore --staged styles.css`. To throw away unstaged edits and go back to the index version, use `git restore styles.css`. The second one is the only command in this lesson that destroys work: changes that were never staged or committed can't be recovered.

:::mistake Trusting git commit -a with new files
`git commit -am "Add projects page"` stages every *modified tracked* file and commits. A brand-new `projects.html` is untracked, so it's silently left out and the message lies. Use `-a` only when `git status` shows no untracked files you care about, or run `git add` for new files first.
:::

You can now record exactly the history you mean to. Next you'll read that history back, and see why Git calls it a graph rather than a list.
