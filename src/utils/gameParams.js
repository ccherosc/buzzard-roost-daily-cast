// src/utils/gameParams.js
// Builds per-minigame config objects from the player's spot/lure/cast selections + fish rarity.
// Called in App.jsx after SetupScreen fires onComplete; result passed as gameParams prop to DailyCastGame.

export function buildGameParams(spotId, lureId, castStyleId, rarity = 'common') {
  return {
    castMeter:  buildCastMeterConfig(spotId, lureId, castStyleId),
    biteTiming: buildBiteTimingConfig(spotId, lureId, castStyleId),
    fightMeter: buildFightMeterConfig(spotId, lureId, rarity),
  };
}

function buildCastMeterConfig(spotId, lureId, castStyleId) {
  const durationMap = {
    safeCast: 2000, precisionCast: 1400, powerCast: 1100, riskyCast: 900,
  };
  let DURATION_MS = durationMap[castStyleId] ?? 1400;

  const zoneMap = {
    safeCast: 0.36, precisionCast: 0.28, powerCast: 0.28, riskyCast: 0.20,
  };
  let SWEET_ZONE = zoneMap[castStyleId] ?? 0.28;

  if (lureId === 'worm')        SWEET_ZONE = Math.min(0.50, SWEET_ZONE + 0.04);
  if (lureId === 'mysteryLure') SWEET_ZONE = Math.max(0.08, SWEET_ZONE - 0.06);

  const sweetOffset = spotId === 'deepWater' ? 0.15 : 0;

  return { DURATION_MS, SWEET_ZONE, sweetOffset };
}

function buildBiteTimingConfig(spotId, lureId, castStyleId) {
  const waitMap = {
    frog:        { min: 400,  max: 1200 },
    worm:        { min: 2500, max: 5500 },
    mysteryLure: { min: 200,  max: 6000 },
  };
  const wait = waitMap[lureId] ?? { min: 1500, max: 4000 };

  const windowMap = { dock: 1000, reeds: 550, deepWater: 700 };
  const WINDOW_MS = windowMap[spotId] ?? 800;

  return {
    WAIT_MIN_MS:      wait.min,
    WAIT_MAX_MS:      wait.max,
    WINDOW_MS,
    showPreBiteCue:   castStyleId === 'precisionCast',
    noPreBiteWarning: castStyleId === 'riskyCast',
  };
}

function buildFightMeterConfig(spotId, lureId, rarity) {
  const driftMap = {
    common: 0.00010, uncommon: 0.00013, rare: 0.00016, epic: 0.00020, legendary: 0.00026,
  };
  const surgeAmountMap = {
    common: 0.10, uncommon: 0.14, rare: 0.18, epic: 0.22, legendary: 0.28,
  };
  const intervalMinMap = { dock: 3000, deepWater: 1500, rockyBank: 1200 };
  const tensionMap     = { frog: 0.45, worm: 0.20 };

  const SURGE_INTERVAL_MIN = intervalMinMap[spotId] ?? 2000;

  return {
    FIGHT_DURATION_MS:  8000,
    DRIFT_RATE:         driftMap[rarity]       ?? 0.00015,
    REEL_POWER:         0.12,
    SAFE_MAX:           0.65,
    BREAK_MAX:          0.95,
    SURGE_INTERVAL_MIN,
    SURGE_INTERVAL_MAX: SURGE_INTERVAL_MIN + 2000,
    SURGE_AMOUNT:       surgeAmountMap[rarity] ?? 0.15,
    startingTension:    tensionMap[lureId]     ?? 0.30,
  };
}
