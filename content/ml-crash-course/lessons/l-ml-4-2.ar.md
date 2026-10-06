---
summary: ابنِ Pipeline واحدًا يملأ القيم المفقودة ويوحّد المقاييس ويطبّق one-hot encoding على الأعمدة الصحيحة باستخدام ColumnTransformer، فتُعاد المعالجة المسبقة داخل كل طيّة تحقق متقاطع وترافق النموذج أينما ذهب.
takeaways:
  - "يسلسل الـ `Pipeline` محوّلات (transformers) ونموذجًا نهائيًا في estimator واحد: يدرّب `fit` كل خطوة بالترتيب، ويمرّر `predict` البيانات الجديدة عبر الخطوات نفسها."
  - "يطبّق `ColumnTransformer` معالجة مسبقة مختلفة على أعمدة مختلفة ثم يضمّ النتائج جنبًا إلى جنب."
  - "يحوّل `OneHotEncoder(handle_unknown=\"ignore\")` الفئات إلى أعمدة 0/1 ولا ينهار أمام فئة لم يرَها في التدريب."
  - "يملأ `SimpleImputer(add_indicator=True)` الفجوات ويضيف عمودًا يسجّل القيم التي كانت مفقودة."
  - لأن الـ pipeline كله يُعاد تدريبه في كل طيّة، لا تتعلّم المعالجة المسبقة إلا من صفوف التدريب، وهذا يُبقي التحقق المتقاطع أمينًا.
further:
  - title: "Pipelines and composite estimators"
    url: https://scikit-learn.org/stable/modules/compose.html
  - title: ColumnTransformer
    url: https://scikit-learn.org/stable/modules/generated/sklearn.compose.ColumnTransformer.html
  - title: OneHotEncoder
    url: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html
  - title: "Imputation of missing values"
    url: https://scikit-learn.org/stable/modules/impute.html
quiz:
  - q: "أثناء `cross_validate(pipe, X_train, y_train, cv=5)`، من أين يحصل الـ `StandardScaler` داخل `pipe` على متوسطاته؟"
    options:
      - text: من طيّات التدريب الأربع في كل جولة فقط.
        why: صحيح. يُستنسخ الـ pipeline كله ويُعاد تدريبه لكل طيّة، فلا تؤثر طيّة التحقق أبدًا في المعالجة المسبقة.
      - text: من `X_train` كاملة، محسوبة مرة واحدة قبل إنشاء الطيّات.
        why: هذا ما يحدث إذا وحّدت المقاييس قبل التحقق المتقاطع، وهو التسرّب الذي وُجدت الـ pipelines لمنعه.
      - text: من طيّة التحقق، كي تُمركز بيانات التحقق بشكل صحيح.
        why: تدريب أي شيء على طيّة التحقق سيسرّبها إلى النموذج.
      - text: من بيانات الاختبار، لأنها ما سيُتنبأ به.
        why: لا تُمرَّر بيانات الاختبار إلى `cross_validate` إطلاقًا.
    answer: 0
  - q: "يصل عميل من فرنسا (غير موجودة في التدريب) إلى pipeline يستخدم فيه `OneHotEncoder` القيمة الافتراضية لـ `handle_unknown`. ماذا يحدث؟"
    options:
      - text: يحوّل الـ encoder فرنسا إلى الدولة الأكثر شيوعًا.
        why: لا يوجد encoder في scikit-learn يستبدل فئة بهذه الطريقة بصمت.
      - text: تصبح أعمدة الدولة لهذا العميل كلها أصفارًا ويستمر التنبؤ.
        why: هذا هو السلوك مع `handle_unknown="ignore"`، لا مع القيمة الافتراضية.
      - text: يضيف الـ encoder عمودًا جديدًا لفرنسا في الحال.
        why: تخطيط الأعمدة يُثبَّت وقت التدريب؛ ولن تستطيع معاملات النموذج استخدام عمود جديد على أي حال.
      - text: "ترفع `transform` الخطأ `ValueError: Found unknown categories ['France']`."
        why: صحيح. القيمة الافتراضية هي `"error"`. استخدم `handle_unknown="ignore"` في أي شيء سيرى بيانات حيّة.
    answer: 3
  - q: "لماذا نستخدم `SimpleImputer(strategy=\"median\", add_indicator=True)` مع `avg_satisfaction`؟"
    options:
      - text: لأن عمود المؤشّر يتيح للنموذج أن يتعلّم أن غياب الاستبيان بحدّ ذاته معلومة، بينما يملأ الوسيط الفجوة.
        why: صحيح. الغياب كثيرًا ما يكون إشارة (فالعملاء الذين لا يجيبون عن الاستبيانات أبدًا قد يتصرّفون بشكل مختلف).
      - text: لأن الوسيط يجعل توزيع العمود طبيعيًا.
        why: الملء بالوسيط لا يغيّر شكل القيم المرصودة؛ بل يملأ الفجوات فقط.
      - text: لأن المؤشّر يحلّ محل العمود الأصلي، فيتجاهل النموذج الرضا.
        why: يُضاف المؤشّر بجانب العمود المملوء، لا بدلًا منه.
    answer: 0
  - q: "إضافة `country` و`segment` إلى pipeline الانحدار اللوجستي تخفض الـ ROC AUC بالتحقق المتقاطع من 0.807 إلى 0.776. ما أفضل تفسير؟"
    options:
      - text: الـ OneHotEncoder مُعدّ بشكل خاطئ، لأن المعلومات الإضافية لا يمكن أن تضرّ.
        why: الـ features الإضافية قد تضرّ؛ فكلٌّ منها يضيف معاملات قد تلائم الضجيج، خاصة مع بضع مئات من الصفوف.
      - text: على 298 صفًا، تضيف أعمدة الـ one-hot الأحد عشر ضجيجًا أكثر من الإشارة، فاتركها خارجًا الآن.
        why: صحيح. أعد اختبارها حين تتوفر بيانات أكثر أو عقوبة أقوى.
      - text: الدولة تسبّب الانقطاع بطريقة لا يستطيع الانحدار اللوجستي التقاطها.
        why: لا شيء هنا يدعم ادّعاءً سببيًا، والانخفاض يقول إن الأعمدة لا تساعد هذا النموذج.
    answer: 1
