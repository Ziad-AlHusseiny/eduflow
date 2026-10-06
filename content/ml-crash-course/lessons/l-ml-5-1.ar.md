---
summary: جمّع العملاء في مجموعات باستخدام k-means، وارسم ملامح كل عنقود لترى إن كان يعني شيئًا، واضغط أعمدة كثيرة مترابطة في أعمدة قليلة باستخدام PCA.
takeaways:
  - "تتناوب k-means بين خطوتين، إسناد كل نقطة إلى أقرب مركز ونقل كل مركز إلى متوسط نقاطه، حتى لا يتغيّر شيء."
  - "تستخدم العنقدة المسافات، فوحّد مقاييس الـ features أولًا، واضبط `n_init` و`random_state` لنتائج قابلة للتكرار."
  - العناقيد لا تكون مفيدة إلا إذا استطعت وصفها؛ فارسم ملامح كلٍّ منها بمتوسطات المجموعة قبل أن تعطيه اسمًا.
  - "قيمة silhouette المنخفضة تعني أن البيانات ليست فيها مجموعات طبيعية واضحة؛ وقد تظل الشرائح مفيدة، لكنها اختيار لا اكتشاف."
  - "يجد PCA محاور جديدة تلتقط أكبر قدر من التباين؛ ويخبرك `explained_variance_ratio_` كم يحتفظ به كل مكوّن."
further:
  - title: "Clustering: K-means"
    url: https://scikit-learn.org/stable/modules/clustering.html#k-means
  - title: KMeans
    url: https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html
  - title: "Principal component analysis (PCA)"
    url: https://scikit-learn.org/stable/modules/decomposition.html#pca
quiz:
  - q: "شغّلت k-means على أعمدة الانقطاع الخام دون توحيد المقاييس. أيّ عمود سيهيمن على العناقيد؟"
    options:
      - text: "`used_coupon`، لأن الأعمدة الثنائية تفصل المجموعات بوضوح."
        why: عمود 0/1 لا يساهم بأكثر من 1 في المسافة المربّعة، وهذا لا شيء بجانب المبالغ بالدولار.
      - text: "`days_since_last_order`، لأنه أفضل متنبئ بالانقطاع."
        why: لا ترى k-means الهدف أبدًا؛ إنها لا ترى إلا المسافات، والمسافات يحرّكها المقياس.
      - text: كل الأعمدة تساهم بالتساوي، لأن k-means تطبّع داخليًا.
        why: لا يوحّد KMeans المقاييس بنفسه؛ عليك أن تضيف `StandardScaler`.
      - text: "`total_spent`، لأن قيمه بالآلاف تطغى على كل مسافة أخرى."
        why: صحيح. دون توحيد المقاييس، تجمّع k-means العملاء في الغالب بحسب الإنفاق.
    answer: 3
  - q: "قيم silhouette من k = 2 إلى 7 كلها بين 0.25 و0.27. ماذا يخبرك ذلك؟"
    options:
      - text: البيانات ليس فيها تجمّع طبيعي قوي، فاختر k بحسب الفائدة وقابلية الشرح.
        why: صحيح. القيم المنخفضة المتقاربة تعني أن لا قيمة لـ k تبرز؛ والتقسيم إلى شرائح اختيار نمذجي.
      - text: k = 7 هي الأفضل لأن نتيجتها الأعلى.
        why: فروق بهذا الصغر ضجيج، وسبع شرائح أصعب على الفريق في الاستخدام من أربع.
      - text: فشلت k-means ويجب استبدالها بنموذج موجَّه.
        why: ضعف بنية العناقيد لا يجعل العنقدة عديمة الفائدة، والنموذج الموجَّه يحتاج إلى labels ليست لديك للشرائح.
    answer: 0
  - q: "يعطي PCA على features سرطان الثدي الثلاثين قيم `explained_variance_ratio_` تساوي 0.44 و0.19 لأول مكوّنين. ماذا يُظهر رسم ثنائي الأبعاد لهما؟"
    options:
      - text: أهم اثنين من الـ features الأصلية.
        why: المكوّنات تركيبات موزونة من الـ features الثلاثين كلها، لا اثنان من الأصلية.
      - text: منظرًا يحتفظ بنحو 63% من التباين في البيانات الموحّدة المقاييس.
        why: صحيح. إنها خريطة مفيدة، لكن أكثر من ثلث التباين لا يظهر فيها.
      - text: الفئتين، مفصولتين تمامًا، لأن PCA يستخدم الـ labels.
        why: PCA غير موجَّه؛ ولا يرى الـ labels أبدًا. وأي فصل تراه يأتي من بنية البيانات.
    answer: 1
---

