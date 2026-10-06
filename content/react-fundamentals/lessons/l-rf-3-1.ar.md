---
summary: امنح الـ components ذاكرة باستخدام useState، وافهم الـ state كلقطة خاصة بكل render، واستخدم دوال التحديث للتحديثات المتتالية، واستبدل المصفوفات والكائنات بدل تعديلها.
takeaways:
  - "تُرجع `useState` القيمة الحالية ودالة setter؛ واستدعاء الـ setter يجدول re-render بالقيمة الجديدة."
  - كل render يرى لقطة ثابتة من الـ state، لذا فقراءة الـ state مباشرة بعد ضبطه تعطي القيمة القديمة.
  - استخدم دالة تحديث، `setCount((c) => c + 1)`، حين تعتمد القيمة التالية على السابقة.
  - لا تعدّل الـ state أبدًا؛ أنشئ مصفوفات وكائنات جديدة باستخدام الـ spread و`map` و`filter` حتى تلاحظ React التغيير.
  - استدعِ الـ hooks في المستوى الأعلى من الـ component، ولا تستدعها أبدًا داخل شروط أو حلقات أو دوال متداخلة.
further:
  - title: "State: A Component's Memory"
    url: https://react.dev/learn/state-a-components-memory
  - title: State as a Snapshot
    url: https://react.dev/learn/state-as-a-snapshot
  - title: Updating Arrays in State
    url: https://react.dev/learn/updating-arrays-in-state
  - title: useState reference
    url: https://react.dev/reference/react/useState
quiz:
  - q: |
      تبدأ `count` من 0. ماذا يعرض الزر بعد نقرة واحدة؟
      ```jsx
      function handleClick() {
        setCount(count + 1);
        setCount(count + 1);
        setCount(count + 1);
      }
      ```
    options:
      - text: "3"
        why: كل استدعاء يقرأ `count` من الـ render نفسه، حيث قيمتها 0. الاستدعاءات الثلاثة كلها تطلب 0 + 1.
      - text: "0"
        why: الـ state يتغيّر فعلًا، لكنه يتغيّر إلى 1، لا إلى 3.
      - text: خطأ، لأنك لا تستطيع استدعاء الـ setter إلا مرة واحدة في كل معالج.
        why: يمكنك استدعاء الـ setters كما تشاء. تجمعها React وتعيد الـ render مرة واحدة.
      - text: "1"
        why: صحيح. `count` لقطة قيمتها 0 طوال المعالج، فالاستدعاءات الثلاثة كلها تضبط 1. استخدم `setCount((c) => c + 1)` لتتراكم التحديثات.
    answer: 3
  - q: لماذا لا يعمل زر التبديل هذا؟ داخل الـ component يوجد `let watched = false;`، ومعالج الزر ينفّذ `watched = !watched;`.
    options:
      - text: لا يمكن قلب القيم المنطقية بـ `!` في React.
        why: المعامل `!` يعمل بلا مشكلة. المشكلة في مكان القيمة وفيما يُطلق الـ render.
      - text: يجب أن يُرجع المعالج القيمة الجديدة.
        why: القيم التي تُرجعها معالجات الأحداث تُتجاهل. لا بدّ من شيء يُخبر React بأن تعيد الـ render.
      - text: تغيير متغيّر محلي لا يُطلق re-render، والـ render التالي سيعيده إلى false على أي حال.
        why: صحيح. المتغيّرات المحلية لا تبقى بين مرّات الـ render، وReact لا تراقبها. والـ `useState` يحلّ المشكلتين.
      - text: يجب أن تكون `let` هي `var`.
        why: الكلمة المفتاحية لا تهمّ. أي متغيّر محلي يُعاد إنشاؤه في كل render.
    answer: 2
  - q: أيّ سطر يعلّم فيلمًا واحدًا كمُشاهَد في الـ state المسمّى `movies` بشكل صحيح؟
    options:
      - text: "`setMovies(movies.map((m) => (m.id === id ? { ...m, watched: true } : m)));`"
        why: صحيح. تبني `map` مصفوفة جديدة، والفيلم المتغيّر كائن جديد، والأفلام التي لم تتغيّر يُعاد استخدامها.
      - text: "`movies.find((m) => m.id === id).watched = true; setMovies(movies);`"
        why: هذا يعدّل الكائن الموجود ويُعيد المصفوفة نفسها. تقارن React باستخدام Object.is، فلا ترى تغييرًا وقد تتخطّى الـ render.
      - text: "`setMovies(movies.push({ id, watched: true }));`"
        why: "الدالة `push` تعدّل المصفوفة وتُرجع الطول الجديد، فيصبح الـ state رقمًا."
      - text: "`movies[0].watched = true;`"
        why: تعديل الـ state لا يُخبر React أبدًا بأن شيئًا تغيّر، وهو يعدّل الفيلم الخطأ إلا إذا صادف أن كان الأول.
    answer: 0
  - q: "داخل معالج نقرة تستدعي `setTitle('Dune')` ثم `console.log(title)` في السطر التالي. كان العنوان القديم 'Arrival'. ماذا يُطبع؟"
    options:
      - text: "'Dune'"
        why: ضبط الـ state لا يغيّر المتغيّر في الـ render الحالي، بل يطلب من React render جديدًا تكون فيه `title` هي 'Dune'.
      - text: "'Arrival'"
        why: صحيح. `title` ثابت في لقطة هذا الـ render، والقيمة الجديدة تظهر في الـ render التالي.
      - text: "undefined"
        why: ما زال المتغيّر يحمل قيمة هذا الـ render، وهي 'Arrival'.
    answer: 1