---

ظلّ القسم 3 يترك بيانات على الطاولة. فـ `country` و`segment` نصوص، ولا يقبلها أي نموذج في scikit-learn مباشرة. و`avg_satisfaction` فيه فجوات يرفضها الانحدار اللوجستي. وكنت توحّد المقاييس يدويًا، متتبّعًا `X_train_s` و`X_test_s`. كل خطوة من هذه الخطوات يجب أن تُتعلَّم من بيانات التدريب وحدها، وتُطبَّق بالطريقة نفسها على البيانات الجديدة، وتُعاد داخل كل طيّة تحقق متقاطع. وفعل ذلك يدويًا هو الطريقة التي يحدث بها التسرّب والأخطاء. الـ pipeline يفعله نيابةً عنك.

## الـ Pipelines تجمع الخطوات في estimator واحد

الـ `Pipeline` قائمة من الخطوات: أي عدد من **المحوّلات (transformers)** (كائنات لها `fit` و`transform`، مثل `StandardScaler`) يليها estimator نهائي واحد. ويتصرّف الـ pipeline كنموذج واحد:

- يدرّب `pipe.fit(X, y)` المحوّل الأول، ويحوّل البيانات، ويمرّرها إلى الخطوة التالية، وهكذا، ثم يدرّب النموذج على الناتج.
- يمرّر `pipe.predict(X_new)` البيانات `X_new` عبر المحوّلات المدرَّبة مسبقًا، ثم يتنبأ.

استخدمت `make_pipeline`، التي تسمّي الخطوات تلقائيًا (`"standardscaler"` و`"logisticregression"`). أما `Pipeline([("prep", ...), ("model", ...)])` فيتيح لك اختيار الأسماء، وستحتاج إلى ذلك في الدرس القادم حين تضبط المعاملات بأسمائها.

