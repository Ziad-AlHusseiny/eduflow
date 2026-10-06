---
summary: "أطلق ثيمًا فاتحًا وداكنًا باستخدام color-scheme وlight-dark()، وأضف تجاوزًا من المستخدم يتغلّب على إعداد النظام، واجعل قسمًا ما داكنًا دائمًا دون تكرار الـ tokens."
takeaways:
  - "`color-scheme: light dark` تخبر المتصفّح بأن الصفحة تدعم النظامين اللونيين، فتتبع عناصر النماذج وأشرطة التمرير والألوان الافتراضية إعداد المستخدم."
  - "`light-dark(A, B)` تُرجع A أو B بحسب النظام اللوني المستخدم في العنصر، فيُعرَّف كل token مرة واحدة بدل مكانين."
  - "مفتاح التبديل الثلاثي (النظام، فاتح، داكن) لا يحتاج إلا إلى ضبط `color-scheme` على الجذر؛ وكل قيمة `light-dark()` تتبعه."
  - "لأن `light-dark()` تُحسم لكل عنصر على حدة، فإن `color-scheme: dark` على قسم واحد تجعل ذلك القسم داكنًا بينما تبقى بقية الصفحة فاتحة."
further:
  - title: "light-dark() (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark
  - title: "color-scheme (MDN)"
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme
  - title: "Improved dark mode default styling with color-scheme (web.dev)"
    url: https://web.dev/articles/color-scheme
quiz:
  - q: "كتبت `--surface: light-dark(white, #0f172a)` واستخدمتها على `body`، لكن الصفحة تبقى بيضاء في الوضع الداكن. ما الناقص؟"
    options:
      - text: "كتلة `@media (prefers-color-scheme: dark)` حول الـ token."
        why: "هذه هي التقنية الأقدم؛ و`light-dark()` وُجدت كي لا تحتاج إليها. إنها تقرأ النظام اللوني بدلًا من ذلك."
      - text: "`color-scheme: light dark` على الجذر (أو على العنصر)."
        why: "صحيح. دونها يكون النظام اللوني المستخدم فاتحًا، فتُرجع `light-dark()` قيمتها الأولى دائمًا."
      - text: "تسجيل `--surface` بـ `@property`."
        why: "الـ custom properties غير المسجّلة تعمل جيدًا هنا؛ و`light-dark()` تُحسم حيث يُستخدم الـ token."
      - text: "الوضع الداكن لا يعمل إلا حين يُكتب اللون بـ oklch()."
        why: "`light-dark()` تقبل أيّ صيغة ألوان."
    answer: 1
  - q: "يجب أن تبدو الواجهة الرئيسية (hero) في Waypoint داكنة دائمًا، حتى في الوضع الفاتح. ألوانها تأتي من tokens بـ `light-dark()`. ما أصغر تغيير ممكن؟"
    options:
      - text: "كرّر كل token ببادئة `--hero-` تحمل القيم الداكنة."
        why: "ينجح، لكنه يضاعف مجموعة الـ tokens، وتنحرف النسختان لحظة يعدّل أحدهم إحداهما."
      - text: "أضف `data-theme=\"dark\"` إلى عنصر الـ hero."
        why: "هذه السمة لا تهمّ إلا إن كانت الـ CSS لديك تقرؤها هناك؛ ومفتاح التبديل في هذا الدرس يقرؤها على الجذر."
      - text: "أضف `color-scheme: dark` إلى `.hero`."
        why: "صحيح. تُحسم `light-dark()` بحسب النظام اللوني المستخدم في كل عنصر، وهو موروث، فيلتقط الـ hero وكل ما بداخله القيم الداكنة."
    answer: 2
  - q: "ما وظيفة `<meta name=\"color-scheme\" content=\"light dark\">` في رأس الـ HTML؟"
    options:
      - text: "تتيح للمتصفّح اختيار النظام الصحيح لخلفية الصفحة قبل تحميل الـ CSS، فتتجنّب الوميض الأبيض في الوضع الداكن."
        why: "صحيح. يُقرأ وسم الـ meta لحظة تحليل الـ HTML، فيكون لون الخلفية الأوّلي صحيحًا من أول رسم."
      - text: "إنها شرط لعمل `light-dark()`."
        why: "خاصية `color-scheme` في CSS تكفي لـ `light-dark()`؛ ووسم الـ meta يساعد في الرسم الأول."
      - text: "تحلّ محلّ media query `prefers-color-scheme` في كل ملفات الأنماط."
        why: "الـ media queries تظل تعمل؛ ووسم الـ meta يعلن فقط الأنظمة اللونية التي تدعمها الصفحة."
    answer: 0
