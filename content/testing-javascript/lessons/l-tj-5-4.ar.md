---
summary: تشغّل مجموعة اختبارات متعدّدة الطبقات في CI باستخدام GitHub Actions كي يحصل كل pull request على تغذية راجعة سريعة وموثوقة، وتقرّر أيّ الاختبارات تتخطّاها أو تحذفها لأن تكلفتها أكبر مما تلتقطه.
takeaways:
  - رتّب CI من الأسرع إلى الأبطأ (الـ lint والأنواع، ثم اختبارات unit وintegration، ثم end-to-end) كي توقف حالات الفشل الرخيصة التشغيل مبكرًا.
  - اجعل مهامّ الاختبار فحوصًا إلزامية (required checks) على الفرع الرئيسي، وارفع تقارير Playwright كـ artifacts، ووزّع مجموعات الـ end-to-end البطيئة على عدة أجهزة بالـ sharding.
  - أبقِ الـ pipeline كله سريعًا بما يكفي كي ينتظره الناس؛ فالـ pipeline الذي يستغرق 40 دقيقة يُتجاوَز.
  - "لا تختبر الكود التافه، ولا سلوك أطر العمل أو المكتبات، ولا التنسيق، ولا التفاصيل الداخلية؛ واحذف الاختبارات التي لا تفشل أبدًا لسبب حقيقي."
  - يستحق الاختبار مكانه حين يفشل بسبب خطأ قد يصل فعلًا إلى المستخدمين، بسرعة، وبرسالة واضحة.
further:
  - title: Playwright — Continuous Integration
    url: https://playwright.dev/docs/ci-intro
  - title: Playwright — Sharding
    url: https://playwright.dev/docs/test-sharding
  - title: GitHub Docs — About protected branches
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
  - title: Vitest — Reporters
    url: https://vitest.dev/guide/reporters
quiz:
  - q: يشغّل الـ pipeline لديك Playwright أولًا (12 دقيقة)، ثم الـ lint (20 ثانية). خطأ مطبعي في import يُفشل الـ lint في معظم الـ pull requests المعطوبة. ما الترتيب الأفضل؟
    options:
      - text: أبقِ الترتيب؛ اختبارات الـ end-to-end هي الأهم، فيجب أن تعمل أولًا.
        why: الأهمية ليست المقصود؛ تشغيل أبطأ مهمّة أولًا يعني أن المطوّرين ينتظرون 12 دقيقة ليعرفوا بمشكلة تستغرق 20 ثانية.
      - text: الـ lint وفحص الأنواع أولًا، ثم اختبارات unit وintegration، ثم end-to-end فقط إن نجح ما قبلها.
        why: صحيح. الفحوص السريعة الرخيصة تفشل مبكرًا وتوفّر دقائق التشغيل؛ والمرحلة البطيئة لا تعمل إلا على كود معقول أصلًا.
      - text: شغّل الـ lint على الفرع الرئيسي فقط بعد الـ merge.
        why: عندها يصل الكود المعطوب إلى main قبل أن يلاحظه أحد، وهذا بالضبط ما وُجد CI على الـ pull requests لمنعه.
    answer: 1
  - q: أيّ من هذه الاختبارات هو أفضل مرشّح للحذف؟
    options:
      - text: 'اختبار انتكاس لخطأ مبلَّغ عنه كانت فيه `''12.5''` تُحلَّل على أنها 1205 سنتًا.'
        why: اختبارات الانتكاس للأخطاء الحقيقية من أثمن الاختبارات التي تملكها؛ ذلك الخطأ حدث مرة ويمكن أن يحدث مجددًا.
      - text: 'اختبار يعرض مكوّنًا ويتحقّق من أن دالة الضبط في `useState` الخاص بـ React تحدّث الـ state.'
        why: صحيح. إنه يختبر React، لا كودك. مجموعة اختبارات React نفسها تغطّي ذلك، ولا يمكن أن يفشل الاختبار إلا إن كانت React نفسها معطّلة.
      - text: اختبار end-to-end يضيف مصروفًا ويتحقّق من أن الأرصدة تتحدّث.
        why: هذا مسار حرج يكون فيه الاتصال بين الواجهة والـ API والمنطق هو الخطر، وهو بالضبط ما وُجدت اختبارات الـ end-to-end من أجله.
    answer: 1
  - q: كبرت مجموعة الـ end-to-end حتى صارت تستغرق 30 دقيقة على جهاز واحد. ما الخطوة الأولى الأكثر فاعلية؟
    options:
      - text: 'وزّعها على عدة أجهزة بـ `--shard`، وتحقّق إن كانت بعض اختبارات الـ end-to-end تكرّر اختبارات في مستويات أدنى.'
        why: صحيح. الـ sharding يقلّص الوقت الفعلي فورًا؛ ونقل الفحوص المكرّرة إلى أسفل الكأس يقلّص العمل الكلي.
      - text: شغّل مجموعة الـ end-to-end مرة واحدة في الأسبوع فقط.
        why: عندها تتراكم تغييرات أسبوع كامل قبل أن يعرف أحد أن مسارًا حرجًا انكسر، ويصبح إيجاد المتسبّب أصعب بكثير.
      - text: زِد مهلة كل اختبار كي يفشل عدد أقل منها.
        why: المهل ليست المشكلة هنا، والمهل الأطول تجعل المجموعة البطيئة أبطأ حين يسوء شيء ما فعلًا.
    answer: 0
