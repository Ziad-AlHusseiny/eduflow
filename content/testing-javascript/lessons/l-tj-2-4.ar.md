---
summary: تستبدل المتعاونين بـ vi.fn وvi.spyOn، وتتحكّم في الوقت بالمؤقّتات المزيّفة، وتميّز الحالات التي يجعل فيها الـ mocking الاختبار ينجح بينما الكود الحقيقي معطّل.
takeaways:
  - "ينشئ `vi.fn()` دالة تسجّل كل استدعاء، وتستطيع أن تحدّد ما تعيده باستخدام `mockReturnValue` أو `mockResolvedValue` أو `mockImplementation`."
  - "يراقب `vi.spyOn(object, 'method')` دالة حقيقية ويستطيع استبدالها؛ أعِد الـ spies دائمًا إلى أصلها، مثلًا بـ `vi.restoreAllMocks()` داخل `afterEach`."
  - استخدم الـ mocks عند حدود نظامك (الشبكة، والبريد، والوقت، والعشوائية)، واستخدم الكود الحقيقي لوحداتك أنت.
  - "تسمح المؤقّتات المزيّفة (`vi.useFakeTimers` و`vi.advanceTimersByTime`) للاختبار بأن يقفز فوق فترات الانتظار بدل أن ينتظرها."
  - كل mock ادّعاء عن طريقة عمل الشيء الحقيقي؛ وحين يبتعد هذا الادّعاء عن الواقع، يبقى الاختبار أخضر بينما ينكسر الإنتاج.
further:
  - title: Vitest — Mocking guide
    url: https://vitest.dev/guide/mocking
  - title: Vitest — Mock functions API
    url: https://vitest.dev/api/mock
  - title: Vitest — Fake timers
    url: https://vitest.dev/guide/mocking/timers
