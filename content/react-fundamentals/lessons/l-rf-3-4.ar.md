---
summary: شارك الـ state بين components إخوة بنقله إلى أقرب أب مشترك لها، وتمرير القيم إلى الأسفل ومعالجات التغيير إلى الأعلى، ليبقى للتطبيق مصدر واحد للحقيقة.
takeaways:
  - حين يحتاج componentان إلى البيانات المتغيّرة نفسها، انقل الـ state إلى أقرب أب مشترك لهما ومرّره إلى الأسفل كـ props.
  - يغيّر الأبناء الـ state المشترك باستدعاء props من نوع المعالجات مثل `onAdd` أو `onFilterChange`؛ البيانات تنزل والأحداث تصعد.
  - أبقِ كل قطعة state في أدنى مكان ممكن من الشجرة، لكن في أعلى مكان ضروري.
  - لا تنسخ prop إلى state باستخدام `useState(prop)`؛ فالنسخة تتجاهل التغييرات اللاحقة. استخدم الـ prop مباشرة أو اشتقّ منه.
further:
  - title: Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
quiz:
  - q: "يحتفظ `FilterBar` بـ `const [filter, setFilter] = useState('all')`. ويحتاج أخوه `MovieList` إلى عرض الأفلام المطابقة للفلتر فقط. ما الإصلاح؟"
    options:
      - text: اجعل FilterBar يكتب الفلتر في متغيّر عام يقرؤه MovieList.
        why: تغيير متغيّر في الـ module لا يُطلق أي re-render، فيعرض MovieList نتائج قديمة.
      - text: امنح MovieList نسخته الخاصة من state الفلتر، وأبقِ النسختين متزامنتين بـ effect.
        why: نسختان من الـ state نفسه يجب مزامنتهما هما بالضبط المشكلة التي يحلّها رفع الـ state. كود أكثر وأخطاء أكثر.
      - text: انقل state الفلتر إلى أبيهما المشترك، ومرّر `filter` إلى كليهما، ومرّر `setFilter` (أو معالجًا) إلى FilterBar.
        why: صحيح. مالك واحد ومصدر واحد للحقيقة. يعرض FilterBar القيمة ويغيّرها، ويقرؤها MovieList.
      - text: اجعل MovieList ابنًا لـ FilterBar حتى يستطيع قراءة الـ state.
        why: إعادة ترتيب شجرة الواجهة لتناسب البيانات أمر معكوس، وستبقى الترويسة التي تعدّ الأفلام خارج الحلّ.
    answer: 2
  - q: أيّ قطعة من state في Watchlist يجب أن تبقى داخل `AddMovieForm` بدل رفعها إلى `App`؟
    options:
      - text: النص المكتوب حاليًا في حقل العنوان.
        why: صحيح. لا يستخدم المسوّدة إلا النموذج. أمّا App فلا يحتاج إلا إلى الفيلم النهائي، الذي يصله عبر `onAdd`.
      - text: قائمة الأفلام.
        why: الترويسة والقائمة والنموذج كلها تعتمد على الأفلام، فمكانها App.
      - text: الفلتر الحالي.
        why: أزرار الفلترة والقائمة كلتاهما تحتاجانه، فيعيش في أبيهما المشترك.
    answer: 0
  - q: |
      يعرض `MovieTitle` عنوانًا يستقبله كـ prop. وحين يغيّر الأب اسم الفيلم، يظل الابن يعرض العنوان القديم. لماذا؟
      ```jsx
      function MovieTitle({ title }) {
        const [text] = useState(title);
        return <h2>{text}</h2>;
      }
      ```
    options:
      - text: لا يمكن أن تحتوي الـ props على نصوص تتغيّر.
        why: يمكن أن تتغيّر الـ props في كل render. هذا الـ component هو من يتجاهل التغيير.
      - text: نسي الأب استخدام key.
        why: تغيير الـ key كان سيعيد التركيب ويُخفي الخطأ، لكن الخطأ في الـ state المنسوخ، لا في الأب.
      - text: يحتاج الـ h2 إلى معالج `onChange`.
        why: العناوين ليست لها أحداث تغيير. المشكلة في مصدر النص.
      - text: "لا تستخدم `useState` وسيطها إلا في الـ render الأول، فتكون `text` نسخة مجمّدة. اعرض `{title}` مباشرة."
        why: صحيح. القيمة الابتدائية تُقرأ مرة واحدة. وإذا لم يكن الـ component بحاجة إلى تعديل القيمة، فلا ينبغي أن ينسخها إلى الـ state.
    answer: 3
  - q: في Watchlist تنزل البيانات كـ props وتصعد التغييرات عبر الـ callbacks. ما الفائدة الأساسية لهذا التدفّق باتجاه واحد؟
    options:
      - text: يجعل React ترسم أسرع من الربط ثنائي الاتجاه.
        why: الأداء ليس الهدف؛ الفائدة تتعلّق بفهم تطبيقك وتتبّع أخطائه.
      - text: لتعرف لماذا يعرض شيء ما قيمة معيّنة، تتبع الـ props صعودًا إلى الـ component الوحيد الذي يملك الـ state.
        why: صحيح. لكل قطعة state مالك واحد، ووحده يغيّرها، فيكون للأخطاء مكان واحد تبحث فيه.
      - text: يلغي الحاجة إلى معالجات الأحداث.
        why: الـ callbacks معالجات أحداث تُمرَّر إلى الأسفل، والتدفّق باتجاه واحد يعتمد عليها.
    answer: 1
