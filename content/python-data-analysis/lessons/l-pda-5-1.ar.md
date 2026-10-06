---
summary: صِف عمودًا رقميًا بصدق باستخدام الوسيط والمئينات والتشتّت، وتعرّف على التوزيعات الملتوية والقيم الشاذة، واقرأ الارتباطات دون أن تخلط بينها وبين الأسباب.
takeaways:
  - في البيانات الملتوية مثل قيم الطلبات، يقع المتوسط فوق الوسيط بكثير؛ أبلغ عن الوسيط (وبضعة مئينات) حين تصف القيمة النموذجية.
  - "تعطي `quantile([0.25, 0.75])` الرُّبيعين؛ والقيم التي تبعد عنهما أكثر من 1.5 ضعف المدى الرُّبيعي تستحق نظرة، لا حذفًا تلقائيًا."
  - "`value_counts(bins=[...])` مدرّج تكراري (histogram) نصي سريع يبيّن شكل التوزيع دون رسم بياني."
  - قارن المجموعات بمتوسطها ووسيطها وحجمها معًا، كي لا يقود الاستنتاجَ طلبٌ كبير واحد أو مجموعة صغيرة جدًا.
  - "تقيس `corr()` مدى تحرّك عمودين معًا؛ والارتباط القوي خيط يستحق التحقيق، وليس أبدًا دليلًا على أن أحدهما يسبّب الآخر."
further:
  - title: Descriptive statistics in pandas
    url: https://pandas.pydata.org/docs/user_guide/basics.html#descriptive-statistics
  - title: pandas.Series.quantile
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.quantile.html
  - title: pandas.DataFrame.corr
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.corr.html
quiz:
  - q: متوسط قيم الطلبات في Cartwheel ‏228 دولارًا والوسيط 147. ماذا يخبرك ذلك عن التوزيع؟
    options:
      - text: إنه ملتوٍ إلى اليمين؛ أقلية من الطلبات الكبيرة تسحب المتوسط فوق الطلب النموذجي.
        why: صحيح. نصف الطلبات كلها أقل من 147 دولارًا، وذيل طويل من الطلبات الكبيرة يرفع المتوسط بمقدار 81 دولارًا.
      - text: البيانات فيها أخطاء، لأن المتوسط والوسيط يجب أن يتساويا.
        why: لا يتساويان إلا في التوزيعات المتماثلة. المبالغ المالية والمُدد والأعداد ملتوية عادةً، دون أي خطأ.
      - text: معظم الطلبات قريبة من 228 دولارًا.
        why: يقول الوسيط إن نصف الطلبات أقل من 147، فليست 228 حيث تقع معظم الطلبات.
      - text: الطلبات الصغيرة أكثر من الكبيرة، فالمتوسط منخفض أكثر من اللازم.
        why: الطلبات الصغيرة الكثيرة مع قليل من الطلبات الضخمة تدفع المتوسط **إلى الأعلى** لا إلى الأسفل.
    answer: 0
  - q: وجدت 125 طلبًا فوق الحد الأعلى 1.5 × IQR. ماذا تفعل بها؟
    options:
      - text: احذفها؛ القيم الشاذة تشوّه المتوسطات.
        why: هذه طلبات حقيقية تساوي 26% من الإيراد. حذفها سيعطي صورة خاطئة عن العمل.
      - text: استبدلها بالوسيط.
        why: استبدال مبيعات حقيقية بقيمة نموذجية اختراع للبيانات، وسيمحو معظم ذلك الربع من الإيراد.
      - text: افحصها، وتحقّق من أنها حقيقية، وأبلغ عن النتائج معها وبدونها إذا كانت تغيّر الاستنتاج.
        why: صحيح. الحد يضع علامة على القيم للمراجعة. الطلبات الكبيرة الحقيقية جزء من القصة، وكثيرًا ما تكون أكثر أجزائها إثارة.
    answer: 2
  - q: في `churn.csv`، ارتباط `days_since_last_order` بـ `churned` يساوي 0.45. أيّ عبارة لها ما يبرّرها؟
    options:
      - text: الفجوات الطويلة بين الطلبات تسبّب انصراف العملاء.
        why: الارتباط لا يستطيع إثبات السبب. قد يعكس كلاهما عاملًا ثالثًا، مثل فقدان العميل اهتمامه.
      - text: العملاء الذين انصرفوا كانت الفجوة منذ آخر طلب لهم أطول في الغالب، فالفجوة إشارة تحذير مفيدة.
        why: صحيح. الارتباط الموجب المتوسط يدعم استخدامها كمؤشّر، وهذا ما تبني عليه دورة تعلّم الآلة، دون ادّعاء سبب.
      - text: 45% من العملاء ذوي الفجوات الطويلة انصرفوا.
        why: معامل الارتباط ليس نسبة من العملاء؛ إنه يقيس قوة علاقة خطية بين ‎-1 و1.
      - text: العلاقة أضعف من أن تكون مفيدة.
        why: 0.45 ارتباط متوسط، والوسيطان (46 يومًا للعملاء النشطين، و214 للمنصرفين) يبيّنان فرقًا عمليًا كبيرًا.
    answer: 1
