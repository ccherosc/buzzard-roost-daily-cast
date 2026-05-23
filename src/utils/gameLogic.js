// src/utils/gameLogic.js
import {
  RARITIES, BASE_WEIGHTS, SPOT_MODIFIERS, LURE_MODIFIERS,
  CAST_MODIFIERS, POINTS_RANGES, COUPON_RULES, PERFORMANCE_BONUS,
} from '../config/gameConfig.js';
import { FISH_DATABASE } from '../data/fishData.js';

/** Compute effective rarity weights given spot/lure/cast choices. */
export function computeWeights(spotId, lureId, castStyleId) {
  const spotMod = SPOT_MODIFIERS[spotId]      ?? {};
  const lureMod = LURE_MODIFIERS[lureId]      ?? {};
  const castMod = CAST_MODIFIERS[castStyleId] ?? {};

  const weights = {};
  for (const rarity of RARITIES) {
    const raw =
      (BASE_WEIGHTS[rarity] ?? 0) +
      (spotMod[rarity]      ?? 0) +
      (lureMod[rarity]      ?? 0) +
      (castMod[rarity]      ?? 0);
    // Floor at 0.01 so weights can approach zero (epic/legendary suppressed on safe setups)
    // but never reach exactly 0 (rollRarity needs a non-zero total).
    weights[rarity] = Math.max(0.01, raw);
  }
  return weights;
}

/** Weighted random rarity selection. */
export function rollRarity(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const rarity of RARITIES) {
    roll -= weights[rarity];
    if (roll <= 0) return rarity;
  }
  return 'common';
}

/** Pick a random fish from the given rarity tier. */
export function pickFish(rarity) {
  const pool = FISH_DATABASE[rarity] ?? FISH_DATABASE.common;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Calculate base points for a rarity (before performance bonuses). */
export function calcPoints(rarity) {
  const { base, variance } = POINTS_RANGES[rarity] ?? POINTS_RANGES.common;
  return base + Math.floor(Math.random() * variance);
}

/** Calculate catch weight within the fish's weight range. */
export function calcWeight(fish) {
  const raw = fish.weightMin + Math.random() * (fish.weightMax - fish.weightMin);
  return Math.round(raw * 10) / 10;
}

/** Generate a placeholder coupon code. */
export function generateCouponCode(rarity) {
  const suffix = Date.now().toString(36).toUpperCase();
  return `BUZZARD-${rarity.toUpperCase()}-${suffix}`;
}

/**
 * Apply gameplay performance bonuses to a pre-built result.
 * accuracy, hooksetQuality, fightQuality are each 0–1 (1 = perfect).
 * Returns a new result object with boosted points and performance metadata.
 */
export function applyPerformanceBonuses(result, {
  accuracy       = 0.5,
  hooksetQuality = 0.5,
  fightQuality   = 0.5,
} = {}) {
  const castBonus    = PERFORMANCE_BONUS.accuracy * accuracy;
  const hooksetBonus = PERFORMANCE_BONUS.hookset  * hooksetQuality;
  const fightBonus   = PERFORMANCE_BONUS.fight    * fightQuality;

  const multiplier   = 1 + castBonus + hooksetBonus + fightBonus;
  const bonusPoints  = Math.floor(result.points * (multiplier - 1));

  return {
    ...result,
    points:      result.points + bonusPoints,
    bonusPoints,
    performance: {
      accuracy:       Math.round(accuracy       * 100),
      hooksetQuality: Math.round(hooksetQuality * 100),
      fightQuality:   Math.round(fightQuality   * 100),
      multiplier:     Math.round(multiplier * 100) / 100,
    },
  };
}

/**
 * Build a base result (fish/rarity/points/weight/coupon).
 * Performance bonuses are NOT applied here — call applyPerformanceBonuses() after.
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
      label:    (COUPON_RULES[rarity] ?? COUPON_RULES.common).label,
      discount: (COUPON_RULES[rarity] ?? COUPON_RULES.common).discount,
    },
    spot:      spotId,
    lure:      lureId,
    castStyle: castStyleId,
  };
}
