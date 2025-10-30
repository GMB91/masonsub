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
    // disable worker threads so tests that share filesystem state run sequentially
    threads: false,
  },
})
