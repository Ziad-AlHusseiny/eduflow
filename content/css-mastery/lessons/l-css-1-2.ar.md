---
summary: "احسب الـ specificity لأيّ selector، واستخدم :is() لتجميع الـ selectors و:where() لكتابة أنماط أساسية تستطيع الـ components تجاوزها بلا عراك."
takeaways:
  - "الـ specificity ثلاثة أعداد منفصلة (الـ IDs، ثم الـ classes والسمات والـ pseudo-classes، ثم الأنواع والـ pseudo-elements) تُقارَن عمودًا بعمود، ولا تُجمع أبدًا في رقم واحد."
  - "`:is()` و`:not()` و`:has()` تأخذ specificity أدقّ وسيط فيها، حتى لو كان الوسيط الأقل دقّة هو الذي طابق العنصر."
  - "الـ specificity في `:where()` صفر دائمًا، ما يجعلها الغلاف المناسب لأنماط إعادة الضبط (resets) والأنماط الأساسية التي يجب أن تخسر أمام أيّ component."
  - "`:is()` و`:where()` تستخدمان قوائم selectors متسامحة: selector واحد غير صالح بداخلهما لا يُسقط القاعدة كلها."
further:
  - title: "Specificity (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity
  - title: ":where() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:where
  - title: ":is() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:is
quiz:
  - q: "ما الـ specificity الخاصة بـ `nav#main a.active:hover`؟"
    options:
      - text: "(1, 2, 2)"
        why: "صحيح. ID واحد (`#main`)؛ وclass واحد مع pseudo-class واحد (`.active` و`:hover`)؛ ونوعان (`nav` و`a`)."
      - text: "(1, 1, 2)"
        why: "الـ pseudo-classes مثل `:hover` تُحسب في العمود الأوسط مع الـ classes، فيكون فيه اثنان لا واحد."
      - text: "(1, 2, 1)"
        why: "كلٌّ من `nav` و`a` selector نوع، لذا فالعمود الأخير قيمته 2."
      - text: "(0, 3, 2)"
        why: "`#main` selector من نوع ID، ومكانه العمود الأول لا مع الـ classes."
    answer: 0
  - q: |
      ما اللون الذي يأخذه الرابط؟
      ```css
      :is(#sidebar, .card) a { color: red; }
      .card .card-link { color: blue; }
      ```
      ```html
      <div class="card"><a class="card-link" href="#">Read</a></div>
      ```
    options:
      - text: "blue، لأن العنصر طابق عبر `.card` لا عبر `#sidebar`."
        why: "`:is()` لا تهتم بالوسيط الذي طابق. إنها تأخذ دائمًا specificity أدقّ وسيط فيها، وهو هنا ID."
      - text: "red، لأن `:is()` تأخذ specificity الـ `#sidebar`."
        why: "صحيح. القاعدة الأولى درجتها (1,0,1) فتتغلّب على (0,2,0)، مع أن العنصر لا يحمل أيّ ID أصلًا."
      - text: "blue، لأنها تأتي لاحقًا في ملف الأنماط."
        why: "الترتيب لا يهم إلا عند تعادل الـ specificity، و(1,0,1) تتغلّب على (0,2,0) مباشرةً."
    answer: 1
  - q: "في ملف إعادة الضبط لديك `ul[class] { list-style: none; margin: 0; }`، والقاعدة `.tags { margin-block: 1rem; }` في أحد الـ components تخسر أمامها. ما أنظف إصلاح؟"
    options:
      - text: "أضف `!important` إلى margin الـ component."
        why: "هذا يكسب هذه المعركة لكنه يبدأ تصعيدًا؛ فالتجاوز التالي سيحتاج إلى `!important` أيضًا، وتفقد القدرة على بناء الثيمات."
      - text: "ارفع selector الـ component إلى `ul.tags.tags`."
        why: "ينجح، لكن كل component سيضطر الآن إلى التفوّق على ملف إعادة الضبط، وهذا هو سباق التسلّح الذي تريد إنهاءه."
      - text: "أعد كتابة إعادة الضبط على شكل `:where(ul[class]) { … }`."
        why: "صحيح. تنخفض specificity إعادة الضبط إلى صفر، فيتجاوزها أيّ selector بـ class في أيّ component."
    answer: 2
  - q: "كُتبت قاعدة بالشكل `:is(.card, :future-state) h3 { … }` والمتصفّح لا يتعرّف على `:future-state`. ماذا يحدث؟"
    options:
      - text: "تُسقَط القاعدة كلها، كما يحدث مع أيّ قائمة selectors غير صالحة."
        why: "هذا سلوك القائمة العادية المفصولة بفواصل، لكن `:is()` و`:where()` تستخدمان قوائم selectors متسامحة."
      - text: "تظل القاعدة تنطبق على `.card h3`؛ ويُتجاهل الـ selector المجهول وحده."
        why: "صحيح. التحليل المتسامح يتخلّص من الوسيط غير الصالح ويحتفظ بالباقي."
      - text: "يُظهر Chrome خطأً في الـ console ويتوقّف عن تحليل ملف الأنماط."
        why: "لا تتوقّف CSS أبدًا عن التحليل بسبب الأخطاء؛ إنها تتجاهل ما لا تفهمه وتكمل."
    answer: 1
