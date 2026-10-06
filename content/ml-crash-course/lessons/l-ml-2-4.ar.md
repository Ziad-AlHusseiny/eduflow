---
summary: تحكّم في الـ overfitting بمعاقبة المعاملات الكبيرة باستخدام Ridge وLasso، ووحّد مقاييس الـ features لتكون العقوبة عادلة، واستخدم أصفار Lasso اختيارًا تلقائيًا للـ features.
takeaways:
  - يضيف الـ regularization إلى دالة الخسارة عقوبةً على حجم المعاملات، فيتنازل النموذج عن قليل من التوافق مع التدريب مقابل معاملات أبسط وأكثر استقرارًا.
  - "يعاقب Ridge مربعات المعاملات فيقلّصها جميعًا؛ ويعاقب Lasso قيمها المطلقة فيجعل بعضها صفرًا بالضبط."
  - "`alpha` هو قوة العقوبة: 0 يعني المربعات الصغرى العادية، والقيم الكبيرة جدًا تسطّح النموذج حتى الـ underfitting."
  - "وحّد مقاييس الـ features قبل النموذج المعاقَب، وإلا عاقبت العقوبةُ الـ features على وحداتها لا على فائدتها."
  - "اختر `alpha` على بيانات تحقق أو بالتحقق المتقاطع، بالطريقة نفسها التي تختار بها أي hyperparameter."
further:
  - title: "Ridge regression and classification"
    url: https://scikit-learn.org/stable/modules/linear_model.html#ridge-regression-and-classification
  - title: Lasso
    url: https://scikit-learn.org/stable/modules/linear_model.html#lasso
  - title: Ridge
    url: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Ridge.html
quiz:
  - q: "رفعت قيمة `alpha` في Ridge من 1 إلى 100,000. ماذا يحدث للنموذج؟"
    options:
      - text: تتقلّص المعاملات نحو الصفر وتقترب التنبؤات من متوسط الهدف؛ فيقع النموذج في الـ underfitting.
        why: صحيح. العقوبة الهائلة تجعل أي معامل غير صفري باهظ الكلفة، فيرتدّ النموذج إلى ما يقارب الـ intercept وحده.
      - text: تكبر المعاملات ليلائم النموذج بيانات التدريب بدقة أكبر.
        why: قيمة `alpha` الأكبر تجعل المعاملات الكبيرة أغلى، لا أرخص.
      - text: تصبح معظم المعاملات صفرًا بالضبط، ولا يبقى إلا قليل من الـ features.
        why: هذا سلوك Lasso. أما Ridge فيقلّص المعاملات بسلاسة، لكنه لا يكاد يوصلها إلى الصفر بالضبط أبدًا.
    answer: 0
  - q: "لماذا نضع `StandardScaler` قبل `Lasso` في الـ pipeline؟"
    options:
      - text: لأن Lasso لا يتعامل مع الأرقام السالبة دون توحيد المقاييس.
        why: يعمل Lasso على أي أعداد حقيقية. المشكلة في عدالة العقوبة.
      - text: لأن العقوبة تعامل كل المعاملات بالطريقة نفسها، فيجب أن تشترك الـ features في مقياس واحد كي تحكم عليها بفائدتها لا بوحداتها.
        why: صحيح. الـ feature المقيس بوحدات كبيرة يحتاج إلى معامل ضئيل فيفلت من العقوبة؛ والمقيس بوحدات صغيرة يُعاقَب.
      - text: لأن توحيد المقاييس يجعل Lasso يتقارب إلى الإجابة نفسها التي تعطيها المربعات الصغرى العادية.
        why: توحيد المقاييس لا يزيل العقوبة؛ فمع `alpha > 0` يبقى Lasso مختلفًا عن المربعات الصغرى.
    answer: 1
  - q: "تحتاج إلى نموذج انقطاع يستخدم أقل عدد ممكن من 60 feature مرشّحًا. ما الخيار الأول الطبيعي؟"
    options:
      - text: Ridge، لأنه يقلّص المعاملات الستين كلها.
        why: يحتفظ Ridge بكل feature بوزن صغير، فستظل بحاجة إلى المدخلات الستين كلها وقت التنبؤ.
      - text: الانحدار الخطي العادي، ثم حذف الـ features ذات أصغر المعاملات.
        why: المعاملات غير المعاقَبة للـ features المترابطة غير مستقرة، فـ "الأصغر" معيار غير موثوق.
      - text: عقوبة L1 (على طريقة Lasso)، لأنها تدفع المعاملات عديمة الفائدة إلى الصفر بالضبط.
        why: صحيح. هذه الأصفار اختيار مدمج للـ features؛ ويمكنك بعدها فحص الـ features التي نجت.
    answer: 2
---

