---
summary: ابنِ Series و DataFrame في pandas من قوائم Python وقواميسها، وأجرِ الحسابات على أعمدة كاملة دفعة واحدة، وتوقّع كيف تحاذي pandas القيم بحسب تسميات الفهرس.
takeaways:
  - الـ Series عمود من القيم له فهرس (index) من التسميات؛ والـ DataFrame جدول من Series تتشارك فهرسًا واحدًا.
  - العمليات الحسابية على الـ Series تُطبَّق على كل القيم دفعة واحدة، فتكتب `prices * 1.05` بدلًا من حلقة تكرار.
  - العمليات بين Series وأخرى تتحاذى بحسب تسمية الفهرس لا بحسب الموقع؛ والتسميات الموجودة في طرف واحد فقط تنتج `NaN`.
  - "`df[\"col\"]` تعطيك عمودًا واحدًا على هيئة Series، و`df.shape` و`df.columns` و`df.index` و`df.dtypes` تصف الجدول."
further:
  - title: Intro to data structures (Series and DataFrame)
    url: https://pandas.pydata.org/docs/user_guide/dsintro.html
  - title: pandas.DataFrame reference
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html
quiz:
  - q: |
      ما قيمة `growth["Oct"]`؟
      ```python
      y2024 = pd.Series([9360, 29177], index=["Oct", "Nov"])
      y2025 = pd.Series([75334, 30339], index=["Nov", "Oct"])
      growth = y2025 - y2024
      ```
    options:
      - text: "`65,974`، أي القيمة الأولى ناقص القيمة الأولى"
        why: هذا تفكير بحسب الموقع. تطابق pandas القيم بحسب تسمياتها، لا بحسب ترتيبها.
      - text: "`20,979`، أي أكتوبر 2025 ناقص أكتوبر 2024"
        why: صحيح. تحاذي pandas الـ Series الاثنتين على الفهرس، فيُطرح كل شهر من الشهر نفسه، أيًّا كان الترتيب الذي كُتبا به.
      - text: "`NaN`، لأن الفهرسين بترتيب مختلف"
        why: الترتيب لا يهم في المحاذاة؛ وحدها التسميات التي تظهر في طرف واحد تنتج `NaN`.
    answer: 1
  - q: "`products` هو DataFrame فيه 48 صفًا و7 أعمدة. ماذا تعيد `products.shape`؟"
    options:
      - text: "`(7, 48)`"
        why: الشكل (shape) دائمًا الصفوف أولًا ثم الأعمدة.
      - text: "`336`"
        why: هذه قيمة `products.size`، أي العدد الكلي للخلايا.
      - text: "`(48, 7)`"
        why: صحيح. `shape` هو tuple من (الصفوف، الأعمدة)، وهو أسرع فحص سلامة بعد تحميل البيانات.
      - text: "`48`"
        why: هذه قيمة `len(products)`، التي تعدّ الصفوف فقط.
    answer: 2
  - q: أيّ سطر يرفع سعر كل منتج بنسبة 5% دون حلقة تكرار؟
    options:
      - text: "`products[\"unit_price\"] * 1.05`"
        why: صحيح. العمليات الحسابية على الـ Series تُطبَّق على كل قيمة وتعيد Series جديدة بالطول نفسه.
      - text: "`[p * 1.05 for p in products]`"
        why: المرور على DataFrame بحلقة يعطيك أسماء أعمدته لا صفوفه، فيحاول هذا الكود ضرب نصوص.
      - text: "`products * 1.05`"
        why: هذا يضرب كل الأعمدة، ومنها الأسماء والمعرّفات، ويفشل مع الأعمدة النصية.
    answer: 0
  - q: في آخر تمرين من القسم 1 احتفظت بأسماء الأشهر والإيرادات في قائمتين متوازيتين. ما المشكلة التي تحلّها الـ Series؟
    options:
      - text: القوائم لا تستطيع أن تحمل أكثر من 12 قيمة.
        why: القوائم تحمل ملايين القيم؛ الحجم لم يكن المشكلة قط.
      - text: القوائم لا تستطيع تخزين أعداد عشرية.
        why: القوائم تحمل أي نوع، ومنها الأعداد العشرية.
      - text: التسميات تنتقل مع القيم، فلا يمكن للترتيب أو التصفية أن يخلطا أيّ إيراد يخصّ أيّ شهر.
        why: صحيح. مع قائمتين، ترتيب إحداهما دون الأخرى يكسر الربط بينهما بصمت. أما الـ Series فتحفظ التسمية والقيمة معًا.
    answer: 2
---

في تمرين القسم السابق، كانت أسماء الأشهر في قائمة والإيرادات في قائمة أخرى، واضطررت إلى إيجاد أفضل شهر بموقعه ثم البحث عن اسمه في القائمة الأخرى. رتّب إحدى القائمتين وانسَ الأخرى، فيحصل كل شهر على إيراد خاطئ دون أي رسالة خطأ. وُجدت pandas لتجعل هذا النوع من الأخطاء صعبًا: القيم تحمل تسمياتها معها.

