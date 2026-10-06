---
summary: تقرأ رسائل الأخطاء وآثار المكدّس (stack traces)، وترمي الأخطاء وتلتقطها عن قصد بأنواع أخطاء مخصّصة، وتجد الأخطاء البرمجية بشكل منهجي باستخدام نقاط التوقّف ومصحّح الأخطاء في DevTools.
takeaways:
  - رسالة الخطأ تسمّي نوع الخطأ، وتقول ما الذي حدث، وأثر المكدّس (stack trace) الخاص بها يشير إلى الملف والسطر حيث وقع.
  - 'ارمِ `Error` حين يعجز كودك عن الاستمرار بشكل معقول؛ والتقطه فقط حيث تستطيع فعل شيء مفيد، وأعِد رمي كل ما لم تتوقّعه.'
  - 'صنف خطأ مخصّص (`class ValidationError extends Error`) يتيح للمُستدعين التمييز بين المشاكل المتوقّعة والأخطاء البرمجية الحقيقية باستخدام `instanceof`.'
  - 'نقطة التوقّف (breakpoint) توقف كودك مؤقتًا عند سطر ما كي تفحص كل متغيّر وتتقدّم فيه سطرًا سطرًا؛ و`debugger;` تضع واحدة من داخل الكود.'
  - صحّح الأخطاء بالأدلة لا بالتخمين؛ أعِد إنتاج الخطأ، وجد أول سطر يختلف فيه الواقع عن توقّعك، ثم أصلحه.
