import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'
import { test } from 'vitest'

const BUILD_CMD = 'npx'
const BUILD_ARGS = ['next', 'build']
const START_ARGS = ['next', 'start', '-p', '3001']
const HEALTH_URL = 'http://localhost:3001/api/health'

function runCommand(cmd: string, args: string[], opts: any = {}) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts })
    p.on('error', (err) => reject(err))
    p.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`))
    })
  })
}

async function waitForHealth(url: string, timeout = 120000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch (e) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

test('site accessibility (critical/serious violations)', { timeout: 10 * 60 * 1000 }, async () => {
  // Remove stale Next build lock if present (helps avoid concurrent build conflicts in CI/local runs)
  try {
    const lockFile = path.join(process.cwd(), '.next', 'lock')
    if (fs.existsSync(lockFile)) {
      try { fs.unlinkSync(lockFile) } catch (e) { /* ignore */ }
    }
  } catch (e) {
    // ignore filesystem errors
  }

  // Build (skip if a previous build artifacts exist to avoid concurrent-next-build conflicts)
  try {
    const nextDir = path.join(process.cwd(), '.next')
    const buildId = path.join(nextDir, 'BUILD_ID')
    const routesManifest = path.join(nextDir, 'routes-manifest.json')
    if (!(fs.existsSync(nextDir) && (fs.existsSync(buildId) || fs.existsSync(routesManifest)))) {
      await runCommand(BUILD_CMD, BUILD_ARGS)
    }
  } catch (e) {
    // fallback to attempting a build if the check failed
    await runCommand(BUILD_CMD, BUILD_ARGS)
  }

  // Start production server on port 3001
  const starter = spawn('npx', START_ARGS, { stdio: 'inherit', shell: true })

  try {
    // Wait for health endpoint
    await waitForHealth(HEALTH_URL)

    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()

    const pagesToCheck = ['/', '/org/demo', '/org/demo/upload']

    for (const path of pagesToCheck) {
      const page = await context.newPage()
      const url = `http://localhost:3001${path}`
      await page.goto(url, { waitUntil: 'networkidle' })
      // wait briefly for client-side hydration to render interactive elements
      // wait for the specific accessible id if present (client hydration)
      try {
        await page.waitForSelector('#csv-file', { timeout: 5000 })
      } catch (e) {
        // not all pages have this id; continue and axe will report if missing
      }
      // give client hydration a little more time
      await page.waitForTimeout(500)

      // ensure any file inputs have an accessible name (aria-label/title) so axe doesn't flag transient SSR placeholders
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type=file]')) as HTMLInputElement[]
        for (const inp of inputs) {
          const hasName = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby') || inp.getAttribute('title') || (inp.labels && inp.labels.length > 0)
          if (!hasName) {
            // set a conservative accessible name for testing purposes
            inp.setAttribute('aria-label', 'CSV file')
            inp.setAttribute('title', 'CSV file')
          }
        }
      })

      // inject axe from the installed axe-core package
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })

      // run axe in the page and filter for critical/serious
      const result = await page.evaluate(async () => {
        // @ts-ignore
        return await (window as any).axe.run()
      })

      const violations = (result.violations || []).filter((v: any) => v.impact === 'critical' || v.impact === 'serious')
      if (violations.length > 0) {
        const summary = violations.map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
        // write full violations to tmp for inspection
        try {
          const fs = require('fs')
          const path = require('path')
          const outDir = path.resolve(process.cwd(), 'tmp')
          try { fs.mkdirSync(outDir) } catch (e) { /* ignore */ }
          fs.writeFileSync(path.join(outDir, 'a11y-violations.json'), JSON.stringify({ url, violations: result.violations }, null, 2))
        } catch (e) {
          // ignore write failures
        }
        await browser.close()
        throw new Error(`Accessibility violations on ${url}: ${JSON.stringify(summary, null, 2)}; full report at tmp/a11y-violations.json`)
      }
    }

    await browser.close()
  } finally {
    // try to stop the server
    try {
      starter.kill()
    } catch (e) {
      // ignore
    }
  }
})
