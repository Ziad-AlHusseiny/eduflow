---
summary: اكتب components في React على شكل دوال عادية، وضع بعضها داخل بعض، وقسّمها إلى ملفات باستخدام import وexport، وتجنّب أخطاء التسمية والتداخل التي تكسرها.
takeaways:
  - الـ component دالة JavaScript يبدأ اسمها بحرف كبير وتُرجع JSX.
  - تستخدم الـ component كأنه وسم HTML، مثل `<MovieCard />`، وReact تستدعي الدالة نيابةً عنك.
  - امنح كل component قابل لإعادة الاستخدام ملفًا خاصًا به وصدّره، ثم استورده حيثما تحتاجه.
  - عرّف الـ components في المستوى الأعلى من الـ module، ولا تعرّفها أبدًا داخل component آخر.
further:
  - title: Your First Component
    url: https://react.dev/learn/your-first-component
  - title: Importing and Exporting Components
    url: https://react.dev/learn/importing-and-exporting-components
quiz:
  - q: |
      كتبتَ هذا الـ component واستخدمته بالشكل `<movieCard />`. لم يظهر شيء، وظهر في الـ console تحذير عن وسم غير معروف. لماذا؟
      ```jsx
      function movieCard() {
        return <article>Arrival</article>;
      }
      ```
    options:
      - text: يجب أن تُكتب الـ components على شكل arrow functions، لا بالكلمة المفتاحية `function`.
        why: تعمل الـ function declarations والـ arrow functions كلتاهما كـ components. الكلمة المفتاحية ليست المشكلة.
      - text: نسي الـ component أن يستدعي `createRoot`.
        why: تستدعي `createRoot` مرة واحدة في main.jsx للتطبيق كله، لا داخل كل component.
      - text: الوسوم ذات الحرف الصغير في JSX تُعامَل كعناصر HTML، فحاولت React إنشاء عنصر DOM اسمه `<moviecard>`.
        why: صحيح. لا تستدعي React دالتك إلا إذا بدأ الوسم بحرف كبير. غيّر الاسم إلى `MovieCard`.
      - text: لا يمكن أن يكون `<article>` العنصر الأعلى الذي يُرجعه الـ component.
        why: أي عنصر واحد، بما فيه `<article>`، يمكن أن يكون جذر الـ JSX الذي يُرجعه الـ component.
    answer: 2
  - q: أيّ سطر يستورد بشكل صحيح component يصدّره الملف `src/components/MovieCard.jsx` بالشكل `export default function MovieCard()`؟
    options:
      - text: "`import MovieCard from './components/MovieCard.jsx';`"
        why: صحيح. الـ default export يُستورد بلا أقواس معقوصة، ويمكنك تسميته بأي اسم (والالتزام بالاسم نفسه أحكم).
      - text: "`import { MovieCard } from './components/MovieCard.jsx';`"
        why: الأقواس المعقوصة تستورد named export. هذا الملف لا يحتوي إلا على default export، فتكون القيمة المستوردة `undefined`.
      - text: "`import MovieCard from 'MovieCard';`"
        why: الاسم المجرّد مثل 'MovieCard' يُبحث عنه في node_modules. ملفاتك الخاصة تحتاج إلى مسار نسبي.
    answer: 0
  - q: |
      عرّف زميلك `Badge` داخل `MovieCard`. ما المشكلة التي يسبّبها ذلك؟
      ```jsx
      export default function MovieCard() {
        function Badge() {
          return <span>New</span>;
        }
        return <article><Badge /></article>;
      }
      ```
    options:
      - text: إنه خطأ في الصياغة؛ لا يمكن تداخل الدوال في ملفات JSX.
        why: الدوال المتداخلة كود JavaScript صحيح. الكود يعمل، والمشكلة تظهر أثناء التشغيل.
      - text: لا يمكن تصدير `Badge`، فلا تستطيع الاختبارات استيراده.
        why: هذا عيب ثانوي. المشكلة الحقيقية هي ما يحدث لـ Badge في كل render.
      - text: ترسم React الـ component المسمّى `Badge` مرتين، مرة لكل دالة.
        why: لا شيء يُرسم مرتين هنا. الثمن الحقيقي أن Badge يُعاد إنشاؤه من الصفر.
      - text: كل render لـ `MovieCard` ينشئ دالة `Badge` جديدة تمامًا، فتتخلّص React من الـ DOM والـ state الخاصين بـ Badge وتعيد بناءهما في كل مرة.
        why: صحيح. ترى React نوع component مختلفًا في كل render فتعيد تركيبه. انقل `Badge` إلى المستوى الأعلى من الـ module.
    answer: 3
  - q: يُرجع App العنصرين `<Header /><MovieCard />` متجاورين، فيعرض Vite الرسالة «Adjacent JSX elements must be wrapped in an enclosing tag». ما أصغر إصلاح صحيح؟
    options:
      - text: أرجِع مصفوفة تضمّ الـ componentَين.
        why: المصفوفة تُعرض فعلًا، لكن React تُظهر تحذيرًا ما لم يكن لكل عنصر key، وهي غير مريحة للـ markup الثابت. هناك أداة أنظف لهذا.
      - text: غلّفهما بـ fragment بالشكل `<>…</>`، أو بعنصر له معنى مثل `<main>`.
        why: صحيح. الـ component يُرجع جذرًا واحدًا، والـ fragment يجمع العناصر من دون إضافة عقدة إلى الـ DOM.
      - text: استدعِ كل component كدالة، `Header()` و`MovieCard()`، واجمع النتائج.
        why: استدعاء الـ components كدوال يتجاوز آلية الرسم في React ويكسر الـ hooks بداخلها. استخدم وسوم JSX دائمًا.
    answer: 1
