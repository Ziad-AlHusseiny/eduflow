---
summary: ابنِ قمع تحويل (funnel) من أحداث الجلسات بالتجميع الشرطي، ثم جمّع العملاء في cohorts شهرية حسب طلبهم الأول وقِس كم منهم يعود في الأشهر اللاحقة.
takeaways:
  - القمع (funnel) يعدّ كم وحدة تصل إلى كل خطوة ويقسم كل خطوة على التي قبلها، فترى بالضبط أين يتسرّب الناس.
  - صرّح دائمًا بمقام أي معدل؛ معدل إتمام الشراء (المشتريات لكل سلة) ومعدل التحويل (المشتريات لكل جلسة) يجيبان عن سؤالين مختلفين.
  - الـ cohort يجمع العملاء حسب فترة حدثهم الأول، ومعدل الاحتفاظ (retention) يعدّ العملاء النشطين بعد N فترات، كلًّا مرة واحدة، مقسومًا على حجم الـ cohort.
  - الأشهر التي لم يعشها cohort حديث بعد قيمتها غير معروفة لا صفر؛ اعرضها NULL حتى لا يقرأها أحد على أنها انقطاع.
further:
  - title: SQLite aggregate functions and FILTER
    url: https://www.sqlite.org/lang_aggfunc.html
  - title: SQLite date and time functions
    url: https://www.sqlite.org/lang_datefunc.html
quiz:
  - q: "جلسات البريد الإلكتروني: 404 جلسات، و107 إضافات إلى السلة، و44 عملية شراء. أي رقم هو معدل إتمام الشراء؟"
    options:
      - text: "10.9%، المشتريات مقسومة على الجلسات"
        why: هذا معدل التحويل الإجمالي. إنه يخلط خطوتين ويخفي أين يتسرّب الناس.
      - text: "26.5%، السلال مقسومة على الجلسات"
        why: هذا معدل الإضافة إلى السلة، وهو الخطوة الأولى في القمع.
      - text: "73.5%، الجلسات التي لم تُضِف إلى السلة"
        why: هذا هو التسرّب عند الخطوة الأولى، وليس مقياسًا لإتمام الشراء.
      - text: "41.1%، المشتريات مقسومة على السلال"
        why: صحيح. يقيس معدل إتمام الشراء الخطوة من السلة إلى الشراء، فمقامه هو السلال.
    answer: 3
  - q: لماذا يستخدم الـ query الخاص بالـ cohorts العبارة `SELECT DISTINCT cohort, customer_id, month_number` قبل العدّ؟
    options:
      - text: حتى يُحسب العميل الذي يطلب ثلاث مرات في شهر واحد عميلًا نشطًا واحدًا، لا ثلاثة.
        why: صحيح. معدل الاحتفاظ يدور حول الأشخاص. بدون DISTINCT يضخّم المشترون المتكرّرون عدد النشطين، وقد يدفعون المعدل فوق 100%.
      - text: لأن COUNT لا يعمل بدون DISTINCT داخل CTE.
        why: COUNT يعمل في أي مكان؛ وDISTINCT هنا يتعلّق بمستوى تفصيل جدول النشاط، لا بالصياغة.
      - text: لترتيب الـ cohorts زمنيًا.
        why: DISTINCT يزيل التكرارات؛ ولا يَعِد بأي ترتيب.
    answer: 0
  - q: يعرض cohort ديسمبر 2025 معدل احتفاظ 0% في الشهر 1. تنتهي البيانات في 2025-12-31. ماذا يجب أن يعرض الجدول؟
    options:
      - text: "0%، لأن أحدًا منهم لم يطلب في الشهر 1"
        why: الشهر 1 لـ cohort ديسمبر هو يناير 2026، وهو غير موجود في البيانات. الصفر يدّعي أنهم انقطعوا جميعًا.
      - text: القيمة نفسها لـ cohort نوفمبر، كتقدير.
        why: ملء الخانة بقيمة cohort آخر يخترع بيانات ويخفي أن الفترة لم تحدث بعد.
      - text: NULL أو خانة فارغة، لأن ذلك الشهر لم يُرصد بعد.
        why: صحيح. الخانات غير المرصودة قيمتها غير معروفة. وتعبير CASE يفحص هل يقع شهر الـ cohort مضافًا إليه N داخل نطاق البيانات يجعل ذلك صريحًا.
    answer: 2
  - q: لحساب «الأشهر منذ الطلب الأول» عبر حدود السنة، لماذا تحوّل التواريخ إلى `year * 12 + month` بدل طرح قيم `strftime('%m', ...)`؟
    options:
      - text: لأن strftime لا تستطيع إعادة الشهر.
        why: تستطيع، باستخدام '%m'. المشكلة فيما يحدث حين تطرح أشهرًا من سنوات مختلفة.
      - text: بين ديسمبر 2024 ويناير 2025 شهر واحد، لكن 1 - 12 تعطي ‎-11؛ ومؤشّر شهر واحد يجعل الفرق صحيحًا.
        why: صحيح. تحويل كل شهر إلى رقم واحد متزايد يجعل فروق الأشهر عملية طرح بسيطة، عبر أي حدود بين السنوات.
      - text: لأنه أسرع في الحساب.
        why: السرعة ليست المشكلة؛ طرح أرقام الأشهر المجرّدة خاطئ عبر السنوات.
    answer: 1
