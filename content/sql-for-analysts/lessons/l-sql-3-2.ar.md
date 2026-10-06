---
summary: رتّب الصفوف داخل المجموعات باستخدام ROW_NUMBER وRANK وDENSE_RANK مع OVER (PARTITION BY ... ORDER BY ...)، وأجب عن أسئلة «أعلى N في كل مجموعة» و«الحدث الأول» دون أن تفقد الصفوف التفصيلية.
takeaways:
  - دالة النافذة (window function) تحسب قيمة من مجموعة صفوف مترابطة لكنها تُبقي كل صف، على عكس GROUP BY الذي يضغطها.
  - يعيد PARTITION BY بدء الحساب لكل مجموعة؛ ويحدّد ORDER BY داخل OVER التسلسل الذي يتبعه الترتيب.
  - يعطي ROW_NUMBER مواضع فريدة، ويترك RANK فجوات بعد التعادل (1، 1، 3) بينما لا يتركها DENSE_RANK (1، 1، 2).
  - تُحسب دوال النافذة بعد WHERE، لذا لتصفية النتائج حسب الترتيب، احسبه في CTE ثم صفِّ في الـ query الخارجي.
  - اجعل ROW_NUMBER حتميًا بإضافة عمود فريد لكسر التعادل في الـ ORDER BY الخاص به.
further:
  - title: SQLite window functions
    url: https://www.sqlite.org/windowfunctions.html
  - title: PostgreSQL window functions tutorial
    url: https://www.postgresql.org/docs/current/tutorial-window.html
quiz:
  - q: لثلاثة منتجات إيرادات قدرها 900 و900 و700. ماذا يعطي RANK وDENSE_RANK (بترتيب الإيراد تنازليًا) للمنتج صاحب 700؟
    options:
      - text: RANK يعطي 3، وDENSE_RANK يعطي 2
        why: صحيح. يتخطّى RANK الموضع 2 لأن صفّين يتشاركان الموضع 1؛ ويكمل DENSE_RANK بالعدد الصحيح التالي.
      - text: RANK يعطي 2، وDENSE_RANK يعطي 3
        why: هذا معكوس. DENSE_RANK هو الذي لا يترك فجوات، فلا يكون أبدًا أكبر من RANK.
      - text: RANK يعطي 2، وDENSE_RANK يعطي 2
        why: كان هذا سيصحّ لو لم يكن هناك تعادل في القمة. قيمة RANK هي واحد زائد عدد الصفوف المرتّبة فوق الصف، أي 1 + 2 = 3.
      - text: RANK يعطي 3، وDENSE_RANK يعطي 3
        why: لا يترك DENSE_RANK فجوات، فتحصل 700، وهي القيمة المختلفة الثانية، على 2 لا 3.
    answer: 0
  - q: "لماذا يفشل `SELECT ... WHERE ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) = 1`؟"
    options:
      - text: لأن ROW_NUMBER يحتاج إلى وسيط.
        why: لا يأخذ ROW_NUMBER أي وسيط؛ القوسان الفارغان صحيحان.
      - text: لأن PARTITION BY لا يمكن استخدامه مع ORDER BY.
        why: صُمّما ليُستخدما معًا؛ الـ partition يعيد بدء الترقيم، والترتيب يحدّده.
      - text: لأن دوال النافذة لا تعمل إلا على الأعمدة الرقمية.
        why: لا يقرأ ROW_NUMBER قيم أي عمود؛ إنه يرقّم الصفوف بالترتيب المعطى.
      - text: لأن دوال النافذة تُحسب بعد WHERE، فلا يمكن استخدامها فيه.
        why: صحيح. احسب رقم الصف في CTE أو subquery، ثم صفِّ بـ `WHERE rn = 1` في الـ query الخارجي.
    answer: 3
  - q: ترقّم طلبات كل عميل بـ `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY date(order_date))`. يحصل طلبان في اليوم نفسه على 1 و2 بترتيب لا يمكن التنبؤ به. ما الإصلاح؟
    options:
      - text: استخدم RANK بدلًا منه، فيحصل الاثنان على 1.
        why: عندها يصبح للعميل طلبان «أوّلان»، والتصفية على الترتيب 1 تعيد الاثنين، فيتكرّر العميل.
      - text: احذف PARTITION BY.
        why: بدون الـ partition يمتد الترقيم عبر كل العملاء، ولا يحصل على 1 إلا طلب واحد في الجدول كله.
      - text: أضف عمودًا فريدًا لكسر التعادل، مثل `order_id`، بعد التاريخ في ORDER BY الخاص بالنافذة.
        why: صحيح. مع مفتاح أخير فريد يصبح الترتيب كاملًا، فيحصل الصف نفسه على 1 في كل مرة.
    answer: 2
  - q: كم صفًا يعيد `SELECT customer_id, COUNT(*) OVER (PARTITION BY customer_id) FROM orders`؟
    options:
      - text: صفًا لكل طلب، يعرض كلٌّ منها عدد طلبات ذلك العميل.
        why: صحيح. تعدّ النافذة الصفوف في الـ partition الخاص بكل عميل لكنها لا تضغطها، فيبقى كل صف طلب.
      - text: صفًا لكل عميل.
        why: هذا ما كان سيعيده `GROUP BY customer_id`. دالة النافذة لا تغيّر عدد الصفوف أبدًا.
      - text: صفًا واحدًا فيه العدد الكلي للطلبات.
        why: هذا `COUNT(*)` عادي بلا GROUP BY ولا OVER.
    answer: 0