---

يسألك أحدهم: "ما الطلب النموذجي في Cartwheel؟" فتحسب المتوسط، 228 دولارًا، وتقول ذلك. ثم يصمّم فريق التسويق حدًّا للشحن المجاني حول 228 دولارًا، فيكتشف أن ثلثي الطلبات لا تصل إليه أبدًا. كان المتوسط صحيحًا والإجابة خاطئة، لأن قيم الطلبات ليست موزّعة بالتساوي حول متوسطها. وصف البيانات بصدق يعني وصف شكلها، لا مركزها فقط.

## المتوسط والوسيط والمئينات

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
value = orders["revenue"]

print(value.describe(percentiles=[0.1, 0.25, 0.5, 0.75, 0.9, 0.99]).round(2))
print("skew:", round(value.skew(), 2))
```

اقرأها من الوسط إلى الخارج. **الوسيط (median)** ‏(50%) هو 147 دولارًا: نصف الطلبات كلها أصغر منه. ويقول الرُّبيعان إن النصف الأوسط من الطلبات يقع بين 68 و303 دولارات. المئين التسعون 505 والمئين التاسع والتسعون 1,168، بينما الحد الأقصى 2,117. أما **المتوسط (mean)**، 228، فيقع فوق الوسيط بكثير بسبب ذلك الذيل الأيمن الطويل، ويؤكّد ذلك الالتواء الموجب (skew) البالغ 2.43. للقيمة النموذجية في البيانات الملتوية، اذكر الوسيط؛ وللمجاميع والتوقّعات، المتوسط هو الرقم الصحيح، لأن المتوسط × العدد = المجموع.

`std`، أي الانحراف المعياري، يساوي 241 دولارًا، أكبر من الوسيط نفسه. هذه علامة أخرى على توزيع (distribution) منتشر وملتوٍ؛ وفي هذه الحالة تصف المئينات التشتّت أفضل بكثير من "المتوسط زائد أو ناقص انحراف معياري واحد".

## الشكل دون رسم بياني

تعدّ `value_counts` مع الفئات عدد القيم التي تقع في كل نطاق، وهذا مدرّج تكراري في صيغة نصية:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

print(orders["revenue"].value_counts(bins=[0, 50, 100, 200, 400, 800, 3000]).sort_index())
```

:::figure قيم الطلبات ملتوية: معظم الطلبات صغيرة، وذيل طويل كبير
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">رسم أعمدة لأعداد الطلبات بحسب نطاق القيمة: 338 طلبًا حتى 50 دولارًا، و 398 من 50 إلى 100، و 476 من 100 إلى 200، و 420 من 200 إلى 400، و 256 من 400 إلى 800، و 73 فوق 800. علامة تبيّن الوسيط عند 147 دولارًا في النطاق الثالث والمتوسط عند 228 دولارًا في النطاق الرابع.</title>
  <path class="d-line" d="M40 200 L680 200"/>
  <rect class="d-box-accent" x="60" y="129" width="80" height="71"/>
  <rect class="d-box-accent" x="160" y="116" width="80" height="84"/>
  <rect class="d-box-accent" x="260" y="100" width="80" height="100"/>
  <rect class="d-box-accent" x="360" y="112" width="80" height="88"/>
  <rect class="d-box-accent" x="460" y="146" width="80" height="54"/>
  <rect class="d-box-accent" x="560" y="185" width="80" height="15"/>
  <text class="d-label" x="100" y="122" text-anchor="middle">338</text>
  <text class="d-label" x="200" y="109" text-anchor="middle">398</text>
  <text class="d-label" x="300" y="93" text-anchor="middle">476</text>
  <text class="d-label" x="400" y="105" text-anchor="middle">420</text>
  <text class="d-label" x="500" y="139" text-anchor="middle">256</text>
  <text class="d-label" x="600" y="178" text-anchor="middle">73</text>
  <text class="d-label-muted" x="100" y="220" text-anchor="middle">0-50</text>
  <text class="d-label-muted" x="200" y="220" text-anchor="middle">50-100</text>
  <text class="d-label-muted" x="300" y="220" text-anchor="middle">100-200</text>
  <text class="d-label-muted" x="400" y="220" text-anchor="middle">200-400</text>
  <text class="d-label-muted" x="500" y="220" text-anchor="middle">400-800</text>
  <text class="d-label-muted" x="600" y="220" text-anchor="middle">800+</text>
  <path class="d-line d-dashed" d="M318 40 L318 200"/>
  <text class="d-label-strong" x="318" y="32" text-anchor="middle">الوسيط 147</text>
  <path class="d-arrow d-dashed" d="M374 60 L374 200"/>
  <text class="d-label-strong" x="420" y="56" text-anchor="middle">المتوسط 228</text>
  <text class="d-label-muted" x="350" y="244" text-anchor="middle">قيمة الطلب بالدولار (النطاقات غير متساوية العرض)</text>
