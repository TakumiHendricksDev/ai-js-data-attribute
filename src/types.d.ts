/**
 * TypeScript declarations for AiAttr
 */

export interface AiAttrConfig {
  /** OpenAI API key (development only - use proxyUrl for production) */
  apiKey?: string;

  /** URL of your backend proxy server (recommended for production) */
  proxyUrl?: string;

  /** Custom attribute name to scan for (default: 'ai') */
  attributeName?: string;

  /** Automatically scan DOM on DOMContentLoaded (default: true) */
  autoScan?: boolean;

  /** Watch for dynamically added elements (default: true) */
  observeChanges?: boolean;

  /** OpenAI model to use (default: 'gpt-4-turbo') */
  model?: string;

  /** Maximum tokens for AI response (default: 150) */
  maxTokens?: number;

  /** Temperature for AI response (default: 0.2) */
  temperature?: number;

  /** Enable localStorage caching (default: true) */
  cache?: boolean;

  /** Prefix for cache keys (default: 'ai-attr-') */
  cachePrefix?: string;

  /** Cache expiry time in milliseconds (default: 86400000 / 24 hours) */
  cacheExpiry?: number;

  /** Add loading class while generating (default: true) */
  showLoading?: boolean;

  /** CSS class to add while loading (default: 'ai-loading') */
  loadingClass?: string;

  /** CSS class to add on error (default: 'ai-error') */
  errorClass?: string;

  /** Callback before generating code for an element */
  onBeforeGenerate?: (element: HTMLElement, instruction: string) => void;

  /** Callback after code is generated for an element */
  onGenerated?: (element: HTMLElement, code: string) => void;

  /** Callback when an error occurs */
  onError?: (element: HTMLElement, error: Error) => void;

  /** Callback when all elements have been processed */
  onComplete?: () => void;
}

export interface AiAttr {
  /** Initialize the library with configuration */
  init(config: AiAttrConfig): void;

  /** Manually scan for ai="" elements */
  scan(root?: HTMLElement | Document): Promise<number>;

  /** Generate code for a single element */
  generate(element: HTMLElement): Promise<string | null>;

  /** Clear all cached generated code */
  clearCache(): void;

  /** Stop watching for dynamically added elements */
  stop(): void;

  /** Get current configuration */
  getConfig(): AiAttrConfig;

  /** Library version */
  version: string;
}

declare const AiAttr: AiAttr;

export { AiAttr };
export default AiAttr;

declare global {
  interface Window {
    AiAttr: AiAttr;
  }
}
