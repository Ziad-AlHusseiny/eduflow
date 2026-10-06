---
summary: استخدم useEffect لإبقاء الـ state في React متزامنًا مع أنظمة خارجها، واكتب الاعتماديات ودوال التنظيف بشكل صحيح، وتعرّف على الحالات الكثيرة التي لا تحتاج فيها إلى effect أصلًا.
takeaways:
  - يعمل الـ effect بعد أن تحدّث React الشاشة، ووظيفته التزامن مع شيء خارج React، مثل عنوان المستند أو localStorage أو المؤقّتات أو الاشتراكات.
  - تسرد مصفوفة الاعتماديات كل قيمة من الـ component يقرؤها الـ effect؛ وتعيد React تشغيل الـ effect حين تتغيّر إحداها.
  - أرجِع دالة تنظيف (cleanup) تلغي ما فعله الـ effect؛ تشغّلها React قبل التشغيل التالي وعند إلغاء التركيب.
  - في وضع التطوير، يشغّل StrictMode كل effect، ثم دالة تنظيفه، ثم الـ effect من جديد، ليثبت أن التنظيف يعمل.
  - إذا كان يمكن حساب القيمة من الـ props أو الـ state، أو كان التغيير ناتجًا عن إجراء محدّد من المستخدم، فلا تحتاج إلى effect.
further:
  - title: Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects
  - title: You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
  - title: useEffect reference
    url: https://react.dev/reference/react/useEffect
quiz:
  - q: "تُحفظ `visibleMovies` في الـ state وتُحدَّث بـ `useEffect(() => setVisibleMovies(movies.filter(…)), [movies, filter])`. ما النهج الأفضل؟"
    options:
      - text: "احسبها أثناء الـ render: `const visibleMovies = movies.filter(…)`."
        why: صحيح. إنها بيانات مشتقّة. نسخة الـ effect ترسم مرة ببيانات قديمة، ثم مرة أخرى بالبيانات الصحيحة، وتضيف state قد ينحرف.
      - text: أضف `visibleMovies` إلى مصفوفة الاعتماديات أيضًا.
        why: هذا يجعل الـ effect يعيد التشغيل كلما ضبط مخرجاته بنفسه، فيفتح الباب لحلقة لا نهائية. الحلّ الحقيقي حذف الـ effect.
      - text: انقل الفلترة إلى `setTimeout` داخل الـ effect.
        why: تأخير العمل يطيل عمر الـ render القديم. لا شيء هنا يحتاج إلى effect.
    answer: 0
  - q: في وضع التطوير، effect يطبع «subscribed» وله دالة تنظيف تطبع «unsubscribed»، يطبع عند تحميل الصفحة «subscribed, unsubscribed, subscribed». ما الذي يحدث؟
    options:
      - text: مصفوفة الاعتماديات غائبة، فيعمل الـ effect بعد كل render.
        why: من دون مصفوفة يُعاد تشغيل الـ effect بعد كل re-render، لكن تحميل الصفحة العادي فيه render واحد، فلا يفسّر ذلك وحده تنظيفًا مباشرًا بعد التشغيل الأول.
      - text: يُرسم الـ component مرتين بسبب خطأ في الأب.
        why: هذا التسلسل بعينه مقصود، ولا يحدث إلا في وضع التطوير.
      - text: يشغّل React 19 الـ effects مرتين دائمًا، في الإنتاج أيضًا.
        why: الدورة الإضافية فحص خاص بالتطوير من StrictMode. في الإنتاج يعمل الـ effect مرة واحدة.
      - text: يركّب StrictMode الـ component ثم يلغي تركيبه ثم يركّبه من جديد أثناء التطوير، ليتحقّق أن التنظيف يلغي الـ effect بالكامل.
        why: صحيح. إذا تصرّف تطبيقك بالطريقة نفسها بعد هذه الدورة، فدالة التنظيف صحيحة. وإن انكسر، فالخطأ كان سيظهر في الإنتاج عاجلًا أم آجلًا.
    answer: 3
  - q: |
      ما الخطأ في هذا الـ effect؟
      ```jsx
      useEffect(() => {
        document.title = `${left} to watch`;
      }, []);
      ```
    options:
      - text: "لا يمكن ضبط `document.title` من React."
        why: ضبط عنوان المستند استخدام كلاسيكي وصحيح للـ effect؛ إنه API من المتصفّح خارج React.
      - text: يقرأ `left` لكنه لا يسردها، فيُضبط العنوان مرة واحدة ولا يتحدّث أبدًا حين تتغيّر `left`.
        why: صحيح. المصفوفة الفارغة تعني «شغّل بعد الـ render الأول فقط». اسرد كل قيمة يقرؤها الـ effect، `[left]`، وستذكّرك قاعدة الـ lint بذلك.
      - text: يحتاج إلى دالة تنظيف وإلا رمت React خطأ.
        why: التنظيف اختياري. كثير من الـ effects، مثل هذا، لا يوجد ما تلغيه.
      - text: الـ template literals لا تعمل داخل الـ effects.
        why: الـ effect دالة عادية؛ أي JavaScript تعمل بداخلها.
    answer: 1
  - q: بعد إضافة فيلم تريد عرض رسالة «Movie added». أين يجب أن يوضع الكود الذي يعرضها؟
    options:
      - text: في effect يراقب `movies` ويعرض الرسالة كلما تغيّرت.
        why: تتغيّر القائمة أيضًا حين تحذف أفلامًا أو تبدّل حالتها أو تحمّلها، فستظهر الرسالة في أوقات خاطئة.
      - text: في effect بمصفوفة اعتماديات فارغة.
        why: هذا يعمل مرة واحدة بعد الـ render الأول، قبل أن يضيف أحد أي فيلم بوقت طويل.
      - text: في معالج الإرسال، في المكان نفسه الذي يُضاف فيه الفيلم.
        why: صحيح. الرسالة ناتجة عن إجراء محدّد من المستخدم، فمكانها معالج ذلك الإجراء، لا effect.
    answer: 2
