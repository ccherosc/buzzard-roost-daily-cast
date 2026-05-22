// src/components/CastAnimation.jsx
import { useState, useEffect, useRef } from 'react';
import './CastAnimation.css';

// ── Phase definitions ─────────────────────────────────────────
// frames[] cycles at frameMs interval. Single entry = static.
// Dock, water, and fishing-line are baked into every sprite —
// CSS only provides sky, sun, clouds, trees, and water-bg extension.
const PHASES = [
  {
    key:      'casting',
    duration: 1800,
    label:    'Casting…',
    frames:   ['cast-throw', 'cast-follow', 'watch', 'line-out'],
    frameMs:  400,
  },
  {
    key:      'splash',
    duration: 600,
    label:    '💦 Splash!',
    frames:   ['line-out'],
    frameMs:  0,
  },
  {
    key:      'waiting',
    duration: 2800,
    label:    '🎣 Waiting for a bite…',
    frames:   ['wait-a', 'wait-b', 'wait-c', 'watch', 'wait-b'],
    frameMs:  640,
  },
  {
    key:      'tension',
    duration: 880,
    label:    "⚡ Something's on the line!",
    frames:   ['alert', 'bite', 'alert', 'bite'],
    frameMs:  220,
  },
  {
    key:      'hooked',
    duration: 1200,
    label:    '🐟 Fish on!',
    frames:   ['fight-a', 'fight-b', 'fight-c', 'fight-d'],
    frameMs:  200,
  },
  {
    key:      'reeling',
    duration: 900,
    label:    '🏆 Reeling in!',
    frames:   ['triumph-a', 'triumph-b', 'triumph-c'],
    frameMs:  260,
  },
  {
    key:      'catch',
    duration: 1000,
    label:    '🎉 What a catch!',
    frames:   ['catch-a', 'catch-b'],
    frameMs:  440,
  },
];

function spriteUrl(name) {
  return new URL(`../assets/sprites/${name}.png`, import.meta.url).href;
}

const SPRITE_URLS = Object.fromEntries(
  [
    'wait-a', 'wait-b', 'wait-c', 'watch',
    'cast-throw', 'cast-follow', 'line-out',
    'alert', 'bite',
    'fight-a', 'fight-b', 'fight-c', 'fight-d',
    'triumph-a', 'triumph-b', 'triumph-c',
    'catch-a', 'catch-b',
  ].map(name => [name, spriteUrl(name)])
);

export default function CastAnimation({ onComplete }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // ── Phase timer chain ─────────────────────────────────────────
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

  // ── Frame cycling within the current phase ────────────────────
  useEffect(() => {
    const phase = PHASES[phaseIdx];
    if (phase.frames.length <= 1 || !phase.frameMs) { setFrameIdx(0); return; }
    setFrameIdx(0);
    const id = setInterval(
      () => setFrameIdx(prev => (prev + 1) % phase.frames.length),
      phase.frameMs,
    );
    return () => clearInterval(id);
  }, [phaseIdx]);

  const phase      = PHASES[phaseIdx];
  const spriteName = phase.frames[frameIdx] ?? phase.frames[0];

  return (
    <div className={`ca ca--${phase.key}`} aria-live="polite">

      {/* ── Sky backdrop (sun, clouds, trees) ─────────────────── */}
      <div className="ca__sky">
        <div className="ca__sun"            aria-hidden="true" />
        <div className="ca__cloud ca__cloud--1" aria-hidden="true" />
        <div className="ca__cloud ca__cloud--2" aria-hidden="true" />
        <div className="ca__tree ca__tree--l"   aria-hidden="true" />
        <div className="ca__tree ca__tree--r"   aria-hidden="true" />
      </div>

      {/* ── Scene: sprite + ripple overlays ───────────────────── */}
      {/*   Dock and water are baked into the sprite images.      */}
      {/*   water-bg extends the sprite's water edge-to-edge.     */}
      <div className="ca__scene">

        {/* Water background — extends sprite water to full width */}
        <div className="ca__water-bg" aria-hidden="true" />

        {/* Fisherman — outer centers, inner animates per phase   */}
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

        {/* Ripple rings at the line-water entry point */}
        <div className="ca__ripple ca__ripple--1" aria-hidden="true" />
        <div className="ca__ripple ca__ripple--2" aria-hidden="true" />
        <div className="ca__ripple ca__ripple--3" aria-hidden="true" />

        {/* Splash drops */}
        <div className="ca__splash" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ca__drop" style={{ '--i': i }} />
          ))}
        </div>
      </div>

      {/* ── Phase label — floats in sky ──────────────────────── */}
      <div className="ca__label">
        <span key={phase.key} className="ca__label-text">{phase.label}</span>
      </div>

      {/* ── Progress dots ────────────────────────────────────── */}
      <div className="ca__progress" aria-hidden="true">
        {PHASES.map((p, i) => (
          <div
            key={p.key}
            className={`ca__pdot ${i <= phaseIdx ? 'ca__pdot--done' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