quiz:
  - q: "تريد التحقّق من أن `remindDebtors` تستدعي `sendReminder('Ben', 'You owe $5.00 to the group')`. أيّ assertion هو المناسب؟"
    options:
      - text: "`expect(sendReminder).toHaveBeenCalledWith('Ben', 'You owe $5.00 to the group')`"
        why: 'صحيح. ينجح `toHaveBeenCalledWith` إن كان أيّ استدعاء مسجَّل قد استخدم هذه المعاملات بالضبط، وبهذا الترتيب.'
      - text: "`expect(sendReminder('Ben')).toBe('You owe $5.00 to the group')`"
        why: 'هذا يستدعي الـ mock بنفسك ويفحص قيمته المعادة؛ ولا يقول شيئًا عمّا فعلته `remindDebtors`.'
      - text: "`expect(sendReminder).toHaveBeenCalled()`"
        why: ينجح حتى لو كانت المعاملات خاطئة أو متبادلة الموقع، فيفوته معظم الأخطاء التي تهمّك.
    answer: 0
  - q: 'اختبار لنموذج المصروفات يستخدم mock مكان الوحدة الداخلية `parseAmount` بحيث تعيد دائمًا 1250. ثم يظهر خطأ في `parseAmount` الحقيقية. ماذا يحدث لاختبار النموذج؟'
    options:
      - text: يفشل، لأن Vitest تكتشف أن الـ mock والوحدة الحقيقية لا يتّفقان.
        why: لا تعرف Vitest ما الذي كانت الوحدة الحقيقية ستعيده؛ فالـ mock يحلّ محلّها بالكامل.
      - text: يرمي خطأً، لأن الـ mocks لا تستطيع استبدال وحدات تملكها أنت.
        why: "يستطيع `vi.mock` استبدال أي وحدة، بما فيها وحداتك، وهذا بالضبط مكمن الخطر هنا."
      - text: يبقى أخضر، لأنه لا يشغّل المحلّل الحقيقي أبدًا؛ فلم يعد النموذج والمحلّل يُختبران معًا.
        why: صحيح. استخدام الـ mocks مكان وحداتك الصافية لا يوفّر سرعة تُذكر، ويُلغي التكامل الذي أردت فحصه.
    answer: 2
  - q: "تُحفظ المسوّدة تلقائيًا بعد ثانيتين من آخر ضغطة مفتاح. مع تفعيل `vi.useFakeTimers()`، كيف يجعل الاختبار الحفظ يحدث؟"
    options:
      - text: 'بالانتظار عبر `await new Promise((r) => setTimeout(r, 2000))`.'
        why: 'مع المؤقّتات المزيّفة يكون `setTimeout` هذا مزيّفًا أيضًا، فلا يعمل من تلقاء نفسه أبدًا، ويعلق الاختبار حتى تنتهي مهلته.'
      - text: 'باستدعاء `vi.advanceTimersByTime(2000)` بعد آخر ضغطة مفتاح، ثم تأكيد أن الحفظ حدث.'
        why: صحيح. تقديم الساعة المزيّفة يشغّل فورًا كل مؤقّت يحين موعده خلال تلك الفترة.
      - text: بضبط مهلة الاختبار على 3 ثوانٍ كي يجد المؤقّت الحقيقي وقتًا ليعمل.
        why: مع تثبيت المؤقّتات المزيّفة لا يوجد مؤقّت حقيقي؛ والمهلة الأطول تؤخّر الفشل فقط.
    answer: 1
  - q: "لماذا تستدعي `vi.restoreAllMocks()` (أو تضبط `restoreMocks`) بعد الاختبارات التي تستخدم `vi.spyOn`؟"
    options:
      - text: 'لإعادة عدّادات الاستدعاء في mocks الـ `vi.fn()` إلى الصفر.'
        why: 'مسح سجلّ الاستدعاءات هو ما يفعله `mockClear`؛ أما الاستعادة فتتعلّق بإرجاع الدالة الأصلية.'
      - text: لإرجاع الدوال الأصلية كي لا يغيّر spy من اختبار ما السلوك في اختبار آخر.
        why: 'صحيح. يستبدل الـ spy دالة حقيقية على كائن مشترك مثل `console`؛ وبدون الاستعادة يتسرّب الاستبدال إلى الاختبارات اللاحقة.'
      - text: لأن Vitest ترفض تشغيل اختبار ثانٍ ما دام هناك spy موجود.
        why: تعمل Vitest بلا مشكلة مع spies متسرّبة، ولهذا بالضبط تسبّب التسرّبات حالات فشل مربكة في اختبارات لا علاقة لها.
    answer: 1
---

في الدرس الماضي كتبت API بديلًا (stub) باليد، مع عدّاد. نجح الأمر، واستغرق نحو خمسة عشر سطرًا. أدوات `vi` في Vitest تفعل الشيء نفسه في سطر واحد، وتضيف قوة كبيرة. وهذه القوة هي المشكلة: الـ mocking أسرع طريقة لكتابة اختبار ينجح بينما الكود الحقيقي معطّل. يغطّي هذا الدرس الأدوات، ويغطّي حسن التقدير في استخدامها.

## المصطلحات، باختصار

كل هذه **test doubles** (بدائل الاختبار)، أي أشياء تقوم مقام متعاون حقيقي:

:::figure بدائل الاختبار، من الأبسط إلى الأغنى سلوكًا
<svg viewBox="0 0 680 190" role="img" aria-labelledby="t1">
  <title id="t1">أربعة أنواع من بدائل الاختبار في صف: الـ stub يعيد إجابات جاهزة، والـ spy يسجّل الاستدعاءات، والـ mock هو spy تؤكّد عليه، والـ fake تطبيق خفيف يعمل فعلًا.</title>
  <rect class="d-box" x="10" y="40" width="155" height="110" rx="12"/>
  <text class="d-label-strong" x="87" y="72" text-anchor="middle">Stub</text>
  <text class="d-label-muted" x="87" y="100" text-anchor="middle">إجابات جاهزة</text>
  <text class="d-code" x="87" y="126" text-anchor="middle">returns {id}</text>
  <rect class="d-box-accent" x="180" y="40" width="155" height="110" rx="12"/>
  <text class="d-label-strong" x="257" y="72" text-anchor="middle">Spy</text>
  <text class="d-label-muted" x="257" y="100" text-anchor="middle">يسجّل الاستدعاءات</text>
  <text class="d-code" x="257" y="126" text-anchor="middle">.mock.calls</text>
  <rect class="d-box-primary" x="350" y="40" width="155" height="110" rx="12"/>
  <text class="d-label-strong" x="427" y="72" text-anchor="middle">Mock</text>
  <text class="d-label-muted" x="427" y="100" text-anchor="middle">spy تؤكّد عليه</text>
  <text class="d-code" x="427" y="126" text-anchor="middle">CalledWith</text>
  <rect class="d-box-success" x="520" y="40" width="155" height="110" rx="12"/>
  <text class="d-label-strong" x="597" y="72" text-anchor="middle">Fake</text>
  <text class="d-label-muted" x="597" y="100" text-anchor="middle">يعمل، وأبسط</text>
  <text class="d-code" x="597" y="126" text-anchor="middle">in-memory DB</text>
