---
summary: استخدم الـ scalar subqueries والجداول المشتقة والـ subqueries المترابطة حيث تناسب، وأعِد بناء الـ queries الطويلة في خطوات CTE مسمّاة، وتتبّع التسلسلات الهرمية بأي عمق بـ CTE تكراري.
takeaways:
  - الـ scalar subquery يعيد قيمة واحدة ويمكن وضعه في أي مكان تصلح فيه قيمة، مثل المقارنة بمتوسط عام.
  - الـ CTE (أي WITH name AS ...) يسمّي نتيجة وسيطة، فيُقرأ التحليل الطويل من الأعلى إلى الأسفل ويمكن فحص كل خطوة وحدها.
  - الـ CTE التكراري فيه query ارتكاز، ثم UNION ALL، ثم query تكراري يرتبط بالـ CTE نفسه؛ ويتوقف حين لا يضيف أي تكرار صفوفًا جديدة.
  - مرّر عدّادًا للعمق (ومسارًا إن كان مفيدًا) عبر التكرار، وضع حدًّا للعمق حين يُحتمل أن تحتوي البيانات على حلقة.
further:
  - title: SQLite WITH clause and recursive common table expressions
    url: https://www.sqlite.org/lang_with.html
  - title: PostgreSQL WITH queries
    url: https://www.postgresql.org/docs/current/queries-with.html
quiz:
  - q: "أيّها scalar subquery مستخدم بشكل صحيح؟"
    options:
      - text: "`WHERE revenue > (SELECT revenue FROM revenue_2025)`"
        why: هذا الـ subquery يعيد صفًا لكل عميل. يستخدم SQLite الصف الأول بصمت؛ ويرمي PostgreSQL خطأً. وفي الحالتين ليس هذا هو المتوسط.
      - text: "`FROM (SELECT AVG(revenue) FROM revenue_2025)` بلا اسم مستعار ولا ربط"
        why: هذا جدول مشتق لا scalar subquery، ولا يرتبط وحده بالعملاء الذين تصفّيهم.
      - text: "`WHERE customer_id = (SELECT customer_id FROM orders)`"
        why: كالخيار الأول، يعيد الـ subquery صفوفًا كثيرة حيث يُتوقّع قيمة واحدة.
      - text: "`WHERE revenue > (SELECT AVG(revenue) FROM revenue_2025)`"
        why: صحيح. دالة التجميع بلا GROUP BY تعيد صفًا واحدًا وعمودًا واحدًا بالضبط، فتحلّ محل قيمة واحدة.
    answer: 3
  - q: ما السبب الرئيسي الذي يدفع المحلّلين إلى إعادة بناء query متداخل في صورة CTEs؟
    options:
      - text: تأخذ كل خطوة اسمًا ويُقرأ الـ query من الأعلى إلى الأسفل، ويمكنك تشغيل أي خطوة وحدها لفحصها.
        why: صحيح. المنطق نفسه؛ ما يتحسّن هو المقروئية وقابلية الفحص.
      - text: الـ CTEs أسرع دائمًا من الـ subqueries.
        why: كثيرًا ما تدمج المحرّكات الـ CTEs وتخطّط لها كما تخطّط للـ subqueries، فيكون الأداء متشابهًا عادةً. اختر الـ CTEs من أجل الوضوح.
      - text: الـ subqueries لا يمكن أن تحتوي على دوال تجميع، أما الـ CTEs فيمكن.
        why: يمكن للـ subqueries أن تجمّع؛ وإصلاح الـ fan-out في القسم السابق فعل ذلك بالضبط.
    answer: 0
  - q: يبدأ CTE تكراري من المديرة التنفيذية ويربط `employees e ON e.manager_id = org.employee_id`. متى يتوقف؟
    options:
      - text: بعد عدد ثابت من التكرارات تحدّده قاعدة البيانات.
        why: لا يوجد عدد مدمج للتكرارات؛ التكرار الجامح يستمر حتى تنفد الموارد.
      - text: حين يصل إلى موظف قيمة `manager_id` لديه NULL.
        why: المديرة التنفيذية هي صف الارتكاز، حيث يبدأ التتبّع. يسير التتبّع نزولًا وينتهي عند أشخاص لا يتبع لهم أحد.
      - text: حين لا ينتج تكرارٌ أي صفوف جديدة، لأن المستوى الأخير لا يتبع له أحد.
        why: صحيح. كل تكرار لا يربط إلا الصفوف الناتجة عن التكرار السابق؛ وحين لا يتبع أحد لأي شخص في تلك المجموعة، ينتهي التكرار.
      - text: حين يُبلغ حدّ عبارة LIMIT.
        why: لا يوجد LIMIT في جسم الـ CTE هنا. يمكن لـ LIMIT أن يحدّ التكرار، لكن التوقف الطبيعي هو تكرار فارغ.
    answer: 2
  - q: لماذا تضيف شرطًا مثل `WHERE org.depth < 20` إلى query تكراري على `customers.referred_by`؟
    options:
      - text: الـ CTEs التكرارية تتطلب عبارة WHERE لتعمل.
        why: لا تتطلّبها؛ query الموظفين في هذا الدرس بلا WHERE. إنه شبكة أمان، لا جزء من الصياغة.
      - text: يجعل الـ query يستخدم index.
        why: حدود العمق لا تؤثّر في استخدام الـ index؛ إنها تحدّ عدد التكرارات فقط.
      - text: يرتّب النتيجة حسب العمق.
        why: الترتيب يحتاج إلى ORDER BY في الـ SELECT النهائي. WHERE يصفّي فقط.
      - text: إذا أنشأت بيانات سيئة حلقة إحالة يومًا ما (A أحال B، وB أحال A)، فلن ينتهي التكرار أبدًا بلا حدّ.
        why: صحيح. التسلسلات الهرمية التي يُدخلها أشخاص أو أنظمة قد تحتوي على حلقات، وحدّ العمق يحوّل الحلقة اللانهائية إلى query محدود.
    answer: 3
