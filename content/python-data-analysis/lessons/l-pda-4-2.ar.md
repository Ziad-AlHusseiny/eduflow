---
summary: ادمج الجداول باستخدام merge، واختر نوع الربط المناسب، واحمِ نفسك من الصفوف المكرّرة باستخدام validate= وعدّ الصفوف، واستخدم indicator=True لتجد السجلات التي لا مطابق لها.
takeaways:
  - "`left.merge(right, on=\"key\", how=...)` تدمج الجداول بمطابقة قيم المفتاح؛ و`how` تقرّر ما يحدث للصفوف التي لا مطابق لها."
  - "`how=\"left\"` تحتفظ بكل صف في الجدول الأيسر، وهي الخيار الافتراضي الآمن لإضافة أعمدة إلى جدول وقائع (fact table)."
  - "مرّر `validate=\"many_to_one\"` (أو `\"one_to_one\"`) كي تُطلق pandas الخطأ `MergeError` إذا لم تكن مفاتيح الجدول الأيمن فريدة، بدلًا من مضاعفة الصفوف بصمت."
  - قارن `len()` قبل كل عملية دمج وبعدها؛ فالدمج الأيسر على مفتاح فريد لا يغيّر عدد الصفوف أبدًا.
  - "تضيف `indicator=True` عمودًا اسمه `_merge` (`both` أو `left_only` أو `right_only`) يبيّن أيّ الصفوف وجدت نظيرًا."
further:
  - title: Merge, join, concatenate and compare
    url: https://pandas.pydata.org/docs/user_guide/merging.html
  - title: pandas.DataFrame.merge
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.merge.html
quiz:
  - q: دمجت `order_items` (3,991 صفًا) دمجًا أيسر مع `orders` على `order_id`. كم صفًا يجب أن يكون في النتيجة؟
    options:
      - text: 2,066، صف لكل طلب
        why: الدمج لا يجمّع؛ كل صف من البنود يبقى صفًا. التجميع هو ما يقلّل الصفوف.
      - text: أكثر من 3,991، لأن للطلبات عدة عناصر
        why: كل بند يطابق طلبًا واحدًا بالضبط، فلا يتضاعف شيء. التكرار يحدث حين يتكرّر مفتاح الجدول الأيمن.
      - text: أقل من 3,991، لأن الطلبات الملغاة تُحذف
        why: عمليات الدمج تطابق المفاتيح؛ ولا تصفّي بحسب الحالة. أنت تصفّي بعد ذلك.
      - text: 3,991 بالضبط، لأن لكل بند طلبًا واحدًا مطابقًا
        why: صحيح. بنود كثيرة لطلب واحد، مع `how="left"`، يحافظ على عدد صفوف الجدول الأيسر. و`validate="many_to_one"` تضمن ذلك.
    answer: 3
  - q: "أيّ عملية دمج تجد العملاء الذين لم يقدّموا أي طلب؟"
    options:
      - text: "`customers.merge(orders, on=\"customer_id\", how=\"inner\")`"
        why: الربط الداخلي (inner join) لا يحتفظ إلا بالعملاء الذين لديهم طلب واحد على الأقل، وهذا عكس ما تريده.
      - text: "`customers.merge(orders, on=\"customer_id\", how=\"left\", indicator=True)`، ثم احتفظ بـ `_merge == \"left_only\"`"
        why: صحيح. الربط الأيسر يحتفظ بكل العملاء، و`left_only` تحدّد من ليس لهم طلب مطابق. وهذا يجد 85 عميلًا.
      - text: "`orders.merge(customers, on=\"customer_id\", how=\"left\")`"
        why: حين تكون الطلبات على اليسار، يكون كل صف طلبًا، فلا يظهر العملاء الذين ليس لهم طلبات أبدًا.
    answer: 1
  - q: "تعيد `orders.merge(tickets, on=\"customer_id\")` 6,624 صفًا من 2,066 طلبًا و873 تذكرة. ما الذي حدث؟"
    options:
      - text: "`customer_id` يتكرّر في الطرفين، فاقترن كل طلب لعميل بكل تذكرة لذلك العميل."
        why: صحيح. هذا ربط كثير إلى كثير (many-to-many). كانت `validate="many_to_one"` ستُطلق خطأً؛ اربط التذاكر بالطلبات على `order_id` بدلًا من ذلك.
      - text: أضافت pandas صفوفًا فارغة للتذاكر التي ليس لها طلبات.
        why: القيمة الافتراضية `how="inner"` لا تضيف أي صفوف غير مطابقة إطلاقًا.
      - text: ألحق الدمج الجدولين أحدهما تحت الآخر.
        why: هذا ما تفعله `pd.concat`. أما الدمج فيطابق الصفوف جنبًا إلى جنب.
    answer: 0
---

