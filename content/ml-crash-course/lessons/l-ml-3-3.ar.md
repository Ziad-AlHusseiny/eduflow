---
summary: اجمع أشجارًا كثيرة باستخدام الغابات العشوائية والـ gradient boosting، واستفد من تعامل HistGradientBoostingClassifier المدمج مع القيم المفقودة، وقِس أهمية الـ features بالـ permutation importance.
takeaways:
  - "تدرّب الغابة العشوائية (random forest) أشجارًا عميقة كثيرة على عيّنات bootstrap مع مجموعات فرعية عشوائية من الـ features، ثم تأخذ متوسط أصواتها، فيُلغى جزء كبير من تباين الشجرة الواحدة."
  - "يبني الـ gradient boosting أشجارًا ضحلة واحدة تلو الأخرى، كلٌّ منها مدرَّبة على أخطاء المجموعة حتى تلك اللحظة؛ ويوازن `learning_rate` و`max_iter` بين السرعة والـ overfitting."
  - "`HistGradientBoostingClassifier` هو نموذج الـ boosting السريع في scikit-learn، ويقبل القيم المفقودة (NaN) مباشرة."
  - "قيم `feature_importances_` المبنية على عدم النقاوة تحابي الـ features ذات القيم المختلفة الكثيرة؛ أما الـ permutation importance على بيانات محجوزة فتقيس ما يعتمد عليه النموذج فعلًا."
  - في مجموعات البيانات الجدولية الصغيرة، كثيرًا ما لا تضيف النماذج المجمّعة إلا بضع نقاط فوق نموذج خطي جيد، فقارنها به بدل أن تفترض أنها ستفوز.
further:
  - title: "Ensembles: Gradient boosting, random forests, bagging"
    url: https://scikit-learn.org/stable/modules/ensemble.html
  - title: HistGradientBoostingClassifier
    url: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingClassifier.html
  - title: "Permutation feature importance"
    url: https://scikit-learn.org/stable/modules/permutation_importance.html
quiz:
  - q: "لماذا تتفوّق الغابة العشوائية عادةً على شجرة واحدة غير مقيّدة مع البيانات الجديدة؟"
    options:
      - text: لأن كل شجرة فيها أضحل، فلا تستطيع الوقوع في الـ overfitting.
        why: أشجار الغابة تُنمّى عادةً عميقة. والفائدة تأتي من أخذ المتوسط، لا من تقييد كل شجرة.
      - text: لأنها تستخدم الـ gradient descent لضبط الأشجار معًا.
        why: أشجار الغابة تُدرَّب مستقلة؛ ولا شيء يربطها ببعضها أثناء التدريب.
      - text: لأنها تتدرّب على بيانات أكثر من الشجرة الواحدة.
        why: كل شجرة ترى عيّنة bootstrap من بيانات التدريب نفسها، فلا بيانات إضافية هنا.
      - text: لأن أخذ متوسط أشجار كثيرة مدرَّبة على عيّنات ومجموعات features مختلفة يُلغي أخطاءها الفردية.
        why: صحيح. كل شجرة تقع في الـ overfitting بطريقتها الخاصة؛ والأخطاء مستقلة جزئيًا، فيكون المتوسط أكثر استقرارًا.
    answer: 3
  - q: "في الـ gradient boosting، ماذا تتعلّم كل شجرة جديدة؟"
    options:
      - text: تصحيح الأخطاء التي ما زالت ترتكبها المجموعة المبنية حتى الآن.
        why: صحيح. الـ boosting تسلسلي؛ وكل شجرة تستهدف ما تبقّى.
      - text: الهدف نفسه الذي تعلّمته الشجرة الأولى، على عيّنة bootstrap جديدة.
        why: هذا وصف الـ bagging، الفكرة التي تقوم عليها الغابات العشوائية.
      - text: مجموعة فرعية عشوائية من الـ features، متجاهلة الأشجار السابقة.
        why: المجموعات الفرعية العشوائية من الـ features حيلة الغابات. أما أشجار الـ boosting فتعتمد على الأشجار التي قبلها.
    answer: 0
  - q: "العمود `avg_satisfaction` فارغ لنصف العملاء. أيّ نموذج يمكنك تدريبه عليه دون معالجة مسبقة إضافية؟"
    options:
      - text: "`LogisticRegression`، لأنه يتجاهل القيم المفقودة."
        why: "يرفع `ValueError: Input X contains NaN`. ستحتاج إلى imputer أولًا."
      - text: "`HistGradientBoostingClassifier`، الذي يتعلّم عند كل تقسيم الفرعَ الذي يجب أن تسلكه القيم المفقودة."
        why: صحيح. الدعم الأصيل لقيم NaN من أهم مزاياه العملية.
      - text: "`KNeighborsClassifier`، لأنه يتخطّى الأعمدة المفقودة عند قياس المسافة."
        why: يرفع k-NN خطأً مع NaN أيضًا؛ فلا يمكن حساب المسافات مع وجود فجوات.
    answer: 1
  - q: "يضع `feature_importances_` الخاص بالغابة `tenure_days` في المرتبة الثانية، لكن الـ permutation importance على بيانات الاختبار تعطيه ما يقارب الصفر. ما التفسير الأرجح؟"
    options:
      - text: الـ permutation importance معطوبة في الغابات العشوائية.
        why: تعمل مع أي نموذج؛ فهي لا تحتاج إلا إلى تنبؤات ونتيجة.
      - text: بيانات الاختبار أصغر من أن تحتوي `tenure_days`.
        why: كل صف فيه هذا الـ feature. بيانات الاختبار الصغيرة تضيف ضجيجًا، لكن لهذا النمط سببًا معروفًا.
      - text: استخدمت الغابة `tenure_days` في تقسيمات كثيرة لاءمت ضجيج التدريب، فتضخّمت أهمية عدم النقاوة دون أن يفيد ذلك مع البيانات الجديدة.
        why: صحيح. أهمية عدم النقاوة تُحسب على بيانات التدريب وتحابي الـ features المتصلة ذات العتبات المحتملة الكثيرة.
      - text: خلط `tenure_days` جعل النموذج أدق، وهذا يُثبت أن الـ feature ضار.
        why: النتيجة القريبة من الصفر تعني أن الخلط غيّر القليل، لا أن النموذج تحسّن.
    answer: 2
