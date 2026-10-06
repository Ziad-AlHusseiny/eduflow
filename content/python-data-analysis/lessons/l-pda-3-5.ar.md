---
summary: اعثر على الصفوف المكرّرة واحذفها بـ duplicated و drop_duplicates، ثم اجمع كل خطوات التنظيف في هذا القسم في دالة واحدة مع assertions تستطيع إعادة تشغيلها على ملف الشهر القادم.
takeaways:
  - "تضع `df.duplicated()` علامة على التكرارات المطابقة تمامًا بعد ظهورها الأول؛ و`keep=False` تضع علامة على كل النسخ لتفحصها جنبًا إلى جنب."
  - "تزيل `drop_duplicates(subset=[...])` المكرّرات بحسب أعمدة مفتاحية، لكن استخدم فقط مفتاحًا فريدًا فعلًا لكل صف، ولا تستخدم أبدًا `order_id` في جدول بنود الطلبات."
  - نظّف النصوص قبل البحث عن المكرّرات، لأن `"Ali Evans"` و`"Ali Evans "` نصان مختلفان.
  - دالة التنظيف تحوّل جلسة notebook لمرة واحدة إلى خطوة قابلة للتكرار - المُدخل نفسه، المُخرج نفسه، كل شهر.
  - اختم الدالة بجمل `assert` تعبّر عن معنى "نظيف"، كي توقف البيانات السيئة خط المعالجة بدلًا من أن تصل إلى تقرير.
further:
  - title: pandas.DataFrame.drop_duplicates
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.drop_duplicates.html
  - title: pandas.DataFrame.duplicated
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.duplicated.html
  - title: The assert statement
    url: https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement
quiz:
  - q: "في جدول صفان متطابقان للطلب 1026. ماذا تعدّ `df.duplicated().sum()` لهما؟"
    options:
      - text: "2، واحد لكل نسخة"
        why: مع القيمة الافتراضية `keep="first"` لا توضع علامة على النسخة الأولى؛ بل على التكرارات فقط.
      - text: "0، لأن للصفين تسميتي فهرس مختلفتين"
        why: تقارن `duplicated()` قيم الأعمدة، لا الفهرس.
      - text: "1، النسخة الثانية فقط"
        why: صحيح. يُحتفظ بالظهور الأول على أنه الأصل، وتوضع علامة على كل صف مطابق يأتي بعده. استخدم `keep=False` لوضع علامة على الاثنين.
    answer: 2
  - q: "لماذا تكون `items.drop_duplicates(subset=[\"order_id\"])` خطيرة على `order_items`؟"
    options:
      - text: الطلب الذي فيه عدة منتجات له عدة بنود مشروعة، وستُحذف كلها ما عدا الأول.
        why: صحيح. على بيانات Cartwheel يحذف هذا 1,925 بندًا حقيقيًا. أزِل المكرّرات بحسب مفتاح يحدّد صفًا واحدًا، مثل `order_item_id`.
      - text: تُطلق خطأً لأن `order_id` رقمي.
        why: يمكن استخدام أيّ نوع عمود كمفتاح في subset؛ الخطر هو فقدان بيانات صامت، لا خطأ.
      - text: تغيّر الجدول الأصلي في مكانه.
        why: تعيد `drop_duplicates` جدولًا (DataFrame) جديدًا؛ والخطر فيما ينقص ذلك الجدول الجديد.
    answer: 0
  - q: ما الفائدة الأساسية من ختم دالة التنظيف بـ `assert df["order_id"].is_unique`؟
    options:
      - text: تحذف أيّ معرّفات مكرّرة متبقية.
        why: الـ assertion لا يغيّر البيانات أبدًا؛ إنه يفحص شرطًا فقط.
      - text: تجعل الدالة تعمل أسرع.
        why: يضيف الفحص قدرًا ضئيلًا من العمل. قيمته في الأمان لا في السرعة.
      - text: تخزّن النتيجة كي يستخدمها الدرس التالي.
        why: الـ assertions لا تحفظ شيئًا؛ و`return` في الدالة هي التي تعيد البيانات.
      - text: إذا كسر ملف مُصدَّر في المستقبل القاعدة، يتوقّف الـ script بخطأ بدلًا من إنتاج تقرير خاطئ.
        why: صحيح. يحوّل الـ assertion الافتراض إلى حقيقة مُختبَرة في كل مرة تعمل فيها الدالة.
    answer: 3
---

تسعة صفوف في الملف الفوضوي تظهر مرتين. كل نسخة مكرّرة طلب حقيقي محسوب مرة أخرى، فكل مجموع حسبته من الملف المُصدَّر حتى الآن أعلى من حقيقته: 23,500.67 دولارًا بدلًا من 22,486.69، أي مبالغة بنسبة 4.5%. تأتي المكرّرات من ملفات أُعيد تصديرها، وصفوف نُسخت ولُصقت، وأنظمة تعيد محاولة رفع ملف بعد فشله. إنها آخر مشكلة في الملف، وإصلاحها يتيح لك تحويل هذا القسم كله إلى دالة واحدة.

