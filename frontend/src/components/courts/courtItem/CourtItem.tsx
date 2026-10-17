import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../../shared/button/Button'
import ConfirmModal from '../../confirmModal/ConfirmModal'
import type { Court } from '../../../types/court'

interface CourtItemProps {
  court: Court
  clubName: string
  onEdit: (court: Court) => void
  onDelete: (id: number) => void
}

export default function CourtItem({ court, clubName, onEdit, onDelete }: CourtItemProps) {
  const navigate = useNavigate()

  const [confirmOpen, setConfirmOpen] = useState(false)

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
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/canchas/${court.id}`, { state: court })}
        >
          Ver detalle
        </Button>
        <Button variant="primary" size="sm" onClick={() => onEdit(court)}>
          Editar
        </Button>
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