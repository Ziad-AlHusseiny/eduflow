---
summary: ازرع أشجار قرار على بيانات الانقطاع، واقرأها كقواعد if/else بسيطة، وتحكّم في حجمها بـ max_depth وmin_samples_leaf، واعرف متى لا يمكن الوثوق باحتمالاتها.
takeaways:
  - "تقسم شجرة القرار البيانات بسؤال نعم/لا واحد في كل مرة، وتختار في كل خطوة السؤال الذي يجعل المجموعات أنقى ما يمكن."
  - "الشجرة المدرَّبة مجموعة من القواعد المقروءة؛ و`export_text` تطبعها."
  - "الأشجار غير المقيّدة تنمو حتى تصبح كل ورقة نقية، فتحفظ بيانات التدريب وتنتج احتمالات مفرطة الثقة بقيمة 0 أو 1."
  - "يحدّ `max_depth` و`min_samples_leaf` من النمو؛ ويمنع `min_samples_leaf` الشجرة من إنفاق تقسيم على حفنة من العملاء."
  - "لا تحتاج الأشجار إلى توحيد مقاييس الـ features وتلتقط التفاعلات تلقائيًا، لكن الشجرة الواحدة غير مستقرة: تغييرات صغيرة في البيانات قد تعيد تشكيلها."
further:
  - title: "Decision Trees"
    url: https://scikit-learn.org/stable/modules/tree.html
  - title: export_text
    url: https://scikit-learn.org/stable/modules/generated/sklearn.tree.export_text.html
quiz:
  - q: "ورقة في شجرة انقطاع تضم 60 عميلًا بقوا و13 انقطعوا. ماذا تُعيد `predict_proba` لعميل يقع فيها؟"
    options:
      - text: "نحو `[0.82, 0.18]`: أي حصص الفئات في تلك الورقة."
        why: صحيح. احتمال الشجرة هو نسبة عملاء التدريب من كل فئة داخل الورقة.
      - text: "`[1.0, 0.0]`، لأن فئة الأغلبية في الورقة هي 0."
        why: هذا ما تُبلغ عنه `predict` كـ label. أما `predict_proba` فتحتفظ بالنِّسب.
      - text: "`[0.5, 0.5]`، لأن الأشجار لا تقدّر الاحتمالات."
        why: الأشجار تقدّرها فعلًا، من نِسب الأوراق، وإن كان ذلك بشكل خشن.
      - text: يعتمد على بُعد العميل عن عتبة التقسيم.
        why: داخل الورقة يحصل كل عميل على الإجابة نفسها؛ والبُعد عن العتبة لا دور له.
    answer: 0
  - q: "تنبؤات شجرة غير محدودة على بيانات الاختبار لا تحتوي إلا احتمالين مختلفين، 0.0 و1.0. لماذا تُعدّ هذه مشكلة؟"
    options:
      - text: لأنها تعني أن في الشجرة خطأً برمجيًا ويجب إعادة تدريبها بـ `random_state` آخر.
        why: هذا سلوك متوقَّع، لا خطأ. فكل ورقة في شجرة مكتملة النمو نقية.
      - text: لأن الاحتمالات التي تساوي 0 أو 1 بالضبط لا يمكن استخدامها لترتيب العملاء.
        why: يمكن ترتيبها، لكن مع قيمتين فقط يكاد يتعادل كل العملاء، فلا يحمل الترتيب أي معلومة.
      - text: لأن الشجرة تدّعي يقينًا تامًا بشأن كل عميل، وتُثبت دقتها على الاختبار البالغة 0.72 أن ذلك غير صحيح.
        why: صحيح. الأوراق النقية تنتج احتمالات مفرطة الثقة، والترتيب الذي تبنيه منها يكاد يكون بلا فائدة.
    answer: 2
  - q: "أيّ هذه ميزة حقيقية للأشجار على الانحدار اللوجستي في بيانات الانقطاع؟"
    options:
      - text: الأشجار تعمّم دائمًا بشكل أفضل لأنها تستطيع نمذجة المنحنيات.
        why: المرونة سلاح ذو حدّين. على هذه البيانات يؤدي انحدار لوجستي مقيَّد بالمستوى نفسه أو أفضل.
      - text: الأشجار تعطي احتمالات أنعم وأفضل معايرة.
        why: احتمالات الأشجار نِسب أوراق خشنة، وعادةً أقل نعومة من احتمالات الانحدار اللوجستي.
      - text: الأشجار مستقرة؛ فإعادة التدريب على بيانات مختلفة قليلًا تعطي شجرة شبه مطابقة.
        why: العكس هو الصحيح. فالتقسيم الأول المختلف يغيّر كل ما تحته.
      - text: الأشجار تلتقط تفاعلات مثل "قلة الطلبات مهمة فقط للعملاء الحديثين" دون أن تنشئ أنت الـ feature.
        why: صحيح. كل فرع يطرح أسئلته اللاحقة الخاصة، فتأتي التفاعلات مجانًا.
    answer: 3
---

