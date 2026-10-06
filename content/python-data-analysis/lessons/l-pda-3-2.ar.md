---
summary: نظّف الأعمدة النصية باستخدام الـ accessor المسمّى ‎.str - احذف المسافات، ووحّد حالة الأحرف، واستبدل الحروف، وقسّم الأسماء، وابحث عن الأنماط - ثم تحقّق من النتيجة مقابل القيم التي تتوقّعها.
takeaways:
  - الـ accessor المسمّى `.str` يطبّق method نصية على كل قيمة في العمود، وتبقى القيم المفقودة مفقودة بدلًا من أن تسبّب أخطاء.
  - "`str.strip()` وحالة أحرف موحّدة (`str.title()` أو `str.lower()`) تصلح معظم الكتابات المختلفة؛ تحقّق منها بـ `nunique()` قبل وبعد."
  - "`str.replace(old, new)` تعامل `old` كنص عادي افتراضيًا في pandas 2؛ مرّر `regex=True` فقط حين تقصد نمطًا."
  - "`str.split(\" \", expand=True)` تحوّل عمودًا نصيًا واحدًا إلى عدة أعمدة، و`str.contains()` تبني قناعًا منطقيًا من نمط."
  - اختم كل تنظيف نصي بفحص مقابل قائمة القيم التي تتوقّعها، كي تفشل كتابة جديدة الشهر القادم بصوت عالٍ.
further:
  - title: Working with text data
    url: https://pandas.pydata.org/docs/user_guide/text.html
  - title: pandas.Series.str.replace
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.str.replace.html
  - title: pandas.Series.str.split
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.str.split.html
quiz:
  - q: "في `messy[\"country\"]` 22 قيمة مختلفة لثماني دول حقيقية. أيّ سطر هو الإصلاح الذي يجب أن تكتبه؟"
    options:
      - text: "`messy[\"country\"].str.title()`"
        why: يعطي 8 في هذا الملف مصادفةً، لأن كتابات الدول فيه لا تختلف إلا في حالة الأحرف. لكن قيمة فيها مسافة زائدة في ملف الشهر القادم ستبقى مختلفة عن نظيرتها النظيفة، فاحذف المسافات أولًا كما تفعل مع أي عمود تجمّع بحسبه.
      - text: "`messy[\"country\"].str.strip().str.title()`"
        why: صحيح. حذف المسافات يزيل الفروق غير المرئية، وحالة العنوان (title case) تجعل `EGYPT` و`egypt` و`Egypt` قيمة واحدة.
      - text: "`messy[\"country\"].unique()`"
        why: هذا يسرد الكتابات الـ 22؛ ولا يغيّر أيًّا منها.
      - text: "`messy[\"country\"].str.replace(\" \", \"\")`"
        why: هذا يحذف المسافات داخل الأسماء، فتصبح `United Kingdom` `UnitedKingdom`، ويترك اختلافات حالة الأحرف كما هي.
    answer: 1
  - q: "لماذا يسبّب `messy.product.str.contains(\"Coffee\")` الخطأ `AttributeError: 'function' object has no attribute 'str'`؟"
    options:
      - text: "`product` اسم method في الـ DataFrame، فيعيد الوصول بالنقطة الـ method بدلًا من العمود."
        why: صحيح. الـ method `DataFrame.product()` تضرب القيم، وتحجب العمود. أما `messy["product"]` فتصل إلى العمود دائمًا.
      - text: العمود فيه قيم مفقودة.
        why: القيم المفقودة تجعل methods الـ `.str` تعيد `NaN` لتلك الصفوف؛ ولا تسبّب `AttributeError`.
      - text: "`contains` لا تعمل إلا على الأعمدة المحمّلة بـ `dtype=\"string\"`."
        why: تعمل `.str.contains` على الأعمدة النصية العادية (object) أيضًا.
    answer: 0
  - q: "نظّفت عمود الدولة ثم شغّلت `assert set(clean) <= set(EXPECTED)`. ما فائدة هذا الـ assertion؟"
    options:
      - text: يسرّع عمليات groupby اللاحقة.
        why: الـ assertion يفحص شرطًا فقط؛ ولا يغيّر البيانات أو الأداء.
      - text: يرتّب الدول أبجديًا.
        why: المجموعات (sets) ليس لها ترتيب، والفحص لا يغيّر شيئًا.
      - text: يوقف الـ script إذا كانت أيّ قيمة منظّفة ليست من الدول المعروفة، مثل خطأ كتابي جديد الشهر القادم.
        why: صحيح. assertion فاشل أفضل بكثير من تقرير فيه "دولة" تاسعة تحمل بهدوء جزءًا من الإيراد.
    answer: 2
