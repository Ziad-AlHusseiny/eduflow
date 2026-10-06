---
summary: تعرّف على اللحظة التي يضاعف فيها الـ JOIN الصفوف، واشرح لماذا تتضخّم المجاميع على الجانب المتكرّر، وأصلح ذلك بتجميع كل جدول إلى مستوى التفصيل الصحيح قبل الربط.
takeaways:
  - ربط علاقة واحد-إلى-متعدد يعطي النتيجة مستوى تفصيل جانب «المتعدد»، ويكرّر كل عمود من جانب «الواحد».
  - جمع عمود من الجانب المتكرّر، مثل رسوم شحن الطلب بعد ربطه بالعناصر، يحسبه مرة لكل صف مطابق.
  - جمّع جانب «المتعدد» أولًا إلى مستوى تفصيل جانب «الواحد» داخل subquery، ثم اربط، حتى يُحسب كل رقم مرة واحدة بالضبط.
  - قد ينقذ COUNT(DISTINCT key) عدًّا ما، لكن SUM(DISTINCT value) ليس إصلاحًا أبدًا لأنه يدمج أيضًا صفوفًا مختلفة تتشارك القيمة نفسها.
  - طابِق كل مجموع بعد الـ JOIN مع المجموع نفسه محسوبًا من جدوله وحده.
further:
  - title: SQLite SELECT, subqueries in the FROM clause
    url: https://www.sqlite.org/lang_select.html#fromclause
  - title: PostgreSQL table expressions and subqueries in FROM
    url: https://www.postgresql.org/docs/current/queries-table-expressions.html
quiz:
  - q: رسوم شحن الطلب 1001 هي 7.99 وفيه أربعة سطور عناصر. بعد ربط `orders` بـ `order_items`، كم يساهم `SUM(o.shipping_fee)` من هذا الطلب؟
    options:
      - text: "7.99"
        why: هذه هي الرسوم الحقيقية، لكن الـ JOIN أنتج أربعة صفوف لهذا الطلب، يحمل كلٌّ منها 7.99.
      - text: "31.96"
        why: صحيح. أعمدة الطلب تتكرّر في كل صف من صفوف عناصره الأربعة، فتُجمع الرسوم أربع مرات.
      - text: "1.99، أي الرسوم مقسومة على العناصر"
        why: الـ JOIN لا يقسم القيم أبدًا؛ إنه ينسخ أعمدة جانب «الواحد» إلى كل صف مطابق.
    answer: 1
  - q: يصلح زميلك مجموع شحن متضخّمًا بكتابة `SUM(DISTINCT o.shipping_fee)`. ما الخطأ في ذلك؟
    options:
      - text: لا شيء؛ DISTINCT يزيل التكرارات التي صنعها الـ JOIN.
        why: DISTINCT يزيل القيم المكرّرة لا الطلبات المكرّرة. 372 طلبًا مختلفًا تتشارك رسومًا قدرها 4.99، فتنضغط كلها في قيمة واحدة.
      - text: SUM(DISTINCT) ليست صياغة SQL صحيحة.
        why: إنها صحيحة في SQLite وPostgreSQL، وهذا ما يجعلها خطأً صامتًا ومغريًا.
      - text: يجمع كل مبلغ رسوم مختلف مرة واحدة، فيقترب المجموع من مجموع بضعة مستويات للرسوم.
        why: صحيح. على بيانات Cartwheel يعيد 22.97 لكل قناة، وهو مجموع مستويات الرسوم المختلفة، بدل الأرقام الحقيقية التي تتراوح بين 678 و3,413.
      - text: إنه صحيح لكنه أبطأ من طريقة الـ subquery.
        why: ليس صحيحًا. السرعة لا تهم حين يكون الرقم خاطئًا.
    answer: 2
  - q: تحتاج إلى إيراد العناصر وعدد التذاكر لكل طلب. في `order_items` و`support_tickets` كليهما صفوف كثيرة لكل طلب. ما الطريقة الأكثر أمانًا؟
    options:
      - text: اربط الطلبات بالجدولين في عبارة FROM واحدة واستخدم SUM وCOUNT.
        why: عمليتا ربط واحد-إلى-متعدد مستقلتان تتضاعفان معًا. فيُحسب الإيراد مرة لكل تذكرة، وتُحسب التذاكر مرة لكل عنصر.
      - text: استخدم COUNT(DISTINCT t.ticket_id) وSUM(DISTINCT revenue).
        why: العدد سينجو، لكن SUM(DISTINCT) يدمج سطورًا مختلفة صادف أن تساوى إيرادها.
      - text: استخدم LEFT JOIN بدل INNER JOIN للجدولين.
        why: نوع الـ JOIN يتحكّم في الصفوف التي تبقى، لا في عدد مرات تكرارها؛ الـ fan-out يحدث مع النوعين.
      - text: جمّع العناصر لكل طلب والتذاكر لكل طلب في subqueryين، ثم اربط الاثنين بالطلبات.
        why: صحيح. كل subquery يعيد صفًا واحدًا لكل طلب، فتكون عمليات الربط النهائية واحد-إلى-واحد ولا يتكرّر شيء.
    answer: 3
