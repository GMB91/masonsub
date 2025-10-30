const fetch = globalThis.fetch ?? (() => {
  try {
    return require("node-fetch")
  } catch {
    throw new Error("No fetch available: install node-fetch or use Node 18+")
  }
})()

const BASE = process.env.BASE_URL || "http://localhost:3000"

async function run() {
  console.log("Smoke test: Claimants API against", BASE)

  // Create
  const createRes = await fetch(`${BASE}/api/claimants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ org: "demo", name: "Smoke Test User", email: "smoke@example.com" }),
  })
  if (createRes.status !== 201) {
    console.error("Create failed", createRes.status)
    process.exitCode = 2
    return
  }
  const created = await createRes.json()
  const id = created.claimant.id
  console.log("Created claimant", id)

  // List
  const listRes = await fetch(`${BASE}/api/claimants?org=demo`)
  if (listRes.status !== 200) {
    console.error("List failed", listRes.status)
    process.exitCode = 3
    return
  }
  const list = await listRes.json()
  console.log("List count", list.claimants.length)

  // Get
  const getRes = await fetch(`${BASE}/api/claimants/${id}`)
  if (getRes.status !== 200) {
    console.error("Get failed", getRes.status)
    process.exitCode = 4
    return
  }

  // Update
  const updRes = await fetch(`${BASE}/api/claimants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "+10000000000" }),
  })
  if (updRes.status !== 200) {
    console.error("Update failed", updRes.status)
    process.exitCode = 5
    return
  }

  // Delete
  const delRes = await fetch(`${BASE}/api/claimants/${id}`, { method: "DELETE" })
  if (delRes.status !== 200) {
    console.error("Delete failed", delRes.status)
    process.exitCode = 6
    return
  }

  console.log("Smoke test passed")
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 99
})
