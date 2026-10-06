---
summary: اقرأ مخرجات EXPLAIN QUERY PLAN لتميّز المسح الكامل من البحث عبر الـ index، واكتب شروطًا تستطيع قاعدة البيانات خدمتها من index، وقدّر متى يستحق index جديد أن تطلبه.
takeaways:
  - الـ index نسخة مرتّبة من عمود أو أكثر مع مؤشّرات تعود إلى الصفوف، فتستطيع قاعدة البيانات القفز إلى القيم المطابقة بدل قراءة كل صف.
  - في EXPLAIN QUERY PLAN تعني SEARCH ... USING INDEX أن الـ index ضيّق العمل؛ وتعني SCAN أن كل صف (أو كل مدخل في الـ index) قد قُرئ.
  - وضع عمود عليه index داخل دالة أو عملية حسابية، مثل date(order_date)، يمنع عادةً استخدام الـ index؛ قارن العمود المجرّد بنطاق بدل ذلك.
  - الـ indexes تسرّع القراءة لكنها تكلّف مساحة تخزين وتبطئ كل إدراج وتحديث، لذا أضفها للشروط المتكرّرة والانتقائية ولمفاتيح الربط.
further:
  - title: SQLite EXPLAIN QUERY PLAN
    url: https://www.sqlite.org/eqp.html
  - title: SQLite query optimizer overview
    url: https://www.sqlite.org/optoverview.html
  - title: PostgreSQL using EXPLAIN
    url: https://www.postgresql.org/docs/current/using-explain.html
quiz:
  - q: "على `orders` يوجد index على `order_date`. أي شرط لطلبات 28 نوفمبر 2025 يستطيع استخدامه كـ SEARCH؟"
    options:
      - text: "`WHERE date(order_date) = '2025-11-28'`"
        why: يخزّن الـ index قيم `order_date` الخام لا `date(order_date)`، فتضطر قاعدة البيانات إلى حساب الدالة لكل صف.
      - text: "`WHERE strftime('%Y-%m-%d', order_date) = '2025-11-28'`"
        why: المشكلة نفسها بدالة مختلفة؛ أي تعبير يحيط بالعمود يخفيه عن الـ index.
      - text: "`WHERE order_date >= '2025-11-28' AND order_date < '2025-11-29'`"
        why: صحيح. العمود المجرّد يُقارَن بثوابت، فتستطيع قاعدة البيانات الانتقال إلى بداية النطاق في الـ index المرتّب والتوقف عند نهايته.
    answer: 2
  - q: "تعرض خطة التنفيذ `SCAN orders USING COVERING INDEX idx_orders_date`. ماذا يعني ذلك؟"
    options:
      - text: قُرئ كل مدخل في الـ index، لكن الجدول نفسه لم يُلمس لأن الـ index احتوى على كل عمود احتاجه الـ query.
        why: صحيح. هذا أرخص من مسح الجدول، لأن الـ index أصغر، لكنه يبقى مرورًا كاملًا لا SEARCH موجّهًا.
      - text: استُخدم الـ index للقفز مباشرةً إلى الصفوف المطابقة.
        why: هذا سيكون SEARCH. أما SCAN فيعني دائمًا قراءة كل شيء، وهنا الـ index كله.
      - text: الـ query معطوب وسيعيد نتائج خاطئة.
        why: خطط التنفيذ تصف السرعة لا الصحة أبدًا؛ النتيجة واحدة في الحالتين.
      - text: أنشأ SQLite index مؤقتًا لهذا الـ query.
        why: الـ index المؤقت يظهر في الخطة على شكل AUTOMATIC INDEX؛ أما هذا فيسمّي index دائمًا.
    answer: 0
  - q: قاعدة بيانات تحليلية تستقبل مليون جلسة ويب جديدة يوميًا، ويُستعلم منها بضع مرات يوميًا حسب `source`. يقترح أحدهم indexes على الأعمدة التسعة كلها في `web_sessions`. ما أفضل رد؟
    options:
      - text: وافق؛ المزيد من الـ indexes يسرّع الـ queries دائمًا.
        why: الـ indexes لا تساعد إلا الـ queries التي تصفّي أو تربط أو ترتّب على أعمدتها، وكل واحد منها يضيف عملًا إلى كل إدراج.
      - text: ارفض كل الـ indexes لأن الكتابة أهم من القراءة.
        why: هذا مطلق أكثر من اللازم. الـ index الذي يخدم شرطًا متكرّرًا وانتقائيًا يستحق عادةً تكلفة الكتابة.
      - text: ضع index على `customer_id` فقط، لأن المعرّفات هي دائمًا أفضل index.
        why: أفضل index هو الذي يطابق طريقة الاستعلام من الجدول. لا شيء في هذا السيناريو يصفّي حسب العميل.
      - text: ضع indexes على الأعمدة التي تصفّي عليها queries حقيقية متكرّرة أو تربط بها، وافحص الخطط، وتجاهل الباقي.
        why: صحيح. لكل index تكلفة كتابة وتخزين، فأضف ما يخدم queries فعلية وتأكّد بـ EXPLAIN QUERY PLAN أنها مستخدمة.
    answer: 3
  - q: "في PostgreSQL، ماذا يفعل `EXPLAIN ANALYZE` ولا يفعله `EXPLAIN`؟"
    options:
      - text: يعيد كتابة الـ query ليستخدم indexes أفضل.
        why: لا يغيّر أيٌّ من الأمرين الـ query؛ إنهما يقدّمان تقريرًا عنه فقط.
      - text: يشغّل الـ query فعلًا ويعرض أعداد الصفوف والأزمنة الحقيقية بجانب التقديرات.
        why: صحيح. هذا يجعله الأداة المناسبة لإيجاد المواضع التي تخطئ فيها التقديرات، وسببًا للحذر عند تشغيله على أوامر تعدّل البيانات.
      - text: يحلّل الـ query بحثًا عن أخطاء الصياغة فقط.
        why: الصياغة يفحصها كل أمر؛ وANALYZE يضيف التنفيذ لا التحقّق.
    answer: 1
