/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(async () => {
  const decoratorsPlugin = (await import("@open-xchange/vite-plugin-es-decorators")).default;

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/my-app',
    server: {
      port: 4200,
      host: 'localhost',
    },
    preview: {
      port: 4300,
      host: 'localhost',
    },
    plugins: [
      react({
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { version: "legacy" }],
            ["@babel/plugin-proposal-class-properties", { loose: true }]
          ]
        }
      }),
      nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']), decoratorsPlugin()],
    build: {
      outDir: '../../dist/apps/my-app',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    test: {
      watch: false,
      globals: true,
      environment: 'jsdom',
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/apps/my-app',
        provider: 'v8' as const,
      },
    },
  };
});