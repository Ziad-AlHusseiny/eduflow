---
summary: اقرأ الـ design tokens واكتبها بصيغة DTCG 2025.10 في JSON، مع الأنواع والمجموعات والأسماء المستعارة والـ deprecation، حتى يغذّي ملف tokens واحد Figma وCSS والتطبيقات الأصلية.
takeaways:
  - تخزّن صيغة DTCG الـ tokens ككائنات JSON فيها `$value`، و`$type` محدّد على الـ token نفسه أو موروث من مجموعته.
  - الأسماء المستعارة (aliases) تستخدم أقواسًا معقوفة ومسارات مفصولة بنقاط، مثل `{color.blue.600}`، ويجب أن تشير إلى token لا إلى مجموعة.
  - منذ 2025.10 صارت قيمة اللون كائنًا فيه `colorSpace` و`components`، مع `hex` اختياري كبديل احتياطي.
  - الإصدار 2025.10 هو أول إصدار مستقر لتقرير من W3C Community Group، وليس توصية رسمية من W3C (Recommendation)، ودعم الأدوات له ما زال متفاوتًا.
further:
  - title: Design Tokens specification reaches first stable version (W3C Community Group)
    url: https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
  - title: Design Tokens Community Group repository
    url: https://github.com/design-tokens/community-group
  - title: Modes for variables, including importing and exporting tokens (Figma)
    url: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables
quiz:
  - q: |
      إلامَ يُحَلّ المرجع `{color.action}` في هذا الملف؟
      ```json
      {
        "color": {
          "$type": "color",
          "action": {
            "bg": { "$value": "{color.blue.600}" },
            "text": { "$value": "{color.white}" }
          }
        }
      }
      ```
    options:
      - text: إلى قيمة `color.action.bg`، لأنه أول token في المجموعة.
        why: لا توجد في الصيغة قاعدة «أول token»؛ يجب أن يسمّي المرجع token واحدًا بالضبط.
      - text: إلى كائن يحتوي `bg` و`text` معًا.
        why: المراجع بالأقواس المعقوفة لا تُحَلّ إلا إلى `$value` الخاص بـ token واحد، ولا تُحَلّ أبدًا إلى مجموعة كاملة.
      - text: إلى النص "color".
        why: الـ `$type` الخاص بالمجموعة ترثه الـ tokens داخلها؛ وليس قيمة يمكن أن يعيدها مرجع.
      - text: إلى لا شيء صالح؛ `color.action` مجموعة، فالمرجع خطأ.
        why: صحيح. يجب أن تستهدف المراجع token، أي كائنًا فيه `$value`.
    answer: 3
  - q: token ليس له `$type`، ولا لأي مجموعة فوقه. وقيمته `"#1f5ae0"`. ماذا يجب أن تفعل الأداة الملتزمة بالصيغة؟
    options:
      - text: أن تستنتج أنه لون من البادئة `#`.
        why: الصيغة تمنع تخمين الأنواع من القيم، لأن النص نفسه قد يعني أشياء مختلفة لأدوات مختلفة.
      - text: أن تعامل الـ token كأنه غير صالح.
        why: صحيح. كل token يحتاج نوعًا صريحًا، إما عليه نفسه، أو موروثًا من مجموعة، أو من الـ token الذي يشير إليه.
      - text: أن تعامله كـ token نصّي.
        why: النص (string) ليس نوعًا في الصيغة؛ ولا يمكن للأدوات أن ترجع إليه بصمت.
    answer: 1
  - q: يقول زميل «صارت DTCG معيارًا من W3C، فكل الأدوات تقرأ كل الميزات». ما التصحيح الدقيق؟
    options:
      - text: إنها تقرير مستقر من Community Group وليست توصية رسمية من W3C، والأدوات تطبّقها بسرعات مختلفة.
        why: صحيح. الاستقرار يعني أن الصيغة لن تتغيّر من تحتك؛ لكنه لا يضمن بعدُ أن كل أداة تدعم كل نوع أو الـ Resolver.
      - text: ما زالت مسودّة مبكرة لا تدعمها أي أداة.
        why: إصدار 2025.10 مستقر، وتدعمه Style Dictionary وTokens Studio وTerrazzo واستيراد المتغيّرات وتصديرها في Figma.
      - text: إنها توصية رسمية من W3C، لكن لـ tokens الألوان فقط.
        why: ليست توصية رسمية أصلًا، وتغطّي أنواعًا كثيرة غير الألوان.
      - text: إنها تحلّ محلّ الـ CSS custom properties في المتصفّحات.
        why: الصيغة ملف تبادل بين الأدوات؛ والمتصفّحات ما زالت تستهلك CSS يولّده خط إنتاج منها.
    answer: 0