ليس كل سؤال يأتي مع labels. يسأل فريق التسويق في Cartwheel: "ما أنواع العملاء لدينا؟" لم يصنّف أحد العملاء بأنواع، فلا هدف للتنبؤ به. يبحث **التعلّم غير الموجَّه (unsupervised learning)** عن بنية في الـ features وحدها. والأداتان اللتان ستستخدمهما أكثر من غيرهما هما العنقدة (clustering)، التي تجمّع الصفوف المتشابهة، وتقليل الأبعاد، الذي يلخّص أعمدة كثيرة في أعمدة قليلة.

## k-means في حركتين

تحتاج k-means إلى قرار واحد منك: عدد العناقيد، k. ثم تكرّر خطوتين:

1. **الإسناد**: ضع كل عميل في العنقود الذي مركزه الأقرب.
2. **التحديث**: انقل كل مركز إلى متوسط العملاء المسندين إليه.

حين تتوقف الإسنادات عن التغيّر، ينتهي الأمر. وقد تعطي مراكز البداية المختلفة نتائج مختلفة، لذا يشغّل scikit-learn العملية كلها `n_init` مرة ويحتفظ بالحل الأكثر إحكامًا.

:::figure جولة واحدة من k-means
<svg viewBox="0 0 680 240" role="img" aria-labelledby="t1">
  <title id="t1">اللوحة اليسرى: نقاط ملوّنة بحسب أقرب مركز من مركزين، يظهران كحلقتين كبيرتين. اللوحة اليمنى: انتقل كل مركز إلى وسط النقاط المسندة إليه. تتكرّر الخطوتان حتى تتوقف الإسنادات عن التغيّر.</title>
  <rect class="d-box" x="20" y="20" width="300" height="180" rx="10"/>
  <rect class="d-box" x="360" y="20" width="300" height="180" rx="10"/>
  <text class="d-label-strong" x="170" y="225" text-anchor="middle">1. الإسناد إلى أقرب مركز</text>
  <text class="d-label-strong" x="510" y="225" text-anchor="middle">2. نقل المركز إلى المتوسط</text>
  <circle class="d-dot" cx="60" cy="60" r="5"/><circle class="d-dot" cx="85" cy="80" r="5"/><circle class="d-dot" cx="70" cy="110" r="5"/><circle class="d-dot" cx="105" cy="65" r="5"/>
  <rect class="d-box-accent" x="215" y="120" width="10" height="10"/><rect class="d-box-accent" x="245" y="150" width="10" height="10"/><rect class="d-box-accent" x="270" y="125" width="10" height="10"/><rect class="d-box-accent" x="230" y="170" width="10" height="10"/>
  <circle class="d-box-primary" cx="140" cy="110" r="14"/>
  <circle class="d-box-accent" cx="200" cy="110" r="14"/>
  <circle class="d-dot" cx="400" cy="60" r="5"/><circle class="d-dot" cx="425" cy="80" r="5"/><circle class="d-dot" cx="410" cy="110" r="5"/><circle class="d-dot" cx="445" cy="65" r="5"/>
  <rect class="d-box-accent" x="555" y="120" width="10" height="10"/><rect class="d-box-accent" x="585" y="150" width="10" height="10"/><rect class="d-box-accent" x="610" y="125" width="10" height="10"/><rect class="d-box-accent" x="570" y="170" width="10" height="10"/>
  <circle class="d-box-primary" cx="420" cy="79" r="14"/>
  <circle class="d-box-accent" cx="585" cy="146" r="14"/>
  <path class="d-arrow" d="M330 110 L350 110" marker-end="url(#arrow)"/>
</svg>
:::

لأن "الأقرب" مسافة، فالدرس نفسه من أقرب k جيران ينطبق هنا: وحّد المقاييس أولًا، وإلا حسم `total_spent` بالآلاف كل شيء.

## تقسيم عملاء Cartwheel إلى شرائح

استخدم أعمدة السلوك فقط واترك `churned` خارجًا: فالتقسيم إلى شرائح يجب أن يصف العملاء، لا نتيجتهم. ستنظر إلى الانقطاع بعد ذلك لترى إن كانت الشرائح تعني شيئًا.

```python run
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
behaviour = ["orders", "total_spent", "avg_order_value", "days_since_last_order",
             "tenure_days", "mobile_share"]
X = StandardScaler().fit_transform(churn[behaviour])
for k in range(2, 7):
    labels = KMeans(n_clusters=k, n_init=10, random_state=42).fit_predict(X)
    print(f"k={k}  silhouette {silhouette_score(X, labels):.3f}")

segments = make_pipeline(StandardScaler(), KMeans(n_clusters=4, n_init=10, random_state=42))
churn["segment_id"] = segments.fit_predict(churn[behaviour])
profile = churn.groupby("segment_id").agg(
    customers=("orders", "size"), orders=("orders", "mean"),
    avg_order=("avg_order_value", "mean"), days_since=("days_since_last_order", "mean"),
    tenure=("tenure_days", "mean"), churn_rate=("churned", "mean"))
print(profile.round(2))
```

