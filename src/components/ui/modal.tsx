"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
}

function getFocusableElements(el: HTMLElement | null) {
  if (!el) return [] as HTMLElement[]
  return Array.from(
    el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  )
}

export function Modal({ open, title, onClose, children }: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const previouslyFocused = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    // focus first focusable element inside the modal
    const el = ref.current
    const focusables = getFocusableElements(el)
    if (focusables.length) focusables[0].focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
      }
      if (e.key === "Tab") {
        // trap focus
        const nodes = getFocusableElements(el)
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      // return focus
      try {
        previouslyFocused.current?.focus()
      } catch {
        /* ignore */
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div ref={ref} className="relative max-w-lg w-full rounded-lg bg-background p-6 shadow-lg z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default Modal
