---
summary: لخّص البيانات بحسب المجموعة باستخدام groupby، واحسب عدة إحصاءات مسمّاة دفعة واحدة باستخدام agg، واختر بشكل صحيح بين size و count، وبين نتيجة مفهرسة ونتيجة مسطّحة.
takeaways:
  - يقسم التجميع (`groupby`) الصفوف إلى مجموعات بحسب مفتاح، ويطبّق حسابًا على كل مجموعة، ويضمّ النتائج في جدول واحد.
  - "الحسابات التجميعية المسمّاة، `agg(revenue=(\"revenue\", \"sum\"), lines=(\"order_item_id\", \"count\"))`، تمنح كل عمود ناتج اسمًا واضحًا."
  - "`size()` تعدّ الصفوف في كل مجموعة؛ و`count()` تعدّ القيم غير المفقودة في عمود، فيختلفان حين يكون في العمود فجوات."
  - التجميع بعدة مفاتيح يعطيك MultiIndex؛ و`as_index=False` أو `reset_index()` تعيدان المفاتيح أعمدة عادية.
  - تحقّق من أن نتائج المجموعات تعود فتساوي المجموع الكلي، كي تعرف أنه لم يضِع صف ولم يُحسب مرتين.
further:
  - title: "Group by: split-apply-combine"
    url: https://pandas.pydata.org/docs/user_guide/groupby.html
  - title: pandas.core.groupby.DataFrameGroupBy.agg
    url: https://pandas.pydata.org/docs/reference/api/pandas.core.groupby.DataFrameGroupBy.agg.html
quiz:
  - q: "تعطي `orders.groupby(\"channel\")[\"coupon_code\"].count()` القيمة 208 للويب، لكن `orders.groupby(\"channel\").size()` تعطي 1,146. لماذا؟"
    options:
      - text: إحداهما تستبعد الطلبات الملغاة.
        why: لا يصفّي أيٌّ من الاستدعاءين بحسب الحالة؛ كلاهما يرى كل الصفوف.
      - text: "`count()` تعدّ أكواد الكوبونات غير المفقودة فقط، بينما تعدّ `size()` كل صف في المجموعة."
        why: صحيح. 208 طلبات ويب استخدمت كوبونًا؛ و1,146 طلب ويب موجود. استخدم `size()` لعدّ الصفوف و`count()` لعدّ القيم الموجودة.
      - text: "`count()` تعدّ أكواد الكوبونات المختلفة."
        why: القيم المختلفة تعدّها `nunique()`. أما `count()` فتعدّ كل قيمة غير مفقودة، والمكرّرة منها.
      - text: "`size()` تحسب الطلبات التي فيها عدة عناصر مرتين."
        why: في `orders` صف واحد لكل طلب، فلا يوجد ما يُحسب مرتين.
    answer: 1
  - q: أيّ استدعاء يعيد صفًا لكل طلب بعمودين اسمهما `revenue` و`lines`؟
    options:
      - text: "`items.groupby(\"order_id\").agg(revenue=(\"revenue\", \"sum\"), lines=(\"order_item_id\", \"count\"))`"
        why: صحيح. كل كلمة مفتاحية تصبح عمودًا ناتجًا، معرَّفًا بزوج (عمود، دالة).
      - text: "`items.groupby(\"order_id\")[\"revenue\", \"order_item_id\"].sum()`"
        why: اختيار عدة أعمدة يحتاج قائمة (أقواس مزدوجة)، وحتى عندها تحصل على مجموعين بالأسماء الأصلية، لا على عدد.
      - text: "`items.agg(revenue=(\"revenue\", \"sum\"), lines=(\"order_item_id\", \"count\"))`"
        why: بدون `groupby` يجمّع هذا الجدول كله في مجاميع مفردة، لا صفًا لكل طلب.
    answer: 0
  - q: جمّعت `items` بحسب الطلب وجمعت الإيراد، ثم جمعت تلك النتيجة. المجموع الكلي أعلى بنسبة 3% من `items["revenue"].sum()`. ما التفسير الأرجح؟
    options:
      - text: الـ groupby تقرّب القيم إلى الأعلى دائمًا.
        why: لا تقرّب الـ groupby شيئًا؛ مجاميع المجموعات تساوي المجموع الكلي تمامًا، باستثناء ضوضاء الأعداد العشرية.
      - text: أسقطت الـ groupby الطلبات ذات المفاتيح المفقودة.
        why: إسقاط الصفوف ذات المفاتيح المفقودة سيجعل المجموع المجمَّع أقل لا أعلى.
      - text: خطأ في حساب الأعداد العشرية.
        why: خطأ الأعداد العشرية يكون نحو المنزلة العشرية الثانية عشرة، ولا يصل أبدًا إلى 3%.
      - text: الجدول الذي جمّعته ليس الجدول الذي تظنه؛ مثلًا، رُبط بجدول آخر كرّر الصفوف.
        why: صحيح. التجميع لا يخترع أموالًا، فالمجموع الأعلى يعني أن المُدخل فيه صفوف زائدة. يبيّن الدرس 4.2 كيف تسبّب عمليات الدمج هذا بالضبط.
    answer: 3
