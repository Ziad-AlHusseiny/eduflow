# Review: aws-cloud-foundations

## Verdict

This is a strong course. It is built around one project (Lantern) from first lesson to last. Cost and security run through every lesson, and the IAM, S3, CloudFront and serverless material is mostly accurate and current for 2026: the Free/Paid account plans, `aws login` (CLI 2.32.0+), AZ ID mapping before and after November 2025, OAC with an `AWS:SourceArn` bucket policy, `nodejs24.x`, and the managed `CachingOptimized` and `SecurityHeadersPolicy` policies. I checked all of these against the AWS documentation.

The fixes were mostly small. A few facts had gone stale since the course was written:

- S3's maximum object size is now 50 TB, not 5 TB.
- Regional NAT gateways now exist.

Some statements were imprecise:

- Stopped instances keep billing for Elastic IPs only. An auto-assigned public IP is released when the instance stops.
- The "account-level" Block Public Access command was really a bucket-level command.

There was one real code bug: a missing `name` made the lesson's DynamoDB DocumentClient throw. A name, "Skylane", appeared in three places without ever being introduced.

The Arabic reads naturally overall. It had a handful of real mistranslations:

- "zonal" was rendered as منطقية, which means "logical".
- "data rules" was rendered as قواعد البيانات, which means "databases".
- "lock down" was rendered as أغلق, which suggests closing the account.

It also had some awkward constructions, such as الـ Regionين and قاعدة قاعدة البيانات. All of these are fixed, and both checks pass clean.

## Issues

| File | Category | Severity | What was wrong | What I changed |
|---|---|---|---|---|
| lessons/l-aws-1-2.ar.md | arabic | high | "zonal" translated as موارد منطقية, which means "logical resources", in two quiz `why`s and the body | Changed to مرتبطة بمنطقة توافر (zonal) |
| lessons/l-aws-3-4.ar.md | arabic | high | Same: "subnets are zonal" rendered as منطقية | Changed to مرتبطة بمنطقة توافر واحدة (zonal) |
| lessons/l-aws-1-2.ar.md, assessments.ar.yaml, exercises/l-aws-1-2.ar.json | arabic | high | "data rules" rendered as قواعد البيانات, which reads as "databases" (about 12 places, including the takeaway, the selection order, quiz `why`s, the exercise and the checkpoint/final questions) | Changed to قواعد حماية البيانات / قاعدة حماية البيانات |
| course.ar.json, l-aws-1-1.ar.md, l-aws-1-3.ar.md | arabic | medium | "Lock down the account" rendered as أغلق الحساب بإحكام and محكم الإغلاق, which suggest closing the account | Changed to أمّن/تأمين الحساب بإحكام; the budget "alert" in the description now uses تنبيه, consistent with the lessons |
| lessons/l-aws-1-3.ar.md | arabic | medium | "as of 2026" translated as حتى عام 2026, which means "until 2026" | Changed to في عام 2026 |
| lessons/l-aws-3-2.en/ar.md | accuracy | high | "objects up to 5 TB each". S3 raised the limit to 50 TB in December 2025 | Changed to 50 TB |
| lessons/l-aws-3-2.en/ar.md | accuracy | medium | Text says "set Block Public Access at the account level too" but the command was the bucket-level `s3api put-public-access-block --bucket` | Changed to `aws s3control put-public-access-block --account-id …` |
| lessons/l-aws-3-2.en/ar.md | accuracy | low | "Every instance boots from [an EBS volume]" (instance-store AMIs exist) | "Almost every instance" |
| lessons/l-aws-3-1.en/ar.md | accuracy | medium | Said a stopped instance keeps billing for "any public IPv4 address". Auto-assigned public IPs are released on stop; only Elastic IPs keep billing | Takeaway, quiz `why` and mistake callout now say Elastic IP, with the auto-assigned case explained |
| lessons/l-aws-4-2.en/ar.md | accuracy | high | The lesson's function crashes (500) when the body has no `name`: lib-dynamodb refuses `undefined` values by default | Added `marshallOptions: { removeUndefinedValues: true }` with a comment (same code in both languages) |
| lessons/l-aws-3-4.en/ar.md | accuracy | low | No mention of the regional NAT gateway (GA November 2025), which changes the "one NAT per AZ" trade-off; "public subnets hold only the NAT gateways" contradicted the single-NAT design | Added a one-sentence note on regional NAT gateways; changed "gateways" to "gateway" |
| lessons/l-aws-1-4.en/ar.md | accuracy | low | Said IAM "decided `get-caller-identity` was allowed". That call works even under an explicit deny | Reworded and named it as the one exception |
| lessons/l-aws-2-1.en/ar.md | accuracy | low | "Organisations add … permissions boundaries". Permissions boundaries are an IAM feature, not an Organizations one | Attributed SCPs to AWS Organizations and boundaries to individual users and roles |
| lessons/l-aws-2-2.en/ar.md | accuracy | low | Access Analyzer finding types listed without `WARNING` | Added `WARNING` |
| lessons/l-aws-2-3.en/ar.md | accuracy | low | "Lambda assumes the role on each cold start" is imprecise; "access keys are *the* most common way accounts get compromised" is overstated | Lambda wording is now "assumes the role for you and hands each execution environment short-term credentials"; overstatement softened to "one of the most common ways" (takeaway and callout) |
| lessons/l-aws-4-1.en/ar.md | accuracy | low | Takeaway said the certificate "must be issued by ACM in us-east-1"; imported certificates also work | Now "must live in ACM in us-east-1, requested or imported there" |
| lessons/l-aws-4-3.en/ar.md | accuracy | low | "cache hit rate" listed as an ordinary CloudFront metric; `CacheHitRate` is an additional metric you must turn on | Named it and added "(an additional metric you turn on)" |
| exercises/l-aws-3-3.en/ar.json | accuracy | low | Implied TTL deletes counters exactly at expiry | Added that TTL deletes usually within a day or two, so code still checks expiry |
| assessments.en/ar.yaml | accuracy | low | Final question on the RDS minor patch implied AWS always applies it | `why` now notes this relies on automatic minor version upgrades (on by default) |
| exercises/l-aws-3-1, l-aws-3-4, l-aws-4-3 (en/ar) | pedagogy | medium | "Skylane" appears three times and is never introduced (looks like a leftover from another draft) | Removed: "A cost review of Lantern…", "the sensible default is…", "a checklist to run on every account" |
| exercises/l-aws-4-1.en/ar.json | pedagogy | medium | Order exercise was ambiguous: the certificate step could validly come before build/upload, but only one order is accepted | Prompt now says to finish build-and-S3 work first, then certificate, CloudFront and DNS |
| exercises/l-aws-2-1.en/ar.json | consistency | low | Object referred to as `posters/2026/…` while the lesson's ARN uses `lantern-posters/2026/…` | Changed to `s3://lantern-posters/2026/street-food-festival.jpg` |
| lessons/l-aws-3-2.en/ar.md | pedagogy | low | "eleven-nines durability design" is jargon a beginner may not know | Spelled out as 99.999999999% |
| lessons/l-aws-2-3.ar.md, glossary.ar.json, assessments.ar.yaml | arabic | medium | "permission sets" rendered as مجموعات الصلاحيات, which clashes with مجموعات (IAM groups) | Changed to حزم الصلاحيات / حزمة صلاحيات throughout |
| l-aws-2-3.ar.md, exercises/l-aws-2-3.ar.json, assessments.ar.yaml, l-aws-3-1.ar.md | arabic | low | "retire a key" literally rendered as إحالة إلى التقاعد; "dozen" as دزينة | Changed to التخلّص من مفتاح… / يُستغنى عنه; بنحو اثني عشر سرًّا |
| lessons/l-aws-2-2.ar.md | arabic | low | الـ Regionين (an Arabic dual ending on an English word), 3 places | Rewritten (الـ Regions المذكورة / أيٌّ من الاثنتين) |
| assessments.ar.yaml | arabic | low | قاعدة قاعدة البيانات (ambiguous); "a lower threshold" mistranslated as الحد الأدنى ("the minimum"); "workflow" construction ungrammatical | Rewritten |
| lessons/l-aws-3-4.ar.md | arabic | low | Typo لجأ (should be imperative الجأ); "lock traffic down" rendered with أحكم إغلاق | Fixed; now ضيّق الزيارات المسموح بها |
| l-aws-1-4, l-aws-2-1, l-aws-3-1, l-aws-3-3, l-aws-4-1, l-aws-4-2 (.ar.md); exercises/l-aws-2-2.ar.json; glossary.ar.json | arabic | low | Agreement and phrasing slips: أكثر أمر مفيد… أكثرها; معدّن عملات; في الغالب الأعم; تضاعف… بما يقارب الضعف (redundant); instanceين; يتحدّث SQL; فيصيب الزوّار… miss ويضربون S3; لا يكشفه إلا قراءة; the closing-question phrasing | Each sentence rewritten in natural MSA |

