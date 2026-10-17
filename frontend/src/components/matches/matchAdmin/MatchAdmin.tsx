import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router'
import MatchRow from '../matchRow/MatchRow'
import MatchForm from '../matchForm/MatchForm'
import MatchFilters from '../matchFilters/MatchFilters'
import PageNotFound from '../../pageNotFound/PageNotFound'
import Button from '../../shared/button/Button'
import EmptyState from '../../shared/emptyState/EmptyState'
import { successToast, errorToast } from '../../../shared/notifications'
import { getAdminMatches, deleteMatch, changeMatchStatus } from './MatchAdmin.server'
import { createMatch, updateMatch } from '../matchForm/MatchForm.server'
import type { AdminMatch, CreateMatchDto, MatchStatus, MatchFilterValues } from '../../../types/match'




export default function MatchAdmin() {
  const [matches, setMatches] = useState<AdminMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<MatchFilterValues>({ statuses: ['PUBLISHED'] })
  const navigate = useNavigate()

  useEffect(() => {
    let ignore = false
    setIsLoading(true)

    getAdminMatches(filters, {
      onSuccess: (data) => {
        if (ignore) return
        setMatches(data)
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
  }, [filters])

    const handleAdd = (match: CreateMatchDto, onFinish: () => void) => {
    createMatch(match, {
      onSuccess: (created) => {
        setMatches((prev) => [created, ...prev])
        successToast('¡Partido creado correctamente!')
        navigate('/admin/partidos', { replace: true })
      },
      onError: (error) => {
        errorToast(error.message)
        onFinish()
      },
    })
  }

    const handleUpdate = (id: number, match: CreateMatchDto, onFinish: () => void) => {
    updateMatch(id, match, {
      onSuccess: (updated) => {
        setMatches((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m)),
        )
        successToast('¡Partido actualizado correctamente!')
        navigate('/admin/partidos', { replace: true })
      },
      onError: (error) => {
        errorToast(error.message)
        onFinish()
      },
    })
  }

  const handleDelete = (id: number) => {
    deleteMatch(id, {
      onSuccess: (deletedId) => {
        setMatches((prev) => prev.filter((m) => m.id !== deletedId))
        successToast('¡Partido eliminado correctamente!')
      },
      onError: (error) => errorToast(error.message),
    })
  }

  const handleChangeStatus = (id: number, status: MatchStatus) => {
    changeMatchStatus(id, status, {
      onSuccess: (updated) => {
        setMatches((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m)),
        )
        successToast('¡Estado actualizado correctamente!')
      },
      onError: (error) => errorToast(error.message),
    })
  }

  const handleEdit = (match: AdminMatch) => {
    navigate(`/admin/partidos/editar/${match.id}`, { state: match })
  }

  const rows = matches.map((match) => (
    <MatchRow
      key={match.id}
      match={match}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onChangeStatus={handleChangeStatus}
    />
  ))

  return (
    <div>
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
            <>
              <MatchFilters filters={filters} onChange={setFilters} showStatus />

              {isLoading && matches.length === 0 ? (
                <p className="text-muted">Cargando partidos…</p>
              ) : rows.length > 0 ? (
                <div
                  className={`overflow-x-auto rounded-xl border border-slate-200 bg-white transition-opacity ${
                    isLoading ? 'opacity-50' : ''
                  }`}
                >
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
                <EmptyState
                  title="No hay partidos con esos filtros"
                  message="Probá con otro estado, club, cancha o búsqueda."
                />
              )}
            </>
          }
        />

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