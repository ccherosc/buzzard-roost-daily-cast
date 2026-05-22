// src/components/LandingScreen.jsx
import './LandingScreen.css';
import { MOCK_LEADERBOARD } from '../data/gameData.js';
import { streakEmoji } from '../config/gameConfig.js';

export default function LandingScreen({ playerData, challengeData, onStart }) {
  const streak   = playerData?.streak?.count ?? 0;
  const topCatch = MOCK_LEADERBOARD[0];

  return (
    <div className="landing">
      {/* Friend challenge banner */}
      {challengeData && (
        <div className="landing__challenge">
          🎯 A friend hooked a <strong className={`landing__challenge-rarity landing__challenge-rarity--${challengeData.rarity}`}>{challengeData.rarity}</strong> catch
          for <strong>{(Number.isFinite(challengeData.points) ? challengeData.points : 0).toLocaleString()} pts</strong>. Can you top them?
        </div>
      )}

      {/* Animated night-fishing scene */}
      <div className="landing__scene" aria-hidden="true">
        <div className="landing__sky">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="landing__star"
              style={{ '--delay': `${(i * 0.37).toFixed(2)}s`, '--x': `${(i * 7.3) % 100}%`, '--y': `${(i * 5.1) % 55}%` }}
            />
          ))}
          <div className="landing__moon" />
        </div>
        <div className="landing__water">
          <div className="landing__wave" />
          <div className="landing__wave landing__wave--2" />
          <div className="landing__bobber">
            <div className="landing__bobber-top" />
            <div className="landing__bobber-bottom" />
          </div>
          <div className="landing__ripple" />
          <div className="landing__ripple landing__ripple--2" />
        </div>
      </div>

      {/* Brand block */}
      <div className="landing__brand">
        <h1 className="landing__title">🦅 Buzzard Roost</h1>
        <p className="landing__daily">Daily Cast</p>
        <p className="landing__tagline">One cast. One chance. Make it count.</p>
      </div>

      {/* Streak callout */}
      {streak > 0 && (
        <div className="landing__streak">
          {streakEmoji(streak)} {streak}-day streak — don't break it!
        </div>
      )}

      {/* FOMO: today's top catch */}
      <div className="landing__fomo">
        <span className="landing__fomo-label">Today's top catch</span>
        <span className="landing__fomo-catch">
          <span className={`rarity-badge rarity-badge--${topCatch.rarity}`}>{topCatch.rarity}</span>
          {topCatch.fish} · {topCatch.points.toLocaleString()} pts
        </span>
      </div>

      <button className="btn btn--primary btn--large landing__cta" onClick={onStart}>
        🎣 Make Today's Cast
      </button>

      <p className="landing__legal">
        Free to play · New catch available daily at midnight
      </p>
    </div>
  );
}
