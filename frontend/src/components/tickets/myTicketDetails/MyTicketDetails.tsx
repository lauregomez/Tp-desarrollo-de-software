import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import Button from '../../shared/button/Button'
import { formatPrice, formatShortDate, formatTime } from '../../../lib/format'
import { getMyTicket } from './MyTicketDetails.server'
import { TICKET_STATUS_LABEL } from '../../../types/ticket'
import type { Ticket } from '../../../types/ticket'

export default function MyTicketDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { state } = useLocation()
  const ticketFromState = state as Ticket | null

  // Si venimos con la entrada en el state, arrancamos con el dato puesto
  // y sin loading: no hay request ni parpadeo de carga.
  const [ticket, setTicket] = useState<Ticket | null>(ticketFromState ?? null)
  const [isLoading, setIsLoading] = useState(!ticketFromState)

  useEffect(() => {
    // Ya tenemos la entrada (o no hay id que pedir): no hace falta la request.
    if (ticketFromState || !id) return

    getMyTicket(id, {
      onSuccess: (data) => {
        setTicket(data)
        setIsLoading(false)
      },
      // Sin toast: el bloque de "no encontrada" de abajo ya explica qué pasó.
      // Acá cae el 404, tanto si la entrada no existe como si es de otro
      // usuario: el backend responde igual en los dos casos.
      onError: () => setIsLoading(false),
    })
  }, [id, ticketFromState])

  if (isLoading) {
    return <p className="text-muted">Cargando entrada…</p>
  }

  // No existe, no es tuya o falló la conexión.
  if (!ticket) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted">No se encontró la entrada {id}.</p>
        <Button variant="secondary" onClick={() => navigate('/mis-entradas')}>
          Volver al listado
        </Button>
      </div>
    )
  }

  const { match } = ticket

  return (
    <article className="max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-navy">
        {match.homeClub.name} vs {match.awayClub.name}
      </h2>

      <dl className="mt-4 space-y-1 text-sm text-muted">
        <div>
          <dt className="inline">Fecha: </dt>
          <dd className="inline">
            {formatShortDate(match.startsAt)} · {formatTime(match.startsAt)} hs
          </dd>
        </div>
        <div>
          <dt className="inline">Cancha: </dt>
          <dd className="inline">{match.court.name}</dd>
        </div>
        <div>
          <dt className="inline">Estado: </dt>
          <dd className="inline">{TICKET_STATUS_LABEL[ticket.status]}</dd>
        </div>
        {/* Sin pricePaid (vista de staff) no mostramos la línea: formatear
           undefined daría "$ NaN". */}
        {ticket.pricePaid && (
          <div>
            <dt className="inline">Precio pagado: </dt>
            <dd className="inline">{formatPrice(ticket.pricePaid)}</dd>
          </div>
        )}
      </dl>

      {/* El código es el dato que se va a convertir en QR. Mientras la
          entrada está PENDING todavía no existe: se genera al pagar. */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {ticket.code ? (
          <>
            <p className="text-sm font-medium text-navy">Código de acceso</p>
            {/* break-all evita que el código desborde la tarjeta en celular. */}
            <p className="mt-1 break-all font-mono text-sm">{ticket.code}</p>
            {/* La indicación sólo aplica a una entrada válida: en una USED
               el código queda visible como comprobante, pero ya no sirve
               para ingresar. */}
            {ticket.status === 'ACTIVE' && (
              <p className="mt-2 text-xs text-muted">
                Presentá este código en la entrada de la cancha.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            El código se genera cuando se confirma el pago.
          </p>
        )}
      </div>

      {ticket.status === 'PENDING' && ticket.reservedUntil && (
        <p className="mt-4 text-sm text-amber-700">
          Tu reserva vence a las {formatTime(ticket.reservedUntil)} hs.
        </p>
      )}

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={() => navigate('/mis-entradas')}>
          Volver
        </Button>
      </div>
    </article>
  )
}