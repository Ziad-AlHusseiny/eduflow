// A named chunk for Sucrase (so the service worker can tell it's a lazy engine),
// with the loop guard that uses its parser.
import { parse } from 'sucrase/dist/esm/parser/index.js';
import { TokenType } from 'sucrase/dist/esm/parser/tokenizer/types.js';
import { guardLoopsWith } from './loop-guard.js';

export * from 'sucrase';
export const guardLoops = (code) => guardLoopsWith({ parse, TokenType }, code);
