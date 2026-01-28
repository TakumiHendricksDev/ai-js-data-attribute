/**
 * Extractor module for extracting JavaScript from AI responses
 */

/**
 * Extract pure JavaScript code from an AI response
 * Handles various response formats including markdown code blocks
 * @param {string} responseText - The raw response from the AI
 * @returns {string} - Clean JavaScript code
 */
export function extractJavaScript(responseText) {
  if (!responseText) {
    return '';
  }

  let cleanedText = responseText;

  // Remove markdown code blocks (```javascript, ```js, or just ```)
  // Handle opening code fence
  cleanedText = cleanedText.replace(/^[\s\S]*?```(?:javascript|js)?\n?/i, '');

  // Handle closing code fence
  cleanedText = cleanedText.replace(/\n?```[\s\S]*$/i, '');

  // Remove any remaining backticks
  cleanedText = cleanedText.replace(/`/g, '');

  // Remove leading/trailing whitespace
  cleanedText = cleanedText.trim();

  // Remove common prefixes like "Here's the code:" or "JavaScript:"
  cleanedText = cleanedText.replace(/^(?:here'?s?\s+(?:the\s+)?(?:code|javascript)[:\s]*)/i, '');

  // Trim again after prefix removal
  cleanedText = cleanedText.trim();

  return cleanedText || responseText.trim();
}

/**
 * Validate that extracted code looks like JavaScript
 * @param {string} code - The code to validate
 * @returns {boolean} - True if it appears to be valid JavaScript
 */
export function looksLikeJavaScript(code) {
  if (!code || code.length < 5) {
    return false;
  }

  // Check for common JavaScript patterns
  const jsPatterns = [
    /document\./,
    /function\s*\(/,
    /const\s+/,
    /let\s+/,
    /var\s+/,
    /=>/,
    /addEventListener/,
    /getElementById/,
    /querySelector/
  ];

  return jsPatterns.some(pattern => pattern.test(code));
}
