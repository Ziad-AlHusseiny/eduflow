---
summary: حوّل جدولًا شهريًا أو يوميًا إلى اتجاه بالمجاميع التراكمية، وإعادة الضبط مع بداية كل سنة، ومقارنات LAG وLEAD، والمتوسطات المتحركة على إطارات ROWS صريحة، بما في ذلك ملء الأيام المفقودة أولًا.
takeaways:
  - SUM(x) OVER (ORDER BY period) مجموع تراكمي؛ وإضافة PARTITION BY year تجعله يبدأ من جديد كل سنة، أي المجموع منذ بداية السنة.
  - يقرأ LAG(x) قيمة الصف السابق ويقرأ LEAD(x) قيمة الصف التالي، فيكون التغيّر بين فترتين متتاليتين x - LAG(x).
  - يحتاج المتوسط المتحرك (moving average) إلى إطار صريح، مثل ROWS BETWEEN 6 PRECEDING AND CURRENT ROW، وإلى صف لكل فترة، بما فيها الفترات الفارغة.
  - تعمل دوال النافذة بعد WHERE، لذا صفِّ النطاق المعروض في query خارجي، وإلا لن ترى النافذة إلا الصفوف المصفّاة.
further:
  - title: SQLite window functions, frame specifications
    url: https://www.sqlite.org/windowfunctions.html#frame_specifications
  - title: PostgreSQL window function calls
    url: https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS
quiz:
  - q: "يُضاف `SUM(revenue) OVER ()` إلى جدول إيرادات شهري. ماذا يعرض كل صف؟"
    options:
      - text: المجموع التراكمي حتى ذلك الشهر.
        why: المجموع التراكمي يحتاج إلى ORDER BY داخل OVER. بدونه تكون النافذة هي النتيجة كلها.
      - text: إيراد الشهر السابق.
        why: هذا هو LAG(revenue) OVER (ORDER BY month).
      - text: إيراد ذلك الشهر، دون تغيير.
        why: SUM كدالة نافذة يجمع كل صف في النافذة، وهي هنا كل الصفوف، لا الصف الحالي وحده.
      - text: المجموع الكلي لكل الأشهر.
        why: صحيح. الـ OVER () الفارغ ينشئ نافذة واحدة تضم كل الصفوف، فيحصل كل صف على المجموع نفسه.
    answer: 3
  - q: الطلبات الشهرية 84 و63 و70 من يناير إلى مارس. ماذا يعيد `orders - LAG(orders) OVER (ORDER BY month)` ليناير وفبراير ومارس؟
    options:
      - text: "0، ‎-21، 7"
        why: لا يوجد صف سابق ليناير، فيعيد LAG القيمة NULL، وكذلك عملية الطرح، لا 0.
      - text: "‎-21، 7، NULL"
        why: هذه هي النسخة المبنية على LEAD، التي تقارن كل شهر بالشهر الذي يليه.
      - text: "NULL، ‎-21، 7"
        why: صحيح. لا صف سابق ليناير؛ وفبراير هو 63 - 84؛ ومارس هو 70 - 63. مرّر قيمة افتراضية، `LAG(orders, 1, 0)`، فقط إذا كان 0 هو خط الأساس الصحيح فعلًا.
    answer: 2
  - q: الطلبات اليومية مفقودة في الأيام التي لا مبيعات فيها. ما الخطأ في `AVG(orders) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` على هذا الجدول؟
    options:
      - text: الإطار يغطي آخر 7 صفوف، وقد تمتد على أكثر بكثير من 7 أيام، فتُتجاهل الأيام الهادئة ويكون المتوسط مرتفعًا أكثر من اللازم.
        why: صحيح. ROWS يعدّ الصفوف لا التواريخ. املأ التقويم بصف لكل يوم (0 طلبات) قبل حساب المتوسط.
      - text: لا يمكن استخدام AVG كدالة نافذة.
        why: كل دالة تجميع، بما فيها AVG، يمكن استخدامها مع OVER.
      - text: إطارات ROWS غير مدعومة في SQLite.
        why: يدعم SQLite إطارات ROWS منذ وصول دوال النافذة في الإصدار 3.25 (عام 2018).
    answer: 0
  - q: |
      يُفترض أن يعرض هذا الـ query متوسطًا متحركًا لسبعة أيام للأسبوع الأخير من ديسمبر فقط. لماذا تأتي القيم الأولى منخفضة أكثر من اللازم؟
      ```sql
      SELECT day, AVG(orders) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
      FROM filled_days
      WHERE day >= '2025-12-25';
      ```
    options:
      - text: يجب أن يكون الإطار RANGE لا ROWS.
        why: نوع الإطار ليس المشكلة. الأيام السابقة التي يحتاجها الإطار حذفها WHERE قبل أن تعمل النافذة، ولا يستطيع أي إطار أن يرى صفوفًا غير موجودة.
      - text: AVG يتجاهل الأيام التي فيها 0 طلبات.
        why: AVG يتجاهل NULL لا الأصفار. الأصفار تدخل في المتوسط كأي رقم آخر.
      - text: يجب أن يكون ORDER BY تنازليًا.
        why: الترتيب التنازلي سيجعل الإطار ينظر إلى الأمام في الزمن، وهذا ليس متوسطًا للأيام السابقة.
      - text: WHERE يعمل قبل النافذة، فلا يجد الإطار في 25 ديسمبر أيامًا سابقة يحسب متوسطها.
        why: صحيح. احسب المتوسط المتحرك على النطاق الكامل في CTE، ثم صفِّ الأيام التي تريد عرضها في الـ query الخارجي.
    answer: 3
