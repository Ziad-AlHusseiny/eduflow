---
summary: تعرّف على انفجار الـ props واستبدله بمكوّنات مركّبة (compound components) تتشارك الحالة عبر الـ context، مع معرفة متى يبقى المكوّن الصغير المُعَدّ بالـ props هو الخيار الأفضل.
takeaways:
  - حين تضيف كل حالة استخدام جديدة prop جديدًا، فالمكوّن يُعَدّ من الخارج وسيظلّ يكبر؛ أما الـ composition (التركيب) فتسمح للمستخدمين بترتيب القطع بأنفسهم.
  - المكوّنات المركّبة مثل `Card.Header` و`Tabs.Trigger` تتشارك الحالة عبر الـ context، لا عبر فحص الأبناء (children).
  - يظلّ النظام مالكًا لشكل كل قطعة وسلوكها، فتضيف الـ composition مرونة دون التخلّي عن الاتّساق.
  - المكوّنات الصغيرة المغلقة مثل Badge أو Avatar لا بأس أن تُعَدّ بالـ props؛ والجأ إلى الـ composition حين تبدأ الـ props بوصف التخطيط أو المحتوى.
further:
  - title: Passing data deeply with context (React)
    url: https://react.dev/learn/passing-data-deeply-with-context
  - title: use (React API reference)
    url: https://react.dev/reference/react/use
  - title: Tabs pattern (WAI-ARIA Authoring Practices)
    url: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
quiz:
  - q: طلب أحد الفرق prop باسم `footerSecondaryActionIcon` على ShipmentCard. علامَ يدلّ هذا الطلب على الأرجح؟
    options:
      - text: أن البطاقة تحتاج prop واحدًا إضافيًا، ثم ستكتمل.
        why: كل prop «أخير» يتبعه آخر؛ والنمط يُظهر أن الـ API لا نهاية طبيعية له.
      - text: أن على الفريق أن يبني بطاقته الخاصة.
        why: النسخة المنفصلة تفقد أنماط النظام وإصلاحاته؛ المشكلة في شكل API البطاقة، لا في الفريق.
      - text: أن البطاقة تُعَدّ من الخارج، فتتحوّل قرارات التخطيط والمحتوى باستمرار إلى props.
        why: صحيح. slot للتذييل يقبل أي إجراءات كان سيستوعب هذا الطلب والطلبات العشرة التالية.
      - text: أن مجموعة الأيقونات ينقصها أيقونة.
        why: الطلب يتعلّق بمكان المحتوى، لا بالأيقونات الموجودة.
    answer: 2
  - q: كيف يجب أن يعرف `Tabs.Trigger` أيّ تبويب هو المحدّد؟
    options:
      - text: بقراءته من context يوفّره `Tabs`.
        why: صحيح. الـ context يعمل مهما كان عمق تداخل الـ trigger، وأيًّا كان الترتيب الذي يستخدمه المستخدم.
      - text: بأن يمرّ `Tabs` على أبنائه عبر `React.Children.map` ويحقن الـ props.
        why: هذا ينكسر بمجرّد أن يُغلَّف الـ trigger بعنصر آخر، مثل tooltip أو div للتخطيط.
      - text: بأن يقرأ كل trigger متغيّرًا عامًا (global).
        why: مجموعتا تبويبات في صفحة واحدة ستتنازعان على المتغيّر نفسه.
      - text: بأن يمرّر المستخدم `selected` لكل trigger يدويًا.
        why: ممكن، لكنه يلقي إدارة حالة المكوّن نفسه على كل فريق.
    answer: 0
  - q: أيّ مكوّن هو الأنسب ليبقى مكوّنًا بسيطًا يُعَدّ بالـ props؟
    options:
      - text: Dialog فيه ترويسة ومتن وتذييل ولوحة جانبية اختيارية.
        why: محتواه وتخطيطه يتفاوتان كثيرًا بين الاستخدامات، وهذا بالضبط حيث تساعد الـ composition.
      - text: جدول بيانات بخلايا مخصّصة وأشرطة أدوات وإجراءات للصفوف.
        why: الجداول تتفاوت تفاوتًا هائلًا؛ والجداول المبنية على الإعدادات وحدها تصبح أطول قوائم props في أي نظام.
      - text: Badge لعرض الحالة بـ `tone` وتسمية قصيرة.
        why: صحيح. تنويعاته قليلة ويمكن عدّها، فبضعة props تصفه وصفًا كاملًا.
    answer: 2
---

