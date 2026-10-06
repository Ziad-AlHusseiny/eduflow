---
summary: استبدل التقسيم الواحد إلى تدريب واختبار بالتحقق المتقاطع k-fold، واقرأ متوسط نتائج الطيّات وتشتّتها، واحكم ما إذا كان الفرق بين النماذج حقيقيًا أم ضجيجًا.
takeaways:
  - "يدرّب التحقق المتقاطع k-fold عدد k من النماذج، كلٌّ منها يُقيَّم على طيّة (fold) مختلفة، فيُستخدم كل صف تدريب للتحقق مرة واحدة بالضبط."
  - متوسط نتائج الطيّات يقدّر الأداء؛ وانحرافها المعياري يخبرك كم يمكن أن يضلّلك تقسيم واحد.
  - "استخدم `StratifiedKFold` مع `shuffle=True` و`random_state` ثابت في التصنيف، ومرّر الـ splitter نفسه إلى كل نموذج تقارنه."
  - "تُعيد `cross_validate` عدة مقاييس دفعة واحدة، إضافة إلى أزمنة التدريب والتقييم."
  - طبّق التحقق المتقاطع على بيانات التدريب لتختار؛ واحتفظ ببيانات الاختبار لفحص نهائي واحد.
further:
  - title: "Cross-validation: evaluating estimator performance"
    url: https://scikit-learn.org/stable/modules/cross_validation.html
  - title: cross_validate
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_validate.html
  - title: StratifiedKFold
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedKFold.html
quiz:
  - q: "في تحقق متقاطع من 5 طيّات على 298 صف تدريب، كم نموذجًا يُدرَّب، وعلى كم صفًا يتدرّب كلٌّ منها؟"
    options:
      - text: "نموذج واحد، مدرَّب على الصفوف الـ 298 كلها ومقيَّم خمس مرات."
        why: تقييم نموذج واحد خمس مرات على بيانات تدرّب عليها يقيس الحفظ، لا التعميم.
      - text: "خمسة نماذج، كلٌّ منها مدرَّب على نحو 60 صفًا ومقيَّم على البقية."
        why: هذا معكوس. كل نموذج يُقيَّم على طيّة واحدة (نحو 60 صفًا) ويتدرّب على الطيّات الأربع الأخرى.
      - text: "خمسة نماذج، كلٌّ منها مدرَّب على نحو 238 صفًا ومقيَّم على الـ 60 المتبقية."
        why: صحيح. كل صف يقع في طيّة التحقق مرة واحدة، وفي طيّات التدريب أربع مرات.
      - text: "خمسة وعشرون نموذجًا، واحد لكل زوج من الطيّات."
        why: يدرّب الـ k-fold العادي نموذجًا واحدًا لكل طيّة. المخططات المكرّرة أو المتداخلة تدرّب أكثر، لكن هذا ليس منها.
    answer: 2
  - q: "يحقق النموذج A دقة 0.75 ± 0.04 عبر خمس طيّات؛ ويحقق النموذج B دقة 0.73 ± 0.05. ما الاستنتاج المنصف؟"
    options:
      - text: الفرق صغير مقارنةً بالتشتّت بين الطيّات، فعاملهما على أنهما شبه متعادلين.
        why: صحيح. فجوة نقطتين داخل تشتّت من أربع إلى خمس نقاط قد تنقلب بسهولة مع خلط آخر.
      - text: A أفضل بوضوح، لأن متوسطه أعلى.
        why: المتوسطات وحدها تتجاهل الضجيج. ومع تشتّت بهذا الحجم، لا يكون الترتيب موثوقًا.
      - text: B أفضل، لأن الانحراف المعياري الأكبر يعني أنه يتكيّف أكثر.
        why: التشتّت الأكبر يعني أداءً أقل استقرارًا، لا نقطة قوة.
    answer: 0
  - q: "لماذا تستخدم كائن `StratifiedKFold(..., random_state=42)` نفسه لكل نموذج تقارنه؟"
    options:
      - text: لأن الـ splitters المختلفة ستجعل بعض النماذج تتدرّب أسرع.
        why: السرعة لا تتأثر؛ والمسألة تتعلّق بعدالة المقارنة.
      - text: لأن scikit-learn يشترط splitter واحدًا لكل سكربت.
        why: لا توجد قاعدة كهذه؛ يمكنك إنشاء ما تشاء منها.
      - text: لأنه يخلط البيانات بشكل مختلف لكل نموذج، وهذا أعدل.
        why: العكس هو الصحيح. الخلطات المختلفة تضيف ضجيجًا إلى المقارنة.
      - text: لأن كل نموذج يُقيَّم حينها على الطيّات نفسها تمامًا، فتأتي الفروق من النماذج لا من التقسيمات.
        why: صحيح. المقارنات المزدوجة على طيّات متطابقة أقل ضجيجًا بكثير.
    answer: 3
  - q: "بعد أن يختار التحقق المتقاطع الانحدار اللوجستي، ماذا يجب أن تفعل ببيانات الاختبار؟"
    options:
      - text: أضفها إلى التحقق المتقاطع لتحصل على طيّات أكثر.
        why: عندها لا يبقى شيء لتقدير نهائي غير منحاز.
      - text: درّب النموذج المختار على بيانات التدريب كلها وقيّمه على بيانات الاختبار مرة واحدة.
        why: صحيح. نتيجة الاختبار هي الرقم الذي تنشره، ولم تؤثر في أي قرار.
      - text: تخطّها، فنتيجة التحقق المتقاطع غير منحازة أصلًا.
        why: استُخدمت نتيجة التحقق المتقاطع للاختيار بين النماذج، فهي متفائلة قليلًا لصالح الفائز.
    answer: 1
