---
summary: اربط الجداول بـ INNER JOIN وLEFT JOIN على المفاتيح الصحيحة، وحدّد الجدول لكل عمود يتكرّر اسمه، واحتفظ بالصفوف غير المطابقة بوضع شروط الجدول الأيمن في عبارة ON.
takeaways:
  - الـ INNER JOIN لا يُبقي إلا الصفوف المتطابقة في الجانبين؛ والـ LEFT JOIN يُبقي كل صف من الجدول الأيسر ويملأ أعمدة الجانب الأيمن غير المطابقة بـ NULL.
  - أعطِ كل جدول اسمًا مستعارًا قصيرًا وانسب إليه كل عمود، خاصةً الأسماء الموجودة في أكثر من جدول مثل unit_price.
  - الشرط على الجدول الأيمن في LEFT JOIN مكانه عبارة ON؛ أما في WHERE فيحذف صفوف NULL ويعيد الـ JOIN إلى inner join.
  - بعد LEFT JOIN اعدد عمودًا من الجدول الأيمن لا *، حتى تُحسب الصفوف غير المطابقة 0 لا 1.
further:
  - title: SQLite SELECT, the FROM clause and joins
    url: https://www.sqlite.org/lang_select.html#fromclause
  - title: PostgreSQL tutorial on joins between tables
    url: https://www.postgresql.org/docs/current/tutorial-join.html
quiz:
  - q: "في `orders` يوجد 2,066 صفًا وفي `order_items` يوجد 3,991. لكل طلب عنصر واحد على الأقل. كم صفًا يعيد `orders o JOIN order_items oi ON oi.order_id = o.order_id`؟"
    options:
      - text: "2,066، صف لكل طلب"
        why: الطلب الذي فيه ثلاثة عناصر يطابق ثلاثة صفوف عناصر، فيظهر ثلاث مرات. يأخذ الـ JOIN مستوى تفصيل جانب «المتعدد».
      - text: "6,057، الجدولان مكدّسان فوق بعضهما"
        why: تكديس الصفوف هو UNION ALL. أما الـ JOIN فيضع الأعمدة جنبًا إلى جنب للصفوف المتطابقة.
      - text: "8,245,406، كل تركيبة ممكنة"
        why: هذا cross join، وهو ما تحصل عليه إن نسيت شرط ON.
      - text: "3,991، صف لكل عنصر طلب"
        why: صحيح. كل عنصر يطابق طلبًا واحدًا بالضبط، فيكون في النتيجة صف لكل عنصر، مع تكرار أعمدة الطلب.
    answer: 3
  - q: |
      يُفترض أن يعرض هذا كل عميل في المملكة المتحدة مع عدد طلباته من الـ marketplace، بما فيها الصفر. لماذا يختفي العملاء الذين ليس لديهم طلبات من الـ marketplace؟
      ```sql
      SELECT c.customer_id, COUNT(o.order_id) AS marketplace_orders
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.customer_id
      WHERE c.country = 'United Kingdom'
        AND o.channel = 'marketplace'
      GROUP BY c.customer_id;
      ```
    options:
      - text: "يجب أن يكون `COUNT(o.order_id)` هو `COUNT(*)`."
        why: تعبير العدّ ليس المشكلة؛ العملاء المفقودون لا يصلون إلى GROUP BY أصلًا.
      - text: اختبار `o.channel` قيمته NULL للعملاء الذين ليس لهم طلب مطابق، فيحذفهم WHERE.
        why: صحيح. انقل `AND o.channel = 'marketplace'` إلى عبارة ON؛ ويبقى اختبار الدولة في WHERE لأنه يخص الجدول الأيسر.
      - text: الـ LEFT JOIN لا يُبقي إلا الصفوف غير المطابقة من الجدول الأيمن.
        why: العكس هو الصحيح. يحتفظ الـ LEFT JOIN بكل صف من الجدول الأيسر، وهو هنا `customers`.
    answer: 1
  - q: "يفشل `SELECT unit_price FROM order_items oi JOIN products p ON p.product_id = oi.product_id`. لماذا؟"
    options:
      - text: "`unit_price` موجود في الجدولين، فالاسم ملتبس."
        why: صحيح. اكتب `oi.unit_price` (السعر المدفوع) أو `p.unit_price` (سعر القائمة). وهما رقمان مختلفان بعد رفع الأسعار في مارس 2025.
      - text: لا يمكنك اختيار عمود استُخدم في JOIN.
        why: يمكن اختيار أي عمود؛ ومفتاح الـ JOIN ليس طرفًا هنا أصلًا.
      - text: الأسماء المستعارة يجب أن تُعرَّف بـ AS.
        why: AS اختيارية للأسماء المستعارة للجداول في SQLite وPostgreSQL.
    answer: 0
  - q: بعد `employees e LEFT JOIN support_tickets t ON t.agent_id = e.employee_id`، أي تعبير يعطي 0 تذاكر للموظفين الذين لم يتولّوا أي تذكرة؟
    options:
      - text: "`COUNT(*)`"
        why: الموظف غير المطابق ما زال ينتج صفًا واحدًا (بأعمدة تذاكر قيمتها NULL)، فيعيد COUNT(*) القيمة 1.
      - text: "`COUNT(e.employee_id)`"
        why: معرّف الموظف ليس NULL أبدًا، فهذا أيضًا يعدّ الصف غير المطابق 1.
      - text: "`COUNT(t.ticket_id)`"
        why: صحيح. معرّف التذكرة قيمته NULL في الصف غير المطابق، وCOUNT يتخطّى NULL.
      - text: "`SUM(t.ticket_id)`"
        why: هذا يجمع أرقام المعرّفات، وهو بلا معنى، ويعيد NULL للموظفين غير المطابقين.
    answer: 2
