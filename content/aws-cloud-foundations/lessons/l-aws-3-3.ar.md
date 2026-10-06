---
summary: اختر بين Amazon RDS وAmazon DynamoDB انطلاقًا من أنماط الوصول في حمل العمل، واضبط كلًّا منهما مع النسخ الاحتياطية والتشفير والوصول الخاص منذ البداية.
takeaways:
  - يشغّل Amazon RDS محرّكًا علائقيًا مثل PostgreSQL نيابة عنك، ويتولّى التحديثات والنسخ الاحتياطية والتحويل التلقائي في نمط Multi-AZ، بينما تملك أنت المخطّط والاستعلامات والاتصالات.
  - Amazon DynamoDB قاعدة بيانات serverless من نوع مفتاح-قيمة ومستندات، تصمّم فيها المفاتيح حول الأسئلة التي ستطرحها.
  - يحتسب RDS في الغالب لكل ساعة تشغيل للـ instance، مشغولة كانت أم خاملة؛ أما DynamoDB بنمط on-demand فيحتسب لكل طلب ولكل غيغابايت مخزّن.
  - استخدم Query من DynamoDB على المفاتيح في المسارات الساخنة، لأن Scan يقرأ الجدول كله ويحتسبه.
  - كثير من الأنظمة الحقيقية تستخدم الاثنين، البيانات العلائقية في RDS، وعمليات البحث البسيطة عالية الحجم في DynamoDB.
further:
  - title: What is Amazon RDS?
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html
  - title: What is Amazon DynamoDB?
    url: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html
  - title: DynamoDB throughput capacity (on-demand and provisioned)
    url: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html
  - title: Configuring and managing a Multi-AZ deployment for Amazon RDS
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html
quiz:
  - q: يريد أمين صندوق Lantern تقارير مخصّصة عند الطلب مثل «الفعاليات لكل مكان في كل شهر، مع أسماء المنظّمين»، والأسئلة تتغيّر كل ربع سنة. أيّ قاعدة بيانات تناسبه؟
    options:
      - text: DynamoDB، لأنها serverless وتتوسّع تلقائيًا.
        why: التوسّع ليس المشكلة هنا. تجيب DynamoDB عن الأسئلة التي صمّمت المفاتيح لها؛ وكل JOIN جديد عند الطلب يعني indexes أو تصديرات جديدة في كل مرة.
      - text: RDS for PostgreSQL، لأن عمليات JOIN والتجميع في SQL تجيب عن الأسئلة الجديدة دون إعادة تصميم البيانات.
        why: صحيح. تتألّق قواعد البيانات العلائقية حين تكون الأسئلة متنوّعة وتتغيّر مع الوقت.
      - text: S3 Standard، لأن التقارير ملفات.
        why: يمكن أن تعيش مخرجات التقرير في S3، لكن S3 ليست قاعدة بيانات ولا تستطيع ربط الصفوف أو تجميعها بنفسها.
    answer: 1
  - q: مفتاح التقسيم (partition key) في جدول تأكيدات الحضور هو `eventId` ومفتاح الترتيب (sort key) هو `email`. أيّ استدعاء يعيد كل تأكيدات الحضور لفعالية واحدة بكفاءة؟
    options:
      - text: Scan مع ترشيح على `eventId`.
        why: يقرأ Scan كل عنصر في الجدول ثم يطبّق الترشيح بعد ذلك، فتدفع ثمن قراءة الجدول كله.
      - text: GetItem مع `eventId` فقط.
        why: يحتاج GetItem إلى المفتاح الأساسي كاملًا، أي مفتاح التقسيم ومفتاح الترتيب، ويعيد عنصرًا واحدًا.
      - text: Query مع شرط المفتاح `eventId = :e`.
        why: صحيح. لا يقرأ Query إلا العناصر تحت مفتاح التقسيم ذاك، فتنمو التكلفة مع تأكيدات الحضور لتلك الفعالية، لا مع حجم الجدول.
    answer: 2
  - q: أيّ إعداد في RDS يحمي قاعدة بيانات الفعاليات في Lantern من خسارة منطقة توافر واحدة؟
    options:
      - text: نشر بنمط Multi-AZ، يحتفظ بنسخة احتياطية جاهزة (standby) في منطقة توافر أخرى ويتحوّل إليها تلقائيًا.
        why: صحيح. ينسخ RDS البيانات إلى الـ standby بشكل متزامن، ويتحوّل إليه حين تواجه منطقة توافر النسخة الرئيسية مشكلة.
      - text: نسخ احتياطية تلقائية بفترة احتفاظ مدتها سبعة أيام.
        why: تتيح لك النسخ الاحتياطية الاستعادة إلى نقطة زمنية، لكن الاستعادة تنشئ instance جديدة وتستغرق وقتًا. إنها ليست تحويلًا تلقائيًا.
      - text: فئة instance أكبر.
        why: المزيد من المعالج والذاكرة يساعد مع الحمل، لكن instance أكبر في منطقة توافر واحدة تسقط مع تلك المنطقة.
      - text: تشفير التخزين.
        why: التشفير يحمي البيانات المخزّنة من القراءة. ولا يفعل شيئًا للتوافرية.
    answer: 0