---

يرسل كريم من المالية سؤالًا سريعًا: «في 2025، حسب القناة، كم جمعنا من رسوم الشحن، وكم من إيراد العناصر؟». أنت تعرف الـ JOIN المطلوب. وهذا هو الـ query الذي يكتبه معظم الناس أولًا:

```sql run
SELECT
  o.channel,
  ROUND(SUM(o.shipping_fee), 2) AS shipping,
  ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2) AS item_revenue
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.order_id
WHERE o.status <> 'cancelled'
  AND o.order_date >= '2025-01-01'
  AND o.order_date <  '2026-01-01'
GROUP BY o.channel;
```

إيراد العناصر صحيح. أما الشحن فيقارب ضعف ما يجب: يعرض الويب 6,732 بينما الرقم الحقيقي 3,413. لم يظهر أي خطأ، ولا شيء يبدو سخيفًا من النظرة الأولى. هذا هو **الـ fan-out** (تضاعف الصفوف)، أغلى خطأ في التحليل ثمنًا، لأنه ينتج أرقامًا قابلة للتصديق.

## من أين يأتي المال الإضافي

بين `orders` و`order_items` علاقة واحد-إلى-متعدد: طلب واحد، وسطر واحد أو أكثر. حين تربطهما، يكون في النتيجة صف لكل *سطر*، ويحمل كل سطر نسخة من أعمدة طلبه، بما فيها `shipping_fee`.

:::figure ربط طلب واحد بأربعة عناصر يكرّر رسومه أربع مرات
<svg viewBox="0 0 720 230" role="img" aria-labelledby="t1">
  <title id="t1">الطلب 1001 برسوم شحن 7.99 يرتبط بأربعة سطور عناصر. في النتيجة بعد الربط أربعة صفوف، يعرض كلٌّ منها 7.99، فيعطي جمع الرسوم 31.96 بدل 7.99.</title>
  <text class="d-label-strong" x="110" y="28" text-anchor="middle">orders (واحد)</text>
  <rect class="d-box-primary" x="30" y="90" width="160" height="44" rx="8"/>
  <text class="d-code" x="110" y="117" text-anchor="middle">1001  fee 7.99</text>
  <text class="d-label-strong" x="350" y="28" text-anchor="middle">order_items (متعدد)</text>
  <rect class="d-box" x="280" y="40" width="140" height="32" rx="6"/>
  <text class="d-code" x="350" y="61" text-anchor="middle">line 2</text>
  <rect class="d-box" x="280" y="80" width="140" height="32" rx="6"/>
  <text class="d-code" x="350" y="101" text-anchor="middle">line 3</text>
  <rect class="d-box" x="280" y="120" width="140" height="32" rx="6"/>
  <text class="d-code" x="350" y="141" text-anchor="middle">line 4</text>
  <rect class="d-box" x="280" y="160" width="140" height="32" rx="6"/>
  <text class="d-code" x="350" y="181" text-anchor="middle">line 5</text>
  <path class="d-line" d="M190 112 L280 56"/>
  <path class="d-line" d="M190 112 L280 96"/>
  <path class="d-line" d="M190 112 L280 136"/>
  <path class="d-line" d="M190 112 L280 176"/>
  <text class="d-label-strong" x="590" y="28" text-anchor="middle">الصفوف بعد الربط</text>
  <rect class="d-box-warn" x="500" y="40" width="180" height="32" rx="6"/>
  <text class="d-code" x="590" y="61" text-anchor="middle">1001 7.99 line 2</text>
  <rect class="d-box-warn" x="500" y="80" width="180" height="32" rx="6"/>
  <text class="d-code" x="590" y="101" text-anchor="middle">1001 7.99 line 3</text>
  <rect class="d-box-warn" x="500" y="120" width="180" height="32" rx="6"/>
  <text class="d-code" x="590" y="141" text-anchor="middle">1001 7.99 line 4</text>
  <rect class="d-box-warn" x="500" y="160" width="180" height="32" rx="6"/>
  <text class="d-code" x="590" y="181" text-anchor="middle">1001 7.99 line 5</text>
  <text class="d-label" x="590" y="220" text-anchor="middle">SUM(fee) = 31.96</text>
  <path class="d-arrow" d="M425 116 L495 116" marker-end="url(#arrow)"/>
</svg>
:::

نجا إيراد العناصر لأنه يقع في جانب «المتعدد»: إيراد كل سطر يظهر مرة واحدة بالضبط. أما الشحن فيقع في جانب «الواحد»، فيُحسب مرة لكل سطر. متوسط عدد السطور في طلبات Cartwheel هو 1.93، ولهذا تضاعف الشحن تقريبًا.

القاعدة العامة: **الـ JOIN يغيّر مستوى التفصيل إلى مستوى تفصيل أكثر جداوله تفصيلًا، وأي رقم مخزّن بمستوى تفصيل أخشن يتكرّر.**

## الإصلاح: جمّع أولًا، ثم اربط

