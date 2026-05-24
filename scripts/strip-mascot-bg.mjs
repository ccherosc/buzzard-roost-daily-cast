// scripts/strip-mascot-bg.mjs
// Flood-fills from all edges to remove the uniform dark-gray background
// from mascot PNGs, replacing it with true alpha transparency.
//
// Algorithm: sample the top-left corner to get the background color,
// then flood-fill from ALL edge pixels removing any pixel within
// TOLERANCE Euclidean distance of that background color.
import { Jimp } from 'jimp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dir, '..', 'assets', 'reference');

const TOLERANCE = 38; // Euclidean RGB distance — background is ~(52,52,50), character colors much warmer

async function stripBg(filename) {
  const filePath = join(ASSETS, filename);
  console.log(`Processing ${filename}...`);

  const img = await Jimp.read(filePath);
  const { width, height, data } = img.bitmap;

  // Sample background color from top-left corner pixel
  const bgR = data[0], bgG = data[1], bgB = data[2];
  console.log(`  Background color sampled: rgb(${bgR}, ${bgG}, ${bgB})`);

  const visited = new Uint8Array(width * height);

  // Seed from ALL edge pixels
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

    // Euclidean distance from background color
    const dr = r - bgR, dg = g - bgG, db = b - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= TOLERANCE) {
      data[p + 3] = 0; // make transparent
      if (x > 0)          queue.push(idx - 1);
      if (x < width - 1)  queue.push(idx + 1);
      if (y > 0)          queue.push(idx - width);
      if (y < height - 1) queue.push(idx + width);
    }
  }

  // Count how many pixels were made transparent
  let transparent = 0;
  for (let i = 0; i < width * height; i++) {
    if (data[i * 4 + 3] === 0) transparent++;
  }
  const pct = (transparent / (width * height) * 100).toFixed(1);

  await img.write(filePath);
  console.log(`  ✓ Saved ${filename} (${width}×${height}), removed ${pct}% as background`);
}

await stripBg('Mascot_TModel2.png');
await stripBg('Mascot_Snowball.png');
console.log('Done.');
