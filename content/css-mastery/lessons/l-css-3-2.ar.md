---
summary: "استبدل الخصائص الفيزيائية بالخصائص المنطقية لتعمل صفحة الجدول في اللغات التي تُكتب من اليمين إلى اليسار مثل العربية، وتعامل مع الأشياء القليلة التي لا تنعكس من تلقاء نفسها."
takeaways:
  - "الخصائص المنطقية تصف التخطيط نسبةً إلى اتجاه النص: `margin-inline-start` هي الـ margin اليسرى في الإنجليزية واليمنى في العربية."
  - "ضبط `dir=\"rtl\"` على الجذر يعكس flexbox وgrid والخصائص المنطقية تلقائيًا؛ أما الخصائص الفيزيائية مثل `padding-left` فتبقى حيث هي."
  - "الـ transforms ومواضع الخلفيات والظلال والأيقونات الاتجاهية لا تنعكس، لذا تعامل معها صراحةً بـ `:dir(rtl)`."
  - "لا تضف `letter-spacing` إلى النص العربي أبدًا؛ فهي تقطع الوصل بين الحروف."
further:
  - title: "Basic concepts of logical properties and values (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values/Basic_concepts
  - title: "Logical properties (web.dev Learn CSS)"
    url: https://web.dev/learn/css/logical-properties
  - title: "Structural markup and right-to-left text in HTML (W3C)"
    url: https://www.w3.org/International/questions/qa-html-dir
quiz:
  - q: "لبطاقة `padding-left: 20px; border-left: 6px solid`. ضبطت `dir=\"rtl\"` على `<html>`. أين أصبح الـ padding والحدّ الآن؟"
    options:
      - text: "على اليمين، لأن المتصفّح يعكس التخطيط كله."
        why: "المتصفّح يعكس التخطيط الواعي بالاتجاه (flex وgrid والخصائص المنطقية)، لكن `left` تعني دائمًا اليسار الفيزيائي."
      - text: "ما زالا على اليسار، الذي أصبح الآن نهاية كل سطر."
        why: "صحيح. الخصائص الفيزيائية تتجاهل الاتجاه. استخدم `padding-inline-start` و`border-inline-start` لتتبع النص."
      - text: "أُزيلا، لأن الخصائص الفيزيائية تُتجاهل في RTL."
        why: "ما زالت تنطبق؛ لكنها تنطبق على الجهة الفيزيائية التي سمّيتها."
    answer: 1
  - q: "في صف flex له `justify-content: flex-start` داخل صفحة `dir=\"rtl\"`، من أين تبدأ العناصر؟"
    options:
      - text: "من اليسار، لأن flex-start هي الحافة اليسرى."
        why: "بداية flexbox تتبع اتجاه السطر (inline)، لذا فالبداية في RTL هي الحافة اليمنى."
      - text: "من المنتصف، لأن flexbox لا يستطيع أن يقرّر."
        why: "يحسم flexbox البداية والنهاية دائمًا من اتجاه الكتابة؛ ولا يلجأ إلى التوسيط أبدًا."
      - text: "يعتمد على ضبط `flex-direction: row-reverse` من عدمه."
        why: "row-reverse ستبادلهما من جديد، لكن مع القيمة الافتراضية `row` الجواب محسوم أصلًا."
      - text: "من اليمين، لأن flex-start تتبع اتجاه السطر."
        why: "صحيح. flexbox وgrid واعيان بالاتجاه من الأساس؛ ولهذا ينعكس معظم تخطيط flex مجانًا."
    answer: 3
  - q: "لرابط «Details →» أيقونة سهم يجب أن تشير إلى الاتجاه المعاكس في العربية. أيّ قاعدة تحقّق ذلك؟"
    options:
      - text: "`.arrow:dir(rtl) { scale: -1 1; }`"
        why: "صحيح. `:dir(rtl)` تطابق العناصر التي اتجاهها المحسوب RTL، والتحجيم الأفقي السالب يعكس الأيقونة."
      - text: "`.arrow { margin-inline-start: 4px; }`"
        why: "هذا ينقل المسافة إلى الجهة الصحيحة، وهذا جيد، لكنه لا يغيّر الاتجاه الذي يشير إليه السهم."
      - text: "`.arrow { direction: rtl; }`"
        why: "`direction` تغيّر اتجاه النص والتخطيط، لا طريقة رسم الحرف أو الأيقونة."
    answer: 0
  - q: "أيّ تصريح يضبط عرض بطاقة الجلسة بطريقة تعمل أيضًا في أنماط الكتابة الرأسية؟"
    options:
      - text: "`width: 20rem`"
        why: "`width` أفقية دائمًا؛ وفي نمط الكتابة الرأسي يمتدّ محور الـ inline من الأعلى إلى الأسفل."
      - text: "`block-size: 20rem`"
        why: "حجم الـ block هو الارتفاع في الكتابة الأفقية، أي البُعد العابر للأسطر لا الممتدّ على طولها."
      - text: "`inline-size: 20rem`"
        why: "صحيح. `inline-size` هو الحجم على امتداد سير النص، فهو العرض في الإنجليزية والعربية، والارتفاع في النص الرأسي."
    answer: 2
