---
summary: توقّع سلوك NULL في المقارنات والشروط ودوال التجميع، واختبره بـ IS NULL وCOALESCE، وحوّل القيم الخام إلى تسميات مقروءة بتعبيرات CASE.
takeaways:
  - أي مقارنة مع NULL، بما فيها NULL = NULL، تعيد NULL (غير معروف)، وWHERE لا يُبقي إلا الصفوف التي يكون شرطها TRUE.
  - اختبر القيم المفقودة بـ IS NULL أو IS NOT NULL؛ واستخدم IS DISTINCT FROM (أو IS NOT في SQLite) لمقارنة «لا يساوي» آمنة مع NULL.
  - COUNT(*) يعدّ الصفوف، وCOUNT(column) يعدّ القيم غير الـ NULL، وAVG يتجاهل قيم NULL بدل أن يعاملها كأصفار.
  - تعبير CASE يعيد نتيجة أول WHEN قيمته TRUE، لذا ضع الشروط الأكثر تحديدًا أولًا وقرّر دائمًا ما يجب أن يكون عليه ELSE.
further:
  - title: NULL handling in SQLite versus other engines
    url: https://www.sqlite.org/nulls.html
  - title: SQLite CASE expression and IS DISTINCT FROM
    url: https://www.sqlite.org/lang_expr.html#the_case_expression
  - title: PostgreSQL comparison functions and operators
    url: https://www.postgresql.org/docs/current/functions-comparison.html
quiz:
  - q: "قيمة `orders.coupon_code` هي NULL في معظم الطلبات. كم صفًا يُبقي `WHERE coupon_code <> 'FREESHIP'`؟"
    options:
      - text: كل الطلبات ما عدا طلبات FREESHIP، بما فيها قيم NULL.
        why: هذه هي القراءة البديهية، لكن `NULL <> 'FREESHIP'` قيمته NULL لا TRUE، فتُستبعد تلك الصفوف.
      - text: الطلبات التي استخدمت كوبونًا آخر فقط؛ وتُستبعد الطلبات التي بلا كوبون.
        why: صحيح. المقارنة غير معروفة النتيجة للكوبونات التي قيمتها NULL، وWHERE لا يُبقي إلا صفوف TRUE. استخدم `coupon_code IS DISTINCT FROM 'FREESHIP'` لإبقائها.
      - text: لا صفوف، لأن العمود يحتوي على NULL.
        why: قيم NULL لا تؤثّر إلا على صفوفها. الطلبات التي لها كوبون غير NULL تُقارَن بشكل طبيعي.
    answer: 1
  - q: جدول تذاكر فيه 10 صفوف؛ 4 منها قيمة `satisfaction` فيها NULL، ومتوسط الستة الباقية 4.0. ماذا يعيد `AVG(satisfaction)`؟
    options:
      - text: "2.4"
        why: هذا ما ستحصل عليه لو حُسبت قيم NULL أصفارًا (24 / 10). لكن AVG يتخطّى NULL.
      - text: "NULL، لأن بعض القيم مفقودة"
        why: دوال التجميع تتجاهل المدخلات التي قيمتها NULL؛ ولا يعيد AVG قيمة NULL إلا إذا كانت كل القيم NULL.
      - text: "4.0"
        why: صحيح. يقسم AVG مجموع التقييمات الستة المعروفة على 6. أما هل هذا هو الرقم الصحيح للتقرير، فيعتمد على سبب غياب الأربعة الأخرى.
      - text: "يعتمد على وجود COUNT(*) في الـ query"
        why: سلوك AVG لا يعتمد على الأعمدة الأخرى في قائمة SELECT.
    answer: 2
  - q: |
      ما التسمية التي تحصل عليها تذكرة قيمة `satisfaction = 1` فيها؟
      ```sql
      CASE
        WHEN satisfaction <= 3 THEN 'neutral'
        WHEN satisfaction <= 2 THEN 'unhappy'
        ELSE 'happy'
      END
      ```
    options:
      - text: "'neutral'"
        why: صحيح. يتوقف CASE عند أول فرع قيمته TRUE، و`1 <= 3` قيمته TRUE، فلا يُوصَل إلى فرع 'unhappy' أبدًا. رتّب WHEN من الأكثر تحديدًا إلى الأقل.
      - text: "'unhappy'"
        why: كان سيحدث هذا لو كانت فروع WHEN بالترتيب المعاكس. CASE لا يبحث عن أفضل تطابق، بل عن أول تطابق فقط.
      - text: "'happy'"
        why: ELSE لا يُطبَّق إلا حين لا يكون أي WHEN قيمته TRUE، والأول قيمته TRUE.
    answer: 0
  - q: أي تعبير يحسب `refunds / orders` بأمان حين يمكن أن تكون `orders` صفرًا؟
    options:
      - text: "`refunds / orders`"
        why: في SQLite تعيد القسمة على صفر NULL بدل خطأ، لكن محرّكات أخرى مثل PostgreSQL ترمي خطأً، كما أن النيّة لا تظهر لمن يقرأ الكود.
      - text: "`COALESCE(refunds / orders, 0)`"
        why: هذا يحوّل «لا يمكن الحساب» إلى 0، فيعرض نسبةً لا مقام لها على أنها صفر حقيقي.
      - text: "`refunds / NULLIF(orders, 0)`"
        why: صحيح. NULLIF يحوّل المقام الصفري إلى NULL، فتكون النتيجة NULL («لا بيانات») في كل المحرّكات، وهذا صادق وقابل للنقل.
    answer: 2
