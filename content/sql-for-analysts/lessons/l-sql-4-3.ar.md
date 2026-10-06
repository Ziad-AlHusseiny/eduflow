---
summary: نسّق الـ queries بحيث يستطيع المراجع فحصها بسرعة، وانقل عادات SQLite التي تعلّمتها في هذه الدورة إلى PostgreSQL بمعرفة مواضع الاختلاف في التواريخ والقيم المنطقية وLIKE وقواعد التجميع.
takeaways:
  - الـ SQL المقروء يستخدم JOIN ... ON صريحًا، وعمودًا واحدًا في كل سطر، وأسماء مستعارة حسب الأدوار، وخطوات CTE مسمّاة، وتعليقات تشرح لماذا لا ماذا.
  - احذف ما لا يستخدمه الـ query، مثل عمليات الربط غير المستخدمة وSELECT *، لأن كل جدول إضافي احتمال fan-out وسؤال على المراجع.
  - التعامل مع التواريخ هو أكبر فرق بين SQLite وPostgreSQL؛ فـ strftime وjulianday تصبحان date_trunc وto_char وفترات زمنية (intervals) وأنواع تاريخ حقيقية.
  - SQLite أكثر تساهلًا من PostgreSQL (الأعمدة المجرّدة، وLIKE غير الحسّاس لحالة الأحرف، والقيم المنطقية كـ 0/1)، فقد يفشل query يعمل في SQLite أو يتصرّف بشكل مختلف في PostgreSQL.
further:
  - title: SQLite quirks, caveats and gotchas
    url: https://www.sqlite.org/quirks.html
  - title: PostgreSQL date/time functions and operators
    url: https://www.postgresql.org/docs/current/functions-datetime.html
  - title: PostgreSQL pattern matching (LIKE and ILIKE)
    url: https://www.postgresql.org/docs/current/functions-matching.html
quiz:
  - q: "تظهر العبارة `FROM support_tickets t, customers c WHERE t.customer_id = c.customer_id` في query لا يستخدم أي عمود من `c.` إطلاقًا. ماذا يجب أن يطلب المراجع؟"
    options:
      - text: أعِد كتابتها كـ LEFT JOIN حتى لا تضيع أي تذكرة.
        why: تغيير نوع الـ JOIN يُبقي الجدول غير المستخدم؛ المشكلة في وجوده أصلًا.
      - text: احذف جدول العملاء؛ فهو لا يضيف شيئًا سوى مصدر محتمل لـ fan-out أو لفقدان صفوف.
        why: صحيح. كل جدول في FROM شيء يجب على القارئ التفكير فيه. إذا لم يُستخدم أي عمود منه ولم يكن يصفّي عن قصد، فاحذفه.
      - text: أضف DISTINCT إلى الـ SELECT احتياطًا.
        why: DISTINCT يغطّي التكرار بدل إزالة سببه، وقد يدمج هنا أيضًا صفوفًا حقيقية.
      - text: لا شيء؛ الربط بالفاصلة SQL قياسي ولا بأس بإبقائه.
        why: الربط بالفاصلة مقبول، لكنه يخفي شرط الربط في WHERE، حيث يسهل نسيانه. الصيغة المقروءة هي JOIN ... ON الصريح.
    answer: 1
  - q: أي تعبير في SQLite له مقابل مباشر في PostgreSQL هو `date_trunc('month', order_date)`؟
    options:
      - text: "`julianday(order_date)`"
        why: تحوّل julianday التاريخ إلى رقم يوم؛ ولا تقتطعه إلى الشهر.
      - text: "`strftime('%w', order_date)`"
        why: هذا رقم يوم الأسبوع، لا بداية الشهر.
      - text: "`date(order_date, '+1 month')`"
        why: هذا يضيف شهرًا؛ ومقابله في PostgreSQL هو `order_date + INTERVAL '1 month'`.
      - text: "`date(order_date, 'start of month')`"
        why: صحيح. كلاهما يعيد اليوم الأول من شهر الطلب. يعيد PostgreSQL قيمة timestamp، ويعيد SQLite نصًا بالصيغة 'YYYY-MM-01'.
    answer: 3
  - q: "هذا يعمل في SQLite: `SELECT channel, status, COUNT(*) FROM orders GROUP BY channel`. ماذا يحدث في PostgreSQL؟"
    options:
      - text: يفشل، لأن `status` ليس ضمن التجميع ولا داخل دالة تجميع.
        why: صحيح. يفرض PostgreSQL قاعدة GROUP BY التي يتساهل فيها SQLite، فيصبح خطأ العمود المجرّد خطأً لا يمكن أن يفوتك.
      - text: يعيد النتيجة نفسها التي يعيدها SQLite.
        why: يرفض PostgreSQL اختيار قيمة اعتباطية لعمود مجرّد.
      - text: يعيد صفًا لكل قناة وحالة.
        why: هذا يحتاج إلى `GROUP BY channel, status`؛ ولا يضيف PostgreSQL أعمدة التجميع نيابةً عنك.
    answer: 0
  - q: "يجد `WHERE email LIKE '%@EXAMPLE.COM'` كل العملاء الـ 600 في SQLite. كم عميلًا يجد في PostgreSQL، حيث تُخزَّن عناوين البريد بأحرف صغيرة؟"
    options:
      - text: "600، فـ LIKE يتصرّف بالطريقة نفسها في كل مكان"
        why: حساسية LIKE لحالة الأحرف من أكثر فروق اللهجات شيوعًا.
      - text: خطأ، لأن LIKE يحتاج إلى ILIKE في PostgreSQL
        why: لدى PostgreSQL المعامل LIKE أيضًا؛ لكنه حسّاس لحالة الأحرف ببساطة.
      - text: "0، لأن LIKE في PostgreSQL حسّاس لحالة الأحرف؛ استخدم ILIKE أو قارن LOWER(email)"
        why: صحيح. LIKE في SQLite يتجاهل حالة الأحرف الإنجليزية افتراضيًا، أما في PostgreSQL فلا. وILIKE هو النسخة غير الحسّاسة لحالة الأحرف في PostgreSQL.
    answer: 2
