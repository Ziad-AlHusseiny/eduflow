---
summary: مرّر البيانات إلى الـ components عبر الـ props، وفكّكها مع قيم افتراضية، واختر بين تمرير الكائنات أو القيم المفردة، وتعامل مع الـ props كلقطات للقراءة فقط.
takeaways:
  - الـ props هي وسائط الـ component؛ تمرّرها React ككائن واحد تفكّكه عادةً في قائمة المعاملات.
  - النصوص يمكن تمريرها بين علامتي اقتباس؛ وكل قيمة أخرى، بما فيها الأرقام والقيم المنطقية، توضع بين أقواس معقوصة.
  - القيم الافتراضية في التفكيك (`watched = false`) لا تُطبَّق إلا حين يكون الـ prop غائبًا أو `undefined`.
  - لا يجوز للـ component أبدًا أن يغيّر الـ props الخاصة به؛ ولتغيير ما يُعرض، يمرّر الأب props جديدة.
  - في React 19 أصبح `ref` مجرّد prop عادي في الـ function components، فلم تعد بحاجة إلى `forwardRef`.
further:
  - title: Passing Props to a Component
    url: https://react.dev/learn/passing-props-to-a-component
  - title: Keeping Components Pure
    url: https://react.dev/learn/keeping-components-pure
  - title: Manipulating the DOM with Refs (ref as a prop)
    url: https://react.dev/learn/manipulating-the-dom-with-refs
quiz:
  - q: ما الذي يستقبله `MovieCard` في `year` هنا؟ `<MovieCard title="Arrival" year="2016" />`
    options:
      - text: الرقم 2016.
        why: القيم بين علامتي اقتباس نصوص دائمًا في JSX. لتمرير رقم استخدم الأقواس المعقوصة، `year={2016}`.
      - text: لا شيء، لأن `year` يجب أن يُعلَن مسبقًا.
        why: تقبل الـ components أي props تمرّرها؛ لا توجد خطوة إعلان في React مع JavaScript العادية.
      - text: النص "2016".
        why: صحيح. علامات الاقتباس تمرّر نصًا حرفيًا. يبدو العرض متطابقًا، لكن `year + 1` يعطي "20161" بدلًا من 2017.
      - text: خطأ، لأن الأرقام لا يمكن أن تكون props.
        why: أي قيمة JavaScript يمكن أن تكون prop، بما فيها الأرقام والكائنات والمصفوفات والدوال.
    answer: 2
  - q: |
      عُرِّف `MovieCard` بالشكل `function MovieCard({ title, watched = false })`. ويرسم الأب `<MovieCard title="Dune" watched={null} />`. ما قيمة `watched` داخل الـ component؟
    options:
      - text: "`null`"
        why: صحيح. القيم الافتراضية في التفكيك لا تحلّ إلا محلّ `undefined`. أمّا `null` الصريحة فتمرّ كما هي.
      - text: "`false`"
        why: كانت القيمة الافتراضية ستُطبَّق لو كان الـ prop غائبًا أو `undefined`، لكن `null` قيمة حقيقية.
      - text: "`undefined`"
        why: مرّر الأب `null`، وReact تمرّر الـ props كما هي.
    answer: 0
  - q: |
      المقصود من هذا الـ component أن يعرض السنة بالشكل "(2016)". ما الخطأ فيه؟
      ```jsx
      function MovieCard(props) {
        props.year = `(${props.year})`;
        return <p>{props.title} {props.year}</p>;
      }
      ```
    options:
      - text: لا خطأ فيه؛ هذه الطريقة المعتادة لتنسيق الـ props.
        why: الكتابة في الـ props تنقض العقد مع React. كائن الـ props ملك لـ render الأب.
      - text: الـ template literals غير مسموح بها داخل الـ components.
        why: الـ template literals جزء عادي من JavaScript ومقبولة في أي مكان. المشكلة في الإسناد.
      - text: يجب أن يستخدم `this.props` بدلًا من ذلك.
        why: "`this.props` خاص بالـ class components. أمّا الـ function components فتستقبل الـ props كوسيط."
      - text: إنه يعدّل الـ props. احسب قيمة جديدة بدلًا من ذلك، مثل `const label = '(' + year + ')'`.
        why: صحيح. الـ props لقطات للقراءة فقط. في وضع التطوير تجمّد React كائن الـ props، فيرمي الإسناد TypeError، وحتى لو لم يفعل، لاختفى التغيير في الـ render التالي.
    answer: 3
  - q: لديك كائن `movie` فيه `id` و`title` و`year` و`watched`. ولا يعرض `MovieItem` إلا العنوان وحالة المشاهدة. أيّ استدعاء هو الخيار الافتراضي الأوضح؟
    options:
      - text: "`<MovieItem {...movie} />`، لأن الـ spread أقصر."
        why: الـ spread يُخفي الـ props التي يستخدمها الـ component فعلًا، ويمرّر `id` و`year` اللذين لا يحتاجهما. مقبول أحيانًا، لكنه غير واضح كعادة.
      - text: "`<MovieItem movie={movie} />`، ويقرأ الـ component القيمتين `movie.title` و`movie.watched`."
        why: صحيح. تمرير الكائن كاملًا يُبقي الاستدعاءات قصيرة، وهو خيار افتراضي شائع ومقروء حين يكون الـ component متعلّقًا بذلك الشيء.
      - text: "`<MovieItem data={JSON.stringify(movie)} />`"
        why: يمكن للـ props أن تكون كائنات. التحويل إلى نص يضيف عملًا ويُضيّع البنية.
    answer: 1
