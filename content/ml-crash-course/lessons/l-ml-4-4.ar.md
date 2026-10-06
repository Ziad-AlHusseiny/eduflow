---
summary: تعرّف على الأنواع الثلاثة الشائعة لتسرّب البيانات (تسرّب الهدف، والمعالجة المسبقة قبل التقسيم، والصفوف أو الأزمنة المتداخلة) وامنعها باللقطات الزمنية والـ pipelines والـ splitter الصحيح.
takeaways:
  - "تسرّب البيانات (data leakage) هو أي معلومة متاحة أثناء التدريب أو التقييم لن تكون متاحة حين يتنبأ النموذج فعليًا."
  - "يأتي تسرّب الهدف من features سُجّلت بعد لحظة التنبؤ؛ فاسأل عن كل عمود: هل كنت سأعرف هذه القيمة وقت التنبؤ؟"
  - "تدريب scaler أو imputer أو أداة لاختيار الـ features قبل التقسيم يتيح لصفوف التحقق أن تشكّل النموذج؛ فضع كل خطوة متعلَّمة داخل pipeline."
  - "حين تنتمي الصفوف إلى العميل نفسه أو يتبع بعضها بعضًا زمنيًا، استخدم `GroupKFold` أو `TimeSeriesSplit` بدل التقسيم العشوائي."
  - النتيجة التي تبدو أجمل من أن تُصدَّق، أو feature واحد يهيمن على الـ permutation importance، سبب للبحث عن تسرّب قبل الاحتفال.
further:
  - title: "Common pitfalls: data leakage"
    url: https://scikit-learn.org/stable/common_pitfalls.html#data-leakage
  - title: "Cross-validation iterators for grouped data"
    url: https://scikit-learn.org/stable/modules/cross_validation.html#group-k-fold
  - title: TimeSeriesSplit
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html
quiz:
  - q: "أضاف زميلك `refund_issued_in_q4` إلى features الانقطاع فقفز الـ ROC AUC من 0.81 إلى 0.97. والتنبؤ يتم في 30 سبتمبر. ما المشكلة؟"
    options:
      - text: الـ feature يصف أحداثًا بعد تاريخ التنبؤ، فلن يكون موجودًا حين يعمل النموذج؛ إنه تسرّب للهدف.
        why: صحيح. استرداد الأموال في الربع الرابع يحدث خلال نافذة النتيجة، فالنموذج يقرأ الإجابة جزئيًا.
      - text: الـ feature ثنائي، والـ features الثنائية تضخّم الـ AUC دائمًا.
        why: كثير من الـ features المشروعة ثنائية (`used_coupon`). المشكلة في التوقيت، لا في النوع.
      - text: لا شيء؛ فاسترداد الأموال محرّك معروف للانقطاع.
        why: قد يكون كذلك فعلًا، لكن النموذج لا يستطيع أن يستخدم إلا ما هو معروف وقت التنبؤ.
      - text: النموذج يعاني من الـ overfitting ويحتاج إلى `C` أصغر.
        why: العقوبة الأقوى لن تمنع النموذج من استخدام feature يرمّز النتيجة.
    answer: 0
  - q: "على 2,000 عمود من الضجيج الصرف، يعطي اختيار أفضل 20 عمودًا على البيانات كلها ثم تطبيق التحقق المتقاطع دقة 0.75. وداخل pipeline يعطي 0.48. لماذا؟"
    options:
      - text: نسخة الـ pipeline تستخدم صفوف تدريب أقل، فهي أضعف.
        why: كلتاهما تستخدم الطيّات نفسها؛ والفرق في المكان الذي يحدث فيه الاختيار.
      - text: الاختيار على كل الصفوف التقط أعمدة صادف أنها ترتبط بـ labels صفوف التحقق أيضًا، فكأن تلك الصفوف رُئيت أثناء التدريب.
        why: صحيح. داخل الـ pipeline لا يرى الاختيار إلا صفوف تدريب كل طيّة، فلا يستطيع الضجيج أن يتوافق مع labels التحقق.
      - text: SelectKBest عشوائي، فاختار التشغيلان أعمدة مختلفة.
        why: SelectKBest حتمي؛ والفرق في الصفوف التي نظر إليها.
    answer: 1
  - q: "في سجلّ الطلبات عدة صفوف لكل عميل، وتريد التنبؤ على مستوى الطلب. أيّ splitter يتجنّب التسرّب بين الطيّات؟"
    options:
      - text: "`StratifiedKFold(shuffle=True)`، لأنه يوازن الفئات."
        why: توازن الفئات لا يمنع وقوع طلبات العميل نفسه في طيّات التدريب والتحقق معًا.
      - text: "`KFold(shuffle=False)`، لتحافظ الصفوف على ترتيبها."
        why: الطيّات غير المخلوطة تظل تقسم صفوف العميل بين الطيّات حين لا تكون متجاورة.
      - text: "`GroupKFold` مع معرّف العميل كمجموعة، فتبقى صفوف كل عميل في طيّة واحدة."
        why: صحيح. عندها يُقيَّم النموذج دائمًا على عملاء لم يرَهم قط.
    answer: 2
  - q: "أيّ إشارة توحي بقوة بوجود تسرّب؟"
    options:
      - text: الـ accuracy بالتحقق المتقاطع أعلى من قاعدة خط الأساس ببضع نقاط.
        why: هكذا يبدو النموذج المتواضع الأمين.
      - text: تتفاوت نتائج الطيّات بخمس نقاط.
        why: التفاوت يعكس صغر الطيّات والضجيج، لا التسرّب.
      - text: دقة التدريب أعلى من دقة الاختبار.
        why: هذا طبيعي في معظم النماذج إن لم يكن كلها.
      - text: feature غير مألوف يحمل الـ permutation importance كلها أو يكاد، والنتيجة قريبة من الكمال.
        why: صحيح. المسائل الحقيقية نادرًا ما يكون فيها متنبئ واحد شبه مثالي؛ وحين يظهر أحدها، تحقّق من متى وكيف سُجّل.
    answer: 3