---

ترسل جوليا فيشر، مسؤولة دعم العملاء، سؤالين: «كم تذكرة ما زالت مفتوحة؟ وما متوسط تقييم الرضا لدينا؟». الإجابتان تعتمدان على القيمة نفسها، وهي القيمة التي تسبّب أرقامًا خاطئة في التحليل أكثر من أي قيمة أخرى: `NULL`.

في `support_tickets` تكون قيمة `closed_at` هي NULL ما دامت التذكرة مفتوحة، وتكون `satisfaction` هي NULL حين لا يقيّم العميل الخدمة. NULL لا تعني صفرًا ولا نصًا فارغًا، بل تعني *غير معروف*.

## «غير معروف» قيمة معدية

جرّب أن تجد التذاكر المفتوحة كما تجد أي شيء آخر:

```sql run
SELECT COUNT(*) AS open_tickets
FROM support_tickets
WHERE closed_at = NULL;
```

صفر. هل `closed_at` يساوي NULL؟ إجابة SQL هي «غير معروف»، لأن مقارنة أي شيء بقيمة غير معروفة تعطي نتيجة غير معروفة، حتى `NULL = NULL`. وWHERE لا يُبقي الصف إلا حين يكون شرطه TRUE، وليس حين يكون غير معروف. لاختبار القيم المفقودة صياغة خاصة:

```sql run
SELECT COUNT(*) AS open_tickets
FROM support_tickets
WHERE closed_at IS NULL;
```

56 تذكرة مفتوحة. هذا هو المنطق ثلاثي القيم: كل شرط إمّا TRUE أو FALSE أو NULL. ويتبع AND وOR الجدولين أدناه. القاعدة العامة: NULL تغلب، إلا إذا حسم الطرف الآخر الإجابة وحده (FALSE مع AND، وTRUE مع OR).

