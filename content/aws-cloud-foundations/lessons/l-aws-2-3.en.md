---
summary: Give people access through IAM Identity Center and code access through IAM roles, so that Lantern runs with no long-term access keys on laptops, servers or in Git.
takeaways:
  - IAM Identity Center gives each person one sign-in, with MFA, to every account they need, and hands out short-term credentials through permission sets.
  - Workloads get permissions from roles, such as a Lambda execution role or an EC2 instance profile, and the AWS SDKs find those temporary credentials without any code.
  - A role has two policies; the trust policy says who may assume it, and the permissions policy says what it may then do.
  - Long-term access keys in code, config files or environment variables are one of the most common ways AWS accounts get compromised.
  - When retiring an access key, confirm it is unused with its last-used date, deactivate it, and only then delete it.
further:
  - title: What is IAM Identity Center?
    url: https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html
  - title: Configuring IAM Identity Center authentication with the AWS CLI
    url: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html
  - title: Defining Lambda function permissions with an execution role
    url: https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html
  - title: Manage access keys for IAM users
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html
quiz:
  - q: Lantern's RSVP function must write to DynamoDB. How should it get credentials?
    options:
      - text: Store an IAM user's access key in the function's environment variables.
        why: Anyone who can read the function configuration can read the key, and it never expires. Environment variables are not a secret store.
      - text: Give the function an execution role with a permissions policy for the table; the SDK picks up its temporary credentials.
        why: Correct. Lambda assumes the role for you and hands each execution environment short-term credentials, so there is nothing to leak or rotate.
      - text: Use the root user's credentials, since the function needs reliable access.
        why: Root credentials are unrestricted and should never exist as access keys, let alone inside code.
    answer: 1
  - q: A role's permissions policy allows `dynamodb:PutItem` on the RSVP table, but EC2 instances fail to assume the role. Which policy is most likely wrong?
    options:
      - text: The trust policy, which must name `ec2.amazonaws.com` as a principal allowed to call `sts:AssumeRole`.
        why: Correct. Who may assume a role is decided by the trust policy alone. The permissions policy only matters after the role has been assumed.
      - text: The permissions policy, which must also allow `sts:AssumeRole`.
        why: A role does not need permission to assume itself. That is the trust policy's job.
      - text: The DynamoDB table policy, which must list the EC2 instance ID.
        why: The instance is never the principal in DynamoDB calls; the assumed-role session is. And assumption fails before DynamoDB is involved.
    answer: 0
  - q: Lantern now has separate dev and production accounts and six volunteers. What is the best way to give the volunteers console and CLI access?
    options:
      - text: An IAM user per volunteer in each account, each with its own password and MFA.
        why: That is twelve sets of credentials to manage and revoke. It works, but it scales badly and leaves long-term credentials behind.
      - text: One shared IAM user per account with a strong password kept in a password manager.
        why: Shared users destroy accountability and make removing one person impossible without rotating everyone's access.
      - text: IAM Identity Center users, with permission sets assigned per account, signing in through the access portal and `aws sso login`.
        why: Correct. Each person has one identity and MFA, access is short-term, and removing someone is a single change.
    answer: 2
---

Section one ended with one admin user for one person in one account. Lantern now has six volunteers, a dev account and a production account, a Lambda function and a nightly job on EC2. If every one of those needs an IAM user with access keys, you end up with a dozen long-lived secrets scattered across laptops and servers. This lesson removes nearly all of them.

## People: IAM Identity Center

**AWS IAM Identity Center** is where your workforce signs in. Each person gets **one** identity, either in Identity Center's built-in directory or synced from an identity provider such as Microsoft Entra ID, Okta or Google Workspace. They sign in once, with MFA, at an **AWS access portal** URL, and see every account they are allowed into.

What they can do in each account comes from **permission sets**: a named bundle of policies, such as `DeveloperAccess` or `ReadOnly`. When you assign "volunteer Rita, permission set `DeveloperAccess`, account `lantern-dev`", Identity Center creates a matching IAM role in that account, and Rita's session assumes it. Nobody has an IAM user; nobody has a long-term key.

Identity Center is designed to run with **AWS Organizations**, which groups Lantern's accounts under one management account. Note one practical catch: on the Free account plan, joining an organisation upgrades the account to the Paid plan, so this is a step for when Lantern goes to production.

On the CLI, `aws configure sso` writes a profile, and `aws sso login` opens the browser to sign in:

