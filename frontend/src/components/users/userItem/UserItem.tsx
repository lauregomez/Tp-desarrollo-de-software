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
  onDelete: (id: number) => void
}

export default function UserItem({
  user,
  currentUserId,
  onEdit,
  onDelete,
}: UserItemProps) {
  // Estado local: el modal es efímero y vive acá para que cada fila
  // tenga el suyo, igual que en ClubItem.
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Un admin no puede eliminarse a sí mismo: quedaría sin sesión y,
  // si fuera el último, el sistema sin nadie que administre.
  // El backend no lo valida, así que el control vive acá.
  const isSelf = user.id === currentUserId

  const handleConfirmDelete = () => {
    setConfirmOpen(false)
    onDelete(user.id)
  }

  return (
    <tr className="border-t border-slate-200">
      <td className="px-3 py-2">
        {user.lastName}, {user.name}
        {isSelf && <span className="ml-2 text-xs text-muted">(vos)</span>}
      </td>
      <td className="px-3 py-2">{user.email}</td>
      <td className="px-3 py-2">{ROLE_LABEL[user.roleId] ?? user.roleId}</td>
      <td className="px-3 py-2">
        <div className="flex gap-2 whitespace-nowrap">
          <Button variant="secondary" size="sm" onClick={() => onEdit(user)}>
            Editar
          </Button>

          {/* Este botón NO borra: abre el modal. */}
          {!isSelf && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmOpen(true)}
            >
              Eliminar
            </Button>
          )}
        </div>

        <ConfirmModal
          open={confirmOpen}
          title="Eliminar usuario"
          message={`¿Estás seguro de que querés eliminar a ${user.name} ${user.lastName}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </td>
    </tr>
  )
}