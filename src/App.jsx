// src/App.jsx  – V2 retool (3-casts-per-day)
// Phase flow: landing → setup → game → (setup partial → game)* → result
// Spot + lure persist across all 3 casts; cast style re-picks each cast.
import { useState, useEffect } from 'react';
import './App.css';
import Header        from './components/Header.jsx';
import LandingScreen from './components/LandingScreen.jsx';
import SetupScreen   from './components/SetupScreen.jsx';
import DailyCastGame from './components/DailyCastGame.jsx';
import ResultCard    from './components/ResultCard.jsx';
import Leaderboard   from './components/Leaderboard.jsx';
import PlayerStats   from './components/PlayerStats.jsx';
import AlreadyPlayed from './components/AlreadyPlayed.jsx';
import { buildResult }        from './utils/gameLogic.js';
import { buildGameParams }    from './utils/gameParams.js';
import { DEV_DISABLE_DAILY_LIMIT, DAILY_CAST_LIMIT } from './config/gameConfig.js';
import {
  hasUsedAllCastsToday, loadTodayResult, loadTodayCatches, loadPlayerData,
  recordCastResult, recordEmptyCast, updateStreak, checkAndUnlockBadges,
} from './utils/storageManager.js';
import { submitCatch } from './utils/leaderboardApi.js';
import MascotQuip            from './components/MascotQuip.jsx';
import { getSnowballResultLine } from './utils/mascotLines.js';

