---
summary: انشر الواجهة الأمامية لـ Lantern من bucket خاص في S3 عبر Amazon CloudFront مع origin access control، وHTTPS على نطاق مخصّص، وترويسات cache مدروسة، وعمليات إبطال (invalidations).
takeaways:
  - يبقى الـ bucket خاصًّا؛ يقرؤه CloudFront عبر origin access control، وتسمح سياسة الـ bucket لذلك الـ distribution وحده.
  - يعمل origin access control مع نقطة النهاية العادية للـ bucket، لا مع نقطة النهاية الخاصة باستضافة المواقع الثابتة في S3.
  - شهادة النطاق المخصّص في CloudFront يجب أن تكون في AWS Certificate Manager في us-east-1، مطلوبةً هناك أو مستوردةً إليها.
  - امنح ملفات الأصول ذات الأسماء المحتوية على hash عمر cache طويلًا، وامنح index.html عمرًا قصيرًا، كي تظهر عمليات النشر دون إبطال جماعي.
  - التقديم من مواقع الحافة يمتصّ ذروات الزيارات ويقلّل نقل البيانات من الـ origin.
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
  - q: لماذا يُبقي Lantern الـ bucket الخاص بالموقع خاصًّا بدلًا من تفعيل استضافة المواقع الثابتة في S3 وجعله عامًّا؟
    options:
      - text: الـ buckets العامة لا تستطيع تقديم ملفات HTML.
        why: الـ bucket العام مع استضافة المواقع يقدّم HTML دون مشكلة. الأسباب هي الأمان والتحكّم، لا القدرة.
      - text: يرفض CloudFront تخزين المحتوى من الـ buckets العامة مؤقتًا.
        why: يستطيع CloudFront استخدام نقطة نهاية موقع عامة كـ origin مخصّص. يتجنّبها Lantern لأنها تترك الـ bucket مفتوحًا للوصول المباشر.
      - text: استضافة المواقع الثابتة في S3 لم تعد متاحة.
        why: نقاط نهاية المواقع ما زالت موجودة. لكنها لا تقدّم إلا HTTP، وتتطلّب وصول قراءة عامًّا.
      - text: مع origin access control لا يستطيع الزوّار الوصول إلى الملفات إلا عبر CloudFront، وعبر HTTPS، ولا يحتاج الـ bucket أبدًا إلى وصول عام.
        why: صحيح. سياسة bucket واحدة تمنح القراءة لـ distribution واحد، ويبقى Block Public Access مفعّلًا.
    answer: 3
  - q: طلبت شهادة لـ `lantern.example` من AWS Certificate Manager في `eu-west-1`، لكن CloudFront لا يعرضها. لماذا؟
    options:
      - text: لا يستخدم CloudFront إلا الشهادات الصادرة في Region شرق الولايات المتحدة (شمال فيرجينيا)، `us-east-1`.
        why: صحيح. CloudFront خدمة عامّة يجب أن تُطلب شهاداتها أو تُستورد في us-east-1.
      - text: تحتاج الشهادة إلى بضع ساعات لتُنسخ إلى كل الـ Regions.
        why: شهادات ACM لا تُنسخ أبدًا بين الـ Regions. الشهادة توجد فقط في الـ Region التي أنشأتها فيها.
      - text: يتطلّب CloudFront شهادات من جهة إصدار خارجية.
        why: شهادات ACM العامة تعمل مع CloudFront، دون أي رسوم على الشهادة نفسها.
    answer: 0
  - q: بعد عملية نشر، ما زال الزوّار يرون النسخة القديمة من الصفحة الرئيسية لساعات، بينما تُحمَّل ملفات JavaScript الجديدة بشكل سليم. ما السبب الأرجح؟
    options:
      - text: لم يرفع S3 sync ملف `index.html` الجديد.
        why: هذا ممكن، لكن ملفات JS الجديدة ذات الـ hash وصلت، فعملية الرفع نفسها جرت. العَرَض يشير إلى الـ cache.
      - text: يقدّم CloudFront نسخة مخزّنة مؤقتًا من `index.html` لأنه رُفع بعمر cache طويل.
        why: صحيح. امنح `index.html` ترويسة قصيرة أو no-cache، وأبطل `/index.html` بعد كل عملية نشر.
      - text: المتصفّحات لا تخزّن HTML مؤقتًا أبدًا، فلا بد أنها مشكلة في DNS.
        why: المتصفّحات وشبكات CDN كلاهما يخزّن HTML مؤقتًا وفق ترويسة Cache-Control. ولا يحدّد DNS أيّ نسخة من الملف تُقدَّم.
    answer: 1
