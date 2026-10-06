// README screenshots, step 2 of 3: frames the raw captures (browser windows
// and phones on a soft brand background) and exports them at 2x as JPEG
// into docs/screenshots/.
//
//   node scripts/readme-shots/frame.mjs [name …]

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const TMP = resolve('.cache/shots');
const RAW = `${pathToFileURL(TMP).href}/raw/`;
const OUT = 'docs/screenshots/';
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);

const FONT = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@500;600&display=swap" rel="stylesheet">`;
const CSS = `
*{box-sizing:border-box;margin:0}
body{background:transparent;font-family:Inter,system-ui,sans-serif}
.stage{position:relative;overflow:hidden;padding:56px 64px}
.light{background:
  radial-gradient(60% 70% at 0% 0%, #ddd6fe 0%, transparent 60%),
  radial-gradient(50% 60% at 100% 100%, #fbcfe8 0%, transparent 60%),
  radial-gradient(40% 50% at 100% 0%, #c7d2fe 0%, transparent 60%),
  linear-gradient(135deg,#faf7ff,#f3efff)}
.dark{background:
  radial-gradient(60% 70% at 0% 0%, #4c1d95 0%, transparent 62%),
  radial-gradient(50% 60% at 100% 100%, #831843 0%, transparent 62%),
  linear-gradient(135deg,#0d0a18,#160f2b)}
.win{border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 30px 70px -10px rgba(46,16,101,.38),0 8px 20px rgba(46,16,101,.12);border:1px solid rgba(91,33,182,.12)}
.dark .win{background:#1b1530;border-color:rgba(196,181,253,.16);box-shadow:0 30px 80px -10px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04)}
.bar{height:38px;display:flex;align-items:center;gap:8px;padding:0 14px;background:#f6f4fb;border-bottom:1px solid #ebe7f5}
.dark .bar{background:#221b38;border-color:#2e2648}
.dot{width:12px;height:12px;border-radius:50%}
.url{flex:1;display:flex;justify-content:center}
.url span{display:inline-flex;align-items:center;gap:6px;min-width:46%;justify-content:center;height:24px;padding:0 14px;border-radius:7px;background:#fff;color:#5b5675;font-size:12px;font-weight:500;border:1px solid #ebe7f5}
.dark .url span{background:#171129;color:#a8a1c4;border-color:#2e2648}
.win img{display:block;width:100%}
.phone{position:relative;border-radius:46px;padding:11px;background:#141019;box-shadow:0 30px 60px -12px rgba(46,16,101,.45),0 0 0 2px #2b2533 inset}
.phone .screen{border-radius:36px;overflow:hidden;background:#fff}
.phone img{display:block;width:100%}
.status{height:38px;display:flex;align-items:center;justify-content:space-between;padding:4px 26px 0 30px;color:#1b1830;font:600 13px Inter,sans-serif}
.status svg{display:block}
.phone::after{content:"";position:absolute;top:20px;left:50%;transform:translateX(-50%);width:25%;height:24px;border-radius:20px;background:#141019}
.tag{position:absolute;display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;background:#fff;color:#2e1065;font:600 15px Inter,sans-serif;box-shadow:0 12px 30px -6px rgba(46,16,101,.3);border:1px solid #ede9fe}
.tag b{font-family:Sora,sans-serif;color:#7c3aed}
`;
const lock = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
const win = (img, url, style = '') => `<div class="win" style="${style}"><div class="bar"><i class="dot" style="background:#ff5f57"></i><i class="dot" style="background:#febc2e"></i><i class="dot" style="background:#28c840"></i><div class="url"><span>${lock}eduflow-lf-2.vercel.app${url}</span></div><i style="width:52px"></i></div><img src="${RAW}${img}.png"></div>`;
const icons = `<span style="display:flex;gap:5px;align-items:center"><svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="4.3" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="8.6" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="12.9" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg><svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.2c2.1 0 4 .8 5.4 2.1l1.1-1.1A9.1 9.1 0 0 0 7.5.6 9.1 9.1 0 0 0 1 3.2l1.1 1.1A7.6 7.6 0 0 1 7.5 2.2Zm0 3.2c1.2 0 2.3.5 3.1 1.2l1.1-1.1a6 6 0 0 0-8.4 0l1.1 1.1c.8-.7 1.9-1.2 3.1-1.2Zm0 3.2c-.5 0-.9.2-1.2.5L7.5 10.3l1.2-1.2c-.3-.3-.7-.5-1.2-.5Z" fill="currentColor"/></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><rect x="22.6" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".45"/></svg></span>`;
const phone = (img, style = '') => `<div class="phone" style="${style}"><div class="screen"><div class="status"><span>9:41</span>${icons}</div><img src="${RAW}${img}.png"></div></div>`;

