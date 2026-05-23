// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import Header        from './components/Header.jsx';
import LandingScreen from './components/LandingScreen.jsx';
import SelectionStep from './components/SelectionStep.jsx';
import CastAnimation from './components/CastAnimation.jsx';
import ResultCard    from './components/ResultCard.jsx';
import Leaderboard   from './components/Leaderboard.jsx';
import PlayerStats   from './components/PlayerStats.jsx';
import AlreadyPlayed from './components/AlreadyPlayed.jsx';
import { SPOTS, LURES, CAST_STYLES } from './data/gameData.js';
import { buildResult } from './utils/gameLogic.js';
import { DEV_DISABLE_DAILY_LIMIT } from './config/gameConfig.js';
import {
  hasPlayedToday, loadTodayResult, loadPlayerData,
  saveResult, updateStreak, checkAndUnlockBadges,
} from './utils/storageManager.js';

// Phases: landing → spot → lure → cast → animation → result | played
export default function App() {
  const [phase,       setPhase]       = useState('landing');
  const [spot,        setSpot]        = useState(null);
  const [lure,        setLure]        = useState(null);
  const [castStyle,   setCastStyle]   = useState(null);
  const [result,      setResult]      = useState(null);
  const [playerData,  setPlayerData]  = useState(null);
  const [newBadges,   setNewBadges]   = useState([]);
  const [challengeData, setChallengeData] = useState(null);

  // ── On mount: load player state + check daily guard ──────
  useEffect(() => {
    // Parse ?challenge=fishId|rarity|points from URL
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

    if (!DEV_DISABLE_DAILY_LIMIT && hasPlayedToday()) {
      const todayResult = loadTodayResult();
      if (todayResult) {
        setResult(todayResult);
        setPhase('played');
      }
      // If loadTodayResult returned null, integrity check failed —
      // storage was cleared, player can re-play.
    }
  }, []);

  // ── Selection handlers (each auto-advances after 300ms) ──
  function handleSelectSpot(spotId) {
    setSpot(spotId);
    setTimeout(() => setPhase('lure'), 300);
  }

  function handleSelectLure(lureId) {
    setLure(lureId);
    setTimeout(() => setPhase('cast'), 300);
  }

  function handleSelectCast(castId) {
    setCastStyle(castId);
    // Pre-build the result NOW so CastAnimation can show the real
    // fish during the catch phase — not a generic placeholder.
    const preBuilt = buildResult(spot, lure, castId);
    setResult(preBuilt);
    setTimeout(() => setPhase('animation'), 300);
  }

  // ── Cast complete: result already built, just save + advance ─
  function handleCastComplete() {
    // `result` is already set from handleSelectCast — no re-roll.
    setResult(prev => {
      const streak = updateStreak();
      const { newBadges: fresh } = checkAndUnlockBadges(prev, streak);
      saveResult(prev);
      setNewBadges(fresh);
      setPlayerData(loadPlayerData());
      return prev;
    });
    setPhase('result');
  }

  // ── Challenge URL builder (used by ResultCard share) ─────
  function buildChallengeUrl(res) {
    const base = window.location.origin + window.location.pathname;
    return `${base}?challenge=${res.fishId}|${res.rarity}|${res.points}`;
  }

  return (
    <div className="app-shell">
      <div className="app-card">
        <Header playerData={playerData} />

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
                step={3} title="Choose Your Cast"
                subtitle="How are you throwing today?"
                options={CAST_STYLES}
                onSelect={handleSelectCast}
              />
            </div>
          )}

          {phase === 'animation' && (
            <CastAnimation
              spot={spot} lure={lure} castStyle={castStyle}
              result={result}
              onComplete={handleCastComplete}
            />
          )}

          {phase === 'result' && result && (
            <div className="phase-enter">
              <ResultCard
                result={result}
                newBadges={newBadges}
                buildChallengeUrl={buildChallengeUrl}
              />
              <Leaderboard playerResult={result} />
              <PlayerStats playerData={playerData} />
            </div>
          )}

          {phase === 'played' && result && (
            <AlreadyPlayed result={result} playerData={playerData} />
          )}
        </main>
      </div>
    </div>
  );
}
