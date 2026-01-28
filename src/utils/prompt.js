/**
 * Prompt template generation for OpenAI API
 */

/**
 * Build a prompt for generating JavaScript code
 * @param {HTMLElement} element - The element to generate code for
 * @param {string} instruction - The AI instruction from the attribute
 * @returns {string} - The complete prompt
 */
export function buildPrompt(element, instruction) {
  const elementInfo = getElementInfo(element);

  return `Generate JavaScript code based on the given instruction and element information.

Element Information:
- Tag: ${elementInfo.tag}
- ID: ${elementInfo.id}
- Classes: ${elementInfo.classes || 'none'}
- Type: ${elementInfo.type || 'N/A'}
- Text Content: ${elementInfo.textContent || 'none'}

Instruction: ${instruction}

Requirements:
1. Generate ONLY the JavaScript code, no explanations or markdown.
2. Use document.getElementById('${elementInfo.id}') to target the element.
3. The code should be self-contained and execute immediately.
4. Use modern JavaScript (ES6+).
5. Add event listeners where appropriate for interactive elements.
6. Keep the code minimal and focused on the instruction.

Respond ONLY with the JavaScript code. No markdown code blocks, no explanations.`;
}

/**
 * Extract relevant information from an element
 * @param {HTMLElement} element - The element
 * @returns {object} - Element information
 */
function getElementInfo(element) {
  return {
    tag: element.tagName.toLowerCase(),
    id: element.id || '',
    classes: element.className || '',
    type: element.getAttribute('type') || '',
    textContent: element.textContent?.trim().substring(0, 50) || ''
  };
}
