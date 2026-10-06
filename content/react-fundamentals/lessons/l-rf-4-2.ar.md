---
summary: أضف Tailwind CSS v4 إلى مشروع Vite عبر الـ plugin الرسمي، ونسّق Watchlist بالـ utility classes ومتغيّرات الحالة (variants)، وخصّص السمة داخل CSS.
takeaways:
  - يحتاج Tailwind v4 إلى `npm install tailwindcss @tailwindcss/vite`، والـ plugin داخل vite.config.js، و`@import "tailwindcss";` في ملف CSS؛ ولا حاجة إلى ملف إعدادات.
  - كل utility class تقابل تصريح CSS واحدًا على مقياس مشترك، مثل `p-4` لحشو مقداره 1rem، و`text-slate-600` للون من لوحة الألوان.
  - البادئات تطبّق الـ class بشرط، مثل `md:` فوق نقطة توقّف، و`hover:` عند التمرير، و`dark:` في الوضع الداكن، و`aria-pressed:` حين تكون تلك الخاصية true.
  - يعثر Tailwind على الـ classes بمسح ملفاتك كنص، لذا اكتب دائمًا أسماء classes كاملة ولا تبنِها أبدًا بدمج النصوص.
  - خصّص الألوان والخطوط وغيرها من الـ tokens بمتغيّرات CSS داخل كتلة `@theme`.
further:
  - title: Installing Tailwind CSS with Vite
    url: https://tailwindcss.com/docs/installation/using-vite
  - title: Styling with utility classes
    url: https://tailwindcss.com/docs/styling-with-utility-classes
  - title: Detecting classes in source files
    url: https://tailwindcss.com/docs/detecting-classes-in-source-files
  - title: Theme variables
    url: https://tailwindcss.com/docs/theme
quiz:
  - q: ثبّتّ الحزمتين وأضفت `@import "tailwindcss";` إلى `src/index.css`، لكن لا تأثير لأي utility class. ما الخطوة الناقصة على الأرجح؟
    options:
      - text: إنشاء ملف `tailwind.config.js`.
        why: يعمل Tailwind v4 من دون ملف إعدادات؛ فهو يكتشف ملفات المصدر تلقائيًا.
      - text: إضافة ملف إعدادات لـ PostCSS.
        why: مع Vite، يحلّ الـ plugin المسمّى `@tailwindcss/vite` محلّ إعداد PostCSS. لا تحتاج إلى الاثنين.
      - text: إعادة تشغيل الحاسوب.
        why: إعادة تشغيل خادم التطوير قد تفيد بعد تغيير الإعدادات، لكن الحاسوب ليس المشكلة.
      - text: إضافة `tailwindcss()` من `@tailwindcss/vite` إلى مصفوفة `plugins` في vite.config.js.
        why: صحيح. من دون الـ plugin يعامل Vite سطر الاستيراد كـ CSS عادي ولا يولّد الـ utilities أبدًا.
    answer: 3
  - q: "يبني component اسم class بالشكل `` `text-${color}-600` ``، حيث `color` قيمتها 'red' أو 'green'. في الإنتاج لا لون للنص. لماذا؟"
    options:
      - text: يمسح Tailwind الملفات كنص عادي، فلا يرى `text-red-600` أو `text-green-600` مكتوبة كاملة، ولا يولّدها أبدًا.
        why: "صحيح. اربط القيم بأسماء classes كاملة بدلًا من ذلك، مثل `{ red: 'text-red-600', green: 'text-green-600' }[color]`."
      - text: الـ template literals غير مسموح بها في `className`.
        why: أي نص يعمل في className. المشكلة أن Tailwind لا يستطيع رؤية اسم الـ class النهائي حين يبني الـ CSS.
      - text: الدرجة 600 غير موجودة للأحمر والأخضر.
        why: لكل لون في اللوحة الافتراضية درجات من 50 إلى 950، بما فيها 600.
      - text: نسخ الإنتاج تحذف كل classes الـ Tailwind القادمة من الـ props.
        why: لا يعرف Tailwind شيئًا عن الـ props. إنه يحتفظ فقط بالـ classes التي تظهر كاملة في مكان ما من ملفات المصدر.
    answer: 0
  - q: "ماذا يفعل `className=\"bg-white md:bg-slate-100 dark:bg-slate-900\"`؟"
    options:
      - text: يطبّق الخلفيات الثلاث معًا، والأخيرة تفوز.
        why: الـ classes ذات البادئات لا تُطبَّق إلا تحت شروطها؛ إنها لا تتراكم ببساطة.
      - text: أبيض على الشاشات الصغيرة، وslate-100 من نقطة التوقّف md فما فوق، وslate-900 في الوضع الداكن.
        why: صحيح. بادئات نقاط التوقّف تبدأ من الجوّال (min-width)، و`dark:` تتبع تفضيل المستخدم لنظام الألوان افتراضيًا.
      - text: إنه غير صحيح؛ لا يمكنك استخدام إلا class خلفية واحد لكل عنصر.
        why: يمكنك الجمع بين ما تشاء من الـ classes؛ والـ variants موجودة تحديدًا لتكون للعنصر الواحد أنماط مختلفة في ظروف مختلفة.
    answer: 1
  - q: تضبط أزرار الفلترة لديك `aria-pressed`. ما أنظف طريقة لتنسيق الزر النشط باستخدام Tailwind؟
    options:
      - text: "احسب الـ class في JavaScript بالشكل `` `bg-${active ? 'indigo' : 'white'}-600` ``."
        why: هذا يبني اسم class ديناميكيًا، وهو ما لا يستطيع Tailwind اكتشافه. ولا حاجة إليه هنا أصلًا.
      - text: "استخدم `style={{ background: … }}` لأن Tailwind لا يستطيع التفاعل مع الـ state."
        why: لدى Tailwind variants لهذا بالضبط. كما أن الأنماط المضمّنة تخسر التعامل مع التمرير والتركيز والوضع الداكن.
      - text: استخدم الـ variant المسمّى `aria-pressed:`، مثل `aria-pressed:bg-indigo-600 aria-pressed:text-white`.
        why: صحيح. يتبع التنسيق خاصية إمكانية الوصول التي ضبطتها أصلًا، فلا يمكن أن تختلف الحالة المرئية عمّا تعلنه الـ screen readers.
    answer: 2
