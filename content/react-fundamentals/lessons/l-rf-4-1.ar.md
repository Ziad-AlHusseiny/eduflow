---
summary: اجمع Watchlist المكتمل من components صغيرة، مع الـ state عند مالك واحد، وقيم مشتقّة، ومعالجات تُمرَّر إلى الأسفل، وقائمة محفوظة في localStorage.
takeaways:
  - يحتفظ التطبيق المكتمل بقطعتين فقط من الـ state الحقيقي في App، هما الأفلام والفلتر، ويشتقّ كل ما عداهما أثناء الـ render.
  - كل التغييرات على الأفلام تحدث في عدد قليل من المعالجات المسمّاة داخل App، ويستدعيها الأبناء عبر الـ props.
  - الـ components العرضية الصغيرة التي لا تفعل سوى استقبال الـ props سهلة القراءة وإعادة الاستخدام والاختبار.
  - اعزل واجهات المتصفّح مثل localStorage في module صغير مع معالجة للأخطاء، لتبقى الـ components بسيطة.
  - امشِ في كل مسار استخدام بيدك، بما فيه تحديث الصفحة والحالات الفارغة والاستخدام بلوحة المفاتيح، قبل أن تعدّ العمل منتهيًا.
further:
  - title: Thinking in React
    url: https://react.dev/learn/thinking-in-react
  - title: Extracting State Logic into a Reducer
    url: https://react.dev/learn/extracting-state-logic-into-a-reducer
  - title: Window.localStorage (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
quiz:
  - q: توسّع Watchlist المكتمل بزر «Clear watched» يكون معطّلًا حين لا يوجد فيلم مُشاهَد، إلى جانب العدد والقائمة المصفّاة. كم استدعاءً لـ `useState` يحتاج App؟
    options:
      - text: خمسة، واحد لكلٍّ من الأفلام والفلتر والعدد والأفلام الظاهرة وحالة تعطيل الزر.
        why: العدد والقائمة الظاهرة وحالة التعطيل كلها تُحسب من الأفلام والفلتر. وتخزينها ينشئ نُسخًا تنحرف.
      - text: واحد، كائن يحمل كل شيء.
        why: يمكنك ذلك، لكن الأفلام والفلتر يتغيّران باستقلال. قطعتان منفصلتان من الـ state أبسط في التحديث.
      - text: اثنان، للأفلام والفلتر. وكل ما عداهما يُشتقّ أثناء الـ render.
        why: صحيح. مسوّدة العنوان تعيش في النموذج، وكل ما عدا ذلك يُحسب من هاتين القطعتين.
    answer: 2
  - q: يعلّم المستخدم فيلمًا كمُشاهَد بالنقر على زرّه في `MovieItem`. بأيّ ترتيب تحدث الأشياء؟
    options:
      - text: يضبط MovieItem الـ state الخاص به `watched`، ثم يُخبر App عبر effect.
        why: لا يملك MovieItem أي state خاص به في هذا التصميم، ومزامنة الـ state عبر effect هي النمط الذي يجب تجنّبه.
      - text: "يستدعي MovieItem الدالة `onToggle(id)`، فيستدعي معالج App الدالة `setMovies`، ويعيد App الـ render، وتنزل الـ props الجديدة إلى الترويسة والقائمة."
        why: صحيح. تصعد الأحداث إلى المالك، ويحدّث المالك الـ state، وتنزل البيانات الجديدة إلى كل component يعرضها.
      - text: يفحص App الـ DOM دوريًا بحثًا عن مربّعات الاختيار المعلَّمة ويحدّث الـ state الخاص به.
        why: لا تقرأ React الـ state من الـ DOM أبدًا. الـ DOM يُرسم من الـ state، لا العكس.
      - text: يعدّل MovieItem كائن الفيلم الذي استقبله، فتلاحظ React التغيير.
        why: الـ props للقراءة فقط، وReact لا تكتشف التعديلات المباشرة. لن يُعاد رسم أي شيء.
    answer: 1
  - q: لماذا يضع الدرس `loadMovies` و`saveMovies` في module منفصل اسمه `storage.js`؟
    options:
      - text: ليبقى API المتصفّح ومعالجة أخطائه ومفتاح التخزين في مكان واحد، فلا تتعامل الـ components إلا مع مصفوفات عادية.
        why: صحيح. إذا انتقلت لاحقًا إلى خادم أو IndexedDB، فستغيّر ملفًا صغيرًا واحدًا، ويبقى كود App كما هو.
      - text: لأن الـ components في React لا يُسمح لها باستدعاء localStorage.
        why: يمكن للـ components استدعاء أي API من المتصفّح داخل المعالجات والـ effects. الفصل مسألة وضوح، لا إذن.
      - text: لأن localStorage لا يعمل إلا في الملفات التي تنتهي بـ `.js`.
        why: امتداد الملف لا يغيّر شيئًا في واجهات المتصفّح. ملفات `.jsx` تشغّل JavaScript نفسها.
    answer: 0
  - q: بعد إضافة «Clear watched» صار في App معالجات للإضافة والتبديل والحذف ومسح المُشاهَد، وكلها تستدعي `setMovies` بمنطق مختلف. متى يستحق `useReducer` العناء؟
    options:
      - text: فورًا، لأن useState لا يجب أن يُستخدم مع المصفوفات.
        why: تتعامل useState مع المصفوفات بشكل ممتاز، كما يُثبت هذا التطبيق كله.
      - text: فقط حين يستخدم التطبيق TypeScript.
        why: تعمل الـ reducers بالطريقة نفسها في JavaScript وTypeScript؛ اللغة ليست العامل الحاسم.
      - text: أبدًا، لأن useReducer أصبح متوقّفًا (deprecated) في React 19.
        why: الـ useReducer هو hook حالي ومدعوم بالكامل. لم يُوقف React 19 أي شيء فيه.
      - text: حين يكبر منطق التحديث بما يكفي لأن يصبح جمعه في دالة نقية واحدة، خارج الـ component، أسهل في القراءة والاختبار.
        why: صحيح. ينقل الـ reducer «كيف يتغيّر الـ state» إلى دالة واحدة يمكنك اختبارها من دون render. ومع أربعة معالجات قصيرة، ما زال useState مناسبًا.
    answer: 3
---

كل قطعة من Watchlist موجودة الآن، موزّعة على الدروس: الـ components من القسم 1، والـ props والقوائم من القسم 2، والـ state والنماذج والـ effects من القسم 3. هذا الدرس يجمعها في تطبيق واحد ستكون مرتاحًا لعرضه في مقابلة عمل، ويشرح كل قرار لتتّخذ القرارات نفسها في مشروعك التالي.

## شكل التطبيق

هذا هو الترتيب النهائي للملفات في مشروع Vite:

```text
src/
  main.jsx
  App.jsx               state, handlers, derived values
  storage.js            load and save to localStorage
  components/
    Header.jsx          title and "N to watch"
    AddMovieForm.jsx    controlled title input
    FilterBar.jsx       All / To watch / Watched
    MovieList.jsx       list or empty state
    MovieItem.jsx       one movie: toggle and remove
```

ملفّان فقط فيهما منطق يستحق الاختبار: `App.jsx` الذي يملك الـ state، و`storage.js`. وكل component في `components/` يستقبل props ويُرجع JSX. هذا هو التقسيم الذي تريده: طبقة رقيقة من الـ state والمنطق في الأعلى، وطبقة عريضة من القطع البسيطة تحتها.

## التخزين، معزولًا

ابدأ بالـ module الذي يتحدّث مع المتصفّح:

```js title=src/storage.js
const KEY = 'watchlist.movies';

export function loadMovies() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function saveMovies(movies) {
  try {
    localStorage.setItem(KEY, JSON.stringify(movies));
  } catch {
    // Storage full or blocked: the app still works, it just won't remember.
  }
}
```

قد يرمي localStorage أخطاء (محظور في بعض أوضاع الخصوصية، أو امتلأت سعته)، وقد يحتوي على أي شيء، بما في ذلك بيانات من نسخة أقدم من تطبيقك. فحص `Array.isArray` والتقاط الأخطاء يعنيان أن القيمة المعطوبة تعطيك قائمة فارغة بدل شاشة بيضاء. ولا ترى الـ components أي شيء من هذا.

## الـ App: المالك

```jsx title=src/App.jsx
import { useEffect, useState } from 'react';
import { loadMovies, saveMovies } from './storage.js';
import Header from './components/Header.jsx';
import AddMovieForm from './components/AddMovieForm.jsx';
import FilterBar from './components/FilterBar.jsx';
import MovieList from './components/MovieList.jsx';

export default function App() {
  const [movies, setMovies] = useState(loadMovies);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    saveMovies(movies);
  }, [movies]);

  const left = movies.filter((m) => !m.watched).length;
  const visible = movies.filter((m) =>
    filter === 'all' ? true : filter === 'watched' ? m.watched : !m.watched,
  );

  function handleAdd(title) {
    setMovies([...movies, { id: crypto.randomUUID(), title, watched: false }]);
  }

  function handleToggle(id) {
    setMovies(movies.map((m) => (m.id === id ? { ...m, watched: !m.watched } : m)));
  }

  function handleRemove(id) {
    setMovies(movies.filter((m) => m.id !== id));
  }

  return (
    <main className="app">
      <Header left={left} total={movies.length} />
      <AddMovieForm onAdd={handleAdd} />
      <FilterBar value={filter} onChange={setFilter} />
      <MovieList movies={visible} onToggle={handleToggle} onRemove={handleRemove} />
    </main>
  );
}
```

اقرأه من الأعلى إلى الأسفل وستعرف التطبيق كله. قطعتان من الـ state. effect واحد، للشيء الوحيد الموجود خارج React. قيمتان مشتقّتان. ثلاثة معالجات، كلٌّ منها سطر واحد، وكلٌّ منها إجراء مسمّى يستطيع المستخدم القيام به. ثم التخطيط. وحين يصل بلاغ خطأ («حذف فيلم يعيده بعد تحديث الصفحة»)، تعرف بالضبط أي الأسطر قد تكون معنية.

تأتي المعرّفات من `crypto.randomUUID()`، وتُنشأ مرة واحدة في `handleAdd` وتُخزَّن مع الفيلم، تمامًا كما أوصى درس الـ keys. وهي تعمل على `localhost` وعبر HTTPS، وهذا يغطّي التطوير وVercel.

## القطع التي تحت

الـ components الخاصة بالقائمة والعنصر قصيرة لأنها لا تفعل سوى عرض الـ props وتمرير الأحداث:

```jsx title=src/components/MovieList.jsx
import MovieItem from './MovieItem.jsx';

export default function MovieList({ movies, onToggle, onRemove }) {
  if (movies.length === 0) {
    return <p className="empty">No movies here yet.</p>;
  }

  return (
    <ul className="movie-list">
      {movies.map((movie) => (
        <MovieItem key={movie.id} movie={movie} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}
```

```jsx title=src/components/MovieItem.jsx
export default function MovieItem({ movie, onToggle, onRemove }) {
  return (
    <li className={movie.watched ? 'movie watched' : 'movie'}>
      <span className="title">{movie.title}</span>
      <button aria-pressed={movie.watched} onClick={() => onToggle(movie.id)}>
        {movie.watched ? 'Watched' : 'Mark watched'}
      </button>
      <button aria-label={`Remove ${movie.title}`} onClick={() => onRemove(movie.id)}>
        Remove
      </button>
    </li>
  );
}
```

أمّا `AddMovieForm` و`FilterBar` فهما النسختان اللتان بنيتهما في الدروس السابقة، وصار `Header` يستقبل الرقمين اللذين يعرضهما بدل القائمة كاملة. ويحصل زر Remove على `aria-label` يسمّي الفيلم، لأن مستخدم الـ screen reader الذي يتنقّل بمفتاح Tab بين عشرة أزرار «Remove» يحتاج إلى معرفة الزر الذي يقف عليه.

:::figure نقرة واحدة، من البداية إلى النهاية
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">النقر على Mark watched في MovieItem يستدعي onToggle، فتُنفَّذ handleToggle في App. تُطلق setMovies إعادة render؛ فتنزل props جديدة إلى Header وMovieList، ويكتب effect الحفظ في localStorage.</title>
  <rect class="d-box" x="10" y="30" width="150" height="56" rx="10"/>
  <text class="d-label" x="85" y="54" text-anchor="middle">MovieItem</text>
  <text class="d-code" x="85" y="74" text-anchor="middle">onToggle(id)</text>
  <rect class="d-box-primary" x="200" y="30" width="170" height="56" rx="10"/>
  <text class="d-label-strong" x="285" y="54" text-anchor="middle">App</text>
  <text class="d-code" x="285" y="74" text-anchor="middle">setMovies(…)</text>
  <rect class="d-box" x="410" y="30" width="130" height="56" rx="10"/>
  <text class="d-label" x="475" y="63" text-anchor="middle">Re-render</text>
  <rect class="d-box-success" x="580" y="10" width="110" height="44" rx="10"/>
  <text class="d-label" x="635" y="37" text-anchor="middle">Header</text>
  <rect class="d-box-success" x="580" y="64" width="110" height="44" rx="10"/>
  <text class="d-label" x="635" y="91" text-anchor="middle">MovieList</text>
  <rect class="d-box-accent" x="410" y="150" width="200" height="56" rx="10"/>
  <text class="d-label" x="510" y="174" text-anchor="middle">effect بعد الـ commit</text>
  <text class="d-code" x="510" y="194" text-anchor="middle">saveMovies(movies)</text>
  <path class="d-arrow" d="M160 58 L198 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M370 58 L408 58" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M540 50 L578 34" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M540 66 L578 84" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M475 86 L490 148" marker-end="url(#arrow)"/>
</svg>
:::

## لماذا تصمد هذه البنية

انظر إلى ما يحتاجه كل component ليُفحص. يحتاج `MovieList` إلى مصفوفة ودالتين. أعطه مصفوفة فارغة ويجب أن يعرض «No movies here yet.»؛ وأعطه فيلمين ويجب أن يرسم عنصرين. ويحتاج `MovieItem` إلى فيلم واحد، والنقر على Remove يجب أن يستدعي `onRemove` بمعرّف ذلك الفيلم. لا يحتاج أيٌّ منهما إلى localStorage، ولا إلى نموذج حقيقي، ولا إلى بقية التطبيق. هذا ما تعنيه «قطع صغيرة قابلة للاختبار» عمليًا: لكل قطعة بضعة مدخلات وبضعة مخرجات مرئية.

وحين تضيف اختبارات آلية لاحقًا (Vitest مع React Testing Library هو الثنائي الشائع لمشاريع Vite)، فهذه هي الاختبارات التي ستكتبها أولًا. وحتى قبل أن تكون لديك اختبارات، تؤتي البنية ثمارها: حين تبدو الحالة الفارغة خاطئة، تفتح ملفًا واحدًا من 10 أسطر، لا component من 300 سطر.

## حين تكبر المعالجات

ثلاثة معالجات من سطر واحد سهلة المتابعة. لكن إن أضفت التعديل وإعادة الترتيب والتراجع، فسيمتلئ `App` بمنطق التحديث. هذه هي اللحظة التي تفكّر فيها في `useReducer`: إنه ينقل كل قواعد «كيف تتغيّر الأفلام» إلى دالة نقية واحدة، `moviesReducer(movies, action)`، يمكنك اختبارها من دون رسم أي شيء. لا تبدأ من هناك. ابدأ بـ `useState`، والجأ إلى reducer حين تحدّث عدّة معالجات الـ state نفسه بطرق مترابطة ويصبح الـ component صعب القراءة.

:::mistake إعلان الانتهاء بعد المسار السعيد
تضيف فيلمًا، فيظهر، فتعتبر أنك انتهيت. ثم يحدّث مستخدمٌ الصفحة فيخسر كل شيء، أو يضغط Enter في حقل فارغ فيحصل على صف فارغ. قبل النشر، امشِ في كل مسار بيدك: أضف بالفأرة وبمفتاح Enter؛ جرّب عنوانًا فارغًا وعنوانًا من مسافات فقط؛ بدّل واحذف وصفِّ؛ حدّث الصفحة؛ أفرغ القائمة وتحقّق من الرسالة؛ تنقّل في التطبيق كله بلوحة المفاتيح وحدها.
:::

:::tip اعمل commit عند هذه النقطة
نفّذ `git init`، ثم `git add .` و`git commit -m "Watchlist: add, toggle, remove, filter, persist"`. سترفع هذا المستودع إلى GitHub قبل النشر، ومن الممارسات الجيدة أن تعمل commit لحالة تعمل قبل أن تبدأ بإعادة تنسيقها.
:::

Watchlist يعمل. لكن شكله ليس مميّزًا بعد، وهذا موضوع الدرس التالي: تنسيقه باستخدام Tailwind CSS.