---

يسأل كريم من المالية: «كم كان إيرادنا في 2025 حسب فئة المنتج؟». الإيراد موجود في `order_items`، والسنة في `orders`، واسم الفئة في `categories`، على بُعد خطوتين عبر `products`. لا يوجد جدول واحد يجيب عن السؤال. الـ JOIN يجمعها معًا، وضبطه يدور في معظمه حول معرفة الصفوف التي يُبقيها كل JOIN.

## تتبّع المفاتيح

كل JOIN يحتاج إلى شرط يقول أيّ الصفوف تنتمي إلى بعضها، وهو في الغالب مفتاح: `order_items.order_id` يشير إلى `orders.order_id`، و`order_items.product_id` إلى `products.product_id`، وهكذا. في Cartwheel يُحسب الإيراد من كل الطلبات ما عدا الملغاة.

```sql run
SELECT
  c.name AS category,
  COUNT(DISTINCT o.order_id) AS orders,
  ROUND(SUM(oi.quantity * oi.unit_price * (1 - oi.discount)), 2) AS revenue
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.order_id
JOIN products    AS p  ON p.product_id = oi.product_id
JOIN categories  AS c  ON c.category_id = p.category_id
WHERE o.status <> 'cancelled'
  AND o.order_date >= '2025-01-01'
  AND o.order_date <  '2026-01-01'
GROUP BY c.name
ORDER BY revenue DESC;
```

تتصدّر Desks & Chairs بنحو 77,000. لكن صفّين يبدوان غريبين: "Kitchen" و"Outdoor" فئتان في المستوى الأعلى، ويُفترض أن تقع المنتجات في فئات فرعية. احتفظ بهذه الملاحظة؛ إنها اكتشاف في جودة البيانات ستتعقّبه في القسم 4.

عادتان تجعلان الـ queries التي فيها JOIN مقروءة وآمنة. الأسماء المستعارة القصيرة (`o`، `oi`، `p`، `c`) تُبقي الأسطر قصيرة. ونسبة كل عمود إلى اسمه المستعار تزيل التخمين، وهذا مهم هنا: `order_items.unit_price` هو السعر المدفوع يوم الطلب، و`products.unit_price` هو سعر القائمة اليوم. كتابة `unit_price` بلا نسبة في هذا الـ query تعطي خطأ "ambiguous column name"، واختيار العمود الخطأ يغيّر الإيراد بصمت.

و`COUNT(DISTINCT o.order_id)` مقصود أيضًا. بعد ربط العناصر، يظهر كل طلب مرة لكل سطر عنصر، فيعدّ `COUNT(*)` السطور. وهذا التكرار هو موضوع الدرس التالي.

## INNER مقابل LEFT

