// src/components/DailyCastGame.jsx
// Orchestrates one cast: CastMeter → BiteTiming → FightMeter → CatchReveal
// Receives pre-built base result; applies performance bonuses after gameplay.
import { useState } from 'react';
import './DailyCastGame.css';
import CastMeter   from './CastMeter.jsx';
import BiteTiming  from './BiteTiming.jsx';
import FightMeter  from './FightMeter.jsx';
import CatchReveal from './CatchReveal.jsx';
import { applyPerformanceBonuses } from '../utils/gameLogic.js';

export default function DailyCastGame({
  baseResult,    // pre-built result from buildResult()
  castNumber,    // 1-based
  totalCasts,    // DAILY_CAST_LIMIT
  onCastComplete, // (finalResult) => void
}) {
  const [phase,       setPhase]       = useState('cast');   // cast | bite | fight | reveal
  const [accuracy,    setAccuracy]    = useState(0.5);
  const [hookset,     setHookset]     = useState(0.5);
  const [fightQ,      setFightQ]      = useState(0.5);
  const [finalResult, setFinalResult] = useState(null);

  function handleCastComplete(acc) {
    setAccuracy(acc);
    setPhase('bite');
  }

  function handleBiteComplete(hq) {
    setHookset(hq);
    setPhase('fight');
  }

  function handleFightComplete(fq) {
    setFightQ(fq);
    const result = applyPerformanceBonuses(baseResult, {
      accuracy:       accuracy,
      hooksetQuality: hookset,
      fightQuality:   fq,
    });
    setFinalResult(result);
    setPhase('reveal');
  }

  function handleContinue() {
    onCastComplete(finalResult);
  }

  return (
    <div className="dcg">
      {/* Phase label */}
      <div className="dcg__phases">
        <span className={`dcg__phase-dot ${phase === 'cast'   ? 'dcg__phase-dot--active' : (phase !== 'cast'   ? 'dcg__phase-dot--done' : '')}`} />
        <span className={`dcg__phase-dot ${phase === 'bite'   ? 'dcg__phase-dot--active' : (['fight','reveal'].includes(phase) ? 'dcg__phase-dot--done' : '')}`} />
        <span className={`dcg__phase-dot ${phase === 'fight'  ? 'dcg__phase-dot--active' : (phase === 'reveal'  ? 'dcg__phase-dot--done' : '')}`} />
        <span className={`dcg__phase-dot ${phase === 'reveal' ? 'dcg__phase-dot--active' : ''}`} />
      </div>

      <div className="dcg__content phase-enter" key={phase}>
        {phase === 'cast'   && <CastMeter   onComplete={handleCastComplete}  />}
        {phase === 'bite'   && <BiteTiming  onComplete={handleBiteComplete}  />}
        {phase === 'fight'  && <FightMeter  onComplete={handleFightComplete} />}
        {phase === 'reveal' && finalResult && (
          <CatchReveal
            result={finalResult}
            castNumber={castNumber}
            totalCasts={totalCasts}
            onContinue={handleContinue}
          />
        )}
      </div>
    </div>
  );
}
