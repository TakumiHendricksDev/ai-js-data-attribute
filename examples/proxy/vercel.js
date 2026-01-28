/**
 * Vercel Edge Function Proxy for AiAttr
 *
 * Deploy this as a Vercel serverless function to securely proxy
 * OpenAI API requests while keeping your API key server-side.
 *
 * Setup:
 * 1. Create a new Vercel project or use an existing one
 * 2. Add this file as: api/ai-generate.js
 * 3. Set OPENAI_API_KEY in Vercel Environment Variables
 * 4. Deploy
 *
 * Usage in your frontend:
 * AiAttr.init({ proxyUrl: '/api/ai-generate' });
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get API key from environment
  const apiKey = process.env.OPENAI_API_KEY;
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
}
