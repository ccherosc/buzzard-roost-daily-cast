// @vitest-environment jsdom
// src/utils/__tests__/storageManager.test.js  — V2 (3-casts-per-day)
import { describe, it, expect, beforeEach } from 'vitest';
import {
  hasUsedAllCastsToday, hasPlayedToday,
  getCastsUsedToday, getCastsRemainingToday,
  loadTodayResult, loadTodayCatches,
  getStreak, updateStreak,
  checkAndUnlockBadges, recordCastResult, saveResult,
  getBadges, loadPlayerData, KEYS,
} from '../storageManager.js';
import { buildResult } from '../gameLogic.js';
import { addSignature } from '../integrity.js';
import { DAILY_CAST_LIMIT } from '../../config/gameConfig.js';

beforeEach(() => localStorage.clear());

const today     = new Date().toISOString().split('T')[0];
const yesterday = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
})();

// ── 3-cast daily system ───────────────────────────────────────

describe('getCastsUsedToday', () => {
  it('returns 0 on fresh storage', () => {
    expect(getCastsUsedToday()).toBe(0);
  });

  it('returns 0 when stored date is not today', () => {
    localStorage.setItem(KEYS.castsToday, JSON.stringify({ date: yesterday, count: 3 }));
    expect(getCastsUsedToday()).toBe(0);
  });

  it('returns stored count when date matches today', () => {
    localStorage.setItem(KEYS.castsToday, JSON.stringify({ date: today, count: 2 }));
    expect(getCastsUsedToday()).toBe(2);
  });
});

describe('getCastsRemainingToday', () => {
  it('returns DAILY_CAST_LIMIT on fresh storage', () => {
    expect(getCastsRemainingToday()).toBe(DAILY_CAST_LIMIT);
  });

  it('decrements as casts are used', () => {
    localStorage.setItem(KEYS.castsToday, JSON.stringify({ date: today, count: 1 }));
    expect(getCastsRemainingToday()).toBe(DAILY_CAST_LIMIT - 1);
  });

  it('never goes below 0', () => {
    localStorage.setItem(KEYS.castsToday, JSON.stringify({ date: today, count: 99 }));
    expect(getCastsRemainingToday()).toBe(0);
  });
});

describe('hasUsedAllCastsToday', () => {
  it('returns false on fresh storage', () => {
    expect(hasUsedAllCastsToday()).toBe(false);
  });

  it('returns false after 1 or 2 casts', () => {
    localStorage.setItem(KEYS.castsToday, JSON.stringify({ date: today, count: 2 }));
    expect(hasUsedAllCastsToday()).toBe(false);
  });

  it('returns true after DAILY_CAST_LIMIT casts', () => {
    localStorage.setItem(KEYS.castsToday, JSON.stringify({ date: today, count: DAILY_CAST_LIMIT }));
    expect(hasUsedAllCastsToday()).toBe(true);
  });

  it('returns false when stored date is yesterday (resets each day)', () => {
    localStorage.setItem(KEYS.castsToday, JSON.stringify({ date: yesterday, count: 3 }));
    expect(hasUsedAllCastsToday()).toBe(false);
  });
});

describe('hasPlayedToday (legacy alias)', () => {
  it('mirrors hasUsedAllCastsToday', () => {
    expect(hasPlayedToday()).toBe(false);
    localStorage.setItem(KEYS.castsToday, JSON.stringify({ date: today, count: DAILY_CAST_LIMIT }));
    expect(hasPlayedToday()).toBe(true);
  });
});

// ── Today's catches list ───────────────────────────────────────

describe('loadTodayCatches', () => {
  it('returns [] on fresh storage', () => {
    expect(loadTodayCatches()).toEqual([]);
  });

  it('returns [] when stored date is not today', () => {
    localStorage.setItem(KEYS.todayCatches, JSON.stringify({
      date: yesterday, catches: [{ fishName: 'Bass', rarity: 'common', points: 60 }],
    }));
    expect(loadTodayCatches()).toEqual([]);
  });

  it('returns catch list when date matches today', () => {
    const catches = [{ fishName: 'Bass', rarity: 'common', points: 60 }];
    localStorage.setItem(KEYS.todayCatches, JSON.stringify({ date: today, catches }));
    expect(loadTodayCatches()).toEqual(catches);
  });
});

// ── Best signed result ─────────────────────────────────────────

describe('loadTodayResult', () => {
  it('returns null when nothing stored', () => {
    expect(loadTodayResult()).toBeNull();
  });

  it('returns null and clears storage if result is tampered', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed = addSignature(r);
    signed.points = 999999; // tamper
    localStorage.setItem(KEYS.todayCatch, JSON.stringify(signed));
    expect(loadTodayResult()).toBeNull();
    expect(localStorage.getItem(KEYS.todayCatch)).toBeNull();
  });

  it('returns the result if valid and signed', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed = addSignature(r);
    localStorage.setItem(KEYS.todayCatch, JSON.stringify(signed));
    expect(loadTodayResult()).not.toBeNull();
  });
});

// ── Streak ────────────────────────────────────────────────────