في الدرس السابق، أعطت الـ polynomial features من الدرجة 2 نموذجَ السكري 65 عمودًا، فانخفضت نتيجة الاختبار من 0.49 إلى 0.42. كان بإمكانك التخلّص من الأعمدة الإضافية. لكن الـ regularization (التنظيم) يقدّم ما هو أفضل: احتفظ بها كلها، لكن اجعل النموذج يدفع ثمن كل وحدة من المعاملات يستخدمها. الأعمدة التي تستحق مكانها تنال وزنًا؛ والبقية تتقلّص.

## عقوبة تُضاف إلى دالة الخسارة

تصغّر المربعات الصغرى العادية الخطأ المربّع ولا شيء غيره. أما الانحدار المنظَّم فيصغّر الخطأ المربّع **مضافًا إليه** عقوبةٌ تكبر مع حجم المعاملات:

- **Ridge** يضيف `alpha * sum(coef ** 2)`، وهي عقوبة L2.
- **Lasso** يضيف `alpha * sum(abs(coef))`، وهي عقوبة L1 (كما أن scikit-learn يعاير حدّ الخطأ بطريقة مختلفة قليلًا، ولهذا تختلف قيم `alpha` الجيدة بين النموذجين).

يحدّد `alpha` سعر الصرف. عند 0 تعود إلى المربعات الصغرى. ومع ازدياده، يجب على المعامل الكبير أن يشتري خفضًا كبيرًا في الخطأ كي يستحق وجوده. والمعاملات التي لا تلائم إلا الضجيج لا تستطيع ذلك، فتتقلّص. القيم المربّعة تجعل Ridge يقلّص كل شيء بسلاسة؛ والقيم المطلقة تجعل Lasso يدفع المعاملات الضعيفة حتى الصفر.

## وحّد المقاييس أولًا، ثم عاقِب

تجمع العقوبة المعاملات كما لو كانت قابلة للمقارنة. وهي ليست كذلك إلا إذا اشتركت الـ features في مقياس واحد. قِس الإنفاق بالسنتات بدل الدولارات وسيصغر معامله مئة مرة، فلا تكاد العقوبة تلحظه. ضع دائمًا `StandardScaler` قبل أي نموذج معاقَب.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

def degree2(model):
    return make_pipeline(PolynomialFeatures(degree=2, include_bias=False), StandardScaler(), model)

print("no penalty:", round(degree2(LinearRegression()).fit(X_train, y_train).score(X_test, y_test), 3))
for alpha in [1, 10, 100, 1000]:
    m = degree2(Ridge(alpha=alpha)).fit(X_train, y_train)
    print(f"Ridge alpha={alpha:<5} train {m.score(X_train, y_train):.3f}  test {m.score(X_test, y_test):.3f}")
```

مع ارتفاع `alpha` تنخفض نتيجة التدريب باطّراد (إذ يُمنح النموذج حرية أقل)، بينما تصعد نتيجة الاختبار من 0.42 إلى 0.50 عند `alpha=100`، وهذا أفضل من النموذج العادي ذي الـ features العشرة. ادفعها إلى 1,000 فتنخفض النتيجتان معًا: صار النموذج الآن في الـ underfitting. يحوّل الـ regularization المفاضلةَ بين الـ overfitting والـ underfitting إلى مقبض تديره.

## Lasso يختار الـ features نيابةً عنك

أجرِ التجربة نفسها مع Lasso وعُدّ المعاملات التي تنتهي إلى الصفر بالضبط.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import Lasso
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

for alpha in [0.1, 1, 2, 5]:
    m = make_pipeline(PolynomialFeatures(degree=2, include_bias=False), StandardScaler(),
                      Lasso(alpha=alpha)).fit(X_train, y_train)
    zeros = (m[-1].coef_ == 0).sum()
    print(f"Lasso alpha={alpha:<4} test R2 {m.score(X_test, y_test):.3f}  zero coefficients: {zeros} of 65")

names = m[0].get_feature_names_out()
kept = [n for n, c in zip(names, m[-1].coef_) if c != 0]
print("kept at alpha=5:", kept)
```

عند `alpha=2` يبلغ Lasso قيمة R² على الاختبار تساوي 0.53، وهي أفضل نتيجة انحدار في هذا القسم، مع تجاهله 39 عمودًا من أصل 65. وعند `alpha=5` يحتفظ بـ 11 عمودًا: مؤشر كتلة الجسم وضغط الدم و`s5` من النماذج السابقة، إضافة إلى بضعة تفاعلات مثل `bmi bp`. يصل `m[-1]` إلى آخر خطوة في الـ pipeline، ويُعطي `m[0].get_feature_names_out()` أسماء الأعمدة المولّدة.

## ترويض المعاملات المترابطة

