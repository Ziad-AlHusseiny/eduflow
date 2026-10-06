#!/usr/bin/env node
// One-off: draws the PWA icons (public/icons/*.png), the favicon and the
// social cards (public/og.jpg, public/og/<course>.jpg) with Playwright.
//   node scripts/make-icons.mjs

import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public');
// lucide "graduation-cap", white.
const CAP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`;
const BG = 'background: radial-gradient(closest-side, rgba(251,191,36,.45), transparent) 120% -20% / 70% 70% no-repeat, linear-gradient(135deg, #7c3aed 0%, #6d28d9 55%, #3b82f6 140%)';

const icon = (size, radius, glyph) => `<!doctype html><html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px;border-radius:${radius}px;overflow:hidden;${BG};display:grid;place-items:center"><div style="width:${size * glyph}px;height:${size * glyph}px">${CAP}</div></div></body></html>`;
const ICONS = [
  { file: 'icons/icon-192.png', size: 192, radius: 42, glyph: 0.56 },
  { file: 'icons/icon-512.png', size: 512, radius: 112, glyph: 0.56 },
  { file: 'icons/maskable-512.png', size: 512, radius: 0, glyph: 0.44 },
  { file: 'icons/apple-touch-icon.png', size: 180, radius: 0, glyph: 0.52 },
];

await mkdir(join(OUT, 'icons'), { recursive: true });
await mkdir(join(OUT, 'og'), { recursive: true });
await writeFile(join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/><g transform="translate(5 5) scale(0.9166)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></g></svg>\n`);

const browser = await chromium.launch();
for (const i of ICONS) {
  const p = await browser.newPage({ viewport: { width: i.size, height: i.size } });
  await p.setContent(icon(i.size, i.radius, i.glyph));
  await p.screenshot({ path: join(OUT, i.file), omitBackground: true });
  await p.close();
}

// Social cards: 1200×630, the course photo with its title.
const sources = JSON.parse(await readFile(join(ROOT, 'scripts', 'image-sources.json'), 'utf8'));
const text = (await import(join(ROOT, 'src', 'generated', 'text.en.js'))).default;
const SORA = (await readFile(join(ROOT, 'src/assets/fonts/sora-latin-wght-normal.woff2'))).toString('base64');
const card = (img, title, sub) => `<!doctype html><html><head><style>
@font-face{font-family:Sora;src:url(data:font/woff2;base64,${SORA}) format('woff2');font-weight:100 800}
body{margin:0;width:1200px;height:630px;font-family:Sora,sans-serif;color:#fff;position:relative;overflow:hidden}
.img{position:absolute;inset:0;background:url(data:image/jpeg;base64,${img}) center/cover}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(27,24,48,.92) 0%,rgba(27,24,48,.75) 45%,rgba(27,24,48,.15) 100%)}
.c{position:absolute;left:72px;top:72px;right:420px}
.logo{display:flex;align-items:center;gap:14px;font-weight:700;font-size:30px}
.sq{width:52px;height:52px;border-radius:14px;background:#7c3aed;display:grid;place-items:center}
h1{font-size:62px;line-height:1.08;margin:110px 0 18px;font-weight:700;letter-spacing:-.02em}
p{font-size:26px;margin:0;opacity:.9;line-height:1.35}
</style></head><body><div class="img"></div><div class="scrim"></div><div class="c"><div class="logo"><span class="sq"><span style="width:30px;height:30px;display:block">${CAP}</span></span>EduFlow</div><h1>${title}</h1><p>${sub}</p></div></body></html>`;
const sharp = (await import('sharp')).default;
const shot = async (file, html) => {
  const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html);
  const png = await p.screenshot();
  await p.close();
  await sharp(png).jpeg({ quality: 78, mozjpeg: true }).toFile(file);
};
const photo = async (id) => (await sharp(await readFile(join(ROOT, '.cache', 'photos', `${id}.jpg`))).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 70 }).toBuffer()).toString('base64');
await shot(join(OUT, 'og.jpg'), await card(await photo('hero'), 'Learn tech skills, one lesson at a time.', '16 courses · 300+ real lessons · runnable code, quizzes and flashcards · English & Arabic'));
for (const s of sources.filter((x) => x.kind === 'course')) {
  const c = text.courses[s.id];
  if (c) await shot(join(OUT, 'og', `${s.id}.jpg`), await card(await photo(s.id), c.title, c.tagline));
}
await browser.close();
console.log('[icons] icons, favicon, og cards done');