---

يطرح كريم سؤالًا يخفي في داخله سؤالًا ثانيًا: «أي العملاء أنفقوا أكثر من العميل المتوسط في 2025؟». للإجابة تحتاج إلى المتوسط أولًا، وهذا بدوره يحتاج إلى الإيراد لكل عميل. إنها ثلاث خطوات: الإيراد لكل عميل، ثم متوسطه، ثم المقارنة. يعطيك SQL طريقتين لتداخل الخطوات، الـ subqueries والـ CTEs، والاختيار بينهما يحدّد هل يستطيع المحلّل التالي أن يقرأ عملك.

## ثلاثة أنواع من الـ subqueries

استخدمت اثنين منها بالفعل. **الجدول المشتق** subquery داخل FROM يتصرّف كجدول (الإيراد لكل طلب الذي أصلح الـ fan-out). و**الـ subquery المترابط** يشير إلى الصف الخارجي ويعمل لكل صف (الـ anti-join بـ NOT EXISTS). والثالث هو **الـ scalar subquery**: query يعيد قيمة واحدة بالضبط، ويمكن استخدامه في أي مكان تصلح فيه قيمة.

هذا سؤال كريم مكتوبًا بالتداخل وحده:

```sql run
SELECT COUNT(*) AS above_average_customers
FROM (
  SELECT o.customer_id, SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS revenue
  FROM orders AS o
  JOIN order_items AS oi ON oi.order_id = o.order_id
  WHERE o.status <> 'cancelled'
    AND o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'
  GROUP BY o.customer_id
) AS r
WHERE r.revenue > (
  SELECT AVG(revenue) FROM (
    SELECT SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS revenue
    FROM orders AS o
    JOIN order_items AS oi ON oi.order_id = o.order_id
    WHERE o.status <> 'cancelled'
      AND o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'
    GROUP BY o.customer_id
  )
);
```

إنه يعمل: 140 عميلًا. لكنه صعب القراءة أيضًا، ومنطق الإيراد مكتوب فيه مرتين. حين يغيّر أحدهم تعريف الإيراد في الربع القادم، سيحدّث نسخة وينسى الأخرى.

