---
summary: خزّن ملصقات Lantern ونسخه الاحتياطية في Amazon S3 بفئة التخزين المناسبة مع تفعيل الـ versioning وBlock Public Access، واعرف متى يحتاج حمل عمل على EC2 إلى EBS أو EFS بدلًا من ذلك.
takeaways:
  - يخزّن Amazon S3 الكائنات تحت مفاتيح (keys) داخل buckets، والـ buckets الجديدة تحجب الوصول العام وتعطّل الـ ACLs وتشفّر الكائنات افتراضيًا.
  - فئات التخزين تقايض بين سعر التخزين وتكلفة الاسترجاع وسرعته والحد الأدنى لمدة التخزين؛ وS3 Standard هي الفئة الافتراضية.
  - يحتفظ الـ versioning بكل نسخة من كل كائن، ما يحمي من الكتابة فوق الملفات وحذفها، لكنه يحتسب كل نسخة مخزّنة حتى تنهيها قاعدة دورة حياة (lifecycle rule).
  - Amazon EBS قرص كتلي (block) لـ instance واحدة في EC2 ضمن منطقة توافر واحدة، ويُحتسب لكل غيغابايت محجوز.
  - Amazon EFS نظام ملفات مشترك تستطيع instances كثيرة عبر مناطق التوافر تركيبه (mount) في الوقت نفسه، ويُحتسب لكل غيغابايت مخزّن فعلًا.
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
  - q: يحتفظ Lantern بتصديرات شهرية لقاعدة البيانات لمدة سبع سنوات، ويتوقّع أن يستعيد واحدًا منها ربما مرة في السنة، مع قبول الانتظار بضع ساعات. أيّ فئة تخزين تناسبه؟
    options:
      - text: S3 Glacier Deep Archive
        why: صحيح. لها أقل سعر تخزين، ووقت استرجاعها الذي يُقاس بالساعات مقبول لاستعادة تحدث مرة في السنة.
      - text: S3 Standard
        why: تعمل، لكنك تدفع أعلى سعر تخزين لسنوات على بيانات لا تكاد تُقرأ.
      - text: S3 One Zone-IA
        why: تحتفظ بالبيانات في منطقة توافر واحدة، لذا قد تعني خسارة تلك المنطقة خسارة النسخة الوحيدة من نسخ احتياطية عمرها سبع سنوات.
      - text: S3 Express One Zone
        why: صُمِّمت للوصول خلال أجزاء قليلة من الألف من الثانية من قِبل تطبيقات حساسة لزمن الاستجابة، وهذا عكس الأرشيف تمامًا.
    answer: 0
  - q: الـ versioning مفعّل في الـ bucket الخاص بالملصقات. أعاد أحد المنظّمين رفع الملصق نفسه 40 مرة أثناء تعديله. ماذا يحدث لتكاليف التخزين؟
    options:
      - text: لا يتغيّر شيء؛ يخزّن S3 أحدث نسخة فقط.
        why: مع تفعيل الـ versioning، تُبقي كل كتابة فوق الكائن الكائنَ السابق كنسخة غير حالية (noncurrent version).
      - text: يدفع Lantern ثمن النسخ الأربعين كلها حتى تحذف قاعدة دورة حياة أو شخصٌ ما النسخَ غير الحالية.
        why: صحيح. كل نسخة كائن مخزّن كامل. وقاعدة NoncurrentVersionExpiration تُبقي هذا تحت السيطرة.
      - text: يزيل S3 التكرار من عمليات الرفع المتطابقة، فلا يُحتسب إلا البايتات المتغيّرة.
        why: لا يزيل S3 التكرار. كل نسخة تُحتسب بحجمها الكامل.
    answer: 1
  - q: يجب أن تقرأ ثلاث instances في EC2، موزّعة على مناطق توافر مختلفة، مجموعةَ الملفات المرفوعة نفسها وتكتب فيها عبر مسار عادي في نظام الملفات. ماذا تستخدم؟
    options:
      - text: volume واحدًا في EBS مرفقًا بالـ instances الثلاث.
        why: الـ volume القياسي في EBS يُرفق بـ instance واحدة، ويعيش في منطقة توافر واحدة، فلا تستطيع الـ instances في المناطق الأخرى استخدامه.
      - text: volume من نوع instance store على كل instance.
        why: الـ instance store محلي لـ instance واحدة وتختفي بياناته عند إيقافها، فلا شيء مشترك.
      - text: نظام ملفات Amazon EFS مركّب على الثلاث.
        why: صحيح. EFS نظام ملفات NFS مشترك وإقليمي تستطيع instances في عدة مناطق توافر تركيبه في الوقت نفسه.
    answer: 2
