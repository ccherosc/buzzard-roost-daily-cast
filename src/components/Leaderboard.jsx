// src/components/Leaderboard.jsx
import './Leaderboard.css';
import { MOCK_LEADERBOARD } from '../data/gameData.js';

export default function Leaderboard({ playerResult }) {
  // Build display board: inject player at correct rank
  const base = MOCK_LEADERBOARD.map(e => ({ ...e }));
  let insertIdx = base.length;
  for (let i = 0; i < base.length; i++) {
    if (playerResult.points > base[i].points) { insertIdx = i; break; }
  }

  const playerEntry = {
    name: 'You ✦',
    fish: playerResult.fishName,
    rarity: playerResult.rarity,
    points: playerResult.points,
    isPlayer: true,
  };

  const withPlayer = [...base];
  withPlayer.splice(insertIdx, 0, playerEntry);
  const ranked = withPlayer.slice(0, 11).map((e, i) => ({ ...e, displayRank: i + 1 }));

  const playerRow  = ranked.find(e => e.isPlayer);
  const top10      = ranked.slice(0, 10);
  const playerOut  = playerRow && playerRow.displayRank > 10;

  return (
    <div className="lb">
      <div className="lb__header">
        <h3 className="lb__title">Today's Anglers</h3>
        <span className="lb__badge">Updated Daily</span>
      </div>

      <div className="lb__list">
        {top10.map((entry, i) => (
          <div key={i} className={`lb__row ${entry.isPlayer ? 'lb__row--player' : ''}`}>
            <span className="lb__rank">#{entry.displayRank}</span>
            <span className="lb__name">{entry.name}</span>
            <span className="lb__fish">
              {entry.fish}
              <span className={`rarity-badge rarity-badge--${entry.rarity}`}>{entry.rarity}</span>
            </span>
            <span className="lb__pts">{entry.points.toLocaleString()}</span>
          </div>
        ))}

        {playerOut && (
          <>
            <div className="lb__ellipsis">· · ·</div>
            <div className="lb__row lb__row--player">
              <span className="lb__rank">#{insertIdx + 1}</span>
              <span className="lb__name">You ✦</span>
              <span className="lb__fish">
                {playerResult.fishName}
                <span className={`rarity-badge rarity-badge--${playerResult.rarity}`}>{playerResult.rarity}</span>
              </span>
              <span className="lb__pts">{playerResult.points.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* SUPABASE: fetch real leaderboard
          Replace MOCK_LEADERBOARD with:
          const { data } = await supabase
            .from('daily_leaderboard')
            .select('*')
            .eq('date', today)
            .order('points', { ascending: false })
            .limit(10);
      */}
    </div>
  );
}