اسأل قائد فريق الدعم كيف يكتشف العملاء الذين أوشكوا على الرحيل، وستسمع شيئًا مثل: "إذا لم يطلبوا شيئًا منذ أشهر، فقد رحلوا. وإذا كانوا حديثين لكنهم لم يشتروا إلا مرة أو مرتين، فالأمر متأرجح. أما الزبائن الدائمون الذين طلبوا مؤخرًا فلا خوف عليهم". هذه شجرة قرار (decision tree). وفي هذا الدرس تنمّي واحدة من البيانات وتتحقق إن كانت توافقه.

## عشرون سؤالًا تختارها البيانات

تتنبأ شجرة القرار بطرح أسئلة نعم/لا عن feature واحد في كل مرة. ولبنائها، تنظر الخوارزمية في كل feature وكل عتبة ممكنة، وتختار السؤال الذي يقسم عملاء التدريب إلى أنقى مجموعتين: في الحالة المثالية، كل المنقطعين في جهة وكل الباقين في الأخرى. وتُقاس النقاوة افتراضيًا بـ **Gini impurity** (0 لمجموعة من فئة واحدة فقط، و0.5 لخليط 50/50). ثم تكرّر البحث داخل كل مجموعة، وهكذا نزولًا.

```python run
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
X_train, X_test, y_train, y_test = train_test_split(
    churn[features], churn["churned"], test_size=0.25, random_state=42,
    stratify=churn["churned"])

tree = DecisionTreeClassifier(max_depth=2, random_state=42).fit(X_train, y_train)
print(export_text(tree, feature_names=features, show_weights=True))
```

تطبع `export_text` القواعد، ويضيف `show_weights=True` عدد عملاء التدريب من كل فئة (بقي، انقطع) الذين وصلوا إلى كل ورقة.

:::figure شجرة الانقطاع بعمق 2
<svg viewBox="0 0 700 270" role="img" aria-labelledby="t1">
  <title id="t1">سؤال الجذر: هل الأيام منذ آخر طلب 236.5 على الأكثر. إذا نعم، اسأل هل الطلبات 3.5 على الأكثر: نعم تعطي ورقة فيها 60 بقوا و67 انقطعوا، ولا تعطي 60 بقوا و13 انقطعوا. وإذا لا، اسأل هل مدة العضوية 637.5 على الأكثر: نعم تعطي 11 بقوا و84 انقطعوا، ولا تعطي 2 بقيا و1 انقطع.</title>
  <rect class="d-box-primary" x="235" y="10" width="230" height="44" rx="10"/>
  <text class="d-code" x="350" y="37" text-anchor="middle">days_since_last ≤ 236.5?</text>
  <path class="d-arrow" d="M300 54 L180 100" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 54 L520 100" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="220" y="80">نعم</text>
  <text class="d-label-muted" x="470" y="80">لا</text>
  <rect class="d-box" x="80" y="104" width="200" height="44" rx="10"/>
  <text class="d-code" x="180" y="131" text-anchor="middle">orders ≤ 3.5?</text>
  <rect class="d-box" x="420" y="104" width="200" height="44" rx="10"/>
  <text class="d-code" x="520" y="131" text-anchor="middle">tenure_days ≤ 637.5?</text>
  <path class="d-arrow" d="M140 148 L80 196" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M220 148 L270 196" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 148 L430 196" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 148 L610 196" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="10" y="200" width="140" height="54" rx="10"/>
  <text class="d-label" x="80" y="222" text-anchor="middle">60 بقوا / 67 انقطعوا</text>
  <text class="d-label-strong" x="80" y="243" text-anchor="middle">متأرجح</text>
  <rect class="d-box-success" x="200" y="200" width="140" height="54" rx="10"/>
  <text class="d-label" x="270" y="222" text-anchor="middle">60 بقوا / 13 انقطعوا</text>
  <text class="d-label-strong" x="270" y="243" text-anchor="middle">يبقى</text>
  <rect class="d-box-accent" x="360" y="200" width="140" height="54" rx="10"/>
  <text class="d-label" x="430" y="222" text-anchor="middle">11 بقوا / 84 انقطعوا</text>
  <text class="d-label-strong" x="430" y="243" text-anchor="middle">ينقطع</text>
  <rect class="d-box" x="540" y="200" width="140" height="54" rx="10"/>
  <text class="d-label" x="610" y="222" text-anchor="middle">2 بقيا / 1 انقطع</text>
  <text class="d-label-strong" x="610" y="243" text-anchor="middle">3 عملاء فقط!</text>
</svg>
:::

ثلاث أوراق تطابق كلام قائد فريق الدعم حرفًا بحرف أو تكاد. العملاء الصامتون منذ زمن طويل ينقطعون (84 من 95). والزبائن الدائمون الحديثون بأربعة طلبات أو أكثر يبقون (60 من 73). والعملاء الحديثون قليلو الطلبات متأرجحون (67 من 127 ينقطعون). واكتشفت الشجرة أيضًا **تفاعلًا (interaction)** لم يضطر أحد إلى كتابته: عدد الطلبات مهم، لكن بين العملاء الحديثين فقط.

