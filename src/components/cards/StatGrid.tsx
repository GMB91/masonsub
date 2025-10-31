"use client"
import React from 'react'

export default function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </section>
  )
}
