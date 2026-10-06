---
summary: Install Git, set your name, email, default branch and editor once, then turn your portfolio folder into a repository and record its first commit.
takeaways:
  - Run `git config --global` once per machine for `user.name`, `user.email`, `init.defaultBranch` and `core.editor`; Git stores them in `~/.gitconfig`.
  - Your commit email decides which GitHub account a commit is credited to, so use one your account knows, such as the noreply address.
  - "`git init` creates a hidden `.git` folder; that folder is the repository, and deleting it deletes all history."
  - A commit is two steps, `git add` to choose what goes in and `git commit -m` to record it with a message.
further:
  - title: First-Time Git Setup (Pro Git)
    url: https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup
  - title: git config reference
    url: https://git-scm.com/docs/git-config
  - title: Setting your commit email address
    url: https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address
quiz:
  - q: You set `user.email` to an old work address. Your commits push fine, but GitHub shows them with a grey, unlinked avatar. Why?
    options:
      - text: The push failed silently and GitHub is showing a cached copy.
        why: The commits are on GitHub, so the push worked. The avatar problem is about who the commits say wrote them.
      - text: GitHub only links commits made through its website.
        why: GitHub links commits from any client. It matches the email inside each commit to the emails on an account.
      - text: You need to run `git init` again to refresh the author.
        why: "`git init` on an existing repository changes nothing about authorship. Author details are written into each commit when it's created."
      - text: GitHub matches the email stored in each commit to an account, and that address isn't on yours.
        why: Correct. Add the address to your GitHub account, or set `user.email` to one it knows (such as your noreply address) for future commits.
    answer: 3
  - q: You run `git commit` with no `-m` and a full-screen editor you don't recognise opens. What happened?
    options:
      - text: Git crashed and opened its error log.
        why: Nothing crashed. Git asks for a message, and with no `-m` it opens your configured editor to collect one.
      - text: Git opened `core.editor` (often Vim by default) so you can write the commit message.
        why: Correct. Write the message, save and close. Set `core.editor` to an editor you know, such as `code --wait` or `nano`, to avoid surprises.
      - text: The commit was made with an empty message and the editor shows the diff.
        why: Git refuses an empty message and aborts the commit. The editor is where the message goes before anything is recorded.
    answer: 1
  - q: You accidentally ran `git init` in your home folder and now every directory shows up as "untracked". What is the right fix?
    options:
      - text: Run `git init` again inside the `portfolio` folder; the newer repository replaces the old one.
        why: The home-folder repository would still exist and still wrap everything. Nested repositories make things more confusing, not less.
      - text: Run `git reset --hard` in your home folder.
        why: That command acts on commits and the working tree. It could discard changes and still leaves the `.git` folder in place.
      - text: Remove the `.git` folder from your home directory, then run `git init` inside `portfolio`.
        why: Correct. The `.git` folder is the repository. Removing the stray one (it has no history you need) undoes the mistake completely.
    answer: 2
  - q: Which command makes every new repository on your machine start on a branch called `main`?
    options:
      - text: "`git config --global init.defaultBranch main`"
        why: Correct. `init.defaultBranch` sets the name of the first branch that `git init` creates.
      - text: "`git branch --default main`"
        why: There's no `--default` option on `git branch`. Default names come from configuration, not from a branch command.
      - text: "`git config core.branch main`"
        why: "`core.branch` isn't a real setting, and without `--global` it would only affect the current repository anyway."
      - text: "`git init --main`"
        why: "`git init` has `-b <name>` (or `--initial-branch`) for one repository, but no `--main` flag, and it wouldn't affect future repositories."
    answer: 0
---

Before Git can record anything, it needs two facts about you and a few preferences. You set these once per computer, and they quietly shape every commit you make for years. Ten minutes now saves you from hundreds of commits credited to "unknown" or an address you no longer own.

## Install Git

Check whether Git is already there:

