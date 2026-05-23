// src/components/FightMeter.jsx
// Keep a tension bar in the "safe zone" by tapping to reel.
// Bar drifts toward the danger zone on its own — spam taps to pull back.
// fightQuality = average time spent in safe zone (0–1).
import { useRef, useEffect, useState, useCallback } from 'react';
import './FightMeter.css';

const FIGHT_DURATION_MS = 6000;  // total fight time
const DRIFT_RATE        = 0.0012; // tension drifts up per ms
const REEL_POWER        = 0.15;  // how much one tap reduces tension
const SAFE_MAX          = 0.65;  // safe zone upper bound (danger ≥ this)
const BREAK_MAX         = 0.95;  // line breaks at this tension

export default function FightMeter({ onComplete }) {
  const [tension,    setTension]    = useState(0.3);
  const [timeLeft,   setTimeLeft]   = useState(1);    // 0–1 fraction
  const [phase,      setPhase]      = useState('fighting'); // fighting | won | broke
  const [inSafe,     setInSafe]     = useState(true);

  const tensionRef   = useRef(0.3);
  const lastTickRef  = useRef(null);
  const safeTimeRef  = useRef(0);
  const totalTimeRef = useRef(0);
  const doneRef      = useRef(false);
  const rafRef       = useRef(null);
  const startRef     = useRef(null);

  const finish = useCallback((broke) => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    const quality = broke ? 0 : (totalTimeRef.current > 0 ? safeTimeRef.current / totalTimeRef.current : 0.5);
    setPhase(broke ? 'broke' : 'won');
    setTimeout(() => onComplete(quality), 900);
  }, [onComplete]);

  useEffect(() => {
    function tick(ts) {
      if (!startRef.current) { startRef.current = ts; lastTickRef.current = ts; }
      const dt = ts - lastTickRef.current;
      lastTickRef.current = ts;
      totalTimeRef.current += dt;

      const elapsed = ts - startRef.current;
      const remaining = Math.max(0, FIGHT_DURATION_MS - elapsed) / FIGHT_DURATION_MS;
      setTimeLeft(remaining);

      // Tension drifts up
      const newTension = Math.min(BREAK_MAX + 0.01, tensionRef.current + DRIFT_RATE * dt);
      tensionRef.current = newTension;
      setTension(newTension);

      const safe = newTension < SAFE_MAX;
      setInSafe(safe);
      if (safe) safeTimeRef.current += dt;

      if (newTension >= BREAK_MAX) { finish(true); return; }
      if (remaining <= 0)          { finish(false); return; }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [finish]);

  function handleReel() {
    if (doneRef.current || phase !== 'fighting') return;
    tensionRef.current = Math.max(0, tensionRef.current - REEL_POWER);
    setTension(tensionRef.current);
  }

  const tensionPct = Math.round(tension * 100);
  const barColor   = tension < 0.4 ? '#22c55e' : tension < SAFE_MAX ? '#f59e0b' : '#ef4444';

  return (
    <div
      className={`fm fm--${phase}`}
      onClick={handleReel}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleReel()}
      aria-label="Fight meter — tap to reel!"
    >
      {phase === 'fighting' && (
        <>
          <p className="fm__label">⚡ TAP TO REEL!</p>
          <p className="fm__sub">Keep tension in the safe zone</p>

          {/* Time bar */}
          <div className="fm__time-bar">
            <div className="fm__time-fill" style={{ width: `${timeLeft * 100}%` }} />
          </div>

          {/* Tension bar */}
          <div className="fm__tension-track">
            <div className="fm__safe-zone" />
            <div
              className={`fm__tension-fill ${tension >= SAFE_MAX ? 'fm__tension-fill--danger' : ''}`}
              style={{ width: `${tensionPct}%`, background: barColor }}
            />
            <div className="fm__safe-line" style={{ left: `${SAFE_MAX * 100}%` }} />
          </div>

          <div className="fm__status">
            {tension >= SAFE_MAX
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
