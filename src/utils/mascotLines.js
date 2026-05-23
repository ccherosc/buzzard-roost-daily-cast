// src/utils/mascotLines.js
// Progressive mascot commentary for TModel2 (setup screen) and Snowball (results).
// Quips flow: spot only → spot+lure → full combo (spot+lure+cast).

// ─────────────────────────────────────────────────────────────────────────────
// SPOT-ONLY quips (shown right after spot is selected)
// ─────────────────────────────────────────────────────────────────────────────
const SPOT_QUIPS = {
  dock:       "Dock's a solid start. Calm water, consistent bites. Nothing crazy, but nothing bad either.",
  reeds:      "Bass sit in those reeds all day just waiting. Get close, cast clean, don't spook 'em.",
  fallenTree: "That fallen tree. Big fish love structure like that — shade, shelter, ambush. Good eye.",
  deepWater:  "Going deep. Smart. The serious fish are down there. So are the line-breakers.",
  rockyBank:  "Rocky bank. You'll work for it. Strong current, strong fish. Don't go light on tackle.",
};

// ─────────────────────────────────────────────────────────────────────────────
// SPOT + LURE quips (shown after both spot and lure are selected)
// ─────────────────────────────────────────────────────────────────────────────
const SPOT_LURE_QUIPS = [
  // Mystery lure combos — always high priority
  { s: 'deepWater',  l: 'mysteryLure', line: "Mystery lure in deep water. Nobody knows what's gonna hit that thing. Could be anything." },
  { s: 'fallenTree', l: 'mysteryLure', line: "Mystery lure around that tree structure? You're asking for trouble. The good kind." },
  { s: 'rockyBank',  l: 'mysteryLure', line: "Mystery lure in the current. Bold. Those rocks are gonna test your line too." },
  { s: 'reeds',      l: 'mysteryLure', line: "Mystery lure in the reeds. Something big's gonna come out of that grass for it." },
  { s: 'dock',       l: 'mysteryLure', line: "Mystery lure off the dock. Interesting play. Could go anywhere from here." },
  // Frog combos
  { s: 'reeds',      l: 'frog',        line: "Frog in the reeds. This is the move. This is how you do it. Classic." },
  { s: 'deepWater',  l: 'frog',        line: "Frog out deep? Bass will come up for it. Big bass will come up for it." },
  { s: 'fallenTree', l: 'frog',        line: "Topwater frog around that fallen tree. If something big is home, it's coming up." },
  { s: 'dock',       l: 'frog',        line: "Frog off the dock. Calm water topwater action. Fun cast. Could be a good day." },
  // Worm combos
  { s: 'dock',       l: 'worm',        line: "Dock and worm. As reliable as it gets. You will catch something." },
  { s: 'deepWater',  l: 'worm',        line: "Worm out deep. Catfish territory. Not glamorous, but there's meat on a catfish." },
  { s: 'reeds',      l: 'worm',        line: "Worm in the reeds. Safe and steady. The bass'll find it." },
  { s: 'rockyBank',  l: 'worm',        line: "Worm in the rocks. Current's gonna drag it around. Smallmouth love that." },
  { s: 'fallenTree', l: 'worm',        line: "Worm around structure. Drop it right next to the trunk. Something's there." },
  // Jig combos
  { s: 'fallenTree', l: 'jig',         line: "Jig under that tree. Get it in close to the wood. That's where they're hiding." },
  { s: 'deepWater',  l: 'jig',         line: "Jig in deep water. Nice. Versatile bait for that depth. Could get a big one." },
  { s: 'rockyBank',  l: 'jig',         line: "Jig in the rocks. Smart. It'll bounce along the bottom right where they feed." },
  // Spinner combos
  { s: 'rockyBank',  l: 'spinner',     line: "Spinner in that current. Good call. They'll charge at the flash and vibration." },
  { s: 'reeds',      l: 'spinner',     line: "Spinner through the reeds. Keep it moving or it'll snag. Could draw a strike." },
];

