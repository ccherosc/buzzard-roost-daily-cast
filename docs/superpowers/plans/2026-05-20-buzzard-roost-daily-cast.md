# Buzzard Roost Daily Cast — Implementation Plan (Part 1: Tasks 1–5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, polished daily fishing mini-game as a Vite + React static site with localStorage persistence, anti-tamper result signing, and viral sharing features.

**Architecture:** Flat phase-state machine in App.jsx (`landing→spot→lure→cast→animation→result|played`). All tunable game values in `src/config/gameConfig.js`. Pure utility functions in `src/utils/`. Per-component CSS files scoped by class prefix.

**Tech Stack:** React 18, Vite 5, Vitest 1, plain CSS, localStorage, Google Fonts (Oswald + Nunito), zero other runtime deps.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `.gitignore`

- [ ] **Step 1.1 — Init git and create package.json**

```bash
cd c:/Project_BuzzardFishing
git init
```

Create `package.json`:
```json
{
  "name": "buzzard-roost-daily-cast",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.1",
    "vitest": "^1.6.0",
    "@vitest/coverage-v8": "^1.6.0"
  }
}
```

- [ ] **Step 1.2 — Create vite.config.js**

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 1.3 — Create index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="description" content="Buzzard Roost Daily Cast — One cast a day. Discover rare fish. Earn exclusive rewards." />
    <meta name="theme-color" content="#060c18" />
    <meta property="og:title" content="Buzzard Roost Daily Cast 🎣" />
    <meta property="og:description" content="Cast once a day, discover rare fish, earn exclusive coupons!" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎣</text></svg>" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,600&display=swap" rel="stylesheet" />
    <title>Buzzard Roost Daily Cast 🎣</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 1.4 — Create .gitignore**

```
node_modules/
dist/
.env
.env.local
.superpowers/
```

- [ ] **Step 1.5 — Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 1.6 — Create src directory structure**

```bash
mkdir -p src/config src/data src/utils src/components
```

- [ ] **Step 1.7 — Commit**

```bash
git add .
git commit -m "feat: scaffold Vite + React project"
```

---

### Task 2: Global Design System

**Files:**
- Create: `src/index.css`
- Create: `src/App.css`
- Create: `src/main.jsx`

- [ ] **Step 2.1 — Create src/main.jsx**

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2.2 — Create src/index.css (design tokens + utilities)**

```css
/* ============================================================
   Buzzard Roost Daily Cast — Global Design System
   ============================================================ */

:root {
  /* Brand */
  --brand-primary: #e8732a;
  --brand-primary-hover: #d4621a;
  --brand-accent: #f4c430;

  /* Backgrounds */
  --bg-dark: #060c18;
  --bg-card: #0d1f35;
  --bg-card-raised: #122540;
  --bg-card-hover: #173060;

  /* Text */
  --text-primary: #e8f0f8;
  --text-secondary: #a0b8d0;
  --text-muted: #4a6a8a;

  /* Borders */
  --border-subtle: rgba(255,255,255,0.06);
  --border-card: rgba(42,90,140,0.4);

  /* Rarity */
  --rarity-common: #9ca3af;
  --rarity-uncommon: #22c55e;
  --rarity-rare: #3b82f6;
  --rarity-epic: #a855f7;
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

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; -webkit-text-size-adjust: 100%; }

body {
  font-family: var(--font-body);
  background: var(--bg-dark);
  color: var(--text-primary);
  min-height: 100dvh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button { font-family: inherit; cursor: pointer; border: none; background: none; }
a { color: inherit; text-decoration: none; }

/* ── Buttons ─────────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-2); padding: 14px 28px;
  border-radius: var(--radius-full);
  font-family: var(--font-display); font-size: 1rem;
  font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
  transition: all var(--t-fast); cursor: pointer;
}
.btn--primary {
  background: var(--brand-primary); color: white;
  box-shadow: 0 4px 20px rgba(232,115,42,0.4);
}
.btn--primary:hover {
  background: var(--brand-primary-hover);
  box-shadow: 0 6px 28px rgba(232,115,42,0.6);
  transform: translateY(-1px);
}
.btn--primary:active { transform: translateY(0); }
.btn--secondary {
  background: transparent; color: var(--text-secondary);
  border: 1px solid var(--border-card);
}
.btn--secondary:hover { border-color: var(--brand-primary); color: var(--brand-primary); }
.btn--large { padding: 18px 40px; font-size: 1.1rem; letter-spacing: 1px; }

/* ── Rarity Badges ───────────────────────────────────────── */
.rarity-badge {
  display: inline-block; padding: 2px 10px;
  border-radius: var(--radius-full);
  font-family: var(--font-display); font-size: 0.7rem;
  font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
  border: 1px solid;
}
.rarity-badge--common    { color: var(--rarity-common);    border-color: rgba(156,163,175,0.4); background: rgba(156,163,175,0.1); }
.rarity-badge--uncommon  { color: var(--rarity-uncommon);  border-color: rgba(34,197,94,0.4);   background: rgba(34,197,94,0.1); }
.rarity-badge--rare      { color: var(--rarity-rare);      border-color: rgba(59,130,246,0.4);  background: rgba(59,130,246,0.1); }
.rarity-badge--epic      { color: var(--rarity-epic);      border-color: rgba(168,85,247,0.4);  background: rgba(168,85,247,0.1); }
.rarity-badge--legendary { color: var(--rarity-legendary); border-color: rgba(245,158,11,0.4);  background: rgba(245,158,11,0.1); }

/* ── Keyframes ───────────────────────────────────────────── */
@keyframes fadeIn      { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideUp     { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes bobble      { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
@keyframes ripple      { 0%{transform:scale(0.5);opacity:0.8;} 100%{transform:scale(3);opacity:0;} }
@keyframes waterWave   { 0%,100%{transform:translateX(0) scaleY(1);} 50%{transform:translateX(-15px) scaleY(1.02);} }
@keyframes twinkle     { 0%,100%{opacity:0.2;transform:scale(0.8);} 50%{opacity:1;transform:scale(1.2);} }
@keyframes glowPulse   { 0%,100%{opacity:0.7;} 50%{opacity:1;} }
@keyframes bobberFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
@keyframes bobberBite  { 0%{transform:translateY(0);} 25%{transform:translateY(14px);} 50%{transform:translateY(-4px);} 75%{transform:translateY(20px);} 100%{transform:translateY(28px);} }
@keyframes splashDrop  { 0%{transform:scale(0) translate(0,0);opacity:1;} 100%{transform:scale(1) translate(var(--dx),var(--dy));opacity:0;} }
@keyframes shimmer     { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
@keyframes countdownPulse { 0%,100%{color:var(--brand-accent);} 50%{color:var(--text-primary);} }
@keyframes popIn       { 0%{transform:scale(0.8);opacity:0;} 60%{transform:scale(1.05);} 100%{transform:scale(1);opacity:1;} }
@keyframes cardFlip    { from{transform:rotateY(0deg);} to{transform:rotateY(180deg);} }
```

- [ ] **Step 2.3 — Create src/App.css**

```css
/* src/App.css */
.app-shell {
  min-height: 100dvh;
  background: var(--bg-dark);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(10,40,80,0.3) 0%, transparent 70%),
    radial-gradient(ellipse at 80% 20%, rgba(10,20,50,0.4) 0%, transparent 60%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
}

@media (min-width: 540px) {
  .app-shell { padding: 24px 16px 48px; align-items: center; }
}

.app-card {
  width: 100%;
  max-width: 480px;
  min-height: 100dvh;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

@media (min-width: 540px) {
  .app-card {
    min-height: auto;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-card);
    box-shadow: 0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(42,90,140,0.2);
  }
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.phase-enter { animation: fadeIn 0.3s ease forwards; }
```

- [ ] **Step 2.4 — Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173`. Browser shows blank white page (no App.jsx yet). No console errors.

- [ ] **Step 2.5 — Commit**

```bash
git add .
git commit -m "feat: add global design system CSS and app shell"
```

---

### Task 3: Game Configuration

**Files:**
- Create: `src/config/gameConfig.js`

- [ ] **Step 3.1 — Create src/config/gameConfig.js**

```js
// src/config/gameConfig.js
// ============================================================
// BUZZARD ROOST DAILY CAST — Game Configuration
// All tunable values live here. Edit this file to rebalance
// fish odds, adjust coupons, or change points without touching
// any game logic.
// ============================================================

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// ── Base rarity weights (before modifiers) ────────────────
// These sum to 100 as a starting point. Modifiers are added
// on top, then the result is clamped to min 1 and normalized.
export const BASE_WEIGHTS = {
  common:    50,
  uncommon:  25,
  rare:      15,
  epic:       7,
  legendary:  3,
};

// ── Spot modifiers (keyed by spot id from gameData.js) ────
export const SPOT_MODIFIERS = {
  dock:        { common:  8, uncommon:  4, rare: -2, epic: -5, legendary: -5 },
  reeds:       { common:  3, uncommon:  6, rare:  3, epic: -3, legendary: -2 },
  fallenTree:  { common: -3, uncommon:  2, rare:  6, epic:  2, legendary:  0 },
  deepWater:   { common:-10, uncommon: -3, rare:  2, epic:  7, legendary:  4 },
  rockyBank:   { common: -3, uncommon:  0, rare:  4, epic:  2, legendary:  1 },
};

// ── Lure modifiers (keyed by lure id from gameData.js) ────
export const LURE_MODIFIERS = {
  worm:        { common:  8, uncommon:  4, rare: -2, epic: -4, legendary: -4 },
  spinner:     { common:  0, uncommon:  5, rare:  3, epic: -1, legendary: -1 },
  frog:        { common: -2, uncommon:  2, rare:  5, epic:  3, legendary:  0 },
  jig:         { common:  0, uncommon:  2, rare:  3, epic:  3, legendary: -1 },
  mysteryLure: { common:-12, uncommon: -4, rare:  2, epic:  7, legendary:  7 },
};

// ── Cast style modifiers (keyed by cast id from gameData.js)
export const CAST_MODIFIERS = {
  safeCast:      { common: 10, uncommon:  3, rare: -3, epic: -5, legendary: -5 },
  precisionCast: { common: -2, uncommon:  3, rare:  5, epic:  1, legendary: -1 },
  powerCast:     { common: -5, uncommon: -2, rare:  3, epic:  5, legendary:  2 },
  riskyCast:     { common:-15, uncommon: -5, rare:  3, epic:  7, legendary: 10 },
};

// ── Points per rarity (base + random 0..variance) ─────────
export const POINTS_RANGES = {
  common:    { base:   50, variance:  100 },
  uncommon:  { base:  150, variance:  200 },
  rare:      { base:  350, variance:  300 },
  epic:      { base:  650, variance:  550 },
  legendary: { base: 1200, variance: 1300 },
};

// ── Coupon rewards per rarity ─────────────────────────────
// SHOPIFY: In V2 replace 'discount' with a Shopify price rule
// type ('percentage' | 'fixed_amount' | 'free_shipping').
export const COUPON_RULES = {
  common:    { discount: '5% off',                  label: "Angler's Discount"   },
  uncommon:  { discount: '10% off',                 label: 'Bass Hunter Deal'     },
  rare:      { discount: '15% off',                 label: 'Trophy Catch Reward'  },
  epic:      { discount: 'Free shipping + 15% off', label: 'Epic Haul Reward'     },
  legendary: { discount: '20% off',                 label: 'Monster Catch Coupon' },
};

// ── Scarcity copy shown on Epic/Legendary cards ───────────
export const SCARCITY_COPY = {
  epic:      'Only 10% of anglers ever land a catch like this.',
  legendary: 'Only 3% of anglers ever hook a legend like this.',
};

// ── Streak badge thresholds ───────────────────────────────
export const STREAK_TIERS = [
  { min: 100, emoji: '👑', label: 'Legend' },
  { min:  30, emoji: '💎', label: 'Dedicated Angler' },
  { min:   7, emoji: '🔥', label: 'On Fire' },
  { min:   1, emoji: '🎣', label: '' },
];

