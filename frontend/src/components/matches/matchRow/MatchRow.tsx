import { useState } from 'react'
import Button from '../../shared/button/Button'
import ConfirmModal from '../../confirmModal/ConfirmModal'
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  ALLOWED_TRANSITIONS,
  TRANSITION_LABEL,
} from '../../../types/match'
import type { AdminMatch, MatchStatus } from '../../../types/match'
import {
  formatPrice,
  formatShortDate,
  formatTime,
  clubName,
} from '../../../lib/format'
import {
  CheckCircleIcon,
  FlagIcon,
  XCircleIcon,
  UndoIcon,
  PencilIcon,
  TrashIcon,
} from '../../shared/icons/icons'

interface MatchRowProps {
  match: AdminMatch
  onEdit: (match: AdminMatch) => void
  onDelete: (id: number) => void
  onChangeStatus: (id: number, status: MatchStatus) => void
}

const TRANSITION_ICON = {
  DRAFT: UndoIcon,
  PUBLISHED: CheckCircleIcon,
  FINISHED: FlagIcon,
  CANCELLED: XCircleIcon,
}

const TRANSITION_VARIANT = {
  DRAFT: 'secondary',
  PUBLISHED: 'primary',
  FINISHED: 'success',
  CANCELLED: 'warning',
} as const

export default function MatchRow({
  match,
  onEdit,
  onDelete,
  onChangeStatus,
}: MatchRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirmDelete = () => {
    setConfirmOpen(false)
    onDelete(match.id)
  }

  const canEdit = match.status === 'DRAFT' || match.status === 'PUBLISHED'
  const canDelete = match.status === 'DRAFT' && match.sold === 0

  return (
    <tr className="border-t border-slate-200">
      <td className="px-3 py-2">
        {formatShortDate(match.startsAt)} · {formatTime(match.startsAt)} hs
      </td>
      <td className="px-3 py-2">
        {clubName(match.homeClub)} vs {clubName(match.awayClub)}
      </td>
      <td className="px-3 py-2">{CATEGORY_LABEL[match.category]}</td>
      <td className="px-3 py-2">{STATUS_LABEL[match.status]}</td>
      <td className="px-3 py-2">
        {match.sold}/{match.capacity}
      </td>
      <td className="px-3 py-2">{formatPrice(match.price)}</td>
      <td className="px-3 py-2">
        <div className="flex gap-2 whitespace-nowrap">
          {ALLOWED_TRANSITIONS[match.status].map((next) => {
            const Icon = TRANSITION_ICON[next]
            return (
              <Button
                key={next}
                variant={TRANSITION_VARIANT[next]}
                size="icon"
                onClick={() => onChangeStatus(match.id, next)}
                title={TRANSITION_LABEL[next]}
                aria-label={TRANSITION_LABEL[next]}
              >
                <Icon />
              </Button>
            )
          })}

          {canEdit && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onEdit(match)}
              title="Editar"
              aria-label="Editar partido"
            >
              <PencilIcon />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="danger"
              size="icon"
              onClick={() => setConfirmOpen(true)}
              title="Eliminar"
              aria-label="Eliminar partido"
            >
              <TrashIcon />
            </Button>
          )}
        </div>

        <ConfirmModal
          open={confirmOpen}
          title="Eliminar partido"
          message={`¿Estás seguro de que querés eliminar "${clubName(match.homeClub)} vs ${clubName(match.awayClub)}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </td>
    </tr>
  )
}