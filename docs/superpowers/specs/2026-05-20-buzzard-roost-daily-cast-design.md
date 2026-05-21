# Buzzard Roost Daily Cast — Design Spec
**Date:** 2026-05-20  
**Status:** Approved  
**Target:** Standalone static site (Vite + React), deployable to Cloudflare Pages / Netlify / Vercel

---

## 1. Concept

A daily fishing mini-game for the Buzzard Roost online fishing products brand. Players get **one cast per day** — they choose a spot, lure, and cast style, watch a short animated fishing sequence, then receive a fish catch with rarity, points, and a coupon reward. Designed to drive daily return visits and social sharing, with clean seams for future Shopify and Supabase integration.

**Tone:** Premium fishing brand — not a casino. No gambling language (no "bet", "wager", "jackpot", "payout"). Use tournament and reward language throughout.

---

## 2. Visual Design

| Property | Decision |
|---|---|
| Theme | Dark & Dramatic — deep navy/midnight blues, gold + electric accents |
| Desktop layout | Centered ~480px app card on decorative dark background |
| Mobile layout | Full-viewport card (same component, no iframe) |
| Fish reveal | 3D card flip — face-down mystery card flips 180° to reveal fish |
| Primary font | Oswald (headers, labels) via Google Fonts |
| Body font | Nunito (descriptions, flavor text) via Google Fonts |
| Rarity glow colors | Common: gray / Uncommon: green / Rare: blue / Epic: purple / Legendary: gold |

### Color Palette (CSS custom properties)
```css
--brand-primary: #e8732a;      /* Buzzard orange — CTAs, accents */
--brand-accent:  #f4c430;      /* Gold — legendary items, logo */
--water-deep:    #0a2840;
--water-mid:     #1a4d7a;
--bg-dark:       #060c18;      /* App background */
--bg-card:       #0d1f35;      /* Card surface */
--text-primary:  #e8f0f8;
--text-muted:    #4a6a8a;
```

---

## 3. Architecture

### Tech Stack
- **React 18 + Vite** — zero runtime dependencies beyond React + ReactDOM
- **Plain CSS** — per-component `.css` files, class names scoped by component prefix
- **localStorage** — all persistence for V1, namespaced with `br_` prefix
- **No router** — single-page phase machine, no URL routing needed for V1

### File Structure
```
buzzard-roost-daily-cast/
├── index.html                        ← Google Fonts, meta tags, mobile viewport
├── package.json                      ← React 18 + Vite only
├── vite.config.js                    ← base: './' for static hosting
│
└── src/
    ├── main.jsx                      ← ReactDOM.createRoot only
    ├── App.jsx                       ← Phase state machine + localStorage init
    ├── App.css                       ← App shell, fade transitions
    ├── index.css                     ← CSS custom properties, reset, keyframes
    │
    ├── config/
    │   └── gameConfig.js             ← ALL tunable values (fish, weights, coupons)
    │
    ├── data/
    │   ├── fishData.js               ← 22 fish across 5 rarity tiers
    │   └── gameData.js               ← Spots (5), Lures (5), Cast styles (4)
    │
    ├── utils/
    │   ├── gameLogic.js              ← Weighted rarity roll, fish picker, points calc
    │   ├── storageManager.js         ← localStorage read/write, streak logic
    │   └── integrity.js             ← Result signing + validation
    │
    └── components/
        ├── Header.jsx / .css
        ├── LandingScreen.jsx / .css
        ├── SelectionStep.jsx / .css  ← Reused for Spot, Lure, Cast steps
        ├── CastAnimation.jsx / .css
        ├── ResultCard.jsx / .css
        ├── Leaderboard.jsx / .css
        ├── PlayerStats.jsx / .css
        └── AlreadyPlayed.jsx / .css
```

### State Machine (App.jsx)
```js
// phases: 'landing' | 'spot' | 'lure' | 'cast' | 'animation' | 'result' | 'played'
const [phase, setPhase] = useState('landing');
const [spot, setSpot] = useState(null);
const [lure, setLure] = useState(null);
const [castStyle, setCastStyle] = useState(null);
const [result, setResult] = useState(null);
const [playerData, setPlayerData] = useState(null); // loaded from localStorage on mount
```

On mount: check `hasPlayedToday()` → if true, load today's result and jump to `'played'` phase.

Flow is intentionally **one-way** — no back-navigation after the cast is made.

---

## 4. Game Configuration (`src/config/gameConfig.js`)

Single source of truth for all tunable values. Operators edit this file to adjust the game without touching logic.

### Rarity Base Weights
```js
export const BASE_WEIGHTS = {
  common:    50,
  uncommon:  25,
  rare:      15,
  epic:       7,
  legendary:  3,
};
```

### Spot Modifiers (added to base weights)
| Spot | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| Dock | +8 | +4 | -2 | -5 | -5 |
| Reeds | +3 | +6 | +3 | -3 | -2 |
| Fallen Tree | -3 | +2 | +6 | +2 | 0 |
| Deep Water | -10 | -3 | +2 | +7 | +4 |
| Rocky Bank | -3 | 0 | +4 | +2 | +1 |

