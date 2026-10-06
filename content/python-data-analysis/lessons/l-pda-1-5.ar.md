---
summary: غلّف المنطق المتكرّر في دوال لها مُدخلات وقيم مُعادة، ونسّق الأرقام للتقارير باستخدام f-strings، واقرأ الـ traceback في Python لتجد المشكلة الحقيقية وتصلحها.
takeaways:
  - الدالة تمنح جزءًا من المنطق اسمًا؛ المُعامِلات (parameters) هي مُدخلاتها، و`return` تعيد مُخرجها.
  - الدالة التي تطبع بدلًا من أن تُعيد تعطيك `None`، فلا يمكن استخدام نتيجتها في حسابات لاحقة.
  - "الـ f-strings تنسّق القيم داخل النص: `f\"{revenue:,.2f}\"` تعطي `1,234.50`، و`f\"{share:.1%}\"` تعطي `12.5%`."
  - اقرأ الـ traceback من الأسفل - السطر الأخير يسمّي نوع الخطأ ورسالته، والأسطر التي فوقه تبيّن أين حدث.
  - استخدم `try` / `except` للتعامل مع خطأ تتوقّعه، مثل نص لا يمكن أن يصبح رقمًا؛ ولا تستخدمها أبدًا لإخفاء أخطاء لا تفهمها.
further:
  - title: Defining Functions
    url: https://docs.python.org/3/tutorial/controlflow.html#defining-functions
  - title: Formatted String Literals (f-strings)
    url: https://docs.python.org/3/tutorial/inputoutput.html#formatted-string-literals
  - title: Errors and Exceptions
    url: https://docs.python.org/3/tutorial/errors.html
  - title: Format Specification Mini-Language
    url: https://docs.python.org/3/library/string.html#format-specification-mini-language
quiz:
  - q: |
      ما قيمة `result` بعد تشغيل هذا الكود؟
      ```python
      def add_tax(amount):
          print(amount * 1.2)

      result = add_tax(100)
      ```
    options:
      - text: "`120.0`"
        why: الدالة تعرض 120.0، لكن العرض ليس إعادة. بدون `return` لا يعود إلى المستدعي شيء.
      - text: "`None`"
        why: صحيح. الدالة التي ليس فيها `return` تعيد `None`، أيًّا كان ما طبعته في طريقها.
      - text: النص `"120.0"`
        why: الدالة `print` تكتب النص في المخرجات، ولا تعيده إلى المستدعي.
    answer: 1
  - q: 'أيّ f-string تطبع `Revenue: $146,825.44` حين تكون `revenue = 146825.4412`؟'
    options:
      - text: "`f\"Revenue: ${revenue:.2f}\"`"
        why: هذه تعطي `$146825.44` بلا فاصل للآلاف. الفاصلة في مواصفة التنسيق هي التي تضيفه.
      - text: "`f\"Revenue: ${revenue:,}\"`"
        why: الفاصلة تضيف فواصل الآلاف، لكن لا توجد دقة محدّدة، فتحصل على كل المنازل العشرية للعدد.
      - text: "`f\"Revenue: ${revenue:,.2f}\"`"
        why: صحيح. `,` تضيف فواصل الآلاف و`.2f` تثبّت منزلتين عشريتين، فتقرّب القيمة عند العرض.
      - text: "`f\"Revenue: {round(revenue)}\"`"
        why: هذه تُسقط السنتات وعلامة الدولار تمامًا.
    answer: 2
  - q: |
      السطر الأخير من الـ traceback يقول:
      ```text
      KeyError: 'Total'
      ```
      ما السبب الأرجح؟
    options:
      - text: الكود يطلب من قاموس (أو DataFrame) مفتاحًا اسمه `'Total'` غير موجود؛ والمفتاح الحقيقي غالبًا `'total'`.
        why: صحيح. الخطأ `KeyError` يسمّي دائمًا المفتاح المفقود. والمفاتيح حسّاسة لحالة الأحرف، فقارن الكتابة بالمفاتيح الفعلية.
      - text: قيمة `total` لا يمكن تحويلها إلى رقم.
        why: فشل التحويل يسبّب `ValueError`، لا `KeyError`.
      - text: المتغيّر `Total` لم يُعرَّف أبدًا.
        why: المتغيّر غير المعرَّف يسبّب `NameError` برسالة تقول إن الاسم غير معرَّف. علامات التنصيص في الرسالة تشير إلى بحث عن مفتاح.
    answer: 0
  - q: متى يكون تغليف الكود بـ `try` / `except` فكرة جيدة؟
    options:
      - text: حول الـ script كله، كي لا يتعطّل أبدًا أمام مديرك.
        why: هذا يخفي كل الأخطاء، ومنها التي تجعل أرقامك خاطئة. التعطّل الظاهر أفضل من إجابة خاطئة صامتة.
      - text: حول عملية واحدة تتوقّع أن تفشل مع بعض المُدخلات، مع نوع استثناء محدّد وبديل واضح.
        why: صحيح. مثلًا، التقاط `ValueError` عند تحويل نص كتبه مستخدم، وإعادة `None` للقيم التي ليست أرقامًا.
      - text: كلما رأيت `SyntaxError`.
        why: أخطاء الصياغة تحدث قبل تشغيل الكود، فلا تستطيع `try` التقاطها؛ الحل أن تصلح الكود.
    answer: 1
