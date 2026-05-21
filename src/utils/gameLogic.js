// src/utils/gameLogic.js
import {
  RARITIES, BASE_WEIGHTS, SPOT_MODIFIERS, LURE_MODIFIERS,
  CAST_MODIFIERS, POINTS_RANGES, COUPON_RULES,
} from '../config/gameConfig.js';
import { FISH_DATABASE } from '../data/fishData.js';

/**
 * Compute effective rarity weights given the player's three choices.
 * Each tier starts at BASE_WEIGHTS, gets modifiers added, then clamped to min 1.
 * Returns raw (un-normalized) weights object.
 */
export function computeWeights(spotId, lureId, castStyleId) {
  const spotMod = SPOT_MODIFIERS[spotId]  ?? {};
  const lureMod = LURE_MODIFIERS[lureId]  ?? {};
  const castMod = CAST_MODIFIERS[castStyleId] ?? {};

  const weights = {};
  for (const rarity of RARITIES) {
    const raw =
      (BASE_WEIGHTS[rarity]  ?? 0) +
      (spotMod[rarity]       ?? 0) +
      (lureMod[rarity]       ?? 0) +
      (castMod[rarity]       ?? 0);
    weights[rarity] = Math.max(1, raw);
  }
  return weights;
}

/**
 * Weighted random rarity selection.
 * @param {Record<string,number>} weights — un-normalized weights object
 * @returns {string} rarity string
 */
export function rollRarity(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const rarity of RARITIES) {
    roll -= weights[rarity];
    if (roll <= 0) return rarity;
  }
  return 'common'; // fallback (floating point edge case)
}

/** Pick a random fish from the given rarity tier. */
export function pickFish(rarity) {
  const pool = FISH_DATABASE[rarity] ?? FISH_DATABASE.common;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Calculate points for a given rarity. */
export function calcPoints(rarity) {
  const { base, variance } = POINTS_RANGES[rarity] ?? POINTS_RANGES.common;
  return base + Math.floor(Math.random() * variance);
}

/** Calculate catch weight within the fish's weight range. */
export function calcWeight(fish) {
  const raw = fish.weightMin + Math.random() * (fish.weightMax - fish.weightMin);
  return Math.round(raw * 10) / 10;
}

/**
 * Generate a display coupon code for the given rarity.
 *
 * SHOPIFY: Replace this function body in V2 with a call to your backend:
 *   POST /api/generate-coupon { rarity, playerId }
 * which calls Shopify Admin API:
 *   POST /admin/api/2024-01/price_rules/{id}/discount_codes.json
 * and returns the real single-use code.
 */
export function generateCouponCode(rarity) {
  const suffix = Date.now().toString(36).toUpperCase();
  return `BUZZARD-${rarity.toUpperCase()}-${suffix}`;
}

/**
 * Master function: runs the full rarity roll and builds a result object.
 * The result is unsigned — call integrity.addSignature() before saving.
 */
export function buildResult(spotId, lureId, castStyleId) {
  const weights = computeWeights(spotId, lureId, castStyleId);
  const rarity  = rollRarity(weights);
  const fish    = pickFish(rarity);
  const points  = calcPoints(rarity);
  const weight  = calcWeight(fish);
  const code    = generateCouponCode(rarity);
  const today   = new Date().toISOString().split('T')[0];

  return {
    date:     today,
    fishId:   fish.id,
    fishName: fish.name,
    emoji:    fish.emoji,
    rarity,
    weight,
    points,
    flavor:   fish.flavor,
    coupon: {
      code,
      label:    COUPON_RULES[rarity].label,
      discount: COUPON_RULES[rarity].discount,
    },
    spot:      spotId,
    lure:      lureId,
    castStyle: castStyleId,
  };
}
