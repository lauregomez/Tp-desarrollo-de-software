import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router'
import PageNotFound from '../../pageNotFound/PageNotFound'
import CourtItem from '../courtItem/CourtItem'
import CourtDetails from '../courtDetails/CourtDetails'
import CourtForm from '../courtForm/CourtForm'
import Button from '../../shared/button/Button'
import EmptyState from '../../shared/emptyState/EmptyState'
import { successToast, errorToast } from '../../../shared/notifications'
import { getCourts, getClubs, createCourt, updateCourt, deleteCourt } from './CourtList.server'
import type { Court, CreateCourtDto } from '../../../types/court'
import type { Club } from '../../../types/club'

export default function CourtList() {
  const [courts, setCourts] = useState<Court[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getCourts({
      onSuccess: (data) => {
        setCourts(data)
        setIsLoading(false)
      },
      onError: (error) => {
        errorToast(error.message)
        setIsLoading(false)
      },
    })

    getClubs({
      onSuccess: (data) => setClubs(data),
      onError: (error) => errorToast(error.message),
    })
  }, [])

  const handleAddCourt = (court: CreateCourtDto) => {
    createCourt(court, {
      onSuccess: (created) => {
        setCourts((prev) => [created, ...prev])
        successToast(`¡Cancha ${created.name} creada correctamente!`)
        navigate('/canchas', { replace: true })
      },
      onError: (error) => errorToast(error.message),
    })
  }

  const handleUpdateCourt = (id: number, court: CreateCourtDto) => {
    updateCourt(id, court, {
      onSuccess: (updated) => {
        setCourts((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        )
        successToast(`¡Cancha ${updated.name} actualizada correctamente!`)
        navigate('/canchas', { replace: true })
      },
      onError: (error) => errorToast(error.message),
    })
  }

  const handleDeleteCourt = (id: number) => {
    deleteCourt(id, {
      onSuccess: (deletedId) => {
        setCourts((prev) => prev.filter((c) => c.id !== deletedId))
        successToast('¡Cancha eliminada correctamente!')
      },
      onError: (error) => errorToast(error.message),
    })
  }

  const handleEditCourt = (court: Court) => {
    navigate(`/canchas/editar/${court.id}`, { state: court })
  }

  const courtsMapped = courts.map((court) => {
    const club = clubs.find((c) => c.id === court.clubId)

    return (
      <CourtItem
        key={court.id}
        court={court}
        clubName={club?.name ?? 'Club desconocido'}
        onEdit={handleEditCourt}
        onDelete={handleDeleteCourt}
      />
    )
  })

  return (
    <div>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Canchas</h1>
        <Button variant="primary" onClick={() => navigate('/canchas/nuevo')}>
          Nueva cancha
        </Button>
      </header>

      <Routes>
        <Route
          index
          element={
            isLoading ? (
              <p className="text-muted">Cargando canchas…</p>
            ) : courtsMapped.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courtsMapped}
              </div>
            ) : (
              <EmptyState
                title="Todavía no hay canchas"
                message="Cargá la primera con el botón «Nueva cancha»."
              />
            )
          }
        />

        <Route
          path="nuevo"
          element={
            <CourtForm clubs={clubs} onAdd={handleAddCourt} onEdit={handleUpdateCourt} />
          }
        />

        <Route
          path="editar/:id"
          element={
            <CourtForm clubs={clubs} onAdd={handleAddCourt} onEdit={handleUpdateCourt} />
          }
        />

        <Route path=":id" element={<CourtDetails clubs={clubs} />} />

        <Route path="*" element={<PageNotFound />} />

      </Routes>
    </div>
  )
}