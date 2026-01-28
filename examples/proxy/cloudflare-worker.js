/**
 * Cloudflare Worker Proxy for AiAttr
 *
 * Deploy this as a Cloudflare Worker to securely proxy
 * OpenAI API requests while keeping your API key server-side.
 *
 * Setup:
 * 1. Create a new Cloudflare Worker
 * 2. Paste this code
 * 3. Add OPENAI_API_KEY as a secret in Worker settings
 * 4. Deploy
 *
 * Usage in your frontend:
 * AiAttr.init({ proxyUrl: 'https://your-worker.workers.dev/ai-generate' });
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get API key from environment secrets
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();
      const { prompt, model = 'gpt-4-turbo', maxTokens = 150, temperature = 0.2 } = body;

      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Call OpenAI API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: temperature,
        }),
      });

      if (!openaiResponse.ok) {
        const error = await openaiResponse.json();
        return new Response(JSON.stringify({ error: error.error?.message || 'OpenAI API error' }), {
          status: openaiResponse.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await openaiResponse.json();
      const code = data.choices[0].message.content;

      return new Response(JSON.stringify({ code }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Adjust for production
        },
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
