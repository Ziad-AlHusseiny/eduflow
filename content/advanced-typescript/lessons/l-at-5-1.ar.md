---
summary: اختر خيارات الـ compiler التي تجعل أنواعك جديرة بالثقة، من strict وnoUncheckedIndexedAccess إلى verbatimModuleSyntax وmoduleResolution bundler، وفعّلها في قاعدة كود قائمة دون إيقاف العمل.
takeaways:
  - "`strict` عائلة من الفحوص (فحوص null، والـ any الضمني، وفحوص معاملات الدوال وغيرها)، وهو الافتراضي منذ TypeScript 6.0."
  - "`noUncheckedIndexedAccess` يضيف `undefined` إلى عمليات البحث في المصفوفات والـ records، فيلتقط أكثر انهيار شيوعًا يفوته `strict`."
  - "`exactOptionalPropertyTypes` يفصل الخاصية الغائبة عن الخاصية المضبوطة صراحةً على `undefined`، وهذا مهم لأجسام طلبات PATCH والـ spreads."
  - "`verbatimModuleSyntax` يجعل الـ imports الناتجة مطابقة لما كتبته، فيجب أن تقول الـ imports الخاصة بالأنواع فقط `import type`."
  - "استخدم `moduleResolution: \"bundler\"` للتطبيقات التي يبنيها Vite أو bundler آخر، و`nodenext` للكود الذي يشغّله Node مباشرة."
further:
  - title: TSConfig Reference
    url: https://www.typescriptlang.org/tsconfig/
  - title: noUncheckedIndexedAccess
    url: https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html
  - title: Modules - Choosing Compiler Options
    url: https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html
  - title: TypeScript 6.0 release notes
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html
quiz:
  - q: |
      مع تفعيل `strict` وإيقاف `noUncheckedIndexedAccess`، ماذا يحدث هنا حين تكون السلة فارغة؟
      ```ts
      const first = cart.lines[0];
      console.log(first.sku);
      ```
    options:
      - text: يمرّ في الترجمة، ويرمي "Cannot read properties of undefined" وقت التشغيل.
        why: صحيح. دون هذا الخيار، نوع `lines[0]` هو `Line` لا `Line | undefined`، فتكون الحالة الفارغة غير مرئية.
      - text: يفشل في الترجمة، لأن `strictNullChecks` يعرف أن المصفوفات قد تكون فارغة.
        why: "`strictNullChecks` لا يتتبّع `null` و`undefined` إلا في الأنواع المعلَنة. الوصول بالفهرس متفائل ما لم يُفعَّل `noUncheckedIndexedAccess`."
      - text: يمرّ في الترجمة ويطبع `undefined`.
        why: قراءة `.sku` من `undefined` ترمي خطأً؛ لا تُعيد `undefined`.
      - text: يفشل في الترجمة، لأن `strict` يمنع الوصول بالفهرس.
        why: الوصول بالفهرس مسموح دائمًا؛ الخيار يغيّر فقط النوع الناتج.
    answer: 0
  - q: "`type Patch = { couponCode?: string }`. مع تفعيل `exactOptionalPropertyTypes`، أيّ قيمة تُرفض؟"
    options:
      - text: "`{}`"
        why: حذف خاصية اختيارية مسموح دائمًا.
      - text: "`{ couponCode: 'LOYAL5' }`"
        why: النص هو بالضبط ما تسمح به الخاصية.
      - text: "`{ couponCode: undefined }`"
        why: "صحيح. يعامل الخيار \"موجودة بقيمة undefined\" على أنها مختلفة عن \"غائبة\"؛ أعلن `couponCode?: string | undefined` إن كنت تقصد السماح بها."
    answer: 2
  - q: "في ملفك `import { Order, placeOrder } from './orders'` حيث `Order` نوع. مع تفعيل `verbatimModuleSyntax`، ماذا تكتب؟"
    options:
      - text: لا شيء يتغيّر؛ يُزيل الـ compiler `Order` من الناتج تلقائيًا.
        why: هذا الحذف التلقائي هو بالضبط ما يُطفئه الخيار، كي تطابق الـ imports الناتجة المصدر.
      - text: "`import { type Order, placeOrder } from './orders'`"
        why: صحيح. المعدِّل `type` يعلّم `Order` على أنه للأنواع فقط، فيُمحى بينما تبقى `placeOrder`.
      - text: "`import * as orders from './orders'` واستخدم `orders.Order`"
        why: الـ import على هيئة namespace يعمل مع القيم، لكنه لا يحلّ تعليم "للأنواع فقط" الذي يطلبه الخيار.
      - text: فعّل `esModuleInterop`.
        why: "`esModuleInterop` يتعلّق بالـ imports الافتراضية من CommonJS ولا علاقة له بالـ imports الخاصة بالأنواع فقط."
    answer: 1
  - q: "في tsconfig تطبيقك المبني بـ Vite القيمة `\"moduleResolution\": \"node\"`. إلى ماذا يجب أن تغيّرها، ولماذا؟"
    options:
      - text: "`\"classic\"`، لأنها الأكثر تساهلًا."
        why: "`classic` أقدم من أعراف npm، ومثل `node` هي مهملة في TypeScript 6.0 ومُزالة في 7.0."
      - text: "`\"nodenext\"`، لأن Vite يعمل على Node."
        why: Vite يعمل على Node، لكن كود تطبيقك يحلّه الـ bundler، و`nodenext` سيطلب امتدادات ملفات لا يحتاجها الـ bundler.
      - text: "`\"bundler\"`، لأنها تحاكي طريقة Vite في حلّ الـ imports، بما فيها `exports` في الحزم، و`node` مهملة."
        why: صحيح. `bundler` تطابق الأداة التي تحلّ الـ imports فعلًا، و`node` (`node10`) مُزالة في TypeScript 7.0.
    answer: 2