export function streakEmoji(count) {
  for (const tier of STREAK_TIERS) {
    if (count >= tier.min) return tier.emoji;
  }
  return '🎣';
}
```

- [ ] **Step 3.2 — Commit**

```bash
git add src/config/gameConfig.js
git commit -m "feat: add game configuration (weights, coupons, points)"
```

---

### Task 4: Data Files

**Files:**
- Create: `src/data/fishData.js`
- Create: `src/data/gameData.js`

- [ ] **Step 4.1 — Create src/data/fishData.js**

```js
// src/data/fishData.js
// 22 fish across 5 rarity tiers.
// weightMin / weightMax are in pounds.

export const FISH_DATABASE = {
  common: [
    { id: 'bluegill',     name: 'Bluegill',     emoji: '🐟', rarity: 'common', weightMin: 0.2, weightMax: 1.5, flavor: 'Scrappy little fighter. Every angler\'s first catch.' },
    { id: 'sunfish',      name: 'Sunfish',       emoji: '🐡', rarity: 'common', weightMin: 0.1, weightMax: 1.2, flavor: 'Flash of gold in shallow water. Classic.' },
    { id: 'yellow_perch', name: 'Yellow Perch',  emoji: '🐠', rarity: 'common', weightMin: 0.3, weightMax: 2.0, flavor: 'Schooling fish. Where there\'s one, there\'s more.' },
    { id: 'crappie',      name: 'Crappie',       emoji: '🐟', rarity: 'common', weightMin: 0.2, weightMax: 2.5, flavor: 'Light bite, great table fare.' },
    { id: 'rock_bass',    name: 'Rock Bass',     emoji: '🐠', rarity: 'common', weightMin: 0.2, weightMax: 1.8, flavor: 'Tough as nails and full of attitude.' },
  ],
  uncommon: [
    { id: 'largemouth_bass',  name: 'Largemouth Bass',  emoji: '🐠', rarity: 'uncommon', weightMin: 1.5, weightMax: 8.0,  flavor: 'The bread and butter of bass fishing.' },
    { id: 'smallmouth_bass',  name: 'Smallmouth Bass',  emoji: '🐟', rarity: 'uncommon', weightMin: 1.0, weightMax: 6.0,  flavor: 'Pound for pound the hardest fighter in freshwater.' },
    { id: 'walleye',          name: 'Walleye',           emoji: '🐡', rarity: 'uncommon', weightMin: 1.5, weightMax: 10.0, flavor: 'Ghost of the deep. Marble-eyed predator.' },
    { id: 'channel_catfish',  name: 'Channel Catfish',   emoji: '🦑', rarity: 'uncommon', weightMin: 2.0, weightMax: 12.0, flavor: 'Bottom feeder. No shame in that game.' },
    { id: 'carp',             name: 'Carp',              emoji: '🐚', rarity: 'uncommon', weightMin: 3.0, weightMax: 15.0, flavor: 'Underrated. Fights like a freight train.' },
  ],
  rare: [
    { id: 'rainbow_trout', name: 'Rainbow Trout', emoji: '🌈', rarity: 'rare', weightMin: 5.0,  weightMax: 20.0, flavor: 'A streak of color in cold water. Breathtaking.' },
    { id: 'striped_bass',  name: 'Striped Bass',  emoji: '🐠', rarity: 'rare', weightMin: 8.0,  weightMax: 25.0, flavor: 'The silver king of rivers. A serious trophy.' },
    { id: 'northern_pike', name: 'Northern Pike', emoji: '⚡', rarity: 'rare', weightMin: 5.0,  weightMax: 22.0, flavor: 'Ambush predator. Strikes like lightning.' },
    { id: 'muskie',        name: 'Muskie',        emoji: '🦈', rarity: 'rare', weightMin: 10.0, weightMax: 30.0, flavor: 'The fish of ten thousand casts.' },
  ],
  epic: [
    { id: 'trophy_bass',    name: 'Trophy Bass',    emoji: '🏆', rarity: 'epic', weightMin: 20.0, weightMax: 45.0, flavor: 'Wall-worthy. You\'ll be telling this story for years.' },
    { id: 'giant_catfish',  name: 'Giant Catfish',  emoji: '🐊', rarity: 'epic', weightMin: 25.0, weightMax: 60.0, flavor: 'Ancient bottom dweller. Older than your grandpa.' },
    { id: 'tiger_muskie',   name: 'Tiger Muskie',   emoji: '🐯', rarity: 'epic', weightMin: 18.0, weightMax: 50.0, flavor: 'Hybrid predator. Rare and ravenous.' },
    { id: 'alligator_gar',  name: 'Alligator Gar',  emoji: '🐊', rarity: 'epic', weightMin: 30.0, weightMax: 60.0, flavor: 'Living fossil. Over 100 million years in the making.' },
  ],
  legendary: [
    { id: 'golden_trout',     name: 'Golden Trout',     emoji: '🌟', rarity: 'legendary', weightMin: 50.0,  weightMax: 120.0, flavor: 'A fish of pure legend. Anglers spend lifetimes chasing this ghost.' },
    { id: 'ancient_sturgeon', name: 'Ancient Sturgeon', emoji: '🦕', rarity: 'legendary', weightMin: 80.0,  weightMax: 180.0, flavor: 'Prehistoric. It was here before humans were. Show some respect.' },
    { id: 'albino_catfish',   name: 'Albino Catfish',   emoji: '👻', rarity: 'legendary', weightMin: 60.0,  weightMax: 140.0, flavor: 'White as bone. Eyes like rubies. Zero people will believe you.' },
    { id: 'buzzard_monster',  name: 'The Buzzard Monster', emoji: '🦅', rarity: 'legendary', weightMin: 100.0, weightMax: 200.0, flavor: 'The one the locals whisper about. Caught only once. Now twice.' },
  ],
};

// Flat array of all fish, useful for validation
export const ALL_FISH = Object.values(FISH_DATABASE).flat();

// Look up a fish by id
export function getFishById(id) {
  return ALL_FISH.find(f => f.id === id) ?? null;
}
```

- [ ] **Step 4.2 — Create src/data/gameData.js**

```js
// src/data/gameData.js
// Display data for spots, lures, cast styles, and mock leaderboard.
// IDs must match the keys in src/config/gameConfig.js modifiers.

export const SPOTS = [
  { id: 'dock',       name: 'Dock',         emoji: '🪵', description: 'Calm waters, reliable bites. Good for beginners.' },
  { id: 'reeds',      name: 'Reeds',        emoji: '🌿', description: 'Bass love to lurk in the thick grass.' },
  { id: 'fallenTree', name: 'Fallen Tree',  emoji: '🌲', description: 'Trophy fish hide in the shadowy structure.' },
  { id: 'deepWater',  name: 'Deep Water',   emoji: '🌊', description: 'Monsters dwell where the light doesn\'t reach.' },
  { id: 'rockyBank',  name: 'Rocky Bank',   emoji: '🪨', description: 'Strong current. Strong fish.' },
];

export const LURES = [
  { id: 'worm',        name: 'Worm',         emoji: '🪱', description: 'Classic and reliable. Never lets you down.' },
  { id: 'spinner',     name: 'Spinner',      emoji: '✨', description: 'Flash and vibration attract mid-range fish.' },
  { id: 'frog',        name: 'Frog',         emoji: '🐸', description: 'Topwater action. Big fish love big targets.' },
  { id: 'jig',         name: 'Jig',          emoji: '🎣', description: 'Versatile. Works in any depth, any season.' },
  { id: 'mysteryLure', name: 'Mystery Lure', emoji: '❓', description: 'Nobody knows what this is. High risk, high reward.' },
];

export const CAST_STYLES = [
  { id: 'safeCast',      name: 'Safe Cast',      emoji: '🛡', description: 'Controlled, reliable placement.', riskLevel: 'safe',      riskLabel: 'Safe' },
  { id: 'precisionCast', name: 'Precision Cast', emoji: '🎯', description: 'Drop it right in the strike zone.', riskLevel: 'precision', riskLabel: 'Precision' },
  { id: 'powerCast',     name: 'Power Cast',     emoji: '💪', description: 'Distance plus depth.',             riskLevel: 'power',     riskLabel: 'Power' },
  { id: 'riskyCast',     name: 'Risky Cast',     emoji: '⚡', description: 'Legendary risk. Legendary reward.',  riskLevel: 'risky',     riskLabel: 'High Risk' },
];

export const MOCK_LEADERBOARD = [
  { rank: 1,  name: 'CastingKing_Ray',  fish: 'Golden Trout',      rarity: 'legendary', points: 2150, streak: 24 },
  { rank: 2,  name: 'LakeBoss_Donna',   fish: 'Trophy Bass',        rarity: 'epic',      points: 1820, streak: 12 },
  { rank: 3,  name: 'ReelDeal_Chris',   fish: 'Tiger Muskie',       rarity: 'epic',      points: 1650, streak: 8  },
  { rank: 4,  name: 'WormWrangler99',   fish: 'Rainbow Trout',      rarity: 'rare',      points: 1420, streak: 15 },
  { rank: 5,  name: 'DockMaster_Sue',   fish: 'Northern Pike',      rarity: 'rare',      points: 1380, streak: 6  },
  { rank: 6,  name: 'FrogFan_Pete',     fish: 'Walleye',            rarity: 'uncommon',  points: 1180, streak: 19 },
  { rank: 7,  name: 'SpinnerStar_Jax',  fish: 'Largemouth Bass',    rarity: 'uncommon',  points: 1050, streak: 3  },
  { rank: 8,  name: 'QuietWaters_Mo',   fish: 'Channel Catfish',    rarity: 'uncommon',  points:  890, streak: 7  },
  { rank: 9,  name: 'EarlyBird_Kim',    fish: 'Yellow Perch',       rarity: 'common',    points:  720, streak: 31 },
  { rank: 10, name: 'PaddleBoat_Alex',  fish: 'Bluegill',           rarity: 'common',    points:  650, streak: 5  },
];
```

- [ ] **Step 4.3 — Commit**

```bash
git add src/data/
git commit -m "feat: add fish database and game data (spots, lures, cast styles)"
```

---

### Task 5: Game Logic + Tests

**Files:**
- Create: `src/utils/gameLogic.js`
- Create: `src/utils/__tests__/gameLogic.test.js`

- [ ] **Step 5.1 — Create src/utils/gameLogic.js**

```js
// src/utils/gameLogic.js
import {
  RARITIES, BASE_WEIGHTS, SPOT_MODIFIERS, LURE_MODIFIERS,
  CAST_MODIFIERS, POINTS_RANGES, COUPON_RULES,
} from '../config/gameConfig.js';
import { FISH_DATABASE } from '../data/fishData.js';

/**
 * Compute effective rarity weights given the player's three choices.
 * Each tier starts at BASE_WEIGHTS, gets modifiers added, then clamped to min 1.
 * Returns raw (un-normalized) weights object.
 */
export function computeWeights(spotId, lureId, castStyleId) {
  const spotMod = SPOT_MODIFIERS[spotId]  ?? {};
  const lureMod = LURE_MODIFIERS[lureId]  ?? {};
  const castMod = CAST_MODIFIERS[castStyleId] ?? {};

  const weights = {};
  for (const rarity of RARITIES) {
    const raw =
      (BASE_WEIGHTS[rarity]  ?? 0) +
      (spotMod[rarity]       ?? 0) +
      (lureMod[rarity]       ?? 0) +
      (castMod[rarity]       ?? 0);
    weights[rarity] = Math.max(1, raw);
  }
  return weights;
}

/**
 * Weighted random rarity selection.
 * @param {Record<string,number>} weights — un-normalized weights object
 * @returns {string} rarity string
 */
export function rollRarity(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const rarity of RARITIES) {
    roll -= weights[rarity];
    if (roll <= 0) return rarity;
  }
  return 'common'; // fallback (floating point edge case)
}

