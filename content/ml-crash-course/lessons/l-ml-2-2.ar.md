---
summary: اكتب الـ gradient descent بيدك في NumPy لتدريب خط مستقيم، وشاهد كيف يجعله معدّل التعلّم يزحف أو يتقارب أو ينفجر، واشرح لماذا يجب توحيد مقاييس الـ features.
takeaways:
  - تدريب النموذج يعني البحث عن قيم المعاملات التي تجعل دالة الخسارة أصغر ما يمكن.
  - "يكرّر الـ gradient descent خطوة واحدة: احسب ميل دالة الخسارة لكل معامل، ثم حرّك كل معامل قليلًا في اتجاه النزول."
  - "يحدّد معدّل التعلّم (learning rate) حجم الخطوة: الصغير جدًا يزحف، والكبير جدًا يتجاوز الهدف ويتباعد."
  - "الـ features ذات المقاييس المتباعدة جدًا تمطّ سطح دالة الخسارة، فتبطّئ الـ gradient descent وتشوّه النماذج المعتمدة على المسافة مثل k-NN."
  - "يتعلّم `StandardScaler` متوسط كل عمود وانحرافه المعياري من بيانات التدريب، ثم يعيد المعايرة إلى متوسط 0 وانحراف معياري 1."
further:
  - title: StandardScaler
    url: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html
  - title: "Stochastic Gradient Descent"
    url: https://scikit-learn.org/stable/modules/sgd.html
  - title: "Importance of feature scaling"
    url: https://scikit-learn.org/stable/auto_examples/preprocessing/plot_scaling_importance.html
quiz:
  - q: "أثناء الـ gradient descent، كان تدرّج دالة الخسارة بالنسبة إلى `w` موجبًا. ماذا يفعل التحديث بـ `w`؟"
    options:
      - text: يزيد `w`، لأن التدرّج الموجب يعني أن `w` يجب أن تكبر.
        why: التدرّج الموجب يعني أن الخسارة ترتفع حين تكبر `w`. والتحرّك معه صعود إلى أعلى.
      - text: ينقص `w`، لأن التحديث يطرح حاصل ضرب معدّل التعلّم في التدرّج.
        why: صحيح. التحرّك عكس التدرّج هو ما يجعل الخسارة تنخفض.
      - text: يُبقي `w` كما هي حتى يصبح التدرّج صفرًا.
        why: التدرّج غير الصفري هو بالضبط إشارة التحرّك. ولا يكون صفرًا إلا عند القاع.
    answer: 1
  - q: "ضاعفت معدّل التعلّم فصارت الخسارة المطبوعة 3,900 ← 12,000 ← 95,000 ← 2,000,000. ماذا حدث؟"
    options:
      - text: وجد النموذج قاعًا أفضل في مكان أبعد.
        why: القاع الأفضل سيُظهر خسارة أقل، لا خسارة تنفجر.
      - text: في البيانات قيم شاذة كشفها المعدّل الأكبر.
        why: القيم الشاذة لا تجعل الخسارة تكبر بلا حدود خطوة بعد خطوة. أما تجاوز القاع فيفعل.
      - text: كل خطوة تتجاوز القاع بأكثر من سابقتها، فيتباعد البحث.
        why: صحيح. اخفض معدّل التعلّم (أو وحّد مقاييس الـ features) حتى تنخفض الخسارة باطّراد.
    answer: 2
  - q: "أين يجب أن تدرّب الـ `StandardScaler`؟"
    options:
      - text: على بيانات التدريب وحدها، ثم استخدمه لتحويل بيانات التدريب والاختبار معًا.
        why: صحيح. يجب أن تُعامَل بيانات الاختبار كبيانات المستقبل، التي لا تستطيع رؤيتها حين تدرّب الـ scaler.
      - text: على البيانات كاملة قبل التقسيم، ليستخدم الجزآن المتوسط والانحراف المعياري نفسيهما.
        why: هذا يسمح لإحصاءات بيانات الاختبار بالتأثير في المعالجة المسبقة، وهو تسرّب صغير يجعل النتائج متفائلة. والـ pipelines في القسم 4 تمنعه.
      - text: على بيانات التدريب والاختبار كلٍّ على حدة، ليكون متوسط كل جزء 0.
        why: عندها تتحوّل القيمة الخام نفسها إلى قيم معايَرة مختلفة في كل جزء، ويرى النموذج مدخلات غير متّسقة.
    answer: 0
  - q: "أيّ نموذج تتغيّر تنبؤاته حين تعيد التعبير عن `total_spent` بالسنتات بدل الدولارات؟"
    options:
      - text: شجرة القرار، لأن عتباتها بالدولار.
        why: الشجرة ستتعلّم ببساطة عتبات بالسنتات. وترتيب القيم، وهو كل ما يستخدمه التقسيم، لا يتغيّر.
      - text: أقرب k جيران، لأن المسافات ستصبح خاضعة لهيمنة `total_spent`.
        why: صحيح. النماذج المعتمدة على المسافة تعامل مدى أكبر بمئة مرة على أنه أهم بمئة مرة.
      - text: الانحدار الخطي العادي، لأن معامله يتغيّر.
        why: يصغر المعامل مئة مرة ليعوّض، وتبقى التنبؤات متطابقة. المقياس مهم للنماذج ذات الـ regularization، لا للمربعات الصغرى العادية.
    answer: 1
