---
summary: احذف الـ tokens والـ props والمكوّنات دون كسر عمل الفرق، بإطلاق البديل أولًا، وإعلان الـ deprecation بوضوح في كل قناة، وأتمتة الانتقال بالـ codemods، والحذف في إصدار major فقط.
takeaways:
  - لا تعلن deprecation لشيء قبل أن يُطلَق بديله؛ فالـ deprecation بلا بديل مجرّد شكوى.
  - علّم الـ deprecation في كل مكان ينظر إليه الناس - الأنواع، والـ tokens، وتحذيرات الـ console في بيئة التطوير وحدها، والتوثيق، وFigma - وسمِّ دائمًا البديل وإصدار الحذف.
  - الـ codemods تحوّل الانتقال من مهمّة لأربعين فريقًا إلى مراجعة لأربعين فريقًا.
  - لا تحذف العناصر المُهمَلة إلا في إصدار major، بعد أن تقيس أن الاستخدام قارب الصفر، واستمرّ في إصلاح الإصدار الـ major السابق لمدّة معلنة.
further:
  - title: jscodeshift (official repository)
    url: https://github.com/facebook/jscodeshift
  - title: Design token $deprecated property (DTCG specification source)
    url: https://github.com/design-tokens/community-group/blob/main/technical-reports/format/design-token.md
  - title: "console: warn() static method (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/API/console/warn_static
quiz:
  - q: يريد فريق النواة إعلان deprecation لـ ShipmentCard لأن Card المركّب أفضل. لكن الـ slot الخاص بـ Footer في Card لم يُطلَق بعد. ما الذي يجب أن يحدث أولًا؟
    options:
      - text: إطلاق قطع Card، بما فيها الـ slot الخاص بـ Footer، حتى يكون لكل استخدام لـ ShipmentCard بديل يعمل.
        why: صحيح. لا تستطيع الفرق الانتقال إلا إلى شيء موجود ويغطّي حالة استخدامها.
      - text: إعلان deprecation لـ ShipmentCard الآن حتى تتوقّف الفرق عن إضافة استخدامات جديدة.
        why: الفرق التي تحتاج بطاقة اليوم لا تملك بديلًا، فستتجاهل التحذير أو تبني بطاقتها الخاصة.
      - text: حذف ShipmentCard في الـ major التالي وترك الفرق تتكيّف.
        why: حذفه بلا بديل يكسر 60 شاشة ولا يترك للفرق شيئًا تنتقل إليه.
      - text: كتابة دليل الانتقال أولًا، ثم بناء Card لاحقًا.
        why: الدليل الذي يشير إلى مكوّن لم يُطلَق لا يمكن اتّباعه.
    answer: 0
  - q: أين يجب أن يظهر تحذير «Button `kind` is deprecated» وقت التشغيل؟
    options:
      - text: في الإنتاج كتنبيه منبثق، حتى يلاحظه مديرو المنتجات.
        why: المستخدمون النهائيون سيرون رسالة عن كود لا يستطيعون تغييره.
      - text: في لا مكان؛ الـ changelog يكفي.
        why: أغلب المهندسين لا يقرؤون كل changelog؛ أما التحذير في الـ console الخاص بهم أثناء التطوير فيصلهم حيث يعملون.
      - text: في كل render، وفي كل بيئة.
        why: التسجيل في كل render يُغرق الـ console ويخفي الأخطاء الحقيقية؛ ومستخدمو الإنتاج لا يحتاجونه أيضًا.
      - text: في الـ console أثناء التطوير، مرة واحدة في كل جلسة، مع ذكر البديل وإصدار الحذف.
        why: صحيح. يصل إلى المطوّرين وهم يعملون على الكود، دون ضجيج في الإنتاج.
    answer: 3
  - q: يُظهر البحث في الكود لدى Northwind 4 استخدامات متبقّية للـ prop المُهمَل `kind` عبر 40 مستودعًا، كلها في أداة إدارة قديمة لفريق واحد. إصدار 5.0 الأسبوع القادم. ما أفضل خطوة؟
    options:
      - text: تأجيل 5.0 حتى تخلو المستودعات الأربعون من كل API مُهمَل.
        why: احتجاز إصدار major رهينةً لأداة قديمة واحدة يؤخّر تحسينات كل الفرق الأخرى.
      - text: إطلاق 5.0، وفتح pull request لذلك الفريق يشغّل الـ codemod، مع إخبارهم أنهم يستطيعون البقاء على 4.x، الذي ما زال يتلقّى الإصلاحات، حتى يُدمج.
        why: صحيح. العمل المتبقّي صغير، وأنت تساعد مباشرة، وفترة الدعم تحميهم في الأثناء.
      - text: إطلاق 5.0 دون إخبار الفريق.
        why: سينكسر التحديث التالي لاعتمادياتهم دون إنذار، وهذا يكلّف النظام ثقته.
    answer: 1
---

