---
summary: درّب نموذج انحدار خطي باستخدام scikit-learn، واقرأ الـ intercept والمعاملات، واحكم عليه بمقاييس MAE وRMSE وR² مقارنةً بخط أساس يتنبأ بالمتوسط.
takeaways:
  - "يتنبأ الانحدار الخطي بـ `intercept + coef1 * x1 + coef2 * x2 + …` ويختار الأرقام التي تجعل مجموع مربعات البواقي أصغر ما يمكن."
  - "الباقي (residual) هو القيمة الفعلية ناقص القيمة المتنبأ بها؛ وكل مقياس انحدار هو تلخيص مختلف للبواقي."
  - "MAE هو الخطأ المعتاد بوحدات الهدف نفسها؛ وRMSE بالوحدات نفسها لكنه يعاقب الأخطاء الكبيرة أكثر."
  - "R² هو نسبة التباين المفسَّرة مقارنةً بالتنبؤ الدائم بالمتوسط: 0 يعني أنه ليس أفضل من المتوسط، ويمكن أن يصبح سالبًا."
  - معاملات الـ features المترابطة قد تكون كبيرة ومتعاكسة الإشارة، فلا تقرأها على أنها أهمية أو سببية.
further:
  - title: "Linear Models: Ordinary Least Squares"
    url: https://scikit-learn.org/stable/modules/linear_model.html#ordinary-least-squares
  - title: "Regression metrics"
    url: https://scikit-learn.org/stable/modules/model_evaluation.html#regression-metrics
  - title: Diabetes dataset
    url: https://scikit-learn.org/stable/datasets/toy_dataset.html#diabetes-dataset
quiz:
  - q: "نموذج يتنبأ بإنفاق العام القادم قيمة MAE فيه 40 دولارًا وRMSE فيه 150 دولارًا. ماذا توحي هذه الفجوة؟"
    options:
      - text: النموذج منحاز ويتنبأ بقيم أعلى من اللازم في المتوسط.
        why: لا يُظهر أيّ من المقياسين الاتجاه؛ فكلاهما يستخدم الأخطاء المطلقة أو المربّعة. لكشف الانحياز تنظر إلى متوسط البواقي.
      - text: معظم الأخطاء صغيرة، لكن قليلًا منها كبير جدًا.
        why: صحيح. التربيع يجعل الأخطاء الكبيرة النادرة تهيمن على RMSE، بينما يزن MAE كل خطأ بالتساوي.
      - text: حُسب RMSE على بيانات التدريب وMAE على بيانات الاختبار.
        why: لا شيء في الأرقام يقول ذلك. RMSE دائمًا لا يقل عن MAE على البيانات نفسها؛ والفجوة الكبيرة تتعلّق بشكل توزيع الأخطاء.
    answer: 1
  - q: "يحقق نموذج قيمة R² = -0.2 على بيانات الاختبار. ماذا يعني ذلك؟"
    options:
      - text: أنه يفسّر 20% من التباين، في الاتجاه السالب.
        why: لا اتجاه لـ R². القيمة السالبة مقارنة مع متنبئ المتوسط، لا نسبة ذات إشارة.
      - text: أن الحساب معطوب، لأن R² مربّع ولا يمكن أن يكون سالبًا.
        why: الاسم تاريخي. على بيانات الاختبار، R² يساوي 1 ناقص نسبة بين خطأين، وهذه النسبة قد تتجاوز 1.
      - text: أن تنبؤاته أسوأ من التنبؤ بالمتوسط للجميع.
        why: صحيح. يقارن R² الخطأ المربّع للنموذج بخطأ التنبؤ الدائم بمتوسط القيم الفعلية؛ وما دون 0 يعني أن النموذج يخسر.
    answer: 2
  - q: "في نموذج السكري، معامل `s1` هو -918 ومعامل `s2` هو +508. وكلاهما قياس دم متعلّق بالكوليسترول. ما القراءة الأكثر أمانًا؟"
    options:
      - text: "`s1` يخفض تقدّم المرض بقوة، فرفعه سيساعد المرضى."
        why: المعاملات تصف النموذج المدرَّب، لا السبب والنتيجة، والمدخلات المترابطة تجعلها غير مستقرة.
      - text: "`s1` هو أهم feature لأن معامله الأكبر."
        why: الحجم وحده مضلِّل حين تكون الـ features مترابطة؛ فالحدّان يلغي أحدهما الآخر إلى حدّ كبير.
      - text: هذان الـ features مترابطان، فوازن النموذج بين وزنين كبيرين متعاكسين؛ وقيمة كلٍّ منهما على حدة غير موثوقة.
        why: صحيح. مع الـ features المترابطة، تتلاءم تركيبات كثيرة من المعاملات بجودة متقاربة جدًا. والـ regularization في آخر درس من هذا القسم يروّض ذلك.
    answer: 2
