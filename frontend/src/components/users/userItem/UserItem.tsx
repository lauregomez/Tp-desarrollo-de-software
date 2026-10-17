import { useState } from 'react'
import Button from '../../shared/button/Button'
import ConfirmModal from '../../confirmModal/ConfirmModal'
import { ROLE_LABEL } from '../../../types/user'
import type { User } from '../../../types/user'

interface UserItemProps {
  user: User
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
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isSelf = user.id === currentUserId

  const handleConfirmDeactivate = () => {
    setConfirmOpen(false)
    onDeactivate(user.id)
  }

  return (
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
              <Button
                variant="warning"
                size="sm"
                onClick={() => setConfirmOpen(true)}
              >
                Desactivar
              </Button>
            ) : (
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