كان للإصدار الأول من ShipmentCard في Northwind ستة props. وبعد عام صار له ثلاثة وعشرون: `title`، `subtitle`، `status`، `statusTone`، `showMenu`، `menuItems`، `footerText`، `footerAction`، `footerActionVariant`، `hideBorder`، `compact`، `imageUrl`، `imagePosition`، وهكذا. كل بطاقة مختلفة قليلًا لدى أحد الفرق صارت prop إضافيًا. وتحوّل كود المكوّن إلى أدغال من الشروط، وصارت صفحة التوثيق تسرد props لا يستطيع أحد أن يحفظها. هذا هو انفجار الـ props (prop explosion)، وكل نظام تصميم يقابله.

## الإعدادات مقابل الـ composition

المكوّن **المُعَدّ بالإعدادات** (configured) يستقبل البيانات ويقرّر التخطيط بنفسه. أما المكوّن **المركّب** (composed) فيقدّم قطعًا، والمستخدم يرتّبها.

:::figure مكوّن واحد بـ props كثيرة، مقابل قطع صغيرة يرتّبها المستخدم
<svg viewBox="0 0 660 240" role="img" aria-labelledby="t1">
  <title id="t1">على اليسار: صندوق ShipmentCard واحد تغذّيه قائمة طويلة من الـ props. على اليمين: صندوق Card يحتوي قطع Header وBody وFooter يرتّبها المستخدم.</title>
  <text class="d-label-strong" x="150" y="28" text-anchor="middle">الإعدادات</text>
  <rect class="d-box" x="20" y="44" width="110" height="170" rx="8"/>
  <text class="d-code" x="30" y="70">title</text>
  <text class="d-code" x="30" y="94">statusTone</text>
  <text class="d-code" x="30" y="118">menuItems</text>
  <text class="d-code" x="30" y="142">footerText</text>
  <text class="d-code" x="30" y="166">hideBorder</text>
  <text class="d-label-muted" x="30" y="196">+18 أخرى</text>
  <path class="d-arrow" d="M130 129 L176 129" marker-end="url(#arrow)"/>
  <rect class="d-box-primary" x="180" y="94" width="110" height="70" rx="10"/>
  <text class="d-label" x="235" y="134" text-anchor="middle">ShipmentCard</text>
  <text class="d-label-strong" x="500" y="28" text-anchor="middle">الـ Composition</text>
  <rect class="d-box-primary" x="390" y="44" width="220" height="180" rx="12"/>
  <text class="d-code" x="404" y="68">Card</text>
  <rect class="d-box-accent" x="410" y="80" width="180" height="36" rx="8"/>
  <text class="d-code" x="500" y="103" text-anchor="middle">Card.Header</text>
  <rect class="d-box-accent" x="410" y="124" width="180" height="44" rx="8"/>
  <text class="d-code" x="500" y="151" text-anchor="middle">Card.Body</text>
  <rect class="d-box-accent" x="410" y="176" width="180" height="36" rx="8"/>
  <text class="d-code" x="500" y="199" text-anchor="middle">Card.Footer</text>
</svg>
:::

هذه بطاقة الشحنة نفسها، مركّبة:

```tsx title=RouteCard.tsx
<Card>
  <Card.Header>
    <Card.Title>Shipment NW-4471</Card.Title>
    <Badge tone="info">In transit</Badge>
    <ShipmentMenu shipmentId="NW-4471" />
  </Card.Header>
  <Card.Body>Rotterdam to Hamburg · 2 pallets</Card.Body>
  <Card.Footer>
    <Button size="sm">Track</Button>
    <Button size="sm" variant="primary">Assign driver</Button>
  </Card.Footer>
</Card>
```

لم تحتج البطاقة قط إلى prop باسم `footerSecondaryAction`، لأن `Card.Footer` هو slot يقبل أي إجراءات. والقائمة مكوّن خاص بالفريق، موضوع حيث تسمح الترويسة. ومع ذلك ما زال النظام يملك المسافات والحدود والطباعة والسلوك المتجاوب لكل قطعة. تحصل الفرق على مرونة في *ما يوضع وأين*، ويحتفظ النظام بالسيطرة على *شكل كل قطعة*.

## مشاركة الحالة بين القطع

القطع الثابتة مثل Card لا تحتاج إلا إلى التخطيط. أما التفاعلية مثل Tabs فتحتاج إلى حالة مشتركة: التبويب المحدّد، وأيّ لوحة تُعرض. والطريقة المتينة لمشاركتها هي الـ context:

```tsx title=Tabs.tsx
import { createContext, use, useId, useState } from 'react';

const TabsContext = createContext<{
  selected: string;
  select: (value: string) => void;
  baseId: string;
} | null>(null);

function useTabs() {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>');
  return ctx;
}

export function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [selected, select] = useState(defaultValue);
  const baseId = useId();
  return <TabsContext value={{ selected, select, baseId }}>{children}</TabsContext>;
}

Tabs.Trigger = function Trigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { selected, select, baseId } = useTabs();
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected === value}
      aria-controls={`${baseId}-panel-${value}`}
      onClick={() => select(value)}
    >
      {children}
    </button>
  );
};
// Tabs.List (role="tablist") and Tabs.Panel (role="tabpanel") follow the same idea.
```

يقرأ الـ trigger الحالة المشتركة أينما كان في الشجرة: داخل tooltip، أو `div` للتخطيط، أو مكوّن كتبه الفريق. في React 19 تعرض الـ context مباشرة كـ provider ‏(`<TabsContext value={…}>`) وتقرؤه بـ `use`. أدوار ARIA مأخوذة من نمط التبويبات في WAI-ARIA، وستتعرّف عليه جيدًا في الدرس التالي؛ أما التعامل مع لوحة المفاتيح فمحذوف هنا لإبقاء المثال قصيرًا.

:::mistake ربط المكوّنات المركّبة بفحص الأبناء
في تقنية أقدم يمرّ الأب على `children` عبر `React.Children.map` ويحقن الـ props في كل trigger. تنجح في العرض التوضيحي، وتنكسر أول مرة يغلّف فيها فريق trigger بـ tooltip، لأن الأب صار يرى الـ tooltip لا الـ trigger. استخدم الـ context؛ فهو لا يهتمّ بعمق القطع ولا بما يغلّفها.
:::

## للـ composition تكاليفها أيضًا

الـ composition ليست مجانية. يكتب المستخدمون markup أكثر، ويمكنهم ترتيب القطع بطرق لم تقصدها، مثل تذييلين أو عنوان داخل المتن. تتعامل Northwind مع هذا بثلاث طرق. كل قطعة مقيّدة: `Card.Footer` يرتّب الإجراءات، ولا شيء آخر يبدو صحيحًا فيه. والترتيبات الشائعة تُطلَق كوصفات موثّقة تنسخها الفرق. وبعض التركيبات الشائعة جدًا تصبح مغلّفات صغيرة مُعدّة بالـ props ومبنية *من* القطع المركّبة، مثل `ShipmentSummaryCard` بأربعة props، فتبقى حالة الـ 80% قصيرة، وتبقى حالة الـ 20% ممكنة.

## الانتقال بعيدًا عن مكوّن مُعَدّ بالإعدادات

نادرًا ما تحظى ببداية جديدة. كان ShipmentCard مستخدمًا في 60 شاشة حين أعدنا تصميمه. لم نحذفه؛ بل أعدنا بناءه *فوق* القطع الجديدة، فصارت الـ props الثلاثة والعشرون تعرض `Card.Header` و`Card.Body` و`Card.Footer` داخليًا. استمرّت كل شاشة موجودة في العمل وحصلت على الأنماط الجديدة مجانًا. ثم علّمنا ShipmentCard كـ deprecated، ووثّقنا المقابل المركّب لكل تركيبة props شائعة، ونقلنا الشاشات فريقًا بعد فريق. بناء الـ API القديم من القطع الجديدة هو ما جعل الانتقال مملًّا، وهذا أعلى مديح يمكن أن يناله انتقال.

## متى تكون الإعدادات هي الصواب

ليس كل مكوّن يجب أن يكون مركّبًا. الـ Badge الخاص بالحالة له `tone` وتسمية؛ والـ Avatar له صورة واسم وحجم. تنويعاتهما قليلة ومغلقة، فتصفهما الـ props وصفًا كاملًا، ولن تضيف الـ composition إلا تعقيدًا شكليًا.

قاعدة عملية من مراجعات الـ API في Northwind: حين تبدأ الـ props بوصف **التخطيط** (`imagePosition`، `footerAlign`) أو **بنية المحتوى** (`menuItems`، `footerText`)، فالمكوّن يريد slots أو قطعًا. وحين تصف الـ props **المظهر أو الحالة** (`tone`، `size`، `disabled`)، فالإعدادات لا بأس بها.

:::tip اسأل عن الطلبات العشرة القادمة
في مراجعة الـ API لا تقيّم طلب اليوم وحده. اسأل الفريق صاحب الطلب كيف تبدو البطاقات المشابهة في أماكن أخرى من منتجه. إن استطعت أن تتخيّل عشرة props أخرى قادمة، فصمّم الـ slot الآن.
:::

في التمرين تحكم على اقتراح API لـ Dialog بهذه القواعد. وبعدها تتأكّد أن كل قطعة من هذه القطع تعمل مع لوحة المفاتيح وقارئ الشاشة (screen reader)، افتراضيًا.
