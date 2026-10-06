---
summary: تُبقي اختبارات الـ end-to-end مستقلّة باستخدام سياقات المتصفّح المعزولة في Playwright، وfixtures مخصّصة تنشئ بياناتها وتنظّفها، وحالة تسجيل دخول محفوظة، وتوجيه انتقائي لطلبات الشبكة.
takeaways:
  - يحصل كل اختبار في Playwright على سياق متصفّح جديد (له ملفات تعريف الارتباط والتخزين والذاكرة المؤقّتة الخاصة به)، فتستطيع الاختبارات أن تعمل بالتوازي وبأي ترتيب.
  - "الـ fixture (تجهيزة الاختبار) التي تُنشأ بـ `test.extend` تُعدّ شيئًا ما، وتسلّمه للاختبار عبر `use()`، ثم تهدمه بعد ذلك، وذلك للاختبارات التي تطلبها فقط."
  - يجب أن ينشئ كل اختبار البيانات التي يحتاجها (ويُفضَّل عبر الـ API) بدل الاعتماد على بيانات أولية مشتركة أو على أن اختبارًا آخر عمل قبله.
  - سجّل الدخول مرة واحدة في setup project، واحفظ حالة التخزين، وأعد استخدامها، بدل التنقّل في نموذج تسجيل الدخول في كل اختبار.
  - "استخدم `page.route` لمحاكاة استجابات الخادم النادرة، والـ backend الحقيقي للمسارات السعيدة."
further:
  - title: Playwright — Fixtures
    url: https://playwright.dev/docs/test-fixtures
  - title: Playwright — Isolation
    url: https://playwright.dev/docs/browser-contexts
  - title: Playwright — Authentication
    url: https://playwright.dev/docs/auth
  - title: Playwright — Mock APIs
    url: https://playwright.dev/docs/mock
quiz:
  - q: 'ينشئ الاختبار A مجموعة اسمها "Lisbon trip"؛ ويفتح الاختبار B المجموعة "Lisbon trip" ويفحص أرصدتها. ينجح B محليًا ويفشل في CI. ما أصل المشكلة؟'
    options:
      - text: أجهزة CI أبطأ، فيحتاج B إلى مهلة أطول.
        why: السرعة ليست المشكلة؛ B يعتمد على بيانات لا توجد إلا إن عمل A أولًا، على الخادم نفسه، قبله.
      - text: يعتمد B على بيانات A. ومع العمّال المتوازيين أو بترتيب مختلف، لا تكون المجموعة موجودة بعد حين يعمل B.
        why: صحيح. يجب أن ينشئ كل اختبار مجموعته الخاصة، مثلًا عبر fixture تستدعي الـ API وتنظّف بعد الانتهاء.
      - text: 'يجب أن يستخدم B الدالة `test.describe.serial` كي يعمل دائمًا بعد A.'
        why: الوضع التسلسلي يجعل الاعتماد رسميًا والمجموعة أبطأ؛ ثم إن فشلًا واحدًا في A يتخطّى كل ما بعده. أزل الاعتماد بدلًا من ذلك.
    answer: 1
  - q: 'في الـ fixture، ماذا يفعل الكود الواقع بعد `await use(group)`؟'
    options:
      - text: يعمل قبل الاختبار، لتجهيز البيانات.
        why: 'التهيئة تعمل قبل `use`؛ أما السطر الذي بعده فينتظر حتى ينتهي الاختبار.'
      - text: لا شيء؛ الكود بعد `use` لا يُبلغ أبدًا.
        why: "يُحلّ `use` حين ينتهي الاختبار، فيعمل الكود الذي بعده، وهكذا تنظّف الـ fixtures."
      - text: يعمل بعد انتهاء الاختبار، حتى لو فشل الاختبار، وهذا ما يجعله مكان التنظيف.
        why: "صحيح. التهيئة، ثم `use(value)`، ثم الهدم: دالة واحدة تملك دورة حياة المورد كلها."
    answer: 2
  - q: 'ما أفضل استخدام لـ `page.route` في مجموعة end-to-end؟'
    options:
      - text: محاكاة استجابة نادرة من الخادم، مثل 500 عند الحفظ، لاختبار رسالة الخطأ.
        why: صحيح. الاستجابات الصعبة الإحداث هي حيث يتألّق التوجيه؛ ويجب أن تظلّ المسارات السعيدة تصل إلى الـ backend الحقيقي.
      - text: استبدال كل استدعاء API بـ mock كي لا تعتمد الاختبارات على الـ backend أبدًا.
        why: عندها لم يعد end-to-end؛ ستكون تعيد اختبار الواجهة ببيانات مزيّفة، وهذا ما تفعله اختبارات المكوّنات أسرع.
      - text: تسريع الاختبارات البطيئة بتخطّي الطلبات إلى الـ API الخاص بك.
        why: تخطّي الـ API الخاص بك يُلغي التكامل الذي وُجد الاختبار لفحصه؛ اجعل الـ API أو بيانات الاختبار أسرع بدلًا من ذلك.
    answer: 0
