---
summary: 'Create and clean up strings, read characters by index, use the everyday string methods, and build readable output such as "Lunch: $12.20" with template literals.'
takeaways:
  - Strings can use single quotes, double quotes or backticks; backticks make template literals, which can insert values with `${}` and span several lines.
  - Strings are immutable, so methods like `trim()` and `toUpperCase()` return a new string and leave the original unchanged.
  - Characters are numbered from 0, `length` counts them, and `slice(start, end)` copies a piece up to, but not including, `end`.
  - Format cents for display with `(cents / 100).toFixed(2)` or `Intl.NumberFormat`, and keep the stored amount as a number.
further:
  - title: Template literals (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
  - title: String (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
  - title: Intl.NumberFormat (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
quiz:
  - q: |
      What does this print?
      ```js
      let label = "  lunch ";
      label.trim();
      console.log(`[${label}]`);
      ```
    options:
      - text: '`[lunch]`'
        why: '`trim()` returns a new, trimmed string, but nothing stores it, so `label` still has its spaces.'
      - text: '`[  lunch ]`'
        why: Correct. Strings are immutable. Write `label = label.trim();` to keep the result.
      - text: '`[${label}]`'
        why: Backticks make a template literal, so `${label}` is replaced by the value of `label`.
    answer: 1
  - q: '`const word = "Pocket";` Which expression gives `"Poc"`?'
    options:
      - text: '`word.slice(1, 3)`'
        why: Indexes start at 0, so this starts at "o" and stops before index 3, giving "oc".
      - text: '`word.slice(0, 2)`'
        why: The end index is excluded, so this gives only "Po".
      - text: '`word[0, 3]`'
        why: Square brackets read a single character. The comma expression evaluates to 3, so this returns "k".
      - text: '`word.slice(0, 3)`'
        why: Correct. It copies indexes 0, 1 and 2 and stops before 3.
    answer: 3
  - q: 'You need to show 1220 cents as `$12.20`. Which is right?'
    options:
      - text: '`"$" + (1220 / 100).toFixed(2)`'
        why: Correct. Dividing gives 12.2, and `toFixed(2)` returns the string "12.20" with exactly two decimals.
      - text: '`"$" + 1220 / 100`'
        why: This prints "$12.2", because numbers drop trailing zeros when they become text.
      - text: '`"$" + 1220.toFixed(2)`'
        why: That formats the cents, not dollars, and the dot right after an integer literal is a syntax error anyway.
    answer: 0
---

Pocket's numbers are exact now, but nobody wants to read `1220`. People want `Lunch: $12.20`. Text in JavaScript is a **string**, and most of what a user ever sees from your program is a string you built.

## Writing strings

You can write a string with single quotes, double quotes or backticks:

```js run
const a = 'Coffee';
const b = "Sam's lunch";
const c = `Bus`;
console.log(a, b, c);
```

Single and double quotes behave the same; pick one style and stick to it (this course uses double quotes). Use the other kind when your text contains a quote, as in `"Sam's lunch"`, or escape it with a backslash: `'Sam\'s lunch'`. `\n` inside a string is a line break.

Backticks are special, and you will use them most. They make **template literals**.

## Template literals: values inside text

Joining strings with `+` gets messy quickly: `"Lunch: $" + dollars + " (" + category + ")"`. It is easy to forget a space or a quote. A template literal lets you write the text once and drop values into it with `${ }`:

```js run
const label = "Lunch";
const cents = 1220;
const category = "food";

const line = `${label}: $${(cents / 100).toFixed(2)} (${category})`;
console.log(line);
```

Anything inside `${ }` is a full JavaScript expression. It is evaluated, turned into a string, and inserted. Here `(cents / 100).toFixed(2)` divides to get `12.2`, and `toFixed(2)` turns that into the string `"12.20"` with exactly two decimals. The first `$` is a plain dollar sign; only `$` followed by `{` starts an insertion.

Template literals can also span lines, which is handy for multi-line messages:

```js run
const report = `Pocket summary
  Spent: $22.00
  Left:  $3.00`;
console.log(report);
```

:::tip A proper currency formatter
`toFixed` is fine for Pocket. For real apps that show many currencies, use the built-in formatter, which knows every currency's symbol and separators:
```js run
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
console.log(usd.format(1220 / 100));
console.log(usd.format(1234567 / 100));
```
:::

## Characters, positions and slices

A string is a sequence of characters, and each one has a position called an **index**, counting from 0. `length` tells you how many characters there are.

:::figure Indexes start at 0, and slice stops before its end index
<svg viewBox="0 0 640 200" role="img" aria-labelledby="t1">
  <title id="t1">The string Coffee has six characters at indexes 0 to 5. slice(0, 3) copies indexes 0, 1 and 2, giving Cof, and stops before index 3.</title>
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
  <text class="d-label-muted" x="60" y="122" text-anchor="middle">index</text>
  <path class="d-line" d="M110 150 L320 150"/>
  <text class="d-code" x="215" y="178" text-anchor="middle">slice(0, 3) → "Cof"</text>
  <path class="d-dashed" d="M320 30 L320 160"/>
  <text class="d-label-muted" x="420" y="178" text-anchor="middle">stops before 3</text>
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

`word.at(-1)` counts from the end, which saves you writing `word[word.length - 1]`.

## Methods that return new strings

Strings come with built-in **methods**, functions you call with a dot. The ones you will use weekly:

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

That last line is the key idea: strings are **immutable**. No method ever changes a string; each one returns a new string. If you want to keep the result, store it.

:::mistake Calling a method and throwing away the result
```js
let label = "  coffee ";
label.trim();          // returns "coffee"... and nobody keeps it
label.toUpperCase();   // same again
console.log(label);    // still "  coffee "
```
Write `label = label.trim();` or, better, store the result under a new `const`: `const cleanLabel = label.trim();`.
:::

Combining methods is common. To capitalise the first letter of a label, take the first character, uppercase it, and add the rest:

```js run
const label = "groceries";
const nice = label[0].toUpperCase() + label.slice(1);
console.log(nice);
```

Two more methods answer "where is it?" rather than "is it there?". `indexOf("Sam")` returns the index where the text first appears, or `-1` when it is not there at all. And `split(" ")` cuts a string into pieces wherever it finds the separator and gives you back a list, `["Coffee", "with", "Sam"]`. Lists are called arrays, and they get a whole lesson in section 3.

## Strings and numbers, back and forth

Pocket constantly crosses the border between text and numbers. Amounts are numbers while you calculate and strings when you display them; typed input is a string until you convert it.

```js run
const cents = 450;
console.log(String(cents), typeof String(cents));  // number to string
console.log(`${cents}`.length);                    // a template literal converts too
console.log(Number("4.50") * 100);                 // string to number
console.log(Number("  12 "));                      // spaces around digits are ignored
console.log(Number(""));                           // careful: an empty string becomes 0
```

The last line is a trap worth remembering. An empty text box converts to `0`, not `NaN`, so "the user typed nothing" looks exactly like "the user typed zero". When you validate forms in section 4, you will check for empty input before converting.

## Comparing strings

`===` compares strings character by character, and it is case-sensitive: `"Food" === "food"` is `false`. Users type categories however they like, so **normalise before you compare**: trim the spaces and pick one case.

```js run
const typed = "  Food ";
console.log(typed === "food");                       // false
console.log(typed.trim().toLowerCase() === "food");  // true
```

You can also use `<` and `>` on strings. They compare character codes one position at a time, which works for simple lowercase words (`"apple" < "banana"` is true) and goes wrong quickly beyond that: `"Zebra" < "apple"` is also true, because every uppercase letter has a smaller code than every lowercase one. Section 3 shows the right way to sort text, with `localeCompare`, which follows the rules of a real language.

Pocket can now hold amounts, calculate with them exactly and print them in a form people can read. What it cannot do yet is react: warn you when you go over budget, or treat food differently from rent. In the next section your program starts making decisions.
