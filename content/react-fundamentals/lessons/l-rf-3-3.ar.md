---
summary: ابنِ نموذج إضافة الأفلام في Watchlist باستخدام الـ controlled inputs، وتعامل مع الإرسال والتحقّق من المدخلات، واعرف متى تكون الـ form actions وuseActionState في React 19 الخيار الأنسب.
takeaways:
  - الـ controlled input يأخذ `value` من الـ state ويبلّغ عن كل ضغطة مفتاح عبر `onChange`، فيكون الـ state المصدر الوحيد للحقيقة.
  - تعامل مع `onSubmit` على الـ `<form>` واستدعِ `e.preventDefault()`؛ فتحصل على الإرسال بـ Enter وعلى سلوك يدعم إمكانية الوصول مجانًا.
  - تحقّق من المدخلات انطلاقًا من الـ state أثناء الـ render، مثلًا بتعطيل الزر حين يكون العنوان بعد التشذيب فارغًا.
  - قيم الحقول نصوص دائمًا؛ حوّل الأرقام بنفسك، واستخدم `checked` لمربّعات الاختيار.
  - تمرّر الـ form actions في React 19 كائن `FormData` إلى دالة وتعيد ضبط النموذج؛ ويضيف `useActionState` نتيجة ومؤشّر انتظار.
further:
  - title: Reacting to Input with State
    url: https://react.dev/learn/reacting-to-input-with-state
  - title: "<input> reference (controlled inputs)"
    url: https://react.dev/reference/react-dom/components/input
  - title: "<form> reference (form actions)"
    url: https://react.dev/reference/react-dom/components/form
  - title: useActionState reference
    url: https://react.dev/reference/react/useActionState
quiz:
  - q: "ترسم `<input value={title} />` من دون `onChange`. ماذا يحدث حين يكتب المستخدم؟"
    options:
      - text: يتحدّث الحقل ويتحدّث الـ state المسمّى `title` تلقائيًا.
        why: لا تحدّث React الـ state نيابةً عنك أبدًا. الـ controlled input لا يتغيّر إلا حين تضبط الـ state الذي يقرأ منه.
      - text: لا يتغيّر شيء، وتحذّر React من أنك وفّرت `value` من دون معالج `onChange`.
        why: صحيح. كل render يعيد الحقل إلى `title`. أضف `onChange={(e) => setTitle(e.target.value)}`، أو استخدم `defaultValue` لحقل غير متحكَّم به.
      - text: يتحدّث الحقل، لكن `title` يبقى كما هو.
        why: هكذا يتصرّف الحقل غير المتحكَّم به مع `defaultValue`. أمّا مع `value` فتُبقي React الـ DOM متوافقًا مع الـ state.
      - text: ترمي React خطأ وتتوقّف عن الـ render.
        why: إنه تحذير في وضع التطوير، لا خطأ. كل ما في الأمر أن الحقل يصبح للقراءة فقط.
    answer: 1
  - q: حقل السنة هو `<input type="number" value={year} onChange={(e) => setYear(e.target.value)} />`. كتب المستخدم 2016. ما نوع `year`، وماذا يعطي `year + 1`؟
    options:
      - text: الرقم 2016، فيكون `year + 1` هو 2017.
        why: "الخاصية `type=\"number\"` لا تغيّر إلا لوحة المفاتيح والتحقّق. أمّا `e.target.value` فهي نص دائمًا."
      - text: الرقم 2016، لكن `year + 1` يعطي NaN.
        why: الرقم زائد 1 لا يكون NaN أبدًا. القيمة ليست رقمًا أصلًا.
      - text: "`undefined`، لأن حقول الأرقام تحتاج إلى `valueAsNumber`."
        why: "الخاصية `e.target.value` تعمل مع حقول الأرقام؛ لكنها تُرجع نصًا. و`valueAsNumber` بديل يُرجع رقمًا."
      - text: النص "2016"، فيكون `year + 1` هو "20161".
        why: صحيح. حوّل القيمة حين تستخدمها، مثلًا بـ `Number(year)`، واحتفظ بالنص الخام في الـ state حتى تعمل المدخلات الجزئية كالحقل الفارغ.
    answer: 3
  - q: "يضيف نموذجك فيلمًا ويجب أن يمسح العنوان بعد ذلك. أيّ `handleSubmit` صحيح مع controlled input؟"
    options:
      - text: "`e.preventDefault(); onAdd(title.trim()); setTitle('');`"
        why: صحيح. توقف preventDefault إعادة تحميل الصفحة، وتبلّغ onAdd عن الفيلم الجديد، وضبط الـ state على '' يمسح الـ controlled input.
      - text: "`onAdd(title); e.target.reset();`"
        why: من دون preventDefault يحاول المتصفّح الإرسال وإعادة التحميل. كما أن reset() لا تغيّر الـ state المسمّى `title`، فتعيد React القيمة القديمة في الـ render التالي.
      - text: "`e.preventDefault(); onAdd(title); title = '';`"
        why: إعادة إسناد المتغيّر لا تفعل شيئًا بالـ state؛ يظل الحقل يعرض العنوان القديم.
    answer: 0
  - q: متى تكون الـ form action في React 19 مع `useActionState` أنسب من الـ controlled inputs؟
    options:
      - text: حين تحتاج إلى تغيير ما يُعرض مع كل ضغطة مفتاح، مثل العدّ المباشر للحروف.
        why: الملاحظات المباشرة تحتاج إلى القيمة في الـ state أثناء الكتابة، وهذا ما تعطيك إياه الـ controlled inputs.
      - text: أبدًا؛ الـ actions لا تعمل إلا مع أطر عمل الخادم مثل Next.js.
        why: تعمل الـ form actions مع دوال عادية في المتصفّح داخل أي تطبيق React 19. والـ Server Functions استخدام اختياري واحد منها.
      - text: حين يهمّ النموذج أساسًا لحظة الإرسال، خصوصًا مع عمل غير متزامن، وتريد نتيجة أو خطأ مع مؤشّر انتظار.
        why: صحيح. تستقبل الـ action كائن FormData، ويخزّن `useActionState` ما تُرجعه، وتكون `isPending` قيمتها true أثناء تنفيذها.
      - text: حين يحتوي النموذج على حقل واحد فقط.
        why: عدد الحقول لا يحسم الأمر. المهمّ هو هل تتفاعل مع الكتابة أم مع الإرسال.
    answer: 2
