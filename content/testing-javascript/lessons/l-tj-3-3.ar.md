---
summary: تختبر واجهة تتغيّر بعد تحميل البيانات أو فشلها، باستخدام استعلامات findBy وwaitFor بدل الانتظار الثابت، وتتحكّم في الاعتمادية غير المتزامنة لتختبر حالات التحميل والنجاح والخطأ.
takeaways:
  - "تعيد استعلامات `findBy` وعدًا (promise) يُحلّ حين يظهر العنصر، وتعيد المحاولة حتى انتهاء المهلة (ثانية واحدة افتراضيًا)."
  - "يعيد `waitFor(callback)` تشغيل الدالة حتى تتوقّف عن رمي الأخطاء؛ استخدمه مع assertions لا تتعلّق بظهور عنصر، مثل عدد استدعاءات mock."
  - لا تنتظر وقتًا ثابتًا أبدًا (sleep)؛ انتظر الشرط الذي يهمّك فعلًا.
  - "تحكّم في الاعتمادية غير المتزامنة بنفسك (`vi.fn` يُحلّ، أو يُرفض، أو يبقى معلّقًا)، كي تكون حالات التحميل والنجاح والخطأ وإعادة المحاولة كل منها اختبارًا حتميًّا واحدًا."
further:
  - title: Testing Library — Async methods
    url: https://testing-library.com/docs/dom-testing-library/api-async
  - title: Testing Library — Appearance and disappearance
    url: https://testing-library.com/docs/guide-disappearance
  - title: Vitest — vi.waitFor
    url: https://vitest.dev/api/vi#vi-waitfor
quiz:
  - q: 'تظهر قائمة الأرصدة بعد أن يُحلّ `loadBalances()`. أيّ سطر ينتظرها بشكل صحيح؟'
    options:
      - text: "`await new Promise((r) => setTimeout(r, 500)); screen.getByRole('list');`"
        why: الانتظار الثابت أطول من اللازم على جهاز سريع، وأقصر من اللازم على خادم CI مشغول؛ وهو المصدر الكلاسيكي لاختبارات الواجهة المتقلّبة.
      - text: "`const list = await screen.findByRole('list', { name: 'Balances' });`"
        why: 'صحيح. يعيد `findByRole` المحاولة حتى تظهر القائمة (أو تمرّ ثانية)، فينتظر بالضبط المدة اللازمة.'
      - text: "`const list = screen.getByRole('list', { name: 'Balances' });`"
        why: "يفحص `getByRole` مرة واحدة، فورًا، قبل أن يُحلّ الـ promise، فيرمي خطأً."
    answer: 1
  - q: "ما المشكلة هنا؟\n```js\nawait waitFor(() => {\n  user.click(screen.getByRole('button', { name: 'Try again' }));\n  expect(loadBalances).toHaveBeenCalledTimes(2);\n});\n```"
    options:
      - text: "لا يمكن أن يحتوي `waitFor` على استدعاءات `expect`."
        why: 'الـ assertions هي بالضبط ما يوضع داخل `waitFor`؛ فهو يعيد تشغيل الدالة حتى تتوقّف عن رمي الأخطاء.'
      - text: "`toHaveBeenCalledTimes` لا يعمل مع الدوال غير المتزامنة."
        why: يعدّ الاستدعاءات على أي mock، متزامنًا كان أو غير متزامن؛ وهذا السطر سليم وحده.
      - text: النقر أثر جانبي داخل دالة يُعاد تشغيلها، فقد يُنفَّذ عدة مرات ويضخّم عدد الاستدعاءات.
        why: 'صحيح. انقر مرة واحدة، خارجها، ثم `await waitFor(() => expect(loadBalances).toHaveBeenCalledTimes(2))`.'
    answer: 2
  - q: كيف تختبر أن رسالة "Loading balances…" تظهر *قبل* وصول البيانات، دون أن تتسابق مع الـ promise؟
    options:
      - text: 'اجعل `loadBalances` تعيد promise يحلّه الاختبار يدويًا، ثم أكّد رسالة التحميل، ثم حلّه.'
        why: صحيح. الـ promise المؤجَّل يجمّد المكوّن في حالة التحميل للمدة التي تحتاجها، فيكون الاختبار حتميًّا.
      - text: 'أضف تأخيرًا بمقدار 50 ms إلى `loadBalances` الحقيقية في الاختبارات.'
        why: "أي طريقة تعتمد على التوقيت تتسابق: على خادم بطيء قد يفوت الـ assertion أو يصيب في اللحظة الخطأ."
      - text: "استخدم `findByRole('status')` كي ينتظر الرسالة."
        why: الرسالة تظهر فورًا، فإيجادها ليس الجزء الصعب؛ الخطر أن تكون البيانات قد حلّت محلّها بحلول الوقت الذي تنظر فيه.
    answer: 0
