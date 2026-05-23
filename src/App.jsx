// src/App.jsx  – V2 (3-casts-per-day)
// Phase flow:
//   landing → spot → lure → cast[style]
//   → game[cast #N: CastMeter→BiteTiming→FightMeter→CatchReveal]
//   → (repeat for each remaining cast, or → played if limit hit)
//   → result  (after all casts done, shows best + leaderboard + stats)
import { useState, useEffect } from 'react';
import './App.css';
import Header        from './components/Header.jsx';
import LandingScreen from './components/LandingScreen.jsx';
import SelectionStep from './components/SelectionStep.jsx';
import DailyCastGame from './components/DailyCastGame.jsx';
import ResultCard    from './components/ResultCard.jsx';
import Leaderboard   from './components/Leaderboard.jsx';
import PlayerStats   from './components/PlayerStats.jsx';
import AlreadyPlayed from './components/AlreadyPlayed.jsx';
import { SPOTS, LURES, CAST_STYLES } from './data/gameData.js';
import { buildResult } from './utils/gameLogic.js';
import { DEV_DISABLE_DAILY_LIMIT, DAILY_CAST_LIMIT } from './config/gameConfig.js';
import {
  hasUsedAllCastsToday, loadTodayResult, loadTodayCatches, loadPlayerData,
  recordCastResult, updateStreak, checkAndUnlockBadges,
} from './utils/storageManager.js';

