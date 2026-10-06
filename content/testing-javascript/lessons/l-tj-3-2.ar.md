---
summary: تقود النماذج والأزرار في الاختبارات كما يفعل الإنسان، وتختار user-event بدل fireEvent، وتؤكّد ما يراه المستخدم وما يبلّغ عنه الكود.
takeaways:
  - "يُطلق `fireEvent` حدث DOM واحدًا؛ أما `user-event` فيؤدّي التسلسل الكامل الذي يُحدثه إنسان حقيقي (المؤشّر، والتركيز، وkeydown، وinput، وkeyup، والنقر)."
  - "أنشئ جلسة بـ `userEvent.setup()` وضع `await` قبل كل تفاعل، لأن دوال user-event غير متزامنة."
  - "اختبر النموذج من خلال نتائجه: معاملات الدالة الراجعة (callback)، والخطأ الذي سيقرؤه المستخدم، وحالة الحقول بعد ذلك."
  - اختبر المسار غير الصالح بالعناية نفسها التي تختبر بها الصالح؛ "لم يحدث شيء" سلوك يجب تأكيده.
further:
  - title: Testing Library — user-event introduction
    url: https://testing-library.com/docs/user-event/intro
  - title: Testing Library — Firing events
    url: https://testing-library.com/docs/dom-testing-library/api-events
  - title: Testing Library — user-event setup
    url: https://testing-library.com/docs/user-event/setup
quiz:
  - q: "ينسّق حقل المبلغ المدخلات عند كل `keydown`. يستخدم اختبار `fireEvent.change(input, { target: { value: '45.50' } })`، فلا يعمل كود التنسيق أبدًا. لماذا؟"
    options:
      - text: "يضبط `fireEvent.change` القيمة ويُطلق حدث `change` واحدًا، دون أي أحداث مفاتيح."
        why: 'صحيح. لم يضغط شيء أي مفتاح، فلا تعمل معالِجات `keydown` أبدًا. أما `await user.type(input, ''45.50'')` فيُنتج أحداث مفاتيح لكل حرف.'
      - text: "`fireEvent` لا يعمل إلا مع مكوّنات React."
        why: "يأتي `fireEvent` من `@testing-library/dom` ويعمل مع أي DOM؛ المشكلة في نوع الأحداث التي يرسلها."
      - text: أحداث change لا تنتشر صعودًا (bubble) في jsdom.
        why: 'الانتشار ليس المشكلة؛ فمعالِج `keydown` لا ينتظر حدث change أصلًا.'
    answer: 0
  - q: "ما المشكلة في هذا الاختبار؟\n```js\ntest('adds the expense', () => {\n  const user = userEvent.setup();\n  mountExpenseForm(document.body, onAdd);\n  user.type(screen.getByRole('textbox', { name: 'Amount' }), '12');\n  user.click(screen.getByRole('button', { name: 'Add expense' }));\n  expect(onAdd).toHaveBeenCalled();\n});\n```"
    options:
      - text: "يجب استدعاء `userEvent.setup()` داخل `beforeEach`."
        why: 'استدعاء `setup()` في بداية كل اختبار هو النمط الموصى به؛ ولا حاجة إلى hook.'
      - text: "لا يستطيع `getByRole` إيجاد حقول الإدخال؛ يجب استخدام `getByTestId`."
        why: 'لحقول الإدخال الدور `textbox`، ومع وجود تسمية يصبح لها اسم قابل للوصول، فـ `getByRole` هو الـ query الصحيح.'
      - text: التفاعلات بلا await، فيعمل الـ assertion قبل انتهاء الكتابة والنقر.
        why: 'صحيح. دوال user-event تعيد promises؛ اجعل الاختبار `async` وضع `await` قبل كل استدعاء.'
    answer: 2
  - q: كتابة `'abc'` في حقل المبلغ ثم النقر على "Add expense" يجب أن يُظهر خطأً. أيّ مجموعة assertions تختبر هذا المسار على أفضل وجه؟
    options:
      - text: التنبيه ظاهر.
        why: بداية جيدة، لكن النسخة التي تُظهر التنبيه *وتستدعي* `onAdd` بقيمة عبثية ستنجح أيضًا.
      - text: 'التنبيه يعرض الرسالة، و`onAdd` لم تُستدعَ، والنص المكتوب ما زال في الحقل.'
        why: "صحيح. كل assertion يحمي من خطأ مختلف: الفشل الصامت، وحفظ مصروف سيئ، ومسح ما كتبه المستخدم."
      - text: "`onAdd` لم تُستدعَ."
        why: النسخة التي تتجاهل النقر بصمت تنجح في هذا أيضًا؛ وسيبقى المستخدم يخمّن ما حدث.
    answer: 1
