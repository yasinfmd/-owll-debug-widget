import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OwllDebugWidget',
      fileName: (format) => `owll-debug-widget.${format}.js`,
    },
    rollupOptions: {
      output: {
        globals: {
          'owll-debug-widget': 'OwllDebugWidget',
        },
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true, 
      outputDir: resolve(__dirname, 'dist/types'), 
    }),
  ],
});