---

الـ CSS custom properties طريقة ممتازة لـ *استهلاك* الـ tokens على الويب، لكنها مكان سيئ لـ *تخزينها*. تطبيق iOS لا يستطيع قراءة ملف الأنماط، وFigma لا يستطيع استيراده، والسكربت الذي يفحص التباين عبر الـ themes يضطر إلى تحليل CSS ليجد القيم. لذلك تعيش tokens في Northwind في ملفات JSON، بالصيغة التي حدّدتها مجموعة Design Tokens Community Group (DTCG)، ويُولَّد كود كل منصّة منها.

## أين تقف الصيغة في 2026

الـ DTCG مجموعة مجتمعية (Community Group) تابعة لـ W3C، أعضاؤها من صانعي أدوات التصميم وفرق أنظمة تصميم كبيرة. في 28 أكتوبر 2025 نشرت أول إصدار مستقر من مواصفتها، **2025.10**، ويتكوّن من ثلاث وحدات: Format، وColor، ووحدة Resolver لتركيب المجموعات والـ themes.

كن دقيقًا حين تصفها للآخرين. إنها تقرير مستقر من Community Group، وليست توصية رسمية من W3C (Recommendation)؛ فالمجموعات المجتمعية لا تُصدر معايير ويب رسمية. وعمليًا هي الصيغة التي تتقارب حولها الأدوات: Style Dictionary وTokens Studio وTerrazzo تطبّقها، وFigma يستورد المتغيّرات ويصدّرها كـ JSON بصيغة DTCG. لكن دعم الأجزاء الأحدث، مثل صيغة اللون ككائن ووحدة Resolver، ما زال متفاوتًا بين الأدوات، لذا افحص ما يقرؤه خط الإنتاج لديك فعلًا قبل تبنّي ميزة.

## تشريح ملف الـ tokens

```json title=tokens/primitives.tokens.json
{
  "color": {
    "$type": "color",
    "blue": {
      "600": {
        "$value": { "colorSpace": "srgb", "components": [0.122, 0.353, 0.878], "hex": "#1f5ae0" },
        "$description": "Northwind brand blue. Passes 4.5:1 on white."
      }
    },
    "white": {
      "$value": { "colorSpace": "srgb", "components": [1, 1, 1], "hex": "#ffffff" }
    }
  },
  "space": {
    "$type": "dimension",
    "4": { "$value": { "value": 1, "unit": "rem" } }
  }
}
```

اقرأه من الخارج إلى الداخل:

- **المجموعات (groups)** كائنات متداخلة عادية (`color`، `blue`، `space`). تنظّم الـ tokens وتشكّل المسار المستخدم في المراجع.
- **الـ token** أي كائن فيه `$value`. هنا `color.blue.600` و`space.4` هما الـ tokens.
- **`$type`** يحدّد نوع القيمة التي يحملها الـ token. وحين يُحدَّد على مجموعة، ترثه كل الـ tokens داخلها، ولهذا تعرّفه `color` مرة واحدة.
- **`$description`** نص حرّ تعرضه الأدوات في المنتقيات والتوثيق.

الخصائص التي تبدأ بـ `$` محجوزة للصيغة، فلا يمكن أن تبدأ أسماء الـ tokens والمجموعات بـ `$`. ولا يمكن أن تحتوي الأسماء أيضًا على `{` أو `}` أو `.`، لأن هذه الرموز تنتمي إلى صيغة المراجع.

## الأنواع وأشكال القيم

لكل نوع شكل قيمة ثابت. هذه هي الأنواع التي ستستخدمها يوميًا:

| `$type` | مثال على `$value` |
|---|---|
| `color` | `{ "colorSpace": "srgb", "components": [1, 1, 1], "hex": "#ffffff" }` |
| `dimension` | `{ "value": 16, "unit": "px" }` (الوحدة `px` أو `rem`) |
| `duration` | `{ "value": 150, "unit": "ms" }` (الوحدة `ms` أو `s`) |
| `fontWeight` | `600` أو `"semi-bold"` |
| `number` | `1.5` |

وهناك أيضًا `fontFamily` و`cubicBezier`، إضافة إلى أنواع مركّبة تجمع عدّة قيم: `typography` و`shadow` و`border` و`transition` و`gradient` و`strokeStyle`.