---

شجرة القرار الواحدة سهلة القراءة وسهلة الكسر: غيّر بضعة صفوف تدريب وستتبدّل الفروع. والعلاج حيلة إحصائية قديمة: اسأل مقدِّرات كثيرة مستقلة ومختلفة قليلًا، واجمع إجاباتها. أخطاء كلٍّ منها تتلاشى جزئيًا، وما يتبقى أكثر موثوقية من أي عضو منفرد. النماذج المبنية بهذه الطريقة هي **النماذج المجمّعة (ensembles)**، وفي البيانات الجدولية مثل بيانات الانقطاع، هي ما يلجأ إليه معظم الممارسين بعد خطوط الأساس والنموذج الخطي.

## الغابات العشوائية: أشجار كثيرة، ومتوسط

تنمّي الغابة العشوائية بضع مئات من الأشجار العميقة، كلٌّ منها على **عيّنة bootstrap** مختلفة (صفوف التدريب مسحوبة مع الإرجاع، فترى كل شجرة مجموعة بيانات مختلفة قليلًا)، ولا ترى عند كل تقسيم إلا مجموعة فرعية عشوائية من الـ features. هذه الحيلة الثانية تمنع كل الأشجار من أن تبدأ بالـ feature المهيمن نفسه، فتصبح الأشجار أكثر اختلافًا عن بعضها، وتصبح أخطاؤها أقل ترابطًا. وللتنبؤ، تأخذ الغابة متوسط احتمالات الأشجار.

## الـ Gradient Boosting: أشجار يصلح بعضها بعضًا

يسلك الـ boosting النهج المعاكس. فهو يبني أشجارًا ضحلة واحدة في كل مرة. الأولى تعطي تنبؤات تقريبية؛ والثانية تُدرَّب على الأخطاء التي تركتها الأولى؛ والثالثة على ما لا تزال الأوليان تخطئان فيه، وهكذا. ومساهمة كل شجرة تُصغَّر بمقدار `learning_rate`، فتزحف المجموعة نحو إجابة جيدة بدل أن تترنّح. والمزيد من الأشجار (`max_iter`) ومعدّل تعلّم أعلى يلائمان بيانات التدريب بدقة أكبر، ثم يقعان في النهاية في الـ overfitting.

