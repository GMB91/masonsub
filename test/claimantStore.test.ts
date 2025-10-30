import { describe, it, expect } from "vitest"
import fs from "fs/promises"
import path from "path"
import os from "os"

describe("claimantStore (file-backed)", () => {
  it("creates, reads, updates and deletes a claimant", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "masonsub-"))
    const prev = process.env.CLAIMANT_DATA_DIR
    try {
      // point the store at an isolated temp data dir
      process.env.CLAIMANT_DATA_DIR = tmp
      // import store after setting env so it picks up the override
      const store = (await import("../src/lib/claimantStore")) as typeof import("../src/lib/claimantStore")

  const DATA_FILE = path.resolve(tmp, "data", "claimants.json")

  // ensure data dir and a fresh file
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf-8")

      const created = await store.createClaimant({ org: "test", name: "Alice" })
      expect(created).toHaveProperty("id")
      const list = await store.getClaimants("test")
      expect(list.length).toBe(1)

      const got = await store.getClaimantById(created.id)
      expect(got?.name).toBe("Alice")

      const updated = await store.updateClaimant(created.id, { name: "Alice B" })
      expect(updated?.name).toBe("Alice B")

      const deleted = await store.deleteClaimant(created.id)
      expect(deleted).toBe(true)
    } finally {
      if (prev === undefined) delete process.env.CLAIMANT_DATA_DIR
      else process.env.CLAIMANT_DATA_DIR = prev
      await fs.rm(tmp, { recursive: true, force: true }).catch(() => undefined)
    }
  })
})
