---
summary: Watch Lantern in production with CloudWatch metrics, logs and alarms, then review the whole design against the six Well-Architected pillars with cost optimisation in mind.
takeaways:
  - CloudWatch collects metrics, logs and alarms for AWS services automatically; Lambda writes to the /aws/lambda/<function-name> log group.
  - An alarm watches one metric against a threshold and notifies an Amazon SNS topic, which emails the people who can act.
  - New log groups keep data forever by default, so set a retention period on every log group to cap storage costs.
  - The Well-Architected Framework has six pillars, namely operational excellence, security, reliability, performance efficiency, cost optimization and sustainability.
  - Cost optimisation is a habit of deleting idle resources, right-sizing, using the right pricing model and tagging so you can see what each thing costs.
further:
  - title: What is Amazon CloudWatch?
    url: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html
  - title: Using Amazon CloudWatch alarms
    url: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html
  - title: Analyzing log data with CloudWatch Logs Insights
    url: https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html
  - title: AWS Well-Architected Framework
    url: https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
quiz:
  - q: Lantern's maintainers want to hear about RSVP failures before users complain. What should they set up?
    options:
      - text: A CloudWatch dashboard that someone checks every Friday.
        why: Dashboards are good for looking around, but nobody watches them at 9 p.m. on festival night.
      - text: A log group with a longer retention period.
        why: Keeping logs longer helps investigation afterwards. It does not tell anyone that something is failing now.
      - text: An AWS Budgets alert on the Lambda service.
        why: A budget tracks spend, not errors. A broken function can fail cheaply for days.
      - text: A CloudWatch alarm on the function's `Errors` metric that notifies an SNS topic with the maintainers' email.
        why: Correct. An alarm turns a metric into a notification, so a spike in errors reaches a person within minutes.
    answer: 3
  - q: Six months in, CloudWatch is a surprisingly large line on Lantern's bill. Which change most likely helps?
    options:
      - text: Set a retention period on log groups and stop logging full request bodies.
        why: Correct. Log groups never expire data by default, and ingestion and storage are charged per gigabyte.
      - text: Turn off the default Lambda metrics.
        why: The standard Lambda metrics are published automatically and are not what makes the bill grow.
      - text: Delete the alarms, since each one costs money.
        why: Alarms have a small monthly cost and catch real problems. Removing them saves little and loses visibility.
    answer: 0
  - q: In a Well-Architected review, the finding "the old migration EC2 instance is still running, three weeks after cut-over" belongs mainly to which pillar?
    options:
      - text: Performance efficiency
        why: Nothing is slow; the instance is simply not needed. Performance efficiency is about using resources effectively for the load.
      - text: Reliability
        why: An idle server does not affect whether the site recovers from failures.
      - text: Operational excellence
        why: Better operations would have caught it, but the direct impact is money spent for nothing.
      - text: Cost optimization
        why: Correct. Paying for idle resources is the textbook cost finding, and the fix is to snapshot what you need and terminate the instance.
    answer: 3
  - q: Why tag every Lantern resource with `project=lantern` and activate that tag for cost allocation?
    options:
      - text: Cost Explorer can then break the bill down by project, so you see what Lantern costs separately from anything else in the account.
        why: Correct. Activated cost allocation tags become a dimension in Cost Explorer and in budgets.
      - text: Tagged resources get a discount.
        why: Tags have no effect on price. They describe resources so you can group, filter and control them.
      - text: AWS deletes untagged resources after 30 days.
        why: AWS never deletes your resources for missing tags. Untagged resources just become hard to attribute.
    answer: 0
---

Lantern is live: the site on CloudFront, RSVPs on Lambda and DynamoDB, events in RDS. On the old server, "monitoring" meant a volunteer noticing that the site was down. This lesson gives Lantern eyes, with **Amazon CloudWatch**, and then steps back to review the whole design with the **AWS Well-Architected Framework**.

## Metrics: what is happening

AWS services publish **metrics** to CloudWatch automatically. Each lives in a namespace and has dimensions, such as `AWS/Lambda` with `FunctionName=lantern-rsvp`. The handful that matter most for Lantern:

