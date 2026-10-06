---
summary: جهّز خط إنتاج (pipeline) لبناء الـ tokens يحوّل JSON بصيغة DTCG إلى CSS custom properties لكل theme وإلى صيغ أصلية لكل منصّة، مع الحفاظ على المراجع حتى يبقى تغيير الـ theme وقت التشغيل ممكنًا.
takeaways:
  - خط إنتاج الـ tokens يحلّل ملفات المصدر، ويحلّ الأسماء المستعارة، ويحوّل الأسماء والقيم لكل منصّة، ويكتب صيغة إخراج واحدة لكل منصّة.
  - احتفظ بالمراجع في إخراج CSS (`outputReferences`) حتى تبقى الـ semantic tokens تشير إلى الـ primitives وقت التشغيل، ويستمرّ تغيير الـ theme على الأشجار الفرعية في العمل.
  - ابنِ كل theme من الـ primitives المشتركة مع الملف الدلالي الخاص بذلك الـ theme، وأخرج الـ tokens الخاصة بالـ theme وحدها تحت الـ selector الخاص به.
  - الملفات المولَّدة مخرجات بناء؛ لا يعدّلها أحد يدويًا، والـ CI يعيد بناءها مع كل تغيير.
further:
  - title: Style Dictionary (official repository and docs)
    url: https://github.com/style-dictionary/style-dictionary
  - title: Design Tokens Community Group repository
    url: https://github.com/design-tokens/community-group
  - title: Using CSS custom properties (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
quiz:
  - q: "يكتب خط الإنتاج `--nw-color-action-bg: #1f5ae0;` بدل `--nw-color-action-bg: var(--nw-color-blue-600);`. ما الذي ينكسر؟"
    options:
      - text: لا شيء؛ اللون متطابق.
        why: اللون متطابق اليوم، لكن تخصيص الـ primitive وقت التشغيل لم يعد يسري، ولم تعد الطبقات ظاهرة في الإخراج.
      - text: يصبح الـ CSS غير صالح لأن قيم hex غير مسموحة في الـ custom properties.
        why: الـ custom properties تقبل أي سلسلة رموز صالحة، بما فيها ألوان hex.
      - text: لا تستطيع المتصفّحات تخزين ملف الأنماط مؤقتًا.
        why: التخزين المؤقت لا يعتمد على محتوى الـ custom properties.
      - text: تتوقّف تخصيصات الـ primitives وقت التشغيل عن الوصول إلى الـ semantic tokens، ويصعب تتبّع أي primitive يستخدمه الـ token.
        why: صحيح. مع الحفاظ على المراجع يحتفظ الإخراج ببنية الطبقات؛ ومع القيم المحلولة تُسطَّح كل الروابط.
    answer: 3
  - q: لماذا يستخدم بناء الـ theme الداكن `include` للـ primitives و`source` للملف الدلالي الداكن، ثم يصفّي على `isSource`؟
    options:
      - text: لأن الـ primitives لازمة لحلّ المراجع، لكن الـ semantic tokens الداكنة وحدها يجب أن تُكتب تحت الـ selector الداكن.
        why: صحيح. إخراج الـ primitives مرة أخرى تحت `[data-theme="dark"]` سيكرّر مئات الأسطر دون أن يغيّر شيئًا.
      - text: لأن الملفات في `include` تُحمَّل أسرع.
        why: السرعة ليست المقصود؛ الفرق هو هل تُعدّ الـ tokens tokens مصدرية لأغراض التصفية أم لا.
      - text: لأن Style Dictionary لا يستطيع قراءة ملفين في `source`.
        why: المصفوفة `source` تقبل ملفات كثيرة وأنماط glob.
    answer: 0
  - q: عدّل مهندس منتج الملف `dist/css/theme-dark.css` مباشرة ليصلح خللًا في التباين، فاختفى الإصلاح بعد الإصدار التالي. ماذا كان يجب أن تكون العملية؟
    options:
      - text: عمل commit للـ CSS المولَّد حتى يُحفظ التعديل.
        why: الـ commit لا يمنع البناء التالي من الكتابة فوقه؛ فالمصدر ما زال خاطئًا.
      - text: إصلاح الـ token في ملف JSON المصدر، وترك الـ CI يعيد البناء، ووضع ترويسة «لا تعدّل» على الملفات المولَّدة.
        why: صحيح. ملف JSON هو مصدر الحقيقة، ويجب أن تقول الملفات المولَّدة ذلك في أعلاها.
      - text: إضافة الإصلاح إلى ملف الأنماط الخاص بالمنتج بدلًا من ذلك.
        why: هذا يخفي الخلل عن منتج واحد ويتركه عند كل مستخدم آخر للنظام.
      - text: إيقاف خطوة بناء الـ CSS.
        why: حينها يتباعد CSS عن المنصّات الأخرى، وهذا بالضبط ما وُجد خط الإنتاج لمنعه.
    answer: 1
---

بعد أن صارت الـ tokens مخزّنة كـ JSON بصيغة DTCG، يجب أن يحوّلها شيء ما إلى ما تستهلكه كل منصّة: CSS custom properties لتطبيق الويب والموقع التسويقي، وSwift لتطبيق السائقين على iOS، وKotlin أو XML لـ Android. هذا الشيء هو خط إنتاج الـ tokens (token pipeline). إنه قطعة كود صغيرة ينتهي كل فريق نظام تصميم بامتلاكها، وإتقانها مبكرًا يوفّر شهورًا من الانحراف لاحقًا.

## ماذا يفعل خط الإنتاج

:::figure خط إنتاج الـ tokens: مصدر واحد، وإخراج واحد لكل منصّة
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">ملفات JSON الخاصة بالـ tokens تمرّ بخطوات التحليل وحلّ المراجع والتحويل والتنسيق، فتنتج CSS للويب وSwift لـ iOS وKotlin لـ Android.</title>
  <rect class="d-box-primary" x="10" y="85" width="110" height="56" rx="10"/>
  <text class="d-label" x="65" y="110" text-anchor="middle">*.tokens</text>
  <text class="d-label" x="65" y="128" text-anchor="middle">.json</text>
  <rect class="d-box" x="150" y="85" width="80" height="56" rx="10"/>
  <text class="d-label" x="190" y="118" text-anchor="middle">تحليل</text>
  <rect class="d-box" x="250" y="85" width="90" height="56" rx="10"/>
  <text class="d-label" x="295" y="118" text-anchor="middle">حلّ المراجع</text>
  <rect class="d-box" x="360" y="85" width="100" height="56" rx="10"/>
  <text class="d-label" x="410" y="118" text-anchor="middle">تحويل</text>
  <rect class="d-box" x="480" y="85" width="80" height="56" rx="10"/>
  <text class="d-label" x="520" y="118" text-anchor="middle">تنسيق</text>
  <rect class="d-box-accent" x="590" y="20" width="80" height="44" rx="10"/>
  <text class="d-label" x="630" y="47" text-anchor="middle">CSS</text>
  <rect class="d-box-accent" x="590" y="91" width="80" height="44" rx="10"/>
  <text class="d-label" x="630" y="118" text-anchor="middle">Swift</text>
  <rect class="d-box-accent" x="590" y="162" width="80" height="44" rx="10"/>
  <text class="d-label" x="630" y="189" text-anchor="middle">Kotlin</text>
  <path class="d-arrow" d="M120 113 L146 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M230 113 L246 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M340 113 L356 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M460 113 L476 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 105 L586 45" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 113 L586 113" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M560 121 L586 183" marker-end="url(#arrow)"/>
</svg>
:::

1. **التحليل (parse)**: يقرأ كل ملفات المصدر ويدمجها دمجًا عميقًا في شجرة واحدة.
2. **حلّ المراجع (resolve)**: يحلّ الأسماء المستعارة مثل `{color.blue.600}`، ويرفض المراجع المكسورة أو الدائرية.
3. **التحويل (transform)**: يحوّل الأسماء والقيم لكل منصّة: يصبح `color.action.bg` هو `--nw-color-action-bg` في CSS و`colorActionBg` في Swift؛ ويصبح `1rem` هو `16` نقطة على iOS.
4. **التنسيق (format)**: يكتب النتيجة في ملف: كتلة custom properties، أو enum في Swift، أو ملف موارد Android.

هذا قلب جانب CSS، وهو صغير بما يكفي لتقرأه دفعة واحدة:

```js run
const tokens = {
  color: {
    $type: 'color',
    blue: { 600: { $value: { colorSpace: 'srgb', components: [0.122, 0.353, 0.878], hex: '#1f5ae0' } } },
    white: { $value: { colorSpace: 'srgb', components: [1, 1, 1], hex: '#ffffff' } },
    action: {
      bg: { $value: '{color.blue.600}' },
      text: { $value: '{color.white}' },
    },
  },
  space: { $type: 'dimension', 4: { $value: { value: 1, unit: 'rem' } } },
};

// Walk the tree and collect every token with its path.
function flatten(node, path = [], type) {
  const t = node.$type ?? type;
  if ('$value' in node) return [{ path, type: t, value: node.$value }];
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => flatten(child, [...path, key], t));
}

const cssName = (path) => `--nw-${path.join('-')}`;
function cssValue({ type, value }) {
  if (typeof value === 'string' && value.startsWith('{')) {
    return `var(${cssName(value.slice(1, -1).split('.'))})`; // keep the reference
  }
  if (type === 'color') return value.hex;
  if (type === 'dimension') return `${value.value}${value.unit}`;
  return String(value);
}

const lines = flatten(tokens).map((t) => `  ${cssName(t.path)}: ${cssValue(t)};`);
console.log(`/* Generated from tokens. Do not edit. */\n:root {\n${lines.join('\n')}\n}`);
```

انظر إلى الإخراج. المسار يصبح الاسم، فيخرج `color.blue.600` بالشكل `--nw-color-blue-600`. في الدروس السابقة اختصرنا الـ primitives إلى `--nw-blue-600` لتسهيل القراءة، لكن في نظام مولَّد يكون الاسم هو ما تقوله بنية المجموعات، وهذا سبب إضافي لتصمّم المجموعات والأسماء معًا. والأهم أن الـ semantic tokens تخرج بالشكل `var(--nw-color-blue-600)` لا كقيمة hex. وهذا الاختيار مهمّ بما يكفي ليستحقّ قسمًا خاصًا به.

## احتفظ بالمراجع

يمكن لخط الإنتاج إما أن يحلّ الأسماء المستعارة إلى قيمها النهائية، أو أن يُبقيها مراجع في الإخراج. في CSS، أبقِها. الإخراج المحلول يسطّح طبقاتك: يرى المتصفّح `--nw-color-action-bg: #1f5ae0`، فلا يفعل تخصيص الـ primitive وقت التشغيل شيئًا، ولا يستطيع مطوّر يفحص زرًا في DevTools أن يرى من أي primitive جاء لونه. أما الإخراج بالمراجع فيحفظ البنية التي صمّمتها بالضبط، بما فيها تغيير الـ theme على الأشجار الفرعية من درس الـ themes.

المنصّات الأصلية مختلفة. الثوابت في Swift وKotlin تُحلّ عادةً إلى قيمها النهائية، لأن هذه المنصّات تتعامل مع الـ themes بآلياتها الخاصة (asset catalogs، وcolor schemes في Compose).

## خط إنتاج حقيقي مع Style Dictionary

يمكنك أن تطوّر السكربت أعلاه إلى أداة كاملة، لكن أغلب الفرق تستخدم Style Dictionary، وهو أكثر أنظمة بناء الـ tokens مفتوحة المصدر انتشارًا. إصداراته الحديثة تقرأ ملفات DTCG مباشرة وتكتشف الصيغة تلقائيًا. وإعداد على طريقة Northwind يبني الـ theme الفاتح داخل `:root` والـ theme الداكن تحت الـ attribute selector الخاص به:

```js title=build-tokens.mjs
import StyleDictionary from 'style-dictionary';

const themes = {
  light: ':root',
  dark: '[data-theme="dark"]',
};

for (const [name, selector] of Object.entries(themes)) {
  const sd = new StyleDictionary({
    include: ['tokens/primitives.tokens.json'],
    source: [`tokens/semantic-${name}.tokens.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: 'nw',
        buildPath: 'dist/css/',
        files: [{
          destination: `theme-${name}.css`,
          format: 'css/variables',
          filter: name === 'light' ? undefined : (token) => token.isSource,
          options: { selector, outputReferences: true },
        }],
      },
    },
  });
  await sd.buildAllPlatforms();
}
```

الأفكار الأساسية: الـ primitives تدخل عبر `include` حتى يمكن حلّ المراجع، بينما يدخل الملف الدلالي الخاص بالـ theme عبر `source`. وفي الـ theme الداكن يُبقي الـ `filter` الـ tokens المصدرية وحدها، فيحتوي الملف الداكن على الـ semantic tokens المعاد ربطها لا على نسخة ثانية من كل primitive. و`outputReferences: true` يُبقي مراجع `var()` في الإخراج. وقد يحذّرك Style Dictionary من أن الملف الداكن يشير إلى tokens استبعدها الـ filter؛ وهذا مقصود هنا، لأن الملف الفاتح يعرّف الـ primitives على `:root` أصلًا.

:::mistake تعديل الملفات المولَّدة
الـ CSS المولَّد يبدو CSS عاديًا، فعاجلًا أو آجلًا سيصلح أحدهم لونًا مباشرة داخل `dist/`. والبناء التالي يمحو الإصلاح. ضع ترويسة «مولَّد، لا تعدّل» في كل ملف إخراج، وأبقِ `dist/` خارج فروقات مراجعة الكود، ومرّر كل تغيير عبر ملف JSON.
:::

:::note افحص إصدار DTCG الذي تدعمه أداتك
صيغة اللون ككائن جاءت مع DTCG 2025.10، والأدوات تبنّتها في أوقات مختلفة: فالـ transforms المدمجة في Style Dictionary تقرأ الألوان ككائنات منذ الإصدار 5.3، والأبعاد (dimensions) ككائنات منذ 5.4. قبل نقل ملفات Northwind إليها، شغّلنا خط الإنتاج على بعض الـ tokens التجريبية وقارنّا إخراج الـ CSS. افعل الشيء نفسه؛ وإن كان إصدارك ما زال يتوقّع نصوص hex، فأبقِ الحقل `hex` مملوءًا أو أضف transform مخصّصًا صغيرًا.
:::

## فحوص تعمل مع البناء

حين تصبح الـ tokens بيانات، يستطيع الـ CI أن يختبر قرارات التصميم كما يختبر الكود. يشغّل خط الإنتاج في Northwind ثلاثة فحوص على كل pull request: فحص التسمية (lint) الذي رأيته سابقًا، وفحص مراجع يفشل عند الأسماء المستعارة المكسورة أو الدائرية، وفحص تباين يحلّ كل زوج موثّق من النص والخلفية في كل theme ويفشل تحت 4.5:1. وهذا الأخير التقط تراجعًا في الوضع الداكن لعلامة Tidewater قبل أن يراه أي مصمّم.

في التمرين تكمل إعداد بناء الـ theme الداكن. وبهذا تكتمل معمارية الـ tokens؛ والقسم التالي يبني المكوّنات فوقها.
