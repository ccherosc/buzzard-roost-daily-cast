// src/utils/storageManager.js
import { addSignature, verifyResult } from './integrity.js';

// ── Storage keys (all namespaced with br_ to avoid collisions) ──
export const KEYS = {
  todayCatch:   'br_todayCatch',
  lastPlayDate: 'br_lastPlayDate',
  streak:       'br_streak',
  bestCatch:    'br_bestCatch',
  totalPoints:  'br_totalPoints',
  catchHistory: 'br_catchHistory',
  playerId:     'br_playerId',
  badges:       'br_badges',
};

const HISTORY_MAX = 30;

export const BADGE_DEFS = {
  first_cast: { emoji: '🎣', label: 'First Cast'        },
  on_fire:    { emoji: '🔥', label: 'On Fire'            },
  dedicated:  { emoji: '💎', label: 'Dedicated Angler'   },
  legend:     { emoji: '👑', label: 'Legend'             },
  first_rare: { emoji: '⭐', label: 'First Rare+'        },
  top_10:     { emoji: '🏆', label: 'Top 10'             },
  monster:    { emoji: '🦈', label: 'Monster Hunter'     },
};

// ── Helpers ────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ── Player ID ──────────────────────────────────────────────────
export function getPlayerId() {
  let id = localStorage.getItem(KEYS.playerId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.playerId, id);
  }
  return id;
}

// ── Daily play guard ───────────────────────────────────────────
export function hasPlayedToday() {
  return localStorage.getItem(KEYS.lastPlayDate) === todayStr();
}

// ── Load today's result (validates integrity on load) ─────────
export function loadTodayResult() {
  const raw = localStorage.getItem(KEYS.todayCatch);
  if (!raw) return null;
  try {
    const result = JSON.parse(raw);
    if (!verifyResult(result)) {
      // Tampered or corrupted — clear and allow re-play
      localStorage.removeItem(KEYS.todayCatch);
      localStorage.removeItem(KEYS.lastPlayDate);
      return null;
    }
    return result;
  } catch {
    localStorage.removeItem(KEYS.todayCatch);
    localStorage.removeItem(KEYS.lastPlayDate);
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

/**
 * Check which new badges are unlocked and persist the updated list.
 * Call BEFORE saveResult() so the first_cast check works correctly.
 * Returns { earnedIds: string[], newBadges: { id, emoji, label }[] }
 */
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

  // First cast ever (history not yet written)
  if (!localStorage.getItem(KEYS.catchHistory)) unlock('first_cast');

  // Streak milestones
  if (streak.count >= 7)   unlock('on_fire');
  if (streak.count >= 30)  unlock('dedicated');
  if (streak.count >= 100) unlock('legend');

  // Rarity-based
  if (['rare', 'epic', 'legendary'].includes(result.rarity)) unlock('first_rare');
  if (result.rarity === 'legendary')                          unlock('monster');

  localStorage.setItem(KEYS.badges, JSON.stringify(earned));
  return { earnedIds: earned, newBadges };
}

// ── Save result ───────────────────────────────────────────────
export function saveResult(result) {
  const signed = addSignature(result);
  const today  = todayStr();

  localStorage.setItem(KEYS.todayCatch,   JSON.stringify(signed));
  localStorage.setItem(KEYS.lastPlayDate, today);

  // Accumulate total points
  const prev = parseInt(localStorage.getItem(KEYS.totalPoints) ?? '0', 10);
  localStorage.setItem(KEYS.totalPoints, String(prev + result.points));

  // Update best catch
  const bestRaw = localStorage.getItem(KEYS.bestCatch);
  const best    = bestRaw ? JSON.parse(bestRaw) : null;
  if (!best || result.points > best.points) {
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

  // SUPABASE: save result to database
  // In V2, add here:
  //   await supabase.from('catches').insert({ player_id: getPlayerId(), ...result })

  return signed;
}

// ── Load all player data (used on app mount) ──────────────────
export function loadPlayerData() {
  return {
    playerId:    getPlayerId(),
    streak:      getStreak(),
    bestCatch:   (() => { const r = localStorage.getItem(KEYS.bestCatch); return r ? JSON.parse(r) : null; })(),
    totalPoints: parseInt(localStorage.getItem(KEYS.totalPoints) ?? '0', 10),
    badges:      getBadges(),
  };
}

// AUTH V2: link playerId to a real user account.
// Replace getPlayerId() with: supabase.auth.getUser() or Shopify customer ID.
