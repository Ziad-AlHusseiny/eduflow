---
summary: انشر Watchlist على Vercel من مستودع GitHub أو من Vercel CLI، وافهم نُسخ الإنتاج ونُسخ المعاينة، وتعامل مع متغيّرات البيئة والتوجيه في جهة المتصفّح بأمان.
takeaways:
  - يُبنى تطبيق Vite إلى ملفات ثابتة في dist/، ويكتشفها Vercel تلقائيًا عبر الإعداد المسبق لـ Vite (`vite build`، والمخرجات في `dist`).
  - استيراد مستودع GitHub يعطيك deployment للإنتاج مع كل push إلى main، ورابط معاينة لكل branch آخر ولكل pull request.
  - تنشر Vercel CLI من الطرفية؛ فالأمر `vercel` ينشئ معاينة، و`vercel --prod` ينشر إلى الإنتاج.
  - وحدها المتغيّرات التي تبدأ بـ `VITE_` تصل إلى كود المتصفّح، وهي علنية، فلا تضع فيها أسرارًا أبدًا.
  - تطبيق الصفحة الواحدة الذي فيه مسارات في جهة المتصفّح يحتاج إلى rewrite نحو index.html؛ أمّا Watchlist، بصفحته الواحدة، فلا يحتاجه.
further:
  - title: Vite on Vercel
    url: https://vercel.com/docs/frameworks/frontend/vite
  - title: Vercel CLI overview
    url: https://vercel.com/docs/cli
  - title: Deploying a Static Site (Vite)
    url: https://vite.dev/guide/static-deploy
  - title: Env Variables and Modes (Vite)
    url: https://vite.dev/guide/env-and-mode
quiz:
  - q: استوردت مستودع Watchlist إلى Vercel. ماذا يشغّل Vercel، وماذا يقدّم للزوّار؟
    options:
      - text: يشغّل `npm run dev` ويُبقي خادم التطوير يعمل للزوّار.
        why: خادم التطوير للتطوير المحلي فقط. أمّا الإنتاج فيقدّم ملفات ثابتة محسّنة.
      - text: يثبّت الاعتماديات، ويشغّل البناء (`vite build`)، ويقدّم الملفات الثابتة في `dist/`.
        why: صحيح. يعرف الإعداد المسبق لـ Vite أمر البناء ومجلد المخرجات، فتعمل القيم الافتراضية كما هي.
      - text: يرفع مجلد `src/` ويترجم المتصفّح الـ JSX.
        why: المتصفّحات لا تستطيع تشغيل JSX. خطوة البناء تترجم كل شيء وتجمّعه قبل تقديم أي شيء.
      - text: يقدّم `index.html` من جذر المشروع بلا خطوة بناء.
        why: ملف index.html في الجذر يشير إلى `/src/main.jsx`، وهذا لا يعمل إلا عبر Vite. ما يُقدَّم هو `dist/index.html` المبني.
    answer: 1
  - q: فتحت pull request يعيد تنسيق شريط الفلترة. مع إعداد التكامل مع GitHub، ماذا يحدث؟
    options:
      - text: لا شيء حتى تعمل merge، لأن Vercel لا يبني إلا main.
        why: يبني Vercel كل branch يُرفع. وحده رابط الإنتاج ينتظر main.
      - text: يتحدّث موقع الإنتاج فورًا بالتغييرات غير المدموجة.
        why: لا يُحدَّث الإنتاج إلا من branch الإنتاج (main)، فلا يصل العمل غير المكتمل إلى المستخدمين الحقيقيين.
      - text: يطلب منك Vercel تشغيل `vercel --prod` محليًا.
        why: التكامل مع Git ينشر تلقائيًا؛ والـ CLI بديل، لا خطوة إلزامية.
      - text: يبني Vercel الـ branch وينشر رابط معاينة فريدًا على الـ pull request، ويترك الإنتاج كما هو.
        why: صحيح. نُسخ المعاينة تتيح لك وللمراجعين تجربة التغيير قبل الـ merge.
    answer: 3
  - q: يقرأ تطبيقك `import.meta.env.VITE_TMDB_KEY` لاستدعاء API للأفلام. أيّ عبارة صحيحة؟
    options:
      - text: تُضمَّن القيمة في حزمة JavaScript وقت البناء، فيستطيع أي أحد قراءتها في متصفّحه.
        why: صحيح. متغيّرات VITE_ علنية بطبيعتها. لا تستخدمها إلا لقيم آمنة الكشف، واحتفظ بالأسرار الحقيقية على خادم.
      - text: تبقى القيمة على خوادم Vercel وتُجلب بأمان وقت التشغيل.
        why: يستبدل Vite التعبير `import.meta.env.VITE_…` بالقيمة الحرفية أثناء البناء. لا يوجد جلب وقت التشغيل.
      - text: البادئة اختيارية؛ أي متغيّر بيئة متاح بالشكل `import.meta.env.NAME`.
        why: لا يكشف Vite لكود المتصفّح إلا المتغيّرات ذات البادئة `VITE_`، تحديدًا لمنع التسريب غير المقصود.
    answer: 0
  - q: أضفت React Router ليصبح `/watched` صفحة مستقلة. التنقّل بالنقر يعمل، لكن تحديث الصفحة على `/watched` في الإنتاج يعرض 404. ما الإصلاح؟
    options:
      - text: انقل الصفحة إلى مجلد `public/watched/`.
        why: الصفحة تُرسم بـ JavaScript من index.html؛ والمجلد الثابت سيحتاج إلى نسخته الخاصة من التطبيق كله.
      - text: غيّر البناء على Vercel إلى `npm run dev`.
        why: خادم التطوير ليس خادم إنتاج. الإصلاح قاعدة توجيه للملفات الثابتة.
      - text: أضف rewrite في `vercel.json` يرسل كل مسار إلى `/index.html`، فيُحمَّل التطبيق ويتولّى الـ router الرابط.
        why: صحيح. لا يوجد ملف اسمه `watched` على الخادم؛ والـ rewrite يقدّم هيكل التطبيق لأي مسار ويترك التوجيه في جهة المتصفّح يتولّى الأمر.
    answer: 2
