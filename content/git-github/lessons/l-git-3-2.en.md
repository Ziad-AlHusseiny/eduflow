---
summary: Authenticate Git with GitHub over HTTPS through a credential manager or over SSH with an ed25519 key, test the connection, and switch a remote between the two URL styles.
takeaways:
  - GitHub doesn't accept your account password for Git operations; use a credential manager, a personal access token, or an SSH key.
  - Git Credential Manager (or `gh auth login`) signs you in through the browser once and stores the credential securely.
  - "An SSH key pair has a private half that never leaves your machine and a public `.pub` half that you add to GitHub."
  - "`ssh -T git@github.com` tests SSH authentication and greets you by username when it works."
  - "The remote URL decides the protocol: `https://github.com/…` uses HTTPS, `git@github.com:…` uses SSH; switch with `git remote set-url`."
further:
  - title: About authentication to GitHub
    url: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github
  - title: Caching your GitHub credentials in Git
    url: https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git
  - title: Generating a new SSH key and adding it to the ssh-agent
    url: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
  - title: Testing your SSH connection
    url: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection
quiz:
  - q: "`git push` over HTTPS asks for a password. You type your GitHub password and get `Support for password authentication was removed`. What should you do?"
    options:
      - text: Reset your GitHub password; the old one must have expired.
        why: The password is fine for the website. GitHub simply doesn't accept account passwords for Git operations at all.
      - text: Switch the remote to `http://` instead of `https://`.
        why: GitHub doesn't serve Git over plain HTTP, and sending credentials unencrypted would be worse, not better.
      - text: Turn off two-factor authentication so the password works.
        why: Two-factor isn't the cause, and turning it off makes your account easier to take over. Git still wouldn't accept the password.
      - text: Set up a credential manager (or `gh auth login`) that signs you in through the browser, or use a personal access token.
        why: Correct. GitHub requires a token-based credential over HTTPS; the credential manager obtains and stores one for you.
    answer: 3
  - q: After running `ssh-keygen -t ed25519`, which file do you paste into GitHub's "New SSH key" form?
    options:
      - text: "`~/.ssh/id_ed25519`, the key file itself."
        why: That's the private key. Anyone holding it can act as you. It never leaves your machine.
      - text: "`~/.ssh/known_hosts`"
        why: That file records servers you've connected to. It isn't a key of yours.
      - text: "`~/.ssh/id_ed25519.pub`, the public key."
        why: Correct. The public half is safe to share; GitHub uses it to check that you hold the matching private key.
      - text: Both files, so GitHub can verify them against each other.
        why: GitHub only ever needs the public key. Uploading the private key anywhere means you should generate a new pair.
    answer: 2
  - q: SSH works (`ssh -T git@github.com` greets you), but `git push` still asks for a username and password. Why?
    options:
      - text: The remote URL is still HTTPS; switch it with `git remote set-url origin git@github.com:maya-okafor/portfolio.git`.
        why: Correct. Git uses whatever protocol the remote URL names. An `https://` URL never touches your SSH key.
      - text: The SSH key needs to be added to the repository's settings rather than your account.
        why: Keys on your account work for every repository you can access. Repository deploy keys are for servers, not you.
      - text: You need to run `ssh-keygen` again inside the repository.
        why: Keys belong to your user, not to a repository. Generating another one won't change which protocol Git uses.
    answer: 0
  - q: You're on a network that blocks port 22. Which option keeps Git working with the least fuss?
    options:
      - text: Generate an RSA key instead of ed25519.
        why: The key type has no effect on which port the connection uses.
      - text: Use HTTPS with a credential manager, which runs over port 443 like normal web traffic.
        why: Correct. HTTPS goes wherever the web goes. (GitHub also offers SSH over port 443 at `ssh.github.com` if you prefer SSH.)
      - text: Push through GitHub's website by uploading files one at a time.
        why: That works for a quick edit, but it bypasses your local history and isn't a way to keep using Git.
      - text: Disable the firewall on your laptop.
        why: The block is on the network, not your laptop, and switching off your own firewall only adds risk.
    answer: 1
---

