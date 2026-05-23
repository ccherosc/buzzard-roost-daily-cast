// src/components/AlreadyPlayed.jsx
import { useState, useEffect } from 'react';
import './AlreadyPlayed.css';
import { streakEmoji } from '../config/gameConfig.js';
import { getFishImage } from '../utils/fishImages.js';

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

export default function AlreadyPlayed({ result, playerData }) {
  const [timeLeft, setTimeLeft] = useState(msUntilMidnight());
  const streak = playerData?.streak?.count ?? 0;

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, s } = formatCountdown(timeLeft);

  return (
    <div className="ap">
      {/* Living water background */}
      <div className="ap__scene" aria-hidden="true">
        <div className="ap__sky" />
        <div className="ap__water">
          <div className="ap__wave" />
          <div className="ap__wave ap__wave--2" />
          <div className="ap__bobber">
            <div className="ap__bobber-top" /><div className="ap__bobber-bot" />
          </div>
        </div>
      </div>

      <div className="ap__content">
        <h2 className="ap__heading">Today's Cast is In</h2>

        {streak > 0 && (
          <div className="ap__streak">
            {streakEmoji(streak)} {streak}-day streak — keep it going!
          </div>
        )}

        {/* Today's catch recap */}
        <div className={`ap__catch ap__catch--${result.rarity}`}>
          <span className={`rarity-badge rarity-badge--${result.rarity}`}>
            ★ {result.rarity.toUpperCase()}
          </span>
          {getFishImage(result.fishId)
            ? <img className="ap__catch-fish-img" src={getFishImage(result.fishId)} alt={result.fishName} />
            : <span className="ap__catch-emoji" role="img" aria-label={result.fishName}>{result.emoji}</span>
          }
          <span className="ap__catch-name">{result.fishName}</span>
          <span className="ap__catch-stats">{result.weight} lbs · {result.points.toLocaleString()} pts</span>
          <div className="ap__catch-coupon">
            <span className="ap__coupon-label">{result.coupon.label}</span>
            <code className="ap__coupon-code">{result.coupon.code}</code>
          </div>
        </div>

        {/* Countdown */}
        <div className="ap__countdown">
          <p className="ap__countdown-label">Your next cast drops in</p>
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
