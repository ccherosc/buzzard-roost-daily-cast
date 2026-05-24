// src/components/BiteTiming.jsx
// Wait for the bite, then tap at the right moment to hook it.
// Layout: Snowball coaching (top) → bobber scene (middle) → instructions (bottom).
import { useRef, useEffect, useState, useCallback } from 'react';
import './BiteTiming.css';
import SnowballCoach from './SnowballCoach.jsx';

const DEFAULTS = {
  WAIT_MIN_MS: 1500, WAIT_MAX_MS: 4000, WINDOW_MS: 800,
  showPreBiteCue: false, noPreBiteWarning: false,
};
const PERFECT_MS   = 250;
const PRE_BITE_CUE = 400;

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
      setTimeout(() => onComplete(null), 900);
    }, WINDOW_MS);
  }, [onComplete, WINDOW_MS]);

  useEffect(() => {
    const delay = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);
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
      setTimeout(() => onComplete(null), 900);
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

  // ── Snowball coaching ──────────────────────────────────────────────────────
  const coach = (() => {
    if (phase === 'hit' && quality >= 0.75) return { expression: 'fishOn',    line: "Perfect hookset! Fish is on!" };
    if (phase === 'hit' && quality >= 0.40) return { expression: 'reeling',   line: "Solid hookset! Hold on tight!" };
    if (phase === 'hit')                    return { expression: 'reelStart',  line: "Hooked! Now reel it in!" };
    if (phase === 'miss')                   return { expression: 'recast',     line: "Too slow... fish got the bait." };
    if (phase === 'late')                   return { expression: 'recast',     line: "Too early! Wait for the bobber to dip." };
    if (phase === 'bite')                   return { expression: 'bite',       line: "NOW! TAP IT!" };
    if (showCue)                            return { expression: 'reelStart',  line: "Getting twitchy... stay ready!" };
    return                                         { expression: 'waiting',    line: "Watch the bobber... patience now." };
  })();

  return (
    <div
      className={`bt bt--${phase}`}
      onClick={handleHookset}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleHookset()}
      aria-label="Bite timing — tap when the bobber dips!"
    >
      {/* TOP — Snowball coaching */}
      <SnowballCoach expression={coach.expression} line={coach.line} />

      {/* MIDDLE — bobber scene (waiting + bite phases) */}
      {(phase === 'waiting' || phase === 'bite') && (
        <div className="bt__scene-wrap">
          <div className={`bt__scene ${phase === 'bite' ? 'bt__scene--bite' : ''}`}>
            <div className="bt__water">
              <div className={`bt__wave ${phase === 'bite' ? 'bt__wave--fast' : ''}`} />
              <div className="bt__wave bt__wave--2" />
            </div>

            {/* Bobber rig: fishing line → float (red top / cream bot) */}
            <div className={`bt__rig ${phase === 'bite' ? 'bt__rig--down' : ''} ${showCue ? 'bt__rig--cue' : ''}`}>
              <div className="bt__line" />
              <div className="bt__float">
                <div className="bt__float-top" />
                <div className="bt__float-bot" />
              </div>
            </div>

            {phase === 'bite' && <div className="bt__splash" />}
          </div>
        </div>
      )}

      {/* Outcome feedback panels */}
      {(phase === 'hit' || phase === 'miss' || phase === 'late') && (
        <div className={`bt__feedback bt__feedback--${phase}`}>
          <span className="bt__icon">
            {phase === 'hit' ? '🎣' : phase === 'miss' ? '💨' : '🌊'}
          </span>
          <p className="bt__prompt">
            {phase === 'hit'  ? 'Got it!'    :
             phase === 'miss' ? 'Too slow!'  : 'Too early!'}
          </p>
        </div>
      )}

      {/* BOTTOM — instructions */}
      <div className="bt__footer">
        {phase === 'waiting' && (
          <>
            <p className="bt__watching">🎣 Watching the bobber…</p>
            <p className="bt__cta">TAP THE MOMENT IT DIPS!</p>
            <p className="bt__hint">Tap · Click · Space · Enter</p>
          </>
        )}
        {phase === 'bite' && (
          <p className="bt__cta bt__cta--now">🪝 HOOKSET — NOW!</p>
        )}
        {phase === 'hit' && (
          <p className="bt__sub">
            {quality >= 0.75 ? 'Perfect hookset!' : quality >= 0.4 ? 'Solid hookset!' : 'Hooked!'}
          </p>
        )}
        {phase === 'miss' && <p className="bt__sub">The fish got away with the bait</p>}
        {phase === 'late' && <p className="bt__sub">Wait for the bobber to dip first</p>}
      </div>
    </div>
  );
}
