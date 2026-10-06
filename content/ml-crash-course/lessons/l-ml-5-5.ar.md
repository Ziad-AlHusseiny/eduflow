---
summary: احفظ الـ pipeline البطل باستخدام joblib، وغلّفه في دالة تنبؤ تتحقق من مدخلاتها، وقدّمه كمهمة دفعية ليلية أو كـ API، وقِس ما إذا كان يغيّر نتائج العمل.
takeaways:
  - "احفظ الـ pipeline المدرَّب كاملًا، لا النموذج وحده، كي تنتقل المعالجة المسبقة معه؛ وخزّن بجانبه قائمة الـ features ورقم إصدار وإصدار scikit-learn."
  - "ملفات `joblib` و`pickle` قد تنفّذ كودًا عند تحميلها، فلا تحمّل إلا ملفات نماذج أنشأتها أنت أو تثق بها، وحمّلها بإصدار scikit-learn نفسه."
  - تحقّق من المدخلات قبل التنبؤ: الحقول المطلوبة، والأنواع، والنطاقات المعقولة، كي تفشل البيانات السيئة بوضوح بدل أن تنتج درجة خاطئة واثقة.
  - كثير من نماذج الأعمال، ومنها نموذج الانقطاع، يُطلق على أفضل وجه كمهمة دفعية مجدولة؛ أما الـ API المباشر فللقرارات التي يجب أن تحدث أثناء الطلب.
  - "الاختبار الحقيقي للنموذج تجربة مضبوطة: قارن نتائج العملاء المُعلَّمين الذين تلقّوا العرض بمجموعة محجوزة عشوائيًا لم تتلقَّه."
further:
  - title: "Model persistence"
    url: https://scikit-learn.org/stable/model_persistence.html
  - title: "pickle: security warning"
    url: https://docs.python.org/3/library/pickle.html
quiz:
  - q: "لماذا نحفظ الـ pipeline المدرَّب بدل خطوة `LogisticRegression` وحدها؟"
    options:
      - text: لأن ملف الـ pipeline أصغر.
        why: هو أكبر قليلًا إن كان ثمة فرق؛ والحجم ليس السبب.
      - text: لأن المتوسطات والانحرافات المعيارية التي تعلّمها الـ scaler جزء من النموذج؛ ودونها ستُوحَّد مقاييس البيانات الجديدة بشكل مختلف.
        why: صحيح. يضمن الـ pipeline أن تطبّق بيئة الإنتاج المعالجة المسبقة نفسها تمامًا التي تدرّب عليها النموذج.
      - text: لأن joblib لا يستطيع حفظ LogisticRegression وحده.
        why: يستطيع حفظ أي كائن قابل للـ pickle؛ والمسألة اتّساق، لا قدرة.
      - text: لأن الـ pipelines تُحمَّل أسرع من الـ estimators المفردة.
        why: زمن التحميل لا يُذكر في الحالتين.
    answer: 1
  - q: "أرسل لك زميل بالبريد الملف `model.joblib` من مصدر مجهول وطلب منك تقييمه. ما الخطر؟"
    options:
      - text: تحميله قد ينفّذ كودًا اعتباطيًا على جهازك.
        why: صحيح. يستخدم joblib الـ pickle، الذي قد يشغّل كودًا أثناء التحميل. لا تحمّل الملفات إلا من مصادر تثق بها.
      - text: قد يستهلك ذاكرة أكثر من اللازم عند فتحه.
        why: ممكن لكنه ثانوي؛ والخطر الجسيم هو تنفيذ الكود.
      - text: سيعيد التدريب على بياناتك بصمت.
        why: التحميل لا يدرّب شيئًا. الخطر فيما يستطيع الملف تشغيله أثناء تحميله.
    answer: 0
  - q: "يتواصل فريق التسويق مع كل عميل يُعلِّمه النموذج، فينخفض الانقطاع بينهم من 79% إلى 60%. هل يمكنك أن تنسب الفضل إلى النموذج والعرض؟"
    options:
      - text: نعم؛ انخفض الانقطاع بعد الإطلاق، فالنظام يعمل.
        why: ربما كان الانقطاع سينخفض على أي حال (الموسم، أو مشكلة لدى منافس). ودون مجموعة مقارنة لا يمكنك الجزم.
      - text: نعم، ما دام الـ ROC AUC على الاختبار أعلى من 0.8.
        why: يُظهر الـ AUC أن النموذج يرتّب جيدًا؛ ولا يقول شيئًا عمّا إذا كان العرض يغيّر السلوك.
      - text: لا، لأن الانقطاع يجب أن يُقاس على 30 يومًا لا 90.
        why: النافذة تعريف عملي؛ والمشكلة في غياب المقارنة.
      - text: ليس بعد؛ تحتاج إلى مجموعة محجوزة عشوائيًا من العملاء المُعلَّمين لم تتلقَّ أي عرض لتقارن بها.
        why: صحيح. الفرق بين المجموعتين هو أثر العرض.
    answer: 3