---

لدى مارك لوحة معلومات تعرض طلبات يوم مختار، وقد أصبحت بطيئة على قاعدة البيانات الإنتاجية. «الـ query نفسه كالعادة. لماذا صار بطيئًا فجأة؟». على طلبات Cartwheel التي تبلغ ألفين، يعيد كل query في هذه الدورة نتيجته فورًا. أما بيئة الإنتاج ففيها سنوات من الطلبات، وهناك يكون الفرق بين query يقرأ كل صف وآخر يقفز إلى الصفوف الصحيحة فرقًا بين ثوانٍ ودقائق. لا يمكنك أن تشعر بهذا الفرق على قاعدة بيانات صغيرة، لكن يمكنك أن **تراه** في خطة التنفيذ (query plan).

## ما هو الـ index

الـ index بنية منفصلة تحفظ قيم عمود أو أكثر مرتّبة، مع مؤشّر من كل قيمة إلى صفها. إيجاد '2025-11-28' في قائمة مرتّبة يشبه إيجاد كلمة في قاموس: تقفز إلى الصفحة الصحيحة على وجه التقريب بدل القراءة من البداية. بدون index، تضطر قاعدة البيانات إلى قراءة الجدول كله واختبار كل صف، وهذا هو **المسح** (scan).

:::figure المسح يقرأ كل صف؛ والبحث عبر الـ index يقفز إلى النطاق المطابق
<svg viewBox="0 0 720 230" role="img" aria-labelledby="t1">
  <title id="t1">على اليسار: مسح كامل يفحص كل صفوف جدول orders واحدًا تلو الآخر. على اليمين: الـ index المسمّى idx_orders_date يحفظ التواريخ مرتّبة؛ والبحث يقفز إلى 2025-11-28، ويقرأ المدخلات المطابقة ويتبع مؤشّراتها إلى الصفوف.</title>
  <text class="d-label-strong" x="160" y="28" text-anchor="middle">SCAN orders</text>
  <rect class="d-box" x="60" y="40" width="200" height="26" rx="4"/>
  <rect class="d-box" x="60" y="70" width="200" height="26" rx="4"/>
  <rect class="d-box" x="60" y="100" width="200" height="26" rx="4"/>
  <rect class="d-box" x="60" y="130" width="200" height="26" rx="4"/>
  <rect class="d-box" x="60" y="160" width="200" height="26" rx="4"/>
  <text class="d-label-muted" x="160" y="215" text-anchor="middle">اختبار كل صف</text>
  <path class="d-arrow" d="M40 45 L40 185" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="450" y="28" text-anchor="middle">SEARCH idx_orders_date</text>
  <rect class="d-box" x="370" y="40" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="58" text-anchor="middle">2024-01-02</text>
  <rect class="d-box" x="370" y="70" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="88" text-anchor="middle">…</text>
  <rect class="d-box-success" x="370" y="100" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="118" text-anchor="middle">2025-11-28 08:…</text>
  <rect class="d-box-success" x="370" y="130" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="148" text-anchor="middle">2025-11-28 23:…</text>
  <rect class="d-box" x="370" y="160" width="160" height="26" rx="4"/>
  <text class="d-code" x="450" y="178" text-anchor="middle">2025-12-30</text>
  <path class="d-arrow" d="M330 50 L365 108" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="580" y="100" width="120" height="26" rx="4"/>
  <text class="d-label" x="640" y="118" text-anchor="middle">الصف 2290</text>
  <rect class="d-box-accent" x="580" y="130" width="120" height="26" rx="4"/>
  <text class="d-label" x="640" y="148" text-anchor="middle">الصف 1769</text>
  <path class="d-arrow" d="M530 113 L576 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M530 143 L576 143" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="530" y="215" text-anchor="middle">قفزة، ثم قراءة النطاق، ثم تتبّع المؤشّرات</text>
