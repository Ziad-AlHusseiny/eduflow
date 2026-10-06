---
summary: اعرض القوائم من المصفوفات باستخدام map، وصفِّها ورتّبها من دون تعديل البيانات، واختر keys تحافظ على هوية كل عنصر وعلى الـ state الخاص به بين مرّات الـ render.
takeaways:
  - حوّل مصفوفة البيانات إلى مصفوفة عناصر باستخدام `map`، وضع الـ `key` على العنصر الخارجي الذي تُرجعه دالة الـ callback.
  - يُخبر الـ key React بهوية كل عنصر بين مرّات الـ render، لذا يجب أن يكون فريدًا بين الإخوة وثابتًا مع الوقت.
  - استخدم معرّفًا (id) من بياناتك كـ key؛ وأنشئ المعرّفات لحظة إنشاء العناصر، لا أثناء الـ render أبدًا.
  - الـ keys المبنية على الـ index تنكسر حين يمكن إعادة ترتيب القائمة أو تصفيتها أو الإدراج فيها، لأن الـ state يلتصق بالموضع بدل العنصر.
  - صفِّ نُسخًا من بياناتك ورتّبها أثناء الـ render؛ فالدالة `sort` تغيّر المصفوفة في مكانها، لذا استخدم `toSorted` أو رتّب نسخة.
further:
  - title: Rendering Lists
    url: https://react.dev/learn/rendering-lists
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
  - title: Array.prototype.toSorted() on MDN
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted
quiz:
  - q: |
      أين يوضع الـ key؟
      ```jsx
      function MovieList({ movies }) {
        return (
          <ul>
            {movies.map((movie) => (
              <MovieItem movie={movie} />
            ))}
          </ul>
        );
      }
      ```
    options:
      - text: على الـ `<li>` داخل MovieItem، بالشكل `<li key={movie.id}>`.
        why: تحتاج React إلى الـ keys على العناصر في المصفوفة التي تُرجعها من `map`. داخل MovieItem لا يوجد إلا `<li>` واحد، فالـ key هناك لا يفعل شيئًا.
      - text: على الـ `<ul>`، بالشكل `<ul key="movies">`.
        why: الـ `<ul>` ليس واحدًا من إخوة كثيرين. العناصر بداخله هي ما يجب على React التمييز بينها.
      - text: على MovieItem نفسه، بالشكل `<MovieItem key={movie.id} movie={movie} />`.
        why: صحيح. يوضع الـ key على العنصر الخارجي الذي تُرجعه دالة الـ callback في `map`، وهو هنا الـ component.
      - text: لا مكان له، لأن الـ components تحصل على keys تلقائية.
        why: ترجع React إلى الـ index وتحذّر أثناء التطوير. وهذا البديل بالضبط هو ما يسبّب الأخطاء حين تتغيّر القائمة.
    answer: 2
  - q: لكل صف فيلم حقل نصي لملاحظة. كتبت «Loved it» بجانب Arrival، ثم أضفت فيلمًا جديدًا في أعلى القائمة. مع `key={index}`، أين تنتهي «Loved it»؟
    options:
      - text: تبقى بجانب Arrival.
        why: هذا ما ستحصل عليه مع `key={movie.id}`. أمّا مع keys الـ index فتطابق React الصفوف حسب الموضع، لا حسب الفيلم.
      - text: بجانب الفيلم الجديد في الأعلى، لأن له الآن الـ index صفر، وهو الـ key الذي كان لصف Arrival.
        why: صحيح. تعيد React استخدام الصف ذي الـ key صفر، بما فيه حالة الـ DOM في حقله، لأي عنصر صار الآن في الموضع صفر.
      - text: تختفي، لأن كل الصفوف يُعاد إنشاؤها.
        why: لا تعيد React إنشاء الصفوف التي ما زالت keys الخاصة بها موجودة، بل تعيد استخدامها، ولهذا بالضبط تنتقل الملاحظة.
      - text: ترمي React خطأ بسبب تكرار الـ key.
        why: الـ indexes فريدة، فلا يوجد تكرار. الخطأ صامت، وهذا ما يجعله خطيرًا.
    answer: 1
  - q: أيّ key اختيار جيد للأفلام التي يضيفها المستخدم من خلال نموذج؟
    options:
      - text: "`key={Math.random()}` داخل دالة الـ callback في map."
        why: الـ key الجديد في كل render يجعل React تهدم كل صف وتعيد إنشاءه في كل مرة، فيضيع التركيز والـ state.
      - text: "`key={movie.title}`"
        why: العناوين ليست فريدة؛ هناك عدّة أفلام اسمها "Dune". والأخوان اللذان لهما الـ key نفسه يربكان React.
      - text: "`key={index}`، لأن المستخدم يضيف أفلامًا فقط."
        why: سيحذف المستخدمون ويصفّون ويرتّبون أيضًا. وتنكسر keys الـ index بمجرّد أن تتحرّك العناصر نسبةً إلى بعضها.
      - text: معرّف يُنشأ مرة واحدة بـ `crypto.randomUUID()` عند إضافة الفيلم، ويُخزَّن على كائن الفيلم.
        why: صحيح. يُنشأ المعرّف مع البيانات، ويبقى كما هو طوال عمر الفيلم، وهو فريد.
    answer: 3
  - q: "تأتي `movies` من الـ state. ما المشكلة في `const sorted = movies.sort((a, b) => b.year - a.year);` داخل كود الـ render؟"
    options:
      - text: "الدالة `sort` تعيد ترتيب `movies` في مكانها، فأنت تعدّل الـ state أثناء الـ render."
        why: صحيح. استخدم `movies.toSorted(…)` أو `[...movies].sort(…)` لترتيب نسخة وترك الـ state كما هو.
      - text: "الدالة `sort` لا تستطيع مقارنة الأرقام."
        why: مع دالة مقارنة مثل `(a, b) => b.year - a.year`، ترتّب sort الأرقام بشكل صحيح.
      - text: يجب أن يحدث الترتيب داخل effect، لا أثناء الـ render.
        why: حساب قيمة مشتقّة أثناء الـ render هو الصواب تمامًا. المشكلة في تغيير المصفوفة الأصلية.
    answer: 0