كائن اللون جديد في 2025.10. المسودّات الأقدم، وكثير من ملفات الـ tokens المتداولة، تخزّن نص hex بسيطًا. أما صيغة الكائن فتستطيع وصف ألوان خارج sRGB، مثل `display-p3` أو `oklch`، ولهذا حلّت محلّ النص. احتفظ بالـ `hex` الاختياري للأدوات التي لا تفهم إلا sRGB.

:::mistake ترك الأداة تخمّن النوع
الـ token الذي لا يوجد `$type` في أي مكان من شجرته غير صالح، حتى لو بدت قيمته لونًا بوضوح. الصيغة تمنع الاستنتاج عن قصد، لأن `"16"` قد يكون رقمًا أو حجم خط أو z-index. ضع `$type` على مجموعاتك العليا، ونادرًا ما ستحتاج إلى التفكير فيه بعد ذلك.
:::

## الأسماء المستعارة (aliases)

الطبقة الدلالية من الدروس السابقة تعيش في الصيغة نفسها، على شكل مراجع:

```json title=tokens/semantic.tokens.json
{
  "color": {
    "$type": "color",
    "action": {
      "bg": { "$value": "{color.blue.600}" },
      "text": { "$value": "{color.white}" },
      "bg-hover": { "$value": "{color.blue.700}" },
      "bg-dark": {
        "$value": "{color.blue.700}",
        "$deprecated": "Use color.action.bg-hover instead. Removed in 5.0."
      }
    }
  }
}
```

المرجع بالأقواس المعقوفة يسمّي token بمساره المفصول بنقاط، ويُحَلّ إلى قيمة `$value` الكاملة لذلك الـ token. ويجب أن يشير إلى token، لا إلى مجموعة أبدًا. يمكن أن تتسلسل المراجع (من semantic إلى primitive)، ويجب أن ترفض الأداة المراجع الدائرية. وللحالة النادرة التي تحتاج فيها جزءًا من قيمة، مثل مكوّن لون واحد، تدعم الصيغة أيضًا مراجع JSON Pointer عبر `$ref`.

هذا جوهر ما تفعله كل أداة tokens مع الأسماء المستعارة:

```js run
const tokens = {
  color: {
    $type: 'color',
    blue: { 600: { $value: { colorSpace: 'srgb', components: [0.122, 0.353, 0.878], hex: '#1f5ae0' } } },
    action: {
      bg: { $value: '{color.blue.600}' },
      'bg-subtle': { $value: '{color.action.bg}' },
    },
  },
};

function lookup(path) {
  const node = path.split('.').reduce((n, key) => n?.[key], tokens);
  if (!node || !('$value' in node)) throw new Error(`{${path}} is not a token`);
  return node;
}

function resolve(path, seen = []) {
  if (seen.includes(path)) throw new Error(`circular reference: ${[...seen, path].join(' -> ')}`);
  const { $value } = lookup(path);
  const ref = typeof $value === 'string' && $value.match(/^\{(.+)\}$/);
  return ref ? resolve(ref[1], [...seen, path]) : $value;
}

console.log(resolve('color.action.bg-subtle').hex);
try { resolve('color.action'); } catch (e) { console.log(e.message); }
```

## ميزتان أخريان تستحقّان المعرفة

`$deprecated`، الظاهرة أعلاه على `bg-dark` (اسم يصف المظهر، وهو ما حذّر منه درس التسمية)، تعلّم token بأنه في طريقه إلى الخروج. قيمتها `true` أو نص يشرح ما يُستخدم بدلًا منه، ويمكن للأدوات أن تحذّر حين يختاره أحد. ستبني عملية deprecation كاملة حولها في القسم 4.

ويمكن للمجموعات أيضًا أن ترث من مجموعات أخرى عبر `$extends`، فتخصّص ما يختلف فقط. وهذا مفيد لمجموعة Tidewater التي تعيد استخدام معظم بنية Northwind. أما لتركيبات الفاتح والداكن والعلامات الكاملة، فوحدة Resolver تحدّد كيف تتركّب مجموعات الـ tokens المنفصلة والمعدِّلات، لكنها أحدث جزء في المواصفة، لذا ما زالت Northwind تجمّع الـ themes في خط إنتاج البناء الخاص بها. امتدادات الملفات الموصى بها هي `.tokens` و`.tokens.json`؛ وتستخدم Northwind الثاني حتى تلوّن المحرّرات الملفات كـ JSON.

في التمرين التالي تراجع ملف tokens كما يراجعه خط الإنتاج، وتجد الأسطر التي سيرفضها. وبعدها تبني خط الإنتاج هذا بنفسك.
