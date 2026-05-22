// src/components/CastAnimation.jsx
import { useState, useEffect, useRef } from 'react';
import './CastAnimation.css';

const PHASES = [
  { key: 'casting', duration: 1500, label: 'Casting…'                    },
  { key: 'splash',  duration:  800, label: '💦 Splash!'                   },
  { key: 'waiting', duration: 2500, label: '🎣 Waiting for a bite…'       },
  { key: 'tension', duration:  800, label: "⚡ Something's on the line!"   },
  { key: 'hooked',  duration: 1000, label: '🐟 Fish hooked!'               },
  { key: 'reeling', duration:  700, label: 'Reeling in…'                   },
];

export default function CastAnimation({ onComplete }) {
  const [phaseIdx,  setPhaseIdx]  = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let elapsed = 0;
    const timers = PHASES.map((phase, i) => {
      const t = setTimeout(() => setPhaseIdx(i), elapsed);
      elapsed += phase.duration;
      return t;
    });
    const done = setTimeout(() => onCompleteRef.current(), elapsed);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []); // run once on mount

  const phase = PHASES[phaseIdx];

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

      {/* Dock + rod (SVG) */}
      <div className="ca__dock-wrap" aria-hidden="true">
        <div className="ca__dock" />
        <svg className="ca__rod" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg">
          <line className="ca__rod-body" x1="10" y1="155" x2="130" y2="50" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" />
          <line className="ca__rod-tip"  x1="130" y1="50" x2="195" y2="38" stroke="#a08020" strokeWidth="2.5" strokeLinecap="round" />
          <line className="ca__line"     x1="195" y1="38" x2="170" y2="120" stroke="#d0e0f0" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>

      {/* Water */}
      <div className="ca__water" aria-hidden="true">
        <div className="ca__wave" />
        <div className="ca__wave ca__wave--2" />

        {/* Bobber */}
        <div className="ca__bobber">
          <div className="ca__bobber-top" />
          <div className="ca__bobber-bot" />
        </div>

        {/* Ripples */}
        <div className="ca__ripple ca__ripple--1" />
        <div className="ca__ripple ca__ripple--2" />
        <div className="ca__ripple ca__ripple--3" />

        {/* Splash drops */}
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