## العثور على المكرّرات

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
dupes = messy.duplicated()
print(dupes.sum(), "duplicate rows")

both_copies = messy[messy.duplicated(keep=False)].sort_values("order_id")
print(both_copies.head(4).to_string())
```

تعيد `duplicated()` قناعًا قيمته `True` لكل صف مطابق لصف سابق. لا توضع علامة على الظهور الأول (`keep="first"`)، وهذا ما تريده عند الحذف. أما للفحص، فتضع `keep=False` علامة على كل النسخ، والترتيب بحسب المعرّف يضع كل زوج معًا. انظر إليها قبل حذف أي شيء: الصفان 22 و113 هما الطلب نفسه، والمنتج نفسه، والمجموع نفسه، ويفصل بينهما نحو مئة صف. هذا النمط، صفوف متطابقة متباعدة، نموذجي لملف مُصدَّر أُضيف إلى نفسه.

## حذفها

```python run
import pandas as pd

messy = pd.read_csv("orders_messy.csv")
deduped = messy.drop_duplicates()
print(len(messy), "->", len(deduped))
print(deduped["order_id"].is_unique)
```

بعد حذف المكرّرات المطابقة تمامًا، يظهر كل `order_id` مرة واحدة، وهذا يؤكّد أن المكرّرات كانت نسخًا كاملة لا نسختين مختلفتين من الطلب نفسه. لو كانت `is_unique` تساوي `False`، لكان لديك صفوف **متعارضة**: المعرّف نفسه مع مجموعين مختلفين مثلًا. وتلك تحتاج قرارًا، مثل الاحتفاظ بأحدث نسخة، وتطبّقه `drop_duplicates(subset=["order_id"], keep="last")` بعد أن تتّخذ ذلك القرار.

:::mistake إزالة المكرّرات بحسب المفتاح الخطأ
في `order_items`، للطلب الواحد صف لكل منتج، فيتكرّر `order_id` بشكل مشروع. ستحذف `items.drop_duplicates(subset=["order_id"])` 1,925 بندًا حقيقيًا دون أي تحذير. قبل اختيار subset، اسأل: ماذا يمثّل الصف الواحد؟ يجب أن يحدّد المفتاح ذلك بالضبط. وهنا هو `order_item_id`.
:::

### نظّف أولًا، ثم أزِل المكرّرات

اكتشاف المكرّرات يقارن القيم مقارنة دقيقة. `"Ali Evans"` و`"Ali Evans "` نصان مختلفان، و`$22.00` و`22.00` مجموعان مختلفان. في هذا الملف المُصدَّر تصادف أن النسخ متطابقة حرفًا بحرف، لكن بشكل عام تحذف المسافات، وتوحّد حالة الأحرف، وتحوّل الأرقام **قبل** البحث عن المكرّرات، وإلا نجت النسخ شبه المتطابقة.

## دالة واحدة للقسم كله

لديك الآن خمس خطوات تنظيف، مكتوبة عبر خمسة دروس. وحين تكون متفرّقة في notebook تكون هشّة: شغّل خلية مرتين أو تخطَّ واحدة، فتتغيّر النتيجة. ضعها في دالة واحدة، بالترتيب الصحيح، مع الفحوص في النهاية:

```python run
import pandas as pd

COUNTRIES = {"Egypt", "United Arab Emirates", "Saudi Arabia", "Jordan",
             "United Kingdom", "Germany", "United States", "Canada"}

def parse_money(values):
    cleaned = (values.astype("string").str.strip()
               .str.replace("$", "", regex=False).str.replace(",", "", regex=False))
    return pd.to_numeric(cleaned, errors="coerce")

def parse_dates(raw):
    iso = pd.to_datetime(raw, format="%Y-%m-%d", errors="coerce")
    dmy = pd.to_datetime(raw, format="%d/%m/%Y", errors="coerce")
    mdy = pd.to_datetime(raw, format="%m/%d/%Y", errors="coerce")
    ambiguous = dmy.notna() & mdy.notna() & (dmy != mdy)
    return iso.fillna(dmy).fillna(mdy), ambiguous

def clean_orders(path):
    """Load the messy export and return a clean, deduplicated DataFrame."""
    df = pd.read_csv(path)
    df["customer"] = df["customer"].str.strip()
    df["country"] = df["country"].str.strip().str.title()
    df["channel"] = df["channel"].str.strip().str.replace(" ", "_").fillna("unknown")
    df["quantity"] = df["quantity"].astype("Int64")
    df["total"] = parse_money(df["total"])
    df["order_date"], df["date_is_ambiguous"] = parse_dates(df["order_date"])
    df = df.drop_duplicates().reset_index(drop=True)

    assert df["order_id"].is_unique, "duplicate order ids remain"
    assert df["order_date"].notna().all(), "unparsed dates"
    assert df["total"].notna().all() and (df["total"] > 0).all(), "bad totals"
    assert set(df["country"]) <= COUNTRIES, f"unknown countries: {set(df['country']) - COUNTRIES}"
    return df

