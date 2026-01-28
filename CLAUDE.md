# CLAUDE.md - Project Documentation

## Project Overview

**AiAttr** (`ai-js-attr`) is a client-side JavaScript library that enables AI-generated JavaScript through HTML `ai=""` attributes. When initialized, it scans the DOM for elements with `ai=""` attributes, sends the instructions to OpenAI (via proxy or direct API), and executes the generated JavaScript code.

### Key Concept
```html
<button ai="Show an alert saying Hello">Click me</button>
```
The library reads the `ai` attribute, generates JavaScript code via OpenAI that fulfills the instruction, caches it in localStorage, and executes it.

## Tech Stack

- **Build Tool**: Vite
- **Language**: Vanilla JavaScript (ES6+ modules)
- **Output Formats**: IIFE (CDN), UMD, ES modules
- **Linting**: ESLint
- **Package Manager**: npm

## Project Structure

```
ai-js-data-attribute/
├── src/
│   ├── index.js              # Main entry point, AiAttr API object
│   ├── types.d.ts            # TypeScript declarations
│   ├── core/
│   │   ├── scanner.js        # DOM scanning for ai="" elements
│   │   ├── generator.js      # OpenAI API calls (direct/proxy)
│   │   ├── executor.js       # Safe execution of generated code
│   │   ├── cache.js          # localStorage caching with expiry
│   │   └── observer.js       # MutationObserver for dynamic elements
│   └── utils/
│       ├── prompt.js         # Prompt template builder
│       └── extractor.js      # Extracts JS from AI responses
├── examples/
│   └── proxy/
│       ├── vercel.js         # Vercel Edge Function example
│       ├── express.js        # Express.js server example
│       └── cloudflare-worker.js  # Cloudflare Worker example
├── dist/                     # Build output (generated)
│   ├── ai-attr.min.js        # IIFE for CDN usage
│   ├── ai-attr.es.js         # ES modules
│   └── ai-attr.umd.js        # Universal module
├── index.html                # Demo page
├── vite.config.js            # Vite build configuration
├── eslint.config.js          # ESLint configuration
└── package.json
```

## Core Modules

### `src/index.js`
Main entry point exposing the `AiAttr` object with methods:
- `init(config)` - Initialize with configuration
- `scan(root?)` - Manually trigger DOM scan
- `generate(element)` - Generate code for single element
- `clearCache()` - Clear localStorage cache
- `stop()` - Stop MutationObserver
- `getConfig()` - Get current config

### `src/core/scanner.js`
- `scanElements(config, root)` - Finds elements with `ai=""` attribute
- `markProcessed(element)` - Marks element with `data-ai-processed`
- `isProcessed(element)` - Checks if already processed

### `src/core/generator.js`
- `generateCode(element, instruction, config)` - Main generation function
- Supports both direct OpenAI API calls and proxy server
- Uses `buildPrompt()` to construct the prompt
- Uses `extractJavaScript()` to clean the response

### `src/core/executor.js`
- `executeCode(code, element, config)` - Executes generated code via `new Function()`
- `validateCode(code)` - Validates syntax before execution

### `src/core/cache.js`
- `generateCacheKey(element, instruction)` - Creates hash from element info
- `getCache(key, config)` / `setCache(key, code, config)` - localStorage operations
- `clearCache(config)` - Clears all cached entries
- Default expiry: 24 hours

### `src/core/observer.js`
- `startObserver(config, processCallback)` - Watches for dynamically added elements
- `stopObserver()` - Disconnects MutationObserver
- Monitors both new nodes and attribute changes

### `src/utils/prompt.js`
- `buildPrompt(element, instruction)` - Builds the prompt sent to OpenAI
- Includes element tag, ID, classes, type, and text content
- Instructs AI to return pure JavaScript without markdown

### `src/utils/extractor.js`
- `extractJavaScript(responseText)` - Strips markdown code blocks and prefixes
- `looksLikeJavaScript(code)` - Basic validation via pattern matching

## Configuration Options

```javascript
AiAttr.init({
  // API (one required)
  apiKey: 'sk-...',              // Direct API key (dev only)
  proxyUrl: '/api/ai-generate',  // Backend proxy (recommended)

  // Behavior
  attributeName: 'ai',           // Custom attribute name
  autoScan: true,                // Auto-scan on DOMContentLoaded
  observeChanges: true,          // Watch for dynamic elements

  // AI Settings
  model: 'gpt-4-turbo',
  maxTokens: 150,
  temperature: 0.2,

  // Caching
  cache: true,
  cachePrefix: 'ai-attr-',
  cacheExpiry: 86400000,         // 24 hours

  // UI
  showLoading: true,
  loadingClass: 'ai-loading',
  errorClass: 'ai-error',

  // Callbacks
  onBeforeGenerate: (el, instruction) => {},
  onGenerated: (el, code) => {},
  onError: (el, error) => {},
  onComplete: () => {}
});
```

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (opens browser)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
```

## Build Output

Vite builds three formats:
- `dist/ai-attr.min.js` - IIFE for `<script>` tags (exposes `window.AiAttr`)
- `dist/ai-attr.es.js` - ES modules for `import`
- `dist/ai-attr.umd.js` - UMD for CommonJS/AMD

## Security Notes

1. **Never expose API keys in production** - Use proxy servers
2. **Generated code runs with full page access** - Only use on trusted content
3. **CSP may require `'unsafe-eval'`** - Due to `new Function()` usage
4. Proxy examples in `examples/proxy/` demonstrate secure patterns

## Processing Flow

1. `init()` called with config
2. On DOM ready (if `autoScan: true`), `scan()` runs
3. For each element with `ai=""`:
   - Check if already processed (`data-ai-processed`)
   - Generate cache key from element info + instruction
   - Check localStorage cache
   - If not cached: call OpenAI via proxy/direct API
   - Extract JavaScript from response
   - Validate syntax
   - Cache the code
   - Execute via `new Function()`
   - Mark as processed
4. MutationObserver watches for new elements (if `observeChanges: true`)

## Testing the Demo

1. Run `npm run dev`
2. Enter your OpenAI API key or proxy URL in the config panel
3. Click "Initialize"
4. Interact with the demo buttons
