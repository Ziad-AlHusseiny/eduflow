---
summary: Read a merge conflict calmly, edit the conflict markers into the result you want, mark files resolved and finish the merge, or abort it and start over.
takeaways:
  - A conflict means both branches changed the same lines since their merge base, so Git asks you to choose; nothing is lost or broken.
  - Between `<<<<<<<` and `=======` is your current branch (HEAD); between `=======` and `>>>>>>>` is the branch being merged in.
  - Resolve by editing the file into its final form, removing every marker, then `git add` the file and `git commit`.
  - "`git merge --abort` puts everything back exactly as it was before the merge started."
  - "Setting `merge.conflictStyle` to `zdiff3` also shows the original lines, which makes most conflicts easy to judge."
further:
  - title: Basic Merge Conflicts (Pro Git)
    url: https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging#_basic_merge_conflicts
  - title: Resolving a merge conflict using the command line
    url: https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/resolving-a-merge-conflict-using-the-command-line
  - title: git merge, How conflicts are presented
    url: https://git-scm.com/docs/git-merge#_how_conflicts_are_presented
quiz:
  - q: |
      You're on `main` and ran `git merge tagline`. In `index.html` you see:
      ```text
      <<<<<<< HEAD
      <p>Front-end developer in Lagos.</p>
      =======
      <p>Front-end developer who loves accessible UI.</p>
      >>>>>>> tagline
      ```
      Which line came from `main`?
    options:
      - text: The second one, because the branch being merged in always appears first.
        why: It's the other way round. The top half is always the branch you're on, labelled HEAD.
      - text: "`Front-end developer in Lagos.`, because the top half is HEAD, your current branch."
        why: Correct. You're on `main`, so HEAD is `main`. The bottom half, labelled `tagline`, is what's being merged in.
      - text: Neither; both lines are Git's suggestions for a combined version.
        why: Git doesn't invent text. Each half is exactly what one branch contains.
    answer: 1
  - q: You've edited `index.html` so it reads the way you want and every marker is gone. `git status` still lists it under "Unmerged paths". What's the next step?
    options:
      - text: Run `git merge tagline` again so Git notices the fix.
        why: A merge is already in progress. Starting another one fails; Git is waiting for you to mark files as resolved.
      - text: Run `git commit -a --no-verify`.
        why: "`--no-verify` skips hooks and has nothing to do with conflicts. Stage the file and commit normally."
      - text: Run `git add index.html` to mark it resolved, then `git commit`.
        why: Correct. Staging tells Git the conflict is settled. When no unmerged paths remain, `git commit` creates the merge commit.
      - text: Delete `index.html` and run `git restore index.html`.
        why: That throws away the resolution you just wrote. There's no reason to delete anything.
    answer: 2
  - q: Halfway through a messy conflict you realise you merged the wrong branch. How do you get back to exactly where you were before the merge?
    options:
      - text: "`git merge --abort`"
        why: Correct. While a merge is in progress, this restores the branch, the index and your files to their state before `git merge`.
      - text: "`git restore .`"
        why: That discards working-tree changes but leaves Git in the middle of a merge, with the merge state still active.
      - text: "`git branch -D main`"
        why: Deleting the branch you're on isn't allowed, and it wouldn't undo anything.
      - text: Close the terminal; unfinished merges are cancelled automatically.
        why: The merge state is stored in `.git`, not in your terminal session. It's still there when you reopen it.
    answer: 0
  - q: Your branch has merged and pushed, and a teammate finds `=======` printed on the live home page. Which habit would have caught this before committing?
    options:
      - text: Running `git log --graph` after every merge.
        why: The graph shows commit structure, not file contents, so leftover markers wouldn't appear.
      - text: Always resolving with `git merge --abort`.
        why: Aborting cancels the merge instead of resolving it, so the work never lands.
      - text: Using `git commit -m` instead of the editor.
        why: The message source has nothing to do with markers inside your files.
      - text: Running `git diff --check` (and opening the page) before `git add`.
        why: Correct. `git diff --check` warns about leftover conflict markers, and actually viewing the result catches the rest.
    answer: 3
---

Sooner or later two branches change the same line. You change your tagline on `main` to "Front-end developer in Lagos." while your `tagline` branch, started earlier, rewrote the same line to "Front-end developer who loves accessible UI." Git can't know which is right, so it stops and asks. That's all a merge conflict is: a question. I've helped hundreds of people through their first one, and the panic always comes from the unfamiliar markers, never from the actual problem.

## What Git tells you

```bash
git switch main
git merge tagline
```

```text
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

You're now *in the middle of a merge*. Any files that merged cleanly are already staged. Run `git status` to see the rest:

```text
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```

Read that output; it's the whole procedure. Fix the conflicts, mark each file resolved with `git add`, then `git commit`. Or abort.

## Reading the markers

Open `index.html`. Git has written both versions into the file, fenced by markers:

```html title=index.html
    <h1>Maya Okafor</h1>