---

انقطاع العملاء سؤال إجابته نعم أو لا، وستعود إليه في القسم 3. الانحدار يأتي أولًا لأن أبسط نماذجه، الخط المستقيم، يتيح لك أن ترى بالضبط ما يعنيه "التعلّم": اختيار أرقام تجعل التنبؤات تخطئ بأقل قدر ممكن.

البيانات هي مجموعة بيانات السكري في scikit-learn: 442 مريضًا، لكلٍّ منهم عشرة قياسات أولية (العمر والجنس ومؤشر كتلة الجسم وضغط الدم وست قراءات لمصل الدم `s1`–`s6`)، وهدف يقيس مدى تقدّم المرض بعد عام. الـ features ممركزة ومُعايَرة مسبقًا، ولهذا تبدو ككسور عشرية صغيرة.

## feature واحد، وخط واحد

ابدأ بمؤشر كتلة الجسم وحده. يتنبأ الانحدار الخطي بـ `progression = intercept + coef * bmi`، ويختار `fit` الرقمين.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

line = LinearRegression().fit(X_train[["bmi"]], y_train)
print("intercept:", round(line.intercept_, 1))
print("coef for bmi:", round(line.coef_[0], 1))
print("first predictions:", line.predict(X_test[["bmi"]])[:3].round(1))
```

الـ intercept (الجزء المقطوع، 152) هو التنبؤ عند مؤشر كتلة جسم متوسط، لأن الـ feature ممركز عند 0. والمعامل (975) هو الميل: وحدة واحدة من مؤشر كتلة الجسم المُعايَر هذا تضيف 975 إلى التنبؤ. لاحظ الأقواس المزدوجة في `X_train[["bmi"]]`: يريد scikit-learn جدولًا ثنائي الأبعاد حتى مع feature واحد.

## البواقي ودالة الخسارة

كيف اختار `fit` هذين الرقمين؟ لكل مريض، **الباقي (residual)** هو القيمة الفعلية ناقص القيمة المتنبأ بها: أي الفجوة العمودية بين النقطة والخط. وتختار طريقة المربعات الصغرى العادية (ordinary least squares) الـ intercept والميل اللذين يجعلان مجموع مربعات البواقي أصغر ما يمكن. هذا المجموع، أي الشيء الذي نسعى إلى تصغيره، هو **دالة الخسارة (loss)**.

:::figure البواقي هي الفجوات العمودية بين النقاط والخط
<svg viewBox="0 0 640 280" role="img" aria-labelledby="t1">
  <title id="t1">نقاط مبعثرة حول خط صاعد. قطع عمودية متقطعة تصل كل نقطة بالخط؛ تُربَّع هذه البواقي وتُجمع، وتختار المربعات الصغرى الخطَّ الذي يجعل هذا المجموع أصغر ما يمكن.</title>
  <line class="d-line" x1="60" y1="240" x2="600" y2="240"/>
  <line class="d-line" x1="60" y1="240" x2="60" y2="20"/>
  <text class="d-label-muted" x="560" y="262">bmi</text>
  <text class="d-label-muted" x="68" y="34">تقدّم المرض</text>
  <path class="d-arrow" d="M80 215 L580 55"/>
  <line class="d-dashed d-line" x1="130" y1="199" x2="130" y2="168"/>
  <circle class="d-dot" cx="130" cy="168" r="6"/>
  <line class="d-dashed d-line" x1="200" y1="177" x2="200" y2="214"/>
  <circle class="d-dot" cx="200" cy="214" r="6"/>
  <line class="d-dashed d-line" x1="270" y1="154" x2="270" y2="120"/>
  <circle class="d-dot" cx="270" cy="120" r="6"/>
  <line class="d-dashed d-line" x1="340" y1="132" x2="340" y2="160"/>
  <circle class="d-dot" cx="340" cy="160" r="6"/>
  <line class="d-dashed d-line" x1="420" y1="106" x2="420" y2="62"/>
  <circle class="d-dot" cx="420" cy="62" r="6"/>
  <line class="d-dashed d-line" x1="500" y1="81" x2="500" y2="120"/>
  <circle class="d-dot" cx="500" cy="120" r="6"/>
  <text class="d-label" x="430" y="90">باقٍ</text>
</svg>
:::

التربيع يؤدي مهمتين: يجعل كل خطأ يُحسب موجبًا، ويجعل الأخطاء الكبيرة تُحسب أكثر بكثير من الصغيرة. خطأ مقداره 20 يكلّف 400؛ وخطأ مقداره 40 يكلّف 1,600. تذكّر هذا، لأنه يفسّر الفرق بين مقياسين من المقاييس أدناه.

## الـ features العشرة كلها

الانحدار المتعدد هو الفكرة نفسها مع حدود أكثر: معامل لكل feature، إضافة إلى الـ intercept.

```python run
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

