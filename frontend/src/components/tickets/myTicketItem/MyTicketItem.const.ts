import type { TicketDisplayStatus } from '../../../types/ticket'

export const STATUS_CLASS: Record<TicketDisplayStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  USED: 'bg-slate-200 text-slate-600',
  EXPIRED: 'bg-slate-100 text-muted',
}