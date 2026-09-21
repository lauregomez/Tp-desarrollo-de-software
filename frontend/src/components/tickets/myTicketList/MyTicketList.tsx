import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router'
import MyTicketDetails from '../myTicketDetails/MyTicketDetails'
import MyTicketItem from '../myTicketItem/MyTicketItem'
import { errorToast } from '../../../shared/notifications'
import { getMyTickets } from './MyTicketList.server'
import { TICKET_STATUS_LABEL } from '../../../types/ticket'
import type { Ticket, TicketStatus } from '../../../types/ticket'
import PageNotFound from '../../pageNotFound/PageNotFound'

export default function MyTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // '' representa "todas": es el valor de la opción por defecto del select.
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')

  // Carga inicial. El array de dependencias vacío hace que corra
  // una sola vez, al montar el componente.
  useEffect(() => {
    // Cada cambio de filtro vuelve a pedir la lista al backend, que ya
    // acepta ?status=. Por eso statusFilter está en las dependencias.
    setIsLoading(true)

    getMyTickets(statusFilter, {
      onSuccess: (data) => {
        setTickets(data)
        setIsLoading(false)
      },
      onError: (error) => {
        errorToast(error.message)
        setIsLoading(false)
      },
    })
  }, [statusFilter])

  // Usamos el id del backend como key, nunca el índice del array.
  const ticketsMapped = tickets.map((ticket) => (
    <MyTicketItem key={ticket.id} ticket={ticket} />
  ))

  return (
    <div>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Mis entradas</h1>

        <div className="flex items-center gap-2">
          <label htmlFor="status" className="text-sm text-muted">
            Estado
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as TicketStatus | '')
            }
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Todas</option>
            {/* Generamos las opciones desde TICKET_STATUS_LABEL: si el
               backend agrega un estado, aparece solo y con su texto. */}
            {Object.entries(TICKET_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
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

        {/* Captura sub-rutas inválidas (por ej. /mis-entradas/a/b). Sin esto
             se vería el encabezado con el cuerpo vacío: /mis-entradas/* ya
             delegó el resto a este Routes y el 404 de App.tsx no llega. */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  )
}