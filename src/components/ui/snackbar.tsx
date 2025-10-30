"use client"

import * as React from "react"

type Props = {
  message?: string | null
  open: boolean
  onClose: () => void
  duration?: number
  actionLabel?: string
  onAction?: () => void
}

export default function Snackbar({ message, open, onClose, duration = 3000, actionLabel, onAction }: Props) {
  React.useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose(), duration)
    return () => clearTimeout(t)
  }, [open, onClose, duration])

  if (!open || !message) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="rounded-md bg-gray-900 text-white px-4 py-2 shadow flex items-center gap-3">
        <div className="flex-1">{message}</div>
        {actionLabel && (
          <button className="underline text-sm" onClick={onAction}>{actionLabel}</button>
        )}
      </div>
    </div>
  )
}
