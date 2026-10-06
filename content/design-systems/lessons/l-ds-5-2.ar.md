---
summary: أضف علامة تجارية ثانية إلى نظام التصميم بطبقة علامة صغيرة بين الـ primitives والـ semantic tokens، وتحقّق من التباين لكل علامة، وحدّد ما يحقّ للعلامات تغييره وما لا يحقّ لها.
takeaways:
  - العلامة تغيّر الشخصية (تدرّج الألوان، والخطوط، والأشكال) عبر مجموعة صغيرة من brand tokens؛ أما السلوك والمسافات وإمكانية الوصول فتبقى مشتركة.
  - ضع طبقة للعلامة بين الـ primitives والـ semantic tokens، حتى تربط كل علامة الأسماء الدلالية نفسها بلوحة ألوانها الخاصة.
  - يجب فحص التباين لكل علامة على حدة، وقد تحتاج علامة درجة مختلفة من تدرّجها للدور الدلالي نفسه.
  - حين يمكن أن تظهر العلامات جنبًا إلى جنب، أعد تعريف الروابط الدلالية تحت الـ selector الخاص بالعلامة حتى تُحسب داخل نطاق كل علامة.
further:
  - title: Understanding SC 1.4.3 Contrast (Minimum) (W3C)
    url: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
  - title: Extend a variable collection (Figma)
    url: https://help.figma.com/hc/en-us/articles/36346281624471-Extend-a-variable-collection
  - title: Using CSS custom properties (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
quiz:
  - q: يطلب فريق علامة Tidewater أن يُغلق الـ Dialog الخاص بها حين ينقر الناس خارجه، بينما لا يفعل ذلك Dialog الخاص بـ Northwind. كيف يجب أن يستجيب النظام؟
    options:
      - text: إضافة prop باسم `brand` إلى Dialog يبدّل السلوك.
        why: السلوك الخاص بكل علامة داخل المكوّنات يعني أن كل مكوّن يجب أن يعرف عن كل علامة، وهذا لا يصمد بعد علامتين.
      - text: نسخ Dialog منفصل لـ Tidewater.
        why: نسختا Dialog ستتباعدان في الإصلاحات وإمكانية الوصول، وهذه هي التكلفة التي وُجد النظام لتجنّبها.
      - text: معاملته كسؤال عن سلوك المنتج للعلامتين معًا يُحسم في مراجعة الـ API؛ فالعلامات تغيّر الشكل والصوت لا السلوك.
        why: صحيح. إن كان الإغلاق بالنقر خارجًا صحيحًا فهو صحيح للعلامتين؛ وإن لم يكن، فهو خاطئ للاثنتين.
      - text: ترك Tidewater تخصّص JavaScript الخاص بالـ Dialog عبر theme token.
        why: الـ tokens تصف قيمًا بصرية؛ والسلوك المخبّأ في الـ tokens غير قابل للاختبار ومفاجئ.
    answer: 2
  - q: نسبة التباين لنص أبيض على teal-600 الخاص بـ Tidewater هي 3.74:1. ماذا يجب أن يكون ربط Tidewater لـ `--nw-color-action-bg`؟
    options:
      - text: إبقاء teal-600؛ فألوان العلامة مستثناة من قواعد التباين.
        why: لا يستثني WCAG العلامات؛ ونص الزر على تلك الخلفية يجب أن يصل إلى 4.5:1 في الحجم العادي.
      - text: ربطه بـ teal-700 ‏(5.47:1 مع النص الأبيض) في كتلة علامة Tidewater.
        why: صحيح. الدور الدلالي نفسه، بدرجة أغمق من تدرّج العلامة نفسها، فينجح نص الزر.
      - text: جعل نص الزر عريضًا حتى تكفي 3.74:1.
        why: عتبة 3:1 تنطبق على النص الكبير (نحو 18.66px عريض أو 24px عادي)؛ وتسمية الزر العريضة بالحجم العادي ما زالت تحتاج 4.5:1.
      - text: استخدام أزرق Northwind لأزرار Tidewater.
        why: هذا ينجح في التباين لكنه يُسقط هوية Tidewater من أكثر عناصرها ظهورًا.
    answer: 1
  - q: "في صفحة المقارنة المشتركة بين العلامتين، تبقى أزرار قسم Tidewater بأزرق Northwind، رغم أن `[data-brand=\"tidewater\"]` يحدّد `--nw-brand-600` بشكل صحيح. ما الناقص؟"
    options:
      - text: الـ semantic token المسمّى `--nw-color-action-bg` معرّف على `:root` وحده، فحُسبت قيمته بتدرّج Northwind عند الجذر.
        why: صحيح. إعادة تعريف الروابط الدلالية تحت `[data-brand]` تجعلها تُحسب داخل قسم كل علامة.
      - text: سمات `data-brand` لا تعمل إلا على `<html>`.
        why: الـ attribute selectors تطابق أي عنصر؛ المشكلة في مكان حساب الـ semantic token.
      - text: يحتاج الزر إلى class باسم `.tidewater`.
        why: الـ classes الواعية بالعلامة على المكوّنات هي بالضبط ما تتجنّبه طبقات الـ tokens.
      - text: الـ custom properties لا يمكن تخصيصها مرتين في صفحة واحدة.
        why: يمكن إعادة تعريف الـ custom properties في أي مستوى؛ وكل عنصر يرى أقرب تعريف إليه.
    answer: 0
---

بعد ثمانية أشهر من استحواذ Northwind على Tidewater، انتقل موقعها التسويقي إلى Northwind UI. جاء فريق علامة Tidewater ومعه دليل علامة من 60 صفحة، وخط serif، ولوحة ألوان فيروزية، وأزرار على شكل حبّة دواء (pill). وجاء أيضًا بقائمة من 23 «متطلّبًا للعلامة» في المكوّنات. كانت مهمّتنا أن نقول نعم للعلامة ولا لمعظم القائمة، وأن نجعل الأمرين يبدوان معقولين.

## ما يحقّ للعلامة تغييره

رسم الحوار الأول حدًّا واضحًا. العلامة تغيّر **الشخصية**: لوحة الألوان، والخطوط، ونصف قطر الزوايا، وأسلوب الرسوم، ونبرة الكتابة. ولا تغيّر **السلوك أو البنية**: التعامل مع لوحة المفاتيح، وإدارة التركيز، وسُلّم المسافات، وشبكات التخطيط، والـ component APIs، وإمكانية الوصول. يمكن أن تكون أزرار Tidewater حبّات فيروزية بتسمية بخط serif. لكن لا يمكنها أن تغلق النوافذ عند النقر خارجها بينما لا تفعل نوافذ Northwind ذلك، لأن هذا قرار منتج لا قرار علامة.

من المتطلّبات الثلاثة والعشرين، تبيّن أن 15 منها بصرية وتناسب الـ tokens. وستة كانت طلبات سلوك، فمرّت عبر مراجعة الـ API كاقتراحات عادية للعلامتين معًا (قُبل اثنان منها، للعلامتين). وأُسقط اثنان.

## طبقة العلامة

قدّم القسم 2 تدرّجًا للعلامة حتى يستطيع الوضع الداكن اختيار الدرجات. ولعلامة ثانية كاملة، يكبر ذلك التدرّج ليصبح طبقة خاصة بين الـ primitives والـ semantic tokens:

:::figure طبقة العلامة تقع بين الـ primitives والـ semantic tokens
<svg viewBox="0 0 660 230" role="img" aria-labelledby="t1">
  <title id="t1">الـ primitives تضم لوحتي الأزرق والفيروزي وعائلتي خطوط. طبقة علامة Northwind تربط الـ brand tokens بالأزرق وInter؛ وطبقة علامة Tidewater تربطها بالفيروزي وGeorgia. الـ semantic tokens تشير إلى الـ brand tokens، والمكوّنات تشير إلى الـ semantic tokens.</title>
  <rect class="d-box" x="20" y="20" width="140" height="190" rx="10"/>
  <text class="d-label-strong" x="90" y="46" text-anchor="middle">Primitives</text>
  <text class="d-code" x="90" y="80" text-anchor="middle">blue-*</text>
  <text class="d-code" x="90" y="106" text-anchor="middle">teal-*</text>
  <text class="d-code" x="90" y="132" text-anchor="middle">inter</text>
  <text class="d-code" x="90" y="158" text-anchor="middle">georgia</text>
  <rect class="d-box-primary" x="200" y="20" width="160" height="84" rx="10"/>
  <text class="d-label-strong" x="280" y="48" text-anchor="middle">العلامة: Northwind</text>
  <text class="d-code" x="280" y="78" text-anchor="middle">brand-600 → blue</text>
  <rect class="d-box-success" x="200" y="126" width="160" height="84" rx="10"/>
  <text class="d-label-strong" x="280" y="154" text-anchor="middle">العلامة: Tidewater</text>
  <text class="d-code" x="280" y="184" text-anchor="middle">brand-600 → teal</text>
  <rect class="d-box-accent" x="400" y="80" width="120" height="70" rx="10"/>
  <text class="d-label" x="460" y="120" text-anchor="middle">Semantic</text>
  <rect class="d-box" x="550" y="80" width="100" height="70" rx="10"/>
  <text class="d-label" x="600" y="120" text-anchor="middle">المكوّنات</text>
  <path class="d-arrow" d="M200 62 L164 90" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M200 168 L164 140" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 105 L364 70" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M400 125 L364 160" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M550 115 L524 115" marker-end="url(#arrow)"/>
</svg>
:::

طبقة العلامة صغيرة عن قصد. في Northwind تضم 24 token: تدرّج ألوان من 50 إلى 900، وعائلة خط للعناوين وأخرى للمتن، ونصفا قطر، ولون لحلقة التركيز. الـ semantic tokens تشير إلى الـ brand tokens، والمكوّنات لا تعرف أبدًا أن هناك علامة أصلًا.

```css
:root,
[data-brand] {
  --nw-color-action-bg: var(--nw-brand-600);
  --nw-color-action-text: var(--nw-white);
  --nw-font-heading: var(--nw-brand-font-heading);
  --nw-radius-control: var(--nw-brand-radius-control);
}

[data-brand="tidewater"] {
  --nw-brand-600: var(--nw-teal-600);
  --nw-brand-700: var(--nw-teal-700);
  --nw-brand-font-heading: Georgia, 'Times New Roman', serif;
  --nw-brand-radius-control: 999px;
  /* Tidewater's 600 fails contrast with white text: use the darker step. */
  --nw-color-action-bg: var(--nw-brand-700);
}
```

الـ selector المسمّى `:root, [data-brand]` مهمّ. تذكّر من درس الـ themes أن الـ custom property التي تحتوي `var()` تُحسب حيث عُرّفت. لو عُرّف `--nw-color-action-bg` على `:root` وحده، لحُسب مرة واحدة بتدرّج Northwind، ولورث قسم Tidewater في الصفحة نفسها أزرق Northwind. أما إعادة تعريف الروابط الدلالية على كل عنصر `[data-brand]` فتجعلها تُحسب داخل نطاق كل علامة. وهذا ما يسمح لصفحة المقارنة المشتركة في Northwind بعرض العلامتين جنبًا إلى جنب.

## التباين لكل علامة

السطر الأخير في كتلة Tidewater هو المثير للاهتمام. لون الإجراء في Northwind هو الدرجة 600 من تدرّجها. أما 600 في Tidewater فأفتح، فيفشل نص الزر الأبيض فوقه:

```js run
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = { 'northwind blue-600': '#1f5ae0', 'tidewater teal-600': '#0d9488', 'tidewater teal-700': '#0f766e' };
for (const [name, bg] of Object.entries(pairs)) {
  const ratio = contrast(bg, '#ffffff');
  console.log(`${name} + white text: ${ratio.toFixed(2)}:1 ${ratio >= 4.5 ? 'pass' : 'FAIL'}`);
}
```

لذا تربط Tidewater الدور الدلالي نفسه بدرجة مختلفة. ولهذا لا تكتفي طبقة العلامة بتبديل لوحات الألوان عشوائيًا: فالربط الدلالي لكل علامة مصمَّم ومفحوص. وفحص التباين في خط الإنتاج لدى Northwind يمرّ على كل زوج موثّق في كل علامة وكل theme، وقد التقط هذه المشكلة قبل أن يرى فريق العلامة زرًا واحدًا.

:::mistake منطق العلامة داخل المكوّنات
أضاف أول pull request لـ Tidewater الشرط `if (brand === 'tidewater')` إلى الـ Button. وخلال شهر صار في خمسة مكوّنات شروط خاصة بالعلامة، ولم يعد أحد قادرًا على إضافة علامة ثالثة دون لمسها كلها. إن تعذّر التعبير عن اختلاف ما بـ token، فاسأل هل هو حقًّا اختلاف علامة.
:::

## تسليم العلامات

كل واجهة تحمّل ما تحتاجه. المواقع التسويقية تضع `data-brand` على `<html>` ولا تحمّل إلا ملف CSS الخاص بعلامتها، الذي يولّده خط الإنتاج من `primitives` + `brand-tidewater` + `semantic`. أما تطبيق الـ dispatch، الذي يعرض العلامتين في شاشات الإدارة، فيحمّل الكتلتين. وفي Figma تعيش البنية نفسها في المجموعات الممتدّة، فيرى مصمّمو Tidewater المتغيّرات الدلالية المشتركة بقيم علامتهم.

وكل علامة تضاعف أيضًا مصفوفة الاختبار. مع علامتين ونظامي ألوان ومستويي كثافة، يُعرض كل مكوّن أساسي في ثماني تركيبات في المجموعة البصرية من القسم 4. يبدو ذلك مكلفًا حتى تتذكّر البديل: مصمّم في Tidewater يكتشف في الإنتاج أن حلقة التركيز في الوضع الداكن غير مرئية على الفيروزي. الآلات مراجِعون رخيصون للتركيبات؛ والبشر لا ينظرون إلا إلى الفروقات.

:::tip ضع ميزانية لمساحة العلامة
تراجع Northwind أي طلب لتوسيع طبقة العلامة بعد الـ 24 token. كل brand token جديد يضاعف التركيبات التي تختبرها. ومساحة علامة صغيرة وثابتة هي ما يجعل إضافة علامة ثالثة عمل أسبوعين بدل ربع سنة.
:::

في التمرين تضيف Tidewater إلى صفحة تظهر فيها العلامتان جنبًا إلى جنب. وبعدها تقيس هل يُستخدم كل هذا فعلًا.