المكسب الحقيقي يظهر في التحقق المتقاطع. تستنسخ `cross_validate` الـ pipeline بأكمله وتعيد تدريبه في كل طيّة، فتُتعلَّم متوسطات الـ scaler ووسيطات الـ imputer وقائمة فئات الـ encoder من صفوف تدريب تلك الطيّة وحدها.

## أعمدة مختلفة، ومعالجة مختلفة

ليس كل عمود بحاجة إلى المعالجة المسبقة نفسها. يوجّه `ColumnTransformer` كل مجموعة من الأعمدة عبر محوّلها الخاص، ثم يلصق المخرجات جنبًا إلى جنب.

:::figure ColumnTransformer داخل Pipeline
<svg viewBox="0 0 700 280" role="img" aria-labelledby="t1">
  <title id="t1">ينقسم جدول الانقطاع الخام إلى ثلاث مجموعات من الأعمدة. تمرّ الأعمدة الرقمية الثمانية عبر StandardScaler. ويمرّ avg_satisfaction عبر SimpleImputer مع مؤشّر، ثم StandardScaler. ويمرّ country وsegment عبر OneHotEncoder. تُضمّ المخرجات في 21 عمودًا وتُغذّى إلى LogisticRegression.</title>
  <rect class="d-box" x="10" y="110" width="120" height="56" rx="10"/>
  <text class="d-label" x="70" y="134" text-anchor="middle">الجدول الخام</text>
  <text class="d-label-muted" x="70" y="154" text-anchor="middle">11 عمودًا</text>
  <path class="d-arrow" d="M130 125 L190 50" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M130 138 L190 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M130 151 L190 226" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="195" y="24" width="250" height="52" rx="10"/>
  <text class="d-code" x="320" y="46" text-anchor="middle">8 numeric</text>
  <text class="d-label" x="320" y="66" text-anchor="middle">StandardScaler</text>
  <rect class="d-box-warn" x="195" y="112" width="250" height="52" rx="10"/>
  <text class="d-code" x="320" y="134" text-anchor="middle">avg_satisfaction</text>
  <text class="d-label" x="320" y="154" text-anchor="middle">SimpleImputer + مؤشّر، ثم scaler</text>
  <rect class="d-box-success" x="195" y="200" width="250" height="52" rx="10"/>
  <text class="d-code" x="320" y="222" text-anchor="middle">country, segment</text>
  <text class="d-label" x="320" y="242" text-anchor="middle">OneHotEncoder</text>
  <path class="d-arrow" d="M445 50 L505 125" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M445 138 L505 138" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M445 226 L505 151" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="510" y="104" width="180" height="68" rx="10"/>
  <text class="d-label" x="600" y="130" text-anchor="middle">21 عمودًا</text>
  <text class="d-label" x="600" y="152" text-anchor="middle">LogisticRegression</text>
</svg>
:::

ثلاثة محوّلات تقوم بالعمل:

- **`OneHotEncoder`** ينشئ عمود 0/1 لكل فئة: `country_Egypt` و`country_Germany` وهكذا. اضبط `handle_unknown="ignore"`؛ فالقيمة الافتراضية ترفع خطأً في أول مرة يصل فيها عميل من دولة لم تتضمّنها بيانات التدريب، وهذا يعني في بيئة الإنتاج خدمة تنبؤ منهارة.
- **`SimpleImputer`** يملأ القيم المفقودة بالمتوسط أو الوسيط أو القيمة الأكثر تكرارًا أو قيمة ثابتة، متعلَّمة من بيانات التدريب. ومع `add_indicator=True` يضيف أيضًا عمودًا قيمته 1 حيث كانت القيمة مفقودة. نصف عملاء Cartwheel لم يجيبوا عن الاستبيان قط، وقد تكون هذه الحقيقة أهم من الدرجة نفسها.
- **`StandardScaler`**، كما سبق. ويتيح `make_pipeline` صغير لمجموعة أعمدة واحدة أن تمرّ عبر خطوتين بالترتيب.