</svg>
:::

في Vitest، يعطيك `vi.fn()` الـ stub والـ spy (الجاسوس) في كائن واحد، والناس يسمّون كل ذلك "mocks" (بدائل وهمية). الأسماء أقل أهمية من السؤال الذي يجيب عنه كل منها: *ماذا يعيد هذا المتعاون؟* (stub)، و*كيف استُدعي؟* (spy).

## vi.fn: دالة تتذكّر

يرسل Splitwise-lite تذكيرًا إلى كل من عليه مال. دالة الإرسال تُمرَّر كمعامل، فيستطيع الاختبار استبدالها:

```js title=src/remind.test.js
import { test, expect, vi } from 'vitest';
import { remindDebtors } from './remind.js';

test('reminds people who owe money, with the amount', () => {
  const sendReminder = vi.fn();

  const sent = remindDebtors({ Ana: 1500, Ben: -500, Cai: 0 }, sendReminder);

  expect(sent).toBe(1);
  expect(sendReminder).toHaveBeenCalledTimes(1);
  expect(sendReminder).toHaveBeenCalledWith('Ben', 'You owe $5.00 to the group');
});
```

يعيد `vi.fn()` القيمة `undefined` افتراضيًا. أعطه سلوكًا حين يحتاج الكود الخاضع للاختبار إلى إجابة:

```js
const post = vi.fn().mockResolvedValue({ id: 'e1' });          // async success
const failing = vi.fn().mockRejectedValue(new Error('Offline')); // async failure
const send = vi.fn().mockImplementation((name) => {
  if (name === 'Ben') throw new Error('Mailbox full');
});
```

يُسجَّل كل استدعاء في `send.mock.calls`، وهي مصفوفة من مصفوفات المعاملات، للحالات النادرة التي لا تغطّيها الـ matchers.

## vi.spyOn: مراقبة دالة حقيقية

أحيانًا يكون المتعاون دالة على كائن موجود، مثل `console.warn`. يلفّها `vi.spyOn`: افتراضيًا تظلّ الدالة الحقيقية تعمل، ويسجّل الـ spy الاستدعاءات. أضف `mockImplementation` لإسكاتها أو استبدالها:

```js
import { afterEach, test, expect, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks(); // put console.warn back
});

test('warns and carries on when one reminder fails', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const send = vi.fn().mockImplementationOnce(() => { throw new Error('Mailbox full'); });

  const sent = remindDebtors({ Ben: -500, Dee: -300 }, send);

  expect(sent).toBe(1);
  expect(send).toHaveBeenCalledTimes(2);
  expect(warn).toHaveBeenCalledWith('Could not remind Ben: Mailbox full');
});
```

يستبدل الـ spy دالة على كائن **مشترك**. انسَ استعادتها، وسيعمل كل اختبار لاحق في الملف مع `console.warn` صامت. وجود `vi.restoreAllMocks()` داخل `afterEach`، أو `restoreMocks: true` في الإعدادات، يجعل التنظيف تلقائيًا.

## المؤقّتات المزيّفة: تخطّي الانتظار