---

المشروع الذي لا يعمل إلا على `localhost:5173` غير مرئي لأي أحد آخر، بمن فيهم من يقرّرون توظيفك. الـ deploy (النشر) يحوّل Watchlist إلى رابط تضعه في سيرتك الذاتية، وترسله إلى صديق، وتفتحه على هاتفك. لتطبيق Vite على Vercel يستغرق ذلك بضع دقائق، وبعد إعداده، كل `git push` ينشر تلقائيًا.

## ما الذي تنشره

يحوّل `npm run build` مشروعك إلى مجلد من الملفات الثابتة: `dist/index.html`، وحزمة JavaScript أو اثنتين، وملف CSS، بأسماء ملفات فيها hash مثل `index-B3f9xk2a.js` لتستطيع المتصفّحات تخزينها مؤقّتًا إلى الأبد. لا يوجد كود خادم. أي استضافة ثابتة تستطيع تقديمه؛ وVercel شائع لأنه يكتشف إطار العمل، ويبني مع كل push، ويعطيك روابط معاينة مجانًا في خطة Hobby.

قبل النشر، افحص نسخة الإنتاج محليًا:

```bash
npm run build
npm run preview
```

يقدّم `preview` المجلد `dist/` على `http://localhost:4173`. إذا انكسر شيء في الإنتاج فقط، مثل مسار ملف خاطئ أو متغيّر بيئة مفقود، فستكتشفه هنا بدل الموقع الحيّ.

## الخيار 1: الاستيراد من GitHub (الموصى به)

1. ارفع مشروعك إلى مستودع على GitHub. إذا عملت commit في درس بناء Watchlist، فأنشئ مستودعًا فارغًا على GitHub واتبع تعليماته لتنفيذ `git remote add origin …` و`git push -u origin main`.
2. سجّل الدخول إلى Vercel بحساب GitHub واختر **Add New… → Project**.
3. استورد المستودع `watchlist`. يكتشف Vercel **Vite** ويملأ أمر البناء (`vite build`، وهو ما يشغّله `npm run build`) ومجلد المخرجات (`dist`). اتركهما كما هما.
4. انقر **Deploy**. في غضون دقيقة تحصل على رابط إنتاج مثل `watchlist-yourname.vercel.app`.

من الآن فصاعدًا، المستودع هو من يقود النشر:

- كل push إلى `main` يُبنى ويُنشر إلى **الإنتاج**.
- كل push إلى branch آخر، وكل pull request، يحصل على **preview deployment** (نسخة معاينة) خاصة به برابط فريد، يُنشر كتعليق على الـ pull request.

نُسخ المعاينة تغيّر طريقة عملك. تعيد تنسيق شريط الفلترة على branch، وتفتح pull request، وتنقر رابط المعاينة على هاتفك قبل الـ merge. ولا يرى الإنتاج أي عمل غير مكتمل.

