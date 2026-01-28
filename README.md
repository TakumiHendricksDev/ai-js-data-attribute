# AiAttr 🤖💀

> "What if we let AI write JavaScript and then immediately execute it?" — Someone who should have been stopped

Add AI-generated JavaScript to HTML elements via `ai=""` attributes. No build step required - just include the script, pray to your preferred deity, and watch the chaos unfold. 🎲

## ⚠️ Disclaimer

This is a terrible idea. You should absolutely not use this in production. Or staging. Or probably even development. But here we are.

**Why does this exist?** Because we were so preoccupied with whether we could, we didn't stop to think if we should. 🦖

## 🚀 Quick Start (a.k.a. Speedrun to Regret)

### CDN Usage

```html
<!-- Include the library (point of no return) -->
<script src="https://cdn.jsdelivr.net/npm/ai-js-attr@latest/dist/ai-attr.min.js"></script>

<script>
  AiAttr.init({
    proxyUrl: '/api/ai-generate' // Your backend proxy (recommended)
    // OR for development only:
    // apiKey: 'sk-...' // 💸 Watch your money evaporate in real-time
  });
</script>

<!-- Describe what you want. Hope for the best. -->
<button ai="Show an alert saying Hello">Click me</button>
<div ai="Hide this element until it has content" id="messages"></div>
```

That's it! The library will:
1. 🔍 Scan the DOM for elements with `ai=""` attributes
2. 🤖 Ask an AI to write JavaScript (what could go wrong?)
3. 💾 Cache the generated code in localStorage (for faster future mistakes)
4. ⚡ Execute the code automatically (YOLO)
5. 👀 Watch for dynamically added elements (the chaos never stops)

### NPM Installation

```bash
npm install ai-js-attr  # No judgment here (okay, maybe a little)
```

```javascript
// ES Modules
import AiAttr from 'ai-js-attr';

// CommonJS
const AiAttr = require('ai-js-attr');

AiAttr.init({
  proxyUrl: '/api/ai-generate'  // Please use a proxy. Please.
});
```

## ⚙️ Configuration

```javascript
AiAttr.init({
  // API Configuration (one required, sanity optional)
  apiKey: 'sk-...',              // Direct API key (development only! 🔥)
  proxyUrl: '/api/ai-generate',  // Recommended: your backend proxy

  // Behavior
  attributeName: 'ai',           // Custom attribute name (default: 'ai')
  autoScan: true,                // Auto-scan on DOMContentLoaded
  observeChanges: true,          // Watch for dynamically added elements

  // AI Settings
  model: 'gpt-4o',               // The model writing your code 😬 (or 'auto')
  maxTokens: 300,                // Token limit for generated code
  temperature: 0.2,              // Low temp = more predictable chaos

  // Performance (v1.3.0+)
  batchProcessing: true,         // Process elements in parallel (faster!)
  batchConcurrency: 5,           // Number of concurrent API calls
  includeHtmlContext: true,      // Send surrounding HTML for smarter code

  // Caching
  cache: true,                   // Cache mistakes for later
  cachePrefix: 'ai-attr-',       // Cache key prefix
  cacheExpiry: 86400000,         // 24 hours of cached regret

  // UI Feedback
  showLoading: true,             // Add loading class while generating
  loadingClass: 'ai-loading',
  errorClass: 'ai-error',        // You'll see this one a lot 🙃

  // Callbacks
  onBeforeGenerate: (el, instruction) => {},
  onGenerated: (el, code) => {},  // Peek at your AI-generated destiny
  onError: (el, error) => {},     // The "I told you so" callback
  onComplete: () => {}            // Celebrate surviving
});
```

## ⚡ Performance Features (v1.3.0+)

### Batch Processing

By default, elements are processed in parallel for faster initialization:

```javascript
AiAttr.init({
  batchProcessing: true,   // Enable parallel processing (default: true)
  batchConcurrency: 5,     // Process 5 elements at once (default: 5)
});
```

With 20 elements on your page, this is ~5x faster than sequential processing. Your API bill arrives 5x faster too! 💸

### HTML Context

The AI now receives surrounding HTML structure, so it understands element relationships:

```html
<div class="demo-card">
  <button ai="Toggle visibility of the sibling div">Toggle</button>
  <div id="content">Hidden content</div>
</div>
```

The AI sees the sibling `#content` div and generates correct code. Disable if you want smaller prompts:

```javascript
AiAttr.init({
  includeHtmlContext: false,  // Disable HTML context (smaller prompts, dumber AI)
});
```

### Model Selection

```javascript
AiAttr.init({
  model: 'gpt-4o',     // Default: fast and capable
  // OR
  model: 'auto',       // Auto-select best model (currently picks gpt-4o)
  // OR
  model: 'gpt-4-turbo', // If you prefer the OG
});
```

