---
summary: عامل كل ما يأتي من خارج برنامجك على أنه unknown، وحوّله إلى أنواع مجال موثوقة بالمحلّلات والـ type predicates ودوال التأكيد، وأبقِ التحويلات خارج كود القلب.
takeaways:
  - "`JSON.parse` و`response.json()` و`localStorage` تعطيك `any`؛ علّق نتائجها بـ `unknown` كي يجبرك الـ compiler على الفحص."
  - المحلّل يأخذ `unknown` ويُعيد قيمة محدَّدة النوع أو خطأً، فلا يرى بقية الكود إلا بيانات فُحصت.
  - "الـ type predicate (`value is T`) يضيّق النوع في موضع الاستدعاء، لكن TypeScript يثق بجسمه، فالـ predicate الخاطئ تحويل غير مفحوص."
  - "دالة التأكيد (`asserts value is T`) تضيّق كل ما يلي الاستدعاء، ويجب أن ترمي خطأً حين يفشل الفحص."
  - مكتبات المخطّطات تعلن الفحص مرة واحدة وتشتقّ النوع منه، فتُزيل خطر التباعد بين المحلّل والنوع.
further:
  - title: Using type predicates
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
  - title: Assertion functions (TypeScript 3.7 release notes)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html
  - title: JSON.parse() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
quiz:
  - q: "`const data = await res.json();` ما نوع `data`، وماذا يجب أن تفعل حياله؟"
    options:
      - text: "`unknown`؛ ضيّقه قبل الاستخدام."
        why: "`Response.json()` معلَنة على أنها تُعيد `Promise<any>`، لا `unknown`، فلا شيء يجبرك على التضييق ما لم تعلّقها بنوع."
      - text: "`Order`، مستنتَجًا من رابط الـ endpoint."
        why: لا يستطيع TypeScript معرفة ما يُعيده الخادم؛ الرابط بالنسبة إليه مجرّد نص.
      - text: "`object`؛ حوّله بـ `as Order`."
        why: النوع `any`، والتحويل يتخطّى الفحص الذي كان سيلتقط تغيّر الـ API.
      - text: "`any`؛ علّقه بـ `unknown` ومرّره عبر محلّل."
        why: صحيح. `any` تُطفئ الفحص في كل استخدام؛ و`unknown` تجبر كل استخدام على أن يُثبَت أولًا.
    answer: 3
  - q: |
      ما الخطأ في هذا الـ predicate؟
      ```ts
      function isOrder(value: unknown): value is Order {
        return typeof value === 'object' && value !== null && 'id' in value;
      }
      ```
    options:
      - text: لا شيء؛ فحص `id` يكفي لإثبات أن القيمة `Order`.
        why: سجلّ العميل فيه `id` أيضًا. الـ predicate يدّعي أكثر بكثير مما يفحص.
      - text: يدّعي أن القيمة `Order` كامل لكنه لا يفحص إلا `id`، ويثق TypeScript بالادّعاء دون التحقّق منه.
        why: صحيح. جسم الـ predicate لا يُفحص مقابل نوع إرجاعه، فالفحص الضعيف تحويل غير مفحوص.
      - text: الـ predicates لا يمكنها استخدام المعامل `in`.
        why: "`in` فحص تضييق عادي ويعمل جيدًا داخل الـ predicates."
    answer: 1
  - q: كيف تختلف دالة التأكيد عن الـ type predicate؟
    options:
      - text: دالة التأكيد تُعيد `boolean`؛ والـ predicate يُعيد `void`.
        why: العكس هو الصحيح. الـ predicate يُعيد `boolean`؛ ودالة التأكيد لا تُعيد شيئًا وترمي خطأً عند الفشل.
      - text: دالة التأكيد تضيّق القيمة لبقية النطاق بعد الاستدعاء، وترمي خطأً إن فشل الفحص.
        why: صحيح. `assertIsOrder(x); x.id` تعمل، لأن العودة الطبيعية تثبت التأكيد.
      - text: دوال التأكيد لا تعمل إلا على الأنواع الأولية.
        why: تعمل على أي نوع، بما فيه الكائنات والـ unions.
    answer: 1
  - q: أين يجب تحليل القيمة القادمة من `localStorage.getItem('cart')`؟
    options:
      - text: حيث تُقرأ بالضبط، عند الحدود، قبل أن يراها أي كود آخر.
        why: صحيح. حلّل مرة واحدة عند الحافة، فتستطيع كل دالة داخل التطبيق الوثوق بالنوع.
      - text: في كل component يستخدم السلة، قبل الـ render مباشرة.
        why: التحليل في أماكن كثيرة يكرّر المنطق ويترك نوافذ تتدفّق فيها بيانات غير مفحوصة.
      - text: في أي مكان؛ تطبيقك هو من كتبها، فشكلها مضمون.
        why: الإصدارات القديمة من تطبيقك، وإضافات المتصفّح، والمستخدمون بأدوات المطوّر، كلهم يكتبون في التخزين. عاملها على أنها غير موثوقة.
      - text: في الـ reducer الذي يخزّن السلة، بعد استخدامها في أول render.
        why: تكون البيانات غير المفحوصة قد عُرضت حينها؛ الحدود هي أول قراءة، لا خطوة لاحقة.
    answer: 0
