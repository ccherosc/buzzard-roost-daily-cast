// Test setup: provide a working localStorage mock for environments where
// Node 26's experimental webstorage shadows the jsdom implementation.
import { vi } from 'vitest';

// Only install mock if localStorage is not a proper Storage object
if (typeof localStorage === 'undefined' || typeof localStorage?.setItem !== 'function') {
  const store = {};
  const mockLocalStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] ?? null,
  };
  vi.stubGlobal('localStorage', mockLocalStorage);
}
