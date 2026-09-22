import type { TicketStatus } from '../../../types/ticket'

// Clases de Tailwind del badge de estado: un color por estado, para que se
// distingan de un vistazo. Usa la paleta default de Tailwind porque el
// proyecto no tiene tokens para estos tres estados; queda pendiente acordar
// con el equipo si se agregan tokens o se deja documentada la excepción.
export const STATUS_CLASS: Record<TicketStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  USED: 'bg-slate-200 text-slate-600',
}