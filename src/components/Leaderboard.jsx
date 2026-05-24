// src/components/Leaderboard.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchLeaderboard, renamePlayer, getDisplayName } from '../utils/leaderboardApi.js';
import { getPlayerId } from '../utils/storageManager.js';
import './Leaderboard.css';

const TABS = [
  { key: 'today',   label: 'Today'     },
  { key: 'week',    label: 'This Week' },
  { key: 'alltime', label: 'All-Time'  },
];

// Skeleton widths for the name column (one row each)
const SKELETON_WIDTHS = ['30%', '60%', '20%', '45%', '15%'];

function SkeletonRow({ nameWidth }) {
  return (
    <div className="lb__row lb__row--skeleton" aria-hidden="true">
      <div className="lb__skel lb__skel--rank" />
      <div className="lb__skel lb__skel--name" style={{ width: nameWidth }} />
      <div className="lb__skel lb__skel--fish" />
      <div className="lb__skel lb__skel--pts" />
    </div>
  );
}

export default function Leaderboard({ playerId }) {
  const [activeTab,    setActiveTab]    = useState('today');
  const [rows,         setRows]         = useState(null);   // null = not yet loaded
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(false);
  const [editingName,  setEditingName]  = useState(false);
  const [editValue,    setEditValue]    = useState('');
  const [displayName,  setDisplayName]  = useState(() => getDisplayName());

  // Cache fetched tab results so back-switching is instant
  const cacheRef = useRef({ today: null, week: null, alltime: null });

  const loadTab = useCallback(async (tab) => {
    if (cacheRef.current[tab] !== null) {
      setRows(cacheRef.current[tab]);
      return;
    }
    setLoading(true);
    setError(false);
    const data = await fetchLeaderboard(tab);
    if (data === null) {
      setLoading(false);
      setError(true);
      return;
    }
    cacheRef.current[tab] = data;
    setRows(data);
    setLoading(false);
  }, []);

  // Load initial tab on mount
  useEffect(() => { loadTab('today'); }, [loadTab]);

  function switchTab(tab) {
    setActiveTab(tab);
    loadTab(tab);
  }

  function startEdit() {
    setEditValue(displayName);
    setEditingName(true);
  }

  async function commitRename() {
    if (!editingName) return;   // guard: Enter fires onBlur immediately after — skip second call
    const trimmed = editValue.trim();
    setEditingName(false);
    if (!trimmed || trimmed === displayName) return;

    const ok = await renamePlayer(trimmed);
    if (ok) {
      setDisplayName(trimmed);
      // Invalidate current tab cache so next view shows updated name
      cacheRef.current[activeTab] = null;
      loadTab(activeTab);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter')  commitRename();
    if (e.key === 'Escape') setEditingName(false);
  }

  // ── Render ────────────────────────────────────────────────────
  const currentPlayerId = playerId ?? getPlayerId();

  return (
    <div className="lb">
      {/* Header */}
      <div className="lb__header">
        <h3 className="lb__title">Leaderboard</h3>
      </div>

      {/* Tabs */}
      <div className="lb__tabs" role="tablist">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            className={`lb__tab ${activeTab === key ? 'lb__tab--active' : ''}`}
            onClick={() => switchTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="lb__list">
        {/* Loading skeleton */}
        {loading && SKELETON_WIDTHS.map((w, i) => (
          <SkeletonRow key={i} nameWidth={w} />
        ))}

        {/* Error state */}
        {!loading && error && (
          <p className="lb__empty lb__empty--error">Leaderboard unavailable right now.</p>
        )}

        {/* Empty state */}
        {!loading && !error && rows !== null && rows.length === 0 && (
          <p className="lb__empty">No casts recorded yet — be first.</p>
        )}

        {/* Rows */}
        {!loading && !error && rows !== null && rows.map((row, i) => {
          const isPlayer = row.player_id === currentPlayerId;
          const weightLbs = parseFloat(row.weight_lbs);

          return (
            <div
              key={row.player_id}
              className={`lb__row ${isPlayer ? 'lb__row--player' : ''}`}
            >
              {/* Rank */}
              <span className="lb__rank">#{i + 1}</span>

              {/* Name (editable for own row) */}
              <span className="lb__name-cell">
                {isPlayer && editingName ? (
                  <input
                    className="lb__rename-input"
                    value={editValue}
                    maxLength={20}
                    autoFocus
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={commitRename}
                    aria-label="Rename yourself"
                  />
                ) : (
                  <>
                    <span className="lb__name">
                      {isPlayer ? displayName : row.display_name}
                    </span>
                    {isPlayer && (
                      <button
                        className="lb__pencil"
                        onClick={startEdit}
                        aria-label="Edit display name"
                      >✏️</button>
                    )}
                  </>
                )}
              </span>

              {/* Fish + rarity + weight */}
              <span className="lb__fish">
                {row.fish_name}
                <span className={`rarity-badge rarity-badge--${row.rarity}`}>
                  {row.rarity}
                </span>
                <span className="lb__weight">{weightLbs.toFixed(1)} lbs</span>
              </span>

              {/* Points */}
              <span className="lb__pts">{row.points.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
