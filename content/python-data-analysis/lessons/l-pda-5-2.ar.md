---
summary: اختر الرسم البياني المناسب للسؤال، وارسمه من DataFrame باستخدام ‎.plot في pandas وكائني figure و axes في matplotlib، وضع عليه عناوين تجعله يقول اكتشافه وحده.
takeaways:
  - اختر الرسم من السؤال - الخطي للتغيّر عبر الزمن، والأعمدة المرتّبة لمقارنة الفئات، والمدرّج التكراري للتوزيع، ومخطط الانتشار للعلاقة.
  - "`fig, ax = plt.subplots()` ثم `df.plot(ax=ax)` تعطيك سهولة pandas مع تحكّم matplotlib الكامل في العناوين والمحاور والحفظ."
  - جهّز جدولًا صغيرًا مرتّبًا أولًا (صف لكل عمود أو نقطة)، ثم ارسمه؛ فمعظم مشكلات الرسم البياني مشكلات في تشكيل البيانات.
  - الأعمدة تبدأ من الصفر، والمحاور تحمل وحداتها، والعنوان يقول الاكتشاف بدلًا من تسمية المتغيّرات.
  - "`fig.savefig(\"chart.png\", dpi=150, bbox_inches=\"tight\")` تحفظ الرسم لتقرير؛ والرسوم البيانية لا تظهر في كتل Run في هذه الدورة."
further:
  - title: pandas - Chart visualization
    url: https://pandas.pydata.org/docs/user_guide/visualization.html
  - title: matplotlib - Quick start guide
    url: https://matplotlib.org/stable/users/explain/quick_start.html
  - title: matplotlib.axes.Axes.bar_label
    url: https://matplotlib.org/stable/api/_as_gen/matplotlib.axes.Axes.bar_label.html
quiz:
  - q: تريد أن تُظهر أن الإيراد لكل قناة نما من 2024 إلى 2025. أيّ رسم بياني يُقرأ أفضل؟
    options:
      - text: رسمان دائريان، واحد لكل سنة
        why: الرسوم الدائرية تُظهر أجزاء كلٍّ واحد؛ ومقارنة أحجام الشرائح عبر رسمين دائريين صعبة، وهي تخفي النمو في المجموع.
      - text: مدرّج تكراري لقيم الطلبات
        why: المدرّج التكراري يُظهر توزيع متغيّر واحد؛ ولا يقول شيئًا عن القنوات أو السنوات.
      - text: مخطط انتشار لقيمة الطلب مقابل تاريخه
        why: ألفا نقطة تُظهر الانتشار عبر الزمن، لكن لا تُظهر مجاميع القنوات التي تريد مقارنتها.
      - text: أعمدة مجمّعة، مجموعة لكل قناة وعمود لكل سنة، تبدأ من الصفر
        why: صحيح. الأعمدة تقارن المبالغ، والتجميع يضع السنتين جنبًا إلى جنب لكل قناة، وخط الأساس عند الصفر يُبقي الأطوال صادقة.
    answer: 3
  - q: "ما ميزة `fig, ax = plt.subplots()` ثم `monthly.plot(ax=ax)`، مقارنةً باستدعاء `monthly.plot()` وحدها؟"
    options:
      - text: يكون كائن الـ axes بين يديك، فتستطيع ضبط العناوين والتسميات والتنسيق وحفظ الشكل الذي ضبطته بالضبط.
        why: صحيح. ترسم pandas على الـ axes التي تمرّرها، وتحتفظ أنت بتحكّم matplotlib الكامل في كل شيء آخر.
      - text: إنها الطريقة الوحيدة لصنع رسم خطي.
        why: ترسم `monthly.plot()` وحدها رسمًا خطيًا أيضًا؛ هي فقط تنشئ الشكل نيابةً عنك.
      - text: تجعل الرسم تفاعليًا.
        why: التفاعلية تعتمد على البيئة والـ backend، لا على طريقة إنشاء الـ axes.
    answer: 0
  - q: "رسم أعمدة للإيراد بحسب الدولة محوره الرأسي يبدأ من 60,000. ما المشكلة؟"
    options:
      - text: تصبح الأعمدة رفيعة جدًا.
        why: نطاق المحور لا يغيّر عرض الأعمدة.
      - text: لم تعد أطوال الأعمدة تطابق القيم، فقد يبدو فرق 10% كأنه فرق 300%.
        why: صحيح. القرّاء يقارنون أطوال الأعمدة؛ وقطع خط الأساس يضخّم الفروق. الرسوم الخطية يمكن تقريبها، أما الأعمدة فلا.
      - text: الدول ذات الإيراد الأقل تختفي.
        why: الأعمدة تحت 60,000 ستُقطع أو تختفي، وهذا عَرَض للمشكلة الحقيقية، أي خط الأساس المضلّل.
    answer: 1