---

Watchlist يعمل، لكنه يبدو كأنه من عام 1998. يمكنك كتابة stylesheet، وكثير من التطبيقات الممتازة تفعل ذلك. لكن هذه الدورة تستخدم **Tailwind CSS**، لأنه شائع جدًا في مشاريع React التي ستنضمّ إليها، ولأن التنسيق داخل الـ JSX مباشرة يُبقي الـ components مكتفية بذاتها: ملف `MovieItem` يحمل الـ markup والسلوك والمظهر معًا.

Tailwind مجموعة كبيرة من الـ utility classes الصغيرة، كلٌّ منها تفعل شيئًا واحدًا: `p-4` تضيف حشوًا، و`rounded-lg` تدوّر الزوايا، و`text-slate-600` تضبط لونًا. تركّبها داخل `className`. ويمسح Tailwind ملفاتك، ويعثر على الـ classes التي استخدمتها، ويولّد stylesheet لا يحتوي إلا عليها.

## ثبّته

لـ Tailwind v4 plugin رسمي لـ Vite، والإعداد ثلاث خطوات. ثبّت الحزم:

```bash
npm install tailwindcss @tailwindcss/vite
```

أضف الـ plugin إلى إعدادات Vite:

```js title=vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

واستورد Tailwind في أعلى ملف الأنماط الرئيسي، الذي يستورده `main.jsx` أصلًا:

```css title=src/index.css
@import "tailwindcss";
```

هذا كل شيء. لا يوجد `tailwind.config.js` ولا إعدادات PostCSS في v4 افتراضيًا. يعثر Tailwind على ملفات المصدر بنفسه. ويعيد Vite تشغيل خادم التطوير تلقائيًا حين تحفظ `vite.config.js`؛ وإن لم تظهر الأنماط بعد ذلك، فأوقفه وشغّل `npm run dev` من جديد.

:::note الدروس القديمة
إذا رأيت `@tailwind base; @tailwind components; @tailwind utilities;` أو مصفوفة `content: [...]` في ملف إعدادات، فهذا Tailwind v3. الأفكار تنتقل، لكن الإعداد أعلاه هو الحالي.
:::

## قراءة الـ utility classes

هذا هو الهيكل الخارجي لـ Watchlist:

```jsx title=src/App.jsx
<main className="mx-auto max-w-xl px-4 py-10">
  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Watchlist</h1>
  <p className="mt-1 text-sm text-slate-500">{left} to watch</p>
  {/* …form, filters, list */}
