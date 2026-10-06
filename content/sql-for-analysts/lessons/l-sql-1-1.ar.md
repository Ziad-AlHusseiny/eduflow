---
kind: intro
summary: تعرّف على قاعدة بيانات Cartwheel، وحوّل طلبًا غامضًا إلى سؤال دقيق، ثم أجب عنه بـ SELECT والأعمدة المحسوبة وORDER BY وLIMIT.
takeaways:
  - يبدأ الـ query عند المحلّل بسؤال دقيق، يشمل ما يمثّله الصف الواحد في الإجابة.
  - استكشف أي قاعدة بيانات جديدة عليك من خلال جداولها وأعمدتها قبل أن تكتب الـ query الحقيقي.
  - الأعمدة المحسوبة التي تحمل أسماء بـ AS تجعل النتيجة مقروءة دون أن تغيّر البيانات المخزّنة.
  - ORDER BY هو ما يحدّد الصفوف التي يُبقيها LIMIT، لذا فإن LIMIT بلا ORDER BY يعيد عيّنة اعتباطية لا يمكن الاعتماد عليها.
further:
  - title: SQLite SELECT statement
    url: https://www.sqlite.org/lang_select.html
  - title: The sqlite_schema table
    url: https://www.sqlite.org/schematab.html
quiz:
  - q: تطلب رانيا «أفضل منتجاتنا». ماذا تفعل قبل أن تكتب أي SQL؟
    options:
      - text: تحدّد بدقة ما تعنيه «أفضل» (الإيراد، أو عدد الوحدات، أو هامش الربح) وعن أي فترة.
        why: صحيح. لكلمة «أفضل» ثلاثة معانٍ مقبولة على الأقل، وكل معنى يعطي قائمة مختلفة. الاتفاق على المقياس أولًا يوفّر عليك إعادة الكتابة.
      - text: تكتب `SELECT * FROM products` وترسل إليها الجدول كاملًا.
        why: 48 صفًا من الأعمدة الخام لا تجيب عن سؤال؛ إنها تعيد التحليل إلى من طلبه.
      - text: ترتّب المنتجات حسب `unit_price`، لأن المنتجات الغالية هي الأفضل.
        why: السعر ليس أداءً. مكتب بسعر 449 دولارًا يُباع مرتين في السنة قد يكون أقل أهمية من كوب بسعر 24 دولارًا يُباع كل يوم.
    answer: 0
  - q: |
      ماذا يعيد هذا الـ query؟
      ```sql
      SELECT name, unit_price
      FROM products
      LIMIT 3;
      ```
    options:
      - text: أغلى ثلاثة منتجات.
        why: لا شيء في الـ query يرتّب حسب السعر. LIMIT يقصّ النتيجة فقط، ولا يختار الصفوف «الأعلى» من تلقاء نفسه.
      - text: أرخص ثلاثة منتجات.
        why: لا يوجد ORDER BY، فلا معنى لـ«الأرخص» هنا أيضًا.
      - text: ثلاثة صفوف بأي ترتيب يقرؤها به SQLite، ولا يصحّ أن تعتمد عليه.
        why: صحيح. بدون ORDER BY يصبح ترتيب الصفوف تفصيلًا داخليًا في التنفيذ. اليوم هو ترتيب الإدخال، وبعد تغيير في الـ index قد لا يكون كذلك.
    answer: 2
  - q: تكتب `unit_price - unit_cost AS margin` في قائمة SELECT. ماذا يحدث لجدول `products`؟
    options:
      - text: يُضاف عمود `margin` جديد إلى الجدول بشكل دائم.
        why: SELECT لا يغيّر البيانات المخزّنة أبدًا. إضافة عمود تحتاج إلى ALTER TABLE.
      - text: لا شيء؛ العمود `margin` موجود في نتيجة هذا الـ query فقط.
        why: صحيح. العمود المحسوب يُحسب لكل صف في النتيجة ويختفي حين ينتهي الـ query.
      - text: يفشل الـ query لأن `margin` ليس عمودًا حقيقيًا.
        why: التعبيرات التي تحمل اسمًا مستعارًا هي بالضبط الطريقة التي تُنشئ بها أعمدة غير موجودة في الجدول.
    answer: 1
