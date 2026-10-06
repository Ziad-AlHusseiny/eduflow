---
summary: اعثر على القيم المفقودة بـ isna، وافهم أيّ النصوص تحوّلها read_csv بصمت إلى NaN، واختر عن قصد بين استرجاعها أو وضع تسمية لها أو حذفها أو إبقائها بأنواع تقبل القيم المفقودة.
takeaways:
  - تحوّل `read_csv` افتراضيًا الخلايا الفارغة والنصوص مثل `N/A` و`NA` و`null` إلى قيم مفقودة، فافحص الملف الخام حين تبدو الأعداد مفاجئة.
  - "`df.isna().sum()` تعدّ الخانات الفارغة في كل عمود؛ و`df[df.isna().any(axis=1)]` تعرض الصفوف التي فيها أيّ منها."
  - كل قيمة مفقودة تحتاج قرارًا - استرجعها، أو ضع لها تسمية، أو احذف الصف، أو أبقِها مفقودة - والملء بـ 0 نادرًا ما يكون صحيحًا.
  - النوع `Int64` القابل للقيم المفقودة (nullable) يحتفظ بالأعداد الصحيحة كأعداد صحيحة ويعرض الفجوات كـ `<NA>`، بدلًا من تحويل العمود إلى أعداد عشرية.
  - المجاميع والمتوسطات والأعداد تتخطّى القيم المفقودة افتراضيًا، فيكون الفرق بين `count()` و`len()` هو عدد الفجوات بالضبط.
further:
  - title: Working with missing data
    url: https://pandas.pydata.org/docs/user_guide/missing_data.html
  - title: Nullable integer data type
    url: https://pandas.pydata.org/docs/user_guide/integer_na.html
  - title: pandas.DataFrame.fillna
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.fillna.html
quiz:
  - q: في الملف الفوضوي 9 كميات فارغة. شغّل زميلك `fillna(0)` على العمود قبل حساب متوسط الكمية لكل طلب. ماذا يحدث؟
    options:
      - text: لا يتغيّر المتوسط، لأن الأصفار لا تؤثّر في المتوسط.
        why: الأصفار تُحسب قيمًا حقيقية، فتكبّر المقام وتسحب المتوسط إلى الأسفل (هنا من نحو 1.43 إلى 1.36).
      - text: يبقى المتوسط صحيحًا، لأن pandas تتجاهل الأصفار.
        why: تتجاهل pandas القيم المفقودة في `mean()`، لا الأصفار. الملء حوّل "غير معروف" إلى "صفر"، وهذا ادّعاء عن البيانات.
      - text: تُطلق pandas خطأً لأن العمود أصبح مختلطًا.
        why: الملء بـ 0 يُبقي العمود رقميًا؛ لا خطأ يظهر، ولهذا بالضبط يمرّ الخطأ دون أن يلاحظه أحد.
      - text: ينخفض المتوسط، لأن 9 كميات مجهولة أصبحت تُحسب طلبات من صفر عناصر.
        why: صحيح. كل طلب فيه عنصر واحد على الأقل، فالصفر ليس قيمة معقولة. ترك الفجوات مفقودة يعطي المتوسط الصادق للكميات المعروفة.
    answer: 3
  - q: "في ملف CSV الخام النص `N/A` في عمود القناة في 7 صفوف. بعد `pd.read_csv`، ماذا تعرض `value_counts()` له؟"
    options:
      - text: "صفًا `N/A` بعدد 7"
        why: النص `N/A` موجود في قائمة pandas الافتراضية لعلامات القيم المفقودة، فيُحوَّل إلى `NaN` ويُستبعد من `value_counts()`.
      - text: لا شيء؛ الصفوف السبعة قيم مفقودة وتُستبعد ما لم تمرّر `dropna=False`
        why: صحيح. مرّر `dropna=False` لتراها، أو `keep_default_na=False` عند التحميل إذا كان يجب أن يبقى `N/A` فئة حقيقية.
      - text: خطأ، لأن `N/A` ليست قناة صالحة
        why: لا تتحقّق `read_csv` من الفئات؛ فهي إما تحتفظ بالنص وإما تحوّل علامات الفقد المعروفة.
    answer: 1
  - q: "`q = messy[\"quantity\"].astype(\"Int64\")`. ماذا تعيد `q.count()` و`len(q)` لـ 168 صفًا فيها 9 فجوات؟"
    options:
      - text: "`159` و `168`"
        why: صحيح. تعدّ `count()` القيم غير المفقودة؛ وتعدّ `len()` الصفوف، والفجوات منها.
      - text: "`168` و `168`"
        why: لا تعدّ `count()` القيم المفقودة أبدًا، أيًّا كان النوع.
      - text: "`159` و `159`"
        why: القيم المفقودة تبقى صفوفًا؛ و`len()` تشملها.
    answer: 0
---