</svg>
:::

في قاعدة بيانات Cartwheel بعض الـ indexes بالفعل. يمكنك عرضها من جدول المخطط:

```sql run
SELECT name, tbl_name, sql
FROM sqlite_schema
WHERE type = 'index';
```

على `orders` يوجد index على `customer_id` وآخر على `order_date`، وعلى `order_items` index على `order_id` وآخر على `product_id`. أما المدخل `sqlite_autoindex_customers_1` فموجود لأن `email` معرّف كـ UNIQUE؛ ويفرض SQLite التفرّد باستخدام index.

## قراءة خطة التنفيذ

ضع `EXPLAIN QUERY PLAN` قبل أي SELECT، فيصف SQLite كيف سينفّذه بدل أن ينفّذه. الجزء المهم هو العمود `detail`:

```sql run
EXPLAIN QUERY PLAN
SELECT order_id, status
FROM orders
WHERE order_date >= '2025-11-28'
  AND order_date <  '2025-11-29';
```

`SEARCH orders USING INDEX idx_orders_date (order_date>? AND order_date<?)`. تعني **SEARCH** أن الـ index ضيّق العمل إلى نطاق. والآن الـ query الخاص بلوحة مارك، الذي «بسّطه» أحدهم الشهر الماضي:

```sql run
EXPLAIN QUERY PLAN
SELECT order_id, status
FROM orders
WHERE date(order_date) = '2025-11-28';
```

`SCAN orders`. النتيجة نفسها، لكن الآن يُقرأ كل صف وتُحسب `date()` لكل واحد منها. يخزّن الـ index قيم `order_date` الخام؛ ولا يعرف شيئًا عن `date(order_date)`، فلا يستطيع المساعدة. هذا هو «البطء المفاجئ».

:::mistake إحاطة العمود الذي عليه index
لا يستطيع الشرط استخدام index إلا حين يقف العمود المفهرس وحده في أحد طرفي المقارنة. `date(order_date) = ...` و`strftime('%Y', order_date) = '2025'` و`customer_id + 0 = 42` و`LOWER(email) = ...` كلها تخفي العمود داخل تعبير. أعِد كتابتها كنطاقات على العمود المجرّد: `order_date >= '2025-01-01' AND order_date < '2026-01-01'`. الشروط التي تستطيع استخدام index تُسمّى غالبًا **sargable**. والنطاقات نصف المفتوحة التي تعلّمتها في درس التواريخ sargable بطبيعة تصميمها.
:::

هناك عبارتان أخريان في الخطط تستحقان أن تتعرّف عليهما. `USING COVERING INDEX` تعني أن الـ index وحده احتوى على كل عمود احتاجه الـ query، فلم يُلمس الجدول إطلاقًا، وهذا أسرع أنواع البحث. و`USE TEMP B-TREE FOR GROUP BY` أو `FOR ORDER BY` تعني أن SQLite اضطر إلى ترتيب الصفوف بنفسه، وهذا مقبول مع النتائج الصغيرة ويستحق نظرة مع الكبيرة.

