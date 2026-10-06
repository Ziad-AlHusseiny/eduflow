---
summary: درّب نموذج انحدار لوجستي على بيانات الانقطاع، واقرأ احتمالاته ومعاملاته، واستخدم الاحتمالات لترتيب العملاء كي يتواصل فريق التسويق مع الأكثر خطرًا أولًا.
takeaways:
  - "يحسب الانحدار اللوجستي درجة خطية ثم يضغطها عبر دالة الـ sigmoid لتصبح احتمالًا بين 0 و1."
  - "تُعيد `predict_proba` احتمالًا لكل فئة؛ وتطبّق `predict` عليه حدًّا فاصلًا عند 0.5."
  - "على features موحّدة المقاييس، كل معامل هو التغيّر في الـ log-odds لكل انحراف معياري، فتصبح إشارته وحجمه قابلين للمقارنة بين الـ features."
  - "`LogisticRegression` منظَّم افتراضيًا؛ و`C` هو مقلوب قوة العقوبة، فقيمة `C` الأصغر تعني عقوبة أقوى."
  - ترتيب العملاء بحسب الاحتمال أنفع غالبًا من label نعم/لا، لأنه يتيح للشركة أن تختار عدد العملاء الذين ستتعامل معهم.
further:
  - title: "Logistic regression"
    url: https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression
  - title: LogisticRegression
    url: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
quiz:
  - q: "الدرجة الخطية لعميل داخل نموذج انحدار لوجستي تساوي 0. ما احتمال الانقطاع الذي يعطيه النموذج؟"
    options:
      - text: "0.5، لأن sigmoid الصفر يساوي النصف بالضبط."
        why: صحيح. الدرجة 0 تعني أن الأدلة مع الانقطاع وضده متوازنة.
      - text: "0، لأن الدرجة 0 تعني عدم الانقطاع."
        why: لا يقترب الاحتمال من 0 إلا حين تذهب الدرجة بعيدًا في السالب. والصفر يقع في منتصف المنحنى.
      - text: يعتمد على الـ intercept، الذي يُضاف بعد الـ sigmoid.
        why: الـ intercept جزء من الدرجة الخطية، ويُضاف قبل الـ sigmoid. وبمجرد أن تكون الدرجة 0، يكون الناتج ثابتًا.
      - text: "1، لأن sigmoid الصفر يساوي 1."
        why: "الـ sigmoid هي `1 / (1 + e^-z)`؛ ومع z = 0 تصبح `1 / 2`."
    answer: 0
  - q: "على features انقطاع موحّدة المقاييس، معامل `days_since_last_order` هو +0.93 ومعامل `total_spent` هو -0.26. ماذا يمكنك أن تقول؟"
    options:
      - text: كل يوم إضافي منذ آخر طلب يؤثر بنحو 3.6 مرة أكثر من كل دولار إضافي من الإنفاق.
        why: المعاملات لكل انحراف معياري، لا لكل دولار أو لكل يوم، فالمقارنة لكل وحدة لا تصح.
      - text: العملاء الذين أنفقوا أكثر ينقطعون أكثر.
        why: المعامل السالب يعني أن الإنفاق الأكبر مرتبط باحتمالات انقطاع أقل، مع تثبيت الـ features الأخرى.
      - text: رفع الإنفاق عبر التسويق سيخفض الانقطاع بمقدار معروف.
        why: تصف المعاملات ارتباطات في هذه البيانات؛ ولا تخبرك بأثر أي تدخّل.
      - text: زيادة انحراف معياري واحد في مدة الغياب ترفع احتمالات الانقطاع أكثر بكثير مما تخفضها الزيادة نفسها في الإنفاق.
        why: صحيح. على مقياس مشترك، يقارن حجم المعامل بين الآثار في النموذج المدرَّب.
    answer: 3
  - q: "درّبت `LogisticRegression()` على features الانقطاع الخام فظهر تحذير `ConvergenceWarning`. ما أفضل إصلاح أول؟"
    options:
      - text: تجاهله، لأن الـ accuracy تبدو جيدة.
        why: توقّف المُحسِّن (optimiser) قبل أن ينتهي، فالمعاملات ليست تلك التي يعرّفها النموذج. أصلح السبب.
      - text: اخفض `C` إلى 0.0001 ليكون لدى النموذج ما يتعلّمه أقل.
        why: قيمة `C` الضئيلة تُخفي العَرَض بتسطيح النموذج، على حساب نموذج مختلف جدًا يعاني من الـ underfitting.
      - text: أضف `StandardScaler` قبل النموذج في pipeline.
        why: صحيح. الـ features ذات المقاييس المتباعدة جدًا تصعّب مهمة المُحسِّن؛ وتوحيد المقاييس يزيل التحذير عادةً.
    answer: 2
  - q: "يستطيع فريق التسويق الاتصال بـ 30 عميلًا هذا الأسبوع. ماذا يجب أن يعطيهم نموذجك؟"
    options:
      - text: العملاء الثلاثين أصحاب أعلى احتمال انقطاع متنبأ به.
        why: صحيح. الترتيب بحسب الاحتمال يضع الميزانية المحدودة حيث النموذج أكثر ثقة بأن الانقطاع قادم.
      - text: أيّ 30 عميلًا تصنّفهم `predict` بـ 1.
        why: قد يُصنَّف العشرات بـ 1. واختيار 30 منهم عشوائيًا يهدر الترتيب الذي حسبه النموذج أصلًا.
      - text: العملاء الثلاثين الذين احتمالهم أقرب إلى 0.5.
        why: هؤلاء هم الحالات التي يكون النموذج أقل يقينًا بشأنها، لا الأكثر ترجيحًا للانقطاع.
    answer: 0