---

على خادم Lantern القديم، كان "التخزين" قرصًا واحدًا يمتلئ. أما على AWS فتحصل على ثلاثة أنواع مختلفة، صُمِّم كلٌّ منها لمهمة مختلفة: **الكائنات (objects)** في Amazon S3، و**الأقراص الكتلية (block disks)** في Amazon EBS، و**الملفات المشتركة** في Amazon EFS. ومعظم بيانات Lantern مكانها النوع الأول.

## Amazon S3: كائنات في buckets

يخزّن S3 **الكائنات** (أي بايتات، حتى 50 TB لكلٍّ منها) في **buckets**. يُعنون الكائن بـ **مفتاحه (key)**، مثل `posters/2026/street-food-festival.jpg`. تبدو الشرطات المائلة كمجلّدات، ويرسمها الـ console كمجلّدات، لكن S3 لا يحتوي على مجلّدات: المفتاح نص واحد، و`posters/2026/` **بادئة (prefix)**. أسماء الـ buckets فريدة على مستوى AWS كلها؛ أما الـ bucket نفسه فيعيش في الـ Region التي تختارها.

```bash
aws s3 mb s3://lantern-posters --region eu-west-1
aws s3 cp ./posters/ s3://lantern-posters/posters/ --recursive
aws s3 ls s3://lantern-posters/posters/2026/
```

### آمن افتراضيًا، فأبقِه كذلك

تأتي الـ buckets الجديدة بثلاث حمايات مفعّلة: **Block Public Access** (بإعداداته الأربعة مفعّلة)، و**Object Ownership مضبوطًا على bucket owner enforced** (قوائم التحكّم في الوصول ACLs معطّلة، فلا تمنح الوصولَ إلا السياسات)، و**التشفير الافتراضي** بمفاتيح يديرها S3. تغيّر الوصول عبر سياسات الـ bucket، كما فعلت في القسم الثاني.

أبقِ Block Public Access مفعّلًا في كل bucket ليس عامًّا عن قصد، واضبطه على مستوى الحساب أيضًا، كي لا يتحوّل bucket واحد إلى عام بالخطأ:

```bash
aws s3control put-public-access-block --account-id 111122223333 \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

في القسم الرابع يُقدَّم موقع Lantern للجمهور **دون** جعل أي bucket عامًّا: يقرأ CloudFront الـ bucket بشكل خاص نيابة عن الزوّار.

### فئات التخزين: الـ API نفسه، وشكل سعر مختلف

لكل كائن فئة تخزين. وكلها مصمّمة لمستوى المتانة نفسه، أي إحدى عشرة تسعة (99.999999999%)؛ لكنها تختلف في طريقة الدفع.

| الفئة | الأنسب لـ | العقبة |
|---|---|---|
| S3 Standard (الافتراضية) | البيانات التي تُقرأ كثيرًا | أعلى سعر تخزين |
| S3 Intelligent-Tiering | نمط وصول مجهول أو متغيّر | رسوم مراقبة صغيرة لكل كائن |
| S3 Standard-IA | ما يُقرأ نحو مرة شهريًا ويحتاج إلى وصول بالمللي ثانية | رسوم استرجاع، وحد أدنى 30 يومًا |
| S3 One Zone-IA | النسخ التي يمكن إعادة إنشائها | منطقة توافر واحدة فقط |
| S3 Glacier Instant Retrieval | ما يُقرأ نحو مرة كل ربع سنة، بوصول بالمللي ثانية | رسوم استرجاع أعلى، وحد أدنى 90 يومًا |
| S3 Glacier Flexible Retrieval | الأرشيفات، والاستعادة من دقائق إلى ساعات | الاستعادة قبل القراءة |
| S3 Glacier Deep Archive | ما نادرًا ما يُلمس، والاستعادة بالساعات | حد أدنى 180 يومًا |

لنموذج السعر ثلاثة أجزاء: **لكل غيغابايت مخزّن شهريًا**، و**لكل طلب**، و**لكل غيغابايت مسترجَع** في فئات الوصول غير المتكرّر والأرشيف. فئة تخزين أرخص مع قراءات متكرّرة قد تكلّف أكثر من Standard. والكائنات الصغيرة فخ أيضًا: فئات IA تحتسب كل كائن بـ 128 KB على الأقل.

بالنسبة إلى Lantern: تبقى الملصقات الحالية في Standard، وتنتقل الملصقات الأقدم من سنة إلى Glacier Instant Retrieval (فهي ما زالت تظهر في صفحات الفعاليات القديمة)، وتذهب التصديرات الشهرية لقاعدة البيانات إلى Deep Archive.

### الـ versioning: زر تراجع له ثمن

مع تفعيل **الـ versioning (إدارة النسخ)**، تُبقي الكتابة فوق كائن أو حذفه على النسخة القديمة. الحذف يضيف *علامة حذف (delete marker)* بدلًا من إتلاف البيانات، فيمكن التعافي من `aws s3 rm` عرضي. وبمجرد تفعيله، يمكن تعليق الـ versioning فقط، ولا يمكن إزالته كليًا أبدًا.

```bash
aws s3api put-bucket-versioning --bucket lantern-posters \
  --versioning-configuration Status=Enabled