---

النموذج الحبيس في notebook لا يساعد أحدًا. وكي يغيّر ما يفعله Cartwheel، يجب أن يعمل الـ pipeline البطل على بيانات عملاء جديدة، وفق جدول زمني أو عند الطلب، وأن تصل درجاته إلى الأشخاص الذين يرسلون عروض الاسترجاع. يغطي هذا الدرس الميل الأخير: حفظ النموذج، وحراسة مدخلاته، والاختيار بين مهمة دفعية وAPI، وإثبات أنه يعمل.

## احفظ الـ pipeline، لا النموذج وحده

الشيء الذي يُطلق هو الـ pipeline المدرَّب كاملًا. فمتوسطات الـ scaler وانحرافاته المعيارية جزء من النموذج بقدر المعاملات؛ ودونها ستوحّد بيئة الإنتاج مقاييس العملاء الجدد بشكل مختلف، وستكون كل درجة منحرفة.

يغطي دليل حفظ النماذج في scikit-learn عدة صيغ (pickle وjoblib وskops وONNX)؛ و`joblib` هو الأكثر شيوعًا حين تتولّى Python الحفظ والتحميل معًا. احفظ حزمة صغيرة فيها ما سيحتاجه أحدهم لاحقًا: الـ pipeline، وقائمة الـ features بالضبط، ووسم الإصدار، وإصدار المكتبة الذي دُرِّب به.

```python run
import os
import tempfile

import joblib
import pandas as pd
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

churn = pd.read_csv("churn.csv")
features = ["tenure_days", "orders", "total_spent", "avg_order_value",
            "days_since_last_order", "used_coupon", "support_tickets", "mobile_share"]
champion = make_pipeline(StandardScaler(), LogisticRegression()).fit(churn[features], churn["churned"])

bundle = {"model": champion, "features": features,
          "version": "churn-2025-09-30.1", "sklearn_version": sklearn.__version__}

with tempfile.TemporaryDirectory() as folder:
    path = os.path.join(folder, "churn_model.joblib")
    joblib.dump(bundle, path)
    print("saved", os.path.getsize(path), "bytes")

    loaded = joblib.load(path)
    same = (loaded["model"].predict_proba(churn[features]) == champion.predict_proba(churn[features])).all()
    print("identical predictions after reload:", same, "| trained with scikit-learn", loaded["sklearn_version"])
```

لاحظ أن النموذج النهائي مدرَّب على العملاء الـ 398 ذوي الـ labels كلهم. فمهمة بيانات الاختبار كانت قياس عملية النمذجة؛ وبعد أن قستها، تعطي إعادة التدريب على كل صف ذي label النموذجَ المُطلَق شيئًا أكثر يتعلّم منه. سجّل أنك فعلت ذلك، واحتفظ بالمقياس المنشور من تقييم بيانات الاختبار.

:::mistake تحميل ملف نموذج لم تصنعه
ملفات `joblib` هي ملفات pickle، وتحميل pickle قد ينفّذ كودًا اعتباطيًا. عامِل ملف النموذج كبرنامج: لا تحمّل إلا ما أنتجته بنفسك أو ما يأتي من مخزن موثوق ومحكوم الصلاحيات. وحمّله أيضًا بإصدار scikit-learn نفسه الذي درّبت به؛ فالإصدار المختلف قد يعطي التحذير `InconsistentVersionWarning` أو يتصرّف بشكل مختلف. ثبّت الإصدار في ملف المتطلّبات.
:::

