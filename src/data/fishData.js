// src/data/fishData.js
// 22 fish across 5 rarity tiers.
// weightMin / weightMax are in pounds.
// Emoji rules: each emoji is unique and directly represents either
//   (a) the fish's body shape/colour, or
//   (b) its single most recognisable characteristic.
// Cross-rarity duplicates are acceptable (context differs); same-rarity
// duplicates are avoided so the result card is always visually distinct.

export const FISH_DATABASE = {
  // ── Common ───────────────────────────────────────────────────────
  // Small, familiar panfish — all visually distinct from each other.
  common: [
    {
      id: 'bluegill',
      name: 'Bluegill',
      emoji: '🐟',           // generic small fish — the classic "first catch"
      rarity: 'common',
      weightMin: 0.2, weightMax: 1.5,
      flavor: "Scrappy little fighter. Every angler's first catch.",
    },
    {
      id: 'sunfish',
      name: 'Sunfish',
      emoji: '🌞',           // named for the sun — round, golden, sun-themed
      rarity: 'common',
      weightMin: 0.1, weightMax: 1.2,
      flavor: 'Flash of gold in shallow water. Classic.',
    },
    {
      id: 'yellow_perch',
      name: 'Yellow Perch',
      emoji: '🐠',           // colourful striped body — tropical fish emoji matches
      rarity: 'common',
      weightMin: 0.3, weightMax: 2.0,
      flavor: "Schooling fish. Where there's one, there's more.",
    },
    {
      id: 'crappie',
      name: 'Crappie',
      emoji: '🐡',           // deep, round body shape matches the puffer silhouette
      rarity: 'common',
      weightMin: 0.2, weightMax: 2.5,
      flavor: 'Light bite, great table fare.',
    },
    {
      id: 'rock_bass',
      name: 'Rock Bass',
      emoji: '🪨',           // lives in rocky structure — instantly distinct
      rarity: 'common',
      weightMin: 0.2, weightMax: 1.8,
      flavor: 'Tough as nails and full of attitude.',
    },
  ],

  // ── Uncommon ─────────────────────────────────────────────────────
  // Sought-after sport fish — each has a signature trait for its emoji.
  uncommon: [
    {
      id: 'largemouth_bass',
      name: 'Largemouth Bass',
      emoji: '🐟',           // the quintessential bass silhouette
      rarity: 'uncommon',
      weightMin: 1.5, weightMax: 8.0,
      flavor: 'The bread and butter of bass fishing.',
    },
    {
      id: 'smallmouth_bass',
      name: 'Smallmouth Bass',
      emoji: '🐡',           // compact, deep-bodied — rounder than largemouth
      rarity: 'uncommon',
      weightMin: 1.0, weightMax: 6.0,
      flavor: 'Pound for pound the hardest fighter in freshwater.',
    },
    {
      id: 'walleye',
      name: 'Walleye',
      emoji: '👁️',           // famous for glassy, reflective "wall" eyes
      rarity: 'uncommon',
      weightMin: 1.5, weightMax: 10.0,
      flavor: 'Ghost of the deep. Marble-eyed predator.',
    },
    {
      id: 'channel_catfish',
      name: 'Channel Catfish',
      emoji: '🐱',           // catFISH — whiskers like a cat, iconic association
      rarity: 'uncommon',
      weightMin: 2.0, weightMax: 12.0,
      flavor: "Bottom feeder. No shame in that game.",
    },
    {
      id: 'carp',
      name: 'Carp',
      emoji: '🎏',           // koi/carp streamer — literally depicts a carp
      rarity: 'uncommon',
      weightMin: 3.0, weightMax: 15.0,
      flavor: 'Underrated. Fights like a freight train.',
    },
  ],

  // ── Rare ─────────────────────────────────────────────────────────
  // Trophy-grade fish — distinct shapes and legendary status.
  rare: [
    {
      id: 'rainbow_trout',
      name: 'Rainbow Trout',
      emoji: '🌈',           // named for the rainbow stripe along its side
      rarity: 'rare',
      weightMin: 5.0, weightMax: 20.0,
      flavor: 'A streak of color in cold water. Breathtaking.',
    },
    {
      id: 'striped_bass',
      name: 'Striped Bass',
      emoji: '🐠',           // bold horizontal stripes — matches the tropical fish silhouette
      rarity: 'rare',
      weightMin: 8.0, weightMax: 25.0,
      flavor: 'The silver king of rivers. A serious trophy.',
    },
    {
      id: 'northern_pike',
      name: 'Northern Pike',
      emoji: '🗡️',           // "pike" is also a long spear — fast, lance-like body
      rarity: 'rare',
      weightMin: 5.0, weightMax: 22.0,
      flavor: 'Ambush predator. Strikes like lightning.',
    },
    {
      id: 'muskie',
      name: 'Muskie',
      emoji: '🦈',           // apex freshwater predator — shark-level aggression
      rarity: 'rare',
      weightMin: 10.0, weightMax: 30.0,
      flavor: 'The fish of ten thousand casts.',
    },
  ],

  // ── Epic ─────────────────────────────────────────────────────────
  // Monster fish — each has an unmistakable defining feature.
  epic: [
    {
      id: 'trophy_bass',
      name: 'Trophy Bass',
      emoji: '🏆',           // wall-worthy — you will literally hang this on a wall
      rarity: 'epic',
      weightMin: 20.0, weightMax: 45.0,
      flavor: "Wall-worthy. You'll be telling this story for years.",
    },
    {
      id: 'giant_catfish',
      name: 'Giant Catfish',
      emoji: '😾',           // giant catfish face — heavy whiskers, grumpy ancient expression
      rarity: 'epic',
      weightMin: 25.0, weightMax: 60.0,
      flavor: "Ancient bottom dweller. Older than your grandpa.",
    },
    {
      id: 'tiger_muskie',
      name: 'Tiger Muskie',
      emoji: '🐯',           // named for tiger-stripe markings — unmistakable
      rarity: 'epic',
      weightMin: 18.0, weightMax: 50.0,
      flavor: 'Hybrid predator. Rare and ravenous.',
    },
    {
      id: 'alligator_gar',
      name: 'Alligator Gar',
      emoji: '🐊',           // named for its alligator-like armoured snout — perfect match
      rarity: 'epic',
      weightMin: 30.0, weightMax: 60.0,
      flavor: 'Living fossil. Over 100 million years in the making.',
    },
  ],

  // ── Legendary ────────────────────────────────────────────────────
  // Once-in-a-lifetime catches — mythic status, unique visual identity.
  legendary: [
    {
      id: 'golden_trout',
      name: 'Golden Trout',
      emoji: '✨',           // pure gold shimmer — rarer than gold itself
      rarity: 'legendary',
      weightMin: 50.0, weightMax: 120.0,
      flavor: 'A fish of pure legend. Anglers spend lifetimes chasing this ghost.',
    },
    {
      id: 'ancient_sturgeon',
      name: 'Ancient Sturgeon',
      emoji: '🦕',           // sturgeon predate the dinosaurs — bony, prehistoric body
      rarity: 'legendary',
      weightMin: 80.0, weightMax: 180.0,
      flavor: 'Prehistoric. It was here before humans were. Show some respect.',
    },
    {
      id: 'albino_catfish',
      name: 'Albino Catfish',
      emoji: '👻',           // chalk-white, translucent — ghostly and legendary
      rarity: 'legendary',
      weightMin: 60.0, weightMax: 140.0,
      flavor: "White as bone. Eyes like rubies. Zero people will believe you.",
    },
    {
      id: 'buzzard_monster',
      name: 'The Buzzard Monster',
      emoji: '🦅',           // the buzzard eagle — the creature the lake is named for
      rarity: 'legendary',
      weightMin: 100.0, weightMax: 200.0,
      flavor: 'The one the locals whisper about. Caught only once. Now twice.',
    },
  ],
};

// Flat array — rarity is derived from the array key to prevent drift
export const ALL_FISH = Object.freeze(
  Object.entries(FISH_DATABASE).flatMap(([rarity, fish]) =>
    fish.map(f => ({ ...f, rarity }))
  )
);

// Look up a fish by id
export function getFishById(id) {
  return ALL_FISH.find(f => f.id === id) ?? null;
}
