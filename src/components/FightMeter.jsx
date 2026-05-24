// src/components/FightMeter.jsx
// Band fight mechanic — keep the cursor inside the safe band by tapping to reel.
//
// ── Mechanics ──────────────────────────────────────────────────────────────────
// • Cursor drifts RIGHT naturally (fish pulling).  Tapping pushes it LEFT.
// • Goal: keep cursor inside the golden SAFE BAND.
// • Too far LEFT (past band edge + buffer) → LINE BREAKS — no fish.
// • Too far RIGHT (past band edge + buffer) → FISH ESCAPES — no fish.
// • Survive the timer → fish landed.
//
// ── Difficulty (spot × lure × cast × rarity) ──────────────────────────────────
// • easy   → wide band, stationary
// • medium → medium band, drifts right slowly during the fight
// • hard   → narrow band, jumps right on each fish surge
//
// ── Mobile notes ─────────────────────────────────────────────────────────────
// Cursor position is driven by DIRECT DOM mutation (cursorRef.current.style.transform)
// rather than React state, so animation is always 60fps on mobile regardless of
// React's render batching.  dt is capped at 100ms to survive RAF pauses.
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import './FightMeter.css';

const DEFAULTS = {
  FIGHT_DURATION_MS:  8000,
  DRIFT_RATE:         0.00015,
  REEL_POWER:         0.12,
  SURGE_INTERVAL_MIN: 2000,
  SURGE_INTERVAL_MAX: 4000,
  SURGE_AMOUNT:       0.15,
};

// After a primary surge, rarity-based chance of a quick cluster follow-up
const CLUSTER = {
  legendary: { chance: 0.40, minMs: 500,  maxMs: 800  },
  epic:      { chance: 0.25, minMs: 700,  maxMs: 1000 },
  rare:      { chance: 0.10, minMs: 900,  maxMs: 1200 },
};

const BAND_CENTER_START = 0.40;   // indicator + band center start here
const CURSOR_HALF_PX    = 11;     // half of .fm__cursor width (22px / 2)

