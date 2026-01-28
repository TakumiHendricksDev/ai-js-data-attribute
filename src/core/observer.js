/**
 * Observer module for watching dynamically added elements
 */

let observer = null;
let observerCallback = null;

/**
 * Start observing the DOM for new elements with ai attribute
 * @param {object} config - Configuration object
 * @param {function} processCallback - Callback to process new elements
 */
export function startObserver(config, processCallback) {
  if (!config.observeChanges) {
    return;
  }

  if (observer) {
    // Already observing
    return;
  }

  const attributeName = config.attributeName || 'ai';

  observerCallback = (mutationsList) => {
    for (const mutation of mutationsList) {
      // Check added nodes
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node has ai attribute
            if (node.hasAttribute && node.hasAttribute(attributeName)) {
              processCallback(node);
            }

            // Check descendants of added node
            if (node.querySelectorAll) {
              const descendants = node.querySelectorAll(`[${attributeName}]`);
              descendants.forEach(descendant => {
                processCallback(descendant);
              });
            }
          }
        });
      }

      // Check attribute changes
      if (mutation.type === 'attributes' && mutation.attributeName === attributeName) {
        const target = mutation.target;
        if (target.hasAttribute(attributeName) && !target.hasAttribute('data-ai-processed')) {
          processCallback(target);
        }
      }
    }
  };

  observer = new MutationObserver(observerCallback);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [attributeName]
  });

  console.log('[AiAttr] MutationObserver started');
}

/**
 * Stop observing the DOM
 */
export function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
    observerCallback = null;
    console.log('[AiAttr] MutationObserver stopped');
  }
}

/**
 * Check if observer is currently active
 * @returns {boolean} - True if observing
 */
export function isObserving() {
  return observer !== null;
}
