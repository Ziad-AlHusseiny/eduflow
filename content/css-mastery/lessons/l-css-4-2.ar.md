---
summary: "حرّك الانتقال بين حالتين للصفحة نفسها باستخدام document.startViewTransition()، وأعطِ العناصر أسماء لتتحوّل بسلاسة إلى مواضعها الجديدة، وخصّص الحركة أو عطّلها في CSS."
takeaways:
  - "`document.startViewTransition(update)` تلتقط صورة للصفحة، وتشغّل تحديثك للـ DOM، وتلتقط صورة ثانية، ثم تحرّك الانتقال بينهما بتلاشٍ متقاطع (crossfade) افتراضيًا."
  - "العنصر الذي له `view-transition-name` فريد يحصل على زوج صور خاص به، فيتحرّك ويتغيّر حجمه بسلاسة إلى موضعه الجديد بدل أن يتلاشى."
  - "الحركة مبنية من pseudo-elements مثل `::view-transition-group(name)`، تنسّقها بحركات CSS عادية."
  - "افحص دائمًا وجود `startViewTransition` وشغّل التحديث مباشرةً حين تكون غائبة، وأزل الحركة للمستخدمين الذين يفضّلون تقليل الحركة."
further:
  - title: "View Transition API (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
  - title: "Document: startViewTransition() method (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
  - title: "Same-document view transitions have become Baseline Newly available (web.dev)"
    url: https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
quiz:
  - q: "استدعيت `document.startViewTransition(() => applyFilter())` دون أيّ CSS على الإطلاق. ماذا يرى المستخدم؟"
    options:
      - text: "لا شيء؛ الـ view transitions تحتاج إلى `view-transition-name` قبل أن تتحرّك."
        why: "دون أسماء تُلتقط الصفحة كلها على أنها `root` وتتحرّك رغم ذلك."
      - text: "يُطبَّق الفلتر فورًا، لأن مدة الحركة الافتراضية صفر."
        why: "الافتراضي تلاشٍ متقاطع قصير، لا تغيّر فوري."
      - text: "تلاشيًا متقاطعًا سريعًا للصفحة كلها من الحالة القديمة إلى الجديدة."
        why: "صحيح. زوج صور الـ root يتلاشى تقاطعيًا افتراضيًا؛ والأسماء تضيف حركة لكل عنصر فوق ذلك."
    answer: 2
  - q: "لبطاقتين في الصفحة `view-transition-name: card` كلتيهما. ماذا يحدث حين تبدأ انتقالًا؟"
    options:
      - text: "يُتخطّى الانتقال، لأن الأسماء يجب أن تكون فريدة بين العناصر المرسومة."
        why: "صحيح. الأسماء المكرّرة تجعل المتصفّح يُلغي الحركة؛ لكن تحديث الـ DOM يظل يعمل، فتتغيّر الصفحة فورًا فحسب."
      - text: "تتحرّك البطاقتان معًا كمجموعة واحدة."
        why: "للمجموعة صورة قديمة واحدة وصورة جديدة واحدة بالضبط؛ ولا يستطيع المتصفّح دمج عنصرين في واحد."
      - text: "تتحرّك البطاقة الأولى في الـ DOM وحدها."
        why: "المتصفّح لا يختار فائزًا؛ التكرار يُبطل الانتقال كله."
      - text: "تحصل البطاقة الثانية على اسم مولَّد تلقائيًا."
        why: "مع اسم صريح مكرّر لا يُولَّد شيء؛ ويُتخطّى الانتقال."
    answer: 0
  - q: "كيف تجعل كل view transition في الصفحة تستغرق 250ms؟"
    options:
      - text: "`document.startViewTransition({ duration: 250 })`"
        why: "الدالة تأخذ callback للتحديث (أو كائن خيارات فيه `update` و`types`)، لا مدة."
      - text: "`::view-transition-group(*) { animation-duration: 250ms; }`"
        why: "صحيح. المجموعات تشغّل حركات CSS، فتتحكّم خصائص الحركة العادية في توقيتها."
      - text: "`view-transition-duration: 250ms` على `:root`"
        why: "لا توجد خاصية كهذه؛ التوقيت يأتي من الحركات المطبّقة على الـ pseudo-elements."
    answer: 1
  - q: "أيّ عبارة عن الدعم دقيقة في 2026؟"
    options:
      - text: "الـ view transitions داخل المستند نفسه وعبر المستندات كلتاهما تعملان في كل متصفّح رئيسي."
        why: "الـ view transitions عبر المستندات للتطبيقات متعدّدة الصفحات غير متاحة في Firefox بعد، لذا فهي ليست ضمن Baseline."
      - text: "الـ view transitions لا تعمل إلا في متصفّحات Chromium."
        why: "Safari وFirefox كلاهما يدعمان الآن الـ view transitions داخل المستند نفسه."
      - text: "الـ view transitions تحتاج إلى router من إطار عمل لتعمل."
        why: "إنها API في المتصفّح؛ وأيّ تحديث للـ DOM داخل الـ callback يعمل، بإطار عمل أو دونه."
      - text: "الـ view transitions داخل المستند نفسه ضمن Baseline منذ أكتوبر 2025؛ أما عبر المستندات فليست ضمن Baseline بعد."
        why: "صحيح. أكمل Firefox 144 دعم الانتقالات داخل المستند نفسه؛ أما انتقالات MPA (عبر المستندات) فما زالت تفتقر إلى دعم Firefox."
    answer: 3
