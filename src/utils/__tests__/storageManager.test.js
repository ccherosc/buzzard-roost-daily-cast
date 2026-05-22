// @vitest-environment jsdom
// src/utils/__tests__/storageManager.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import {
  hasPlayedToday, loadTodayResult, getStreak, updateStreak,
  checkAndUnlockBadges, saveResult, getBadges, loadPlayerData, KEYS,
} from '../storageManager.js';
import { buildResult } from '../gameLogic.js';
import { addSignature } from '../integrity.js';

beforeEach(() => localStorage.clear());

const today     = new Date().toISOString().split('T')[0];
const yesterday = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split('T')[0]; })();

describe('hasPlayedToday', () => {
  it('returns false on fresh storage', () => {
    expect(hasPlayedToday()).toBe(false);
  });

  it('returns true after saving lastPlayDate as today', () => {
    localStorage.setItem(KEYS.lastPlayDate, today);
    expect(hasPlayedToday()).toBe(true);
  });

  it('returns false when lastPlayDate is yesterday', () => {
    localStorage.setItem(KEYS.lastPlayDate, yesterday);
    expect(hasPlayedToday()).toBe(false);
  });
});

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
    // Force a legendary result by direct construction
    const r = { ...buildResult('dock', 'worm', 'safeCast'), rarity: 'legendary', fishId: 'golden_trout', fishName: 'Golden Trout' };
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

describe('saveResult', () => {
  it('persists todayCatch and lastPlayDate', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    saveResult(r);
    expect(localStorage.getItem(KEYS.lastPlayDate)).toBe(today);
    expect(localStorage.getItem(KEYS.todayCatch)).toBeTruthy();
  });

  it('accumulates totalPoints across multiple saves', () => {
    const r1 = buildResult('dock', 'worm', 'safeCast');
    const r2 = buildResult('dock', 'worm', 'safeCast');
    saveResult(r1);
    saveResult(r2);
    const total = parseInt(localStorage.getItem(KEYS.totalPoints), 10);
    expect(total).toBe(r1.points + r2.points);
  });

  it('caps catchHistory at 30 entries', () => {
    for (let i = 0; i < 35; i++) {
      saveResult(buildResult('dock', 'worm', 'safeCast'));
    }
    const history = JSON.parse(localStorage.getItem(KEYS.catchHistory));
    expect(history.length).toBe(30);
  });
});
