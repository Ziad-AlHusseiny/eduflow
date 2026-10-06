---
summary: تُعدّ Playwright لتطبيق Vite، وتجد العناصر بـ locators موجّهة للمستخدم، وتكتب assertions موجّهة للويب تنتظر الصفحة بدل أن تتسابق معها.
takeaways:
  - تقود Playwright متصفّحات Chromium وFirefox وWebKit حقيقية، وخيارها `webServer` يشغّل خادم التطوير لديك قبل أن تعمل الاختبارات.
  - "فضّل الـ locators الموجّهة للمستخدم (`getByRole` و`getByLabel` و`getByText`)، وضيّقها بـ `filter` أو بالتسلسل بدل مسارات CSS."
  - تنتظر الأفعال مثل `click` و`fill` تلقائيًا حتى يصبح العنصر ظاهرًا، ومستقرًا، ومفعّلًا، وقادرًا على استقبال الأحداث.
  - "الـ assertions الموجّهة للويب مثل `await expect(locator).toHaveText(...)` تعيد المحاولة حتى تنجح أو تنتهي المهلة (5 ثوانٍ افتراضيًا)؛ أما قراءة قيمة ثم تأكيدها مرة واحدة فلا تفعل ذلك."
further:
  - title: Playwright — Locators
    url: https://playwright.dev/docs/locators
  - title: Playwright — Assertions
    url: https://playwright.dev/docs/test-assertions
  - title: Playwright — Auto-waiting
    url: https://playwright.dev/docs/actionability
  - title: Playwright — Web server
    url: https://playwright.dev/docs/test-webserver
quiz:
  - q: "أيّ assertion يظلّ يعمل حين يتحدّث الرصيد بعد 300 ms من النقر؟"
    options:
      - text: "`expect(await page.getByRole('status').textContent()).toBe('Ben owes $5.00')`"
        why: هذا يقرأ النص مرة واحدة، فورًا؛ وإن لم يكن التحديث قد وصل بعد، يفشل. لا شيء يعيد المحاولة.
      - text: "`await expect(page.getByRole('status')).toHaveText('Ben owes $5.00')`"
        why: صحيح. الـ assertion الموجّه للويب يعيد قراءة العنصر حتى يتطابق النص أو تنتهي المهلة.
      - text: "`await page.waitForTimeout(500); expect(await page.getByRole('status').isVisible()).toBe(true)`"
        why: الانتظار هنا تخمين، والـ assertion لا يفحص النص أصلًا.
    answer: 1
  - q: "يفشل `await page.getByRole('button', { name: 'Remove' }).click()` بخطأ strict mode violation. ماذا يعني ذلك؟"
    options:
      - text: الزر معطّل، فترفض Playwright النقر.
        why: الزر المعطّل يجعل النقر ينتظر ثم تنتهي مهلته؛ أما الوضع الصارم (strict mode) فيتعلّق بعدد العناصر المطابقة.
      - text: الاختبار يعمل في متصفّح بإعدادات أمان صارمة.
        why: الوضع الصارم قاعدة خاصة بالـ locators، لا إعداد في المتصفّح.
      - text: الـ locator يطابق أكثر من عنصر، فلا تخمّن Playwright أيّها تتعامل معه.
        why: "صحيح. ضيّقه، مثلًا `page.getByRole('listitem').filter({ hasText: 'Taxi' }).getByRole('button', { name: 'Remove' })`."
    answer: 2
  - q: 'ما الذي تفحصه Playwright قبل أن تنفّذ `click()` على locator؟'
    options:
      - text: أن العنصر ظاهر، ومستقر (لا يتحرّك)، ومفعّل، وغير مغطّى بعنصر آخر.
        why: صحيح. فحوص قابلية التنفيذ هذه هي ما يجعل معظم الانتظارات الصريحة غير ضرورية.
      - text: أن العنصر موجود في الـ DOM فقط.
        why: الوجود لا يكفي؛ فالمستخدم لا يستطيع النقر على زر مخفيّ أو مغطّى، وPlaywright تنتظر حتى يصبح قابلًا للنقر.
      - text: لا شيء؛ تنقر فورًا، وعلى الاختبار أن ينتظر قبل ذلك.
        why: هكذا كانت تعمل الأدوات القديمة؛ أما Playwright فتنتظر تلقائيًا قبل الأفعال.
    answer: 0
---

كل ما سبق عمل في Node، مع jsdom الذي يتظاهر بأنه متصفّح. هذا يغطّي معظم المنطق ومعظم سلوك الواجهة، لكن ليس كله: التخطيط الحقيقي، والتوجيه الحقيقي، والخادم الحقيقي، وخطأ CSS حقيقي يُخفي زر "Settle up" على Safari. وللمسارات القليلة التي يهمّ فيها ذلك، تقود متصفّحًا حقيقيًا. وفي 2026 الأداة الافتراضية لذلك في JavaScript هي Playwright.

