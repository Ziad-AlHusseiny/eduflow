---
summary: افحص أخطاء النموذج مجموعةً مجموعة، واختر معيار إنصاف يطابق الضرر، وراقب المدخلات والتنبؤات والنتائج كي تلاحظ حين يبتعد العالم عن بيانات التدريب.
takeaways:
  - "يدخل الانحياز عبر البيانات (labels تاريخية، ومجموعات ممثّلة تمثيلًا ناقصًا، وfeatures بديلة) وعبر طريقة استخدام التنبؤات؛ والنتيجة الإجمالية الجيدة قد تُخفي نتيجة سيئة لمجموعة واحدة."
  - "افحص بمقاييس لكل مجموعة: نسبة الاختيار، والـ recall، والـ precision، محسوبة على تنبؤات خارج الطيّة (out-of-fold) أو على بيانات الاختبار."
  - تعريفات الإنصاف مثل تساوي نِسب الاختيار وتساوي الـ recall وتساوي الـ precision لا يمكن عادةً أن تتحقق كلها معًا؛ فاختر التعريف الذي يطابق من يتضرّر من أيّ خطأ.
  - حذف العمود الحسّاس لا يزيل الانحياز، لأن features أخرى تعمل كبدائل عنه؛ فأبقِه متاحًا للفحص.
  - "راقب ثلاثة أشياء بعد الإطلاق: توزيعات المدخلات (data drift)، وتوزيع التنبؤات، والأداء الحقيقي حين تصل النتائج."
further:
  - title: cross_val_predict
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_val_predict.html
  - title: "Model evaluation: classification metrics"
    url: https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics
quiz:
  - q: "الـ recall لنموذج الانقطاع 0.82 للعملاء المصريين و0.71 للعملاء الكنديين. وعروض الاسترجاع تذهب إلى العملاء المُعلَّمين. من المتضرّر؟"
    options:
      - text: المنقطعون الكنديون، فاحتمال تعليمهم وتقديم عرض لهم أقل.
        why: صحيح. انخفاض الـ recall يعني أن عددًا أكبر من المنقطعين الكنديين يفوت النموذج، فيحصل عدد أقل منهم على الفائدة.
      - text: العملاء المصريون، لأن عددًا أكبر منهم يُعلَّم.
        why: أن يُعلَّم العميل هنا يعني أن يتلقّى عرضًا، وهو فائدة لا عقوبة.
      - text: لا أحد، لأن الـ recall الإجمالية جيدة.
        why: المتوسط الإجمالي قد يُخفي مجموعة تُخدم بشكل أسوأ باستمرار.
      - text: العملاء الكنديون الذين بقوا، لأنهم يُعلَّمون أكثر.
        why: هذا يتعلّق بالإيجابيات الكاذبة (الـ precision أو معدّل الإيجابيات الكاذبة)، لا بالـ recall.
    answer: 0
  - q: "يحذف زميلك `country` من الـ features 'ليجعل النموذج منصفًا'. لماذا لا يكفي ذلك؟"
    options:
      - text: لأن حذف عمود يخفض الـ accuracy دائمًا إلى ما دون خط الأساس.
        why: قد يغيّر الـ accuracy قليلًا أو لا يغيّرها إطلاقًا؛ ومسألة الإنصاف منفصلة.
      - text: لأن features أخرى، مثل رسوم الشحن أو أزمنة التوصيل، قد تحمل المعلومة نفسها، ولم يعد بإمكانك الفحص بحسب الدولة.
        why: صحيح. البدائل تُعيد الانحياز، ودون العمود لا تستطيع قياس ما إذا كان قد عاد.
      - text: لأن scikit-learn يشترط بقاء السمات الحسّاسة في النموذج.
        why: لا يوجد شرط كهذا؛ المسألة تتعلّق بالبدائل والفحص.
    answer: 1
  - q: "بعد شهرين من الإطلاق، ترتفع حصة العملاء المُعلَّمين كمنقطعين من 47% إلى 60%، لكن لا نتائج انقطاع معروفة بعد. ما أفضل خطوة أولى؟"
    options:
      - text: أعد التدريب فورًا على أحدث البيانات.
        why: ليست لديك labels جديدة بعد، ولا تعرف ما إذا كان النموذج هو الذي تغيّر أم العالم.
      - text: اخفض العتبة كي تعود نسبة العملاء المُعلَّمين إلى 47%.
        why: هذا يُخفي الإشارة بدل أن يفسّرها.
      - text: تجاهل الأمر حتى تصل نتائج الـ 90 يومًا.
        why: انتظار ثلاثة أشهر لمشكلة يمكنك التحقيق فيها اليوم أمر مكلف.
      - text: قارن توزيعات المدخلات الحالية ببيانات التدريب لتعرف أيّ الـ features تحرّك، ثم اسأل الفرق المعنية في الشركة عن السبب.
        why: صحيح. فحوص انجراف البيانات تعمل دون labels وتشير عادةً إلى سبب، مثل مشكلة في التوصيل أو تطبيق جديد.
    answer: 3
