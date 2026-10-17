import { useEffect, useState } from 'react'
import { Link, Routes, Route } from 'react-router'

import MyTicketDetails from '../myTicketDetails/MyTicketDetails'
import MyTicketItem from '../myTicketItem/MyTicketItem'
import PageNotFound from '../../pageNotFound/PageNotFound'
import { errorToast } from '../../../shared/notifications'
import { getMyTickets } from './MyTicketList.server'
import { MY_TICKET_FILTERS, TICKET_STATUS_LABEL } from '../../../types/ticket'
import type { Ticket, TicketDisplayStatus } from '../../../types/ticket'
import Button from '../../shared/button/Button'
import EmptyState from '../../shared/emptyState/EmptyState'

export default function MyTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<TicketDisplayStatus | ''>('')

  useEffect(() => {
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

  const ticketsMapped = tickets.map((ticket) => (
    <MyTicketItem key={ticket.id} ticket={ticket} />
  ))

  const emptyView =
    statusFilter === '' ? (
      <EmptyState
        title="Todavía no tenés entradas"
        message="Cuando compres una entrada, la vas a ver acá."
        action={
          <Link
            to="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            Ver próximos partidos
          </Link>
        }
      />
    ) : (
      <EmptyState
        title="No hay entradas con este estado"
        message={`Ninguna de tus entradas está en «${TICKET_STATUS_LABEL[statusFilter]}».`}
        action={
          <Button variant="secondary" size="sm" onClick={() => setStatusFilter('')}>
            Ver todas
          </Button>
        }
      />
    )

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
            setStatusFilter(event.target.value as TicketDisplayStatus | '')
          }
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Todas</option>
          {MY_TICKET_FILTERS.map((value) => (
            <option key={value} value={value}>
              {TICKET_STATUS_LABEL[value]}
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
        emptyView
      )}
    </>
  )

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Mis entradas</h1>
      </header>

      <Routes>
        <Route index element={listView} />

        <Route path=":id" element={<MyTicketDetails />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  )
}