import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router'

import ClubItem from '../clubItem/ClubItem'
import ClubForm from '../clubForm/ClubForm'
import ClubDetails from '../clubDetails/ClubDetails'
import PageNotFound from '../../pageNotFound/PageNotFound'
import Button from '../../shared/button/Button'
import { successToast, errorToast } from '../../../shared/notifications'
import { getClubs, createClub, updateClub, deleteClub } from './ClubList.server'
import type { Club, CreateClubDto } from '../../../types/club'

export default function ClubList() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Carga inicial. El array de dependencias vacío hace que corra
  // una sola vez, al montar el componente.
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
      // Actualizamos el array local con lo que devolvió el servidor
      // en vez de volver a pedir la lista entera: una request menos.
      onSuccess: (created) => {
        setClubs((prev) => [created, ...prev])
        successToast(`¡Club ${created.name} creado correctamente!`)
        // Navegamos acá y no en el formulario: recién ahora sabemos
        // que el guardado salió bien.
        navigate('/clubes', { replace: true })
      },
      // error.message viene del backend (por ej. el 409 de nombre duplicado).
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
      // El 204 no devuelve cuerpo: el .server.ts nos pasa el id
      // que le dimos, y con eso filtramos la lista.
      onSuccess: (deletedId) => {
        setClubs((prev) => prev.filter((c) => c.id !== deletedId))
        successToast('¡Club eliminado correctamente!')
      },
      // Acá cae el 409 si el club tiene canchas o partidos asociados.
      onError: (error) => errorToast(error.message),
    })
  }

  // Navegamos llevando el club en el state para que el formulario
  // se precargue sin pedirlo de nuevo al servidor.
  const handleEditClub = (club: Club) => {
    navigate(`/clubes/editar/${club.id}`, { state: club })
  }

  // Usamos el id del backend como key, nunca el índice del array:
  // si se borra un club del medio, los índices se corren y React
  // podría reutilizar el nodo equivocado.
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
      {/* El header está FUERA del <Routes>: se ve en las cuatro
          sub-rutas y actúa como layout de la sección. */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Clubes</h1>
        <Button variant="primary" onClick={() => navigate('/clubes/nuevo')}>
          Nuevo club
        </Button>
      </header>

      <Routes>
        {/* <Route index> es la ruta por defecto del grupo: /clubes exacto */}
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
              <p className="text-muted">Todavía no hay clubes cargados.</p>
            )
          }
        />

        {/* Los path no empiezan con "/" porque son relativos a /clubes.
            "nuevo" y "editar/:id" renderizan el MISMO componente: el
            formulario decide solo en qué modo está. */}
        <Route
          path="nuevo"
          element={<ClubForm onAdd={handleAddClub} onEdit={handleUpdateClub} />}
        />
        <Route
          path="editar/:id"
          element={<ClubForm onAdd={handleAddClub} onEdit={handleUpdateClub} />}
        />
        <Route path=":id" element={<ClubDetails />} />

        {/* Captura sub-rutas inválidas de /clubes (por ej. /clubes/a/b).
            Sin esto se vería el header con el cuerpo vacío. */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  )
}