---

تريد هدى أن تعرض المنتجين الأكثر مبيعًا من كل فئة في النشرة البريدية لفصل الربيع. يمكنك الحصول على الإيراد لكل منتج بـ GROUP BY. لكن «أعلى اثنين *داخل كل فئة*» يحتاج إلى شيء لا يستطيعه GROUP BY: ترتيب الصفوف مقابل جيرانها مع إبقاء كل صف. هذه هي مهمة **دوال النافذة** (window functions)، وحين تمتلكها، تصبح فئة كاملة من الأسئلة قصيرة.

## إبقاء الصفوف مع النظر عبرها

يضغط `GROUP BY` كل مجموعة في صف واحد. أما دالة النافذة فتحسب قيمة عبر مجموعة من الصفوف، هي *النافذة*، وتلحقها بكل صف، دون أن تضغط شيئًا.

:::figure GROUP BY يضغط المجموعة؛ ودالة النافذة تضيف قيمة إلى كل صف
<svg viewBox="0 0 720 190" role="img" aria-labelledby="t1">
  <title id="t1">ثلاثة منتجات من فئة Yoga ومنتج واحد من فئة Kitchen مع إيراداتها في 2025. يعيد GROUP BY category صفّين، صفًا لكل فئة. ويعيد RANK على partition حسب الفئة الصفوف الأربعة كلها، مع ترتيب كل صف داخل فئته.</title>
  <text class="d-label-strong" x="120" y="24" text-anchor="middle">إيراد المنتجات</text>
  <rect class="d-box-accent" x="20" y="36" width="200" height="30" rx="6"/>
  <text class="d-code" x="120" y="56" text-anchor="middle">Yoga   Mat      4665</text>
  <rect class="d-box-accent" x="20" y="70" width="200" height="30" rx="6"/>
  <text class="d-code" x="120" y="90" text-anchor="middle">Yoga   Cushion  3923</text>
  <rect class="d-box-accent" x="20" y="104" width="200" height="30" rx="6"/>
  <text class="d-code" x="120" y="124" text-anchor="middle">Yoga   Block    1656</text>
  <rect class="d-box-success" x="20" y="146" width="200" height="30" rx="6"/>
  <text class="d-code" x="120" y="166" text-anchor="middle">Kitchen Board   2039</text>
  <text class="d-label-strong" x="360" y="24" text-anchor="middle">GROUP BY</text>
  <rect class="d-box-accent" x="270" y="70" width="180" height="30" rx="6"/>
  <text class="d-code" x="360" y="90" text-anchor="middle">Yoga    10244</text>
  <rect class="d-box-success" x="270" y="146" width="180" height="30" rx="6"/>
  <text class="d-code" x="360" y="166" text-anchor="middle">Kitchen  2039</text>
  <text class="d-label-strong" x="600" y="24" text-anchor="middle">RANK() OVER</text>
  <rect class="d-box-accent" x="490" y="36" width="220" height="30" rx="6"/>
  <text class="d-code" x="600" y="56" text-anchor="middle">Yoga   Mat      1</text>
  <rect class="d-box-accent" x="490" y="70" width="220" height="30" rx="6"/>
  <text class="d-code" x="600" y="90" text-anchor="middle">Yoga   Cushion  2</text>
  <rect class="d-box-accent" x="490" y="104" width="220" height="30" rx="6"/>
  <text class="d-code" x="600" y="124" text-anchor="middle">Yoga   Block    3</text>
  <rect class="d-box-success" x="490" y="146" width="220" height="30" rx="6"/>
  <text class="d-code" x="600" y="166" text-anchor="middle">Kitchen Board   1</text>