---

طوال القسم 3 جاءت كل مقارنة مع تحفّظ: "على 100 عميل اختبار، النقطتان تعنيان عميلين". حققت الغابة 0.76، والـ boosting 0.78، والانحدار اللوجستي 0.72. فهل كان الـ boosting أفضل حقًا، أم حالفه الحظ مع بيانات الاختبار؟ تقسيم واحد لا يستطيع أن يخبرك. تحتاج إلى عدة تقسيمات، وهذا ما يمنحك إياه التحقق المتقاطع (cross-validation).

## خمسة تقسيمات بدل واحد

يقطّع **التحقق المتقاطع k-fold** بيانات التدريب إلى k طيّة متساوية (5 هي القيمة الافتراضية المعتادة). ويدرّب k نموذجًا: كلٌّ منها يتعلّم من k−1 طيّة ويُقيَّم على الطيّة التي لم يرَها. ينتهي بك الأمر بـ k نتيجة، وكل صف تدريب يكون قد وقع في طيّة تحقق مرة واحدة بالضبط.

:::figure التحقق المتقاطع بخمس طيّات
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">خمسة صفوف، واحد لكل جولة. في كل صف تظهر بيانات التدريب كخمس كتل؛ تُبرَز كتلة مختلفة كطيّة تحقق في كل مرة، وتُستخدم الأربع الأخرى للتدريب. وكل جولة تنتج نتيجة واحدة.</title>
  <text class="d-label-muted" x="20" y="20">الجولة</text>
  <text class="d-label-muted" x="590" y="20">النتيجة</text>
  <text class="d-label" x="30" y="52">1</text>
  <rect class="d-box-warn" x="60" y="34" width="96" height="28" rx="4"/><rect class="d-box" x="160" y="34" width="96" height="28" rx="4"/><rect class="d-box" x="260" y="34" width="96" height="28" rx="4"/><rect class="d-box" x="360" y="34" width="96" height="28" rx="4"/><rect class="d-box" x="460" y="34" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="53">0.72</text>
  <text class="d-label" x="30" y="92">2</text>
  <rect class="d-box" x="60" y="74" width="96" height="28" rx="4"/><rect class="d-box-warn" x="160" y="74" width="96" height="28" rx="4"/><rect class="d-box" x="260" y="74" width="96" height="28" rx="4"/><rect class="d-box" x="360" y="74" width="96" height="28" rx="4"/><rect class="d-box" x="460" y="74" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="93">0.75</text>
  <text class="d-label" x="30" y="132">3</text>
  <rect class="d-box" x="60" y="114" width="96" height="28" rx="4"/><rect class="d-box" x="160" y="114" width="96" height="28" rx="4"/><rect class="d-box-warn" x="260" y="114" width="96" height="28" rx="4"/><rect class="d-box" x="360" y="114" width="96" height="28" rx="4"/><rect class="d-box" x="460" y="114" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="133">0.68</text>
  <text class="d-label" x="30" y="172">4</text>
  <rect class="d-box" x="60" y="154" width="96" height="28" rx="4"/><rect class="d-box" x="160" y="154" width="96" height="28" rx="4"/><rect class="d-box" x="260" y="154" width="96" height="28" rx="4"/><rect class="d-box-warn" x="360" y="154" width="96" height="28" rx="4"/><rect class="d-box" x="460" y="154" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="173">0.81</text>
  <text class="d-label" x="30" y="212">5</text>
  <rect class="d-box" x="60" y="194" width="96" height="28" rx="4"/><rect class="d-box" x="160" y="194" width="96" height="28" rx="4"/><rect class="d-box" x="260" y="194" width="96" height="28" rx="4"/><rect class="d-box" x="360" y="194" width="96" height="28" rx="4"/><rect class="d-box-warn" x="460" y="194" width="96" height="28" rx="4"/>
  <text class="d-code" x="590" y="213">0.68</text>
  <text class="d-label-muted" x="60" y="248">المُبرَزة = طيّة التحقق، والبقية = طيّات التدريب</text>
