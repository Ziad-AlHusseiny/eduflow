---
summary: تشرح كيف يقيّم الـ mutation testing مجموعة الاختبارات، وتشغّل StrykerJS مع Vitest على المنطق الأساسي، وتحوّل الـ mutants الناجية إلى الاختبارات المحدّدة التي كانت ناقصة.
takeaways:
  - تصنع أداة الـ mutation testing (اختبار الطفرات) أخطاءً صغيرة متعمَّدة (mutants) في كودك وتعيد تشغيل الاختبارات؛ والـ mutant الذي يُفشل اختبارًا يُقتَل (killed)، والذي لا يُفشل أيّ اختبار ينجو (survived).
  - مقياس الطفرات (mutation score)، أي نسبة الـ mutants المقتولة من مجموعها، يقيس كم من الأخطاء المعقولة ستلتقطها اختباراتك، وهذا ما لا تستطيعه الـ coverage.
  - كل mutant ناجٍ يشير إلى assertion ناقص أو ضعيف؛ اقرأه، ثم اكتب الاختبار الذي يقتله.
  - بعض الـ mutants متكافئة (لا تغيّر السلوك) ولا يمكن قتلها؛ تجاهلها بدل ليّ الاختبارات.
  - الـ mutation testing بطيء، فشغّله على المنطق الأساسي، بشكل تدريجي أو وفق جدول زمني، لا على كل ملف في كل commit.
further:
  - title: Vitest — Coverage guide
    url: https://vitest.dev/guide/coverage
  - title: StrykerJS on GitHub
    url: https://github.com/stryker-mutator/stryker-js
quiz:
  - q: "يبلّغ Stryker بما يلي: `ConditionalExpression: if (sum !== 0) → if (false)` — Survived. ماذا يخبرك ذلك؟"
    options:
      - text: الفحص غير ضروري ويمكن حذفه.
        why: يخبرك أن لا اختبار يلاحظ حين يُزال الفحص، لا أن الفحص عديم الفائدة؛ فالمدخلات غير المتوازنة ستُنتج تحويلات خاطئة بصمت.
      - text: 'لا يوجد اختبار يمرّر أرصدة غير متوازنة ويتوقّع أن ترمي `settleUp` خطأً.'
        why: "صحيح. أضف اختبارًا مثل `expect(() => settleUp({ Ana: 500, Ben: -400 })).toThrow()` فيُقتل الـ mutant."
      - text: فشل Stryker في تشغيل الاختبارات لذلك السطر.
        why: حين لا تستطيع الاختبارات العمل، تكون الحالة خطأ تشغيل أو ترجمة، أو "no coverage"؛ أما "Survived" فتعني أن الاختبارات عملت ونجحت كلها.
    answer: 1
  - q: تغطية الأسطر في مجموعتك 100% ومقياس الطفرات 55%. أيّ تلخيص هو الأفضل؟
    options:
      - text: كل سطر يعمل، لكن قرابة نصف الأخطاء المعقولة التي أدخلها Stryker ستمرّ دون أن يلاحظها أحد.
        why: صحيح. الـ coverage تُظهر التنفيذ؛ ومقياس الطفرات يُظهر كم من ذلك التنفيذ يُفحص فعلًا.
      - text: المجموعة ممتازة؛ فمقاييس الطفرات فوق 50% نادرة.
        why: لا يوجد معيار عالمي، لكن نجاة 45% من الـ mutants في المنطق الأساسي تعني عادةً assertions ضعيفة تستحق الإصلاح.
      - text: الرقمان متناقضان، فإحدى الأداتين مضبوطة بشكل خاطئ.
        why: يقيسان شيئين مختلفين؛ والتغطية العالية مع مقياس طفرات منخفض هو النمط الكلاسيكي للاختبارات الشحيحة بالـ assertions.
    answer: 0
  - q: "يغيّر mutant التعبير `b.cents - a.cents` إلى `a.cents - b.cents` في دالة المقارنة الخاصة بالترتيب، وكل مدخل صالح ما زال يُنتج تسوية صحيحة. ماذا يجب أن تفعل؟"
    options:
      - text: اكتب اختبارًا يؤكّد الترتيب الدقيق للتحويلات في مجموعة كبيرة، كي يموت الـ mutant.
        why: إن كانت عدة ترتيبات صالحة، فتثبيت واحد منها يربط الاختبار بالتفاصيل الداخلية، وهو الخطأ نفسه من القسم 2.
      - text: اخفض الحدّ الأدنى لمقياس الطفرات إلى الصفر.
        why: mutant متكافئ واحد ليس سببًا للتخلّص من الإشارة التي تأتي من كل الـ mutants الأخرى.
      - text: تعامل معه على أنه mutant متكافئ على الأرجح وتجاهله (أو عطّل تلك الطفرة على ذلك السطر بتعليق).
        why: صحيح. إن لم يكن بإمكان أي مستدعٍ ملاحظة الفرق، فلا يوجد ما يُختبر؛ ويتيح لك Stryker تعليم هذه الأسطر كي يبقى التقرير ذا معنى.
    answer: 2