---

الاختبارات على حاسوبك تحميك أنت. أما الاختبارات في CI (التكامل المستمر) فتحمي الفريق كله، مع كل pull request، سواء تذكّر أحدهم تشغيلها أم لا. يجمع هذا الدرس الأخير القطع معًا: pipeline يشغّل الطبقات التي بنيتها بالترتيب الصحيح، وحسن التقدير في ما يستحق اختبارًا من الأساس.

## pipeline من الأسرع إلى الأبطأ

الترتيب مهم بقدر المحتوى. الفحوص الرخيصة التي تفشل كثيرًا تأتي أولًا، فيكلّفك الخطأ المطبعي 30 ثانية من الانتظار بدل 12 دقيقة:

:::figure pipeline لـ pull request، الفحوص الأرخص أولًا
<svg viewBox="0 0 680 170" role="img" aria-labelledby="t1">
  <title id="t1">أربع مراحل من اليسار إلى اليمين: الـ lint والأنواع في ثوانٍ، واختبارات unit وintegration في دقيقة تقريبًا، والبناء، ثم اختبارات end-to-end موزّعة في بضع دقائق. كل مرحلة لا تعمل إلا إن نجحت التي قبلها.</title>
  <rect class="d-box-warn" x="10" y="50" width="145" height="70" rx="12"/>
  <text class="d-label-strong" x="82" y="80" text-anchor="middle">Lint + أنواع</text>
  <text class="d-label-muted" x="82" y="104" text-anchor="middle">~30 s</text>
  <path class="d-arrow" d="M155 85 L183 85" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="185" y="50" width="145" height="70" rx="12"/>
  <text class="d-label-strong" x="257" y="80" text-anchor="middle">Vitest</text>
  <text class="d-label-muted" x="257" y="104" text-anchor="middle">~1 min</text>
  <path class="d-arrow" d="M330 85 L358 85" marker-end="url(#arrow)"/>
  <rect class="d-box" x="360" y="50" width="120" height="70" rx="12"/>
  <text class="d-label-strong" x="420" y="80" text-anchor="middle">البناء</text>
  <text class="d-label-muted" x="420" y="104" text-anchor="middle">~30 s</text>
  <path class="d-arrow" d="M480 85 L508 85" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="510" y="50" width="160" height="70" rx="12"/>
  <text class="d-label-strong" x="590" y="80" text-anchor="middle">Playwright</text>
  <text class="d-label-muted" x="590" y="104" text-anchor="middle">3 shards، ~4 min</text>
  <text class="d-label-muted" x="340" y="155" text-anchor="middle">الفشل يوقف التشغيل مبكرًا</text>
</svg>
:::

وإليك ذلك على شكل workflow في GitHub Actions:

```yaml title=.github/workflows/test.yml
name: Test
on:
  pull_request:
  push:
    branches: [main]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npx vitest run --coverage

  e2e:
    needs: unit
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}/3
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 14
```

بضعة تفاصيل تؤدّي عملًا حقيقيًا:

