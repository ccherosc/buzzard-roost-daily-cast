// src/utils/fishImages.js
// Vite-managed fish image URLs.
// import.meta.glob with { eager: true, import: 'default' } statically bundles
// all PNGs and returns each file's URL as a plain string — same as using
// new URL('../assets/fish/…', import.meta.url).href but for all files at once.

const modules = import.meta.glob('../assets/fish/*.png', {
  eager: true,
  import: 'default',
});

// Build a fishId → url map: '../assets/fish/bluegill.png' → 'bluegill'
const FISH_IMAGE_MAP = {};
for (const [path, url] of Object.entries(modules)) {
  const id = path.split('/').pop().replace('.png', '');
  FISH_IMAGE_MAP[id] = url;
}

/**
 * Returns the bundled URL for a fish image, or null if not found.
 * @param {string} fishId — matches fish.id from fishData.js
 * @returns {string|null}
 */
export function getFishImage(fishId) {
  return FISH_IMAGE_MAP[fishId] ?? null;
}
