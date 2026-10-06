---
summary: Park unfinished work with git stash and bring it back later, and write a .gitignore that keeps dependencies, build output, secrets and OS clutter out of your repository.
takeaways:
  - "`git stash push -m \"…\"` saves your uncommitted changes and cleans the working tree; `git stash pop` brings them back and removes the stash."
  - "`git stash` skips untracked files unless you add `-u` (`--include-untracked`)."
  - "`.gitignore` only affects untracked files; to stop tracking a committed file, run `git rm --cached` and commit."
  - "In `.gitignore`, a trailing `/` matches directories only, a leading `/` anchors to that folder, and `!` re-includes a file."
  - A secret that was ever committed and pushed must be revoked and replaced, because history still contains it.
further:
  - title: git stash reference
    url: https://git-scm.com/docs/git-stash
  - title: gitignore pattern format
    url: https://git-scm.com/docs/gitignore
  - title: Ignoring files (GitHub Docs)
    url: https://docs.github.com/en/get-started/git-basics/ignoring-files
quiz:
  - q: You're halfway through the contact form when an urgent typo fix is needed on `main`. `git switch main` refuses because it would overwrite your changes. What's the quickest clean route?
    options:
      - text: Delete your changes with `git restore .`, fix the typo, and redo the form later.
        why: That throws away real work to save a few seconds. Stash keeps it safely.
      - text: "`git stash push -m \"contact form wip\"`, switch to `main`, fix and commit, switch back, `git stash pop`."
        why: Correct. The stash holds your half-done work while the working tree is clean, and pop brings it back where you left off.
      - text: Force the switch with `git switch -f main`.
        why: "`-f` throws away your local changes to make the switch, exactly what you wanted to avoid."
      - text: Commit the half-finished form to `main` with the message "WIP".
        why: You'd be putting broken work on `main`. If you want a WIP commit, make it on your feature branch.
    answer: 1
  - q: You stashed, switched branches, and came back. `git stash pop` restored your edits to `contact.html` but your new file `contact.js` is missing. Why?
    options:
      - text: "`git stash pop` restores files in the order they were edited and stopped early."
        why: Pop restores everything in the stash at once. The file was never in the stash.
      - text: The file was deleted by switching branches.
        why: Switching leaves untracked files alone. It was the stash that skipped it, which is why it may still be in your folder.
      - text: Stashes expire after one branch switch.
        why: Stashes stay until you drop or pop them. `git stash list` shows them.
      - text: "`git stash` doesn't include untracked files unless you pass `-u`, so `contact.js` was left behind in the working tree."
        why: Correct. Untracked files aren't stashed by default. Check the working tree, it's probably there, and use `git stash -u` next time.
    answer: 3
  - q: You committed `.env` last week. Today you add `.env` to `.gitignore`, but `git status` still shows `.env` as modified. Why?
    options:
      - text: "`.gitignore` only applies to untracked files, and `.env` is already tracked; run `git rm --cached .env` and commit."
        why: Correct. `--cached` removes it from the index (so future commits don't include it) while leaving the file on disk.
      - text: The pattern needs to be `/.env/` to work.
        why: A trailing slash makes a pattern match only directories, so `/.env/` wouldn't match the file at all.
      - text: "`.gitignore` changes take effect only after a push."
        why: Ignore rules apply immediately, locally. The problem is that tracked files are never ignored.
    answer: 0
  - q: "Which `.gitignore` line ignores the `dist` folder at the project root but not a `src/dist/` folder?"
    options:
      - text: "`dist`"
        why: Without a slash at the start or middle, the pattern matches `dist` at any depth, including `src/dist`.
      - text: "`**/dist/`"
        why: "`**/` means at any depth, so this also matches `src/dist/`."
      - text: "`/dist/`"
        why: Correct. The leading slash anchors the pattern to the folder containing the `.gitignore`, and the trailing slash limits it to directories.
      - text: "`!dist`"
        why: "`!` re-includes a previously ignored path; on its own it ignores nothing."
    answer: 2
---

Two small tools keep a working tree under control. `git stash` gives you a drawer for work that isn't ready to commit. `.gitignore` tells Git which files it should never track at all. Both prevent the same kind of accident: the wrong thing ending up in a commit.

## Stash: a drawer for unfinished work

You're halfway through the portfolio's contact form on the `contact-form` branch when someone points out a typo on the live home page. You need `main`, now. But `git switch main` refuses, because your edits to `index.html` would be overwritten, and you don't want to commit a half-built form.

Stash it:

```bash
git stash push -m "contact form: fields done, validation next"
git status        # nothing to commit, working tree clean
```

Your changes, staged and unstaged, are saved in a stash entry and removed from the working tree. Now fix the typo:

```bash
git switch main
# fix, commit, push
git switch contact-form
git stash pop
```

`pop` reapplies the most recent stash and deletes it. You're back exactly where you were.

The other stash commands you'll use:

```bash
git stash list                  # stash@{0}: On contact-form: contact form: fields done…
git stash show -p stash@{0}     # the diff inside a stash
git stash apply stash@{1}       # reapply but keep the stash
git stash drop stash@{1}        # delete one stash
git stash push -u -m "…"        # include untracked (new) files too
```

That last flag matters. By default stash only saves changes to **tracked** files. A brand-new `contact.js` stays in your folder, untouched, which surprises people when they pop and it isn't "restored". Use `-u` whenever you've created files.

Stashes aren't tied to a branch: you can pop one onto any branch, which is occasionally handy and occasionally a surprise. If you realise the stashed work deserves its own branch after all, `git stash branch contact-validation` creates a branch at the commit where you stashed, applies the stash there and drops it, which sidesteps conflicts with anything that has changed since.

If `pop` hits a conflict, Git applies what it can, marks the conflict as usual, and keeps the stash instead of dropping it. Resolve, `git add`, and run `git stash drop` once you're sure.

:::tip Stash is for minutes, not weeks
A stash has no branch and no pull request, and an old one with a vague message is a mystery. For anything you'll leave overnight, make a commit on your branch instead (`git commit -m "WIP: contact validation"`) and amend or squash it later. Use `-m` on every stash so `git stash list` tells you what each one is.
:::

## .gitignore: files Git should never track

Some files belong in your project folder but never in history:

- dependencies you can reinstall, such as `node_modules/`;
- build output you can regenerate, such as `dist/`;
- secrets and machine-specific settings, such as `.env`;
- clutter from your OS and editor, such as `.DS_Store` on macOS.

List them in a file called `.gitignore` at the repository root and commit it, so everyone on the project shares the rules:

```text title=.gitignore
# Dependencies
node_modules/

# Build output
/dist/

# Local environment and secrets
.env
.env.*
!.env.example

# OS and editor files
.DS_Store
*.log
```

Ignored files disappear from `git status` and `git add .` skips them.

## How patterns work

Each line is a pattern, matched against paths relative to the `.gitignore` file's folder:

- `#` starts a comment, but only at the beginning of a line. Blank lines are ignored.
- `*.log` matches any file ending in `.log`, in any folder.
- A trailing `/` matches directories only: `node_modules/`.
- A leading `/` anchors the pattern to this folder: `/dist/` ignores the root `dist` but not `src/dist`.
- `**/` matches any depth: `**/fixtures/*.json`.
- `!` re-includes something an earlier line excluded: `!.env.example` keeps the template for other developers. It can't re-include a file whose parent *folder* is excluded, because Git never looks inside an ignored folder.

When a file is ignored and you don't know why, ask Git:

```bash
git check-ignore -v dist/app.js
```

```text
.gitignore:5:/dist/	dist/app.js
```

It prints the file, line number and pattern responsible.

For clutter that only your machine creates, don't burden every project's `.gitignore`. Git also reads a global ignore file, `~/.config/git/ignore`, which is a good home for `.DS_Store` and editor folders. GitHub keeps a collection of starter `.gitignore` templates for most languages, and offers one when you create a repository.

## Ignoring doesn't untrack

`.gitignore` only affects **untracked** files. If `.env` was committed before you ignored it, Git keeps tracking it. Remove it from the index and commit, which keeps your local file:

```bash
git rm --cached .env
git commit -m "Stop tracking .env"
```

:::mistake Ignoring a secret after pushing it
If `.env` with an API key was pushed even once, it's in the repository's history and in every clone, and adding it to `.gitignore` changes none of that. Treat the key as leaked: revoke it with the provider and issue a new one. Then untrack the file. GitHub's push protection blocks many known secret formats at push time, but it's a safety net, not a plan; write `.gitignore` before the first commit.
:::

Your working tree is now clean and your repository holds only what it should. Next you'll make what it holds readable: commit messages, tags and releases.