---

تحتاج المراجعة الشهرية لأعمال رانيا إلى ثلاثة أشياء في شريحة واحدة: الإيراد حسب الشهر، وما تراكم من إجمالي السنة حتى الآن، وهل نما كل شهر مقارنةً بسابقه. يمكنك حساب رقم ما منذ بداية السنة في جدول بيانات لاحقًا. لكن دوال النافذة نفسها التي رتّبت المنتجات في الدرس الماضي تستطيع أيضًا أن *تراكم* و*تقارن*، فيخرج الجدول كله من SQL مباشرةً، وبطريقة قابلة لإعادة الإنتاج.

## المجاميع التراكمية ومنذ بداية السنة

دالة التجميع كدالة نافذة مع `ORDER BY` داخل `OVER` تصبح حسابًا تراكميًا: كل صف يرى الصفوف حتى نفسه. أضف `PARTITION BY` فيبدأ الحساب من جديد لكل مجموعة. هذه طلبات Cartwheel الشهرية مع عدد منذ بداية السنة يبدأ من جديد في كل يناير:

```sql run
WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY month
)
SELECT
  month,
  orders,
  SUM(orders) OVER (
    PARTITION BY substr(month, 1, 4)
    ORDER BY month
  ) AS orders_ytd
FROM monthly
ORDER BY month
LIMIT 14;
```

مفتاح الـ partition هو السنة، مأخوذة من الأحرف الأربعة الأولى في تسمية الشهر. يغلق ديسمبر 2024 السنة على 552 طلبًا، ويبدأ يناير 2025 من جديد بـ 84.

نافذتان على الصف نفسه تتكاملان جيدًا. قسمة المجموع التراكمي على مجموع الـ partition كله، `100.0 * SUM(orders) OVER (PARTITION BY substr(month, 1, 4) ORDER BY month) / SUM(orders) OVER (PARTITION BY substr(month, 1, 4))`، تعطي النسبة التراكمية من السنة التي بلغها كل شهر. في نشاط موسمي مثل Cartwheel، هذا هو الرقم الذي تتابعه المالية فعلًا: بنهاية أكتوبر 2025 كان قد أُنجز أقل بقليل من ثلثي السنة.

:::mistake نسيان ORDER BY داخل OVER
`SUM(orders) OVER ()` و`SUM(orders) OVER (PARTITION BY year)` لا ينتجان مجاميع تراكمية؛ كل صف يحصل على المجموع الكامل لنافذته. الـ ORDER BY داخل القوسين هو ما يجعل النافذة تكبر صفًا بعد صف. إذا عرض كل صف في «مجموعك التراكمي» الرقم نفسه، فهذه هي القطعة الناقصة.
:::

## المقارنة بالصف السابق

يعيد `LAG(x)` قيمة `x` من الصف السابق بترتيب النافذة، ويعيد `LEAD(x)` قيمتها من الصف التالي. بعدها يصبح التغيّر بين فترتين عملية حسابية بسيطة:

```sql run
WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY month
)
SELECT
  month,
  orders,
  LAG(orders) OVER (ORDER BY month) AS prev_month,
  orders - LAG(orders) OVER (ORDER BY month) AS change,
  ROUND(100.0 * (orders - LAG(orders) OVER (ORDER BY month))
        / NULLIF(LAG(orders) OVER (ORDER BY month), 0), 1) AS change_pct,
  LAG(orders, 12) OVER (ORDER BY month) AS same_month_last_year
FROM monthly
ORDER BY month DESC
LIMIT 4;
```

قفز نوفمبر 2025 بـ 193 طلبًا، ثم هبط ديسمبر بـ 140: Black Friday، ثم الركود الذي يليه. الأرقام الشهرية المتتالية مشوّشة في نشاط موسمي، ولهذا يستخدم العمود الأخير `LAG(orders, 12)`، أي القيمة قبل اثني عشر صفًا، لمنظور سنة مقابل سنة: 325 طلبًا في نوفمبر هذا العام مقابل 120 في نوفمبر الماضي.

لا يكون `LAG(orders, 12)` «الشهر نفسه في السنة الماضية» إلا إذا كان لكل شهر صف. الشهر الذي لا طلبات فيه لن يكون له صف، وستنزاح كل مقارنة بعده شهرًا واحدًا بصمت. وهذا الافتراض على وشك أن يصبح مهمًا.

## المتوسطات المتحركة والإطار

المتوسط المتحرك يخفّف التشويش اليومي. تحتاج النافذة إلى **إطار** (frame) صريح، أي نطاق الصفوف حول الصف الحالي الذي تراه دالة التجميع: `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` هو الصف الحالي مع الستة التي قبله.

