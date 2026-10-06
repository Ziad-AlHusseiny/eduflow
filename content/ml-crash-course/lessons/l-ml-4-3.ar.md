---
summary: اضبط الـ hyperparameters باستخدام GridSearchCV وRandomizedSearchCV مع أسماء خطوات الـ pipeline، واقرأ cv_results_، وحافظ على أمانة نتيجة الاختبار النهائية بعد البحث.
takeaways:
  - "يجرّب `GridSearchCV` كل تركيبة في الشبكة مع تحقق متقاطع لكلٍّ منها؛ ويسحب `RandomizedSearchCV` عددًا ثابتًا من التركيبات من قوائم أو توزيعات."
  - "داخل الـ pipeline، يُشار إلى المعاملات بالصيغة `step__parameter`، مثل `model__C`."
  - "بعد البحث، يحمل `best_params_` الفائز، و`best_estimator_` هو ذلك النموذج بعد إعادة تدريبه على بيانات التدريب كلها."
  - "قيمة `best_score_` متفائلة قليلًا لأنها الأفضل من بين محاولات كثيرة؛ وبيانات الاختبار تعطي الرقم غير المنحاز."
  - ابحث على مقياس لوغاريتمي في معاملات مثل `C` و`alpha` و`learning_rate`، وتوقّع أن يضيف الضبط نقاطًا، لا معجزات.
further:
  - title: "Tuning the hyper-parameters of an estimator"
    url: https://scikit-learn.org/stable/modules/grid_search.html
  - title: GridSearchCV
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html
  - title: RandomizedSearchCV
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.RandomizedSearchCV.html
quiz:
  - q: "الـ pipeline لديك هو `Pipeline([(\"prep\", preprocess), (\"clf\", LogisticRegression())])`. أيّ شبكة تضبط قوة الـ regularization؟"
    options:
      - text: "`{\"C\": [0.1, 1, 10]}`"
        why: لا يوجد في الـ pipeline معامل اسمه `C`؛ وسيرفع البحث خطأ معامل غير صالح.
      - text: "`{\"LogisticRegression__C\": [0.1, 1, 10]}`"
        why: البادئة هي اسم الخطوة، لا اسم الصنف.
      - text: "`{\"clf.C\": [0.1, 1, 10]}`"
        why: يستخدم scikit-learn شرطتين سفليتين، لا نقطة، للوصول إلى داخل الخطوات.
      - text: "`{\"clf__C\": [0.1, 1, 10]}`"
        why: صحيح. اسم الخطوة، ثم شرطتان سفليتان، ثم اسم المعامل.
    answer: 3
  - q: "في شبكة 5 قيم لـ `max_depth` و5 قيم لـ `min_samples_leaf`، مع `cv=5`. كم نموذجًا يُدرَّب، بما في ذلك إعادة التدريب النهائية؟"
    options:
      - text: "126: أي 25 تركيبة × 5 طيّات، إضافة إلى إعادة تدريب واحدة على بيانات التدريب كلها."
        why: صحيح. مع القيمة الافتراضية `refit=True` يُعاد تدريب الفائز مرة أخرى في النهاية.
      - text: "25: واحد لكل تركيبة."
        why: كل تركيبة تخضع للتحقق المتقاطع، فتُدرَّب مرة لكل طيّة.
      - text: "10: خمس قيم زائد خمس قيم."
        why: تجرّب الشبكة كل تركيبة، لا كل قيمة على حدة.
    answer: 0
  - q: "لماذا قد يتفوّق `RandomizedSearchCV` بعشرين تكرارًا على شبكة من 400 تركيبة بالميزانية الزمنية نفسها؟"
    options:
      - text: لأن البحث العشوائي يستخدم مُحسِّنًا أذكى يتعلّم من المحاولات السابقة.
        why: البحث العشوائي العادي لا يتعلّم بين المحاولات؛ فكل عيّنة مستقلة.
      - text: لأن البحث العشوائي يجد دائمًا القيمة المثلى الحقيقية.
        why: إنه يسحب عيّنات، فقد يفوّت القيمة المثلى؛ والغاية الكفاءة، لا الضمانات.
      - text: لأنه حين لا يهمّ إلا عدد قليل من المعاملات، يجرّب السحب العشوائي قيمًا مختلفة لتلك المعاملات أكثر بكثير مما تجرّبه الشبكة.
        why: صحيح. تهدر الشبكة المحاولات في تكرار قيم المعامل المهم نفسها بينما تنوّع المعاملات غير المهمة.
    answer: 2
  - q: "يُبلغ البحث عن `best_score_ = 0.813`، ويحقق النموذج المُعاد تدريبه 0.805 على بيانات الاختبار. ما الذي يحدث؟"
    options:
      - text: لا بد أن بيانات الاختبار تتسرّب، فالنتائج يجب أن تتطابق تمامًا.
        why: النتائج تختلف على بيانات مختلفة؛ والتسرّب كان سيرفع نتيجة الاختبار، لا أن يخفضها.
      - text: أفضل نتيجة من بين نتائج تحقق متقاطع كثيرة متفائلة قليلًا؛ ونتيجة الاختبار هي التقدير الأمين.
        why: صحيح. اختيار الحدّ الأقصى من نتائج مليئة بالضجيج يحابي الإعدادات المحظوظة، وهي "لعنة الفائز".
      - text: إعادة التدريب على بيانات التدريب كلها جعلت النموذج أسوأ.
        why: نادرًا ما تضرّ بيانات التدريب الإضافية؛ والفجوة تأتي من طريقة اختيار الفائز.
    answer: 1
