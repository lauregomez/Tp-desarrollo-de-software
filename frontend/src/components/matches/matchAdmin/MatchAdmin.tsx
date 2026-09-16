import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router'

import MatchForm from '../matchForm/MatchForm'
import PageNotFound from '../../pageNotFound/PageNotFound'
import Button from '../../shared/button/Button'
import { successToast, errorToast } from '../../../shared/notifications'
import { getAdminMatches, deleteMatch } from './MatchAdmin.server'
import { createMatch, updateMatch } from '../matchForm/MatchForm.server'
import { CATEGORY_LABEL } from '../../../types/match'
import type { AdminMatch, CreateMatchDto } from '../../../types/match'
import { formatPrice, formatShortDate, formatTime } from '../../../lib/format'

export default function MatchAdmin() {
  const [matches, setMatches] = useState<AdminMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getAdminMatches({
      onSuccess: (data) => {
        setMatches(data)
        setIsLoading(false)
      },
      onError: (error) => {
        errorToast(error.message)
        setIsLoading(false)
      },
    })
  }, [])

  const handleAdd = (match: CreateMatchDto) => {
    createMatch(match, {
      // Actualizamos el array local con lo que devolvió el servidor
      // en vez de volver a pedir la lista entera: una request menos.
      onSuccess: (created) => {
        setMatches((prev) => [created, ...prev])
        successToast('¡Partido creado correctamente!')
        navigate('/admin/partidos', { replace: true })
      },
      // Acá caen los 400 de validación y los 409 de conflicto
      // de cancha, con el message que arma el backend.
      onError: (error) => errorToast(error.message),
    })
  }

  const handleUpdate = (id: number, match: CreateMatchDto) => {
    updateMatch(id, match, {
      onSuccess: (updated) => {
        setMatches((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m)),
        )
        successToast('¡Partido actualizado correctamente!')
        navigate('/admin/partidos', { replace: true })
      },
      onError: (error) => errorToast(error.message),
    })
  }

  const handleDelete = (id: number) => {
    deleteMatch(id, {
      onSuccess: (deletedId) => {
        setMatches((prev) => prev.filter((m) => m.id !== deletedId))
        successToast('¡Partido eliminado correctamente!')
      },
      // El backend sólo deja borrar partidos en DRAFT y sin entradas:
      // si no, responde 409 con el motivo.
      onError: (error) => errorToast(error.message),
    })
  }

  // Navegamos llevando el partido en el state para que el formulario
  // se precargue sin pedirlo de nuevo al servidor.
  const handleEdit = (match: AdminMatch) => {
    navigate(`/admin/partidos/editar/${match.id}`, { state: match })
  }

  const rows = matches.map((match) => (
    <tr key={match.id} className="border-t border-slate-200">
      <td className="px-3 py-2">
        {formatShortDate(match.startsAt)} · {formatTime(match.startsAt)} hs
      </td>
      <td className="px-3 py-2">
        {match.homeClub.name} vs {match.awayClub.name}
      </td>
      <td className="px-3 py-2">{CATEGORY_LABEL[match.category]}</td>
      <td className="px-3 py-2">{match.status}</td>
      <td className="px-3 py-2">
        {match.sold}/{match.capacity}
      </td>
      <td className="px-3 py-2">{formatPrice(match.price)}</td>
      <td className="flex gap-2 px-3 py-2">
        <Button variant="secondary" onClick={() => handleEdit(match)}>
          Editar
        </Button>
        <Button variant="secondary" onClick={() => handleDelete(match.id)}>
          Eliminar
        </Button>
      </td>
    </tr>
  ))

  return (
    <div>
      {/* El header está FUERA del <Routes>: se ve en las tres
          sub-rutas y actúa como layout de la sección. */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Partidos</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/partidos/nuevo')}
        >
          Nuevo partido
        </Button>
      </header>

      <Routes>
        <Route
          index
          element={
            isLoading ? (
              <p className="text-muted">Cargando partidos…</p>
            ) : rows.length > 0 ? (
              // overflow-x-auto: en mobile la tabla scrollea sola
              // en vez de romper el ancho de la página.
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-muted">
                    <tr>
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2">Partido</th>
                      <th className="px-3 py-2">Categoría</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Vendidas</th>
                      <th className="px-3 py-2">Precio</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">Todavía no hay partidos cargados.</p>
            )
          }
        />

        {/* "nuevo" y "editar/:id" renderizan el MISMO componente:
            el formulario decide solo en qué modo está. */}
        <Route
          path="nuevo"
          element={<MatchForm onAdd={handleAdd} onEdit={handleUpdate} />}
        />
        <Route
          path="editar/:id"
          element={<MatchForm onAdd={handleAdd} onEdit={handleUpdate} />}
        />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  )
}