---

الـ component المسمّى `MovieCard` من القسم 1 يقول «Arrival» دائمًا. والـ component الذي لا يعرض إلا فيلمًا واحدًا ليس قابلًا لإعادة الاستخدام؛ إنه قالب له استخدام واحد. الـ props تحلّ هذا: إنها الطريقة التي يسلّم بها الأب البيانات إلى الابن، تمامًا كما تسلّم البيانات إلى دالة عبر وسائطها.

## تمرير الـ props وقراءتها

مرّر الـ props كخصائص على وسم الـ component:

```jsx title=src/App.jsx
export default function App() {
  return (
    <main>
      <MovieCard title="Arrival" year={2016} watched />
      <MovieCard title="Past Lives" year={2023} watched={false} />
    </main>
  );
}
```

تجمعها React في كائن واحد، `{ title: 'Arrival', year: 2016, watched: true }`، وتمرّره كأول وسيط للـ component. وفي الغالب تفكّكه (destructuring) مباشرة في قائمة المعاملات:

```jsx title=src/components/MovieCard.jsx
export default function MovieCard({ title, year, watched }) {
  return (
    <article>
      <h2>{title}</h2>
      <p>{year}</p>
      <p>{watched ? 'Watched' : 'To watch'}</p>
    </article>
  );
}
```

ثلاث تفاصيل في الصياغة توقع الناس في الخطأ:

- **علامات الاقتباس تعني نصًا.** `year="2016"` يمرّر النص "2016". استخدم الأقواس المعقوصة لأي شيء آخر: `year={2016}` و`watched={false}` و`genres={['drama', 'sci-fi']}`.
- **الخاصية المجرّدة تعني `true`.** `<MovieCard watched />` مطابق لـ `watched={true}`، مثل `disabled` في HTML.
- **التفكيك اختياري.** `function MovieCard(props)` مع `props.title` يعمل أيضًا. لكن التفكيك يوثّق بنظرة واحدة الـ props التي يتوقّعها الـ component، ولهذا يستخدمه معظم الكود.

## القيم الافتراضية

امنح الـ prop قيمة افتراضية داخل نمط التفكيك:

```jsx
export default function MovieCard({ title, year, watched = false, genres = [] }) {
  return (
    <article>
      <h2>{title}</h2>
      <p>{year} · {genres.join(', ') || 'No genres yet'}</p>
      <p>{watched ? 'Watched' : 'To watch'}</p>
    </article>
  );
}
```

الآن يعمل `<MovieCard title="Dune" year={2021} />` من دون أن ينهار عند `genres.join`. تُطبَّق القيم الافتراضية حين يكون الـ prop غائبًا أو `undefined`، لكن ليس حين يكون `null`. إذا كانت بياناتك قد تحتوي على `null`، فتعامل معها صراحةً، باستخدام `genres ?? []` مثلًا.

## كائنات أم قيم مفردة؟

حين يكون الـ component متعلّقًا بشيء واحد، مرّر ذلك الشيء:

```jsx
<MovieCard movie={movie} />

function MovieCard({ movie }) {
  return <h2>{movie.title}</h2>;
}
```

