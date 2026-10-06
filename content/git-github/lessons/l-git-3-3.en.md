---
summary: Open a pull request from a pushed branch, write a description reviewers can act on, review and update code through comments and new commits, and merge with the right method.
takeaways:
  - A pull request proposes merging one branch into another and is the place where discussion, review and automated checks happen.
  - Pushing more commits to the same branch updates the open pull request; you never need to open a new one.
  - A good description says what changed, why, and how to check it, and `Closes #12` links the issue so merging closes it.
  - Merge commit, squash and merge, and rebase and merge produce different history on `main`; pick one convention per repository.
  - After a squash merge, start new work on a fresh branch from the updated `main` instead of continuing on the old branch.
further:
  - title: Pull requests (GitHub Docs)
    url: https://docs.github.com/en/pull-requests/reference/pull-requests
  - title: Reviewing proposed changes in a pull request
    url: https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request
  - title: Pull request merges (GitHub Docs)
    url: https://docs.github.com/en/pull-requests/reference/pull-request-merges
  - title: Linking a pull request to an issue
    url: https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue
quiz:
  - q: A reviewer asks you to rename a CSS class in your open pull request. How do you update the pull request?
    options:
      - text: Close it, make the change on a new branch, and open a new pull request.
        why: That throws away the review conversation for no reason. Pull requests are designed to be updated.
      - text: Commit the change on the same branch and push; the pull request updates automatically.
        why: Correct. A pull request tracks its branch, so new commits appear in it and the reviewer can see exactly what changed since their review.
      - text: Edit the file in the "Files changed" tab of the pull request.
        why: You can make small edits on GitHub, but it still commits to the branch; it's not a separate mechanism, and local work is usually easier to test.
      - text: Ask the reviewer to make the change themselves after merging.
        why: Merging known-unfinished work into `main` defeats the purpose of review.
    answer: 1
  - q: Your pull request description ends with `Closes #12`. What happens when the pull request is merged into the default branch?
    options:
      - text: Issue 12 is closed automatically and linked to the pull request.
        why: Correct. Keywords like `closes`, `fixes` and `resolves` followed by an issue number link them, and the merge closes the issue.
      - text: Pull request number 12 is closed.
        why: The number refers to an issue (issues and pull requests share one numbering), and the keyword links rather than closes another pull request.
      - text: Nothing; it's only a comment for humans.
        why: GitHub parses these keywords in pull request descriptions and acts on them when merging into the default branch.
    answer: 0
  - q: Your team squash-merges pull requests. After yours merged, you kept committing on the same branch and opened a second pull request. It shows your old commits again and conflicts. Why?
    options:
      - text: GitHub forgot that the first pull request was merged.
        why: GitHub remembers. The problem is in the commit graph, not in GitHub's records.
      - text: Squash merging deletes the branch on GitHub, so it's corrupted.
        why: Deleting a branch after merge removes a pointer. Nothing is corrupted.
      - text: Your branch needs `git pull --force` to fix the history.
        why: There's no such fix, and forcing doesn't change what's in `main`.
      - text: The squash created one new commit on `main`, so your branch's original commits still look unmerged to Git.
        why: Correct. The squash commit has the same changes but a different ID. Start each new piece of work on a fresh branch from the updated `main`.
    answer: 3
  - q: Which pull request is likely to get the most useful review?
    options:
      - text: One pull request with the whole redesign, 2,400 changed lines, titled "Updates".
        why: Reviewers can't hold that much in their heads, so they skim and approve. Size and a vague title both work against review.
      - text: A pull request with no description, because the code speaks for itself.
        why: Code shows what changed, not why, or how to check it. Reviewers waste time reconstructing your intent.
      - text: A 150-line pull request adding the projects filter, with a screenshot and steps to test it.
        why: Correct. Small, single-purpose, and explained, so the reviewer can actually check that it works.
    answer: 2
---

On your own, merging a branch is a command. On a team, it's a conversation: someone else reads the change, asks questions, catches the bug you didn't see, and only then does it land on `main`. GitHub's **pull request** is where that conversation happens. Even on a solo portfolio it's worth using, because in a few lessons you'll attach automated checks to it, and because employers look at how you work, not only at what you built.

