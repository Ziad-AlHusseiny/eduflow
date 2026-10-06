---
summary: "أضف transitions وحركات keyframes تبدو مقصودة، وحرّك العناصر عند ظهورها من display: none باستخدام @starting-style، واحترم prefers-reduced-motion دون أن تكسر الواجهة."
takeaways:
  - "اذكر الخصائص التي تحرّكها بالتحديد (`transition: translate 200ms ease-out`) بدل `all`، حتى لا تتحرّك تغييرات الثيم وخصائص التخطيط بالصدفة."
  - "استخدم الـ transitions للتغيّر بين حالتين، و`@keyframes` للحركة متعدّدة الخطوات أو المتكرّرة."
  - "`@starting-style` تحدّد القيم التي ينطلق منها العنصر في الـ transition حين يظهر أول مرة، ما يجعل حركات الدخول من `display: none` ممكنة في CSS."
  - "غلّف الحركة غير الضرورية في `@media (prefers-reduced-motion: no-preference)`، فيحصل من طلبوا حركة أقل على واجهة هادئة افتراضيًا."
further:
  - title: "Using CSS transitions (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using
  - title: "@starting-style (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style
  - title: "prefers-reduced-motion (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
quiz:
  - q: "لبطاقة `transition: all 300ms`. حين يتحوّل المستخدم إلى الوضع الداكن، تتلاشى ألوان الصفحة كلها ببطء. ما أنظف إصلاح؟"
    options:
      - text: "أزل الـ transition في الوضع الداكن بـ media query."
        why: "هذا يعالج العَرَض في حالة واحدة؛ وأيّ تغيير آخر في خاصية (تعديل padding عند breakpoint) سيظل يتحرّك."
      - text: "اضبط `transition-duration: 0s` على `:root`."
        why: "الـ transitions غير موروثة، فلن يصل ذلك إلى البطاقة، وسيعطّل تأثير المرور أيضًا."
      - text: "حرّك الخصائص التي تقصدها فقط، مثل `transition: translate 200ms, box-shadow 200ms`."
        why: "صحيح. ذكر الخصائص يجعل الحركة مقصودة؛ وتتغيّر الألوان والتخطيط فورًا ما لم تطلب غير ذلك."
    answer: 2
  - q: "يظهر إشعار منبثق (toast) بالتبديل من `display: none` إلى `display: block`، والـ transition الخاص بـ `opacity` لا يعمل أبدًا. لماذا؟"
    options:
      - text: "لا يمكن تحريك opacity على العناصر التي تستخدم display."
        why: "تحريك opacity يعمل جيدًا؛ المشكلة أن العنصر ليس له نمط سابق ينطلق منه."
      - text: "حين يُرسم العنصر أول مرة لا توجد حالة سابقة، فلا شيء ينطلق منه الـ transition؛ و`@starting-style` توفّر هذه الحالة."
        why: "صحيح. `@starting-style { .toast { opacity: 0; } }` تعطي المتصفّح قيم البداية لأول تحديث للنمط."
      - text: "الـ transitions لا تعمل إلا عند المرور بالمؤشّر."
        why: "الـ transitions تعمل مع أيّ تغيّر في النمط المحسوب، أيًّا كان سببه."
      - text: "يجب ألّا تقل المدة عن 500ms ليلاحظها المتصفّح."
        why: "لا يوجد حدّ أدنى للمدة؛ حتى الـ transitions بمدة 100ms تعمل."
    answer: 1
  - q: "أيّ نهج يخدم على أفضل وجه المستخدمين الذين فعّلوا «تقليل الحركة» في نظام التشغيل؟"
    options:
      - text: "ضع الحركة الزخرفية داخل `@media (prefers-reduced-motion: no-preference)`، واجعل التلاشي البسيط أو التغيّر الفوري هو الافتراضي."
        why: "صحيح. تصبح الحركة اختيارية، وتظل الواجهة تعبّر عن تغيّرات الحالة للجميع."
      - text: "أخفِ كل عنصر متحرّك حين يكون تقليل الحركة مفعّلًا."
        why: "إخفاء المحتوى يحذف معلومات. المستخدمون طلبوا حركة أقل، لا واجهة أقل."
      - text: "أبطئ كل حركة إلى ثانيتين."
        why: "الحركة الأبطأ تظل حركة، والحركات الطويلة تجعل الواجهة تبدو معطوبة."
    answer: 0
