import { useEffect } from 'react'
import { Link } from 'react-router'

import { PENDING_PURCHASE_KEY } from '../../tickets/buyTickets/BuyTickets.const'

export default function PaymentError() {
  // La compra terminó (mal): los ids guardados ya no sirven. Si quedaran,
  // entrar después a /pago/confirmando intentaría consultar una compra
  // que no va a acreditarse nunca.
  useEffect(() => {
    sessionStorage.removeItem(PENDING_PURCHASE_KEY)
  }, [])

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold text-navy">No se pudo completar el pago</h1>
      <p className="text-muted">
        No se te cobró nada. Podés volver a intentar la compra desde el
        partido.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110"
      >
        Ver próximos partidos
      </Link>
    </div>
  )
}