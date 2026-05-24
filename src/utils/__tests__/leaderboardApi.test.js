// @vitest-environment jsdom
// src/utils/__tests__/leaderboardApi.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted — this runs before any imports
vi.mock('../supabase.js', () => ({
  supabase: {
    from: vi.fn(),
    rpc:  vi.fn(),
  },
}));

import { supabase }                                        from '../supabase.js';
import { getDisplayName, submitCatch, fetchLeaderboard, renamePlayer }
  from '../leaderboardApi.js';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ── getDisplayName ──────────────────────────────────────────────
describe('getDisplayName', () => {
  it('generates Angler_XXXX from the last 4 chars of player_id', () => {
    localStorage.setItem('br_playerId', 'aaaabbbb-cccc-dddd-eeee-ffff00001234');
    const name = getDisplayName();
    expect(name).toBe('Angler_1234');
  });

  it('returns already-stored display name without changing it', () => {
    localStorage.setItem('brdc_display_name', 'FishingPro');
    const name = getDisplayName();
    expect(name).toBe('FishingPro');
  });

  it('persists generated name to brdc_display_name key', () => {
    localStorage.setItem('br_playerId', 'aaaabbbb-cccc-dddd-eeee-ffffabcdwxyz');
    getDisplayName();
    expect(localStorage.getItem('brdc_display_name')).toMatch(/^Angler_/);
  });
});

// ── submitCatch ─────────────────────────────────────────────────
describe('submitCatch', () => {
  const fakeResult = {
    fishName: 'Bass', rarity: 'common', weight: 2.5, points: 150,
    spot: 'dock', lure: 'worm', castStyle: 'safeCast',
  };

  beforeEach(() => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    supabase.from.mockReturnValue({ upsert: upsertMock, insert: insertMock });
    localStorage.setItem('br_playerId', 'test-player-0000-0000-00001234');
  });

  it('calls from("players").upsert and from("catches").insert', async () => {
    await submitCatch(fakeResult);
    expect(supabase.from).toHaveBeenCalledWith('players');
    expect(supabase.from).toHaveBeenCalledWith('catches');
    const fromReturn = supabase.from.mock.results[0].value;
    expect(fromReturn.upsert).toHaveBeenCalled();
    const fromReturn2 = supabase.from.mock.results[1].value;
    expect(fromReturn2.insert).toHaveBeenCalled();
  });

  it('includes correct catch fields in insert payload', async () => {
    await submitCatch(fakeResult);
    const insertCall = supabase.from.mock.results[1].value.insert.mock.calls[0][0];
    expect(insertCall).toMatchObject({
      fish_name:     'Bass',
      rarity:        'common',
      weight_lbs:    2.5,
      points:        150,
      spot_id:       'dock',
      lure_id:       'worm',
      cast_style_id: 'safeCast',
    });
  });

  it('swallows thrown network errors silently', async () => {
    supabase.from.mockReturnValue({
      upsert: vi.fn().mockRejectedValue(new Error('network timeout')),
      insert: vi.fn(),
    });
    await expect(submitCatch(fakeResult)).resolves.toBeUndefined();
  });

  it('swallows Supabase error responses silently', async () => {
    supabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: { message: 'RLS violation' } }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    await expect(submitCatch(fakeResult)).resolves.toBeUndefined();
  });
});

// ── fetchLeaderboard ────────────────────────────────────────────
describe('fetchLeaderboard', () => {
  const mockRows = [
    {
      player_id:    'uuid-0001',
      display_name: 'Angler_1234',
      fish_name:    'Trophy Bass',
      rarity:       'epic',
      weight_lbs:   '8.2',
      points:       1200,
      caught_at:    '2026-05-23T10:00:00Z',
    },
  ];

  it('returns rows array from RPC on success', async () => {
    supabase.rpc.mockResolvedValue({ data: mockRows, error: null });
    const result = await fetchLeaderboard('today');
    expect(result).toEqual(mockRows);
  });

  it('calls rpc with correct function name and period', async () => {
    supabase.rpc.mockResolvedValue({ data: [], error: null });
    await fetchLeaderboard('today');
    expect(supabase.rpc).toHaveBeenCalledWith('get_leaderboard', { period: 'today' });
    await fetchLeaderboard('week');
    expect(supabase.rpc).toHaveBeenCalledWith('get_leaderboard', { period: 'week' });
    await fetchLeaderboard('alltime');
    expect(supabase.rpc).toHaveBeenCalledWith('get_leaderboard', { period: 'alltime' });
  });

  it('returns null when RPC returns an error', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'function not found' } });
    const result = await fetchLeaderboard('today');
    expect(result).toBeNull();
  });

  it('returns null when RPC throws (network failure)', async () => {
    supabase.rpc.mockRejectedValue(new Error('offline'));
    const result = await fetchLeaderboard('today');
    expect(result).toBeNull();
  });

  it('returns [] when data is null with no error', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });
    const result = await fetchLeaderboard('today');
    expect(result).toEqual([]);
  });
});

// ── renamePlayer ────────────────────────────────────────────────
describe('renamePlayer', () => {
  beforeEach(() => {
    supabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    });
    localStorage.setItem('br_playerId', 'test-player-0000-0000-00001234');
  });

  it('returns true and saves name to localStorage on success', async () => {
    const result = await renamePlayer('CoolAngler');
    expect(result).toBe(true);
    expect(localStorage.getItem('brdc_display_name')).toBe('CoolAngler');
  });

  it('trims whitespace before saving', async () => {
    const result = await renamePlayer('  FishPro  ');
    expect(result).toBe(true);
    expect(localStorage.getItem('brdc_display_name')).toBe('FishPro');
  });

  it('returns false for empty string', async () => {
    expect(await renamePlayer('')).toBe(false);
  });

  it('returns false for whitespace-only string', async () => {
    expect(await renamePlayer('   ')).toBe(false);
  });

  it('returns false for name longer than 20 chars', async () => {
    expect(await renamePlayer('a'.repeat(21))).toBe(false);
  });

  it('allows exactly 20 chars', async () => {
    expect(await renamePlayer('a'.repeat(20))).toBe(true);
  });

  it('returns false for name with < > or special injection chars', async () => {
    expect(await renamePlayer('hax<script>')).toBe(false);
    expect(await renamePlayer('DROP TABLE;')).toBe(false);
  });

  it('allows alphanumeric, underscores, and spaces', async () => {
    expect(await renamePlayer('Cool Angler_99')).toBe(true);
  });

  it('returns false when Supabase returns an error', async () => {
    supabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: { message: 'rls violation' } }),
    });
    const result = await renamePlayer('ValidName');
    expect(result).toBe(false);
  });

  it('does not update localStorage when Supabase errors', async () => {
    supabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: { message: 'rls violation' } }),
    });
    localStorage.setItem('brdc_display_name', 'OldName');
    await renamePlayer('NewName');
    expect(localStorage.getItem('brdc_display_name')).toBe('OldName');
  });
});
