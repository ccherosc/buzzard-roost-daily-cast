// src/utils/leaderboardApi.js
// Leaderboard API: player identity, catch submission, leaderboard fetch, inline rename.
// All Supabase errors are swallowed — this is a free-to-play game; network failures
// must never surface to the player as errors.
import { supabase }    from './supabase.js';
import { getPlayerId } from './storageManager.js';

const DISPLAY_NAME_KEY = 'brdc_display_name';

/**
 * Returns the player's display name from localStorage.
 * If none is stored, generates "Angler_XXXX" from the last 4 chars of their UUID
 * and persists it to localStorage.
 */
export function getDisplayName() {
  const stored = localStorage.getItem(DISPLAY_NAME_KEY);
  if (stored) return stored;

  const playerId = getPlayerId();                        // creates UUID if missing
  const suffix   = playerId.slice(-4);
  const name     = `Angler_${suffix}`;
  localStorage.setItem(DISPLAY_NAME_KEY, name);
  return name;
}

/**
 * Fire-and-forget: upsert the player record then insert the catch.
 * Any error (network or Supabase API) is silently swallowed.
 * localStorage has already been updated before this is called.
 */
export async function submitCatch(result) {
  try {
    const playerId    = getPlayerId();
    const displayName = getDisplayName();
    const now         = new Date().toISOString();

    await supabase.from('players').upsert(
      { player_id: playerId, display_name: displayName, last_seen_at: now },
      { onConflict: 'player_id' },
    );

    await supabase.from('catches').insert({
      player_id:     playerId,
      fish_name:     result.fishName,
      rarity:        result.rarity,
      weight_lbs:    result.weight,
      points:        result.points,
      spot_id:       result.spot       ?? null,
      lure_id:       result.lure       ?? null,
      cast_style_id: result.castStyle  ?? null,
      caught_at:     now,
    });
  } catch {
    // Fire-and-forget: silently swallow all errors
  }
}

/**
 * Fetch the leaderboard for the given period.
 * period: 'today' | 'week' | 'alltime'
 * Returns an array of rows, or [] on any error.
 */
export async function fetchLeaderboard(period) {
  try {
    const { data, error } = await supabase.rpc('get_leaderboard', { period });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Rename the current player.
 * Validates: non-empty, max 20 chars, alphanumeric + underscores + spaces only.
 * Returns true on success, false on validation failure or Supabase error.
 * Only updates localStorage after a successful Supabase upsert.
 */
export async function renamePlayer(displayName) {
  const trimmed = displayName.trim();
  if (!trimmed)               return false;
  if (trimmed.length > 20)    return false;
  if (!/^[\w\s]+$/.test(trimmed)) return false;   // \w = [a-zA-Z0-9_], \s = spaces

  try {
    const playerId = getPlayerId();
    const { error } = await supabase.from('players').upsert(
      { player_id: playerId, display_name: trimmed, last_seen_at: new Date().toISOString() },
      { onConflict: 'player_id' },
    );
    if (error) return false;

    localStorage.setItem(DISPLAY_NAME_KEY, trimmed);
    return true;
  } catch {
    return false;
  }
}
