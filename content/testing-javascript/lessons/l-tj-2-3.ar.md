---
summary: تختبر كودًا يرمي أخطاءً، أو يعيد promises، أو يعتمد على API غير مستقر، باستخدام assertions من نوع resolves وrejects مع await، وبدائل صغيرة مكتوبة باليد.
takeaways:
  - "استخدم `await` دائمًا مع الـ promise أو مع الـ assertion عليه؛ فالاختبار الذي ينتهي قبل أن يستقرّ الـ promise قد ينجح أيًّا كان ما يفعله الكود."
  - "`await expect(promise).rejects.toThrow('message')` هي أوضح طريقة لاختبار فشل غير متزامن."
  - الـ stub (بديل ثابت الاستجابة) متعاون مزيّف صغير تتحكّم فيه، مثل كائن api تنجح دالة post فيه، أو تفشل، أو تعدّ استدعاءاتها.
  - اختبر كل فرع من فروع معالجة الأخطاء، بما فيها الفرع الذي يجب أن يستسلم، وعُدّ الاستدعاءات حين يكون الفرق في عدد المحاولات.
further:
  - title: Vitest — resolves and rejects
    url: https://vitest.dev/api/expect#rejects
  - title: MDN — Using promises
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
  - title: Vitest — testTimeout
    url: https://vitest.dev/config/testtimeout
quiz:
  - q: |
      ينجح هذا الاختبار، مع أن التحقّق داخل `saveExpense` حُذف وصار الاستدعاء يُحلّ بنجاح. لماذا لم يلتقط الاختبار ذلك؟
      ```js
      test('rejects a blank description', async () => {
        try {
          await saveExpense({ description: ' ', amountCents: 100 }, api);
        } catch (error) {
          expect(error.message).toBe('Description is required');
        }
      });
      ```
    options:
      - text: "لا يستطيع `toBe` مقارنة رسائل الأخطاء؛ يحتاج إلى `toEqual`."
        why: 'الرسائل نصوص، فيقارنها `toBe` بشكل صحيح؛ والمشكلة أن الـ matcher لا يُبلغ أصلًا هنا.'
      - text: 'حين يُحلّ الـ promise بنجاح، لا تعمل كتلة `catch` أبدًا، فلا يُنفَّذ أي assertion وينجح الاختبار.'
        why: 'صحيح. استخدم `await expect(...).rejects.toThrow(...)`، الذي يفشل حين يُحلّ الـ promise بنجاح، أو أضف `expect.assertions(1)`.'
      - text: 'تتجاهل Vitest الأخطاء المرمية داخل كتل `catch`.'
        why: 'فشل assertion داخل `catch` كان سيُفشل الاختبار؛ المشكلة أن `catch` لا تعمل أصلًا.'
    answer: 1
  - q: "يجب أن تعيد `saveExpense` المحاولة مرة واحدة عند خطأ قابل لإعادة المحاولة، وأن تستسلم فورًا عند أي خطأ آخر. أيّ اختبار يلتقط نسخة تعيد المحاولة مع كل خطأ؟"
    options:
      - text: 'اجعل الـ stub لـ `post` يرفض دائمًا بخطأ غير قابل لإعادة المحاولة، وأكّد أن الـ promise يُرفض.'
        why: النسخة المعطوبة تنتهي بالرفض أيضًا (لأن محاولتها الثانية تفشل كذلك)، فلا يستطيع هذا الـ assertion وحده التمييز بين النسختين.
      - text: 'اجعل الـ stub لـ `post` ينجح، وأكّد أن الـ id يُعاد.'
        why: في المسار السعيد لا يقع أي خطأ، فلا يعمل منطق إعادة المحاولة أبدًا.
      - text: 'اجعل الـ stub لـ `post` يرفض مرة واحدة بخطأ غير قابل لإعادة المحاولة، وعُدّ الاستدعاءات، وأكّد أنها واحدة بالضبط.'
        why: صحيح. كلتا النسختين ترفضان، لكن المعطوبة وحدها تستدعي الـ API مرتين؛ وعدد الاستدعاءات هو الفرق الذي يمكن ملاحظته.
    answer: 2
  - q: "يفشل اختبار يستخدم الـ stub التالي `{ post: () => new Promise(() => {}) }` بعد خمس ثوانٍ بسبب انتهاء المهلة. ما الذي حدث؟"
    options:
      - text: 'يعيد الـ stub promise لا يستقرّ أبدًا، فينتظر `await saveExpense(...)` حتى تنتهي مهلة الاختبار في Vitest.'
        why: صحيح. الـ promise الذي لا يُستدعى فيه resolve ولا reject يبقى معلّقًا إلى الأبد؛ اجعل الـ stub ينجح أو يرفض صراحةً.
      - text: 'تحتاج Vitest إلى `vi.fn()` بدل الكائن العادي مع أي متعاون غير متزامن.'
        why: الكائنات العادية التي تحتوي دوالًا غير متزامنة stubs صالحة تمامًا؛ المشكلة أن هذا تحديدًا لا ينتهي أبدًا.
      - text: المهلة الافتراضية للاختبار أقصر من اللازم لكود الشبكة، ويجب رفعها إلى 30 ثانية.
        why: لا توجد شبكة هنا أصلًا. رفع المهلة يجعل الفشل نفسه يستغرق وقتًا أطول فقط.
    answer: 0
