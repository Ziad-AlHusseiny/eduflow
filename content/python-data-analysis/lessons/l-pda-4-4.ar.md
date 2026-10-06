---
summary: حوّل الطلبات ذات الطوابع الزمنية إلى سلاسل شهرية وفصلية وأسبوعية باستخدام resample، وقارن الفترات بـ pct_change، وخفّف الضوضاء بـ rolling، واستخرج أجزاء التقويم بالـ accessor المسمّى dt.
takeaways:
  - "`df.set_index(\"order_date\").resample(\"ME\")[\"revenue\"].sum()` توزّع الصفوف على الأشهر التقويمية؛ و`\"QE\"` و`\"W\"` و`\"D\"` تعطي الأرباع والأسابيع والأيام."
  - في pandas 2.2 وما بعدها، تكتب `resample` نهايات الأشهر والأرباع `"ME"` و`"QE"`؛ أما الاسمان القديمان `"M"` و`"Q"` فمُهمَلان (deprecated) هناك، بينما تحتفظ الفترات مثل `to_period("M")` بالأسماء القصيرة.
  - تشمل resample الفترات الفارغة (الشهر الذي بلا طلبات يظهر بـ 0)، بينما التجميع بحسب `dt.to_period("M")` لا يسرد إلا الفترات التي فيها بيانات.
  - "تقارن `pct_change()` كل فترة بالتي قبلها، و`pct_change(4)` على الأرباع تقارن بالربع نفسه قبل سنة."
  - تسميات resample تحدّد نهاية كل حاوية زمنية، فقد تعرض سلسلة أسبوعية تسمية من 2026 لطلبات قُدّمت في ديسمبر 2025؛ افحص الفترتين الأولى والأخيرة بحثًا عن بيانات جزئية.
further:
  - title: Time series / date functionality - resampling
    url: https://pandas.pydata.org/docs/user_guide/timeseries.html#resampling
  - title: Offset aliases
    url: https://pandas.pydata.org/docs/user_guide/timeseries.html#offset-aliases
  - title: pandas.Series.pct_change
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.pct_change.html
quiz:
  - q: "الإيراد الفصلي موجود في `q`، الأقدم أولًا. أيّ تعبير يعطي نمو كل ربع مقارنةً بالربع نفسه قبل سنة؟"
    options:
      - text: "`q.pct_change()`"
        why: هذا يقارن كل ربع بالربع الذي قبله مباشرة، فيُقارَن الربع الرابع بالثالث، وهذا يخلط النمو بالموسمية.
      - text: "`q.pct_change(4)`"
        why: صحيح. مع البيانات الفصلية، أربع فترات إلى الوراء هي الربع نفسه في السنة الماضية، وهذا يزيل النمط الموسمي من المقارنة.
      - text: "`q.diff(4)`"
        why: تعطي `diff` التغيّر بالدولار، لا كنسبة مئوية.
      - text: "`q.rolling(4).mean()`"
        why: هذا ينعّم السلسلة على مدى سنة؛ ولا يقارن الفترات.
    answer: 1
  - q: "عدد الطلبات الأسبوعي المحسوب بـ `resample(\"W\")` ينتهي بأسبوع تسميته 2026-01-04 فيه 11 طلبًا فقط. ما الذي يحدث؟"
    options:
      - text: البيانات تحتوي طلبات من 2026 يجب حذفها.
        why: تنتهي البيانات في 30 ديسمبر 2025. التسمية هي تاريخ نهاية الأسبوع، لا تواريخ الطلبات.
      - text: اخترعت `resample` أسبوعًا غير موجود.
        why: الأسبوع من 29 ديسمبر إلى 4 يناير موجود؛ البيانات فقط تتوقّف في منتصفه.
      - text: الأسبوع الأخير مسمّى بيوم الأحد، 4 يناير، ولا يحتوي إلا يومين من البيانات، فيبدو منخفضًا بشكل مصطنع.
        why: صحيح. الحاويات الأسبوعية تنتهي يوم الأحد افتراضيًا. احذف الفترات الجزئية أو ضع عليها علامة قبل مقارنتها بالفترات الكاملة.
    answer: 2
  - q: أيّ كود يعطي عدد الطلبات لكل اسم يوم من أيام الأسبوع؟
    options:
      - text: "`orders.groupby(orders[\"order_date\"].dt.day_name()).size()`"
        why: صحيح. يستخرج الـ accessor `dt` اسم يوم الأسبوع لكل صف، والتجميع بحسب تلك الـ Series يعدّ الطلبات لكل اسم يوم.
      - text: "`orders.resample(\"D\").size()`"
        why: هذا يعدّ الطلبات لكل يوم تقويمي (729 صفًا)، لا لكل يوم من أيام الأسبوع، ويحتاج فهرسًا من نوع datetime.
      - text: "`orders[\"order_date\"].day_name().value_counts()`"
        why: methods التواريخ على العمود موجودة خلف `.dt`؛ وبدونها تُطلق pandas الخطأ `AttributeError`.
    answer: 0
---

