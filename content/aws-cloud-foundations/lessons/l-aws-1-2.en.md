---
summary: Choose an AWS Region for a workload, explain how Availability Zones protect it from a data-centre failure, and say where edge locations fit in.
takeaways:
  - A Region is an isolated geographic area such as eu-west-1, and your data stays in the Region you put it in unless you move it.
  - An Availability Zone is one or more separate data centres inside a Region; spreading a workload across two or more AZs survives the loss of one.
  - Edge locations are many smaller sites that cache and serve content close to users; Amazon CloudFront runs there.
  - Pick a Region by data rules first, then user latency, then service availability, then price.
  - Data moving between AZs, between Regions and out to the internet is metered, so architecture choices show up on the bill.
further:
  - title: AWS Regions and Availability Zones
    url: https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-availability-zones.html
  - title: What is a Region?
    url: https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html
  - title: AWS Global Infrastructure
    url: https://aws.amazon.com/about-aws/global-infrastructure/
quiz:
  - q: Lantern's database runs in one Availability Zone and that AZ loses power. What happens?
    options:
      - text: AWS moves the database to another AZ automatically, whatever the setup.
        why: Only some configurations do this, such as an RDS Multi-AZ deployment. A single-AZ resource stays with its AZ.
      - text: The whole Region goes offline, so a second AZ would not have helped.
        why: AZs are built to fail independently, with separate power and networking, so one AZ outage leaves the others running.
      - text: The database is unavailable until the AZ recovers, because it lived in only one AZ.
        why: Correct. Resources such as an EC2 instance or an EBS volume are zonal; you get AZ resilience by running copies in more than one AZ.
    answer: 2
  - q: Lantern's users are in Portugal and EU data rules apply to RSVP data. What should decide the Region first?
    options:
      - text: The cheapest Region in the price list.
        why: Price matters, but a cheap Region that breaks a data rule or adds latency is a false saving. It comes last in the order.
      - text: Whether the Region keeps the data where the rules require.
        why: Correct. Legal and contractual rules are hard constraints; latency, service availability and price are trade-offs you make inside them.
      - text: Whichever Region the console opened in the first time.
        why: The default console Region is often us-east-1, which may be far from your users and outside your data rules.
      - text: The Region with the most Availability Zones.
        why: Most Regions have at least three AZs, which is plenty for a site of Lantern's size. It is not the first filter.
    answer: 1
  - q: You created an EC2 instance yesterday, but today the EC2 console shows no instances. What is the most likely explanation?
    options:
      - text: The console is showing a different Region from the one you used yesterday.
        why: Correct. The EC2 console lists resources for the selected Region only. Check the Region selector in the top bar.
      - text: AWS deletes idle instances after 24 hours on new accounts.
        why: AWS does not delete running instances for being idle. That is why forgotten resources keep costing money.
      - text: Instances are global, so they appear under the Global tab.
        why: EC2 instances are zonal resources. Only a few services, such as IAM and CloudFront, are global.
    answer: 0
  - q: Where does Amazon CloudFront serve cached copies of Lantern's posters from?
    options:
      - text: From the Availability Zone that holds the S3 bucket.
        why: That is the origin. CloudFront exists to avoid sending every request back there.
      - text: From edge locations close to each viewer.
        why: Correct. Edge locations are far more numerous than Regions, so a cached poster travels a short distance to the browser.
      - text: From a second Region that you must choose when you create the bucket.
        why: CloudFront does not need you to pick extra Regions; it uses its global network of edge locations.
    answer: 1
---

Lantern's maintainers live in Lisbon and most of its users are in Portugal. When they create their first resource, the AWS console asks a question they have never had to answer: **which Region?** The old server sat in one data centre somewhere and nobody thought about it. On AWS, where your things run is a design decision, and it affects latency, law, resilience and your bill.

## Regions: where your data lives

A **Region** is a separate geographic area with its own copy of most AWS services. Each has a code you will type often: `eu-west-1` is Ireland, `eu-central-1` is Frankfurt, `eu-south-2` is Spain, `us-east-1` is North Virginia. Regions are isolated from each other. A bucket you create in `eu-west-1` stores its data there, and AWS does not copy it to another Region unless you configure replication.

You can list the Regions your account can use from the terminal (you install the CLI in lesson four):

```bash
aws ec2 describe-regions --query "Regions[].RegionName" --output text
```

Not every service or feature launches in every Region at the same time, and prices differ between Regions. Some newer Regions are opt-in, so they do not appear until you enable them.

### How to choose

Use this order, and stop at the first rule that decides it:

1. **Data rules.** If a law or a contract says personal data stays in the EU, every non-EU Region is out.
2. **Latency to users.** Closer is faster. For Lantern, the Iberian and western European Regions are the candidates.
3. **Service availability.** Check that every service you plan to use exists in that Region.
4. **Price.** The same instance can cost noticeably more in one Region than another.

Lantern ends up in a European Region close to Portugal. The exact choice matters less than making it on purpose and then using it consistently.

## Availability Zones: surviving a bad day