---

في أسبوعك الأول في Cartwheel تصلك رسالة من رانيا عزيز، المديرة التنفيذية: «أيّ منتجاتنا غالية لكن ربحها ضئيل؟ أريد مراجعة الأسعار قبل كتالوج الربيع». يبدو الأمر بسيطًا، وهو في الوقت نفسه مثال مثالي على طبيعة العمل: شخص أمامه قرار حقيقي يطرح سؤالًا بكلمات عادية، وأنت تحوّله إلى query يجيب عن هذا السؤال بالضبط، لا أكثر ولا أقل.

Cartwheel متجر إلكتروني لمستلزمات المنزل والأنشطة الخارجية، يبيع في ثماني دول. تحتوي قاعدة بيانات SQLite الخاصة به على سنتين من السجلات، من يناير 2024 حتى ديسمبر 2025. كل query في هذه الدورة يعمل عليها، داخل متصفّحك.

## تعرّف على قاعدة البيانات

قبل أن تكتب الـ query الحقيقي، ألقِ نظرة حولك. يحتفظ SQLite بفهرس لجداوله في `sqlite_schema` (الكود القديم يسمّيه `sqlite_master`، وما زال يعمل):

```sql run
SELECT name
FROM sqlite_schema
WHERE type = 'table';
```

تسعة جداول. لترى أعمدة جدول واحد وأنواعها، اطلب قائمة أعمدته:

```sql run
SELECT name, type, "notnull"
FROM pragma_table_info('orders');
```

وهذه طريقة ارتباط الجداول ببعضها. يشير كل سهم من جدول إلى الجدول الذي يرجع إليه، والتسمية هي المفتاح المشترك بينهما.