:::figure المنطق ثلاثي القيم: ما يعيده AND وOR حين يكون أحد الطرفين NULL
<svg viewBox="0 0 720 220" role="img" aria-labelledby="t1">
  <title id="t1">جدولا الحقيقة لـ AND وOR على القيم TRUE وFALSE وNULL. FALSE مع AND وأي قيمة يعطي FALSE؛ وTRUE مع OR وأي قيمة يعطي TRUE؛ وكل تركيبة أخرى فيها NULL تعطي NULL.</title>
  <text class="d-label-strong" x="70" y="63" text-anchor="middle">AND</text>
  <text class="d-label-muted" x="150" y="63" text-anchor="middle">TRUE</text>
  <text class="d-label-muted" x="70" y="99" text-anchor="middle">TRUE</text>
  <text class="d-label-muted" x="230" y="63" text-anchor="middle">FALSE</text>
  <text class="d-label-muted" x="70" y="135" text-anchor="middle">FALSE</text>
  <text class="d-label-muted" x="310" y="63" text-anchor="middle">NULL</text>
  <text class="d-label-muted" x="70" y="171" text-anchor="middle">NULL</text>
  <rect class="d-box-success" x="112" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="150" y="99" text-anchor="middle">TRUE</text>
  <rect class="d-box" x="192" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="230" y="99" text-anchor="middle">FALSE</text>
  <rect class="d-box-warn" x="272" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="310" y="99" text-anchor="middle">NULL</text>
  <rect class="d-box" x="112" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="150" y="135" text-anchor="middle">FALSE</text>
  <rect class="d-box" x="192" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="230" y="135" text-anchor="middle">FALSE</text>
  <rect class="d-box" x="272" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="310" y="135" text-anchor="middle">FALSE</text>
  <rect class="d-box-warn" x="112" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="150" y="171" text-anchor="middle">NULL</text>
  <rect class="d-box" x="192" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="230" y="171" text-anchor="middle">FALSE</text>
  <rect class="d-box-warn" x="272" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="310" y="171" text-anchor="middle">NULL</text>
  <text class="d-label-strong" x="420" y="63" text-anchor="middle">OR</text>
  <text class="d-label-muted" x="500" y="63" text-anchor="middle">TRUE</text>
  <text class="d-label-muted" x="420" y="99" text-anchor="middle">TRUE</text>
  <text class="d-label-muted" x="580" y="63" text-anchor="middle">FALSE</text>
  <text class="d-label-muted" x="420" y="135" text-anchor="middle">FALSE</text>
  <text class="d-label-muted" x="660" y="63" text-anchor="middle">NULL</text>
  <text class="d-label-muted" x="420" y="171" text-anchor="middle">NULL</text>
  <rect class="d-box-success" x="462" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="500" y="99" text-anchor="middle">TRUE</text>
  <rect class="d-box-success" x="542" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="580" y="99" text-anchor="middle">TRUE</text>
  <rect class="d-box-success" x="622" y="78" width="76" height="32" rx="6"/>
  <text class="d-code" x="660" y="99" text-anchor="middle">TRUE</text>
  <rect class="d-box-success" x="462" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="500" y="135" text-anchor="middle">TRUE</text>
  <rect class="d-box" x="542" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="580" y="135" text-anchor="middle">FALSE</text>
  <rect class="d-box-warn" x="622" y="114" width="76" height="32" rx="6"/>
  <text class="d-code" x="660" y="135" text-anchor="middle">NULL</text>
  <rect class="d-box-success" x="462" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="500" y="171" text-anchor="middle">TRUE</text>
  <rect class="d-box-warn" x="542" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="580" y="171" text-anchor="middle">NULL</text>
  <rect class="d-box-warn" x="622" y="150" width="76" height="32" rx="6"/>
  <text class="d-code" x="660" y="171" text-anchor="middle">NULL</text>
  <text class="d-label-muted" x="360" y="210" text-anchor="middle">يُبقي WHERE الصف فقط حين يكون الشرط كله TRUE</text>
</svg>
:::

## حيث تُسقط NULL الصفوف بصمت

الحالة الخطرة ليست `= NULL`، فهي لا تعيد شيئًا ويلاحظها الجميع. الخطر في شرط «لا يساوي» على عمود فيه قيم NULL:

```sql run
SELECT
  (SELECT COUNT(*) FROM orders WHERE coupon_code <> 'BLACKFRIDAY25') AS with_not_equal,
  (SELECT COUNT(*) FROM orders WHERE coupon_code IS DISTINCT FROM 'BLACKFRIDAY25') AS null_safe;
```

264 مقابل 1,942. «الطلبات التي لم تستخدم BLACKFRIDAY25» تشمل بديهيًا الطلبات الـ 1,678 التي بلا كوبون أصلًا، لكن `<>` أسقطها كلها. يعامل `IS DISTINCT FROM` قيمة NULL كقيمة قابلة للمقارنة، فهو النسخة الآمنة مع NULL من `<>`. يقبل SQLite أيضًا الصيغة الأقصر `IS NOT 'BLACKFRIDAY25'`؛ أما PostgreSQL فلا يقبل إلا `IS DISTINCT FROM`.

:::mistake NOT IN مع NULL في القائمة
`2 NOT IN (1, NULL)` قيمته NULL لا TRUE، لأن SQL لا يستطيع أن يستبعد احتمال أن تكون القيمة المجهولة هي 2. لذا فإن `NOT IN (subquery)` الذي يعيد الـ subquery فيه قيمة NULL واحدة **لا يُبقي أي صف على الإطلاق**. ستقابل هذا فعليًا في درس الـ anti-join؛ أما الآن فتذكّر أن `NOT IN` والأعمدة التي تقبل NULL لا يجتمعان.
:::

## NULL في دوال التجميع