## الإعداد

```bash
npm init playwright@latest
```

يضيف المعالج `@playwright/test`، وملف `playwright.config.ts`، واختبارًا نموذجيًا، و(اختياريًا) workflow لـ GitHub Actions، وينزّل المتصفّحات. وجّهه إلى تطبيق Vite لديك ودعه يشغّل خادم التطوير نيابةً عنك:

```ts title=playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

يشغّل `webServer` الأمر `npm run dev`، وينتظر حتى يستجيب الـ URL، ثم يشغّل الاختبارات، ثم يوقفه. ويتيح `baseURL` للاختبارات استدعاء `page.goto('/groups/lisbon')`. شغّل المجموعة بـ `npx playwright test`.

## أول اختبار end-to-end

```ts title=e2e/settle-up.spec.ts
import { test, expect } from '@playwright/test';

test('adding an expense updates the balances', async ({ page }) => {
  await page.goto('/groups/lisbon');

  await page.getByLabel('Description').fill('Dinner');
  await page.getByLabel('Amount').fill('30.00');
  await page.getByRole('button', { name: 'Add expense' }).click();

  const balances = page.getByRole('list', { name: 'Balances' });
  await expect(balances.getByRole('listitem')).toHaveText([
    'Ana is owed $15.00',
    'Ben owes $15.00',
  ]);
});
```

`page` تبويب متصفّح جديد، يُعطى للاختبار على شكل **fixture** (تجهيزة اختبار؛ المزيد عنها في الدرس القادم). يُفترض أن تبدو الـ locators (محدِّدات العناصر) مألوفة: `getByRole` و`getByLabel` و`getByText` و`getByPlaceholder` و`getByAltText` و`getByTitle` و`getByTestId` في Playwright تتبع فكرة الأولوية نفسها في Testing Library، وللسبب نفسه.

## الـ locators كسولة وصارمة

الـ locator **وصف** لطريقة إيجاد عنصر، لا العنصر نفسه. لا يجد `page.getByRole('button', { name: 'Add expense' })` شيئًا حتى تتعامل معه، ويجده من جديد في كل مرة، فلا تبقى ممسكًا بمرجع قديم حين تستبدل إعادة الـ render الزر.

والـ locators أيضًا **صارمة**: إن طابق locator فعلٍ ما عنصرين، ترمي Playwright خطأً بدل أن تنقر الأول. ضيّقه بالتسلسل وبـ `filter`:

```ts
const taxiRow = page.getByRole('listitem').filter({ hasText: 'Taxi' });
await taxiRow.getByRole('button', { name: 'Remove' }).click();
```

هذا يُقرأ كالتعليمات التي ستعطيها لإنسان ("احذف صف التاكسي")، ويصمد أمام إعادة الترتيب. توجد `nth(2)` و`first()`، لكنهما تنكسران لحظة تغيّر الترتيب؛ فلا تستخدمهما إلا حين *يكون* الترتيب هو المقصود.

## الانتظار التلقائي: الأفعال

قبل `click()`، تنتظر Playwright حتى يصبح العنصر **ظاهرًا**، و**مستقرًا** (لا في منتصف حركة)، و**مفعّلًا**، و**يستقبل الأحداث** فعلًا (غير مغطّى بمؤشّر تحميل أو بشريط ملفات تعريف الارتباط). وتنتظر `fill()` أن يكون ظاهرًا ومفعّلًا وقابلًا للتحرير. ثم تنفّذ. وإن لم تتحقّق الشروط أبدًا، يفشل الفعل بعد انتهاء المهلة برسالة تذكر أيّ فحص فشل.

لهذا نادرًا ما تحتاج اختبارات end-to-end في Playwright إلى انتظارات صريحة. فالزر الذي يظهر بعد تحميل المجموعة يُنقر حين يظهر.

:::figure تنتظر الأفعال حتى يجهز العنصر؛ وتعيد الـ assertions المحاولة حتى تنجح
<svg viewBox="0 0 680 230" role="img" aria-labelledby="t1">
  <title id="t1">في الأعلى: ينتظر click أن يكون العنصر ظاهرًا ومستقرًا ويستقبل الأحداث ومفعّلًا، ثم ينقر. في الأسفل: يعيد toHaveText قراءة العنصر مرارًا حتى يتطابق النص أو تمرّ 5 ثوانٍ.</title>
  <text class="d-code" x="20" y="44">click()</text>
  <rect class="d-box-accent" x="110" y="24" width="80" height="32" rx="8"/>
  <text class="d-label" x="150" y="45" text-anchor="middle">ظاهر</text>
  <rect class="d-box-accent" x="200" y="24" width="80" height="32" rx="8"/>
  <text class="d-label" x="240" y="45" text-anchor="middle">مستقر</text>
  <rect class="d-box-accent" x="290" y="24" width="130" height="32" rx="8"/>
  <text class="d-label" x="355" y="45" text-anchor="middle">يستقبل الأحداث</text>
  <rect class="d-box-accent" x="430" y="24" width="90" height="32" rx="8"/>
  <text class="d-label" x="475" y="45" text-anchor="middle">مفعّل</text>
  <path class="d-arrow" d="M524 40 L566 40" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="570" y="24" width="90" height="32" rx="8"/>
  <text class="d-label" x="615" y="45" text-anchor="middle">نقر</text>
  <text class="d-code" x="20" y="144">toHaveText()</text>
  <path class="d-line" d="M150 140 L520 140"/>
  <circle class="d-dot" cx="170" cy="140" r="6"/>
  <circle class="d-dot" cx="240" cy="140" r="6"/>
  <circle class="d-dot" cx="310" cy="140" r="6"/>
  <text class="d-label-muted" x="240" y="120" text-anchor="middle">إعادة قراءة، لا تطابق</text>
  <rect class="d-box-success" x="350" y="124" width="110" height="32" rx="8"/>
  <text class="d-label" x="405" y="145" text-anchor="middle">تطابق</text>
  <text class="d-label-muted" x="520" y="180" text-anchor="middle">يستسلم عند 5 s</text>
  <path class="d-line d-dashed" d="M520 110 L520 165"/>
</svg>
:::

## الـ assertions الموجّهة للويب: assertions تنتظر

تنطبق الفكرة نفسها على فحص النتائج. `expect` في Playwright حين يُستخدم على **locator** يكون غير متزامن ويعيد المحاولة:

```ts
await expect(page.getByRole('status')).toHaveText('Everyone is settled up');
await expect(page.getByRole('listitem')).toHaveCount(0);
await expect(page).toHaveURL(/\/groups\/lisbon\/settled/);
await expect(page.getByRole('button', { name: 'Settle up' })).toBeDisabled();
```

كل واحد منها يعيد فحص الصفحة حتى يتطابق، لمدة تصل إلى 5 ثوانٍ افتراضيًا. و`toHaveText` مع مصفوفة (كما في الاختبار الأول) يفحص نص كل عنصر مطابق، بالترتيب، وهذه طريقة موجزة لتأكيد قائمة كاملة.

:::mistake قراءة القيم ثم تأكيدها
يبدو `expect(await page.getByRole('status').textContent()).toBe('Everyone is settled up')` مكافئًا، لكنه ليس كذلك. يقرأ `textContent()` مرة واحدة، الآن؛ و`toBe` العام لا يعيد المحاولة أبدًا. إن تحدّثت الحالة بعد 50 ms، يفشل الاختبار، أحيانًا. وهذه "الأحيانًا" هي الطريقة التي تولد بها المجموعات المتقلّبة. أبقِ `await` **خارج** `expect`، على locator، كي يتولّى الـ assertion نفسه الانتظار.
:::

:::tip دع Playwright تكتب المسوّدة الأولى
يفتح `npx playwright codegen localhost:5173` متصفّحًا ويسجّل نقراتك ككود اختبار، مختارًا locators مبنيّة على الأدوار حيثما استطاع. إنها طريقة سريعة لاكتشاف الـ locator المناسب لعنصر صعب؛ ثم عدّل النتيجة كي تؤكّد النتائج، لا كل نقرة.
:::

## ما الذي ينتمي إلى اختبار end-to-end

لأن كل اختبار هنا يبدأ سياق متصفّح، ويحمّل التطبيق، ويتحدّث إلى خادم حقيقي، فإن اختبار الـ end-to-end يكلّف ثوانيَ حيث يكلّف الـ unit test أجزاءً من الثانية. أنفق هذه الميزانية على المسارات التي يكون فيها *الاتصال* بين القطع هو الخطر: تسجيل الدخول، وإضافة مصروف ورؤية الأرصدة تتغيّر، وتسوية الحسابات، وكل ما يتعلّق بالمال أو بفقدان البيانات. لا تستخدمها لفحص كل رسالة تحقّق في حقل المبلغ؛ فاختبارات المكوّنات من القسم 3 تفعل ذلك أسرع بمئة مرة. قد تحتوي مجموعة Splitwise-lite السليمة على خمسة إلى خمسة عشر اختبار end-to-end، وبضع مئات من اختبارات الوحدات والمكوّنات. وإن فشل اختبار end-to-end، فاسأل أولًا إن كان على اختبار في مستوى أدنى أن يلتقطه.

يطلب منك التمرين اختيار الـ locator الذي سيصمد أمام إعادة التصميم القادمة. الدرس القادم: إبقاء الاختبارات مستقلّة بعضها عن بعض.
