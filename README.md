# AiAttr

Add AI-generated JavaScript to HTML elements via `ai=""` attributes. No build step required - just include the script and go.

## Quick Start

### CDN Usage

```html
<!-- Include the library -->
<script src="https://cdn.jsdelivr.net/npm/ai-js-attr@latest/dist/ai-attr.min.js"></script>

<script>
  AiAttr.init({
    proxyUrl: '/api/ai-generate' // Your backend proxy (recommended)
    // OR for development only:
    // apiKey: 'sk-...'
  });
</script>

<!-- Add ai="" attributes to your elements -->
<button ai="Show an alert saying Hello">Click me</button>
<div ai="Hide this element until it has content" id="messages"></div>
```

That's it! The library will:
1. Scan the DOM for elements with `ai=""` attributes
2. Generate JavaScript code using OpenAI (via your proxy)
3. Cache the generated code in localStorage
4. Execute the code automatically
5. Watch for dynamically added elements

### NPM Installation

```bash
npm install ai-js-attr
```

```javascript
// ES Modules
import AiAttr from 'ai-js-attr';

// CommonJS
const AiAttr = require('ai-js-attr');

AiAttr.init({
  proxyUrl: '/api/ai-generate'
});
```

## Configuration

```javascript
AiAttr.init({
  // API Configuration (one required)
  apiKey: 'sk-...',              // Direct API key (development only!)
  proxyUrl: '/api/ai-generate',  // Recommended: your backend proxy

  // Behavior
  attributeName: 'ai',           // Custom attribute name (default: 'ai')
  autoScan: true,                // Auto-scan on DOMContentLoaded
  observeChanges: true,          // Watch for dynamically added elements

  // AI Settings
  model: 'gpt-4-turbo',          // OpenAI model
  maxTokens: 150,
  temperature: 0.2,

  // Caching
  cache: true,                   // Enable localStorage caching
  cachePrefix: 'ai-attr-',       // Cache key prefix
  cacheExpiry: 86400000,         // 24 hours in ms

  // UI Feedback
  showLoading: true,             // Add loading class while generating
  loadingClass: 'ai-loading',
  errorClass: 'ai-error',

  // Callbacks
  onBeforeGenerate: (el, instruction) => {},
  onGenerated: (el, code) => {},
  onError: (el, error) => {},
  onComplete: () => {}
});
```

## API

### `AiAttr.init(config)`
Initialize the library with configuration. Automatically scans the DOM if `autoScan: true`.

### `AiAttr.scan(root?)`
Manually trigger a scan for `ai=""` elements. Optionally pass a root element to scan within.

### `AiAttr.generate(element)`
Generate code for a single element manually. Returns a Promise with the generated code.

### `AiAttr.clearCache()`
Clear all cached generated code from localStorage.

### `AiAttr.stop()`
Stop watching for dynamically added elements.

### `AiAttr.getConfig()`
Get the current configuration.

## Proxy Server Setup

**Important**: Never expose your OpenAI API key in client-side code for production. Use a proxy server instead.

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
      model: model || 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 150,
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

## Caching

Generated code is cached in localStorage by default. The cache key is based on:
- Element tag name
- Element ID
- Element classes
- The `ai=""` instruction text

This means if you change the instruction, new code will be generated. Cache entries expire after 24 hours by default.

## Examples

### Basic Button

```html
<button ai="Show an alert with a greeting">Say Hello</button>
```

### Form Validation

```html
<form ai="Validate that the email field contains a valid email before submitting">
  <input type="email" id="email" />
  <button type="submit">Submit</button>
</form>
```

### Dynamic Content

```html
<div ai="Fetch and display a random joke from an API" id="joke-container"></div>
```

### Conditional Visibility

```html
<div ai="Hide this element if it has no child elements" id="messages"></div>
```

### Interactive Elements

```html
<button ai="When clicked, change the background color of elements with class 'colorable' to a random color">
  Random Color
</button>
```

## CSS Classes

The library adds these classes during processing:

- `.ai-loading` - Added while generating code
- `.ai-error` - Added if generation fails

Style them as needed:

```css
.ai-loading {
  opacity: 0.5;
  cursor: wait;
}

.ai-error {
  border: 2px solid red;
}
```

## Security Considerations

1. **API Key Security**: Never expose your OpenAI API key in production. Always use a proxy server.

2. **Generated Code**: The generated JavaScript runs in your page context with full access. Only use on trusted content.

3. **CSP Headers**: If you use Content Security Policy, you may need to allow `'unsafe-eval'` for the generated code to execute.

4. **Instruction Validation**: The instructions come from your HTML, so they're as secure as your HTML content.

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

Build outputs:
- `dist/ai-attr.min.js` - IIFE for CDN/script tags
- `dist/ai-attr.es.js` - ES modules
- `dist/ai-attr.umd.js` - Universal module

## License

MIT