```

كل نسخة تُحتسب ككائن كامل، لذا اقرن الـ versioning بـ **قاعدة دورة حياة (lifecycle rule)** تنقل البيانات وتنهيها تلقائيًا:

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

:::mistake الـ versioning دون قاعدة دورة حياة
تفعّل الفرق الـ versioning من أجل الأمان، ثم يعيد سكربت كتابة آلاف الكائنات كل ليلة. بعد ستة أشهر يحتوي الـ bucket على 180 نسخة من كل شيء، وتُظهر الفاتورة ذلك. كلما فعّلت الـ versioning، أضف قاعدة `NoncurrentVersionExpiration` في التغيير نفسه.
:::

## أقراص للخوادم: EBS وEFS

بعض البرمجيات تحتاج إلى نظام ملفات حقيقي. وهنا يأتي دور الخدمتين الأخريين.

:::figure يُوصَل إلى S3 عبر HTTPS، ويُرفق EBS بـ instance واحدة، وEFS مشترك
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">يصل أي عميل إلى S3 عبر HTTPS. يُرفق volume في EBS بـ instance واحدة في EC2 داخل منطقة توافر واحدة. ويُركَّب نظام ملفات EFS على instances في منطقتي توافر في الوقت نفسه.</title>
  <rect class="d-box-primary" x="20" y="90" width="150" height="60" rx="10"/>
  <text class="d-label" x="95" y="117" text-anchor="middle">Amazon S3</text>
  <text class="d-label-muted" x="95" y="137" text-anchor="middle">كائنات عبر API</text>
  <text class="d-label-muted" x="95" y="70" text-anchor="middle">متصفّحات، Lambda، CLI</text>
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

**Amazon EBS** (Elastic Block Store) قرص شبكي لـ instance **واحدة** في EC2، ضمن منطقة توافر **واحدة**. وتقريبًا كل instance تُقلع من واحد منها. والنوع `gp3` هو قرص SSD للأغراض العامة الذي تبدأ به. تدفع مقابل الحجم **المحجوز**، لا مقابل ما تملؤه، لذا فإن volume بحجم 500 GB يحمل 20 GB يكلّف ما يكلّفه volume ممتلئ. و**اللقطات (snapshots)** تنسخ الـ volumes احتياطيًا بشكل تزايدي إلى تخزين يصمد أمام خسارة منطقة التوافر.

**Amazon EFS** (Elastic File System) نظام ملفات NFS مُدار تركّبه instances **كثيرة**، عبر مناطق التوافر، في الوقت نفسه. يكبر ويصغر مع ملفاتك ويُحتسب لكل غيغابايت مخزّن فعلًا، بسعر للغيغابايت أعلى من EBS. استخدمه حين يجب أن تتشارك عدة خوادم شجرة مجلّدات واحدة.

بالنسبة إلى Lantern، الجواب في الغالب "لا هذا ولا ذاك": تعيش الملصقات في S3، حيث تستطيع Lambda وCloudFront الوصول إليها. ويحصل خادم الترحيل المؤقت على volume صغير واحد من نوع `gp3`، ولا EFS على الإطلاق.

:::tip اسأل: "من يقرأ هذا، وكيف؟"
إذا كان الكود أو المتصفّحات تقرؤه عبر HTTP، فاستخدم S3. وإذا احتاج خادم واحد إلى قرص، فاستخدم EBS. وإذا احتاجت عدة خوادم إلى المجلّد نفسه، فاستخدم EFS. هذا السؤال الواحد يحسم معظم قرارات التخزين.
:::

حُسم أمر الملفات. في الدرس التالي: البيانات التي تتغيّر كل ثانية، في قاعدة بيانات.