---

أجابت الشجرة بعمق 3 من القسم 1 بـ "سينقطع" أو "سيبقى". وفريق التسويق لا يريد ذلك حقًا. لديه ميزانية لبضع عشرات من مكالمات الاسترجاع أسبوعيًا، ويريد أن يعرف بمن يتصل أولًا. هذا يتطلّب درجة ترتّب العملاء بحسب الخطر، والنموذج الكلاسيكي لذلك هو الانحدار اللوجستي (logistic regression).

## من خط إلى احتمال

يبدأ الانحدار اللوجستي كالانحدار الخطي: اضرب كل feature في معامل، واجمع النتائج، وأضف intercept. هذا يعطيك درجة `z` قد تكون أي رقم. ثم يضغط الدرجة عبر دالة **الـ sigmoid**، أي `1 / (1 + e^-z)`، التي تحوّل أي رقم إلى قيمة بين 0 و1. الدرجات الموجبة الكبيرة تعطي احتمالات قرب 1، والسالبة الكبيرة قرب 0، والدرجة 0 بالضبط تعطي 0.5.

:::figure الـ sigmoid تحوّل الدرجة إلى احتمال
<svg viewBox="0 0 640 260" role="img" aria-labelledby="t1">
  <title id="t1">منحنى على شكل حرف S. المحور الأفقي هو الدرجة الخطية z من سالب 6 إلى موجب 6؛ والمحور العمودي هو الاحتمال من 0 إلى 1. يمرّ المنحنى بـ 0.5 عند z تساوي 0 ويتسطّح نحو 0 و1 عند الطرفين.</title>
  <line class="d-line" x1="40" y1="220" x2="600" y2="220"/>
  <line class="d-line" x1="320" y1="20" x2="320" y2="225"/>
  <line class="d-dashed d-line" x1="40" y1="40" x2="600" y2="40"/>
  <line class="d-dashed d-line" x1="40" y1="130" x2="600" y2="130"/>
  <text class="d-label-muted" x="606" y="44">1.0</text>
  <text class="d-label-muted" x="606" y="134">0.5</text>
  <text class="d-label-muted" x="606" y="224">0.0</text>
  <text class="d-label-muted" x="40" y="244">z = −6</text>
  <text class="d-label-muted" x="320" y="244" text-anchor="middle">0</text>
  <text class="d-label-muted" x="600" y="244" text-anchor="end">+6</text>
  <path class="d-arrow" d="M40 219.6 C200 219 250 200 320 130 C390 60 440 41 600 40.4" fill="none"/>
  <circle class="d-dot" cx="320" cy="130" r="6"/>
  <text class="d-label" x="80" y="200">غالبًا سيبقى</text>
  <text class="d-label" x="470" y="70">غالبًا سينقطع</text>
</svg>
:::

أثناء التدريب، يعدّل النموذج المعاملات بحيث ينال المنقطعون احتمالات عالية وغير المنقطعين احتمالات منخفضة. ودالة الخسارة التي يصغّرها هي **الـ log loss**، التي تعاقب الإجابات الخاطئة الواثقة بشدة: التنبؤ بـ 0.99 لعميل بقي يكلّف أكثر بكثير من التنبؤ بـ 0.6. لا توجد معادلة دقيقة للقاع، فيجده scikit-learn بمُحسِّن تكراري، وهو قريب مهذَّب للـ gradient descent الذي كتبته في القسم السابق.

## تدريبه على بيانات الانقطاع

