---
summary: أنشئ أعمدة محسوبة بعمليات حسابية متّجهة، وابنِ أعمدة شرطية بـ ‎.loc و np.where، وحوّل الأكواد إلى تسميات، وغيّر القيم بأمان وفق قواعد Copy-on-Write في pandas.
takeaways:
  - "`df[\"new\"] = expression` تضيف عمودًا محسوبًا لكل الصفوف دفعة واحدة؛ و`assign()` تفعل الشيء نفسه وتعيد DataFrame جديدًا."
  - "غيّر القيم الموجودة باستدعاء واحد `.loc[row_mask, \"col\"] = value`، ولا تستخدم أبدًا الأقواس المتسلسلة مثل `df[\"col\"][mask] = value`."
  - "`np.where(condition, a, b)` تبني عمودًا بخيارين؛ وإسنادات `.loc` المتتالية أو `np.select` تتعامل مع فئات أكثر."
  - "`map()` مع قاموس تحوّل الأكواد إلى تسميات، والقيم غير الموجودة في القاموس تصبح `NaN`."
  - مع Copy-on-Write تتصرّف كل عملية اختيار كأنها نسخة، فالطريقة الوحيدة لتغيير DataFrame هي الإسناد إليه مباشرة.
further:
  - title: Copy-on-Write (CoW)
    url: https://pandas.pydata.org/docs/user_guide/copy_on_write.html
  - title: pandas.DataFrame.assign
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.assign.html
  - title: numpy.where
    url: https://numpy.org/doc/stable/reference/generated/numpy.where.html
quiz:
  - q: تريد أن تجعل كل خصم أعلى من 0.2 مساويًا لـ 0.2. أيّ سطر يفعل ذلك بشكل صحيح في pandas 2 و3؟
    options:
      - text: "`items[\"discount\"][items[\"discount\"] > 0.2] = 0.2`"
        why: هذا إسناد متسلسل. يختار عمودًا أولًا ثم يُسند إلى ذلك الكائن الوسيط؛ ومع Copy-on-Write لا يتغيّر الجدول الأصلي أبدًا.
      - text: "`items[items[\"discount\"] > 0.2][\"discount\"] = 0.2`"
        why: متسلسل أيضًا. التصفية تنشئ جدولًا جديدًا، والإسناد يغيّر ذلك الجدول المؤقت، ويبقى `items` كما كان.
      - text: "`items.loc[items[\"discount\"] > 0.2, \"discount\"] = 0.2`"
        why: صحيح. استدعاء واحد لـ `.loc` يسمّي الصفوف والعمود، فتُسند pandas مباشرة إلى `items`.
      - text: "`items[\"discount\"] == 0.2`"
        why: هذا يقارن ويعيد Series منطقية؛ و`==` لا تُسند أبدًا.
    answer: 2
  - q: "`orders[\"channel_label\"] = orders[\"channel\"].map({\"web\": \"Website\", \"mobile_app\": \"App\"})`. ماذا يحدث لطلبات الـ marketplace؟"
    options:
      - text: تحتفظ بالقيمة `"marketplace"`.
        why: تستبدل `map` كل قيمة؛ وما لا يوجد في القاموس لا يمرّ دون تغيير.
      - text: تصبح تسميتها `NaN`.
        why: صحيح. القيم غير الموجودة في قاموس التحويل تصبح مفقودة. افحص `channel_label.isna().sum()` بعد كل `map`.
      - text: تُطلق pandas الخطأ `KeyError`.
        why: لا تُطلق `map` مع قاموس أي خطأ للقيم المجهولة؛ بل تملؤها بـ `NaN`، ولهذا بالضبط يسهل أن تفوتك.
    answer: 1
  - q: "ماذا ينتج `np.where(items[\"quantity\"] >= 3, \"bulk\", \"regular\")`؟"
    options:
      - text: مصفوفة فيها `"bulk"` أو `"regular"` لكل صف، تستطيع إسنادها كعمود جديد
        why: صحيح. تختار `np.where` من الوسيط الثاني حيث يكون الشرط صحيحًا ومن الثالث في غير ذلك، صفًا بصف.
      - text: الصفوف التي تكون فيها الكمية 3 على الأقل
        why: التصفية تتم بـ `items[mask]`. أما `np.where` بثلاثة وسائط فتبني قيمًا ولا تحذف صفوفًا.
      - text: نص واحد، بحسب الصف الأول
        why: إنها تقيّم كل الصفوف، وتعيد تسمية لكل صف.
    answer: 0