describe('streak', () => {
  it('starts at 0', () => {
    expect(getStreak().count).toBe(0);
  });

  it('first call sets streak to 1', () => {
    const s = updateStreak();
    expect(s.count).toBe(1);
  });

  it('calling twice same day keeps count at 1', () => {
    updateStreak();
    const s = updateStreak();
    expect(s.count).toBe(1);
  });

  it('increments when lastDate was yesterday', () => {
    localStorage.setItem(KEYS.streak, JSON.stringify({ count: 5, lastDate: yesterday }));
    const s = updateStreak();
    expect(s.count).toBe(6);
  });

  it('resets to 1 when lastDate was more than 1 day ago', () => {
    localStorage.setItem(KEYS.streak, JSON.stringify({ count: 20, lastDate: '2020-01-01' }));
    const s = updateStreak();
    expect(s.count).toBe(1);
  });
});

// ── Badges ────────────────────────────────────────────────────

describe('checkAndUnlockBadges', () => {
  it('unlocks first_cast badge when no history exists', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const { newBadges } = checkAndUnlockBadges(r, { count: 1, lastDate: today });
    expect(newBadges.map(b => b.id)).toContain('first_cast');
  });

  it('does not re-unlock first_cast on second play', () => {
    localStorage.setItem(KEYS.catchHistory, JSON.stringify([{ date: yesterday }]));
    const r = buildResult('dock', 'worm', 'safeCast');
    const { newBadges } = checkAndUnlockBadges(r, { count: 2, lastDate: today });
    expect(newBadges.map(b => b.id)).not.toContain('first_cast');
  });

  it('unlocks on_fire at 7-day streak', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const { newBadges } = checkAndUnlockBadges(r, { count: 7, lastDate: today });
    expect(newBadges.map(b => b.id)).toContain('on_fire');
  });

  it('unlocks monster badge for legendary catch', () => {
    const r = { ...buildResult('dock', 'worm', 'safeCast'), rarity: 'legendary' };
    const { newBadges } = checkAndUnlockBadges(r, { count: 1, lastDate: today });
    expect(newBadges.map(b => b.id)).toContain('monster');
  });

  it('does not duplicate badges already earned', () => {
    localStorage.setItem(KEYS.badges, JSON.stringify(['on_fire']));
    const r = buildResult('dock', 'worm', 'safeCast');
    const { newBadges } = checkAndUnlockBadges(r, { count: 7, lastDate: today });
    expect(newBadges.map(b => b.id)).not.toContain('on_fire');
  });
});

// ── recordCastResult ──────────────────────────────────────────

describe('recordCastResult', () => {
  it('increments cast counter', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    recordCastResult(r);
    expect(getCastsUsedToday()).toBe(1);
    recordCastResult(r);
    expect(getCastsUsedToday()).toBe(2);
  });

  it('persists todayCatch and lastPlayDate', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    recordCastResult(r);
    expect(localStorage.getItem(KEYS.lastPlayDate)).toBe(today);
    expect(localStorage.getItem(KEYS.todayCatch)).toBeTruthy();
  });

  it('appends brief summary to todayCatches', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    recordCastResult(r);
    const catches = loadTodayCatches();
    expect(catches).toHaveLength(1);
    expect(catches[0].fishName).toBe(r.fishName);
  });

  it('accumulates totalPoints across multiple saves', () => {
    const r1 = buildResult('dock', 'worm', 'safeCast');
    const r2 = buildResult('dock', 'worm', 'safeCast');
    recordCastResult(r1);
    recordCastResult(r2);
    const total = parseInt(localStorage.getItem(KEYS.totalPoints), 10);
    expect(total).toBe(r1.points + r2.points);
  });

  it('caps catchHistory at 30 entries', () => {
    for (let i = 0; i < 35; i++) {
      recordCastResult(buildResult('dock', 'worm', 'safeCast'));
    }
    const history = JSON.parse(localStorage.getItem(KEYS.catchHistory));
    expect(history.length).toBe(30);
  });

  it('keeps best (highest points) as todayCatch', () => {
    const low  = { ...buildResult('dock', 'worm', 'safeCast'), points: 10 };
    const high = { ...buildResult('dock', 'worm', 'safeCast'), points: 9999 };
    recordCastResult(low);
    recordCastResult(high);
    const best = JSON.parse(localStorage.getItem(KEYS.todayCatch));
    expect(best.points).toBe(9999);
  });
});

describe('saveResult (legacy alias)', () => {
  it('delegates to recordCastResult', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    saveResult(r);
    expect(getCastsUsedToday()).toBe(1);
    expect(localStorage.getItem(KEYS.todayCatch)).toBeTruthy();
  });
});

// ── loadPlayerData ────────────────────────────────────────────

describe('loadPlayerData', () => {
  it('returns correct shape with all expected keys', () => {
    const data = loadPlayerData();
    expect(data).toMatchObject({
      playerId:       expect.any(String),
      streak:         expect.objectContaining({ count: 0 }),
      totalPoints:    0,
      badges:         expect.any(Array),
      castsUsedToday: 0,
      castsRemaining: DAILY_CAST_LIMIT,
      todayCatches:   [],
    });
  });

  it('reflects casts used after recordCastResult', () => {
    recordCastResult(buildResult('dock', 'worm', 'safeCast'));
    const data = loadPlayerData();
    expect(data.castsUsedToday).toBe(1);
    expect(data.castsRemaining).toBe(DAILY_CAST_LIMIT - 1);
  });
});
