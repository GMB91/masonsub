import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // mirror tsconfig `@/*` -> `./src/*`
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  // tests run with default worker settings; tests isolate filesystem via CLAIMANT_DATA_DIR
  },
})
