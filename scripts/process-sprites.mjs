// scripts/process-sprites.mjs
// Extracts individual sprites from the fisherman spritesheet,
// removes the dark background, and saves transparent PNGs.

import Jimp from 'jimp';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const INPUT  = 'src/assets/fisherman-spritesheet.png';
const OUTPUT = 'src/assets/sprites';

// ── First pass: detect image dimensions ──────────────────
const sheet = await Jimp.read(INPUT);
const W = sheet.getWidth();
const H = sheet.getHeight();
console.log(`Spritesheet: ${W} x ${H}`);

// ── Sprite grid layout ───────────────────────────────────
// Row 0 (4 sprites): IDLE | FISHING-SE | CAST | LINE-OUT
// Row 1 (5 sprites): WAITING | BITE | REEL-START | REELING | REEL-STRONG
// Row 2 (5 sprites): FISH-ON | PULLING | FISH-UP | SHOWING | RECAST
//
// We skip IDLE (row 0, col 0) — user requested removal.

const ROW_H = Math.floor(H / 3);

const SPRITES = [
  // row 0 — 5 sprites: fishing-se | cast | line-out | waiting | bite
  { name: 'fishing-se',  row: 0, col: 0, cols: 5 },
  { name: 'cast',        row: 0, col: 1, cols: 5 },
  { name: 'line-out',    row: 0, col: 2, cols: 5 },
  { name: 'waiting',     row: 0, col: 3, cols: 5 },
  { name: 'bite',        row: 0, col: 4, cols: 5 },
  // row 1 — 5 sprites: reel-start | reeling | reel-strong | fish-on | pulling
  { name: 'reel-start',  row: 1, col: 0, cols: 5 },
  { name: 'reeling',     row: 1, col: 1, cols: 5 },
  { name: 'reel-strong', row: 1, col: 2, cols: 5 },
  { name: 'fish-on',     row: 1, col: 3, cols: 5 },
  { name: 'pulling',     row: 1, col: 4, cols: 5 },
  // row 2 — 3 sprites left-aligned: fish-up | showing | recast
  { name: 'fish-up',     row: 2, col: 0, cols: 5 },
  { name: 'showing',     row: 2, col: 1, cols: 5 },
  { name: 'recast',      row: 2, col: 2, cols: 5 },
];

// ── Background color (sample top-left corner) ────────────
const bgColor = sheet.getPixelColor(4, 4);
const bgR = (bgColor >> 24) & 0xff;
const bgG = (bgColor >> 16) & 0xff;
const bgB = (bgColor >>  8) & 0xff;
console.log(`Background color: rgb(${bgR}, ${bgG}, ${bgB})`);

const THRESHOLD = 40; // color distance tolerance

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}

// ── Output dir ───────────────────────────────────────────
if (!existsSync(OUTPUT)) await mkdir(OUTPUT, { recursive: true });

// ── Extract and save each sprite ─────────────────────────
for (const s of SPRITES) {
  const cellW = Math.floor(W / s.cols);
  const x = s.col * cellW;
  const y = s.row * ROW_H;

  // Clone, crop to sprite cell
  const frame = sheet.clone().crop(x, y, cellW, ROW_H);

  // Remove background (magenta chroma key — clean cut)
  frame.scan(0, 0, frame.getWidth(), frame.getHeight(), function(px, py, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const dist = colorDistance(r, g, b, bgR, bgG, bgB);
    if (dist < THRESHOLD) {
      this.bitmap.data[idx + 3] = 0; // transparent
    }
  });

  const outPath = `${OUTPUT}/${s.name}.png`;
  await frame.writeAsync(outPath);
  console.log(`✓ ${s.name}.png  (${cellW}x${ROW_H} from ${x},${y})`);
}

console.log('\nAll sprites extracted to', OUTPUT);
