---
summary: صفِّ الصفوف بالأقنعة المنطقية، وادمج الشروط بـ & و | و ~، واستخدم isin و between للتصفيات الشائعة، ورتّب الصفوف أو اختر أعلاها بـ sort_values و nlargest.
takeaways:
  - المقارنة على عمود تعيد قناعًا منطقيًا (boolean mask)؛ و`df[mask]` أو `df.loc[mask, cols]` تحتفظ بالصفوف التي يكون فيها `True`.
  - ادمج الأقنعة بـ `&` (و) و`|` (أو) و`~` (ليس)، وضع كل شرط بين قوسين.
  - "`mask.sum()` تعدّ الصفوف المطابقة و`mask.mean()` تعطي حصتها، دون تصفية أي شيء."
  - الدالة `isin([...])` تحلّ محل السلاسل الطويلة من `==` مع `|`، و`between(a, b)` تشمل الطرفين.
  - تقبل `sort_values` قوائم للترتيب بعدة أعمدة؛ و`nlargest(n, col)` هي الطريق المختصر لقائمة الأعلى n.
further:
  - title: Boolean indexing
    url: https://pandas.pydata.org/docs/user_guide/indexing.html#boolean-indexing
  - title: pandas.DataFrame.sort_values
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.sort_values.html
  - title: pandas.Series.isin
    url: https://pandas.pydata.org/docs/reference/api/pandas.Series.isin.html
quiz:
  - q: "أيّ سطر يحتفظ بطلبات الويب التي استخدمت كوبونًا؟"
    options:
      - text: "`orders[(orders[\"channel\"] == \"web\") & (orders[\"coupon_code\"].notna())]`"
        why: صحيح. كل شرط Series منطقية بين قوسيها، ويُدمجان عنصرًا بعنصر باستخدام `&`.
      - text: "`orders[orders[\"channel\"] == \"web\" and orders[\"coupon_code\"].notna()]`"
        why: "الكلمة `and` تطلب قيمة True/False واحدة لـ Series كاملة، فتُطلق pandas الخطأ `ValueError: The truth value of a Series is ambiguous`."
      - text: "`orders[orders[\"channel\"] == \"web\" & orders[\"coupon_code\"].notna()]`"
        why: بدون أقواس، يُنفَّذ `&` قبل `==`، فتقيّم Python الجزء `"web" & ...` أولًا، فيفشل التعبير أو يعني شيئًا آخر.
      - text: "`orders[\"channel\" == \"web\"][\"coupon_code\"]`"
        why: الجزء `"channel" == "web"` يقارن نصين وقيمته دائمًا `False`؛ ولا ينظر إلى العمود أبدًا.
    answer: 0
  - q: "`mask = orders[\"shipping_fee\"] == 0`. ماذا تعيد `mask.mean()`؟"
    options:
      - text: متوسط رسوم الشحن
        why: هذا ما تعطيه `orders["shipping_fee"].mean()`. أما القناع فيحمل قيمًا منطقية لا رسومًا.
      - text: عدد الطلبات ذات الشحن المجاني
        why: هذا ما تعطيه `mask.sum()`. أما المتوسط فيقسم ذلك العدد على عدد الصفوف.
      - text: حصة الطلبات ذات الشحن المجاني، بين 0 و1
        why: صحيح. `True` تُحسب 1 و`False` تُحسب 0، فيكون متوسط القناع هو نسبة الصفوف التي يكون فيها صحيحًا.
    answer: 2
  - q: تريد الطلبات العشرة ذات أعلى رسوم شحن، والأحدث أولًا بين الرسوم المتساوية. أيّ استدعاء هو الصحيح؟
    options:
      - text: "`orders.sort_values(\"shipping_fee\").head(10)`"
        why: الترتيب الافتراضي تصاعدي، فهذا يعطيك العشرة الأرخص، ولا تُرتَّب الحالات المتعادلة بحسب التاريخ.
      - text: "`orders.sort_values([\"shipping_fee\", \"order_date\"], ascending=[False, True]).head(10)`"
        why: ترتيب التاريخ هنا تصاعدي، فيضع الطلبات الأقدم أولًا بين الرسوم المتساوية.
      - text: "`orders.nlargest(10, \"order_date\")`"
        why: هذا يرتّب بحسب التاريخ لا بحسب الرسوم.
      - text: "`orders.sort_values([\"shipping_fee\", \"order_date\"], ascending=[False, False]).head(10)`"
        why: صحيح. العمودان يُرتَّبان تنازليًا، الرسوم أولًا، ثم التاريخ لكسر التعادل.
    answer: 3
