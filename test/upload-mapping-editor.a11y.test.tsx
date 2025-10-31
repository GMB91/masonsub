/** @vitest-environment jsdom */

import React from 'react'
import { render } from '@testing-library/react'
import UploadMappingEditor from '@/components/forms/UploadMappingEditor'
import * as axe from 'axe-core'
import { expect } from 'vitest'

describe('UploadMappingEditor accessibility', () => {
  it('has no critical accessibility violations', async () => {
    const id = 'a11y-1'
    const headers = ['Full Name', 'Email']
    const suggestedMapping: any = {
      'Full Name': { top: { target: 'name', confidence: 0.9 }, alternatives: [] },
      Email: { top: { target: 'email', confidence: 0.95 }, alternatives: [] },
    }
    const preview = [{ 'Full Name': 'Alice Example', Email: 'alice@example.com' }]

    const { container } = render(
      <UploadMappingEditor id={id} headers={headers} suggestedMapping={suggestedMapping} preview={preview} />
    )

    // axe-core exposes run; use it directly
    // @ts-ignore
    const results = await (axe as any).run(container)
    const violations = (results.violations || []).filter((v: any) => v.impact === 'critical' || v.impact === 'serious')
    expect(violations.length).toBe(0)
  })
})
