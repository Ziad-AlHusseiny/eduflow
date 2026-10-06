---
summary: اختر الأعمدة بالأقواس المربعة، ثم اختر صفوفًا وأعمدة محدّدة بـ ‎.loc (بالتسمية) و ‎.iloc (بالموقع)، واعرف أيّهما تستخدم بعد الترتيب أو التصفية.
takeaways:
  - "`df[\"col\"]` تعيد عمودًا واحدًا على هيئة Series؛ و`df[[\"a\", \"b\"]]` (قائمة داخل الأقواس) تعيد DataFrame."
  - "`.loc[rows, columns]` تختار بالتسمية، والشرائح فيها تشمل التسمية الأخيرة."
  - "`.iloc[rows, columns]` تختار بالموقع، والشرائح فيها تستبعد النهاية، تمامًا مثل قوائم Python."
  - بعد الترتيب تبقى التسميات ملتصقة بصفوفها، فتجد `.loc` المنتج نفسه، بينما تجد `.iloc[0]` أيًّا كان الصف الذي صار أولًا.
  - اجعل الفهرس شيئًا له معنى مثل `product_id` باستخدام `index_col=` أو `set_index()`، كي تُقرأ `.loc` كعملية بحث.
further:
  - title: Indexing and selecting data
    url: https://pandas.pydata.org/docs/user_guide/indexing.html
  - title: pandas.DataFrame.loc
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.loc.html
  - title: pandas.DataFrame.iloc
    url: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.iloc.html
quiz:
  - q: "فهرس `products` هو `product_id` (من 1 إلى 48). كم صفًا تعيد `products.loc[1:5]`؟"
    options:
      - text: "4"
        why: هذا ما تعطيه شريحة بالموقع تستبعد النهاية. أما `.loc` فتقطّع بالتسمية وتشمل النهاية.
      - text: "6"
        why: التسميات 1 و2 و3 و4 و5 خمسة صفوف؛ لا شيء في هذه الشريحة يصل إلى صف سادس.
      - text: خطأ، لأن 1:5 مواقع
        why: مع فهرس من أعداد صحيحة، تعامل `.loc` الأرقام على أنها تسميات، وهذه التسميات موجودة.
      - text: "5"
        why: صحيح. شرائح `.loc` تشمل الطرفين، فتعود التسميات من 1 إلى 5.
    answer: 3
  - q: رتّبت `products` بحسب السعر، الأعلى أولًا. أيّ تعبير يعيد صف المنتج الأغلى؟
    options:
      - text: "`by_price.loc[1]`"
        why: "`.loc[1]` هو الصف المسمّى 1، أي Cast Iron Skillet، أينما أصبح موقعه."
      - text: "`by_price[0]`"
        why: الأقواس المربعة مع قيمة واحدة تبحث عن عمود اسمه 0، وهذا يسبّب `KeyError`.
      - text: "`by_price.iloc[1]`"
        why: المواقع تبدأ من 0، فهذا هو ثاني أغلى منتج.
      - text: "`by_price.iloc[0]`"
        why: صحيح. بعد الترتيب يحمل الموقع 0 المنتج الأغلى، أيًّا كانت تسميته.
    answer: 3
  - q: ماذا تعيد `products[["name"]]` مقارنةً بـ `products["name"]`؟
    options:
      - text: الـ Series نفسها تمامًا.
        why: الأقواس المزدوجة تمرّر قائمة أعمدة، وهذا يعيد دائمًا DataFrame، حتى لعمود واحد.
      - text: DataFrame من عمود واحد بدلًا من Series.
        why: صحيح. القائمة داخل الأقواس تعني "هذه الأعمدة، على هيئة جدول". بعض الدوال تحتاج DataFrame وبعضها Series، لذا الفرق مهم.
      - text: اسم العمود كنص.
        why: الشكلان يعيدان بيانات لا التسمية. أما `products.columns` فتسرد الأسماء.
    answer: 1
  - q: "أيّ سطر يعطيك سعر الوحدة للمنتج 7 في خطوة واحدة واضحة؟"
    options:
      - text: "`products.loc[7, \"unit_price\"]`"
        why: صحيح. استدعاء واحد لـ `.loc` بتسمية صف وتسمية عمود يختار قيمة واحدة بالضبط.
      - text: "`products.iloc[7, \"unit_price\"]`"
        why: لا تقبل `.iloc` إلا المواقع؛ اسم العمود يسبّب خطأ، والموقع 7 هو المنتج 8 على أي حال.
      - text: "`products[\"unit_price\"][7]`"
        why: يعمل بالمصادفة للقراءة، لكنه خطوتا اختيار؛ والنمط نفسه حين يُستخدم للإسناد هو الإسناد المتسلسل (chained assignment) الذي يتعطّل مع Copy-on-Write.
    answer: 0
---

