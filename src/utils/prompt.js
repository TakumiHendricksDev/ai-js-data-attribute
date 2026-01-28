/**
 * Prompt template generation for OpenAI API
 */

/**
 * Build a prompt for generating JavaScript code
 * @param {HTMLElement} element - The element to generate code for
 * @param {string} instruction - The AI instruction from the attribute
 * @param {object} [config] - Configuration object
 * @returns {string} - The complete prompt
 */
export function buildPrompt(element, instruction, config = {}) {
  const elementInfo = getElementInfo(element);
  const includeContext = config.includeHtmlContext !== false; // Default to true

  let contextSection = '';
  let contextRequirement = '';

  if (includeContext) {
    const contextHtml = getSurroundingContext(element);
    contextSection = `
HTML Context (surrounding structure):
${contextHtml}
`;
    contextRequirement = '9. Use the HTML context to understand available elements, their IDs, and relationships.';
  }

  return `Generate JavaScript code based on the given instruction and element information.

Target Element:
- Tag: ${elementInfo.tag}
- ID: ${elementInfo.id}
- Classes: ${elementInfo.classes || 'none'}
- Type: ${elementInfo.type || 'N/A'}
${contextSection}
Instruction: ${instruction}

Requirements:
1. Generate ONLY the JavaScript code, no explanations or markdown.
2. Use document.getElementById('${elementInfo.id}') to reference the target element.
3. The code should be self-contained and execute immediately.
4. Use modern JavaScript (ES6+).
5. Add event listeners where appropriate for interactive elements.
6. Keep the code minimal and focused on the instruction.
7. IMPORTANT: For string interpolation, use proper template literal syntax with backticks: \`Hello \${name}\`
8. Do NOT use markdown code fences (\`\`\`). Output raw JavaScript only.
${contextRequirement}

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
    type: element.getAttribute('type') || ''
  };
}

/**
 * Get a simplified HTML representation of the surrounding context
 * @param {HTMLElement} element - The target element
 * @returns {string} - Simplified HTML context
 */
function getSurroundingContext(element) {
  // Get the closest meaningful container (section, div with class, article, form, etc.)
  const container = findContextContainer(element);

  if (!container) {
    // Fallback: just show parent and siblings
    return getSimpleContext(element);
  }

  // Generate simplified HTML of the container
  return simplifyHtml(container, element, 0, 3);
}

/**
 * Find a meaningful container element for context
 * @param {HTMLElement} element - The target element
 * @returns {HTMLElement|null} - Container element or null
 */
function findContextContainer(element) {
  const meaningfulTags = ['section', 'article', 'form', 'main', 'nav', 'aside', 'header', 'footer'];
  const maxLevels = 4;

  let current = element.parentElement;
  let levels = 0;
  let bestContainer = null;

  while (current && levels < maxLevels) {
    const tag = current.tagName.toLowerCase();

    // Stop at body
    if (tag === 'body') break;

    // Check if it's a meaningful container
    if (meaningfulTags.includes(tag) ||
        current.classList.contains('demo-card') ||
        current.classList.contains('demo-section') ||
        current.classList.contains('container') ||
        current.id) {
      bestContainer = current;
      break;
    }

    // A div with a class is somewhat meaningful
    if (tag === 'div' && current.className) {
      bestContainer = current;
    }

    current = current.parentElement;
    levels++;
  }

  return bestContainer || element.parentElement;
}

/**
 * Get simple context (parent + siblings) as fallback
 * @param {HTMLElement} element - The target element
 * @returns {string} - Simple HTML context
 */
function getSimpleContext(element) {
  const parent = element.parentElement;
  if (!parent) return elementToSimpleHtml(element, true);

  return simplifyHtml(parent, element, 0, 2);
}

/**
 * Convert an element tree to simplified HTML string
 * @param {HTMLElement} node - Current node
 * @param {HTMLElement} targetElement - The target element (marked with <!-- TARGET -->)
 * @param {number} depth - Current depth
 * @param {number} maxDepth - Maximum depth to traverse
 * @returns {string} - Simplified HTML
 */
function simplifyHtml(node, targetElement, depth, maxDepth) {
  if (!node || depth > maxDepth) return '';

  const indent = '  '.repeat(depth);
  const tag = node.tagName.toLowerCase();

  // Build opening tag with important attributes
  let attrs = '';
  if (node.id) attrs += ` id="${node.id}"`;
  if (node.className) attrs += ` class="${node.className}"`;
  if (node.getAttribute('type')) attrs += ` type="${node.getAttribute('type')}"`;
  if (node.getAttribute('placeholder')) attrs += ` placeholder="${node.getAttribute('placeholder')}"`;
  if (node.getAttribute('value') !== null && ['input', 'select', 'option'].includes(tag)) {
    attrs += ` value="${node.getAttribute('value')}"`;
  }

  // Mark the target element
  const isTarget = node === targetElement;
  const targetMarker = isTarget ? ' <!-- TARGET ELEMENT -->' : '';

  // Self-closing tags
  const selfClosing = ['input', 'br', 'hr', 'img', 'meta', 'link'];
  if (selfClosing.includes(tag)) {
    return `${indent}<${tag}${attrs} />${targetMarker}\n`;
  }

  // Get text content (only direct text, not from children)
  let textContent = '';
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent.trim();
      if (text) {
        textContent = text.substring(0, 50) + (text.length > 50 ? '...' : '');
        break;
      }
    }
  }

  // Get child elements
  const children = Array.from(node.children);

  // If no children, return simple element
  if (children.length === 0) {
    return `${indent}<${tag}${attrs}>${textContent}</${tag}>${targetMarker}\n`;
  }

  // Build with children
  let html = `${indent}<${tag}${attrs}>${targetMarker}\n`;

  // Add text content if present
  if (textContent) {
    html += `${indent}  ${textContent}\n`;
  }

  // Process children (limit to prevent huge output)
  const maxChildren = 15;
  const childCount = Math.min(children.length, maxChildren);

  for (let i = 0; i < childCount; i++) {
    html += simplifyHtml(children[i], targetElement, depth + 1, maxDepth);
  }

  if (children.length > maxChildren) {
    html += `${indent}  <!-- ... ${children.length - maxChildren} more elements ... -->\n`;
  }

  html += `${indent}</${tag}>\n`;

  return html;
}

/**
 * Convert a single element to simple HTML (no children)
 * @param {HTMLElement} element - The element
 * @param {boolean} isTarget - Whether this is the target element
 * @returns {string} - Simple HTML string
 */
function elementToSimpleHtml(element, isTarget = false) {
  const tag = element.tagName.toLowerCase();
  let attrs = '';

  if (element.id) attrs += ` id="${element.id}"`;
  if (element.className) attrs += ` class="${element.className}"`;
  if (element.getAttribute('type')) attrs += ` type="${element.getAttribute('type')}"`;

  const marker = isTarget ? ' <!-- TARGET ELEMENT -->' : '';
  const text = element.textContent?.trim().substring(0, 30) || '';

  return `<${tag}${attrs}>${text}</${tag}>${marker}`;
}