clean = clean_orders("orders_messy.csv")
print(clean.shape)
print(clean.dtypes)
print(round(clean["total"].sum(), 2), "total sales,", clean["date_is_ambiguous"].sum(), "ambiguous dates")
```

السطر `df["order_date"], df["date_is_ambiguous"] = parse_dates(...)` يفكّ القيمتين اللتين تعيدهما الدالة المساعدة إلى عمودين دفعة واحدة. وتعيد `reset_index(drop=True)` ترقيم الصفوف من 0 إلى 158 بعد الحذف، فتتّفق المواقع والتسميات من جديد. لاحظ الأنواع أيضًا: `quantity` من النوع `Int64` و`total` من النوع `Float64`، وكلاهما قابل للقيم المفقودة، لأن `parse_money` تحوّل عبر النوع `string` في pandas و`to_numeric` تحافظ على العائلة القابلة للقيم المفقودة. وهما يتصرّفان كأرقام عادية في كل حساب ستجريه.

:::figure خط التنظيف: 168 صفًا فوضويًا تدخل، و159 صفًا نظيفًا تخرج
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">ملف مُصدَّر خام من 168 صفًا يمرّ عبر خمس خطوات: حذف المسافات وتوحيد النصوص، وتحويل نوع الكمية إلى Int64، وتحليل المبالغ، وتحليل التواريخ ووضع علامة على الملتبس، وحذف المكرّرات. ثم تفحص الـ assertions النتيجة، فيخرج 159 صفًا نظيفًا.</title>
  <rect class="d-box-warn" x="10" y="60" width="90" height="60" rx="10"/>
  <text class="d-label-strong" x="55" y="86" text-anchor="middle">خام</text>
  <text class="d-label" x="55" y="106" text-anchor="middle">168 صفًا</text>
  <rect class="d-box" x="120" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="160" y="95" text-anchor="middle">النصوص</text>
  <rect class="d-box" x="215" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="255" y="95" text-anchor="middle">Int64</text>
  <rect class="d-box" x="310" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="350" y="95" text-anchor="middle">المبالغ</text>
  <rect class="d-box" x="405" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="445" y="95" text-anchor="middle">التواريخ</text>
  <rect class="d-box" x="500" y="60" width="80" height="60" rx="10"/>
  <text class="d-label" x="540" y="95" text-anchor="middle">المكرّرات</text>
  <rect class="d-box-success" x="600" y="60" width="90" height="60" rx="10"/>
  <text class="d-label-strong" x="645" y="86" text-anchor="middle">نظيف</text>
  <text class="d-label" x="645" y="106" text-anchor="middle">159 صفًا</text>
  <path class="d-arrow" d="M100 90 L118 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M200 90 L213 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M295 90 L308 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 90 L403 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M485 90 L498 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M580 90 L598 90" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="500" y="140" width="190" height="40" rx="10"/>
  <text class="d-label" x="595" y="165" text-anchor="middle">الـ assertions تحرس المخرج</text>
  <text class="d-label-muted" x="350" y="40" text-anchor="middle">clean_orders(path)</text>
</svg>
:::

تقرأ الدالة ملفها بنفسها، فلا تعتمد أبدًا على ما تصادف أنك شغّلته سابقًا في notebook. المُدخل نفسه، المُخرج نفسه، في كل مرة. وحين يصل ملف الشهر القادم، تشغّل `clean_orders("orders_messy_2026_01.csv")` القسم كله في سطر واحد، وإذا احتوى الملف الجديد على كتابة تاسعة لدولة أو مجموع باليورو، يوقفه assertion برسالة تسمّي المشكلة.

أين تضع الدالة؟ أثناء الاستكشاف، في أول خلية من الـ notebook. وحين يحتاجها notebook ثانٍ أو زميل، انقلها إلى ملفها الخاص، مثل `cleaning.py` بجانب ملفات الـ notebook، واكتب `from cleaning import clean_orders` حيثما احتجتها. تعريف واحد مستورَد في كل مكان يعني أن الإصلاح الذي تجريه مرة يصل إلى كل تحليل يعتمد عليه.

:::tip الـ assertions توثيق يعمل
كل سطر `assert` يقول ما معنى "نظيف" لهذه البيانات، بصيغة يستطيع زميل قراءتها ويستطيع الحاسوب فحصها. حين تكتشف نوعًا جديدًا من المشكلات، أضِف إصلاحًا وassertion معًا. يعود الدرس 5.4 إلى هذا حين تجعل تحليلًا كاملًا قابلًا لإعادة الإنتاج.
:::

أصبح الملف المُصدَّر نظيفًا: 159 طلبًا، و22,486.69 دولارًا من المبيعات، و25 تاريخًا عليها علامة الالتباس (كانت 30 قبل حذف المكرّرات). ينتقل القسم 4 من التنظيف إلى الإجابة، بدءًا بأكثر أدوات pandas استخدامًا: التجميع (`groupby`).
