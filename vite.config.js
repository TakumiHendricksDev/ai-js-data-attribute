// vite.config.js
import { defineConfig } from 'vite';
import generateAiPlugin from './src/vite-plugin-generate-ai';

export default defineConfig({
  plugins: [
    generateAiPlugin(),
    // ... other plugins
  ],
});