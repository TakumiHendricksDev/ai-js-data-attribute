/**
 * Cache module for storing generated code in localStorage
 */

const DEFAULT_PREFIX = 'ai-attr-';
const DEFAULT_EXPIRY = 86400000; // 24 hours in ms

/**
 * Generate a simple hash from a string
 * @param {string} str - String to hash
 * @returns {string} - Hash string
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate a cache key from element info and instruction
 * @param {HTMLElement} element - The element
 * @param {string} instruction - The AI instruction
 * @returns {string} - Cache key
 */
export function generateCacheKey(element, instruction) {
  const elementInfo = {
    tag: element.tagName.toLowerCase(),
    id: element.id || '',
    classes: element.className || '',
    instruction: instruction
  };
  return hashString(JSON.stringify(elementInfo));
}

/**
 * Get cached code for an element
 * @param {string} key - Cache key
 * @param {object} config - Configuration object
 * @returns {string|null} - Cached code or null if not found/expired
 */
export function getCache(key, config = {}) {
  if (!config.cache) return null;

  const prefix = config.cachePrefix || DEFAULT_PREFIX;
  const fullKey = prefix + key;

  try {
    const stored = localStorage.getItem(fullKey);
    if (!stored) return null;

    const { code, timestamp } = JSON.parse(stored);
    const expiry = config.cacheExpiry || DEFAULT_EXPIRY;

    // Check if expired
    if (Date.now() - timestamp > expiry) {
      localStorage.removeItem(fullKey);
      return null;
    }

    return code;
  } catch (e) {
    console.warn('[AiAttr] Cache read error:', e);
    return null;
  }
}

/**
 * Store generated code in cache
 * @param {string} key - Cache key
 * @param {string} code - Generated code
 * @param {object} config - Configuration object
 */
export function setCache(key, code, config = {}) {
  if (!config.cache) return;

  const prefix = config.cachePrefix || DEFAULT_PREFIX;
  const fullKey = prefix + key;

  try {
    const data = {
      code: code,
      timestamp: Date.now()
    };
    localStorage.setItem(fullKey, JSON.stringify(data));
  } catch (e) {
    console.warn('[AiAttr] Cache write error:', e);
  }
}

/**
 * Clear all cached entries
 * @param {object} config - Configuration object
 */
export function clearCache(config = {}) {
  const prefix = config.cachePrefix || DEFAULT_PREFIX;

  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[AiAttr] Cleared ${keysToRemove.length} cached entries`);
  } catch (e) {
    console.warn('[AiAttr] Cache clear error:', e);
  }
}