`JOIN` تعني `INNER JOIN`: لا يبقى الصف إلا إذا وجد تطابقًا في الجانب الآخر. هذا صحيح للإيراد، حيث لا معنى لعنصر بلا طلب. لكنه خاطئ حين يكون السؤال عن *كل ما في جانب واحد*، بما في ذلك ما ليس له تطابق.

تطلب جوليا عدد التذاكر لكل موظف في العمليات، «بما في ذلك من لا يتولّون التذاكر، حتى أرى من يمكنه المساعدة في موسم الذروة»:

```sql run
SELECT
  e.employee_id,
  e.first_name,
  e.title,
  COUNT(t.ticket_id) AS tickets
FROM employees AS e
LEFT JOIN support_tickets AS t
  ON t.agent_id = e.employee_id
WHERE e.department = 'Operations'
GROUP BY e.employee_id
ORDER BY tickets DESC;
```

ثمانية صفوف. لدى كل واحد من الوكلاء الأربعة نحو 200 تذكرة؛ ولدى مارك وسمير وبن وآدم صفر. يُبقي الـ `LEFT JOIN` كل صف من الجدول الأيسر، وهو هنا `employees`، وحيث لا تطابقه أي تذكرة تكون أعمدة التذاكر NULL. يتخطّى `COUNT(t.ticket_id)` هذه القيم، ولهذا يظهر لغير الوكلاء 0 لا 1.

:::figure الـ INNER JOIN يُبقي المتطابقات؛ والـ LEFT JOIN يُبقي أيضًا صفوف اليسار غير المطابقة
<svg viewBox="0 0 720 230" role="img" aria-labelledby="t1">
  <title id="t1">على اليسار الموظفون جوليا وتوم ومارك؛ وعلى اليمين التذكرتان t1 وt2 اللتان تولّتهما جوليا وt3 التي تولّاها توم. نتيجة الـ inner join فيها ثلاثة صفوف. ونتيجة الـ left join فيها الصفوف الثلاثة نفسها إضافةً إلى مارك بتذكرة قيمتها NULL.</title>
  <text class="d-label-strong" x="85" y="28" text-anchor="middle">employees</text>
  <rect class="d-box" x="20" y="40" width="130" height="34" rx="6"/>
  <text class="d-label" x="85" y="62" text-anchor="middle">6 Julia</text>
  <rect class="d-box" x="20" y="84" width="130" height="34" rx="6"/>
  <text class="d-label" x="85" y="106" text-anchor="middle">8 Tom</text>
  <rect class="d-box-warn" x="20" y="128" width="130" height="34" rx="6"/>
  <text class="d-label" x="85" y="150" text-anchor="middle">2 Mark</text>
  <text class="d-label-strong" x="285" y="28" text-anchor="middle">tickets</text>
  <rect class="d-box" x="220" y="40" width="130" height="34" rx="6"/>
  <text class="d-code" x="285" y="62" text-anchor="middle">t1 agent 6</text>
  <rect class="d-box" x="220" y="84" width="130" height="34" rx="6"/>
  <text class="d-code" x="285" y="106" text-anchor="middle">t2 agent 6</text>
  <rect class="d-box" x="220" y="128" width="130" height="34" rx="6"/>
  <text class="d-code" x="285" y="150" text-anchor="middle">t3 agent 8</text>
  <path class="d-line" d="M150 57 L220 57"/>
  <path class="d-line" d="M150 57 L220 101"/>
  <path class="d-line" d="M150 101 L220 145"/>
  <text class="d-label-strong" x="490" y="28" text-anchor="middle">INNER</text>
  <rect class="d-box-success" x="430" y="40" width="120" height="34" rx="6"/>
  <text class="d-code" x="490" y="62" text-anchor="middle">Julia t1</text>
  <rect class="d-box-success" x="430" y="84" width="120" height="34" rx="6"/>
  <text class="d-code" x="490" y="106" text-anchor="middle">Julia t2</text>
  <rect class="d-box-success" x="430" y="128" width="120" height="34" rx="6"/>
  <text class="d-code" x="490" y="150" text-anchor="middle">Tom t3</text>
  <text class="d-label-strong" x="640" y="28" text-anchor="middle">LEFT</text>
  <rect class="d-box-success" x="580" y="40" width="120" height="34" rx="6"/>
  <text class="d-code" x="640" y="62" text-anchor="middle">Julia t1</text>
  <rect class="d-box-success" x="580" y="84" width="120" height="34" rx="6"/>
  <text class="d-code" x="640" y="106" text-anchor="middle">Julia t2</text>
  <rect class="d-box-success" x="580" y="128" width="120" height="34" rx="6"/>
  <text class="d-code" x="640" y="150" text-anchor="middle">Tom t3</text>
  <rect class="d-box-warn" x="580" y="172" width="120" height="34" rx="6"/>
  <text class="d-code" x="640" y="194" text-anchor="middle">Mark NULL</text>
