---
summary: صمّم component API يستخدم variants من نوع enum بدل الأعلام المنطقية، ومفردات props موحّدة، وتمريرًا للسمات الأصلية، وslots للمحتوى، مع Button الخاص بـ Northwind مثالًا.
takeaways:
  - استخدم prop واحدًا من نوع enum مثل `variant` للخيارات المتنافية؛ فالقيم المنطقية المنفصلة تسمح بتركيبات لا معنى لها.
  - اجعل أسماء الـ props وقيمها متطابقة عبر المكوّنات، حتى يعني `size="sm"` الشيء نفسه على Button وInput وSelect.
  - مرّر السمات الأصلية والـ `ref` إلى العنصر الأساسي، حتى لا يحجب المكوّن أبدًا ما يقدّمه HTML أصلًا.
  - القيم الافتراضية قرارات تصميم؛ اختر الخيار الآمن والشائع، مثل `type="button"` والـ variant الثانوي.
further:
  - title: "<button>: The Button element (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button
  - title: forwardRef, and ref as a prop in React 19 (React docs)
    url: https://react.dev/reference/react/forwardRef
  - title: Using data attributes (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes
quiz:
  - q: يقبل Button القديم في Northwind القيم المنطقية `primary` و`danger` و`outline`. كتب أحد الفرق `<Button primary danger>`. ما مشكلة الـ API الأساسية؟
    options:
      - text: يجب أن تُسمّى القيم المنطقية `isPrimary` و`isDanger`.
        why: إعادة التسمية لا تمنع التركيبة المستحيلة؛ المشكلة في شكل الـ API لا في الأسماء.
      - text: لا يمكن تمرير القيم المنطقية بلا قيمة في JSX.
        why: السمات المنطقية المجرّدة صالحة في JSX وتعني `true`.
      - text: الخيارات المتنافية مصمّمة كأعلام مستقلة، فتصبح التركيبات غير الصالحة ممكنة الكتابة.
        why: صحيح. prop واحد من نوع enum باسم `variant` يجعل الجمع بين `primary` و`danger` مستحيلًا.
      - text: يجب أن يرمي المكوّن خطأً حين يُحدَّد الاثنان.
        why: خطأ وقت التشغيل أفضل من الصمت، لكن يجب أن يجعل الـ API الخطأ مستحيل الكتابة من الأساس.
    answer: 2
  - q: زرّ Button داخل `<form>` يواصل إرسال النموذج حين يضغط الناس «Add stop». الـ Button يعرض `<button>` بلا `type`. ما أفضل إصلاح داخل نظام التصميم؟
    options:
      - text: توثيق أن على الفرق أن تمرّر دائمًا `type="button"`.
        why: التوثيق يساعد، لكن القيمة الافتراضية التي تسبّب الأخطاء ستظلّ تسبّبها لكل من يقرأ على عجل.
      - text: إزالة عنصر النموذج من المنتج.
        why: النموذج مشروع تمامًا؛ الخطأ في القيمة الافتراضية للمكوّن.
      - text: إيقاف حدث الإرسال داخل معالج النقر في الـ Button.
        why: هذا يكسر الحالات التي تريد فيها الفرق فعلًا زر إرسال.
      - text: جعل القيمة الافتراضية لـ `type` هي `"button"`، وترك الفرق تمرّر `type="submit"` حين تقصده.
        why: صحيح. القيمة الافتراضية الأصلية هي `submit`، وهي تفاجئ الناس؛ ويستطيع النظام اختيار القيمة الأكثر أمانًا.
    answer: 3
  - q: أيّ تصميم للـ props هو الأكثر اتّساقًا بين مكوّنات النظام؟
    options:
      - text: 'Button يستخدم `size="sm"`، وInput يستخدم `small`، وSelect يستخدم `compact`.'
        why: ثلاث صيغ لفكرة واحدة تجبر كل فريق على مراجعة التوثيق في كل مرة.
      - text: 'Button وInput وSelect كلها تستخدم `size` بالقيم `sm` و`md` و`lg`.'
        why: صحيح. مفردات واحدة تعني أنك تتعلّمها مرة واحدة وتخمّن بشكل صحيح في المكوّن التالي.
      - text: كل مكوّن يختار ما يُقرأ أفضل في سياقه.
        why: سهولة القراءة المحلية عبر أربعين فريقًا تتحوّل إلى ارتباك عام.
    answer: 1
---

كان لـ Button الذي أطلقته Northwind عام 2021 تسعة props: `primary`، `secondary`، `danger`، `small`، `large`، `outline`، `block`، `icon`، و`onPress`. والقيم المنطقية (boolean) السبع منها وحدها تسمح بـ 128 تركيبة، ووجدت الفرق معظمها. كان في التطبيق الإنتاجي `<Button primary danger small large>`. كان يعرض شيئًا ما، ولم يستطع أحد أن يقول ماذا كان يُفترض أن يكون. الـ component API عقدٌ مع كل فريق يستخدم المكوّن، وكأي عقد، الجزء الصعب هو ما يسمح به.

## الـ enums للاختيارات، والقيم المنطقية للحالات

القاعدة الأولى تخصّ شكل الـ props. إن كانت الخيارات **متنافية**، فمكانها prop واحد من نوع enum. وإن كان الشيء **يعمل أو لا يعمل**، فهو قيمة منطقية (boolean).

```tsx title=Button.tsx
type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};
```

حين يكون `variant` من نوع enum، لا يمكن أن يكون `primary` و`danger` صحيحين معًا؛ ونظام الأنواع يرفض ذلك قبل مراجعة الكود. أما `loading` فيبقى قيمة منطقية، لأن الزر إما في حالة تحميل أو لا، بشكل مستقل عن الـ variant الخاص به.

## مفردات واحدة عبر النظام

القاعدة الثانية هي الاتّساق بين المكوّنات. إن استخدم Button القيمة `size="sm"`، فكذلك يفعل Input وSelect وTabs وBadge، بالقيم الثلاث نفسها. وإن سمّى أحد المكوّنات معالج التغيير `onChange` ومرّر إليه القيمة الجديدة، فكلها تفعل ذلك. تحتفظ Northwind بمسرد API من صفحة واحدة لأسماء الـ props المشتركة، والمكوّنات الجديدة تعيد استخدام هذه الأسماء ما لم يوجد سبب قوي للخروج عنها.

وهذا أهمّ من أي قرار منفرد بشأن prop. المهندس الذي استخدم ثلاثة مكوّنات من Northwind يجب أن يستطيع تخمين API المكوّن الرابع بشكل صحيح. وكل تناقض ضريبة صغيرة يدفعها الجميع، كل يوم.

## لا تحجب المنصّة

القاعدة الثالثة: يجب ألا يسلب المكوّن أبدًا ما يقدّمه HTML أصلًا. الـ Button هو `<button>`، لذا يجب أن يقبل كل ما يقبله `<button>`، بما في ذلك سمات `aria-*`، وأن يمرّره:

```tsx title=Button.tsx
export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  startIcon,
  endIcon,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={['nw-button', rest.className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
    >
      {startIcon}
      <span className="nw-button__label">{children}</span>
      {endIcon}
    </button>
  );
}
```

لأن `ref` صار prop عاديًا في مكوّنات الدوال في React 19، فإنه يمرّ عبر `...rest` مع كل شيء آخر، فتعمل إدارة التركيز (focus) والـ tooltips دون تغليف إضافي. وللسبب نفسه تعمل `onClick` و`disabled` و`form` و`aria-describedby`.

:::mistake وراثة القيمة الافتراضية الأصلية لـ type
عنصر `<button>` الأصلي داخل نموذج تكون قيمته الافتراضية `type="submit"`. خسرت Northwind أسبوعًا بسبب نماذج dispatch تُرسَل حين يضغط الناس «Add stop». صار Button في النظام يستخدم افتراضيًا `type="button"`، والفرق تمرّر `type="submit"` حين تقصده. القيم الافتراضية قرارات تصميم: اختر القيمة الآمنة حين لا يقرأ الناس التوثيق.
:::

## الـ slots للمحتوى

الـ **slot** (الفتحة) مكان يمرّر فيه المستخدم محتوى بدل الإعدادات. `children` هو الـ slot الرئيسي؛ و`startIcon` و`endIcon` هما slots مسمّاة. قارن بين طريقتين لإضافة أيقونة:

```tsx
<Button icon="truck" iconPosition="left">Assign</Button>        // configuration
<Button startIcon={<TruckIcon />}>Assign</Button>               // slot
```

نسخة الإعدادات تحتاج أن يعرف الـ Button كل اسم أيقونة وكل موضع، ويُضاف إليها prop كلما أراد أحد شيئًا جديدًا. أما نسخة الـ slot فتقبل أي عنصر، فتستطيع الفرق تمرير مجموعة أيقونات مختلفة أو صورة رمزية صغيرة دون إصدار جديد. والدرس التالي يأخذ هذه الفكرة أبعد بكثير.

## الـ variants في CSS: حوّل الـ props إلى سمات

يكتب الـ Button قيم الـ props الخاصة به في السمتين `data-variant` و`data-size`، فيعكس الـ CSS الـ API واحدًا لواحد. وكل variant يغيّر الـ component tokens وحدها:

```css
.nw-button[data-variant="primary"] {
  --nw-button-bg: var(--nw-color-action-bg);
  --nw-button-text: var(--nw-color-action-text);
  --nw-button-border: transparent;
}
```

الـ data attributes تُبقي نقاط ربط الأنماط مقروءة في DevTools، حيث ترى `data-variant="primary"` بدل اسم class مولَّد بالـ hash لا يُقرأ، ولا يمكن جمعها في تركيبة عبثية كما يمكن مع classes مثل `.primary.danger`.

:::tip اختر الـ variant الافتراضي عن قصد
الـ variant الافتراضي في Northwind هو `secondary`. جعل `primary` اختيارًا صريحًا يدفع الفرق نحو إجراء أساسي واحد في كل عرض، وهو نمط تطلبه مبادئنا أصلًا. القيمة الافتراضية ليست محايدة؛ إنها الـ variant الذي ستراه أكثر من غيره في الإنتاج.
:::

## راجع الـ API قبل أن تبنيه

تكتب Northwind كود الاستخدام قبل كود المكوّن. كل اقتراح مكوّن جديد يبدأ بثلاثة مقاطع: الاستخدام الأكثر شيوعًا، والاستخدام الأعقد الذي طلبه أحد، واستخدام واحد *يجب* أن يكون مستحيلًا. ثم تطرح المراجعة أربعة أسئلة. هل تطابق أسماء الـ props مسرد الـ API؟ هل يمكن لأي تركيبة من الـ props أن تصف شيئًا بلا معنى؟ هل يمرّر المكوّن كل ما يدعمه عنصره الأصلي؟ وما الذي سيحتاجه الفريقان الثاني والثالث اللذان سيستخدمانه ولم يحتجه الفريق الأول؟

تستغرق هذه المراجعة نحو ثلاثين دقيقة. أما تغيير الـ API بعد أن يعتمد عليه عشرون فريقًا فيتطلّب إصدارًا رئيسيًا (major)، ودليل انتقال، وشهورًا من المتابعة، وهذا موضوع القسم 4.

في التمرين تكتب قواعد الـ variant والحجم لهذا الـ Button باستخدام الـ component tokens وحدها. وبعدها ترى ما يحدث حين يتجاوز المكوّن حدود الـ props كليًا.
