---
summary: "اكتب أنماط الـ components بالـ nesting الأصلي في CSS، واستخدم :has() لتنسيق عنصر بحسب ما يحتويه، بما في ذلك فلتر للجدول لا يحتاج إلى JavaScript."
takeaways:
  - "الـ nesting الأصلي يجمع حالات الـ component وأبناءه والـ media queries الخاصة به داخل قاعدته، و`&` تمثّل الـ selector الأب."
  - "الـ selector المتداخل يأخذ specificity `:is()` مطبّقةً على قائمة الأب، لذا إن احتوت قائمة الأب على ID أصبحت كل قاعدة متداخلة ثقيلة بوزن ID."
  - "الـ nesting في CSS لا يلصق السلاسل النصية كما يفعل Sass، لذا لن تُنتج `&__title` أبدًا `.card__title`."
  - "`:has()` تطابق العنصر حين يطابق الـ selector النسبي داخلها، ما يتيح لعنصر أب، أو لعنصر شقيق سابق، أن يتفاعل مع أبنائه أو مع أشقّائه اللاحقين."
further:
  - title: "Using CSS nesting (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using
  - title: ":has() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has
  - title: "Nesting (web.dev Learn CSS)"
    url: https://web.dev/learn/css/nesting
quiz:
  - q: |
      ما الـ selector الذي تُنتجه هذه القاعدة المتداخلة؟
      ```css
      .session-card {
        .speaker & { padding: 0; }
      }
      ```
    options:
      - text: "`.session-card .speaker`"
        why: "هذا ما ستحصل عليه دون `&`، أو مع `& .speaker`. هنا تأتي `&` في النهاية، فتكون البطاقة هي العنصر المتداخل."
      - text: "`.speaker .session-card`"
        why: "صحيح. `&` تحدّد موضع الـ selector الأب؛ ووضعها في النهاية يعني بطاقة جلسة داخل `.speaker`."
      - text: "`.session-card.speaker`"
        why: "هذا يتطلّب `&.speaker` دون مسافة بينهما."
      - text: "غير صالح، لأن `&` يجب أن تأتي أولًا."
        why: "يمكن أن تظهر `&` في أيّ موضع من الـ selector المتداخل، بما في ذلك نهايته."
    answer: 1
  - q: "أيّ selector ينسّق بطاقة الجلسة فقط حين تحتوي على صورة؟"
    options:
      - text: "`.session-card img`"
        why: "هذا يحدّد الصورة نفسها، لا البطاقة."
      - text: "`.session-card > img:parent`"
        why: "لا توجد pseudo-class اسمها `:parent` في CSS؛ `:has()` هي طريقة التحديد بحسب العناصر الداخلية."
      - text: "`.session-card:has(img)`"
        why: "صحيح. تطابق البطاقة حين يجد الـ selector النسبي `img` عنصرًا بداخلها."
    answer: 2
  - q: "أيّ قاعدة تخفي كل بطاقة ليست من مسار design حين يُفعَّل مربّع الاختيار `#only-design` الموجود داخل `.schedule`؟"
    options:
      - text: "`.schedule:has(#only-design:checked) .session-card:not(.track-design) { display: none; }`"
        why: "صحيح. `:has()` تحوّل حالة مربّع الاختيار إلى شرط على السلف المشترك، وبقية الـ selector تستهدف البطاقات."
      - text: "`#only-design:checked .session-card:not(.track-design) { display: none; }`"
        why: "هذا يبحث عن بطاقات داخل مربّع الاختيار، وعناصر input لا يمكن أن يكون لها أبناء."
      - text: "`#only-design:checked + .session-card:not(.track-design) { display: none; }`"
        why: "الرابط `+` لا يصل إلا إلى الشقيق الوحيد الذي يلي مربّع الاختيار مباشرةً، لا إلى البطاقات في مواضع أخرى من الجدول."
    answer: 0
  - q: "كتبت `.card { &__title { font-weight: 700; } }` بحكم العادة من Sass. ماذا يحدث؟"
    options:
      - text: "تنسّق العناصر التي تحمل الـ class `card__title`."
        why: "الـ nesting الأصلي لا يلصق السلاسل النصية؛ `&` تمثّل selector، لا نصًا يُلصق به شيء."
      - text: "لا تنسّق `.card__title`؛ فالـ selector المتداخل لا يعني ما يعنيه في Sass."
        why: "صحيح. لتنسيق عنصر BEM بالـ nesting الأصلي تكتب الـ class كاملًا، مثل `.card__title` في المستوى الأعلى."
      - text: "يتوقّف المتصفّح عن تحليل بقية ملف الأنماط."
        why: "معالجة الأخطاء في CSS تُسقط ما لا تستطيع استخدامه وتكمل؛ ولا تتخلّى عن ملف الأنماط أبدًا."
    answer: 1
