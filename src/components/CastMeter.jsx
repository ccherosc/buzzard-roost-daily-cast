// src/components/CastMeter.jsx
// Oscillating power bar — tap/click to stop it and score your cast accuracy.
// Layout: Snowball coaching (top) → bar mechanic (middle) → instructions (bottom).
import { useRef, useEffect, useState } from 'react';
import './CastMeter.css';
import SnowballCoach from './SnowballCoach.jsx';

const DEFAULTS = { DURATION_MS: 1400, SWEET_ZONE: 0.28, sweetOffset: 0 };

export default function CastMeter({ config, onComplete }) {
  const { DURATION_MS, SWEET_ZONE, sweetOffset } = { ...DEFAULTS, ...config };
  const sweetCenter = 0.5 + sweetOffset;

  const rafRef   = useRef(null);
  const startRef = useRef(null);
  const posRef   = useRef(0);

  const [position, setPosition] = useState(0);
  const [locked,   setLocked]   = useState(false);
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t   = (elapsed % (DURATION_MS * 2)) / DURATION_MS;
      const pos = t <= 1 ? t : 2 - t;
      posRef.current = pos;
      setPosition(pos);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [DURATION_MS]);

  function handleCast() {
    if (locked) return;
    cancelAnimationFrame(rafRef.current);
    const pos  = posRef.current;
    const dist = Math.abs(pos - sweetCenter) / 0.5;
    const acc  = Math.max(0, 1 - dist);
    setAccuracy(acc);
    setLocked(true);
    setTimeout(() => onComplete(acc), 700);
  }

  const sweetLeft  = (sweetCenter - SWEET_ZONE / 2) * 100;
  const sweetWidth = SWEET_ZONE * 100;
  const inSweet    = accuracy !== null && Math.abs(posRef.current - sweetCenter) < SWEET_ZONE / 2;

  // ── Snowball coaching ──────────────────────────────────────────────────────
  const coach = !locked
    ? { expression: 'cast',    line: "Stop the bar when it lands in the green zone!" }
    : inSweet
      ? { expression: 'fishOn',  line: "Right in the zone! Perfect cast!" }
      : accuracy >= 0.5
        ? { expression: 'recast', line: "Close! Aim a little more toward the green." }
        : { expression: 'recast', line: "Keep practicing — go for that green zone!" };

  return (
    <div
      className="cm"
      onClick={handleCast}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleCast()}
      aria-label="Cast meter — tap to cast"
    >
      {/* TOP — Snowball coaching */}
      <SnowballCoach expression={coach.expression} line={coach.line} />

      {/* MIDDLE — oscillating bar */}
      <div className="cm__bar-wrap">
        <div className="cm__bar">
          <div
            className={`cm__sweet ${!locked ? 'cm__sweet--pulse' : ''}`}
            style={{ left: `${sweetLeft}%`, width: `${sweetWidth}%` }}
          />
          <div
            className={`cm__indicator ${locked ? (inSweet ? 'cm__indicator--hit' : 'cm__indicator--miss') : ''}`}
            style={{ left: `calc(${position * 100}% - 12px)` }}
          />
        </div>
        {locked && (
          <p className={`cm__result ${inSweet ? 'cm__result--hit' : ''}`}>
            {inSweet ? '🎯 Sweet spot!' : `Cast accuracy: ${Math.round((accuracy ?? 0) * 100)}%`}
          </p>
        )}
      </div>

      {/* BOTTOM — instructions */}
      <div className="cm__footer">
        <p className="cm__label">TAP TO CAST!</p>
        <p className="cm__sub">Aim for the sweet spot</p>
        {!locked && <p className="cm__hint">Tap · Click · Space · Enter</p>}
      </div>
    </div>
  );
}