---

لديك الآن نموذج لإضافة الأفلام، وقائمة أفلام، وأزرار فلترة. كل منها يعمل وحده. ضعها على شاشة واحدة ولن يتحدّث بعضها مع بعض: لا يستطيع النموذج الإضافة إلى قائمة تعيش في component آخر، ولا تعرف القائمة أي زر فلترة مضغوط. لا تستطيع الـ components أن تمدّ يدها إلى الـ state الخاص ببعضها. هذا مقصود، والحلّ نمط ستستخدمه في كل تطبيق React تبنيه.

## المشكلة: الإخوة لا يتشاركون

هذا شريط الفلترة كما قد تكتبه أول مرة:

```jsx
function FilterBar() {
  const [filter, setFilter] = useState('all');
  return (
    <div>
      <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
      <button aria-pressed={filter === 'to-watch'} onClick={() => setFilter('to-watch')}>To watch</button>
      <button aria-pressed={filter === 'watched'} onClick={() => setFilter('watched')}>Watched</button>
    </div>
  );
}
```

يظهر الزر النشط مميّزًا بشكل صحيح، لكن `MovieList` أخ له. لا يصل إلى `filter`، فيعرض كل شيء مهما نقرت. الـ state خاص بالـ component الذي يعلن عنه.

## الحلّ: ارفعه إلى الأب المشترك

اعثر على أقرب component يكون أبًا لكل ما يحتاج إلى الـ state. بالنسبة إلى الفلتر، هو `App`، أب كلٍّ من `FilterBar` و`MovieList`. انقل الـ state إليه، ثم:

1. مرّر **القيمة** إلى كل من يقرؤها، و
2. مرّر **دالة** إلى كل من يغيّرها.

```jsx title=src/App.jsx
export default function App() {
  const [movies, setMovies] = useState(INITIAL_MOVIES);
  const [filter, setFilter] = useState('all');

  const visible = movies.filter((m) =>
    filter === 'all' ? true : filter === 'watched' ? m.watched : !m.watched,
  );

  function handleAdd(title) {
    setMovies([...movies, { id: crypto.randomUUID(), title, watched: false }]);
  }

  return (
    <main>
      <Header movies={movies} />
      <AddMovieForm onAdd={handleAdd} />
      <FilterBar value={filter} onChange={setFilter} />
      <MovieList movies={visible} />
    </main>
  );
}

function FilterBar({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter movies">
      <button aria-pressed={value === 'all'} onClick={() => onChange('all')}>All</button>
      <button aria-pressed={value === 'to-watch'} onClick={() => onChange('to-watch')}>To watch</button>
      <button aria-pressed={value === 'watched'} onClick={() => onChange('watched')}>Watched</button>
    </div>
  );
}
```

لم يعد لدى `FilterBar` أي state. إنه يعرض `value` ويبلّغ عن النقرات عبر `onChange`. ويُسمّى component كهذا **controlled** (متحكَّمًا به): أبوه يقرّر ما يعرضه. وصار الآن أسهل في الاختبار وإعادة الاستخدام، لأن كل ما يفعله ظاهر في الـ props الخاصة به.

:::figure يعيش الـ state في App؛ الـ props تنزل والأحداث تصعد
<svg viewBox="0 0 700 280" role="img" aria-labelledby="t1">
  <title id="t1">يملك App الـ state المسمّى movies والمسمّى filter. يمرّر movies إلى Header، وonAdd إلى AddMovieForm، وvalue وonChange إلى FilterBar، والأفلام الظاهرة إلى MovieList. ويستدعي AddMovieForm وFilterBar الـ callbacks الخاصة بهما لإرسال التغييرات صعودًا إلى App.</title>
  <rect class="d-box-primary" x="230" y="16" width="240" height="64" rx="12"/>
  <text class="d-label-strong" x="350" y="42" text-anchor="middle">App</text>
  <text class="d-code" x="350" y="66" text-anchor="middle">movies · filter</text>
  <rect class="d-box" x="10" y="190" width="150" height="50" rx="10"/>
  <text class="d-label" x="85" y="220" text-anchor="middle">Header</text>
  <rect class="d-box" x="180" y="190" width="160" height="50" rx="10"/>
  <text class="d-label" x="260" y="220" text-anchor="middle">AddMovieForm</text>
  <rect class="d-box" x="360" y="190" width="150" height="50" rx="10"/>
  <text class="d-label" x="435" y="220" text-anchor="middle">FilterBar</text>
  <rect class="d-box-accent" x="530" y="190" width="160" height="50" rx="10"/>
  <text class="d-label" x="610" y="220" text-anchor="middle">MovieList</text>
  <path class="d-arrow" d="M280 80 L95 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M420 80 L605 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M330 80 L285 188" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M370 80 L420 188" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M245 190 L300 84" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M455 190 L400 84" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="140" y="130" text-anchor="middle">الـ props تنزل</text>
  <text class="d-label-muted" x="350" y="268" text-anchor="middle">المتقطّع: استدعاءات onAdd / onChange تصعد</text>