---

حاليًا يحتوي `App.jsx` على عنوان واحد. أمّا شاشة Watchlist الحقيقية ففيها ترويسة ونموذج وشريط فلترة وقائمة من بطاقات الأفلام، وبعض القطع تتكرّر مرات كثيرة. إن كتبت كل ذلك في دالة واحدة فستحصل على component من 300 سطر لا يرغب أحد في لمسه. الـ components تتيح لك أن تسمّي كل قطعة، وتكتبها مرة واحدة، وتعيد استخدامها.

## الـ component مجرّد دالة

هذا component كامل:

```jsx title=src/App.jsx
function Header() {
  return (
    <header>
      <h1>My Watchlist</h1>
      <p>Movies I want to see</p>
    </header>
  );
}

export default function App() {
  return (
    <main>
      <Header />
    </main>
  );
}
```

ثلاث قواعد تجعل هذا يعمل:

1. **إنه دالة تُرجع JSX.** الـ JSX هو الصياغة الشبيهة بـ HTML داخل `return`. ستتعلّم قواعده في الدرس التالي.
2. **اسمه يبدأ بحرف كبير.** الوسم `<Header />` يقول لـ React «استدعِ الدالة Header». أمّا `<header>` بالحرف الصغير فيعني عنصر HTML.
3. **تستخدمه كوسم، لا كاستدعاء دالة.** تكتب `<Header />` وReact تقرّر متى تستدعي `Header()`. وهذا ما يتيح لـ React أن تتتبّعه وتعيد رسمه (re-render) وتمنحه state لاحقًا.

الأقواس حول الـ JSX متعدّد الأسطر ليست شرطًا من React. وظيفتها منع JavaScript من إدراج فاصلة منقوطة تلقائيًا تُنهي `return` مبكرًا، فتُرجع `undefined` بصمت.

## components داخل components

تتداخل الـ components كما يتداخل HTML. أضف بطاقة فيلم واستخدمها مرتين:

```jsx title=src/App.jsx
function MovieCard() {
  return (
    <article>
      <h2>Arrival</h2>
      <p>2016</p>
    </article>
  );
}

export default function App() {
  return (
    <main>
      <Header />
      <MovieCard />
      <MovieCard />
    </main>
  );
}
```

لديك الآن بطاقتان متطابقتان. واضح أن هذا ليس مفيدًا بعد؛ يجب أن تعرض البطاقات أفلامًا مختلفة. تمرير البيانات إلى الـ component هو وظيفة الـ props، وستصل إليها في القسم 2. الآن لاحظ الشكل فقط: `App` هو الأب، و`Header` والبطاقتان `MovieCard` أبناؤه. كل تطبيق React شجرة من هذا النوع.

