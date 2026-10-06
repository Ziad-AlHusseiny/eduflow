---
summary: تختبر مكوّنات React من خلال الـ props والمخرجات المعروضة وتفاعل المستخدم باستخدام React Testing Library، وتستبدل الشبكة عند حدودها بـ fetch محقون أو بـ MSW.
takeaways:
  - "يركّب `render` في React Testing Library المكوّن داخل مستند jsdom؛ وتستعلم عنه وتتفاعل معه تمامًا كما تفعل مع الـ DOM العادي."
  - اختبر الـ props بالـ render بقيم مختلفة (أو بـ `rerender`)، واختبر الـ state بالتفاعل؛ ولا تمدّ يدك إلى الـ state أو الـ hooks مباشرة أبدًا.
  - استبدل الشبكة عند طرفها، إمّا بحقن `fetch` أو باعتراض الطلبات عبر MSW، كي يظلّ كود تشكيل البيانات الخاص بك يعمل في الاختبار.
  - "أكّد الطلب الذي أرسلته (الـ URL والطريقة)، وأكّد أيضًا ما تفعله الواجهة أو الدالة بالاستجابة، بما في ذلك رموز حالة الخطأ."
further:
  - title: Testing Library — React Testing Library
    url: https://testing-library.com/docs/react-testing-library/intro
  - title: Testing Library — React Testing Library API
    url: https://testing-library.com/docs/react-testing-library/api
  - title: MDN — Response
    url: https://developer.mozilla.org/en-US/docs/Web/API/Response
  - title: Vitest — Mocking requests
    url: https://vitest.dev/guide/mocking/requests
quiz:
  - q: 'كيف يجب أن يتحقّق الاختبار من أن `ExpenseList` تُرشّح النتائج أثناء الكتابة في مربّع Search؟'
    options:
      - text: اكتب في حقل Search باستخدام user-event، وأكّد أيّ عناصر القائمة ظاهرة على الشاشة.
        why: صحيح. هذا هو السلوك الذي يراه المستخدم، ويظلّ الاختبار ينجح إن نقلت حالة الترشيح إلى reducer أو إلى معامل في الـ URL.
      - text: 'اقرأ الـ state المسمّى `query` في المكوّن بعد الكتابة، وتحقّق من أنه يساوي النص المكتوب.'
        why: الـ state تفصيل داخلي؛ قد يخزّن المكوّن النص الصحيح ويعرض مع ذلك القائمة الخاطئة.
      - text: 'استدعِ الدالة `setQuery` مباشرة والتقط snapshot للنتيجة.'
        why: لا تستطيع الاختبارات (ولا يجب أن تستطيع) الوصول إلى دوال ضبط الـ state في المكوّن؛ والـ snapshot لن يقول أيّ العناصر يجب أن تكون ظاهرة.
    answer: 0
  - q: "لماذا تفضّل فرق كثيرة MSW على `vi.mock('./api.js')` للمكوّنات التي تجلب البيانات؟"
    options:
      - text: يجعل MSW الطلبات إلى الخادم الحقيقي أسرع.
        why: لا يتحدّث MSW إلى الخادم الحقيقي أصلًا؛ بل يعترض الطلبات ويجيب عنها بالمعالِجات التي تكتبها.
      - text: "لا يعمل `vi.mock` في الملفات التي تعرض مكوّنات React."
        why: "يعمل `vi.mock` في أي مكان؛ المشكلة في مقدار الكود الحقيقي الذي يتخطّاه."
      - text: يعترض MSW الطلبات على مستوى الشبكة، فيظلّ الـ fetch الحقيقي وكود تشكيل البيانات لديك يعملان في الاختبار.
        why: صحيح. مع mock للوحدة، يُستبدل أي خطأ في بناء الـ URL أو تحليل الاستجابة ويختفي؛ أما مع MSW فيُختبر فعلًا.
    answer: 2
  - q: 'نسيت `loadGroup` أن تفحص `response.ok`. مع استجابة 404 يكون الـ JSON هو `{ "error": "Not found" }`، فيرمي الكود `Cannot read properties of undefined`. أيّ assertion يلتقط الفحص المفقود؟'
    options:
      - text: "`await expect(loadGroup('nope', fetchMock)).rejects.toThrow()`"
        why: 'النسخة المعطوبة تُرفض أيضًا، بخطأ `TypeError`، فينجح أي assertion يقبل أي خطأ.'
      - text: "`await expect(loadGroup('nope', fetchMock)).rejects.toThrow('HTTP 404')`"
        why: صحيح. مطابقة الرسالة تثبت أن رمز الحالة فُحص، لا أن شيئًا آخر انفجر بالمصادفة.
      - text: "`expect(fetchMock).toHaveBeenCalledTimes(1)`"
        why: كلتا النسختين تستدعيان fetch مرة واحدة بالضبط؛ الفرق فيما تفعلانه بالاستجابة.
    answer: 1
---

