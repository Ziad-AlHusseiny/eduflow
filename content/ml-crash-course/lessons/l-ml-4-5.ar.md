---
summary: حوّل المعرفة بمجال العمل إلى معدّلات ونِسب وتحويلات لوغاريتمية، وضعها في FunctionTransformer داخل الـ pipeline، واحتفظ فقط بالـ features التي تتجاوز ضجيج التحقق المتقاطع.
takeaways:
  - "الـ features الجيدة تعبّر عمّا ينظر إليه الخبير: معدّلات لكل وحدة زمن، ونِسب بين أعمدة مترابطة، وعلامات لحالات ذات معنى."
  - "تقسم الأشجار على عمود واحد في كل مرة، فهي الأكثر استفادة من features النِّسب التي تجمع الأعمدة؛ أما النماذج الخطية فتستفيد من تحويلات مثل اللوغاريتم التي تقوّم العلاقات."
  - "ضع كود الـ features في `FunctionTransformer` داخل الـ pipeline، كي يحسب التدريب والتحقق المتقاطع وبيئة الإنتاج الـ features بالطريقة نفسها تمامًا."
  - لا يستحق الـ feature الجديد مكانه إلا إذا كان مكسبه في التحقق المتقاطع أكبر من التشتّت بين الطيّات.
  - بعد الاختيار، أعد تدريب البطل على بيانات التدريب كلها وقيّمه مرة واحدة على بيانات الاختبار.
further:
  - title: FunctionTransformer
    url: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.FunctionTransformer.html
  - title: "Preprocessing data: custom transformers"
    url: https://scikit-learn.org/stable/modules/preprocessing.html#custom-transformers
quiz:
  - q: "إضافة `orders_per_month` ترفع الـ AUC بالتحقق المتقاطع لشجرة واحدة من 0.72 إلى 0.76، لكنها تُبقي الانحدار اللوجستي على حاله عند 0.81. ما السبب الأرجح؟"
    options:
      - text: لم تستطع الشجرة تكوين "الطلبات نسبةً إلى مدة العضوية" بتقسيماتها على عمود واحد في كل مرة، بينما كان النموذج الخطي يستطيع مقاربتها أصلًا بوزن العمودين.
        why: صحيح. تحتاج الشجرة إلى تقسيمات كثيرة لتحاكي نسبة؛ وتسليمها النسبة مباشرة يعطيها سؤالًا واحدًا نظيفًا.
      - text: الانحدار اللوجستي يتجاهل الـ features الجديدة بعد الثمانية الأولى.
        why: إنه يستخدم كل عمود يتلقّاه؛ لكن العمود الجديد لا يضيف شيئًا يُذكر فوق ما لديه أصلًا.
      - text: الشجرة تقع في الـ overfitting على الـ feature الجديد.
        why: الـ overfitting سيضرّ نتائج التحقق، لا أن يحسّنها.
      - text: النسبة تسرّب الهدف.
        why: الطلبات ومدة العضوية معروفتان كلتاهما في تاريخ اللقطة، فنسبتهما آمنة.
    answer: 0
  - q: "لماذا نحسب الـ features داخل `FunctionTransformer` في الـ pipeline بدل إضافة أعمدة إلى الـ DataFrame مسبقًا؟"
    options:
      - text: لأن `FunctionTransformer` يجعل حساب الـ features أسرع.
        why: السرعة هي نفسها؛ فهو كود pandas نفسه في الحالتين.
      - text: لأن خدمة الإنتاج تحسب حينها الـ features نفسها تمامًا من المدخلات الخام، دون كود منفصل يجب إبقاؤه متزامنًا.
        why: صحيح. كائن واحد يحمل منطق الـ features والنموذج معًا، فلا يمكن أن يبتعدا عن بعضهما.
      - text: لأن الـ features المضافة إلى DataFrame لا يمكن أن تستخدمها نماذج scikit-learn.
        why: أي عمود رقمي في DataFrame يمكن استخدامه؛ والفائدة هي الاتّساق.
    answer: 1
  - q: "العمود `total_spent` ملتوٍ بشدة نحو اليمين (قلّة من العملاء أنفقوا الآلاف). أيّ تحويل يساعد النموذج الخطي عادةً؟"
    options:
      - text: تربيعه، لتمديد القيم الكبيرة أكثر.
        why: التربيع يزيد الالتواء سوءًا ويعطي العملاء المتطرّفين تأثيرًا أكبر.
      - text: ترميزه بـ one-hot.
        why: هذا يعامل كل مبلغ مختلف كفئة مستقلة، فيرمي الترتيب ويفجّر عدد الأعمدة.
      - text: "`np.log1p(total_spent)`، الذي يضغط القيم الكبيرة فيصبح لفرق 100 دولار وزن أكبر عند 50 دولارًا منه عند 3,000 دولار."
        why: صحيح. التحويلات اللوغاريتمية تروّض الالتواء وكثيرًا ما تجعل العلاقات أقرب إلى الخطية. والأشجار لا تحتاج إليها.
    answer: 2
  - q: "feature جديد يرفع متوسط الـ AUC بالتحقق المتقاطع من 0.807 إلى 0.811، مع انحرافات معيارية للطيّات في حدود 0.035. ماذا تفعل؟"
    options:
      - text: احتفظ به؛ أي تحسّن يستحق الحصول عليه.
        why: لكل feature كلفة تشغيل (حساب، ومراقبة، وشرح)، ومكسب بهذا الحجم لا يمكن تمييزه عن الضجيج.
      - text: أعلن عنه كتحسّن بمقدار 0.4 نقطة.
        why: هذا يبالغ في دليل غير موجود.
      - text: اضبط النموذج من جديد حتى تكبر الفجوة.
        why: الضبط لتوسيع فجوة مليئة بالضجيج هو overfitting على طيّات التحقق.
      - text: عامله على أنه لا تغيير؛ وأبقِ مجموعة الـ features الأبسط ما لم يكن للـ feature سبب آخر لوجوده.
        why: صحيح. المكسب الواقع ضمن التشتّت بوضوح ضجيج؛ والخيار الافتراضي ترك الـ feature خارجًا.
    answer: 3