---

تضيف Waypoint نسخة عربية من الجدول لفعاليتها الفرعية في القاهرة. التغيير في الـ HTML سمة واحدة، `<html lang="ar" dir="rtl">`، وجاء التحميل الأول صحيحًا نصفه فقط. قائمة الجلسات انعكست كما ينبغي، لأنها صف flex. لكن كل بطاقة ظهر حدّها الملوّن على *اليسار*، وهو في العربية نهاية السطر لا بدايته، وعمود الوقت جاءت مسافته في الجهة الخاطئة، وسهم «Details →» أشار إلى الوراء.

كان التخطيط مكتوبًا بالاتجاهات الفيزيائية: يسار ويمين وأعلى وأسفل. لكن النص لا يجري في اتجاهات فيزيائية؛ إنه يجري من بداية إلى نهاية. وأنت تقرأ هذا الدرس الآن من اليمين إلى اليسار، فالبداية عندك على اليمين، بينما هي على اليسار عند قارئ النسخة الإنجليزية.

## محورا الـ inline والـ block

الخصائص المنطقية (logical properties) تسمّي الجهات بحسب سير النص:

- محور الـ **inline** هو الاتجاه الذي يجري فيه النص داخل السطر الواحد. في الإنجليزية من اليسار إلى اليمين؛ وفي العربية من اليمين إلى اليسار.
- محور الـ **block** هو الاتجاه الذي تتراصّ فيه الأسطر: من الأعلى إلى الأسفل في اللغتين.

:::figure البطاقة نفسها في LTR وRTL: inline-start تنتقل من جهة إلى أخرى، وblock-start تبقى في الأعلى
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">بطاقتان. في البطاقة من اليسار إلى اليمين تقع inline-start على اليسار وinline-end على اليمين. وفي البطاقة من اليمين إلى اليسار تقع inline-start على اليمين وinline-end على اليسار. وفي الحالتين تقع block-start في الأعلى وblock-end في الأسفل.</title>
  <text class="d-label-strong" x="40" y="24">dir="ltr"</text>
  <rect class="d-box" x="40" y="40" width="260" height="140" rx="10"/>
  <rect class="d-box-primary" x="40" y="40" width="10" height="140"/>
  <text class="d-code" x="60" y="116">inline-start</text>
  <text class="d-code" x="196" y="116">inline-end</text>
  <text class="d-label-muted" x="128" y="62">block-start</text>
  <text class="d-label-muted" x="132" y="172">block-end</text>
  <text class="d-label-strong" x="380" y="24">dir="rtl"</text>
  <rect class="d-box" x="380" y="40" width="260" height="140" rx="10"/>
  <rect class="d-box-primary" x="630" y="40" width="10" height="140"/>
  <text class="d-code" x="392" y="116">inline-end</text>
  <text class="d-code" x="522" y="116">inline-start</text>
  <text class="d-label-muted" x="468" y="62">block-start</text>
  <text class="d-label-muted" x="472" y="172">block-end</text>
  <text class="d-label-muted" x="40" y="214">الحدّ border-inline-start في بداية السطر في الحالتين</text>
</svg>
:::

لكل خاصية فيزيائية توأم منطقي:

| فيزيائية | منطقية |
|---|---|
| `margin-left`، `margin-right` | `margin-inline-start`، `margin-inline-end` |
| `padding-top`، `padding-bottom` | `padding-block-start`، `padding-block-end` |
| `border-left` | `border-inline-start` |
| `left`، `right`، `top` | `inset-inline-start`، `inset-inline-end`، `inset-block-start` |
| `width`، `height` | `inline-size`، `block-size` |
| `text-align: left` | `text-align: start` |

وهناك اختصارات أيضًا: `margin-inline: 1rem 2rem` تضبط البداية والنهاية، و`padding-block: 1rem` تضبط جهتي الـ block معًا، و`inset-inline: 0` تحلّ محلّ `left: 0; right: 0`.

## تحويل بطاقة الجلسة

```css title=session-card.css
/* Before: physical */
.session-card {
  border-left: 6px solid var(--track-color);
  padding: 12px 8px 12px 20px;
  text-align: left;
}
.session-card .time { margin-right: 12px; }

/* After: logical */
.session-card {
  border-inline-start: 6px solid var(--track-color);
  padding-block: 12px;
  padding-inline: 20px 8px;
  text-align: start;
}
.session-card .time { margin-inline-end: 12px; }
```

في الإنجليزية النتيجة مطابقة حتى آخر بكسل. وفي العربية ينتقل الحدّ إلى اليمين، حيث تبدأ الأسطر، وتتبعه المسافات. تكتب البطاقة مرة واحدة.