---

بدأت صفحة جدول Waypoint حياتها نموذجًا أوليًا سريعًا، وملف أنماطها يشهد على ذلك. في مكان ما قرب أعلاه تقبع القاعدة `#schedule article a { color: #1d4ed8; }`، وفي كل مرة يضيف فريق التصميم رابطًا على هيئة زر داخل بطاقة جلسة، يتحوّل نص الزر إلى الأزرق. «أصلحه» أحدهم الشهر الماضي بـ `!important`، والآن لا أحد يستطيع تغيير ثيم الزر.

هذه مشكلة specificity، وحلّها ليس مطرقة أكبر، بل أن تختار الوزن الذي يجب أن يحمله كل selector.

## الـ specificity ثلاثة أعداد لا عدد واحد

يعطي المتصفّح كل selector درجة على شكل ثلاثية، تُكتب غالبًا (A, B, C):

| العمود | ما يُحسب فيه | أمثلة |
|---|---|---|
| A | selectors الـ ID | `#schedule` |
| B | الـ classes والسمات (attributes) والـ pseudo-classes | `.session`، `[type="checkbox"]`، `:hover` |
| C | selectors الأنواع والـ pseudo-elements | `article`، `a`، `::before` |

الـ selector الشامل `*` والروابط بين الـ selectors (combinators: المسافة و`>` و`+` و`~`) لا تضيف شيئًا. لتقارن selectorين، قارن العمود A؛ فإن تعادلا فقارن B؛ فإن تعادلا فقارن C. لا يوجد «حَمْل» من عمود إلى آخر: أحد عشر class `(0,11,0)` تخسر رغم ذلك أمام ID واحد `(1,0,0)`. النصيحة القديمة «اجمع النقاط» (100 لكل ID و10 لكل class) تنهار هنا تحديدًا، فانسَها.

احسب درجات تعارض Waypoint:

```css
#schedule article a { color: #1d4ed8; }   /* (1, 0, 2) */
.btn { color: #fff; }                     /* (0, 1, 0) */
```

الـ ID في الـ selector الأول يفوز في العمود A، فيصبح نص الزر أزرق. ونقل `.btn` إلى أسفل الملف لا يغيّر شيئًا.

:::why لماذا تؤذي الـ IDs ملفات الأنماط
selector الـ ID يتفوّق على كل selector مبني على الـ classes ستكتبه يومًا. ID واحد في قاعدة أساسية يجبر كل component يلمس الخاصية نفسها على أن يتضمّن ID هو الآخر، أو أن يلجأ إلى `!important`. احتفظ بالـ IDs للروابط الداخلية (anchors) ولنقاط ربط JavaScript، ونسّق بالـ classes.
:::

## `:is()`: تجميع مع شرط خفيّ

تأخذ `:is()` قائمة selectors وتطابق إن طابق أيٌّ منها، فتوفّر عليك تكرار الـ selectors الطويلة:

```css
/* Before */
.session h2, .session h3, .session h4 { text-wrap: balance; }

/* After */
.session :is(h2, h3, h4) { text-wrap: balance; }
```

الشرط الخفيّ هو قاعدة الـ specificity: تأخذ `:is()` الـ specificity الخاصة بـ **أدقّ وسيط فيها**، أيًّا كان الوسيط الذي طابق فعلًا. فالقاعدة `:is(#featured, .session) h2` درجتها (1,0,1) على كل `.session h2`، حتى تلك التي لا يوجد قربها أيّ ID. و`:not()` و`:has()` تتبعان القاعدة نفسها.

