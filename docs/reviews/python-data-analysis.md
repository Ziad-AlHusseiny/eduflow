# Review: python-data-analysis

## Verdict

This is a strong beginner course. Its 24 lessons follow one Cartwheel story, from a first `print()` to a Q4 board answer. It teaches the habits that matter: inspect before trusting, check that parts add up to the whole, use `validate=` on every merge, never chain assignments, flag ambiguous dates instead of guessing, and give every explanation a number. I ran every `python run` block and every exercise solution locally (CPython 3.13, pandas 2.3.3). The exercise checker also passed in Pyodide. I recomputed every figure quoted in the prose from the CSVs, and almost all of them match exactly. The pandas 2.x claims are correct: Copy-on-Write is opt-in in 2.x and the default in 3.0, `str.replace` defaults to `regex=False`, `to_datetime` infers the format from the first value, `"ME"`/`"QE"` are the current aliases, and `pd.NA` and nullable dtypes are covered. The Q4 case study's conclusion follows from the data: a seasonal peak on a business 2.7x the size of 2024, driven by order volume, not basket size.

The problems I fixed were these:

- **Sentences that disagreed with the data:** padded country names that don't exist; channel medians "closer together than the means" when they aren't; a European-format failure mode described wrongly; "missing mostly in H1" when all four misses were in H1.
- **A runtime warning nobody mentioned:** on this course's own runtime (pandas 2, CoW off), adding a column to a filtered table prints `SettingWithCopyWarning`, and no lesson said so.
- **A missing note** that periods keep `"M"` while `resample` needs `"ME"`.
- **One case-study claim** that needed the supporting number.
- **Arabic:** a handful of literal or ungrammatical phrasings, and about 50 unnecessary direction marks.

No ids, answer positions or structure changed.

## Issues found and fixed

