#!/usr/bin/env node
// Turns the photos listed in scripts/image-sources.json (Unsplash and Pexels
// originals, credited in docs/CREDITS.md, cached in .cache/photos/) into
// responsive AVIF + WebP files:
//
//   src/assets/photos/<id>-<width>.avif|webp
//
// hero   → 4:5, 480–1200 px     course → 16:9, 320–1280 px     avatar → 1:1, 96–400 px
// Quality steps down until each file fits its budget (TECHNICAL-PLAN §8:
// thumbnails ≤ 120 KB, hero ≤ 200 KB, avatars ≤ 30 KB).
//
//   npm run images            (all)        node scripts/images.mjs react-fundamentals   (one)

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'assets', 'photos');
const CACHE = join(ROOT, '.cache', 'photos');
const sources = JSON.parse(await readFile(join(ROOT, 'scripts', 'image-sources.json'), 'utf8'));
const only = process.argv.slice(2);

const KINDS = {
  hero: { widths: [480, 720, 960, 1200], ratio: 5 / 4, budget: 200 },
  course: { widths: [320, 480, 800, 1280], ratio: 9 / 16, budget: 120 },
  avatar: { widths: [96, 192, 400], ratio: 1, budget: 30 },
};
const POSITIONS = { center: 'centre', top: 'north', bottom: 'south', left: 'west', right: 'east', attention: sharp.strategy.attention, entropy: sharp.strategy.entropy };

await mkdir(OUT, { recursive: true });
await mkdir(CACHE, { recursive: true });

async function original(entry) {
  const file = join(CACHE, `${entry.id}.jpg`);
  if (existsSync(file)) return file;
  const res = await fetch(entry.source, { headers: { 'User-Agent': 'EduFlow image script (portfolio project)' } });
  if (!res.ok) throw new Error(`${entry.id}: HTTP ${res.status} for ${entry.source}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

let total = 0;
for (const entry of sources) {
  if (only.length && !only.includes(entry.id)) continue;
  const kind = KINDS[entry.kind];
  if (!kind) throw new Error(`${entry.id}: unknown kind ${entry.kind}`);
  const input = await original(entry);
  for (const f of await readdir(OUT)) if (new RegExp(`^${entry.id}-\\d+\\.(avif|webp)$`).test(f)) await rm(join(OUT, f));
  let bytes = 0;
  for (const width of kind.widths) {
    const height = Math.round(width * kind.ratio);
    const pipeline = sharp(input)
      .rotate()
      .resize({ width, height, fit: 'cover', position: POSITIONS[entry.focus ?? 'center'] ?? 'centre' })
      .modulate({ saturation: 1.02 })
      .sharpen({ sigma: width <= 480 ? 0.6 : 0.4 });
    const budget = kind.budget * 1024 * (width / kind.widths.at(-1)) ** 1.2 + 6 * 1024;
    let q = entry.kind === 'avatar' ? 58 : 50;
    let avif = await pipeline.clone().avif({ quality: q, effort: 6 }).toBuffer();
    while (avif.length > budget && q > 28) {
      q -= 4;
      avif = await pipeline.clone().avif({ quality: q, effort: 6 }).toBuffer();
    }
    let wq = 74;
    let webp = await pipeline.clone().webp({ quality: wq, effort: 6 }).toBuffer();
    while (webp.length > budget * 1.6 && wq > 40) {
      wq -= 6;
      webp = await pipeline.clone().webp({ quality: wq, effort: 6 }).toBuffer();
    }
    await writeFile(join(OUT, `${entry.id}-${width}.avif`), avif);
    await writeFile(join(OUT, `${entry.id}-${width}.webp`), webp);
    bytes += avif.length + webp.length;
  }
  total += bytes;
  console.log(`[images] ${entry.id.padEnd(26)} ${entry.kind.padEnd(7)} ${(bytes / 1024).toFixed(0)} KB`);
}
console.log(`[images] done, ${(total / 1024).toFixed(0)} KB`);