---

أعاد `LinearRegression().fit` أفضل خط فورًا، دون أي بحث ظاهر. فللخط المستقيم معادلة دقيقة، وهذا منصف. لكن معظم النماذج (الانحدار اللوجستي، والشبكات العصبية، والـ gradient boosting الذي ستتعرّف عليه في القسم 3) ليس لها معادلة. إنها تجد معاملاتها بالبحث، وتكاد كلها تستخدم شكلًا ما من البحث نفسه: الـ gradient descent (النزول بالتدرّج).

## التعلّم نزولًا على المنحدر

خذ النموذج المعتمد على مؤشر كتلة الجسم وحده من الدرس السابق: `prediction = w * x + b`. لأي زوج من `w` و`b` يمكنك حساب متوسط الخطأ المربّع على بيانات التدريب. تخيّل كل قيمة ممكنة لـ `w` مرتّبةً من اليسار إلى اليمين، والخسارة المقابلة لكل منها ارتفاعًا. في الخط المستقيم مع الخطأ المربّع، تكون هذه الصورة وعاءً أملس، وأفضل `w` تقع في قاعه.

لا يمكنك رؤية الوعاء، لكن في أي نقطة يمكنك حساب ميله: **التدرّج (gradient)**. إذا كان الميل موجبًا، فزيادة `w` تجعل الأمور أسوأ، فأنقصها. وإذا كان سالبًا، فزِدها. خذ خطوة صغيرة عكس الميل، وأعد الحساب، وكرّر. هذا هو **الـ gradient descent**.

:::figure يأخذ الـ gradient descent خطوات نزولًا على منحنى الخسارة
<svg viewBox="0 0 680 270" role="img" aria-labelledby="t1">
  <title id="t1">منحنى خسارة على شكل حرف U فوق المعامل w. نقاط تحدّد الخطوات المتتالية من أعلى اليسار نزولًا نحو القاع، وكل خطوة أقصر من سابقتها مع تسطّح الميل.</title>
  <line class="d-line" x1="40" y1="240" x2="640" y2="240"/>
  <text class="d-label-muted" x="620" y="262">w</text>
  <text class="d-label-muted" x="46" y="30">الخسارة</text>
  <path class="d-line" d="M80 30 Q340 450 600 30" fill="none"/>
  <circle class="d-dot" cx="110" cy="76" r="7"/>
  <circle class="d-dot" cx="190" cy="170" r="7"/>
  <circle class="d-dot" cx="250" cy="215" r="7"/>
  <circle class="d-dot" cx="295" cy="234" r="7"/>
  <circle class="d-dot" cx="325" cy="239" r="7"/>
  <path class="d-arrow" d="M118 84 L180 160" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M200 177 L240 208" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M260 220 L285 230" marker-end="url(#arrow)"/>
  <text class="d-label" x="140" y="60">ميل كبير، خطوة كبيرة</text>
  <text class="d-label" x="360" y="200">مسطّح عند القاع</text>
</svg>
:::

تصغر الخطوات من تلقاء نفسها كلما اقتربت من القاع، لأن الميل يصبح أكثر تسطّحًا. وحجم كل خطوة هو التدرّج مضروبًا في **معدّل التعلّم (learning rate)**، وهو hyperparameter تختاره أنت.

## الـ gradient descent في ثمانية أسطر

مع الخطأ المربّع، للتدرّجات معادلات قصيرة: الميل بالنسبة إلى `w` هو `2 * mean(error * x)` وبالنسبة إلى `b` هو `2 * mean(error)`، حيث `error = prediction - actual`. إليك ذلك في NumPy، بعد توحيد مقياس مؤشر كتلة الجسم إلى متوسط 0 وانحراف معياري 1 أولًا (سترى السبب بعد قليل).

```python run
import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
x = ((X_train["bmi"] - X_train["bmi"].mean()) / X_train["bmi"].std(ddof=0)).to_numpy()
target = y_train.to_numpy()

w, b, learning_rate = 0.0, 0.0, 0.1
for step in range(101):
    error = (w * x + b) - target
    if step % 25 == 0:
        print(f"step {step:3}  loss {np.mean(error ** 2):9.1f}  w {w:6.2f}  b {b:7.2f}")
    w -= learning_rate * 2 * np.mean(error * x)
    b -= learning_rate * 2 * np.mean(error)

exact = LinearRegression().fit(x.reshape(-1, 1), target)
print("LinearRegression:", exact.coef_.round(2), round(exact.intercept_, 2))
```