---

كل تطبيق مفيد يستقبل مدخلات. في Watchlist يعني ذلك نموذجًا: اكتب عنوانًا، وسنة إن أردت، واضغط Enter أو انقر Add، فيظهر الفيلم في القائمة. النماذج هي المكان الذي يلتقي فيه الـ state بالأحداث، وفيها يعيش معظم أخطاء المبتدئين: حقول ترفض الكتابة، وصفحات يُعاد تحميلها عند الإرسال، وأرقام تُلصق ببعضها كالنصوص. ولكل واحد منها سبب واضح.

## الـ controlled input

في HTML العادي يملك الحقل قيمته، وأنت تقرؤها حين تحتاجها. أمّا في React فالأسلوب المعتاد يقلب ذلك: **الـ state يملك القيمة**، والحقل يعرضها.

```jsx title=src/components/AddMovieForm.jsx
import { useState } from 'react';

export default function AddMovieForm() {
  const [title, setTitle] = useState('');

  return (
    <form>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <p>{title.length}/80 characters</p>
    </form>
  );
}
```

هذا هو الـ **controlled input** (الحقل المتحكَّم به). كل ضغطة مفتاح تُطلق `onChange`، فيخزّن المعالج النص الجديد في الـ state، وتعيد React الـ render، ويعرض الحقل الـ state. يبدو هذا التفافًا، لكن النص الحالي صار الآن متغيّرًا عاديًا. يمكنك عرض عدد الحروف، والتحقّق أثناء الكتابة، وتعطيل زر، أو مسح الحقل بضبط الـ state على `''`.

لاحظ أن `onChange` في React يعمل مع كل ضغطة مفتاح، مثل حدث `input` في الـ DOM، لا فقط حين يفقد الحقل التركيز.

:::mistake الـ `value` من دون `onChange`
الكود `<input value={title} />` وحده يصنع حقلًا للقراءة فقط: كل render يعيد `title` إليه، فلا تفعل الكتابة شيئًا، وتحذّر React في الـ console. إمّا أن تضيف `onChange`، وإمّا، إن لم تكن تحتاج القيمة في الـ state، أن تستخدم `defaultValue` لتجعله غير متحكَّم به (uncontrolled). وهناك تحذير قريب، «changing an uncontrolled input to be controlled»، يعني أن `value` بدأت بقيمة `undefined`؛ فابدأ الـ state بـ `''`.
:::

## الإرسال

تعامل مع الإرسال على النموذج، لا على نقرة الزر:

```jsx title=src/components/AddMovieForm.jsx
export default function AddMovieForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const trimmed = title.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Title</label>
      <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit" disabled={!trimmed}>Add</button>
    </form>
  );
}
```

وجود `onSubmit` على النموذج يعني أن الضغط على Enter داخل الحقل يعمل، والزر يعمل، والتقنيات المساعدة تفهم النموذج، كل ذلك من دون كود إضافي. وتوقف `e.preventDefault()` السلوك الافتراضي للمتصفّح، وهو إرسال النموذج إلى رابط وإعادة تحميل الصفحة. ويبلّغ الـ component عن العنوان الجديد عبر `onAdd`، ويمسح الحقل بإعادة ضبط الـ state.