</svg>
:::

متوسط النتائج الـ k تقدير أثبت من أي تقسيم منفرد. والتشتّت بينها لا يقل قيمة: فهو يبيّن كم يمكن أن تتحرك النتيجة لأسباب لا علاقة لها بالنموذج.

## التحقق المتقاطع لنماذج الانقطاع

تنفّذ `cross_val_score` الحلقة كلها لمقياس واحد؛ وتتعامل `cross_validate` مع عدة مقاييس دفعة واحدة. في التصنيف، مرّر `StratifiedKFold` مع `shuffle=True` كي تحافظ كل طيّة على نسبة الانقطاع البالغة 55% وتُخلط الصفوف أولًا. أنشئ الـ splitter مرة واحدة وأعد استخدامه لكل نموذج كي تواجه كلها الطيّات نفسها تمامًا.

```python run
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
models = {
    "dummy": DummyClassifier(),
    "logistic": make_pipeline(StandardScaler(), LogisticRegression()),
    "tree depth 3": DecisionTreeClassifier(max_depth=3, random_state=42),
    "forest": RandomForestClassifier(n_estimators=200, min_samples_leaf=5, random_state=42),
    "boosting": HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05,
                                               max_iter=100, random_state=42),
}
for name, model in models.items():
    r = cross_validate(model, X_train, y_train, cv=cv, scoring=["accuracy", "roc_auc"])
    acc, auc = r["test_accuracy"], r["test_roc_auc"]
    print(f"{name:13} accuracy {acc.mean():.3f} ± {acc.std():.3f}   ROC AUC {auc.mean():.3f} ± {auc.std():.3f}")
```

اقرأ التشتّت أولًا. تتراوح دقة الانحدار اللوجستي بين 0.68 و0.81 عبر الطيّات، وهذا تأرجح بـ 13 نقطة لا سبب له إلا أيّ العملاء وقع في أيّ طيّة. وفي مواجهة هذا الضجيج، لا تعني فروق الـ accuracy بين النماذج الحقيقية الأربعة (من 0.73 إلى 0.76) شيئًا يُذكر: فكل فجوة أصغر من انحراف معياري واحد.