```python run
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

churn = pd.read_csv("churn.csv")
X = churn.drop(columns=["customer_id", "churned"])
y = churn["churned"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

numeric = ["tenure_days", "orders", "total_spent", "avg_order_value",
           "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
preprocess = ColumnTransformer([
    ("num", StandardScaler(), numeric),
    ("sat", make_pipeline(SimpleImputer(strategy="median", add_indicator=True), StandardScaler()),
     ["avg_satisfaction"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["country", "segment"]),
])
pipe = Pipeline([("prep", preprocess), ("model", LogisticRegression())])

pipe.fit(X_train, y_train)
names = pipe.named_steps["prep"].get_feature_names_out()
print(len(names), "model inputs, e.g.", list(names[8:12]))

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
print("all columns  ROC AUC:", cross_val_score(pipe, X_train, y_train, cv=cv, scoring="roc_auc").mean().round(3))
numeric_only = make_pipeline(StandardScaler(), LogisticRegression())
print("numeric only ROC AUC:", cross_val_score(numeric_only, X_train[numeric], y_train, cv=cv, scoring="roc_auc").mean().round(3))
```

يقبل الـ pipeline الـ DataFrame الخام، بما فيه من نصوص وفجوات، وينتج 21 مُدخلًا للنموذج: ثمانية أرقام موحّدة المقاييس، ودرجة الرضا المملوءة ومؤشّر غيابها، وثمانية أعمدة للدول وثلاثة للشرائح. وتسردها `get_feature_names_out` مع بادئة تسمّي المحوّل الذي أنتج كلًّا منها، وهكذا تطابق المعاملات بالأعمدة لاحقًا.

## أعمدة أكثر، ونموذج أسوأ

ثم تأتي المفاجأة: الـ pipeline الكامل يرتّب العملاء أسوأ من الأعمدة الرقمية الثمانية وحدها، 0.776 مقابل 0.807. أحد عشر عمود one-hot ودرجة رضا نصف قيمها مملوءة تعطي الانحدار اللوجستي معاملات أكثر ليلائمها بـ 298 صفًا فقط، وعلى هذه البيانات تحمل الأعمدة الإضافية ضجيجًا أكثر من الإشارة. صحيح أن نسبة الانقطاع في مصر تبدو أعلى في بيانات التدريب، لكن مع 44 عميلًا مصريًا في التدريب، هذا أضعف من أن يُراهَن عليه.

هذا ليس فشلًا للـ pipeline. بل هو الـ pipeline يؤدي عمله: جعل اختبار الأعمدة الإضافية تغييرًا من خمسة أسطر، وأعطى التحقق المتقاطع إجابة واضحة. يبقى النموذج الرقمي البطل حاليًا. والأعمدة الفئوية تستحق العودة إليها حين يصبح لدى Cartwheel بضعة آلاف من العملاء، أو مع regularization أقوى.

:::mistake المعالجة المسبقة قبل التقسيم
تطبيق `StandardScaler().fit_transform(X)` على الجدول كاملًا، ثم `train_test_split` أو `cross_val_score`، يعني أن صفوف التحقق ساهمت في حساب المتوسطات والانحرافات المعيارية. مع توحيد المقاييس يكون التسرّب صغيرًا؛ أما مع ملء القيم المفقودة أو الـ target encoding أو اختيار الـ features فقد يكون كبيرًا. ضع كل خطوة معالجة مسبقة متعلَّمة داخل الـ pipeline ومرّر إليه البيانات الخام.
:::

:::tip ادخل إلى pipeline مدرَّب
يصل بك `pipe.named_steps["model"].coef_` (أو `pipe[-1].coef_`) إلى النموذج؛ ويُظهر `pipe.named_steps["prep"].named_transformers_["cat"].categories_` الفئات التي تعلّمها الـ encoder. الـ pipelines ليست صناديق سوداء؛ إنها حاويات يمكنك فتحها.
:::

ويعطي الـ pipeline أيضًا كل إعداد عنوانًا: `model__C` هو `C` في الخطوة المسمّاة `model`، و`prep__sat__simpleimputer__strategy` يصل إلى الـ imputer. يستخدم الدرس القادم هذه العناوين للبحث عن أفضل الإعدادات تلقائيًا.