---

"ما متوسط قيمة الطلب لدينا؟" يبدو رقمًا واحدًا، لكن `order_items` ليس فيه عمود لقيمة الطلب: الطلب الذي فيه أربعة منتجات له أربعة صفوف. تحتاج أولًا صفًا واحدًا لكل طلب، يُجمع فيه إيراد الطلب من بنوده. و"الإيراد لكل منتج" و"الطلبات لكل قناة" و"المبيعات لكل دولة" أسئلة لها الشكل نفسه. في جدول البيانات كنت ستبني جدولًا محوريًا؛ وفي pandas تستخدم التجميع (`groupby`)، الـ method التي ستستدعيها أكثر من أي method أخرى.

## التقسيم، والتطبيق، وضمّ النتائج

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])

by_product = items.groupby("product_id")["revenue"].sum()
print(by_product.sort_values(ascending=False).head(3).round(2))
print(round(by_product.sum(), 2), round(items["revenue"].sum(), 2))
```

اقرأ السطر الأوسط كثلاث خطوات. **قسّم** الصفوف إلى مجموعات، واحدة لكل `product_id`. **طبّق** حسابًا، `sum`، على عمود `revenue` في كل مجموعة. **ضُمّ** النتائج في Series فهرسها مفتاح المجموعة. المنتج 21، Standing Desk، حقّق 60,017.83 دولارًا، أي نحو ضعف المنتج الذي يليه.

السطر الأخير عادة تستحق أن تنسخها: مجاميع المجموعات تساوي المجموع الكلي. إذا لم تتساوَ، فهناك صفوف ضاعت (مثل الصفوف التي مفتاحها `NaN`، والتي تُسقطها `groupby` افتراضيًا) أو تكرّرت قبل أن تجمّع.

:::figure تقسم groupby الصفوف بحسب المفتاح، وتطبّق دالة على كل مجموعة، وتضمّ النتائج
<svg viewBox="0 0 700 240" role="img" aria-labelledby="t1">
  <title id="t1">ستة بنود طلبات بمفاتيح A و A و B و A و C و C. يجمعها التقسيم في ثلاثة صناديق بحسب المفتاح. ويجمع التطبيق الإيراد في كل صندوق. ويُنتج الضمّ نتيجة من ثلاثة صفوف: A و B و C مع مجاميعها.</title>
  <text class="d-label-strong" x="80" y="24" text-anchor="middle">الصفوف</text>
  <rect class="d-box" x="20" y="36" width="120" height="26" rx="5"/><text class="d-code" x="80" y="54" text-anchor="middle">A  88.20</text>
  <rect class="d-box" x="20" y="66" width="120" height="26" rx="5"/><text class="d-code" x="80" y="84" text-anchor="middle">A  33.60</text>
  <rect class="d-box" x="20" y="96" width="120" height="26" rx="5"/><text class="d-code" x="80" y="114" text-anchor="middle">B  19.95</text>
  <rect class="d-box" x="20" y="126" width="120" height="26" rx="5"/><text class="d-code" x="80" y="144" text-anchor="middle">A 270.90</text>
  <rect class="d-box" x="20" y="156" width="120" height="26" rx="5"/><text class="d-code" x="80" y="174" text-anchor="middle">C  96.60</text>
  <rect class="d-box" x="20" y="186" width="120" height="26" rx="5"/><text class="d-code" x="80" y="204" text-anchor="middle">C  96.60</text>
  <path class="d-arrow" d="M150 120 L190 120" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="290" y="24" text-anchor="middle">التقسيم</text>
  <rect class="d-box-primary" x="200" y="36" width="180" height="58" rx="8"/><text class="d-label" x="290" y="70" text-anchor="middle">A: ثلاثة صفوف</text>
  <rect class="d-box-accent" x="200" y="102" width="180" height="40" rx="8"/><text class="d-label" x="290" y="127" text-anchor="middle">B: صف واحد</text>
  <rect class="d-box-success" x="200" y="150" width="180" height="58" rx="8"/><text class="d-label" x="290" y="184" text-anchor="middle">C: صفّان</text>
  <path class="d-arrow" d="M390 120 L430 120" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="490" y="24" text-anchor="middle">تطبيق sum</text>
  <text class="d-code" x="490" y="70" text-anchor="middle">392.70</text>
  <text class="d-code" x="490" y="127" text-anchor="middle">19.95</text>
  <text class="d-code" x="490" y="184" text-anchor="middle">193.20</text>
  <path class="d-arrow" d="M545 120 L575 120" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="635" y="24" text-anchor="middle">الضمّ</text>
  <rect class="d-box" x="585" y="60" width="100" height="120" rx="8"/>
  <text class="d-code" x="635" y="92" text-anchor="middle">A 392.70</text>
  <text class="d-code" x="635" y="124" text-anchor="middle">B  19.95</text>
  <text class="d-code" x="635" y="156" text-anchor="middle">C 193.20</text>
</svg>
:::

## عدة إحصاءات دفعة واحدة: الحسابات التجميعية المسمّاة

رقم واحد لكل مجموعة نادرًا ما يكفي. تحسب `agg` مع **الحسابات التجميعية المسمّاة (named aggregation)** عدة أرقام، وتسمّي كل عمود ناتج:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])

per_order = items.groupby("order_id").agg(
    revenue=("revenue", "sum"),
    lines=("order_item_id", "count"),
    units=("quantity", "sum"),
    max_discount=("discount", "max"),
)
print(per_order.head().round(2))
print(per_order.shape, "| average order value:", round(per_order["revenue"].mean(), 2))
```