---

تحمّل لوحة الأرصدة في Splitwise-lite بياناتها من الخادم. للحظة تعرض "Loading balances…"، ثم تعرض القائمة، أو، في قطار داخل نفق، "Could not load balances." مع زر "Try again". كل حالة من هذه الحالات شيء يراه المستخدم، لذا تستحق كل منها اختبارًا. الصعوبة في الزمن: الـ DOM الذي تريد فحصه لم يوجد بعد حين يصل الاختبار إلى السطر الذي يفحصه.

## الطريقة الخاطئة: الانتظار الثابت (sleep)

أول ما يخطر في البال هو الانتظار قليلًا:

```js
mountBalancePanel(document.body, loadBalances);
await new Promise((resolve) => setTimeout(resolve, 500)); // please be enough
expect(screen.getByRole('list', { name: 'Balances' })).toBeInTheDocument();
```

على حاسوبك تصل البيانات في 5 ms، فيضيّع الاختبار 495. وعلى خادم CI مشغول تستغرق أحيانًا 600، فيفشل الاختبار بلا سبب. اضرب ذلك في بضع مئات من الاختبارات، فتحصل على مجموعة بطيئة حمراء كل ثلاثاء. **انتظر الشرط، لا الساعة.**

## findBy: انتظر عنصرًا

استعلامات `findBy` هي استعلامات `getBy` تعيد المحاولة. تعيد promise يُحلّ بمجرد أن يوجد العنصر، ويُرفض إن لم يظهر خلال المهلة (1,000 ms افتراضيًا):

```js title=src/balance-panel.test.js
// @vitest-environment jsdom
import { afterEach, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { mountBalancePanel } from './balance-panel.js';

afterEach(() => {
  document.body.innerHTML = '';
});

test('shows a loading message, then the balances', async () => {
  const loadBalances = vi.fn().mockResolvedValue({ Ana: 500, Ben: -500 });

  mountBalancePanel(document.body, loadBalances);

  expect(screen.getByRole('status')).toHaveTextContent('Loading balances');
  expect(await screen.findByRole('list', { name: 'Balances' })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
```

الاختبار سريع حين يكون الكود سريعًا، وصبور حين يكون بطيئًا، ويُقرأ كقصة ما يراه المستخدم. والسطر الأخير مهم أيضًا: اللوحة التي تعرض البيانات لكنها تترك "Loading…" على الشاشة فيها خطأ حقيقي.

## waitFor: انتظر أي شيء آخر

يشغّل `waitFor(callback)` الدالة، فإن رمت خطأً، يعيد تشغيلها كل 50 ms حتى تنجح أو تنتهي المهلة. استخدمه للشروط التي ليست "ظهر عنصر":

```js
await waitFor(() => expect(loadBalances).toHaveBeenCalledTimes(2));
```

ولدى Vitest دالتها الخاصة `vi.waitFor` التي تعمل بالطريقة نفسها خارج الـ DOM. وللحالة المعاكسة، ينتظر `waitForElementToBeRemoved(() => screen.queryByRole('status'))` اختفاء شيء ما.

:::figure يستطلع findBy وwaitFor حتى يتحقّق الشرط
<svg viewBox="0 0 680 200" role="img" aria-labelledby="t1">
  <title id="t1">خط زمني: يُعاد تشغيل الاستعلام كل 50 ملّي ثانية؛ يفشل أثناء التحميل، ثم ينجح بمجرد عرض القائمة، قبل مهلة الـ 1000 ملّي ثانية بوقت طويل.</title>
  <path class="d-line" d="M40 100 L640 100"/>
  <text class="d-label-muted" x="40" y="130">0 ms</text>
  <text class="d-label-muted" x="600" y="130">1000 ms</text>
  <path class="d-line d-dashed" d="M620 60 L620 140"/>
  <text class="d-label-muted" x="620" y="50" text-anchor="middle">المهلة</text>
  <circle class="d-dot" cx="60" cy="100" r="6"/>
  <circle class="d-dot" cx="110" cy="100" r="6"/>
  <circle class="d-dot" cx="160" cy="100" r="6"/>
  <circle class="d-dot" cx="210" cy="100" r="6"/>
  <text class="d-label" x="135" y="80" text-anchor="middle">لم تظهر بعد</text>
  <rect class="d-box-success" x="250" y="82" width="150" height="36" rx="8"/>
  <text class="d-label" x="325" y="105" text-anchor="middle">وُجدت القائمة</text>
  <text class="d-label-muted" x="325" y="160" text-anchor="middle">يكمل الاختبار فورًا</text>