---

كل نموذج حتى الآن كانت له إعدادات اخترتها يدويًا أو تركتها على قيمها الافتراضية: `C=1.0` و`max_depth=3` و`min_samples_leaf=5`. بعض هذه الخيارات مهم جدًا، وبعضها لا يكاد يهم، والطريقة الوحيدة لمعرفة ذلك هي التجربة. والتجربة يدويًا تعني حلقات تكرار ومسك دفاتر وإغراءً باختلاس النظر إلى بيانات الاختبار. أدوات البحث في scikit-learn تفعل ذلك كما ينبغي، مع تحقق متقاطع مدمج.

## البحث الشبكي

يأخذ `GridSearchCV` estimator وقاموسًا من قيم المعاملات ومخطط تحقق متقاطع. ويطبّق التحقق المتقاطع على كل تركيبة، ويختار صاحبة أفضل متوسط، ويعيد تدريبها على بيانات التدريب كلها. وبعد ذلك يتصرّف كالنموذج الفائز.

يُشار إلى المعاملات داخل الـ pipeline باسم الخطوة، ثم شرطتين سفليتين، ثم اسم المعامل. ولهذا تؤتي تسميةُ خطواتك ثمارها.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

pipe = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression())])
search = GridSearchCV(pipe, {"model__C": [0.01, 0.03, 0.1, 0.3, 1, 3, 10]},
                      cv=cv, scoring="roc_auc")
search.fit(X_train, y_train)

results = pd.DataFrame(search.cv_results_)
print(results[["param_model__C", "mean_test_score", "std_test_score"]].round(3))
print("best:", search.best_params_, "CV AUC", round(search.best_score_, 3))
```

يحمل `cv_results_` نتائج الطيّات لكل تركيبة؛ وتصفّحه سهل حين يكون DataFrame. وهنا التصفّح نفسه هو الاستنتاج: من `C=0.03` إلى `C=10` يتحرك متوسط الـ AUC بأقل من نصف نقطة، وهذا أصغر بكثير من التشتّت بين الطيّات. ثمانية features حسنة السلوك لا تترك للانحدار اللوجستي مجالًا للـ overfitting، فلا تكاد عقوبته تهم. الضبط لا يستطيع إنقاذ نموذج بلغ سقفه أصلًا؛ أما features أفضل أو عائلة نماذج مختلفة فقد تستطيع.

لاحظ أن القيم متباعدة بعوامل تقارب الثلاثة. في المعاملات التي تعمل بشكل ضربي (`C` و`alpha` ومعدّلات التعلّم)، ابحث على مقياس لوغاريتمي؛ فالقيم 0.01 و0.1 و1 و10 تغطي مساحة أكبر بكثير من 1 و2 و3 و4.

## شبكة حيث يهمّ الأمر

الأشجار قصة أخرى. العمق والحدّ الأدنى لحجم الورقة يتحكمان في مقدار ما تستطيع الشجرة حفظه، والقيم الصحيحة تعتمد على البيانات.

```python run
import pandas as pd
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