---

يحفظ Splitwise-lite المصروفات عبر اتصال هاتف في قطار. الطلبات تفشل. بعض حالات الفشل تستحق إعادة محاولة واحدة (انتهاء المهلة)؛ وبعضها لا (حين يقول الخادم إن المبلغ غير صالح). الكود الذي يقرّر ذلك نحو اثني عشر سطرًا لا أكثر، وهو بالضبط الكود الذي لا يختبره أحد، لأنه "غير متزامن" و"يحتاج إلى الـ API". ولا واحد من السببين عائق حقيقي.

## الدالة الخاضعة للاختبار

```js title=src/save-expense.js
export async function saveExpense(expense, api) {
  if (!expense.description?.trim()) throw new Error('Description is required');
  if (!Number.isInteger(expense.amountCents) || expense.amountCents <= 0) {
    throw new Error('Amount must be positive');
  }
  try {
    const { id } = await api.post('/expenses', expense);
    return id;
  } catch (error) {
    if (!error.retryable) throw error;
    const { id } = await api.post('/expenses', expense); // one retry
    return id;
  }
}
```

لأنها دالة `async`، يتحوّل كل `throw` داخلها إلى **promise مرفوض**. المستدعون (والاختبارات) لا يرون أبدًا استثناءً متزامنًا؛ بل يرون promise يُرفض.

## الـ assertions على الـ promises

تنتظر Vitest الاختبار الذي يكون `async` أو يعيد promise. وفي داخله لديك خياران جيدان:

```js
test('resolves with the new id', async () => {
  const api = { post: async () => ({ id: 'e1' }) };

  await expect(saveExpense({ description: 'Dinner', amountCents: 4500 }, api))
    .resolves.toBe('e1');
});

test('rejects a blank description', async () => {
  const api = { post: async () => ({ id: 'e1' }) };

  await expect(saveExpense({ description: '  ', amountCents: 4500 }, api))
    .rejects.toThrow('Description is required');
});
```

يمكنك أيضًا أن تستخدم `await` مع الاستدعاء ثم تؤكّد القيمة: `const id = await saveExpense(...); expect(id).toBe('e1');`. أما مع حالات الرفض، ففضّل `rejects` على `try/catch`: إن حُلّ الـ promise بنجاح على غير المتوقّع، يُفشل `rejects` الاختبار، بينما تتخطّى `try/catch` كتلة `catch` بصمت وينجح الاختبار. (وإن اضطررت إلى `try/catch`، فضع `expect.assertions(1)` في أعلى الاختبار كي تُفشله Vitest حين لا يُنفَّذ أي assertion.)

:::mistake إنهاء الاختبار قبل أن يستقرّ الـ promise
`saveExpense(expense, api).then((id) => expect(id).toBe('e1'))` بلا `await` ولا `return` يترك دالة الاختبار تنتهي أولًا. فيُعلَن الاختبار أخضر قبل أن يعمل الـ assertion؛ وفي أحسن الأحوال يظهر خطأ غير معالَج ومربك لاحقًا أثناء التشغيل، منفصلًا عن الاختبار الذي تسبّب فيه. تحميك Vitest 4 في حالة واحدة: الـ assertion من نوع `resolves` أو `rejects` الذي تنسى أن تضع قبله `await` يُفشل الاختبار. لكنها لا تستطيع حماية دوال `.then` الراجعة، ولا `try/catch` لا تعمل كتلة `catch` فيها أبدًا. العادة التي تغطّي كل ذلك: **كل promise في الاختبار يُنتظَر بـ await.**
:::

:::figure بدون await، ينتهي الاختبار قبل أن يعمل الـ assertion
<svg viewBox="0 0 680 220" role="img" aria-labelledby="t1">
  <title id="t1">خطّان زمنيان. في الأعلى: يعود الاختبار، ثم يُرفض الـ promise لاحقًا ولا أحد يستمع. في الأسفل: ينتظر الاختبار بـ await، فيُفشل الرفضُ الاختبار.</title>
  <text class="d-label-strong" x="20" y="40">بلا await</text>
  <path class="d-line" d="M140 60 L660 60"/>
  <circle class="d-dot" cx="170" cy="60" r="7"/>
  <text class="d-label" x="170" y="90" text-anchor="middle">يبدأ الاختبار</text>
  <rect class="d-box-success" x="270" y="44" width="140" height="32" rx="8"/>
  <text class="d-label" x="340" y="65" text-anchor="middle">ينجح الاختبار</text>
  <rect class="d-box-warn" x="490" y="44" width="160" height="32" rx="8"/>
  <text class="d-label" x="570" y="65" text-anchor="middle">يُرفض الـ promise</text>
  <text class="d-label-strong" x="20" y="150">await</text>
  <path class="d-line" d="M140 170 L660 170"/>
  <circle class="d-dot" cx="170" cy="170" r="7"/>
  <text class="d-label" x="170" y="200" text-anchor="middle">يبدأ الاختبار</text>
  <path class="d-arrow d-dashed" d="M190 170 L480 170" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="335" y="160" text-anchor="middle">ينتظر</text>
  <rect class="d-box-warn" x="490" y="154" width="160" height="32" rx="8"/>
  <text class="d-label" x="570" y="175" text-anchor="middle">يفشل الاختبار</text>
