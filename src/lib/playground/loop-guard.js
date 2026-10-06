// Loop protection for learner code. The sandboxed iframe runs on the app's
// thread in most browsers, so `while (true) {}` would freeze the whole tab.
// Every `for`/`while`/`do…while` condition gets a call to the harness's
// `__eduflowLoop()`, which throws once the current task has looped for too
// long. Uses Sucrase's tokenizer, so strings, regexes, templates and
// comments can't fool it; code that doesn't parse is returned unchanged
// (running it reports the syntax error anyway).
//
// Sucrase's parser is passed in: the browser bundles its ES build
// (playground/sucrase.js), Node's exercise checker requires its CommonJS one.

export const LOOP_GUARD = '__eduflowLoop';

/** @param sucrase { parse, TokenType } from Sucrase's parser */
export function guardLoopsWith({ parse, TokenType: tt }, code) {
  if (!/\b(for|while)\b/.test(code)) return code;
  const OPEN = new Set([tt.parenL, tt.braceL, tt.bracketL, tt.dollarBraceL]);
  const CLOSE = new Set([tt.parenR, tt.braceR, tt.bracketR]);
  let tokens;
  try {
    ({ tokens } = parse(code, false, false, false));
  } catch {
    return code;
  }
  const edits = [];
  const call = `${LOOP_GUARD}()`;
  for (let i = 0; i < tokens.length; i++) {
    const type = tokens[i].type;
    if (type !== tt._for && type !== tt._while) continue;
    let j = i + 1;
    if (type === tt._for && tokens[j]?.type === tt._await) j++;
    if (tokens[j]?.type !== tt.parenL) continue;
    let depth = 0;
    let close = -1;
    const semis = [];
    for (let k = j; k < tokens.length; k++) {
      const ty = tokens[k].type;
      if (OPEN.has(ty)) depth++;
      else if (CLOSE.has(ty) && --depth === 0) {
        close = k;
        break;
      } else if (ty === tt.semi && depth === 1) semis.push(k);
    }
    if (close < 0) continue;
    if (type === tt._while) {
      edits.push([tokens[j].end, `${call}&&(`], [tokens[close].start, ')']);
    } else if (semis.length === 2) {
      const [a, b] = semis;
      if (b === a + 1) edits.push([tokens[a].end, call]);
      else edits.push([tokens[a].end, `${call}&&(`], [tokens[b].start, ')']);
    }
    // for…in / for…of walk a finite collection: left alone.
  }
  edits.sort((x, y) => y[0] - x[0]);
  let out = code;
  for (const [at, text] of edits) out = out.slice(0, at) + text + out.slice(at);
  return out;
}
