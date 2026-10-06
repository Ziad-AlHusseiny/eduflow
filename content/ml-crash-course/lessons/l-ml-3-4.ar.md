---
summary: اقرأ مصفوفة الالتباس، واحسب الـ precision والـ recall والـ F1 والـ ROC AUC باستخدام scikit-learn، واختر المقياس الذي يطابق كلفة كل نوع من الأخطاء على الشركة.
takeaways:
  - "تعدّ مصفوفة الالتباس (confusion matrix) السلبيات الصحيحة والإيجابيات الكاذبة والسلبيات الكاذبة والإيجابيات الصحيحة؛ وفي scikit-learn تمثّل الصفوفُ الفئاتِ الفعلية والأعمدةُ الفئاتِ المتنبأ بها."
  - "الـ precision هي نسبة الحالات المُعلَّمة التي هي حقيقية؛ والـ recall هي نسبة الحالات الحقيقية التي عُلِّمت."
  - "الـ F1 هو المتوسط التوافقي للـ precision والـ recall، ومفيد حين تحتاج إلى رقم واحد يعاقب إهمال أيٍّ منهما."
  - "يقيس الـ ROC AUC جودة الترتيب عبر كل العتبات: أي احتمال أن ينال مثال إيجابي عشوائي درجة أعلى من مثال سلبي عشوائي."
  - "تحقّق دائمًا من الفئة الإيجابية: في `load_breast_cancer` الورم الخبيث هو 0، فالـ recall للخبيث يحتاج إلى `pos_label=0`."
further:
  - title: "Classification metrics"
    url: https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics
  - title: confusion_matrix
    url: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html
  - title: roc_auc_score
    url: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html
quiz:
  - q: "تُعيد `confusion_matrix(y_test, pred)` القيمة `[[35, 10], [18, 37]]` لبيانات الانقطاع (1 = منقطع). كم عميلًا منقطعًا فات النموذج؟"
    options:
      - text: "10"
        why: هذه الخانة العلوية اليمنى، أي عملاء بقوا لكنهم عُلِّموا كمنقطعين (إيجابيات كاذبة).
      - text: "35"
        why: هذه الخانة العلوية اليسرى، أي عملاء بقوا وتنبّأ النموذج ببقائهم بشكل صحيح.
      - text: "37"
        why: هذه الخانة السفلية اليمنى، أي المنقطعون الذين التقطهم النموذج.
      - text: "18"
        why: صحيح. الصف 1 هو المنقطعون فعليًا؛ والعمود 0 هو "متنبأ ببقائهم". هؤلاء الـ 18 سلبيات كاذبة.
    answer: 3
  - q: "كل عرض استرجاع يكلّف 40 دولارًا، لذا لا يريد فريق التسويق التواصل إلا مع العملاء المرجّح جدًا انقطاعهم. أيّ مقياس يجب أن تراقبه عن كثب؟"
    options:
      - text: الـ precision، لأنها تقيس كم من العملاء الذين تواصلنا معهم كانوا منقطعين فعلًا.
        why: صحيح. كل إيجابية كاذبة تعني 40 دولارًا أُنفقت على عميل كان سيبقى على أي حال.
      - text: الـ recall، لأنها تعدّ كم منقطعًا تصل إليه.
        why: الـ recall تكافئ التواصل مع عدد أكبر من الناس، وهذا بالضبط ما يحاجج العرض المكلف ضده.
      - text: الـ accuracy، لأنها توازن بين نوعي الخطأ.
        why: تزن الـ accuracy الخطأين بالتساوي، لكن الإيجابيات الكاذبة هنا تكلّف مالًا والسلبيات الكاذبة لا تكلّف شيئًا إضافيًا.
    answer: 0
  - q: "للنموذج A قيمة ROC AUC تساوي 0.81 وللنموذج B قيمة 0.77، لكن كليهما يحقق accuracy بقيمة 0.72 عند العتبة الافتراضية. ماذا يخبرك ذلك؟"
    options:
      - text: فرق الـ AUC لا بد أنه خطأ حسابي، ما دامت الـ accuracy متساوية.
        why: المقياسان يقيسان أشياء مختلفة. الـ accuracy تنظر إلى عتبة واحدة؛ والـ AUC تنظر إلى الترتيب كله.
      - text: B أفضل لأنه يبلغ الـ accuracy نفسها بترتيب أضعف.
        why: الترتيب الأضعف عيب؛ فهو يعني أن درجات B تفصل المنقطعين عن الباقين بشكل أسوأ.
      - text: A يرتّب العملاء أفضل، فسيعطي قائمة اتصالات أفضل في معظم أحجام القوائم.
        why: صحيح. تلخّص الـ AUC جودة الترتيب، وعليها تعتمد قائمة أفضل N.
    answer: 2
  - q: "نموذج على `load_breast_cancer` يُبلغ أن `recall_score(y_test, pred) = 0.99`. لماذا قد يضلّل هذا الرقمُ الطبيبَ؟"
    options:
      - text: لأن الـ recall لا يمكن أن تتجاوز 0.95 على البيانات الطبية، فهذا خطأ برمجي.
        why: لا يوجد سقف كهذا؛ فهذه البيانات سهلة الفصل حقًا.
      - text: لأن الـ label 1 هنا يعني حميدًا، فهذه recall للأورام الحميدة، لا الخبيثة التي يهتم بها الطبيب.
        why: صحيح. مرّر `pos_label=0` (أو اقرأ التقرير لكل فئة) لتحصل على الـ recall للخبيث.
      - text: لأن الـ recall تتجاهل السلبيات الكاذبة، وهي ما يهمّ في الطب.
        why: الـ recall مبنية على السلبيات الكاذبة؛ والمشكلة في الفئة التي تُحسب لها.
    answer: 1