---

أشهر سبب لفقدان الثقة في مجموعة end-to-end ليس التوقيت؛ بل **الحالة المشتركة**. ينجح الاختبار 12 وحده ويفشل في التشغيل الكامل لأن الاختبار 7 أعاد تسمية المجموعة التي يستخدمها. أو ينجح اختبار في أيام الاثنين فقط لأن البيانات الأولية تحتوي مصروفًا لـ "هذا الأسبوع". العزل هو العلاج، وPlaywright تعطيك معظمه مجانًا.

## سياق جديد لكل اختبار

يستلم كل اختبار **سياق متصفّح** (browser context) خاصًّا به: ملفًّا شخصيًا يشبه وضع التصفّح الخفي، له ملفات تعريف الارتباط وlocalStorage وsessionStorage والذاكرة المؤقّتة الخاصة به. فتح سياق رخيص (أجزاء من الثانية، لا متصفّح جديد)، لذا تنشئ Playwright سياقًا جديدًا لكل اختبار. ولهذا تستطيع التشغيل مع `fullyParallel: true` عبر عدة عمّال (workers): فلا يستطيع اختباران رؤية تسجيلات دخول بعضهما أو المسوّدات المحفوظة.

جهة المتصفّح معزولة. **أما الـ backend لديك فليس كذلك.** إن عدّل اختباران المجموعة نفسها على الخادم نفسه، يتصادمان. وبقية هذا الدرس عن عزل البيانات.

## الـ Fixtures: التهيئة والتنظيف في مكان واحد

لقد كنت تستخدم الـ fixtures أصلًا: فـ `page` في `async ({ page }) => …` واحدة منها. وتأتي Playwright أيضًا بـ `context` و`browser` و`browserName` و`request` (عميل HTTP يشترك في `baseURL`). وتعرّف fixtures خاصة بك عبر `test.extend`:

```ts title=e2e/fixtures.ts
import { test as base, expect } from '@playwright/test';

type Group = { id: string; name: string };

export const test = base.extend<{ group: Group }>({
  group: async ({ request }, use) => {
    // Setup: create a fresh group through the API
    const response = await request.post('/api/groups', {
      data: { name: `Trip ${crypto.randomUUID().slice(0, 8)}`, members: ['Ana', 'Ben'] },
    });
    expect(response.ok()).toBeTruthy();
    const group: Group = await response.json();

    await use(group); // the test runs here

    // Teardown: runs after the test, pass or fail
    await request.delete(`/api/groups/${group.id}`);
  },
});

export { expect };
```

```ts title=e2e/settle-up.spec.ts
import { test, expect } from './fixtures';

test('settling up clears every balance', async ({ page, group }) => {
  await page.goto(`/groups/${group.id}`);
  // …add an expense, click Settle up…
  await expect(page.getByRole('status')).toHaveText('Everyone is settled up');
});
```

ثلاث خصائص تجعل هذا أفضل من `beforeEach`:

- **عند الطلب.** لا ينشئ مجموعةً إلا الاختبارات التي تذكر `group` في معاملاتها. والاختبارات التي لا تحتاجها لا تدفع شيئًا.
- **التهيئة والهدم يعيشان معًا**، حول `await use(...)`، فلا يمكن أن يخرج التنظيف عن التزامن مع التهيئة.
- **قابلة للتركيب.** يمكن لـ fixture الـ `group` أن تعتمد على `request`؛ ويمكن لـ fixture `expense` أن تعتمد على `group`. وتحلّ Playwright الترتيب.