افتح `orders_messy.csv` في جدول بيانات، فيسهل أن تفوتك الفجوات: خلية كمية فارغة هنا، و`N/A` في عمود القناة هناك. حمّله في pandas فتصبح تلك الفجوات `NaN`، تتدفّق بعدها بصمت عبر حساباتك: المجاميع تتخطّاها، والمتوسطات تتجاهلها، و`fillna(0)` مكتوبة على عجل تحوّل "لا نعرف" إلى "لم يُبَع شيء". القيم المفقودة (missing values) ليست إزعاجًا تقنيًا تزيله من طريقك؛ كل واحدة منها سؤال عن العمل.

## العثور على الفجوات

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
print(messy.shape)
print(messy.isna().sum())
print(messy[messy.isna().any(axis=1)].head().to_string())
```

تعيد `isna()` جدولًا (DataFrame) من القيم المنطقية، وجمعه يعدّ الفجوات في كل عمود: 9 كميات و7 قنوات. وتسأل `isna().any(axis=1)` لكل صف هل أيّ عمود فيه مفقود (`axis=1` تعني "عبر الأعمدة")، وهذا يتيح لك النظر إلى الصفوف المتضرّرة فعلًا. والنظر إليها مهم: الكميات التسع المفقودة تخصّ طلبات عادية عبر السنتين، لا يومًا واحدًا معطوبًا.

## ما قرّرته read_csv نيابةً عنك

لا توجد في الملف الخام خلايا قناة فارغة. فيه النص `N/A`، وحوّلته pandas إلى `NaN` لأن `N/A` موجود في قائمتها الافتراضية لعلامات الفقد، مع الخلية الفارغة و`NA` و`NaN` و`null` و`None` وغيرها. هذا مفيد عادةً. وأحيانًا يكون خاطئًا: عمود رموز الدول سيفقد ناميبيا، التي رمزها في ISO هو `NA`. حمّل الملف دون التحويل لترى ما فيه حقًا:

```python run
import pandas as pd

raw = pd.read_csv("orders_messy.csv", keep_default_na=False)
print(raw["channel"].value_counts())
print((raw["quantity"] == "").sum(), "empty quantity cells")
```

الآن يظهر `N/A` كقيمة حقيقية بعدد 7، وعمود الكمية كله نصوص، لأن الخلايا الفارغة بقيت نصوصًا فارغة. وللتحكّم في القائمة بدقة، مرّر `na_values=["N/A", ""]` مع `keep_default_na=False`.

## تقرير ما تفعله

لا يوجد إصلاح يصلح لكل حالة. اطرح ثلاثة أسئلة بهذا الترتيب، وإذا كانت الإجابة عنها كلها "لا" فأبقِ القيمة مفقودة:

:::figure ثلاثة أسئلة لكل قيمة مفقودة
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">مسار قرار. أولًا: هل يمكن استرجاع القيمة من مصدر آخر؟ إذا نعم، استرجعها. ثانيًا: هل للفقد معنى، مثل عدم وجود كوبون؟ إذا نعم، ضع له تسمية. ثالثًا: هل الصف بلا فائدة بدونها في هذا التحليل؟ إذا نعم، احذفه لذلك التحليل. وإلا فأبقِها مفقودة.</title>
  <rect class="d-box" x="10" y="20" width="150" height="60" rx="10"/>
  <text class="d-label" x="85" y="45" text-anchor="middle">يمكن استرجاعها</text>
  <text class="d-label" x="85" y="65" text-anchor="middle">من مصدر آخر؟</text>
  <rect class="d-box" x="185" y="20" width="150" height="60" rx="10"/>
  <text class="d-label" x="260" y="45" text-anchor="middle">هل لـ "مفقود"</text>
  <text class="d-label" x="260" y="65" text-anchor="middle">معنى ما؟</text>
  <rect class="d-box" x="360" y="20" width="150" height="60" rx="10"/>
  <text class="d-label" x="435" y="45" text-anchor="middle">الصف بلا فائدة</text>
  <text class="d-label" x="435" y="65" text-anchor="middle">بدونها؟</text>
  <rect class="d-box-primary" x="535" y="20" width="150" height="60" rx="10"/>
  <text class="d-label-strong" x="610" y="55" text-anchor="middle">أبقِها NA</text>
  <path class="d-arrow" d="M160 50 L183 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M335 50 L358 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M510 50 L533 50" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="171" y="40" text-anchor="middle">لا</text>
  <text class="d-label-muted" x="346" y="40" text-anchor="middle">لا</text>
  <text class="d-label-muted" x="521" y="40" text-anchor="middle">لا</text>
  <path class="d-arrow" d="M85 80 L85 140" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M260 80 L260 140" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M435 80 L435 140" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="100" y="115">نعم</text>
  <text class="d-label-muted" x="275" y="115">نعم</text>
  <text class="d-label-muted" x="450" y="115">نعم</text>
  <rect class="d-box-success" x="10" y="144" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="85" y="174" text-anchor="middle">استرجعها</text>
  <rect class="d-box-accent" x="185" y="144" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="260" y="174" text-anchor="middle">ضع لها تسمية</text>
  <rect class="d-box-warn" x="360" y="144" width="150" height="50" rx="10"/>
  <text class="d-label-strong" x="435" y="174" text-anchor="middle">احذف الصف (مؤقتًا)</text>
  <text class="d-label-muted" x="85" y="220" text-anchor="middle">اربط بجدول نظيف</text>
  <text class="d-label-muted" x="260" y="220" text-anchor="middle">fillna("unknown")</text>
  <text class="d-label-muted" x="435" y="220" text-anchor="middle">dropna(subset=...)</text>
</svg>
:::

الاسترجاع يأتي أولًا لأنه الخيار الوحيد الذي يضيف معلومة. معرّفات الطلبات في الملف المُصدَّر موجودة أيضًا في جدولي `orders` و`order_items` النظيفين لدى Cartwheel، فيمكن البحث عن الكميات المفقودة هناك؛ وستتعلّم عملية الدمج (merge) التي تفعل ذلك في الدرس 4.2. وإلى أن تستطيع استرجاع قيمة، لا تخترع واحدة.

بالتطبيق على الملف المُصدَّر: **القناة** المفقودة لا يمكن تخمينها من أي شيء آخر في الصف، لكن "لا نعرف القناة" حقيقة تستحق أن تبقى ظاهرة، فتحصل على تسمية صريحة. أما **كود الكوبون** الفارغ في جدول `orders` النظيف فأمر مختلف مرة أخرى: هناك يعني الفقد "لم يُستخدم كوبون"، وهذه إجابة حقيقية.

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
messy["channel"] = messy["channel"].fillna("unknown")
print(messy["channel"].value_counts())
print(len(messy.dropna(subset=["quantity"])), "rows with a known quantity")
```

