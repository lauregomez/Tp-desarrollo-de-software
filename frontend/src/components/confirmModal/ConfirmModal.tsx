import type { MouseEvent } from 'react'
import Button from '../shared/button/Button'

interface ConfirmModalProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title = 'Confirmar acción',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Devolver null es la forma de "no renderizar nada" en React.
  // Así el modal no ocupa lugar en el DOM mientras está cerrado.
  if (!open) {
    return null
  }

  // El click burbujea desde el contenido hasta el overlay. Comparar
  // target con currentTarget distingue el click en el fondo (cerrar)
  // del click dentro de la tarjeta (no cerrar).
  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onCancel()
    }
  }

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      {/* role="dialog" + aria-modal avisan a los lectores de pantalla
          que lo de atrás queda inerte mientras el modal está abierto. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-[420px] rounded-xl bg-white p-6"
      >
        <h2 id="confirm-modal-title" className="text-lg font-bold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted">{message}</p>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
