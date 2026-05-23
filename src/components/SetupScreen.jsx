// src/components/SetupScreen.jsx
// One-screen setup: spot (scene strip) + lure (icon row) + cast style (icon row)
// + live odds bar + risk meter + TModel2 quip + CTA button.
//
// Props:
//   castNumber  — 1-based cast number
//   lockedSpot  — spotId string if already chosen (casts 2+), null on cast 1
//   lockedLure  — lureId string if already chosen (casts 2+), null on cast 1
//   onComplete  — ({spotId, lureId, castStyleId}) => void
import { useState, useMemo } from 'react';
import './SetupScreen.css';
import { SPOTS, LURES, CAST_STYLES } from '../data/gameData.js';
import { computeWeights } from '../utils/gameLogic.js';
import { getSetupQuip } from '../utils/mascotLines.js';
import MascotQuip from './MascotQuip.jsx';

export default function SetupScreen({ castNumber, lockedSpot, lockedLure, onComplete }) {
  const [selectedSpot, setSelectedSpot] = useState(lockedSpot ?? null);
  const [selectedLure, setSelectedLure] = useState(lockedLure ?? null);
  const [selectedCast, setSelectedCast] = useState(null);

  const canProceed = !!(selectedSpot && selectedLure && selectedCast);

  // Live odds — only compute when all three are picked
  const { odds, totalWeight } = useMemo(() => {
    if (!selectedSpot || !selectedLure || !selectedCast) return { odds: null, totalWeight: 0 };
    const w = computeWeights(selectedSpot, selectedLure, selectedCast);
    return { odds: w, totalWeight: Object.values(w).reduce((a, b) => a + b, 0) };
  }, [selectedSpot, selectedLure, selectedCast]);

  const commonPct = odds ? Math.round(odds.common / totalWeight * 100) : null;
  const rarePct   = odds ? Math.round((odds.uncommon + odds.rare) / totalWeight * 100) : null;
  const epicPct   = odds ? (100 - commonPct - rarePct) : null;
  const riskFrac  = odds ? (odds.epic + odds.legendary) / totalWeight : 0;

  const quip = (selectedSpot && selectedLure && selectedCast)
    ? getSetupQuip(selectedSpot, selectedLure, selectedCast)
    : castNumber > 1
      ? "Same spot, same lure. Pick your cast style."
      : "Choose your spot, lure, and cast style.";

  function handleComplete() {
    if (!canProceed) return;
    onComplete({ spotId: selectedSpot, lureId: selectedLure, castStyleId: selectedCast });
  }

  return (
    <div className="ss">
      {/* ── Spot: scene strip ── */}
      <section className="ss__section">
        <h3 className="ss__section-label">SPOT</h3>
        <div className="ss__scene-strip">
          {SPOTS.map(spot => {
            const locked   = !!lockedSpot && lockedSpot !== spot.id;
            const selected = selectedSpot === spot.id;
            return (
              <button
                key={spot.id}
                className={`ss__spot ${selected ? 'ss__spot--selected' : ''} ${locked ? 'ss__spot--locked' : ''}`}
                onClick={() => !locked && setSelectedSpot(spot.id)}
                disabled={locked}
                aria-pressed={selected}
                aria-label={spot.name}
              >
                <span className="ss__spot-icon">{spot.emoji}</span>
                {selected && <span className="ss__spot-name">{spot.name}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Lure: icon row ── */}
      <section className="ss__section">
        <h3 className="ss__section-label">LURE</h3>
        <div className="ss__chip-row">
          {LURES.map(lure => {
            const locked   = !!lockedLure && lockedLure !== lure.id;
            const selected = selectedLure === lure.id;
            return (
              <button
                key={lure.id}
                className={`ss__chip ${selected ? 'ss__chip--selected' : ''} ${locked ? 'ss__chip--locked' : ''}`}
                onClick={() => !locked && setSelectedLure(lure.id)}
                disabled={locked}
                aria-pressed={selected}
                aria-label={lure.name}
              >
                <span className="ss__chip-icon">{lure.emoji}</span>
                <span className="ss__chip-name">{lure.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Cast style: icon row ── */}
      <section className="ss__section">
        <h3 className="ss__section-label">CAST STYLE</h3>
        <div className="ss__chip-row">
          {CAST_STYLES.map(cs => {
            const selected = selectedCast === cs.id;
            return (
              <button
                key={cs.id}
                className={`ss__chip ${selected ? 'ss__chip--selected' : ''}`}
                onClick={() => setSelectedCast(cs.id)}
                aria-pressed={selected}
                aria-label={cs.name}
              >
                <span className="ss__chip-icon">{cs.emoji}</span>
                <span className="ss__chip-name">{cs.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Live odds + risk (only when all three picked) ── */}
      {odds && (
        <div className="ss__odds-wrap">
          <div className="ss__odds-bar">
            <div className="ss__odds-seg ss__odds-seg--common" style={{ flex: odds.common }}>
              <span className="ss__odds-pct">{commonPct}%</span>
            </div>
            <div className="ss__odds-seg ss__odds-seg--rare" style={{ flex: odds.uncommon + odds.rare }}>
              <span className="ss__odds-pct">{rarePct}%</span>
            </div>
            <div className="ss__odds-seg ss__odds-seg--epic" style={{ flex: odds.epic + odds.legendary }}>
              {epicPct > 4 && <span className="ss__odds-pct">{epicPct}%</span>}
            </div>
          </div>
          <div className="ss__odds-legend">
            <span><span className="ss__dot ss__dot--common" />Common</span>
            <span><span className="ss__dot ss__dot--rare"   />Rare</span>
            <span><span className="ss__dot ss__dot--epic"   />Epic+</span>
          </div>

          <div className="ss__risk-row">
            <span className="ss__risk-label">Safe</span>
            <div className="ss__risk-track">
              <div className="ss__risk-fill" style={{ width: `${Math.round(riskFrac * 100)}%` }} />
            </div>
            <span className="ss__risk-label">Risky</span>
          </div>
        </div>
      )}

      {/* ── TModel2 quip ── */}
      <MascotQuip mascot="tmodel2" line={quip} size={80} />

      {/* ── CTA ── */}
      <div className="ss__cta-wrap">
        <button
          className="btn btn--primary btn--large ss__cta"
          onClick={handleComplete}
          disabled={!canProceed}
        >
          🎣 CAST #{castNumber}
        </button>
      </div>
    </div>
  );
}