---

سؤال رئيس النمو له نافذة زمنية: الربع الرابع من 2025. قبل أن تستطيع تفسير ذلك الربع، تحتاج إلى عزله، ثم تقطيعه أكثر: أيّ هذه الطلبات استخدم كوبونًا، وأيّها جاء عبر الـ marketplace، وأيّها كان من طلبات الجمعة السوداء. كل واحد من هذه الأسئلة تصفية، وتصفّي pandas بالطريقة نفسها في كل مرة: ابنِ عمودًا من `True`/`False`، ثم احتفظ بصفوف `True`.

## الأقنعة المنطقية

المقارنة على عمود لا تعيد إجابة واحدة؛ بل تعيد إجابة لكل صف:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
is_free = orders["shipping_fee"] == 0
print(is_free.head())
print(is_free.sum(), "orders with free shipping")
print(round(is_free.mean(), 3), "share of all orders")
```

تُسمّى تلك الـ Series المنطقية **قناعًا (mask)**. جمعه يعدّ قيم `True`، ومتوسطه هو حصة الصفوف المطابقة: 43% من طلبات Cartwheel شُحنت مجانًا. كثيرًا ما تعرف ما تحتاجه من العدد وحده، دون تصفية أي شيء.

لتحتفظ بالصفوف المطابقة، ضع القناع داخل الأقواس المربعة، أو داخل `.loc` حين تريد أيضًا اختيار الأعمدة:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
cancelled = orders[orders["status"] == "cancelled"]
print(len(cancelled))
print(orders.loc[orders["shipping_fee"] == 0, ["order_id", "channel", "coupon_code"]].head())
```

## دمج الشروط

الأسئلة الحقيقية فيها عدة شروط. تستخدم pandas العلامة `&` بمعنى "و"، و`|` بمعنى "أو"، و`~` بمعنى "ليس"، وتطبّقها صفًا بصف:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
in_q4 = (orders["order_date"] >= "2025-10-01") & (orders["order_date"] < "2026-01-01")
not_cancelled = orders["status"] != "cancelled"
q4 = orders[in_q4 & not_cancelled]
print(len(orders[in_q4]), "orders in Q4 2025,", len(q4), "not cancelled")
print(q4["channel"].value_counts())
```

منح كل قناع اسمًا، كما هنا، يُبقي التصفيات الطويلة مقروءة، ويتيح لك طباعة كل شرط وعدّه منفردًا حين تبدو نتيجة خاطئة. ويمكن مقارنة عمود datetime بتاريخ مكتوب كنص، `"2025-10-01"`، فتحوّله pandas نيابةً عنك. والحد الأعلى هو "قبل 1 يناير"، لا "في 31 ديسمبر أو قبله"، لأن طلبات 31 ديسمبر لها وقت بعد منتصف الليل.

:::mistake and و or والأقواس المفقودة
الكود `orders[a == 1 and b == 2]` يسبّب `ValueError: The truth value of a Series is ambiguous`. الكلمة `and` في Python تريد True أو False واحدة، والـ Series فيها قيم كثيرة. استخدم `&`. وضع كل شرط بين قوسين: `&` أقوى ارتباطًا من `==`، فيُقيَّم `orders["channel"] == "web" & orders["shipping_fee"] == 0` بترتيب خاطئ ويفشل.
:::

## طريقان مختصران: isin و between

مطابقة أيٍّ من عدة قيم بسلاسل من `|` تصبح طويلة. أما `isin` فتأخذ قائمة:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
problem = orders["status"].isin(["cancelled", "returned"])
print(problem.sum(), "cancelled or returned")

black_friday_week = orders["order_date"].between("2025-11-24", "2025-11-30 23:59:59")
print(black_friday_week.sum(), "orders in Black Friday week 2025")

bf = orders[orders["coupon_code"] == "BLACKFRIDAY25"]
print(bf["order_date"].dt.month.value_counts().head(3))
```