أما الـ ROC AUC، الذي يقيّم الترتيب كاملًا، فأكثر حسمًا: يقف الانحدار اللوجستي والغابة عند نحو 0.81، والـ boosting عند نحو 0.79، وتتأخر الشجرة بعمق 3 عند 0.74 مع أكبر تشتّت. هذا نمط يمكنك التصرّف بناءً عليه.

بالنسبة إلى قاعدة الـ 80 يومًا، يعني التحقق المتقاطع إعادة اختيار الحدّ الفاصل على كل مجموعة من طيّات التدريب وتقييمه على الطيّة المحجوزة. وبهذه الطريقة يبلغ متوسطها 0.70 من الـ accuracy. وكل نموذج حقيقي يتفوّق عليها، ببضع نقاط.

## ما الذي يمكنك استنتاجه

مجتمعةً، يحكي التحقق المتقاطع قصة أهدأ مما حكاه التقسيم الواحد في القسم 3. كانت دقة الـ boosting البالغة 0.78 على الاختبار حظًا جزئيًا؛ فعبر خمس طيّات هي 0.75، ضمن هامش الضجيج مع كل ما عداها، وهو يرتّب أسوأ من الانحدار اللوجستي. والغابة والانحدار اللوجستي متعادلان في الترتيب. ومع التعادل، فضّل النموذج الأبسط: الانحدار اللوجستي يتدرّب في أجزاء من الثانية، ومعاملاته قابلة للشرح، ولا شيء فيه يُضبط سوى `C`.

هذه هي مكافأة المتشكّك. فبدون التحقق المتقاطع كنت ستطلق الـ boosting بسبب رقم حالفه الحظ.

:::mistake مقارنة النماذج على تقسيمات مختلفة
استدعاء `cross_val_score(model, X, y, cv=5)` لكل نموذج على حدة لا بأس به في المصنِّفات (فقيمة `cv` الصحيحة تعطي الطيّات الطبقية نفسها غير المخلوطة في كل مرة). لكن خلط الـ splitters، أو استخدام `shuffle=True` دون `random_state`، أو مقارنة نتيجة تحقق متقاطع لنموذج بنتيجة اختبار واحدة لآخر، يجعل المقارنة مليئة بالضجيج أو غير عادلة. أنشئ splitter واحدًا ومرّره إلى كل شيء.
:::

## اختيار k، وما لا يصلحه التحقق المتقاطع

- **k = 5** هو المعيار. و**k = 10** يعطي كل نموذج بيانات تدريب أكثر وتقديرًا أقل تشاؤمًا بقليل، بضعف الكلفة. مع مجموعات البيانات الصغيرة جدًا (بضع عشرات من الصفوف)، تساعد الطيّات الأكثر؛ ومع الكبيرة، تكفي حتى 3 طيّات.
- نتائج الطيّات ليست مستقلة (فطيّات التدريب متداخلة)، لذا عامِل الانحراف المعياري كدليل تقريبي على الضجيج، لا كهامش خطأ رسمي.
- التحقق المتقاطع لا يحميك من التسرّب. فإذا تسلّلت معلومات من طيّة التحقق إلى التدريب، تصبح كل طيّة متفائلة. و[درس تسرّب البيانات](lesson:l-ml-4-4) يدور حول ذلك بالضبط.

:::note أين تقع بيانات الاختبار الآن
يعمل التحقق المتقاطع على `X_train` وحدها. إنه أداتك لاختيار النماذج والـ features والإعدادات. وحين تنتهي من الاختيار، درّب الفائز على `X_train` كاملة وقيّمه مرة واحدة على `X_test`. هذا الرقم الوحيد هو ما تنشره.
:::

حتى الآن استخدم كل نموذج الأعمدة الرقمية الثمانية. لكن البيانات تحتوي أيضًا على الدول والشرائح ودرجة رضا نصف فارغة تحتاج إلى ترميز وملء قبل أي شيء. يبني الدرس القادم pipeline يفعل كل ذلك داخل كل طيّة، فيبقى التحقق المتقاطع أمينًا.
