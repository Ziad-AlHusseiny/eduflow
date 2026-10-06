---
summary: حرّك عتبة القرار لتبادل الـ precision بالـ recall، واخترها من تكاليف العمل باستخدام TunedThresholdClassifierCV، وتعامل مع الفئات النادرة بأوزان الفئات والمقاييس الصحيحة.
takeaways:
  - "تطبّق `predict` عتبة 0.5 على الاحتمال؛ ويمكنك تطبيق أي عتبة بنفسك بـ `predict_proba(X)[:, 1] >= t`."
  - رفع العتبة يُعلِّم حالات أقل، فيرفع الـ precision عادةً ويخفض الـ recall؛ وخفضها يفعل العكس.
  - "اختر العتبة من كلفة كل خطأ، على بيانات التدريب عبر التحقق المتقاطع، مثلًا باستخدام `TunedThresholdClassifierCV` ودالة تقييم مخصّصة."
  - "حين تكون الفئة الإيجابية نادرة، تكون الـ accuracy مضلِّلة؛ فاعرض بدلًا منها الـ precision والـ recall والـ average precision."
  - "يجعل `class_weight=\"balanced\"` أخطاء الفئة النادرة تُحسب أكثر أثناء التدريب، فيرفع الـ recall على حساب شيء من الـ precision."
further:
  - title: "Tuning the decision threshold for class prediction"
    url: https://scikit-learn.org/stable/modules/classification_threshold.html
  - title: TunedThresholdClassifierCV
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TunedThresholdClassifierCV.html
  - title: precision_recall_curve
    url: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html
quiz:
  - q: "خفضت عتبة الانقطاع من 0.5 إلى 0.3. ماذا تتوقع؟"
    options:
      - text: ترتفع الـ precision والـ recall معًا، لأن النموذج يرى منقطعين أكثر.
        why: النموذج نفسه لا يتغيّر. تعليم عملاء أكثر يلتقط منقطعين أكثر، لكنه يلتقط باقين أكثر أيضًا.
      - text: لا بد أن ترتفع الـ accuracy، لأن عددًا أكبر من المنقطعين يُلتقط.
        why: قد تتحرك الـ accuracy في أي اتجاه؛ فقد تفوق الإيجابياتُ الكاذبة الإضافية الإيجابياتِ الصحيحة الإضافية.
      - text: لا يتغيّر شيء، لأن العتبة لا تؤثر إلا في `predict_proba`.
        why: العكس هو الصحيح. الاحتمالات تبقى كما هي؛ والـ labels المشتقة منها هي التي تتغيّر.
      - text: يُعلَّم عملاء أكثر؛ فترتفع الـ recall وتنخفض الـ precision عادةً.
        why: صحيح. على بيانات اختبار الانقطاع، ترتفع الـ recall من 0.67 إلى 0.93 بينما تنخفض الـ precision من 0.79 إلى 0.69.
    answer: 3
  - q: "إنقاذ عميل منقطع يساوي +10 دولارات صافية، والتواصل مع عميل وفيّ يكلّف 20 دولارًا. إذا كانت الاحتمالات معايَرة جيدًا، فعند أيّ احتمال انقطاع يصبح التواصل مجديًا؟"
    options:
      - text: "فوق نحو 0.67، حيث `p * 10 = (1 - p) * 20`."
        why: صحيح. دون الثلثين، تفوق الخسارة المتوقعة على الباقين المكسبَ المتوقع من المنقطعين.
      - text: "فوق 0.5، العتبة الافتراضية."
        why: تفترض القيمة الافتراضية أن الخطأين متساويان في الكلفة، وهذا غير صحيح هنا.
      - text: "فوق نحو 0.33، لأن قيمة المنقطع نصف كلفة التواصل المهدر."
        why: هذا يعكس المنطق؛ فالإيجابيات الكاذبة المكلفة تدفع العتبة إلى الأعلى، لا إلى الأسفل.
    answer: 0
  - q: "في بيانات الأرقام (digits)، 10% من الصور تمثّل الرقم 9. يحقق نموذج accuracy بنسبة 98%. ماذا يجب أن تعرض بجانبها؟"
    options:
      - text: لا شيء؛ 98% ممتازة لأي مسألة.
        why: التنبؤ بـ "ليس 9" لكل شيء يحقق 90% أصلًا، فالـ 98% تحتاج إلى سياق.
      - text: الـ precision والـ recall لفئة الرقم 9، إضافة إلى خط أساس الفئة الأكثر شيوعًا البالغ 90%.
        why: صحيح. هذه تبيّن كم 9 يُعثر عليه وكم إنذارًا كاذبًا، وهو ما تُخفيه الـ accuracy.
      - text: دقة التدريب، لتُظهر أنه لا يوجد overfitting.
        why: مفيدة بشكل عام، لكنها لا تقول شيئًا عن مدى إحسان التعامل مع الفئة النادرة.
    answer: 1
  - q: "لماذا يُعدّ اختيار العتبة التي تعظّم الربح على بيانات الاختبار خطأً؟"
    options:
      - text: لأن العتبات لا يمكن اختيارها إلا قبل التدريب.
        why: تُطبَّق العتبات بعد التدريب؛ واختيار إحداها لاحقًا أمر طبيعي. المشكلة في البيانات التي تختارها عليها.
      - text: لأن الربح ليس مقياسًا صالحًا في تعلّم الآلة.
        why: أي دالة في التنبؤات والنتائج يمكن أن تكون مقياسًا؛ ومقياس العمل كثيرًا ما يكون الأفضل.
      - text: لأن العتبة تصبح hyperparameter مضبوطًا، فيكون الربح الذي تُبلغ عنه على الاختبار متفائلًا.
        why: صحيح. اخترها بالتحقق المتقاطع على بيانات التدريب، ثم قِس مرة واحدة على بيانات الاختبار.
    answer: 2
