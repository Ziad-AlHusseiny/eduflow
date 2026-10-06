---
summary: Say which security tasks belong to AWS and which to you for EC2, RDS and Lambda, then lock down a new account with root MFA, an everyday admin and a budget alert.
takeaways:
  - AWS is responsible for security of the cloud (buildings, hardware, network, service software); you are responsible for security in the cloud (data, access, configuration, code).
  - The more managed the service, the more of the stack AWS patches, but your data, permissions and code are always yours.
  - The root user can do anything, including closing the account, so give it a passkey or security key, never create access keys for it, and use it only for root-only tasks.
  - Do daily work as a separate admin identity with its own MFA, not as root.
  - An AWS Budgets alert warns you before a bill surprises you, but it does not stop spending on its own.
further:
  - title: Shared Responsibility Model
    url: https://aws.amazon.com/compliance/shared-responsibility-model/
  - title: Root user best practices for your AWS account
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html
  - title: Choosing a Free Tier account plan
    url: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html
  - title: Managing your costs with AWS Budgets
    url: https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html
quiz:
  - q: Lantern's API runs on AWS Lambda. A security advisory lands for an npm package bundled in the function. Who patches it?
    options:
      - text: AWS, because Lambda is a managed service and applies runtime updates.
        why: AWS patches the managed runtime (Node.js itself and the OS underneath). Dependencies you bundle are part of your code.
      - text: Lantern, because packages bundled with the function code are part of the customer's code.
        why: Correct. Under the shared responsibility model your code and its dependencies are always yours, on every service.
      - text: Nobody needs to, because Lambda functions run in isolated environments.
        why: Isolation limits the blast radius between customers. It does not stop a vulnerable library from being exploited through your own API.
    answer: 1
  - q: Which task should you do while signed in as the root user?
    options:
      - text: Creating the Lantern S3 bucket, since the root user owns the account.
        why: Any admin identity can create buckets. Using root for daily work exposes the most powerful credential for no gain.
      - text: Creating root access keys so scripts can manage the account.
        why: Root access keys are the worst credential to leak because nothing can restrict them. AWS recommends never creating them.
      - text: Turning on IAM user and role access to billing information so your admin user can see costs.
        why: Correct. That account setting is one of the few tasks only the root user can perform.
      - text: Deploying Lambda functions, because root avoids permission errors.
        why: Avoiding permission errors by using unlimited access hides design problems and makes every mistake bigger.
    answer: 2
  - q: Lantern has a monthly AWS Budgets cost budget of 20 USD with an email alert at 100%. A forgotten instance pushes spend to 35 USD. What happens?
    options:
      - text: AWS stops the instance when spend reaches 20 USD.
        why: A plain budget only notifies. Stopping resources needs a budget action or automation that you configure separately.
      - text: The account is suspended until you raise the budget.
        why: Budgets never suspend an account. They are a monitoring tool, not a spending cap.
      - text: You get an email when spend crosses 20 USD, and the instance keeps running and costing money until someone acts.
        why: Correct. The alert buys you reaction time. Someone still has to read it and delete the resource.
    answer: 2
---

Lantern's old host had a short answer to "who keeps this secure?": the maintainers did everything above the power socket. AWS splits the job. Knowing exactly where the split falls tells you what you can stop worrying about, and what you can never hand off.

## Security of the cloud, security in the cloud

AWS calls this the **shared responsibility model**. AWS is responsible for security **of** the cloud: data centres, guards, hardware, the global network, the virtualisation layer, and the software that runs each managed service. You are responsible for security **in** the cloud: your data, who can access it, how you configure each service, and the code you deploy.

The line is not fixed. It moves with how managed the service is.