---

يارا، المحلّلة الأقدم في فريقك، تراجع كل query قبل أن يصل إلى صاحب الطلب. نادرًا ما يكون تعليقها الأول على عمل المحلّلين الجدد عن المنطق. إنه «لا أستطيع فحص هذا بسرعة». أما تعليقها الثاني هذا الربع فعملي: Cartwheel تنقل تقاريرها إلى مستودع بيانات على PostgreSQL، وكل query كتبته يجب أن ينجو من هذا الانتقال. يغطي هذا الدرس الأمرين: SQL يستطيع المراجعون قراءته، وSQL ينتقل بين المحرّكات.

## query على شخص آخر أن يفحصه

هذا query حقيقي من لوحة المعلومات القديمة لفريق الدعم. إنه يعمل ويعيد أرقامًا معقولة:

```sql run
select t.channel,count(*),avg(satisfaction) from support_tickets t,customers c where t.customer_id=c.customer_id and closed_at is not null and opened_at>='2025-01-01' group by 1 order by 3 desc;
```

على المراجع أن يجتهد ليجيب عن أسئلة أساسية. لماذا `customers` هنا؟ (إنه غير مستخدم؛ بقي من نسخة سابقة، وهو الآن JOIN على أحدهم أن يفكّر فيه.) هل هذا شرط ربط أم شرط تصفية؟ إلى أي جدول ينتمي `satisfaction`؟ ما العمود 3؟ هل ينقص شرط 2025 حدٌّ أعلى أم أن ذلك مقصود؟ وهذا التحليل نفسه مكتوبًا ليُفحص:

```sql run
-- Support satisfaction by contact channel, tickets opened in 2025.
-- grain: one row per channel. Only closed tickets: open ones can't be rated yet.
SELECT
  t.channel,
  COUNT(*)                      AS closed_tickets,
  COUNT(t.satisfaction)         AS rated,
  ROUND(AVG(t.satisfaction), 2) AS avg_satisfaction
FROM support_tickets AS t
WHERE t.closed_at IS NOT NULL
  AND t.opened_at >= '2025-01-01'
  AND t.opened_at <  '2026-01-01'
GROUP BY t.channel
ORDER BY avg_satisfaction DESC;
```

التغييرات، مرتّبة حسب أهميتها:

1. **احذف ما لا يُستخدم.** اختفى الـ JOIN غير المستخدم. كل جدول في FROM احتمال fan-out أو شرط تصفية متنكّر، فعليه أن يستحق مكانه.
2. **ربط صريح.** حين تربط فعلًا، اكتب `JOIN ... ON`، ولا تكتب أبدًا فاصلة مع شرط في WHERE. عندها يقع شرط الربط بجانب الجدول الذي ينتمي إليه.
3. **الأسماء بدل المواضع.** لكل عمود في النتيجة اسم، ويستخدمه ORDER BY. `GROUP BY 1` تسهيل مختلَف عليه؛ أما الأسماء فتصمد أمام تعديلات قائمة SELECT.
4. **عمود واحد في كل سطر، منسوب إلى اسم مستعار حسب الدور.** فتصبح الفروق في مراجعة الكود سطرًا واحدًا لكل تغيير.
5. **تعليقات تقول لماذا.** يذكر التعليق في رأس الـ query السؤال ومستوى التفصيل؛ و«التذاكر المغلقة فقط» تشرح قرارًا. لا تعلّق على *ما* يقوله الـ SQL بوضوح.
6. **اعرض المقام.** يقع `rated` بجانب المتوسط، وهو درس معدل الاستجابة من القسم 1.

