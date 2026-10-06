// Deterministic shuffling for order exercises: the same order on the server
// and the client, never already solved.
/** A deterministic shuffle (the same order on the server and the client). */
export function seededShuffle(items, seed) {
  let h = 0;
  for (const ch of seed) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0;
  const rand = () => {
    h = (h + 0x6d2b79f5) | 0;
    let x = Math.imul(h ^ (h >>> 15), 1 | h);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Never start already solved.
  if (out.every((x, i) => x === items[i]) && out.length > 1) [out[0], out[1]] = [out[1], out[0]];
  return out;
}
