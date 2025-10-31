#!/usr/bin/env node
const fs = require('fs').promises
const path = require('path')

async function run() {
  try {
    const TMP_DIR = path.join(process.cwd(), 'tmp', 'imports')
    const hoursEnv = Number(process.env.IMPORT_TMP_TTL_HOURS)
    const hours = Number.isFinite(hoursEnv) && hoursEnv > 0 ? hoursEnv : 24
    console.log(`Cleaning up tmp/imports older than ${hours}h...`)
    await fs.mkdir(TMP_DIR, { recursive: true })
    const files = await fs.readdir(TMP_DIR)
    const now = Date.now()
    const cutoff = now - hours * 3600 * 1000
    for (const f of files) {
      try {
        const p = path.join(TMP_DIR, f)
        const st = await fs.stat(p)
        if (st.mtimeMs < cutoff) {
          await fs.unlink(p)
          console.log('deleted', f)
        }
      } catch (e) {
        // ignore per-file errors
        console.warn('skipping', f, e && e.message)
      }
    }
    console.log('Done')
  } catch (e) {
    console.error('cleanup failed', e)
    process.exit(1)
  }
}

run()
