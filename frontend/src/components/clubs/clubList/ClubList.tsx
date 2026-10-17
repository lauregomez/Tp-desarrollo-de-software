import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router'

import ClubItem from '../clubItem/ClubItem'
import ClubForm from '../clubForm/ClubForm'
import ClubDetails from '../clubDetails/ClubDetails'
import PageNotFound from '../../pageNotFound/PageNotFound'
import Button from '../../shared/button/Button'
import EmptyState from '../../shared/emptyState/EmptyState'
import { successToast, errorToast } from '../../../shared/notifications'
import { getClubs, createClub, updateClub, deleteClub } from './ClubList.server'
import type { Club, CreateClubDto } from '../../../types/club'

export default function ClubList() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getClubs({
      onSuccess: (data) => {
        setClubs(data)
        setIsLoading(false)
      },
      onError: (error) => {
        errorToast(error.message)
        setIsLoading(false)
      },
    })
  }, [])

  const handleAddClub = (club: CreateClubDto) => {
    createClub(club, {
      onSuccess: (created) => {
        setClubs((prev) => [created, ...prev])
        successToast(`¡Club ${created.name} creado correctamente!`)
        navigate('/clubes', { replace: true })
      },
      onError: (error) => errorToast(error.message),
    })
  }

  const handleUpdateClub = (id: number, club: CreateClubDto) => {
    updateClub(id, club, {
      onSuccess: (updated) => {
        setClubs((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        )
        successToast(`¡Club ${updated.name} actualizado correctamente!`)
        navigate('/clubes', { replace: true })
      },
      onError: (error) => errorToast(error.message),
    })
  }

  const handleDeleteClub = (id: number) => {
    deleteClub(id, {
      onSuccess: (deletedId) => {
        setClubs((prev) => prev.filter((c) => c.id !== deletedId))
        successToast('¡Club eliminado correctamente!')
      },
      onError: (error) => errorToast(error.message),
    })
  }

  const handleEditClub = (club: Club) => {
    navigate(`/clubes/editar/${club.id}`, { state: club })
  }

  const clubsMapped = clubs.map((club) => (
    <ClubItem
      key={club.id}
      club={club}
      onEdit={handleEditClub}
      onDelete={handleDeleteClub}
    />
  ))

  return (
    <div>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Clubes</h1>
        <Button variant="primary" onClick={() => navigate('/clubes/nuevo')}>
          Nuevo club
        </Button>
      </header>

      <Routes>
        <Route
          index
          element={
            isLoading ? (
              <p className="text-muted">Cargando clubes…</p>
            ) : clubsMapped.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {clubsMapped}
              </div>
            ) : (
              <EmptyState
                title="Todavía no hay clubes"
                message="Cargá el primero con el botón «Nuevo club»."
              />
            )
          }
        />

        <Route
          path="nuevo"
          element={<ClubForm onAdd={handleAddClub} onEdit={handleUpdateClub} />}
        />
        <Route
          path="editar/:id"
          element={<ClubForm onAdd={handleAddClub} onEdit={handleUpdateClub} />}
        />
        <Route path=":id" element={<ClubDetails />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  )
}