### Lure Modifiers
| Lure | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| Worm | +8 | +4 | -2 | -4 | -4 |
| Spinner | 0 | +5 | +3 | -1 | -1 |
| Frog | -2 | +2 | +5 | +3 | 0 |
| Jig | 0 | +2 | +3 | +3 | -1 |
| Mystery Lure | -12 | -4 | +2 | +7 | +7 |

### Cast Style Modifiers
| Cast Style | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| Safe Cast | +10 | +3 | -3 | -5 | -5 |
| Precision Cast | -2 | +3 | +5 | +1 | -1 |
| Power Cast | -5 | -2 | +3 | +5 | +2 |
| Risky Cast | -15 | -5 | +3 | +7 | +10 |

**Example outcomes:**
- Dock + Worm + Safe Cast → ~62% Common, ~30% Uncommon, ~6% Rare, <2% Epic/Legendary
- Deep Water + Mystery Lure + Risky Cast → ~1% Common, ~2% Uncommon, ~22% Rare, ~36% Epic, ~39% Legendary

### Coupon Rules
```js
export const COUPON_RULES = {
  common:    { discount: '5% off',                label: "Angler's Discount"    },
  uncommon:  { discount: '10% off',               label: 'Bass Hunter Deal'      },
  rare:      { discount: '15% off',               label: 'Trophy Catch Reward'   },
  epic:      { discount: 'Free shipping + 15% off', label: 'Epic Haul Reward'   },
  legendary: { discount: '20% off',               label: 'Monster Catch Coupon'  },
};
```

### Points Ranges
```js
export const POINTS_RANGES = {
  common:    { base: 50,   variance: 100  },
  uncommon:  { base: 150,  variance: 200  },
  rare:      { base: 350,  variance: 300  },
  epic:      { base: 650,  variance: 550  },
  legendary: { base: 1200, variance: 1300 },
};
```

---

## 5. Fish Database (`src/data/fishData.js`)

22 fish total. Each entry:
```js
{
  id:        'golden_trout',
  name:      'Golden Trout',
  emoji:     '🐟',
  rarity:    'legendary',
  weightMin: 50,   // lbs
  weightMax: 180,
  flavor:    'A fish of legend. Anglers spend lifetimes chasing this ghost.',
}
```

| Rarity | Fish |
|---|---|
| Common (5) | Bluegill, Sunfish, Yellow Perch, Crappie, Rock Bass |
| Uncommon (5) | Largemouth Bass, Smallmouth Bass, Walleye, Channel Catfish, Carp |
| Rare (4) | Rainbow Trout, Striped Bass, Northern Pike, Muskie |
| Epic (4) | Trophy Bass, Giant Catfish, Tiger Muskie, Alligator Gar |
| Legendary (4) | Golden Trout, Ancient Sturgeon, Albino Catfish, The Buzzard Monster |

---

## 6. Game Logic (`src/utils/gameLogic.js`)

### Rarity Roll
1. Start with `BASE_WEIGHTS` from config
2. Add spot modifier for selected spot
3. Add lure modifier for selected lure
4. Add cast style modifier for selected cast style
5. Clamp each weight to minimum `1` (every rarity always possible)
6. Normalize to 100% (divide each by total)
7. Roll `Math.random()` against cumulative weights → rarity string
8. Pick random fish from that rarity tier in the fish DB
9. Calculate weight: `fishMin + Math.random() * (fishMax - fishMin)`, rounded to 1 decimal
10. Calculate points: `base + Math.floor(Math.random() * variance)` from `POINTS_RANGES`
11. Generate coupon code: `BUZZARD-[RARITY_UPPER]-[Date.now().toString(36).toUpperCase()]`

---

## 7. Anti-Tamper System (`src/utils/integrity.js`)

Protects localStorage results from casual DevTools manipulation.

### Signing
```js
const SALT = 'BuzzardRoost_v1_cast';

function signResult(result) {
  const payload = [result.date, result.fishId, result.rarity,
                   result.points, result.weight].join('|');
  return btoa(payload + SALT).replace(/=/g, '');
}
```

### Validation on load
- Recompute signature and compare to stored `sig` field
- Verify `rarity` is one of exactly 5 valid strings
- Verify `points` within valid range for that rarity (from config)
- Verify `fishId` exists in fish database
- Verify `date` is not in the future
- Verify `weight` within that rarity's weight range
- **On any failure:** clear the stored result silently, allow re-play

### V2 upgrade point
```js
// INTEGRITY V2: replace client-side signing with server-issued result token.
// Server runs the rarity roll and returns a signed JWT. localStorage stores
// the token; Supabase validates it on save. Client-side signing is removed.
```

---

## 8. Data Persistence (`src/utils/storageManager.js`)

### localStorage Keys
```js
const KEYS = {
  todayCatch:   'br_todayCatch',    // Signed result object
  lastPlayDate: 'br_lastPlayDate',  // 'YYYY-MM-DD'
  streak:       'br_streak',        // { count: number, lastDate: 'YYYY-MM-DD' }
  bestCatch:    'br_bestCatch',     // { fishName, rarity, points, date }
  totalPoints:  'br_totalPoints',   // cumulative number
  catchHistory: 'br_catchHistory',  // last 30 results (capped on save)
  playerId:     'br_playerId',      // UUID generated on first visit
  badges:       'br_badges',        // string[] of earned badge IDs
}
```