كل كلمة مفتاحية عمود ناتج، وكل قيمة زوج: (عمود المُدخل، الدالة). تُعطى الدوال بأسمائها كنصوص: `"sum"` و`"mean"` و`"median"` و`"min"` و`"max"` و`"count"` و`"size"` و`"nunique"` و`"first"` و`"last"` و`"std"`. للنتيجة صف لكل طلب، 2,066 صفًا، ومتوسط قيمة الطلب (AOV) هو 228.43 دولارًا، عبر كل الحالات، والإلغاءات منها، حتى الآن.

سترى أيضًا الأسلوب الأقدم `agg({"revenue": "sum", "discount": "max"})`، أو `agg(["sum", "mean"])` على عمود واحد. إنهما يعملان، لكنهما يعيدان استخدام أسماء المُدخلات، فينتهي جدول فيه إحصاءان للعمود نفسه بعناوين مربكة. أما الحسابات التجميعية المسمّاة فتقول بالضبط ما هو كل عمود.

## الفرق بين size و count

طريقتان للعدّ، وتجيبان عن سؤالين مختلفين:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
print(orders.groupby("channel").size())                   # rows per group
print(orders.groupby("channel")["coupon_code"].count())   # non-missing coupons per group
```

تعدّ `size()` الصفوف: 1,146 طلب ويب. وتعدّ `count()` القيم غير المفقودة في عمود: 208 من طلبات الويب تلك فيها كود كوبون. استخدم `size` (أو `count` على عمود لا يُفقد أبدًا، مثل المعرّف) لسؤال "كم عددها"، و`count` لسؤال "كم منها له قيمة".

:::mistake عدّ الشيء الخطأ
"الطلبات لكل عميل" المحسوبة على `order_items` باستخدام `size()` تعدّ **البنود** لا الطلبات: الطلب الذي فيه أربعة منتجات يُعدّ أربع مرات. إما أن تجمّع جدولًا فيه صف واحد لكل طلب، وإما أن تعدّ المعرّفات المختلفة بـ `("order_id", "nunique")`. قبل أن تجمّع، قل ماذا يمثّل الصف الواحد.
:::

## عدة مفاتيح ونتائج مسطّحة

جمّع بقائمة أعمدة لتقاطع بُعدين. للنتيجة فهرس من مستويين (**MultiIndex**)، وتنشر `unstack()` المستوى الداخلي إلى أعمدة، فيُقرأ كجدول محوري:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
by_channel_status = orders.groupby(["channel", "status"]).size()
print(by_channel_status.head(4))
print(by_channel_status.unstack())

flat = orders.groupby("channel", as_index=False).agg(
    orders=("order_id", "count"),
    avg_fee=("shipping_fee", "mean"),
)
print(flat.round(2))
```