---

نموذج المصروفات هو المكان الذي يلتقي فيه Splitwise-lite بالناس الحقيقيين، والناس الحقيقيون يفعلون أشياء فوضوية: يتنقّلون بين الحقول بمفتاح Tab، ويلصقون " 45.50 "، وينقرون "Add" وحقل المبلغ ما زال فارغًا، وينقرون نقرًا مزدوجًا. لا يستطيع unit test لـ `parseAmount` أن يخبرك إن كان النموذج يربط كل ذلك بشكل صحيح. أما الاختبار الذي يستخدم النموذج كما يستخدمه إنسان فيستطيع.

## fireEvent مقابل user-event

تأتي Testing Library بطريقتين للتفاعل.

**`fireEvent`** (من `@testing-library/dom`) يُطلق حدث DOM واحدًا بالضبط. `fireEvent.click(button)` يرسل `click`. و`fireEvent.change(input, { target: { value: '45.50' } })` يضبط القيمة ويرسل `change`. إنه سريع ودقيق، لكنه ليس ما يحدث حين ينقر إنسان أو يكتب.

**`user-event`** (من `@testing-library/user-event`) يحاكي التفاعل نفسه. `user.click(button)` يُنتج أحداث المؤشّر والفأرة، وينقل التركيز، ثم يُطلق `click`، ويرفض النقر على زر معطّل أو مخفيّ تحت `pointer-events: none`، تمامًا كالمتصفّح الحقيقي. و`user.type(input, '45.50')` ينقر الحقل، ثم يرسل لكل حرف `keydown` و`keypress` و`input` و`keyup`.

:::figure حدث واحد مقابل التسلسل الذي يُحدثه إنسان
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">يرسل fireEvent.click حدث click فقط. أما user.click فيرسل pointerdown وmousedown وfocus وpointerup وmouseup ثم click.</title>
  <text class="d-code" x="20" y="48">fireEvent.click</text>
  <rect class="d-box-warn" x="200" y="26" width="90" height="34" rx="8"/>
  <text class="d-code" x="245" y="48" text-anchor="middle">click</text>
  <text class="d-code" x="20" y="138">user.click</text>
  <rect class="d-box-accent" x="140" y="116" width="100" height="34" rx="8"/>
  <text class="d-code" x="190" y="138" text-anchor="middle">pointerdown</text>
  <rect class="d-box-accent" x="250" y="116" width="90" height="34" rx="8"/>
  <text class="d-code" x="295" y="138" text-anchor="middle">mousedown</text>
  <rect class="d-box-primary" x="350" y="116" width="60" height="34" rx="8"/>
  <text class="d-code" x="380" y="138" text-anchor="middle">focus</text>
  <rect class="d-box-accent" x="420" y="116" width="80" height="34" rx="8"/>
  <text class="d-code" x="460" y="138" text-anchor="middle">pointerup</text>
  <rect class="d-box-accent" x="510" y="116" width="74" height="34" rx="8"/>
  <text class="d-code" x="547" y="138" text-anchor="middle">mouseup</text>
  <rect class="d-box-success" x="594" y="116" width="70" height="34" rx="8"/>
  <text class="d-code" x="629" y="138" text-anchor="middle">click</text>
  <text class="d-label-muted" x="340" y="190" text-anchor="middle">تعمل معالِجات أيّ من هذه الأحداث، كما في المتصفّح</text>
</svg>
:::

اجعل user-event خيارك الافتراضي. ولا تلجأ إلى `fireEvent` إلا مع أحداث لا يحاكيها user-event، مثل حدث مخصّص أو `scroll`.

## اختبار نموذج المصروفات

في النموذج حقلان لهما تسميتان، وزر "Add expense"، ومنطقة للتنبيه. إليك المسار السعيد، مكتوبًا بالطريقة التي ستصفه بها لزميل:

```js title=src/expense-form.test.js
// @vitest-environment jsdom
import { afterEach, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { mountExpenseForm } from './expense-form.js';

afterEach(() => {
  document.body.innerHTML = '';
});

test('adds a valid expense in cents and clears the form', async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  mountExpenseForm(document.body, onAdd);

  await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Dinner');
  await user.type(screen.getByRole('textbox', { name: 'Amount' }), '45.50');
  await user.click(screen.getByRole('button', { name: 'Add expense' }));

  expect(onAdd).toHaveBeenCalledWith({ description: 'Dinner', amountCents: 4550 });
  expect(screen.getByRole('textbox', { name: 'Amount' }).value).toBe('');
});
```

