// src/utils/fishImages.js
// Fish PNGs live at project root /assets/fish/ — imported via Vite glob.
const modules = import.meta.glob('../../assets/fish/*.png', {
  eager: true,
  import: 'default',
});

const FISH_IMAGE_MAP = {};
for (const [path, url] of Object.entries(modules)) {
  const id = path.split('/').pop().replace('.png', '');
  FISH_IMAGE_MAP[id] = url;
}

/** Returns the bundled URL for a fish PNG, or null if not found. */
export function getFishImage(fishId) {
  return FISH_IMAGE_MAP[fishId] ?? null;
}

export default FISH_IMAGE_MAP;
