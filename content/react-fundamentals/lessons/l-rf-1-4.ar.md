---
summary: اقرأ JSX واكتبه من دون صراع مع المترجم، بمعرفة ما يتحوّل إليه، وكيف تعمل الأقواس المعقوصة، وما قواعد الخصائص والعرض التي تختلف عن HTML.
takeaways:
  - يتحوّل JSX إلى استدعاءات دوال تُنشئ كائنات JavaScript عادية تصف الواجهة، ثم تحوّل React هذه الكائنات إلى DOM.
  - تضمّ الأقواس المعقوصة أي تعبير JavaScript (قيمة)، لكنها لا تقبل أبدًا جملة مثل `if` أو `for`.
  - الخصائص أسماء JavaScript بصيغة camelCase، لذا تكتب `className` و`htmlFor` و`onClick`، وتمرّر إلى `style` كائنًا.
  - النصوص والأرقام تُعرض كنص، بينما `null` و`undefined` و`true` و`false` لا تعرض شيئًا، والكائنات العادية ترمي خطأ.
further:
  - title: Writing Markup with JSX
    url: https://react.dev/learn/writing-markup-with-jsx
  - title: JavaScript in JSX with Curly Braces
    url: https://react.dev/learn/javascript-in-jsx-with-curly-braces
  - title: Common components (props on every DOM element)
    url: https://react.dev/reference/react-dom/components/common
quiz:
  - q: إلى ماذا يتحوّل `<h2 className="title">{movie.title}</h2>` بعد أن يترجمه Vite؟
    options:
      - text: "استدعاء دالة يُنشئ كائنًا نوعه `'h2'` وخصائصه `{ className: 'title', children: movie.title }`."
        why: صحيح. JSX صياغة لإنشاء كائنات عناصر، وReact تقرأ هذه الكائنات لتقرّر أي DOM تُنشئ أو تحدّث.
      - text: نص HTML تُدرجه React باستخدام innerHTML.
        why: لا تبني React نصوص HTML أبدًا من أجل الرسم. ولهذا أيضًا يكون النص في JSX آمنًا افتراضيًا من حقن HTML.
      - text: عنصر `HTMLHeadingElement` حقيقي يُنشأ باستخدام `document.createElement`.
        why: JSX لا ينتج إلا كائنات وصف خفيفة. تُنشئ React عُقد الـ DOM أو تعيد استخدامها لاحقًا، في مرحلة الـ commit.
      - text: يبقى JSX كما هو ويفهمه المتصفّح مباشرة.
        why: المتصفّحات لا تفهم JSX. من دون خطوة ترجمة ترمي الصفحة خطأً في الصياغة.
    answer: 0
  - q: أيّ سطر هو JSX صحيح؟
    options:
      - text: "`<p>{if (watched) 'Seen'}</p>`"
        why: "`if` جملة وليست تعبيرًا، فلا يمكن وضعها داخل الأقواس المعقوصة. استخدم المعامل الثلاثي أو احسب القيمة قبل `return`."
      - text: "`<img src=\"{poster}\">`"
        why: علامات الاقتباس تجعلها النص الحرفي "{poster}"، والوسم غير مغلق. اكتب `src={poster}` وأغلق الوسم ذاتيًا بـ `/>`.
      - text: "`<label class=\"field\" for=\"title\">Title</label>`"
        why: "في JSX تُكتب هاتان الخاصيتان `className` و`htmlFor`، لأن `class` و`for` كلمتان محجوزتان في JavaScript."
      - text: "`<div style={{ marginTop: 8, fontWeight: 'bold' }}>Hi</div>`"
        why: صحيح. الأقواس الخارجية تُدخلك إلى JavaScript، والداخلية كائن، وخصائص CSS بصيغة camelCase. والرقم المجرّد يعني بكسلات.
    answer: 3
  - q: "قيمة `movie` هي `{ title: 'Arrival', year: 2016 }`. ماذا يحدث مع `<p>{movie}</p>`؟"
    options:
      - text: يُعرض النص "[object Object]".
        why: لا تستدعي React الدالة toString على الكائنات، بل ترفض عرضها أصلًا.
      - text: ترمي React الخطأ «Objects are not valid as a React child».
        why: صحيح. تستطيع React عرض النصوص والأرقام والعناصر ومصفوفات منها. اعرض حقلًا واحدًا بدلًا من ذلك، مثل `{movie.title}`.
      - text: يُعرض الكائن بصيغة JSON.
        why: لا تحوّل React الكائنات إلى نص نيابةً عنك. استخدم `JSON.stringify(movie)` إن كنت تريد فعلًا عرض JSON.
      - text: لا يُعرض شيء، تمامًا مثل `null`.
        why: وحدها `null` و`undefined` والقيم المنطقية لا تعرض شيئًا. أمّا الكائن العادي فخطأ.
    answer: 1
  - q: يحتوي وصف أحد الأفلام القادم من الـ API على `<b>Must watch</b>`. تعرضه بالشكل `<p>{movie.description}</p>`. ماذا يظهر؟
    options:
      - text: عبارة "Must watch" بخط عريض.
        why: لا تفسّر React النصوص على أنها HTML، وهذا يحميك من الـ markup المحقون.
      - text: خطأ، لأن النص يحتوي على أقواس زاوية.
        why: أي نص محتوى صالح. تهرّب React رموزه وتعرضه كنص.
      - text: النص الحرفي `<b>Must watch</b>` بوسومه كاملة.
        why: صحيح. تهرّب React محتوى النصوص، فيظهر الـ markup الموجود في البيانات كحروف بدل أن يُنفَّذ. وهذا خط دفاع أساسي ضد هجمات cross-site scripting.
    answer: 2
