/**
 * Scanner module for finding elements with ai="" attribute
 */

/**
 * Scan the DOM for elements with the ai attribute
 * @param {object} config - Configuration object
 * @param {HTMLElement} [root=document] - Root element to scan from
 * @returns {Array<{element: HTMLElement, instruction: string}>} - Array of elements with their instructions
 */
export function scanElements(config, root = document) {
  const attributeName = config.attributeName || 'ai';
  const selector = `[${attributeName}]`;

  const elements = root.querySelectorAll(selector);
  const results = [];

  elements.forEach((element, index) => {
    const instruction = element.getAttribute(attributeName);

    // Skip empty instructions
    if (!instruction || !instruction.trim()) {
      return;
    }

    // Ensure element has an ID for targeting
    if (!element.id) {
      element.id = `ai-attr-${Date.now()}-${index}`;
    }

    // Mark as processed to avoid re-processing
    if (element.hasAttribute('data-ai-processed')) {
      return;
    }

    results.push({
      element: element,
      instruction: instruction.trim(),
      id: element.id
    });
  });

  return results;
}

/**
 * Mark an element as processed
 * @param {HTMLElement} element - The element to mark
 */
export function markProcessed(element) {
  element.setAttribute('data-ai-processed', 'true');
}

/**
 * Check if an element has been processed
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - True if already processed
 */
export function isProcessed(element) {
  return element.hasAttribute('data-ai-processed');
}
