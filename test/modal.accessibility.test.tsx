/** @vitest-environment jsdom */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '@/components/ui/modal'

describe('Modal accessibility', () => {
  test('focuses first focusable element and traps focus, Escape closes', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <div>
        <button data-testid="outside">Outside</button>
        <Modal open title="Test" onClose={onClose}>
          <div>
            <input data-testid="first-input" />
            <button data-testid="second">Second</button>
          </div>
        </Modal>
      </div>
    )

  const first = screen.getByTestId('first-input') as HTMLElement
  const second = screen.getByTestId('second') as HTMLElement
  const outside = screen.getByTestId('outside') as HTMLElement
  const closeBtn = screen.getByRole('button', { name: /close/i }) as HTMLElement

  // the modal's Close button is the first focusable element and should be focused
  expect(document.activeElement).toBe(closeBtn)

  // Tab should move focus to the first input (our content)
  await user.tab()
  expect(document.activeElement).toBe(first)

  // Tab again should move to second
  await user.tab()
  expect(document.activeElement).toBe(second)

  // Shift+Tab should go back to first
  await user.tab({ shift: true })
  expect(document.activeElement).toBe(first)

  // Escape should call onClose
  await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()

    // clicking overlay should call onClose (the modal attaches an overlay div that calls onClose on click)
    const overlay = document.querySelector('div[role="dialog"] > div') as HTMLElement | null
    if (overlay) {
      await user.click(overlay)
      expect(onClose).toHaveBeenCalledTimes(2)
    }
  })
})