flexbox وgrid يفكّران بهذه الطريقة أصلًا. `flex-direction: row` و`justify-content: flex-start` والعمود 1 في grid كلها تتبع اتجاه السطر، لذا ينعكس صف flex في RTL دون أيّ CSS إضافية. ولهذا عملت قائمة Waypoint من المحاولة الأولى.

:::mistake تحويل الـ margins ونسيان المواضع
تحوّل الفرق `margin` و`padding` وتنسى العناصر ذات التموضع المطلق (absolute). شارة «Live now» عند `right: 8px` تبقى على اليمين في العربية، فوق نص العنوان تمامًا. ابحث في قاعدة الكود عن `left:` و`right:` أيضًا، واستبدلهما بـ `inset-inline-start` و`inset-inline-end`.
:::

## الأحجام منطقية أيضًا

`inline-size` و`block-size` هما الاسمان المنطقيان للعرض والارتفاع، و`max-inline-size: 40ch` هي النسخة المنطقية من سقف عرض القراءة المريح الذي رأيته في درس التحجيم الذاتي. في العربية والإنجليزية تتصرّفان تمامًا مثل `width` و`height`، لأن الخطّين يُكتبان أفقيًا. ولا تختلفان إلا في أنماط الكتابة الرأسية، مثل `writing-mode: vertical-rl` لليابانية أو لعنوان جدول مُدار، حيث يمتدّ محور الـ inline من الأعلى إلى الأسفل. استخدامهما لا يكلّف شيئًا اليوم، ويعني أن الـ component سيصمد إن تغيّر نمط الكتابة لاحقًا. وقاعدة معقولة للفريق: الخصائص المنطقية لكل ما يتعلّق بسير النص، والفيزيائية فقط لما هو فيزيائي بطبيعته، كظلّ يجب أن يسقط إلى الأسفل دائمًا.

## ما لا ينعكس من تلقاء نفسه

بعض الأشياء فيزيائية بطبيعتها وتحتاج إلى قاعدة RTL صريحة:

- **الـ transforms**: `translateX(8px)` تحرّك العنصر إلى اليمين دائمًا.
- **الأيقونات الاتجاهية**: الأسهم، وعلامات «التالي»، واتجاه مؤشّر التقدّم.
- **مواضع الخلفيات والظلال**: `box-shadow: 4px 0 …` تلقي ظلّها إلى اليمين دائمًا.

الـ pseudo-class `:dir()` تطابق الاتجاه المحسوب للعنصر، الموروث من أقرب سمة `dir`:

```css
.more .arrow {
  display: inline-block;
  margin-inline-start: 4px;
}
.more .arrow:dir(rtl) {
  scale: -1 1;   /* mirror horizontally */
}
```

`:dir(rtl)` أفضل من `[dir="rtl"] .arrow` لأنها لا تهتم بمكان السمة، ولا بما إذا كان عنصر متداخل قد عاد إلى LTR. وهي ضمن Baseline منذ ديسمبر 2023، ومتاحة على نطاق واسع منذ منتصف 2026.

ليست كل أيقونة بحاجة إلى الانعكاس. زر التشغيل والساعة وعلامة الصح تعني الشيء نفسه في الاتجاهين؛ أما سهم «رجوع» أو اتجاه المنزلق (slider) فلا. اسأل أحد الناطقين باللغة حين لا تكون متأكّدًا.

## الخط العربي في قاعدتين

الأولى: **لا تطبّق `letter-spacing` على العربية أبدًا**. الحروف العربية تتّصل بما يجاورها؛ وتبعيدها يقطع هذا الوصل ويجعل الكلمات صعبة القراءة. إن كان نظام التصميم لديك يضيف تباعدًا للتسميات بالأحرف الكبيرة، فأعده إلى الصفر بـ `:lang(ar) { letter-spacing: 0; }`. والثانية: كثيرًا ما تحتاج العربية إلى حجم خط وارتفاع سطر أكبر قليلًا من النص اللاتيني لتظهر بالوزن البصري نفسه. اضبط ذلك لكل لغة بـ `:lang(ar)` لا لكل component.

:::tip محتوى مختلط الاتجاه
المحتوى الذي يكتبه المستخدمون (نبذة عن متحدّث، أو عنوان جلسة كُتب بالإنجليزية في الصفحة العربية) قد يكون بأيّ من الاتجاهين. `dir="auto"` على العنصر تترك للمتصفّح أن يختار الاتجاه من أول حرف قوي الاتجاه، و`<bdi>` يعزل اسمًا داخل جملة حتى لا تقفز علامات الترقيم إلى الجهة الخاطئة.
:::

## دورك الآن

بطاقة التمرين مكتوبة بخصائص فيزيائية. حوّلها إلى خصائص منطقية واعكس السهم في RTL. تعرض الفحوصات البطاقة في الاتجاهين. وبعدها ستستبدل الألوان السداسية (hex) في البطاقة بـ `oklch()`، وتبني لوحات ألوان المسارات بـ `color-mix()`.