---

أتذكر مهرجان طعام الشارع الذي أسقط Lantern؟ معظم تلك الطلبات كانت لبضعة ملفات هي نفسها: الصفحة الرئيسية، وملف أنماط، وJavaScript، وملصق واحد. الواجهة الأمامية لـ Lantern تطبيق Vite يُبنى إلى ملفات ثابتة، فلا يحتاج إلى خادم أصلًا. إنه يحتاج إلى مكان يحفظ فيه الملفات، **Amazon S3**، وإلى cache عالمي أمامه، **Amazon CloudFront**.

## الصورة العامة

:::figure يصل الزوّار إلى موقع حافة قريب؛ ولا يبلغ الـ bucket الخاص إلا ما لم يوجد في الـ cache
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">يطلب المتصفّح lantern.example عبر HTTPS من موقع حافة في CloudFront. إذا وُجد الملف في الـ cache يجيب موقع الحافة مباشرة. وإذا لم يوجد، يوقّع CloudFront طلبًا عبر origin access control إلى الـ bucket الخاص في S3، الذي لا يسمح إلا لذلك الـ distribution.</title>
  <rect class="d-box" x="20" y="90" width="120" height="56" rx="10"/>
  <text class="d-label" x="80" y="123" text-anchor="middle">المتصفّح</text>
  <rect class="d-box-accent" x="240" y="80" width="170" height="76" rx="10"/>
  <text class="d-label" x="325" y="110" text-anchor="middle">CloudFront edge</text>
  <text class="d-label-muted" x="325" y="132" text-anchor="middle">cache</text>
  <rect class="d-box-primary" x="510" y="80" width="150" height="76" rx="10"/>
  <text class="d-label" x="585" y="110" text-anchor="middle">S3 bucket</text>
  <text class="d-label-muted" x="585" y="132" text-anchor="middle">خاص، BPA مفعّل</text>
  <path class="d-arrow" d="M140 108 L236 108" marker-end="url(#arrow)"/>
  <text class="d-label" x="188" y="98" text-anchor="middle">HTTPS</text>
  <path class="d-arrow d-dashed" d="M238 132 L144 132" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="190" y="152" text-anchor="middle">cache hit</text>
  <path class="d-arrow" d="M410 108 L506 108" marker-end="url(#arrow)"/>
  <text class="d-label" x="458" y="98" text-anchor="middle">miss: طلب موقَّع</text>
  <text class="d-label-muted" x="325" y="200" text-anchor="middle">سياسة الـ bucket: السماح بـ s3:GetObject لهذا الـ distribution فقط</text>
</svg>
:::

معظم الطلبات **cache hits**، يجيب عنها موقع حافة قريب من الزائر دون لمس S3. وعند **الـ miss** (عدم وجود الملف في الـ cache)، يجلب CloudFront الملف من الـ bucket، موقّعًا الطلب عبر **origin access control (OAC)**. يبقى الـ bucket خاصًّا، مع تفعيل Block Public Access، وتسمح سياسته بالقراءة من ذلك الـ distribution وحده.

## خطوة بخطوة

### 1. ابنِ التطبيق وأنشئ bucket خاصًّا

```bash
npm run build                      # Vite writes dist/
aws s3 mb s3://lantern-site-prod --region eu-west-1
```

الـ bucket الجديد خاص افتراضيًا. **لا** تفعّل استضافة المواقع الثابتة: يحتاج OAC إلى نقطة النهاية العادية للـ bucket، أما نقطة نهاية الموقع فلا تتحدّث إلا HTTP وتتطلّب وصولًا عامًّا.

### 2. ارفع الملفات بترويسات الـ cache الصحيحة

يضع Vite قيمة hash للمحتوى في أسماء ملفات الأصول (`assets/index-4f8a1c.js`)، فيحصل الملف المتغيّر دائمًا على اسم جديد. يمكن تخزين هذه الملفات مؤقتًا لمدة سنة. أما `index.html` فيحتفظ باسمه، لذا يجب أن تتحقّق المتصفّحات وCloudFront دائمًا من وجود نسخة أحدث منه:

```bash
aws s3 sync dist/ s3://lantern-site-prod/ --delete \
  --exclude "index.html" \
  --cache-control "public,max-age=31536000,immutable"

aws s3 cp dist/index.html s3://lantern-site-prod/index.html \
  --cache-control "no-cache"
```

