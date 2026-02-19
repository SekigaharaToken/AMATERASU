/**
 * Read/write cache for onchain values that never change once set.
 * Uses localStorage with a namespaced prefix.
 *
 * Call setStoragePrefix() before first use to set the app prefix.
 * Falls back to "engine" if never set.
 */

let _prefix = "engine:immutable:";

export function setStoragePrefix(appPrefix) {
  _prefix = appPrefix + ":immutable:";
}

export function getCached(key) {
  try {
    const raw = localStorage.getItem(_prefix + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCached(key, value) {
  try {
    localStorage.setItem(_prefix + key, JSON.stringify(value));
  } catch {
    // Storage full or disabled — silently ignore
  }
}

/**
 * Cache a value only when truthy (one-way latch).
 * Useful for flags like hasClaimed that go false→true permanently.
 */
export function setCachedOnce(key, value) {
  if (value) setCached(key, value);
}