---

يحقق كلٌّ من الانحدار اللوجستي وقاعدة الـ 80 يومًا accuracy بقيمة 0.72 على بيانات اختبار الانقطاع. فهل هما جيدان بالقدر نفسه؟ الـ accuracy تقول نعم. وفريق التسويق سيخالف ذلك فور أن يرى من يُعلِّمه كلٌّ منهما. فالـ accuracy تمزج خطأين مختلفين جدًا في رقم واحد، وترمي الترتيب الذي جعل قائمة الاتصالات مفيدة. هذا الدرس يفكّكهما.

## أربع نتائج

كل تنبؤ في مسألة نعم/لا يقع في واحدة من أربع خانات. سمِّ المنقطعين **إيجابيات (positives)** (فهم الفئة التي تحاول العثور عليها).

- **إيجابي صحيح (TP)**: تنبأنا بالانقطاع، وانقطع فعلًا. وصل التسويق إلى الشخص الصحيح.
- **إيجابي كاذب (FP)**: تنبأنا بالانقطاع، وبقي. عرض أُهدر على عميل وفيّ.
- **سلبي كاذب (FN)**: تنبأنا بالبقاء، وانقطع. عميل خسرناه دون محاولة.
- **سلبي صحيح (TN)**: تنبأنا بالبقاء، وبقي. تُرك وشأنه عن صواب.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)
pred = model.predict(X_test)
rule = (X_test["days_since_last_order"] > 80).astype(int)

