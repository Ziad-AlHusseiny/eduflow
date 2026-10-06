---
summary: أنشئ مشروع React 19 باستخدام Vite، وشغّل خادم التطوير، وتتبّع كيف ترتبط index.html وmain.jsx وApp.jsx لتعرف أين يذهب كل تعديل.
takeaways:
  - "الأمر `npm create vite@latest watchlist -- --template react` ينشئ مشروع React جاهزًا، و`npm run dev` يشغّله على localhost:5173 مع تحديث فوري."
  - يحمّل المتصفّح index.html، الذي يحمّل src/main.jsx، الذي يركّب الـ component المسمّى App داخل الـ div ذي المعرّف root.
  - "الأمر `npm run build` يكتب موقعًا ثابتًا محسّنًا في dist/، و`npm run preview` يعرض هذه النسخة محليًا."
  - يعمل StrictMode على رسم الـ components مرتين وتشغيل الـ effects مرتين أثناء التطوير فقط، ليكشف الأخطاء مبكرًا.
further:
  - title: Getting Started (Vite)
    url: https://vite.dev/guide/
  - title: Build a React app from Scratch
    url: https://react.dev/learn/build-a-react-app-from-scratch
  - title: StrictMode reference
    url: https://react.dev/reference/react/StrictMode
quiz:
  - q: شغّلت `npm create vite@latest watchlist --template react` باستخدام npm 10، ومع ذلك طلب منك Vite اختيار إطار عمل. لماذا؟
    options:
      - text: أُزيل القالب `react` من الإصدارات الحديثة من Vite.
        why: القالب `react` ما زال موجودًا، إلى جانب `react-ts` و`react-compiler` وغيرهما.
      - text: لا يقبل Vite القوالب إلا إذا كنت داخل مجلد مشروع موجود.
        why: اسم المشروع والقالب يعملان معًا من أي مجلد، وVite ينشئ المجلد الجديد بنفسه.
      - text: لا يستطيع npm 10 تشغيل أوامر `create`، فيُسقَط الخيار بصمت.
        why: يشغّل npm أوامر `create` بلا مشكلة. هو فقط يعامل الخيارات غير المفصولة على أنها خياراته الخاصة.
      - text: ابتلع npm الخيار `--template` على أنه خيار خاص به؛ تحتاج إلى `--` قبله حتى يصل إلى create-vite.
        why: صحيح. مع npm 7 وما بعده، يمرّر الأمر `npm create vite@latest watchlist -- --template react` كل ما بعد `--` إلى أداة الإنشاء.
    answer: 3
  - q: أين تربط React تطبيقك بالصفحة فعليًا في مشروع Vite؟
    options:
      - text: في src/main.jsx، حيث يرسم `createRoot(document.getElementById('root'))` العنصر `<App />`.
        why: صحيح. main.jsx هو الـ module المدخل؛ يجد الـ div الجذر من index.html ويسلّمه إلى React.
      - text: في index.html، من خلال عنصر مخصّص اسمه `<react-app>`.
        why: لا يحتوي index.html إلا على `<div id="root">` عادي ووسم script من نوع module. ربط React نفسه يحدث في main.jsx.
      - text: في vite.config.js، من خلال الـ plugin المسمّى `react()`.
        why: يعلّم هذا الـ plugin أداة Vite كيف تترجم JSX ويفعّل التحديث السريع، لكنه لا يحدّد أين يُرسم تطبيقك.
    answer: 0
  - q: أثناء التطوير، يطبع `console.log` في أعلى الـ component المسمّى App مرتين عند التحميل، بينما يطبع مرة واحدة في نسخة الإنتاج. ما الذي يحدث؟
    options:
      - text: الـ hot module replacement في Vite يحمّل كل module مرتين.
        why: الـ HMR يستبدل الـ modules المتغيّرة بعد التعديل، ولا يشغّل كل component مرتين عند التحميل الأول.
      - text: في الـ component خطأ يجعله يُرسم في حلقة لا تنتهي.
        why: الحلقة كانت ستطبع أكثر بكثير من مرتين، وغالبًا ترمي الخطأ «Too many re-renders».
      - text: يرسم StrictMode الـ components مرتين عمدًا أثناء التطوير ليكشف كود الـ render غير النقي.
        why: صحيح. إنه فحص خاص بالتطوير فقط، ونسخة الإنتاج ترسم مرة واحدة.
      - text: يرسم React 19 كل component مرتين دائمًا قبل أن يعرض النتيجة.
        why: الرسم المزدوج يحدث فقط تحت StrictMode أثناء التطوير، لا في الإنتاج.
    answer: 2
  - q: تريد أن ترى بالضبط ما سيحمّله المستخدمون قبل النشر. أيّ تسلسل أوامر يناسب ذلك؟
    options:
      - text: شغّل `npm run dev` وافتح تبويب Network.
        why: خادم التطوير يقدّم ملفات المصدر غير المجمّعة مع أدوات خاصة بالتطوير، وهذا ليس ما سيُنشر.
      - text: شغّل `npm run build` ثم `npm run preview`.
        why: صحيح. الأمر build يكتب الموقع المحسّن في dist/، والأمر preview يعرض هذا المجلد محليًا لتتنقّل فيه.
      - text: افتح index.html مباشرة من Finder أو Explorer.
        why: فتح الملف عبر file:// يتجاوز Vite تمامًا؛ لن يُترجم JSX أبدًا وستبقى الصفحة فارغة.
    answer: 1