---

Watchlist قائمة. وكذلك صفحة المنشورات، وجدول الطلبات، ونتائج البحث، والقائمة الرئيسية. أغلب الواجهات قوائم من أشياء مبنية من مصفوفات بيانات، ونهج React هو ما قد تخمّنه من JavaScript نفسها: حوّل مصفوفة البيانات إلى مصفوفة عناصر.

## من البيانات إلى العناصر باستخدام `map`

```jsx title=src/components/MovieList.jsx
export default function MovieList({ movies }) {
  return (
    <ul>
      {movies.map((movie) => (
        <li key={movie.id}>
          {movie.title} ({movie.year})
        </li>
      ))}
    </ul>
  );
}
```

تُرجع `map` مصفوفة من عناصر `<li>`، وتعرض React المصفوفات بعرض كل عنصر فيها بالترتيب. لا توجد صياغة حلقات خاصة لتتعلّمها؛ إنها دالة المصفوفات التي تعرفها أصلًا.

والتصفية والترتيب الفكرة نفسها: جهّز المصفوفة، ثم طبّق عليها map. افعل ذلك أثناء الـ render، من البيانات التي لديك. القائمة الظاهرة مشتقّة، فلا تحتاج إلى أن تكون state.

```js run
const movies = [
  { id: 'a1', title: 'Arrival', year: 2016, watched: true },
  { id: 'p2', title: 'Past Lives', year: 2023, watched: false },
  { id: 'd3', title: 'Dune: Part Two', year: 2024, watched: false },
];

const toWatch = movies
  .filter((m) => !m.watched)
  .toSorted((a, b) => b.year - a.year);

console.log(toWatch.map((m) => m.title)); // ["Dune: Part Two", "Past Lives"]
console.log(movies[0].title);             // Arrival (the original order is untouched)
```

