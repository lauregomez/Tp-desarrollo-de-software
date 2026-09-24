import { useNavigate } from 'react-router'
import Button from '../../shared/button/Button'
import { formatPrice, formatShortDate, formatTime } from '../../../lib/format'
import { STATUS_CLASS } from './MyTicketItem.const'
import { TICKET_STATUS_LABEL } from '../../../types/ticket'
import type { Ticket } from '../../../types/ticket'

// La entrada entra por props: MyTicketList ya la tiene del listado
// y esta tarjeta sólo la muestra.
interface MyTicketItemProps {
  ticket: Ticket
}

export default function MyTicketItem({ ticket }: MyTicketItemProps) {
  const navigate = useNavigate()
  const { match } = ticket

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-navy">
          {match.homeClub.name} vs {match.awayClub.name}
        </h2>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
            STATUS_CLASS[ticket.status]
          }`}
        >
          {TICKET_STATUS_LABEL[ticket.status]}
        </span>
      </div>

      <p className="text-muted">
        {formatShortDate(match.startsAt)} · {formatTime(match.startsAt)} hs
      </p>
      <p className="text-muted">Cancha: {match.court.name}</p>
      {ticket.pricePaid && (
        <p className="text-muted">Pagaste: {formatPrice(ticket.pricePaid)}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Mandamos la entrada en el state: el detalle la muestra al
            instante sin volver a pedirla al servidor. */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/mis-entradas/${ticket.id}`, { state: ticket })}
        >
          Ver detalle
        </Button>
      </div>
    </article>
  )
}