model = LinearRegression().fit(X_train, y_train)
for name, coef in zip(X.columns, model.coef_):
    print(f"{name:>4} {coef:8.1f}")
```

:::mistake قراءة المعاملات على أنها أهمية أو سببية
يحصل `s1` على -918 و`s2` على +508. كلاهما يقيس كميات مترابطة من الكوليسترول، فيرتفعان وينخفضان معًا، ويستطيع النموذج نقل الوزن بينهما بحرية شبه تامة. المعاملات الضخمة المتعاكسة على features مترابطة علامة على ذلك، لا دليل على أن `s1` يحمي المرضى. المعاملات تصف هذا النموذج المدرَّب؛ ولا تقول شيئًا عما سيحدث لو غيّرت كيمياء دم المريض.
:::

## قياس نموذج الانحدار

تعطيك `score` قيمة R²، لكن عليك أن تعرف ثلاثة مقاييس ومتى يناسب كلٌّ منها.

```python run
from sklearn.datasets import load_diabetes
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

models = {
    "mean (dummy)": (DummyRegressor(), X.columns),
    "bmi only": (LinearRegression(), ["bmi"]),
    "all features": (LinearRegression(), X.columns),
}
for name, (model, cols) in models.items():
    pred = model.fit(X_train[cols], y_train).predict(X_test[cols])
    print(f"{name:13} MAE {mean_absolute_error(y_test, pred):5.1f}  "
          f"RMSE {root_mean_squared_error(y_test, pred):5.1f}  R2 {r2_score(y_test, pred):6.3f}")
```

- **MAE** (متوسط الخطأ المطلق) هو متوسط حجم الخطأ، بوحدات الهدف. "نخطئ في المتوسط بـ 42 نقطة" جملة يفهمها الطبيب أو المدير. استخدمه للتواصل.
- **RMSE** (الجذر التربيعي لمتوسط مربعات الأخطاء) هو الجذر التربيعي لمتوسط الخطأ المربّع، وهو أيضًا بوحدات الهدف. وبسبب التربيع، فهو دائمًا لا يقل عن MAE، ويكون أكبر منه بكثير حين تكون بعض التنبؤات خاطئة بشدة. استخدمه حين تكون كلفة الأخطاء الكبيرة غير متناسبة.
- **R²** يقارن الخطأ المربّع للنموذج بخطأ التنبؤ الدائم بالمتوسط: 1 يعني الكمال، و0 يعني أنه ليس أفضل من التنبؤ بالمتوسط، والقيمة السالبة تعني أنه أسوأ من المتوسط. لا وحدة له، فهو مفيد لمقارنة النماذج على البيانات نفسها، لكنه يُخفي حجم الأخطاء الحقيقي.

يخفض النموذج الكامل MAE من 65.5 (خط أساس المتوسط) إلى 41.5 ويفسّر نحو نصف التباين. هذا تقدّم صادق، وتذكير أيضًا بأن نصف ما يحرّك هذا المرض ليس موجودًا في هذه الأعمدة العشرة.

:::tip اعرض MAE بجانب R²
"R² = 0.48" يبدو مجرّدًا، وضعيفًا في نظر غير المتخصصين. أما "خطأ معتاد مقداره 42 نقطة على مقياس يتراوح فيه المرضى بين 25 و346، بعد أن كان 66 مع التخمين الساذج" فتحكي القصة نفسها بلغة يستطيع الناس التصرّف بناءً عليها.
:::

استخدمت `fit` كصندوق أسود يُعيد أفضل خط. الدرس القادم يفتح الصندوق: ستكتب بنفسك عملية البحث عن أفضل خط باستخدام الـ gradient descent، وهي الفكرة نفسها التي تُدرَّب بها الشبكات العصبية.