---

النماذج لا ترى إلا الأعمدة التي تعطيها إياها. وقائد فريق الدعم حين ينظر إلى عميل لا يفكّر "4 طلبات و600 يوم من العضوية"؛ بل يفكّر "طلب كل خمسة أشهر أو نحوها". هذا المعدّل، لا أيٌّ من الرقمين الخامين، هو الفكرة المفيدة. و**هندسة الـ features (feature engineering)** تحوّل هذا النوع من المعرفة بمجال العمل إلى أعمدة، وفي البيانات الجدولية كثيرًا ما تساوي أكثر من أي قدر من الضبط.

## أفكار تأتي من مجال العمل

features الانقطاع الجيدة تقع عادةً في بضع عائلات:

- **المعدّلات**: الطلبات لكل شهر عضوية، والتذاكر لكل طلب. الأعداد الخام تكبر مع مدة العضوية؛ أما المعدّلات فتقارن العملاء بإنصاف.
- **النِّسب مقارنةً بعادات العميل نفسه**: الأيام منذ آخر طلب مقسومة على الفجوة المعتادة بين طلباته. ثلاثون يومًا من الصمت مقلقة لمشترٍ أسبوعي، وطبيعية لمن يطلب مرتين في السنة.
- **التحويلات**: `log1p` لأعمدة المال، الذي يضغط الذيول الطويلة نحو اليمين بحيث يُحسب الفرق بين 50 و150 دولارًا أكثر من الفرق بين 3,000 و3,100 دولار.
- **العلامات (flags)**: "لم يُجب عن الاستبيان قط"، و"لم يطلب في حياته إلا مرة واحدة".

كلٌّ من هذه يجب أن يكون قابلًا للحساب من معلومات متاحة في تاريخ اللقطة. المعدّل المبني من مدة العضوية والطلبات سليم؛ وأي شيء يختلس النظر إلى نافذة النتيجة هو التسرّب الذي تحدّثنا عنه في الدرس السابق.

## الـ Features داخل الـ pipeline

اكتب كود الـ features مرة واحدة، كدالة من DataFrame إلى DataFrame، وغلّفها في `FunctionTransformer`. داخل الـ pipeline تعمل في التحقق المتقاطع، وفي التدريب النهائي، وفي بيئة الإنتاج، دائمًا بالطريقة نفسها.

```python run
import numpy as np
import pandas as pd
from sklearn.preprocessing import FunctionTransformer

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]

def add_features(df):
    df = df.copy()
    months = df["tenure_days"] / 30.4
    df["orders_per_month"] = df["orders"] / months
    df["typical_gap"] = df["tenure_days"] / df["orders"]
    df["overdue"] = df["days_since_last_order"] / df["typical_gap"]
    df["log_spent"] = np.log1p(df["total_spent"])
    return df

engineered = FunctionTransformer(add_features).fit_transform(churn[features])
print(engineered[["orders", "tenure_days", "orders_per_month", "overdue", "log_spent"]].head().round(2))
print("skew of total_spent:", round(churn["total_spent"].skew(), 2),
      "| after log1p:", round(np.log1p(churn["total_spent"]).skew(), 2))
```

`df.copy()` مهم: لا ينبغي للدالة أن تعدّل الـ DataFrame الخاص بمن استدعاها. ولأن لكل عميل طلبًا واحدًا على الأقل ومدة عضوية موجبة، فالقسمة آمنة هنا؛ أما في بياناتك أنت، فاحترس من الأصفار.

الدالة **عديمة الحالة (stateless)**: القيم الجديدة لكل صف تعتمد على ذلك الصف وحده. والـ features عديمة الحالة لا يمكن أن تتسرّب بين الطيّات. أما feature مثل "الإنفاق مقارنةً بمتوسط العملاء" فمختلف، لأن المتوسط يُتعلَّم من البيانات؛ فهو يحتاج إلى محوّل حقيقي له `fit`، وإلا استخدم صفوف التحقق بصمت.

