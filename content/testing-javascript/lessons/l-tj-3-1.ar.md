---
summary: تجد العناصر في اختبارات الـ DOM بالطريقة التي يجدها بها المستخدمون والتقنيات المساعدة، باستخدام استعلامات Testing Library بالدور والتسمية والنص، وفق ترتيب الأولوية الموصى به.
takeaways:
  - استعلم بما يدركه المستخدمون (الدور والاسم القابل للوصول، والتسمية، والنص الظاهر)، لا بأصناف CSS أو بنية الـ DOM، كي لا تنكسر الاختبارات حين يتغيّر التصميم.
  - "ترتيب الأولوية هو: `getByRole`، ثم `getByLabelText` و`getByPlaceholderText` و`getByText` و`getByDisplayValue`، ثم النص البديل والعنوان، و`getByTestId` في الأخير."
  - "يرمي `getBy` خطأً حين يجد صفر تطابقات أو عدة تطابقات، ويعيد `queryBy` القيمة `null` (استخدمه لتأكيد الغياب)، وينتظر `findBy` ظهور العنصر."
  - إن لم يجد استعلام الدور عنصرك، فغالبًا ما تكون البنية غير قابلة للوصول بعد؛ أصلح البنية بدل الانتقال إلى test id.
further:
  - title: Testing Library — About Queries
    url: https://testing-library.com/docs/queries/about
  - title: Testing Library — ByRole
    url: https://testing-library.com/docs/queries/byrole
  - title: MDN — ARIA roles
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles
quiz:
  - q: 'يُعرض زر "Settle up" هكذا: `<button class="btn btn-primary" data-testid="settle">Settle up</button>`. أيّ query يجب أن يستخدمه الاختبار؟'
    options:
      - text: "`container.querySelector('.btn-primary')`"
        why: أسماء الأصناف قرارات تنسيق؛ وإعادة تسميتها أثناء إعادة التصميم ستكسر الاختبار رغم أن الزر ما زال يعمل.
      - text: "`screen.getByTestId('settle')`"
        why: يعمل ويصمد أمام تغيير التنسيق، لكنه الملاذ الأخير في قائمة الأولوية لأن المستخدمين لا يرون الـ test ids، فلا يثبت شيئًا عن إمكانية الوصول.
      - text: "`screen.getByRole('button', { name: 'Settle up' })`"
        why: صحيح. يجد العنصر بالطريقة التي يجده بها مستخدم قارئ الشاشة، ويفشل إن فقد الزر دوره أو اسمه القابل للوصول.
    answer: 2
  - q: تريد تأكيد أن رسالة الحالة الفارغة اختفت بعد إضافة مصروف. أيّ query يناسب؟
    options:
      - text: "`expect(screen.queryByText('No expenses yet')).toBeNull()`"
        why: 'صحيح. يعيد `queryBy` القيمة `null` حين لا يوجد تطابق، وهذا بالضبط ما تريد تأكيده.'
      - text: "`expect(screen.getByText('No expenses yet')).toBeNull()`"
        why: "يرمي `getBy` خطأً حين لا يوجد تطابق، فيتعطّل الاختبار قبل أن يعمل `toBeNull`؛ ولا يمكن أن ينجح أبدًا."
      - text: "`expect(screen.findByText('No expenses yet')).toBeNull()`"
        why: "يعيد `findBy` وعدًا (promise) لا يكون `null` أبدًا، وينتظر ظهور العنصر، وهذا عكس ما تريده."
    answer: 0
  - q: 'يفشل `screen.getByRole(''textbox'', { name: ''Amount'' })` بالرسالة "Unable to find an accessible element with the role textbox and name Amount". تعرض الصفحة كلمة Amount بجوار حقل الإدخال. ما الإصلاح الأرجح؟'
    options:
      - text: 'أضف `data-testid="amount"` واستعلم بـ `getByTestId`.'
        why: هذا يجعل الاختبار ينجح لكنه يترك المشكلة الحقيقية؛ فمستخدمو قارئ الشاشة ما زالوا يسمعون حقلًا بلا تسمية.
      - text: 'اربط النص بحقل الإدخال باستخدام `<label>` (بلفّه حوله أو بـ `for`/`id`).'
        why: صحيح. النص الذي يجاور الحقل فحسب ليس تسمية. وبمجرد ربطه، يحصل الحقل على اسم قابل للوصول فيجده الـ query، ويجده مستخدموك كذلك.
      - text: 'استخدم `getByText(''Amount'')` ثم اقرأ `.nextSibling`.'
        why: التنقّل بين العناصر المتجاورة يربط الاختبار ببنية الـ DOM بالضبط، ويبقى الحقل بلا تسمية.
    answer: 1
  - q: أيّ زوج من الاستعلامات هو الأقرب إلى الطريقة التي يجد بها مستخدم مبصر يستعمل الفأرة ومستخدم قارئ الشاشة قائمةَ الأرصدة؟
    options:
      - text: "`document.querySelector('ul')` و`.children`"
        why: هذان يتبعان بنية الـ DOM؛ وإضافة غلاف أو قائمة ثانية ستكسر الاختبار أو تربكه.
      - text: "`getByTestId('balances')` و`getAllByTestId('row')`"
        why: الـ test ids غير مرئية للمستخدمين، وهي الملاذ الأخير في قائمة الأولوية.
      - text: "`getByRole('list', { name: 'Balances' })` و`within(list).getAllByRole('listitem')`"
        why: 'صحيح. دور القائمة وتسميتها هما ما تعلنه التقنيات المساعدة، و`within` يحصر استعلام العناصر داخل تلك القائمة.'
    answer: 2