---

يطلب موجز التصميم في Waypoint ثلاث لمسات من الحركة: بطاقات الجلسات ترتفع قليلًا عند المرور فوقها، والجلسة الجارية الآن لها نقطة «Live» نابضة، وإشعار منبثق (toast) ينزلق إلى الداخل حين تحفظ جلسة. الثلاث صغيرة. والثلاث يمكن أن تسوء بطرق تجعل الصفحة تبدو رخيصة، أو تُشعر بعض الناس بتعب جسدي حقيقي.

يغطّي هذا الدرس الأدوات (الـ transitions والـ keyframes و`@starting-style`) والمسؤولية (`prefers-reduced-motion`).

## الـ transitions: بين حالتين

الـ transition (الانتقال) يحرّك خاصية حين تتغيّر قيمتها المحسوبة، لأيّ سبب: مرور المؤشّر، أو تبديل class، أو media query. أنت تختار الخصائص والمدة ومنحنى التسارع (easing):

```css title=session-card.css
.session-card {
  transition:
    translate 200ms ease-out,
    box-shadow 200ms ease-out;

  &:hover,
  &:focus-within {
    translate: 0 -2px;
    box-shadow: 0 6px 16px rgb(15 23 42 / 0.12);
  }
}
```

ثلاثة اختيارات تؤدّي العمل هنا. **خصائص محدّدة**: ترتفع البطاقة ويكبر ظلّها، ولا يتحرّك شيء آخر. **مدة قصيرة**: من 150 إلى 250ms تبدو مستجيبة لتغييرات الواجهة الصغيرة؛ وما يزيد على 400ms يبدو متثاقلًا حين يكون المستخدم في انتظاره. **التسارع**: `ease-out` تبدأ سريعة ثم تستقرّ، وهذا يناسب ما يستجيب للمستخدم.

وخصائص التحويل المنفردة (`translate` و`scale` و`rotate`) تستحق أن تفضّلها على `transform`: يمكن تحريك كلٍّ منها وتجاوزه باستقلال، فلا يمسح ارتفاع المرور قيمة scale ضُبطت في مكان آخر.

:::mistake transition: all
`transition: all 300ms` تحرّك كل خاصية تتغيّر، بما فيها خصائص لم تفكّر فيها قطّ. انتقل إلى الوضع الداكن فيتلاشى كل لون في البطاقة ببطء؛ وغيّر الـ padding عند breakpoint فتتمطّط البطاقة أمام العين. اذكر الخصائص التي تقصدها. كتابة أكثر بقليل، ومفاجآت أقل بكثير.
:::

## الـ keyframes: حركة متعدّدة الخطوات ومتكرّرة

حين يكون للحركة أكثر من خطوتين، أو تتكرّر من تلقاء نفسها، تحتاج إلى `@keyframes`:

```css
@keyframes pulse {
  0%   { scale: 1;   opacity: 1; }
  70%  { scale: 2.2; opacity: 0; }
  100% { scale: 2.2; opacity: 0; }
}

.live-dot::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.6s ease-out infinite;
}
```

هالة النقطة تكبر وتتلاشى، ثم تتوقّف برهة (الثبات من 70% إلى 100%) قبل أن تتكرّر. وتحريك `scale` و`opacity` مقصود: هاتان الخاصيتان تستطيعان العمل على الـ compositor دون إعادة تشغيل التخطيط، وهذا ما يشرحه آخر درس في هذه الدورة.

## حركات الدخول بـ @starting-style

الإشعار المنبثق للحفظ يكون `display: none` إلى أن يُظهره class. لا تستطيع الـ transitions أن تعمل عند ظهوره الأول، لأن العنصر المرسوم حديثًا ليس له نمط سابق يبدأ منه. و`@starting-style` توفّر هذا النمط:

```css
.toast {
  opacity: 1;
  translate: 0 0;
  transition:
    opacity 200ms ease-out,
    translate 200ms ease-out,
    display 200ms allow-discrete;
}

@starting-style {
  .toast {
    opacity: 0;
    translate: 0 8px;
  }
}

.toast[hidden] {
  display: none;
  opacity: 0;
}
```

حين تُزال السمة `hidden`، يبدأ المتصفّح الإشعار من قيم `@starting-style` وينتقل إلى القيم العادية. و`transition-behavior: allow-discrete` (المكتوبة هنا `allow-discrete` في الاختصار) تتيح لـ `display` أن تنقلب في اللحظة المناسبة عند الخروج، فيكون التلاشي ظاهرًا قبل أن يختفي العنصر. `@starting-style` و`transition-behavior` ضمن Baseline 2024، لذا تعمل حركة الدخول في كل المتصفّحات الحالية. أما تحريك `display` نفسها عند الخروج فليس ضمن Baseline بعد (يدعمه Chrome وSafari دون Firefox)، فيختفي الإشعار هناك فورًا بدل أن يتلاشى؛ وفي المتصفّحات الأقدم يظهر ببساطة دون حركة. وكلاهما بديل احتياطي جيد تمامًا.

## احترم تقليل الحركة

بعض الناس يصابون بالدوار أو الغثيان أو التشتّت من الحركة على الشاشة، خصوصًا الحركة عبر مسافات طويلة، والـ parallax، والتكبير والتصغير. لأنظمة التشغيل إعداد «تقليل الحركة»، وتقرؤه CSS بـ `prefers-reduced-motion`.

النمط الأمتن يجعل الحركة اختيارية:

```css
@media (prefers-reduced-motion: no-preference) {
  .session-card {
    transition: translate 200ms ease-out, box-shadow 200ms ease-out;
  }
  .live-dot::after {
    animation: pulse 1.6s ease-out infinite;
  }
}
```

المستخدمون الذين لم يطلبوا تقليل الحركة يحصلون على كل شيء. ومن طلبوه يحصلون على بطاقة ثابتة ونقطة ثابتة، وتظل الواجهة تعمل، لأن أيّ معلومة لا تعتمد على الحركة.

:::why لماذا التقليل لا الإزالة
تقليل الحركة لا يعني غياب أيّ استجابة بصرية. تغيّر الحالة الذي ينزلق 200px عبر الشاشة يمكن أن يصبح تلاشيًا سريعًا؛ وارتفاع المرور يمكن أن يصبح تغيّرًا في لون الحدّ. احتفظ بالمعنى، وتخلَّ عن الحركة. ولا تجعل أيّ معلومة تعتمد على الحركة وحدها أبدًا: نقطة Live بجوارها النص «Live now» أيضًا.
:::

وسترى أيضًا شبكة أمان عامة تضبط مدة كل حركة وكل transition على ما يقارب الصفر داخل `@media (prefers-reduced-motion: reduce)`. إنها حاجز احتياطي معقول للأدوات الخارجية (widgets)، لكنها كاستراتيجية وحيدة فظّة: قد تربك السكربتات التي تعتمد على توقيت الحركة (وهي تستخدم مدة صغيرة غير صفرية تحديدًا لأن transition بمدة `0s` لا يُطلق `transitionend` أبدًا)، وتزيل التلاشيات غير المؤذية مع الحركة المؤذية.

## دورك الآن

بطاقة التمرين فيها مرور فوري، ونقطة ثابتة، ولا تعامل مع تقليل الحركة. أضف transition للمرور على خصائص محدّدة، ونبضًا متكرّرًا على النقطة، وغلّف الحركة الزخرفية لتعمل فقط عند المستخدمين الذين لم يطلبوا تقليلها. وبعدها ستحرّك الانتقال بين حالات الصفحة كاملة باستخدام الـ view transitions.
