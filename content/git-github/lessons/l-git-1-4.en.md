---
summary: Read a repository's history with git log, git show and git diff, name any commit relative to HEAD, and picture history as a graph of snapshots linked to their parents.
takeaways:
  - History is a directed acyclic graph, each commit pointing to its parent, and a merge commit pointing to two.
  - "`git log --oneline --graph --all` draws the graph in the terminal, including branches you're not on."
  - "`git show <commit>` prints one commit's message and changes; `git show <commit>:<path>` prints a file as it was then."
  - "`HEAD~1` is the commit before the one you're on, `HEAD~3` three steps back along first parents."
  - "`git diff A B` compares any two snapshots, and `-- <path>` limits it to one file."
further:
  - title: Viewing the Commit History (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History
  - title: git log reference
    url: https://git-scm.com/docs/git-log
  - title: gitrevisions (naming commits)
    url: https://git-scm.com/docs/gitrevisions
quiz:
  - q: "`git log` on `main` doesn't show a commit you made on your `dark-mode` branch. Why?"
    options:
      - text: The commit was lost because you switched branches.
        why: Switching branches never deletes commits. The commit is still there, pointed at by `dark-mode`.
      - text: "`git log` only shows commits reachable from HEAD by following parents, and that commit isn't."
        why: Correct. `main` doesn't lead back to it. `git log --all` or `git log dark-mode` will show it.
      - text: "`git log` hides commits until they're pushed."
        why: Git doesn't care about pushing when it shows local history. Unpushed commits appear like any others.
      - text: You need `git log -p` to see commits from other branches.
        why: "`-p` adds each commit's diff to the output. It doesn't change which commits are listed."
    answer: 1
  - q: You want to see `styles.css` exactly as it was two commits ago, without changing any files. Which command does that?
    options:
      - text: "`git restore styles.css~2`"
        why: "`~2` applies to commits, not file names, and `git restore` writes into your working tree, which you didn't want."
      - text: "`git log -2 styles.css`"
        why: This lists the last two commits that touched the file. It shows messages, not the file's contents.
      - text: "`git diff HEAD~2`"
        why: This shows changes between that commit and your working tree, not the file's full content.
      - text: "`git show HEAD~2:styles.css`"
        why: Correct. `<commit>:<path>` names a file inside a snapshot, and `git show` prints it without touching your files.
    answer: 3
  - q: How many parents does a merge commit that joins `dark-mode` into `main` have?
    options:
      - text: Two, the commit `main` was on and the commit `dark-mode` was on.
        why: Correct. Two parents is what makes it a merge, and it's why the graph joins at that point.
      - text: One, the commit `main` was on before the merge.
        why: A single parent is an ordinary commit. A merge records both histories it joins.
      - text: None, because a merge commit starts a new history.
        why: Only the very first commit in a repository (the root commit) has no parent.
    answer: 0
  - q: Which command lists only the commits whose changes added or removed the text `dark-mode`?
    options:
      - text: "`git log --grep dark-mode`"
        why: "`--grep` searches commit messages, not the code changes inside commits."
      - text: "`git diff dark-mode`"
        why: That compares your working tree against the `dark-mode` branch. It doesn't list commits.
      - text: "`git log -S dark-mode`"
        why: Correct. The pickaxe option `-S` finds commits that changed how many times the string appears, which is how you hunt down when something was added or removed.
      - text: "`git show dark-mode`"
        why: That shows the commit the `dark-mode` branch points to, if such a branch exists.
    answer: 2
---

Your portfolio has a handful of commits now. Six months from now it will have hundreds, and the question you'll actually ask is never "what's the history?" but something sharper: when did the footer break, what did this file look like before the redesign, which commit added that colour. Reading history well is how you answer those in seconds.

## The everyday view

Plain `git log` prints every commit, newest first, with full IDs and dates. It's thorough and tiring. This is the version to remember:

```bash
git log --oneline --graph --all
```

```text
*   e5d81c0 (HEAD -> main) Merge branch 'dark-mode'
|\
| * d4a7f20 (dark-mode) Add dark mode colors
* | c39be11 Add projects page
|/
* b2e04f3 Add navigation bar with base styles
* a1c9d72 Add home page
```

Read it bottom to top for chronology. Each `*` is a commit; the lines show which commit came from which. In parentheses are labels: `main` and `dark-mode` are branches, and `HEAD -> main` means you're on `main`. `--all` matters: without it, Git shows only commits reachable from where you are, and the `dark-mode` line would still be there only because it was merged.

Long output opens in a pager. Use the arrow keys or space to scroll and `q` to quit.

Useful filters, all combinable: `-n 5` (last five), `--stat` (which files changed), `-p` (full diffs), `--author="Maya"`, `--since="2 weeks ago"`, and `-- index.html` (only commits that touched that file).

## Commits form a graph

The output above is a drawing of a **directed acyclic graph**, or DAG. Directed, because each commit points to its parent. Acyclic, because you can't follow parents and end up where you started; a commit can't be its own ancestor. Most commits have one parent. The root commit has none. A **merge commit** has two.

:::figure The same history as a commit graph
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">Commits a1c9 and b2e0 in a row, then the line splits: c39b on the main line and d4a7 on the dark-mode line. Both lead to merge commit e5d8, which has two parents. The main label and HEAD point to e5d8; the dark-mode label points to d4a7. Arrows point from each commit to its parent.</title>
  <circle class="d-box" cx="60" cy="110" r="26"/>
  <text class="d-code" x="60" y="115" text-anchor="middle">a1c9</text>
  <circle class="d-box" cx="190" cy="110" r="26"/>
  <text class="d-code" x="190" y="115" text-anchor="middle">b2e0</text>
  <circle class="d-box" cx="330" cy="60" r="26"/>
  <text class="d-code" x="330" y="65" text-anchor="middle">c39b</text>
  <circle class="d-box" cx="330" cy="170" r="26"/>
  <text class="d-code" x="330" y="175" text-anchor="middle">d4a7</text>
  <circle class="d-box-primary" cx="480" cy="110" r="26"/>
  <text class="d-code" x="480" y="115" text-anchor="middle">e5d8</text>
  <path class="d-arrow" d="M164 110 L90 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M305 70 L218 102" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M305 160 L218 120" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M455 100 L360 66" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M455 120 L360 164" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="560" y="70" width="110" height="34" rx="8"/>
  <text class="d-code" x="615" y="92" text-anchor="middle">main</text>
  <rect class="d-box-warn" x="560" y="20" width="110" height="34" rx="8"/>
  <text class="d-code" x="615" y="42" text-anchor="middle">HEAD</text>
  <path class="d-line" d="M615 54 L615 70"/>
  <path class="d-line" d="M560 92 L508 106"/>
  <rect class="d-box-accent" x="400" y="200" width="120" height="34" rx="8"/>
  <text class="d-code" x="460" y="222" text-anchor="middle">dark-mode</text>
  <path class="d-line" d="M400 205 L356 178"/>
</svg>
:::

Keep this picture in your head. In section 2 you'll see that a branch is nothing more than one of those labels, and every branching command moves a label or adds a circle.

## Naming commits

You can name any commit by its ID, and Git accepts the shortest unambiguous prefix, usually 7 characters. IDs are hashes of the commit's content, metadata and parent, so they never change, and in practice two different commits never share one.

Counting from where you are is often easier:

- `HEAD` is the commit you're on.
- `HEAD~1` (or `HEAD~`) is its parent, `HEAD~3` is three generations back, following the first parent each time.
- `HEAD^2` is the *second* parent of a merge commit; on `e5d81c0` above, that's `d4a7f20`.
- A branch name works anywhere a commit does: `dark-mode~1` is `b2e04f3`.

## Looking inside commits

```bash
git show c39be11              # message, author, date and the diff it introduced
git show HEAD~2:styles.css    # the whole file as it was in that snapshot
git diff a1c9d72 HEAD         # everything that changed between two snapshots
git diff HEAD~3 HEAD -- styles.css   # the same, for one file only
```

`git diff` takes any two commits because each is a complete snapshot. The diff is calculated on demand by comparing them. The same goes for the diff `git show` prints: it's this commit's snapshot compared with its parent's.

## A real investigation

Here's how these commands combine. A friend tells you the footer on your projects page has disappeared, and you're sure it was there last week. Start by narrowing the history to the file that matters:

```bash
git log --oneline --since="1 week ago" -- projects.html
```

```text
8f1e2aa Move project cards into a grid
c39be11 Add projects page
```

Two suspects. Look at the newer one in full:

```bash
git show 8f1e2aa -- projects.html
```

The diff shows the `<footer>` block in red, removed along with the old list markup. That's your culprit, found in under a minute. To grab the old footer markup without rewinding anything, print the file as it was in the parent commit and copy what you need:

```bash
git show 8f1e2aa~1:projects.html
```

Nothing in this investigation changed a single file or commit. Reading history is always safe, so do it freely and often. Most "Git emergencies" I've seen were really reading problems: someone panicked before looking at the graph, and the answer was already sitting in `git log`.

:::tip Find the commit that added something
`git log -S "dark-mode" --oneline` lists commits that added or removed the string `dark-mode` anywhere in the code. When you need to know when and why a line appeared, this pickaxe search beats scrolling through `git log -p`.
:::

:::mistake Thinking git log shows everything
`git log` starts at HEAD and follows parents backwards. Commits on other branches that haven't been merged aren't reachable from there, so they don't appear, and people conclude their work is gone. Add `--all`, or name the branch: `git log --oneline dark-mode`.
:::

You've seen labels like `main` and `dark-mode` sitting on commits. Section 2 starts with what those labels really are and why creating one costs almost nothing.