### Streak Rules
- On save: compare `lastPlayDate` to yesterday → increment; older → reset to 1; same day → no-op
- Streak milestones for badges: 7, 30, 100 days
- Copy framing: loss is possible but messaging stays encouraging

### Player ID
Random UUID (`crypto.randomUUID()`) generated on first visit. Stored permanently. Used as the hook point for a future Supabase user account — no sign-up friction in V1.

---

## 9. Screens & Components

### `SelectionStep` (reused 3×)
- Step indicator dots at top (filled = complete)
- 2-column card grid, last card centered if count is odd
- Each card: large emoji, name, flavor description
- Cast Style cards show risk indicator (🛡 Safe / ⚡ Risky)
- Tap selects (highlight ring) → Continue button appears
- Auto-advances after 300ms on Continue tap (feels snappy)

### `CastAnimation` (7 phases, ~8 seconds total)
Pure CSS animations driven by a `setTimeout` chain in `useEffect`. Scene elements built from CSS-styled divs and inline SVG — no images.

| Phase | Duration | Label |
|---|---|---|
| casting | 1500ms | "Casting…" |
| splash | 800ms | "Splash!" |
| waiting | 2500ms | "Waiting for a bite…" |
| tension | 800ms | "Something's on the line!" |
| hooked | 1000ms | "Fish hooked!" |
| reeling | 700ms | "Reeling in…" |
| done | — | → triggers result |

### `ResultCard` (3D flip reveal)
- Phase 1 (500ms pause): mystery card face-down, Buzzard Roost logo on back
- Phase 2 (800ms): `rotateY(180deg)` CSS transition reveals fish face
- Face: fish emoji (80px), name, rarity badge + pulsing glow, weight + points badges, italic flavor text
- Coupon slides up after flip: perforated CSS border, monospace code, reward label
- Buttons: "See Leaderboard" / "Shop Buzzard Roost →"

### `AlreadyPlayed`
- Today's catch shown (non-animated ResultCard)
- Live countdown: *"Your next cast drops in 14h 22m 09s"* (`setInterval` ticking)
- Streak display + encouraging copy
- "Shop Now" CTA

---

## 10. Retention & Virality

### Daily Return Hooks
- **Streak identity** — streak number shown on landing; flame emoji at 7 days, diamond at 30, gold glow at 100
- **Anticipation framing** — countdown reads *"Your next cast drops in…"* not *"Come back in…"*
- **Leaderboard FOMO** — landing screen shows today's top catch if player hasn't played yet
- **Living AlreadyPlayed screen** — water animation still plays; the game feels alive even locked

### Viral Hooks
- **One-tap share card** — `navigator.share()` on mobile, clipboard fallback on desktop
  ```
  🎣 I just landed a Legendary Golden Trout (88.4 lbs) on Buzzard Roost!
  Only 3% of anglers ever hook this beast. Beat my 2,050 pts →
  buzzardroost.com/cast  #BuzzardRoost #DailyCast
  ```
- **Friend challenge URL** — encodes result in query params; friend's landing screen shows their score to beat. Zero backend needed.
  ```
  buzzardroost.com/cast?challenge=golden_trout|legendary|2050
  ```
- **Rarity scarcity copy** — Legendary/Epic cards include *"Only X% of anglers ever catch this"* — makes sharing feel like bragging

### Achievement Badges (localStorage, silent unlock)
Shown as a small row below the fish card on the result screen. No interruptions.

| Badge | Trigger |
|---|---|
| 🎣 First Cast | Play for the first time |
| 🔥 On Fire | 7-day streak |
| 💎 Dedicated Angler | 30-day streak |
| 👑 Legend | 100-day streak |
| ⭐ First Rare | Catch any Rare+ fish |
| 🏆 Top 10 | Appear in daily top 10 |
| 🦈 Monster Hunter | Catch a Legendary fish |

---

## 11. V2 Expansion Points

Each marked in source with a comment block:

| Tag | Location | V2 Replacement |
|---|---|---|
| `// SHOPIFY: generate real discount code` | `gameLogic.js` | Shopify Admin API — create single-use discount code |
| `// SUPABASE: save result to database` | `storageManager.js` | Persist to `catches` table with `player_id` |
| `// SUPABASE: fetch real leaderboard` | `Leaderboard.jsx` | Live query replacing mock data |
| `// INTEGRITY V2: server-side validation` | `integrity.js` | Server-issued signed result token |
| `// AUTH V2: link playerId to user account` | `storageManager.js` | Supabase Auth or Shopify customer ID |

---

## 12. Deployment

Standard Vite static build. `vite.config.js` sets `base: './'` for correct asset paths on any host.

```bash
npm run build   # outputs /dist
```

Deploy `/dist` folder to Cloudflare Pages, Netlify, or Vercel — no server config required. All routing is client-side within the single `index.html`.
