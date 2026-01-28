/**
 * Express.js Proxy Server for AiAttr
 *
 * A simple Express server that proxies OpenAI API requests
 * while keeping your API key secure on the server side.
 *
 * Setup:
 * 1. npm install express cors dotenv
 * 2. Create .env file with OPENAI_API_KEY=your-key
 * 3. node express.js
 *
 * Usage in your frontend:
 * AiAttr.init({ proxyUrl: 'http://localhost:3001/api/ai-generate' });
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Configure CORS properly for production
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AI generation endpoint
app.post('/api/ai-generate', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { prompt, model = 'gpt-4-turbo', maxTokens = 150, temperature = 0.2 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: error.error?.message || 'OpenAI API error'
      });
    }

    const data = await response.json();
    const code = data.choices[0].message.content;

    res.json({ code });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`AiAttr proxy server running on http://localhost:${PORT}`);
  console.log(`Endpoint: POST http://localhost:${PORT}/api/ai-generate`);
});
