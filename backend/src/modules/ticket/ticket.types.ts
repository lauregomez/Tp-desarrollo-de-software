import { Prisma, Ticket, TicketStatus } from '@prisma/client';

export type { Ticket, TicketStatus };

// DTOs derivados de Prisma: si cambia el schema, rompe la compilación.
export type CreateTicketDto = Prisma.TicketUncheckedCreateInput;
export type UpdateTicketDto = Prisma.TicketUncheckedUpdateInput;

/**
 * Reglas de negocio centralizadas.
 * Se definen acá para que el service y el controller usen el mismo valor
 * y no queden números mágicos repetidos por el código.
 */
export const MAX_TICKETS_PER_USER_PER_MATCH = 5;
export const HOLD_MINUTES = 15;

/**
 * Intención de compra: no es una fila de la tabla tickets.
 * El service la traduce en N tickets independientes (N QR distintos).
 */
export type ReserveTicketDto = {
  userId: number;
  matchId: number;
  quantity: number;
};

export type TicketFilters = {
  userId?: number;
  matchId?: number;
  status?: TicketStatus;
};

/**
 * Motivos de fallo de la reserva.
 * El service no puede responder HTTP, así que devuelve un motivo tipado
 * y el controller lo traduce a un status code.
 */
export type ReserveFailureReason =
  | 'MATCH_NOT_FOUND'
  | 'MATCH_NOT_PUBLISHED'
  | 'MATCH_ALREADY_STARTED'
  | 'USER_LIMIT_EXCEEDED'
  | 'NOT_ENOUGH_CAPACITY';

/**
 * Union discriminada: TypeScript obliga a chequear `ok` antes de acceder
 * a `data`, así que es imposible olvidarse de manejar el caso de error.
 */
export type ServiceResult<T, R> =
  | { ok: true; data: T }
  | { ok: false; reason: R };
