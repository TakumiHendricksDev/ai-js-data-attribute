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
  // Only remove triple backtick fences, NOT single backticks used in template literals

  // Handle code blocks with language identifier
  cleanedText = cleanedText.replace(/^[\s\S]*?```(?:javascript|js)\s*\n/i, '');
  cleanedText = cleanedText.replace(/\n```\s*$/i, '');

  // Handle code blocks without language identifier (but only at start/end)
  cleanedText = cleanedText.replace(/^```\s*\n/, '');
  cleanedText = cleanedText.replace(/\n```\s*$/, '');

  // DO NOT remove single backticks - they are used for template literals in JavaScript!

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
