// src/components/LandingScreen.jsx
import './LandingScreen.css';
import { MOCK_LEADERBOARD } from '../data/gameData.js';
import { streakEmoji } from '../config/gameConfig.js';

// ── Star field ────────────────────────────────────────────────────
// 24 hand-placed stars — well-spaced, not crowded, varied sizes so
// the sky feels natural rather than algorithmic.
// Format: [left%, top%, sizePx, durationS, delayS]
// top% values are capped at ~58% to stay above the water section.
const STARS = [
  [  6,   8,  2, 3.1, 0.0 ],
  [ 17,   3,  3, 2.4, 1.6 ],
  [ 29,  19,  1, 4.0, 0.7 ],
  [ 41,   6,  2, 2.8, 2.2 ],
  [ 54,  14,  2, 3.6, 0.4 ],
  [ 68,   4,  3, 2.1, 1.9 ],
  [ 80,  11,  1, 4.3, 1.0 ],
  [ 93,   8,  2, 3.0, 2.7 ],
  [ 11,  31,  1, 2.6, 1.3 ],
  [ 24,  26,  2, 3.9, 0.8 ],
  [ 37,  42,  1, 4.5, 2.0 ],
  [ 50,  22,  2, 2.3, 0.1 ],
  [ 63,  36,  1, 3.4, 1.7 ],
  [ 75,  28,  2, 2.7, 0.5 ],
  [ 87,  44,  1, 4.1, 2.5 ],
  [  3,  48,  1, 3.7, 1.1 ],
  [ 20,  53,  2, 2.2, 2.9 ],
  [ 46,  49,  1, 3.8, 0.6 ],
  [ 60,  45,  2, 2.9, 1.4 ],
  [ 78,  51,  1, 4.6, 0.3 ],
  [ 88,  20,  2, 3.3, 2.1 ],
  [ 33,  57,  1, 2.5, 1.8 ],
  [ 14,  16,  1, 3.2, 0.9 ],
  [ 72,  40,  1, 4.2, 2.4 ],
];

export default function LandingScreen({ playerData, challengeData, onStart }) {
  const streak   = playerData?.streak?.count ?? 0;
  const topCatch = MOCK_LEADERBOARD[0];

  return (
    <div className="landing">
      {/* Friend challenge banner */}
      {challengeData && (
        <div className="landing__challenge">
          🎯 A friend hooked a{' '}
          <strong className={`landing__challenge-rarity landing__challenge-rarity--${challengeData.rarity}`}>
            {challengeData.rarity}
          </strong>{' '}
          catch for <strong>
            {(Number.isFinite(challengeData.points) ? challengeData.points : 0).toLocaleString()} pts
          </strong>. Can you top them?
        </div>
      )}

      {/* ── Starlit night fishing scene ─────────────────────────── */}
      <div className="landing__scene" aria-hidden="true">

        {/* Sky + stars + moon */}
        <div className="landing__sky">
          {STARS.map(([x, y, size, dur, delay], i) => (
            <div
              key={i}
              className="landing__star"
              style={{
                '--x':     `${x}%`,
                '--y':     `${y}%`,
                '--size':  `${size}px`,
                '--dur':   `${dur}s`,
                '--delay': `${delay}s`,
              }}
            />
          ))}
          <div className="landing__moon" />
        </div>

        {/* Water with bobber, ripples, and moon reflection */}
        <div className="landing__water">
          <div className="landing__wave" />
          <div className="landing__wave landing__wave--2" />

          {/* Bobber: line floats above, red/white body bobs in water */}
          <div className="landing__bobber">
            <div className="landing__fishing-line" />
            <div className="landing__bobber-top" />
            <div className="landing__bobber-mid" />
            <div className="landing__bobber-bottom" />
          </div>

          {/* Ripple rings around the bobber */}
          <div className="landing__ripple" />
          <div className="landing__ripple landing__ripple--2" />

          {/* Moon's shimmer reflection on water */}
          <div className="landing__moon-sheen" />
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