تُرجع `toSorted` نسخة مرتّبة، وهي مدعومة في كل المتصفّحات الحالية. أمّا `sort` الأقدم فتعيد ترتيب المصفوفة **في مكانها**. وإذا استُدعيت على state أو props، فهي تعدّل بصمت بيانات لا تملكها. وإن احتجت إلى دعم متصفّحات أقدم، فانسخ أولًا: `[...movies].sort(…)`.

## ما وظيفة الـ keys

كل عنصر في قائمة يحتاج إلى prop اسمه `key`، وتحذّرك React في الـ console حين يغيب. ويتّضح السبب حين تتغيّر القائمة.

حين تعيد React رسم قائمة، تكون لديها مصفوفة العناصر القديمة والجديدة. وعليها أن تطابق بينهما: أي عنصر جديد هو نفسه أي عنصر قديم؟ هذا مهمّ لأن كل عنصر قد يملك **state**، مثل ملاحظة نصف مكتوبة في حقل، أو زر عليه التركيز، أو قائمة مفتوحة، ويجب أن يبقى هذا الـ state مع العنصر الصحيح.

الـ key هو بطاقة اسم العنصر. تطابق React العناصر القديمة والجديدة حسب الـ key. الـ key نفسه: إنه العنصر نفسه، فتحتفظ React بالـ DOM والـ state الخاصين به وتحدّث ما تغيّر. key جديد: عنصر جديد، فتُنشئه React. key غائب: أُزيل العنصر، فتهدمه React.

:::figure keys الـ index مقابل keys المعرّف بعد الإدراج في الأعلى
<svg viewBox="0 0 700 290" role="img" aria-labelledby="t1">
  <title id="t1">قبل: لدى Arrival ملاحظة. بعد إضافة Dune في الأعلى مع keys الـ index، صار الـ key صفر يشير إلى Dune، فتقفز الملاحظة إلى Dune. ومع keys المعرّف، تبقى الملاحظة مع Arrival.</title>
  <text class="d-label-strong" x="110" y="24" text-anchor="middle">قبل</text>
  <rect class="d-box" x="20" y="40" width="180" height="40" rx="8"/>
  <text class="d-label" x="110" y="65" text-anchor="middle">0 · Arrival · "Loved it"</text>
  <rect class="d-box" x="20" y="90" width="180" height="40" rx="8"/>
  <text class="d-label" x="110" y="115" text-anchor="middle">1 · Past Lives</text>
  <text class="d-label-strong" x="350" y="24" text-anchor="middle">key={index}</text>
  <rect class="d-box-warn" x="255" y="40" width="190" height="40" rx="8"/>
  <text class="d-label" x="350" y="65" text-anchor="middle">0 · Dune · "Loved it"</text>
  <rect class="d-box" x="255" y="90" width="190" height="40" rx="8"/>
  <text class="d-label" x="350" y="115" text-anchor="middle">1 · Arrival</text>
  <rect class="d-box" x="255" y="140" width="190" height="40" rx="8"/>
  <text class="d-label" x="350" y="165" text-anchor="middle">2 · Past Lives</text>
  <text class="d-label-strong" x="590" y="24" text-anchor="middle">key={movie.id}</text>
  <rect class="d-box" x="495" y="40" width="190" height="40" rx="8"/>
  <text class="d-label" x="590" y="65" text-anchor="middle">d3 · Dune</text>
  <rect class="d-box-success" x="495" y="90" width="190" height="40" rx="8"/>
  <text class="d-label" x="590" y="115" text-anchor="middle">a1 · Arrival · "Loved it"</text>
  <rect class="d-box" x="495" y="140" width="190" height="40" rx="8"/>
  <text class="d-label" x="590" y="165" text-anchor="middle">p2 · Past Lives</text>
  <path class="d-arrow" d="M200 60 L253 60" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M200 60 C 330 220, 420 120, 493 110" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="230" text-anchor="middle">الـ key نفسه يعني الصف نفسه: الـ state يتبع الـ key</text>
  <text class="d-label-muted" x="350" y="256" text-anchor="middle">keys الـ index تتبع الموضع، وkeys المعرّف تتبع الفيلم</text>