| File | Category | Severity | What was wrong | What changed |
|---|---|---|---|---|
| lessons/l-pda-1-2.en/.ar.md | accuracy | medium | The opening said the export's *total* reads `$129.00`, then the code treated it as the unit price (`2 * price`), with a variable `total_text`. | Opening now says "the unit price reads `$129.00`". Variable renamed `price_text`, which matches the exercise. |
| lessons/l-pda-1-2.en/.ar.md | accuracy | low | Quiz "why": `float()` "only accepts digits, a decimal point, a sign and an exponent". It also accepts surrounding spaces. | Now lists what it accepts, including spaces, and what it rejects (`$`, thousands comma). |
| lessons/l-pda-1-4.en/.ar.md | pedagogy | low | "Twelve rows… sit in a list", but the example list has six. | Now "Six rows". |
| lessons/l-pda-2-2.en/.ar.md | pedagogy | low | The routine is "five steps", but the headings started at "Step 2". It also said text dates sort correctly "only by luck". | First heading is now "Step 1: load it, then check shape and head()". The sort explanation now names the year-first format. |
| lessons/l-pda-2-4.en/.ar.md | accuracy | medium | Called `.copy()` after a filter something from "older pandas code". The course runs pandas 2 with CoW off, where it still matters. | Now explains that pandas 2 prints `SettingWithCopyWarning` when you add a column to a filtered table, and that `.copy()` silences it. |
| lessons/l-pda-2-5.en/.ar.md | accuracy | medium | The "editing a filtered table" mistake didn't mention that learners will see `SettingWithCopyWarning` on this runtime. I verified this in pandas 2.3.3. | Callout now names the warning and the `.copy()` fix. It keeps the `.loc` advice. |
| lessons/l-pda-3-1.en/.ar.md | accuracy | low | "Ask four questions", but the figure has three questions plus a default outcome. | Text and caption now say three questions. "If every answer is no, keep it missing" is stated. |
| exercises/l-pda-3-1.en/.ar.json | consistency | low | The explanation said "no defensible value exists" for missing quantities. The lesson says they can be recovered by the Lesson 4.2 join, and I verified that they can. | Now "until you recover them with the join from Lesson 4.2". |
| lessons/l-pda-3-2.en/.ar.md | accuracy | medium | The opening claimed some country names were padded with spaces. All 22 variants differ only in case. Quiz Q1 said `.str.title()` alone fails because of spaces, but on this file it gives 8. | Removed the false claim. The question is now "the fix you should write". The "why" explains that title() happens to work here but strip is the robust habit. |
| lessons/l-pda-3-2.en/.ar.md | pedagogy | low | Prose fell to 596 words after the fix, and the validator warned. | Added one sentence on counting distinct values before and after as proof of a clean. |
| lessons/l-pda-3-3.en/.ar.md | accuracy | medium | The mistake callout said European formatting makes "half the values `NaN`" and revenue "halves". With the course's cleaner, `1.234,50` becomes 1.2345 and `65,00` becomes 6500, silently. | Rewritten with the real failure modes. It now advises checking min/max as well as new NaNs. |
| lessons/l-pda-3-3.en/.ar.md | accuracy | low | "Half its values start with a dollar sign": the real figure is 76 of 168, 45%. | "Nearly half". |
| lessons/l-pda-3-3.en/.ar.md | pedagogy | low | `parse_money` returns nullable `Float64` (the block prints it) without explanation. | Added a sentence linking it to Lesson 3.1's nullable dtypes. |
| exercises/l-pda-3-5.en/.ar.json | accuracy | low | The exercise uses `format="mixed", dayfirst=True` without saying it misreads the five dates exposed in Lesson 3.4. | Explanation now states this caveat and the production fix. |
| exercises/l-pda-4-3.en/.ar.json | accuracy | low | "Missing mostly in the first half of the year": all four misses are in Q1/Q2. | "All four misses came in the first half". |
| lessons/l-pda-4-4.en/.ar.md | accuracy | medium | The takeaway said `"M"`/`"Q"` are deprecated, while the course correctly uses `to_period("M")`/`("Q")`, which keep the short names. Learners would be confused. | The takeaway is now scoped to `resample`. The body explains why periods keep `M`/`Q`. |
| lessons/l-pda-4-4.en/.ar.md | accuracy | low | Quiz "why": daily resample has "730 rows" (real: 729). "10 November, two weeks before Black Friday" (it was 18 days before 28 Nov). | 729. "Almost three weeks before Black Friday (28 November)". |
| lessons/l-pda-4-5.en/.ar.md | accuracy | low | "Several quartile edges are the same value": only the two lowest (both 1) coincide. | Now says exactly that. |
| lessons/l-pda-5-1.en/.ar.md, exercises/l-pda-5-1.en/.ar.json | accuracy | medium | Said channel medians (132/147/153) are "closer together than the means suggest". The means run 214–236, so they are not. The real lesson is that mean and median rank the channels differently. | Rewritten in both lesson and exercise. |
| lessons/l-pda-5-1.en/.ar.md, exercises/l-pda-5-1.* | consistency | low | The fence was quoted as 656.63 in prose but prints 656.62. A quiz "why" said replacing outliers with the median would "erase a quarter of revenue", but they would still contribute the median. | All now 656.62. "Erase most of that quarter of revenue". |
| lessons/l-pda-5-2.en/.ar.md | pedagogy | low | Non-run snippets used `sales`, `ax`, `churn`, `sessions` without saying where they come from. | Added a one-line comment to each partial snippet (identical code in EN and AR). |
| exercises/l-pda-5-2.en/.ar.json | accuracy | low | The cut-axis option didn't say that three 2024 quarters (all below 40,000) would vanish. | Added. |
| lessons/l-pda-5-3.en/.ar.md | accuracy | medium | The claim "the jump rests mostly on returning customers" was supported only by their share of Q4's level. | Added the verified decomposition of the change: returning customers account for two thirds of the 66,302-dollar rise over Q3. |
| exercises/l-pda-5-3.en/.ar.json | accuracy | low | "Q4 is *normally* 73% above Q3", from one year of history. | "Q4 was already about 73% above Q3 the year before". |
| assessments.en/.ar.yaml | accuracy | low | s-pda-1 Q4: the "why" for try/except said it "hides every row with a quantity". s-pda-4 Q5: the `pivot` "why" missed that `columns` is required in pandas 2. | Every row is skipped and the total stays 0. `pivot` needs `columns` and never aggregates. |
| lessons/l-pda-1-3.ar.md | arabic | medium | "أو ثمانية وأربعون منتجًا" is wrong case and spells out the number. "يبدو غريبًا ليوم واحد" is a literal "for a day". "فأنت كنت تريد قاموسًا" is awkward. | "48 منتجًا"، "غريبًا في البداية"، "فما تحتاجه في الحقيقة هو قاموس". |
| lessons/l-pda-5-3.ar.md | arabic | medium | "تضاعف نحو ثلاث مرات" can read as "doubled three times" (8x). "نما 2.7 ضعف" is clumsy. | "نما إلى نحو ثلاثة أضعاف حجمه"، "بلغ حجمه 2.7 ضعف ما كان عليه قبل سنة". |
| lessons/l-pda-2-1.ar.md | arabic | low | "رقصة القائمتين" (literal "dance"). "طرفة" (a joke) for "curiosity". | "كل ذلك العناء مع القائمتين"، "تفصيل جانبي". |
| lessons/l-pda-2-2.ar.md | arabic | low | "لدى 1,678 طلبًا لا يوجد كود كوبون" is ungrammatical. | "1,678 طلبًا بلا كود كوبون". |
| lessons/l-pda-2-3.ar.md | arabic | low | "صف وصف لا" is colloquial. | "كل صف ثانٍ". |
| lessons/l-pda-2-4.ar.md, exercises/l-pda-2-4.ar.json | arabic | low | Agreement errors: "124 طلبًا استخدمت"، "44 طلبًا… استخدمت". | "استُخدم فيها". |
| lessons/l-pda-2-5.ar.md | arabic | low | "الخصومات 5% و10% تنتهي `small`". | "تنتهي في الفئة `small`". |
| lessons/l-pda-3-1.ar.md, exercises/l-pda-3-1.ar.json | arabic | low | "ليس له إجابة بصدق". The diagram box "احذفها" pointed at the value, not the row. "سلسلة Series" is redundant. | "لا إجابة صادقة عنه"، "احذف الصف (مؤقتًا)"، "كائن Series". |
| lessons/l-pda-3-2.ar.md, exercises/l-pda-3-2.ar.json | arabic | low | "لكم دولة تبيع" (missing preposition), "يلدغك" (literal "bites"), "غير المحذوفة المسافات", "تنهار" (collapse). | "إلى كم دولة"، "يوقعك… في المشكلات"، "التي لم تُحذف مسافاتها"، "تتقلّص". |
| lessons/l-pda-3-3.ar.md, exercises/l-pda-3-3.ar.json | arabic | low | "بسرور" (happily), "كحرف حرفي", "فتصبح `N/A` شاردة `NaN`" (garbled). | "دون أي اعتراض"، "كحرف عادي"، "فتصبح قيمة شاردة مثل `N/A` قيمةَ `NaN`". |
| lessons/l-pda-3-5.ar.md | arabic | low | "تعيد محاولة رفع فشل"، "منسوخة ملصوقة"، "أين يجب أن تعيش الدالة". | "رفع ملف بعد فشله"، "نُسخت ولُصقت"، "أين تضع الدالة". |
| lessons/l-pda-4-2, 4-4, 5-4 .ar.md | arabic | low | Literal "lives in" (يعيش/يعيشان/تعيش) in four places. Also "هذا النوفمبر"، "notebook-ان"، "يدعو الأخطاء". | "موجود في"، "تبقى"، "نوفمبر هذا العام"، "اثنان من الـ notebooks"، "يفتح الباب للأخطاء". |
| lessons/l-pda-4-5.ar.md, 1-5.ar.md, 5-1.ar.md | arabic | low | "أنفق الوسيط" (the median spent). "ما الذي حدث خطأً" in an SVG label. "سلالًا". | "بلغ الوسيط"، "ما الخطأ"، "سلات شراء". |
| lessons/l-pda-3-1.ar.md, exercises/l-pda-3-1.ar.json | consistency | low | merge was called "الربط" here, but "الدمج (merge)" in the glossary and Lesson 4.2 ("نوع الربط" is reserved for join type). | Now "الدمج (merge)". |
| all .ar files | arabic | medium | 50 RLM marks fixed nothing. Some sat after inline code, which the app already isolates (`code { unicode-bidi: isolate }`). Others were at the start of paragraphs or headings, before Arabic words, or between Arabic text and a number. Five LRMs in SVG `<title>`s did nothing. Five places put two numbers side by side and relied on an RLM. "لدى Cartwheel 2,066" in 1-1 lacked the RLM that 1-5 has. | Removed the 50 RLMs and 5 LRMs. Reworded the five adjacent-number spots ("ما مجموعه 642 طلبًا", "بنسبة 72.7%"…). Added the missing RLM in 1-1. Kept the RLMs that separate a plain Latin word from a following number (Cartwheel 3,991/228/2,066, `t 60`, `(median) (50%)`, `−8.0% (1.981…)`). Kept every LRM before `+`/`−`/`-` signs and leading `.loc`/`.iloc`/`.str`/`.plot`. No marks remain inside words or code. |

## Couldn't fix or verify

- The matplotlib snippets in Lesson 5.2 are not run blocks, and the local venv has no matplotlib, so I didn't execute them. They rely on `ax.yaxis.set_major_formatter("${x:,.0f}")` (string formatter, matplotlib 3.3+) and `ax.bar_label(..., fmt="${:,.0f}")` (format-string `fmt`, matplotlib 3.7+). Both are correct for Pyodide 0.29's matplotlib, going by the matplotlib docs.
- Two `further` links in Lesson 5.2 go to matplotlib.org. That domain isn't on the content guide's §3 allow-list, but the validator accepts it. They are the official docs, so I left them.
- One exercise solution (4-4) triggers a NumPy-internal `DeprecationWarning` ("generic" timedelta unit) on local NumPy. It comes from library code, so Python hides it by default, and the Pyodide checker reported no problems.

**Final status:** `node scripts/content/validate.mjs python-data-analysis`: 0 errors, 0 warnings. `node scripts/content/check-exercises.mjs python-data-analysis`: 22 runnable exercises, 0 problems. EN and AR code blocks are identical in all 24 lessons.