---

بُني الوضع الداكن في Waypoint بالطريقة الكلاسيكية: مجموعة كاملة من tokens الألوان في `:root`، ومجموعة كاملة ثانية داخل `@media (prefers-color-scheme: dark)`. ونجح ذلك إلى أن حدثت ثلاثة أشياء. أضاف أحدهم token إلى المجموعة الفاتحة ونسي الداكنة. وطلب المستخدمون مفتاح تبديل، لأن نظام التشغيل لديهم داكن لكنهم يريدون الجدول فاتحًا على جهاز العرض. وأراد فريق التصميم أن يكون الـ hero داكنًا في *كلا* الوضعين.

كلٌّ من هذه سطر واحد مع `color-scheme` و`light-dark()`.

## color-scheme: أخبر المتصفّح بما تدعمه

```css title=theme.css
:root {
  color-scheme: light dark;
}
```

هذا التصريح يقول: «هذه الصفحة تدعم النظامين اللونيين؛ استخدم تفضيل المستخدم». ويستجيب المتصفّح برسم واجهته الخاصة لتطابق ذلك: عناصر النماذج ومربّعات الاختيار وأشرطة التمرير وخلفية الصفحة الافتراضية ولون النص. ودونه تحصل الصفحة الداكنة رغم ذلك على قوائم `<select>` وأشرطة تمرير بيضاء ساطعة، وهذه أشهر علامة تفضح وضعًا داكنًا مصنوعًا يدويًا.

أضف وسم الـ meta المقابل ليعرف المتصفّح قبل أن تصل الـ CSS، فلا تومض الصفحة بالأبيض عند التحميل:

```html
<meta name="color-scheme" content="light dark">
```

## light-dark(): token واحد بقيمتين

تأخذ `light-dark()` لونين وتُرجع الأول حين يكون النظام اللوني المستخدم في العنصر فاتحًا، والثاني حين يكون داكنًا:

```css
:root {
  color-scheme: light dark;

  --surface: light-dark(#ffffff, #0f172a);
  --text:    light-dark(#1f2937, #e5e7eb);
  --card:    light-dark(#f8fafc, #1e293b);
  --border:  light-dark(oklch(90% 0.01 280), oklch(35% 0.02 280));
}

body {
  background: var(--surface);
  color: var(--text);
}
.session-card {
  background: var(--card);
  border: 1px solid var(--border);
}
```

كل token يُعرَّف الآن مرة واحدة، والقيمتان جنبًا إلى جنب. وإضافة token دون قيمته الداكنة تصبح ناقصة بشكل واضح عند المراجعة. `light-dark()` للألوان ضمن Baseline 2024 وتعمل في كل المتصفّحات الحالية. أما تمرير صورتين إليها (مثل التدرّجات أو `url()`) فلم يدخل Baseline إلا في سبتمبر 2026، وهي لا تقبل الأطوال ولا غيرها من القيم أبدًا، لذا أبقِ لهذه الحالات media query `prefers-color-scheme` في الوقت الحالي.

:::mistake نسيان color-scheme
`light-dark()` لا تقرأ نظام التشغيل مباشرةً. إنها تقرأ *النظام اللوني المستخدم* في العنصر، الذي يأتي من خاصية `color-scheme`. وإن لم يضبط شيءٌ `color-scheme: light dark` (أو `dark`)، يكون النظام فاتحًا، وتُرجع كل `light-dark()` وسيطها الأول، حتى على نظام تشغيل داكن.
:::

## مفتاح تبديل يتغلّب على إعداد النظام

لأن كل شيء يقرأ النظام اللوني، لا يحتاج مفتاح التبديل إلا إلى تغيير خاصية واحدة على الجذر:

```css
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark; }
```

دون `data-theme` يحتفظ الجذر بـ `light dark` ويتبع نظام التشغيل. ومع `data-theme="dark"` يُفرض الداكن، ويتبعه كل token. وكود JavaScript لعنصر تحكّم ثلاثي صغير جدًا:

```js title=theme-toggle.js
const select = document.querySelector('#theme');
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.dataset.theme = saved;

select.addEventListener('change', () => {
  const value = select.value; // 'system' | 'light' | 'dark'
  if (value === 'system') {
    delete document.documentElement.dataset.theme;
    localStorage.removeItem('theme');
  } else {
    document.documentElement.dataset.theme = value;
    localStorage.setItem('theme', value);
  }
});
```

شغّل جزء الاستعادة في script صغير مضمّن داخل `<head>` ليُطبَّق الثيم المحفوظ قبل الرسم الأول.

