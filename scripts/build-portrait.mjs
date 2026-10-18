// Turns assets/portrait-128.png into public/field/portrait.bin: the pixel
// portrait the About page's light field draws. The grey studio background is
// flood-filled away from the borders; every remaining pixel becomes one light.
//
// Format: u8 width, u8 height, then per pixel u8 x, u8 y, u8 r, u8 g, u8 b.
// Run: node scripts/build-portrait.mjs
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SRC = new URL("../assets/portrait-128.png", import.meta.url);
const OUT = new URL("../public/field/portrait.bin", import.meta.url);
const TOL = 26; // colour distance that still counts as background

const { data, info } = await sharp(SRC.pathname).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const at = (x, y) => (y * w + x) * 3;
const dist = (i, j) => Math.hypot(data[i] - data[j], data[i + 1] - data[j + 1], data[i + 2] - data[j + 2]);
// The backdrop is a light, unsaturated grey; the jacket is dark navy and
// touches the bottom edge, so "grey" alone would eat it.
const backdrop = (i) =>
  Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) < 22 &&
  (data[i] + data[i + 1] + data[i + 2]) / 3 > 120;

const bg = new Uint8Array(w * h);
const stack = [];
for (let x = 0; x < w; x++) stack.push([x, 0], [x, h - 1]);
for (let y = 0; y < h; y++) stack.push([0, y], [w - 1, y]);
for (let k = stack.length - 1; k >= 0; k--) {
  const [x, y] = stack[k];
  if (backdrop(at(x, y))) bg[y * w + x] = 1;
  else stack.splice(k, 1);
}
while (stack.length) {
  const [x, y] = stack.pop();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= w || ny >= h || bg[ny * w + nx]) continue;
    const i = at(nx, ny);
    if (backdrop(i) && dist(i, at(x, y)) < TOL) {
      bg[ny * w + nx] = 1;
      stack.push([nx, ny]);
    }
  }
}

// Drop speckles: a light needs at least three lit neighbours.
const lit = (x, y) => x >= 0 && y >= 0 && x < w && y < h && !bg[y * w + x];
const keep = (x, y) =>
  lit(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].filter(([dx, dy]) => lit(x + dx, y + dy)).length >= 3;

const out = [w, h];
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    if (!keep(x, y)) continue;
    const i = at(x, y);
    out.push(x, y, data[i], data[i + 1], data[i + 2]);
  }
await mkdir(new URL("../public/field/", import.meta.url), { recursive: true });
await writeFile(OUT, Uint8Array.from(out));
console.log(`portrait: ${(out.length - 2) / 5} pixels of ${w * h}`);
