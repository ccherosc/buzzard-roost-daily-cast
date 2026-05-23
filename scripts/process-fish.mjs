// scripts/process-fish.mjs  v2
// Extracts 22 fish from fish1.png and fish2.png with:
//   • Edge flood-fill to remove white background
//   • Auto-detection of fish/label boundary (scan row densities)
//   • Largest-component isolation (removes bleed-through from adjacent cells)
//   • Transparent-margin trim

import Jimp from 'jimp';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const OUTPUT = 'src/assets/fish';
if (!existsSync(OUTPUT)) await mkdir(OUTPUT, { recursive: true });

// Rows 0-1 always have 4 fish; row 2 has 3 fish spanning the full width.
const FISH1_IDS = [
  ['bluegill',        'sunfish',          'yellow_perch',    'crappie'     ],
  ['rock_bass',       'largemouth_bass',  'smallmouth_bass', 'walleye'     ],
  ['channel_catfish', 'carp',             'rainbow_trout'                  ],
];
const FISH2_IDS = [
  ['striped_bass',    'northern_pike',    'muskie',          'trophy_bass' ],
  ['giant_catfish',   'tiger_muskie',     'alligator_gar',   'golden_trout'],
  ['ancient_sturgeon','albino_catfish',   'buzzard_monster'                ],
];

// ── 1. Auto-detect where fish body ends (just above the text label) ────────
// Scans row densities from the bottom via a state machine:
//   SKIP_BOTTOM → IN_LABEL → IN_GAP → found fish bottom
function detectFishHeight(sheet, cellX, cellY, cellW, cellH, bgThreshold = 50) {
  const sw   = sheet.getWidth();
  const data = sheet.bitmap.data;

  const isNearWhite = (x, y) => {
    const di = (y * sw + x) * 4;
    return Math.sqrt(
      (255 - data[di    ]) ** 2 +
      (255 - data[di + 1]) ** 2 +
      (255 - data[di + 2]) ** 2
    ) < bgThreshold;
  };

  // Row density = fraction of non-white pixels in this cell row
  const density = new Float32Array(cellH);
  for (let dy = 0; dy < cellH; dy++) {
    let nonWhite = 0;
    for (let dx = 0; dx < cellW; dx++) {
      if (!isNearWhite(cellX + dx, cellY + dy)) nonWhite++;
    }
    density[dy] = nonWhite / cellW;
  }

  // State machine — scan bottom→top looking for: margin → label → gap → fish body
  let state = 'SKIP_BOTTOM';
  let fishHeight = Math.floor(cellH * 0.75); // fallback if no clear gap found

  for (let dy = cellH - 1; dy >= Math.floor(cellH * 0.20); dy--) {
    const isEmpty = density[dy] < 0.015;

    if      (state === 'SKIP_BOTTOM' && !isEmpty) state = 'IN_LABEL';
    else if (state === 'IN_LABEL'    &&  isEmpty) state = 'IN_GAP';
    else if (state === 'IN_GAP'      && !isEmpty) {
      fishHeight = dy + 6; // dy is fish body bottom; +6px padding
      break;
    }
  }

  // Clamp: at least 50% of cell, no more than 82%
  return Math.max(Math.floor(cellH * 0.50), Math.min(fishHeight, Math.floor(cellH * 0.82)));
}

// ── 2. Remove white background via edge flood-fill ────────────────────────
function removeBackground(bitmap, threshold = 55) {
  const { width: w, height: h, data } = bitmap;
  const marked = new Uint8Array(w * h);

  const isNearWhite = (pi) => {
    const di = pi * 4;
    return Math.sqrt(
      (255 - data[di    ]) ** 2 +
      (255 - data[di + 1]) ** 2 +
      (255 - data[di + 2]) ** 2
    ) < threshold;
  };

  const queue = [];
  const seed = (pi) => {
    if (pi >= 0 && pi < w * h && !marked[pi] && isNearWhite(pi)) {
      marked[pi] = 1;
      queue.push(pi);
    }
  };

  // Seed all four edges
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 1; y < h - 1; y++) { seed(y * w); seed(y * w + w - 1); }

  // BFS
  for (let qi = 0; qi < queue.length; qi++) {
    const pi = queue[qi];
    const px = pi % w;
    const py = (pi / w) | 0;
    if (px > 0)     seed(pi - 1);
    if (px < w - 1) seed(pi + 1);
    if (py > 0)     seed(pi - w);
    if (py < h - 1) seed(pi + w);
  }

  for (let i = 0; i < w * h; i++) {
    if (marked[i]) data[i * 4 + 3] = 0;
  }
}