## الـ Series: عمود له تسميات

الـ **Series** مصفوفة أحادية البعد من القيم، ومعها **فهرس (index)**: تسمية لكل قيمة.

```python run
import pandas as pd

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue = pd.Series(
    [16167, 14906, 18208, 18817, 17428, 13933,
     22968, 32042, 25514, 30339, 75334, 41153],
    index=months,
    name="revenue_2025",
)
print(revenue.head(3))
print(revenue["Nov"], revenue.idxmax(), revenue.sum())
```

السطر `import pandas as pd` يحمّل المكتبة باسمها المختصر المتعارف عليه عالميًا؛ كل درس تعليمي عن pandas وكل إجابة على Stack Overflow تستخدم `pd`. و`revenue["Nov"]` تبحث عن قيمة بتسميتها، و`idxmax()` تعيد **تسمية** أكبر قيمة، فيختصر كل ذلك العناء مع القائمتين المتوازيتين في القسم 1 في استدعاء واحد.

السطر الأخير من الـ Series المطبوعة يقول `Name: revenue_2025, dtype: int64`. الـ **dtype** هو نوع كل القيم في العمود: `int64` للأعداد الصحيحة، و`float64` للأعداد العشرية، و`object` (أو `str` في pandas 3) للنصوص، و`bool`، و`datetime64` للتواريخ. عمود واحد، نوع واحد؛ وهذه القاعدة هي ما يجعل pandas سريعة.

## الحساب على كل القيم دفعة واحدة

العمليات الحسابية والمقارنات على الـ Series تُطبَّق على كل قيمة، وتعيد Series جديدة لها الفهرس نفسه. يُسمّى هذا كودًا **متّجهًا (vectorised)**: تصف العملية على العمود كله، وتنفّذ pandas الحلقة بكود مُترجَم سريع.

```python run
import pandas as pd

revenue = pd.Series([30339, 75334, 41153], index=["Oct", "Nov", "Dec"])
print(revenue * 1.05)              # every month, 5% higher
print(revenue / revenue.sum())     # each month's share of Q4
print(revenue > 40000)             # a Series of True/False
```

الـ Series المكوّنة من `True`/`False` في السطر الأخير تبدو الآن مجرّد تفصيل جانبي. في الدرس 2.4 تصبح الطريقة الأساسية لتصفية الصفوف.

## المحاذاة: pandas تطابق التسميات لا المواقع

حين تجمع بين Series وأخرى، تحاذي pandas بينهما بحسب تسمية الفهرس قبل أن تحسب. هذا الربع الرابع من 2025 مقابل الربع الرابع من 2024، والأشهر مكتوبة عمدًا بترتيب مختلف، وأحدها مفقود:

```python run
import pandas as pd

q4_2025 = pd.Series([30339, 75334, 41153], index=["Oct", "Nov", "Dec"])
q4_2024 = pd.Series([29177, 9360], index=["Nov", "Oct"])
print(q4_2025 - q4_2024)
```

يُطرح أكتوبر من أكتوبر ونوفمبر من نوفمبر، بغضّ النظر عن الترتيب. ديسمبر موجود في 2025 فقط، فنتيجته `NaN` ("ليس رقمًا")، وهي علامة pandas للقيمة المفقودة. لاحظ أن النتيجة أصبحت `float64`: في الأعمدة الكلاسيكية المبنية على NumPy، تكون `NaN` عددًا عشريًا، فالعمود الصحيح الذي يكتسب قيمة مفقودة يتحوّل إلى أعداد عشرية.

