/**
 * AiAttr - AI-powered JavaScript generation via HTML attributes
 *
 * A client-side library that scans the DOM for elements with ai="" attributes
 * and generates JavaScript code using OpenAI API (or a proxy server).
 *
 * @example
 * // Include via CDN
 * <script src="https://cdn.jsdelivr.net/npm/ai-js-attr@latest/dist/ai-attr.min.js"></script>
 *
 * // Initialize
 * AiAttr.init({
 *   proxyUrl: '/api/ai-generate'
 * });
 *
 * // Use in HTML
 * <button ai="Show an alert saying Hello">Click me</button>
 */

import { scanElements, markProcessed, isProcessed } from './core/scanner.js';
import { generateCode, generateCodeBatch } from './core/generator.js';
import { executeCode, validateCode } from './core/executor.js';
import { generateCacheKey, getCache, setCache, clearCache as clearCacheStorage } from './core/cache.js';
import { startObserver, stopObserver } from './core/observer.js';

// Default configuration
const defaultConfig = {
  // API configuration (one required)
  apiKey: null,
  proxyUrl: null,

  // Behavior
  attributeName: 'ai',
  autoScan: true,
  observeChanges: true,

  // AI Settings
  model: 'gpt-4o', // Use gpt-4o for better speed/quality balance (or 'auto' for auto-select)
  maxTokens: 300,
  temperature: 0.2,

  // Batch Processing
  batchProcessing: true, // Process elements in parallel
  batchConcurrency: 5, // Number of concurrent API calls

  // Context
  includeHtmlContext: true, // Include surrounding HTML in prompts for better AI understanding

  // Caching
  cache: true,
  cachePrefix: 'ai-attr-',
  cacheExpiry: 86400000, // 24 hours

  // UI Feedback
  showLoading: true,
  loadingClass: 'ai-loading',
  errorClass: 'ai-error',

  // Callbacks
  onBeforeGenerate: null,
  onGenerated: null,
  onError: null,
  onComplete: null
};

// Current configuration
let config = { ...defaultConfig };

// Track initialization state
let initialized = false;

/**
 * Process a single element - generate and execute code
 * @param {HTMLElement} element - Element to process
 * @returns {Promise<boolean>} - True if successful
 */
async function processElement(element) {
  const instruction = element.getAttribute(config.attributeName);

  if (!instruction || isProcessed(element)) {
    return false;
  }

  // Ensure element has an ID
  if (!element.id) {
    element.id = `ai-attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add loading class
  if (config.showLoading) {
    element.classList.add(config.loadingClass);
  }

  try {
    // Check cache first
    const cacheKey = generateCacheKey(element, instruction);
    let code = getCache(cacheKey, config);

    if (code) {
      console.log(`[AiAttr] Using cached code for #${element.id}`);
    } else {
      // Generate new code
      console.log(`[AiAttr] Generating code for #${element.id}: "${instruction}"`);
      code = await generateCode(element, instruction, config);

      if (code) {
        // Validate syntax
        const { valid, error } = validateCode(code);
        if (!valid) {
          console.error(`[AiAttr] Invalid code generated for #${element.id}:`, error);
          throw error;
        }

        // Cache the valid code
        setCache(cacheKey, code, config);
      }
    }

    if (code) {
      // Execute the code
      const success = executeCode(code, element, config);
      if (success) {
        markProcessed(element);
        console.log(`[AiAttr] Successfully processed #${element.id}`);
      }
      return success;
    }

    return false;
  } catch (error) {
    console.error(`[AiAttr] Error processing #${element.id}:`, error);

    if (config.onError && typeof config.onError === 'function') {
      config.onError(element, error);
    }

    // Add error class
    if (config.showLoading) {
      element.classList.add(config.errorClass);
    }

    return false;
  } finally {
    // Remove loading class
    if (config.showLoading) {
      element.classList.remove(config.loadingClass);
    }
  }
}

/**
 * Scan and process all elements with ai attribute
 * @param {HTMLElement} [root=document] - Root element to scan from
 * @returns {Promise<number>} - Number of elements processed
 */
async function scan(root = document) {
  const elements = scanElements(config, root);
  console.log(`[AiAttr] Found ${elements.length} elements to process`);

  let processed = 0;

  if (config.batchProcessing && elements.length > 1) {
    // Batch processing: parallel execution for speed
    processed = await processBatch(elements);
  } else {
    // Sequential processing (legacy mode)
    for (const { element, instruction } of elements) {
      const success = await processElement(element);
      if (success) processed++;
    }
  }

  // Call onComplete callback
  if (config.onComplete && typeof config.onComplete === 'function') {
    config.onComplete();
  }

  return processed;
}

/**
 * Process multiple elements in parallel batches
 * @param {Array<{element: HTMLElement, instruction: string}>} elements - Elements to process
 * @returns {Promise<number>} - Number successfully processed
 */