---

طلبان في رأس القائمة. هدى: «ميزانية البحث المدفوع قيد المراجعة. أي مصادر الزيارات تحوّل الزيارات فعلًا إلى طلبات، وأين يتسرّب الناس؟». ورانيا: «اكتسبنا عملاء كثيرين في أشهر Black Friday. هل يعودون بالقدر نفسه الذي يعود به الآخرون؟». الأول **قمع** (funnel)، والثاني تحليل **معدل الاحتفاظ لكل cohort**. كلاهما مبني من أشياء تعرفها بالفعل: التجميع الشرطي، والتواريخ، والـ CTEs.

## قمع من أحداث الجلسات

كل صف في `web_sessions` زيارة واحدة، مع علامات للخطوات التي بلغتها: `added_to_cart` و`purchased` (0 أو 1). جمع علامة قيمتها 0/1 يعدّ الجلسات التي بلغت الخطوة، فيكون القمع GROUP BY واحدًا:

```sql run
SELECT
  source,
  COUNT(*)            AS sessions,
  SUM(added_to_cart)  AS carts,
  SUM(purchased)      AS purchases,
  ROUND(100.0 * SUM(added_to_cart) / COUNT(*), 1)                  AS cart_rate,
  ROUND(100.0 * SUM(purchased) / NULLIF(SUM(added_to_cart), 0), 1) AS checkout_rate,
  ROUND(100.0 * SUM(purchased) / COUNT(*), 1)                      AS conversion
FROM web_sessions
WHERE started_at >= '2025-01-01'
GROUP BY source
ORDER BY conversion DESC;
```

البريد الإلكتروني هو الأفضل تحويلًا إجمالًا، 10.9% من الجلسات، والإحالات هي الأسوأ بـ 7.1%. لكن معدلات الخطوات تحكي القصة الأنفع. زوّار الإحالات نادرًا ما يضيفون إلى السلة (13.3%)، لكن من يضيف منهم يتمّ الشراء أكثر من أي فئة أخرى (53.6%). والبريد الإلكتروني عكس ذلك. هاتان مشكلتان مختلفتان وإصلاحهما مختلف: الإحالات تحتاج إلى صفحات هبوط أفضل، والبريد يحتاج إلى عملية دفع أسلس.

لهذا يعرض القمع **معدلات الخطوات**، أي كل خطوة مقسومة على السابقة، لا التحويل من البداية إلى النهاية وحده. اجعل كل مقام صريحًا في اسم العمود؛ فـ«معدل التحويل» بلا مقام هو أكثر رقم يُتجادل حوله في أي اجتماع تسويق. ويحمي `NULLIF` القسمة لمصدر ليس فيه سلال.

:::tip تأكّد أن القمع قمع فعلًا
كل خطوة يجب أن تكون جزءًا من الخطوة السابقة. قبل أن تُبلغ بالنتائج، شغّل `SELECT COUNT(*) FROM web_sessions WHERE purchased = 1 AND added_to_cart = 0`. على بيانات Cartwheel النتيجة 0. لو لم تكن كذلك، لكان الشراء بلا سلة خطأً في التتبّع، وقد تتجاوز معدلات خطواتك 100%.
:::

استبدل `source` بـ `device` فيظهر اكتشاف أوضح: جلسات الحاسوب المكتبي التي تبلغ السلة تتمّ الشراء في 56% من الحالات، وجلسات الجوال في 37% فقط. والجوال يجلب أكبر قدر من الزيارات، فهذه الفجوة أثمن من أي تعديل على ميزانية الإعلانات.