أوصل كل جدول إلى مستوى تفصيل الإجابة *قبل* الربط. هنا، اضغط `order_items` في صف واحد لكل طلب داخل subquery، ثم اربط النتيجة بـ `orders`. الآن في الجانبين صف واحد لكل طلب، ولا يتكرّر شيء:

```sql run
SELECT
  o.channel,
  COUNT(*) AS orders,
  ROUND(SUM(o.shipping_fee), 2) AS shipping,
  ROUND(SUM(i.revenue), 2) AS item_revenue
FROM orders AS o
JOIN (
  SELECT order_id, SUM(quantity * unit_price * (1 - discount)) AS revenue
  FROM order_items
  GROUP BY order_id
) AS i ON i.order_id = o.order_id
WHERE o.status <> 'cancelled'
  AND o.order_date >= '2025-01-01'
  AND o.order_date <  '2026-01-01'
GROUP BY o.channel;
```

الـ subquery داخل `FROM` (ويُسمّى *جدولًا مشتقًّا*) يتصرّف كجدول مؤقت بمستوى التفصيل الذي اخترته، وهو هنا صف واحد لكل `order_id`. الشحن الآن يطابق query على `orders` وحده، وإيراد العناصر لم يتغيّر، و`COUNT(*)` يعدّ الطلبات، لأن الصفوف عادت طلبات. سيعرض القسم التالي طريقة أرتب لكتابة الشيء نفسه باستخدام `WITH`.

:::mistake SUM(DISTINCT) كإصلاح للـ fan-out
`COUNT(DISTINCT o.order_id)` طريقة مشروعة لعدّ الطلبات بعد fan-out، لأن معرّفات الطلبات فريدة. أما `SUM(DISTINCT o.shipping_fee)` فليس كذلك: إنه يجمع كل *مبلغ* مختلف مرة واحدة. مئات الطلبات تتشارك الرسوم نفسها 4.99، فيعيد على بيانات Cartwheel القيمة 22.97 لكل قناة، وهي مجموع بضعة مستويات للرسوم. DISTINCT يزيل تكرار القيم، لا تكرار الصفوف أبدًا.
:::

## تضاعفان في آن واحد

الـ fan-out يتراكم. تسأل جوليا كم إيرادًا جاء من طلبات احتاجت إلى تذكرة دعم. اربط العناصر والتذاكر بالطلبات نفسها، فيتكرّر كل سطر مرة لكل تذكرة على طلبه؛ و110 طلبات لديها أكثر من تذكرة واحدة. المجموع الساذج يقول 166,562. أما الإجابة الصحيحة، التي تسأل هل *توجد* تذكرة بدل ربط كل تذكرة، فهي 140,675:

```sql run
SELECT ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS revenue_with_tickets
FROM order_items
WHERE order_id IN (SELECT order_id FROM support_tickets);
```

`IN (subquery)` يصفّي دون ربط، فلا يمكن أن يضاعف الصفوف أبدًا. هذا النمط، «هل يوجد تطابق؟»، ويُسمّى semi-join، يحظى بشرح كامل في الدرس التالي مع نقيضه.

## اكتشاف الـ fan-out قبل أن يصيبك

لا داعي لأن تنتظر مجموعًا خاطئًا. قبل الربط، اسأل عن كل مفتاح ربط: هل هو فريد في هذا الجانب؟ `order_id` فريد في `orders` (فهو المفتاح الأساسي) لكنه ليس فريدًا في `order_items` ولا في `support_tickets`، فربط أيٍّ منهما بـ `orders` يضاعف صفوف الطلبات. فحص سريع يخبرك بذلك:

```sql run
SELECT
  COUNT(*)                 AS rows_after_join,
  COUNT(DISTINCT order_id) AS distinct_orders
FROM order_items;
```

3,991 صفًا مقابل 2,066 طلبًا: معامل تضاعف يقارب الاثنين. حين يختلف هذان الرقمان، فأي عمود تجمعه من جانب «الواحد» يحتاج إلى تجميع مسبق أو إلى إبعاده عن الـ JOIN. وحين يتساويان، يكون الـ JOIN واحد-إلى-واحد وآمنًا للجمع من أي جانب.

## عادة المطابقة

في كل مرة تربط فيها جداول، طابِق مجموعًا واحدًا على الأقل مع نسخة من جدول واحد. الشحن حسب القناة من الـ query المربوط يجب أن يساوي الشحن حسب القناة من `orders` وحده؛ وإيراد العناصر يجب أن يساوي المجموع على `order_items` للطلبات نفسها. إذا تطابقا، فالـ JOIN لم يضاعف شيئًا. وإذا لم يتطابقا، فقد أمسكت بالخطأ قبل أن يصل إلى عرض كريم أمام مجلس الإدارة.

:::tip سمِّ مستوى التفصيل في تعليق
ابدأ الـ queries المجمَّعة بتعليق مثل `-- grain: one row per channel`، وضع `-- grain: one row per order` فوق كل جدول مشتق. يستغرق ذلك خمس ثوانٍ، ويجعل الـ fan-out مرئيًا لك ولكل من يراجع الـ query.
:::

في الدرس التالي ستربط الجدول بنفسه، وتبحث عن صفوف *لا* تطابق لها على الإطلاق.
