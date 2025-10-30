"use client"

import React from "react"
import Modal from "./modal"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  title?: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function Confirm({ open, title = "Confirm", description, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="space-y-4">
        {description && <div>{description}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </Modal>
  )
}
