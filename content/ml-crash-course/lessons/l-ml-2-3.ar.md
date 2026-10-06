---
summary: أضف polynomial features لتجعل النموذج الخطي ينحني، وراقب نتيجة التدريب ترتفع بينما تنهار نتيجة الاختبار، واستخدم جزء تحقق (validation) لتختار تعقيد النموذج بأمانة.
takeaways:
  - "يضيف `PolynomialFeatures` أعمدة للمربعات وللتفاعلات، فيستطيع النموذج الخطي ملاءمة المنحنيات؛ ويتزايد عدد الأعمدة بسرعة كبيرة مع الدرجة."
  - الـ underfitting (ضعف التوافق) يعني أن النموذج أبسط من أن يلتقط النمط؛ فتكون نتيجتا التدريب والاختبار ضعيفتين معًا.
  - الـ overfitting (الإفراط في التوافق) يعني أن النموذج تعلّم الضجيج في صفوف التدريب؛ فتكون نتيجة التدريب مرتفعة ونتيجة الاختبار أقل بكثير.
  - "اختر التعقيد (الدرجة، أو العمق، أو عدد الـ features) على جزء تحقق مقتطع من بيانات التدريب، ولا تختره أبدًا على بيانات الاختبار."
  - العلاجات المعتادة للـ overfitting هي نموذج أبسط، أو بيانات أكثر، أو features أقل، أو الـ regularization.
further:
  - title: PolynomialFeatures
    url: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.PolynomialFeatures.html
  - title: "Underfitting vs. Overfitting"
    url: https://scikit-learn.org/stable/auto_examples/model_selection/plot_underfitting_overfitting.html
  - title: "Validation curves"
    url: https://scikit-learn.org/stable/modules/learning_curve.html
quiz:
  - q: "يحقق نموذج قيمة R² تبلغ 0.52 على بيانات التدريب و0.49 على بيانات الاختبار. ونسخة أعقد منه تحقق 0.90 و-8.5. أيّ تشخيص يناسب؟"
    options:
      - text: النموذج البسيط يعاني من الـ underfitting، والمعقّد أفضل لأنه تعلّم أكثر.
        why: نتيجة اختبار النموذج المعقّد أدنى من الصفر بكثير، فكل ما تعلّمه لا ينتقل إلى بيانات جديدة. والفجوة الصغيرة بين التدريب والاختبار علامة صحية، لا علامة underfitting.
      - text: النموذج المعقّد يعاني من الـ overfitting؛ فقد حفظ صفوف التدريب ويفشل مع الصفوف الجديدة.
        why: صحيح. القفزة الهائلة في نتيجة التدريب مع انهيار نتيجة الاختبار هي البصمة المميّزة للـ overfitting.
      - text: كلا النموذجين يعاني من الـ underfitting لأن أيًّا منهما لا يبلغ 0.9 على بيانات الاختبار.
        why: كثير من المسائل الحقيقية يبلغ سقفها ما هو أدنى من 0.9 بكثير. ويُحكم على الـ underfitting بأن تكون نتيجة التدريب ضعيفة أيضًا، وهذا لا ينطبق على النموذج المعقّد.
    answer: 1
  - q: "ما الأعمدة التي ينتجها `PolynomialFeatures(degree=2, include_bias=False)` من عمودين `a` و`b`؟"
    options:
      - text: "`a` و`b` و`a^2` و`a b` و`b^2`"
        why: صحيح. الدرجة 2 تضيف كل مربّع وكل حاصل ضرب بين زوج من الأعمدة، أي حدّ التفاعل.
      - text: "`a^2` و`b^2`"
        why: تُحفظ الأعمدة الأصلية، ويُضاف حدّ التفاعل `a b` أيضًا.
      - text: "`1` و`a` و`b` و`a^2` و`b^2`"
        why: "`include_bias=False` يحذف العمود الثابت، وحدّ التفاعل `a b` غائب عن هذه القائمة."
    answer: 0
  - q: "كيف يجب أن تختار درجة كثير الحدود؟"
    options:
      - text: اختر الدرجة صاحبة أعلى نتيجة تدريب.
        why: نتيجة التدريب تواصل الارتفاع مع الدرجة، فهذه الطريقة تختار دائمًا النموذج الأكثر overfitting.
      - text: اختر الدرجة صاحبة أعلى نتيجة اختبار، ثم انشر تلك النتيجة.
        why: هذا يستخدم بيانات الاختبار لاتخاذ قرار، فتكون النتيجة المنشورة متفائلة.
      - text: اقتطع جزء تحقق من بيانات التدريب، واختر الدرجة التي تحقق أفضل نتيجة عليه، ثم قِس مرة واحدة على بيانات الاختبار.
        why: صحيح. جزء التحقق يمتص عملية الاختيار؛ وتبقى بيانات الاختبار فحصًا نهائيًا غير منحاز.
    answer: 2
  - q: "أيّ تغيير هو الأقل احتمالًا أن يقلّل الـ overfitting؟"
    options:
      - text: جمع صفوف تدريب أكثر.
        why: البيانات الأكثر تجعل حفظ الضجيج أصعب، فهي تساعد عادةً.
      - text: إضافة درجات أعلى لكثير الحدود كي يلائم النموذج البيانات بدقة أكبر.
        why: صحيح. المرونة الإضافية هي سبب الـ overfitting أصلًا.
      - text: خفض الدرجة أو حذف الـ features الضعيفة.
        why: النموذج الأبسط قدرته على الحفظ أقل، فهذا علاج مباشر.
      - text: إضافة عقوبة على المعاملات الكبيرة.
        why: هذا هو الـ regularization، موضوع الدرس القادم، وهو علاج معياري.
    answer: 1
