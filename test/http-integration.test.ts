import { describe, it, expect } from 'vitest'
import { spawn } from 'child_process'
// use global fetch (Node 18+) or fallback to node-fetch if not available
const fetch = globalThis.fetch ?? (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('node-fetch')
  } catch {
    throw new Error('No fetch available in test environment')
  }
})()
import path from 'path'

function waitForHealth(url: string, timeout = 15000) {
  const start = Date.now()
  return new Promise<void>(async (resolve, reject) => {
    while (Date.now() - start < timeout) {
      try {
        const res = await fetch(url)
        if (res.ok) return resolve()
      } catch (e) {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 250))
    }
    reject(new Error('timeout waiting for health'))
  })
}

describe('HTTP integration (smoke)', () => {
  it('builds, starts production server, runs smoke script, and shuts down', async () => {
    // build
    const cwd = process.cwd()
    await new Promise((resolve, reject) => {
      const b = spawn('npm', ['run', 'build'], { cwd, shell: true, stdio: 'inherit' })
      b.on('exit', (code) => (code === 0 ? resolve(null) : reject(new Error('build failed'))))
    })

    // start server
    const server = spawn('npm', ['run', 'start'], { cwd, shell: true, stdio: 'pipe' })

    // stream some output for debugging
    server.stdout?.on('data', (d) => process.stdout.write(`[srv] ${d}`))
    server.stderr?.on('data', (d) => process.stderr.write(`[srv-err] ${d}`))

    try {
      await waitForHealth('http://localhost:3000/api/health', 20000)

      // run the smoke script
      await new Promise((resolve, reject) => {
        const s = spawn('node', [path.join('scripts', 'smoke-claimants.js')], {
          cwd,
          shell: true,
          stdio: 'inherit',
          env: { ...process.env, BASE_URL: 'http://localhost:3000' },
        })
        s.on('exit', (code) => (code === 0 ? resolve(null) : reject(new Error('smoke script failed'))))
      })
    } finally {
      // teardown
      server.kill()
    }
  }, 120000)
})
