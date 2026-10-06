// README screenshots, step 3 of 3: the animated tour (docs/screenshots/tour.gif),
// built from the raw captures.

import sharp from 'sharp';

const W = 960;
const H = 600;
// [raw capture, top offset in device pixels]
const FRAMES = [
  ['home', 0], ['catalog', 0], ['course', 0], ['lesson', 0],
  ['playground', 760], ['sql', 0], ['quiz', 0], ['badge-pop', 0],
  ['learning', 0], ['flashcards', 0], ['arabic-lesson', 0], ['dark-home', 0],
];

const frames = [];
for (const [name, top] of FRAMES) {
  const file = `.cache/shots/raw/${name}.png`;
  const { height } = await sharp(file).metadata();
  frames.push(await sharp(file).extract({ left: 0, top: Math.min(top, height - 1600), width: 2560, height: 1600 }).resize(W, H).png().toBuffer());
}
const info = await sharp(frames, { join: { animated: true } })
  .gif({ delay: FRAMES.map(() => 1800), loop: 0, effort: 10, colours: 128, dither: 0.6, interFrameMaxError: 6 })
  .toFile('docs/screenshots/tour.gif');
console.log(`tour.gif ${W}x${H}, ${FRAMES.length} frames, ${(info.size / 1024).toFixed(0)} KB`);
