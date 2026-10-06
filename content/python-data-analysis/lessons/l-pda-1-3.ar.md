---
summary: احتفظ بقيم كثيرة في القوائم، وابحث عن السجلات بالمفتاح في القواميس، واكتشف كيف أن قائمة من القواميس هي أصلًا جدول صغير.
takeaways:
  - القوائم (lists) مرتّبة وتبدأ مواقعها من 0؛ `items[-1]` هو العنصر الأخير، و`items[a:b]` يتوقّف قبل الموقع `b`.
  - الدوال `sum()` و`len()` و`max()` و`min()` و`sorted()` تعمل على أي قائمة أرقام، وتجيب عن معظم الأسئلة السريعة.
  - القاموس (dict) يربط مفاتيح بقيم؛ استخدم `d[key]` حين يجب أن يكون المفتاح موجودًا، و`d.get(key, default)` حين قد لا يكون موجودًا.
  - قائمة من القواميس لها المفاتيح نفسها هي جدول، كل قاموس فيها صف، وهذا بالضبط ما يعمّمه الـ DataFrame.
further:
  - title: Data Structures - More on Lists
    url: https://docs.python.org/3/tutorial/datastructures.html#more-on-lists
  - title: Data Structures - Dictionaries
    url: https://docs.python.org/3/tutorial/datastructures.html#dictionaries
  - title: Built-in Types - Mapping Types (dict)
    url: https://docs.python.org/3/library/stdtypes.html#mapping-types-dict
quiz:
  - q: |
      تحتوي `monthly` على 12 مجموعًا شهريًا، أولها يناير. أيّ تعبير يعطي مجموع أبريل ومايو ويونيو؟
    options:
      - text: "`sum(monthly[4:6])`"
        why: الموقع 4 هو مايو (يناير هو 0)، والشريحة تتوقّف قبل 6، فهذا يجمع مايو ويونيو فقط.
      - text: "`sum(monthly[3:6])`"
        why: صحيح. أبريل في الموقع 3، والشريحة تشمل 3 و4 و5 وتتوقّف قبل 6.
      - text: "`sum(monthly[3:5])`"
        why: موقع التوقّف مُستبعَد، فهذا يغطي أبريل ومايو فقط.
      - text: "`sum(monthly[4:7])`"
        why: هذا يبدأ من مايو. العدّ من 1 بدلًا من 0 هو خطأ "الإزاحة بواحد" (off-by-one) الكلاسيكي.
    answer: 1
  - q: "`prices = {\"Desk Mat XL\": 29}`. ماذا تعيد `prices.get(\"Monitor Arm\", 0)`؟"
    options:
      - text: خطأ `KeyError`
        why: الكود `prices["Monitor Arm"]` هو الذي يسبّب `KeyError`. والـ method `.get()` موجودة تحديدًا لتجنّب ذلك.
      - text: "`None`"
        why: لا تعيد `.get()` القيمة `None` إلا حين لا تمرّر قيمة افتراضية. والقيمة الافتراضية هنا 0.
      - text: "`0`"
        why: صحيح. المفتاح غير موجود، فتعيد `.get()` القيمة الافتراضية التي مرّرتها.
    answer: 2
  - q: |
      ماذا يطبع هذا الكود؟
      ```python
      totals = [65, 18, 33]
      backup = totals
      totals.append(35)
      print(len(backup))
      ```
    options:
      - text: "`4`"
        why: صحيح. السطر `backup = totals` لا ينسخ القائمة؛ الاسمان يشيران إلى القائمة نفسها، فتظهر القيمة المضافة عبر أي منهما.
      - text: "`3`"
        why: سيكون هذا صحيحًا لو كانت `backup` نسخة، مثل `totals.copy()`. الإسناد العادي لا ينسخ أبدًا.
      - text: خطأ، لأننا لم نُضِف شيئًا إلى `backup`
        why: توجد هنا قائمة واحدة فقط، مرتبط بها اسمان. و`len(backup)` تعمل بلا مشكلة.
    answer: 0
  - q: تحتاج سعر منتج بحسب اسمه، آلاف المرات. أيّ بنية تناسب أكثر؟
    options:
      - text: قائمة أسعار تبحث فيها بحلقة تكرار كل مرة
        why: يعمل ذلك، لكن كل بحث يمرّ على القائمة كلها، وتحتاج قائمة منفصلة لتعرف أيّ سعر يخصّ أيّ اسم.
      - text: قاموس مفاتيحه أسماء المنتجات وقيمه الأسعار
        why: صحيح. البحث في القاموس بالمفتاح مباشر وسريع، والربط بين الاسم والسعر جزء من البنية نفسها.
      - text: نص واحد يحتوي كل الأسماء والأسعار مفصولة بفواصل
        why: ستضطر إلى تقسيم النص والبحث فيه كل مرة؛ النصوص للنص، لا للبحث.
    answer: 1
---

