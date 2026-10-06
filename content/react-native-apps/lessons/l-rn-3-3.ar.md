---
summary: شارك قائمة الرحلات في Trailhead بين الـ tabs والشاشات باستخدام reducer وcontext يُوفَّران من الـ root layout، واشتقّ المجاميع بدلًا من تخزينها، واعرف متى تستحق مكتبة لإدارة الـ state مكانها.
takeaways:
  - الـ state التي تستخدمها عدّة مسارات مكانها فوقها جميعًا، وهذا في Expo Router يعني provider داخل `_layout.tsx` الجذري.
  - يجمع الـ reducer كل تغيير على قائمة الرحلات في دالة نقية واحدة قابلة للاختبار تُرجع مصفوفات وكائنات جديدة.
  - غلّف الـ context بـ hooks صغيرة مثل `useHikes()` و`useHike(id)`، حتى لا تلمس الشاشات كائن الـ context مباشرة أبدًا.
  - اشتقّ المجاميع والقوائم المصفّاة من الـ state المصدر باستخدام `useMemo`؛ ولا تخزّنها منفصلة.
  - استخدم مكتبة مثل Zustand حين تصبح عمليات re-render الناتجة عن الـ context مشكلة مقيسة، وTanStack Query حين تعيش البيانات على خادم.
further:
  - title: Scaling Up with Reducer and Context
    url: https://react.dev/learn/scaling-up-with-reducer-and-context
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
  - title: useReducer
    url: https://react.dev/reference/react/useReducer
quiz:
  - q: يخزّن tab الإحصاءات `totalKm` في `useState` خاصة به، تُحدَّث داخل effect. بعد أن يحذف المستخدم رحلة، يبقى المجموع خاطئًا حتى يُعاد تشغيل التطبيق. ما أفضل إصلاح؟
    options:
      - text: أضف مصفوفة الرحلات إلى قائمة اعتماديات الـ effect.
        why: هذا يرقّع العَرَض، لكن تبقى لديك نسختان من الحقيقة وrender إضافي مع كل تغيير.
      - text: انقل `totalKm` إلى الـ reducer وحدّثه مع كل action.
        why: الآن يجب على كل action أن يتذكّر إبقاء المجموع متزامنًا، ومن هنا يأتي هذا النوع من الأخطاء بالضبط.
      - text: أعِد تركيب tab الإحصاءات كلما حصل على التركيز.
        why: رمي الـ state الخاصة بالشاشة للتعافي من خطأ تزامن يكلّف أكثر من الخطأ نفسه.
      - text: احذف الـ state واحسب المجموع من الرحلات المشتركة باستخدام `useMemo`.
        why: صحيح. القيم المشتقّة المحسوبة من مصدر واحد للحقيقة لا يمكن أن تخرج عن التزامن.
    answer: 3
  - q: |
      ما المشكلة في حالة الـ reducer هذه؟
      ```js
      case 'favoriteToggled': {
        const hike = state.find((h) => h.id === action.id);
        hike.favorite = !hike.favorite;
        return state;
      }
      ```
    options:
      - text: تعدّل الرحلة الموجودة وتُرجع المصفوفة نفسها، فلا ترى React أي تغيير ولا يحدث re-render.
        why: صحيح. أرجع مصفوفة جديدة فيها كائن جديد للرحلة التي تغيّرت، باستخدام `state.map` مثلًا.
      - text: لا يمكن أن تحتوي الـ reducers على تعريفات `const` محصورة في كتلة.
        why: التعريفات المحصورة في كتلة داخل `case` بين أقواس معقوفة لا بأس بها.
      - text: "`find` أبطأ من أن يُستخدم في reducer؛ يحتاج إلى بحث عبر فهرس."
        why: مع مئات الرحلات يكون `find` فوريًا. الخطأ في التعديل المباشر (mutation)، لا في السرعة.
    answer: 0
  - q: أين يجب أن يُرسم `HikesProvider` الخاص بـ Trailhead لكي يقرأه tab السجلّ وtab الإحصاءات وشاشة `/hikes/[id]` جميعًا؟
    options:
      - text: داخل `(tabs)/index.tsx`، لأن السجلّ هو مالك الرحلات.
        why: الإخوة وشاشة التفاصيل خارج ذلك الـ component، فلا يستطيعون قراءة الـ context الخاص به.
      - text: في `src/app/_layout.tsx`، حول الـ Stack الجذري.
        why: صحيح. كل ما يرسمه الـ root layout، الـ tabs وشاشات الـ stack على السواء، يقع داخل الـ provider.
      - text: في كل شاشة تحتاج إليه، ولكلٍّ منها نسختها الخاصة.
        why: الـ providers المنفصلة تعني state منفصلة؛ فالتعديل في شاشة لن يظهر في الأخرى.
    answer: 1
---