---

لديك أرقام تجيب عن سؤال رئيس النمو، وقريبًا ستعرضها. جدول من 24 رقمًا شهريًا يجعل الناس يضيّقون أعينهم؛ أما رسم خطي للأرقام نفسها فيُظهر قفزة نوفمبر قبل أن يقرأ أحد أي محور. الرسوم البيانية ليست زينة تُضاف في النهاية. إنها الطريقة التي سيستهلك بها معظم الناس تحليلك، والرسم الجيد كثيرًا ما يكون هو الرسالة كلها.

كود الرسوم في هذا الدرس مخصّص لـ Jupyter notebook الخاص بك: كتل Run في هذه الدورة تعرض نصًا مطبوعًا لا صورًا. أما تجهيز البيانات فيعمل هنا كالمعتاد.

## اختر الرسم من السؤال

:::figure أربعة أسئلة، وأربعة أنواع من الرسوم
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">أربع لوحات. كيف يتغيّر عبر الزمن: رسم خطي. أيّ مجموعة أكبر: أعمدة أفقية مرتّبة. كيف تنتشر القيم: مدرّج تكراري. هل يتحرّك شيئان معًا: مخطط انتشار.</title>
  <rect class="d-box" x="10" y="10" width="160" height="160" rx="10"/>
  <path class="d-arrow" d="M30 130 L60 115 L90 120 L120 95 L150 50"/>
  <text class="d-label-strong" x="90" y="196" text-anchor="middle">التغيّر عبر الزمن</text>
  <text class="d-label-muted" x="90" y="214" text-anchor="middle">خطي</text>
  <rect class="d-box" x="185" y="10" width="160" height="160" rx="10"/>
  <rect class="d-box-primary" x="200" y="35" width="130" height="20"/>
  <rect class="d-box-primary" x="200" y="65" width="100" height="20"/>
  <rect class="d-box-primary" x="200" y="95" width="75" height="20"/>
  <rect class="d-box-primary" x="200" y="125" width="40" height="20"/>
  <text class="d-label-strong" x="265" y="196" text-anchor="middle">مقارنة المجموعات</text>
  <text class="d-label-muted" x="265" y="214" text-anchor="middle">أعمدة مرتّبة</text>
  <rect class="d-box" x="360" y="10" width="160" height="160" rx="10"/>
  <rect class="d-box-accent" x="375" y="100" width="22" height="50"/>
  <rect class="d-box-accent" x="399" y="70" width="22" height="80"/>
  <rect class="d-box-accent" x="423" y="60" width="22" height="90"/>
  <rect class="d-box-accent" x="447" y="95" width="22" height="55"/>
  <rect class="d-box-accent" x="471" y="125" width="22" height="25"/>
  <text class="d-label-strong" x="440" y="196" text-anchor="middle">انتشار القيم</text>
  <text class="d-label-muted" x="440" y="214" text-anchor="middle">مدرّج تكراري</text>
  <rect class="d-box" x="535" y="10" width="160" height="160" rx="10"/>
  <circle class="d-dot" cx="560" cy="140" r="4"/><circle class="d-dot" cx="580" cy="120" r="4"/><circle class="d-dot" cx="600" cy="125" r="4"/>
  <circle class="d-dot" cx="615" cy="95" r="4"/><circle class="d-dot" cx="635" cy="85" r="4"/><circle class="d-dot" cx="650" cy="60" r="4"/><circle class="d-dot" cx="670" cy="45" r="4"/>
  <text class="d-label-strong" x="615" y="196" text-anchor="middle">العلاقة</text>
  <text class="d-label-muted" x="615" y="214" text-anchor="middle">مخطط انتشار</text>
