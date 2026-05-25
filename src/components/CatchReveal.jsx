// src/components/CatchReveal.jsx
// Dramatic fish reveal shown after all three gameplay phases.
// Receives the pre-built + bonus-applied result; shows fish art, rarity glow, points.
// TModel2 reacts with a rarity-appropriate quip once details slide in.
import { useState, useEffect } from 'react';
import './CatchReveal.css';
import { getFishImage } from '../utils/fishImages.js';
import MascotQuip from './MascotQuip.jsx';
import { getCatchQuip } from '../utils/mascotLines.js';

const RARITY_LABELS = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

export default function CatchReveal({ result, castNumber, totalCasts, onContinue }) {
  const [stage, setStage] = useState('splash');  // splash → fish → details → actions

  useEffect(() => {
    const t1 = setTimeout(() => setStage('fish'),    600);
    const t2 = setTimeout(() => setStage('details'), 1400);
    const t3 = setTimeout(() => setStage('actions'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const fishImg = getFishImage(result.fishId);

  return (
    <div className={`cr cr--${result.rarity}`}>
      {/* Rarity glow backdrop */}
      <div className="cr__glow" aria-hidden="true" />

      {/* Splash screen */}
      {stage === 'splash' && (
        <div className="cr__splash">
          <span className="cr__splash-icon">🎣</span>
          <p className="cr__splash-text">CATCH #{castNumber}</p>
        </div>
      )}

      {/* Fish reveal */}
      {stage !== 'splash' && (
        <>
          <div className="cr__card">
            <div className="cr__cast-counter">Cast {castNumber} of {totalCasts}</div>

            <span className={`cr__rarity-badge cr__rarity-badge--${result.rarity}`}>
              ★ {RARITY_LABELS[result.rarity].toUpperCase()}
            </span>

            <div className={`cr__fish-wrap cr__fish-wrap--${result.rarity}`}>
              {fishImg
                ? <img className={`cr__fish-img cr__fish-img--${result.fishId}`} src={fishImg} alt={result.fishName} />
                : <span className="cr__fish-emoji" role="img" aria-label={result.fishName}>{result.emoji}</span>
              }
            </div>

            <h2 className="cr__name">{result.fishName}</h2>

            {(stage === 'details' || stage === 'actions') && (
              <div className="cr__details">
                <div className="cr__stat">
                  <span className="cr__stat-label">Weight</span>
                  <span className="cr__stat-value">{result.weight} lbs</span>
                </div>
                <div className="cr__stat-divider" />
                <div className="cr__stat">
                  <span className="cr__stat-label">Points</span>
                  <span className="cr__stat-value">{result.points.toLocaleString()}</span>
                </div>
                {result.bonusPoints > 0 && (
                  <>
                    <div className="cr__stat-divider" />
                    <div className="cr__stat">
                      <span className="cr__stat-label">Bonus</span>
                      <span className="cr__stat-value cr__stat-value--bonus">+{result.bonusPoints.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {stage === 'actions' && (
              <div className="cr__actions">
                <button className="btn btn--primary cr__btn" onClick={onContinue}>
                  {castNumber < totalCasts ? `Cast #${castNumber + 1} →` : '🏆 See Results'}
                </button>
                <p className="cr__flavor"><em>{result.flavor}</em></p>
              </div>
            )}
          </div>

          {/* TModel2 reaction — slides in with details */}
          {(stage === 'details' || stage === 'actions') && (
            <MascotQuip mascot="tmodel2" line={getCatchQuip(result.rarity)} size={100} />
          )}
        </>
      )}
    </div>
  );
}