متغيّر واحد لكل قيمة طريقة تتوقّف عن العمل لحظة أن يصبح لديك إيراد اثني عشر شهرًا، أو 48 منتجًا. حاويتا Python الأساسيتان تحلّان هذه المشكلة: **القائمة (list)** للقيم المرتّبة، و**القاموس (dictionary)** للقيم التي تبحث عنها بالاسم. وهما معًا يغطيان تقريبًا كل شكل بيانات ستقابله قبل أن تتولّى pandas المهمة.

## القوائم: قيم مرتّبة

هذا إيراد Cartwheel في 2025 بحسب الشهر، بالدولار، بدءًا من يناير:

```python run
monthly_2025 = [16167, 14906, 18208, 18817, 17428, 13933,
                22968, 32042, 25514, 30339, 75334, 41153]

print(len(monthly_2025))   # 12 items
print(monthly_2025[0])     # January: positions start at 0
print(monthly_2025[-1])    # December: negative positions count from the end
print(sum(monthly_2025), max(monthly_2025), min(monthly_2025))
```

تبدأ المواقع (indexes) من 0، فيكون الشهر الثاني عشر في الموقع 11. وطلب `monthly_2025[12]` يسبّب الخطأ `IndexError: list index out of range`.

### التقطيع (slicing)

الشريحة `items[start:stop]` تأخذ مجموعة متتالية من العناصر. البداية مشمولة والنهاية **مستبعَدة**، وهذا يبدو غريبًا في البداية ثم يصبح مريحًا: `[0:3]` هي ثلاثة عناصر بالضبط.

```python run
monthly_2025 = [16167, 14906, 18208, 18817, 17428, 13933,
                22968, 32042, 25514, 30339, 75334, 41153]

q1 = monthly_2025[0:3]     # Jan, Feb, Mar
q4 = monthly_2025[-3:]     # last three: Oct, Nov, Dec
print(q1, sum(q1))
print(q4, sum(q4))
print(sorted(monthly_2025)[:3])   # the three weakest months
```

حقّق الربع الرابع 146,826 دولارًا مقابل 49,281 في الربع الأول: ثلاثة أضعاف. هذه الفجوة هي السؤال الذي ستجيب عنه هذه الدورة في النهاية، وكانت شريحة من سطرين كافية لرؤيتها.

:::mistake العدّ من 1
أبريل هو `monthly_2025[3]` لا `[4]`. حين تعطيك شريحة مجموعًا يبدو خاطئًا قليلًا، افحص الحدود أولًا: `[3:6]` تعني المواقع 3 و4 و5. اطبع الشريحة نفسها، لا مجموعها فقط، حتى تثق بها.
:::

### تعديل القائمة

القوائم قابلة للتعديل (mutable): تستطيع تغييرها في مكانها. الـ method `append()` تضيف إلى النهاية، والإسناد إلى موقع يستبدل العنصر الذي فيه.

```python run
months = ["Jan", "Feb", "Mar"]
months.append("Apr")
months[0] = "January"
print(months, "Mar" in months)
```

العامل `in` يسأل هل القيمة موجودة، ويعيد `True` أو `False`.

ولأن القوائم قابلة للتعديل، يمكن لاسمين أن يتشاركا قائمة واحدة. السطر `backup = months` يربط اسمًا ثانيًا بالقائمة نفسها، فتغيير أحدهما يغيّر "الاثنين". وحين تحتاج فعلًا نسخة مستقلة، اكتب `months.copy()`.

## القواميس: قيم تبحث عنها بالمفتاح

يخزّن القاموس أزواجًا من **المفتاح: القيمة**. المفاتيح غالبًا نصوص، والقيم يمكن أن تكون أي شيء.

```python run
product = {
    "product_id": 7,
    "name": "Burr Coffee Grinder",
    "unit_price": 129,
    "is_active": True,
}
print(product["name"])                 # look up by key
product["unit_price"] = 135.45         # update after the 5% price rise
product["category"] = "Coffee & Tea"   # add a new key
print(product)
print(product.get("launched_on", "unknown"))
```

الكود `product["launched_on"]` سيتعطّل بالخطأ `KeyError: 'launched_on'`. أما `.get()` فتعيد قيمة افتراضية بدلًا من ذلك. استخدم الأقواس المربعة حين يكون غياب المفتاح خطأً تريد أن تعرف به، و`.get()` حين يكون الغياب أمرًا طبيعيًا.

ثلاث methods تتيح لك المرور على القاموس: `.keys()` و`.values()` و`.items()` (الأزواج). ستستخدم `.items()` مع الحلقات في الدرس التالي.

## قائمة من القواميس هي جدول

ضع عدة قواميس لها المفاتيح نفسها داخل قائمة، فيصبح لديك صفوف وأعمدة:

```python run
order_lines = [
    {"order_id": 1000, "product": "Foam Roller", "quantity": 2, "unit_price": 27.3},
    {"order_id": 1001, "product": "Solar Path Lights (6)", "quantity": 2, "unit_price": 44.1},
    {"order_id": 1001, "product": "Burr Coffee Grinder", "quantity": 2, "unit_price": 135.45},
]
print(len(order_lines), "rows")
print(order_lines[1]["product"])        # row 1, column "product"
```