---

يبدو JSX مثل HTML، فيكون أول ما يخطر لك أن تكتب HTML. وهذا ينجح في أغلب الأحيان. ثم تكتب `class="card"` فيظهر تحذير في الـ console، أو تضع `if` داخل أقواس معقوصة فتحصل على خطأ ترجمة يشير إلى السطر الخطأ. كل واحدة من هذه المفاجآت تصبح منطقية حين ترى حقيقة JSX.

## JSX مجرّد استدعاءات دوال

يترجم Vite كل وسم JSX إلى استدعاء دالة. هذا الـ component:

```jsx
function MovieCard() {
  return <h2 className="title">Arrival</h2>;
}
```

يتحوّل إلى ما يشبه هذا:

```js
import { jsx } from 'react/jsx-runtime';

function MovieCard() {
  return jsx('h2', { className: 'title', children: 'Arrival' });
}
```

يُرجع الاستدعاء كائن JavaScript عاديًا اسمه **React element**: وصف خفيف لما يجب أن يظهر على الشاشة، له `type` وبعض الـ `props`. يمكنك تمثيل الفكرة بدالة صغيرة من عندك:

```js run
function h(type, props, ...children) {
  return { type, props: { ...props, children } };
}

const card = h('article', { className: 'card' },
  h('h2', null, 'Arrival'),
  h('p', null, 2016),
);

console.log(card.type);                         // article
console.log(card.props.className);              // card
console.log(card.props.children[0].props.children); // ["Arrival"]
```

عناصر React الحقيقية تحمل معلومات أكثر قليلًا، لكن الشكل هو نفسه. تمرّ React على شجرة الكائنات هذه وتُنشئ الـ DOM أو تحدّثه ليطابقها.

لاحظ أن الكود المترجَم يستورد `jsx` نيابةً عنك. لهذا لا تبدأ ملفات React الحديثة بالسطر `import React from 'react'`. الدروس القديمة تتضمّن هذا السطر لأن المترجم السابق كان يحوّل JSX إلى استدعاءات `React.createElement(…)`، التي تحتاج إلى وجود `React` في النطاق. ومنذ الـ JSX runtime التلقائي في React 17 لم يعد ضروريًا، فاحذفه.

:::figure يتحوّل JSX إلى كائن عنصر، ثم إلى DOM
<svg viewBox="0 0 700 200" role="img" aria-labelledby="t1">
  <title id="t1">يُترجَم مصدر JSX إلى استدعاء للدالة jsx، يُرجع كائنًا عاديًا له type وprops؛ ثم ترسم React هذا الكائن في عقدة DOM حقيقية.</title>
  <rect class="d-box" x="10" y="50" width="190" height="90" rx="12"/>
  <text class="d-label-muted" x="105" y="40" text-anchor="middle">ما تكتبه</text>
  <text class="d-code" x="105" y="100" text-anchor="middle">&lt;h2&gt;Arrival&lt;/h2&gt;</text>
  <rect class="d-box-primary" x="250" y="50" width="200" height="90" rx="12"/>
  <text class="d-label-muted" x="350" y="40" text-anchor="middle">ما ينتجه المترجم</text>
  <text class="d-code" x="350" y="88" text-anchor="middle">{ type: 'h2',</text>
  <text class="d-code" x="350" y="110" text-anchor="middle">  props: {…} }</text>
  <rect class="d-box-success" x="500" y="50" width="190" height="90" rx="12"/>
  <text class="d-label-muted" x="595" y="40" text-anchor="middle">ما تثبّته React</text>
  <text class="d-label-strong" x="595" y="100" text-anchor="middle">عقدة DOM &lt;h2&gt;</text>
  <path class="d-arrow" d="M200 95 L248 95" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M450 95 L498 95" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="350" y="180" text-anchor="middle">عناصر React أوصاف، لا عُقد DOM</text>
</svg>
:::

حين تعرف أن JSX استدعاءات دوال، تتوقّف القواعد التالية عن الظهور كأنها اعتباطية.

## الأقواس المعقوصة تحمل تعبيرات

داخل JSX، تعيدك `{ }` إلى JavaScript. وكل ما تضعه بداخلها يصبح وسيطًا لاستدعاء دالة، لذا يجب أن يكون **تعبيرًا (expression)**: شيئًا ينتج قيمة.