---

كل نوع في هذه الدورة جدير بالثقة بقدر إعدادات الـ compiler التي خلفه فقط. نوع `Order` نفسه الذي يلتقط رقم تتبّع ناقصًا تحت tsconfig ما، يترك انهيارًا يمرّ تحت آخر. حين انضممت إلى عملية الترحيل التي قُدتها لاحقًا، كان في tsconfig القيمة `strict: false`، وكان الفريق فخورًا بتغطية TypeScript بنسبة 100%. معظم تلك التغطية كانت تفحص القليل جدًا.

هذا الدرس عن اختيار الخيارات عن قصد، وعن تفعيلها في قاعدة كود حقيقية دون تجميد للعمل ستة أسابيع.

## strict: خط الأساس

`strict` ليس فحصًا واحدًا بل عائلة. أهمّها في العمل اليومي:

| الخيار | ما يلتقطه |
|---|---|
| `strictNullChecks` | استخدام قيمة قد تكون `null` أو `undefined` |
| `noImplicitAny` | معاملات ومتغيّرات نوعها `any` بصمت |
| `strictFunctionTypes` | أنواع معاملات callback غير آمنة ([الدرس 1-2](lesson:l-at-1-2)) |
| `useUnknownInCatchVariables` | معاملة القيمة الملتقَطة على أنها `Error` دون فحص |
| `strictPropertyInitialization` | حقول أصناف لا يُسند إليها شيء أبدًا |

منذ TypeScript 6.0، صار `strict` مفعَّلًا افتراضيًا، فيحصل عليه المشروع الجديد دون أن يطلبه. وفي المشاريع الأقدم يبقى أثمن سطر في الملف. وكل ما تبقّى في هذا الدرس يفترض وجوده.

## خياران يتركهما strict

**`noUncheckedIndexedAccess`** يجعل الوصول بالفهرس صادقًا. معه يكون `lines[0]` من نوع `Line | undefined`، و`STOCK[sku]` من نوع `number | undefined`:

```ts
const first = cart.lines[0];
first.sku;
// Error: 'first' is possibly 'undefined'.

const available: number = STOCK[sku];
// Error: Type 'number | undefined' is not assignable to type 'number'.
```

"Cannot read properties of undefined" هو أكثر أخطاء وقت التشغيل شيوعًا في JavaScript، والمصفوفات الفارغة والمفاتيح الناقصة مصادره المفضّلة. وهذا الخيار يلتقطها. والثمن بعض الفحوص الإضافية حيث تعرف أن الفهرس صالح (داخل `for (let i = 0; i < xs.length; i++)`)؛ أما حلقات `for…of` ودوال المصفوفات مثل `map` فلا تتأثّر.

**`exactOptionalPropertyTypes`** يفصل "الغائبة" عن "الموجودة لكن `undefined`". الـ endpoint الخاص بـ PATCH في Cartwheel يعامل `{ couponCode: undefined }` على أنها "أزِل الكوبون" و`{}` على أنها "اتركه كما هو". دون الخيار، للاثنين النوع نفسه. ومعه:

```ts
type OrderPatch = { couponCode?: string };
const patch: OrderPatch = { couponCode: undefined };
// Error: Type '{ couponCode: undefined; }' is not assignable to type 'OrderPatch'
// with 'exactOptionalPropertyTypes: true'. …
```

إن كنت تقصد فعلًا "قد تكون undefined صراحةً"، فقلها: `couponCode?: string | undefined`. هذا الخيار أكثر إزعاجًا عند تبنّيه، لأن أنواع مكتبات كثيرة كُتبت دونه، ففعّله بعد الآخرين.

صار `tsc --init` في TypeScript 5.9 يفعّل الخيارين افتراضيًا في الـ tsconfig الذي يولّده، وهذا تلميح قوي إلى الاتجاه الذي يسير فيه النظام البيئي.

:::figure ثلاث طبقات لـ tsconfig حديث
<svg viewBox="0 0 700 230" role="img" aria-labelledby="t1">
  <title id="t1">ثلاث طبقات متراكبة. الطبقة السفلى، strict، هي خط الأساس لفحوص null وany. والطبقة الوسطى تضيف noUncheckedIndexedAccess وexactOptionalPropertyTypes وnoImplicitOverride لصحة أكثر صرامة. والطبقة العليا تغطّي سلوك الوحدات: verbatimModuleSyntax وmoduleResolution bundler وerasableSyntaxOnly.</title>
  <rect class="d-box-primary" x="60" y="20" width="580" height="56" rx="12"/>
  <text class="d-label-strong" x="350" y="44" text-anchor="middle">كيف تُولَّد الوحدات وتُحَلّ</text>
  <text class="d-code" x="350" y="66" text-anchor="middle">verbatimModuleSyntax · moduleResolution: bundler · erasableSyntaxOnly</text>
  <rect class="d-box-accent" x="60" y="88" width="580" height="56" rx="12"/>
  <text class="d-label-strong" x="350" y="112" text-anchor="middle">صحة تتجاوز strict</text>
  <text class="d-code" x="350" y="134" text-anchor="middle">noUncheckedIndexedAccess · exactOptionalPropertyTypes · noImplicitOverride</text>
  <rect class="d-box-success" x="60" y="156" width="580" height="56" rx="12"/>
  <text class="d-label-strong" x="350" y="180" text-anchor="middle">خط الأساس</text>
  <text class="d-code" x="350" y="202" text-anchor="middle">strict (افتراضي منذ TypeScript 6.0)</text>
</svg>
:::

## خيارات الوحدات: قل ما تعنيه

**`verbatimModuleSyntax`** (TypeScript 5.0) يجعل الـ imports الناتجة مطابقة لما كتبته. أي import دون المعدِّل `type` يُحفظ؛ والـ imports المعلَّمة بـ `type` تُمحى. هذا مهم لأن أدوات مثل Vite وesbuild وتجريد الأنواع المدمج في Node تترجم ملفًا واحدًا في كل مرة، ولا تستطيع البحث عمّا إذا كان `Order` نوعًا:

```ts
import { Order } from './orders';
// Error: 'Order' is a type and must be imported using a type-only import
// when 'verbatimModuleSyntax' is enabled.

import { type Order, placeOrder } from './orders'; // fine
```

**`moduleResolution`** يخبر TypeScript كيف يجد الـ imports الخاصة بك. طابِقه مع الأداة التي تحلّها فعلًا. لتطبيق يبنيه Vite أو bundler آخر، استخدم `"bundler"` (مع `"module": "esnext"` أو `"preserve"`): يفهم `exports` في الحزم ولا يتطلّب امتدادات الملفات. وللكود الذي يشغّله Node مباشرة، مثل خادم أو أداة سطر أوامر، استخدم `"module": "nodenext"`، الذي يتبع قواعد Node الحقيقية، بما فيها امتدادات `.js` في الـ imports النسبية. الإعداد القديم `"node"` (المسمّى أيضًا `node10`) أقدم من `exports` في الحزم؛ وهو مهمل في TypeScript 6.0 ومُزال في 7.0، مع `baseUrl` و`target: "es5"`.

**`erasableSyntaxOnly`** (TypeScript 5.8) يرفض الميزات القليلة في TypeScript التي تولّد كودًا وقت التشغيل: `enum`، والـ namespaces التي فيها قيم، وخصائص معاملات المُنشئ (parameter properties)، وصيغتَي CommonJS `import x = require(…)` و`export =`. فعّله إن كان كودك يمرّ عبر تجريد الأنواع في Node، أو إن كنت تريد أن يبقى TypeScript "JavaScript مع أنواع".

بجمعها معًا، يبدو tsconfig لتطبيق مُجمَّع بـ bundler في 2026 هكذا:

```json title=tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

`noEmit` لأن الـ bundler هو من ينتج JavaScript و`tsc` يفحص فقط. و`skipLibCheck` لأن فحص كل ملف `.d.ts` في `node_modules` يكلّف وقتًا ويجد مشكلات لا تستطيع إصلاحها.

## تفعيل الخيارات في قاعدة كود قائمة

فعّل خيارًا في قاعدة كود كبيرة وقد تحصل على 2,000 خطأ. لا تُصلحها كلها في pull request واحد. قِس أولًا (`tsc --noEmit | grep -c "error TS"`)، ثم اختر أحد نهجين. إمّا أن تُصلح مجلدًا بعد مجلد باستخدام tsconfig منفصل يمتدّ من الرئيسي ولا يضمّ إلا المجلدات النظيفة، أو أن تفعّل الخيار في كل مكان وتعلّم الأخطاء الموجودة بـ `// @ts-expect-error` مع مرجع لتذكرة، فيُحاسَب الكود الجديد بالمعيار الجديد فورًا ولا يتحرّك العدد القديم إلا نزولًا.

:::mistake إطفاء الصرامة لفكّ انسداد إصدار
ضبط `strict: false` "مؤقتًا" لإخراج بناء هو الطريقة التي ينتهي بها الحال بقواعد الكود إلى سنوات من الكود غير المفحوص: لا يُفحص أي جديد ما دام مُطفأً، وعدد الأخطاء حين تعيد تفعيله لا يزيد إلا نموًا. بدلًا من ذلك أخفِ الأخطاء منفردة بـ `@ts-expect-error` مع سبب؛ فيبقى كلٌّ منها مرئيًا وقابلًا للبحث والإزالة.
:::

التمرين سيناريو: ثلاثة أخطاء حقيقية، وتختار أنت الخيارات التي كانت ستلتقطها. بيئة التجربة نفسها تعمل بـ `strict` ومكتبة ES2022، ولهذا تحتاج بعض الميزات اللاحقة إلى تصريح صغير لتعمل فيها، كما سترى في الدرس القادم.