---

اسأل الملف الفوضوي: إلى كم دولة تبيع Cartwheel؟ فيقول 22. الإجابة الحقيقية ثماني دول. والأربع عشرة الأخرى هي الدول نفسها مكتوبة بالشكل `UNITED KINGDOM` و`united kingdom` وغيرهما. جمّع الإيراد بحسب الدولة الآن، فتتوزّع مبيعات المملكة المتحدة على ثلاثة صفوف، كلٌّ منها أصغر من حقيقته. تنظيف النصوص عمل غير لامع، لكنه الفرق بين رسم بياني صحيح وآخر خاطئ.

## الـ accessor المسمّى ‎.str

للـ Series النصية خاصية `.str` تكشف methods النصوص في Python، وتطبّقها على كل القيم دفعة واحدة:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
print(messy["country"].nunique(), "spellings")
print(messy["country"].value_counts().tail(6))

clean = messy["country"].str.strip().str.title()
print(clean.nunique(), "countries")
print(sorted(clean.unique()))
```

كل استدعاء لـ `.str` يعيد Series جديدة، فتسلسلها: احذف المسافات، ثم وحّد حالة الأحرف. تصبح الكتابات الـ 22 ثماني، وهذا يطابق الدول الثماني التي تبيع لها Cartwheel فعلًا. والقيم المفقودة تمرّ مفقودة بدلًا من أن تسبّب خطأً، وهذه هي الميزة الأساسية مقارنةً بكتابة حلقة تستدعي `.strip()` على كل قيمة بنفسك. وعدّ القيم المختلفة قبل التنظيف وبعده، كما يفعل أمرا الطباعة الأول والثالث، هو أسرع دليل على أن التنظيف فعل ما قصدته.

تعمل `title()` هنا لأن كل دول Cartwheel أسماء مكوّنة من كلمات عادية. لكنها ستُفسد قيمًا مثل `USA` (فتصبح `Usa`) أو `McDonald` (فتصبح `Mcdonald`). حين يكون في العمود قيم كهذه، استخدم `str.lower()` للمقارنة، أو قاموس تحويل مع `map()` كما في الدرس 2.5.

## المسافات غير المرئية

ثلاثة عشر اسم عميل في الملف المُصدَّر فيها مسافات قبلها أو بعدها. تبدو متطابقة في الجدول، فالطريقة الوحيدة لرؤيتها هي القياس:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
padded = messy["customer"] != messy["customer"].str.strip()
print(padded.sum(), "padded names")
print(messy.loc[padded, "customer"].head(3).map(repr).tolist())
messy["customer"] = messy["customer"].str.strip()
```

تعرض `repr()` النص مع علامات تنصيصه، فتجعل المسافات مرئية: `'  Hassan Hughes '`. الأسماء التي لم تُحذف مسافاتها تكسر بالضبط العمليات التي ستعتمد عليها لاحقًا: التجميع، والمطابقة مع جدول آخر، وحذف المكرّرات. احذف المسافات من كل عمود نصي ستجمّع أو تربط عليه، حتى لو بدا نظيفًا. وتحذف `str.strip()` أكثر من المسافات العادية: علامات الجدولة (tabs)، وفواصل الأسطر، والمسافات غير القابلة للكسر التي يحملها كثيرًا النص المنسوخ من صفحات الويب وملفات PDF، كلها مسافات بيضاء بالنسبة إلى Python، فيتعامل معها استدعاء واحد.

