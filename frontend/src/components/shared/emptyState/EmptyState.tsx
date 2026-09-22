import type { ReactNode } from 'react'

// Estado vacío reutilizable para cualquier listado. Unifica cómo se ve
// "no hay nada para mostrar" en toda la app: si cambia el diseño, se cambia acá.
interface EmptyStateProps {
  title: string
  // Texto secundario opcional, por ejemplo qué puede hacer el usuario.
  message?: string
  // Acción opcional (un botón o un link) que decide cada módulo.
  action?: ReactNode
}

export default function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      {/* Pelota de fútsal simplificada. Decorativa: el mensaje lo da el texto. */}
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