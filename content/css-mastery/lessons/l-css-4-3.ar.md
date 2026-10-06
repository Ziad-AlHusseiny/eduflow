---
summary: "قُد حركات CSS بموضع التمرير باستخدام خطوط زمن scroll() وview()، واختر نطاقات الحركة، وأطلقها كتحسين تدريجي ريثما يكتمل دعم Firefox."
takeaways:
  - "`animation-timeline: scroll()` تربط تقدّم الحركة بمقدار ما مُرِّرت حاوية التمرير؛ و`view()` تربطه بمرور عنصر عبر المنطقة المرئية."
  - "`animation-range` تختار أيّ جزء من خط الزمن يشغّل الحركة، مثل `entry 0% cover 30%` لظهور تدريجي ينتهي بعد قليل من ظهور العنصر."
  - "الاختصار `animation` يعيد ضبط `animation-timeline`، لذا أعلن خط الزمن بعد الاختصار."
  - "الحركات المرتبطة بالتمرير تعمل في Chromium وSafari 26 لكن ليس في نسخة Firefox المستقرة بعد، لذا غلّفها في `@supports` وتأكّد من أن المحتوى ظاهر بالكامل دونها."
further:
  - title: "Scroll-driven animation timelines (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines
  - title: "animation-timeline (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline
  - title: "animation-range (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-range
quiz:
  - q: |
      شريط التقدّم لا يتحرّك أبدًا. لماذا؟
      ```css
      .progress {
        animation-timeline: scroll(root);
        animation: grow linear both;
      }
      ```
    options:
      - text: "`scroll(root)` غير صالحة؛ يجب أن تكون `scroll(html)`."
        why: "`root` هي الكلمة المفتاحية الصحيحة لحاوية تمرير المستند؛ و`html` غير مقبولة هناك."
      - text: "الاختصار `animation` يأتي ثانيًا فيعيد ضبط `animation-timeline` إلى `auto`، فتعمل الحركة على الزمن بلا مدة."
        why: "صحيح. الاختصار يعيد ضبط كل خصائص الحركة المفصّلة، بما فيها خط الزمن. ضع `animation-timeline` بعده."
      - text: "الحركات المرتبطة بالتمرير تحتاج إلى `animation-duration: 1s`."
        why: "المدة لا تنطبق على خطوط زمن التمرير؛ التقدّم يأتي من موضع التمرير. و`auto` مناسبة."
    answer: 1
  - q: "يجب أن تظهر بطاقة متحدّث تدريجيًا وهي تدخل الـ viewport، وأن تكون ظاهرة بالكامل حين يظهر 30% منها. أيّ التصريحات تحقّق ذلك؟"
    options:
      - text: "`animation-timeline: scroll(); animation-range: 0% 30%;`"
        why: "خط زمن `scroll()` يتتبّع موضع تمرير الصفحة كلها، فيشير النطاق إلى أول 30% من الصفحة، لا إلى البطاقة."
      - text: "`animation-timeline: view(); animation-range: exit 0% exit 30%;`"
        why: "نطاق exit هو حين تغادر البطاقة الـ viewport، أي الطرف المقابل من مسارها."
      - text: "`animation-timeline: view(); animation-range: entry 0% cover 30%;`"
        why: "صحيح. `view()` تتتبّع ظهور البطاقة، والنطاق يبدأ حين تبدأ بالدخول وينتهي عند 30% من نطاق cover الكامل."
    answer: 2
  - q: "في 2026، يريد زميلك إخفاء شبكة المتحدّثين حتى تُظهر الحركات المرتبطة بالتمرير كل بطاقة تدريجيًا. ما الخطر الرئيسي؟"
    options:
      - text: "في المتصفّحات التي لا تدعم خطوط زمن التمرير، مثل نسخة Firefox المستقرة، قد لا تظهر أبدًا بطاقة تبدأ بـ opacity صفر."
        why: "صحيح. الحركات المرتبطة بالتمرير ليست ضمن Baseline بعد. ضع حالة البداية المخفية داخل `@supports (animation-timeline: view())` لتعرض المتصفّحات غير الداعمة البطاقات بشكل طبيعي."
      - text: "الحركات المرتبطة بالتمرير تحجز الـ main thread دائمًا وتسبّب تقطّعًا."
        why: "حركات الخصائص الملائمة للـ compositor مثل opacity وtransform يمكن أن تعمل خارج الـ main thread؛ وهذه إحدى مزاياها على مستمعات التمرير."
      - text: "قارئات الشاشة تعلن كل إطار من الحركة."
        why: "قارئات الشاشة لا تعلن إطارات الحركة البصرية."
      - text: "كل بطاقة تحتاج إلى خط زمن مسمّى خاص بها."
        why: "خط زمن `view()` المجهول الاسم خاص بكل عنصر تلقائيًا؛ والأسماء لا تلزم إلا لمشاركة خط زمن بين عناصر."
    answer: 0
