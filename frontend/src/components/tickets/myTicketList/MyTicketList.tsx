import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router'
import MyTicketDetails from '../myTicketDetails/MyTicketDetails'
import MyTicketItem from '../myTicketItem/MyTicketItem'
import { errorToast } from '../../../shared/notifications'
import { getMyTickets } from './MyTicketList.server'
import type { Ticket } from '../../../types/ticket'

export default function MyTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carga inicial. El array de dependencias vacío hace que corra
  // una sola vez, al montar el componente.
  useEffect(() => {
    // Sin filtro de estado por ahora: traemos todas las entradas.
    getMyTickets('', {
      onSuccess: (data) => {
        setTickets(data)
        setIsLoading(false)
      },
      onError: (error) => {
        errorToast(error.message)
        setIsLoading(false)
      },
    })
  }, [])

  // Usamos el id del backend como key, nunca el índice del array.
  const ticketsMapped = tickets.map((ticket) => (
    <MyTicketItem key={ticket.id} ticket={ticket} />
  ))

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Mis entradas</h1>
      </header>

      <Routes>
        {/* <Route index> es la ruta por defecto del grupo: /mis-entradas exacto */}
        <Route
          index
          element={
            isLoading ? (
              <p className="text-muted">Cargando entradas…</p>
            ) : ticketsMapped.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ticketsMapped}
              </div>
            ) : (
              <p className="text-muted">Todavía no compraste entradas.</p>
            )
          }
        />
        {/* El path no empieza con "/" porque es relativo a /mis-entradas. */}
        <Route path=":id" element={<MyTicketDetails />} />
      </Routes>
    </div>
  )
}