</svg>
:::

:::mistake آثار جانبية داخل waitFor
لأن `waitFor` يعيد تشغيل دالته، فأي شيء بداخلها قد يحدث عدة مرات. النقر داخل `waitFor` قد يُنفَّذ ثلاث مرات ويحوّل إعادة محاولة واحدة إلى ثلاث. اقصر الدالة على الاستعلامات والـ assertions؛ وانقر واكتب قبلها، مرة واحدة. ولا تلفّ `findBy` داخل `waitFor`: فهو ينتظر أصلًا.
:::

## التحكّم في الزمن من جهة الاختبار

يتولّى `findBy` *الانتظار*. ولتختبر كل حالة بشكل حتمي، تتحكّم أيضًا في **الاعتمادية**. ولأن `loadBalances` تُمرَّر كمعامل، يستطيع `vi.fn` أن يجعلها تفعل أي شيء:

- `mockResolvedValue(data)` للنجاح؛
- `mockRejectedValue(new Error('Offline'))` للفشل؛
- promise تحلّه يدويًا، لتجميد حالة التحميل:

```js
test('keeps showing the loading message until data arrives', async () => {
  let finish;
  const loadBalances = vi.fn(() => new Promise((resolve) => { finish = resolve; }));

  mountBalancePanel(document.body, loadBalances);
  expect(screen.getByRole('status')).toHaveTextContent('Loading balances');

  finish({ Ana: 0 });
  expect(await screen.findByText('Ana is settled up')).toBeInTheDocument();
});
```

لمسار إعادة المحاولة، ابدأ بـ mock يرفض، وانتظر التنبيه، ثم حوّل الـ mock إلى النجاح، وانقر "Try again" مرة واحدة، ثم استخدم `findBy` لإيجاد القائمة. كل خطوة شيء يفعله المستخدم أو يراه، ولا شيء يعتمد على سرعة الجهاز.

:::tip مؤقّتات مزيّفة للواجهة المؤقّتة
ما زال الوقت الحقيقي مهمًّا للواجهة التي تنتظر عن قصد، مثل رسالة منبثقة تختفي بعد خمس ثوانٍ. اجمع المؤقّتات المزيّفة مع user-event بتمرير `advanceTimers: vi.advanceTimersByTime` إلى `userEvent.setup()`، فتعمل تأخيرات الكتابة ومهلك كلها على الساعة المزيّفة.
:::

## حين لا تكفي المهلة الافتراضية

يستسلم `findBy` و`waitFor` بعد ثانية واحدة. وهذا أكثر من كافٍ لكود تتحكّم في اعتمادياته، وإن احتاج اختبار مكوّن إلى وقت أطول، فالسبب المعتاد استدعاء شبكة حقيقي أو مؤقّت حقيقي تسرّب إليه. أصلح التسرّب أولًا. وحين يكون الانتظار مشروعًا فعلًا، مرّر خيارات: `screen.findByRole('list', {}, { timeout: 3000 })` (المعامل الثالث هو خيارات الانتظار) أو `waitFor(callback, { timeout: 3000 })`.

في اختبارات React سترى أحيانًا تحذيرًا بأن تحديثًا "was not wrapped in act(...)". يعني ذلك عادةً أن تحديثًا للـ state حدث **بعد** أن توقّف الاختبار عن النظر: promise ما حُلّ متأخرًا. والإصلاح لا يكون تقريبًا أبدًا بلفّ الأشياء في `act` يدويًا؛ بل بانتظار الحالة النهائية التي سيراها المستخدم بـ `await`، مع استعلام `findBy`.

## في ساحة التجربة

يضيف الكود المبدئي للتمرين `waitFor(callback)` و`findByRole(root, role, options)` و`findByText(root, text)` إلى بدائل الاستعلامات. تستطلع كل 20 ms وتستسلم بعد 500 ms، فيفشل الاختبار على نسخة معطوبة بسرعة.

ينقل الدرس القادم هذا كله إلى مكوّنات React، وإلى استدعاءات الشبكة التي تقف خلف `loadBalances`.