Inside each Region are **Availability Zones**. An AZ is one or more discrete data centres with redundant power, networking and cooling, physically separated from the other AZs in the Region, yet linked to them by fast, low-latency private fibre. Most Regions have three or more.

The point of AZs is independent failure. A flood, fire or power cut in one AZ should not touch the others. So the rule for anything important is: **run it in at least two AZs.**

:::figure A Region contains isolated Availability Zones; edge locations sit outside, near users
<svg viewBox="0 0 680 300" role="img" aria-labelledby="t1">
  <title id="t1">One Region box holds three Availability Zone boxes, each with data centres, joined by low-latency links. Separate edge location circles near users are connected to the Region.</title>
  <rect class="d-box" x="20" y="20" width="440" height="260" rx="14"/>
  <text class="d-label-strong" x="240" y="48" text-anchor="middle">Region eu-west-1</text>
  <rect class="d-box-primary" x="40" y="70" width="120" height="150" rx="10"/>
  <text class="d-label" x="100" y="96" text-anchor="middle">AZ a</text>
  <rect class="d-box" x="60" y="112" width="80" height="34" rx="6"/>
  <text class="d-label-muted" x="100" y="134" text-anchor="middle">DC</text>
  <rect class="d-box" x="60" y="158" width="80" height="34" rx="6"/>
  <text class="d-label-muted" x="100" y="180" text-anchor="middle">DC</text>
  <rect class="d-box-primary" x="180" y="70" width="120" height="150" rx="10"/>
  <text class="d-label" x="240" y="96" text-anchor="middle">AZ b</text>
  <rect class="d-box" x="200" y="112" width="80" height="34" rx="6"/>
  <text class="d-label-muted" x="240" y="134" text-anchor="middle">DC</text>
  <rect class="d-box-primary" x="320" y="70" width="120" height="150" rx="10"/>
  <text class="d-label" x="380" y="96" text-anchor="middle">AZ c</text>
  <rect class="d-box" x="340" y="112" width="80" height="34" rx="6"/>
  <text class="d-label-muted" x="380" y="134" text-anchor="middle">DC</text>
  <rect class="d-box" x="340" y="158" width="80" height="34" rx="6"/>
  <text class="d-label-muted" x="380" y="180" text-anchor="middle">DC</text>
  <path class="d-line d-dashed" d="M160 245 L320 245"/>
  <text class="d-label-muted" x="240" y="266" text-anchor="middle">low-latency private links</text>
  <circle class="d-box-accent" cx="560" cy="70" r="34"/>
  <text class="d-label" x="560" y="75" text-anchor="middle">Edge</text>
  <circle class="d-box-accent" cx="610" cy="160" r="34"/>
  <text class="d-label" x="610" y="165" text-anchor="middle">Edge</text>
  <circle class="d-box-accent" cx="560" cy="245" r="34"/>
  <text class="d-label" x="560" y="250" text-anchor="middle">Edge</text>
  <path class="d-arrow" d="M462 120 L522 82" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M462 150 L572 158" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M462 190 L524 236" marker-end="url(#arrow)"/>
</svg>
:::

AZs have two kinds of label. The **name**, such as `eu-west-1a`, is what you pick in the console. The **AZ ID**, such as `euw1-az1`, always means the same physical zone in every account. In some older Regions, accounts created before November 2025 have names mapped independently, so your `eu-west-1a` may be another team's `eu-west-1b`. When you coordinate with another account, compare AZ IDs:

```bash
aws ec2 describe-availability-zones --region eu-west-1 \
  --query "AvailabilityZones[].{Name:ZoneName,Id:ZoneId}" --output table
```

This tells you which services are tied to what. **Global** services, such as IAM and CloudFront, are configured once for the whole account. **Regional** services, such as S3 buckets, Lambda functions and DynamoDB tables, live in one Region and AWS spreads them across AZs for you. **Zonal** resources, such as an EC2 instance or an EBS volume, live in exactly one AZ, and multi-AZ resilience is your job.

## Edge locations: closer than any Region

Regions are few. **Edge locations** are many: smaller sites in hundreds of cities that run Amazon CloudFront (the content delivery network) and Amazon Route 53 (DNS). When a visitor in Porto loads a Lantern poster, CloudFront can serve a cached copy from a nearby edge location instead of fetching it from the bucket every time. That is how Lantern will survive its next viral evening in section four.

:::mistake Building in whatever Region the console opened
The console remembers the last Region you used, and on a new account that is often `us-east-1`. People create a database there, then "lose" it after switching Regions, and pay for it for months. Pick Lantern's Region, set it as the CLI default, and glance at the Region selector before every create.
:::

## What geography costs

Data transfer is metered differently depending on where it goes. Traffic coming into AWS from the internet is generally free. Traffic between AZs in the same Region is charged per gigabyte, traffic between Regions costs more, and data sent out to the internet is charged too, which CloudFront can reduce through caching. You don't need numbers to design well, only this habit: **every arrow in your diagram that crosses an AZ or Region line has a price.** Multi-AZ is worth paying for when downtime hurts; a cross-Region copy of everything usually isn't, for a site Lantern's size.

Next you will see where AWS's job ends and yours begins, and secure the account itself.