grid = {"max_depth": [2, 3, 4, 5, None], "min_samples_leaf": [1, 5, 10, 20, 40]}
search = GridSearchCV(DecisionTreeClassifier(random_state=42), grid, cv=cv, scoring="roc_auc")
search.fit(X_train, y_train)

top = pd.DataFrame(search.cv_results_).sort_values("rank_test_score")
print(top[["param_max_depth", "param_min_samples_leaf", "mean_test_score"]].head(5).round(3))
print("worst:", round(top["mean_test_score"].min(), 3))
print("best:", search.best_params_, "| test AUC", round(search.score(X_test, y_test), 3))
```

25 تركيبة × 5 طيّات = 125 عملية تدريب، إضافة إلى إعادة تدريب نهائية واحدة. والتشتّت واسع: أسوأ الأشجار (بعمق غير محدود وأوراق من عميل واحد) تحقق نتائج أدنى بكثير من الأفضل. تستخدم `search.score` مقياس `scoring` نفسه المستخدم في البحث، فهي تُبلغ هنا عن الـ ROC AUC على بيانات الاختبار.

## البحث العشوائي

تكبر الشبكات بشكل ضربي. أربعة معاملات بستّ قيم لكلٍّ منها تعني 1,296 تركيبة، مضروبة في خمس طيّات. أما **`RandomizedSearchCV`** فيسحب بدلًا من ذلك عددًا ثابتًا من التركيبات (`n_iter`)، ويقبل التوزيعات إلى جانب القوائم.

:::figure البحث الشبكي مقابل البحث العشوائي بالمحاولات التسع نفسها
<svg viewBox="0 0 680 270" role="img" aria-labelledby="t1">
  <title id="t1">مربّعان، المعامل المهم على المحور الأفقي وغير المهم على العمودي. تضع الشبكة تسع نقاط في شبكة 3 في 3، فلا تختبر إلا ثلاث قيم مختلفة للمعامل المهم. أما البحث العشوائي فينثر تسع نقاط، فيختبر تسع قيم مختلفة.</title>
  <rect class="d-box" x="40" y="20" width="240" height="200" rx="6"/>
  <rect class="d-box" x="400" y="20" width="240" height="200" rx="6"/>
  <circle class="d-dot" cx="80" cy="60" r="7"/><circle class="d-dot" cx="160" cy="60" r="7"/><circle class="d-dot" cx="240" cy="60" r="7"/>
  <circle class="d-dot" cx="80" cy="120" r="7"/><circle class="d-dot" cx="160" cy="120" r="7"/><circle class="d-dot" cx="240" cy="120" r="7"/>
  <circle class="d-dot" cx="80" cy="180" r="7"/><circle class="d-dot" cx="160" cy="180" r="7"/><circle class="d-dot" cx="240" cy="180" r="7"/>
  <circle class="d-dot" cx="425" cy="150" r="7"/><circle class="d-dot" cx="452" cy="70" r="7"/><circle class="d-dot" cx="478" cy="195" r="7"/>
  <circle class="d-dot" cx="505" cy="105" r="7"/><circle class="d-dot" cx="532" cy="45" r="7"/><circle class="d-dot" cx="560" cy="170" r="7"/>
  <circle class="d-dot" cx="585" cy="125" r="7"/><circle class="d-dot" cx="608" cy="60" r="7"/><circle class="d-dot" cx="628" cy="200" r="7"/>
  <text class="d-label-strong" x="160" y="245" text-anchor="middle">الشبكة: 3 قيم مُجرَّبة</text>
  <text class="d-label-strong" x="520" y="245" text-anchor="middle">العشوائي: 9 قيم مُجرَّبة</text>
  <text class="d-label-muted" x="340" y="125" text-anchor="middle">المهم →</text>
</svg>
:::

حين لا يهمّ حقًا إلا معامل أو اثنان، وهي الحالة المعتادة، يستكشف البحث العشوائي قيمًا مختلفة لهما أكثر بكثير بالميزانية نفسها.

```python run
import pandas as pd
from scipy.stats import randint
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, train_test_split

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

