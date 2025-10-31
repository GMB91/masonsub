/** @vitest-environment jsdom */

// mock modal to simplify UI tests (avoid flaky focus/portal issues)
vi.mock('@/components/ui/modal', async (importOriginal: any) => {
  const React = await import('react')
  return {
    default: ({ open, title, onClose, children }: any) =>
      open ? React.createElement('div', { role: 'dialog' }, children, React.createElement('button', { onClick: onClose }, 'Close')) : null,
  }
})

import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, waitFor, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClaimantList from '@/components/claimants/ClaimantList'
import type { Claimant } from '@/types/claimant'

const sample: Claimant = {
  id: 'abc123',
  org: 'demo',
  name: 'Alice',
  email: 'alice@example.com',
  phone: '+11234567890',
  createdAt: new Date().toISOString(),
}

describe('ClaimantList UI', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    cleanup()
    // basic fetch mock that responds by URL/method
    vi.stubGlobal('fetch', async (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url
      const method = (init && init.method) || 'GET'
      if (url.includes('/api/claimants') && method === 'GET') {
        return { ok: true, json: async () => ({ claimants: [sample] }) } as unknown as Response
      }
      if (/\/api\/claimants\/.+/.test(url) && method === 'PUT') {
        const id = url.split('/').pop() || sample.id
        const body = init?.body ? JSON.parse(String(init.body)) : {}
        const updated = { ...sample, ...body, id }
        return { ok: true, json: async () => ({ claimant: updated }) } as unknown as Response
      }
      if (url.endsWith('/api/claimants') && method === 'POST') {
        const body = init?.body ? JSON.parse(String(init.body)) : {}
        const created = { ...body, id: 'newid', createdAt: new Date().toISOString() }
        return { ok: true, json: async () => ({ claimant: created }) } as unknown as Response
      }
      if (/\/api\/claimants\/.+/.test(url) && method === 'DELETE') {
        return { ok: true, json: async () => ({ deleted: true }) } as unknown as Response
      }
      return { ok: false, status: 500, json: async () => ({}) } as unknown as Response
    })
  })

  afterEach(() => {
    // restore the stubbed fetch
    // restore test globals
    vi.unstubAllGlobals()
  })

  test('creates a claimant via the inline create input', async () => {
    render(<ClaimantList org="demo" initial={[sample]} />)
    const nameInput = screen.getByPlaceholderText('New claimant name') as HTMLInputElement
    const createBtn = screen.getByRole('button', { name: /create/i })

    await user.type(nameInput, 'Bob')
    await user.click(createBtn)

    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument())
  })

  test('opens edit modal, updates claimant and reflects change', async () => {
    render(<ClaimantList org="demo" initial={[sample]} />)
  // find the specific card for our sample claimant and click its Edit button
  const title = await screen.findByText('Alice')
  const card = title.closest('[data-slot="card"]')
  if (!card) throw new Error('card not found')
  const editBtn = within(card as HTMLElement).getByRole('button', { name: /edit/i })
  await user.click(editBtn)

    // modal should show and input should have current name
    const modalName = await screen.findByLabelText('Name') as HTMLInputElement
    expect(modalName.value).toBe('Alice')

    await user.clear(modalName)
    await user.type(modalName, 'Alice Cooper')

  const dialog = await screen.findByRole('dialog')
  const saveBtn = within(dialog).getByText(/^Save$/i)
  await user.click(saveBtn)

    await waitFor(() => expect(screen.getByText('Alice Cooper')).toBeInTheDocument())
  })
})
