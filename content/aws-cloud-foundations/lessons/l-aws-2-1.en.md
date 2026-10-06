---
summary: Tell IAM users, groups and roles apart, know where identity-based and resource-based policies attach, and predict whether AWS allows a request using the deny-allow-deny rule.
takeaways:
  - Every AWS request carries a principal, an action, a resource ARN and a context, and IAM evaluates all four before anything happens.
  - Users are long-term identities, groups are a way to give users the same policies, and roles are identities with no long-term credentials that trusted principals assume for temporary credentials.
  - Identity-based policies attach to users, groups and roles; resource-based policies, such as S3 bucket policies, attach to the resource and name a principal.
  - Everything is denied by default, an explicit allow is needed to permit a request, and an explicit deny anywhere always wins.
further:
  - title: IAM identities (users, user groups, and roles)
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/id.html
  - title: Policy evaluation logic
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html
  - title: IAM identifiers (ARNs)
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-identifiers.html
quiz:
  - q: Lantern's developer Sam has no policies that mention DynamoDB. Sam runs `aws dynamodb scan --table-name lantern-rsvps`. What happens?
    options:
      - text: It succeeds, because nothing denies it.
        why: IAM is deny by default. A request needs an explicit allow from some policy, and nothing allows this one.
      - text: It is denied, because no policy allows the action (an implicit deny).
        why: Correct. With no matching allow, the default deny stands and the CLI returns an AccessDenied error.
      - text: It succeeds only if Sam signed in with MFA.
        why: MFA matters only when a policy condition checks for it. It cannot create permissions that no policy grants.
    answer: 1
  - q: A policy allows `s3:*` on Lantern's posters bucket for the Developers group, and a second policy explicitly denies `s3:DeleteBucket` for the same group. A developer tries to delete the bucket. What happens?
    options:
      - text: It is denied, because an explicit deny overrides any allow.
        why: Correct. Deny statements are checked first and always win, which makes them a reliable guardrail.
      - text: It succeeds, because the more general allow was attached first.
        why: Order of attachment and statement order do not matter. IAM evaluates all applicable policies together.
      - text: It succeeds, because `s3:*` is more powerful than a single action.
        why: Wildcards only widen what an allow matches. They never outrank a deny.
    answer: 0
  - q: Which statement about IAM roles is accurate?
    options:
      - text: A role has its own password, which you share with the team that uses it.
        why: Roles have no password and no long-term access keys. That is their main security advantage.
      - text: A role is a type of group, so you add users to it.
        why: Groups contain users; roles do not. A principal assumes a role and gets that role's permissions for a session.
      - text: A role is assumed by a trusted principal, which receives temporary credentials that expire.
        why: Correct. The role's trust policy says who may assume it, and AWS STS issues credentials that expire after the session duration.
      - text: A role can only be used by AWS services, never by people.
        why: People assume roles all the time, for example through IAM Identity Center or when switching roles in the console.
    answer: 2
---

At the end of section one you ran `aws sts get-caller-identity` and AWS answered. Behind that answer, and behind every other call, sits **AWS Identity and Access Management (IAM)**. It answers one question billions of times a day: is *this* principal allowed to do *this* action on *this* resource, right now? Lantern's old server had one answer for everything: whoever had the SSH key could do anything. This lesson gives you the vocabulary to do better.

## Anatomy of a request

Every request to AWS, from the console, the CLI or code, carries four things:

- **Principal**: who is asking. A user, a role session, or an AWS service.
- **Action**: what they want, written `service:Operation`, such as `s3:GetObject` or `dynamodb:PutItem`.
- **Resource**: what they want it on, identified by an **ARN** (Amazon Resource Name).
- **Context**: everything else IAM can see, such as the source IP address, the time, whether MFA was used, or whether the request used TLS.

ARNs follow the pattern `arn:partition:service:region:account-id:resource`. Some parts are empty when they don't apply:

```text
arn:aws:iam::111122223333:user/amara
arn:aws:s3:::lantern-posters/2026/street-food-festival.jpg
arn:aws:dynamodb:eu-west-1:111122223333:table/lantern-rsvps
```

IAM is global, so the user ARN has no Region. S3 bucket names are unique across all of AWS, so an S3 ARN has neither Region nor account. DynamoDB tables are regional and belong to an account, so their ARN has both. You will write ARNs constantly in the next lesson.

## The identities

**Users** are long-term identities for one person or, in older setups, one application. A user can have a console password and up to two access keys. Users are the oldest part of IAM, and in section one you created exactly one, your admin.

**Groups** are collections of users. You attach policies to a group, and every member gets them. Lantern creates `Admins`, `Developers` and `Billing`, so that when a volunteer joins or leaves, you change one membership instead of hunting through individual permissions. Groups are not principals: you can't sign in as a group or name one in a bucket policy.