---

ترك لك التمرين الأخير حقيقة مزعجة: قالت الـ coverage إن النسبة 100%، ولم تلتقط المجموعة شيئًا. تحتاج إلى قياس يطرح السؤال الحقيقي: *هل ستلاحظ هذه الاختبارات لو كان الكود خاطئًا؟* يجيب الـ mutation testing (اختبار الطفرات) عن هذا السؤال بالتجربة. وقد كنت تفعل ذلك يدويًا أصلًا: كل تمرين في هذه الدورة شغّل اختباراتك على "mutants" (نسخ طافرة). والأداة تفعل الشيء نفسه بشكل منهجي، لكل سطر.

## كيف يعمل

1. تصنع الأداة **mutant**: نسخة من كودك فيها تغيير صغير واحد، من النوع الذي يزلّ فيه الإنسان. يصبح `<` هو `<=`، و`+` يصبح `-`، و`Math.min` يصبح `Math.max`، ويصبح شرط ما `true`، وتُفرَّغ كتلة كود.
2. تشغّل الاختبارات التي تغطّي ذلك السطر على الـ mutant.
3. إن فشل أيّ اختبار، **يُقتَل** الـ mutant: اختباراتك ستلتقط ذلك الخطأ. وإن نجحت كل الاختبارات، فقد **نجا**: ذلك الخطأ سيصل إلى المستخدمين.

تكرّر هذا مع مئات أو آلاف الـ mutants. و**مقياس الطفرات** (mutation score) هو نسبة المقتول منها.

:::figure كل mutant خطأ صغير متعمَّد واحد؛ فإمّا أن تقتله الاختبارات أو تدعه ينجو
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">يُنتج الكود المصدري ثلاثة mutants. تعمل مجموعة الاختبارات على كل منها: يفشل اختبار مع اثنين فيُقتلان، وتنجح كلها مع الثالث فينجو، مشيرًا إلى اختبار ناقص.</title>
  <rect class="d-box" x="10" y="85" width="120" height="60" rx="12"/>
  <text class="d-code" x="70" y="120" text-anchor="middle">settleUp</text>
  <path class="d-arrow" d="M130 105 L198 45" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M130 115 L198 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M130 125 L198 185" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="200" y="25" width="190" height="40" rx="8"/>
  <text class="d-code" x="295" y="50" text-anchor="middle">min → max</text>
  <rect class="d-box-accent" x="200" y="95" width="190" height="40" rx="8"/>
  <text class="d-code" x="295" y="120" text-anchor="middle">-cents → +cents</text>
  <rect class="d-box-accent" x="200" y="165" width="190" height="40" rx="8"/>
  <text class="d-code" x="295" y="190" text-anchor="middle">sum !== 0 → false</text>
  <path class="d-arrow" d="M390 45 L478 45" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 115 L478 115" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 185 L478 185" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="480" y="25" width="190" height="40" rx="8"/>
  <text class="d-label" x="575" y="50" text-anchor="middle">فشل اختبار: قُتل</text>
  <rect class="d-box-success" x="480" y="95" width="190" height="40" rx="8"/>
  <text class="d-label" x="575" y="120" text-anchor="middle">فشل اختبار: قُتل</text>
  <rect class="d-box-warn" x="480" y="165" width="190" height="40" rx="8"/>
  <text class="d-label" x="575" y="190" text-anchor="middle">نجحت كلها: نجا</text>
</svg>
:::

تسأل الـ coverage "هل عمل هذا السطر؟" ويسأل الـ mutation testing "لو كان هذا السطر خاطئًا، هل سيلاحظ أحد؟" والسؤال الثاني هو الذي يهمّك.

## تشغيل StrykerJS مع Vitest