يزيل `--delete` من الـ bucket الملفات التي لم تعد موجودة في `dist/`، كي لا تتراكم الحزم القديمة.

### 3. احصل على شهادة في us-east-1

لتفعيل HTTPS على `lantern.example`، اطلب شهادة عامة من **AWS Certificate Manager** في **`us-east-1`**. لا يستخدم CloudFront إلا الشهادات من تلك الـ Region، أيًّا كانت الـ Region التي فيها الـ bucket الخاص بك. تحقّق منها بسجل DNS الذي يعطيك إياه ACM.

```bash
aws acm request-certificate --region us-east-1 \
  --domain-name lantern.example --validation-method DNS
```

### 4. أنشئ الـ distribution

في console الـ CloudFront، أنشئ distribution بالإعدادات التالية:

- **Origin**: نقطة النهاية العادية للـ bucket، مع **origin access control** (توقيع الطلبات).
- **Default root object**: `index.html`.
- **Viewer protocol policy**: إعادة توجيه HTTP إلى HTTPS.
- **Alternate domain name** هو `lantern.example`، مع شهادة us-east-1.
- **Cache policy** هي `CachingOptimized`، وسياسة ترويسات الاستجابة المُدارة **SecurityHeadersPolicy**، التي تضيف HSTS والترويسات المرتبطة به.

إذا كانت الواجهة الأمامية تستخدم مسارات من جهة العميل مثل `/events/street-food`، فهذه المسارات لا توجد كملفات، فيجيب S3 عبر OAC بالرمز 403. أضف استجابة خطأ مخصّصة تقدّم `/index.html` بالرمز 200 لأخطاء 403، أو CloudFront Function صغيرة تعيد كتابة تلك المسارات، كي تفتح الروابط العميقة المتداولة على وسائل التواصل الصفحة الصحيحة بدلًا من صفحة خطأ.

### 5. اسمح لذلك الـ distribution وحده بقراءة الـ bucket

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

الشرط هو ما يجعل هذا آمنًا: من دونه، يستطيع أي distribution في CloudFront في أي حساب قراءة الـ bucket.

### 6. وجّه DNS واختبر

أنشئ سجلات alias من نوع `A` و`AAAA` لـ `lantern.example` تشير إلى الـ distribution (في Amazon Route 53، أو كسجل CNAME لدى مزوّد DNS آخر إن كان نطاقًا فرعيًا). ثم تحقّق من أن `https://lantern.example` يُحمَّل، وأن رابط الـ bucket نفسه يعيد **403 Access Denied**: هذا الـ 403 يثبت أن الـ bucket خاص.

### 7. في كل عملية نشر

كرّر الخطوة 2، ثم أبطل الملف الوحيد الذي يحتفظ باسمه:

```bash
aws cloudfront create-invalidation \
  --distribution-id E2QWRUHEXAMPLE --paths "/index.html"
```

:::mistake إبطال كل شيء في كل عملية نشر
يعمل `--paths "/*"`، لكنه يرمي الـ cache كله، فتفوت طلبات الزوّار التالين كلها الـ cache وتنهال على S3 دفعة واحدة، وهو بالضبط التدافع الذي وُجدت شبكة الـ CDN لمنعه. مع أسماء ملفات تحتوي على hash و`index.html` بترويسة no-cache، يكفي مسار واحد.
:::

## التكلفة والأمان في لمحة

تدفع لـ S3 مقابل التخزين والطلبات، ومع وجود CloudFront في الأمام، لا يرى S3 إلا حالات الـ miss. النقل من S3 إلى CloudFront لا يُحتسب؛ ويحتسب CloudFront الطلبات والبيانات المقدَّمة للزوّار بنظام الدفع حسب الاستخدام، أو يمكنك اختيار إحدى خططه ذات السعر الثابت التي تجمع الـ CDN مع AWS WAF وDNS وأرصدة S3 بسعر شهري ثابت دون رسوم تجاوز. وفي الحالتين، تهبط ذروة المهرجان الآن على مواقع حافة بُنيت لتحمّلها.

من ناحية الأمان: bucket خاص واحد، وسياسة bucket واحدة بشرط `SourceArn`، وHTTPS فقط، وترويسات الأمان مفعّلة. في الدرس التالي تضيف الجزء الديناميكي: الـ API الخاص بتأكيد الحضور.
