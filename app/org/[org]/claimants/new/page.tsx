"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function NewClaimantPage({ params }: { params: { org: string } }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError("Name is required")
    setLoading(true)
    try {
      const res = await fetch(`/api/claimants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org: params.org, name, email, phone }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `HTTP ${res.status}`)
      }
      // navigate back to claimants list
      router.push(`/org/${params.org}/claimants`)
    } catch (err: unknown) {
      setError((err as Error)?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create claimant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create"}
              </Button>
              <Button variant="outline" asChild>
                <a href={`/org/${params.org}/claimants`}>Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