الكلمات المفتاحية بأحرف كبيرة، والفواصل في بداية السطر أو نهايته، وعرض المسافات البادئة، كلها أعراف فريق. اختر واحدًا، وطبّقه في كل مكان، ودع أداة تنسيق تفرضه. الاتساق أهم بكثير من الأسلوب الذي يفوز.

:::tip ابنِ الـ queries الطويلة كخطوات CTE
لأي شيء أطول من شاشة واحدة، اكتب CTE لكل خطوة منطقية، وضع تعليق `-- grain:` على كلٍّ منها، وأبقِ الـ SELECT الأخير قصيرًا. عندها يستطيع المراجع تشغيل كل خطوة وحدها، تمامًا كما فعلت أنت أثناء كتابتها.
:::

## من SQLite إلى PostgreSQL

SQL معيار، لكن لكل محرّك دواله الخاصة ودرجة تساهله الخاصة. كل ما في هذه الدورة في الغالب يعمل دون تغيير في PostgreSQL: الـ JOIN، والـ CTEs، والـ CTEs التكرارية، ودوال النافذة، و`FILTER`، و`NULLIF`، و`COALESCE`، و`IS DISTINCT FROM`. وتتجمّع الفروق في مواضع قليلة:

| المهمة | SQLite | PostgreSQL |
|---|---|---|
| تسمية الشهر | `strftime('%Y-%m', d)` | `to_char(d, 'YYYY-MM')` |
| بداية الشهر | `date(d, 'start of month')` | `date_trunc('month', d)` |
| إضافة فترة زمنية | `date(d, '+7 days')` | `d + INTERVAL '7 days'` |
| الساعات بين لحظتين | `(julianday(b) - julianday(a)) * 24` | `EXTRACT(EPOCH FROM b - a) / 3600` |
| مطابقة غير حسّاسة لحالة الأحرف | `LIKE` (ASCII) | `ILIKE` |
| الاختيار بين احتمالين | `IIF(c, a, b)` أو `CASE` | `CASE` |
| عدّ شرط | `SUM(cond)` أو `FILTER` | `COUNT(*) FILTER (WHERE cond)` |

التغيير الأكبر يقع تحت الجدول. لدى PostgreSQL نوعا `date` و`timestamp` حقيقيان، فتُقارَن أعمدة التاريخ كتواريخ، وتعيد العمليات الحسابية على التواريخ فترات زمنية (intervals) لا أرقامًا. والقيم المنطقية نوع حقيقي أيضًا: `SUM(status = 'cancelled')` يفشل هناك لأنك لا تستطيع جمع قيمة منطقية، ولهذا يكون FILTER هو الخيار القابل للنقل.

:::mistake الثقة بتساهل SQLite
يقبل SQLite الأعمدة المجرّدة في queries التجميع، ويطابق `LIKE` دون اعتبار لحالة الأحرف، ويسمح لك بمقارنة النص بالأرقام. أما PostgreSQL فيرفض كل حالة من هذه أو يتصرّف فيها بشكل مختلف. هذا خبر جيد في معظمه، لأن المحرّك الصارم يحوّل الأخطاء الصامتة إلى أخطاء ظاهرة. لكنه يعني أن «نُفّذ في SQLite» لا يعني «إنه صحيح». إذا اعتمد query على سلوك متساهل، فأعِد كتابته صراحةً: أضف العمود إلى GROUP BY، واستخدم `LOWER()` في الطرفين، وحوّل الأنواع عن قصد.
:::

فرقان أصغر يوقعان الناس باستمرار. القسمة الصحيحة تقتطع الكسور في المحرّكين (`7 / 2` تساوي 3)، فاستمر في كتابة `100.0 *` للنسب المئوية. ويضع PostgreSQL قيم NULL أخيرًا في الترتيب التصاعدي بينما يضعها SQLite أولًا، فأضف `NULLS FIRST` أو `NULLS LAST` كلما كان موضع NULL مهمًا.

التمرين مهمة نقل حقيقية: query من مستودع البيانات يفشل في SQLite. بعد ذلك، يجمع المشروع الختامي الدورة كلها.