/** Pick a random fish from the given rarity tier. */
export function pickFish(rarity) {
  const pool = FISH_DATABASE[rarity] ?? FISH_DATABASE.common;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Calculate points for a given rarity. */
export function calcPoints(rarity) {
  const { base, variance } = POINTS_RANGES[rarity] ?? POINTS_RANGES.common;
  return base + Math.floor(Math.random() * variance);
}

/** Calculate catch weight within the fish's weight range. */
export function calcWeight(fish) {
  const raw = fish.weightMin + Math.random() * (fish.weightMax - fish.weightMin);
  return Math.round(raw * 10) / 10;
}

/**
 * Generate a display coupon code for the given rarity.
 *
 * SHOPIFY: Replace this function body in V2 with a call to your backend:
 *   POST /api/generate-coupon { rarity, playerId }
 * which calls Shopify Admin API:
 *   POST /admin/api/2024-01/price_rules/{id}/discount_codes.json
 * and returns the real single-use code.
 */
export function generateCouponCode(rarity) {
  const suffix = Date.now().toString(36).toUpperCase();
  return `BUZZARD-${rarity.toUpperCase()}-${suffix}`;
}

/**
 * Master function: runs the full rarity roll and builds a result object.
 * The result is unsigned — call integrity.addSignature() before saving.
 */
export function buildResult(spotId, lureId, castStyleId) {
  const weights = computeWeights(spotId, lureId, castStyleId);
  const rarity  = rollRarity(weights);
  const fish    = pickFish(rarity);
  const points  = calcPoints(rarity);
  const weight  = calcWeight(fish);
  const code    = generateCouponCode(rarity);
  const today   = new Date().toISOString().split('T')[0];

  return {
    date:     today,
    fishId:   fish.id,
    fishName: fish.name,
    emoji:    fish.emoji,
    rarity,
    weight,
    points,
    flavor:   fish.flavor,
    coupon: {
      code,
      label:    COUPON_RULES[rarity].label,
      discount: COUPON_RULES[rarity].discount,
    },
    spot:      spotId,
    lure:      lureId,
    castStyle: castStyleId,
  };
}
```

- [ ] **Step 5.2 — Create test file (write failing tests first)**

Create `src/utils/__tests__/gameLogic.test.js`:

```js
// src/utils/__tests__/gameLogic.test.js
import { describe, it, expect, vi } from 'vitest';
import {
  computeWeights, rollRarity, pickFish,
  calcPoints, calcWeight, buildResult,
} from '../gameLogic.js';
import { RARITIES, POINTS_RANGES } from '../../config/gameConfig.js';
import { FISH_DATABASE, ALL_FISH } from '../../data/fishData.js';

describe('computeWeights', () => {
  it('returns a weight for every rarity', () => {
    const w = computeWeights('dock', 'worm', 'safeCast');
    expect(Object.keys(w)).toEqual(RARITIES);
  });

  it('all weights are at least 1', () => {
    const w = computeWeights('deepWater', 'mysteryLure', 'riskyCast');
    for (const r of RARITIES) expect(w[r]).toBeGreaterThanOrEqual(1);
  });

  it('safe combo weights common higher than legendary', () => {
    const w = computeWeights('dock', 'worm', 'safeCast');
    expect(w.common).toBeGreaterThan(w.legendary);
  });

  it('risky combo weights legendary higher than common', () => {
    const w = computeWeights('deepWater', 'mysteryLure', 'riskyCast');
    expect(w.legendary).toBeGreaterThan(w.common);
  });

  it('handles unknown ids gracefully (uses base weights)', () => {
    const w = computeWeights('unknown', 'unknown', 'unknown');
    for (const r of RARITIES) expect(w[r]).toBeGreaterThanOrEqual(1);
  });
});

describe('rollRarity', () => {
  it('returns a valid rarity string', () => {
    const w = computeWeights('dock', 'worm', 'safeCast');
    const result = rollRarity(w);
    expect(RARITIES).toContain(result);
  });

  it('returns common most often with safe combo (statistical)', () => {
    const w = computeWeights('dock', 'worm', 'safeCast');
    const counts = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    for (let i = 0; i < 1000; i++) counts[rollRarity(w)]++;
    expect(counts.common).toBeGreaterThan(counts.legendary * 10);
  });

  it('works with single-rarity weights (edge case)', () => {
    const w = { common: 100, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    // All weights 0 are valid here; rollRarity should still return something
    const result = rollRarity(w);
    expect(RARITIES).toContain(result);
  });
});

describe('pickFish', () => {
  it('returns a fish from the correct rarity pool', () => {
    for (const rarity of RARITIES) {
      const fish = pickFish(rarity);
      expect(fish.rarity).toBe(rarity);
    }
  });

  it('returned fish has required fields', () => {
    const fish = pickFish('common');
    expect(fish).toHaveProperty('id');
    expect(fish).toHaveProperty('name');
    expect(fish).toHaveProperty('emoji');
    expect(fish).toHaveProperty('weightMin');
    expect(fish).toHaveProperty('weightMax');
    expect(fish).toHaveProperty('flavor');
  });
});

describe('calcPoints', () => {
  it('returns points within the configured range for each rarity', () => {
    for (const rarity of RARITIES) {
      const { base, variance } = POINTS_RANGES[rarity];
      for (let i = 0; i < 50; i++) {
        const pts = calcPoints(rarity);
        expect(pts).toBeGreaterThanOrEqual(base);
        expect(pts).toBeLessThanOrEqual(base + variance);
      }
    }
  });
});

describe('calcWeight', () => {
  it('returns weight within fish min/max range', () => {
    for (const fish of ALL_FISH) {
      for (let i = 0; i < 10; i++) {
        const w = calcWeight(fish);
        expect(w).toBeGreaterThanOrEqual(fish.weightMin);
        expect(w).toBeLessThanOrEqual(fish.weightMax + 0.05); // floating point buffer
      }
    }
  });

  it('returns weight rounded to 1 decimal place', () => {
    const fish = FISH_DATABASE.common[0];
    const w = calcWeight(fish);
    expect(w).toBe(Math.round(w * 10) / 10);
  });
});

describe('buildResult', () => {
  it('returns a result with all required fields', () => {
    const result = buildResult('dock', 'worm', 'safeCast');
    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('fishId');
    expect(result).toHaveProperty('fishName');
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('rarity');
    expect(result).toHaveProperty('weight');
    expect(result).toHaveProperty('points');
    expect(result).toHaveProperty('flavor');
    expect(result).toHaveProperty('coupon.code');
    expect(result).toHaveProperty('coupon.label');
    expect(result).toHaveProperty('coupon.discount');
  });

  it('date is today in YYYY-MM-DD format', () => {
    const result = buildResult('dock', 'worm', 'safeCast');
    const today = new Date().toISOString().split('T')[0];
    expect(result.date).toBe(today);
  });

  it('fishId exists in the fish database', () => {
    const result = buildResult('deepWater', 'mysteryLure', 'riskyCast');
    const found = ALL_FISH.find(f => f.id === result.fishId);
    expect(found).toBeDefined();
  });

  it('coupon code starts with BUZZARD-', () => {
    const result = buildResult('dock', 'worm', 'safeCast');
    expect(result.coupon.code).toMatch(/^BUZZARD-/);
  });
});
```

- [ ] **Step 5.3 — Run tests (expect FAIL — gameLogic.js not written yet... wait, it was)**

```bash
npm test
```

Expected: All tests in `gameLogic.test.js` **PASS**. If any fail, check that `src/utils/gameLogic.js` was saved correctly.

- [ ] **Step 5.4 — Commit**

```bash
git add src/utils/
git commit -m "feat: add game logic with weighted rarity roll + full test suite"
```
# Buzzard Roost Daily Cast — Implementation Plan (Part 2: Tasks 6–10)

---

### Task 6: Integrity System + Tests

**Files:**
- Create: `src/utils/integrity.js`
- Create: `src/utils/__tests__/integrity.test.js`

- [ ] **Step 6.1 — Create src/utils/integrity.js**

```js
// src/utils/integrity.js
// Client-side result signing to detect casual localStorage tampering.
//
// INTEGRITY V2: Replace this entire module with server-side validation.
// The server runs buildResult(), returns a signed JWT. The client stores
// the token; Supabase re-validates it before inserting to the DB.
// Client-side signing is removed entirely in V2.

import { RARITIES, POINTS_RANGES } from '../config/gameConfig.js';
import { getFishById } from '../data/fishData.js';

const SALT = 'BuzzardRoost_v1_cast';

/**
 * Generate a signature string from the immutable fields of a result.
 * The sig field itself is NOT included in the payload.
 */
export function signResult(result) {
  const payload = [
    result.date,
    result.fishId,
    result.rarity,
    String(result.points),
    String(result.weight),
  ].join('|');
  return btoa(payload + SALT).replace(/=/g, '');
}

/** Return a new result object with the sig field added. */
export function addSignature(result) {
  // Strip any existing sig before signing to ensure consistency
  const { sig: _ignored, ...unsigned } = result;
  return { ...unsigned, sig: signResult(unsigned) };
}

/**
 * Verify a stored result hasn't been tampered with.
 * Returns true only if ALL checks pass.
 * On any failure the caller should discard the result and allow a re-play.
 */
export function verifyResult(result) {
  if (!result || typeof result !== 'object') return false;

  // 1. Signature check
  if (!result.sig) return false;
  const { sig, ...unsigned } = result;
  if (sig !== signResult(unsigned)) return false;

  // 2. Rarity must be one of the five valid strings
  if (!RARITIES.includes(result.rarity)) return false;

  // 3. Date must not be in the future
  const resultDate = new Date(result.date + 'T00:00:00');
  const tomorrow   = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  if (resultDate >= tomorrow) return false;

  // 4. Points within valid range for rarity
  const range = POINTS_RANGES[result.rarity];
  if (!range) return false;
  if (result.points < range.base || result.points > range.base + range.variance) return false;

  // 5. fishId must exist in the database and match the stored rarity
  const fish = getFishById(result.fishId);
  if (!fish) return false;
  if (fish.rarity !== result.rarity) return false;

  // 6. Weight within fish's valid range (allow ±0.05 for float rounding)
  if (result.weight < fish.weightMin - 0.05 || result.weight > fish.weightMax + 0.05) return false;

  return true;
}
```

- [ ] **Step 6.2 — Create src/utils/__tests__/integrity.test.js**

```js
// src/utils/__tests__/integrity.test.js
import { describe, it, expect } from 'vitest';
import { signResult, addSignature, verifyResult } from '../integrity.js';
import { buildResult } from '../gameLogic.js';

function makeValidResult() {
  const r = buildResult('dock', 'worm', 'safeCast');
  return addSignature(r);
}

describe('signResult', () => {
  it('returns a non-empty string', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    expect(signResult(r)).toBeTruthy();
    expect(typeof signResult(r)).toBe('string');
  });

  it('is deterministic for the same input', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    expect(signResult(r)).toBe(signResult(r));
  });

  it('changes when any field changes', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const sig1 = signResult(r);
    const sig2 = signResult({ ...r, points: r.points + 1 });
    expect(sig1).not.toBe(sig2);
  });
});

describe('addSignature', () => {
  it('adds a sig field', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed = addSignature(r);
    expect(signed).toHaveProperty('sig');
  });

  it('sig equals signResult of the unsigned fields', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed = addSignature(r);
    const { sig, ...unsigned } = signed;
    expect(sig).toBe(signResult(unsigned));
  });

  it('is idempotent — re-signing a signed result gives the same sig', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed1 = addSignature(r);
    const signed2 = addSignature(signed1);
    expect(signed1.sig).toBe(signed2.sig);
  });
});

