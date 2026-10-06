---
summary: تشرح لماذا تنتظر JavaScript دون أن تتجمّد، وتقرأ وتكتب كودًا مبنيًا على الـ promises باستخدام then وasync/await، وتستدعي fetch مع معالجة سليمة للأخطاء، وتتوقّع ترتيب المخرجات اعتمادًا على حلقة الأحداث (event loop).
takeaways:
  - تنفّذ JavaScript شيئًا واحدًا في كل مرة؛ أما العمل البطيء مثل طلبات الشبكة والمؤقّتات فيجري خارج كودك، ثم يُستدعى كودك راجعًا حين ينتهي.
  - الـ promise كائن يمثّل قيمة ستصل لاحقًا؛ وينتهي إمّا مُنجَزًا (fulfilled) بقيمة أو مرفوضًا (rejected) بخطأ.
  - '`await` توقف مؤقتًا الدالة `async` المحيطة بها فقط حتى يستقرّ الـ promise؛ ضع الـ awaits داخل `try`/`catch` للتعامل مع حالات الرفض.'
  - '`fetch` لا تُرفض إلا حين تفشل الشبكة؛ أما مع أخطاء HTTP مثل 404 فتُنجَز و`response.ok` تساوي false، لذلك افحصها دائمًا.'
  - بعد كل قطعة كود متزامن، تنفّذ حلقة الأحداث كل callbacks الـ promises المنتظرة قبل المؤقّت أو الحدث التالي.
