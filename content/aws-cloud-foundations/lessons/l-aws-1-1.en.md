---
kind: intro
summary: Describe what a cloud provider actually sells, what moving to AWS fixes and what it leaves for you, using Lantern's one-server setup as the case study.
takeaways:
  - The cloud is rented computing capacity and managed services that you create, change and delete through an API, and pay for by usage.
  - Moving to AWS removes hardware chores but not design work; a single server in AWS fails in exactly the same ways as a single server anywhere else.
  - AWS bills by the second, hour, gigabyte or request, so anything you leave running keeps costing money until you delete it.
  - Security in the cloud is shared; AWS secures the data centres, and you secure what you configure and upload.
further:
  - title: What is cloud computing?
    url: https://aws.amazon.com/what-is-cloud-computing/
  - title: Overview of Amazon Web Services – Six advantages of cloud computing
    url: https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html
quiz:
  - q: Lantern's single server crashed when an event went viral. Which statement about moving it to one Amazon EC2 instance is accurate?
    options:
      - text: It will survive the next spike, because AWS scales every instance automatically.
        why: An EC2 instance is a fixed-size virtual machine. Nothing scales unless you design for it, for example with Auto Scaling or a CDN.
      - text: It will fail in the same way, because one server is still one server, wherever it runs.
        why: Correct. The cloud makes better designs cheap and quick to build, but a lift-and-shift of one box keeps the one-box failure modes.
      - text: It cannot fail, because AWS guarantees 100% uptime for EC2.
        why: No AWS service promises 100%. Service level agreements give credits when availability drops below a published percentage.
    answer: 1
  - q: Which pricing idea best describes most AWS services?
    options:
      - text: A fixed monthly fee per account that covers all usage.
        why: That is how a lot of shared hosting works, not AWS. AWS meters each resource separately.
      - text: A one-off purchase of hardware that AWS hosts for you.
        why: You never buy the hardware. Even long-term commitments such as Savings Plans are discounts on usage, not purchases.
      - text: Metered usage, such as instance-seconds, gigabytes stored, requests made and data sent out to the internet.
        why: Correct. That is why idle resources still cost money and why a budget alert is one of the first things you set up.
    answer: 2
  - q: After the move, who is responsible for the S3 bucket that Lantern's posters live in being private?
    options:
      - text: Lantern, because access settings are configuration that the customer controls.
        why: Correct. AWS gives you safe defaults and tools, but who you grant access to is always your decision and your responsibility.
      - text: AWS, because S3 is a managed service.
        why: Managed means AWS runs the servers and software. It does not decide who should read your data.
      - text: Nobody, because S3 buckets cannot be made public.
        why: New buckets block public access by default, but an owner can still turn that off and publish objects.
    answer: 0
---

Lantern is a community events website. Organisers post events, people RSVP, and every event has a poster image. Today it runs on one rented server: a Node.js app, a PostgreSQL database and a folder of uploaded posters, all on the same disk. A nightly cron job copies the database dump to, yes, that same disk.

It has worked for three years. Then a street-food festival got shared widely, traffic jumped twenty-fold for an evening, the server ran out of memory, and the site went down at exactly the moment it mattered. Two weeks later the disk filled up with poster uploads and the database refused writes. Lantern's maintainers want to move to AWS, and this course is that move, done properly.

## What you are actually renting

A cloud provider sells capacity and services that you create, change and delete through an API, and pay for by usage. Behind every console button is an API call, which is why everything you click in this course you can also script.

That capacity comes at different levels of "how much do you manage":

| You get | AWS example | You still manage |
|---|---|---|
| A virtual machine | Amazon EC2 | OS patches, runtime, app, scaling |
| A managed database | Amazon RDS | Schema, queries, who can connect |
| A function that runs on demand | AWS Lambda | Your code and its permissions |
| Object storage | Amazon S3 | What you store and who can read it |

The further down the table you go, the less undifferentiated work you do, and the more you are shaped by how that service works.

:::figure Lantern today versus Lantern on AWS
<svg viewBox="0 0 680 270" role="img" aria-labelledby="t1">
  <title id="t1">Today, the app, database and posters share one server. On AWS, the site is served by CloudFront from S3, the API runs on Lambda, data lives in a managed database and posters in S3.</title>
  <text class="d-label-strong" x="120" y="28" text-anchor="middle">Today: one server</text>
  <rect class="d-box-warn" x="30" y="44" width="180" height="200" rx="12"/>
  <rect class="d-box" x="50" y="64" width="140" height="44" rx="8"/>
  <text class="d-label" x="120" y="91" text-anchor="middle">Node.js app</text>
  <rect class="d-box" x="50" y="122" width="140" height="44" rx="8"/>
  <text class="d-label" x="120" y="149" text-anchor="middle">PostgreSQL</text>
  <rect class="d-box" x="50" y="180" width="140" height="44" rx="8"/>
  <text class="d-label" x="120" y="207" text-anchor="middle">Posters + backups</text>
  <path class="d-arrow" d="M230 144 L290 144" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="480" y="28" text-anchor="middle">On AWS: one job per service</text>
  <rect class="d-box-accent" x="310" y="54" width="160" height="44" rx="8"/>
  <text class="d-label" x="390" y="81" text-anchor="middle">CloudFront</text>
  <rect class="d-box-primary" x="500" y="54" width="160" height="44" rx="8"/>
  <text class="d-label" x="580" y="81" text-anchor="middle">S3: site files</text>
  <rect class="d-box-primary" x="310" y="134" width="160" height="44" rx="8"/>
  <text class="d-label" x="390" y="161" text-anchor="middle">Lambda: API</text>
  <rect class="d-box-success" x="500" y="134" width="160" height="44" rx="8"/>
  <text class="d-label" x="580" y="161" text-anchor="middle">Managed database</text>
  <rect class="d-box-primary" x="405" y="206" width="160" height="44" rx="8"/>
  <text class="d-label" x="485" y="233" text-anchor="middle">S3: posters</text>
  <path class="d-arrow" d="M470 76 L496 76" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 98 L390 130" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M470 156 L496 156" marker-end="url(#arrow)"/>
</svg>
:::

## What the cloud isn't

It isn't automatically reliable. If you copy Lantern's single server onto a single EC2 instance, it fails exactly as before: one machine, one disk, one place. AWS makes the better design cheap to build; it doesn't build it for you.

It isn't automatically cheaper. You pay for what you provision, not what you use well. A forgotten test database runs all month. Data sent out to the internet is metered. Many small teams move to AWS and get a surprise bill in month two because nobody set a budget.

It isn't automatically secure. AWS secures the buildings, hardware and the software that runs its services. You decide who can sign in, what each piece of code may touch, and whether a bucket is private. Lesson three makes that split precise.

:::mistake Treating the free credits as "free AWS"
New accounts start with promotional credits and some services have monthly free usage. That is a trial, not a hosting plan. The first thing you build in this course is a budget alert, before anything that costs money.
:::

## How this course runs

You will follow Lantern from a bare account to a production setup. Section one covers where AWS runs your things, who is responsible for what, and how to lock the account down and drive it from the terminal. Section two is identity: who and what may do which actions. Section three picks the right compute, storage, database and network pieces. Section four builds and ships the new Lantern, then measures it.

Two habits run through every lesson. Before you create anything, ask "what will this cost while it sits there?" and "who can reach it?" If you can answer both, you understand the design. Next up: where, physically, all of this runs.
