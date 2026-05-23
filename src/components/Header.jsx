// src/components/Header.jsx
import './Header.css';
import { streakEmoji } from '../config/gameConfig.js';

export default function Header({ playerData }) {
  const streak = playerData?.streak?.count ?? 0;
  const emoji  = streakEmoji(streak);
  const showStreak = streak >= 7; // only show milestone streaks in header

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__eagle" aria-hidden="true">🦅</span>
        <div className="header__text">
          <span className="header__name">Buzzard Roost</span>
          <span className="header__sub">Daily Cast</span>
        </div>
      </div>

      {showStreak && (
        <div className="header__streak" aria-label={`${streak} day streak`}>
          <span>{emoji}</span>
          <span className="header__streak-count">{streak}</span>
        </div>
      )}
    </header>
  );
}
