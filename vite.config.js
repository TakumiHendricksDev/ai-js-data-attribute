// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'AiAttr',
      formats: ['umd', 'es', 'iife'],
      fileName: (format) => {
        if (format === 'iife') {
          return 'ai-attr.min.js';
        }
        return `ai-attr.${format}.js`;
      }
    },
    rollupOptions: {
      output: {
        // Ensure global variable is set for IIFE
        extend: true,
        // Use default export only to avoid the warning
        exports: 'default'
      }
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Minify the output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false // Keep console logs for debugging
      }
    }
  },
  // Dev server configuration for testing
  server: {
    open: true
  }
});
