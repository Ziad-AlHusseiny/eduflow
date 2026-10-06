---
summary: اربط الـ event handlers بالطريقة الصحيحة، ومرّر إليها الوسائط، واقرأ كائن الحدث، وتحكّم في انتشار الأحداث والسلوك الافتراضي، ومرّر المعالجات إلى الـ components الأبناء كـ props.
takeaways:
  - مرّر دالة إلى `onClick`، مثل `onClick={handleClick}`؛ أمّا كتابة `handleClick()` فتستدعيها أثناء الـ render.
  - لتمرير وسيط، غلّف الاستدعاء بـ arrow function، مثل `onClick={() => onRemove(movie.id)}`.
  - تستقبل المعالجات كائن حدث فيه `target` و`key` و`preventDefault()` و`stopPropagation()`.
  - سمِّ المعالجات داخل الـ component بالشكل `handleX`، وسمِّ الـ callback props بالشكل `onX`، ليُقرأ تدفّق البيانات بوضوح.
  - استخدم عناصر `<button>` حقيقية للأشياء القابلة للنقر، حتى يستطيع مستخدمو لوحة المفاتيح والـ screen reader استخدامها أيضًا.
further:
  - title: Responding to Events
    url: https://react.dev/learn/responding-to-events
  - title: Common components (React event object)
    url: https://react.dev/reference/react-dom/components/common#react-event-object
  - title: "Event bubbling (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
quiz:
  - q: "الكود `<button onClick={setSelectedId(movie.id)}>Select</button>` يُسقط التطبيق بالخطأ «Too many re-renders». لماذا؟"
    options:
      - text: يُستدعى الـ setter أثناء الـ render، فيُطلق render آخر، يستدعيه مجددًا، إلى ما لا نهاية.
        why: صحيح. الأقواس المعقوصة تحتوي على استدعاء، فيُنفَّذ أثناء الـ render. اكتب `onClick={() => setSelectedId(movie.id)}` لتمرّر دالة بدلًا من ذلك.
      - text: "لا تقبل `onClick` إلا الدوال المعرّفة بالكلمة `function`."
        why: أي دالة تعمل، بما فيها الـ arrow functions. المشكلة أن هذا ليس دالة أصلًا؛ إنه نتيجة استدعاء.
      - text: الأزرار لا تستطيع تغيير الـ state؛ النماذج وحدها تستطيع.
        why: أي event handler يستطيع ضبط الـ state. ونقرة الزر هي الطريقة الأكثر شيوعًا لذلك.
    answer: 0
  - q: "يستقبل `MovieItem` الـ prop المسمّى `onRemove` من أبيه. والدالة `removeMovie(id)` في الأب تتوقّع معرّف فيلم. أيّ سطر صحيح داخل MovieItem؟"
    options:
      - text: "`<button onClick={onRemove}>Remove</button>`"
        why: تستدعي React الدالة `onRemove` مع حدث النقر، فيستقبل الأب كائن حدث بدل المعرّف.
      - text: "`<button onClick={onRemove(movie.id)}>Remove</button>`"
        why: هذا يستدعي `onRemove` أثناء الـ render ويحذف الفيلم فورًا، قبل أن ينقر أحد.
      - text: "`<button onClick={() => onRemove(movie.id)}>Remove</button>`"
        why: صحيح. تُنفَّذ الـ arrow function عند النقر وتستدعي `onRemove` بالوسيط الذي يتوقّعه الأب بالضبط.
      - text: "`<button onRemove={movie.id}>Remove</button>`"
        why: عناصر الـ DOM لا تعرف شيئًا عن `onRemove`. وحدها الأحداث الحقيقية مثل `onClick` تُربط.
    answer: 2
  - q: لبطاقة فيلم `onClick={openDetails}`، وبداخلها زر Remove له `onClick={() => onRemove(movie.id)}`. النقر على Remove يفتح التفاصيل أيضًا. ما الإصلاح؟
    options:
      - text: استدعِ `e.preventDefault()` في معالج Remove.
        why: توقف preventDefault الإجراء الافتراضي للمتصفّح، مثل إرسال نموذج. لكنها لا توقف انتشار النقرة صعودًا إلى البطاقة.
      - text: استدعِ `e.stopPropagation()` في معالج Remove قبل استدعاء `onRemove`.
        why: صحيح. تنتشر النقرة من الزر إلى البطاقة، وstopPropagation توقفها عند الزر.
      - text: انقل زر Remove إلى خارج الـ component.
        why: هذا ينجح بصريًا فقط إن سمح التخطيط بذلك، وهو يتجنّب المشكلة بدل أن يفهمها.
      - text: استخدم `onMouseDown` على زر Remove بدلًا من ذلك.
        why: يظل معالج النقر في البطاقة يعمل عند النقر، والأحداث الخاصة بالفأرة وحده تكسر الاستخدام بلوحة المفاتيح.
    answer: 1
  - q: لماذا يجب أن يكون عنوان الفيلم القابل للنقر `<button>` بدلًا من `<div onClick={…}>`؟
    options:
      - text: الـ onClick على div لا يعمل إلا في React 18 وما قبلها.
        why: يعمل onClick على أي عنصر في كل إصدارات React. المشكلة فيما يقدّمه العنصر للمستخدمين.
      - text: الأزرار تُرسم أسرع من الـ divs.
        why: سرعة الرسم متساوية. الفرق في السلوك المدمج وإمكانية الوصول.
      - text: تحذّر React من معالجات النقر على الـ divs وترفض تشغيلها.
        why: لا ترفض React؛ النقرة تعمل بالفأرة. مستخدمو لوحة المفاتيح والتقنيات المساعدة هم من يُتركون خارجًا.
      - text: الزر يقبل التركيز، ويعمل مع Enter وSpace، ويعلنه الـ screen reader كزر؛ والـ div لا يفعل شيئًا من ذلك.
        why: صحيح. ستضطر إلى إضافة role وtabIndex ومعالجات مفاتيح إلى الـ div لتحصل على ما يعطيك إياه الزر مجانًا.
    answer: 3