---

في [تصميم عميل API بأنواع دقيقة](lesson:l-at-2-4)، انتهى العميل بـ `return result as Routes[R]['output']`. ذلك التحويل كان وعدًا بشأن الخادم. وهذا الدرس عن إبقاء ذلك الوعد صادقًا.

لكل برنامج **حدود (boundary)**: المواضع التي تأتي منها البيانات من مكان لا يستطيع الـ compiler رؤيته. استجابات HTTP، و`JSON.parse`، ومعاملات الروابط، و`localStorage`، وحقول النماذج، والرسائل من نوافذ أخرى، ومتغيّرات البيئة. داخل الحدود، تصف الأنواع قيمًا أنشأها كودك. وعند الحدود، الأنواع مجرّد آمال. وللنمط الذي يتعامل مع ذلك شعار معروف: **حلّل، لا تتحقّق فقط (parse, don't validate)**. حوّل البيانات غير المحدَّدة الأنواع إلى بيانات محدَّدة الأنواع مرة واحدة، عند الحافة، ودع بقية البرنامج يثق بالأنواع.

:::figure تصبح البيانات غير الموثوقة بيانات محدَّدة الأنواع عند بوابة واحدة
<svg viewBox="0 0 700 220" role="img" aria-labelledby="t1">
  <title id="t1">على اليسار، مصادر من خارج البرنامج: استجابات fetch، وJSON.parse، ومعاملات الروابط، وlocalStorage، كلها من نوع unknown. تمرّ عبر محلّلات عند الحدود، تُعيد إمّا خطأً أو Order محدَّد النوع. وداخل الحدود، لا يرى كود الدفع الأساسي إلا أنواعًا موثوقة.</title>
  <rect class="d-box" x="10" y="20" width="190" height="180" rx="12"/>
  <text class="d-label-strong" x="105" y="46" text-anchor="middle">الخارج: unknown</text>
  <text class="d-code" x="105" y="80" text-anchor="middle">res.json()</text>
  <text class="d-code" x="105" y="108" text-anchor="middle">JSON.parse</text>
  <text class="d-code" x="105" y="136" text-anchor="middle">معاملات URL</text>
  <text class="d-code" x="105" y="164" text-anchor="middle">localStorage</text>
  <path class="d-arrow" d="M200 110 L256 110" marker-end="url(#arrow)"/>
  <rect class="d-box-warn" x="260" y="70" width="170" height="80" rx="12"/>
  <text class="d-code" x="345" y="104" text-anchor="middle">parseOrder()</text>
  <text class="d-label-muted" x="345" y="128" text-anchor="middle">افحص، ثم سِم</text>
  <path class="d-arrow" d="M345 150 L345 186" marker-end="url(#arrow)"/>
  <text class="d-code" x="345" y="206" text-anchor="middle">err(…)</text>
  <path class="d-arrow" d="M430 110 L486 110" marker-end="url(#arrow)"/>
  <rect class="d-box-success" x="490" y="20" width="200" height="180" rx="12"/>
  <text class="d-label-strong" x="590" y="46" text-anchor="middle">الداخل: موثوق</text>
  <text class="d-code" x="590" y="100" text-anchor="middle">Order</text>
  <text class="d-label-muted" x="590" y="128" text-anchor="middle">بلا تحويلات ولا فحوص</text>
</svg>
:::

## ابدأ من unknown

`JSON.parse` تُعيد `any`، وكذلك `Response.json()`. و`any` معدية: أسندها إلى متغيّر نوعه `Order` فيصدّقك TypeScript. الخطوة الأولى أن ترفض هذه الهدية:

```ts
const raw: unknown = await res.json();
raw.status;
// Error: 'raw' is of type 'unknown'.
```

`unknown` هو النوع الصادق للبيانات التي لم تفحصها. يمكنك تمريرها، لكن لا يمكنك استخدامها حتى تضيّقها. والتضييق هو ما يفعله المحلّل.

## محلّل مكتوب يدويًا

يأخذ المحلّل `unknown` ويُعيد إمّا قيمة محدَّدة النوع أو وصفًا لما كان خاطئًا. مع نوع `Result` من الدرس السابق:

```ts
const STATUSES = ['processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
type OrderStatus = (typeof STATUSES)[number];
type Order = { id: number; status: OrderStatus; totalCents: number; couponCode: string | null };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

function parseOrder(input: unknown): Result<Order, string> {
  if (!isRecord(input)) return err('order: expected an object');
  const { id, status, totalCents, couponCode } = input;
  if (typeof id !== 'number' || !Number.isInteger(id)) return err('id: expected an integer');
  if (!isOrderStatus(status)) return err(`status: unknown value ${JSON.stringify(status)}`);
  if (typeof totalCents !== 'number') return err('totalCents: expected a number');
  if (couponCode !== null && typeof couponCode !== 'string') return err('couponCode: expected a string or null');
  return ok({ id, status, totalCents, couponCode });
}
```

انظر إلى السطر الأخير: لا يوجد تحويل. كل فحص ضيّق متغيّرًا واحدًا، وفي النهاية يستطيع TypeScript التحقّق من أن الكائن الحرفي يطابق `Order`. وإن اكتسب النوع حقلًا ونسيه المحلّل، يفشل سطر `ok(…)` في الترجمة. وهذا أيضًا هو المكان الذي تسِم فيه القيم، باستدعاء `toOrderId(id)` من [الـ Branded Types والفحوص الشاملة](lesson:l-at-4-1).

### سدّ الفجوة في عميل الـ API

عودةً إلى العميل، إصلاح ذلك التحويل الأخير هو جدول من المحلّلات، واحد لكل مسار، يُفحص مقابل خريطة المسارات بـ mapped type و`satisfies`:

```ts
const parsers = {
  'GET /orders/:id': parseOrder,
  'GET /orders': parseOrderPage,
  'POST /orders/:id/cancel': parseCancelledOrder,
} satisfies { [R in keyof Routes]: (input: unknown) => Result<Routes[R]['output'], string> };
```

انسَ مسارًا فتبلّغ `satisfies` عن المفتاح الناقص؛ وأعِد النوع الخاطئ من محلّل فتبلّغ عن ذلك أيضًا. داخل `call`، تمرّ الاستجابة الآن عبر `parsers[route]` قبل إعادتها. لا يستطيع TypeScript ربط الـ `R` العام بالصف المطابق في الجدول، فيبقى تعليق نوعي واحد هناك، لكنه يقع الآن على بيانات فُحصت فعلًا: أنواع مخرجات العميل مكتسَبة لا مُدّعاة.

## الـ type predicates

`isRecord` و`isOrderStatus` هما **type predicates (دوال حارسة للنوع)**: دوال نوع إرجاعها `value is T`. حين تُعيد إحداها `true`، يضيّق TypeScript الوسيط في موضع الاستدعاء. ومنذ TypeScript 5.5، تُستنتج البسيطة منها مثل `(x) => x !== null`، كما رأيت في القسم 1، لكن أي شيء فيه منطق حقيقي يحتاج إلى التعليق النوعي.

:::mistake الـ predicates التي تكذب
لا يتحقّق TypeScript من أن جسم الـ predicate يثبت ادّعاءه. `function isOrder(v: unknown): v is Order { return isRecord(v) && 'id' in v; }` تمرّ في الترجمة، وكل مستدعٍ يصدّق الآن أن سجلّ العميل طلب. الـ predicate تحويل `as` ملفوف في دالة. أبقِ الـ predicates صغيرة وصحيحة بشكل واضح، مثل `isOrderStatus`، وابنِ الفحوص الأكبر منها في محلّلات تُنشئ القيمة، كي يتحقّق الـ compiler من النتيجة.
:::

## دوال التأكيد

أحيانًا تريد التضييق والتوقّف إن كانت البيانات سيئة، دون `if` في كل موضع استدعاء. **دالة التأكيد (assertion function)** لا تُعيد شيئًا وترمي خطأً عند الفشل، ونوع إرجاعها `asserts` يضيّق كل ما يلي الاستدعاء:

```ts
function assertIsOrder(input: unknown): asserts input is Order {
  const parsed = parseOrder(input);
  if (!parsed.ok) throw new Error(`Invalid order: ${parsed.error}`);
}

const raw: unknown = JSON.parse(cachedJson);
assertIsOrder(raw);
raw.status; // OrderStatus
```

تناسب دوال التأكيد الأماكن التي تكون فيها البيانات السيئة خطأً برمجيًا لا حالة متوقَّعة: دوال الاختبار المساعدة، والبيانات التي عرضها خادمك في الصفحة، والثوابت. أما لاستجابات HTTP، ففضّل محلّلًا يُعيد `Result`، كي ينتج تغيّر الـ API خطأً مُعالَجًا لا انهيارًا. وهناك غرابة واحدة: يجب أن تُستدعى دالة التأكيد عبر اسم له نوع صريح، فـ `const assertIsOrder = (x: unknown): asserts x is Order => …` تحتاج إلى تعليق نوعي على الـ `const` نفسه، وإلا يبلّغ TypeScript عن "Assertions require every name in the call target to be declared with an explicit type annotation".

:::tip استخدم مكتبة مخطّطات في المشاريع الحقيقية
المحلّلات المكتوبة يدويًا مثالية للتعلّم ومقبولة لأنواع قليلة. أما لـ API كامل، فاستخدم مكتبة مخطّطات (schema) مثل Zod أو Valibot أو ArkType: تعلن الشكل مرة واحدة كقيمة وقت التشغيل، والمكتبة تفحص البيانات وتعطيك نوع TypeScript المشتقّ منه، فلا يمكن للمحلّل والنوع أن يتباعدا. إنها فكرة "مصدر الحقيقة الواحد" نفسها على طريقة `typeof` من القسم 3، مغلّفة لك.
:::

في التمرين ستكتب محلّل الطلبات في Cartwheel وpredicate ودالة تأكيد، وتستبدل تحويلًا ظل يكذب منذ اليوم الأول. والدرس القادم يبني باعثات أحداث وبنّائين محدَّدي الأنواع فوق كل ما في هذا القسم.
