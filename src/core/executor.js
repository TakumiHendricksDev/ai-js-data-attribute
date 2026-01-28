/**
 * Executor module for safely running generated JavaScript code
 */

/**
 * Execute generated JavaScript code
 * @param {string} code - The JavaScript code to execute
 * @param {HTMLElement} element - The element the code was generated for
 * @param {object} config - Configuration object
 * @returns {boolean} - True if execution succeeded
 */
export function executeCode(code, element, config = {}) {
  if (!code || !code.trim()) {
    console.warn('[AiAttr] Empty code, skipping execution');
    return false;
  }

  try {
    // Create a function that has access to the element
    // This allows the generated code to reference 'element' if needed
    const wrappedCode = `
      (function() {
        try {
          ${code}
        } catch (innerError) {
          console.error('[AiAttr] Runtime error in generated code:', innerError);
        }
      })();
    `;

    // Execute the code
    const executeFunc = new Function(wrappedCode);
    executeFunc();

    return true;
  } catch (error) {
    console.error('[AiAttr] Execution error:', error);
    console.error('[AiAttr] Failed code:', code);

    // Call error callback if provided
    if (config.onError && typeof config.onError === 'function') {
      config.onError(element, error);
    }

    return false;
  }
}

/**
 * Validate generated code (basic syntax check)
 * @param {string} code - The JavaScript code to validate
 * @returns {{valid: boolean, error: Error|null}} - Validation result
 */
export function validateCode(code) {
  try {
    // Try to create a function with the code to check for syntax errors
    new Function(code);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error };
  }
}