والتحقّق يأتي من الـ state أيضًا. تُشتقّ `trimmed` في كل render، فيكون الزر معطّلًا بالضبط ما دام العنوان فارغًا، بما في ذلك العنوان المكوّن من مسافات فقط. أمّا `if (!trimmed) return;` داخل المعالج فحارس ثانٍ تحسّبًا لإرسال النموذج بطريقة أخرى.

:::tip اعرض الأخطاء بجانب الحقل
حين تعرض رسالة مثل «Title is required»، اربطها بالحقل باستخدام `aria-describedby` الذي يشير إلى `id` الرسالة، واضبط `aria-invalid={true}` على الحقل. عندها تعلن الـ screen readers الخطأ حين يحصل الحقل على التركيز.
:::

## أنواع أخرى من الحقول

كل أنواع الحقول تتبع النمط نفسه مع فروق صغيرة:

```jsx
// Numbers arrive as strings. Keep the string in state, convert on use.
<input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
const yearNumber = year === '' ? null : Number(year);

// Checkboxes use checked, not value.
<input type="checkbox" checked={watched} onChange={(e) => setWatched(e.target.checked)} />

// A select is controlled through value on the <select>.
<select value={genre} onChange={(e) => setGenre(e.target.value)}>
  <option value="drama">Drama</option>
  <option value="sci-fi">Sci-fi</option>
</select>
```

حالة الأرقام توقع الجميع مرة على الأقل: `e.target.value` نص دائمًا، حتى مع `type="number"`، فيعطي `year + 1` النتيجة "20161". والاحتفاظ بالنص الخام في الـ state يعني أيضًا أن الحقل الفارغ يبقى فارغًا بدل أن يتحوّل إلى `0`.

## React 19: الـ form actions

الـ controlled inputs هي الأفضل حين تتفاعل مع كل ضغطة مفتاح. لكن نماذج كثيرة لا تهمّ إلا لحظة الإرسال، وقد أضاف React 19 دعمًا مباشرًا لها: مرّر **دالة** إلى الخاصية `action` في النموذج.

```jsx
function QuickAdd({ onAdd }) {
  function addAction(formData) {
    onAdd(formData.get('title').trim());
  }

  return (
    <form action={addAction}>
      <input name="title" required />
      <button type="submit">Add</button>
    </form>
  );
}
```

تمنع React إعادة تحميل الصفحة نيابةً عنك، وتستدعي دالتك مع كائن `FormData` مبني من خصائص `name` في الحقول، وتعيد ضبط الحقول غير المتحكَّم بها حين تنتهي الـ action. فالحقول ليست متحكَّمًا بها أصلًا.

وحين تحتاج إلى نتيجة من الإرسال، مثل رسالة خطأ، أو إلى حالة انتظار أثناء عمل غير متزامن، أضف `useActionState`:

```jsx
import { useActionState } from 'react';

function QuickAdd({ onAdd }) {
  const [error, formAction, isPending] = useActionState(async (prevError, formData) => {
    const title = formData.get('title').trim();
    if (!title) return 'Title is required';
    await onAdd(title); // could be a request to a server
    return null;
  }, null);

  return (
    <form action={formAction}>
      <input name="title" aria-invalid={error ? true : undefined} />
      <button type="submit" disabled={isPending}>{isPending ? 'Adding…' : 'Add'}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

تستقبل الـ action الـ state السابق وبيانات النموذج، وتُرجع الـ state التالي. وتكون `isPending` قيمتها `true` أثناء تنفيذها. ويستطيع أي component ابن داخل النموذج أيضًا قراءة حالة الانتظار باستخدام `useFormStatus` من `react-dom`.

أيّهما تستخدم؟ خيار افتراضي معقول: الـ controlled inputs حين تتفاعل الواجهة أثناء الكتابة (العدّ، والتحقّق المباشر، والحقول المعتمدة على بعضها)؛ والـ actions حين يحدث العمل عند الإرسال، خصوصًا إن كان غير متزامن. نموذج الإضافة في Watchlist يعطّل زرّه ما دام العنوان فارغًا، لذا يستخدم controlled input، وهذا ما ستبنيه في التمرين.

:::why لماذا لا نقرأ الـ DOM فقط؟
يمكنك أخذ القيمة عبر `document.getElementById('title').value` عند الإرسال. ينجح هذا حتى تحتاج القيمة في أي مكان آخر: حالة تعطيل، أو معاينة، أو إعادة ضبط. أمّا الـ state فيعطيك مكانًا واحدًا تعيش فيه القيمة الحالية، ويمكن لكل جزء من الواجهة أن يعتمد عليه.
:::

في الدرس التالي تربط هذا النموذج بالقائمة. النموذج والقائمة أخوان، لذا يجب أن تعيش الأفلام في أبيهما المشترك. وهذا هو رفع الـ state للأعلى.