---

انقر زر «Mark as watched» في function component عادي، ولن يحدث شيء. هذا هو الكود الذي يكتبه معظم الناس أول مرة:

```jsx
export default function MovieItem() {
  let watched = false;

  function handleClick() {
    watched = !watched;
  }

  return (
    <button onClick={handleClick}>
      {watched ? 'Watched' : 'Mark as watched'}
    </button>
  );
}
```

هناك خطآن. تغيير متغيّر محلي لا يُخبر React بأن شيئًا حدث، فلا تعيد الـ render أبدًا. وحتى لو تسبّب شيء آخر في render، فسيُنفَّذ `let watched = false` مرة أخرى ويعيد القيمة إلى البداية، لأن الـ component دالة، ومتغيّراتها المحلية تبدأ من جديد مع كل استدعاء. يحتاج الـ component إلى شيئين: ذاكرة تبقى بين مرّات الـ render، وطريقة ليطلب من React أن تعيد الـ render. هذا هو الـ state.

## الـ `useState`

```jsx title=src/components/MovieItem.jsx
import { useState } from 'react';

export default function MovieItem({ title }) {
  const [watched, setWatched] = useState(false);

  return (
    <li>
      {title}
      <button aria-pressed={watched} onClick={() => setWatched(!watched)}>
        {watched ? 'Watched' : 'Mark as watched'}
      </button>
    </li>
  );
}
```

تُعلن `useState(false)` عن قطعة state واحدة بقيمة ابتدائية `false`. وتُرجع زوجًا تفكّكه وتسمّيه: القيمة الحالية، ودالة setter (دالة الضبط). التسمية `[thing, setThing]` عُرف يتّبعه الجميع؛ التزم به.

حين تستدعي `setWatched(true)`، تخزّن React القيمة الجديدة وتجدول re-render. فتستدعي `MovieItem` مرة أخرى، وهذه المرة تُرجع `useState` القيمة `true`. يُحسب الـ JSX الخاص بك منها، وتحدّث React الـ DOM ليطابقه.

الـ state ملك لـ **نسخة (instance)** من الـ component، لا للدالة. ارسم `<MovieItem />` ثلاث مرات وستحصل على ثلاث قيم `watched` مستقلة. النقر على واحدة لا يؤثّر في الأخريين.

:::why الدوال التي تبدأ بـ «use» هي hooks
الـ `useState` هو hook: دالة خاصة تتيح للـ components استخدام ميزات React. تعتمد الـ hooks على أن تُستدعى بالترتيب نفسه في كل render، وبهذا تعرف React أي state هو أي state. لذا استدعِها في المستوى الأعلى من الـ component: لا داخل `if` ولا داخل حلقة ولا داخل دالة متداخلة. وأداة الفحص في مشروع Vite تتحقّق من قواعد الـ hooks (القاعدة `react/rules-of-hooks` في Oxlint، أو `eslint-plugin-react-hooks` إن اخترت ESLint)، وستنبّهك إلى الأخطاء.
:::

## كل render لقطة

هذه هي الفكرة التي تجعل الـ state مفهومًا فجأة. حين تستدعي React الـ component، تسلّمك الـ state **الخاص بذلك الـ render**. وكل ما في ذلك الـ render، الـ JSX ومعالجات الأحداث وكل شيء، يرى تلك القيم. ضبط الـ state لا يغيّر المتغيّر الذي لديك أصلًا؛ بل يطلب render جديدًا بقيمة جديدة.