---

ظلّت `predict` تتخذ قرارًا نيابةً عنك بصمت: صنّف العميل منقطعًا حين يكون الاحتمال 0.5 على الأقل. هذا الحدّ الفاصل يفترض أن تفويت منقطع وإهدار عرض لهما الكلفة نفسها. وهذا لا يكاد يحدث أبدًا. اختيار العتبة (threshold) عن قصد من أرخص التحسينات وأعلاها قيمة التي يمكنك إجراؤها على أي مصنِّف، ولا يتطلّب إعادة تدريب أي شيء.

## العتبة مقبض تديره

الاحتمالات تأتي من النموذج؛ أما العتبة فهي سياستك أنت. حرّكها وراقب الـ precision والـ recall يتجاذبان.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)
prob = model.predict_proba(X_test)[:, 1]

for t in [0.3, 0.4, 0.5, 0.6, 0.7, 0.8]:
    flagged = (prob >= t).astype(int)
    print(f"threshold {t:.1f}: flags {flagged.sum():2}  precision {precision_score(y_test, flagged):.2f}"
          f"  recall {recall_score(y_test, flagged):.2f}")
```

:::figure الـ precision والـ recall مع تحرّك العتبة (بيانات اختبار الانقطاع)
<svg viewBox="0 0 680 270" role="img" aria-labelledby="t1">
  <title id="t1">مخطط خطي على العتبات من 0.3 إلى 0.8. ترتفع الـ precision بلطف من 0.69 إلى 0.86. وتنخفض الـ recall بحدّة من 0.93 إلى 0.33. العتبة الافتراضية 0.5 مُعلَّمة بخط عمودي متقطع.</title>
  <line class="d-line" x1="80" y1="220" x2="620" y2="220"/>
  <line class="d-line" x1="80" y1="20" x2="80" y2="220"/>
  <text class="d-label-muted" x="70" y="24" text-anchor="end">1.0</text>
  <text class="d-label-muted" x="70" y="124" text-anchor="end">0.5</text>
  <text class="d-label-muted" x="70" y="224" text-anchor="end">0</text>
  <text class="d-label-muted" x="100" y="242" text-anchor="middle">0.3</text>
  <text class="d-label-muted" x="300" y="242" text-anchor="middle">0.5</text>
  <text class="d-label-muted" x="600" y="242" text-anchor="middle">0.8</text>
  <text class="d-label-muted" x="350" y="264" text-anchor="middle">العتبة</text>
  <line class="d-dashed d-line" x1="300" y1="20" x2="300" y2="220"/>
  <path class="d-arrow" d="M100 82 L200 76 L300 62 L400 56 L500 58 L600 48" fill="none"/>
  <path class="d-line" d="M100 34 L200 60 L300 86 L400 100 L500 130 L600 154" fill="none"/>
  <circle class="d-dot" cx="300" cy="62" r="5"/>
  <circle class="d-dot" cx="300" cy="86" r="5"/>
  <text class="d-label" x="610" y="44">precision</text>
  <text class="d-label" x="610" y="160">recall</text>
</svg>
:::

عند 0.3 يُعلِّم النموذج 74 عميلًا ويلتقط 93% من المنقطعين، لكن 31% من العلامات خاطئة. وعند 0.8 يُعلِّم 21، و86% منها صحيحة، لكنه لا يلتقط إلا ثلث المنقطعين. لا طرف "أفضل" من الآخر. النقطة الصحيحة تعتمد على المال.

## دع التكاليف تختار العتبة

أرقام Cartwheel: عرض الاسترجاع يكلّف 20 دولارًا بين خصم ومعالجة. والتواصل مع منقطع حقيقي يُنقذه في 30% من الحالات، والعميل المُنقذ يساوي 100 دولار من هامش الربح، فكل منقطع نتواصل معه يساوي في المتوسط `0.3 * 100 - 20 = +$10`. أما التواصل مع عميل وفيّ فيُهدر الـ 20 دولارًا. والربح هو `10 * TP - 20 * FP`.

لو كانت الاحتمالات معايَرة بإتقان، لاستطعت حلّ معادلة نقطة التعادل: تواصَل حين يكون `p * 10 > (1 - p) * 20`، أي حين `p > 2/3`. لكن الاحتمالات الحقيقية نادرًا ما تكون معايَرة بهذه الجودة، فالنهج الأكثر موثوقية هو البحث عن العتبة التي تعظّم الربح، باستخدام التحقق المتقاطع على بيانات التدريب. وهذا بالضبط ما يفعله `TunedThresholdClassifierCV`.

```python run
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import make_scorer
from sklearn.model_selection import TunedThresholdClassifierCV, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