describe('verifyResult', () => {
  it('passes a freshly signed valid result', () => {
    expect(verifyResult(makeValidResult())).toBe(true);
  });

  it('fails when sig is missing', () => {
    const r = makeValidResult();
    delete r.sig;
    expect(verifyResult(r)).toBe(false);
  });

  it('fails when points is tampered up', () => {
    const r = makeValidResult();
    r.points = 999999;
    expect(verifyResult(r)).toBe(false);
  });

  it('fails when rarity is changed to an invalid string', () => {
    const r = makeValidResult();
    r.rarity = 'godlike';
    expect(verifyResult(r)).toBe(false);
  });

  it('fails when fishId does not exist', () => {
    const r = makeValidResult();
    r.fishId = 'fake_fish_xyz';
    expect(verifyResult(r)).toBe(false);
  });

  it('fails when date is in the future', () => {
    const r = makeValidResult();
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    r.date = future.toISOString().split('T')[0];
    // Re-sign with future date so sig check passes, then date check fails
    const { sig: _old, ...unsigned } = r;
    const resigned = addSignature(unsigned);
    expect(verifyResult(resigned)).toBe(false);
  });

  it('fails when weight is above fish max', () => {
    const r = makeValidResult();
    r.weight = 99999;
    expect(verifyResult(r)).toBe(false);
  });

  it('returns false for null/undefined/non-object', () => {
    expect(verifyResult(null)).toBe(false);
    expect(verifyResult(undefined)).toBe(false);
    expect(verifyResult('string')).toBe(false);
  });
});
```

- [ ] **Step 6.3 — Run tests**

```bash
npm test
```

Expected: All integrity tests **PASS**.

- [ ] **Step 6.4 — Commit**

```bash
git add src/utils/integrity.js src/utils/__tests__/integrity.test.js
git commit -m "feat: add integrity signing + tamper detection with tests"
```

---

### Task 7: Storage Manager + Tests

**Files:**
- Create: `src/utils/storageManager.js`
- Create: `src/utils/__tests__/storageManager.test.js`

- [ ] **Step 7.1 — Create src/utils/storageManager.js**

```js
// src/utils/storageManager.js
import { addSignature, verifyResult } from './integrity.js';

// ── Storage keys (all namespaced with br_ to avoid collisions) ──
export const KEYS = {
  todayCatch:   'br_todayCatch',
  lastPlayDate: 'br_lastPlayDate',
  streak:       'br_streak',
  bestCatch:    'br_bestCatch',
  totalPoints:  'br_totalPoints',
  catchHistory: 'br_catchHistory',
  playerId:     'br_playerId',
  badges:       'br_badges',
};

const HISTORY_MAX = 30;

export const BADGE_DEFS = {
  first_cast: { emoji: '🎣', label: 'First Cast'        },
  on_fire:    { emoji: '🔥', label: 'On Fire'            },
  dedicated:  { emoji: '💎', label: 'Dedicated Angler'   },
  legend:     { emoji: '👑', label: 'Legend'             },
  first_rare: { emoji: '⭐', label: 'First Rare+'        },
  top_10:     { emoji: '🏆', label: 'Top 10'             },
  monster:    { emoji: '🦈', label: 'Monster Hunter'     },
};

// ── Helpers ────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ── Player ID ──────────────────────────────────────────────────
export function getPlayerId() {
  let id = localStorage.getItem(KEYS.playerId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.playerId, id);
  }
  return id;
}

// ── Daily play guard ───────────────────────────────────────────
export function hasPlayedToday() {
  return localStorage.getItem(KEYS.lastPlayDate) === todayStr();
}

// ── Load today's result (validates integrity on load) ─────────
export function loadTodayResult() {
  const raw = localStorage.getItem(KEYS.todayCatch);
  if (!raw) return null;
  try {
    const result = JSON.parse(raw);
    if (!verifyResult(result)) {
      // Tampered or corrupted — clear and allow re-play
      localStorage.removeItem(KEYS.todayCatch);
      localStorage.removeItem(KEYS.lastPlayDate);
      return null;
    }
    return result;
  } catch {
    localStorage.removeItem(KEYS.todayCatch);
    localStorage.removeItem(KEYS.lastPlayDate);
    return null;
  }
}

// ── Streak ────────────────────────────────────────────────────
export function getStreak() {
  const raw = localStorage.getItem(KEYS.streak);
  return raw ? JSON.parse(raw) : { count: 0, lastDate: null };
}

export function updateStreak() {
  const streak    = getStreak();
  const today     = todayStr();
  const yesterday = yesterdayStr();

  if (streak.lastDate === today)      { /* same day — no-op */ }
  else if (streak.lastDate === yesterday) { streak.count += 1; }
  else                                     { streak.count = 1; }

  streak.lastDate = today;
  localStorage.setItem(KEYS.streak, JSON.stringify(streak));
  return streak;
}

// ── Badges ────────────────────────────────────────────────────
export function getBadges() {
  const raw    = localStorage.getItem(KEYS.badges);
  const earned = raw ? JSON.parse(raw) : [];
  return earned.map(id => ({ id, ...(BADGE_DEFS[id] ?? {}) })).filter(b => b.emoji);
}

/**
 * Check which new badges are unlocked and persist the updated list.
 * Call BEFORE saveResult() so the first_cast check works correctly.
 * Returns { earnedIds: string[], newBadges: { id, emoji, label }[] }
 */
export function checkAndUnlockBadges(result, streak) {
  const raw    = localStorage.getItem(KEYS.badges);
  const earned = raw ? JSON.parse(raw) : [];
  const newBadges = [];

  const unlock = (id) => {
    if (!earned.includes(id)) {
      earned.push(id);
      newBadges.push({ id, ...BADGE_DEFS[id] });
    }
  };

  // First cast ever (history not yet written)
  if (!localStorage.getItem(KEYS.catchHistory)) unlock('first_cast');

  // Streak milestones
  if (streak.count >= 7)   unlock('on_fire');
  if (streak.count >= 30)  unlock('dedicated');
  if (streak.count >= 100) unlock('legend');

  // Rarity-based
  if (['rare', 'epic', 'legendary'].includes(result.rarity)) unlock('first_rare');
  if (result.rarity === 'legendary')                          unlock('monster');

  localStorage.setItem(KEYS.badges, JSON.stringify(earned));
  return { earnedIds: earned, newBadges };
}

// ── Save result ───────────────────────────────────────────────
export function saveResult(result) {
  const signed = addSignature(result);
  const today  = todayStr();

  localStorage.setItem(KEYS.todayCatch,   JSON.stringify(signed));
  localStorage.setItem(KEYS.lastPlayDate, today);

  // Accumulate total points
  const prev = parseInt(localStorage.getItem(KEYS.totalPoints) ?? '0', 10);
  localStorage.setItem(KEYS.totalPoints, String(prev + result.points));

  // Update best catch
  const bestRaw = localStorage.getItem(KEYS.bestCatch);
  const best    = bestRaw ? JSON.parse(bestRaw) : null;
  if (!best || result.points > best.points) {
    localStorage.setItem(KEYS.bestCatch, JSON.stringify({
      fishName: result.fishName,
      rarity:   result.rarity,
      points:   result.points,
      date:     result.date,
    }));
  }

  // Prepend to history, cap at HISTORY_MAX
  const histRaw = localStorage.getItem(KEYS.catchHistory);
  const history = histRaw ? JSON.parse(histRaw) : [];
  history.unshift({ date: result.date, fishName: result.fishName, rarity: result.rarity, points: result.points });
  if (history.length > HISTORY_MAX) history.splice(HISTORY_MAX);
  localStorage.setItem(KEYS.catchHistory, JSON.stringify(history));

  // SUPABASE: save result to database
  // In V2, add here:
  //   await supabase.from('catches').insert({ player_id: getPlayerId(), ...result })

  return signed;
}

// ── Load all player data (used on app mount) ──────────────────
export function loadPlayerData() {
  return {
    playerId:    getPlayerId(),
    streak:      getStreak(),
    bestCatch:   (() => { const r = localStorage.getItem(KEYS.bestCatch); return r ? JSON.parse(r) : null; })(),
    totalPoints: parseInt(localStorage.getItem(KEYS.totalPoints) ?? '0', 10),
    badges:      getBadges(),
  };
}

// AUTH V2: link playerId to a real user account.
// Replace getPlayerId() with: supabase.auth.getUser() or Shopify customer ID.
```

- [ ] **Step 7.2 — Create src/utils/__tests__/storageManager.test.js**

```js
// src/utils/__tests__/storageManager.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import {
  hasPlayedToday, loadTodayResult, getStreak, updateStreak,
  checkAndUnlockBadges, saveResult, getBadges, loadPlayerData, KEYS,
} from '../storageManager.js';
import { buildResult } from '../gameLogic.js';
import { addSignature } from '../integrity.js';

beforeEach(() => localStorage.clear());

const today     = new Date().toISOString().split('T')[0];
const yesterday = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split('T')[0]; })();

describe('hasPlayedToday', () => {
  it('returns false on fresh storage', () => {
    expect(hasPlayedToday()).toBe(false);
  });

  it('returns true after saving lastPlayDate as today', () => {
    localStorage.setItem(KEYS.lastPlayDate, today);
    expect(hasPlayedToday()).toBe(true);
  });

  it('returns false when lastPlayDate is yesterday', () => {
    localStorage.setItem(KEYS.lastPlayDate, yesterday);
    expect(hasPlayedToday()).toBe(false);
  });
});

describe('loadTodayResult', () => {
  it('returns null when nothing stored', () => {
    expect(loadTodayResult()).toBeNull();
  });

  it('returns null and clears storage if result is tampered', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed = addSignature(r);
    signed.points = 999999; // tamper
    localStorage.setItem(KEYS.todayCatch, JSON.stringify(signed));
    expect(loadTodayResult()).toBeNull();
    expect(localStorage.getItem(KEYS.todayCatch)).toBeNull();
  });

  it('returns the result if valid and signed', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed = addSignature(r);
    localStorage.setItem(KEYS.todayCatch, JSON.stringify(signed));
    expect(loadTodayResult()).not.toBeNull();
  });
});

describe('streak', () => {
  it('starts at 0', () => {
    expect(getStreak().count).toBe(0);
  });

  it('first call sets streak to 1', () => {
    const s = updateStreak();
    expect(s.count).toBe(1);
  });

  it('calling twice same day keeps count at 1', () => {
    updateStreak();
    const s = updateStreak();
    expect(s.count).toBe(1);
  });

  it('increments when lastDate was yesterday', () => {
    localStorage.setItem(KEYS.streak, JSON.stringify({ count: 5, lastDate: yesterday }));
    const s = updateStreak();
    expect(s.count).toBe(6);
  });

  it('resets to 1 when lastDate was more than 1 day ago', () => {
    localStorage.setItem(KEYS.streak, JSON.stringify({ count: 20, lastDate: '2020-01-01' }));
    const s = updateStreak();
    expect(s.count).toBe(1);
  });
});

describe('checkAndUnlockBadges', () => {
  it('unlocks first_cast badge when no history exists', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const { newBadges } = checkAndUnlockBadges(r, { count: 1, lastDate: today });
    expect(newBadges.map(b => b.id)).toContain('first_cast');
  });

  it('does not re-unlock first_cast on second play', () => {
    localStorage.setItem(KEYS.catchHistory, JSON.stringify([{ date: yesterday }]));
    const r = buildResult('dock', 'worm', 'safeCast');
    const { newBadges } = checkAndUnlockBadges(r, { count: 2, lastDate: today });
    expect(newBadges.map(b => b.id)).not.toContain('first_cast');
  });

  it('unlocks on_fire at 7-day streak', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const { newBadges } = checkAndUnlockBadges(r, { count: 7, lastDate: today });
    expect(newBadges.map(b => b.id)).toContain('on_fire');
  });

  it('unlocks monster badge for legendary catch', () => {
    // Force a legendary result by direct construction
    const r = { ...buildResult('dock', 'worm', 'safeCast'), rarity: 'legendary', fishId: 'golden_trout', fishName: 'Golden Trout' };
    const { newBadges } = checkAndUnlockBadges(r, { count: 1, lastDate: today });
    expect(newBadges.map(b => b.id)).toContain('monster');
  });

  it('does not duplicate badges already earned', () => {
    localStorage.setItem(KEYS.badges, JSON.stringify(['on_fire']));
    const r = buildResult('dock', 'worm', 'safeCast');
    const { newBadges } = checkAndUnlockBadges(r, { count: 7, lastDate: today });
    expect(newBadges.map(b => b.id)).not.toContain('on_fire');
  });
});

