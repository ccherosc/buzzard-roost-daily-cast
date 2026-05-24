// src/components/DailyCastGame.jsx
// Orchestrates one cast: CastMeter → BiteTiming → FightMeter → CatchReveal (or NoCatch)
//
// Outcomes that produce no fish:
//   BiteTiming null   → fish got away (missed / too early)
//   FightMeter broke  → line snapped (over-reeled past left band edge)
//   FightMeter escaped → fish escaped (under-reeled past right band edge)
import { useState } from 'react';
import './DailyCastGame.css';
import CastMeter   from './CastMeter.jsx';
import BiteTiming  from './BiteTiming.jsx';
import FightMeter  from './FightMeter.jsx';
import CatchReveal from './CatchReveal.jsx';
import NoCatch     from './NoCatch.jsx';
import { applyPerformanceBonuses } from '../utils/gameLogic.js';

export default function DailyCastGame({
  baseResult,
  gameParams,
  castNumber,
  totalCasts,
  onCastComplete,
}) {
  const [phase,        setPhase]        = useState('cast');  // cast|bite|fight|reveal|nofish
  const [accuracy,     setAccuracy]     = useState(0.5);
  const [hookset,      setHookset]      = useState(0.5);
  const [finalResult,  setFinalResult]  = useState(null);
  const [nofishReason, setNofishReason] = useState(null);

  function handleCastComplete(acc) {
    setAccuracy(acc);
    setPhase('bite');
  }

  function handleBiteComplete(hq) {
    if (hq === null) {
      // Fish got away (too early or timed out) — skip fight, no fish
      setNofishReason('missed');
      setPhase('nofish');
      return;
    }
    setHookset(hq);
    setPhase('fight');
  }

  function handleFightComplete({ quality, outcome }) {
    if (outcome !== 'won') {
      // Line broke (over-reeled) or fish escaped (under-reeled) — no fish
      setNofishReason(outcome);   // 'broke' | 'escaped'
      setPhase('nofish');
      return;
    }
    const result = applyPerformanceBonuses(baseResult, {
      accuracy,
      hooksetQuality: hookset,
      fightQuality:   quality,
    });
    setFinalResult(result);
    setPhase('reveal');
  }

  function handleRevealContinue()  { onCastComplete(finalResult); }
  function handleNofishContinue()  { onCastComplete(null); }

  // Phase dot helpers
  const after = (...phases) => phases.some(p => p === phase);

  return (
    <div className="dcg">
      <div className="dcg__phases">
        <span className={`dcg__phase-dot ${phase === 'cast'  ? 'dcg__phase-dot--active' : after('bite','fight','reveal','nofish') ? 'dcg__phase-dot--done' : ''}`} />
        <span className={`dcg__phase-dot ${phase === 'bite'  ? 'dcg__phase-dot--active' : after('fight','reveal','nofish')        ? 'dcg__phase-dot--done' : ''}`} />
        <span className={`dcg__phase-dot ${phase === 'fight' ? 'dcg__phase-dot--active' : after('reveal','nofish')                ? 'dcg__phase-dot--done' : ''}`} />
        <span className={`dcg__phase-dot ${after('reveal','nofish')                      ? 'dcg__phase-dot--active' : ''}`} />
      </div>

      <div className="dcg__content phase-enter" key={phase}>
        {phase === 'cast' && (
          <CastMeter config={gameParams?.castMeter} onComplete={handleCastComplete} />
        )}
        {phase === 'bite' && (
          <BiteTiming config={gameParams?.biteTiming} onComplete={handleBiteComplete} />
        )}
        {phase === 'fight' && (
          <FightMeter
            config={gameParams?.fightMeter}
            rarity={baseResult?.rarity}
            spotId={baseResult?.spot}
            lureId={baseResult?.lure}
            castStyleId={baseResult?.castStyle}
            onComplete={handleFightComplete}
          />
        )}
        {phase === 'reveal' && finalResult && (
          <CatchReveal
            result={finalResult}
            castNumber={castNumber}
            totalCasts={totalCasts}
            onContinue={handleRevealContinue}
          />
        )}
        {phase === 'nofish' && (
          <NoCatch
            reason={nofishReason}
            castNumber={castNumber}
            totalCasts={totalCasts}
            onContinue={handleNofishContinue}
          />
        )}
      </div>
    </div>
  );
}
