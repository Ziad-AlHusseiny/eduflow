---
kind: intro
summary: Explain what problem version control solves, how Git's snapshot model differs from saving copies of files, and how Git and GitHub split the work.
takeaways:
  - Version control records named, dated snapshots of a whole project so you can compare, undo and share changes safely.
  - A Git commit is a snapshot of every tracked file plus a pointer to the commit before it, not a list of edits.
  - Git runs on your machine and works offline; GitHub is a hosting service built around Git repositories.
  - Most Git confusion disappears once you can draw the commit graph and say where your branch and HEAD point.
further:
  - title: Pro Git, Getting Started - What is Git?
    url: https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F
  - title: About Git (GitHub Docs)
    url: https://docs.github.com/en/get-started/using-git/about-git
quiz:
  - q: You save `index.html`, `index-v2.html` and `index-final.html` in one folder. Which problem does Git solve that this habit doesn't?
    options:
      - text: Git makes the files smaller, so the folder uses less disk space.
        why: Git does compress what it stores, but saving space isn't the problem here. The problem is knowing what changed, when, why, and across which files.
      - text: Git records the whole project at each point, with a message and a date, so you can compare or return to any version.
        why: Correct. A commit captures every tracked file together, with who, when and why, which loose copies of one file can't do.
      - text: Git stops you from editing files that already have a saved version.
        why: Git never locks files. You edit freely; Git only records what you choose to commit.
      - text: Git uploads each version to the cloud automatically.
        why: Git is entirely local until you push. Uploading is a separate, deliberate step that involves a remote such as GitHub.
    answer: 1
  - q: What does a single Git commit contain?
    options:
      - text: Only the lines that changed since the previous commit.
        why: That describes a diff. Git shows you diffs, but it computes them by comparing two snapshots; the commit itself records the full state.
      - text: A copy of the files you staged, and nothing about earlier commits.
        why: A commit always points to its parent commit (or parents). That link is what turns separate snapshots into a history.
      - text: A snapshot of all tracked files, the author, a message, and a pointer to its parent commit.
        why: Correct. Snapshot plus parent pointer is the whole model; history, branches and merges all fall out of it.
    answer: 2
  - q: Your train has no Wi-Fi. Which of these can you still do?
    options:
      - text: Commit, view history, create branches and merge them.
        why: Correct. The full repository lives in the `.git` folder on your machine, so everything except talking to a remote works offline.
      - text: Nothing; Git needs to reach GitHub for every command.
        why: Git was designed to be distributed. Only commands that talk to a remote, such as push, fetch, pull and clone, need a network connection.
      - text: Only `git status`, because commits are created on GitHub's servers.
        why: Commits are created locally by `git commit`. GitHub only receives them later when you push.
    answer: 0
---

Every developer has a folder somewhere with `index.html`, `index-old.html`, `index-final.html` and `index-final-REAL.html`. It works until the day you need to know which version had the working menu, what you changed between Tuesday and Thursday, or how to combine your fix with a friend's edits from the same morning. Copies of files can't answer any of that.

Version control is the tool for those questions. It keeps a history of your project as a series of saved states, each with a date, an author and a note explaining why. You can compare any two states, return to an old one, try an idea on the side and throw it away, and share the whole history with other people. Git is the version control system almost every team uses in 2026, and GitHub is where most of those teams keep their shared copy.

## Snapshots, not edits

Git's core idea is small. When you commit, Git records a **snapshot**: the full contents of every file it tracks, at that moment. Files that didn't change aren't stored twice; Git reuses what it already has. Each commit also stores a pointer to the commit that came before it, its **parent**. Follow those pointers backwards and you have the project's history.

:::figure Copies of files versus a chain of commits
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">Left: three loose copies of index.html with no link between them. Right: three commits, each a snapshot of the whole project, each pointing back to its parent, with a message on every commit.</title>
  <text class="d-label-strong" x="30" y="30">Copies</text>
  <rect class="d-box-warn" x="30" y="50" width="200" height="40" rx="8"/>
  <text class="d-code" x="45" y="76">index.html</text>
  <rect class="d-box-warn" x="30" y="105" width="200" height="40" rx="8"/>
  <text class="d-code" x="45" y="131">index-final.html</text>
  <rect class="d-box-warn" x="30" y="160" width="200" height="40" rx="8"/>
  <text class="d-code" x="45" y="186">index-final-REAL.html</text>
  <text class="d-label-muted" x="30" y="230">Which is newest? What changed?</text>
  <text class="d-label-strong" x="290" y="30">Commits</text>
  <rect class="d-box-primary" x="290" y="60" width="120" height="110" rx="10"/>
  <text class="d-label-strong" x="305" y="85">a1f3</text>
  <text class="d-code" x="305" y="110">index.html</text>
  <text class="d-code" x="305" y="130">styles.css</text>
  <text class="d-label-muted" x="305" y="155">"Add home"</text>
  <rect class="d-box-primary" x="440" y="60" width="120" height="110" rx="10"/>
  <text class="d-label-strong" x="455" y="85">7c2e</text>
  <text class="d-code" x="455" y="110">index.html</text>
  <text class="d-code" x="455" y="130">styles.css</text>
  <text class="d-label-muted" x="455" y="155">"Add menu"</text>
  <rect class="d-box-primary" x="590" y="60" width="100" height="110" rx="10"/>
  <text class="d-label-strong" x="605" y="85">d90b</text>
  <text class="d-code" x="605" y="110">index.html</text>
  <text class="d-code" x="605" y="130">styles.css</text>
  <text class="d-label-muted" x="605" y="155">"Fix nav"</text>
  <path class="d-arrow" d="M440 115 L414 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M590 115 L564 115" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="290" y="205">Each commit points back to its parent.</text>
</svg>
:::

Notice the arrows point backwards. A commit knows its parent, never its children, because the children didn't exist when it was made. That one detail explains a lot of Git's behaviour later, including why you can't "edit" an old commit, only replace it with a new one.

## Git versus GitHub

People use the two names as if they were one thing. They aren't.

- **Git** is a program on your computer. The whole history lives in a hidden `.git` folder inside your project. Committing, branching, merging and reading history all happen locally and work on a plane.
- **GitHub** is a website and service that hosts Git repositories. It adds what a team needs around Git: a shared copy everyone pushes to, pull requests for code review, issues, project boards, and GitHub Actions for automated checks.

You can use Git without GitHub (plenty of teams use GitLab or Bitbucket), but GitHub without Git makes no sense. This course teaches Git first, then GitHub on top of it.

:::why Why Git feels hard, and how this course fixes it
Most people learn Git as a list of commands to memorize, so every unexpected message feels like a disaster. Git's commands are moves on a small graph of commits and labels. Once you can picture that graph, a command stops being a gamble and becomes a prediction you can check with `git log --graph`. Expect a lot of diagrams.
:::

## What you'll build

You'll work on one project all course: your own portfolio site, a repository called `portfolio` with an `index.html`, a `styles.css`, a projects page and a tiny `npm test` script that checks the HTML. In section 1 you turn the folder into a repository and learn to read its history. In section 2 you branch, merge, rebase and fix a real conflict. In section 3 you put it on GitHub and work through pull requests. In section 4 you learn to undo mistakes safely and finish with a protected `main` branch where GitHub Actions checks every pull request before it can merge.

Next, you install Git, tell it who you are, and make your first commit.