---

مشروع React يحتاج إلى أكثر من React. المتصفّحات لا تفهم JSX، وكودك مقسّم إلى عشرات الـ modules، وأنت تريد أن تتحدّث الصفحة لحظة حفظ الملف. أداة البناء تتولّى كل ذلك. في 2026 الخيار الافتراضي لتطبيق React يعمل في المتصفّح هو **Vite**: يبدأ في أقل من ثانية، ويحدّث المتصفّح عند الحفظ، وينتج نسخة صغيرة محسّنة حين تكون جاهزًا للنشر.

## أنشئ المشروع

تحقّق أولًا من إصدار Node.js. يحتاج Vite الحالي (7 و8) إلى Node 20.19 أو أحدث، أو 22.12 أو أحدث؛ وعمليًا ثبّت إصدار LTS حاليًا (22 أو 24)، لأن دعم Node 20 انتهى في أبريل 2026.

```bash
node -v
# v24.x or v22.x: a current LTS release
```

ثم أنشئ مشروع Watchlist:

```bash
npm create vite@latest watchlist -- --template react
cd watchlist
npm install
npm run dev
```

الـ `--` مهمّ هنا. هو يقول لـ npm «كل ما بعدي يخصّ الأداة التي أشغّلها»، فيصل `--template react` إلى create-vite بدل أن يبتلعه npm. يعطيك `@latest` دائمًا أحدث إصدار رئيسي من Vite (وهو Vite 8 وقت كتابة الدرس)، وكل ما في هذه الدورة يعمل بالطريقة نفسها على Vite 7 أو 8. وقد تعرض الإصدارات الحديثة من create-vite أن تثبّت الاعتماديات وتشغّل الخادم عنك؛ لا بأس بالموافقة.

تطبع الطرفية رابطًا محليًا: `http://localhost:5173/`. افتحه وسترى صفحة البداية الخاصة بـ Vite + React مع زر عدّاد.

:::tip اختيار القالب
القالب `react` يعطيك JavaScript عادية، وهي ما تستخدمه هذه الدورة لتركّز على React نفسها. والقالب `react-ts` هو نفسه مع TypeScript، أمّا `react-compiler` فيضيف React Compiler الاختياري. يمكنك الانتقال إلى TypeScript لاحقًا من دون إعادة كتابة منطق الـ components.
:::

## كيف ترتبط القطع ببعضها

افتح المجلد في محرّرك. معظم الملفات إعدادات لن تلمسها كثيرًا. ثلاثة ملفات فقط تهمّ الآن، وهي تشكّل سلسلة واحدة.

:::figure من index.html إلى الـ component المسمّى App
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">يحمّل المتصفّح index.html، الذي يحتوي على div جذر ووسم script من نوع module يشير إلى src/main.jsx. يستدعي main.jsx الدالة createRoot على الـ div الجذر ويرسم App من src/App.jsx.</title>
  <rect class="d-box" x="20" y="40" width="190" height="150" rx="12"/>
  <text class="d-label-strong" x="115" y="70" text-anchor="middle">index.html</text>
  <text class="d-code" x="115" y="110" text-anchor="middle">&lt;div id="root"&gt;</text>
  <text class="d-code" x="115" y="140" text-anchor="middle">&lt;script type=</text>
  <text class="d-code" x="115" y="160" text-anchor="middle">"module" src=…&gt;</text>
  <rect class="d-box-primary" x="250" y="40" width="190" height="150" rx="12"/>
  <text class="d-label-strong" x="345" y="70" text-anchor="middle">src/main.jsx</text>
  <text class="d-code" x="345" y="110" text-anchor="middle">createRoot(root)</text>
  <text class="d-code" x="345" y="140" text-anchor="middle">.render(&lt;App /&gt;)</text>
  <rect class="d-box-accent" x="480" y="40" width="180" height="150" rx="12"/>
  <text class="d-label-strong" x="570" y="70" text-anchor="middle">src/App.jsx</text>
  <text class="d-code" x="570" y="110" text-anchor="middle">export default</text>
  <text class="d-code" x="570" y="135" text-anchor="middle">function App()</text>
  <path class="d-arrow" d="M210 150 L248 150" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M440 120 L478 120" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="340" y="230" text-anchor="middle">تحميل ← تركيب ← رسم</text>