describe('saveResult', () => {
  it('persists todayCatch and lastPlayDate', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    saveResult(r);
    expect(localStorage.getItem(KEYS.lastPlayDate)).toBe(today);
    expect(localStorage.getItem(KEYS.todayCatch)).toBeTruthy();
  });

  it('accumulates totalPoints across multiple saves', () => {
    const r1 = buildResult('dock', 'worm', 'safeCast');
    const r2 = buildResult('dock', 'worm', 'safeCast');
    saveResult(r1);
    saveResult(r2);
    const total = parseInt(localStorage.getItem(KEYS.totalPoints), 10);
    expect(total).toBe(r1.points + r2.points);
  });

  it('caps catchHistory at 30 entries', () => {
    for (let i = 0; i < 35; i++) {
      saveResult(buildResult('dock', 'worm', 'safeCast'));
    }
    const history = JSON.parse(localStorage.getItem(KEYS.catchHistory));
    expect(history.length).toBe(30);
  });
});
```

- [ ] **Step 7.3 — Run all tests**

```bash
npm test
```

Expected: All tests across all three test files **PASS**.

- [ ] **Step 7.4 — Commit**

```bash
git add src/utils/
git commit -m "feat: add storage manager with streak, badges, history + tests"
```

---

### Task 8: App Shell

**Files:**
- Modify: `src/App.jsx` (create)

- [ ] **Step 8.1 — Create src/App.jsx**

```jsx
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

    if (hasPlayedToday()) {
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
    setTimeout(() => setPhase('animation'), 300);
  }

  // ── Cast complete: build result, save, update state ──────
  function handleCastComplete() {
    const builtResult = buildResult(spot, lure, castStyle);
    const streak      = updateStreak();
    const { newBadges: fresh } = checkAndUnlockBadges(builtResult, streak);
    saveResult(builtResult);
    setResult(builtResult);
    setNewBadges(fresh);
    setPlayerData(loadPlayerData());
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
```

- [ ] **Step 8.2 — Verify dev server renders without errors**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: page loads without crashing (components not yet created will show import errors — that's expected and will be fixed in Tasks 9–15). Check the console is clean of syntax errors.

- [ ] **Step 8.3 — Commit**

```bash
git add src/App.jsx
git commit -m "feat: add App phase state machine with challenge URL support"
```

---

### Task 9: Header Component

**Files:**
- Create: `src/components/Header.jsx`
- Create: `src/components/Header.css`

- [ ] **Step 9.1 — Create src/components/Header.jsx**

```jsx
// src/components/Header.jsx
import './Header.css';
import { streakEmoji } from '../config/gameConfig.js';

export default function Header({ playerData }) {
  const streak = playerData?.streak?.count ?? 0;
  const emoji  = streakEmoji(streak);
  const showStreak = streak >= 7; // only show milestone streaks in header

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__eagle" aria-hidden="true">🦅</span>
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

- [ ] **Step 9.2 — Create src/components/Header.css**

```css
/* src/components/Header.css */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  background: linear-gradient(180deg, rgba(6,12,24,0.9) 0%, transparent 100%);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header__eagle { font-size: 1.6rem; }

.header__text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.header__name {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--brand-accent);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.header__sub {
  font-size: 0.6rem;
  color: var(--text-muted);
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

.header__streak {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: 5px 14px;
  border-radius: var(--radius-full);
  background: rgba(244,196,48,0.1);
  border: 1px solid rgba(244,196,48,0.3);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--brand-accent);
}

.header__streak-count { font-size: 1.1rem; }
```

- [ ] **Step 9.3 — Commit**

```bash
git add src/components/Header.jsx src/components/Header.css
git commit -m "feat: add Header with brand and streak display"
```

---

### Task 10: Landing Screen

**Files:**
- Create: `src/components/LandingScreen.jsx`
- Create: `src/components/LandingScreen.css`

- [ ] **Step 10.1 — Create src/components/LandingScreen.jsx**

```jsx
// src/components/LandingScreen.jsx
import './LandingScreen.css';
import { MOCK_LEADERBOARD } from '../data/gameData.js';
import { streakEmoji } from '../config/gameConfig.js';

export default function LandingScreen({ playerData, challengeData, onStart }) {
  const streak   = playerData?.streak?.count ?? 0;
  const topCatch = MOCK_LEADERBOARD[0];

  return (
    <div className="landing">
      {/* Friend challenge banner */}
      {challengeData && (
        <div className="landing__challenge">
          🎯 A friend hooked a <strong className={`landing__challenge-rarity landing__challenge-rarity--${challengeData.rarity}`}>{challengeData.rarity}</strong> catch
          for <strong>{challengeData.points.toLocaleString()} pts</strong>. Can you top them?
        </div>
      )}

      {/* Animated night-fishing scene */}
      <div className="landing__scene" aria-hidden="true">
        <div className="landing__sky">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="landing__star"
              style={{ '--delay': `${(i * 0.37).toFixed(2)}s`, '--x': `${(i * 7.3) % 100}%`, '--y': `${(i * 5.1) % 55}%` }}
            />
          ))}
          <div className="landing__moon" />
        </div>
        <div className="landing__water">
          <div className="landing__wave" />
          <div className="landing__wave landing__wave--2" />
          <div className="landing__bobber">
            <div className="landing__bobber-top" />
            <div className="landing__bobber-bottom" />
          </div>
          <div className="landing__ripple" />
          <div className="landing__ripple landing__ripple--2" />
        </div>
      </div>

      {/* Brand block */}
      <div className="landing__brand">
        <h1 className="landing__title">🦅 Buzzard Roost</h1>
        <p className="landing__daily">Daily Cast</p>
        <p className="landing__tagline">One cast. One chance. Make it count.</p>
      </div>

      {/* Streak callout */}
      {streak > 0 && (
        <div className="landing__streak">
          {streakEmoji(streak)} {streak}-day streak — don't break it!
        </div>
      )}

      {/* FOMO: today's top catch */}
      <div className="landing__fomo">
        <span className="landing__fomo-label">Today's top catch</span>
        <span className="landing__fomo-catch">
          <span className={`rarity-badge rarity-badge--${topCatch.rarity}`}>{topCatch.rarity}</span>
          {topCatch.fish} · {topCatch.points.toLocaleString()} pts
        </span>
      </div>

      <button className="btn btn--primary btn--large landing__cta" onClick={onStart}>
        🎣 Make Today's Cast
      </button>

      <p className="landing__legal">
        Free to play · New catch available daily at midnight
      </p>
    </div>
  );
}
```

- [ ] **Step 10.2 — Create src/components/LandingScreen.css**

```css
/* src/components/LandingScreen.css */
.landing {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 var(--space-5) var(--space-8);
  gap: var(--space-4);
  animation: fadeIn 0.4s ease;
}

/* ── Challenge banner ─────────────────────────────────── */
.landing__challenge {
  width: 100%;
  margin-top: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: rgba(232,115,42,0.1);
  border: 1px solid rgba(232,115,42,0.4);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.4;
}
.landing__challenge-rarity--legendary { color: var(--rarity-legendary); }
.landing__challenge-rarity--epic      { color: var(--rarity-epic); }
.landing__challenge-rarity--rare      { color: var(--rarity-rare); }
.landing__challenge-rarity--uncommon  { color: var(--rarity-uncommon); }
.landing__challenge-rarity--common    { color: var(--rarity-common); }

/* ── Scene ────────────────────────────────────────────── */
.landing__scene {
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  margin-top: var(--space-2);
}

.landing__sky {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #020814 0%, #0a1628 55%, #0d2040 100%);
}

.landing__star {
  position: absolute;
  left: var(--x); top: var(--y);
  width: 2px; height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle 2.5s ease-in-out var(--delay) infinite;
}

.landing__moon {
  position: absolute;
  top: 14px; right: 22px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #f4e8a0, #d4c060);
  box-shadow: 0 0 18px rgba(244,230,140,0.6);
}

.landing__water {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 70px;
  background: linear-gradient(180deg, #0a2840 0%, #060e18 100%);
  border-top: 1px solid rgba(42,90,140,0.5);
}

.landing__wave {
  position: absolute;
  top: -6px; left: -20px; right: -20px;
  height: 12px;
  background: rgba(42,90,140,0.3);
  border-radius: 50%;
  animation: waterWave 3.5s ease-in-out infinite;
}
.landing__wave--2 {
  top: -3px;
  animation-delay: 1.2s;
  animation-duration: 4.2s;
  opacity: 0.5;
}

.landing__bobber {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px; height: 24px;
  animation: bobberFloat 2s ease-in-out infinite;
}
.landing__bobber-top {
  width: 18px; height: 12px;
  background: #e03030;
  border-radius: 9px 9px 0 0;
}
.landing__bobber-bottom {
  width: 18px; height: 12px;
  background: #f0f0f0;
  border-radius: 0 0 9px 9px;
  border-top: 1px solid rgba(0,0,0,0.2);
}

.landing__ripple {
  position: absolute;
  top: 20px; left: 50%;
  transform: translateX(-50%);
  width: 30px; height: 10px;
  border: 1px solid rgba(42,90,140,0.6);
  border-radius: 50%;
  animation: ripple 2.5s ease-out infinite;
}
.landing__ripple--2 { animation-delay: 1.2s; opacity: 0.6; }

/* ── Brand ────────────────────────────────────────────── */
.landing__brand { text-align: center; }

.landing__title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--brand-accent);
  letter-spacing: 2px;
  text-transform: uppercase;
  line-height: 1;
}

.landing__daily {
  font-family: var(--font-display);
  font-size: 0.75rem;
  letter-spacing: 4px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-top: var(--space-1);
}

.landing__tagline {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-top: var(--space-2);
  font-style: italic;
}

/* ── Streak ───────────────────────────────────────────── */
.landing__streak {
  padding: var(--space-2) var(--space-5);
  background: rgba(244,196,48,0.08);
  border: 1px solid rgba(244,196,48,0.25);
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: 0.9rem;
  color: var(--brand-accent);
  letter-spacing: 0.5px;
}

/* ── FOMO leaderboard teaser ─────────────────────────── */
.landing__fomo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  width: 100%;
  font-size: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}

.landing__fomo-label {
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 1px;
  font-family: var(--font-display);
}

.landing__fomo-catch {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ── CTA + Legal ──────────────────────────────────────── */
.landing__cta { width: 100%; max-width: 320px; }

.landing__legal {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-align: center;
  padding-bottom: var(--space-2);
}
```

- [ ] **Step 10.3 — Smoke-test in browser**

With `npm run dev` running, check that:
- Landing screen renders without JS errors
- Animated bobber is visible and floating
- Stars twinkle
- "Make Today's Cast" button is present

- [ ] **Step 10.4 — Commit**

```bash
git add src/components/LandingScreen.jsx src/components/LandingScreen.css
git commit -m "feat: add landing screen with animated night scene + FOMO teaser"
```
# Buzzard Roost Daily Cast — Implementation Plan (Part 3: Tasks 11–16)

---

### Task 11: Selection Step Component

**Files:**
- Create: `src/components/SelectionStep.jsx`
- Create: `src/components/SelectionStep.css`

- [ ] **Step 11.1 — Create src/components/SelectionStep.jsx**

```jsx
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
```

- [ ] **Step 11.2 — Create src/components/SelectionStep.css**

```css
/* src/components/SelectionStep.css */
.sel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-5);
  gap: var(--space-4);
  animation: fadeIn 0.3s ease;
}

/* ── Step dots ────────────────────────────────────────── */
.sel__dots {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.sel__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--border-card);
  transition: all var(--t-normal);
}
.sel__dot--done   { background: var(--brand-primary); transform: scale(0.8); }
.sel__dot--active { background: var(--brand-accent); transform: scale(1.2); box-shadow: 0 0 8px rgba(244,196,48,0.6); }

/* ── Title ────────────────────────────────────────────── */
.sel__title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

.sel__subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: calc(-1 * var(--space-2));
}

/* ── Options grid ─────────────────────────────────────── */
.sel__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  width: 100%;
}

.sel__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-3);
  background: var(--bg-card-raised);
  border: 2px solid var(--border-card);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--t-fast);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.sel__card:hover {
  border-color: rgba(42,90,140,0.8);
  background: var(--bg-card-hover);
  transform: translateY(-2px);
}

.sel__card--selected {
  border-color: var(--brand-primary);
  background: rgba(232,115,42,0.08);
  box-shadow: 0 0 0 1px var(--brand-primary), 0 4px 20px rgba(232,115,42,0.2);
}

/* Center last card when odd count */
.sel__card--solo {
  grid-column: 1 / -1;
  max-width: 200px;
  justify-self: center;
}

.sel__card-emoji { font-size: 2rem; margin-bottom: var(--space-1); }

.sel__card-name {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sel__card-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.3;
}

.sel__card-risk {
  margin-top: var(--space-1);
  font-size: 0.68rem;
  font-family: var(--font-display);
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid;
}
.sel__card-risk--safe      { color: #22c55e; border-color: rgba(34,197,94,0.4); }
.sel__card-risk--precision { color: #3b82f6; border-color: rgba(59,130,246,0.4); }
.sel__card-risk--power     { color: #f59e0b; border-color: rgba(245,158,11,0.4); }
.sel__card-risk--risky     { color: #ef4444; border-color: rgba(239,68,68,0.4); }

/* ── Continue button ──────────────────────────────────── */
.sel__continue {
  width: 100%;
  max-width: 280px;
  animation: slideUp 0.25s ease;
}
.sel__continue--go { opacity: 0.7; pointer-events: none; }
```

- [ ] **Step 11.3 — Browser check**

Navigate through the spot → lure → cast steps. Verify:
- Cards highlight on selection
- "Continue →" button appears after selection
- Step dots update correctly

- [ ] **Step 11.4 — Commit**

```bash
git add src/components/SelectionStep.jsx src/components/SelectionStep.css
git commit -m "feat: add SelectionStep (reusable for spot/lure/cast)"
```

---

### Task 12: Cast Animation

**Files:**
- Create: `src/components/CastAnimation.jsx`
- Create: `src/components/CastAnimation.css`

- [ ] **Step 12.1 — Create src/components/CastAnimation.jsx**

```jsx
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
```

- [ ] **Step 12.2 — Create src/components/CastAnimation.css**

```css
/* src/components/CastAnimation.css */
.ca {
  position: relative;
  width: 100%;
  min-height: 380px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Sky ──────────────────────────────────────────────── */
.ca__sky {
  flex: 1;
  background: linear-gradient(180deg, #020814 0%, #0a1628 60%, #0d2040 100%);
  position: relative;
  overflow: hidden;
}

.ca__moon {
  position: absolute; top: 16px; right: 28px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #f4e8a0, #d4c060);
  box-shadow: 0 0 20px rgba(244,230,140,0.5);
}

.ca__star {
  position: absolute;
  width: 2px; height: 2px;
  border-radius: 50%;
  background: white;
  left:  calc(8% + var(--i) * 12%);
  top:   calc(5% + var(--i) * 6%);
  animation: twinkle 2s ease-in-out calc(var(--i) * 0.3s) infinite;
}

/* Trees */
.ca__tree {
  position: absolute;
  bottom: 0;
  width: 0; height: 0;
  border-left: 28px solid transparent;
  border-right: 28px solid transparent;
  border-bottom: 80px solid #0a1a0a;
}
.ca__tree::before {
  content: '';
  position: absolute;
  bottom: -60px; left: -20px;
  width: 0; height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 60px solid #0a1a0a;
}
.ca__tree--l { left: 10px; }
.ca__tree--r { right: 10px; transform: scaleX(-1); }

/* ── Dock + Rod ───────────────────────────────────────── */
.ca__dock-wrap {
  position: absolute;
  bottom: 90px;
  left: 0;
  width: 60%;
  height: 30px;
}

.ca__dock {
  position: absolute;
  bottom: 0; left: 0;
  width: 120px; height: 14px;
  background: linear-gradient(180deg, #6b3a1f, #4a2210);
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
.ca__dock::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: repeating-linear-gradient(90deg, #8b5e3c 0, #8b5e3c 18px, #6b3a1f 18px, #6b3a1f 22px);
}

.ca__rod {
  position: absolute;
  bottom: 10px; left: 20px;
  width: 200px; height: 150px;
  overflow: visible;
  transition: transform 1.5s cubic-bezier(0.4,0,0.2,1);
}

/* Rod swings during casting phase */
.ca--casting .ca__rod { transform: rotate(-20deg) translateY(-10px); }
.ca--splash  .ca__rod { transform: rotate(5deg); }

/* Line flexes on bite */
.ca--tension .ca__line,
.ca--hooked  .ca__line { stroke: #ffee88; }

/* ── Water ────────────────────────────────────────────── */
.ca__water {
  height: 100px;
  background: linear-gradient(180deg, #0a2840 0%, #050e18 100%);
  border-top: 1px solid rgba(42,90,140,0.6);
  position: relative;
  overflow: visible;
}

.ca__wave {
  position: absolute;
  top: -5px; left: -20px; right: -20px;
  height: 10px;
  background: rgba(42,90,140,0.25);
  border-radius: 50%;
  animation: waterWave 3.5s ease-in-out infinite;
}
.ca__wave--2 { top: -2px; animation-delay: 1.4s; animation-duration: 4.5s; opacity: 0.5; }

/* ── Bobber ───────────────────────────────────────────── */
.ca__bobber {
  position: absolute;
  top: 10px; left: 52%;
  width: 20px; height: 26px;
  animation: bobberFloat 2s ease-in-out infinite;
  transition: left 1.5s ease;
}
.ca--waiting .ca__bobber { animation: bobberFloat 2s ease-in-out infinite; }
.ca--tension .ca__bobber { animation: bobberBite 0.4s ease-in-out infinite; }
.ca--hooked  .ca__bobber { opacity: 0; transform: translateY(40px); transition: all 0.3s; }
.ca--casting .ca__bobber { left: 80%; opacity: 0; }
.ca--splash  .ca__bobber { left: 52%; opacity: 1; }

.ca__bobber-top {
  width: 20px; height: 13px;
  background: #e03030;
  border-radius: 10px 10px 0 0;
}
.ca__bobber-bot {
  width: 20px; height: 13px;
  background: #f8f8f8;
  border-radius: 0 0 10px 10px;
  border-top: 1px solid rgba(0,0,0,0.15);
}

/* ── Ripples ──────────────────────────────────────────── */
.ca__ripple {
  position: absolute;
  top: 20px; left: calc(52% + 10px);
  transform: translateX(-50%);
  width: 40px; height: 12px;
  border: 1px solid rgba(42,90,160,0.5);
  border-radius: 50%;
  opacity: 0;
}
.ca--splash  .ca__ripple--1 { animation: ripple 1.5s ease-out 0.1s forwards; }
.ca--waiting .ca__ripple--1 { animation: ripple 2.5s ease-out 0s infinite; }
.ca--waiting .ca__ripple--2 { animation: ripple 2.5s ease-out 0.8s infinite; }
.ca--waiting .ca__ripple--3 { animation: ripple 2.5s ease-out 1.6s infinite; }
.ca--tension .ca__ripple--1 { animation: ripple 0.8s ease-out 0s infinite; }
.ca--hooked  .ca__ripple--1 { animation: ripple 0.5s ease-out 0s 3; width: 80px; height: 24px; }

/* ── Splash drops ─────────────────────────────────────── */
.ca__splash { position: absolute; top: 10px; left: 52%; }

.ca__drop {
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: rgba(100,180,255,0.8);
  opacity: 0;
  --dx: calc(cos(calc(var(--i) * 60deg)) * 25px);
  --dy: calc(sin(calc(var(--i) * 60deg)) * -20px);
}
.ca--splash .ca__drop,
.ca--hooked .ca__drop {
  animation: splashDrop 0.6s ease-out calc(var(--i) * 0.05s) forwards;
}

/* ── Label ────────────────────────────────────────────── */
.ca__label {
  position: absolute;
  bottom: 110px; left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.ca__label-text {
  display: block;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;
  text-align: center;
  animation: popIn 0.3s ease;
  background: rgba(6,12,24,0.75);
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-card);
  backdrop-filter: blur(4px);
}

/* ── Progress dots ────────────────────────────────────── */
.ca__progress {
  position: absolute;
  bottom: 10px; left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.ca__pdot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--border-card);
  transition: background var(--t-normal);
}
.ca__pdot--done { background: var(--brand-primary); }
```

- [ ] **Step 12.3 — Manual test**

Complete spot+lure+cast selections and verify the animation plays through all 6 phases automatically and transitions to the result screen.

- [ ] **Step 12.4 — Commit**

```bash
git add src/components/CastAnimation.jsx src/components/CastAnimation.css
git commit -m "feat: add 7-phase cast animation with CSS scene"
```

---

### Task 13: Result Card

**Files:**
- Create: `src/components/ResultCard.jsx`
- Create: `src/components/ResultCard.css`

- [ ] **Step 13.1 — Create src/components/ResultCard.jsx**

```jsx
// src/components/ResultCard.jsx
import { useState, useEffect } from 'react';
import './ResultCard.css';
import { SCARCITY_COPY } from '../config/gameConfig.js';

const RARITY_LABELS = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
  epic: 'Epic', legendary: 'Legendary',
};

export default function ResultCard({ result, newBadges = [], buildChallengeUrl }) {
  const [flipped,        setFlipped]        = useState(false);
  const [couponVisible,  setCouponVisible]  = useState(false);
  const [shareStatus,    setShareStatus]    = useState('idle'); // idle | copied

  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true),       500);
    const t2 = setTimeout(() => setCouponVisible(true), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function handleShare() {
    const scarcity = SCARCITY_COPY[result.rarity] ?? '';
    const challengeUrl = buildChallengeUrl(result);
    const text = [
      `🎣 I just landed a ${RARITY_LABELS[result.rarity]} ${result.fishName} (${result.weight} lbs) on Buzzard Roost Daily Cast!`,
      scarcity,
      `Beat my ${result.points.toLocaleString()} pts →`,
      `#BuzzardRoost #DailyCast`,
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      navigator.share({ text, url: challengeUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + '\n' + challengeUrl).then(() => {
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2500);
      });
    }
  }

  return (
    <div className="rc">
      <h2 className="rc__heading">Today's Catch</h2>

      {/* 3D flip card */}
      <div className={`rc__flip-wrap ${flipped ? 'rc__flip-wrap--flipped' : ''}`}>
        <div className="rc__flip">
          {/* Back face (mystery) */}
          <div className="rc__face rc__face--back">
            <span className="rc__back-eagle">🦅</span>
            <span className="rc__back-brand">Buzzard Roost</span>
            <span className="rc__back-q">?</span>
          </div>
          {/* Front face (fish reveal) */}
          <div className={`rc__face rc__face--front rc__face--${result.rarity}`}>
            <span className={`rc__rarity-badge rc__rarity-badge--${result.rarity}`}>
              ★ {RARITY_LABELS[result.rarity].toUpperCase()}
            </span>
            <span className="rc__emoji" role="img" aria-label={result.fishName}>{result.emoji}</span>
            <h3 className="rc__name">{result.fishName}</h3>
            <p  className="rc__flavor"><em>{result.flavor}</em></p>
            <div className="rc__stats">
              <div className="rc__stat">
                <span className="rc__stat-label">Weight</span>
                <span className="rc__stat-value">{result.weight} lbs</span>
              </div>
              <div className="rc__stat-divider" />
              <div className="rc__stat">
                <span className="rc__stat-label">Points</span>
                <span className="rc__stat-value">{result.points.toLocaleString()}</span>
              </div>
            </div>
            {SCARCITY_COPY[result.rarity] && (
              <p className="rc__scarcity">{SCARCITY_COPY[result.rarity]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Coupon (slides up after flip) */}
      {couponVisible && (
        <div className={`rc__coupon rc__coupon--${result.rarity}`}>
          <div className="rc__coupon-header">
            <span className="rc__coupon-label">{result.coupon.label}</span>
            <span className="rc__coupon-discount">{result.coupon.discount}</span>
          </div>
          <code className="rc__coupon-code">{result.coupon.code}</code>
          <p className="rc__coupon-hint">Enter at checkout · Buzzard Roost store</p>
        </div>
      )}

      {/* New badges */}
      {newBadges.length > 0 && (
        <div className="rc__badges">
          <span className="rc__badges-title">🎉 New achievement{newBadges.length > 1 ? 's' : ''}!</span>
          <div className="rc__badges-row">
            {newBadges.map(b => (
              <div key={b.id} className="rc__badge">{b.emoji} {b.label}</div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="rc__actions">
        <button className="btn btn--secondary" onClick={handleShare}>
          {shareStatus === 'copied' ? '✅ Copied to clipboard!' : '📤 Share My Catch'}
        </button>
        <a className="btn btn--primary" href="https://buzzardroost.com/shop" target="_blank" rel="noopener noreferrer">
          Shop Buzzard Roost →
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 13.2 — Create src/components/ResultCard.css**

```css
/* src/components/ResultCard.css */
.rc {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-5);
  gap: var(--space-5);
  animation: fadeIn 0.3s ease;
}

.rc__heading {
  font-family: var(--font-display);
  font-size: 0.8rem;
  letter-spacing: 3px;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* ── 3D flip ──────────────────────────────────────────── */
.rc__flip-wrap {
  perspective: 900px;
  width: 260px; height: 320px;
}

.rc__flip {
  width: 100%; height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4,0,0.2,1);
}

.rc__flip-wrap--flipped .rc__flip {
  transform: rotateY(180deg);
}

.rc__face {
  position: absolute; inset: 0;
  border-radius: var(--radius-lg);
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-5);
}

/* Back face */
.rc__face--back {
  background: linear-gradient(135deg, #0d1f35, #122540);
  border: 1px solid var(--border-card);
}
.rc__back-eagle { font-size: 2.5rem; }
.rc__back-brand {
  font-family: var(--font-display);
  font-size: 0.8rem;
  letter-spacing: 2px;
  color: var(--brand-accent);
  text-transform: uppercase;
}
.rc__back-q {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 700;
  color: rgba(255,255,255,0.1);
  margin-top: var(--space-2);
}

/* Front face — rarity backgrounds */
.rc__face--front { transform: rotateY(180deg); }

.rc__face--common    { background: linear-gradient(135deg, #1a1f2a, #121820); border: 1px solid rgba(156,163,175,0.4); box-shadow: var(--glow-common); }
.rc__face--uncommon  { background: linear-gradient(135deg, #0f2a18, #091a10); border: 1px solid rgba(34,197,94,0.4);   box-shadow: var(--glow-uncommon); }
.rc__face--rare      { background: linear-gradient(135deg, #0f1e3a, #091428); border: 1px solid rgba(59,130,246,0.4);  box-shadow: var(--glow-rare); }
.rc__face--epic      { background: linear-gradient(135deg, #1e0f3a, #140928); border: 1px solid rgba(168,85,247,0.4);  box-shadow: var(--glow-epic); }
.rc__face--legendary {
  background: linear-gradient(135deg, #2a1a00, #1a1000);
  border: 1px solid rgba(245,158,11,0.5);
  box-shadow: var(--glow-legendary);
  animation: glowPulse 2s ease-in-out infinite;
}

/* Rarity badge on front */
.rc__rarity-badge {
  font-family: var(--font-display);
  font-size: 0.65rem;
  letter-spacing: 2px;
  padding: 3px 12px;
  border-radius: var(--radius-full);
  border: 1px solid;
}
.rc__rarity-badge--common    { color: var(--rarity-common);    border-color: rgba(156,163,175,0.5); }
.rc__rarity-badge--uncommon  { color: var(--rarity-uncommon);  border-color: rgba(34,197,94,0.5); }
.rc__rarity-badge--rare      { color: var(--rarity-rare);      border-color: rgba(59,130,246,0.5); }
.rc__rarity-badge--epic      { color: var(--rarity-epic);      border-color: rgba(168,85,247,0.5); }
.rc__rarity-badge--legendary { color: var(--rarity-legendary); border-color: rgba(245,158,11,0.5); background: rgba(245,158,11,0.08); }

.rc__emoji { font-size: 5rem; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5)); }

.rc__name {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

.rc__flavor {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.4;
}

.rc__stats {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-1);
}
.rc__stat { text-align: center; }
.rc__stat-label { display: block; font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-display); }
.rc__stat-value { display: block; font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.rc__stat-divider { width: 1px; height: 28px; background: var(--border-subtle); }

.rc__scarcity {
  font-size: 0.68rem;
  color: var(--rarity-legendary);
  text-align: center;
  font-style: italic;
}

/* ── Coupon ───────────────────────────────────────────── */
.rc__coupon {
  width: 100%;
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
  animation: slideUp 0.4s ease;
  /* Perforated edge via radial-gradient */
  background-image: radial-gradient(circle at 0 50%, transparent 8px, var(--bg-card-raised) 8px),
                    radial-gradient(circle at 100% 50%, transparent 8px, var(--bg-card-raised) 8px);
  background-size: 100% 100%;
  background-color: var(--bg-card-raised);
  border-top: 2px dashed;
  border-bottom: 2px dashed;
}
.rc__coupon--legendary { border-color: rgba(245,158,11,0.5); }
.rc__coupon--epic      { border-color: rgba(168,85,247,0.5); }
.rc__coupon--rare      { border-color: rgba(59,130,246,0.5); }
.rc__coupon--uncommon  { border-color: rgba(34,197,94,0.4); }
.rc__coupon--common    { border-color: var(--border-card); }

.rc__coupon-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
.rc__coupon-label    { font-family: var(--font-display); font-size: 0.75rem; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase; }
.rc__coupon-discount { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--brand-primary); }
.rc__coupon-code {
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
  background: rgba(0,0,0,0.3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  user-select: all;
}
.rc__coupon-hint { font-size: 0.7rem; color: var(--text-muted); margin-top: var(--space-2); }

/* ── Badges ───────────────────────────────────────────── */
.rc__badges {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: rgba(244,196,48,0.06);
  border: 1px solid rgba(244,196,48,0.2);
  border-radius: var(--radius-md);
  animation: slideUp 0.4s ease 0.2s both;
}
.rc__badges-title { font-size: 0.8rem; color: var(--brand-accent); font-family: var(--font-display); letter-spacing: 0.5px; }
.rc__badges-row { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-2); }
.rc__badge {
  font-size: 0.75rem;
  padding: 4px 10px;
  background: rgba(244,196,48,0.1);
  border: 1px solid rgba(244,196,48,0.3);
  border-radius: var(--radius-full);
  color: var(--brand-accent);
}

/* ── Actions ──────────────────────────────────────────── */
.rc__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}
.rc__actions .btn { width: 100%; }
```

- [ ] **Step 13.3 — Verify the full game loop end-to-end**

Play through: landing → spot → lure → cast → animation → result card flip. Confirm:
- Card flips after ~500ms delay
- Fish emoji + name + stats visible on front face
- Coupon appears after flip completes
- Share button shows clipboard confirmation on desktop

- [ ] **Step 13.4 — Commit**

```bash
git add src/components/ResultCard.jsx src/components/ResultCard.css
git commit -m "feat: add ResultCard with 3D flip, rarity glow, coupon, share"
```

---

### Task 14: Leaderboard + PlayerStats

**Files:**
- Create: `src/components/Leaderboard.jsx`
- Create: `src/components/Leaderboard.css`
- Create: `src/components/PlayerStats.jsx`
- Create: `src/components/PlayerStats.css`

- [ ] **Step 14.1 — Create src/components/Leaderboard.jsx**

```jsx
// src/components/Leaderboard.jsx
import './Leaderboard.css';
import { MOCK_LEADERBOARD } from '../data/gameData.js';

export default function Leaderboard({ playerResult }) {
  // Build display board: inject player at correct rank
  const base = MOCK_LEADERBOARD.map(e => ({ ...e }));
  let insertIdx = base.length;
  for (let i = 0; i < base.length; i++) {
    if (playerResult.points > base[i].points) { insertIdx = i; break; }
  }

  const playerEntry = {
    name: 'You ✦',
    fish: playerResult.fishName,
    rarity: playerResult.rarity,
    points: playerResult.points,
    isPlayer: true,
  };

  const withPlayer = [...base];
  withPlayer.splice(insertIdx, 0, playerEntry);
  const ranked = withPlayer.slice(0, 11).map((e, i) => ({ ...e, displayRank: i + 1 }));

  const playerRow  = ranked.find(e => e.isPlayer);
  const top10      = ranked.slice(0, 10);
  const playerOut  = playerRow && playerRow.displayRank > 10;

  return (
    <div className="lb">
      <div className="lb__header">
        <h3 className="lb__title">Today's Anglers</h3>
        <span className="lb__badge">Updated Daily</span>
      </div>

      <div className="lb__list">
        {top10.map((entry, i) => (
          <div key={i} className={`lb__row ${entry.isPlayer ? 'lb__row--player' : ''}`}>
            <span className="lb__rank">#{entry.displayRank}</span>
            <span className="lb__name">{entry.name}</span>
            <span className="lb__fish">
              {entry.fish}
              <span className={`rarity-badge rarity-badge--${entry.rarity}`}>{entry.rarity}</span>
            </span>
            <span className="lb__pts">{entry.points.toLocaleString()}</span>
          </div>
        ))}

        {playerOut && (
          <>
            <div className="lb__ellipsis">· · ·</div>
            <div className="lb__row lb__row--player">
              <span className="lb__rank">#{insertIdx + 1}</span>
              <span className="lb__name">You ✦</span>
              <span className="lb__fish">
                {playerResult.fishName}
                <span className={`rarity-badge rarity-badge--${playerResult.rarity}`}>{playerResult.rarity}</span>
              </span>
              <span className="lb__pts">{playerResult.points.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* SUPABASE: fetch real leaderboard
          Replace MOCK_LEADERBOARD with:
          const { data } = await supabase
            .from('daily_leaderboard')
            .select('*')
            .eq('date', today)
            .order('points', { ascending: false })
            .limit(10);
      */}
    </div>
  );
}
```

- [ ] **Step 14.2 — Create src/components/Leaderboard.css**

```css
/* src/components/Leaderboard.css */
.lb {
  width: 100%;
  padding: var(--space-5);
  border-top: 1px solid var(--border-subtle);
}

.lb__header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-4);
}

.lb__title {
  font-family: var(--font-display);
  font-size: 1rem; font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase; letter-spacing: 1px;
}

.lb__badge {
  font-size: 0.65rem; font-family: var(--font-display);
  letter-spacing: 1px; text-transform: uppercase;
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
  padding: 2px 8px; border-radius: var(--radius-full);
}

.lb__list { display: flex; flex-direction: column; gap: var(--space-2); }

.lb__row {
  display: grid;
  grid-template-columns: 28px 1fr auto 60px;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  background: var(--bg-card-raised);
  border: 1px solid transparent;
  transition: border-color var(--t-fast);
}

.lb__row--player {
  border-color: var(--brand-primary);
  background: rgba(232,115,42,0.06);
}

.lb__rank { color: var(--text-muted); font-family: var(--font-display); font-size: 0.75rem; }
.lb__name { color: var(--text-primary); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lb__fish { color: var(--text-secondary); display: flex; align-items: center; gap: var(--space-1); flex-wrap: wrap; font-size: 0.75rem; }
.lb__pts  { text-align: right; font-family: var(--font-display); font-weight: 700; color: var(--brand-accent); font-size: 0.85rem; }

.lb__ellipsis { text-align: center; color: var(--text-muted); font-size: 1rem; padding: var(--space-1); letter-spacing: 4px; }
```

- [ ] **Step 14.3 — Create src/components/PlayerStats.jsx**

```jsx
// src/components/PlayerStats.jsx
import './PlayerStats.css';
import { streakEmoji } from '../config/gameConfig.js';

export default function PlayerStats({ playerData }) {
  const streak      = playerData?.streak?.count      ?? 0;
  const bestCatch   = playerData?.bestCatch           ?? null;
  const totalPoints = playerData?.totalPoints         ?? 0;
  const badges      = playerData?.badges              ?? [];

  return (
    <div className="ps">
      <h3 className="ps__title">Your Season</h3>
      <div className="ps__tiles">
        <div className="ps__tile">
          <span className="ps__tile-icon">{streakEmoji(streak)}</span>
          <span className="ps__tile-value">{streak}</span>
          <span className="ps__tile-label">Day Streak</span>
        </div>
        <div className="ps__tile">
          <span className="ps__tile-icon">🏆</span>
          <span className="ps__tile-value ps__tile-value--sm">
            {bestCatch ? bestCatch.fishName : '—'}
          </span>
          <span className="ps__tile-label">Best Catch</span>
        </div>
        <div className="ps__tile">
          <span className="ps__tile-icon">⭐</span>
          <span className="ps__tile-value">{totalPoints.toLocaleString()}</span>
          <span className="ps__tile-label">Total Points</span>
        </div>
      </div>
      {badges.length > 0 && (
        <div className="ps__badges">
          <span className="ps__badges-label">Achievements</span>
          <div className="ps__badges-row">
            {badges.map(b => (
              <span key={b.id} className="ps__badge" title={b.label}>{b.emoji}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 14.4 — Create src/components/PlayerStats.css**

```css
/* src/components/PlayerStats.css */
.ps {
  width: 100%;
  padding: var(--space-5);
  border-top: 1px solid var(--border-subtle);
  padding-bottom: var(--space-10);
}

.ps__title {
  font-family: var(--font-display);
  font-size: 1rem; font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase; letter-spacing: 1px;
  margin-bottom: var(--space-4);
}

.ps__tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.ps__tile {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-2);
  background: var(--bg-card-raised);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  text-align: center;
}

.ps__tile-icon { font-size: 1.4rem; }
.ps__tile-value { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
.ps__tile-value--sm { font-size: 0.75rem; line-height: 1.2; }
.ps__tile-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-display); }

.ps__badges { margin-top: var(--space-4); }
.ps__badges-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-display); }
.ps__badges-row { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-2); }
.ps__badge { font-size: 1.4rem; cursor: default; }
```

- [ ] **Step 14.5 — Commit**

```bash
git add src/components/Leaderboard.jsx src/components/Leaderboard.css \
        src/components/PlayerStats.jsx  src/components/PlayerStats.css
git commit -m "feat: add Leaderboard with player rank injection + PlayerStats tiles"
```

---

### Task 15: Already Played Screen

**Files:**
- Create: `src/components/AlreadyPlayed.jsx`
- Create: `src/components/AlreadyPlayed.css`

- [ ] **Step 15.1 — Create src/components/AlreadyPlayed.jsx**

```jsx
// src/components/AlreadyPlayed.jsx
import { useState, useEffect } from 'react';
import './AlreadyPlayed.css';
import { streakEmoji } from '../config/gameConfig.js';

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

export default function AlreadyPlayed({ result, playerData }) {
  const [timeLeft, setTimeLeft] = useState(msUntilMidnight());
  const streak = playerData?.streak?.count ?? 0;

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, s } = formatCountdown(timeLeft);

  return (
    <div className="ap">
      {/* Living water background */}
      <div className="ap__scene" aria-hidden="true">
        <div className="ap__sky" />
        <div className="ap__water">
          <div className="ap__wave" />
          <div className="ap__wave ap__wave--2" />
          <div className="ap__bobber">
            <div className="ap__bobber-top" /><div className="ap__bobber-bot" />
          </div>
        </div>
      </div>

      <div className="ap__content">
        <h2 className="ap__heading">Today's Cast is In</h2>

        {streak > 0 && (
          <div className="ap__streak">
            {streakEmoji(streak)} {streak}-day streak — keep it going!
          </div>
        )}

        {/* Today's catch recap */}
        <div className={`ap__catch ap__catch--${result.rarity}`}>
          <span className={`rarity-badge rarity-badge--${result.rarity}`}>
            ★ {result.rarity.toUpperCase()}
          </span>
          <span className="ap__catch-emoji" role="img" aria-label={result.fishName}>{result.emoji}</span>
          <span className="ap__catch-name">{result.fishName}</span>
          <span className="ap__catch-stats">{result.weight} lbs · {result.points.toLocaleString()} pts</span>
          <div className="ap__catch-coupon">
            <span className="ap__coupon-label">{result.coupon.label}</span>
            <code className="ap__coupon-code">{result.coupon.code}</code>
          </div>
        </div>

        {/* Countdown */}
        <div className="ap__countdown">
          <p className="ap__countdown-label">Your next cast drops in</p>
          <div className="ap__countdown-clock">
            <div className="ap__unit"><span className="ap__num">{h}</span><span className="ap__unit-label">hrs</span></div>
            <span className="ap__colon">:</span>
            <div className="ap__unit"><span className="ap__num">{m}</span><span className="ap__unit-label">min</span></div>
            <span className="ap__colon">:</span>
            <div className="ap__unit"><span className="ap__num">{s}</span><span className="ap__unit-label">sec</span></div>
          </div>
        </div>

        <a className="btn btn--primary" href="https://buzzardroost.com/shop" target="_blank" rel="noopener noreferrer">
          Shop Buzzard Roost →
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 15.2 — Create src/components/AlreadyPlayed.css**

```css
/* src/components/AlreadyPlayed.css */
.ap { position: relative; min-height: 100%; display: flex; flex-direction: column; }

.ap__scene { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.ap__sky   { position: absolute; inset: 0; background: linear-gradient(180deg, #020814 0%, #0a1628 55%, #0d2040 100%); }
.ap__water { position: absolute; bottom: 0; left: 0; right: 0; height: 80px; background: linear-gradient(180deg, #0a2840, #050e18); border-top: 1px solid rgba(42,90,140,0.5); }
.ap__wave  { position: absolute; top: -6px; left: -20px; right: -20px; height: 10px; background: rgba(42,90,140,0.2); border-radius: 50%; animation: waterWave 3.5s ease-in-out infinite; }
.ap__wave--2 { top: -3px; animation-delay: 1.4s; opacity: 0.5; }
.ap__bobber { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 16px; height: 22px; animation: bobberFloat 2s ease-in-out infinite; }
.ap__bobber-top { width: 16px; height: 11px; background: #e03030; border-radius: 8px 8px 0 0; }
.ap__bobber-bot { width: 16px; height: 11px; background: #f0f0f0; border-radius: 0 0 8px 8px; }

.ap__content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: var(--space-8) var(--space-5) var(--space-10);
  gap: var(--space-5);
}

.ap__heading {
  font-family: var(--font-display); font-size: 1.5rem; font-weight: 700;
  color: var(--text-primary); text-transform: uppercase; letter-spacing: 2px; text-align: center;
}

.ap__streak {
  padding: var(--space-2) var(--space-5);
  background: rgba(244,196,48,0.08); border: 1px solid rgba(244,196,48,0.25);
  border-radius: var(--radius-full);
  font-family: var(--font-display); font-size: 0.9rem; color: var(--brand-accent);
}

.ap__catch {
  width: 100%; padding: var(--space-5);
  border-radius: var(--radius-lg);
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
  background: var(--bg-card-raised); border: 1px solid var(--border-card);
}
.ap__catch--legendary { border-color: rgba(245,158,11,0.4); box-shadow: var(--glow-legendary); }
.ap__catch--epic      { border-color: rgba(168,85,247,0.4); box-shadow: var(--glow-epic); }
.ap__catch--rare      { border-color: rgba(59,130,246,0.4);  box-shadow: var(--glow-rare); }
.ap__catch--uncommon  { border-color: rgba(34,197,94,0.4); }

.ap__catch-emoji { font-size: 3.5rem; margin: var(--space-2) 0; }
.ap__catch-name  { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 1px; }
.ap__catch-stats { font-size: 0.8rem; color: var(--text-secondary); }

.ap__catch-coupon { margin-top: var(--space-2); text-align: center; }
.ap__coupon-label { display: block; font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-display); letter-spacing: 1px; text-transform: uppercase; }
.ap__coupon-code  { font-family: 'Courier New', monospace; font-size: 0.95rem; color: var(--brand-primary); letter-spacing: 2px; user-select: all; }

.ap__countdown { text-align: center; }
.ap__countdown-label { font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-display); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: var(--space-3); }
.ap__countdown-clock { display: flex; align-items: center; gap: var(--space-3); }
.ap__unit { display: flex; flex-direction: column; align-items: center; }
.ap__num  { font-family: var(--font-display); font-size: 2.2rem; font-weight: 700; color: var(--brand-accent); line-height: 1; animation: countdownPulse 1s ease-in-out infinite; }
.ap__unit-label { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; font-family: var(--font-display); }
.ap__colon { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--text-muted); line-height: 1; margin-bottom: 8px; }
```

- [ ] **Step 15.3 — Commit**

```bash
git add src/components/AlreadyPlayed.jsx src/components/AlreadyPlayed.css
git commit -m "feat: add AlreadyPlayed screen with live countdown + catch recap"
```

---

### Task 16: Final Integration, Smoke Test & Build Verification

- [ ] **Step 16.1 — Run full test suite**

```bash
npm test
```

Expected: All tests across `gameLogic.test.js`, `integrity.test.js`, and `storageManager.test.js` **PASS**. Zero failures.

- [ ] **Step 16.2 — Manual end-to-end smoke test**

```bash
npm run dev
```

Walk through the full flow and verify each step:

1. **Landing** — animated bobber visible, "Make Today's Cast" button present, FOMO leaderboard teaser shows
2. **Spot selection** — all 5 spots render, selecting one highlights it, Continue button appears
3. **Lure selection** — all 5 lures render, risk indicator shows on Mystery Lure
4. **Cast selection** — all 4 cast styles render with correct risk badges
5. **Animation** — all 6 phases play in sequence, label text changes each phase
6. **Result card** — flips after ~0.5s delay, fish emoji + name + stats on front face, coupon appears, share button works
7. **Leaderboard** — "You ✦" row appears highlighted at correct rank
8. **PlayerStats** — streak/bestCatch/totalPoints tiles render
9. **Reload page** — immediately shows AlreadyPlayed screen with today's catch
10. **Countdown** — ticking live every second
11. **Console** — zero JS errors throughout

- [ ] **Step 16.3 — Verify anti-tamper**

In browser DevTools → Application → Local Storage:
- Edit `br_todayCatch` and change `"points":XXX` to `"points":999999`
- Reload the page
- Expected: AlreadyPlayed screen shows today's catch but the tampered data is rejected — the player sees no catch (integrity failure clears the entry and allows re-play)

- [ ] **Step 16.4 — Test challenge URL**

After playing, click "Share My Catch". Copy the challenge URL from clipboard. Open in a new tab (or incognito). Verify the challenge banner appears on the landing screen with the correct rarity and points.

- [ ] **Step 16.5 — Production build**

```bash
npm run build
```

Expected output:
```
dist/index.html
dist/assets/index-[hash].css
dist/assets/index-[hash].js
```

No errors. Total JS bundle should be under 200KB (React + your code, no other deps).

- [ ] **Step 16.6 — Preview production build locally**

```bash
npm run preview
```

Open `http://localhost:4173`. Verify the game works identically to the dev server. Confirm assets load (fonts from Google CDN require internet access).

- [ ] **Step 16.7 — Final commit**

```bash
git add .
git commit -m "feat: complete Buzzard Roost Daily Cast v1

- Phase state machine: landing → spot → lure → cast → animation → result | played
- Weighted rarity roll across 22 fish in 5 tiers
- 6-phase CSS cast animation with dock/water scene
- 3D card flip result reveal with rarity glow effects
- Client-side result signing + range validation (anti-tamper)
- Streak identity, badge unlocking, catch history
- Share card + friend challenge URL
- FOMO leaderboard teaser on landing
- All V2 expansion points marked in source (Shopify, Supabase, Auth)
- Full Vitest suite for gameLogic, integrity, storageManager"
```

---

## Deployment to Cloudflare Pages / Netlify / Vercel

After the final commit, deploy the `dist/` folder:

**Cloudflare Pages:**
```
Build command:  npm run build
Output dir:     dist
```

**Netlify:**
```
Build command:  npm run build
Publish dir:    dist
```

**Vercel:**
```
Framework preset: Vite
Output dir:       dist
```

All three hosts serve static files with no server config required.
