// scripts/strip-mascot-bg.mjs
// Two-pass background removal for mascot PNGs:
//
// Pass 1 — Flood-fill from all edge pixels using Euclidean color distance
//   from the sampled corner background color.  Handles the exterior region.
//
// Pass 2 — Global sweep: any pixel that is "dark neutral gray"
//   (low saturation + below brightness threshold) is also made transparent.
//   This catches interior pockets (between legs, dock posts, etc.) that
//   the edge flood-fill can never reach.
//
// Together, both passes reliably remove the uniform ~(50,50,50) dark-gray
// background while preserving the character's warm / colorful pixels.
import { Jimp } from 'jimp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dir, '..', 'assets', 'reference');

// Pass 1 tolerance — Euclidean distance from sampled bg color
const FLOOD_TOLERANCE = 40;

// Pass 2 thresholds — "dark neutral gray"
//  chroma  = max(R,G,B) - min(R,G,B)  — low means grayish
//  max val = max(R,G,B)                — low means dark
const CHROMA_MAX   = 14;   // pixel must be near-gray (little color)
const BRIGHT_MAX   = 78;   // pixel must be dark

/** Is pixel a neutral dark gray (background color)? */
function isNeutralDark(r, g, b) {
  const hi = Math.max(r, g, b);
  const lo = Math.min(r, g, b);
  return hi < BRIGHT_MAX && (hi - lo) < CHROMA_MAX;
}

async function stripBg(filename) {
  const filePath    = join(ASSETS, filename);
  const origPath    = join(ASSETS, filename.replace('.png', '_orig.png'));
  // Prefer the clean original if it exists; fall back to current file
  const { existsSync } = await import('fs');
  const srcPath = existsSync(origPath) ? origPath : filePath;
  console.log(`\nProcessing ${filename} (from ${srcPath === origPath ? 'original backup' : 'current file'})...`);

  const img = await Jimp.read(srcPath);
  const { width, height, data } = img.bitmap;

  // ── Pass 1: edge flood-fill ───────────────────────────────────────────
  // Sample background color from top-left pixel
  const bgR = data[0], bgG = data[1], bgB = data[2];
  console.log(`  BG sample: rgb(${bgR}, ${bgG}, ${bgB})`);

  const visited = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push(x);
    queue.push(width * (height - 1) + x);
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(y * width);
    queue.push(y * width + width - 1);
  }

  let pass1Count = 0;
  while (queue.length > 0) {
    const idx = queue.pop();
    if (idx < 0 || idx >= width * height || visited[idx]) continue;
    visited[idx] = 1;

    const p = idx * 4;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    if (data[p + 3] === 0) continue; // already transparent

    const dr = r - bgR, dg = g - bgG, db = b - bgB;
    if (Math.sqrt(dr * dr + dg * dg + db * db) <= FLOOD_TOLERANCE) {
      data[p + 3] = 0;
      pass1Count++;
      const x = idx % width, y = Math.floor(idx / width);
      if (x > 0)          queue.push(idx - 1);
      if (x < width - 1)  queue.push(idx + 1);
      if (y > 0)          queue.push(idx - width);
      if (y < height - 1) queue.push(idx + width);
    }
  }
  console.log(`  Pass 1 (flood): removed ${pass1Count.toLocaleString()} px`);

  // ── Pass 2: global neutral-dark sweep ─────────────────────────────────
  let pass2Count = 0;
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    if (data[p + 3] === 0) continue; // already transparent
    if (isNeutralDark(data[p], data[p + 1], data[p + 2])) {
      data[p + 3] = 0;
      pass2Count++;
    }
  }
  console.log(`  Pass 2 (global neutral-dark): removed ${pass2Count.toLocaleString()} px`);

  const total = pass1Count + pass2Count;
  const pct = (total / (width * height) * 100).toFixed(1);
  console.log(`  Total removed: ${total.toLocaleString()} / ${(width * height).toLocaleString()} (${pct}%)`);

  await img.write(filePath);
  console.log(`  ✓ Saved ${filename}`);
}

// ── IMPORTANT: keep a backup before overwriting ───────────────────────────
// Re-start from the originals each time so we don't compound errors.
// If you need the originals again, restore from git: git checkout HEAD assets/reference/

await stripBg('Mascot_TModel2.png');
await stripBg('Mascot_Snowball.png');
console.log('\nDone.');