---

كان لخادم Lantern القديم قاعدة بيانات PostgreSQL واحدة لكل شيء: الفعاليات والأماكن والمنظّمون وكل تأكيد حضور. وخلال ذروة المهرجان، اصطفّت عمليات كتابة تأكيدات الحضور خلف استعلام تقرير بطيء، فتجمّد الموقع كله. على AWS يمكنك أن تمنح كل نوع من البيانات قاعدة البيانات التي تناسبه. الاثنتان اللتان ستتعرّف إليهما أولًا هما **Amazon RDS** و**Amazon DynamoDB**، وتختلفان في معظم الجوانب التي تعنيك فعلًا.

## Amazon RDS: قاعدة بيانات SQL الخاصة بك، تُشغَّل نيابة عنك

يشغّل **Amazon Relational Database Service** محرّكًا علائقيًا على بنية تحتية تديرها AWS. ومن المحرّكات المتاحة PostgreSQL وMySQL وMariaDB وOracle وSQL Server وDb2، إضافة إلى **Amazon Aurora**، المحرّك الخاص بـ AWS والمتوافق مع MySQL وPostgreSQL.

تتولّى AWS الأعمال الروتينية التي كان فريق Lantern ينجزها في الثانية فجرًا: تجهيز الموارد، وتحديث نظام التشغيل والمحرّك في نافذة صيانة تختارها، و**النسخ الاحتياطية التلقائية** مع الاستعادة إلى نقطة زمنية، ونشر **Multi-AZ** مع standby متزامن في منطقة توافر أخرى يتولّى العمل تلقائيًا. ويبقى لك المخطّط، والـ indexes، والاستعلامات، ومستخدمو قاعدة البيانات، وحجم الـ instance، ومن يستطيع الاتصال.

إليك كيف ينشئ Lantern قاعدة بيانات الفعاليات، مع توضيح الخيارات الآمنة:

```bash
aws rds create-db-instance \
  --db-instance-identifier lantern-events \
  --engine postgres --db-instance-class db.t4g.micro \
  --allocated-storage 20 --storage-encrypted \
  --master-username lantern_admin --manage-master-user-password \
  --backup-retention-period 7 --multi-az \
  --no-publicly-accessible
```

يخزّن `--manage-master-user-password` كلمة مرور المدير في AWS Secrets Manager بدلًا من سجل أوامر الـ shell. ويُبقي `--no-publicly-accessible` قاعدة البيانات بعيدة عن الإنترنت؛ والدرس القادم يضعها في شبكة فرعية خاصة. ولأن تطبيق Lantern الحالي يعتمد على SQL، فالترحيل مجرد `pg_dump` ثم استعادة، مع بقاء الاستعلامات كما هي:

```sql
SELECT v.name, date_trunc('month', e.starts_at) AS month, count(*) AS events
FROM events e
JOIN venues v ON v.id = e.venue_id
GROUP BY v.name, month
ORDER BY month DESC, events DESC;
```

**كيف يحتسب RDS:** لكل **ساعة تشغيل للـ instance** (مع Savings Plans أو reserved instances للاستخدام الثابت)، إضافة إلى التخزين لكل غيغابايت شهريًا، والنسخ الاحتياطية التي تتجاوز حصة مجانية، ونقل البيانات. ونشر Multi-AZ يضاعف تقريبًا تكلفة الـ instance لأن هناك اثنتين منها. والأهم أن الـ instance تُحتسب **طوال الشهر مشغولة كانت أم خاملة**. ويستطيع Aurora Serverless v2 أن يوسّع السعة مع الحمل وأن يتوقّف مؤقتًا عند الخمول، وهذا يناسب قواعد البيانات ذات الحمل المتقطّع أو قواعد بيانات التطوير.

## Amazon DynamoDB: صمّم المفاتيح، واحصل على السرعة بأي حجم