لأن المُحسِّن تكراري وللنموذج عقوبة (المزيد عن ذلك أدناه)، وحّد مقاييس الـ features أولًا. والـ pipeline يُبقي الـ scaler والنموذج معًا.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
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
print("test accuracy:", model.score(X_test, y_test))
print(model.predict_proba(X_test)[:4].round(2))
print(model.predict(X_test)[:4])
```

تُعيد `predict_proba` عمودين، واحدًا لكل فئة بترتيب `classes_`: احتمال البقاء، واحتمال الانقطاع. ومجموعهما 1. أما `predict` فاختصار يصنّف الصف بـ 1 حين يكون احتمال الانقطاع 0.5 على الأقل. وهذه الـ 0.5 قيمة افتراضية، لا قانون، وآخر درس في القسم 3 يدور حول اختيارها عن قصد.

الـ accuracy تبلغ 0.72، أي بمستوى قاعدة الـ 80 يومًا. لا تتوقف عن القراءة هنا: فالاحتمالات تحمل معلومات ترميها الـ accuracy.

## قراءة المعاملات

مع features موحّدة المقاييس، يقول كل معامل كم يحرّك انحرافٌ معياري واحد من ذلك الـ feature الدرجةَ `z` (أي الـ log-odds للانقطاع). وهذا يجعلها قابلة للمقارنة بين الـ features.

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
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

coefs = pd.Series(model[-1].coef_[0], index=features).sort_values()
print(coefs.round(2))

ranked = X_test.assign(churn_prob=model.predict_proba(X_test)[:, 1], churned=y_test)
top10 = ranked.sort_values("churn_prob", ascending=False).head(10)
print(top10[["days_since_last_order", "orders", "churn_prob", "churned"]].round(2))
print("share of the top 10 who really churned:", top10["churned"].mean())
```

حداثة آخر طلب (`days_since_last_order`، +0.93) هي المهيمنة، وهذا يطابق ما أخبرتك به قاعدة خط الأساس. ومدة العضوية الأطول تدفع أيضًا نحو الانقطاع، بينما تدفع الطلبات الأكثر والإنفاق الأكبر واستخدام القسائم، بل وتذاكر الدعم الأكثر، بعيدًا عنه. فالعملاء الذين يتواصلون مع الدعم عملاء متفاعلون؛ والصامتون هم من يرحلون. هذا هو نوع الاستنتاجات الذي يستحق أن تعود به إلى أصحاب القرار في الشركة، مع التنبيه إلى أنه ارتباط وليس سببية.

ثم تأتي الثمرة: من بين العشرة الذين يصنّفهم النموذج الأكثر خطرًا، انقطع تسعة فعلًا. قاعدة نعم/لا لا تستطيع إنتاج هذه القائمة؛ أما الاحتمال فيستطيع.

:::mistake تخطّي الـ scaler
درّب `LogisticRegression()` على الـ features الخام وستحصل على `ConvergenceWarning`: بلغ المُحسِّن حدّ التكرارات قبل أن ينتهي، لأن `total_spent` بالآلاف و`used_coupon` بقيم 0/1 يجعلان سطح الخسارة واديًا طويلًا ضيقًا. والمعاملات التي تحصل عليها غير مكتملة. وحّد المقاييس أولًا؛ فهذا يجعل العقوبة أيضًا تعامل الـ features كلها بعدل.
:::

## العقوبة التي لم تطلبها

`LogisticRegression` منظَّم افتراضيًا بعقوبة L2، وهي الفكرة نفسها في Ridge. تُحدَّد قوّتها بـ `C`، وهو **مقلوب** `alpha` في Ridge: قيمة `C` الصغيرة تعني عقوبة قوية، والكبيرة تعني عقوبة ضعيفة. والقيمة الافتراضية `C=1.0` بداية معقولة. على هذه البيانات، تقع القيم من 0.01 إلى 100 كلها في حدود نقطتين من بعضها، وهذه علامة على أن ثمانية features حسنة السلوك لا تمنح النموذج مجالًا كبيرًا للـ overfitting. أما مع مئات الـ features، فتصبح `C` مهمة جدًا، وستضبطها بالأدوات التي في القسم 4.

:::tip متى يكون الانحدار اللوجستي النموذج الأول الصحيح
إنه سريع، واحتمالاته معقولة عادةً دون أي تعديل، ومعاملاته يمكن شرحها لمدير. اجعله أول نموذج حقيقي في أي مسألة تصنيف على بيانات جدولية، مباشرة بعد خطوط الأساس. وعلى النماذج الأكثر مرونة أن تتفوّق عليه لتستحق مكانها.
:::

يرسم الانحدار اللوجستي حدًّا مستقيمًا واحدًا عبر فضاء الـ features. أما نموذج الدرس القادم فلا يفترض شيئًا كهذا: إنه يطرح سلسلة من أسئلة نعم/لا ويستطيع تقطيع الفضاء إلى صناديق.
