// src/components/SetupScreen.jsx
// One-screen setup: spot + lure + cast style + live odds + risk meter + TModel2.
// TModel2 fills the screen bottom and gives progressive commentary as each
// selection is made (spot → spot+lure → full combo).
//
// Props:
//   castNumber  — 1-based cast number
//   lockedSpot  — spotId if already chosen (casts 2+), null on cast 1
//   lockedLure  — lureId if already chosen (casts 2+), null on cast 1
//   onComplete  — ({spotId, lureId, castStyleId}) => void
import { useState, useMemo } from 'react';
import './SetupScreen.css';
import { SPOTS, LURES, CAST_STYLES } from '../data/gameData.js';
import { computeWeights } from '../utils/gameLogic.js';
import { getSpotQuip, getSpotLureQuip, getSetupQuip } from '../utils/mascotLines.js';
import tmodel2Src from '../../assets/reference/mascot-tmodel.png';

// Risk level label based on epic+legendary fraction of the odds
function riskLabel(riskFrac) {
  if (riskFrac >= 0.12) return { label: 'HIGH STAKES',   color: '#ef4444' };
  if (riskFrac >= 0.05) return { label: 'RISKY',         color: '#f97316' };
  if (riskFrac >= 0.01) return { label: 'MODERATE',      color: '#f59e0b' };
  return                       { label: 'SAFE',           color: '#22c55e' };
}

export default function SetupScreen({ castNumber, lockedSpot, lockedLure, onComplete }) {
  const [selectedSpot, setSelectedSpot] = useState(lockedSpot ?? null);
  const [selectedLure, setSelectedLure] = useState(lockedLure ?? null);
  const [selectedCast, setSelectedCast] = useState(null);

  const canProceed = !!(selectedSpot && selectedLure && selectedCast);

  // Live odds — computed when all three are picked
  const { odds, totalWeight } = useMemo(() => {
    if (!selectedSpot || !selectedLure || !selectedCast) return { odds: null, totalWeight: 0 };
    const w = computeWeights(selectedSpot, selectedLure, selectedCast);
    return { odds: w, totalWeight: Object.values(w).reduce((a, b) => a + b, 0) };
  }, [selectedSpot, selectedLure, selectedCast]);

  const commonPct   = odds ? Math.round(odds.common / totalWeight * 100)                       : null;
  const rarePct     = odds ? Math.round((odds.uncommon + odds.rare) / totalWeight * 100)        : null;
  const epicPct     = odds ? (100 - commonPct - rarePct)                                        : null;
  const riskFrac    = odds ? (odds.epic + odds.legendary) / totalWeight                         : 0;
  const risk        = odds ? riskLabel(riskFrac) : null;

  // Progressive quip — updates with each selection
  const quip = useMemo(() => {
    if (selectedSpot && selectedLure && selectedCast) {
      return getSetupQuip(selectedSpot, selectedLure, selectedCast);
    }
    if (selectedSpot && selectedLure) {
      return getSpotLureQuip(selectedSpot, selectedLure)
        ?? getSpotQuip(selectedSpot);
    }
    if (selectedSpot) {
      return getSpotQuip(selectedSpot);
    }
    return castNumber > 1
      ? "Same spot, same lure — just pick your cast style."
      : "Spot and lure change your rarity odds. Cast style controls the risk. Safer picks on the left, wilder on the right.";
  }, [selectedSpot, selectedLure, selectedCast, castNumber]);

  function handleComplete() {
    if (!canProceed) return;
    onComplete({ spotId: selectedSpot, lureId: selectedLure, castStyleId: selectedCast });
  }

  return (
    <div className="ss">
      {/* ── Difficulty progression indicator (once, above all rows) ── */}
      <div className="ss__diff-bar">
        <span className="ss__diff-label">SAFER</span>
        <div className="ss__diff-track" />
        <span className="ss__diff-label">RISKIER</span>
      </div>

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
                <span className="ss__spot-name">{spot.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Lure: chip row ── */}
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

      {/* ── Cast style: chip row ── */}
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
          <div className="ss__odds-header">
            <span className="ss__odds-title">CATCH ODDS</span>
            <span className="ss__risk-badge" style={{ color: risk.color, borderColor: risk.color }}>
              {risk.label}
            </span>
          </div>
          <div className="ss__odds-bar">
            <div className="ss__odds-seg ss__odds-seg--common" style={{ flex: odds.common }}>
              <span className="ss__odds-pct">{commonPct}%</span>
            </div>
            <div className="ss__odds-seg ss__odds-seg--rare" style={{ flex: odds.uncommon + odds.rare }}>
              <span className="ss__odds-pct">{rarePct}%</span>
            </div>
            <div className="ss__odds-seg ss__odds-seg--epic" style={{ flex: Math.max(0.5, odds.epic + odds.legendary) }}>
              {epicPct > 2 && <span className="ss__odds-pct">{epicPct}%</span>}
            </div>
          </div>
          <div className="ss__odds-legend">
            <span><span className="ss__dot ss__dot--common" />Common/Uncommon</span>
            <span><span className="ss__dot ss__dot--rare"   />Rare</span>
            <span><span className="ss__dot ss__dot--epic"   />Epic/Legendary</span>
          </div>
        </div>
      )}

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

      {/* ── TModel2 — full body left, commercial speech bubble right ── */}
      <div className="ss__quip-row">
        <img className="ss__quip-sprite" src={tmodel2Src} alt="T-Model2" />
        <div className="ss__quip-bubble">
          <p className="ss__quip-text">{quip}</p>
        </div>
      </div>
    </div>
  );
}
