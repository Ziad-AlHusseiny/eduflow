---
summary: أعِد تشكيل البيانات بين الصيغتين الطويلة والعريضة - pivot_table لملخّصات الجداول المتقاطعة، و crosstab للأعداد والمعدّلات، و melt لإعادة الجداول العريضة على طريقة جداول البيانات إلى جداول طويلة قابلة للتحليل.
takeaways:
  - البيانات الطويلة فيها صف لكل ملاحظة؛ والبيانات العريضة تنشر متغيّرًا واحدًا عبر الأعمدة. تحلّل pandas البيانات الطويلة أفضل، ويقرأ الناس الجداول العريضة أفضل.
  - "`pivot_table(index=..., columns=..., values=..., aggfunc=\"sum\")` تجمّع وتعيد التشكيل في خطوة واحدة، مثل الجدول المحوري في جداول البيانات."
  - "`pivot` تعيد التشكيل فقط؛ وتُطلق `ValueError: Index contains duplicate entries` حين تتشارك عدة صفوف خلية واحدة، فاستخدم `pivot_table` للبيانات الخام."
  - "`pd.crosstab(a, b, normalize=\"index\")` تحوّل عمودين إلى نِسَب مئوية لكل صف، وهي أسرع طريقة لمقارنة المعدّلات بين المجموعات."
  - "`melt(id_vars=..., var_name=..., value_name=...)` تعيد الأعمدة العريضة مثل `Q1`...`Q4` إلى صفوف."
further:
  - title: Reshaping and pivot tables
    url: https://pandas.pydata.org/docs/user_guide/reshaping.html
  - title: pandas.DataFrame.pivot_table
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.pivot_table.html
  - title: pandas.melt
    url: https://pandas.pydata.org/docs/reference/api/pandas.melt.html
quiz:
  - q: "تُطلق `sales.pivot(index=\"quarter\", columns=\"channel\", values=\"revenue\")` الخطأ `ValueError: Index contains duplicate entries, cannot reshape`. ما الإصلاح؟"
    options:
      - text: رتّب `sales` بحسب الربع أولًا.
        why: الترتيب ليس المشكلة؛ بنود كثيرة تتشارك الربع والقناة نفسيهما، وليس لدى `pivot` قاعدة لدمجها.
      - text: احذف الصفوف المكرّرة بـ `drop_duplicates()`.
        why: الصفوف بنود طلبات مختلفة، لا مكرّرات. حذفها سيمحو إيرادًا حقيقيًا.
      - text: حوّل `quarter` إلى نص.
        why: نوع المفتاح لا علاقة له؛ المشكلة هي وجود عدة قيم في الخلية الواحدة.
      - text: استخدم `pivot_table` مع `aggfunc="sum"`، التي تدمج القيم التي تقع في الخلية نفسها.
        why: صحيح. تجمّع `pivot_table` أولًا ثم تعيد التشكيل. أما `pivot` فلا تعمل إلا حين يظهر كل زوج من الفهرس والعمود مرة واحدة.
    answer: 3
  - q: "في جدول المالية الأعمدة `channel, Q1, Q2, Q3, Q4`. أيّ استدعاء يجعل صفًا لكل قناة وربع؟"
    options:
      - text: "`targets.melt(id_vars=\"channel\", var_name=\"quarter\", value_name=\"target\")`"
        why: صحيح. يبقى `channel` معرّفًا، وتصبح أعمدة الأرباع الأربعة صفوفًا، أسماؤها في `quarter` وقيمها في `target`.
      - text: "`targets.pivot_table(index=\"channel\")`"
        why: الجدول عريض أصلًا بحسب الربع؛ وإعادة التشكيل المحوري لن تنقل أعمدة الأرباع إلى صفوف.
      - text: "`targets.T`"
        why: المنقول (transpose) يبدّل الصفوف والأعمدة، فتصبح القنوات أعمدة، وهذا ما زال عريضًا.
    answer: 0
  - q: "تعرض `pd.crosstab(sessions[\"device\"], sessions[\"purchased\"], normalize=\"index\")` القيمة 0.067 في صف mobile والعمود 1. ماذا تعني؟"
    options:
      - text: 6.7% من كل عمليات الشراء حدثت على الهاتف.
        why: هذا ما تعطيه `normalize="columns"`. أما مع `"index"` فمجموع كل صف يساوي 1.
      - text: 6.7% من جلسات الهاتف انتهت بعملية شراء.
        why: صحيح. التطبيع بحسب الفهرس يقسم كل عدد على مجموع صفّه، فتكون القيمة معدّل التحويل داخل جلسات الهاتف.
      - text: للهاتف 6.7% من كل الجلسات.
        why: حصة الجلسات بحسب الجهاز تأتي من `value_counts(normalize=True)` على `device`.
    answer: 1
---