const single = (img, url, { theme = 'light', width = 1000 } = {}) => ({ width: width + 128, html: `<div class="stage ${theme}" id="stage">${win(img, url)}</div>` });

const outputs = {
  hero: {
    width: 1400,
    html: `<div class="stage light" id="stage" style="height:820px;padding:0">
      ${win('home', '/', 'position:absolute;left:64px;top:60px;width:1000px')}
      ${phone('phone-lesson', 'position:absolute;left:1010px;top:130px;width:300px;transform:rotate(3deg)')}
      <div class="tag" style="left:40px;top:690px">📚 <b>16</b> courses · <b>303</b> lessons</div>
      <div class="tag" style="left:330px;top:742px">🧪 Code, SQL &amp; Python run in your browser</div>
      <div class="tag" style="left:860px;top:722px">🌙 Dark · العربية · Offline</div>
    </div>`,
  },
  themes: {
    width: 1400,
    html: `<div class="stage light" id="stage" style="height:800px;padding:0;background:linear-gradient(115deg,#f3efff 0 50%,#120d22 50% 100%)">
      ${win('lesson', '/lesson/react-fundamentals/l-rf-3-1', 'position:absolute;left:48px;top:70px;width:760px;transform:rotate(-2deg)')}
      <div class="dark" style="position:absolute;inset:0;background:none;pointer-events:none">${win('dark-lesson', '/lesson/javascript-fundamentals/l-js-3-1', 'position:absolute;left:600px;top:250px;width:760px;transform:rotate(2deg)')}</div>
    </div>`,
  },
  bilingual: {
    width: 1400,
    html: `<div class="stage light" id="stage" style="height:820px;padding:0">
      ${win('home', '/', 'position:absolute;left:56px;top:56px;width:800px')}
      ${win('arabic-home', '/ar', 'position:absolute;left:540px;top:250px;width:800px')}
    </div>`,
  },
  phones: {
    width: 1600,
    html: `<div class="stage light" id="stage" style="display:flex;gap:34px;justify-content:center;align-items:flex-start;padding:64px 56px 72px">
      ${phone('phone-home', 'width:264px;margin-top:40px')}
      ${phone('phone-lesson', 'width:264px')}
      ${phone('phone-learning', 'width:264px;margin-top:40px')}
      ${phone('phone-flashcards', 'width:264px')}
      ${phone('phone-arabic', 'width:264px;margin-top:40px')}
    </div>`,
  },
  catalog: single('catalog', '/courses?category=web-development&sort=rating'),
  course: single('course', '/courses/css-mastery'),
  lesson: single('lesson', '/lesson/react-fundamentals/l-rf-3-1'),
  playground: single('playground', '/lesson/react-fundamentals/l-rf-3-1', { width: 820 }),
  sql: single('sql', '/lesson/sql-for-analysts/l-sql-2-2'),
  python: single('python', '/lesson/python-data-analysis/l-pda-3-1', { width: 880 }),
  quiz: single('quiz', '/lesson/css-mastery/l-css-2-2'),
  learning: single('learning', '/learning'),
  achievements: single('achievements', '/learning#achievements'),
  'badge-pop': single('badge-pop', '/lesson/sql-for-analysts/l-sql-4-4'),
  flashcards: single('flashcards', '/review'),
  certificate: single('certificate', '/courses/react-fundamentals/certificate'),
  stats: single('stats', '/stats'),
  palette: single('palette', '/courses'),
  path: single('path', '/paths/front-end-developer'),
  'arabic-lesson': single('arabic-lesson', '/ar/lesson/react-fundamentals/l-rf-2-2'),
  'dark-learning': single('dark-learning', '/learning', { theme: 'dark' }),
};

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1600, height: 900 } });
for (const [name, o] of Object.entries(outputs)) {
  if (only.length && !only.includes(name)) continue;
  const file = `${TMP}/frame-${name}.html`;
  writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>${CSS}</style></head><body style="width:${o.width}px">${o.html}</body></html>`);
  await page.setViewportSize({ width: o.width, height: 900 });
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())]));
  const png = await page.locator('#stage').screenshot({ type: 'png' });
  const out = `${OUT}${name}.jpg`;
  const info = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(out);
  console.log(`${name}.jpg ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}
await browser.close();