خطط الـ JOIN تعرض سطرًا لكل جدول، بالترتيب الذي يزورها به SQLite:

```sql run
EXPLAIN QUERY PLAN
SELECT o.order_id, SUM(oi.quantity) AS units
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.order_id
WHERE o.customer_id = 42
GROUP BY o.order_id;
```

السطران كلاهما SEARCH: اعثر على طلبات العميل 42 عبر `idx_orders_customer`، ثم على عناصر كل طلب عبر `idx_items_order`. وجود index على كل مفتاح أجنبي تربط به هو أثمن عادة منفردة في الفهرسة.

## الخطط تنبؤات

خطة التنفيذ هي اختيار المُحسِّن (optimizer)، لا ضمان للسرعة، وهي تعتمد على البيانات. في جدول صغير جدًا قد يقرّر المُحسِّن أن المسح أرخص من الـ index، وسيكون محقًا. يستطيع المحرّكان كلاهما الاحتفاظ بإحصاءات عن كل جدول يجمعها الأمر `ANALYZE` (في PostgreSQL تشغّله عملية autovacuum تلقائيًا، أما في SQLite فلا بد أن يشغّله أحد)، ويستخدمانها لتقدير عدد الصفوف التي تعيدها كل خطوة. حين تصبح هذه الإحصاءات قديمة، تخطئ الخطط بطرق مفاجئة، وهذا سؤال آخر تطرحه على صاحب قاعدة البيانات بشأن query تباطأ «بلا سبب».

بعض الشروط لا تستطيع استخدام index عادي مهما كتبتها. `name LIKE '%mat%'` يضطر إلى النظر داخل كل قيمة، لأن القائمة المرتّبة لا تساعدك في إيجاد نص في منتصف الكلمات. إذا كان بحث كهذا متكرّرًا، فالحل أداة مختلفة، مثل البحث النصي الكامل (full-text search)، لا index إضافي.

## متى تطلب index جديدًا

كثيرًا ما لا يملك المحلّلون المخطط، لكنك ستكون من يلاحظ الـ query البطيء. يصفّي فريق الدعم التذاكر حسب `opened_at` باستمرار، ولا يوجد index على هذا العمود، فتكون خطة هذه الـ queries مسحًا (SCAN). والطلب الذي سترفعه إلى صاحب قاعدة البيانات سيكون:

```sql
CREATE INDEX idx_tickets_opened_at ON support_tickets (opened_at);
```

الـ indexes ليست مجانية. كلٌّ منها يأخذ مساحة تخزين ويجب تحديثه مع كل إدراج وتحديث وحذف، فالجدول الذي عليه عشرة indexes يكتب أبطأ بشكل ملحوظ. اطلب indexes على أعمدة تصفّي عليها queries متكرّرة أو تربط بها أو ترتّب حسبها، وتضيّق النتيجة كثيرًا. الـ index على `status`، الذي له خمس قيم فقط، نادرًا ما يساعد؛ أما الـ index على تاريخ أو معرّف فيساعد عادةً. وفي الـ index متعدّد الأعمدة، ضع أولًا العمود الذي تختبره بـ `=` ثم عمود النطاق: `(customer_id, order_date)` يخدم «طلبات العميل 42 في 2025» ببحث واحد.

:::tip الفكرة نفسها في PostgreSQL
يعرض `EXPLAIN` في PostgreSQL شجرة فيها تكاليف وأعداد صفوف تقديرية ("Seq Scan" هو المسح الكامل لديه، و"Index Scan" هو البحث)، أما `EXPLAIN ANALYZE` فيشغّل الـ query فعلًا ويضيف الأزمنة الحقيقية. وقواعد الشروط الـ sargable والـ indexes على مفاتيح الربط تنتقل كما هي دون تغيير.
:::

الـ queries السريعة لا تنفع إلا إذا استطاع الناس قراءتها. في الدرس التالي: عادات الأسلوب وفروق اللهجات التي تجعل SQL الذي تكتبه قابلًا للمراجعة والنقل.
