---
summary: Write commit messages that explain why, follow the Conventional Commits format when a team uses it, mark versions with annotated tags, and publish a GitHub Release with generated notes.
takeaways:
  - A good subject line is short, imperative and specific ("Fix footer overlap on mobile"); the body, after a blank line, explains why.
  - "Conventional Commits prefix the subject with a type such as `feat`, `fix` or `docs`, which lets tools derive version numbers and changelogs."
  - "Annotated tags (`git tag -a v1.0.0 -m \"…\"`) record who tagged what and when; they're the right kind for releases."
  - "`git push` doesn't send tags; push them with `git push origin v1.0.0` or `git push --follow-tags`."
  - A GitHub Release is a tag plus notes and optional files, and GitHub can generate the notes from merged pull requests.
further:
  - title: Git Basics, Tagging (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Basics-Tagging
  - title: Commit Guidelines (Pro Git)
    url: https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines
  - title: About releases
    url: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
  - title: Automatically generated release notes
    url: https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes
quiz:
  - q: Which subject line best follows common Git conventions?
    options:
      - text: "`Fixed some bugs.`"
        why: Past tense, a full stop, and "some bugs" tells a future reader nothing about what changed.
      - text: "`Changes to the footer, nav, colours and the contact form so it works on phones now`"
        why: Far too long for a subject, and it lists four changes, which suggests four commits.
      - text: "`WIP`"
        why: Fine as a temporary local commit you'll squash, but meaningless once it's in shared history.
      - text: "`Fix footer overlapping content on mobile`"
        why: Correct. Imperative, specific, under 50 characters. It completes the sentence "If applied, this commit will…".
    answer: 3
  - q: "Under Conventional Commits and semantic versioning, which change should bump version 1.4.2 to 2.0.0?"
    options:
      - text: "`fix: correct contrast on dark mode links`"
        why: A fix maps to a patch release, 1.4.3.
      - text: "`feat: add tag filter to projects page`"
        why: A new feature maps to a minor release, 1.5.0.
      - text: "`feat!: rename the data-theme attribute to data-color-scheme`"
        why: Correct. The `!` (or a `BREAKING CHANGE:` footer) marks a breaking change, which maps to a major release.
      - text: "`docs: explain how to run the HTML check`"
        why: Documentation changes don't affect the published behaviour and usually don't trigger a release at all.
    answer: 2
  - q: You ran `git tag -a v1.0.0 -m "Portfolio launch"` and `git push`. The tag isn't on GitHub. Why?
    options:
      - text: "`git push` doesn't push tags by default; run `git push origin v1.0.0` (or `git push --follow-tags`)."
        why: Correct. Tags are pushed explicitly, so you don't accidentally publish experimental ones.
      - text: Annotated tags can't be pushed; only lightweight tags can.
        why: Both kinds can be pushed. Annotated tags are the recommended kind for releases.
      - text: GitHub only accepts tags created through its Releases page.
        why: GitHub accepts any pushed tag, and a release can be created from it afterwards.
      - text: The tag name needs to start with `release-`.
        why: Tag names are free-form. `v1.0.0` is the common convention.
    answer: 0
  - q: What's the main advantage of an annotated tag over a lightweight tag for a release?
    options:
      - text: Annotated tags can point at any commit; lightweight tags only at HEAD.
        why: Both kinds can point at any commit. Give the commit ID after the tag name.
      - text: An annotated tag is a full object with tagger, date and message, so the release records who marked it and why.
        why: Correct. A lightweight tag is only a name for a commit, like a branch that never moves.
      - text: Annotated tags move forward with new commits, like branches.
        why: Neither kind of tag moves. That's the point of a tag.
    answer: 1
---

Six months from now you'll run `git log` on your portfolio looking for when the dark theme broke, and you'll be reading messages written by past you. "updates", "fix", "asdf" won't help. History is only as useful as the words attached to it. This lesson is about making those words count, and then about naming the moments that matter: versions.

## What a good commit message looks like

A commit message has a **subject line**, a blank line, and an optional **body**:

```text
Fix footer overlapping content on mobile

The footer used position: fixed, so on screens shorter than
the content it covered the last project card. Switch to a
normal flow footer and add bottom padding to the grid.

Closes #13
```

The conventions, and why they exist:

- **Subject under about 50 characters.** It's what `git log --oneline`, GitHub's commit lists and pull request titles show; long ones get cut off.
- **Imperative mood:** "Fix", "Add", "Remove", not "Fixed" or "Adds". A handy test: the subject completes "If applied, this commit will…". It also matches the messages Git writes itself, like "Merge branch 'footer'".
- **No full stop** at the end of the subject.
- **The body explains why**, wrapped at about 72 characters. The diff already shows *what* changed; only you know the reason, the alternative you rejected, the bug it fixes.
- **Trailers go at the bottom**: `Closes #13`, or `Co-authored-by: Name <email>`, which GitHub uses to credit pair-programming partners.

Use `git commit` without `-m` when a change needs a body; your editor makes multi-line messages easy. For one-line changes, `-m` is fine.

## Conventional Commits

Many teams adopt a structured format called **Conventional Commits**:

```text
feat(projects): add tag filter to projects page
fix(nav): close mobile menu when a link is clicked
docs: add setup steps to README
ci: run HTML check on pull requests
feat!: rename data-theme attribute to data-color-scheme
```

The shape is `type(optional scope): description`. The specification defines `feat` (a new feature) and `fix` (a bug fix); teams commonly add `docs`, `style` (formatting only, not CSS), `refactor`, `perf`, `test`, `build`, `ci` and `chore`. A `!` before the colon, or a `BREAKING CHANGE:` footer, marks a change that breaks existing users.

The payoff is automation. Because the type is machine-readable, tools can generate changelogs and choose the next **semantic version** for you: `fix` bumps the patch number (1.4.2 to 1.4.3), `feat` the minor (1.5.0), a breaking change the major (2.0.0).

Conventional Commits usually keeps the description lowercase, which differs from the capitalised style above. Neither is wrong. Use what the repository already uses; consistency beats preference. For your portfolio, try Conventional Commits; it's common enough on teams that the habit pays off.

:::mistake One commit message, four changes
A message that needs "and" three times ("add contact form and fix nav and change colours") is telling you the commit should have been split. Before committing, run `git diff --staged` and ask whether a single sentence covers it. If not, unstage and commit in pieces with `git add -p`.
:::

## Tags: naming a moment

Branches move; **tags** don't. A tag is a permanent name for one commit, used to mark versions: the portfolio as it was at launch, at v1.1, and so on.

Git has two kinds. A **lightweight** tag is just a name pointing at a commit. An **annotated** tag is a full object with the tagger's name, a date and a message. Use annotated tags for releases:

```bash
git tag -a v1.0.0 -m "Portfolio launch"
git tag                       # list tags
git show v1.0.0               # tag message, then the commit it points at
git tag -a v0.9.0 b2e04f3 -m "Preview for mentors"   # tag an older commit
```

Tags stay on your machine until you push them, which surprises almost everyone the first time:

```bash
git push origin v1.0.0        # one tag
git push --follow-tags        # commits plus any annotated tags that point at them
```

Treat a pushed tag as permanent. If you tagged the wrong commit and already pushed it, publish a new version (v1.0.1) rather than moving v1.0.0 under people who may have used it.

## GitHub Releases

A **release** on GitHub is a tag plus a title, notes and optional downloadable files. Open your repository's Releases page, choose Draft a new release, pick the tag (or create one), and click **Generate release notes**: GitHub lists the pull requests merged since the previous release, with their authors. Edit the notes into something a human wants to read, then publish.

The CLI does the same in one line:

```bash
gh release create v1.0.0 --title "Portfolio v1.0.0" --generate-notes
```

Good pull request titles become good release notes for free, one more reason the earlier habits pay off.

:::tip Version numbers for a website
A portfolio site has no API users, so strict semantic versioning is optional. Tagging launches and major redesigns still gives you named points you can compare (`git diff v1.0.0 v2.0.0 -- styles.css`) and return to, which is worth the ten seconds.
:::

Clean messages, tags and releases make history readable. The final step is making `main` trustworthy without having to watch it yourself: automated checks on every pull request, and rules that enforce them.