</main>
```

الأسماء مختصرة لكنها منهجية، وبعد يوم واحد ستقرؤها بسرعة قراءة CSS:

- **المسافات** تستخدم مقياسًا كل خطوة فيه 0.25rem: `p-4` حشو مقداره 1rem، و`mt-1` هامش علوي مقداره 0.25rem، و`px-4` حشو أفقي. و`mx-auto` يوسّط الكتلة.
- **الأحجام والخطوط**: `max-w-xl` تحدّ العرض، و`text-3xl` تضبط حجم الخط، و`font-bold` سُمكه.
- **الألوان** تأتي من لوحة بدرجات من 50 إلى 950: `text-slate-500` و`bg-indigo-600`.

ويستطيع محرّرك المساعدة: إضافة Tailwind CSS IntelliSense الرسمية لـ VS Code تكمل أسماء الـ classes تلقائيًا وتعرض الـ CSS الذي تنتجه كل واحدة حين تمرّر المؤشّر عليها.

## الـ variants: الشروط في بادئة

ضع بادئة قبل الـ class لتطبيقه تحت شرط فقط:

```jsx title=src/components/MovieItem.jsx
<li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
  <span className={movie.watched ? 'flex-1 text-slate-400 line-through' : 'flex-1 text-slate-900 dark:text-slate-100'}>
    {movie.title}
  </span>
  <button
    aria-pressed={movie.watched}
    onClick={() => onToggle(movie.id)}
    className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 aria-pressed:border-indigo-600 aria-pressed:bg-indigo-600 aria-pressed:text-white"
  >
    {movie.watched ? 'Watched' : 'Mark watched'}
  </button>
</li>
```

- تتعامل `hover:` و`focus-visible:` مع حالات التفاعل. امنح العناصر التفاعلية دائمًا نمط تركيز مرئيًا لمستخدمي لوحة المفاتيح.
- تُطبَّق `dark:` حين يكون نظام المستخدم في الوضع الداكن (تتبع `prefers-color-scheme` افتراضيًا).
- تُطبَّق `aria-pressed:` حين تكون `aria-pressed` في العنصر true. فيتبع مظهر زر التبديل الخاصية نفسها التي تعلنها الـ screen readers، ولا يمكن أن يختلفا.
- نقاط التوقّف تبدأ من الجوّال: `sm:` و`md:` و`lg:` تُطبَّق من ذلك العرض **فما فوق**، لذا اكتب تخطيط الهاتف أولًا، وأضف البادئات للشاشات الأكبر.

أمّا الشروط المعتمدة على الـ state في React، مثل `movie.watched` على الـ span، فهي معامل ثلاثي عادي يختار بين نصّين كاملين من الـ classes.

:::mistake بناء أسماء الـ classes من قطع
يبدو `` className={`text-${color}-600`} `` ذكيًا لكنه يفشل في الإنتاج. يقرأ Tailwind ملفاتك كنص، ولا يولّد إلا الـ classes التي يجدها مكتوبة كاملة؛ و`text-red-600` لا تظهر أبدًا، فلا تُولَّد أبدًا. اربط القيم بـ classes كاملة بدلًا من ذلك: `const tone = { ok: 'text-green-600', error: 'text-red-600' }[status];`.
:::

## الـ design tokens الخاصة بك

خصّص السمة داخل CSS باستخدام `@theme`. كل متغيّر يصبح utilities تلقائيًا:

```css title=src/index.css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.62 0.19 285);
  --color-brand-600: oklch(0.55 0.21 285);
  --font-display: "Inter", system-ui, sans-serif;
}
```

الآن تعمل `bg-brand-600` و`text-brand-500` و`font-display` كأنها classes مدمجة. عرّف عددًا قليلًا من الـ tokens للون علامتك التجارية وخطوطك، بدل أن تنثر قيمًا عابرة مثل `bg-[#6d28d9]` في أنحاء الـ components.

## المقايضة

قوائم الـ classes الطويلة هي الثمن الصريح. قد يحمل زر منسَّق خمسة عشر class. والحلّ ليس إخفاءها في CSS باستخدام `@apply`؛ بل ما تدرّبت عليه طوال الدورة: استخرج component. الـ component المسمّى `Button` يحمل هذه الـ classes الخمسة عشر في مكان واحد، وفي كل مكان آخر تكتب `<Button>`. الـ components هي وحدة إعادة الاستخدام في React، للأنماط تمامًا كما للسلوك.

Tailwind ليس الجواب الجيد الوحيد. الـ CSS Modules (مدمجة في Vite: سمِّ الملف `MovieItem.module.css` واستورده) تعطيك أسماء classes محصورة النطاق مع CSS عادي، وكثير من الفرق تفضّلها. والمهارات تنتقل في الحالتين: markup دلالي، ومقياس متّسق للمسافات والألوان، وحالات تركيز مرئية، وتخطيط يعمل على الهاتف أولًا.

:::tip استخدم القيم الافتراضية أولًا
مقياس المسافات ولوحة الألوان في Tailwind مصمّمان بعناية. الالتزام بهما يعطيك مظهرًا متّسقًا مجانًا. والجأ إلى القيم المخصّصة فقط حين يتطلّبها التصميم فعلًا.
:::

صار Watchlist يبدو كمنتج حقيقي. بقي شيء واحد: وضعه على الإنترنت، وهذا موضوع الدرس التالي.