```bash
git --version
```

If you see something like `git version 2.51.0`, you're set; any 2.4x or newer version works for this course. If not:

- **macOS:** running `git --version` offers to install the Xcode Command Line Tools, which include Git. If you use Homebrew, `brew install git` gets you a newer one.
- **Windows:** install Git for Windows from git-scm.com. Keep the defaults; they include Git Bash (a terminal where every command in this course works) and Git Credential Manager, which you'll use in section 3.
- **Linux:** use your package manager, for example `sudo apt install git` on Ubuntu or `sudo dnf install git` on Fedora.

## Tell Git who you are

Every commit stores an author name and email. Set them globally, meaning for your user account on this machine:

```bash
git config --global user.name "Maya Okafor"
git config --global user.email "maya.okafor@example.com"
```

The email matters more than it looks. GitHub decides whose avatar and profile appear next to a commit by matching the email inside it against the addresses on GitHub accounts. If you'd rather not publish your real address, GitHub gives every account a noreply address of the form `12345678+username@users.noreply.github.com` (find yours under Settings, then Emails) and you can use that instead.

:::tip Keep your email private
In GitHub's email settings, turn on "Keep my email addresses private" and use the noreply address in `user.email`. Your commits still link to your profile, and your inbox stays out of every public repository you touch.
:::

## Three preferences worth setting now

```bash
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global --list
```

- `init.defaultBranch main` names the first branch of every new repository `main`, which matches what GitHub creates. Without it, Git 2.x still names the first branch `master` and prints a long hint about it.
- `core.editor` is the program Git opens when it needs you to write text, such as a commit message. Many installs default to Vim, which surprises people who don't know it. `code --wait` uses VS Code (the `--wait` keeps Git waiting until you close the tab); `nano` is a simple terminal option.
- `--list` prints what you've set so you can check for typos.

These go into a plain text file, `~/.gitconfig`. A setting without `--global`, run inside a repository, applies only to that repository and overrides the global one. That's handy if you want a work email in work repositories and a personal one everywhere else.

## Create the repository

Make a folder for your portfolio and turn it into a repository:

```bash
mkdir portfolio
cd portfolio
git init
```

```text
Initialized empty Git repository in /Users/maya/portfolio/.git/
```

That hidden `.git` folder is the repository: every commit, branch and setting for this project lives inside it. The files you edit sit next to it. Don't edit anything inside `.git` by hand, and know that deleting it deletes the history while leaving your current files alone.

:::mistake Running git init in the wrong folder
If you run `git init` in your home folder, Git wraps every file you own, and `git status` lists your Desktop, Downloads and Documents as untracked. Check where you are with `pwd` before `git init`. If it already happened, delete the stray folder with `rm -rf ~/.git` (only that one, and only if you never committed there), then run `git init` inside `portfolio`.
:::

## Make the first commit

Create `index.html` with a minimal page:

```html title=index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Maya Okafor</title>
  </head>
  <body>
    <h1>Maya Okafor</h1>
    <p>Front-end developer in progress.</p>
  </body>
</html>
```

Now ask Git what it sees:

```bash
git status
```

```text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	index.html

nothing added to commit but untracked files present (use "git add" to track)
```

**Untracked** means Git sees the file but has never recorded it. Committing is two steps: choose what goes in, then record it.

```bash
git add index.html
git commit -m "Add home page"
```

```text
[main (root-commit) 3f9c2a1] Add home page
 1 file changed, 11 insertions(+)
 create mode 100644 index.html
```

Read that output: you're on `main`, this is the **root commit** (the first one, with no parent), and its short ID is `3f9c2a1`. Yours will differ, because the ID is a hash of the content, your name, the time and the parent. Run `git log` to see the commit with its full ID, author and date.

Why two steps instead of one? Because the gap between `add` and `commit` is where you decide what belongs together. That gap has a name, the staging area, and it's the subject of the next lesson.