---

جدول Waypoint طويل: يومان، وأربعة مسارات، وستون جلسة. يريد الفريق لمستين صغيرتين: شريط تقدّم رفيع تحت الرأس يبيّن إلى أين وصلت في الجدول، وبطاقات متحدّثين تنساب إلى مجال الرؤية حين تصل إليها بالتمرير. الطريقة القديمة كانت مستمعًا لحدث `scroll` يقرأ `scrollY`، ويجري بعض الحسابات، ويكتب الأنماط، ستين مرة في الثانية، على الـ main thread، متنافسًا مع كل ما عداه.

الحركات المرتبطة بالتمرير (scroll-driven animations) تترك هذا العمل لـ CSS. تكتب حركة `@keyframes` عادية وتستبدل ساعتها: بدل الزمن، يأتي تقدّمها من التمرير.

## نوعان من خطوط الزمن

**خط زمن تقدّم التمرير**، `scroll()`، يمضي من 0% إلى 100% بينما تُمرَّر حاوية التمرير من الأعلى إلى الأسفل. `scroll(root)` هي المستند؛ و`scroll(nearest)`، وهي الافتراضية، أقرب سلف قابل للتمرير.

**خط زمن تقدّم الظهور**، `view()`، يتتبّع عنصرًا واحدًا وهو يعبر المنطقة المرئية من حاوية التمرير (الـ scrollport): من لحظة ظهور حافته من الأسفل إلى لحظة مغادرته من الأعلى.

```css title=progress.css
@keyframes grow {
  from { scale: 0 1; }
  to   { scale: 1 1; }
}

.progress {
  position: fixed;
  inset: 0 0 auto;
  height: 3px;
  background: var(--track-design);
  transform-origin: 0 50%;
  animation: grow linear both;
  animation-timeline: scroll(root);
}
```

في أعلى الصفحة يكون حجم الشريط صفرًا؛ وفي أسفلها يمتدّ بالعرض الكامل؛ وفي أيّ موضع بينهما يكون متناسبًا تمامًا. و`linear` مهمة هنا: مع `ease` الافتراضية سيندفع الشريط في المنتصف ويزحف عند الطرفين. و`both` تُبقي أول keyframe وآخرها مطبّقين خارج النطاق.

:::mistake إعلان خط الزمن قبل الاختصار
الاختصار `animation` يعيد ضبط كل خصائص الحركة المفصّلة، بما فيها `animation-timeline`، إلى قيمتها الافتراضية `auto`. اكتب `animation-timeline` *بعد* `animation`، وإلا تحوّلت الحركة بصمت إلى حركة زمنية بمدة صفر، ولن يتحرّك الشريط أبدًا.
:::

## الظهور التدريجي مع النطاقات

لبطاقات المتحدّثين، خط زمن الظهور هو الساعة المناسبة، و`animation-range` تختار أيّ جزء من مسار البطاقة يشغّل الحركة:

```css title=speakers.css
@keyframes reveal {
  from { opacity: 0; translate: 0 24px; }
  to   { opacity: 1; translate: 0 0; }
}

.speaker {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}
```