---

إليك اختبارًا وجدته في قاعدة كود العام الماضي: `document.querySelector('.card > div:nth-child(2) span.amount-red')`. انكسر حين غيّر مصمّم لون المبالغ السالبة. لم ينكسر شيء مما يراه المستخدم، باستثناء اللون، الذي لم يختبره أحد أصلًا. كان الاختبار مرتبطًا بشكل الـ DOM وبالـ CSS، لا بما *تقوله* الصفحة.

## المبدأ الموجّه

فكرة Testing Library الجوهرية تتّسع لها جملة واحدة: *كلما أشبهت اختباراتك الطريقة التي يُستخدم بها برنامجك، زادت الثقة التي تمنحك إياها.* لا يرى المستخدمون أسماء الأصناف ولا `nth-child`. بل يرون زرًّا عنوانه "Add expense"، وحقلًا تسميته "Amount"، وقائمة أرصدة. ويحصل مستخدمو قارئ الشاشة على هذه المعلومات بالضبط عبر **شجرة إمكانية الوصول** (accessibility tree): دور كل عنصر (button وlist وtextbox) واسمه القابل للوصول (تسميته أو نصّه).

لذا تجد استعلامات Testing Library العناصر بالدور والتسمية والنص. والاختبار الذي يجد زر "Settle up" بدوره واسمه يظلّ ينجح مع أي إعادة تصميم، ويفشل في اليوم الذي يتوقّف فيه الزر عن أن يكون متاحًا لمستخدمي لوحة المفاتيح وقارئ الشاشة. وهذا خطأ يستحق الالتقاط.

## ترتيب الأولوية

:::figure أولوية الاستعلامات: ابدأ من الأعلى، ولا تنزل إلا عند الضرورة
<svg viewBox="0 0 640 250" role="img" aria-labelledby="t1">
  <title id="t1">ثلاث طبقات مكدّسة: متاح للجميع (ByRole وByLabelText وByPlaceholderText وByText وByDisplayValue)، ودلالي (ByAltText وByTitle)، والـ test ids في الأخير.</title>
  <rect class="d-box-success" x="20" y="20" width="600" height="80" rx="12"/>
  <text class="d-label-strong" x="40" y="50">1. متاح للجميع</text>
  <text class="d-code" x="40" y="80">ByRole · ByLabelText · ByPlaceholderText · ByText · ByDisplayValue</text>
  <rect class="d-box-accent" x="20" y="115" width="600" height="56" rx="12"/>
  <text class="d-label-strong" x="40" y="148">2. دلالي</text>
  <text class="d-code" x="220" y="148">ByAltText · ByTitle</text>
  <rect class="d-box-warn" x="20" y="186" width="600" height="50" rx="12"/>
  <text class="d-label-strong" x="40" y="216">3. الملاذ الأخير</text>
  <text class="d-code" x="220" y="216">ByTestId</text>
</svg>
:::

يغطّي `getByRole` مع الخيار `name` معظم الحالات: الأزرار، والروابط، والعناوين، وحقول النماذج، والقوائم، والحوارات، والتنبيهات. و`getByLabelText` هو الخيار الطبيعي لحقول النماذج. ويجد `getByText` المحتوى غير التفاعلي مثل رسالة أو سطر رصيد. أما الـ test ids فللعناصر التي لا دور لها ولا نص، مثل لوحة رسم بياني (canvas)، وهي لا تثبت شيئًا عن إمكانية الوصول.

## اختبار DOM باستخدام Testing Library

يعرض Splitwise-lite الأرصدة كقائمة بسيطة. مع ضبط البيئة على `jsdom` وتثبيت `@testing-library/dom`، يبدو الاختبار هكذا:

```js title=src/render-balances.test.js
// @vitest-environment jsdom
import { afterEach, test, expect } from 'vitest';
import { screen, within } from '@testing-library/dom';
import { renderBalances } from './render-balances.js';

afterEach(() => {
  document.body.innerHTML = '';
});

test('lists each person with what they owe or are owed', () => {
  renderBalances(document.body, { Ben: -500, Ana: 1200, Cai: 0 });

  const list = screen.getByRole('list', { name: 'Balances' });
  const items = within(list).getAllByRole('listitem');

  expect(items.map((item) => item.textContent)).toEqual([
    'Ana is owed $12.00',
    'Ben owes $5.00',
    'Cai is settled up',
  ]);
});

test('shows an empty state instead of an empty list', () => {
  renderBalances(document.body, {});

  expect(screen.getByText('No expenses yet')).toBeTruthy();
  expect(screen.queryByRole('list')).toBeNull();
});
```

يستعلم `screen` في المستند كله. ويحصر `within(element)` الاستعلامات في جزء منه، وهذا مهم بمجرد أن تحتوي الصفحة على قائمتين. وتنظيف `document.body` بعد كل اختبار يمنع الـ DOM الخاص باختبار من التسرّب إلى الاختبار التالي. (تستطيع React Testing Library أن تتولّى هذا التنظيف عنك؛ ويوضّح الدرس الرابع من هذا القسم متى يحدث ذلك.)

## getBy وqueryBy وfindBy

لكل استعلام ثلاث نكهات، إضافة إلى نسخة `All` من كل منها:

| البادئة | لا يوجد تطابق | عدة تطابقات | استخدمها لـ |
|---|---|---|---|
| `getBy` | يرمي خطأً | يرمي خطأً | عناصر يجب أن تكون موجودة |
| `queryBy` | يعيد `null` | يرمي خطأً | تأكيد أن شيئًا ما **غائب** |
| `findBy` | يُرفض بعد الانتظار | يُرفض | عناصر تظهر **لاحقًا** |

رمي `getBy` خطأً عند وجود عدة تطابقات ميزة لا عيب: إن كان استعلامك ملتبسًا، يخبرك الاختبار بدل أن يختار الأول بصمت.

:::tip assertions أجمل مع jest-dom
أضف `import '@testing-library/jest-dom/vitest'` إلى ملف إعداد، فتحصل على matchers خاصة بالـ DOM مثل `toBeInTheDocument()` و`toHaveTextContent()` و`toBeVisible()` و`toBeDisabled()` و`toHaveAccessibleName()`. رسائل الفشل فيها تطبع الجزء المعنيّ من الـ DOM، وهذا أفضل بكثير من قراءة `expected null not to be null`.
:::

:::mistake الانتقال إلى test id حين يفشل استعلام الدور
حين لا يجد `getByRole('textbox', { name: 'Amount' })` حقل الإدخال، يكون السبب المعتاد أن الحقل فعلًا بلا اسم قابل للوصول: كلمة "Amount" تجاوره لكنها ليست `<label>`. إضافة test id تجعل الاختبار ينجح وتترك النموذج معطّلًا لمستخدمي قارئ الشاشة. أصلح البنية؛ فالاختبار كان محقًّا.
:::

## حين لا يجد الـ query عنصرك

تفشل استعلامات الدور بصوت عالٍ، وفشلها مفيد. حين لا يجد `getByRole('button', { name: 'Settle up' })` شيئًا، تطبع Testing Library كل دور متاح داخل الحاوية مع الأسماء التي حسبتها، فترى أن اسم الزر في الحقيقة "Settle up all debts"، أو أن الـ `div` القابل للنقر لديك بلا دور أصلًا. استدعِ `screen.debug()` لطباعة الـ DOM الحالي حين تحتاج إلى سياق أكثر. تأتي الأسماء المتاحة من بضعة مصادر، بهذا الترتيب تقريبًا: `aria-labelledby`، ثم `aria-label`، ثم `<label>` مرتبط، ثم نص العنصر نفسه (أو `alt` للصور). وإن لم يعطِ أيّ منها الاسم الذي تتوقّعه، فمستخدم قارئ الشاشة يسمع الشيء المربك نفسه الذي يراه اختبارك.

## في ساحة التجربة

لا توجد حزم npm في ساحة التجربة، لذا تبدأ تمارين هذا القسم بنحو أربعين سطرًا من البدائل: `getByRole` و`getAllByRole` و`queryByRole` و`getByText` و`queryByText`، بالأسماء والسلوك نفسه في الحالات التي تحتاجها. ومثل الدوال المصدَّرة مباشرة من `@testing-library/dom` (لا عبر `screen`)، تأخذ هذه البدائل الحاوية معاملًا أول: `getByRole(container, 'list')`. تقرأ الدور من الوسم (أو من خاصية `role`) والاسم من `aria-label` أو `<label>` أو النص. أما Testing Library الحقيقية فتحسب شجرة إمكانية الوصول بشمول أكبر بكثير، لذا ثبّتها في مشاريعك.

الدرس القادم: النقر والكتابة كما يفعل المستخدم.
