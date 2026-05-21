// src/config/gameConfig.js
// ============================================================
// BUZZARD ROOST DAILY CAST — Game Configuration
// All tunable values live here. Edit this file to rebalance
// fish odds, adjust coupons, or change points without touching
// any game logic.
// ============================================================

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// ── Base rarity weights (before modifiers) ────────────────
export const BASE_WEIGHTS = {
  common:    50,
  uncommon:  25,
  rare:      15,
  epic:       7,
  legendary:  3,
};

// ── Spot modifiers (keyed by spot id from gameData.js) ────
export const SPOT_MODIFIERS = {
  dock:        { common:  8, uncommon:  4, rare: -2, epic: -5, legendary: -5 },
  reeds:       { common:  3, uncommon:  6, rare:  3, epic: -3, legendary: -2 },
  fallenTree:  { common: -3, uncommon:  2, rare:  6, epic:  2, legendary:  0 },
  deepWater:   { common:-10, uncommon: -3, rare:  2, epic:  7, legendary:  4 },
  rockyBank:   { common: -3, uncommon:  0, rare:  4, epic:  2, legendary:  1 },
};

// ── Lure modifiers (keyed by lure id from gameData.js) ────
export const LURE_MODIFIERS = {
  worm:        { common:  8, uncommon:  4, rare: -2, epic: -4, legendary: -4 },
  spinner:     { common:  0, uncommon:  5, rare:  3, epic: -1, legendary: -1 },
  frog:        { common: -2, uncommon:  2, rare:  5, epic:  3, legendary:  0 },
  jig:         { common:  0, uncommon:  2, rare:  3, epic:  3, legendary: -1 },
  mysteryLure: { common:-12, uncommon: -4, rare:  2, epic:  7, legendary:  7 },
};

// ── Cast style modifiers (keyed by cast id from gameData.js)
export const CAST_MODIFIERS = {
  safeCast:      { common: 10, uncommon:  3, rare: -3, epic: -5, legendary: -5 },
  precisionCast: { common: -2, uncommon:  3, rare:  5, epic:  1, legendary: -1 },
  powerCast:     { common: -5, uncommon: -2, rare:  3, epic:  5, legendary:  2 },
  riskyCast:     { common:-15, uncommon: -5, rare:  3, epic:  7, legendary: 10 },
};

// ── Points per rarity (base + random 0..variance) ─────────
export const POINTS_RANGES = {
  common:    { base:   50, variance:  100 },
  uncommon:  { base:  150, variance:  200 },
  rare:      { base:  350, variance:  300 },
  epic:      { base:  650, variance:  550 },
  legendary: { base: 1200, variance: 1300 },
};

// ── Coupon rewards per rarity ─────────────────────────────
// SHOPIFY: In V2 replace 'discount' with a Shopify price rule
// type ('percentage' | 'fixed_amount' | 'free_shipping').
export const COUPON_RULES = {
  common:    { discount: '5% off',                  label: "Angler's Discount"   },
  uncommon:  { discount: '10% off',                 label: 'Bass Hunter Deal'     },
  rare:      { discount: '15% off',                 label: 'Trophy Catch Reward'  },
  epic:      { discount: 'Free shipping + 15% off', label: 'Epic Haul Reward'     },
  legendary: { discount: '20% off',                 label: 'Monster Catch Coupon' },
};

// ── Scarcity copy shown on Epic/Legendary cards ───────────
export const SCARCITY_COPY = {
  epic:      'Only 10% of anglers ever land a catch like this.',
  legendary: 'Only 3% of anglers ever hook a legend like this.',
};

// ── Streak badge thresholds ───────────────────────────────
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