الحذف أصعب جزء في إدارة نظام التصميم. إضافة مكوّن تُسعد فريقًا واحدًا؛ أما حذف مكوّن فيجعل أربعين فريقًا يقومون بعمل لم يخطّطوا له. حذف أول إصدار major في Northwind أحد عشر prop وستة tokens دفعة واحدة، مع دليل انتقال نُشر في اليوم نفسه. وبعد تسعة أشهر كان فريقان ما زالا على الإصدار الـ major القديم، ينسخان الإصلاحات بصمت. عمليات الحذف نفسها كانت صحيحة. ما كان ينقص هو الطريق إليها.

## مسار الـ deprecation

:::figure الـ deprecation تمتدّ عبر إصدارات: بديل، فتحذير، فانتقال، فحذف
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">خط زمني من الإصدار 4.3 إلى 5.0 وما بعده: يُطلق 4.3 البديل ويعلن deprecation الـ API القديم؛ ومن 4.4 إلى 4.9 يجري الانتقال بالـ codemods وتتبّع الاستخدام؛ ويحذف 5.0 الـ API القديم؛ ويستمرّ 4.x في تلقّي الإصلاحات ستة أشهر.</title>
  <path class="d-line" d="M30 90 L650 90"/>
  <circle class="d-dot" cx="80" cy="90" r="8"/>
  <circle class="d-dot" cx="300" cy="90" r="8"/>
  <circle class="d-dot" cx="520" cy="90" r="8"/>
  <text class="d-label-strong" x="80" y="60" text-anchor="middle">4.3.0</text>
  <text class="d-label-strong" x="300" y="60" text-anchor="middle">من 4.4 إلى 4.9</text>
  <text class="d-label-strong" x="520" y="60" text-anchor="middle">5.0.0</text>
  <rect class="d-box-success" x="20" y="112" width="120" height="56" rx="8"/>
  <text class="d-label" x="80" y="136" text-anchor="middle">البديل</text>
  <text class="d-label" x="80" y="156" text-anchor="middle">+ deprecation</text>
  <rect class="d-box-warn" x="230" y="112" width="140" height="56" rx="8"/>
  <text class="d-label" x="300" y="136" text-anchor="middle">Codemods،</text>
  <text class="d-label" x="300" y="156" text-anchor="middle">تتبّع الاستخدام</text>
  <rect class="d-box-primary" x="460" y="112" width="120" height="56" rx="8"/>
  <text class="d-label" x="520" y="144" text-anchor="middle">الحذف</text>
  <rect class="d-box" x="560" y="20" width="110" height="40" rx="8"/>
  <text class="d-label-muted" x="615" y="45" text-anchor="middle">إصلاحات لـ 4.x</text>
</svg>
:::

كل عملية حذف في Northwind تتبع اليوم الخطوات نفسها، موزّعة على عدّة إصدارات.

**1. أطلق البديل أولًا.** لا يمكنك أن تطلب من الفرق الانتقال إلى شيء غير موجود. أُطلق الـ prop المسمّى `variant` في Button ضمن الإصدار 4.3.0 كإضافة عادية، أي إصدار minor.

**2. أعلن الـ deprecation في كل القنوات دفعة واحدة.** في الإصدار نفسه يُعلَّم `kind` كـ deprecated في كل مكان قد يصادفه فيه الناس:

```tsx title=Button.tsx
type ButtonProps = {
  /** @deprecated Use `variant`. Removed in 5.0.0. */
  kind?: 'primary' | 'secondary' | 'danger';
  variant?: 'primary' | 'secondary' | 'danger';
  // …rest of the props
};

const warned = new Set<string>();
function warnOnce(key: string, message: string) {
  if (process.env.NODE_ENV === 'production' || warned.has(key)) return;
  warned.add(key);
  console.warn(`[Northwind UI] ${message}`);
}

export function Button({ kind, variant, ...rest }: ButtonProps) {
  if (kind) warnOnce('button-kind', 'Button `kind` is deprecated; use `variant`. Removed in 5.0.0.');
  const resolvedVariant = variant ?? kind ?? 'secondary';
  // …render as before, using resolvedVariant
}
```

وسم JSDoc المسمّى `@deprecated` يجعل المحرّرات تشطب الـ prop أثناء الكتابة. والتحذير يظهر مرة واحدة في كل جلسة، وفي نسخ التطوير وحدها؛ إذ تستبدل الـ bundlers قيمة `process.env.NODE_ENV` بثابت، فيسقط الفحص والرسالة من كود الإنتاج. وتحصل صفحة التوثيق على شارة «Deprecated»، وتُعاد تسمية خاصية المكوّن في Figma حتى يلاحظ المصمّمون أيضًا.

والـ tokens تُعامَل بالطريقة نفسها. يبقى الاسم القديم اسمًا مستعارًا للجديد، فلا ينكسر شيء، ويقول ملف الـ tokens ذلك صراحة:

```json
{
  "color": {
    "text": {
      "light": {
        "$type": "color",
        "$value": "{color.text.subtle}",
        "$deprecated": "Use color.text.subtle. Removed in 5.0.0."
      }
    }
  }
}
```

**3. أتمت الانتقال.** الـ codemod سكربت يعيد كتابة الكود المصدري. ولـ prop أُعيدت تسميته، يكفي transform من بضعة أسطر في jscodeshift:

```js title=codemods/button-kind.js
export default function transformer(file, api) {
  const j = api.jscodeshift;
  return j(file.source)
    .find(j.JSXOpeningElement, { name: { name: 'Button' } })
    .find(j.JSXAttribute, { name: { name: 'kind' } })
    .forEach((path) => {
      path.node.name.name = 'variant';
    })
    .toSource();
}
```

تشغّله الفرق بالأمر `npx jscodeshift --parser=tsx --extensions=tsx,ts -t codemods/button-kind.js src/` (فبدون هذين الخيارين لا يقرأ jscodeshift إلا ملفات `.js` بمحلّل Babel)، ثم تراجع الفروقات. ولأكبر خمسة مستخدمين، يفتح فريق النواة في Northwind pull requests الانتقال بنفسه. إعادة تسمية كانت ستكلّف كل فريق من الأربعين ظهيرة كاملة تصبح أربعين مراجعة سريعة.

للـ codemods حدود، ويجب أن يسمّيها دليل الانتقال. الـ transform أعلاه يعيد تسمية `kind="danger"` و`kind={isUrgent ? 'danger' : 'primary'}` بشكل صحيح، لأن كليهما سمة مكتوبة على `<Button>`. لكنه لا يرى `kind` المختبئ داخل props تُمرَّر بالـ spread، مثل `<Button {...actionProps} />` حيث بُني `actionProps` في ملف آخر، ولا Button أُعيد تصديره باسم آخر. لهذا يبقى تحذير وقت التشغيل مهمًّا حتى بعد تشغيل الـ codemod: فهو يلتقط الحالات التي لا تصل إليها إعادة الكتابة الثابتة. ودليل Northwind لكل عملية حذف له الأجزاء الأربعة نفسها: كود قبل وبعد، وأمر الـ codemod، والحالات المعروفة التي يفوّتها الـ codemod، ورابط إلى موعد الساعات المكتبية حيث يساعد فريق النواة في الباقي.

**4. قِس، ثم احذف.** البحث في الكود عبر المستودعات يخبرك بعدد الاستخدامات المتبقّية؛ ويشرح القسم 5 كيف تجمع Northwind ذلك تلقائيًا. وحين يقارب الاستخدام الصفر، يدخل الحذف في الإصدار الـ major التالي، مجمّعًا مع عمليات الحذف المخطّطة الأخرى، فتواجه الفرق ترقية واحدة بدل عدّة ترقيات.

**5. ادعم الإصدار الـ major السابق.** بعد إطلاق 5.0.0 يظلّ 4.x يتلقّى إصلاحات الأخطاء والأمان ستة أشهر. الفرق التي لا تستطيع الترقية فورًا لا تُترك عالقة، ولا تنسخ النظام.

:::mistake deprecation بلا تاريخ
عبارة «مُهمَل، وسيُحذف في إصدار مستقبلي» لا تعطي أحدًا سببًا للتحرّك هذا الربع. كل رسالة deprecation تسمّي البديل والإصدار الذي يحذف القديم. الفرق تخطّط حول التواريخ؛ وتتجاهل «يومًا ما».
:::

## أعلنه كما تعلن تغييرًا في منتج

الـ deprecation خبر لأربعين فريقًا، فعامله كإعلان منتج لا كسطر في الـ changelog. تنشر Northwind كل deprecation في قناة نظام التصميم بثلاث جمل: ما الذي يتغيّر، ولماذا يستحقّ الجهد، ومتى يحدث الحذف. ويرتبط المنشور بدليل الانتقال ويبقى مثبّتًا حتى يُطلَق الـ major. ويتلقّى مديرو الهندسة ملخّصًا شهريًا بعمليات الحذف القادمة التي تمسّ فرقهم، لأنهم هم مَن يجدولون العمل.

## كم من الوقت يكفي؟

تُبقي Northwind الـ API المُهمَل لإصدارين minor على الأقل أو ثلاثة أشهر، أيّهما أطول، قبل الـ major الذي يحذفه، وتنشر جدول الإصدارات الـ major قبل ربع سنة. أرقامك قد تختلف؛ المهمّ أن تكون مكتوبة ويمكن توقّعها، حتى تخطّط الفرق لعمليات الانتقال ضمن خرائط طريقها بدل أن تكتشفها في عملية بناء فاشلة.

في التمرين ترتّب مسار deprecation كاملًا. وبعدها تبني خط الإصدار الذي يلتقط التغييرات الكاسرة غير المقصودة قبل أن تُطلَق.