## الـ cohorts: تجميع العملاء حسب وقت بدايتهم

**الـ cohort** مجموعة من العملاء يتشاركون فترة بداية واحدة. وهي هنا شهر أول طلب غير ملغى لهم. ثم يسأل معدل الاحتفاظ: من العملاء الذين بدأوا في الشهر M، ما نسبة من طلبوا مجددًا بعد شهر أو شهرين أو ثلاثة؟

ثلاث خطوات، وثلاثة CTEs. أولًا، أعطِ كل طلب **مؤشّر شهر**، `year * 12 + month`، حتى تكون فروق الأشهر عملية طرح بسيطة حتى عبر حدود السنة. ثانيًا، اعثر على الشهر الأول لكل عميل. ثالثًا، اعرض الأشهر النشطة لكل عميل نسبةً إلى الـ cohort الخاص به:

```sql run
WITH orders_ok AS (
  SELECT customer_id, order_date,
         CAST(strftime('%Y', order_date) AS INTEGER) * 12
           + CAST(strftime('%m', order_date) AS INTEGER) AS month_index
  FROM orders
  WHERE status <> 'cancelled'
),
firsts AS (
  -- grain: one row per customer
  SELECT customer_id,
         MIN(month_index) AS cohort_index,
         strftime('%Y-%m', MIN(order_date)) AS cohort
  FROM orders_ok
  GROUP BY customer_id
),
activity AS (
  -- grain: one row per customer per active month
  SELECT DISTINCT f.cohort, f.cohort_index, o.customer_id,
         o.month_index - f.cohort_index AS month_number
  FROM orders_ok AS o
  JOIN firsts AS f ON f.customer_id = o.customer_id
)
SELECT
  cohort,
  COUNT(*) FILTER (WHERE month_number = 0) AS customers,
  ROUND(100.0 * COUNT(*) FILTER (WHERE month_number = 1)
        / COUNT(*) FILTER (WHERE month_number = 0), 1) AS m1_pct,
  CASE WHEN MAX(cohort_index) + 2 <= 2025 * 12 + 12 THEN
    ROUND(100.0 * COUNT(*) FILTER (WHERE month_number = 2)
          / COUNT(*) FILTER (WHERE month_number = 0), 1)
  END AS m2_pct
FROM activity
WHERE cohort >= '2025-07'
GROUP BY cohort
ORDER BY cohort;
```

يحوّل الـ SELECT الأخير أرقام الأشهر إلى أعمدة باستخدام `FILTER`. والـ `DISTINCT` في `activity` ضروري: معدل الاحتفاظ يعدّ *أشخاصًا*، والعميل الذي يطلب ثلاث مرات في شهر واحد عميل نشط واحد.