```jsx
function MovieCard() {
  const movie = { title: 'Arrival', year: 2016, rating: 8 };
  const age = 2026 - movie.year;

  return (
    <article>
      <h2>{movie.title.toUpperCase()}</h2>
      <p>{movie.year} · {age} years old</p>
      <p>{movie.rating >= 8 ? 'Must watch' : 'Maybe'}</p>
    </article>
  );
}
```

المتغيّرات والوصول إلى الخصائص واستدعاء الدوال والعمليات الحسابية والمعامل الثلاثي `a ? b : c` كلها تعبيرات. أمّا `if` و`for` و`const` فجُمل (statements)، فلا يمكن وضعها داخل الأقواس، تمامًا كما لا يمكنك تمرير `if (x) {}` وسيطًا لدالة. وحين يكبر المنطق، احسب متغيّرًا فوق `return` واستخدمه.

هذه هي البطاقة نفسها مع وصف يحتاج إلى تفرّع حقيقي. تعيش جملة `if` في JavaScript عادية فوق `return`، ولا يستقبل JSX إلا القيمة النهائية:

```jsx
function MovieCard({ movie }) {
  let label;
  if (movie.rating >= 9) {
    label = 'Masterpiece';
  } else if (movie.rating >= 7) {
    label = 'Must watch';
  } else {
    label = 'Maybe';
  }

  return <p>{movie.title}: {label}</p>;
}
```

هذا النمط يتوسّع جيدًا. يبقى الـ JSX صورة مقروءة للمخرجات، وتبقى القرارات في كود عادي يمكنك قراءته واختباره وتتبّع أخطائه كأي دالة أخرى. (الـ `{ movie }` في قائمة المعاملات prop؛ ستتعلّم الـ props كما يجب في القسم التالي.)

الخصائص تأخذ أقواسًا معقوصة أيضًا: `<img src={movie.poster} alt={movie.title} />`. لا تضع الأقواس داخل علامات اقتباس؛ فـ `src="{poster}"` هو النص الحرفي `{poster}`.

## الخصائص أسماء JavaScript

لأن الـ props تصبح مفاتيح في كائن JavaScript، فهي تتبع قواعد التسمية في JavaScript:

- `class` تصبح `className`، و`for` تصبح `htmlFor` (كلتاهما كلمة محجوزة في JS).
- الخصائص المكوّنة من عدّة كلمات تُكتب بصيغة camelCase: `onClick` و`tabIndex` و`autoComplete` و`maxLength`.
- خصائص `aria-*` و`data-*` تحتفظ بالشَّرطات: `aria-label="Remove"` و`data-id="42"`.
- تأخذ `style` كائنًا، بخصائص CSS بصيغة camelCase: `style={{ marginTop: 8 }}`. والرقم المجرّد يعني بكسلات في أغلب الخصائص. والأقواس المزدوجة هي كائن حرفي داخل تعبير JSX.

## أغلق كل وسم

JSX أكثر صرامة من HTML. كل عنصر يجب أن يُغلق: `<img />` و`<input />` و`<br />`. والـ component يُرجع جذرًا واحدًا، ملفوفًا بـ fragment `<>…</>` إن احتجت إلى عناصر متجاورة. والتعليقات توضع داخل أقواس معقوصة: `{/* like this */}`.

## ما الذي يمكن عرضه

| ما تضعه بين الأقواس | ما يظهر |
|---|---|
| نص أو رقم | النص نفسه (بما في ذلك `0`) |
| عنصر React | ذلك العنصر |
| مصفوفة من العناصر | كل عنصر بالترتيب |
| `null` و`undefined` و`true` و`false` | لا شيء |
| كائن عادي | خطأ: «Objects are not valid as a React child» |

صفّ «لا شيء» هو ما يجعل العرض الشرطي ممكنًا، والـ `0` في الصف الأول فخّ شهير ستقابله في درس العرض الشرطي.

:::mistake عرض كائن كامل
الكود `<p>{movie}</p>` يُسقط التطبيق بالخطأ «Objects are not valid as a React child». في الغالب كنت تقصد حقلًا واحدًا: `{movie.title}`. وإن أردت فحص البيانات أثناء تتبّع خطأ، فاعرض `{JSON.stringify(movie)}` مؤقتًا.
:::

:::why النص يُهرَّب نيابةً عنك
تهرّب React كل نص تعرضه. إذا احتوى عنوان فيلم قادم من API على `<script>`، فسيظهر كحروف مرئية بدل أن يُنفَّذ. تحصل على حماية من حقن HTML مجانًا، ما دمت لا تتجاوزها باستخدام `dangerouslySetInnerHTML`.
:::

صار بإمكانك قراءة أي JSX وتوقّع ما يفعله. في القسم التالي تتوقّف عن كتابة "Arrival" يدويًا، وتتعلّم التفكير بالـ components، فتقسّم شاشة كاملة إلى قطع تستقبل بياناتها عبر الـ props.
