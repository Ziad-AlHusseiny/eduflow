---
summary: استخدم أي نموذج في scikit-learn عبر الاستدعاءات الثلاثة نفسها (fit وpredict وscore)، واقرأ ما تعلّمه النموذج بعد التدريب، واكتشف الحفظ بمقارنة نتيجتي التدريب والاختبار.
takeaways:
  - "كل estimator في scikit-learn يُنشأ بإعداداته، ويتعلّم في `fit(X, y)`، ويُستخدم عبر `predict(X)` و`score(X, y)`."
  - "الـ hyperparameters مثل `max_depth` تحدّدها أنت قبل التدريب؛ أما المعاملات (parameters) مثل عتبات التقسيم فتُتعلَّم أثناء `fit`."
  - "سمات (attributes) النموذج المدرَّب تنتهي بشرطة سفلية (`classes_` و`feature_names_in_`) ولا توجد إلا بعد `fit`."
  - "تُعيد `score` قيمة الـ accuracy للمصنِّفات وقيمة R² لنماذج الانحدار."
  - الفجوة الكبيرة بين نتيجتي التدريب والاختبار تعني أن النموذج حفظ صفوف تدريبه.
further:
  - title: "Getting started: fitting and predicting"
    url: https://scikit-learn.org/stable/getting_started.html
  - title: DecisionTreeClassifier
    url: https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier.html
  - title: "Glossary: estimator, fit, predict"
    url: https://scikit-learn.org/stable/glossary.html
quiz:
  - q: "ماذا يطبع هذا الكود؟\n```python\nfrom sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier(max_depth=3)\nprint(model.classes_)\n```"
    options:
      - text: "`[0 1]`، أي فئتا الانقطاع."
        why: "`classes_` تُتعلَّم من `y` أثناء `fit`. وهذا النموذج لم يرَ أي بيانات بعد."
      - text: "`None`، لأنه لم تُحدَّد أي فئات بعد."
        why: لا ينشئ scikit-learn السمات التي يتعلّمها التدريب بقيمة `None`. فهي غير موجودة أصلًا حتى يُنفَّذ `fit`.
      - text: "خطأ `AttributeError`، لأن `classes_` لا توجد إلا بعد `fit`."
        why: صحيح. الشرطة السفلية في آخر الاسم تدلّ على سمة ينشئها `fit`.
    answer: 2
  - q: "شجرة تحقق 1.00 على بيانات التدريب و0.72 على بيانات الاختبار. وشجرة بعمق 3 تحقق 0.78 و0.73. أيّهما النموذج الأفضل لـ Cartwheel؟"
    options:
      - text: الشجرة غير المحدودة، لأن 1.00 تُظهر أنها التقطت كل نمط.
        why: النتيجة المثالية في التدريب على بيانات مليئة بالضجيج مثل بيانات الانقطاع تعني أنها حفظت العملاء فردًا فردًا. ونتيجتها في الاختبار أقل.
      - text: الشجرة بعمق 3، لأنها تؤدي على الأقل بالمستوى نفسه مع عملاء لم ترَهم، وهي أبسط بكثير.
        why: صحيح. احكم على البيانات المحجوزة؛ وحين تتعادل النتائج، فضّل النموذج ذا الأجزاء المتحركة الأقل.
      - text: هما متساويتان، لأن نتيجتي الاختبار لا تختلفان إلا بـ 0.01.
        why: نتيجتا الاختبار متقاربتان، لكن الشجرة بعمق 3 أسهل في الشرح وأقل عرضة للتذبذب مع بيانات جديدة. وهذا يحسم التعادل.
    answer: 1
  - q: "أيّ هذه القيم hyperparameter وليست معاملًا متعلَّمًا؟"
    options:
      - text: "`max_depth=3` الممرَّرة إلى `DecisionTreeClassifier`"
        why: صحيح. أنت تختارها قبل التدريب، وهي تحدّ من مدى تعقيد الشجرة المتعلَّمة.
      - text: "العتبة `days_since_last_order <= 236.5` في جذر شجرة مدرَّبة"
        why: هذه العتبة يجدها `fit` من البيانات. فهي معامل متعلَّم.
      - text: "`coef_` في نموذج `LinearRegression` مدرَّب"
        why: المعاملات تُتعلَّم من البيانات، ولهذا تحمل الشرطة السفلية في آخر اسمها.
    answer: 0
  - q: "درّبت نموذجًا على DataFrame أعمدته بترتيب معيّن، ثم استدعيت `predict` على DataFrame فيه الأعمدة نفسها بترتيب مختلف. ماذا يحدث؟"
    options:
      - text: يعيد scikit-learn ترتيب الأعمدة نيابةً عنك ويتنبأ بشكل صحيح.
        why: يتحقق scikit-learn من الأسماء لكنه لا يعيد الترتيب. بل يرفض بدل أن يخمّن.
      - text: يرفع `ValueError` يقول إن أسماء الـ features يجب أن تكون بالترتيب نفسه كما في fit.
        why: صحيح. هذا الفحص يحميك من إدخال `orders` بصمت في الخانة التي تعلّمها النموذج على أنها `tenure_days`.
      - text: يتنبأ بصمت مستخدمًا الأعمدة بحسب مواقعها.
        why: هذا ما يحدث مع مصفوفة NumPy التي لا أسماء لها. أما مع DataFrame فيلتقط فحص الأسماء عدم التطابق.
    answer: 1
