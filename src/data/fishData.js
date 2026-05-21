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
    { id: 'golden_trout',     name: 'Golden Trout',        emoji: '🌟', rarity: 'legendary', weightMin: 50.0,  weightMax: 120.0, flavor: 'A fish of pure legend. Anglers spend lifetimes chasing this ghost.' },
    { id: 'ancient_sturgeon', name: 'Ancient Sturgeon',    emoji: '🦕', rarity: 'legendary', weightMin: 80.0,  weightMax: 180.0, flavor: 'Prehistoric. It was here before humans were. Show some respect.' },
    { id: 'albino_catfish',   name: 'Albino Catfish',      emoji: '👻', rarity: 'legendary', weightMin: 60.0,  weightMax: 140.0, flavor: 'White as bone. Eyes like rubies. Zero people will believe you.' },
    { id: 'buzzard_monster',  name: 'The Buzzard Monster', emoji: '🦅', rarity: 'legendary', weightMin: 100.0, weightMax: 200.0, flavor: 'The one the locals whisper about. Caught only once. Now twice.' },
  ],
};

// Flat array of all fish, useful for validation
export const ALL_FISH = Object.values(FISH_DATABASE).flat();

// Look up a fish by id
export function getFishById(id) {
  return ALL_FISH.find(f => f.id === id) ?? null;
}