:::figure الـ bagging يأخذ المتوسط بالتوازي؛ والـ boosting يصحّح بالتتابع
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">الصف العلوي، الغابة العشوائية: ثلاث أشجار مدرَّبة باستقلال على عيّنات مختلفة تصبّ في متوسط. الصف السفلي، الـ gradient boosting: الشجرة 1 تمرّر أخطاءها إلى الشجرة 2، التي تمرّر أخطاءها المتبقية إلى الشجرة 3، وتُجمع مخرجاتها بعد تصغيرها.</title>
  <text class="d-label-strong" x="10" y="24">الغابة العشوائية (bagging)</text>
  <rect class="d-box" x="20" y="40" width="110" height="40" rx="8"/><text class="d-label" x="75" y="65" text-anchor="middle">شجرة على العيّنة 1</text>
  <rect class="d-box" x="150" y="40" width="110" height="40" rx="8"/><text class="d-label" x="205" y="65" text-anchor="middle">شجرة على العيّنة 2</text>
  <rect class="d-box" x="280" y="40" width="110" height="40" rx="8"/><text class="d-label" x="335" y="65" text-anchor="middle">شجرة على العيّنة 3</text>
  <path class="d-arrow" d="M390 60 L480 60" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="485" y="40" width="190" height="40" rx="8"/><text class="d-label" x="580" y="65" text-anchor="middle">متوسط الأصوات</text>
  <text class="d-label-strong" x="10" y="140">Gradient boosting</text>
  <rect class="d-box" x="20" y="160" width="110" height="40" rx="8"/><text class="d-label" x="75" y="185" text-anchor="middle">الشجرة 1</text>
  <path class="d-arrow" d="M130 180 L150 180" marker-end="url(#arrow)"/>
  <rect class="d-box" x="155" y="160" width="110" height="40" rx="8"/><text class="d-label" x="210" y="185" text-anchor="middle">الشجرة 2 على الأخطاء</text>
  <path class="d-arrow" d="M265 180 L285 180" marker-end="url(#arrow)"/>
  <rect class="d-box" x="290" y="160" width="110" height="40" rx="8"/><text class="d-label" x="345" y="185" text-anchor="middle">الشجرة 3 على الأخطاء</text>
  <path class="d-arrow" d="M400 180 L480 180" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="485" y="160" width="190" height="40" rx="8"/><text class="d-label" x="580" y="185" text-anchor="middle">مجموع مصغَّر بمعدّل التعلّم</text>
  <text class="d-label-muted" x="210" y="228" text-anchor="middle">كل شجرة تعتمد على ما سبقها</text>
</svg>
:::

## كلاهما على بيانات الانقطاع، مع عودة العمود الناقص

حتى الآن استبعدت `avg_satisfaction` لأن نصف قيمه فارغة. أما `HistGradientBoostingClassifier`، وهو تطبيق الـ boosting السريع في scikit-learn، فيتعامل مع القيم المفقودة بشكل أصيل: عند كل تقسيم يتعلّم إلى أيّ جهة يجب أن تذهب الفراغات. والإصدارات الحديثة من `DecisionTreeClassifier` و`RandomForestClassifier` تقبل NaN أيضًا. أما `LogisticRegression` وk-NN فما زالا لا يقبلانها؛ ويرفعان `ValueError: Input X contains NaN`.

```python run
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share",
            "avg_satisfaction"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

no_gaps = features[:-1]  # logistic regression can't take the NaNs in avg_satisfaction
models = {
    "logistic (no satisfaction)": (make_pipeline(StandardScaler(), LogisticRegression()), no_gaps),
    "random forest": (RandomForestClassifier(n_estimators=300, min_samples_leaf=5,
                                             random_state=42), features),
    "boosting, defaults": (HistGradientBoostingClassifier(random_state=42), features),
    "boosting, gentle": (HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05,
                                                        max_iter=200, random_state=42), features),
}
for name, (model, cols) in models.items():
    model.fit(X_train[cols], y_train)
    print(f"{name:27} train {model.score(X_train[cols], y_train):.2f}  "
          f"test {model.score(X_test[cols], y_test):.2f}")
```