print("model:\n", confusion_matrix(y_test, pred))
print("rule:\n", confusion_matrix(y_test, rule))
```

يرتّب scikit-learn المصفوفة بحيث تكون الفئات الفعلية صفوفًا والفئات المتنبأ بها أعمدة، وكلاهما بترتيب تصاعدي (0 ثم 1). لذا تُقرأ مصفوفة النموذج `[[35, 10], [18, 37]]` هكذا:

:::figure مصفوفة الالتباس للانحدار اللوجستي على 100 عميل اختبار
<svg viewBox="0 0 560 280" role="img" aria-labelledby="t1">
  <title id="t1">شبكة اثنين في اثنين. بقي فعلًا وتُنبّئ ببقائه: 35 سلبيًا صحيحًا. بقي فعلًا وتُنبّئ بانقطاعه: 10 إيجابيات كاذبة. انقطع فعلًا وتُنبّئ ببقائه: 18 سلبيًا كاذبًا. انقطع فعلًا وتُنبّئ بانقطاعه: 37 إيجابيًا صحيحًا.</title>
  <text class="d-label-strong" x="330" y="24" text-anchor="middle">المتنبأ به</text>
  <text class="d-label" x="250" y="50" text-anchor="middle">بقاء (0)</text>
  <text class="d-label" x="420" y="50" text-anchor="middle">انقطاع (1)</text>
  <text class="d-label-strong" x="40" y="170" text-anchor="middle" transform="rotate(-90 40 170)">الفعلي</text>
  <text class="d-label" x="150" y="115" text-anchor="end">بقي (0)</text>
  <text class="d-label" x="150" y="215" text-anchor="end">انقطع (1)</text>
  <rect class="d-box-success" x="170" y="64" width="160" height="90" rx="8"/>
  <text class="d-label-strong" x="250" y="105" text-anchor="middle">35</text>
  <text class="d-label" x="250" y="130" text-anchor="middle">سلبيات صحيحة</text>
  <rect class="d-box-warn" x="340" y="64" width="160" height="90" rx="8"/>
  <text class="d-label-strong" x="420" y="105" text-anchor="middle">10</text>
  <text class="d-label" x="420" y="130" text-anchor="middle">إيجابيات كاذبة</text>
  <rect class="d-box-warn" x="170" y="164" width="160" height="90" rx="8"/>
  <text class="d-label-strong" x="250" y="205" text-anchor="middle">18</text>
  <text class="d-label" x="250" y="230" text-anchor="middle">سلبيات كاذبة</text>
  <rect class="d-box-success" x="340" y="164" width="160" height="90" rx="8"/>
  <text class="d-label-strong" x="420" y="205" text-anchor="middle">37</text>
  <text class="d-label" x="420" y="230" text-anchor="middle">إيجابيات صحيحة</text>
</svg>
:::

مصفوفة القاعدة هي `[[31, 14], [14, 41]]`. التنبؤات الصحيحة نفسها، 72، لكن الأخطاء مختلفة: النموذج يهدر عروضًا أقل (10 مقابل 14) ويفوّت منقطعين أكثر (18 مقابل 14). أيّهما أفضل يعتمد على كلفة كل خطأ، والـ accuracy لا تستطيع أن تخبرك بذلك.

## الـ Precision والـ Recall والـ F1

نسبتان تحوّلان المصفوفة إلى أسئلة يطرحها المدير:

- **الـ Precision** = TP / (TP + FP): من بين العملاء الذين علّمناهم، كم منهم كان راحلًا فعلًا؟ النموذج: 37 / 47 = 0.79. القاعدة: 0.75.
- **الـ Recall** = TP / (TP + FN): من بين العملاء الذين رحلوا، كم منهم علّمنا؟ النموذج: 37 / 55 = 0.67. القاعدة: 0.75.

بينهما توتّر مدمج. علّم أشخاصًا أكثر فترتفع الـ recall بينما تنخفض الـ precision عادةً؛ وعلّم عددًا أقل فيحدث العكس. أما **الـ F1** فهو المتوسط التوافقي للاثنين، `2 * P * R / (P + R)`. ولا يكون مرتفعًا إلا إذا كانا مرتفعين معًا، فلا يستطيع النموذج التلاعب به بتعظيم أحدهما. استخدمه حين تحتاج إلى رقم واحد ويكون للخطأين وزن متقارب.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)

print(classification_report(y_test, model.predict(X_test), target_names=["stayed", "churned"]))
print("model ROC AUC:", round(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]), 3))
print("rule  ROC AUC:", round(roc_auc_score(y_test, X_test["days_since_last_order"]), 3))
```

