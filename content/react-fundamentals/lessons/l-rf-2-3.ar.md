---
summary: ابنِ components مرنة باستخدام الـ prop المسمّى children وفتحات JSX، وخصّص الـ components العامة، ومرّر العناصر إلى الأسفل لتتجنّب تمرير الـ props عبر طبقات لا تحتاجها.
takeaways:
  - كل ما تضعه بين وسمي الفتح والإغلاق لـ component يصل إليه في الـ prop المسمّى `children`.
  - يمكن للـ prop أن يحمل JSX، فيستطيع الـ component أن يوفّر عدّة slots مسمّاة مثل `actions` أو `footer`.
  - خصّص الـ component العام برسمه مع props مضبوطة مسبقًا بدلًا من نسخه.
  - تمرير عناصر جاهزة إلى الأسفل يغنيك غالبًا عن تمرير البيانات عبر components لا تستخدمها.
further:
  - title: Passing JSX as children
    url: https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children
  - title: Passing Data Deeply with Context (consider composition first)
    url: https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context
quiz:
  - q: |
      ما الذي يُعرض داخل `<section>`؟
      ```jsx
      function Panel({ title }) {
        return <section><h2>{title}</h2></section>;
      }

      <Panel title="To watch">
        <MovieList movies={movies} />
      </Panel>
      ```
    options:
      - text: العنوان ثم قائمة الأفلام.
        why: تُمرَّر القائمة كـ `children`، لكن Panel لا يعرض `children` أبدًا، فتسقط بصمت.
      - text: العنوان فقط؛ القائمة تُمرَّر كـ `children` لكن Panel لا يعرضها أبدًا.
        why: صحيح. الـ JSX المتداخل يصبح الـ prop المسمّى `children`، ويجب أن يضع Panel القيمة `{children}` في مكان ما من مخرجاته.
      - text: خطأ، لأن Panel لا يعلن عن معامل اسمه `children`.
        why: لا تشتكي React أبدًا من props غير مستخدمة، ولهذا يسهل أن يفوتك هذا الخطأ.
      - text: تحلّ قائمة الأفلام محلّ العنوان.
        why: الـ children لا تحلّ أبدًا محلّ مخرجات الـ component نفسه. إنها مجرّد prop آخر قد يعرضه الـ component.
    answer: 1
  - q: تحتاج إلى `Panel` له عنوان ومحتوى وأزرار اختيارية في الزاوية العليا. أيّ واجهة استخدام هي الأكثر مرونة ووضوحًا؟
    options:
      - text: prop اسمه `buttons` يحمل مصفوفة من نصوص التسميات، ويُنشئ Panel الأزرار.
        why: سيضطر Panel إلى معرفة معالجات النقر والأيقونات وحالات التعطيل، وستكبر واجهته بلا نهاية.
      - text: componentان منفصلان `PanelWithButtons` و`PanelWithoutButtons`.
        why: نسخ الـ component لكل شكل (variant) يضاعف الكود الذي تصونه، ومع ذلك لا يغطّي الحالات الجديدة.
      - text: مرّر الـ markup الكامل للوحة كنص واعرضه باستخدام `dangerouslySetInnerHTML`.
        why: هذا يتخلّى كليًا عن تهريب React للنصوص وعن الـ components. إنه غير آمن وأصعب كثيرًا في التعديل.
      - text: "prop اسمه `actions` يأخذ JSX، مثل `actions={<button onClick={shuffle}>Shuffle</button>}`."
        why: صحيح. الـ slot من نوع JSX يتيح للمستدعي تمرير أي عناصر بمعالجاتها الخاصة، ولا يقرّر Panel إلا مكانها.
    answer: 3
  - q: "يملك `App` المصفوفة `movies`. ويرسم `Layout` الـ component المسمّى `Sidebar`، الذي يرسم `WatchCount`، وهو الوحيد الذي يحتاج إلى `movies`. ما الحل بالتركيب (composition) لتجنّب تمرير `movies` عبر Layout وSidebar؟"
    options:
      - text: في App، ارسم `<Layout sidebar={<WatchCount movies={movies} />} />`، ودع Layout يضع `sidebar` في مكانه.
        why: صحيح. يُنشئ App العنصر بالبيانات التي يملكها أصلًا. أمّا Layout وSidebar فيكتفيان بتحديد موضعه ولا يريان `movies` أبدًا.
      - text: اجعل `movies` متغيّرًا عامًا يستورده WatchCount.
        why: البيانات القابلة للتغيير في مستوى الـ module لا تُطلق re-render، وتجعل الـ components صعبة الاختبار وإعادة الاستخدام.
      - text: انسخ `movies` إلى state داخل WatchCount.
        why: النسخة الثانية تصبح قديمة حين تتغيّر أفلام App. يجب أن يكون للبيانات مالك واحد.
    answer: 0
  - q: يأخذ الـ component المسمّى `Button` الـ prop `icon` ويعرض `<span>{icon}</span>`. أيّ استدعاء يعرض أيقونة نجمة؟
    options:
      - text: "`<Button icon={StarIcon}>Rate</Button>`"
        why: هذا يمرّر دالة الـ component نفسها. تحذّر React من أن الدوال ليست ابنًا صالحًا ولا تعرض شيئًا.
      - text: "`<Button icon=\"StarIcon\">Rate</Button>`"
        why: هذا يمرّر النص "StarIcon"، فيُعرض كهذه الحروف.
      - text: "`<Button icon={<StarIcon />}>Rate</Button>`"
        why: صحيح. `<StarIcon />` عنصر React يمكن عرضه في أي مكان، والـ slot يتوقّع عناصر.
    answer: 2