export default function App() {
  // ── Route state ──────────────────────────────────────────
  const [phase,         setPhase]         = useState('landing');
  // Selection choices (persist across multiple casts in a session)
  const [spot,          setSpot]          = useState(null);
  const [lure,          setLure]          = useState(null);
  const [castStyle,     setCastStyle]     = useState(null);

  // Per-cast working state
  const [currentCastN,  setCurrentCastN]  = useState(1);   // which cast we're on (1-based)
  const [baseResult,    setBaseResult]    = useState(null); // rolled before gameplay

  // Session results
  const [sessionCatches, setSessionCatches] = useState([]); // all results this session
  const [bestResult,     setBestResult]     = useState(null);
  const [newBadges,      setNewBadges]      = useState([]);
  const [challengeData,  setChallengeData]  = useState(null);

  // Player data from storage
  const [playerData,    setPlayerData]    = useState(null);

  // ── On mount ─────────────────────────────────────────────
  useEffect(() => {
    // Parse ?challenge= from URL
    const params    = new URLSearchParams(window.location.search);
    const challenge = params.get('challenge');
    if (challenge) {
      const [fishId, rarity, pts] = challenge.split('|');
      if (fishId && rarity && pts) {
        setChallengeData({ fishId, rarity, points: parseInt(pts, 10) });
      }
    }

    const data = loadPlayerData();
    setPlayerData(data);

    // If all casts used, go straight to played screen
    if (!DEV_DISABLE_DAILY_LIMIT && hasUsedAllCastsToday()) {
      const todayResult  = loadTodayResult();
      const todayCatches = loadTodayCatches();
      if (todayResult || todayCatches.length > 0) {
        setPhase('played');
      }
      // If integrity check wiped the result, player can cast again
    } else if (!DEV_DISABLE_DAILY_LIMIT) {
      // Partially used: some casts remain — start at the correct cast number
      setCurrentCastN(data.castsUsedToday + 1);
    }
  }, []);

  // ── Selection handlers ────────────────────────────────────
  function handleSelectSpot(spotId) {
    setSpot(spotId);
    setPhase('lure');
  }

  function handleSelectLure(lureId) {
    setLure(lureId);
    setPhase('cast');
  }

  function handleSelectCast(castId) {
    setCastStyle(castId);
    // Build the base result NOW so gameplay bonuses can be applied on top.
    const preBuilt = buildResult(spot, lure, castId);
    setBaseResult(preBuilt);
    setPhase('game');
  }

  // ── Called after each cast's gameplay phases complete ─────
  function handleCastComplete(finalResult) {
    // Save to storage
    const streak = updateStreak();
    const { newBadges: fresh } = checkAndUnlockBadges(finalResult, streak);
    recordCastResult(finalResult);

    // Accumulate session catches
    const updatedCatches = [...sessionCatches, finalResult];
    setSessionCatches(updatedCatches);

    // Track best
    const best = updatedCatches.reduce((b, c) => (!b || c.points > b.points) ? c : b, null);
    setBestResult(best);
    setNewBadges(prev => {
      const existingIds = prev.map(b => b.id);
      return [...prev, ...fresh.filter(b => !existingIds.includes(b.id))];
    });
    setPlayerData(loadPlayerData());

    // Advance to next cast or results
    const castsUsed = updatedCatches.length;
    const canCastAgain = DEV_DISABLE_DAILY_LIMIT
      ? castsUsed < DAILY_CAST_LIMIT
      : !hasUsedAllCastsToday();

    if (canCastAgain) {
      setCurrentCastN(castsUsed + 1);
      // Stay on selection → re-pick cast style for next cast
      setBaseResult(null);
      setPhase('cast');
    } else {
      setPhase('result');
    }
  }

  // ── Challenge URL builder ─────────────────────────────────
  function buildChallengeUrl(res) {
    const base = window.location.origin + window.location.pathname;
    return `${base}?challenge=${res.fishId}|${res.rarity}|${res.points}`;
  }

  // ── Render ────────────────────────────────────────────────
  const castsRemaining = playerData?.castsRemaining ?? DAILY_CAST_LIMIT;

  return (
    <div className="app-shell">
      <div className="app-card">
        <Header playerData={playerData} />

        {/* Casts remaining bar (shown during active play, not landing/result/played) */}
        {['spot','lure','cast','game'].includes(phase) && (
          <div className="app-casts-bar">
            {Array.from({ length: DAILY_CAST_LIMIT }).map((_, i) => (
              <div
                key={i}
                className={`app-cast-pip ${i < currentCastN - 1 ? 'app-cast-pip--used' : i === currentCastN - 1 ? 'app-cast-pip--active' : ''}`}
              />
            ))}
            <span className="app-casts-label">
              Cast {currentCastN} of {DAILY_CAST_LIMIT}
            </span>
          </div>
        )}

        <main className="app-main">
          {phase === 'landing' && (
            <div className="phase-enter">
              <LandingScreen
                playerData={playerData}
                challengeData={challengeData}
                onStart={() => setPhase('spot')}
              />
            </div>
          )}

          {phase === 'spot' && (
            <div className="phase-enter">
              <SelectionStep
                step={1} title="Choose Your Spot"
                subtitle="Where will you cast today?"
                options={SPOTS}
                onSelect={handleSelectSpot}
              />
            </div>
          )}

          {phase === 'lure' && (
            <div className="phase-enter">
              <SelectionStep
                step={2} title="Pick Your Lure"
                subtitle="What's on the end of your line?"
                options={LURES}
                onSelect={handleSelectLure}
              />
            </div>
          )}

          {phase === 'cast' && (
            <div className="phase-enter">
              <SelectionStep
                step={3}
                title={currentCastN > 1 ? `Cast #${currentCastN} — Choose Style` : 'Choose Your Cast'}
                subtitle="How are you throwing today?"
                options={CAST_STYLES}
                onSelect={handleSelectCast}
              />
            </div>
          )}

          {phase === 'game' && baseResult && (
            <DailyCastGame
              baseResult={baseResult}
              castNumber={currentCastN}
              totalCasts={DAILY_CAST_LIMIT}
              onCastComplete={handleCastComplete}
            />
          )}

          {phase === 'result' && bestResult && (
            <div className="phase-enter">
              <ResultCard
                result={bestResult}
                newBadges={newBadges}
                buildChallengeUrl={buildChallengeUrl}
              />
              <Leaderboard playerResult={bestResult} />
              <PlayerStats playerData={playerData} />
            </div>
          )}

          {phase === 'played' && (
            <AlreadyPlayed
              result={loadTodayResult()}
              todayCatches={loadTodayCatches()}
              playerData={playerData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