المدير لا يريد 3,991 صفًا. يريد شبكة: القنوات على الجانب، والأرباع في الأعلى، والإيراد في الخلايا. وفريق المالية يرسل الأهداف بالطريقة نفسها، عمود لكل ربع. أما تحليلك فيعمل أفضل على الجداول الطويلة التي فيها صف لكل ملاحظة، لأن `groupby` و`merge` والتصفية كلها تتوقّع هذا الشكل. إعادة التشكيل تنقل البيانات بين الصيغتين، وهي آخر مهارة أساسية قبل أن تبدأ الإجابة عن الأسئلة بجدّية.

:::figure الصيغتان الطويلة والعريضة تحملان البيانات نفسها بشكلين مختلفين
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">على اليسار، جدول طويل بالأعمدة quarter و channel و revenue فيه ستة صفوف. سهم عنوانه pivot_table يشير إلى جدول عريض فيه الأرباع صفوفًا والقناتان web و app أعمدة. وسهم عائد عنوانه melt يشير إلى الخلف.</title>
  <text class="d-label-strong" x="130" y="24" text-anchor="middle">طويل</text>
  <rect class="d-box-primary" x="30" y="34" width="200" height="26" rx="5"/><text class="d-code" x="130" y="52" text-anchor="middle">quarter channel revenue</text>
  <rect class="d-box" x="30" y="64" width="200" height="24" rx="5"/><text class="d-code" x="130" y="81" text-anchor="middle">Q1  web   27,868</text>
  <rect class="d-box" x="30" y="92" width="200" height="24" rx="5"/><text class="d-code" x="130" y="109" text-anchor="middle">Q1  app   16,814</text>
  <rect class="d-box" x="30" y="120" width="200" height="24" rx="5"/><text class="d-code" x="130" y="137" text-anchor="middle">Q2  web   30,110</text>
  <rect class="d-box" x="30" y="148" width="200" height="24" rx="5"/><text class="d-code" x="130" y="165" text-anchor="middle">Q2  app   15,840</text>
  <text class="d-label-muted" x="130" y="196" text-anchor="middle">صف لكل ملاحظة</text>
  <path class="d-arrow" d="M250 80 L440 80" marker-end="url(#arrow)"/>
  <text class="d-code" x="345" y="70" text-anchor="middle">pivot_table</text>
  <path class="d-arrow" d="M440 140 L250 140" marker-end="url(#arrow)"/>
  <text class="d-code" x="345" y="162" text-anchor="middle">melt</text>
  <text class="d-label-strong" x="560" y="24" text-anchor="middle">عريض</text>
  <rect class="d-box-primary" x="460" y="34" width="200" height="26" rx="5"/><text class="d-code" x="560" y="52" text-anchor="middle">quarter  web    app</text>
  <rect class="d-box" x="460" y="64" width="200" height="24" rx="5"/><text class="d-code" x="560" y="81" text-anchor="middle">Q1   27,868 16,814</text>
  <rect class="d-box" x="460" y="92" width="200" height="24" rx="5"/><text class="d-code" x="560" y="109" text-anchor="middle">Q2   30,110 15,840</text>
  <text class="d-label-muted" x="560" y="196" text-anchor="middle">عمود لكل قناة</text>
</svg>
:::

## الجدول المحوري pivot_table: لخّص وأعِد التشكيل معًا

ابدأ من جدول المبيعات الذي بنيته في الدرس 4.2 (أُعيد بناؤه هنا في بضعة أسطر)، واطلب الإيراد بحسب القناة والسنة:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
sales = items.merge(orders, on="order_id", how="left", validate="many_to_one")
sales = sales[sales["status"] != "cancelled"]
sales = sales.assign(year=sales["order_date"].dt.year, quarter=sales["order_date"].dt.quarter)

table = sales.pivot_table(index="channel", columns="year", values="revenue",
                          aggfunc="sum", margins=True, margins_name="Total")
print(table.round(0))
```

كل وسيط يقابل جزءًا من الجدول المحوري (pivot table) في جداول البيانات: `index` هو الصفوف، و`columns` الأعمدة، و`values` الحقل، و`aggfunc` دالة التلخيص. تضيف `margins=True` صف المجاميع وعمودها، وهما يؤكّدان النتيجة: 446,666 دولارًا إجمالًا، وهو تعريف الإيراد من الدرس السابق. نما الإيراد في كل قناة من 2024 إلى 2025، وتضاعف الويب نحو ثلاث مرات.

`pivot_table` هي الحساب نفسه الذي تجريه `groupby(["channel", "year"])["revenue"].sum().unstack()`. استخدم `groupby` حين ستواصل الحساب، و`pivot_table` حين تكون الشبكة نفسها هي المُخرج. ولعدّ الطلبات المختلفة، غيّر دالة التجميع: `values="order_id", aggfunc="nunique"`. وتستبدل `fill_value=0` قيم `NaN` في الخلايا الفارغة حين يكون الصفر هو الإجابة الصادقة، كما في "لا مبيعات في هذه الخلية".

### من المبالغ إلى الحصص

شبكة المبالغ تستدعي السؤال التالي: كيف تغيّر **المزيج**؟ اقسم كل عمود على مجموعه، فتعرض الشبكة الحصص بدلًا من المبالغ. تعيد `by_year.sum()` مجموعًا لكل عمود، وقسمة DataFrame على تلك الـ Series تحاذي كل مجموع مع عموده بحسب التسمية، وهي قاعدة المحاذاة نفسها التي قابلتها مع Series وأخرى في الدرس 2.1. ولقسمة كل صف على مجموع صفّه بدلًا من ذلك، استخدم `by_year.div(by_year.sum(axis=1), axis=0)`.

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
sales = items.merge(orders, on="order_id", how="left", validate="many_to_one")
sales = sales[sales["status"] != "cancelled"]

by_year = sales.pivot_table(index="channel", columns=sales["order_date"].dt.year,
                            values="revenue", aggfunc="sum")
print((by_year / by_year.sum()).round(3))
```

