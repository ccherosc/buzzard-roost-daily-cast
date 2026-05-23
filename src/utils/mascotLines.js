// src/utils/mascotLines.js
// Mascot reaction lines for the setup screen (combo-based) and catch reveal (rarity-based).

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
