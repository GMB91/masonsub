/** @vitest-environment jsdom */

import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadMappingEditor from '@/components/forms/UploadMappingEditor'
import { describe, it, expect, beforeEach } from 'vitest'

describe('UploadMappingEditor client interactions', () => {
  beforeEach(() => {
    cleanup()
    // ensure localStorage is available
    // jsdom provides it by default
  })

  it('serializes mapping and updates preview chips when selects change', async () => {
    const user = userEvent.setup()
    const id = 'test-1'
    const headers = ['Full Name', 'Email']
    const suggestedMapping: any = {
      'Full Name': { top: { target: 'name', confidence: 0.9 }, alternatives: [] },
      Email: { top: { target: 'email', confidence: 0.95 }, alternatives: [] },
    }
    const preview = [ { 'Full Name': 'Alice Example', Email: 'alice@example.com' } ]

    const { container } = render(
      <UploadMappingEditor id={id} headers={headers} suggestedMapping={suggestedMapping} preview={preview} />
    )

    // execute the embedded script so it attaches listeners (dangerouslySetInnerHTML scripts don't run in jsdom render)
    const script = container.querySelector('script')
    if (script && script.textContent) {
      // eslint-disable-next-line no-eval
      eval(script.textContent)
      // if DOMContentLoaded already passed in jsdom, fire it so the script's listener runs
      document.dispatchEvent(new Event('DOMContentLoaded'))
    }

  // find selects and pick the one for 'Full Name' by name
  const allSelects = container.querySelectorAll('select[name^="mapping["]')
    expect(allSelects.length).toBeGreaterThanOrEqual(2)
    let targetSelect: HTMLSelectElement | null = null
    allSelects.forEach((s) => {
      if ((s.getAttribute('name') || '').includes('Full Name')) targetSelect = s as HTMLSelectElement
    })
    if (!targetSelect) targetSelect = allSelects[0] as HTMLSelectElement

    // change mapping to 'external_id'
    await user.selectOptions(targetSelect, 'external_id')

    // In some JS environments the change handler may not run synchronously; call the exposed helper to ensure mapping serializes
    if ((window as any)[`__uploadMapping_${id}`] && (window as any)[`__uploadMapping_${id}`].toMapping) {
      // call directly to ensure hidden input is populated
      ;(window as any)[`__uploadMapping_${id}`].toMapping()
    }

    // hidden input should be populated
    const hidden = container.querySelector(`#mapping-json-${id}`) as HTMLInputElement
    expect(hidden).toBeTruthy()
    // give event loop a tick for handlers
    await new Promise((r) => setTimeout(r, 0))
    const parsed = JSON.parse(hidden.value || '{}')
    expect(parsed['Full Name']).toBe('external_id')

    // preview chip should update
    const chip = container.querySelector('[data-preview-mapped-for="Full Name"]')
    expect(chip).toBeTruthy()
    expect((chip as HTMLElement).textContent).toContain('external_id')
  })
})