تنخفض الخسارة من نحو 29,900 إلى 3,931 خلال 25 خطوة ثم تتوقف عن الحركة. وقيمتا `w` و`b` اللتان تستقر عندهما تطابقان `LinearRegression` حتى منزلتين عشريتين. لقد درّبت نموذجًا بيدك.

## معدّل التعلّم يحسم كل شيء

غيّر `learning_rate` وأعد التشغيل. مع `0.01`، لا تبلغ مئة خطوة إلا `w ≈ 40` و`b ≈ 134`: البحث يزحف. ومع `0.5`، يصل في خطوة واحدة. ومع `1.05`، تتجاوز كل خطوة القاع بأكثر من سابقتها، وبعد مئة خطوة تصبح الخسارة بالتريليونات. هذا هو **التباعد (divergence)**، وحين ترى خسارة تكبر بدل أن تصغر، فمعدّل التعلّم الكبير جدًا هو المشتبه الأول.

:::mistake لوم النموذج حين تنفجر الخسارة
الخسارة التي ترتفع مع كل خطوة، أو تتحوّل إلى `nan`، نادرًا ما تعني أن النموذج غير مناسب للبيانات. بل تعني غالبًا أن معدّل التعلّم كبير جدًا بالنسبة إلى مقياس الـ features. اخفض المعدّل عشر مرات، أو وحّد مقاييس الـ features، قبل أن تغيّر أي شيء آخر.
:::

## لماذا نوحّد مقاييس الـ features

الجداول الحقيقية تخلط المقاييس. في بيانات الانقطاع، يصل `total_spent` إلى الآلاف بينما `used_coupon` إما 0 أو 1. ومع اثنين من الـ features كهذين، لم يعد سطح الخسارة وعاءً مستديرًا بل واديًا طويلًا ضيقًا. ومعدّل التعلّم الصغير بما يكفي للبقاء مستقرًا في الاتجاه الشديد الانحدار يكون بطيئًا على نحو مؤلم في الاتجاه المسطّح، فيتعرّج المسار عبر الوادي.

والمقياس يؤثر أيضًا في نماذج لا تستخدم التدرّجات إطلاقًا. فأقرب k جيران يقيس المسافة بين العملاء، وفرق 300 دولار في الإنفاق يطغى على فرق أربع تذاكر دعم. وتوحيد كل عمود إلى متوسط 0 وانحراف معياري 1 يضعها جميعًا على قدم المساواة.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

scaler = StandardScaler().fit(X_train)          # learn means and stds from TRAIN only
X_train_s, X_test_s = scaler.transform(X_train), scaler.transform(X_test)
print("learned means:", scaler.mean_[:3].round(1))

raw = KNeighborsClassifier().fit(X_train, y_train).score(X_test, y_test)
scaled = KNeighborsClassifier().fit(X_train_s, y_train).score(X_test_s, y_test)
print(f"k-NN raw {raw:.2f}  scaled {scaled:.2f}")
```

توحيد المقاييس وحده يرفع k-NN من 0.72 إلى 0.75، متجاوزًا قاعدة الـ 80 يومًا من القسم 1. النموذج نفسه والبيانات نفسها؛ والتغيير الوحيد أن كل feature صار له صوت عادل.

الـ scaler أيضًا estimator. له `fit` (تعلّم متوسط كل عمود وانحرافه المعياري) و`transform` (تطبيقهما)، وتسري عليه القاعدة نفسها التي تسري على النماذج: درّبه على بيانات التدريب وحدها. والتنقّل بين `X_train_s` و`X_test_s` يدويًا يصبح عرضة للأخطاء، لذا يجمع القسم 4 الـ scaler والنموذج في كائن pipeline واحد.

:::note ليست كل النماذج تهتم
أشجار القرار والنماذج المجمّعة المبنية منها تقسم البيانات على feature واحد في كل مرة، مستخدمة ترتيب القيم فقط، لذا لا يغيّر توحيد المقاييس تنبؤاتها. والمربعات الصغرى العادية تعدّل معاملاتها لتعوّض. توحيد المقاييس مهم للنماذج المدرَّبة بالتدرّج، والنماذج المعتمدة على المسافة، وأي نموذج فيه عقوبة على حجم المعاملات، وهذا بالضبط ما يضيفه آخر درس في هذا القسم.
:::

سيجد الـ gradient descent أفضل خط، لكن "الأفضل على بيانات التدريب" قد يكون فخًّا حين يكون النموذج مرنًا. في الدرس القادم يصبح الخط منحنيًا، وسترى كيف ينحني أكثر مما يجب.