---

أمران يزعجان كل من يصون CSS البطاقات في Waypoint. قواعد البطاقة مبعثرة: القاعدة الأساسية هنا، وحالة المرور بعدها بعشرين سطرًا، وتجاوز الوضع الداكن في ملف آخر. وفريق التصميم لا يتوقّف عن طلب أنماط تعتمد على ما *داخل* البطاقة («إن كانت الجلسة ممتلئة، اجعلها باهتة»)، وهذا كان يعني سابقًا تبديل class بـ JavaScript.

الـ nesting الأصلي (التداخل) يحلّ الأمر الأول، و`:has()` تحلّ الثاني.

## الـ nesting الأصلي

تستطيع الآن أن تضع القواعد داخل القواعد، في CSS عادية، دون أيّ خطوة بناء:

```css title=session-card.css
.session-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;

  h2 {
    margin-block: 0 0.5rem;
    font-size: 1.125rem;
  }

  &:hover {
    border-color: #a78bfa;
  }

  .featured & {
    border-width: 2px;
  }

  @media (width >= 48rem) {
    padding: 1.5rem;
  }
}
```

`&` تمثّل الـ selector الأب. `&:hover` تعني «هذه البطاقة حين يمرّ المؤشّر فوقها»، و`.featured &` تعني «هذه البطاقة داخل `.featured`». والـ selector المتداخل بلا `&`، مثل `h2`، يُعامَل كعنصر داخلي: `.session-card h2`. وقواعد `@media` و`@container` المتداخلة تنطبق على الـ selector الأب، فيعيش تغيير الـ padding بجوار الـ padding نفسه.

يمكن أن تبدأ الـ selectors المتداخلة باسم عنصر (`h2` لا `& h2`). كانت التطبيقات الأولى تشترط أن يأتي رمز أولًا؛ أما الآن فكل المتصفّحات الحالية تدعم الصيغة المرنة، والـ nesting ضمن Baseline منذ ديسمبر 2023 (ومتاح على نطاق واسع منذ منتصف 2026).

:::mistake كتابة لواحق على طريقة Sass
`&__title` و`&--featured` تلصقان السلاسل النصية في Sass. الـ nesting الأصلي يعمل على الـ selectors لا على النص، لذا لا يستطيع بناء `.session-card__title`. إن كنت تستخدم BEM فاكتب تلك الـ classes كاملة.
:::

قاعدتان أخريان تحافظان على صحّة الـ nesting. في العمق، تتصرّف `&` كأنها `:is()` ملفوفة حول قائمة الأب، لذا فإن `#keynote, .session-card { h2 { … } }` تعطي *كل* قاعدة `h2` متداخلة specificity بمستوى ID. وتوقّف عند مستويين من العمق: الـ selector الذي لا تستطيع قراءته بنظرة واحدة لن تستطيع تجاوزه بنظرة واحدة.

## `:has()`: نسّق العنصر بحسب ما يحتويه

تأخذ `:has()` selector نسبيًا وتطابق العنصر إن وجد ذلك الـ selector شيئًا:

```css
/* A card that contains a speaker photo gets a two-column layout */
.session-card:has(img) {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 1rem;
}

/* Dim sold-out sessions */
.session-card:has(.badge-full) {
  opacity: 0.6;
}

/* A label whose following input is invalid after the user typed */
label:has(+ input:user-invalid) {
  color: #b91c1c;
}
```

المثال الأخير يُظهر أن `:has()` أكثر من مجرد «selector للعنصر الأب»: `+ input` تنظر إلى *الشقيق التالي*، فيستطيع عنصر سابق أن يتفاعل مع عنصر لاحق. و`:user-invalid` هي القريبة المهذّبة لـ `:invalid`؛ فهي لا تطابق إلا بعد أن يتفاعل المستخدم مع الحقل، فلا يُحمَّل نموذج فارغ مغطّى بالأحمر.