---

لكل عالم بيانات متمرّس قصة عن النموذج الذي كان أجمل من أن يُصدَّق. دقة 99% في الـ notebook، وأداء رمي العملة في بيئة الإنتاج. والسبب يكاد يكون دائمًا واحدًا: أثناء التدريب أو التقييم أُتيحت للنموذج معلومات لن تكون لديه في الواقع. هذا هو **تسرّب البيانات (data leakage)**، وهو خطير لأنه لا يبدو كخطأ برمجي. بل يبدو كنجاح.

## تسرّب الهدف: features من المستقبل

جدول الانقطاع في Cartwheel **لقطة زمنية (snapshot)**: كل feature يصف العميل كما كان في 30 سبتمبر 2025، و`churned` يسجّل ما حدث في الـ 90 يومًا التالية. هذا الخط الزمني هو العقد الذي يعيش النموذج وفقه. ففي وقت التنبؤ، لا تعرف إلا ما حدث قبل اللقطة.

:::figure يجب أن تأتي الـ features مما قبل تاريخ التنبؤ
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">خط زمني. تاريخ العميل حتى لقطة 30 سبتمبر هو المكان الذي يجوز أن تأتي منه الـ features. والأيام التسعون بعد اللقطة هي نافذة النتيجة التي تحدّد churned. والـ feature المحسوب من أحداث داخل نافذة النتيجة، مثل حداثة آخر طلب مقيسة في نهاية العام، تسرّب.</title>
  <line class="d-line" x1="30" y1="110" x2="650" y2="110"/>
  <rect class="d-box-success" x="30" y="70" width="360" height="40" rx="6"/>
  <text class="d-label" x="210" y="95" text-anchor="middle">التاريخ: من هنا تأتي الـ features</text>
  <rect class="d-box-warn" x="390" y="70" width="260" height="40" rx="6"/>
  <text class="d-label" x="520" y="95" text-anchor="middle">نافذة النتيجة (90 يومًا)</text>
  <line class="d-line" x1="390" y1="50" x2="390" y2="140"/>
  <text class="d-label-strong" x="390" y="40" text-anchor="middle">30 سبتمبر: التنبؤ</text>
  <text class="d-label-muted" x="650" y="160" text-anchor="end">29 ديسمبر: الانقطاع معروف</text>
  <path class="d-arrow" d="M560 180 L470 125" marker-end="url(#arrow)"/>
  <text class="d-label" x="560" y="200" text-anchor="middle">"الحداثة في نهاية العام" تسرّب</text>
</svg>
:::

تخيّل الآن أن محلّلًا أعاد بناء الجدول في يناير وحسب `days_since_last_order` حتى تاريخ التصدير بدل تاريخ اللقطة. بالنسبة إلى المنقطعين، الذين لم يطلبوا شيئًا في النافذة، تكون القيمة أكبر بـ 92 يومًا. وبالنسبة إلى العملاء الذين بقوا، تكون صغيرة، لأنهم طلبوا مؤخرًا. صار العمود الآن يرمّز الإجابة:

```python run
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
rng = np.random.default_rng(1)
# Recency measured at export time (year end), not at the 30 September snapshot
churn["recency_at_export"] = np.where(churn["churned"] == 1,
                                      churn["days_since_last_order"] + 92,
                                      rng.integers(0, 92, len(churn)))

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
model = make_pipeline(StandardScaler(), LogisticRegression())
for cols in [features, features + ["recency_at_export"]]:
    auc = cross_val_score(model, churn[cols], churn["churned"], cv=cv, scoring="roc_auc").mean()
    print(f"{len(cols)} features: ROC AUC {auc:.3f}")
```

يقفز الـ ROC AUC من 0.81 إلى 0.999. لا شيء في الكود خاطئ؛ والتحقق المتقاطع مُنفَّذ كما ينبغي. التسرّب يكمن في طريقة بناء البيانات، ولهذا عليك أن تبحث عنه في تاريخ البيانات، لا في النموذج.