:::figure من git push إلى رابط حيّ
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">الـ git push إلى GitHub يُطلق بناءً على Vercel يشغّل vite build وينتج dist. الـ push إلى main يذهب إلى رابط الإنتاج، والـ push إلى الـ branches الأخرى يحصل على رابط معاينة.</title>
  <rect class="d-box" x="10" y="80" width="120" height="56" rx="10"/>
  <text class="d-code" x="70" y="113" text-anchor="middle">git push</text>
  <rect class="d-box" x="165" y="80" width="120" height="56" rx="10"/>
  <text class="d-label" x="225" y="113" text-anchor="middle">GitHub</text>
  <rect class="d-box-primary" x="320" y="70" width="160" height="76" rx="10"/>
  <text class="d-label-strong" x="400" y="100" text-anchor="middle">بناء Vercel</text>
  <text class="d-code" x="400" y="124" text-anchor="middle">vite build → dist</text>
  <rect class="d-box-success" x="530" y="30" width="160" height="56" rx="10"/>
  <text class="d-label" x="610" y="54" text-anchor="middle">main ← الإنتاج</text>
  <text class="d-label-muted" x="610" y="74" text-anchor="middle">رابط .vercel.app</text>
  <rect class="d-box-accent" x="530" y="130" width="160" height="56" rx="10"/>
  <text class="d-label" x="610" y="154" text-anchor="middle">branch ← معاينة</text>
  <text class="d-label-muted" x="610" y="174" text-anchor="middle">رابط فريد لكل push</text>
  <path class="d-arrow" d="M130 108 L163 108" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M285 108 L318 108" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 95 L528 62" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M480 122 L528 154" marker-end="url(#arrow)"/>
</svg>
:::

## الخيار 2: Vercel CLI

إن كنت تفضّل النشر من الطرفية، أو لم يكن الكود على GitHub بعد:

```bash
npm install -g vercel
vercel          # first run: log in, link the project, deploy a preview
vercel --prod   # deploy to production
```

أول تشغيل لـ `vercel` يطرح بضعة أسئلة (النطاق، واسم المشروع، والمجلد) ويكتشف Vite بالطريقة نفسها. وينشئ مجلد `.vercel` يربط مجلدك بالمشروع؛ أبقِه خارج Git. الـ CLI مفيد للتجارب السريعة. أمّا للمشروع الذي ستواصل العمل عليه، فالتكامل مع Git أفضل، لأن النشر يحدث من دون أن يحتاج أحد إلى تذكّر تشغيل أمر.

## متغيّرات البيئة

عاجلًا أم آجلًا ستحتاج إلى إعدادات، مثل الرابط الأساسي لـ API. لا يكشف Vite متغيّرات البيئة لكودك إلا إذا بدأت بـ `VITE_`:

```js
const apiUrl = import.meta.env.VITE_API_URL;
```

محليًا، ضعها في ملف `.env.local` (مستثنى من Git أصلًا في قالب Vite). وعلى Vercel، أضفها من **Project Settings → Environment Variables**، ثم أعد النشر، لأن Vite يضمّن القيم حين يبني.

:::mistake الأسرار في متغيّرات VITE_
تُكتب متغيّرات `VITE_` داخل حزمة JavaScript كنص عادي. يستطيع أي أحد فتح DevTools وقراءتها. هذا مقبول لرابط API علني، وغير مقبول إطلاقًا لمفتاح API خاص. الأسرار مكانها خادم، مثل serverless function، ولا مكان لها أبدًا في كود المتصفّح.
:::

## التوجيه على استضافة ثابتة

لـ Watchlist صفحة واحدة، فكل طلب هو لـ `/` ويقدّم Vercel الملف `index.html`. لكن إن أضفت لاحقًا توجيهًا في جهة المتصفّح باستخدام React Router، فإن رابطًا مثل `/watched` لا يوجد إلا داخل JavaScript الخاص بك. وتحديث الصفحة عليه يطلب من الخادم ملفًا اسمه `/watched` غير موجود، فتحصل على 404. والإصلاح rewrite يقدّم هيكل التطبيق لأي مسار:

```json title=vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

الملفات الحقيقية في `dist/`، مثل ملفات JavaScript وCSS، ما زالت تُقدَّم بشكل طبيعي؛ والـ rewrite لا يُطبَّق إلا حين لا يطابق أي ملف.

:::tip افحص الموقع الحيّ كما يفعل المستخدم
افتح رابط الإنتاج على هاتفك، وأضف فيلمًا، وحدّث الصفحة، وتأكّد أنه ما زال موجودًا. الـ localStorage خاص بكل موقع، فقائمتك على localhost وقائمتك في الإنتاج منفصلتان. هذا متوقّع، وليس خطأ.
:::

صار Watchlist حيًّا على الإنترنت. في الدرس الأخير تنظر إلى ما تعلّمته، وتخطّط لما تتعلّمه بعد ذلك.
