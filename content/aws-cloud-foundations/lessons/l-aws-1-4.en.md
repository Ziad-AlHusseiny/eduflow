---
summary: Install the AWS CLI v2, sign in with short-term credentials using aws login, check who you are with aws sts get-caller-identity, and shape output with --query and --output.
takeaways:
  - The console and the CLI call the same APIs; use the console to explore and the CLI for anything you will repeat or review.
  - "`aws login` turns your console sign-in into short-term CLI credentials that refresh automatically, so no long-term access keys sit on your laptop."
  - "`aws sts get-caller-identity` shows the account and identity your commands run as; run it before anything destructive."
  - Named profiles plus `--profile` or `AWS_PROFILE` keep work in different accounts apart.
  - "`--query` filters the JSON response on your machine and `--output` changes its format; neither changes what AWS does."
further:
  - title: Installing or updating to the latest version of the AWS CLI
    url: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
  - title: Login for AWS local development using console credentials
    url: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html
  - title: Filtering output in the AWS CLI
    url: https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-filter.html
  - title: get-caller-identity (AWS CLI Command Reference)
    url: https://docs.aws.amazon.com/cli/latest/reference/sts/get-caller-identity.html
quiz:
  - q: You are about to delete an S3 bucket from your terminal and you have profiles for a test account and Lantern's production account. What should you run first?
    options:
      - text: "`aws s3 ls` to see the bucket list"
        why: It lists buckets for whichever identity is active, but it does not tell you which account that is. Two accounts can have similar bucket names.
      - text: "`aws configure` to re-enter your credentials"
        why: Re-entering credentials changes your setup rather than checking it, and it writes long-term keys you should not need.
      - text: "`aws sts get-caller-identity` to see which account and identity the command will run as"
        why: Correct. It returns the account ID and ARN of the identity in use, which is exactly what you need to check before a destructive command.
    answer: 2
  - q: Which is the main security advantage of `aws login` over pasting an access key into `aws configure`?
    options:
      - text: It gives you more permissions than an access key would.
        why: Permissions come from the identity's policies, not from how you sign in. `aws login` grants nothing extra.
      - text: The credentials are short-term and refreshed for you, so there is no long-lived secret in a file on your laptop.
        why: Correct. A leaked access key works until someone deletes it. Login credentials expire within hours.
      - text: It stops anyone from reading your `~/.aws/config` file.
        why: The config file is a plain text file and is still readable. The benefit is that it holds no long-term secret.
      - text: It works without an internet connection.
        why: Every AWS CLI call goes over the network to an AWS API, and signing in needs a browser flow too.
    answer: 1
  - q: |
      What does this command print?
      ```bash
      aws ec2 describe-availability-zones --region eu-west-1 \
        --query "AvailabilityZones[].ZoneName" --output text
      ```
    options:
      - text: The zone names on one line, separated by tabs, such as `eu-west-1a  eu-west-1b  eu-west-1c`
        why: Correct. `--query` keeps only the ZoneName values and `--output text` prints them tab-separated without JSON brackets.
      - text: The full JSON response, because `--query` only works with `--output json`
        why: "`--query` works with every output format. It runs on your machine before formatting."
      - text: An error, because the query must start with a dollar sign
        why: The AWS CLI uses JMESPath, which starts from the top-level keys of the response, with no dollar sign.
    answer: 0
---

You have a safe account and an admin identity. Clicking through the console works for a first look, but Lantern's maintainers want something they can repeat, paste into a runbook and review in a pull request. Every console button calls an AWS API, and the **AWS CLI v2** lets you call the same APIs from your terminal.

## Console or CLI?

Use the **console** to explore, read dashboards, and do one-off tasks you want to see visually, such as the first look at a bill. Use the **CLI** for anything you will do twice, anything a colleague should review, and anything you want to undo exactly. A command in a script is documentation; a sequence of clicks is a memory.

If you can't install anything, **AWS CloudShell** gives you a browser terminal in the console with the CLI already installed and signed in as your console identity.

## Install and check the version

Install from the official package for your system. On Linux x86-64:

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

On macOS, AWS publishes a `.pkg` installer, and on Windows an `.msi`. Whichever you use, `aws --version` should print `aws-cli/2.` followed by a version number. You need **2.32.0 or later** for the sign-in command below; if you have an old version 1 install, remove it first, because the two behave differently.

## Sign in without access keys

The old way was `aws configure`, pasting a long-term access key ID and secret into `~/.aws/credentials`. Those keys never expire, and they leak through backups, screenshots and Git commits. Today you sign in with your console identity instead:

```bash
aws login --profile lantern-admin
```

The CLI asks for a default Region the first time (enter Lantern's), opens your browser, and after you sign in with your password and MFA it stores **short-term credentials** that refresh automatically for up to 12 hours. Your `~/.aws/config` gains a profile like this, and notice there is no secret in it:

```ini title=~/.aws/config
[profile lantern-admin]
login_session = arn:aws:iam::111122223333:user/amara
region = eu-west-1
```

An IAM user needs permission to use this flow; the `AdministratorAccess` policy from the last lesson already includes it, and for narrower users AWS provides the `SignInLocalDevelopmentAccess` managed policy. Teams that use IAM Identity Center sign in with `aws configure sso` and `aws sso login` instead, which you meet in section two. When you are finished, `aws logout --profile lantern-admin` deletes the cached credentials.

## Who am I?

The most useful command in AWS is also the most boring:

```bash
aws sts get-caller-identity --profile lantern-admin
```

```json
{
  "UserId": "AIDAEXAMPLEUSERID1234",
  "Account": "111122223333",
  "Arn": "arn:aws:iam::111122223333:user/amara"
}
```

It needs no permissions and changes nothing, so even a brand-new identity with no policies attached can run it. If it fails, the problem is your credentials, not your permissions: expired session, wrong profile name, or no network. It tells you which **account** and which **identity** every following command will use. Run it before anything destructive, and in scripts, check that `Account` is the one you expect before going further.

:::mistake Running against the wrong account
With several profiles, it is easy to run a cleanup script in production when you meant the test account. The CLI picks credentials from `--profile`, then the `AWS_PROFILE` environment variable, then `default`. Avoid a `default` profile that points at production, and put a `get-caller-identity` check at the top of every script.
:::

## Shaping the output

Responses are JSON by default, and often long. Two global options help:

- `--output` picks the format: `json`, `text`, `table` or `yaml`.
- `--query` filters the response with a JMESPath expression **on your machine** before printing.

```bash
aws s3api list-buckets --profile lantern-admin \
  --query "Buckets[].Name" --output text
```

That prints only the bucket names, tab-separated, ready for a shell loop. Because `--query` runs locally, it does not reduce what AWS returns or what the call costs; it only reduces what you have to read.

:::tip Two small settings that save frustration
The CLI pipes long output through a pager. In scripts, add `--no-cli-pager` or set `AWS_PAGER=""` so commands never wait for a keypress. And `aws s3 help` (or `aws s3 cp help`) shows the full reference for any command offline.
:::

That closes section one: you know where AWS runs things, who secures what, and how to drive the account safely. Section two looks inside IAM, the system that decides whether each of those other calls is allowed. (`get-caller-identity` is the one exception: it works even when a policy denies it.)