<<<<<<< HEAD
    <p>Front-end developer in Lagos.</p>
=======
    <p>Front-end developer who loves accessible UI.</p>
>>>>>>> tagline
```

- The top half, from the opening marker labelled `HEAD` down to `=======`, is **your side**: the branch you're on, here `main`.
- The bottom half, from `=======` down to the closing marker labelled `tagline`, is **their side**: the branch you're merging in.

Everything outside the markers merged without trouble. A file can contain several of these blocks, so search the file for the opening marker (seven less-than signs) until there are none left.

:::figure Git compares both sides with the merge base
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">The merge base says 'Front-end developer in progress.' Main changed it to 'in Lagos.' The tagline branch changed it to 'who loves accessible UI.' Both sides changed the same line, so Git cannot choose and you write the result by hand.</title>
  <rect class="d-box" x="230" y="15" width="240" height="56" rx="10"/>
  <text class="d-label-strong" x="350" y="38" text-anchor="middle">Merge base</text>
  <text class="d-label-muted" x="350" y="60" text-anchor="middle">"…developer in progress."</text>
  <rect class="d-box-accent" x="20" y="105" width="270" height="56" rx="10"/>
  <text class="d-label-strong" x="155" y="128" text-anchor="middle">HEAD (main)</text>
  <text class="d-label-muted" x="155" y="150" text-anchor="middle">"…developer in Lagos."</text>
  <rect class="d-box-accent" x="410" y="105" width="270" height="56" rx="10"/>
  <text class="d-label-strong" x="545" y="128" text-anchor="middle">tagline</text>
  <text class="d-label-muted" x="545" y="150" text-anchor="middle">"…loves accessible UI."</text>
  <path class="d-arrow" d="M300 71 L190 103" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 71 L510 103" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="190" y="190" width="320" height="50" rx="10"/>
  <text class="d-label-strong" x="350" y="220" text-anchor="middle">Same line changed twice: you decide</text>
  <path class="d-arrow" d="M155 161 L260 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M545 161 L440 188" marker-end="url(#arrow)"/>
</svg>
:::

## Resolving it, step by step

**1. Decide what the result should be.** Not "which side wins" by reflex; what should the page actually say? Often it's a combination. Here, both facts are good:

```html title=index.html
    <h1>Maya Okafor</h1>
    <p>Front-end developer in Lagos who loves accessible UI.</p>
```

**2. Remove every marker.** The three marker lines must go. Git doesn't read the file to check; it's your job.

**3. Check the result.** Open the page in a browser, run your tests (`npm test` once the portfolio has them), and run:

```bash
git diff --check
```

It warns about any leftover conflict markers. Five seconds well spent.

**4. Mark it resolved and finish.**

```bash
git add index.html
git status        # "All conflicts fixed but you are still merging."
git commit        # editor opens with "Merge branch 'tagline'"; save and close
```

`git merge --continue` does the same as that final `git commit`. The merge commit now has two parents, like any other.

If you know one side should win for a whole file, skip the editing: `git restore --ours index.html` keeps your branch's version and `git restore --theirs index.html` keeps the incoming one. Then `git add` it as usual.

:::mistake Committing the markers
The most common conflict bug isn't a wrong choice; it's a stray `=======` or closing marker line committed into the file, sometimes all the way to production. Git won't stop you, because to Git it's just text. Make `git diff --check` and actually viewing the page part of every resolution.
:::

## Bailing out

If a conflict is bigger than you expected, or you merged the wrong branch, you can always retreat:

```bash
git merge --abort
```

Your branch, index and files go back to exactly how they were before `git merge`. Nothing is lost. It's often smart to abort, update or tidy the branch, and try again with a clear head.

The same markers and the same fix-add-continue routine appear whenever Git combines two versions of a line: during a rebase, when you apply a stash, and when `git pull` merges someone else's work into yours. Learn the routine once here and every later conflict in this course will look familiar. Only the command you use to continue or abort changes.

## Making conflicts easier to read

By default you see only the two sides. Ask Git to show the original lines too:

```bash
git config --global merge.conflictStyle zdiff3
```

Now each conflict has a third section between `|||||||` and `=======` showing the merge base. Seeing what the line was *before* either change usually makes the right answer obvious: you can see what each side meant to do, not only what it ended up with.

Editors help too. VS Code highlights each block with buttons such as Accept Current Change, Accept Incoming Change and Accept Both Changes, plus a three-way merge editor. Use them, but read the result; Accept Both often produces two `<p>` tags where you wanted one.

:::tip Fewer, smaller conflicts
Conflicts grow with time and branch size. Keep branches short-lived, merge them soon, and bring `main` into a long-running branch every day or two rather than once at the end. Two people editing one shared file all week is a conversation to have before the merge, not during it.
:::

Merging is one way to combine histories. Next you'll meet the other, rebasing, and the one rule that keeps it safe.