---

في جدول `order_items` الخاص بـ Cartwheel كمية وسعر وحدة وخصم في كل بند من بنوده الـ 3,991، لكن لا يوجد إيراد. الإيراد شيء تحسبه أنت، وطريقة حسابه يجب أن تُكتب حيث يراها الجميع. هذا ما يفعله العمود المحسوب: يحوّل قاعدة عمل إلى سطر كود واحد يُطبَّق على كل صف.

## الأعمدة المحسوبة

الإسناد إلى اسم عمود جديد ينشئه:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["gross"] = items["quantity"] * items["unit_price"]
items["revenue"] = items["gross"] * (1 - items["discount"])
items["discount_amount"] = items["gross"] - items["revenue"]
print(items.head().to_string())
print(round(items["revenue"].sum(), 2), round(items["discount_amount"].sum(), 2))
```

كل سطر يعمل على أعمدة كاملة، صفًا بصف، دون حلقة. النتيجة: إيراد قدره 471,940.08 دولارًا عبر كل البنود، بعد خصومات قدرها 11,658.52 دولارًا. (هذا المجموع ما زال يشمل الطلبات الملغاة؛ وستزيلها في القسم 4 حين تستطيع ربط `order_items` بـ `orders`.)

تفعل `assign()` الشيء نفسه، لكنها تعيد DataFrame جديدًا بدلًا من تغيير الموجود، وهذا يتيح لك تسلسل الخطوات:

```python run
import pandas as pd

items = (
    pd.read_csv("order_items.csv")
    .assign(revenue=lambda d: d["quantity"] * d["unit_price"] * (1 - d["discount"]))
    .assign(is_discounted=lambda d: d["discount"] > 0)
)
print(items[["revenue", "is_discounted"]].head(3))
print(items["is_discounted"].sum(), "discounted lines")
```

الكود `lambda d: ...` دالة صغيرة بلا اسم تستقبل الـ DataFrame عند تلك النقطة من السلسلة. تحتاجها حين تستخدم خطوةٌ عمودًا أُنشئ قبلها في السلسلة نفسها. الأسلوبان جيدان؛ الإسناد العادي أسهل قراءة حين تكون في البداية، والسلاسل تتألّق في دالة التنظيف التي ستكتبها في الدرس 3.5.

## الأعمدة الشرطية

التسمية بخيارين مهمة تناسب الدالة `where` من NumPy، المكتبة التي بُنيت عليها pandas:

```python run
import numpy as np
import pandas as pd

items = pd.read_csv("order_items.csv")
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
items["line_size"] = np.where(items["revenue"] >= 100, "large", "small")
print(items["line_size"].value_counts())
```

اقرأها هكذا: "حيث يكون الإيراد 100 على الأقل، `large`؛ وفي غير ذلك، `small`". ولثلاث فئات أو أكثر، ابدأ بقيمة افتراضية ثم استبدل مجموعات فرعية بـ `.loc`:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
items["discount_band"] = "none"
items.loc[items["discount"] > 0, "discount_band"] = "small"
items.loc[items["discount"] > 0.10, "discount_band"] = "big"
print(items["discount_band"].value_counts())
```

الترتيب مهم تمامًا كما كان مع `if`/`elif` في الدرس 1.4، لكن بالعكس: الإسنادات اللاحقة تكتب فوق السابقة، فانتقل من الشرط الأوسع إلى الأضيق. الخصومات 5% و10% تنتهي في الفئة `small`، و15% و25% في الفئة `big`.

## ترجمة الأكواد بـ map

