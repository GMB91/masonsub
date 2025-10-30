"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { Claimant } from "@/lib/claimantStore"
import Modal from "@/components/ui/modal"
import Snackbar from "@/components/ui/snackbar"
import Confirm from "@/components/ui/confirm"
import { isValidEmail, isValidPhone, normalizePhone } from "@/lib/validation"

type Props = {
  org: string
  initial?: Claimant[]
}

export default function ClaimantList({ org, initial = [] }: Props) {
  const [claimants, setClaimants] = useState<Claimant[]>(initial)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/claimants?org=${encodeURIComponent(org)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()
      setClaimants(body.claimants ?? [])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load fresh on mount
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError("Name is required")
    setCreating(true)
    try {
      const res = await fetch(`/api/claimants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org, name }),
      })
      if (!res.ok) throw new Error(`Create failed: ${res.status}`)
      const body = await res.json()
      setClaimants((s) => [body.claimant, ...s])
      setName("")
    } catch (err) {
      setError(String(err))
    } finally {
      setCreating(false)
    }
  }

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null)
  const pendingDeletes = React.useRef<Record<string, { item: Claimant; timer?: ReturnType<typeof setTimeout> }>>({})

  async function handleDelete(id: string) {
    // open confirm modal
    setConfirmTarget(id)
    setConfirmOpen(true)
  }

  function confirmDelete() {
    const id = confirmTarget
    setConfirmOpen(false)
    setConfirmTarget(null)
    if (!id) return
    // optimistic remove and schedule actual delete with undo window
    const item = claimants.find((c) => c.id === id)
    if (!item) return
    setClaimants((s) => s.filter((c) => c.id !== id))
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/claimants/${id}`, { method: "DELETE" })
      } catch (err) {
        setError(String(err))
      }
      delete pendingDeletes.current[id]
    }, 7000)
    pendingDeletes.current[id] = { item, timer }
    setSnack({ open: true, message: "Claimant deleted", actionLabel: "Undo", onAction: () => undoDelete(id) })
  }

  function undoDelete(id: string) {
    const pd = pendingDeletes.current[id]
    if (!pd) return
    if (pd.timer) clearTimeout(pd.timer)
    setClaimants((s) => [pd.item, ...s])
    delete pendingDeletes.current[id]
    setSnack({ open: true, message: "Delete undone" })
  }

  async function handleUpdate(id: string, patch: Partial<Claimant>) {
    // basic validation
    if (patch.email && !isValidEmail(patch.email as string)) {
      setError("Invalid email format")
      return
    }
    if (patch.phone) {
      const normalized = normalizePhone(patch.phone as string)
      if (!isValidPhone(normalized)) {
        setError("Invalid phone number")
        return
      }
      // ensure we send normalized phone
      // eslint-disable-next-line no-param-reassign
      patch.phone = normalized
    }
    try {
      const res = await fetch(`/api/claimants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error(`Update failed: ${res.status}`)
      const body = await res.json()
      setClaimants((s) => s.map((c) => (c.id === id ? body.claimant : c)))
    } catch (err) {
      setError(String(err))
    }
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [modalClaimant, setModalClaimant] = useState<Claimant | null>(null)
  const [editValues, setEditValues] = useState<Partial<Claimant>>({})
  const [snack, setSnack] = useState<{ open: boolean; message?: string | null; actionLabel?: string; onAction?: (() => void) }>(
    { open: false }
  )

  function openEditModal(c: Claimant) {
    setModalClaimant(c)
    setEditValues({ name: c.name, email: c.email as string | undefined, phone: c.phone as string | undefined })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setModalClaimant(null)
    setEditValues({})
  }

  async function saveEdit() {
    if (!modalClaimant) return
    await handleUpdate(modalClaimant.id, editValues)
    closeModal()
    setSnack({ open: true, message: "Claimant updated" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Claimants — {org}</h1>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New claimant name"
          className="rounded-md border px-3 py-2"
        />
        <Button type="submit" disabled={creating}>{creating ? "Creating…" : "Create"}</Button>
        <Button variant="outline" onClick={() => load()}>Refresh</Button>
      </form>

      {error && <div className="text-sm text-destructive">{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : claimants.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No claimants yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Create a claimant to get started.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {claimants.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">{c.email}</div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(c)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
  <Modal open={modalOpen} title={modalClaimant ? `Edit ${modalClaimant.name}` : "Edit"} onClose={closeModal}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={(editValues.name as string) ?? ""}
              onChange={(e) => setEditValues((s) => ({ ...s, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={(editValues.email as string) ?? ""}
              onChange={(e) => setEditValues((s) => ({ ...s, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={(editValues.phone as string) ?? ""}
              onChange={(e) => setEditValues((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => saveEdit()}>Save</Button>
          </div>
        </div>
      </Modal>
      <Confirm open={confirmOpen} title="Confirm delete" description="Are you sure you want to delete this claimant?" onCancel={() => setConfirmOpen(false)} onConfirm={() => confirmDelete()} />

      <Snackbar
        open={snack.open}
        message={snack.message}
        onClose={() => setSnack({ open: false })}
        actionLabel={snack.actionLabel}
        onAction={snack.onAction}
      />
    </div>
  )
}
