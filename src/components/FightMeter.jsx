// src/components/FightMeter.jsx
// Tension bar — tap to reel. Fish surges add tension spikes.
// ── Features ──────────────────────────────────────────────────────────────────
// 1. Screen shake on surge             (CSS keyframe via fm--surge class)
// 2. Proximity panic mode              (inset red glow when tension ≥ 85%)
// 3. Perfect reel window               (tap 1–350 ms after surge → 1.8× power)
// 4. Reel combo                        (≥3 taps in 800 ms → 1.5× power, stacks)
// 5. Fish depth bar                    (fish sinks right as tension rises)
// 6. Rarity cluster surges             (epic 25%, legendary 40% follow-up surge)
// 7. Counter-surge                     (tap ≤200 ms after surge + tension ≥ 72% → 2.5×)
import { useRef, useEffect, useState, useCallback } from 'react';
import './FightMeter.css';

const DEFAULTS = {
  FIGHT_DURATION_MS:  8000,
  DRIFT_RATE:         0.00015,
  REEL_POWER:         0.12,
  SAFE_MAX:           0.65,
  BREAK_MAX:          0.95,
  SURGE_INTERVAL_MIN: 2000,
  SURGE_INTERVAL_MAX: 4000,
  SURGE_AMOUNT:       0.15,
  startingTension:    0.30,
};

// After a primary surge, rarity-specific chance of a quick follow-up cluster
const CLUSTER = {
  legendary: { chance: 0.40, minMs: 500,  maxMs: 800  },
  epic:      { chance: 0.25, minMs: 700,  maxMs: 1000 },
  rare:      { chance: 0.10, minMs: 900,  maxMs: 1200 },
};