تبلغ الغابة 0.76 والـ boosting المضبوط بلطف 0.78، مقابل 0.72 للانحدار اللوجستي وللقاعدة. أما الـ boosting بإعداداته الافتراضية فيلائم بيانات التدريب بشكل شبه مثالي (0.99) ويؤدي أسوأ من النسخة اللطيفة: فعلى 298 صفًا، الإعدادات الافتراضية متحمّسة أكثر من اللازم. والأشجار الأضحل مع معدّل تعلّم أصغر تُبقيه تحت السيطرة.

لا تتمسّك بهذه الأرقام بشدة. فعلى بيانات اختبار من 100 عميل، النقطتان تعنيان عميلين. يضيف الدرس القادم مقياسًا لجودة الترتيب، وسيخبرك التحقق المتقاطع في القسم 4 ما إذا كانت أفضلية النماذج المجمّعة تصمد أمام خلط مختلف.

## على ماذا تعتمد الأشجار؟

توفّر الغابات `feature_importances_`، لكن هذه الأرقام تُحسب على بيانات التدريب من مقدار ما خفّضه كل feature من عدم النقاوة، وهي منحازة لصالح الـ features المتصلة ذات العتبات المحتملة الكثيرة. أما **الـ permutation importance (أهمية التبديل)** فتطرح سؤالًا أدقّ على بيانات محجوزة: إذا خلطت هذا العمود وحده، فقطعت صلته بالهدف، فكم تنخفض النتيجة؟

```python run
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share",
            "avg_satisfaction"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
forest = RandomForestClassifier(n_estimators=300, min_samples_leaf=5, random_state=42).fit(X_train, y_train)

result = permutation_importance(forest, X_test, y_test, n_repeats=10, random_state=42)
table = pd.DataFrame({"impurity (train)": forest.feature_importances_,
                      "permutation (test)": result.importances_mean}, index=features)
print(table.sort_values("permutation (test)", ascending=False).round(3))
```

تضع أهمية عدم النقاوة `tenure_days` في المرتبة الثانية. أما الـ permutation importance على بيانات الاختبار فتقول إنه لا يكاد يهمّ: لقد استخدمته الغابة لملاءمة الضجيج في بيانات التدريب. خلط حداثة آخر طلب يكلّف نحو 13 نقطة من الـ accuracy؛ وخلط الرضا لا يكلّف شيئًا (القيم السالبة الصغيرة ضجيج). والخلاصة الأمينة لـ Cartwheel: حداثة آخر طلب وعدد الطلبات هما ما يحرّك التنبؤات، واستبيان الرضا بحالته الراهنة نصف الفارغة لا يضيف شيئًا.

:::mistake تقديم أهمية عدم النقاوة على أنها "ما يسبّب الانقطاع"
أهمية عدم النقاوة تصف كيف نمّى نموذج واحد أشجاره على بيانات التدريب. وهي تضخّم الـ features المتصلة كثيرة القيم، وتوزّع الفضل اعتباطيًا بين الـ features المترابطة. حين يسألك أحد أصحاب القرار عمّا يهمّ، استخدم الـ permutation importance على بيانات محجوزة، وصُغ الإجابة مع ذلك على أنها "ما يعتمد عليه النموذج"، لا "ما يسبّب الانقطاع".
:::

:::tip خيارات افتراضية للبيانات الجدولية
بعد خطوط الأساس والانحدار اللوجستي، جرّب `HistGradientBoostingClassifier` مع `learning_rate` معتدل (0.05–0.1) وأشجار ضحلة. إنه سريع، ويتعامل مع القيم المفقودة، ويصعب التفوّق عليه في الجداول. واستخدم `RandomForestClassifier` حين تريد نموذجًا قويًا بلا ضبط يُذكر.
:::

حملتك الـ accuracy حتى هنا، لكنها تعامل العميل المنقطع الذي فاتك والإنذار الكاذب على أنهما سيئان بالقدر نفسه، وتتجاهل الترتيب الذي بنيته لفريق التسويق. الدرس القادم يستبدلها بمقاييس تنظر في كل نوع من الأخطاء على حدة.