</svg>
:::

الصياغة دالة يتبعها `OVER (...)`. داخل القوسين، يقسم `PARTITION BY` الصفوف إلى مجموعات، ويُعاد بدء الحساب في كل مجموعة؛ ويحدّد `ORDER BY` الترتيب الذي تسير به الدالة. إذا حذفت PARTITION BY، أصبحت النتيجة كلها نافذة واحدة.

## ROW_NUMBER وRANK وDENSE_RANK

لا تختلف دوال الترتيب الثلاث إلا في طريقة تعاملها مع التعادل. هؤلاء هم أكثر المشترين تكرارًا في الإمارات في 2025:

```sql run
WITH uae_orders AS (
  SELECT o.customer_id, COUNT(*) AS orders
  FROM orders AS o
  JOIN customers AS c ON c.customer_id = o.customer_id
  WHERE c.country = 'United Arab Emirates'
    AND o.status <> 'cancelled'
    AND o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'
  GROUP BY o.customer_id
)
SELECT
  customer_id,
  orders,
  ROW_NUMBER() OVER (ORDER BY orders DESC, customer_id) AS row_num,
  RANK()       OVER (ORDER BY orders DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY orders DESC) AS dense_rnk
FROM uae_orders
ORDER BY orders DESC, customer_id
LIMIT 8;
```

قدّم العميلان 163 و534 كلاهما 11 طلبًا. ومع ذلك يعطيهما `ROW_NUMBER` الرقمين 4 و5، أي موضعين فريدين، مستخدمًا `customer_id` لكسر التعادل. ويعطي `RANK` كليهما 4 ثم يقفز إلى 6، كجدول ترتيب الدوري الرياضي. ويعطي `DENSE_RANK` كليهما 4 ويكمل بـ 5.

اختر حسب السؤال. «صف واحد بالضبط لكل مجموعة» (آخر طلب، أول زيارة) يعني ROW_NUMBER. و«أعلى 3، مع كل من يتعادل في المركز الثالث» يعني RANK. و«أعلى ثلاث *قيم*» يعني DENSE_RANK.

:::mistake ROW_NUMBER غير الحتمي
`ROW_NUMBER() OVER (ORDER BY orders DESC)` بلا عمود لكسر التعادل يرقّم الصفوف المتعادلة بأي ترتيب يصادفها به المحرّك، وقد يتغيّر ذلك من تشغيل إلى آخر. التقرير الذي يقول «العميل 534 في المركز الرابع» يوم الاثنين و«الخامس» يوم الثلاثاء يفقد الثقة بسرعة. أنهِ كل ترتيب لـ ROW_NUMBER بعمود فريد.
:::

## أعلى N في كل مجموعة

تعمل دوال النافذة بعد WHERE، في خطوة SELECT، فلا يمكنك التصفية على الترتيب في WHERE الخاص بالـ query نفسه. النمط المعتاد هو CTE يحسب الترتيب، وquery خارجي يصفّيه:

```sql
WITH ranked AS (
  SELECT
    category,
    product,
    revenue,
    RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk
  FROM product_revenue
)
SELECT category, product, revenue, rnk
FROM ranked
WHERE rnk <= 2;
```

يمثّل `product_revenue` هنا الـ CTE الخاص بالإيراد لكل منتج الذي ستكتبه أولًا، مستخدمًا الـ JOIN من درس الـ JOIN. وبناؤه هو التمرين.

## الأحداث الأولى: صف واحد لكل عميل

تجيب الأداة نفسها عن سؤال تنتظره هدى منذ أشهر: أي قناة تجلب عملاء *جددًا*؟ إنها قناة الطلب الأول لكل عميل، أي صف واحد لكل partition:

```sql run
WITH numbered AS (
  SELECT
    customer_id,
    channel,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY order_date, order_id
    ) AS order_seq
  FROM orders
  WHERE status <> 'cancelled'
)
SELECT channel AS first_order_channel, COUNT(*) AS customers
FROM numbered
WHERE order_seq = 1
GROUP BY channel
ORDER BY customers DESC;
```

يجلب الويب 268 عميلًا، والتطبيق 172، والـ marketplace 63. قارن ذلك بإجمالي الطلبات حسب القناة وسترى هل يجد الـ marketplace مشترين جددًا في الغالب أم يخدم مشترين حاليين. والعمود `order_seq` مفيد بحدّ ذاته أيضًا: `order_seq = 2` يجد الطلبات الثانية، وهي بداية كل تحليل لتكرار الشراء.

## شرائح بدل المواضع

أحيانًا لا يكون السؤال «من الأول؟» بل «في أي شريحة يقع كل عميل؟». يقسم فريق المالية لدى كريم العملاء إلى أرباع حسب إيرادهم الكلي لمقارنة استخدام الخصومات بين الشرائح. توزّع `NTILE(n)` الصفوف المرتّبة على n شريحة متقاربة الحجم:

```sql run
WITH lifetime AS (
  SELECT o.customer_id,
         SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS revenue
  FROM orders AS o
  JOIN order_items AS oi ON oi.order_id = o.order_id
  WHERE o.status <> 'cancelled'
  GROUP BY o.customer_id
),
tiered AS (
  SELECT customer_id, revenue,
         NTILE(4) OVER (ORDER BY revenue DESC) AS quartile
  FROM lifetime
)
SELECT quartile,
       COUNT(*) AS customers,
       ROUND(MIN(revenue), 2) AS min_revenue,
       ROUND(SUM(revenue), 2) AS revenue
FROM tiered
GROUP BY quartile
ORDER BY quartile;
```

إيراد الربع الأعلى يتضاءل أمامه إيراد الربع الأدنى، وهو الشكل المألوف في الغالبية العظمى من قواعد العملاء. لاحظ التدرّج: جمّع إلى صف واحد لكل عميل، ثم حدّد الشريحة بدالة نافذة، ثم جمّع مجددًا حسب الشريحة. دوال النافذة وGROUP BY ليسا متنافسين؛ معظم التحليلات الحقيقية تستخدم الاثنين، في خطوات منفصلة.

تقسم `NTILE` حسب عدد الصفوف لا حسب القيمة، فقد يقع عملاء متساوون في الإيراد في شرائح مختلفة. أما الشرائح ذات الحدود الثابتة («أكثر من 2,000 يعني ذهبي») فأداتها الصادقة هي تعبير CASE.

:::tip سمِّ النافذة مرة واحدة
حين تتشارك عدة دوال النافذة نفسها، يتيح لك SQLite وPostgreSQL تعريفها مرة واحدة: `... OVER w FROM orders WINDOW w AS (PARTITION BY customer_id ORDER BY order_date, order_id)`. هذا يُبقي قوائم SELECT الطويلة مقروءة ويضمن أن تتفق الدوال فيما بينها.
:::

الترتيب نصف دوال النافذة. أما النصف الآخر، المجاميع التراكمية والمقارنة بالصف السابق، فيحوّل الجدول الشهري إلى اتجاه، وهو موضوعنا التالي.
