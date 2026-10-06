---
summary: رتّب العملاء بحسب الإنفاق، وقِس مدى تركّز الإيراد، وحوّل رقمًا متصلًا إلى شرائح باستخدام cut (حدود ثابتة) و qcut (مجموعات متساوية الحجم).
takeaways:
  - "`rank(ascending=False, method=\"min\")` ترقّم الصفوف بحسب القيمة؛ و`method` تحدّد طريقة ترقيم المتعادلين، و`pct=True` تعطي ترتيبًا مئينيًا."
  - "تضع `pd.cut` القيم في فئات بحدود تختارها أنت؛ استخدم `np.inf` حدًّا أخيرًا كي لا تقع أي قيمة خارجها."
  - "تصنع `pd.qcut` فئات فيها أعداد متساوية (تقريبًا) من الصفوف، مثل الرُّبيعات (quartiles)؛ وحين تتعادل قيم كثيرة، مرّر `duplicates=\"drop\"`."
  - كلتاهما تعيد عمودًا فئويًا (categorical)، فجمّع بحسبه مع `observed=True` ورتّب بحسب ترتيب الفئات لا أبجديًا.
  - رقم التركّز، مثل "أعلى 20% من العملاء يجلبون 55% من الإيراد"، كثيرًا ما يكون أنفع رقم مفرد تستطيع تقديمه للعمل.
further:
  - title: pandas.cut
    url: https://pandas.pydata.org/docs/reference/api/pandas.cut.html
  - title: pandas.qcut
    url: https://pandas.pydata.org/docs/reference/api/pandas.qcut.html
  - title: pandas.Series.rank
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.rank.html
quiz:
  - q: "تترك `pd.cut(spend, bins=[0, 250, 500, 1000])` بعض العملاء بقيمة `NaN`. مَن هم؟"
    options:
      - text: العملاء الذين أنفقوا 250 بالضبط
        why: مع القيمة الافتراضية `right=True` تقع 250 في الفئة `(0, 250]`، فتحصل على تسمية.
      - text: العملاء الذين أنفقوا أكثر من 1,000
        why: صحيح. القيم التي تتجاوز الحد الأخير لا تنتمي إلى أي فئة. اختم الحدود بـ `np.inf` لتلتقط كل شيء.
      - text: العملاء الذين إنفاقهم صغير جدًا، مثل 18 دولارًا
        why: تقع 18 داخل `(0, 250]`. وحده إنفاق قدره 0 بالضبط سيقع خارجها، لأن الحد الأيسر مستبعَد.
      - text: العملاء الذين قدّموا طلبًا واحدًا فقط
        why: لا تنظر `cut` إلا إلى القيم التي تمرّرها، وهي هنا الإنفاق؛ ولا دور لعدد الطلبات.
    answer: 1
  - q: تريد أربع مجموعات من العملاء في كل منها العدد نفسه من العملاء. أيّ أداة تناسب؟
    options:
      - text: "`pd.cut(spend, 4)`"
        why: الرقم الصحيح في `bins` مع `cut` يصنع أربعة نطاقات متساوية **العرض**، وهذا مع إنفاق ملتوٍ يضع معظم العملاء في الفئة الأولى.
      - text: "`spend.rank(pct=True)`"
        why: الترتيب المئيني خطوة في الاتجاه الصحيح، لكنه أرقام، لا أربع مجموعات مسمّاة.
      - text: "`pd.qcut(spend, 4)`"
        why: صحيح. تقطع `qcut` عند الرُّبيعات، فتحمل كل مجموعة نحو ربع العملاء.
    answer: 2
  - q: "يتعادل عميلان على المركز الثاني بحسب الإنفاق. مع `rank(ascending=False, method=\"min\")`، ما الترتيب الذي يحصلان عليه هما والعميل التالي؟"
    options:
      - text: 2 و2 و4
        why: صحيح. تعطي `min` الصفوف المتعادلة أدنى ترتيب في المجموعة، ويقفز الترتيب التالي ليأخذ التعادل في الحسبان، مثل ترتيب الفرق الرياضية.
      - text: 2 و3 و4
        why: هذا ما تفعله `method="first"`، التي تكسر التعادل بحسب ترتيب ظهور الصفوف.
      - text: 2 و2 و3
        why: هذا ما تفعله `method="dense"`، التي لا تترك فجوات بعد التعادل أبدًا.
      - text: 2.5 و2.5 و4
        why: هذا ما تفعله القيمة الافتراضية `method="average"`، التي تعطي الصفوف المتعادلة متوسط المراتب التي تشغلها.
    answer: 0
---

"مَن أفضل عملائنا؟" سؤال يطرحه كل فريق مبيعات أو تسويق، والإجابة الصادقة لها جزءان: قائمة مرتّبة، وكم يهم أعلى تلك القائمة. في Cartwheel الإجابة لافتة، وهي تشكّل طريقة قراءتك لكل رقم إيراد، ومنها قفزة الربع الرابع.

## صف لكل عميل