تطبع `classification_report` الـ precision والـ recall والـ F1 لكل فئة، مع الـ support (عدد الحالات الحقيقية). اقرأ صف "churned" للسؤال العملي؛ أما صف "stayed" فهو التحليل نفسه مع تبادل الأدوار.

## الـ ROC AUC: تقييم الترتيب

تعتمد الـ precision والـ recall على الحدّ الفاصل 0.5. أما **الـ ROC AUC** فلا تستخدم حدًّا فاصلًا إطلاقًا. إنها تسأل: إذا اخترت منقطعًا واحدًا وباقيًا واحدًا عشوائيًا، فكم مرة يعطي النموذج المنقطعَ الدرجةَ الأعلى؟ القيمة 0.5 تعني أن الدرجات ليست أفضل من رمي عملة؛ و1.0 تعني أن كل منقطع يتقدّم على كل باقٍ.

تأخذ `roc_auc_score` درجات، لا labels: مرّر `predict_proba(...)[:, 1]`. وأي درجة ترتّب العملاء تصلح، فيمكنك تقييم القاعدة بالقيمة الخام لـ `days_since_last_order`. تحصل القاعدة على 0.77؛ ويحصل الانحدار اللوجستي على 0.81. هذه الفجوة هي الفرق الحقيقي بينهما، وقد أخفاه تعادل الـ accuracy: ترتيب النموذج أفضل بشكل ملموس، ولهذا كانت قائمة العشرة الأعلى خطرًا في [درس الانحدار اللوجستي](lesson:l-ml-3-1) دقيقة إلى هذا الحد.

:::mistake الجهل بأيّ فئة هي "الإيجابية"
تعامل `precision_score` و`recall_score` الـ label 1 على أنه الإيجابي ما لم تقل غير ذلك. في `load_breast_cancer`، 0 يعني خبيثًا و1 يعني حميدًا، فالـ recall المُبلَغ عنها بقيمة 0.99 هي recall للأورام **الحميدة**. وللفئة التي يهتم بها الطبيب، مرّر `pos_label=0` أو اقرأ صف الخبيث في `classification_report`. تحقّق من `target_names` قبل اقتباس أي مقياس خاص بفئة.
:::

## اختيار المقياس

ابدأ من كلفة كل خطأ، ثم اختر:

| الموقف | راقب | السبب |
|---|---|---|
| تفويت حالة مكلف (فحص السرطان، الاحتيال) | الـ Recall | كل سلبي كاذب هو الخطأ المكلف |
| التصرّف بشأن حالة مكلف (عروض غالية، حظر حسابات) | الـ Precision | كل إيجابي كاذب يهدر مالًا أو ثقة |
| ستتصرّف بشأن أفضل N بحسب الدرجة | الـ ROC AUC، أو نسبة الإصابة في أفضل N | جودة الترتيب هي ما يهم |
| الخطآن مهمان، والمطلوب رقم واحد | الـ F1 | يعاقب إهمال أيٍّ منهما |

:::tip اعرض زوجًا من الأرقام، لا نتيجة واحدة
"precision بقيمة 0.79 وrecall بقيمة 0.67 عند العتبة الافتراضية، وROC AUC بقيمة 0.81" تخبر صاحب القرار بما يفعله النموذج وتترك مجالًا للحديث عن المفاضلات. أما رقم F1 أو accuracy وحيد فينهي الحديث مبكرًا جدًا.
:::

تحرّكت الـ precision والـ recall في اتجاهين متعاكسين بين النموذج والقاعدة لأنهما يستخدمان فعليًا حدّين فاصلين مختلفين. ويمكنك أن تحرّك هذا الحدّ بنفسك، عن قصد، وهذا موضوع الدرس القادم.
