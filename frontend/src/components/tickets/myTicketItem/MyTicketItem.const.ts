import type { TicketDisplayStatus } from '../../../types/ticket'

// Clases de Tailwind del badge de estado: un color por estado, para que se
// distingan de un vistazo. Usa la paleta default de Tailwind porque el
// proyecto no tiene tokens para estos estados; queda pendiente acordar
// con el equipo si se agregan tokens o se deja documentada la excepción.
// EXPIRED sí usa el token muted: una entrada vencida ya no sirve y va apagada.
export const STATUS_CLASS: Record<TicketDisplayStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  USED: 'bg-slate-200 text-slate-600',
  EXPIRED: 'bg-slate-100 text-muted',
}