:::figure تتّحد الـ Series بمطابقة تسميات الفهرس
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">الـ Series على اليسار فيها Oct و Nov و Dec. والـ Series على اليمين فيها Nov و Oct بترتيب مختلف. خطوط تصل بين التسميات المتطابقة. النتيجة فيها Oct و Nov محسوبين، و Dec قيمته NaN لأنه بلا نظير.</title>
  <text class="d-label-strong" x="70" y="26" text-anchor="middle">q4_2025</text>
  <rect class="d-box" x="20" y="40" width="100" height="40" rx="6"/>
  <text class="d-label" x="70" y="65" text-anchor="middle">Oct 30339</text>
  <rect class="d-box" x="20" y="90" width="100" height="40" rx="6"/>
  <text class="d-label" x="70" y="115" text-anchor="middle">Nov 75334</text>
  <rect class="d-box" x="20" y="140" width="100" height="40" rx="6"/>
  <text class="d-label" x="70" y="165" text-anchor="middle">Dec 41153</text>
  <text class="d-label-strong" x="300" y="26" text-anchor="middle">q4_2024</text>
  <rect class="d-box" x="250" y="40" width="100" height="40" rx="6"/>
  <text class="d-label" x="300" y="65" text-anchor="middle">Nov 29177</text>
  <rect class="d-box" x="250" y="90" width="100" height="40" rx="6"/>
  <text class="d-label" x="300" y="115" text-anchor="middle">Oct 9360</text>
  <path class="d-line d-dashed" d="M120 60 L250 110"/>
  <path class="d-line d-dashed" d="M120 110 L250 60"/>
  <path class="d-arrow" d="M370 110 L440 110" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="560" y="26" text-anchor="middle">الفرق</text>
  <rect class="d-box-success" x="490" y="40" width="140" height="40" rx="6"/>
  <text class="d-label" x="560" y="65" text-anchor="middle">Oct 20979</text>
  <rect class="d-box-success" x="490" y="90" width="140" height="40" rx="6"/>
  <text class="d-label" x="560" y="115" text-anchor="middle">Nov 46157</text>
  <rect class="d-box-warn" x="490" y="140" width="140" height="40" rx="6"/>
  <text class="d-label" x="560" y="165" text-anchor="middle">Dec NaN</text>
  <text class="d-label-muted" x="350" y="215" text-anchor="middle">تُطابَق التسميات أولًا؛ والتسمية التي بلا نظير تعطي NaN</text>
</svg>
:::

:::mistake توقّع المطابقة بحسب الموقع
إذا كان لـ Series وأخرى فهرسان مختلفان، كأن تكون إحداهما مسمّاة بأسماء الأشهر والأخرى بأرقامها، فكل نتيجة ستكون `NaN` ولن يظهر أي خطأ. حين تعيد عملية حسابية فجأة عمودًا كاملًا من `NaN`، قارن الفهرسين بـ `print(a.index, b.index)` قبل أي شيء آخر.
:::

## الـ DataFrame: جدول من الـ Series

الـ **DataFrame** عدة Series جنبًا إلى جنب، تتشارك فهرسًا واحدًا. أسهل طريقة لبناء DataFrame صغير هي شكل قاموس القوائم الذي تعرّفت عليه في الدرس 1.3، مفتاح لكل عمود:

```python run
import pandas as pd

products = pd.DataFrame({
    "name": ["Cast Iron Skillet 26cm", "Burr Coffee Grinder", "Standing Desk 140cm", "Cork Yoga Mat"],
    "unit_price": [39, 129, 449, 72],
    "unit_cost": [17.45, 76.99, 204.98, 41.52],
})
print(products)
print(products.shape)       # (rows, columns)
print(products.dtypes)
```

ثلاث خصائص (attributes) تصف أي DataFrame، وستطبعها باستمرار. `shape` هو زوج (الصفوف، الأعمدة)، و`columns` تسرد أسماء الأعمدة، و`index` يحمل تسميات الصفوف. لا أقواس بعد أيٍّ منها، لأنها حقائق مخزّنة عن الجدول وليست أفعالًا؛ أما `head()` و`sum()` فتقومان بعمل، لذا تُستدعيان بأقواس. الخلط بين الاثنين يعطيك إما method مطبوعة بالشكل `<bound method ...>` أو `TypeError: 'tuple' object is not callable`، وكلاهما صار بإمكانك التعرّف عليه الآن.

أعطت pandas الصفوف فهرسًا افتراضيًا من 0 إلى 3. كل عمود Series تستطيع استخراجها بالأقواس المربعة، والعمليات الحسابية بين الأعمدة تتحاذى صفًا بصف لأن الأعمدة تتشارك ذلك الفهرس:

```python run
import pandas as pd

products = pd.DataFrame({
    "name": ["Cast Iron Skillet 26cm", "Burr Coffee Grinder", "Standing Desk 140cm", "Cork Yoga Mat"],
    "unit_price": [39, 129, 449, 72],
    "unit_cost": [17.45, 76.99, 204.98, 41.52],
})
margin = products["unit_price"] - products["unit_cost"]
print(margin)
print(type(products["unit_price"]))
```

تربح المقلاة 21.55 دولارًا عن كل وحدة، والمكتب الواقف 244.02. أربعة صفوف أو أربعة ملايين، الكود هو نفسه، وهذا هو الوعد الحقيقي لـ pandas: تفكّر بالأعمدة لا بالخلايا.

:::tip الفرق بين print(df) و df
في Jupyter notebook، كتابة `products` وحدها في آخر سطر من الخلية تعرض جدولًا منسّقًا. أما في الـ scripts وفي كتل Run في هذه الدورة، فلا يظهر شيء ما لم تستدعِ `print()`. الكائن هو نفسه في الحالتين؛ الاختلاف في العرض فقط.
:::

بناء الجداول باليد للتعلّم فقط. في الدرس التالي تحمّل ملفات CSV الحقيقية الخاصة بـ Cartwheel، وتتعلّم روتين الفحص الذي تشغّله قبل أن تثق بأيٍّ منها.
