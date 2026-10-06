---
summary: Ship Lantern's front end from a private S3 bucket through Amazon CloudFront with origin access control, HTTPS on a custom domain, sensible cache headers and invalidations.
takeaways:
  - The bucket stays private; CloudFront reads it through origin access control, and a bucket policy allows only that one distribution.
  - Origin access control works with the bucket's regular endpoint, not the S3 static website endpoint.
  - A certificate for a CloudFront custom domain must live in AWS Certificate Manager in us-east-1, requested or imported there.
  - Give hashed asset files a long cache lifetime and index.html a short one, so deploys show up without mass invalidations.
  - Serving from edge locations absorbs traffic spikes and reduces data transfer from the origin.
further:
  - title: Restrict access to an Amazon S3 origin
    url: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
  - title: Get started with a CloudFront standard distribution
    url: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html
  - title: Requirements for using SSL/TLS certificates with CloudFront
    url: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html
  - title: Invalidate files to remove content
    url: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html
quiz:
  - q: Why does Lantern keep the site bucket private instead of turning on S3 static website hosting and making it public?
    options:
      - text: Public buckets cannot serve HTML files.
        why: A public bucket with website hosting serves HTML fine. The reasons are security and control, not capability.
      - text: CloudFront refuses to cache content from public buckets.
        why: CloudFront can use a public website endpoint as a custom origin. Lantern avoids it because it leaves the bucket open to direct access.
      - text: S3 static website hosting is no longer available.
        why: Website endpoints still exist. They only serve HTTP, though, and require public read access.
      - text: With origin access control, visitors can only reach files through CloudFront, over HTTPS, and the bucket never needs public access.
        why: Correct. One bucket policy grants read to one distribution, and Block Public Access stays on.
    answer: 3
  - q: You request a certificate for `lantern.example` in AWS Certificate Manager in `eu-west-1`, but CloudFront does not list it. Why?
    options:
      - text: CloudFront only uses certificates issued in the US East (N. Virginia) Region, `us-east-1`.
        why: Correct. CloudFront is a global service whose certificates must be requested or imported in us-east-1.
      - text: The certificate needs a few hours to replicate to all Regions.
        why: ACM certificates are never replicated between Regions. A certificate exists only in the Region where you created it.
      - text: CloudFront requires certificates from a third-party authority.
        why: ACM public certificates work with CloudFront, at no charge for the certificate itself.
    answer: 0
  - q: After a deploy, visitors still see the old version of the home page for hours, while new JavaScript files load fine. What is the most likely cause?
    options:
      - text: S3 sync did not upload the new `index.html`.
        why: Possible, but the new hashed JS files arrived, so the upload itself ran. The symptom points at caching.
      - text: CloudFront is serving a cached `index.html` because it was uploaded with a long cache lifetime.
        why: Correct. Give `index.html` a short or no-cache header, and invalidate `/index.html` after each deploy.
      - text: Browsers never cache HTML, so this must be a DNS problem.
        why: Browsers and CDNs both cache HTML according to the Cache-Control header. DNS does not decide which version of a file is served.
    answer: 1
---

Remember the street-food festival that took Lantern down? Most of those requests were for the same few files: the home page, a stylesheet, JavaScript and one poster. Lantern's front end is a Vite app that builds to static files, so it doesn't need a server at all. It needs a place to keep files, **Amazon S3**, and a global cache in front of it, **Amazon CloudFront**.

## The shape of it

:::figure Viewers hit a nearby edge location; only cache misses reach the private bucket
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">A browser requests lantern.example over HTTPS from a CloudFront edge location. On a cache hit the edge answers directly. On a miss, CloudFront signs a request with origin access control to the private S3 bucket, which allows only that distribution.</title>
  <rect class="d-box" x="20" y="90" width="120" height="56" rx="10"/>
  <text class="d-label" x="80" y="123" text-anchor="middle">Browser</text>
  <rect class="d-box-accent" x="240" y="80" width="170" height="76" rx="10"/>
  <text class="d-label" x="325" y="110" text-anchor="middle">CloudFront edge</text>
  <text class="d-label-muted" x="325" y="132" text-anchor="middle">cache</text>
  <rect class="d-box-primary" x="510" y="80" width="150" height="76" rx="10"/>
  <text class="d-label" x="585" y="110" text-anchor="middle">S3 bucket</text>
  <text class="d-label-muted" x="585" y="132" text-anchor="middle">private, BPA on</text>
  <path class="d-arrow" d="M140 108 L236 108" marker-end="url(#arrow)"/>
  <text class="d-label" x="188" y="98" text-anchor="middle">HTTPS</text>
  <path class="d-arrow d-dashed" d="M238 132 L144 132" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="190" y="152" text-anchor="middle">cache hit</text>
  <path class="d-arrow" d="M410 108 L506 108" marker-end="url(#arrow)"/>
  <text class="d-label" x="458" y="98" text-anchor="middle">miss: signed</text>
  <text class="d-label-muted" x="325" y="200" text-anchor="middle">Bucket policy: allow s3:GetObject only for this distribution</text>
