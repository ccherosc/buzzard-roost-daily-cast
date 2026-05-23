// src/components/FightMeter.jsx
// Tension bar — tap to reel. Fish surges add tension spikes.
// fightQuality = fraction of time in safe zone (0–1, 0 if line broke).
// config: { FIGHT_DURATION_MS, DRIFT_RATE, REEL_POWER, SAFE_MAX, BREAK_MAX,
//           SURGE_INTERVAL_MIN, SURGE_INTERVAL_MAX, SURGE_AMOUNT, startingTension }
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

export default function FightMeter({ config, rarity, onComplete }) {
  const cfg = { ...DEFAULTS, ...config };

  const [tension,  setTension]  = useState(cfg.startingTension);
  const [timeLeft, setTimeLeft] = useState(1);
  const [phase,    setPhase]    = useState('fighting'); // fighting | won | broke
  const [surging,  setSurging]  = useState(false);

  const tensionRef   = useRef(cfg.startingTension);
  const lastTickRef  = useRef(null);
  const safeTimeRef  = useRef(0);
  const totalTimeRef = useRef(0);
  const doneRef      = useRef(false);
  const rafRef       = useRef(null);
  const startRef     = useRef(null);
  const surgeRef     = useRef(null);

  const finish = useCallback((broke) => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    clearTimeout(surgeRef.current);
    const quality = broke
      ? 0
      : (totalTimeRef.current > 0 ? safeTimeRef.current / totalTimeRef.current : 0.5);
    setPhase(broke ? 'broke' : 'won');
    setTimeout(() => onComplete(quality), 900);
  }, [onComplete]);

  // Schedules random tension surge (recursive setTimeout)
  const scheduleSurge = useCallback(() => {
    if (doneRef.current) return;
    const interval = cfg.SURGE_INTERVAL_MIN +
      Math.random() * (cfg.SURGE_INTERVAL_MAX - cfg.SURGE_INTERVAL_MIN);
    surgeRef.current = setTimeout(() => {
      if (doneRef.current) return;
      // Clamp so surge can't immediately snap the line
      tensionRef.current = Math.min(cfg.BREAK_MAX - 0.02, tensionRef.current + cfg.SURGE_AMOUNT);
      setTension(tensionRef.current);
      setSurging(true);
      setTimeout(() => setSurging(false), 500);
      scheduleSurge();
    }, interval);
  }, [cfg.SURGE_INTERVAL_MIN, cfg.SURGE_INTERVAL_MAX, cfg.SURGE_AMOUNT, cfg.BREAK_MAX]);

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

      if (newTension < cfg.SAFE_MAX) safeTimeRef.current += dt;
      if (newTension >= cfg.BREAK_MAX) { finish(true);  return; }
      if (remaining <= 0)              { finish(false); return; }

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
    tensionRef.current = Math.max(0, tensionRef.current - cfg.REEL_POWER);
    setTension(tensionRef.current);
  }

  const tensionPct = Math.round(tension * 100);
  const inDanger   = tension >= cfg.SAFE_MAX;
  const barColor   = tension < 0.4
    ? '#22c55e'
    : tension < cfg.SAFE_MAX
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div
      className={`fm fm--${phase} ${surging ? 'fm--surge' : ''}`}
      onClick={handleReel}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleReel()}
      aria-label="Fight meter — tap to reel!"
    >
      {phase === 'fighting' && (
        <>
          <p className="fm__label">⚡ TAP TO REEL!</p>
          {surging
            ? <p className="fm__surge-label">🐟 Fish is running!</p>
            : <p className="fm__sub">Keep tension in the safe zone</p>
          }

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