space = {"max_features": [1, 2, 3, 4, "sqrt"], "min_samples_leaf": randint(1, 30)}
search = RandomizedSearchCV(RandomForestClassifier(n_estimators=60, random_state=42), space,
                            n_iter=8, cv=cv, scoring="roc_auc", random_state=42)
search.fit(X_train, y_train)
print("best:", search.best_params_)
print("CV AUC", round(search.best_score_, 3), "| test AUC", round(search.score(X_test, y_test), 3))
```

تسحب `randint(1, 30)` من SciPy أعدادًا صحيحة من 1 إلى 29؛ و`loguniform(0.01, 10)` هو الخيار المعتاد لـ `C` أو معدّلات التعلّم. اضبط `random_state` على البحث كي يسحب المرشّحين أنفسهم في كل تشغيل.

## البحث في ما هو أبعد من إعدادات النموذج

لأن البحث يضبط الـ pipeline كله، فخيارات المعالجة المسبقة مشمولة أيضًا. إدخال في الشبكة مثل `"prep__sat__simpleimputer__strategy": ["mean", "median"]` يقارن استراتيجيات الملء بالطيّات الأمينة نفسها. بل يمكنك تمرير قائمة من الشبكات، واحدة لكل عائلة نماذج، وترك البحث يبدّل الخطوة الأخيرة: `[{"model": [LogisticRegression()], "model__C": [0.1, 1]}, {"model": [RandomForestClassifier()], "model__min_samples_leaf": [5, 20]}]`. هذا أنيق، لكنه يضاعف عمليات التدريب بسرعة، ويُخفي جدول المقارنة الذي تريد أن تعرضه على زميل. ولحفنة من النماذج المرشّحة، كثيرًا ما تكون حلقة بسيطة من استدعاءات `cross_validate` بالـ splitter نفسه أوضح.

:::mistake تصديق best_score_
يُبلغ البحث عن الأفضل من بين نتائج تحقق متقاطع كثيرة. وجزء من هذا "الأفضل" حظ: فبين عدد كافٍ من المرشّحين المليئين بالضجيج، سيبدو أحدهم جيدًا بالمصادفة. توقّع أن تأتي نتيجة الاختبار أقل قليلًا، كما يحدث هنا، وانشر نتيجة الاختبار. وإذا احتجت إلى تقدير غير منحاز دون بيانات اختبار، فالتحقق المتقاطع المتداخل (nested cross-validation، أي بحث داخل كل طيّة خارجية) يعطيك واحدًا، بكلفة أعلى بكثير.
:::

:::tip روتين يراعي الميزانية
ابدأ بشكل خشن وعلى مقياس لوغاريتمي، وانظر في `cv_results_`، ثم ضيّق حول المنطقة الأفضل. اضبط المعاملين أو الثلاثة التي تتحكم في التعقيد (العمق، وحجم الورقة، و`C`، ومعدّل التعلّم) واترك البقية على قيمها الافتراضية. وإذا كانت أفضل عشرة إعدادات أو نحوها ضمن انحراف معياري واحد من بعضها، فتوقّف: أنت تضبط الضجيج.
:::

عمليات البحث تضاعف عدد النماذج التي تدرّبها، ومعها عدد الفرص لتسرّب المعلومات من بيانات التحقق إلى التدريب. الدرس القادم دليل ميداني لتسرّب البيانات: كيف يحدث، وكيف تكتشفه، ولماذا ينتج أفضل النتائج التي ستراها في حياتك.
