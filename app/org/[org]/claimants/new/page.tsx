"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { isValidEmail, isValidPhone } from '@/lib/validation'

export default function NewClaimantPage({ params }: { params: { org: string } }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string }>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const nextFieldErrors: { name?: string; email?: string; phone?: string } = {}
    if (!name.trim()) nextFieldErrors.name = 'Name is required'
    if (email && !isValidEmail(email)) nextFieldErrors.email = 'Enter a valid email address'
    if (phone && !isValidPhone(phone)) nextFieldErrors.phone = 'Enter a valid phone number'
    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors)
      return setError('Please fix the highlighted fields')
    }
    setFieldErrors({})
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 ${fieldErrors.name ? 'border-destructive' : ''}`}
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                required
              />
              {fieldErrors.name && (
                <div id="name-error" role="alert" className="text-sm text-destructive mt-1">{fieldErrors.name}</div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 ${fieldErrors.email ? 'border-destructive' : ''}`}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <div id="email-error" role="alert" className="text-sm text-destructive mt-1">{fieldErrors.email}</div>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 ${fieldErrors.phone ? 'border-destructive' : ''}`}
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
              />
              {fieldErrors.phone && (
                <div id="phone-error" role="alert" className="text-sm text-destructive mt-1">{fieldErrors.phone}</div>
              )}
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