// ─────────────────────────────────────────────────────────────────────────────
// FULL COMBO quips (spot + lure + cast style — highest specificity wins)
// ─────────────────────────────────────────────────────────────────────────────
const FULL_COMBO_QUIPS = [
  // ── Max risk combos ──────────────────────────────────────────────────────
  {
    s: 'deepWater', l: 'mysteryLure', c: 'riskyCast',
    line: "Deep water. Mystery lure. Risky cast. Either a genius or a fool. Forty years fishing — I genuinely don't know which.",
  },
  {
    s: 'deepWater', l: 'mysteryLure', c: 'powerCast',
    line: "Power cast with the mystery lure way out deep. You're reaching for something. Maybe you'll find it.",
  },
  {
    s: 'deepWater', l: 'mysteryLure', c: 'precisionCast',
    line: "Precision cast with the mystery lure in deep water. Smart — you're trying to control an uncontrollable bait. Respect.",
  },
  {
    s: 'deepWater', l: 'mysteryLure', c: 'safeCast',
    line: "Safe cast with the mystery lure out deep. You're being cautious. Less glory — better shot at actually landing it.",
  },
  {
    s: 'deepWater', l: 'frog', c: 'riskyCast',
    line: "Risky cast, frog, deep water. You're gambling on a monster coming up. Could absolutely happen.",
  },
  {
    s: 'rockyBank', l: 'mysteryLure', c: 'riskyCast',
    line: "Mystery lure, risky cast, rocky bank. Current, rocks, unknown bait, blind cast. This is chaos. Beautiful chaos.",
  },
  // ── High risk combos ─────────────────────────────────────────────────────
  {
    s: 'deepWater', l: 'jig', c: 'riskyCast',
    line: "Risky cast with a jig in the deep. Getting distance and depth both. Bold. You'll fight for this one.",
  },
  {
    s: 'fallenTree', l: 'mysteryLure', c: 'riskyCast',
    line: "Mystery lure, risky cast around that tree structure. Something living in that shadow is about to have a bad day.",
  },
  {
    s: 'rockyBank', l: 'frog', c: 'riskyCast',
    line: "Risky topwater cast in the rocks. Current's gonna drag that frog everywhere. Something might hit it out of pure aggression.",
  },
  // ── Precision / smart combos ─────────────────────────────────────────────
  {
    s: 'reeds', l: 'frog', c: 'precisionCast',
    line: "Precision cast into the reeds with a frog. That's exactly how you do it. Drop it in the pocket. Perfect.",
  },
  {
    s: 'fallenTree', l: 'jig', c: 'precisionCast',
    line: "Precision jig right under the trunk. You're fishing like you've done this before.",
  },
  {
    s: 'fallenTree', l: 'jig', c: 'powerCast',
    line: "Power jig under the fallen tree — getting it to the back of the shadow. That's where the big ones sit.",
  },
  // ── Safe/easy combos ─────────────────────────────────────────────────────
  {
    s: 'dock', l: 'worm', c: 'safeCast',
    line: "Dock. Worm. Safe cast. The classic beginner setup. You will catch a fish. It might be a bluegill. That's fine.",
  },
  {
    s: 'dock', l: 'worm', c: 'riskyCast',
    line: "Risky cast with a worm at the dock. The risk doesn't improve the worm. You're just making it harder to land.",
  },
  {
    s: 'reeds', l: 'worm', c: 'safeCast',
    line: "Safe worm cast in the reeds. Steady and reliable. You'll bring something in. Nothing to write home about.",
  },
  {
    s: 'dock', l: 'frog', c: 'safeCast',
    line: "Frog off the dock, played safe. Calm water topwater. Nothing wrong with that. Could be a great cast.",
  },
  // ── Power cast combos ────────────────────────────────────────────────────
  {
    s: 'rockyBank', l: 'spinner', c: 'powerCast',
    line: "Power cast spinner in the current. Getting it way out there. Let it swing across the rocks. Smart.",
  },
  {
    s: 'deepWater', l: 'jig', c: 'powerCast',
    line: "Power jig in deep water. Maximum depth, maximum distance. You want a big fight? You'll get one.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Risk-level fallback quips (when no specific combo matches)
// ─────────────────────────────────────────────────────────────────────────────
function riskQuip(spotId, lureId, castStyleId) {
  const riskScore = {
    dock:       0, reeds:     1, fallenTree: 2, rockyBank: 2, deepWater: 3,
    worm:       0, spinner:   1, frog:       2, jig:       2, mysteryLure: 3,
    safeCast:   0, precisionCast: 1, powerCast: 2, riskyCast: 3,
  };
  const score = (riskScore[spotId] ?? 1) + (riskScore[lureId] ?? 1) + (riskScore[castStyleId] ?? 1);

  if (score >= 8) return "This is about as risky as it gets. I love it. Don't break your line.";
  if (score >= 6) return "High-risk setup. Could land something nobody's seen. Could lose the line. That's fishing.";
  if (score >= 4) return "Solid setup. Good balance. Something real could hit this.";
  if (score >= 2) return "Safe play. You'll catch something. Not legendary, but something.";
  return "About as safe as it gets. Guaranteed to catch something. Just maybe not something exciting.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Quip shown right after a spot is picked (before lure/cast are chosen). */
export function getSpotQuip(spotId) {
  return SPOT_QUIPS[spotId] ?? "Let's see what's out there.";
}

/** Quip shown after spot + lure are picked (before cast style). */
export function getSpotLureQuip(spotId, lureId) {
  const match = SPOT_LURE_QUIPS.find(q => q.s === spotId && q.l === lureId);
  return match?.line ?? null; // null = fall through to spot quip
}

/** Quip shown when all three are selected. */
export function getSetupQuip(spotId, lureId, castStyleId) {
  // Most specific match first
  const full = FULL_COMBO_QUIPS.find(q => q.s === spotId && q.l === lureId && q.c === castStyleId);
  if (full) return full.line;

  // Fall back to spot+lure or risk-level quip
  const sl = getSpotLureQuip(spotId, lureId);
  if (sl) return sl;

  return riskQuip(spotId, lureId, castStyleId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Catch reveal quips (TModel2 reacts to what you caught)
// ─────────────────────────────────────────────────────────────────────────────
const CATCH_QUIPS = {
  legendary: "NO WAY. I've fished this lake 30 years and never seen one of those. You better have a camera.",
  epic:      "Now THAT is a fish. Get the camera. Seriously — get the camera right now.",
  rare:      "Nice. Real nice. That one's a keeper. Don't throw it back.",
  uncommon:  "Not bad. Solid catch. Put it on the board.",
  common:    "Fish is fish. We'll do better next cast.",
};

export function getCatchQuip(rarity) {
  return CATCH_QUIPS[rarity] ?? CATCH_QUIPS.common;
}

// ─────────────────────────────────────────────────────────────────────────────
// Result screen quips (Snowball — after all 3 casts)
// ─────────────────────────────────────────────────────────────────────────────
export function getSnowballResultLine(streak, catches) {
  const best = catches.reduce((b, c) => (!b || c.points > b.points) ? c : b, null);

  if (best?.rarity === 'legendary') return "A LEGENDARY catch? On my watch? Get in here. That's going in the record book.";
  if (best?.rarity === 'epic')      return "Epic catch. Real talk — nice work out there today.";
  if (streak > 14) return `${streak}-day streak. That's dedication. Come back tomorrow or I'll know.`;
  if (streak > 6)  return `${streak} days in a row. You're building something. Don't stop now.`;
  if (streak > 1)  return `${streak}-day streak. Good. Keep it going.`;
  return "All three casts done. Get some rest. We're back at it tomorrow.";
}
