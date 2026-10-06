---
summary: اقرأ أي سياسة IAM عبارةً عبارة، واكتب سياسات بمبدأ أقل الصلاحيات مع ARNs دقيقة، وأضف شروطًا مثل MFA وTLS تضيّق متى ينطبق السماح.
takeaways:
  - العبارة (statement) هي Effect وAction وResource، ويمكن تضييقها اختياريًا بـ Condition؛ وتسمّي السياسات القائمة على المورد Principal أيضًا.
  - الإجراءات على مستوى الـ bucket مثل s3:ListBucket تأخذ ARN الـ bucket، أما الإجراءات على مستوى الكائن مثل s3:GetObject فتحتاج إلى ARN الـ bucket متبوعًا بـ /* أو بمسار أضيق.
  - أقل الصلاحيات (least privilege) يعني أن تسرد الإجراءات والموارد المحدّدة التي تحتاجها المهمة، ثم لا توسّعها إلا حين يخبرك خطأ AccessDenied حقيقي بذلك.
  - مفاتيح الشروط تُجمع بينها بـ AND، والقيم المتعدّدة للمفتاح الواحد تُجمع بـ OR.
  - تحقّق من كل سياسة قبل إرفاقها باستخدام IAM Access Analyzer، في محرّر الـ console أو عبر aws accessanalyzer validate-policy.
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
      دالة لها هذه السياسة تستدعي `GetObject` على `posters/2026/festival.jpg` في الـ bucket المسمّى `lantern-posters` فتحصل على AccessDenied. لماذا؟
      ```json
      {
        "Effect": "Allow",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::lantern-posters"
      }
      ```
    options:
      - text: يجب أن يكون الـ Action هو `s3:Get*` لأن `GetObject` ليس اسم إجراء حقيقيًا.
        why: الإجراء `s3:GetObject` حقيقي. والرمز البديل سيوسّع السياسة فقط دون أن يصلح المشكلة الفعلية.
      - text: الـ Resource هو الـ bucket، لكن GetObject يعمل على الكائنات، فيحتاج إلى `arn:aws:s3:::lantern-posters/*`.
        why: صحيح. إجراءات الكائنات تطابق ARNs الكائنات. ومن دون `/*` (أو مسار أضيق) لا تطابق العبارة الطلب أبدًا.
      - text: يجب أن تتضمّن سياسات S3 عنصر Principal، لذا تُتجاهل العبارة.
        why: السياسات القائمة على الهوية ليس فيها Principal؛ فالهوية المرفقة بها هي الـ principal. السياسات القائمة على المورد وحدها تحتاج إليه.
      - text: سطر Version مفقود، لذا يرفض IAM السياسة كلها.
        why: من دون Version يعود IAM إلى لغة 2008 القديمة وتتوقف متغيّرات السياسات عن العمل، لكن عبارة بسيطة كهذه تظل تطابق.
    answer: 1
  - q: |
      أيّ الطلبات يسمح بها هذا الشرط؟
      ```json
      "Condition": {
        "StringEquals": { "aws:RequestedRegion": ["eu-west-1", "eu-south-2"] },
        "Bool": { "aws:SecureTransport": "true" }
      }
      ```
    options:
      - text: الطلبات إلى أيٍّ من الـ Regions المذكورة، سواء استخدمت TLS أم لا.
        why: المفتاحان يُجمعان بـ AND، لذا يظل فحص TLS منطبقًا على كل طلب.
      - text: الطلبات التي تستخدم TLS، إلى أي Region.
        why: المفاتيح المختلفة تُجمع بـ AND. ويظل على مفتاح الـ Region أن يطابق إحدى القيم المدرجة له.
      - text: الطلبات إلى eu-west-1 أو eu-south-2 التي تستخدم TLS أيضًا.
        why: صحيح. القيم داخل المفتاح الواحد تُجمع بـ OR (أيٌّ من الاثنتين)، والمفاتيح المنفصلة تُجمع بـ AND (مع TLS).
    answer: 2
  - q: تحتاج إلى سياسة لدالة تغيير حجم الملصقات في Lantern، لكنك لست متأكّدًا من إجراءات S3 التي تستدعيها. ما أفضل نقطة بداية؟
    options:
      - text: امنح `s3:*` على `*` وضيّقها لاحقًا حين يتوفّر الوقت.
        why: نادرًا ما يأتي ذلك اللاحق، وفي الأثناء يستطيع أي خطأ أو اختراق في الدالة أن يمسّ كل bucket في الحساب.
      - text: امنح الإجراءات التي تعرف أنها تحتاجها على مسار الـ bucket الدقيق، ثم لا تضف إجراءات إلا حين يُظهر AccessDenied حقيقي أنها ناقصة.
        why: صحيح. أخطاء AccessDenied تسمّي الإجراء الناقص، فالتوسيع بناءً على الدليل سريع ويُبقي السياسة محكمة.
      - text: أرفق السياسة المُدارة من AWS `AmazonS3FullAccess` لأن AWS تتولّى صيانتها.
        why: تتولّى AWS صيانة نص السياسة، لا مدى ملاءمتها لمهمتك. الوصول الكامل إلى كل bucket أوسع بكثير مما تحتاجه دالة واحدة.
    answer: 1
  - q: |
      ماذا تفعل عبارة سياسة الـ bucket هذه؟
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
      - text: تحجب كل طلب إلى الـ bucket، بما في ذلك طلبات المديرين.
        why: يقصرها الشرط على الطلبات التي تكون فيها SecureTransport بقيمة false، أي HTTP العادي. طلبات HTTPS لا تتأثّر.
      - text: تحجب أي طلب يُرسَل عبر HTTP العادي، من أي أحد.
        why: صحيح. إنها حاجز حماية قياسي. ومع قاعدة الرفض الصريح، لا يستطيع أحد القراءة من الـ bucket أو الكتابة فيه دون TLS.
      - text: تسمح للمستخدمين المجهولين بقراءة الـ bucket عبر HTTPS.
        why: عبارة Deny لا تمنح أي شيء أبدًا. الوصول العام يحتاج إلى Allow وإلى إيقاف Block Public Access.
    answer: 1
---

في الدرس السابق تعلّمت كيف يقرّر IAM. والآن تكتب ما يقرّر *بناءً عليه*. يحتاج Lantern إلى سياسة للدالة التي تستقبل الملصقات المرفوعة، وسياسة للمطوّرين، وسياسة bucket تحمي الملصقات. والثلاث مكتوبة بلغة JSON الصغيرة نفسها.

## تشريح العبارة

إليك سياسة دالة الرفع في Lantern، التي تحفظ الملصقات تحت `uploads/` وتسرد أحيانًا ما يوجد هناك:

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

اقرأها من الأعلى إلى الأسفل:

- `Version` دائمًا `"2012-10-17"`، وهو الإصدار الحالي للغة السياسات. إنه نص ثابت، لا تاريخ اليوم.
- `Statement` قائمة. وكل عبارة تُقيَّم وحدها.
- `Sid` تسمية اختيارية. سمِّ الغرض من العبارة؛ وستشكرك نفسك في المستقبل.
- `Effect` قيمته `Allow` أو `Deny`.
- `Action` إجراء واحد أو قائمة، ويُكتب بالشكل `service:Operation`. الرموز البديلة تعمل (`s3:Get*`) لكن كل واحد منها يوسّع الباب.
- `Resource` ARN واحد أو قائمة. والرموز البديلة تعمل هنا أيضًا.
- `Condition` اختياري ويضيّق متى تنطبق العبارة.

تضيف السياسات القائمة على المورد، مثل سياسات الـ buckets، عنصر `Principal` يسمّي من تخصّه العبارة. أما السياسات القائمة على الهوية فلا تحتوي عليه، لأن الهوية المرفقة بها *هي* الـ principal.

## ARN الـ bucket أم ARN الكائن؟

للسياسة أعلاه موردان مختلفان عن قصد. `s3:ListBucket` عملية على **الـ bucket**، لذا موردها هو `arn:aws:s3:::lantern-posters`. و`s3:PutObject` عملية على **الكائنات**، لذا موردها ARN الـ bucket متبوعًا بمسار: `lantern-posters/uploads/*`. بدّل بينهما فلن تطابق أيٌّ من العبارتين أبدًا، وستحصل على AccessDenied مع سياسة تبدو صحيحة.

التمييز نفسه موجود في أماكن أخرى. فالإجراء `dynamodb:Query` على index في جدول يحتاج إلى ARN الـ index (`table/lantern-rsvps/index/by-event`)، لا إلى ARN الجدول وحده. عندما تسمح سياسة "بوضوح" بشيء وترفضه AWS، قارن ARN الطلب بـ ARN السياسة حرفًا حرفًا.

:::mistake الرمز البديل المريح
العبارة `"Action": "s3:*", "Resource": "*"` تُخفي كل أخطاء AccessDenied، بما في ذلك الاستدعاء الذي يُجريه خطأ برمجي أو مهاجم لحذف bucket آخر. الرموز البديلة في **كلٍّ من** Action وResource تكاد لا تكون صحيحة أبدًا خارج role خاص بالمدير. إذا احتجت إلى رمز بديل، ضعه في مكان واحد وثبّت الآخر.
:::

## أقل الصلاحيات عمليًا

**أقل الصلاحيات (least privilege)** يعني ألّا تمنح إلا الإجراءات والموارد التي تحتاجها المهمة. يبدو هذا بطيئًا، لكن طريقة العمل سريعة:

1. اكتب ما تفعله المهمة بكلمات بسيطة: "تكتب الملصقات في `uploads/`، وتسرد تلك البادئة".
2. ترجم كل فعل إلى إجراء، وكل اسم إلى ARN دقيق.
3. انشر واختبر. رسالة AccessDenied تسمّي الإجراء والمورد الناقصين؛ أضف ذلك بالضبط.

بالنسبة إلى الـ roles الموجودة، يعرض IAM معلومات **آخر وصول (last accessed)** لكل خدمة، ويستطيع IAM Access Analyzer توليد سياسة من الإجراءات التي استخدمها الـ role فعلًا وفق AWS CloudTrail. وكلاهما طريقة جيدة لتقليص سياسة اتّسعت أكثر من اللازم.

## الشروط: متى ينطبق السماح

كتلة الشرط تربط **العوامل (operators)** بـ **المفاتيح (keys)** و**القيم (values)**:

```json
"Condition": {
  "StringEquals": { "aws:RequestedRegion": ["eu-west-1", "eu-south-2"] },
  "Bool": { "aws:MultiFactorAuthPresent": "true" }
}
```

قاعدتان تجعلان الشروط قابلة للتوقّع. المفاتيح المنفصلة تُجمع بـ **AND**: يجب أن يكون الطلب في إحدى تلك الـ Regions *وأن* يُرسَل باستخدام MFA. والقيم المتعدّدة للمفتاح الواحد تُجمع بـ **OR**: أيٌّ من الاثنتين تفي بالغرض.

مفاتيح مفيدة لـ Lantern:

| المفتاح | استخدمه من أجل |
|---|---|
| `aws:SecureTransport` | رفض طلبات HTTP العادي |
| `aws:MultiFactorAuthPresent` | اشتراط MFA للإجراءات الخطرة مثل الحذف |
| `aws:SourceIp` | قصر الإنسان على نطاق عناوين المكتب أو الـ VPN |
| `aws:RequestedRegion` | إبقاء العمل داخل الـ Regions الخاصة بـ Lantern |
| `s3:prefix` | قصر ListBucket على مجلّد واحد |

والشروط ممتازة أيضًا كحواجز حماية بـ **الرفض**. ترفض سياسة الـ bucket في Lantern أي طلب دون TLS، من أي أحد:

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

ولأن الرفض الصريح ينتصر دائمًا، لا يستطيع أي سماح في أي مكان إلغاءه.

## تحقّق قبل أن ترفق

يشغّل محرّر السياسات في console الـ IAM فحوص **IAM Access Analyzer** أثناء كتابتك: أخطاء الصياغة، والإجراءات غير الصالحة، والتحذيرات الأمنية مثل رمز بديل في pass-role. ومن الطرفية:

```bash
aws accessanalyzer validate-policy \
  --policy-type IDENTITY_POLICY \
  --policy-document file://lantern-upload-policy.json \
  --query "findings[].[findingType,issueCode]" --output table
```

النتيجة الفارغة تعني عدم وجود ملاحظات. أصلح كل `ERROR` و`SECURITY_WARNING`، واقرأ كل `WARNING` و`SUGGESTION`.

:::tip السياسات كود
احتفظ بسياسات Lantern في المستودع بجوار التطبيق، وراجعها في pull requests، وتحقّق منها في الـ CI. تغيير السياسة قد يُحدث ضررًا أكبر من تغيير الكود، لذا يستحق مراجعة لا تقل عنه.
:::

أصبحت تستطيع كتابة صلاحيات محكمة. في الدرس التالي: كيف يحصل عليها الأشخاص دون مستخدمي IAM، وكيف يحصل عليها الكود دون مفاتيح وصول.