أولًا، الجزء الصادق. تقيس **قيمة silhouette** كم يكون كل عميل أقرب إلى عنقوده منه إلى العنقود التالي، من -1 إلى 1. والقيم في حدود 0.25 لكل k تعني أن العملاء لا ينقسمون إلى مجموعات طبيعية واضحة؛ بل يشكّلون طيفًا متصلًا. وهذا معتاد في البيانات السلوكية. لا يجعل ذلك العنقدة عديمة الفائدة، لكنه يعني أن k اختيارك أنت، تتخذه من أجل الفائدة، لا حقيقة اكتشفتها.

ثم الجزء المفيد. رسم ملامح العناقيد الأربعة يعطي شرائح يستطيع المسوِّق تسميتها:

- **العابرون الغائبون** (129): طلبان، آخرهما قبل نحو 310 أيام. انقطاع 79%.
- **مشترو القطع الغالية** (41): طلبات قليلة بمتوسط 600 دولار. انقطاع 66%.
- **الزبائن الدائمون** (79): ثمانية طلبات، آخرها قبل نحو 100 يوم. انقطاع 33%.
- **الجدد والحديثون** (149): عضوية قصيرة، وطلبوا قبل نحو شهرين. انقطاع 44%.

تختلف نِسب الانقطاع بحدّة بين الشرائح مع أن k-means لم ترَ `churned` قط. هذا دليل على أن الشرائح تلتقط شيئًا حقيقيًا، ويعطي فريق التسويق أربع محادثات مختلفة بدل محادثة واحدة.

ليست k-means الخيار الوحيد. فهي تفترض عناقيد شبه مستديرة ومتشابهة الحجم، وهو افتراض يكفي عادةً للشرائح السلوكية. أما العنقدة الهرمية (`AgglomerativeClustering`) فتُظهر كيف تندمج المجموعات على مستويات مختلفة، و`DBSCAN` يجد المناطق الكثيفة بأي شكل ويصنّف القيم الشاذة كضجيج. ابدأ بـ k-means للتقسيم إلى شرائح؛ وبدّل حين لا تناسب افتراضاتها بياناتك بوضوح.

:::mistake تسمية العناقيد قبل رسم ملامحها
تُعيد k-means دائمًا k مجموعة، حتى من الضجيج العشوائي. أرقام العناقيد لا معنى لها، وقد تتغيّر بين تشغيل وآخر. قبل أن تسمّي عنقودًا "كبار العملاء"، اطبع متوسطاته وأحجامه، وتحقّق من ثباته عبر بضع قيم لـ `random_state`، وتأكّد أنه يهمّ في شيء تكترث به الشركة.
:::

## PCA: أعمدة أقل، ومعظم المعلومات

في كثير من مجموعات البيانات عشرات الأعمدة المترابطة. بيانات سرطان الثدي فيها 30 قياسًا لأنوية الخلايا، كثير منها تنويعات على الحجم. يجد **تحليل المكوّنات الرئيسية (PCA)** محاور جديدة، كلٌّ منها مزيج موزون من الأعمدة الأصلية، مرتّبة بحسب مقدار ما تلتقطه من تباين البيانات. احتفظ بالأولى منها ويصبح لديك ملخّص مضغوط.

```python run
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
pca = make_pipeline(StandardScaler(), PCA()).fit(X)
ratios = pca[-1].explained_variance_ratio_
print("first two components keep:", ratios[:2].round(3), "=", round(ratios[:2].sum(), 3))
print("components needed for 90%:", int(np.argmax(np.cumsum(ratios) >= 0.90)) + 1)

coords = make_pipeline(StandardScaler(), PCA(n_components=2)).fit_transform(X)
for label, name in [(0, "malignant"), (1, "benign")]:
    print(name, "average position:", coords[y == label].mean(axis=0).round(2))
```

يحتفظ مكوّنان بـ 63% من التباين في 30 عمودًا موحّد المقاييس، وتحتفظ سبعة مكوّنات بـ 90%. ارسم الإحداثيين وستجد الأورام الخبيثة والحميدة على جانبين متقابلين من المحور الأول، مع أن PCA لم يرَ الـ labels قط. ولهذا يُعدّ رسم PCA ثنائي الأبعاد نظرة أولى معيارية على أي مجموعة بيانات عريضة.

:::note متى يساعد PCA النموذج
يمكن أن يكون PCA أيضًا خطوة في pipeline قبل النموذج، لتقليل الضجيج أو تسريع التدريب على بيانات عريضة جدًا. أما في الجداول التي فيها دزينة من الأعمدة ذات المعنى، مثل بيانات الانقطاع، فعادةً ما يكلّف قابلية التفسير ولا يكسب شيئًا. استخدمه للاستكشاف أولًا؛ ولا تضفه إلى نموذج إلا حين يقول التحقق المتقاطع إنه يساعد.
:::

كلتا التقنيتين هنا كلاسيكية ورخيصة. أما الدرس القادم فعن نماذج تتعلّم features خاصة بها من المدخلات الخام: الشبكات العصبية.
