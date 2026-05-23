import { describe, it, expect } from 'vitest';
import { buildGameParams } from '../gameParams.js';

describe('buildGameParams', () => {
  it('returns castMeter, biteTiming, fightMeter keys', () => {
    const p = buildGameParams('dock', 'worm', 'safeCast', 'common');
    expect(p).toHaveProperty('castMeter');
    expect(p).toHaveProperty('biteTiming');
    expect(p).toHaveProperty('fightMeter');
  });

  describe('castMeter', () => {
    it('safeCast → DURATION_MS=2000, SWEET_ZONE=0.36', () => {
      const { castMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(castMeter.DURATION_MS).toBe(2000);
      expect(castMeter.SWEET_ZONE).toBeCloseTo(0.36, 5);
    });

    it('riskyCast → DURATION_MS=900, SWEET_ZONE=0.20', () => {
      const { castMeter } = buildGameParams('dock', 'spinner', 'riskyCast', 'common');
      expect(castMeter.DURATION_MS).toBe(900);
      expect(castMeter.SWEET_ZONE).toBeCloseTo(0.20, 5);
    });

    it('worm lure adds 0.04 to sweet zone', () => {
      const base = buildGameParams('dock', 'spinner', 'precisionCast', 'common');
      const worm = buildGameParams('dock', 'worm',    'precisionCast', 'common');
      expect(worm.castMeter.SWEET_ZONE).toBeCloseTo(base.castMeter.SWEET_ZONE + 0.04, 5);
    });

    it('mysteryLure subtracts 0.06 from sweet zone', () => {
      const base    = buildGameParams('dock', 'spinner',     'precisionCast', 'common');
      const mystery = buildGameParams('dock', 'mysteryLure', 'precisionCast', 'common');
      expect(mystery.castMeter.SWEET_ZONE).toBeCloseTo(base.castMeter.SWEET_ZONE - 0.06, 5);
    });

    it('deepWater spot adds sweetOffset=0.15', () => {
      const { castMeter } = buildGameParams('deepWater', 'spinner', 'safeCast', 'common');
      expect(castMeter.sweetOffset).toBeCloseTo(0.15, 5);
    });

    it('dock spot has sweetOffset=0', () => {
      const { castMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(castMeter.sweetOffset).toBe(0);
    });
  });

  describe('biteTiming', () => {
    it('frog lure → fast wait range', () => {
      const { biteTiming } = buildGameParams('dock', 'frog', 'safeCast', 'common');
      expect(biteTiming.WAIT_MIN_MS).toBe(400);
      expect(biteTiming.WAIT_MAX_MS).toBe(1200);
    });

    it('worm lure → slow wait range', () => {
      const { biteTiming } = buildGameParams('dock', 'worm', 'safeCast', 'common');
      expect(biteTiming.WAIT_MIN_MS).toBe(2500);
      expect(biteTiming.WAIT_MAX_MS).toBe(5500);
    });

    it('mysteryLure → wide random range', () => {
      const { biteTiming } = buildGameParams('dock', 'mysteryLure', 'safeCast', 'common');
      expect(biteTiming.WAIT_MIN_MS).toBe(200);
      expect(biteTiming.WAIT_MAX_MS).toBe(6000);
    });

    it('reeds spot → WINDOW_MS=550', () => {
      const { biteTiming } = buildGameParams('reeds', 'spinner', 'safeCast', 'common');
      expect(biteTiming.WINDOW_MS).toBe(550);
    });

    it('dock spot → WINDOW_MS=1000', () => {
      const { biteTiming } = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(biteTiming.WINDOW_MS).toBe(1000);
    });

    it('precisionCast → showPreBiteCue=true', () => {
      const { biteTiming } = buildGameParams('dock', 'spinner', 'precisionCast', 'common');
      expect(biteTiming.showPreBiteCue).toBe(true);
    });

    it('riskyCast → noPreBiteWarning=true', () => {
      const { biteTiming } = buildGameParams('dock', 'spinner', 'riskyCast', 'common');
      expect(biteTiming.noPreBiteWarning).toBe(true);
    });
  });

  describe('fightMeter', () => {
    it('legendary fish → highest DRIFT_RATE', () => {
      const leg = buildGameParams('dock', 'spinner', 'safeCast', 'legendary');
      const com = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(leg.fightMeter.DRIFT_RATE).toBeGreaterThan(com.fightMeter.DRIFT_RATE);
    });

    it('legendary DRIFT_RATE=0.00026', () => {
      const { fightMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'legendary');
      expect(fightMeter.DRIFT_RATE).toBeCloseTo(0.00026, 7);
    });

    it('common DRIFT_RATE=0.00010', () => {
      const { fightMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(fightMeter.DRIFT_RATE).toBeCloseTo(0.00010, 7);
    });

    it('FIGHT_DURATION_MS=8000 always', () => {
      const { fightMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'rare');
      expect(fightMeter.FIGHT_DURATION_MS).toBe(8000);
    });

    it('frog lure → startingTension=0.45', () => {
      const { fightMeter } = buildGameParams('dock', 'frog', 'safeCast', 'common');
      expect(fightMeter.startingTension).toBeCloseTo(0.45, 5);
    });

    it('worm lure → startingTension=0.20', () => {
      const { fightMeter } = buildGameParams('dock', 'worm', 'safeCast', 'common');
      expect(fightMeter.startingTension).toBeCloseTo(0.20, 5);
    });

    it('rockyBank spot → lower SURGE_INTERVAL_MIN', () => {
      const rocky = buildGameParams('rockyBank', 'spinner', 'safeCast', 'common');
      const dock  = buildGameParams('dock',      'spinner', 'safeCast', 'common');
      expect(rocky.fightMeter.SURGE_INTERVAL_MIN).toBeLessThan(dock.fightMeter.SURGE_INTERVAL_MIN);
    });
  });
});