## الاستبدال والتقسيم والبحث

يكتب الملف المُصدَّر القناة `mobile app`، بينما تستخدم جداول Cartwheel النظيفة `mobile_app`. مطابقة الأعراف الآن توفّر عليك ربطًا فاشلًا في القسم 4:

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
messy["channel"] = messy["channel"].str.replace(" ", "_")
print(messy["channel"].value_counts(dropna=False))

names = messy["customer"].str.strip().str.split(" ", expand=True)
names.columns = ["first_name", "last_name"]
print(names.head(3))

coffee = messy["product"].str.contains("coffee", case=False)
print(coffee.sum(), "coffee lines")
```

تعيد `str.split(" ", expand=True)` جدولًا (DataFrame) فيه عمود لكل جزء؛ وبدون `expand` تحصل على Series من القوائم، و`.str[0]` تختار الجزء الأول من كل منها. وتعيد `str.contains()` قناعًا منطقيًا جاهزًا للتصفية كما في الدرس 2.4، و`case=False` تتجاهل حالة الأحرف.

:::mistake الوصول بالنقطة إلى عمود اسمه product
يفشل `messy.product.str.contains("Coffee")` بالخطأ `AttributeError: 'function' object has no attribute 'str'`، لأن `product` هو أيضًا اسم method في الـ DataFrame تضرب القيم. هذه مشكلة الحجب من الدرس 2.3 في الواقع العملي. الأقواس المربعة، `messy["product"]`، تصل إلى العمود دائمًا.
:::

### نص عادي أم نمط؟

تستطيع `str.replace` و`str.contains` أيضًا أن تأخذا **تعابير نمطية (regular expressions)**، وهي لغة مصغّرة لأنماط النصوص. في pandas 2 تعامل `str.replace` الوسيط الأول كنص عادي ما لم تمرّر `regex=True`، وتعامله `str.contains` كنمط ما لم تمرّر `regex=False`. ويوقعك هذا الفرق في المشكلات مع الرموز التي لها معنى خاص في الأنماط، مثل `$` و`.` و`(`. ويعرض الدرس 3.3 حالة `$`، التي تمسّ كل عمود مبالغ مالية ستنظّفه في حياتك.

## أثبت أن العمود نظيف

كود التنظيف الذي نجح مع ملف هذا الشهر قد يقابل كتابة جديدة الشهر القادم. اختم بفحص يحدّد معنى "نظيف":

```python run
import pandas as pd

EXPECTED = {"Egypt", "United Arab Emirates", "Saudi Arabia", "Jordan",
            "United Kingdom", "Germany", "United States", "Canada"}

messy = pd.read_csv("orders_messy.csv")
messy["country"] = messy["country"].str.strip().str.title()
unexpected = set(messy["country"]) - EXPECTED
assert not unexpected, f"Unknown countries: {unexpected}"
print("country column OK:", messy["country"].nunique(), "values")
```

لا تفعل `assert condition, message` شيئًا حين يكون الشرط صحيحًا، وتوقف الـ script برسالتك حين يكون خاطئًا. طرح المجموعات يسرد أيّ قيمة منظّفة ليست في القائمة المتوقّعة، وتضعها الـ f-string في رسالة الخطأ لتعرف بالضبط ما الذي تصلحه.

:::tip النوع category
العمود النصي الذي فيه قيم قليلة متكرّرة، مثل الدولة أو القناة، يمكن تخزينه بـ `astype("category")`. يستهلك ذاكرة أقل ويسجّل القيم المسموح بها. وهو اختياري لجدول من 168 صفًا؛ استخدمه حين يكون في الملف ملايين الصفوف، ومرّر `observed=True` حين تجمّع بحسبه.
:::

في التمرين تنظّف الأعمدة النصية الثلاثة في الملف المُصدَّر. وبعدها تأتي المجاميع: أرقام محبوسة داخل نصوص مثل `$1,234.50`.
