// src/components/ResultCard.jsx
import { useState, useEffect } from 'react';
import './ResultCard.css';
import { SCARCITY_COPY } from '../config/gameConfig.js';
import { getFishImage } from '../utils/fishImages.js';

const RARITY_LABELS = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
  epic: 'Epic', legendary: 'Legendary',
};

export default function ResultCard({ result, newBadges = [], buildChallengeUrl }) {
  const [flipped,        setFlipped]        = useState(false);
  const [couponVisible,  setCouponVisible]  = useState(false);
  const [shareStatus,    setShareStatus]    = useState('idle'); // idle | copied

  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true),       500);
    const t2 = setTimeout(() => setCouponVisible(true), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function handleShare() {
    const scarcity = SCARCITY_COPY[result.rarity] ?? '';
    const challengeUrl = buildChallengeUrl(result);
    const text = [
      `🎣 I just landed a ${RARITY_LABELS[result.rarity]} ${result.fishName} (${result.weight} lbs) on Buzzard Roost Daily Cast!`,
      scarcity,
      `Beat my ${result.points.toLocaleString()} pts →`,
      `#BuzzardRoost #DailyCast`,
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      navigator.share({ text, url: challengeUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + '\n' + challengeUrl).then(() => {
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2500);
      });
    }
  }

  return (
    <div className="rc">
      <h2 className="rc__heading">Today's Catch</h2>

      {/* 3D flip card */}
      <div className={`rc__flip-wrap ${flipped ? 'rc__flip-wrap--flipped' : ''}`}>
        <div className="rc__flip">
          {/* Back face (mystery) */}
          <div className="rc__face rc__face--back">
            <span className="rc__back-eagle">🦅</span>
            <span className="rc__back-brand">Buzzard Roost</span>
            <span className="rc__back-q">?</span>
          </div>
          {/* Front face (fish reveal) */}
          <div className={`rc__face rc__face--front rc__face--${result.rarity}`}>
            <span className={`rc__rarity-badge rc__rarity-badge--${result.rarity}`}>
              ★ {RARITY_LABELS[result.rarity].toUpperCase()}
            </span>
            {getFishImage(result.fishId)
              ? <img className="rc__fish-img" src={getFishImage(result.fishId)} alt={result.fishName} />
              : <span className="rc__emoji" role="img" aria-label={result.fishName}>{result.emoji}</span>
            }
            <h3 className="rc__name">{result.fishName}</h3>
            <p  className="rc__flavor"><em>{result.flavor}</em></p>
            <div className="rc__stats">
              <div className="rc__stat">
                <span className="rc__stat-label">Weight</span>
                <span className="rc__stat-value">{result.weight} lbs</span>
              </div>
              <div className="rc__stat-divider" />
              <div className="rc__stat">
                <span className="rc__stat-label">Points</span>
                <span className="rc__stat-value">{result.points.toLocaleString()}</span>
              </div>
            </div>
            {SCARCITY_COPY[result.rarity] && (
              <p className="rc__scarcity">{SCARCITY_COPY[result.rarity]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Coupon (slides up after flip) */}
      {couponVisible && (
        <div className={`rc__coupon rc__coupon--${result.rarity}`}>
          <div className="rc__coupon-header">
            <span className="rc__coupon-label">{result.coupon.label}</span>
            <span className="rc__coupon-discount">{result.coupon.discount}</span>
          </div>
          <code className="rc__coupon-code">{result.coupon.code}</code>
          <p className="rc__coupon-hint">Enter at checkout · Buzzard Roost store</p>
        </div>
      )}

      {/* New badges */}
      {newBadges.length > 0 && (
        <div className="rc__badges">
          <span className="rc__badges-title">🎉 New achievement{newBadges.length > 1 ? 's' : ''}!</span>
          <div className="rc__badges-row">
            {newBadges.map(b => (
              <div key={b.id} className="rc__badge">{b.emoji} {b.label}</div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="rc__actions">
        <button type="button" className="btn btn--secondary" onClick={handleShare}>
          {shareStatus === 'copied' ? '✅ Copied to clipboard!' : '📤 Share My Catch'}
        </button>
        <a className="btn btn--primary" href="https://buzzardgear.com/" target="_blank" rel="noopener noreferrer">
          Shop Buzzard Roost →
        </a>
      </div>
    </div>
  );
}
