// src/components/Header.jsx
import './Header.css';
import logoSrc from '../../assets/reference/buzzardroostlogo.avif';
import { streakEmoji } from '../config/gameConfig.js';

export default function Header({ playerData }) {
  const streak     = playerData?.streak?.count ?? 0;
  const emoji      = streakEmoji(streak);
  const showStreak = streak >= 7;

  return (
    <header className="header">
      <div className="header__brand">
        <img className="header__logo" src={logoSrc} alt="Buzzard Roost" />
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