// ── 3. Keep only the largest connected component ──────────────────────────
// After background removal, only non-transparent pixels remain.
// Bleed-through from adjacent cells appears as small isolated components.
function isolateLargestComponent(bitmap) {
  const { width: w, height: h, data } = bitmap;
  const compId    = new Int32Array(w * h).fill(-1);
  const compSizes = [];

  for (let startPi = 0; startPi < w * h; startPi++) {
    if (data[startPi * 4 + 3] === 0 || compId[startPi] !== -1) continue;

    const cId = compSizes.length;
    compSizes.push(0);
    const queue = [startPi];
    compId[startPi] = cId;

    for (let qi = 0; qi < queue.length; qi++) {
      const pi = queue[qi];
      compSizes[cId]++;
      const px = pi % w;
      const py = (pi / w) | 0;

      // 4-connected neighbors — built carefully to avoid row-wrap
      const nbrs = [];
      if (px > 0)     nbrs.push(pi - 1);
      if (px < w - 1) nbrs.push(pi + 1);
      if (py > 0)     nbrs.push(pi - w);
      if (py < h - 1) nbrs.push(pi + w);

      for (const npi of nbrs) {
        if (data[npi * 4 + 3] === 0 || compId[npi] !== -1) continue;
        compId[npi] = cId;
        queue.push(npi);
      }
    }
  }

  // Find the largest component id
  let maxId = 0, maxSize = 0;
  for (let i = 0; i < compSizes.length; i++) {
    if (compSizes[i] > maxSize) { maxSize = compSizes[i]; maxId = i; }
  }

  // Erase all smaller components
  for (let pi = 0; pi < w * h; pi++) {
    if (compId[pi] !== -1 && compId[pi] !== maxId) {
      data[pi * 4 + 3] = 0;
    }
  }
}

// ── 4. Trim transparent margins ───────────────────────────────────────────
function trimTransparent(jimg, pad = 6) {
  const w    = jimg.getWidth();
  const h    = jimg.getHeight();
  const data = jimg.bitmap.data;

  let top = h, bottom = 0, left = w, right = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 10) {
        if (y < top)    top    = y;
        if (y > bottom) bottom = y;
        if (x < left)   left   = x;
        if (x > right)  right  = x;
      }
    }
  }

  if (top > bottom || left > right) return jimg;

  return jimg.crop(
    Math.max(0, left   - pad),
    Math.max(0, top    - pad),
    Math.min(w, right  + pad + 1) - Math.max(0, left - pad),
    Math.min(h, bottom + pad + 1) - Math.max(0, top  - pad),
  );
}

// ── Sheet processor ───────────────────────────────────────────────────────
async function processSheet(inputPath, grid) {
  console.log(`\n▶ ${inputPath}`);
  const sheet = await Jimp.read(inputPath);
  const W     = sheet.getWidth();
  const H     = sheet.getHeight();
  const ROWS  = grid.length;
  console.log(`  ${W} × ${H}px`);

  for (let row = 0; row < ROWS; row++) {
    const rowIds = grid[row];
    const COLS   = rowIds.length;               // 4 for rows 0-1, 3 for row 2
    const CELL_W = Math.floor(W / COLS);
    const CELL_H = Math.floor(H / ROWS);

    for (let col = 0; col < COLS; col++) {
      const id = rowIds[col];
      if (!id) continue;

      const cellX = col * CELL_W;
      const cellY = row * CELL_H;

      // Detect where fish body ends above the label
      const fishH = detectFishHeight(sheet, cellX, cellY, CELL_W, CELL_H);

      // Crop, background-remove, isolate, trim
      let cell = sheet.clone().crop(cellX, cellY, CELL_W, fishH);
      removeBackground(cell.bitmap, 55);
      isolateLargestComponent(cell.bitmap);
      cell = trimTransparent(cell, 6);

      await cell.writeAsync(`${OUTPUT}/${id}.png`);
      console.log(`  ✓  ${id}.png  (fishH=${fishH}/${CELL_H})  →  ${cell.getWidth()}×${cell.getHeight()}`);
    }
  }
}

await processSheet('src/assets/fish1.png', FISH1_IDS);
await processSheet('src/assets/fish2.png', FISH2_IDS);

console.log(`\n✅  All 22 fish extracted to ${OUTPUT}/`);