:::figure Where the line falls for EC2, RDS and Lambda
<svg viewBox="0 0 660 290" role="img" aria-labelledby="t1">
  <title id="t1">Three columns. For EC2 you own data, access, app code, runtime and guest OS. For RDS you own data, access and schema while AWS runs the engine and OS. For Lambda you own data, access and code including dependencies while AWS runs the runtime and OS. AWS owns hardware and facilities in all three.</title>
  <text class="d-label-strong" x="130" y="26" text-anchor="middle">Amazon EC2</text>
  <text class="d-label-strong" x="330" y="26" text-anchor="middle">Amazon RDS</text>
  <text class="d-label-strong" x="530" y="26" text-anchor="middle">AWS Lambda</text>
  <rect class="d-box-primary" x="50" y="40" width="160" height="34" rx="6"/>
  <text class="d-label" x="130" y="62" text-anchor="middle">Data + access</text>
  <rect class="d-box-primary" x="50" y="80" width="160" height="34" rx="6"/>
  <text class="d-label" x="130" y="102" text-anchor="middle">App code</text>
  <rect class="d-box-primary" x="50" y="120" width="160" height="34" rx="6"/>
  <text class="d-label" x="130" y="142" text-anchor="middle">Runtime</text>
  <rect class="d-box-primary" x="50" y="160" width="160" height="34" rx="6"/>
  <text class="d-label" x="130" y="182" text-anchor="middle">Guest OS</text>
  <rect class="d-box-success" x="50" y="200" width="160" height="34" rx="6"/>
  <text class="d-label" x="130" y="222" text-anchor="middle">Hardware + sites</text>
  <rect class="d-box-primary" x="250" y="40" width="160" height="34" rx="6"/>
  <text class="d-label" x="330" y="62" text-anchor="middle">Data + access</text>
  <rect class="d-box-primary" x="250" y="80" width="160" height="34" rx="6"/>
  <text class="d-label" x="330" y="102" text-anchor="middle">Schema + queries</text>
  <rect class="d-box-success" x="250" y="120" width="160" height="34" rx="6"/>
  <text class="d-label" x="330" y="142" text-anchor="middle">DB engine</text>
  <rect class="d-box-success" x="250" y="160" width="160" height="34" rx="6"/>
  <text class="d-label" x="330" y="182" text-anchor="middle">OS</text>
  <rect class="d-box-success" x="250" y="200" width="160" height="34" rx="6"/>
  <text class="d-label" x="330" y="222" text-anchor="middle">Hardware + sites</text>
  <rect class="d-box-primary" x="450" y="40" width="160" height="34" rx="6"/>
  <text class="d-label" x="530" y="62" text-anchor="middle">Data + access</text>
  <rect class="d-box-primary" x="450" y="80" width="160" height="34" rx="6"/>
  <text class="d-label" x="530" y="102" text-anchor="middle">Code + deps</text>
  <rect class="d-box-success" x="450" y="120" width="160" height="34" rx="6"/>
  <text class="d-label" x="530" y="142" text-anchor="middle">Runtime</text>
  <rect class="d-box-success" x="450" y="160" width="160" height="34" rx="6"/>
  <text class="d-label" x="530" y="182" text-anchor="middle">OS</text>
  <rect class="d-box-success" x="450" y="200" width="160" height="34" rx="6"/>
  <text class="d-label" x="530" y="222" text-anchor="middle">Hardware + sites</text>
  <rect class="d-box-primary" x="150" y="256" width="24" height="18" rx="4"/>
  <text class="d-label" x="182" y="270">You</text>
  <rect class="d-box-success" x="260" y="256" width="24" height="18" rx="4"/>
  <text class="d-label" x="292" y="270">AWS</text>
</svg>
:::

On EC2 you patch the operating system, exactly as on Lantern's old server. On RDS, AWS patches the database engine and OS during a maintenance window you choose, but your schema, users and network access are yours. On Lambda, AWS keeps the runtime and OS patched, and you own the code and every package you bundle with it. The top row never moves: **your data and who can reach it are always your job.**

## Lock down the account before you build

A new account is the most dangerous moment, because the only identity is the all-powerful root user. Here is the setup Lantern uses, in order.

### 1. Choose the right account plan

At sign-up, AWS (as of 2026) offers a **Free plan** and a **Paid plan**. Both start with promotional credits, and both include monthly free usage for over thirty services. The Free plan guarantees no charges, but limits you to selected services and closes the account after six months or when the credits run out, unless you upgrade. The Paid plan unlocks everything and bills you for usage beyond the credits. Use the Free plan to learn; Lantern's production account is on the Paid plan, which is exactly why the budget in step 4 matters.

### 2. Protect the root user

The root user is the email address you signed up with. It can change billing details and close the account, and IAM policies cannot restrict it. AWS requires MFA on root users; register a **passkey or security key** if you can, because they resist phishing in a way that six-digit codes do not. Never create access keys for root. After setup, you sign in as root only for the handful of root-only tasks, such as turning on **IAM user and role access to billing information** in the account settings, so that your admin identity can see costs.

### 3. Create an everyday admin

Daily work happens as a separate identity. For a single standalone account like Lantern's first one, that is an IAM user with console access, a strong password, its own MFA, and membership of an `Admins` group that has the `AdministratorAccess` managed policy. Section two explains every one of those words, and how teams with several accounts use IAM Identity Center instead.

### 4. Set a budget before anything else

In **AWS Budgets**, create a monthly cost budget at an amount that would worry you, say 20 USD, with email alerts at 80% of actual spend and at 100% of forecasted spend. The forecast alert matters: it fires early in the month when the trend says you will overshoot. Under the hood a budget is a small JSON document:

```json title=budget.json
{
  "BudgetName": "lantern-monthly",
  "BudgetLimit": { "Amount": "20", "Unit": "USD" },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

:::mistake Thinking a budget is a spending cap
A budget sends an alert; it does not switch anything off. If nobody reads the email, the forgotten instance keeps running. Send alerts to an address someone actually watches, and when one fires, find and delete the cause the same day.
:::

### 5. Fill in the alternate contacts

Under account settings, add a **security** contact and a **billing** contact. When AWS detects something suspicious, such as leaked credentials, it emails them. On a one-person project those emails easily land in a forgotten inbox.

:::tip Ten minutes that pay for themselves
Root MFA, an admin user, a budget and alternate contacts take about ten minutes. Most horror stories you read about surprise bills and hijacked accounts skipped at least two of them.
:::

The account is safe to use. Next you will drive it from the terminal with the AWS CLI v2 and prove which identity you are using.
