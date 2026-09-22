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

  // Carga inicial. El array de dependencias vacío hace que corra
  // una sola vez, al montar el componente.
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

    // Los clubes se piden una sola vez acá para resolver el nombre del
    // dueño de cada cancha, en vez de que cada tarjeta haga su propia request.
    getClubs({
      onSuccess: (data) => setClubs(data),
      onError: (error) => errorToast(error.message),
    })
  }, [])

  const handleAddCourt = (court: CreateCourtDto) => {
    createCourt(court, {
      // Agregamos al array local lo que devolvió el servidor (ya con su id)
      // en vez de volver a pedir la lista entera: una request menos.
      onSuccess: (created) => {
        setCourts((prev) => [created, ...prev])
        successToast(`¡Cancha ${created.name} creada correctamente!`)
        // Navegamos acá y no en el formulario: recién ahora sabemos
        // que el guardado salió bien.
        navigate('/canchas', { replace: true })
      },
      // error.message viene del backend (por ej. el 409 si el club
      // ya tiene una cancha con ese nombre). El usuario sigue en el form.
      onError: (error) => errorToast(error.message),
    })
  }

  const handleUpdateCourt = (id: number, court: CreateCourtDto) => {
    updateCourt(id, court, {
      // Reemplazamos sólo la cancha editada en el array local,
      // en vez de volver a pedir la lista entera.
      onSuccess: (updated) => {
        setCourts((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        )
        successToast(`¡Cancha ${updated.name} actualizada correctamente!`)
        navigate('/canchas', { replace: true })
      },
      // Por ej. el 409 si el club ya tiene otra cancha con ese nombre.
      onError: (error) => errorToast(error.message),
    })
  }

  const handleDeleteCourt = (id: number) => {
    deleteCourt(id, {
      // El 204 no devuelve cuerpo: el .server.ts nos pasa el id
      // que le dimos, y con eso filtramos la lista.
      onSuccess: (deletedId) => {
        setCourts((prev) => prev.filter((c) => c.id !== deletedId))
        successToast('¡Cancha eliminada correctamente!')
      },
      // Acá cae el error si la cancha tiene partidos asociados.
      onError: (error) => errorToast(error.message),
    })
  }

  // Navegamos llevando la cancha en el state para que el formulario
  // se precargue sin pedirla de nuevo al servidor.
  const handleEditCourt = (court: Court) => {
    navigate(`/canchas/editar/${court.id}`, { state: court })
  }

  // Usamos el id del backend como key, nunca el índice del array:
  // si se borra una cancha del medio, los índices se corren y React
  // podría reutilizar el nodo equivocado.
  const courtsMapped = courts.map((court) => {
    const club = clubs.find((c) => c.id === court.clubId)

    return (
      <CourtItem
        key={court.id}
        court={court}
        // Si los clubes todavía no llegaron (o falló el pedido), find
        // devuelve undefined: mostramos un texto en vez de romper la pantalla.
        clubName={club?.name ?? 'Club desconocido'}
        onEdit={handleEditCourt}
        onDelete={handleDeleteCourt}
      />
    )
  })

  return (
    <div>
      {/* El header está fuera del <Routes>: se ve en todas las sub-rutas. */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Canchas</h1>
        <Button variant="primary" onClick={() => navigate('/canchas/nuevo')}>
          Nueva cancha
        </Button>
      </header>

      <Routes>
        {/* <Route index> es la ruta por defecto del grupo: /canchas exacto */}
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

        {/* "nuevo" es un path fijo: React Router lo prioriza sobre ":id",
            así /canchas/nuevo no se interpreta como una cancha con id "nuevo". */}
        <Route
          path="nuevo"
          element={
            <CourtForm clubs={clubs} onAdd={handleAddCourt} onEdit={handleUpdateCourt} />
          }
        />

        {/* "nuevo" y "editar/:id" renderizan el MISMO componente:
            el formulario decide solo en qué modo está según haya :id. */}
        <Route
          path="editar/:id"
          element={
            <CourtForm clubs={clubs} onAdd={handleAddCourt} onEdit={handleUpdateCourt} />
          }
        />

        {/* El path no empieza con "/" porque es relativo a /canchas.
            Le pasamos los clubes que ya cargamos para resolver el nombre del dueño. */}
        <Route path=":id" element={<CourtDetails clubs={clubs} />} />

        {/* Captura sub-rutas inválidas de /canchas (por ej. /canchas/a/b).
        Sin esto se vería el header con el cuerpo vacío, porque el 404 de
         App.tsx no llega: /canchas/* ya delegó el resto a este Routes. */}
        <Route path="*" element={<PageNotFound />} />

      </Routes>
    </div>
  )
}