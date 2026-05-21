// src/utils/__tests__/gameLogic.test.js
import { describe, it, expect, vi } from 'vitest';
import {
  computeWeights, rollRarity, pickFish,
  calcPoints, calcWeight, buildResult,
} from '../gameLogic.js';
import { RARITIES, POINTS_RANGES } from '../../config/gameConfig.js';
import { FISH_DATABASE, ALL_FISH } from '../../data/fishData.js';

describe('computeWeights', () => {
  it('returns a weight for every rarity', () => {
    const w = computeWeights('dock', 'worm', 'safeCast');
    expect(Object.keys(w)).toEqual(RARITIES);
  });

  it('all weights are at least 1', () => {
    const w = computeWeights('deepWater', 'mysteryLure', 'riskyCast');
    for (const r of RARITIES) expect(w[r]).toBeGreaterThanOrEqual(1);
  });

  it('safe combo weights common higher than legendary', () => {
    const w = computeWeights('dock', 'worm', 'safeCast');
    expect(w.common).toBeGreaterThan(w.legendary);
  });

  it('risky combo weights legendary higher than common', () => {
    const w = computeWeights('deepWater', 'mysteryLure', 'riskyCast');
    expect(w.legendary).toBeGreaterThan(w.common);
  });

  it('handles unknown ids gracefully (uses base weights)', () => {
    const w = computeWeights('unknown', 'unknown', 'unknown');
    for (const r of RARITIES) expect(w[r]).toBeGreaterThanOrEqual(1);
  });
});

describe('rollRarity', () => {
  it('returns a valid rarity string', () => {
    const w = computeWeights('dock', 'worm', 'safeCast');
    const result = rollRarity(w);
    expect(RARITIES).toContain(result);
  });

  it('returns common most often with safe combo (statistical)', () => {
    const w = computeWeights('dock', 'worm', 'safeCast');
    const counts = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    for (let i = 0; i < 1000; i++) counts[rollRarity(w)]++;
    expect(counts.common).toBeGreaterThan(counts.legendary * 10);
  });

  it('works with single-rarity weights (edge case)', () => {
    const w = { common: 100, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    // All weights 0 are valid here; rollRarity should still return something
    const result = rollRarity(w);
    expect(RARITIES).toContain(result);
  });
});

describe('pickFish', () => {
  it('returns a fish from the correct rarity pool', () => {
    for (const rarity of RARITIES) {
      const fish = pickFish(rarity);
      expect(fish.rarity).toBe(rarity);
    }
  });

  it('returned fish has required fields', () => {
    const fish = pickFish('common');
    expect(fish).toHaveProperty('id');
    expect(fish).toHaveProperty('name');
    expect(fish).toHaveProperty('emoji');
    expect(fish).toHaveProperty('weightMin');
    expect(fish).toHaveProperty('weightMax');
    expect(fish).toHaveProperty('flavor');
  });
});

describe('calcPoints', () => {
  it('returns points within the configured range for each rarity', () => {
    for (const rarity of RARITIES) {
      const { base, variance } = POINTS_RANGES[rarity];
      for (let i = 0; i < 50; i++) {
        const pts = calcPoints(rarity);
        expect(pts).toBeGreaterThanOrEqual(base);
        expect(pts).toBeLessThanOrEqual(base + variance);
      }
    }
  });
});

describe('calcWeight', () => {
  it('returns weight within fish min/max range', () => {
    for (const fish of ALL_FISH) {
      for (let i = 0; i < 10; i++) {
        const w = calcWeight(fish);
        expect(w).toBeGreaterThanOrEqual(fish.weightMin);
        expect(w).toBeLessThanOrEqual(fish.weightMax + 0.05); // floating point buffer
      }
    }
  });

  it('returns weight rounded to 1 decimal place', () => {
    const fish = FISH_DATABASE.common[0];
    const w = calcWeight(fish);
    expect(w).toBe(Math.round(w * 10) / 10);
  });
});

describe('buildResult', () => {
  it('returns a result with all required fields', () => {
    const result = buildResult('dock', 'worm', 'safeCast');
    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('fishId');
    expect(result).toHaveProperty('fishName');
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('rarity');
    expect(result).toHaveProperty('weight');
    expect(result).toHaveProperty('points');
    expect(result).toHaveProperty('flavor');
    expect(result).toHaveProperty('coupon.code');
    expect(result).toHaveProperty('coupon.label');
    expect(result).toHaveProperty('coupon.discount');
  });

  it('date is today in YYYY-MM-DD format', () => {
    const result = buildResult('dock', 'worm', 'safeCast');
    const today = new Date().toISOString().split('T')[0];
    expect(result.date).toBe(today);
  });

  it('fishId exists in the fish database', () => {
    const result = buildResult('deepWater', 'mysteryLure', 'riskyCast');
    const found = ALL_FISH.find(f => f.id === result.fishId);
    expect(found).toBeDefined();
  });

  it('coupon code starts with BUZZARD-', () => {
    const result = buildResult('dock', 'worm', 'safeCast');
    expect(result.coupon.code).toMatch(/^BUZZARD-/);
  });
});
