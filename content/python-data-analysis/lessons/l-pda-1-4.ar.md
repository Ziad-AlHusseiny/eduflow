---
summary: عالج كل صف في مجموعة بيانات باستخدام حلقات for، واتخذ القرارات بـ if و elif و else، واحسب العدد بالقواميس، واكتب المنطق نفسه بإيجاز على هيئة comprehensions.
takeaways:
  - حلقة `for` تشغّل جسمها المُزاح (indented) مرة لكل عنصر؛ أنشئ المتغيّرات التراكمية مثل `total = 0` قبل الحلقة، لا داخلها.
  - سلسلة `if` / `elif` / `else` تفحص الشروط من الأعلى إلى الأسفل، ولا تشغّل إلا أول فرع يكون شرطه صحيحًا.
  - النمط `counts[key] = counts.get(key, 0) + 1` هو الطريقة المعتادة للعدّ أو الجمع بحسب المجموعة باستخدام قاموس.
  - الـ list comprehension بالشكل `[expr for x in items if condition]` تبني قائمة جديدة في سطر واحد مقروء.
  - في pandas نادرًا ما تكتب حلقات، لأن العمليات على الأعمدة تقوم بالتكرار نيابةً عنك؛ لكن الحلقات تبقى طريقتك لفهم ما تفعله تلك العمليات.
further:
  - title: More Control Flow Tools (if, for, range)
    url: https://docs.python.org/3/tutorial/controlflow.html
  - title: List Comprehensions
    url: https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions
quiz:
  - q: |
      ماذا يطبع هذا الكود؟
      ```python
      totals = [65, 18, 33]
      for t in totals:
          running = 0
          running += t
      print(running)
      ```
    options:
      - text: "`116`"
        why: هذا يتطلّب أن يكون `running = 0` قبل الحلقة. أما هنا فيُعاد تصفيره في كل دورة.
      - text: "`33`"
        why: صحيح. يُعاد المتغيّر التراكمي إلى 0 في بداية كل دورة، فلا تبقى إلا القيمة الأخيرة.
      - text: "`0`"
        why: التصفير يحدث قبل الجمع في كل دورة، فتضيف الدورة الأخيرة 33 رغم ذلك.
      - text: خطأ `NameError`
        why: يُنشأ `running` داخل الحلقة في الدورة الأولى، فيكون موجودًا حين تعمل `print`.
    answer: 1
  - q: 'طلب مجموعه 150 يمرّ عبر `if t < 50: "small"` ثم `elif t < 150: "medium"` ثم `else: "large"`. أيّ تصنيف يحصل عليه؟'
    options:
      - text: "`\"medium\"`"
        why: المقارنة `150 < 150` تساوي `False`، فلا يعمل فرع الـ `elif`.
      - text: "`\"large\"`"
        why: صحيح. الشرطان كلاهما خاطئان مع 150، فيعمل فرع الـ `else`.
      - text: التصنيفان `"medium"` و `"large"` معًا
        why: سلسلة `if`/`elif`/`else` تشغّل فرعًا واحدًا على الأكثر، وهو أول فرع يكون شرطه صحيحًا.
    answer: 1
  - q: أيّ comprehension تحتفظ بمجاميع طلبات الويب فقط من قائمة قواميس الطلبات؟
    options:
      - text: "`[o[\"total\"] for o in orders if o[\"channel\"] == \"web\"]`"
        why: صحيح. التعبير الذي قبل `for` هو ما يدخل القائمة الجديدة، والـ `if` في النهاية تصفّي العناصر التي تصل إليها.
      - text: "`[o for o in orders if o[\"channel\"] == \"web\"][\"total\"]`"
        why: هذا يبني قائمة من القواميس ثم يحاول الوصول إلى عنصر في القائمة بنص، وهذا يسبّب `TypeError`.
      - text: "`[o[\"total\"] if o[\"channel\"] == \"web\" for o in orders]`"
        why: شرط التصفية يأتي بعد الـ `for`. والـ `if` التي تأتي قبل الـ `for` لا بد لها من `else`، لذا هذا خطأ في الصياغة.
    answer: 0
