---
summary: اضغط الصفوف في صف واحد لكل مجموعة بـ GROUP BY، وصفِّ المجموعات بـ HAVING، وعُدّ بشروط باستخدام FILTER، وحدّد مستوى تفصيل كل نتيجة قبل أن تثق بها.
takeaways:
  - مستوى التفصيل (grain) في النتيجة هو ما يمثّله الصف الواحد؛ قُله بصوت عالٍ قبل كتابة GROUP BY، وتحقّق منه بعدها.
  - كل عمود في قائمة SELECT يجب أن يكون إمّا في GROUP BY أو داخل دالة تجميع؛ يسمح SQLite بالأعمدة المجرّدة لكنه يملؤها من صف اعتباطي.
  - يصفّي WHERE الصفوف قبل التجميع، ويصفّي HAVING المجموعات بعده، لذا تنتمي الشروط على SUM أو COUNT إلى HAVING.
  - COUNT(*) FILTER (WHERE ...) أو SUM(CASE WHEN ... THEN 1 ELSE 0 END) يعدّ جزءًا من الصفوف داخل كل مجموعة دون query ثانٍ.
further:
  - title: SQLite aggregate functions
    url: https://www.sqlite.org/lang_aggfunc.html
  - title: SQLite SELECT processing, including bare columns
    url: https://www.sqlite.org/lang_select.html#resultset
  - title: PostgreSQL aggregate expressions and FILTER
    url: https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES
quiz:
  - q: تحتاج إلى الدول التي يزيد عدد طلباتها في 2025 على 50. أين يذهب كل شرط؟
    options:
      - text: شرط السنة و`COUNT(*) > 50` كلاهما في WHERE.
        why: يعمل WHERE قبل التجميع، حين لا يكون هناك عدد بعد، فوضع دالة تجميع فيه خطأ.
      - text: كلاهما في HAVING.
        why: يرفض PostgreSQL وجود `order_date` غير المجمَّع في HAVING، أما SQLite فيختبر تاريخ صف اعتباطي واحد من كل مجموعة، فتخرج الأعداد خاطئة بصمت. شرط السنة شرط على الصفوف ومكانه WHERE.
      - text: شرط السنة في HAVING، و`COUNT(*) > 50` في WHERE.
        why: هذا معكوس. WHERE لا يرى دوال التجميع أصلًا.
      - text: شرط السنة في WHERE، و`COUNT(*) > 50` في HAVING.
        why: صحيح. صفِّ الصفوف أولًا (طلبات 2025 فقط)، ثم صفِّ المجموعات حسب قيمة التجميع.
    answer: 3
  - q: |
      ما مستوى التفصيل في هذه النتيجة؟
      ```sql
      SELECT customer_id, strftime('%Y-%m', order_date) AS month, COUNT(*)
      FROM orders
      GROUP BY customer_id, month;
      ```
    options:
      - text: صف واحد لكل عميل.
        why: الشهر أيضًا مفتاح تجميع، فالعميل الذي طلب في ثلاثة أشهر يحصل على ثلاثة صفوف.
      - text: صف واحد لكل طلب.
        why: التجميع يضغط الطلبات؛ عدة طلبات للعميل نفسه في شهر واحد تصبح صفًا واحدًا.
      - text: صف واحد لكل شهر.
        why: لكل شهر صف لكل عميل طلب فيه، لا صف واحد.
      - text: صف واحد لكل عميل في كل شهر طلب فيه.
        why: صحيح. مستوى التفصيل هو تركيبة مفاتيح GROUP BY، والأشهر التي لا طلبات فيها لا تظهر إطلاقًا.
    answer: 3
  - q: "في SQLite يعمل `SELECT channel, status, COUNT(*) FROM orders GROUP BY channel` دون خطأ. ماذا يعرض العمود `status`؟"
    options:
      - text: حالة صفٍّ ما من كل مجموعة قناة، وهي لا تخبرك بشيء عن المجموعة.
        why: صحيح. يسمح SQLite بهذا «العمود المجرّد» ويملؤه من صف اعتباطي. أما PostgreSQL فيرفض الـ query.
      - text: الحالة الأكثر تكرارًا في كل قناة.
        why: لا يوجد حساب للمنوال هنا؛ يأخذ SQLite قيمة من صف واحد في المجموعة.
      - text: قائمة مفصولة بفواصل لكل الحالات.
        why: هذا ما يفعله `GROUP_CONCAT(status)` (أو `string_agg`)؛ العمود المجرّد قيمة واحدة.
    answer: 0
  - q: أي تعبير يعطي نسبة الطلبات الملغاة من طلبات كل شهر، كنسبة مئوية؟
    options:
      - text: "`COUNT(status = 'cancelled') * 100.0 / COUNT(*)`"
        why: COUNT يعدّ القيم غير الـ NULL، و`status = 'cancelled'` قيمته 0 أو 1 وليست NULL أبدًا، فيعدّ كل الصفوف ويعيد 100.
      - text: "`100.0 * COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*)`"
        why: صحيح. يقصر FILTER دالة التجميع تلك على الصفوف الملغاة؛ و100.0 يتجنّب القسمة الصحيحة.
      - text: "`COUNT(*) / COUNT(*) FILTER (WHERE status = 'cancelled')`"
        why: هذه هي النسبة المعكوسة، ومع القسمة الصحيحة في SQLite ستُقتطع أيضًا.
    answer: 1