---

يتغيّر الـ state لأن شيئًا ما يحدث: نقرة، أو ضغطة مفتاح، أو إرسال نموذج. والتعامل مع الأحداث في React قريب من الـ DOM، مع بعض الأعراف التي تُبقي الـ components مقروءة، وفخّين يقع فيهما الجميع مرة على الأقل.

## مرّر الدالة، لا تستدعها

تربط event handler (معالج الحدث) بتمرير دالة إلى prop مثل `onClick`:

```jsx
export default function ClearButton({ onClear }) {
  function handleClick() {
    onClear();
  }

  return <button onClick={handleClick}>Clear watched</button>;
}
```

الأقواس المعقوصة تحمل `handleClick`، أي الدالة نفسها. تحتفظ بها React وتستدعيها حين تقع النقرة. قارن:

```jsx
// Right: passes the function. React calls it on click.
<button onClick={handleClick}>Clear watched</button>

// Wrong: calls it immediately, during render.
<button onClick={handleClick()}>Clear watched</button>
```

النسخة الثانية تنفّذ `handleClick` في كل مرة يُرسم فيها الـ component، وتمرّر قيمتها المُرجعة (`undefined`) كمعالج. وإذا كانت الدالة تضبط state، فستحصل على حلقة لا نهائية توقفها React بالخطأ «Too many re-renders». حين ترى هذا الخطأ، ابحث عن أقواس استدعاء داخل `onSomething={…}`.

## تمرير الوسائط

أغلب المعالجات في القوائم تحتاج إلى معرفة العنصر الذي نُقر عليه. غلّف الاستدعاء بـ arrow function:

```jsx
{movies.map((movie) => (
  <li key={movie.id}>
    {movie.title}
    <button onClick={() => onRemove(movie.id)}>Remove</button>
  </li>
))}
```

تُنشأ الـ arrow function أثناء الـ render لكنها لا تُنفَّذ إلا عند النقر، وحين تُنفَّذ تستدعي `onRemove` بالمعرّف الصحيح. إنشاء دالة صغيرة لكل عنصر أمر طبيعي ورخيص؛ لا تلوِ كودك لتتجنّبه.

## المعالجات كـ props

الـ components التي تملك state تمرّر المعالجات إلى الأسفل، ويستدعيها الأبناء ليبلّغوا بما حدث. والأعراف تجعل هذا مقروءًا:

- داخل الـ component، سمِّ المعالجات بالشكل **`handleSomething`**: `handleRemove` و`handleSubmit`.
- والـ props التي تستقبل المعالجات تُسمّى بالشكل **`onSomething`**: `onRemove` و`onToggle`، تماشيًا مع الأحداث المدمجة مثل `onClick`.

```jsx title=src/App.jsx
export default function App() {
  const [movies, setMovies] = useState(INITIAL_MOVIES);

  function handleRemove(id) {
    setMovies(movies.filter((m) => m.id !== id));
  }

  return <MovieList movies={movies} onRemove={handleRemove} />;
}
```

