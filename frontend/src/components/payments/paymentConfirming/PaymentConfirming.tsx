import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { ApiError } from '../../../lib/api'
import { PENDING_PURCHASE_KEY } from '../../tickets/buyTickets/BuyTickets.const'
import { getTicket } from './PaymentConfirming.server'

const POLL_INTERVAL_MS = 2000
// 30 intentos cada 2 segundos: aproximadamente un minuto de espera.
const MAX_ATTEMPTS = 30

type Status = 'waiting' | 'failed' | 'timeout'

// Lee los ids que guardó BuyTickets antes de ir a MercadoPago.
// sessionStorage es texto: se valida la forma antes de usarlo, porque
// puede estar vacío o haber sido modificado a mano.
function readPendingPurchase(): number[] | null {
  try {
    const raw = sessionStorage.getItem(PENDING_PURCHASE_KEY)
    if (!raw) return null
    const ids: unknown = JSON.parse(raw)
    if (Array.isArray(ids) && ids.length > 0 && ids.every(Number.isInteger)) {
      return ids as number[]
    }
    return null
  } catch {
    return null
  }
}

const LINK_CLASS =
  'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110'

export default function PaymentConfirming() {
  const navigate = useNavigate()
  // Inicializador lazy: se lee una sola vez al montar, sin useEffect.
  const [ticketIds] = useState(readPendingPurchase)
  const [status, setStatus] = useState<Status>('waiting')

  useEffect(() => {
    if (!ticketIds) return

    // Mismo mecanismo que MyTicketList: si el componente se desmonta,
    // las respuestas que lleguen después se ignoran.
    let ignore = false
    let attempts = 0
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const scheduleNext = () => {
      if (attempts >= MAX_ATTEMPTS) {
        sessionStorage.removeItem(PENDING_PURCHASE_KEY)
        setStatus('timeout')
        return
      }
      timeoutId = setTimeout(check, POLL_INTERVAL_MS)
    }

    // Alcanza con consultar la primera entrada: el backend confirma todas
    // las de la orden en la misma transacción.
    const check = () => {
      attempts++
      getTicket(ticketIds[0], {
        onSuccess: (ticket) => {
          if (ignore) return
          if (ticket.status === 'ACTIVE') {
            sessionStorage.removeItem(PENDING_PURCHASE_KEY)
            // replace: si el usuario vuelve atrás, no cae de nuevo en esta
            // pantalla a esperar un pago que ya se confirmó.
            if (ticketIds.length === 1) {
              navigate(`/mis-entradas/${ticket.id}`, { replace: true, state: ticket })
            } else {
              navigate('/mis-entradas', { replace: true })
            }
            return
          }
          scheduleNext() // sigue PENDING: el webhook todavía no llegó
        },
        onError: (error) => {
          if (ignore) return
          // 404: el pago se rechazó y el backend borró las entradas.
          if (error instanceof ApiError && error.status === 404) {
            sessionStorage.removeItem(PENDING_PURCHASE_KEY)
            setStatus('failed')
            return
          }
          scheduleNext() // error de red: puede ser pasajero, se reintenta
        },
      })
    }

    check()

    return () => {
      ignore = true
      clearTimeout(timeoutId)
    }
  }, [ticketIds, navigate])

  if (!ticketIds) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted">No hay ninguna compra en curso.</p>
        <Link to="/mis-entradas" className={LINK_CLASS}>
          Ver mis entradas
        </Link>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold text-navy">El pago no se completó</h1>
        <p className="text-muted">
          No se te cobró nada. Podés volver a intentar la compra.
        </p>
        <Link to="/" className={LINK_CLASS}>
          Ver próximos partidos
        </Link>
      </div>
    )
  }

  if (status === 'timeout') {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold text-navy">El pago está tardando</h1>
        <p className="text-muted">
          Cuando MercadoPago lo acredite, vas a ver tu entrada en «Mis
          entradas».
        </p>
        <Link to="/mis-entradas" className={LINK_CLASS}>
          Ver mis entradas
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <h1 className="text-2xl font-bold text-navy">Confirmando tu pago…</h1>
      <p className="text-muted">
        Esto puede tardar unos segundos. No cierres esta pestaña.
      </p>
    </div>
  )
}