</svg>
:::

Most requests are **cache hits**, answered by an edge location near the visitor without touching S3. On a **miss**, CloudFront fetches the file from the bucket, signing the request with **origin access control (OAC)**. The bucket stays private, with Block Public Access on, and its policy allows reads from that one distribution only.

## Step by step

### 1. Build and create a private bucket

```bash
npm run build                      # Vite writes dist/
aws s3 mb s3://lantern-site-prod --region eu-west-1
```

The new bucket is private by default. Do **not** turn on static website hosting: OAC needs the bucket's regular endpoint, and the website endpoint only speaks HTTP and requires public access.

### 2. Upload with the right cache headers

Vite puts a content hash in asset file names (`assets/index-4f8a1c.js`), so a changed file always gets a new name. Those can be cached for a year. `index.html` keeps its name, so browsers and CloudFront should always check for a newer one:

```bash
aws s3 sync dist/ s3://lantern-site-prod/ --delete \
  --exclude "index.html" \
  --cache-control "public,max-age=31536000,immutable"

aws s3 cp dist/index.html s3://lantern-site-prod/index.html \
  --cache-control "no-cache"
```

`--delete` removes files from the bucket that no longer exist in `dist/`, so old bundles don't pile up.

### 3. Get a certificate in us-east-1

For HTTPS on `lantern.example`, request a public certificate from **AWS Certificate Manager** in **`us-east-1`**. CloudFront only uses certificates from that Region, whatever Region your bucket is in. Validate it with the DNS record ACM gives you.

```bash
aws acm request-certificate --region us-east-1 \
  --domain-name lantern.example --validation-method DNS
```

### 4. Create the distribution

In the CloudFront console, create a distribution with:

- **Origin**: the bucket's regular endpoint, with **origin access control** (sign requests).
- **Default root object**: `index.html`.
- **Viewer protocol policy**: redirect HTTP to HTTPS.
- **Alternate domain name** `lantern.example` and the us-east-1 certificate.
- **Cache policy** `CachingOptimized`, and the managed **SecurityHeadersPolicy** response headers policy, which adds HSTS and related headers.

If the front end uses client-side routes such as `/events/street-food`, those paths don't exist as files, and S3 answers through OAC with 403. Add a custom error response that serves `/index.html` with status 200 for 403 errors, or a small CloudFront Function that rewrites those paths, so that deep links shared on social media open the right page instead of an error.

### 5. Let only that distribution read the bucket

```json title=site-bucket-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::lantern-site-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/E2QWRUHEXAMPLE"
        }
      }
    }
  ]
}
```

The condition is what makes this safe: without it, any CloudFront distribution in any account could read the bucket.

### 6. Point DNS and test

Create alias `A` and `AAAA` records for `lantern.example` pointing to the distribution (in Amazon Route 53, or as a CNAME at another DNS host for a subdomain). Then check that `https://lantern.example` loads, and that the bucket's own URL returns **403 Access Denied**: that 403 proves the bucket is private.

### 7. On every deploy

Repeat step 2, then invalidate only the file that keeps its name:

```bash
aws cloudfront create-invalidation \
  --distribution-id E2QWRUHEXAMPLE --paths "/index.html"
```

:::mistake Invalidating everything on every deploy
`--paths "/*"` works, but it throws away the whole cache, so the next visitors all miss and hit S3 at once, exactly the stampede the CDN exists to prevent. With hashed file names and a no-cache `index.html`, one path is enough.
:::

## Cost and security in one glance

You pay S3 for storage and for requests, and with CloudFront in front, S3 only sees cache misses. Transfer from S3 to CloudFront is not charged; CloudFront bills for requests and data delivered to viewers on pay-as-you-go, or you can choose one of its flat-rate plans that bundle the CDN with AWS WAF, DNS and S3 credits for a fixed monthly price with no overage charges. Either way, the festival spike now lands on edge locations built for it.

Security-wise: one private bucket, one bucket policy with a `SourceArn` condition, HTTPS only, security headers on. Next you add the dynamic part: the RSVP API.