:::figure مخطط Cartwheel: الطلبات تقع بين العملاء والمنتجات
<svg viewBox="0 0 720 300" role="img" aria-labelledby="t1">
  <title id="t1">العملاء يقدّمون الطلبات؛ الطلبات تحتوي على order_items؛ وorder_items ترجع إلى products، والمنتجات تنتمي إلى categories. المرتجعات returns ترجع إلى order_items. تذاكر الدعم support_tickets ترجع إلى customers وorders وemployees. وجلسات الموقع web_sessions ترجع إلى customers.</title>
  <rect class="d-box" x="20" y="30" width="150" height="50" rx="10"/>
  <text class="d-label" x="95" y="60" text-anchor="middle">web_sessions</text>
  <rect class="d-box" x="215" y="30" width="160" height="50" rx="10"/>
  <text class="d-label" x="295" y="60" text-anchor="middle">support_tickets</text>
  <rect class="d-box" x="420" y="30" width="140" height="50" rx="10"/>
  <text class="d-label" x="490" y="60" text-anchor="middle">employees</text>
  <rect class="d-box-primary" x="20" y="140" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="95" y="170" text-anchor="middle">customers</text>
  <rect class="d-box-primary" x="215" y="140" width="160" height="50" rx="10"/>
  <text class="d-label-strong" x="295" y="170" text-anchor="middle">orders</text>
  <rect class="d-box-primary" x="420" y="140" width="140" height="50" rx="10"/>
  <text class="d-label-strong" x="490" y="170" text-anchor="middle">order_items</text>
  <rect class="d-box-accent" x="595" y="140" width="110" height="50" rx="10"/>
  <text class="d-label" x="650" y="170" text-anchor="middle">products</text>
  <rect class="d-box-accent" x="595" y="235" width="110" height="50" rx="10"/>
  <text class="d-label" x="650" y="265" text-anchor="middle">categories</text>
  <rect class="d-box" x="420" y="235" width="140" height="50" rx="10"/>
  <text class="d-label" x="490" y="265" text-anchor="middle">returns</text>
  <path class="d-arrow" d="M215 165 L172 165" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 165 L377 165" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 165 L593 165" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M650 190 L650 233" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M490 235 L490 192" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M95 80 L95 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M260 80 L130 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M295 80 L295 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M375 55 L418 55" marker-end="url(#arrow)"/>
  <text class="d-code" x="193" y="210" text-anchor="middle">customer_id</text>
  <text class="d-code" x="398" y="210" text-anchor="middle">order_id</text>
  <text class="d-code" x="578" y="128" text-anchor="middle">product_id</text>
</svg>
:::

الجداول الثلاثة المميّزة هي العمود الفقري لمعظم الأسئلة: العميل يقدّم طلبًا، والطلب يضمّ عنصرًا واحدًا أو أكثر. المال موجود في `order_items` لا في `orders`: إيراد السطر هو `quantity * unit_price * (1 - discount)`.

## من الطلب إلى الـ query

في طلب رانيا كلمتان غامضتان. «غالية» قد تعني سعر القائمة. أما «ربحها ضئيل» فتحتاج إلى رقم: هامش الربح كنسبة مئوية من السعر، أي `(unit_price - unit_cost) / unit_price`، هو الطريقة المعتادة لمقارنة قمع تقطير قهوة بسعر 22 دولارًا بمكتب بسعر 449 دولارًا. اكتب الصيغة الدقيقة قبل أن تبدأ الكتابة: *صف واحد لكل منتج، يعرض السعر ونسبة الهامش، والهوامش الأضعف أولًا.*

```sql run
SELECT
  name,
  unit_price,
  unit_cost,
  ROUND((unit_price - unit_cost) / unit_price * 100, 1) AS margin_pct
FROM products
ORDER BY margin_pct
LIMIT 5;
```

ثلاث عادات تعمل هنا منذ الآن. العمود المحسوب يأخذ اسمًا مقروءًا بـ `AS`. ويستطيع `ORDER BY` أن يرتّب حسب هذا الاسم المستعار (alias). ويأتي `LIMIT 5` في النهاية ليقصّ القائمة بعد ترتيبها.

:::mistake LIMIT لا يعني «الأعلى»
`LIMIT 5` بدون `ORDER BY` يعطيك خمسة صفوف بأي ترتيب يصادف أن يقرأها به SQLite. كلما أردت «أعلى N» أو «أحدث N»، اكتب الـ `ORDER BY` الذي يحدّد معنى الأعلى أو الأحدث، ثم الـ `LIMIT`.
:::

## حلقة عمل المحلّل

كل طلب في هذه الدورة يمرّ بالحلقة نفسها، ويستحق أن تجعلها عادة من الآن:

1. **أعِد صياغة** السؤال بدقة، بما في ذلك ما يمثّله الصف الواحد في الإجابة.
2. **استكشف** الجداول والأعمدة التي تحتاجها.
3. **اكتب الـ query**، وابدأ صغيرًا ثم وسّعه.
4. **تحقّق من منطقية** النتيجة: عدد الصفوف، مجموع تعرفه مسبقًا، حالة طرفية.
5. **أجب** بجملة يستطيع غير المحلّل أن يتصرّف بناءً عليها.

بالنسبة إلى رانيا، قد تكون الخطوة 5 هكذا: «أضعف هوامشنا تقارب 40%، على Burr Coffee Grinder وCompact Writing Desk؛ ولا يوجد منتج معروض بأقل من تكلفته». جملة قصيرة ومحدّدة، وتقود إلى السؤال التالي.

في الدرس التالي ستضيف أكثر عبارة استخدامًا في التحليل، `WHERE`، وتتعلّم أين يتعثّر الناس في منطقها.