export default function App() {
  const [phase,          setPhase]          = useState('landing');
  const [spot,           setSpot]           = useState(null);  // persists across 3 casts
  const [lure,           setLure]           = useState(null);  // persists across 3 casts
  const [currentCastN,   setCurrentCastN]   = useState(1);
  const [baseResult,     setBaseResult]     = useState(null);
  const [gameParams,     setGameParams]     = useState(null);
  const [sessionCatches, setSessionCatches] = useState([]);
  const [bestResult,     setBestResult]     = useState(null);
  const [newBadges,      setNewBadges]      = useState([]);
  const [challengeData,  setChallengeData]  = useState(null);
  const [playerData,     setPlayerData]     = useState(null);

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const challenge = params.get('challenge');
    if (challenge) {
      const [fishId, rarity, pts] = challenge.split('|');
      if (fishId && rarity && pts) setChallengeData({ fishId, rarity, points: parseInt(pts, 10) });
    }
    const data = loadPlayerData();
    setPlayerData(data);
    if (!DEV_DISABLE_DAILY_LIMIT && hasUsedAllCastsToday()) {
      const todayResult  = loadTodayResult();
      const todayCatches = loadTodayCatches();
      if (todayResult || todayCatches.length > 0) setPhase('played');
    } else if (!DEV_DISABLE_DAILY_LIMIT) {
      setCurrentCastN(data.castsUsedToday + 1);
    }
  }, []);

  // ── Called when SetupScreen completes ─────────────────────────────────────
  function handleSetupComplete({ spotId, lureId, castStyleId }) {
    // Persist spot + lure (set on cast 1; already set on casts 2+)
    if (!spot) setSpot(spotId);
    if (!lure) setLure(lureId);

    const preBuilt = buildResult(spotId, lureId, castStyleId);
    const params   = buildGameParams(spotId, lureId, castStyleId, preBuilt.rarity);
    setBaseResult(preBuilt);
    setGameParams(params);
    setPhase('game');
  }

  // ── Called after each cast's gameplay phases complete ─────────────────────
  // finalResult is null for empty casts (missed bite / line broke / fish escaped).
  function handleCastComplete(finalResult) {
    const updatedCatches = [...sessionCatches, finalResult];  // null for empty casts
    setSessionCatches(updatedCatches);

    if (!finalResult) {
      // Empty cast — count it but don't record a fish or submit to leaderboard
      recordEmptyCast();
      setPlayerData(loadPlayerData());
    } else {
      // Fish caught — full record + leaderboard
      const streak = updateStreak();
      const { newBadges: fresh } = checkAndUnlockBadges(finalResult, streak);
      recordCastResult(finalResult);
      submitCatch(finalResult);   // fire-and-forget
      const realCatches = updatedCatches.filter(Boolean);
      const best = realCatches.reduce((b, c) => (!b || c.points > b.points) ? c : b, null);
      setBestResult(best);
      setNewBadges(prev => {
        const existingIds = prev.map(b => b.id);
        return [...prev, ...fresh.filter(b => !existingIds.includes(b.id))];
      });
      setPlayerData(loadPlayerData());
    }

    const castsUsed = updatedCatches.length;
    const canCastAgain = DEV_DISABLE_DAILY_LIMIT
      ? castsUsed < DAILY_CAST_LIMIT
      : !hasUsedAllCastsToday();

    if (canCastAgain) {
      setCurrentCastN(castsUsed + 1);
      setBaseResult(null);
      setGameParams(null);
      setPhase('setup');  // back to setup — spot+lure locked, only cast re-picks
    } else {
      setPhase('result');
    }
  }

  function buildChallengeUrl(res) {
    const base = window.location.origin + window.location.pathname;
    return `${base}?challenge=${res.fishId}|${res.rarity}|${res.points}`;
  }

  return (
    <div className="app-shell">
      <div className="app-card">
        <Header playerData={playerData} />

        {/* Cast progress bar — shown during setup + game */}
        {['setup', 'game'].includes(phase) && (
          <div className="app-casts-bar">
            {Array.from({ length: DAILY_CAST_LIMIT }).map((_, i) => (
              <div
                key={i}
                className={`app-cast-pip ${i < currentCastN - 1 ? 'app-cast-pip--used' : i === currentCastN - 1 ? 'app-cast-pip--active' : ''}`}
              />
            ))}
            <span className="app-casts-label">Cast {currentCastN} of {DAILY_CAST_LIMIT}</span>
          </div>
        )}

        <main className="app-main">
          {phase === 'landing' && (
            <div className="phase-enter">
              <LandingScreen
                playerData={playerData}
                challengeData={challengeData}
                onStart={() => setPhase('setup')}
              />
            </div>
          )}

          {phase === 'setup' && (
            <div className="phase-enter">
              <SetupScreen
                castNumber={currentCastN}
                lockedSpot={currentCastN > 1 ? spot : null}
                lockedLure={currentCastN > 1 ? lure : null}
                onComplete={handleSetupComplete}
              />
            </div>
          )}

          {phase === 'game' && baseResult && gameParams && (
            <DailyCastGame
              baseResult={baseResult}
              gameParams={gameParams}
              castNumber={currentCastN}
              totalCasts={DAILY_CAST_LIMIT}
              onCastComplete={handleCastComplete}
            />
          )}

          {phase === 'result' && (
            <div className="phase-enter">
              {bestResult ? (
                <>
                  <ResultCard
                    result={bestResult}
                    newBadges={newBadges}
                    buildChallengeUrl={buildChallengeUrl}
                  />
                  <Leaderboard playerResult={bestResult} playerId={playerData?.playerId} />
                  <PlayerStats playerData={playerData} />
                </>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-8) var(--space-4)', textAlign:'center' }}>
                  <span style={{ fontSize:'3.5rem' }}>😔</span>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', letterSpacing:'2px', textTransform:'uppercase', color:'var(--text-primary)', margin:0 }}>Tough Day</p>
                  <p style={{ fontFamily:'var(--font-body)', color:'var(--text-secondary)', margin:0 }}>No catches today. Come back tomorrow!</p>
                </div>
              )}
              {/* Snowball wrap-up — always visible at session end */}
              <MascotQuip
                mascot="snowball"
                line={getSnowballResultLine(playerData?.streak?.count ?? 0, sessionCatches.filter(Boolean))}
                size={120}
                side="right"
              />
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