---

سيحتوي Watchlist على عدّة صناديق متشابهة: لوحة «To watch»، ولوحة «Watched»، وربما لوحة «Recommendations» لاحقًا. لكل منها شريط عنوان، وأحيانًا زر أو اثنان على الجانب، ومحتوى مختلف في الداخل. يمكنك إضافة prop لكل نوع محتمل من المحتوى. أو يمكنك أن تدع المستدعي يضع ما يشاء في الداخل، كما تضع أي شيء داخل `<div>`.

هذا النهج الثاني هو التركيب (composition)، وبه تُبنى أغلب الـ components المرنة في React.

## الـ prop المسمّى `children`

كل ما تضعه بين وسمي component يصل إليه كـ prop اسمه `children`:

```jsx title=src/components/Panel.jsx
export default function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="panel-body">{children}</div>
    </section>
  );
}
```

```jsx title=src/App.jsx
<Panel title="To watch">
  <MovieList movies={toWatch} />
</Panel>

<Panel title="Watched">
  <p>You've watched {watched.length} movies.</p>
</Panel>
```

لا يعرف `Panel` ما في الداخل ولا يهمّه. هو يملك الإطار (الـ section والعنوان والتنسيق)، والمستدعي يملك المحتوى. لقد استخدمت هذا طوال الوقت من دون أن تلاحظ: `<main>` و`<section>` يأخذان children أيضًا.

يمكن لـ `children` أن يكون أي شيء قابل للعرض: عنصرًا واحدًا، أو عدّة عناصر، أو نصًا، أو لا شيء. تعامل معه كصندوق مغلق واعرضه في مكانه. لا تفحصه ولا تعدّه ولا تعدّله؛ وإذا احتاج الغلاف إلى معرفة شيء عن محتواه، فيجب أن تصله تلك المعلومة كـ prop عادي.

تظهر الفائدة حين يتغيّر التصميم. إذا حصلت اللوحات الشهر القادم على زوايا دائرية وظل، فستعدّل `Panel` مرة واحدة وتتحدّث كل لوحة في التطبيق، مهما كان محتواها.

:::mistake نسيان عرض الـ children
إذا كان `Panel` يفكّك `title` فقط ولا يُخرج `{children}` أبدًا، فسيختفي كل ما بداخله من دون أي خطأ. لا تحذّر React من الـ props غير المستخدمة. حين يختفي محتوى داخل غلاف، تأكّد أن الغلاف يعرض `children`.
:::

## أكثر من slot واحد

الـ `children` هو slot (فتحة) واحد. وحين يحتاج الـ component إلى محتوى في عدّة أماكن، استخدم props عادية تحمل JSX. هذه لوحة فيها أزرار اختيارية في ترويستها:

```jsx title=src/components/Panel.jsx
export default function Panel({ title, actions, children }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{title}</h2>
        {actions}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
```

