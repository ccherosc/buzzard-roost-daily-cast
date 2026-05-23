// src/components/MascotQuip.jsx
// Displays a mascot sprite beside a speech bubble.
// mascot: 'tmodel2' | 'snowball'
// line: string — text in bubble. Renders nothing if empty/null.
// size: pixel height of the sprite (default 80).
import './MascotQuip.css';
import tmodel2Src from '../../assets/reference/Mascot_TModel2.png';
import snowballSrc from '../../assets/reference/Mascot_Snowball.png';

const SPRITES = { tmodel2: tmodel2Src, snowball: snowballSrc };
const ALT     = { tmodel2: 'TModel2', snowball: 'Snowball' };

export default function MascotQuip({ mascot = 'tmodel2', line, size = 80 }) {
  if (!line) return null;
  return (
    <div className="mq">
      <img
        className="mq__sprite"
        src={SPRITES[mascot]}
        alt={ALT[mascot]}
        style={{ height: `${size}px`, width: 'auto' }}
      />
      <div className="mq__bubble">
        <p className="mq__text">{line}</p>
        <div className="mq__tail" aria-hidden="true" />
      </div>
    </div>
  );
}