---

الخط المستقيم افتراض قوي. فإذا كان تقدّم المرض يرتفع أسرع عند مؤشر كتلة جسم مرتفع منه عند مؤشر منخفض، فلا خط مستقيم يستطيع التقاط ذلك، مهما طال تشغيل الـ gradient descent. والحل يبدو بريئًا: دع النموذج ينحني. يبيّن هذا الدرس كيف، وكيف يتحوّل الانحناء سريعًا إلى حفظ.

## جعل النموذج الخطي ينحني

الحيلة أن تُبقي الانحدار الخطي وتغيّر المدخلات. فإذا أضفت عمودًا `bmi²`، فإن نموذجًا "خطيًا" في `bmi` و`bmi²` يرسم قطعًا مكافئًا في `bmi`. ويولّد `PolynomialFeatures` هذه الأعمدة: كل قوة حتى الدرجة المختارة، إضافة إلى كل حاصل ضرب بين الـ features (أي **التفاعلات (interactions)**).

```python run
from sklearn.datasets import load_diabetes
from sklearn.preprocessing import PolynomialFeatures

X, y = load_diabetes(return_X_y=True, as_frame=True)
poly = PolynomialFeatures(degree=2, include_bias=False).fit(X[["bmi", "bp"]])
print(poly.get_feature_names_out())

for degree in [1, 2, 3]:
    n = PolynomialFeatures(degree=degree, include_bias=False).fit(X).n_output_features_
    print(f"degree {degree}: {n} columns from 10 features")
```

يتحوّل الـ features الاثنان إلى خمسة أعمدة عند الدرجة 2. وتتحوّل الـ features العشرة إلى 65 عمودًا عند الدرجة 2 و285 عند الدرجة 3. يحذف `include_bias=False` العمود الثابت، لأن `LinearRegression` يحسب الـ intercept بنفسه.

لتسلسل التوسيع والانحدار، استخدم `make_pipeline`. فهي تنشئ estimator واحدًا ينفّذ كل خطوة بالترتيب؛ يدرّب `fit` كل خطوة على بيانات التدريب، ويمرّر `predict` البيانات الجديدة عبر الخطوات نفسها. ستبني pipelines أغنى في القسم 4.

## نتيجة التدريب تواصل الصعود

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

for degree in [1, 2, 3]:
    model = make_pipeline(PolynomialFeatures(degree=degree, include_bias=False),
                          LinearRegression()).fit(X_train, y_train)
    print(f"degree {degree}: train R2 {model.score(X_train, y_train):6.3f}  "
          f"test R2 {model.score(X_test, y_test):7.3f}  "
          f"test MAE {mean_absolute_error(y_test, model.predict(X_test)):6.1f}")