تسرّبات الهدف تختبئ خلف أسماء بريئة: `account_status` و`last_contact_reason` و`refund_amount` و`total_orders` (المحسوب عند التصدير، بما فيه من طلبات مستقبلية). والاختبار لكل عمود سؤال واحد: **هل كنت سأعرف هذه القيمة، تمامًا كما هي مخزّنة، في اللحظة التي أُجري فيها التنبؤ؟**

## المعالجة المسبقة قبل التقسيم

النوع الثاني من التسرّب يحدث في الكود. فأي خطوة تتعلّم من البيانات (توحيد المقاييس، والملء، والترميز، واختيار الـ features) يجب أن تتعلّم من صفوف التدريب وحدها. نفّذها على البيانات كلها أولًا وستكون صفوف التحقق قد شكّلت النموذج.

مع توحيد المقاييس، يكون الضرر صغيرًا عادةً. أما مع اختيار الـ features فقد يكون هائلًا. إليك مجموعة بيانات من الضجيج الصرف: 200 صف، و2,000 عمود عشوائي، وlabels عشوائية. لا ينبغي لأي نموذج أن يتجاوز 50%.

```python run
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = rng.normal(size=(200, 2000))
y = rng.integers(0, 2, size=200)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

X_selected = SelectKBest(f_classif, k=20).fit_transform(X, y)   # selection saw every label
leaky = cross_val_score(LogisticRegression(), X_selected, y, cv=cv).mean()

pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
honest = cross_val_score(pipe, X, y, cv=cv).mean()
print(f"select then CV: {leaky:.3f}   select inside CV: {honest:.3f}")
```

الاختيار على الصفوف المئتين كلها يجد 20 عمودًا صادف أنها تتوافق مع labels كل صف، بما فيها الصفوف التي ستُستخدم لاحقًا للتحقق. ثم يؤكد التحقق المتقاطع نمطًا لا وجود له إلا لأنه اختير باستخدام تلك الصفوف نفسها: دقة 0.75 على ضجيج. وداخل pipeline، لا يرى الاختيار إلا طيّات التدريب، فتعود النتيجة إلى مستوى الصدفة.

:::mistake "لم أفعل سوى توحيد مقاييس البيانات كلها، وهذا غير ضار"
أحيانًا يكاد يكون كذلك. لكن العادة هي ما يهم: شكل الكود نفسه مع imputer أو target encoder أو أداة لاختيار الـ features ينتج تسرّبات تضخّم النتائج بـ 10 أو 20 نقطة. اجعل "كل خطوة متعلَّمة تعيش داخل الـ pipeline" قاعدة بلا استثناءات، ولن يُطرح السؤال أبدًا.
:::

## صفوف يعرف بعضها بعضًا

النوع الثالث يأتي من علاقة الصفوف ببعضها. التقسيمات العشوائية تفترض أن الصفوف مستقلة. وحين لا تكون كذلك، تحتوي بيانات الاختبار على نسخ شبه مطابقة لصفوف التدريب.

- **الكيانات المتكرّرة.** إذا كان في الجدول عدة صفوف لكل عميل أو مريض أو جهاز، فالتقسيم العشوائي يضع العميل نفسه في الجهتين، ويُقيَّم النموذج جزئيًا على أشخاص حفظهم. استخدم `GroupKFold` (أو `GroupShuffleSplit`) مع معرّف العميل كـ `groups`.
- **الزمن.** إذا كنت تتنبأ بالمستقبل، فالتقسيم العشوائي يتيح للنموذج أن يتعلّم من صفوف تأتي بعد الصفوف التي يُختبر عليها. استخدم `TimeSeriesSplit`، أو تاريخًا فاصلًا بسيطًا: درّب على الماضي، وتحقّق على الفترات اللاحقة.
- **التكرارات.** الصفوف المكرّرة حرفيًا الموزّعة بين التدريب والاختبار إجابات مجانية. احذفها قبل التقسيم.

في جدول الانقطاع لدى Cartwheel صف واحد لكل عميل وتاريخ لقطة واحد، فالتقسيم العشوائي الطبقي مناسب. غيّر أيًّا من هذين ولن يعود كذلك.

:::tip قائمة تحقق لصيد التسرّب
كن متشكّكًا حين تقفز النتيجة بعد إضافة عمود واحد، أو حين يتفوّق نموذج على أفضل خبراء الشركة بفارق هائل، أو حين تضع الـ permutation importance شبه كل شيء على feature واحد باسم غامض. عندها تتبّع ذلك العمود إلى الاستعلام الذي أنشأه وقارن طابعه الزمني بتاريخ التنبؤ.
:::

مع إغلاق منافذ التسرّب، يمكنك الوثوق بالتحقق المتقاطع للحكم على الأفكار الجديدة، وأكثر الأفكار الجديدة إنتاجًا عادةً هي features أفضل. يبني الدرس القادم بعضها من المعرفة بمجال العمل ويختبر ما إذا كانت تستحق مكانها.
