// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OwllDebugWidget',
      fileName: (format) => `owll-debug-widget.${format}.js`
    },
    rollupOptions: {
      output: {
        // UMD build için global değişken adı
        globals: {
          'owll-debug-widget': 'OwllDebugWidget'
        }
      }
    }
  }
});