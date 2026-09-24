import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../../shared/button/Button'
import ConfirmModal from '../../confirmModal/ConfirmModal'
import type { Court } from '../../../types/court'

// La tarjeta recibe el nombre del club ya resuelto en vez de pedirlo al servidor:
// CourtList carga los clubes una sola vez y evita una request por cada cancha.
// onEdit y onDelete son callbacks del padre: la tarjeta sólo avisa qué quiso
// hacer el usuario y CourtList decide qué significa.
interface CourtItemProps {
  court: Court
  clubName: string
  onEdit: (court: Court) => void
  onDelete: (id: number) => void
}

export default function CourtItem({ court, clubName, onEdit, onDelete }: CourtItemProps) {
  const navigate = useNavigate()

  // Estado local: el modal es efímero, no hace falta una ruta para él.
  // Vive acá y no en CourtList para que cada tarjeta tenga el suyo.
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Cerramos el modal antes de avisar hacia arriba, así la tarjeta
  // no queda con el diálogo abierto mientras se procesa el borrado.
  const handleConfirmDelete = () => {
    setConfirmOpen(false)
    onDelete(court.id)
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold text-navy">{court.name}</h2>
      <p className="text-muted">Club: {clubName}</p>
      <p className="text-muted">Dirección: {court.address}</p>
      <p className="text-muted">Capacidad: {court.capacity}</p>

      <div className="flex flex-wrap gap-2">
        {/* Mandamos la cancha en el state: el detalle la muestra
            al instante sin volver a pedirla al servidor. */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/canchas/${court.id}`, { state: court })}
        >
          Ver detalle
        </Button>
        {/* Mandamos la cancha entera hacia arriba: CourtList la pasa
            en el state de la navegación para precargar el formulario. */}
        <Button variant="primary" size="sm" onClick={() => onEdit(court)}>
          Editar
        </Button>
        {/* Este botón NO borra: abre el modal. El borrado real
            ocurre recién en handleConfirmDelete. */}
        <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
          Eliminar
        </Button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar cancha"
        message={`¿Estás seguro de que querés eliminar "${court.name}"? También se eliminan sus partidos en borrador. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  )
}