---

بلغ نموذجك البطل ROC AUC على الاختبار قدره 0.81. هذا رقم واحد لـ 100 عميل من ثماني دول وثلاث شرائح. ومن الممكن تمامًا أن يكون النموذج جيدًا في المتوسط وضعيفًا لمجموعة واحدة، وأن تكون تلك المجموعة هي الأقل قدرة على الشكوى. ومن الممكن أيضًا أن يكون نموذج كان جيدًا في أكتوبر مخطئًا بصمت في مارس. يغطي هذا الدرس الأمرين: الإنصاف (fairness) قبل الإطلاق، والانجراف (drift) بعده.

## من أين يأتي الانحياز

نادرًا ما يكون الانحياز (bias) في النموذج سطرًا من الكود. إنه يصل مع البيانات ومع طريقة استخدام التنبؤات:

- **الانحياز التاريخي**: الـ labels تسجّل قرارات سابقة، لا الحقيقة. والنموذج المدرَّب على من حصل على الموافقة يتعلّم من حصل على الموافقة، بما في ذلك أي تحيّز في تلك الموافقات.
- **التمثيل**: المجموعات الصغيرة تعطي النموذج ما يتعلّمه أقل. لدى Cartwheel 17 عميلًا أردنيًا في الجدول كله؛ وأي نموذج سيكون أقل موثوقية لهم.
- **البدائل (proxies)**: حذف عمود حسّاس لا يحذف معلوماته. فرسوم الشحن وأزمنة التوصيل والعملة قد تحلّ محل الدولة.
- **الاستخدام**: الدرجة نفسها تعني أشياء مختلفة بحسب الإجراء. علامة انقطاع تطلق خصمًا تفيد العميل المُعلَّم؛ وعلامة تطلق تجميد الائتمان تضرّه.

## فحص النموذج مجموعةً مجموعة

لتفحص بإنصاف تحتاج إلى تنبؤات لعملاء كثيرين لم يتدرّب عليهم النموذج. تعطي `cross_val_predict` كل صف تنبؤًا خارج الطيّة: فكل عميل يُقيَّم بنموذج تدرّب على الطيّات الأخرى.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
model = make_pipeline(StandardScaler(), LogisticRegression())
prob = cross_val_predict(model, churn[features], churn["churned"], cv=cv, method="predict_proba")[:, 1]
audit = churn.assign(flagged=(prob >= 0.5).astype(int))

def group_report(g):
    return pd.Series({
        "customers": len(g),
        "churn_rate": g["churned"].mean(),
        "flag_rate": g["flagged"].mean(),
        "recall": recall_score(g["churned"], g["flagged"]),
        "precision": precision_score(g["churned"], g["flagged"]),
    })

