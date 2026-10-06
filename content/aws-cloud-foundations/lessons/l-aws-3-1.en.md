---
summary: Read an EC2 instance type name, pick a purchasing option for a workload's shape, and decide when AWS Lambda's per-request model beats a server that runs all month.
takeaways:
  - An instance type such as m7g.large encodes family, generation, extra capabilities and size, and each size step roughly doubles vCPUs and memory.
  - On-Demand suits short or unpredictable use, Savings Plans suit steady use you can commit to, and Spot suits interruptible work at a deep discount.
  - A stopped EC2 instance stops compute charges, but its EBS volumes and any Elastic IP address kept on it keep billing.
  - Lambda charges per request and per GB-second of run time, scales to zero, and suits event-driven work that finishes within 15 minutes.
  - Choose Lambda by default for small event-driven jobs, and EC2 when you need long-running processes, full OS control or steady heavy load.
further:
  - title: Amazon EC2 instance types
    url: https://docs.aws.amazon.com/ec2/latest/instancetypes/instance-types.html
  - title: Amazon EC2 billing and purchasing options
    url: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html
  - title: How Lambda works
    url: https://docs.aws.amazon.com/lambda/latest/dg/concepts-basics.html
  - title: AWS Lambda pricing
    url: https://aws.amazon.com/lambda/pricing/
quiz:
  - q: What does `c7g.xlarge` tell you compared with `c7g.large`?
    options:
      - text: Same compute-optimised Graviton family and generation, with roughly twice the vCPUs and memory.
        why: Correct. The letters and number stay the same, and the size suffix steps up, which roughly doubles resources and price.
      - text: A newer generation of the same family with the same resources.
        why: Generation is the digit (7 in both). The difference here is only the size.
      - text: The same instance with an extra GPU attached.
        why: GPUs come from GPU families such as g and p. The size suffix never adds hardware types.
      - text: An x86 version of the Graviton instance.
        why: The `g` in `c7g` means Graviton (Arm) in both names. An x86 equivalent would drop the `g`, for example `c7i`.
    answer: 0
  - q: Lantern runs a nightly poster-archive job that takes 40 minutes and can safely restart if interrupted. Which option fits best?
    options:
      - text: AWS Lambda, because it is always the cheapest compute.
        why: A single Lambda invocation can run for at most 15 minutes, so a 40-minute job does not fit without splitting it up.
      - text: A 3-year Savings Plan on a large instance that runs all day.
        why: A commitment for 24 hours a day to cover 40 minutes of work pays for 23 idle hours.
      - text: An On-Demand instance that runs only for the job, or a Spot Instance since interruptions are acceptable.
        why: Correct. Paying only while the job runs fits a short daily task, and Spot's discount suits work that can restart.
    answer: 2
  - q: You stop Lantern's old migration server for the weekend. Which charges continue?
    options:
      - text: None; a stopped instance is free.
        why: Only the compute charge stops. Attached storage and Elastic IP addresses are separate resources with their own billing.
      - text: The instance's hourly compute rate, at a reduced weekend price.
        why: AWS has no weekend pricing, and a stopped instance does not accrue compute charges.
      - text: Data transfer for the traffic the server would have received.
        why: A stopped server receives no traffic, so there is no data transfer to bill.
      - text: Its EBS volumes and any public IPv4 address that stays allocated to it.
        why: Correct. Storage persists while stopped, and AWS charges for public IPv4 addresses by the hour whether or not they are in use.
    answer: 3
---

Lantern's old server did everything: served pages, handled RSVPs, resized posters, ran a nightly export. On AWS each of those jobs can run on the compute model that fits its shape. The two you will use most are **Amazon EC2**, virtual servers you rent by the second, and **AWS Lambda**, functions that run only when something calls them.

## Amazon EC2: a server, rented

An EC2 **instance** is a virtual machine. You choose an operating system image (an AMI, such as Amazon Linux 2023), an **instance type**, a network and storage, and AWS starts it in the Availability Zone you pick. Everything above the hypervisor is yours: OS patches, the runtime, the app, and scaling.

### Reading an instance type

Instance type names are dense but regular. Take `m7g.large`:

| Part | Meaning |
|---|---|
| `m` | family: general purpose |
| `7` | generation: newer is usually better value |
| `g` | extra capability: AWS Graviton (Arm) processor |
| `large` | size |