دوال التجميع تتخطّى قيم NULL، وهذا ما تريده عادةً، لكن يستحق أن تصرّح به دائمًا:

```sql run
SELECT
  COUNT(*)                     AS tickets,
  COUNT(satisfaction)          AS rated,
  ROUND(AVG(satisfaction), 2)  AS avg_score,
  ROUND(AVG(COALESCE(satisfaction, 0)), 2) AS wrong_avg
FROM support_tickets;
```

`COUNT(*)` يعدّ الصفوف (873)؛ و`COUNT(satisfaction)` يعدّ القيم المعروفة (588). ويقسم `AVG` على عدد القيم المعروفة، فيعطي 3.74. أما استبدال NULL بصفر باستخدام `COALESCE` فيهبط بالمتوسط إلى 2.52، مخترعًا 285 عميلًا غاضبًا لم يقولوا شيئًا أصلًا. أبلغ جوليا بالرقم 3.74 *ومعه* معدل الاستجابة، 588 من 873: المتوسط المحسوب على ثلثي التذاكر يجب أن يقول ذلك صراحة.

`COALESCE(a, b, ...)` يعيد أول وسيط قيمته ليست NULL، وهو مناسب للقيم الافتراضية عند العرض، مثل `COALESCE(coupon_code, 'none')`. وصورته المعكوسة هي `NULLIF(a, b)`، الذي يعيد NULL حين يكون `a = b`. القسمة على `NULLIF(denominator, 0)` تعطي NULL بدل خطأ القسمة على صفر في المحرّكات التي ترمي هذا الخطأ.

## قرّر ما تعنيه كل NULL

NULL علامة واحدة لعدة حالات مختلفة، والتعامل الصحيح معها يعتمد على الحالة التي أمامك. في Cartwheel وحدها:

- `closed_at` قيمته NULL لأن الحدث **لم يقع بعد**. احسب هذه التذاكر مفتوحة، واستبعدها من أوقات الحل.
- `satisfaction` قيمته NULL لأن العميل **لم يُجب**. اعرض معدل الاستجابة بجانب المتوسط.
- `coupon_code` قيمته NULL لأن الطلب **بلا كوبون**. هنا تعني NULL فعلًا «لا شيء»، فـ `COALESCE(coupon_code, 'none')` تسمية عادلة.
- `referred_by` قيمته NULL لأن العميل **لم تتم إحالته**، أو لأن أحدًا لم يسجّل الإحالة. لا يمكنك أن تعرف أيّ الاحتمالين، ويجب أن تقول ذلك.

تؤثّر NULL في الترتيب أيضًا. يضع SQLite قيم NULL أولًا في الترتيب التصاعدي وأخيرًا في التنازلي؛ وPostgreSQL يفعل العكس. إذا كان موضعها مهمًا، فصرّح به بـ `ORDER BY satisfaction NULLS LAST`، الذي يقبله المحرّكان.

## CASE: تسميات من المنطق

تريد جوليا أيضًا حالة مقروءة لكل تذكرة؛ وهذا تمرينك. وإليك الأداة نفسها على الطلبات، تصنّف طريقة تسعير كل طلب. يقيّم `CASE` شروط WHEN من الأعلى إلى الأسفل ويعيد أول تطابق:

```sql run
SELECT
  order_id,
  coupon_code,
  shipping_fee,
  CASE
    WHEN coupon_code IS NULL AND shipping_fee = 0 THEN 'free shipping only'
    WHEN coupon_code IS NULL THEN 'full price'
    WHEN coupon_code = 'FREESHIP' THEN 'coupon: shipping'
    ELSE 'coupon: discount'
  END AS price_type
FROM orders
ORDER BY order_id
LIMIT 6;
```

قاعدتان تجعلان CASE موثوقًا. رتّب فروع WHEN من الأكثر تحديدًا إلى الأعم، لأن أول فرع قيمته TRUE يفوز ولا يُفحص الباقي. واكتب ELSE عن قصد: بدونه تحصل الصفوف غير المطابقة على NULL، وتنتقل هذه القيمة إلى كل ما يأتي بعدها. لدى SQLite أيضًا `IIF(condition, a, b)` للاختيار بين احتمالين، لكن CASE هو SQL القياسي ويعمل في كل محرّك.

القيم المفقودة مصدر واحد للمفاجآت؛ والتواريخ هي المصدر الآخر، وهي موضوعنا التالي.
