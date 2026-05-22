// src/components/PlayerStats.jsx
import './PlayerStats.css';
import { streakEmoji } from '../config/gameConfig.js';

export default function PlayerStats({ playerData }) {
  const streak      = playerData?.streak?.count      ?? 0;
  const bestCatch   = playerData?.bestCatch           ?? null;
  const totalPoints = playerData?.totalPoints         ?? 0;
  const badges      = playerData?.badges              ?? [];

  return (
    <div className="ps">
      <h3 className="ps__title">Your Season</h3>
      <div className="ps__tiles">
        <div className="ps__tile">
          <span className="ps__tile-icon">{streakEmoji(streak)}</span>
          <span className="ps__tile-value">{streak}</span>
          <span className="ps__tile-label">Day Streak</span>
        </div>
        <div className="ps__tile">
          <span className="ps__tile-icon">🏆</span>
          <span className="ps__tile-value ps__tile-value--sm">
            {bestCatch ? bestCatch.fishName : '—'}
          </span>
          <span className="ps__tile-label">Best Catch</span>
        </div>
        <div className="ps__tile">
          <span className="ps__tile-icon">⭐</span>
          <span className="ps__tile-value">{totalPoints.toLocaleString()}</span>
          <span className="ps__tile-label">Total Points</span>
        </div>
      </div>
      {badges.length > 0 && (
        <div className="ps__badges">
          <span className="ps__badges-label">Achievements</span>
          <div className="ps__badges-row">
            {badges.map(b => (
              <span key={b.id} className="ps__badge" title={b.label}>{b.emoji}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