هذا يُبقي أماكن الاستدعاء قصيرة، ويجعل غرض الـ component واضحًا. وسترى أيضًا الـ spread، `<MovieCard {...movie} />`، الذي يمرّر كل حقل كـ prop مستقل. إنه مريح، لكنه يُخفي ما يستخدمه الـ component فعلًا، ويمرّر حقولًا لا يحتاجها. استخدمه باعتدال، وعادةً في components تغليف صغيرة تمرّر الـ props إلى عنصر.

ولتمرير القيم المفردة ميزته أيضًا: الـ component الذي يأخذ `title` و`year` يستطيع عرض فيلم أو كتاب أو حلقة بودكاست. اختر بحسب مدى تخصّص الـ component. `MovieCard` متعلّق بالأفلام، فيكون `movie={movie}` طبيعيًا. أمّا `Card` العام فيجب أن يأخذ قيمًا بسيطة.

## الـ props لقطات للقراءة فقط

لا يجوز للـ component أبدًا أن يغيّر الـ props الخاصة به. الـ props ملك لـ render الأب: إنها لقطة لما قرّره الأب في تلك اللحظة. وفي وضع التطوير تجمّد React كائن الـ props أصلًا، فيرمي الإسناد إليه خطأ.

:::mistake تعديل الـ props لتنسيقها
يبدو `props.year = '(' + props.year + ')'` غير مؤذٍ، لكنه يكتب في كائن لا يملكه الـ component. اشتقّ قيمة جديدة بدلًا من ذلك: `const label = '(' + year + ')'`، أو استخدم template literal. القاعدة هي نفسها كما في الدالة النقية: اقرأ مدخلاتك، وأرجع نتيجة، ولا تغيّر شيئًا.
:::

إذن كيف تتغيّر البطاقة أصلًا؟ يرسمها الأب من جديد بـ props مختلفة. حين يصبح لدى `App` لاحقًا الأفلام في الـ state ويُعلَّم أحدها كمُشاهَد، يعيد `App` الـ render ويمرّر `watched={true}` إلى تلك البطاقة. البطاقة لا تحدّث نفسها؛ بل تُسلَّم بيانات جديدة. هذا التدفّق باتجاه واحد، من الأب إلى الابن، هو ما يجعل تطبيقات React قابلة للتوقّع: لتعرف لماذا تعرض بطاقةٌ شيئًا ما، تنظر إلى الأعلى في الشجرة.

## تمرير الدوال

يمكن للـ props أن تكون أي قيمة، بما فيها الدوال. وهكذا يُخبر الابن أباه بأن شيئًا قد حدث:

```jsx
<MovieCard movie={movie} onToggle={() => toggleWatched(movie.id)} />
```

البادئة `on` عُرف في تسمية الـ callback props، يتماشى مع أحداث الـ DOM مثل `onClick`. ستستخدم هذا النمط باستمرار في القسم 3، حيث يملك `App` الـ state ويطلب منه الأبناء تغييره.

## أصبح `ref` مجرّد prop

أحيانًا يحتاج الأب إلى عقدة الـ DOM الفعلية داخل ابن، مثلًا لنقل التركيز إلى حقل العنوان بعد إضافة فيلم. في React 19 يستقبل الـ function component الـ `ref` كأي prop آخر ويمرّره إلى عنصر:

```jsx
function TitleInput({ ref, ...rest }) {
  return <input ref={ref} {...rest} />;
}
```

الكود الأقدم يغلّف الـ components بـ `forwardRef` لفعل ذلك. لا تحتاجه في React 19، ومن المتوقّع أن يصبح متوقّفًا (deprecated). لكن هناك prop واحد ما زال مميّزًا: `key`، الذي ستقابله مع القوائم، تقرأه React ولا يصل أبدًا إلى الـ component الخاص بك.

:::tip أبقِ قوائم الـ props قصيرة
إذا كان الـ component يأخذ عشرة props، فهو في الغالب يؤدّي عملين. ابحث عن مجموعة props تنتقل معًا دائمًا، فإمّا أن تمرّرها ككائن واحد وإمّا أن تقسّم الـ component.
:::

تتيح الـ props للأب أن يضبط الابن بالبيانات. في الدرس التالي سترى كيف تمرّر أجزاء كاملة من JSX إلى component باستخدام `children`، وكيف يبني ذلك تخطيطات مرنة.
