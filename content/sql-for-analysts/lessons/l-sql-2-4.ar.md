---
summary: اربط جدولًا بنفسه لتتبّع روابط المديرين والإحالات، واعثر على الصفوف التي لا تطابق لها باستخدام NOT EXISTS أو LEFT JOIN ... IS NULL بدل NOT IN الهشّ أمام NULL.
takeaways:
  - الـ self-join يستخدم اسمين مستعارين للجدول نفسه، واحدًا لكل دور، مثل e للموظف وm للمدير.
  - الـ semi-join (عبر EXISTS أو IN) يُبقي الصفوف التي لها تطابق واحد على الأقل دون أن يضاعفها.
  - الـ anti-join يُبقي الصفوف التي لا تطابق لها؛ اكتبه بـ NOT EXISTS أو بـ LEFT JOIN ... WHERE right_key IS NULL.
  - لا يعيد NOT IN أي صف حين يحتوي الـ subquery الخاص به على NULL، لذا تجنّبه مع الأعمدة التي تقبل NULL أو استبعد قيم NULL صراحةً.
further:
  - title: SQLite expressions, EXISTS and IN operators
    url: https://www.sqlite.org/lang_expr.html#the_exists_operator
  - title: PostgreSQL subquery expressions
    url: https://www.postgresql.org/docs/current/functions-subquery.html
quiz:
  - q: "في `employees` يوجد 24 صفًا، والمديرة التنفيذية وحدها قيمة `manager_id` لديها NULL. كم صفًا يعيد `employees e JOIN employees m ON m.employee_id = e.manager_id`؟"
    options:
      - text: "24"
        why: قيمة `manager_id` للمديرة التنفيذية NULL، فلا يجد الـ inner join لها صف مدير ويُسقطها.
      - text: "23"
        why: صحيح. كل موظف ما عدا المديرة التنفيذية يطابق مديرًا واحدًا بالضبط. استخدم LEFT JOIN لإبقائها مع مدير قيمته NULL.
      - text: "576"
        why: هذا 24 × 24، أي cross join. شرط ON يقصر كل موظف على مديره هو.
    answer: 1
  - q: بعض العملاء قيمة `referred_by` لديهم NULL. ماذا يعيد `SELECT COUNT(*) FROM customers WHERE customer_id NOT IN (SELECT referred_by FROM customers)`؟
    options:
      - text: عدد العملاء الذين لم يُحيلوا أحدًا قط.
        why: هذا هو المقصود، لكن الـ subquery يحتوي على NULL، و`x NOT IN (..., NULL)` لا يكون TRUE أبدًا.
      - text: عدد العملاء الذين أحالوا أحدًا.
        why: NOT IN يستبعد المتطابقات، فلا يمكن أن يعيد المُحيلين، ومشكلة NULL تفرغ النتيجة على أي حال.
      - text: "0"
        why: صحيح. لكل عميل تكون المقارنة مع NULL في القائمة غير معروفة، فتكون قيمة NOT IN إمّا NULL أو FALSE، ويحذف WHERE الصف.
      - text: خطأ، لأن الـ subquery يعيد قيم NULL.
        why: يسمح SQL بقيم NULL في قائمة IN؛ يعمل الـ query ويعيد 0 بصمت.
    answer: 2
  - q: أي query يعرض العملاء الذين لم يقدّموا أي طلب قط؟
    options:
      - text: "`SELECT c.* FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_id IS NULL`"
        why: صحيح. العملاء بلا طلبات يحصلون على `o.order_id` قيمته NULL؛ أما من لديهم طلبات فلا، فيُبقي اختبار IS NULL غير المشترين بالضبط.
      - text: "`SELECT c.* FROM customers c JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_id IS NULL`"
        why: الـ inner join حذف بالفعل العملاء الذين بلا طلبات، فلا يبقى شيء لتجده.
      - text: "`SELECT c.* FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.status IS NULL`"
        why: قريب، ويعمل بالمصادفة لأن `status` لا يقبل NULL، لكن اختبر مفتاح الربط؛ فعمود يقبل NULL مثل `coupon_code` سيُمرّر مشترين حقيقيين.
      - text: "`SELECT c.* FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)`"
        why: هذا هو الـ semi-join، وهو يُبقي المجموعة المعاكسة، أي العملاء الذين لديهم طلب واحد على الأقل.
    answer: 0