def profit(y_true, y_pred):
    y_true, y_pred = np.asarray(y_true), np.asarray(y_pred)
    tp = ((y_pred == 1) & (y_true == 1)).sum()
    fp = ((y_pred == 1) & (y_true == 0)).sum()
    return 10 * tp - 20 * fp

base = make_pipeline(StandardScaler(), LogisticRegression())
tuned = TunedThresholdClassifierCV(base, scoring=make_scorer(profit), cv=5).fit(X_train, y_train)
print("chosen threshold:", round(tuned.best_threshold_, 2))

default = base.fit(X_train, y_train)
print("test profit, contact everyone: ", profit(y_test, np.ones(len(y_test))))
print("test profit, threshold 0.5:    ", profit(y_test, default.predict(X_test)))
print("test profit, tuned threshold:  ", profit(y_test, tuned.predict(X_test)))
```

التواصل مع عملاء الاختبار المئة كلهم يخسر 350 دولارًا. العتبة الافتراضية تربح 170 دولارًا؛ والمضبوطة، وهي نحو 0.58، تربح 180 دولارًا مع التواصل مع عدد أقل من الناس. أما القيمة النظرية 0.67 فكانت ستربح أقل، لأن احتمالات النموذج منحرفة قليلًا: وهذا تذكير بأن تثق بالنتائج المقيسة أكثر من المعادلات الأنيقة. تحوّل `make_scorer` أي دالة `(y_true, y_pred)` إلى شيء تستطيع أدوات الضبط في scikit-learn تعظيمه.

يكون الاحتمال **معايَرًا (calibrated)** حين ينقطع فعلًا نحو 70% من كل العملاء الذين نالوا درجة 0.7. الانحدار اللوجستي يقترب من ذلك غالبًا؛ والأشجار المعزّزة والغابات تكون أبعد غالبًا. وحين تحتاج إلى أن تكون الاحتمالات نفسها صحيحة (لتقدير الإيرادات المتوقعة مثلًا لا للترتيب)، يستطيع `CalibratedClassifierCV` في scikit-learn إعادة معايرتها. أما لاختيار عتبة، فالضبط المباشر على المقياس التجاري يتجاوز هذا السؤال.

:::mistake ضبط العتبة على بيانات الاختبار
جدول العتبات أعلاه حُسب على بيانات الاختبار ليبيّن المفاضلة. واختيار عتبة منه ونشر ربح الاختبار ذاك سيكون متفائلًا، وهي مشكلة اختلاس النظر نفسها التي تقع مع أي hyperparameter. يختار `TunedThresholdClassifierCV` باستخدام طيّات (folds) التحقق المتقاطع من بيانات التدريب وحدها؛ وتُستخدم بيانات الاختبار مرة واحدة، للإبلاغ.
:::

## حين تكون الفئة الإيجابية نادرة

المنقطعون 55% من العملاء، فكلتا الفئتين ممثّلة جيدًا. لكن كثيرًا من المسائل الحقيقية ليست كذلك: الاحتيال، والعيوب، والأمراض النادرة. خذ بيانات الأرقام (digits) واسأل "هل هذا 9؟". 10% فقط من الصور كذلك، فالنموذج الذي يجيب "لا" دائمًا يحقق accuracy بنسبة 90%.

```python run
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, digit = load_digits(return_X_y=True)
y = (digit == 9).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
print("share of 9s:", round(y.mean(), 3))