لا يعرف `MovieList` شيئًا عن طريقة الحذف. كل ما يعرفه أنه حين ينقر المستخدم Remove، يستدعي `onRemove(id)`. ويبقى الـ state، وقواعد تغييره، في مكان واحد.

## كائن الحدث

تستدعي React معالجك مع كائن حدث. إنه يغلّف الحدث الأصلي في المتصفّح، وله الواجهة المألوفة نفسها في كل متصفّح:

```jsx
function handleKeyDown(e) {
  if (e.key === 'Escape') {
    setSelectedId(null);
  }
}

<main onKeyDown={handleKeyDown}>…</main>
```

الخصائص التي ستستخدمها أكثر من غيرها هي `e.target` (العنصر الذي بدأ منه الحدث)، و`e.currentTarget` (العنصر الذي يعمل معالجه الآن)، و`e.key` لأحداث لوحة المفاتيح، ودالتان: `e.preventDefault()` و`e.stopPropagation()`.

## الانتشار والسلوك الافتراضي

الأحداث **تنتشر صعودًا (bubbling)**: النقرة على زر داخل بطاقة تُطلق معالج الزر، ثم معالج البطاقة، ثم معالج أي سلف. ولهذا يلتقط `onKeyDown` الموجود على `<main>` أعلاه ضغطة Escape حين يكون التركيز على أي زر بداخله. في الغالب يكون الانتشار ما تريده، لكن ليس دائمًا:

```jsx
<article onClick={() => onOpen(movie.id)}>
  <h2>{movie.title}</h2>
  <button
    onClick={(e) => {
      e.stopPropagation();
      onRemove(movie.id);
    }}
  >
    Remove
  </button>
</article>
```

من دون `stopPropagation`، سيفتح النقر على Remove تفاصيل الفيلم أيضًا. (جعل البطاقة كلها هدفًا للنقر راحة لمستخدمي الفأرة؛ فاحتفظ بزر أو رابط حقيقي لفتح التفاصيل أيضًا، حتى يصل إليها مستخدمو لوحة المفاتيح.) احتفظ بهذا النمط للحالات التي تحتاجه؛ فاللجوء إليه في كل مكان يجعل تدفّق الأحداث صعب المتابعة.

أمّا `preventDefault` فمختلفة: إنها توقف السلوك المدمج في **المتصفّح**، مثل انتقال رابط، أو إعادة تحميل الصفحة عند إرسال نموذج. ولا توقف الانتشار. ستستخدمها في نموذج Watchlist في الدرس التالي.

:::mistake الـ divs القابلة للنقر
الكود `<div onClick={select}>Arrival</div>` يعمل بالفأرة ولا شيء غيرها. لا يستقبل التركيز من لوحة المفاتيح، وEnter وSpace لا يفعلان شيئًا، والـ screen readers لا تعلنه كعنصر تفاعلي. استخدم `<button type="button">` للإجراءات و`<a href>` للتنقّل. ويمكنك تنسيق الزر ليبدو كما تشاء.
:::

## المعالجات هي مكان الآثار الجانبية

يجب أن تكون الـ components نقية أثناء الـ render، لكن معالجات الأحداث لا تعمل أثناء الـ render. إنها تعمل لأن المستخدم فعل شيئًا، فهي المكان الصحيح للآثار الجانبية (side effects): ضبط الـ state، والكتابة في localStorage، وإرسال طلب، وتسجيل التحليلات. وحين لا تكون متأكّدًا أين يجب أن يعيش كود ما، اسأل: «ما الذي تسبّب فيه؟» إذا كان الجواب إجراءً محدّدًا من المستخدم، فمكانه معالج ذلك الإجراء.

:::tip اقرأ الخطأ، واعثر على الأقواس
الخطأ «Too many re-renders» يعني في الغالب أن setter يُستدعى أثناء الـ render، وعادةً عبر `onClick={doSomething()}`. والمعالج الذي لا يفعل شيئًا بصمت، أو يطبع كائن حدث حيث كنت تتوقّع معرّفًا، مُرِّر غالبًا مباشرةً (`onClick={onRemove}`) بدل أن يُغلَّف بـ arrow function. وكلاهما ينشأ من طريقة تمرير الدالة.
:::

في الدرس التالي تتعامل مع أهم حدث في Watchlist، وهو إرسال النموذج الذي يضيف فيلمًا، وتتعلّم كيف تُبقي الـ controlled inputs حقول النموذج والـ state متزامنين.