كل ما جاء في هذا القسم حتى الآن ينطبق على React دون تغيير، لأن React Testing Library طبقة رقيقة فوق الاستعلامات نفسها وuser-event الذي تعرفه. الجزء الجديد حقًّا هو الشبكة: مكوّنات React تحبّ جلب البيانات، والطريقة التي تزيّف بها ذلك تقرّر إن كانت اختباراتك ستلتقط أخطاءً حقيقية.

## عرض مكوّن

يأخذ المكوّن `ExpenseList` في Splitwise-lite المصروفات كـ prop، ولديه جزء واحد من الـ state (الحالة)، وهو مرشّح البحث:

```jsx title=src/ExpenseList.jsx
import { useState } from 'react';
import { formatMoney } from './money.js';

export function ExpenseList({ expenses }) {
  const [query, setQuery] = useState('');
  const visible = expenses.filter((e) =>
    e.description.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section aria-label="Expenses">
      <label>
        Search <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      {visible.length === 0 ? (
        <p>No matching expenses</p>
      ) : (
        <ul>
          {visible.map((e) => (
            <li key={e.id}>{e.description}: {formatMoney(e.amountCents)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

مع تثبيت `@testing-library/react` وضبط `environment: 'jsdom'`، تُقرأ الاختبارات مثل اختبارات الـ DOM التي كتبتها:

```jsx title=src/ExpenseList.test.jsx
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseList } from './ExpenseList.jsx';

const expenses = [
  { id: 'e1', description: 'Dinner', amountCents: 4550 },
  { id: 'e2', description: 'Taxi', amountCents: 1800 },
];

test('filters expenses as you type', async () => {
  const user = userEvent.setup();
  render(<ExpenseList expenses={expenses} />);

  await user.type(screen.getByRole('textbox', { name: 'Search' }), 'tax');

  const items = screen.getAllByRole('listitem');
  expect(items.map((li) => li.textContent)).toEqual(['Taxi: $18.00']);
});