Common families: `t` (burstable, cheap for spiky low use), `m` (balanced), `c` (compute-heavy), `r` (memory-heavy). Other suffixes include `i` (Intel), `a` (AMD) and `d` (local NVMe disk). Each size step, from `large` to `xlarge` to `2xlarge`, roughly doubles vCPUs, memory and price. Graviton instances usually give better price-performance if your software runs on Arm, which Node.js and Python do without changes.

### How you pay

The instance is the same; the commitment changes the price.

- **On-Demand**: pay per second (Linux, with a 60-second minimum), no commitment. Right for anything short-lived, new or unpredictable.
- **Savings Plans**: commit to a fixed amount of compute spend per hour for one or three years, for a significant discount. Right for the baseline you know will run all year. (The older **Reserved Instances** model still exists and works similarly.)
- **Spot Instances**: spare AWS capacity at a deep discount, but AWS can reclaim it with a two-minute warning. Right for batch work that can restart.
- **Dedicated Hosts** and **Capacity Reservations** cover licensing and guaranteed-capacity needs you are unlikely to have yet.

Commitments are not available on the Free account plan; another reason Lantern's production account is on the Paid plan.

:::mistake Thinking "stopped" means "free"
Stopping an instance stops the compute charge. Its EBS volumes keep billing because the data is still stored. An auto-assigned public IP is released when the instance stops, but an Elastic IP address stays allocated and keeps billing, because AWS charges for every public IPv4 address by the hour, in use or not. Terminate what you don't need, and release Elastic IP addresses you aren't using.
:::

## AWS Lambda: code that runs on events

With Lambda you upload a function and say what triggers it: an HTTP request through API Gateway, a file landing in S3, a schedule, a message on a queue. Lambda runs as many copies as there are concurrent events, and **none** when there are none.

Here is Lantern's thumbnail function. S3 calls it with an event describing the uploaded poster:

```js title=thumbnail/index.mjs
export const handler = async (event) => {
  const { bucket, object } = event.Records[0].s3;
  console.log(`New poster: s3://${bucket.name}/${object.key}`);
  // …download, resize, upload to thumbnails/
  return { resized: object.key };
};
```

And you create it with the CLI, choosing the runtime, Arm architecture, memory and timeout:

```bash
aws lambda create-function --function-name lantern-thumbnail \
  --runtime nodejs24.x --architectures arm64 \
  --handler index.handler --zip-file fileb://thumbnail.zip \
  --role arn:aws:iam::111122223333:role/lantern-thumbnail-role \
  --memory-size 512 --timeout 30
```

The role is the execution role from last section: it can read `uploads/` and write `thumbnails/`, nothing else.

### The Lambda cost model

You pay per **request** and per **GB-second**: memory size in GB multiplied by run time in seconds, measured to the millisecond. CPU power scales with the memory you allocate (128 MB to 10,240 MB), and one invocation can run for at most 15 minutes. Work out Lantern's thumbnail usage:

```js run
const postersPerMonth = 3000;
const avgSeconds = 0.8;    // measured from CloudWatch logs
const memoryGb = 512 / 1024;

const gbSeconds = postersPerMonth * avgSeconds * memoryGb;
console.log(`Requests: ${postersPerMonth}`);
console.log(`GB-seconds: ${gbSeconds}`);
```

1,200 GB-seconds and 3,000 requests a month sit far inside Lambda's always-free monthly allowance, which at the time of writing is 1 million requests and 400,000 GB-seconds. An EC2 instance doing the same job would bill every second of the month, busy or idle.

## Choosing between them

| Lantern job | Pick | Why |
|---|---|---|
| RSVP API | Lambda | Spiky traffic, short requests, idle most of the night |
| Poster thumbnails | Lambda | Triggered by S3 uploads, seconds of work |
| Nightly 40-minute archive | EC2 On-Demand or Spot | Too long for one invocation; runs briefly each day |
| Old Node.js app during migration | EC2 | Needs to run unchanged until it is retired |

A good default for a team of Lantern's size: **Lambda for event-driven pieces, EC2 only when something needs a long-running process, OS-level control or steady heavy load.** Containers on Amazon ECS with AWS Fargate sit between the two, and are worth a look once you package apps as images.

:::tip Memory is a speed knob
Because CPU scales with memory, doubling a function's memory often halves its run time, so the GB-second cost stays about the same while users wait less. Measure before and after; don't guess.
:::

Compute needs somewhere to keep files. Next: Amazon S3 for objects, and EBS and EFS for disks.