:::figure إطار ROWS ينزلق على الصفوف المرتّبة
<svg viewBox="0 0 720 170" role="img" aria-labelledby="t1">
  <title id="t1">عشرة صفوف يومية مرتّبة. للصف الحالي، اليوم 9، يغطي الإطار ROWS BETWEEN 6 PRECEDING AND CURRENT ROW الأيام من 3 إلى 9، أي سبعة صفوف. وحين يتقدّم الصف الحالي يومًا واحدًا، يتحرك الإطار معه.</title>
  <rect class="d-box" x="20" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="50" y="85" text-anchor="middle">d1</text>
  <rect class="d-box" x="88" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="118" y="85" text-anchor="middle">d2</text>
  <rect class="d-box-accent" x="156" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="186" y="85" text-anchor="middle">d3</text>
  <rect class="d-box-accent" x="224" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="254" y="85" text-anchor="middle">d4</text>
  <rect class="d-box-accent" x="292" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="322" y="85" text-anchor="middle">d5</text>
  <rect class="d-box-accent" x="360" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="390" y="85" text-anchor="middle">d6</text>
  <rect class="d-box-accent" x="428" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="458" y="85" text-anchor="middle">d7</text>
  <rect class="d-box-accent" x="496" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="526" y="85" text-anchor="middle">d8</text>
  <rect class="d-box-primary" x="564" y="60" width="60" height="40" rx="6"/>
  <text class="d-label-strong" x="594" y="85" text-anchor="middle">d9</text>
  <rect class="d-box" x="632" y="60" width="60" height="40" rx="6"/>
  <text class="d-code" x="662" y="85" text-anchor="middle">d10</text>
  <path class="d-line" d="M156 120 L624 120"/>
  <path class="d-line" d="M156 112 L156 128"/>
  <path class="d-line" d="M624 112 L624 128"/>
  <text class="d-label" x="390" y="150" text-anchor="middle">الإطار: من 6 PRECEDING إلى CURRENT ROW (7 صفوف)</text>
  <text class="d-label-muted" x="594" y="40" text-anchor="middle">الصف الحالي</text>
</svg>
:::

يعدّ الإطار **الصفوف** لا الأيام. إذا لم يكن في يوم ما طلبات، فلا صف له، ويمتد الإطار بصمت إلى زمن أبعد. يُظهر الشهر الأول في Cartwheel مدى سوء هذا التضليل: في يناير 2024 وصلت 8 طلبات فقط، في 8 أيام مختلفة. المتوسط على 7 صفوف من الصفوف الموجودة يقول «طلب واحد يوميًا» طوال الشهر. والحقيقة نحو ربع ذلك.

الإصلاح هو تقويم: ولّد صفًا لكل يوم بـ CTE تكراري، واربط به الأعداد اليومية بـ LEFT JOIN، وحوّل الأيام المفقودة إلى أصفار:

```sql run
WITH RECURSIVE days(day) AS (
  SELECT '2024-01-01'
  UNION ALL
  SELECT date(day, '+1 day') FROM days WHERE day < '2024-01-31'
),
daily AS (
  SELECT date(order_date) AS day, COUNT(*) AS orders
  FROM orders
  WHERE status <> 'cancelled'
    AND order_date >= '2024-01-01' AND order_date < '2024-02-01'
  GROUP BY day
),
filled AS (
  SELECT d.day, COALESCE(x.orders, 0) AS orders
  FROM days AS d
  LEFT JOIN daily AS x ON x.day = d.day
),
smoothed AS (
  SELECT day, orders,
         ROUND(AVG(orders) OVER (
           ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
         ), 2) AS orders_7d_avg
  FROM filled
)
SELECT * FROM smoothed
WHERE day >= '2024-01-25'
ORDER BY day;
```

الآن يعرض 31 يناير 0.43 طلب يوميًا خلال الأسبوع الأخير، وهو الرقم الصادق. لاحظ موضع شرط التاريخ: في الـ SELECT الأخير، *بعد* حساب المتوسط المتحرك في `smoothed`. تعمل دوال النافذة بعد WHERE، فالتصفية في الـ query نفسه ستترك الأيام الأولى المعروضة بلا تاريخ سابق يُحسب متوسطه. وحيلة التقويم نفسها تحمي `LAG(orders, 12)` من الأشهر المفقودة.

:::tip ROWS، لا الإطار الافتراضي
مع ORDER BY وبلا إطار، تستخدم دالة التجميع كدالة نافذة `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`، الذي يعامل الصفوف المتساوية في قيمة الترتيب كخطوة واحدة: تحصل كلها على المجموع التراكمي نفسه. حين لا يكون مفتاح الترتيب فريدًا، اكتب `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` لتحصل على مجموع تراكمي صارم صفًا بصف.
:::

أصبحت قادرًا على الترتيب والمراكمة والمقارنة. يضع الدرس التالي هذه الأدوات في خدمة التحليلين اللذين يطلبهما كل فريق منتج: القمع (funnel) ومعدل الاحتفاظ (retention) لكل cohort.