further:
  - title: Using promises (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
  - title: async function (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  - title: Using the Fetch API (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  - title: The event loop (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model
quiz:
  - q: |
      بأي ترتيب تُطبع الأسطر؟
      ```js
      console.log("A");
      setTimeout(() => console.log("B"), 0);
      Promise.resolve().then(() => console.log("C"));
      console.log("D");
      ```
    options:
      - text: A، B، C، D
        why: هذا ترتيب كتابة الأسطر، لكن B وC دالتا callback تُنفَّذان لاحقًا، بعد كل الكود المتزامن.
      - text: A، D، B، C
        why: كلتا الدالتين تنتظران الكود المتزامن، لكن callbacks الـ promises (المهام الدقيقة) تُنفَّذ قبل callbacks المؤقّتات.
      - text: A، D، C، B
        why: صحيح. A وD تُنفَّذان الآن. ثم يُفرَّغ طابور المهام الدقيقة (C)، وبعدها فقط تُنفَّذ مهمة المؤقّت (B)، حتى مع تأخير 0 ميلي ثانية.
    answer: 2
  - q: '`const data = getRates(); console.log(data.EUR);` حيث `getRates` دالة `async`. ماذا يُطبع؟'
    options:
      - text: سعر صرف EUR، لأن دوال `async` تُرجع قيمتها مباشرة.
        why: 'دالة `async` تُرجع دائمًا promise. ودون `await`، تكون `data` ذلك الـ promise، لا الأسعار.'
      - text: '`undefined`، لأن `data` هي promise معلّق، وليست له خاصية `EUR`.'
        why: 'صحيح. اكتب `const data = await getRates();` داخل دالة async، أو استخدم `.then`.'
      - text: يرمي خطأ، لأنه لا يمكنك استدعاء دالة async دون `await`.
        why: يمكنك استدعاؤها؛ لكنك ستستعيد promise فقط. ونسيان `await` يفشل بصمت، ولهذا هو خطأ شائع.
    answer: 1
  - q: 'يُرجع خادمك 404 Not Found للطلب `fetch("/api/rates")`. ماذا يفعل الـ promise الخاص بـ fetch؟'
    options:
      - text: يُنجَز باستجابة قيمة `ok` فيها false و`status` فيها 404.
        why: 'صحيح. أخطاء HTTP ما زالت رحلات شبكة ناجحة ذهابًا وإيابًا. عليك أن تفحص `response.ok` بنفسك وترمي خطأ إن أردت الرفض.'
      - text: يُرفض، فتُنفَّذ كتلة `catch` لديك.
        why: '`fetch` لا تُرفض إلا مع أعطال على مستوى الشبكة مثل انقطاع الاتصال. والـ 404 استجابة HTTP صالحة.'
      - text: لا يستقرّ أبدًا، فيظل كودك ينتظر إلى الأبد.
        why: الخادم أجاب، فيستقرّ الـ promise. إنه يُنجَز باستجابة الـ 404.
    answer: 0
  - q: تحتاج إلى أسعار الصرف وقائمة الفئات، من رابطين مستقلّين، قبل العرض. أيّها الأسرع؟
    options:
      - text: '`const r = await getRates(); const c = await getCategories();`'
        why: هذا يعمل، لكن الطلب الثاني لا يبدأ إلا بعد انتهاء الأول، فتنتظر الاثنين واحدًا بعد الآخر.
      - text: '`const [r, c] = await Promise.all([getRates(), getCategories()]);`'
        why: صحيح. يبدأ الطلبان فورًا وتنتظر مرة واحدة، للأبطأ منهما.
      - text: '`const r = getRates(); const c = getCategories();` دون await.'
        why: 'يبدأ الاثنان بالتوازي، لكن `r` و`c` promises لا بيانات، فيفشل العرض باستخدامهما.'
    answer: 1
---

سيكون Pocket أنفع لو استطاع أن يعرض إنفاقك باليورو أيضًا، وهذا يعني أن يطلب من خادم أسعار صرف اليوم. قد يستغرق هذا الطلب 50 ميلي ثانية أو خمس ثوانٍ. ولو توقّفت JavaScript ببساطة وانتظرت، لتجمّدت الصفحة كلها: لا تمرير، ولا كتابة، ولا نقرات. ولأن كودك يتشارك خيطًا (thread) واحدًا مع الصفحة نفسها، فهو يحتاج إلى طريقة يبدأ بها العمل البطيء، ويواصل، ثم يلتقط النتيجة لاحقًا. وهذا هو الكود **غير المتزامن** (asynchronous).

## الـ Callbacks: "اتصل بي حين تنتهي"

أقدم أشكال "لاحقًا" هو الـ callback. تطلب `setTimeout` من المتصفّح أن يستدعي دالة بعد مهلة:

```js run
console.log("Requesting rates…");
setTimeout(() => {
  console.log("Rates arrived");
}, 100);
console.log("Still responsive");
```

يُطبع "Still responsive" قبل "Rates arrived". `setTimeout` لا توقف شيئًا؛ إنها تسلّم الدالة إلى المتصفّح وتعود فورًا. الـ callbacks تعمل، لكن حين تحتاج الخطوة الثانية إلى نتيجة الأولى، والثالثة إلى نتيجة الثانية، فإنها تتداخل أعمق فأعمق، ويجب تكرار معالجة الأخطاء في كل مستوى. وقد أُضيفت الـ promises لإصلاح ذلك.

## الـ Promises: قيمة تصل لاحقًا

الـ **promise** (الوعد) كائن يمثّل نتيجة ليست جاهزة بعد. يبدأ **معلّقًا** (pending)، ويستقرّ مرة واحدة بالضبط: إمّا **مُنجَزًا** (fulfilled) بقيمة، أو **مرفوضًا** (rejected) بخطأ. وتُلحق ما يجب أن يحدث بعد ذلك باستخدام `.then` (عند النجاح) و`.catch` (عند الفشل).

البيئة المعزولة لهذه الدورة لا شبكة فيها، لذلك تستخدم الأمثلة `fakeFetch`، وهي بديل يتصرّف مثل `fetch` الحقيقية: تُرجع promise لكائن استجابة فيه `ok` و`status` ودالة `json()`.

```js run
function fakeFetch(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url === "/api/rates") {
        resolve({ ok: true, status: 200, json: async () => ({ EUR: 0.86, GBP: 0.75 }) });
      } else {
        resolve({ ok: false, status: 404, json: async () => ({ error: "Not found" }) });
      }
    }, 50);
  });
}

fakeFetch("/api/rates")
  .then((response) => response.json())
  .then((rates) => console.log("EUR rate:", rates.EUR))
  .catch((error) => console.log("Failed:", error.message));
```

كل `.then` تُرجع promise جديدًا، لذلك تتسلسل الخطوات في خط مسطّح بدلًا من أن تتداخل، و`.catch` واحدة في النهاية تتعامل مع الفشل في أي خطوة. نادرًا ما ستُنشئ promises بنفسك باستخدام `new Promise`؛ فالمكتبات وواجهات المتصفّح البرمجية تسلّمها إليك، ومهمتك أن تستهلكها.

## async وawait: promises تُقرأ مثل الكود العادي

`async`/`await` طريقة أوضح لكتابة الشيء نفسه. داخل دالة موسومة بـ `async`، توقف `await promise` **تلك الدالة** مؤقتًا حتى يستقرّ الـ promise، ثم تعطيك قيمته. وتصبح الأخطاء استثناءات عادية تلتقطها بـ `try`/`catch`:

```js run
function fakeFetch(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ok = url === "/api/rates";
      const body = ok ? { EUR: 0.86 } : { error: "Not found" };
      resolve({ ok, status: ok ? 200 : 404, json: async () => body });
    }, 50);
  });
}

async function getJson(url) {
  const response = await fakeFetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function showRates() {
  try {
    const rates = await getJson("/api/rates");
    console.log("EUR:", rates.EUR);
    await getJson("/api/missing");
  } catch (error) {
    console.log("Could not load:", error.message);
  }
}

showRates();
```

لاحظ ما **لا** تفعله `await`: إنها لا تجمّد الصفحة. فبينما تنتظر `showRates`، يواصل المتصفّح التعامل مع النقرات ورسم الإطارات. هذه الدالة وحدها هي المتوقّفة مؤقتًا.

الدالة `async` تُرجع دائمًا promise، حتى حين تُرجع بـ `return` قيمة عادية. لذلك يجب على من يستدعيها أن يستخدم `await` أيضًا، أو `.then`.

:::mistake نسيان await
`const rates = getJson("/api/rates"); console.log(rates.EUR);` تطبع `undefined`، لأن `rates` promise معلّق، لا البيانات. وطباعة `rates` نفسها تُظهر `Promise { <pending> }`، وهذا ما يفضح الأمر. أضف `await` (داخل دالة `async`).
:::

## fetch الحقيقية

في صفحة حقيقية، تستبدل `fakeFetch` بـ `fetch` الخاصة بالمتصفّح، ويبقى شكل الكود كما هو:

```js title=rates.js
async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}
```

فحص `response.ok` ضروري، وكثير من الشروحات تُغفله. `fetch` لا تُرفض إلا حين يتعذّر حدوث الطلب أصلًا، مثلًا حين يكون المستخدم غير متّصل. أما الـ 404 أو الـ 500 فاستجابة HTTP سليمة تمامًا، لذلك **يُنجَز** الـ promise، و`ok` تساوي `false`. ودون هذا الفحص، سيحاول كودك قراءة أسعار الصرف من صفحة خطأ.

وحين لا يعتمد طلبان أحدهما على الآخر، ابدأهما معًا وانتظر مرة واحدة باستخدام `Promise.all` (داخل دالة `async`، كأي `await`)، التي تُنجَز بمصفوفة من النتائج، أو تُرفض بمجرّد أن يفشل أيّ منهما:

```js title=rates.js
const [rates, categories] = await Promise.all([
  getJson("/api/rates"),
  getJson("/api/categories"),
]);
```

## حلقة الأحداث

كيف يستطيع خيط واحد فعل كل هذا؟ ينفّذ المحرّك كودك على **مكدّس الاستدعاءات** (call stack)، دالة واحدة في كل مرة. أما الأشياء البطيئة، مثل المؤقّتات وطلبات الشبكة، فيتولّاها المتصفّح خارج المكدّس. وحين ينتهي أحدها، يوضع الـ callback الخاص به في طابور. وكلما فرغ المكدّس، تأخذ **حلقة الأحداث** (event loop) الـ callback التالي من طابور وتنفّذه.

:::figure حلقة الأحداث تنفّذ الـ callbacks المنتظرة حين يفرغ المكدّس
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">يُنفَّذ كودك على مكدّس الاستدعاءات. يتولّى المتصفّح المؤقّتات وfetch، ويضع الـ callbacks المنتهية في طوابير. callbacks الـ promises تذهب إلى طابور المهام الدقيقة، والمؤقّتات والأحداث إلى طابور المهام. وحين يفرغ المكدّس، تنفّذ حلقة الأحداث أولًا كل المهام الدقيقة، ثم مهمة واحدة.</title>
  <rect class="d-box-primary" x="20" y="30" width="170" height="170" rx="12"/>
  <text class="d-label-strong" x="105" y="56" text-anchor="middle">مكدّس الاستدعاءات</text>
  <rect class="d-box" x="40" y="74" width="130" height="34" rx="8"/>
  <text class="d-code" x="105" y="96" text-anchor="middle">showRates()</text>
  <rect class="d-box" x="40" y="116" width="130" height="34" rx="8"/>
  <text class="d-code" x="105" y="138" text-anchor="middle">main script</text>
  <rect class="d-box-accent" x="250" y="30" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="335" y="58" text-anchor="middle">المتصفّح</text>
  <text class="d-label" x="335" y="84" text-anchor="middle">المؤقّتات، fetch</text>
  <rect class="d-box-success" x="480" y="30" width="180" height="70" rx="12"/>
  <text class="d-label-strong" x="570" y="56" text-anchor="middle">المهام الدقيقة</text>
  <text class="d-label" x="570" y="80" text-anchor="middle">callbacks الـ promises</text>
  <rect class="d-box-warn" x="480" y="140" width="180" height="70" rx="12"/>
  <text class="d-label-strong" x="570" y="166" text-anchor="middle">المهام</text>
  <text class="d-label" x="570" y="190" text-anchor="middle">المؤقّتات، النقرات</text>
  <path class="d-arrow" d="M190 70 L246 70" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 60 L476 60" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 90 L476 160" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 90 Q330 150 194 150" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 190 Q330 235 194 185" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="335" y="142" text-anchor="middle">1. كل المهام الدقيقة</text>
  <text class="d-label-muted" x="335" y="240" text-anchor="middle">2. ثم مهمة واحدة</text>
</svg>
:::

هناك طابوران، والترتيب بينهما يفسّر ألغازًا كثيرة. callbacks الـ promises تذهب إلى **طابور المهام الدقيقة** (microtask queue)؛ والمؤقّتات والأحداث تذهب إلى **طابور المهام** (task queue). وفي كل مرة يفرغ فيها المكدّس، تنفّذ الحلقة أولًا **كل** مهمة دقيقة منتظرة، ثم مهمة واحدة، ثم تفحص المهام الدقيقة من جديد:

```js run
console.log("1: script");
setTimeout(() => console.log("4: timeout task"), 0);
Promise.resolve().then(() => console.log("3: promise microtask"));
console.log("2: script");
```

مهلة 0 ميلي ثانية لا تعني "الآن"؛ بل تعني "على شكل مهمة، بمجرّد أن يفرغ المكدّس وتنتهي المهام الدقيقة". والنموذج نفسه يفسّر لماذا تجمّد حلقة تكرار طويلة الصفحة: فما دام كودك يشغل المكدّس، لا يستطيع أي معالج نقرات أو مؤقّت أو إعادة رسم أن يُنفَّذ.

:::tip اعرض حالتي التحميل والخطأ
لكل طلب شبكة ثلاث نتائج يستطيع المستخدم رؤيتها: الانتظار، والنجاح، والفشل. اعرض رسالة "Loading…" قبل الـ `await`، واستبدلها بالبيانات عند النجاح، واعرض رسالة مفيدة في الـ `catch`. التطبيق الذي لا يعرض شيئًا بصمت أثناء انتظاره، أو بعد فشله، يبدو معطّلًا.
:::

اكتمل القسم 4: يعيش Pocket في صفحة، ويتفاعل مع النقرات، ويستقبل المدخلات، ويحفظ البيانات، ويستطيع التحدّث إلى خادم. ويحوّل القسم 5 هذه الكومة المتنامية من الكود إلى برنامج منظّم جيدًا.