---

حتى الآن نظّفت السعر `" $129.00"` مرة، وحسبت إيراد بند واحد مرة، وطبعت بضعة أرقام. لدى Cartwheel ‏3,991 بندًا في الطلبات. لا تريد نسخ كود التنظيف إلى كل مكان يحتاجه، ثم إصلاح خطأ واحد في سبع نسخ. الدوال تتيح لك كتابة المنطق مرة واحدة، ومنحه اسمًا، واستدعاءه حيثما احتجته.

## تعريف دالة

```python run
def line_revenue(quantity, unit_price, discount=0.0):
    """Revenue of one order line: quantity x price, minus the discount."""
    return round(quantity * unit_price * (1 - discount), 2)

print(line_revenue(2, 129.0, 0.15))   # 219.3
print(line_revenue(1, 39.0))          # discount defaults to 0.0
print(line_revenue(quantity=3, unit_price=24.0, discount=0.25))
```

الأجزاء هي: `def`، ثم اسم الدالة، ثم المُعامِلات بين قوسين، ثم نقطتان رأسيتان، ثم جسم مُزاح. و`discount=0.0` قيمة **افتراضية** تُستخدم حين يتركها المستدعي. والسطر المحاط بثلاث علامات تنصيص تحت `def` هو docstring، يوثّق ما تفعله الدالة؛ وتعرضه المحرّرات حين تمرّر المؤشر فوق الاسم.

ترسل `return` قيمة إلى المستدعي، فيصبح الاستدعاء `line_revenue(2, 129.0, 0.15)` هو تلك القيمة. تستطيع تخزينها، أو جمعها، أو تمريرها إلى دالة أخرى. والاستدعاء بالأسماء، كما في المثال الثالث، يجعل قوائم الوسائط الطويلة مقروءة، ويحميك من تبديل رقمين بالخطأ.

:::mistake الطباعة بدلًا من الإعادة
الدالة التي تنتهي بـ `print(total)` تعرض الرقم ثم تعيد `None`. لاحقًا يفشل `line_revenue(...) * 2` بالخطأ `TypeError: unsupported operand type(s) for *: 'NoneType' and 'int'`. الدوال التي تحسب يجب أن تستخدم `return`؛ ودع المستدعي يقرّر هل يطبع.
:::

## دوال التنظيف

هذه أداة تنظيف المبالغ من الدرس 1.2 وقد أصبحت قابلة لإعادة الاستخدام. تتعامل مع علامة الدولار والمسافات الزائدة وفواصل الآلاف:

```python run
def parse_money(text):
    """Turn strings like ' $1,234.50' into the float 1234.5."""
    cleaned = text.strip().replace("$", "").replace(",", "")
    return float(cleaned)

for raw in [" $129.00", "18.00", "$1,234.50"]:
    print(raw, "->", parse_money(raw))
```

امنح الدوال أسماء أفعال تقول ما تعيده (`parse_money` و`line_revenue` و`clean_country`)، واجعل لكل منها مهمة واحدة؛ الدوال الصغيرة سهلة الاختبار ببضعة استدعاءات لـ `print` مثل الحلقة السابقة. الآن يستطيع كل مجموع فوضوي في الملف المُصدَّر أن يمرّ عبر دالة واحدة مُختبَرة. وإذا اكتشفت صيغة جديدة الشهر القادم (لنقل `USD` في نهاية النص)، فتصلحها في مكان واحد.

## الـ f-strings: أرقام يستطيع الناس قراءتها

تقرير يقول `146825.4412` يجعل القرّاء يضيّقون أعينهم. الـ **f-string**، أي نص يسبق علامة تنصيصه الأولى حرف `f`، تتيح لك وضع القيم داخل النص بين `{}` وتنسيقها بمواصفة بعد نقطتين رأسيتين:

```python run
revenue = 146825.4412
orders = 642
share = 0.4493

print(f"Q4 2025 revenue: ${revenue:,.2f}")       # thousands separator, 2 decimals
print(f"Orders: {orders}, average {revenue / orders:.2f} per order")
print(f"Share of the year: {share:.1%}")          # percent with 1 decimal
print(f"|{'Egypt':<12}|{orders:>6}|")             # left- and right-aligned columns
```