test('shows the new expense when the prop changes', () => {
  const { rerender } = render(<ExpenseList expenses={expenses} />);

  rerender(<ExpenseList expenses={[...expenses, { id: 'e3', description: 'Museum', amountCents: 2400 }]} />);

  expect(screen.getByText('Museum: $24.00')).toBeTruthy();
});
```

تُختبر **الـ props** بالـ render بقيم مختلفة (و`rerender` للتحديثات). ويُختبر **الـ state** بالتفاعل ثم فحص النتيجة؛ لا توجد طريقة لقراءة `query` من الاختبار، وهذه ميزة. يلفّ `render` التحديثات في `act()` الخاصة بـ React نيابةً عنك، وتزيل React Testing Library المكوّنات (unmount) بعد كل اختبار حين يكون خيار `globals` في Vitest مفعّلًا (وإلا فاستدعِ `cleanup` داخل `afterEach`).

:::note المكوّنات في متصفّح حقيقي
لدى Vitest 4 أيضًا وضع متصفّح (Browser Mode) مستقر، يشغّل اختبارات المكوّنات في متصفّح حقيقي (يقوده مزوّد مثل Playwright) بدل jsdom. بدء تشغيله أبطأ، لكنه يلتقط فروقات التخطيط وواجهات المتصفّح التي لا يستطيع jsdom التقاطها. تحتفظ فرق كثيرة بـ jsdom لمعظم اختبارات المكوّنات، وتستخدم Browser Mode حيث يهمّ العرض الحقيقي.
:::

## أين تزيّف الشبكة

المكوّن الذي يحمّل مجموعة يستدعي دالة بيانات، وهي تستدعي `fetch`، الذي يمرّ عبر الشبكة. تستطيع قطع هذه السلسلة عند ثلاث نقاط:

:::figure اقطع السلسلة في أبعد نقطة ممكنة
<svg viewBox="0 0 680 210" role="img" aria-labelledby="t1">
  <title id="t1">سلسلة من المكوّن إلى loadGroup إلى fetch إلى الشبكة. يقطع vi.mock مبكرًا ويتخطّى loadGroup؛ وحقن fetch يقطع بعد loadGroup؛ ويعترض MSW عند طرف الشبكة.</title>
  <rect class="d-box" x="10" y="40" width="140" height="56" rx="10"/>
  <text class="d-label-strong" x="80" y="74" text-anchor="middle">المكوّن</text>
  <path class="d-arrow" d="M150 68 L188 68" marker-end="url(#arrow)"/>
  <rect class="d-box" x="190" y="40" width="140" height="56" rx="10"/>
  <text class="d-code" x="260" y="74" text-anchor="middle">loadGroup()</text>
  <path class="d-arrow" d="M330 68 L368 68" marker-end="url(#arrow)"/>
  <rect class="d-box" x="370" y="40" width="140" height="56" rx="10"/>
  <text class="d-code" x="440" y="74" text-anchor="middle">fetch()</text>
  <path class="d-arrow" d="M510 68 L548 68" marker-end="url(#arrow)"/>
  <rect class="d-box" x="550" y="40" width="120" height="56" rx="10"/>
  <text class="d-label-strong" x="610" y="74" text-anchor="middle">الشبكة</text>
  <path class="d-line d-dashed" d="M170 30 L170 150"/>
  <text class="d-label-muted" x="170" y="172" text-anchor="middle">vi.mock</text>
  <path class="d-line d-dashed" d="M350 30 L350 150"/>
  <text class="d-label-muted" x="350" y="172" text-anchor="middle">حقن fetch</text>
  <path class="d-line d-dashed" d="M530 30 L530 150"/>
  <text class="d-label-muted" x="530" y="172" text-anchor="middle">MSW</text>
  <text class="d-label" x="350" y="200" text-anchor="middle">قطع متأخّر = كود حقيقي مختبَر أكثر</text>
</svg>
:::

- **استبدال وحدة البيانات بـ mock** (`vi.mock('./load-group.js')`) يتخطّى بناء الـ URL، ومعالجة رمز الحالة، وتشكيل الاستجابة. وهذه بالضبط مواضع الأخطاء.
- **حقن `fetch`** (`loadGroup(id, fetchImpl)`) يشغّل كل كودك ولا يزيّف إلا وسيلة النقل. بسيط، وبلا مكتبة، وهو ما يستخدمه التمرين.
- **MSW** (Mock Service Worker) يعترض الطلبات على مستوى الشبكة في Node وفي المتصفّح. يستدعي كودك `fetch` الحقيقي دون أي تغيير:

```js title=src/test/server.js
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.get('https://api.splitwise-lite.test/groups/:id', ({ params }) =>
    HttpResponse.json({ name: `Group ${params.id}`, members: [], expenses: [] }),
  ),
);
```

في ملف إعداد، استدعِ `server.listen({ onUnhandledRequest: 'error' })` قبل كل الاختبارات، و`server.resetHandlers()` بعد كل اختبار، و`server.close()` في النهاية. ويستطيع اختبار واحد استبدال مسار ما بـ `server.use(http.get(..., () => new HttpResponse(null, { status: 404 })))` ليختبر مسار الخطأ. ويمكن للمعالِجات نفسها أن تشغّل تطبيقك أثناء التطوير وفي Storybook، فيبقى الـ API المزيّف في مكان واحد.

:::mistake تزييف المسار السعيد وحده
الـ mock الشبكي الذي يعيد دائمًا 200 مع بيانات مثالية يختبر الكود الذي كنت أقلّ قلقًا بشأنه. كل دالة بيانات تستحق اختبارًا لرمز حالة غير ناجح، ويُفضَّل أيضًا اختبار لانقطاع الشبكة (`HttpResponse.error()` في MSW، أو promise مرفوض من fetch محقون). أكّد رسالة الخطأ بعينها، كي لا يمرّ انهيار في مكان آخر على أنه معالجة صحيحة للخطأ.
:::

## ما لا تختبره في المكوّن

بعض اختبارات المكوّنات تكلّف أكثر مما تلتقط. تخطّها:

- **تفاصيل التنسيق**: هل الصنف `text-red-600`، أو هل الحشوة 12px. الانتكاسات البصرية تُلتقط بشكل أفضل باختبارات لقطات الشاشة في متصفّح حقيقي، أو بمراجعة بشرية.
- **الأجزاء الداخلية لمكتبات خارجية**: لا تحتاج إلى إثبات أن مكتبة منتقي التاريخ تفتح تقويمها. اختبر أن مكوّنك يمرّر لها القيمة الصحيحة ويتفاعل مع `onChange` الخاص بها.
- **snapshots للشجرة كاملة**: `expect(container).toMatchSnapshot()` على مكوّن كبير يفشل مع كل تغيير غير ضارّ في البنية، ويتعلّم المراجعون الضغط على "update snapshot" دون قراءة. قد يكون snapshot صغير مضمّن لقيمة منسّقة واحدة مقبولًا؛ أما snapshot من 300 سطر فضجيج.

## التأكيد على طرفي الطلب

اختبار الشبكة الجيد يفحص ما **أرسلته**، إضافة إلى ما فعلته بالإجابة. الـ URL الخاطئ خطأ حقيقي (`/group/` بدل `/groups/`)، ولا يلتقطه إلا assertion على الطلب، لأن البديل المزيّف يجيب عن أي شيء بسرور. مع fetch محقون يكون ذلك `expect(fetchMock).toHaveBeenCalledWith('https://api.splitwise-lite.test/groups/lisbon')`؛ ومع MSW، لا يطابق المعالِج إلا المسار الصحيح، و`onUnhandledRequest: 'error'` يُفشل الاختبار مع أي شيء آخر.

في التمرين تختبر `loadGroup` مع `fetch` محقون يعيد كائنات `Response` حقيقية، وتلتقط أربعة أخطاء في الطلب وتشكيل الاستجابة. وبهذا يكتمل قسم الواجهة. بعده يأتي المتصفّح الحقيقي، حيث يلتقي أخيرًا التخطيط والتوجيه (routing) والخادم الحقيقي.
