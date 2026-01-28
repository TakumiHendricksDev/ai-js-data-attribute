/**
 * Generator module for calling OpenAI API (directly or via proxy)
 */

import { buildPrompt } from '../utils/prompt.js';
import { extractJavaScript } from '../utils/extractor.js';

/**
 * Generate JavaScript code for an element
 * @param {HTMLElement} element - The element to generate code for
 * @param {string} instruction - The AI instruction
 * @param {object} config - Configuration object
 * @returns {Promise<string|null>} - Generated code or null on error
 */
export async function generateCode(element, instruction, config) {
  const prompt = buildPrompt(element, instruction);

  // Call onBeforeGenerate callback
  if (config.onBeforeGenerate && typeof config.onBeforeGenerate === 'function') {
    config.onBeforeGenerate(element, instruction);
  }

  try {
    let responseText;

    if (config.proxyUrl) {
      // Use proxy server
      responseText = await callProxy(prompt, config);
    } else if (config.apiKey) {
      // Direct API call (development only)
      responseText = await callOpenAI(prompt, config);
    } else {
      throw new Error('No API configuration provided. Set either proxyUrl or apiKey.');
    }

    // Extract pure JavaScript from response
    const code = extractJavaScript(responseText);

    // Call onGenerated callback
    if (config.onGenerated && typeof config.onGenerated === 'function') {
      config.onGenerated(element, code);
    }

    return code;
  } catch (error) {
    console.error('[AiAttr] Generation error:', error);

    // Call onError callback
    if (config.onError && typeof config.onError === 'function') {
      config.onError(element, error);
    }

    return null;
  }
}

/**
 * Call user's proxy server
 * @param {string} prompt - The prompt to send
 * @param {object} config - Configuration object
 * @returns {Promise<string>} - Response text
 */
async function callProxy(prompt, config) {
  const model = getModel(config);

  const response = await fetch(config.proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      model: model,
      maxTokens: config.maxTokens || 300,
      temperature: config.temperature || 0.2
    })
  });

  if (!response.ok) {
    throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Support different response formats from proxies
  return data.code || data.content || data.text || data.message || data;
}

/**
 * Get the appropriate model based on config
 * @param {object} config - Configuration object
 * @returns {string} - Model name
 */
function getModel(config) {
  if (config.model === 'auto') {
    // Auto-select: use gpt-4o for best balance of speed and quality
    return 'gpt-4o';
  }
  return config.model || 'gpt-4o';
}

/**
 * Call OpenAI API directly (development only)
 * @param {string} prompt - The prompt to send
 * @param {object} config - Configuration object
 * @returns {Promise<string>} - Response text
 */
async function callOpenAI(prompt, config) {
  const model = getModel(config);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens || 300,
      temperature: config.temperature || 0.2
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate code for multiple elements in parallel
 * @param {Array<{element: HTMLElement, instruction: string}>} items - Elements to generate code for
 * @param {object} config - Configuration object
 * @returns {Promise<Map<HTMLElement, string|null>>} - Map of element to generated code
 */
export async function generateCodeBatch(items, config) {
  const concurrency = config.batchConcurrency || 5;
  const results = new Map();

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);

    const promises = batch.map(async ({ element, instruction }) => {
      try {
        const code = await generateCode(element, instruction, config);
        return { element, code };
      } catch (error) {
        console.error(`[AiAttr] Batch generation error for element:`, error);
        return { element, code: null };
      }
    });

    const batchResults = await Promise.all(promises);
    for (const { element, code } of batchResults) {
      results.set(element, code);
    }
  }

  return results;
}