</svg>
:::

## اختيار الـ key

الـ key الجيد **فريد بين الإخوة** و**ثابت**: للعنصر نفسه الـ key نفسه في كل render.

- **استخدم معرّفًا من بياناتك.** صفوف قاعدة البيانات وكائنات الـ API لها معرّف أصلًا.
- **أنشئ المعرّفات حين تُنشأ العناصر.** للأفلام المضافة عبر نموذج، ولّد المعرّف في المعالج الذي يضيفها: `{ id: crypto.randomUUID(), title, year }`. يُخزَّن على الكائن ولا يتغيّر أبدًا.
- **لا تولّد الـ keys أثناء الـ render أبدًا.** `key={Math.random()}` أو `key={crypto.randomUUID()}` داخل `map` ينتج keys جديدة في كل render. فتعامل React كل صف على أنه جديد تمامًا، وتهدم الـ DOM، وتُضيّع تركيز الحقل والـ state مع كل حرف تكتبه.
- **لا تستخدم محتوى غير فريد.** العناوين تتكرّر؛ هناك عدّة أفلام اسمها "Dune".

لا يلزم أن تكون الـ keys فريدة إلا بين الإخوة في القائمة نفسها. ويمكن لقائمتين مختلفتين استخدام المعرّفات نفسها.

:::mistake الـ index كـ key في قائمة تتغيّر
الكود `movies.map((movie, index) => <li key={index}>…)` يُسكت التحذير ويعمل حتى يتغيّر ترتيب القائمة. أدرج في الأعلى، أو احذف من المنتصف، أو رتّب، أو صفِّ، وستطابق React الصفوف حسب الموضع. يبقى الـ state والتركيز وقيم الحقول غير المتحكَّم بها في الموضع نفسه بينما تتحرّك البيانات. keys الـ index آمنة فقط للقوائم الثابتة التي لا يتغيّر ترتيبها أبدًا، مثل مجموعة ثابتة من روابط التذييل.
:::

## الـ keys على الـ components والـ fragments

يوضع الـ key على العنصر الخارجي الذي تُرجعه دالة الـ callback في `map`. وحين يكون ذلك component، ضعه على الـ component:

```jsx
{movies.map((movie) => (
  <MovieItem key={movie.id} movie={movie} />
))}
```

لا يستطيع `MovieItem` قراءة `key`؛ فـ React تستخدمه ولا تمرّره إلى الأسفل. وإذا احتاج الـ component إلى المعرّف، فمرّره بشكل منفصل كـ prop.

وحين يرسم كل عنصر عدّة إخوة من دون غلاف، استخدم الصيغة الطويلة للـ fragment، فهي تقبل key:

```jsx
import { Fragment } from 'react';

{movies.map((movie) => (
  <Fragment key={movie.id}>
    <dt>{movie.title}</dt>
    <dd>{movie.year}</dd>
  </Fragment>
))}
```

الصيغة القصيرة `<>…</>` لا تقبل key.

:::tip يمكن للـ keys أن تعيد ضبط component عمدًا
لأن الـ key الجديد يعني component جديدًا، فإن تغيير الـ key يجبر React على البدء من جديد. `<MovieDetails key={selectedId} … />` يعطي كل فيلم مختار لوحة تفاصيل جديدة بـ state جديد. إنها حيلة مفيدة ستراها مجددًا.
:::

صار بإمكانك عرض أي قائمة بشكل صحيح. وبهذا يكتمل Watchlist الثابت. في القسم التالي يبدأ بالحركة: الـ state يتيح للقائمة أن تتغيّر حين ينقر المستخدم ويكتب ويرسل.