تُبقي `as_index=False` مفاتيح المجموعات أعمدة عادية بدلًا من نقلها إلى الفهرس، وهذا مفيد حين تغذّي النتيجة عملية دمج أو رسمًا بيانيًا أو تصدير CSV. وتفعل `reset_index()` الشيء نفسه لاحقًا على نتيجة مفهرسة.

## نتائج المجموعة على كل صف: transform

أحيانًا تريد رقم المجموعة بجانب كل صف بدلًا من صف لكل مجموعة. سؤال "ما الحصة التي يمثّلها كل بند من طلبه؟" يحتاج أن يعرف كل بند مجموع طلبه. تجري `transform` حساب المجموعة نفسه، لكنها تعيد نتيجة محاذية للصفوف الأصلية:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
items["order_revenue"] = items.groupby("order_id")["revenue"].transform("sum")
items["share_of_order"] = items["revenue"] / items["order_revenue"]
print(items[["order_id", "revenue", "order_revenue", "share_of_order"]].head(5).round(3))
```

للطلب 1001 أربعة بنود، وبند Burr Coffee Grinder يحمل 62% من قيمته. القاعدة العملية: `agg` حين تريد جدول ملخّص، و`transform` حين تريد عمودًا جديدًا في الجدول التفصيلي.

:::tip تجميع عمود من نوع category
إذا حوّلت عمودًا إلى `category` (الدرس 3.2)، فمرّر `observed=True` إلى `groupby`. إنها تحتفظ فقط بالفئات التي تظهر فعلًا، وتُسكت التحذير الذي تطبعه pandas 2 عن تغيّر القيمة الافتراضية.
:::

يبني التمرين جدول "صف لكل طلب" الذي ستستخدمه من الآن فصاعدًا. وفي الدرس التالي تدمجه مع `orders` و`customers`، لأن الأسئلة المهمة، مثل "الإيراد بحسب الدولة، دون الإلغاءات"، تحتاج أعمدة من أكثر من جدول.
