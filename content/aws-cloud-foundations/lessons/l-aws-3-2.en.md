---
summary: Store Lantern's posters and backups in Amazon S3 with the right storage class, versioning and Block Public Access, and know when an EC2 workload needs EBS or EFS instead.
takeaways:
  - Amazon S3 stores objects under keys in buckets, and new buckets block public access, disable ACLs and encrypt objects by default.
  - Storage classes trade storage price against retrieval cost, retrieval speed and minimum storage duration; S3 Standard is the default.
  - Versioning keeps every version of every object, which protects against overwrites and deletes but bills for each stored version until a lifecycle rule expires it.
  - Amazon EBS is a block disk for one EC2 instance in one Availability Zone, billed per provisioned gigabyte.
  - Amazon EFS is a shared file system that many instances across AZs can mount at once, billed per gigabyte actually stored.
further:
  - title: Understanding and managing Amazon S3 storage classes
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html
  - title: Blocking public access to your Amazon S3 storage
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
  - title: Retaining multiple versions of objects with S3 Versioning
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html
  - title: What is Amazon Elastic File System?
    url: https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html
quiz:
  - q: Lantern keeps monthly database exports for seven years and expects to restore one perhaps once a year, with a few hours' wait acceptable. Which storage class fits?
    options:
      - text: S3 Glacier Deep Archive
        why: Correct. It has the lowest storage price, and its retrieval time of hours is fine for a once-a-year restore.
      - text: S3 Standard
        why: It works, but you pay the highest storage price for years on data that is almost never read.
      - text: S3 One Zone-IA
        why: It keeps data in a single Availability Zone, so losing that AZ could lose the only copy of seven years of backups.
      - text: S3 Express One Zone
        why: It is built for single-digit-millisecond access by latency-sensitive apps, which is the opposite of an archive.
    answer: 0
  - q: Versioning is on for the posters bucket. An organiser re-uploads the same poster 40 times while tweaking it. What happens to storage costs?
    options:
      - text: Nothing changes; S3 stores only the latest version.
        why: With versioning on, every overwrite keeps the previous object as a noncurrent version.
      - text: Lantern pays for all 40 versions until a lifecycle rule or a person deletes the noncurrent ones.
        why: Correct. Each version is a full stored object. A NoncurrentVersionExpiration rule keeps this under control.
      - text: S3 deduplicates identical uploads, so only changed bytes are billed.
        why: S3 does not deduplicate. Every version is billed at its full size.
    answer: 1
  - q: Three EC2 instances in different Availability Zones must read and write the same set of uploaded files through a normal file system path. What do you use?
    options:
      - text: One EBS volume attached to all three instances.
        why: A standard EBS volume attaches to one instance, and it lives in a single AZ, so instances in other AZs cannot use it.
      - text: An instance store volume on each instance.
        why: Instance store is local to one instance and its data disappears when the instance stops, so nothing is shared.
      - text: An Amazon EFS file system mounted on all three.
        why: Correct. EFS is a regional, shared NFS file system that instances in several AZs can mount at the same time.
    answer: 2
---

On Lantern's old server, "storage" was one disk that filled up. On AWS you get three different kinds, each shaped for a different job: **objects** in Amazon S3, **block disks** in Amazon EBS, and **shared files** in Amazon EFS. Most of Lantern's data belongs in the first.

## Amazon S3: objects in buckets

S3 stores **objects** (any bytes, up to 50 TB each) in **buckets**. An object is addressed by its **key**, such as `posters/2026/street-food-festival.jpg`. The slashes look like folders, and the console draws them as folders, but S3 has no directories: the key is one string, and `posters/2026/` is a **prefix**. Bucket names are unique across all of AWS; the bucket itself lives in the Region you choose.

```bash
aws s3 mb s3://lantern-posters --region eu-west-1
aws s3 cp ./posters/ s3://lantern-posters/posters/ --recursive
aws s3 ls s3://lantern-posters/posters/2026/
```

### Safe by default, and keep it that way

New buckets come with three protections switched on: **Block Public Access** (all four settings on), **Object Ownership set to bucket owner enforced** (access control lists disabled, so only policies grant access), and **default encryption** with S3-managed keys. You change access with bucket policies, as you did in section two.

Leave Block Public Access on for every bucket that isn't deliberately public, and set it at the account level too, so a single mistaken bucket can't become public:

