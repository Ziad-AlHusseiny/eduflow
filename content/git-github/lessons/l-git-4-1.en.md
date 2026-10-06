---
summary: Choose the right undo for any mistake (restore, amend, revert or reset in its three modes) and use the reflog to recover commits you thought were gone.
takeaways:
  - Pick the undo by where the mistake lives (working tree, index, local commit or shared commit), not by which command you remember.
  - "`git revert <commit>` adds a new commit that cancels an old one, which is the safe way to undo anything already pushed."
  - "`git reset` moves the current branch: `--soft` keeps changes staged, `--mixed` keeps them unstaged, `--hard` discards them."
  - "`git commit --amend` replaces the last commit, so use it only before pushing."
  - "`git reflog` lists where HEAD has been, so commits lost to a reset or rebase can be found and restored for weeks afterwards."
further:
  - title: Undoing Things (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things
  - title: Reset Demystified (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified
  - title: git revert reference
    url: https://git-scm.com/docs/git-revert
  - title: git reflog reference
    url: https://git-scm.com/docs/git-reflog
quiz:
  - q: You committed "Add contact form" a minute ago, haven't pushed, and realise you forgot to stage `contact.css`. What's the cleanest fix?
    options:
      - text: "`git revert HEAD`, then commit again with both files."
        why: That leaves two extra commits (the original and its reversal) in history for a mistake nobody else has seen.
      - text: "`git reset --hard HEAD~1` and redo the work."
        why: "`--hard` discards the committed changes from your files. You'd be rewriting the form by hand."
      - text: "`git add contact.css`, then `git commit --amend --no-edit`."
        why: Correct. Amend replaces the unpushed last commit with one that includes the file; `--no-edit` keeps the message.
      - text: "`git restore --staged contact.css`"
        why: That unstages a file. `contact.css` isn't staged yet, and the commit would still be missing it.
    answer: 2
  - q: Yesterday you merged a commit to `main` that broke the mobile nav. It's pushed and your teammates have pulled. How do you undo it?
    options:
      - text: "`git revert <commit>` and push the new commit."
        why: Correct. Revert records a new commit that applies the opposite change, so nobody's history is rewritten and everyone gets the fix with a normal pull.
      - text: "`git reset --hard <commit>~1` and `git push --force`."
        why: That rewrites shared history. Teammates still have the bad commit, and their next push brings it back or creates a mess.
      - text: "`git commit --amend` to edit the bad commit away."
        why: Amend only touches your latest commit, creates a new ID, and would also need a force-push to a shared branch.
      - text: "`git restore --source=HEAD~1 .` and push without committing."
        why: Restoring files changes only your working tree. Nothing is pushed until it's committed.
    answer: 0
  - q: "You run `git reset --soft HEAD~2` on two unpushed commits. Where are their changes now?"
    options:
      - text: Deleted from your files.
        why: That's `--hard`. `--soft` never touches the index or the working tree.
      - text: In your working tree but unstaged.
        why: That's the default `--mixed` mode, which also resets the index.
      - text: Still in the two commits, which are now on a new branch.
        why: Reset doesn't create branches. It moves the current branch pointer.
      - text: Staged in the index, ready to be committed again as one commit.
        why: Correct. The branch moved back two commits but the index and files kept everything, a quick way to squash local commits.
    answer: 3
  - q: You ran `git reset --hard HEAD~3` by mistake and three commits vanished from `git log`. How do you get them back?
    options:
      - text: They're gone; `--hard` deletes commits permanently.
        why: Reset moves a pointer. The commits still exist, and the reflog remembers where HEAD was.
      - text: Run `git reflog`, find the entry from before the reset, and `git reset --hard HEAD@{1}`.
        why: Correct. `HEAD@{1}` means where HEAD was one move ago, which is right before the reset.
      - text: Run `git revert HEAD~3`.
        why: Revert creates a new commit undoing a change. It doesn't restore lost commits to your branch.
      - text: Run `git pull`, which restores any missing commits.
        why: Only if they were pushed. Pull fetches what's on the remote; unpushed commits exist only in your local repository.
    answer: 1
---

Everyone breaks something in Git eventually. You commit to the wrong branch, push a bug, reset away a morning's work. The good news: Git almost never throws data away, and nearly every mistake has a clean undo. The trap is reaching for whichever undo command you half-remember. Pick by asking one question: **where does the mistake live?**

## Pick the tool by location

| Where the mistake is | Command | Rewrites history? |
|---|---|---|
| Unstaged edits in a file | `git restore <file>` | No (but discards the edits) |
| Staged, not committed | `git restore --staged <file>` | No |
| Last commit, not pushed | `git commit --amend` | Yes, your local commit only |
| Local commits, not pushed | `git reset` | Yes, local only |
| Commits already pushed and shared | `git revert <commit>` | No |

The table follows a single rule: once other people have a commit, you add new commits on top instead of changing it.

## Amend: fix the last commit

Forgot a file or wrote a bad message, and haven't pushed?

```bash
git add contact.css
git commit --amend --no-edit              # same message, file included
git commit --amend -m "Add contact form"  # or a new message
```

Amend doesn't edit the commit; it replaces it with a new one with a new ID. That's fine locally and a problem if you've pushed, for the same reason rebase is.

## Revert: undo in public

You merged a commit to `main` that broke the mobile nav. It's pushed, and teammates have pulled. Don't rewrite anything. Add a commit that reverses it:

```bash
git revert HEAD          # if it's the latest commit
git revert 8f1e2aa       # or any commit by ID
```

Git creates a new commit, `Revert "Move nav into header"`, that applies the exact opposite changes. History still shows the mistake and its fix, which is honest and safe: everyone gets the revert with a normal pull. To revert a merge commit, tell Git which parent to keep as the mainline, usually the first: `git revert -m 1 <merge-commit>`.

Sometimes only part of a commit was wrong. If the nav move was fine except for `styles.css`, you don't need to revert the whole thing. Bring that one file back to how it was before the commit, check it, and commit the result as an ordinary fix:

```bash
git restore --source=8f1e2aa~1 styles.css
git diff
git commit -am "Restore mobile nav styles"
```

That's still "adding history, not rewriting it", just with a smaller scope.

## Reset: move the branch, three ways

`git reset <commit>` moves the current branch to another commit. What it does to the index and working tree depends on the mode, and this is where people get hurt.

:::figure The three reset modes and the three areas
<svg viewBox="0 0 700 260" role="img" aria-labelledby="t1">
  <title id="t1">A table of three rows. reset --soft moves the branch only; index and working tree keep the changes, which are now staged. reset --mixed, the default, moves the branch and resets the index; the working tree keeps the changes, now unstaged. reset --hard moves the branch and resets both index and working tree, so the changes are discarded.</title>
  <text class="d-label-strong" x="190" y="30" text-anchor="middle">Branch (HEAD)</text>
  <text class="d-label-strong" x="380" y="30" text-anchor="middle">Index</text>
  <text class="d-label-strong" x="570" y="30" text-anchor="middle">Working tree</text>
  <text class="d-code" x="20" y="82">--soft</text>
  <rect class="d-box-primary" x="120" y="55" width="140" height="44" rx="8"/>
  <text class="d-label" x="190" y="82" text-anchor="middle">moved</text>
  <rect class="d-box-success" x="310" y="55" width="140" height="44" rx="8"/>
  <text class="d-label" x="380" y="82" text-anchor="middle">kept</text>
  <rect class="d-box-success" x="500" y="55" width="140" height="44" rx="8"/>
  <text class="d-label" x="570" y="82" text-anchor="middle">kept</text>
  <text class="d-code" x="20" y="142">--mixed</text>
  <rect class="d-box-primary" x="120" y="115" width="140" height="44" rx="8"/>
  <text class="d-label" x="190" y="142" text-anchor="middle">moved</text>
  <rect class="d-box-primary" x="310" y="115" width="140" height="44" rx="8"/>
  <text class="d-label" x="380" y="142" text-anchor="middle">reset</text>
  <rect class="d-box-success" x="500" y="115" width="140" height="44" rx="8"/>
  <text class="d-label" x="570" y="142" text-anchor="middle">kept</text>
  <text class="d-code" x="20" y="202">--hard</text>
  <rect class="d-box-primary" x="120" y="175" width="140" height="44" rx="8"/>
  <text class="d-label" x="190" y="202" text-anchor="middle">moved</text>
  <rect class="d-box-primary" x="310" y="175" width="140" height="44" rx="8"/>
  <text class="d-label" x="380" y="202" text-anchor="middle">reset</text>
  <rect class="d-box-warn" x="500" y="175" width="140" height="44" rx="8"/>
  <text class="d-label-strong" x="570" y="202" text-anchor="middle">overwritten</text>
  <text class="d-label-muted" x="350" y="248" text-anchor="middle">--mixed is the default when you give no mode</text>
</svg>
:::

Three situations, three modes:

```bash
git reset --soft HEAD~2    # squash: the last two commits' changes become staged, ready for one commit
git reset HEAD~1           # un-commit (--mixed): changes return as unstaged edits to rework
git reset --hard HEAD~1    # discard: the commit and its changes are gone from the branch and files
```

A classic use: you committed to `main` when you meant to be on a branch. Commit or stash any uncommitted edits first (`--hard` would wipe them), create the branch where you are, then move `main` back:

```bash
git branch contact-form        # the branch keeps your commit
git reset --hard origin/main   # main goes back to match GitHub
git switch contact-form
```

:::mistake Using reset on pushed commits
`git reset` on a branch you've already pushed makes your local branch disagree with GitHub, and the only way to publish it is a force-push that rewrites everyone else's history. If the commit is shared, use `git revert`. Reserve `reset` for commits that have never left your machine.
:::

:::tip Make a bookmark before anything risky
Before a reset, a big rebase or any command you're unsure of, run `git branch backup-nav`. It costs nothing, and if the result isn't what you wanted, `git reset --hard backup-nav` takes you straight back. Delete the bookmark with `git branch -D backup-nav` once you're happy.
:::

## The reflog: Git's flight recorder

Here's the safety net that makes all of this less frightening. Every time HEAD moves (commit, switch, reset, rebase, merge), Git writes a line in the **reflog**:

```bash
git reflog
```

```text
2b7f0c1 (HEAD -> main) HEAD@{0}: reset: moving to HEAD~3
9e4a1d5 HEAD@{1}: commit: Add contact form validation
4c8b2e7 HEAD@{2}: commit: Add contact form
a71d3f0 HEAD@{3}: checkout: moving from footer to main
```

After that accidental `git reset --hard HEAD~3`, the three commits aren't on any branch, but they still exist and `HEAD@{1}` points at the newest. Bring them back:

```bash
git reset --hard HEAD@{1}          # put main back where it was
# or, more cautiously, keep them on a new branch to inspect first
git switch -c rescue 9e4a1d5
```

The reflog is local (it isn't pushed or cloned) and entries expire: by default after 90 days, or 30 days for commits no branch can reach. That's plenty of time to notice a mistake.

What the reflog can't save is work that was never committed. `git restore` and `git reset --hard` overwrite uncommitted edits in your files, and no log knows about them. So the real safety habit is simple: commit early and often on your branch. You can always squash commits before review; you can't recover edits you never committed.

Some work-in-progress isn't ready for a commit, though. Next you'll park it with `git stash`, and stop Git from tracking files it never should.
