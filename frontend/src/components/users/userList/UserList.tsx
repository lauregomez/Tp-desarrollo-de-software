import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router'

import UserItem from '../userItem/UserItem'
import UserForm from '../userForm/UserForm'
import PageNotFound from '../../pageNotFound/PageNotFound'
import Button from '../../shared/button/Button'
import EmptyState from '../../shared/emptyState/EmptyState'
import { successToast, errorToast } from '../../../shared/notifications'
import { useAuth } from '../../../context/useAuth'
import { getUsers, createUser, updateUser, deleteUser } from './UserList.server'
import { ROLE_ADMIN } from '../../../types/user'
import type { User, CreateUserDto } from '../../../types/user'

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  useEffect(() => {
    getUsers({
      onSuccess: (data) => {
        setUsers(data)
        setIsLoading(false)
      },
      onError: (error) => {
        errorToast(error.message)
        setIsLoading(false)
      },
    })
  }, [])

  const handleAdd = (user: CreateUserDto, onFinish: () => void) => {
    createUser(user, {
      // Actualizamos el array local con lo que devolvió el servidor
      // en vez de volver a pedir la lista entera: una request menos.
      onSuccess: (created) => {
        setUsers((prev) => [created, ...prev])
        successToast(`¡Usuario ${created.name} creado correctamente!`)
        navigate('/admin/usuarios', { replace: true })
      },
      // Acá cae el 409 por email duplicado.
      onError: (error) => {
        errorToast(error.message)
        onFinish()
      },
    })
  }

  const handleUpdate = (
    id: number,
    user: CreateUserDto,
    onFinish: () => void,
  ) => {
    // Un admin no puede quitarse a sí mismo el rol de admin: perdería
    // el acceso al panel en el que está parado.
    if (id === currentUser?.id && user.roleId !== ROLE_ADMIN) {
      errorToast('No podés quitarte a vos mismo el rol de administrador')
      onFinish()
      return
    }

    updateUser(id, user, {
      onSuccess: (updated) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u)),
        )
        successToast('¡Usuario actualizado correctamente!')
        navigate('/admin/usuarios', { replace: true })
      },
      onError: (error) => {
        errorToast(error.message)
        onFinish()
      },
    })
  }

  const handleDelete = (id: number) => {
    deleteUser(id, {
      onSuccess: (deletedId) => {
        setUsers((prev) => prev.filter((u) => u.id !== deletedId))
        successToast('¡Usuario eliminado correctamente!')
      },
      // El backend responde 409 si el usuario tiene entradas asociadas.
      onError: (error) => errorToast(error.message),
    })
  }

  // Navegamos llevando el usuario en el state para que el formulario
  // se precargue sin pedirlo de nuevo al servidor.
  const handleEdit = (user: User) => {
    navigate(`/admin/usuarios/editar/${user.id}`, { state: user })
  }

  const rows = users.map((user) => (
    <UserItem
      key={user.id}
      user={user}
      currentUserId={currentUser?.id ?? 0}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ))

  return (
    <div>
      {/* El header está FUERA del <Routes>: se ve en las tres
          sub-rutas y actúa como layout de la sección. */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Usuarios</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/usuarios/nuevo')}
        >
          Nuevo usuario
        </Button>
      </header>

      <Routes>
        <Route
          index
          element={
            isLoading ? (
              <p className="text-muted">Cargando usuarios…</p>
            ) : rows.length > 0 ? (
              // overflow-x-auto: en mobile la tabla scrollea sola
              // en vez de romper el ancho de la página.
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-muted">
                    <tr>
                      <th className="px-3 py-2">Nombre</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Rol</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Todavía no hay usuarios"
                message="Creá el primero para empezar a gestionar el acceso al sistema."
              />
            )
          }
        />

        {/* "nuevo" y "editar/:id" renderizan el MISMO componente:
            el formulario decide solo en qué modo está. */}
        <Route
          path="nuevo"
          element={<UserForm onAdd={handleAdd} onEdit={handleUpdate} />}
        />
        <Route
          path="editar/:id"
          element={<UserForm onAdd={handleAdd} onEdit={handleUpdate} />}
        />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  )
}