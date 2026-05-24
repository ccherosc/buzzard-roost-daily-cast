// src/components/NoCatch.jsx
// Shown when a cast ends with no fish — missed bite, line broke, or fish escaped.
import './NoCatch.css';

const MESSAGES = {
  missed:  { icon: '💨', title: 'Fish Got Away',  sub: 'Missed the hookset window.' },
  broke:   { icon: '💔', title: 'Line Broke!',    sub: 'Too much pressure — the line snapped.' },
  escaped: { icon: '🐟', title: 'Fish Escaped!',  sub: "Didn't reel fast enough." },
};

export default function NoCatch({ reason, castNumber, totalCasts, onContinue }) {
  const msg    = MESSAGES[reason] ?? MESSAGES.missed;
  const isLast = castNumber >= totalCasts;

  return (
    <div className="nc">
      <span className="nc__icon">{msg.icon}</span>
      <h2 className="nc__title">{msg.title}</h2>
      <p className="nc__sub">{msg.sub}</p>
      <p className="nc__cast">Cast {castNumber} of {totalCasts}</p>
      <button className="btn btn--secondary nc__cta" onClick={onContinue}>
        {isLast ? 'See Results' : `Cast ${castNumber + 1} →`}
      </button>
    </div>
  );
}