المواصفات التي ستستخدمها أكثر من غيرها: `,.2f` للمبالغ المالية، و`.1%` للنِّسَب (تضرب في 100 نيابةً عنك)، و`,.0f` للأعداد الصحيحة الكبيرة، و`<`/`>` مع عرض محدّد لمحاذاة النص. وأي تعبير يعمل داخل الأقواس المعقوفة، بما في ذلك عمليات حسابية مثل `revenue / orders`.

## قراءة الأخطاء دون ذعر

حين لا تستطيع Python المتابعة، تُطلق **استثناءً (exception)** وتطبع traceback (تتبّع الخطأ). المبتدئون يقرؤونه من الأعلى فيتوهون. اقرأه من **الأسفل**:

```text
Traceback (most recent call last):
  File "report.py", line 9, in <module>
    total = parse_money(row["Total"])
                        ~~~^^^^^^^^^
KeyError: 'Total'
```

السطر الأخير هو نوع الخطأ ورسالته: طُلب من قاموس المفتاح `'Total'` وهو غير موجود فيه. وفوقه بسطر الكود الذي فشل، مع علامات تحت التعبير بالضبط، وفوق ذلك الملف ورقم السطر. والإصلاح هنا هو الاسم الحقيقي للعمود، `'total'`.

:::figure اقرأ الـ traceback من الأسفل إلى الأعلى
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">traceback من ثلاث طبقات. في الأسفل: نوع الخطأ ورسالته، وتُقرأ أولًا. في الوسط: سطر الكود الذي فشل مع العلامات. في الأعلى: الملف ورقم السطر، وتستخدمهما لتجد المكان في كودك.</title>
  <rect class="d-box" x="20" y="20" width="430" height="44" rx="8"/>
  <text class="d-code" x="36" y="47">File "report.py", line 9</text>
  <rect class="d-box" x="20" y="76" width="430" height="44" rx="8"/>
  <text class="d-code" x="36" y="103">total = parse_money(row["Total"])</text>
  <rect class="d-box-warn" x="20" y="132" width="430" height="44" rx="8"/>
  <text class="d-code" x="36" y="159">KeyError: 'Total'</text>
  <text class="d-label-strong" x="480" y="159">1. ما الخطأ</text>
  <text class="d-label" x="480" y="103">2. أيّ تعبير</text>
  <text class="d-label-muted" x="480" y="47">3. أين تبحث</text>
  <path class="d-arrow" d="M680 150 L680 58" marker-end="url(#arrow)"/>
</svg>
:::

الأخطاء التي ستقابلها أكثر من غيرها، وما تعنيه في أغلب الأحيان:

| الخطأ | السبب المعتاد |
|---|---|
| `NameError` | خطأ كتابي في اسم متغيّر، أو استخدامه قبل إسناد قيمة له |
| `KeyError` | مفتاح قاموس أو عمود DataFrame غير موجود (افحص الكتابة وحالة الأحرف) |
| `TypeError` | خلط بين الأنواع، مثل نص زائد رقم، أو استدعاء دالة بوسائط خاطئة |
| `ValueError` | النوع صحيح لكن المحتوى ليس كذلك، مثل `float("$65.00")` |
| `IndexError` | موقع في القائمة بعد نهايتها |
| `AttributeError` | استدعاء method لا تملكها القيمة، وكثيرًا ما يحدث مع `None` |

### التعامل مع خطأ تتوقّعه

بعض حالات الفشل جزء من البيانات، لا أخطاء في الكود. مجموع فوضوي مثل `"N/A"` لن يصبح رقمًا أبدًا. تتيح لك `try` / `except` أن تقرّر ما يحدث بدلًا من ذلك:

```python run
def parse_money_or_none(text):
    try:
        return float(text.strip().replace("$", "").replace(",", ""))
    except ValueError:
        return None

print(parse_money_or_none("$65.00"), parse_money_or_none("N/A"))
```

التقط الاستثناء المحدّد الذي تتوقّعه (`ValueError` هنا) ولا شيء غيره. أما `except:` المجرّدة فستبتلع أيضًا خطأً كتابيًا في كودك أنت، وستحصل على `None` في كل مكان دون أي فكرة عن السبب.

:::tip ابحث عن السطر الأخير
حين تكون رسالة الخطأ جديدة عليك، انسخ سطرها الأخير، بعد حذف أسماء متغيّراتك، إلى محرّك بحث. شخص ما واجهها قبلك، وأول إجابة تشرحها عادةً في فقرة.
:::

بهذا تكتمل عُدّتك من Python. القسم 2 يضعها في العمل على نطاق واسع: pandas، حيث يعمل سطر واحد على كل صفوف الجدول.