---

لديك ستة صفوف من ملف Cartwheel الفوضوي في قائمة من القواميس. تريد قيمتها الإجمالية، وكم جاء من كل قناة بيع، وأيّ الطلبات كانت كبيرة. كتابة سطر لكل صف تنجح مع ستة صفوف وتنهار مع ستة آلاف. حلقة التكرار (loop) تكتب المنطق مرة واحدة، وتكرّره Python لكل صف.

## حلقة for

```python run
orders = [
    {"order_id": 2574, "total": 65.0, "channel": "mobile app"},
    {"order_id": 2069, "total": 18.0, "channel": "mobile app"},
    {"order_id": 1200, "total": 33.0, "channel": "mobile app"},
    {"order_id": 1809, "total": 35.0, "channel": "web"},
    {"order_id": 1434, "total": 72.0, "channel": None},
    {"order_id": 2089, "total": 58.0, "channel": "marketplace"},
]

grand_total = 0
for order in orders:
    grand_total += order["total"]
print(grand_total)
```

اقرأها هكذا: "لكل طلب في orders، شغّل الأسطر المُزاحة". في كل دورة يشير الاسم `order` إلى القاموس التالي. والسطر `grand_total += order["total"]` اختصار لـ `grand_total = grand_total + order["total"]`.

الإزاحة (indentation) في Python ليست زينة: الأسطر المُزاحة (أربع مسافات بحسب العُرف) هي جسم الحلقة، وأول سطر يعود إلى الهامش الأيسر يعمل بعد انتهاء الحلقة. لهذا تقع `print` خارجها: أنت تريد نتيجة واحدة، لا ستًا.

:::mistake تصفير المتغيّر التراكمي داخل الحلقة
إذا انتقل `grand_total = 0` إلى داخل الحلقة، فسيُمسح في كل دورة ولن تحصل إلا على مجموع الطلب الأخير. لا خطأ يظهر، لكن الإجابة خاطئة. المتغيّرات التراكمية (accumulators)، من مجاميع وعدّادات وقوائم فارغة ستضيف إليها، تُنشأ دائمًا **قبل** الحلقة.
:::

## اتخاذ القرارات بـ if و elif و else

الشروط تتيح لكل صف أن يسلك مسارًا مختلفًا. فريق العمليات في Cartwheel يصنّف الطلبات بحسب حجمها:

```python run
totals = [65.0, 18.0, 33.0, 35.0, 72.0, 58.0, 329.0]

for t in totals:
    if t < 50:
        size = "small"
    elif t < 150:
        size = "medium"
    else:
        size = "large"
    print(t, size)
```

تختبر Python الشروط من الأعلى إلى الأسفل ولا تشغّل إلا أول فرع صحيح. الترتيب مهم: لو جاء اختبار الـ 150 أولًا، لصُنّف كل طلب صغير على أنه متوسط أيضًا، لأن 18 أقل من 150 كذلك. ضع الشرط الأضيق أولًا، أو اجعل الشروط غير متداخلة.

تستطيع دمج الشروط بـ `and` و`or` و`not`. وتتيح لك Python أيضًا تسلسل المقارنات كما تكتبها في الرياضيات، وهذا مفيد مع النطاقات:

```python run
t = 89.0
channel = "web"
print(t >= 50 and channel == "web")   # both must be true
print(50 <= t < 150)                  # chained: at least 50 and below 150
print(not channel == "marketplace")   # flips True and False
```

وحين تحتاج أيضًا موقع كل عنصر، لقائمة مرتّبة أو لرسالة مثل "الصف 3 معطوب"، غلّف القائمة بـ `enumerate()`، التي تعطيك الموقع والعنصر معًا: `for position, t in enumerate(totals, start=1):`. فضّلها على عدّ المواقع بيدك في متغيّر منفصل.

## العدّ والجمع بحسب المجموعة

أكثر أنماط الحلقات فائدة في التحليل هو "لكل فئة، اجمع شيئًا". يحتفظ القاموس بمجموع متراكم لكل مفتاح:

```python run
orders = [
    {"order_id": 2574, "total": 65.0, "channel": "mobile app"},
    {"order_id": 2069, "total": 18.0, "channel": "mobile app"},
    {"order_id": 1200, "total": 33.0, "channel": "mobile app"},
    {"order_id": 1809, "total": 35.0, "channel": "web"},
    {"order_id": 1434, "total": 72.0, "channel": None},
    {"order_id": 2089, "total": 58.0, "channel": "marketplace"},
]

revenue_by_channel = {}
for order in orders:
    channel = order["channel"] or "unknown"
    revenue_by_channel[channel] = revenue_by_channel.get(channel, 0) + order["total"]

for channel, revenue in revenue_by_channel.items():
    print(channel, revenue)
```

تفصيلان يحملان هذا الكود. `revenue_by_channel.get(channel, 0)` تعيد المجموع المتراكم حتى الآن، أو 0 في أول مرة تظهر فيها القناة. و`order["channel"] or "unknown"` تستبدل `None` بتسمية مقروءة، لأن `None` تُعامَل كقيمة خاطئة، و`or` تعيد الطرف الأيمن حين يكون الأيسر خاطئًا.

هذا `groupby` مكتوب باليد. في الدرس 4.1 تنجزه pandas في سطر واحد، وأنت الآن تعرف ما يفعله ذلك السطر في الخلفية: المرور على الصفوف، ومعرفة مجموعة كل صف، وتحديث مجموع تلك المجموعة.

## الـ comprehensions: بناء القوائم في سطر واحد

كثيرًا ما توجد الحلقة فقط لتبني قائمة جديدة. والـ **list comprehension** تقول ذلك مباشرة:

```python run
totals = [65.0, 18.0, 33.0, 35.0, 72.0, 58.0, 329.0]

with_rise = [round(t * 1.05, 2) for t in totals]
large = [t for t in totals if t >= 60]
print(with_rise)
print(large, len(large))
```

اقرأ `[t for t in totals if t >= 60]` هكذا: "t، لكل t في totals، إذا كانت t ‏60 على الأقل". الجزء الذي قبل `for` هو ما يدخل القائمة، والـ `if` في النهاية تصفّي. والـ dictionary comprehension تعمل بالطريقة نفسها مع زوج `key: value`:

```python run
countries = ["Canada", "united kingdom", "UNITED KINGDOM", "Saudi Arabia"]
clean = [c.strip().title() for c in countries]
print(clean)
print(sorted(set(clean)))            # unique values, sorted
print({c: len(c) for c in set(clean)})
```

الـ `set` لا يحتفظ إلا بالقيم الفريدة، فيدمج `set(clean)` الكتابتين المختلفتين للمملكة المتحدة في واحدة بعد تنظيفهما. ستطبّق الإصلاح نفسه على عمود كامل باستخدام pandas في الدرس 3.2.

:::tip متى تتوقّف عن الاختصار
الـ comprehension ممتازة ما دامت تتّسع لسطر واحد وتُقرأ كجملة. إذا احتجت شروطًا متداخلة أو عدة خطوات لكل عنصر، فاكتب حلقة عادية: الكود الأوضح أفضل من الكود الأقصر، وأنت في المستقبل من سيضطر إلى تتبّع أخطائه.
:::

## الحلقات مقابل pandas

في pandas لن تكتب حلقة على الصفوف تقريبًا أبدًا. `orders["total"].sum()` تقوم بحلقة الجمع، و`orders.groupby("channel")["total"].sum()` تقوم بنمط القاموس السابق، وكلاهما بكود مُترجَم سريع. فلماذا تتعلّم الحلقات؟ لأنها طريقتك للتحقّق من فهمك لما تفعله عملية pandas، ولأن كثيرًا من العمل الحقيقي (المرور على ملفات، أو على أشهر، أو على قائمة دول لبناء تقرير) يبقى حلقة تحيط بكود pandas.

في التمرين تلخّص اثني عشر صفًا بحسب الدولة. ثم تغلّف منطقًا كهذا في دوال قابلة لإعادة الاستخدام، وتتعلّم قراءة رسائل الخطأ التي تعرضها Python.