سؤال رئيس النمو يحتاج أعمدة من أربعة جداول. الإيراد موجود في `order_items`. أما هل أُلغي الطلب ومتى قُدّم فمعلومتان في `orders`. وفئة المنتج في `products`، ودولة العميل في `customers`. في جدول البيانات كنت ستكتب صيغ بحث (lookup)؛ وفي pandas تستخدم **الدمج (merge)**. عمليات الدمج هي المكان الذي تحدث فيه معظم الأخطاء الصامتة في التحليل، لذا يقضي هذا الدرس في فحص عملية الدمج وقتًا يساوي ما يقضيه في كتابتها.

## أول عملية دمج

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])

lines = items.merge(orders, on="order_id", how="left", validate="many_to_one")
print(len(items), "->", len(lines))
print(lines[["order_item_id", "order_id", "revenue", "order_date", "status"]].head(3))
```

لكل صف في الجدول الأيسر، تبحث pandas عن صف `orders` الذي له `order_id` نفسه، وتنسخ أعمدته إليه. بنود كثيرة تشير إلى طلب واحد، فالعلاقة **كثير إلى واحد (many to one)**، و`validate="many_to_one"` تطلب من pandas أن تتحقّق من ذلك: لو كان في `orders` صفان لمعرّف واحد، لأطلق الدمج الخطأ `MergeError` بدلًا من مضاعفة تلك البنود بهدوء. وعدد الصفوف قبل وبعد هو الفحص الثاني. الدمج الأيسر على مفتاح فريد لا يغيّره أبدًا.

الآن يستطيع الإيراد أخيرًا أن يحترم قاعدة العمل التي أجّلتها في الدرس 2.5: الطلبات الملغاة ليست إيرادًا.

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
lines = items.merge(orders, on="order_id", how="left", validate="many_to_one")

kept = lines[lines["status"] != "cancelled"]
print(round(kept["revenue"].sum(), 2), "revenue excluding cancelled orders")
```

446,666.32 دولارًا. هذا هو تعريف الإيراد في بقية الدورة: إيراد البنود بعد الخصومات، دون رسوم الشحن ودون الطلبات الملغاة. الطلبات المُرجَعة تبقى، لأن مبالغها المستردّة تُتتبَّع منفصلة في `returns`. اكتب تعريفات كهذه حيث يراها القرّاء؛ فالرقم الذي بلا تعريف يدعو إلى الجدال.

حين يكون للمفتاح اسم مختلف في كل طرف، سمِّ الاثنين: `left_on="customer_id", right_on="referred_by"` في دمج `customers` مع نفسه يطابق كل عميل بالأشخاص الذين أحالهم. واختر المفتاح الذي يحدّد ما تطابقه. المرتجعات تخصّ **بنود** الطلبات، فيُربط `returns` بـ `order_items` على `order_item_id`؛ أما ربطه على `order_id` فسيلحق كل مبلغ مسترد بكل بند في الطلب.

## أنواع الربط

تقرّر `how` ما يحدث للمفاتيح الموجودة في طرف واحد فقط:

:::figure أربعة أنواع من الربط، بحسب المفاتيح التي تبقى
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">مفاتيح الجدول الأيسر A و B و C، ومفاتيح الجدول الأيمن B و C و D. يحتفظ inner بـ B و C. ويحتفظ left بـ A و B و C مع أعمدة يمنى فارغة لـ A. ويحتفظ right بـ B و C و D. ويحتفظ outer بـ A و B و C و D.</title>
  <text class="d-label-strong" x="60" y="28" text-anchor="middle">الأيسر</text>
  <rect class="d-box-primary" x="30" y="40" width="60" height="30" rx="5"/><text class="d-code" x="60" y="60" text-anchor="middle">A</text>
  <rect class="d-box-primary" x="30" y="76" width="60" height="30" rx="5"/><text class="d-code" x="60" y="96" text-anchor="middle">B</text>
  <rect class="d-box-primary" x="30" y="112" width="60" height="30" rx="5"/><text class="d-code" x="60" y="132" text-anchor="middle">C</text>
  <text class="d-label-strong" x="150" y="28" text-anchor="middle">الأيمن</text>
  <rect class="d-box-accent" x="120" y="76" width="60" height="30" rx="5"/><text class="d-code" x="150" y="96" text-anchor="middle">B</text>
  <rect class="d-box-accent" x="120" y="112" width="60" height="30" rx="5"/><text class="d-code" x="150" y="132" text-anchor="middle">C</text>
  <rect class="d-box-accent" x="120" y="148" width="60" height="30" rx="5"/><text class="d-code" x="150" y="168" text-anchor="middle">D</text>
  <path class="d-line" d="M210 30 L210 200"/>
  <text class="d-label-strong" x="270" y="28" text-anchor="middle">inner</text>
  <text class="d-code" x="270" y="96" text-anchor="middle">B</text><text class="d-code" x="270" y="132" text-anchor="middle">C</text>
  <text class="d-label-strong" x="380" y="28" text-anchor="middle">left</text>
  <text class="d-code" x="380" y="60" text-anchor="middle">A + NaN</text><text class="d-code" x="380" y="96" text-anchor="middle">B</text><text class="d-code" x="380" y="132" text-anchor="middle">C</text>
  <text class="d-label-strong" x="490" y="28" text-anchor="middle">right</text>
  <text class="d-code" x="490" y="96" text-anchor="middle">B</text><text class="d-code" x="490" y="132" text-anchor="middle">C</text><text class="d-code" x="490" y="168" text-anchor="middle">NaN + D</text>
  <text class="d-label-strong" x="610" y="28" text-anchor="middle">outer</text>
  <text class="d-code" x="610" y="60" text-anchor="middle">A + NaN</text><text class="d-code" x="610" y="96" text-anchor="middle">B</text><text class="d-code" x="610" y="132" text-anchor="middle">C</text><text class="d-code" x="610" y="168" text-anchor="middle">NaN + D</text>
  <text class="d-label-muted" x="440" y="208" text-anchor="middle">تُملأ النظائر المفقودة بـ NaN</text>
