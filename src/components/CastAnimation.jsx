// src/components/CastAnimation.jsx
import { useState, useEffect, useRef } from 'react';
import './CastAnimation.css';

// Each phase: frames[] cycles at frameMs interval, single entry = static
const PHASES = [
  { key: 'casting', duration: 1500, label: 'Casting…',                  frames: ['fishing-se', 'cast'],          frameMs: 500  },
  { key: 'splash',  duration:  800, label: '💦 Splash!',                 frames: ['line-out'],                    frameMs: 0    },
  { key: 'waiting', duration: 2500, label: '🎣 Waiting for a bite…',     frames: ['fishing-se', 'waiting'],       frameMs: 1000 },
  { key: 'tension', duration:  800, label: "⚡ Something's on the line!", frames: ['fishing-se', 'bite'],          frameMs: 300  },
  { key: 'hooked',  duration: 1000, label: '🐟 Fish hooked!',             frames: ['fish-on', 'pulling'],          frameMs: 250  },
  { key: 'reeling', duration:  700, label: 'Reeling in…',                frames: ['reel-strong', 'showing'],     frameMs: 350  },
];

function spriteUrl(name) {
  return new URL(`../assets/sprites/${name}.png`, import.meta.url).href;
}

const SPRITE_URLS = {
  'cast':        spriteUrl('cast'),
  'line-out':    spriteUrl('line-out'),
  'fishing-se':  spriteUrl('fishing-se'),
  'waiting':     spriteUrl('waiting'),
  'bite':        spriteUrl('bite'),
  'fish-on':     spriteUrl('fish-on'),
  'pulling':     spriteUrl('pulling'),
  'reel-strong': spriteUrl('reel-strong'),
  'showing':     spriteUrl('showing'),
};

export default function CastAnimation({ onComplete }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Main phase timer chain
  useEffect(() => {
    let elapsed = 0;
    const timers = PHASES.map((phase, i) => {
      const t = setTimeout(() => { setPhaseIdx(i); setFrameIdx(0); }, elapsed);
      elapsed += phase.duration;
      return t;
    });
    const done = setTimeout(() => onCompleteRef.current(), elapsed);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);

  // Frame cycling within the current phase
  useEffect(() => {
    const phase = PHASES[phaseIdx];
    if (phase.frames.length <= 1 || !phase.frameMs) { setFrameIdx(0); return; }
    setFrameIdx(0);
    const id = setInterval(() => setFrameIdx(prev => (prev + 1) % phase.frames.length), phase.frameMs);
    return () => clearInterval(id);
  }, [phaseIdx]);

  const phase      = PHASES[phaseIdx];
  const spriteName = phase.frames[frameIdx] ?? phase.frames[0];

  return (
    <div className={`ca ca--${phase.key}`} aria-live="polite">

      {/* Sky */}
      <div className="ca__sky">
        <div className="ca__sun" aria-hidden="true" />
        <div className="ca__cloud ca__cloud--1" aria-hidden="true" />
        <div className="ca__cloud ca__cloud--2" aria-hidden="true" />
        <div className="ca__tree ca__tree--l" aria-hidden="true" />
        <div className="ca__tree ca__tree--r" aria-hidden="true" />
      </div>

      {/* Fisherman — outer div handles centering, inner div handles phase animations */}
      <div className="ca__fisherman" aria-label="Fisherman animation">
        <div className="ca__fisherman-inner">
          <img
            key={spriteName}
            src={SPRITE_URLS[spriteName]}
            alt=""
            className="ca__sprite"
          />
        </div>
      </div>

      {/* Water */}
      <div className="ca__water" aria-hidden="true">
        <div className="ca__wave" />
        <div className="ca__wave ca__wave--2" />
        <div className="ca__bobber">
          <div className="ca__bobber-top" />
          <div className="ca__bobber-bot" />
        </div>
        <div className="ca__ripple ca__ripple--1" />
        <div className="ca__ripple ca__ripple--2" />
        <div className="ca__ripple ca__ripple--3" />
        <div className="ca__splash">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ca__drop" style={{ '--i': i }} />
          ))}
        </div>
      </div>

      {/* Phase label */}
      <div className="ca__label">
        <span key={phase.key} className="ca__label-text">{phase.label}</span>
      </div>

      {/* Progress dots */}
      <div className="ca__progress" aria-hidden="true">
        {PHASES.map((p, i) => (
          <div key={p.key} className={`ca__pdot ${i <= phaseIdx ? 'ca__pdot--done' : ''}`} />
        ))}
      </div>
    </div>
  );
}
