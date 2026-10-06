---
summary: "اجعل بطاقة الجلسة تغيّر تخطيطها بحسب عرض الخانة التي تجلس فيها، باستخدام container queries للحجم ووحدات الحاوية واستعلامات النمط على الـ custom properties."
takeaways:
  - "`container-type: inline-size` تحوّل العنصر إلى حاوية (container)، و`@container (width >= 400px)` تنسّق العناصر داخله بحسب عرض ذلك العنصر، لا عرض الـ viewport."
  - "لا يستطيع العنصر أن يستعلم عن نفسه؛ ضع `container-type` على غلاف واكتب الاستعلام للعناصر التي بداخله."
  - "احتواء الحجم الأفقي (inline-size containment) يعني أن عرض الحاوية لا يمكن أن يأتي من محتواها، لذا تنهار الحاوية الموضوعة في سياق يتقلّص على محتواه ما لم يعطها شيءٌ ما عرضًا."
  - "وحدات الحاوية مثل `cqi` (1% من الحجم الأفقي للحاوية) تتيح للخطوط والمسافات أن تتدرّج مع الـ component."
  - "استعلامات النمط على الـ custom properties، مثل `@container style(--variant: featured)`، دخلت Baseline في مايو 2026؛ أما استعلامات الحجم فضمن Baseline منذ 2023."
further:
  - title: "Container size and style queries (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries
  - title: "@container (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@container
  - title: "Container queries (web.dev Learn CSS)"
    url: https://web.dev/learn/css/container-queries
quiz:
  - q: |
      لماذا لا تنطبق هذه القاعدة أبدًا؟
      ```css
      .session-card { container-type: inline-size; }
      @container (width >= 400px) {
        .session-card { display: grid; }
      }
      ```
    options:
      - text: "`@container` تحتاج إلى اسم حاوية لتعمل."
        why: "الأسماء اختيارية. الاستعلام بلا اسم يستخدم أقرب حاوية من الأسلاف."
      - text: "يجب أن يستخدم الاستعلام `min-width` بدل صيغة المدى."
        why: "الـ container queries تدعم صيغة المدى (`width >= 400px`) في كل متصفّح يدعمها."
      - text: "`inline-size` لا تعمل إلا على حاويات grid."
        why: "أيّ عنصر يمكن أن يكون حاوية حجم، أيًّا كان نوع الـ display فيه."
      - text: "البطاقة تستعلم عن نفسها، لكن الـ container query لا تنسّق إلا العناصر داخل الحاوية."
        why: "صحيح. البطاقة تبحث عن حاوية بين أسلافها فلا تجد. ضع `container-type` على الغلاف (الخانة) ونسّق البطاقة من داخل الاستعلام."
    answer: 3
  - q: "وضعت `container-type: inline-size` على عنصر flex بلا عرض مضبوط، فانهار إلى عرض صفر. لماذا؟"
    options:
      - text: "احتواء الحجم الأفقي يمنع عرض العنصر من الاعتماد على محتواه، وعرض عنصر flex يأتي عادةً من محتواه."
        why: "صحيح. مع الاحتواء لا يساهم محتوى العنصر بشيء في حجمه؛ أعطه `flex: 1` أو عرضًا، أو ضع الحاوية على عنصر يحدّد حجمَه أبوه."
      - text: "الـ container queries لا تعمل داخل flexbox."
        why: "إنها تعمل في كل مكان؛ المشكلة في كيفية حصول الحاوية نفسها على حجمها."
      - text: "يخفي المتصفّح الحاويات حتى يطابق أحد الاستعلامات."
        why: "الحاويات تُرسم بشكل طبيعي سواء طابق أيّ استعلام أم لا."
    answer: 0
  - q: "لعنوان بطاقة `font-size: clamp(1rem, 4cqi, 1.5rem)`. إلامَ تشير `4cqi`؟"
    options:
      - text: "4% من عرض الـ viewport."
        why: "هذه `4vw`. وحدات `cqi` تُحسب نسبةً إلى أقرب حاوية، لا إلى الـ viewport."
      - text: "4% من الحجم الأفقي لأقرب حاوية حجم."
        why: "صحيح. في خانة عرضها 400px تساوي `4cqi` 16px؛ وفي خانة عرضها 600px تساوي 24px (وتُحدّ عند 1.5rem)."
      - text: "4% من عرض العنوان نفسه."
        why: "لا يستطيع العنصر قياس نفسه بهذه الطريقة؛ وحدات الحاوية تنظر دائمًا إلى حاوية من الأسلاف."
      - text: "أربعة أضعاف حجم خط البطاقة."
        why: "مضاعفات حجم الخط تُكتب `4em`؛ و`cqi` لا علاقة لها بحجم الخط."
    answer: 1
  - q: "أيّ استعلام يطبّق الأنماط حين يضبط العنصر الأب `--variant: featured`؟"
    options:
      - text: "`@media (--variant: featured)`"
        why: "الـ media queries تختبر الجهاز والـ viewport؛ ولا تستطيع قراءة الـ custom properties."
      - text: "`@supports (--variant: featured)`"
        why: "`@supports` تختبر ما إذا كان المتصفّح يفهم تصريحًا ما، لا القيمة التي يحملها عنصر."
      - text: "`@container style(--variant: featured)`"
        why: "صحيح. استعلامات النمط تختبر القيمة المحسوبة لـ custom property على أقرب حاوية، وكل عنصر حاوية نمط افتراضيًا."
    answer: 2
