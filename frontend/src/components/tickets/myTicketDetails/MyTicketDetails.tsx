import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import Button from '../../shared/button/Button'
import { formatPrice, formatShortDate, formatTime, courtName, clubName } from '../../../lib/format'
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
          {clubName(match.homeClub)} vs {clubName(match.awayClub)}
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
            <dd className="inline">{courtName(match.court)}</dd>
        </div>
        <div>
          <dt className="inline">Dirección: </dt>
            <dd className="inline">{match.court?.address ?? '—'}</dd>
        </div>
        <div>
          <dt className="inline">Estado: </dt>
          <dd className="inline">{TICKET_STATUS_LABEL[ticket.status]}</dd>
        </div>
        {/* Sin pricePaid (vista de staff) no mostramos la línea: formatear
           undefined daría "$ NaN". */}
        {ticket.pricePaid && (
          <div>
            {/* En PENDING el pago todavía no se confirmó: decir "Precio
                pagado" sería falso. El monto sí se muestra, porque es lo
                que va a pagar. */}
            <dt className="inline">
              {ticket.status === 'PENDING' ? 'Precio: ' : 'Precio pagado: '}
            </dt>
            <dd className="inline">{formatPrice(ticket.pricePaid)}</dd>
          </div>
        )}
      </dl>

      {/* El código es lo que el asistente le dicta al operador en la
          cancha. En PENDING todavía no existe: se genera al confirmarse
          el pago. */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {ticket.code ? (
          <>
            <p className="text-sm font-medium text-navy">Código de acceso</p>
            {ticket.status === 'ACTIVE' ? (
              <>
                {/* Monoespaciada para distinguir 0 de O, y con espacio
                    entre caracteres porque se dicta de a uno. */}
                <p className="mt-3 text-center font-mono text-4xl font-bold tracking-[0.3em] text-navy">
                  {ticket.code}
                </p>
                <p className="mt-2 text-center text-xs text-muted">
                  Decile este código al operador en la entrada de la cancha.
                </p>
              </>
            ) : (
              // En una USED el código queda como registro, pero chico y
              // atenuado: mostrarlo grande invitaría a presentarla de
              // nuevo y la validación la rechazaría.
              <p className="mt-3 text-center font-mono text-sm text-muted line-through">
                {ticket.code} · ya utilizada
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            El código se genera cuando se confirma el pago.
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={() => navigate('/mis-entradas')}>
          Volver
        </Button>
      </div>
    </article>
  )
}