يسأل مدير المنتجات في Cartwheel: "بكم نبيع مطحنة القهوة، المنتج 7؟" و"أرني أغلى خمسة منتجات مع تكاليفها". كلاهما مسألة اختيار: من جدول، استخرج هذه الصفوف وهذه الأعمدة بالضبط. تعطيك pandas أداتين دقيقتين لذلك، `.loc` و`.iloc`، ومعظم ارتباك المبتدئين يأتي من الخلط بينهما. القاعدة قصيرة: `.loc` تستخدم **التسميات**، و`.iloc` تستخدم **المواقع**.

## الأعمدة أولًا

الأقواس المربعة على DataFrame تختار الأعمدة:

```python run
import pandas as pd

products = pd.read_csv("products.csv", index_col="product_id")
print(products["name"].head(3))                    # one column: a Series
print(products[["name", "unit_price"]].head(3))    # a list of columns: a DataFrame
```

جعل `index_col="product_id"` معرّف المنتج فهرسًا للصفوف بدلًا من 0 و1 و2 الافتراضية. هذا الاختيار وحده يجعل كل ما يلي يُقرأ بطبيعية: المنتج 7 هو الصف المسمّى 7. ومع DataFrame محمّل مسبقًا، تقوم `products.set_index("product_id")` بالشيء نفسه وتعيد DataFrame جديدًا.

سترى أيضًا `products.unit_price` في الدروس التعليمية. الوصول بالنقطة يعمل مع الأسماء البسيطة، لكنه يفشل مع الأسماء التي فيها مسافات، ويعيد بصمت شيئًا خاطئًا حين يتشارك عمود اسمه مع method في الـ DataFrame: عمود اسمه `count` أو `size` تحجبه الـ method التي تحمل الاسم نفسه. الأقواس المربعة تعمل دائمًا، فاجعلها خيارك الافتراضي.

الأقواس المزدوجة ليست خطأً كتابيًا. الزوج الخارجي هو الاختيار، والزوج الداخلي قائمة Python بأسماء الأعمدة. عمود واحد داخل قائمة يعطيك DataFrame مع ذلك.

## ‎.loc: الاختيار بالتسمية

تأخذ `.loc[rows, columns]` تسميات الصفوف أولًا، ثم تسميات الأعمدة:

```python run
import pandas as pd

products = pd.read_csv("products.csv", index_col="product_id")
print(products.loc[7, "unit_price"])                       # one value
print(products.loc[7])                                     # one row, as a Series
print(products.loc[[11, 21, 37], ["name", "unit_price"]])  # chosen rows and columns
print(products.loc[1:3, "name":"unit_price"])              # label slices
```

القوائم تختار التسميات التي تذكرها بالضبط، وبالترتيب نفسه. والشرائح تأخذ نطاقًا من التسميات، وهذا هو الجزء الذي يجب أن تتذكّره: **شرائح `.loc` تشمل التسمية الأخيرة**. تعيد `products.loc[1:3]` المنتجات 1 و2 و3. وشريحة الأعمدة `"name":"unit_price"` تشمل `unit_price` بالمثل. يصبح هذا منطقيًا حين تفكّر بالتسميات: "من المنتج 1 إلى المنتج 3" تشمل المنتج 3.

اطلب تسمية غير موجودة، مثل `products.loc[99]`، فتحصل على `KeyError: 99`. هذه ميزة: المعرّف الخاطئ يجب أن يفشل بصوت عالٍ، لا أن يعيد نتيجة فارغة قد تلصقها في تقرير. وحين يكون غياب التسمية احتمالًا طبيعيًا، افحص أولًا بـ `99 in products.index`، التي تعيد `True` أو `False`.

و`.loc` أيضًا هي الأداة الوحيدة التي تستخدمها **لإسناد** القيم، كما سترى في الدرس 2.5: `products.loc[7, "unit_price"] = 135.45` تغيّر خلية واحدة بالضبط.

## ‎.iloc: الاختيار بالموقع

تتجاهل `.iloc` التسميات وتعدّ المواقع من 0، وشرائحها تستبعد النهاية، تمامًا مثل قوائم Python:

```python run
import pandas as pd

products = pd.read_csv("products.csv", index_col="product_id")
print(products.iloc[0])            # first row, whatever its label
print(products.iloc[:3, :2])       # first three rows, first two columns
print(products.iloc[-1]["name"])   # last row's name
```

استخدم `.iloc` حين يكون الموقع هو ما تقصده: "الخمسة الأولى"، "الصف الأخير"، "كل صف ثانٍ". واستخدم `.loc` حين تكون الهوية هي ما تقصده: "المنتج 7"، "العمود `unit_price`".