</svg>
:::

معظم الطلبات تقع بين 50 و400 دولار، وذيل يرقّ تدريجيًا يمتد إلى ما بعد 800. لاحظ أن النطاقات تتّسع كلما اتجهت يمينًا؛ النطاقات المتساوية العرض بمقدار 100 دولار كانت ستضغط كل شيء تقريبًا في الأعمدة الأولى.

## القيم الشاذة: ضع علامة ثم قرّر

قاعدة عملية شائعة تضع علامة على القيم التي تبعد عن الرُّبيعين أكثر من 1.5 ضعف المدى الرُّبيعي (IQR، المسافة بين الرُّبيعين):

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]
value = orders["revenue"]

q1, q3 = value.quantile([0.25, 0.75])
upper = q3 + 1.5 * (q3 - q1)
big = value > upper
print(f"fence {upper:.2f}: {big.sum()} orders, {value[big].sum() / value.sum():.1%} of revenue")
```

125 طلبًا فوق 656.62 دولارًا، وتجلب معًا 25.9% من الإيراد. هذه ليست أخطاء تُنظَّف: إنها طلبات متعددة العناصر من مكاتب وكراسٍ وأوزان رياضية، حقيقية ومهمة. قاعدة القيم الشاذة (outliers) تخبرك أين تنظر. أخطاء الإدخال، مثل مجموع ضاعت فاصلته العشرية، تُصلَح؛ والقيم المتطرّفة الحقيقية تبقى، وتتحقّق أنت من أن استنتاجك يصمد معها وبدونها.

:::mistake مقارنة متوسطات مجموعات صغيرة وملتوية
طلب واحد بقيمة 2,000 دولار يُضاف إلى مجموعة من 30 طلبًا يحرّك متوسطها بنحو 60 دولارًا. قبل أن تقول "عملاء الـ marketplace ينفقون أقل"، ضع العدد والمتوسط والوسيط جنبًا إلى جنب: `orders.groupby("channel")["revenue"].agg(["count", "mean", "median"])`. هنا تتراوح المتوسطات بين 214 دولارًا (الـ marketplace) و236 (الويب)، لكن أعلى وسيط من نصيب التطبيق، 153 مقابل 147 للويب: المقياسان لا يتّفقان حتى على القناة صاحبة الطلب النموذجي الأكبر.
:::

### العدسة نفسها عبر الزمن

يمكن مقارنة التوزيعات عبر الفترات أيضًا، وهذه المقارنة تحمل دليلًا لدراسة الحالة. إذا قفز إيراد الربع الرابع من 2025 لأن العملاء ملؤوا سلات شراء أكبر، فيجب أن يكون الطلب النموذجي قد كبر:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

quarter = orders["order_date"].dt.to_period("Q")
print(orders.groupby(quarter)["revenue"].agg(["count", "median"]).round(1).tail(4))
```

لم يكبر. بلغ وسيط الطلب في الربع الرابع من 2025 قيمة 151.70 دولارًا، أي **أقل** قليلًا من 159.20 في الربع الثالث، بينما تضاعف عدد الطلبات. أيًّا كان ما حدث في الربع الرابع، فقد تعلّق بعدد الطلبات التي وصلت، لا بحجمها. جدول واحد من الوسيطات استبعد بالفعل تفسيرًا شائعًا.

## الارتباط: التحرّك معًا ليس تسبّبًا

تقيس `corr()` مدى قوة تحرّك عمودين رقميين معًا، من ‎-1 (متعاكسان تمامًا) مرورًا بـ 0 (لا علاقة خطية) إلى 1 (متلازمان تمامًا). في `churn.csv` صف لكل عميل وعلَم `churned` للانصراف:

```python run
import pandas as pd

churn = pd.read_csv("churn.csv")
cols = ["tenure_days", "orders", "days_since_last_order", "support_tickets", "churned"]
print(churn[cols].corr().round(2)["churned"])
print(churn.groupby("churned")["days_since_last_order"].median())
```

العملاء الذين انصرفوا مضت عليهم مدة أطول بكثير منذ آخر طلب: وسيط قدره 214 يومًا مقابل 46، وارتباط (correlation) قدره 0.45. هذا يجعل الفجوة إشارة تحذير جيدة. لكنه لا يبيّن أن الفجوة **تسبّب** الانصراف؛ فالعميل الذي فقد اهتمامه أصلًا يتوقّف عن الطلب وينصرف، والقياسان كلاهما يعكسان تلك الحقيقة الواحدة. عامل الارتباطات كخيوط تستحق التحقيق، واحتفظ بكلمة "يسبّب" للتجارب.

في التمرين تصف قيم طلبات Cartwheel بنفسك. وفي الدرس التالي تحوّل أرقامًا كهذه إلى رسوم بيانية.