</svg>
:::

## الـ stubs: متعاونون تتحكّم فيهم

تتحدّث `saveExpense` إلى `api`. في الاختبار لا تريد خادمًا حقيقيًا؛ بل تريد كائنًا تفعل دالة `post` فيه ما يحتاجه هذا الاختبار بالذات. هذا الكائن هو **الـ stub** (بديل ثابت الاستجابة)، ولا تحتاج إلى مكتبة لكتابته:

```js
// Fails once with a retryable error, then succeeds; counts its calls.
function flakyApi() {
  let calls = 0;
  return {
    get calls() { return calls; },
    async post() {
      calls += 1;
      if (calls === 1) throw Object.assign(new Error('Timed out'), { retryable: true });
      return { id: 'e2' };
    },
  };
}

test('retries once after a retryable error', async () => {
  const api = flakyApi();

  await expect(saveExpense({ description: 'Taxi', amountCents: 1800 }, api)).resolves.toBe('e2');
  expect(api.calls).toBe(2);
});
```

تمرير `api` كمعامل هو ما يجعل هذا سهلًا. الكود الذي يستورد عميلًا عامًّا في أعماقه أصعب اختبارًا بكثير؛ وستتعرّف إلى أدوات ذلك (وثمنها) في الدرس القادم.

## اختبر كل فرع من فروع معالجة الأخطاء

لمعالجة الأخطاء فروع أكثر من المسار السعيد، وكل فرع منها قرار اتّخذه شخص ما. بالنسبة إلى `saveExpense`:

| الموقف | المتوقّع |
|---|---|
| ينجح الـ API | يُحلّ بالـ id، باستدعاء واحد |
| خطأ قابل لإعادة المحاولة، ثم نجاح | يُحلّ بالـ id، باستدعاءين |
| خطأ غير قابل لإعادة المحاولة | يُرفض بـ **ذلك** الخطأ، باستدعاء واحد |
| مدخل غير صالح | يُرفض برسالة تحقّق، بلا أي استدعاء |

الصف الثالث هو الذي يتخطّاه الناس، وهو يخبّئ خطأين شائعين: `catch` تبتلع الخطأ وتعيد `null` (فيظنّ المستدعون أن الحفظ نجح)، و`catch` تعيد المحاولة مع كل شيء (فتُحصَّل دفعة مرفوضة مرتين). الرفض وحده لا يستطيع كشف الخطأ الثاني، لأن إعادة المحاولة تفشل هي الأخرى. أما **عدّ الاستدعاءات** فيستطيع.

لاحظ الصف الأخير أيضًا: المدخل غير الصالح يجب ألا يُحدث **أي** استدعاء. هذا وعد يتعلّق بالآثار الجانبية، وهو مهم. النسخة التي تتحقّق *بعد* الإرسال سترفض بالرسالة الصحيحة رغم ذلك، فلا يثبت أن المصروف السيئ لم يصل إلى الخادم سوى عدد الاستدعاءات.

:::tip حالات الرفض غير المعالَجة تُفشل التشغيل
إن بدأ الكود الخاضع للاختبار promise يُرفض ولم يعالجه أحد، تبلّغ Vitest عنه كخطأ غير معالَج وتعلّم التشغيل كله بأنه فاشل، حتى لو نجح كل اختبار. تعامل مع تلك الرسالة كتقرير خطأ حقيقي: في مكان ما ينقص promise ما `await` أو `catch`.
:::

## المهل الزمنية (timeouts)

إن لم يستقرّ promise أبدًا (stub نسي أن يُحلّ، أو `await` مفقود داخل حلقة)، يعلق الاختبار حتى تنتهي مهلة Vitest، وهي خمس ثوانٍ افتراضيًا، ثم يفشل بخطأ انتهاء المهلة. مرّر معاملًا ثالثًا إلى `test` لحالة أبطأ، أو اضبط `testTimeout` في الإعدادات، لكن تعامل مع الـ unit test البطيء كعلامة على مشكلة: على الأرجح يتسرّب شيء حقيقي إلى الاختبار.

في التمرين تختبر الصفوف الأربعة في ذلك الجدول وتلتقط أربعة أخطاء واقعية، منها خطأ التحصيل المزدوج. ويستبدل الدرس القادم الـ stubs المكتوبة باليد بـ `vi.fn`.
