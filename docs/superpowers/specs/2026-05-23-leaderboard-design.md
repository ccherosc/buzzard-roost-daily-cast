# Real Leaderboard Implementation Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mocked static leaderboard with a real Supabase-backed global leaderboard showing today's / this week's / all-time best catches, with anonymous player identity and inline name editing.

**Architecture:** React SPA calls Supabase REST API directly via the anon key. Two tables (`players`, `catches`). Catches submitted fire-and-forget after each cast. A Postgres stored function handles the best-per-player-per-period query. The upgrade path to server-side validation (Cloudflare Worker + service key) requires no schema changes.

**Tech Stack:** Supabase (Postgres + REST + RLS), `@supabase/supabase-js`, Vite env vars, React 18.

---

## 1. Supabase Tables

### `players`
| Column | Type | Constraints |
|---|---|---|
| `player_id` | `uuid` | PRIMARY KEY |
| `display_name` | `text` | NOT NULL, max 20 chars enforced client-side |
| `first_seen_at` | `timestamptz` | DEFAULT `now()` |
| `last_seen_at` | `timestamptz` | DEFAULT `now()` |

### `catches`
| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` |
| `player_id` | `uuid` | NOT NULL, REFERENCES `players(player_id)` |
| `fish_name` | `text` | NOT NULL |
| `rarity` | `text` | CHECK IN ('common','uncommon','rare','epic','legendary') |
| `weight_lbs` | `numeric(4,1)` | CHECK > 0 AND < 200 |
| `points` | `integer` | CHECK >= 0 AND <= 5000 |
| `spot_id` | `text` | |
| `lure_id` | `text` | |
| `cast_style_id` | `text` | |
| `caught_at` | `timestamptz` | DEFAULT `now()` |

The `CHECK` constraints on `rarity`, `weight_lbs`, and `points` are the baseline anti-cheat — invalid values are rejected at the database level regardless of what the client sends.

---

## 2. Row-Level Security Policies

Enable RLS on both tables. Apply these policies:

**`players` table:**
- `SELECT` — allow all (anon key) — public, anyone can read display names
- `INSERT` — allow all (anon key) — anyone can create a player record
- `UPDATE` — allow all (anon key) — *for now*; upgrade path locks this to matching player_id

**`catches` table:**
- `SELECT` — allow all (anon key) — public leaderboard reads
- `INSERT` — allow all (anon key) — *for now*; upgrade path restricts to Worker service key

---

## 3. Indexes

```sql
CREATE INDEX idx_catches_caught_at ON catches (caught_at DESC);
CREATE INDEX idx_catches_points    ON catches (points DESC);
CREATE INDEX idx_catches_player_id ON catches (player_id);
```

---

## 4. Leaderboard Postgres Function

A stored function handles the best-per-player-per-period query cleanly. The client calls it via `supabase.rpc('get_leaderboard', { period: 'today' })`.

```sql
CREATE OR REPLACE FUNCTION get_leaderboard(period TEXT)
RETURNS TABLE (
  player_id    UUID,
  display_name TEXT,
  fish_name    TEXT,
  rarity       TEXT,
  weight_lbs   NUMERIC,
  points       INTEGER,
  caught_at    TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
AS $$
  WITH best AS (
    SELECT DISTINCT ON (c.player_id)
      c.player_id,
      p.display_name,
      c.fish_name,
      c.rarity,
      c.weight_lbs,
      c.points,
      c.caught_at
    FROM catches c
    JOIN players p ON c.player_id = p.player_id
    WHERE
      CASE period
        WHEN 'today' THEN c.caught_at >= CURRENT_DATE
        WHEN 'week'  THEN c.caught_at >= date_trunc('week', NOW())
        ELSE TRUE
      END
    ORDER BY c.player_id, c.points DESC
  )
  SELECT * FROM best
  ORDER BY points DESC
  LIMIT 50
$$;
```

Each player appears once per period — their single best-scoring catch. `DISTINCT ON (player_id) ORDER BY player_id, points DESC` picks the highest-points row per player before the outer `ORDER BY points DESC` ranks them globally.

---

## 5. Player Identity

**Generation:** On first app load, call `crypto.randomUUID()` and store in `localStorage` as `brdc_player_id`. If the key already exists, reuse it. This is the player's permanent anonymous identity.

**Default name:** `Angler_` + the last 4 characters of the UUID (e.g. `Angler_a3f9`). Stored in `localStorage` as `brdc_display_name`.

**No modal, no prompt.** The name is set automatically. Players can rename themselves inline on the leaderboard at any time by tapping the `✏️` pencil icon on their highlighted row.

**Inline rename flow:**
1. Player taps pencil icon on their leaderboard row
2. Name text becomes a controlled `<input>` element, focused automatically
3. On Enter or blur: validate (non-empty, max 20 chars, alphanumeric + underscores + spaces), upsert `players` table, update `localStorage`
4. Row returns to normal display with the new name

---

## 6. Submission Flow

After each cast completes, two things happen in sequence — localStorage first, Supabase second:

```
handleCastComplete(finalResult)
  → recordCastResult(finalResult)     // localStorage — unchanged, sync
  → submitCatch(finalResult)          // Supabase — async, fire-and-forget
```

**`submitCatch(result)`** in `src/utils/leaderboardApi.js`:
1. Upsert `players` row: `{ player_id, display_name, last_seen_at: now() }` — creates on first catch, updates timestamp on subsequent ones
2. Insert `catches` row: all catch fields plus `player_id` and `caught_at`
3. Entire function wrapped in `try/catch` — any Supabase error is swallowed silently. The game never shows an error to the player for a failed submission.

**Offline / failure behavior:** localStorage save already happened. The catch is not lost. Supabase will simply not have that catch recorded. This is acceptable for a free-to-play game — it's better than surfacing a network error during a game session.

---

## 7. Environment Variables

Two Vite env vars, set in `.env` locally and in the Cloudflare Pages dashboard for production:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The anon key is intentionally public — it is designed to be exposed in browser code. RLS policies are the security boundary, not key secrecy.

A `.env.example` file (committed to git) documents the required variables. `.env` itself is gitignored.

---

## 8. New and Modified Files

**New files:**
- `src/utils/supabase.js` — Supabase client singleton, reads from `import.meta.env`
- `src/utils/leaderboardApi.js` — `submitCatch(result)`, `fetchLeaderboard(period)`, `renamePlayer(displayName)`
- `.env.example` — documents required env vars

**Modified files:**
- `src/utils/storageManager.js` — call `submitCatch()` after `recordCastResult()` in `handleCastComplete` flow (actually called from `App.jsx`, not storageManager — see below)
- `src/App.jsx` — pass `playerId` to `<Leaderboard>`, call `submitCatch()` inside `handleCastComplete`
- `src/components/Leaderboard.jsx` — full rewrite: real data, three tabs, loading skeletons, inline rename
- `src/components/Leaderboard.css` — tab styles, skeleton animation, inline edit input styles
- `.gitignore` — add `.env`

**Supabase dashboard (not code):**
- Create project
- Create `players` and `catches` tables with constraints
- Enable RLS and apply policies
- Create indexes
- Create `get_leaderboard` function

---

## 9. Leaderboard UI Spec

**Tabs:** TODAY | THIS WEEK | ALL-TIME — active tab underlined in amber. Tab switch fetches the relevant period; results cached in component state so back-switching is instant.

**Row layout:** `#rank  display_name [✏️]  fish_name [rarity badge]  weight  points`

**Player's own row:** highlighted with `background: rgba(232,168,76,0.10)` and `border-left: 3px solid var(--brand-accent)`. The `✏️` icon appears only on the player's row.

**Loading state:** 5 skeleton rows — grey animated bars at 30%, 60%, 20%, 45%, 15% widths. No spinner. Appears for up to 2 seconds before showing data.

**Empty state:** "No casts recorded yet — be first." with the cast button if the game hasn't been played today.

**Error state:** Single muted line — "Leaderboard unavailable right now." No error details shown to the player.

---

## 10. Upgrade Path to Secure Submissions

When ready to lock down submissions:

1. Create a Cloudflare Worker (or Supabase Edge Function)
2. Worker receives the catch payload, validates score ranges and rarity server-side, inserts using the Supabase **service key** (never in the browser)
3. Update RLS: revoke `INSERT` on `catches` from the anon key — only the service key can insert
4. Update `leaderboardApi.js`: change `submitCatch()` to `POST /api/submit-catch` instead of calling Supabase directly
5. Leaderboard reads (`fetchLeaderboard`) do not change — they still use the anon key directly

**Schema does not change. Leaderboard display does not change. Only the write path changes.**

---

## 11. Out of Scope for This Implementation

- Email / social auth (future)
- Coupon validation backend (separate spec)
- Weekly tournament prizes (future)
- Admin moderation of display names (future)
- Rate limiting (handled in upgrade path)