ابدأ بجدول على مستوى العميل: صف لكل عميل، مع الطلبات والإنفاق، مبني بالتجميع (groupby) من الدرس 4.1.

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

cust = orders.groupby("customer_id").agg(orders=("order_id", "count"), spend=("revenue", "sum"))
print(len(cust), "customers with a non-cancelled order")
print(cust["spend"].describe().round(0))
```

503 عملاء. بلغ الوسيط 551 دولارًا، والمتوسط 888، والأعلى 5,370. حين يقع المتوسط فوق الوسيط بكثير، فهناك قيم كبيرة قليلة تسحبه إلى الأعلى؛ ويعود الدرس 5.1 إلى ما يعنيه ذلك عند الإبلاغ عن المتوسطات.

## الترتيب

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
cust = orders.groupby("customer_id").agg(orders=("order_id", "count"), spend=("revenue", "sum"))

cust["rank"] = cust["spend"].rank(ascending=False, method="min")
cust["percentile"] = cust["spend"].rank(pct=True)
print(cust.sort_values("rank").head(5).round(2))

top20 = cust.nlargest(int(len(cust) * 0.2), "spend")
print(len(top20), "customers =", round(top20["spend"].sum() / cust["spend"].sum(), 3), "of revenue")
```

تعطي `rank` كل صف مرتبته، و1 لأعلى إنفاق بسبب `ascending=False`. والتعادل هو حيث تختلف الطرق: `"min"` تعطي العملاء المتعادلين المرتبة نفسها وتقفز فوق الأرقام التالية، مثل جدول الدوري، و`"dense"` لا تقفز أبدًا، و`"first"` تكسر التعادل بحسب ترتيب الصفوف، والقيمة الافتراضية `"average"` تعطيهم متوسط المراتب. وتحوّل `pct=True` المراتب إلى مئينات بين 0 و1، تصلح للمقارنة بين مجموعات مختلفة الأحجام.

السطر الأخير هو رقم التركّز: أعلى 100 عميل، أي خُمس القاعدة، يحقّقون 55.5% من الإيراد. هذا أقل تطرّفًا من قاعدة 80/20 المعروفة في الكتب، لكنه ما زال يعني أن خسارة حفنة من العملاء الكبار ستؤلم أكثر من خسارة مئة عميل صغير.

### الترتيب داخل المجموعات

