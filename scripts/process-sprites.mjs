// scripts/process-sprites.mjs
// Extracts 18 named sprites from the new 6×6 fisherman spritesheet.
// Background is already transparent — no chroma-key removal needed.

import Jimp from 'jimp';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const INPUT  = 'src/assets/fisherman-spritesheet.png';
const OUTPUT = 'src/assets/sprites';

const sheet = await Jimp.read(INPUT);
const W = sheet.getWidth();   // 1254
const H = sheet.getHeight();  // 1254
console.log(`Spritesheet: ${W} x ${H}`);

// 6×6 grid, each cell 209×209
const COLS   = 6;
const ROWS   = 6;
const CELL_W = Math.floor(W / COLS);  // 209
const CELL_H = Math.floor(H / ROWS);  // 209
console.log(`Cell size: ${CELL_W} x ${CELL_H}`);

// ── Named sprites ──────────────────────────────────────────────
// row / col are 0-indexed from top-left
const SPRITES = [
  // ── Waiting idle loop (rod held, subtle pose variations) ──────
  { name: 'wait-a',      row: 0, col: 0 },   // relaxed grip, neutral
  { name: 'wait-b',      row: 0, col: 2 },   // slight forward lean
  { name: 'wait-c',      row: 0, col: 4 },   // slight back lean
  { name: 'watch',       row: 0, col: 5 },   // hand to brow, scanning

  // ── Casting sequence ──────────────────────────────────────────
  { name: 'cast-throw',  row: 1, col: 1 },   // dynamic release, body forward
  { name: 'cast-follow', row: 1, col: 2 },   // follow-through lean
  { name: 'line-out',    row: 1, col: 0 },   // rod low-right, line in water

  // ── Bite / tension ────────────────────────────────────────────
  { name: 'alert',       row: 3, col: 0 },   // sitting up alert, rod dropping
  { name: 'bite',        row: 3, col: 1 },   // rod bent sharply down — fish!

  // ── Fighting fish ─────────────────────────────────────────────
  { name: 'fight-a',     row: 3, col: 3 },   // leaning back, pulling hard
  { name: 'fight-b',     row: 4, col: 1 },   // variant lean, rod arced
  { name: 'fight-c',     row: 3, col: 5 },   // leaning far back, rod high
  { name: 'fight-d',     row: 4, col: 5 },   // maximum intensity pull

  // ── Triumph / reeling ─────────────────────────────────────────
  { name: 'triumph-a',   row: 5, col: 0 },   // rod pulled up high, both hands
  { name: 'triumph-b',   row: 5, col: 1 },   // big grin, victory
  { name: 'triumph-c',   row: 5, col: 2 },   // excited, mouth open

  // ── Catch reveal ──────────────────────────────────────────────
  { name: 'catch-a',     row: 5, col: 3 },   // small fish dangling
  { name: 'catch-b',     row: 5, col: 4 },   // bigger fish, wide smile
];

if (!existsSync(OUTPUT)) await mkdir(OUTPUT, { recursive: true });

for (const s of SPRITES) {
  const x = s.col * CELL_W;
  const y = s.row * CELL_H;

  // Crop cell — background already transparent, no removal needed
  const frame = sheet.clone().crop(x, y, CELL_W, CELL_H);

  const outPath = `${OUTPUT}/${s.name}.png`;
  await frame.writeAsync(outPath);
  console.log(`✓ ${s.name}.png  [row ${s.row}, col ${s.col}] → x:${x}, y:${y}`);
}

console.log(`\n✅ ${SPRITES.length} sprites extracted to ${OUTPUT}`);