---

يأتي scikit-learn بعشرات النماذج، من الخطوط المستقيمة إلى غابات الأشجار، وتستخدمها جميعًا بالطريقة نفسها. تعلّم ثلاثة استدعاءات وستستطيع تجربة أيّ منها على بيانات الانقطاع في بضعة أسطر. هذا الاتساق هو السبب الرئيسي في كون scikit-learn المكتبة الافتراضية لتعلّم الآلة الكلاسيكي.

## ثلاثة استدعاءات

النموذج في scikit-learn هو **estimator (مقدِّر)**: كائن Python تنشئه بإعداداته، وتدرّبه بـ `fit`، وتستخدمه بـ `predict` و`score`.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X, y = churn[features], churn["churned"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

model = DecisionTreeClassifier(max_depth=3, random_state=42)  # 1. create
model.fit(X_train, y_train)                                    # 2. learn
print(model.predict(X_test)[:10])                              # 3. use
print("train accuracy:", round(model.score(X_train, y_train), 3))
print("test accuracy: ", round(model.score(X_test, y_test), 3))
```

ما يفعله كل استدعاء:

- **الـ constructor** يأخذ **الـ hyperparameters**: خيارات تحدّدها قبل التدريب. `max_depth=3` تعني أن الشجرة لا تطرح أكثر من ثلاثة أسئلة متتالية. و`random_state=42` تجعل كسر التعادلات قابلًا للتكرار.
- **`fit(X_train, y_train)`** تنظر في الأمثلة وتتعلّم **معاملات (parameters)** النموذج. في الشجرة، هذه المعاملات هي الأسئلة والعتبات ("هل `days_since_last_order` أكبر من 236.5؟"). وتُعيد النموذج نفسه، لذا يعمل أيضًا `model = DecisionTreeClassifier().fit(X, y)`.
- **`predict(X)`** تُعيد تنبؤًا واحدًا لكل صف: وهنا مصفوفة من الأصفار والآحاد.
- **`score(X, y)`** تتنبأ ثم تقارن بالإجابات الحقيقية. في المصنِّفات تُعيد الـ **accuracy (الدقة)**، أي نسبة التنبؤات الصحيحة. وفي نماذج الانحدار تُعيد R²، الذي ستتعرّف عليه في القسم 2.

:::figure دورة حياة الـ estimator
<svg viewBox="0 0 680 190" role="img" aria-labelledby="t1">
  <title id="t1">يُنشأ الـ estimator بالـ hyperparameters، ثم يُدرَّب على بيانات التدريب ليتعلّم معاملات تُخزَّن في سمات تنتهي بشرطة سفلية، ثم يُستخدم للتنبؤ على بيانات جديدة أو لحساب النتيجة مقابل إجابات معروفة.</title>
  <rect class="d-box" x="20" y="60" width="150" height="64" rx="12"/>
  <text class="d-code" x="95" y="88" text-anchor="middle">Model(max_depth=3)</text>
  <text class="d-label-muted" x="95" y="110" text-anchor="middle">hyperparameters</text>
  <path class="d-arrow" d="M170 92 L250 92" marker-end="url(#arrow)"/>
  <text class="d-code" x="210" y="80" text-anchor="middle">fit</text>
  <rect class="d-box-primary" x="255" y="60" width="170" height="64" rx="12"/>
  <text class="d-label" x="340" y="88" text-anchor="middle">نموذج مدرَّب</text>
  <text class="d-code" x="340" y="110" text-anchor="middle">classes_, tree_ …</text>
  <path class="d-arrow" d="M425 80 L505 40" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M425 104 L505 146" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="510" y="16" width="150" height="48" rx="10"/>
  <text class="d-code" x="585" y="45" text-anchor="middle">predict(X)</text>
  <rect class="d-box-success" x="510" y="122" width="150" height="48" rx="10"/>
  <text class="d-code" x="585" y="151" text-anchor="middle">score(X, y)</text>
</svg>
:::

## ما الذي يعرفه النموذج بعد التدريب

كل ما يتعلّمه النموذج أثناء `fit` يُخزَّن في سمات (attributes) تنتهي أسماؤها بشرطة سفلية. وهي غير موجودة قبل `fit`؛ فطلب إحداها يرفع `AttributeError`، واستدعاء `predict` على نموذج غير مدرَّب يرفع `NotFittedError`.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
model = DecisionTreeClassifier(max_depth=3, random_state=42).fit(X_train, y_train)

print(model.classes_)            # the labels it saw: [0 1]
print(model.n_features_in_)      # 8
print(model.feature_names_in_[:3])

new_customer = pd.DataFrame([{
    "tenure_days": 400, "orders": 2, "total_spent": 180.0, "avg_order_value": 90.0,
    "days_since_last_order": 150, "used_coupon": 0, "support_tickets": 1,
    "mobile_share": 0.5}])
print(model.predict(new_customer))        # [1]: likely to churn
print(model.predict_proba(new_customer))  # [[0.36 0.64]]
```

تعطيك `predict_proba` الاحتمال الذي يقدّره النموذج لكل فئة، بترتيب `classes_`. هذا العميل يحصل على 64% للانقطاع. ستعتمد على الاحتمالات كثيرًا في القسم 3، لأنها تتيح لك أن تختار مقدار الحذر الذي تريده.

## نتيجة التدريب تكذب

أزل الآن حدّ العمق وراقب ما يحدث. الشجرة غير المحدودة تواصل طرح الأسئلة حتى يجلس كل عميل من عملاء التدريب في ورقة لا تحوي إلا فئته.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

for model in [DecisionTreeClassifier(max_depth=3, random_state=42),
              DecisionTreeClassifier(random_state=42),
              KNeighborsClassifier(n_neighbors=5)]:
    model.fit(X_train, y_train)
    print(f"{model!r:55} train {model.score(X_train, y_train):.2f}  test {model.score(X_test, y_test):.2f}")
```

الشجرة غير المحدودة مثالية على العملاء الـ 298 الذين درستهم، وأسوأ من الشجرة الضحلة على المئة الذين لم ترَهم. لقد حفظت خصوصيات العملاء الأفراد. هذه الفجوة بين أداء التدريب وأداء الاختبار هي **الـ overfitting (الإفراط في التوافق)**، وستقضي جزءًا كبيرًا من القسم 2 في تعلّم كيفية التحكم فيها.

لاحظ أيضًا النموذج الثالث. خوارزمية أقرب k جيران (k-nearest neighbours) لا تشبه الشجرة في شيء (فهي تتنبأ بالنظر إلى أكثر خمسة عملاء تدريب تشابهًا)، ومع ذلك الكود متطابق. تبديل النموذج يكلّفك سطرًا واحدًا.

## العقد نفسه، والافتراضات مختلفة

الواجهة المشتركة تُخفي أفكارًا مختلفة جدًا عن العالم. فالشجرة تفترض أن الانقطاع يمكن وصفه بعدد قليل من أسئلة نعم/لا ذات حدود فاصلة حادة. وأقرب k جيران تفترض أن العملاء المتشابهين يتصرّفون بالطريقة نفسها، حيث "التشابه" يعني القرب حين يُعامَل كل عمود كمسافة. لا أحد الافتراضين صحيح بإطلاق؛ كلٌّ منهما مفيد في مواقف وخاطئ في أخرى. ولهذا تجرّب عدة نماذج على التقسيم نفسه بدل أن تتجادل حول أيّها يجب أن يفوز.

نماذج الانحدار تلتزم العقد نفسه. `DecisionTreeRegressor` و`LinearRegression` تأخذان `y` رقميًا، وتُعيد `predict` أرقامًا بدل الفئات، وتُعيد `score` قيمة R² بدل الـ accuracy. كل ما تتعلّمه عن estimator واحد ينتقل إلى البقية.

تفصيلتان توفّران عليك الارتباك لاحقًا. استدعاء `fit` مرة ثانية يمحو ما تعلّمه النموذج من قبل ويبدأ من الصفر؛ ولا يضيف إلى معرفته القديمة. والإعدادات التي مرّرتها إلى الـ constructor تبقى مقروءة كسمات عادية (`model.max_depth`)، فيمكنك دائمًا التحقق مما طُلب من نموذج مدرَّب أن يفعله.

:::mistake تمرير جدول بشكل مختلف إلى predict
تحتاج `predict` إلى الأعمدة نفسها وبالترتيب نفسه كما في `fit`. مرّر DataFrame أعمدته مبعثرة وسيرفع scikit-learn الخطأ `ValueError: The feature names should match those that were passed during fit`. ومرّر مصفوفة NumPy مجرّدة ولن يستطيع التحقق من الأسماء إطلاقًا: سيعطي تحذيرًا ويستخدم الأعمدة بحسب مواقعها، ما يعطي إجابات خاطئة بصمت إذا اختلف ترتيبك. ابنِ مدخلات التنبؤ من قائمة `features` نفسها التي درّبت بها.
:::

لديك الآن نموذج بدقة 73% على بيانات الاختبار. هل هذا جيد؟ لا يمكنك الحكم بعد، لأنك لم تسأل كم سيحقق نموذج بلا أي ذكاء على الإطلاق. هذا هو موضوع الدرس القادم.