لاحظ ثلاثة أشياء. يأتي `userEvent.setup()` أولًا ويعطيك جلسة `user` تتتبّع حالة لوحة المفاتيح والمؤشّر عبر الاستدعاءات. و**كل تفاعل يُنتظَر بـ await**: فدوال user-event غير متزامنة، وبدون `await` تعمل الـ assertions قبل أن تنتهي الكتابة. والـ assertions تتعلّق **بالنتائج**: ما استلمته `onAdd` (العقد مع بقية التطبيق) وما يراه المستخدم الآن.

ومستخدمو لوحة المفاتيح مهمّون أيضًا. ينقل `await user.tab()` التركيز كما يفعل مفتاح Tab، ويضغط `await user.keyboard('{Enter}')` مفتاح Enter، فتستطيع اختبار أن النموذج يعمل دون فأرة.

### ما لن يفعله user-event من أجلك

يحاكي user-event السلوك الافتراضي للمتصفّح في التفاعل، لكنه لا يرى تخطيط الـ CSS لديك. لن يلاحظ أن نافذة منبثقة تغطّي الزر بصريًا، أو أن زر "Add expense" خارج الشاشة على الهاتف. ليس في jsdom محرّك تخطيط، فكل الأحجام والمواقع أصفار. هذه مهام اختبارات الـ end-to-end في متصفّح حقيقي، وهذا ما يتّجه إليه القسم 4. أما في اختبارات الوحدات والمكوّنات، فيعطيك user-event *تسلسل الأحداث* الصحيح و*سلوك التركيز* الصحيح، وهذا يغطّي الغالبية العظمى من أخطاء النماذج.

## المسار غير السعيد هو معظم العمل

تعيش معظم أخطاء النماذج في معالجة الأخطاء، فأعطها على الأقل عدد الاختبارات نفسه. كتابة `abc` كمبلغ ثم النقر على "Add expense" يجب أن:

1. يعرض السبب في عنصر له `role="alert"`، وهو ما تعلنه قارئات الشاشة؛
2. **لا** يستدعي `onAdd`؛
3. **يُبقي** ما كتبه المستخدم، كي يصلح حرفًا واحدًا بدل إعادة الكتابة.

```js
test('explains an invalid amount and keeps the input', async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  mountExpenseForm(document.body, onAdd);

  await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Taxi');
  await user.type(screen.getByRole('textbox', { name: 'Amount' }), 'abc');
  await user.click(screen.getByRole('button', { name: 'Add expense' }));

  expect(screen.getByRole('alert').textContent).toMatch('Not a valid amount');
  expect(onAdd).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Amount' }).value).toBe('abc');
});
```

كل assertion يحمي من خطأ مختلف. احذف فحص التنبيه، فينجح الفشل الصامت. احذف `not.toHaveBeenCalled`، فينجح نموذج يحفظ قيمًا عبثية. احذف الأخير، فينجح نموذج يمسح ما كتبه المستخدم.

:::mistake تأكيد التفاصيل الداخلية للمكوّن بعد التفاعل
بعد النقر، يغريك أن تفحص متغيّرًا خاصًّا، أو صنف CSS مثل `.has-error`، أو عدد مرات تشغيل دالة `validate` داخلية. لا شيء من ذلك يدركه المستخدم، وكلها تتغيّر أثناء إعادة الهيكلة. أكّد الرسالة الظاهرة، وقيم الحقول، والدالة الراجعة؛ هذا هو العقد.
:::

## في ساحة التجربة

لا توجد حزمة user-event في البيئة المعزولة، لذا يتضمّن الكود المبدئي للتمرين دالتين مساعدتين صغيرتين: `typeInto(element, text)`، التي تضع التركيز على الحقل وترسل أحداث المفاتيح والإدخال لكل حرف، و`clickOn(element)`، التي ترسل تسلسل المؤشّر والفأرة، وتضع التركيز وتنقر (ولا تفعل شيئًا مع زر معطّل). كلتاهما متزامنة، فلا تضع قبلهما `await`. وتمنع البيئة المعزولة أيضًا الإرسال الحقيقي للنماذج، لذا يستمع العنصر إلى نقر الزر بدل حدث `submit`؛ أما في تطبيقك، فـ `<form>` حقيقي مع معالِج submit أفضل، لأنه يعطيك الإرسال بمفتاح Enter دون جهد.

بعد ذلك، أصعب جزء في اختبار الواجهة: الأشياء التي تحدث لاحقًا.