```ini title=~/.aws/config
[sso-session lantern]
sso_start_url = https://lantern.awsapps.com/start
sso_region = eu-west-1
sso_registration_scopes = sso:account:access

[profile lantern-dev]
sso_session = lantern
sso_account_id = 444455556666
sso_role_name = DeveloperAccess
region = eu-west-1
```

```bash
aws sso login --sso-session lantern
aws sts get-caller-identity --profile lantern-dev
```

The `Arn` that comes back now reads `assumed-role/AWSReservedSSO_DeveloperAccess_…/rita`: a role session, not a user.

## Workloads: roles, not keys

Code needs credentials too, and the answer is always a **role** that the platform assumes for you:

- **Lambda**: every function has an **execution role**.
- **EC2**: an **instance profile** delivers the role's credentials through the instance metadata service.
- **Amazon ECS**: a **task role** per task definition.
- **CI/CD outside AWS**, such as GitHub Actions: an OpenID Connect identity provider in IAM, so the pipeline exchanges its own token for a role session.

A role always has two policies. The **trust policy** says who may assume it:

```json title=trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

The **permissions policy** says what the role may do once assumed, written exactly like last lesson's policies.

:::figure Lambda assumes its execution role, then calls DynamoDB with temporary credentials
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">The Lambda service asks STS to assume the lantern-rsvp role. STS checks the trust policy and returns temporary credentials. The function code uses them to call DynamoDB, where IAM checks the role's permissions policy.</title>
  <rect class="d-box-primary" x="20" y="80" width="150" height="64" rx="10"/>
  <text class="d-label" x="95" y="108" text-anchor="middle">Lambda</text>
  <text class="d-label-muted" x="95" y="128" text-anchor="middle">rsvp function</text>
  <rect class="d-box-accent" x="265" y="20" width="150" height="64" rx="10"/>
  <text class="d-label" x="340" y="48" text-anchor="middle">AWS STS</text>
  <text class="d-label-muted" x="340" y="68" text-anchor="middle">checks trust policy</text>
  <rect class="d-box-success" x="510" y="140" width="150" height="64" rx="10"/>
  <text class="d-label" x="585" y="168" text-anchor="middle">DynamoDB</text>
  <text class="d-label-muted" x="585" y="188" text-anchor="middle">checks permissions</text>
  <path class="d-arrow" d="M170 96 L262 56" marker-end="url(#arrow)"/>
  <text class="d-label" x="160" y="58">1 AssumeRole</text>
  <path class="d-arrow d-dashed" d="M265 72 L174 112" marker-end="url(#arrow)"/>
  <text class="d-label" x="232" y="120">2 temp credentials</text>
  <path class="d-arrow" d="M170 134 L506 170" marker-end="url(#arrow)"/>
  <text class="d-label" x="300" y="176">3 PutItem, signed</text>
</svg>
:::

Your code then contains **no credentials at all**. The AWS SDKs use a default credential chain that finds the role's temporary credentials automatically:

```js title=rsvp/index.mjs
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// No keys here: the SDK finds the execution role's temporary credentials.
const client = new DynamoDBClient({});
// …handler code that calls client.send(…)
```

## The mistake that ends in a large bill

:::mistake Access keys in code, config or Git
A line like `accessKeyId: "AKIA…"` in source, a committed `.env` file, or a key pasted into a CI variable "for now" is one of the most common ways AWS accounts get compromised. Bots scan public repositories continuously, and a leaked key can be running expensive instances within minutes. AWS may attach a quarantine policy to a key it finds exposed, but that limits damage after the fact. The fix is structural: roles for workloads, Identity Center or `aws login` for people, and a secret scanner on the repository.
:::

Sometimes an access key is genuinely unavoidable, such as a third-party tool that only accepts keys. Then: one IAM user per tool, a least-privilege policy, a `aws:SourceIp` condition if the tool has fixed addresses, and rotation on a schedule.

Retiring an existing key is a careful sequence, because deleting a key that something still uses breaks production. Check when it was last used:

```bash
aws iam get-access-key-last-used --access-key-id AKIAIOSFODNN7EXAMPLE
```

Once nothing has used it since the replacement went live, **deactivate** it first (reversible), wait, and **delete** it only when nothing has complained. A key you suspect has leaked is different: deactivate it immediately and investigate afterwards.

:::why Cost and security are the same conversation
A leaked key costs money first and reputation second. Every key you replace with a role is a line removed from your worst-case bill.
:::

That completes identity. Section three puts it to work as you pick Lantern's compute, storage, database and network.