## From branch to pull request

You've built a filter for the projects page on a branch and pushed it:

```bash
git switch -c projects-filter
# …commits…
git push -u origin projects-filter
```

The push output includes a link: `Create a pull request for 'projects-filter' on GitHub by visiting: https://github.com/maya-okafor/portfolio/pull/new/projects-filter`. Open it, or click the "Compare & pull request" banner on the repository page. Check the two branch selectors: **base** is where the work should go (`main`), **compare** is your branch.

With the GitHub CLI, `gh pr create` asks for a title and body in the terminal, and `gh pr create --fill` uses your commit messages.

If the work isn't ready but you want early feedback, open it as a **draft pull request**. It can't be merged until you mark it ready, and it tells reviewers to look at direction, not detail.

## Write a description people can act on

The title says what the change does: "Add tag filter to projects page". The body answers three questions:

```markdown
## What
Adds tag buttons above the project grid; clicking one hides cards without that tag.

## Why
The grid has 14 projects now and visitors asked for a way to find the React ones.

## How to check
1. Open projects.html
2. Click "React": only 5 cards remain
3. Click "All": all 14 return

Closes #12
```

Add a screenshot for anything visual; you can paste images straight into the box. The last line uses a closing keyword: when this pull request merges into the default branch, issue 12 closes automatically and the two link to each other. `Fixes` and `Resolves` work too.

## The review

A reviewer opens the **Files changed** tab, which shows the diff between your branch and its base. They can comment on any line, select several lines for a broader comment, or write a **suggestion**: a proposed replacement you can apply with one click as a commit. When done, they submit a review as **Comment**, **Approve** or **Request changes**.

To respond, you don't open anything new. Make the changes locally, commit, and push to the same branch:

```bash
git commit -am "Rename filter class to project-filter"
git push
```

The pull request updates, and the reviewer can see only what changed since their last review. Reply to each comment, resolve conversations that are settled, and ask for another look.

:::tip Reviewing well
When you review, start by running the change, not reading it. Comment on the code, never the person; ask questions ("what happens with zero projects?") rather than issuing verdicts. Mark small preferences as optional, often prefixed "nit:", so the author knows what blocks approval. Approve once it's good, not once it's how you would have written it.
:::

Keep pull requests small. Under about 400 changed lines, a reviewer can actually think about every line; a 2,000-line pull request gets skimmed and approved. If a feature is big, split it into a sequence of pull requests that each leave the site working.

## Merging: three buttons, three histories

When approved, the merge button offers up to three methods, which repository settings can limit:

- **Create a merge commit**: all your commits plus a merge commit, like `git merge --no-ff`.
- **Squash and merge**: your commits combined into one new commit on `main`, titled after the pull request.
- **Rebase and merge**: your commits replayed onto `main` one by one, with no merge commit.

Squash and merge is a popular default for small pull requests: `main` gets one clean commit per change, and "fix typo" commits vanish. Merge commits suit larger work where the individual commits tell a useful story. Pick one per repository and stick to it.

After merging, click **Delete branch** on GitHub, then tidy up locally:

```bash
git switch main
git pull
git branch -D projects-filter
```

Why `-D` and not `-d`? After a squash or rebase merge, your branch's original commits aren't ancestors of `main` (GitHub made new ones), so `-d` thinks the work is unmerged. Once GitHub shows the pull request as merged, `-D` is safe.

:::mistake Reusing a merged branch
After a squash merge, continuing on the same branch for the next feature means your branch still carries the old, pre-squash commits. The next pull request shows them again and conflicts with their squashed twin on `main`. Treat a merged branch as finished: delete it, update `main`, and `git switch -c` a fresh one.
:::

Checking out someone else's pull request to test it is one command with the CLI: `gh pr checkout 14`. Next, you'll use the rest of GitHub's collaboration tools, issues and projects to plan work, and forks to contribute to repositories you don't own.