Your first `git push` asked for a username and password. GitHub needs proof that the person pushing to `maya-okafor/portfolio` is Maya. It won't accept your account password for that; it hasn't since 2021, when it switched Git operations to stronger credentials. You have two good options, and you only set either one up once per computer.

## The two protocols

The remote URL decides how Git talks to GitHub:

```text
https://github.com/maya-okafor/portfolio.git    HTTPS
git@github.com:maya-okafor/portfolio.git        SSH
```

**HTTPS** authenticates with a token. A credential manager gets one by sending you through GitHub's normal browser sign-in (including two-factor) and stores it in your system's secure storage. **SSH** authenticates with a key pair you generate; GitHub stores the public half and checks you hold the private half.

Which should you pick? HTTPS with a credential manager is the easiest to set up and works on any network that allows web browsing. SSH takes five more minutes, doesn't expire (GitHub only removes a key after a year without use), and is what many developers use day to day. Both are equally secure when set up properly. If in doubt, start with HTTPS; you can switch any time.

## Option 1: HTTPS with a credential manager

**Git Credential Manager** (GCM) comes with Git for Windows. On macOS, install it with Homebrew (`brew install --cask git-credential-manager`); on Linux, follow the install guide on its GitHub page. The next time Git needs credentials, a browser window opens, you sign in to GitHub and approve, and GCM stores the token. You won't be asked again.

If you've installed the GitHub CLI, it can do the same job:

```bash
gh auth login
```

Choose GitHub.com, HTTPS, and answer yes to "Authenticate Git with your GitHub credentials?". It signs you in through the browser and configures Git to use it as a credential helper.

The manual alternative is a **personal access token**: create one under Settings, Developer settings, and paste it where Git asks for a password. It works, but you have to manage expiry and storage yourself, so prefer a credential manager on your own machine and keep tokens for automation.

## Option 2: SSH keys

Generate a key pair. Ed25519 is the modern default:

```bash
ssh-keygen -t ed25519 -C "maya.okafor@example.com"
```

Press Enter to accept the default location, then set a passphrase. The passphrase protects the private key if your laptop is ever stolen. The comment after `-C` is a label to help you recognise the key later.

You now have two files:

- `~/.ssh/id_ed25519`, the **private key**. It never leaves this machine.
- `~/.ssh/id_ed25519.pub`, the **public key**. Safe to share; this is what GitHub gets.

Load the key into the SSH agent so you type the passphrase once per session, not on every push:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

On macOS, `ssh-add --apple-use-keychain ~/.ssh/id_ed25519` stores the passphrase in your Keychain; GitHub's guide shows the matching `~/.ssh/config` lines. Then copy the public key (`pbcopy < ~/.ssh/id_ed25519.pub` on macOS, or open the file and copy its single line), and on GitHub go to Settings, SSH and GPG keys, New SSH key, and paste it.

Test the connection:

```bash
ssh -T git@github.com
```

The first time, SSH asks you to confirm GitHub's host fingerprint; compare it with the fingerprints GitHub publishes in its docs before typing `yes`. Success looks like this:

```text
Hi maya-okafor! You've successfully authenticated, but GitHub does not provide shell access.
```

That "does not provide shell access" line is normal; you're not logging in to a server, only proving who you are.

:::mistake Sharing the wrong key
The file without `.pub` is your private key. Pasting it into GitHub, a chat or an issue is like posting your house key online: delete that key from everywhere, generate a new pair, and add the new public key. If the file you're about to share doesn't end in `.pub`, stop.
:::

## Pointing the remote at the right protocol

Authentication follows the URL. If you set up SSH but cloned with HTTPS, Git keeps using HTTPS. Check and switch:

```bash
git remote -v
git remote set-url origin git@github.com:maya-okafor/portfolio.git
git push
```

Going the other way is the same command with the `https://` URL.

:::tip One key per machine
Generate a separate key on each computer you use and give each a clear title on GitHub ("Maya MacBook 2026"). If a laptop is lost, you delete that one key from GitHub and nothing else breaks.
:::

With pushing sorted, you can start working the way teams do on GitHub: through pull requests.