---

حتى الآن، كان كل ما في الـ components متعلّقًا بـ React: props تدخل، وJSX يخرج، وتغييرات الـ state تُطلق الـ render. لكن Watchlist يحتاج أيضًا إلى لمس أشياء لا تديرها React. يجب أن يقول تبويب المتصفّح «2 to watch»، ويجب أن تنجو القائمة من تحديث الصفحة بحفظها في localStorage. لا شيء من هذا رسم. إنه **تزامن (synchronization)**: إبقاء شيء خارج React متوافقًا مع الـ state الخاص بك. وهذه وظيفة الـ effects.

## أول effect لك

```jsx title=src/App.jsx
import { useEffect, useState } from 'react';

export default function App() {
  const [movies, setMovies] = useState(INITIAL_MOVIES);
  const left = movies.filter((m) => !m.watched).length;

  useEffect(() => {
    document.title = `${left} to watch · Watchlist`;
  }, [left]);

  // …render the app
}
```

تأخذ `useEffect` دالة و**مصفوفة اعتماديات (dependency array)**. ترسم React الـ component، وتحدّث الشاشة، ثم تشغّل الدالة. وبعد مرّات الـ render اللاحقة، لا تشغّلها مجددًا إلا إذا تغيّر شيء في مصفوفة الاعتماديات منذ المرة السابقة. علّم فيلمًا كمُشاهَد، فتنتقل `left` من 2 إلى 1، ويتحدّث العنوان. اكتب في نموذج الإضافة، فلا تتغيّر `left`، ويُتخطّى الـ effect.

لمصفوفة الاعتماديات ثلاثة أشكال:

| ما تكتبه | متى يعمل الـ effect |
|---|---|
| `useEffect(fn, [a, b])` | بعد الـ render الأول، وكلما تغيّرت `a` أو `b` |
| `useEffect(fn, [])` | بعد الـ render الأول فقط |
| `useEffect(fn)` | بعد كل render |

وقاعدة ما يوضع في المصفوفة ليست خيارًا: **اسرد كل قيمة من الـ component يقرؤها الـ effect**، مثل الـ props والـ state والمتغيّرات المشتقّة منهما. وقاعدة الـ lint الخاصة بالاعتماديات في مشروع Vite (`react/exhaustive-deps` في Oxlint، و`react-hooks/exhaustive-deps` في ESLint) تتحقّق من ذلك نيابةً عنك. إذا أغفلت شيئًا، فسيظل الـ effect يستخدم قيمة قديمة، وهذا هو الخطأ في سؤال الاختبار الثالث.

## التنظيف

بعض الـ effects تبدأ شيئًا يجب إيقافه: مؤقّتًا، أو مستمع أحداث، أو اتصالًا. أرجِع دالة تلغيه:

```jsx
useEffect(() => {
  function handleKeyDown(e) {
    if (e.key === '/') focusSearch();
  }
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

تستدعي React دالة التنظيف قبل تشغيل الـ effect مجددًا، وحين يُزال الـ component من الشاشة. ومن دونها، سيضيف كل تركيب مستمعًا آخر، وسيعمل الضغط على «/» عدّة مرات.

:::figure دورة حياة الـ effect
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">بعد الـ render الأول والـ commit، يعمل الـ effect. وحين تتغيّر إحدى الاعتماديات، تعيد React الـ render، وتشغّل دالة التنظيف السابقة، ثم تشغّل الـ effect مجددًا. وحين يُلغى تركيب الـ component، تشغّل React دالة التنظيف مرة أخيرة.</title>
  <rect class="d-box" x="10" y="70" width="140" height="56" rx="10"/>
  <text class="d-label" x="80" y="103" text-anchor="middle">Render + commit</text>
  <rect class="d-box-primary" x="190" y="70" width="120" height="56" rx="10"/>
  <text class="d-label-strong" x="250" y="103" text-anchor="middle">Effect</text>
  <rect class="d-box" x="350" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="425" y="96" text-anchor="middle">تغيّرت الاعتماديات:</text>
  <text class="d-label" x="425" y="116" text-anchor="middle">re-render</text>
  <rect class="d-box-warn" x="540" y="70" width="150" height="56" rx="10"/>
  <text class="d-label" x="615" y="96" text-anchor="middle">التنظيف، ثم</text>
  <text class="d-label" x="615" y="116" text-anchor="middle">الـ Effect مجددًا</text>
  <path class="d-arrow" d="M150 98 L188 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M310 98 L348 98" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M500 98 L538 98" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M615 126 C 615 190, 425 190, 425 128" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="190" y="170" width="160" height="50" rx="10"/>
  <text class="d-label" x="270" y="200" text-anchor="middle">Unmount: تنظيف</text>
  <path class="d-arrow" d="M250 126 L260 168" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="560" y="210" text-anchor="middle">يتكرّر مع كل تغيير</text>
</svg>
:::

### لماذا يعمل مرتين في وضع التطوير

مع `<StrictMode>` (الموجود في `main.jsx` لديك)، تفعل React شيئًا غريبًا أثناء التطوير: تركّب الـ component، وتشغّل الـ effects، ثم تشغّل دوال تنظيفها فورًا كأنها تلغي التركيب، ثم تشغّل الـ effects مجددًا. إنه اختبار ضغط. إذا كانت دالة التنظيف تلغي الـ effect بشكل صحيح، فسيتصرّف التطبيق بالطريقة نفسها، ولن ترى إلا سطرًا إضافيًا في السجل. وإن لم تكن كذلك، كأن تنسى إزالة مستمع، فستلاحظ الآن بدل أن تلاحظ في الإنتاج. لا تحاول منع التشغيل المزدوج؛ بل أصلح دالة التنظيف.

## حفظ Watchlist في localStorage

حفظ الـ state هو الـ effect النموذجي: كلما تغيّرت `movies`، اكتبها في التخزين.

```jsx title=src/App.jsx
const STORAGE_KEY = 'watchlist.movies';