```jsx
<Panel
  title="To watch"
  actions={<button onClick={shuffle}>Shuffle</button>}
>
  <MovieList movies={toWatch} />
</Panel>
```

إذا لم يُمرَّر `actions` فقيمته `undefined`، وهي لا تعرض شيئًا، فيصبح الـ slot اختياريًا بلا أي جهد. قارن هذا بواجهة مثل `buttons={['Shuffle', 'Clear']}`: سيحتاج Panel إلى إنشاء الأزرار، وربط المعالجات، والتعامل مع الأيقونات وحالات التعطيل، وإضافة prop جديد مع كل طلب. أمّا مع الـ slot فيقرّر Panel *أين* توضع الأشياء، ويقرّر المستدعي *ما* هي.

:::tip عناصر، لا components
يأخذ الـ slot عنصرًا، `actions={<ShuffleButton />}`، لا component، `actions={ShuffleButton}`. الشكل الثاني يمرّر الدالة نفسها، وReact لا تستطيع عرض دالة كابن.
:::

## التخصيص

أحيانًا تريد نسخة ثابتة من component عام. لا تنسخه؛ بل ارسمه مع props مضبوطة مسبقًا:

```jsx title=src/components/Button.jsx
export function Button({ variant = 'neutral', children, ...rest }) {
  return (
    <button className={`btn btn-${variant}`} {...rest}>
      {children}
    </button>
  );
}

export function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}
```

الـ component المسمّى `DangerButton` هو `Button` اتُّخذ فيه قرار واحد مسبقًا. والـ `...rest` في `Button` يمرّر كل ما عدا ذلك، مثل `onClick` أو `type` أو `disabled`، إلى الـ `<button>` الحقيقي، فيستخدمه المستدعون كعنصر HTML الذي يعرفونه أصلًا. أصلِح خطأً في `Button` وستحصل كل الأشكال المشتقّة منه على الإصلاح.

## التركيب بدلًا من الـ prop drilling

هذه مشكلة يصادفها كل تطبيق. يملك `App` الأفلام. ويرسم `Layout` الـ component المسمّى `Sidebar`، والشريط الجانبي يعرض `WatchCount`. لا يحتاج إلى الأفلام إلا `WatchCount`، لكن لتوصيلها إليه تمرّرها عبر كل مستوى:

```jsx
<Layout movies={movies} />           // Layout doesn't use movies…
function Layout({ movies }) {
  return <Sidebar movies={movies} />; // …neither does Sidebar
}
```

تمرير البيانات عبر components لا تفعل سوى إعادة تمريرها يُسمّى **prop drilling** (حفر الـ props عبر الطبقات). إنه مملّ، وكل component وسيط صار يعتمد على بيانات لا يستخدمها.

والتركيب يزيله غالبًا. دع `App`، الذي يملك البيانات، يُنشئ العنصر، ودع `Layout` يضعه في مكانه:

```jsx
export default function App() {
  return (
    <Layout sidebar={<WatchCount movies={movies} />}>
      <MovieList movies={movies} />
    </Layout>
  );
}

function Layout({ sidebar, children }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}
```

لم يعد `Layout` يعرف أن الأفلام موجودة. صار component تخطيط خالصًا يمكنك إعادة استخدامه في أي صفحة. وتوفّر React أيضًا الـ **context** للبيانات التي تحتاجها components كثيرة متباعدة، مثل السمة الحالية أو المستخدم المسجّل دخوله. لكن توثيق React يوصي بتجربة التركيب أولًا، وهو ينجح في الغالب.

:::why القطع الصغيرة قطع قابلة للاختبار
الـ `Panel` الذي لا يفعل سوى ترتيب الـ slots الخاصة به، أو الـ `Layout` الذي لا يفعل سوى وضع أبنائه، يكاد لا يحتوي على منطق، فلا يكاد يوجد فيه ما ينكسر. يتركّز المنطق في components قليلة تملك البيانات. وهذا التقسيم يجعل الـ components أسهل في الاختبار وإعادة الاستخدام والفهم، وهو مهارة «تركيب شاشات معقّدة من قطع صغيرة» التي وعدت بها هذه الدورة.
:::

في الدرس التالي تجعل الـ components تعرض أشياء مختلفة بحسب البيانات، من شارة «Watched» إلى رسالة القائمة الفارغة، باستخدام العرض الشرطي.