تشمل `between` الطرفين، ولهذا يحمل الحد الأعلى وقتًا. والأسطر الأخيرة تحتوي اكتشافًا حقيقيًا: من بين 124 طلبًا استُخدم فيها الكوبون `BLACKFRIDAY25`، يقع 91 في نوفمبر، والبقية متفرّقة على مدار السنة. هل تُرك الكود فعّالًا، أم نُشر على موقع كوبونات، أم أن البيانات خاطئة؟ التصفيات لا تجيب عن ذلك، لكنها تُظهر السؤال، والمحللون الجيدون يحملونه إلى من يديرون العرض الترويجي قبل البناء عليه. (تستخرج `.dt.month` رقم الشهر؛ ويشرح الدرس 4.4 الـ accessor المسمّى `dt` بالتفصيل.)

### الجدول المُصفّى جدول جديد

تعيد التصفية DataFrame جديدًا. الجدول `q4` في المثال السابق لا يتذكّر أنه جاء من `orders`، ويجب أن تعامله كجدول مستقل: إذا أردت لاحقًا إضافة عمود إليه، فتضيفه إلى `q4`، ويبقى `orders` كما هو. وفي كود pandas 2 سترى كثيرًا `.copy()` بعد التصفية: فهي توضّح ذلك وتُسكت تحذير `SettingWithCopyWarning` الذي تطبعه pandas 2 حين تضيف عمودًا إلى جدول مُصفّى. أما مع Copy-on-Write، وهو السلوك الافتراضي منذ pandas 3.0 ويمكنك تفعيله في pandas 2 بـ `pd.options.mode.copy_on_write = True`، فكل نتيجة مُصفّاة تتصرّف أصلًا كنسخة مستقلة. ويبيّن الدرس 2.5 لماذا يهم هذا حين تبدأ بتغيير القيم.

## الترتيب واختيار الأعلى

ترتّب `sort_values` الصفوف بحسب عمود واحد أو أكثر:

```python run
import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
latest = orders.sort_values("order_date", ascending=False)
print(latest[["order_id", "order_date", "status"]].head(3))

by_fee = orders.sort_values(["shipping_fee", "order_date"], ascending=[False, False])
print(by_fee[["order_id", "shipping_fee", "order_date"]].head(3))
print(orders.nlargest(3, "shipping_fee")[["order_id", "shipping_fee"]])
```

مع قائمة أعمدة، يكسر العمود الثاني التعادل في الأول، وتأخذ `ascending` قائمة مطابقة. و`nlargest(n, column)` و`nsmallest` طريقان مختصران لـ "رتّب وخذ أعلى n"؛ وهما أسرع على الجداول الكبيرة ويعبّران عمّا تقصده.

آخر ثلاثة طلبات ما زالت `processing` أو `shipped`: قُدّمت في آخر أيام ديسمبر ولم تكن قد سُلّمت حين صُدّرت البيانات. هذا قرار آخر في تعريفك للإيراد، وستتخذه في القسم 4.

:::tip عُدّ قبل وبعد
اطبع `len(df)` قبل كل تصفية وبعدها. إذا أزالت تصفية كان يُفترض أن تحذف بضعة صفوف نصفَ الجدول، أو لم تُزِل شيئًا، فستعرف فورًا بدلًا من أن تعرف بعد ثلاث خطوات.
:::

في التمرين تعزل الربع الرابع من 2025 وتقيس استخدام الكوبونات فيه. وفي الدرس التالي تضيف أعمدة جديدة، مثل إيراد كل بند، وتتعلّم الطريقة الصحيحة الوحيدة لتغيير القيم في DataFrame.