لـ `:has()` حدّان يستحقّان المعرفة قبل أن تصطدم بهما. لا يمكنك وضع `:has()` داخل `:has()` أخرى، ولا وضع pseudo-elements مثل `::before` بداخلها. والـ specificity الخاصة بها تتبع قاعدة `:is()` التي رأيناها سابقًا في هذا القسم: أدقّ وسيط هو الذي يُحسب، لذا فإن `.session-card:has(#keynote-badge)` تحمل وزن ID.

## شريط فلاتر بلا JavaScript

هنا تغيّر `:has()` طريقة بنائك للأشياء. شريط الفلاتر في Waypoint مجموعة من مربّعات الاختيار. ولأن مربّعات الاختيار والبطاقات تشترك في سلف واحد هو `.schedule`، تستطيع حالة مربّع الاختيار أن تقود البطاقات:

```html
<section class="schedule">
  <div class="filters">
    <label><input type="checkbox" id="hide-full"> Hide sold-out</label>
  </div>
  <article class="session-card">…<span class="badge-full">Sold out</span></article>
  <article class="session-card">…</article>
</section>
```

```css
.schedule:has(#hide-full:checked) .session-card:has(.badge-full) {
  display: none;
}
```

اقرأها من اليمين إلى اليسار: أخفِ البطاقة التي تحتوي على شارة «ممتلئة»، حين تكون داخل جدول يحتوي على مربّع `#hide-full` مُفعَّل. ويعيد المتصفّح تقييمها لحظة تغيّر مربّع الاختيار.

:::why لماذا يهمّ هذا
الحالة التي تعيش في الـ DOM (مربّعات اختيار مُفعَّلة، و`<details>` مفتوحة، و`[aria-expanded]`، وحقل عليه الـ focus) أصبحت شيئًا تستطيع CSS قراءته مباشرةً. وتبديل classes أقل في JavaScript يعني أماكن أقل يمكن أن تختلف فيها الواجهة عن الحالة.
:::

:::tip اجعل نقطة الارتكاز ضيّقة
`:has()` سريعة في المحرّكات الحديثة، لكن `body:has(...)` أو `*:has(...)` تطلب من المتصفّح أن يعيد فحص جزء كبير من الصفحة كلما تغيّر أيّ شيء بداخلها. ارتكز على أقرب سلف مشترك، `.schedule` بدل `body`، متى استطعت. و`:has()` نفسها متاحة على نطاق واسع حسب Baseline.
:::

## ثلاثة selectors أخرى تحلّ محلّ JavaScript

تحظى `:has()` بالاهتمام، لكن بضعة selectors أهدأ تستحق مكانها في صفحة Waypoint أيضًا:

```css
/* Highlight the whole filter bar while any control inside it has focus */
.filters:focus-within { outline: 2px solid #a78bfa; }

/* Every card except sold-out and cancelled ones */
.session-card:not(.is-full, .is-cancelled) { cursor: pointer; }

/* Stripe only the visible cards, skipping hidden ones */
.session-card:nth-child(even of :not([hidden])) { background: #f9fafb; }
```

`:focus-within` تطابق العنصر حين يكون عليه أو على أيّ شيء بداخله الـ focus. و`:not()` تقبل قائمة كاملة، فلم تعد تحتاج إلى سلسلة `:not(.a):not(.b)`. وصيغة `of S` في `:nth-child()` لا تعدّ إلا الأشقّاء المطابقين لـ `S`، وهذا يصلح التلوين المتناوب للصفوف الذي ينكسر لحظة يخفي الفلتر أحدها. والثلاثة تعمل في كل المتصفّحات الحالية.

## دورك الآن

في التمرين ستعيد كتابة أنماط البطاقة بالـ nesting، ثم تضيف قاعدتين بـ `:has()`: واحدة تخفي الجلسات الممتلئة حين يُفعَّل مربّع الفلتر، وأخرى تُبرز البطاقة حين يُفعَّل مربّع «الحفظ» فيها. وبهذا يكتمل قسم الـ cascade؛ وبعده ستنتقل من *أيّ* الأنماط ينطبق إلى *أين تذهب الأشياء*، بدءًا بـ flexbox.