</svg>
:::

## البيانات تنزل، والأحداث تصعد

لاحظ الشكل. البيانات تتدفّق **نزولًا** في الشجرة كـ props: `movies` و`filter` و`visible`. والتغييرات تتدفّق **صعودًا** كاستدعاءات دوال: النموذج يستدعي `onAdd`، وشريط الفلترة يستدعي `onChange`. ولا يستدعي `setMovies` أو `setFilter` إلا `App`.

هذه هي الثمرة. إذا عرضت القائمة يومًا أفلامًا خاطئة، فهناك مكان واحد بالضبط يقرّر ما فيها. تتبع الـ props صعودًا إلى مالكها وتقرأ الكود الذي يغيّرها. قارن ذلك بتطبيق يستطيع فيه أي component أن يعبث بأي component آخر: قد يأتي الخطأ من أي مكان.

وانظر أيضًا إلى ما ليس state. تُحسب `visible` من `movies` و`filter` في كل render، ويشتقّ `Header` العدد من `movies`. رفع الـ state لا يعني رفع كل شيء؛ بل يعني مالكًا واحدًا لكل قطعة state حقيقية، وكل ما عداها مشتقّ منها.

## علامات أنك تحتاج إلى الرفع

نادرًا ما تخطّط لكل قطعة state بشكل مثالي من البداية. تكتشف الحاجة إلى الرفع أثناء البناء، والعلامات ثابتة:

- componentان يعرضان قيمتين يجب أن تتطابقا لكنهما لا تتطابقان أحيانًا.
- أنت على وشك كتابة effect وظيفته الوحيدة نسخ state component إلى آخر.
- ابنٌ يحتاج إلى تغيير شيء يعرضه أخوه.

كل واحدة من هذه تعني أن للبيانات نفسها مالكين، أو أن المالك منخفض جدًا في الشجرة. والرفع إعادة هيكلة صغيرة وآلية: اقطع سطر `useState`، والصقه في الأب، واستبدل الـ state القديم في الابن بـ props.

## في أدنى مكان ممكن، وأعلى مكان ضروري

للرفع ثمن: المالك يعيد الـ render حين يتغيّر الـ state، ومعه أبناؤه، والـ props تضطر إلى قطع مسافة أطول. فلا ترفع كل شيء إلى `App` بحكم العادة.

النص الذي يُكتب في حقل العنوان مثال جيد. لا يهتمّ به إلا `AddMovieForm` أثناء الكتابة. أمّا `App` فلا يحتاج إلا إلى العنوان النهائي، الذي يصله من `onAdd`. لذا تبقى المسوّدة في النموذج. وإذا احتاج component آخر لاحقًا إلى معاينة المسوّدة، فسترفعها حينها.

وحين يحتاج إلى الـ state components متباعدة في الشجرة، يصبح تمريره عبر كل مستوى مملًّا. رأيت حلًّا في درس التركيب (تمرير العناصر إلى الأسفل)، والـ **context** في React هو الحل الآخر. أمّا Watchlist فتكفيه بضعة props.

:::mistake نسخ الـ props إلى الـ state
يبدو `const [title, setTitle] = useState(props.title)` طريقةً «لاستقبال» البيانات، لكن `useState` لا تقرأ وسيطها إلا في الـ render الأول. وحين يمرّر الأب عنوانًا جديدًا، يحتفظ الابن بالنسخة القديمة. إذا كان الـ component يكتفي بعرض القيمة، فاستخدم الـ prop مباشرة. وإذا كان يحتاج إلى مسوّدة قابلة للتعديل تبدأ من الـ prop، فسمِّه باسم واضح (`initialTitle`) ليعرف الجميع أن التغييرات اللاحقة تُتجاهل.
:::

صار لـ Watchlist مصدر واحد للحقيقة وثلاثة components تقرؤه وتغيّره. في الدرس التالي تزامن هذا الـ state مع شيء خارج React، أي عنوان تبويب المتصفّح وlocalStorage، باستخدام الـ effects.
