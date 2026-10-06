---
summary: حلّل عمود تواريخ يخلط بين صيغة ISO وصيغة اليوم أولًا وصيغة الشهر أولًا باستخدام صيغ to_datetime صريحة، وضع علامة على القيم الملتبسة، وتحقّق من النتيجة مقابل مصدر موثوق.
takeaways:
  - بدون `format=` تخمّن pandas 2 الصيغة من القيمة الأولى، وتفشل مع أيّ صف مكتوب بشكل مختلف.
  - حلّل كل صيغة معروفة صراحةً بـ `pd.to_datetime(col, format=..., errors="coerce")`، ثم ادمج النتائج بـ `fillna`.
  - تاريخ مثل `05/08/2025` يُحلَّل وفق قاعدتي اليوم أولًا والشهر أولًا كلتيهما؛ ولا تستطيع أيّ أداة تحليل أن تخبرك أيّهما الصحيح.
  - ضع علامة على القيم الملتبسة وحلّها من مصدر موثوق (نظام السجلات الأساسي، أو عمود آخر، أو الشخص الذي أعدّ الملف)، لا بالافتراض وحده أبدًا.
  - حين يصبح العمود `datetime64`، يعطيك الـ accessor المسمّى `.dt` كلًّا من `year` و`month` و`day_name()` و`to_period()` للتجميع.
further:
  - title: pandas.to_datetime
    url: https://pandas.pydata.org/docs/reference/api/pandas.to_datetime.html
  - title: strftime() and strptime() format codes
    url: https://docs.python.org/3/library/datetime.html#strftime-and-strptime-format-codes
  - title: Time series / date functionality
    url: https://pandas.pydata.org/docs/user_guide/timeseries.html
quiz:
  - q: "يُطلق `pd.to_datetime(messy[\"order_date\"])` الخطأ `ValueError: time data \"08/04/2024\" doesn't match format \"%Y-%m-%d\"`. لماذا؟"
    options:
      - text: التاريخ 8 أبريل 2024 غير موجود في نطاق البيانات.
        why: القيمة تاريخ صالح؛ المشكلة في صيغته لا في معناه.
      - text: استنتجت pandas صيغة ISO من القيمة الأولى ثم قابلت صفًا مكتوبًا بشكل مختلف.
        why: صحيح. تستنتج pandas 2 صيغة واحدة للعمود كله، والقيمة الأولى `2024-01-02` هي التي حدّدتها.
      - text: التواريخ ذات الشرطات المائلة غير مدعومة في pandas.
        why: التواريخ ذات الشرطات المائلة تُحلَّل بلا مشكلة مع الـ `format` الصحيح، مثل `%d/%m/%Y`.
      - text: العمود فيه قيم مفقودة.
        why: القيم المفقودة تصبح `NaT` (ليس وقتًا)؛ ولا تسبّب خطأ صيغة.
    answer: 1
  - q: أيّ هذه القيم ملتبس، أي أن قراءتي اليوم أولًا والشهر أولًا تعطيان تاريخين صالحين لكن مختلفين؟
    options:
      - text: "`25/10/2025`"
        why: لا يوجد شهر رقمه 25، فالقراءة الوحيدة الصالحة هي اليوم أولًا.
      - text: "`10/25/2025`"
        why: لا يوجد شهر 25 في قراءة اليوم أولًا أيضًا، فلا بد أن تكون الشهر أولًا.
      - text: "`2025-10-05`"
        why: تواريخ ISO تضع دائمًا السنة ثم الشهر ثم اليوم، فلها قراءة واحدة فقط.
      - text: "`05/08/2025`"
        why: صحيح. قد يكون 5 أغسطس أو 8 مايو. وحدها المعلومات الخارجية تستطيع الحسم.
    answer: 3
  - q: تفترض أداة التحليل لديك أن اليوم أولًا في التواريخ الملتبسة. كيف تتحقّق من صحة هذا الافتراض؟
    options:
      - text: قارن التواريخ المحلَّلة بمصدر موثوق للسجلات نفسها، مثل نظام الطلبات، وعُدّ حالات الاختلاف.
        why: صحيح. هنا يُظهر جدول `orders` النظيف أن الافتراض خاطئ في 5 من الصفوف الملتبسة الـ 30.
      - text: تحقّق من أنه لا يوجد تاريخ محلَّل قيمته `NaT`.
        why: التاريخ الملتبس لا يفشل تحليله أبدًا؛ بل يُحلَّل إلى تاريخ خاطئ، وهذا ما لا يستطيع هذا الفحص رؤيته.
      - text: تحقّق من أن كل التواريخ تقع بين 2024 و2025.
        why: تبديل اليوم والشهر داخل السنة نفسها يبقى ضمن النطاق، فلا يستطيع هذا الفحص التقاط الخطأ.
    answer: 0
---