function loadMovies() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

export default function App() {
  const [movies, setMovies] = useState(loadMovies);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  }, [movies]);

  // …
}
```

هناك تفصيلتان مهمّتان. التحميل يحدث في **دالة التهيئة (initializer)**، `useState(loadMovies)`، لا في effect. تمرير الدالة (لا استدعاؤها) يعني أن React تقرأ التخزين للـ render الأول فقط، لا في كل render، فتظهر القائمة المحفوظة فورًا. أمّا التحميل في effect فسيرسم قائمة فارغة أولًا، وقد يكتب effect الحفظ تلك المصفوفة الفارغة فوق أفلامك المخزّنة. كما تستخدم `loadMovies` كتلة `try`/`catch`، لأن التخزين قد يكون محظورًا أو يحتوي على بيانات تالفة، والقيمة المعطوبة يجب ألّا تُسقط التطبيق كله.

## قد لا تحتاج إلى effect

الـ effects مخرج طوارئ، وأكثر أخطائها شيوعًا تأتي من استخدامها حيث لا حاجة إليها. قبل أن تكتب واحدًا، افحص هذه الحالات الثلاث.

**حساب شيء من الـ props أو الـ state.** القوائم المصفّاة والأعداد والنصوص المنسّقة تُحسب أثناء الـ render. تخزينها في الـ state ومزامنتها بـ effect يضيف render إضافيًا ببيانات قديمة، ومزيدًا من الـ state الذي قد ينحرف.

**الاستجابة لإجراء من المستخدم.** إذا كان يجب أن يُنفَّذ الكود لأن المستخدم نقر Add، فضعه في معالج الإرسال. الـ effect الذي يراقب `movies` لا يستطيع التمييز بين الإضافة والحذف وإعادة التحميل.

**إعادة ضبط الـ state حين يتغيّر prop.** بدل effect يمسح مسوّدة حين تتغيّر `movieId`، امنح الـ component قيمة key: `<NotesEditor key={movieId} />`. الـ key الجديد يعني component جديدًا بـ state جديد.

وما يتبقّى هو التزامن الحقيقي: واجهات المتصفّح، والتخزين، والمؤقّتات، والاشتراكات، واتصالات الشبكة. قائمة قصيرة، وهي القائمة الصحيحة.

:::mistake الحلقة اللانهائية
الـ effect الذي يضبط state موجودًا أيضًا في مصفوفة اعتمادياته، `useEffect(() => setCount(count + 1), [count])`، يعيد التشغيل بعد كل تحديث إلى الأبد. ويحدث الشيء نفسه حين يسرد effect يضبط state كائنًا أو مصفوفة تُنشأ أثناء الـ render كاعتمادية، لأنها قيمة جديدة في كل render. إذا تجمّدت الصفحة أو أبلغت React بالخطأ «Maximum update depth exceeded»، فابحث عن effect يغذّي اعتمادياته بنفسه.
:::

:::note جلب البيانات
يمكنك جلب البيانات داخل effect، لكن فعل ذلك بشكل صحيح يعني أن تتعامل بنفسك مع حالات السباق (race conditions) والتخزين المؤقّت وحالات التحميل. المشاريع الحقيقية تستخدم عادةً إطار عمل أو مكتبة مثل TanStack Query بدلًا من ذلك. سترى الخيارات في الدرس الأخير.
:::

بهذا يكتمل جوهر React: الـ components والـ props والـ state والأحداث والـ effects. في القسم التالي تجمع كل القطع في Watchlist المكتمل، وتنسّقه، وتنشره.