## احرس المدخلات

سيقيّم النموذج الهراء بكل سرور. عميل لديه `orders = 0`، أو `mobile_share` يساوي 7، أو عمود مفقود، ينتج احتمالًا يبدو واثقًا كأي احتمال آخر. ضع طبقة رقيقة أمام `predict_proba` تتحقق من المُدخل وتفشل بوضوح:

```python
# assumes `import pandas as pd` and a loaded `bundle` as above
def predict_churn(record: dict, bundle: dict) -> float:
    missing = [f for f in bundle["features"] if f not in record]
    if missing:
        raise ValueError(f"missing fields: {missing}")
    if not 0 <= record["mobile_share"] <= 1:
        raise ValueError("mobile_share must be between 0 and 1")
    row = pd.DataFrame([record])[bundle["features"]]
    return float(bundle["model"].predict_proba(row)[0, 1])
```

اختيار `[bundle["features"]]` يثبّت ترتيب الأعمدة، وهو ما يصرّ عليه scikit-learn كما بيّن القسم 1.

## مهمة دفعية أم API؟

هناك طريقتان شائعتان لتشغيل النموذج:

- **التقييم الدفعي (batch scoring)**: مهمة مجدولة (ليلية أو أسبوعية) تحمّل النموذج، وتقيّم كل عميل نشط من مستودع البيانات، وتكتب الاحتمالات في جدول. وتقرأ أدوات التسويق الجدول. بسيطة، ورخيصة، وسهلة المراقبة، ومناسبة للانقطاع، حيث لا يكلّف القرار المتأخر يومًا شيئًا.
- **الـ API المباشر (online)**: خدمة ويب تقيّم عميلًا واحدًا لكل طلب، في أجزاء من الثانية. وتلزم حين يحدث القرار أثناء جلسة المستخدم، مثل إظهار عرض استبقاء في صفحة الإلغاء.

:::figure من التدريب إلى القرارات
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">ينتج pipeline التدريب ملف نموذج ذا إصدار. يغذّي ملف النموذج إما مهمة دفعية ليلية تكتب الدرجات في جدول لفريق التسويق، وإما API مباشرًا يجيب عن طلبات مفردة. وكلاهما يسجّل المدخلات والتنبؤات في المراقبة، التي تعود لتغذّي إعادة التدريب.</title>
  <rect class="d-box" x="10" y="95" width="130" height="56" rx="10"/>
  <text class="d-label" x="75" y="120" text-anchor="middle">التدريب</text>
  <text class="d-label-muted" x="75" y="140" text-anchor="middle">pipeline + CV</text>
  <path class="d-arrow" d="M140 123 L178 123" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="182" y="95" width="130" height="56" rx="10"/>
  <text class="d-code" x="247" y="120" text-anchor="middle">model.joblib</text>
  <text class="d-label-muted" x="247" y="140" text-anchor="middle">ذو إصدار</text>
  <path class="d-arrow" d="M312 110 L360 62" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M312 136 L360 184" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="364" y="30" width="160" height="56" rx="10"/>
  <text class="d-label" x="444" y="55" text-anchor="middle">مهمة دفعية ليلية</text>
  <text class="d-label-muted" x="444" y="75" text-anchor="middle">الدرجات ← جدول</text>
  <rect class="d-box-accent" x="364" y="160" width="160" height="56" rx="10"/>
  <text class="d-label" x="444" y="185" text-anchor="middle">API مباشر</text>
  <text class="d-label-muted" x="444" y="205" text-anchor="middle">طلب واحد، ms</text>
  <path class="d-arrow" d="M524 58 L568 110" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M524 188 L568 136" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="572" y="95" width="118" height="56" rx="10"/>
  <text class="d-label" x="631" y="120" text-anchor="middle">المراقبة</text>
  <text class="d-label-muted" x="631" y="140" text-anchor="middle">سجلّات، انجراف</text>
  <path class="d-dashed d-line" d="M631 151 C631 240 75 240 75 151" fill="none"/>
  <text class="d-label-muted" x="350" y="244" text-anchor="middle">أعد التدريب حين تقول المراقبة ذلك</text>
