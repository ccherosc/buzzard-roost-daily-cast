// src/components/BiteTiming.jsx
// Wait for the bite, then tap at the right moment to hook it.
// hooksetQuality = 0–1 based on how quickly you tapped after the bite cue.
// config: { WAIT_MIN_MS, WAIT_MAX_MS, WINDOW_MS, showPreBiteCue, noPreBiteWarning }
import { useRef, useEffect, useState, useCallback } from 'react';
import './BiteTiming.css';

const DEFAULTS = {
  WAIT_MIN_MS: 1500, WAIT_MAX_MS: 4000, WINDOW_MS: 800,
  showPreBiteCue: false, noPreBiteWarning: false,
};
const PERFECT_MS   = 250;
const PRE_BITE_CUE = 400; // ms before bite that the precision cue shows

export default function BiteTiming({ config, onComplete }) {
  const { WAIT_MIN_MS, WAIT_MAX_MS, WINDOW_MS, showPreBiteCue, noPreBiteWarning } =
    { ...DEFAULTS, ...config };

  const [phase,   setPhase]   = useState('waiting');
  const [quality, setQuality] = useState(null);
  const [showCue, setShowCue] = useState(false);
  const biteTimeRef  = useRef(null);
  const timerRef     = useRef(null);
  const cueTimerRef  = useRef(null);

  const triggerBite = useCallback(() => {
    setShowCue(false);
    setPhase('bite');
    biteTimeRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      setPhase('miss');
      setTimeout(() => onComplete(0), 900);
    }, WINDOW_MS);
  }, [onComplete, WINDOW_MS]);

  useEffect(() => {
    const delay = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);

    // Precision cue: show ripple 400ms before bite (skip if risky or delay too short)
    if (showPreBiteCue && !noPreBiteWarning && delay > PRE_BITE_CUE + 200) {
      cueTimerRef.current = setTimeout(() => setShowCue(true), delay - PRE_BITE_CUE);
    }

    timerRef.current = setTimeout(triggerBite, delay);
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(cueTimerRef.current);
    };
  }, [triggerBite, WAIT_MIN_MS, WAIT_MAX_MS, showPreBiteCue, noPreBiteWarning]);

  function handleHookset() {
    if (phase === 'waiting') {
      clearTimeout(timerRef.current);
      clearTimeout(cueTimerRef.current);
      setPhase('late');
      setTimeout(() => onComplete(0.1), 900);
      return;
    }
    if (phase !== 'bite') return;
    clearTimeout(timerRef.current);
    const reaction = performance.now() - biteTimeRef.current;
    const q = Math.max(0, 1 - (reaction / WINDOW_MS));
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
          <div className={`bt__scene ${showCue ? 'bt__scene--cue' : ''}`}>
            <div className="bt__water">
              <div className="bt__wave" /><div className="bt__wave bt__wave--2" />
            </div>
            <div className="bt__bobber">
              <div className="bt__line" />
              <div className="bt__bob-top" /><div className="bt__bob-bot" />
            </div>
            {showCue && <div className="bt__precue" aria-hidden="true" />}
          </div>
          <p className="bt__prompt">🎣 Watching the bobber…</p>
          <p className="bt__sub">Tap the moment it dips!</p>
          <p className="bt__hint">Tap · Click · Space · Enter</p>
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
