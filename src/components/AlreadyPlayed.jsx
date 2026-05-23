// src/components/AlreadyPlayed.jsx
// V2: shows all of today's catches (up to 3) + Snowball mascot + countdown to midnight.
import { useState, useEffect } from 'react';
import './AlreadyPlayed.css';
import { streakEmoji } from '../config/gameConfig.js';
import { getFishImage } from '../utils/fishImages.js';
import MascotQuip from './MascotQuip.jsx';

function msUntilMidnight() {
  const now = new Date();
  const mid = new Date(now); mid.setDate(mid.getDate() + 1); mid.setHours(0,0,0,0);
  return mid - now;
}

function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const p = n => String(n).padStart(2, '0');
  return { h: p(h), m: p(m), s: p(s) };
}

export default function AlreadyPlayed({ result, todayCatches = [], playerData }) {
  const [timeLeft, setTimeLeft] = useState(msUntilMidnight());
  const streak = playerData?.streak?.count ?? 0;

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, s } = formatCountdown(timeLeft);

  const catches    = todayCatches.length > 0 ? todayCatches : (result ? [result] : []);
  const bestPoints = catches.reduce((max, c) => Math.max(max, c.points ?? 0), 0);

  const snowballLine = streak > 0
    ? `${streak}-day streak. Come back tomorrow and don't break it.`
    : "All three casts done. See you tomorrow.";

  return (
    <div className="ap">
      {/* Ambient water background */}
      <div className="ap__scene" aria-hidden="true">
        <div className="ap__sky" />
        <div className="ap__water">
          <div className="ap__wave" /><div className="ap__wave ap__wave--2" />
          <div className="ap__bobber">
            <div className="ap__bobber-top" /><div className="ap__bobber-bot" />
          </div>
        </div>
      </div>

      <div className="ap__content">
        <h2 className="ap__heading">All Casts Done!</h2>

        {/* Snowball mascot with streak-aware line */}
        <MascotQuip mascot="snowball" line={snowballLine} size={100} />

        {/* All today's catches */}
        <div className="ap__catches">
          {catches.map((c, i) => (
            <div
              key={i}
              className={`ap__catch ap__catch--${c.rarity} ${c.points === bestPoints && catches.length > 1 ? 'ap__catch--best' : ''}`}
            >
              {c.points === bestPoints && catches.length > 1 && (
                <span className="ap__catch-best-label">⭐ Best Catch</span>
              )}
              <span className={`rarity-badge rarity-badge--${c.rarity}`}>
                ★ {c.rarity.toUpperCase()}
              </span>
              {getFishImage(c.fishId)
                ? <img className="ap__catch-fish-img" src={getFishImage(c.fishId)} alt={c.fishName} />
                : <span className="ap__catch-emoji" role="img" aria-label={c.fishName}>{c.emoji}</span>
              }
              <span className="ap__catch-name">{c.fishName}</span>
              <span className="ap__catch-stats">{c.weight} lbs · {c.points.toLocaleString()} pts</span>
              {c.coupon && (
                <div className="ap__catch-coupon">
                  <span className="ap__coupon-label">{c.coupon.label}</span>
                  <code className="ap__coupon-code">{c.coupon.code}</code>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Countdown */}
        <div className="ap__countdown">
          <p className="ap__countdown-label">New casts available in</p>
          <div className="ap__countdown-clock">
            <div className="ap__unit"><span className="ap__num">{h}</span><span className="ap__unit-label">hrs</span></div>
            <span className="ap__colon">:</span>
            <div className="ap__unit"><span className="ap__num">{m}</span><span className="ap__unit-label">min</span></div>
            <span className="ap__colon">:</span>
            <div className="ap__unit"><span className="ap__num">{s}</span><span className="ap__unit-label">sec</span></div>
          </div>
        </div>

        <a className="btn btn--primary" href="https://buzzardgear.com/" target="_blank" rel="noopener noreferrer">
          Shop Buzzard Roost →
        </a>
      </div>
    </div>
  );
}