:::figure خط زمن الظهور يتتبّع العنصر عبر الـ scrollport، والنطاقات المسمّاة تحدّد أجزاء ذلك المسار
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">مستطيل طويل يمثّل الـ scrollport. تظهر بطاقة في ثلاثة مواضع: تدخل للتوّ عند الحافة السفلية، ثم داخله بالكامل، ثم تغادر عند الحافة العلوية. تحدّد التسميات نطاق entry عند الحافة السفلية، ونطاق contain وهي داخله بالكامل، ونطاق exit عند الحافة العلوية؛ ويمتدّ cover من أول دخول إلى آخر خروج.</title>
  <rect class="d-box-accent d-dashed" x="200" y="40" width="240" height="180" rx="8"/>
  <text class="d-label-muted" x="210" y="60">scrollport</text>
  <rect class="d-box-primary" x="250" y="200" width="140" height="44" rx="6"/>
  <text class="d-label" x="290" y="227">بطاقة</text>
  <rect class="d-box-primary" x="250" y="110" width="140" height="44" rx="6"/>
  <text class="d-label" x="290" y="137">بطاقة</text>
  <rect class="d-box-primary" x="250" y="18" width="140" height="44" rx="6"/>
  <text class="d-label" x="290" y="45">بطاقة</text>
  <text class="d-code" x="460" y="226">entry</text>
  <text class="d-code" x="460" y="138">contain</text>
  <text class="d-code" x="460" y="46">exit</text>
  <path class="d-line" d="M150 244 L150 18"/>
  <text class="d-code" x="60" y="136">cover</text>
  <path class="d-arrow" d="M600 236 L600 30" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="560" y="254">التمرير إلى الأسفل</text>
</svg>
:::

النطاقات المسمّاة تصف مسار العنصر: **entry** وهو يعبر الحافة السفلية، و**contain** وهو داخل المنطقة بالكامل (أو يغطّيها بالكامل إن كان أطول منها)، و**exit** وهو يعبر الحافة العلوية، و**cover** للرحلة كلها من أول بكسل يدخل إلى آخر بكسل يخرج. و`entry 0% cover 30%` تعني «ابدأ حين تبدأ البطاقة بالدخول، وانتهِ حين تقطع 30% من رحلتها الكاملة»، فتكون كل بطاقة ظاهرة بالكامل قبل وقت كافٍ من وصول المستخدم إليها.

## أطلقها كتحسين

هذه صورة الدعم في أكتوبر 2026: الحركات المرتبطة بالتمرير موجودة في Chromium منذ الإصدار 115 (2023) وفي Safari منذ الإصدار 26 (سبتمبر 2025). ولدى Firefox تطبيق خلف إعداد تجريبي (flag)، وهي من مجالات التركيز في Interop 2026، لكن نسخة Firefox المستقرة لا تدعمها بعد، لذا فالميزة ليست ضمن Baseline.

وهذا يحدّد طريقة كتابتك لها. الـ keyframes الخاصة بالظهور تبدأ من `opacity: 0`، وفي متصفّح يفهم `animation-timeline` لا مشكلة في ذلك. أما في متصفّح لا يفهمها، فإن `animation: reveal linear both` بلا خط زمن حركة زمنية بمدة صفر تنتهي عند آخر keyframe، فتظل البطاقات ظاهرة. لكن لا تعتمد على هذه الدقيقة الخفيّة؛ اجعل النيّة صريحة:

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .speaker {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 30%;
    }
  }
}
```

المتصفّحات غير الداعمة ومستخدمو تقليل الحركة يحصلون على الشبكة العادية الظاهرة بالكامل. والمتصفّحات الداعمة تحصل على الظهور التدريجي.

:::why لماذا يتفوّق هذا على مستمع التمرير
الحركة المرتبطة بالتمرير لـ `opacity` أو `translate` أو `scale` يمكن أن تعمل على الـ compositor، متزامنةً مع التمرير، حتى حين يكون الـ main thread مشغولًا بتشغيل JavaScript لديك. أما مستمع التمرير فيعمل على الـ main thread ويتأخّر دائمًا بإطار. ونسخة CSS أقصر وأنعم، ولا كود فيها يحتاج إلى تنظيف.
:::

وتستطيع أيضًا تسمية خطوط الزمن (`view-timeline-name: --speaker`) ليتبعها عنصر آخر، واستخدام `timeline-scope` لجعل الاسم مرئيًا في مستوى أعلى من الشجرة. الجأ إلى ذلك حين يجب أن يقود موضع تمرير عنصر ما عنصرًا *آخر*؛ أما للتأثيرات المكتفية بذاتها، فتكفي `scroll()` و`view()` بلا أسماء.

## دورك الآن

في التمرين أضف شريط تقدّم القراءة والظهور التدريجي للمتحدّثين، بالترتيب الصحيح، ومحميّين بـ `@supports`. تقرأ الفحوصات خطوط الزمن والنطاقات المحسوبة. وبعدها ستتراجع خطوة عن التأثيرات المنفردة لتنظّم ملف الأنماط كله بحيث يستطيع فريق أن يعمل عليه.