:::figure ضبط الـ state يُطلق render جديدًا بلقطة جديدة
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">الـ render الأول يرى watched تساوي false. نقرة تستدعي setWatched(true)، التي تجدول الـ render الثاني. الـ render الثاني يرى watched تساوي true، وتثبّت React الـ DOM المتغيّر.</title>
  <rect class="d-box" x="20" y="60" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="105" y="92" text-anchor="middle">Render 1</text>
  <text class="d-code" x="105" y="118" text-anchor="middle">watched = false</text>
  <rect class="d-box-warn" x="265" y="60" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="350" y="92" text-anchor="middle">نقرة</text>
  <text class="d-code" x="350" y="118" text-anchor="middle">setWatched(true)</text>
  <rect class="d-box-success" x="510" y="60" width="170" height="80" rx="12"/>
  <text class="d-label-strong" x="595" y="92" text-anchor="middle">Render 2</text>
  <text class="d-code" x="595" y="118" text-anchor="middle">watched = true</text>
  <path class="d-arrow" d="M190 100 L263 100" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M435 100 L508 100" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="227" y="175" text-anchor="middle">المستخدم يتصرّف</text>
  <text class="d-label-muted" x="472" y="175" text-anchor="middle">React تعيد الـ render</text>
  <text class="d-label-muted" x="350" y="205" text-anchor="middle">لكل render قيمه الخاصة؛ لا شيء يتغيّر في منتصفه</text>
</svg>
:::

ولهذا يُفاجأ الناس بهذا:

```jsx
const [count, setCount] = useState(0);

function addThree() {
  setCount(count + 1); // count is 0 → asks for 1
  setCount(count + 1); // count is still 0 → asks for 1
  setCount(count + 1); // still 0 → 1
}
```

الاستدعاءات الثلاثة تقرأ اللقطة نفسها، فتكون النتيجة 1 لا 3. وحين تعتمد القيمة التالية على السابقة، مرّر **دالة تحديث (updater function)** بدلًا من قيمة:

```jsx
function addThree() {
  setCount((c) => c + 1); // 0 → 1
  setCount((c) => c + 1); // 1 → 2
  setCount((c) => c + 1); // 2 → 3
}
```

تضع React دوال التحديث في طابور وتنفّذها بالترتيب، وكل واحدة تستقبل نتيجة سابقتها. لست بحاجة إلى دوال التحديث في كل مكان؛ فـ `setWatched(!watched)` في معالج نقرة لا بأس به. استخدمها حين تضبط الـ state نفسه أكثر من مرة في معالج واحد، أو في كود يُنفَّذ لاحقًا، مثل مؤقّت.

## المصفوفات والكائنات: استبدل، لا تعدّل

يحتفظ Watchlist بمصفوفة من كائنات الأفلام في الـ state. وتقرّر React ما إذا كان الـ state قد تغيّر بمقارنة القيمة القديمة بالجديدة باستخدام `Object.is`. فإذا غيّرت مصفوفة في مكانها وأعدت المصفوفة نفسها، ترى React المرجع نفسه وقد تتخطّى الـ render كليًا.

لذا تعامل مع الـ state كقيمة للقراءة فقط، وابنِ قيمًا جديدة:

```jsx
const [movies, setMovies] = useState(INITIAL_MOVIES);

// Add: a new array with everything plus one more
setMovies([...movies, { id: crypto.randomUUID(), title: 'Dune', watched: false }]);

// Remove: a new array without one item
setMovies(movies.filter((m) => m.id !== id));

// Update one: a new array, with a new object for the changed item
setMovies(movies.map((m) => (m.id === id ? { ...m, watched: !m.watched } : m)));
```

هذه الأسطر الثلاثة (الـ spread للإضافة، و`filter` للحذف، و`map` مع spread للتحديث) تغطّي معظم تحديثات الـ state التي ستكتبها للقوائم. والكائنات تعمل بالطريقة نفسها: `setFilters({ ...filters, year: 2024 })`.

:::mistake تعديل الـ state مباشرة
الكود `movies.push(newMovie); setMovies(movies);` يغيّر المصفوفة التي تحملها React ثم يعيدها إليها دون تغيير من وجهة نظر `Object.is`. لا تتحدّث الشاشة، أو تتحدّث لاحقًا في لحظة عشوائية حين يُطلق شيء آخر re-render. إذا رأيت واجهة قديمة بعد تحديث، فابحث عن `push` أو `splice` أو `sort` أو إسناد مباشر مثل `movie.watched = true`.
:::

## اختيار القيمة الابتدائية

الوسيط الممرَّر إلى `useState` لا يُستخدم إلا في الـ render الأول، وتتجاهله مرّات الـ render اللاحقة. وإذا كان حساب القيمة الابتدائية مكلفًا، كقراءة بيانات محفوظة وتحليلها، فمرّر دالة بدلًا منها، `useState(() => loadMovies())`، فتستدعيها React في الـ render الأول فقط بدل أن تستدعيها في كل render. وستستخدم هذا بالضبط لتحميل Watchlist من localStorage في القسم 4.

صار بإمكان الـ components أن تتذكّر. في الدرس التالي تنظر عن قرب إلى الأحداث التي تغيّر الـ state: النقر، ولوحة المفاتيح، وكائن الحدث نفسه.
