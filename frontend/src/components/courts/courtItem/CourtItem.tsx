import { useNavigate } from 'react-router'
import Button from '../../shared/button/Button'
import type { Court } from '../../../types/court'

 // onEdit es un callback del padre: la tarjeta sólo avisa qué quiso hacer
 // el usuario y CourtList decide qué significa.
interface CourtItemProps {
  court: Court
  clubName: string
  onEdit: (court: Court) => void
}

export default function CourtItem({ court, clubName, onEdit }: CourtItemProps) {
    const navigate = useNavigate()
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-navy">{court.name}</h2>
        <p className="text-muted">Club: {clubName}</p>
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
       </div>
    </article>
  )
}