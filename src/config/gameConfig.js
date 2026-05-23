// src/config/gameConfig.js
// ============================================================
// BUZZARD ROOST DAILY CAST V2 — Game Configuration
// ============================================================

// ── Dev flags ────────────────────────────────────────────────
// Set to false before launch to enforce the 3-casts-per-day limit.
export const DEV_DISABLE_DAILY_LIMIT = true;

// Number of casts allowed per day
export const DAILY_CAST_LIMIT = 3;

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// ── Base rarity weights (before modifiers) ───────────────────
export const BASE_WEIGHTS = {
  common:    50,
  uncommon:  25,
  rare:      15,
  epic:       7,
  legendary:  3,
};

// ── Spot modifiers ───────────────────────────────────────────
export const SPOT_MODIFIERS = {
  dock:        { common:  8, uncommon:  4, rare: -2, epic: -5, legendary: -5 },
  reeds:       { common:  3, uncommon:  6, rare:  3, epic: -3, legendary: -2 },
  fallenTree:  { common: -3, uncommon:  2, rare:  6, epic:  2, legendary:  0 },
  deepWater:   { common:-10, uncommon: -3, rare:  2, epic:  7, legendary:  4 },
  rockyBank:   { common: -3, uncommon:  0, rare:  4, epic:  2, legendary:  1 },
};

// ── Lure modifiers ───────────────────────────────────────────
export const LURE_MODIFIERS = {
  worm:        { common:  8, uncommon:  4, rare: -2, epic: -4, legendary: -4 },
  spinner:     { common:  0, uncommon:  5, rare:  3, epic: -1, legendary: -1 },
  frog:        { common: -2, uncommon:  2, rare:  5, epic:  3, legendary:  0 },
  jig:         { common:  0, uncommon:  2, rare:  3, epic:  3, legendary: -1 },
  mysteryLure: { common:-12, uncommon: -4, rare:  2, epic:  7, legendary:  7 },
};

// ── Cast style modifiers (used for rarity weighting) ─────────
export const CAST_MODIFIERS = {
  safeCast:      { common: 10, uncommon:  3, rare: -3, epic: -5, legendary: -5 },
  precisionCast: { common: -2, uncommon:  3, rare:  5, epic:  1, legendary: -1 },
  powerCast:     { common: -5, uncommon: -2, rare:  3, epic:  5, legendary:  2 },
  riskyCast:     { common:-15, uncommon: -5, rare:  3, epic:  7, legendary: 10 },
};

// ── Points per rarity (base + random 0..variance) ────────────
export const POINTS_RANGES = {
  common:    { base:   50, variance:  100 },
  uncommon:  { base:  150, variance:  200 },
  rare:      { base:  350, variance:  300 },
  epic:      { base:  650, variance:  550 },
  legendary: { base: 1200, variance: 1300 },
};

// ── Performance bonus caps (fractions of base points) ────────
// Total max bonus: accuracy 0.20 + hookset 0.15 + fight 0.25 = 0.60 (60% boost)
export const PERFORMANCE_BONUS = {
  accuracy:  0.20,  // cast meter accuracy bonus
  hookset:   0.15,  // bite timing hookset bonus
  fight:     0.25,  // fight meter quality bonus
};

// ── Coupon rewards per rarity ─────────────────────────────────
export const COUPON_RULES = {
  common:    { discount: '5% off',                  label: "Angler's Discount"   },
  uncommon:  { discount: '10% off',                 label: 'Bass Hunter Deal'     },
  rare:      { discount: '15% off',                 label: 'Trophy Catch Reward'  },
  epic:      { discount: 'Free shipping + 15% off', label: 'Epic Haul Reward'     },
  legendary: { discount: '20% off',                 label: 'Monster Catch Coupon' },
};

// ── Scarcity copy shown on Epic/Legendary cards ──────────────
export const SCARCITY_COPY = {
  epic:      'Only 7% of anglers ever land a catch like this.',
  legendary: 'Only 3% of anglers ever hook a legend like this.',
};

// ── Streak badge thresholds ───────────────────────────────────
export const STREAK_TIERS = [
  { min: 100, emoji: '👑', label: 'Legend' },
  { min:  30, emoji: '💎', label: 'Dedicated Angler' },
  { min:   7, emoji: '🔥', label: 'On Fire' },
  { min:   1, emoji: '🎣', label: '' },
];

export function streakEmoji(count) {
  for (const tier of STREAK_TIERS) {
    if (count >= tier.min) return tier.emoji;
  }
  return '🎣';
}
