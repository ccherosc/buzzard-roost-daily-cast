// src/utils/integrity.js
// Client-side result signing to detect casual localStorage tampering.
//
// INTEGRITY V2: Replace this entire module with server-side validation.
// The server runs buildResult(), returns a signed JWT. The client stores
// the token; Supabase re-validates it before inserting to the DB.
// Client-side signing is removed entirely in V2.

import { RARITIES, POINTS_RANGES } from '../config/gameConfig.js';
import { getFishById } from '../data/fishData.js';

const SALT = 'BuzzardRoost_v1_cast';

/**
 * Generate a signature string from the immutable fields of a result.
 * The sig field itself is NOT included in the payload.
 */
export function signResult(result) {
  const payload = [
    result.date,
    result.fishId,
    result.rarity,
    String(result.points),
    String(result.weight),
  ].join('|');
  return btoa(payload + SALT).replace(/=/g, '');
}

/** Return a new result object with the sig field added. */
export function addSignature(result) {
  // Strip any existing sig before signing to ensure consistency
  const { sig: _ignored, ...unsigned } = result;
  return { ...unsigned, sig: signResult(unsigned) };
}

/**
 * Verify a stored result hasn't been tampered with.
 * Returns true only if ALL checks pass.
 * On any failure the caller should discard the result and allow a re-play.
 */
export function verifyResult(result) {
  if (!result || typeof result !== 'object') return false;

  // 1. Signature check
  if (!result.sig) return false;
  const { sig, ...unsigned } = result;
  if (sig !== signResult(unsigned)) return false;

  // 2. Rarity must be one of the five valid strings
  if (!RARITIES.includes(result.rarity)) return false;

  // 3. Date must not be in the future
  // Both sides use UTC to match the UTC date produced by toISOString().split('T')[0]
  const resultDate = new Date(result.date + 'T00:00:00Z');
  const tomorrow   = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  if (resultDate >= tomorrow) return false;

  // 4. Points within valid range for rarity
  const range = POINTS_RANGES[result.rarity];
  if (!range) return false;
  if (result.points < range.base || result.points > range.base + range.variance) return false;

  // 5. fishId must exist in the database and match the stored rarity
  const fish = getFishById(result.fishId);
  if (!fish) return false;
  if (fish.rarity !== result.rarity) return false;

  // 6. Weight within fish's valid range (allow ±0.05 for float rounding)
  if (result.weight < fish.weightMin - 0.05 || result.weight > fish.weightMax + 0.05) return false;

  return true;
}