---

يعود مارك من العمليات بالسؤال الذي لم تستطع الإجابة عنه في الدرس الماضي: «ما متوسط وقت الحل لدينا، حسب الأولوية؟». تعرف كيف تحسب ساعات تذكرة واحدة. أما الآن فتحتاج إلى *صف واحد لكل أولوية*، يلخّص كلٌّ منها عشرات التذاكر. هذا ما يفعله `GROUP BY`، والفكرة التي تحته، أي مستوى تفصيل النتيجة، هي أنفع مفهوم منفرد في SQL التحليلي.

## صف واحد لكل ماذا؟

لكل جدول ولكل نتيجة **مستوى تفصيل** (grain): الشيء الذي يمثّله الصف الواحد. في `support_tickets` صف واحد لكل تذكرة. ومارك يريد صفًا واحدًا لكل أولوية. اكتب ذلك أولًا، ثم اجعل الـ query يطابقه:

```sql run
SELECT
  priority,
  COUNT(*)                AS tickets,
  COUNT(closed_at)        AS closed,
  ROUND(AVG((julianday(closed_at) - julianday(opened_at)) * 24), 1) AS avg_hours,
  ROUND(MAX((julianday(closed_at) - julianday(opened_at)) * 24), 1) AS max_hours
FROM support_tickets
GROUP BY priority
ORDER BY avg_hours;
```

أربعة صفوف، صف لكل أولوية، وهذا يطابق مستوى التفصيل الذي حدّدته. التذاكر العاجلة تُغلق في 6.5 ساعات في المتوسط، والمرتفعة في يوم واحد أو نحوه، والمنخفضة والعادية في أكثر من ثلاثة أيام. لاحظ كيف يتخطّى `COUNT(closed_at)` و`AVG` التذاكر المفتوحة بصمت، كما وعدت الدروس السابقة تمامًا. والعمود `max_hours` مهم أيضًا: قد يبدو المتوسط جيدًا بينما انتظر عميل واحد أسبوعًا كاملًا.

:::figure الترتيب المنطقي الذي يقيّم به SQL الـ query
<svg viewBox="0 0 720 150" role="img" aria-labelledby="t1">
  <title id="t1">ترتيب التقييم المنطقي: FROM، ثم يصفّي WHERE الصفوف، ويكوّن GROUP BY المجموعات، ويصفّي HAVING المجموعات، ويحسب SELECT أعمدة النتيجة، ويرتّب ORDER BY، ويقصّ LIMIT.</title>
  <rect class="d-box" x="10" y="40" width="86" height="44" rx="8"/>
  <text class="d-code" x="53" y="67" text-anchor="middle">FROM</text>
  <rect class="d-box-accent" x="111" y="40" width="86" height="44" rx="8"/>
  <text class="d-code" x="154" y="67" text-anchor="middle">WHERE</text>
  <rect class="d-box-primary" x="212" y="40" width="100" height="44" rx="8"/>
  <text class="d-code" x="262" y="67" text-anchor="middle">GROUP BY</text>
  <rect class="d-box-accent" x="327" y="40" width="86" height="44" rx="8"/>
  <text class="d-code" x="370" y="67" text-anchor="middle">HAVING</text>
  <rect class="d-box" x="428" y="40" width="86" height="44" rx="8"/>
  <text class="d-code" x="471" y="67" text-anchor="middle">SELECT</text>
  <rect class="d-box" x="529" y="40" width="100" height="44" rx="8"/>
  <text class="d-code" x="579" y="67" text-anchor="middle">ORDER BY</text>
  <rect class="d-box" x="644" y="40" width="66" height="44" rx="8"/>
  <text class="d-code" x="677" y="67" text-anchor="middle">LIMIT</text>
  <text class="d-label-muted" x="154" y="110" text-anchor="middle">يصفّي الصفوف</text>
  <text class="d-label-muted" x="262" y="110" text-anchor="middle">يكوّن المجموعات</text>
  <text class="d-label-muted" x="370" y="110" text-anchor="middle">يصفّي المجموعات</text>
  <text class="d-label-muted" x="471" y="110" text-anchor="middle">يحسب</text>
  <path class="d-arrow" d="M30 130 L690 130" marker-end="url(#arrow)"/>
</svg>
:::

يشرح هذا المخطط معظم أخطاء GROUP BY. يعمل `WHERE` قبل أن توجد المجموعات، فلا يستطيع أن يختبر `COUNT(*)`؛ هذه مهمة `HAVING`. ويعمل `ORDER BY` بعد SELECT، فيستطيع دائمًا استخدام الاسم المستعار لعمود. يقبل SQLite وPostgreSQL أيضًا الاسم المستعار في `GROUP BY` من باب التسهيل، ولهذا يعمل `GROUP BY month` أدناه، لكن الترتيب المنطقي يبقى كما في المخطط.