**DynamoDB** قاعدة بيانات serverless من نوع مفتاح-قيمة ومستندات. لا توجد instance تحدّد حجمها: تنشئ **جدولًا**، وتختار **مفتاحًا أساسيًا (primary key)**، وتقرأ **العناصر (items)** وتكتبها (وهي مستندات شبيهة بـ JSON) بزمن استجابة ثابت بأجزاء قليلة من الألف من الثانية، سواء كانت عشرة طلبات يوميًا أو عشرات الآلاف في الثانية.

العقبة أنك تصمّم المفاتيح حول الأسئلة التي ستطرحها. بالنسبة إلى تأكيدات الحضور، أسئلة Lantern هي «من سيحضر الفعالية X؟» و«هل أكّد هذا الشخص حضوره إلى X من قبل؟». وهذا يعطي **مفتاح تقسيم (partition key)** هو `eventId` و**مفتاح ترتيب (sort key)** هو `email`:

```bash
aws dynamodb create-table --table-name lantern-rsvps \
  --attribute-definitions AttributeName=eventId,AttributeType=S \
                          AttributeName=email,AttributeType=S \
  --key-schema AttributeName=eventId,KeyType=HASH \
               AttributeName=email,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

عندئذٍ يصبح عدّ تأكيدات الحضور لفعالية واحدة **Query** رخيصًا:

```bash
aws dynamodb query --table-name lantern-rsvps \
  --key-condition-expression "eventId = :e" \
  --expression-attribute-values '{":e": {"S": "evt-2026-street-food"}}' \
  --select COUNT
```

**كيف يحتسب DynamoDB:** في نمط **on-demand** (`PAY_PER_REQUEST`)، لكل طلب قراءة وكتابة إضافة إلى التخزين لكل غيغابايت شهريًا، ولا شيء مقابل وقت الخمول. أما نمط **provisioned**، مع التوسّع التلقائي، فقد يكون أرخص للزيارات الثابتة المتوقّعة. ابدأ بـ on-demand؛ ولا تنتقل إلا حين تُظهر الفاتورة حملًا ثابتًا. والاستعادة إلى نقطة زمنية (point-in-time recovery) إعداد تفعّله لكل جدول، ويجب أن تفعّله.

:::mistake المسح الكامل للعثور على بضعة عناصر
يقرأ `Scan` مع ترشيح كل عنصر في الجدول ثم يتخلّص من معظمها، وتدفع ثمن كل عنصر مقروء. يعمل في الاختبار مع 50 تأكيد حضور، ثم يصبح بطيئًا ومكلفًا مع 500,000. إذا احتاج مسار ساخن (hot path) إلى سؤال لا تستطيع مفاتيحك الإجابة عنه بـ `Query` أو `GetItem`، فأضف له global secondary index بدلًا من المسح الكامل.
:::

## الاختيار

| السؤال | RDS | DynamoDB |
|---|---|---|
| هل الأسئلة متنوّعة أو تُطرح عند الطلب؟ | نعم: SQL يتعامل مع الجديد منها | لا: المفاتيح تجيب عن المعروف منها |
| هل تحتاج إلى JOIN وقيود بين عدة جداول؟ | نعم | نادرًا؛ تلغي التطبيع (denormalise) |
| زيارات متقطّعة مع أوقات خمول؟ | تدفع ثمن ساعات الخمول | تدفع لكل طلب |
| كود SQL موجود تريد الاحتفاظ به؟ | احتفظ به | أعد كتابة طبقة الوصول إلى البيانات |
| العمليات التي تبقى عليك | تحديد الحجم، والاتصالات، والترقيات | تصميم المفاتيح |

ينتهي Lantern بـ **الاثنتين**: الفعاليات والأماكن والمنظّمون في RDS for PostgreSQL، حيث تعمل التقارير وصفحات الإدارة الحالية دون تغيير؛ وتأكيدات الحضور في DynamoDB، حيث تكلّف ذروة الكتابة في فعالية منتشرة بضعة سنتات من الطلبات بدلًا من تجميد قاعدة البيانات المشتركة.

:::why الأمان المهمة نفسها في الاثنتين
شفّر البيانات المخزّنة (مفعّل افتراضيًا في DynamoDB، وخيار تضبطه في RDS)، وأبقِ قاعدة البيانات بعيدة عن متناول الإنترنت، وامنح الـ role الخاص بالتطبيق الإجراءات التي يحتاجها فقط، مثل `dynamodb:PutItem` و`dynamodb:Query` على ARN جدول واحد.
:::

قاعدة البيانات خاصة، لكنها محجوبة عن *ماذا* بالضبط؟ يبني الدرس التالي الشبكة التي تعيش فيها قطع Lantern.
