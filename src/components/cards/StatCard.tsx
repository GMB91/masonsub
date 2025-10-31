"use client"
import React from 'react'
import clsx from 'clsx'

type StatCardProps = {
  title: string
  value: string | number
  delta?: string | number
  description?: string
  icon?: React.ReactNode
  variant?: 'sm' | 'md' | 'lg'
  skeleton?: boolean
}

export default function StatCard({ title, value, delta, description, icon, variant = 'md', skeleton = false }: StatCardProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={clsx(
        'bg-white p-4 rounded-lg shadow-sm border border-gray-100',
        variant === 'sm' && 'p-3 text-sm',
        variant === 'lg' && 'p-6',
        skeleton && 'animate-pulse'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon ? <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-50">{icon}</div> : <div className="w-10 h-10 rounded-md bg-gray-50" />}
          <div>
            <div className="text-xs text-gray-500">{title}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
          </div>
        </div>

        {delta ? (
          <div className={clsx('text-sm font-medium', String(delta).trim().startsWith('-') ? 'text-red-600' : 'text-green-600')}>
            {String(delta)}
          </div>
        ) : null}
      </div>

      {description ? <div className="mt-3 text-xs text-gray-500">{description}</div> : null}
    </div>
  )
}