## التحليل نفسه بالـ CTEs

**الـ CTE** (common table expression) يسمّي query باستخدام `WITH name AS (...)`، وتشير إليه الخطوات اللاحقة كما تشير إلى جدول:

```sql run
WITH revenue_2025 AS (
  -- grain: one row per customer who bought in 2025
  SELECT o.customer_id,
         SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS revenue
  FROM orders AS o
  JOIN order_items AS oi ON oi.order_id = o.order_id
  WHERE o.status <> 'cancelled'
    AND o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'
  GROUP BY o.customer_id
),
benchmark AS (
  SELECT AVG(revenue) AS avg_revenue FROM revenue_2025
)
SELECT
  COUNT(*) AS buyers,
  SUM(r.revenue > b.avg_revenue) AS above_average,
  ROUND(b.avg_revenue, 2) AS avg_revenue
FROM revenue_2025 AS r
CROSS JOIN benchmark AS b;
```

الآن يُقرأ التحليل كالجملة التي يجيب عنها: الإيراد لكل عميل، ثم المعيار، ثم المقارنة. الإيراد معرّف مرة واحدة. وأثناء البناء يمكنك استبدال الـ SELECT الأخير بـ `SELECT * FROM revenue_2025 LIMIT 5` لتفحص أي خطوة، وهذه أفضل عادة منفردة لتصحيح الـ SQL الطويل. والـ `CROSS JOIN` آمن هنا لأن في `benchmark` صفًا واحدًا بالضبط. في SQLite تكون المقارنة 1 أو 0، فيعدّ `SUM(condition)` الصفوف التي قيمتها TRUE؛ وفي PostgreSQL ستكتب `COUNT(*) FILTER (WHERE ...)`.

إذن 140 من أصل 418 مشتريًا يقعون فوق المتوسط البالغ 781.84. هذا معتاد في بيانات الإيرادات: أقلية من العملاء الكبار ترفع المتوسط، ولهذا ستعرض الوسيط بجانبه في كثير من الأحيان.

:::tip subquery أم CTE؟
استخدم الـ subquery لشيء صغير ومحلي، مثل `IN (SELECT ...)` أو قيمة مفردة واحدة. واستخدم الـ CTE حالما تستحق الخطوة اسمًا، أو تُستخدم مرتين، أو تتجاوز بضعة أسطر. نادرًا ما يكون الأداء هو العامل الحاسم: SQLite وPostgreSQL كلاهما يدمج الـ CTEs عادةً ويخطّط لها كما يخطّط للـ subqueries.
:::

## الـ CTE التكراري: تتبّع تسلسل هرمي

يعود طلب رانيا الخاص بإعادة الهيكلة: «اعرض كل من في فريق الهندسة الذي يقوده بيتر ويبر، على أي مستوى، مع بُعد كل شخص عنه». الـ self-join يعطيك مستوى واحدًا. فريق بيتر فيه مستويان، وقد يكون في قسم آخر خمسة. **الـ CTE التكراري** يتعمّق بقدر ما تتعمّق البيانات:

```sql run
WITH RECURSIVE org AS (
  -- anchor: where the walk starts
  SELECT employee_id, first_name, title, 0 AS depth, first_name AS path
  FROM employees
  WHERE employee_id = 4
  UNION ALL
  -- recursive step: people who report to anyone found so far
  SELECT e.employee_id, e.first_name, e.title, org.depth + 1,
         org.path || ' > ' || e.first_name
  FROM employees AS e
  JOIN org ON e.manager_id = org.employee_id
)
SELECT depth, path, title
FROM org
ORDER BY path;
```

البنية هي نفسها دائمًا. **query الارتكاز** يعمل مرة واحدة وينتج صفوف البداية. و**الـ query التكراري** يربط `employees` بـ `org` نفسه، لكنه في كل تكرار لا يرى إلا الصفوف التي أضافها التكرار السابق. كل جولة تضيف المستوى التالي نزولًا، وينتهي التتبّع حين لا يجد تكرارٌ أحدًا.

