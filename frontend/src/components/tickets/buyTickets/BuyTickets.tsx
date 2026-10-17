import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../../context/useAuth'

import Button from '../../shared/button/Button'
import { errorToast } from '../../../shared/notifications'
import { startPurchase } from './BuyTickets.server'
import { MAX_TICKETS_PER_MATCH, PENDING_PURCHASE_KEY } from './BuyTickets.const'

interface BuyTicketsProps {
  matchId: number
  soldOut: boolean
}

const QUANTITY_OPTIONS = Array.from(
  { length: MAX_TICKETS_PER_MATCH },
  (_, index) => index + 1,
)

export default function BuyTickets({ matchId, soldOut }: BuyTicketsProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (soldOut) {
    return (
      <Button variant="primary" disabled>
        Agotado
      </Button>
    )
  }

  const handleBuy = () => {
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }

    setIsSubmitting(true)

    startPurchase(matchId, quantity, {
      onSuccess: ({ ticketIds, checkoutUrl }) => {
        sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(ticketIds))
        window.location.href = checkoutUrl
      },
      onError: (error) => {
        errorToast(error.message)
        setIsSubmitting(false)
      },
    })
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="quantity" className="text-sm text-muted">
        Cantidad
      </label>
      <select
        id="quantity"
        value={quantity}
        onChange={(event) => setQuantity(Number(event.target.value))}
        disabled={isSubmitting}
        className="rounded-lg border border-slate-300 px-3 py-2"
      >
        {QUANTITY_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Button variant="primary" onClick={handleBuy} disabled={isSubmitting}>
        {isSubmitting ? 'Redirigiendo al pago…' : 'Comprar entrada'}
      </Button>
    </div>
  )
}