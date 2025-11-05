import fs from 'fs'
import path from 'path'
import os from 'os'

// Stable test environment variables (avoid assigning NODE_ENV during build)
process.env.NEXT_TELEMETRY_DISABLED = '1'

// File-backed storage dir for tests
const dataDir = path.join(os.tmpdir(), 'masonapp-tests', 'claimants')
process.env.CLAIMANT_DATA_DIR = process.env.CLAIMANT_DATA_DIR || dataDir

try {
  fs.mkdirSync(process.env.CLAIMANT_DATA_DIR, { recursive: true })
} catch {}

// Dummy Supabase and MCP values to avoid noisy fallbacks in tests
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321'
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test_anon_key'
process.env.MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:9999'

// Optionally shorten TTL for temp snapshots during tests
process.env.IMPORT_TMP_TTL_HOURS = process.env.IMPORT_TMP_TTL_HOURS || '24'

// Provide a minimal canvas context to silence JSDOM 'getContext' warnings in a11y/component tests
try {
  const g: any = globalThis as any
  const HTMLCanvasElement = g.window?.HTMLCanvasElement || g.HTMLCanvasElement
  if (HTMLCanvasElement && !HTMLCanvasElement.prototype.getContext) {
    HTMLCanvasElement.prototype.getContext = () => ({
      // minimal mock
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => ([]),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      resetTransform: () => {},
    }) as any
  }
} catch {}