:::figure كل تكرار في الـ CTE التكراري يضيف المستوى التالي من الهيكل التنظيمي
<svg viewBox="0 0 720 220" role="img" aria-labelledby="t1">
  <title id="t1">التكرار 0 هو الارتكاز، بيتر. التكرار 1 يضيف من يتبعون له مباشرةً، فيليكس وآيفي. التكرار 2 يضيف من يتبعون لفيليكس: سلمى ورايان ومنى ودانيال. التكرار 3 لا يجد أحدًا، فيتوقف التكرار.</title>
  <text class="d-label-muted" x="70" y="45" text-anchor="middle">التكرار 0</text>
  <text class="d-label-muted" x="70" y="105" text-anchor="middle">التكرار 1</text>
  <text class="d-label-muted" x="70" y="165" text-anchor="middle">التكرار 2</text>
  <text class="d-label-muted" x="70" y="210" text-anchor="middle">التكرار 3</text>
  <rect class="d-box-primary" x="330" y="22" width="120" height="36" rx="8"/>
  <text class="d-label-strong" x="390" y="45" text-anchor="middle">Peter</text>
  <rect class="d-box-accent" x="230" y="82" width="120" height="36" rx="8"/>
  <text class="d-label" x="290" y="105" text-anchor="middle">Felix</text>
  <rect class="d-box-accent" x="470" y="82" width="120" height="36" rx="8"/>
  <text class="d-label" x="530" y="105" text-anchor="middle">Ivy</text>
  <rect class="d-box" x="140" y="142" width="100" height="36" rx="8"/>
  <text class="d-label" x="190" y="165" text-anchor="middle">Salma</text>
  <rect class="d-box" x="250" y="142" width="100" height="36" rx="8"/>
  <text class="d-label" x="300" y="165" text-anchor="middle">Ryan</text>
  <rect class="d-box" x="360" y="142" width="100" height="36" rx="8"/>
  <text class="d-label" x="410" y="165" text-anchor="middle">Mona</text>
  <rect class="d-box" x="470" y="142" width="100" height="36" rx="8"/>
  <text class="d-label" x="520" y="165" text-anchor="middle">Daniel</text>
  <text class="d-label-muted" x="390" y="210" text-anchor="middle">لا صفوف جديدة، فيتوقف التكرار</text>
  <path class="d-line" d="M370 58 L300 82"/>
  <path class="d-line" d="M410 58 L520 82"/>
  <path class="d-line" d="M270 118 L190 142"/>
  <path class="d-line" d="M285 118 L300 142"/>
  <path class="d-line" d="M300 118 L410 142"/>
  <path class="d-line" d="M320 118 L520 142"/>
</svg>
:::

يُمرَّر `depth` و`path` عبر التكرار: كل صف جديد يحسب قيمه من الصف الأب الذي ارتبط به. والترتيب حسب `path` يطبع النتيجة كشجرة متدرّجة. يصلح النمط نفسه لتجميع التكاليف صعودًا في شجرة فئات، أو لتتبّع سلاسل الإحالة، أو لتفكيك قائمة مكوّنات منتج.

:::mistake تكرار بلا مكابح
إذا احتوت البيانات على حلقة (A يدير B، وB يدير A، بعد استيراد سيئ)، فلن تنفد الصفوف أمام التكرار أبدًا، وسيعمل الـ query حتى يفشل أو يوقفه أحد. حين لا تثق تمامًا بتسلسل هرمي، أضف `WHERE org.depth < 20` إلى الخطوة التكرارية. استخدام `UNION` بدل `UNION ALL` يمنع أيضًا تكرار الصفوف المتطابقة تمامًا، لكن وجود عمود للعمق أو للمسار يُبطل ذلك، فيبقى حدّ العمق هو الحارس الذي يُعتمد عليه.
:::

بالـ CTEs تستطيع أن تسمّي كل خطوة. يضيف الدرس التالي أداة تتيح لكل صف أن يرى جيرانه دون ضغط أي شيء: دوال النافذة.