الأرقام الشهرية التي استخدمتها منذ الدرس 1.3 جاءت من مكان ما: بضعة آلاف من الطلبات ذات الطوابع الزمنية، موزّعة بحسب الشهر التقويمي. الزمن هو محور كل سؤال عمل تقريبًا ("هل ينمو الإيراد؟"، "هل نوفمبر هذا العام طبيعي؟"، "متى يتسوّق الناس؟")، ولدى pandas أدوات مبنية له. وقبل استخدامها، تحتاج صفًا لكل طلب مع إيراده وطابعه الزمني.

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
order_revenue = items.groupby("order_id", as_index=False)["revenue"].sum()

orders = orders.merge(order_revenue, on="order_id", how="left", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
print(orders[["order_id", "order_date", "revenue"]].head(3))
```

كل كتلة Run فيما يلي تبدأ بهذه الأسطر، مختصرة لتبقى مقروءة. وفي الـ notebook الخاص بك كنت ستشغّلها مرة واحدة.

## resample: حاويات من الزمن

تجمّع `resample` الصفوف في فترات زمنية منتظمة، وهو ما نسمّيه إعادة التجميع الزمني. وتحتاج أن تكون التواريخ في الفهرس:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

by_time = orders.set_index("order_date")
monthly = by_time.resample("ME")["revenue"].sum()
quarterly = by_time.resample("QE")["revenue"].sum()
print(len(monthly), "months")
print(monthly.tail(4).round(0))
print(quarterly.round(0))
```

النص اسم مستعار للتكرار (frequency alias): `"D"` للأيام، و`"W"` للأسابيع المنتهية يوم الأحد، و`"ME"` لنهايات الأشهر، و`"QE"` لنهايات الأرباع، و`"YE"` لنهايات السنوات. أعادت pandas 2.2 تسمية `"M"` و`"Q"` و`"Y"` إلى نسخ الـ `E` لتوضّح أن التسميات هي **نهايات** الفترات، والأسماء القديمة تُطلق الآن تحذير إهمال. أما الفترات (periods) فكائن مختلف يحتفظ بالأسماء القصيرة: `to_period("M")` و`to_period("Q")` صحيحتان، لأن الفترة تمثّل الشهر أو الربع كله لا آخر يوم فيه. والسلسلة الفصلية هي التي يحدّق فيها رئيس النمو: 80,523 دولارًا في الربع الثالث من 2025، ثم 146,825 في الربع الرابع.

### الفرق بين resample و to_period

تستطيع أيضًا التجميع بحسب فترة: `orders.groupby(orders["order_date"].dt.to_period("M"))["revenue"].sum()`. تبدو النتيجة هنا متطابقة، بتسميات مثل `2025-11` بدلًا من `2025-11-30`. ويظهر الفرق حين لا تكون في فترة ما بيانات: تشملها `resample` بمجموع 0، بينما يتخطّاها التجميع تمامًا. وللرسوم البيانية ومعدّلات النمو تريد كل فترة حاضرة، فتكون `resample` الخيار الافتراضي الأكثر أمانًا.

:::figure تضع resample كل طابع زمني في حاوية ثابتة وتسمّي الحاوية بنهايتها
<svg viewBox="0 0 700 180" role="img" aria-labelledby="t1">
  <title id="t1">خط زمني من أكتوبر إلى ديسمبر عليه نقاط طلبات متفرّقة. خطوط عمودية تقسمه إلى ثلاث حاويات شهرية. كل حاوية مسمّاة بآخر يوم فيها: 2025-10-31 و 2025-11-30 و 2025-12-31، ومجموع الإيراد تحت كل تسمية.</title>
  <path class="d-line" d="M30 70 L670 70"/>
  <path class="d-line" d="M30 45 L30 95"/>
  <path class="d-line" d="M243 45 L243 95"/>
  <path class="d-line" d="M457 45 L457 95"/>
  <path class="d-line" d="M670 45 L670 95"/>
  <circle class="d-dot" cx="60" cy="70" r="5"/><circle class="d-dot" cx="110" cy="70" r="5"/><circle class="d-dot" cx="190" cy="70" r="5"/>
  <circle class="d-dot" cx="260" cy="70" r="5"/><circle class="d-dot" cx="290" cy="70" r="5"/><circle class="d-dot" cx="320" cy="70" r="5"/><circle class="d-dot" cx="350" cy="70" r="5"/><circle class="d-dot" cx="380" cy="70" r="5"/><circle class="d-dot" cx="400" cy="70" r="5"/><circle class="d-dot" cx="420" cy="70" r="5"/><circle class="d-dot" cx="440" cy="70" r="5"/>
  <circle class="d-dot" cx="490" cy="70" r="5"/><circle class="d-dot" cx="540" cy="70" r="5"/><circle class="d-dot" cx="590" cy="70" r="5"/><circle class="d-dot" cx="630" cy="70" r="5"/>
  <text class="d-label-muted" x="136" y="35" text-anchor="middle">أكتوبر</text>
  <text class="d-label-muted" x="350" y="35" text-anchor="middle">نوفمبر</text>
  <text class="d-label-muted" x="563" y="35" text-anchor="middle">ديسمبر</text>
  <text class="d-code" x="136" y="125" text-anchor="middle">2025-10-31</text>
  <text class="d-code" x="350" y="125" text-anchor="middle">2025-11-30</text>
  <text class="d-code" x="563" y="125" text-anchor="middle">2025-12-31</text>
  <text class="d-label" x="136" y="152" text-anchor="middle">30,339</text>
  <text class="d-label-strong" x="350" y="152" text-anchor="middle">75,334</text>
  <text class="d-label" x="563" y="152" text-anchor="middle">41,153</text>
</svg>
:::

## مقارنة الفترات

السلاسل الخام تجيب عن "كم"؛ والتغيّرات تجيب عن "بأيّ سرعة":

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
by_time = orders.set_index("order_date")

quarterly = by_time.resample("QE")["revenue"].sum()
print(pd.DataFrame({
    "revenue": quarterly.round(0),
    "vs_prev_quarter": quarterly.pct_change().round(3),
    "vs_year_ago": quarterly.pct_change(4).round(3),
}))
monthly = by_time.resample("ME")["revenue"].sum()
print(monthly.rolling(3).mean().tail(3).round(0))
```

تقسم `pct_change()` كل قيمة على القيمة التي قبلها وتطرح 1. الربع الرابع من 2025 أعلى بنسبة 82% من الثالث، وهي القفزة التي لاحظها الجميع. لكن `pct_change(4)` تقارن كل ربع بالربع نفسه قبل سنة، وهذا العمود يحكي قصة أهدأ: الربع الرابع من 2025 أعلى بنسبة 180% من الربع الرابع من 2024، بينما نما الأول والثاني والثالث بنسب 200% و145% و165%. نما الربع الرابع بسرعة تقارب بقية السنة. جزء كبير من "القفزة" نمط موسمي كان موجودًا في 2024 أيضًا: كان الربع الرابع من 2024 أعلى بنسبة 73% من الربع الثالث من 2024.

تحسب `rolling(3).mean()` متوسط كل شهر مع الشهرين اللذين قبله، أي المتوسط المتحرك، فتنعّم القفزات المفردة مثل نوفمبر. استخدمها لترى الاتجاه؛ واستخدم السلسلة الخام لترى الأحداث.

:::mistake مقارنة فترة جزئية بفترات كاملة
الحاويات الأسبوعية تنتهي يوم الأحد، فتسمّي `resample("W")` الحاوية الأخيرة 2026-01-04 مع أن البيانات تنتهي في 30 ديسمبر 2025، وذلك "الأسبوع" لا يحمل إلا يومين من الطلبات. الفترات الجزئية في البداية والنهاية تبدو دائمًا انهيارًا أو تراجعًا. قارن `series.index.min()` و`max()` بالنطاق الزمني الحقيقي للبيانات، واحذف الفترات الجزئية أو ضع عليها علامة قبل حساب النمو.
:::

## الـ accessor المسمّى dt: أجزاء التقويم

للأنماط داخل الفترة، مثل أيام الأسبوع أو ساعات اليوم، استخرج الجزء بـ `.dt` وجمّع بحسبه:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
orders = orders[orders["status"] != "cancelled"]
d = orders["order_date"]
print(orders.groupby(d.dt.day_name()).size().sort_values())
print(orders.groupby(d.dt.hour).size().head(4))
print(d.dt.to_period("Q").value_counts().sort_index().tail(2))
```

الطلبات موزّعة بالتساوي تقريبًا على أيام الأسبوع، من 241 يوم الاثنين إلى 298 يومي الثلاثاء والسبت، فلا يوجد أثر قوي ليوم الأسبوع يحتاج تفسيرًا. أجزاء مفيدة أخرى: `dt.year` و`dt.quarter` و`dt.month` و`dt.isocalendar().week` و`dt.date` و`dt.normalize()` (منتصف ليل اليوم نفسه، وقد استخدمتها في الدرس 3.4).

إعادة التجميع اليومية هي المكان الذي تُختبر فيه الافتراضات. تعطي `by_time.resample("D").size()` عددًا لكل يوم تقويمي، 729 يومًا من أول طلب إلى آخره، وتظهر حقيقتان دفعة واحدة: 119 يومًا لم تشهد أي طلب (وفي سلسلة مبنية بـ `groupby` كانت تلك الأيام ستغيب ببساطة)، وأكثر يوم ازدحامًا كان 10 نوفمبر 2025 بـ 16 طلبًا، قبل الجمعة السوداء (28 نوفمبر) بنحو ثلاثة أسابيع. والأيام الأعلى الأخرى، 6 و8 و26 نوفمبر، موزّعة على الشهر أيضًا. أيًّا كان ما دفع نوفمبر، فلم يكن يومًا ترويجيًا كبيرًا واحدًا؛ تذكّر ذلك في دراسة الحالة.

في التمرين تبني السلسلة الشهرية ونظرة "سنة مقابل سنة" بنفسك. وفي الدرس التالي ترتّب العملاء وتقسّمهم إلى فئات، فتحوّل مقياسًا متصلًا مثل إجمالي الإنفاق إلى شرائح.
