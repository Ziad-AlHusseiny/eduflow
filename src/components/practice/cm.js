// CodeMirror 6, loaded only when an exercise editor scrolls into view.
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { sql, SQLite } from '@codemirror/lang-sql';
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers, placeholder } from '@codemirror/view';
import { tags } from '@lezer/highlight';

const LANGS = {
  js: () => javascript(),
  jsx: () => javascript({ jsx: true }),
  ts: () => javascript({ typescript: true }),
  html: () => html(),
  css: () => css(),
  sql: () => sql({ dialect: SQLite, upperCaseKeywords: true }),
  python: () => python(),
};

// Colors from the app's tokens, so light and dark themes both work.
const highlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.operatorKeyword, tags.modifier], color: 'var(--cm-keyword)' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--cm-string)' },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: 'var(--cm-number)' },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: 'var(--cm-comment)', fontStyle: 'italic' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: 'var(--cm-function)' },
  { tag: [tags.typeName, tags.className, tags.tagName], color: 'var(--cm-type)' },
  { tag: [tags.propertyName, tags.attributeName], color: 'var(--cm-property)' },
  { tag: [tags.definition(tags.variableName)], color: 'var(--cm-def)' },
]);

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--color-code-bg)', color: 'var(--color-ink)', fontSize: '14px', height: '100%' },
  '.cm-content': { fontFamily: 'var(--font-mono)', caretColor: 'var(--color-primary)', padding: '10px 0' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6', overflow: 'auto' },
  '.cm-gutters': { backgroundColor: 'var(--color-code-bg)', color: 'var(--color-ink-faint)', border: 'none', borderInlineEnd: '1px solid var(--color-border)' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in oklab, var(--color-primary-soft) 45%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--color-ink)' },
  '&.cm-focused': { outline: '2px solid var(--color-primary)', outlineOffset: '-2px' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'color-mix(in oklab, var(--color-primary) 30%, transparent) !important' },
  '.cm-cursor': { borderLeftColor: 'var(--color-primary)' },
  '.cm-tooltip': { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-ink)' },
});

/** Mounts an editor in `parent`; returns { view, setValue, destroy }. */
export function createEditor(parent, { doc, language, onChange, onRun, readOnly = false, label, hint }) {
  const extensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    history(),
    drawSelection(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion({ activateOnTyping: false }),
    highlightActiveLine(),
    syntaxHighlighting(highlight),
    theme,
    keymap.of([{ key: 'Mod-Enter', run: () => (onRun?.(), true) }, ...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap, indentWithTab]),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({ 'aria-label': label, 'aria-describedby': hint ?? '', dir: 'ltr', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' }),
    EditorState.readOnly.of(readOnly),
    EditorView.editable.of(!readOnly),
    EditorView.updateListener.of((u) => u.docChanged && onChange?.(u.state.doc.toString())),
  ];
  if (LANGS[language]) extensions.push(LANGS[language]());
  if (!readOnly) extensions.push(placeholder(''));
  const view = new EditorView({ state: EditorState.create({ doc, extensions }), parent });
  return {
    view,
    setValue: (text) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } }),
    destroy: () => view.destroy(),
  };
}