| Service | Metric | Tells you |
|---|---|---|
| Lambda | `Errors`, `Throttles`, `Duration` | Failures, capacity limits hit, slowness |
| API Gateway | `5xx`, `4xx`, `Latency` | What users actually experienced |
| DynamoDB | `ThrottledRequests` | Requests the table refused |
| CloudFront | `5xxErrorRate`, `CacheHitRate` (an additional metric you turn on) | Edge health and how well caching works |

## Logs: why it happened

Anything a Lambda function writes to stdout lands in **CloudWatch Logs**, in the log group `/aws/lambda/lantern-rsvp`. Switch the function's log format to JSON in its logging configuration, log objects rather than sentences, and you can query them later with **CloudWatch Logs Insights**:

```text
fields @timestamp, level, message, eventId
| filter level = "ERROR"
| sort @timestamp desc
| limit 20
```

:::mistake Logs that never expire
New log groups keep everything forever, and you pay for every gigabyte ingested and stored. Set a retention period on each log group the day it appears, and never log full request bodies: they inflate the bill and put names and email addresses in places your privacy policy didn't plan for.
:::

```bash
aws logs put-retention-policy \
  --log-group-name /aws/lambda/lantern-rsvp --retention-in-days 30
```

## Alarms: tell a human

A metric nobody looks at is trivia. An **alarm** watches one metric against a threshold and changes state when it is crossed, notifying an **Amazon SNS** topic that emails the maintainers:

```bash
aws cloudwatch put-metric-alarm --alarm-name lantern-rsvp-errors \
  --namespace AWS/Lambda --metric-name Errors \
  --dimensions Name=FunctionName,Value=lantern-rsvp \
  --statistic Sum --period 300 --evaluation-periods 1 \
  --threshold 5 --comparison-operator GreaterThanOrEqualToThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:eu-west-1:111122223333:lantern-alerts
```

Five errors in five minutes pages someone; an idle night, with no data at all, does not. Lantern starts with three alarms: Lambda errors, API Gateway 5xx responses, and DynamoDB throttles. Fewer, meaningful alarms beat many noisy ones that people learn to ignore.

## The Well-Architected review

The **AWS Well-Architected Framework** is AWS's checklist of design questions, grouped into six **pillars**. The free **AWS Well-Architected Tool** in the console walks you through them. Here is Lantern's first review, one finding per pillar:

| Pillar | Lantern finding | Action |
|---|---|---|
| Operational excellence | Deploys are a sequence of manual commands | Script them; then infrastructure as code |
| Security | One volunteer still uses an IAM user | Move everyone to IAM Identity Center |
| Reliability | RDS is Multi-AZ; RSVP table has no point-in-time recovery | Turn PITR on |
| Performance efficiency | RSVP function at 128 MB takes 900 ms | Test 512 MB; often faster and similar cost |
| Cost optimization | Migration EC2 instance idle since cut-over | Snapshot and terminate it |
| Sustainability | Function runs on x86 | Switch to `arm64` (Graviton) |

## Cost optimisation as a habit

Cost runs through every lesson in this course; here it is as a checklist to run on every account:

1. **Delete what is idle.** Old instances, unattached EBS volumes, unused Elastic IPs, forgotten NAT gateways.
2. **Right-size.** Use metrics, not guesses, to choose instance and function sizes.
3. **Use the right pricing model.** Savings Plans for the steady baseline, Spot for interruptible batch, serverless for spiky work.
4. **Let data age out.** S3 lifecycle rules and log retention periods.
5. **Keep traffic local.** Gateway endpoints for S3 and DynamoDB; CloudFront in front of anything public.
6. **Tag and look.** Tag every resource `project=lantern`, activate the tag for cost allocation, and open **AWS Cost Explorer** monthly. Your budget alert from lesson three is the safety net, not the plan.

:::why The review never finishes
Well-Architected isn't a certificate you earn once. Lantern's maintainers repeat the review every six months, or after any big change, because the right answer for 500 RSVPs a week is not the right answer for 50,000.
:::

That is the whole move. Lantern went from one fragile server to a set of managed pieces, each with an owner, a permission boundary, an alarm and a price you can explain. You can now set up an account safely, read and write IAM policies, pick the right core services, and ship and run a real workload, with cost and security designed in rather than bolted on.
