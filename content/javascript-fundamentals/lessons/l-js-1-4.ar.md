---
summary: 'تُنشئ النصوص وتنظّفها، وتقرأ الحروف عبر الفهرس، وتستخدم دوال النصوص اليومية، وتبني مخرجات مقروءة مثل "Lunch: $12.20" باستخدام الـ template literals.'
takeaways:
  - 'يمكن كتابة النصوص بعلامات تنصيص مفردة أو مزدوجة أو بعلامات backtick؛ وعلامات backtick تصنع الـ template literals، التي تستطيع إدراج القيم عبر `${}` وتمتد على عدّة أسطر.'
  - 'النصوص غير قابلة للتعديل (immutable)، لذلك تُرجع دوال مثل `trim()` و`toUpperCase()` نصًا جديدًا وتترك الأصلي كما هو.'
  - 'تُرقَّم الحروف بدءًا من 0، و`length` تعدّها، و`slice(start, end)` تنسخ جزءًا حتى `end` دون أن تشمله.'
  - 'نسّق السنتات للعرض باستخدام `(cents / 100).toFixed(2)` أو `Intl.NumberFormat`، وأبقِ المبلغ المخزّن رقمًا.'
further:
  - title: Template literals (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
  - title: String (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
  - title: Intl.NumberFormat (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
quiz:
  - q: |
      ماذا يطبع هذا الكود؟
      ```js
      let label = "  lunch ";
      label.trim();
      console.log(`[${label}]`);
      ```
    options:
      - text: '`[lunch]`'
        why: '`trim()` تُرجع نصًا جديدًا مشذّبًا، لكن لا شيء يخزّنه، فيبقى `label` بمسافاته.'
      - text: '`[  lunch ]`'
        why: 'صحيح. النصوص غير قابلة للتعديل. اكتب `label = label.trim();` لتحتفظ بالناتج.'
      - text: '`[${label}]`'
        why: 'علامات backtick تصنع template literal، فيُستبدل `${label}` بقيمة `label`.'
    answer: 1
  - q: '`const word = "Pocket";` أيّ تعبير يعطي `"Poc"`؟'
    options:
      - text: '`word.slice(1, 3)`'
        why: 'الفهارس تبدأ من 0، لذلك يبدأ هذا من "o" ويتوقّف قبل الفهرس 3، فيعطي "oc".'
      - text: '`word.slice(0, 2)`'
        why: 'فهرس النهاية مستثنى، لذلك يعطي هذا "Po" فقط.'
      - text: '`word[0, 3]`'
        why: 'الأقواس المربّعة تقرأ حرفًا واحدًا. وتعبير الفاصلة ناتجه 3، فيُرجع هذا "k".'
      - text: '`word.slice(0, 3)`'
        why: صحيح. إنه ينسخ الفهارس 0 و1 و2 ويتوقّف قبل 3.
    answer: 3
  - q: 'تحتاج إلى عرض 1220 سنتًا على شكل `$12.20`. أيّ هذه صحيح؟'
    options:
      - text: '`"$" + (1220 / 100).toFixed(2)`'
        why: 'صحيح. القسمة تعطي 12.2، و`toFixed(2)` تُرجع النص "12.20" بمنزلتين عشريتين بالضبط.'
      - text: '`"$" + 1220 / 100`'
        why: 'هذا يطبع "$12.2"، لأن الأرقام تُسقط الأصفار في آخرها حين تتحوّل إلى نص.'
      - text: '`"$" + 1220.toFixed(2)`'
        why: هذا ينسّق السنتات لا الدولارات، ثم إن النقطة مباشرة بعد عدد صحيح مكتوب حرفيًا خطأ في الصياغة أصلًا.
    answer: 0
---

صارت أرقام Pocket دقيقة، لكن لا أحد يريد أن يقرأ `1220`. الناس يريدون `Lunch: $12.20`. النص في JavaScript اسمه **string** (سلسلة نصية)، ومعظم ما يراه المستخدم من برنامجك هو نصوص بنيتها أنت.

## كتابة النصوص

يمكنك كتابة النص بعلامات تنصيص مفردة أو مزدوجة أو بعلامات backtick:

```js run
const a = 'Coffee';
const b = "Sam's lunch";
const c = `Bus`;
console.log(a, b, c);
```

العلامات المفردة والمزدوجة تتصرّفان بالطريقة نفسها؛ اختر أسلوبًا والتزم به (هذه الدورة تستخدم العلامات المزدوجة). واستخدم النوع الآخر حين يحتوي نصّك على علامة تنصيص، كما في `"Sam's lunch"`، أو "اهرب" منها بشرطة مائلة عكسية: `'Sam\'s lunch'`. و`\n` داخل النص تعني سطرًا جديدًا.

أما علامات backtick فلها شأن خاص، وستستخدمها أكثر من غيرها. إنها تصنع **الـ template literals** (القوالب النصية).

## الـ Template literals: قيم داخل النص

لصق النصوص باستخدام `+` يصبح فوضويًا بسرعة: `"Lunch: $" + dollars + " (" + category + ")"`. من السهل أن تنسى مسافة أو علامة تنصيص. أما الـ template literal فيتيح لك كتابة النص مرة واحدة وإسقاط القيم فيه عبر `${ }`:

```js run
const label = "Lunch";
const cents = 1220;
const category = "food";

const line = `${label}: $${(cents / 100).toFixed(2)} (${category})`;
console.log(line);
```

كل ما داخل `${ }` تعبير JavaScript كامل: يُحسب، ثم يُحوَّل إلى نص، ثم يُدرج. هنا تقسم `(cents / 100).toFixed(2)` لتحصل على `12.2`، ثم تحوّلها `toFixed(2)` إلى النص `"12.20"` بمنزلتين عشريتين بالضبط. علامة `$` الأولى مجرّد علامة دولار عادية؛ فقط `$` المتبوعة بـ `{` هي التي تبدأ الإدراج.

ويمكن للـ template literals أيضًا أن تمتد على عدّة أسطر، وهذا مفيد للرسائل متعدّدة الأسطر:

```js run
const report = `Pocket summary
  Spent: $22.00
  Left:  $3.00`;
console.log(report);
```

:::tip منسّق عملات حقيقي
`toFixed` كافية لـ Pocket. أما في التطبيقات الحقيقية التي تعرض عملات كثيرة، فاستخدم المنسّق المدمج في اللغة، فهو يعرف رمز كل عملة وفواصلها:
```js run
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
console.log(usd.format(1220 / 100));
console.log(usd.format(1234567 / 100));
```
:::

## الحروف والمواضع والمقاطع

النص سلسلة من الحروف، ولكل حرف موضع يُسمّى **الفهرس** (index)، يبدأ العدّ فيه من 0. و`length` تخبرك بعدد الحروف.

:::figure الفهارس تبدأ من 0، وslice تتوقّف قبل فهرس النهاية
<svg viewBox="0 0 640 200" role="img" aria-labelledby="t1">
  <title id="t1">النص Coffee فيه ستة حروف في الفهارس من 0 إلى 5. التعبير slice(0, 3) ينسخ الفهارس 0 و1 و2 فيعطي Cof، ويتوقّف قبل الفهرس 3.</title>
  <rect class="d-box-primary" x="110" y="40" width="70" height="56" rx="8"/>
  <text class="d-code" x="145" y="74" text-anchor="middle">C</text>
  <rect class="d-box-primary" x="180" y="40" width="70" height="56" rx="8"/>
  <text class="d-code" x="215" y="74" text-anchor="middle">o</text>
  <rect class="d-box-primary" x="250" y="40" width="70" height="56" rx="8"/>
  <text class="d-code" x="285" y="74" text-anchor="middle">f</text>
  <rect class="d-box" x="320" y="40" width="70" height="56" rx="8"/>
  <text class="d-code" x="355" y="74" text-anchor="middle">f</text>
  <rect class="d-box" x="390" y="40" width="70" height="56" rx="8"/>
  <text class="d-code" x="425" y="74" text-anchor="middle">e</text>
  <rect class="d-box" x="460" y="40" width="70" height="56" rx="8"/>
  <text class="d-code" x="495" y="74" text-anchor="middle">e</text>
  <text class="d-label-muted" x="145" y="122" text-anchor="middle">0</text>
  <text class="d-label-muted" x="215" y="122" text-anchor="middle">1</text>
  <text class="d-label-muted" x="285" y="122" text-anchor="middle">2</text>
  <text class="d-label-muted" x="355" y="122" text-anchor="middle">3</text>
  <text class="d-label-muted" x="425" y="122" text-anchor="middle">4</text>
  <text class="d-label-muted" x="495" y="122" text-anchor="middle">5</text>
  <text class="d-label-muted" x="60" y="122" text-anchor="middle">الفهرس</text>
  <path class="d-line" d="M110 150 L320 150"/>
  <text class="d-code" x="215" y="178" text-anchor="middle">slice(0, 3) → "Cof"</text>
  <path class="d-dashed" d="M320 30 L320 160"/>
  <text class="d-label-muted" x="420" y="178" text-anchor="middle">تتوقّف قبل 3</text>
</svg>
:::

```js run
const word = "Coffee";
console.log(word.length);      // 6
console.log(word[0]);          // first character
console.log(word.at(-1));      // last character
console.log(word.slice(0, 3)); // from index 0 up to, not including, 3
console.log(word.slice(3));    // from index 3 to the end
```

`word.at(-1)` تعدّ من النهاية، وهذا يُغنيك عن كتابة `word[word.length - 1]`.

## دوال تُرجع نصوصًا جديدة

تأتي النصوص مع **methods** (دوال مدمجة) جاهزة، وهي دوال تستدعيها بنقطة. هذه التي ستستخدمها أسبوعيًا:

```js run
const raw = "  Coffee with Sam  ";
const clean = raw.trim();

console.log(clean);                      // spaces removed from both ends
console.log(clean.toUpperCase());
console.log(clean.includes("Sam"));      // true or false
console.log(clean.startsWith("Coffee"));
console.log(clean.replaceAll(" ", "-"));
console.log("7".padStart(3, "0"));       // "007"
console.log(`[${raw}]`);                 // the original is untouched
```

السطر الأخير هو الفكرة الأساسية: النصوص **غير قابلة للتعديل** (immutable). لا توجد method تغيّر نصًا أبدًا؛ كل واحدة تُرجع نصًا جديدًا. فإن أردت الاحتفاظ بالناتج، فخزّنه.

:::mistake استدعاء method ثم رمي الناتج
```js
let label = "  coffee ";
label.trim();          // returns "coffee"... and nobody keeps it
label.toUpperCase();   // same again
console.log(label);    // still "  coffee "
```
اكتب `label = label.trim();`، أو الأفضل أن تخزّن الناتج باسم `const` جديد: `const cleanLabel = label.trim();`.
:::

الجمع بين عدّة methods أمر شائع. لتجعل الحرف الأول من تسمية ما حرفًا كبيرًا، خذ الحرف الأول، وحوّله إلى حرف كبير، وأضف إليه الباقي:

```js run
const label = "groceries";
const nice = label[0].toUpperCase() + label.slice(1);
console.log(nice);
```

وهناك دالتان أخريان تجيبان عن سؤال "أين هو؟" بدلًا من "هل هو موجود؟". `indexOf("Sam")` تُرجع الفهرس الذي يظهر فيه النص لأول مرة، أو `-1` إن لم يكن موجودًا أصلًا. و`split(" ")` تقطّع النص إلى أجزاء أينما وجدت الفاصل، وتُعيد إليك قائمة: `["Coffee", "with", "Sam"]`. تُسمّى القوائم مصفوفات (arrays)، ولها درس كامل في القسم 3.

## من النصوص إلى الأرقام وبالعكس

يعبر Pocket الحدود بين النصوص والأرقام باستمرار. المبالغ أرقام حين تحسب، ونصوص حين تعرضها؛ والمدخلات المكتوبة نصوص إلى أن تحوّلها.

```js run
const cents = 450;
console.log(String(cents), typeof String(cents));  // number to string
console.log(`${cents}`.length);                    // a template literal converts too
console.log(Number("4.50") * 100);                 // string to number
console.log(Number("  12 "));                      // spaces around digits are ignored
console.log(Number(""));                           // careful: an empty string becomes 0
```

السطر الأخير فخّ يستحق أن تتذكّره. حقل النص الفارغ يتحوّل إلى `0` لا إلى `NaN`، فيبدو "المستخدم لم يكتب شيئًا" مطابقًا تمامًا لـ "المستخدم كتب صفرًا". وحين تتحقّق من النماذج في القسم 4، ستفحص المدخلات الفارغة قبل التحويل.

## مقارنة النصوص

`===` تقارن النصوص حرفًا حرفًا، وهي حسّاسة لحالة الأحرف: `"Food" === "food"` تساوي `false`. والمستخدمون يكتبون الفئات كيفما شاؤوا، لذلك **وحّد الشكل قبل أن تقارن**: احذف المسافات واختر حالة أحرف واحدة.

```js run
const typed = "  Food ";
console.log(typed === "food");                       // false
console.log(typed.trim().toLowerCase() === "food");  // true
```

ويمكنك أيضًا استخدام `<` و`>` مع النصوص. إنهما تقارنان رموز الحروف موضعًا بموضع، وهذا ينجح مع الكلمات البسيطة ذات الأحرف الصغيرة (`"apple" < "banana"` صحيحة)، ويفشل سريعًا فيما عدا ذلك: `"Zebra" < "apple"` صحيحة أيضًا، لأن كل حرف كبير له رمز أصغر من كل حرف صغير. يُريك القسم 3 الطريقة الصحيحة لترتيب النصوص، باستخدام `localeCompare`، التي تتبع قواعد لغة حقيقية.

يستطيع Pocket الآن أن يحمل المبالغ، ويحسب بها بدقة، ويطبعها بشكل يقرؤه الناس. لكن ما لا يستطيعه بعد هو أن يتفاعل: أن ينبّهك حين تتجاوز ميزانيتك، أو أن يعامل الطعام بشكل مختلف عن الإيجار. في القسم التالي يبدأ برنامجك باتخاذ القرارات.
