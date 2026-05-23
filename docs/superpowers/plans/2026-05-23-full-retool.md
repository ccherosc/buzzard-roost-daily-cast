# Full Retool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Buzzard Roost Daily Cast V2 into a polished Outdoor Rugged experience — new visual theme, one-screen setup UI, choices that affect minigame mechanics, mascot integration, and a fixed FightMeter.

**Architecture:** CSS token swap propagates Outdoor Rugged palette globally; new `gameParams.js` utility translates spot/lure/cast selections into minigame config objects; new `SetupScreen.jsx` replaces three separate selection screens with one unified view; `App.jsx` flow collapses to `landing→setup→game→result` with spot/lure locked after cast 1.

**Tech Stack:** React 18, Vite 5, CSS custom properties, Vitest. No new dependencies.

**CRITICAL:** `DEV_DISABLE_DAILY_LIMIT` in `src/config/gameConfig.js` stays `true`. Do NOT change it.

---

## File Map

**New files:**
- `src/utils/gameParams.js` — `buildGameParams(spotId, lureId, castStyleId, rarity)` → `{ castMeter, biteTiming, fightMeter }`
- `src/utils/__tests__/gameParams.test.js`
- `src/utils/mascotLines.js` — `getSetupQuip(s, l, c)` and `getCatchQuip(rarity)`
- `src/utils/__tests__/mascotLines.test.js`
- `src/components/MascotQuip.jsx` — sprite + speech bubble
- `src/components/MascotQuip.css`
- `src/components/SetupScreen.jsx` — one-screen spot/lure/cast selection
- `src/components/SetupScreen.css`

**Modified files:**
- `src/index.css` — Outdoor Rugged color tokens
- `src/App.css` — gradient + cast-bar phase list
- `src/App.jsx` — new flow: landing→setup→game→result; gameParams state
- `src/components/DailyCastGame.jsx` — pass gameParams props to minigames
- `src/components/CastMeter.jsx` — config prop, full-height, rugged CSS
- `src/components/CastMeter.css`
- `src/components/BiteTiming.jsx` — config prop, pre-bite cue, full-height
- `src/components/BiteTiming.css`
- `src/components/FightMeter.jsx` — surge system, config prop, full-height
- `src/components/FightMeter.css`
- `src/components/CatchReveal.jsx` — TModel2 reaction line
- `src/components/CatchReveal.css`
- `src/components/Header.jsx` — logo image replaces 🦅 emoji
- `src/components/Header.css`
- `src/components/LandingScreen.jsx` — logo + rugged scene
- `src/components/LandingScreen.css`
- `src/components/AlreadyPlayed.jsx` — Snowball sprite + streak line
- `src/components/AlreadyPlayed.css`
- `src/components/ResultCard.css` — theme only

**Unchanged:** `src/utils/gameLogic.js`, `src/utils/storageManager.js`, `src/utils/integrity.js`, `src/data/fishData.js`, `src/data/gameData.js`, all existing test files.

---

## Task 1: Global CSS Design Tokens

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.css`

- [ ] **Step 1: Replace color tokens in `src/index.css`**

Replace the entire `:root` block (lines 5–54) with:

```css
:root {
  /* Brand — Outdoor Rugged */
  --brand-primary: #4a7c2f;
  --brand-primary-hover: #3a6620;
  --brand-accent: #e8a84c;

  /* Backgrounds */
  --bg-dark: #0f1a0d;
  --bg-card: #1a2c1a;
  --bg-card-raised: #2a3e1a;
  --bg-card-hover: #344d20;
  --bg-surface: #2d1f0e;

  /* Text */
  --text-primary: #f0e8d0;
  --text-secondary: #a09070;
  --text-muted: #6a5840;

  /* Borders */
  --border-subtle: rgba(58,90,40,0.35);
  --border-card: rgba(74,124,47,0.35);

  /* Rarity */
  --rarity-common:    #9ca3af;
  --rarity-uncommon:  #22c55e;
  --rarity-rare:      #3b82f6;
  --rarity-epic:      #a855f7;
  --rarity-legendary: #f59e0b;

  /* Rarity Glows */
  --glow-common:    0 0 12px rgba(156,163,175,0.4);
  --glow-uncommon:  0 0 16px rgba(34,197,94,0.5);
  --glow-rare:      0 0 20px rgba(59,130,246,0.6);
  --glow-epic:      0 0 28px rgba(168,85,247,0.7);
  --glow-legendary: 0 0 40px rgba(245,158,11,0.9), 0 0 80px rgba(245,158,11,0.3);

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 12px; --radius-lg: 18px;
  --radius-xl: 24px; --radius-full: 9999px;

  /* Transitions */
  --t-fast: 0.15s ease; --t-normal: 0.3s ease; --t-slow: 0.5s ease;

  /* Fonts */
  --font-display: 'Oswald', 'Impact', sans-serif;
  --font-body: 'Nunito', 'Segoe UI', sans-serif;
}
```

Also update `.btn--primary` box-shadow line (currently uses orange rgba) to:
```css
box-shadow: 0 4px 20px rgba(74,124,47,0.45);
```
And `.btn--primary:hover` box-shadow to:
```css
box-shadow: 0 6px 28px rgba(74,124,47,0.65);
```

- [ ] **Step 2: Update `src/App.css` gradient and cast-bar**

Replace the two `radial-gradient` lines in `.app-shell` with:
```css
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(20,60,10,0.4) 0%, transparent 70%),
    radial-gradient(ellipse at 80% 20%, rgba(45,31,14,0.3) 0%, transparent 60%);
```

In `App.jsx` (line 145), the phase-list check `['spot','lure','cast','game']` will be changed in Task 6. Leave App.css as-is for now — no other changes here.

- [ ] **Step 3: Verify dev server reflects new palette**

```bash
npm run dev
```
Open `http://localhost:5173`. Background should be dark forest green (`#0f1a0d`), card should be `#1a2c1a`, and buttons should be muted green, not orange.

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/App.css
git commit -m "style: Outdoor Rugged color token system"
```

---

## Task 2: gameParams.js Utility

**Files:**
- Create: `src/utils/gameParams.js`
- Create: `src/utils/__tests__/gameParams.test.js`

- [ ] **Step 1: Write the failing tests first**

Create `src/utils/__tests__/gameParams.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { buildGameParams } from '../gameParams.js';

