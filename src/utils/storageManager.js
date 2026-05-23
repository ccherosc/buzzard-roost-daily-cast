// src/utils/storageManager.js  – V2 (3-casts-per-day system)
import { addSignature, verifyResult } from './integrity.js';
import { DAILY_CAST_LIMIT } from '../config/gameConfig.js';

export const KEYS = {
  todayCatch:   'br_todayCatch',    // best signed result today
  lastPlayDate: 'br_lastPlayDate',  // date of last completed cast set
  streak:       'br_streak',
  bestCatch:    'br_bestCatch',
  totalPoints:  'br_totalPoints',
  catchHistory: 'br_catchHistory',
  playerId:     'br_playerId',
  badges:       'br_badges',
  castsToday:   'br_castsToday',    // { date, count } — casts used today
  todayCatches: 'br_todayCatches',  // { date, catches[] } — brief summaries
};

const HISTORY_MAX = 30;

export const BADGE_DEFS = {
  first_cast: { emoji: '🎣', label: 'First Cast'        },
  on_fire:    { emoji: '🔥', label: 'On Fire'            },
  dedicated:  { emoji: '💎', label: 'Dedicated Angler'   },
  legend:     { emoji: '👑', label: 'Legend'             },
  first_rare: { emoji: '⭐', label: 'First Rare+'        },
  monster:    { emoji: '🦈', label: 'Monster Hunter'     },
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function yesterdayStr() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

// ── Player ID ─────────────────────────────────────────────────
export function getPlayerId() {
  let id = localStorage.getItem(KEYS.playerId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.playerId, id);
  }
  return id;
}

// ── 3-cast daily system ───────────────────────────────────────
export function getCastsUsedToday() {
  const raw = localStorage.getItem(KEYS.castsToday);
  if (!raw) return 0;
  const { date, count } = JSON.parse(raw);
  return date === todayStr() ? count : 0;
}

export function getCastsRemainingToday() {
  return Math.max(0, DAILY_CAST_LIMIT - getCastsUsedToday());
}

export function hasUsedAllCastsToday() {
  return getCastsUsedToday() >= DAILY_CAST_LIMIT;
}

/** Legacy alias — kept for backwards compat with tests. */
export function hasPlayedToday() {
  return hasUsedAllCastsToday();
}

// ── Today's catches ───────────────────────────────────────────
export function loadTodayCatches() {
  const raw = localStorage.getItem(KEYS.todayCatches);
  if (!raw) return [];
  const { date, catches } = JSON.parse(raw);
  return date === todayStr() ? catches : [];
}

// ── Best signed result today ──────────────────────────────────
export function loadTodayResult() {
  const raw = localStorage.getItem(KEYS.todayCatch);
  if (!raw) return null;
  try {
    const result = JSON.parse(raw);
    if (!verifyResult(result)) {
      localStorage.removeItem(KEYS.todayCatch);
      return null;
    }
    return result;
  } catch {
    localStorage.removeItem(KEYS.todayCatch);
    return null;
  }
}

// ── Streak ────────────────────────────────────────────────────
export function getStreak() {
  const raw = localStorage.getItem(KEYS.streak);
  return raw ? JSON.parse(raw) : { count: 0, lastDate: null };
}

export function updateStreak() {
  const streak    = getStreak();
  const today     = todayStr();
  const yesterday = yesterdayStr();

  if (streak.lastDate === today)           { /* same day — no-op */ }
  else if (streak.lastDate === yesterday)  { streak.count += 1; }
  else                                     { streak.count = 1; }

  streak.lastDate = today;
  localStorage.setItem(KEYS.streak, JSON.stringify(streak));
  return streak;
}

// ── Badges ────────────────────────────────────────────────────
export function getBadges() {
  const raw    = localStorage.getItem(KEYS.badges);
  const earned = raw ? JSON.parse(raw) : [];
  return earned.map(id => ({ id, ...(BADGE_DEFS[id] ?? {}) })).filter(b => b.emoji);
}