وتستخدم `:is()` أيضًا **قائمة selectors متسامحة**. في القائمة العادية مثل `.a, .b:unknown`، يكفي selector واحد غير معروف لإبطال القاعدة كلها. أما داخل `:is()` فيُسقط المتصفّح الوسيط السيئ وحده ويحتفظ بالباقي.

## `:where()`: الغلاف عديم الوزن

تطابق `:where()` تمامًا كما تطابق `:is()`، مع فرق واحد: الـ specificity فيها **صفر** دائمًا، أيًّا كان ما بداخلها. وهذا يجعلها الأداة المناسبة لأيّ نمط يُقصد به أن يكون افتراضيًا:

```css title=base.css
/* Base link style: (0,0,1) because only the trailing `a` counts */
:where(#schedule article) a {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Component: (0,1,0) beats (0,0,1) */
.btn {
  color: #fff;
  background: #6d28d9;
  text-decoration: none;
}
```

ما زالت القاعدة الأساسية تنطبق فقط داخل مقالات `#schedule`، أي أن *نطاقها* لم يتغيّر. الذي انخفض هو *وزنها* فقط. والآن يفوز أيّ component مبني على class بلا حيل.

وهذا افتراض مفيد لقاعدة كود كاملة: غلّف أنماط إعادة الضبط وافتراضيات العناصر بـ `:where()`، واكتب الـ components بـ class واحد، واجعل selectors الحالات (`.btn:hover` و`.btn[aria-pressed="true"]`) أثقل من الـ component بدرجة واحدة.

:::mistake تغليف الـ selector كله بينما المطلوب تخفيف جزء منه
درجة `:where(.session .title)` صفر، لذا حتى قاعدة شاردة مثل `h2 { color: … }` في ملف آخر تتغلّب عليها. غلّف فقط السياق الذي تريده بلا وزن، واترك الجزء الذي يحدّد العنصر خارجه: `:where(.session) .title` يحتفظ بـ (0,1,0).
:::

## أربع طرق لكسب معركة specificity

حين تخسر قاعدة ما، أمامك أربعة خيارات. هذه هي بالترتيب الذي ألجأ إليه:

1. **خفّف الطرف الخاسر.** إن كانت القاعدة الفائزة نمطًا أساسيًا لا ينبغي أن يكون ثقيلًا، فغلّف سياقها بـ `:where()`. هذا يعالج السبب، ويستفيد منه كل component في المستقبل.
2. **افصل المجموعات كاملة بالـ layers.** حين يكون التعارض بين أنواع من CSS (إعادة الضبط مقابل الـ components مقابل أدوات الـ utilities)، تحسمه طبقات الـ cascade نهائيًا. وهذا موضوع الدرس التالي.
3. **ارفع الطرف الفائز.** تكرار الـ class كما في `.btn.btn` يضيف (0,1,0) دون أن يغيّر ما يطابقه. إنها حيلة مشروعة ومحلية، لكن كل تكرار دَين سيدفعه التجاوز التالي.
4. **`!important`.** احتفظ بها للـ utilities التي يجب أن تفوز دائمًا ولتجاوزات إمكانية الوصول. أما استخدامها لترقيع تعارض واحد فيبدأ سباق تسلّح، لأن الطريقة الوحيدة لهزيمتها هي `!important` أخرى.

## قراءة الـ specificity في DevTools

لن تضطر إلى العدّ يدويًا إلى الأبد. مرّر المؤشّر فوق أيّ selector في لوحة Styles في Chrome أو Firefox، وسيُظهر لك التلميح ثلاثية الـ specificity الخاصة به. استخدمه أسبوعًا لتتحقّق من حساباتك الذهنية، وبعدها نادرًا ما ستحتاج إليه.

## دورك الآن

يعطيك التمرين بطاقة جلسة Waypoint مع قاعدة الروابط من النموذج الأولي. خفّف وزن القاعدة الأساسية ليعود الزر زرًّا، بينما تحتفظ الروابط العادية بلونها الأزرق وخطّها السفلي. وستعالج هذا على نطاق أوسع في الدرس التالي، حيث تتيح لك طبقات الـ cascade أن تقرّر أيّ *مجموعات* الأنماط تفوز، قبل أن تُستشار الـ specificity أصلًا.