## 📚 API

### `AiAttr.init(config)` 🎬
Initialize the library with configuration. Starts the chaos if `autoScan: true`.

### `AiAttr.scan(root?)` 🔍
Manually trigger a scan for `ai=""` elements. For when you want more chaos on demand.

### `AiAttr.generate(element)` 🎰
Generate code for a single element. Returns a Promise with the generated code (or your disappointment).

### `AiAttr.clearCache()` 🧹
Clear all cached generated code. Start fresh. Make new mistakes.

### `AiAttr.stop()` 🛑
Stop watching for dynamically added elements. The coward's way out.

### `AiAttr.getConfig()` 📋
Get the current configuration. See what you've done.

## 🖥️ Proxy Server Setup

**Important**: Never expose your OpenAI API key in client-side code for production. That's not a funny mistake, that's just expensive. 💸

### Vercel Edge Function

```javascript
// api/ai-generate.js
export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { prompt, model, maxTokens, temperature } = await request.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 300,
      temperature: temperature || 0.2,
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify({
    code: data.choices[0].message.content
  }));
}
```

See `examples/proxy/` for complete examples for:
- Vercel Edge Functions
- Express.js
- Cloudflare Workers

## 💾 Caching

Generated code is cached in localStorage by default because why generate the same questionable code twice? The cache key is based on:
- Element tag name
- Element ID
- Element classes
- The `ai=""` instruction text

Change the instruction = new code generated = new opportunity for things to go wrong! 🎉

Cache entries expire after 24 hours by default. Like milk, but for code.

## 🎪 Examples (Live Dangerously)

### Basic Button

```html
<button ai="Show an alert with a greeting">Say Hello</button>
<!-- Will it work? Probably! Will it be what you expected? Who knows! -->
```

### Form Validation

```html
<form ai="Validate that the email field contains a valid email before submitting">
  <input type="email" id="email" />
  <button type="submit">Submit</button>
</form>
<!-- AI-powered form validation. Your security team is crying. -->
```

### Dynamic Content

```html
<div ai="Fetch and display a random joke from an API" id="joke-container"></div>
<!-- The real joke is that you're using this library -->
```

### Conditional Visibility

```html
<div ai="Hide this element if it has no child elements" id="messages"></div>
<!-- CSS could do this but where's the fun in that? -->
```

### Interactive Elements

```html
<button ai="When clicked, change the background color of elements with class 'colorable' to a random color">
  Random Color
</button>
<!-- 3 lines of JS or 1 API call to OpenAI. Efficiency! 📈 -->
```

## 🎨 CSS Classes

The library adds these classes during processing:

- `.ai-loading` - Added while generating code (the suspense!)
- `.ai-error` - Added if generation fails (the disappointment!)

Style them as needed:

```css
.ai-loading {
  opacity: 0.5;
  cursor: wait;
  /* Waiting for AI to decide your fate */
}

.ai-error {
  border: 2px solid red;
  /* The visual representation of regret */
}
```

## 🔒 Security Considerations

1. **API Key Security**: Never expose your OpenAI API key in production. Seriously. Don't be that person. 🙅

2. **Generated Code**: The generated JavaScript runs in your page context with full access to everything. Only use on content you trust. Which, let's be honest, shouldn't include AI-generated code, but here we are.

3. **CSP Headers**: If you use Content Security Policy, you'll need to allow `'unsafe-eval'`. Yes, it's called **unsafe**-eval. Yes, you need it. No, we don't feel good about it either.

4. **Instruction Validation**: The instructions come from your HTML, so they're as secure as your HTML. If someone can modify your HTML, you have bigger problems than this library.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run dev server (opens browser automatically to witness the magic)
npm run dev

# Build for production (bold move)
npm run build
```

Build outputs:
- `dist/ai-attr.min.js` - IIFE for CDN/script tags
- `dist/ai-attr.es.js` - ES modules
- `dist/ai-attr.umd.js` - Universal module

## 🤔 FAQ

**Q: Should I use this in production?**
A: No. Absolutely not. Did you read the disclaimer?

**Q: But what if I really want to?**
A: We can't stop you. God knows we tried.

**Q: Is this secure?**
A: Define "secure." Actually, don't. The answer is no.

**Q: Why does this exist?**
A: Sometimes you have to build something to prove it shouldn't exist.

**Q: Can I blame you if something goes wrong?**
A: We provided a library that asks AI to write code and then executes it immediately. If you used it, that's on you, friend. 🤝

## 📜 License

MIT - Because even bad ideas deserve freedom. 🗽

---

*Built with equal parts curiosity and poor judgment.* ✨