## WHERE مقابل HAVING

يريد كريم من المالية أن يعرف أي المنتجات باعت 100 وحدة على الأقل بسعرها الكامل، دون أي خصم. عدد الوحدات لكل منتج قيمة تجميعية، فيذهب الحدّ إلى `HAVING`. أما «دون خصم» فصفة لكل سطر طلب على حدة، أي أنه شرط على الصفوف ومكانه `WHERE`:

```sql run
SELECT
  product_id,
  SUM(quantity) AS units,
  COUNT(DISTINCT order_id) AS orders
FROM order_items
WHERE discount = 0
GROUP BY product_id
HAVING SUM(quantity) >= 100
ORDER BY units DESC
LIMIT 5;
```

اقرأه بترتيب المخطط: أسقِط السطور المخفّضة، وجمّع الباقي حسب المنتج، وأبقِ المنتجات التي لها 100 وحدة أو أكثر، ثم احسب ورتّب واقصّ. يعدّ `COUNT(DISTINCT order_id)` الطلبات لا السطور، لأن كل منتج في بيانات Cartwheel يظهر مرة واحدة على الأكثر في كل طلب، فلا يختلف عدد السطور عن عدد الطلبات إلا حين تعدّ عبر منتجات مختلفة.

:::mistake الأعمدة المجرّدة في SQLite
كل عمود في SELECT يجب أن يكون في `GROUP BY` أو داخل دالة تجميع. يفرض PostgreSQL هذه القاعدة، أما SQLite فلا. يعمل `SELECT channel, status, COUNT(*) FROM orders GROUP BY channel` ويعرض "delivered" لكل قناة، لأن SQLite ملأ `status` من صف اعتباطي في كل مجموعة. والأسوأ أن نسيان `GROUP BY` كليًا يضغط الجدول في **صف واحد** فيه رقم منتج اعتباطي بجانب المجموع الكلي. إذا جاءت النتيجة بصفوف أقل مما توقّعت، فافحص الـ GROUP BY أولًا.
:::

## عدّ جزء من الصفوف داخل كل مجموعة

تسأل هدى من التسويق عن نسبة طلبات كل شهر التي جاءت عبر تطبيق الجوال. تحتاج إلى عددين لكل شهر: كل الطلبات، وطلبات التطبيق. عبارة `FILTER` تقصر دالة تجميع واحدة على بعض الصفوف:

```sql run
SELECT
  strftime('%Y-%m', order_date) AS month,
  COUNT(*) AS orders,
  COUNT(*) FILTER (WHERE channel = 'mobile_app') AS app_orders,
  ROUND(100.0 * COUNT(*) FILTER (WHERE channel = 'mobile_app') / COUNT(*), 1) AS app_pct
FROM orders
WHERE order_date >= '2025-07-01'
  AND order_date <  '2026-01-01'
GROUP BY month
ORDER BY month;
```

تتراوح حصة التطبيق بين 28% و40% على وجه التقريب، وحجم نوفمبر يزيد على ثلاثة أضعاف حجم يوليو بفضل Black Friday. هناك تفصيلان مهمّان. استخدام `100.0` بدل `100` يفرض القسمة العشرية؛ فـ SQLite يقسم الأعداد الصحيحة قسمة صحيحة، و`47 / 129` تساوي 0. و`FILTER` جزء من SQL القياسي، ويدعمه SQLite وPostgreSQL. في المحرّكات التي لا تدعمه، اكتب `SUM(CASE WHEN channel = 'mobile_app' THEN 1 ELSE 0 END)`، وهو العدد نفسه بصيغة أطول.

## التحقق من مستوى التفصيل

حين يعمل query مجمَّع، تحقّق منه قبل أن تُبلغ به:

1. **عدد الصفوف**: هل يطابق عدد المجموعات الذي تتوقعه (4 أولويات، 6 أشهر)؟
2. **التفرّد**: هل مفتاح GROUP BY فريد في النتيجة؟ هو كذلك بحكم البناء، إلا إذا كان عمود مجرّد يخفي شيئًا.
3. **المجاميع**: هل مجموع عمود عبر المجموعات يساوي المجموع غير المجمَّع؟ في التذاكر، الأعداد الأربعة مجموعها 873.

لا يستغرق أيٌّ من هذه الفحوص أكثر من دقيقة، ومعًا تلتقط أغلب أخطاء التجميع قبل أن يلتقطها أصحاب الطلب. اجعلها جزءًا من الحلقة التي بدأتها في الدرس الأول، بين «اكتب الـ query» و«أجب». ويصبح الفحص الثالث حيويًا في الدروس القادمة، حين تبدأ بربط الجداول. فالـ JOIN قد يغيّر مستوى التفصيل دون أن يخبرك، والجمع على مستوى تفصيل خاطئ هو بداية الحساب المزدوج.