## هل تساعد؟ اسأل التحقق المتقاطع

```python run
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler
from sklearn.tree import DecisionTreeClassifier

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

def add_features(df):
    df = df.copy()
    df["orders_per_month"] = df["orders"] / (df["tenure_days"] / 30.4)
    df["typical_gap"] = df["tenure_days"] / df["orders"]
    df["overdue"] = df["days_since_last_order"] / df["typical_gap"]
    df["log_spent"] = np.log1p(df["total_spent"])
    return df

models = {"tree": DecisionTreeClassifier(min_samples_leaf=20, random_state=42),
          "logistic": make_pipeline(StandardScaler(), LogisticRegression())}
for name, model in models.items():
    plain = cross_val_score(model, X_train, y_train, cv=cv, scoring="roc_auc")
    richer = cross_val_score(make_pipeline(FunctionTransformer(add_features), model),
                             X_train, y_train, cv=cv, scoring="roc_auc")
    print(f"{name:8} plain {plain.mean():.3f} ± {plain.std():.3f}   "
          f"engineered {richer.mean():.3f} ± {richer.std():.3f}")
```

تتحسّن الشجرة الواحدة من 0.716 إلى 0.759، وتصبح طيّاتها أكثر ثباتًا. انظر إلى داخلها وسترى السبب: يصبح `orders_per_month` سؤال الجذر. لا تستطيع الشجرة إلا مقارنة عمود واحد بعتبة، فـ "طلبات قليلة بالنسبة إلى مدة العضوية هذه" كانت ستحتاج إلى سلّم من التقسيمات لمحاكاتها. أما حين تُسلَّم النسبة، فيكفيها تقسيم واحد.

ويتحرك الانحدار اللوجستي من 0.807 إلى 0.811، وهذا ضمن تشتّت ±0.04 بوضوح. أي لا تغيير. فالنموذج الخطي يستطيع أصلًا أن يوازن `orders` مقابل `tenure_days`، وحداثة آخر طلب، الإشارة المهيمنة، موجودة منذ البداية. عائلات النماذج المختلفة تحتاج إلى features مختلفة: النِّسب والتفاعلات للأشجار، والتحويلات المقوِّمة للنماذج الخطية.

:::mistake الاحتفاظ بكل feature يدفع المتوسط قليلًا إلى الأعلى
مع خمس طيّات من 60 عميلًا، يتأرجح متوسط الـ AUC بنقطة أو أكثر من الضجيج وحده. فإذا جرّبت عشرين feature واحتفظت بكل ما يرفع المتوسط، فستحتفظ بنحو نصفها بالحظ، وتطلق نموذجًا أبطأ وأصعب في الشرح. احتفظ بالـ feature حين يتجاوز مكسبه التشتّت بوضوح، أو حين يحمل معنى عمليًا تحتاج إليه على أي حال.
:::

## ختام القسم: البطل

اختبر القسم 4 النماذج المجمّعة والأعمدة الإضافية والضبط والـ features المهندَسة بتحقق متقاطع أمين. ومعظمها لم يتفوّق على النموذج البسيط. لذا يبقى البطل هو الانحدار اللوجستي بعد توحيد المقاييس على ثمانية أعمدة رقمية، وقد حان الوقت لإنفاق بيانات الاختبار:

```python run
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

champion = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)
print("test ROC AUC:", round(roc_auc_score(y_test, champion.predict_proba(X_test)[:, 1]), 3))
print("test accuracy:", champion.score(X_test, y_test))
```

ROC AUC على الاختبار بقيمة 0.81 مقابل 0.81 بالتحقق المتقاطع: لا مفاجأة، وهذا بالضبط ما تبدو عليه عملية خالية من التسرّب. هذا التوافق هو ما اشتراه لك القسم 4. ليس رقمًا أعلى، بل رقمًا تستطيع أن تقف خلفه في اجتماع.

:::why لماذا يُعدّ "فوز النموذج البسيط" نتيجة جيدة
النموذج الذي تستطيع شرحه في جملتين، وإعادة تدريبه في أجزاء من الثانية، وتتبّع أخطائه بجدول معاملات، أرخص في التشغيل لسنوات. وحين تكبر البيانات، أعد إجراء المقارنات نفسها؛ فقد تستحق النماذج المجمّعة والأعمدة الفئوية مكانها حينها. العملية، لا الفائز، هي الأصل القابل لإعادة الاستخدام.
:::

يخطو القسم 5 إلى ما هو أبعد من الجداول الموجَّهة: إيجاد البنية دون labels، ونظرة أولى على الشبكات العصبية، وموقع النماذج اللغوية الكبيرة، وما يتطلّبه وضع البطل أمام عملاء حقيقيين بمسؤولية.