</svg>
:::

يحتفظ `inner` (القيمة الافتراضية) فقط بالمفاتيح الموجودة في الطرفين. ويحتفظ `left` بكل صف أيسر، ويملأ الأعمدة اليمنى بـ `NaN` حيث لا يوجد نظير. و`right` صورته المعكوسة، و`outer` يحتفظ بكل شيء. ولإضافة معلومات إلى جدول وقائع، مثل الطلبات أو البنود أو الجلسات، استخدم `how="left"` مع جدول الوقائع على اليسار: لن تفقد أبدًا واقعة لأن جدول البحث ناقص، وقيم `NaN` تبيّن لك بالضبط أين النقص.

## العثور على ما لم يتطابق

تضيف `indicator=True` عمودًا اسمه `_merge` يسجّل من أين جاء كل صف:

```python run
import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
buyers = orders[["customer_id"]].drop_duplicates()

check = customers.merge(buyers, on="customer_id", how="left", indicator=True)
print(check["_merge"].value_counts())
never_ordered = check[check["_merge"] == "left_only"]
print(len(never_ordered), "customers never ordered")
```

85 عميلًا سجّلوا ولم يشتروا شيئًا، وهو العدد نفسه الذي وجدته بـ `nunique` في الدرس 2.2، لكنه الآن قائمة أسماء تستطيع تسليمها لفريق التسويق. و`indicator=True` هي أيضًا أسرع تدقيق لأيّ عملية دمج: صفوف `right_only` مستحيلة في الربط الأيسر، والعدد المفاجئ من صفوف `left_only` يعني أن مفاتيح يُفترض أن تتطابق لا تتطابق، وكثيرًا ما يكون السبب الأنواع (`int` في طرف ونص في الآخر) أو مسافات لم تُحذف.

## اسم العمود نفسه في الطرفين

في `order_items` و`products` كليهما عمود `unit_price`: السعر المدفوع وسعر القائمة. تضيف pandas لاحقتين (suffixes) للتمييز بينهما، وتستطيع اختيارهما:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
products = pd.read_csv("products.csv")

lines = (
    items.merge(orders[["order_id", "order_date"]], on="order_id", validate="many_to_one")
    .merge(products[["product_id", "name", "unit_price"]], on="product_id",
           suffixes=("_charged", "_list"), validate="many_to_one")
)
lines["price_ratio"] = (lines["unit_price_charged"] / lines["unit_price_list"]).round(2)
print(lines.groupby(lines["order_date"] >= "2025-03-01")["price_ratio"].agg(["min", "max"]))
```

قبل مارس 2025، كان كل بند يُباع بسعر القائمة بالضبط؛ ومن 1 مارس، صار كل بند يُباع بزيادة 5%. لقد أكّد الدمج للتو زيادة الأسعار من البيانات وحدها، وهي أحد المشتبه بهم في قفزة إيراد الربع الرابع.

:::mistake الربط على مفتاح يتكرّر في الطرفين
تعيد `orders.merge(tickets, on="customer_id")` 6,624 صفًا من 2,066 طلبًا و873 تذكرة: كل طلب لعميل يقترن بكل تذكرة لذلك العميل. اجمع الإيراد على ذلك فتحسب الطلبات عدة مرات. تحوّل `validate="many_to_one"` هذا إلى خطأ `MergeError` فوري. اكتبها في كل عملية دمج تتوقّع فيها أن يكون الطرف الأيمن فريدًا؛ فهي لا تكلّف شيئًا وتلتقط أغلى خطأ في هذا الدرس.
:::

في التمرين تبني الجدول الكامل على مستوى البنود الذي تحلّله بقية الدورة. وفي الدرس التالي تعيد تشكيل الجداول بين الصيغتين العريضة والطويلة باستخدام `pivot_table` و`melt`.
