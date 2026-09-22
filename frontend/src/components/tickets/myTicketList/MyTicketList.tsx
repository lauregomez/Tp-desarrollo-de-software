import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router'

import MyTicketDetails from '../myTicketDetails/MyTicketDetails'
import MyTicketItem from '../myTicketItem/MyTicketItem'
import PageNotFound from '../../pageNotFound/PageNotFound'
import { errorToast } from '../../../shared/notifications'
import { getMyTickets } from './MyTicketList.server'
import { TICKET_STATUS_LABEL } from '../../../types/ticket'
import type { Ticket, TicketStatus } from '../../../types/ticket'

export default function MyTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // '' representa "todas": es el valor de la opción por defecto del select.
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')

  // Corre al montar y cada vez que cambia el filtro: el backend ya acepta
  // ?status=, así que cada cambio vuelve a pedir la lista filtrada.
  useEffect(() => {
    // Si el filtro cambia antes de que llegue la respuesta, React ejecuta el
    // cleanup de abajo y marca esta request como vieja. Sin esto, una
    // respuesta lenta podría llegar después de la nueva y pisarla, dejando
    // una lista que no corresponde al filtro elegido.
    let ignore = false
    setIsLoading(true)

    getMyTickets(statusFilter, {
      onSuccess: (data) => {
        if (ignore) return
        setTickets(data)
        setIsLoading(false)
      },
      onError: (error) => {
        if (ignore) return
        errorToast(error.message)
        setIsLoading(false)
      },
    })

    return () => {
      ignore = true
    }
  }, [statusFilter])

  // Usamos el id del backend como key, nunca el índice del array.
  const ticketsMapped = tickets.map((ticket) => (
    <MyTicketItem key={ticket.id} ticket={ticket} />
  ))

  // El filtro es parte del listado y no del header: si estuviera en el
  // header se vería también en el detalle, donde no afecta lo que se muestra.
  const listView = (
    <>
      <div className="mb-4 flex items-center justify-end gap-2">
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

      {isLoading ? (
        <p className="text-muted">Cargando entradas…</p>
      ) : ticketsMapped.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ticketsMapped}
        </div>
      ) : (
        <p className="text-muted">No hay entradas para mostrar.</p>
      )}
    </>
  )

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Mis entradas</h1>
      </header>

      <Routes>
        {/* <Route index> es la ruta por defecto del grupo: /mis-entradas exacto */}
        <Route index element={listView} />

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