تحذف `dropna(subset=["quantity"])` الصفوف التي تنقصها الكمية فقط، وفي النتيجة التي تخزّنها فقط؛ أما `dropna()` العادية دون subset فتحذف الصف إذا كان **أيّ** عمود فيه مفقودًا، وهذا على الملف الخام سيرمي 16 صفًا، منها مجاميع سليمة تمامًا. احذف لتحليل محدّد، لا من نسختك الرئيسية.

:::mistake الملء بالصفر لتختفي الفجوات
الكمية الفارغة ليست صفرًا: كل طلب فيه عنصر واحد على الأقل. تخفض `fillna(0)` متوسط الكمية من 1.43 إلى 1.36، وتجعل تسعة طلبات حقيقية تبدو فارغة. لا تملأ إلا بقيمة تستطيع الدفاع عنها في جملة واحدة أمام مديرك.
:::

وفخ آخر: لا تستطيع العثور على الفجوات بـ `==`. القيمة `NaN` لا تساوي أي شيء، ولا حتى نفسها، فتكون `messy["channel"] == np.nan` مساوية لـ `False` في كل صف. استخدم دائمًا `isna()` و`notna()`.

## الأنواع القابلة للقيم المفقودة: أعداد صحيحة يمكن أن تُفقد

حُمّل عمود الكمية على هيئة `float64`، فتُطبع الكميات `1.0` و`2.0`. هذا هو الأثر نفسه الذي رأيته مع `referred_by` في الدرس 2.2: `NaN` الكلاسيكية عدد عشري. ولدى pandas أيضًا أنواع **قابلة للقيم المفقودة (nullable)**، تُكتب بحرف كبير، وتخزّن علامة فقد مستقلة هي `pd.NA`:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
qty = messy["quantity"].astype("Int64")
print(qty.dtype, qty.iloc[32:35].tolist())
print(qty.sum(), qty.count(), len(qty))
print(round(qty.mean(), 2))
```

يحتفظ `Int64` بالأعداد الصحيحة كأعداد صحيحة، ويعرض الفجوات كـ `<NA>`. والحسابات التجميعية تتخطّى القيم المفقودة افتراضيًا، فتجمع `sum()` الكميات المعروفة الـ 159، ويخبرك الفرق بين `count()` و`len()` بعدد المفقود بالضبط. وتضم العائلة نفسها `Float64` و`boolean` و`string`، وتحمّل `pd.read_csv(..., dtype_backend="numpy_nullable")` كل الأعمدة بهذه الطريقة. وسلوك واحد يجب أن تعرفه: المقارنات مع `pd.NA` تعيد `<NA>` بدلًا من `False`، لأن سؤال "هل الكمية المجهولة تساوي 1؟" لا إجابة صادقة عنه.

في التمرين تعدّ الفجوات وتضع لها تسميات وتغيّر نوعها. وفي الدرس التالي تنظّف الأعمدة النصية، حيث تأتي أسماء الدول بأربع كتابات مختلفة.
