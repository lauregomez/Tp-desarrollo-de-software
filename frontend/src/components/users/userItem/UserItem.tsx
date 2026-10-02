import { useState } from 'react'
import Button from '../../shared/button/Button'
import ConfirmModal from '../../confirmModal/ConfirmModal'
import { ROLE_LABEL } from '../../../types/user'
import type { User } from '../../../types/user'

// Input properties: el usuario entra por props, UserItem no lo pide
// al servidor. Output properties: los callbacks avisan qué quiso hacer
// el usuario y UserList decide qué significa.
interface UserItemProps {
  user: User
  // Id del admin logueado, para distinguir su propia fila.
  currentUserId: number
  onEdit: (user: User) => void
  onDeactivate: (id: number) => void
  onActivate: (id: number) => void
}

export default function UserItem({
  user,
  currentUserId,
  onEdit,
  onDeactivate,
  onActivate,
}: UserItemProps) {
  // Estado local: el modal es efímero y vive acá para que cada fila
  // tenga el suyo, igual que en ClubItem.
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Un admin no puede darse de baja a sí mismo: quedaría sin sesión y,
  // si fuera el último, el sistema sin nadie que administre. El backend
  // lo valida igual; esconder el botón es sólo comodidad.
  const isSelf = user.id === currentUserId

  const handleConfirmDeactivate = () => {
    setConfirmOpen(false)
    onDeactivate(user.id)
  }

  return (
    // La fila de un usuario inactivo se atenúa para distinguirla de un
    // vistazo, sin sacarla de la lista: el admin tiene que poder
    // reactivarla.
    <tr className={`border-t border-slate-200 ${user.isActive ? '' : 'opacity-60'}`}>
      <td className="px-3 py-2">
        {user.lastName}, {user.name}
        {isSelf && <span className="ml-2 text-xs text-muted">(vos)</span>}
      </td>
      <td className="px-3 py-2">{user.email}</td>
      <td className="px-3 py-2">{ROLE_LABEL[user.role.name]}</td>
      <td className="px-3 py-2">{user.isActive ? 'Activo' : 'Inactivo'}</td>
      <td className="px-3 py-2">
        <div className="flex gap-2 whitespace-nowrap">
          <Button variant="secondary" size="sm" onClick={() => onEdit(user)}>
            Editar
          </Button>

          {!isSelf &&
            (user.isActive ? (
              // Este botón NO da de baja: abre el modal.
              <Button
                variant="warning"
                size="sm"
                onClick={() => setConfirmOpen(true)}
              >
                Desactivar
              </Button>
            ) : (
              // Reactivar no pide confirmación: es reversible y no
              // destruye nada.
              <Button
                variant="success"
                size="sm"
                onClick={() => onActivate(user.id)}
              >
                Reactivar
              </Button>
            ))}
        </div>

        <ConfirmModal
          open={confirmOpen}
          title="Desactivar usuario"
          message={`¿Querés desactivar a ${user.name} ${user.lastName}? No va a poder ingresar, pero se conserva su historial de entradas.`}
          confirmLabel="Desactivar"
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setConfirmOpen(false)}
        />
      </td>
    </tr>
  )
}