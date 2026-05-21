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
