// src/components/SnowballCoach.jsx
// In-game coaching panel: Snowball's expression bust (left) + speech bubble (right).
// Sits at the top of each minigame. Expression + line update reactively with game state.
//
// Sprite sheet: snowball_expressions_transparent.png — 612×408px, 5 cols × 3 rows
//   Row 0: idle | cast | lineOut | waiting | bite
//   Row 1: reelStart | reeling | reelStrong | fishOn | pulling
//   Row 2: fishUp | showing | recast
//
// Display at 80×89px (scale ≈ 0.656 of 122×136 native cell).
import './SnowballCoach.css';
import snowballSheet from '../../assets/reference/snowball_expressions_transparent.png';

const CELL_W  = 80;   // display width per cell
const CELL_H  = 89;   // display height per cell  (136 × 0.656)
const SHEET_W = CELL_W * 5;   // 400
const SHEET_H = CELL_H * 3;   // 267

export const EXPR = {
  idle:       { col: 0, row: 0 },   // Fishing – Idle
  cast:       { col: 1, row: 0 },   // Cast (ready / focused)
  lineOut:    { col: 2, row: 0 },   // Line Out (relaxed)
  waiting:    { col: 3, row: 0 },   // Waiting (hand on chin, patient)
  bite:       { col: 4, row: 0 },   // Bite – surprised/alert
  reelStart:  { col: 0, row: 1 },   // Reel In – start (alert, leaning)
  reeling:    { col: 1, row: 1 },   // Reeling (effort, motion lines)
  reelStrong: { col: 2, row: 1 },   // Reel In Strong (gritting teeth)
  fishOn:     { col: 3, row: 1 },   // Fish On – excited/hooked!
  pulling:    { col: 4, row: 1 },   // Pulling Fish (determined)
  fishUp:     { col: 0, row: 2 },   // Fish Up – big grin
  showing:    { col: 1, row: 2 },   // Showing Catch (proud)
  recast:     { col: 2, row: 2 },   // Re-cast / Reset (neutral)
};

export default function SnowballCoach({ expression = 'idle', line = '' }) {
  const e = EXPR[expression] ?? EXPR.idle;
  return (
    <div className="sc">
      <div
        className="sc__face"
        style={{
          backgroundImage:    `url(${snowballSheet})`,
          backgroundSize:     `${SHEET_W}px ${SHEET_H}px`,
          backgroundPosition: `${-(e.col * CELL_W)}px ${-(e.row * CELL_H)}px`,
          backgroundRepeat:   'no-repeat',
          width:  `${CELL_W}px`,
          height: `${CELL_H}px`,
        }}
        aria-label="Snowball"
        role="img"
      />
      <div className="sc__bubble">
        <p className="sc__text">{line}</p>
      </div>
    </div>
  );
}
