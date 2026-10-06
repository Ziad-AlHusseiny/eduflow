---
kind: intro
summary: Know what JavaScript is, where it runs (the browser and Node.js), how to run your first line of code, and what you will build in this course.
takeaways:
  - JavaScript is a programming language that every web browser can run, and Node.js runs the same language outside the browser.
  - The language itself is small; the host it runs in (browser or Node.js) adds extras such as the page, files or the network.
  - Code runs one statement at a time, top to bottom, unless you tell it to do otherwise.
  - "`console.log()` prints a value so you can see what your program is doing; it is the first debugging tool you reach for."
further:
  - title: What is JavaScript? (MDN)
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript
  - title: Introduction to Node.js
    url: https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
  - title: console.log() (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/console/log_static
quiz:
  - q: You write `console.log(2 + 3)` on line 1 and `console.log("done")` on line 2. What appears in the console, and in what order?
    options:
      - text: '`5` and then `done`, because statements run top to bottom.'
        why: Correct. The first statement is evaluated and printed, then the second one.
      - text: '`done` and then `5`, because text is printed before numbers.'
        why: JavaScript does not group output by type. Statements run in the order they are written.
      - text: '`2 + 3` and then `done`, because `console.log` prints exactly what you typed.'
        why: The expression `2 + 3` is evaluated first, so `console.log` receives the number 5, not the characters you typed.
    answer: 0
  - q: Which of these is something the browser adds, rather than the JavaScript language itself?
    options:
      - text: Numbers and the `+` operator.
        why: Numbers and operators are part of the language, so they work the same in Node.js and in every browser.
      - text: The `if` statement.
        why: Control flow such as `if` is core language syntax and exists in every host.
      - text: The `document` object that lets you change the page.
        why: Correct. `document` is a browser API. Node.js has no page, so there is no `document` there.
    answer: 2
  - q: A friend says "JavaScript is a simpler version of Java." What is the most accurate reply?
    options:
      - text: They are unrelated languages that share part of a name for marketing reasons in 1995.
        why: Correct. JavaScript was named to ride on Java's popularity at the time. The two languages work very differently.
      - text: JavaScript is the browser edition of Java and compiles to the same bytecode.
        why: JavaScript is not compiled to Java bytecode and has its own standard, ECMAScript.
      - text: JavaScript is an older language that Java later replaced on the web.
        why: Java applets disappeared from the web; JavaScript is the language every browser runs today.
    answer: 0
---

Every website you used today ran JavaScript. When a "Like" counter goes up without the page reloading, when a form tells you your password is too short before you press Send, when a map scrolls under your finger, that is JavaScript running inside your browser. It is the only programming language every browser understands, which is why it is the best first language for anyone who wants to build for the web.

You are going to learn it the slow, solid way: by watching what the computer actually does with each line you write.

## One language, two homes

JavaScript is a language: a set of rules for writing instructions. Something has to read those instructions and carry them out. That something is a **JavaScript engine**. Chrome and Edge use one called V8, Firefox uses SpiderMonkey, Safari uses JavaScriptCore. They all follow the same official standard, called ECMAScript, which gets a new edition every year.

An engine never runs alone. It lives inside a **host** that gives your code extra abilities:

- In the **browser**, the host adds the page itself (`document`), clicks and key presses, the network (`fetch`) and a little storage (`localStorage`).
- In **Node.js**, the same V8 engine runs on a computer or server with no page at all. Instead, the host adds files, servers and command-line tools.

:::figure The same language runs in two hosts with different extras
<svg viewBox="0 0 640 250" role="img" aria-labelledby="t1">
  <title id="t1">Your JavaScript code runs on a JavaScript engine. In the browser the engine is surrounded by the page, events, fetch and localStorage; in Node.js it is surrounded by files, servers and the command line.</title>
  <rect class="d-box-primary" x="230" y="14" width="180" height="48" rx="10"/>
  <text class="d-label-strong" x="320" y="44" text-anchor="middle">Your JavaScript</text>
  <path class="d-arrow" d="M285 62 L165 104" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M355 62 L475 104" marker-end="url(#arrow)"/>
  <rect class="d-box" x="30" y="108" width="270" height="128" rx="12"/>
  <text class="d-label-strong" x="165" y="132" text-anchor="middle">Browser</text>
  <rect class="d-box-accent" x="105" y="144" width="120" height="34" rx="8"/>
  <text class="d-label" x="165" y="166" text-anchor="middle">JS engine</text>
  <text class="d-label-muted" x="165" y="204" text-anchor="middle">+ page, events,</text>
  <text class="d-label-muted" x="165" y="224" text-anchor="middle">fetch, localStorage</text>
  <rect class="d-box" x="340" y="108" width="270" height="128" rx="12"/>
  <text class="d-label-strong" x="475" y="132" text-anchor="middle">Node.js</text>
  <rect class="d-box-accent" x="415" y="144" width="120" height="34" rx="8"/>
  <text class="d-label" x="475" y="166" text-anchor="middle">JS engine</text>
  <text class="d-label-muted" x="475" y="204" text-anchor="middle">+ files, servers,</text>
  <text class="d-label-muted" x="475" y="224" text-anchor="middle">command line</text>
</svg>
:::

That split matters from day one. Everything in sections 1 to 3 of this course is the language itself, so it works in both places. Section 4 uses browser extras, so that code only runs on a web page.

## Your first line of code

Here is a complete JavaScript program. Press Run.

```js run
console.log("Pocket is running");
console.log(450 + 1200);
```

Two things happened, in order. First the engine read line 1, saw an instruction to log some text, and printed it. Then it read line 2, worked out `450 + 1200`, and printed the result, `1650`. Each of these lines is a **statement**, one instruction, usually ended with a semicolon. The engine runs statements top to bottom, one at a time, and finishes each before starting the next.

`console.log()` is how you see inside your program. You will use it constantly, and professional developers do too. Anything between the parentheses is worked out first, and the result is printed.

:::tip Three places to run JavaScript
1. The Run buttons and exercises in this course, which work in your browser with nothing to install.
2. Your browser's console: open any page, press Cmd+Option+J on a Mac or Ctrl+Shift+J on Windows in Chrome, type `1 + 1` and press Enter.
3. Node.js on your computer: install the current LTS version from nodejs.org, save code in `hello.js`, and run `node hello.js` in a terminal.
:::

## What you will build: Pocket

Throughout this course you build one program, a little at a time: **Pocket**, an expense tracker. In the next lessons it is a handful of variables printed to the console. By section 3 it holds a list of expenses, totals them by category and sorts them. In section 4 it becomes a web page with a form, a live list and saved data. In section 5 you organise it the way real projects are organised, with modules, classes and proper error handling.

Most lessons end with an exercise. You write code in the editor, press Check, and a set of automatic checks tells you what works and what does not yet. Getting a check wrong is normal and useful: read the message, change one thing, and try again. That loop of write, run, read and fix is what programming feels like every day.

Next you meet the raw material every program works with: values, their types, and the variables that hold them.