- **`needs: unit`** يعني أن مهمّة الـ end-to-end لا تبدأ إلا حين تنجح اختبارات الوحدات. لا فائدة من تشغيل المتصفّحات لكود يفشل في `tsc`.
- **`--shard=1/3`** يقسّم مجموعة Playwright على ثلاثة أجهزة تعمل بالتوازي. (وللحصول على تقرير واحد مدمج، انتقل إلى المُبلّغ `blob` وشغّل `npx playwright merge-reports` في مهمّة أخيرة.)
- **`if: ${{ !cancelled() }}`** يرفع التقرير حتى حين تفشل الاختبارات، وهذا بالضبط حين تحتاج إلى الـ traces من [درس تتبّع الأخطاء](lesson:l-tj-4-3).
- **`CI` يُضبط تلقائيًا** على خوادم GitHub، فتعمل Vitest مرة واحدة بدل المراقبة، ويفشل أي `.only` شارد، ويبدأ عمل `retries: process.env.CI ? 2 : 0` في إعدادات Playwright.

وأخيرًا، في إعدادات المستودع، اجعل هذه المهامّ **فحوص حالة إلزامية** (required status checks) على `main`، كي يمنع الـ pipeline الأحمر الـ merge فعلًا. فالـ pipeline الذي لا يُلزَم أحد بالنجاح فيه مجرّد اقتراح.

:::tip أبقِه تحت عشر دقائق
ينتظر الناس pipeline يستغرق خمس دقائق. وينتقلون إلى عمل آخر مع pipeline يستغرق عشرين، ويبدؤون بالـ merge متجاوزين pipeline يستغرق أربعين. تعامل مع وقت الـ pipeline كميزانية: وزّع بالـ sharding، وخزّن الاعتماديات مؤقتًا، وشغّل مجموعة Vitest السريعة قبل أي شيء بطيء، وانقل الفحوص إلى أسفل الكأس حين يكرّر اختبار end-to-end ما يفعله unit test.
:::

## اختيار ما لا تختبره

كل اختبار يكلّف وقت كتابة، ودقائق CI، وصيانة. وبعضها يكلّف أكثر مما سيلتقطه في أي وقت:

- **الكود التافه**: دالة getter تعيد حقلًا، أو ثابت (`expect(CURRENCY).toBe('USD')` يعيد قول ما في الكود).
- **سلوك أطر العمل والمكتبات**: أن `useState` يحدّث الـ state، أو أن `Array.prototype.sort` يرتّب، أو أن مكتبة التواريخ لديك تنسّق التواريخ. هذا يختبره القائمون على صيانتها.
- **التفاصيل الداخلية**: أيّ دالة مساعدة خاصة استُدعيت، وكم مرة أُعيد render مكوّن ما، والحالة الداخلية. هذه تفشل مع إعادة الهيكلة وتنجح مع الأخطاء.
- **التنسيق**: أسماء الأصناف وقيم البكسل في الـ unit tests. وإن كانت الانتكاسات البصرية مهمّة، فاستخدم اختبارات لقطات الشاشة في متصفّح حقيقي لبضع شاشات أساسية.
- **الكود المؤقّت**: التجارب والنماذج الأولية التي توشك على حذفها.

وكن مستعدًا **للحذف**. الاختبار الذي لم يفشل قط لسبب حقيقي خلال عامين، أو الذي ينكسر مع كل إعادة هيكلة، أو المتخطّى بشكل دائم، عبء. وحذفه مساهمة.

:::mistake اختبار كل شيء في المستوى نفسه
مجموعة فيها 400 اختبار end-to-end و20 unit test بطيئة ومتقلّبة وصعبة التتبّع؛ ومجموعة فيها 2,000 unit test بلا أي اختبار end-to-end قد تنجح بينما لا يُحمَّل التطبيق أصلًا. لا هذه ولا تلك "اختبار أكثر". ضع كل فحص في أدنى مستوى يستطيع التقاط الخطأ، واحتفظ بحفنة من اختبارات الـ end-to-end للمسارات التي تربط كل شيء معًا.
:::

## الصورة الكاملة

لديك الآن كل الطبقات: الفحوص الساكنة، والـ unit tests التي تثبّت السلوك والحدود، واختبارات الواجهة التي تتصرّف كالمستخدمين، واختبارات الـ end-to-end التي تنتظر بشكل صحيح وتبقى معزولة، والأدوات للحكم عليها: الـ coverage للفجوات، والـ mutation testing للقوة. والسؤال الذي يقف خلف كل ذلك هو نفسه سؤال الدرس الأول: **هل سيفشل هذا الاختبار بسبب خطأ قد يصل فعلًا إلى المستخدمين، بسرعة، وبرسالة تقول ما الذي انكسر؟** احتفظ بالاختبارات التي تجيب بنعم، وأصلح التي يمكن أن تجيب بها، واحذف البقية.

يطلب منك التمرين اتخاذ هذه القرارات على قائمة اختبارات تبدو حقيقية.