:::figure جدول الـ cohorts مثلث: الـ cohorts الحديثة لم تعش بما يكفي لقياسها
<svg viewBox="0 0 720 230" role="img" aria-labelledby="t1">
  <title id="t1">الـ cohorts من سبتمبر إلى ديسمبر 2025 مقابل الأشهر من 0 إلى 3. لسبتمبر الأشهر الأربعة كلها مقيسة؛ ولأكتوبر ثلاثة؛ ولنوفمبر اثنان؛ ولديسمبر الشهر 0 فقط. الخانات التي تقع بعد نهاية البيانات قيمتها غير معروفة، لا صفر.</title>
  <text class="d-label-muted" x="250" y="30" text-anchor="middle">m0</text>
  <text class="d-label-muted" x="370" y="30" text-anchor="middle">m1</text>
  <text class="d-label-muted" x="490" y="30" text-anchor="middle">m2</text>
  <text class="d-label-muted" x="610" y="30" text-anchor="middle">m3</text>
  <text class="d-code" x="110" y="68" text-anchor="middle">2025-09</text>
  <text class="d-code" x="110" y="113" text-anchor="middle">2025-10</text>
  <text class="d-code" x="110" y="158" text-anchor="middle">2025-11</text>
  <text class="d-code" x="110" y="203" text-anchor="middle">2025-12</text>
  <rect class="d-box-primary" x="195" y="45" width="110" height="36" rx="6"/>
  <text class="d-code" x="250" y="68" text-anchor="middle">100%</text>
  <rect class="d-box-accent" x="315" y="45" width="110" height="36" rx="6"/>
  <text class="d-code" x="370" y="68" text-anchor="middle">43.5%</text>
  <rect class="d-box-accent" x="435" y="45" width="110" height="36" rx="6"/>
  <text class="d-code" x="490" y="68" text-anchor="middle">39.1%</text>
  <rect class="d-box-accent" x="555" y="45" width="110" height="36" rx="6"/>
  <text class="d-code" x="610" y="68" text-anchor="middle">30.4%</text>
  <rect class="d-box-primary" x="195" y="90" width="110" height="36" rx="6"/>
  <text class="d-code" x="250" y="113" text-anchor="middle">100%</text>
  <rect class="d-box-accent" x="315" y="90" width="110" height="36" rx="6"/>
  <text class="d-code" x="370" y="113" text-anchor="middle">44.4%</text>
  <rect class="d-box-accent" x="435" y="90" width="110" height="36" rx="6"/>
  <text class="d-code" x="490" y="113" text-anchor="middle">27.8%</text>
  <rect class="d-box d-dashed" x="555" y="90" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="610" y="113" text-anchor="middle">لم يحن بعد</text>
  <rect class="d-box-primary" x="195" y="135" width="110" height="36" rx="6"/>
  <text class="d-code" x="250" y="158" text-anchor="middle">100%</text>
  <rect class="d-box-accent" x="315" y="135" width="110" height="36" rx="6"/>
  <text class="d-code" x="370" y="158" text-anchor="middle">36.2%</text>
  <rect class="d-box d-dashed" x="435" y="135" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="490" y="158" text-anchor="middle">لم يحن بعد</text>
  <rect class="d-box d-dashed" x="555" y="135" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="610" y="158" text-anchor="middle">لم يحن بعد</text>
  <rect class="d-box-primary" x="195" y="180" width="110" height="36" rx="6"/>
  <text class="d-code" x="250" y="203" text-anchor="middle">100%</text>
  <rect class="d-box d-dashed" x="315" y="180" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="370" y="203" text-anchor="middle">لم يحن بعد</text>
  <rect class="d-box d-dashed" x="435" y="180" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="490" y="203" text-anchor="middle">لم يحن بعد</text>
  <rect class="d-box d-dashed" x="555" y="180" width="110" height="36" rx="6"/>
  <text class="d-label-muted" x="610" y="203" text-anchor="middle">لم يحن بعد</text>
</svg>
:::

## «غير معروف» ليس صفرًا

انظر إلى صف ديسمبر 2025 في نتيجة الـ query: قيمة `m1_pct` هي 0.0. هذا ليس انقطاعًا. الشهر 1 لـ cohort ديسمبر هو يناير 2026، والبيانات تنتهي في 31 ديسمبر. يعرض العمود `m2_pct` الإصلاح: تعبير CASE يفحص هل عاش الـ cohort ذلك الشهر (أي هل ما زال `cohort_index + 2` داخل ديسمبر 2025) ويعيد NULL في غير ذلك. مخطط الاحتفاظ ذو الخانات الفارغة الصادقة مثلث؛ أما المخطط ذو الأصفار فيُظهر انهيارًا وهميًا في كل cohort حديث.

:::mistake عدّ الطلبات بدل العملاء
احذف DISTINCT من `activity`، فيضيف عميل وفيّ واحد لديه أربعة طلبات في أكتوبر 4 إلى «العملاء النشطين» في أكتوبر. فيرتفع معدل الاحتفاظ، ويتجاوز أحيانًا 100%. كلما كان المعدل عن الأشخاص، تحقّق من أن بسطه ومقامه عدّان لأشخاص كلٌّ منهم مرة واحدة، بمستوى التفصيل نفسه.
:::

نعود إلى سؤال رانيا. غيّر الشرط إلى 2024، فتجد أن cohort نوفمبر 2024، وهو أول جمهور Black Friday لدى Cartwheel وأكبر cohort في تلك السنة بـ 35 عميلًا، لا يحتفظ إلا بـ 14.3% في الشهر 1، وهذا أقل من معظم cohorts عام 2024. عملاء الخصومات الكبيرة يأتون عادةً من أجل الصفقة. هذه إجابة تستطيع استخدامها حين تخطّط للعرض الترويجي القادم. ويطرح التمرين سؤالًا قريب الصلة: ما نسبة من يعودون من كل cohort أصلًا خلال ثلاثة أشهر؟

بهذا تكتمل أدوات التحليل. أما القسم الأخير فيدور حول الثقة: التأكد من أن البيانات والـ queries التي تكتبها تستحقها.