export default function FightMeter({ config, rarity = 'common', onComplete }) {
  const cfg = { ...DEFAULTS, ...config };

  const [tension,      setTension]      = useState(cfg.startingTension);
  const [timeLeft,     setTimeLeft]     = useState(1);
  const [phase,        setPhase]        = useState('fighting'); // fighting | won | broke
  const [surging,      setSurging]      = useState(false);
  const [comboActive,  setComboActive]  = useState(false);
  const [perfectFlash, setPerfectFlash] = useState(false);
  const [counterFlash, setCounterFlash] = useState(false);
  const [fishDepth,    setFishDepth]    = useState(cfg.startingTension);

  const tensionRef        = useRef(cfg.startingTension);
  const lastTickRef       = useRef(null);
  const safeTimeRef       = useRef(0);
  const totalTimeRef      = useRef(0);
  const doneRef           = useRef(false);
  const rafRef            = useRef(null);
  const startRef          = useRef(null);
  const surgeRef          = useRef(null);
  const surgeTimestampRef = useRef(-Infinity); // epoch ms of last surge
  const tapTimestampsRef  = useRef([]);
  const comboTimeoutRef   = useRef(null);

  const finish = useCallback((broke) => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    clearTimeout(surgeRef.current);
    clearTimeout(comboTimeoutRef.current);
    const quality = broke
      ? 0
      : (totalTimeRef.current > 0 ? safeTimeRef.current / totalTimeRef.current : 0.5);
    setPhase(broke ? 'broke' : 'won');
    setTimeout(() => onComplete(quality), 900);
  }, [onComplete]);

  // Fire a tension surge; may schedule a rarity-based cluster follow-up
  const fireSurge = useCallback((amount) => {
    if (doneRef.current) return;
    tensionRef.current = Math.min(cfg.BREAK_MAX - 0.02, tensionRef.current + amount);
    setTension(tensionRef.current);
    setFishDepth(Math.min(1, tensionRef.current * 1.15));
    surgeTimestampRef.current = Date.now();
    setSurging(true);
    setTimeout(() => { if (!doneRef.current) setSurging(false); }, 500);

    // Cluster surge: epic/legendary/rare chance of a follow-up jolt
    const cluster = CLUSTER[rarity];
    if (cluster && Math.random() < cluster.chance) {
      const delay = cluster.minMs + Math.random() * (cluster.maxMs - cluster.minMs);
      setTimeout(() => {
        if (doneRef.current) return;
        tensionRef.current = Math.min(cfg.BREAK_MAX - 0.02, tensionRef.current + amount * 0.65);
        setTension(tensionRef.current);
        setFishDepth(Math.min(1, tensionRef.current * 1.15));
        surgeTimestampRef.current = Date.now();
        setSurging(true);
        setTimeout(() => { if (!doneRef.current) setSurging(false); }, 400);
      }, delay);
    }
  }, [cfg.BREAK_MAX, rarity]);

  // Schedules recurring surges with randomised intervals (recursive setTimeout)
  const scheduleSurge = useCallback(() => {
    if (doneRef.current) return;
    const interval = cfg.SURGE_INTERVAL_MIN +
      Math.random() * (cfg.SURGE_INTERVAL_MAX - cfg.SURGE_INTERVAL_MIN);
    surgeRef.current = setTimeout(() => {
      fireSurge(cfg.SURGE_AMOUNT);
      scheduleSurge();
    }, interval);
  }, [cfg.SURGE_INTERVAL_MIN, cfg.SURGE_INTERVAL_MAX, cfg.SURGE_AMOUNT, fireSurge]);

  useEffect(() => {
    function tick(ts) {
      if (!startRef.current) { startRef.current = ts; lastTickRef.current = ts; }
      const dt = ts - lastTickRef.current;
      lastTickRef.current = ts;
      totalTimeRef.current += dt;

      const elapsed   = ts - startRef.current;
      const remaining = Math.max(0, cfg.FIGHT_DURATION_MS - elapsed) / cfg.FIGHT_DURATION_MS;
      setTimeLeft(remaining);

      const newTension = Math.min(cfg.BREAK_MAX + 0.01, tensionRef.current + cfg.DRIFT_RATE * dt);
      tensionRef.current = newTension;
      setTension(newTension);
      setFishDepth(Math.min(1, newTension * 1.15));

      if (newTension < cfg.SAFE_MAX) safeTimeRef.current += dt;
      if (newTension >= cfg.BREAK_MAX) { finish(true);  return; }
      if (remaining  <= 0)            { finish(false); return; }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    scheduleSurge();
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(surgeRef.current);
    };
  }, [finish, scheduleSurge, cfg.FIGHT_DURATION_MS, cfg.DRIFT_RATE, cfg.SAFE_MAX, cfg.BREAK_MAX]);

  function handleReel() {
    if (doneRef.current || phase !== 'fighting') return;
    const now = Date.now();

    // ── Combo: ≥3 taps within 800 ms → 1.5× reel power ──────────────────
    tapTimestampsRef.current = tapTimestampsRef.current.filter(t => now - t < 800);
    tapTimestampsRef.current.push(now);
    const isCombo = tapTimestampsRef.current.length >= 3;
    setComboActive(isCombo);
    clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => {
      setComboActive(false);
      tapTimestampsRef.current = [];
    }, 1200);

    // ── Timing windows relative to last surge ─────────────────────────────
    const msSinceSurge = now - surgeTimestampRef.current;
    // Counter-surge: react within 200 ms while tension is already dangerous
    const isCounter = msSinceSurge >= 0 && msSinceSurge <= 200 && tensionRef.current >= 0.72;
    // Perfect reel: react 1–350 ms after surge (counter takes precedence)
    const isPerfect = !isCounter && msSinceSurge > 0 && msSinceSurge <= 350;

    // ── Stacking power multipliers ────────────────────────────────────────
    let power = cfg.REEL_POWER;
    if (isCombo)   power *= 1.5;  // rapid-tap bonus
    if (isPerfect) power *= 1.8;  // precise timing bonus
    if (isCounter) power *= 2.5;  // counter-surge maximum power

    tensionRef.current = Math.max(0, tensionRef.current - power);
    setTension(tensionRef.current);

    if (isPerfect) {
      setPerfectFlash(true);
      setTimeout(() => setPerfectFlash(false), 600);
    }
    if (isCounter) {
      setCounterFlash(true);
      setTimeout(() => setCounterFlash(false), 750);
    }
  }

  const tensionPct = Math.round(tension * 100);
  const inDanger   = tension >= cfg.SAFE_MAX;
  const panicMode  = tension >= 0.85;
  const barColor   = tension < 0.4
    ? '#22c55e'
    : tension < cfg.SAFE_MAX
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div
      className={`fm fm--${phase}${surging ? ' fm--surge' : ''}${panicMode ? ' fm--panic' : ''}`}
      onClick={handleReel}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleReel()}
      aria-label="Fight meter — tap to reel!"
    >
      {phase === 'fighting' && (
        <>
          <p className="fm__label">⚡ TAP TO REEL!</p>

          {/* Priority message area: counter > perfect > surge > combo > idle */}
          <div className="fm__messages">
            {counterFlash ? (
              <p className="fm__msg fm__msg--counter">💥 COUNTER!</p>
            ) : perfectFlash ? (
              <p className="fm__msg fm__msg--perfect">⚡ PERFECT!</p>
            ) : surging ? (
              <p className="fm__msg fm__msg--surge">🐟 Fish is running!</p>
            ) : comboActive ? (
              <p className="fm__msg fm__msg--combo">🔥 COMBO ×1.5</p>
            ) : (
              <p className="fm__sub">Keep tension in the safe zone</p>
            )}
          </div>

          {/* Time countdown bar */}
          <div className="fm__time-bar">
            <div className="fm__time-fill" style={{ width: `${timeLeft * 100}%` }} />
          </div>

          {/* Tension bar */}
          <div className="fm__tension-track">
            <div className="fm__safe-zone" />
            <div
              className={`fm__tension-fill ${inDanger ? 'fm__tension-fill--danger' : ''}`}
              style={{ width: `${tensionPct}%`, background: barColor }}
            />
            <div className="fm__safe-line" style={{ left: `${cfg.SAFE_MAX * 100}%` }} />
          </div>

          {/* Fish depth indicator — fish sinks right as tension rises */}
          <div className="fm__depth-bar">
            <span className="fm__depth-label">DEPTH</span>
            <div className="fm__depth-track">
              <span
                className="fm__depth-fish"
                style={{ left: `${Math.min(88, fishDepth * 90)}%` }}
              >🐟</span>
            </div>
          </div>

          <div className="fm__status">
            {inDanger
              ? <span className="fm__status--danger">⚠️ Too tight — reel faster!</span>
              : <span className="fm__status--safe">✅ Good tension</span>
            }
          </div>
          <p className="fm__hint">Tap · Click · Space · Enter</p>
        </>
      )}

      {phase === 'won' && (
        <div className="fm__feedback fm__feedback--won">
          <span className="fm__icon">🎣</span>
          <p className="fm__result">Fish landed!</p>
        </div>
      )}

      {phase === 'broke' && (
        <div className="fm__feedback fm__feedback--broke">
          <span className="fm__icon">💔</span>
          <p className="fm__result">Line broke!</p>
          <p className="fm__sub">Didn't reel fast enough</p>
        </div>
      )}
    </div>
  );
}