for weights in [None, "balanced"]:
    m = make_pipeline(StandardScaler(), LogisticRegression(class_weight=weights, max_iter=1000))
    m.fit(X_train, y_train)
    pred, prob = m.predict(X_test), m.predict_proba(X_test)[:, 1]
    print(f"class_weight={weights!s:9} accuracy {m.score(X_test, y_test):.3f}  "
          f"precision {precision_score(y_test, pred):.2f}  recall {recall_score(y_test, pred):.2f}  "
          f"avg precision {average_precision_score(y_test, prob):.3f}")
```

لا تكاد الـ accuracy تتحرك، من 0.98 إلى 0.97، ولا تخبرك بشيء مفيد. أما الـ precision والـ recall فتحكيان القصة الحقيقية. يزن `class_weight="balanced"` كل فئة بعكس تكرارها أثناء التدريب، فيكلّف الرقم 9 الفائت نحو تسعة أضعاف الإنذار الكاذب. ترتفع الـ recall من 0.82 إلى 0.91، وتنخفض الـ precision من 0.97 إلى 0.82. وتلخّص **الـ average precision** (المساحة تحت منحنى precision-recall) جودة الترتيب مع تركيز على الفئة النادرة؛ وهي عادةً أغنى بالمعلومات من الـ ROC AUC حين تكون الحالات الإيجابية شحيحة.

:::tip الأوزان أم العتبة؟
كلاهما يحرّك المفاضلة نفسها. أوزان الفئات تغيّر ما يتعلّمه النموذج؛ والعتبة تغيّر كيف تتصرّف بناءً على درجاته. ابدأ بالعتبة، لأنها أرخص، وقابلة للتراجع، ومرتبطة مباشرة بالتكاليف. وأضف أوزان الفئات حين تكون الفئة النادرة نادرة إلى حدّ أن النموذج لا يكاد يتعلّمها.
:::

ظللت تقارن النماذج والعتبات على بيانات اختبار واحدة من 100 عميل، وتتحفّظ على كل فجوة بأنها "ربما ضجيج". يستبدل القسم 4 هذا التقسيم الواحد بالتحقق المتقاطع، فتستطيع أخيرًا أن تقول كم يجب أن يكون الفرق كبيرًا قبل أن يكون حقيقيًا.