أتذكر `s1` عند -918 و`s2` عند +508 في الانحدار العادي، قياسَي دم مترابطَين يشدّ أحدهما عكس الآخر؟ مع الـ features الموحّدة المقاييس تظهر القصة نفسها على نطاق أصغر، والعقوبة تحسمها.

:::figure ما الذي يحدث لمعاملين مترابطين
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">معاملا s1 وs2 على features موحّدة المقاييس. المربعات الصغرى: s1 سالب 44، وs2 موجب 25. Ridge مع alpha تساوي 10: s1 سالب 13، وs2 قرب الصفر. Lasso مع alpha تساوي 1: s1 سالب 8، وs2 صفر بالضبط.</title>
  <line class="d-line" x1="330" y1="20" x2="330" y2="200"/>
  <text class="d-label-muted" x="330" y="220" text-anchor="middle">0</text>
  <text class="d-label" x="20" y="48">المربعات الصغرى</text>
  <rect class="d-box-warn" x="198" y="30" width="132" height="22" rx="3"/><text class="d-code" x="190" y="46" text-anchor="end">s1 −44</text>
  <rect class="d-box-accent" x="330" y="56" width="74" height="22" rx="3"/><text class="d-code" x="412" y="72">s2 +25</text>
  <text class="d-label" x="20" y="113">Ridge, alpha=10</text>
  <rect class="d-box-warn" x="291" y="95" width="39" height="22" rx="3"/><text class="d-code" x="283" y="111" text-anchor="end">s1 −13</text>
  <rect class="d-box-accent" x="330" y="121" width="2" height="22" rx="1"/><text class="d-code" x="340" y="137">s2 +0.5</text>
  <text class="d-label" x="20" y="178">Lasso, alpha=1</text>
  <rect class="d-box-warn" x="305" y="160" width="25" height="22" rx="3"/><text class="d-code" x="297" y="176" text-anchor="end">s1 −8</text>
  <text class="d-code" x="340" y="198">s2 0 (محذوف)</text>
</svg>
:::

يوزّع Ridge الوزن بين الـ features المترابطة بشكل معقول بدل أن يتركها يلغي بعضها بعضًا؛ بينما يميل Lasso إلى الاحتفاظ بأحدها وحذف الآخر. وفي الحالتين تصبح المعاملات مستقرة بما يكفي كي لا ينقلب اتجاهها مع تغيير صغير في بيانات التدريب.

:::mistake ضبط alpha على بيانات الاختبار
`alpha` hyperparameter مثل درجة كثير الحدود. فالمرور على قيمها ونشر أفضل نتيجة اختبار، كما تفعل الأمثلة أعلاه لتبيّن شكل المنحنى، يعطي رقمًا متفائلًا. في المشروع الحقيقي تختار `alpha` على بيانات تحقق. يفعل `RidgeCV` و`LassoCV` ذلك بتحقق متقاطع مدمج، ويفعله `GridSearchCV` في القسم 4 مع أي نموذج.
:::

## Ridge أم Lasso؟

كلاهما يعالج الداء نفسه، فالاختيار يرجع إلى ما تريده من النموذج النهائي. يفوز Ridge عادةً حين تحمل features كثيرة شيئًا قليلًا من الإشارة لكلٍّ منها، وهذا شائع مع القياسات المتداخلة، مثل قراءات الدم الست هنا. ويفوز Lasso حين تهمّ features قليلة والبقية ضجيج، ويسلّمك قائمة مشتريات أقصر من المدخلات، وهذا مهم حين يجب جمع كل feature وتنظيفه ومراقبته في بيئة الإنتاج. وحين تأتي الـ features في مجموعات مترابطة، قد تكون عادة Lasso في الاحتفاظ بعضو واحد، باعتباطية إلى حدّ ما، غير مستقرة من تدريب إلى آخر. ويمزج `ElasticNet` العقوبتين لهذه الحالة بالضبط. وعلى مجموعة بيانات بهذا الحجم، الإجابة الأمينة هي أن تجرّب الاثنين على بيانات تحقق وتحتفظ بالفائز، ثم تفضّل الأبسط حين يتعادلان.

:::tip خيار افتراضي معقول
لنموذج خطي على أكثر من حفنة من الـ features، ابدأ بـ `Ridge` داخل pipeline مع `StandardScaler`، وعامِل `LinearRegression` العادي على أنه الاستثناء. والجأ إلى `Lasso` حين تريد features أقل في النموذج النهائي.
:::

بهذا يُختتم الانحدار. وفكرة العقوبة نفسها تعود مباشرة في القسم القادم: `LogisticRegression` منظَّم افتراضيًا، بمعامل `C` يعمل كمقلوب `alpha`. يعيد القسم 3 الهدفَ إلى انقطاع العملاء، نعم أو لا.