export default function FightMeter({
  config,
  rarity      = 'common',
  spotId,
  lureId,
  castStyleId,
  onComplete,
}) {
  const cfg = { ...DEFAULTS, ...config };

  // ── Difficulty → band parameters ─────────────────────────────────────────
  const { BAND_HALF, BUFFER, BAND_DRIFT_RATE, BAND_JUMP } = useMemo(() => {
    const S = {
      spot:   { dock:0, reeds:1, rockyBank:2, fallenTree:2, deepWater:3 },
      lure:   { worm:0, spinner:1, jig:2, frog:2, mysteryLure:3 },
      cast:   { safeCast:0, precisionCast:1, powerCast:2, riskyCast:3 },
      rarity: { common:0, uncommon:1, rare:2, epic:3, legendary:4 },
    };
    const diffN =
      ((S.spot[spotId] ?? 1) + (S.lure[lureId] ?? 1) + (S.cast[castStyleId] ?? 1)) / 9 * 0.5 +
      (S.rarity[rarity] ?? 1) / 4 * 0.5;

    const tier = diffN < 0.33 ? 'easy' : diffN < 0.66 ? 'medium' : 'hard';
    return {
      BAND_HALF:       Math.max(0.075, 0.175 - diffN * 0.100),  // 0.175 → 0.075
      BUFFER:          Math.max(0.150, 0.220 - diffN * 0.070),  // 0.220 → 0.150
      BAND_DRIFT_RATE: tier === 'medium' ? 0.000018 : 0,
      BAND_JUMP:       tier === 'hard'   ? 0.08     : 0,
    };
  }, [spotId, lureId, castStyleId, rarity]);

  // ── State (React renders) ─────────────────────────────────────────────────
  // indicator + bandCenter are ALSO kept as refs for real-time cursor DOM updates.
  // React state is only used for derived warning-zone classes + band zone widths.
  const [indicator,    setIndicator]    = useState(BAND_CENTER_START);
  const [bandCenter,   setBandCenter]   = useState(BAND_CENTER_START);
  const [timeLeft,     setTimeLeft]     = useState(1);
  const [phase,        setPhase]        = useState('fighting');  // fighting|won|broke|escaped
  const [surging,      setSurging]      = useState(false);
  const [comboActive,  setComboActive]  = useState(false);
  const [perfectFlash, setPerfectFlash] = useState(false);
  const [counterFlash, setCounterFlash] = useState(false);
  const [fishDepth,    setFishDepth]    = useState(BAND_CENTER_START);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const cursorRef         = useRef(null);     // direct DOM handle for cursor
  const timeFillRef       = useRef(null);     // direct DOM handle for time bar fill
  const indicatorRef      = useRef(BAND_CENTER_START);
  const bandCenterRef     = useRef(BAND_CENTER_START);
  const lastTickRef       = useRef(null);
  const safeTimeRef       = useRef(0);
  const totalTimeRef      = useRef(0);
  const doneRef           = useRef(false);
  const rafRef            = useRef(null);
  const startRef          = useRef(null);
  const surgeRef          = useRef(null);
  const surgeTimestampRef = useRef(-Infinity);
  const tapTimestampsRef  = useRef([]);
  const comboTimeoutRef   = useRef(null);

  // ── DOM helpers (bypasses React render for 60fps on mobile) ───────────────
  const moveCursor = useCallback((value) => {
    if (!cursorRef.current) return;
    const p = Math.max(0, Math.min(100, value * 100));
    cursorRef.current.style.transform =
      `translate3d(calc(${p.toFixed(2)}% - ${CURSOR_HALF_PX}px), -50%, 0)`;
  }, []);

  const setTimeFill = useCallback((fraction) => {
    if (timeFillRef.current) {
      timeFillRef.current.style.width = `${(fraction * 100).toFixed(1)}%`;
    }
  }, []);

  // ── Finish ────────────────────────────────────────────────────────────────
  const finish = useCallback((outcome) => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    clearTimeout(surgeRef.current);
    clearTimeout(comboTimeoutRef.current);
    const quality = outcome === 'won'
      ? (totalTimeRef.current > 0 ? Math.min(1, safeTimeRef.current / totalTimeRef.current) : 0.5)
      : 0;
    setPhase(outcome);
    setTimeout(() => onComplete({ quality, outcome }), 900);
  }, [onComplete]);

  // ── Fire a surge ─────────────────────────────────────────────────────────
  const fireSurge = useCallback((amount) => {
    if (doneRef.current) return;
    indicatorRef.current = Math.min(1, indicatorRef.current + amount);
    moveCursor(indicatorRef.current);
    setIndicator(indicatorRef.current);
    setFishDepth(Math.min(1, indicatorRef.current * 1.2));
    surgeTimestampRef.current = Date.now();
    setSurging(true);
    setTimeout(() => { if (!doneRef.current) setSurging(false); }, 500);

    // Hard tier: band jumps right on each surge
    if (BAND_JUMP > 0) {
      const maxC = 1 - BAND_HALF - BUFFER - 0.02;
      bandCenterRef.current = Math.min(maxC, bandCenterRef.current + BAND_JUMP);
      setBandCenter(bandCenterRef.current);
    }

    // Cluster surge (rarity-based follow-up jolt)
    const cluster = CLUSTER[rarity];
    if (cluster && Math.random() < cluster.chance) {
      const delay = cluster.minMs + Math.random() * (cluster.maxMs - cluster.minMs);
      setTimeout(() => {
        if (doneRef.current) return;
        indicatorRef.current = Math.min(1, indicatorRef.current + amount * 0.65);
        moveCursor(indicatorRef.current);
        setIndicator(indicatorRef.current);
        setFishDepth(Math.min(1, indicatorRef.current * 1.2));
        surgeTimestampRef.current = Date.now();
        setSurging(true);
        setTimeout(() => { if (!doneRef.current) setSurging(false); }, 400);
        if (BAND_JUMP > 0) {
          const maxC = 1 - BAND_HALF - BUFFER - 0.02;
          bandCenterRef.current = Math.min(maxC, bandCenterRef.current + BAND_JUMP * 0.5);
          setBandCenter(bandCenterRef.current);
        }
      }, delay);
    }
  }, [BAND_JUMP, BAND_HALF, BUFFER, rarity, moveCursor]);

  // ── Surge scheduler ───────────────────────────────────────────────────────
  const scheduleSurge = useCallback(() => {
    if (doneRef.current) return;
    const interval = cfg.SURGE_INTERVAL_MIN +
      Math.random() * (cfg.SURGE_INTERVAL_MAX - cfg.SURGE_INTERVAL_MIN);
    surgeRef.current = setTimeout(() => {
      fireSurge(cfg.SURGE_AMOUNT);
      scheduleSurge();
    }, interval);
  }, [cfg.SURGE_INTERVAL_MIN, cfg.SURGE_INTERVAL_MAX, cfg.SURGE_AMOUNT, fireSurge]);

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Set initial cursor position without waiting for a render
    moveCursor(BAND_CENTER_START);

    function tick(ts) {
      if (!startRef.current) { startRef.current = ts; lastTickRef.current = ts; }
      // Cap dt at 100ms — prevents huge jumps if RAF was paused (notification, tab switch)
      const dt = Math.min(ts - lastTickRef.current, 100);
      lastTickRef.current = ts;
      totalTimeRef.current += dt;

      const elapsed   = ts - startRef.current;
      const remaining = Math.max(0, cfg.FIGHT_DURATION_MS - elapsed) / cfg.FIGHT_DURATION_MS;

      // Time bar — direct DOM update
      setTimeFill(remaining);
      setTimeLeft(remaining);  // React state for phase-done check

      // Cursor drifts right (fish pulling) — direct DOM update + ref
      indicatorRef.current = Math.min(1, indicatorRef.current + cfg.DRIFT_RATE * dt);
      moveCursor(indicatorRef.current);
      // Update React state less aggressively (only for warning zone classes)
      setIndicator(indicatorRef.current);
      setFishDepth(Math.min(1, indicatorRef.current * 1.2));

      // Band drifts right (medium tier only)
      if (BAND_DRIFT_RATE > 0) {
        const maxC = 1 - BAND_HALF - BUFFER - 0.02;
        bandCenterRef.current = Math.min(maxC, bandCenterRef.current + BAND_DRIFT_RATE * dt);
        setBandCenter(bandCenterRef.current);
      }

      // Zone edges
      const bandLeft  = bandCenterRef.current - BAND_HALF;
      const bandRight = bandCenterRef.current + BAND_HALF;
      const breakAt   = bandLeft  - BUFFER;
      const escapeAt  = bandRight + BUFFER;

      if (indicatorRef.current >= bandLeft && indicatorRef.current <= bandRight) {
        safeTimeRef.current += dt;
      }

      if (indicatorRef.current <= breakAt)  { finish('broke');   return; }
      if (indicatorRef.current >= escapeAt) { finish('escaped'); return; }
      if (remaining <= 0)                   { finish('won');     return; }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    scheduleSurge();
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(surgeRef.current);
    };
  }, [finish, scheduleSurge, moveCursor, setTimeFill,
      cfg.FIGHT_DURATION_MS, cfg.DRIFT_RATE, BAND_HALF, BUFFER, BAND_DRIFT_RATE]);

  // ── Tap handler ───────────────────────────────────────────────────────────
  function handleReel() {
    if (doneRef.current || phase !== 'fighting') return;
    const now = Date.now();

    tapTimestampsRef.current = tapTimestampsRef.current.filter(t => now - t < 800);
    tapTimestampsRef.current.push(now);
    const isCombo = tapTimestampsRef.current.length >= 3;
    setComboActive(isCombo);
    clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => {
      setComboActive(false);
      tapTimestampsRef.current = [];
    }, 1200);

    const msSinceSurge = now - surgeTimestampRef.current;
    const inRightWarn  = indicatorRef.current > bandCenterRef.current + BAND_HALF;
    const isCounter    = msSinceSurge >= 0 && msSinceSurge <= 200 && inRightWarn;
    const isPerfect    = !isCounter && msSinceSurge > 0 && msSinceSurge <= 350;

    let power = cfg.REEL_POWER;
    if (isCombo)   power *= 1.5;
    if (isPerfect) power *= 1.8;
    if (isCounter) power *= 2.5;

    indicatorRef.current = Math.max(0, indicatorRef.current - power);
    moveCursor(indicatorRef.current);   // direct DOM update — immediate on mobile
    setIndicator(indicatorRef.current); // React state for warning zone classes

    if (isPerfect) { setPerfectFlash(true); setTimeout(() => setPerfectFlash(false), 600); }
    if (isCounter) { setCounterFlash(true); setTimeout(() => setCounterFlash(false), 750); }
  }

  // ── Derived display values ────────────────────────────────────────────────
  const bandLeft  = bandCenter - BAND_HALF;
  const bandRight = bandCenter + BAND_HALF;
  const breakAt   = Math.max(0,    bandLeft  - BUFFER);
  const escapeAt  = Math.min(0.99, bandRight + BUFFER);

  const leftWarn  = indicator < bandLeft  && indicator >= breakAt;
  const rightWarn = indicator > bandRight && indicator <= escapeAt;
  const panicMode = leftWarn || rightWarn;

  const pct = (v) => `${Math.max(0, Math.min(100, v * 100)).toFixed(2)}%`;

  const msg = counterFlash
    ? { text: '💥 COUNTER!',             cls: 'fm__msg--counter' }
    : perfectFlash
      ? { text: '⚡ PERFECT!',           cls: 'fm__msg--perfect' }
      : surging
        ? { text: '🐟 Fish surging!',    cls: 'fm__msg--surge'   }
        : comboActive
          ? { text: '🔥 COMBO ×1.5',    cls: 'fm__msg--combo'   }
          : leftWarn
            ? { text: '⬆️ Ease off! Too tight!',    cls: 'fm__msg--warn-l' }
            : rightWarn
              ? { text: '⬇️ Reel! Fish is running!', cls: 'fm__msg--warn-r' }
              : { text: 'Hold the zone!',             cls: ''                };

  return (
    <div
      className={`fm fm--${phase}${surging ? ' fm--surge' : ''}${panicMode ? ' fm--panic' : ''}`}
      onClick={handleReel}
      onTouchStart={(e) => { e.preventDefault(); handleReel(); }}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleReel()}
      aria-label="Fight meter — tap to reel!"
    >
      {phase === 'fighting' && (
        <>
          <p className="fm__label">⚡ TAP TO REEL!</p>

          <div className="fm__messages">
            <p className={`fm__msg ${msg.cls}`}>{msg.text}</p>
          </div>

          {/* Time countdown — fill driven directly via ref */}
          <div className="fm__time-bar">
            <div className="fm__time-fill" ref={timeFillRef} />
          </div>

          {/* Band track */}
          <div className="fm__band-outer">
            <div className="fm__band-track">
              {/* Left warn zone */}
              <div className="fm__bz fm__bz--warn" style={{
                left:  pct(breakAt),
                width: pct(bandLeft - breakAt),
              }} />
              {/* Safe band */}
              <div className="fm__bz fm__bz--safe" style={{
                left:  pct(bandLeft),
                width: pct(BAND_HALF * 2),
              }} />
              {/* Right warn zone */}
              <div className="fm__bz fm__bz--warn" style={{
                left:  pct(bandRight),
                width: pct(escapeAt - bandRight),
              }} />
            </div>
            {/* Cursor — position driven via direct DOM mutation, not React style prop */}
            <div className="fm__cursor" ref={cursorRef} />
          </div>

          <div className="fm__band-hint">
            <span className="fm__bh-l">← SNAP</span>
            <span className="fm__bh-c">HOLD THE ZONE</span>
            <span className="fm__bh-r">ESCAPE →</span>
          </div>

          <div className="fm__depth-bar">
            <span className="fm__depth-label">DEPTH</span>
            <div className="fm__depth-track">
              <span className="fm__depth-fish" style={{ left: `${Math.min(88, fishDepth * 90)}%` }}>🐟</span>
            </div>
          </div>

          <p className="fm__hint">Tap · Click · Space · Enter</p>
        </>
      )}

      {phase === 'won' && (
        <div className="fm__feedback fm__feedback--won">
          <span className="fm__icon">🎣</span>
          <p className="fm__result">Fish Landed!</p>
        </div>
      )}
      {phase === 'broke' && (
        <div className="fm__feedback fm__feedback--broke">
          <span className="fm__icon">💔</span>
          <p className="fm__result">Line Broke!</p>
          <p className="fm__sub">Too much pressure — the line snapped</p>
        </div>
      )}
      {phase === 'escaped' && (
        <div className="fm__feedback fm__feedback--escaped">
          <span className="fm__icon">🐟</span>
          <p className="fm__result">Fish Escaped!</p>
          <p className="fm__sub">Didn't reel fast enough</p>
        </div>
      )}
    </div>
  );
}