</svg>
:::

معظم الرسوم البيانية في العمل واحد من هذه الأربعة. الرسوم الدائرية تقارن بشكل سيئ بعد شريحتين أو ثلاث؛ ورسم الأعمدة المرتّبة يقول الشيء نفسه بوضوح أكبر. والرسوم ذات المحورين الرأسيين المختلفين تدعو القارئ إلى مقارنة خطوط على مقاييس لا علاقة بينها، ففضّل رسمين مكدّسين أحدهما فوق الآخر.

## جهّز البيانات ثم ارسم

الرسم البياني يريد جدولًا صغيرًا: صف لكل نقطة أو عمود، مرتّبًا ومسمّى مسبقًا. بناؤه عمل pandas عادي، ويعمل هنا:

```python run
import pandas as pd

items = pd.read_csv("order_items.csv")
orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
items["revenue"] = items["quantity"] * items["unit_price"] * (1 - items["discount"])
orders = orders.merge(items.groupby("order_id", as_index=False)["revenue"].sum(), on="order_id", validate="one_to_one")
orders = orders[orders["status"] != "cancelled"]

monthly = orders.set_index("order_date").resample("ME")["revenue"].sum()
by_year = monthly.groupby([monthly.index.year, monthly.index.month]).sum().unstack(level=0)
by_year.index.name = "month"
print(by_year.round(0))
```

تنقل `unstack(level=0)` السنة إلى الأعمدة، فيصبح هناك عمود لكل سنة وصف لكل شهر: الشكل المطلوب بالضبط لرسم فيه خط لكل سنة. ومقارنة السنوات على محور واحد من يناير إلى ديسمبر هي طريقة رؤية الموسمية: إذا ارتفع الخطان كلاهما في نوفمبر، فقفزة نوفمبر نمط لا مصادفة.

## ارسمه باستخدام pandas و matplotlib

تستدعي methods `.plot` في pandas مكتبة matplotlib نيابةً عنك. أنشئ الـ figure والـ axes بنفسك، كي تستطيع إنهاء الرسم كما يجب:

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 4))
by_year.plot(ax=ax, marker="o")
ax.set_title("November is the peak in both years; 2025 runs about 2.7x 2024")
ax.set_xlabel("Month")
ax.set_ylabel("Revenue (USD)")
ax.yaxis.set_major_formatter("${x:,.0f}")
ax.set_xticks(range(1, 13))
ax.legend(title="Year")
fig.tight_layout()
fig.savefig("monthly_revenue.png", dpi=150, bbox_inches="tight")
```

تعيد `plt.subplots()` كائن **figure** (الصورة كلها) وكائن **axes** (منطقة رسم واحدة بمحوريها الأفقي والرأسي). ترسم `by_year.plot(ax=ax)` خطًا لكل عمود على تلك الـ axes، وكل استدعاء `ax.set_...` يحسّنها. ونص التنسيق الممرَّر إلى `set_major_formatter` يحوّل قيم العلامات على المحور إلى دولارات بفواصل الآلاف. وتكتب `savefig` الملف الذي تلصقه في شريحة العرض؛ و`bbox_inches="tight"` تقصّ الهوامش الفارغة.

ولمقارنة الفئات، رتّب أولًا واستخدم أعمدة أفقية كي تبقى التسميات الطويلة مقروءة:

```python
# sales: the line-level table you built in Lesson 4.2
revenue_by_country = sales.groupby("country")["revenue"].sum().sort_values()