StrykerJS هي أداة الـ mutation testing الراسخة لـ JavaScript وTypeScript، ولها plugin مشغّل لـ Vitest:

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
npx stryker init   # interactive; or write the config yourself
```

```json title=stryker.config.json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "testRunner": "vitest",
  "plugins": ["@stryker-mutator/vitest-runner"],
  "mutate": ["src/money/**/*.js", "!src/**/*.test.js"],
  "reporters": ["html", "clear-text", "progress"],
  "thresholds": { "high": 80, "low": 60, "break": 50 },
  "incremental": true
}
```

يشغّل `npx stryker run` مجموعتك أولًا مرة واحدة ليعرف أيّ الاختبارات تغطّي أيّ الأسطر، ثم يختبر كل mutant. ويعرض تقرير HTML الكود المصدري مع تعليم كل mutant بأنه قُتل أو نجا. ويُفشل `thresholds.break` التشغيل إن كان المقياس دونه، ويعيد `incremental` استخدام النتائج للكود والاختبارات التي لم تتغيّر منذ التشغيل الأخير، وهذا مهم جدًا للسرعة.

## قراءة الناجين

الحالات التي ستراها أكثر من غيرها:

- **Killed (مقتول)**: فشل اختبار. جيد.
- **Survived (ناجٍ)**: نجح كل اختبار يغطّيه. assertion ناقص أو ضعيف.
- **No coverage (بلا تغطية)**: لم يشغّل أيّ اختبار ذلك السطر أصلًا. وكانت الـ coverage ستخبرك بهذا أيضًا.
- **Timeout (انتهاء المهلة)**: سبّب الـ mutant حلقة لا نهائية فانتهت مهلة الاختبارات. ويُحسب على أنه مكتشَف.

الناجون هم الكنز. بالنسبة إلى `settleUp`، قد يقول التقرير:

```text
[Survived] MethodExpression   src/money/settle-up.js:21
-   const amountCents = Math.min(debtors[d].cents, creditors[c].cents);
+   const amountCents = Math.max(debtors[d].cents, creditors[c].cents);

[Survived] ConditionalExpression   src/money/settle-up.js:4
-   if (sum !== 0) throw new Error('Balances must add up to zero');
+   if (false) throw new Error('Balances must add up to zero');
```

كل واحد منها تعليمة دقيقة. الأول يقول إن لا اختبار يستخدم مبالغ يدين فيها المدين بمجموع مختلف عمّا يستحقّه الدائن، فيعطي `min` و`max` الإجابة نفسها في كل اختبار. والثاني يقول إن لا اختبار يمرّر مدخلات غير متوازنة أبدًا. اكتب هذين الاختبارين فيُقتل الاثنان معًا.

:::mistake مطاردة مقياس طفرات 100%
بعض الـ mutants **متكافئة** (equivalent): التغيير لا يبدّل أي سلوك يستطيع مستدعٍ ملاحظته. قلب اتجاه الترتيب في `settleUp` كثيرًا ما يظلّ يُنتج تسوية صالحة؛ والـ mutant الذي يغيّر `cents < 0` إلى `cents <= 0` قد لا يؤثّر إلا في من رصيدهم صفر، والحلقة لا تصل إليهم أبدًا. كتابة اختبارات لقتل هذه تعني تأكيد تفاصيل داخلية. اقبلها، أو عطّل تلك الطفرة بعينها على ذلك السطر بتعليق مثل `// Stryker disable next-line all: equivalent, order doesn't matter`.
:::

## الـ mutants المنتقاة يدويًا مقابل المولّدة

الـ mutants في تمارين هذه الدورة انتُقيت يدويًا: كل واحد منها يحاكي خطأً يكتبه الناس فعلًا، مثل معامل متبادل الموقع أو `await` منسيّة. أما mutants الـ Stryker فتُولَّد بشكل منهجي من مجموعة ثابتة من المحوِّرات (mutators)، عادةً عشرات منها لكل دالة، فتجد فجوات لم تكن لتخطر لك، وتُنتج أيضًا بعض الضجيج. كلاهما مفيد. حين تراجع اختبارات زميل، فعادة الانتقاء اليدوي هي النسخة السريعة: اسأل "ما الخطأ الأرجح هنا، وأيّ اختبار سيفشل؟" وحين تريد قياسًا على مستوى وحدة كاملة، دع الأداة تولّد القائمة.

## أين يناسب

الـ mutation testing بطيء: مئات الـ mutants، كل منها يشغّل جزءًا من مجموعتك. بضع عادات تُبقيه عمليًا:

- **احصره** بـ `mutate` في الكود الذي تكون أخطاؤه مكلفة: المال، والصلاحيات، والتحليل. لا في كود ربط الواجهة.
- **شغّله تدريجيًا** محليًا، ووفق جدول زمني (ليليًا) أو على الملفات المتغيّرة في CI، بدل تشغيله على المستودع كله مع كل push.
- **استخدم التقرير في المراجعة**: الـ pull request الذي يضيف منطقًا وmutants ناجية يستحق سؤالًا.

في التمرين تحصل على مجموعة ضعيفة لـ `settleUp` وقائمة بالناجين، وتكتب الاختبارات التي تقتلهم.