```

اقرأ الصفوف الثلاثة على مهل. الدرجة 2 تحسّن نتيجة التدريب وتسوّئ نتيجة الاختبار. والدرجة 3 كارثة متنكّرة في ثوب نجاح: R² بقيمة 0.90 في التدريب، وR² بقيمة -8.5 في الاختبار، وخطأ اختبار معتاد مقداره 151 نقطة، وهذا أسوأ من التنبؤ بالمتوسط للجميع. مع 285 عمودًا و331 مريض تدريب فقط، يكاد يملك النموذج من المقابض ما يكفي ليمرّ عبر كل نقطة تدريب. لقد تعلّم الضجيج.

## الـ Underfitting والـ Overfitting

هذه الصفوف الثلاثة تقابل صورة ستراها في كل دورة لتعلّم الآلة، لأنها المفاضلة المركزية في هذا المجال.

:::figure الـ underfitting، والتوافق الجيد، والـ overfitting
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">ثلاث لوحات لنقاط منحنية التوزيع نفسها. اليسرى: خط مستقيم يفوّت المنحنى (underfit). الوسطى: منحنى لطيف يتبع الاتجاه (توافق جيد). اليمنى: خط متعرّج يمرّ بكل نقطة (overfit).</title>
  <rect class="d-box" x="10" y="10" width="220" height="170" rx="10"/>
  <rect class="d-box-success" x="240" y="10" width="220" height="170" rx="10"/>
  <rect class="d-box" x="470" y="10" width="220" height="170" rx="10"/>
  <circle class="d-dot" cx="40" cy="150" r="4"/><circle class="d-dot" cx="70" cy="118" r="4"/><circle class="d-dot" cx="100" cy="112" r="4"/><circle class="d-dot" cx="130" cy="88" r="4"/><circle class="d-dot" cx="160" cy="86" r="4"/><circle class="d-dot" cx="190" cy="60" r="4"/>
  <path class="d-arrow" d="M30 140 L210 70"/>
  <circle class="d-dot" cx="270" cy="150" r="4"/><circle class="d-dot" cx="300" cy="118" r="4"/><circle class="d-dot" cx="330" cy="112" r="4"/><circle class="d-dot" cx="360" cy="88" r="4"/><circle class="d-dot" cx="390" cy="86" r="4"/><circle class="d-dot" cx="420" cy="60" r="4"/>
  <path class="d-arrow" d="M260 160 Q330 90 440 50" fill="none"/>
  <circle class="d-dot" cx="500" cy="150" r="4"/><circle class="d-dot" cx="530" cy="118" r="4"/><circle class="d-dot" cx="560" cy="112" r="4"/><circle class="d-dot" cx="590" cy="88" r="4"/><circle class="d-dot" cx="620" cy="86" r="4"/><circle class="d-dot" cx="650" cy="60" r="4"/>
  <path class="d-arrow" d="M490 165 C495 140 500 150 500 150 C515 100 525 125 530 118 C545 95 550 125 560 112 C575 60 580 95 590 88 C605 110 610 80 620 86 C635 95 640 40 650 60 C660 75 665 40 670 30" fill="none"/>
  <text class="d-label-strong" x="120" y="205" text-anchor="middle">Underfit</text>
  <text class="d-label-strong" x="350" y="205" text-anchor="middle">توافق جيد</text>
  <text class="d-label-strong" x="580" y="205" text-anchor="middle">Overfit</text>
</svg>
:::

- **الـ Underfitting** (انحياز مرتفع، high bias): النموذج أبسط من النمط. نتيجتا التدريب والاختبار ضعيفتان ومتقاربتان. والمزيد من المرونة يساعد.
- **الـ Overfitting** (تباين مرتفع، high variance): النموذج مرن بما يكفي ليطارد الضجيج. نتيجة التدريب مرتفعة، ونتيجة الاختبار أقل بكثير. وما يساعد هنا مرونة أقل، أو بيانات أكثر، أو الـ regularization.

تشخّص الجهة التي أنت فيها بمقارنة النتيجتين، لا بالنظر إلى نتيجة التدريب وحدها أبدًا. الفجوة الصغيرة مع نتائج ضعيفة تقول "أضف قدرة"؛ والفجوة الكبيرة تقول "انزعها".

كمية البيانات تغيّر هذا التوازن. فمع 331 مريضًا، 285 عمودًا تهوّر؛ أما مع 300,000 مريض، فسيكون لنموذج الدرجة 3 نفسه مجال أضيق بكثير للحفظ، لأن ضجيج الصفوف الفردية يتلاشى بالتوسيط عبر هذا العدد الكبير من الأمثلة. لهذا تُعدّ "اجمع بيانات أكثر" علاجًا مشروعًا للـ overfitting وعديم الفائدة للـ underfitting: فالنموذج العاجز عن التعبير عن النمط لن يتحسّن فيه برؤية المزيد منه. وحين لا تكون متأكدًا من الجهة التي أنت فيها، يحسم الأمرَ منحنى التعلّم (learning curve)، أي نتيجتا التدريب والتحقق مرسومتين مقابل عدد صفوف التدريب: منحنيان يلتقيان عند مستوى منخفض يحتاجان إلى نموذج أغنى، ومنحنيان يبقيان متباعدين يحتاجان إلى بيانات أكثر أو نموذج أبسط.

:::mistake اختيار التعقيد ببيانات الاختبار
من المغري أن تمرّ في حلقة على الدرجات من 1 إلى 6 وتحتفظ بأيّها حقق أفضل نتيجة على بيانات الاختبار. هذا يحوّل بيانات الاختبار إلى أداة ضبط، ولا تعود النتيجة التي تنشرها تقديرًا صادقًا. اقتطع **جزء تحقق (validation)** من بيانات التدريب، واختر الدرجة عليه، ثم أعد التدريب على بيانات التدريب كلها والمس بيانات الاختبار مرة واحدة.
:::

## اختيار الدرجة بأمانة

إليك هذه الوصفة مع ثلاثة features. جزء التحقق يأتي من `X_train`؛ ولا تُمسّ بيانات الاختبار حتى السطر الأخير تمامًا.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

X, y = load_diabetes(return_X_y=True, as_frame=True)
X = X[["bmi", "bp", "s5"]]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
X_fit, X_val, y_fit, y_val = train_test_split(X_train, y_train, test_size=0.25, random_state=0)

def poly_model(degree):
    return make_pipeline(PolynomialFeatures(degree=degree, include_bias=False), LinearRegression())

val_scores = {d: poly_model(d).fit(X_fit, y_fit).score(X_val, y_val) for d in range(1, 7)}
for d, s in val_scores.items():
    print(f"degree {d}: validation R2 {s:6.3f}")
best = max(val_scores, key=val_scores.get)
final = poly_model(best).fit(X_train, y_train)
print("chosen degree", best, "| test R2", round(final.score(X_test, y_test), 3))
```

يختار التحقق الدرجة 1، أي الخط المستقيم. على هذه البيانات لا يستحق المنحنى التباينَ الإضافي الذي يجلبه. وهذه نتيجة شائعة ومفيدة: فالإجراء الأمين كثيرًا ما يفضّل النموذج البسيط الذي كانت نظرة خاطفة إلى بيانات الاختبار ستُقنعك بالعدول عنه.

جزء تحقق واحد من نحو 80 مريضًا مليء بالضجيج هو أيضًا؛ فقد تفضّل قيمة مختلفة لـ `random_state` الدرجة 2. سيستبدله القسم 4 بالتحقق المتقاطع، الذي يأخذ المتوسط عبر عدة تقسيمات. والمبدأ يبقى كما هو.

خفض الدرجة طريقة فظّة للتحكم في التعقيد: إما أن يكون لديك عمود `bmi × bp` وإما لا. الدرس القادم يحتفظ بكل الأعمدة، ويعاقب النموذج بدلًا من ذلك على الاعتماد عليها بشدة، وهذا مقبض أدقّ.