print(audit.groupby("segment")[["churned", "flagged"]].apply(group_report).round(2))
print(audit.groupby("country")[["churned", "flagged"]].apply(group_report).round(2))
```

اقرأ عبر الأعمدة:

- **نسبة العملاء المُعلَّمين (flag rate)** أو نسبة الاختيار: كم مرة تحصل كل مجموعة على العرض.
- **الـ Recall**: من منقطعي كل مجموعة، كم منهم يلتقط النموذج. وهي هنا حصة العملاء المعرّضين للخطر الذين يحصلون على المساعدة.
- **الـ Precision**: من العملاء المُعلَّمين في كل مجموعة، كم منهم كان راحلًا فعلًا. والـ precision المنخفضة تعني خصومات تذهب إلى أشخاص كانوا سيبقون.

تتراوح الـ recall بين 0.71 (كندا والإمارات والمملكة المتحدة) و0.82 (مصر والأردن). والـ precision للشركات الصغيرة 0.66 مقابل 0.78 للمستهلكين الأفراد. بعض الفجوات ضجيج: فأرقام الأردن تقوم على 17 عميلًا، فيحرّكها عميل واحد بعدة نقاط. وبعضها يستحق نظرة أدقّ مع نمو البيانات. ليس الغرض من الفحص ختم نجاح/رسوب؛ بل معرفة أين يكون النموذج أضعف، كي تقرّر ما إذا كان ذلك مقبولًا.

## اختيار معنى "المنصف"

هناك عدة تعريفات معقولة، وحين تختلف النِّسب الأساسية بين المجموعات (تنقطع مصر بنسبة 67%، وألمانيا بنسبة 45%) لا يمكن أن تتحقق كلها معًا:

- **تساوي نِسب الاختيار** (demographic parity): كل مجموعة تُعلَّم بالنسبة نفسها.
- **تساوي الـ recall** (equal opportunity): المنقطعون الحقيقيون في كل مجموعة يُلتقطون بالنسبة نفسها.
- **تساوي الـ precision**: العلامة تعني الخطر نفسه في كل مجموعة.

اختر بأن تسأل من يتضرّر من أيّ خطأ. في عروض الاسترجاع، الضرر هو منقطع لا يصله العرض أبدًا، فتساوي الـ recall هو الهدف الطبيعي. وفي نموذج يجمّد الحسابات، الضرر هو الإيجابي الكاذب، فستنظر إلى معدّلات الإيجابيات الكاذبة بدلًا من ذلك. دوّن اختيارك؛ فهو قرار تجاري وأخلاقي، لا خيار تقني افتراضي.

:::mistake حذف العمود الحسّاس وإعلان النصر
"لا نستخدم الدولة، فلا يمكن أن يكون النموذج منحازًا بسببها" يُسمّى الإنصاف عبر التجاهل (fairness through unawareness)، وهو يفشل كلما ارتبطت features أخرى بالدولة. والأسوأ أنك دون العمود لا تستطيع إجراء الفحص أعلاه. أبقِ السمات الحسّاسة خارج النموذج إن اشترطت السياسة ذلك، لكن أبقِها في بيانات التقييم.
:::

## بعد الإطلاق: الانجراف

تعلّم النموذج من العملاء كما كانوا في 30 سبتمبر 2025. والعالم يتحرّك. **انجراف البيانات (data drift)** تغيّر في المدخلات: تطبيق جوّال جديد يحرّك `mobile_share`، وإضراب شركة شحن يمطّ `days_since_last_order`. و**انجراف المفهوم (concept drift)** تغيّر في العلاقة نفسها: برنامج ولاء لدى منافس يجعل حتى العملاء الحديثين يرحلون. وللانقطاع **تأخّر في الـ labels**: فلا تعرف ما إذا كان التنبؤ صحيحًا إلا بعد 90 يومًا.

:::figure مراقبة نموذج انقطاع مُطلَق
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">حلقة من أربع مراحل. يوميًا: افحص توزيعات المدخلات مقابل بيانات التدريب. يوميًا: تتبّع حصة العملاء المُعلَّمين. بعد 90 يومًا: قارن التنبؤات بالنتائج الحقيقية. حين تفشل الفحوص: حقّق، ثم أعد التدريب والفحص، وهذا يعود إلى النموذج المُطلَق.</title>
  <rect class="d-box-primary" x="250" y="10" width="180" height="46" rx="10"/>
  <text class="d-label" x="340" y="38" text-anchor="middle">النموذج المُطلَق</text>
  <rect class="d-box-accent" x="20" y="92" width="190" height="56" rx="10"/>
  <text class="d-label" x="115" y="116" text-anchor="middle">فحوص انجراف المدخلات</text>
  <text class="d-label-muted" x="115" y="137" text-anchor="middle">يوميًا، دون labels</text>
  <rect class="d-box-accent" x="245" y="92" width="190" height="56" rx="10"/>
  <text class="d-label" x="340" y="116" text-anchor="middle">مزيج التنبؤات</text>
  <text class="d-label-muted" x="340" y="137" text-anchor="middle">نسبة المُعلَّمين لكل مجموعة</text>
  <rect class="d-box-warn" x="470" y="92" width="190" height="56" rx="10"/>
  <text class="d-label" x="565" y="116" text-anchor="middle">الأداء الحقيقي</text>
  <text class="d-label-muted" x="565" y="137" text-anchor="middle">بعد 90 يومًا</text>
  <rect class="d-box-success" x="250" y="178" width="180" height="46" rx="10"/>
  <text class="d-label" x="340" y="206" text-anchor="middle">حقّق، وأعد التدريب والفحص</text>
  <path class="d-arrow" d="M290 56 L150 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 56 L340 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 56 L530 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M115 148 L250 195" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M565 148 L430 195" marker-end="url(#arrow)"/>
</svg>
:::

يمكن فحص انجراف المدخلات كل يوم، دون labels، بمقارنة القيم الحديثة لكل feature ببيانات التدريب. واختبار Kolmogorov–Smirnov للعيّنتين من SciPy بداية بسيطة:

```python run
import numpy as np
import pandas as pd
from scipy.stats import ks_2samp

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
training = churn[features]