further:
  - title: Control flow and error handling (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
  - title: What went wrong? Troubleshooting JavaScript (MDN)
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_went_wrong
  - title: Error (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
quiz:
  - q: '`TypeError: expenses.map is not a function` عند `renderExpenses (ui.js:14)`. ما الخطوة الأولى الأنفع؟'
    options:
      - text: 'غلّف السطر 14 بـ `try`/`catch` كي تظل الصفحة تعمل.'
        why: هذا يُخفي العَرَض ويترك السبب. وستتوقّف القائمة عن العرض بصمت.
      - text: 'أعِد كتابة `renderExpenses` بحلقة `for` بدلًا من `map`.'
        why: 'الحلقة ستفشل أيضًا، أو ستتصرّف بغرابة. السؤال الحقيقي هو ما الذي تكونه `expenses` فعلًا.'
      - text: أعِد تشغيل خادم التطوير وامسح ذاكرة التخزين المؤقت في المتصفّح.
        why: الرسالة تصف مشكلة منطقية، قيمة من نوع خاطئ، لا ملفًا قديمًا.
      - text: 'توقّف عند السطر 14 من ui.js وافحص ما تحمله `expenses` فعلًا، ثم تتبّع مصدر تلك القيمة.'
        why: 'صحيح. `map` مفقودة، إذن `expenses` ليست مصفوفة، ربما `null` قادمة من التخزين أو كائن. اكتشف أيّهما، ثم أصلح المصدر.'
    answer: 3
  - q: 'كتلة `catch` في دالة الحفظ في Pocket مكتوبة هكذا: `catch (error) {}`. ما المشكلة؟'
    options:
      - text: أي فشل، بما في ذلك خطأ تافه كخطأ إملائي في كودك أنت، يختفي الآن دون أثر.
        why: صحيح. كتلة catch الفارغة تبتلع كل الأخطاء. تعامل مع ما تتوقّعه، واطبع الباقي أو أعِد رميه.
      - text: 'يجب استخدام المعامل `error` دائمًا وإلا فلن يعمل الكود.'
        why: 'المعامل غير المستخدم مسموح. بل يمكنك كتابة `catch {}`. المشكلة في التخلّص من الأخطاء بصمت.'
      - text: 'كتل `catch` لا تعمل إلا داخل دوال `async`.'
        why: '`try`/`catch` تعمل في أي دالة. ومع الكود غير المتزامن عليك فقط أن تستخدم `await` داخل `try`.'
    answer: 0
  - q: تريد أن تعرف لماذا يكون المجموع خاطئًا فقط عند المصروف رقم 40 في حلقة. أيّ ميزة في DevTools أنسب؟
    options:
      - text: '`console.log` قبل الحلقة.'
        why: هذا يُنفَّذ مرة واحدة، قبل الجزء المهم. ولا يستطيع أن يُريك الدورة الأربعين.
      - text: لوحة Network.
        why: لوحة Network تعرض الطلبات إلى الخوادم. وهذه عملية حسابية داخل كودك أنت.
      - text: 'نقطة توقّف مشروطة داخل الحلقة، مثل `i === 39`.'
        why: صحيح. يتوقّف مصحّح الأخطاء في تلك الدورة فقط، وتستطيع فحص كل متغيّر في تلك اللحظة.
      - text: إعادة تحميل الصفحة مع تعطيل ذاكرة التخزين المؤقت.
        why: التخزين المؤقت لا يغيّر طريقة تنفيذ عملية حسابية. تحتاج إلى النظر في القيم أثناء الحلقة.
    answer: 2
---

كل مبرمج يكتب أخطاء برمجية كل يوم. وما يميّز المطوّرين ذوي الخبرة عن المبتدئين ليس قلّة الأخطاء، بل طريقة أهدأ وأسرع في العثور عليها. وهذا يبدأ بقراءة ما يقوله لك الحاسوب.

## قراءة الخطأ

حين تعجز JavaScript عن الاستمرار، فإنها **ترمي** (throw) خطأً، وإن لم يلتقطه شيء، يعرض الـ console شيئًا كهذا:

```text
Uncaught TypeError: Cannot read properties of undefined (reading 'amount')
    at totalCents (expenses.js:12:31)
    at renderSummary (ui.js:40:17)
    at HTMLFormElement.<anonymous> (main.js:27:5)
```

اقرأه في ثلاثة أجزاء. **النوع**، `TypeError`، يقول ما صنف المشكلة: قيمة كان نوعها خاطئًا بالنسبة لما فعلته بها. و**الرسالة** تقول ماذا بالضبط: شيء ما قبل `.amount` كان `undefined`. و**أثر المكدّس** (stack trace) يسرد سلسلة استدعاءات الدوال التي أوصلت إلى هناك، الأحدث أولًا: فشلت `totalCents` في السطر 12 من `expenses.js`، وكانت قد استدعتها `renderSummary`، التي استدعاها معالج الإرسال في النموذج. وفي DevTools، كل موقع منها رابط يأخذك مباشرة إلى ذلك السطر.

الأنواع التي ستصادفها أكثر من غيرها:

| النوع | يعني عادةً |
|---|---|
| `ReferenceError` | اسم غير موجود: خطأ إملائي، أو استخدام قبل التصريح |
| `TypeError` | نوع خاطئ من القيم: استدعاء شيء ليس دالة، أو القراءة من `undefined` |
| `SyntaxError` | تعذّر تحليل الكود: قوس أو علامة تنصيص أو فاصلة مفقودة |
| `RangeError` | رقم خارج المسموح، مثل `toFixed(200)` |

## رمي الأخطاء عن قصد

يمكنك أن ترمي الأخطاء بنفسك، وينبغي أن تفعل حين يُعطى كودك شيئًا لا يستطيع التعامل معه بشكل معقول:

```js run
function parseAmount(text) {
  const dollars = Number(text);
  if (text.trim() === "" || !Number.isFinite(dollars) || dollars <= 0) {
    throw new Error(`Invalid amount: "${text}"`);
  }
  return Math.round(dollars * 100);
}

try {
  console.log(parseAmount("12.20"));
  console.log(parseAmount("twelve"));
  console.log("this line never runs");
} catch (error) {
  console.log("Caught:", error.message);
} finally {
  console.log("finally always runs");
}
```

`throw` توقف الدالة فورًا وتصعد في مكدّس الاستدعاءات حتى تلتقطها كتلة `try`/`catch` ما. وإن لم تلتقطها أي كتلة، تصبح خطأً غير ملتقط في الـ console. أما `finally` فتُنفَّذ سواء رُمي شيء أم لا، وهي المكان المناسب للتنظيف، مثل إخفاء مؤشّر التحميل.

### أنواع أخطاء مخصّصة

بعض الأخطاء متوقّعة، مثل أن يكتب المستخدم مبلغًا غير صالح؛ وبعضها أخطاء برمجية. ويحتاج المُستدعون إلى التمييز بينها، وصنف الخطأ المخصّص يجعل ذلك ممكنًا:

```js run
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function addFromForm(label, amountText) {
  if (label.trim() === "") {
    throw new ValidationError("label", "Enter what you spent money on.");
  }
  return { label: label.trim(), amount: Math.round(Number(amountText) * 100) };
}

try {
  addFromForm("  ", "4.50");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Show next to ${error.field}: ${error.message}`);
  } else {
    throw error; // not ours to handle
  }
}
```

`extends Error` تجعل `ValidationError` نوعًا من `Error` له أثر مكدّس، و`super(message)` تنفّذ الـ constructor الخاص بالصنف الأب، والخاصية الإضافية `field` تخبر النموذج أين يعرض الرسالة. وكتلة `catch` لا تتعامل إلا مع ما تفهمه، و**تعيد رمي** كل ما عداه، فتظل الأخطاء البرمجية الحقيقية تطفو إلى السطح.

:::mistake كتلة catch الفارغة
`try { save(); } catch (e) {}` تجعل كل فشل غير مرئي، بما في ذلك الخطأ الذي ستُدخله الشهر القادم. إن التقطت خطأ، فافعل به شيئًا: اعرض رسالة، أو استخدم قيمة بديلة، أو على الأقل `console.error(error)`. والتقط الخطأ أقرب ما يمكن إلى المكان الذي تستطيع فيه فعلًا معالجة المشكلة، ولا تلتقطه في أي مكان آخر.
:::

## مصحّح الأخطاء: توقّف وانظر

`console.log` أداة أولى جيدة، لكنها لا تُريك إلا ما خطر لك أن تطبعه. أما **مصحّح الأخطاء** (debugger) في DevTools فيوقف برنامجك مؤقتًا عند سطر ما ويُريك كل شيء.

في Chrome أو Edge، افتح DevTools، واذهب إلى لوحة **Sources**، وافتح ملفك، وانقر على رقم سطر. هذا يضع **نقطة توقّف** (breakpoint). وفي المرة التالية التي يوشك فيها هذا السطر أن يُنفَّذ، يتوقّف كل شيء مؤقتًا، وتستطيع:

- أن تمرّر المؤشّر فوق أي متغيّر لترى قيمته، أو تقرأها كلها في قسم **Scope**؛
- أن تقرأ قسم **Call Stack** لترى كيف وصلت إلى هنا؛
- أن **تتخطّى** (step over: نفّذ هذا السطر وتوقّف عند التالي)، أو **تدخل** (step into: اتبع استدعاء الدالة إلى داخلها)، أو **تخرج** (step out: أكمل هذه الدالة)؛
- أن تكتب أي تعبير في الـ Console أثناء التوقّف، مستخدمًا القيم المتوقّفة.

انقر بالزر الأيمن على رقم سطر لتضيف **نقطة توقّف مشروطة**، مثل `expense.amount > 100000`، لا تتوقّف إلا حين يكون الشرط صحيحًا. ويمكنك أيضًا أن تكتب التعليمة `debugger;` في كودك: فحين تكون DevTools مفتوحة، يتوقّف التنفيذ هناك. احذفها قبل أن تُجري commit.

:::figure حلقة تصحيح تنجح مع كل خطأ برمجي
<svg viewBox="0 0 660 200" role="img" aria-labelledby="t1">
  <title id="t1">دورة من خمس خطوات: أعِد إنتاج الخطأ بشكل موثوق، واقرأ الخطأ أو صِف المخرجات الخاطئة، وضع فرضية، وافحص القيم بالطباعة أو بنقاط التوقّف، ثم أصلح وتحقّق، وكرّر إن بقي الخطأ.</title>
  <rect class="d-box-accent" x="10" y="70" width="110" height="56" rx="10"/>
  <text class="d-label" x="65" y="103" text-anchor="middle">أعِد الإنتاج</text>
  <rect class="d-box" x="140" y="70" width="110" height="56" rx="10"/>
  <text class="d-label" x="195" y="103" text-anchor="middle">اقرأ</text>
  <rect class="d-box" x="270" y="70" width="120" height="56" rx="10"/>
  <text class="d-label" x="330" y="103" text-anchor="middle">افترض</text>
  <rect class="d-box-primary" x="410" y="70" width="110" height="56" rx="10"/>
  <text class="d-label" x="465" y="103" text-anchor="middle">افحص</text>
  <rect class="d-box-success" x="540" y="70" width="110" height="56" rx="10"/>
  <text class="d-label" x="595" y="96" text-anchor="middle">أصلح</text>
  <text class="d-label" x="595" y="114" text-anchor="middle">وتحقّق</text>
  <path class="d-arrow" d="M120 98 L136 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M250 98 L266 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M390 98 L406 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M520 98 L536 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M595 126 Q595 180 330 180 Q200 180 200 130" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="420" y="172" text-anchor="middle">ما زال معطّلًا: عُد إلى القراءة</text>
</svg>
:::

## طريقة تصلح لكل خطأ

1. **أعِد إنتاجه** بشكل موثوق. "أحيانًا يكون المجموع خاطئًا" تصبح "بعد حذف المصروف الأول، يكون المجموع خاطئًا".
2. **اقرأ** الخطأ، أو صِف بدقة ما توقّعته وما حصلت عليه.
3. **افترض**: ما الشيء الواحد الذي يفسّر ذلك؟
4. **افحص** القيم عند النقطة التي تشتبه بها، بنقطة توقّف أو بالطباعة، وجد أول مكان يختلف فيه الواقع عن توقّعك.
5. **أصلح** السبب هناك، ثم **تحقّق** بالخطوات نفسها بالضبط من الخطوة 1.

والإغراء، خاصة حين تكون متعبًا، هو القفز مباشرة إلى تغيير الكود حتى يختفي العَرَض. وهذا يُنتج عادةً خطأً ثانيًا. عشر دقائق من النظر في القيم الحقيقية خير من ساعة من التخمين.

صار لديك الآن كل قطعة يحتاجها Pocket. وفي الدرس التالي تجمعها في التطبيق المكتمل.
