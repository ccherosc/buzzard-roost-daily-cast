// src/components/CastAnimation.jsx
import { useState, useEffect, useRef } from 'react';
import './CastAnimation.css';

const PHASES = [
  { key: 'casting', duration: 1500, label: 'Casting…',                    sprite: 'cast'       },
  { key: 'splash',  duration:  800, label: '💦 Splash!',                   sprite: 'line-out'   },
  { key: 'waiting', duration: 2500, label: '🎣 Waiting for a bite…',       sprite: 'fishing-se' },
  { key: 'tension', duration:  800, label: "⚡ Something's on the line!",   sprite: 'bite'       },
  { key: 'hooked',  duration: 1000, label: '🐟 Fish hooked!',               sprite: 'fish-on'    },
  { key: 'reeling', duration:  700, label: 'Reeling in…',                   sprite: 'showing'    },
];

function spriteUrl(name) {
  return new URL(`../assets/sprites/${name}.png`, import.meta.url).href;
}

const SPRITE_URLS = {
  'cast':       spriteUrl('cast'),
  'line-out':   spriteUrl('line-out'),
  'fishing-se': spriteUrl('fishing-se'),
  'bite':       spriteUrl('bite'),
  'fish-on':    spriteUrl('fish-on'),
  'pulling':    spriteUrl('pulling'),
  'showing':    spriteUrl('showing'),
};

export default function CastAnimation({ onComplete }) {
  const [phaseIdx,   setPhaseIdx]   = useState(0);
  const [altSprite,  setAltSprite]  = useState(false); // hooked phase: fish-on ↔ pulling
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Main phase chain
  useEffect(() => {
    let elapsed = 0;
    const timers = PHASES.map((phase, i) => {
      const t = setTimeout(() => setPhaseIdx(i), elapsed);
      elapsed += phase.duration;
      return t;
    });
    const done = setTimeout(() => onCompleteRef.current(), elapsed);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);

  // Alternate sprites during hooked phase
  useEffect(() => {
    if (PHASES[phaseIdx].key !== 'hooked') { setAltSprite(false); return; }
    const id = setInterval(() => setAltSprite(v => !v), 300);
    return () => clearInterval(id);
  }, [phaseIdx]);

  const phase      = PHASES[phaseIdx];
  const spriteName = (phase.key === 'hooked' && altSprite) ? 'pulling' : phase.sprite;

  return (
    <div className={`ca ca--${phase.key}`} aria-live="polite">

      {/* Sky */}
      <div className="ca__sky">
        <div className="ca__moon" aria-hidden="true" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="ca__star" style={{ '--i': i }} aria-hidden="true" />
        ))}
        <div className="ca__tree ca__tree--l" aria-hidden="true" />
        <div className="ca__tree ca__tree--r" aria-hidden="true" />
      </div>

      {/* Fisherman sprite */}
      <div className="ca__fisherman" aria-label="Fisherman animation">
        <img
          key={spriteName}
          src={SPRITE_URLS[spriteName]}
          alt=""
          className="ca__sprite"
        />
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

        <div className="ca__splash" aria-hidden="true">
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
