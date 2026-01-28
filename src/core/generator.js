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
  const response = await fetch(config.proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      model: config.model || 'gpt-4-turbo',
      maxTokens: config.maxTokens || 150,
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
 * Call OpenAI API directly (development only)
 * @param {string} prompt - The prompt to send
 * @param {object} config - Configuration object
 * @returns {Promise<string>} - Response text
 */
async function callOpenAI(prompt, config) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens || 150,
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
