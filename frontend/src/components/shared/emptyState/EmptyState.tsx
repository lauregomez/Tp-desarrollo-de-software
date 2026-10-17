import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message?: string
  action?: ReactNode
}

export default function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
        focusable="false"
        className="h-16 w-16 text-slate-300"
      >
        <circle cx="32" cy="32" r="28" />
        <polygon points="32,20 43,28 39,41 25,41 21,28" fill="currentColor" />
        <line x1="32" y1="20" x2="32" y2="4" />
        <line x1="43" y1="28" x2="58" y2="23" />
        <line x1="39" y1="41" x2="48" y2="55" />
        <line x1="25" y1="41" x2="16" y2="55" />
        <line x1="21" y1="28" x2="6" y2="23" />
      </svg>

      <h3 className="mt-4 text-lg font-semibold text-navy">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-muted">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}