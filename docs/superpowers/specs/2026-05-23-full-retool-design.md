# Buzzard Roost Daily Cast — Full Retool Design Spec
**Date:** 2026-05-23  
**Status:** APPROVED — Ready for implementation planning  
**Approach:** Full coordinated retool (Approach 3 — everything ships together)

---

## Decisions Made (All Approved)

| Topic | Decision |
|---|---|
| Visual theme | **Outdoor Rugged** — dark forest greens, warm browns, earthy amber (#e8a84c), cream text (#f0e8d0) |
| Selection screen | **Option C** — scene visualization at top for spot, icon rows for lure + cast style, all on one screen |
| Choice → gameplay | **Approved** — selections affect minigame mechanics, not just rarity weights |
| Mascot role | **Option A** — TModel2 guides the full session; Snowball owns the Already Played screen |
| Build approach | **Approach 3** — full coordinated retool, all pieces designed and shipped together |

---

## 1. Visual System (Outdoor Rugged)

### Color Palette
- Background deep: `#0f1a0d`
- Background card: `#1a2c1a`
- Background surface: `#2d1f0e`
- Accent gold: `#e8a84c`
- Accent green: `#7ab84a`
- Text primary: `#f0e8d0`
- Text secondary: `#a09070`
- Border subtle: `#3a5a28`
- Border accent: `#4a7c2f`

### Typography
- Keep existing: **Oswald** (headings, labels, scores) + **Nunito** (body, flavor text)

### Logo
- `assets/reference/buzzardroostlogo.avif` replaces the 🦅 emoji in the Header
- Displayed at appropriate size in header bar

### Mascots (pixel art characters)
- `assets/reference/Mascot_TModel2.png` — flannel shirt, on dock
- `assets/reference/Mascot_Snowball.png` — overalls, rocking chair

---

## 2. New Selection Screen (replaces 3 separate screens)

**Layout: Option C — Scene + Rows**

### Structure (single scrollable card, fits on one phone screen)
1. **Scene strip at top** — horizontal row of 5 spot icons, selected one is centered and highlighted with amber border + label. Others dimmed. Tapping selects.
2. **Lure row** — 5 icon chips in a row, same tap-to-select interaction.
3. **Cast style row** — 4 icon chips.
4. **Live odds bar** — thin bar showing Common / Rare / Epic+ probability. Updates instantly on every selection change.
5. **Risk meter** — single bar from Safe → Risky, updates with combo.
6. **TModel2 reaction line** — short contextual quip that changes based on the combo (e.g., "Mystery lure + deep water? Bold move." / "Dock + worm — classic. Can't go wrong."). 6–8 curated lines covering key combos + a default.
7. **CTA button** — `🎣 CAST #1` (or `CAST #2`, `CAST #3` for subsequent casts — spot/lure persist, only cast style re-picks each cast)

### Interaction rules
- Spot and lure persist across all 3 casts in a session (chosen once on cast 1)
- Cast style is re-selected before each cast (only the cast row resets between casts)
- All three must be selected before CTA activates

---

## 3. Choice → Gameplay Connection (NEW)

This is the core new system. Each selection modifies the minigame parameters passed into the component.

### CastMeter
| Selection | Effect |
|---|---|
| Safe Cast | Slow oscillation (DURATION_MS = 2000), wide sweet zone (0.36) |
| Precision Cast | Medium speed (1400ms), standard zone (0.28) |
| Power Cast | Fast (1100ms), standard zone (0.28) |
| Risky Cast | Very fast (900ms), narrow zone (0.20) |
| Worm lure | +0.04 to sweet zone width (forgiving) |
| Mystery Lure | -0.06 to sweet zone width (tiny target) |
| Dock spot | Sweet zone centered (no offset) |
| Deep Water spot | Sweet zone offset 15% from center (harder) |

### BiteTiming
| Selection | Effect |
|---|---|
| Frog lure | WAIT_MIN=400ms, WAIT_MAX=1200ms (fast strike) |
| Worm lure | WAIT_MIN=2500ms, WAIT_MAX=5500ms (slow sniff) |
| Mystery Lure | WAIT_MIN=200ms, WAIT_MAX=6000ms (totally random) |
| Other lures | WAIT_MIN=1500ms, WAIT_MAX=4000ms (default) |
| Dock spot | WINDOW_MS=1000 (generous) |
| Reeds spot | WINDOW_MS=550 (fish spits hook fast) |
| Deep Water | WINDOW_MS=700 |
| Other spots | WINDOW_MS=800 (default) |
| Precision Cast | Show pre-bite ripple animation cue 400ms before bite |
| Risky Cast | No pre-bite warning at all |
| Other casts | Default behavior |

### FightMeter (major overhaul)
**Core problem:** DRIFT_RATE=0.0012/ms means line breaks in ~541ms without tapping. Far too fast.

**New base parameters:**
- `FIGHT_DURATION_MS = 8000` (up from 6000)
- `DRIFT_RATE = 0.00015` (down from 0.0012 — takes ~4.3s to break without tapping)
- `REEL_POWER = 0.12` (down from 0.15 — each tap less powerful, more sustained effort)
- `SAFE_MAX = 0.65` (unchanged)
- `BREAK_MAX = 0.95` (unchanged)

**New surge system** — fish "runs" create excitement:
- `SURGE_INTERVAL_MIN = 2000ms`, `SURGE_INTERVAL_MAX = 4000ms`
- `SURGE_AMOUNT` varies by rarity: common=0.10, uncommon=0.14, rare=0.18, epic=0.22, legendary=0.28
- Surge shows visual flash + "Fish is running!" label
- Surge tracked in ref, fires randomly within interval range

**Choice modifiers:**
| Selection | Effect |
|---|---|
| Common fish | DRIFT_RATE=0.00010, surge amount=0.10 |
| Uncommon | DRIFT_RATE=0.00013, surge amount=0.14 |
| Rare | DRIFT_RATE=0.00016, surge amount=0.18 |
| Epic | DRIFT_RATE=0.00020, surge amount=0.22 |
| Legendary | DRIFT_RATE=0.00026, surge amount=0.28 |
| Dock spot | SURGE_INTERVAL_MIN=3000 (fewer surges) |
| Deep Water | SURGE_INTERVAL_MIN=1500 (more dives/runs) |
| Rocky Bank | SURGE_INTERVAL_MIN=1200 (constant pulls) |
| Frog lure | Starting tension=0.45 (fish hits hard) |
| Worm lure | Starting tension=0.20 (gentle hook-up) |
| Other lures | Starting tension=0.30 (default) |

**How rarity is passed in:** `baseResult.rarity` is available in `DailyCastGame` before gameplay starts — pass it as a prop to `FightMeter`.

---

## 4. Minigame Screen Real Estate

All three minigames should fill the full usable viewport height, not be constrained to a small card. Changes:
- Remove fixed max-height on `.dcg__content`
- Minigame components use `min-height: 100dvh` minus header/cast-bar height (approx `calc(100dvh - 80px)`)
- Touch targets are minimum 56px tall
- CastMeter bar is wider (full card width with 16px padding)
- FightMeter tension track is taller (12px instead of 6px)
- BiteTiming bobber scene fills more vertical space

---

## 5. TModel2 Mascot Integration

### Placement
- **Setup screen:** Small (80px tall) TModel2 sprite bottom-left of screen, speech bubble with reaction quip
- **Catch reveal:** Large (140px tall) TModel2 appears beside the fish card, rarity-appropriate reaction

### Reaction lines (setup screen — combo-based)
```
mysteryLure + deepWater + riskyCast → "Mystery lure + deep water + risky cast? Either a genius or a fool."
mysteryLure → "Mystery lure? Nobody knows what that thing is."
riskyCast + deepWater → "Deep water risky cast... I like the ambition."  
dock + worm + safeCast → "Dock + worm. Classic. Nothing wrong with that."
frog → "Frog lure. Good choice — they can't resist it."
default → "Alright, let's see what's biting today."
```

### Reaction lines (catch reveal — rarity-based)
```
legendary → "NO WAY. I've fished this lake 30 years and never seen one of those."
epic → "Now THAT is a fish. Get the camera."
rare → "Nice. Real nice. That one's a keeper."
uncommon → "Not bad. Solid catch."
common → "Fish is fish. We'll get 'em next cast."
```

### Snowball (Already Played screen)
- Snowball sprite shown in rocking chair
- Static — no animation needed
- Line: `"${streak}-day streak. Come back tomorrow and don't break it."` (if streak > 0)
- Default: `"All three casts done. See you tomorrow."`

---

## 6. Files to Create / Modify

### New files
- `src/utils/gameParams.js` — `buildGameParams(spot, lure, castStyle, rarity)` returns `{ castMeter, biteTiming, fightMeter }` config objects
- `src/utils/mascotLines.js` — combo-based and rarity-based reaction line lookup functions
- `src/components/MascotQuip.jsx` + `MascotQuip.css` — reusable speech bubble + sprite component

### Modified files
- `src/App.jsx` — remove spot/lure selection between casts (they persist); only re-show cast style screen
- `src/App.css` — Outdoor Rugged color system (CSS custom properties)
- `src/index.css` — global token updates
- `src/components/SelectionStep.jsx` → **replaced** by `src/components/SetupScreen.jsx` (new one-screen component)
- `src/components/SetupScreen.css` — new
- `src/components/CastMeter.jsx` — accept `config` prop, use dynamic params
- `src/components/CastMeter.css` — larger bar, rugged theme
- `src/components/BiteTiming.jsx` — accept `config` prop, use dynamic params
- `src/components/BiteTiming.css` — larger scene, rugged theme
- `src/components/FightMeter.jsx` — major overhaul, surge system, accept `config` prop
- `src/components/FightMeter.css` — taller track, rugged theme
- `src/components/CatchReveal.jsx` — add TModel2 reaction
- `src/components/CatchReveal.css` — rugged theme
- `src/components/LandingScreen.jsx` — logo + TModel2 welcome, rugged theme
- `src/components/LandingScreen.css` — rugged theme
- `src/components/AlreadyPlayed.jsx` — Snowball sprite + line
- `src/components/AlreadyPlayed.css` — rugged theme
- `src/components/Header.jsx` — logo image instead of emoji
- `src/components/Header.css` — rugged theme
- `src/components/ResultCard.jsx` — rugged theme
- `src/components/DailyCastGame.jsx` — pass `rarity` to FightMeter, pass `config` props to all three minigames
- `src/config/gameConfig.js` — set `DEV_DISABLE_DAILY_LIMIT = false`

### Unchanged
- `src/utils/gameLogic.js` — no changes needed
- `src/utils/storageManager.js` — no changes needed
- `src/utils/integrity.js` — no changes needed
- `src/data/fishData.js` — no changes needed
- `src/data/gameData.js` — no changes needed (spot/lure/cast data stays)
- All test files — no changes needed (logic untouched)

---

## 7. What "Addictive" Means Specifically

- **Live odds feedback** on setup screen makes every combo feel like a decision with stakes
- **Surge system** in FightMeter creates tension spikes — the game breathes instead of being a flat meter
- **TModel2 quips** make each catch feel witnessed and personal
- **Cast style re-pick** between casts (spot/lure persist) gives a micro-decision each round without re-doing everything
- **Risk/reward legibility** — players can see they're trading minigame difficulty for better rarity odds

---

## Next Step

Run the `writing-plans` skill to generate a step-by-step implementation plan from this spec.