أربعة أجزاء من Trailhead تهتم الآن بالبيانات نفسها. tab السجلّ يعرض الرحلات، وtab الإحصاءات يجمعها، وشاشة التفاصيل تعرض واحدة منها، ونموذج إضافة رحلة (في الدرس التالي) ينشئها. إن حمّلت كل شاشة نسختها الخاصة واحتفظت بها، فستتباعد النسخ: تحذف رحلة في شاشة التفاصيل، وتعود، فتجد tab الإحصاءات ما زال يحسبها، لأن شاشات الـ stack والـ tabs التي زرتها تبقى مركّبة ولا تُعيد التحميل.

الحل هو مبدأ React الذي تعرفه أصلًا، مطبّقًا على شجرة تنقّل: مصدر واحد للحقيقة، محفوظ فوق كل ما يحتاج إليه.

## أين تعيش الـ state المشتركة في Expo Router

في تطبيق ويب كنت ستضع الـ provider قرب الـ component الجذري. في Expo Router، الـ component الجذري هو `src/app/_layout.tsx`: فهو يرسم الـ Stack، الذي يرسم مجموعة الـ tabs وكل شاشة تُضاف. والـ provider الموضوع حول ذلك الـ Stack يغطّي التطبيق كله.

:::figure provider واحد في الـ root layout يغذّي كل شاشة
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">يغلّف HikesProvider الـ Stack الجذري في src/app/_layout.tsx؛ ويقرأ tab السجلّ وtab الإحصاءات وشاشة تفاصيل الرحلة الرحلات نفسها ويرسلون actions إلى الـ reducer نفسه.</title>
  <rect class="d-box-primary" x="200" y="16" width="280" height="64" rx="12"/>
  <text class="d-label-strong" x="340" y="44" text-anchor="middle">HikesProvider</text>
  <text class="d-code" x="340" y="66" text-anchor="middle">src/app/_layout.tsx</text>
  <rect class="d-box" x="240" y="104" width="200" height="40" rx="10"/>
  <text class="d-label" x="340" y="129" text-anchor="middle">الـ Stack الجذري</text>
  <path class="d-line" d="M340 80 L340 104"/>
  <rect class="d-box-accent" x="40" y="186" width="170" height="50" rx="10"/>
  <text class="d-label" x="125" y="216" text-anchor="middle">tab السجلّ</text>
  <rect class="d-box-accent" x="255" y="186" width="170" height="50" rx="10"/>
  <text class="d-label" x="340" y="216" text-anchor="middle">tab الإحصاءات</text>
  <rect class="d-box-accent" x="470" y="186" width="170" height="50" rx="10"/>
  <text class="d-label" x="555" y="216" text-anchor="middle">/hikes/[id]</text>
  <path class="d-line" d="M300 144 L125 186"/>
  <path class="d-line" d="M340 144 L340 186"/>
  <path class="d-line" d="M380 144 L555 186"/>
  <path class="d-arrow d-dashed" d="M600 186 C640 120 560 60 482 52" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="612" y="110" text-anchor="middle">dispatch</text>
</svg>
:::

## reducer لكل تغيير

الرحلات تُضاف وتُعدَّل وتُحذف وتُفضَّل. بدلًا من بعثرة استدعاءات `setHikes` في الشاشات، صِف كل تغيير بوصفه **action** وعالجها كلها في دالة نقية واحدة:

```ts title=src/state/hikesReducer.ts
export type Hike = { id: string; name: string; date: string; distanceKm: number; favorite: boolean };

export type HikesAction =
  | { type: 'added'; hike: Hike }
  | { type: 'updated'; id: string; changes: Partial<Omit<Hike, 'id'>> }
  | { type: 'deleted'; id: string }
  | { type: 'favoriteToggled'; id: string };

export function hikesReducer(state: Hike[], action: HikesAction): Hike[] {
  switch (action.type) {
    case 'added':
      return [action.hike, ...state];
    case 'updated':
      return state.map((h) => (h.id === action.id ? { ...h, ...action.changes } : h));
    case 'deleted':
      return state.filter((h) => h.id !== action.id);
    case 'favoriteToggled':
      return state.map((h) => (h.id === action.id ? { ...h, favorite: !h.favorite } : h));
  }
}
```

كل حالة تُرجع مصفوفة **جديدة**، وكائنًا جديدًا للرحلة التي تغيّرت. هكذا تعرف React أن شيئًا تغيّر، وهذا ما يسمح لـ `HikeRow` المغلّف بـ memo بتخطّي إعادة الـ render للصفوف الـ 599 التي لم تتغيّر.

لاحظ أسماء الـ actions: `added` و`deleted` و`favoriteToggled`. إنها تصف **ما حدث**، لا كيفية تحديث الـ state. وهذا يُبقي الشاشات بسيطة (شاشة التفاصيل تُبلغ أن المستخدم بدّل حالة التفضيل، ولا يهمّها كيف تُخزَّن القائمة)، ويعطيك مكانًا واحدًا تغيّره حين تتغيّر القواعد، كأن يصبح حذف رحلة يعني حذف صورها أيضًا.