async function processBatch(elements) {
  const concurrency = config.batchConcurrency || 5;
  let processed = 0;

  // Prepare items: filter already processed and ensure IDs
  const itemsToProcess = [];
  const cachedItems = [];

  for (const { element, instruction } of elements) {
    if (isProcessed(element)) continue;

    // Ensure element has an ID
    if (!element.id) {
      element.id = `ai-attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check cache first
    const cacheKey = generateCacheKey(element, instruction);
    const cachedCode = getCache(cacheKey, config);

    if (cachedCode) {
      cachedItems.push({ element, instruction, code: cachedCode, cacheKey });
    } else {
      itemsToProcess.push({ element, instruction, cacheKey });
    }
  }

  // Process cached items immediately (no API call needed)
  for (const { element, code } of cachedItems) {
    console.log(`[AiAttr] Using cached code for #${element.id}`);
    const { valid, error } = validateCode(code);
    if (valid) {
      const success = executeCode(code, element, config);
      if (success) {
        markProcessed(element);
        processed++;
      }
    } else {
      console.error(`[AiAttr] Invalid cached code for #${element.id}:`, error);
    }
  }

  // Process items needing generation in parallel batches
  if (itemsToProcess.length > 0) {
    console.log(`[AiAttr] Generating code for ${itemsToProcess.length} elements (batch concurrency: ${concurrency})`);

    // Add loading class to all items
    if (config.showLoading) {
      itemsToProcess.forEach(({ element }) => element.classList.add(config.loadingClass));
    }

    // Process in parallel batches
    for (let i = 0; i < itemsToProcess.length; i += concurrency) {
      const batch = itemsToProcess.slice(i, i + concurrency);

      const promises = batch.map(async ({ element, instruction, cacheKey }) => {
        try {
          // Call onBeforeGenerate
          if (config.onBeforeGenerate && typeof config.onBeforeGenerate === 'function') {
            config.onBeforeGenerate(element, instruction);
          }

          console.log(`[AiAttr] Generating code for #${element.id}: "${instruction}"`);
          const code = await generateCode(element, instruction, config);

          if (code) {
            const { valid, error } = validateCode(code);
            if (!valid) {
              console.error(`[AiAttr] Invalid code generated for #${element.id}:`, error);
              throw error;
            }

            // Cache the valid code
            setCache(cacheKey, code, config);

            // Execute
            const success = executeCode(code, element, config);
            if (success) {
              markProcessed(element);
              console.log(`[AiAttr] Successfully processed #${element.id}`);
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error(`[AiAttr] Error processing #${element.id}:`, error);
          if (config.onError && typeof config.onError === 'function') {
            config.onError(element, error);
          }
          if (config.showLoading) {
            element.classList.add(config.errorClass);
          }
          return false;
        } finally {
          if (config.showLoading) {
            element.classList.remove(config.loadingClass);
          }
        }
      });

      const results = await Promise.all(promises);
      processed += results.filter(Boolean).length;
    }
  }

  return processed;
}

/**
 * Initialize AiAttr with configuration
 * @param {object} userConfig - User configuration
 */
function init(userConfig = {}) {
  // Merge configs
  config = { ...defaultConfig, ...userConfig };

  // Validate configuration
  if (!config.apiKey && !config.proxyUrl) {
    console.error('[AiAttr] Error: You must provide either apiKey or proxyUrl');
    return;
  }

  if (config.apiKey && !config.proxyUrl) {
    console.warn('[AiAttr] Warning: Using direct API key in browser. This exposes your key! Use proxyUrl for production.');
  }

  initialized = true;
  console.log('[AiAttr] Initialized');

  // Auto-scan on DOM ready
  if (config.autoScan) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        scan();
        if (config.observeChanges) {
          startObserver(config, processElement);
        }
      });
    } else {
      // DOM already loaded
      scan();
      if (config.observeChanges) {
        startObserver(config, processElement);
      }
    }
  }
}

/**
 * Generate code for a single element (manual trigger)
 * @param {HTMLElement} element - Element to generate code for
 * @returns {Promise<string|null>} - Generated code or null
 */
async function generate(element) {
  if (!initialized) {
    console.error('[AiAttr] Not initialized. Call AiAttr.init() first.');
    return null;
  }

  const instruction = element.getAttribute(config.attributeName);
  if (!instruction) {
    console.warn('[AiAttr] Element has no ai attribute');
    return null;
  }

  return generateCode(element, instruction, config);
}

/**
 * Clear all cached generated code
 */
function clearCache() {
  clearCacheStorage(config);
}

/**
 * Stop watching for dynamic elements
 */
function stop() {
  stopObserver();
}

/**
 * Get current configuration
 * @returns {object} - Current config (copy)
 */
function getConfig() {
  return { ...config };
}

// Create the AiAttr object
const AiAttr = {
  init,
  scan,
  generate,
  clearCache,
  stop,
  getConfig,
  version: '1.3.0'
};

// Expose globally for IIFE/UMD builds
if (typeof window !== 'undefined') {
  window.AiAttr = AiAttr;
}

// Export for ES modules (default only to avoid rollup warning)
export default AiAttr;