ارتفعت حصة الويب من الإيراد من 53% في 2024 إلى 59% في 2025، بينما انخفضت حصة التطبيق من 35% إلى 31%. المبالغ تخبرك أن كل شيء نما؛ والحصص تخبرك أين تركّز النمو. أبلغ عن الاثنين، لأن كلًّا منهما يخفي ما يُظهره الآخر.

:::mistake الفرق بين pivot و pivot_table
تفشل `sales.pivot(index="quarter", columns="channel", values="revenue")` بالخطأ `ValueError: Index contains duplicate entries, cannot reshape`. `pivot` إعادة تشكيل خالصة: تتوقّع قيمة واحدة بالضبط في كل خلية، والبيانات الخام فيها المئات. استخدم `pivot_table` على البيانات الخام، واحتفظ بـ `pivot` للجداول التي فيها أصلًا صف لكل خلية.
:::

## crosstab: الأعداد والمعدّلات

لعمودين فئويين، تعدّ `pd.crosstab` التركيبات، وتحوّل `normalize` الأعداد إلى حصص. هذه زيارات موقع Cartwheel:

```python run
import pandas as pd

sessions = pd.read_csv("web_sessions.csv")
print(pd.crosstab(sessions["source"], sessions["device"]))
print(pd.crosstab(sessions["device"], sessions["purchased"], normalize="index").round(3))
```

الجدول الثاني يجيب عن سؤال حقيقي. تجعل `normalize="index"` مجموع كل صف 1، فيكون العمود `1` معدّل الشراء لكل جهاز: 12.4% من جلسات الحاسوب المكتبي تنتهي بشراء، لكن 6.7% فقط من جلسات الهاتف، مع أن الهاتف يجلب أكبر قدر من الزيارات. هذه الفجوة تستحق حديثًا مع المسؤول عن صفحة الدفع على الهاتف. اختر التطبيع بحسب السؤال: `"index"` للمعدّلات داخل كل مجموعة صفوف، و`"columns"` لتركيبة كل عمود، و`"all"` للحصص من المجموع الكلي.

## melt: من العريض إلى الطويل من جديد

تصل أهداف فريق المالية لعام 2025 كجدول بيانات، عمود لكل ربع. لمقارنتها بالإيراد الفعلي تحتاجها طويلة، صف لكل قناة وربع، كي يمكن دمجها:

```python run
import pandas as pd

targets = pd.DataFrame({
    "channel": ["marketplace", "mobile_app", "web"],
    "Q1": [5000, 15000, 28000],
    "Q2": [5000, 16000, 30000],
    "Q3": [6000, 20000, 40000],
    "Q4": [9000, 30000, 60000],
})
long = targets.melt(id_vars="channel", var_name="quarter", value_name="target")
long["quarter"] = long["quarter"].str[1].astype(int)
print(long.head(6))
print(long.shape)
```

`id_vars` هي الأعمدة التي تحدّد الصف وتبقى كما هي؛ وكل عمود آخر يصبح زوجًا من القيم في عمودين جديدين، اسم العمود القديم في `var_name` وقيمته في `value_name`. ثلاثة صفوف في أربعة أرباع تعطي اثني عشر. تأخذ `str[1]` الحرف الثاني من `"Q1"`، فيصبح الربع رقمًا يطابق `sales["quarter"]`، جاهزًا لعملية دمج مثل التي في الدرس 4.2.

:::tip أبقِ البيانات طويلة حتى الخطوة الأخيرة
نفّذ التصفية والتجميع والدمج على الجداول الطويلة، ولا تُعِد التشكيل إلى عريض إلا للعرض. الجداول العريضة التي فيها السنوات أو الأشهر أعمدة صعبة التصفية ("أيّ عمود هو 2025-Q4؟")، وتنكسر لحظة وصول فترة جديدة.
:::

في التمرين تبني شبكة الأرباع لعام 2025 وتفحص الأداء مقابل تلك الأهداف. وبعدها يأتي الزمن نفسه: إعادة التجميع الزمني، والفترات، ومعدّلات النمو.