```bash
aws s3control put-public-access-block --account-id 111122223333 \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

In section four Lantern's website is served to the public **without** making any bucket public: CloudFront reads the bucket privately on visitors' behalf.

### Storage classes: same API, different price shape

Every object has a storage class. They are all designed for the same eleven nines (99.999999999%) of durability; they differ in how you pay.

| Class | Best for | The catch |
|---|---|---|
| S3 Standard (default) | Frequently read data | Highest storage price |
| S3 Intelligent-Tiering | Unknown or changing access | Small per-object monitoring fee |
| S3 Standard-IA | Read about monthly, needs millisecond access | Retrieval fee, 30-day minimum |
| S3 One Zone-IA | Re-creatable copies | One AZ only |
| S3 Glacier Instant Retrieval | Read about quarterly, millisecond access | Higher retrieval fee, 90-day minimum |
| S3 Glacier Flexible Retrieval | Archives, minutes to hours to restore | Restore before reading |
| S3 Glacier Deep Archive | Rarely touched, hours to restore | 180-day minimum |

The price model has three parts: **per GB stored per month**, **per request**, and, for the infrequent and archive classes, **per GB retrieved**. A cheaper storage class with frequent reads can cost more than Standard. Small objects are also a trap: the IA classes bill each object as at least 128 KB.

For Lantern: current posters stay in Standard, posters older than a year move to Glacier Instant Retrieval (they still appear on old event pages), and monthly database exports go to Deep Archive.

### Versioning: an undo button with a price

With **versioning** on, overwriting or deleting an object keeps the old version. A delete adds a *delete marker* instead of destroying data, so an accidental `aws s3 rm` is recoverable. Once enabled, versioning can only be suspended, never fully removed.

```bash
aws s3api put-bucket-versioning --bucket lantern-posters \
  --versioning-configuration Status=Enabled
```

Every version is billed as a full object, so pair versioning with a **lifecycle rule** that moves and expires data automatically:

```json title=lifecycle.json
{
  "Rules": [
    {
      "ID": "age-out-posters",
      "Filter": { "Prefix": "posters/" },
      "Status": "Enabled",
      "Transitions": [{ "Days": 365, "StorageClass": "GLACIER_IR" }],
      "NoncurrentVersionExpiration": { "NoncurrentDays": 30 }
    }
  ]
}
```

```bash
aws s3api put-bucket-lifecycle-configuration --bucket lantern-posters \
  --lifecycle-configuration file://lifecycle.json
```

:::mistake Versioning without a lifecycle rule
Teams turn on versioning for safety, then a script rewrites thousands of objects every night. Six months later the bucket holds 180 copies of everything and the bill shows it. Whenever you enable versioning, add a `NoncurrentVersionExpiration` rule in the same change.
:::

## Disks for servers: EBS and EFS

Some software needs a real file system. That is where the other two services come in.

:::figure S3 is reached over HTTPS, EBS attaches to one instance, EFS is shared
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">S3 is accessed by any client over HTTPS. An EBS volume attaches to a single EC2 instance inside one Availability Zone. An EFS file system is mounted by instances in two Availability Zones at once.</title>
  <rect class="d-box-primary" x="20" y="90" width="150" height="60" rx="10"/>
  <text class="d-label" x="95" y="117" text-anchor="middle">Amazon S3</text>
  <text class="d-label-muted" x="95" y="137" text-anchor="middle">objects via API</text>
  <text class="d-label-muted" x="95" y="70" text-anchor="middle">browsers, Lambda, CLI</text>
  <path class="d-arrow" d="M95 76 L95 86" marker-end="url(#arrow)"/>
  <rect class="d-box" x="210" y="30" width="200" height="190" rx="12"/>
  <text class="d-label-muted" x="310" y="52" text-anchor="middle">AZ a</text>
  <rect class="d-box-accent" x="240" y="70" width="140" height="44" rx="8"/>
  <text class="d-label" x="310" y="97" text-anchor="middle">EC2 instance</text>
  <rect class="d-box-success" x="255" y="150" width="110" height="40" rx="8"/>
  <text class="d-label" x="310" y="175" text-anchor="middle">EBS volume</text>
  <path class="d-arrow" d="M310 148 L310 118" marker-end="url(#arrow)"/>
  <rect class="d-box" x="450" y="30" width="210" height="110" rx="12"/>
  <text class="d-label-muted" x="555" y="52" text-anchor="middle">AZ b</text>
  <rect class="d-box-accent" x="485" y="70" width="140" height="44" rx="8"/>
  <text class="d-label" x="555" y="97" text-anchor="middle">EC2 instance</text>
  <rect class="d-box-warn" x="430" y="180" width="160" height="44" rx="8"/>
  <text class="d-label" x="510" y="207" text-anchor="middle">Amazon EFS</text>
  <path class="d-arrow" d="M480 180 L360 114" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M530 180 L550 118" marker-end="url(#arrow)"/>
</svg>
:::

**Amazon EBS** (Elastic Block Store) is a network disk for **one** EC2 instance, in **one** Availability Zone. Almost every instance boots from one. `gp3` is the general-purpose SSD type to start with. You pay for the **provisioned** size, not what you fill, so a 500 GB volume holding 20 GB costs the same as a full one. **Snapshots** back volumes up incrementally to storage that survives the loss of the AZ.

**Amazon EFS** (Elastic File System) is a managed NFS file system that **many** instances, across AZs, mount at the same time. It grows and shrinks with your files and bills per gigabyte actually stored, at a higher rate per gigabyte than EBS. Use it when several servers must share one directory tree.

For Lantern, the answer is mostly "neither": posters live in S3, where Lambda and CloudFront can reach them. The temporary migration server gets one small `gp3` volume, and no EFS at all.

:::tip Ask "who reads this, and how?"
If code or browsers read it over HTTP, use S3. If one server needs a disk, use EBS. If several servers need the same folder, use EFS. That one question settles most storage choices.
:::

Files are settled. Next: the data that changes every second, in a database.