**Roles** are identities with permissions but **no long-term credentials**. A trusted principal assumes a role, and AWS Security Token Service (STS) hands back temporary credentials that expire. A role's **trust policy** says who may assume it: a Lambda function, an EC2 instance, a user in another account, or people signed in through IAM Identity Center. Roles are how code gets permissions without secrets, and lesson three of this section builds on them.

```bash
aws iam create-group --group-name Developers
aws iam attach-group-policy --group-name Developers \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
aws iam add-user-to-group --group-name Developers --user-name sam
```

## Where policies live

A **policy** is a JSON document of statements that allow or deny actions on resources. Where it is attached changes how it reads:

- **Identity-based policies** attach to a user, group or role and describe what *that identity* may do. They come as AWS managed policies (like `ReadOnlyAccess`), customer managed policies you write and reuse, or inline policies embedded in a single identity.
- **Resource-based policies** attach to a resource and name the **principal** they apply to. An S3 bucket policy, a Lambda function's resource policy and a role's trust policy are all resource-based.

Within one account, a request is allowed if either kind of policy allows it and nothing denies it. Across accounts, both sides must allow it.

## How IAM decides

The evaluation rule fits on an index card, and it explains nearly every AccessDenied error you will ever see.

:::figure Explicit deny wins, then any allow, otherwise the default deny
<svg viewBox="0 0 660 250" role="img" aria-labelledby="t1">
  <title id="t1">Flowchart. A request first checks for any explicit deny; if found the result is deny. Otherwise it checks for any allow; if found the result is allow, otherwise the result is an implicit deny.</title>
  <rect class="d-box" x="20" y="96" width="120" height="56" rx="10"/>
  <text class="d-label" x="80" y="129" text-anchor="middle">Request</text>
  <path class="d-arrow" d="M140 124 L186 124" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="190" y="90" width="150" height="68" rx="10"/>
  <text class="d-label" x="265" y="119" text-anchor="middle">Explicit Deny</text>
  <text class="d-label" x="265" y="139" text-anchor="middle">anywhere?</text>
  <path class="d-arrow" d="M265 90 L265 50" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="278" y="74">yes</text>
  <rect class="d-box-warn" x="200" y="10" width="130" height="38" rx="8"/>
  <text class="d-label-strong" x="265" y="35" text-anchor="middle">Denied</text>
  <path class="d-arrow" d="M340 124 L386 124" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="352" y="114">no</text>
  <rect class="d-box-primary" x="390" y="90" width="150" height="68" rx="10"/>
  <text class="d-label" x="465" y="119" text-anchor="middle">Any Allow</text>
  <text class="d-label" x="465" y="139" text-anchor="middle">matches?</text>
  <path class="d-arrow" d="M540 124 L580 124" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="546" y="114">yes</text>
  <rect class="d-box-success" x="584" y="105" width="70" height="38" rx="8"/>
  <text class="d-label-strong" x="619" y="130" text-anchor="middle">Allowed</text>
  <path class="d-arrow" d="M465 158 L465 196" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="476" y="182">no</text>
  <rect class="d-box" x="380" y="200" width="170" height="40" rx="8"/>
  <text class="d-label-strong" x="465" y="225" text-anchor="middle">Implicitly denied</text>
</svg>
:::

1. **Default deny.** Every request starts denied.
2. **Explicit deny wins.** If any applicable policy has a matching `Deny`, the answer is no. Nothing can override it.
3. **Explicit allow permits.** Otherwise, if a policy has a matching `Allow`, the answer is yes.
4. **No match means no.** If nothing allowed it, the default deny stands. This is called an implicit deny.

Larger setups add further layers that can only narrow what is allowed, such as service control policies from AWS Organizations and permissions boundaries on individual users and roles. The rule above still holds; those layers add more places a deny can come from.

You can ask IAM to evaluate a request without making it:

```bash
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::111122223333:user/sam \
  --action-names s3:DeleteBucket \
  --resource-arns arn:aws:s3:::lantern-posters \
  --query "EvaluationResults[].EvalDecision"
```

The answer is `allowed`, `explicitDeny` or `implicitDeny`, which tells you not only *whether* but *why*.

:::mistake One shared IAM user for the whole team
Lantern's old habit was one SSH key passed around. The cloud version is one IAM user whose password everyone knows. You lose any record of who did what, you can't remove one person's access without rotating everyone's, and MFA ends up on one person's phone. One identity per human, permissions through groups, always.
:::

:::tip Cost of IAM
IAM itself has no charge. The cost of getting it wrong is what shows up: a leaked credential running someone else's crypto miner on your bill. Tight permissions are a cost control as much as a security one.
:::

You can now read who is asking and how the decision is made. Next you write the policies themselves, line by line.