---

حين يفعّل زائر Waypoint خيار «Hide sold-out»، تختفي ثلاث بطاقات وتقفز البقية إلى الأعلى لتملأ الفراغات. التغيير فوري وصحيح، لكنه مربك: كانت عينك على البطاقة الرابعة، والآن يقف شيء آخر مكانها. حركة سلسة من التخطيط القديم إلى الجديد كانت ستخبر العين إلى أين ذهبت الأشياء.

تحريك تغييرات التخطيط كان يعني قياس كل عنصر قبل التغيير وبعده وتشغيل حركات FLIP في JavaScript. أما View Transition API فتقوم بالقياس نيابةً عنك.

## التقاط، تحديث، تحريك

```js title=filters.js
const button = document.querySelector('#hide-full');

function applyFilter() {
  const hide = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(hide));
  for (const card of document.querySelectorAll('.session-card.is-full')) {
    card.hidden = hide;
  }
}

button.addEventListener('click', () => {
  if (!document.startViewTransition) {
    applyFilter();          // older browsers: just update
    return;
  }
  document.startViewTransition(() => applyFilter());
});
```

تؤدّي `startViewTransition()` أربعة أشياء بالترتيب:

1. تلتقط صورة (snapshot) للصفحة الحالية.
2. تستدعي دالة التحديث لديك، التي تغيّر الـ DOM كيفما شاءت.
3. تلتقط الحالة الجديدة.
4. تبني شجرة من الـ pseudo-elements تعرض الصورتين القديمة والجديدة، وتحرّك الانتقال بينهما.

:::figure يلتقط الـ view transition الحالة القديمة، ويشغّل التحديث، ويلتقط الحالة الجديدة، ثم يحرّك الانتقال
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">أربع خطوات في صف تصل بينها أسهم: التقاط الصورة القديمة، تشغيل callback التحديث، التقاط الصورة الجديدة، تحريك شجرة الـ pseudo-elements من القديم إلى الجديد.</title>
  <rect class="d-box" x="10" y="50" width="150" height="70" rx="10"/>
  <text class="d-label-strong" x="30" y="80">1. التقاط</text>
  <text class="d-label-muted" x="30" y="102">الحالة القديمة</text>
  <rect class="d-box-primary" x="186" y="50" width="150" height="70" rx="10"/>
  <text class="d-label-strong" x="206" y="80">2. تحديث</text>
  <text class="d-code" x="206" y="102">applyFilter()</text>
  <rect class="d-box" x="362" y="50" width="150" height="70" rx="10"/>
  <text class="d-label-strong" x="382" y="80">3. التقاط</text>
  <text class="d-label-muted" x="382" y="102">الحالة الجديدة</text>
  <rect class="d-box-accent" x="538" y="50" width="150" height="70" rx="10"/>
  <text class="d-label-strong" x="558" y="80">4. تحريك</text>
  <text class="d-code" x="558" y="102">::view-transition</text>
  <path class="d-arrow" d="M160 85 L182 85" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M336 85 L358 85" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M512 85 L534 85" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="10" y="170">الـ DOM الحقيقي في حالته الجديدة أصلًا أثناء تشغيل الخطوة 4.</text>
</svg>
:::

الحركة الافتراضية تلاشٍ متقاطع للصفحة كلها. إنها خفيفة، وأفضل من القفزة بالفعل. تحديث الـ DOM نفسه حقيقي وفوري؛ الـ *صورة* وحدها هي التي تتحرّك، وأثناء تشغيلها تكون الصفحة تحتها في حالتها الجديدة أصلًا. وإن رمى التحديث خطأً أو تُخطّي الانتقال، يظل تغيير الـ DOM يحدث.

## سمِّ العناصر لتتحرّك

لتجعل كل بطاقة تنزلق إلى موضعها الجديد، أعطها `view-transition-name`. كل عنصر مسمّى يحصل على زوج صور خاص به، ويحرّك المتصفّح موضعه وحجمه من القديم إلى الجديد:

```css
.session-card {
  view-transition-name: var(--vt-name);
}
```

```js
// Give every card a unique name once, when the list renders
for (const card of document.querySelectorAll('.session-card')) {
  card.style.setProperty('--vt-name', `card-${card.id}`);
}
```

يجب أن تكون الأسماء **فريدة** بين العناصر المرسومة لحظة الالتقاط. البطاقات التي تختفي تتلاشى (فهي موجودة في الصورة القديمة وحدها)، والبطاقات الباقية تنزلق إلى الأعلى لتملأ الفراغات. وعينك تتبعها.

:::mistake إعادة استخدام اسم واحد لقائمة كاملة
`.session-card { view-transition-name: card; }` تعطي كل البطاقات الاسم نفسه. ومع التكرار لا يستطيع المتصفّح مطابقة الصور، فيتخطّى الانتقال كله وتتغيّر الصفحة فورًا، مع خطأ في الـ console عن أسماء مكرّرة. ولّد اسمًا فريدًا لكل عنصر، من الـ id أو الترتيب.
:::

## تنسيق الحركة

تعيش الحركة في شجرة من الـ pseudo-elements: `::view-transition` في القمة، و`::view-transition-group(name)` لكل عنصر مسمّى (إضافةً إلى `root` لبقية الصفحة)، وداخل كلٍّ منها `::view-transition-old(name)` و`::view-transition-new(name)`. وتُحرَّك بحركات CSS عادية، فتتحكّم فيها بـ CSS عادية:

```css
::view-transition-group(*) {
  animation-duration: 250ms;
  animation-timing-function: ease-out;
}

/* Keep the header still while the list moves */
.site-header { view-transition-name: header; }
::view-transition-group(header) { animation: none; }
```

الرمز `*` يطابق كل المجموعات. ولتقليل الحركة، أزل الحركات ليكون التغيير فوريًا:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

لا توجد `!important` هنا لتهزم حركات المتصفّح الافتراضية؛ فقواعدك العادية تتغلّب عليها أصلًا، كما رأيت في الدرس الأول. إنها موجودة ليتغلّب تفضيل المستخدم أيضًا على أيّ حركة أدقّ كتبتها أنت أو مكتبة ما لمجموعة مسمّاة بعينها، مثل `::view-transition-group(header)`.

وتستطيع أيضًا استهداف اتجاه واحد من التغيير. الصورة القديمة لبطاقة تختفي ليس لها إلا `::view-transition-old(card-s2)`، دون نظير جديد، لذا فإن قاعدة مثل `::view-transition-old(*) { animation-duration: 150ms; }` تجعل البطاقات المغادرة تتلاشى أسرع قليلًا من حركة البطاقات الباقية. وفروق صغيرة كهذه تجعل القائمة تبدو منظّمة لا مخلوطة.

## انتظار الانتقال

تُرجع `startViewTransition()` كائن `ViewTransition` فيه ثلاثة promises. `updateCallbackDone` يُحسم حين يكتمل تحديثك للـ DOM، و`ready` حين توشك الحركة على البدء، و`finished` حين تنتهي وتزول الـ pseudo-elements. استخدم `finished` لنقل الـ focus أو إعلان نتيجة بعد أن تستقرّ الحركة، مثل إرسال الـ focus إلى أول بطاقة باقية لمستخدمي لوحة المفاتيح. لكن لا تجعل أيّ شيء جوهري ينتظر الحركة: ففي متصفّح بلا هذه الـ API لا يوجد كائن انتقال أصلًا.

:::note الدعم
أصبحت الـ view transitions داخل المستند نفسه ضمن Baseline (متاحة حديثًا) في أكتوبر 2025، حين أطلقها Firefox 144. أما الانتقالات عبر المستندات بين صفحات موقع متعدّد الصفحات (وتُفعَّل بـ `@view-transition { navigation: auto; }`) فتعمل في Chromium وSafari لكن ليس في Firefox بعد، لذا تعامل معها على أنها تحسين. وفي الحالتين، المتصفّح الذي لا يدعمها يحدّث الصفحة فحسب، ولهذا يهمّ فحص الميزة في معالج النقر.
:::

## دورك الآن

زر الفلتر في التمرين يخفي الجلسات الممتلئة دون حركة. أعطِ كل بطاقة اسمًا فريدًا، وغلّف التحديث في view transition مع بديل احتياطي، واضبط مدة المجموعات على 250ms، وأوقف الحركة لمن يفضّلون تقليلها. تراقب الفحوصات `startViewTransition` بـ spy وتحذفها أيضًا لتتأكّد من أن بديلك الاحتياطي يعمل. وبعدها ستربط تقدّم الحركة بالتمرير بدل الزمن.
