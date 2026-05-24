// scripts/strip-mascot-bg.mjs
// Flood-fills from all 4 corners to remove white/near-white backgrounds
// from mascot PNGs, replacing them with true alpha transparency.
import { Jimp } from 'jimp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dir, '..', 'assets', 'reference');

const THRESHOLD = 210; // 0-255: pixels >= this in all channels are "background"

async function stripBg(filename) {
  const filePath = join(ASSETS, filename);
  console.log(`Processing ${filename}...`);

  const img = await Jimp.read(filePath);
  const { width, height, data } = img.bitmap;

  const visited = new Uint8Array(width * height);

  // Seed from ALL edge pixels (not just 4 corners) so nothing gets missed
  const queue = [];
  for (let x = 0; x < width; x++) {
    queue.push(x);                        // top edge
    queue.push(width * (height - 1) + x); // bottom edge
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(y * width);               // left edge
    queue.push(y * width + width - 1);   // right edge
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    if (idx < 0 || idx >= width * height || visited[idx]) continue;
    visited[idx] = 1;

    const x = idx % width;
    const y = Math.floor(idx / width);
    const p = idx * 4;

    const r = data[p], g = data[p + 1], b = data[p + 2];

    // If near-white, make transparent and spread to neighbours
    if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
      data[p + 3] = 0; // alpha = 0
      if (x > 0)          queue.push(idx - 1);
      if (x < width - 1)  queue.push(idx + 1);
      if (y > 0)          queue.push(idx - width);
      if (y < height - 1) queue.push(idx + width);
    }
  }

  await img.write(filePath);
  console.log(`  ✓ Saved ${filename} (${width}×${height})`);
}

await stripBg('Mascot_TModel2.png');
await stripBg('Mascot_Snowball.png');
console.log('Done.');
