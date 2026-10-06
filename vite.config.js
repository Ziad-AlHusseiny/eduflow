import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Two builds share this config: the client bundle (`vite build`) and the
// prerender bundle (`vite build --ssr src/entry-server.jsx`), which
// scripts/prerender.mjs runs once per page and language to write static HTML.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // Fonts and photos stay files (preloaded, cached by the service worker), never base64.
    assetsInlineLimit: 0,
    // prerender.mjs reads it to preload each page's own route chunk.
    manifest: true,
    // TypeScript (for the TS exercises) is one big lazy chunk by design.
    chunkSizeWarningLimit: 4000,
  },
  ssr: {
    noExternal: ['lucide-react'],
  },
  worker: {
    format: 'es',
  },
  test: {
    include: ['src/**/*.test.js', 'scripts/**/*.test.js'],
  },
});
