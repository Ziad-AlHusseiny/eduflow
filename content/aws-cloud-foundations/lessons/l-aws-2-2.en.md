---
summary: Read any IAM policy statement by statement, write least-privilege policies with exact ARNs, and add conditions such as MFA and TLS that tighten when an allow applies.
takeaways:
  - A statement is Effect plus Action plus Resource, optionally narrowed by a Condition; resource-based policies also name a Principal.
  - Bucket-level actions such as s3:ListBucket take the bucket ARN, while object-level actions such as s3:GetObject need the bucket ARN followed by /* or a narrower path.
  - Least privilege means listing the specific actions and resources a job needs, then widening only when a real AccessDenied tells you to.
  - Condition keys are ANDed with each other, and multiple values for one key are ORed.
  - Validate every policy before attaching it with IAM Access Analyzer, in the console editor or with aws accessanalyzer validate-policy.
further:
  - title: IAM JSON policy element reference
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html
  - title: AWS global condition context keys
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html
  - title: Security best practices in IAM
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
  - title: Validate policies with IAM Access Analyzer
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-validation.html
quiz:
  - q: |
      A function with this policy calls `GetObject` on `posters/2026/festival.jpg` in the `lantern-posters` bucket and gets AccessDenied. Why?
      ```json
      {
        "Effect": "Allow",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::lantern-posters"
      }
      ```
    options:
      - text: The Action should be `s3:Get*` because `GetObject` is not a real action name.
        why: "`s3:GetObject` is the real action. A wildcard would only broaden the policy without fixing the actual problem."
      - text: The Resource is the bucket, but GetObject acts on objects, so it needs `arn:aws:s3:::lantern-posters/*`.
        why: Correct. Object actions match object ARNs. Without `/*` (or a narrower path) the statement never matches the request.
      - text: S3 policies must include a Principal element, so the statement is ignored.
        why: Identity-based policies have no Principal; the identity they are attached to is the principal. Only resource-based policies need one.
      - text: The Version line is missing, so IAM rejects the whole policy.
        why: Without a Version, IAM falls back to the old 2008 language and policy variables stop working, but a simple statement like this still matches.
    answer: 1
  - q: |
      Which requests does this condition allow?
      ```json
      "Condition": {
        "StringEquals": { "aws:RequestedRegion": ["eu-west-1", "eu-south-2"] },
        "Bool": { "aws:SecureTransport": "true" }
      }
      ```
    options:
      - text: Requests to either Region, whether or not they use TLS.
        why: The two keys are ANDed, so the TLS check still applies to every request.
      - text: Requests that use TLS, to any Region.
        why: Different keys are ANDed. The Region key still has to match one of its listed values.
      - text: Requests to eu-west-1 or eu-south-2 that also use TLS.
        why: Correct. Values inside one key are ORed (either Region) and separate keys are ANDed (and TLS).
    answer: 2
  - q: You need a policy for Lantern's poster-resize function but you are not sure which S3 actions it calls. What is the best starting point?
    options:
      - text: Grant `s3:*` on `*` and narrow it later when there is time.
        why: '"Later" rarely comes, and in the meantime any bug or compromise in the function can touch every bucket in the account.'
      - text: Grant the actions you know it needs on the exact bucket path, then add actions only when a real AccessDenied shows they are missing.
        why: Correct. AccessDenied errors name the missing action, so widening on evidence is fast and keeps the policy tight.
      - text: Attach the AWS managed `AmazonS3FullAccess` policy because AWS maintains it.
        why: AWS maintains the policy text, not its fit for your job. Full access to every bucket is far broader than one function needs.
    answer: 1
  - q: |
      What does this bucket policy statement do?
      ```json
      {
        "Effect": "Deny",
        "Principal": "*",
        "Action": "s3:*",
        "Resource": ["arn:aws:s3:::lantern-posters", "arn:aws:s3:::lantern-posters/*"],
        "Condition": { "Bool": { "aws:SecureTransport": "false" } }
      }
      ```
    options:
      - text: Blocks every request to the bucket, including from admins.
        why: The condition limits it to requests where SecureTransport is false, meaning plain HTTP. HTTPS requests are unaffected.
      - text: Blocks any request made over plain HTTP, from anyone.
        why: Correct. It is a standard guardrail. Combined with the explicit-deny rule, nobody can read or write the bucket without TLS.
      - text: Allows anonymous users to read the bucket over HTTPS.
        why: A Deny statement never grants anything. Public access would need an Allow and Block Public Access turned off.
    answer: 1
---

In the last lesson you learned how IAM decides. Now you write what it decides *from*. Lantern needs a policy for the function that receives poster uploads, a policy for the developers, and a bucket policy that protects the posters. All three are the same small JSON language.

## Anatomy of a statement

Here is the policy for Lantern's upload function, which saves posters under `uploads/` and occasionally lists what is there:

```json title=lantern-upload-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "WriteUploads",
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::lantern-posters/uploads/*"
    },
    {
      "Sid": "ListUploadsOnly",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::lantern-posters",
      "Condition": {
        "StringLike": { "s3:prefix": "uploads/*" }
      }
    }
  ]
}
```

Read it top to bottom:

- `Version` is always `"2012-10-17"`, the current policy language version. It is a fixed string, not today's date.
- `Statement` is a list. Each statement is evaluated on its own.
- `Sid` is an optional label. Name what the statement is for; future you will thank you.
- `Effect` is `Allow` or `Deny`.
- `Action` is one action or a list, written `service:Operation`. Wildcards work (`s3:Get*`) but each one widens the door.
- `Resource` is one ARN or a list. Wildcards work here too.
- `Condition` is optional and narrows when the statement applies.

Resource-based policies, such as bucket policies, add a `Principal` element naming who the statement is about. Identity-based policies don't have one, because the identity they are attached to *is* the principal.

## Bucket ARN or object ARN?

The policy above has two different resources on purpose. `s3:ListBucket` is an operation on the **bucket**, so its resource is `arn:aws:s3:::lantern-posters`. `s3:PutObject` is an operation on **objects**, so its resource is the bucket ARN followed by a path: `lantern-posters/uploads/*`. Swap them and neither statement ever matches, and you get AccessDenied with a policy that looks right.

The same distinction exists elsewhere. DynamoDB's `dynamodb:Query` on a table index needs the index ARN (`table/lantern-rsvps/index/by-event`), not only the table ARN. When a policy "obviously" allows something and AWS says no, compare the request's ARN with the policy's character by character.

:::mistake The convenient wildcard
`"Action": "s3:*", "Resource": "*"` makes every AccessDenied go away, including for the call a bug or an attacker makes to delete another bucket. Wildcards in **both** Action and Resource are almost never right outside an admin role. If you need a wildcard, put it in one place and pin the other.
:::

## Least privilege, in practice

**Least privilege** means granting only the actions and resources a job needs. It sounds slow, but the workflow is quick:

1. Write down what the job does in plain words: "write posters to `uploads/`, list that prefix".
2. Translate each verb into an action, and each noun into an exact ARN.
3. Deploy and test. An AccessDenied message names the missing action and resource; add exactly that.

For existing roles, IAM shows **last accessed** information per service, and IAM Access Analyzer can generate a policy from the actions a role actually used according to AWS CloudTrail. Both are good ways to shrink a policy that grew too wide.

## Conditions: when an allow applies

A condition block maps **operators** to **keys** and **values**:

```json
"Condition": {
  "StringEquals": { "aws:RequestedRegion": ["eu-west-1", "eu-south-2"] },
  "Bool": { "aws:MultiFactorAuthPresent": "true" }
}
```

Two rules make conditions predictable. Separate keys are **ANDed**: the request must be in one of those Regions *and* made with MFA. Multiple values for one key are **ORed**: either Region will do.

Useful keys for Lantern:

| Key | Use it to |
|---|---|
| `aws:SecureTransport` | refuse plain-HTTP requests |
| `aws:MultiFactorAuthPresent` | require MFA for risky actions such as deletes |
| `aws:SourceIp` | limit a human to the office or VPN range |
| `aws:RequestedRegion` | keep work inside Lantern's Regions |
| `s3:prefix` | limit ListBucket to a folder |

Conditions also make great **deny** guardrails. Lantern's bucket policy refuses any request without TLS, from anyone:

```json title=lantern-posters-bucket-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::lantern-posters",
        "arn:aws:s3:::lantern-posters/*"
      ],
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    }
  ]
}
```

Because an explicit deny always wins, no allow anywhere can undo it.

## Validate before you attach

The IAM console's policy editor runs **IAM Access Analyzer** checks as you type: syntax errors, invalid actions, and security warnings such as a pass-role wildcard. From the terminal:

```bash
aws accessanalyzer validate-policy \
  --policy-type IDENTITY_POLICY \
  --policy-document file://lantern-upload-policy.json \
  --query "findings[].[findingType,issueCode]" --output table
```

An empty result means no findings. Fix every `ERROR` and `SECURITY_WARNING`, and read each `WARNING` and `SUGGESTION`.

:::tip Policies are code
Keep Lantern's policies in the repository next to the app, review them in pull requests, and validate them in CI. A policy change can do more damage than a code change, so it deserves at least the same review.
:::

You can now write tight permissions. Next: how people get them without IAM users, and how code gets them without access keys.