ولأن الـ reducer لا يستورد شيئًا من React Native، فهو يعمل في أي مكان. ستختبر reducers كهذا باستخدام Jest العادي في القسم 5، وستكتب واحدًا في تمرين هذا الدرس.

## الـ provider والـ hooks الخاصة به

```tsx title=src/state/hikes.tsx
import { createContext, use, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { hikesReducer, type Hike, type HikesAction } from './hikesReducer';

const HikesContext = createContext<Hike[] | null>(null);
const DispatchContext = createContext<Dispatch<HikesAction> | null>(null);

export function HikesProvider({ initial, children }: { initial: Hike[]; children: ReactNode }) {
  const [hikes, dispatch] = useReducer(hikesReducer, initial);
  return (
    <DispatchContext value={dispatch}>
      <HikesContext value={hikes}>{children}</HikesContext>
    </DispatchContext>
  );
}

export function useHikes() {
  const hikes = use(HikesContext);
  if (!hikes) throw new Error('useHikes must be used inside HikesProvider');
  return hikes;
}

export function useHike(id: string | undefined) {
  const hikes = useHikes();
  return useMemo(() => hikes.find((h) => h.id === id), [hikes, id]);
}

export function useHikesDispatch() {
  const dispatch = use(DispatchContext);
  if (!dispatch) throw new Error('useHikesDispatch must be used inside HikesProvider');
  return dispatch;
}
```

ثم غلّف الـ Stack في الـ root layout: `<HikesProvider initial={sampleHikes}><Stack>…</Stack></HikesProvider>`. وفي القسم 4 ستأتي البيانات الأولية من قاعدة بيانات الجهاز بدلًا من ذلك.

بعض التفاصيل تستحق النسخ. تسمح لك React 19 برسم الـ context مباشرة بوصفه provider (`<HikesContext value={…}>`) وقراءته باستخدام `use`. وفصل الـ state والـ dispatch في **اثنين من الـ contexts** منفصلَين يعني أن الـ components التي ترسل actions فقط، مثل زرّ حذف، لا يُعاد لها الـ render حين تتغيّر القائمة. والـ hooks ترمي خطأً واضحًا إن نسي أحدٌ الـ provider، بدلًا من الفشل لاحقًا برسالة "cannot read properties of null".

وهكذا تُقرأ الشاشة الآن:

```tsx
const hike = useHike(id);
const dispatch = useHikesDispatch();
// …
<Pressable onPress={() => dispatch({ type: 'favoriteToggled', id: hike.id })}>
```

## اشتقّ ولا تكرّر

يحتاج tab الإحصاءات إلى المسافة الإجمالية، وعدد الرحلات، وأطول رحلة. لا شيء من ذلك state. إنها قيم **مشتقّة** من قائمة الرحلات، فاحسبها:

```tsx
const hikes = useHikes();
const stats = useMemo(() => {
  const totalKm = hikes.reduce((sum, h) => sum + h.distanceKm, 0);
  const longest = hikes.reduce((best, h) => (!best || h.distanceKm > best.distanceKm ? h : best), undefined as Hike | undefined);
  return { count: hikes.length, totalKm, longest };
}, [hikes]);
```

:::mistake نسخ البيانات المشتركة إلى state محلية
`const [hike, setHike] = useState(useHike(id))` يلتقط صورة للرحلة لحظة تركيب الشاشة. عدّلها من مكان آخر وستبقى هذه الشاشة تعرض النسخة القديمة، لأن `useState` لا تستخدم وسيطها إلا في أول render. اقرأ من الـ hook المشترك في كل render؛ وانسخ إلى state محلية فقط لمسوّدة يعدّلها المستخدم، كالنموذج، ثم أرسل action حين يحفظ.
:::

## حين لا يكفي الـ context

يعيد الـ context الـ render لكل مستهلك حين تتغيّر قيمته. لقائمة الرحلات في Trailhead هذا جيد. لكنه يصبح مشكلة حين تتغيّر قيمة ما كثيرًا جدًا (موقع GPS حيّ يتحدّث كل ثانية)، أو حين يكون في تطبيق كبير مستهلكون كثيرون لا علاقة بينهم. عندها تلجأ الفرق إلى **Zustand**، وهي store صغيرة مع selectors بحيث لا يُعاد الـ render للـ components إلا بسبب الشريحة التي تقرؤها. أما البيانات التي تعيش على خادم فلها مشكلات مختلفة تمامًا (التخزين المؤقت، وإعادة الجلب، وتقادم البيانات)، وهذه وظيفة TanStack Query؛ ستلتقي بها في القسم 4. ابدأ بالـ reducer مع الـ context، وانتقل حين تقيس سببًا لذلك.

التالي: الشاشة التي تنشئ الرحلات، أي نموذج يعمل مع لوحة مفاتيح الهاتف.
