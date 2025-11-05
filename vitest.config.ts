import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // mirror tsconfig paths: `@/*` -> `./src/*`, `@/lib/*` -> `./lib/*`
      '@/lib': path.resolve(__dirname, 'lib'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['test/setup.ts'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      ...(process.env.SKIP_E2E === '1'
        ? [
            'test/**/*e2e*.test.ts',
            'test/**/a11y.site.test.ts',
            'test/**/http-integration.test.ts'
          ]
        : []),
    ],
  // tests run with default worker settings; tests isolate filesystem via CLAIMANT_DATA_DIR
  },
})