fig, ax = plt.subplots(figsize=(7, 4))
bars = ax.barh(revenue_by_country.index, revenue_by_country.values)
ax.bar_label(bars, fmt="${:,.0f}", padding=3)
ax.set_title("UAE and UK lead revenue; Jordan trails")
ax.set_xlabel("Revenue 2024-2025 (USD)")
fig.tight_layout()
```

وللتوزيع، مدرّج تكراري لقيم الطلبات مع تحديد الوسيط:

```python
fig, ax = plt.subplots(figsize=(7, 4))
orders["revenue"].plot.hist(bins=40, ax=ax)
ax.axvline(orders["revenue"].median(), linestyle="--", label="median $147")
ax.set_xlabel("Order value (USD)")
ax.legend()
```

وللعلاقات، يضع مخطط الانتشار (scatter plot) عمودًا رقميًا على كل محور. مع آلاف النقاط تتكدّس في كتلة واحدة، فاجعلها صغيرة وشبه شفافة، وكثيرًا ما يكون أوضح أن ترسم ملخّصًا بدلًا من ذلك، مثل معدّل الشراء لكل عدد من الصفحات المعروضة:

```python
# assumes fig, ax = plt.subplots() and churn.csv / web_sessions.csv loaded as churn / sessions
churn.plot.scatter(x="tenure_days", y="total_spent", s=8, alpha=0.3, ax=ax)

rate = sessions.groupby("pages_viewed")["purchased"].mean()
rate.loc[:15].plot(ax=ax, marker="o")   # one point per page count, up to 15
```

السطر الأول هو النمط لأي عمودين رقميين، وهنا مدة بقاء كل عميل مقابل إجمالي إنفاقه من `churn.csv`؛ والسطران الآخران يحوّلان 6,000 جلسة إلى خمس عشرة نقطة مقروءة، كل منها معدّل تحويل.

## افحص الرسم قبل أن تشاركه

الرسوم البيانية تخفي الأخطاء ببراعة. قبل أن يغادر رسم الـ notebook الخاص بك، قارنه بالجدول الذي جاء منه: عدد الأعمدة أو النقاط، والفترة الأولى والأخيرة (الشهر الجزئي في النهاية يبدو انهيارًا، كما حذّر الدرس 4.4)، وقيمة أو اثنتين تستطيع قراءتهما من الرسم ومقارنتهما برقم مطبوع. ثم انظر إليه مرة كما ينظر غريب: هل يستطيع من لم يرَ البيانات قط أن يقول ما يُظهره في جملة واحدة؟ إن لم يستطع، فغيّر العنوان أو ترتيب الفرز أو نوع الرسم، لا القارئ.

ستقابل أيضًا **seaborn**، وهي مكتبة مبنية على matplotlib بإعدادات افتراضية إحصائية جيدة. كل ما هنا ينطبق عليها: ترسم على الـ `ax` نفسها، وتنطبق القواعد نفسها عن خطوط الأساس والعناوين.

:::mistake عنوان يسمّي المحاور
"الإيراد بحسب الشهر" يخبر القارئ بما تقوله المحاور أصلًا. أما "نوفمبر هو الذروة في السنتين" فتخبره بما يجب أن يراه. اكتب العنوان على هيئة الجملة التي ستقولها وأنت تشير إلى الرسم، واحتفظ بأسماء المتغيّرات لتسميات المحاور.
:::

:::tip ألوان أقل، معنى أكثر
استخدم لونًا واحدًا لكل شيء، ثم لونًا ثانيًا أقوى للعمود أو الخط الوحيد الذي يجب أن ينظر إليه القارئ، مثل الربع الرابع من 2025. دورات الألوان الافتراضية مناسبة للاستكشاف؛ أما في العرض فيجب أن يحمل اللون الرسالة.
:::

في تمرين هذا الدرس تختار الرسوم المناسبة لمجموعة من الأسئلة. وفي الدرس التالي تجمع كل شيء معًا وتجيب عن سؤال الربع الرابع من البداية إلى النهاية.