يكتب الملف الفوضوي التواريخ بثلاث طرق: `2024-03-05` و`05/03/2024` و`03/05/2024`. الأولى لا لبس فيها. والأخريان اليوم نفسه مكتوبًا بجدول بيانات أوروبي وآخر أمريكي، والمشكلة أن `03/05/2024` قد تكون أيضًا الطريقة الأوروبية لكتابة 3 مايو. التواريخ هي العمود الذي تتباعد فيه عبارة "تم التحليل دون أخطاء" عن عبارة "النتيجة صحيحة" أكثر من أي عمود آخر.

## ترك pandas تخمّن

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
print(messy["order_date"].sample(8, random_state=1).tolist())
try:
    pd.to_datetime(messy["order_date"])
except ValueError as error:
    print(str(error).splitlines()[0])
```

تستنتج pandas 2 صيغة واحدة من القيمة الأولى، `2024-01-02`، وتطبّقها على العمود كله. الصف 6، `08/04/2024`، لا يناسبها، فيتوقّف التحويل. هذه الصرامة ميزة: الإصدارات الأقدم كانت تخمّن صفًا بصف، وقد تخلط بين الأيام والأشهر بصمت.

## حلّل كل صيغة صراحةً

أنت تعرف أيّ الصيغ موجودة، فقل ذلك. رموز الصيغة تصف الترتيب: `%Y` سنة من أربعة أرقام، و`%m` شهر من رقمين، و`%d` يوم من رقمين. حلّل العمود مرة لكل صيغة مع `errors="coerce"`، التي تحوّل الصفوف غير المطابقة إلى `NaT` ("ليس وقتًا" في pandas)، ثم املأ الفجوات بحسب ترتيب الأفضلية:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
raw = messy["order_date"]
iso = pd.to_datetime(raw, format="%Y-%m-%d", errors="coerce")
dmy = pd.to_datetime(raw, format="%d/%m/%Y", errors="coerce")
mdy = pd.to_datetime(raw, format="%m/%d/%Y", errors="coerce")
print(iso.notna().sum(), "ISO |", dmy.notna().sum(), "fit day-first |", mdy.notna().sum(), "fit month-first")

parsed = iso.fillna(dmy).fillna(mdy)
print(parsed.isna().sum(), "unparsed")
print(parsed.min(), parsed.max())
```

حُلّل كل صف، والنطاق صحيح: من يناير 2024 إلى ديسمبر 2025. يأتي اليوم أولًا قبل الشهر أولًا في السلسلة لأن معظم دول Cartwheel تكتب التواريخ بهذه الطريقة. وتستطيع pandas فعل الشيء نفسه في استدعاء واحد بـ `pd.to_datetime(raw, format="mixed", dayfirst=True)`، التي تحلّل كل قيمة وحدها؛ النسخة الصريحة أطول، لكنها تبيّن لك بالضبط أيّ قاعدة حسمت كل صف.

لكن انظر إلى الأعداد. 57 قيمة تناسب اليوم أولًا و44 تناسب الشهر أولًا، من 68 قيمة فقط فيها شرطات مائلة. إذن 33 منها تناسب **الاثنتين**.

:::figure ثلاثة أنواع من التواريخ ذات الشرطات المائلة
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">ثلاثة صناديق. 25/10/2025 لا يمكن أن تكون إلا اليوم أولًا لأنه لا يوجد شهر 25. و 10/25/2025 لا يمكن أن تكون إلا الشهر أولًا. أما 05/08/2025 فتناسب القراءتين، 5 أغسطس أو 8 مايو، فهي ملتبسة وتحتاج معلومات خارجية.</title>
  <rect class="d-box-success" x="20" y="30" width="200" height="110" rx="12"/>
  <text class="d-code" x="120" y="65" text-anchor="middle">25/10/2025</text>
  <text class="d-label" x="120" y="95" text-anchor="middle">لا يوجد شهر 25</text>
  <text class="d-label-strong" x="120" y="120" text-anchor="middle">اليوم أولًا فقط</text>
  <rect class="d-box-success" x="250" y="30" width="200" height="110" rx="12"/>
  <text class="d-code" x="350" y="65" text-anchor="middle">10/25/2025</text>
  <text class="d-label" x="350" y="95" text-anchor="middle">لا يوجد شهر 25</text>
  <text class="d-label-strong" x="350" y="120" text-anchor="middle">الشهر أولًا فقط</text>
  <rect class="d-box-warn" x="480" y="30" width="200" height="110" rx="12"/>
  <text class="d-code" x="580" y="65" text-anchor="middle">05/08/2025</text>
  <text class="d-label" x="580" y="95" text-anchor="middle">5 أغسطس أم 8 مايو؟</text>
  <text class="d-label-strong" x="580" y="120" text-anchor="middle">ملتبس</text>
  <text class="d-label-muted" x="235" y="180" text-anchor="middle">أداة التحليل تستطيع حسم هذه</text>
  <text class="d-label-muted" x="580" y="180" text-anchor="middle">وحدها بيانات خارجية تحسم</text>
  <path class="d-line" d="M30 160 L440 160"/>
  <path class="d-line" d="M490 160 L670 160"/>
</svg>
:::

## ضع علامة على الالتباس