---

تستخدم Waypoint بطاقة الجلسة نفسها في ثلاثة أماكن: شبكة الجدول الرئيسية، وشريط جانبي ضيّق بعنوان «Up next»، وواجهة عريضة بكامل العرض للـ keynote. الـ media query لا تستطيع إلا أن تسأل «ما عرض الشاشة؟»، والشاشة بالعرض نفسه في الحالات الثلاث. فحصلت البطاقة في الشريط الجانبي على التخطيط العريض، مضغوطًا في 280px، إلى أن أضاف أحدهم تجاوزًا `.sidebar .session-card`، ثم تجاوزًا `.hero .session-card`، وهكذا.

لا ينبغي أن تهتم البطاقة بمكانها. ينبغي أن تهتم بالمساحة المتاحة لها. والـ container queries (استعلامات الحاوية) تتيح لها أن تسأل عن ذلك بالضبط.

## أنشئ حاوية ثم استعلم عنها

خطوتان. الأولى أن تعلن أيّ عنصر هو الحاوية، أي الخانة التي تجلس فيها البطاقة:

```css title=slots.css
.slot {
  container: session / inline-size;
}
```

هذا الاختصار يضبط `container-name: session` و`container-type: inline-size`. النوع يخبر المتصفّح أنك ستستعلم عن الحجم الأفقي (inline size) لهذا العنصر، أي عرضه في الكتابة الأفقية، لذا يجب أن يستطيع حساب هذا العرض دون النظر إلى المحتوى بداخله.

والثانية أن تكتب تخطيط البطاقة على شكل استعلام عن تلك الحاوية:

```css title=session-card.css
.session-card {
  display: block;
}

@container session (width >= 400px) {
  .session-card {
    display: grid;
    grid-template-columns: 6rem 1fr;
    gap: 1rem;
  }
}
```

الآن تتراصّ البطاقة عموديًا في الشريط الجانبي بعرض 280px، وتنتقل إلى عمودين في الشبكة بعرض 640px، دون أن تعرف شيئًا عن أيٍّ منهما. الاسم اختياري؛ و`@container (width >= 400px)` بلا اسم تستخدم أقرب سلف له نوع حاوية حجم. والأسماء تفيد حين تتداخل الحاويات وتريد تخطّي إحداها.

:::figure البطاقة نفسها في خانتين: الاستعلام يقيس الخانة لا الـ viewport
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">نافذة متصفّح فيها خانة جانبية ضيّقة وخانة رئيسية عريضة. البطاقة في الخانة الضيّقة متراصّة: الوقت فوق العنوان. والبطاقة في الخانة العريضة جنبًا إلى جنب: عمود الوقت بجوار العنوان.</title>
  <rect class="d-box" x="10" y="10" width="660" height="230" rx="12"/>
  <text class="d-label-muted" x="24" y="34">الـ viewport: نفسه للاثنتين</text>
  <rect class="d-box-accent d-dashed" x="24" y="50" width="200" height="176" rx="10"/>
  <text class="d-code" x="36" y="72">.slot 280px</text>
  <rect class="d-box-primary" x="40" y="86" width="168" height="40" rx="6"/>
  <text class="d-label" x="52" y="111">09:30</text>
  <rect class="d-box-primary" x="40" y="134" width="168" height="76" rx="6"/>
  <text class="d-label" x="52" y="160">العنوان</text>
  <rect class="d-box-accent d-dashed" x="244" y="50" width="412" height="176" rx="10"/>
  <text class="d-code" x="256" y="72">.slot 640px</text>
  <rect class="d-box-primary" x="260" y="86" width="96" height="124" rx="6"/>
  <text class="d-label" x="272" y="111">09:30</text>
  <rect class="d-box-primary" x="366" y="86" width="274" height="124" rx="6"/>
  <text class="d-label" x="378" y="111">العنوان</text>