describe('buildGameParams', () => {
  it('returns castMeter, biteTiming, fightMeter keys', () => {
    const p = buildGameParams('dock', 'worm', 'safeCast', 'common');
    expect(p).toHaveProperty('castMeter');
    expect(p).toHaveProperty('biteTiming');
    expect(p).toHaveProperty('fightMeter');
  });

  describe('castMeter', () => {
    it('safeCast → DURATION_MS=2000, SWEET_ZONE=0.36', () => {
      const { castMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(castMeter.DURATION_MS).toBe(2000);
      expect(castMeter.SWEET_ZONE).toBeCloseTo(0.36, 5);
    });

    it('riskyCast → DURATION_MS=900, SWEET_ZONE=0.20', () => {
      const { castMeter } = buildGameParams('dock', 'spinner', 'riskyCast', 'common');
      expect(castMeter.DURATION_MS).toBe(900);
      expect(castMeter.SWEET_ZONE).toBeCloseTo(0.20, 5);
    });

    it('worm lure adds 0.04 to sweet zone', () => {
      const base = buildGameParams('dock', 'spinner', 'precisionCast', 'common');
      const worm = buildGameParams('dock', 'worm',    'precisionCast', 'common');
      expect(worm.castMeter.SWEET_ZONE).toBeCloseTo(base.castMeter.SWEET_ZONE + 0.04, 5);
    });

    it('mysteryLure subtracts 0.06 from sweet zone', () => {
      const base    = buildGameParams('dock', 'spinner',     'precisionCast', 'common');
      const mystery = buildGameParams('dock', 'mysteryLure', 'precisionCast', 'common');
      expect(mystery.castMeter.SWEET_ZONE).toBeCloseTo(base.castMeter.SWEET_ZONE - 0.06, 5);
    });

    it('deepWater spot adds sweetOffset=0.15', () => {
      const { castMeter } = buildGameParams('deepWater', 'spinner', 'safeCast', 'common');
      expect(castMeter.sweetOffset).toBeCloseTo(0.15, 5);
    });

    it('dock spot has sweetOffset=0', () => {
      const { castMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(castMeter.sweetOffset).toBe(0);
    });
  });

  describe('biteTiming', () => {
    it('frog lure → fast wait range', () => {
      const { biteTiming } = buildGameParams('dock', 'frog', 'safeCast', 'common');
      expect(biteTiming.WAIT_MIN_MS).toBe(400);
      expect(biteTiming.WAIT_MAX_MS).toBe(1200);
    });

    it('worm lure → slow wait range', () => {
      const { biteTiming } = buildGameParams('dock', 'worm', 'safeCast', 'common');
      expect(biteTiming.WAIT_MIN_MS).toBe(2500);
      expect(biteTiming.WAIT_MAX_MS).toBe(5500);
    });

    it('mysteryLure → wide random range', () => {
      const { biteTiming } = buildGameParams('dock', 'mysteryLure', 'safeCast', 'common');
      expect(biteTiming.WAIT_MIN_MS).toBe(200);
      expect(biteTiming.WAIT_MAX_MS).toBe(6000);
    });

    it('reeds spot → WINDOW_MS=550', () => {
      const { biteTiming } = buildGameParams('reeds', 'spinner', 'safeCast', 'common');
      expect(biteTiming.WINDOW_MS).toBe(550);
    });

    it('dock spot → WINDOW_MS=1000', () => {
      const { biteTiming } = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(biteTiming.WINDOW_MS).toBe(1000);
    });

    it('precisionCast → showPreBiteCue=true', () => {
      const { biteTiming } = buildGameParams('dock', 'spinner', 'precisionCast', 'common');
      expect(biteTiming.showPreBiteCue).toBe(true);
    });

    it('riskyCast → noPreBiteWarning=true', () => {
      const { biteTiming } = buildGameParams('dock', 'spinner', 'riskyCast', 'common');
      expect(biteTiming.noPreBiteWarning).toBe(true);
    });
  });

  describe('fightMeter', () => {
    it('legendary fish → highest DRIFT_RATE', () => {
      const leg = buildGameParams('dock', 'spinner', 'safeCast', 'legendary');
      const com = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(leg.fightMeter.DRIFT_RATE).toBeGreaterThan(com.fightMeter.DRIFT_RATE);
    });

    it('legendary DRIFT_RATE=0.00026', () => {
      const { fightMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'legendary');
      expect(fightMeter.DRIFT_RATE).toBeCloseTo(0.00026, 7);
    });

    it('common DRIFT_RATE=0.00010', () => {
      const { fightMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'common');
      expect(fightMeter.DRIFT_RATE).toBeCloseTo(0.00010, 7);
    });

    it('FIGHT_DURATION_MS=8000 always', () => {
      const { fightMeter } = buildGameParams('dock', 'spinner', 'safeCast', 'rare');
      expect(fightMeter.FIGHT_DURATION_MS).toBe(8000);
    });

    it('frog lure → startingTension=0.45', () => {
      const { fightMeter } = buildGameParams('dock', 'frog', 'safeCast', 'common');
      expect(fightMeter.startingTension).toBeCloseTo(0.45, 5);
    });

    it('worm lure → startingTension=0.20', () => {
      const { fightMeter } = buildGameParams('dock', 'worm', 'safeCast', 'common');
      expect(fightMeter.startingTension).toBeCloseTo(0.20, 5);
    });

    it('rockyBank spot → lower SURGE_INTERVAL_MIN', () => {
      const rocky = buildGameParams('rockyBank', 'spinner', 'safeCast', 'common');
      const dock  = buildGameParams('dock',      'spinner', 'safeCast', 'common');
      expect(rocky.fightMeter.SURGE_INTERVAL_MIN).toBeLessThan(dock.fightMeter.SURGE_INTERVAL_MIN);
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- src/utils/__tests__/gameParams.test.js
```
Expected: FAIL — "Cannot find module '../gameParams.js'"

- [ ] **Step 3: Implement `src/utils/gameParams.js`**

```js
// src/utils/gameParams.js
// Builds per-minigame config objects from the player's spot/lure/cast selections + fish rarity.
// Called in App.jsx when setupComplete fires, result passed as gameParams prop to DailyCastGame.

export function buildGameParams(spotId, lureId, castStyleId, rarity = 'common') {
  return {
    castMeter:  buildCastMeterConfig(spotId, lureId, castStyleId),
    biteTiming: buildBiteTimingConfig(spotId, lureId, castStyleId),
    fightMeter: buildFightMeterConfig(spotId, lureId, rarity),
  };
}

function buildCastMeterConfig(spotId, lureId, castStyleId) {
  const durationMap = {
    safeCast: 2000, precisionCast: 1400, powerCast: 1100, riskyCast: 900,
  };
  let DURATION_MS = durationMap[castStyleId] ?? 1400;

  const zoneMap = {
    safeCast: 0.36, precisionCast: 0.28, powerCast: 0.28, riskyCast: 0.20,
  };
  let SWEET_ZONE = zoneMap[castStyleId] ?? 0.28;

  if (lureId === 'worm')        SWEET_ZONE = Math.min(0.50, SWEET_ZONE + 0.04);
  if (lureId === 'mysteryLure') SWEET_ZONE = Math.max(0.08, SWEET_ZONE - 0.06);

  const sweetOffset = spotId === 'deepWater' ? 0.15 : 0;

  return { DURATION_MS, SWEET_ZONE, sweetOffset };
}

function buildBiteTimingConfig(spotId, lureId, castStyleId) {
  const waitMap = {
    frog:        { min: 400,  max: 1200 },
    worm:        { min: 2500, max: 5500 },
    mysteryLure: { min: 200,  max: 6000 },
  };
  const wait = waitMap[lureId] ?? { min: 1500, max: 4000 };

  const windowMap = { dock: 1000, reeds: 550, deepWater: 700 };
  const WINDOW_MS = windowMap[spotId] ?? 800;

  return {
    WAIT_MIN_MS:     wait.min,
    WAIT_MAX_MS:     wait.max,
    WINDOW_MS,
    showPreBiteCue:  castStyleId === 'precisionCast',
    noPreBiteWarning: castStyleId === 'riskyCast',
  };
}

function buildFightMeterConfig(spotId, lureId, rarity) {
  const driftMap = {
    common: 0.00010, uncommon: 0.00013, rare: 0.00016, epic: 0.00020, legendary: 0.00026,
  };
  const surgeAmountMap = {
    common: 0.10, uncommon: 0.14, rare: 0.18, epic: 0.22, legendary: 0.28,
  };
  const intervalMinMap = { dock: 3000, deepWater: 1500, rockyBank: 1200 };
  const tensionMap     = { frog: 0.45, worm: 0.20 };

  const SURGE_INTERVAL_MIN = intervalMinMap[spotId] ?? 2000;

  return {
    FIGHT_DURATION_MS: 8000,
    DRIFT_RATE:        driftMap[rarity]       ?? 0.00015,
    REEL_POWER:        0.12,
    SAFE_MAX:          0.65,
    BREAK_MAX:         0.95,
    SURGE_INTERVAL_MIN,
    SURGE_INTERVAL_MAX: SURGE_INTERVAL_MIN + 2000,
    SURGE_AMOUNT:      surgeAmountMap[rarity] ?? 0.15,
    startingTension:   tensionMap[lureId]     ?? 0.30,
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- src/utils/__tests__/gameParams.test.js
```
Expected: all 17 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/gameParams.js src/utils/__tests__/gameParams.test.js
git commit -m "feat: gameParams utility — minigame config from selections + rarity"
```

---

## Task 3: mascotLines.js Utility

**Files:**
- Create: `src/utils/mascotLines.js`
- Create: `src/utils/__tests__/mascotLines.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/utils/__tests__/mascotLines.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { getSetupQuip, getCatchQuip } from '../mascotLines.js';

describe('getSetupQuip', () => {
  it('mystery + deep + risky → specific triple-combo line', () => {
    const line = getSetupQuip('deepWater', 'mysteryLure', 'riskyCast');
    expect(line).toMatch(/genius or a fool/i);
  });

  it('mystery lure alone → mystery-lure line', () => {
    const line = getSetupQuip('dock', 'mysteryLure', 'safeCast');
    expect(line).toMatch(/nobody knows/i);
  });

  it('risky + deep (no mystery) → ambition line', () => {
    const line = getSetupQuip('deepWater', 'spinner', 'riskyCast');
    expect(line).toMatch(/ambition/i);
  });

  it('dock + worm + safe → classic line', () => {
    const line = getSetupQuip('dock', 'worm', 'safeCast');
    expect(line).toMatch(/classic/i);
  });

  it('frog lure → frog line', () => {
    const line = getSetupQuip('reeds', 'frog', 'precisionCast');
    expect(line).toMatch(/frog/i);
  });

  it('unknown combo → default line', () => {
    const line = getSetupQuip('rockyBank', 'jig', 'powerCast');
    expect(line).toMatch(/biting today/i);
  });

  it('triple-combo match takes priority over single-field match', () => {
    // mystery + deep + risky should NOT fall through to mystery-only line
    const line = getSetupQuip('deepWater', 'mysteryLure', 'riskyCast');
    expect(line).not.toMatch(/nobody knows/i);
  });
});

describe('getCatchQuip', () => {
  it('legendary → 30-year lake line', () => {
    expect(getCatchQuip('legendary')).toMatch(/30 years/i);
  });
  it('epic → get the camera', () => {
    expect(getCatchQuip('epic')).toMatch(/camera/i);
  });
  it('rare → keeper', () => {
    expect(getCatchQuip('rare')).toMatch(/keeper/i);
  });
  it('uncommon → solid catch', () => {
    expect(getCatchQuip('uncommon')).toMatch(/solid/i);
  });
  it('common → next cast', () => {
    expect(getCatchQuip('common')).toMatch(/next cast/i);
  });
  it('unknown rarity falls back to common line', () => {
    expect(getCatchQuip('mythic')).toMatch(/next cast/i);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- src/utils/__tests__/mascotLines.test.js
```
Expected: FAIL — "Cannot find module '../mascotLines.js'"

- [ ] **Step 3: Implement `src/utils/mascotLines.js`**

```js
// src/utils/mascotLines.js
// Mascot reaction lines for setup screen (combo-based) and catch reveal (rarity-based).

const SETUP_QUIPS = [
  {
    match: (s, l, c) => l === 'mysteryLure' && s === 'deepWater' && c === 'riskyCast',
    line:  "Mystery lure + deep water + risky cast? Either a genius or a fool.",
  },
  {
    match: (s, l)    => l === 'mysteryLure',
    line:  "Mystery lure? Nobody knows what that thing is.",
  },
  {
    match: (s, l, c) => c === 'riskyCast' && s === 'deepWater',
    line:  "Deep water risky cast... I like the ambition.",
  },
  {
    match: (s, l, c) => s === 'dock' && l === 'worm' && c === 'safeCast',
    line:  "Dock + worm. Classic. Nothing wrong with that.",
  },
  {
    match: (s, l)    => l === 'frog',
    line:  "Frog lure. Good choice — they can't resist it.",
  },
];

const DEFAULT_QUIP = "Alright, let's see what's biting today.";

/** Returns TModel2's contextual quip for the current spot/lure/cast combo. */
export function getSetupQuip(spotId, lureId, castStyleId) {
  for (const { match, line } of SETUP_QUIPS) {
    if (match(spotId, lureId, castStyleId)) return line;
  }
  return DEFAULT_QUIP;
}

const CATCH_QUIPS = {
  legendary: "NO WAY. I've fished this lake 30 years and never seen one of those.",
  epic:      "Now THAT is a fish. Get the camera.",
  rare:      "Nice. Real nice. That one's a keeper.",
  uncommon:  "Not bad. Solid catch.",
  common:    "Fish is fish. We'll get 'em next cast.",
};

/** Returns TModel2's rarity-appropriate reaction for the catch reveal. */
export function getCatchQuip(rarity) {
  return CATCH_QUIPS[rarity] ?? CATCH_QUIPS.common;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- src/utils/__tests__/mascotLines.test.js
```
Expected: all 13 tests PASS.

- [ ] **Step 5: Run full test suite to confirm no regressions**

```bash
npm test
```
Expected: all tests pass (67 + 17 + 13 = 97 tests).

- [ ] **Step 6: Commit**

```bash
git add src/utils/mascotLines.js src/utils/__tests__/mascotLines.test.js
git commit -m "feat: mascotLines utility — setup quips and catch reactions"
```

---

## Task 4: MascotQuip Component

**Files:**
- Create: `src/components/MascotQuip.jsx`
- Create: `src/components/MascotQuip.css`

- [ ] **Step 1: Create `src/components/MascotQuip.jsx`**

```jsx
// src/components/MascotQuip.jsx
// Displays a mascot sprite beside a speech bubble.
// mascot: 'tmodel2' | 'snowball'
// line: string — text in the bubble. If empty/null, renders nothing.
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
```

- [ ] **Step 2: Create `src/components/MascotQuip.css`**

```css
/* src/components/MascotQuip.css */
.mq {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

.mq__sprite {
  flex-shrink: 0;
  image-rendering: pixelated;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
}

.mq__bubble {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  max-width: 240px;
}

.mq__text {
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0;
}

/* Tail pointing left toward sprite */
.mq__tail {
  position: absolute;
  left: -8px;
  bottom: 12px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 8px solid var(--border-card);
}
.mq__tail::after {
  content: '';
  position: absolute;
  left: 2px;
  top: -5px;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 7px solid var(--bg-surface);
}
```

- [ ] **Step 3: Verify component renders (smoke test)**

Run dev server (`npm run dev`) and temporarily add `<MascotQuip line="Test line." />` anywhere in `App.jsx`. Confirm sprite and bubble appear. Remove the temp code.

- [ ] **Step 4: Commit**

```bash
git add src/components/MascotQuip.jsx src/components/MascotQuip.css
git commit -m "feat: MascotQuip component — sprite + speech bubble"
```

---

## Task 5: SetupScreen Component

**Files:**
- Create: `src/components/SetupScreen.jsx`
- Create: `src/components/SetupScreen.css`

- [ ] **Step 1: Create `src/components/SetupScreen.jsx`**

```jsx
// src/components/SetupScreen.jsx
// One-screen setup: spot (scene strip) + lure (icon row) + cast style (icon row)
// + live odds bar + risk meter + TModel2 quip + CTA button.
//
// Props:
//   castNumber  — 1-based cast number (controls CTA label + locking)
//   lockedSpot  — spotId string if spot is already chosen (casts 2+), null otherwise
//   lockedLure  — lureId string if lure is already chosen (casts 2+), null otherwise
//   onComplete  — ({spotId, lureId, castStyleId}) => void
import { useState, useMemo } from 'react';
import './SetupScreen.css';
import { SPOTS, LURES, CAST_STYLES } from '../data/gameData.js';
import { computeWeights } from '../utils/gameLogic.js';
import { getSetupQuip } from '../utils/mascotLines.js';
import MascotQuip from './MascotQuip.jsx';

export default function SetupScreen({ castNumber, lockedSpot, lockedLure, onComplete }) {
  const [selectedSpot, setSelectedSpot] = useState(lockedSpot ?? null);
  const [selectedLure, setSelectedLure] = useState(lockedLure ?? null);
  const [selectedCast, setSelectedCast] = useState(null);

  const canProceed = selectedSpot && selectedLure && selectedCast;

  // Live odds — only compute when all three are picked
  const { odds, totalWeight } = useMemo(() => {
    if (!selectedSpot || !selectedLure || !selectedCast) return { odds: null, totalWeight: 0 };
    const w = computeWeights(selectedSpot, selectedLure, selectedCast);
    return { odds: w, totalWeight: Object.values(w).reduce((a, b) => a + b, 0) };
  }, [selectedSpot, selectedLure, selectedCast]);

  const commonPct = odds ? Math.round(odds.common / totalWeight * 100) : null;
  const rarePct   = odds ? Math.round((odds.uncommon + odds.rare) / totalWeight * 100) : null;
  const epicPct   = odds ? (100 - commonPct - rarePct) : null;
  const riskFrac  = odds ? (odds.epic + odds.legendary) / totalWeight : 0;

  const quip = (selectedSpot && selectedLure && selectedCast)
    ? getSetupQuip(selectedSpot, selectedLure, selectedCast)
    : castNumber > 1
      ? "Same spot, same lure. Pick your cast style."
      : "Choose your spot, lure, and cast style.";

  function handleComplete() {
    if (!canProceed) return;
    onComplete({ spotId: selectedSpot, lureId: selectedLure, castStyleId: selectedCast });
  }

  return (
    <div className="ss">
      {/* ── Spot: scene strip ── */}
      <section className="ss__section">
        <h3 className="ss__section-label">SPOT</h3>
        <div className="ss__scene-strip">
          {SPOTS.map(spot => {
            const locked   = !!lockedSpot && lockedSpot !== spot.id;
            const selected = selectedSpot === spot.id;
            return (
              <button
                key={spot.id}
                className={`ss__spot ${selected ? 'ss__spot--selected' : ''} ${locked ? 'ss__spot--locked' : ''}`}
                onClick={() => !locked && setSelectedSpot(spot.id)}
                disabled={locked}
                aria-pressed={selected}
                aria-label={spot.name}
              >
                <span className="ss__spot-icon">{spot.emoji}</span>
                {selected && <span className="ss__spot-name">{spot.name}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Lure: icon row ── */}
      <section className="ss__section">
        <h3 className="ss__section-label">LURE</h3>
        <div className="ss__chip-row">
          {LURES.map(lure => {
            const locked   = !!lockedLure && lockedLure !== lure.id;
            const selected = selectedLure === lure.id;
            return (
              <button
                key={lure.id}
                className={`ss__chip ${selected ? 'ss__chip--selected' : ''} ${locked ? 'ss__chip--locked' : ''}`}
                onClick={() => !locked && setSelectedLure(lure.id)}
                disabled={locked}
                aria-pressed={selected}
                aria-label={lure.name}
              >
                <span className="ss__chip-icon">{lure.emoji}</span>
                <span className="ss__chip-name">{lure.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Cast style: icon row ── */}
      <section className="ss__section">
        <h3 className="ss__section-label">CAST STYLE</h3>
        <div className="ss__chip-row">
          {CAST_STYLES.map(cs => {
            const selected = selectedCast === cs.id;
            return (
              <button
                key={cs.id}
                className={`ss__chip ${selected ? 'ss__chip--selected' : ''}`}
                onClick={() => setSelectedCast(cs.id)}
                aria-pressed={selected}
                aria-label={cs.name}
              >
                <span className="ss__chip-icon">{cs.emoji}</span>
                <span className="ss__chip-name">{cs.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Live odds + risk (only when all three picked) ── */}
      {odds && (
        <div className="ss__odds-wrap">
          <div className="ss__odds-bar">
            <div className="ss__odds-seg ss__odds-seg--common" style={{ flex: odds.common }}>
              <span className="ss__odds-pct">{commonPct}%</span>
            </div>
            <div className="ss__odds-seg ss__odds-seg--rare" style={{ flex: odds.uncommon + odds.rare }}>
              <span className="ss__odds-pct">{rarePct}%</span>
            </div>
            <div className="ss__odds-seg ss__odds-seg--epic" style={{ flex: odds.epic + odds.legendary }}>
              <span className="ss__odds-pct">{epicPct}%</span>
            </div>
          </div>
          <div className="ss__odds-legend">
            <span><span className="ss__dot ss__dot--common" />Common</span>
            <span><span className="ss__dot ss__dot--rare"   />Rare</span>
            <span><span className="ss__dot ss__dot--epic"   />Epic+</span>
          </div>

          <div className="ss__risk-row">
            <span className="ss__risk-label">Safe</span>
            <div className="ss__risk-track">
              <div className="ss__risk-fill" style={{ width: `${Math.round(riskFrac * 100)}%` }} />
            </div>
            <span className="ss__risk-label">Risky</span>
          </div>
        </div>
      )}

      {/* ── TModel2 quip ── */}
      <MascotQuip mascot="tmodel2" line={quip} size={80} />

      {/* ── CTA ── */}
      <div className="ss__cta-wrap">
        <button
          className="btn btn--primary btn--large ss__cta"
          onClick={handleComplete}
          disabled={!canProceed}
        >
          🎣 CAST #{castNumber}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/SetupScreen.css`**

```css
/* src/components/SetupScreen.css */
.ss {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  padding-bottom: var(--space-8);
}

/* ── Section ── */
.ss__section { display: flex; flex-direction: column; gap: var(--space-2); }

.ss__section-label {
  font-family: var(--font-display);
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* ── Scene strip (spots) ── */
.ss__scene-strip {
  display: flex;
  gap: var(--space-2);
}

.ss__spot {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-2) var(--space-1);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  background: var(--bg-card-raised);
  transition: all var(--t-fast);
  cursor: pointer;
  min-height: 56px;
}

.ss__spot:hover:not(:disabled) {
  border-color: var(--text-muted);
  background: var(--bg-card-hover);
}

.ss__spot--selected {
  border-color: var(--brand-accent) !important;
  background: var(--bg-card-hover) !important;
  box-shadow: 0 0 10px rgba(232,168,76,0.35);
}

.ss__spot--locked { opacity: 0.3; cursor: not-allowed; }

.ss__spot-icon { font-size: 1.5rem; line-height: 1; }

.ss__spot-name {
  font-family: var(--font-display);
  font-size: 0.55rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--brand-accent);
  white-space: nowrap;
}

/* ── Chip rows (lure + cast style) ── */
.ss__chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.ss__chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-subtle);
  background: var(--bg-card-raised);
  transition: all var(--t-fast);
  cursor: pointer;
  min-height: 56px;
  min-width: 60px;
}

.ss__chip:hover:not(:disabled) {
  border-color: var(--text-muted);
  background: var(--bg-card-hover);
}

.ss__chip--selected {
  border-color: var(--brand-accent) !important;
  background: var(--bg-card-hover) !important;
  box-shadow: 0 0 10px rgba(232,168,76,0.35);
}

.ss__chip--locked { opacity: 0.3; cursor: not-allowed; }

.ss__chip-icon { font-size: 1.4rem; line-height: 1; }

.ss__chip-name {
  font-family: var(--font-display);
  font-size: 0.6rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* ── Live odds ── */
.ss__odds-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--bg-card-raised);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.ss__odds-bar {
  display: flex;
  height: 18px;
  border-radius: var(--radius-full);
  overflow: hidden;
  gap: 2px;
}

.ss__odds-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: flex var(--t-normal);
}

.ss__odds-seg--common  { background: var(--rarity-common);    opacity: 0.8; }
.ss__odds-seg--rare    { background: var(--rarity-rare);      opacity: 0.8; }
.ss__odds-seg--epic    { background: var(--rarity-legendary); opacity: 0.8; }

.ss__odds-pct {
  font-family: var(--font-display);
  font-size: 0.6rem;
  color: rgba(0,0,0,0.7);
  font-weight: 600;
}

.ss__odds-legend {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.6rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ss__dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
.ss__dot--common { background: var(--rarity-common); }
.ss__dot--rare   { background: var(--rarity-rare); }
.ss__dot--epic   { background: var(--rarity-legendary); }

/* ── Risk meter ── */
.ss__risk-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ss__risk-label {
  font-family: var(--font-display);
  font-size: 0.6rem;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  text-transform: uppercase;
  white-space: nowrap;
}

.ss__risk-track {
  flex: 1;
  height: 6px;
  background: var(--border-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.ss__risk-fill {
  height: 100%;
  background: linear-gradient(to right, var(--brand-accent), #ef4444);
  border-radius: var(--radius-full);
  transition: width var(--t-normal);
}

/* ── CTA ── */
.ss__cta-wrap { padding-top: var(--space-2); }

.ss__cta { width: 100%; }

.ss__cta:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
```

- [ ] **Step 3: Smoke-test the component manually**

Temporarily add to `App.jsx` (inside `<main>`):
```jsx
<SetupScreen castNumber={1} lockedSpot={null} lockedLure={null} onComplete={d => console.log(d)} />
```
Confirm: chips select, odds bar appears when all 3 chosen, quip updates, CTA enables. Remove the temp code.

- [ ] **Step 4: Commit**

```bash
git add src/components/SetupScreen.jsx src/components/SetupScreen.css
git commit -m "feat: SetupScreen — one-screen spot/lure/cast setup with live odds"
```

---

## Task 6: App.jsx Wiring

**Files:**
- Modify: `src/App.jsx`

Replace the entire file:

- [ ] **Step 1: Rewrite `src/App.jsx`**

```jsx
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
import { buildResult }                     from './utils/gameLogic.js';
import { buildGameParams }                 from './utils/gameParams.js';
import { DEV_DISABLE_DAILY_LIMIT, DAILY_CAST_LIMIT } from './config/gameConfig.js';
import {
  hasUsedAllCastsToday, loadTodayResult, loadTodayCatches, loadPlayerData,
  recordCastResult, updateStreak, checkAndUnlockBadges,
} from './utils/storageManager.js';

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

  // ── Called when SetupScreen completes ─────────────────────────
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

  // ── Called after each cast's gameplay phases complete ─────────
  function handleCastComplete(finalResult) {
    const streak = updateStreak();
    const { newBadges: fresh } = checkAndUnlockBadges(finalResult, streak);
    recordCastResult(finalResult);

    const updatedCatches = [...sessionCatches, finalResult];
    setSessionCatches(updatedCatches);

    const best = updatedCatches.reduce((b, c) => (!b || c.points > b.points) ? c : b, null);
    setBestResult(best);
    setNewBadges(prev => {
      const existingIds = prev.map(b => b.id);
      return [...prev, ...fresh.filter(b => !existingIds.includes(b.id))];
    });
    setPlayerData(loadPlayerData());

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

          {phase === 'result' && bestResult && (
            <div className="phase-enter">
              <ResultCard
                result={bestResult}
                newBadges={newBadges}
                buildChallengeUrl={buildChallengeUrl}
              />
              <Leaderboard playerResult={bestResult} />
              <PlayerStats playerData={playerData} />
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
```

- [ ] **Step 2: Confirm dev server runs without errors**

```bash
npm run dev
```
Click through: Landing → Setup (pick spot+lure+cast) → game should load. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: App.jsx retool — landing→setup→game flow, gameParams state"
```

---

## Task 7: DailyCastGame.jsx Wiring

**Files:**
- Modify: `src/components/DailyCastGame.jsx`

- [ ] **Step 1: Update `src/components/DailyCastGame.jsx`**

```jsx
// src/components/DailyCastGame.jsx
// Orchestrates one cast: CastMeter → BiteTiming → FightMeter → CatchReveal
import { useState } from 'react';
import './DailyCastGame.css';
import CastMeter   from './CastMeter.jsx';
import BiteTiming  from './BiteTiming.jsx';
import FightMeter  from './FightMeter.jsx';
import CatchReveal from './CatchReveal.jsx';
import { applyPerformanceBonuses } from '../utils/gameLogic.js';

export default function DailyCastGame({
  baseResult,
  gameParams,       // { castMeter, biteTiming, fightMeter } from buildGameParams()
  castNumber,
  totalCasts,
  onCastComplete,
}) {
  const [phase,       setPhase]       = useState('cast');
  const [accuracy,    setAccuracy]    = useState(0.5);
  const [hookset,     setHookset]     = useState(0.5);
  const [finalResult, setFinalResult] = useState(null);

  function handleCastComplete(acc) { setAccuracy(acc); setPhase('bite'); }

  function handleBiteComplete(hq) { setHookset(hq); setPhase('fight'); }

  function handleFightComplete(fq) {
    const result = applyPerformanceBonuses(baseResult, {
      accuracy:       accuracy,
      hooksetQuality: hookset,
      fightQuality:   fq,
    });
    setFinalResult(result);
    setPhase('reveal');
  }

  function handleContinue() { onCastComplete(finalResult); }

  return (
    <div className="dcg">
      <div className="dcg__phases">
        <span className={`dcg__phase-dot ${phase === 'cast'   ? 'dcg__phase-dot--active' : (phase !== 'cast'   ? 'dcg__phase-dot--done' : '')}`} />
        <span className={`dcg__phase-dot ${phase === 'bite'   ? 'dcg__phase-dot--active' : (['fight','reveal'].includes(phase) ? 'dcg__phase-dot--done' : '')}`} />
        <span className={`dcg__phase-dot ${phase === 'fight'  ? 'dcg__phase-dot--active' : (phase === 'reveal'  ? 'dcg__phase-dot--done' : '')}`} />
        <span className={`dcg__phase-dot ${phase === 'reveal' ? 'dcg__phase-dot--active' : ''}`} />
      </div>

      <div className="dcg__content phase-enter" key={phase}>
        {phase === 'cast'   && <CastMeter  config={gameParams?.castMeter}  onComplete={handleCastComplete} />}
        {phase === 'bite'   && <BiteTiming config={gameParams?.biteTiming} onComplete={handleBiteComplete} />}
        {phase === 'fight'  && (
          <FightMeter
            config={gameParams?.fightMeter}
            rarity={baseResult?.rarity}
            onComplete={handleFightComplete}
          />
        )}
        {phase === 'reveal' && finalResult && (
          <CatchReveal
            result={finalResult}
            castNumber={castNumber}
            totalCasts={totalCasts}
            onContinue={handleContinue}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run full game loop manually**

In the dev server, play through a full cast (setup → cast meter → bite timing → fight meter → catch reveal). Confirm no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/DailyCastGame.jsx
git commit -m "feat: DailyCastGame passes gameParams config props to minigames"
```

---

## Task 8: CastMeter Overhaul

**Files:**
- Modify: `src/components/CastMeter.jsx`
- Modify: `src/components/CastMeter.css`

- [ ] **Step 1: Rewrite `src/components/CastMeter.jsx`**

```jsx
// src/components/CastMeter.jsx
// Oscillating bar — tap to stop at the sweet spot.
// accuracy = how close to sweet spot center (0–1).
// config: { DURATION_MS, SWEET_ZONE, sweetOffset } from gameParams.castMeter
import { useRef, useEffect, useState } from 'react';
import './CastMeter.css';

const DEFAULTS = { DURATION_MS: 1400, SWEET_ZONE: 0.28, sweetOffset: 0 };

export default function CastMeter({ config, onComplete }) {
  const { DURATION_MS, SWEET_ZONE, sweetOffset } = { ...DEFAULTS, ...config };
  const sweetCenter = 0.5 + sweetOffset; // center of sweet zone (0–1)

  const rafRef   = useRef(null);
  const startRef = useRef(null);
  const posRef   = useRef(0);

  const [position, setPosition] = useState(0);
  const [locked,   setLocked]   = useState(false);
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = (elapsed % (DURATION_MS * 2)) / DURATION_MS; // 0–2
      const pos = t <= 1 ? t : 2 - t;                        // triangle wave
      posRef.current = pos;
      setPosition(pos);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [DURATION_MS]);

  function handleCast() {
    if (locked) return;
    cancelAnimationFrame(rafRef.current);
    const pos = posRef.current;
    const dist = Math.abs(pos - sweetCenter) / 0.5; // 0 = center, 1 = edge
    const acc  = Math.max(0, 1 - dist);
    setAccuracy(acc);
    setLocked(true);
    setTimeout(() => onComplete(acc), 700);
  }

  const sweetLeft  = (sweetCenter - SWEET_ZONE / 2) * 100;
  const sweetWidth = SWEET_ZONE * 100;
  const inSweet    = accuracy !== null && Math.abs(posRef.current - sweetCenter) < SWEET_ZONE / 2;

  return (
    <div
      className="cm"
      onClick={handleCast}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleCast()}
      aria-label="Cast meter — tap to cast"
    >
      <p className="cm__label">TAP TO CAST!</p>
      <p className="cm__sub">Aim for the sweet spot</p>

      <div className="cm__bar">
        <div className="cm__sweet" style={{ left: `${sweetLeft}%`, width: `${sweetWidth}%` }} />
        <div
          className={`cm__indicator ${locked ? (inSweet ? 'cm__indicator--hit' : 'cm__indicator--miss') : ''}`}
          style={{ left: `calc(${position * 100}% - 12px)` }}
        />
      </div>

      {locked && (
        <p className={`cm__result ${inSweet ? 'cm__result--hit' : ''}`}>
          {inSweet ? '🎯 Sweet spot!' : `Cast accuracy: ${Math.round((accuracy ?? 0) * 100)}%`}
        </p>
      )}
      {!locked && <p className="cm__hint">Tap · Click · Space · Enter</p>}
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/components/CastMeter.css`**

```css
/* src/components/CastMeter.css */
.cm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  min-height: calc(100dvh - 120px);
  padding: var(--space-6) var(--space-4);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.cm__label {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: 2px;
  color: var(--brand-accent);
  text-transform: uppercase;
}

.cm__sub {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: -var(--space-2);
}

.cm__bar {
  position: relative;
  width: 100%;
  height: 48px;
  background: var(--bg-card-raised);
  border-radius: var(--radius-full);
  border: 2px solid var(--border-card);
  overflow: hidden;
}

.cm__sweet {
  position: absolute;
  top: 0; bottom: 0;
  background: rgba(74,124,47,0.35);
  border-left: 2px solid var(--brand-primary);
  border-right: 2px solid var(--brand-primary);
}

.cm__indicator {
  position: absolute;
  top: 4px; bottom: 4px;
  width: 24px;
  background: var(--text-primary);
  border-radius: var(--radius-full);
  box-shadow: 0 0 12px rgba(240,232,208,0.6);
  transition: background var(--t-fast), box-shadow var(--t-fast);
}

.cm__indicator--hit {
  background: var(--brand-accent);
  box-shadow: 0 0 20px rgba(232,168,76,0.8);
}

.cm__indicator--miss {
  background: #ef4444;
  box-shadow: 0 0 12px rgba(239,68,68,0.6);
}

.cm__result {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.cm__result--hit { color: var(--brand-accent); }

.cm__hint {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
}
```

- [ ] **Step 3: Play through cast meter in dev server**

Confirm the bar is full-width, hits/misses look correct with rugged colors. Test with different combos (safe cast should be slow; risky should be fast).

- [ ] **Step 4: Run full test suite**

```bash
npm test
```
Expected: all tests pass (logic files unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/components/CastMeter.jsx src/components/CastMeter.css
git commit -m "feat: CastMeter — config prop, full-height, Outdoor Rugged CSS"
```

---

## Task 9: BiteTiming Overhaul

**Files:**
- Modify: `src/components/BiteTiming.jsx`
- Modify: `src/components/BiteTiming.css`

- [ ] **Step 1: Rewrite `src/components/BiteTiming.jsx`**

```jsx
// src/components/BiteTiming.jsx
// Wait for the bite, then tap at the right moment.
// config: { WAIT_MIN_MS, WAIT_MAX_MS, WINDOW_MS, showPreBiteCue, noPreBiteWarning }
import { useRef, useEffect, useState, useCallback } from 'react';
import './BiteTiming.css';

const DEFAULTS = {
  WAIT_MIN_MS: 1500, WAIT_MAX_MS: 4000, WINDOW_MS: 800,
  showPreBiteCue: false, noPreBiteWarning: false,
};
const PERFECT_MS    = 250;
const PRE_BITE_CUE  = 400; // ms before bite that precision cue fires

export default function BiteTiming({ config, onComplete }) {
  const { WAIT_MIN_MS, WAIT_MAX_MS, WINDOW_MS, showPreBiteCue, noPreBiteWarning } =
    { ...DEFAULTS, ...config };

  const [phase,      setPhase]      = useState('waiting');
  const [quality,    setQuality]    = useState(null);
  const [showCue,    setShowCue]    = useState(false);
  const biteTimeRef                 = useRef(null);
  const timerRef                    = useRef(null);
  const cueTimerRef                 = useRef(null);

  const triggerBite = useCallback(() => {
    setShowCue(false);
    setPhase('bite');
    biteTimeRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      setPhase('miss');
      setTimeout(() => onComplete(0), 900);
    }, WINDOW_MS);
  }, [onComplete, WINDOW_MS]);

  useEffect(() => {
    const delay = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);

    // Precision cue: ripple 400ms before bite (skip if risky or delay too short)
    if (showPreBiteCue && !noPreBiteWarning && delay > PRE_BITE_CUE + 200) {
      cueTimerRef.current = setTimeout(() => setShowCue(true), delay - PRE_BITE_CUE);
    }

    timerRef.current = setTimeout(triggerBite, delay);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(cueTimerRef.current);
    };
  }, [triggerBite, WAIT_MIN_MS, WAIT_MAX_MS, showPreBiteCue, noPreBiteWarning]);

  function handleHookset() {
    if (phase === 'waiting') {
      clearTimeout(timerRef.current);
      clearTimeout(cueTimerRef.current);
      setPhase('late');
      setTimeout(() => onComplete(0.1), 900);
      return;
    }
    if (phase !== 'bite') return;
    clearTimeout(timerRef.current);
    const reaction = performance.now() - biteTimeRef.current;
    const q = Math.max(0, 1 - (reaction / WINDOW_MS));
    const boosted = reaction < PERFECT_MS ? Math.min(1, q * 1.3) : q;
    setQuality(boosted);
    setPhase('hit');
    setTimeout(() => onComplete(boosted), 800);
  }

  return (
    <div
      className={`bt bt--${phase}`}
      onClick={handleHookset}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleHookset()}
      aria-label="Bite timing — tap when the bobber dips!"
    >
      {phase === 'waiting' && (
        <>
          <div className={`bt__scene ${showCue ? 'bt__scene--cue' : ''}`}>
            <div className="bt__water">
              <div className="bt__wave" /><div className="bt__wave bt__wave--2" />
            </div>
            <div className="bt__bobber">
              <div className="bt__line" />
              <div className="bt__bob-top" /><div className="bt__bob-bot" />
            </div>
            {showCue && <div className="bt__precue" aria-hidden="true" />}
          </div>
          <p className="bt__prompt">🎣 Watching the bobber…</p>
          <p className="bt__sub">Tap the moment it dips!</p>
          <p className="bt__hint">Tap · Click · Space · Enter</p>
        </>
      )}

      {phase === 'bite' && (
        <>
          <div className="bt__scene bt__scene--bite">
            <div className="bt__water"><div className="bt__wave bt__wave--fast" /></div>
            <div className="bt__bobber bt__bobber--down">
              <div className="bt__line" />
              <div className="bt__bob-top" /><div className="bt__bob-bot" />
            </div>
            <div className="bt__splash" />
          </div>
          <p className="bt__prompt bt__prompt--now">🪝 HOOKSET!</p>
          <p className="bt__sub">NOW!</p>
        </>
      )}

      {phase === 'hit' && (
        <div className="bt__feedback bt__feedback--hit">
          <span className="bt__icon">🎣</span>
          <p className="bt__prompt">Got it!</p>
          <p className="bt__sub">{quality >= 0.75 ? 'Perfect hookset!' : quality >= 0.4 ? 'Solid hookset!' : 'Hooked!'}</p>
        </div>
      )}

      {phase === 'miss' && (
        <div className="bt__feedback bt__feedback--miss">
          <span className="bt__icon">💨</span>
          <p className="bt__prompt">Too slow!</p>
          <p className="bt__sub">The fish got away with the bait</p>
        </div>
      )}

      {phase === 'late' && (
        <div className="bt__feedback bt__feedback--late">
          <span className="bt__icon">🌊</span>
          <p className="bt__prompt">Too early!</p>
          <p className="bt__sub">Wait for the bobber to dip</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/components/BiteTiming.css`**

Keep all existing class rules but add `min-height` to `.bt` and the new precue class. Replace the full file:

```css
/* src/components/BiteTiming.css */
.bt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  min-height: calc(100dvh - 120px);
  padding: var(--space-6) var(--space-4);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

/* ── Scene ── */
.bt__scene {
  position: relative;
  width: 100%;
  height: 180px;
}

.bt__water {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 80px;
  background: linear-gradient(to bottom, rgba(26,44,26,0.6), rgba(15,26,13,0.9));
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  overflow: hidden;
}

.bt__wave {
  position: absolute;
  bottom: 0; left: -50%; right: -50%;
  height: 20px;
  background: rgba(74,124,47,0.2);
  border-radius: 50%;
  animation: waterWave 3s ease-in-out infinite;
}
.bt__wave--2  { animation-delay: 1.5s; opacity: 0.6; }
.bt__wave--fast { animation-duration: 0.8s; opacity: 0.8; background: rgba(74,124,47,0.3); }

/* ── Bobber ── */
.bt__bobber {
  position: absolute;
  left: 50%; bottom: 70px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: bobberFloat 2.5s ease-in-out infinite;
}
.bt__bobber--down {
  animation: bobberBite 0.4s ease-in forwards;
}

.bt__line {
  width: 2px; height: 60px;
  background: var(--text-muted);
  opacity: 0.6;
}
.bt__bob-top {
  width: 16px; height: 22px;
  background: var(--brand-accent);
  border-radius: 50% 50% 40% 40%;
}
.bt__bob-bot {
  width: 16px; height: 18px;
  background: #ef4444;
  border-radius: 40% 40% 50% 50%;
}

/* ── Splash ── */
.bt__splash {
  position: absolute;
  left: 50%; bottom: 68px;
  transform: translateX(-50%);
  width: 40px; height: 40px;
  border: 3px solid var(--brand-accent);
  border-radius: 50%;
  animation: ripple 0.6s ease-out forwards;
}

/* ── Pre-bite precision cue (ripple ring) ── */
.bt__precue {
  position: absolute;
  left: 50%; bottom: 80px;
  transform: translateX(-50%);
  width: 28px; height: 28px;
  border: 2px solid rgba(232,168,76,0.5);
  border-radius: 50%;
  animation: pulseRing 0.5s ease-out infinite;
}

/* ── Text ── */
.bt__prompt {
  font-family: var(--font-display);
  font-size: 1.6rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-primary);
}
.bt__prompt--now {
  color: var(--brand-accent);
  font-size: 2rem;
  animation: countdownPulse 0.3s ease-in-out infinite;
}

.bt__sub {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.bt__hint {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* ── Feedback states ── */
.bt__feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  animation: popIn 0.4s ease forwards;
}

.bt__icon { font-size: 3rem; }

.bt__feedback--hit  .bt__prompt { color: var(--brand-accent); }
.bt__feedback--miss .bt__prompt { color: #ef4444; }
.bt__feedback--late .bt__prompt { color: var(--text-muted); }
```

- [ ] **Step 3: Verify precue works**

In dev server, select precisionCast. On bite timing screen, wait — a faint pulsing ring should appear briefly before the bobber dips. Select riskyCast — no cue should appear.

- [ ] **Step 4: Commit**

```bash
git add src/components/BiteTiming.jsx src/components/BiteTiming.css
git commit -m "feat: BiteTiming — config prop, pre-bite cue, full-height, rugged CSS"
```

---

## Task 10: FightMeter Overhaul

**Files:**
- Modify: `src/components/FightMeter.jsx`
- Modify: `src/components/FightMeter.css`

- [ ] **Step 1: Rewrite `src/components/FightMeter.jsx`**

```jsx
// src/components/FightMeter.jsx
// Tension bar — tap to reel. Fish surges add tension spikes.
// fightQuality = fraction of time spent in safe zone (0–1, 0 if line broke).
// config: { FIGHT_DURATION_MS, DRIFT_RATE, REEL_POWER, SAFE_MAX, BREAK_MAX,
//           SURGE_INTERVAL_MIN, SURGE_INTERVAL_MAX, SURGE_AMOUNT, startingTension }
import { useRef, useEffect, useState, useCallback } from 'react';
import './FightMeter.css';

const DEFAULTS = {
  FIGHT_DURATION_MS: 8000,
  DRIFT_RATE:        0.00015,
  REEL_POWER:        0.12,
  SAFE_MAX:          0.65,
  BREAK_MAX:         0.95,
  SURGE_INTERVAL_MIN: 2000,
  SURGE_INTERVAL_MAX: 4000,
  SURGE_AMOUNT:       0.15,
  startingTension:    0.30,
};

export default function FightMeter({ config, rarity, onComplete }) {
  const cfg = { ...DEFAULTS, ...config };

  const [tension,  setTension]  = useState(cfg.startingTension);
  const [timeLeft, setTimeLeft] = useState(1);
  const [phase,    setPhase]    = useState('fighting'); // fighting | won | broke
  const [surging,  setSurging]  = useState(false);

  const tensionRef   = useRef(cfg.startingTension);
  const lastTickRef  = useRef(null);
  const safeTimeRef  = useRef(0);
  const totalTimeRef = useRef(0);
  const doneRef      = useRef(false);
  const rafRef       = useRef(null);
  const startRef     = useRef(null);
  const surgeRef     = useRef(null);

  const finish = useCallback((broke) => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    clearTimeout(surgeRef.current);
    const quality = broke
      ? 0
      : (totalTimeRef.current > 0 ? safeTimeRef.current / totalTimeRef.current : 0.5);
    setPhase(broke ? 'broke' : 'won');
    setTimeout(() => onComplete(quality), 900);
  }, [onComplete]);

  // Surge scheduler — fires random tension spikes
  const scheduleSurge = useCallback(() => {
    if (doneRef.current) return;
    const interval = cfg.SURGE_INTERVAL_MIN +
      Math.random() * (cfg.SURGE_INTERVAL_MAX - cfg.SURGE_INTERVAL_MIN);
    surgeRef.current = setTimeout(() => {
      if (doneRef.current) return;
      tensionRef.current = Math.min(cfg.BREAK_MAX - 0.01, tensionRef.current + cfg.SURGE_AMOUNT);
      setTension(tensionRef.current);
      setSurging(true);
      setTimeout(() => setSurging(false), 500);
      scheduleSurge();
    }, interval);
  }, [cfg.SURGE_INTERVAL_MIN, cfg.SURGE_INTERVAL_MAX, cfg.SURGE_AMOUNT, cfg.BREAK_MAX]);

  useEffect(() => {
    function tick(ts) {
      if (!startRef.current) { startRef.current = ts; lastTickRef.current = ts; }
      const dt = ts - lastTickRef.current;
      lastTickRef.current = ts;
      totalTimeRef.current += dt;

      const elapsed   = ts - startRef.current;
      const remaining = Math.max(0, cfg.FIGHT_DURATION_MS - elapsed) / cfg.FIGHT_DURATION_MS;
      setTimeLeft(remaining);

      const newTension = Math.min(cfg.BREAK_MAX + 0.01, tensionRef.current + cfg.DRIFT_RATE * dt);
      tensionRef.current = newTension;
      setTension(newTension);

      if (newTension < cfg.SAFE_MAX) safeTimeRef.current += dt;
      if (newTension >= cfg.BREAK_MAX) { finish(true); return; }
      if (remaining <= 0)              { finish(false); return; }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    scheduleSurge();
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(surgeRef.current);
    };
  }, [finish, scheduleSurge, cfg.FIGHT_DURATION_MS, cfg.DRIFT_RATE, cfg.SAFE_MAX, cfg.BREAK_MAX]);

  function handleReel() {
    if (doneRef.current || phase !== 'fighting') return;
    tensionRef.current = Math.max(0, tensionRef.current - cfg.REEL_POWER);
    setTension(tensionRef.current);
  }

  const tensionPct = Math.round(tension * 100);
  const inDanger   = tension >= cfg.SAFE_MAX;
  const barColor   = tension < 0.4 ? '#22c55e' : tension < cfg.SAFE_MAX ? '#f59e0b' : '#ef4444';

  return (
    <div
      className={`fm fm--${phase} ${surging ? 'fm--surge' : ''}`}
      onClick={handleReel}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleReel()}
      aria-label="Fight meter — tap to reel!"
    >
      {phase === 'fighting' && (
        <>
          <p className="fm__label">⚡ TAP TO REEL!</p>
          {surging
            ? <p className="fm__surge-label">🐟 Fish is running!</p>
            : <p className="fm__sub">Keep tension in the safe zone</p>
          }

          {/* Time bar */}
          <div className="fm__time-bar">
            <div className="fm__time-fill" style={{ width: `${timeLeft * 100}%` }} />
          </div>

          {/* Tension bar */}
          <div className="fm__tension-track">
            <div className="fm__safe-zone" />
            <div
              className={`fm__tension-fill ${inDanger ? 'fm__tension-fill--danger' : ''}`}
              style={{ width: `${tensionPct}%`, background: barColor }}
            />
            <div className="fm__safe-line" style={{ left: `${cfg.SAFE_MAX * 100}%` }} />
          </div>

          <div className="fm__status">
            {inDanger
              ? <span className="fm__status--danger">⚠️ Too tight — reel faster!</span>
              : <span className="fm__status--safe">✅ Good tension</span>
            }
          </div>
          <p className="fm__hint">Tap · Click · Space · Enter</p>
        </>
      )}

      {phase === 'won' && (
        <div className="fm__feedback fm__feedback--won">
          <span className="fm__icon">🎣</span>
          <p className="fm__result">Fish landed!</p>
        </div>
      )}

      {phase === 'broke' && (
        <div className="fm__feedback fm__feedback--broke">
          <span className="fm__icon">💔</span>
          <p className="fm__result">Line broke!</p>
          <p className="fm__sub">Didn't reel fast enough</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/components/FightMeter.css`**

```css
/* src/components/FightMeter.css */
.fm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  min-height: calc(100dvh - 120px);
  padding: var(--space-6) var(--space-4);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  transition: background var(--t-fast);
}

.fm--surge { background: rgba(239,68,68,0.06); }

.fm__label {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--brand-accent);
}

.fm__surge-label {
  font-family: var(--font-display);
  font-size: 1rem;
  letter-spacing: 1px;
  color: #ef4444;
  text-transform: uppercase;
  animation: countdownPulse 0.4s ease-in-out infinite;
}

.fm__sub {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* ── Time bar ── */
.fm__time-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-card-raised);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.fm__time-fill {
  height: 100%;
  background: var(--brand-accent);
  border-radius: var(--radius-full);
  transition: width 0.1s linear;
}

/* ── Tension track ── */
.fm__tension-track {
  position: relative;
  width: 100%;
  height: 28px;
  background: var(--bg-card-raised);
  border-radius: var(--radius-full);
  border: 2px solid var(--border-card);
  overflow: hidden;
}

.fm__safe-zone {
  position: absolute;
  top: 0; bottom: 0; left: 0;
  width: 65%;
  background: rgba(34,197,94,0.08);
}

.fm__tension-fill {
  position: absolute;
  top: 0; bottom: 0; left: 0;
  border-radius: var(--radius-full);
  transition: width 0.05s linear, background 0.15s ease;
}

.fm__tension-fill--danger {
  animation: glowPulse 0.3s ease-in-out infinite;
}

.fm__safe-line {
  position: absolute;
  top: 0; bottom: 0;
  width: 3px;
  background: rgba(34,197,94,0.6);
}

/* ── Status ── */
.fm__status { font-family: var(--font-body); font-size: 0.85rem; }
.fm__status--safe   { color: #22c55e; }
.fm__status--danger { color: #ef4444; }

.fm__hint {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* ── Outcome feedback ── */
.fm__feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  animation: popIn 0.4s ease forwards;
}

.fm__icon { font-size: 3.5rem; }

.fm__result {
  font-family: var(--font-display);
  font-size: 1.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.fm__feedback--won  .fm__result { color: var(--brand-accent); }
.fm__feedback--broke .fm__result { color: #ef4444; }
```

- [ ] **Step 3: Test FightMeter duration**

In dev server, start a fight. The tension bar should take ~4+ seconds to reach danger without tapping (instead of the old ~0.5s). Surges should produce red flashes and "Fish is running!" text.

- [ ] **Step 4: Commit**

```bash
git add src/components/FightMeter.jsx src/components/FightMeter.css
git commit -m "feat: FightMeter — surge system, slow drift, config prop, full-height"
```

---

## Task 11: CatchReveal — TModel2 Reaction

**Files:**
- Modify: `src/components/CatchReveal.jsx`
- Modify: `src/components/CatchReveal.css`

- [ ] **Step 1: Update `src/components/CatchReveal.jsx`**

Add TModel2 mascot quip below the fish card. Insert after the import lines:

```jsx
import MascotQuip from './MascotQuip.jsx';
import { getCatchQuip } from '../utils/mascotLines.js';
```

Inside the `{stage !== 'splash'}` block, after the closing `</div>` of `.cr__card`, add:

```jsx
{(stage === 'details' || stage === 'actions') && (
  <MascotQuip mascot="tmodel2" line={getCatchQuip(result.rarity)} size={100} />
)}
```

Full updated `CatchReveal.jsx`:

```jsx
// src/components/CatchReveal.jsx
import { useState, useEffect } from 'react';
import './CatchReveal.css';
import { getFishImage } from '../utils/fishImages.js';
import MascotQuip from './MascotQuip.jsx';
import { getCatchQuip } from '../utils/mascotLines.js';

const RARITY_LABELS = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

export default function CatchReveal({ result, castNumber, totalCasts, onContinue }) {
  const [stage, setStage] = useState('splash');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('fish'),    600);
    const t2 = setTimeout(() => setStage('details'), 1400);
    const t3 = setTimeout(() => setStage('actions'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const fishImg = getFishImage(result.fishId);

  return (
    <div className={`cr cr--${result.rarity}`}>
      <div className="cr__glow" aria-hidden="true" />

      {stage === 'splash' && (
        <div className="cr__splash">
          <span className="cr__splash-icon">🎣</span>
          <p className="cr__splash-text">CATCH #{castNumber}</p>
        </div>
      )}

      {stage !== 'splash' && (
        <>
          <div className="cr__card">
            <div className="cr__cast-counter">Cast {castNumber} of {totalCasts}</div>
            <span className={`cr__rarity-badge cr__rarity-badge--${result.rarity}`}>
              ★ {RARITY_LABELS[result.rarity].toUpperCase()}
            </span>
            <div className={`cr__fish-wrap cr__fish-wrap--${result.rarity}`}>
              {fishImg
                ? <img className="cr__fish-img" src={fishImg} alt={result.fishName} />
                : <span className="cr__fish-emoji" role="img" aria-label={result.fishName}>{result.emoji}</span>
              }
            </div>
            <h2 className="cr__name">{result.fishName}</h2>

            {(stage === 'details' || stage === 'actions') && (
              <div className="cr__details">
                <div className="cr__stat">
                  <span className="cr__stat-label">Weight</span>
                  <span className="cr__stat-value">{result.weight} lbs</span>
                </div>
                <div className="cr__stat-divider" />
                <div className="cr__stat">
                  <span className="cr__stat-label">Points</span>
                  <span className="cr__stat-value">{result.points.toLocaleString()}</span>
                </div>
                {result.bonusPoints > 0 && (
                  <>
                    <div className="cr__stat-divider" />
                    <div className="cr__stat">
                      <span className="cr__stat-label">Bonus</span>
                      <span className="cr__stat-value cr__stat-value--bonus">+{result.bonusPoints.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {stage === 'actions' && (
              <div className="cr__actions">
                <button className="btn btn--primary cr__btn" onClick={onContinue}>
                  {castNumber < totalCasts ? `Cast #${castNumber + 1} →` : '🏆 See Results'}
                </button>
                <p className="cr__flavor"><em>{result.flavor}</em></p>
              </div>
            )}
          </div>

          {(stage === 'details' || stage === 'actions') && (
            <MascotQuip mascot="tmodel2" line={getCatchQuip(result.rarity)} size={100} />
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `src/components/CatchReveal.css` — add rugged background tint**

Find `.cr` in CatchReveal.css and confirm/add `background: var(--bg-card)`. The rarity glow system stays unchanged. No other CSS changes needed — rarity-specific styles remain as-is.

- [ ] **Step 3: Test catch reveal**

Play through a full cast. After the fight, TModel2 should appear beside the fish card with a rarity-appropriate line once the details slide in.

- [ ] **Step 4: Commit**

```bash
git add src/components/CatchReveal.jsx src/components/CatchReveal.css
git commit -m "feat: CatchReveal — TModel2 reaction line by rarity"
```

---

## Task 12: Header — Logo Image

**Files:**
- Modify: `src/components/Header.jsx`
- Modify: `src/components/Header.css`

- [ ] **Step 1: Update `src/components/Header.jsx`**

```jsx
// src/components/Header.jsx
import './Header.css';
import logoSrc from '../../assets/reference/buzzardroostlogo.avif';
import { streakEmoji } from '../config/gameConfig.js';

export default function Header({ playerData }) {
  const streak    = playerData?.streak?.count ?? 0;
  const emoji     = streakEmoji(streak);
  const showStreak = streak >= 7;

  return (
    <header className="header">
      <div className="header__brand">
        <img className="header__logo" src={logoSrc} alt="Buzzard Roost" />
        <div className="header__text">
          <span className="header__name">Buzzard Roost</span>
          <span className="header__sub">Daily Cast</span>
        </div>
      </div>

      {showStreak && (
        <div className="header__streak" aria-label={`${streak} day streak`}>
          <span>{emoji}</span>
          <span className="header__streak-count">{streak}</span>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Update Header.css — add logo sizing**

In Header.css, replace `.header__eagle` rule (or add if absent) with:

```css
.header__logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}
```

- [ ] **Step 3: Verify logo in dev server**

The header should show the avif logo image instead of 🦅. If the image appears broken, check that the asset path `assets/reference/buzzardroostlogo.avif` exists (confirmed in file listing above).

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.jsx src/components/Header.css
git commit -m "feat: Header — Buzzard Roost logo image replaces emoji"
```

---

## Task 13: LandingScreen — Rugged Theme

**Files:**
- Modify: `src/components/LandingScreen.jsx`
- Modify: `src/components/LandingScreen.css`

- [ ] **Step 1: Update `src/components/LandingScreen.jsx`**

Replace the 🦅 emoji in the title with the logo image and update the start button label:

```jsx
// src/components/LandingScreen.jsx
import './LandingScreen.css';
import logoSrc from '../../assets/reference/buzzardroostlogo.avif';
import { MOCK_LEADERBOARD } from '../data/gameData.js';
import { streakEmoji } from '../config/gameConfig.js';

// 24 hand-placed stars (unchanged from original)
const STARS = [
  [  6,   8,  2, 3.1, 0.0 ], [ 17,   3,  3, 2.4, 1.6 ], [ 29,  19,  1, 4.0, 0.7 ],
  [ 41,   6,  2, 2.8, 2.2 ], [ 54,  14,  2, 3.6, 0.4 ], [ 68,   4,  3, 2.1, 1.9 ],
  [ 80,  11,  1, 4.3, 1.0 ], [ 93,   8,  2, 3.0, 2.7 ], [ 11,  31,  1, 2.6, 1.3 ],
  [ 24,  26,  2, 3.9, 0.8 ], [ 37,  42,  1, 4.5, 2.0 ], [ 50,  22,  2, 2.3, 0.1 ],
  [ 63,  36,  1, 3.4, 1.7 ], [ 75,  28,  2, 2.7, 0.5 ], [ 87,  44,  1, 4.1, 2.5 ],
  [  3,  48,  1, 3.7, 1.1 ], [ 20,  53,  2, 2.2, 2.9 ], [ 46,  49,  1, 3.8, 0.6 ],
  [ 60,  45,  2, 2.9, 1.4 ], [ 78,  51,  1, 4.6, 0.3 ], [ 88,  20,  2, 3.3, 2.1 ],
  [ 33,  57,  1, 2.5, 1.8 ], [ 14,  16,  1, 3.2, 0.9 ], [ 72,  40,  1, 4.2, 2.4 ],
];

export default function LandingScreen({ playerData, challengeData, onStart }) {
  const streak   = playerData?.streak?.count ?? 0;
  const topCatch = MOCK_LEADERBOARD[0];

  return (
    <div className="landing">
      {challengeData && (
        <div className="landing__challenge">
          🎯 A friend hooked a{' '}
          <strong className={`landing__challenge-rarity landing__challenge-rarity--${challengeData.rarity}`}>
            {challengeData.rarity}
          </strong>{' '}
          catch for <strong>
            {(Number.isFinite(challengeData.points) ? challengeData.points : 0).toLocaleString()} pts
          </strong>. Can you top them?
        </div>
      )}

      <div className="landing__scene" aria-hidden="true">
        <div className="landing__sky">
          {STARS.map(([x, y, size, dur, delay], i) => (
            <div key={i} className="landing__star"
              style={{ '--x': `${x}%`, '--y': `${y}%`, '--size': `${size}px`, '--dur': `${dur}s`, '--delay': `${delay}s` }}
            />
          ))}
          <div className="landing__moon" />
        </div>
        <div className="landing__water">
          <div className="landing__wave" /><div className="landing__wave landing__wave--2" />
          <div className="landing__bobber">
            <div className="landing__fishing-line" />
            <div className="landing__bobber-top" />
            <div className="landing__bobber-mid" />
            <div className="landing__bobber-bottom" />
          </div>
          <div className="landing__ripple" /><div className="landing__ripple landing__ripple--2" />
          <div className="landing__moon-sheen" />
        </div>
      </div>

      <div className="landing__brand">
        <img className="landing__logo" src={logoSrc} alt="Buzzard Roost" />
        <p className="landing__daily">Daily Cast</p>
        <p className="landing__tagline">Three casts. Discover rare fish. Earn rewards.</p>
      </div>

      {streak > 0 && (
        <div className="landing__streak">
          {streakEmoji(streak)} {streak}-day streak — don't break it!
        </div>
      )}

      <div className="landing__fomo">
        <span className="landing__fomo-label">Today's top catch</span>
        <span className="landing__fomo-catch">
          <span className={`rarity-badge rarity-badge--${topCatch.rarity}`}>{topCatch.rarity}</span>
          {topCatch.fish} · {topCatch.points.toLocaleString()} pts
        </span>
      </div>

      <button className="btn btn--primary btn--large landing__cta" onClick={onStart}>
        🎣 Start Today's Casts
      </button>

      <p className="landing__legal">Free to play · 3 casts per day · Resets at midnight</p>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/components/LandingScreen.css` — add logo rule**

Add to LandingScreen.css (after `.landing__brand`):

```css
.landing__logo {
  height: 64px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 12px rgba(232,168,76,0.3));
}
```

Remove or comment out the old `.landing__title` rule that used the `🦅` emoji text styling (h1 font-size etc.) if it exists — the logo image replaces it.

- [ ] **Step 3: Commit**

```bash
git add src/components/LandingScreen.jsx src/components/LandingScreen.css
git commit -m "feat: LandingScreen — logo image, rugged theme update"
```

---

## Task 14: AlreadyPlayed — Snowball Integration

**Files:**
- Modify: `src/components/AlreadyPlayed.jsx`
- Modify: `src/components/AlreadyPlayed.css`

- [ ] **Step 1: Update `src/components/AlreadyPlayed.jsx`**

Add Snowball sprite with streak-aware line:

```jsx
// src/components/AlreadyPlayed.jsx
import { useState, useEffect } from 'react';
import './AlreadyPlayed.css';
import { streakEmoji } from '../config/gameConfig.js';
import { getFishImage } from '../utils/fishImages.js';
import MascotQuip from './MascotQuip.jsx';

function msUntilMidnight() {
  const now = new Date();
  const mid = new Date(now); mid.setDate(mid.getDate() + 1); mid.setHours(0,0,0,0);
  return mid - now;
}

function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const p = n => String(n).padStart(2, '0');
  return { h: p(h), m: p(m), s: p(s) };
}

export default function AlreadyPlayed({ result, todayCatches = [], playerData }) {
  const [timeLeft, setTimeLeft] = useState(msUntilMidnight());
  const streak = playerData?.streak?.count ?? 0;

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, s } = formatCountdown(timeLeft);
  const catches     = todayCatches.length > 0 ? todayCatches : (result ? [result] : []);
  const bestPoints  = catches.reduce((max, c) => Math.max(max, c.points ?? 0), 0);

  const snowballLine = streak > 0
    ? `${streak}-day streak. Come back tomorrow and don't break it.`
    : "All three casts done. See you tomorrow.";

  return (
    <div className="ap">
      <div className="ap__scene" aria-hidden="true">
        <div className="ap__sky" />
        <div className="ap__water">
          <div className="ap__wave" /><div className="ap__wave ap__wave--2" />
          <div className="ap__bobber">
            <div className="ap__bobber-top" /><div className="ap__bobber-bot" />
          </div>
        </div>
      </div>

      <div className="ap__content">
        <h2 className="ap__heading">All Casts Done!</h2>

        <MascotQuip mascot="snowball" line={snowballLine} size={100} />

        <div className="ap__catches">
          {catches.map((c, i) => (
            <div
              key={i}
              className={`ap__catch ap__catch--${c.rarity} ${c.points === bestPoints && catches.length > 1 ? 'ap__catch--best' : ''}`}
            >
              {c.points === bestPoints && catches.length > 1 && (
                <span className="ap__catch-best-label">⭐ Best Catch</span>
              )}
              <span className={`rarity-badge rarity-badge--${c.rarity}`}>★ {c.rarity.toUpperCase()}</span>
              {getFishImage(c.fishId)
                ? <img className="ap__catch-fish-img" src={getFishImage(c.fishId)} alt={c.fishName} />
                : <span className="ap__catch-emoji" role="img" aria-label={c.fishName}>{c.emoji}</span>
              }
              <span className="ap__catch-name">{c.fishName}</span>
              <span className="ap__catch-stats">{c.weight} lbs · {c.points.toLocaleString()} pts</span>
              {c.coupon && (
                <div className="ap__catch-coupon">
                  <span className="ap__coupon-label">{c.coupon.label}</span>
                  <code className="ap__coupon-code">{c.coupon.code}</code>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="ap__countdown">
          <p className="ap__countdown-label">New casts available in</p>
          <div className="ap__countdown-clock">
            <div className="ap__unit"><span className="ap__num">{h}</span><span className="ap__unit-label">hrs</span></div>
            <span className="ap__colon">:</span>
            <div className="ap__unit"><span className="ap__num">{m}</span><span className="ap__unit-label">min</span></div>
            <span className="ap__colon">:</span>
            <div className="ap__unit"><span className="ap__num">{s}</span><span className="ap__unit-label">sec</span></div>
          </div>
        </div>

        <a className="btn btn--primary" href="https://buzzardgear.com/" target="_blank" rel="noopener noreferrer">
          Shop Buzzard Roost →
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Confirm AlreadyPlayed renders (force it)**

Temporarily change `useState('landing')` to `useState('played')` in App.jsx, open dev server, verify Snowball appears with line. Revert immediately.

- [ ] **Step 3: Commit**

```bash
git add src/components/AlreadyPlayed.jsx src/components/AlreadyPlayed.css
git commit -m "feat: AlreadyPlayed — Snowball mascot + streak-aware line"
```

---

## Task 15: ResultCard CSS Theme Cleanup

**Files:**
- Modify: `src/components/ResultCard.css` (CSS only — no JSX changes needed)

- [ ] **Step 1: Verify ResultCard renders correctly with new tokens**

In dev server, play to results. Check that `.result-card` backgrounds, borders, and text colors all pull from the updated CSS custom properties. The rarity glow system uses the `--glow-*` vars which are unchanged — they should still work.

- [ ] **Step 2: Fix any hard-coded ocean-blue colors in ResultCard.css**

Read `src/components/ResultCard.css`. Search for any hard-coded color values referencing the old navy palette (e.g., `#0d1f35`, `#060c18`, `rgba(10,40,80`, `rgba(42,90,140`). Replace with equivalent rugged vars:
- `#060c18` → `var(--bg-dark)`
- `#0d1f35` → `var(--bg-card)`
- `rgba(42,90,140,0.4)` → `var(--border-card)`

- [ ] **Step 3: Check DailyCastGame.css for hard-coded colors**

Read `src/components/DailyCastGame.css`. Apply same search-and-replace for navy colors → rugged vars.

- [ ] **Step 4: Run full test suite one more time**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultCard.css src/components/DailyCastGame.css
git commit -m "style: ResultCard + DailyCastGame — purge hard-coded navy colors"
```

---

## Task 16: Final Verification + Push to v2

- [ ] **Step 1: Full manual QA checklist**

Play through the complete 3-cast session in dev server (`npm run dev`):

1. Landing screen: logo visible, start button works
2. Setup screen (cast 1): spot/lure/cast all selectable, odds bar appears, quip changes, CTA activates
3. Cast meter: speed matches cast style (safe=slow, risky=fast), sweet zone width varies
4. Bite timing: worm lure has long wait, frog has fast wait; precisionCast shows faint pre-bite cue
5. Fight meter: ~4+ seconds to break without tapping, surges fire with "Fish is running!" label
6. Catch reveal: TModel2 appears with rarity-appropriate line
7. Setup screen (cast 2): spot + lure locked (dimmed), only cast style active
8. After cast 3: result screen loads correctly
9. Already Played screen: Snowball visible with streak line

- [ ] **Step 2: Run full test suite**

```bash
npm test
```
Expected: 97 tests pass (67 original + 17 gameParams + 13 mascotLines).

- [ ] **Step 3: Confirm DEV_DISABLE_DAILY_LIMIT is still true**

```bash
grep "DEV_DISABLE_DAILY_LIMIT" src/config/gameConfig.js
```
Expected output: `export const DEV_DISABLE_DAILY_LIMIT = true;`

If it's `false`, change it back to `true` before pushing.

- [ ] **Step 4: Build production bundle**

```bash
npm run build
```
Expected: no errors. `dist/` folder created.

- [ ] **Step 5: Push to v2 branch**

```bash
git push origin master:v2
```
Cloudflare Pages auto-deploys from the `v2` branch. Wait ~2 minutes, then open the Cloudflare Pages URL to verify the live deployment.

- [ ] **Step 6: Final commit if any last fixes**

```bash
git add -A
git commit -m "feat: full Outdoor Rugged retool complete"
git push origin master:v2
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Outdoor Rugged palette — Task 1
- ✅ One-screen setup (Option C) — Task 5
- ✅ Choice → minigame mechanics — Tasks 2, 8, 9, 10
- ✅ Live odds bar — Task 5
- ✅ Risk meter — Task 5
- ✅ TModel2 setup quips — Tasks 3, 5
- ✅ TModel2 catch reveal reactions — Tasks 3, 11
- ✅ Snowball on Already Played — Task 14
- ✅ FightMeter surge system — Task 10
- ✅ FightMeter slow drift (0.00010–0.00026 vs old 0.0012) — Task 10
- ✅ Spot + lure persist across 3 casts, cast style re-picks — Tasks 5, 6
- ✅ Logo replaces 🦅 in header and landing — Tasks 12, 13
- ✅ Full-height minigames (`min-height: calc(100dvh - 120px)`) — Tasks 8, 9, 10
- ✅ DEV_DISABLE_DAILY_LIMIT stays true — enforced in Task 16 step 3

**No placeholders found.**

**Type consistency:**
- `buildGameParams` returns `{ castMeter, biteTiming, fightMeter }` — matches usage in Task 7 (`gameParams.castMeter`, `gameParams.biteTiming`, `gameParams.fightMeter`)
- `onComplete` prop name consistent across CastMeter, BiteTiming, FightMeter
- `lockedSpot` / `lockedLure` props used identically in App.jsx (Task 6) and SetupScreen.jsx (Task 5)
- `handleSetupComplete({ spotId, lureId, castStyleId })` — destructured identically in App.jsx handler and called from SetupScreen's `onComplete`