</svg>
:::

وإذا احتجت فعلًا إلى API، فخدمة FastAPI صغيرة خيار شائع في Python. هذا المخطّط لا يعمل في المتصفّح، لكنه مكتمل بما يكفي لتشغيله محليًا بـ `uvicorn app:app`:

```python title=app.py
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

# joblib uses pickle: load only model files from your own trusted, access-controlled store
bundle = joblib.load("churn_model.joblib")
app = FastAPI()

class Customer(BaseModel):
    tenure_days: int = Field(ge=0)
    orders: int = Field(ge=1)
    total_spent: float = Field(ge=0)
    avg_order_value: float = Field(ge=0)
    days_since_last_order: int = Field(ge=0)
    used_coupon: int = Field(ge=0, le=1)
    support_tickets: int = Field(ge=0)
    mobile_share: float = Field(ge=0, le=1)

@app.post("/predict")
def predict(customer: Customer):
    row = pd.DataFrame([customer.model_dump()])[bundle["features"]]
    prob = float(bundle["model"].predict_proba(row)[0, 1])
    return {"churn_probability": round(prob, 3), "model_version": bundle["version"]}
```

يتولّى نموذج Pydantic التحقق من المدخلات بشكل تصريحي: الطلب الذي فيه `orders: 0` أو حقل مفقود يحصل على خطأ 422 قبل أن يراه النموذج أصلًا. وإعادة إصدار النموذج مع كل إجابة تتيح تتبّع أي تنبؤ إلى النموذج المحدّد الذي أنتجه. سجّل كل طلب واستجابة؛ فهذه السجلّات هي ما تعمل عليه فحوص الانجراف من الدرس السابق.

## هل نجح؟ أجرِ تجربة

الـ ROC AUC الجيد يعني أن النموذج يرتّب العملاء جيدًا. ولا يعني أن عرض الاسترجاع يغيّر رأي أحد. ولقياس ذلك، احجز شريحة عشوائية من العملاء المُعلَّمين (لنقل 20%) لا يتلقّون العرض. وبعد 90 يومًا، قارن الانقطاع بين المجموعة التي تواصلت معها والمجموعة المحجوزة. الفرق هو أثر العرض على العملاء الذين يختارهم النموذج، ومضروبًا في قيمة العميل يصبح الرقم الذي تهتم به الشركة فعلًا. ودون المجموعة المحجوزة، قد يكون أي انخفاض في الانقطاع بسبب الموسم، أو تعثّر منافس، أو الحظ.

:::why لماذا تستحق المجموعة المحجوزة الإيرادات المفقودة
حجب العروض عن بعض العملاء المعرّضين للخطر يبدو مكلفًا. لكن دونه لا يمكنك التمييز بين نظام يُنقذ العملاء ونظام لا يفعل إلا إنفاق المال على الخصومات، ولن تعرف أبدًا متى يتوقف عن العمل.
:::

## أين أنت الآن

بدأت بسؤال وجدول، وصار لديك الآن إجراء يصمد: صُغ المسألة، وقسّم قبل أن تنظر، وتفوّق على نموذج وهمي للفئة الأكثر شيوعًا وعلى قاعدة، واختر المقاييس بحسب كلفة كل خطأ، وقارن النماذج بالتحقق المتقاطع داخل pipelines خالية من التسرّب، وتحقّق ممن يخدمهم النموذج بشكل أسوأ، وأطلق شيئًا تستطيع مراقبته واختباره. وتبيّن أن البطل هو أبسط نموذج جادّ، وأنت تعرف بالضبط لماذا. عادة السؤال "مقارنةً بماذا؟" هي أثمن ما كان لدى هذه الدورة لتعلّمه، وهي تنطبق دون تغيير على النموذج القادم الذي ستبنيه، أيًّا كان.