:::figure ‎.loc تجد الصفوف بالتسمية، و ‎.iloc بالموقع
<svg viewBox="0 0 700 250" role="img" aria-labelledby="t1">
  <title id="t1">جدول مرتّب بحسب السعر، تسميات فهرسه 21 و 22 و 41 و 1 بهذا الترتيب، ومواقعه من 0 إلى 3. loc[1] تشير إلى الصف المسمّى 1، الواقع في الموقع 3. و iloc[0] تشير إلى الصف في الموقع 0، وتسميته 21.</title>
  <text class="d-label-muted" x="40" y="30" text-anchor="middle">الموقع</text>
  <text class="d-label-muted" x="120" y="30" text-anchor="middle">التسمية</text>
  <text class="d-label-strong" x="300" y="30" text-anchor="middle">الاسم (مرتّب بالسعر)</text>
  <rect class="d-box-accent" x="80" y="44" width="400" height="40" rx="6"/>
  <text class="d-label" x="40" y="69" text-anchor="middle">0</text>
  <text class="d-label-strong" x="120" y="69" text-anchor="middle">21</text>
  <text class="d-label" x="300" y="69" text-anchor="middle">Standing Desk 140cm</text>
  <rect class="d-box" x="80" y="92" width="400" height="40" rx="6"/>
  <text class="d-label" x="40" y="117" text-anchor="middle">1</text>
  <text class="d-label-strong" x="120" y="117" text-anchor="middle">22</text>
  <text class="d-label" x="300" y="117" text-anchor="middle">Ergonomic Task Chair</text>
  <rect class="d-box" x="80" y="140" width="400" height="40" rx="6"/>
  <text class="d-label" x="40" y="165" text-anchor="middle">2</text>
  <text class="d-label-strong" x="120" y="165" text-anchor="middle">41</text>
  <text class="d-label" x="300" y="165" text-anchor="middle">Adjustable Dumbbells</text>
  <rect class="d-box-primary" x="80" y="188" width="400" height="40" rx="6"/>
  <text class="d-label" x="40" y="213" text-anchor="middle">...</text>
  <text class="d-label-strong" x="120" y="213" text-anchor="middle">1</text>
  <text class="d-label" x="300" y="213" text-anchor="middle">Cast Iron Skillet 26cm</text>
  <text class="d-code" x="560" y="69">.iloc[0]</text>
  <path class="d-arrow" d="M555 64 L490 64" marker-end="url(#arrow)"/>
  <text class="d-code" x="560" y="213">.loc[1]</text>
  <path class="d-arrow" d="M555 208 L490 208" marker-end="url(#arrow)"/>
</svg>
:::

## لماذا يهم الفرق: الترتيب

رتّب المنتجات بحسب السعر، فتفترق الأداتان:

```python run
import pandas as pd

products = pd.read_csv("products.csv", index_col="product_id")
by_price = products.sort_values("unit_price", ascending=False)
print(by_price.iloc[:3][["name", "unit_price"]])   # the three priciest
print(by_price.loc[1, "name"])                     # still the skillet
```

الترتيب ينقل الصفوف، لكن كل صف يحتفظ بتسميته. أصبحت `by_price.iloc[0]` الآن هي Standing Desk، أغلى منتج بسعر 449 دولارًا؛ بينما `by_price.loc[1]` ما زالت Cast Iron Skillet، أينما انتهى بها المطاف. والتصفية تتصرّف بالطريقة نفسها: بعد أن تحتفظ ببعض الصفوف فقط، تصبح في التسميات فجوات (1، 4، 9...)، بينما يُعاد ترقيم المواقع 0، 1، 2. وإذا أردت تسميات جديدة من 0 إلى n، فإن `reset_index(drop=True)` تعيدها لك.

:::mistake استخدام ‎.loc بالمواقع على فهرس افتراضي
في جدول حُمّل للتو بالفهرس الافتراضي من 0 إلى n، تصادف أن تتساوى التسميات والمواقع، فتعيد `.loc[0]` و`.iloc[0]` الصف نفسه. الكود المكتوب بهذه الطريقة يعمل حتى أول ترتيب أو تصفية، ثم يلتقط بصمت الصف الخطأ. قرّر ما الذي تقصده، وعبّر عنه بالأداة الصحيحة.
:::

:::tip خطوة واحدة لا خطوتان
فضّل `products.loc[7, "unit_price"]` على `products["unit_price"][7]`. القراءة تعمل بالطريقتين، لكن الشكل الثاني عمليتا اختيار منفصلتان. والنمط نفسه ذو الخطوتين حين يُستخدم **لإسناد** قيمة هو الإسناد المتسلسل (chained assignment)، الذي تحذّر منه pandas ويتوقّف عن العمل تمامًا مع Copy-on-Write. اكتساب عادة الخطوة الواحدة الآن يحميك من ذلك في الدرس 2.5.
:::

في التمرين تجيب عن أسئلة مدير المنتجات باستخدام `.loc` و`.iloc`. وفي الدرس التالي تختار الصفوف بحسب شرط بدلًا من التسمية: "كل الطلبات التي تتجاوز 200 دولار"، "كل طلبات الويب في نوفمبر".