---

يصل طلبان في الصباح نفسه. رانيا، المديرة التنفيذية، تريد قائمة واضحة بمن يتبع لمن قبل إعادة هيكلة. وهدى تريد أن تعرف أي العملاء سجّلوا ولم يشتروا شيئًا قط. يبدوان غير مترابطين، لكن كليهما عن العلاقات بين الصفوف: الأول يتتبّع رابطًا *داخل* جدول، والثاني يبحث عن روابط *مفقودة*.

## جدول مربوط بنفسه

في `employees` يحمل `manager_id` قيمة `employee_id` لصف آخر في الجدول نفسه. لعرض كل موظف بجانب اسم مديره، تربط `employees` بنفسه. الحيلة هي اسمان مستعاران، واحد لكل دور:

```sql run
SELECT
  e.first_name || ' ' || e.last_name AS employee,
  e.title,
  m.first_name || ' ' || m.last_name AS manager
FROM employees AS e
LEFT JOIN employees AS m
  ON m.employee_id = e.manager_id
ORDER BY e.department, manager;
```

اقرأه كأنه نسختان من الجدول: `e` هو الموظف، و`m` هو من يتبع له. المعامل `||` يدمج النصوص. يُبقي الـ LEFT JOIN رانيا نفسها، وقيمة `manager_id` لديها NULL؛ أما الـ inner join فسيُسقط المديرة التنفيذية من الهيكل التنظيمي بصمت، وهذا ليس خطأً تودّ أن تشرحه لأحد.

يعمل النمط نفسه على `customers.referred_by`. من يجلب أكبر عدد من العملاء الجدد؟

```sql run
SELECT
  r.customer_id,
  r.first_name || ' ' || r.last_name AS referrer,
  COUNT(*) AS customers_referred
FROM customers AS c
JOIN customers AS r ON r.customer_id = c.referred_by
GROUP BY r.customer_id
ORDER BY customers_referred DESC, r.customer_id
LIMIT 5;
```

هنا `c` هو العميل الجديد و`r` هو المُحيل. أحال ليو إبراهيم ثلاثة أشخاص؛ ولم يُحِل أحدٌ أكثر منه. تسمية الأسماء المستعارة حسب الأدوار (`e`/`m`، `c`/`r`) بدل `a`/`b` هي ما يُبقي الـ self-joins مقروءة.

الـ self-join يتقدّم مستوى واحدًا في كل مرة: من الموظف إلى المدير. أما «كل من في فريق بيتر، على أي عمق» فيحتاج إلى query تكراري، وستكتبه في القسم التالي.

## الـ semi-join: هل يوجد تطابق؟

في الدرس الماضي وجد `WHERE order_id IN (SELECT order_id FROM support_tickets)` الطلبات التي لديها تذكرة واحدة على الأقل، دون الـ fan-out الذي يسبّبه الـ JOIN. هذا هو **الـ semi-join**. و`EXISTS` هي الصياغة الشائعة الأخرى:

```sql
SELECT c.customer_id, c.email
FROM customers AS c
WHERE EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.customer_id
);
```

هذا الـ subquery *مترابط* (correlated): يشير إلى `c` من الـ query الخارجي، فيُقيَّم لكل عميل. كتابة `SELECT 1` عُرف متّبع؛ فـ EXISTS لا يهتم إلا بعودة صف ما، لا بما فيه.

## الـ anti-join: من ليس له تطابق؟

سؤال هدى عكس ذلك: العملاء الذين **ليس** لديهم طلبات. هناك طريقتان موثوقتان لكتابة الـ anti-join. الأولى هي `NOT EXISTS`:

```sql run
SELECT
  strftime('%Y', c.signup_date) AS signup_year,
  COUNT(*) AS never_ordered
FROM customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.customer_id
)
GROUP BY signup_year;
```

85 عميلًا لم يطلبوا شيئًا قط، و52 منهم سجّلوا في 2024، أي قبل نهاية البيانات بسنة على الأقل. هذا هو الجزء الذي يمكن لهدى أن تتصرّف بناءً عليه: من سجّلوا في 2025 قد يتحوّلون إلى مشترين، أما من سجّلوا في 2024 فيحتاجون إلى حملة مختلفة.

والطريقة الثانية LEFT JOIN لا تُبقي منه إلا الصفوف غير المطابقة:

```sql run
SELECT COUNT(*) AS never_ordered
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;
```

العدد نفسه، 85. اختبر **مفتاح** الجدول الأيمن مقابل NULL، لأن المفتاح لا يكون NULL أبدًا في تطابق حقيقي. الصيغتان قياسيتان وسريعتان؛ ويفضّل معظم المحلّلين NOT EXISTS لأنه يصرّح بالنيّة ولا يمكن أن يسبّب fan-out.

:::mistake NOT IN مع عمود يقبل NULL
يسأل التسويق أي العملاء لم يُحيلوا أحدًا قط. `WHERE customer_id NOT IN (SELECT referred_by FROM customers)` يبدو مثاليًا ولا يعيد **أي صف**. معظم العملاء قيمة `referred_by` لديهم NULL، و`5 NOT IN (58, 347, NULL)` قيمته غير معروفة لا TRUE، لأن الـ NULL قد تكون 5. قيمة NULL واحدة في الـ subquery تفرغ النتيجة كلها. استخدم NOT EXISTS، أو أضف `WHERE referred_by IS NOT NULL` داخل الـ subquery إن كان لا بد من NOT IN.
:::

## الـ anti-join مع شروط

الـ anti-joins الحقيقية تحمل عادةً شرطًا: ليس «لم يطلب قط»، بل «لم يطلب *مؤخرًا*». يذهب الشرط داخل الـ subquery الخاص بـ NOT EXISTS، حيث يضيّق الطلبات التي تُعدّ تطابقًا. هؤلاء هم العملاء الذين اشتروا في 2024 ولم يشتروا شيئًا في 2025، وهي قائمة كلاسيكية بالعملاء المنقطعين:

```sql run
SELECT COUNT(DISTINCT c.customer_id) AS lapsed_customers
FROM customers AS c
JOIN orders AS o24
  ON o24.customer_id = c.customer_id
 AND o24.order_date < '2025-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o25
  WHERE o25.customer_id = c.customer_id
    AND o25.order_date >= '2025-01-01'
);
```

الربط بطلبات 2024 يسبّب fan-out (العميل الذي لديه خمسة طلبات في 2024 يظهر خمس مرات)، لذا يعدّ الـ query العملاء دون تكرار (`DISTINCT`). ووضع شرط 2025 في أي مكان خارج الـ subquery سيغيّر المعنى كليًا، وهو درس ON مقابل WHERE نفسه، لكن بمستوى أعمق.

## أيّها تستخدم

| السؤال | النمط |
|---|---|
| صفوف لها تطابق، دون تكرار | `EXISTS` أو `IN (subquery)` |
| صفوف ليس لها تطابق | `NOT EXISTS`، أو `LEFT JOIN ... WHERE key IS NULL` |
| صفوف مع تفاصيل تطابقها | `JOIN` (انتبه للـ fan-out) |
| روابط داخل جدول واحد | self-join بأسماء مستعارة تحمل أسماء الأدوار |

بهذا تكتمل أدوات الـ JOIN. يكدّس القسم التالي هذه اللبنات في تحليلات أطول، بدءًا بطريقة لتسمية النتائج الوسيطة حتى يُقرأ query من 40 سطرًا من الأعلى إلى الأسفل.
