// Simple health check script for local dev server
// Tries port 3000 then 3001 and exits 0 if any responds with status 200
const { setTimeout: delay } = require('timers/promises')

async function probe(url, timeout = 3000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (err) {
    clearTimeout(id)
    throw err
  }
}

async function main() {
  const urls = [
    'http://localhost:3000/api/health',
    'http://localhost:3001/api/health'
  ]
  for (const url of urls) {
    try {
      const res = await probe(url, 3000)
      console.log(`${url} -> ${res.status}`)
      if (res.status === 200) process.exit(0)
    } catch (err) {
      console.error(`${url} failed: ${err.message}`)
    }
  }
  console.error('No health endpoint responded with 200')
  process.exit(2)
}

main()
