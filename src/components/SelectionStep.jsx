// src/components/SelectionStep.jsx
import { useState } from 'react';
import './SelectionStep.css';

const STEPS = ['Spot', 'Lure', 'Cast'];

export default function SelectionStep({ step, title, subtitle, options, onSelect }) {
  const [selected,  setSelected]  = useState(null);
  const [advancing, setAdvancing] = useState(false);

  function handlePick(id) { setSelected(id); }

  function handleContinue() {
    if (!selected || advancing) return;
    setAdvancing(true);
    setTimeout(() => onSelect(selected), 300);
  }

  return (
    <div className="sel">
      {/* Step indicator */}
      <div className="sel__dots" aria-label={`Step ${step} of ${STEPS.length}`}>
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={[
              'sel__dot',
              i < step - 1  ? 'sel__dot--done'   : '',
              i === step - 1 ? 'sel__dot--active' : '',
            ].join(' ')}
            aria-current={i === step - 1 ? 'step' : undefined}
          />
        ))}
      </div>

      <h2 className="sel__title">{title}</h2>
      <p  className="sel__subtitle">{subtitle}</p>

      <div className="sel__grid">
        {options.map((opt, idx) => (
          <button
            key={opt.id}
            className={[
              'sel__card',
              selected === opt.id                              ? 'sel__card--selected' : '',
              options.length % 2 !== 0 && idx === options.length - 1 ? 'sel__card--solo'     : '',
            ].join(' ')}
            onClick={() => handlePick(opt.id)}
          >
            <span className="sel__card-emoji" aria-hidden="true">{opt.emoji}</span>
            <span className="sel__card-name">{opt.name}</span>
            <span className="sel__card-desc">{opt.description}</span>
            {opt.riskLevel && (
              <span className={`sel__card-risk sel__card-risk--${opt.riskLevel}`}>
                {opt.emoji} {opt.riskLabel}
              </span>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <button
          className={`btn btn--primary sel__continue ${advancing ? 'sel__continue--go' : ''}`}
          onClick={handleContinue}
        >
          Continue →
        </button>
      )}
    </div>
  );
}