الكود الذي ينتظر (الحفظ التلقائي المؤجَّل بـ debounce، والتباطؤ بين المحاولات، ورسائل "تراجع" المؤقّتة) اختباره بالوقت الحقيقي مؤلم. تستبدل المؤقّتات المزيّفة (fake timers) كلًّا من `setTimeout` و`setInterval` و`Date` بساعة يتحكّم فيها الاختبار:

```js
import { afterEach, test, expect, vi } from 'vitest';

afterEach(() => vi.useRealTimers());

test('autosaves the draft 2 seconds after the last change', () => {
  vi.useFakeTimers();
  const save = vi.fn();
  const draft = createDraft({ save, delayMs: 2000 }); // debounced

  draft.update({ description: 'Din' });
  draft.update({ description: 'Dinner' });
  vi.advanceTimersByTime(1999);
  expect(save).not.toHaveBeenCalled();

  vi.advanceTimersByTime(1);
  expect(save).toHaveBeenCalledWith({ description: 'Dinner' });
});
```

يشغّل `vi.advanceTimersByTime(ms)` فورًا كل مؤقّت يحين موعده خلال تلك الفترة. ويثبّت `vi.setSystemTime(date)` قيمة `new Date()`، وهكذا تختبر أن "التذكيرات تُرسل في أول كل شهر". وحين تجدول المؤقّتات promises، استخدم النسخ غير المتزامنة مثل `vi.advanceTimersByTimeAsync`. (ساحة التجربة لا تشغّل إلا المؤقّتات الحقيقية، لذا يبقى هذا المثال على الصفحة فقط.)

## متى يضرّ الـ mocking

كل mock **ادّعاء** عن طريقة عمل الشيء الحقيقي. وحين يبتعد الواقع عن الادّعاء، يستمرّ الاختبار في النجاح. الأنماط التي تؤذي:

- **استخدام الـ mocks مكان وحداتك أنت.** استبدال `parseAmount` داخل اختبار النموذج يعني أن النموذج والمحلّل لا يُختبران معًا أبدًا، وهذا كان الهدف من الاختبار. كودك الصافي سريع؛ استخدمه.
- **استخدام mock مكان الشيء الخاضع للاختبار نفسه.** إن تجسّست على `remindDebtors` وأنت تختبر `remindDebtors`، فأنت تختبر الـ spy.
- **تأكيد كل استدعاء.** فحص التسلسل الدقيق لأربعة عشر استدعاءً داخليًا يجمّد التفاصيل الداخلية. أكّد الاستدعاءات التي تهمّ المستدعي، مثل "وصل تذكير إلى Ben".
- **mocks تكذب.** الـ API البديل لديك يعيد `{ id }`؛ والحقيقي يعيد `{ data: { id } }`. الـ unit tests خضراء، والتطبيق معطّل. ومحاكاة الشبكة في القسم التالي واختبارات الـ end-to-end في القسم 4 موجودة لالتقاط هذا بالضبط.

:::mistake اللجوء إلى vi.mock أولًا
يستبدل `vi.mock('./api.js')` وحدة كاملة للملف، ويُرفع (hoisted) فوق الاستيرادات، وهذا يفاجئ الناس. إنه مفيد مع SDK خارجي لا تستطيع حقنه. أما مع كودك أنت، فتمرير المتعاون كمعامل (كما تفعل `remindDebtors`) يُبقي الاختبارات أبسط والتصميم أصدق.
:::

فحص سريع لأي mock تكتبه: احذف سطرًا واحدًا من الكود الحقيقي الذي يقوم مقامه. إن لم يفشل أي اختبار في أي مكان من المجموعة، فذلك الـ mock كان يُخفي السلوك بدل أن يختبر ما حوله، وتحتاج في مكان ما إلى اختبار يشغّل الشيء الحقيقي.

قاعدتي: **استخدم الـ mocks عند حدود** نظامك (الشبكة، والبريد، والدفع، والوقت، والعشوائية)، وشغّل الكود الحقيقي في كل ما بداخله.

في التمرين، استخدم `vi.fn` و`vi.spyOn` لالتقاط أربعة أخطاء في `remindDebtors`. وينتقل القسم 3 من الدوال إلى الـ DOM.