</svg>
:::

يقع **index.html** في جذر المشروع، لا داخل مجلد `public`. يعامله Vite على أنه نقطة الدخول. يحتوي على `<div id="root"></div>` فارغ ووسم script واحد: `<script type="module" src="/src/main.jsx"></script>`.

أمّا **src/main.jsx** فهو المكان الذي تتسلّم فيه React زمام الأمور:

```jsx title=src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

تأخذ `createRoot` عقدة DOM حقيقية وتُرجع جذرًا تديره React من تلك اللحظة. كل ما داخل `#root` أصبح ملكًا لـ React؛ لا تغيّره بكود `document.querySelector` من عندك.

و**src/App.jsx** هو أول component لك، والمكان الذي ستقضي فيه معظم وقتك. استبدل محتواه بشيء من عندك لتتأكّد أن السلسلة تعمل:

```jsx title=src/App.jsx
export default function App() {
  return <h1>My Watchlist</h1>;
}
```

احفظ، وسيتحدّث المتصفّح من دون إعادة تحميل. هذا هو الـ hot module replacement (HMR) مع React Fast Refresh، ويجهّزه الـ plugin المسمّى `@vitejs/plugin-react` في `vite.config.js`. يمكنك أيضًا حذف `src/App.css` وإفراغ `src/index.css`؛ ستنسّق التطبيق كما يجب لاحقًا.

## StrictMode باختصار

يضيف `<StrictMode>` فحوصًا إضافية أثناء التطوير. فهو يرسم كل component مرتين ويشغّل الـ effects مرتين (تركيب، ثم تنظيف، ثم تركيب من جديد) ليكشف الكود الذي لا يحتمل التكرار. إذا رأيت سطرًا يُطبع مرتين أثناء التطوير، فهذا هو السبب. لا يفعل شيئًا في الإنتاج، لذا اتركه مفعّلًا. ستظهر أهميته حين تصل إلى الـ effects في القسم 3.

:::mistake فتح index.html مباشرة
النقر المزدوج على `index.html` يفتحه برابط `file://`. لن يترجم أحدٌ JSX، وسيفشل تحميل الـ module، وستحصل على صفحة فارغة. افتح دائمًا الرابط الذي يطبعه `npm run dev`.
:::

## السكربتات الأربعة

يعرّف `package.json` الأوامر التي ستستخدمها:

| الأمر | ماذا يفعل |
|---|---|
| `npm run dev` | يشغّل خادم التطوير مع تحديثات فورية |
| `npm run build` | يجمّع التطبيق ويصغّره داخل `dist/` |
| `npm run preview` | يعرض `dist/` محليًا لتفحص النسخة الحقيقية |
| `npm run lint` | يشغّل أداة الفحص (linter)، ومنها قواعد الـ hooks |

بقية المجلد أدوار مساندة. يسرد `package.json` اعتمادياتك (`react` و`react-dom`) وأدوات التطوير (`vite` و`@vitejs/plugin-react` وأداة فحص). و`node_modules/` هو المكان الذي يضعها فيه `npm install`؛ حجمه كبير، ويُعاد بناؤه من `package.json` في أي وقت، ولا يدخل Git أبدًا. ويحتوي `public/` على ملفات تُقدَّم كما هي من جذر الموقع، مثل الـ favicon. أمّا ملف إعدادات أداة الفحص فيختلف بحسب إصدار القالب: القوالب الحالية تستخدم Oxlint (`.oxlintrc.json`)، والقوالب الأقدم وخيار ESLint تستخدم `eslint.config.js`.

أمّا `dist/` فمخرجات مولَّدة. لا تعدّل ملفاته أبدًا، ولا تضفه إلى Git؛ ملف `.gitignore` في المشروع الجاهز يستثنيه أصلًا. وحين تنشر في القسم الأخير، سيشغّل Vercel الأمر `npm run build` نيابةً عنك.

مشروعك يعمل الآن، وتعرف أين تُركَّب React. إذا دخل خادم التطوير يومًا في حالة غريبة بعد تثبيت حزمة أو إعادة تسمية ملفات، أوقفه بـ Ctrl+C وشغّل `npm run dev` من جديد. إعادة التشغيل تستغرق ثانية وتحلّ مشاكل أكثر مما ينبغي. في الدرس التالي تكتب أول component حقيقي لك في `App.jsx` وتقسّم Watchlist إلى قطع قابلة لإعادة الاستخدام.