# Simulate next quarter: a courier problem delays orders and a new app shifts shopping to mobile
rng = np.random.default_rng(7)
recent = training.sample(150, random_state=1).copy()
recent["days_since_last_order"] += rng.integers(20, 60, len(recent))
recent["mobile_share"] = (recent["mobile_share"] + 0.3).clip(0, 1)

for col in features:
    stat, p = ks_2samp(training[col], recent[col])
    flag = "DRIFT" if p < 0.01 else ""
    print(f"{col:22} KS {stat:.2f}  p={p:.3g} {flag}")
```

يضيء العمودان اللذان تغيّرا؛ ولا يضيء الباقي. في بيئة الإنتاج ستشغّل هذا وفق جدول زمني، وتطلق تنبيهًا على الانجراف المستمر لا على يوم سيئ واحد، وتقرنه بنسبة العملاء المُعلَّمين في كل مجموعة، ثم بالـ recall والـ precision لكل مجموعة حين تصل النتائج. وحين ينخفض الأداء الحقيقي، أعد التدريب على بيانات حديثة وأعد إجراء فحص هذا الدرس قبل إعادة الإطلاق.

:::tip اكتب بطاقة نموذج (model card)
احتفظ بسجلّ من صفحة واحدة بجانب النموذج: ما الذي يتنبأ به ولمن، وتواريخ بيانات التدريب، والمقاييس الإجمالية ولكل مجموعة، ومعيار الإنصاف الذي اخترته ولماذا، ونقاط الضعف المعروفة (17 عميلًا أردنيًا)، وما الذي تجري مراقبته. إنها الوثيقة التي سيحتاجها أحدهم حين يفاجئه النموذج بعد عام.
:::

المراقبة تفترض أن النموذج يعمل في مكان ما. يحزم الدرس الأخير الـ pipeline البطل، ويضعه خلف API، ويغلق الحلقة.
