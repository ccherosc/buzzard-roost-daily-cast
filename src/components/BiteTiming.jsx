// src/components/BiteTiming.jsx
// Wait for the bite, then tap at the right moment to hook it.
// hooksetQuality = 0–1 based on how quickly you tapped after the bite cue.
import { useRef, useEffect, useState, useCallback } from 'react';
import './BiteTiming.css';

const WAIT_MIN_MS  = 1500;  // shortest wait before bite
const WAIT_MAX_MS  = 4000;  // longest wait before bite
const WINDOW_MS    = 800;   // how long the bite window is open
const PERFECT_MS   = 250;   // reactions within this = close to perfect

export default function BiteTiming({ onComplete }) {
  const [phase, setPhase]     = useState('waiting'); // waiting | bite | hit | miss | late
  const [quality, setQuality] = useState(null);
  const biteTimeRef           = useRef(null);
  const timerRef              = useRef(null);

  const triggerBite = useCallback(() => {
    setPhase('bite');
    biteTimeRef.current = performance.now();

    timerRef.current = setTimeout(() => {
      setPhase('miss');
      setTimeout(() => onComplete(0), 900);
    }, WINDOW_MS);
  }, [onComplete]);

  useEffect(() => {
    const delay = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);
    timerRef.current = setTimeout(triggerBite, delay);
    return () => clearTimeout(timerRef.current);
  }, [triggerBite]);

  function handleHookset() {
    if (phase === 'waiting') {
      // Tapped too early
      clearTimeout(timerRef.current);
      setPhase('late');
      setTimeout(() => onComplete(0.1), 900);
      return;
    }
    if (phase !== 'bite') return;

    clearTimeout(timerRef.current);
    const reaction = performance.now() - biteTimeRef.current;
    const q = Math.max(0, 1 - (reaction / WINDOW_MS));
    // Boost: reactions under PERFECT_MS get a bonus
    const boosted = reaction < PERFECT_MS ? Math.min(1, q * 1.3) : q;
    setQuality(boosted);
    setPhase('hit');
    setTimeout(() => onComplete(boosted), 800);
  }

  return (
    <div
      className={`bt bt--${phase}`}
      onClick={handleHookset}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleHookset()}
      aria-label="Bite timing — tap when the bobber dips!"
    >
      {phase === 'waiting' && (
        <>
          <div className="bt__scene">
            <div className="bt__water"><div className="bt__wave" /><div className="bt__wave bt__wave--2" /></div>
            <div className="bt__bobber">
              <div className="bt__line" />
              <div className="bt__bob-top" /><div className="bt__bob-bot" />
            </div>
          </div>
          <p className="bt__prompt">🎣 Watching the bobber…</p>
          <p className="bt__sub">Tap the moment it dips!</p>
        </>
      )}

      {phase === 'bite' && (
        <>
          <div className="bt__scene bt__scene--bite">
            <div className="bt__water"><div className="bt__wave bt__wave--fast" /></div>
            <div className="bt__bobber bt__bobber--down">
              <div className="bt__line" />
              <div className="bt__bob-top" /><div className="bt__bob-bot" />
            </div>
            <div className="bt__splash" />
          </div>
          <p className="bt__prompt bt__prompt--now">🪝 HOOKSET!</p>
          <p className="bt__sub">NOW!</p>
        </>
      )}

      {phase === 'hit' && (
        <div className="bt__feedback bt__feedback--hit">
          <span className="bt__icon">🎣</span>
          <p className="bt__prompt">Got it!</p>
          <p className="bt__sub">{quality >= 0.75 ? 'Perfect hookset!' : quality >= 0.4 ? 'Solid hookset!' : 'Hooked!'}</p>
        </div>
      )}

      {phase === 'miss' && (
        <div className="bt__feedback bt__feedback--miss">
          <span className="bt__icon">💨</span>
          <p className="bt__prompt">Too slow!</p>
          <p className="bt__sub">The fish got away with the bait</p>
        </div>
      )}

      {phase === 'late' && (
        <div className="bt__feedback bt__feedback--late">
          <span className="bt__icon">🌊</span>
          <p className="bt__prompt">Too early!</p>
          <p className="bt__sub">Wait for the bobber to dip</p>
        </div>
      )}
    </div>
  );
}
