import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router'

import CourtItem from '../courtItem/CourtItem'
import CourtDetails from '../courtDetails/CourtDetails'
import CourtForm from '../courtForm/CourtForm'
import Button from '../../shared/button/Button'
import { successToast, errorToast } from '../../../shared/notifications'
import { getCourts, getClubs, createCourt } from './CourtList.server'
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
              <p className="text-muted">Todavía no hay canchas cargadas.</p>
            )
          }
        />

        {/* "nuevo" es un path fijo: React Router lo prioriza sobre ":id",
            así /canchas/nuevo no se interpreta como una cancha con id "nuevo". */}
        <Route
          path="nuevo"
          element={<CourtForm clubs={clubs} onAdd={handleAddCourt} />}
        />

        {/* El path no empieza con "/" porque es relativo a /canchas.
            Le pasamos los clubes que ya cargamos para resolver el nombre del dueño. */}
        <Route path=":id" element={<CourtDetails clubs={clubs} />} />
      </Routes>
    </div>
  )
}