يُقرأ `order_lines[1]["product"]` مثل الإشارة إلى خلية في جدول البيانات: الصف أولًا، ثم العمود.

:::figure بنود الطلب الثلاثة نفسها كقائمة من القواميس وكجدول
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">على اليسار، قائمة تحتوي ثلاثة قواميس، لكل منها المفاتيح order_id و product و quantity. على اليمين، البيانات نفسها مرسومة كجدول: كل قاموس يصبح صفًا، وكل مفتاح يصبح عنوان عمود.</title>
  <text class="d-label-strong" x="20" y="28">قائمة قواميس</text>
  <rect class="d-box" x="20" y="44" width="280" height="44" rx="8"/>
  <text class="d-code" x="32" y="71">{order_id: 1000, product: ..., qty: 2}</text>
  <rect class="d-box" x="20" y="98" width="280" height="44" rx="8"/>
  <text class="d-code" x="32" y="125">{order_id: 1001, product: ..., qty: 2}</text>
  <rect class="d-box" x="20" y="152" width="280" height="44" rx="8"/>
  <text class="d-code" x="32" y="179">{order_id: 1001, product: ..., qty: 2}</text>
  <path class="d-arrow" d="M310 120 L380 120" marker-end="url(#arrow)"/>
  <text class="d-label-strong" x="400" y="28">جدول (DataFrame)</text>
  <rect class="d-box-primary" x="400" y="44" width="280" height="36" rx="6"/>
  <text class="d-label-strong" x="420" y="67">order_id</text>
  <text class="d-label-strong" x="520" y="67">product</text>
  <text class="d-label-strong" x="620" y="67">qty</text>
  <rect class="d-box" x="400" y="86" width="280" height="34" rx="6"/>
  <text class="d-label" x="420" y="108">1000</text>
  <text class="d-label" x="520" y="108">Foam Roller</text>
  <text class="d-label" x="630" y="108">2</text>
  <rect class="d-box" x="400" y="126" width="280" height="34" rx="6"/>
  <text class="d-label" x="420" y="148">1001</text>
  <text class="d-label" x="520" y="148">Solar Lights</text>
  <text class="d-label" x="630" y="148">2</text>
  <rect class="d-box" x="400" y="166" width="280" height="34" rx="6"/>
  <text class="d-label" x="420" y="188">1001</text>
  <text class="d-label" x="520" y="188">Grinder</text>
  <text class="d-label" x="630" y="188">2</text>
  <text class="d-label-muted" x="350" y="232" text-anchor="middle">كل قاموس صف، وكل مفتاح عمود</text>
</svg>
:::

### الشكل الآخر للجدول: قاموس من القوائم

تستطيع أيضًا تخزين الجدول بالطريقة المعاكسة: مفتاح واحد لكل عمود، يحمل قائمة بقيم ذلك العمود.

```python run
order_lines = {
    "order_id": [1000, 1001, 1001],
    "product": ["Foam Roller", "Solar Path Lights (6)", "Burr Coffee Grinder"],
    "quantity": [2, 2, 2],
}
print(order_lines["product"])      # a whole column at once
print(sum(order_lines["quantity"]))
```

قراءة الصفوف سهلة في شكل قائمة القواميس، وجمع الأعمدة سهل في شكل قاموس القوائم. الشكلان يظهران في الواقع: واجهات الـ API وملفات JSON تعطيك عادةً قائمة من السجلات، بينما من يبني جدولًا صغيرًا بيده يكتبه غالبًا عمودًا عمودًا. تقبل pandas الشكلين، وستبني أول DataFrame لك من قاموس قوائم في القسم القادم.

هذا هو الجسر إلى pandas. الـ DataFrame نسخة أقوى بكثير من هذا الجدول: يجمع عمودًا كاملًا دفعة واحدة، ويصفّي الصفوف بحسب شرط، ويقرأ ملف CSV باستدعاء واحد. تعلّم القوائم والقواميس أولًا يعني أنك ستفهم ما تفعله pandas نيابةً عنك، وستتعرّف على شكل قائمة القواميس حين تعطيك API أو ملف JSON بيانات.

:::tip أيّ حاوية تختار؟
استخدم القائمة حين يهم الترتيب وتصل إلى العناصر بموقعها (المجاميع الشهرية، سلسلة من الخطوات). واستخدم القاموس حين تصل إلى العناصر بالاسم (سعر منتج، رمز دولة). إذا وجدت نفسك تبحث في قائمة عن اسم، فما تحتاجه في الحقيقة هو قاموس.
:::

في التمرين تقطّع القائمة الشهرية وتحدّث قاموس الأسعار. وفي الدرس التالي تتيح لك الحلقات والشروط معالجة كل عنصر دون كتابة سطر لكل عنصر.