إنشاء البيانات **عبر الـ API** بدل النقر في الواجهة يُبقي كل اختبار مركّزًا على مسار واحد ويوفّر ثوانيَ في كل اختبار. اختبار واحد ينقر عبر "إنشاء مجموعة"؛ والخمسون الآخرون يحصلون على مجموعة من الـ fixture.

:::mistake اختبارات يعتمد بعضها على بعض
"الاختبار 1 ينشئ المجموعة، والاختبار 2 يضيف مصروفًا، والاختبار 3 يسوّي الحسابات" يُقرأ كقصة ويتصرّف كسلسلة: لا يمكن تشغيله بالتوازي، ولا يمكن إعادة تشغيل أحد اختباراته منفردًا، وفشل واحد يتتالى إلى ثلاثة. اجعل كل اختبار ينشئ ما يحتاجه، باسم فريد (لاحقة عشوائية) كي لا يتصادم العمّال المتوازيون أبدًا.
:::

## تسجيل الدخول مرة واحدة

إن كان Splitwise-lite يتطلّب تسجيل الدخول، فالتنقّل في النموذج في كل اختبار يضيّع الوقت ويُرهق خادم المصادقة. نمط Playwright هو **setup project** (مشروع تهيئة): اختبار واحد يسجّل الدخول ويحفظ حالة تخزين المتصفّح في ملف، والمشاريع الحقيقية تعلن اعتمادها عليه وتبدأ وقد سُجّل دخولها مسبقًا:

```ts title=playwright.config.ts
// …inside defineConfig
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'],
  },
],
```

ينتهي اختبار التهيئة بـ `await page.context().storageState({ path: 'playwright/.auth/user.json' })`. أضف `playwright/.auth` إلى `.gitignore`: فهو يحتوي ملفات تعريف ارتباط لجلسات حقيقية.

## التوجيه: التحكّم في ما يقوله الخادم

بعض الحالات صعبة الإنتاج مع backend حقيقي: 500 عند الحفظ، أو استجابة بطيئة، أو مجموعة فارغة من حساب قديم. يعترض `page.route` الطلبات القادمة من الصفحة ويتيح لك الإجابة عنها:

```ts
test('explains a failed save', async ({ page, group }) => {
  await page.route('**/api/expenses', (route) =>
    route.fulfill({ status: 500, json: { error: 'Database unavailable' } }),
  );

  await page.goto(`/groups/${group.id}`);
  await page.getByLabel('Description').fill('Dinner');
  await page.getByLabel('Amount').fill('30');
  await page.getByRole('button', { name: 'Add expense' }).click();

  await expect(page.getByRole('alert')).toHaveText('Could not save the expense. Try again.');
});
```

استخدم التوجيه للنادر والمعطوب. وإن وجدت نفسك توجّه كل طلب، فقد أعدت بناء اختبار مكوّن بأداة أبطأ؛ دع المسارات السعيدة تصل إلى الـ backend الحقيقي، لأن هذا التكامل هو سبب وجود اختبارات الـ end-to-end.

:::why العزل هو ما يجعل التوازي آمنًا
مجموعة من 200 اختبار مستقل تعمل على 8 عمّال في ثُمن الوقت. أما المجموعة ذات الاعتماديات الخفيّة فلا بدّ أن تعمل تسلسليًا، وإلا فشلت عشوائيًا. العزل ليس نظافة لذاتها؛ بل هو ما يُبقي المجموعة سريعة وهي تكبر.
:::

ويجعل العزل أيضًا تتبّع حالات الفشل أرخص. حين يفشل اختبار، تستطيع إعادة تشغيل ذلك الاختبار وحده بـ `npx playwright test -g "settling up"` والحصول على النتيجة نفسها، لأن لا شيء مما يعتمد عليه يعيش خارجه. أما مع الاعتماديات الخفيّة، فتنجح إعادة التشغيل المنفردة ويفشل التشغيل الكامل، وتبقى تقسّم المجموعة نصفين بعد نصفين لتجد أيّ جار كسره.

في التمرين تُكمل fixture تنشئ مجموعة وتحذفها. الدرس القادم: ماذا تفعل حين يفشل اختبار رغم كل ذلك.