:::mistake تعريف component داخل component آخر
من المغري أن تكتب `function Badge() {…}` داخل `MovieCard` لأن `MovieCard` وحده يستخدمه. لا تفعل. كل render لـ `MovieCard` ينشئ دالة `Badge` جديدة، فترى React نوع component مختلفًا، وتهدم الـ DOM الخاص بـ Badge وأي state بداخله ثم تعيد إنشاءهما. عرّف الـ components دائمًا في المستوى الأعلى من الملف.
:::

## component واحد لكل ملف

عندما يُعاد استخدام component أو يكبر حتى يتجاوز شاشة واحدة، امنحه ملفًا خاصًا به. الترتيب المعتاد هو مجلد `src/components`:

```jsx title=src/components/MovieCard.jsx
export default function MovieCard() {
  return (
    <article>
      <h2>Arrival</h2>
      <p>2016</p>
    </article>
  );
}
```

```jsx title=src/App.jsx
import Header from './components/Header.jsx';
import MovieCard from './components/MovieCard.jsx';

export default function App() {
  return (
    <main>
      <Header />
      <MovieCard />
    </main>
  );
}
```

تمنحك JavaScript modules نوعين من التصدير:

- **التصدير الافتراضي (default export):** `export default function MovieCard()`. واحد لكل ملف، ويُستورد بلا أقواس: `import MovieCard from '…'`.
- **التصدير المُسمّى (named export):** `export function MovieCard()`. أي عدد في الملف، ويُستورد بأقواس: `import { MovieCard } from '…'`.

كلاهما جيد. كثير من الفرق تفضّل الـ named exports لأن الاسم ثابت، والمحرّرات تعيد تسميته في كل مكان نيابةً عنك. اختر أسلوبًا واحدًا لكل مشروع والتزم به. تستخدم هذه الدورة الـ default exports للـ components، تماشيًا مع الملف الذي أنشأه Vite.

:::tip سمِّ الملفات بأسماء الـ components
الملف `MovieCard.jsx` يصدّر `MovieCard`. وحين يقول بلاغ خطأ إن «بطاقة الفيلم تعرض السنة الخاطئة»، تعرف أي ملف تفتح من دون بحث.
:::

## الـ components يجب أن تكون متوقَّعة

قد تستدعي React دالة الـ component مرات كثيرة: مع كل تحديث، ومرتين تحت StrictMode، وأحيانًا حين تجهّز شاشة في الخلفية. لذلك يجب أن يتصرّف الـ component كالمعادلة الرياضية: مع المدخلات نفسها يُرجع الـ JSX نفسه، ولا يغيّر شيئًا خارجه أثناء الرسم. لا تعدّل متغيّرات عامة، ولا تجلب بيانات، ولا تلمس الـ DOM مباشرة داخل جسم الدالة. ستتعلّم أين يوضع هذا النوع من العمل (الـ event handlers والـ effects) في القسم 3.

إليك الفرق عمليًا. الـ component الذي ينفّذ `visits += 1` على متغيّر في مستوى الـ module سيعطي أرقامًا مختلفة في التطوير والإنتاج، لأن StrictMode يستدعيه مرتين. أمّا الـ component الذي يكتفي بقراءة مدخلاته وإرجاع JSX فيعطي الجواب نفسه مهما استدعته React.

## أرجِع جذرًا واحدًا

يُرجع الـ component عنصر JSX واحدًا. لإرجاع عناصر متجاورة من دون إضافة `<div>` زائد، غلّفها بـ **fragment**:

```jsx
export default function App() {
  return (
    <>
      <Header />
      <MovieCard />
    </>
  );
}
```

الـ fragment يجمع العناصر في كودك لكنه لا يضيف شيئًا إلى الـ DOM. استخدم عنصرًا حقيقيًا مثل `<main>` أو `<section>` حين يكون له معنى في بنية الصفحة، واستخدم الـ fragment حين لا يكون.

صار بإمكانك تقسيم الشاشة إلى قطع مسمّاة. في الدرس التالي تتعلّم قواعد JSX نفسه: لماذا نكتب `className` لا `class`، وكيف تعمل الأقواس المعقوصة، وإلى ماذا يتحوّل JSX حين يترجمه Vite.