</svg>
:::

## القاعدتان اللتان يتعثّر بهما الجميع

**لا يستطيع العنصر أن يستعلم عن نفسه.** الاستعلام يبحث عن حاوية بين *الأسلاف*، لذا فإن `container-type` على `.session-card` مع `@container { .session-card { … } }` لا تفعل شيئًا للبطاقة نفسها. ضع الحاوية على غلاف.

**الاحتواء يغيّر طريقة تحديد حجم الحاوية.** احتواء `inline-size` يعني أن عرض الحاوية لا يمكن أن يعتمد على أبنائها؛ وإلا لاستطاع الاستعلام أن يغيّر المحتوى، فيتغيّر العرض، فيتغيّر الاستعلام، إلى ما لا نهاية.

:::mistake حاوية تنهار إلى الصفر
ضع `container-type: inline-size` على عنصر يتقلّص على محتواه (عنصر flex بلا حجم، أو inline-block، أو صندوق بـ `width: fit-content`)، وسينهار، لأن عرضه كان يأتي من محتواه ولم يعد يستطيع. اجعل الحاوية عنصرًا يأتي عرضه من الخارج: عنصر block، أو خلية grid، أو عنصر flex له `flex: 1`.
:::

## وحدات الحاوية

داخل الحاوية تحصل على وحدات نسبية إليها: `cqi` تساوي 1% من الحجم الأفقي للحاوية، و`cqb` تساوي 1% من حجمها الرأسي (block size)، و`cqmin`/`cqmax` الأصغر أو الأكبر بينهما. إنها تجعل الـ component يتدرّج بسلاسة، لا عند نقاط التحوّل فقط:

```css
.session-card h3 {
  font-size: clamp(1rem, 0.75rem + 2cqi, 1.5rem);
}
```

في الشريط الجانبي بعرض 280px يبقى العنوان قرب 1rem؛ وفي خانة بعرض 640px يكبر نحو 1.5rem. وإن لم يكن أيّ سلف حاوية حجم، ترجع وحدات الحاوية إلى وحدات الـ viewport الصغيرة، فلا تنكسر أبدًا.

## استعلامات النمط للأشكال المختلفة (variants)

الحجم ليس الشيء الوحيد الذي قد تستجيب له البطاقة. بطاقة الـ keynote في الواجهة الرئيسية *variant* (شكل مختلف)، واستعلامات نمط الحاوية تتيح للعنصر الأب أن يعلن ذلك عبر custom property:

```css
.hero { --variant: featured; }

@container style(--variant: featured) {
  .session-card {
    border-inline-start: 6px solid #6d28d9;
  }
}
```

لا تحتاج إلى `container-type` هنا: كل عنصر حاوية نمط افتراضيًا، فيفحص الاستعلام قيمة `--variant` المحسوبة على أقرب سلف. واستعلامات النمط تعمل اليوم مع الـ custom properties فقط؛ أما الاستعلام عن الخصائص العادية مثل `style(display: grid)` فغير مدعوم في أيّ مكان بعد.

:::note الدعم
استعلامات الحجم (size container queries) ووحدات الحاوية ضمن Baseline منذ فبراير 2023. أما استعلامات النمط على الـ custom properties فأصبحت ضمن Baseline (متاحة حديثًا) في مايو 2026، حين أطلقها Firefox 151 (وChrome منذ 111، وSafari منذ 18). إن كنت تدعم إصدارات أقدم من Firefox، فتعامل مع التنسيق عبر استعلامات النمط على أنه تحسين، وتأكّد من أن البطاقة الافتراضية تبدو مكتملة دونه.
:::

## دورك الآن

في التمرين تستخدم البطاقة media query، فتحصل على التخطيط الخاطئ في خانة واحدة على الأقل. حوّل `.slot` إلى حاوية مسمّاة، وانقل التخطيط إلى container query عند 400px، وأضف استعلام نمط للشكل المميّز. تغيّر الفحوصات عرض الخانة وتضبط `--variant` عليها لترى استجابة البطاقة. وبهذا يُغلق قسم التخطيط؛ وبعده ستجعل الخطوط والمسافات تتدرّج بمرونة عبر كل أحجام الخانات هذه.