مديرو الدول يريدون أفضل عملائهم هم، لا قائمة عالمية تزاحم فيها الأسواق الكبرى الجميع. تعمل `rank` على عمود مجمَّع أيضًا، فتبدأ من 1 من جديد داخل كل مجموعة:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
customers = pd.read_csv("customers.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
cust = orders.groupby("customer_id", as_index=False).agg(spend=("revenue", "sum"))
cust = cust.merge(customers[["customer_id", "country"]], on="customer_id", validate="one_to_one")

cust["rank_in_country"] = cust.groupby("country")["spend"].rank(ascending=False, method="first")
print(cust[cust["rank_in_country"] == 1].sort_values("spend", ascending=False).round(0))
```

التصفية على `rank_in_country == 1` تحتفظ بأعلى منفق في كل دولة، ثمانية صفوف إجمالًا؛ والاحتفاظ بالمراتب 3 أو أقل سيعطي قائمة أعلى ثلاثة لكل دولة. تضمن `method="first"` صفًا واحدًا بالضبط لكل مرتبة حتى حين يتعادل عميلان، وهذا ما تريده لقائمة ثابتة الطول. ونمط "رتّب داخل المجموعة ثم صفِّ" هذا يجيب عن عائلة كاملة من الأسئلة: المنتج الأكثر مبيعًا في كل فئة، وأول طلب لكل عميل، وآخر تذكرة لكل طلب.

## cut: فئات بحدود تختارها أنت

يريد التسويق نطاقات إنفاق يستطيع تسميتها في حملة. أنت تختار الحدود:

```python run
import numpy as np
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
cust = orders.groupby("customer_id").agg(orders=("order_id", "count"), spend=("revenue", "sum"))

cust["band"] = pd.cut(cust["spend"], bins=[0, 250, 500, 1000, 2000, np.inf],
                      labels=["<250", "250-500", "500-1k", "1k-2k", "2k+"])
print(cust.groupby("band", observed=True)["spend"].agg(["count", "sum"]).round(0))
```

كل زوج من الحدود يعرّف فئة، مغلقة من اليمين افتراضيًا: `(250, 500]` تشمل 500 ولا تشمل 250. والعملاء الـ 57 في النطاق `2k+`، أي 11% من القاعدة، جلبوا 173,407 دولارات، أكثر من أي نطاق آخر. تعيد `cut` عمودًا **فئويًا (categorical)** تحافظ فئاته على ترتيبك، فيسرد الجدول النطاقات من الأصغر إلى الأكبر لا أبجديًا.

:::mistake نسيان الحدود الخارجية
الحدود `[0, 250, 500, 1000]` تترك بصمت كل عميل فوق 1,000 بقيمة `NaN`، والحد الأيسر يستبعد 0 نفسه. اختم القائمة بـ `np.inf` (وابدأها تحت أدنى قيمة لديك، أو مرّر `include_lowest=True`)، ثم تأكّد بـ `band.isna().sum() == 0`.
:::

## qcut: مجموعات متساوية الحجم

حين تريد مجموعات متساوية الحجم بدلًا من حدود ثابتة، تقطع `qcut` عند المئينات (quantiles):

:::figure تستخدم cut حدودًا ثابتة؛ وتستخدم qcut أعدادًا متساوية
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">الصف العلوي: تقسم cut محور الإنفاق عند القيم الثابتة 250 و 500 و 1000 و 2000؛ والفئات تحمل أعدادًا مختلفة من العملاء. الصف السفلي: تقسم qcut عند الرُّبيعات 210 و 551 و 1236، فتحمل كل فئة من الفئات الأربع نحو 126 عميلًا.</title>
  <text class="d-label-strong" x="20" y="40">cut</text>
  <rect class="d-box-accent" x="80" y="20" width="120" height="36" rx="4"/><text class="d-label" x="140" y="43" text-anchor="middle">143</text>
  <rect class="d-box-accent" x="205" y="20" width="80" height="36" rx="4"/><text class="d-label" x="245" y="43" text-anchor="middle">92</text>
  <rect class="d-box-accent" x="290" y="20" width="110" height="36" rx="4"/><text class="d-label" x="345" y="43" text-anchor="middle">118</text>
  <rect class="d-box-accent" x="405" y="20" width="90" height="36" rx="4"/><text class="d-label" x="450" y="43" text-anchor="middle">93</text>
  <rect class="d-box-accent" x="500" y="20" width="60" height="36" rx="4"/><text class="d-label" x="530" y="43" text-anchor="middle">57</text>
  <text class="d-label-muted" x="590" y="43">عميلًا</text>
  <text class="d-label-strong" x="20" y="130">qcut</text>
  <rect class="d-box-success" x="80" y="110" width="118" height="36" rx="4"/><text class="d-label" x="139" y="133" text-anchor="middle">126</text>
  <rect class="d-box-success" x="203" y="110" width="118" height="36" rx="4"/><text class="d-label" x="262" y="133" text-anchor="middle">126</text>
  <rect class="d-box-success" x="326" y="110" width="118" height="36" rx="4"/><text class="d-label" x="385" y="133" text-anchor="middle">125</text>
  <rect class="d-box-success" x="449" y="110" width="118" height="36" rx="4"/><text class="d-label" x="508" y="133" text-anchor="middle">126</text>
  <text class="d-code" x="200" y="172" text-anchor="middle">210</text>
  <text class="d-code" x="323" y="172" text-anchor="middle">551</text>
  <text class="d-code" x="446" y="172" text-anchor="middle">1236</text>
  <text class="d-label-muted" x="600" y="172">حدود الرُّبيعات</text>
</svg>
:::

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
cust = orders.groupby("customer_id").agg(orders=("order_id", "count"), spend=("revenue", "sum"))

cust["quartile"] = pd.qcut(cust["spend"], q=4, labels=["Q1 low", "Q2", "Q3", "Q4 high"])
share = cust.groupby("quartile", observed=True)["spend"].sum() / cust["spend"].sum()
print(share.round(3))
print(pd.qcut(cust["orders"], q=4, duplicates="drop").value_counts().sort_index())
```

الرُّبيع الأعلى من العملاء يجلب 63.2% من الإيراد، والرُّبيع الأدنى 2.8%. ويبيّن السطر الأخير حدود `qcut`: ثلث العملاء قدّموا طلبًا واحدًا بالضبط، فيكون أدنى حدّين للرُّبيعات كلاهما 1، وتُطلق `qcut` العادية الخطأ `ValueError: Bin edges must be unique`. تدمج `duplicates="drop"` الحدود المكرّرة، فتبقى مجموعات أقل وغير متساوية. وللأعداد التي فيها تعادلات كثيرة، تكون `cut` مع حدود تختارها بيدك أوضح عادةً.

:::tip سمِّ القاعدة لا الفئة فقط
"Q4 high" تعني شيئًا مختلفًا في كل مرة تتغيّر فيها البيانات، لأن حدود الرُّبيعات تتحرّك. أما "أنفق أكثر من 1,236 دولارًا في 2024 و2025" فلا تتغيّر. حين تُستخدم شريحة خارج الـ notebook الخاص بك، اكتب حدودها. والأمر نفسه ينطبق على الفترة: نطاق العميل في جدول من سنتين ليس نطاقه في ربع واحد.
:::

في التمرين تقسّم العملاء إلى شرائح بنفسك. وبهذا تكتمل عُدّة التحليل؛ ويوجّهها القسم 5 نحو أسئلة حقيقية، بدءًا بما يستطيع المتوسط أن يخبرك به وما لا يستطيع.