</svg>
:::

## ON مقابل WHERE في الـ LEFT JOIN

الآن تضيّق جوليا الطلب: «القائمة نفسها، لكن اعدد التذاكر العاجلة فقط». التعديل البديهي يضيف `AND t.priority = 'urgent'` إلى عبارة WHERE، فيختفي غير الوكلاء الأربعة. صفوفهم فيها `t.priority` قيمته NULL، فيكون الشرط NULL، ويحذفهم WHERE. الشرط على الجدول الأيمن في WHERE يعيد الـ LEFT JOIN إلى INNER JOIN.

مكان هذا الشرط هو عبارة `ON`، حيث يحدّد أي التذاكر *تتطابق*، لا أي الصفوف *تبقى*:

```sql run
SELECT
  e.first_name,
  COUNT(t.ticket_id) AS urgent_tickets
FROM employees AS e
LEFT JOIN support_tickets AS t
  ON t.agent_id = e.employee_id
 AND t.priority = 'urgent'
WHERE e.department = 'Operations'
GROUP BY e.employee_id
ORDER BY urgent_tickets DESC;
```

ثمانية صفوف من جديد، والأصفار في أماكنها. القاعدة: الشروط على الجدول **الأيسر** في WHERE؛ والشروط على الجدول **الأيمن** في ON.

## اختيار الـ JOIN، والجدول الذي تبدأ منه

طريقة موثوقة للقرار: ابدأ `FROM` بالجدول الذي تريد صفوفه في الإجابة، أي الجدول الذي يطابق مستوى التفصيل الذي كتبته. ثم اسأل عن كل جدول آخر: «هل هذه المعلومة إلزامية أم اختيارية؟». المعلومة الإلزامية تأخذ inner join، لأن الصف الذي يفتقدها لا مكان له في الإجابة. والمعلومة الاختيارية تأخذ LEFT JOIN، حتى تظهر التطابقات المفقودة كقيم NULL يمكنك عدّها أو تسميتها أو تحويلها إلى أصفار.

في قائمة جوليا تدور الإجابة حول الموظفين، فيأتي `employees` أولًا، والتذاكر اختيارية. وفي إيراد كريم تدور الإجابة حول المبيعات، فكل جدول في السلسلة إلزامي.

يدعم SQLite أيضًا `RIGHT JOIN` و`FULL OUTER JOIN` (منذ الإصدار 3.39)، وPostgreSQL يدعمهما منذ عقود. نادرًا ما ستحتاج إليهما: الـ right join هو left join مع تبديل الجدولين، ومعظم الفرق تكتب كل شيء بـ LEFT JOIN حتى تُقرأ الـ queries بالطريقة نفسها، من الأعلى إلى الأسفل، من الجدول الرئيسي نحو الخارج.

أخيرًا، افحص عدد الصفوف بعد كل JOIN تضيفه. إذا كان في `employees` بعد تصفيته على العمليات 8 صفوف، فيجب أن يعيد الـ LEFT JOIN مع GROUP BY ثمانية أيضًا. الرقم الذي يكبر أو يصغر على غير المتوقع يخبرك أن JOIN ما يفعل شيئًا لم تقصده.

:::mistake نسيان شرط الـ JOIN
`FROM orders o JOIN order_items oi` بلا `ON` صياغة مقبولة في SQLite. إنها تقرن كل طلب بكل عنصر، فتنتج أكثر من ثمانية ملايين صف، وتصبح كل المجاميع هراءً. إذا كان query فيه JOIN بطيئًا ومجاميعه هائلة، فابحث أولًا عن ON مفقود أو خاطئ.
:::

كان في إيراد الفئات فخ آخر لم يُصبنا، لأن الإيراد كان في الجدول الأكثر تفصيلًا. حين يقع الرقم في الجانب *الأقل* تفصيلًا من الـ JOIN، تتضخّم المجاميع. وهذا هو موضوعنا التالي.