## Verified against official docs

- Free and Paid account plans: $100 plus up to $100 in credits; the Free plan closes after 6 months or when credits run out; the Free plan excludes Savings Plans and RIs; joining Organizations upgrades the plan. Source: docs.aws.amazon.com/awsaccountbilling free-tier-plans.
- `aws login`: CLI 2.32.0 minimum, the `login_session` profile key, refresh for up to 12 hours, `SignInLocalDevelopmentAccess`, `aws logout`.
- AZ names and AZ IDs: independent mapping for accounts created before November 2025 in the oldest Regions.
- Lambda runtimes: `nodejs24.x` is supported until April 2028.
- CloudFront: the `CachingOptimized` cache policy has a minimum TTL of 1 s, a default of 24 h and a maximum of 365 days. The `SecurityHeadersPolicy` response headers policy adds HSTS with max-age=31536000, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and X-XSS-Protection.
- CloudFront flat-rate plans (November 2025): CDN, WAF, Route 53 DNS and S3 credits, with no overage charges.
- HTTP API vs REST API: API keys, per-client throttling, request validation, caching and WAF are REST-only.
- S3 maximum object size is 50 TB (December 2025). Regional NAT gateway (November 2025).

## Not changed / could not fully verify

- The RDS `create-db-instance` example uses `db.t4g.micro` with `--multi-az`. I believe Multi-AZ is supported on that class for PostgreSQL but did not confirm it for every Region.
- I did not check pricing for the regional NAT gateway, so the lesson only says to compare its price.
- The order exercise in l-aws-2-3 has a small inherent ambiguity: writing the policy and creating the role could be swapped. I left it, because the hints and the explanation make the intended order clear.