export function checkAndUnlockBadges(result, streak) {
  const raw    = localStorage.getItem(KEYS.badges);
  const earned = raw ? JSON.parse(raw) : [];
  const newBadges = [];

  const unlock = (id) => {
    if (!earned.includes(id)) {
      earned.push(id);
      newBadges.push({ id, ...BADGE_DEFS[id] });
    }
  };

  if (!localStorage.getItem(KEYS.catchHistory)) unlock('first_cast');
  if (streak.count >= 7)   unlock('on_fire');
  if (streak.count >= 30)  unlock('dedicated');
  if (streak.count >= 100) unlock('legend');
  if (['rare', 'epic', 'legendary'].includes(result.rarity)) unlock('first_rare');
  if (result.rarity === 'legendary') unlock('monster');

  localStorage.setItem(KEYS.badges, JSON.stringify(earned));
  return { earnedIds: earned, newBadges };
}

// ── Record a single cast result ───────────────────────────────
export function recordCastResult(result) {
  const today = todayStr();

  // Increment cast counter
  const used = getCastsUsedToday() + 1;
  localStorage.setItem(KEYS.castsToday, JSON.stringify({ date: today, count: used }));

  // Append brief summary to today's catches
  const raw     = localStorage.getItem(KEYS.todayCatches);
  const todayObj = (raw && JSON.parse(raw).date === today) ? JSON.parse(raw) : { date: today, catches: [] };
  todayObj.catches.push({
    fishName: result.fishName,
    fishId:   result.fishId,
    rarity:   result.rarity,
    points:   result.points,
    weight:   result.weight,
  });
  localStorage.setItem(KEYS.todayCatches, JSON.stringify(todayObj));

  // Save as best today if it beats the current best
  const bestRaw = localStorage.getItem(KEYS.todayCatch);
  const best    = bestRaw ? (() => { try { return JSON.parse(bestRaw); } catch { return null; } })() : null;
  if (!best || !verifyResult(best) || result.points > (best.points ?? 0)) {
    const signed = addSignature(result);
    localStorage.setItem(KEYS.todayCatch,   JSON.stringify(signed));
    localStorage.setItem(KEYS.lastPlayDate, today);
  }

  // Accumulate total points
  const prev = parseInt(localStorage.getItem(KEYS.totalPoints) ?? '0', 10);
  localStorage.setItem(KEYS.totalPoints, String(prev + result.points));

  // All-time best catch
  const allBestRaw = localStorage.getItem(KEYS.bestCatch);
  const allBest    = allBestRaw ? JSON.parse(allBestRaw) : null;
  if (!allBest || result.points > allBest.points) {
    localStorage.setItem(KEYS.bestCatch, JSON.stringify({
      fishName: result.fishName,
      rarity:   result.rarity,
      points:   result.points,
      date:     result.date,
    }));
  }

  // Prepend to history, cap at HISTORY_MAX
  const histRaw = localStorage.getItem(KEYS.catchHistory);
  const history = histRaw ? JSON.parse(histRaw) : [];
  history.unshift({ date: result.date, fishName: result.fishName, rarity: result.rarity, points: result.points });
  if (history.length > HISTORY_MAX) history.splice(HISTORY_MAX);
  localStorage.setItem(KEYS.catchHistory, JSON.stringify(history));

  return result;
}

/** Legacy alias so old test files still compile. */
export function saveResult(result) {
  return recordCastResult(result);
}

// ── Load all player data ──────────────────────────────────────
export function loadPlayerData() {
  return {
    playerId:         getPlayerId(),
    streak:           getStreak(),
    bestCatch:        (() => { const r = localStorage.getItem(KEYS.bestCatch); return r ? JSON.parse(r) : null; })(),
    totalPoints:      parseInt(localStorage.getItem(KEYS.totalPoints) ?? '0', 10),
    badges:           getBadges(),
    castsUsedToday:   getCastsUsedToday(),
    castsRemaining:   getCastsRemainingToday(),
    todayCatches:     loadTodayCatches(),
  };
}