القيمة التي تُحلَّل بالطريقتين إلى تاريخين **مختلفين** ملتبسة. ثلاث من القيم الـ 33 تواريخ مثل `05/05/2025`، حيث تتّفق القراءتان، فهي غير مؤذية:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
raw = messy["order_date"]
dmy = pd.to_datetime(raw, format="%d/%m/%Y", errors="coerce")
mdy = pd.to_datetime(raw, format="%m/%d/%Y", errors="coerce")
ambiguous = dmy.notna() & mdy.notna() & (dmy != mdy)
print(ambiguous.sum(), "ambiguous dates")
print(raw[ambiguous].head(6).tolist())
```

ثلاثون صفًا تعتمد على افتراض. تستطيع أن تفترض، كما فعلت سلسلة `fillna`، لكن يجب أن تعرف أنك افترضت، ويجب أن يعرف ذلك أيضًا من يقرأ تقريرك.

## تحقّق مقابل مصدر الحقيقة

جدول `orders` النظيف لدى Cartwheel هو نظام السجلات الأساسي: كل معرّف طلب في الملف المُصدَّر يظهر هناك أيضًا مع وقته الحقيقي. البحث بمعرّف الطلب يتيح لك اختبار الافتراض مباشرة. تحوّل `set_index("order_id")` التواريخ إلى Series مسمّاة بالمعرّف، وتبحث `map()` عن كل صف من الملف المُصدَّر فيها:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
raw = messy["order_date"]
iso = pd.to_datetime(raw, format="%Y-%m-%d", errors="coerce")
dmy = pd.to_datetime(raw, format="%d/%m/%Y", errors="coerce")
mdy = pd.to_datetime(raw, format="%m/%d/%Y", errors="coerce")
parsed = iso.fillna(dmy).fillna(mdy)

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
true_dates = orders.set_index("order_id")["order_date"].dt.normalize()
truth = messy["order_id"].map(true_dates)

wrong = parsed != truth
print(wrong.sum(), "dates disagree with the order system")
print(messy.loc[wrong, ["order_id", "order_date"]].assign(parsed=parsed[wrong].dt.date, real=truth[wrong].dt.date))
```

تُسقط `dt.normalize()` الوقت من اليوم كي تكون المقارنة تاريخًا بتاريخ. خمسة تواريخ خاطئة، وكل واحد منها قيمة ملتبسة كانت فعلًا بصيغة الشهر أولًا: `02/08/2025` هو 8 فبراير، لا 2 أغسطس. كان افتراض اليوم أولًا صحيحًا في 25 من 30 صفًا ملتبسًا، وهذا يبدو جيدًا حتى تدرك أنه ينقل خمسة طلبات إلى الشهر الخطأ، وبعضها إلى الربع الخطأ.

:::mistake الثقة بـ dayfirst=True
`dayfirst=True` تفضيل لا ضمان: تستخدمه pandas فقط حين تكون القيمة ملتبسة. وحين يخلط ملف بين الأعراف، كما تفعل كثيرًا الملفات المجمّعة من عدة أنظمة، فستكون بعض التواريخ الملتبسة خاطئة أيًّا كان التفضيل الذي تختاره. إذا لم تستطع التحقّق، فاحتفظ بعلامة `is_ambiguous` في البيانات المنظّفة، وأبلغ عن حجم الإيراد الذي يعتمد عليها.
:::

### الأوقات والمناطق الزمنية

الملف المُصدَّر يحمل تواريخ فقط، لكن جدول `orders` فيه طوابع زمنية كاملة مثل `2025-12-30 21:19:03`، ولا يذكر أيٌّ منها منطقته الزمنية. تسجّل Cartwheel كل شيء بساعة متجر واحدة، فتستطيع معاملتها كأوقات محلية والمضيّ قُدمًا. أما حين يحتوي ملف على فروق توقيت مثل `+04:00`، فمرّر `utc=True` إلى `pd.to_datetime` كي تستقر كل القيم على ساعة مشتركة واحدة قبل أن تقارنها أو تجمّعها؛ ترك المناطق الزمنية مختلطة هو ما يجعل طلبين قُدّما في اللحظة نفسها في دبي ولندن ينتهيان في تاريخين مختلفين، أو حتى في سنتين مختلفتين حول منتصف ليل 31 ديسمبر.

## ما يعطيك إياه عمود تواريخ حقيقي

حين يصبح العمود `datetime64`، يكشف الـ accessor المسمّى `.dt` أجزاءه:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
d = orders["order_date"]
print(d.dt.year.value_counts().sort_index())
print(d.dt.day_name().value_counts().head(3))
print(d.dt.to_period("M").value_counts().sort_index().tail(3))
```

السنة، والشهر، واسم يوم الأسبوع، والشهر التقويمي كفترة (period): هذه هي المفاتيح التي ستجمّع بحسبها في القسم 4، حيث يشرح الدرس 4.4 السلاسل الزمنية (time series) بالتفصيل.

في التمرين تحلّل تواريخ الملف المُصدَّر وتضع عليها العلامات وتصلحها. ثم تبقى مشكلة واحدة قبل أن يصبح الملف نظيفًا: صفوف تظهر مرتين.