أما الورقة الرابعة فتحذير. لقد أنفقت الشجرة سؤالًا كاملًا لعزل ثلاثة عملاء ذوي عضوية طويلة جدًا. هذا هو البحث الجشع (greedy) أثناء عمله: يختار التقسيم الذي يساعد أكثر في اللحظة الحالية، حتى لو جاءت المساعدة من مجموعة أصغر من أن تعني شيئًا.

## كيف تتنبأ الشجرة بالاحتمالات

العميل الذي يقع في ورقة يحصل على حصص الفئات في تلك الورقة كاحتمالات. قع في ورقة "الزبائن الدائمين" وستُعيد `predict_proba` نحو `[0.82, 0.18]`. لذا فإن شجرة بعمق 2 لا تستطيع أبدًا أن تُخرج إلا أربعة احتمالات مختلفة، واحدًا لكل ورقة. هذا خشن، لكنه صادق. وتبدأ المشكلة حين لا تكون للشجرة حدود.

## النمو أكثر من اللازم، وكيف توقفه

تواصل الشجرة غير المقيّدة التقسيم حتى تصبح كل ورقة نقية. على بيانات الانقطاع، هذا يعني 64 ورقة، بعمق 11 مستوى، ودقة تدريب 100%. كل ورقة نقية، فكل احتمال يساوي 0 أو 1 بالضبط: الشجرة تدّعي يقينًا تامًا بشأن كل عميل اختبار بينما لا تصيب إلا في 72% من الحالات. ومع ترتيب العملاء بمثل هذه الاحتمالات، يتعادل معظمهم، وتتحوّل قائمة الاتصالات من الدرس السابق إلى يانصيب.

اثنان من الـ hyperparameters يتوليان معظم مهمة إبقاء الشجرة صادقة:

- `max_depth` يحدّد أقصى عدد من الأسئلة المتتالية التي تستطيع الشجرة طرحها.
- `min_samples_leaf` يرفض أي تقسيم يترك في ورقة عددًا من عملاء التدريب أقل من هذه القيمة. وهو يستهدف بالضبط مشكلة الورقة الرابعة أعلاه، ويتيح للشجرة أن تتعمّق حيث البيانات وفيرة وأن تبقى ضحلة حيث ليست كذلك.

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

for settings in [{}, {"max_depth": 3}, {"min_samples_leaf": 20}]:
    t = DecisionTreeClassifier(random_state=42, **settings).fit(X_train, y_train)
    distinct = len(set(t.predict_proba(X_test)[:, 1]))
    print(f"{str(settings):24} leaves {t.get_n_leaves():3}  train {t.score(X_train, y_train):.2f}  "
          f"test {t.score(X_test, y_test):.2f}  distinct probabilities {distinct}")

t = DecisionTreeClassifier(min_samples_leaf=20, random_state=42).fit(X_train, y_train)
print(pd.Series(t.feature_importances_, index=features).sort_values(ascending=False).round(2))
```

يقول `feature_importances_` كم خفّض كل feature من عدم النقاوة عبر كل تقسيماته، بعد تطبيع القيم ليكون مجموعها 1. تستحوذ حداثة آخر طلب على أكثر من النصف، ويأتي عدد الطلبات ثانيًا؛ وتحصل القسائم وتذاكر الدعم على صفر لأن الشجرة لم تستخدمها قط. عامِل هذه الأرقام كوصف لهذه الشجرة، لا للعالم: فالـ features التي لم تحتجها الشجرة قد تظل مفيدة، والدرس القادم يبيّن طريقة أجدر بالثقة لقياس الأهمية.

:::mistake الوثوق ببنية شجرة واحدة
غيّر `random_state` في `train_test_split` وأعد التدريب: قد يبقى سؤال الجذر، لكن الفروع تحته كثيرًا ما تتغيّر. التقسيم الأول للشجرة يحسم كل ما تحته، لذا قد يُنتج تغيير صغير في البيانات شجرة مختلفة المظهر بنتيجة مشابهة. اقرأ الشجرة الواحدة كقصة واحدة محتملة، لا كحقيقة عن عملائك.
:::

:::tip ما لا تحتاجه الأشجار
تقسم الأشجار على ترتيب القيم، فلا تحتاج إلى توحيد المقاييس، ولا تكترث بالقيم الشاذة في الـ features، وتتعامل مع خليط الأرقام الكبيرة والصغيرة دون تذمّر. ولهذا تُعدّ النماذج القائمة على الأشجار الخيار الافتراضي للبيانات الجدولية عمليًا، بشرط أن تستخدم كثيرًا منها معًا.
:::

وعدم الاستقرار هذا فرصة أيضًا. فإذا كانت الشجرة الواحدة مليئة بالضجيج، فخذ متوسط أشجار كثيرة نمت على بيانات مختلفة قليلًا، وسيلغي الضجيج بعضه بعضًا. هذه هي الفكرة وراء الغابات العشوائية والـ gradient boosting، موضوع الدرس القادم.