:::figure يُحسم النظام اللوني لكل عنصر، ثم تختار light-dark() قيمة
<svg viewBox="0 0 680 250" role="img" aria-labelledby="t1">
  <title id="t1">لعنصر الجذر color-scheme فاتح أو داكن أو الاثنان معًا تبعًا لنظام التشغيل. معظم العناصر ترثه. والـ hero يضبط color-scheme على dark، فيُرجع كل token من نوع light-dark داخله قيمته الداكنة، بينما تُرجع بقية الصفحة القيم الفاتحة.</title>
  <rect class="d-box-primary" x="20" y="20" width="260" height="60" rx="10"/>
  <text class="d-code" x="36" y="46">:root color-scheme</text>
  <text class="d-label-muted" x="36" y="68">النظام / فاتح / داكن</text>
  <path class="d-arrow" d="M150 80 L150 120" marker-end="url(#arrow)"/>
  <rect class="d-box" x="20" y="124" width="260" height="56" rx="10"/>
  <text class="d-label" x="36" y="148">.schedule ترث</text>
  <text class="d-code" x="36" y="170">light-dark(A, B) → A</text>
  <rect class="d-box-accent" x="360" y="20" width="300" height="60" rx="10"/>
  <text class="d-code" x="376" y="46">.hero</text>
  <text class="d-code" x="376" y="68">color-scheme: dark</text>
  <path class="d-arrow" d="M510 80 L510 120" marker-end="url(#arrow)"/>
  <rect class="d-box" x="360" y="124" width="300" height="56" rx="10"/>
  <text class="d-label" x="376" y="148">بطاقة الـ hero ترث الداكن</text>
  <text class="d-code" x="376" y="170">light-dark(A, B) → B</text>
  <path class="d-line d-dashed" d="M280 50 L360 50"/>
  <text class="d-label-muted" x="20" y="222">الـ tokens نفسها في كل مكان؛ وكل عنصر يحسمها بنظامه اللوني.</text>
</svg>
:::

## فرض الداكن على قسم واحد

`color-scheme` موروثة، و`light-dark()` تُحسم بحسب قيمة كل عنصر. لذا لا يحتاج الـ hero الداكن دائمًا إلا إلى تصريح واحد:

```css
.hero {
  color-scheme: dark;
  background: var(--surface);
  color: var(--text);
}
```

داخل الـ hero تُحسم `--surface` و`--text` و`--card` كلها إلى قيمها الداكنة، بما في ذلك بطاقة جلسة الـ keynote المتداخلة فيه، بينما تبقى بقية الصفحة فاتحة. والحيلة نفسها تعمل في الاتجاه المعاكس للوحة «معاينة طباعة» فاتحة داخل تطبيق داكن.

## تصميم لوحة الألوان الداكنة

الوضع الداكن ليس الوضع الفاتح مقلوبًا. هذه بضع قواعد تصمد في المشاريع الحقيقية:

- **تجنّب الأسود الصافي.** رمادي مزرقّ داكن جدًا مثل `#0f172a` أريح للعين ويترك مجالًا للارتفاع البصري (elevation).
- **أظهر الارتفاع بأسطح أفتح** لا بالظلال: تجلس البطاقة على `#1e293b`، والنافذة المنبثقة (popover) على درجة أفتح منها. الظلال بالكاد تظهر على الخلفيات الداكنة.
- **خفّض تشبّع ألوان التمييز.** ألوان المسارات الحيوية من الدرس السابق تهتزّ على الخلفية الداكنة. و`oklch(from var(--track) 72% calc(c * 0.8) h)` ترفع الإضاءة وتخفّف التشبّع للأسطح الداكنة.
- **أعد فحص التباين في النظامين.** الزوج الذي ينجح في الوضع الفاتح لا يضمن شيئًا في الداكن.

لا تحتاج إلى تغيير نظام التشغيل لاختبار أيٍّ من هذا. تستطيع DevTools في Chrome محاكاة `prefers-color-scheme: dark` من لوحة Rendering، ولدى Firefox مفتاح في الـ Inspector. اختبر حالات المفتاح الثلاث والـ hero في كلٍّ منها، وافحص عناصر النماذج: فهي أول مكان يظهر فيه غياب `color-scheme`.

## دورك الآن

يستخدم التمرين النمط القديم: tokens مع تجاوز بـ `prefers-color-scheme`، ولا مفتاح تبديل. أعد كتابة الـ tokens بـ `light-dark()`، واربط `data-theme` على الجذر، واجعل الـ hero داكنًا في الوضعين. تضبط الفحوصات `data-theme` وتقرأ الألوان المحسوبة. وبعدها ستتأكّد من أن من يتنقّلون بلوحة المفاتيح يرون أين هم، في الثيمين كليهما.