الأعمدة المليئة بالأكواد (`mobile_app`، والمعرّفات، وأعلام الحالة) تحتاج غالبًا تسميات مقروءة. تترجم `map()` مع قاموس كل قيمة:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv")
labels = {"web": "Website", "mobile_app": "Mobile app", "marketplace": "Marketplace"}
orders["channel_label"] = orders["channel"].map(labels)
print(orders["channel_label"].value_counts())
print(orders["channel_label"].isna().sum(), "unmapped")
```

أي قيمة غير موجودة في القاموس تصبح `NaN`، بصمت. والسطر الأخير هو الفحص الذي يلتقط ذلك: صفر قيم غير مُحوّلة يعني أن لكل قناة تسمية.

## إصلاح نوع العمود بـ astype

أحيانًا تكون القيم صحيحة لكن النوع ليس كذلك. يخزّن `products.csv` العمود `is_active` على هيئة 0 و1، فتقرؤه pandas أعدادًا صحيحة. الجمع يعمل، لكن قارئ كودك لا يستطيع التمييز بين علَم (flag) وعدد، وتُقرأ التصفيات بشكل متكلّف. تحوّل `astype()` عمودًا كاملًا:

```python run
import pandas as pd

products = pd.read_csv("products.csv")
products["is_active"] = products["is_active"].astype(bool)
print(products["is_active"].dtype, products["is_active"].sum(), "active products")
print(products.loc[~products["is_active"], "name"].tolist())
```

ثلاثة منتجات متوقّفة، و`~products["is_active"]` تُقرأ "غير نشط". استخدم `astype` حين يمكن تحويل كل القيم بنظافة؛ ويبيّن القسم 3 ما تفعله حين لا يمكن تحويل بعضها، مثل المجاميع التي فيها علامات دولار.

## تغيير القيم: القاعدة الوحيدة

هذه هي القاعدة التي توفّر عليك ساعات من الارتباك: **لتغيير القيم في DataFrame، أسنِد إليه في خطوة واحدة**، بعمود جديد أو بـ `.loc[rows, column]`. لا تختر ثم تُسند في خطوتين أبدًا:

```python
# Wrong: chained assignment. Under Copy-on-Write this never updates items.
items["discount"][items["discount"] > 0.2] = 0.2

# Right: one .loc call names the rows and the column together.
items.loc[items["discount"] > 0.2, "discount"] = 0.2
```

الشكل الأول يختار العمود `discount`، وهذا ينتج كائنًا جديدًا، ثم يُسند إلى ذلك الكائن. هل تغيّر `items` نفسه؟ كان ذلك يعتمد على تفاصيل pandas الداخلية، وتطبع pandas 2 تحذير `ChainedAssignmentError` أو `SettingWithCopyWarning` حين تلاحظ هذا النمط. أما مع **Copy-on-Write** (السلوك الافتراضي منذ pandas 3.0، والمتاح في pandas 2 عبر `pd.options.mode.copy_on_write = True`)، فتصبح القاعدة بسيطة وصارمة: كل عملية اختيار تتصرّف كنسخة، فلا يحدّث الإسناد المتسلسل الأصل أبدًا. اكتبها بطريقة `.loc` وسيتصرّف كودك بالطريقة نفسها على كل الإصدارات.

:::mistake تعديل جدول مُصفّى وتوقّع تغيّر الأصل
السطر `q4 = orders[in_q4]` ثم `q4["label"] = "Q4"` يضيف العمود إلى `q4` فقط. هذا سلوك صحيح وليس خطأ: الجدول المُصفّى جدول مستقل. وفي pandas 2 دون Copy-on-Write (الإصدار الذي تعمل عليه هذه الدورة) يطبع السطر الثاني أيضًا تحذير `SettingWithCopyWarning`، لأن pandas لا تعرف أيّ الجدولين قصدت تغييره؛ والسطر `q4 = orders[in_q4].copy()` يصرّح بأنك تريد جدولًا مستقلًا ويُسكت التحذير. وإذا كنت تقصد وضع تسمية على صفوف داخل `orders`، فاكتب `orders.loc[in_q4, "label"] = "Q4"`.
:::

:::tip الحذف وإعادة التسمية
تحذف `df.drop(columns=["gross"])` الأعمدة، وتعيد `df.rename(columns={"unit_price": "price"})` تسميتها. كلتاهما تعيد DataFrame جديدًا، فأسنِد النتيجة: `items = items.drop(columns=["gross"])`. نسيان هذا الإسناد هو السبب الأشيع لعودة عمود ظننت أنك حذفته.
:::

بهذا تكتمل أساسيات pandas لديك: التحميل، والفحص، والاختيار، والتصفية، والترتيب، والحساب. يوجّه القسم 3 هذه الأدوات نحو الملف الفوضوي، حيث تنتظرك الخانات الفارغة والأخطاء الكتابية والمبالغ النصية والتواريخ الملتبسة.
